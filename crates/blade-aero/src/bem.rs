//! Blade Element Momentum (BEM) solver (`T-302`, `D-lead1-006`):
//! - **Ning (2014)** 1D inflow-angle parameterization $f(\phi) = 0$
//! - **Brent's method** guaranteed bracketed root-finding
//! - **Prandtl** tip and hub loss factor $F(\phi) = F_{\text{tip}}(\phi) \cdot F_{\text{hub}}(\phi)$
//! - **Glauert / Buhl (2005)** empirical high-induction correction for $a > a_c = 0.4$.

use std::f64::consts::PI;

use blade_model::ResolvedBlade;
use serde::{Deserialize, Serialize};

use crate::error::AeroError;
use crate::polar::{PolarSet, PolarTable};

/// Standard sea-level air density $\rho = 1.225\text{ kg/m}^3$.
pub const DEFAULT_AIR_DENSITY_KG_M3: f64 = 1.225;

/// Standard sea-level kinematic viscosity $\nu = 1.5 \times 10^{-5}\text{ m}^2/\text{s}$.
pub const DEFAULT_KINEMATIC_VISCOSITY_M2_S: f64 = 1.5e-5;

/// Critical axial induction factor $a_c = 0.4$ above which the Glauert / Buhl
/// high-induction turbulent-wake correction applies.
pub const GLAUERT_CRITICAL_A: f64 = 0.4;

/// Operating condition for BEM rotor simulation (`§8 OperatingPoint`).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct OperatingPoint {
    /// Freestream wind speed $V_\infty$ in m/s ($> 0$).
    pub wind_speed_mps: f64,
    /// Tip speed ratio $\lambda = \Omega R / V_\infty$ ($> 0$).
    pub tip_speed_ratio: f64,
    /// Collective blade pitch offset $\theta_p$ in degrees (added to station twist).
    pub pitch_deg: f64,
    /// Air density $\rho$ in $\text{kg/m}^3$.
    pub air_density_kg_m3: f64,
    /// Air kinematic viscosity $\nu$ in $\text{m}^2/\text{s}$.
    pub kinematic_viscosity_m2_s: f64,
}

impl OperatingPoint {
    /// Creates an `OperatingPoint` at `wind_speed_mps` and `tip_speed_ratio`
    /// with zero pitch offset and standard sea-level atmosphere.
    #[must_use]
    pub fn new(wind_speed_mps: f64, tip_speed_ratio: f64) -> Self {
        Self {
            wind_speed_mps,
            tip_speed_ratio,
            pitch_deg: 0.0,
            air_density_kg_m3: DEFAULT_AIR_DENSITY_KG_M3,
            kinematic_viscosity_m2_s: DEFAULT_KINEMATIC_VISCOSITY_M2_S,
        }
    }

    /// Creates an `OperatingPoint` using the design wind speed and TSR from a
    /// `ResolvedBlade`.
    #[must_use]
    pub fn from_blade(blade: &ResolvedBlade) -> Self {
        Self::new(blade.rotor.wind_speed_mps, blade.rotor.design_tsr)
    }
}

/// Converged aerodynamic state at a single radial station.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct StationAero {
    /// Normalized radial coordinate $r / R \in (0, 1]$.
    pub span_ratio: f64,
    /// Radial station $r$ in mm.
    pub radius_mm: f64,
    /// Local chord $c$ in mm.
    pub chord_mm: f64,
    /// Local geometric twist $\beta$ in degrees.
    pub twist_deg: f64,
    /// Converged inflow angle $\phi$ in degrees.
    pub inflow_angle_deg: f64,
    /// Local angle of attack $\alpha = \phi - (\beta + \theta_p)$ in degrees.
    pub alpha_deg: f64,
    /// Axial induction factor $a$.
    pub axial_induction: f64,
    /// Tangential induction factor $a'$.
    pub tangential_induction: f64,
    /// Combined Prandtl tip and hub loss factor $F \in (0, 1]$.
    pub tip_loss_factor: f64,
    /// Local chord Reynolds number $Re = W c / \nu$.
    pub reynolds: f64,
    /// Lift coefficient $C_l$.
    pub cl: f64,
    /// Drag coefficient $C_d$.
    pub cd: f64,
    /// Normal force coefficient $C_n = C_l \cos\phi + C_d \sin\phi$.
    pub cn: f64,
    /// Tangential force coefficient $C_t = C_l \sin\phi - C_d \cos\phi$.
    pub ct: f64,
    /// Relative inflow speed $W$ in m/s.
    pub relative_speed_mps: f64,
    /// Total elemental thrust per unit span $dT/dr$ (N/m, summed over all $B$ blades).
    pub thrust_per_m_n: f64,
    /// Total elemental torque per unit span $dQ/dr$ (N·m/m, summed over all $B$ blades).
    pub torque_per_m_nm: f64,
}

