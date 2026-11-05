//! Layer-1 Schmitz optimum-rotor chord and twist generation (T-101).
//!
//! Schmitz (1956) extends Betz momentum theory to account for wake rotation
//! behind the rotor disc. At radial station `r` with local speed ratio
//! `λ_r = λ · (r / R)`:
//!
//! - **Optimal relative inflow angle:**
//!   `φ(r) = (2 / 3) · atan(1 / λ_r)`
//! - **Optimal chord length (mm):**
//!   `c(r) = (16 · π · r / (B · C_l)) · sin²(φ(r) / 2)`
//! - **Optimal twist angle (deg):**
//!   `β(r) = φ_deg(r) − α_design`
//!
//! All public functions accept and return lengths in millimetres (`mm`) and
//! angles in degrees (`deg`), converting to radians only inside trigonometric
//! evaluations (`plan.md` §6.1).

use std::f64::consts::PI;

use blade_model::Rotor;

use crate::error::GeomError;

/// Largest design lift coefficient accepted by [`SchmitzParams`].
pub const MAX_DESIGN_CL: f64 = 10.0;

/// Largest absolute design angle of attack accepted in degrees.
pub const MAX_ALPHA_DEG: f64 = 90.0;

/// Largest blade count accepted by the rotor schema.
const MAX_BLADE_COUNT: u32 = 12;

/// Smallest station count accepted for a full spanwise distribution.
const MIN_STATION_COUNT: u32 = 2;

/// Largest station count accepted for a full spanwise distribution.
const MAX_STATION_COUNT: u32 = 200;

/// Aerodynamic operating point used by the Schmitz Layer-1 generator.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SchmitzParams {
    /// Design lift coefficient `C_l` (`(0, MAX_DESIGN_CL]`).
    pub design_cl: f64,
    /// Design angle of attack `α_design` in degrees (`[-90, 90]`).
    pub design_alpha_deg: f64,
}

impl SchmitzParams {
    /// Validates and constructs a [`SchmitzParams`] pair.
    ///
    /// # Errors
    ///
    /// - [`GeomError::NonFinite`] if `design_cl` or `design_alpha_deg` is not finite.
    /// - [`GeomError::OutOfRange`] if `design_cl <= 0.0`, `design_cl > MAX_DESIGN_CL`,
    ///   or `|design_alpha_deg| > MAX_ALPHA_DEG`.
    pub fn new(design_cl: f64, design_alpha_deg: f64) -> Result<Self, GeomError> {
        check_design_cl(design_cl)?;
        check_design_alpha_deg(design_alpha_deg)?;
        Ok(Self {
            design_cl,
            design_alpha_deg,
        })
    }
}

/// Schmitz optimum-rotor quantities evaluated at one radial station.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SchmitzStation {
    /// Normalised radial position `x = r / R` in `(0, 1]`.
    pub span_ratio: f64,
    /// Radial position `r` in mm (`span_ratio · radius_mm`).
    pub span_mm: f64,
    /// Local speed ratio `λ_r = design_tsr · span_ratio`.
    pub local_tsr: f64,
    /// Optimal relative inflow angle `φ(r)` in degrees.
    pub inflow_angle_deg: f64,
    /// Optimal Schmitz chord `c(r)` in mm.
    pub chord_mm: f64,
    /// Optimal section twist `β(r) = φ(r) − α_design` in degrees.
    pub twist_deg: f64,
}

