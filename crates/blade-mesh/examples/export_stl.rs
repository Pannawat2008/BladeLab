//! Writes the canonical fixture blade to a binary STL for slicer validation.
//!
//! Run with `cargo run -p blade-mesh --example export_stl`. The file is written
//! to `target/naca4412.blade.stl`; core crates stay I/O-free, this example is
//! the only place that touches the filesystem.

use blade_geom::{build_sections, loft};
use blade_mesh::{check_mesh, stl_len, tessellate, write_stl, MeshOptions};
use blade_model::{resolve, Design};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let json = include_str!("../../../fixtures/naca4412-linear.json");
    let design = Design::from_json(json)?;
    let blade = resolve(&design)?;
    let sections = build_sections(&blade)?;
    let surface = loft(&sections)?;
    let mesh = tessellate(&surface, &MeshOptions::default())?;
    let report = check_mesh(&mesh);

    println!(
        "{} vertices, {} triangles, volume {:.1} mm^3, area {:.1} mm^2",
        report.vertex_count, report.triangle_count, report.volume_mm3, report.area_mm2
    );
    println!(
        "watertight={} valid_solid={} boundary_edges={} non_manifold_edges={} degenerate={}",
        report.watertight,
        report.is_valid_solid(),
        report.boundary_edges,
        report.non_manifold_edges,
        report.degenerate_triangles
    );
    for issue in report.issues() {
        eprintln!("issue: {issue}");
    }

    let stl = write_stl(&mesh);
    assert_eq!(stl.len(), stl_len(&mesh));
    let path = std::path::Path::new("target/naca4412.blade.stl");
    std::fs::write(path, &stl)?;
    println!("wrote {} ({} bytes)", path.display(), stl.len());

    Ok(())
}
