//! Error type shared by every geometry routine.
//!
//! Every public function in this crate returns [`GeomError`] instead of
//! panicking, and never returns `NaN` or `Inf`.

use thiserror::Error;

/// Errors produced by the geometry kernel.
#[derive(Debug, Clone, PartialEq, Error)]
pub enum GeomError {
    /// A value that must be finite was `NaN` or infinite.
    #[error("`{field}` must be finite, got {value}")]
    NonFinite {
        /// Name of the offending parameter.
        field: &'static str,
        /// The rejected value.
        value: f64,
    },

    /// A value fell outside its documented inclusive/exclusive range.
    #[error("`{field}` must be within [{min}, {max}], got {value}")]
    OutOfRange {
        /// Name of the offending parameter.
        field: &'static str,
        /// The rejected value.
        value: f64,
        /// Inclusive lower bound.
        min: f64,
        /// Upper bound (`max` or `min` depending on the parameter, see docs).
        max: f64,
    },

    /// A chord length was zero, negative or not finite.
    #[error("chord must be a finite, strictly positive length in mm, got {0}")]
    InvalidChord(f64),

    /// Too few chordwise samples were requested.
    #[error("at least {min} chordwise samples are required, got {got}")]
    TooFewSamples {
        /// Smallest accepted sample count.
        min: usize,
        /// Requested sample count.
        got: usize,
    },

    /// A computed chordwise distribution was not strictly increasing.
    #[error("chordwise distribution is not strictly increasing at index {index}")]
    SpacingNotMonotonic {
        /// Index of the first station that is not greater than its predecessor.
        index: usize,
    },

    /// The trailing edge is thinner than the manufacturing threshold.
    #[error("trailing edge thickness {actual_mm} mm is below the required minimum {min_mm} mm")]
    TrailingEdgeTooThin {
        /// Measured trailing-edge thickness in mm.
        actual_mm: f64,
        /// Required minimum thickness in mm.
        min_mm: f64,
    },

    /// Not enough cross-sections were supplied for a loft.
    #[error("at least {min} sections are required for a loft, got {got}")]
    TooFewSections {
        /// Smallest accepted section count.
        min: usize,
        /// Supplied section count.
        got: usize,
    },

    /// Sections do not share the same point count.
    #[error("section {section} has {got} points but {expected} were expected")]
    TopologyMismatch {
        /// Index of the offending section.
        section: usize,
        /// Point count of the first section.
        expected: usize,
        /// Point count of the offending section.
        got: usize,
    },

    /// Section spans are not strictly increasing.
    #[error(
        "section spans must be strictly increasing; section {index} is not above its predecessor"
    )]
    SpansNotIncreasing {
        /// Index of the first section that breaks monotonicity.
        index: usize,
    },

    /// The spanwise B-spline interpolation matrix could not be factorised.
    #[error("the spanwise B-spline interpolation system is singular")]
    SingularSystem,

    /// A section index was outside the loft.
    #[error("section index {index} is out of range for {count} sections")]
    SectionIndexOutOfRange {
        /// Requested index.
        index: usize,
        /// Number of sections in the loft.
        count: usize,
    },

    /// A chordwise point index was outside the section topology.
    #[error("point index {index} is out of range for {count} points")]
    PointIndexOutOfRange {
        /// Requested index.
        index: usize,
        /// Number of points per section.
        count: usize,
    },

    /// Malformed `.dat` airfoil coordinate data or unknown library airfoil (`T-202`).
    #[error("invalid airfoil data: {0}")]
    InvalidAirfoilData(String),
}
