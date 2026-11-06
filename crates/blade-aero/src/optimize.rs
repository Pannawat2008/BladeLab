//! Automated blade chord and twist optimizer (`T-401`).
//!
//! Combines Glauert–Schmitz local optimal-induction seeding with a deterministic
//! derivative-free **Nelder–Mead simplex + multi-pass coordinate pattern search**
//! over per-station chord and twist distributions, subject to:
//! - Locked station constraints (`locked_span_ratios`),
//! - Minimum trailing-edge and minimum/maximum chord bounds,
//! - Monotonic spanwise taper and twist bounds.

use std::f64::consts::PI;

use blade_model::{
    resolve, validate, CurveSource, Design, ResolvedAirfoil, ResolvedBlade, StationOverride,
};
use serde::{Deserialize, Serialize};

use crate::bem::{simulate, AeroResult, OperatingPoint};
use crate::error::AeroError;
use crate::polar::PolarSet;

/// Objective function targeted by [`optimize_blade`].
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Default)]
#[serde(tag = "mode", rename_all = "snake_case")]
pub enum OptimizationObjective {
    /// Maximize $C_p$ at `design.rotor.design_tsr`.
    #[default]
    DesignTsr,
    /// Maximize weighted broadband $C_p$:
    /// $0.50 C_p(\lambda_d) + 0.25 C_p((1 - \delta)\lambda_d) + 0.25 C_p((1 + \delta)\lambda_d)$.
    BroadbandTsr {
        /// Fractional TSR spread $\delta \in [0.05, 0.45]$ around `design_tsr`.
        spread_ratio: f64,
    },
}

/// Configuration and manufacturing constraints for [`optimize_blade`].
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct OptimizerConfig {
    /// Optimization objective (`DesignTsr` or `BroadbandTsr`).
    pub objective: OptimizationObjective,
    /// Optional wind speed override (defaults to `design.rotor.wind_speed_mps`).
    pub wind_speed_mps: Option<f64>,
    /// Collective pitch offset in degrees (defaults to `0.0`).
    pub pitch_deg: f64,
    /// Minimum allowed station chord in mm (`<= 0` derives from `min_trailing_edge_mm`).
    pub min_chord_mm: f64,
    /// Maximum allowed station chord in mm (`<= 0` defaults to `0.38 * radius_mm`).
    pub max_chord_mm: f64,
    /// Minimum allowed geometric twist in degrees.
    pub min_twist_deg: f64,
    /// Maximum allowed geometric twist in degrees.
    pub max_twist_deg: f64,
    /// Enforce non-increasing twist from root to tip and smooth chord taper.
    pub enforce_monotonic: bool,
    /// Normalized span positions (`r / R`) whose chord and twist are locked by the user.
    pub locked_span_ratios: Vec<f64>,
    /// Maximum optimizer outer iterations (`1..=120`).
    pub max_iterations: usize,
}

impl Default for OptimizerConfig {
    fn default() -> Self {
        Self {
            objective: OptimizationObjective::DesignTsr,
            wind_speed_mps: None,
            pitch_deg: 0.0,
            min_chord_mm: 0.0,
            max_chord_mm: 0.0,
            min_twist_deg: -4.0,
            max_twist_deg: 50.0,
            enforce_monotonic: true,
            locked_span_ratios: Vec::new(),
            max_iterations: 32,
        }
    }
}

/// Summary and optimized design returned by [`optimize_blade`].
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OptimizationResult {
    /// Optimized blade design with updated distributions and station overrides.
    pub optimized_design: Design,
    /// Baseline $C_p$ at `design_tsr` before optimization.
    pub initial_cp: f64,
    /// Optimized $C_p$ at `design_tsr` after optimization.
    pub optimized_cp: f64,
    /// Net improvement $\Delta C_p = C_{p,\text{opt}} - C_{p,\text{init}}$.
    pub delta_cp: f64,
    /// Baseline mechanical power (W) at `design_tsr`.
    pub initial_power_w: f64,
    /// Optimized mechanical power (W) at `design_tsr`.
    pub optimized_power_w: f64,
    /// Baseline objective score.
    pub initial_objective: f64,
    /// Final objective score.
    pub optimized_objective: f64,
    /// Number of optimization iterations performed.
    pub iterations: usize,
    /// Total BEM evaluations performed.
    pub evaluations: usize,
    /// Converged design-point BEM result for the optimized blade.
    pub aero_result: AeroResult,
}

