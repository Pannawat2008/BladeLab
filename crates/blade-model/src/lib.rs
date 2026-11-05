#![deny(missing_docs)]
//! BladeLab design model: schema v1, validation and layer resolution.
//!
//! This crate is I/O-free, has no C/C++ dependencies and compiles for
//! `wasm32-unknown-unknown` as well as native targets. It is the single source
//! of truth for the design document; `blade-geom` consumes [`ResolvedBlade`].
//!
//! Pipeline: `Design` (JSON) → [`validate`] → [`resolve`] → [`ResolvedBlade`].

pub mod curve;
pub mod error;
pub mod resolve;
pub mod schema;
pub mod validate;

pub use curve::{eval_bezier, eval_formula};
pub use error::{ModelError, ValidationIssue};
pub use resolve::{resolve, ResolvedAirfoil, ResolvedBlade, ResolvedStation};
pub use schema::{
    typescript_bindings, AirfoilSpec, AirfoilStation, BezierControlPoint, CurveSource, Design,
    Distributions, Hub, Manufacturing, Rotor, StationOverride, SCHEMA_VERSION,
};
pub use validate::validate;

/// Tolerance for comparing normalised span positions (`r / R`).
///
/// Two station positions closer than this are treated as the same station when
/// de-duplicating resolved stations and matching layer-3 overrides.
pub const RATIO_EPS: f64 = 1e-9;
