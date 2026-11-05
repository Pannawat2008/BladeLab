//! End-to-end mesh tests: fixture design → loft → tessellation → inspection.

use blade_geom::{build_sections, loft, BladeSurface, Section3D};
use blade_mesh::{check_mesh, tessellate, Mesh, MeshOptions, Triangle};
use blade_model::{resolve, Design};

const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

fn fixture_surface() -> (Vec<Section3D>, BladeSurface) {
    let design = Design::from_json(FIXTURE).expect("fixture parses");
    let blade = resolve(&design).expect("fixture resolves");
    let sections = build_sections(&blade).expect("sections build");
    let surface = loft(&sections).expect("sections loft");
    (sections, surface)
}

#[test]
fn fixture_mesh_is_a_valid_printable_solid() {
    let (sections, surface) = fixture_surface();
    let points = sections[0].points().len();
    let mesh = tessellate(&surface, &MeshOptions::default()).expect("tessellates");

    assert_eq!(mesh.vertex_count(), sections.len() * points);
    let caps = 2 * (points - 2);
    let sides = 2 * (sections.len() - 1) * points;
    assert_eq!(mesh.triangle_count(), sides + caps);

    let report = check_mesh(&mesh);
    assert!(report.watertight, "issues: {:?}", report.issues());
    assert!(report.is_valid_solid(), "issues: {:?}", report.issues());
    assert_eq!(report.boundary_edges, 0);
    assert_eq!(report.non_manifold_edges, 0);
    assert_eq!(report.inconsistent_edges, 0);
    assert_eq!(report.degenerate_triangles, 0);
    assert_eq!(report.non_finite_vertices, 0);
    assert!(report.volume_mm3 > 1.0e4, "volume = {}", report.volume_mm3);
    assert!(report.volume_mm3 < 1.0e6, "volume = {}", report.volume_mm3);
    assert!(report.area_mm2 > 0.0);
    assert!(report.min_edge_mm > 0.0);
    assert!(report.min_triangle_altitude_mm > 0.0);

    // Root and tip rings sit at their span stations.
    for point in &mesh.vertices[..points] {
        assert!((point.z - 60.0).abs() < 1e-9);
    }
    for point in &mesh.vertices[mesh.vertex_count() - points..] {
        assert!((point.z - 600.0).abs() < 1e-9);
    }
}

#[test]
fn open_tube_reports_the_two_boundary_rings() {
    let (sections, surface) = fixture_surface();
    let points = sections[0].points().len();
    let options = MeshOptions { cap_ends: false };
    let mesh = tessellate(&surface, &options).expect("tessellates");

    assert_eq!(mesh.triangle_count(), 2 * (sections.len() - 1) * points);
    let report = check_mesh(&mesh);
    assert!(!report.watertight);
    assert_eq!(report.boundary_edges, 2 * points);
    assert_eq!(report.non_manifold_edges, 0);
    assert_eq!(report.inconsistent_edges, 0);
}

#[test]
fn flipped_faces_are_reported() {
    let (_, surface) = fixture_surface();
    let mut mesh = tessellate(&surface, &MeshOptions::default()).expect("tessellates");
    let triangle = mesh.triangles[0];
    mesh.triangles[0] = Triangle::new(triangle.a, triangle.c, triangle.b);

    let report = check_mesh(&mesh);
    assert!(!report.watertight);
    assert_eq!(report.inconsistent_edges, 3);
}

#[test]
fn holes_and_duplicate_faces_are_reported() {
    let (_, surface) = fixture_surface();
    let mut holed = tessellate(&surface, &MeshOptions::default()).expect("tessellates");
    holed.triangles.pop();
    let report = check_mesh(&holed);
    assert!(!report.watertight);
    assert_eq!(report.boundary_edges, 3);

    let mut duplicated = tessellate(&surface, &MeshOptions::default()).expect("tessellates");
    let copy = duplicated.triangles[0];
    duplicated.triangles.push(copy);
    let report = check_mesh(&duplicated);
    assert!(!report.watertight);
    assert_eq!(report.non_manifold_edges, 3);
}

#[test]
fn broken_indices_are_counted_not_indexed() {
    let mesh = Mesh {
        vertices: Vec::new(),
        triangles: vec![Triangle::new(0, 1, 2)],
    };
    let report = check_mesh(&mesh);
    assert_eq!(report.out_of_range_triangles, 1);
    assert!(!report.watertight);
    assert!(!report.is_valid_solid());
    assert!(!report.issues().is_empty());
}

#[test]
fn empty_meshes_are_rejected_without_panicking() {
    let report = check_mesh(&Mesh::default());
    assert_eq!(report.triangle_count, 0);
    assert_eq!(report.volume_mm3, 0.0);
    assert!(!report.watertight);
    assert!(!report.is_valid_solid());
}
