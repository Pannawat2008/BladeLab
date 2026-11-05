//! STEP export tests: closed topology, millimetre units and reader round-trip.

use blade_cad::{CadError, CadKernel, TruckKernel};
use blade_geom::{build_sections, loft, BladeSurface};
use blade_model::{resolve, Design, Hub};
use truck_stepio::r#in::Table;

const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

fn fixture_surface() -> BladeSurface {
    let design = Design::from_json(FIXTURE).expect("fixture parses");
    let blade = resolve(&design).expect("fixture resolves");
    let sections = build_sections(&blade).expect("sections build");
    loft(&sections).expect("sections loft")
}

#[test]
fn blade_solid_is_a_closed_shell_of_four_faces() {
    let kernel = TruckKernel::new();
    let solid = kernel.blade_solid(&fixture_surface()).expect("blade solid");

    assert_eq!(solid.boundaries().len(), 1, "one shell");
    let shell = &solid.boundaries()[0];
    assert_eq!(shell.len(), 4, "side, trailing edge, root cap, tip cap");
}

#[test]
fn blade_step_parses_as_a_solid_in_millimetres() {
    let kernel = TruckKernel::new();
    let solid = kernel.blade_solid(&fixture_surface()).expect("blade solid");
    let step = kernel.write_step(&[solid]).expect("STEP export");

    assert!(step.starts_with("ISO-10303-21;"));
    assert!(step.contains("MANIFOLD_SOLID_BREP"));
    assert!(step.contains("SI_UNIT(.MILLI.,.METRE.)"));
    assert!(step.contains("B_SPLINE_SURFACE"));
    assert!(step.trim_end().ends_with("END-ISO-10303-21;"));

    let table = Table::from_step(&step).expect("truck reader accepts the file");
    let holder = table.shell.values().next().expect("one closed shell");
    let shell = table
        .to_compressed_shell(holder)
        .expect("shell converts back to truck topology");
    assert_eq!(shell.faces.len(), 4);

    // Units check: the exported geometry spans exactly the fixture blade.
    let min_z = shell
        .vertices
        .iter()
        .map(|point| point.z)
        .fold(f64::INFINITY, f64::min);
    let max_z = shell
        .vertices
        .iter()
        .map(|point| point.z)
        .fold(f64::NEG_INFINITY, f64::max);
    assert!((min_z - 60.0).abs() < 1e-6, "root z = {min_z}");
    assert!((max_z - 600.0).abs() < 1e-6, "tip z = {max_z}");
}

#[test]
fn hub_step_parses_as_a_hollow_cylinder() {
    let hub = Hub {
        diameter_mm: 120.0,
        bore_diameter_mm: 12.0,
        length_mm: 50.0,
    };
    let kernel = TruckKernel::new();
    let solid = kernel.hub_solid(&hub).expect("hub solid");
    assert_eq!(solid.boundaries().len(), 1);
    // `whole_rsweep` revolves in three 120° spans (`DIVISION = 3` in truck),
    // so each of the four annular faces appears three times in the closed shell.
    let face_count = solid.boundaries()[0].len();
    assert_eq!(face_count, 12, "outer, bore, top, bottom x 3 spans");

    let step = kernel.write_step(&[solid]).expect("STEP export");
    let table = Table::from_step(&step).expect("truck reader accepts the file");
    let holder = table.shell.values().next().expect("one closed shell");
    let shell = table.to_compressed_shell(holder).expect("shell converts");
    assert_eq!(shell.faces.len(), face_count);

    let max_radius = shell
        .vertices
        .iter()
        .map(|point| (point.x * point.x + point.y * point.y).sqrt())
        .fold(0.0_f64, f64::max);
    assert!((max_radius - 60.0).abs() < 1e-6);
}

#[test]
fn multiple_bodies_share_one_step_document() {
    let kernel = TruckKernel::new();
    let blade = kernel.blade_solid(&fixture_surface()).expect("blade");
    let hub = kernel
        .hub_solid(&Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 12.0,
            length_mm: 50.0,
        })
        .expect("hub");

    let step = kernel.write_step(&[blade, hub]).expect("two bodies");
    assert_eq!(step.matches("MANIFOLD_SOLID_BREP").count(), 2);
}

#[test]
fn invalid_hubs_are_rejected_with_clear_errors() {
    let kernel = TruckKernel::new();
    for hub in [
        Hub {
            diameter_mm: 0.0,
            bore_diameter_mm: 12.0,
            length_mm: 50.0,
        },
        Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 0.0,
            length_mm: 50.0,
        },
        Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 120.0,
            length_mm: 50.0,
        },
        Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 12.0,
            length_mm: f64::NAN,
        },
    ] {
        assert!(matches!(
            kernel.hub_solid(&hub),
            Err(CadError::InvalidHub(_))
        ));
    }
}

#[test]
fn exporting_no_bodies_is_an_error() {
    let kernel = TruckKernel::new();
    assert!(matches!(kernel.write_step(&[]), Err(CadError::Step(_))));
}
