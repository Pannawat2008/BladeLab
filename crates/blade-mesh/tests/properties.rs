//! Property tests: any reasonable two-section blade tessellates into a closed,
//! positively oriented solid.

use blade_geom::{loft, Naca4, Section3D};
use blade_mesh::{check_mesh, tessellate, MeshOptions};
use proptest::prelude::*;

fn section(chord_mm: f64, twist_deg: f64, span_mm: f64) -> Section3D {
    let airfoil = Naca4::new(0.04, 0.4, 0.12)
        .expect("valid NACA 4412")
        .surface(chord_mm, 21)
        .expect("airfoil surface");
    Section3D::from_airfoil(&airfoil, chord_mm, twist_deg, 0.25, span_mm).expect("section")
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(48))]

    #[test]
    fn tessellated_blades_are_watertight_solids(
        root_chord in 20.0_f64..150.0,
        tip_chord in 10.0_f64..150.0,
        root_twist in -20.0_f64..20.0,
        tip_twist in -20.0_f64..20.0,
        span_gap in 2.0_f64..400.0,
    ) {
        let root = section(root_chord, root_twist, 0.0);
        let tip = section(tip_chord, tip_twist, span_gap);
        let surface = match loft(&[root, tip]) {
            Ok(surface) => surface,
            Err(error) => return Err(TestCaseError::fail(format!("loft failed: {error}"))),
        };

        let mesh = match tessellate(&surface, &MeshOptions::default()) {
            Ok(mesh) => mesh,
            Err(error) => return Err(TestCaseError::fail(format!("tessellate failed: {error}"))),
        };
        let report = check_mesh(&mesh);

        prop_assert!(report.watertight, "issues: {:?}", report.issues());
        prop_assert!(report.is_valid_solid(), "issues: {:?}", report.issues());
        prop_assert!(report.volume_mm3 > 0.0, "volume {}", report.volume_mm3);
        prop_assert!(report.min_triangle_altitude_mm > 0.0);
        prop_assert_eq!(report.inconsistent_edges, 0);
        prop_assert_eq!(report.degenerate_triangles, 0);
    }
}
