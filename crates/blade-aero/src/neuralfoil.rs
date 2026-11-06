//! `NeuralFoil`-style on-the-fly arbitrary airfoil polar synthesis (`T-402`).
//!
//! Computes geometry-sensitive, Reynolds-dependent 360° polars for:
//! - Any continuous 4-digit NACA airfoil `(max_camber, camber_position, thickness_ratio)`,
//! - Any arbitrary 2D airfoil coordinate contour `[(x, y)]` (imported `.dat` or blended sections).
//!
//! Combines:
//! 1. **Glauert thin-airfoil Chebyshev quadrature** for exact zero-lift angle $\alpha_{L=0}$
//!    and camber-line Fourier coefficients $A_0, A_1, A_2$,
//! 2. **Viscous boundary-layer & laminar-separation-bubble (LSB) surrogate** across
//!    low Reynolds numbers ($Re \in [20\text{k}, 50\text{k}, 100\text{k}, 200\text{k}]$),
//! 3. **Leading-edge nose-radius & camber-position stall model** ($\alpha_{\text{stall}}^\pm$),
//! 4. **Viterna–Corrigan 360° post-stall extrapolation** (`ViternaSweep`).

use std::f64::consts::PI;

use serde::{Deserialize, Serialize};

use crate::error::AeroError;
use crate::polar::{PolarSweepSpec, PolarTable, PolarTableSpec};
use crate::viterna::PolarPoint;

/// Standard Reynolds numbers synthesized for on-the-fly polar tables.
pub const SYNTHESIS_REYNOLDS_GRID: &[f64] = &[20_000.0, 50_000.0, 100_000.0, 200_000.0];

/// Geometric & inviscid thin-airfoil invariants extracted from an airfoil section.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct AirfoilGeometryFeatures {
    /// Maximum thickness-to-chord ratio $t / c \in [0.02, 0.40]$.
    pub thickness_ratio: f64,
    /// Chordwise position of maximum thickness $x_{t,\max} / c \in [0.15, 0.60]$.
    pub max_thickness_pos: f64,
    /// Maximum camber-to-chord ratio $m = y_{c,\max} / c \in [-0.15, 0.15]$.
    pub max_camber: f64,
    /// Chordwise position of maximum camber $p = x_{c,\max} / c \in [0.10, 0.85]$.
    pub camber_position: f64,
    /// Leading-edge nose radius ratio $r_{\text{LE}} / c$.
    pub le_radius_ratio: f64,
    /// Inviscid Glauert zero-lift angle of attack $\alpha_{L=0}$ in degrees.
    pub alpha_zero_lift_deg: f64,
    /// Quarter-chord pitching moment coefficient $C_{m,c/4}$.
    pub cm_quarter_chord: f64,
}

/// Evaluates the NACA 4-digit mean camber line slope $dy_c / dx$ at $x \in [0, 1]$.
fn naca4_camber_slope(x: f64, m: f64, p: f64) -> f64 {
    if m.abs() < 1e-9 {
        return 0.0;
    }
    let p_clamped = p.clamp(0.10, 0.90);
    if x < p_clamped {
        (2.0 * m / (p_clamped * p_clamped)) * (p_clamped - x)
    } else {
        (2.0 * m / ((1.0 - p_clamped) * (1.0 - p_clamped))) * (p_clamped - x)
    }
}

