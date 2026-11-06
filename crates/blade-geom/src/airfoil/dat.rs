//! `.dat` (Selig / Lednicer) airfoil parser, built-in airfoil library
//! (`SG6043`, `SD7062`, `E387`, `S833`), cosine resampling, and contour blending (`T-202`).
//!
//! All built-in library airfoils live under `data/airfoils/*.dat` and are
//! embedded at compile time via `include_str!` so `blade-geom` remains 100%
//! I/O-free and compiles cleanly to `wasm32-unknown-unknown`.

use std::cmp::Ordering;

use crate::airfoil::{Airfoil, Point2};
use crate::distribution::cosine_spacing;
use crate::error::GeomError;

const SG6043_DAT: &str = include_str!("../../../../data/airfoils/SG6043.dat");
const SD7062_DAT: &str = include_str!("../../../../data/airfoils/SD7062.dat");
const E387_DAT: &str = include_str!("../../../../data/airfoils/E387.dat");
const S833_DAT: &str = include_str!("../../../../data/airfoils/S833.dat");

/// Minimum open trailing-edge gap ratio `(y_upper(1) - y_lower(1)) / c`
/// enforced when a `.dat` file has a pinched/closed trailing edge (`D-lead1-003`).
const MIN_OPEN_TE_RATIO: f64 = 0.002;

/// Canonical names of the built-in airfoil library (`T-202`).
pub const LIBRARY_AIRFOIL_NAMES: [&str; 4] = ["SG6043", "SD7062", "E387", "S833"];

/// Returns the canonical built-in library airfoil names (`SG6043`, `SD7062`, `E387`, `S833`).
#[must_use]
pub const fn library_airfoil_names() -> &'static [&'static str] {
    &LIBRARY_AIRFOIL_NAMES
}

/// Looks up a built-in library airfoil by name (case-insensitive: `"SG6043"`,
/// `"SD7062"`, `"E387"`, `"S833"`).
///
/// # Errors
///
/// Returns [`GeomError::InvalidAirfoilData`] if `name` is not in the library.
pub fn library_airfoil(name: &str) -> Result<DatAirfoil, GeomError> {
    let trimmed = name.trim();
    if trimmed.eq_ignore_ascii_case("SG6043") {
        DatAirfoil::from_dat(SG6043_DAT)
    } else if trimmed.eq_ignore_ascii_case("SD7062") {
        DatAirfoil::from_dat(SD7062_DAT)
    } else if trimmed.eq_ignore_ascii_case("E387") {
        DatAirfoil::from_dat(E387_DAT)
    } else if trimmed.eq_ignore_ascii_case("S833") {
        DatAirfoil::from_dat(S833_DAT)
    } else {
        Err(GeomError::InvalidAirfoilData(format!(
            "unknown library airfoil `{trimmed}` (expected one of SG6043, SD7062, E387, S833)"
        )))
    }
}

/// A normalised airfoil parsed from a Selig or Lednicer `.dat` file (`T-202`).
#[derive(Debug, Clone, PartialEq)]
pub struct DatAirfoil {
    name: String,
    /// Upper surface `(x/c, y/c)` ordered by `x` ascending from `0` to `1`.
    upper: Vec<(f64, f64)>,
    /// Lower surface `(x/c, y/c)` ordered by `x` ascending from `0` to `1`.
    lower: Vec<(f64, f64)>,
    /// Estimated maximum camber ratio `m`.
    max_camber: f64,
    /// Estimated chordwise position of maximum camber `p`.
    camber_position: f64,
    /// Estimated maximum thickness ratio `t`.
    thickness_ratio: f64,
}

