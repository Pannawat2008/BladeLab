#![deny(missing_docs)]
//! Command-line interface and in-memory export driver for BladeLab (`T-104`).
//!
//! Supported command syntax:
//! ```text
//! bladelab export <design.json> --format <stl|3mf|step> [-o <output>] [--part <blade|hub|assembly>]
//! ```
//!
//! All geometry and mesh/B-rep generation happens in the pure [`export_design_bytes`]
//! routine, while [`run_export`] performs the filesystem read/write adapter step.

use std::path::{Path, PathBuf};

use blade_cad::{assembly_mesh, hub_mesh, CadError, CadKernel, TruckKernel};
use blade_geom::{build_sections, loft, GeomError};
use blade_mesh::{check_mesh, tessellate, write_3mf, write_stl, MeshError, MeshOptions};
use blade_model::{resolve, Design, ModelError};
use thiserror::Error;

/// Output file format supported by `bladelab export`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ExportFormat {
    /// Binary STL triangle mesh (`.stl`).
    Stl,
    /// 3D Manufacturing Format package (`.3mf`).
    ThreeMf,
    /// ISO 10303-21 STEP B-rep solid (`.step`).
    Step,
}

impl ExportFormat {
    /// Parses a format flag (`stl`, `3mf`, `step`, or `stp`, case-insensitive).
    ///
    /// # Errors
    ///
    /// Returns [`CliError::UnsupportedFormat`] for unknown format strings.
    pub fn parse(raw: &str) -> Result<Self, CliError> {
        match raw.trim().to_ascii_lowercase().as_str() {
            "stl" => Ok(Self::Stl),
            "3mf" => Ok(Self::ThreeMf),
            "step" | "stp" => Ok(Self::Step),
            other => Err(CliError::UnsupportedFormat(other.to_string())),
        }
    }

    /// Canonical file extension (without leading dot).
    #[must_use]
    pub const fn extension(self) -> &'static str {
        match self {
            Self::Stl => "stl",
            Self::ThreeMf => "3mf",
            Self::Step => "step",
        }
    }
}

/// Which solid body or bodies to export.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ExportPart {
    /// Export the lofted blade only (default).
    #[default]
    Blade,
    /// Export the hub only (supported for `step`).
    Hub,
    /// Export both blade and hub in one document (supported for `step`).
    Assembly,
}

impl ExportPart {
    /// Parses a `--part` flag (`blade`, `hub`, or `assembly`, case-insensitive).
    ///
    /// # Errors
    ///
    /// Returns [`CliError::UnsupportedPart`] when the part name is not recognised.
    pub fn parse(raw: &str) -> Result<Self, CliError> {
        match raw.trim().to_ascii_lowercase().as_str() {
            "blade" => Ok(Self::Blade),
            "hub" => Ok(Self::Hub),
            "assembly" => Ok(Self::Assembly),
            other => Err(CliError::UnsupportedPart(other.to_string())),
        }
    }
}

/// Parsed arguments for `bladelab export`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExportArgs {
    /// Path to the input design JSON file.
    pub input: PathBuf,
    /// Requested output format (`stl`, `3mf`, or `step`).
    pub format: ExportFormat,
    /// Path where the exported file will be written.
    pub output: PathBuf,
    /// Part selection (`blade`, `hub`, or `assembly`).
    pub part: ExportPart,
}

/// Errors returned by the `bladelab` CLI.
#[derive(Debug, Error)]
pub enum CliError {
    /// Usage or command-line argument error.
    #[error("{0}")]
    Usage(String),

    /// Unknown `--format` value.
    #[error("unsupported export format `{0}` (expected `stl`, `3mf`, or `step`)")]
    UnsupportedFormat(String),

    /// Unknown `--part` value.
    #[error("unsupported part `{0}` (expected `blade`, `hub`, or `assembly`)")]
    UnsupportedPart(String),

    /// `--part hub` or `--part assembly` was requested for a blade-only mesh format.
    #[error("part `{part:?}` is only supported with `--format step` (unified mesh booleans are server-side per D-lead1-005)")]
    PartRequiresStep {
        /// Requested part.
        part: ExportPart,
    },

    /// Filesystem I/O failure.
    #[error("I/O error on `{path}`: {source}")]
    Io {
        /// File path involved.
        path: PathBuf,
        /// Underlying OS error.
        #[source]
        source: std::io::Error,
    },

