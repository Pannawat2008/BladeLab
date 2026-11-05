//! Design document schema, version 1.
//!
//! The schema is the single serialised representation shared by the browser
//! (via `ts-rs` later, T-106), the REST API and the geometry kernel. It is
//! deliberately plain data: no behaviour, no I/O, `serde` only.

use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Schema version understood by this crate.
pub const SCHEMA_VERSION: u32 = 1;

/// A complete blade design (the object stored as JSON).
///
/// Layers of parameterisation:
/// - Layer 1 (global): [`Rotor`], [`Hub`], [`Manufacturing`].
/// - Layer 2 (curves): [`Distributions`] and the [`CurveSource`] values.
/// - Layer 3 (stations): [`StationOverride`] entries.
///
/// `AirfoilStation` assigns airfoils along the span; a station override may
/// replace the airfoil locally.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[serde(deny_unknown_fields)]
pub struct Design {
    /// Must equal [`SCHEMA_VERSION`].
    pub schema_version: u32,
    /// Rotor-level (layer 1) parameters.
    pub rotor: Rotor,
    /// Spanwise distribution curves (layer 2).
    pub distributions: Distributions,
    /// Airfoils along the span, ordered by `span_ratio` ascending.
    pub airfoils: Vec<AirfoilStation>,
    /// Per-station overrides (layer 3).
    pub overrides: Vec<StationOverride>,
    /// Hub geometry (consumed by `blade-cad`).
    pub hub: Hub,
    /// Manufacturing limits used for validation and warnings.
    pub manufacturing: Manufacturing,
}

impl Design {
    /// Parses a design from JSON, rejecting unknown schema versions early.
    ///
    /// Full semantic validation is separate ([`crate::validate`]) so callers
    /// can report every issue at once.
    ///
    /// # Errors
    ///
    /// - [`crate::ModelError::Json`] when the payload is not valid JSON or does
    ///   not match the schema.
    /// - [`crate::ModelError::UnsupportedSchema`] when `schema_version` differs
    ///   from [`SCHEMA_VERSION`].
    pub fn from_json(json: &str) -> Result<Self, crate::ModelError> {
        let design: Design = serde_json::from_str(json)?;
        if design.schema_version != SCHEMA_VERSION {
            return Err(crate::ModelError::UnsupportedSchema {
                found: design.schema_version,
                supported: SCHEMA_VERSION,
            });
        }
        Ok(design)
    }

    /// Serialises the design as pretty-printed JSON.
    ///
    /// # Errors
    ///
    /// Returns [`crate::ModelError::Json`] if serialisation fails (for example
    /// on a non-finite float, which `serde_json` refuses to encode).
    pub fn to_json(&self) -> Result<String, crate::ModelError> {
        Ok(serde_json::to_string_pretty(self)?)
    }
}

/// Rotor-level parameters (layer 1).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
pub struct Rotor {
    /// Tip radius `R` in mm.
    pub radius_mm: f64,
    /// Radius at which the blade starts (hub surface) in mm.
    pub hub_radius_mm: f64,
    /// Number of blades (1–12).
    pub blade_count: u32,
    /// Design tip-speed ratio used by the aero model.
    pub design_tsr: f64,
    /// Design wind speed in m/s.
    pub wind_speed_mps: f64,
    /// Chordwise pitch-axis position as a fraction of chord (`0` = LE).
    pub pitch_axis_ratio: f64,
    /// Number of resolved cross-sections between hub and tip.
    pub station_count: u32,
}

/// Spanwise curves (layer 2).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
pub struct Distributions {
    /// Chord distribution in mm.
    pub chord_mm: CurveSource,
    /// Twist distribution in degrees.
    pub twist_deg: CurveSource,
}

