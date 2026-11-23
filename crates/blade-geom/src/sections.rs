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
    if !min_te_mm.is_finite() {
        return Err(GeomError::NonFinite {
            field: "min_trailing_edge_mm",
            value: min_te_mm,
        });
    }
    if min_te_mm < 0.0 {
        return Err(GeomError::OutOfRange {
            field: "min_trailing_edge_mm",
            value: min_te_mm,
            min: 0.0,
            max: f64::INFINITY,
        });
    }
    let root_span_mm = blade.stations[0].span_mm;
    let tip_span_mm = blade.stations[blade.stations.len() - 1].span_mm;
    if !root_span_mm.is_finite() || !tip_span_mm.is_finite() || tip_span_mm <= root_span_mm {
        return Err(GeomError::SpansNotIncreasing {
            index: blade.stations.len() - 1,
        });
    }
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
        let blended = blend_airfoils(&root_contour, &tip_contour, weight)?
            .with_min_trailing_edge_mm(min_te_mm)?;
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
    let raw = if let Some(name) = &resolved.name {
        let dat = library_airfoil(name)?;
        dat.surface(chord_mm, samples_per_surface)?
    } else {
        let profile = Naca4::new(
            resolved.max_camber,
            resolved.camber_position,
            resolved.thickness_ratio,
        )?;
        profile.surface(chord_mm, samples_per_surface)?
    };
    raw.with_min_trailing_edge_mm(min_te_mm)
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
    fn thickens_printable_trailing_edge_and_rejects_excessive_min_te() {
        let mut design = Design::from_json(FIXTURE).expect("fixture parses");
        design.manufacturing.min_trailing_edge_mm = 0.8;
        let blade = resolve(&design).expect("resolves with 0.8 mm printable TE");
        let sections = build_sections(&blade).expect("sections thicken cleanly to 0.8 mm");
        for section in &sections {
            assert!(
                section.trailing_edge_thickness_mm() + 1e-6 >= 0.8,
                "expected TE >= 0.8 mm, got {}",
                section.trailing_edge_thickness_mm()
            );
        }

        // Non-physical min_trailing_edge_mm (> 65% of max airfoil thickness) is rejected.
        design.manufacturing.min_trailing_edge_mm = 10.0;
        let bad_blade = resolve(&design).expect("still resolves");
        assert!(matches!(
            build_sections(&bad_blade),
            Err(GeomError::TrailingEdgeTooThin { .. })
        ));
    }

    #[test]
    fn thickens_thin_aft_cambered_sg6043_and_e387_profiles_for_slicers() {
        use blade_model::AirfoilSpec;

        for name in ["SG6043", "E387"] {
            let mut design = Design::from_json(FIXTURE).expect("fixture parses");
            design.manufacturing.min_trailing_edge_mm = 0.8;
            design.distributions.chord_mm = blade_model::CurveSource::Linear {
                root: 36.0,
                tip: 21.0,
            };
            design.overrides.clear();
            for st in &mut design.airfoils {
                st.airfoil = AirfoilSpec::Named {
                    name: name.to_string(),
                };
            }
            let blade = resolve(&design).expect("resolves thin named airfoil blade");
            let sections = build_sections(&blade).expect("sections thicken to 0.8 mm");
            for (idx, sec) in sections.iter().enumerate() {
                assert!(
                    sec.trailing_edge_thickness_mm() + 1e-6 >= 0.8,
                    "{name} station {idx}: expected TE >= 0.8 mm, got {}",
                    sec.trailing_edge_thickness_mm()
                );
                // Verify the aft 35% of the contour (stations d >= 50..=80 around TE)
                // never pinches below 0.8 mm!
                let pts = sec.points();
                let n_le = pts.len() / 2;
                for d in (n_le * 65 / 100)..=n_le {
                    let gap = pts[n_le - d].distance_to(&pts[n_le + d]);
                    assert!(
                        gap + 1e-6 >= 0.8,
                        "{name} station {idx} aft d={d}: gap {gap:.3} mm < 0.8 mm"
                    );
                }
            }
        }
    }

    #[test]
    fn build_blended_sections_rejects_nan_min_te() {
        let design = Design::from_json(FIXTURE).expect("fixture parses");
        let mut blade = resolve(&design).expect("fixture resolves");
        let root_af = blade.stations[0].airfoil.clone();
        let tip_af = blade.stations[blade.stations.len() - 1].airfoil.clone();
        blade.manufacturing.min_trailing_edge_mm = f64::NAN;
        assert!(
            build_blended_sections(&blade, &root_af, &tip_af).is_err(),
            "NaN min_trailing_edge_mm must be rejected"
        );
    }
}
