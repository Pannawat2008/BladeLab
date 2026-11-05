//! Schema parsing, validation and error-message tests (T-002 acceptance).

use blade_model::{validate, Design, ModelError, ValidationIssue, SCHEMA_VERSION};

const TYPICAL: &str = include_str!("../../../fixtures/naca4412-linear.json");

fn typical() -> Design {
    Design::from_json(TYPICAL).expect("fixture must parse")
}

fn paths(issues: &[ValidationIssue]) -> Vec<String> {
    issues
        .iter()
        .map(|issue| issue.path.clone())
        .collect::<Vec<_>>()
}

#[test]
fn parses_and_validates_the_fixture() {
    let design = typical();
    assert_eq!(design.schema_version, SCHEMA_VERSION);
    assert_eq!(design.rotor.blade_count, 3);
    assert!(validate(&design).is_ok());
}

#[test]
fn round_trips_through_json() {
    let design = typical();
    let json = design.to_json().expect("serialises");
    let parsed = Design::from_json(&json).expect("re-parses");
    assert_eq!(parsed, design);
}

#[test]
fn rejects_unknown_fields() {
    let json = TYPICAL.replace(
        "\"schema_version\": 1,",
        "\"schema_version\": 1, \"surprise\": true,",
    );
    assert!(matches!(Design::from_json(&json), Err(ModelError::Json(_))));
}

#[test]
fn rejects_unknown_schema_versions() {
    let json = TYPICAL.replace("\"schema_version\": 1", "\"schema_version\": 7");
    assert!(matches!(
        Design::from_json(&json),
        Err(ModelError::UnsupportedSchema {
            found: 7,
            supported: 1
        })
    ));
}

#[test]
fn rejects_malformed_json() {
    assert!(matches!(
        Design::from_json("{ not json"),
        Err(ModelError::Json(_))
    ));
}

#[test]
fn flags_bad_rotor_values() {
    let mut design = typical();
    design.rotor.radius_mm = -1.0;
    design.rotor.blade_count = 0;
    design.rotor.station_count = 1;
    design.rotor.pitch_axis_ratio = 1.5;

    let issues = validate(&design).expect_err("must be invalid");
    let paths = paths(&issues);
    for expected in [
        "rotor.radius_mm",
        "rotor.blade_count",
        "rotor.station_count",
        "rotor.pitch_axis_ratio",
    ] {
        assert!(paths.contains(&expected.to_string()), "missing {expected}");
    }
}

#[test]
fn flags_hub_geometry_violations() {
    let mut design = typical();
    design.hub.bore_diameter_mm = design.hub.diameter_mm;

    let issues = validate(&design).expect_err("bore must be smaller");
    assert!(paths(&issues).contains(&"hub.bore_diameter_mm".to_string()));
}

#[test]
fn flags_duplicate_overrides() {
    let mut design = typical();
    design.overrides.push(design.overrides[0].clone());

    let issues = validate(&design).expect_err("duplicate stations must fail");
    assert!(paths(&issues).contains(&"overrides[1].span_ratio".to_string()));
}

#[test]
fn flags_overrides_outside_the_blade_span() {
    let mut design = typical();
    design.overrides[0].span_ratio = 0.0;

    let issues = validate(&design).expect_err("below the hub");
    assert!(paths(&issues).contains(&"overrides[0].span_ratio".to_string()));
}

#[test]
fn flags_airfoils_that_do_not_cover_the_blade() {
    let mut design = typical();
    design.airfoils.retain(|station| station.span_ratio > 0.5);

    let issues = validate(&design).expect_err("root is uncovered");
    assert!(paths(&issues).contains(&"airfoils[0].span_ratio".to_string()));
}

#[test]
fn flags_unsorted_and_out_of_range_airfoil_stations() {
    let mut design = typical();
    design.airfoils[0].span_ratio = 0.9;

    let issues = validate(&design).expect_err("wrong order");
    let paths = paths(&issues);
    assert!(paths.iter().any(|path| path.starts_with("airfoils[")));
}

#[test]
fn flags_bad_naca_parameters() {
    let mut design = typical();
    if let blade_model::AirfoilSpec::Naca4 {
        max_camber,
        thickness_ratio,
        ..
    } = &mut design.airfoils[0].airfoil
    {
        *max_camber = 0.4;
        *thickness_ratio = 0.0;
    } else {
        panic!("fixture uses NACA 4-digit airfoils");
    }

    let issues = validate(&design).expect_err("bad profile");
    let paths = paths(&issues);
    assert!(paths.contains(&"airfoils[0].airfoil.max_camber".to_string()));
    assert!(paths.contains(&"airfoils[0].airfoil.thickness_ratio".to_string()));
}

#[test]
fn non_finite_values_are_reported_not_panicked() {
    let mut design = typical();
    design.rotor.radius_mm = f64::NAN;
    design.distributions.chord_mm = blade_model::CurveSource::Constant {
        value: f64::INFINITY,
    };

    let issues = validate(&design).expect_err("non-finite input");
    let paths = paths(&issues);
    assert!(paths.contains(&"rotor.radius_mm".to_string()));
    assert!(paths.contains(&"distributions.chord_mm.root".to_string()));
    assert!(paths.contains(&"distributions.chord_mm.tip".to_string()));
}