impl DatAirfoil {
    /// Parses a Selig or Lednicer `.dat` coordinate string into a normalised
    /// [`DatAirfoil`].
    ///
    /// # Errors
    ///
    /// Returns [`GeomError::InvalidAirfoilData`] when fewer than 6 coordinate
    /// pairs are present, coordinates are non-finite or outside `[-0.05, 1.05]`,
    /// or the upper surface does not lie above the lower surface across the
    /// interior of the chord.
    pub fn from_dat(source: &str) -> Result<Self, GeomError> {
        let mut name = String::from("CustomDat");
        let mut raw_pairs: Vec<(f64, f64)> = Vec::new();

        for (line_idx, raw_line) in source.lines().enumerate() {
            let line = raw_line.trim();
            if line.is_empty() || line.starts_with('#') || line.starts_with(';') {
                continue;
            }
            let tokens: Vec<&str> = line.split_whitespace().collect();
            if tokens.len() == 2 {
                if let (Ok(x), Ok(y)) = (tokens[0].parse::<f64>(), tokens[1].parse::<f64>()) {
                    if !x.is_finite() || !y.is_finite() {
                        return Err(GeomError::InvalidAirfoilData(format!(
                            "non-finite coordinate on line {}",
                            line_idx + 1
                        )));
                    }
                    // Lednicer count header has two integers/floats > 1.5 (e.g. `26. 26.`).
                    if raw_pairs.is_empty() && x > 1.5 && y > 1.5 {
                        continue;
                    }
                    if !(-0.05..=1.05).contains(&x) || !(-0.5..=0.5).contains(&y) {
                        return Err(GeomError::InvalidAirfoilData(format!(
                            "coordinate ({x}, {y}) out of normalised airfoil bounds on line {}",
                            line_idx + 1
                        )));
                    }
                    raw_pairs.push((x.clamp(0.0, 1.0), y));
                    continue;
                }
            }
            if raw_pairs.is_empty() && name == "CustomDat" {
                name = line.to_string();
            } else {
                return Err(GeomError::InvalidAirfoilData(format!(
                    "unrecognised coordinate line {}: `{line}`",
                    line_idx + 1
                )));
            }
        }

        if raw_pairs.len() < 6 {
            return Err(GeomError::InvalidAirfoilData(format!(
                "expected at least 6 coordinate pairs in .dat, found {}",
                raw_pairs.len()
            )));
        }

        // Detect Selig (starts near x=1, descends to LE near x=0, ascends to x=1)
        // vs Lednicer (starts near x=0, ascends to x=1, then restarts near x=0).
        let (mut upper, mut lower) = split_surfaces(&raw_pairs)?;
        normalise_surface(&mut upper, true)?;
        normalise_surface(&mut lower, false)?;

        // Enforce a finite open trailing edge (D-lead1-003).
        let upper_te = upper.last().map(|p| p.1).unwrap_or(0.0);
        let lower_te = lower.last().map(|p| p.1).unwrap_or(0.0);
        if upper_te - lower_te < MIN_OPEN_TE_RATIO {
            let mid = 0.5 * (upper_te + lower_te);
            if let Some(last) = upper.last_mut() {
                last.1 = mid + 0.5 * MIN_OPEN_TE_RATIO;
            }
            if let Some(last) = lower.last_mut() {
                last.1 = mid - 0.5 * MIN_OPEN_TE_RATIO;
            }
        }

        let (max_camber, camber_position, thickness_ratio) =
            estimate_summary_metrics(&upper, &lower)?;

        Ok(Self {
            name,
            upper,
            lower,
            max_camber,
            camber_position,
            thickness_ratio,
        })
    }

    /// Header name parsed from the `.dat` file.
    #[must_use]
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Estimated maximum camber ratio `m`.
    #[must_use]
    pub const fn max_camber(&self) -> f64 {
        self.max_camber
    }

    /// Estimated chordwise position of maximum camber `p`.
    #[must_use]
    pub const fn camber_position(&self) -> f64 {
        self.camber_position
    }

    /// Estimated maximum thickness ratio `t`.
    #[must_use]
    pub const fn thickness_ratio(&self) -> f64 {
        self.thickness_ratio
    }

