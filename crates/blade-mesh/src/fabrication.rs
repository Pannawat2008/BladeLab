//! Fabrication geometry helpers: base carbon-fiber spar tube hole and spanwise
//! model splitting into printable segments.
//!
//! All geometry is constructed directly from [`blade_geom::BladeSurface`] using
//! parametric section evaluation and 2D ear-clipping (`triangulate_cap`), with
//! zero mesh boolean CSG (`D-lead1-005`) and full `wasm32` compatibility.

use std::f64::consts::PI;

use blade_geom::{BladeSurface, Point3};

use crate::error::MeshError;
use crate::mesh::{Mesh, Triangle};
use crate::tessellate::{tessellate, triangulate_cap, MeshOptions};

/// Number of circumferential vertices on the carbon-fiber tube hole circle.
/// Must be a multiple of 4 so `M / 4` and `3 * M / 4` land on the `+y'` and
/// `-y'` thickness axes.
const HOLE_CIRCLE_SEGMENTS: usize = 32;

/// Minimum spanwise station count per split segment.
const MIN_SEGMENT_STATIONS: usize = 5;

/// Specification for a cylindrical hole entering from the blade root base
/// (`z = span_start_mm`) to receive a carbon-fiber spar tube or rod.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SparHoleSpec {
    /// Target hole diameter in mm (`> 0`). Automatically clamped per station to
    /// stay strictly inside the local airfoil skin.
    pub diameter_mm: f64,
    /// Depth of the hole along the blade span from the root base in mm (`> 0`).
    pub depth_mm: f64,
    /// Optional chordwise offset from the root thickest-core center in mm.
    pub offset_x_mm: f64,
    /// Optional thickness-direction offset from the root thickest-core center in mm.
    pub offset_y_mm: f64,
}

/// Specification for spanwise blade splitting and carbon-fiber tube hole
/// fabrication.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct FabricationSpec {
    /// Optional carbon-fiber tube hole entering at the blade root base.
    pub spar_hole: Option<SparHoleSpec>,
    /// Number of spanwise printable segments (`1..=8`, `1` = unsplit full blade).
    pub split_parts: usize,
    /// Optional primary split span ratio in `[0.15, 0.85]` for 2-part splits
    /// (or first split plane when `split_parts >= 2`).
    pub split_ratio: Option<f64>,
    /// Optional 0-based segment index (`0..split_parts`) to isolate a single
    /// printable part. `None` outputs all segments.
    pub active_part: Option<usize>,
    /// Visual/export separation gap in mm along `+z` between segments when
    /// `active_part` is `None` and `split_parts > 1`.
    pub explode_gap_mm: f64,
}

impl Default for FabricationSpec {
    fn default() -> Self {
        Self {
            spar_hole: None,
            split_parts: 1,
            split_ratio: None,
            active_part: None,
            explode_gap_mm: 0.0,
        }
    }
}

/// Finds the maximum-thickness interior station of a 3D airfoil section.
///
/// Returns `(center, thickness_mm, upper_index, lower_index)`.
#[must_use]
pub fn section_core_station(section: &[Point3]) -> (Point3, f64, usize, usize) {
    let n = section.len();
    let n_le = n / 2;
    let mut best_d = (n_le / 3).max(1);
    let mut best_thickness = 0.0_f64;

    // Search chordwise stations between ~10% and ~65% of the contour half-length
    // around the thickest core of the airfoil.
    let d_min = (n_le / 8).max(1);
    let d_max = ((n_le * 3) / 4).max(d_min + 1).min(n_le.saturating_sub(1));
    for d in d_min..=d_max {
        let upper = section[n_le - d];
        let lower = section[n_le + d];
        let dist = upper.distance_to(&lower);
        if dist > best_thickness {
            best_thickness = dist;
            best_d = d;
        }
    }

    let upper_idx = n_le - best_d;
    let lower_idx = n_le + best_d;
    let upper = section[upper_idx];
    let lower = section[lower_idx];
    let center = Point3 {
        x: 0.5 * (upper.x + lower.x),
        y: 0.5 * (upper.y + lower.y),
        z: 0.5 * (upper.z + lower.z),
    };
    (center, best_thickness, upper_idx, lower_idx)
}