/// Computes the Schmitz optimal relative inflow angle `φ(r)` in degrees at
/// normalised station `span_ratio = r / R`.
///
/// Formula: `φ(r) = (2 / 3) · atan(1 / (design_tsr · span_ratio)) · (180 / π)`.
///
/// # Errors
///
/// - [`GeomError::NonFinite`] if any input is `NaN` or infinite.
/// - [`GeomError::OutOfRange`] if `design_tsr <= 0` or `span_ratio ∉ (0, 1]`.
///
/// # Examples
///
/// ```
/// # use blade_geom::schmitz_inflow_angle_deg;
/// // At local speed ratio λ_r = 1 (e.g. TSR = 4.0, r/R = 0.25), atan(1) = 45°
/// // so φ = (2/3) * 45° = 30° exactly.
/// let phi = schmitz_inflow_angle_deg(4.0, 0.25).unwrap();
/// assert!((phi - 30.0).abs() < 1e-12);
/// ```
pub fn schmitz_inflow_angle_deg(design_tsr: f64, span_ratio: f64) -> Result<f64, GeomError> {
    let phi_rad = schmitz_inflow_angle_rad(design_tsr, span_ratio)?;
    Ok(phi_rad.to_degrees())
}

/// Computes the Schmitz optimal chord length `c(r)` in mm at normalised station
/// `span_ratio = r / R`.
///
/// Formula:
/// `c(r) = (16 · π · r / (B · C_l)) · sin²(φ(r) / 2)`
/// where `r = span_ratio · radius_mm` and `φ(r) = (2 / 3) · atan(1 / (λ · span_ratio))`.
///
/// # Errors
///
/// - [`GeomError::NonFinite`] if any floating-point input is `NaN` or infinite.
/// - [`GeomError::OutOfRange`] if `radius_mm <= 0`, `blade_count ∉ 1..=12`,
///   `design_tsr <= 0`, `design_cl ∉ (0, MAX_DESIGN_CL]`, or `span_ratio ∉ (0, 1]`.
///
/// # Examples
///
/// ```
/// # use blade_geom::schmitz_chord_mm;
/// // Fixture rotor at root (R = 600 mm, B = 3, TSR = 4.5, Cl = 1.0, r/R = 0.1):
/// let c_root = schmitz_chord_mm(600.0, 3, 4.5, 1.0, 0.1).unwrap();
/// assert!((c_root - 140.151_186_545_585_18).abs() < 1e-9);
/// ```
pub fn schmitz_chord_mm(
    radius_mm: f64,
    blade_count: u32,
    design_tsr: f64,
    design_cl: f64,
    span_ratio: f64,
) -> Result<f64, GeomError> {
    check_positive("radius_mm", radius_mm)?;
    check_blade_count(blade_count)?;
    check_design_cl(design_cl)?;

    let phi_rad = schmitz_inflow_angle_rad(design_tsr, span_ratio)?;
    let r_mm = span_ratio * radius_mm;
    let sin_half = (0.5 * phi_rad).sin();
    let chord_mm = (16.0 * PI * r_mm / (f64::from(blade_count) * design_cl)) * sin_half * sin_half;

    if !chord_mm.is_finite() || chord_mm <= 0.0 {
        return Err(GeomError::InvalidChord(chord_mm));
    }

    Ok(chord_mm)
}

/// Computes the Schmitz optimal twist angle `β(r)` in degrees at normalised
/// station `span_ratio = r / R`.
///
/// Formula: `β(r) = φ_deg(r) − design_alpha_deg`.
///
/// # Errors
///
/// - [`GeomError::NonFinite`] if any input is `NaN` or infinite.
/// - [`GeomError::OutOfRange`] if `design_tsr <= 0`, `|design_alpha_deg| > 90`,
///   or `span_ratio ∉ (0, 1]`.
///
/// # Examples
///
/// ```
/// # use blade_geom::schmitz_twist_deg;
/// // At λ_r = 1 (φ = 30°) with α_design = 6°, β = 24° exactly.
/// let twist = schmitz_twist_deg(4.0, 6.0, 0.25).unwrap();
/// assert!((twist - 24.0).abs() < 1e-12);
/// ```
pub fn schmitz_twist_deg(
    design_tsr: f64,
    design_alpha_deg: f64,
    span_ratio: f64,
) -> Result<f64, GeomError> {
    check_design_alpha_deg(design_alpha_deg)?;
    let inflow_deg = schmitz_inflow_angle_deg(design_tsr, span_ratio)?;
    Ok(inflow_deg - design_alpha_deg)
}

