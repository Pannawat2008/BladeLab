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

use blade_aero::{
    match_generator, simulate, simulate_tsr_sweep, AeroResult, GeneratorMatchResult, GeneratorSpec,
    OperatingPoint, PolarSet, TsrSweepPoint,
};
use blade_model::{resolve, Design};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

pub mod mesh;

use mesh::{
    build_mesh as run_pipeline, export_3mf, export_3mf_with_overrides, export_stl,
    export_stl_with_overrides, MeshOutput, Overrides,
};

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
    /// Optional carbon-fiber spar tube hole diameter at the blade root base in mm.
    spar_hole_diameter_mm: Option<f64>,
    /// Optional carbon-fiber spar tube hole depth along the blade span in mm.
    spar_hole_depth_mm: Option<f64>,
    /// Optional chordwise offset of the spar hole from the root core center in mm.
    spar_hole_offset_x_mm: Option<f64>,
    /// Optional thickness-direction offset of the spar hole from the root core center in mm.
    spar_hole_offset_y_mm: Option<f64>,
    /// Number of spanwise printable segments (`1..=8`, `1` = unsplit).
    split_parts: Option<usize>,
    /// Optional split span ratio in `[0.12, 0.88]` for 2+ part splits.
    split_ratio: Option<f64>,
    /// Optional 0-based segment index (`0..split_parts`) to isolate a single part.
    active_part: Option<usize>,
    /// Optional exploded preview/export gap in mm along `+z` between split segments.
    explode_gap_mm: Option<f64>,
    /// Carbon tube bore fit tolerance added to the bore diameter in mm.
    spar_hole_tolerance_mm: Option<f64>,
    /// Alignment feature shape: `"round"` or `"key"` (absent = none).
    align_shape: Option<String>,
    /// Alignment features per split face (`1` or `2`).
    align_count: Option<usize>,
    /// Pin diameter / key width in mm.
    align_size_mm: Option<f64>,
    /// Key length along the chord in mm.
    align_key_length_mm: Option<f64>,
    /// Pin height above the split face in mm.
    align_height_mm: Option<f64>,
    /// Distance from the tube / core center to each pin in mm (`<= 0` = auto).
    align_spacing_mm: Option<f64>,
    /// Per-side socket clearance in mm.
    align_clearance_mm: Option<f64>,
    /// Extra socket depth beyond the pin height in mm.
    align_depth_clearance_mm: Option<f64>,
    /// Minimum wall between a socket and the airfoil skin in mm.
    align_min_wall_mm: Option<f64>,
}

impl From<OverridesDto> for Overrides {
    fn from(dto: OverridesDto) -> Self {
        Self {
            tip_chord_mm: dto.tip_chord_mm,
            tip_twist_deg: dto.tip_twist_deg,
            station_count: dto.station_count,
            spar_hole_diameter_mm: dto.spar_hole_diameter_mm,
            spar_hole_depth_mm: dto.spar_hole_depth_mm,
            spar_hole_offset_x_mm: dto.spar_hole_offset_x_mm,
            spar_hole_offset_y_mm: dto.spar_hole_offset_y_mm,
            split_parts: dto.split_parts,
            split_ratio: dto.split_ratio,
            active_part: dto.active_part,
            explode_gap_mm: dto.explode_gap_mm,
            spar_hole_tolerance_mm: dto.spar_hole_tolerance_mm,
            align_shape: dto.align_shape,
            align_count: dto.align_count,
            align_size_mm: dto.align_size_mm,
            align_key_length_mm: dto.align_key_length_mm,
            align_height_mm: dto.align_height_mm,
            align_spacing_mm: dto.align_spacing_mm,
            align_clearance_mm: dto.align_clearance_mm,
            align_depth_clearance_mm: dto.align_depth_clearance_mm,
            align_min_wall_mm: dto.align_min_wall_mm,
        }
    }
}

