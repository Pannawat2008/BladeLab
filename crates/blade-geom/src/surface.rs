//! Spanwise lofting: one B-spline surface that passes through every section.
//!
//! The loft is the single source of truth for blade geometry (`D-lead1-002`):
//! tessellation (`blade-mesh`) and B-rep construction (`blade-cad`) must both
//! derive from the surface returned by [`loft`].
//!
//! Each section keeps the contour convention documented on
//! [`crate::Airfoil`] (upper trailing edge → leading edge → lower trailing
//! edge). The surface interpolates the sections in the spanwise direction with
//! a clamped B-spline of degree `min(3, sections − 1)`, so evaluating the
//! surface at a section parameter reproduces that section to within
//! [`PASS_THROUGH_TOLERANCE_MM`].

use crate::airfoil::Airfoil;
use crate::error::GeomError;

/// Maximum spanwise polynomial degree used by [`loft`].
const MAX_DEGREE: usize = 3;

/// Minimum number of points per section.
const MIN_SECTION_POINTS: usize = 3;

/// Largest accepted deviation between the surface and an input section, in mm.
///
/// This is the tolerance required by T-004 ("loft passes through all
/// sections, tolerance < 1e-6 mm"). The implementation is more accurate than
/// this in practice; the constant documents the contract.
pub const PASS_THROUGH_TOLERANCE_MM: f64 = 1e-6;

/// Pivot magnitude below which the interpolation matrix is treated as singular.
const SINGULAR_PIVOT: f64 = 1e-12;

/// A point in 3-D space, in millimetres.
///
/// Coordinate convention for a blade: `z` runs along the span (root → tip),
/// `x` along the chord and `y` along the thickness direction.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Point3 {
    /// Chordwise coordinate in mm.
    pub x: f64,
    /// Thickness-direction coordinate in mm.
    pub y: f64,
    /// Spanwise coordinate in mm.
    pub z: f64,
}

impl Point3 {
    /// Builds a point, rejecting `NaN` and infinite coordinates.
    ///
    /// # Errors
    ///
    /// Returns [`GeomError::NonFinite`] naming the first non-finite coordinate.
    pub fn new(x: f64, y: f64, z: f64) -> Result<Self, GeomError> {
        for (field, value) in [("x", x), ("y", y), ("z", z)] {
            if !value.is_finite() {
                return Err(GeomError::NonFinite { field, value });
            }
        }
        Ok(Self { x, y, z })
    }

    /// Euclidean distance to `other` in mm.
    #[must_use]
    pub fn distance_to(&self, other: &Self) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        let dz = self.z - other.z;
        (dx * dx + dy * dy + dz * dz).sqrt()
    }
}

/// One blade cross-section placed in 3-D.
///
/// `points` follow the [`Airfoil`] contour convention and must have the same
/// length in every section of a loft.
#[derive(Debug, Clone, PartialEq)]
pub struct Section3D {
    span_mm: f64,
    points: Vec<Point3>,
}

impl Section3D {
    /// Builds a section at spanwise station `span_mm`.
    ///
    /// # Errors
    ///
    /// - [`GeomError::NonFinite`] if `span_mm` or any point is not finite.
    /// - [`GeomError::TooFewSamples`] when fewer than 3 points are supplied.
    pub fn new(span_mm: f64, points: Vec<Point3>) -> Result<Self, GeomError> {
        if !span_mm.is_finite() {
            return Err(GeomError::NonFinite {
                field: "span_mm",
                value: span_mm,
            });
        }
        if points.len() < MIN_SECTION_POINTS {
            return Err(GeomError::TooFewSamples {
                min: MIN_SECTION_POINTS,
                got: points.len(),
            });
        }
        for point in &points {
            Point3::new(point.x, point.y, point.z)?;
        }
        Ok(Self { span_mm, points })
    }