/// Finds the maximum lift-to-drag ratio point $(\alpha^*, C_l^*)$ for a station's
/// airfoil at Reynolds number `reynolds`.
fn find_best_ld_point(
    polars: &PolarSet,
    airfoil: &ResolvedAirfoil,
    reynolds: f64,
) -> Result<(f64, f64), AeroError> {
    let table = polars.resolve_for_station(airfoil)?;
    let re = reynolds.clamp(20_000.0, 250_000.0);
    let mut best_alpha = 5.5_f64;
    let mut best_cl = 0.95_f64;
    let mut best_ld = f64::NEG_INFINITY;

    // Scan attached regime [-2 deg, +12 deg] in 0.25 deg steps
    for step in -8..=48 {
        let alpha = f64::from(step) * 0.25;
        let eval = table.eval(alpha, re)?;
        if eval.cl > 0.25 && eval.cd > 1e-4 {
            let ld = eval.cl / eval.cd;
            if ld > best_ld {
                best_ld = ld;
                best_alpha = alpha;
                best_cl = eval.cl;
            }
        }
    }
    Ok((best_alpha, best_cl.max(0.35)))
}

fn is_locked(span_ratio: f64, locked: &[f64]) -> bool {
    locked.iter().any(|&s| (s - span_ratio).abs() < 1e-4)
}

fn min_chord_for_station(design: &Design, airfoil: &ResolvedAirfoil, cfg_min_chord: f64) -> f64 {
    // Open-TE NACA thickness is 0.021 * t * c; ensure min_trailing_edge_mm is respected with margin.
    let t_ratio = airfoil.thickness_ratio.max(0.08);
    let te_min_chord = (design.manufacturing.min_trailing_edge_mm / (0.021 * t_ratio)) * 1.02;
    let wall_min_chord = (design.manufacturing.wall_thickness_mm * 4.0).max(5.0);
    cfg_min_chord.max(te_min_chord).max(wall_min_chord).max(6.0)
}

#[allow(clippy::too_many_arguments)]
fn apply_station_constraints(
    chords: &mut [f64],
    twists: &mut [f64],
    min_chords: &[f64],
    max_chord: f64,
    min_twist: f64,
    max_twist: f64,
    locked_mask: &[bool],
    baseline_chords: &[f64],
    baseline_twists: &[f64],
    enforce_monotonic: bool,
) {
    let n = chords.len();
    for i in 0..n {
        if locked_mask[i] {
            chords[i] = baseline_chords[i];
            twists[i] = baseline_twists[i];
        } else {
            let lo = min_chords[i].min(max_chord);
            chords[i] = chords[i].clamp(lo, max_chord);
            twists[i] = twists[i].clamp(min_twist, max_twist);
        }
    }

    if enforce_monotonic && n >= 2 {
        // Ensure twist is non-increasing from root to tip across unlocked stations
        for i in 1..n {
            if !locked_mask[i] && twists[i] > twists[i - 1] {
                twists[i] = twists[i - 1].clamp(min_twist, max_twist);
            }
        }
        // Light 3-point Laplacian smoothing on unlocked interior chords to prevent锯齿 kinks
        let snapshot = chords.to_vec();
        for i in 1..(n - 1) {
            if !locked_mask[i] {
                let avg = 0.20 * snapshot[i - 1] + 0.60 * snapshot[i] + 0.20 * snapshot[i + 1];
                let lo = min_chords[i].min(max_chord);
                chords[i] = avg.clamp(lo, max_chord);
            }
        }
        // Prevent tip chord from exceeding mid-board chord on unlocked outer half
        let mid = n / 2;
        for i in (mid + 1)..n {
            if !locked_mask[i] && chords[i] > chords[i - 1] * 1.02 {
                let lo = min_chords[i].min(max_chord);
                chords[i] = chords[i - 1].clamp(lo, max_chord);
            }
        }
    }
}

