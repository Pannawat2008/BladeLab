//! Property tests for the 4-digit NACA sampler.
//!
//! These cover the T-003 acceptance criteria: sampled contours never overlap
//! (no coincident points, upper surface strictly above lower surface) and the
//! trailing edge keeps a measurable finite thickness.

use blade_geom::{cosine_spacing, GeomError, Naca4};
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
}
