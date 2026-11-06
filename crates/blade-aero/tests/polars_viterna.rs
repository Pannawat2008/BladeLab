use blade_aero::{
    viterna_cd_max, wrap_alpha_deg, AeroError, PolarPoint, PolarSet, PolarSweepSpec, PolarTable,
    PolarTableSpec, BUILTIN_POLAR_NAMES,
};
use blade_model::{resolve, Design};
use proptest::prelude::*;

#[test]
fn builtin_polar_set_loads_all_seven_airfoils_and_evaluates_full_360_range() {
    let set = PolarSet::builtin();
    for &name in BUILTIN_POLAR_NAMES {
        let table = set
            .get(name)
            .unwrap_or_else(|| panic!("missing builtin polar {name}"));
        assert_eq!(table.name(), name);
        let expected_cd_max = viterna_cd_max(table.aspect_ratio());

        // Evaluate across full [-180 deg, +180 deg] in 1-degree steps
        for deg in -180..=180 {
            let alpha = deg as f64;
            let eval = table.eval(alpha, 100_000.0).expect("valid polar eval");
            assert!(eval.cl.is_finite(), "{name} non-finite Cl at alpha={alpha}");
            assert!(
                eval.cd.is_finite() && eval.cd > 0.0,
                "{name} invalid Cd={} at alpha={alpha}",
                eval.cd
            );
            assert!(
                eval.cd <= expected_cd_max + 1e-6,
                "{name} Cd={} exceeds cd_max={} at alpha={alpha}",
                eval.cd,
                expected_cd_max
            );
        }

        // At +/- 90 deg, Cl == 0 and Cd == Cd_max
        let pos90 = table.eval(90.0, 100_000.0).unwrap();
        let neg90 = table.eval(-90.0, 100_000.0).unwrap();
        assert!(pos90.cl.abs() < 1e-12);
        assert!(neg90.cl.abs() < 1e-12);
        assert!((pos90.cd - expected_cd_max).abs() < 1e-9);
        assert!((neg90.cd - expected_cd_max).abs() < 1e-9);

        // At +/- 180 deg, Cl == 0 and periodic continuity holds
        let pos180 = table.eval(180.0, 100_000.0).unwrap();
        let neg180 = table.eval(-180.0, 100_000.0).unwrap();
        assert!(pos180.cl.abs() < 1e-12);
        assert!(neg180.cl.abs() < 1e-12);
        assert!((pos180.cd - neg180.cd).abs() < 1e-12);
    }
}

#[test]
fn viterna_extrapolation_is_c0_continuous_across_stall_and_90_deg_boundaries() {
    let set = PolarSet::builtin();
    let sg6043 = set.get("SG6043").unwrap();
    let eps = 1e-6;

    // Boundary points: negative stall (-12 deg), positive stall (+16 deg), +/-90 deg, +/-180 deg
    for &boundary in &[-90.0_f64, -12.0, 16.0, 90.0] {
        let left = sg6043.eval(boundary - eps, 100_000.0).unwrap();
        let center = sg6043.eval(boundary, 100_000.0).unwrap();
        let right = sg6043.eval(boundary + eps, 100_000.0).unwrap();

        assert!(
            (left.cl - center.cl).abs() < 1e-4 && (right.cl - center.cl).abs() < 1e-4,
            "Cl discontinuity at alpha={boundary}: left={}, center={}, right={}",
            left.cl,
            center.cl,
            right.cl
        );
        assert!(
            (left.cd - center.cd).abs() < 1e-4 && (right.cd - center.cd).abs() < 1e-4,
            "Cd discontinuity at alpha={boundary}: left={}, center={}, right={}",
            left.cd,
            center.cd,
            right.cd
        );
    }
}

#[test]
fn resolves_station_polars_for_fixture_and_named_airfoils() {
    let raw = include_str!("../../../fixtures/naca4412-linear.json");
    let design = Design::from_json(raw).unwrap();
    let blade = resolve(&design).unwrap();
    let polars = PolarSet::builtin();

    for station in &blade.stations {
        let table = polars
            .resolve_for_station(&station.airfoil)
            .expect("station polar resolves");
        assert_eq!(table.name(), "NACA4412");
        let eval = table.eval(6.0, 80_000.0).unwrap();
        assert!(eval.cl > 0.9 && eval.cl < 1.2);
        assert!(eval.cd > 0.01 && eval.cd < 0.03);
    }

    // Arbitrary NACA 4-digit fallback synthesis (e.g. NACA 3414)
    let custom = PolarTable::from_naca4_params(0.03, 0.4, 0.14, 12.0).unwrap();
    assert_eq!(custom.name(), "NACA3414");
    let eval0 = custom.eval(0.0, 100_000.0).unwrap();
    let eval45 = custom.eval(45.0, 100_000.0).unwrap();
    assert!(eval0.cl > 0.1);
    assert!(eval45.cl > 0.5 && eval45.cd > 0.4);
}

#[test]
fn rejects_malformed_polar_specs_and_non_finite_queries_without_panicking() {
    let empty = PolarTable::from_spec(PolarTableSpec {
        name: "bad".into(),
        aspect_ratio: 10.0,
        sweeps: vec![],
    });
    assert!(matches!(empty, Err(AeroError::EmptyPolarTable { .. })));

    let unsorted = PolarTable::from_spec(PolarTableSpec {
        name: "unsorted".into(),
        aspect_ratio: 10.0,
        sweeps: vec![PolarSweepSpec {
            reynolds: 50_000.0,
            points: vec![
                PolarPoint {
                    alpha_deg: 5.0,
                    cl: 0.5,
                    cd: 0.02,
                },
                PolarPoint {
                    alpha_deg: -5.0,
                    cl: -0.5,
                    cd: 0.02,
                },
            ],
        }],
    });
    assert!(matches!(unsorted, Err(AeroError::UnsortedAlphaGrid { .. })));

    let set = PolarSet::builtin();
    let table = set.get("SG6043").unwrap();
    assert!(matches!(
        table.eval(f64::NAN, 100_000.0),
        Err(AeroError::NonFiniteInput { .. })
    ));
    assert!(matches!(
        table.eval(5.0, -1000.0),
        Err(AeroError::NonFiniteInput { .. })
    ));
}

proptest! {
    #[test]
    fn prop_viterna_polar_evaluation_is_finite_positive_drag_and_periodic_across_all_angles(
        alpha_deg in -720.0f64..720.0,
        reynolds in 5_000.0f64..500_000.0,
        airfoil_idx in 0usize..BUILTIN_POLAR_NAMES.len(),
    ) {
        let set = PolarSet::builtin();
        let name = BUILTIN_POLAR_NAMES[airfoil_idx];
        let table = set.get(name).unwrap();

        let eval = table.eval(alpha_deg, reynolds).unwrap();
        let wrapped = wrap_alpha_deg(alpha_deg);
        prop_assert!((eval.alpha_deg - wrapped).abs() < 1e-12);
        prop_assert!(eval.cl.is_finite() && eval.cl.abs() <= 2.5);
        prop_assert!(eval.cd.is_finite() && eval.cd > 0.0 && eval.cd <= table.sweeps()[0].cd_max() + 1e-6);

        // 360-degree periodicity
        let shifted = table.eval(alpha_deg + 360.0, reynolds).unwrap();
        prop_assert!((eval.cl - shifted.cl).abs() < 1e-9);
        prop_assert!((eval.cd - shifted.cd).abs() < 1e-9);
    }
}
