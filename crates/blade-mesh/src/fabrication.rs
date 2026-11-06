//! Fabrication geometry helpers: base carbon-fiber spar tube hole, spanwise
//! model splitting into printable segments, and alignment dowel pins / keys on
//! the split faces with configurable fit tolerances.
//!
//! All geometry is constructed directly from [`blade_geom::BladeSurface`] using
//! parametric section evaluation and 2D ear-clipping with hole bridging
//! (`append_cap_with_holes`), with zero mesh boolean CSG (`D-lead1-005`) and
//! full `wasm32` compatibility.

use std::f64::consts::PI;

use blade_geom::{BladeSurface, Point3};

use crate::error::MeshError;
use crate::mesh::{Mesh, Triangle};
use crate::tessellate::{tessellate, triangulate_cap, MeshOptions};

/// Number of circumferential vertices on the carbon-fiber tube hole circle.
const HOLE_CIRCLE_SEGMENTS: usize = 32;

/// Number of circumferential vertices on a round alignment pin / socket.
const PIN_CIRCLE_SEGMENTS: usize = 24;

/// Minimum spanwise station count per split segment.
const MIN_SEGMENT_STATIONS: usize = 14;

/// Radius scale factors tried (in order) when a pin does not fit the local
/// airfoil thickness.
const FIT_SHRINK_STEPS: [f64; 4] = [1.0, 0.85, 0.7, 0.55];

/// Specification for a cylindrical hole entering from the blade root base
/// (`z = span_start_mm`) to receive a carbon-fiber spar tube or rod.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SparHoleSpec {
    /// Nominal tube outer diameter in mm (`> 0`). Automatically clamped per
    /// station to stay strictly inside the local airfoil skin.
    pub diameter_mm: f64,
    /// Depth of the hole along the blade span from the root base in mm (`> 0`).
    pub depth_mm: f64,
    /// Optional chordwise offset from the root thickest-core center in mm.
    pub offset_x_mm: f64,
    /// Optional thickness-direction offset from the root thickest-core center in mm.
    pub offset_y_mm: f64,
    /// Fit tolerance added to the bore **diameter** in mm (`0` = exact fit,
    /// typically `0.1..0.3` for FDM sliding fit).
    pub tolerance_mm: f64,
}

/// Cross-section / 3D geometry of an alignment or interlocking joint feature on a split face.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AlignmentShape {
    /// Round dowel pin (integrated cylinder) and matching round socket.
    Round,
    /// Rectangular key / tenon (long axis along the chord) and matching slot.
    Key,
    /// Butterfly / double-dovetail interlocking key (flared ends with a narrow
    /// waist along the chord) that mechanically locks against chordwise shear
    /// and peel.
    Dovetail,
    /// Orthogonal `+` cruciform cross-rib tenon and matching cross socket that
    /// resists both flapwise bending, lead-lag bending, and torsion.
    Cruciform,
    /// 3D self-centering tapered wedge / frustum tenon (`100%` at base tapering
    /// to `72%` at tip) and matching tapered socket for zero-backlash lock.
    Tapered,
    /// 3D axial snap-lock / barbed retention tenon with a necked base, flared
    /// retention ridge at `70%` height, and tapered lead-in tip, paired with a
    /// matching undercut socket cavity to resist spanwise pull-out.
    SnapLock,
}

/// Alignment pins / keys placed on every split face.
///
/// The lower segment receives integrated pins that protrude `+z`; the upper
/// segment receives matching blind sockets enlarged by the clearances below.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct AlignmentSpec {
    /// Pin cross-section shape.
    pub shape: AlignmentShape,
    /// Features per split face (`1` or `2`).
    pub count: usize,
    /// Pin diameter (round) or key width (key) in mm.
    pub size_mm: f64,
    /// Key length along the chord in mm (ignored for round pins).
    pub key_length_mm: f64,
    /// Pin height above the split face in mm.
    pub height_mm: f64,
    /// Distance from the tube / core center to each pin along the chord in mm
    /// (`<= 0` selects the smallest safe automatic spacing).
    pub spacing_mm: f64,
    /// Per-side radial / lateral socket clearance in mm.
    pub clearance_mm: f64,
    /// Extra socket depth beyond the pin height in mm.
    pub depth_clearance_mm: f64,
    /// Minimum wall kept between a socket and the outer airfoil skin in mm.
    pub min_wall_mm: f64,
}

impl Default for AlignmentSpec {
    fn default() -> Self {
        Self {
            shape: AlignmentShape::Round,
            count: 2,
            size_mm: 4.0,
            key_length_mm: 8.0,
            height_mm: 6.0,
            spacing_mm: 0.0,
            clearance_mm: 0.2,
            depth_clearance_mm: 0.5,
            min_wall_mm: 0.8,
        }
    }
}

/// Specification for spanwise blade splitting and carbon-fiber tube hole
/// fabrication.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct FabricationSpec {
    /// Optional carbon-fiber tube hole entering at the blade root base.
    pub spar_hole: Option<SparHoleSpec>,
    /// Number of spanwise printable segments (`1..=8`, `1` = unsplit full blade).
    pub split_parts: usize,
    /// Optional primary split span ratio in `[0.12, 0.88]` for 2-part splits
    /// (or first split plane when `split_parts >= 2`).
    pub split_ratio: Option<f64>,
    /// Optional 0-based segment index (`0..split_parts`) to isolate a single
    /// printable part. `None` outputs all segments.
    pub active_part: Option<usize>,
    /// Visual/export separation gap in mm along `+z` between segments when
    /// `active_part` is `None` and `split_parts > 1`.
    pub explode_gap_mm: f64,
    /// Optional alignment dowel pins / keys on every split face.
    pub alignment: Option<AlignmentSpec>,
}

