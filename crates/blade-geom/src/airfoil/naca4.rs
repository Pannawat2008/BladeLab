//! Continuous 4-digit NACA profiles.
//!
//! The classical 4-digit formulation (`NACA 4412` → `m = 0.04`, `p = 0.4`,
//! `t = 0.12`) is evaluated analytically at arbitrary chordwise stations, so
//! the profile is `C^1`-continuous in camber and thickness and can be sampled
//! with any chordwise distribution.
//!
//! The thickness polynomial uses the *open* trailing-edge coefficient
//! `-0.1015` (instead of `-0.1036`). That leaves a finite trailing-edge
//! thickness of `0.021 · t · c` (see [`Naca4::trailing_edge_thickness_mm`]),
//! as required by `D-lead1-003`, instead of collapsing both surfaces onto one
//! point.

use crate::airfoil::{Airfoil, Point2};
use crate::distribution::cosine_spacing;
use crate::error::GeomError;

/// Largest accepted maximum-camber ratio `m` (fraction of chord).
const MAX_CAMBER_RATIO: f64 = 0.1;
/// Largest accepted thickness ratio `t` (fraction of chord).
const MAX_THICKNESS_RATIO: f64 = 0.5;
/// Smallest accepted thickness ratio `t` (fraction of chord).
const MIN_THICKNESS_RATIO: f64 = 0.001;

/// Thickness polynomial coefficients of the 4-digit series (open TE).
const THICKNESS_COEFFS: [f64; 5] = [0.2969, -0.1260, -0.3516, 0.2843, -0.1015];

/// A continuous 4-digit NACA profile.
///
/// # Examples
///
/// ```
/// # use blade_geom::Naca4;
/// let naca4412 = Naca4::new(0.04, 0.4, 0.12).unwrap();
/// let profile = naca4412.surface(100.0, 41).unwrap();
/// assert!(profile.trailing_edge_thickness_mm() > 0.2);
/// ```
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Naca4 {
    max_camber: f64,
    camber_position: f64,
    thickness_ratio: f64,
}

impl Naca4 {
    /// Builds a profile from the camber ratio `m`, camber position `p` and
    /// thickness ratio `t`, all normalised by the chord.
    ///
    /// # Errors
    ///
    /// - [`GeomError::NonFinite`] if any input is `NaN` or infinite.
    /// - [`GeomError::OutOfRange`] if `m` is outside `[0, 0.1]`, `t` is outside
    ///   `[0.001, 0.5]`, or `p` is outside `(0, 1)` while `m > 0`.
    pub fn new(
        max_camber: f64,
        camber_position: f64,
        thickness_ratio: f64,
    ) -> Result<Self, GeomError> {
        for (field, value) in [
            ("max_camber", max_camber),
            ("camber_position", camber_position),
            ("thickness_ratio", thickness_ratio),
        ] {
            if !value.is_finite() {
                return Err(GeomError::NonFinite { field, value });
            }
        }

        if !(0.0..=MAX_CAMBER_RATIO).contains(&max_camber) {
            return Err(GeomError::OutOfRange {
                field: "max_camber",
                value: max_camber,
                min: 0.0,
                max: MAX_CAMBER_RATIO,
            });
        }
        if !(MIN_THICKNESS_RATIO..=MAX_THICKNESS_RATIO).contains(&thickness_ratio) {
            return Err(GeomError::OutOfRange {
                field: "thickness_ratio",
                value: thickness_ratio,
                min: MIN_THICKNESS_RATIO,
                max: MAX_THICKNESS_RATIO,
            });
        }
        // The camber position only matters when there is camber; a symmetric
        // profile accepts any `p` so `NACA 0012` can be built as `(0, 0, 0.12)`.
        if max_camber > 0.0 && !(camber_position > 0.0 && camber_position < 1.0) {
            return Err(GeomError::OutOfRange {
                field: "camber_position",
                value: camber_position,
                min: 0.0,
                max: 1.0,
            });
        }

        Ok(Self {
            max_camber,
            camber_position,
            thickness_ratio,
        })
    }

    /// Maximum camber ratio `m` (fraction of chord).
    #[must_use]
    pub fn max_camber(&self) -> f64 {
        self.max_camber
    }