/// Evaluates all contour points of `surface` at spanwise position `span_mm`.
fn evaluate_section_at_span(
    surface: &BladeSurface,
    span_mm: f64,
) -> Result<Vec<Point3>, MeshError> {
    let point_count = surface.point_count();
    let mut pts = Vec::with_capacity(point_count);
    for idx in 0..point_count {
        let pt = surface.point_at_span_mm(span_mm, idx)?;
        pts.push(pt);
    }
    Ok(pts)
}

/// Computes the spanwise split plane coordinates `[z_0, z_1, ..., z_K]` in mm.
#[must_use]
pub fn compute_split_spans(
    span_start_mm: f64,
    span_end_mm: f64,
    split_parts: usize,
    split_ratio: Option<f64>,
) -> Vec<f64> {
    let parts = split_parts.clamp(1, 8);
    let total = span_end_mm - span_start_mm;
    if parts == 1 {
        return vec![span_start_mm, span_end_mm];
    }

    let mut bounds = Vec::with_capacity(parts + 1);
    bounds.push(span_start_mm);
    if let Some(r) = split_ratio {
        let r_clamped = r.clamp(0.12, 0.88);
        if parts == 2 {
            bounds.push(span_start_mm + r_clamped * total);
        } else {
            let first = span_start_mm + r_clamped * total;
            bounds.push(first);
            let rem = span_end_mm - first;
            for k in 1..(parts - 1) {
                let frac = (k as f64) / ((parts - 1) as f64);
                bounds.push(first + frac * rem);
            }
        }
    } else {
        for k in 1..parts {
            let frac = (k as f64) / (parts as f64);
            bounds.push(span_start_mm + frac * total);
        }
    }
    bounds.push(span_end_mm);
    bounds
}

/// Tessellates `surface` with optional carbon-fiber base hole and spanwise
/// segment splitting.
///
/// When `spec.spar_hole` is `None` and `spec.split_parts <= 1`, this delegates
/// directly to [`tessellate`] with [`MeshOptions::default`].
///
/// # Errors
///
/// Returns [`MeshError`] if the surface has too few sections/points or cap
/// triangulation fails.
pub fn tessellate_fabricated(
    surface: &BladeSurface,
    spec: &FabricationSpec,
) -> Result<Mesh, MeshError> {
    let active_hole = spec
        .spar_hole
        .filter(|h| h.diameter_mm > 0.1 && h.depth_mm > 0.1);
    let split_parts = spec.split_parts.clamp(1, 8);

    if active_hole.is_none() && split_parts == 1 {
        return tessellate(surface, &MeshOptions::default());
    }

    let span_start = surface.span_start_mm();
    let span_end = surface.span_end_mm();
    let total_span = (span_end - span_start).max(1e-6);

    let split_bounds = compute_split_spans(span_start, span_end, split_parts, spec.split_ratio);

    // Base station spans from the lofted surface.
    let mut base_spans = Vec::with_capacity(surface.section_count());
    for idx in 0..surface.section_count() {
        let p0 = surface.section_at(idx)?[0];
        base_spans.push(p0.z);
    }

    let hole_end_mm = active_hole
        .map(|h| (span_start + h.depth_mm).clamp(span_start + 1.0, span_end))
        .unwrap_or(span_start);

    let mut vertices: Vec<Point3> = Vec::new();
    let mut triangles: Vec<Triangle> = Vec::new();

    let part_range: std::ops::Range<usize> = match spec.active_part {
        Some(idx) if idx < split_parts => idx..(idx + 1),
        _ => 0..split_parts,
    };

    let explode_gap = if spec.active_part.is_none() && split_parts > 1 {
        spec.explode_gap_mm.max(0.0)
    } else {
        0.0
    };

    for part_idx in part_range {
        let z_a = split_bounds[part_idx];
        let z_b = split_bounds[part_idx + 1];
        let z_shift = (part_idx as f64) * explode_gap;

        // Collect all spanwise stations inside [z_a, z_b], including z_a, z_b,
        // and hole_end_mm if a blind hole terminates inside this segment.
        let mut seg_spans = vec![z_a, z_b];
        for &zs in &base_spans {
            if zs > z_a + 1e-4 && zs < z_b - 1e-4 {
                seg_spans.push(zs);
            }
        }
        if active_hole.is_some() && hole_end_mm > z_a + 1e-3 && hole_end_mm < z_b - 1e-3 {
            seg_spans.push(hole_end_mm);
        }
        seg_spans.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        seg_spans.dedup_by(|a, b| (*a - *b).abs() < 1e-3);

        // Ensure at least MIN_SEGMENT_STATIONS stations for smooth lofted skin.
        while seg_spans.len() < MIN_SEGMENT_STATIONS {
            let mut refined = Vec::with_capacity(seg_spans.len() * 2);
            for w in seg_spans.windows(2) {
                refined.push(w[0]);
                refined.push(0.5 * (w[0] + w[1]));
            }
            if let Some(&last) = seg_spans.last() {
                refined.push(last);
            }
            seg_spans = refined;
        }

        let seg_hole = active_hole.and_then(|h| {
            if hole_end_mm > z_a + 1e-3 {
                Some((h, hole_end_mm.min(z_b)))
            } else {
                None
            }
        });

        append_segment_mesh(
            surface,
            &seg_spans,
            z_shift,
            total_span,
            seg_hole,
            &mut vertices,
            &mut triangles,
        )?;
    }

    if vertices.len() > u32::MAX as usize {
        return Err(MeshError::TooManyVertices);
    }
    if triangles.len() > u32::MAX as usize {
        return Err(MeshError::TooManyTriangles);
    }

    Ok(Mesh {
        vertices,
        triangles,
    })
}