impl Default for FabricationSpec {
    fn default() -> Self {
        Self {
            spar_hole: None,
            split_parts: 1,
            split_ratio: None,
            active_part: None,
            explode_gap_mm: 0.0,
            alignment: None,
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

// ---------------------------------------------------------------------------
// 2D contour helpers
// ---------------------------------------------------------------------------

/// Twice-signed area of a contour in the `x`/`y` plane (positive = CCW).
fn signed_area_xy(points: &[Point3]) -> f64 {
    let mut twice = 0.0;
    for index in 0..points.len() {
        let current = points[index];
        let next = points[(index + 1) % points.len()];
        twice += current.x * next.y - next.x * current.y;
    }
    twice / 2.0
}

/// Unit vector along the chord from the leading to the trailing edge.
fn chord_axis(section: &[Point3]) -> [f64; 2] {
    let n_le = section.len() / 2;
    let le = section[n_le];
    let te_x = 0.5 * (section[0].x + section[section.len() - 1].x);
    let te_y = 0.5 * (section[0].y + section[section.len() - 1].y);
    let dx = te_x - le.x;
    let dy = te_y - le.y;
    let len = dx.hypot(dy);
    if len < 1e-9 {
        [1.0, 0.0]
    } else {
        [dx / len, dy / len]
    }
}

/// Ray-casting point-in-polygon test for a closed contour in the `x`/`y` plane.
fn point_in_contour(contour: &[Point3], x: f64, y: f64) -> bool {
    let n = contour.len();
    let mut inside = false;
    let mut j = n - 1;
    for i in 0..n {
        let (xi, yi) = (contour[i].x, contour[i].y);
        let (xj, yj) = (contour[j].x, contour[j].y);
        if (yi > y) != (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi {
            inside = !inside;
        }
        j = i;
    }
    inside
}

/// Distance from a point to a line segment.
fn dist_point_segment(px: f64, py: f64, ax: f64, ay: f64, bx: f64, by: f64) -> f64 {
    let abx = bx - ax;
    let aby = by - ay;
    let len2 = abx * abx + aby * aby;
    let t = if len2 < 1e-18 {
        0.0
    } else {
        (((px - ax) * abx + (py - ay) * aby) / len2).clamp(0.0, 1.0)
    };
    (px - (ax + t * abx)).hypot(py - (ay + t * aby))
}

/// Smallest distance from a point to the closed contour edges.
fn distance_to_contour(contour: &[Point3], x: f64, y: f64) -> f64 {
    let n = contour.len();
    let mut best = f64::INFINITY;
    for i in 0..n {
        let a = contour[i];
        let b = contour[(i + 1) % n];
        best = best.min(dist_point_segment(x, y, a.x, a.y, b.x, b.y));
    }
    best
}

// ---------------------------------------------------------------------------
// Carbon tube bore geometry (straight coaxial cylinder along span)
// ---------------------------------------------------------------------------

/// A circle in a section plane describing the carbon tube bore.
#[derive(Debug, Clone, Copy)]
struct TubeCircle {
    cx: f64,
    cy: f64,
    cz: f64,
    radius: f64,
}

/// Straight coaxial centerline and uniform radius for the carbon-fiber spar
/// tube bore from `z_start` (`span_start_mm`) to `z_end` (`hole_end_mm`).
#[derive(Debug, Clone, Copy)]
struct SparTubeAxis {
    z_start: f64,
    z_end: f64,
    x_start: f64,
    y_start: f64,
    x_end: f64,
    y_end: f64,
    radius: f64,
}

impl SparTubeAxis {
    /// Plans a straight, uniform-radius cylindrical bore from `z_start` to `z_end`
    /// that stays strictly inside the airfoil skin across the entire bore depth.
    fn plan(
        surface: &BladeSurface,
        spec: SparHoleSpec,
        z_start: f64,
        z_end: f64,
    ) -> Result<Self, MeshError> {
        let samples = 9usize;
        let mut secs = Vec::with_capacity(samples);
        let mut cores = Vec::with_capacity(samples);
        let mut thicks = Vec::with_capacity(samples);
        for k in 0..samples {
            let frac = (k as f64) / ((samples - 1) as f64);
            let z = z_start + frac * (z_end - z_start);
            let sec = evaluate_section_at_span(surface, z)?;
            let (core, thick, _, _) = section_core_station(&sec);
            secs.push(sec);
            cores.push(core);
            thicks.push(thick);
        }

        let min_thick = thicks.iter().copied().fold(f64::INFINITY, f64::min);
        let max_offset = (0.15 * min_thick).max(0.0);
        let ox = spec.offset_x_mm.clamp(-max_offset, max_offset);
        let oy = spec.offset_y_mm.clamp(-max_offset, max_offset);

        let x0 = cores[0].x + ox;
        let y0 = cores[0].y + oy;
        let x1_core = cores[samples - 1].x + ox;
        let y1_core = cores[samples - 1].y + oy;

        let desired_radius = (0.5 * (spec.diameter_mm + spec.tolerance_mm.max(0.0))).max(0.2);

        // Search candidate vertical (+z) axes between (x0, y0) and (x1_core, y1_core)
        // to find the vertical cylinder with maximum skin wall clearance across all
        // sampled stations. If any vertical axis fits safely, use it (dx=0, dy=0);
        // otherwise fall back to the straight 3D line (x0, y0, z_start) -> (x1_core, y1_core, z_end).
        let mut best_vert = (x0, y0, 0.0_f64);
        for step in 0..=8 {
            let t = (step as f64) / 8.0;
            let vx = x0 + t * (x1_core - x0);
            let vy = y0 + t * (y1_core - y0);
            let min_r = secs
                .iter()
                .zip(thicks.iter())
                .map(|(sec, &th)| {
                    if point_in_contour(sec, vx, vy) {
                        (distance_to_contour(sec, vx, vy) - 0.55).min(0.38 * th)
                    } else {
                        0.0
                    }
                })
                .fold(f64::INFINITY, f64::min);
            if min_r > best_vert.2 {
                best_vert = (vx, vy, min_r);
            }
        }

        let (x_start, y_start, x_end, y_end) =
            if best_vert.2 >= desired_radius.min(0.35 * min_thick) && best_vert.2 >= 0.4 {
                (best_vert.0, best_vert.1, best_vert.0, best_vert.1)
            } else {
                (x0, y0, x1_core, y1_core)
            };

        let mut max_safe_radius = f64::INFINITY;
        for (k, (sec, &th)) in secs.iter().zip(thicks.iter()).enumerate() {
            let frac = (k as f64) / ((samples - 1) as f64);
            let cx = x_start + frac * (x_end - x_start);
            let cy = y_start + frac * (y_end - y_start);
            let skin_r = if point_in_contour(sec, cx, cy) {
                (distance_to_contour(sec, cx, cy) - 0.50).min(0.38 * th)
            } else {
                0.25
            };
            max_safe_radius = max_safe_radius.min(skin_r);
        }
        let radius = desired_radius.clamp(0.2, max_safe_radius.max(0.25));

        Ok(Self {
            z_start,
            z_end,
            x_start,
            y_start,
            x_end,
            y_end,
            radius,
        })
    }

    /// Evaluates the bore circle at spanwise station `z`.
    fn circle_at(&self, z: f64) -> TubeCircle {
        let span = self.z_end - self.z_start;
        let t = if span.abs() < 1e-9 {
            0.0
        } else {
            ((z - self.z_start) / span).clamp(0.0, 1.0)
        };
        TubeCircle {
            cx: self.x_start + t * (self.x_end - self.x_start),
            cy: self.y_start + t * (self.y_end - self.y_start),
            cz: z,
            radius: self.radius,
        }
    }
}

/// `HOLE_CIRCLE_SEGMENTS` counter-clockwise vertices of the bore circle.
fn ring_points(circle: &TubeCircle) -> Vec<Point3> {
    (0..HOLE_CIRCLE_SEGMENTS)
        .map(|k| {
            let angle = 2.0 * PI * (k as f64) / (HOLE_CIRCLE_SEGMENTS as f64);
            let (s, c) = angle.sin_cos();
            Point3 {
                x: circle.cx + circle.radius * c,
                y: circle.cy + circle.radius * s,
                z: circle.cz,
            }
        })
        .collect()
}

// ---------------------------------------------------------------------------
// Alignment & interlocking joint planning
// ---------------------------------------------------------------------------

/// One pin/tenon (lower part) and its matching socket/mortise (upper part).
///
/// Each is stored as an ordered stack of `(z_fraction, ring_xy)` stages from
/// `z_fraction = 0.0` (on the split plane) to `z_fraction = 1.0` (at the pin
/// tip or socket ceiling). All rings in a stack have the same vertex count and
/// counter-clockwise winding in the `x`/`y` plane.
#[derive(Debug, Clone)]
struct Feature {
    pin_rings: Vec<(f64, Vec<[f64; 2]>)>,
    socket_rings: Vec<(f64, Vec<[f64; 2]>)>,
}

/// All alignment / interlocking features of one split face.
#[derive(Debug, Clone)]
struct PlaneFeatures {
    features: Vec<Feature>,
    pin_height: f64,
    socket_depth: f64,
}

/// Counter-clockwise 2D outline of a pin/tenon or socket at a given stage scale.
///
/// `base_half_l` and `base_half_w` are the nominal pin half-dimensions (already
/// scaled by `stage_scale`), while `clearance` is `0.0` for the pin and
/// `spec.clearance_mm` for the socket so non-convex features (`Dovetail`,
/// `Cruciform`) receive uniform per-side clearance on every inner and outer wall.
fn outline_with_clearance(
    shape: AlignmentShape,
    center: [f64; 2],
    u: [f64; 2],
    base_half_l: f64,
    base_half_w: f64,
    clearance: f64,
) -> Vec<[f64; 2]> {
    let half_l = (base_half_l + clearance).max(0.25);
    let half_w = (base_half_w + clearance).max(0.25);
    let v = [-u[1], u[0]];
    let pt = |du: f64, dv: f64| {
        [
            center[0] + du * u[0] + dv * v[0],
            center[1] + du * u[1] + dv * v[1],
        ]
    };

    match shape {
        AlignmentShape::Round | AlignmentShape::SnapLock => (0..PIN_CIRCLE_SEGMENTS)
            .map(|k| {
                let a = 2.0 * PI * (k as f64) / (PIN_CIRCLE_SEGMENTS as f64);
                [center[0] + half_w * a.cos(), center[1] + half_w * a.sin()]
            })
            .collect(),
        AlignmentShape::Key | AlignmentShape::Tapered => vec![
            pt(half_l, -half_w),
            pt(half_l, half_w),
            pt(-half_l, half_w),
            pt(-half_l, -half_w),
        ],
        AlignmentShape::Dovetail => {
            // Butterfly / double-dovetail: narrow waist at u=0, flared wings at ±half_l.
            let waist_w = (0.52 * base_half_w + clearance).clamp(0.2, (0.88 * half_w).max(0.22));
            vec![
                pt(0.0, -waist_w),
                pt(half_l, -half_w),
                pt(half_l, half_w),
                pt(0.0, waist_w),
                pt(-half_l, half_w),
                pt(-half_l, -half_w),
            ]
        }
        AlignmentShape::Cruciform => {
            // 12-vertex orthogonal '+' cross-rib tenon / mortise.
            let tl = (0.38 * base_half_l + clearance).clamp(0.18, (0.78 * half_l).max(0.20));
            let tw = (0.42 * base_half_w + clearance).clamp(0.18, (0.78 * half_w).max(0.20));
            vec![
                pt(tl, -half_w),
                pt(tl, -tw),
                pt(half_l, -tw),
                pt(half_l, tw),
                pt(tl, tw),
                pt(tl, half_w),
                pt(-tl, half_w),
                pt(-tl, tw),
                pt(-half_l, tw),
                pt(-half_l, -tw),
                pt(-tl, -tw),
                pt(-tl, -half_w),
            ]
        }
    }
}

/// Builds the multi-stage `(z_fraction, ring_xy)` stacks for a pin and its
/// matching socket.
fn build_feature_rings(
    shape: AlignmentShape,
    center: [f64; 2],
    u: [f64; 2],
    half_l: f64,
    half_w: f64,
    clearance: f64,
) -> Feature {
    let stages: &[(f64, f64)] = match shape {
        AlignmentShape::Tapered => &[(0.0, 1.00), (0.50, 0.86), (1.0, 0.72)],
        AlignmentShape::SnapLock => &[(0.0, 0.85), (0.42, 0.85), (0.70, 1.00), (1.0, 0.74)],
        AlignmentShape::Round
        | AlignmentShape::Key
        | AlignmentShape::Dovetail
        | AlignmentShape::Cruciform => &[(0.0, 1.0), (1.0, 1.0)],
    };

    let pin_rings = stages
        .iter()
        .map(|&(zf, scale)| {
            (
                zf,
                outline_with_clearance(shape, center, u, half_l * scale, half_w * scale, 0.0),
            )
        })
        .collect();

    let socket_rings = stages
        .iter()
        .map(|&(zf, scale)| {
            (
                zf,
                outline_with_clearance(shape, center, u, half_l * scale, half_w * scale, clearance),
            )
        })
        .collect();

    Feature {
        pin_rings,
        socket_rings,
    }
}

/// Places pins / interlocking joints on a split face. Features that cannot keep
/// `min_wall_mm` to the skin (on every checked contour) are shrunk and, as a
/// last resort, skipped.
fn plan_features(
    contours: &[Vec<Point3>],
    tube: Option<TubeCircle>,
    spec: &AlignmentSpec,
) -> Vec<Feature> {
    let primary = &contours[0];
    let (core, _, _, _) = section_core_station(primary);
    let u = chord_axis(primary);
    let (bx, by, br) = tube
        .map(|t| (t.cx, t.cy, t.radius))
        .unwrap_or((core.x, core.y, 0.0));

    let signs: Vec<f64> = match (spec.count.clamp(1, 2), tube.is_some()) {
        (2, _) => vec![-1.0, 1.0],
        (_, true) => vec![1.0],
        (_, false) => vec![0.0],
    };
    let clearance = spec.clearance_mm.max(0.0);
    let wall = spec.min_wall_mm.max(0.0);

    let mut out = Vec::new();
    for sign in signs {
        for shrink in FIT_SHRINK_STEPS {
            let half_w = (0.5 * spec.size_mm * shrink).max(0.3);
            let half_l = match spec.shape {
                AlignmentShape::Round | AlignmentShape::SnapLock => half_w,
                AlignmentShape::Key
                | AlignmentShape::Dovetail
                | AlignmentShape::Cruciform
                | AlignmentShape::Tapered => (0.5 * spec.key_length_mm * shrink).max(0.3),
            };
            let sock_w = half_w + clearance;
            let sock_l = half_l + clearance;
            let bound = match spec.shape {
                AlignmentShape::Round | AlignmentShape::SnapLock => sock_w,
                AlignmentShape::Key
                | AlignmentShape::Dovetail
                | AlignmentShape::Cruciform
                | AlignmentShape::Tapered => sock_l.hypot(sock_w),
            };
            let min_spacing = br + bound + 0.8;
            let spacing = if spec.spacing_mm > 0.0 {
                spec.spacing_mm.max(min_spacing)
            } else if sign == 0.0 {
                0.0
            } else {
                min_spacing + 0.4
            };
            let center = [bx + sign * spacing * u[0], by + sign * spacing * u[1]];

            let fits = contours.iter().all(|c| {
                point_in_contour(c, center[0], center[1])
                    && distance_to_contour(c, center[0], center[1]) - bound >= wall
            });
            if fits {
                out.push(build_feature_rings(
                    spec.shape, center, u, half_l, half_w, clearance,
                ));
                break;
            }
        }
    }
    out
}

/// Plans the alignment features for the split face at `z_s`.
fn plan_plane(
    surface: &BladeSurface,
    z_s: f64,
    len_upper: f64,
    span_end: f64,
    spec: &AlignmentSpec,
    hole_axis: Option<SparTubeAxis>,
) -> Result<Option<PlaneFeatures>, MeshError> {
    let dc = spec.depth_clearance_mm.max(0.0);
    let max_depth = (0.6 * len_upper).max(1.0);
    let depth = (spec.height_mm.max(0.5) + dc).min(max_depth).max(1.0);
    let pin_height = (depth - dc).max(0.5);
    let z_deep = (z_s + depth).min(span_end);

    let contours = vec![
        evaluate_section_at_span(surface, z_s)?,
        evaluate_section_at_span(surface, z_deep)?,
    ];
    let tube = hole_axis.and_then(|axis| {
        if axis.z_end >= z_s - 1e-3 {
            Some(axis.circle_at(z_s))
        } else {
            None
        }
    });
    let features = plan_features(&contours, tube, spec);
    if features.is_empty() {
        Ok(None)
    } else {
        Ok(Some(PlaneFeatures {
            features,
            pin_height,
            socket_depth: depth,
        }))
    }
}

// ---------------------------------------------------------------------------
// Public tessellation entry point
// ---------------------------------------------------------------------------

/// Placement result for the alignment features of one split face.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct AlignmentReport {
    /// Spanwise position of the split face in mm.
    pub span_mm: f64,
    /// Number of features requested per face.
    pub requested: usize,
    /// Number of features that fit with the requested wall margin.
    pub placed: usize,
    /// Pin height actually used in mm (may be clamped by segment length).
    pub pin_height_mm: f64,
    /// Socket depth actually used in mm.
    pub socket_depth_mm: f64,
}

/// Returns the planned coaxial carbon-fiber spar tube axis
/// `[x_start, y_start, z_start, x_end, y_end, z_end, radius_mm]` when
/// `spec.spar_hole` is active.
///
/// # Errors
///
/// Returns [`MeshError`] if section evaluation fails.
pub fn spar_tube_axis_points(
    surface: &BladeSurface,
    spec: &FabricationSpec,
) -> Result<Option<[f64; 7]>, MeshError> {
    let active_hole = spec
        .spar_hole
        .filter(|h| h.diameter_mm > 0.1 && h.depth_mm > 0.1);
    let Some(h) = active_hole else {
        return Ok(None);
    };
    let span_start = surface.span_start_mm();
    let span_end = surface.span_end_mm();
    let hole_end_mm = (span_start + h.depth_mm).clamp(span_start + 1.0, span_end);
    let axis = SparTubeAxis::plan(surface, h, span_start, hole_end_mm)?;
    Ok(Some([
        axis.x_start,
        axis.y_start,
        axis.z_start,
        axis.x_end,
        axis.y_end,
        axis.z_end,
        axis.radius,
    ]))
}

/// Reports how many alignment features fit on each interior split face.
///
/// Features that cannot keep the requested wall to the skin are shrunk and,
/// as a last resort, omitted; this lets a UI warn instead of silently
/// dropping pins.
///
/// # Errors
///
/// Returns [`MeshError`] if a section cannot be evaluated.
pub fn alignment_report(
    surface: &BladeSurface,
    spec: &FabricationSpec,
) -> Result<Vec<AlignmentReport>, MeshError> {
    let split_parts = spec.split_parts.clamp(1, 8);
    let Some(align) = spec.alignment else {
        return Ok(Vec::new());
    };
    if split_parts < 2 {
        return Ok(Vec::new());
    }
    let span_start = surface.span_start_mm();
    let span_end = surface.span_end_mm();
    let bounds = compute_split_spans(span_start, span_end, split_parts, spec.split_ratio);
    let active_hole = spec
        .spar_hole
        .filter(|h| h.diameter_mm > 0.1 && h.depth_mm > 0.1);
    let hole_end_mm = active_hole
        .map(|h| (span_start + h.depth_mm).clamp(span_start + 1.0, span_end))
        .unwrap_or(span_start);
    let hole_axis = match active_hole {
        Some(h) => Some(SparTubeAxis::plan(surface, h, span_start, hole_end_mm)?),
        None => None,
    };

    let mut out = Vec::with_capacity(split_parts - 1);
    for i in 1..split_parts {
        let plane = plan_plane(
            surface,
            bounds[i],
            bounds[i + 1] - bounds[i],
            span_end,
            &align,
            hole_axis,
        )?;
        out.push(AlignmentReport {
            span_mm: bounds[i],
            requested: align.count.clamp(1, 2),
            placed: plane.as_ref().map_or(0, |p| p.features.len()),
            pin_height_mm: plane.as_ref().map_or(0.0, |p| p.pin_height),
            socket_depth_mm: plane.as_ref().map_or(0.0, |p| p.socket_depth),
        });
    }
    Ok(out)
}

/// Tessellates `surface` with optional carbon-fiber base hole, spanwise
/// segment splitting, and alignment pins / keys on the split faces.
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
    let hole_axis = match active_hole {
        Some(h) => Some(SparTubeAxis::plan(surface, h, span_start, hole_end_mm)?),
        None => None,
    };

    // Alignment features for every interior split face.
    let mut planes: Vec<Option<PlaneFeatures>> = Vec::with_capacity(split_parts + 1);
    for i in 0..=split_parts {
        let plane = match spec.alignment {
            Some(align) if i > 0 && i < split_parts => plan_plane(
                surface,
                split_bounds[i],
                split_bounds[i + 1] - split_bounds[i],
                span_end,
                &align,
                hole_axis,
            )?,
            _ => None,
        };
        planes.push(plane);
    }

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

        let seg_hole = hole_axis.and_then(|axis| {
            if hole_end_mm > z_a + 1e-3 {
                Some((axis, hole_end_mm.min(z_b)))
            } else {
                None
            }
        });

        let ctx = SegmentContext {
            seg_hole,
            bottom: planes[part_idx].as_ref(),
            top: planes[part_idx + 1].as_ref(),
            z_shift,
        };
        append_segment_mesh(surface, &seg_spans, &ctx, &mut vertices, &mut triangles)?;
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

// ---------------------------------------------------------------------------
// Segment construction
// ---------------------------------------------------------------------------

/// Per-segment build inputs.
struct SegmentContext<'a> {
    /// Coaxial carbon tube bore axis and the (unshifted) `z` where it ends inside this segment.
    seg_hole: Option<(SparTubeAxis, f64)>,
    /// Split face below this segment (sockets are cut into its bottom cap).
    bottom: Option<&'a PlaneFeatures>,
    /// Split face above this segment (pins grow from its top cap).
    top: Option<&'a PlaneFeatures>,
    /// Exploded-view shift along `+z` in mm.
    z_shift: f64,
}

/// A closed ring of vertices lying in a cap plane.
#[derive(Debug, Clone, Copy)]
struct CapHole {
    start: usize,
    len: usize,
}

/// Pushes a planar ring of `points` at height `z` and returns its first index.
fn push_ring(vertices: &mut Vec<Point3>, points: &[[f64; 2]], z: f64) -> usize {
    let start = vertices.len();
    for p in points {
        vertices.push(Point3 {
            x: p[0],
            y: p[1],
            z,
        });
    }
    start
}

/// Connects two equal-length rings with a wall; `outward` selects the
/// winding for a counter-clockwise ring (outward = solid pin, inward = cavity).
fn push_wall(triangles: &mut Vec<Triangle>, lower: usize, upper: usize, n: usize, outward: bool) {
    for k in 0..n {
        let kn = (k + 1) % n;
        let a = (lower + k) as u32;
        let b = (lower + kn) as u32;
        let c = (upper + kn) as u32;
        let d = (upper + k) as u32;
        if outward {
            triangles.push(Triangle::new(a, b, c));
            triangles.push(Triangle::new(a, c, d));
        } else {
            triangles.push(Triangle::new(a, c, b));
            triangles.push(Triangle::new(a, d, c));
        }
    }
}

/// Triangle-fans a convex counter-clockwise ring (`up` = `+z` normal).
fn push_disc(triangles: &mut Vec<Triangle>, start: usize, n: usize, up: bool) {
    for k in 1..(n - 1) {
        let a = start as u32;
        let b = (start + k) as u32;
        let c = (start + k + 1) as u32;
        if up {
            triangles.push(Triangle::new(a, b, c));
        } else {
            triangles.push(Triangle::new(a, c, b));
        }
    }
}

/// Ear-clips a simple planar ring (convex or non-convex, such as `Dovetail` or
/// `Cruciform`) at `vertices[start..start + n]` with `+z` (`up = true`) or `-z`
/// (`up = false`) normal.
fn push_polygon_cap(
    vertices: &[Point3],
    triangles: &mut Vec<Triangle>,
    start: usize,
    n: usize,
    up: bool,
    section_id: usize,
) -> Result<(), MeshError> {
    let local = triangulate_cap(&vertices[start..(start + n)], section_id)?;
    let offset = start as u32;
    for [a, b, c] in local {
        let ia = a as u32 + offset;
        let ib = b as u32 + offset;
        let ic = c as u32 + offset;
        if up {
            triangles.push(Triangle::new(ia, ib, ic));
        } else {
            triangles.push(Triangle::new(ia, ic, ib));
        }
    }
    Ok(())
}

/// Appends one closed watertight segment mesh over `seg_spans` into
/// `vertices` and `triangles`.
fn append_segment_mesh(
    surface: &BladeSurface,
    seg_spans: &[f64],
    ctx: &SegmentContext<'_>,
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
            pt.z += ctx.z_shift;
        }
        vertices.extend_from_slice(&sec);
        sections.push(sec);
    }
    let ccw = signed_area_xy(&sections[0]) > 0.0;

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
            if ccw {
                triangles.push(Triangle::new(a, b, c));
                triangles.push(Triangle::new(a, c, d));
            } else {
                triangles.push(Triangle::new(a, c, b));
                triangles.push(Triangle::new(a, d, c));
            }
        }
    }

    let top_outer_start = outer_base + (sec_count - 1) * point_count;
    let mut bottom_holes: Vec<CapHole> = Vec::new();
    let mut top_holes: Vec<CapHole> = Vec::new();

    // Carbon tube bore: straight coaxial inward-facing wall, blind end disc if it stops here.
    if let Some((hole_axis, z_hole_top)) = ctx.seg_hole {
        let mut hole_last_sec = 0;
        for (idx, &z) in seg_spans.iter().enumerate() {
            if z <= z_hole_top + 1e-3 {
                hole_last_sec = idx;
            }
        }
        let hole_last_sec = hole_last_sec.clamp(1, sec_count - 1);
        let is_through_hole = hole_last_sec == sec_count - 1;

        let mut ring_starts: Vec<usize> = Vec::with_capacity(hole_last_sec + 1);
        for &z_unshifted in seg_spans.iter().take(hole_last_sec + 1) {
            let mut circle = hole_axis.circle_at(z_unshifted);
            circle.cz += ctx.z_shift;
            let ring = ring_points(&circle);
            ring_starts.push(vertices.len());
            vertices.extend_from_slice(&ring);
        }
        for s in 0..hole_last_sec {
            push_wall(
                triangles,
                ring_starts[s],
                ring_starts[s + 1],
                HOLE_CIRCLE_SEGMENTS,
                false,
            );
        }
        bottom_holes.push(CapHole {
            start: ring_starts[0],
            len: HOLE_CIRCLE_SEGMENTS,
        });
        if is_through_hole {
            top_holes.push(CapHole {
                start: ring_starts[hole_last_sec],
                len: HOLE_CIRCLE_SEGMENTS,
            });
        } else {
            push_disc(
                triangles,
                ring_starts[hole_last_sec],
                HOLE_CIRCLE_SEGMENTS,
                false,
            );
        }
    }

    // Alignment / interlocking sockets cut into the bottom face (blind cavities).
    if let Some(plane) = ctx.bottom {
        let z0 = seg_spans[0] + ctx.z_shift;
        for feature in &plane.features {
            if feature.socket_rings.len() < 2 {
                continue;
            }
            let n = feature.socket_rings[0].1.len();
            let mut starts = Vec::with_capacity(feature.socket_rings.len());
            for (zf, ring) in &feature.socket_rings {
                starts.push(push_ring(vertices, ring, z0 + zf * plane.socket_depth));
            }
            for w in starts.windows(2) {
                push_wall(triangles, w[0], w[1], n, false);
            }
            if let Some(&ceiling) = starts.last() {
                push_polygon_cap(vertices, triangles, ceiling, n, false, 0)?;
            }
            bottom_holes.push(CapHole {
                start: starts[0],
                len: n,
            });
        }
    }

    // Alignment / interlocking pins growing from the top face (closed solid protrusions).
    if let Some(plane) = ctx.top {
        let z1 = seg_spans[sec_count - 1] + ctx.z_shift;
        for feature in &plane.features {
            if feature.pin_rings.len() < 2 {
                continue;
            }
            let n = feature.pin_rings[0].1.len();
            let mut starts = Vec::with_capacity(feature.pin_rings.len());
            for (zf, ring) in &feature.pin_rings {
                starts.push(push_ring(vertices, ring, z1 + zf * plane.pin_height));
            }
            for w in starts.windows(2) {
                push_wall(triangles, w[0], w[1], n, true);
            }
            if let Some(&tip) = starts.last() {
                push_polygon_cap(vertices, triangles, tip, n, true, sec_count - 1)?;
            }
            top_holes.push(CapHole {
                start: starts[0],
                len: n,
            });
        }
    }

    append_cap_with_holes(
        vertices,
        outer_base,
        point_count,
        &bottom_holes,
        false,
        0,
        triangles,
    )?;
    append_cap_with_holes(
        vertices,
        top_outer_start,
        point_count,
        &top_holes,
        true,
        sec_count - 1,
        triangles,
    )?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Planar cap triangulation with holes (bridging + ear clipping)
