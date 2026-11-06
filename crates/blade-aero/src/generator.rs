//! Permanent-magnet / brushless generator model and BEM rotor–generator matching (`T-303`).
//!
//! Couples a generator characterized by speed constant $K_v$ (RPM/V), internal
//! winding resistance $R_{\text{int}}$ ($\Omega$), no-load current $I_0$ (A), and
//! gear ratio $G$ to the BEM aerodynamic rotor (`T-302`) across arbitrary resistive
//! load curves.

use std::f64::consts::PI;

use blade_model::ResolvedBlade;
use serde::{Deserialize, Serialize};

use crate::bem::{brent_root, simulate, AeroResult, OperatingPoint};
use crate::error::AeroError;
use crate::polar::PolarSet;

/// Electromechanical specification of a permanent-magnet / brushless generator.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct GeneratorSpec {
    /// Motor/generator speed constant $K_v$ in RPM per Volt ($> 0$).
    pub kv_rpm_per_v: f64,
    /// Equivalent phase-to-phase / rectified internal winding resistance $R_{\text{int}}$ in $\Omega$ ($> 0$).
    pub internal_resistance_ohm: f64,
    /// No-load iron/friction loss current $I_0$ in Amperes ($\ge 0$).
    pub no_load_current_a: f64,
    /// Step-up gear ratio $G = \Omega_{\text{gen}} / \Omega_{\text{rotor}}$ ($> 0$, `1.0` for direct drive).
    pub gear_ratio: f64,
}

impl GeneratorSpec {
    /// Creates a direct-drive (`gear_ratio = 1.0`) generator specification.
    #[must_use]
    pub fn new(kv_rpm_per_v: f64, internal_resistance_ohm: f64, no_load_current_a: f64) -> Self {
        Self {
            kv_rpm_per_v,
            internal_resistance_ohm,
            no_load_current_a,
            gear_ratio: 1.0,
        }
    }

    /// Validates that all generator parameters are finite and in physical bounds.
    pub fn validate(&self) -> Result<(), AeroError> {
        if !self.kv_rpm_per_v.is_finite() || self.kv_rpm_per_v <= 0.0 {
            return Err(AeroError::InvalidGeneratorSpec(
                "kv_rpm_per_v must be finite and > 0".into(),
            ));
        }
        if !self.internal_resistance_ohm.is_finite() || self.internal_resistance_ohm <= 0.0 {
            return Err(AeroError::InvalidGeneratorSpec(
                "internal_resistance_ohm must be finite and > 0".into(),
            ));
        }
        if !self.no_load_current_a.is_finite() || self.no_load_current_a < 0.0 {
            return Err(AeroError::InvalidGeneratorSpec(
                "no_load_current_a must be finite and >= 0".into(),
            ));
        }
        if !self.gear_ratio.is_finite() || self.gear_ratio <= 0.0 {
            return Err(AeroError::InvalidGeneratorSpec(
                "gear_ratio must be finite and > 0".into(),
            ));
        }
        Ok(())
    }

    /// Back-EMF / electromagnetic torque constant $K_t = K_e = \frac{60}{2\pi K_v}$
    /// in $\text{V}/(\text{rad/s}) = \text{N}\cdot\text{m}/\text{A}$.
    #[must_use]
    pub fn kt_nm_per_a(&self) -> f64 {
        60.0 / (2.0 * PI * self.kv_rpm_per_v)
    }
}