/// A spanwise value source.
///
/// Values are defined over the *blade span*: `root` is the value at
/// `span_ratio = hub_radius_mm / radius_mm` and `tip` the value at
/// `span_ratio = 1`. Bézier and formula sources arrive with T-201.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum CurveSource {
    /// One value along the whole span.
    Constant {
        /// Value at every station.
        value: f64,
    },
    /// Linear interpolation between root and tip.
    Linear {
        /// Value at the blade root.
        root: f64,
        /// Value at the blade tip.
        tip: f64,
    },
    /// Layer-1 Schmitz optimum-rotor distribution over `r / R ∈ (0, 1]`.
    ///
    /// When used for `distributions.chord_mm`, `design_cl` is required (`> 0`)
    /// and evaluates `c(r) = (16πr / (B · C_l)) · sin²((1/3) · atan(R / (λ · r)))`.
    /// When used for `distributions.twist_deg`, `design_alpha_deg` is required
    /// (`[-90, 90]`) and evaluates `β(r) = (2/3) · atan(R / (λ · r)) · (180/π) − α_design`.
    Schmitz {
        /// Design lift coefficient `C_l` (required when used for `chord_mm`).
        #[serde(default)]
        #[ts(optional = nullable)]
        design_cl: Option<f64>,
        /// Design angle of attack `α_design` in degrees (required when used for `twist_deg`).
        #[serde(default)]
        #[ts(optional = nullable)]
        design_alpha_deg: Option<f64>,
    },
}

impl CurveSource {
    /// Evaluates the curve at blade-span position `s ∈ [0, 1]`
    /// (`0` = hub, `1` = tip).
    ///
    /// For [`Self::Schmitz`], full evaluation requires rotor parameters and the
    /// radial `span_ratio = r / R`; prefer [`Self::eval_chord`] and
    /// [`Self::eval_twist`].
    #[must_use]
    pub fn eval(&self, s: f64) -> f64 {
        match self {
            Self::Constant { value } => *value,
            Self::Linear { root, tip } => root + (tip - root) * s,
            Self::Schmitz {
                design_cl,
                design_alpha_deg,
            } => design_cl.or(*design_alpha_deg).unwrap_or(0.0),
        }
    }

    /// Evaluates a chord curve in mm at radial `span_ratio = r / R` and
    /// blade-normalised coordinate `s ∈ [0, 1]`.
    #[must_use]
    pub fn eval_chord(&self, rotor: &Rotor, span_ratio: f64, s: f64) -> f64 {
        match self {
            Self::Constant { value } => *value,
            Self::Linear { root, tip } => root + (tip - root) * s,
            Self::Schmitz { design_cl, .. } => {
                let cl = design_cl.unwrap_or(1.0);
                let r_mm = span_ratio * rotor.radius_mm;
                let local_tsr = rotor.design_tsr * span_ratio;
                let phi_rad = (2.0 / 3.0) * (1.0_f64).atan2(local_tsr);
                let sin_half = (0.5 * phi_rad).sin();
                (16.0 * std::f64::consts::PI * r_mm / (f64::from(rotor.blade_count) * cl))
                    * sin_half
                    * sin_half
            }
        }
    }

    /// Evaluates a twist curve in degrees at radial `span_ratio = r / R` and
    /// blade-normalised coordinate `s ∈ [0, 1]`.
    #[must_use]
    pub fn eval_twist(&self, rotor: &Rotor, span_ratio: f64, s: f64) -> f64 {
        match self {
            Self::Constant { value } => *value,
            Self::Linear { root, tip } => root + (tip - root) * s,
            Self::Schmitz {
                design_alpha_deg, ..
            } => {
                let alpha_deg = design_alpha_deg.unwrap_or(0.0);
                let local_tsr = rotor.design_tsr * span_ratio;
                let phi_deg = ((2.0 / 3.0) * (1.0_f64).atan2(local_tsr)).to_degrees();
                phi_deg - alpha_deg
            }
        }
    }

    /// Root and tip values as a pair, for validation of constant/linear curves.
    pub(crate) fn bounds(&self) -> Option<(f64, f64)> {
        match self {
            Self::Constant { value } => Some((*value, *value)),
            Self::Linear { root, tip } => Some((*root, *tip)),
            Self::Schmitz { .. } => None,
        }
    }
}

