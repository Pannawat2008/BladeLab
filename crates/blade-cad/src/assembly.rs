//! Watertight hub and unified blade+hub assembly triangle meshes (`T-203`).
//!
//! While STEP export uses `truck` B-rep solids without booleans (`F-lead1-002`),
//! mesh exports (`stl` and `3mf`) for `--part hub` and `--part assembly` need a
//! single closed, outward-wound 2-manifold triangle mesh that passes
//! [`blade_mesh::check_mesh`].
//!
//! [`assembly_mesh`] topologically unions the lofted blade with the hub by
//! opening the blade's root cap and welding its `P`-vertex root contour
//! directly into a punctured sector of the hub's `+z` annular face via a root
//! transition collar. Every edge in the resulting mesh has valence 2 and
//! opposite half-edge winding (`boundary_edges == 0`, `non_manifold_edges == 0`,
//! `inconsistent_edges == 0`), yielding a single connected watertight manifold
//! solid.

use std::f64::consts::PI;

use blade_geom::{BladeSurface, Point3};
use blade_mesh::{Mesh, Triangle};
use blade_model::Hub;

use crate::error::CadError;

/// Circumferential segments used to discretise the hub cylinder and bore.
pub const HUB_CIRCUMFERENCE_SEGMENTS: usize = 64;

/// Builds a closed, watertight 2-manifold triangle mesh of the hub (`T-203`).
///
/// Supports both plain round bores and D-flat bores (`Hub::shaft_flat`).
///
/// # Errors
///
/// Returns [`CadError::InvalidHub`] if the hub dimensions are non-positive,
/// non-finite, or geometrically invalid.
pub fn hub_mesh(hub: &Hub) -> Result<Mesh, CadError> {
    validate_hub_dims(hub)?;
    build_hub_or_assembly(hub, None)
}

/// Builds a single unified, watertight 2-manifold triangle mesh of the blade +
/// hub assembly (`T-203`).
///
/// The blade root is welded into sector 0 of the hub's `+z` annular cap so the
/// resulting mesh is a single connected, genus-1 watertight solid ready for
/// `.3mf` and `.stl` slicing.
///
/// # Errors
///
/// Returns [`CadError`] if the hub or blade surface is invalid.
pub fn assembly_mesh(surface: &BladeSurface, hub: &Hub) -> Result<Mesh, CadError> {
    validate_hub_dims(hub)?;
    if surface.section_count() < 2 {
        return Err(CadError::TooFewSections {
            got: surface.section_count(),
        });
    }
    if surface.point_count() < 4 {
        return Err(CadError::TooFewContourPoints {
            got: surface.point_count(),
        });
    }
    build_hub_or_assembly(hub, Some(surface))
}

fn validate_hub_dims(hub: &Hub) -> Result<(), CadError> {
    if !hub.diameter_mm.is_finite() || hub.diameter_mm <= 0.0 {
        return Err(CadError::InvalidHub(
            "diameter must be a finite, positive length".to_string(),
        ));
    }
    if !hub.length_mm.is_finite() || hub.length_mm <= 0.0 {
        return Err(CadError::InvalidHub(
            "length must be a finite, positive length".to_string(),
        ));
    }
    if !hub.bore_diameter_mm.is_finite()
        || hub.bore_diameter_mm <= 0.0
        || hub.bore_diameter_mm >= hub.diameter_mm
    {
        return Err(CadError::InvalidHub(
            "bore diameter must be finite and strictly between 0 and the outer diameter"
                .to_string(),
        ));
    }
    let inner = hub.bore_diameter_mm / 2.0;
    if let Some(flat_mm) = hub.shaft_flat() {
        if !flat_mm.is_finite() || flat_mm <= 0.0 || flat_mm >= inner {
            return Err(CadError::InvalidHub(
                "shaft flat must be finite and strictly between 0 and the bore radius".to_string(),
            ));
        }
    }
    Ok(())
}

