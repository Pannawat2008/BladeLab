//! Integration tests for `T-204` (`PostgreSQL persistence: designs, versioning`).

use axum::body::{to_bytes, Body};
use axum::http::{header, Method, Request, StatusCode};
use blade_model::Design;
use blade_server::{
    build_router, AppState, DesignRecord, DesignSummary, DesignVersionRecord, POSTGRES_SCHEMA_SQL,
};
use tower::ServiceExt;

const LINEAR_FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");
const SCHMITZ_FIXTURE: &str = include_str!("../../../fixtures/naca4412-schmitz.json");

#[tokio::test]
async fn full_crud_and_version_tracking_lifecycle() {
    assert!(POSTGRES_SCHEMA_SQL.contains("CREATE TABLE IF NOT EXISTS designs"));
    assert!(POSTGRES_SCHEMA_SQL.contains("CREATE TABLE IF NOT EXISTS design_versions"));

    let state = AppState::new();
    let app = build_router(state);

    // 1. Create design (v1) -> 201 Created
    let create_payload = serde_json::json!({
        "name": "Competition Rotor Alpha",
        "design": serde_json::from_str::<serde_json::Value>(LINEAR_FIXTURE).unwrap(),
        "note": "Initial baseline design"
    });
    let req_create = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/designs")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(create_payload.to_string()))
        .unwrap();
    let resp_create = app.clone().oneshot(req_create).await.unwrap();
    assert_eq!(resp_create.status(), StatusCode::CREATED);
    let create_bytes = to_bytes(resp_create.into_body(), 1024 * 1024)
        .await
        .unwrap();
    let created: DesignRecord = serde_json::from_slice(&create_bytes).unwrap();
    assert_eq!(created.id, "dsn-0001");
    assert_eq!(created.name, "Competition Rotor Alpha");
    assert_eq!(created.current_version, 1);
    assert_eq!(created.design.rotor.radius_mm, 600.0);

    // 2. List designs -> 200 OK with 1 summary
    let req_list = Request::builder()
        .method(Method::GET)
        .uri("/api/v1/designs")
        .body(Body::empty())
        .unwrap();
    let resp_list = app.clone().oneshot(req_list).await.unwrap();
    assert_eq!(resp_list.status(), StatusCode::OK);
    let list_bytes = to_bytes(resp_list.into_body(), 1024 * 1024).await.unwrap();
    let summaries: Vec<DesignSummary> = serde_json::from_slice(&list_bytes).unwrap();
    assert_eq!(summaries.len(), 1);
    assert_eq!(summaries[0].id, "dsn-0001");
    assert_eq!(summaries[0].current_version, 1);

    // 3. Update design (v2: switch to Schmitz distribution and 5 blades) -> 200 OK
    let mut v2_design = Design::from_json(SCHMITZ_FIXTURE).unwrap();
    v2_design.rotor.blade_count = 5;
    let update_payload = serde_json::json!({
        "name": "Competition Rotor Alpha (5-Blade Schmitz)",
        "design": v2_design,
        "note": "Upgraded to 5-blade Schmitz distribution"
    });
    let req_update = Request::builder()
        .method(Method::PUT)
        .uri("/api/v1/designs/dsn-0001")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(update_payload.to_string()))
        .unwrap();
    let resp_update = app.clone().oneshot(req_update).await.unwrap();
    assert_eq!(resp_update.status(), StatusCode::OK);
    let update_bytes = to_bytes(resp_update.into_body(), 1024 * 1024)
        .await
        .unwrap();
    let updated: DesignRecord = serde_json::from_slice(&update_bytes).unwrap();
    assert_eq!(updated.current_version, 2);
    assert_eq!(updated.name, "Competition Rotor Alpha (5-Blade Schmitz)");
    assert_eq!(updated.design.rotor.blade_count, 5);
    assert_ne!(updated.content_blake3, created.content_blake3);

    // 4. Get design -> returns v2
    let req_get = Request::builder()
        .method(Method::GET)
        .uri("/api/v1/designs/dsn-0001")
        .body(Body::empty())
        .unwrap();
    let resp_get = app.clone().oneshot(req_get).await.unwrap();
    assert_eq!(resp_get.status(), StatusCode::OK);
    let get_bytes = to_bytes(resp_get.into_body(), 1024 * 1024).await.unwrap();
    let fetched: DesignRecord = serde_json::from_slice(&get_bytes).unwrap();
    assert_eq!(fetched, updated);

    // 5. List versions -> returns [v1, v2]
    let req_versions = Request::builder()
        .method(Method::GET)
        .uri("/api/v1/designs/dsn-0001/versions")
        .body(Body::empty())
        .unwrap();
    let resp_versions = app.clone().oneshot(req_versions).await.unwrap();
    assert_eq!(resp_versions.status(), StatusCode::OK);
    let versions_bytes = to_bytes(resp_versions.into_body(), 1024 * 1024)
        .await
        .unwrap();
    let versions: Vec<DesignVersionRecord> = serde_json::from_slice(&versions_bytes).unwrap();
    assert_eq!(versions.len(), 2);
    assert_eq!(versions[0].version, 1);
    assert_eq!(versions[0].design.rotor.blade_count, 3);
    assert_eq!(versions[0].note.as_deref(), Some("Initial baseline design"));
    assert_eq!(versions[1].version, 2);
    assert_eq!(versions[1].design.rotor.blade_count, 5);

    // 6. Get specific version v1 -> returns exact v1 snapshot
    let req_v1 = Request::builder()
        .method(Method::GET)
        .uri("/api/v1/designs/dsn-0001/versions/1")
        .body(Body::empty())
        .unwrap();
    let resp_v1 = app.clone().oneshot(req_v1).await.unwrap();
    assert_eq!(resp_v1.status(), StatusCode::OK);
    let v1_bytes = to_bytes(resp_v1.into_body(), 1024 * 1024).await.unwrap();
    let v1_rec: DesignVersionRecord = serde_json::from_slice(&v1_bytes).unwrap();
    assert_eq!(v1_rec.version, 1);
    assert_eq!(v1_rec.design, created.design);

    // 7. Restore v1 -> creates v3 with v1's design and name
    let req_restore = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/designs/dsn-0001/versions/1/restore")
        .body(Body::empty())
        .unwrap();
    let resp_restore = app.clone().oneshot(req_restore).await.unwrap();
    assert_eq!(resp_restore.status(), StatusCode::OK);
    let restore_bytes = to_bytes(resp_restore.into_body(), 1024 * 1024)
        .await
        .unwrap();
    let restored: DesignRecord = serde_json::from_slice(&restore_bytes).unwrap();
    assert_eq!(restored.current_version, 3);
    assert_eq!(restored.design, created.design);
    assert_eq!(restored.content_blake3, created.content_blake3);

    // 8. Delete design -> 204 No Content, subsequent GET -> 404 Not Found
    let req_del = Request::builder()
        .method(Method::DELETE)
        .uri("/api/v1/designs/dsn-0001")
        .body(Body::empty())
        .unwrap();
    let resp_del = app.clone().oneshot(req_del).await.unwrap();
    assert_eq!(resp_del.status(), StatusCode::NO_CONTENT);

    let req_after_del = Request::builder()
        .method(Method::GET)
        .uri("/api/v1/designs/dsn-0001")
        .body(Body::empty())
        .unwrap();
    let resp_after_del = app.oneshot(req_after_del).await.unwrap();
    assert_eq!(resp_after_del.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn rejects_invalid_designs_and_unknown_ids_with_clear_http_statuses() {
    let app = build_router(AppState::new());

    // Invalid design (blade_count = 0) -> 422 Unprocessable Entity
    let invalid = LINEAR_FIXTURE.replace("\"blade_count\": 3", "\"blade_count\": 0");
    let req_invalid = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/designs")
        .body(Body::from(invalid))
        .unwrap();
    let resp_invalid = app.clone().oneshot(req_invalid).await.unwrap();
    assert_eq!(resp_invalid.status(), StatusCode::UNPROCESSABLE_ENTITY);

    // Unknown design ID -> 404 Not Found
    let req_404 = Request::builder()
        .method(Method::GET)
        .uri("/api/v1/designs/dsn-9999")
        .body(Body::empty())
        .unwrap();
    let resp_404 = app.oneshot(req_404).await.unwrap();
    assert_eq!(resp_404.status(), StatusCode::NOT_FOUND);
}
