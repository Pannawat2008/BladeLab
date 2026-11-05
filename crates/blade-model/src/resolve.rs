//! Resolution: merge layer 1, layer 2 and layer 3 into a concrete blade.
//!
//! [`resolve`] validates the design, samples the spanwise curves at the
//! requested station count, applies layer-3 overrides and assigns the airfoil
//! of each station. The result is the only input `blade-geom::build_sections`
//! needs.

use std::cmp::Ordering;

use crate::error::ModelError;
use crate::schema::{AirfoilSpec, AirfoilStation, Design, Hub, Manufacturing, Rotor};
use crate::{validate, RATIO_EPS};

/// A design that passed validation and layer merging.
#[derive(Debug, Clone, PartialEq)]
pub struct ResolvedBlade {
    /// Rotor parameters, copied from the design.
    pub rotor: Rotor,
    /// Cross-sections ordered from root to tip (at least two).
    pub stations: Vec<ResolvedStation>,
    /// Hub parameters, copied from the design.
    pub hub: Hub,
    /// Manufacturing limits, copied from the design.
    pub manufacturing: Manufacturing,
}

/// One concrete cross-section after layer merging.
#[derive(Debug, Clone, PartialEq)]
pub struct ResolvedStation {
    /// Station position as `r / R`.
    pub span_ratio: f64,
    /// Station position in mm (`span_ratio · rotor.radius_mm`).
    pub span_mm: f64,
    /// Chord in mm (layer 2, possibly overridden by layer 3).
    pub chord_mm: f64,
    /// Twist in degrees (layer 2, possibly overridden by layer 3).
    pub twist_deg: f64,
    /// Airfoil parameters for this station.
    pub airfoil: ResolvedAirfoil,
}

/// Airfoil parameters handed to the geometry kernel.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ResolvedAirfoil {
    /// Maximum camber ratio `m`.
    pub max_camber: f64,
    /// Camber position `p`.
    pub camber_position: f64,
    /// Thickness ratio `t`.
    pub thickness_ratio: f64,
}

/// Merges the three parameterisation layers into concrete sections.
///
/// Station positions are the union of `rotor.station_count` uniform stations
/// over `[hub_radius, radius]` and every override position, sorted and
/// de-duplicated within [`RATIO_EPS`].
///
/// Curve sources are evaluated with `s = (span_ratio − hub_ratio) / (1 −
/// hub_ratio)`, so `root` is the value at the hub surface and `tip` the value
/// at the tip.
///
/// # Errors
///
/// - [`ModelError::Invalid`] with every validation issue when the design is
///   invalid.
/// - [`ModelError::UnsupportedAirfoil`] when a named airfoil is referenced
///   before T-202 lands.
/// - [`ModelError::MissingAirfoil`] if no airfoil covers a station (unreachable
///   after validation).
pub fn resolve(design: &Design) -> Result<ResolvedBlade, ModelError> {
    validate(design).map_err(ModelError::Invalid)?;

    let radius = design.rotor.radius_mm;
    let root_ratio = design.rotor.hub_radius_mm / radius;
    let span = 1.0 - root_ratio;

    let mut ratios = uniform_stations(root_ratio, design.rotor.station_count as usize);
    ratios.extend(design.overrides.iter().map(|station| station.span_ratio));
    ratios.sort_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
    ratios.dedup_by(|a, b| (*a - *b).abs() <= RATIO_EPS);

    let mut stations = Vec::with_capacity(ratios.len());
    for ratio in ratios {
        let s = ((ratio - root_ratio) / span).clamp(0.0, 1.0);
        let mut chord_mm = design
            .distributions
            .chord_mm
            .eval_chord(&design.rotor, ratio, s);
        let mut twist_deg = design
            .distributions
            .twist_deg
            .eval_twist(&design.rotor, ratio, s);
        let mut spec = pick_airfoil(&design.airfoils, ratio)?;

        if let Some(over) = design
            .overrides
            .iter()
            .find(|over| (over.span_ratio - ratio).abs() <= RATIO_EPS)
        {
            if let Some(chord) = over.chord_mm {
                chord_mm = chord;
            }
            if let Some(twist) = over.twist_deg {
                twist_deg = twist;
            }
            if let Some(airfoil) = &over.airfoil {
                spec = airfoil;
            }
        }

        stations.push(ResolvedStation {
            span_ratio: ratio,
            span_mm: ratio * radius,
            chord_mm,
            twist_deg,
            airfoil: resolve_airfoil(spec)?,
        });
    }

    Ok(ResolvedBlade {
        rotor: design.rotor.clone(),
        stations,
        hub: design.hub.clone(),
        manufacturing: design.manufacturing.clone(),
    })
}

fn uniform_stations(root_ratio: f64, count: usize) -> Vec<f64> {
    let last = (count - 1) as f64;
    (0..count)
        .map(|index| root_ratio + (1.0 - root_ratio) * index as f64 / last)
        .collect()
}

/// Picks the airfoil whose station is the last one at or below `ratio`.
fn pick_airfoil(stations: &[AirfoilStation], ratio: f64) -> Result<&AirfoilSpec, ModelError> {
    let mut chosen = None;
    for station in stations {
        if station.span_ratio <= ratio + RATIO_EPS {
            chosen = Some(&station.airfoil);
        } else {
            break;
        }
    }
    chosen.ok_or(ModelError::MissingAirfoil(ratio))
}

fn resolve_airfoil(spec: &AirfoilSpec) -> Result<ResolvedAirfoil, ModelError> {
    match spec {
        AirfoilSpec::Naca4 {
            max_camber,
            camber_position,
            thickness_ratio,
        } => Ok(ResolvedAirfoil {
            max_camber: *max_camber,
            camber_position: *camber_position,
            thickness_ratio: *thickness_ratio,
        }),
        AirfoilSpec::Named { name } => Err(ModelError::UnsupportedAirfoil(name.clone())),
    }
}