    /// Chordwise position `p` of maximum camber (fraction of chord).
    #[must_use]
    pub fn camber_position(&self) -> f64 {
        self.camber_position
    }

    /// Maximum thickness ratio `t` (fraction of chord).
    #[must_use]
    pub fn thickness_ratio(&self) -> f64 {
        self.thickness_ratio
    }

    /// Mean camber line and its slope at chordwise station `x ∈ [0, 1]`.
    ///
    /// Returns `(y_c, dy_c/dx)`, both normalised by the chord.
    ///
    /// # Errors
    ///
    /// Returns [`GeomError::NonFinite`] or [`GeomError::OutOfRange`] when `x`
    /// is not a finite value inside `[0, 1]`.
    pub fn camber_line(&self, x: f64) -> Result<(f64, f64), GeomError> {
        check_station(x)?;

        if self.max_camber == 0.0 {
            return Ok((0.0, 0.0));
        }

        let m = self.max_camber;
        let p = self.camber_position;
        if x < p {
            let y = m / (p * p) * (2.0 * p * x - x * x);
            let slope = 2.0 * m / (p * p) * (p - x);
            Ok((y, slope))
        } else {
            let q = 1.0 - p;
            let y = m / (q * q) * ((1.0 - 2.0 * p) + 2.0 * p * x - x * x);
            let slope = 2.0 * m / (q * q) * (p - x);
            Ok((y, slope))
        }
    }

    /// Half-thickness `y_t` at chordwise station `x ∈ [0, 1]`, normalised by
    /// the chord.
    ///
    /// # Errors
    ///
    /// Returns [`GeomError::NonFinite`] or [`GeomError::OutOfRange`] when `x`
    /// is not a finite value inside `[0, 1]`.
    pub fn half_thickness(&self, x: f64) -> Result<f64, GeomError> {
        check_station(x)?;

        let t = self.thickness_ratio;
        let sqrt_x = x.sqrt();
        let y_t = 5.0
            * t
            * (THICKNESS_COEFFS[0] * sqrt_x
                + THICKNESS_COEFFS[1] * x
                + THICKNESS_COEFFS[2] * x * x
                + THICKNESS_COEFFS[3] * x * x * x
                + THICKNESS_COEFFS[4] * x * x * x * x);

        if !y_t.is_finite() || y_t < 0.0 {
            return Err(GeomError::NonFinite {
                field: "half_thickness",
                value: y_t,
            });
        }
        Ok(y_t)
    }

    /// Trailing-edge thickness in mm for a profile of chord `chord_mm`.
    ///
    /// With the open trailing-edge coefficient this is exactly
    /// `0.021 · t · chord_mm` (for example `0.252 mm` for a `NACA 4412` with a
    /// `100 mm` chord).
    ///
    /// # Errors
    ///
    /// Returns [`GeomError::InvalidChord`] when `chord_mm` is not finite and
    /// strictly positive.
    pub fn trailing_edge_thickness_mm(&self, chord_mm: f64) -> Result<f64, GeomError> {
        check_chord(chord_mm)?;
        Ok(2.0 * self.half_thickness(1.0)? * chord_mm)
    }

    /// Checks a profile against a minimum manufacturing trailing-edge
    /// thickness and returns the measured thickness in mm.
    ///
    /// # Errors
    ///
    /// - [`GeomError::InvalidChord`] when `chord_mm` is not finite and
    ///   strictly positive.
    /// - [`GeomError::NonFinite`] when `min_mm` is not finite.
    /// - [`GeomError::TrailingEdgeTooThin`] when the profile must be rejected.
    pub fn check_trailing_edge(&self, chord_mm: f64, min_mm: f64) -> Result<f64, GeomError> {
        check_chord(chord_mm)?;
        if !min_mm.is_finite() || min_mm < 0.0 {
            return Err(GeomError::NonFinite {
                field: "min_mm",
                value: min_mm,
            });
        }

        let actual_mm = self.trailing_edge_thickness_mm(chord_mm)?;
        if actual_mm < min_mm {
            return Err(GeomError::TrailingEdgeTooThin { actual_mm, min_mm });
        }
        Ok(actual_mm)
    }