/// Airfoil assignment at a spanwise station.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
pub struct AirfoilStation {
    /// Station position as `r / R`.
    pub span_ratio: f64,
    /// Airfoil used from this station outwards until the next one.
    pub airfoil: AirfoilSpec,
}

/// Reference to an airfoil shape.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AirfoilSpec {
    /// Continuous 4-digit NACA definition.
    Naca4 {
        /// Maximum camber ratio `m` (fraction of chord).
        max_camber: f64,
        /// Chordwise position of maximum camber `p` (fraction of chord).
        camber_position: f64,
        /// Maximum thickness ratio `t` (fraction of chord).
        thickness_ratio: f64,
    },
    /// Named airfoil from the library (`data/airfoils`), added by T-202.
    Named {
        /// Library name, for example `SG6043`.
        name: String,
    },
}

/// Layer-3 override for one station.
///
/// Overrides are matched to resolved stations by `span_ratio`; fields left as
/// `None` keep the layer-1/layer-2 value.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
pub struct StationOverride {
    /// Station position as `r / R`.
    pub span_ratio: f64,
    /// Replacement chord in mm.
    pub chord_mm: Option<f64>,
    /// Replacement twist in degrees.
    pub twist_deg: Option<f64>,
    /// Replacement airfoil.
    pub airfoil: Option<AirfoilSpec>,
}

/// Hub geometry.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
pub struct Hub {
    /// Hub outer diameter in mm.
    pub diameter_mm: f64,
    /// Shaft bore diameter in mm.
    pub bore_diameter_mm: f64,
    /// Hub length along the shaft in mm.
    pub length_mm: f64,
    /// Radial distance from the shaft axis to the D-flat face, in mm.
    ///
    /// Absent (`null` / omitted) for a plain round bore. When present it must
    /// be strictly between `0` and `bore_diameter_mm / 2`; the bore keeps its
    /// circular arc on the `x < d` side and a chord at `x = d` closes the D.
    #[serde(default)]
    #[ts(optional = nullable)]
    pub shaft_flat_radial_mm: Option<f64>,
}

impl Hub {
    /// Radial distance to the D-flat face, if a D-flat is requested.
    #[must_use]
    pub const fn shaft_flat(&self) -> Option<f64> {
        self.shaft_flat_radial_mm
    }
}

/// Manufacturing limits.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
pub struct Manufacturing {
    /// Smallest acceptable trailing-edge thickness in mm.
    pub min_trailing_edge_mm: f64,
    /// Nominal printed wall thickness in mm.
    pub wall_thickness_mm: f64,
}

/// Generates the canonical TypeScript type definitions for `blade-model` via
/// [`ts_rs::TS`].
///
/// The returned string is the exact content of `web/src/types/blade-model.ts`;
/// CI and integration tests compare the file on disk against this function to
/// prevent Rust/TypeScript schema drift (`T-106`).
#[must_use]
pub fn typescript_bindings() -> String {
    let mut out = String::from(
        "// AUTO-GENERATED by `blade-model::typescript_bindings` (ts-rs, T-106).\n\
         // Do not edit manually; run `cargo test -p blade-model --test ts_bindings` to verify.\n\n\
         export const SCHEMA_VERSION = 1 as const;\n\n",
    );

    let declarations = [
        Design::decl(),
        Rotor::decl(),
        Distributions::decl(),
        CurveSource::decl(),
        AirfoilStation::decl(),
        AirfoilSpec::decl(),
        StationOverride::decl(),
        Hub::decl(),
        Manufacturing::decl(),
        crate::ValidationIssue::decl(),
    ];

    for (index, decl) in declarations.iter().enumerate() {
        if index > 0 {
            out.push('\n');
        }
        out.push_str("export ");
        out.push_str(decl.trim());
        out.push('\n');
    }

    out
}
