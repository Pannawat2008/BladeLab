//! Semantic validation of a [`crate::Design`](crate::schema::Design).
//!
//! Validation is pure and total: it never panics, reports every problem it can
//! find, and returns them as a `Vec` so the UI can highlight all fields at once.

use crate::error::ValidationIssue;
use crate::schema::{AirfoilSpec, CurveSource, Design, SCHEMA_VERSION};
use crate::RATIO_EPS;

/// Largest accepted twist magnitude in degrees.
const MAX_TWIST_DEG: f64 = 90.0;

/// Checks a design and returns every issue found.
///
/// # Errors
///
/// Returns the (non-empty) issue list when the design is invalid.
///
/// # Examples
///
/// ```
/// # use blade_model::{validate, Design};
/// let json = include_str!("../../../fixtures/naca4412-linear.json");
/// let design = Design::from_json(json).unwrap();
/// assert!(validate(&design).is_ok());
/// ```
pub fn validate(design: &Design) -> Result<(), Vec<ValidationIssue>> {
    let mut issues = Vec::new();

    if design.schema_version != SCHEMA_VERSION {
        issues.push(ValidationIssue::new(
            "schema_version",
            format!("must be {SCHEMA_VERSION}"),
        ));
    }

    check_rotor(design, &mut issues);
    check_distributions(design, &mut issues);
    check_airfoils(design, &mut issues);
    check_overrides(design, &mut issues);
    check_hub(design, &mut issues);
    check_manufacturing(design, &mut issues);

    if issues.is_empty() {
        Ok(())
    } else {
        Err(issues)
    }
}

fn check_rotor(design: &Design, issues: &mut Vec<ValidationIssue>) {
    let rotor = &design.rotor;
    if !positive(rotor.radius_mm) {
        issues.push(ValidationIssue::new(
            "rotor.radius_mm",
            "must be a finite, strictly positive length in mm",
        ));
    }
    if !finite(rotor.hub_radius_mm) || rotor.hub_radius_mm < 0.0 {
        issues.push(ValidationIssue::new(
            "rotor.hub_radius_mm",
            "must be a finite, non-negative length in mm",
        ));
    } else if finite(rotor.radius_mm) && rotor.hub_radius_mm >= rotor.radius_mm {
        issues.push(ValidationIssue::new(
            "rotor.hub_radius_mm",
            "must be smaller than rotor.radius_mm",
        ));
    }
    if !(1..=12).contains(&rotor.blade_count) {
        issues.push(ValidationIssue::new(
            "rotor.blade_count",
            "must be between 1 and 12",
        ));
    }
    if !positive(rotor.design_tsr) {
        issues.push(ValidationIssue::new(
            "rotor.design_tsr",
            "must be a finite, strictly positive tip-speed ratio",
        ));
    }
    if !positive(rotor.wind_speed_mps) {
        issues.push(ValidationIssue::new(
            "rotor.wind_speed_mps",
            "must be a finite, strictly positive wind speed",
        ));
    }
    if !finite(rotor.pitch_axis_ratio) || !(0.0..=1.0).contains(&rotor.pitch_axis_ratio) {
        issues.push(ValidationIssue::new(
            "rotor.pitch_axis_ratio",
            "must be within [0, 1]",
        ));
    }
    if !(2..=200).contains(&rotor.station_count) {
        issues.push(ValidationIssue::new(
            "rotor.station_count",
            "must be between 2 and 200",
        ));
    }
}

fn check_distributions(design: &Design, issues: &mut Vec<ValidationIssue>) {
    check_curve(
        &design.distributions.chord_mm,
        "distributions.chord_mm",
        issues,
        positive,
        "must be a finite, strictly positive length in mm",
    );
    check_curve(
        &design.distributions.twist_deg,
        "distributions.twist_deg",
        issues,
        |value| finite(value) && value.abs() <= MAX_TWIST_DEG,
        "must be finite and within ±90 degrees",
    );
}

