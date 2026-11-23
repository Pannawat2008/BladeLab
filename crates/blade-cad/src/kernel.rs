//! Truck-backed [`CadKernel`]: B-rep blade and hub solids, STEP export.
//!
//! # Blade topology
//!
//! The loft is a tensor-product B-spline: the span direction comes from
//! `blade_geom::loft` (control points and knots are reused verbatim) and the
//! contour direction is represented exactly by a degree-1 B-spline through the
//! sampled airfoil points. The trailing-edge strip is a separate ruled face, so
//! the shell has four faces:
//!
//! - side surface (contour `0 … P−1`),
//! - trailing-edge face (contour `P−1 → 0`),
//! - root cap, tip cap.
//!
//! Every edge is built once and shared by the two adjacent faces, so
//! [`truck_modeling::Solid::try_new`] verifies the shell is closed and
//! manifold before a single STEP byte is written.

use std::f64::consts::PI;

use blade_geom::BladeSurface;
use blade_model::Hub;
use truck_modeling::{
    builder, BSplineCurve, BSplineSurface, Curve, Edge, Face, KnotVec, Point3, Shell, Solid,
    Surface, Vector3, Vertex, Wire,
};
use truck_stepio::out::{CompleteStepDisplay, StepHeaderDescriptor, StepModels};

use crate::error::CadError;

/// B-rep backend used by the rest of BladeLab (see D-lead1-004).
///
/// Implementations are native/server-side because STEP export is not part of
/// the wasm bundle (§2).
pub trait CadKernel {
    /// Builds the closed blade solid from the single geometry source of truth.
    ///
    /// # Errors
    ///
    /// Returns [`CadError`] when the surface is too small, contains non-finite
    /// coordinates, cannot be represented as a B-spline, or the resulting
    /// shell is not a closed manifold.
    fn blade_solid(&self, s: &BladeSurface) -> Result<Solid, CadError>;

    /// Builds the hub as a hollow cylinder around the positive z axis.
    ///
    /// The bore is required to be non-zero so the revolved profile does not
    /// collapse onto the axis.
    ///
    /// # Errors
    ///
    /// Returns [`CadError::InvalidHub`] for a non-positive diameter/length,
    /// a bore that is not strictly between zero and the diameter, or
    /// non-finite values.
    fn hub_solid(&self, h: &Hub) -> Result<Solid, CadError>;

    /// Serialises one or more solids as a single STEP (ISO 10303) document.
    ///
    /// Length units are millimetres, matching [`blade_geom`].
    ///
    /// # Errors
    ///
    /// Returns [`CadError::Step`] if the document cannot be generated.
    fn write_step(&self, bodies: &[Solid]) -> Result<String, CadError>;
}

/// The truck implementation of [`CadKernel`].
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct TruckKernel;

impl TruckKernel {
    /// Creates the kernel.
    #[must_use]
    pub const fn new() -> Self {
        Self
    }

