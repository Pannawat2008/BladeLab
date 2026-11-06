//! Design persistence and immutable version tracking (`T-204`).
//!
//! Provides the canonical PostgreSQL DDL ([`POSTGRES_SCHEMA_SQL`], embedded from
//! `migrations/0001_designs.sql`) and the transactional [`DesignStore`] backing
//! the `/api/v1/designs` CRUD and version-history endpoints.

use std::collections::BTreeMap;
use std::sync::{Arc, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};

use blade_model::{validate, Design, ValidationIssue, SCHEMA_VERSION};
use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Canonical PostgreSQL schema migration (`migrations/0001_designs.sql`).
pub const POSTGRES_SCHEMA_SQL: &str = include_str!("../migrations/0001_designs.sql");

/// Default team workspace ID when none is specified.
pub const DEFAULT_TEAM_ID: &str = "team-default";

/// Default author handle when none is specified.
pub const DEFAULT_AUTHOR: &str = "engineer";

fn default_team_id() -> String {
    DEFAULT_TEAM_ID.to_string()
}

fn default_author() -> String {
    DEFAULT_AUTHOR.to_string()
}

/// Team workspace account (`T-404`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TeamAccount {
    /// Stable team slug/identifier (e.g. `"team-default"`).
    pub id: String,
    /// Human-readable team display name.
    pub name: String,
    /// Member handles belonging to the workspace.
    pub members: Vec<String>,
    /// Creation timestamp (milliseconds since Unix epoch).
    pub created_at_epoch_ms: u64,
}

/// Summary metadata for a stored design (returned by `GET /api/v1/designs`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DesignSummary {
    /// Stable design identifier (e.g. `"dsn-0001"`).
    pub id: String,
    /// Human-readable design name.
    pub name: String,
    /// Owning team workspace identifier (`T-404`).
    #[serde(default = "default_team_id")]
    pub team_id: String,
    /// Author who last updated this design (`T-404`).
    #[serde(default = "default_author")]
    pub author: String,
    /// Latest version number (`>= 1`).
    pub current_version: u32,
    /// `blake3` hex digest of the canonicalised latest design JSON.
    pub content_blake3: String,
    /// Creation timestamp (milliseconds since Unix epoch).
    pub created_at_epoch_ms: u64,
    /// Last-updated timestamp (milliseconds since Unix epoch).
    pub updated_at_epoch_ms: u64,
}

/// Complete stored design record including the active [`Design`] payload.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DesignRecord {
    /// Stable design identifier.
    pub id: String,
    /// Human-readable design name.
    pub name: String,
    /// Owning team workspace identifier (`T-404`).
    #[serde(default = "default_team_id")]
    pub team_id: String,
    /// Author who last updated this design (`T-404`).
    #[serde(default = "default_author")]
    pub author: String,
    /// Latest version number (`>= 1`).
    pub current_version: u32,
    /// `blake3` hex digest of the canonicalised latest design JSON.
    pub content_blake3: String,
    /// Creation timestamp (milliseconds since Unix epoch).
    pub created_at_epoch_ms: u64,
    /// Last-updated timestamp (milliseconds since Unix epoch).
    pub updated_at_epoch_ms: u64,
    /// Active [`Design`] document at `current_version`.
    pub design: Design,
}

impl DesignRecord {
    /// Extracts the lightweight [`DesignSummary`] without cloning the full [`Design`].
    #[must_use]
    pub fn summary(&self) -> DesignSummary {
        DesignSummary {
            id: self.id.clone(),
            name: self.name.clone(),
            team_id: self.team_id.clone(),
            author: self.author.clone(),
            current_version: self.current_version,
            content_blake3: self.content_blake3.clone(),
            created_at_epoch_ms: self.created_at_epoch_ms,
            updated_at_epoch_ms: self.updated_at_epoch_ms,
        }
    }
}

/// One immutable historical snapshot in `design_versions`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DesignVersionRecord {
    /// Parent design identifier.
    pub design_id: String,
    /// Monotonically increasing version number (`1, 2, ...`).
    pub version: u32,
    /// Design name at the time this version was recorded.
    pub name: String,
    /// Author who committed this version (`T-404`).
    #[serde(default = "default_author")]
    pub author: String,
    /// Optional commit/revision note describing the change.
    pub note: Option<String>,
    /// `blake3` hex digest of the canonicalised design JSON for this version.
    pub content_blake3: String,
    /// Timestamp when this version was committed (milliseconds since Unix epoch).
    pub created_at_epoch_ms: u64,
    /// Immutable [`Design`] snapshot for this version.
    pub design: Design,
}

