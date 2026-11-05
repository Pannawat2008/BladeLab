#![deny(missing_docs)]
//! BladeLab Axum HTTP server (`T-103`).
//!
//! Exposes:
//! - `GET /healthz` → `200 OK` (`{"status":"ok"}`)
//! - `POST /api/v1/export` → exports a [`blade_model::Design`] as `stl`, `3mf`,
//!   or `step` (`blade`, `hub`, or `assembly`), backed by a `blake3`-addressed
//!   in-memory artifact cache and panic containment (`catch_unwind`) so panics
//!   never crash the server.

use std::collections::HashMap;
use std::future::Future;
use std::panic::{catch_unwind, AssertUnwindSafe};
use std::pin::Pin;
use std::sync::{Arc, RwLock};
use std::task::{Context, Poll};

use axum::body::{Body, Bytes};
use axum::extract::{Path, Query, State};
use axum::http::{header, HeaderMap, HeaderValue, Request, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use blade_cli::{export_design_bytes, CliError, ExportFormat, ExportPart};
use blade_model::{validate, Design, ModelError, SCHEMA_VERSION};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tower::{Layer, Service};

pub mod store;

pub use store::{
    DesignRecord, DesignStore, DesignSummary, DesignVersionRecord, StoreError, POSTGRES_SCHEMA_SQL,
};

/// Shared application state holding the `blake3` export cache and the
/// transactional [`DesignStore`] (`T-204`).
#[derive(Debug, Clone, Default)]
pub struct AppState {
    cache: ExportCache,
    store: DesignStore,
}

impl AppState {
    /// Creates a fresh [`AppState`] with an empty export cache and design store.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Accesses the `blake3` export cache.
    #[must_use]
    pub const fn cache(&self) -> &ExportCache {
        &self.cache
    }

    /// Accesses the [`DesignStore`] (`T-204`).
    #[must_use]
    pub const fn store(&self) -> &DesignStore {
        &self.store
    }
}

/// Thread-safe, `blake3`-addressed in-memory cache of exported CAD/mesh payloads.
#[derive(Debug, Clone, Default)]
pub struct ExportCache {
    inner: Arc<RwLock<CacheInner>>,
}

#[derive(Debug, Default)]
struct CacheInner {
    entries: HashMap<String, Arc<Vec<u8>>>,
    hits: u64,
    misses: u64,
}

/// Snapshot of cache counters for observability and integration tests.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CacheStats {
    /// Number of distinct `(design, format, part)` digests currently stored.
    pub entry_count: usize,
    /// Total cache hits served without re-running geometry/CAD generation.
    pub hits: u64,
    /// Total cache misses that triggered geometry/CAD generation.
    pub misses: u64,
}

impl ExportCache {
    /// Looks up `digest` in the cache, incrementing `hits` or `misses`.
    #[must_use]
    pub fn get(&self, digest: &str) -> Option<Arc<Vec<u8>>> {
        let mut guard = self
            .inner
            .write()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        if let Some(bytes) = guard.entries.get(digest).cloned() {
            guard.hits += 1;
            Some(bytes)
        } else {
            guard.misses += 1;
            None
        }
    }

    /// Stores `payload` under its `blake3` hex `digest`.
    pub fn insert(&self, digest: String, payload: Arc<Vec<u8>>) {
        let mut guard = self
            .inner
            .write()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        guard.entries.insert(digest, payload);
    }

    /// Returns current cache statistics (`entry_count`, `hits`, `misses`).
    #[must_use]
    pub fn stats(&self) -> CacheStats {
        let guard = self
            .inner
            .read()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        CacheStats {
            entry_count: guard.entries.len(),
            hits: guard.hits,
            misses: guard.misses,
        }
    }
}

/// Optional query parameters for `POST /api/v1/export?format=step&part=blade`.
#[derive(Debug, Default, Deserialize)]
pub struct ExportQuery {
    /// Export format (`stl`, `3mf`, `step`) when sending a bare `Design` JSON body.
    pub format: Option<String>,
    /// Export part (`blade`, `hub`, `assembly`), defaults to `blade`.
    pub part: Option<String>,
}

/// JSON envelope accepted by `POST /api/v1/export`.
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct ExportEnvelope {
    design: Design,
    format: Option<String>,
    part: Option<String>,
}

/// Errors produced by `POST /api/v1/export`.
#[derive(Debug, Error)]
pub enum ServerError {
    /// Request JSON or query parameters were malformed.
    #[error("{0}")]
    BadRequest(String),

    /// Design failed semantic validation.
    #[error("design validation failed")]
    InvalidDesign(Vec<blade_model::ValidationIssue>),

    /// Requested resource was not found.
    #[error("{0}")]
    NotFound(String),