    /// Builds a smooth B-spline blade solid (`blade_solid`) optionally pierced
    /// by an exact analytical cylindrical carbon-fiber spar bore `[x0, y0, z0, x1, y1, z1, r]`
    /// with zero boolean operations (`F-lead1-002`) and zero facet ripples.
    pub fn blade_solid_with_spar_bore(
        &self,
        surface: &BladeSurface,
        bore: Option<[f64; 7]>,
    ) -> Result<Solid, CadError> {
        let Some([x0, y0, z0, x1, y1, z1, r]) = bore else {
            return self.blade_solid(surface);
        };
        if ![x0, y0, z0, x1, y1, z1, r].iter().all(|v| v.is_finite()) || r <= 0.05 || z1 <= z0 + 0.1
        {
            return self.blade_solid(surface);
        }

        let section_count = surface.section_count();
        let point_count = surface.point_count();
        if section_count < 2 {
            return Err(CadError::TooFewSections { got: section_count });
        }
        if point_count < 3 {
            return Err(CadError::TooFewContourPoints { got: point_count });
        }
        if surface.control_points().len() != section_count {
            return Err(CadError::InconsistentTopology {
                sections: section_count,
                control_rows: surface.control_points().len(),
            });
        }

        let root_points = surface.section_at(0)?;
        let tip_points = surface.section_at(section_count - 1)?;
        let z_root = root_points[0].z;
        let z_tip = tip_points[0].z;

        let seg_z0 = z0.max(z_root);
        let seg_z1_raw = z1.min(z_tip);
        if seg_z1_raw <= seg_z0 + 0.1 || (seg_z0 - z_root).abs() > 1e-3 {
            return self.blade_solid(surface);
        }
        let seg_z0 = z_root;
        let opens_tip = (z_tip - seg_z1_raw).abs() <= 1e-3;
        let seg_z1 = if opens_tip { z_tip } else { seg_z1_raw };

        let t0 = ((seg_z0 - z0) / (z1 - z0)).clamp(0.0, 1.0);
        let t1 = ((seg_z1 - z0) / (z1 - z0)).clamp(0.0, 1.0);
        let bx0 = x0 + t0 * (x1 - x0);
        let by0 = y0 + t0 * (y1 - y0);
        let bx1 = x0 + t1 * (x1 - x0);
        let by1 = y0 + t1 * (y1 - y0);

        let (side, te, root_wire, tip_wire) =
            build_blade_outer_parts(surface, &root_points, &tip_points)?;

        let bore_root_ccw = circle_wire_at(bx0, by0, seg_z0, r);
        let root_cap =
            builder::try_attach_plane(&[root_wire, bore_root_ccw.clone()]).map_err(topology)?;
        let wall_shell = builder::tsweep(
            &bore_root_ccw.inverse(),
            Vector3::new(bx1 - bx0, by1 - by0, seg_z1 - seg_z0),
        );
        let top_wire_wall = wall_shell
            .extract_boundaries()
            .into_iter()
            .find(|w| {
                w.front_vertex()
                    .is_some_and(|v| (v.point().z - seg_z1).abs() < 1e-3)
            })
            .ok_or_else(|| {
                CadError::Topology("failed to locate top boundary wire of spar bore wall".into())
            })?;
        let bore_top_cw = top_wire_wall.inverse();

        let mut faces = vec![side, te, root_cap];
        if opens_tip {
            let tip_cap = builder::try_attach_plane(&[tip_wire, bore_top_cw]).map_err(topology)?;
            faces.push(tip_cap);
        } else {
            let tip_cap = builder::try_attach_plane(&[tip_wire]).map_err(topology)?;
            let bore_end_cap = builder::try_attach_plane(&[bore_top_cw]).map_err(topology)?;
            faces.push(tip_cap);
            faces.push(bore_end_cap);
        }
        faces.extend(wall_shell);

        let shell: Shell = faces.into_iter().collect();
        Solid::try_new(vec![shell]).map_err(topology)
    }

    /// Converts a closed, watertight, manifold triangle [`blade_mesh::Mesh`] into a [`Solid`].
    pub fn mesh_solid(&self, mesh: &blade_mesh::Mesh) -> Result<Solid, CadError> {
        let vertices: Vec<Vertex> = mesh
            .vertices
            .iter()
            .map(|p| to_point(*p).map(builder::vertex))
            .collect::<Result<_, _>>()?;

        let mut edge_map: std::collections::HashMap<(u32, u32), Edge> =
            std::collections::HashMap::with_capacity(mesh.triangles.len() * 3 / 2);
        let mut faces = Vec::with_capacity(mesh.triangles.len());

        for tri in &mesh.triangles {
            let idx = tri.indices();
            if idx[0] == idx[1] || idx[1] == idx[2] || idx[2] == idx[0] {
                return Err(CadError::Topology(
                    "triangle contains duplicate vertex indices".to_string(),
                ));
            }
            for &vi in &idx {
                if (vi as usize) >= vertices.len() {
                    return Err(CadError::Topology(format!(
                        "triangle vertex index {vi} out of bounds for {} vertices",
                        vertices.len()
                    )));
                }
            }
            let mut tri_edges = Vec::with_capacity(3);
            for k in 0..3 {
                let a = idx[k];
                let b = idx[(k + 1) % 3];
                let key = (a.min(b), a.max(b));
                let edge = if let Some(existing) = edge_map.get(&key) {
                    if a < b {
                        existing.clone()
                    } else {
                        existing.inverse()
                    }
                } else {
                    let curve = Curve::Line(truck_modeling::Line(
                        vertices[key.0 as usize].point(),
                        vertices[key.1 as usize].point(),
                    ));
                    let e =
                        Edge::try_new(&vertices[key.0 as usize], &vertices[key.1 as usize], curve)
                            .map_err(topology)?;
                    edge_map.insert(key, e.clone());
                    if a < b {
                        e
                    } else {
                        e.inverse()
                    }
                };
                tri_edges.push(edge);
            }
            let wire: Wire = tri_edges.into();
            let face = builder::try_attach_plane(&[wire]).map_err(topology)?;
            faces.push(face);
        }

        let shell: Shell = faces.into_iter().collect();
        Solid::try_new(vec![shell]).map_err(topology)
    }
}

