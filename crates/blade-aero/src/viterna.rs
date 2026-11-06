//! Viterna–Corrigan (1982) 360-degree post-stall polar extrapolation (`T-301`).
//!
//! Extends a finite attached/stall polar sweep over $[\alpha_{\min}, \alpha_{\max}]$
//! smoothly and continuously across the entire $\alpha \in [-180^\circ, +180^\circ]$
//! range so BEM root-finding (`Ning 2014 + Brent`, `T-302`) never encounters an
//! out-of-range angle of attack.

use serde::{Deserialize, Serialize};

use crate::error::AeroError;

/// Minimum allowed drag coefficient in post-stall extrapolation.
const MIN_POST_STALL_CD: f64 = 1e-4;

/// Trailing-edge-first reverse-flow lift efficiency factor in $|\alpha| \in (90^\circ, 180^\circ]$.
const REVERSE_FLOW_LIFT_FACTOR: f64 = 0.70;

/// Single aerodynamic coefficient pair $(C_l, C_d)$ at angle of attack `alpha_deg`.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct PolarPoint {
    pub alpha_deg: f64,
    pub cl: f64,
    pub cd: f64,
}

/// Evaluated lift, drag, and resolved normal/tangential coefficients.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct PolarEval {
    /// Wrapped angle of attack in $[-180^\circ, +180^\circ]$.
    pub alpha_deg: f64,
    /// Lift coefficient $C_l(\alpha)$.
    pub cl: f64,
    /// Drag coefficient $C_d(\alpha) > 0$.
    pub cd: f64,
}

impl PolarEval {
    /// Resolves $(C_l, C_d)$ into rotor-plane normal ($C_n$) and tangential ($C_t$)
    /// force coefficients for inflow angle $\phi$ (in radians):
    /// - $C_n = C_l \cos\phi + C_d \sin\phi$ (axial thrust direction)
    /// - $C_t = C_l \sin\phi - C_d \cos\phi$ (driving torque direction)
    #[must_use]
    pub fn normal_tangential(&self, phi_rad: f64) -> (f64, f64) {
        let (sin_phi, cos_phi) = phi_rad.sin_cos();
        let cn = self.cl * cos_phi + self.cd * sin_phi;
        let ct = self.cl * sin_phi - self.cd * cos_phi;
        (cn, ct)
    }
}

/// Precomputed Viterna–Corrigan (1982) post-stall coefficients for a single
/// Reynolds sweep.
#[derive(Debug, Clone, PartialEq)]
pub struct ViternaSweep {
    reynolds: f64,
    aspect_ratio: f64,
    points: Vec<PolarPoint>,
    cd_max: f64,
    cd_180: f64,
    a1: f64,
    a2_pos: f64,
    b2_pos: f64,
    a2_neg: f64,
    b2_neg: f64,
}

/// Wraps any finite angle in degrees into $[-180^\circ, +180^\circ]$.
#[must_use]
pub fn wrap_alpha_deg(alpha_deg: f64) -> f64 {
    let mut wrapped = (alpha_deg + 180.0).rem_euclid(360.0) - 180.0;
    if wrapped == -180.0 && alpha_deg > 0.0 {
        wrapped = 180.0;
    }
    wrapped
}

/// Computes the Viterna–Corrigan maximum flat-plate drag coefficient
/// $C_{d,\max} = 1.11 + 0.018 \cdot \min(AR, 50)$.
#[must_use]
pub fn viterna_cd_max(aspect_ratio: f64) -> f64 {
    1.11 + 0.018 * aspect_ratio.clamp(1.0, 50.0)
}

