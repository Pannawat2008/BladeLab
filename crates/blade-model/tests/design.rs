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