/// Integrated rotor aerodynamic simulation result (`§8 AeroResult`).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AeroResult {
    /// Operating condition evaluated.
    pub operating_point: OperatingPoint,
    /// Rotor angular velocity $\Omega$ in rad/s.
    pub omega_rad_s: f64,
    /// Rotor rotational speed in RPM.
    pub rpm: f64,
    /// Power coefficient $C_p = P / (\frac{1}{2} \rho A V_\infty^3)$.
    pub cp: f64,
    /// Thrust coefficient $C_t = T / (\frac{1}{2} \rho A V_\infty^2)$.
    pub ct: f64,
    /// Torque coefficient $C_q = Q / (\frac{1}{2} \rho A R V_\infty^2)$.
    pub cq: f64,
    /// Total aerodynamic mechanical power $P$ in Watts.
    pub power_w: f64,
    /// Total axial thrust $T$ in Newtons.
    pub thrust_n: f64,
    /// Total shaft aerodynamic torque $Q$ in N·m.
    pub torque_nm: f64,
    /// Per-station converged BEM states from hub to tip.
    pub stations: Vec<StationAero>,
}

/// Summary point in a $C_p$–TSR sweep (`T-302` / `T-304`).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct TsrSweepPoint {
    pub tsr: f64,
    pub rpm: f64,
    pub cp: f64,
    pub ct: f64,
    pub cq: f64,
    pub power_w: f64,
    pub torque_nm: f64,
    pub thrust_n: f64,
}

/// Combined Prandtl tip and hub loss factor $F(\phi) = F_{\text{tip}}(\phi) \cdot F_{\text{hub}}(\phi)$.
#[must_use]
pub fn prandtl_loss_factor(
    blade_count: u32,
    r_m: f64,
    r_hub_m: f64,
    r_tip_m: f64,
    phi_rad: f64,
) -> f64 {
    let sin_phi = phi_rad.sin().abs().max(1e-6);
    let b_half = 0.5 * f64::from(blade_count.max(1));

    let f_tip = (b_half * (r_tip_m - r_m).max(0.0) / (r_m * sin_phi)).min(50.0);
    let f_hub = (b_half * (r_m - r_hub_m).max(0.0) / (r_m * sin_phi)).min(50.0);

    let loss_tip = (2.0 / PI) * (-f_tip).exp().clamp(-1.0, 1.0).acos();
    let loss_hub = (2.0 / PI) * (-f_hub).exp().clamp(-1.0, 1.0).acos();

    (loss_tip * loss_hub).clamp(1e-4, 1.0)
}

