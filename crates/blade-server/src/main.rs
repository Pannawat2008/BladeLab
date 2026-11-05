//! `blade-server` binary entry point.

use std::net::SocketAddr;

use blade_server::{build_router, AppState};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr: SocketAddr = std::env::var("BLADELAB_BIND")
        .unwrap_or_else(|_| "0.0.0.0:3000".to_string())
        .parse()?;

    let listener = tokio::net::TcpListener::bind(addr).await?;
    let app = build_router(AppState::new());
    axum::serve(listener, app).await?;
    Ok(())
}
