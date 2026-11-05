//! Triangle mesh representation and inspection.
//!
//! [`Mesh`] stores indexed triangles in millimetres. [`check_mesh`] is a pure,
//! total inspection routine: it never panics and reports every problem it can
//! find instead of stopping at the first one. `blade-cad`, the STL writer and
//! the web viewer all consume this type.

use std::cmp::Ordering;
use std::collections::HashMap;

use blade_geom::Point3;

/// One triangle of a [`Mesh`], stored as three indices into the vertex buffer.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Triangle {
    /// Index of the first vertex.
    pub a: u32,
    /// Index of the second vertex.
    pub b: u32,
    /// Index of the third vertex.
    pub c: u32,
}

impl Triangle {
    /// Creates a triangle from three vertex indices.
    #[must_use]
    pub fn new(a: u32, b: u32, c: u32) -> Self {
        Self { a, b, c }
    }

    /// Returns the indices in winding order.
    #[must_use]
    pub fn indices(&self) -> [u32; 3] {
        [self.a, self.b, self.c]
    }
}

/// A triangle mesh in millimetres.
///
/// Triangles are expected to be wound counter-clockwise when viewed from
/// outside, so [`Mesh::signed_volume_mm3`] is positive for a closed solid.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct Mesh {
    /// Vertices shared by the triangles.
    pub vertices: Vec<Point3>,
    /// Triangles referencing [`Mesh::vertices`].
    pub triangles: Vec<Triangle>,
}

impl Mesh {
    /// Number of vertices.
    #[must_use]
    pub fn vertex_count(&self) -> usize {
        self.vertices.len()
    }

    /// Number of triangles.
    #[must_use]
    pub fn triangle_count(&self) -> usize {
        self.triangles.len()
    }

    /// Resolves triangle `index` into its three points.
    ///
    /// Returns `None` when the index is out of range or the triangle
    /// references a missing vertex, so callers never index out of bounds.
    #[must_use]
    pub fn triangle_vertices(&self, index: usize) -> Option<[Point3; 3]> {
        let triangle = self.triangles.get(index)?;
        let a = *self.vertices.get(triangle.a as usize)?;
        let b = *self.vertices.get(triangle.b as usize)?;
        let c = *self.vertices.get(triangle.c as usize)?;
        Some([a, b, c])
    }

    /// Signed volume in mm³ using the divergence theorem.
    ///
    /// Positive for a closed, outward-wound solid. Returns `0.0` when a
    /// triangle is degenerate or a vertex is not finite, so this method never
    /// returns `NaN` or infinity.
    #[must_use]
    pub fn signed_volume_mm3(&self) -> f64 {
        let mut volume = 0.0;
        for index in 0..self.triangles.len() {
            let Some([a, b, c]) = self.triangle_vertices(index) else {
                continue;
            };
            let term = dot(a, cross(b, c)) / 6.0;
            if !term.is_finite() {
                return 0.0;
            }
            volume += term;
        }
        if volume.is_finite() {
            volume
        } else {
            0.0
        }
    }

    /// Total surface area in mm².
    #[must_use]
    pub fn surface_area_mm2(&self) -> f64 {
        let mut area = 0.0;
        for index in 0..self.triangles.len() {
            let Some([a, b, c]) = self.triangle_vertices(index) else {
                continue;
            };
            let value = cross(sub(b, a), sub(c, a)).magnitude() / 2.0;
            if !value.is_finite() {
                return 0.0;
            }
            area += value;
        }
        if area.is_finite() {
            area
        } else {
            0.0
        }
    }
}

/// Result of [`check_mesh`].
///
/// Counts are all zero for an empty mesh; [`MeshReport::watertight`] also
/// requires at least one triangle.
#[derive(Debug, Clone, PartialEq)]
pub struct MeshReport {
    /// Number of vertices in the mesh.
    pub vertex_count: usize,
    /// Number of triangles in the mesh.
    pub triangle_count: usize,
    /// Vertices with a `NaN` or infinite coordinate.
    pub non_finite_vertices: usize,
    /// Triangles whose indices fall outside the vertex buffer.
    pub out_of_range_triangles: usize,
    /// Edges used by exactly one triangle.
    pub boundary_edges: usize,
    /// Edges used by more than two triangles.
    pub non_manifold_edges: usize,
    /// Edges used twice but with the same winding direction (flipped face).
    pub inconsistent_edges: usize,
    /// Triangles with (near) zero area.
    pub degenerate_triangles: usize,
    /// Signed volume in mm³ (positive for a closed outward-wound solid).
    pub volume_mm3: f64,
    /// Surface area in mm².
    pub area_mm2: f64,
    /// Shortest triangle edge in mm (0 for an empty mesh).
    pub min_edge_mm: f64,
    /// Smallest triangle altitude in mm (0 for an empty mesh).
    ///
    /// This is a local-feature proxy for printability; a true wall-thickness
    /// check needs the solid model (T-006).
    pub min_triangle_altitude_mm: f64,
    /// True when every edge is shared by exactly two coherently wound
    /// triangles and there is at least one triangle.
    pub watertight: bool,
}

impl MeshReport {
    /// True when the mesh is a closed, outward-wound solid with no degenerate
    /// or non-finite geometry and positive volume.
    ///
    /// This is the check behind the T-005 acceptance criterion "watertight,
    /// positive volume, opens in a slicer".
    #[must_use]
    pub fn is_valid_solid(&self) -> bool {
        self.watertight
            && self.volume_mm3 > 0.0
            && self.non_finite_vertices == 0
            && self.degenerate_triangles == 0
    }

