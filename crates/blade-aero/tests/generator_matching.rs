use blade_aero::{
    eval_generator_at_rpm, match_generator, sweep_generator_load, AeroError, GeneratorSpec,
    PolarSet,
};
use blade_model::{resolve, Design};
use proptest::prelude::*;

#[test]
fn eval_generator_at_rpm_matches_exact_electromechanical_identities() {
    // 50 RPM/V generator, R_int = 1.5 ohm, I_0 = 0.15 A, direct drive (G = 1.0)
    let spec = GeneratorSpec::new(50.0, 1.5, 0.15);
    // At 600 RPM -> V_emf = 600 / 50 = 12.0 V
    // With R_load = 4.5 ohm -> R_total = 6.0 ohm -> I = 2.0 A -> V_load = 9.0 V
    // P_elec = 9.0 * 2.0 = 18.0 W, P_copper = 4.0 * 1.5 = 6.0 W, P_core = 12.0 * 0.15 = 1.8 W
    // P_mech = 18.0 + 6.0 + 1.8 = 25.8 W
    let state = eval_generator_at_rpm(&spec, 600.0, 4.5).unwrap();

    assert!((state.back_emf_v - 12.0).abs() < 1e-12);
    assert!((state.current_a - 2.0).abs() < 1e-12);
    assert!((state.terminal_voltage_v - 9.0).abs() < 1e-12);
    assert!((state.electrical_power_w - 18.0).abs() < 1e-12);
    assert!((state.copper_loss_w - 6.0).abs() < 1e-12);
    assert!((state.mechanical_power_w - 25.8).abs() < 1e-11);
    assert!((state.efficiency - (18.0 / 25.8)).abs() < 1e-12);
}

#[test]
fn match_generator_and_load_curve_accurately_predict_equilibrium_voltage_and_power() {
    let raw = include_str!("../../../fixtures/naca4412-schmitz.json");
    let blade = resolve(&Design::from_json(raw).unwrap()).unwrap();
    let polars = PolarSet::builtin();

    // Small wind turbine PMA: Kv = 35 RPM/V, R_int = 0.8 ohm, I_0 = 0.1 A
    let spec = GeneratorSpec::new(35.0, 0.8, 0.1);
    let loads = [1.5, 3.0, 5.0, 8.0, 15.0, 40.0];
    let curve = sweep_generator_load(&blade, &polars, 8.0, 0.0, &spec, &loads).unwrap();
    assert_eq!(curve.len(), loads.len());

    // Across the load curve:
    // 1. At every equilibrium point, rotor aerodynamic torque equals generator counter-torque
    // 2. Increasing R_load unloads the rotor, so equilibrium RPM and terminal voltage increase monotonically
    for (i, pt) in curve.iter().enumerate() {
        assert!(
            (pt.aero.torque_nm - pt.generator.torque_nm).abs() < 1e-4,
            "torque mismatch at R_load={}: aero={}, gen={}",
            loads[i],
            pt.aero.torque_nm,
            pt.generator.torque_nm
        );
        assert!(
            (pt.aero.power_w - pt.generator.mechanical_power_w).abs() < 1e-2,
            "shaft power mismatch at R_load={}: aero={}, gen={}",
            loads[i],
            pt.aero.power_w,
            pt.generator.mechanical_power_w
        );
        assert!(pt.generator.terminal_voltage_v > 0.0);
        assert!(pt.generator.electrical_power_w > 0.0);
        if i > 0 {
            assert!(
                pt.generator.rotor_rpm > curve[i - 1].generator.rotor_rpm,
                "RPM should increase with higher load resistance"
            );
            assert!(
                pt.generator.terminal_voltage_v > curve[i - 1].generator.terminal_voltage_v,
                "terminal voltage should increase with higher load resistance"
            );
        }
    }

    // Intermediate matched load (e.g. 5 ohm) delivers more electrical power than near-open-circuit (40 ohm)
    let p_mid = curve[2].generator.electrical_power_w;
    let p_open = curve[5].generator.electrical_power_w;
    assert!(p_mid > p_open && p_mid > 50.0);
}

#[test]
fn rejects_invalid_generator_specs_without_panicking() {
    let bad_kv = GeneratorSpec::new(0.0, 1.0, 0.1);
    assert!(matches!(
        eval_generator_at_rpm(&bad_kv, 500.0, 10.0),
        Err(AeroError::InvalidGeneratorSpec(_))
    ));

    let bad_r = GeneratorSpec::new(50.0, -0.5, 0.1);
    assert!(matches!(
        eval_generator_at_rpm(&bad_r, 500.0, 10.0),
        Err(AeroError::InvalidGeneratorSpec(_))
    ));

    let valid = GeneratorSpec::new(50.0, 1.0, 0.1);
    assert!(matches!(
        eval_generator_at_rpm(&valid, 500.0, 0.0),
        Err(AeroError::NonFiniteInput { .. })
    ));
}

proptest! {
    #[test]
    fn prop_generator_state_conserves_energy_and_voltage_divider_laws(
        kv in 10.0f64..200.0,
        r_int in 0.1f64..5.0,
        i0 in 0.0f64..0.5,
        gear_ratio in 1.0f64..5.0,
        rpm in 10.0f64..3000.0,
        r_load in 0.2f64..100.0,
    ) {
        let mut spec = GeneratorSpec::new(kv, r_int, i0);
        spec.gear_ratio = gear_ratio;

        let st = eval_generator_at_rpm(&spec, rpm, r_load).unwrap();
        let v_drop = st.terminal_voltage_v + st.current_a * r_int;
        prop_assert!((st.back_emf_v - v_drop).abs() < 1e-9);

        let p_core = st.back_emf_v * i0;
        let p_sum = st.electrical_power_w + st.copper_loss_w + p_core;
        prop_assert!((st.mechanical_power_w - p_sum).abs() < 1e-8);
        prop_assert!(st.efficiency >= 0.0 && st.efficiency <= 1.0);
    }

    #[test]
    fn prop_coupled_rotor_generator_match_is_finite_and_bounded(
        kv in 20.0f64..100.0,
        r_int in 0.2f64..2.5,
        r_load in 1.0f64..30.0,
    ) {
        let blade = resolve(
            &Design::from_json(include_str!("../../../fixtures/naca4412-linear.json")).unwrap(),
        )
        .unwrap();
        let polars = PolarSet::builtin();
        let spec = GeneratorSpec::new(kv, r_int, 0.05);

        let matched = match_generator(&blade, &polars, 8.0, 0.0, &spec, r_load).unwrap();
        prop_assert!(matched.tip_speed_ratio.is_finite() && matched.tip_speed_ratio > 0.0);
        prop_assert!(matched.generator.terminal_voltage_v.is_finite() && matched.generator.terminal_voltage_v >= 0.0);
        prop_assert!(matched.generator.electrical_power_w.is_finite() && matched.generator.electrical_power_w >= 0.0);
        prop_assert!(matched.net_cp_electrical < 16.0 / 27.0);
    }
}
