//! Adapter from resolved design stations to 3-D cross-sections.
//!
//! `build_sections` is the only place where design parameters become geometry:
//! it evaluates the 4-digit NACA profile at each station, scales it to the
//! station chord, applies the station twist about the rotor pitch axis and
//! places it at its span station. `loft` then binds the sections into the
//! surface used by mesh generation and CAD export.
//!
//! This module is the implementation of the `build_sections` contract in §8 of
//! `plan.md`; the signature is fixed by that contract.

use blade_model::{ResolvedAirfoil, ResolvedBlade};

use crate::airfoil::{blend_airfoils, library_airfoil, Airfoil, Naca4};
use crate::error::GeomError;
use crate::surface::Section3D;

/// Chordwise samples per surface used by [`build_sections`].
///
/// An odd, cosine-spaced count keeps the leading edge explicit and gives mesh
/// generation enough resolution for a smooth surface (161 points around the
/// contour).
pub const SECTION_SAMPLES_PER_SURFACE: usize = 81;

/// Builds the 3-D cross-sections of a resolved blade, ordered root → tip.
///
/// The trailing edge of every section is checked against
/// `manufacturing.min_trailing_edge_mm` before the section is accepted, so a
/// design that cannot be printed fails here instead of in the slicer.
///
/// # Errors
///
/// - [`GeomError::TooFewSections`] when fewer than two resolved stations are
///   supplied (a surface needs at least two sections).
/// - [`GeomError::InvalidChord`] / [`GeomError::OutOfRange`] when a station's
///   parameters are outside the NACA or section-placement domain.
/// - [`GeomError::InvalidAirfoilData`] when a named airfoil is not in the
///   built-in library.
/// - [`GeomError::TrailingEdgeTooThin`] when a section violates the
///   manufacturing limit.
pub fn build_sections(blade: &ResolvedBlade) -> Result<Vec<Section3D>, GeomError> {
    if blade.stations.len() < 2 {
        return Err(GeomError::TooFewSections {
            min: 2,
            got: blade.stations.len(),
        });
    }

    let pitch_axis_ratio = blade.rotor.pitch_axis_ratio;
    let min_te_mm = blade.manufacturing.min_trailing_edge_mm;
    let mut sections = Vec::with_capacity(blade.stations.len());

    for station in &blade.stations {
        let airfoil = eval_resolved_airfoil(
            &station.airfoil,
            station.chord_mm,
            min_te_mm,
            SECTION_SAMPLES_PER_SURFACE,
        )?;
        sections.push(Section3D::from_airfoil(
            &airfoil,
            station.chord_mm,
            station.twist_deg,
            pitch_axis_ratio,
            station.span_mm,
        )?);
    }

    Ok(sections)
}

/// Builds 3-D cross-sections by linearly blending between `root_airfoil` at the
/// blade root and `tip_airfoil` at the blade tip (`T-202`).
///
/// Each station's contour is interpolated at its normalised blade-span position
/// `s = (r - r_hub) / (R - r_hub)` via [`blend_airfoils`], checked against
/// `manufacturing.min_trailing_edge_mm`, and placed in 3-D.
///
/// # Errors
///
/// Returns [`GeomError`] if station count is `< 2`, either airfoil fails to
/// evaluate, or any blended section violates the trailing-edge thickness limit.
pub fn build_blended_sections(
    blade: &ResolvedBlade,
    root_airfoil: &ResolvedAirfoil,
    tip_airfoil: &ResolvedAirfoil,
) -> Result<Vec<Section3D>, GeomError> {
    if blade.stations.len() < 2 {
        return Err(GeomError::TooFewSections {
            min: 2,
            got: blade.stations.len(),
        });
    }

    let pitch_axis_ratio = blade.rotor.pitch_axis_ratio;
    let min_te_mm = blade.manufacturing.min_trailing_edge_mm;
    let root_span_mm = blade.stations[0].span_mm;
    let tip_span_mm = blade.stations[blade.stations.len() - 1].span_mm;
    let span_range = (tip_span_mm - root_span_mm).max(1e-9);

    let mut sections = Vec::with_capacity(blade.stations.len());
    for station in &blade.stations {
        let weight = ((station.span_mm - root_span_mm) / span_range).clamp(0.0, 1.0);
        let root_contour = eval_resolved_airfoil(
            root_airfoil,
            station.chord_mm,
            0.0,
            SECTION_SAMPLES_PER_SURFACE,
        )?;
        let tip_contour = eval_resolved_airfoil(
            tip_airfoil,
            station.chord_mm,
            0.0,
            SECTION_SAMPLES_PER_SURFACE,
        )?;
        let blended = blend_airfoils(&root_contour, &tip_contour, weight)?;
        let actual_mm = blended.trailing_edge_thickness_mm();
        if actual_mm < min_te_mm {
            return Err(GeomError::TrailingEdgeTooThin {
                actual_mm,
                min_mm: min_te_mm,
            });
        }
        sections.push(Section3D::from_airfoil(
            &blended,
            station.chord_mm,
            station.twist_deg,
            pitch_axis_ratio,
            station.span_mm,
        )?);
    }

    Ok(sections)
}