// ---------------------------------------------------------------------------

fn xy(vertices: &[Point3], index: usize) -> (f64, f64) {
    (vertices[index].x, vertices[index].y)
}

fn signed_area_ids(vertices: &[Point3], ids: &[usize]) -> f64 {
    let mut twice = 0.0;
    for k in 0..ids.len() {
        let (ax, ay) = xy(vertices, ids[k]);
        let (bx, by) = xy(vertices, ids[(k + 1) % ids.len()]);
        twice += ax * by - bx * ay;
    }
    twice / 2.0
}

fn orient(a: (f64, f64), b: (f64, f64), c: (f64, f64)) -> f64 {
    (b.0 - a.0) * (c.1 - a.1) - (b.1 - a.1) * (c.0 - a.0)
}

/// Proper (interior) crossing of segments `ab` and `cd`.
fn segments_cross(a: (f64, f64), b: (f64, f64), c: (f64, f64), d: (f64, f64)) -> bool {
    let o1 = orient(a, b, c);
    let o2 = orient(a, b, d);
    let o3 = orient(c, d, a);
    let o4 = orient(c, d, b);
    ((o1 > 0.0 && o2 < 0.0) || (o1 < 0.0 && o2 > 0.0))
        && ((o3 > 0.0 && o4 < 0.0) || (o3 < 0.0 && o4 > 0.0))
}