impl CadKernel for TruckKernel {
    fn blade_solid(&self, surface: &BladeSurface) -> Result<Solid, CadError> {
        let section_count = surface.section_count();
        let point_count = surface.point_count();
        if section_count < 2 {
            return Err(CadError::TooFewSections { got: section_count });
        }
        if point_count < 3 {
            return Err(CadError::TooFewContourPoints { got: point_count });
        }
        if surface.control_points().len() != section_count {
            return Err(CadError::InconsistentTopology {
                sections: section_count,
                control_rows: surface.control_points().len(),
            });
        }

        let root_points = surface.section_at(0)?;
        let tip_points = surface.section_at(section_count - 1)?;
        let (side, te, root_wire, tip_wire) =
            build_blade_outer_parts(surface, &root_points, &tip_points)?;

        let root_cap = builder::try_attach_plane(&[root_wire]).map_err(topology)?;
        let tip_cap = builder::try_attach_plane(&[tip_wire]).map_err(topology)?;

        let shell: Shell = vec![side, te, root_cap, tip_cap].into_iter().collect();
        Solid::try_new(vec![shell]).map_err(topology)
    }

    fn hub_solid(&self, hub: &Hub) -> Result<Solid, CadError> {
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
        let outer = hub.diameter_mm / 2.0;
        let length = hub.length_mm;

        if let Some(flat_mm) = hub.shaft_flat() {
            if !flat_mm.is_finite() || flat_mm <= 0.0 || flat_mm >= inner {
                return Err(CadError::InvalidHub(
                    "shaft flat must be finite and strictly between 0 and the bore radius"
                        .to_string(),
                ));
            }
            return d_flat_hub(inner, outer, length, flat_mm);
        }

        // Build round hollow hub via 2D extrusion (`tsweep`) of the annular face
        // (outer circle CCW + inner bore circle CW) so OCCT BOPCheck passes with
        // 0 `BOPAlgo_InvalidCurveOnSurface` errors (unlike `rsweep`).
        let face = builder::try_attach_plane(&[circle_wire(outer), circle_wire(inner).inverse()])
            .map_err(topology)?;
        let solid = builder::tsweep(&face, Vector3::new(0.0, 0.0, length));
        Solid::try_new(solid.into_boundaries()).map_err(topology)
    }

    fn write_step(&self, bodies: &[Solid]) -> Result<String, CadError> {
        if bodies.is_empty() {
            return Err(CadError::Step("no bodies to export".to_string()));
        }
        let compressed: Vec<_> = bodies.iter().map(|solid| solid.compress()).collect();
        let models = StepModels::from_iter(compressed.iter());
        let header = StepHeaderDescriptor {
            file_name: "bladelab.step".to_string(),
            authors: vec!["BladeLab".to_string()],
            organization: Vec::new(),
            organization_system: "BladeLab blade-cad".to_string(),
            authorization: String::new(),
            ..Default::default()
        };
        Ok(CompleteStepDisplay::new(models, header).to_string())
    }
}

/// Tensor-product side surface: span from `blade_geom`, contour linear.
fn side_surface(surface: &BladeSurface) -> Result<BSplineSurface<Point3>, CadError> {
    let control = control_grid(surface)?;
    let u = KnotVec::from(surface.knots().to_vec());
    let v = KnotVec::uniform_knot(1, surface.point_count() - 1);
    BSplineSurface::try_new((u, v), control).map_err(geometry)
}

