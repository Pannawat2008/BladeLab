//! Layer merging tests: layer 1/2 values, layer 3 overrides, airfoil assignment.

use blade_model::{resolve, AirfoilSpec, CurveSource, Design, ModelError, RATIO_EPS};

const TYPICAL: &str = include_str!("../../../fixtures/naca4412-linear.json");

fn typical() -> Design {
    Design::from_json(TYPICAL).expect("fixture must parse")
}

#[test]
fn resolves_uniform_stations_over_the_blade_span() {
    let design = typical();
    let blade = resolve(&design).expect("valid design");

    assert_eq!(blade.stations.len(), design.rotor.station_count as usize);
    assert!(blade.stations.len() >= 2);

    let root = &blade.stations[0];
    let tip = &blade.stations[blade.stations.len() - 1];
    assert!((root.span_mm - design.rotor.hub_radius_mm).abs() < 1e-9);
    assert!((tip.span_mm - design.rotor.radius_mm).abs() < 1e-9);
    assert!((root.span_ratio - 0.1).abs() < 1e-12);

    for pair in blade.stations.windows(2) {
        assert!(pair[1].span_mm > pair[0].span_mm);
        assert!(pair[1].span_ratio > pair[0].span_ratio);
    }
}

#[test]
fn evaluates_layer_two_curves_between_hub_and_tip() {
    let design = typical();
    let blade = resolve(&design).expect("valid design");

    // Root: layer-2 root values.
    assert!((blade.stations[0].chord_mm - 70.0).abs() < 1e-9);
    assert!((blade.stations[0].twist_deg - 20.0).abs() < 1e-9);

    // Mid span (s = 0.5): halfway between root and tip values.
    let middle = &blade.stations[design.rotor.station_count as usize / 2];
    assert!((middle.chord_mm - 52.5).abs() < 1e-9);
    assert!((middle.twist_deg - 11.5).abs() < 1e-9);
}

#[test]
fn layer_three_overrides_win_at_the_tip() {
    let design = typical();
    let blade = resolve(&design).expect("valid design");
    let tip = &blade.stations[blade.stations.len() - 1];

    assert!((tip.chord_mm - 32.0).abs() < 1e-9);
    assert!((tip.twist_deg - 2.0).abs() < 1e-9);
}

#[test]
fn overrides_add_their_own_station() {
    let mut design = typical();
    design.overrides.push(blade_model::StationOverride {
        span_ratio: 0.3,
        chord_mm: Some(10.0),
        twist_deg: None,
        airfoil: None,
    });

    let blade = resolve(&design).expect("valid design");
    assert_eq!(
        blade.stations.len(),
        design.rotor.station_count as usize + 1
    );

    let overridden = blade
        .stations
        .iter()
        .find(|station| (station.span_ratio - 0.3).abs() <= RATIO_EPS)
        .expect("override station exists");
    assert!((overridden.chord_mm - 10.0).abs() < 1e-9);
    // Twist keeps the layer-2 value.
    assert!(overridden.twist_deg > 3.0 && overridden.twist_deg < 20.0);
}

#[test]
fn airfoil_changes_take_effect_from_their_station_outwards() {
    let mut design = typical();
    design.airfoils.insert(
        1,
        blade_model::AirfoilStation {
            span_ratio: 0.6,
            airfoil: AirfoilSpec::Naca4 {
                max_camber: 0.0,
                camber_position: 0.0,
                thickness_ratio: 0.2,
            },
        },
    );

    let blade = resolve(&design).expect("valid design");
    for station in &blade.stations {
        // A station applies from its span ratio up to the next station. The
        // fixture still assigns a profile at the tip, so 0.12 comes back there.
        let expected = if station.span_ratio < 0.6 - RATIO_EPS {
            0.12
        } else if station.span_ratio < 1.0 - RATIO_EPS {
            0.2
        } else {
            0.12
        };
        assert!(
            (station.airfoil.thickness_ratio - expected).abs() < 1e-12,
            "station {} has thickness {}, expected {expected}",
            station.span_ratio,
            station.airfoil.thickness_ratio
        );
    }
    // The inserted profile must actually be used by the inner stations.
    assert!(blade
        .stations
        .iter()
        .any(|station| (station.airfoil.thickness_ratio - 0.2).abs() < 1e-12));
}