    /// Samples the profile with `n_samples` cosine-spaced stations per surface.
    ///
    /// The returned contour has `2 · n_samples - 1` points in the order used by
    /// [`Airfoil`]: upper surface from trailing edge to leading edge, then the
    /// lower surface back to the trailing edge.
    ///
    /// # Errors
    ///
    /// - [`GeomError::InvalidChord`] when `chord_mm` is not finite and
    ///   strictly positive.
    /// - [`GeomError::TooFewSamples`] when `n_samples < 2`.
    /// - Any error propagated from the underlying camber/thickness evaluation.
    pub fn surface(&self, chord_mm: f64, n_samples: usize) -> Result<Airfoil, GeomError> {
        check_chord(chord_mm)?;
        let stations = cosine_spacing(n_samples)?;

        let mut points = Vec::with_capacity(2 * n_samples - 1);
        // Upper surface: trailing edge -> leading edge.
        for &x in stations.iter().rev() {
            let (y_camber, _) = self.camber_line(x)?;
            let y_half = self.half_thickness(x)?;
            points.push(Point2::new(x * chord_mm, (y_camber + y_half) * chord_mm)?);
        }
        // Lower surface: leading edge (already pushed once) -> trailing edge.
        for &x in stations.iter().skip(1) {
            let (y_camber, _) = self.camber_line(x)?;
            let y_half = self.half_thickness(x)?;
            points.push(Point2::new(x * chord_mm, (y_camber - y_half) * chord_mm)?);
        }

        Airfoil::from_loop(points, chord_mm)
    }
}

fn check_station(x: f64) -> Result<(), GeomError> {
    if !x.is_finite() {
        return Err(GeomError::NonFinite {
            field: "x",
            value: x,
        });
    }
    if !(0.0..=1.0).contains(&x) {
        return Err(GeomError::OutOfRange {
            field: "x",
            value: x,
            min: 0.0,
            max: 1.0,
        });
    }
    Ok(())
}