    /// Internal panic recovered without crashing the server.
    #[error("internal server panic recovered: {0}")]
    PanicRecovered(String),

    /// Underlying export error.
    #[error("{0}")]
    Export(String),
}

impl IntoResponse for ServerError {
    fn into_response(self) -> Response {
        match self {
            Self::BadRequest(message) => (
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({ "error": message })),
            )
                .into_response(),
            Self::NotFound(message) => (
                StatusCode::NOT_FOUND,
                Json(serde_json::json!({ "error": message })),
            )
                .into_response(),
            Self::InvalidDesign(issues) => {
                let details: Vec<_> = issues
                    .into_iter()
                    .map(|issue| {
                        serde_json::json!({
                            "path": issue.path,
                            "message": issue.message,
                        })
                    })
                    .collect();
                (
                    StatusCode::UNPROCESSABLE_ENTITY,
                    Json(serde_json::json!({
                        "error": "design validation failed",
                        "issues": details,
                    })),
                )
                    .into_response()
            }
            Self::PanicRecovered(message) | Self::Export(message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": message })),
            )
                .into_response(),
        }
    }
}

/// Builds the Axum [`Router`] with `/healthz`, `/api/v1/export`, `/api/v1/designs`
/// CRUD + versioning endpoints (`T-204`), and full panic containment across
/// every route.
pub fn build_router(state: AppState) -> Router {
    Router::new()
        .route("/healthz", get(healthz))
        .route("/api/v1/export", post(handle_export))
        .route(
            "/api/v1/designs",
            get(handle_list_designs).post(handle_create_design),
        )
        .route(
            "/api/v1/designs/{id}",
            get(handle_get_design)
                .put(handle_update_design)
                .delete(handle_delete_design),
        )
        .route("/api/v1/designs/{id}/versions", get(handle_list_versions))
        .route(
            "/api/v1/designs/{id}/versions/{version}",
            get(handle_get_version),
        )
        .route(
            "/api/v1/designs/{id}/versions/{version}/restore",
            post(handle_restore_version),
        )
        .with_state(state)
        .layer(CatchPanicLayer)
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct DesignUpsertEnvelope {
    name: Option<String>,
    design: Design,
    note: Option<String>,
}

fn parse_design_upsert(
    body: &[u8],
) -> Result<(Option<String>, Design, Option<String>), ServerError> {
    let text = std::str::from_utf8(body)
        .map_err(|err| ServerError::BadRequest(format!("body must be UTF-8 JSON: {err}")))?;
    let value: serde_json::Value =
        serde_json::from_str(text).map_err(|err| ServerError::BadRequest(err.to_string()))?;

    if value.get("design").is_some() {
        let env: DesignUpsertEnvelope = serde_json::from_value(value)
            .map_err(|err| ServerError::BadRequest(err.to_string()))?;
        Ok((env.name, env.design, env.note))
    } else {
        let design =
            Design::from_json(text).map_err(|err| ServerError::BadRequest(err.to_string()))?;
        Ok((None, design, None))
    }
}

fn map_store_error(err: StoreError) -> ServerError {
    match err {
        StoreError::EmptyName => ServerError::BadRequest(err.to_string()),
        StoreError::UnsupportedSchema { .. } => ServerError::BadRequest(err.to_string()),
        StoreError::InvalidDesign(issues) => ServerError::InvalidDesign(issues),
        StoreError::NotFound(_) | StoreError::VersionNotFound { .. } => {
            ServerError::NotFound(err.to_string())
        }
    }
}

async fn handle_create_design(
    State(state): State<AppState>,
    body: Bytes,
) -> Result<Response, ServerError> {
    let (name_opt, design, note) = parse_design_upsert(&body)?;
    let name = name_opt.unwrap_or_else(|| "Untitled Design".to_string());
    let created = state
        .store
        .create(name, design, note)
        .map_err(map_store_error)?;
    Ok((StatusCode::CREATED, Json(created)).into_response())
}

async fn handle_list_designs(State(state): State<AppState>) -> impl IntoResponse {
    Json(state.store.list())
}

async fn handle_get_design(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<DesignRecord>, ServerError> {
    state.store.get(&id).map(Json).map_err(map_store_error)
}

async fn handle_update_design(
    State(state): State<AppState>,
    Path(id): Path<String>,
    body: Bytes,
) -> Result<Json<DesignRecord>, ServerError> {
    let (name_opt, design, note) = parse_design_upsert(&body)?;
    state
        .store
        .update(&id, name_opt, design, note)
        .map(Json)
        .map_err(map_store_error)
}

async fn handle_delete_design(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ServerError> {
    state
        .store
        .delete(&id)
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_store_error)
}

async fn handle_list_versions(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<DesignVersionRecord>>, ServerError> {
    state
        .store
        .list_versions(&id)
        .map(Json)
        .map_err(map_store_error)
}

async fn handle_get_version(
    State(state): State<AppState>,
    Path((id, version)): Path<(String, u32)>,
) -> Result<Json<DesignVersionRecord>, ServerError> {
    state
        .store
        .get_version(&id, version)
        .map(Json)
        .map_err(map_store_error)
}

async fn handle_restore_version(
    State(state): State<AppState>,
    Path((id, version)): Path<(String, u32)>,
) -> Result<Json<DesignRecord>, ServerError> {
    state
        .store
        .restore_version(&id, version, None)
        .map(Json)
        .map_err(map_store_error)
}

async fn healthz() -> impl IntoResponse {
    Json(serde_json::json!({ "status": "ok" }))
}

async fn handle_export(
    State(state): State<AppState>,
    Query(query): Query<ExportQuery>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<Response, ServerError> {
    // Allow integration tests to verify panic containment via a dedicated header
    // in addition to catching any panic inside the geometry/CAD kernel.
    if headers
        .get("x-bladelab-debug-panic")
        .and_then(|v| v.to_str().ok())
        == Some("true")
    {
        panic!("simulated export handler panic");
    }

    let (design, format, part) = parse_export_request(&body, &query)?;
    if design.schema_version != SCHEMA_VERSION {
        return Err(ServerError::BadRequest(format!(
            "unsupported schema_version {} (expected {SCHEMA_VERSION})",
            design.schema_version
        )));
    }
    validate(&design).map_err(ServerError::InvalidDesign)?;

    let canonical_json =
        serde_json::to_string(&design).map_err(|err| ServerError::BadRequest(err.to_string()))?;
    let digest = compute_blake3_key(&canonical_json, format, part);
    let etag_value = format!("\"{digest}\"");

    if let Some(if_none_match) = headers
        .get(header::IF_NONE_MATCH)
        .and_then(|v| v.to_str().ok())
    {
        if if_none_match.trim() == etag_value || if_none_match.trim() == digest {
            let mut response = StatusCode::NOT_MODIFIED.into_response();
            insert_export_headers(response.headers_mut(), format, &etag_value, "HIT");
            return Ok(response);
        }
    }

    if let Some(cached) = state.cache.get(&digest) {
        return Ok(build_binary_response(
            (*cached).clone(),
            format,
            &etag_value,
            "HIT",
        ));
    }

    let join_result = tokio::task::spawn_blocking(move || {
        catch_unwind(AssertUnwindSafe(|| {
            export_design_bytes(&canonical_json, format, part)
        }))
    })
    .await;

    let bytes = match join_result {
        Ok(Ok(Ok(bytes))) => bytes,
        Ok(Ok(Err(cli_err))) => return Err(map_cli_error(cli_err)),
        Ok(Err(panic_payload)) => {
            return Err(ServerError::PanicRecovered(panic_message(panic_payload)))
        }
        Err(join_err) => {
            return Err(ServerError::PanicRecovered(format!(
                "worker task failed: {join_err}"
            )))
        }
    };

    let shared = Arc::new(bytes.clone());
    state.cache.insert(digest, shared);

    Ok(build_binary_response(bytes, format, &etag_value, "MISS"))
}

fn parse_export_request(
    body: &[u8],
    query: &ExportQuery,
) -> Result<(Design, ExportFormat, ExportPart), ServerError> {
    let text = std::str::from_utf8(body)
        .map_err(|err| ServerError::BadRequest(format!("body must be UTF-8 JSON: {err}")))?;

    let value: serde_json::Value =
        serde_json::from_str(text).map_err(|err| ServerError::BadRequest(err.to_string()))?;

    let (design, raw_format, raw_part) = if value.get("design").is_some() {
        let env: ExportEnvelope = serde_json::from_value(value)
            .map_err(|err| ServerError::BadRequest(err.to_string()))?;
        (
            env.design,
            env.format.or_else(|| query.format.clone()),
            env.part.or_else(|| query.part.clone()),
        )
    } else {
        let design =
            Design::from_json(text).map_err(|err| ServerError::BadRequest(err.to_string()))?;
        (design, query.format.clone(), query.part.clone())
    };

    let format_str = raw_format.ok_or_else(|| {
        ServerError::BadRequest("missing export `format` (`stl`, `3mf`, or `step`)".to_string())
    })?;
    let format =
        ExportFormat::parse(&format_str).map_err(|err| ServerError::BadRequest(err.to_string()))?;

    let part = match raw_part {
        Some(raw) => {
            ExportPart::parse(&raw).map_err(|err| ServerError::BadRequest(err.to_string()))?
        }
        None => ExportPart::Blade,
    };

    Ok((design, format, part))
}

/// Computes the deterministic `blake3` hex digest for `(canonical_design_json, format, part)`.
#[must_use]
pub fn compute_blake3_key(
    canonical_design_json: &str,
    format: ExportFormat,
    part: ExportPart,
) -> String {
    let mut hasher = blake3::Hasher::new();
    hasher.update(b"bladelab-export-v1\0");
    hasher.update(format.extension().as_bytes());
    hasher.update(b"\0");
    let part_tag = match part {
        ExportPart::Blade => "blade",
        ExportPart::Hub => "hub",
        ExportPart::Assembly => "assembly",
    };
    hasher.update(part_tag.as_bytes());
    hasher.update(b"\0");
    hasher.update(canonical_design_json.as_bytes());
    hasher.finalize().to_hex().to_string()
}

fn build_binary_response(
    bytes: Vec<u8>,
    format: ExportFormat,
    etag: &str,
    cache_status: &'static str,
) -> Response {
    let mut response = (StatusCode::OK, bytes).into_response();
    insert_export_headers(response.headers_mut(), format, etag, cache_status);
    response
}

fn insert_export_headers(
    headers: &mut HeaderMap,
    format: ExportFormat,
    etag: &str,
    cache_status: &'static str,
) {
    let content_type = match format {
        ExportFormat::Stl => "model/stl",
        ExportFormat::ThreeMf => "model/3mf",
        ExportFormat::Step => "model/step",
    };
    headers.insert(header::CONTENT_TYPE, HeaderValue::from_static(content_type));
    if let Ok(etag_val) = HeaderValue::from_str(etag) {
        headers.insert(header::ETAG, etag_val);
    }
    headers.insert("x-bladelab-cache", HeaderValue::from_static(cache_status));
}

fn map_cli_error(err: CliError) -> ServerError {
    match err {
        CliError::Model(ModelError::Invalid(issues)) => ServerError::InvalidDesign(issues),
        CliError::Model(other) => ServerError::BadRequest(other.to_string()),
        CliError::Geom(geom_err) => ServerError::BadRequest(geom_err.to_string()),
        other => ServerError::Export(other.to_string()),
    }
}

fn panic_message(payload: Box<dyn std::any::Any + Send>) -> String {
    if let Some(msg) = payload.downcast_ref::<&str>() {
        (*msg).to_string()
    } else if let Some(msg) = payload.downcast_ref::<String>() {
        msg.clone()
    } else {
        "unknown panic".to_string()
    }
}

/// Tower [`Layer`] that intercepts any synchronous or asynchronous panic in a
/// request handler and converts it into a `500 Internal Server Error` JSON
/// response so panics never crash the server.
#[derive(Debug, Clone, Copy, Default)]
pub struct CatchPanicLayer;

impl<S> Layer<S> for CatchPanicLayer {
    type Service = CatchPanicService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        CatchPanicService { inner }
    }
}

/// Tower [`Service`] wrapper produced by [`CatchPanicLayer`].
#[derive(Debug, Clone)]
pub struct CatchPanicService<S> {
    inner: S,
}

impl<S> Service<Request<Body>> for CatchPanicService<S>
where
    S: Service<Request<Body>, Response = Response> + Send + 'static,
    S::Future: Send + 'static,
{
    type Response = Response;
    type Error = S::Error;
    type Future = CatchPanicFuture<S::Future>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request<Body>) -> Self::Future {
        match catch_unwind(AssertUnwindSafe(|| self.inner.call(req))) {
            Ok(future) => CatchPanicFuture {
                inner: Some(Box::pin(future)),
            },
            Err(payload) => {
                let _ = panic_message(payload);
                CatchPanicFuture { inner: None }
            }
        }
    }
}

/// Future wrapper that catches panics during `poll`.
pub struct CatchPanicFuture<F> {
    inner: Option<Pin<Box<F>>>,
}

impl<F, E> Future for CatchPanicFuture<F>
where
    F: Future<Output = Result<Response, E>>,
{
    type Output = Result<Response, E>;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        let Some(inner) = self.inner.as_mut() else {
            return Poll::Ready(Ok(panic_json_response("internal server panic recovered")));
        };
        match catch_unwind(AssertUnwindSafe(|| inner.as_mut().poll(cx))) {
            Ok(Poll::Pending) => Poll::Pending,
            Ok(Poll::Ready(output)) => Poll::Ready(output),
            Err(payload) => {
                let msg = panic_message(payload);
                Poll::Ready(Ok(panic_json_response(&format!(
                    "internal server panic recovered: {msg}"
                ))))
            }
        }
    }
}

fn panic_json_response(message: &str) -> Response {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(serde_json::json!({ "error": message })),
    )
        .into_response()
}