/// Instantaneous electrical and mechanical operating state of the generator.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct GeneratorState {
    /// Rotor shaft speed in RPM.
    pub rotor_rpm: f64,
    /// Generator shaft speed $\text{RPM}_{\text{gen}} = G \cdot \text{RPM}_{\text{rotor}}$.
    pub generator_rpm: f64,
    /// External resistive load $R_{\text{load}}$ in $\Omega$.
    pub load_resistance_ohm: f64,
    /// Open-circuit back-EMF voltage $V_{\text{emf}} = \text{RPM}_{\text{gen}} / K_v$ in Volts.
    pub back_emf_v: f64,
    /// Terminal voltage across the load $V_{\text{load}} = V_{\text{emf}} - I R_{\text{int}}$ in Volts.
    pub terminal_voltage_v: f64,
    /// Load current $I = V_{\text{emf}} / (R_{\text{int}} + R_{\text{load}})$ in Amperes.
    pub current_a: f64,
    /// Counter-torque reflected to the rotor shaft $Q_{\text{gen}}$ in N·m.
    pub torque_nm: f64,
    /// Mechanical shaft power absorbed by the generator $P_{\text{mech}}$ in Watts.
    pub mechanical_power_w: f64,
    /// Useful electrical output power delivered to the load $P_{\text{elec}} = V_{\text{load}} I$ in Watts.
    pub electrical_power_w: f64,
    /// Winding ohmic loss $P_{\text{copper}} = I^2 R_{\text{int}}$ in Watts.
    pub copper_loss_w: f64,
    /// Generator conversion efficiency $\eta_{\text{gen}} = P_{\text{elec}} / P_{\text{mech}} \in [0, 1]$.
    pub efficiency: f64,
}

/// Coupled rotor–generator equilibrium operating point at a given wind speed and load.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GeneratorMatchResult {
    /// Converged tip speed ratio $\lambda^*$ where $Q_{\text{aero}}(\lambda^*) = Q_{\text{gen}}(\lambda^*)$.
    pub tip_speed_ratio: f64,
    /// Electrical and mechanical generator state at equilibrium.
    pub generator: GeneratorState,
    /// Full BEM aerodynamic solution at the equilibrium TSR.
    pub aero: AeroResult,
    /// Overall wind-to-electric power coefficient $C_{p,\text{elec}} = C_p \cdot \eta_{\text{gen}}$.
    pub net_cp_electrical: f64,
}

/// Evaluates the generator electrical state and shaft reaction torque at a given
/// `rotor_rpm` and external `load_resistance_ohm`.
pub fn eval_generator_at_rpm(
    spec: &GeneratorSpec,
    rotor_rpm: f64,
    load_resistance_ohm: f64,
) -> Result<GeneratorState, AeroError> {
    spec.validate()?;
    if !rotor_rpm.is_finite() || rotor_rpm < 0.0 {
        return Err(AeroError::NonFiniteInput {
            field: "rotor_rpm",
            value: rotor_rpm,
        });
    }
    if !load_resistance_ohm.is_finite() || load_resistance_ohm <= 0.0 {
        return Err(AeroError::NonFiniteInput {
            field: "load_resistance_ohm",
            value: load_resistance_ohm,
        });
    }

    let generator_rpm = rotor_rpm * spec.gear_ratio;
    let omega_rotor = rotor_rpm * 2.0 * PI / 60.0;
    let kt = spec.kt_nm_per_a();

    let back_emf_v = generator_rpm / spec.kv_rpm_per_v;
    let total_r = spec.internal_resistance_ohm + load_resistance_ohm;
    let current_a = back_emf_v / total_r;
    let terminal_voltage_v = current_a * load_resistance_ohm;

    let electrical_power_w = terminal_voltage_v * current_a;
    let copper_loss_w = current_a * current_a * spec.internal_resistance_ohm;

    let torque_nm = if rotor_rpm > 0.0 {
        spec.gear_ratio * kt * (current_a + spec.no_load_current_a)
    } else {
        0.0
    };
    let mechanical_power_w = torque_nm * omega_rotor;
    let efficiency = if mechanical_power_w > 1e-12 {
        (electrical_power_w / mechanical_power_w).clamp(0.0, 1.0)
    } else {
        0.0
    };

    Ok(GeneratorState {
        rotor_rpm,
        generator_rpm,
        load_resistance_ohm,
        back_emf_v,
        terminal_voltage_v,
        current_a,
        torque_nm,
        mechanical_power_w,
        electrical_power_w,
        copper_loss_w,
        efficiency,
    })
}

