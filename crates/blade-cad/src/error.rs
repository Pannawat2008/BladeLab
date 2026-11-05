//! Errors returned by the CAD kernel.

use thiserror::Error;

/// Errors produced while building B-rep solids or writing STEP.
#[derive(Debug, Clone, PartialEq, Error)]
pub enum CadError {
    /// The blade surface does not have enough topology to form a solid.
    #[error("blade surface needs at least two sections, got {got}")]
    TooFewSections {
        /// Number of sections on the surface.
        got: usize,
    },

    /// A contour needs at least three points to bound a face.
    #[error("blade surface needs at least three contour points, got {got}")]
    TooFewContourPoints {
        /// Number of points per section.
        got: usize,
    },

    /// The surface and its control points disagree on dimensions.
    #[error("blade surface has {sections} sections but {control_rows} control rows")]
    InconsistentTopology {
        /// Number of sections reported by the surface.
        sections: usize,
        /// Number of control-point rows.
        control_rows: usize,
    },

    /// A coordinate was `NaN` or infinite.
    #[error("coordinate `{field}` is not finite ({value})")]
    NonFinite {
        /// Name of the offending coordinate.
        field: &'static str,
        /// The rejected value.
        value: f64,
    },

    /// The hub parameters do not describe a valid annular cylinder.
    #[error("invalid hub: {0}")]
    InvalidHub(String),

    /// The surface or curve could not be represented as a B-spline.
    #[error("geometry construction failed: {0}")]
    Geometry(String),

    /// Truck rejected the topology (open shell, non-manifold edge, ...).
    #[error("topology construction failed: {0}")]
    Topology(String),

    /// STEP serialisation failed.
    #[error("STEP serialisation failed: {0}")]
    Step(String),

    /// An error from the geometry kernel that produced the surface.
    #[error("geometry kernel error: {0}")]
    Geom(#[from] blade_geom::GeomError),
}
