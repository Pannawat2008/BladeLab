//! Core blade pipeline for the browser: design JSON → closed triangle mesh.
//!
//! This module is intentionally free of `wasm-bindgen` so the whole pipeline
//! can be unit-tested on the host and stays independent of JS tooling. The
//! thin wasm bindings live in `lib.rs`.

use blade_cad::{assembly_mesh, hub_mesh, CadKernel, Solid, TruckKernel};
use blade_geom::{build_sections, loft, BladeSurface, Point3, Section3D};
use blade_mesh::{
    alignment_report, check_mesh, compute_split_spans, spar_tube_axis_points,
    tessellate_fabricated, write_3mf, write_stl, AlignmentShape, AlignmentSpec, FabricationSpec,
    Mesh, SparHoleSpec,
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
    /// Optional planned coaxial carbon-fiber tube axis
    /// `[x_start, y_start, z_start, x_end, y_end, z_end, radius_mm]`.
    pub tube_axis: Option<[f64; 7]>,
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
    /// Carbon tube bore fit tolerance added to the bore diameter in mm.
    pub spar_hole_tolerance_mm: Option<f64>,
    /// Alignment feature shape on split faces: `"round"` or `"key"` (absent = none).
    pub align_shape: Option<String>,
    /// Alignment features per split face (`1` or `2`).
    pub align_count: Option<usize>,
    /// Pin diameter / key width in mm.
    pub align_size_mm: Option<f64>,
    /// Key length along the chord in mm.
    pub align_key_length_mm: Option<f64>,
    /// Pin height above the split face in mm.
    pub align_height_mm: Option<f64>,
    /// Distance from the tube / core center to each pin in mm (`<= 0` = auto).
    pub align_spacing_mm: Option<f64>,
    /// Per-side socket clearance in mm.
    pub align_clearance_mm: Option<f64>,
    /// Extra socket depth beyond the pin height in mm.
    pub align_depth_clearance_mm: Option<f64>,
    /// Minimum wall between a socket and the airfoil skin in mm.
    pub align_min_wall_mm: Option<f64>,
    /// Optional STEP export mode: `"smooth"` or `"features"` / `"fabricated"`.
    pub step_mode: Option<String>,
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
                tolerance_mm: self.spar_hole_tolerance_mm.unwrap_or(0.0).max(0.0),
            }),
            _ => None,
        };
        let shape = match self.align_shape.as_deref() {
            Some("round") => Some(AlignmentShape::Round),
            Some("key") => Some(AlignmentShape::Key),
            Some("dovetail") | Some("interlock") => Some(AlignmentShape::Dovetail),
            Some("cruciform") | Some("cross") => Some(AlignmentShape::Cruciform),
            Some("tapered") | Some("wedge") => Some(AlignmentShape::Tapered),
            Some("snaplock") | Some("snap") => Some(AlignmentShape::SnapLock),
            Some("contour") | Some("lip") | Some("airfoil") => Some(AlignmentShape::AirfoilLip),
            _ => None,
        };
        let defaults = AlignmentSpec::default();
        let alignment = shape.map(|shape| AlignmentSpec {
            shape,
            count: self.align_count.unwrap_or(defaults.count).clamp(1, 2),
            size_mm: self.align_size_mm.unwrap_or(defaults.size_mm),
            key_length_mm: self.align_key_length_mm.unwrap_or(defaults.key_length_mm),
            height_mm: self.align_height_mm.unwrap_or(defaults.height_mm),
            spacing_mm: self.align_spacing_mm.unwrap_or(defaults.spacing_mm),
            clearance_mm: self.align_clearance_mm.unwrap_or(defaults.clearance_mm),
            depth_clearance_mm: self
                .align_depth_clearance_mm
                .unwrap_or(defaults.depth_clearance_mm),
            min_wall_mm: self.align_min_wall_mm.unwrap_or(defaults.min_wall_mm),
        });
        FabricationSpec {
            spar_hole,
            split_parts: self.split_parts.unwrap_or(1).clamp(1, 8),
            split_ratio: self.split_ratio,
            active_part: self.active_part,
            explode_gap_mm: self.explode_gap_mm.unwrap_or(0.0),
            alignment,
        }
    }
}