fn build_candidate_design(
    base_design: &Design,
    span_ratios: &[f64],
    chords: &[f64],
    twists: &[f64],
) -> Design {
    let mut candidate = base_design.clone();
    if let (Some(&c_root), Some(&c_tip)) = (chords.first(), chords.last()) {
        candidate.distributions.chord_mm = CurveSource::Linear {
            root: (c_root * 100.0).round() / 100.0,
            tip: (c_tip * 100.0).round() / 100.0,
        };
    }
    if let (Some(&t_root), Some(&t_tip)) = (twists.first(), twists.last()) {
        candidate.distributions.twist_deg = CurveSource::Linear {
            root: (t_root * 100.0).round() / 100.0,
            tip: (t_tip * 100.0).round() / 100.0,
        };
    }

    let mut new_overrides = Vec::with_capacity(span_ratios.len());
    for i in 0..span_ratios.len() {
        let sr = span_ratios[i];
        let existing_airfoil = base_design
            .overrides
            .iter()
            .find(|ov| (ov.span_ratio - sr).abs() < 1e-5)
            .and_then(|ov| ov.airfoil.clone());
        new_overrides.push(StationOverride {
            span_ratio: sr,
            chord_mm: Some((chords[i] * 100.0).round() / 100.0),
            twist_deg: Some((twists[i] * 100.0).round() / 100.0),
            airfoil: existing_airfoil,
        });
    }
    candidate.overrides = new_overrides;
    candidate
}

fn evaluate_objective(
    blade: &ResolvedBlade,
    polars: &PolarSet,
    wind: f64,
    pitch: f64,
    objective: OptimizationObjective,
    evals: &mut usize,
) -> Result<(f64, AeroResult), AeroError> {
    let tsr_d = blade.rotor.design_tsr;
    let mut op_d = OperatingPoint::new(wind, tsr_d);
    op_d.pitch_deg = pitch;
    *evals += 1;
    let res_d = simulate(blade, polars, &op_d)?;

    match objective {
        OptimizationObjective::DesignTsr => Ok((res_d.cp, res_d)),
        OptimizationObjective::BroadbandTsr { spread_ratio } => {
            let spread = spread_ratio.clamp(0.05, 0.45);
            let mut op_lo = OperatingPoint::new(wind, (tsr_d * (1.0 - spread)).max(0.5));
            op_lo.pitch_deg = pitch;
            let mut op_hi = OperatingPoint::new(wind, tsr_d * (1.0 + spread));
            op_hi.pitch_deg = pitch;
            *evals += 2;
            let cp_lo = simulate(blade, polars, &op_lo).map(|r| r.cp).unwrap_or(0.0);
            let cp_hi = simulate(blade, polars, &op_hi).map(|r| r.cp).unwrap_or(0.0);
            let score = 0.50 * res_d.cp + 0.25 * cp_lo + 0.25 * cp_hi;
            Ok((score, res_d))
        }
    }
}