    /// Places an airfoil contour in 3-D: scaled to `chord_mm`, rotated by
    /// `twist_deg` about the pitch axis, and moved to spanwise station
    /// `span_mm`.
    ///
    /// Positive twist rotates the leading edge towards `+y` when viewed from
    /// the tip (counter-clockwise in the chord/thickness plane). Rotation is
    /// performed about `x = pitch_axis_ratio · chord_mm`, which is the usual
    /// definition of blade twist (0.25–0.30 for small turbines).
    ///
    /// # Errors
    ///
    /// - [`GeomError::InvalidChord`] when `chord_mm` is not finite and
    ///   strictly positive.
    /// - [`GeomError::NonFinite`] when `twist_deg`, `pitch_axis_ratio` or
    ///   `span_mm` is not finite.
    /// - [`GeomError::OutOfRange`] when `pitch_axis_ratio` is outside `[0, 1]`.
    pub fn from_airfoil(
        airfoil: &Airfoil,
        chord_mm: f64,
        twist_deg: f64,
        pitch_axis_ratio: f64,
        span_mm: f64,
    ) -> Result<Self, GeomError> {
        if !chord_mm.is_finite() || chord_mm <= 0.0 {
            return Err(GeomError::InvalidChord(chord_mm));
        }
        for (field, value) in [
            ("twist_deg", twist_deg),
            ("pitch_axis_ratio", pitch_axis_ratio),
        ] {
            if !value.is_finite() {
                return Err(GeomError::NonFinite { field, value });
            }
        }
        if !(0.0..=1.0).contains(&pitch_axis_ratio) {
            return Err(GeomError::OutOfRange {
                field: "pitch_axis_ratio",
                value: pitch_axis_ratio,
                min: 0.0,
                max: 1.0,
            });
        }

        let scale = chord_mm / airfoil.chord_mm();
        let (sin_twist, cos_twist) = twist_deg.to_radians().sin_cos();
        let pivot = pitch_axis_ratio * chord_mm;

        let mut points = Vec::with_capacity(airfoil.points().len());
        for point in airfoil.points() {
            let x = point.x * scale - pivot;
            let y = point.y * scale;
            points.push(Point3::new(
                pivot + x * cos_twist - y * sin_twist,
                x * sin_twist + y * cos_twist,
                span_mm,
            )?);
        }

        Self::new(span_mm, points)
    }

    /// Spanwise position of this section in mm.
    #[must_use]
    pub fn span_mm(&self) -> f64 {
        self.span_mm
    }

    /// Section contour points (see [`Airfoil`] for the ordering).
    #[must_use]
    pub fn points(&self) -> &[Point3] {
        &self.points
    }
}

/// A spanwise B-spline surface interpolating a stack of sections.
///
/// `control_points[i][j]` is the `i`-th spanwise control point of the `j`-th
/// contour point. The surface is `S(v, j) = Σ_i N_{i,p}(v) · control[i][j]`,
/// where `v` is the normalised span parameter returned by
/// [`BladeSurface::section_params`].
#[derive(Debug, Clone, PartialEq)]
pub struct BladeSurface {
    degree: usize,
    knots: Vec<f64>,
    control_points: Vec<Vec<Point3>>,
    section_params: Vec<f64>,
    point_count: usize,
    span_start_mm: f64,
    span_end_mm: f64,
}

impl BladeSurface {
    /// Spanwise polynomial degree (`min(3, sections − 1)`).
    #[must_use]
    pub fn degree(&self) -> usize {
        self.degree
    }

    /// Clamped spanwise knot vector.
    #[must_use]
    pub fn knots(&self) -> &[f64] {
        &self.knots
    }

    /// Spanwise control net, indexed as `[control_point][contour_point]`.
    #[must_use]
    pub fn control_points(&self) -> &[Vec<Point3>] {
        &self.control_points
    }

    /// Normalised span parameters of the input sections (first `0`, last `1`).
    #[must_use]
    pub fn section_params(&self) -> &[f64] {
        &self.section_params
    }

    /// Number of input sections.
    #[must_use]
    pub fn section_count(&self) -> usize {
        self.section_params.len()
    }

    /// Number of contour points per section.
    #[must_use]
    pub fn point_count(&self) -> usize {
        self.point_count
    }

