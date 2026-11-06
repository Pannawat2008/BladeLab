use blade_aero::{
    brent_root, glauert_buhl_axial_induction, prandtl_loss_factor, simulate, simulate_tsr_sweep,
    AeroError, OperatingPoint, PolarSet, GLAUERT_CRITICAL_A,
};
use blade_model::{resolve, Design};
use proptest::prelude::*;

const BETZ_LIMIT: f64 = 16.0 / 27.0; // 0.59259259...

#[test]
fn brent_root_converges_to_machine_precision_on_nonlinear_functions() {
    let root = brent_root(0.1, 1.5, 1e-12, 100, |x| x.cos() - x);
    assert!((root - 0.739_085_133_215_160_7).abs() < 1e-11);
}

#[test]
fn glauert_buhl_correction_is_continuous_at_critical_induction_and_bounded() {
    let kappa_c = GLAUERT_CRITICAL_A / (1.0 - GLAUERT_CRITICAL_A); // 2/3
    for &f_loss in &[0.2_f64, 0.5, 0.8, 1.0] {
        let a_below = glauert_buhl_axial_induction(kappa_c - 1e-7, f_loss);
        let a_at = glauert_buhl_axial_induction(kappa_c, f_loss);
        let a_above = glauert_buhl_axial_induction(kappa_c + 1e-7, f_loss);

        assert!((a_at - GLAUERT_CRITICAL_A).abs() < 1e-12);
        assert!((a_below - a_at).abs() < 1e-5);
        assert!((a_above - a_at).abs() < 1e-5);

        // Monotonically increasing in high-induction regime and bounded <= 0.95
        let a_high = glauert_buhl_axial_induction(2.5, f_loss);
        assert!(a_high > GLAUERT_CRITICAL_A && a_high <= 0.95);
    }
}

#[test]
fn prandtl_loss_factor_peaks_midspan_and_tapers_toward_hub_and_tip() {
    let r_hub = 0.06;
    let r_tip = 0.60;
    let phi = 12.0_f64.to_radians();

    let f_mid = prandtl_loss_factor(3, 0.33, r_hub, r_tip, phi);
    let f_near_tip = prandtl_loss_factor(3, 0.58, r_hub, r_tip, phi);
    let f_near_hub = prandtl_loss_factor(3, 0.07, r_hub, r_tip, phi);

    assert!(f_mid > 0.90);
    assert!(f_near_tip < f_mid);
    assert!(f_near_hub < f_mid);
}

#[test]
fn schmitz_rotor_bem_matches_qblade_reference_case_and_respects_betz_limit() {
    let raw = include_str!("../../../fixtures/naca4412-schmitz.json");
    let design = Design::from_json(raw).unwrap();
    let blade = resolve(&design).unwrap();
    let polars = PolarSet::builtin();
    let op = OperatingPoint::from_blade(&blade); // V = 8 m/s, TSR = 4.5

    let res = simulate(&blade, &polars, &op).expect("BEM simulation succeeds");

    // Verify rotational kinematics: Omega = 4.5 * 8.0 / 0.6 = 60 rad/s (572.9578 RPM)
    assert!((res.omega_rad_s - 60.0).abs() < 1e-9);
    assert!((res.rpm - 572.957_795_130_823_2).abs() < 1e-6);

    // Exact dimensional consistency: Cp == Cq * TSR
    assert!((res.cp - res.cq * op.tip_speed_ratio).abs() < 1e-12);
    assert!(res.cp > 0.40 && res.cp < BETZ_LIMIT);
    assert!(res.ct > 0.65 && res.ct < 1.0);

    // QBlade / Ning (2014) reference values for 3-blade R=0.6m NACA 4412 Schmitz rotor
    // at V=8 m/s, TSR=4.5 (with Prandtl tip/hub loss + Viterna Re-interpolated polars):
    let qblade_cp_ref = 0.448;
    let qblade_ct_ref = 0.785;
    assert!(
        (res.cp - qblade_cp_ref).abs() < 0.025,
        "Cp={} outside QBlade reference tolerance around {}",
        res.cp,
        qblade_cp_ref
    );
    assert!(
        (res.ct - qblade_ct_ref).abs() < 0.04,
        "Ct={} outside QBlade reference tolerance around {}",
        res.ct,
        qblade_ct_ref
    );

    // Mid-span stations (indices 2..8, r/R = 0.28..0.82) operate near the
    // Schmitz optimal axial induction (a ~ 0.30..0.42, elevated slightly toward
    // the outer span by Re-dependent Cl = 1.13 > design_cl = 1.0 and F < 1.0)
    // and design alpha (~ 4.5..6.5 deg)
    for st in &res.stations[2..9] {
        assert!(
            st.axial_induction > 0.27 && st.axial_induction < 0.43,
            "station r/R={:.2} axial induction a={:.4} out of optimal range",
            st.span_ratio,
            st.axial_induction
        );
        assert!(
            st.alpha_deg > 4.0 && st.alpha_deg < 7.0,
            "station r/R={:.2} alpha={:.2} deg out of Schmitz design range",
            st.span_ratio,
            st.alpha_deg
        );
    }
}