fn eval_resolved_airfoil(
    resolved: &ResolvedAirfoil,
    chord_mm: f64,
    min_te_mm: f64,
    samples_per_surface: usize,
) -> Result<Airfoil, GeomError> {
    if let Some(name) = &resolved.name {
        let dat = library_airfoil(name)?;
        dat.check_trailing_edge(chord_mm, min_te_mm)?;
        dat.surface(chord_mm, samples_per_surface)
    } else {
        let profile = Naca4::new(
            resolved.max_camber,
            resolved.camber_position,
            resolved.thickness_ratio,
        )?;
        profile.check_trailing_edge(chord_mm, min_te_mm)?;
        profile.surface(chord_mm, samples_per_surface)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use blade_model::resolve;
    use blade_model::Design;

    const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

    #[test]
    fn builds_one_section_per_station() {
        let design = Design::from_json(FIXTURE).expect("fixture parses");
        let blade = resolve(&design).expect("fixture resolves");
        let sections = build_sections(&blade).expect("sections build");

        assert_eq!(sections.len(), blade.stations.len());
        for (section, station) in sections.iter().zip(&blade.stations) {
            assert_eq!(section.points().len(), 2 * SECTION_SAMPLES_PER_SURFACE - 1);
            assert!((section.span_mm() - station.span_mm).abs() < 1e-9);
            for point in section.points() {
                assert!(point.x.is_finite() && point.y.is_finite() && point.z.is_finite());
            }
        }
        // Root → tip ordering is preserved for lofting.
        for pair in sections.windows(2) {
            assert!(pair[1].span_mm() > pair[0].span_mm());
        }
    }

    #[test]
    fn trailing_edge_respects_the_manufacturing_limit() {
        let design = Design::from_json(FIXTURE).expect("fixture parses");
        let blade = resolve(&design).expect("fixture resolves");
        let sections = build_sections(&blade).expect("sections build");

        let min_te = blade.manufacturing.min_trailing_edge_mm;
        for section in &sections {
            assert!(section.trailing_edge_thickness_mm() >= min_te);
        }
        // The root section uses the layer-2 chord (70 mm) and NACA 4412.
        let expected = 0.021 * 0.12 * 70.0;
        assert!((sections[0].trailing_edge_thickness_mm() - expected).abs() < 1e-9);
    }

    #[test]
    fn rejects_a_design_whose_trailing_edge_is_too_thin() {
        let mut design = Design::from_json(FIXTURE).expect("fixture parses");
        design.manufacturing.min_trailing_edge_mm = 1.0;
        let blade = resolve(&design).expect("still resolves");
        assert!(matches!(
            build_sections(&blade),
            Err(GeomError::TrailingEdgeTooThin { .. })
        ));
    }
}
