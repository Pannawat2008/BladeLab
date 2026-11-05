//! Golden geometry regression tests across the 5 canonical fixtures (`T-107`).
//!
//! Each fixture is resolved, lofted, tessellated, and checked via `check_mesh`.
//! Its volume, surface area, minimum triangle altitude, vertex/triangle counts,
//! binary STL byte size, and 3D bounding box (`x`, `y`, `z` min/max in mm) are
//! compared against `fixtures/golden_snapshots.json`.
//!
//! To intentionally update `fixtures/golden_snapshots.json` after an approved
//! geometry change, run:
//! ```text
//! BLADELAB_UPDATE_GOLDEN=1 cargo test -p blade-mesh --test golden_snapshots
//! ```

use std::path::PathBuf;

use blade_geom::{build_sections, loft};
use blade_mesh::{check_mesh, tessellate, write_stl, Mesh, MeshOptions};
use blade_model::{resolve, Design};
use serde::{Deserialize, Serialize};

/// Canonical 5-fixture suite for `T-107`.
const FIXTURES: [&str; 5] = [
    "naca4412-linear.json",
    "naca4412-schmitz.json",
    "naca0012-constant.json",
    "naca2415-multistation-dflat.json",
    "naca6409-high-tsr-5blade.json",
];

/// Axis-aligned 3D bounding box in millimetres.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct BoundingBoxMm {
    x_min: f64,
    x_max: f64,
    y_min: f64,
    y_max: f64,
    z_min: f64,
    z_max: f64,
}

/// Golden snapshot for a single fixture blade.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct GoldenSnapshot {
    fixture: String,
    station_count: usize,
    vertex_count: usize,
    triangle_count: usize,
    watertight: bool,
    valid_solid: bool,
    volume_mm3: f64,
    surface_area_mm2: f64,
    min_triangle_altitude_mm: f64,
    stl_byte_len: usize,
    bbox_mm: BoundingBoxMm,
}

fn fixtures_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures")
}

fn golden_path() -> PathBuf {
    fixtures_dir().join("golden_snapshots.json")
}

fn round6(value: f64) -> f64 {
    (value * 1_000_000.0).round() / 1_000_000.0
}

fn compute_bbox(mesh: &Mesh) -> BoundingBoxMm {
    let mut x_min = f64::INFINITY;
    let mut x_max = f64::NEG_INFINITY;
    let mut y_min = f64::INFINITY;
    let mut y_max = f64::NEG_INFINITY;
    let mut z_min = f64::INFINITY;
    let mut z_max = f64::NEG_INFINITY;

    for v in &mesh.vertices {
        x_min = x_min.min(v.x);
        x_max = x_max.max(v.x);
        y_min = y_min.min(v.y);
        y_max = y_max.max(v.y);
        z_min = z_min.min(v.z);
        z_max = z_max.max(v.z);
    }

    BoundingBoxMm {
        x_min: round6(x_min),
        x_max: round6(x_max),
        y_min: round6(y_min),
        y_max: round6(y_max),
        z_min: round6(z_min),
        z_max: round6(z_max),
    }
}

fn evaluate_design(fixture_name: &str, design: &Design) -> GoldenSnapshot {
    let resolved =
        resolve(design).unwrap_or_else(|err| panic!("{fixture_name}: resolve failed: {err}"));
    let sections = build_sections(&resolved)
        .unwrap_or_else(|err| panic!("{fixture_name}: build_sections failed: {err}"));
    let surface =
        loft(&sections).unwrap_or_else(|err| panic!("{fixture_name}: loft failed: {err}"));
    let mesh = tessellate(&surface, &MeshOptions::default())
        .unwrap_or_else(|err| panic!("{fixture_name}: tessellate failed: {err}"));
    let report = check_mesh(&mesh);
    let stl = write_stl(&mesh);

    assert!(
        report.watertight,
        "{fixture_name}: expected watertight mesh, got {report:?}"
    );
    assert!(
        report.is_valid_solid(),
        "{fixture_name}: expected valid solid mesh, got {report:?}"
    );

    GoldenSnapshot {
        fixture: fixture_name.to_owned(),
        station_count: resolved.stations.len(),
        vertex_count: mesh.vertices.len(),
        triangle_count: mesh.triangles.len(),
        watertight: report.watertight,
        valid_solid: report.is_valid_solid(),
        volume_mm3: round6(report.volume_mm3),
        surface_area_mm2: round6(report.area_mm2),
        min_triangle_altitude_mm: round6(report.min_triangle_altitude_mm),
        stl_byte_len: stl.len(),
        bbox_mm: compute_bbox(&mesh),
    }
}

