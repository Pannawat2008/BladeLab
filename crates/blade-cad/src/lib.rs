#![deny(missing_docs)]
//! B-rep blade and hub solids with STEP export, backed by `truck`.
//!
//! This crate is native/server-side (§2): STEP is generated on the server, not
//! in the wasm bundle, so it may depend on a full CAD kernel. It implements the
//! §8 [`CadKernel`] contract and never performs boolean operations (F-lead1-002).
//!
//! # Example
//!
//! ```
//! use blade_cad::{CadKernel, TruckKernel};
//! use blade_geom::{build_sections, loft};
//! use blade_model::{resolve, Design};
//!
//! let json = include_str!("../../../fixtures/naca4412-linear.json");
//! let design = Design::from_json(json).unwrap();
//! let blade = resolve(&design).unwrap();
//! let sections = build_sections(&blade).unwrap();
//! let surface = loft(&sections).unwrap();
//!
//! let kernel = TruckKernel::new();
//! let solid = kernel.blade_solid(&surface).unwrap();
//! let step = kernel.write_step(&[solid]).unwrap();
//!
//! assert!(step.contains("MANIFOLD_SOLID_BREP"));
//! assert!(step.contains("SI_UNIT(.MILLI.,.METRE.)"));
//! ```

pub mod error;
pub mod kernel;

pub use error::CadError;
pub use kernel::{CadKernel, TruckKernel};