/// Ruled surface between the upper and lower trailing-edge curves.
fn te_surface(surface: &BladeSurface) -> Result<BSplineSurface<Point3>, CadError> {
    let last = surface.point_count() - 1;
    let control = surface
        .control_points()
        .iter()
        .map(|row| Ok(vec![to_point(row[0])?, to_point(row[last])?]))
        .collect::<Result<_, CadError>>()?;
    let u = KnotVec::from(surface.knots().to_vec());
    BSplineSurface::try_new((u, KnotVec::bezier_knot(1)), control).map_err(geometry)
}

/// Span-direction B-spline through `control_points[i][column]`.
fn span_curve(surface: &BladeSurface, column: usize) -> Result<Curve, CadError> {
    let points = surface
        .control_points()
        .iter()
        .map(|row| to_point(row[column]))
        .collect::<Result<_, CadError>>()?;
    let curve =
        BSplineCurve::try_new(KnotVec::from(surface.knots().to_vec()), points).map_err(geometry)?;
    Ok(Curve::BSplineCurve(curve))
}

fn control_grid(surface: &BladeSurface) -> Result<Vec<Vec<Point3>>, CadError> {
    surface
        .control_points()
        .iter()
        .map(|row| row.iter().map(|point| to_point(*point)).collect())
        .collect()
}

fn to_point(point: blade_geom::Point3) -> Result<Point3, CadError> {
    for (field, value) in [("x", point.x), ("y", point.y), ("z", point.z)] {
        if !value.is_finite() {
            return Err(CadError::NonFinite { field, value });
        }
    }
    Ok(Point3::new(point.x, point.y, point.z))
}

/// Builds shared side B-spline face, trailing-edge face, CW root boundary wire, and CCW tip wire.
fn build_blade_outer_parts(
    surface: &BladeSurface,
    root_points: &[blade_geom::Point3],
    tip_points: &[blade_geom::Point3],
) -> Result<(Face, Face, Wire, Wire), CadError> {
    let point_count = surface.point_count();
    let root_vertices: Vec<Vertex> = root_points
        .iter()
        .map(|point| Ok(builder::vertex(to_point(*point)?)))
        .collect::<Result<_, CadError>>()?;
    let tip_vertices: Vec<Vertex> = tip_points
        .iter()
        .map(|point| Ok(builder::vertex(to_point(*point)?)))
        .collect::<Result<_, CadError>>()?;

    let root_edges: Vec<Edge> = (0..point_count)
        .map(|index| {
            line_edge(
                &root_vertices[index],
                &root_vertices[(index + 1) % point_count],
            )
        })
        .collect::<Result<_, _>>()?;
    let tip_edges: Vec<Edge> = (0..point_count)
        .map(|index| {
            line_edge(
                &tip_vertices[index],
                &tip_vertices[(index + 1) % point_count],
            )
        })
        .collect::<Result<_, _>>()?;

    let upper_te = Edge::try_new(&root_vertices[0], &tip_vertices[0], span_curve(surface, 0)?)
        .map_err(topology)?;
    let lower_te = Edge::try_new(
        &root_vertices[point_count - 1],
        &tip_vertices[point_count - 1],
        span_curve(surface, point_count - 1)?,
    )
    .map_err(topology)?;

    let mut side_edges = Vec::with_capacity(2 * point_count);
    side_edges.extend(root_edges[..point_count - 1].iter().cloned());
    side_edges.push(lower_te.clone());
    side_edges.extend(tip_edges[..point_count - 1].iter().rev().map(Edge::inverse));
    side_edges.push(upper_te.inverse());
    let side_wire: Wire = side_edges.into();
    let side = Face::try_new(
        vec![side_wire],
        Surface::BSplineSurface(side_surface(surface)?),
    )
    .map_err(topology)?;

    let te_wire: Wire = vec![
        upper_te,
        tip_edges[point_count - 1].inverse(),
        lower_te.inverse(),
        root_edges[point_count - 1].clone(),
    ]
    .into();
    let te = Face::try_new(vec![te_wire], Surface::BSplineSurface(te_surface(surface)?))
        .map_err(topology)?;

    let mut root_wire_edges = Vec::with_capacity(point_count);
    root_wire_edges.push(root_edges[point_count - 1].inverse());
    root_wire_edges.extend(
        root_edges[..point_count - 1]
            .iter()
            .rev()
            .map(Edge::inverse),
    );
    let root_wire: Wire = root_wire_edges.into();
    let tip_wire: Wire = tip_edges.into();

    Ok((side, te, root_wire, tip_wire))
}