/// Appends one closed watertight segment mesh over `seg_spans` into `vertices`
/// and `triangles`.
fn append_segment_mesh(
    surface: &BladeSurface,
    seg_spans: &[f64],
    z_shift: f64,
    _total_span: f64,
    seg_hole: Option<(SparHoleSpec, f64)>,
    vertices: &mut Vec<Point3>,
    triangles: &mut Vec<Triangle>,
) -> Result<(), MeshError> {
    let sec_count = seg_spans.len();
    let point_count = surface.point_count();
    let outer_base = vertices.len();

    let mut sections: Vec<Vec<Point3>> = Vec::with_capacity(sec_count);
    for &z in seg_spans {
        let mut sec = evaluate_section_at_span(surface, z)?;
        for pt in &mut sec {
            pt.z += z_shift;
        }
        for pt in &sec {
            vertices.push(*pt);
        }
        sections.push(sec);
    }

    // Side skin quads between consecutive sections.
    for s in 0..(sec_count - 1) {
        let curr = outer_base + s * point_count;
        let next = outer_base + (s + 1) * point_count;
        for idx in 0..point_count {
            let fol = (idx + 1) % point_count;
            let a = (curr + idx) as u32;
            let b = (curr + fol) as u32;
            let c = (next + fol) as u32;
            let d = (next + idx) as u32;
            triangles.push(Triangle::new(a, b, c));
            triangles.push(Triangle::new(a, c, d));
        }
    }

    let Some((hole_spec, z_hole_top)) = seg_hole else {
        // Solid bottom cap (-z normal) and solid top cap (+z normal).
        let bot_tris = triangulate_cap(&sections[0], 0)?;
        for [a, b, c] in bot_tris {
            triangles.push(Triangle::new(
                (outer_base + c) as u32,
                (outer_base + b) as u32,
                (outer_base + a) as u32,
            ));
        }
        let top_start = outer_base + (sec_count - 1) * point_count;
        let top_tris = triangulate_cap(&sections[sec_count - 1], sec_count - 1)?;
        for [a, b, c] in top_tris {
            triangles.push(Triangle::new(
                (top_start + a) as u32,
                (top_start + b) as u32,
                (top_start + c) as u32,
            ));
        }
        return Ok(());
    };

    // Determine which station index corresponds to `z_hole_top`.
    let mut hole_last_sec = 0;
    for (idx, &z) in seg_spans.iter().enumerate() {
        if z <= z_hole_top + 1e-3 {
            hole_last_sec = idx;
        }
    }
    hole_last_sec = hole_last_sec.max(1).min(sec_count - 1);
    let is_through_hole = hole_last_sec == sec_count - 1;

    // Build inner hole rings from section 0 ..= hole_last_sec.
    let mut ring_starts: Vec<usize> = Vec::with_capacity(hole_last_sec + 1);
    let mut hole_bridges: Vec<(usize, usize)> = Vec::with_capacity(hole_last_sec + 1);

    for sec in sections.iter().take(hole_last_sec + 1) {
        let (ring_pts, upper_idx, lower_idx) = build_hole_ring(sec, hole_spec);
        let ring_start = vertices.len();
        vertices.extend_from_slice(&ring_pts);
        ring_starts.push(ring_start);
        hole_bridges.push((upper_idx, lower_idx));
    }

    // 1. Bottom cap at section 0 (-z normal, punctured by ring_starts[0]).
    append_punctured_cap(
        vertices,
        outer_base,
        point_count,
        ring_starts[0],
        hole_bridges[0].0,
        hole_bridges[0].1,
        false,
        0,
        triangles,
    )?;

    // 2. Inner cylindrical bore wall from section 0 .. hole_last_sec.
    // Normals face inward toward the hole axis (`(a, c, b)` and `(a, d, c)`).
    for s in 0..hole_last_sec {
        let r0 = ring_starts[s];
        let r1 = ring_starts[s + 1];
        for k in 0..HOLE_CIRCLE_SEGMENTS {
            let k_next = (k + 1) % HOLE_CIRCLE_SEGMENTS;
            let a = (r0 + k) as u32;
            let b = (r0 + k_next) as u32;
            let c = (r1 + k_next) as u32;
            let d = (r1 + k) as u32;
            triangles.push(Triangle::new(a, c, b));
            triangles.push(Triangle::new(a, d, c));
        }
    }

    // 3. Top of the hole & top of the segment:
    let top_outer_start = outer_base + (sec_count - 1) * point_count;
    if is_through_hole {
        // Hole passes all the way through the top of this segment -> punctured +z cap!
        append_punctured_cap(
            vertices,
            top_outer_start,
            point_count,
            ring_starts[hole_last_sec],
            hole_bridges[hole_last_sec].0,
            hole_bridges[hole_last_sec].1,
            true,
            sec_count - 1,
            triangles,
        )?;
    } else {
        // Blind hole ends inside this segment -> close the top of the bore with a
        // circular disk cap facing -z (`[0, k+1, k]`), and close the segment tip
        // with a normal solid +z airfoil cap.
        let top_ring = ring_starts[hole_last_sec];
        for k in 1..(HOLE_CIRCLE_SEGMENTS - 1) {
            triangles.push(Triangle::new(
                top_ring as u32,
                (top_ring + k + 1) as u32,
                (top_ring + k) as u32,
            ));
        }

        let top_tris = triangulate_cap(&sections[sec_count - 1], sec_count - 1)?;
        for [a, b, c] in top_tris {
            triangles.push(Triangle::new(
                (top_outer_start + a) as u32,
                (top_outer_start + b) as u32,
                (top_outer_start + c) as u32,
            ));
        }
    }

    Ok(())
}

