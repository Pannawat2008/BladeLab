//! Airfoil profiles and their 2-D representation.

mod naca4;

pub use naca4::Naca4;

use crate::error::GeomError;

/// A point in the 2-D airfoil plane, in millimetres.
///
/// `x` runs along the chord (0 = leading edge) and `y` is the thickness
/// direction in the same units.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Point2 {
    /// Chordwise coordinate in mm.
    pub x: f64,
    /// Thickness-direction coordinate in mm.
    pub y: f64,
}

impl Point2 {
    /// Builds a point, rejecting `NaN` and infinite coordinates.
    ///
    /// # Errors
    ///
    /// Returns [`GeomError::NonFinite`] if `x` or `y` is not finite.
    pub fn new(x: f64, y: f64) -> Result<Self, GeomError> {
        if !x.is_finite() {
            return Err(GeomError::NonFinite {
                field: "x",
                value: x,
            });
        }
        if !y.is_finite() {
            return Err(GeomError::NonFinite {
                field: "y",
                value: y,
            });
        }
        Ok(Self { x, y })
    }

    /// Euclidean distance to `other` in mm.
    #[must_use]
    pub fn distance_to(&self, other: &Self) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
}

/// A closed airfoil contour in the 2-D chord plane.
///
/// Points run as a single open polyline: upper surface from the trailing edge
/// to the leading edge, then lower surface back to the trailing edge. The
/// contour is closed implicitly by the trailing-edge face joining the first and
/// the last point (see `D-lead1-003`: a finite trailing edge is mandatory, so
/// the first and last point are two distinct points at `x = chord`).
#[derive(Debug, Clone, PartialEq)]
pub struct Airfoil {
    points: Vec<Point2>,
    chord_mm: f64,
}

impl Airfoil {
    /// Wraps an already ordered contour and validates its invariants.
    pub(crate) fn from_loop(points: Vec<Point2>, chord_mm: f64) -> Result<Self, GeomError> {
        if !chord_mm.is_finite() || chord_mm <= 0.0 {
            return Err(GeomError::InvalidChord(chord_mm));
        }
        if points.len() < 3 {
            return Err(GeomError::TooFewSamples {
                min: 3,
                got: points.len(),
            });
        }
        for point in &points {
            if !point.x.is_finite() || !point.y.is_finite() {
                return Err(GeomError::NonFinite {
                    field: "point",
                    value: if point.x.is_finite() {
                        point.y
                    } else {
                        point.x
                    },
                });
            }
        }
        Ok(Self { points, chord_mm })
    }

    /// The contour as an open polyline (see the type documentation).
    #[must_use]
    pub fn points(&self) -> &[Point2] {
        &self.points
    }

    /// Chord length in mm.
    #[must_use]
    pub fn chord_mm(&self) -> f64 {
        self.chord_mm
    }

    /// Upper trailing-edge point (first contour point).
    #[must_use]
    pub fn upper_trailing_edge(&self) -> Point2 {
        self.points[0]
    }

    /// Lower trailing-edge point (last contour point).
    #[must_use]
    pub fn lower_trailing_edge(&self) -> Point2 {
        self.points[self.points.len() - 1]
    }

    /// Distance between the two trailing-edge points in mm.
    #[must_use]
    pub fn trailing_edge_thickness_mm(&self) -> f64 {
        self.upper_trailing_edge()
            .distance_to(&self.lower_trailing_edge())
    }

    /// Smallest distance between any two contour points in mm.
    ///
    /// Useful for mesh-thickness sanity checks; an airfoil with a vanishing
    /// value has coincident points and cannot be lofted cleanly.
    #[must_use]
    pub fn minimum_point_distance_mm(&self) -> f64 {
        let mut min = f64::INFINITY;
        for (i, a) in self.points.iter().enumerate() {
            for b in &self.points[i + 1..] {
                let d = a.distance_to(b);
                if d < min {
                    min = d;
                }
            }
        }
        min
    }
}
