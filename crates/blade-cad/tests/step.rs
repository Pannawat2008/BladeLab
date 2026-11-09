//! STEP export tests: closed topology, millimetre units and reader round-trip.

use blade_cad::{CadError, CadKernel, TruckKernel};
use blade_geom::{build_sections, loft, BladeSurface};
use blade_model::{resolve, Design, Hub};
use truck_stepio::r#in::alias::Curve3D;
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
        shaft_flat_radial_mm: None,
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
fn d_flat_hub_is_extruded_and_round_trips() {
    let hub = Hub {
        diameter_mm: 120.0,
        bore_diameter_mm: 12.0,
        length_mm: 50.0,
        shaft_flat_radial_mm: Some(4.8),
    };
    let kernel = TruckKernel::new();
    let solid = kernel.hub_solid(&hub).expect("D-flat hub");
    assert_eq!(solid.boundaries().len(), 1);
    // 2D extrusion of the annular face: bottom/top caps + 3 outer + 3 inner.
    assert_eq!(
        solid.boundaries()[0].len(),
        8,
        "caps + outer (3) + inner D (3)"
    );

    let step = kernel.write_step(&[solid]).expect("STEP export");
    let table = Table::from_step(&step).expect("truck reader accepts the file");
    let holder = table.shell.values().next().expect("one closed shell");
    let shell = table.to_compressed_shell(holder).expect("shell converts");
    assert_eq!(shell.faces.len(), 8);

    // The bore keeps its circular arc for x < d and is closed by a straight
    // chord at x = d, so two line edges between (4.8, ±3.6) exist: one at
    // z = 0 and one at z = 50 ("2D extrusion", no booleans).
    let half = (6.0_f64 * 6.0 - 4.8 * 4.8).sqrt();
    let chord_count = shell
        .edges
        .iter()
        .filter(|edge| match &edge.curve {
            Curve3D::Line(_) => {
                let a = shell.vertices[edge.vertices.0];
                let b = shell.vertices[edge.vertices.1];
                (a.x - 4.8).abs() < 1e-6
                    && (b.x - 4.8).abs() < 1e-6
                    && (a.y.abs() - half).abs() < 1e-6
                    && (b.y.abs() - half).abs() < 1e-6
                    && (a.z - b.z).abs() < 1e-6
                    && (a.z == 0.0 || a.z == 50.0)
            }
            _ => false,
        })
        .count();
    assert_eq!(chord_count, 2, "one flat chord at z=0 and one at z=50");
}