/// Reports how many alignment pins / keys fit on each split face as JSON
/// (`[{"span_mm":..,"requested":..,"placed":..,"pin_height_mm":..,"socket_depth_mm":..}]`).
pub fn fabrication_report_json(design_json: &str, overrides: &Overrides) -> Result<String, String> {
    let design = Design::from_json(design_json).map_err(as_string)?;
    let blade = resolve(&design).map_err(as_string)?;
    let sections = build_sections(&blade).map_err(as_string)?;
    let surface = loft(&sections).map_err(as_string)?;
    let reports = alignment_report(&surface, &overrides.fabrication_spec()).map_err(as_string)?;
    let rows: Vec<String> = reports
        .iter()
        .map(|r| {
            format!(
                "{{\"span_mm\":{:.3},\"requested\":{},\"placed\":{},\"pin_height_mm\":{:.3},\"socket_depth_mm\":{:.3}}}",
                r.span_mm, r.requested, r.placed, r.pin_height_mm, r.socket_depth_mm
            )
        })
        .collect();
    Ok(format!("[{}]", rows.join(",")))
}

/// Runs the full `Design → resolve → build_sections → loft → tessellate`
/// pipeline and returns indexed triangle data.
///
/// # Errors
///
/// Returns a human-readable message (as `String`) when the JSON is invalid,
/// an override produces an unbuildable design, or the geometry is degenerate.
pub fn build_mesh(design_json: &str, overrides: &Overrides) -> Result<MeshOutput, String> {
    let (mesh, tube_axis) = build_validated_blade_mesh_and_axis(design_json, overrides)?;
    let mut out = output(&mesh);
    out.tube_axis = tube_axis;
    Ok(out)
}

/// Builds a validated watertight blade [`Mesh`] from `design_json` and [`Overrides`].
pub fn build_validated_blade_mesh_with_overrides(
    design_json: &str,
    overrides: &Overrides,
) -> Result<Mesh, String> {
    Ok(build_validated_blade_mesh_and_axis(design_json, overrides)?.0)
}