    /// Root spanwise station in mm.
    #[must_use]
    pub fn span_start_mm(&self) -> f64 {
        self.span_start_mm
    }

    /// Tip spanwise station in mm.
    #[must_use]
    pub fn span_end_mm(&self) -> f64 {
        self.span_end_mm
    }

    /// Evaluates the surface at normalised span parameter `v` and contour
    /// index `point_index`.
    ///
    /// # Errors
    ///
    /// - [`GeomError::PointIndexOutOfRange`] for an invalid `point_index`.
    /// - [`GeomError::NonFinite`] / [`GeomError::OutOfRange`] when `v` is not
    ///   inside `[0, 1]`.
    pub fn point_at(&self, v: f64, point_index: usize) -> Result<Point3, GeomError> {
        if !v.is_finite() {
            return Err(GeomError::NonFinite {
                field: "v",
                value: v,
            });
        }
        if !(0.0..=1.0).contains(&v) {
            return Err(GeomError::OutOfRange {
                field: "v",
                value: v,
                min: 0.0,
                max: 1.0,
            });
        }
        if point_index >= self.point_count {
            return Err(GeomError::PointIndexOutOfRange {
                index: point_index,
                count: self.point_count,
            });
        }
        let basis = basis_values(&self.knots, self.degree, self.section_count(), v);
        Ok(combine(&basis, &self.control_points, point_index))
    }

    /// Evaluates the surface at spanwise station `span_mm`.
    ///
    /// # Errors
    ///
    /// - [`GeomError::NonFinite`] when `span_mm` is not finite.
    /// - [`GeomError::OutOfRange`] when `span_mm` is outside
    ///   `[span_start_mm, span_end_mm]`.
    /// - Any error from [`BladeSurface::point_at`].
    pub fn point_at_span_mm(&self, span_mm: f64, point_index: usize) -> Result<Point3, GeomError> {
        if !span_mm.is_finite() {
            return Err(GeomError::NonFinite {
                field: "span_mm",
                value: span_mm,
            });
        }
        if span_mm < self.span_start_mm || span_mm > self.span_end_mm {
            return Err(GeomError::OutOfRange {
                field: "span_mm",
                value: span_mm,
                min: self.span_start_mm,
                max: self.span_end_mm,
            });
        }
        let v = (span_mm - self.span_start_mm) / (self.span_end_mm - self.span_start_mm);
        self.point_at(v, point_index)
    }

    /// Evaluates every contour point at the input section with `index`.
    ///
    /// The result must match the original `Section3D` points within
    /// [`PASS_THROUGH_TOLERANCE_MM`].
    ///
    /// # Errors
    ///
    /// Returns [`GeomError::SectionIndexOutOfRange`] for an invalid `index`.
    pub fn section_at(&self, index: usize) -> Result<Vec<Point3>, GeomError> {
        if index >= self.section_count() {
            return Err(GeomError::SectionIndexOutOfRange {
                index,
                count: self.section_count(),
            });
        }
        let v = self.section_params[index];
        let basis = basis_values(&self.knots, self.degree, self.section_count(), v);
        Ok((0..self.point_count)
            .map(|j| combine(&basis, &self.control_points, j))
            .collect())
    }
}

