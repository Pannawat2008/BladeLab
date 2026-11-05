//! End-to-end geometry test: design JSON → resolved blade → sections → loft.

use blade_geom::{
    build_sections, loft, schmitz_distribution, SchmitzParams, PASS_THROUGH_TOLERANCE_MM,
};
use blade_model::{resolve, Design};

const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");
const SCHMITZ_FIXTURE: &str = include_str!("../../../fixtures/naca4412-schmitz.json");

#[test]
fn fixture_design_lofts_through_every_section() {
    let design = Design::from_json(FIXTURE).expect("fixture parses");
    let blade = resolve(&design).expect("fixture resolves");
    let sections = build_sections(&blade).expect("sections build");

    assert_eq!(sections.len(), blade.stations.len());

    let surface = loft(&sections).expect("sections loft");
    assert_eq!(surface.section_count(), sections.len());
    assert_eq!(surface.point_count(), sections[0].points().len());
    assert!((surface.span_start_mm() - blade.stations[0].span_mm).abs() < 1e-9);
    assert!(
        (surface.span_end_mm() - blade.stations[blade.stations.len() - 1].span_mm).abs() < 1e-9
    );

    // T-004 acceptance: the surface passes through every section.
    for (index, section) in sections.iter().enumerate() {
        let evaluated = surface.section_at(index).expect("valid section index");
        assert_eq!(evaluated.len(), section.points().len());
        for (got, expected) in evaluated.iter().zip(section.points()) {
            let deviation = got.distance_to(expected);
            assert!(
                deviation <= PASS_THROUGH_TOLERANCE_MM,
                "section {index} deviates by {deviation} mm"
            );
        }
    }

    // Sections progress monotonically along the span, root (60 mm) to tip (600 mm).
    for pair in sections.windows(2) {
        assert!(pair[1].span_mm() > pair[0].span_mm());
    }
    assert!((sections[0].span_mm() - 60.0).abs() < 1e-9);
    assert!((sections[sections.len() - 1].span_mm() - 600.0).abs() < 1e-9);
}

#[test]
fn lofted_sections_follow_the_twist_distribution() {
    let design = Design::from_json(FIXTURE).expect("fixture parses");
    let blade = resolve(&design).expect("fixture resolves");
    let sections = build_sections(&blade).expect("sections build");
    let surface = loft(&sections).expect("sections loft");

    // The leading edge is the middle contour point. After the pitch-axis
    // rotation it sits at `(p·(1−cos θ), −p·sin θ)` with `p` the pitch axis.
    let leading_edge_index = sections[0].points().len() / 2;
    let root_le = surface
        .point_at_span_mm(60.0, leading_edge_index)
        .expect("root span");
    let tip_le = surface
        .point_at_span_mm(600.0, leading_edge_index)
        .expect("tip span");

    // Root: chord 70 mm, twist 20° → pivot 17.5 mm.
    let root_pivot = 0.25 * 70.0;
    let root_twist = 20.0_f64.to_radians();
    assert!((root_le.x - root_pivot * (1.0 - root_twist.cos())).abs() < 1e-6);
    assert!((root_le.y + root_pivot * root_twist.sin()).abs() < 1e-6);

    // Tip: layer-3 chord override 32 mm, twist override 2° → pivot 8 mm.
    let tip_pivot = 0.25 * 32.0;
    let tip_twist = 2.0_f64.to_radians();
    assert!((tip_le.x - tip_pivot * (1.0 - tip_twist.cos())).abs() < 1e-6);
    assert!((tip_le.y + tip_pivot * tip_twist.sin()).abs() < 1e-6);
}

#[test]
fn schmitz_fixture_resolves_matches_formula_and_lofts() {
    let design = Design::from_json(SCHMITZ_FIXTURE).expect("schmitz fixture parses");
    let blade = resolve(&design).expect("schmitz fixture resolves");
    let params = SchmitzParams::new(1.0, 6.0).expect("valid schmitz params");
    let expected = schmitz_distribution(&design.rotor, &params).expect("schmitz table");

    assert_eq!(blade.stations.len(), expected.len());
    for (resolved, reference) in blade.stations.iter().zip(&expected) {
        assert!((resolved.span_ratio - reference.span_ratio).abs() < 1e-12);
        assert!((resolved.span_mm - reference.span_mm).abs() < 1e-9);
        assert!((resolved.chord_mm - reference.chord_mm).abs() < 1e-12);
        assert!((resolved.twist_deg - reference.twist_deg).abs() < 1e-12);
    }

    let sections = build_sections(&blade).expect("schmitz sections build");
    let surface = loft(&sections).expect("schmitz sections loft");
    for (index, section) in sections.iter().enumerate() {
        let evaluated = surface.section_at(index).expect("valid section index");
        for (got, target) in evaluated.iter().zip(section.points()) {
            assert!(got.distance_to(target) <= PASS_THROUGH_TOLERANCE_MM);
        }
    }
}
