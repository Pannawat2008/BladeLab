//! Property tests for the spanwise loft (T-004 acceptance criterion:
//! the surface passes through every input section, tolerance < 1e-6 mm).

use blade_geom::{loft, Point3, Section3D, PASS_THROUGH_TOLERANCE_MM};
use proptest::prelude::*;

proptest! {
    #[test]
    fn loft_passes_through_random_sections(
        section_count in 2_usize..=10,
        point_count in 3_usize..=16,
        gaps in prop::collection::vec(5.0_f64..40.0, 10),
        coordinates in prop::collection::vec(
            (-150.0_f64..150.0, -150.0_f64..150.0),
            16,
        ),
    ) {
        let gaps = &gaps[..section_count - 1];
        let coordinates = &coordinates[..point_count];

        let mut span_mm = 0.0;
        let mut sections = Vec::with_capacity(section_count);
        for index in 0..section_count {
            if index > 0 {
                span_mm += gaps[index - 1];
            }
            let points = coordinates
                .iter()
                .map(|&(x, y)| Point3::new(x, y, span_mm).unwrap())
                .collect::<Vec<_>>();
            sections.push(Section3D::new(span_mm, points).unwrap());
        }

        let surface = loft(&sections).expect("valid section stack must loft");
        prop_assert_eq!(surface.section_count(), section_count);
        prop_assert_eq!(surface.point_count(), point_count);

        for (index, section) in sections.iter().enumerate() {
            let evaluated = surface.section_at(index).unwrap();
            prop_assert_eq!(evaluated.len(), point_count);
            for (got, expected) in evaluated.iter().zip(section.points()) {
                let deviation = got.distance_to(expected);
                prop_assert!(
                    deviation <= PASS_THROUGH_TOLERANCE_MM,
                    "section {} deviates by {} mm",
                    index,
                    deviation
                );
            }
            // The span lookup must agree with the section parameterisation.
            for (point_index, expected) in section.points().iter().enumerate() {
                let got = surface
                    .point_at_span_mm(section.span_mm(), point_index)
                    .unwrap();
                prop_assert!(got.distance_to(expected) <= PASS_THROUGH_TOLERANCE_MM);
            }
        }
    }

    #[test]
    fn loft_stays_inside_the_control_hull(
        section_count in 2_usize..=8,
        point_count in 3_usize..=8,
        gaps in prop::collection::vec(5.0_f64..40.0, 8),
        coordinates in prop::collection::vec(
            (-100.0_f64..100.0, -100.0_f64..100.0),
            8,
        ),
    ) {
        let gaps = &gaps[..section_count - 1];
        let coordinates = &coordinates[..point_count];

        let mut span_mm = 0.0;
        let mut sections = Vec::with_capacity(section_count);
        for index in 0..section_count {
            if index > 0 {
                span_mm += gaps[index - 1];
            }
            let points = coordinates
                .iter()
                .map(|&(x, y)| Point3::new(x, y, span_mm).unwrap())
                .collect::<Vec<_>>();
            sections.push(Section3D::new(span_mm, points).unwrap());
        }

        let surface = loft(&sections).unwrap();
        let span_mid = (surface.span_start_mm() + surface.span_end_mm()) * 0.5;
        for point_index in 0..point_count {
            let point = surface.point_at_span_mm(span_mid, point_index).unwrap();
            prop_assert!(point.x.is_finite() && point.y.is_finite() && point.z.is_finite());
            prop_assert!((point.x.abs() <= 100.0) && (point.y.abs() <= 100.0));
        }
    }
}