/// Builds the spanwise B-spline surface that interpolates `sections`.
///
/// Sections must be ordered from root to tip with strictly increasing span
/// stations and share one contour topology (identical point counts in the same
/// order). The returned surface passes through every input section.
///
/// # Errors
///
/// - [`GeomError::TooFewSections`] when fewer than two sections are supplied.
/// - [`GeomError::TopologyMismatch`] when point counts differ.
/// - [`GeomError::SpansNotIncreasing`] when spans are not strictly increasing.
/// - [`GeomError::SingularSystem`] if interpolation degenerates.
///
/// # Examples
///
/// ```
/// # use blade_geom::{loft, Naca4, Section3D};
/// let profile = Naca4::new(0.0, 0.0, 0.12).unwrap();
/// let airfoil = profile.surface(100.0, 21).unwrap();
///
/// let sections = (0..5)
///     .map(|i| {
///         let span = i as f64 * 50.0;
///         let chord = 100.0 - i as f64 * 10.0;
///         Section3D::from_airfoil(&airfoil, chord, 0.0, 0.25, span).unwrap()
///     })
///     .collect::<Vec<_>>();
///
/// let surface = loft(&sections).unwrap();
/// assert_eq!(surface.section_count(), 5);
/// assert_eq!(surface.degree(), 3);
/// assert!(surface.span_end_mm() == 200.0);
/// ```
pub fn loft(sections: &[Section3D]) -> Result<BladeSurface, GeomError> {
    if sections.len() < 2 {
        return Err(GeomError::TooFewSections {
            min: 2,
            got: sections.len(),
        });
    }

    let point_count = sections[0].points.len();
    let mut previous_span: Option<f64> = None;
    for (index, section) in sections.iter().enumerate() {
        if section.points.len() != point_count {
            return Err(GeomError::TopologyMismatch {
                section: index,
                expected: point_count,
                got: section.points.len(),
            });
        }
        if let Some(previous) = previous_span {
            if section.span_mm.partial_cmp(&previous) != Some(std::cmp::Ordering::Greater) {
                return Err(GeomError::SpansNotIncreasing { index });
            }
        }
        previous_span = Some(section.span_mm);
    }

    let count = sections.len();
    let degree = MAX_DEGREE.min(count - 1);
    let section_params = span_params(sections);
    let knots = clamped_knots(&section_params, degree);

    // Interpolation matrix: row k holds the basis functions at section k.
    let mut matrix = vec![vec![0.0; count]; count];
    for (row, &v) in section_params.iter().enumerate() {
        matrix[row] = basis_values(&knots, degree, count, v);
    }
    let (lu, permutation) = lu_decompose(matrix)?;

    // Solve once per coordinate for every contour point.
    let mut columns: Vec<Vec<[f64; 3]>> = vec![Vec::with_capacity(count); point_count];
    for section in sections {
        for (point_index, point) in section.points.iter().enumerate() {
            columns[point_index].push([point.x, point.y, point.z]);
        }
    }

    let mut control_points = vec![vec![Point3::default(); point_count]; count];
    for (point_index, column) in columns.iter().enumerate() {
        let xs: Vec<f64> = column.iter().map(|value| value[0]).collect();
        let ys: Vec<f64> = column.iter().map(|value| value[1]).collect();
        let zs: Vec<f64> = column.iter().map(|value| value[2]).collect();
        let cx = lu_solve(&lu, &permutation, &xs);
        let cy = lu_solve(&lu, &permutation, &ys);
        let cz = lu_solve(&lu, &permutation, &zs);
        for (control_index, row) in control_points.iter_mut().enumerate() {
            row[point_index] = Point3 {
                x: cx[control_index],
                y: cy[control_index],
                z: cz[control_index],
            };
        }
    }

    Ok(BladeSurface {
        degree,
        knots,
        control_points,
        section_params,
        point_count,
        span_start_mm: sections[0].span_mm,
        span_end_mm: sections[count - 1].span_mm,
    })
}

/// Normalised span parameters: `0` at the root section, `1` at the tip.
fn span_params(sections: &[Section3D]) -> Vec<f64> {
    let start = sections[0].span_mm;
    let end = sections[sections.len() - 1].span_mm;
    let range = end - start;
    sections
        .iter()
        .map(|section| (section.span_mm - start) / range)
        .collect()
}

/// Builds the clamped knot vector for global interpolation at `params`.
fn clamped_knots(params: &[f64], degree: usize) -> Vec<f64> {
    let count = params.len();
    let mut knots = vec![0.0; count + degree + 1];
    for offset in 0..=degree {
        knots[count + offset] = 1.0;
    }
    for j in 1..(count - degree) {
        let mut sum = 0.0;
        for value in &params[j..(j + degree)] {
            sum += value;
        }
        knots[j + degree] = sum / degree as f64;
    }
    knots
}

