//! Core blade pipeline for the browser: design JSON → closed triangle mesh.
//!
//! This module is intentionally free of `wasm-bindgen` so the whole pipeline
//! can be unit-tested on the host and stays independent of JS tooling. The
//! thin wasm bindings live in `lib.rs`.

use blade_geom::{build_sections, loft};
use blade_mesh::{
    check_mesh, tessellate_fabricated, write_3mf, write_stl, FabricationSpec, Mesh, SparHoleSpec,
};
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
    /// Optional carbon-fiber spar tube hole diameter at the blade root base in mm.
    pub spar_hole_diameter_mm: Option<f64>,
    /// Optional carbon-fiber spar tube hole depth along the blade span in mm.
    pub spar_hole_depth_mm: Option<f64>,
    /// Optional chordwise offset of the spar hole from the root core center in mm.
    pub spar_hole_offset_x_mm: Option<f64>,
    /// Optional thickness-direction offset of the spar hole from the root core center in mm.
    pub spar_hole_offset_y_mm: Option<f64>,
    /// Number of spanwise printable segments (`1..=8`, `1` = unsplit).
    pub split_parts: Option<usize>,
    /// Optional split span ratio in `[0.12, 0.88]` for 2+ part splits.
    pub split_ratio: Option<f64>,
    /// Optional 0-based segment index (`0..split_parts`) to isolate a single part.
    pub active_part: Option<usize>,
    /// Optional exploded preview/export gap in mm along `+z` between split segments.
    pub explode_gap_mm: Option<f64>,
}

impl Overrides {
    /// Converts the fabrication fields on [`Overrides`] into a [`FabricationSpec`].
    #[must_use]
    pub fn fabrication_spec(&self) -> FabricationSpec {
        let spar_hole = match (self.spar_hole_diameter_mm, self.spar_hole_depth_mm) {
            (Some(d), Some(depth)) if d > 0.1 && depth > 0.1 => Some(SparHoleSpec {
                diameter_mm: d,
                depth_mm: depth,
                offset_x_mm: self.spar_hole_offset_x_mm.unwrap_or(0.0),
                offset_y_mm: self.spar_hole_offset_y_mm.unwrap_or(0.0),
            }),
            _ => None,
        };
        FabricationSpec {
            spar_hole,
            split_parts: self.split_parts.unwrap_or(1).clamp(1, 8),
            split_ratio: self.split_ratio,
            active_part: self.active_part,
            explode_gap_mm: self.explode_gap_mm.unwrap_or(0.0),
        }
    }
}

/// Runs the full `Design → resolve → build_sections → loft → tessellate`
/// pipeline and returns indexed triangle data.
///
/// # Errors
///
/// Returns a human-readable message (as `String`) when the JSON is invalid,
/// an override produces an unbuildable design, or the geometry is degenerate.
pub fn build_mesh(design_json: &str, overrides: &Overrides) -> Result<MeshOutput, String> {
    let mesh = build_validated_blade_mesh_with_overrides(design_json, overrides)?;
    Ok(output(&mesh))
}

/// Builds a validated watertight blade [`Mesh`] from `design_json` and [`Overrides`].
pub fn build_validated_blade_mesh_with_overrides(
    design_json: &str,
    overrides: &Overrides,
) -> Result<Mesh, String> {
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
    let fab = overrides.fabrication_spec();
    let mesh = tessellate_fabricated(&surface, &fab).map_err(as_string)?;
    let report = check_mesh(&mesh);
    if !report.is_valid_solid() {
        return Err("generated blade mesh is not a valid watertight solid".into());
    }
    Ok(mesh)
}

/// Builds a validated watertight blade [`Mesh`] from `design_json`.
pub fn build_validated_blade_mesh(design_json: &str) -> Result<Mesh, String> {
    build_validated_blade_mesh_with_overrides(design_json, &Overrides::default())
}

/// Serializes the blade mesh to binary STL bytes (`84 + 50 × tris`).
pub fn export_stl(design_json: &str) -> Result<Vec<u8>, String> {
    let mesh = build_validated_blade_mesh(design_json)?;
    Ok(write_stl(&mesh))
}

/// Serializes the blade mesh (with fabrication overrides) to binary STL bytes.
pub fn export_stl_with_overrides(
    design_json: &str,
    overrides: &Overrides,
) -> Result<Vec<u8>, String> {
    let mesh = build_validated_blade_mesh_with_overrides(design_json, overrides)?;
    Ok(write_stl(&mesh))
}

/// Serializes the blade mesh to a 3MF archive (`.3mf` OPC ZIP in mm units).
pub fn export_3mf(design_json: &str) -> Result<Vec<u8>, String> {
    let mesh = build_validated_blade_mesh(design_json)?;
    Ok(write_3mf(&mesh))
}

/// Serializes the blade mesh (with fabrication overrides) to a 3MF archive.
pub fn export_3mf_with_overrides(
    design_json: &str,
    overrides: &Overrides,
) -> Result<Vec<u8>, String> {
    let mesh = build_validated_blade_mesh_with_overrides(design_json, overrides)?;
    Ok(write_3mf(&mesh))
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
