#![deny(missing_docs)]
//! Geometry kernel for BladeLab.
//!
//! This crate is I/O-free, has no C/C++ dependencies and must compile for
//! `wasm32-unknown-unknown` as well as for native targets. All lengths are in
//! millimetres and all angles are in degrees at API boundaries; internal
//! trigonometric work converts to radians.
//!
//! Current scope (T-003): continuous 4-digit NACA airfoils, cosine chordwise
//! resampling and trailing-edge thickness checks. The B-spline skinning loft
//! (`loft`) and `build_sections` depend on `blade-model` types and are added by
//! T-004 once `blade-model` exposes `ResolvedBlade`.

pub mod airfoil;
pub mod distribution;
pub mod error;

pub use airfoil::{Airfoil, Naca4, Point2};
pub use distribution::{cosine_spacing, MIN_SAMPLES};
pub use error::GeomError;