/// Builds the `HOLE_CIRCLE_SEGMENTS`-vertex circle inside `section` and returns
/// `(ring_points, upper_bridge_index, lower_bridge_index)`.
fn build_hole_ring(section: &[Point3], spec: SparHoleSpec) -> (Vec<Point3>, usize, usize) {
    let (core_center, max_thickness, upper_idx, lower_idx) = section_core_station(section);
    let n_le = section.len() / 2;
    let le = section[n_le];
    let te = Point3 {
        x: 0.5 * (section[0].x + section[section.len() - 1].x),
        y: 0.5 * (section[0].y + section[section.len() - 1].y),
        z: core_center.z,
    };
    let theta_axis = (te.y - le.y).atan2(te.x - le.x);

    // Clamp offset and radius so the circle stays strictly inside the local
    // airfoil thickness envelope with at least 18% wall margin on each side.
    let max_safe_radius = (0.38 * max_thickness).max(0.25);
    let radius = (0.5 * spec.diameter_mm).clamp(0.2, max_safe_radius);
    let max_offset = (0.15 * max_thickness).max(0.0);
    let ox = spec.offset_x_mm.clamp(-max_offset, max_offset);
    let oy = spec.offset_y_mm.clamp(-max_offset, max_offset);

    let cx = core_center.x + ox;
    let cy = core_center.y + oy;
    let cz = core_center.z;

    let mut ring = Vec::with_capacity(HOLE_CIRCLE_SEGMENTS);
    for k in 0..HOLE_CIRCLE_SEGMENTS {
        let angle = theta_axis + 2.0 * PI * (k as f64) / (HOLE_CIRCLE_SEGMENTS as f64);
        let (sin_a, cos_a) = angle.sin_cos();
        ring.push(Point3 {
            x: cx + radius * cos_a,
            y: cy + radius * sin_a,
            z: cz,
        });
    }

    (ring, upper_idx, lower_idx)
}