#[test]
fn d_flat_with_invalid_distances_is_rejected() {
    let kernel = TruckKernel::new();
    for flat in [0.0, 6.0, -1.0, f64::NAN, 12.0] {
        let hub = Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 12.0,
            length_mm: 50.0,
            shaft_flat_radial_mm: Some(flat),
        };
        assert!(
            matches!(kernel.hub_solid(&hub), Err(CadError::InvalidHub(_))),
            "flat {flat:?} must be rejected"
        );
    }
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
            shaft_flat_radial_mm: None,
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
            shaft_flat_radial_mm: None,
        },
        Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 0.0,
            length_mm: 50.0,
            shaft_flat_radial_mm: None,
        },
        Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 120.0,
            length_mm: 50.0,
            shaft_flat_radial_mm: None,
        },
        Hub {
            diameter_mm: 120.0,
            bore_diameter_mm: 12.0,
            length_mm: f64::NAN,
            shaft_flat_radial_mm: None,
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

#[test]
fn all_five_golden_fixtures_export_valid_step_solids_with_expected_span_bounds() {
    let fixtures = [
        (
            "naca4412-linear.json",
            include_str!("../../../fixtures/naca4412-linear.json"),
            60.0,
            600.0,
            12,
        ),
        (
            "naca4412-schmitz.json",
            include_str!("../../../fixtures/naca4412-schmitz.json"),
            60.0,
            600.0,
            12,
        ),
        (
            "naca0012-constant.json",
            include_str!("../../../fixtures/naca0012-constant.json"),
            40.0,
            400.0,
            12,
        ),
        (
            "naca2415-multistation-dflat.json",
            include_str!("../../../fixtures/naca2415-multistation-dflat.json"),
            45.0,
            300.0,
            8,
        ),
        (
            "naca6409-high-tsr-5blade.json",
            include_str!("../../../fixtures/naca6409-high-tsr-5blade.json"),
            50.0,
            500.0,
            8,
        ),
    ];

    let kernel = TruckKernel::new();
    for (name, raw, expected_z_min, expected_z_max, expected_hub_faces) in fixtures {
        let design = Design::from_json(raw).unwrap_or_else(|err| panic!("{name}: {err}"));
        let resolved = resolve(&design).unwrap_or_else(|err| panic!("{name}: {err}"));
        let sections = build_sections(&resolved).unwrap_or_else(|err| panic!("{name}: {err}"));
        let surface = loft(&sections).unwrap_or_else(|err| panic!("{name}: {err}"));

        let blade = kernel
            .blade_solid(&surface)
            .unwrap_or_else(|err| panic!("{name} blade_solid: {err}"));
        assert_eq!(blade.boundaries()[0].len(), 4, "{name}: blade faces");

        let hub = kernel
            .hub_solid(&design.hub)
            .unwrap_or_else(|err| panic!("{name} hub_solid: {err}"));
        assert_eq!(
            hub.boundaries()[0].len(),
            expected_hub_faces,
            "{name}: hub faces"
        );

        let blade_step = kernel
            .write_step(&[blade])
            .unwrap_or_else(|err| panic!("{name} write_step: {err}"));
        let table = Table::from_step(&blade_step).expect("truck STEP reader accepts blade");
        let holder = table.shell.values().next().expect("one closed shell");
        let shell = table.to_compressed_shell(holder).expect("shell converts");
        let min_z = shell
            .vertices
            .iter()
            .map(|p| p.z)
            .fold(f64::INFINITY, f64::min);
        let max_z = shell
            .vertices
            .iter()
            .map(|p| p.z)
            .fold(f64::NEG_INFINITY, f64::max);
        assert!(
            (min_z - expected_z_min).abs() < 1e-6,
            "{name}: root z {min_z} != {expected_z_min}"
        );
        assert!(
            (max_z - expected_z_max).abs() < 1e-6,
            "{name}: tip z {max_z} != {expected_z_max}"
        );
    }
}

#[test]
fn test_mesh_to_solid_converts_tetrahedron_and_writes_step() {
    let pts = vec![
        blade_geom::Point3::new(0.0, 0.0, 0.0).unwrap(),
        blade_geom::Point3::new(10.0, 0.0, 0.0).unwrap(),
        blade_geom::Point3::new(0.0, 10.0, 0.0).unwrap(),
        blade_geom::Point3::new(0.0, 0.0, 10.0).unwrap(),
    ];
    let tris = vec![
        blade_mesh::Triangle::new(0, 2, 1),
        blade_mesh::Triangle::new(0, 1, 3),
        blade_mesh::Triangle::new(0, 3, 2),
        blade_mesh::Triangle::new(1, 2, 3),
    ];
    let mesh = blade_mesh::Mesh {
        vertices: pts,
        triangles: tris,
    };

    let kernel = TruckKernel::new();
    let solid = kernel
        .mesh_solid(&mesh)
        .expect("tetrahedron forms closed solid");
    let step = kernel.write_step(&[solid]).expect("writes step");
    assert!(step.contains("MANIFOLD_SOLID_BREP"));
}

#[test]
fn test_fabricated_split_mesh_to_solid_with_tube_and_joint_writes_step() {
    use blade_mesh::{
        tessellate_fabricated, AlignmentShape, AlignmentSpec, FabricationSpec, SparHoleSpec,
    };

    let surface = fixture_surface();
    let spec = FabricationSpec {
        spar_hole: Some(SparHoleSpec {
            diameter_mm: 5.0,
            depth_mm: 200.0,
            offset_x_mm: 0.0,
            offset_y_mm: 0.0,
            tolerance_mm: 0.2,
        }),
        split_parts: 2,
        split_ratio: Some(0.5),
        active_part: Some(0),
        explode_gap_mm: 0.0,
        alignment: Some(AlignmentSpec {
            shape: AlignmentShape::AirfoilLip,
            count: 1,
            size_mm: 2.0,
            key_length_mm: 10.0,
            height_mm: 4.0,
            spacing_mm: 0.0,
            clearance_mm: 0.2,
            depth_clearance_mm: 0.5,
            min_wall_mm: 0.8,
        }),
    };

    let kernel = TruckKernel::new();
    let mesh0 = tessellate_fabricated(&surface, &spec).expect("part 0 tessellates");
    assert!(mesh0.triangles.len() > 100);
    let solid0 = kernel
        .mesh_solid(&mesh0)
        .expect("part 0 forms closed solid");

    // Also test Part 1 (with matching socket pocket)
    let spec1 = FabricationSpec {
        active_part: Some(1),
        ..spec
    };
    let mesh1 = tessellate_fabricated(&surface, &spec1).expect("part 1 tessellates");
    let solid1 = kernel
        .mesh_solid(&mesh1)
        .expect("part 1 forms closed solid");

    let step = kernel
        .write_step(&[solid0, solid1])
        .expect("writes multi-solid step");
    assert_eq!(step.matches("MANIFOLD_SOLID_BREP").count(), 2);
}