/// Evaluates all Schmitz quantities at a single radial station `span_ratio` for
/// the given [`Rotor`] and [`SchmitzParams`].
///
/// # Errors
///
/// Returns [`GeomError`] when any rotor parameter, aerodynamic parameter or
/// `span_ratio` is outside its valid domain (`span_ratio` must lie within
/// `[hub_radius_mm / radius_mm, 1.0]` and be strictly positive).
pub fn schmitz_station(
    rotor: &Rotor,
    params: &SchmitzParams,
    span_ratio: f64,
) -> Result<SchmitzStation, GeomError> {
    check_rotor_for_schmitz(rotor)?;
    let validated = SchmitzParams::new(params.design_cl, params.design_alpha_deg)?;

    let root_ratio = rotor.hub_radius_mm / rotor.radius_mm;
    check_finite("span_ratio", span_ratio)?;
    if span_ratio < root_ratio - blade_model::RATIO_EPS || span_ratio > 1.0 + blade_model::RATIO_EPS
    {
        return Err(GeomError::OutOfRange {
            field: "span_ratio",
            value: span_ratio,
            min: root_ratio,
            max: 1.0,
        });
    }
    let clamped_ratio = span_ratio.clamp(root_ratio, 1.0);

    let inflow_angle_deg = schmitz_inflow_angle_deg(rotor.design_tsr, clamped_ratio)?;
    let chord_mm = schmitz_chord_mm(
        rotor.radius_mm,
        rotor.blade_count,
        rotor.design_tsr,
        validated.design_cl,
        clamped_ratio,
    )?;
    let twist_deg = inflow_angle_deg - validated.design_alpha_deg;

    Ok(SchmitzStation {
        span_ratio: clamped_ratio,
        span_mm: clamped_ratio * rotor.radius_mm,
        local_tsr: rotor.design_tsr * clamped_ratio,
        inflow_angle_deg,
        chord_mm,
        twist_deg,
    })
}

/// Generates the full Layer-1 Schmitz station table across the uniform stations
/// of `rotor` (`rotor.station_count` stations from `hub_radius_mm / radius_mm`
/// to `1.0`).
///
/// # Errors
///
/// Returns [`GeomError`] if `rotor` or `params` contain invalid parameters.
pub fn schmitz_distribution(
    rotor: &Rotor,
    params: &SchmitzParams,
) -> Result<Vec<SchmitzStation>, GeomError> {
    check_rotor_for_schmitz(rotor)?;
    let validated = SchmitzParams::new(params.design_cl, params.design_alpha_deg)?;

    let count = rotor.station_count as usize;
    let root_ratio = rotor.hub_radius_mm / rotor.radius_mm;
    let last = (count - 1) as f64;

    let mut stations = Vec::with_capacity(count);
    for index in 0..count {
        let ratio = root_ratio + (1.0 - root_ratio) * (index as f64) / last;
        stations.push(schmitz_station(rotor, &validated, ratio)?);
    }

    Ok(stations)
}

fn schmitz_inflow_angle_rad(design_tsr: f64, span_ratio: f64) -> Result<f64, GeomError> {
    check_positive("design_tsr", design_tsr)?;
    check_finite("span_ratio", span_ratio)?;
    if span_ratio <= 0.0 || span_ratio > 1.0 {
        return Err(GeomError::OutOfRange {
            field: "span_ratio",
            value: span_ratio,
            min: f64::MIN_POSITIVE,
            max: 1.0,
        });
    }

    let local_tsr = design_tsr * span_ratio;
    if !local_tsr.is_finite() || local_tsr <= 0.0 {
        return Err(GeomError::OutOfRange {
            field: "local_tsr",
            value: local_tsr,
            min: f64::MIN_POSITIVE,
            max: f64::MAX,
        });
    }

    Ok((2.0 / 3.0) * (1.0_f64).atan2(local_tsr))
}

