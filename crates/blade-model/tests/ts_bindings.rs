//! Verifies that `web/src/types/blade-model.ts` matches the latest Rust
//! `blade-model` schema structs generated via `ts-rs` (`T-106`).
//!
//! To regenerate `web/src/types/blade-model.ts` after a schema amendment, run:
//! ```text
//! BLADELAB_UPDATE_TS=1 cargo test -p blade-model --test ts_bindings
//! ```

use std::path::PathBuf;

use blade_model::typescript_bindings;

fn bindings_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../web/src/types/blade-model.ts")
}

#[test]
fn generated_typescript_types_match_latest_rust_structs() {
    let expected = typescript_bindings().replace("\r\n", "\n");
    let path = bindings_path();

    if std::env::var("BLADELAB_UPDATE_TS").as_deref() == Ok("1") {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).expect("create web/src/types directory");
        }
        std::fs::write(&path, &expected).expect("write web/src/types/blade-model.ts");
    }

    let on_disk = std::fs::read_to_string(&path)
        .unwrap_or_else(|err| {
            panic!(
                "missing {}: {err} (run with BLADELAB_UPDATE_TS=1 to generate)",
                path.display()
            )
        })
        .replace("\r\n", "\n");

    assert_eq!(
        on_disk, expected,
        "web/src/types/blade-model.ts is out of sync with blade-model Rust structs! \
         Re-run with BLADELAB_UPDATE_TS=1 cargo test -p blade-model --test ts_bindings"
    );

    // Sanity-check key generated TS declarations.
    for snippet in [
        "export type Design =",
        "export type Rotor =",
        "export type Distributions =",
        "export type CurveSource =",
        "\"type\": \"schmitz\"",
        "export type AirfoilStation =",
        "export type AirfoilSpec =",
        "export type StationOverride =",
        "export type Hub =",
        "shaft_flat_radial_mm?: number | null",
        "export type Manufacturing =",
        "export type ValidationIssue =",
    ] {
        assert!(
            expected.contains(snippet),
            "generated TS bindings missing expected declaration `{snippet}`"
        );
    }
}