#[test]
fn constant_curves_resolve_to_one_value() {
    let mut design = typical();
    // The fixture carries a layer-3 tip override, which must keep winning.
    // Remove it so the layer-2 constants are the only source of values.
    design.overrides.clear();
    design.distributions.chord_mm = CurveSource::Constant { value: 55.0 };
    design.distributions.twist_deg = CurveSource::Constant { value: 7.5 };

    let blade = resolve(&design).expect("valid design");
    for station in &blade.stations {
        assert!((station.chord_mm - 55.0).abs() < 1e-12);
        assert!((station.twist_deg - 7.5).abs() < 1e-12);
    }
}

#[test]
fn named_airfoils_are_rejected_with_a_clear_error() {
    let mut design = typical();
    design.airfoils[0].airfoil = AirfoilSpec::Named {
        name: "SG6043".to_string(),
    };

    match resolve(&design) {
        Err(ModelError::UnsupportedAirfoil(name)) => assert_eq!(name, "SG6043"),
        other => panic!("expected UnsupportedAirfoil, got {other:?}"),
    }
}

#[test]
fn invalid_designs_do_not_resolve() {
    let mut design = typical();
    design.rotor.radius_mm = 0.0;

    match resolve(&design) {
        Err(ModelError::Invalid(issues)) => {
            assert!(issues.iter().any(|issue| issue.path == "rotor.radius_mm"));
        }
        other => panic!("expected Invalid, got {other:?}"),
    }
}

#[test]
fn hub_and_manufacturing_are_copied_through() {
    let design = typical();
    let blade = resolve(&design).expect("valid design");
    assert_eq!(blade.hub, design.hub);
    assert_eq!(blade.manufacturing, design.manufacturing);
    assert_eq!(blade.rotor, design.rotor);
}

#[test]
fn resolves_schmitz_chord_and_twist_and_applies_layer_three_overrides() {
    let raw = include_str!("../../../fixtures/naca4412-schmitz.json");
    let mut design = Design::from_json(raw).expect("schmitz fixture parses");
    let blade = resolve(&design).expect("schmitz fixture resolves");

    assert_eq!(blade.stations.len(), 11);
    // Root (r/R = 0.1, r = 60 mm, λ_r = 0.45):
    assert!((blade.stations[0].chord_mm - 140.151_186_545_585_18).abs() < 1e-9);
    assert!((blade.stations[0].twist_deg - 37.848_169_788_030_546).abs() < 1e-9);
    // Peak chord station (r/R = 0.19, r = 114 mm, λ_r = 0.855):
    assert!((blade.stations[1].chord_mm - 153.892_536_874_877_4).abs() < 1e-9);
    // Tip (r/R = 1.0, r = 600 mm, λ_r = 4.5):
    assert!((blade.stations[10].chord_mm - 53.316_582_840_324_145).abs() < 1e-9);
    assert!((blade.stations[10].twist_deg - 2.352_538_472_767_673).abs() < 1e-9);

    // Layer-3 override at the tip wins over Layer-1 Schmitz.
    design.overrides.push(blade_model::StationOverride {
        span_ratio: 1.0,
        chord_mm: Some(40.0),
        twist_deg: Some(1.5),
        airfoil: None,
    });
    let overridden = resolve(&design).expect("resolves with override");
    let tip = &overridden.stations[overridden.stations.len() - 1];
    assert!((tip.chord_mm - 40.0).abs() < 1e-12);
    assert!((tip.twist_deg - 1.5).abs() < 1e-12);
}
