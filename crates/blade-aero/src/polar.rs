//! Precomputed low-Reynolds airfoil polar sets and bilinear `(Re, α)` lookup (`T-301`).

use std::collections::BTreeMap;

use blade_model::ResolvedAirfoil;
use serde::{Deserialize, Serialize};

use crate::error::AeroError;
use crate::viterna::{PolarEval, PolarPoint, ViternaSweep};

const SG6043_JSON: &str = include_str!("../../../data/polars/sg6043.json");
const SD7062_JSON: &str = include_str!("../../../data/polars/sd7062.json");
const E387_JSON: &str = include_str!("../../../data/polars/e387.json");
const NACA4412_JSON: &str = include_str!("../../../data/polars/naca4412.json");
const NACA0012_JSON: &str = include_str!("../../../data/polars/naca0012.json");
const NACA2415_JSON: &str = include_str!("../../../data/polars/naca2415.json");
const NACA6409_JSON: &str = include_str!("../../../data/polars/naca6409.json");

/// Canonical names of built-in precomputed airfoil polar tables.
pub const BUILTIN_POLAR_NAMES: &[&str] = &[
    "SG6043", "SD7062", "E387", "NACA4412", "NACA0012", "NACA2415", "NACA6409",
];

/// Raw JSON schema for a single Reynolds polar sweep.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PolarSweepSpec {
    pub reynolds: f64,
    pub points: Vec<PolarPoint>,
}

/// Raw JSON schema for a multi-Reynolds airfoil polar file (`data/polars/*.json`).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PolarTableSpec {
    pub name: String,
    pub aspect_ratio: f64,
    pub sweeps: Vec<PolarSweepSpec>,
}

/// Multi-Reynolds 360-degree Viterna-extrapolated polar table for a single airfoil.
#[derive(Debug, Clone, PartialEq)]
pub struct PolarTable {
    name: String,
    aspect_ratio: f64,
    sweeps: Vec<ViternaSweep>,
}

impl PolarTable {
    /// Builds a validated `PolarTable` from a `PolarTableSpec`.
    pub fn from_spec(spec: PolarTableSpec) -> Result<Self, AeroError> {
        if spec.sweeps.is_empty() {
            return Err(AeroError::EmptyPolarTable { name: spec.name });
        }
        let mut sweeps = Vec::with_capacity(spec.sweeps.len());
        for s in spec.sweeps {
            sweeps.push(ViternaSweep::new(
                &spec.name,
                s.reynolds,
                spec.aspect_ratio,
                s.points,
            )?);
        }
        sweeps.sort_by(|a, b| a.reynolds().total_cmp(&b.reynolds()));
        Ok(Self {
            name: spec.name,
            aspect_ratio: spec.aspect_ratio,
            sweeps,
        })
    }

    /// Parses a `PolarTable` from a JSON string (`data/polars/*.json` format).
    pub fn from_json(json: &str) -> Result<Self, AeroError> {
        let spec: PolarTableSpec =
            serde_json::from_str(json).map_err(|e| AeroError::InvalidJson(e.to_string()))?;
        Self::from_spec(spec)
    }

    /// Synthesizes a low-Reynolds 4-digit NACA polar table with Viterna 360°
    /// extrapolation from `(max_camber, camber_position, thickness_ratio)` via
    /// the `NeuralFoil`-style Glauert + viscous boundary-layer surrogate (`T-402`).
    pub fn from_naca4_params(
        max_camber: f64,
        camber_position: f64,
        thickness_ratio: f64,
        aspect_ratio: f64,
    ) -> Result<Self, AeroError> {
        crate::neuralfoil::synthesize_naca4_polar(
            max_camber,
            camber_position,
            thickness_ratio,
            aspect_ratio,
        )
    }

    /// Synthesizes a low-Reynolds 360° polar table directly from an arbitrary 2D
    /// airfoil coordinate contour (`(x, y)` points) via `NeuralFoil` feature
    /// extraction (`T-402`).
    pub fn from_contour(
        name: &str,
        points: &[(f64, f64)],
        aspect_ratio: f64,
    ) -> Result<Self, AeroError> {
        crate::neuralfoil::synthesize_contour_polar(name, points, aspect_ratio)
    }

    #[must_use]
    pub fn name(&self) -> &str {
        &self.name
    }

    #[must_use]
    pub fn aspect_ratio(&self) -> f64 {
        self.aspect_ratio
    }

    #[must_use]
    pub fn sweeps(&self) -> &[ViternaSweep] {
        &self.sweeps
    }