impl ViternaSweep {
    /// Validates an attached/stall polar sweep and precomputes its positive and
    /// negative Viterna–Corrigan matching constants.
    pub fn new(
        name: &str,
        reynolds: f64,
        aspect_ratio: f64,
        points: Vec<PolarPoint>,
    ) -> Result<Self, AeroError> {
        if !reynolds.is_finite() || reynolds <= 0.0 {
            return Err(AeroError::NonFiniteInput {
                field: "reynolds",
                value: reynolds,
            });
        }
        if !aspect_ratio.is_finite() || aspect_ratio <= 0.0 {
            return Err(AeroError::InvalidAspectRatio { aspect_ratio });
        }
        if points.len() < 2 {
            return Err(AeroError::InvalidPolarSweep {
                name: name.to_owned(),
                reynolds,
            });
        }

        for (idx, pt) in points.iter().enumerate() {
            if !pt.alpha_deg.is_finite() || !pt.cl.is_finite() || !pt.cd.is_finite() {
                return Err(AeroError::UnsortedAlphaGrid {
                    name: name.to_owned(),
                });
            }
            if pt.cd <= 0.0 {
                return Err(AeroError::InvalidDragCoefficient {
                    name: name.to_owned(),
                    cd: pt.cd,
                });
            }
            if idx > 0 && pt.alpha_deg <= points[idx - 1].alpha_deg {
                return Err(AeroError::UnsortedAlphaGrid {
                    name: name.to_owned(),
                });
            }
        }

        let first = points[0];
        let last = points[points.len() - 1];
        if first.alpha_deg >= -1.0
            || first.alpha_deg <= -85.0
            || last.alpha_deg <= 1.0
            || last.alpha_deg >= 85.0
        {
            return Err(AeroError::InvalidPolarSweep {
                name: name.to_owned(),
                reynolds,
            });
        }

        let cd_max = viterna_cd_max(aspect_ratio).max(first.cd.max(last.cd) * 1.05);
        let a1 = 0.5 * cd_max;

        let alpha_pos = last.alpha_deg.to_radians();
        let (sin_pos, cos_pos) = alpha_pos.sin_cos();
        let a2_pos = (last.cl - cd_max * sin_pos * cos_pos) * sin_pos / (cos_pos * cos_pos);
        let b2_pos = (last.cd - cd_max * sin_pos * sin_pos) / cos_pos;

        let theta_neg = (-first.alpha_deg).to_radians();
        let (sin_neg, cos_neg) = theta_neg.sin_cos();
        let a2_neg = (-first.cl - cd_max * sin_neg * cos_neg) * sin_neg / (cos_neg * cos_neg);
        let b2_neg = (first.cd - cd_max * sin_neg * sin_neg) / cos_neg;

        let cd_180 = points
            .iter()
            .map(|p| p.cd)
            .fold(f64::INFINITY, f64::min)
            .max(0.015);

        Ok(Self {
            reynolds,
            aspect_ratio,
            points,
            cd_max,
            cd_180,
            a1,
            a2_pos,
            b2_pos,
            a2_neg,
            b2_neg,
        })
    }

    #[must_use]
    pub fn reynolds(&self) -> f64 {
        self.reynolds
    }

    #[must_use]
    pub fn aspect_ratio(&self) -> f64 {
        self.aspect_ratio
    }

    #[must_use]
    pub fn cd_max(&self) -> f64 {
        self.cd_max
    }

    #[must_use]
    pub fn points(&self) -> &[PolarPoint] {
        &self.points
    }

    /// Evaluates $(C_l, C_d)$ at any angle of attack `alpha_deg` (wrapped into
    /// $[-180^\circ, +180^\circ]$).
    pub fn eval(&self, alpha_deg: f64) -> Result<PolarEval, AeroError> {
        if !alpha_deg.is_finite() {
            return Err(AeroError::NonFiniteInput {
                field: "alpha_deg",
                value: alpha_deg,
            });
        }
        let alpha = wrap_alpha_deg(alpha_deg);
        let alpha_min = self.points[0].alpha_deg;
        let alpha_max = self.points[self.points.len() - 1].alpha_deg;

        if alpha >= alpha_min && alpha <= alpha_max {
            // Piecewise linear interpolation inside attached/stall table
            let idx = self
                .points
                .partition_point(|p| p.alpha_deg < alpha)
                .saturating_sub(1)
                .min(self.points.len() - 2);
            let p0 = self.points[idx];
            let p1 = self.points[idx + 1];
            let span = (p1.alpha_deg - p0.alpha_deg).max(1e-12);
            let t = ((alpha - p0.alpha_deg) / span).clamp(0.0, 1.0);
            return Ok(PolarEval {
                alpha_deg: alpha,
                cl: p0.cl + t * (p1.cl - p0.cl),
                cd: (p0.cd + t * (p1.cd - p0.cd)).max(MIN_POST_STALL_CD),
            });
        }

        if alpha > alpha_max && alpha <= 90.0 {
            let rad = alpha.to_radians();
            let (sin_a, cos_a) = rad.sin_cos();
            let cl = self.a1 * (2.0 * rad).sin() + self.a2_pos * (cos_a * cos_a) / sin_a;
            let cd = (self.cd_max * sin_a * sin_a + self.b2_pos * cos_a)
                .clamp(MIN_POST_STALL_CD, self.cd_max);
            return Ok(PolarEval {
                alpha_deg: alpha,
                cl,
                cd,
            });
        }

        if alpha < alpha_min && alpha >= -90.0 {
            let theta = (-alpha).to_radians();
            let (sin_t, cos_t) = theta.sin_cos();
            let cl = -(self.a1 * (2.0 * theta).sin() + self.a2_neg * (cos_t * cos_t) / sin_t);
            let cd = (self.cd_max * sin_t * sin_t + self.b2_neg * cos_t)
                .clamp(MIN_POST_STALL_CD, self.cd_max);
            return Ok(PolarEval {
                alpha_deg: alpha,
                cl,
                cd,
            });
        }

        // Deep reverse flow: |alpha| in (90 deg, 180 deg]
        let rad = alpha.to_radians();
        let sin_a = rad.sin();
        let cl = REVERSE_FLOW_LIFT_FACTOR * self.a1 * (2.0 * rad).sin();
        let cd = (self.cd_180 + (self.cd_max - self.cd_180) * sin_a * sin_a).max(MIN_POST_STALL_CD);
        Ok(PolarEval {
            alpha_deg: alpha,
            cl,
            cd,
        })
    }
}