fn check_rotor_for_schmitz(rotor: &Rotor) -> Result<(), GeomError> {
    check_positive("radius_mm", rotor.radius_mm)?;
    check_finite("hub_radius_mm", rotor.hub_radius_mm)?;
    if rotor.hub_radius_mm <= 0.0 || rotor.hub_radius_mm >= rotor.radius_mm {
        return Err(GeomError::OutOfRange {
            field: "hub_radius_mm",
            value: rotor.hub_radius_mm,
            min: f64::MIN_POSITIVE,
            max: rotor.radius_mm,
        });
    }
    check_blade_count(rotor.blade_count)?;
    check_positive("design_tsr", rotor.design_tsr)?;
    if !(MIN_STATION_COUNT..=MAX_STATION_COUNT).contains(&rotor.station_count) {
        return Err(GeomError::OutOfRange {
            field: "station_count",
            value: f64::from(rotor.station_count),
            min: f64::from(MIN_STATION_COUNT),
            max: f64::from(MAX_STATION_COUNT),
        });
    }
    Ok(())
}

fn check_design_cl(design_cl: f64) -> Result<(), GeomError> {
    check_finite("design_cl", design_cl)?;
    if design_cl <= 0.0 || design_cl > MAX_DESIGN_CL {
        return Err(GeomError::OutOfRange {
            field: "design_cl",
            value: design_cl,
            min: f64::MIN_POSITIVE,
            max: MAX_DESIGN_CL,
        });
    }
    Ok(())
}

fn check_design_alpha_deg(design_alpha_deg: f64) -> Result<(), GeomError> {
    check_finite("design_alpha_deg", design_alpha_deg)?;
    if design_alpha_deg.abs() > MAX_ALPHA_DEG {
        return Err(GeomError::OutOfRange {
            field: "design_alpha_deg",
            value: design_alpha_deg,
            min: -MAX_ALPHA_DEG,
            max: MAX_ALPHA_DEG,
        });
    }
    Ok(())
}

fn check_blade_count(blade_count: u32) -> Result<(), GeomError> {
    if !(1..=MAX_BLADE_COUNT).contains(&blade_count) {
        return Err(GeomError::OutOfRange {
            field: "blade_count",
            value: f64::from(blade_count),
            min: 1.0,
            max: f64::from(MAX_BLADE_COUNT),
        });
    }
    Ok(())
}

fn check_positive(field: &'static str, value: f64) -> Result<(), GeomError> {
    check_finite(field, value)?;
    if value <= 0.0 {
        return Err(GeomError::OutOfRange {
            field,
            value,
            min: f64::MIN_POSITIVE,
            max: f64::MAX,
        });
    }
    Ok(())
}