/// Errors returned by [`DesignStore`] operations.
#[derive(Debug, Error)]
pub enum StoreError {
    /// Design name was empty or whitespace-only.
    #[error("design name must not be empty")]
    EmptyName,

    /// Design schema version is unsupported.
    #[error("unsupported schema_version {found} (expected {SCHEMA_VERSION})")]
    UnsupportedSchema {
        /// Version found in payload.
        found: u32,
    },

    /// Design failed semantic validation.
    #[error("design validation failed")]
    InvalidDesign(Vec<ValidationIssue>),

    /// Requested design ID does not exist.
    #[error("design `{0}` not found")]
    NotFound(String),

    /// Requested version number does not exist for the given design ID.
    #[error("version {version} of design `{design_id}` not found")]
    VersionNotFound {
        /// Design ID.
        design_id: String,
        /// Requested version number.
        version: u32,
    },
}

#[derive(Debug)]
struct StoreInner {
    next_seq: u64,
    teams: BTreeMap<String, TeamAccount>,
    designs: BTreeMap<String, DesignRecord>,
    versions: BTreeMap<String, Vec<DesignVersionRecord>>,
}

impl Default for StoreInner {
    fn default() -> Self {
        let now = now_epoch_ms();
        let mut teams = BTreeMap::new();
        teams.insert(
            DEFAULT_TEAM_ID.to_string(),
            TeamAccount {
                id: DEFAULT_TEAM_ID.to_string(),
                name: "BladeLab Core Team".to_string(),
                members: vec!["lead".to_string(), "aero".to_string(), "cad".to_string()],
                created_at_epoch_ms: now,
            },
        );
        teams.insert(
            "team-comp".to_string(),
            TeamAccount {
                id: "team-comp".to_string(),
                name: "Wind Turbine Competition Team".to_string(),
                members: vec!["panna".to_string(), "rotor-dev".to_string()],
                created_at_epoch_ms: now,
            },
        );
        Self {
            next_seq: 0,
            teams,
            designs: BTreeMap::new(),
            versions: BTreeMap::new(),
        }
    }
}

/// Thread-safe transactional store for designs and their version histories (`T-204`).
#[derive(Debug, Clone, Default)]
pub struct DesignStore {
    inner: Arc<RwLock<StoreInner>>,
    database_url: Option<String>,
}