fn build_hub_or_assembly(
    hub: &Hub,
    blade_surface: Option<&BladeSurface>,
) -> Result<Mesh, CadError> {
    let n = HUB_CIRCUMFERENCE_SEGMENTS;
    let inner_r = hub.bore_diameter_mm / 2.0;
    let outer_r = hub.diameter_mm / 2.0;
    let length = hub.length_mm;
    let flat_opt = hub.shaft_flat();

    let mut vertices: Vec<Point3> = Vec::new();
    let mut triangles: Vec<Triangle> = Vec::new();

    // 4 rings of N vertices:
    // 0..N:     bottom inner (z = 0)
    // N..2N:    bottom outer (z = 0)
    // 2N..3N:   top inner    (z = length)
    // 3N..4N:   top outer    (z = length)
    for ring in 0..4 {
        let z = if ring < 2 { 0.0 } else { length };
        let is_outer = ring % 2 == 1;
        for i in 0..n {
            // Offset angle by -pi/(n) so sector 0 straddles the +x axis symmetrically.
            let theta = 2.0 * PI * (i as f64 - 0.5) / (n as f64);
            let (x, y) = if is_outer {
                (outer_r * theta.cos(), outer_r * theta.sin())
            } else {
                bore_point(inner_r, flat_opt, theta)
            };
            vertices.push(Point3 { x, y, z });
        }
    }

    let bot_in = |i: usize| (i % n) as u32;
    let bot_out = |i: usize| (n + (i % n)) as u32;
    let top_in = |i: usize| (2 * n + (i % n)) as u32;
    let top_out = |i: usize| (3 * n + (i % n)) as u32;

    for i in 0..n {
        let next = (i + 1) % n;

        // Bottom annulus (z = 0, outward normal -z).
        triangles.push(Triangle::new(bot_in(i), bot_in(next), bot_out(next)));
        triangles.push(Triangle::new(bot_in(i), bot_out(next), bot_out(i)));

        // Outer cylinder wall (outward normal +r).
        triangles.push(Triangle::new(bot_out(i), bot_out(next), top_out(next)));
        triangles.push(Triangle::new(bot_out(i), top_out(next), top_out(i)));

        // Inner bore wall (outward normal -r).
        triangles.push(Triangle::new(bot_in(i), top_in(i), top_in(next)));
        triangles.push(Triangle::new(bot_in(i), top_in(next), bot_in(next)));

        // Top annulus (z = length, outward normal +z).
        // If welding a blade, sector 0 is punctured and bridged to the blade root.
        if i == 0 && blade_surface.is_some() {
            continue;
        }
        triangles.push(Triangle::new(top_in(i), top_out(i), top_out(next)));
        triangles.push(Triangle::new(top_in(i), top_out(next), top_in(next)));
    }

    if let Some(surface) = blade_surface {
        weld_blade_into_sector_zero(
            surface,
            [top_in(0), top_out(0), top_out(1), top_in(1)],
            &mut vertices,
            &mut triangles,
        )?;
    }

    Ok(Mesh {
        vertices,
        triangles,
    })
}

fn bore_point(inner_r: f64, flat_opt: Option<f64>, theta: f64) -> (f64, f64) {
    let cos_t = theta.cos();
    let sin_t = theta.sin();
    let x = inner_r * cos_t;
    let y = inner_r * sin_t;
    if let Some(flat_mm) = flat_opt {
        if x > flat_mm && cos_t > 1e-9 {
            return (flat_mm, flat_mm * (sin_t / cos_t));
        }
    }
    (x, y)
}

