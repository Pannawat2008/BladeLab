//! Exports the canonical fixture blade (and its hub) as STEP files.
//!
//! Run with:
//!
//! ```text
//! cargo run -p blade-cad --example export_step
//! ```
//!
//! The files are written relative to the workspace root:
//!
//! - `target/naca4412.blade.step` — blade solid only,
//! - `target/naca4412.assembly.step` — blade and hub in one document.

use std::fs;
use std::path::Path;

use blade_cad::{CadKernel, TruckKernel};
use blade_geom::{build_sections, loft};
use blade_model::{resolve, Design};

const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let design = Design::from_json(FIXTURE)?;
    let blade = resolve(&design)?;
    let sections = build_sections(&blade)?;
    let surface = loft(&sections)?;

    let kernel = TruckKernel::new();
    let blade_solid = kernel.blade_solid(&surface)?;
    let hub_solid = kernel.hub_solid(&blade.hub)?;

    let out_dir = Path::new("target");
    fs::create_dir_all(out_dir)?;

    let blade_step = kernel.write_step(std::slice::from_ref(&blade_solid))?;
    let assembly_step = kernel.write_step(&[blade_solid, hub_solid])?;

    let blade_path = out_dir.join("naca4412.blade.step");
    let assembly_path = out_dir.join("naca4412.assembly.step");
    fs::write(&blade_path, blade_step.as_bytes())?;
    fs::write(&assembly_path, assembly_step.as_bytes())?;

    println!(
        "blade:    {} ({} bytes)",
        blade_path.display(),
        blade_step.len()
    );
    println!(
        "assembly: {} ({} bytes)",
        assembly_path.display(),
        assembly_step.len()
    );
    println!(
        "sections: {} ({}) | contour points: {} | span: {:.1}..{:.1} mm",
        surface.section_count(),
        surface.degree(),
        surface.point_count(),
        surface.span_start_mm(),
        surface.span_end_mm(),
    );
    Ok(())
}
