#![deny(missing_docs)]
//! Tessellation and binary STL export for BladeLab.
//!
//! The crate consumes the single geometry source of truth
//! ([`blade_geom::BladeSurface`] from `blade_geom::loft`) and produces a closed
//! indexed triangle mesh plus STL bytes. It is I/O-free, has no C/C++
//! dependencies and compiles for `wasm32-unknown-unknown`.
//!
//! Pipeline (T-005):
//! `BladeSurface` → [`tessellate`] → [`Mesh`] → [`check_mesh`] →
//! [`write_stl`].
//!
//! # Example
//!
//! ```
//! use blade_model::{resolve, Design};
//!
//! let json = include_str!("../../../fixtures/naca4412-linear.json");
//! let design = Design::from_json(json).unwrap();
//! let blade = resolve(&design).unwrap();
//! let sections = blade_geom::build_sections(&blade).unwrap();
//! let surface = blade_geom::loft(&sections).unwrap();
//!
//! let mesh = blade_mesh::tessellate(&surface, &blade_mesh::MeshOptions::default()).unwrap();
//! let report = blade_mesh::check_mesh(&mesh);
//! assert!(report.is_valid_solid(), "{:?}", report.issues());
//!
//! // Binary STL: 84-byte prefix + 50 bytes per triangle.
//! let stl = blade_mesh::write_stl(&mesh);
//! assert_eq!(stl.len(), blade_mesh::stl_len(&mesh));
//! ```

pub mod error;
pub mod mesh;
pub mod stl;
pub mod tessellate;

pub use error::MeshError;
pub use mesh::{check_mesh, Mesh, MeshReport, Triangle};
pub use stl::{stl_len, write_stl};
pub use tessellate::{tessellate, MeshOptions};