fn check_curve(
    curve: &CurveSource,
    path: &str,
    issues: &mut Vec<ValidationIssue>,
    accepts: impl Fn(f64) -> bool,
    message: &str,
) {
    let (root, tip) = curve.bounds();
    if !accepts(root) {
        issues.push(ValidationIssue::new(format!("{path}.root"), message));
    }
    if !accepts(tip) {
        issues.push(ValidationIssue::new(format!("{path}.tip"), message));
    }
}

fn check_airfoils(design: &Design, issues: &mut Vec<ValidationIssue>) {
    if design.airfoils.is_empty() {
        issues.push(ValidationIssue::new(
            "airfoils",
            "at least one airfoil station is required",
        ));
        return;
    }

    let hub_ratio = if finite(design.rotor.radius_mm) && design.rotor.radius_mm > 0.0 {
        design.rotor.hub_radius_mm / design.rotor.radius_mm
    } else {
        0.0
    };

    let mut previous: Option<f64> = None;
    for (index, station) in design.airfoils.iter().enumerate() {
        let path = format!("airfoils[{index}]");
        if !finite(station.span_ratio) || !(0.0..=1.0).contains(&station.span_ratio) {
            issues.push(ValidationIssue::new(
                format!("{path}.span_ratio"),
                "must be within [0, 1]",
            ));
        }
        if let Some(previous) = previous {
            if station.span_ratio <= previous {
                issues.push(ValidationIssue::new(
                    format!("{path}.span_ratio"),
                    "must be strictly greater than the previous airfoil station",
                ));
            }
        }
        previous = Some(station.span_ratio);
        check_airfoil_spec(&station.airfoil, &format!("{path}.airfoil"), issues);
    }

    let first = design.airfoils[0].span_ratio;
    let last = design.airfoils[design.airfoils.len() - 1].span_ratio;
    if finite(first) && first > hub_ratio + RATIO_EPS {
        issues.push(ValidationIssue::new(
            "airfoils[0].span_ratio",
            "must cover the blade root (span_ratio <= hub_radius_mm / radius_mm)",
        ));
    }
    if finite(last) && last < 1.0 - RATIO_EPS {
        issues.push(ValidationIssue::new(
            format!("airfoils[{}].span_ratio", design.airfoils.len() - 1),
            "must cover the blade tip (span_ratio >= 1)",
        ));
    }
}

fn check_airfoil_spec(spec: &AirfoilSpec, path: &str, issues: &mut Vec<ValidationIssue>) {
    match spec {
        AirfoilSpec::Naca4 {
            max_camber,
            camber_position,
            thickness_ratio,
        } => {
            if !finite(*max_camber) || !(0.0..=0.1).contains(max_camber) {
                issues.push(ValidationIssue::new(
                    format!("{path}.max_camber"),
                    "must be within [0, 0.1]",
                ));
            }
            if !finite(*camber_position) || !(0.0..=1.0).contains(camber_position) {
                issues.push(ValidationIssue::new(
                    format!("{path}.camber_position"),
                    "must be within [0, 1]",
                ));
            } else if *max_camber > 0.0 && !(*camber_position > 0.0 && *camber_position < 1.0) {
                issues.push(ValidationIssue::new(
                    format!("{path}.camber_position"),
                    "must be strictly inside (0, 1) for a cambered profile",
                ));
            }
            if !finite(*thickness_ratio) || !(0.001..=0.5).contains(thickness_ratio) {
                issues.push(ValidationIssue::new(
                    format!("{path}.thickness_ratio"),
                    "must be within [0.001, 0.5]",
                ));
            }
        }
        AirfoilSpec::Named { name } => {
            if name.trim().is_empty() {
                issues.push(ValidationIssue::new(
                    format!("{path}.name"),
                    "must not be empty",
                ));
            }
        }
    }
}