/// Computes the axial induction factor $a(\kappa, F)$ from Ning (2014) Eq. 8–9
/// with the **Glauert / Buhl (2005)** high-induction empirical correction for
/// $\kappa > \kappa_c = \frac{a_c}{1 - a_c} = \frac{2}{3}$ ($a > 0.4$).
#[must_use]
pub fn glauert_buhl_axial_induction(kappa: f64, loss_factor: f64) -> f64 {
    if !kappa.is_finite() {
        return 0.0;
    }
    if kappa <= -1.0 {
        // Propeller-brake region (Ning 2014 Eq. 11)
        return (kappa / (1.0 - kappa)).clamp(-0.5, 0.0);
    }
    let kappa_c = GLAUERT_CRITICAL_A / (1.0 - GLAUERT_CRITICAL_A); // 2/3
    if kappa <= kappa_c {
        return (kappa / (1.0 + kappa)).clamp(-0.5, GLAUERT_CRITICAL_A);
    }

    // Glauert / Buhl (2005) empirical high-induction region (0.4 < a < 1.0)
    let f = loss_factor.clamp(1e-4, 1.0);
    let g1 = 2.0 * f * kappa - (10.0 / 9.0 - f);
    let g2 = 2.0 * f * kappa - f * (4.0 / 3.0 - f);
    let g3 = 2.0 * f * kappa - (25.0 / 9.0 - 2.0 * f);

    let a = if g3.abs() < 1e-6 {
        1.0 - 1.0 / (2.0 * g2.max(1e-6).sqrt())
    } else {
        (g1 - g2.max(0.0).sqrt()) / g3
    };
    a.clamp(GLAUERT_CRITICAL_A, 0.95)
}

/// Solves a 1D scalar equation $f(x) = 0$ on a bracketed interval $[a, b]$
/// ($f(a) \cdot f(b) \le 0$) using **Brent's method** (Brent 1973).
pub fn brent_root<F>(mut a: f64, mut b: f64, tol: f64, max_iter: usize, mut f: F) -> f64
where
    F: FnMut(f64) -> f64,
{
    let mut fa = f(a);
    let mut fb = f(b);
    if fa.abs() <= tol {
        return a;
    }
    if fb.abs() <= tol {
        return b;
    }

    if fa.abs() < fb.abs() {
        std::mem::swap(&mut a, &mut b);
        std::mem::swap(&mut fa, &mut fb);
    }

    let mut c = a;
    let mut fc = fa;
    let mut d = b - a;
    let mut mflag = true;

    for _ in 0..max_iter {
        if fb.abs() <= tol || (b - a).abs() <= tol {
            return b;
        }

        let mut s = if (fa - fc).abs() > 1e-14 && (fb - fc).abs() > 1e-14 {
            // Inverse quadratic interpolation
            a * fb * fc / ((fa - fb) * (fa - fc))
                + b * fa * fc / ((fb - fa) * (fb - fc))
                + c * fa * fb / ((fc - fa) * (fc - fb))
        } else {
            // Secant step
            b - fb * (b - a) / (fb - fa)
        };

        let cond1 = {
            let bound1 = (3.0 * a + b) * 0.25;
            let lo = bound1.min(b);
            let hi = bound1.max(b);
            s < lo || s > hi
        };
        let cond2 = mflag && (s - b).abs() >= 0.5 * (b - c).abs();
        let cond3 = !mflag && (s - b).abs() >= 0.5 * (c - d).abs();
        let cond4 = mflag && (b - c).abs() < tol;
        let cond5 = !mflag && (c - d).abs() < tol;

        if cond1 || cond2 || cond3 || cond4 || cond5 {
            s = 0.5 * (a + b);
            mflag = true;
        } else {
            mflag = false;
        }

        let fs = f(s);
        d = c;
        c = b;
        fc = fb;

        if fa * fs < 0.0 {
            b = s;
            fb = fs;
        } else {
            a = s;
            fa = fs;
        }

        if fa.abs() < fb.abs() {
            std::mem::swap(&mut a, &mut b);
            std::mem::swap(&mut fa, &mut fb);
        }
    }

    b
}

#[derive(Clone, Copy)]
struct StationContext {
    blade_count: u32,
    r_m: f64,
    r_eff_m: f64,
    r_hub_m: f64,
    r_tip_m: f64,
    chord_m: f64,
    twist_deg: f64,
    solidity: f64,
    local_tsr: f64,
    section_theta_deg: f64,
}

#[derive(Clone, Copy)]
struct NingEval {
    residual: f64,
    a: f64,
    a_prime: f64,
    f_loss: f64,
    cl: f64,
    cd: f64,
    cn: f64,
    ct: f64,
}

