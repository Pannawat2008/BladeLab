#![deny(missing_docs)]
//! Geometry kernel for BladeLab.
//!
//! This crate is I/O-free, has no C/C++ dependencies and must compile for
//! `wasm32-unknown-unknown` as well as for native targets. All lengths are in
//! millimetres and all angles are in degrees at API boundaries; internal
//! trigonometric work converts to radians.
//!
//! Pipeline (T-003, T-004):
//! `Design` → `blade_model::resolve` → [`build_sections`] → [`loft`] →
//! [`BladeSurface`], the single source of truth for STL/3MF and STEP export
//! (`D-lead1-002`).

pub mod airfoil;
pub mod distribution;
pub mod error;
pub mod sections;
pub mod surface;

pub use airfoil::{Airfoil, Naca4, Point2};
pub use distribution::{cosine_spacing, MIN_SAMPLES};
pub use error::GeomError;
pub use sections::{build_sections, SECTION_SAMPLES_PER_SURFACE};
pub use surface::{loft, BladeSurface, Point3, Section3D, PASS_THROUGH_TOLERANCE_MM};
