#![deny(missing_docs)]
//! Geometry kernel for BladeLab.
//!
//! This crate is I/O-free, has no C/C++ dependencies and must compile for
//! `wasm32-unknown-unknown` as well as for native targets. All lengths are in
//! millimetres and all angles are in degrees at API boundaries; internal
//! trigonometric work converts to radians.
//!
//! Current scope:
//! - T-003: continuous 4-digit NACA airfoils, cosine chordwise resampling and
//!   trailing-edge thickness checks ([`Naca4`], [`cosine_spacing`]).
//! - T-004 (geometry core): 3-D section placement and the spanwise B-spline
//!   loft ([`Section3D`], [`loft`]). The `build_sections(&ResolvedBlade)`
//!   adapter still waits for `blade-model` to expose `ResolvedBlade`.

pub mod airfoil;
pub mod distribution;
pub mod error;
pub mod surface;

pub use airfoil::{Airfoil, Naca4, Point2};
pub use distribution::{cosine_spacing, MIN_SAMPLES};
pub use error::GeomError;
pub use surface::{loft, BladeSurface, Point3, Section3D, PASS_THROUGH_TOLERANCE_MM};