/// Evaluates the Ning (2014) BEM state at a single trial inflow angle $\phi$ (in radians).
fn eval_ning_state(
    phi_rad: f64,
    ctx: &StationContext,
    reynolds: f64,
    polar: &PolarTable,
) -> NingEval {
    let phi_deg = phi_rad.to_degrees();
    let alpha_deg = phi_deg - ctx.section_theta_deg;
    let eval = polar
        .eval(alpha_deg, reynolds)
        .expect("Viterna polar is valid for all finite angles");
    let (cn, ct) = eval.normal_tangential(phi_rad);
    let f_loss = prandtl_loss_factor(
        ctx.blade_count,
        ctx.r_eff_m,
        ctx.r_hub_m,
        ctx.r_tip_m,
        phi_rad,
    );

    let (sin_phi, cos_phi) = phi_rad.sin_cos();
    let denom_axial = (4.0 * f_loss * sin_phi * sin_phi).max(1e-9);
    let kappa = (ctx.solidity * cn) / denom_axial;
    let a = glauert_buhl_axial_induction(kappa, f_loss);

    let denom_tang = 4.0 * f_loss * sin_phi * cos_phi;
    let a_prime = if denom_tang.abs() < 1e-9 {
        0.0
    } else {
        let kp = (ctx.solidity * ct) / denom_tang;
        if (1.0 - kp).abs() < 1e-6 {
            0.0
        } else {
            (kp / (1.0 - kp)).clamp(-0.5, 1.5)
        }
    };

    // Ning (2014) Eq. 7 residual: f(phi) = sin(phi)/(1 - a) - cos(phi)/(lambda_r * (1 + a'))
    let residual =
        sin_phi / (1.0 - a).max(1e-6) - cos_phi / (ctx.local_tsr * (1.0 + a_prime).max(0.05));

    NingEval {
        residual,
        a,
        a_prime,
        f_loss,
        cl: eval.cl,
        cd: eval.cd,
        cn,
        ct,
    }
}