fn point_in_ids(vertices: &[Point3], ids: &[usize], p: (f64, f64)) -> bool {
    let n = ids.len();
    let mut inside = false;
    let mut j = n - 1;
    for i in 0..n {
        let (xi, yi) = xy(vertices, ids[i]);
        let (xj, yj) = xy(vertices, ids[j]);
        if (yi > p.1) != (yj > p.1) && p.0 < (xj - xi) * (p.1 - yi) / (yj - yi) + xi {
            inside = !inside;
        }
        j = i;
    }
    inside
}

/// True when the bridge `h -> p` lies strictly inside the polygon region.
fn bridge_is_valid(
    vertices: &[Point3],
    poly: &[usize],
    hole: &[usize],
    others: &[Vec<usize>],
    h: usize,
    p: usize,
) -> bool {
    let ph = xy(vertices, h);
    let pp = xy(vertices, p);
    let blocked_by = |ring: &[usize]| -> bool {
        for i in 0..ring.len() {
            let a = ring[i];
            let b = ring[(i + 1) % ring.len()];
            if a == h || a == p || b == h || b == p {
                continue;
            }
            if segments_cross(ph, pp, xy(vertices, a), xy(vertices, b)) {
                return true;
            }
        }
        false
    };
    if blocked_by(poly) || blocked_by(hole) || others.iter().any(|r| blocked_by(r)) {
        return false;
    }
    let mid = (0.5 * (ph.0 + pp.0), 0.5 * (ph.1 + pp.1));
    point_in_ids(vertices, poly, mid)
        && !point_in_ids(vertices, hole, mid)
        && !others.iter().any(|r| point_in_ids(vertices, r, mid))
}

