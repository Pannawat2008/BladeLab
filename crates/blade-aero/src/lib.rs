//! `blade-aero` — Aerodynamic polar tables, Viterna–Corrigan 360-degree post-stall
//! extrapolation (`T-301`), BEM solver (`T-302`), and generator matching (`T-303`).
//!
//! Pure `f64` computational crate: zero filesystem or network I/O, compiles cleanly
//! to `wasm32-unknown-unknown` (`F-lead1-001`).

#![forbid(unsafe_code)]

pub mod bem;
pub mod error;
pub mod generator;
pub mod polar;
pub mod viterna;

pub use bem::{
    brent_root, glauert_buhl_axial_induction, prandtl_loss_factor, simulate, simulate_tsr_sweep,
    AeroResult, OperatingPoint, StationAero, TsrSweepPoint, DEFAULT_AIR_DENSITY_KG_M3,
    DEFAULT_KINEMATIC_VISCOSITY_M2_S, GLAUERT_CRITICAL_A,
};
pub use error::AeroError;
pub use generator::{
    eval_generator_at_rpm, match_generator, sweep_generator_load, GeneratorMatchResult,
    GeneratorSpec, GeneratorState,
};
pub use polar::{PolarSet, PolarSweepSpec, PolarTable, PolarTableSpec, BUILTIN_POLAR_NAMES};
pub use viterna::{viterna_cd_max, wrap_alpha_deg, PolarEval, PolarPoint, ViternaSweep};