fn check_chord(chord_mm: f64) -> Result<(), GeomError> {
    if !chord_mm.is_finite() || chord_mm <= 0.0 {
        return Err(GeomError::InvalidChord(chord_mm));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const EPS: f64 = 1e-12;

    #[test]
    fn camber_line_peaks_at_camber_position() {
        let profile = Naca4::new(0.04, 0.4, 0.12).expect("valid NACA 4412");
        let (y_max, _) = profile.camber_line(0.4).expect("in range");
        assert!((y_max - 0.04).abs() < 1e-12);
        // Slope changes sign across the camber position.
        let (_, slope_before) = profile.camber_line(0.3).expect("in range");
        let (_, slope_after) = profile.camber_line(0.5).expect("in range");
        assert!(slope_before > 0.0);
        assert!(slope_after < 0.0);
    }

    #[test]
    fn symmetric_profile_has_zero_camber_everywhere() {
        let profile = Naca4::new(0.0, 0.0, 0.12).expect("valid NACA 0012");
        for x in [0.0, 0.05, 0.3, 0.7, 1.0] {
            let (y, slope) = profile.camber_line(x).expect("in range");
            assert_eq!(y, 0.0);
            assert_eq!(slope, 0.0);
        }
    }

    #[test]
    fn maximum_thickness_is_close_to_thirty_percent_chord() {
        let profile = Naca4::new(0.02, 0.4, 0.12).expect("valid profile");
        let y_t = profile.half_thickness(0.3).expect("in range");
        assert!((y_t - 0.06).abs() < 5e-4, "y_t(0.3) = {y_t}");
    }

    #[test]
    fn trailing_edge_thickness_matches_open_te_formula() {
        let profile = Naca4::new(0.04, 0.4, 0.12).expect("valid NACA 4412");
        let te = profile
            .trailing_edge_thickness_mm(100.0)
            .expect("valid chord");
        let expected = 0.021 * 0.12 * 100.0;
        assert!(
            (te - expected).abs() < 1e-9,
            "te = {te}, expected = {expected}"
        );
    }

    #[test]
    fn surface_has_expected_topology() {
        let profile = Naca4::new(0.04, 0.4, 0.12).expect("valid NACA 4412");
        let n = 41;
        let airfoil = profile.surface(150.0, n).expect("valid surface");
        assert_eq!(airfoil.points().len(), 2 * n - 1);
        assert_eq!(airfoil.chord_mm(), 150.0);

        let upper_te = airfoil.upper_trailing_edge();
        let lower_te = airfoil.lower_trailing_edge();
        assert!((upper_te.x - 150.0).abs() < EPS);
        assert!((lower_te.x - 150.0).abs() < EPS);
        assert!(upper_te.y > lower_te.y);
        assert!(
            (airfoil.trailing_edge_thickness_mm()
                - profile.trailing_edge_thickness_mm(150.0).unwrap())
            .abs()
                < 1e-9
        );

        // The leading edge is the single shared point at x = 0, y = 0.
        let leading = airfoil.points()[n - 1];
        assert!(leading.x.abs() < EPS);
        assert!(leading.y.abs() < EPS);
    }

    #[test]
    fn surface_is_ordered_and_cambered() {
        let profile = Naca4::new(0.04, 0.4, 0.12).expect("valid NACA 4412");
        let n = 33;
        let airfoil = profile.surface(100.0, n).expect("valid surface");
        let points = airfoil.points();

        // Upper surface: x decreases towards the leading edge.
        for pair in points[..n - 1].windows(2) {
            assert!(pair[0].x > pair[1].x);
        }
        // Lower surface: x increases towards the trailing edge.
        for pair in points[n..].windows(2) {
            assert!(pair[0].x < pair[1].x);
        }

        // At every shared station the upper surface stays strictly above the
        // lower surface, with a real gap around mid-chord.
        let mut max_gap = 0.0_f64;
        for station in 1..n - 1 {
            let upper = points[n - 1 - station];
            let lower = points[n + station - 1];
            assert!((upper.x - lower.x).abs() < 1e-9);
            assert!(upper.y > lower.y);
            max_gap = max_gap.max(upper.y - lower.y);
        }
        assert!(max_gap > 0.1 * 100.0, "max_gap = {max_gap}");
    }

    #[test]
    fn rejects_invalid_parameters() {
        assert!(matches!(
            Naca4::new(f64::NAN, 0.4, 0.12),
            Err(GeomError::NonFinite { .. })
        ));
        assert!(matches!(
            Naca4::new(f64::INFINITY, 0.4, 0.12),
            Err(GeomError::NonFinite { .. })
        ));
        assert!(matches!(
            Naca4::new(-0.01, 0.4, 0.12),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            Naca4::new(0.11, 0.4, 0.12),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            Naca4::new(0.04, 0.0, 0.12),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            Naca4::new(0.04, 1.0, 0.12),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            Naca4::new(0.04, 0.4, 0.0),
            Err(GeomError::OutOfRange { .. })
        ));
        assert!(matches!(
            Naca4::new(0.04, 0.4, 0.6),
            Err(GeomError::OutOfRange { .. })
        ));
        // A symmetric profile tolerates any camber position.
        assert!(Naca4::new(0.0, 0.0, 0.12).is_ok());
    }

    #[test]
    fn rejects_invalid_stations_and_chords() {
        let profile = Naca4::new(0.04, 0.4, 0.12).expect("valid NACA 4412");
        for x in [-0.1, 1.1, f64::NAN, f64::INFINITY] {
            assert!(profile.camber_line(x).is_err());
            assert!(profile.half_thickness(x).is_err());
        }
        for chord in [0.0, -1.0, f64::NAN, f64::INFINITY] {
            assert!(matches!(
                profile.trailing_edge_thickness_mm(chord),
                Err(GeomError::InvalidChord(_))
            ));
            assert!(matches!(
                profile.surface(chord, 16),
                Err(GeomError::InvalidChord(_))
            ));
        }
        assert!(matches!(
            profile.surface(100.0, 1),
            Err(GeomError::TooFewSamples { .. })
        ));
    }

    #[test]
    fn trailing_edge_check_reports_thin_profiles() {
        let profile = Naca4::new(0.04, 0.4, 0.12).expect("valid NACA 4412");
        let actual = profile.trailing_edge_thickness_mm(100.0).unwrap();

        assert!(profile.check_trailing_edge(100.0, actual * 0.5).is_ok());
        assert!(matches!(
            profile.check_trailing_edge(100.0, actual * 1.5),
            Err(GeomError::TrailingEdgeTooThin { .. })
        ));
        assert!(profile.check_trailing_edge(100.0, f64::NAN).is_err());
    }
}