/// Merges a clockwise `hole` ring into the counter-clockwise `poly` through
/// the shortest unobstructed bridge.
fn merge_hole(
    vertices: &[Point3],
    poly: &mut Vec<usize>,
    hole: &[usize],
    others: &[Vec<usize>],
    section_id: usize,
) -> Result<(), MeshError> {
    let mut candidates: Vec<(f64, usize, usize)> = Vec::with_capacity(hole.len() * poly.len());
    for (hi, &h) in hole.iter().enumerate() {
        let (hx, hy) = xy(vertices, h);
        for (pi, &p) in poly.iter().enumerate() {
            let (px, py) = xy(vertices, p);
            candidates.push(((hx - px).powi(2) + (hy - py).powi(2), hi, pi));
        }
    }
    candidates.sort_by(|a, b| a.0.total_cmp(&b.0));

    for &(_, hi, pi) in &candidates {
        let h = hole[hi];
        let p = poly[pi];
        if h == p || !bridge_is_valid(vertices, poly, hole, others, h, p) {
            continue;
        }
        let mut merged = Vec::with_capacity(poly.len() + hole.len() + 2);
        merged.extend_from_slice(&poly[..=pi]);
        for k in 0..hole.len() {
            merged.push(hole[(hi + k) % hole.len()]);
        }
        merged.push(hole[hi]);
        merged.push(p);
        merged.extend_from_slice(&poly[pi + 1..]);
        *poly = merged;
        return Ok(());
    }
    Err(MeshError::CapTriangulation {
        section: section_id,
    })
}