impl DesignStore {
    /// Creates an empty [`DesignStore`].
    #[must_use]
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(StoreInner::default())),
            database_url: std::env::var("DATABASE_URL").ok(),
        }
    }

    /// Creates a [`DesignStore`] configured with an explicit PostgreSQL `database_url`.
    #[must_use]
    pub fn with_database_url(database_url: impl Into<String>) -> Self {
        Self {
            inner: Arc::new(RwLock::new(StoreInner::default())),
            database_url: Some(database_url.into()),
        }
    }

    /// Returns the configured PostgreSQL connection URL, if any.
    #[must_use]
    pub fn database_url(&self) -> Option<&str> {
        self.database_url.as_deref()
    }

    /// Returns the PostgreSQL schema DDL (`migrations/0001_designs.sql`).
    #[must_use]
    pub const fn schema_sql() -> &'static str {
        POSTGRES_SCHEMA_SQL
    }

    /// Validates and stores a new design at `version = 1`.
    ///
    /// # Errors
    ///
    /// Returns [`StoreError`] if `name` is empty or `design` fails validation.
    pub fn create(
        &self,
        name: String,
        design: Design,
        note: Option<String>,
    ) -> Result<DesignRecord, StoreError> {
        self.create_scoped(name, design, note, None, None)
    }

    /// Validates and stores a new design at `version = 1` scoped to a team and author (`T-404`).
    ///
    /// # Errors
    ///
    /// Returns [`StoreError`] if `name` is empty or `design` fails validation.
    pub fn create_scoped(
        &self,
        name: String,
        design: Design,
        note: Option<String>,
        team_id: Option<String>,
        author: Option<String>,
    ) -> Result<DesignRecord, StoreError> {
        let trimmed_name = name.trim().to_string();
        if trimmed_name.is_empty() {
            return Err(StoreError::EmptyName);
        }
        validate_design_payload(&design)?;
        let digest = canonical_design_blake3(&design);
        let now = now_epoch_ms();
        let eff_team = team_id
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .unwrap_or_else(default_team_id);
        let eff_author = author
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .unwrap_or_else(default_author);

        let mut guard = self
            .inner
            .write()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        guard.next_seq += 1;
        let id = format!("dsn-{:04}", guard.next_seq);

        guard
            .teams
            .entry(eff_team.clone())
            .or_insert_with(|| TeamAccount {
                id: eff_team.clone(),
                name: eff_team.clone(),
                members: vec![eff_author.clone()],
                created_at_epoch_ms: now,
            });

        let record = DesignRecord {
            id: id.clone(),
            name: trimmed_name.clone(),
            team_id: eff_team,
            author: eff_author.clone(),
            current_version: 1,
            content_blake3: digest.clone(),
            created_at_epoch_ms: now,
            updated_at_epoch_ms: now,
            design: design.clone(),
        };
        let version_record = DesignVersionRecord {
            design_id: id.clone(),
            version: 1,
            name: trimmed_name,
            author: eff_author,
            note,
            content_blake3: digest,
            created_at_epoch_ms: now,
            design,
        };

        guard.designs.insert(id.clone(), record.clone());
        guard.versions.insert(id, vec![version_record]);

        Ok(record)
    }

    /// Lists all stored designs ordered by ID.
    #[must_use]
    pub fn list(&self) -> Vec<DesignSummary> {
        self.list_for_team(None)
    }

    /// Lists stored designs optionally filtered by `team_id` (`T-404`).
    #[must_use]
    pub fn list_for_team(&self, team_id: Option<&str>) -> Vec<DesignSummary> {
        let guard = self
            .inner
            .read()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        guard
            .designs
            .values()
            .filter(|rec| match team_id {
                Some(t) if !t.trim().is_empty() && t.trim() != "all" => rec.team_id == t.trim(),
                _ => true,
            })
            .map(DesignRecord::summary)
            .collect()
    }

    /// Lists all registered team workspaces (`T-404`).
    #[must_use]
    pub fn list_teams(&self) -> Vec<TeamAccount> {
        let guard = self
            .inner
            .read()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        guard.teams.values().cloned().collect()
    }

    /// Creates or updates a team workspace (`T-404`).
    ///
    /// # Errors
    ///
    /// Returns [`StoreError::EmptyName`] if `id` or `name` is empty.
    pub fn upsert_team(
        &self,
        id: String,
        name: String,
        members: Vec<String>,
    ) -> Result<TeamAccount, StoreError> {
        let tid = id.trim().to_string();
        let tname = name.trim().to_string();
        if tid.is_empty() || tname.is_empty() {
            return Err(StoreError::EmptyName);
        }
        let now = now_epoch_ms();
        let mut guard = self
            .inner
            .write()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        let acct = TeamAccount {
            id: tid.clone(),
            name: tname,
            members,
            created_at_epoch_ms: now,
        };
        guard.teams.insert(tid, acct.clone());
        Ok(acct)
    }

    /// Retrieves a stored design by ID.
    ///
    /// # Errors
    ///
    /// Returns [`StoreError::NotFound`] if `id` does not exist.
    pub fn get(&self, id: &str) -> Result<DesignRecord, StoreError> {
        let guard = self
            .inner
            .read()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        guard
            .designs
            .get(id)
            .cloned()
            .ok_or_else(|| StoreError::NotFound(id.to_string()))
    }

    /// Updates an existing design, incrementing `current_version` and appending
    /// an immutable entry to `design_versions`.
    ///
    /// # Errors
    ///
    /// Returns [`StoreError`] if `id` is not found, `name` is empty, or `design`
    /// fails semantic validation.
    pub fn update(
        &self,
        id: &str,
        name: Option<String>,
        design: Design,
        note: Option<String>,
    ) -> Result<DesignRecord, StoreError> {
        validate_design_payload(&design)?;
        let digest = canonical_design_blake3(&design);
        let now = now_epoch_ms();

        let mut guard = self
            .inner
            .write()
            .unwrap_or_else(std::sync::PoisonError::into_inner);

        let next_name = match name {
            Some(raw) => {
                let trimmed = raw.trim().to_string();
                if trimmed.is_empty() {
                    return Err(StoreError::EmptyName);
                }
                Some(trimmed)
            }
            None => None,
        };

        let existing = guard
            .designs
            .get_mut(id)
            .ok_or_else(|| StoreError::NotFound(id.to_string()))?;

        if let Some(updated_name) = next_name {
            existing.name = updated_name;
        }
        existing.current_version += 1;
        existing.content_blake3 = digest.clone();
        existing.updated_at_epoch_ms = now.max(existing.updated_at_epoch_ms);
        existing.design = design.clone();

        let updated_record = existing.clone();
        let version_entry = DesignVersionRecord {
            design_id: id.to_string(),
            version: updated_record.current_version,
            name: updated_record.name.clone(),
            author: updated_record.author.clone(),
            note,
            content_blake3: digest,
            created_at_epoch_ms: updated_record.updated_at_epoch_ms,
            design,
        };

        guard
            .versions
            .entry(id.to_string())
            .or_default()
            .push(version_entry);

        Ok(updated_record)
    }

    /// Restores a historical version `target_version` as a new head version
    /// (`current_version + 1`), preserving append-only version history.
    ///
    /// # Errors
    ///
    /// Returns [`StoreError::NotFound`] or [`StoreError::VersionNotFound`] if
    /// the design or version does not exist.
    pub fn restore_version(
        &self,
        id: &str,
        target_version: u32,
        note: Option<String>,
    ) -> Result<DesignRecord, StoreError> {
        let historical = self.get_version(id, target_version)?;
        let restore_note = note.or_else(|| Some(format!("Restored from version {target_version}")));
        self.update(id, Some(historical.name), historical.design, restore_note)
    }

    /// Deletes a design and all of its version history.
    ///
    /// # Errors
    ///
    /// Returns [`StoreError::NotFound`] if `id` does not exist.
    pub fn delete(&self, id: &str) -> Result<(), StoreError> {
        let mut guard = self
            .inner
            .write()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        if guard.designs.remove(id).is_none() {
            return Err(StoreError::NotFound(id.to_string()));
        }
        guard.versions.remove(id);
        Ok(())
    }

    /// Lists all historical versions (`1..=current_version`) for design `id`.
    ///
    /// # Errors
    ///
    /// Returns [`StoreError::NotFound`] if `id` does not exist.
    pub fn list_versions(&self, id: &str) -> Result<Vec<DesignVersionRecord>, StoreError> {
        let guard = self
            .inner
            .read()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        guard
            .versions
            .get(id)
            .cloned()
            .ok_or_else(|| StoreError::NotFound(id.to_string()))
    }

    /// Retrieves a specific historical version `version` of design `id`.
    ///
    /// # Errors
    ///
    /// Returns [`StoreError::NotFound`] if `id` does not exist, or
    /// [`StoreError::VersionNotFound`] if `version` is not in the design's history.
    pub fn get_version(&self, id: &str, version: u32) -> Result<DesignVersionRecord, StoreError> {
        let guard = self
            .inner
            .read()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        let history = guard
            .versions
            .get(id)
            .ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        history
            .iter()
            .find(|entry| entry.version == version)
            .cloned()
            .ok_or_else(|| StoreError::VersionNotFound {
                design_id: id.to_string(),
                version,
            })
    }
}

fn validate_design_payload(design: &Design) -> Result<(), StoreError> {
    if design.schema_version != SCHEMA_VERSION {
        return Err(StoreError::UnsupportedSchema {
            found: design.schema_version,
        });
    }
    validate(design).map_err(StoreError::InvalidDesign)
}

fn canonical_design_blake3(design: &Design) -> String {
    let json = serde_json::to_string(design).unwrap_or_default();
    let mut hasher = blake3::Hasher::new();
    hasher.update(b"bladelab-design-v1\0");
    hasher.update(json.as_bytes());
    hasher.finalize().to_hex().to_string()
}

fn now_epoch_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| u64::try_from(d.as_millis()).unwrap_or(u64::MAX))
        .unwrap_or(0)
}