    /// Trailing-edge thickness in mm at `chord_mm`.
    #[must_use]
    pub fn trailing_edge_thickness_mm(&self, chord_mm: f64) -> f64 {
        let upper_te = self.upper.last().map(|p| p.1).unwrap_or(0.0);
        let lower_te = self.lower.last().map(|p| p.1).unwrap_or(0.0);
        (upper_te - lower_te).max(0.0) * chord_mm
    }

    /// Verifies that the trailing-edge thickness at `chord_mm` is at least `min_mm`.
    ///
    /// # Errors
    ///
    /// - [`GeomError::InvalidChord`] when `chord_mm <= 0` or non-finite.
    /// - [`GeomError::TrailingEdgeTooThin`] when the trailing edge is below `min_mm`.
    pub fn check_trailing_edge(&self, chord_mm: f64, min_mm: f64) -> Result<f64, GeomError> {
        if !chord_mm.is_finite() || chord_mm <= 0.0 {
            return Err(GeomError::InvalidChord(chord_mm));
        }
        if !min_mm.is_finite() {
            return Err(GeomError::NonFinite {
                field: "min_trailing_edge_mm",
                value: min_mm,
            });
        }
        let actual_mm = self.trailing_edge_thickness_mm(chord_mm);
        if actual_mm < min_mm {
            return Err(GeomError::TrailingEdgeTooThin { actual_mm, min_mm });
        }
        Ok(actual_mm)
    }

    /// Samples this airfoil at `samples_per_surface` cosine-spaced chordwise
    /// stations and scales to `chord_mm`, returning a [`Airfoil`] following the
    /// `D-geom1-001` contour convention (`2 * n - 1` points: upper TE → LE → lower TE).
    ///
    /// # Errors
    ///
    /// - [`GeomError::InvalidChord`] if `chord_mm <= 0` or non-finite.
    /// - [`GeomError::TooFewSamples`] if `samples_per_surface < 3`.
    pub fn surface(&self, chord_mm: f64, samples_per_surface: usize) -> Result<Airfoil, GeomError> {
        if !chord_mm.is_finite() || chord_mm <= 0.0 {
            return Err(GeomError::InvalidChord(chord_mm));
        }
        let xs = cosine_spacing(samples_per_surface)?;
        let mut points = Vec::with_capacity(2 * samples_per_surface - 1);

        // Upper surface from TE (x = 1) down to LE (x = 0, exclusive).
        for &x in xs.iter().skip(1).rev() {
            let y = sample_piecewise_linear(&self.upper, x);
            points.push(Point2::new(x * chord_mm, y * chord_mm)?);
        }

        // Exclusive leading edge at x = 0.
        let le_y = 0.5
            * (sample_piecewise_linear(&self.upper, 0.0)
                + sample_piecewise_linear(&self.lower, 0.0));
        points.push(Point2::new(0.0, le_y * chord_mm)?);

        // Lower surface from just aft of LE up to TE (x = 1).
        for &x in xs.iter().skip(1) {
            let y = sample_piecewise_linear(&self.lower, x);
            points.push(Point2::new(x * chord_mm, y * chord_mm)?);
        }

        Airfoil::from_loop(points, chord_mm)
    }
}

/// Linearly blends two [`Airfoil`] contours with weight `weight ∈ [0, 1]`
/// (`0.0` = `a`, `1.0` = `b`).
///
/// Both contours must share the same number of points (`2 * n - 1`).
///
/// # Errors
///
/// - [`GeomError::NonFinite`] if `weight` is not finite.
/// - [`GeomError::OutOfRange`] if `weight` is outside `[0, 1]`.
/// - [`GeomError::TopologyMismatch`] if `a` and `b` have different point counts.
pub fn blend_airfoils(a: &Airfoil, b: &Airfoil, weight: f64) -> Result<Airfoil, GeomError> {
    if !weight.is_finite() {
        return Err(GeomError::NonFinite {
            field: "weight",
            value: weight,
        });
    }
    if !(0.0..=1.0).contains(&weight) {
        return Err(GeomError::OutOfRange {
            field: "weight",
            value: weight,
            min: 0.0,
            max: 1.0,
        });
    }
    if a.points().len() != b.points().len() {
        return Err(GeomError::TopologyMismatch {
            section: 1,
            expected: a.points().len(),
            got: b.points().len(),
        });
    }

    let w = weight;
    let inv = 1.0 - w;
    let chord_mm = inv * a.chord_mm() + w * b.chord_mm();
    let mut points = Vec::with_capacity(a.points().len());
    for (pa, pb) in a.points().iter().zip(b.points().iter()) {
        points.push(Point2::new(inv * pa.x + w * pb.x, inv * pa.y + w * pb.y)?);
    }

    Airfoil::from_loop(points, chord_mm)
}