    /// Human-readable problem list, empty when [`Self::is_valid_solid`].
    #[must_use]
    pub fn issues(&self) -> Vec<String> {
        let mut issues = Vec::new();
        if self.triangle_count == 0 {
            issues.push("mesh has no triangles".to_string());
        }
        if self.non_finite_vertices > 0 {
            issues.push(format!(
                "{} vertex/vertices are not finite",
                self.non_finite_vertices
            ));
        }
        if self.out_of_range_triangles > 0 {
            issues.push(format!(
                "{} triangle(s) reference missing vertices",
                self.out_of_range_triangles
            ));
        }
        if self.boundary_edges > 0 {
            issues.push(format!("{} open edge(s)", self.boundary_edges));
        }
        if self.non_manifold_edges > 0 {
            issues.push(format!("{} non-manifold edge(s)", self.non_manifold_edges));
        }
        if self.inconsistent_edges > 0 {
            issues.push(format!(
                "{} edge(s) have inconsistent winding",
                self.inconsistent_edges
            ));
        }
        if self.degenerate_triangles > 0 {
            issues.push(format!(
                "{} degenerate triangle(s)",
                self.degenerate_triangles
            ));
        }
        if self.volume_mm3.partial_cmp(&0.0) != Some(Ordering::Greater) {
            issues.push(format!("volume is {} mm³", self.volume_mm3));
        }
        issues
    }
}

/// Inspects a mesh: watertightness, manifoldness, winding, volume and
/// degenerate geometry.
///
/// The routine is total — invalid indices and non-finite vertices are counted
/// and reported, never indexed.
#[must_use]
pub fn check_mesh(mesh: &Mesh) -> MeshReport {
    let non_finite_vertices = mesh
        .vertices
        .iter()
        .filter(|point| !(point.x.is_finite() && point.y.is_finite() && point.z.is_finite()))
        .count();

    // (min, max) edge -> (uses, winding balance).
    let mut edges: HashMap<(u32, u32), (usize, i32)> = HashMap::new();
    let mut out_of_range_triangles = 0;
    let mut degenerate_triangles = 0;
    let mut min_edge_mm = f64::INFINITY;
    let mut min_triangle_altitude_mm = f64::INFINITY;

    for index in 0..mesh.triangles.len() {
        let Some([a, b, c]) = mesh.triangle_vertices(index) else {
            out_of_range_triangles += 1;
            continue;
        };
        if !(finite(a) && finite(b) && finite(c)) {
            out_of_range_triangles += 1;
            continue;
        }

        let ab = sub(b, a);
        let ac = sub(c, a);
        let area2 = cross(ab, ac).magnitude();
        let lengths = edge_lengths(a, b, c);
        let longest = lengths.into_iter().fold(0.0_f64, f64::max);
        let shortest = lengths.into_iter().fold(f64::INFINITY, f64::min);
        if shortest.is_finite() {
            min_edge_mm = min_edge_mm.min(shortest);
        }
        let altitude = if longest > 0.0 { area2 / longest } else { 0.0 };
        min_triangle_altitude_mm = min_triangle_altitude_mm.min(altitude);

        if area2 <= DEGENERATE_AREA2_MM2 {
            degenerate_triangles += 1;
        }

        let triangle = mesh.triangles[index];
        for (from, to) in [
            (triangle.a, triangle.b),
            (triangle.b, triangle.c),
            (triangle.c, triangle.a),
        ] {
            let key = if from < to { (from, to) } else { (to, from) };
            let balance = if from < to { 1 } else { -1 };
            let entry = edges.entry(key).or_insert((0, 0));
            entry.0 += 1;
            entry.1 += balance;
        }
    }

    let mut boundary_edges = 0;
    let mut non_manifold_edges = 0;
    let mut inconsistent_edges = 0;
    for (uses, balance) in edges.values() {
        match *uses {
            1 => boundary_edges += 1,
            2 => {
                if *balance != 0 {
                    inconsistent_edges += 1;
                }
            }
            _ => non_manifold_edges += 1,
        }
    }

    let empty = mesh.triangles.is_empty();
    MeshReport {
        vertex_count: mesh.vertices.len(),
        triangle_count: mesh.triangles.len(),
        non_finite_vertices,
        out_of_range_triangles,
        boundary_edges,
        non_manifold_edges,
        inconsistent_edges,
        degenerate_triangles,
        volume_mm3: mesh.signed_volume_mm3(),
        area_mm2: mesh.surface_area_mm2(),
        min_edge_mm: if empty || !min_edge_mm.is_finite() {
            0.0
        } else {
            min_edge_mm
        },
        min_triangle_altitude_mm: if empty || !min_triangle_altitude_mm.is_finite() {
            0.0
        } else {
            min_triangle_altitude_mm
        },
        watertight: !empty
            && boundary_edges == 0
            && non_manifold_edges == 0
            && inconsistent_edges == 0
            && out_of_range_triangles == 0,
    }
}

/// Triangles with `2·area` at or below this value count as degenerate (mm²).
const DEGENERATE_AREA2_MM2: f64 = 1e-12;

fn finite(point: Point3) -> bool {
    point.x.is_finite() && point.y.is_finite() && point.z.is_finite()
}

fn edge_lengths(a: Point3, b: Point3, c: Point3) -> [f64; 3] {
    [
        sub(b, a).magnitude(),
        sub(c, b).magnitude(),
        sub(a, c).magnitude(),
    ]
}

fn sub(a: Point3, b: Point3) -> Point3 {
    Point3 {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    }
}

fn cross(a: Point3, b: Point3) -> Point3 {
    Point3 {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    }
}

fn dot(a: Point3, b: Point3) -> f64 {
    a.x * b.x + a.y * b.y + a.z * b.z
}

trait Magnitude {
    fn magnitude(self) -> f64;
}

impl Magnitude for Point3 {
    fn magnitude(self) -> f64 {
        dot(self, self).sqrt()
    }
}
