//! Binary STL layout tests, including byte-level parsing of the output.

use blade_geom::{build_sections, loft};
use blade_mesh::{check_mesh, stl_len, tessellate, write_stl, Mesh, MeshOptions, Triangle};
use blade_model::{resolve, Design};

const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

fn fixture_mesh() -> Mesh {
    let design = Design::from_json(FIXTURE).expect("fixture parses");
    let blade = resolve(&design).expect("fixture resolves");
    let sections = build_sections(&blade).expect("sections build");
    let surface = loft(&sections).expect("sections loft");
    tessellate(&surface, &MeshOptions::default()).expect("tessellates")
}

fn triangle_count(stl: &[u8]) -> usize {
    u32::from_le_bytes(stl[80..84].try_into().expect("count field")) as usize
}

fn floats(stl: &[u8]) -> impl Iterator<Item = f32> + '_ {
    stl[84..]
        .chunks_exact(50)
        .flat_map(|chunk| chunk[..48].chunks_exact(4))
        .map(|word| f32::from_le_bytes(word.try_into().expect("f32 word")))
}

#[test]
fn stl_has_the_binary_layout_and_exact_size() {
    let mesh = fixture_mesh();
    let stl = write_stl(&mesh);

    assert_eq!(stl.len(), stl_len(&mesh));
    assert_eq!(stl.len(), 84 + 50 * mesh.triangle_count());
    assert_eq!(triangle_count(&stl), mesh.triangle_count());
    assert!(stl.starts_with(b"BladeLab binary STL"));
    assert!(stl[..80].ends_with(&[0_u8]));
    assert!(floats(&stl).all(f32::is_finite));
}

#[test]
fn stl_triangles_round_trip_the_mesh_vertices() {
    let mesh = fixture_mesh();
    let stl = write_stl(&mesh);
    let mut values = floats(&stl);

    for index in 0..mesh.triangle_count() {
        let normal = [
            values.next().unwrap(),
            values.next().unwrap(),
            values.next().unwrap(),
        ];
        let length = (normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]).sqrt();
        assert!(
            (length - 1.0).abs() < 1e-5,
            "triangle {index} normal = {length}"
        );

        let expected = mesh.triangle_vertices(index).expect("valid triangle");
        for point in expected {
            let x = values.next().unwrap();
            let y = values.next().unwrap();
            let z = values.next().unwrap();
            assert!((x as f64 - point.x).abs() < 1e-3);
            assert!((y as f64 - point.y).abs() < 1e-3);
            assert!((z as f64 - point.z).abs() < 1e-3);
        }
    }
    assert!(values.next().is_none(), "trailing floats in STL");
}

#[test]
fn open_meshes_still_serialise_deterministically() {
    let design = Design::from_json(FIXTURE).expect("fixture parses");
    let blade = resolve(&design).expect("fixture resolves");
    let sections = build_sections(&blade).expect("sections build");
    let surface = loft(&sections).expect("sections loft");
    let open = tessellate(&surface, &MeshOptions { cap_ends: false }).expect("tessellates");

    let first = write_stl(&open);
    let second = write_stl(&open);
    assert_eq!(first, second);
    assert_eq!(triangle_count(&first), open.triangle_count());
    assert!(!check_mesh(&open).watertight);
}

#[test]
fn non_finite_coordinates_never_reach_the_stl() {
    let mesh = Mesh {
        vertices: vec![
            blade_geom::Point3 {
                x: f64::NAN,
                y: 1.0,
                z: 0.0,
            },
            blade_geom::Point3 {
                x: f64::INFINITY,
                y: 2.0,
                z: 0.0,
            },
            blade_geom::Point3 {
                x: 0.0,
                y: 0.0,
                z: 0.0,
            },
        ],
        triangles: vec![Triangle::new(0, 1, 2)],
    };

    let stl = write_stl(&mesh);
    assert_eq!(triangle_count(&stl), 1);
    assert!(floats(&stl).all(f32::is_finite));
    assert_eq!(stl.len(), 84 + 50);
}

#[test]
fn out_of_range_indices_are_written_as_safe_zeroes() {
    let mesh = Mesh {
        vertices: Vec::new(),
        triangles: vec![Triangle::new(0, 1, 2)],
    };
    let stl = write_stl(&mesh);
    assert_eq!(triangle_count(&stl), 1);
    assert!(floats(&stl).all(f32::is_finite));
    assert!(floats(&stl).all(|value| value == 0.0));
}