fn compare_snapshots(actual: &GoldenSnapshot, expected: &GoldenSnapshot) -> Result<(), String> {
    if actual.fixture != expected.fixture {
        return Err(format!(
            "fixture name mismatch: actual `{}` vs expected `{}`",
            actual.fixture, expected.fixture
        ));
    }
    if actual.station_count != expected.station_count
        || actual.vertex_count != expected.vertex_count
        || actual.triangle_count != expected.triangle_count
        || actual.stl_byte_len != expected.stl_byte_len
        || actual.watertight != expected.watertight
        || actual.valid_solid != expected.valid_solid
    {
        return Err(format!(
            "{}: topology mismatch: actual {:?} vs expected {:?}",
            actual.fixture, actual, expected
        ));
    }

    let checks = [
        ("volume_mm3", actual.volume_mm3, expected.volume_mm3, 1e-3),
        (
            "surface_area_mm2",
            actual.surface_area_mm2,
            expected.surface_area_mm2,
            1e-3,
        ),
        (
            "min_triangle_altitude_mm",
            actual.min_triangle_altitude_mm,
            expected.min_triangle_altitude_mm,
            1e-5,
        ),
        (
            "bbox.x_min",
            actual.bbox_mm.x_min,
            expected.bbox_mm.x_min,
            1e-5,
        ),
        (
            "bbox.x_max",
            actual.bbox_mm.x_max,
            expected.bbox_mm.x_max,
            1e-5,
        ),
        (
            "bbox.y_min",
            actual.bbox_mm.y_min,
            expected.bbox_mm.y_min,
            1e-5,
        ),
        (
            "bbox.y_max",
            actual.bbox_mm.y_max,
            expected.bbox_mm.y_max,
            1e-5,
        ),
        (
            "bbox.z_min",
            actual.bbox_mm.z_min,
            expected.bbox_mm.z_min,
            1e-5,
        ),
        (
            "bbox.z_max",
            actual.bbox_mm.z_max,
            expected.bbox_mm.z_max,
            1e-5,
        ),
    ];

    for (field, got, want, tol) in checks {
        let diff = (got - want).abs();
        if diff > tol {
            return Err(format!(
                "{}: {field} drifted: actual {got:.6} vs expected {want:.6} (|diff| = {diff:.6} > {tol})",
                actual.fixture
            ));
        }
    }

    Ok(())
}

#[test]
fn all_five_fixtures_match_golden_volume_and_bounding_box_snapshots() {
    let dir = fixtures_dir();
    let mut computed = Vec::with_capacity(FIXTURES.len());

    for name in FIXTURES {
        let path = dir.join(name);
        let raw = std::fs::read_to_string(&path)
            .unwrap_or_else(|err| panic!("failed to read fixture {}: {err}", path.display()));
        let design = Design::from_json(&raw)
            .unwrap_or_else(|err| panic!("failed to parse fixture {name}: {err}"));
        computed.push(evaluate_design(name, &design));
    }

    let snapshot_file = golden_path();
    if std::env::var("BLADELAB_UPDATE_GOLDEN").as_deref() == Ok("1") {
        let mut json = serde_json::to_string_pretty(&computed).expect("serialise golden snapshots");
        json.push('\n');
        std::fs::write(&snapshot_file, json).expect("write fixtures/golden_snapshots.json");
    }

    let raw_expected = std::fs::read_to_string(&snapshot_file).unwrap_or_else(|err| {
        panic!(
            "missing {}: {err} (run with BLADELAB_UPDATE_GOLDEN=1 to generate)",
            snapshot_file.display()
        )
    });
    let expected: Vec<GoldenSnapshot> =
        serde_json::from_str(&raw_expected).expect("parse fixtures/golden_snapshots.json");

    assert_eq!(
        computed.len(),
        expected.len(),
        "expected {} golden snapshots, found {}",
        computed.len(),
        expected.len()
    );

    for (actual, exp) in computed.iter().zip(expected.iter()) {
        if let Err(msg) = compare_snapshots(actual, exp) {
            panic!(
                "Golden snapshot regression detected!\n  {msg}\n  \
                 If intentional, re-run with BLADELAB_UPDATE_GOLDEN=1 cargo test -p blade-mesh --test golden_snapshots"
            );
        }
    }
}

#[test]
fn golden_snapshot_detector_fails_when_geometry_changes_unexpectedly() {
    let path = fixtures_dir().join("naca4412-linear.json");
    let raw = std::fs::read_to_string(&path).expect("read naca4412-linear.json");
    let baseline_design = Design::from_json(&raw).expect("parse baseline");
    let baseline_snapshot = evaluate_design("naca4412-linear.json", &baseline_design);

    // Perturb rotor radius by +1 mm and verify compare_snapshots flags the drift.
    let mut mutated_design = baseline_design.clone();
    mutated_design.rotor.radius_mm += 1.0;
    let mutated_snapshot = evaluate_design("naca4412-linear.json", &mutated_design);

    let err = compare_snapshots(&mutated_snapshot, &baseline_snapshot)
        .expect_err("mutating rotor radius must fail golden snapshot comparison");
    assert!(
        err.contains("volume_mm3") || err.contains("bbox.z_max"),
        "unexpected error message: {err}"
    );
}