fn check_finite(field: &'static str, value: f64) -> Result<(), GeomError> {
    if !value.is_finite() {
        return Err(GeomError::NonFinite { field, value });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture_rotor() -> Rotor {
        Rotor {
            radius_mm: 600.0,
            hub_radius_mm: 60.0,
            blade_count: 3,
            design_tsr: 4.5,
            wind_speed_mps: 8.0,
            pitch_axis_ratio: 0.25,
            station_count: 11,
        }
    }

    #[test]
    fn exact_algebraic_points_match_closed_form() {
        // 1) At λ_r = 1 (TSR = 4, r/R = 0.25):
        //    atan(1) = π/4 = 45° => φ = 30°
        //    sin²(15°) = (2 - √3) / 4
        let phi_deg = schmitz_inflow_angle_deg(4.0, 0.25).expect("valid");
        assert!((phi_deg - 30.0).abs() < 1e-12);

        let twist_deg = schmitz_twist_deg(4.0, 6.0, 0.25).expect("valid");
        assert!((twist_deg - 24.0).abs() < 1e-12);

        let r_mm = 0.25 * 600.0;
        let expected_chord = (16.0 * PI * r_mm / (3.0 * 1.0)) * ((2.0 - 3.0_f64.sqrt()) / 4.0);
        let chord_mm = schmitz_chord_mm(600.0, 3, 4.0, 1.0, 0.25).expect("valid");
        assert!((chord_mm - expected_chord).abs() < 1e-12);

        // 2) At λ_r = √3 (TSR = 2√3, r/R = 0.5):
        //    atan(1/√3) = π/6 = 30° => φ = 20°
        let phi_sqrt3 = schmitz_inflow_angle_deg(2.0 * 3.0_f64.sqrt(), 0.5).expect("valid");
        assert!((phi_sqrt3 - 20.0).abs() < 1e-12);
    }

    #[test]
    fn matches_hand_calculated_11_station_fixture_table() {
        // Hand-calculated reference table for:
        // R = 600 mm, r_hub = 60 mm, B = 3, λ = 4.5, C_l = 1.0, α_design = 6.0°
        // Stations k = 0..10: span_ratio = 0.10 + 0.09 * k
        const EXPECTED: [(f64, f64, f64, f64); 11] = [
            // (span_ratio, span_mm, chord_mm, twist_deg)
            (0.10, 60.0, 140.151_186_545_585_18, 37.848_169_788_030_546),
            (0.19, 114.0, 153.892_536_874_877_4, 26.979_704_985_474_704),
            (0.28, 168.0, 138.428_254_342_589_64, 19.624_867_660_708_365),
            (0.37, 222.0, 119.596_905_693_903_99, 14.659_368_453_550_215),
            (0.46, 276.0, 103.285_077_933_095_44, 11.189_871_129_651_745),
            (0.55, 330.0, 90.089_622_226_299_64, 8.667_132_233_693_728),
            (0.64, 384.0, 79.514_782_486_570_18, 6.765_424_971_959_732),
            (0.73, 438.0, 70.973_183_047_197_68, 5.287_322_148_126_496),
            (0.82, 492.0, 63.984_620_665_201_85, 4.108_739_361_443_852_5),
            (0.91, 546.0, 58.187_911_075_419_564, 3.148_709_882_125_205),
            (1.00, 600.0, 53.316_582_840_324_145, 2.352_538_472_767_673),
        ];

        let rotor = fixture_rotor();
        let params = SchmitzParams::new(1.0, 6.0).expect("valid params");
        let table = schmitz_distribution(&rotor, &params).expect("distribution builds");

        assert_eq!(table.len(), EXPECTED.len());
        for (index, (got, &(ratio, span_mm, chord_mm, twist_deg))) in
            table.iter().zip(&EXPECTED).enumerate()
        {
            assert!(
                (got.span_ratio - ratio).abs() < 1e-12,
                "station {index} span_ratio: got {}, expected {ratio}",
                got.span_ratio
            );
            assert!(
                (got.span_mm - span_mm).abs() < 1e-9,
                "station {index} span_mm: got {}, expected {span_mm}",
                got.span_mm
            );
            assert!(
                (got.chord_mm - chord_mm).abs() < 1e-9,
                "station {index} chord_mm: got {}, expected {chord_mm}",
                got.chord_mm
            );
            assert!(
                (got.twist_deg - twist_deg).abs() < 1e-9,
                "station {index} twist_deg: got {}, expected {twist_deg}",
                got.twist_deg
            );
        }
    }

    #[test]
    fn rejects_invalid_inputs_without_panicking() {
        assert!(matches!(
            SchmitzParams::new(0.0, 5.0),
            Err(GeomError::OutOfRange {
                field: "design_cl",
                ..
            })
        ));
        assert!(matches!(
            SchmitzParams::new(f64::NAN, 5.0),
            Err(GeomError::NonFinite {
                field: "design_cl",
                ..
            })
        ));
        assert!(matches!(
            SchmitzParams::new(1.0, 95.0),
            Err(GeomError::OutOfRange {
                field: "design_alpha_deg",
                ..
            })
        ));
        assert!(matches!(
            schmitz_inflow_angle_deg(4.5, 0.0),
            Err(GeomError::OutOfRange {
                field: "span_ratio",
                ..
            })
        ));
        assert!(matches!(
            schmitz_chord_mm(600.0, 0, 4.5, 1.0, 0.5),
            Err(GeomError::OutOfRange {
                field: "blade_count",
                ..
            })
        ));
    }
}