fn parse_overrides_json(overrides_json: &str) -> Result<Overrides, JsValue> {
    if overrides_json.trim().is_empty() {
        Ok(Overrides::default())
    } else {
        serde_json::from_str::<OverridesDto>(overrides_json)
            .map(Overrides::from)
            .map_err(|error| JsValue::from_str(&format!("bad overrides JSON: {error}")))
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
    let overrides = parse_overrides_json(overrides_json)?;
    run_pipeline(design_json, &overrides)
        .map(|output| MeshData { output })
        .map_err(|error| JsValue::from_str(&error))
}

/// Optional configuration for [`simulate_aero`].
#[derive(Debug, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct AeroOptionsDto {
    /// Freestream wind speed in m/s (defaults to `design.rotor.wind_speed_mps`).
    pub wind_speed_mps: Option<f64>,
    /// Collective blade pitch offset in degrees (defaults to `0.0`).
    pub pitch_deg: Option<f64>,
    /// Lower bound of the TSR sweep (defaults to `1.5`).
    pub tsr_min: Option<f64>,
    /// Upper bound of the TSR sweep (defaults to `9.0`).
    pub tsr_max: Option<f64>,
    /// Number of TSR sweep steps (defaults to `16`).
    pub tsr_steps: Option<usize>,
    /// Optional generator Kv (RPM/V) for coupled generator matching.
    pub generator_kv: Option<f64>,
    /// Optional generator internal resistance (Ω).
    pub generator_r_int: Option<f64>,
    /// Optional generator load resistance (Ω).
    pub generator_r_load: Option<f64>,
}

/// Combined BEM design-point result, TSR sweep curve, and optional generator
/// equilibrium returned by [`simulate_aero`].
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AeroSimulationBundle {
    /// BEM solution at `design.rotor.design_tsr`.
    pub design_point: AeroResult,
    /// Full $C_p$–TSR sweep curve.
    pub sweep: Vec<TsrSweepPoint>,
    /// Maximum $C_p$ found along the sweep.
    pub peak_cp: f64,
    /// TSR corresponding to `peak_cp`.
    pub peak_tsr: f64,
    /// Maximum mechanical power (W) along the sweep.
    pub peak_power_w: f64,
    /// Optional coupled generator equilibrium operating point.
    pub generator_match: Option<GeneratorMatchResult>,
}

/// Runs the BEM simulation and TSR sweep on the host or inside wasm, returning
/// serialized JSON (`AeroSimulationBundle`).
pub fn run_aero_simulation(design_json: &str, options_json: &str) -> Result<String, String> {
    let design = Design::from_json(design_json).map_err(|e| format!("invalid design: {e}"))?;
    let blade = resolve(&design).map_err(|e| format!("failed to resolve blade: {e}"))?;
    let opts: AeroOptionsDto = if options_json.trim().is_empty() {
        AeroOptionsDto::default()
    } else {
        serde_json::from_str(options_json).map_err(|e| format!("bad aero options JSON: {e}"))?
    };

    let wind = opts.wind_speed_mps.unwrap_or(blade.rotor.wind_speed_mps);
    let pitch = opts.pitch_deg.unwrap_or(0.0);
    let tsr_min = opts.tsr_min.unwrap_or(1.5).max(0.2);
    let tsr_max = opts.tsr_max.unwrap_or(9.0).max(tsr_min + 0.5);
    let steps = opts.tsr_steps.unwrap_or(16).clamp(3, 64);

    let polars = PolarSet::builtin();
    let mut design_op = OperatingPoint::new(wind, blade.rotor.design_tsr);
    design_op.pitch_deg = pitch;
    let design_point =
        simulate(&blade, &polars, &design_op).map_err(|e| format!("BEM error: {e}"))?;

    let mut tsr_grid: Vec<f64> = (0..steps)
        .map(|i| tsr_min + (tsr_max - tsr_min) * (i as f64 / (steps - 1) as f64))
        .collect();
    if !tsr_grid
        .iter()
        .any(|&t| (t - blade.rotor.design_tsr).abs() < 1e-6)
    {
        tsr_grid.push(blade.rotor.design_tsr);
        tsr_grid.sort_by(|a, b| a.total_cmp(b));
    }

    let sweep = simulate_tsr_sweep(&blade, &polars, wind, pitch, &tsr_grid)
        .map_err(|e| format!("BEM sweep error: {e}"))?;

    let (peak_cp, peak_tsr, peak_power_w) = sweep.iter().fold(
        (
            design_point.cp,
            blade.rotor.design_tsr,
            design_point.power_w,
        ),
        |(best_cp, best_tsr, best_p), pt| {
            if pt.cp > best_cp {
                (pt.cp, pt.tsr, pt.power_w)
            } else {
                (best_cp, best_tsr, best_p)
            }
        },
    );

    let generator_match = match (
        opts.generator_kv,
        opts.generator_r_int,
        opts.generator_r_load,
    ) {
        (Some(kv), Some(r_int), Some(r_load)) => {
            let spec = GeneratorSpec::new(kv, r_int, 0.08);
            Some(
                match_generator(&blade, &polars, wind, pitch, &spec, r_load)
                    .map_err(|e| format!("generator match error: {e}"))?,
            )
        }
        _ => None,
    };

    let bundle = AeroSimulationBundle {
        design_point,
        sweep,
        peak_cp,
        peak_tsr,
        peak_power_w,
        generator_match,
    };
    serde_json::to_string(&bundle).map_err(|e| e.to_string())
}