/// Computes `AirfoilGeometryFeatures` for a 4-digit NACA airfoil using 32-point
/// Gauss–Chebyshev quadrature of Glauert's thin-airfoil integral.
#[must_use]
pub fn features_from_naca4(
    max_camber: f64,
    camber_position: f64,
    thickness_ratio: f64,
) -> AirfoilGeometryFeatures {
    let m = max_camber.clamp(-0.15, 0.15);
    let p = if camber_position.abs() < 1e-6 {
        0.40
    } else {
        camber_position.clamp(0.10, 0.85)
    };
    let t = thickness_ratio.clamp(0.03, 0.36);

    // 32-point midpoint Chebyshev quadrature over theta in (0, pi)
    let n_quad = 32_usize;
    let d_theta = PI / (n_quad as f64);
    let mut integral_alpha0 = 0.0_f64;
    let mut integral_a1 = 0.0_f64;
    let mut integral_a2 = 0.0_f64;

    for i in 0..n_quad {
        let theta = (i as f64 + 0.5) * d_theta;
        let x = 0.5 * (1.0 - theta.cos());
        let dy_dx = naca4_camber_slope(x, m, p);
        integral_alpha0 += dy_dx * (1.0 - theta.cos()) * d_theta;
        integral_a1 += dy_dx * theta.cos() * d_theta;
        integral_a2 += dy_dx * (2.0 * theta).cos() * d_theta;
    }

    let alpha_zero_rad = integral_alpha0 / PI;
    let a1 = (2.0 / PI) * integral_a1;
    let a2 = (2.0 / PI) * integral_a2;
    let cm_c4 = (PI / 4.0) * (a2 - a1);
    let le_radius_ratio = 1.1019 * t * t;

    AirfoilGeometryFeatures {
        thickness_ratio: t,
        max_thickness_pos: 0.30,
        max_camber: m,
        camber_position: p,
        le_radius_ratio,
        alpha_zero_lift_deg: alpha_zero_rad.to_degrees(),
        cm_quarter_chord: cm_c4,
    }
}

/// Extracts `AirfoilGeometryFeatures` from an arbitrary 2D airfoil coordinate
/// contour `points` (`(x/c, y/c)` coordinates in `[0, 1]`).
pub fn extract_geometry_features(
    points: &[(f64, f64)],
) -> Result<AirfoilGeometryFeatures, AeroError> {
    if points.len() < 6 {
        return Err(AeroError::InvalidPolarSweep {
            name: "contour".to_string(),
            reynolds: 0.0,
        });
    }

    let mut min_x = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    for &(x, y) in points {
        if !x.is_finite() || !y.is_finite() {
            return Err(AeroError::NonFiniteInput {
                field: "contour_point",
                value: f64::NAN,
            });
        }
        min_x = min_x.min(x);
        max_x = max_x.max(x);
    }
    let chord_span = (max_x - min_x).max(1e-6);

    // Normalize points into x_norm in [0, 1]
    let norm_pts: Vec<(f64, f64)> = points
        .iter()
        .map(|&(x, y)| ((x - min_x) / chord_span, y / chord_span))
        .collect();

    // Sample upper and lower surfaces along 24 interior chord stations
    let n_stations = 24_usize;
    let mut max_t = 0.0_f64;
    let mut max_t_x = 0.30_f64;
    let mut max_c = 0.0_f64;
    let mut max_c_x = 0.40_f64;

    for k in 1..n_stations {
        let xc = (k as f64) / (n_stations as f64);
        let mut y_hi = f64::NEG_INFINITY;
        let mut y_lo = f64::INFINITY;

        for win in norm_pts.windows(2) {
            let (x0, y0) = win[0];
            let (x1, y1) = win[1];
            if (x0 <= xc && xc <= x1) || (x1 <= xc && xc <= x0) {
                let dx = x1 - x0;
                let y = if dx.abs() < 1e-9 {
                    0.5 * (y0 + y1)
                } else {
                    y0 + ((xc - x0) / dx) * (y1 - y0)
                };
                y_hi = y_hi.max(y);
                y_lo = y_lo.min(y);
            }
        }

        if y_hi.is_finite() && y_lo.is_finite() && y_hi >= y_lo {
            let loc_t = y_hi - y_lo;
            let loc_c = 0.5 * (y_hi + y_lo);
            if loc_t > max_t {
                max_t = loc_t;
                max_t_x = xc;
            }
            if loc_c.abs() > max_c.abs() {
                max_c = loc_c;
                max_c_x = xc;
            }
        }
    }

    let mut base = features_from_naca4(max_c, max_c_x, max_t.clamp(0.04, 0.36));
    base.max_thickness_pos = max_t_x.clamp(0.15, 0.60);
    Ok(base)
}

