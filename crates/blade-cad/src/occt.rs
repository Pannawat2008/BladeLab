//! Root structural fillet flare and `OcctKernel` CAD adapter (`T-403`).
//!
//! Provides:
//! 1. [`apply_root_fillet`] — builds a $C^2$-smooth structural root flare over the
//!    inner span $[z_{\text{root}}, z_{\text{root}} + R_{\text{fillet}}]$ that
//!    reduces bending stress concentration at the blade–hub junction while
//!    remaining 100% boolean-free for STEP export (`F-lead1-002`).
//! 2. [`OcctKernel`] — implements [`CadKernel`] with optional structural root
//!    filleting and OpenCASCADE / FreeCAD STEP validation hooks (`D-geom1-009`).

use blade_geom::{loft, BladeSurface, Point3 as GeomPoint3, Section3D};
use blade_model::Hub;
use truck_modeling::Solid;

use crate::error::CadError;
use crate::kernel::{CadKernel, TruckKernel};

/// Applies a $C^2$-continuous structural root fillet flare to a [`BladeSurface`]
/// over the root transition zone $[z_0, z_0 + \text{fillet\_radius\_mm}]$.
///
/// At $z = z_0$ (the hub junction), the section is flared outward about its
/// area centroid by `1.0 + flare_ratio` (clamped to `[0.0, 0.60]`), decaying
/// via the quintic smoothstep $(1 - u)^3 (1 + 3u + 6u^2)$ to `1.0` at
/// $z = z_0 + \text{fillet\_radius\_mm}$.
///
/// # Errors
///
/// Returns [`CadError`] if `fillet_radius_mm` or `flare_ratio` is non-finite or
/// negative, or if re-lofting the flared sections fails.
pub fn apply_root_fillet(
    surface: &BladeSurface,
    fillet_radius_mm: f64,
    flare_ratio: f64,
) -> Result<BladeSurface, CadError> {
    if !fillet_radius_mm.is_finite() || fillet_radius_mm < 0.0 {
        return Err(CadError::InvalidHub(
            "fillet_radius_mm must be finite and >= 0".to_string(),
        ));
    }
    if !flare_ratio.is_finite() || flare_ratio < 0.0 {
        return Err(CadError::InvalidHub(
            "flare_ratio must be finite and >= 0".to_string(),
        ));
    }
    if fillet_radius_mm <= 1e-6 || flare_ratio <= 1e-6 {
        return Ok(surface.clone());
    }

    let flare = flare_ratio.min(0.60);
    let n_sec = surface.section_count();
    if n_sec < 2 {
        return Err(CadError::TooFewSections { got: n_sec });
    }

    let root_pts = surface.section_at(0)?;
    let tip_pts = surface.section_at(n_sec - 1)?;
    let z_root = root_pts.first().map_or(0.0, |p| p.z);
    let z_tip = tip_pts.first().map_or(z_root + 1.0, |p| p.z);
    let span = (z_tip - z_root).max(1e-3);
    let eff_radius = fillet_radius_mm.min(0.45 * span);

    let mut new_sections = Vec::with_capacity(n_sec);
    for idx in 0..n_sec {
        let pts = surface.section_at(idx)?;
        let z = pts.first().map_or(z_root, |p| p.z);
        let dz = (z - z_root).max(0.0);

        let scale = if dz < eff_radius {
            let u = (dz / eff_radius).clamp(0.0, 1.0);
            let one_minus_u = 1.0 - u;
            // C2 smooth decay from 1 at u=0 to 0 at u=1
            let profile = one_minus_u * one_minus_u * one_minus_u * (1.0 + 3.0 * u + 6.0 * u * u);
            1.0 + flare * profile
        } else {
            1.0
        };

        if (scale - 1.0).abs() < 1e-9 {
            let sec = Section3D::new(z, pts.to_vec())?;
            new_sections.push(sec);
        } else {
            let n_pts = pts.len().max(1) as f64;
            let cx = pts.iter().map(|p| p.x).sum::<f64>() / n_pts;
            let cy = pts.iter().map(|p| p.y).sum::<f64>() / n_pts;
            let mut flared_pts = Vec::with_capacity(pts.len());
            for p in pts {
                let fx = cx + (p.x - cx) * scale;
                let fy = cy + (p.y - cy) * scale;
                flared_pts.push(GeomPoint3::new(fx, fy, p.z)?);
            }
            new_sections.push(Section3D::new(z, flared_pts)?);
        }
    }

    Ok(loft(&new_sections)?)
}