type SurfacePairs = Vec<(f64, f64)>;

fn split_surfaces(pairs: &[(f64, f64)]) -> Result<(SurfacePairs, SurfacePairs), GeomError> {
    // Check if Lednicer format (starts near x = 0 and jumps back to near x = 0 mid-file).
    if pairs[0].0 < 0.1 {
        if let Some(split_idx) = pairs
            .windows(2)
            .position(|w| w[0].0 > 0.5 && w[1].0 < 0.2)
            .map(|idx| idx + 1)
        {
            return Ok((pairs[..split_idx].to_vec(), pairs[split_idx..].to_vec()));
        }
    }

    // Selig format: find minimum x (leading edge).
    let (le_idx, _) = pairs
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| a.0.partial_cmp(&b.0).unwrap_or(Ordering::Equal))
        .ok_or_else(|| GeomError::InvalidAirfoilData("empty coordinate list".to_string()))?;

    if le_idx < 2 || le_idx + 2 >= pairs.len() {
        return Err(GeomError::InvalidAirfoilData(
            "leading edge does not split .dat coordinates into upper and lower surfaces"
                .to_string(),
        ));
    }

    let mut upper = pairs[..=le_idx].to_vec();
    upper.reverse();
    let lower = pairs[le_idx..].to_vec();
    Ok((upper, lower))
}

fn normalise_surface(surface: &mut Vec<(f64, f64)>, is_upper: bool) -> Result<(), GeomError> {
    surface.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(Ordering::Equal));
    surface.dedup_by(|a, b| (a.0 - b.0).abs() <= 1e-9);
    if surface.len() < 3 {
        return Err(GeomError::InvalidAirfoilData(format!(
            "{} surface has fewer than 3 distinct chordwise stations",
            if is_upper { "upper" } else { "lower" }
        )));
    }
    if surface[0].0 > 0.05 || surface[surface.len() - 1].0 < 0.95 {
        return Err(GeomError::InvalidAirfoilData(format!(
            "{} surface does not span [0, 1]",
            if is_upper { "upper" } else { "lower" }
        )));
    }
    surface[0].0 = 0.0;
    let last_idx = surface.len() - 1;
    surface[last_idx].0 = 1.0;
    Ok(())
}

fn sample_piecewise_linear(surface: &[(f64, f64)], x: f64) -> f64 {
    let clamped = x.clamp(0.0, 1.0);
    if clamped <= surface[0].0 {
        return surface[0].1;
    }
    let last = surface[surface.len() - 1];
    if clamped >= last.0 {
        return last.1;
    }
    for window in surface.windows(2) {
        let (x0, y0) = window[0];
        let (x1, y1) = window[1];
        if clamped >= x0 && clamped <= x1 {
            let span = x1 - x0;
            if span <= 1e-12 {
                return y0;
            }
            let t = (clamped - x0) / span;
            return y0 + t * (y1 - y0);
        }
    }
    last.1
}

