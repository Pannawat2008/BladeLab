//! Core blade pipeline for the browser: design JSON → closed triangle mesh.
//!
//! This module is intentionally free of `wasm-bindgen` so the whole pipeline
//! can be unit-tested on the host and stays independent of JS tooling. The
//! thin wasm bindings live in `lib.rs`.

use blade_geom::{build_sections, loft};
use blade_mesh::{tessellate, Mesh, MeshOptions};
use blade_model::{resolve, CurveSource, Design};

/// A ready-to-render triangle mesh in millimetres.
#[derive(Debug, Clone, PartialEq)]
pub struct MeshOutput {
    /// Interleaved `x, y, z` vertex coordinates (from this order, `.len()` is
    /// exactly `3 × vertex_count`).
    pub positions: Vec<f32>,
    /// Triangle indices into [`MeshOutput::positions`], three per triangle.
    pub indices: Vec<u32>,
    /// Number of vertices.
    pub vertex_count: usize,
    /// Number of triangles.
    pub triangle_count: usize,
    /// Signed volume of the closed mesh in mm³ (positive for outward winding).
    pub volume_mm3: f64,
    /// Lowest z coordinate in mm (root radius).
    pub span_min_mm: f64,
    /// Highest z coordinate in mm (tip radius).
    pub span_max_mm: f64,
}

/// Live-edit overrides for the design, applied before the pipeline runs.
///
/// Each override only touches the matching **layer-1/linear** distribution
/// (layer-3 per-station overrides in the JSON keep winning), so the browser
/// can offer sliders without editing the schema or the core crates.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct Overrides {
    /// Replace the chord tip value (mm) of a linear chord distribution.
    pub tip_chord_mm: Option<f64>,
    /// Replace the twist tip value (deg) of a linear twist distribution.
    pub tip_twist_deg: Option<f64>,
    /// Replace the number of resolved cross-sections.
    pub station_count: Option<u32>,
}

/// Runs the full `Design → resolve → build_sections → loft → tessellate`
/// pipeline and returns indexed triangle data.
///
/// # Errors
///
/// Returns a human-readable message (as `String`) when the JSON is invalid,
/// an override produces an unbuildable design, or the geometry is degenerate.
pub fn build_mesh(design_json: &str, overrides: &Overrides) -> Result<MeshOutput, String> {
    let mut design = Design::from_json(design_json).map_err(as_string)?;
    if let Some(chord) = overrides.tip_chord_mm {
        design.distributions.chord_mm = with_tip_value(design.distributions.chord_mm, chord);
    }
    if let Some(twist) = overrides.tip_twist_deg {
        design.distributions.twist_deg = with_tip_value(design.distributions.twist_deg, twist);
    }
    if let Some(stations) = overrides.station_count {
        design.rotor.station_count = stations;
    }

    let blade = resolve(&design).map_err(as_string)?;
    let sections = build_sections(&blade).map_err(as_string)?;
    let surface = loft(&sections).map_err(as_string)?;
    let mesh = tessellate(&surface, &MeshOptions { cap_ends: true }).map_err(as_string)?;
    Ok(output(&mesh))
}

fn output(mesh: &Mesh) -> MeshOutput {
    let mut positions = Vec::with_capacity(mesh.vertices.len() * 3);
    let mut span_min_mm = f64::INFINITY;
    let mut span_max_mm = f64::NEG_INFINITY;
    for point in &mesh.vertices {
        positions.push(point.x as f32);
        positions.push(point.y as f32);
        positions.push(point.z as f32);
        span_min_mm = span_min_mm.min(point.z);
        span_max_mm = span_max_mm.max(point.z);
    }

    let indices = mesh
        .triangles
        .iter()
        .flat_map(|triangle| triangle.indices())
        .collect();

    MeshOutput {
        positions,
        indices,
        vertex_count: mesh.vertex_count(),
        triangle_count: mesh.triangle_count(),
        volume_mm3: mesh.signed_volume_mm3(),
        span_min_mm,
        span_max_mm,
    }
}

fn with_tip_value(source: CurveSource, tip: f64) -> CurveSource {
    match source {
        CurveSource::Linear { root, .. } => CurveSource::Linear { root, tip },
        other => other,
    }
}

fn as_string(error: impl std::fmt::Display) -> String {
    error.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

    #[test]
    fn fixture_mesh_matches_the_stl_numbers() {
        let mesh = build_mesh(FIXTURE, &Overrides::default()).expect("pipeline runs");
        assert_eq!(mesh.vertex_count, 1771, "11 × 161 contour points");
        assert_eq!(
            mesh.triangle_count, 3538,
            "matches the STL export (F-geom1-009)"
        );
        assert_eq!(mesh.positions.len(), mesh.vertex_count * 3);
        assert_eq!(mesh.indices.len(), mesh.triangle_count * 3);
        assert!(
            (mesh.volume_mm3 - 126_493.7).abs() < 1.0,
            "matches the STL volume"
        );
        assert!(mesh.span_min_mm > 59.9 && mesh.span_min_mm < 60.1, "root z");
        assert!(
            mesh.span_max_mm > 599.9 && mesh.span_max_mm < 600.1,
            "tip z"
        );
    }

    #[test]
    fn tip_overrides_change_the_geometry() {
        let baseline = build_mesh(FIXTURE, &Overrides::default()).expect("pipeline runs");
        let wide = build_mesh(
            FIXTURE,
            &Overrides {
                tip_chord_mm: Some(70.0),
                ..Overrides::default()
            },
        )
        .expect("pipeline runs");
        // The distribution tip feeds every station except the fixture's
        // layer-3 tip override (L-geom1-004), so a wider distribution chord
        // must clearly enlarge the solid.
        assert!(
            wide.volume_mm3 > baseline.volume_mm3 * 1.05,
            "a wider distribution chord must enlarge the solid"
        );

        let flat = build_mesh(
            FIXTURE,
            &Overrides {
                tip_twist_deg: Some(0.0),
                ..Overrides::default()
            },
        )
        .expect("pipeline runs");
        assert_ne!(
            flat.positions, baseline.positions,
            "the twist override must change the resulting mesh"
        );
    }

    #[test]
    fn station_count_override_is_respected() {
        let fine = build_mesh(
            FIXTURE,
            &Overrides {
                station_count: Some(41),
                ..Overrides::default()
            },
        )
        .expect("pipeline runs");
        assert_eq!(fine.vertex_count, 41 * 161, "41 sections × 161 points");
    }

    #[test]
    fn bad_json_is_a_message_not_a_panic() {
        let error = build_mesh("{nope", &Overrides::default()).expect_err("invalid JSON fails");
        assert!(!error.is_empty());
    }
}