/// Triangulates the planar cap bounded by the contour at `outer_start` minus
/// every ring in `holes`. `normal_up` selects a `+z` (true) or `-z` normal.
fn append_cap_with_holes(
    vertices: &[Point3],
    outer_start: usize,
    point_count: usize,
    holes: &[CapHole],
    normal_up: bool,
    section_id: usize,
    triangles: &mut Vec<Triangle>,
) -> Result<(), MeshError> {
    let mut poly: Vec<usize> = (outer_start..outer_start + point_count).collect();
    if signed_area_ids(vertices, &poly) < 0.0 {
        poly.reverse();
    }

    let mut rings: Vec<Vec<usize>> = holes
        .iter()
        .map(|h| {
            let mut ring: Vec<usize> = (h.start..h.start + h.len).collect();
            if signed_area_ids(vertices, &ring) > 0.0 {
                ring.reverse();
            }
            ring
        })
        .collect();

    while !rings.is_empty() {
        let hole = rings.remove(0);
        merge_hole(vertices, &mut poly, &hole, &rings, section_id)?;
    }

    let pts: Vec<Point3> = poly.iter().map(|&i| vertices[i]).collect();
    for [a, b, c] in triangulate_cap(&pts, section_id)? {
        let ga = poly[a] as u32;
        let gb = poly[b] as u32;
        let gc = poly[c] as u32;
        if normal_up {
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

    fn tube(depth: f64) -> SparHoleSpec {
        SparHoleSpec {
            diameter_mm: 5.0,
            depth_mm: depth,
            offset_x_mm: 0.0,
            offset_y_mm: 0.0,
            tolerance_mm: 0.0,
        }
    }

    fn two_part(alignment: Option<AlignmentSpec>, active_part: Option<usize>) -> FabricationSpec {
        FabricationSpec {
            spar_hole: Some(tube(360.0)),
            split_parts: 2,
            split_ratio: Some(0.5),
            active_part,
            explode_gap_mm: 20.0,
            alignment,
        }
    }

    fn volume_of(surface: &BladeSurface, spec: &FabricationSpec) -> f64 {
        let mesh = tessellate_fabricated(surface, spec).expect("mesh builds");
        let report = check_mesh(&mesh);
        assert!(
            report.is_valid_solid(),
            "must be a valid watertight solid: {:?}",
            report.issues()
        );
        assert_eq!(report.boundary_edges, 0);
        assert_eq!(report.non_manifold_edges, 0);
        assert_eq!(report.inconsistent_edges, 0);
        report.volume_mm3
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
                spar_hole: Some(tube(200.0)),
                ..FabricationSpec::default()
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
        let spec_all = two_part(None, None);
        let _ = volume_of(&surface, &spec_all);
        for part in [0, 1] {
            let _ = volume_of(&surface, &two_part(None, Some(part)));
        }
    }

    #[test]
    fn round_dowel_pins_and_sockets_are_watertight_and_change_part_volumes() {
        let surface = fixture_surface();
        let plain0 = volume_of(&surface, &two_part(None, Some(0)));
        let plain1 = volume_of(&surface, &two_part(None, Some(1)));

        let align = Some(AlignmentSpec::default());
        let _ = volume_of(&surface, &two_part(align, None));
        let pinned0 = volume_of(&surface, &two_part(align, Some(0)));
        let socketed1 = volume_of(&surface, &two_part(align, Some(1)));

        assert!(
            pinned0 > plain0 + 1.0,
            "lower part must gain pin volume: {pinned0} vs {plain0}"
        );
        assert!(
            socketed1 < plain1 - 1.0,
            "upper part must lose socket volume: {socketed1} vs {plain1}"
        );
    }

    #[test]
    fn rectangular_keys_are_watertight_and_larger_clearance_enlarges_sockets() {
        let surface = fixture_surface();
        let plain1 = volume_of(&surface, &two_part(None, Some(1)));

        let key = |clearance: f64| AlignmentSpec {
            shape: AlignmentShape::Key,
            size_mm: 2.0,
            key_length_mm: 4.0,
            clearance_mm: clearance,
            ..AlignmentSpec::default()
        };
        let report = alignment_report(&surface, &two_part(Some(key(0.2)), None)).unwrap();
        assert_eq!(report.len(), 1);
        assert_eq!(report[0].placed, 2, "both keys must fit: {report:?}");
        assert!(
            report[0].pin_height_mm > 1.0 && report[0].socket_depth_mm > report[0].pin_height_mm
        );
        let tight = volume_of(&surface, &two_part(Some(key(0.1)), Some(1)));
        assert!(tight < plain1 - 0.5, "key sockets remove material");
        let _ = volume_of(&surface, &two_part(Some(key(0.2)), Some(0)));

        // Round pins small enough to never need shrinking: a larger clearance
        // must cut strictly larger sockets.
        let round = |clearance: f64| AlignmentSpec {
            size_mm: 2.0,
            clearance_mm: clearance,
            ..AlignmentSpec::default()
        };
        let snug = volume_of(&surface, &two_part(Some(round(0.1)), Some(1)));
        let sloppy = volume_of(&surface, &two_part(Some(round(0.4)), Some(1)));
        assert!(
            sloppy < snug - 0.5,
            "bigger clearance must cut bigger sockets: {sloppy} vs {snug}"
        );
    }

    #[test]
    fn tube_bore_tolerance_enlarges_the_bore() {
        let surface = fixture_surface();
        let mut exact = two_part(None, Some(0));
        exact.spar_hole = Some(SparHoleSpec {
            diameter_mm: 3.0,
            tolerance_mm: 0.0,
            ..tube(360.0)
        });
        let mut loose = exact;
        loose.spar_hole = Some(SparHoleSpec {
            tolerance_mm: 0.6,
            ..exact.spar_hole.unwrap()
        });
        assert!(volume_of(&surface, &loose) < volume_of(&surface, &exact) - 10.0);
    }

    #[test]
    fn single_pin_without_tube_and_three_way_split_stay_watertight() {
        let surface = fixture_surface();
        let spec = FabricationSpec {
            spar_hole: None,
            split_parts: 3,
            split_ratio: Some(0.35),
            active_part: None,
            explode_gap_mm: 10.0,
            alignment: Some(AlignmentSpec {
                count: 1,
                ..AlignmentSpec::default()
            }),
        };
        let _ = volume_of(&surface, &spec);
        for part in 0..3 {
            let mut single = spec;
            single.active_part = Some(part);
            let _ = volume_of(&surface, &single);
        }
    }

    #[test]
    fn library_airfoils_sg6043_sd7062_e387_tessellate_with_spar_hole_and_splits() {
        use blade_model::AirfoilSpec;
        let json = include_str!("../../../fixtures/naca4412-linear.json");
        for name in ["SG6043", "SD7062", "E387", "S833"] {
            let mut design = Design::from_json(json).unwrap();
            for st in &mut design.airfoils {
                st.airfoil = AirfoilSpec::Named {
                    name: name.to_string(),
                };
            }
            let blade = resolve(&design).unwrap();
            let sections = blade_geom::build_sections(&blade).unwrap();
            let surface = blade_geom::loft(&sections).unwrap();

            // 1. Plain tessellation
            let plain = tessellate(&surface, &MeshOptions::default())
                .unwrap_or_else(|e| panic!("{name} plain tessellate failed: {e}"));
            assert!(check_mesh(&plain).is_valid_solid(), "{name} plain solid");

            // 2. With default UI spar hole (5 mm diameter, 180 mm depth)
            let spec_hole = FabricationSpec {
                spar_hole: Some(tube(180.0)),
                split_parts: 1,
                ..FabricationSpec::default()
            };
            let with_hole = tessellate_fabricated(&surface, &spec_hole)
                .unwrap_or_else(|e| panic!("{name} spar hole failed: {e}"));
            assert!(
                check_mesh(&with_hole).is_valid_solid(),
                "{name} spar hole solid"
            );

            // 3. With 2-part split + round alignment pins
            let spec_split = two_part(Some(AlignmentSpec::default()), None);
            let with_split = tessellate_fabricated(&surface, &spec_split)
                .unwrap_or_else(|e| panic!("{name} split+pins failed: {e}"));
            assert!(
                check_mesh(&with_split).is_valid_solid(),
                "{name} split+pins solid"
            );

            // 4. With 2-part split + rectangular alignment keys
            let spec_keys = two_part(
                Some(AlignmentSpec {
                    shape: AlignmentShape::Key,
                    size_mm: 2.5,
                    key_length_mm: 5.0,
                    ..AlignmentSpec::default()
                }),
                None,
            );
            let with_keys = tessellate_fabricated(&surface, &spec_keys)
                .unwrap_or_else(|e| panic!("{name} split+keys failed: {e}"));
            assert!(
                check_mesh(&with_keys).is_valid_solid(),
                "{name} split+keys solid"
            );
        }
    }

    #[test]
    fn interlocking_joints_dovetail_cruciform_tapered_snaplock_are_watertight() {
        let surface = fixture_surface();
        let baseline_p0 = volume_of(&surface, &two_part(None, Some(0)));
        let baseline_p1 = volume_of(&surface, &two_part(None, Some(1)));

        for shape in [
            AlignmentShape::Dovetail,
            AlignmentShape::Cruciform,
            AlignmentShape::Tapered,
            AlignmentShape::SnapLock,
        ] {
            let align = AlignmentSpec {
                shape,
                count: 2,
                size_mm: 3.0,
                key_length_mm: 5.5,
                height_mm: 6.0,
                clearance_mm: 0.2,
                depth_clearance_mm: 0.5,
                min_wall_mm: 0.8,
                ..AlignmentSpec::default()
            };
            let full = two_part(Some(align), None);
            let rep = alignment_report(&surface, &full).unwrap();
            assert_eq!(rep.len(), 1);
            assert!(
                rep[0].placed >= 1,
                "{shape:?} should place at least 1 joint"
            );

            let _ = volume_of(&surface, &full);
            let p0 = volume_of(&surface, &two_part(Some(align), Some(0)));
            let p1 = volume_of(&surface, &two_part(Some(align), Some(1)));
            assert!(
                p0 > baseline_p0 + 1.0,
                "{shape:?} lower part must gain tenon volume: {p0} vs {baseline_p0}"
            );
            assert!(
                p1 < baseline_p1 - 1.0,
                "{shape:?} upper part must lose mortise volume: {p1} vs {baseline_p1}"
            );
        }
    }
}