/// Evaluates all spanwise B-spline basis functions at `u`.
fn basis_values(knots: &[f64], degree: usize, control_count: usize, u: f64) -> Vec<f64> {
    let width = control_count + degree;
    let u_max = knots[knots.len() - 1];

    // Degree-0 basis: half-open spans, with the final non-empty span closed so
    // that `u = 1` selects the last control point.
    let mut table = vec![vec![0.0; width]; degree + 1];
    for (i, slot) in table[0].iter_mut().enumerate() {
        let left = knots[i];
        let right = knots[i + 1];
        *slot = if (left <= u && u < right) || (u == u_max && left < right && right == u_max) {
            1.0
        } else {
            0.0
        };
    }

    for d in 1..=degree {
        for i in 0..(width - d) {
            let mut value = 0.0;
            let left_den = knots[i + d] - knots[i];
            if left_den > 0.0 {
                value += (u - knots[i]) / left_den * table[d - 1][i];
            }
            let right_den = knots[i + d + 1] - knots[i + 1];
            if right_den > 0.0 {
                value += (knots[i + d + 1] - u) / right_den * table[d - 1][i + 1];
            }
            table[d][i] = value;
        }
    }

    table[degree][..control_count].to_vec()
}

/// Blends the control net with the given basis weights for one contour point.
fn combine(basis: &[f64], control_points: &[Vec<Point3>], point_index: usize) -> Point3 {
    let mut point = Point3::default();
    for (weight, control_row) in basis.iter().zip(control_points) {
        let control = control_row[point_index];
        point.x += weight * control.x;
        point.y += weight * control.y;
        point.z += weight * control.z;
    }
    point
}

/// LU factorisation with partial pivoting. Returns the packed LU matrix and
/// the row permutation applied to the right-hand side.
fn lu_decompose(mut a: Vec<Vec<f64>>) -> Result<(Vec<Vec<f64>>, Vec<usize>), GeomError> {
    let n = a.len();
    let mut permutation: Vec<usize> = (0..n).collect();

    for column in 0..n {
        let mut pivot = column;
        let mut best = a[column][column].abs();
        for (row, values) in a.iter().enumerate().skip(column + 1) {
            let candidate = values[column].abs();
            if candidate > best {
                best = candidate;
                pivot = row;
            }
        }
        if best <= SINGULAR_PIVOT {
            return Err(GeomError::SingularSystem);
        }
        if pivot != column {
            a.swap(column, pivot);
            permutation.swap(column, pivot);
        }

        let (head, tail) = a.split_at_mut(column + 1);
        let pivot_row = &head[column];
        let diagonal = pivot_row[column];
        for row in tail.iter_mut() {
            let factor = row[column] / diagonal;
            row[column] = factor;
            for (value, pivot_value) in row[column + 1..].iter_mut().zip(&pivot_row[column + 1..]) {
                *value -= factor * pivot_value;
            }
        }
    }

    Ok((a, permutation))
}