/// Synthesizes a multi-Reynolds 360° Viterna-extrapolated [`PolarTable`] from
/// [`AirfoilGeometryFeatures`].
pub fn synthesize_polar_from_features(
    name: &str,
    features: &AirfoilGeometryFeatures,
    aspect_ratio: f64,
) -> Result<PolarTable, AeroError> {
    let t = features.thickness_ratio.clamp(0.03, 0.36);
    let m = features.max_camber.clamp(-0.15, 0.15);
    let p = features.camber_position.clamp(0.10, 0.85);
    let alpha0_deg = features.alpha_zero_lift_deg;

    // Aft-camber shift increases zero-lift Cl efficiency slightly but sharpens stall
    let aft_camber_factor = 1.0 + 0.15 * (p - 0.40);

    let mut sweeps = Vec::with_capacity(SYNTHESIS_REYNOLDS_GRID.len());
    for &re in SYNTHESIS_REYNOLDS_GRID {
        let re_norm = (re / 100_000.0).clamp(0.15, 5.0);

        // Viscous boundary-layer decambering reduces lift slope at very low Re
        let visc_eta = (1.0 - 0.11 * re_norm.powf(-0.32)).clamp(0.76, 0.99);
        let cl_slope_per_rad = 2.0 * PI * (1.0 + 0.72 * t) * visc_eta * aft_camber_factor;

        // Positive and negative stall angles (deg) governed by LE radius (t/c), camber, and Re
        let base_stall = 10.0 + 32.0 * (t - 0.06).clamp(0.0, 0.14) + 1.8 * re_norm.ln();
        let stall_pos_deg = (base_stall + 18.0 * m).clamp(8.0, 16.5);
        let stall_neg_deg = (-base_stall + 18.0 * m).clamp(-16.5, -8.0);

        // Skin friction + form factor + laminar separation bubble (LSB) drag at low Re
        let cf_blended = 0.0058 * re_norm.powf(-0.26);
        let form_factor = 1.0 + 2.0 * t + 60.0 * t.powi(4);
        let lsb_penalty = 0.0032 * re_norm.powf(-0.48) * (1.0 + 4.5 * m.abs());
        let cd_min = (2.0 * cf_blended * form_factor + lsb_penalty + 0.045 * m * m).max(0.006);

        // Optimum Cl at center of laminar drag bucket
        let cl_opt = (1.15 * PI * m).clamp(-0.5, 0.85);

        let mut points = Vec::new();
        for alpha_i in -16..=16 {
            let alpha = f64::from(alpha_i);
            let d_alpha_rad = (alpha - alpha0_deg).to_radians();
            let cl_linear = cl_slope_per_rad * d_alpha_rad;

            // Smooth Kirchhoff / trailing-edge separation factor f_sep in [0, 1]
            let stall_ref = if alpha >= alpha0_deg {
                stall_pos_deg
            } else {
                stall_neg_deg.abs()
            };
            let ratio = (alpha - alpha0_deg).abs() / stall_ref.max(4.0);
            let sep_blend = 1.0 / (1.0 + ratio.powi(5));
            let cl_post = 0.92 * (2.0 * d_alpha_rad).sin();
            let cl = cl_linear * sep_blend + cl_post * (1.0 - sep_blend);

            // Drag bucket + induced profile drag + separation pressure drag
            let d_cl = cl - cl_opt;
            let k_bucket = 0.011 + 0.004 * re_norm.powf(-0.30);
            let cd_sep = 0.065 * ratio.powi(4);
            let cd = (cd_min + k_bucket * d_cl * d_cl + cd_sep).max(0.005);

            points.push(PolarPoint {
                alpha_deg: alpha,
                cl,
                cd,
            });
        }

        sweeps.push(PolarSweepSpec {
            reynolds: re,
            points,
        });
    }

    PolarTable::from_spec(PolarTableSpec {
        name: name.to_string(),
        aspect_ratio,
        sweeps,
    })
}

/// Synthesizes a multi-Reynolds 360° [`PolarTable`] for a 4-digit NACA airfoil
/// `(max_camber, camber_position, thickness_ratio)`.
pub fn synthesize_naca4_polar(
    max_camber: f64,
    camber_position: f64,
    thickness_ratio: f64,
    aspect_ratio: f64,
) -> Result<PolarTable, AeroError> {
    let m_pct = (max_camber * 100.0).round() as i32;
    let p_tenth = (camber_position * 10.0).round() as i32;
    let t_pct = (thickness_ratio * 100.0).round() as i32;
    let code = format!("NACA{}{}{:02}", m_pct.abs(), p_tenth.abs(), t_pct.abs());
    let features = features_from_naca4(max_camber, camber_position, thickness_ratio);
    synthesize_polar_from_features(&code, &features, aspect_ratio)
}

