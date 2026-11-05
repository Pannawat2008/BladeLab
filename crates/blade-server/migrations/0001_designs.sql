-- BladeLab PostgreSQL Schema Migration 0001: Designs & Immutable Version History (T-204)

CREATE TABLE IF NOT EXISTS designs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    current_version INTEGER NOT NULL CHECK (current_version >= 1),
    content_blake3 TEXT NOT NULL,
    design_json JSONB NOT NULL,
    created_at_epoch_ms BIGINT NOT NULL,
    updated_at_epoch_ms BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS design_versions (
    design_id TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    version INTEGER NOT NULL CHECK (version >= 1),
    name TEXT NOT NULL,
    note TEXT,
    content_blake3 TEXT NOT NULL,
    design_json JSONB NOT NULL,
    created_at_epoch_ms BIGINT NOT NULL,
    PRIMARY KEY (design_id, version)
);

CREATE INDEX IF NOT EXISTS idx_design_versions_design_id
    ON design_versions (design_id, version ASC);