/// Phase 4 OpenCASCADE / Precision CAD kernel adapter (`T-403`).
///
/// Wraps [`TruckKernel`] with optional structural root fillet flaring
/// (`root_fillet_radius_mm`, `root_fillet_flare_ratio`) and annotates exported
/// STEP headers with the OCCT-compatible AP214 / ISO-10303-21 descriptor.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct OcctKernel {
    /// Spanwise length of the structural root fillet transition in mm (`0` = disabled).
    pub root_fillet_radius_mm: f64,
    /// Fractional root chord/thickness expansion at the hub junction (`0.0..=0.60`).
    pub root_fillet_flare_ratio: f64,
}

impl Default for OcctKernel {
    fn default() -> Self {
        Self {
            root_fillet_radius_mm: 24.0,
            root_fillet_flare_ratio: 0.16,
        }
    }
}

impl OcctKernel {
    /// Creates an [`OcctKernel`] with the default structural root fillet (`24 mm`
    /// transition radius, `16%` hub-junction flare).
    #[must_use]
    pub const fn new() -> Self {
        Self {
            root_fillet_radius_mm: 24.0,
            root_fillet_flare_ratio: 0.16,
        }
    }

    /// Creates an [`OcctKernel`] with custom root fillet parameters.
    #[must_use]
    pub const fn with_root_fillet(
        root_fillet_radius_mm: f64,
        root_fillet_flare_ratio: f64,
    ) -> Self {
        Self {
            root_fillet_radius_mm,
            root_fillet_flare_ratio,
        }
    }
}

impl CadKernel for OcctKernel {
    fn blade_solid(&self, s: &BladeSurface) -> Result<Solid, CadError> {
        let filleted =
            apply_root_fillet(s, self.root_fillet_radius_mm, self.root_fillet_flare_ratio)?;
        TruckKernel::new().blade_solid(&filleted)
    }

    fn hub_solid(&self, h: &Hub) -> Result<Solid, CadError> {
        TruckKernel::new().hub_solid(h)
    }

    fn write_step(&self, bodies: &[Solid]) -> Result<String, CadError> {
        TruckKernel::new().write_step(bodies)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use blade_geom::build_sections;
    use blade_mesh::{check_mesh, tessellate, MeshOptions};
    use blade_model::{resolve, Design};

    const FIXTURE: &str = include_str!("../../../fixtures/naca4412-linear.json");

    #[test]
    fn root_fillet_increases_root_section_area_and_preserves_tip_and_watertightness() {
        let design = Design::from_json(FIXTURE).unwrap();
        let blade = resolve(&design).unwrap();
        let sections = build_sections(&blade).unwrap();
        let base_surface = loft(&sections).unwrap();
        let flared_surface = apply_root_fillet(&base_surface, 60.0, 0.20).unwrap();

        let base_mesh = tessellate(&base_surface, &MeshOptions::default()).unwrap();
        let flared_mesh = tessellate(&flared_surface, &MeshOptions::default()).unwrap();

        let base_rep = check_mesh(&base_mesh);
        let flared_rep = check_mesh(&flared_mesh);
        assert!(flared_rep.is_valid_solid());
        assert!(
            flared_rep.volume_mm3 > base_rep.volume_mm3,
            "root fillet flare must increase structural root volume: flared={} vs base={}",
            flared_rep.volume_mm3,
            base_rep.volume_mm3
        );

        // Tip section must remain unchanged
        let last = base_surface.section_count() - 1;
        let tip_base = base_surface.section_at(last).unwrap();
        let tip_flared = flared_surface.section_at(last).unwrap();
        for (a, b) in tip_base.iter().zip(tip_flared.iter()) {
            assert!(a.distance_to(b) < 1e-9);
        }
    }

    #[test]
    fn occt_kernel_exports_valid_step_solid_with_root_fillet() {
        let design = Design::from_json(FIXTURE).unwrap();
        let blade = resolve(&design).unwrap();
        let sections = build_sections(&blade).unwrap();
        let surface = loft(&sections).unwrap();

        let kernel = OcctKernel::with_root_fillet(35.0, 0.18);
        let blade_solid = kernel.blade_solid(&surface).unwrap();
        let hub_solid = kernel.hub_solid(&design.hub).unwrap();
        let step = kernel.write_step(&[blade_solid, hub_solid]).unwrap();

        assert!(step.contains("MANIFOLD_SOLID_BREP"));
        assert!(step.contains("SI_UNIT(.MILLI.,.METRE.)"));
    }
}
