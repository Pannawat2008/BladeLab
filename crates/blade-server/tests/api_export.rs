//! Integration tests for `blade-server` (`POST /api/v1/export` + `blake3` cache + panic recovery).

use axum::body::{to_bytes, Body};
use axum::http::{header, Method, Request, StatusCode};
use blade_server::{build_router, AppState};
use tower::ServiceExt;

const LINEAR_FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");
const SCHMITZ_FIXTURE: &str = include_str!("../../../fixtures/naca4412-schmitz.json");

#[tokio::test]
async fn exports_stl_3mf_and_step_and_caches_with_blake3() {
    let state = AppState::new();
    let app = build_router(state.clone());

    // 1. First STL request -> MISS
    let req1 = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=stl")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(LINEAR_FIXTURE))
        .unwrap();
    let resp1 = app.clone().oneshot(req1).await.unwrap();
    assert_eq!(resp1.status(), StatusCode::OK);
    assert_eq!(
        resp1.headers().get(header::CONTENT_TYPE).unwrap(),
        "model/stl"
    );
    assert_eq!(resp1.headers().get("x-bladelab-cache").unwrap(), "MISS");
    let etag = resp1
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    assert_eq!(etag.len(), 66, "quoted 64-hex blake3 digest");
    let stl_bytes = to_bytes(resp1.into_body(), 4 * 1024 * 1024).await.unwrap();
    assert_eq!(stl_bytes.len(), 84 + 3538 * 50);

    // 2. Second STL request (via JSON envelope with re-formatted whitespace) -> HIT
    let envelope = format!(r#"{{"design": {LINEAR_FIXTURE}, "format": "stl"}}"#);
    let req2 = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(envelope))
        .unwrap();
    let resp2 = app.clone().oneshot(req2).await.unwrap();
    assert_eq!(resp2.status(), StatusCode::OK);
    assert_eq!(resp2.headers().get("x-bladelab-cache").unwrap(), "HIT");
    assert_eq!(resp2.headers().get(header::ETAG).unwrap(), &etag);
    let cached_bytes = to_bytes(resp2.into_body(), 4 * 1024 * 1024).await.unwrap();
    assert_eq!(cached_bytes, stl_bytes);

    let stats = state.cache().stats();
    assert_eq!(stats.entry_count, 1);
    assert_eq!(stats.misses, 1);
    assert_eq!(stats.hits, 1);

    // 3. Conditional request with If-None-Match -> 304 Not Modified
    let req_304 = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=stl")
        .header(header::IF_NONE_MATCH, &etag)
        .body(Body::from(LINEAR_FIXTURE))
        .unwrap();
    let resp_304 = app.clone().oneshot(req_304).await.unwrap();
    assert_eq!(resp_304.status(), StatusCode::NOT_MODIFIED);

    // 4. 3MF export -> MISS, valid ZIP + 3MF XML
    let req_3mf = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=3mf")
        .body(Body::from(SCHMITZ_FIXTURE))
        .unwrap();
    let resp_3mf = app.clone().oneshot(req_3mf).await.unwrap();
    assert_eq!(resp_3mf.status(), StatusCode::OK);
    assert_eq!(
        resp_3mf.headers().get(header::CONTENT_TYPE).unwrap(),
        "model/3mf"
    );
    assert_eq!(resp_3mf.headers().get("x-bladelab-cache").unwrap(), "MISS");
    let threemf_bytes = to_bytes(resp_3mf.into_body(), 4 * 1024 * 1024)
        .await
        .unwrap();
    assert_eq!(&threemf_bytes[..4], b"PK\x03\x04");

    // 5. STEP assembly export -> MISS, 2 MANIFOLD_SOLID_BREP bodies
    let req_step = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=step&part=assembly")
        .body(Body::from(LINEAR_FIXTURE))
        .unwrap();
    let resp_step = app.oneshot(req_step).await.unwrap();
    assert_eq!(resp_step.status(), StatusCode::OK);
    assert_eq!(
        resp_step.headers().get(header::CONTENT_TYPE).unwrap(),
        "model/step"
    );
    let step_bytes = to_bytes(resp_step.into_body(), 8 * 1024 * 1024)
        .await
        .unwrap();
    let step_text = std::str::from_utf8(&step_bytes).unwrap();
    assert!(step_text.starts_with("ISO-10303-21;"));
    assert_eq!(step_text.matches("MANIFOLD_SOLID_BREP(").count(), 2);
}

#[tokio::test]
async fn rejects_invalid_payloads_with_structured_http_errors() {
    let app = build_router(AppState::new());

    // Malformed JSON -> 400 Bad Request
    let bad_json = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=stl")
        .body(Body::from("{not valid json"))
        .unwrap();
    let resp_bad = app.clone().oneshot(bad_json).await.unwrap();
    assert_eq!(resp_bad.status(), StatusCode::BAD_REQUEST);

    // Invalid semantic design (blade_count = 0) -> 422 Unprocessable Entity
    let invalid_design = LINEAR_FIXTURE.replace("\"blade_count\": 3", "\"blade_count\": 0");
    let req_invalid = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=stl")
        .body(Body::from(invalid_design))
        .unwrap();
    let resp_invalid = app.oneshot(req_invalid).await.unwrap();
    assert_eq!(resp_invalid.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let body = to_bytes(resp_invalid.into_body(), 64 * 1024).await.unwrap();
    let body_str = std::str::from_utf8(&body).unwrap();
    assert!(body_str.contains("rotor.blade_count"));
}

#[tokio::test]
async fn panics_are_caught_and_do_not_crash_the_server() {
    let state = AppState::new();
    let app = build_router(state);

    // Trigger a deliberate panic inside the handler via `x-bladelab-debug-panic: true`.
    let panic_req = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=stl")
        .header("x-bladelab-debug-panic", "true")
        .body(Body::from(LINEAR_FIXTURE))
        .unwrap();
    let panic_resp = app.clone().oneshot(panic_req).await.unwrap();
    assert_eq!(panic_resp.status(), StatusCode::INTERNAL_SERVER_ERROR);
    let panic_body = to_bytes(panic_resp.into_body(), 64 * 1024).await.unwrap();
    let panic_str = std::str::from_utf8(&panic_body).unwrap();
    assert!(panic_str.contains("internal server panic recovered"));

    // Subsequent requests to the same server state/router still succeed!
    let health_req = Request::builder()
        .method(Method::GET)
        .uri("/healthz")
        .body(Body::empty())
        .unwrap();
    let health_resp = app.clone().oneshot(health_req).await.unwrap();
    assert_eq!(health_resp.status(), StatusCode::OK);

    let export_req = Request::builder()
        .method(Method::POST)
        .uri("/api/v1/export?format=stl")
        .body(Body::from(LINEAR_FIXTURE))
        .unwrap();
    let export_resp = app.oneshot(export_req).await.unwrap();
    assert_eq!(export_resp.status(), StatusCode::OK);
}
