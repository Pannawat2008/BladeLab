//! Integration tests for `blade-cli` (`bladelab export design.json --format <stl|3mf|step>`).

use std::path::PathBuf;
use std::process::Command;

use blade_cli::{export_design_bytes, parse_args, run_export, CliError, ExportFormat, ExportPart};

const LINEAR_FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");
const SCHMITZ_FIXTURE: &str = include_str!("../../../fixtures/naca4412-schmitz.json");

fn fixture_path(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../fixtures")
        .join(name)
}

#[test]
fn parses_cli_arguments_and_defaults_output_extension() {
    let args = parse_args(["export", "design.json", "--format", "step"]).expect("valid args");
    assert_eq!(args.input, PathBuf::from("design.json"));
    assert_eq!(args.format, ExportFormat::Step);
    assert_eq!(args.output, PathBuf::from("design.step"));
    assert_eq!(args.part, ExportPart::Blade);

    let explicit = parse_args([
        "export",
        "fixtures/naca4412-linear.json",
        "--format=3mf",
        "-o",
        "target/out.3mf",
    ])
    .expect("valid explicit args");
    assert_eq!(explicit.format, ExportFormat::ThreeMf);
    assert_eq!(explicit.output, PathBuf::from("target/out.3mf"));

    let assembly = parse_args(["export", "design.json", "-f", "stp", "--part=assembly"])
        .expect("valid assembly args");
    assert_eq!(assembly.format, ExportFormat::Step);
    assert_eq!(assembly.part, ExportPart::Assembly);
}

#[test]
fn rejects_invalid_cli_arguments_with_clear_errors() {
    assert!(matches!(
        parse_args(["export", "design.json", "--format", "obj"]),
        Err(CliError::UnsupportedFormat(_))
    ));
    assert!(matches!(
        parse_args(["export", "design.json"]),
        Err(CliError::Usage(_))
    ));
    assert!(matches!(
        parse_args(["unknown", "design.json"]),
        Err(CliError::Usage(_))
    ));
    assert!(matches!(
        export_design_bytes(LINEAR_FIXTURE, ExportFormat::Stl, ExportPart::Hub),
        Err(CliError::PartRequiresStep {
            part: ExportPart::Hub
        })
    ));
}

#[test]
fn exports_valid_stl_3mf_and_step_for_both_fixtures() {
    for raw in [LINEAR_FIXTURE, SCHMITZ_FIXTURE] {
        // 1. Binary STL: 84-byte header + 3538 * 50 bytes = 176,984 bytes
        let stl = export_design_bytes(raw, ExportFormat::Stl, ExportPart::Blade)
            .expect("STL export succeeds");
        assert_eq!(stl.len(), 84 + 3538 * 50);
        let tri_count = u32::from_le_bytes([stl[80], stl[81], stl[82], stl[83]]);
        assert_eq!(tri_count, 3538);

        // 2. 3MF: OPC ZIP archive with 1771 vertices and 3538 triangles in mm
        let threemf = export_design_bytes(raw, ExportFormat::ThreeMf, ExportPart::Blade)
            .expect("3MF export succeeds");
        assert_eq!(&threemf[..4], b"PK\x03\x04");
        let text = String::from_utf8_lossy(&threemf);
        assert!(text.contains("<model unit=\"millimeter\""));
        assert_eq!(text.matches("<vertex ").count(), 1771);
        assert_eq!(text.matches("<triangle ").count(), 3538);

        // 3. STEP (blade, hub, assembly): ISO-10303-21 in mm
        let step_blade = export_design_bytes(raw, ExportFormat::Step, ExportPart::Blade)
            .expect("STEP blade export succeeds");
        let step_blade_str = std::str::from_utf8(&step_blade).expect("UTF-8 STEP");
        assert!(step_blade_str.starts_with("ISO-10303-21;"));
        assert!(step_blade_str.contains("SI_UNIT(.MILLI.,.METRE.)"));
        assert_eq!(step_blade_str.matches("MANIFOLD_SOLID_BREP(").count(), 1);

        let step_asm = export_design_bytes(raw, ExportFormat::Step, ExportPart::Assembly)
            .expect("STEP assembly export succeeds");
        let step_asm_str = std::str::from_utf8(&step_asm).expect("UTF-8 STEP");
        assert_eq!(step_asm_str.matches("MANIFOLD_SOLID_BREP(").count(), 2);
    }
}

#[test]
fn bladelab_binary_exports_files_and_handles_errors_cleanly() {
    let bin = env!("CARGO_BIN_EXE_bladelab");
    let out_dir = std::env::temp_dir().join(format!("bladelab-cli-test-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&out_dir);
    std::fs::create_dir_all(&out_dir).expect("temp dir created");

    let input = fixture_path("naca4412-linear.json");
    for (fmt, ext) in [("stl", "stl"), ("3mf", "3mf"), ("step", "step")] {
        let out_path = out_dir.join(format!("blade.{ext}"));
        let output = Command::new(bin)
            .args([
                "export",
                input.to_str().unwrap(),
                "--format",
                fmt,
                "-o",
                out_path.to_str().unwrap(),
            ])
            .output()
            .expect("spawns bladelab binary");
        assert!(
            output.status.success(),
            "bladelab failed for {fmt}: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        let metadata = std::fs::metadata(&out_path).expect("output file exists");
        assert!(metadata.len() > 1000, "{fmt} file is non-empty");
    }

    // Also verify run_export API directly.
    let schmitz_in = fixture_path("naca4412-schmitz.json");
    let schmitz_step = out_dir.join("schmitz.step");
    let parsed = parse_args([
        "export",
        schmitz_in.to_str().unwrap(),
        "--format",
        "step",
        "-o",
        schmitz_step.to_str().unwrap(),
    ])
    .expect("valid args");
    run_export(&parsed).expect("run_export succeeds");
    assert!(schmitz_step.exists());

    // Invalid invocation exits non-zero without panicking.
    let bad = Command::new(bin)
        .args(["export", "nonexistent-file.json", "--format", "step"])
        .output()
        .expect("spawns bladelab");
    assert!(!bad.status.success());

    let _ = std::fs::remove_dir_all(&out_dir);
}
