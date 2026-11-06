//! Error types for `blade-aero`.

use thiserror::Error;

/// Errors returned by polar lookup, Viterna extrapolation, or BEM simulation.
#[derive(Debug, Clone, PartialEq, Error)]
pub enum AeroError {
    #[error("polar table '{name}' must contain at least one Reynolds sweep")]
    EmptyPolarTable { name: String },

    #[error("polar sweep for '{name}' at Re={reynolds} must contain at least 2 points across negative and positive stall angles")]
    InvalidPolarSweep { name: String, reynolds: f64 },

    #[error("polar sweep for '{name}' has non-increasing or non-finite alpha_deg values")]
    UnsortedAlphaGrid { name: String },

    #[error("polar sweep for '{name}' has non-positive or non-finite drag coefficient cd={cd}")]
    InvalidDragCoefficient { name: String, cd: f64 },

    #[error("invalid aspect ratio {aspect_ratio}: must be finite and > 0")]
    InvalidAspectRatio { aspect_ratio: f64 },

    #[error("non-finite query parameter ({field} = {value})")]
    NonFiniteInput { field: &'static str, value: f64 },

    #[error("failed to parse polar JSON: {0}")]
    InvalidJson(String),

    #[error("unknown airfoil polar '{0}'")]
    UnknownAirfoil(String),

    #[error("invalid operating point: {0}")]
    InvalidOperatingPoint(String),

    #[error("invalid generator specification: {0}")]
    InvalidGeneratorSpec(String),
}