/// Solves `A·x = b` using a factorisation from [`lu_decompose`].
fn lu_solve(lu: &[Vec<f64>], permutation: &[usize], b: &[f64]) -> Vec<f64> {
    let n = lu.len();
    let mut y = vec![0.0; n];
    for (row, values) in lu.iter().enumerate() {
        let mut sum = b[permutation[row]];
        for (factor, previous) in values.iter().zip(&y).take(row) {
            sum -= factor * previous;
        }
        y[row] = sum;
    }

    let mut x = vec![0.0; n];
    for (row, values) in lu.iter().enumerate().rev() {
        let mut sum = y[row];
        for (factor, solved) in values.iter().zip(&x).skip(row + 1) {
            sum -= factor * solved;
        }
        x[row] = sum / values[row];
    }
    x
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Naca4;

    const EPS: f64 = 1e-9;

    fn point(x: f64, y: f64, z: f64) -> Point3 {
        Point3::new(x, y, z).expect("test coordinates are finite")
    }

    fn straight_sections() -> Vec<Section3D> {
        // Four sections of a straight, untapered box-like contour.
        let spans = [0.0, 50.0, 100.0, 150.0];
        spans
            .iter()
            .map(|&span| {
                let points = vec![
                    point(100.0, 5.0, span),
                    point(0.0, 0.0, span),
                    point(100.0, -5.0, span),
                ];
                Section3D::new(span, points).unwrap()
            })
            .collect()
    }

    #[test]
    fn basis_functions_partition_unity() {
        let knots = vec![0.0, 0.0, 0.0, 0.0, 0.5, 1.0, 1.0, 1.0, 1.0];
        for v in [0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0] {
            let values = basis_values(&knots, 3, 5, v);
            let sum: f64 = values.iter().sum();
            assert!((sum - 1.0).abs() < 1e-12, "sum = {sum} at v = {v}");
            assert!(values.iter().all(|w| *w >= 0.0));
        }
    }

    #[test]
    fn loft_passes_through_straight_sections() {
        let sections = straight_sections();
        let surface = loft(&sections).expect("straight sections loft cleanly");
        assert_eq!(surface.section_count(), 4);
        assert_eq!(surface.degree(), 3);
        assert_eq!(surface.point_count(), 3);

        for (index, section) in sections.iter().enumerate() {
            let evaluated = surface.section_at(index).expect("valid section");
            for (point, expected) in evaluated.iter().zip(section.points()) {
                assert!(
                    point.distance_to(expected) <= PASS_THROUGH_TOLERANCE_MM,
                    "section {index}: {point:?} vs {expected:?}"
                );
            }
        }

        // A straight prism reproduces linear interpolation between sections.
        let mid = surface.point_at_span_mm(25.0, 0).expect("inside span");
        assert!((mid.x - 100.0).abs() < EPS);
        assert!((mid.y - 5.0).abs() < EPS);
        assert!((mid.z - 25.0).abs() < EPS);
    }

    #[test]
    fn loft_interpolates_twisted_tapered_sections() {
        let profile = Naca4::new(0.04, 0.4, 0.12).expect("valid NACA 4412");
        let airfoil = profile.surface(120.0, 25).expect("valid airfoil");

        let sections: Vec<Section3D> = (0..6)
            .map(|i| {
                let span = i as f64 * 40.0;
                let chord = 120.0 - i as f64 * 8.0;
                let twist = 18.0 - i as f64 * 3.0;
                Section3D::from_airfoil(&airfoil, chord, twist, 0.25, span).expect("valid section")
            })
            .collect();

        let surface = loft(&sections).expect("twisted sections loft cleanly");
        for (index, section) in sections.iter().enumerate() {
            assert_eq!(
                surface.section_at(index).unwrap().len(),
                section.points().len()
            );
            for (point, expected) in surface
                .section_at(index)
                .unwrap()
                .iter()
                .zip(section.points())
            {
                assert!(
                    point.distance_to(expected) <= PASS_THROUGH_TOLERANCE_MM,
                    "section {index} deviates by {} mm",
                    point.distance_to(expected)
                );
            }
        }
    }

    #[test]
    fn two_sections_give_a_linear_surface() {
        let sections: Vec<Section3D> = [0.0, 100.0]
            .iter()
            .map(|&span| {
                Section3D::new(
                    span,
                    vec![
                        point(10.0, 1.0, span),
                        point(0.0, 0.0, span),
                        point(10.0, -1.0, span),
                    ],
                )
                .unwrap()
            })
            .collect();

        let surface = loft(&sections).expect("two sections loft");
        assert_eq!(surface.degree(), 1);
        let mid = surface.point_at_span_mm(50.0, 1).expect("inside span");
        assert!((mid.z - 50.0).abs() < EPS);
        assert!(mid.x.abs() < EPS);
    }

    #[test]
    fn rejects_invalid_section_stacks() {
        let sections = straight_sections();

        assert!(matches!(
            loft(&[]),
            Err(GeomError::TooFewSections { min: 2, got: 0 })
        ));
        assert!(matches!(
            loft(&sections[..1]),
            Err(GeomError::TooFewSections { .. })
        ));

        let mut mismatched = sections.clone();
        mismatched[2] = Section3D::new(
            100.0,
            vec![
                point(1.0, 0.0, 100.0),
                point(0.0, 0.0, 100.0),
                point(1.0, 1.0, 100.0),
                point(1.0, -1.0, 100.0),
            ],
        )
        .unwrap();
        assert!(matches!(
            loft(&mismatched),
            Err(GeomError::TopologyMismatch {
                section: 2,
                expected: 3,
                got: 4
            })
        ));

        let mut unsorted = sections.clone();
        unsorted[1] = Section3D::new(
            0.0,
            vec![
                point(100.0, 5.0, 0.0),
                point(0.0, 0.0, 0.0),
                point(100.0, -5.0, 0.0),
            ],
        )
        .unwrap();
        assert!(matches!(
            loft(&unsorted),
            Err(GeomError::SpansNotIncreasing { index: 1 })
        ));
    }

    #[test]
    fn rejects_bad_queries() {
        let surface = loft(&straight_sections()).unwrap();
        assert!(matches!(
            surface.point_at(-0.1, 0),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            surface.point_at(1.1, 0),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            surface.point_at(f64::NAN, 0),
            Err(GeomError::NonFinite { .. })
        ));
        assert!(matches!(
            surface.point_at(0.5, 3),
            Err(GeomError::PointIndexOutOfRange { index: 3, count: 3 })
        ));
        assert!(matches!(
            surface.section_at(4),
            Err(GeomError::SectionIndexOutOfRange { index: 4, count: 4 })
        ));
        assert!(matches!(
            surface.point_at_span_mm(-1.0, 0),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            surface.point_at_span_mm(f64::INFINITY, 0),
            Err(GeomError::NonFinite { .. })
        ));
    }

    #[test]
    fn section_placement_scales_rotates_and_offsets() {
        let profile = Naca4::new(0.0, 0.0, 0.12).expect("valid NACA 0012");
        let airfoil = profile.surface(100.0, 11).expect("valid airfoil");

        // Untwisted, unscaled: identity in the chord plane at span 30 mm.
        let section = Section3D::from_airfoil(&airfoil, 100.0, 0.0, 0.25, 30.0).unwrap();
        for (placed, original) in section.points().iter().zip(airfoil.points()) {
            assert!((placed.x - original.x).abs() < EPS);
            assert!((placed.y - original.y).abs() < EPS);
            assert!((placed.z - 30.0).abs() < EPS);
        }

        // 90° twist about the leading edge maps (x, y) -> (-y, x).
        let rotated = Section3D::from_airfoil(&airfoil, 100.0, 90.0, 0.0, 0.0).unwrap();
        for (placed, original) in rotated.points().iter().zip(airfoil.points()) {
            assert!((placed.x + original.y).abs() < EPS, "x = {}", placed.x);
            assert!((placed.y - original.x).abs() < EPS, "y = {}", placed.y);
        }

        // Chord scaling.
        let scaled = Section3D::from_airfoil(&airfoil, 50.0, 0.0, 0.0, 0.0).unwrap();
        let last = scaled.points().last().unwrap();
        assert!((last.x - 50.0).abs() < EPS);
    }

    #[test]
    fn rejects_bad_section_placement() {
        let profile = Naca4::new(0.0, 0.0, 0.12).expect("valid NACA 0012");
        let airfoil = profile.surface(100.0, 11).expect("valid airfoil");

        assert!(matches!(
            Section3D::from_airfoil(&airfoil, 0.0, 0.0, 0.25, 0.0),
            Err(GeomError::InvalidChord(_))
        ));
        assert!(matches!(
            Section3D::from_airfoil(&airfoil, 100.0, f64::NAN, 0.25, 0.0),
            Err(GeomError::NonFinite { .. })
        ));
        assert!(matches!(
            Section3D::from_airfoil(&airfoil, 100.0, 0.0, 1.5, 0.0),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            Section3D::new(f64::NAN, vec![Point3::default(); 3]),
            Err(GeomError::NonFinite { .. })
        ));
        assert!(matches!(
            Section3D::new(0.0, vec![Point3::default(); 2]),
            Err(GeomError::TooFewSamples { min: 3, got: 2 })
        ));
    }
}
