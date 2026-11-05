//! Errors returned by tessellation and mesh inspection.

use thiserror::Error;

/// Errors produced while turning a [`blade_geom::BladeSurface`] into a mesh.
#[derive(Debug, Clone, PartialEq, Error)]
pub enum MeshError {
    /// A closed tube needs at least two span sections.
    #[error("tessellation needs at least two sections, got {got}")]
    TooFewSections {
        /// Number of sections found on the surface.
        got: usize,
    },

    /// A contour needs at least three points to enclose an area.
    #[error("each contour needs at least {min} points, got {got}")]
    TooFewContourPoints {
        /// Smallest accepted contour point count.
        min: usize,
        /// Point count found on the surface.
        got: usize,
    },

    /// A vertex coordinate was `NaN` or infinite.
    #[error("vertex {index} is not finite")]
    NonFiniteVertex {
        /// Index of the offending vertex in the vertex buffer.
        index: usize,
    },

    /// The vertex buffer does not fit the `u32` indices used by STL and GPUs.
    #[error("vertex count exceeds the u32 index range")]
    TooManyVertices,

    /// The triangle count does not fit the `u32` count field of binary STL.
    #[error("triangle count exceeds the u32 limit of binary STL")]
    TooManyTriangles,

    /// The cap polygon of a section could not be triangulated.
    #[error("could not triangulate the cap polygon of section {section}")]
    CapTriangulation {
        /// Section index whose contour failed ear clipping.
        section: usize,
    },

    /// An error from the geometry kernel while reading the surface.
    #[error("geometry kernel error: {0}")]
    Geom(#[from] blade_geom::GeomError),
}