/// Runs BEM simulation, TSR sweep, and optional generator matching from wasm,
/// returning a JSON string (`AeroSimulationBundle`).
#[wasm_bindgen]
pub fn simulate_aero(design_json: &str, options_json: &str) -> Result<String, JsValue> {
    run_aero_simulation(design_json, options_json).map_err(|e| JsValue::from_str(&e))
}

/// Exports the current blade design as a binary STL byte buffer (`Uint8Array` in JS).
#[wasm_bindgen]
pub fn export_stl_bytes(design_json: &str) -> Result<Vec<u8>, JsValue> {
    export_stl(design_json).map_err(|e| JsValue::from_str(&e))
}

/// Exports the current blade design with fabrication overrides (spar hole, split
/// segments, or isolated part) as a binary STL byte buffer (`Uint8Array` in JS).
#[wasm_bindgen]
pub fn export_fabricated_stl_bytes(
    design_json: &str,
    overrides_json: &str,
) -> Result<Vec<u8>, JsValue> {
    let overrides = parse_overrides_json(overrides_json)?;
    export_stl_with_overrides(design_json, &overrides).map_err(|e| JsValue::from_str(&e))
}

/// Reports how many alignment pins / keys fit on each split face for the given
/// fabrication overrides, as a JSON array string.
#[wasm_bindgen]
pub fn fabrication_report(design_json: &str, overrides_json: &str) -> Result<String, JsValue> {
    let overrides = parse_overrides_json(overrides_json)?;
    mesh::fabrication_report_json(design_json, &overrides).map_err(|e| JsValue::from_str(&e))
}

/// Exports the current blade design as a 3MF archive byte buffer (`Uint8Array` in JS).
#[wasm_bindgen]
pub fn export_3mf_bytes(design_json: &str) -> Result<Vec<u8>, JsValue> {
    export_3mf(design_json).map_err(|e| JsValue::from_str(&e))
}

/// Exports the current blade design with fabrication overrides (spar hole, split
/// segments, or isolated part) as a 3MF archive byte buffer (`Uint8Array` in JS).
#[wasm_bindgen]
pub fn export_fabricated_3mf_bytes(
    design_json: &str,
    overrides_json: &str,
) -> Result<Vec<u8>, JsValue> {
    let overrides = parse_overrides_json(overrides_json)?;
    export_3mf_with_overrides(design_json, &overrides).map_err(|e| JsValue::from_str(&e))
}

#[cfg(test)]
mod tests {
    use super::*;

    const LINEAR_FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

    #[test]
    fn run_aero_simulation_returns_sweep_and_generator_match() {
        let json = run_aero_simulation(
            LINEAR_FIXTURE,
            r#"{"tsr_min": 2.0, "tsr_max": 8.0, "tsr_steps": 13, "generator_kv": 35.0, "generator_r_int": 0.8, "generator_r_load": 5.0}"#,
        )
        .expect("aero simulation should succeed");
        let bundle: AeroSimulationBundle =
            serde_json::from_str(&json).expect("valid AeroSimulationBundle JSON");
        assert!(bundle.design_point.cp > 0.25 && bundle.design_point.cp < 0.593);
        assert!(bundle.sweep.len() >= 13);
        assert!(bundle.peak_cp >= bundle.design_point.cp);
        let gen = bundle.generator_match.expect("generator match present");
        assert!(gen.tip_speed_ratio > 0.0);
        assert!(gen.generator.terminal_voltage_v > 0.0);
        assert!(gen.generator.electrical_power_w > 0.0);
    }
}