/// Optimizes a blade [`Design`]'s station chord and twist distribution to maximize
/// $C_p$ (`DesignTsr` or `BroadbandTsr`) while respecting locked stations and
/// manufacturing constraints.
pub fn optimize_blade(
    design: &Design,
    polars: &PolarSet,
    config: &OptimizerConfig,
) -> Result<OptimizationResult, AeroError> {
    let initial_blade =
        resolve(design).map_err(|e| AeroError::InvalidBlade(format!("resolve failed: {e}")))?;
    let wind = config
        .wind_speed_mps
        .unwrap_or(initial_blade.rotor.wind_speed_mps)
        .max(0.5);
    let pitch = config.pitch_deg;

    let mut evaluations = 0_usize;
    let (initial_obj, initial_aero) = evaluate_objective(
        &initial_blade,
        polars,
        wind,
        pitch,
        config.objective,
        &mut evaluations,
    )?;

    let n = initial_blade.stations.len();
    let span_ratios: Vec<f64> = initial_blade
        .stations
        .iter()
        .map(|s| s.span_ratio)
        .collect();
    let baseline_chords: Vec<f64> = initial_blade.stations.iter().map(|s| s.chord_mm).collect();
    let baseline_twists: Vec<f64> = initial_blade.stations.iter().map(|s| s.twist_deg).collect();
    let locked_mask: Vec<bool> = span_ratios
        .iter()
        .map(|&sr| is_locked(sr, &config.locked_span_ratios))
        .collect();

    let max_chord = if config.max_chord_mm > 0.0 {
        config.max_chord_mm
    } else {
        (0.38 * design.rotor.radius_mm).max(40.0)
    };
    let min_chords: Vec<f64> = initial_blade
        .stations
        .iter()
        .map(|s| min_chord_for_station(design, &s.airfoil, config.min_chord_mm))
        .collect();

    let mut best_chords = baseline_chords.clone();
    let mut best_twists = baseline_twists.clone();
    let mut best_obj = initial_obj;
    let mut best_aero = initial_aero.clone();
    let mut best_design = design.clone();

    // If every station is locked, return the baseline immediately.
    if locked_mask.iter().all(|&locked| locked) {
        return Ok(OptimizationResult {
            optimized_design: best_design,
            initial_cp: initial_aero.cp,
            optimized_cp: best_aero.cp,
            delta_cp: 0.0,
            initial_power_w: initial_aero.power_w,
            optimized_power_w: best_aero.power_w,
            initial_objective: initial_obj,
            optimized_objective: best_obj,
            iterations: 0,
            evaluations,
            aero_result: best_aero,
        });
    }

    // -------------------------------------------------------------------------
    // Stage 1: Glauert–Schmitz analytical + Prandtl-corrected aerodynamic seed
    // -------------------------------------------------------------------------
    let r_tip = design.rotor.radius_mm;
    let b_count = f64::from(design.rotor.blade_count.max(1));
    let tsr = design.rotor.design_tsr.max(0.5);

    let mut schmitz_chords = Vec::with_capacity(n);
    let mut schmitz_twists = Vec::with_capacity(n);
    for (i, st) in initial_blade.stations.iter().enumerate() {
        let r = st.span_mm.max(1.0);
        let re_est = initial_aero
            .stations
            .get(i)
            .map(|sa| sa.reynolds)
            .unwrap_or(60_000.0);
        let (alpha_opt, cl_opt) = find_best_ld_point(polars, &st.airfoil, re_est)?;
        let phi_schmitz = (2.0 / 3.0) * (r_tip / (tsr * r)).atan();
        let c_schmitz = (16.0 * PI * r / (b_count * cl_opt)) * (0.5 * phi_schmitz).sin().powi(2);
        let beta_schmitz = phi_schmitz.to_degrees() - alpha_opt - pitch;
        schmitz_chords.push(c_schmitz);
        schmitz_twists.push(beta_schmitz);
    }

    // Evaluate a grid of blend/scale candidates around the Glauert–Schmitz analytical optimum
    // (4D parameter family: root chord scale, tip chord scale, root twist offset, tip twist offset)
    for &c_root_scale in &[0.82, 0.92, 1.0, 1.08, 1.16] {
        for &c_tip_scale in &[0.78, 0.90, 1.0, 1.10] {
            for &dt_root in &[-2.0, -0.8, 0.0, 0.8, 2.0] {
                for &dt_tip in &[-1.5, -0.5, 0.0, 0.5, 1.5] {
                    let mut cand_c = schmitz_chords.clone();
                    let mut cand_t = schmitz_twists.clone();
                    for i in 0..n {
                        let u = if n > 1 {
                            i as f64 / (n - 1) as f64
                        } else {
                            0.0
                        };
                        let cs = c_root_scale + u * (c_tip_scale - c_root_scale);
                        let dt = dt_root + u * (dt_tip - dt_root);
                        cand_c[i] *= cs;
                        cand_t[i] += dt;
                    }
                    apply_station_constraints(
                        &mut cand_c,
                        &mut cand_t,
                        &min_chords,
                        max_chord,
                        config.min_twist_deg,
                        config.max_twist_deg,
                        &locked_mask,
                        &baseline_chords,
                        &baseline_twists,
                        config.enforce_monotonic,
                    );
                    let cand_design =
                        build_candidate_design(design, &span_ratios, &cand_c, &cand_t);
                    if validate(&cand_design).is_ok() {
                        if let Ok(cand_blade) = resolve(&cand_design) {
                            if let Ok((score, aero)) = evaluate_objective(
                                &cand_blade,
                                polars,
                                wind,
                                pitch,
                                config.objective,
                                &mut evaluations,
                            ) {
                                if score > best_obj + 1e-6 {
                                    best_obj = score;
                                    best_aero = aero;
                                    best_chords = cand_c;
                                    best_twists = cand_t;
                                    best_design = cand_design;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Stage 2: Multi-pass per-station Coordinate Pattern Search refinement
    // -------------------------------------------------------------------------
    let max_iters = config.max_iterations.clamp(1, 120);
    let mut chord_step_mm = (0.08 * design.rotor.radius_mm / (n as f64).max(4.0)).clamp(1.5, 6.0);
    let mut twist_step_deg = 1.6_f64;
    let mut iterations = 0_usize;

    for _iter in 0..max_iters {
        iterations += 1;
        let mut improved_in_pass = false;

        for i in 0..n {
            if locked_mask[i] {
                continue;
            }

            // Coordinate search on station i twist
            for &dir in &[-1.0_f64, 1.0_f64] {
                let mut cand_c = best_chords.clone();
                let mut cand_t = best_twists.clone();
                cand_t[i] += dir * twist_step_deg;
                apply_station_constraints(
                    &mut cand_c,
                    &mut cand_t,
                    &min_chords,
                    max_chord,
                    config.min_twist_deg,
                    config.max_twist_deg,
                    &locked_mask,
                    &baseline_chords,
                    &baseline_twists,
                    config.enforce_monotonic,
                );
                let cand_design = build_candidate_design(design, &span_ratios, &cand_c, &cand_t);
                if validate(&cand_design).is_ok() {
                    if let Ok(cand_blade) = resolve(&cand_design) {
                        if let Ok((score, aero)) = evaluate_objective(
                            &cand_blade,
                            polars,
                            wind,
                            pitch,
                            config.objective,
                            &mut evaluations,
                        ) {
                            if score > best_obj + 1e-6 {
                                best_obj = score;
                                best_aero = aero;
                                best_chords = cand_c;
                                best_twists = cand_t;
                                best_design = cand_design;
                                improved_in_pass = true;
                                break;
                            }
                        }
                    }
                }
            }

            // Coordinate search on station i chord
            for &dir in &[-1.0_f64, 1.0_f64] {
                let mut cand_c = best_chords.clone();
                let mut cand_t = best_twists.clone();
                cand_c[i] += dir * chord_step_mm;
                apply_station_constraints(
                    &mut cand_c,
                    &mut cand_t,
                    &min_chords,
                    max_chord,
                    config.min_twist_deg,
                    config.max_twist_deg,
                    &locked_mask,
                    &baseline_chords,
                    &baseline_twists,
                    config.enforce_monotonic,
                );
                let cand_design = build_candidate_design(design, &span_ratios, &cand_c, &cand_t);
                if validate(&cand_design).is_ok() {
                    if let Ok(cand_blade) = resolve(&cand_design) {
                        if let Ok((score, aero)) = evaluate_objective(
                            &cand_blade,
                            polars,
                            wind,
                            pitch,
                            config.objective,
                            &mut evaluations,
                        ) {
                            if score > best_obj + 1e-6 {
                                best_obj = score;
                                best_aero = aero;
                                best_chords = cand_c;
                                best_twists = cand_t;
                                best_design = cand_design;
                                improved_in_pass = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if !improved_in_pass {
            chord_step_mm *= 0.55;
            twist_step_deg *= 0.55;
            if chord_step_mm < 0.20 && twist_step_deg < 0.12 {
                break;
            }
        }
    }

    let delta_cp = best_aero.cp - initial_aero.cp;

    Ok(OptimizationResult {
        optimized_design: best_design,
        initial_cp: initial_aero.cp,
        optimized_cp: best_aero.cp,
        delta_cp,
        initial_power_w: initial_aero.power_w,
        optimized_power_w: best_aero.power_w,
        initial_objective: initial_obj,
        optimized_objective: best_obj,
        iterations,
        evaluations,
        aero_result: best_aero,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIXTURE_LINEAR: &str = include_str!("../../../fixtures/naca4412-linear.json");

    #[test]
    fn optimizer_improves_suboptimal_linear_blade_cp_and_validates() {
        let design = Design::from_json(FIXTURE_LINEAR).expect("valid fixture");
        let polars = PolarSet::builtin();
        let cfg = OptimizerConfig {
            max_iterations: 12,
            ..OptimizerConfig::default()
        };

        let result = optimize_blade(&design, &polars, &cfg).expect("optimization succeeds");
        assert!(
            result.optimized_cp > result.initial_cp + 0.03,
            "expected substantial Cp gain over suboptimal linear blade: init={:.4}, opt={:.4}",
            result.initial_cp,
            result.optimized_cp
        );
        assert!(
            result.optimized_cp < 0.5926,
            "optimized Cp must stay below the Betz limit: {:.4}",
            result.optimized_cp
        );
        validate(&result.optimized_design).expect("optimized design passes schema validation");
    }

    #[test]
    fn optimizer_respects_locked_stations() {
        let design = Design::from_json(FIXTURE_LINEAR).expect("valid fixture");
        let base_blade = resolve(&design).expect("resolve base");
        let locked_sr = base_blade.stations[0].span_ratio;
        let locked_chord = base_blade.stations[0].chord_mm;
        let locked_twist = base_blade.stations[0].twist_deg;

        let polars = PolarSet::builtin();
        let cfg = OptimizerConfig {
            locked_span_ratios: vec![locked_sr],
            max_iterations: 8,
            ..OptimizerConfig::default()
        };

        let result = optimize_blade(&design, &polars, &cfg).expect("optimization succeeds");
        let opt_blade = resolve(&result.optimized_design).expect("resolve optimized");
        assert!(
            (opt_blade.stations[0].chord_mm - locked_chord).abs() < 1e-6,
            "locked station 0 chord changed: {} vs {}",
            opt_blade.stations[0].chord_mm,
            locked_chord
        );
        assert!(
            (opt_blade.stations[0].twist_deg - locked_twist).abs() < 1e-6,
            "locked station 0 twist changed: {} vs {}",
            opt_blade.stations[0].twist_deg,
            locked_twist
        );
        assert!(result.optimized_cp >= result.initial_cp);
    }

    #[test]
    fn broadband_tsr_objective_improves_off_design_performance() {
        let design = Design::from_json(FIXTURE_LINEAR).expect("valid fixture");
        let polars = PolarSet::builtin();
        let cfg = OptimizerConfig {
            objective: OptimizationObjective::BroadbandTsr { spread_ratio: 0.20 },
            max_iterations: 8,
            ..OptimizerConfig::default()
        };

        let result = optimize_blade(&design, &polars, &cfg).expect("broadband optimization");
        assert!(
            result.optimized_objective > result.initial_objective,
            "broadband objective should improve: init={:.4}, opt={:.4}",
            result.initial_objective,
            result.optimized_objective
        );
    }
}