    /// Evaluates $(C_l, C_d)$ at angle of attack `alpha_deg` (any angle in
    /// $[-180^\circ, +180^\circ]$) and Reynolds number `reynolds`, interpolating
    /// linearly between bracketing Reynolds sweeps.
    pub fn eval(&self, alpha_deg: f64, reynolds: f64) -> Result<PolarEval, AeroError> {
        if !reynolds.is_finite() || reynolds <= 0.0 {
            return Err(AeroError::NonFiniteInput {
                field: "reynolds",
                value: reynolds,
            });
        }
        if self.sweeps.len() == 1 || reynolds <= self.sweeps[0].reynolds() {
            return self.sweeps[0].eval(alpha_deg);
        }
        let last = &self.sweeps[self.sweeps.len() - 1];
        if reynolds >= last.reynolds() {
            return last.eval(alpha_deg);
        }

        let idx = self
            .sweeps
            .partition_point(|s| s.reynolds() < reynolds)
            .saturating_sub(1)
            .min(self.sweeps.len() - 2);
        let s0 = &self.sweeps[idx];
        let s1 = &self.sweeps[idx + 1];
        let e0 = s0.eval(alpha_deg)?;
        let e1 = s1.eval(alpha_deg)?;
        let t = ((reynolds - s0.reynolds()) / (s1.reynolds() - s0.reynolds())).clamp(0.0, 1.0);

        Ok(PolarEval {
            alpha_deg: e0.alpha_deg,
            cl: e0.cl + t * (e1.cl - e0.cl),
            cd: e0.cd + t * (e1.cd - e0.cd),
        })
    }
}

/// Collection of named `PolarTable` entries used by the BEM solver (`§8 PolarSet`).
#[derive(Debug, Clone, Default, PartialEq)]
pub struct PolarSet {
    tables: BTreeMap<String, PolarTable>,
}

impl PolarSet {
    /// Creates an empty `PolarSet`.
    #[must_use]
    pub fn new() -> Self {
        Self {
            tables: BTreeMap::new(),
        }
    }

    /// Loads the built-in low-Reynolds polar library (`SG6043`, `SD7062`, `E387`,
    /// `NACA4412`, `NACA0012`, `NACA2415`, `NACA6409`).
    #[must_use]
    pub fn builtin() -> Self {
        let mut set = Self::new();
        for raw in [
            SG6043_JSON,
            SD7062_JSON,
            E387_JSON,
            NACA4412_JSON,
            NACA0012_JSON,
            NACA2415_JSON,
            NACA6409_JSON,
        ] {
            let table = PolarTable::from_json(raw).expect("builtin polar JSON is valid");
            set.insert(table);
        }
        set
    }

    /// Inserts or replaces a `PolarTable` keyed by its uppercase trimmed name.
    pub fn insert(&mut self, table: PolarTable) {
        let key = normalize_airfoil_key(table.name());
        self.tables.insert(key, table);
    }

    /// Looks up a `PolarTable` by airfoil name (case-insensitive, ignoring spaces/hyphens).
    #[must_use]
    pub fn get(&self, name: &str) -> Option<&PolarTable> {
        self.tables.get(&normalize_airfoil_key(name))
    }

    /// Resolves a `PolarTable` for a `blade_model::ResolvedAirfoil`: returns a
    /// matching table from `self` if present, or synthesizes a NACA 4-digit
    /// Viterna-extrapolated table from the station's camber/thickness parameters.
    pub fn resolve_for_station(&self, airfoil: &ResolvedAirfoil) -> Result<PolarTable, AeroError> {
        if let Some(name) = &airfoil.name {
            if let Some(table) = self.get(name) {
                return Ok(table.clone());
            }
            return Err(AeroError::UnknownAirfoil(name.clone()));
        }

        let m_f = airfoil.max_camber * 100.0;
        let p_f = airfoil.camber_position * 10.0;
        let t_f = airfoil.thickness_ratio * 100.0;
        let m_pct = m_f.round() as u32;
        let p_tenth = p_f.round() as u32;
        let t_pct = t_f.round() as u32;
        if (m_f - f64::from(m_pct)).abs() < 1e-3
            && (p_f - f64::from(p_tenth)).abs() < 1e-3
            && (t_f - f64::from(t_pct)).abs() < 1e-3
        {
            let naca_key = format!("NACA{m_pct}{p_tenth}{t_pct:02}");
            if let Some(table) = self.get(&naca_key) {
                return Ok(table.clone());
            }
        }

        PolarTable::from_naca4_params(
            airfoil.max_camber,
            airfoil.camber_position,
            airfoil.thickness_ratio,
            12.0,
        )
    }
}

fn normalize_airfoil_key(name: &str) -> String {
    name.chars()
        .filter(|c| !c.is_whitespace() && *c != '-' && *c != '_')
        .collect::<String>()
        .to_ascii_uppercase()
}