/// Point with polar angle (radians) at plane `z = cz`.
fn polar_at(cx: f64, cy: f64, cz: f64, radius: f64, angle: f64) -> Point3 {
    Point3::new(cx + radius * angle.cos(), cy + radius * angle.sin(), cz)
}

/// Point with polar angle (radians) on the unit flat z = 0.
fn polar(radius: f64, angle: f64) -> Point3 {
    polar_at(0.0, 0.0, 0.0, radius, angle)
}

/// Closed CCW wire tracing a full circle of `radius` at `(cx, cy, cz)` as three 120° arcs.
fn circle_wire_at(cx: f64, cy: f64, cz: f64, radius: f64) -> Wire {
    let third = 2.0 * PI / 3.0;
    let points = [0.0_f64, third, 2.0 * third].map(|angle| {
        let point = polar_at(cx, cy, cz, radius, angle);
        let vertex = builder::vertex(point);
        (point, vertex)
    });
    let transit = [third / 2.0, PI, 2.0 * third + third / 2.0]
        .map(|angle| polar_at(cx, cy, cz, radius, angle));
    vec![
        builder::circle_arc(&points[0].1, &points[1].1, transit[0]),
        builder::circle_arc(&points[1].1, &points[2].1, transit[1]),
        builder::circle_arc(&points[2].1, &points[0].1, transit[2]),
    ]
    .into()
}

/// Closed CCW wire tracing a full circle of `radius` at origin `z = 0`.
fn circle_wire(radius: f64) -> Wire {
    circle_wire_at(0.0, 0.0, 0.0, radius)
}

/// Builds a hollow hub with a **D-shaped bore** by extruding a holed annular
/// face — no boolean operations (F-lead1-002 / D-lead1-005).
///
/// `bore_radius` is the full circular bore radius `r`, `outer_radius` the hub
/// outer radius `R`, and `flat` the radial distance from the axis to the flat
/// face (`0 < flat < bore_radius`). The bore cross-section keeps its circular
/// arc wherever `x < flat` and is closed by a chord at `x = flat`; extruding
/// that face by `length` along +z yields the complete solid (outer wall, bore
/// wall, top/bottom caps).
fn d_flat_hub(
    bore_radius: f64,
    outer_radius: f64,
    length: f64,
    flat: f64,
) -> Result<Solid, CadError> {
    let half = (bore_radius * bore_radius - flat * flat).sqrt();

    let v_hi = builder::vertex(Point3::new(flat, half, 0.0));
    let v_left = builder::vertex(Point3::new(-bore_radius, 0.0, 0.0));
    let v_lo = builder::vertex(Point3::new(flat, -half, 0.0));

    // CCW D outline: arc (d,+h) -> (-r,0), arc (-r,0) -> (d,-h), chord back.
    let theta = (flat / bore_radius).acos();
    let arc_hi = builder::circle_arc(&v_hi, &v_left, polar(bore_radius, (theta + PI) / 2.0));
    let arc_left =
        builder::circle_arc(&v_left, &v_lo, polar(bore_radius, (3.0 * PI - theta) / 2.0));
    let chord = line_edge(&v_lo, &v_hi)?;
    let inner_d: Wire = vec![arc_hi, arc_left, chord].into();

    // Annular face: outer boundary CCW, inner D reversed (hole), in z = 0.
    let face = builder::try_attach_plane(&[circle_wire(outer_radius), inner_d.inverse()])
        .map_err(topology)?;
    let solid = builder::tsweep(&face, Vector3::new(0.0, 0.0, length));
    Solid::try_new(solid.into_boundaries()).map_err(topology)
}

fn line_edge(from: &Vertex, to: &Vertex) -> Result<Edge, CadError> {
    let curve = Curve::Line(truck_modeling::Line(from.point(), to.point()));
    Edge::try_new(from, to, curve).map_err(topology)
}

fn topology(error: impl std::fmt::Display) -> CadError {
    CadError::Topology(error.to_string())
}

fn geometry(error: impl std::fmt::Display) -> CadError {
    CadError::Geometry(error.to_string())
}
