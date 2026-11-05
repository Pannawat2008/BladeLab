//! Property tests for the 4-digit NACA sampler.
//!
//! These cover the T-003 acceptance criteria: sampled contours never overlap
//! (no coincident points, upper surface strictly above lower surface) and the
//! trailing edge keeps a measurable finite thickness.

use blade_geom::{
    cosine_spacing, schmitz_chord_mm, schmitz_distribution, schmitz_inflow_angle_deg,
    schmitz_twist_deg, GeomError, Naca4, SchmitzParams,
};
use blade_model::Rotor;
use proptest::prelude::*;

fn naca_case() -> impl Strategy<Value = (f64, f64, f64, f64, usize)> {
    (
        0.0_f64..=0.09,  // max camber ratio
        0.05_f64..0.95,  // camber position
        0.02_f64..0.35,  // thickness ratio
        20.0_f64..500.0, // chord in mm
        4_usize..120,    // samples per surface
    )
}

proptest! {
    #[test]
    fn contour_stays_finite_and_in_bounds((m, p, t, chord, n) in naca_case()) {
        let profile = Naca4::new(m, p, t).expect("generated parameters are valid");
        let airfoil = profile.surface(chord, n).expect("surface must build");

        prop_assert_eq!(airfoil.points().len(), 2 * n - 1);
        for point in airfoil.points() {
            prop_assert!(point.x.is_finite() && point.y.is_finite());
            prop_assert!(point.x >= -1e-12 && point.x <= chord + 1e-12);
            prop_assert!(point.y.abs() <= 0.5 * chord);
        }
        // The contour is anchored at the leading and trailing edge.
        prop_assert!(airfoil.upper_trailing_edge().x >= chord - 1e-9);
        prop_assert!(airfoil.lower_trailing_edge().x >= chord - 1e-9);
    }

    #[test]
    fn surfaces_never_overlap((m, p, t, chord, n) in naca_case()) {
        let profile = Naca4::new(m, p, t).expect("generated parameters are valid");
        let airfoil = profile.surface(chord, n).expect("surface must build");
        let points = airfoil.points();

        // Upper and lower surfaces share chordwise stations; the upper one is
        // strictly above for every interior station.
        for station in 1..n - 1 {
            let upper = points[n - 1 - station];
            let lower = points[n + station - 1];
            prop_assert!((upper.x - lower.x).abs() < 1e-9);
            prop_assert!(upper.y > lower.y, "overlap at station {}", station);
        }

        // No two contour points are coincident.
        for (i, a) in points.iter().enumerate() {
            for (j, b) in points.iter().enumerate().skip(i + 1) {
                prop_assert!(a.distance_to(b) > 0.0, "points {} and {} coincide", i, j);
            }
        }
        prop_assert!(airfoil.minimum_point_distance_mm() > 0.0);
    }

    #[test]
    fn trailing_edge_thickness_is_finite_and_checked((m, p, t, chord, n) in naca_case()) {
        let profile = Naca4::new(m, p, t).expect("generated parameters are valid");
        let airfoil = profile.surface(chord, n).expect("surface must build");

        let measured = airfoil.trailing_edge_thickness_mm();
        let expected = 0.021 * t * chord;
        prop_assert!(measured.is_finite());
        prop_assert!((measured - expected).abs() <= 1e-9 * chord.max(1.0));
        prop_assert!(measured > 0.0);

        // A threshold just below the measured value passes, one just above fails.
        prop_assert!(profile.check_trailing_edge(chord, measured * 0.999).is_ok());
        let rejected = matches!(
            profile.check_trailing_edge(chord, measured * 1.001),
            Err(GeomError::TrailingEdgeTooThin { .. })
        );
        prop_assert!(rejected);
    }

    #[test]
    fn cosine_spacing_is_strictly_increasing(n in 2_usize..300) {
        let stations = cosine_spacing(n).expect("n >= 2");
        prop_assert_eq!(stations.len(), n);
        prop_assert_eq!(stations[0], 0.0);
        prop_assert_eq!(stations[n - 1], 1.0);
        for pair in stations.windows(2) {
            prop_assert!(pair[1] > pair[0]);
        }
    }

    #[test]
    fn schmitz_inflow_and_twist_decrease_monotonically_along_span(
        radius_mm in 100.0_f64..2000.0,
        hub_ratio in 0.05_f64..0.4,
        blade_count in 1_u32..=12,
        design_tsr in 1.0_f64..12.0,
        design_cl in 0.2_f64..2.5,
        design_alpha_deg in -10.0_f64..20.0,
        station_count in 3_u32..40,
    ) {
        let rotor = Rotor {
            radius_mm,
            hub_radius_mm: radius_mm * hub_ratio,
            blade_count,
            design_tsr,
            wind_speed_mps: 8.0,
            pitch_axis_ratio: 0.25,
            station_count,
        };
        let params = SchmitzParams::new(design_cl, design_alpha_deg).expect("valid params");
        let stations = schmitz_distribution(&rotor, &params).expect("distribution builds");

        prop_assert_eq!(stations.len(), station_count as usize);
        for station in &stations {
            prop_assert!(station.chord_mm.is_finite() && station.chord_mm > 0.0);
            prop_assert!(station.inflow_angle_deg.is_finite());
            prop_assert!(station.inflow_angle_deg > 0.0 && station.inflow_angle_deg < 60.0);
            prop_assert!(station.twist_deg.is_finite());
            prop_assert!((station.twist_deg - (station.inflow_angle_deg - design_alpha_deg)).abs() < 1e-12);
        }

        for pair in stations.windows(2) {
            prop_assert!(pair[1].span_ratio > pair[0].span_ratio);
            prop_assert!(pair[1].inflow_angle_deg < pair[0].inflow_angle_deg);
            prop_assert!(pair[1].twist_deg < pair[0].twist_deg);
            // Beyond the Schmitz maximum (tan(θ) = (1/3)·sin(6θ), λ_r* ≈ 0.7577),
            // chord strictly tapers toward the tip.
            if pair[0].local_tsr >= 0.76 {
                prop_assert!(pair[1].chord_mm < pair[0].chord_mm);
            }
        }
    }

    #[test]
    fn schmitz_chord_scales_with_radius_blades_and_cl(
        radius_mm in 100.0_f64..1500.0,
        design_tsr in 1.5_f64..10.0,
        design_cl in 0.3_f64..2.0,
        span_ratio in 0.05_f64..=1.0,
    ) {
        let c_base = schmitz_chord_mm(radius_mm, 3, design_tsr, design_cl, span_ratio).expect("valid");
        let c_double_r = schmitz_chord_mm(2.0 * radius_mm, 3, design_tsr, design_cl, span_ratio).expect("valid");
        let c_six_blades = schmitz_chord_mm(radius_mm, 6, design_tsr, design_cl, span_ratio).expect("valid");
        let c_double_cl = schmitz_chord_mm(radius_mm, 3, design_tsr, 2.0 * design_cl, span_ratio).expect("valid");

        prop_assert!((c_double_r - 2.0 * c_base).abs() <= 1e-9 * c_base.max(1.0));
        prop_assert!((c_six_blades - 0.5 * c_base).abs() <= 1e-9 * c_base.max(1.0));
        prop_assert!((c_double_cl - 0.5 * c_base).abs() <= 1e-9 * c_base.max(1.0));

        let phi = schmitz_inflow_angle_deg(design_tsr, span_ratio).expect("valid");
        let twist = schmitz_twist_deg(design_tsr, 5.5, span_ratio).expect("valid");
        prop_assert!((twist - (phi - 5.5)).abs() < 1e-12);
    }
}