/// Solves for the stable coupled BEM rotor + generator operating point where
/// aerodynamic torque balances generator reaction torque:
/// $Q_{\text{aero}}(\lambda^*) = Q_{\text{gen}}(\lambda^*, R_{\text{load}})$.
pub fn match_generator(
    blade: &ResolvedBlade,
    polars: &PolarSet,
    wind_speed_mps: f64,
    pitch_deg: f64,
    spec: &GeneratorSpec,
    load_resistance_ohm: f64,
) -> Result<GeneratorMatchResult, AeroError> {
    spec.validate()?;
    if !wind_speed_mps.is_finite() || wind_speed_mps <= 0.0 {
        return Err(AeroError::InvalidOperatingPoint(
            "wind_speed_mps must be finite and > 0".into(),
        ));
    }
    if !pitch_deg.is_finite() {
        return Err(AeroError::InvalidOperatingPoint(
            "pitch_deg must be finite".into(),
        ));
    }
    if !load_resistance_ohm.is_finite() || load_resistance_ohm <= 0.0 {
        return Err(AeroError::NonFiniteInput {
            field: "load_resistance_ohm",
            value: load_resistance_ohm,
        });
    }

    let tsr_min = 0.4_f64;
    let tsr_max = 12.0_f64;
    let n_scan = 48usize;

    let torque_balance = |tsr: f64| -> Result<(f64, AeroResult, GeneratorState), AeroError> {
        let mut op = OperatingPoint::new(wind_speed_mps, tsr);
        op.pitch_deg = pitch_deg;
        let aero = simulate(blade, polars, &op)?;
        let gen = eval_generator_at_rpm(spec, aero.rpm, load_resistance_ohm)?;
        Ok((aero.torque_nm - gen.torque_nm, aero, gen))
    };

    // Scan from high TSR down to low TSR to locate the stable high-speed equilibrium
    // where net torque crosses from positive (below equilibrium TSR) to negative (above equilibrium TSR).
    let mut bracket: Option<(f64, f64)> = None;
    let mut best_tsr = blade.rotor.design_tsr.clamp(tsr_min, tsr_max);
    let mut best_abs_diff = f64::INFINITY;

    let mut prev_tsr = tsr_min;
    let (mut prev_diff, _, _) = torque_balance(prev_tsr)?;

    for i in 1..=n_scan {
        let cur_tsr = tsr_min + (tsr_max - tsr_min) * (i as f64 / n_scan as f64);
        let (cur_diff, _, _) = torque_balance(cur_tsr)?;
        if cur_diff.abs() < best_abs_diff {
            best_abs_diff = cur_diff.abs();
            best_tsr = cur_tsr;
        }
        // Prefer stable crossing (prev_diff >= 0 -> cur_diff <= 0) or any sign change
        if prev_diff * cur_diff <= 0.0 {
            bracket = Some((prev_tsr, cur_tsr));
        }
        prev_tsr = cur_tsr;
        prev_diff = cur_diff;
    }

    let eq_tsr = if let Some((lo, hi)) = bracket {
        brent_root(lo, hi, 1e-7, 60, |tsr| {
            torque_balance(tsr).map(|t| t.0).unwrap_or(0.0)
        })
    } else {
        best_tsr
    };

    let (_, aero, generator) = torque_balance(eq_tsr)?;
    let net_cp_electrical = aero.cp * generator.efficiency;

    Ok(GeneratorMatchResult {
        tip_speed_ratio: eq_tsr,
        generator,
        aero,
        net_cp_electrical,
    })
}

/// Evaluates the coupled rotor–generator operating point across a sequence of
/// load resistances `load_resistances_ohm` to trace the full voltage, current,
/// RPM, and output power load curve (`T-303`).
pub fn sweep_generator_load(
    blade: &ResolvedBlade,
    polars: &PolarSet,
    wind_speed_mps: f64,
    pitch_deg: f64,
    spec: &GeneratorSpec,
    load_resistances_ohm: &[f64],
) -> Result<Vec<GeneratorMatchResult>, AeroError> {
    let mut results = Vec::with_capacity(load_resistances_ohm.len());
    for &r_load in load_resistances_ohm {
        results.push(match_generator(
            blade,
            polars,
            wind_speed_mps,
            pitch_deg,
            spec,
            r_load,
        )?);
    }
    Ok(results)
}