/// Synthesizes a multi-Reynolds 360° [`PolarTable`] directly from an arbitrary
/// 2D airfoil coordinate loop `points` (`(x, y)`).
pub fn synthesize_contour_polar(
    name: &str,
    points: &[(f64, f64)],
    aspect_ratio: f64,
) -> Result<PolarTable, AeroError> {
    let features = extract_geometry_features(points)?;
    synthesize_polar_from_features(name, &features, aspect_ratio)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn symmetric_naca0012_has_zero_alpha0_and_antisymmetric_lift() {
        let feat = features_from_naca4(0.0, 0.0, 0.12);
        assert!(
            feat.alpha_zero_lift_deg.abs() < 1e-9,
            "symmetric airfoil must have alpha_0 == 0, got {}",
            feat.alpha_zero_lift_deg
        );
        let table = synthesize_naca4_polar(0.0, 0.0, 0.12, 12.0).expect("naca0012 polar");
        let e_pos = table.eval(5.0, 100_000.0).expect("eval +5");
        let e_neg = table.eval(-5.0, 100_000.0).expect("eval -5");
        assert!((e_pos.cl + e_neg.cl).abs() < 1e-6);
        assert!((e_pos.cd - e_neg.cd).abs() < 1e-6);
    }

    #[test]
    fn cambered_airfoil_shifts_zero_lift_angle_and_reynolds_reduces_drag() {
        let sym = synthesize_naca4_polar(0.0, 0.4, 0.12, 12.0).expect("0012");
        let cam = synthesize_naca4_polar(0.04, 0.4, 0.12, 12.0).expect("4412");

        let cl_sym_0 = sym.eval(0.0, 100_000.0).unwrap().cl;
        let cl_cam_0 = cam.eval(0.0, 100_000.0).unwrap().cl;
        assert!(
            cl_cam_0 > cl_sym_0 + 0.30,
            "4% camber must produce positive lift at alpha=0: sym={cl_sym_0}, cam={cl_cam_0}"
        );

        let cd_low_re = cam.eval(4.0, 25_000.0).unwrap().cd;
        let cd_high_re = cam.eval(4.0, 200_000.0).unwrap().cd;
        assert!(
            cd_low_re > cd_high_re,
            "low-Re laminar separation bubble / skin friction must yield higher Cd: {cd_low_re} vs {cd_high_re}"
        );
    }

    #[test]
    fn contour_polar_synthesis_extracts_camber_and_thickness_accurately() {
        // Generate an analytical NACA 2412-like contour loop
        let mut pts = Vec::new();
        for i in 0..=40 {
            let x = (i as f64) / 40.0;
            let yt = 5.0
                * 0.12
                * (0.2969 * x.sqrt() - 0.1260 * x - 0.3516 * x * x + 0.2843 * x.powi(3)
                    - 0.1015 * x.powi(4));
            let yc = if x < 0.4 {
                (0.02 / 0.16) * (2.0 * 0.4 * x - x * x)
            } else {
                (0.02 / 0.36) * ((1.0 - 2.0 * 0.4) + 2.0 * 0.4 * x - x * x)
            };
            pts.push((x, yc + yt));
        }
        for i in (0..40).rev() {
            let x = (i as f64) / 40.0;
            let yt = 5.0
                * 0.12
                * (0.2969 * x.sqrt() - 0.1260 * x - 0.3516 * x * x + 0.2843 * x.powi(3)
                    - 0.1015 * x.powi(4));
            let yc = if x < 0.4 {
                (0.02 / 0.16) * (2.0 * 0.4 * x - x * x)
            } else {
                (0.02 / 0.36) * ((1.0 - 2.0 * 0.4) + 2.0 * 0.4 * x - x * x)
            };
            pts.push((x, yc - yt));
        }

        let feat = extract_geometry_features(&pts).expect("features");
        assert!((feat.thickness_ratio - 0.12).abs() < 0.01);
        assert!((feat.max_camber - 0.02).abs() < 0.005);

        let table = synthesize_contour_polar("CUSTOM2412", &pts, 12.0).expect("contour polar");
        let eval = table.eval(6.0, 80_000.0).expect("eval");
        assert!(eval.cl > 0.6 && eval.cd > 0.006);
    }
}