fn check_overrides(design: &Design, issues: &mut Vec<ValidationIssue>) {
    let hub_ratio = if finite(design.rotor.radius_mm) && design.rotor.radius_mm > 0.0 {
        design.rotor.hub_radius_mm / design.rotor.radius_mm
    } else {
        0.0
    };

    for (index, station) in design.overrides.iter().enumerate() {
        let path = format!("overrides[{index}]");
        if !finite(station.span_ratio)
            || station.span_ratio < hub_ratio - RATIO_EPS
            || station.span_ratio > 1.0 + RATIO_EPS
        {
            issues.push(ValidationIssue::new(
                format!("{path}.span_ratio"),
                "must be within the blade span [hub_radius/R, 1]",
            ));
        }
        for (other_index, other) in design.overrides.iter().enumerate().take(index) {
            if (station.span_ratio - other.span_ratio).abs() <= RATIO_EPS {
                issues.push(ValidationIssue::new(
                    format!("{path}.span_ratio"),
                    format!("duplicates overrides[{other_index}].span_ratio"),
                ));
                break;
            }
        }
        if let Some(chord) = station.chord_mm {
            if !positive(chord) {
                issues.push(ValidationIssue::new(
                    format!("{path}.chord_mm"),
                    "must be a finite, strictly positive length in mm",
                ));
            }
        }
        if let Some(twist) = station.twist_deg {
            if !finite(twist) || twist.abs() > MAX_TWIST_DEG {
                issues.push(ValidationIssue::new(
                    format!("{path}.twist_deg"),
                    "must be finite and within ±90 degrees",
                ));
            }
        }
        if let Some(spec) = &station.airfoil {
            check_airfoil_spec(spec, &format!("{path}.airfoil"), issues);
        }
    }
}

fn check_hub(design: &Design, issues: &mut Vec<ValidationIssue>) {
    let hub = &design.hub;
    if !positive(hub.diameter_mm) {
        issues.push(ValidationIssue::new(
            "hub.diameter_mm",
            "must be a finite, strictly positive length in mm",
        ));
    }
    if !finite(hub.bore_diameter_mm) || hub.bore_diameter_mm < 0.0 {
        issues.push(ValidationIssue::new(
            "hub.bore_diameter_mm",
            "must be a finite, non-negative length in mm",
        ));
    } else if finite(hub.diameter_mm) && hub.bore_diameter_mm >= hub.diameter_mm {
        issues.push(ValidationIssue::new(
            "hub.bore_diameter_mm",
            "must be smaller than hub.diameter_mm",
        ));
    }
    if !positive(hub.length_mm) {
        issues.push(ValidationIssue::new(
            "hub.length_mm",
            "must be a finite, strictly positive length in mm",
        ));
    }
    if let Some(flat) = hub.shaft_flat() {
        let ok = finite(flat) && flat > 0.0 && flat < hub.bore_diameter_mm / 2.0;
        if !ok {
            issues.push(ValidationIssue::new(
                "hub.shaft_flat_radial_mm",
                "must be finite and strictly between 0 and bore_diameter_mm / 2",
            ));
        }
    }
}

fn check_manufacturing(design: &Design, issues: &mut Vec<ValidationIssue>) {
    let manufacturing = &design.manufacturing;
    if !finite(manufacturing.min_trailing_edge_mm) || manufacturing.min_trailing_edge_mm < 0.0 {
        issues.push(ValidationIssue::new(
            "manufacturing.min_trailing_edge_mm",
            "must be a finite, non-negative length in mm",
        ));
    }
    if !positive(manufacturing.wall_thickness_mm) {
        issues.push(ValidationIssue::new(
            "manufacturing.wall_thickness_mm",
            "must be a finite, strictly positive length in mm",
        ));
    }
}

fn finite(value: f64) -> bool {
    value.is_finite()
}

fn positive(value: f64) -> bool {
    value.is_finite() && value > 0.0
}