fn weld_blade_into_sector_zero(
    surface: &BladeSurface,
    quad_corners: [u32; 4],
    vertices: &mut Vec<Point3>,
    triangles: &mut Vec<Triangle>,
) -> Result<(), CadError> {
    let p_count = surface.point_count();
    let s_count = surface.section_count();

    let [c0, c1, c2, c3] = quad_corners;
    let p0 = vertices[c0 as usize];
    let p1 = vertices[c1 as usize];
    let p2 = vertices[c2 as usize];
    let p3 = vertices[c3 as usize];

    // Center and local basis of the sector-0 top quad at z = hub.length_mm.
    let center_x = 0.25 * (p0.x + p1.x + p2.x + p3.x);
    let center_y = 0.25 * (p0.y + p1.y + p2.y + p3.y);
    let z_hub_top = p0.z;

    let radial_span = ((p1.x - p0.x).hypot(p1.y - p0.y)).min((p2.x - p3.x).hypot(p2.y - p3.y));
    let chord_span = ((p3.x - p0.x).hypot(p3.y - p0.y)).min((p2.x - p1.x).hypot(p2.y - p1.y));
    let loop_radius = 0.22 * radial_span.min(chord_span);

    // Build the P-vertex CCW loop W inside quad (c0, c1, c2, c3).
    // Align angle 0 with +x so W's indices match the root airfoil contour R0
    // (which starts at the trailing edge +x, goes through LE -x at P/2, and returns to +x).
    let w_start = vertices.len() as u32;
    for idx in 0..p_count {
        let angle = 2.0 * PI * (idx as f64) / (p_count as f64);
        vertices.push(Point3 {
            x: center_x + loop_radius * angle.cos(),
            y: center_y + loop_radius * angle.sin(),
            z: z_hub_top,
        });
    }

    // Partition 0..p_count into 4 quadrants matching corners c1 (+x,-y), c2 (+x,+y), c3 (-x,+y), c0 (-x,-y).
    let q0 = 0_usize;
    let q1 = p_count / 4;
    let q2 = p_count / 2;
    let q3 = (3 * p_count) / 4;

    let w_at = |idx: usize| w_start + ((idx % p_count) as u32);

    // 4 bridge triangles connecting the outer quad edges to the quadrant split vertices on W.
    triangles.push(Triangle::new(c0, c1, w_at(q0)));
    triangles.push(Triangle::new(c1, c2, w_at(q1)));
    triangles.push(Triangle::new(c2, c3, w_at(q2)));
    triangles.push(Triangle::new(c3, c0, w_at(q3)));

    // 4 corner fans covering all P segments of W with half-edge direction W[idx+1] -> W[idx].
    for idx in q0..q1 {
        triangles.push(Triangle::new(c1, w_at(idx + 1), w_at(idx)));
    }
    for idx in q1..q2 {
        triangles.push(Triangle::new(c2, w_at(idx + 1), w_at(idx)));
    }
    for idx in q2..q3 {
        triangles.push(Triangle::new(c3, w_at(idx + 1), w_at(idx)));
    }
    for idx in q3..p_count {
        triangles.push(Triangle::new(c0, w_at(idx + 1), w_at(idx)));
    }

    // Append all blade surface sections (0..s_count).
    // If the blade root sits at or below z_hub_top, lift the blade root slightly above
    // z_hub_top if needed so the transition collar has strictly positive height.
    let blade_start = vertices.len() as u32;
    let root_z = surface.span_start_mm();
    let min_collar_z = z_hub_top + 1.0;
    let z_shift = if root_z < min_collar_z {
        min_collar_z - root_z
    } else {
        0.0
    };

    for section_index in 0..s_count {
        let section = surface.section_at(section_index)?;
        for point in section {
            for (field, value) in [("x", point.x), ("y", point.y), ("z", point.z)] {
                if !value.is_finite() {
                    return Err(CadError::NonFinite { field, value });
                }
            }
            vertices.push(Point3 {
                x: point.x,
                y: point.y,
                z: point.z + z_shift,
            });
        }
    }

    // Transition collar from W (at z = z_hub_top) to blade section 0 (R0).
    for idx in 0..p_count {
        let next = (idx + 1) % p_count;
        let a = w_at(idx);
        let b = w_at(next);
        let c = blade_start + (next as u32);
        let d = blade_start + (idx as u32);
        triangles.push(Triangle::new(a, b, c));
        triangles.push(Triangle::new(a, c, d));
    }

    // Blade side + trailing-edge strips between consecutive sections.
    for section in 0..(s_count - 1) {
        let cur_base = blade_start + ((section * p_count) as u32);
        let next_base = blade_start + (((section + 1) * p_count) as u32);
        for idx in 0..p_count {
            let next = (idx + 1) % p_count;
            let a = cur_base + (idx as u32);
            let b = cur_base + (next as u32);
            let c = next_base + (next as u32);
            let d = next_base + (idx as u32);
            triangles.push(Triangle::new(a, b, c));
            triangles.push(Triangle::new(a, c, d));
        }
    }

    // Tip cap on the last blade section (outward normal +z).
    let tip_offset = (blade_start as usize) + (s_count - 1) * p_count;
    let tip_slice = &vertices[tip_offset..tip_offset + p_count];
    for [a, b, c] in triangulate_planar_cap(tip_slice)? {
        triangles.push(Triangle::new(
            (tip_offset + a) as u32,
            (tip_offset + b) as u32,
            (tip_offset + c) as u32,
        ));
    }

    Ok(())
}

fn signed_area_xy(points: &[Point3]) -> f64 {
    let mut twice = 0.0;
    for index in 0..points.len() {
        let current = points[index];
        let next = points[(index + 1) % points.len()];
        twice += current.x * next.y - next.x * current.y;
    }
    0.5 * twice
}