fn estimate_summary_metrics(
    upper: &[(f64, f64)],
    lower: &[(f64, f64)],
) -> Result<(f64, f64, f64), GeomError> {
    let mut max_thickness = 0.0_f64;
    let mut max_camber = 0.0_f64;
    let mut camber_pos = 0.4_f64;

    for idx in 1..100 {
        let x = f64::from(idx) / 100.0;
        let yu = sample_piecewise_linear(upper, x);
        let yl = sample_piecewise_linear(lower, x);
        let thickness = yu - yl;
        if thickness <= 0.0 {
            return Err(GeomError::InvalidAirfoilData(format!(
                "upper surface falls at or below lower surface at x/c = {x:.2} (yu = {yu:.5}, yl = {yl:.5})"
            )));
        }
        if thickness > max_thickness {
            max_thickness = thickness;
        }
        let camber = 0.5 * (yu + yl).abs();
        if camber > max_camber {
            max_camber = camber;
            camber_pos = x;
        }
    }

    Ok((max_camber, camber_pos, max_thickness))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn library_airfoils_sg6043_sd7062_and_e387_parse_and_build_valid_surfaces() {
        let expected_thickness = [
            ("SG6043", 0.095, 0.115),
            ("SD7062", 0.130, 0.155),
            ("E387", 0.085, 0.100),
            ("S833", 0.170, 0.195),
        ];

        for (name, t_min, t_max) in expected_thickness {
            let dat = library_airfoil(name).unwrap_or_else(|err| panic!("{name}: {err}"));
            assert!(
                dat.thickness_ratio() >= t_min && dat.thickness_ratio() <= t_max,
                "{name}: unexpected thickness_ratio {}",
                dat.thickness_ratio()
            );
            assert!(
                dat.max_camber() > 0.01 && dat.max_camber() < 0.08,
                "{name}: unexpected max_camber {}",
                dat.max_camber()
            );
            let te_mm = dat
                .check_trailing_edge(60.0, 0.05)
                .unwrap_or_else(|err| panic!("{name} check_trailing_edge: {err}"));
            assert!(te_mm >= 0.05);

            let foil = dat
                .surface(60.0, 81)
                .unwrap_or_else(|err| panic!("{name} surface: {err}"));
            assert_eq!(foil.points().len(), 161);
            assert!(foil.trailing_edge_thickness_mm() >= 0.05);
            assert!(foil.minimum_point_distance_mm() > 0.0);
        }
    }

    #[test]
    fn supports_lednicer_format_and_rejects_malformed_dat() {
        let lednicer = "\
LEDNICER TEST FOIL
  4.  4.
  0.0000  0.0000
  0.2500  0.0600
  0.7500  0.0300
  1.0000  0.0010

  0.0000  0.0000
  0.2500 -0.0300
  0.7500 -0.0100
  1.0000 -0.0010
";
        let dat = DatAirfoil::from_dat(lednicer).expect("lednicer parses");
        let foil = dat.surface(50.0, 21).expect("surface builds");
        assert_eq!(foil.points().len(), 41);

        for bad in ["", "just a header", "1.0 0.0\n0.5 0.1\n0.0 0.0"] {
            assert!(
                DatAirfoil::from_dat(bad).is_err(),
                "expected `{bad}` to fail"
            );
        }
    }

    #[test]
    fn blend_airfoils_interpolates_smoothly_between_root_and_tip_profiles() {
        let root = library_airfoil("SD7062")
            .unwrap()
            .surface(80.0, 81)
            .unwrap();
        let tip = library_airfoil("SG6043")
            .unwrap()
            .surface(40.0, 81)
            .unwrap();

        let at_zero = blend_airfoils(&root, &tip, 0.0).unwrap();
        assert_eq!(at_zero, root);

        let at_one = blend_airfoils(&root, &tip, 1.0).unwrap();
        assert_eq!(at_one, tip);

        let mid = blend_airfoils(&root, &tip, 0.5).unwrap();
        assert!((mid.chord_mm() - 60.0).abs() < 1e-12);
        assert_eq!(mid.points().len(), 161);
        for ((pa, pb), pm) in root
            .points()
            .iter()
            .zip(tip.points().iter())
            .zip(mid.points().iter())
        {
            assert!((pm.x - 0.5 * (pa.x + pb.x)).abs() < 1e-12);
            assert!((pm.y - 0.5 * (pa.y + pb.y)).abs() < 1e-12);
        }
    }
}