/// Triangulates an annular cap between `outer_start..outer_start+point_count`
/// and `ring_start..ring_start+HOLE_CIRCLE_SEGMENTS` by splitting along the two
/// shortest thickness struts (`upper_idx <-> M/4` and `lower_idx <-> 3*M/4`).
#[allow(clippy::too_many_arguments)]
fn append_punctured_cap(
    all_vertices: &[Point3],
    outer_start: usize,
    point_count: usize,
    ring_start: usize,
    upper_idx: usize,
    lower_idx: usize,
    positive_z_normal: bool,
    section_id: usize,
    triangles: &mut Vec<Triangle>,
) -> Result<(), MeshError> {
    let m = HOLE_CIRCLE_SEGMENTS;
    let q_top = m / 4;
    let q_bot = (3 * m) / 4;

    // 1. Front (LE-side) simple polygon:
    // outer[upper_idx ..= lower_idx] -> ring[q_bot ..= q_top (descending)]
    let mut front_global: Vec<usize> = Vec::new();
    for idx in upper_idx..=lower_idx {
        front_global.push(outer_start + idx);
    }
    for k in (q_top..=q_bot).rev() {
        front_global.push(ring_start + k);
    }
    let front_pts: Vec<Point3> = front_global.iter().map(|&gi| all_vertices[gi]).collect();
    let front_tris = triangulate_cap(&front_pts, section_id)?;
    for [a, b, c] in front_tris {
        let ga = front_global[a] as u32;
        let gb = front_global[b] as u32;
        let gc = front_global[c] as u32;
        if positive_z_normal {
            triangles.push(Triangle::new(ga, gb, gc));
        } else {
            triangles.push(Triangle::new(gc, gb, ga));
        }
    }

    // 2. Rear (TE-side) simple polygon:
    // outer[lower_idx .. point_count] -> outer[0 ..= upper_idx]
    // -> ring[q_top ..= 0 (descending)] -> ring[m-1 ..= q_bot (descending)]
    let mut rear_global: Vec<usize> = Vec::new();
    for idx in lower_idx..point_count {
        rear_global.push(outer_start + idx);
    }
    for idx in 0..=upper_idx {
        rear_global.push(outer_start + idx);
    }
    for k in (0..=q_top).rev() {
        rear_global.push(ring_start + k);
    }
    for k in (q_bot..m).rev() {
        rear_global.push(ring_start + k);
    }
    let rear_pts: Vec<Point3> = rear_global.iter().map(|&gi| all_vertices[gi]).collect();
    let rear_tris = triangulate_cap(&rear_pts, section_id)?;
    for [a, b, c] in rear_tris {
        let ga = rear_global[a] as u32;
        let gb = rear_global[b] as u32;
        let gc = rear_global[c] as u32;
        if positive_z_normal {
            triangles.push(Triangle::new(ga, gb, gc));
        } else {
            triangles.push(Triangle::new(gc, gb, ga));
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::check_mesh;
    use blade_model::{resolve, Design};

    fn fixture_surface() -> BladeSurface {
        let json = include_str!("../../../fixtures/naca4412-linear.json");
        let design = Design::from_json(json).expect("valid fixture");
        let resolved = resolve(&design).expect("valid resolve");
        let sections = blade_geom::build_sections(&resolved).expect("valid sections");
        blade_geom::loft(&sections).expect("valid loft")
    }

    #[test]
    fn blind_spar_hole_produces_watertight_manifold_solid_with_reduced_volume() {
        let surface = fixture_surface();
        let baseline = tessellate_fabricated(&surface, &FabricationSpec::default()).unwrap();
        let base_report = check_mesh(&baseline);
        assert!(base_report.is_valid_solid());

        let with_hole = tessellate_fabricated(
            &surface,
            &FabricationSpec {
                spar_hole: Some(SparHoleSpec {
                    diameter_mm: 5.0,
                    depth_mm: 200.0,
                    offset_x_mm: 0.0,
                    offset_y_mm: 0.0,
                }),
                split_parts: 1,
                split_ratio: None,
                active_part: None,
                explode_gap_mm: 0.0,
            },
        )
        .expect("spar hole mesh builds cleanly");

        let report = check_mesh(&with_hole);
        assert!(
            report.is_valid_solid(),
            "blind spar hole mesh must be watertight 2-manifold: {:?}",
            report.issues()
        );
        assert_eq!(report.boundary_edges, 0);
        assert_eq!(report.non_manifold_edges, 0);
        assert_eq!(report.inconsistent_edges, 0);
        assert!(
            report.volume_mm3 < base_report.volume_mm3 - 500.0,
            "expected hole to subtract volume: base={} vs hole={}",
            base_report.volume_mm3,
            report.volume_mm3
        );
    }

    #[test]
    fn split_blade_with_through_and_blind_spar_hole_produces_watertight_segments() {
        let surface = fixture_surface();
        // Split into 2 parts at 50% span (z = 330 mm), with a 360 mm deep spar hole
        // so Part 0 (root, 60..330 mm) has a through-hole and Part 1 (tip, 330..600 mm)
        // has a 90 mm blind hole!
        let spec_all = FabricationSpec {
            spar_hole: Some(SparHoleSpec {
                diameter_mm: 5.0,
                depth_mm: 360.0,
                offset_x_mm: 0.0,
                offset_y_mm: 0.0,
            }),
            split_parts: 2,
            split_ratio: Some(0.5),
            active_part: None,
            explode_gap_mm: 20.0,
        };
        let combined = tessellate_fabricated(&surface, &spec_all).unwrap();
        let combined_report = check_mesh(&combined);
        assert!(
            combined_report.is_valid_solid(),
            "combined 2-part split mesh must be valid solid: {:?}",
            combined_report.issues()
        );
        assert_eq!(combined_report.boundary_edges, 0);
        assert_eq!(combined_report.non_manifold_edges, 0);

        // Also verify isolating Part 0 (Root through-hole) and Part 1 (Tip blind-hole) individually.
        for part in [0, 1] {
            let mut single_spec = spec_all;
            single_spec.active_part = Some(part);
            let part_mesh = tessellate_fabricated(&surface, &single_spec).unwrap();
            let part_report = check_mesh(&part_mesh);
            assert!(
                part_report.is_valid_solid(),
                "part {part} must be a single valid solid: {:?}",
                part_report.issues()
            );
            assert_eq!(part_report.boundary_edges, 0);
            assert_eq!(part_report.non_manifold_edges, 0);
        }
    }
}