fn triangulate_planar_cap(points: &[Point3]) -> Result<Vec<[usize; 3]>, CadError> {
    let count = points.len();
    let mut order: Vec<usize> = (0..count).collect();
    if signed_area_xy(points) < 0.0 {
        order.reverse();
    }

    let scale = points.iter().fold(1.0_f64, |acc, point| {
        acc.max(point.x.abs()).max(point.y.abs())
    });
    let epsilon = 1e-12 * scale * scale;

    let mut tris = Vec::with_capacity(count.saturating_sub(2));
    while order.len() > 3 {
        let remaining = order.len();
        let mut clipped = false;
        for pos in 0..remaining {
            let prev = order[(pos + remaining - 1) % remaining];
            let curr = order[pos];
            let next = order[(pos + 1) % remaining];

            let a = points[prev];
            let b = points[curr];
            let c = points[next];
            let cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            if cross <= epsilon {
                continue;
            }

            let blocked = order.iter().any(|&cand| {
                cand != prev
                    && cand != curr
                    && cand != next
                    && point_in_tri(points[cand], a, b, c, epsilon)
            });
            if blocked {
                continue;
            }

            tris.push([prev, curr, next]);
            order.remove(pos);
            clipped = true;
            break;
        }
        if !clipped {
            return Err(CadError::Topology(
                "failed to ear-clip blade tip cap".to_string(),
            ));
        }
    }

    if order.len() == 3 {
        tris.push([order[0], order[1], order[2]]);
    }
    Ok(tris)
}

fn point_in_tri(p: Point3, a: Point3, b: Point3, c: Point3, eps: f64) -> bool {
    let d1 = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    let d2 = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x);
    let d3 = (a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x);
    d1 > eps && d2 > eps && d3 > eps
}

#[cfg(test)]
mod tests {
    use super::*;
    use blade_geom::{build_sections, loft};
    use blade_mesh::{check_mesh, write_3mf, write_stl};
    use blade_model::{resolve, Design};
    use std::collections::{HashSet, VecDeque};

    fn count_connected_components(mesh: &Mesh) -> usize {
        if mesh.vertices.is_empty() {
            return 0;
        }
        let mut adj: Vec<Vec<u32>> = vec![Vec::new(); mesh.vertices.len()];
        for tri in &mesh.triangles {
            adj[tri.a as usize].push(tri.b);
            adj[tri.a as usize].push(tri.c);
            adj[tri.b as usize].push(tri.a);
            adj[tri.b as usize].push(tri.c);
            adj[tri.c as usize].push(tri.a);
            adj[tri.c as usize].push(tri.b);
        }
        let mut visited = HashSet::new();
        let mut components = 0;
        for start in 0..mesh.vertices.len() as u32 {
            if visited.contains(&start) {
                continue;
            }
            components += 1;
            let mut queue = VecDeque::new();
            queue.push_back(start);
            visited.insert(start);
            while let Some(u) = queue.pop_front() {
                for &v in &adj[u as usize] {
                    if visited.insert(v) {
                        queue.push_back(v);
                    }
                }
            }
        }
        components
    }

    #[test]
    fn hub_mesh_and_assembly_mesh_are_single_watertight_manifold_solids_for_all_fixtures() {
        let fixtures = [
            include_str!("../../../fixtures/naca4412-linear.json"),
            include_str!("../../../fixtures/naca4412-schmitz.json"),
            include_str!("../../../fixtures/naca0012-constant.json"),
            include_str!("../../../fixtures/naca2415-multistation-dflat.json"),
            include_str!("../../../fixtures/naca6409-high-tsr-5blade.json"),
        ];

        for (idx, raw) in fixtures.iter().enumerate() {
            let design = Design::from_json(raw).expect("fixture parses");
            let resolved = resolve(&design).expect("fixture resolves");
            let sections = build_sections(&resolved).expect("sections build");
            let surface = loft(&sections).expect("sections loft");

            let h_mesh = hub_mesh(&resolved.hub).expect("hub mesh builds");
            let h_report = check_mesh(&h_mesh);
            assert!(
                h_report.is_valid_solid(),
                "fixture {idx} hub issues: {:?}",
                h_report.issues()
            );
            assert_eq!(count_connected_components(&h_mesh), 1);

            let a_mesh = assembly_mesh(&surface, &resolved.hub).expect("assembly mesh builds");
            let a_report = check_mesh(&a_mesh);
            assert!(
                a_report.is_valid_solid(),
                "fixture {idx} assembly issues: {:?}",
                a_report.issues()
            );
            assert_eq!(
                count_connected_components(&a_mesh),
                1,
                "fixture {idx} assembly must be a single connected manifold part"
            );
            assert!(a_report.volume_mm3 > h_report.volume_mm3);

            // Verify 3MF and STL serialisation of the unified assembly.
            let threemf = write_3mf(&a_mesh);
            assert_eq!(&threemf[..4], b"PK\x03\x04");
            let stl = write_stl(&a_mesh);
            assert_eq!(stl.len(), 84 + 50 * a_mesh.triangle_count());
        }
    }
}
