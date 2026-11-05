#![deny(missing_docs)]
//! wasm-bindgen bindings that run the BladeLab blade pipeline in the browser.
//!
//! This crate is the `[wasm]` half of the architecture (§2): the web app calls
//! [`build_mesh`] with the design JSON (plus optional live overrides) and
//! receives indexed triangle data to feed straight into Three.js. It never
//! exports STEP — that stays on the native server (§2, D-geom1-007).
//!
//! The pipeline itself (`Design → resolve → build_sections → loft →
//! tessellate`) lives in [`mesh`] so it can be unit-tested on the host.

use serde::Deserialize;
use wasm_bindgen::prelude::*;

pub mod mesh;

use mesh::{build_mesh as run_pipeline, MeshOutput, Overrides};

/// Live-edit overrides deserialised from the web UI (all fields optional).
#[derive(Debug, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
struct OverridesDto {
    /// Chord tip value in mm.
    tip_chord_mm: Option<f64>,
    /// Twist tip value in degrees.
    tip_twist_deg: Option<f64>,
    /// Number of resolved cross-sections.
    station_count: Option<u32>,
}

impl From<OverridesDto> for Overrides {
    fn from(dto: OverridesDto) -> Self {
        Self {
            tip_chord_mm: dto.tip_chord_mm,
            tip_twist_deg: dto.tip_twist_deg,
            station_count: dto.station_count,
        }
    }
}

/// Indexed triangle data for one blade, ready to upload to the GPU.
#[wasm_bindgen]
#[derive(Clone)]
pub struct MeshData {
    output: MeshOutput,
}

#[wasm_bindgen]
impl MeshData {
    /// Interleaved `x, y, z` vertices in mm (`3 × vertex_count` entries).
    #[wasm_bindgen(getter)]
    pub fn positions(&self) -> Vec<f32> {
        self.output.positions.clone()
    }

    /// Triangle indices (`3 × triangle_count` entries).
    #[wasm_bindgen(getter)]
    pub fn indices(&self) -> Vec<u32> {
        self.output.indices.clone()
    }

    /// Number of vertices.
    #[wasm_bindgen(getter)]
    pub fn vertex_count(&self) -> usize {
        self.output.vertex_count
    }

    /// Number of triangles.
    #[wasm_bindgen(getter)]
    pub fn triangle_count(&self) -> usize {
        self.output.triangle_count
    }

    /// Closed-mesh volume in mm³.
    #[wasm_bindgen(getter)]
    pub fn volume_mm3(&self) -> f64 {
        self.output.volume_mm3
    }

    /// Root radius in mm (lowest z).
    #[wasm_bindgen(getter)]
    pub fn span_min_mm(&self) -> f64 {
        self.output.span_min_mm
    }

    /// Tip radius in mm (highest z).
    #[wasm_bindgen(getter)]
    pub fn span_max_mm(&self) -> f64 {
        self.output.span_max_mm
    }
}

/// Builds the blade triangle mesh from `design_json`.
///
/// `overrides_json` is a small JSON object: `{"tip_chord_mm": ..,
/// "tip_twist_deg": .., "station_count": ..}` (all fields optional; pass `{}`
/// for no overrides). The pipeline runs entirely in Rust; the returned
/// [`MeshData`] can go straight into a Three.js `BufferGeometry`.
///
/// # Errors
///
/// Throws an error with a readable message when the design is invalid or the
/// geometry is degenerate.
#[wasm_bindgen]
pub fn build_mesh(design_json: &str, overrides_json: &str) -> Result<MeshData, JsValue> {
    let overrides: Overrides = if overrides_json.trim().is_empty() {
        Overrides::default()
    } else {
        serde_json::from_str::<OverridesDto>(overrides_json)
            .map(Overrides::from)
            .map_err(|error| JsValue::from_str(&format!("bad overrides JSON: {error}")))?
    };
    run_pipeline(design_json, &overrides)
        .map(|output| MeshData { output })
        .map_err(|error| JsValue::from_str(&error))
}