#[test]
fn schema_version_field_is_validated_too() {
    let mut design = typical();
    design.schema_version = 3;

    let issues = validate(&design).expect_err("version mismatch");
    assert!(paths(&issues).contains(&"schema_version".to_string()));
}

/// A D-flat is optional: a round-bore JSON (like the fixture) and an explicit
/// flat both parse, and out-of-range flat distances are rejected.
#[test]
fn hub_d_flat_is_optional_and_validated() {
    let round = typical();
    assert_eq!(round.hub.shaft_flat(), None, "fixture bore stays round");

    let mut flat = round.clone();
    flat.hub.shaft_flat_radial_mm = Some(4.8);
    let json = flat.to_json().expect("serialises");
    let reparsed = Design::from_json(&json).expect("re-parses");
    assert_eq!(reparsed.hub.shaft_flat(), Some(4.8));
    assert!(validate(&reparsed).is_ok(), "4.8 mm within (0, 6)");

    let mut bad = flat.clone();
    bad.hub.shaft_flat_radial_mm = Some(6.0); // exactly the bore radius
    let issues = validate(&bad).expect_err("flat at the bore radius is invalid");
    assert!(paths(&issues).contains(&"hub.shaft_flat_radial_mm".to_string()));

    let mut bad_zero = flat;
    bad_zero.hub.shaft_flat_radial_mm = Some(0.0);
    let issues = validate(&bad_zero).expect_err("zero flat is invalid");
    assert!(paths(&issues).contains(&"hub.shaft_flat_radial_mm".to_string()));
}

#[test]
fn schmitz_fixture_parses_round_trips_and_validates() {
    let raw = include_str!("../../../fixtures/naca4412-schmitz.json");
    let design = Design::from_json(raw).expect("schmitz fixture parses");
    assert!(validate(&design).is_ok());

    let serialized = design.to_json().expect("serialises");
    let reparsed = Design::from_json(&serialized).expect("re-parses");
    assert_eq!(reparsed, design);

    let mut bad = design.clone();
    bad.distributions.chord_mm = blade_model::CurveSource::Schmitz {
        design_cl: Some(0.0),
        design_alpha_deg: None,
    };
    bad.distributions.twist_deg = blade_model::CurveSource::Schmitz {
        design_cl: None,
        design_alpha_deg: None,
    };
    bad.rotor.hub_radius_mm = 0.0;
    let issues = validate(&bad).expect_err("invalid schmitz parameters");
    let issue_paths = paths(&issues);
    assert!(issue_paths.contains(&"distributions.chord_mm.design_cl".to_string()));
    assert!(issue_paths.contains(&"distributions.twist_deg.design_alpha_deg".to_string()));
    assert!(issue_paths.contains(&"rotor.hub_radius_mm".to_string()));
}

#[test]
fn bezier_and_formula_distributions_validate_and_reject_malformed_inputs_without_panicking() {
    let mut design = typical();
    design.distributions.chord_mm = blade_model::CurveSource::Bezier {
        points: vec![
            blade_model::BezierControlPoint { x: 0.0, y: 72.0 },
            blade_model::BezierControlPoint { x: 0.35, y: 65.0 },
            blade_model::BezierControlPoint { x: 0.7, y: 44.0 },
            blade_model::BezierControlPoint { x: 1.0, y: 30.0 },
        ],
    };
    design.distributions.twist_deg = blade_model::CurveSource::Formula {
        expr: "(2.0 / 3.0) * deg(atan(1.0 / (tsr * x))) - 6.0".to_string(),
    };
    assert!(validate(&design).is_ok());

    // Malformed formulas, unknown variables, division by zero, and out-of-range values
    // must all return friendly ValidationIssues without panicking.
    for bad_expr in [
        "",
        "70.0 + * 5.0",
        "unknown_var * x + 10.0",
        "1.0 / (x - x)",
        "sqrt(-1.0)",
        "-15.0 * x",
        "\"not_a_number\"",
    ] {
        let mut bad = design.clone();
        bad.distributions.chord_mm = blade_model::CurveSource::Formula {
            expr: bad_expr.to_string(),
        };
        let issues = validate(&bad).expect_err(&format!("formula `{bad_expr}` must be rejected"));
        assert!(
            paths(&issues).contains(&"distributions.chord_mm.expr".to_string()),
            "missing chord_mm.expr issue for `{bad_expr}`: {issues:?}"
        );
    }

    // Invalid Bézier control points: non-monotonic x, missing endpoint, or <= 0 chord y.
    let mut bad_bezier = design.clone();
    bad_bezier.distributions.chord_mm = blade_model::CurveSource::Bezier {
        points: vec![
            blade_model::BezierControlPoint { x: 0.1, y: 70.0 },
            blade_model::BezierControlPoint { x: 0.6, y: -5.0 },
            blade_model::BezierControlPoint { x: 0.4, y: 40.0 },
            blade_model::BezierControlPoint { x: 0.9, y: 30.0 },
        ],
    };
    let issues = validate(&bad_bezier).expect_err("bad bezier control points");
    let issue_paths = paths(&issues);
    assert!(issue_paths.contains(&"distributions.chord_mm.points[0].x".to_string()));
    assert!(issue_paths.contains(&"distributions.chord_mm.points[1].y".to_string()));
    assert!(issue_paths.contains(&"distributions.chord_mm.points[2].x".to_string()));
    assert!(issue_paths.contains(&"distributions.chord_mm.points[3].x".to_string()));
}
