//! Tessellation of a lofted B-spline surface into a closed triangle mesh.
//!
//! The loft is sampled as a grid of `section_count × point_count` vertices.
//! Each contour is an open polyline whose first and last points are the two
//! trailing-edge points (D-geom1-001), so the tube closes implicitly through
//! the trailing-edge strip. Root and tip caps close the remaining openings;
//! both are ear-clipped in the section plane because airfoil contours are
//! simple but not convex.

use blade_geom::{BladeSurface, Point3};

use crate::error::MeshError;
use crate::mesh::{Mesh, Triangle};

/// Tessellation options.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MeshOptions {
    /// Generate the root and tip caps.
    ///
    /// Keep this `true` for printing and volume checks. Turning it off yields
    /// an open tube, which is useful for inspecting the side surface.
    pub cap_ends: bool,
}

impl Default for MeshOptions {
    fn default() -> Self {
        Self { cap_ends: true }
    }
}

/// Triangulates a lofted surface into a watertight mesh.
///
/// Vertices are shared between the side strip and the caps, so a closed mesh
/// has every edge used by exactly two coherently wound triangles.
///
/// # Errors
///
/// - [`MeshError::TooFewSections`] / [`MeshError::TooFewContourPoints`] when
///   the surface is too small to enclose a volume.
/// - [`MeshError::NonFiniteVertex`] when the surface contains a non-finite
///   coordinate.
/// - [`MeshError::TooManyVertices`] when the vertex count does not fit `u32`.
/// - [`MeshError::CapTriangulation`] when a cap polygon is not a simple
///   polygon.
/// - [`MeshError::Geom`] when reading a section from the surface fails.
pub fn tessellate(surface: &BladeSurface, options: &MeshOptions) -> Result<Mesh, MeshError> {
    if surface.section_count() < 2 {
        return Err(MeshError::TooFewSections {
            got: surface.section_count(),
        });
    }
    let point_count = surface.point_count();
    if point_count < 3 {
        return Err(MeshError::TooFewContourPoints {
            min: 3,
            got: point_count,
        });
    }

    let mut vertices = Vec::with_capacity(surface.section_count() * point_count);
    for section_index in 0..surface.section_count() {
        let section = surface.section_at(section_index)?;
        if section.len() != point_count {
            return Err(MeshError::TooFewContourPoints {
                min: point_count,
                got: section.len(),
            });
        }
        for point in section {
            if !finite(point) {
                return Err(MeshError::NonFiniteVertex {
                    index: vertices.len(),
                });
            }
            vertices.push(point);
        }
    }
    if vertices.len() > u32::MAX as usize {
        return Err(MeshError::TooManyVertices);
    }

    let counter_clockwise = signed_area(&vertices[..point_count]) > 0.0;
    let mut triangles = Vec::new();

    // Side strip: one quad between consecutive sections for every contour
    // edge, including the trailing-edge edge from the last point to the first.
    for section in 0..surface.section_count() - 1 {
        let current = section * point_count;
        let next_section = (section + 1) * point_count;
        for index in 0..point_count {
            let following = (index + 1) % point_count;
            let a = index_at(current + index);
            let b = index_at(current + following);
            let c = index_at(next_section + following);
            let d = index_at(next_section + index);
            if counter_clockwise {
                triangles.push(Triangle::new(a, b, c));
                triangles.push(Triangle::new(a, c, d));
            } else {
                triangles.push(Triangle::new(a, c, b));
                triangles.push(Triangle::new(a, d, c));
            }
        }
    }

    if options.cap_ends {
        let root = &vertices[..point_count];
        let tip_start = (surface.section_count() - 1) * point_count;
        let tip = &vertices[tip_start..tip_start + point_count];

        // Ear clipping returns counter-clockwise triangles in the section
        // plane, i.e. +z normals. The root needs -z, so reverse it.
        for [a, b, c] in triangulate_cap(root, 0)? {
            triangles.push(Triangle::new(index_at(c), index_at(b), index_at(a)));
        }
        for [a, b, c] in triangulate_cap(tip, surface.section_count() - 1)? {
            triangles.push(Triangle::new(
                index_at(tip_start + a),
                index_at(tip_start + b),
                index_at(tip_start + c),
            ));
        }
    }

    if triangles.len() > u32::MAX as usize {
        return Err(MeshError::TooManyTriangles);
    }

    Ok(Mesh {
        vertices,
        triangles,
    })
}

fn index_at(index: usize) -> u32 {
    // Callers bound `vertices.len()` by `u32::MAX` before building triangles.
    index as u32
}

fn finite(point: Point3) -> bool {
    point.x.is_finite() && point.y.is_finite() && point.z.is_finite()
}

/// Twice the signed area of the closed polygon in the `x`/`y` plane.
fn signed_area(points: &[Point3]) -> f64 {
    let mut twice = 0.0;
    for index in 0..points.len() {
        let current = points[index];
        let next = points[(index + 1) % points.len()];
        twice += current.x * next.y - next.x * current.y;
    }
    twice / 2.0
}

/// Ear-clips a simple polygon in the `x`/`y` plane.
///
/// Returns counter-clockwise triangles regardless of the input winding.
fn triangulate_cap(points: &[Point3], section: usize) -> Result<Vec<[usize; 3]>, MeshError> {
    let count = points.len();
    let mut order: Vec<usize> = (0..count).collect();
    if signed_area(points) < 0.0 {
        order.reverse();
    }

    let scale = points.iter().fold(1.0_f64, |scale, point| {
        scale.max(point.x.abs()).max(point.y.abs())
    });
    let epsilon = 1e-12 * scale * scale;

    let mut triangles = Vec::with_capacity(count.saturating_sub(2));
    while order.len() > 3 {
        let remaining = order.len();
        let mut clipped = false;
        for position in 0..remaining {
            let previous = order[(position + remaining - 1) % remaining];
            let current = order[position];
            let next = order[(position + 1) % remaining];

            let a = points[previous];
            let b = points[current];
            let c = points[next];
            let cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            if cross <= epsilon {
                continue;
            }

            let mut blocked = false;
            for &candidate in &order {
                if candidate == previous || candidate == current || candidate == next {
                    continue;
                }
                if point_inside(points[candidate], a, b, c, epsilon) {
                    blocked = true;
                    break;
                }
            }
            if blocked {
                continue;
            }

            triangles.push([previous, current, next]);
            order.remove(position);
            clipped = true;
            break;
        }
        if !clipped {
            return Err(MeshError::CapTriangulation { section });
        }
    }

    if order.len() == 3 {
        triangles.push([order[0], order[1], order[2]]);
    }
    Ok(triangles)
}

/// Strictly-inside test for a counter-clockwise triangle.
fn point_inside(point: Point3, a: Point3, b: Point3, c: Point3, epsilon: f64) -> bool {
    let d1 = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    let d2 = (c.x - b.x) * (point.y - b.y) - (c.y - b.y) * (point.x - b.x);
    let d3 = (a.x - c.x) * (point.y - c.y) - (a.y - c.y) * (point.x - c.x);
    d1 > epsilon && d2 > epsilon && d3 > epsilon
}