fn build_validated_blade_mesh_and_axis(
    design_json: &str,
    overrides: &Overrides,
) -> Result<(Mesh, Option<[f64; 7]>), String> {
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
    let tube_axis = spar_tube_axis_points(&surface, &fab).map_err(as_string)?;
    let mesh = tessellate_fabricated(&surface, &fab).map_err(as_string)?;
    let report = check_mesh(&mesh);
    if !report.is_valid_solid() {
        return Err("generated blade mesh is not a valid watertight solid".into());
    }
    Ok((mesh, tube_axis))
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

/// Builds B-rep solids for split segments (either a single active part or all parts)
/// including carbon-fiber spar hole cavities and interlocking joint features.
/// Slices the lofted blade surface into a sub-span `[z_a, z_b]` and builds a smooth B-spline surface.
fn build_segment_surface(
    surface: &BladeSurface,
    z_a: f64,
    z_b: f64,
    z_shift: f64,
) -> Result<BladeSurface, String> {
    const SEG_STATIONS: usize = 14;
    let span_min = surface.span_start_mm();
    let span_max = surface.span_end_mm();
    let point_count = surface.point_count();

    let mut sections = Vec::with_capacity(SEG_STATIONS);
    for i in 0..SEG_STATIONS {
        let t = (i as f64) / ((SEG_STATIONS - 1) as f64);
        let z = z_a + t * (z_b - z_a);
        let z_eval = z.clamp(span_min, span_max);
        let mut points = Vec::with_capacity(point_count);
        for idx in 0..point_count {
            let pt = surface.point_at_span_mm(z_eval, idx).map_err(as_string)?;
            let p = Point3::new(pt.x, pt.y, z + z_shift).map_err(as_string)?;
            points.push(p);
        }
        let sec = Section3D::new(z + z_shift, points).map_err(as_string)?;
        sections.push(sec);
    }
    loft(&sections).map_err(as_string)
}

/// Builds B-rep solids for split segments (either a single active part or all parts).
///
/// In smooth mode (default for standard CAD), each segment is built as a pure, mathematically
/// continuous B-spline solid (`B_SPLINE_SURFACE_WITH_KNOTS`) with zero facet ripples or seams.
///
/// In features/fabricated mode (when spar hole or alignment joints are enabled and step_mode is
/// `"features"` / `"fabricated"`), segments include internal spar tube bore cavities and
/// mating interlocking joint features (spigot/socket/pins/keys/lips).
fn build_split_solids(
    surface: &BladeSurface,
    overrides: &Overrides,
    kernel: &TruckKernel,
) -> Result<Vec<Solid>, String> {
    let fab = overrides.fabrication_spec();
    let parts = fab.split_parts.clamp(1, 8);
    let span_start = surface.span_start_mm();
    let span_end = surface.span_end_mm();
    let split_spans = compute_split_spans(span_start, span_end, parts, fab.split_ratio);

    let part_range: std::ops::Range<usize> = match fab.active_part {
        Some(idx) if idx < parts => idx..(idx + 1),
        _ => 0..parts,
    };

    let explode_gap = if fab.active_part.is_none() && parts > 1 {
        fab.explode_gap_mm.max(0.0)
    } else {
        0.0
    };

    let has_fab_components = fab.spar_hole.is_some() || fab.alignment.is_some();
    let mode = overrides.step_mode.as_deref().unwrap_or("auto");
    let use_smooth_bspline =
        mode == "smooth" || (!has_fab_components && mode != "features" && mode != "fabricated");

    let mut solids = Vec::with_capacity(part_range.len());
    for part_idx in part_range {
        let z_shift = (part_idx as f64) * explode_gap;
        if use_smooth_bspline {
            let z_a = split_spans[part_idx];
            let z_b = split_spans[part_idx + 1];
            let seg_surf = build_segment_surface(surface, z_a, z_b, z_shift)?;
            let solid = kernel.blade_solid(&seg_surf).map_err(as_string)?;
            solids.push(solid);
        } else {
            let mut part_spec = fab;
            part_spec.active_part = Some(part_idx);
            part_spec.explode_gap_mm = z_shift;

            let part_mesh = tessellate_fabricated(surface, &part_spec).map_err(as_string)?;
            let solid = kernel.mesh_solid(&part_mesh).map_err(as_string)?;
            solids.push(solid);
        }
    }
    Ok(solids)
}

/// Exports the design with overrides as an ISO 10303-21 STEP B-rep string (`.step`).
///
/// Supported `part` options:
/// - `"blade"`: exports the blade (or split segment if `active_part` is set, or all split solids)
/// - `"hub"`: exports the hub solid
/// - `"assembly"`: exports the blade solid(s) and hub solid
/// - `"split"` / `"split_all"`: exports all split segment solids as a multi-solid STEP
/// - `"blade_part_<N>"` / `"split_part_<N>"`: exports the specific 0-based split part solid
pub fn export_step_with_overrides(
    design_json: &str,
    overrides: &Overrides,
    part: &str,
) -> Result<String, String> {
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

    let resolved = resolve(&design).map_err(as_string)?;
    let kernel = TruckKernel::new();
    let part_norm = part.trim().to_ascii_lowercase();

    let bodies = match part_norm.as_str() {
        "hub" => vec![kernel.hub_solid(&resolved.hub).map_err(as_string)?],
        "assembly" => {
            let sections = build_sections(&resolved).map_err(as_string)?;
            let surface = loft(&sections).map_err(as_string)?;
            let mut solids = if overrides.split_parts.unwrap_or(1) > 1 {
                build_split_solids(&surface, overrides, &kernel)?
            } else {
                vec![kernel.blade_solid(&surface).map_err(as_string)?]
            };
            solids.push(kernel.hub_solid(&resolved.hub).map_err(as_string)?);
            solids
        }
        "split" | "split_all" | "blade_split" => {
            let sections = build_sections(&resolved).map_err(as_string)?;
            let surface = loft(&sections).map_err(as_string)?;
            let mut split_overrides = overrides.clone();
            if split_overrides.split_parts.unwrap_or(1) < 2 {
                split_overrides.split_parts = Some(2);
            }
            split_overrides.active_part = None;
            build_split_solids(&surface, &split_overrides, &kernel)?
        }
        "" | "blade" => {
            let sections = build_sections(&resolved).map_err(as_string)?;
            let surface = loft(&sections).map_err(as_string)?;
            if overrides.split_parts.unwrap_or(1) > 1 {
                build_split_solids(&surface, overrides, &kernel)?
            } else {
                vec![kernel.blade_solid(&surface).map_err(as_string)?]
            }
        }
        other => {
            if let Some(idx_str) = other
                .strip_prefix("blade_part_")
                .or_else(|| other.strip_prefix("split_part_"))
            {
                let idx: usize = idx_str
                    .parse()
                    .map_err(|_| format!("invalid split part index `{idx_str}`"))?;
                let sections = build_sections(&resolved).map_err(as_string)?;
                let surface = loft(&sections).map_err(as_string)?;
                let mut part_overrides = overrides.clone();
                let split_parts = part_overrides.split_parts.unwrap_or(1).max(idx + 1);
                part_overrides.split_parts = Some(split_parts);
                part_overrides.active_part = Some(idx);
                build_split_solids(&surface, &part_overrides, &kernel)?
            } else {
                return Err(format!(
                    "unsupported part `{other}` for STEP export (expected 'blade', 'hub', 'assembly', 'split', or 'blade_part_<N>')"
                ));
            }
        }
    };
    kernel.write_step(&bodies).map_err(as_string)
}

/// Exports the design as an ISO 10303-21 STEP B-rep string (`.step`).
///
/// Supported `part` options: `"blade"` (default), `"hub"`, `"assembly"`, `"split"`, or `"blade_part_<N>"`.
pub fn export_step(design_json: &str, part: &str) -> Result<String, String> {
    export_step_with_overrides(design_json, &Overrides::default(), part)
}

/// Exports all split segments as a multi-solid ISO 10303-21 STEP B-rep string (`.step`).
pub fn export_split_step(design_json: &str, overrides: &Overrides) -> Result<String, String> {
    export_step_with_overrides(design_json, overrides, "split")
}

/// Exports a specific part (`"blade"`, `"hub"`, or `"assembly"`) as binary STL bytes.
pub fn export_part_stl(design_json: &str, part: &str) -> Result<Vec<u8>, String> {
    let design = Design::from_json(design_json).map_err(as_string)?;
    let resolved = resolve(&design).map_err(as_string)?;
    let part_norm = part.trim().to_ascii_lowercase();
    let mesh = match part_norm.as_str() {
        "" | "blade" => build_validated_blade_mesh(design_json)?,
        "hub" => {
            let m = hub_mesh(&resolved.hub).map_err(as_string)?;
            let report = check_mesh(&m);
            if !report.is_valid_solid() {
                return Err("generated hub mesh is not a valid watertight solid".into());
            }
            m
        }
        "assembly" => {
            let sections = build_sections(&resolved).map_err(as_string)?;
            let surface = loft(&sections).map_err(as_string)?;
            let m = assembly_mesh(&surface, &resolved.hub).map_err(as_string)?;
            let report = check_mesh(&m);
            if !report.is_valid_solid() {
                return Err("generated assembly mesh is not a valid watertight solid".into());
            }
            m
        }
        other => {
            return Err(format!(
                "unsupported part `{other}` for STL export (expected 'blade', 'hub', or 'assembly')"
            ))
        }
    };
    Ok(write_stl(&mesh))
}

/// Exports a specific part (`"blade"`, `"hub"`, or `"assembly"`) as a 3MF archive.
pub fn export_part_3mf(design_json: &str, part: &str) -> Result<Vec<u8>, String> {
    let design = Design::from_json(design_json).map_err(as_string)?;
    let resolved = resolve(&design).map_err(as_string)?;
    let part_norm = part.trim().to_ascii_lowercase();
    let mesh = match part_norm.as_str() {
        "" | "blade" => build_validated_blade_mesh(design_json)?,
        "hub" => {
            let m = hub_mesh(&resolved.hub).map_err(as_string)?;
            let report = check_mesh(&m);
            if !report.is_valid_solid() {
                return Err("generated hub mesh is not a valid watertight solid".into());
            }
            m
        }
        "assembly" => {
            let sections = build_sections(&resolved).map_err(as_string)?;
            let surface = loft(&sections).map_err(as_string)?;
            let m = assembly_mesh(&surface, &resolved.hub).map_err(as_string)?;
            let report = check_mesh(&m);
            if !report.is_valid_solid() {
                return Err("generated assembly mesh is not a valid watertight solid".into());
            }
            m
        }
        other => {
            return Err(format!(
                "unsupported part `{other}` for 3MF export (expected 'blade', 'hub', or 'assembly')"
            ))
        }
    };
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
        tube_axis: None,
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

    #[test]
    fn step_export_blade_hub_and_assembly() {
        let step_blade = export_step(FIXTURE, "blade").expect("blade step export succeeds");
        assert!(step_blade.contains("MANIFOLD_SOLID_BREP"));
        assert!(step_blade.contains("SI_UNIT(.MILLI.,.METRE.)"));

        let step_hub = export_step(FIXTURE, "hub").expect("hub step export succeeds");
        assert!(step_hub.contains("MANIFOLD_SOLID_BREP"));

        let step_assembly =
            export_step(FIXTURE, "assembly").expect("assembly step export succeeds");
        assert!(step_assembly.contains("MANIFOLD_SOLID_BREP"));
    }

    #[test]
    fn step_export_split_segments() {
        let overrides_split = Overrides {
            split_parts: Some(3),
            split_ratio: Some(0.35),
            explode_gap_mm: Some(15.0),
            ..Overrides::default()
        };

        // All 3 split segments exported as multi-solid STEP
        let step_all = export_split_step(FIXTURE, &overrides_split).expect("split STEP export");
        assert!(step_all.contains("MANIFOLD_SOLID_BREP"));
        // Multi-solid STEP should contain 3 MANIFOLD_SOLID_BREP entries
        assert_eq!(
            step_all.matches("MANIFOLD_SOLID_BREP").count(),
            3,
            "expected 3 B-rep solids for 3 split parts"
        );

        // Individual split segments exported via part naming or active_part override
        let step_p0 = export_step_with_overrides(
            FIXTURE,
            &Overrides {
                active_part: Some(0),
                ..overrides_split.clone()
            },
            "blade",
        )
        .expect("part 0 step export");
        assert_eq!(step_p0.matches("MANIFOLD_SOLID_BREP").count(), 1);

        let step_p1 = export_step(FIXTURE, "blade_part_1").expect("blade_part_1 export");
        assert_eq!(step_p1.matches("MANIFOLD_SOLID_BREP").count(), 1);

        // Split segments with carbon-fiber tube hole and interlocking joint features
        let overrides_fab = Overrides {
            split_parts: Some(2),
            split_ratio: Some(0.5),
            spar_hole_diameter_mm: Some(6.0),
            spar_hole_depth_mm: Some(240.0),
            align_shape: Some("lip".to_string()),
            ..Overrides::default()
        };
        let step_part0_fab = export_step_with_overrides(
            FIXTURE,
            &Overrides {
                active_part: Some(0),
                ..overrides_fab.clone()
            },
            "blade",
        )
        .expect("part 0 step with tube and joint");
        assert!(step_part0_fab.contains("MANIFOLD_SOLID_BREP"));
        eprintln!("PLANE count = {}", step_part0_fab.matches("PLANE").count());
        assert!(
            step_part0_fab.matches("PLANE").count() > 500,
            "part 0 STEP must include tube hole bore and interlocking lip faces"
        );

        let step_part1_fab = export_step_with_overrides(
            FIXTURE,
            &Overrides {
                active_part: Some(1),
                ..overrides_fab.clone()
            },
            "blade",
        )
        .expect("part 1 step with tube and joint");
        assert!(step_part1_fab.contains("MANIFOLD_SOLID_BREP"));
        assert!(
            step_part1_fab.matches("PLANE").count() > 500,
            "part 1 STEP must include tube hole bore and interlocking socket faces"
        );
    }

    #[test]
    fn part_stl_and_3mf_export() {
        let stl_asm = export_part_stl(FIXTURE, "assembly").expect("assembly stl export");
        assert!(stl_asm.len() > 84);

        let threemf_asm = export_part_3mf(FIXTURE, "assembly").expect("assembly 3mf export");
        assert!(threemf_asm.starts_with(b"PK"));
    }
}