/// Solves Ning (2014) BEM equations for a single radial station using Brent's method.
fn solve_station(
    ctx: &StationContext,
    polar: &PolarTable,
    op: &OperatingPoint,
    omega_rad_s: f64,
) -> StationAero {
    let v_inf = op.wind_speed_mps;

    // Initial Reynolds estimate from geometric velocity triangle (a=1/3, a'=0)
    let w_init = v_inf.hypot(omega_rad_s * ctx.r_m);
    let mut reynolds =
        ((w_init * ctx.chord_m) / op.kinematic_viscosity_m2_s).clamp(5_000.0, 5_000_000.0);

    let eps = 1e-4;
    let phi_hi = 0.5 * PI - eps;
    let mut phi_sol = (1.0_f64).atan2(ctx.local_tsr).clamp(eps, phi_hi);

    // Two outer passes: pass 1 solves with initial Re, pass 2 refines with converged Re
    for _ in 0..2 {
        let f_eval = |phi: f64| -> f64 { eval_ning_state(phi, ctx, reynolds, polar).residual };

        let f_lo = f_eval(eps);
        let f_hi = f_eval(phi_hi);

        if f_lo * f_hi <= 0.0 {
            phi_sol = brent_root(eps, phi_hi, 1e-9, 80, f_eval);
        } else {
            // Scan 36 sub-intervals in [eps, phi_hi] to find any sign-change bracket
            let n_scan = 36;
            let mut bracket: Option<(f64, f64)> = None;
            let mut best_phi = phi_sol;
            let mut best_abs = f_lo.abs();
            let mut prev_phi = eps;
            let mut prev_f = f_lo;

            for i in 1..=n_scan {
                let cur_phi = eps + (phi_hi - eps) * (i as f64 / n_scan as f64);
                let cur_f = f_eval(cur_phi);
                if cur_f.abs() < best_abs {
                    best_abs = cur_f.abs();
                    best_phi = cur_phi;
                }
                if prev_f * cur_f <= 0.0 {
                    bracket = Some((prev_phi, cur_phi));
                    break;
                }
                prev_phi = cur_phi;
                prev_f = cur_f;
            }

            phi_sol = if let Some((lo, hi)) = bracket {
                brent_root(lo, hi, 1e-9, 80, f_eval)
            } else {
                best_phi
            };
        }

        let state = eval_ning_state(phi_sol, ctx, reynolds, polar);
        let v_ax = v_inf * (1.0 - state.a);
        let v_tan = omega_rad_s * ctx.r_m * (1.0 + state.a_prime);
        let w = v_ax.hypot(v_tan).max(0.1);
        reynolds = ((w * ctx.chord_m) / op.kinematic_viscosity_m2_s).clamp(5_000.0, 5_000_000.0);
    }

    let state = eval_ning_state(phi_sol, ctx, reynolds, polar);

    let v_ax = v_inf * (1.0 - state.a);
    let v_tan = omega_rad_s * ctx.r_m * (1.0 + state.a_prime);
    let w = v_ax.hypot(v_tan);
    let q_dyn = 0.5 * op.air_density_kg_m3 * w * w;

    // Apply Prandtl loss factor to boundary stations so tip/hub vortex roll-off
    // tapers the integrated load smoothly at r = r_hub and r = R.
    let boundary_taper =
        if (ctx.r_m - ctx.r_hub_m).abs() < 1e-6 || (ctx.r_tip_m - ctx.r_m).abs() < 1e-6 {
            state.f_loss
        } else {
            1.0
        };

    let thrust_per_m_n =
        f64::from(ctx.blade_count) * q_dyn * ctx.chord_m * state.cn * boundary_taper;
    let torque_per_m_nm =
        f64::from(ctx.blade_count) * q_dyn * ctx.chord_m * state.ct * ctx.r_m * boundary_taper;

    StationAero {
        span_ratio: ctx.r_m / ctx.r_tip_m,
        radius_mm: ctx.r_m * 1000.0,
        chord_mm: ctx.chord_m * 1000.0,
        twist_deg: ctx.twist_deg,
        inflow_angle_deg: phi_sol.to_degrees(),
        alpha_deg: phi_sol.to_degrees() - ctx.section_theta_deg,
        axial_induction: state.a,
        tangential_induction: state.a_prime,
        tip_loss_factor: state.f_loss,
        reynolds,
        cl: state.cl,
        cd: state.cd,
        cn: state.cn,
        ct: state.ct,
        relative_speed_mps: w,
        thrust_per_m_n,
        torque_per_m_nm,
    }
}

