//! Errors and validation issues produced by `blade-model`.

use serde::{Deserialize, Serialize};
use thiserror::Error;
use ts_rs::TS;

/// One semantic problem inside a [`crate::Design`].
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
pub struct ValidationIssue {
    /// JSON-ish path of the offending field, for example `rotor.radius_mm`.
    pub path: String,
    /// Human-readable explanation.
    pub message: String,
}

impl ValidationIssue {
    /// Creates a new issue.
    #[must_use]
    pub fn new(path: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            path: path.into(),
            message: message.into(),
        }
    }
}

impl std::fmt::Display for ValidationIssue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.path, self.message)
    }
}

/// Errors returned by model operations.
#[derive(Debug, Error)]
pub enum ModelError {
    /// The design failed semantic validation; every issue is reported.
    #[error("design validation failed with {} issue(s)", .0.len())]
    Invalid(Vec<ValidationIssue>),

    /// The design references an airfoil that is not in the library yet.
    #[error("airfoil '{0}' is not supported yet (library lands in T-202)")]
    UnsupportedAirfoil(String),

    /// No airfoil station covers a resolved station (should be unreachable
    /// after validation).
    #[error("no airfoil covers span ratio {0}")]
    MissingAirfoil(f64),

    /// The JSON payload could not be parsed.
    #[error("invalid design JSON: {0}")]
    Json(#[from] serde_json::Error),

    /// The payload declares a schema version this build does not understand.
    #[error("schema version {found} is not supported (expected {supported})")]
    UnsupportedSchema {
        /// Version found in the payload.
        found: u32,
        /// Version supported by this build.
        supported: u32,
    },
}