#[test]
fn tsr_sweep_compares_linear_and_schmitz_fixtures_cleanly() {
    let linear_blade = resolve(
        &Design::from_json(include_str!("../../../fixtures/naca4412-linear.json")).unwrap(),
    )
    .unwrap();
    let schmitz_blade = resolve(
        &Design::from_json(include_str!("../../../fixtures/naca4412-schmitz.json")).unwrap(),
    )
    .unwrap();
    let polars = PolarSet::builtin();

    let tsrs = [2.0, 3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0];
    let linear_curve = simulate_tsr_sweep(&linear_blade, &polars, 8.0, 0.0, &tsrs).unwrap();
    let schmitz_curve = simulate_tsr_sweep(&schmitz_blade, &polars, 8.0, 0.0, &tsrs).unwrap();

    assert_eq!(linear_curve.len(), tsrs.len());
    assert_eq!(schmitz_curve.len(), tsrs.len());

    // At the design TSR = 4.5 (index 3), Schmitz optimum rotor achieves higher Cp
    // than the untuned linear-taper rotor
    let cp_lin_45 = linear_curve[3].cp;
    let cp_sch_45 = schmitz_curve[3].cp;
    assert!(cp_lin_45 > 0.25 && cp_lin_45 < BETZ_LIMIT);
    assert!(cp_sch_45 > cp_lin_45);
}

#[test]
fn rejects_invalid_operating_points_without_panicking() {
    let blade = resolve(
        &Design::from_json(include_str!("../../../fixtures/naca4412-linear.json")).unwrap(),
    )
    .unwrap();
    let polars = PolarSet::builtin();

    assert!(matches!(
        simulate(&blade, &polars, &OperatingPoint::new(0.0, 4.5)),
        Err(AeroError::InvalidOperatingPoint(_))
    ));
    assert!(matches!(
        simulate(&blade, &polars, &OperatingPoint::new(8.0, -1.0)),
        Err(AeroError::InvalidOperatingPoint(_))
    ));
    assert!(matches!(
        simulate(&blade, &polars, &OperatingPoint::new(f64::NAN, 4.5)),
        Err(AeroError::InvalidOperatingPoint(_))
    ));
}

proptest! {
    #[test]
    fn prop_bem_solver_converges_and_respects_betz_limit_across_operating_envelope(
        wind_speed_mps in 2.0f64..25.0,
        tsr in 1.0f64..11.0,
        pitch_deg in -12.0f64..20.0,
    ) {
        let blade = resolve(
            &Design::from_json(include_str!("../../../fixtures/naca4412-linear.json")).unwrap(),
        )
        .unwrap();
        let polars = PolarSet::builtin();
        let mut op = OperatingPoint::new(wind_speed_mps, tsr);
        op.pitch_deg = pitch_deg;

        let res = simulate(&blade, &polars, &op).unwrap();
        prop_assert!(res.cp.is_finite() && res.cp < BETZ_LIMIT);
        prop_assert!(res.ct.is_finite());
        prop_assert!(res.cq.is_finite());
        prop_assert!((res.cp - res.cq * tsr).abs() < 1e-11);
        for st in &res.stations {
            prop_assert!(st.inflow_angle_deg.is_finite());
            prop_assert!(st.axial_induction.is_finite() && st.axial_induction <= 0.95);
            prop_assert!(st.tangential_induction.is_finite());
        }
    }
}