/// Runs the §8 BEM aerodynamic simulation for a `ResolvedBlade` at `op`.
pub fn simulate(
    b: &ResolvedBlade,
    polars: &PolarSet,
    op: &OperatingPoint,
) -> Result<AeroResult, AeroError> {
    if !op.wind_speed_mps.is_finite() || op.wind_speed_mps <= 0.0 {
        return Err(AeroError::InvalidOperatingPoint(
            "wind_speed_mps must be finite and > 0".into(),
        ));
    }
    if !op.tip_speed_ratio.is_finite() || op.tip_speed_ratio <= 0.0 {
        return Err(AeroError::InvalidOperatingPoint(
            "tip_speed_ratio must be finite and > 0".into(),
        ));
    }
    if !op.pitch_deg.is_finite() {
        return Err(AeroError::InvalidOperatingPoint(
            "pitch_deg must be finite".into(),
        ));
    }
    if !op.air_density_kg_m3.is_finite() || op.air_density_kg_m3 <= 0.0 {
        return Err(AeroError::InvalidOperatingPoint(
            "air_density_kg_m3 must be finite and > 0".into(),
        ));
    }
    if !op.kinematic_viscosity_m2_s.is_finite() || op.kinematic_viscosity_m2_s <= 0.0 {
        return Err(AeroError::InvalidOperatingPoint(
            "kinematic_viscosity_m2_s must be finite and > 0".into(),
        ));
    }
    if b.stations.len() < 2 {
        return Err(AeroError::InvalidOperatingPoint(
            "blade must have at least 2 radial stations".into(),
        ));
    }

    let r_tip_m = b.rotor.radius_mm * 1e-3;
    let r_hub_m = b.rotor.hub_radius_mm * 1e-3;
    let span_m = (r_tip_m - r_hub_m).max(1e-6);
    let inset_m = 0.015 * span_m;

    let omega_rad_s = op.tip_speed_ratio * op.wind_speed_mps / r_tip_m;
    let rpm = omega_rad_s * 60.0 / (2.0 * PI);

    let mut stations = Vec::with_capacity(b.stations.len());
    for st in &b.stations {
        let polar = polars.resolve_for_station(&st.airfoil)?;
        let r_m = st.span_mm * 1e-3;
        let r_eff_m = r_m.clamp(r_hub_m + inset_m, r_tip_m - inset_m);
        let chord_m = st.chord_mm * 1e-3;
        let local_tsr = (omega_rad_s * r_m / op.wind_speed_mps).max(1e-4);
        let solidity = (f64::from(b.rotor.blade_count) * chord_m) / (2.0 * PI * r_m);
        let ctx = StationContext {
            blade_count: b.rotor.blade_count,
            r_m,
            r_eff_m,
            r_hub_m,
            r_tip_m,
            chord_m,
            twist_deg: st.twist_deg,
            solidity,
            local_tsr,
            section_theta_deg: st.twist_deg + op.pitch_deg,
        };

        stations.push(solve_station(&ctx, &polar, op, omega_rad_s));
    }

    // Spanwise trapezoidal integration of elemental thrust and torque
    let mut thrust_n = 0.0;
    let mut torque_nm = 0.0;
    for pair in stations.windows(2) {
        let s0 = &pair[0];
        let s1 = &pair[1];
        let dr_m = (s1.radius_mm - s0.radius_mm) * 1e-3;
        thrust_n += 0.5 * (s0.thrust_per_m_n + s1.thrust_per_m_n) * dr_m;
        torque_nm += 0.5 * (s0.torque_per_m_nm + s1.torque_per_m_nm) * dr_m;
    }

    let power_w = torque_nm * omega_rad_s;
    let swept_area_m2 = PI * r_tip_m * r_tip_m;
    let q_inf = 0.5 * op.air_density_kg_m3 * op.wind_speed_mps * op.wind_speed_mps;
    let p_wind = q_inf * swept_area_m2 * op.wind_speed_mps;
    let t_ref = q_inf * swept_area_m2;
    let q_ref = t_ref * r_tip_m;

    let cp = power_w / p_wind;
    let ct = thrust_n / t_ref;
    let cq = torque_nm / q_ref;

    Ok(AeroResult {
        operating_point: *op,
        omega_rad_s,
        rpm,
        cp,
        ct,
        cq,
        power_w,
        thrust_n,
        torque_nm,
        stations,
    })
}

/// Evaluates a TSR sweep ($\lambda \in \text{tsr\_values}$) at a fixed wind speed
/// and pitch angle (`T-302` / `T-304`).
pub fn simulate_tsr_sweep(
    b: &ResolvedBlade,
    polars: &PolarSet,
    wind_speed_mps: f64,
    pitch_deg: f64,
    tsr_values: &[f64],
) -> Result<Vec<TsrSweepPoint>, AeroError> {
    let mut curve = Vec::with_capacity(tsr_values.len());
    for &tsr in tsr_values {
        let mut op = OperatingPoint::new(wind_speed_mps, tsr);
        op.pitch_deg = pitch_deg;
        let res = simulate(b, polars, &op)?;
        curve.push(TsrSweepPoint {
            tsr,
            rpm: res.rpm,
            cp: res.cp,
            ct: res.ct,
            cq: res.cq,
            power_w: res.power_w,
            torque_nm: res.torque_nm,
            thrust_n: res.thrust_n,
        });
    }
    Ok(curve)
}