    /// Design schema or validation error.
    #[error(transparent)]
    Model(#[from] ModelError),

    /// Geometry construction error.
    #[error(transparent)]
    Geom(#[from] GeomError),

    /// Tessellation error.
    #[error(transparent)]
    Mesh(#[from] MeshError),

    /// Tessellated mesh failed the watertight solid check.
    #[error("generated mesh is not a valid solid: {0}")]
    InvalidMeshSolid(String),

    /// CAD B-rep / STEP export error.
    #[error(transparent)]
    Cad(#[from] CadError),
}

/// Parses command-line arguments (excluding `argv[0]`) into [`ExportArgs`].
///
/// # Errors
///
/// Returns [`CliError`] if the subcommand is not `export`, required arguments
/// (`<design.json>` or `--format`) are missing, or flags are unknown.
pub fn parse_args<I, S>(args: I) -> Result<ExportArgs, CliError>
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let tokens: Vec<String> = args.into_iter().map(|s| s.as_ref().to_string()).collect();
    if tokens.is_empty() {
        return Err(CliError::Usage(usage_text()));
    }

    match tokens[0].as_str() {
        "-h" | "--help" | "help" => return Err(CliError::Usage(usage_text())),
        "export" => {}
        other => {
            return Err(CliError::Usage(format!(
                "unknown subcommand `{other}`\n\n{}",
                usage_text()
            )))
        }
    }

    let mut input: Option<PathBuf> = None;
    let mut format: Option<ExportFormat> = None;
    let mut output: Option<PathBuf> = None;
    let mut part = ExportPart::Blade;

    let mut index = 1;
    while index < tokens.len() {
        let token = &tokens[index];
        if token == "-h" || token == "--help" {
            return Err(CliError::Usage(usage_text()));
        } else if token == "-f" || token == "--format" {
            index += 1;
            let value = tokens.get(index).ok_or_else(|| {
                CliError::Usage("missing value for `--format <stl|3mf|step>`".to_string())
            })?;
            format = Some(ExportFormat::parse(value)?);
        } else if let Some(value) = token.strip_prefix("--format=") {
            format = Some(ExportFormat::parse(value)?);
        } else if token == "-o" || token == "--output" {
            index += 1;
            let value = tokens.get(index).ok_or_else(|| {
                CliError::Usage("missing value for `--output <path>`".to_string())
            })?;
            output = Some(PathBuf::from(value));
        } else if let Some(value) = token.strip_prefix("--output=") {
            output = Some(PathBuf::from(value));
        } else if token == "--part" {
            index += 1;
            let value = tokens.get(index).ok_or_else(|| {
                CliError::Usage("missing value for `--part <blade|hub|assembly>`".to_string())
            })?;
            part = ExportPart::parse(value)?;
        } else if let Some(value) = token.strip_prefix("--part=") {
            part = ExportPart::parse(value)?;
        } else if token.starts_with('-') {
            return Err(CliError::Usage(format!("unknown flag `{token}`")));
        } else if input.is_none() {
            input = Some(PathBuf::from(token));
        } else {
            return Err(CliError::Usage(format!(
                "unexpected positional argument `{token}`"
            )));
        }
        index += 1;
    }

    let input = input
        .ok_or_else(|| CliError::Usage("missing input design file `<design.json>`".to_string()))?;
    let format = format
        .ok_or_else(|| CliError::Usage("missing required `--format <stl|3mf|step>`".to_string()))?;
    let output = output.unwrap_or_else(|| default_output_path(&input, format));

    Ok(ExportArgs {
        input,
        format,
        output,
        part,
    })
}

/// Pure in-memory export: parses and validates `design_json`, runs the geometry
/// pipeline, checks solid validity, and returns the serialised `stl`, `3mf`, or
/// `step` payload bytes.
///
/// # Errors
///
/// Returns [`CliError`] if the design JSON is invalid, fails geometry/mesh/CAD
/// construction, or fails the watertight solid gate.
pub fn export_design_bytes(
    design_json: &str,
    format: ExportFormat,
    part: ExportPart,
) -> Result<Vec<u8>, CliError> {
    let design = Design::from_json(design_json)?;
    let resolved = resolve(&design)?;

    match format {
        ExportFormat::Stl | ExportFormat::ThreeMf => {
            let mesh = match part {
                ExportPart::Blade => {
                    let sections = build_sections(&resolved)?;
                    let surface = loft(&sections)?;
                    tessellate(&surface, &MeshOptions::default())?
                }
                ExportPart::Hub => hub_mesh(&resolved.hub)?,
                ExportPart::Assembly => {
                    let sections = build_sections(&resolved)?;
                    let surface = loft(&sections)?;
                    assembly_mesh(&surface, &resolved.hub)?
                }
            };
            let report = check_mesh(&mesh);
            if !report.is_valid_solid() {
                return Err(CliError::InvalidMeshSolid(report.issues().join("; ")));
            }
            match format {
                ExportFormat::Stl => Ok(write_stl(&mesh)),
                ExportFormat::ThreeMf => Ok(write_3mf(&mesh)),
                ExportFormat::Step => unreachable!(),
            }
        }
        ExportFormat::Step => {
            let kernel = TruckKernel::new();
            let bodies = match part {
                ExportPart::Blade => {
                    let sections = build_sections(&resolved)?;
                    let surface = loft(&sections)?;
                    vec![kernel.blade_solid(&surface)?]
                }
                ExportPart::Hub => vec![kernel.hub_solid(&resolved.hub)?],
                ExportPart::Assembly => {
                    let sections = build_sections(&resolved)?;
                    let surface = loft(&sections)?;
                    vec![
                        kernel.blade_solid(&surface)?,
                        kernel.hub_solid(&resolved.hub)?,
                    ]
                }
            };
            let step_text = kernel.write_step(&bodies)?;
            Ok(step_text.into_bytes())
        }
    }
}

/// Executes `bladelab export` by reading `args.input`, generating the requested
/// format, and writing the output bytes to `args.output`.
///
/// # Errors
///
/// Returns [`CliError`] on file I/O failure or export pipeline failure.
pub fn run_export(args: &ExportArgs) -> Result<PathBuf, CliError> {
    let raw = std::fs::read_to_string(&args.input).map_err(|source| CliError::Io {
        path: args.input.clone(),
        source,
    })?;

    let bytes = export_design_bytes(&raw, args.format, args.part)?;

    if let Some(parent) = args.output.parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent).map_err(|source| CliError::Io {
                path: parent.to_path_buf(),
                source,
            })?;
        }
    }

    std::fs::write(&args.output, &bytes).map_err(|source| CliError::Io {
        path: args.output.clone(),
        source,
    })?;

    Ok(args.output.clone())
}

fn default_output_path(input: &Path, format: ExportFormat) -> PathBuf {
    let mut out = input.to_path_buf();
    out.set_extension(format.extension());
    out
}

/// Returns the human-readable CLI usage summary.
#[must_use]
pub fn usage_text() -> String {
    concat!(
        "Usage:\n",
        "  bladelab export <design.json> --format <stl|3mf|step> [-o <output>] [--part <blade|hub|assembly>]\n"
    )
    .to_string()
}
