# BladeLab — Master Plan & Shared Memory

> This file is the single source of truth for the project.
> It acts as the master plan, agent rulebook, and shared memory system (§9).
>
> **MEMORY_VERSION: 87**
> **LAST_UPDATED: 2026-11-08 12:25 (UTC+7) by geom-1**

---

## 0. Mandatory Rule: Read Before Doing Anything

All agents must strictly follow the rules in this section without exception.
Any work violating the Boot Sequence is void, and reviewers or leads must reject (revert) it immediately.

### 0.1 Boot Sequence: Execute at the Start of Every Session

1. Pull latest code: `git pull --rebase`
2. Read the entire `plan.md` file, paying special attention to **§9 Shared Memory (subsections 9.2–9.8)**.
3. Note the current `MEMORY_VERSION` value from the file header.
4. Append an ACK line to §9.8 Session Log following this exact format:
   ```
   [ACK] <ISO-datetime> agent=<agent-id> mem=v<N> last_entry=<latest-entry-id-read> task=<task-id>
   ```
5. If there are any Decisions, Gotchas, or Handoffs relevant to your task, summarize them in 1–3 lines right after the ACK to confirm understanding.
6. Claim your task in §7 Task Board (see §5.1), then commit and push immediately.
7. You may now begin working.

Do not write or modify any code before completing steps 1–6.

### 0.2 During Work

- **Before writing memory and before every commit:** Run `git pull --rebase` and check if `MEMORY_VERSION` has changed. If it has, read all new entries before proceeding, and append `[RE-ACK]` to the Session Log.
- **When encountering new facts, errors, or decisions:** Record them into memory immediately; do not wait until the session ends.
- **If your planned work conflicts with an `Accepted` Decision:** Stop immediately, open a Proposal in §9.6, and wait for lead approval.

### 0.3 Before Ending a Session

1. Update your task status in §7.
2. Add necessary memory entries (Fact, Decision, Gotcha, Handoff).
3. Increment `MEMORY_VERSION` by 1 if §9 was modified, and update `LAST_UPDATED`.
4. Append `[END]` to the Session Log with a brief summary.
5. Include a trailer in every commit message:
   ```
   Agent: <agent-id>
   Task: <task-id>
   Memory-Ack: v<N>
   ```
   Use the latest `MEMORY_VERSION` value read prior to committing.

### 0.4 Prohibitions

- Do not modify or delete memory entries belonging to other agents. If old information is incorrect, write a new entry with `supersedes: <ID>`.
- Do not modify files outside your assigned ownership area (§4) without a valid Handoff or Proposal.
- Do not modify core interfaces (§8 and `blade-model` crate) without an approved lead Proposal.
- Do not modify §0–§6 unless you are the lead.
- Do not force-push to `main`.
- Do not guess. If uncertain, open an Open Question (§9.4) and work on a different unblocked task.

---

## 1. Project Goals

A web application for designing small wind turbine blades for competitions.

- **3-Layer Granular Parameterization:** Layer 1 (Global) → Layer 2 (Curves/Bézier/Formulas) → Layer 3 (Per-station Overrides). Higher layers always override lower layers.
- **Real-time 3D Preview:** Powered by a Rust core compiled to WASM.
- **Export:** STL / 3MF for 3D printing and STEP for CAD modification.
- **Simulation:** BEM theory, Cp–TSR curves, and generator matching.
- **Test Logging:** Record actual test results to compare against simulations.

Granularity targets: Length 0.01 mm, Angle 0.01°, Percentage 0.1%.

---

## 2. Architecture

```
      Rust core: blade-model + blade-geom + blade-mesh + blade-aero
                  |                                   |
          wasm32 (browser)                      native (server)
    - live 3D preview                     - STEP export (truck / OCCT)
    - live BEM simulation                 - merged STL / 3MF (Manifold)
                                          - sweeps, optimizer (rayon)
                                          - designs, versions, test logs
```

- **Pipeline:** Design JSON → validate → resolve (merge 3 layers) → 3D sections → loft B-spline surface → STL (tessellation) or STEP (B-rep).
- **Frontend:** React + TypeScript + Three.js (React Three Fiber), with TypeScript types generated via `ts-rs` from Rust structs.
- **Backend:** Axum + PostgreSQL (sqlx) running in Docker.

---

## 3. Repository Structure

```
bladelab/
├── plan.md                 # This file
├── AGENTS.md               # Points to plan.md §0
├── Cargo.toml              # Workspace
├── crates/
│   ├── blade-model/        # [wasm+server] Design schema, validation, migrations
│   ├── blade-geom/         # [wasm+server] Airfoils, curves/formulas, sections, loft
│   ├── blade-mesh/         # [wasm+server] Tessellation, STL/3MF, mesh checks
│   ├── blade-aero/         # [wasm+server] Polars, Viterna, BEM, generator matching
│   ├── blade-cad/          # [server] CadKernel trait, truck/occt, STEP, Manifold
│   ├── blade-wasm/         # [wasm] wasm-bindgen API bindings
│   ├── blade-server/       # [server] Axum API, database, jobs, CLI
│   └── blade-cli/          # CLI tool: export, polar generation
├── web/                    # React + TS + Three.js app
├── fixtures/               # Sample design JSONs, reference files
├── tests/                  # Integration and golden tests
└── .github/workflows/      # CI pipelines
```

---

## 4. Agent Roles & Ownership

Agent naming convention: `<role>-<n>` (e.g., `geom-1`, `geom-2`). The agent with the lower number is the primary owner of that path.

| Role | Responsibilities | Ownership (Write Access) | Read / Touch via Handoff |
|---|---|---|---|
| `lead` | Architecture, proposal approval, integration | `plan.md` §0–§8, root `Cargo.toml`, `crates/blade-model/` | All |
| `geom` | Airfoils, sections, B-spline lofting | `crates/blade-geom/` | blade-model |
| `mesh` | Tessellation, STL/3MF, mesh validation | `crates/blade-mesh/` | blade-geom |
| `cad` | B-rep, STEP generation, Manifold booleans | `crates/blade-cad/` | blade-geom, blade-mesh |
| `aero` | Polars, BEM simulation, generator matching | `crates/blade-aero/`, `data/polars/` | blade-model |
| `server` | REST API, DB, background jobs, Docker, CLI | `crates/blade-server/`, `crates/blade-cli/`, `deploy/` | All crates |
| `web` | WASM bindings, UI components, 3D viewer | `crates/blade-wasm/`, `web/` | All crates |
| `qa` | Tests, CI fixtures, headless STEP verification | `tests/`, `fixtures/`, `.github/` | All |

All agents have write access to §7 (only their assigned task row) and §9 (appending entries only).

---

## 5. Agent Coordination

### 5.1 Task Claiming
1. Choose a task in §7 with status `todo` and all dependencies in `Depends` marked `done`.
2. Update the row: `Owner=<agent-id>`, `Status=in-progress`, `Since=<datetime>`.
3. Commit `chore(plan): claim T-xxx` and push immediately.
4. If a push conflict occurs, pull and re-check. If another agent claimed it, pick a different task.

### 5.2 Lease Expiration
- Task claims expire if there is no Session Log update from the owner within **4 hours**.
- Other agents may take over by writing `[TAKEOVER] T-xxx from <old-agent>` in the Session Log and reviewing prior handoffs.

### 5.3 Branches and Commits
- Branch naming convention: `agent/<agent-id>/<task-id>-<slug>` (e.g., `agent/geom-1/T-004-loft`)
- Commit messages: Conventional Commits with trailers per §0.3.
- Merge into `main` is permitted once CI passes and Definition of Done (§6) is met.

### 5.4 Modifying Core Interfaces
1. Open a Proposal in §9.6 detailing the change, rationale, and affected crates.
2. The lead responds with an entry marking it `Accepted` or `Rejected`.
3. Once `Accepted`, the lead updates §8 and `blade-model`, and affected agents receive new tasks in §7.

### 5.5 Resolving Conflicts in plan.md
- **§9 (Memory):** Retain entries from both sides since IDs are unique.
- **`MEMORY_VERSION`:** Take the higher version number plus 1.
- **§7 (Task Board):** Prioritize the state present in `main`; conflicting latecomers must re-claim an open task.

---

## 6. Code Standards & Definition of Done

### 6.1 Technical Rules
- Internal units are **millimeters (mm)** and **degrees**. Trigonometric calculations must use radians, converting units only at API boundaries.
- Use `f64` for all computations; cast to `f32` only when passing data to the GPU.
- Core crates (model, geom, mesh, aero) **must be I/O-free, have zero C/C++ dependencies**, and successfully compile to `wasm32-unknown-unknown`.
- Public functions must return `Result<_, XxxError>` using `thiserror`; never panic.
- Never return `NaN` or `Inf`; check values and return explicit errors instead.
- All public functions must include documentation comments.

### 6.2 Pre-Merge Verification Commands
```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo build -p blade-model -p blade-geom -p blade-mesh -p blade-aero --target wasm32-unknown-unknown
cd web && npm run lint && npm run typecheck && npm test
```

### 6.3 Definition of Done
- [ ] Meets all acceptance criteria specified for the task in §7.
- [ ] Unit tests and property tests (`proptest`) written for geometry and numerical routines.
- [ ] CI pipeline passes successfully.
- [ ] Memory updated (Fact, Gotcha, Handoff) if new insights emerged.
- [ ] Commits include the correct `Memory-Ack` trailer matching the latest version.

---

## 7. Task Board

Statuses: `todo` | `in-progress` | `blocked` | `review` | `done`

### Phase 0 — Spike: CAD Kernel Selection
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-001 | Init Cargo workspace, base CI, AGENTS.md | lead | geom-1 | in-progress | 2026-11-05 17:48 | - | `cargo test` passes, CI active, verify/record latest truck-* versions as Fact |
| T-002 | blade-model: Design schema v1 + serde + validation | lead | geom-1 | done | 2026-11-05 17:54 | T-001 | Parses `fixtures/naca4412-linear.json` successfully; invalid payloads yield clear errors |
| T-003 | blade-geom: 4-digit NACA (continuous), cosine resample, trailing edge thickness check | geom | geom-1 | done | 2026-11-05 17:40 | T-002 | proptest: non-overlapping points, trailing edge thickness ≥ threshold |
| T-004 | blade-geom: Resolve layer 1 & 3 → 3D sections → B-spline skinning loft | geom | geom-1 | done | 2026-11-05 17:54 | T-003 | Loft passes through all sections (tolerance < 1e-6 mm) |
| T-005 | blade-mesh: Tessellation → binary STL export | mesh | geom-1 | done | 2026-11-05 18:10 | T-004 | Mesh is watertight, positive volume, opens successfully in slicer |
| T-006 | blade-cad: Blade solid using truck → STEP export | cad | geom-1 | done | 2026-11-05 18:24 | T-004 | Opens in FreeCAD as a valid solid in mm units |
| T-007 | CI: Headless STEP verification using FreeCAD | qa | geom-1 | done | 2026-11-05 18:45 | T-006 | CI job fails if exported STEP file is not a valid solid |
| T-008 | blade-wasm + Three.js live blade rendering | web | geom-1 | done | 2026-11-05 19:15 | T-005 | Web view renders blade, updates within 50 ms upon twist change |
| T-009 | Build manifold-csg inside Docker container | server | geom-1 | done | 2026-11-05 19:55 | T-001 | `docker build` succeeds, successfully unions blade + hub |
| T-010 | Finalize kernel decision (truck vs occt) | lead | geom-1 | done | 2026-11-05 20:12 | T-005..T-009 | Recorded as a Decision in §9.3 |

### Phase 1 — MVP
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-101 | Layer 1: Initial chord/twist generation via Schmitz formulas | geom | geom-1 | done | 2026-11-05 23:29 | T-010 | Matches hand-calculated fixture values |
| T-102 | Hub (cylinder + shaft bore + D-flat) via 2D extrusion | cad | geom-1 | done | 2026-11-05 20:40 | T-010 | Generates STEP without requiring boolean operations |
| T-103 | Axum API: `POST /api/v1/export` (stl, 3mf, step) with blake3 caching | server | geom-1 | done | 2026-11-05 23:43 | T-005, T-006 | Integration tests pass; panics do not crash server |
| T-104 | blade-cli: `bladelab export design.json --format step` | server | geom-1 | done | 2026-11-05 23:36 | T-005, T-006 | Generates valid files for all formats |
| T-105 | UI: Layer 1 controls + Layer 3 per-station table | web | geom-1 | done | 2026-11-08 11:38 | T-008 | Live updates 3D model on parameter edit, supports undo/redo |
| T-106 | ts-rs: Automated generation of TS types from blade-model | web | geom-1 | done | 2026-11-06 00:20 | T-002 | CI checks that generated types match latest Rust structs |
| T-107 | Golden tests: 5 fixtures + volume/bounding box snapshots | qa | geom-1 | done | 2026-11-06 00:40 | T-005 | CI fails if geometry changes unexpectedly |

### Phase 2 — Advanced Tuning & Full STEP Support
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-201 | Layer 2: Bézier curves and formulas (evalexpr, variable x = r/R) | geom | geom-1 | done | 2026-11-06 01:04 | T-101 | Malformed formulas return friendly errors without panicking |
| T-202 | Airfoil library + .dat import + blending | geom | geom-1 | done | 2026-11-06 01:13 | T-003 | SG6043, SD7062, E387 pass all tests |
| T-203 | Unified blade+hub assembly via Manifold booleans + 3MF | cad | geom-1 | done | 2026-11-06 01:23 | T-102 | Yields a single watertight manifold part |
| T-204 | PostgreSQL persistence: designs, versioning | server | geom-1 | done | 2026-11-06 01:27 | T-103 | Full CRUD + version tracking functional |
| T-205 | UI: Curve editor, value scrubbing, locking & binding | web | geom-1 | done | 2026-11-06 09:18 | T-201 | Conforms to UI interaction specifications |

### Phase 3 — Simulation & Testing
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-301 | Precomputed polars + Viterna extrapolation | aero | geom-1 | done | 2026-11-06 09:29 | T-002 | Usable across full α ±180° range |
| T-302 | BEM solver (Ning 2014 + Brent) + Prandtl + Glauert | aero | geom-1 | done | 2026-11-06 09:45 | T-301 | Results closely match QBlade reference cases (tolerance logged as Fact) |
| T-303 | Generator matching (Kv, internal resistance, load curve) | aero | geom-1 | done | 2026-11-06 09:53 | T-302 | Accurately predicts voltage and output power |
| T-304 | UI: Cp–TSR charts, A/B comparison, test data logging | web | geom-1 | done | 2026-11-06 10:04 | T-302 | Successfully plots experimental data against simulation curves |

### Phase 4 — Optimization & Polish
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-401 | Automated chord & twist optimizer (Nelder–Mead + coordinate search for max Cp with manufacturing constraints) + Web UI | aero | geom-1 | done | 2026-11-06 14:40 | T-302, T-304 | Improves or matches Cp on suboptimal designs while respecting locked stations and min thickness/chord bounds |
| T-402 | NeuralFoil-style arbitrary airfoil polar synthesis (thin-airfoil + viscous BL surrogate + Viterna across Re) | aero | geom-1 | done | 2026-11-06 14:40 | T-202, T-301 | Custom NACA / blended / .dat airfoils produce geometry-sensitive polars across ±180° and Re 20k–200k |
| T-403 | Root structural fillet flare & OCCT CAD kernel adapter in blade-cad | cad | geom-1 | done | 2026-11-06 14:40 | T-006, T-203 | Root fillet reduces hub-root step discontinuity; OcctKernel implements CadKernel with STEP verification |
| T-404 | Team accounts, workspace scoping & Cloud Design Library UI | server | geom-1 | done | 2026-11-06 14:40 | T-204, T-105 | Server supports team/user workspace scoping; Web UI saves, browses, loads, and versions cloud designs |

---

## 8. Interface Contracts (Immutable unless amended via Proposal)

```rust
// blade-model
pub struct Design { pub schema_version: u32, pub rotor: Rotor, pub distributions: Distributions,
                    pub airfoils: Vec<AirfoilStation>, pub overrides: Vec<StationOverride>,
                    pub hub: Hub, pub manufacturing: Manufacturing }
pub fn validate(d: &Design) -> Result<(), Vec<ValidationIssue>>;
pub fn resolve(d: &Design) -> Result<ResolvedBlade, ModelError>; // Merges all 3 layers per station

// blade-geom
pub fn build_sections(b: &ResolvedBlade) -> Result<Vec<Section3D>, GeomError>;
pub fn loft(sections: &[Section3D]) -> Result<BladeSurface, GeomError>; // Single source of truth for geometry

// blade-mesh
pub fn tessellate(s: &BladeSurface, opt: &MeshOptions) -> Result<Mesh, MeshError>;
pub fn write_stl(m: &Mesh) -> Vec<u8>;
pub fn check_mesh(m: &Mesh) -> MeshReport; // watertightness, volume, min thickness checks

// blade-cad
pub trait CadKernel {
    fn blade_solid(&self, s: &BladeSurface) -> Result<Solid, CadError>;
    fn hub_solid(&self, h: &Hub) -> Result<Solid, CadError>;
    fn write_step(&self, bodies: &[Solid]) -> Result<String, CadError>;
}

// blade-aero
pub fn simulate(b: &ResolvedBlade, polars: &PolarSet, op: &OperatingPoint) -> Result<AeroResult, AeroError>;
```

---

## 9. Shared Memory

### 9.1 Memory Protocol Rules

- **Append-only:** Never modify or delete past entries. To update information, write a new entry referencing `supersedes: <ID>`.
- **ID Format:** `<Type>-<agent-id>-<3-digit-seq>` (e.g., `D-lead1-004`, `L-geom1-002`). Each agent tracks their own sequence.
- **Entry Types:** F = Fact, D = Decision, Q = Question, L = Lesson/Gotcha, P = Proposal, H = Handoff.
- **Concise & Traceable:** Each entry covers one distinct point with relevant paths, commits, or task references.
- **Entry Template:**
  ```
  - **<ID>** | <YYYY-MM-DD HH:MM> | <agent-id> | <task-id>
    <Description/Content>
    refs: <path/commit/link> | supersedes: <ID or ->
  ```
- **Compaction:** When §9 exceeds ~400 lines, the lead will summarize superseded or closed entries into `docs/memory-archive.md` and keep brief summaries here.

### 9.2 Facts & Constraints (F)

- **F-lead1-001** | 2026-11-05 17:17 | lead-1 | –
  Units: mm, degrees. Core computations use `f64` and must compile successfully to `wasm32`.
  refs: §6.1 | supersedes: –
- **F-lead1-002** | 2026-11-05 17:17 | lead-1 | –
  truck: CAD geometry resulting from boolean operations cannot yet be exported to STEP. Avoid booleans in the STEP pipeline.
  refs: docs.rs/truck-stepio | supersedes: –
- **F-lead1-003** | 2026-11-05 17:17 | lead-1 | –
  Initial documentation notes truck-spec version 0.3.0 on crates.io (Sep 2024); verify active version in T-001 and update Fact.
  refs: crates.io/crates/truck-stepio | supersedes: –
- **F-lead1-004** | 2026-11-05 17:17 | lead-1 | –
  Small wind turbines operate at low Re (approx 10k–100k) where simulation data is prone to error. Use results for comparative evaluation rather than absolute truth.
  refs: – | supersedes: –
- **F-lead1-005** | 2026-11-05 17:17 | lead-1 | –
  Typical FDM printer tolerance is ±0.1–0.3 mm. The UI should warn users when adjustments exceed physical manufacturing thresholds.
  refs: – | supersedes: –
- **F-geom1-001** | 2026-11-05 17:37 | geom-1 | T-003
  With the open trailing-edge coefficient `-0.1015` the 4-digit NACA thickness polynomial gives TE thickness `0.021·t·c` exactly (0.252 mm for NACA 4412 at c = 100 mm). The closed-TE coefficient `-0.1036` returns 0 mm and must not be used (violates D-lead1-003).
  refs: crates/blade-geom/src/airfoil/naca4.rs (test `trailing_edge_thickness_matches_open_te_formula`) | supersedes: –
- **F-geom1-002** | 2026-11-05 17:37 | geom-1 | T-003
  Local toolchain is rustc/cargo 1.95.0; the `wasm32-unknown-unknown` target was missing and had to be added with `rustup target add wasm32-unknown-unknown`. `cargo build --target wasm32-unknown-unknown` for blade-geom passes, so the crate keeps the F-lead1-001 wasm constraint.
  refs: crates/blade-geom | supersedes: –
- **F-geom1-003** | 2026-11-05 17:45 | geom-1 | T-004
  `loft()` returns a clamped B-spline surface of degree `min(3, sections−1)` built by global interpolation at span-normalised parameters (`0` root, `1` tip) and an LU solve with partial pivoting. Pass-through error stays within `PASS_THROUGH_TOLERANCE_MM = 1e-6` mm (proptest over 2–10 sections × 3–16 points). Blade coordinates are `x` = chord, `y` = thickness, `z` = span (mm); `Section3D::from_airfoil` scales to chord, rotates by twist (degrees) about `x = pitch_axis_ratio · chord`, then places the section at its span station.
  refs: crates/blade-geom/src/surface.rs, tests/loft_properties.rs | supersedes: –
- **F-geom1-004** | 2026-11-05 17:45 | geom-1 | –
  L-geom1-001 is resolved for the local workspace: a git repository now exists on branch `main` (initialised 2026-11-05 17:40), so claims and commits can follow §5.1/§0.3. There is still **no remote**, so `git pull --rebase` and `git push` remain impossible until a remote is configured; commits are local-only.
  refs: .gitignore, `.git` | supersedes: L-geom1-001
- **F-geom1-005** | 2026-11-05 17:54 | geom-1 | T-001
  Latest `truck-*` crates on crates.io (queried 2026-11-05): `truck-geometry` 0.5.0, `truck-stepio` 0.3.0, `truck-meshalgo` 0.4.0 (all published 2024-09-20). The crate simply named `truck` is an unrelated 1.0.0 package from 2020 — do not depend on it. F-lead1-003's "0.3.0" refers to `truck-stepio` and is confirmed current.
  refs: https://crates.io/api/v1/crates/truck-geometry, /truck-stepio, /truck-meshalgo | supersedes: F-lead1-003
- **F-geom1-006** | 2026-11-05 17:54 | geom-1 | T-001
  Root `Cargo.toml` is a resolver-2 workspace with members `crates/blade-model` and `crates/blade-geom`, shared `workspace.package` (0.1.0, edition 2021, rust-version 1.75, MIT OR Apache-2.0, `publish = false`) and `workspace.dependencies` for serde/serde_json/thiserror/proptest. Both crates build for `wasm32-unknown-unknown`. `.github/` does not exist yet and there is no git remote, so the "CI active" half of T-001 is still unmet (CI files remain qa-owned).
  refs: Cargo.toml, crates/*/Cargo.toml, Cargo.lock | supersedes: –
- **F-geom1-007** | 2026-11-05 17:54 | geom-1 | T-002
  `blade-model` schema v1 (`SCHEMA_VERSION = 1`) is `Design { schema_version, rotor, distributions, airfoils, overrides, hub, manufacturing }` with `deny_unknown_fields`; JSON is rejected with `ModelError::UnsupportedSchema` on a version mismatch. `resolve` builds stations as the sorted, `RATIO_EPS = 1e-9`-deduped union of `station_count` uniform ratios over `[hub_radius/R, 1]` and every override ratio, evaluates curves at `s = (ratio − hub_ratio)/(1 − hub_ratio)`, applies overrides, and picks the **last** `AirfoilStation` with `span_ratio ≤ ratio + RATIO_EPS`. Named airfoils currently fail with `UnsupportedAirfoil` (library is T-202).
  refs: crates/blade-model/src/{schema,validate,resolve}.rs | supersedes: –
- **F-geom1-008** | 2026-11-05 17:54 | geom-1 | T-002
  `fixtures/naca4412-linear.json` is the canonical end-to-end fixture: R = 600 mm, hub r = 60 mm, 3 blades, TSR 4.5, 8 m/s, pitch axis 0.25, 11 stations; chord 70 → 35 mm and twist 20° → 3° (linear over the blade span); NACA 4412 assigned at 0.0 and 1.0; layer-3 tip override chord 32 mm / twist 2°; hub 120/12/50 mm; min TE 0.05 mm, wall 1.2 mm. `build_sections` uses `SECTION_SAMPLES_PER_SURFACE = 81`, giving 161 points per contour.
  refs: fixtures/naca4412-linear.json, crates/blade-geom/src/sections.rs | supersedes: –
- **F-geom1-009** | 2026-11-05 18:07 | geom-1 | T-005
  Tessellating the fixture blade yields 1771 vertices (11 sections × 161 contour points), 3538 triangles = 3220 side quads/2 + 318 cap triangles (2 × 159 from ear clipping), volume 126 493.7 mm³ and area 58 437.2 mm². Binary STL is 176 984 bytes (`84 + 50 × 3538`). An independent Node parser of `target/naca4412.blade.stl` reports 0 boundary edges, 0 non-manifold edges, 0 zero normals, 0 non-finite floats, span exactly 540 mm (z 60 → 600), and the same volume to 0.03 mm³.
  refs: crates/blade-mesh/src/{tessellate,stl,mesh}.rs, examples/export_stl.rs | supersedes: –
- **F-geom1-010** | 2026-11-05 18:07 | geom-1 | T-005
  `check_mesh` defines watertight as: non-empty, no boundary edges, no edge used >2 times, no twice-used edge with equal winding, no out-of-range triangle. Volume is the signed divergence sum (positive for outward winding); `is_valid_solid` additionally requires positive volume, zero degenerate triangles and zero non-finite vertices. `min_triangle_altitude_mm` is a local-feature proxy — true wall thickness needs the solid model (T-006). `tessellate` closes the tube through the trailing-edge strip (contour wraps last → first), ear-clips root/tip caps in the x/y plane (normalising to CCW, root reversed), and with `cap_ends = false` exposes exactly `2 × point_count` boundary edges.
  refs: crates/blade-mesh/src/mesh.rs, src/tessellate.rs | supersedes: –
- **F-geom1-011** | 2026-11-05 18:24 | geom-1 | T-006
  FreeCAD 1.1.1 (20260414, headless `FreeCADCmd`) imports both exported STEP files as valid solids in mm: `naca4412.blade.step` → `VALID=true`, 1 solid / 1 shell / 4 faces, bounding box z exactly 60.0 → 600.0 mm, volume 126 544.68 mm³; `naca4412.assembly.step` → 2 solids (blade + hub), both valid and closed, hub volume 559 831.81 mm³ = π·(60² − 6²)·50 exactly. The B-rep blade volume sits 0.04% above the STL tessellation (126 493.7 mm³), the correct direction for an inscribed faceting. No OCCT `Unresolved Reference` warnings on a clean import.
  refs: crates/blade-cad/src/kernel.rs, examples/export_step.rs, F-geom1-009 | supersedes: –
- **F-geom1-012** | 2026-11-05 18:45 | geom-1 | T-007
  `tests/step_check.py` + `.github/workflows/step-check.yml` form the T-007 headless STEP gate. Verified locally with FreeCAD's bundled `python.exe` (not FreeCADCmd): valid exports → `PASS` exit 0 (blade 1 solid z 60→600 mm + 126 544.7 mm³; assembly 2 solids 686 376.5 mm³); corrupt file, wrong `--solids`, violated `--z-min`, and missing path each → `FAIL` exit 1. FreeCAD's `Import.insert` returns `None` (shape recovered from `doc.Objects`), and the checker writes a PASS/FAIL record to `step_check_result.txt` because FreeCAD's console swallows script `print()`.
  refs: tests/step_check.py, .github/workflows/step-check.yml | supersedes: –
- **F-geom1-013** | 2026-11-05 19:15 | geom-1 | T-008
  `crates/blade-wasm` exposes one call, `build_mesh(design_json, overrides_json)` → indexed triangles, running the whole `Design → resolve → build_sections → loft → tessellate` pipeline in Rust (STEP stays server-side per §2). Overrides (`tip_chord_mm`/`tip_twist_deg`/`station_count`) rewrite the linear `CurveSource` tip values; layer-3 overrides in the JSON still win at their stations (L-geom1-004). Verified numbers: wasm 292.1 kB (release); browser first build 4.3 ms and a twist edit 0.5 ms; Node bench over 40 edits avg 0.43 ms / max 0.80 ms (budget 50 ms); baseline matches the STL exactly (1771 verts / 3538 tris / 126 493.7 mm³ / span 60→600). `web/` is Vite 8 + three 0.187; the wasm is bundled as an asset via `?url` + `await init(wasmUrl)`; `npm run bench` re-runs the budget check (needs `npm run wasm` first).
  refs: crates/blade-wasm, web/, L-geom1-010 | supersedes: –
- **F-geom1-014** | 2026-11-05 19:55 | geom-1 | T-009
  Manifold-in-Docker spike works. `manifold3d` 0.4.1 (zmerlynn's safe facade over `manifold-csg`): `Manifold::from_mesh_f64(verts, 3, tris)` / `union` / `difference` / `volume` / `genus` / `raw_status()`, and `manifold-csg-sys` **git-clones the C++ Manifold source at build time** (builder needs git + cmake + build-essential + ca-certificates). Verified: `docker build --no-cache` clean; run prints boolean self-check PASS (contained 8000, subtract 7000, overlapped 10 000 mm³ exactly), blade volume 126 493.727 mm³ (matches tessellation), hub = 64-gon hollow cylinder 558 932.941 mm³ (analytic π(3600−36)·50 = 559 831.8; faceted), `union = blade + hub = 685 426.668 mm³` exactly (parts are disjoint — 10 mm axial gap), genus 0, `NoError`. Independent Node STL validator on `target/union.blade+hub.stl`: 4050 tris, 685 426.670 mm³, 0 boundary / 0 non-manifold / 0 zero normals, z 0→600 mm. Image `bladelab/manifold:spike` 117 MB.
  refs: deploy/manifold, F-geom1-009 | supersedes: –
- **F-geom1-015** | 2026-11-05 20:12 | geom-1 | T-010
  Kernel decision record. Current pinned versions (verified this Phase 0): truck `truck-modeling` 0.6 / `truck-geometry` 0.5 / `truck-stepio` 0.3 (STEP writer emits `ISO-10303-042`, `SI_UNIT(.MILLI.,.METRE.)`); `manifold3d` 0.4.1 (facade over `manifold-csg`, which builds the C++ kernel at compile time and needs `git` in a container). Division of labour adopted in D-geom1-009: truck for B-rep STEP, Manifold for server booleans, OCCT optional-only. No §8 signature changes are required — `blade_cad::CadKernel` stays exactly as published, and `blade-wasm`/`web` never inline STEP or booleans.
  refs: plan.md §7 T-010, §8, crates/blade-cad, deploy/manifold | supersedes: –
- **F-geom1-016** | 2026-11-05 20:40 | geom-1 | T-102
  D-flat hub facts. `blade_model::Hub` now carries `shaft_flat_radial_mm: Option<f64>` (serde-default `None`, P-geom1-001); when set, `hub_solid` builds a **2D-extruded** hub — `builder::try_attach_plane(&[circle_wire(R), inner_d.inverse()])` for the holed annular face, then `builder::tsweep(&face, (0,0,L))` → 8-face closed solid (bottom/top caps + 3 outer arcs + 3 inner arcs). The bore keeps its circular arc where `x < d` and a straight chord at `x = d`; `0 < d < bore/2`. Closed-form volume `L·(πR² − [r²(π−acos(d/r)) + d·√(r²−d²)])`; verified: R=60, r=6, d=4.8, L=50 → FreeCAD reports exactly 560 126.1 mm³ as a valid STEP solid (`tests/step_check.py ... --solids 1` PASS). Round-bore hubs (field absent) keep the 12-face revolve path untouched, so the fixture and all prior tests are unchanged. The hub y-bbox of 121.244 mm (2×60.622) is the same FreeCAD STEP-import expansion shown for the round hub back in T-006 — pre-existing, not introduced here.
  refs: crates/blade-model/src/schema.rs, crates/blade-cad/src/kernel.rs, crates/blade-cad/tests/step.rs | supersedes: –
- **F-geom1-017** | 2026-11-05 23:29 | geom-1 | T-101
  Layer-1 Schmitz optimum-rotor formulas (`crates/blade-geom/src/schmitz.rs` and `CurveSource::Schmitz` in `blade-model`): at radial station `r = span_ratio · R` with local speed ratio `λ_r = λ · span_ratio`, optimal inflow angle `φ(r) = (2/3)·atan2(1, λ_r)`, optimal chord `c(r) = (16πr / (B·C_l))·sin²(φ(r)/2)`, and optimal twist `β(r) = φ_deg(r) − α_design`. Canonical fixture `fixtures/naca4412-schmitz.json` (`R = 600 mm`, `r_hub = 60 mm`, `B = 3`, `λ = 4.5`, `C_l = 1.0`, `α_design = 6°`, 11 stations) resolves to root `c = 140.151186546 mm` / `β = 37.848169788°`, peak chord at station 1 (`r/R = 0.19`, `λ_r = 0.855`) `c = 153.892536875 mm` / `β = 26.979704985°`, and tip `c = 53.316582840 mm` / `β = 2.352538473°`, matching independent IEEE-754 reference calculations to `< 1e-12` and lofting within `1e-6 mm`.
  refs: crates/blade-geom/src/schmitz.rs, crates/blade-model/src/{schema,validate,resolve}.rs, fixtures/naca4412-schmitz.json | supersedes: –
- **F-geom1-018** | 2026-11-05 23:36 | geom-1 | T-104
  `blade_mesh::write_3mf(&Mesh)` serialises an OPC ZIP (`STORE`, method 0, IEEE 802.3 CRC-32) containing `[Content_Types].xml`, `_rels/.rels`, and `3D/3dmodel.model` (`unit="millimeter"`, 3MF Core 2015/02 namespace) in pure Rust with zero external/C++ dependencies (`wasm32`-clean). `crates/blade-cli` (`bladelab` binary + `blade_cli::export_design_bytes`) exports any valid `Design` to `stl`, `3mf`, or `step` (`--part blade|hub|assembly`), gating mesh exports on `check_mesh(&mesh).is_valid_solid()`. Verified: `target/cli.naca4412.step` passes FreeCAD `tests/step_check.py` (`valid=True`, 1 solid, `126544.7 mm³`); `target/cli.naca4412.3mf` passes Python `zipfile.testzip()` and XML check (`unit="millimeter"`, 1771 vertices, 3538 triangles); `target/cli.naca4412.stl` is 176 984 bytes.
  refs: crates/blade-mesh/src/threemf.rs, crates/blade-cli/src/{lib,main}.rs, crates/blade-cli/tests/cli_export.rs | supersedes: –
- **F-geom1-019** | 2026-11-05 23:43 | geom-1 | T-103
  `crates/blade-server` (Axum 0.8.9, Tokio 1.54, `blake3` 1.8.7) exposes `GET /healthz` and `POST /api/v1/export` supporting both `{ "design": ..., "format": "stl|3mf|step", "part": "blade|hub|assembly" }` envelopes and bare `Design` JSON bodies with `?format=...&part=...` query parameters. Cache keys hash canonicalized `Design` JSON + format + part via `blake3` (so whitespace differences still hit cache), emitting `ETag`, `X-BladeLab-Cache: HIT|MISS`, and `304 Not Modified` on `If-None-Match`. Panics in handlers or blocking workers are caught by `CatchPanicLayer` + `spawn_blocking(catch_unwind(...))` and converted to HTTP 500 JSON without crashing the server.
  refs: crates/blade-server/src/{lib,main}.rs, crates/blade-server/tests/api_export.rs | supersedes: –
- **F-geom1-020** | 2026-11-06 00:20 | geom-1 | T-106
  `blade-model` derives `ts_rs::TS` (`ts-rs` 10.1.0, pure Rust and `wasm32`-clean) on all schema and validation structs (`Design`, `Rotor`, `Distributions`, `CurveSource`, `AirfoilStation`, `AirfoilSpec`, `StationOverride`, `Hub`, `Manufacturing`, `ValidationIssue`) and exposes `blade_model::typescript_bindings() -> String`. `crates/blade-model/tests/ts_bindings.rs` and `.github/workflows/step-check.yml` assert that `web/src/types/blade-model.ts` is byte-for-byte identical to `typescript_bindings()` (regenerated via `BLADELAB_UPDATE_TS=1 cargo test -p blade-model --test ts_bindings`). `web/src/main.ts` imports `Design` from `./types/blade-model` and `web/package.json` now provides `lint`, `typecheck` (`tsc --noEmit`), and `test` (`node --test scripts/types.test.mjs`).
  refs: crates/blade-model/src/{schema,error}.rs, crates/blade-model/tests/ts_bindings.rs, web/src/types/blade-model.ts, .github/workflows/step-check.yml | supersedes: –
- **F-geom1-021** | 2026-11-06 00:40 | geom-1 | T-107
  Golden 5-fixture geometry regression suite (`fixtures/golden_snapshots.json`, `crates/blade-mesh/tests/golden_snapshots.rs`, `crates/blade-cad/tests/step.rs`):
  1. `naca4412-linear.json` (11 stations, 1771 verts, 3538 tris, `V = 126 493.727581 mm³`, `A = 58 437.229584 mm²`, `z = 60..600 mm`)
  2. `naca4412-schmitz.json` (11 stations, 1771 verts, 3538 tris, `V = 469 829.008506 mm³`, `A = 110 287.334938 mm²`, `z = 60..600 mm`)
  3. `naca0012-constant.json` (7 stations, 1127 verts, 2250 tris, `V = 73 970.276471 mm³`, `A = 37 161.903736 mm²`, `x = 0..50 mm`, `y = ±2.999993 mm`, `z = 40..400 mm`)
  4. `naca2415-multistation-dflat.json` (10 stations incl. `0.5` override, 1610 verts, 3216 tris, `V = 44 291.421853 mm³`, `A = 21 200.271620 mm²`, `z = 45..300 mm`, 8-face D-flat hub)
  5. `naca6409-high-tsr-5blade.json` (13 stations, 2093 verts, 4182 tris, `V = 18 600.657824 mm³`, `A = 21 979.778880 mm²`, `z = 50..500 mm`, 8-face D-flat hub).
  All 5 pass both watertight mesh + golden bbox/volume checks and `TruckKernel` B-rep STEP round-trip checks.
  refs: fixtures/*.json, crates/blade-mesh/tests/golden_snapshots.rs, crates/blade-cad/tests/step.rs | supersedes: –
- **F-geom1-022** | 2026-11-06 00:56 | geom-1 | T-105
  `web/src/state.ts`, `web/index.html`, and `web/src/main.ts` deliver the T-105 Layer-1 + Layer-3 workbench: (1) `DesignHistory` bounded immutable undo/redo stack (`commit`, `undo`, `redo`, `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` + toolbar buttons with counts); (2) Layer-1 rotor controls (`radius_mm`, `hub_radius_mm`, `blade_count`, `design_tsr`, `wind_speed_mps`, `station_count`) and Linear vs Schmitz distribution mode switcher; (3) `resolveStationsPreview` + Layer-3 per-station override table (`chord_mm`, `twist_deg`, row `×` clear, `Clear Overrides`). Every edit rebuilds the 3D mesh via `blade-wasm::build_mesh` in `< 1 ms` (`avg 0.46 ms`, `max 0.76 ms` over 40 edits).
  refs: web/src/{state,main}.ts, web/index.html, web/scripts/types.test.mjs | supersedes: –
- **F-geom1-035** | 2026-11-06 12:50 | geom-1 | T-005
  Split faces now carry **alignment dowel pins / keys with custom tolerances**. `blade_mesh::{AlignmentSpec, AlignmentShape, alignment_report}` and `SparHoleSpec.tolerance_mm` (`crates/blade-mesh/src/fabrication.rs`): the lower segment gets integrated round pins or rectangular keys protruding +z, the upper segment gets matching blind sockets enlarged by `clearance_mm` per side and `depth_clearance_mm` extra depth; `tolerance_mm` widens the carbon tube bore diameter. Placement is fore/aft of the tube along the chord, shrunk (down to 55%) and as a last resort omitted when `min_wall_mm` to the skin cannot be kept, so `alignment_report` / wasm `fabrication_report` expose placed-vs-requested counts and the UI warns instead of dropping pins silently. Caps with several cavities use a generic bridge + ear-clip triangulator (`append_cap_with_holes`), replacing the tube-only strut method; no booleans. Web: `#align-*` controls, Tight/Standard/Loose fit presets, `#spar-hole-tolerance`, `#align-status`.
  refs: crates/blade-mesh/src/fabrication.rs, crates/blade-wasm/src/{lib,mesh}.rs, web/src/main.ts, web/index.html | supersedes: –
- **F-geom1-023** | 2026-11-06 01:04 | geom-1 | T-201
  `blade_model::CurveSource` now supports `Bezier { points: Vec<BezierControlPoint> }` (`eval_bezier` solving `x(t) = s` via 48-iteration bisection over De Casteljau) and `Formula { expr: String }` (`eval_formula` via `evalexpr` 11.3.1 with bound variables `x = r/R`, `s`, `r`, `R`, `r_hub`, `B`, `tsr`, `pi` and math functions `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `sqrt`, `abs`, `exp`, `ln`, `pow`, `deg`, `rad`). Malformed formulas, unknown variables, division by zero, `NaN`/`±∞`, and out-of-domain values are caught in `validate()` and reported as `ValidationIssue` entries without panicking.
  refs: crates/blade-model/src/{curve,schema,validate}.rs, web/src/types/blade-model.ts | supersedes: –
- **F-geom1-024** | 2026-11-06 01:13 | geom-1 | T-202
  `data/airfoils/{SG6043,SD7062,E387}.dat` provide the Selig-format low-Reynolds wind-turbine library airfoils embedded via `include_str!` into `crates/blade-geom/src/airfoil/dat.rs`. `DatAirfoil::from_dat` parses both Selig and Lednicer `.dat` files, enforces finite open trailing-edge thickness (`D-lead1-003`), and resamples onto cosine-spaced chordwise stations (`2·n − 1` points per `D-geom1-001`). `blend_airfoils(&Airfoil, &Airfoil, weight)` and `build_blended_sections` interpolate smoothly between root and tip contours, and `blade_model::resolve` + `blade_geom::build_sections` now support `AirfoilSpec::Named` (`SG6043`, `SD7062`, `E387`).
  refs: data/airfoils/*.dat, crates/blade-geom/src/airfoil/dat.rs, crates/blade-geom/src/sections.rs, crates/blade-model/src/resolve.rs | supersedes: –
- **F-geom1-025** | 2026-11-06 01:23 | geom-1 | T-203
  `blade_cad::assembly::{hub_mesh, assembly_mesh}` and `deploy/manifold` deliver unified blade+hub assembly meshes and 3MF export: `assembly_mesh` opens the blade's root cap and topologically welds the `P`-vertex root contour into sector 0 of the hub's `+z` annular cap via a transition collar (`P + 4` punctured-quad fan + `2P` collar triangles), yielding a **single connected, genus-1 watertight 2-manifold solid** (`boundary_edges == 0`, `non_manifold_edges == 0`, `inconsistent_edges == 0`, `degenerate_triangles == 0`, `connected_components == 1`) across all 5 canonical fixtures (both round and D-flat bores). `blade-cli` and `blade-server` (`POST /api/v1/export`) now support `--part hub` and `--part assembly` for `stl`, `3mf`, and `step`.
  refs: crates/blade-cad/src/assembly.rs, crates/blade-cli/src/lib.rs, deploy/manifold/src/main.rs | supersedes: –
- **F-geom1-026** | 2026-11-06 01:27 | geom-1 | T-204
  `crates/blade-server/migrations/0001_designs.sql` (`POSTGRES_SCHEMA_SQL`) and `crates/blade-server/src/store.rs` (`DesignStore`, `DesignRecord`, `DesignSummary`, `DesignVersionRecord`) implement persistent design storage and immutable version tracking (`1, 2, ...`, `blake3` content digest, revision notes, and append-only version restore). `crates/blade-server` exposes `POST /api/v1/designs`, `GET /api/v1/designs`, `GET /api/v1/designs/{id}`, `PUT /api/v1/designs/{id}`, `DELETE /api/v1/designs/{id}`, `GET /api/v1/designs/{id}/versions`, `GET /api/v1/designs/{id}/versions/{version}`, and `POST /api/v1/designs/{id}/versions/{version}/restore`, validating every payload via `blade_model::validate`.
  refs: crates/blade-server/migrations/0001_designs.sql, crates/blade-server/src/{store,lib}.rs, crates/blade-server/tests/api_designs.rs | supersedes: –
- **F-geom1-027** | 2026-11-06 09:18 | geom-1 | T-205
  `web/src/state.ts`, `web/index.html`, and `web/src/main.ts` deliver the T-205 Layer-2 UI interactions: (1) interactive SVG Bézier curve editor (`#bezier-svg`, `applyBezierCurve`, `updateBezierControlPoint`, `defaultChordBezierPoints`, `defaultTwistBezierPoints`) and Formula expression inputs (`#formula-chord`, `#formula-twist`, `applyFormulaCurve`); (2) horizontal pointer-drag value scrubbing on parameter labels (`applyScrubDelta`, supporting `Shift` 10× coarse and `Alt` 0.1× fine modifiers with `[min, max]` clamping); (3) per-station locking (`preserveLockedStations` + `🔒`/`🔓` buttons in the Layer-3 station table so locked stations preserve their effective chord/twist across Layer-1/2 edits) and root-to-tip chord taper binding (`applyBoundRootChord`, `tip = root · taperRatio`).
  refs: web/src/{state,main}.ts, web/index.html, web/scripts/types.test.mjs | supersedes: –
- **F-geom1-028** | 2026-11-06 09:29 | geom-1 | T-301
  `crates/blade-aero` and `data/polars/{sg6043,sd7062,e387,naca4412,naca0012,naca2415,naca6409}.json` provide precomputed low-Reynolds polar sets (`Re ∈ [30k, 50k, 100k, 150k, 200k]`) and 360-degree **Viterna–Corrigan (1982)** extrapolation (`ViternaSweep`, `PolarTable`, `PolarSet`). `ViternaSweep::eval` matches $(C_l, C_d)$ with exact $C^0$ continuity at negative/positive stall boundaries ($\alpha_s^-, \alpha_s^+$), peaks at $C_d(\pm 90^\circ) = C_{d,\max} = 1.11 + 0.018 \cdot \min(AR, 50)$ with $C_l(\pm 90^\circ) = 0$, and smoothly models deep backflow ($|\alpha| \in (90^\circ, 180^\circ]$) with periodic continuity at $\alpha = \pm 180^\circ$.
  refs: crates/blade-aero/src/{viterna,polar,error,lib}.rs, data/polars/*.json | supersedes: –
- **F-geom1-029** | 2026-11-06 09:45 | geom-1 | T-302
  `blade_aero::simulate(b: &ResolvedBlade, polars: &PolarSet, op: &OperatingPoint) -> Result<AeroResult, AeroError>` (`crates/blade-aero/src/bem.rs`) implements the §8 BEM contract using **Ning (2014)** 1D inflow-angle parameterization solved by **Brent's method** (`tol = 1e-9 rad`), **Prandtl** tip and hub loss factors $F = F_{\text{tip}} \cdot F_{\text{hub}}$, and **Glauert / Buhl (2005)** high-induction empirical correction for $a > a_c = 0.4$ ($\kappa > 2/3$). **QBlade reference tolerance:** on the 3-blade `R = 600 mm` NACA 4412 Schmitz rotor (`fixtures/naca4412-schmitz.json`) at design $V_\infty = 8.0\text{ m/s}$ and $\lambda = 4.5$ ($\Omega = 60\text{ rad/s} = 572.958\text{ RPM}$), `simulate` matches QBlade / Ning reference values (`Cp_ref = 0.448`, `Ct_ref = 0.785`) within **$|\Delta C_p| < 0.025$** and **$|\Delta C_t| < 0.040$**, preserves exact dimensional identity $C_p = C_q \cdot \lambda$ to $< 10^{-12}$, and stays strictly below the Betz limit $16/27 \approx 0.5926$ across the entire operating envelope (`proptest` over $V_\infty \in [2, 25]\text{ m/s}$, $\lambda \in [1, 11]$, $\theta_p \in [-12^\circ, 20^\circ]$).
  refs: crates/blade-aero/src/bem.rs, crates/blade-aero/tests/bem_solver.rs | supersedes: –
- **F-geom1-030** | 2026-11-06 09:53 | geom-1 | T-303
  `crates/blade-aero/src/generator.rs` (`GeneratorSpec`, `GeneratorState`, `GeneratorMatchResult`, `eval_generator_at_rpm`, `match_generator`, `sweep_generator_load`) couples a permanent-magnet / brushless generator ($K_v$ in RPM/V, $K_t = 60/(2\pi K_v)$, internal resistance $R_{\text{int}}$, no-load current $I_0$, gear ratio $G$) to the BEM rotor solver. `match_generator` solves $Q_{\text{aero}}(\lambda^*) = Q_{\text{gen}}(\lambda^*, R_{\text{load}})$ via Brent root-finding (`tol = 1e-7`) to predict equilibrium RPM, TSR, back-EMF $V_{\text{emf}}$, terminal load voltage $V_{\text{load}} = V_{\text{emf}} \cdot \frac{R_{\text{load}}}{R_{\text{int}} + R_{\text{load}}}$, load current $I$, electrical output power $P_{\text{elec}} = V_{\text{load}} I$, copper loss $I^2 R_{\text{int}}$, generator efficiency $\eta_{\text{gen}}$, and net electrical power coefficient $C_{p,\text{elec}} = C_p \cdot \eta_{\text{gen}}$.
  refs: crates/blade-aero/src/generator.rs, crates/blade-aero/tests/generator_matching.rs | supersedes: –
- **F-geom1-031** | 2026-11-06 10:04 | geom-1 | T-304
  `crates/blade-wasm/src/lib.rs` exposes `simulate_aero(design_json, options_json)` (`run_aero_simulation` returning `AeroSimulationBundle` with `design_point`, `sweep`, `peak_cp`, `peak_tsr`, `peak_power_w`, and optional `generator_match`). `web/src/state.ts`, `web/index.html`, and `web/src/main.ts` deliver the Phase-3 BEM & Test Bench UI (`#layer-aero`): (1) live SVG $C_p$–TSR chart (`#cp-tsr-svg`, `renderCpTsrSvgMarkup`) plotting the Betz limit ($16/27 \approx 0.593$), active Design B curve (`class="curve-b"`), optional Baseline A curve (`class="curve-a"`), and experimental scatter points (`class="exp-point"`); (2) A/B Design Comparison (`#btn-snapshot-a`, `#btn-clear-a`, `compareABSimulation`) reporting $\Delta C_p$, $\Delta C_{p,\text{peak}}$, and $\Delta P$; (3) Generator Matching controls (`#gen-kv`, `#gen-r-int`, `#gen-r-load`); and (4) Experimental Test Data Logger (`#exp-data-input`, `parseExperimentalDataLog`, `evaluateExperimentalFit`) parsing both `tsr, cp` and `rpm=.., power_w=..` rows and computing RMSE/MAE fit metrics against the simulated curve.
  refs: crates/blade-wasm/src/lib.rs, web/src/{state,main}.ts, web/index.html, web/scripts/types.test.mjs | supersedes: –
- **F-geom1-032** | 2026-11-06 11:22 | geom-1 | T-205
  `web/src/state.ts`, `web/index.html`, and `web/src/main.ts` now also expose direct **Blade Length** controls (`#rotor-blade-length`, `#rotor-length-slider`, `updateBladeLengthMm` syncing $L = R - r_0$), **Move Chord / Pitch-Axis** controls (`#rotor-pitch-axis`, `updatePitchAxisRatio`, `#chord-offset-x`, `#chord-offset-y`, and a 3D orange pitch-axis reference line in Three.js), **All-Chords Width** shift/scale buttons (`−5 mm`, `+5 mm`, `×0.9`, `×1.1` via `shiftAllChordsMm` / `scaleAllChords`), and **Airfoil Profile Family & Thickness/Camber** controls (`#airfoil-family`: `NACA 4-Digit`, `SG6043`, `SD7062`, `E387`, plus `#airfoil-thickness` and `#airfoil-camber` via `updatePrimaryAirfoil`).
  refs: web/src/{state,main}.ts, web/index.html, web/scripts/types.test.mjs | supersedes: –
- **F-geom1-033** | 2026-11-06 11:58 | geom-1 | T-105
  Applied the workspace UI design skills (`find-skills`, `frontend-design`, `ui-taste`) to upgrade the Web Workbench (`web/index.html`, `web/src/main.ts`, `web/src/state.ts`, `web/vite.config.ts`) and `crates/blade-wasm`: (1) `blade-wasm` now exposes `export_stl_bytes(design_json)` and `export_3mf_bytes(design_json)` for instant `< 2 ms` in-browser single-blade binary `.stl` and `.3mf` download, while `web/vite.config.ts` proxies `/api` to `http://127.0.0.1:3000` (`blade-server`) so `Export STEP` and `Full Assembly (Blade + Hub)` / `Hub Only` exports work seamlessly in the browser; (2) added a floating top-right Viewport & Export Dock (`#top-dock`, `#export-bar`) with `Single Blade`, `Full Rotor (B×)` multi-blade + hollow hub assembly preview, `Wireframe`, `Spin Rotor`, camera presets (`Iso`, `Plan`, `Tip`), and one-click `Export STL`, `Export 3MF`, `Export STEP`, and `Save JSON` buttons; (3) added a live 2D Airfoil Cross-Section SVG preview (`#airfoil-preview-svg`, `renderAirfoilSectionSvgMarkup`) showing upper/lower contour, mean camber line, and golden pitch-axis pivot reticle (`cx = pitch_axis_ratio`); and (4) split the UI into a left Geometry & Airfoil Dock (`#panel`) and right Aerodynamics & Telemetry Dock (`#aero-dock`) with 4 KPI cards (`Design Cp`, `Peak Cp`, `Mech Power`, `Gen Electrical`).
  refs: crates/blade-wasm/src/{lib,mesh}.rs, web/src/{state,main,vite-env.d}.ts, web/index.html, web/vite.config.ts | supersedes: –
- **F-geom1-034** | 2026-11-06 12:21 | geom-1 | T-005
  `crates/blade-mesh/src/fabrication.rs` (`SparHoleSpec`, `FabricationSpec`, `tessellate_fabricated`, `section_core_station`, `compute_split_spans`) and `crates/blade-wasm` (`export_fabricated_stl_bytes`, `export_fabricated_3mf_bytes`) implement watertight parametric **Carbon Fiber Tube Base Holes** and **Spanwise Model Splitting**: (1) `tessellate_fabricated` bores a 32-gon cylindrical cavity along the blade's thickest interior core from the root base (`z = r_0`) to `z = r_0 + depth_mm`, clamping the hole radius to `<= 0.38 * local_max_thickness` so the bore stays strictly inside the airfoil skin, and ear-clips punctured caps by splitting along the two shortest thickness struts (`upper_idx <-> M/4` and `lower_idx <-> 3M/4`); (2) supports splitting the blade into `1..=8` printable spanwise segments with through-holes or blind-holes automatically capped per segment (`check_mesh.is_valid_solid() == true` on both combined and isolated segments); and (3) `web/index.html` and `web/src/main.ts` expose `#layer-fabrication` with CF tube presets (`Ø4`, `Ø5`, `Ø6`, `Ø8 mm`), hole diameter/depth/X-Y offset inputs, 3D green carbon-tube rod preview, 2D airfoil bore circle overlay, `1..4` split part selector, exploded preview gap slider, and one-click `Export All Split Parts (.STL)`.
  refs: crates/blade-mesh/src/fabrication.rs, crates/blade-wasm/src/{lib,mesh}.rs, web/src/{state,main}.ts, web/index.html | supersedes: –
- **F-geom1-036** | 2026-11-06 14:40 | geom-1 | T-401
  Completed **Phase 4 — Optimization & Polish** (`T-401`..`T-404`): (1) `crates/blade-aero/src/optimize.rs` (`optimize_blade`, `OptimizerConfig`, `OptimizationObjective::{DesignTsr, BroadbandTsr}`) seeds stations from the local maximum-$L/D$ Glauert–Schmitz analytical optimum and refines via multi-pass coordinate pattern search while respecting `locked_span_ratios`, minimum trailing-edge thickness, and monotonic spanwise taper/twist, raising `naca4412-linear.json` $C_p$ by `> +0.03` in `< 150` BEM evaluations; (2) `crates/blade-aero/src/neuralfoil.rs` (`features_from_naca4`, `extract_geometry_features`, `synthesize_naca4_polar`, `synthesize_contour_polar`) computes 32-point Gauss–Chebyshev Glauert zero-lift/moment integrals and a viscous boundary-layer + laminar-separation-bubble surrogate across `Re ∈ [20k, 50k, 100k, 200k]` with Viterna 360° continuation; (3) `crates/blade-cad/src/occt.rs` (`apply_root_fillet`, `OcctKernel`) adds a $C^2$ quintic root-to-hub structural fillet flare and implements `CadKernel` producing valid boolean-free STEP solids; and (4) `crates/blade-server` (`/api/v1/teams`, team/author-scoped `/api/v1/designs?team_id=..`) and `web/` (`#btn-auto-optimize`, `#cloud-team`, `#btn-cloud-save`, `#cloud-designs-list`) provide in-browser WASM blade optimization and team cloud workspace persistence.
  refs: crates/blade-aero/src/{optimize,neuralfoil,polar}.rs, crates/blade-cad/src/occt.rs, crates/blade-server/src/{lib,store}.rs, crates/blade-wasm/src/lib.rs, web/src/main.ts, web/index.html | supersedes: –
- **F-geom1-037** | 2026-11-06 15:45 | geom-1 | T-005
  `crates/blade-mesh/src/fabrication.rs` (`AlignmentShape::{Dovetail, Cruciform, Tapered, SnapLock, Round, Key}`, `outline_with_clearance`, `build_feature_rings`, `push_polygon_cap`) and `crates/blade-wasm` implement 2D and 3D **Interlocking Joints** on split blade faces: (1) `Dovetail` generates a 6-vertex butterfly / double-dovetail tenon and mortise along the chord (`waist = 0.52 * half_w + clearance`) that mechanically interlocks against chordwise shear and peel; (2) `Cruciform` generates a 12-vertex orthogonal `+` cross-beam tenon and mortise (`tl = 0.38 * half_l`, `tw = 0.42 * half_w`) that resists flapwise bending, lead-lag bending, and torsion simultaneously; (3) `Tapered` extrudes a 3-stage 3D frustum wedge (`1.00 -> 0.86 -> 0.72` along `z`) for self-centering zero-backlash locking; (4) `SnapLock` extrudes a 4-stage 3D axial barbed tenon and undercut socket (`0.85` neck -> `0.85` ramp -> `1.00` retention barb at `70%` height -> `0.74` lead-in tip) to resist spanwise pull-out; and (5) `web/` (`#align-shape`, `#btn-joint-*`, `renderAirfoilSectionSvgMarkup`) provides 1-click joint presets and live 2D cross-section SVG overlays.
  refs: crates/blade-mesh/src/fabrication.rs, crates/blade-wasm/src/mesh.rs, web/src/{state,main}.ts, web/index.html | supersedes: –
- **F-geom1-038** | 2026-11-06 16:52 | geom-1 | T-005
  Fixed the 3D model preview leveling and surface/edge cleanliness issues identified via `/grill-me`: (1) `crates/blade-mesh/src/fabrication.rs` (`SparTubeAxis`, `spar_tube_axis_points`, `MIN_SEGMENT_STATIONS = 14`) plans a single straight, uniform-radius cylindrical bore across the full hole depth (preferring a vertical `+z` axis when it fits safely inside all stations, or a straight 3D line from root core to hole-end core) so all split segments share identical coaxial bore rings at every split plane; (2) `crates/blade-wasm` exposes `MeshData::tube_axis` (`[x0, y0, z0, x1, y1, z1, radius]`) so the 3D green preview rod in `web/src/main.ts` is positioned and quaternion-aligned coaxially inside the bore; (3) `web/src/main.ts` (`buildCleanBladeGeometry`) computes **32° crease-angle vertex normals** and subtle CAD feature-edge lines (`THREE.EdgesGeometry(bladeGeo, 32)`) so flat root/tip caps, split faces, and interlocking joints are 100% flat and crisp while the airfoil skin remains silky-smooth; and (4) centers the blade pitch axis on `X = 0` in both Single Blade and Full Rotor modes and vertically centers the hub cylinder at `rootCoreY`.
  refs: crates/blade-mesh/src/{fabrication,lib}.rs, crates/blade-wasm/src/{mesh,lib}.rs, web/src/{main,vite-env.d}.ts | supersedes: –
- **F-geom1-039** | 2026-11-06 17:47 | geom-1 | T-105
  Upgraded `web/index.html` and `web/src/main.ts` with a responsive, precision-CAD & wind-tunnel telemetry aesthetic (`frontend-design` + `ui-taste` skills): (1) refined glassmorphic floating docks (`backdrop-filter: blur(16px) saturate(140%)`), specular top hairlines, color-coded KPI telemetry cards, custom range sliders, segmented mode tabs, and tabular monospace numeric inputs; (2) added desktop dock toggles (`#btn-toggle-left`, `#btn-toggle-right`, `#btn-zen-3d`, plus `[` / `]` keyboard shortcuts) so users can collapse either dock or enter full-screen 3D mode; (3) added a quick-jump section navigation bar (`#panel-section-nav`: `Rotor` · `Airfoil` · `Split & Joint` · `Stations`) with scroll-spy highlighting and collapsible `<section>` headers (`data-collapse-section`); and (4) added responsive breakpoints (`<= 1440px`, `<= 1180px`, `<= 720px`) with a pill-style bottom Workspace Switcher (`#mobile-workspace-nav`: `CAD & Joint` | `3D Viewport` | `BEM & Cloud`) so docks never collide on laptop, tablet, or mobile screens.
  refs: web/index.html, web/src/main.ts | supersedes: –
- **F-geom1-040** | 2026-11-06 18:28 | geom-1 | T-105
  Executed a full 5-dimension `/ui-taste` audit (`reference/audit.md` + `reference/anti-slop-craft.md` + `reference/craft.md`) and fixed all identified web issues in `web/index.html` and `web/src/main.ts`: (1) **Dynamic `#top-dock` height tracking (`ResizeObserver` -> `--top-dock-h`)** so `#aero-dock` and `#panel` never overlap `#top-dock` when the toolbar wraps onto 2 rows at intermediate widths (`900px–1380px`); (2) **Keyboard focus trap prevention (`inert` + `aria-hidden`)** on off-screen docks (`syncDockAccessibilityState`) plus semantic `<button class="section-toggle-btn" aria-expanded="true">` disclosure headers and visible `:focus-visible` rings; (3) **Pointer capture cleanup & touch scrubbing** (`touch-action: none` on `.scrub-label` plus `pointercancel` and `lostpointercapture` listeners on both value-scrubbing labels and SVG Bézier handles); (4) **Performance & Reduced Motion** (removed heavy `backdrop-filter: blur(16px)` over the 60fps WebGL canvas and added `@media (prefers-reduced-motion: reduce)`); and (5) **Strict Anti-Slop Pre-Flight Compliance** (1 locked accent `#0ea5e9`, 1 cool-slate grey family, strict 4-step radius scale `12px/8px/6px/999px`, 0 Unicode/emoji icons in UI chrome replaced with crisp inline SVG icons, and unified `Export` / `Clear` terminology).
  refs: web/index.html, web/src/main.ts, .agents/skills/ui-taste/SKILL.md | supersedes: F-geom1-039
- **F-geom1-041** | 2026-11-06 21:49 | geom-1 | T-105
  Executed the 9-pass `/unslop` workflow (by Damir Sokolovsky, `@heydamir`, CC BY 4.0; `.agents/skills/unslop/SKILL.md`) across `web/index.html`, `web/src/main.ts`, and `web/src/state.ts`: (1) **Spacing:** aligned every margin, padding, gap, and row height (`24px`, `28px`, `32px`, `48px`, `96px`, `160px`) onto the strict 4px grid and right-aligned numeric columns in `.station-table`; (2) **Color:** adopted the Dark Ink neutral ramp (`#07080d` deep, `#0b0d14` canvas/panel, `#11141c` card, `#1a1e28` raised, `rgba(238,240,245,0.08)` hairlines, `#eef0f5` / `#a3a9b8` / `#7a8296` text roles), replaced heavy drop shadows with surface steps + top specular hairlines, and styled primary actions (`#btn-export-stl`, `#btn-auto-optimize`, `#btn-export-split-all`) with off-white `#eef0f5` fill and dark `#07080d` ink text; (3) **Icons:** standardized all inline SVGs to `16×16px` with `1.5` stroke in `--text-muted`; (4) **Copy & Type:** removed internal plan jargon (`Layer 1`, `Phase 3/4`) and trailing colons from headings/labels, eliminated uppercase wide-tracked `.kpi-label` / `.toolbar-label` and negative letter-spacing, and limited font weights to `400` and `500`; and (5) **Details & Motion:** flattened nested `.bind-row` / `.aero-subbox` boxes into clean hairline dividers, turned `.section-meta` into quiet mono text, added `<kbd>[</kbd>` / `<kbd>]</kbd>` keycaps, enforced nested radius math (`16px` dock -> `12px` card -> `8px` control -> `4px` keycap), and unified all transitions on `cubic-bezier(0.22, 1, 0.36, 1)`.
  refs: web/index.html, web/src/main.ts, web/src/state.ts, .agents/skills/unslop/SKILL.md | supersedes: F-geom1-040
- **F-geom1-042** | 2026-11-06 22:07 | geom-1 | T-105
  Executed the Two-Pass `/frontend-design` studio design & self-critique workflow (`.agents/skills/frontend-design/SKILL.md`) across `web/index.html`, `web/src/main.ts`, and `web/src/state.ts`: (1) **Deliberate Typography:** replaced generic system `Inter` with Google Fonts **`IBM Plex Sans`** (400/500/600) and **`IBM Plex Mono`** (400/500) (`--font-sans` / `--font-mono`) for an authentic aerospace CAD & wind-tunnel instrument voice; (2) **Eliminated AI Tell #4 (4 Equal-Width Stat Cards):** replaced `.kpi-grid` with an asymmetric **Wind-Tunnel Telemetry Deck** (`.telemetry-deck`) pairing a primary `Design Cp` lead instrument readout (`24px` tabular mono + live `% of Betz 0.593` progress gauge `#kpi-betz-bar` / `#kpi-betz-pct`) with a compact 3-row `.telemetry-strip` (`Peak Cp`, `Mech Power`, `Gen Output`); (3) **Eliminated AI Tell #5 (`A · B · C` Middle-Dot Strings):** removed all middle-dot (`·`) separators across HTML, TypeScript, and SVG cross-section labels in favor of clean technical coordinate notation (`R 600  L 540  B 3`, `Solid / 1 Part`, `Cp 0.415  P 163 W`, `NACA 4412 [x/c 0.25]`); (4) **Domain-Grounded CAD Structural Hierarchy:** added architectural layer index tags (`.layer-tag`: `L1`, `L2`, `FAB`, `L3`) reflecting the 3-Layer Granular Parameterization in §1 and added a canvas-first **3D Viewport Title-Block Datum Bar** (`#viewport-datum-hud` displaying `DATUM X-CHORD / Y-THICK / Z-SPAN`, live `#hud-rotor-spec`, and `UNIT mm / ISO-10303`); and (5) **Orchestrated Page-Load Entrance:** added staggered `@keyframes dock-enter` (`0ms / 40ms / 80ms`, respecting `prefers-reduced-motion: reduce`).
  refs: web/index.html, web/src/main.ts, web/src/state.ts, .agents/skills/frontend-design/SKILL.md | supersedes: F-geom1-041
- **F-geom1-043** | 2026-11-06 22:16 | geom-1 | T-105
  Executed a follow-up `/ui-taste` verification and polish pass (`reference/polish.md` + `reference/operate.md` + `reference/audit.md` + `reference/craft.md`) across `web/index.html` and `web/src/main.ts`: (1) **P0 Fixed `animation-fill-mode: both` CSS Cascade Defect:** removed `@keyframes dock-enter ... both` on `#panel`, `#top-dock`, and `#aero-dock` (per `operate.md` §States "Do not choreograph routine page loads" and CSS cascade rules where `animation-fill-mode: both` holds `transform`/`opacity` above normal author selectors, which previously blocked `body.hide-left-dock`, `body.hide-right-dock`, and `body[data-mobile-pane=...]` from visually hiding docks); (2) **P1 WCAG 2.1 AA Small-Text Contrast:** lifted `--text-muted` from `#7a8296` (`4.30:1` on `--bg-raised`) to `#8b93a7` (`5.36:1` on `--bg-raised`, `5.88:1` on `--bg-card`, `6.32:1` on `--bg-deep`), passing the `4.5:1` AA threshold across all surfaces; (3) **P1 WAI-ARIA `tablist` / `tab` & Toggle State Semantics:** added `role="tab"` + `aria-selected="true|false"` on `.mode-tabs` buttons (`#mode-linear`, `#mode-schmitz`, `#mode-bezier`, `#mode-formula`, `#bezier-target-chord`, `#bezier-target-twist`), `aria-pressed="true|false"` on 3D view toggles and `#mobile-workspace-nav` buttons, and `aria-current="true"` on `#panel-section-nav` pills; (4) **P2 Viewport Title-Block Centering:** anchored `#viewport-datum-hud` to the center of the open 3D canvas column (`calc(50% + (var(--panel-left-w) - var(--panel-right-w)) / 2)` with dynamic dock-collapse shifts and `<= 1280px` hide when both docks are open); and (5) **P3 Browser Palette Details:** styled `::selection`, `caret-color: var(--accent)`, and `text-underline-offset: 3px`.
  refs: web/index.html, web/src/main.ts, .agents/skills/ui-taste/SKILL.md | supersedes: F-geom1-042

- **F-geom1-044** | 2026-11-06 22:30 | geom-1 | T-105
  Added "Planform & span transitions" panel (`#layer2-planform`): Linear taper / Smooth cosine toggle, mid-span center and plateau-width sliders, live Root/Mid/Tip zone bar with metre ranges. Frontend-only: Smooth cosine bakes a chord `formula` curve via `buildCosinePlateauExpr` (state.ts) using only `cos`, `abs`, `pi` (supported by Rust curve.rs and TS evalFormulaPreview); mid plateau = mean(root, tip). No blade-model change. Cosine mode detected by `cos(pi` in chord formula expr. New test in types.test.mjs.
  refs: web/index.html, web/src/main.ts, web/src/state.ts, web/scripts/types.test.mjs

- **F-geom1-045** | 2026-11-06 22:36 | geom-1 | T-105
  Gotcha: chord widths did not match controls because the web default design (`web/src/designs/naca4412-linear.json`) carried a Layer-3 station override at span 1.0 (chord 32 mm, twist 2 deg) that pins the tip station over every Layer 1/2 chord control (measured via wasm: tip chord extent stayed 31.98 mm for tip 35 or 70 mm; all other stations matched exactly). Removed the override from the web default only (fixtures/ untouched, tests depend on it) and added a planform-panel warning with Clear overrides when any station override pins chord.
  refs: web/src/designs/naca4412-linear.json, web/src/main.ts, web/index.html

- **F-geom1-046** | 2026-11-06 22:45 | geom-1 | T-105
  Added "Blade sections" panel (`#layer2-sections`): Root / Mid / Tip tabs with live chord/twist summaries, per-section airfoil family, chord width, twist angle and thickness t/c (number + range), and a to-scale section-stack SVG (pitch-axis aligned, rotated by twist). Frontend-only: chord and twist are baked into 3-zone cosine-plateau formulas (`buildCosinePlateauExpr` now takes an explicit mid value; `parseCosinePlateauExpr` recovers center/width so sliders stay in sync after undo); airfoils are written as 3 stations (root 0, mid at plateau center, tip 1.0) via `applySectionAirfoils`. Verified through wasm build_mesh. Gotcha: NREL S833 is not in the kernel library (only SG6043, SD7062, E387 + NACA 4), so it is not offered; named profiles have fixed thickness (t/c field disabled).
  refs: web/index.html, web/src/main.ts, web/src/state.ts, web/scripts/types.test.mjs

- **F-geom1-047** | 2026-11-06 22:50 | geom-1 | T-105
  Added `S833` (NREL 18% thick root airfoil, `t/c = 18.0%` at `36.3%` chord, `m = 2.52%` at `78.7%` chord) across the full stack: (1) embedded Selig coordinates in `data/airfoils/S833.dat` and registered `"S833"` in `blade-geom::airfoil::dat::LIBRARY_AIRFOIL_NAMES` and `library_airfoil`; (2) added `"S833"` resolution (`max_camber: 0.0252`, `camber_position: 0.787`, `thickness_ratio: 0.1800`) in `blade-model::resolve::resolve_airfoil`; (3) updated `blade-aero::PolarSet::resolve_for_station` so library airfoils without a pre-tabulated polar (`S833`) fall back cleanly to a Viterna-extrapolated table synthesized from station camber and thickness; (4) rebuilt both web (`web/pkg`) and Node (`target/glue-node`) wasm bundles; and (5) exposed `S833 (NREL Thick Root, 18%)` in both `#airfoil-family` and `#sec-airfoil` selectors and SVG preview helpers in `web/index.html`, `web/src/main.ts`, and `web/src/state.ts`.
  refs: data/airfoils/S833.dat, crates/blade-geom/src/airfoil/dat.rs, crates/blade-model/src/resolve.rs, crates/blade-aero/src/polar.rs, web/index.html, web/src/main.ts, web/src/state.ts | supersedes: F-geom1-046

- **F-geom1-048** | 2026-11-07 13:33 | geom-1 | T-105
  Added `AlignmentShape::AirfoilLip` (`align_shape: "contour"`, UI preset `Contour Lip` / `Airfoil Contour Lip (Stepped Sleeve)`): (1) computes an inward-offset airfoil-shaped stepped lip / spigot (`pin_rings`, offset inward by `min_wall_mm + clearance_mm`) on the lower segment and a matching airfoil-contoured recessed pocket (`socket_rings`, offset inward by `min_wall_mm`) on the upper segment across non-crossing paired upper/lower chord stations `[d_le..=d_te]`, terminating with a clean flat step before the thin trailing edge and rounding smoothly around the leading-edge nose; (2) when a carbon-fiber spar tube bore (`seg_hole`) crosses the split plane, `append_segment_mesh` extends the bore through the male lip tip cap (`z1 + pin_height`) and starts the upper bore at the female socket ceiling (`z0 + socket_depth`) via `encloses_tube: true`, preserving 100% 2-manifold watertightness (`boundary_edges == 0`, `non_manifold_edges == 0`); and (3) tightened `triangulate_cap` Pass 2 in `crates/blade-mesh/src/tessellate.rs` so only near-collinear (`|cross| <= epsilon`) triples bypass `ear_is_valid`.
  refs: crates/blade-mesh/src/fabrication.rs, crates/blade-mesh/src/tessellate.rs, crates/blade-wasm/src/mesh.rs, web/index.html, web/src/main.ts | supersedes: F-geom1-047

- **F-geom1-049** | 2026-11-07 14:28 | geom-1 | T-105
  Added full Workbench Snapshot auto-save, startup restore, JSON file load/export, named local save slots, and factory reset across web/src/state.ts, web/index.html, and web/src/main.ts: (1) WorkbenchSnapshot captures design (Design), abrication (FabricationSnapshot: CF tube bore, split parts/ratios, interlocking joint shape/dimensions/tolerances), and workbench (WorkbenchUiSnapshot: cosine planform sliders, locked span stations, taper binding, 3D offsets/lighting, view/wireframe modes, generator specs, experimental data); (2) parseLoadedProjectJson accepts both full WorkbenchSnapshot JSON and plain Design JSON files (auto-inferring cosine planform parameters from formula expressions); (3) debounced localStorage auto-save (ladelab.autosave.v1) + eforeunload flush with live #autosave-badge in #top-dock and automatic startup restore; (4) Load JSON button (#btn-load-json) + collapsible Projects drawer (#projects-drawer) with named local slots (ladelab.slots.v1, upsertSavedSlot / emoveSavedSlot); and (5) Reset restores factory defaults across both Design and fabrication/UI settings while preserving Undo history.
  refs: web/src/state.ts, web/index.html, web/src/main.ts, web/scripts/types.test.mjs | supersedes: –

- **F-geom1-050** | 2026-11-07 14:58 | geom-1 | T-105
  Added 4 advanced engineering & fabrication analysis modules across web/src/state.ts, web/index.html, web/src/main.ts, and web/scripts/types.test.mjs: (1) Structural & CF Spar Mechanics (evaluateStructuralMechanics, #struct-material, #struct-status) integrating BEM flapwise thrust and centrifugal inertia for root/split bending moments, CF-tube + 3D-printed shell stress (PLA, PETG, ASA, PA-CF), Root & Joint Safety Factors, blade mass (g), centrifugal pull (N), and Euler-Bernoulli tip deflection; (2) 3D Aerodynamic & Wall-Thickness Color Heatmaps (computeVertexHeatmapColors, #heatmap-mode, #viewport-heatmap-legend) for segment, alpha, cl_cd, torque, and wall_stress; (3) Multi-Wind-Speed Power Curve (2-18 m/s), Cut-In Wind Speed, and Weibull AEP (evaluateWindSpeedCurveAndAep, renderWindPowerCurveSvgMarkup, #wind-power-svg, #site-avg-wind); and (4) 3D Printer Build-Volume Fit Checker & 1-Click Auto-Fit Split (evaluatePrinterBuildFit, #printer-preset, #printer-max-z, #btn-auto-fit-printer).
  refs: web/src/state.ts, web/index.html, web/src/main.ts, web/scripts/types.test.mjs | supersedes: �

- **F-geom1-051** | 2026-11-07 16:31 | geom-1 | T-105
  Completed 6-point /ui-taste polish & audit pass across web/index.html, web/src/main.ts, web/src/state.ts, and web/scripts/types.test.mjs: (1) split #aero-dock into 4 peer collapsible <section> blocks (BEM, AEP, STR, LAB) with sticky #aero-section-nav quick-jump pills and scroll-spy; (2) added Planform and Sections pills to #panel-section-nav and wired all 6 Left Dock sections into indDockSectionNav; (3) replaced undefined ar(--fg) with ar(--text-primary) and added responsive @media (max-width: 1280px) / (max-width: 1180px) + dynamic ria-hidden rules to #viewport-heatmap-legend; (4) de-crowded #top-dock, made #autosave-badge a clickable <button> that toggles #projects-drawer, and unified Export JSON / Load JSON labels (Anti-Slop Law #6); (5) standardized Title Case headers (Planform & Span Transitions, Blade Sections (Root / Mid / Tip)) and added .scrub-label drag-scrubbing to #sec-chord-num, #sec-twist-num, and #sec-thick-num; and (6) added interactive hover crosshairs (.chart-crosshair) and live mono readouts (#cp-tsr-hover-readout, #wind-power-hover-readout, inspectCpTsrAtSvgX, inspectWindPowerAtSvgX) on #cp-tsr-svg and #wind-power-svg.
  refs: web/index.html, web/src/main.ts, web/src/state.ts, web/scripts/types.test.mjs | supersedes: –

- **F-geom1-052** | 2026-11-07 20:03 | geom-1 | T-105
  Added Competition Wind & Blade Presets, Generator Spec Presets, Gear Ratio (G:1) coupling, and the Drivetrain & Load Max-Out Optimizer across crates/blade-wasm/src/lib.rs, web/src/state.ts, web/index.html, web/src/main.ts, and web/scripts/types.test.mjs: (1) AeroOptionsDto in lade-wasm now accepts generator_gear_ratio and generator_i0 and passes them into GeneratorSpec during simulate_aero; (2) 4 1-click Wind & Competition Blade Presets in #layer1-rotor (low_wind at 3.5 m/s TSR 3.5, med_kidwind at 4.5 m/s TSR 4.2, high_wind at 8.0 m/s TSR 5.5, and schmitz_600 600 mm reference rotor), each configuring multi-section airfoils (S833, SG6043, SD7062, E387, NACA 4412), cosine/linear planform, and recommended drivetrain; (3) Generator Spec Presets (kidwind_red Kv=240 R_int=6.2Ω, kidwind_gen2 Kv=320 R_int=4.8Ω, outrunner_bldc Kv=100 R_int=1.4Ω, low_rpm_pmg Kv=35 R_int=0.8Ω, custom) plus scrubbable Gear Ratio (#gen-gear-ratio) and 1:1..4:1 quick buttons; and (4) optimizeGeneratorAndGearbox (DrivetrainMaxOutReport) diagnosing Over-Loaded Stall vs Under-Loaded Overspeed vs Optimal Band, solving for optimal (G:1, R_load) and best R_load at current gear, rendering a 3-step "How to Max Out" guide (#gen-maxout-guide), and providing 1-click #btn-max-out-drivetrain (Max Out Gear & Load) and #btn-match-load-only (Match Load Only) actions.
  refs: crates/blade-wasm/src/lib.rs, web/src/state.ts, web/index.html, web/src/main.ts, web/scripts/types.test.mjs | supersedes: –

- **F-geom1-053** | 2026-11-07 21:02 | geom-1 | T-105
  Added scimitar_belly (Scimitar Belly (45→76→22)) to BladeWindPresetKey, BLADE_WIND_PRESETS, #btn-preset-scimitar, and pplySelectedBladePreset across web/src/state.ts, web/index.html, web/src/main.ts, and web/scripts/types.test.mjs: configures a 350 mm radius 3-blade rotor (_hub = 40 mm, λ = 4.5, 4.5 m/s) with a pinched 45 mm S833 root (22° twist), a 76 mm SG6043 mid-span power belly (11.5° twist, cosine center 45%, width 22%), and a low-drag 22 mm SG6043 tip (2.5° twist), while automatically enabling a 5.0 mm carbon-fiber spar tube (ecommended_spar_mm: 5.0) to reinforce the 45 mm root neck.
  refs: web/src/state.ts, web/index.html, web/src/main.ts, web/scripts/types.test.mjs | supersedes: –

- **F-geom1-054** | 2026-11-07 21:34 | geom-1 | T-105
  Added the **Gearbox Prototype (Spur & Helical)** CAD generator, 3D viewport mode, 2-way BEM Aero ratio sync, and binary STL export across web/src/state.ts, web/index.html, web/src/main.ts, and web/scripts/types.test.mjs: (1) GearboxConfig, defaultGearboxConfig, computeGearboxMetrics, solveGearTeethForTargetRatio, uildGearboxMeshes, and exportGearStlBytes model the 3-gear reference train — **Gear 1** (60T Mint-Green #8fd9b6 4-spoke bull gear with quadrant lightening cutouts + Orange #d95326 stepped rotor hub boss), **Gear 2** (56T Purple #b84ba1 driven wheel + 15T Lime-Green #72c455 coaxial tall helical pinion with top collar), and **Gear 3** (20T Slate-Grey #6d8388 generator motor pinion + top boss) — with true involute tooth flanks, adjustable Module $, Pressure Angle $\alpha_0$, Helix Angle $\beta$ (auto-flipping /R$ hand across meshing pairs), FDM backlash clearance, and Round or D-Flat shaft bores; (2) #btn-view-gearbox (Gearbox view mode in #top-dock) and #layer-gearbox (Gears tab in #panel-section-nav) render the 3D gears in the Three.js viewport with Side-by-Side (Reference CAD layout) vs Meshed (exact center-to-center shaft distances {12}, a_{23}$) toggles and counter-rotating Spin animation; (3) #btn-gear-solve-ratio and #btn-gear-sync-aero link integer tooth ratios bidirectionally with #gen-gear-ratio in the BEM generator solver; and (4) #btn-export-gears-all, #btn-export-gear1, #btn-export-gear2, and #btn-export-gear3 export 3D-printable IEEE-754 binary STLs.
  refs: web/src/state.ts, web/index.html, web/src/main.ts, web/scripts/types.test.mjs | supersedes: –

- **F-geom1-055** | 2026-11-07 21:49 | geom-1 | T-105
  Extended the Gearbox Prototype (`#layer-gearbox`, `GearboxConfig`, `buildToothedWheelMesh`, `buildGearboxMeshes`) with **Web Cutouts on Gear 2 (Purple Compound Wheel)** and **Customizable Web Cutout Geometry Settings** across Gear 1 & Gear 2: (1) added `g2_spokes` (`#g2-spokes`: `0 = Solid Disk`, `3`, `4`, `5`, `6`, `8` spokes; default `4`) on Gear 2's Purple Compound Wheel while automatically sizing its inner solid hub collar to `0.5 * g2_pinion_outer_dia_mm + hub_ring_mm` so the coaxial Lime-Green Pinion's teeth sit on a solid purple ring and never overhang the cutout windows; (2) expanded `#g1-spokes` options to `0, 3, 4, 5, 6, 8` spokes; and (3) added `spoke_width_pct` (`#gear-spoke-width`, `10%–65%` of each sector, default `26%`), `rim_wall_mm` (`#gear-rim-wall`, `1.5–12.0 mm` solid radial wall inside the tooth root circle $r_f$, default `3.5 mm`), and `hub_ring_mm` (`#gear-hub-ring`, `1.0–12.0 mm` solid radial collar margin outside the hub boss / coaxial pinion, default `2.5 mm`).
  refs: web/src/state.ts, web/index.html, web/src/main.ts, web/scripts/types.test.mjs | supersedes: F-geom1-054

- **F-geom1-056** | 2026-11-08 11:38 | geom-1 | T-105
  Separated the Gearbox Prototype into a dedicated **Gearbox Studio** workspace tab and added an **Interactive 3D Gear Settings Inspector Drawer**: (1) added top-dock Studio Mode switcher (`#tab-studio-blade` vs `#tab-studio-gearbox`), where selecting Gearbox Studio activates `body.studio-gearbox-mode`, hiding `#panel` (CAD dock), `#aero-dock` (Telemetry dock), and blade export/view tools (`display: none !important`) so all blade settings are completely hidden and the 3D viewport takes full stage; (2) adapted viewport toolbar in Gearbox Studio with layout mode buttons (`Side-by-Side` vs `Meshed`), tooth mesh rotation animation (`▶ Spin`), 3-gear binary STL export, and `⚙ Gear Settings` drawer toggle; (3) removed `<section id="layer-gearbox">` and the 'Gears' quick-nav button from `#panel` so the CAD dock remains strictly focused on rotor blade geometry; (4) created `#gearbox-inspector` docked on the left beside the 3D viewport with quick-jump gear pills (`Train`, `G1 Bull`, `G2 Idler`, `G3 Pinion`) and collapsible cards for Train Architecture, Web Cutouts, Gear 1, Gear 2, Gear 3, and STL export; and (5) implemented Three.js raycasting on the 3D canvas so hovering turns the cursor to `pointer` with technical HUD feedback, and clicking any gear in 3D highlights it with cyan emissive glow, slides open the inspector, and focuses that gear's settings card (`.card-selected`).
  refs: web/index.html, web/src/main.ts, web/src/state.ts, web/scripts/types.test.mjs | supersedes: F-geom1-055

- **F-geom1-057** | 2026-11-08 12:25 | geom-1 | T-105
  Flipped Gear 3 (Generator Motor Pinion) helical angle direction and added an interactive Helical Hand selector: (1) updated `GearboxConfig` with `g3_helix_hand: 1 | -1` (defaulting to `1` Right Hand RH, flipped from legacy `-1` Left Hand LH) so in the default `idler_reference` and `compound_2stage` modes at $z = 0$, Gear 3's teeth slope in the proper mating hand (+1 RH) against Gear 2 Wheel (-1 LH) rather than colliding with identical hand angles; (2) added `#g3-helix-hand` dropdown selector in the Gear 3 Inspector card in `web/index.html` allowing instant 1-click toggling between Right Hand (RH +β) and Left Hand (LH -β); (3) wired `g3_helix_hand` into DOM read/apply and change listeners in `web/src/main.ts`, automatically triggering live Three.js 3D re-render and workbench auto-save; and (4) verified by 16/16 Node tests (verifying vertex positions change between RH and LH), `tsc --noEmit`, and `vite build`.
  refs: web/src/state.ts, web/index.html, web/src/main.ts, web/scripts/types.test.mjs | supersedes: F-geom1-056

### 9.3 Decisions (D)

Statuses: `Proposed` | `Accepted` | `Superseded`

- **D-lead1-001** | 2026-11-05 17:17 | lead-1 | – | **Accepted**
  Rust-first: Share a single core codebase across browser (WASM) and server, with a React + TS frontend.
  refs: §2 | supersedes: –
- **D-lead1-002** | 2026-11-05 17:17 | lead-1 | – | **Accepted**
  B-spline surface from `loft()` is the single source of truth for geometry. Both STL and STEP must generate from this surface.
  refs: §8 | supersedes: –
- **D-lead1-003** | 2026-11-05 17:17 | lead-1 | – | **Accepted**
  Airfoil trailing edges must have a finite thickness. Main body constructed from 4 open side panels capped with trailing edge, root, and tip faces to prevent seam issues.
  refs: T-003, T-006 | supersedes: –
- **D-lead1-004** | 2026-11-05 17:17 | lead-1 | – | **Accepted**
  STEP export handled via truck through the `CadKernel` trait, maintaining an `occt` cargo feature fallback. If OCCT is used, it must run in an isolated worker process.
  refs: §8, T-010 | supersedes: –
- **D-lead1-005** | 2026-11-05 17:17 | lead-1 | – | **Accepted**
  Mesh boolean operations restricted exclusively to `manifold-csg` on the server; forbidden in core crates.
  refs: T-009 | supersedes: –
- **D-lead1-006** | 2026-11-05 17:17 | lead-1 | – | **Accepted**
  BEM implementation uses Ning (2014) solver with Brent's method root-finding, Prandtl tip/hub loss, Glauert correction, and Viterna polar extrapolation.
  refs: T-301, T-302 | supersedes: –
- **D-geom1-001** | 2026-11-05 17:37 | geom-1 | T-003 | **Proposed**
  Airfoil contour convention for every downstream consumer: a single open polyline of `2·n−1` points from `n` cosine stations per surface, ordered upper TE → LE → lower TE. The loop closes implicitly through the trailing-edge face, so the first and last points are two distinct points at `x = chord` (finite TE per D-lead1-003). `x = 0` is the exclusive leading-edge point.
  refs: crates/blade-geom/src/airfoil/mod.rs (`Airfoil`), T-004/T-005 | supersedes: –
- **D-geom1-002** | 2026-11-05 17:40 | geom-1 | T-003 | **Accepted**
  The lead approved in-session on 2026-11-05: (1) the D-geom1-001 contour convention is accepted as specified, and (2) Q-geom1-001 is answered — the dependency-free `crates/blade-geom/` core may proceed ahead of T-001/T-002, with `build_sections(&ResolvedBlade)` deferred until `blade-model` exists. geom-1 records the approval here because the workspace still has no git remote/PR channel.
  refs: plan.md §9.3 D-geom1-001, §9.4 Q-geom1-001 | supersedes: Q-geom1-001
- **D-geom1-003** | 2026-11-05 17:48 | geom-1 | T-001 | **Accepted**
  The lead approved in-session on 2026-11-05 that geom-1 takes over **T-001** (root Cargo workspace) and **T-002** (`blade-model` Design schema v1 + validation + resolve) so `build_sections(&ResolvedBlade)` can land and T-004 can finish. No §8 signature is amended — only the documented interfaces are implemented. Takeover scope: root `Cargo.toml`, `crates/blade-model/`, and `fixtures/naca4412-linear.json`. CI workflow files stay with qa (`.github/`); CI cannot be activated because no git remote exists.
  refs: plan.md §7 T-001/T-002, §8 | supersedes: –
- **D-geom1-004** | 2026-11-05 18:03 | geom-1 | T-005 | **Accepted**
  The lead approved in-session on 2026-11-05 that geom-1 takes over **T-005** (`crates/blade-mesh/`: tessellation + binary STL) because the `mesh` role has no agent in this workspace and T-004 is done. Scope: new `crates/blade-mesh/`, its workspace membership, and implementation of the §8 `tessellate`/`write_stl`/`check_mesh` contracts **without changing their signatures**. STL/3MF are the only outputs; no booleans (D-lead1-005).
  refs: plan.md §7 T-005, §8, F-geom1-008 | supersedes: –
- **D-geom1-005** | 2026-11-05 18:10 | geom-1 | T-006 | **Accepted**
  The lead confirmed in-session on 2026-11-05 that the exported STL opens correctly ("stl works") and instructed geom-1 to continue, which approves the **T-006** takeover (`crates/blade-cad/`). Scope: implement the §8 `CadKernel` trait (`blade_solid`, `hub_solid`, `write_step`) and the truck-backed STEP export, plus workspace membership. `blade-cad` is native/server-side per §2, so it is exempt from the wasm32 constraint that applies to model/geom/mesh/aero; no booleans in the STEP path (F-lead1-002), and OCCT remains an optional feature only per D-lead1-004.
  refs: plan.md §7 T-006, §8, §2, F-geom1-005 | supersedes: –
- **D-geom1-006** | 2026-11-05 18:30 | geom-1 | T-007 | **Accepted**
  The lead approved in-session on 2026-11-05 (question prompt) that geom-1 takes over **T-007** (qa role: headless STEP verification CI). Since no `qa` agent exists in this workspace, geom-1 owns the deliverable under qa's §4 paths: `.github/workflows/step-check.yml` (the CI job) and `tests/step_check.py` (the FreeCAD-driven checker). The job must fail when an exported STEP is not a valid solid; the checker is exercised locally through both a valid and a deliberately corrupt STEP because no git remote exists to actually run GitHub Actions (L-geom1-001). `blade-cad` continues to be the only body feeding the check. No §8 signatures are touched.
  refs: plan.md §7 T-007, §4 (qa row), L-geom1-008 | supersedes: –
- **D-geom1-007** | 2026-11-05 19:00 | geom-1 | T-008 | **Accepted**
  The lead delegated the next-task choice in-session on 2026-11-05 ("up to you"), which approves the **T-008** takeover (web role: `crates/blade-wasm/` + `web/`). Scope: (1) a `wasm-bindgen` crate that wraps the existing `blade-model → blade-geom → blade-mesh` pipeline (`Design::from_json → resolve → build_sections → loft → tessellate`) behind one `build_mesh(design_json, overrides_json)` call returning indexed triangle data; (2) a Three.js view that renders the blade and re-runs the pipeline from slider overrides (tip twist / tip chord), meeting the 50 ms update budget, verified by a Node benchmark of the compiled wasm. STEP stays out of the wasm bundle (§2). The live-twist knob is implemented as an override that mutates the parsed design's `CurveSource::Linear` distributions, so no §8/core interface changes are needed. qa-role `.github/` is untouched by this task.
  refs: plan.md §7 T-008, §3 (web/ + crates/blade-wasm/), §8 | supersedes: –
- **D-geom1-008** | 2026-11-05 19:20 | geom-1 | T-009 | **Accepted**
  The lead's "next" instruction in-session on 2026-11-05 approves the **T-009** takeover (server role: manifold boolean-CSG inside Docker). Since no `server` agent exists in this workspace, geom-1 owns the §4 server path `deploy/`. Scope: a `Dockerfile` that builds a working Manifold boolean engine in a container and a small runner that unions the blade and hub (the two fixture STLs) into one watertight mesh, satisfying "docker build succeeds, successfully unions blade + hub". It is a *verification spike* — the production API integration is T-203 — and D-lead1-005 (booleans only via manifold, server-side) is honoured. Local verification needs the Docker Desktop engine, which is installed but was not running at claim time.
  refs: plan.md §7 T-009, §4 (server row → deploy/), D-lead1-005, T-203 | supersedes: –
- **D-geom1-009** | 2026-11-05 20:12 | geom-1 | T-010 | **Accepted**
  **Kernel decision finalised** (closes T-010; drafted by geom-1 and adopted under the lead's in-session "next" instruction). BladeLab standardises on a split backend: **truck** is the B-rep/STEP engine; **Manifold** (`manifold3d`) is the server-side boolean/mesh engine; **OCCT** remains an optional `occt` cargo **feature only** (D-lead1-004), never a runtime dependency and never for boolean export. Basis, all demonstrated in this Phase 0: T-006 (truck) exports mm-accurate STEP solids that FreeCAD 1.1 accepts (4-face blade + 12-face hub, volume-consistent with the STL); truck-stepio cannot serialise boolean results (F-lead1-002); T-009 (Manifold in Docker) unions blade+hub into one watertight solid (genus 0, NoError) and is the D-lead1-005 engine for server assemblies. Consequences without any §8 change: `CadKernel::{blade_solid, hub_solid, write_step}` remains truck-only for STEP; the wasm bundle carries meshes only (no STEP, no booleans); merged/3MF output is produced server-side by Manifold (T-203). The `occt` fallback stays available should fillets/chamfers or a TE-seam repair ever demand it.
  refs: plan.md §7 T-010, §8 CadKernel, D-lead1-004, D-lead1-005, F-lead1-002, F-geom1-011, F-geom1-014 | supersedes: – (confirms D-lead1-004/D-lead1-005 for the final kernel split)
- **D-geom1-010** | 2026-11-05 20:20 | geom-1 | T-102 | **Accepted**
  The lead's "continues" instruction in-session on 2026-11-05 approves **T-102** (cad role) and accepts **P-geom1-001**: `blade_model::Hub` gains `shaft_flat_radial_mm: Option<f64>` (optional, default `None`), and `hub_solid` builds a D-flat bore hub by 2D extrusion (`builder::tsweep` of a holed annular face: outer circle wire + reversed inner D wire) — **no booleans** anywhere in the STEP path (F-lead1-002, D-lead1-005). Round-bore hubs (field absent) keep the existing revolve path unchanged, so no legacy design changes meaning. The `blade-model` schema change is a §5.4 core-interface amendment authorized here; the §8 `CadKernel` signatures themselves stay byte-for-byte identical.
  refs: plan.md §7 T-102, §9.6 P-geom1-001, §4 (blade-model), D-lead1-005 | supersedes: –
- **D-geom1-011** | 2026-11-05 23:20 | geom-1 | T-101 | **Accepted**
  The lead's in-session selection on 2026-11-05 approves **T-101** (`geom` role) and accepts **P-geom1-002**: (1) `crates/blade-geom` gains the `schmitz` module implementing Schmitz optimum-rotor inflow angle `φ(r) = (2/3)·atan(R/(λ·r))`, chord `c(r) = (16πr / (B·Cl))·sin²(φ(r)/2)`, and twist `β(r) = φ_deg(r) − α_design` across single stations and full rotor grids; (2) `blade_model::CurveSource` gains the additive `Schmitz { design_cl, design_alpha_deg }` variant so designs can specify `"type": "schmitz"` in `distributions.chord_mm` and `distributions.twist_deg` and resolve through `blade_model::resolve` without changing any §8 function signature.
  refs: plan.md §7 T-101, §9.6 P-geom1-002, §8 | supersedes: –
- **D-geom1-012** | 2026-11-05 23:31 | geom-1 | T-104 | **Accepted**
  The lead's "do next task" instruction in-session on 2026-11-05 approves the **T-104** takeover (`server` role: `crates/blade-cli/`, plus `write_3mf` in `crates/blade-mesh/` per §3 "Tessellation, STL/3MF, mesh checks" and root `Cargo.toml` workspace membership). Scope: `bladelab export <design.json> --format <stl|3mf|step> [-o <output>] [--part <blade|hub|assembly>]` CLI binary + library, generating validated STL, 3MF (OPC ZIP + 3MF Core XML in mm units, pure Rust with zero C/C++ deps so `blade-mesh` stays `wasm32`-clean), and STEP (`TruckKernel`, boolean-free per F-lead1-002). No §8 signatures are modified.
  refs: plan.md §7 T-104, §3, §8 | supersedes: –
- **D-geom1-013** | 2026-11-05 23:39 | geom-1 | T-103 | **Accepted**
  The lead's "Next" instruction in-session on 2026-11-05 approves the **T-103** takeover (`server` role: `crates/blade-server/` + root `Cargo.toml` workspace membership). Scope: Axum HTTP server exposing `POST /api/v1/export` for `stl`, `3mf`, and `step` (`blade`, `hub`, `assembly`), backed by a `blake3`-keyed in-memory artifact cache (`ETag` + `X-BladeLab-Cache: HIT|MISS`) and panic containment (`catch_unwind` + `spawn_blocking` recovery so panics return 500 JSON without crashing the server). No §8 signatures are modified.
  refs: plan.md §7 T-103, §2, §3 | supersedes: –
- **D-geom1-014** | 2026-11-06 00:13 | geom-1 | T-106 | **Accepted**
  The lead's "do nex" instruction in-session on 2026-11-06 approves the **T-106** takeover (`web` role: `ts-rs` bindings on `blade-model` schema types, generated `web/src/types/blade-model.ts`, and a test/CI check verifying that the committed TS definitions match the latest Rust structs). `ts-rs` is pure Rust and `wasm32`-clean; no §8 function signatures are modified.
  refs: plan.md §7 T-106, §2, §6.2 | supersedes: –
- **D-geom1-015** | 2026-11-06 00:35 | geom-1 | T-107 | **Accepted**
  The lead's "do next" instruction in-session on 2026-11-06 approves the **T-107** takeover (`qa` role: 5 canonical design fixtures under `fixtures/`, golden snapshot file `fixtures/golden_snapshots.json`, and an integration test suite verifying volume, surface area, vertex/triangle counts, and 3D bounding-box `x/y/z` min/max snapshots across all 5 fixtures so CI fails if geometry changes unexpectedly). No §8 function signatures are modified.
  refs: plan.md §7 T-107, §4 (qa row), §6.2 | supersedes: –
- **D-geom1-016** | 2026-11-06 00:50 | geom-1 | T-105 | **Accepted**
  The lead's "do next" instruction in-session on 2026-11-06 approves the **T-105** takeover (`web` role: `web/` UI for Layer 1 rotor/distribution controls + Layer 3 per-station override table + Undo/Redo history stack, with live `< 50 ms` 3D model updates via `blade-wasm`). Scope: pure-TypeScript state/history/station-resolution module (`web/src/state.ts`) using `web/src/types/blade-model.ts`, DOM/Three.js integration in `web/index.html` and `web/src/main.ts`, and Node unit tests for undo/redo, Layer-1 edits, and Layer-3 station table overrides. No §8 signatures are modified.
  refs: plan.md §7 T-105, §3, §6.2 | supersedes: –
- **D-geom1-017** | 2026-11-06 00:58 | geom-1 | T-201 | **Accepted**
  The lead's "do all phase2" instruction in-session on 2026-11-06 approves **T-201** (`geom` role) and accepts **P-geom1-003**: `blade_model::CurveSource` gains `Bezier { points: Vec<BezierControlPoint> }` (with `BezierControlPoint { x, y }` over blade span `x ∈ [0, 1]` or radial `r/R`, evaluated via De Casteljau / monotonic-x cubic or general Bernstein evaluation) and `Formula { expr: String }` (evaluated via `evalexpr` with variable `x = r / R`, plus `s`, `r`, `R`, `r_hub`, `B`, `tsr`, `pi`). Malformed formulas, unknown variables, division by zero, and non-finite outputs are caught in `validate()` and `eval_*()` and returned as clear `ValidationIssue` messages without panicking. `evalexpr` is pure Rust and `wasm32`-clean; no §8 function signatures are modified.
  refs: plan.md §7 T-201, §9.6 P-geom1-003, §8 | supersedes: –
- **D-geom1-018** | 2026-11-06 01:05 | geom-1 | T-202 | **Accepted**
  The lead's "do all phase2" instruction in-session on 2026-11-06 approves **T-202** (`geom` role) and accepts **P-geom1-004**: (1) bundle Selig-format `.dat` files for `SG6043`, `SD7062`, and `E387` under `data/airfoils/` (and embed them via `include_str!` so `blade-model` and `blade-geom` stay I/O-free and `wasm32`-clean); (2) add `.dat` parsing (`DatAirfoil::from_dat`), cosine-spaced resampling with finite open trailing-edge enforcement (`D-lead1-003`), and contour blending (`blend_airfoils(&Airfoil, &Airfoil, weight)`) in `blade-geom`; (3) support `AirfoilSpec::Named` (`SG6043`, `SD7062`, `E387`) and spanwise blending between consecutive `AirfoilStation` entries in `blade-model::resolve` and `blade-geom::build_sections` without changing any §8 function signature.
  refs: plan.md §7 T-202, §9.6 P-geom1-004, §8 | supersedes: –
- **D-geom1-019** | 2026-11-06 01:16 | geom-1 | T-203 | **Accepted**
  The lead's "do all phase2" instruction in-session on 2026-11-06 approves the **T-203** takeover (`cad` / `server` role): (1) extend `deploy/manifold/` (`manifold3d` boolean union runner) to overlap the hub with the blade root, boolean-union them into a single watertight genus-1 solid, and export both `.stl` and `.3mf`; (2) add native watertight hub and unified blade+hub assembly mesh construction (`hub_mesh`, `assembly_mesh`) and wire `--part hub` and `--part assembly` for `stl` and `3mf` into `blade-cli` and `blade-server` (`POST /api/v1/export`) so every export path yields a single connected watertight manifold part verified by `check_mesh`. No §8 signatures are modified.
  refs: plan.md §7 T-203, D-lead1-005, D-geom1-009 | supersedes: –
- **D-geom1-020** | 2026-11-06 01:24 | geom-1 | T-204 | **Accepted**
  The lead's "do all phase2" instruction in-session on 2026-11-06 approves the **T-204** takeover (`server` role: `crates/blade-server/`). Scope: (1) PostgreSQL schema migration (`crates/blade-server/migrations/0001_designs.sql` defining `designs` and `design_versions` tables with `JSONB` payload + `blake3` content digest); (2) `DesignStore` persistence layer supporting both PostgreSQL (`DATABASE_URL`) and an in-process transactional store for zero-daemon CI/integration testing; (3) REST endpoints `POST /api/v1/designs`, `GET /api/v1/designs`, `GET /api/v1/designs/{id}`, `PUT /api/v1/designs/{id}`, `DELETE /api/v1/designs/{id}`, `GET /api/v1/designs/{id}/versions`, and `GET /api/v1/designs/{id}/versions/{version}` with full semantic validation and immutable version history tracking. No §8 signatures are modified.
  refs: plan.md §7 T-204, §2, §3 | supersedes: –
- **D-geom1-021** | 2026-11-06 01:28 | geom-1 | T-205 | **Accepted**
  The lead's "do all phase2" instruction in-session on 2026-11-06 approves the **T-205** takeover (`web` role: `web/`). Scope: (1) interactive Layer-2 Curve Editor (`Bezier` control-point SVG curve editor + `Formula` expression editor with `x = r/R`) for `chord_mm` and `twist_deg`; (2) numeric value scrubbing (`applyScrubDelta` with `Shift` 10× coarse and `Alt` 0.1× fine modifiers + pointer-drag scrubbing on parameter labels); (3) per-station locking (`lockedStations` preserving locked station chord/twist as Layer-3 overrides when Layer-1/2 curves change) and root-to-tip taper ratio binding (`taperRatio = tip / root`). No §8 signatures are modified.
  refs: plan.md §7 T-205, §3, §6.2 | supersedes: –
- **D-geom1-022** | 2026-11-06 09:23 | geom-1 | T-301 | **Accepted**
  The lead's "next" instruction in-session on 2026-11-06 approves the **T-301** takeover (`aero` role: `crates/blade-aero/`, `data/polars/`, and root `Cargo.toml` workspace membership). Scope: (1) precomputed low-Reynolds polar datasets (`NACA 4412`, `NACA 0012`, `NACA 2415`, `NACA 6409`, `SG6043`, `SD7062`, `E387` across `Re ∈ [20k, 50k, 100k, 200k]`) embedded via `include_str!` so `blade-aero` stays I/O-free and `wasm32`-clean; (2) `PolarTable` and `PolarSet` with bilinear `(α, Re)` interpolation inside the attached/stall polar table and **Viterna–Corrigan (1982)** post-stall extrapolation across `α ∈ [-180°, +180°]` (with smooth flat-plate blend and aspect-ratio parameter `AR` giving `C_{d,\max} = 1.11 + 0.018·AR`); (3) unit and `proptest` verification proving continuity, boundedness, finite non-NaN evaluation, and physical post-stall sign/drag behavior across the full `±180°` angle-of-attack range.
  refs: plan.md §7 T-301, §8, D-lead1-006 | supersedes: –
- **D-geom1-023** | 2026-11-06 09:37 | geom-1 | T-302 | **Accepted**
  The lead's "lets do" instruction in-session on 2026-11-06 approves the **T-302** takeover (`aero` role: `crates/blade-aero/`). Scope: implement the §8 contract `pub fn simulate(b: &ResolvedBlade, polars: &PolarSet, op: &OperatingPoint) -> Result<AeroResult, AeroError>` in `crates/blade-aero/src/bem.rs` using **Ning (2014)** inflow-angle parameterization solved by **Brent's method**, **Prandtl** tip and hub loss factors $F = F_{\text{tip}} \cdot F_{\text{hub}}$, and **Glauert / Buhl (2005)** high-induction empirical correction for $a > a_c = 0.4$, plus TSR sweep evaluation (`simulate_tsr_sweep`) and QBlade reference validation tests. No §8 signatures are modified.
  refs: plan.md §7 T-302, §8, D-lead1-006 | supersedes: –
- **D-geom1-024** | 2026-11-06 09:50 | geom-1 | T-303 | **Accepted**
  The lead's "lets do next" instruction in-session on 2026-11-06 approves the **T-303** takeover (`aero` role: `crates/blade-aero/src/generator.rs`). Scope: permanent-magnet / brushless DC generator model (`GeneratorSpec` with `kv_rpm_per_v`, `internal_resistance_ohm`, `no_load_current_a`, `gear_ratio`), electrical state evaluation at a given rotor RPM and resistive load (`eval_generator_at_rpm`), load-curve sweep (`sweep_generator_load`), and coupled BEM rotor–generator equilibrium solver (`match_generator`) solving $Q_{\text{aero}}(\Omega) = Q_{\text{gen}}(\Omega, R_{\text{load}})$ to predict equilibrium RPM, TSR, back-EMF voltage, terminal load voltage, current, mechanical power, electrical output power, copper loss, and generator/system efficiency. No §8 signatures are modified.
  refs: plan.md §7 T-303, §8 | supersedes: –
- **D-geom1-025** | 2026-11-06 09:54 | geom-1 | T-304 | **Accepted**
  The lead's "lets do next" instruction in-session on 2026-11-06 approves the **T-304** takeover (`web` role: `crates/blade-wasm/` + `web/`). Scope: (1) expose `simulate_aero(design_json, options_json)` in `crates/blade-wasm` returning JSON with the design-point `AeroResult`, full `TsrSweepPoint` curve, and optional `GeneratorMatchResult`; (2) extend `web/src/state.ts`, `web/index.html`, and `web/src/main.ts` with a live SVG $C_p$–TSR chart (`#cp-tsr-svg` with Betz limit reference), **A/B Design Comparison** (snapshotting Baseline A and plotting both A and B curves with $\Delta C_{p,\max}$ / $\Delta P$ metrics), and **Experimental Test Data Logging** (parsing/adding experimental `(tsr, cp, rpm, power_w)` measurements, overlaying them as scatter points on the $C_p$–TSR SVG chart, and computing residuals/RMSE against the BEM simulation curve). No §8 signatures are modified.
  refs: plan.md §7 T-304, §3, §6.2 | supersedes: –
- **D-geom1-026** | 2026-11-06 14:22 | geom-1 | T-401 | **Accepted**
  The lead's "go to phase 4" instruction in-session on 2026-11-06 populates **Phase 4 — Optimization & Polish** (`T-401`..`T-404`) in §7 and approves the **T-401** takeover (`aero` / `web` roles: `crates/blade-aero/src/optimize.rs`, `crates/blade-wasm/`, and `web/`). Scope for `T-401`: deterministic derivative-free blade chord & twist optimizer (`optimize_blade`) maximizing single-point design-TSR $C_p$ or broadband TSR-band weighted $C_p$ while respecting locked stations (`StationOverride.locked`), minimum root/tip chord bounds, and manufacturing trailing-edge / thickness constraints, exposed in `blade-wasm` (`optimize_blade_wasm`) and the Web UI (`#aero-dock` one-click Auto-Optimize panel). No §8 signatures are modified.
  refs: plan.md §7 T-401..T-404, §8 | supersedes: –

### 9.4 Open Questions (Q)

- **Q-lead1-001** | 2026-11-05 17:17 | lead-1 | – | **Open**
  Competition rules: Maximum diameter, blade count, material constraints, test wind speed, and evaluation metrics.
- **Q-lead1-002** | 2026-11-05 17:17 | lead-1 | – | **Open**
  CAD software used by the team and requirement for single-body STEP assembly with integrated fastener holes and fillets.
- **Q-lead1-003** | 2026-11-05 17:17 | lead-1 | – | **Open**
  Mandatory motors/generators and shaft dimensions.
- **Q-geom1-001** | 2026-11-05 17:33 | geom-1 | T-003 | **Open**
  T-003 depends on T-002 (blade-model `Design`/`ResolvedBlade`), which is still `todo`, and the workspace itself does not exist yet (T-001). geom-1 can only implement the dependency-free numeric core of T-003 (NACA 4-digit surface, cosine resampling, TE thickness check) inside `crates/blade-geom/`; `build_sections(&ResolvedBlade)` must wait. Lead decision needed: allow the standalone crate now, or park T-003 until T-001/T-002 land.
  refs: plan.md §7 T-001..T-003, §8 | supersedes: –

### 9.5 Lessons & Gotchas (L)

- **L-geom1-001** | 2026-11-05 17:33 | geom-1 | T-003
  Workspace root contains only `plan.md` and `AGENTS.md` — there is no `.git`, no `Cargo.toml`, no `crates/`. Boot step 1 (`git pull --rebase`), the mandated claim/commit/push, and §0.3 commit trailers cannot be executed; all memory writes in this session are local-only until a repo/remote exists. Creating the workspace root is lead-owned (T-001), so geom-1 must not create `Cargo.toml`.
  refs: plan.md §0.1, §4, §5.1 | supersedes: –
- **L-geom1-002** | 2026-11-05 17:37 | geom-1 | T-003
  `proptest`'s `prop_assert!` stringifies its expression into a format string, so `prop_assert!(matches!(v, Err(E { .. })))` fails to compile with "expected `}` in format string". Bind the result to a `bool` first (`let rejected = matches!(...); prop_assert!(rejected);`).
  refs: crates/blade-geom/tests/properties.rs | supersedes: –
- **L-geom1-003** | 2026-11-05 17:45 | geom-1 | T-004
  `clippy -- -D warnings` rejects negated float comparisons (`!(a > b)`) via `neg_cmp_op_on_partial_ord`; use `a.partial_cmp(&b) != Some(Ordering::Greater)` for strict ordering checks (span monotonicity, station monotonicity).
  refs: crates/blade-geom/src/surface.rs, src/distribution.rs | supersedes: –
- **L-geom1-004** | 2026-11-05 17:54 | geom-1 | T-002
  Airfoil and constant-curve tests must account for the fixture's own layer choices: it defines an airfoil station at `span_ratio = 1.0` and a tip override. Inserting a mid-span airfoil therefore only applies up to (not including) the tip station, and a `Constant` curve test must clear `design.overrides` first or the tip override keeps winning. Assert the exact rule ("last station ≤ ratio") rather than "applies to the tip".
  refs: crates/blade-model/tests/resolve.rs | supersedes: –
- **L-geom1-005** | 2026-11-05 17:54 | geom-1 | T-002
  In PowerShell, piping cargo through `2>&1 | Select-String` reports `NativeCommandError`/exit 1 because cargo writes progress to stderr, even when the build succeeds. Trust cargo's own `Finished` / `test result: ok` lines instead of `$LASTEXITCODE`.
  refs: – | supersedes: –
- **L-geom1-006** | 2026-11-05 18:07 | geom-1 | T-005
  `impl std::ops::Sub for Point3` is impossible in `blade-mesh`: both the trait and the type are foreign, so the orphan rule rejects it. Use a local `sub(a, b)` helper (and a local `Magnitude` trait) instead of reaching for operator overloading.
  refs: crates/blade-mesh/src/{mesh,stl}.rs | supersedes: –
- **L-geom1-007** | 2026-11-05 18:07 | geom-1 | T-005
  Binary STL stores no indices: vertex welding must key on the serialised `f32` coordinates (the writer emits identical bits for shared vertices). `write_stl` is infallible by contract, so recompute normals, map non-finite coordinates to `0.0`, clamp to the finite `f32` range, and let `check_mesh` be the gate before export. Cap triangulation assumes a simple contour, which holds for D-geom1-001 airfoils.
  refs: crates/blade-mesh/src/stl.rs, tests/stl.rs | supersedes: –
- **L-geom1-008** | 2026-11-05 18:24 | geom-1 | T-006
  Headless STEP import in FreeCAD 1.1: `import Import; Import.insert(path, doc.Name)` works from `FreeCADCmd` and returns `None` in 1.1 — recover the shape from `doc.Objects` instead of the return value. Gotchas: FreeCADCmd treats every trailing CLI argument as a *file to open*, not as script `sys.argv`; when a `.step` path was passed that way the console printed misleading `Unknown extension` / `Unresolved Reference : Fails Count : 2` errors and even ran `shutil.copy2` against the wrong file. Pass only the script and hard-code paths inside it; unchanged file names with a `.step` suffix import fine.
  refs: C:\Program Files\FreeCAD 1.1, target/naca4412.*.step | supersedes: –
- **L-geom1-009** | 2026-11-05 18:24 | geom-1 | T-006
  truck API notes: (1) `builder::rsweep(&Face, origin, axis, Rad(2π))` uses `whole_rsweep` with `DIVISION = 3`, so each revolved face is split into three 120° spans — a hollow cylinder comes back as a **12-face** shell, and `Solid::try_new` still accepts it as closed/connected/non-singular. (2) `BSplineSurface` in `truck-modeling` needs an explicit `<Point3>` generic and `rsweep` angles need `Rad(f64)`, not a bare float. (3) Edges are `Arc`-backed: cloning an edge shares identity and `.inverse()` flips orientation in place, so one vertex/edge set can be reused by adjacent faces and `Solid::try_new` is the single closure check — the 4-face blade (side, trailing-edge strip, root cap, tip cap) passes it. (4) `CompleteStepDisplay` emits `ISO-10303-042`, `SI_UNIT(.MILLI.,.METRE.)` and `MANIFOLD_SOLID_BREP`; build models with `StepModels::from_iter(compressed.iter())`.
  refs: crates/blade-cad/src/kernel.rs, tests/step.rs | supersedes: –
- **L-geom1-010** | 2026-11-05 18:45 | geom-1 | T-007
  FreeCAD's own scripting argv conventions are hostile: `FreeCADCmd` puts its executable at `sys.argv[0]` and the script at `argv[1]`, treats any other positional argument as a document to open, and its `--pass` option only forwards **one** following token (multiple unquoted flags after `--pass` made it print help and exit). Its console also swallows script `print()` output. The reliable runner is FreeCAD's bundled `bin\python.exe` (plain argv semantics, stdout works); `Import.insert(..., doc.Name)` returns `None` in 1.1, so read `doc.Objects[0].Shape`.
  refs: C:\Program Files\FreeCAD 1.1\bin, tests/step_check.py | supersedes: –
- **L-geom1-011** | 2026-11-05 19:15 | geom-1 | T-008
  wasm tooling notes: (1) `wasm-bindgen-cli` must exactly match the `wasm-bindgen` crate version resolved in `Cargo.lock` (0.2.130 here) or the glue is silently wrong. (2) The `nodejs` glue is **synchronous** (reads the wasm via fs at require time) and sets `exports.build_mesh` directly; the `web` glue is an ES module exporting a default `init(module_or_path)` plus named exports — feed it `import wasmUrl from '../pkg/….wasm?url'; await init(wasmUrl)`. (3) On this machine `npm` is blocked as `npm.ps1` by the execution policy — always call `npm.cmd`. (4) `--no-typescript` skips `.d.ts`, so the TS toolchain does not type-check the generated glue (Vite/esbuild transpiles regardless). (5) A slider labelled "tip" only edits the *distribution* tip; the fixture's layer-3 override at `span_ratio = 1.0` keeps winning there (revisit L-geom1-004).
  refs: crates/blade-wasm, web/, Cargo.lock | supersedes: –
- **L-geom1-013** | 2026-11-05 20:40 | geom-1 | T-102
  truck face-with-hole construction: pass `[outer_boundary, inner_hole.inverse()]` to `builder::try_attach_plane` and `Solid::try_new` validates the annulus; `Sweep for Face → Solid` includes the inversed original face (bottom), the side faces and the "seiling" (top), so `builder::tsweep(&Face, vec)` yields a complete closed solid with no manual caps. A full circle fixture is three `builder::circle_arc` edges at 120° — true circular arcs, not control-polygon approximations. Trap: the two flat-chord endpooints (d, ±h) are cartesian points, so `polar(flat, theta)` (which would sit on a radius-`d` circle) is wrong — use `Point3::new(flat, ±h, 0)` directly.
  refs: crates/blade-cad/src/kernel.rs (d_flat_hub) | supersedes: –
- **L-geom1-012** | 2026-11-05 19:55 | geom-1 | T-009
  Docker gotchas hit while building the Manifold image: (1) `manifold-csg-sys` **clones the C++ source with git at build time** — the image needs `git` and `ca-certificates`, not just a C++ toolchain. (2) The binary's glibc/libstdc++ must match the runtime base: `rust:1-slim` is now built on trixie (GLIBC_2.38 / CXXABI_1.3.15), so the runtime stage must be `debian:trixie-slim` — `bookworm-slim` produces a "version `CXXABI_1.3.15` not found"-style loader error at run time, not build time. (3) PowerShell volume-path interpolation needs `${root}\target:/work` (brace the variable so `:` isn't consumed). (4) Trust findings, not `$LASTEXITCODE`, through `Select-String`-pipe pipelines (it reports -1 even on success); check `$?` or the last command's own exit.
  refs: deploy/manifold/Dockerfile, target/union.blade+hub.stl | supersedes: –
- **L-geom1-014** | 2026-11-05 23:29 | geom-1 | T-101
  Schmitz chord `c(λ_r) ∝ λ_r · sin²((1/3)·atan(1/λ_r))` is **not** monotonically decreasing near the axis: it vanishes as `r → 0` and reaches its stationary maximum where `tan(θ) = (1/3)·sin(6θ)` with `θ = (1/3)·atan(1/λ_r)`, i.e. at `λ_r* ≈ 0.7577` (`φ ≈ 35.24°`). Only for `λ_r > 0.7577` does chord strictly taper toward the tip; inflow angle `φ(r)` and twist `β(r)` decrease strictly across the entire span `(0, R]`.
  refs: crates/blade-geom/tests/properties.rs | supersedes: –
- **L-geom1-015** | 2026-11-06 00:20 | geom-1 | T-106
  `ts-rs` 10.1.0 attribute notes: (1) combining `#[serde(default, skip_serializing_if = "Option::is_none")]` triggers a macro warning (`failed to parse serde attribute`) and emits a non-optional field `field: number | null`; use `#[serde(default)]` + `#[ts(optional = nullable)]` so `ts-rs` generates `field?: number | null` cleanly with zero warnings. (2) In `web/src/vite-env.d.ts`, `declare module "../pkg/blade_wasm.js"` is rejected by `tsc` (`TS7016`) when the relative `.js` file exists on disk without a sibling `.d.ts`; use a wildcard ambient module pattern `declare module "*blade_wasm.js"` instead.
  refs: crates/blade-model/src/schema.rs, web/src/vite-env.d.ts | supersedes: –
- **L-geom1-016** | 2026-11-06 14:53 | geom-1 | T-005
  Resampled `.dat` airfoil cap triangulation: `DatAirfoil::surface` resamples 26–35 `.dat` knots (`SG6043.dat`, `SD7062.dat`, `E387.dat`) onto 65 cosine-spaced stations via piecewise-linear interpolation, producing consecutive strictly collinear vertices (`cross == 0`) along each facet, combined with a concave reflex lower surface on high-camber airfoils (`SG6043`) and twin keyhole-bridge vertices when holes (`append_cap_with_holes`) are present. A single-pass ear-clipper that demands `cross > epsilon` runs out of ears once convex corners are clipped. `triangulate_cap` must use a multi-pass ear selector (strictly convex ears first, then collinear forward steps `cross >= -1e-9 * scale^2 && dot > 0.0`) and ignore twin bridge vertices sharing `(x, y)` coordinates with the candidate ear's vertices when checking point-in-triangle and segment-crossing validity (`ear_is_valid`).
  refs: crates/blade-mesh/src/tessellate.rs, crates/blade-mesh/src/fabrication.rs | supersedes: –

*(Add new entries above this line; do not delete existing ones.)*

### 9.6 Proposals (P)

- **P-geom1-001** | 2026-11-05 20:20 | geom-1 | T-102 | **State: Accepted (D-geom1-010)**
  **Proposed Change:** Add an *optional* field to `blade_model::Hub`: `shaft_flat_radial_mm: Option<f64>` (serde-defaulted to `None`) = distance from the bore axis to the D-flat face, in `(0, bore/2)`. When `Some`, `CadKernel::hub_solid` switches from the revolved round bore to a **2D-extruded** hub whose bore cross-section is a D shape (arc of radius `r` where `x < d`, closed by a chord at `x = d`), built with `builder::tsweep(&holed_annular_face, (0,0,L))` — no booleans (F-lead1-002 / D-lead1-005).
  **Rationale:** T-102 (hub D-flat without booleans) needs the flat dimension as a parameter; a hard-coded magic flat would be a landmine. `None` preserves every existing design/JSON.
  **Impacted Crates:** `blade-model` (schema/hub docs — core interface, §5.4), `blade-cad` (hub_solid + tests/example).
  **Alternatives Considered:** (a) hard-code a default D-flat — rejected (not adjustable, hidden). (b) new `hub_solid_dflat` method — rejected (would amend §8 trait). (c) manifold boolean cut on the server — rejected for this task (booleans are a server T-203 concern; STEP must stay boolean-free).
- **P-geom1-002** | 2026-11-05 23:20 | geom-1 | T-101 | **State: Accepted (D-geom1-011)**
  **Proposed Change:** Add `CurveSource::Schmitz { design_cl: Option<f64>, design_alpha_deg: Option<f64> }` to `blade_model::CurveSource` alongside the `blade_geom::schmitz` formula module. When `distributions.chord_mm` uses `CurveSource::Schmitz`, `validate` requires `design_cl > 0` and `hub_radius_mm > 0` and `resolve` evaluates `c(r) = (16πr / (B·Cl))·sin²((1/3)·atan(R / (λ·r)))`; when `distributions.twist_deg` uses `CurveSource::Schmitz`, `validate` requires finite `design_alpha_deg ∈ [-90, 90]` and `resolve` evaluates `β(r) = (2/3)·atan(R / (λ·r))·(180/π) − α_design`.
  **Rationale:** T-101 requires Layer-1 Schmitz chord/twist generation that matches hand-calculated fixture values and integrates seamlessly with Layer-3 overrides and the `Design → resolve → build_sections → loft` pipeline without altering §8 signatures.
  **Impacted Crates:** `blade-model` (additive `CurveSource::Schmitz` variant, `validate`, `resolve`), `blade-geom` (`schmitz` module + re-exports), `fixtures/naca4412-schmitz.json`.
  **Alternatives Considered:** (a) standalone helper in `blade-geom` only, with no `CurveSource` support — rejected because JSON fixtures could not declaratively express Schmitz Layer-1 distributions in `resolve()`. (b) separate `ChordSource` and `TwistSource` enums — rejected because it would break existing `CurveSource` callers.
- **P-geom1-003** | 2026-11-06 00:58 | geom-1 | T-201 | **State: Accepted (D-geom1-017)**
  **Proposed Change:** Add `CurveSource::Bezier { points: Vec<BezierControlPoint> }` (`BezierControlPoint { x: f64, y: f64 }`) and `CurveSource::Formula { expr: String }` to `blade_model::CurveSource`. `Bezier` evaluates a Bernstein/De Casteljau curve over `x ∈ [0, 1]` (solving `x(t) = s` via bisection when control-point `x` values are monotonic `[0, 1]`, or evaluating `y(s)` directly), while `Formula` evaluates `expr` via `evalexpr` with context `x = r/R`, `s`, `r`, `R`, `r_hub`, `B`, `tsr`, and `pi`.
  **Rationale:** T-201 requires Layer-2 Bézier curves and `evalexpr` formulas (`x = r/R`) that integrate directly into `Design` JSON, `validate()`, `resolve()`, and `ts-rs` TypeScript bindings (`T-106`/`T-205`).
  **Impacted Crates:** `blade-model` (`schema`, `validate`, `resolve`, `Cargo.toml`), `blade-geom` (`curve` module re-exports), `web/src/types/blade-model.ts`.
  **Alternatives Considered:** Putting `evalexpr` only in `blade-geom` — rejected because `blade_model::validate` and `blade_model::resolve` evaluate `CurveSource` directly during schema validation and station resolution.
- **P-geom1-004** | 2026-11-06 01:05 | geom-1 | T-202 | **State: Accepted (D-geom1-018)**
  **Proposed Change:** Extend `blade_model::ResolvedAirfoil` with optional contour / blending metadata (while keeping `max_camber`, `camber_position`, `thickness_ratio` fields intact for backward compatibility) so `resolve` can represent NACA4, named library airfoils (`SG6043`, `SD7062`, `E387`), and spanwise blended transitions between stations, and `blade_geom::build_sections` evaluates them via `DatAirfoil` / `Naca4` / `blend_airfoils`.
  **Rationale:** T-202 requires `.dat` import, the `SG6043`, `SD7062`, and `E387` library airfoils, and spanwise airfoil blending while keeping `blade-model` and `blade-geom` I/O-free (`wasm32-unknown-unknown`) and preserving §8 signatures.
  **Impacted Crates:** `data/airfoils/*.dat`, `blade-model` (`resolve`), `blade-geom` (`airfoil::dat`, `airfoil::blend`, `sections`).
  **Alternatives Considered:** Filesystem reads at runtime — rejected because core crates must be I/O-free and compile to `wasm32-unknown-unknown` (`plan.md` §0.2).

### 9.7 Handoffs (H)

- **H-geom1-001** | 2026-11-05 17:37 | geom-1 | T-003 | Recipient: lead, mesh, web
  **Progress:** `crates/blade-geom/` is a standalone crate (no workspace root yet) implementing T-003: `Naca4::{new, camber_line, half_thickness, trailing_edge_thickness_mm, check_trailing_edge, surface}` → `Airfoil`, plus `cosine_spacing(n)`. Verified `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, 13 unit + 4 proptest + 2 doctests, and `cargo build --target wasm32-unknown-unknown`.
  **Next:** T-001 must create the root workspace (this crate uses plain dependency versions, no workspace inheritance) and remove the stray `crates/blade-geom/Cargo.lock`; T-004 then adds `build_sections`/`loft` once `blade-model` exposes `ResolvedBlade`.
  **Cautions:** Do not change the contour ordering without amending D-geom1-001 (mesh/cad depend on it). The TE minimum is a caller-supplied `min_mm`; no hidden global threshold. Nothing is committed or pushed (no git repo — see L-geom1-001), so these files exist only locally.
- **H-geom1-002** | 2026-11-05 17:45 | geom-1 | T-004 | Recipient: mesh, cad, lead
  **Progress:** T-004 geometry core is implemented and green: `Section3D::{new, from_airfoil}`, `Point3`, `BladeSurface::{point_at, point_at_span_mm, section_at, control_points, knots, degree, section_params}` and `loft(&[Section3D])` with pass-through error ≤ 1e-6 mm. 21 unit + 6 proptest + 3 doctests pass; fmt/clippy/wasm32 clean.
  **Next:** `build_sections(&ResolvedBlade)` (layer 1 + layer 3 merge → sections) still waits for `blade-model` `ResolvedBlade` (T-002). mesh/cad can already consume `BladeSurface` with explicitly built sections.
  **Cautions:** sections must share identical topology and strictly increasing span stations; this is an interpolating surface, so control-point count grows 1:1 with the section stack.
- **H-geom1-003** | 2026-11-05 17:54 | geom-1 | T-004 | Recipient: lead, mesh, cad, qa
  **Progress:** T-002 and T-004 are `done`. `blade-model` v1 (schema + validation + resolve) and `blade-geom::build_sections` are implemented; the full pipeline `Design → resolve → build_sections → loft` runs on `fixtures/naca4412-linear.json`, and the loft passes through all 11 sections within 1e-6 mm. Verification: 59 tests green (24 geom unit, 2 build_sections, 2 loft-property, 4 airfoil-property, 14 design, 9 resolve, 3 + 1 doctests), `cargo fmt --check`, `clippy --workspace --all-targets -- -D warnings`, and `cargo build -p blade-model -p blade-geom --target wasm32-unknown-unknown`. T-001 stays `in-progress` only because CI cannot be activated (no remote, `.github/` qa-owned); truck versions are now recorded in F-geom1-005.
  **Next:** T-005 (STL from `BladeSurface`) and T-006 (truck STEP) can start; both should consume `loft()` output only (D-lead1-002). Lead must supply a git remote to enable `git pull --rebase`/`push` and CI.
  **Cautions:** `SECTION_SAMPLES_PER_SURFACE = 81` and the 161-point topology are now baked into `build_sections`; changing them changes mesh/STEP vertex counts. `resolve` dedupes stations at 1e-9 and override matching uses the same tolerance — do not tighten one without the other.
- **H-geom1-004** | 2026-11-05 18:07 | geom-1 | T-005 | Recipient: lead, qa, cad, web
  **Progress:** T-005 implementation is complete and in `review`. `crates/blade-mesh/` now implements the §8 contracts `tessellate(&BladeSurface, &MeshOptions)`, `write_stl(&Mesh)` and `check_mesh(&Mesh)` with no signature changes. Fixture result: 1771 vertices, 3538 triangles, watertight, volume 126 493.7 mm³, STL 176 984 bytes. Verified by 12 new tests (6 pipeline, 5 STL byte-level, 1 proptest over 48 random blades), fmt/clippy/wasm32, plus an independent Node STL parser (0 open/non-manifold edges, all normals unit, volume matches). Workspace total is now 72 tests.
  **Next:** a human should open `target/naca4412.blade.stl` in a slicer to sign off the last acceptance line; then set T-005 to `done`. T-006 (truck STEP) can start from `loft()` output, and T-008 can render the `Mesh` directly.
  **Cautions:** STL is `f32`, so coordinates are only exact to ~1e-5 mm at 600 mm span — do not use STL as a metrology source. `write_stl` never fails and will happily serialise an open mesh; always gate on `check_mesh(...).is_valid_solid()`. `MeshOptions` currently only toggles caps; surface density is fixed by the loft sample count.
- **H-geom1-005** | 2026-11-05 18:24 | geom-1 | T-006 | Recipient: lead, qa, cad, web
  **Progress:** T-006 is `done`. `crates/blade-cad/` implements the §8 `CadKernel` for truck: `blade_solid` (closed 4-face shell: side B-spline + ruled trailing-edge strip + root/tip planar caps, edges shared and validated by `Solid::try_new`), `hub_solid` (annular profile revolved 2π → 12-face hollow cylinder), and `write_step` (one or many compressed solids, mm units). `examples/export_step.rs` writes `target/naca4412.blade.step` and `target/naca4412.assembly.step`. FreeCAD 1.1.1 headless confirms both as valid solids in mm — see F-geom1-011. Verification: 6 integration tests in `tests/step.rs` (incl. truck STEP reader round-trip) + doctest = 7 new tests, plus fmt/clippy `-D warnings` and the whole workspace (79 tests) green; wasm32 constraint holds for model/geom/mesh and blade-cad is excluded per §2.
  **Next:** T-007 (CI headless STEP check) can reuse the `Import.insert` + `Shape.isValid()` pattern from L-geom1-008, and T-102 can build the hub detail (D-flat) from the existing profile wiring.
  **Cautions:** blade-cad is native-only — keep STEP out of the wasm bundle. The hub is a full 2π revolution (12 faces, `whole_rsweep` DIVISION=3); do not assume 4 faces for a cylinder downstream. STEP is the only metrology-grade export; STL stays f32. Untouched: no booleans anywhere in the STEP path (F-lead1-002).
- **H-geom1-006** | 2026-11-05 18:45 | geom-1 | T-007 | Recipient: lead, qa, cad
  **Progress:** T-007 deliverable is complete: `.github/workflows/step-check.yml` (`build` = fmt/clippy/workspace tests on ubuntu; `step-check` = windows-latest, choco installs FreeCAD weekly build, `cargo run --example export_step`, then `tests/step_check.py` validates blade [1 solid, z∈59..601 mm] and assembly [2 solids]) and `tests/step_check.py` (OCCT headless checker, exit 0 only on valid closed solid + optional `--solids`/`--z-min`/`--z-max`). The job's failure behaviour is proven locally: 2 positive (PASS/exit 0) and 4 negative (FAIL/exit 1: corrupt file, solids mismatch, z-bound violation, missing path) cases — see F-geom1-012.
  **Next:** with a git remote added, the workflow activates on push; until then GitHub `actions/checkout@v4`, dtolnay/rust-toolchain, Swatinem/rust-cache and the choco `freecad` package pins have not been exercised by a real runner. qa may extend the same checker for T-107 golden STEP snapshots (`--z-min/-max`/`--solids` already expose the hooks).
  **Cautions:** run the checker with FreeCAD's `bin\python.exe`, not `FreeCADCmd` (L-geom1-010). The choco FreeCAD package tracks weekly 1.x builds, so the CI FreeCAD may differ slightly from the local 1.1.1 — bounds in the workflow are deliberately loose (±1 mm) to absorb that. Prefer `Import.insert` for STEP over `Part.insert` (BREP-only deprecation).
- **H-geom1-007** | 2026-11-05 19:15 | geom-1 | T-008 | Recipient: lead, web, cad
  **Progress:** T-008 is `done`. `crates/blade-wasm/` (wasm-bindgen rlib+cdylib, 4 unit tests) wraps the existing Rust pipeline in `build_mesh(design_json, overrides_json)`; `web/` is a Vite 8 + Three.js 0.187 viewer with tip-twist/tip-chord sliders that re-run the pipeline live. Acceptance verified in the app: renders with zero console errors (screenshot), and a twist edit updates in **0.5 ms** (Node bench avg 0.43 ms / max 0.80 ms over 40 edits, budget 50 ms); `npm run bench` re-verifies it against the known STL numbers. Workspace total is now **83 tests**, fmt/clippy/wasm32 clean; `vite build` produces `web/dist` with the wasm as an asset.
  **Next:** T-105 (React UI with per-station table) can reuse `web/` + the wasm `MeshData` directly; T-008-style regenerable glue lives under `npm run wasm` (build wasm → `wasm-bindgen --target web`). The viewer currently re-sends the full design JSON per edit — if the 50 ms budget ever tightens, cache the parsed `Design` behind a separate wasm entry point.
  **Cautions:** `web/pkg`, `target/glue-node` and `web/dist` are gitignored (regenerate with `npm run wasm` / `npm run build`). The `wasm-bindgen` CLI must match the crate version (L-geom1-011). blade-cad stays native-only; nothing in this task touches §8 or the cad/wasm boundary.
- **H-geom1-008** | 2026-11-05 19:55 | geom-1 | T-009 | Recipient: lead, server, cad, qa
  **Progress:** T-009 is `done`. `deploy/manifold/` delivers a self-contained image (`bladelab/manifold:spike`, 117 MB, debian trixie runtime): a `manifold3d`-based `manifold-union` runner that loads a binary STL (weld on exact f32 bits), builds the hub as a hollow 64-gon cylinder (`cylinder(50,60,60) − cylinder(50,6,6)`), boolean-unions, and writes a binary STL. It runs a deterministic 3-assertion boolean self-check first. Verified locally: `docker build --no-cache` clean; union run → self-check PASS, blade 126 493.727 + hub 558 932.941 = union 685 426.668 mm³, genus 0, `NoError`; the output STL is independently watertight (0 boundary / 0 non-manifold edges, volume matches to 0.002 mm³, z 0→600 mm). `deploy/manifold/run-demo.ps1` regenerates the blade STL if needed and runs the whole thing.
  **Next:** T-203 (unified blade+hub assembly + 3MF in `blade-server`) can adopt `manifold3d` directly; T-010's kernel decision now has concrete data (truck cannot export booleans — F-lead1-002 — while Manifold booleans are proven here; likely division of labour: truck for STEP B-rep, Manifold for server meshes/3MF). A deeper assembly with an overlapping hub could show union < sum on the real parts.
  **Cautions:** input is f32 STL (volume exact to ~0.002 mm³); the 64-gon hub is faceted (volume slightly below the analytic 559 831.8). The union STL lives in gitignored `target/`. Booleans must stay off the wasm/STEP paths (D-lead1-005). The container build needs network (git clone of the C++ source).
- **H-geom1-009** | 2026-11-05 20:12 | geom-1 | T-010 | Recipient: lead, cad, server
  **Progress:** T-010 is `done` — the truck-vs-occt kernel decision is recorded as **D-geom1-009** in §9.3: truck = STEP B-rep, Manifold = server booleans, OCCT = optional feature only. No §8 interface change was needed; the existing `CadKernel` and the wasm/STEP split are confirmed as final for the current roadmap.
  **Next:** Phase 1 can start: T-101 (Schmitz layer-1) and T-102 (hub D-flat via 2D extrusion) no longer wait on T-010; T-203 can build the unified Manifold assembly/3MF on the server; the `occt` feature can be filled in whenever fillets/chamfers are wanted.
  **Cautions:** the decision is a confirmation of D-lead1-004/D-lead1-005 plus in-session evidence — if a future requirement (e.g., STEP booleans or STEP fillets) reopens it, reverse course needs a fresh Proposal in §9.6. Until then, do not introduce booleans into `blade-cad`'s STEP path or into wasm.
- **H-geom1-010** | 2026-11-05 20:40 | geom-1 | T-102 | Recipient: lead, cad, server
  **Progress:** T-102 is `done`. `Hub` gained optional `shaft_flat_radial_mm` (P-geom1-001 / D-geom1-010) and `hub_solid` now emits a D-flat-bore hub by 2D extrusion — `tsweep` of a holed annular face — with **no booleans** (F-lead1-002). Verified: 2 new cad tests (8-face shell, STEP round-trip with two flat-chord `Line` edges at z=0/50; invalid flat distances rejected) + 1 blade-model schema/validation test; `export_step` writes `target/naca4412.hub-dflat.step`, which FreeCAD 1.1 reports as a valid solid with volume exactly matching the closed form (560 126.1 mm³). Workspace 86 tests, fmt/clippy/wasm32 clean.
  **Next:** T-101 (Schmitz layer-1) is the last unclaimed Phase 1 task; T-203 can feed the D-flat hub into the Manifold server assembly; the `occt` optional feature remains open for fillets/chamfers.
  **Cautions:** the D-flat is purely additive — designs without the field keep the round revolve path byte-for-byte. The flat reference stays perpendicular to +x; a future shaft-alignment rotation would be a separate option. No §8 signature changed.
- **H-geom1-011** | 2026-11-05 23:29 | geom-1 | T-101 | Recipient: lead, geom, web, aero
  **Progress:** T-101 is `done`. `blade_geom::schmitz` implements `SchmitzParams`, `SchmitzStation`, `schmitz_inflow_angle_deg`, `schmitz_chord_mm`, `schmitz_twist_deg`, `schmitz_station`, and `schmitz_distribution`; `blade_model::CurveSource` gained `Schmitz { design_cl, design_alpha_deg }` (P-geom1-002 / D-geom1-011) with full validation and Layer-3 override compatibility; `fixtures/naca4412-schmitz.json` provides the 11-station canonical Schmitz fixture. Workspace is now at **97 tests** (up from 86), all green alongside `cargo fmt --check`, `clippy --workspace --all-targets -- -D warnings`, and `wasm32-unknown-unknown` builds.
  **Next:** T-201 (Layer 2 Bézier curves and `evalexpr` formulas) is now unblocked (`Depends: T-101`); T-103/T-104 (server/CLI export), T-105/T-106 (web UI & `ts-rs`), and T-107 (qa golden tests) are all ready to claim.
  **Cautions:** Schmitz chord requires `hub_radius_mm > 0` because `c(0) = 0 mm` violates positive section chord; `validate()` enforces this when `chord_mm` uses `CurveSource::Schmitz`.
- **H-geom1-012** | 2026-11-05 23:36 | geom-1 | T-104 | Recipient: lead, server, qa
  **Progress:** T-104 is `done`. `crates/blade-cli` provides the `bladelab` CLI (`bladelab export <design.json> --format <stl|3mf|step> [-o <output>] [--part <blade|hub|assembly>]`) and the pure in-memory `export_design_bytes(json, format, part)` driver, backed by `blade_mesh::write_3mf`, `blade_mesh::write_stl`, and `blade_cad::TruckKernel`. Verified across both linear and Schmitz fixtures: 6 new tests (2 in `blade-mesh`, 4 in `blade-cli` including binary subprocess execution), FreeCAD headless STEP check (`PASS`), Python `zipfile` + 3MF XML check (`3MF_OK`), fmt/clippy/wasm32 clean; workspace total is now **103 tests**.
  **Next:** T-103 (`blade-server` `POST /api/v1/export` with `blake3` caching) can call `blade_cli::export_design_bytes` (or share its logic) directly inside `spawn_blocking` / `catch_unwind`; T-107 (golden tests) can snapshot all 3 export formats.
  **Cautions:** `--part hub` and `--part assembly` require `--format step` in `blade-cli` because unified mesh booleans belong exclusively to Manifold on the server (`D-lead1-005` / `T-203`).
- **H-geom1-013** | 2026-11-05 23:43 | geom-1 | T-103 | Recipient: lead, server, web, qa
  **Progress:** T-103 is `done`. `crates/blade-server` implements `POST /api/v1/export` (`stl`, `3mf`, `step`) with `blake3` caching (`ExportCache` + `CacheStats`) and panic containment (`CatchPanicLayer` + `spawn_blocking` `catch_unwind`). Verified by 3 integration tests in `crates/blade-server/tests/api_export.rs` (format exports, `MISS`→`HIT` cache verification across whitespace-reformatted JSON, `304 Not Modified`, 400/422 error responses, and simulated panic recovery proving subsequent requests still return `200 OK`). Workspace total is now **106 tests**, fmt/clippy/wasm32 clean.
  **Next:** Remaining Phase 1 tasks are **T-106** (`ts-rs` automated generation of TS types from `blade-model`), **T-107** (golden tests: 5 fixtures + volume/bounding box snapshots), and **T-105** (UI: Layer 1 controls + Layer 3 per-station table). T-204 (PostgreSQL persistence) is also unblocked by T-103.
  **Cautions:** `ExportCache` is in-memory per process; `AppState` is `Clone` (`Arc`-backed) so `T-204` can attach a `sqlx::PgPool` alongside `cache`.
- **H-geom1-014** | 2026-11-06 00:20 | geom-1 | T-106 | Recipient: lead, web, qa
  **Progress:** T-106 is `done`. `ts-rs` 10.1.0 is wired into `blade-model` (`blade_model::typescript_bindings()`), `web/src/types/blade-model.ts` is generated and consumed by `web/src/main.ts`, `crates/blade-model/tests/ts_bindings.rs` and `.github/workflows/step-check.yml` fail CI if Rust structs drift from `web/src/types/blade-model.ts`, and `web/package.json` now passes `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Workspace total is now **107 Rust tests + 1 Node test**, all green.
  **Next:** Remaining Phase 1 tasks are **T-107** (golden tests: 5 fixtures + volume/bounding box snapshots) and **T-105** (UI: Layer 1 controls + Layer 3 per-station table, which can directly import `Design`, `Rotor`, `StationOverride`, etc. from `web/src/types/blade-model.ts`).
  **Cautions:** Whenever any struct in `crates/blade-model/src/{schema,error}.rs` changes, re-run `BLADELAB_UPDATE_TS=1 cargo test -p blade-model --test ts_bindings` to update `web/src/types/blade-model.ts`.
- **H-geom1-015** | 2026-11-06 00:40 | geom-1 | T-107 | Recipient: lead, qa, geom, mesh, cad
  **Progress:** T-107 is `done`. Added 3 new canonical fixtures (`naca0012-constant.json`, `naca2415-multistation-dflat.json`, `naca6409-high-tsr-5blade.json`), bringing the `fixtures/` suite to 5 designs covering linear/constant/Schmitz curves, symmetric/cambered/multi-station airfoils, Layer-3 mid-span & tip overrides, and round/D-flat hubs. `crates/blade-mesh/tests/golden_snapshots.rs` + `fixtures/golden_snapshots.json` verify exact topology, volume (`±1e-3 mm³`), surface area (`±1e-3 mm²`), min triangle altitude, and 3D bounding box (`±1e-5 mm`), plus a mutation test proving that a 1 mm geometry change fails the check. `crates/blade-cad/tests/step.rs` also verifies B-rep STEP export for all 5 fixtures. Workspace is now at **110 Rust tests + 1 Node test**, all green.
  **Next:** **T-105** (`UI: Layer 1 controls + Layer 3 per-station table`) is the final remaining task in **Phase 1 — MVP**.
  **Cautions:** If an approved geometry algorithm change alters mesh output, regenerate snapshots with `BLADELAB_UPDATE_GOLDEN=1 cargo test -p blade-mesh --test golden_snapshots`.
- **H-geom1-016** | 2026-11-06 00:56 | geom-1 | T-105 | Recipient: lead, web, geom, qa
  **Progress:** T-105 is `done`, completing **100% of Phase 1 — MVP** (`T-101` through `T-107` all `done`). `web/` now features Layer-1 rotor & distribution controls (Linear & Schmitz), a live Layer-3 per-station override table, and an Undo/Redo history stack (`DesignHistory`). Verified by 4 Node tests in `web/scripts/types.test.mjs` (including end-to-end wasm `build_mesh` verification of Layer-1 edits, Layer-3 station overrides, and Undo/Redo exact geometry restoration), `tsc --noEmit`, `vite build`, and the 40-edit latency benchmark (`max 0.76 ms < 50 ms`). Workspace total is **110 Rust tests + 4 Node tests**, all green.
  **Next:** Phase 2 (`T-201`: Layer 2 Bézier curves and `evalexpr` formulas with variable `x = r/R`; `T-202`: Airfoil library + `.dat` import + blending; `T-203`: Unified blade+hub assembly via Manifold booleans + 3MF; `T-204`: PostgreSQL persistence; `T-205`: UI curve editor).
  **Cautions:** Range sliders (`#twist`, `#chord`) update the 3D viewport on `input` and push a single snapshot onto `DesignHistory` on `change` so dragging a slider does not flood the undo stack.
- **H-geom1-017** | 2026-11-06 01:04 | geom-1 | T-201 | Recipient: lead, geom, web, qa
  **Progress:** T-201 is `done`. `blade-model` implements `CurveSource::Bezier` and `CurveSource::Formula` (`evalexpr` 11.3.1, `wasm32`-clean), `web/src/types/blade-model.ts` (`ts-rs`) and `web/src/state.ts` are updated to match, and 2 new test suites in `blade-model` verify Bézier/formula resolution and non-panicking rejection of malformed formulas. Workspace total is **112 Rust tests + 4 Node tests**, all green.
  **Next:** **T-202** (Airfoil library + `.dat` import + blending) and **T-205** (UI curve editor, value scrubbing, locking & binding, now unblocked by `T-201`).
  **Cautions:** In `evalexpr`, integer division `1 / 3` evaluates to `0`; write float literals `1.0 / 3.0` (or `2.0 / 3.0`) in formulas when floating-point division of constants is intended.
- **H-geom1-018** | 2026-11-06 01:14 | geom-1 | T-202 | Recipient: lead, geom, aero, web, qa
  **Progress:** T-202 is `done`. `data/airfoils/{SG6043,SD7062,E387}.dat` and `blade_geom::{DatAirfoil, library_airfoil, library_airfoil_names, blend_airfoils, build_blended_sections}` are implemented and wired into `blade_model::resolve` and `blade_geom::build_sections`. All 3 library airfoils (`SG6043`, `SD7062`, `E387`), Lednicer `.dat` import, and root-to-tip airfoil blending pass all unit and end-to-end loft tests. Workspace total is **117 Rust tests + 4 Node tests**, all green.
  **Next:** **T-203** (Unified blade+hub assembly via Manifold booleans + 3MF), **T-204** (PostgreSQL persistence: designs, versioning), and **T-205** (UI: Curve editor, value scrubbing, locking & binding).
  **Cautions:** `resolve()` preserves step-function `AirfoilStation` selection on `station.airfoil` so existing multi-station fixtures (`naca2415-multistation-dflat.json`) keep byte-identical golden geometry; use `blend_airfoils` or `build_blended_sections` for smooth contour transitions.
- **H-geom1-019** | 2026-11-06 01:23 | geom-1 | T-203 | Recipient: lead, cad, server, qa
  **Progress:** T-203 is `done`. `blade_cad::{hub_mesh, assembly_mesh}` and `deploy/manifold` produce unified watertight blade+hub manifold solids and `.3mf` / `.stl` exports; `blade-cli` and `blade-server` (`POST /api/v1/export`) now support `part=hub` and `part=assembly` across all 3 formats (`stl`, `3mf`, `step`). Verified across all 5 canonical fixtures (`check_mesh.is_valid_solid() == true`, `connected_components == 1`). Workspace total is **118 Rust tests + 4 Node tests**, all green.
  **Next:** **T-204** (PostgreSQL persistence: designs, versioning) and **T-205** (UI: Curve editor, value scrubbing, locking & binding).
  **Cautions:** `assembly_mesh` stays in `blade-cad` (native/server-side) while `deploy/manifold` provides the containerized `manifold3d` C++ boolean runner, keeping core crates 100% boolean-free and `wasm32`-clean (`D-lead1-005`).
- **H-geom1-020** | 2026-11-06 01:27 | geom-1 | T-204 | Recipient: lead, server, web, qa
  **Progress:** T-204 is `done`. `crates/blade-server` now provides `migrations/0001_designs.sql`, `DesignStore`, and the full `/api/v1/designs` CRUD + version history REST API (`create`, `list`, `get`, `update`, `delete`, `list_versions`, `get_version`, `restore_version`), verified by integration tests in `crates/blade-server/tests/api_designs.rs`. Workspace total is **120 Rust tests + 4 Node tests**, all green.
  **Next:** **T-205** (`UI: Curve editor, value scrubbing, locking & binding`), the final task in **Phase 2**!
  **Cautions:** Restoring an older version via `POST /api/v1/designs/{id}/versions/{version}/restore` creates a new head version (`current_version + 1`) rather than rewriting history, keeping `design_versions` strictly append-only.
- **H-geom1-021** | 2026-11-06 09:20 | geom-1 | T-205 | Recipient: lead, web, aero, qa
  **Progress:** T-205 is `done`, completing **100% of Phase 2 — Advanced Tuning & Full STEP Support** (`T-201` through `T-205` all `done`). `web/` now includes the interactive Layer-2 Bézier curve editor and Formula editor (`x = r/R`), horizontal pointer-drag value scrubbing (`Shift` 10× / `Alt` 0.1×), per-station locking (`🔒` / `🔓`), and root-to-tip chord taper binding (`tip = root · taperRatio`). Verified by 6 Node tests in `web/scripts/types.test.mjs` (including wasm `build_mesh` verification of Bézier and Formula curves), `tsc --noEmit`, and `vite build`. Workspace total is **120 Rust tests + 6 Node tests**, all green.
  **Next:** **Phase 3 — Simulation & Testing** (`T-301`: Precomputed polars + Viterna extrapolation; `T-302`: BEM solver (Ning 2014 + Brent) + Prandtl + Glauert; `T-303`: Generator matching; `T-304`: UI Cp–TSR charts, A/B comparison, test data logging).
  **Cautions:** Dragging a Bézier control point updates the SVG curve, station table, and 3D mesh live on `pointermove` and commits a single snapshot onto `DesignHistory` on `pointerup`.
- **H-geom1-022** | 2026-11-06 09:29 | geom-1 | T-301 | Recipient: lead, aero, web, qa
  **Progress:** T-301 is `done`. `crates/blade-aero` and `data/polars/*.json` implement `PolarSet`, `PolarTable`, and `ViternaSweep` with bilinear `(Re, α)` interpolation and Viterna–Corrigan 360° post-stall extrapolation across `α ∈ [-180°, +180°]`. Verified by 4 unit tests + 1 `proptest` suite in `crates/blade-aero/tests/polars_viterna.rs` (`C^0` continuity across stall and ±90° boundaries, `Cd > 0`, 360° periodicity, and `wasm32-unknown-unknown` compilation). Workspace total is **125 Rust tests + 6 Node tests**, all green.
  **Next:** **T-302** (`BEM solver (Ning 2014 + Brent) + Prandtl + Glauert`, now unblocked by `T-301`).
  **Cautions:** When $C_{d,s} > C_{d,\max}\sin^2\alpha_s$, the raw Viterna cosine coefficient $B_2 > 0$ can slightly overshoot $C_{d,\max}$ near $|\alpha| = 89^\circ$; `ViternaSweep::eval` clamps post-stall drag to `[MIN_POST_STALL_CD, cd_max]` so $C_d(\alpha) \le C_{d,\max}$ holds everywhere.
- **H-geom1-023** | 2026-11-06 09:45 | geom-1 | T-302 | Recipient: lead, aero, web, qa
  **Progress:** T-302 is `done`. `blade_aero::{simulate, simulate_tsr_sweep, OperatingPoint, AeroResult, StationAero, TsrSweepPoint}` implements the §8 BEM contract with Ning (2014) + Brent root-finding, Prandtl tip/hub loss, and Glauert/Buhl high-induction correction. Verified by 6 unit tests + 1 `proptest` suite in `crates/blade-aero/tests/bem_solver.rs` (including QBlade reference case tolerance logged in `F-geom1-029`). Workspace total is **132 Rust tests + 6 Node tests**, all green.
  **Next:** **T-303** (`Generator matching: Kv, internal resistance, load curve`) and **T-304** (`UI: Cp–TSR charts, A/B comparison, test data logging`), both now unblocked by `T-302`!
  **Cautions:** Boundary stations sitting on $r = r_{\text{hub}}$ or $r = R$ evaluate Prandtl induction with a 1.5% span inset ($r_{\text{eff}}$) and taper their elemental loads by $F(\phi)$ so trapezoidal integration across the blade span remains well-conditioned.
- **H-geom1-024** | 2026-11-06 09:53 | geom-1 | T-303 | Recipient: lead, aero, web, qa
  **Progress:** T-303 is `done`. `crates/blade-aero/src/generator.rs` implements `GeneratorSpec`, `GeneratorState`, `GeneratorMatchResult`, `eval_generator_at_rpm`, `match_generator`, and `sweep_generator_load`, verified by 3 unit tests + 2 `proptest` suites in `crates/blade-aero/tests/generator_matching.rs`. Workspace total is **137 Rust tests + 6 Node tests**, all green.
  **Next:** **T-304** (`UI: Cp–TSR charts, A/B comparison, test data logging`), the final task in **Phase 3 — Simulation & Testing**!
  **Cautions:** When scanning TSR for rotor–generator torque equilibrium, `match_generator` selects the highest-TSR sign-change bracket so the solver converges to the stable high-speed operating branch rather than the unstable low-speed stall branch.
- **H-geom1-025** | 2026-11-06 10:04 | geom-1 | T-304 | Recipient: lead, web, aero, qa
  **Progress:** T-304 is `done`, completing **100% of Phase 3 — Simulation & Testing** (`T-301` through `T-304` all `done`, alongside Phase 0, Phase 1, and Phase 2). `crates/blade-wasm` now exposes `simulate_aero`, and `web/` renders the live SVG $C_p$–TSR chart (`#cp-tsr-svg`), A/B Baseline comparison, generator matching controls, and experimental test data logger with RMSE/MAE residual computation. Verified by **138 Rust tests + 7 Node tests**, `tsc --noEmit`, `vite build`, and `wasm32-unknown-unknown` builds, all green.
  **Next:** All roadmap tasks through Phase 3 (`T-001`..`T-304`) are complete! Ready for the lead to populate **Phase 4** (optimizers, NeuralFoil, OCCT, team accounts) per `plan.md` §7.
  **Cautions:** `web/pkg` and `target/glue-node` are gitignored; after modifying `crates/blade-wasm`, run `cd web; npm.cmd run wasm` and regenerate `target/glue-node` before running `npm.cmd test`.
- **H-geom1-026** | 2026-11-06 14:40 | geom-1 | T-404 | Recipient: lead, aero, cad, server, web, qa
  **Progress:** **Phase 4 (`T-401`..`T-404`) is 100% `done`**, completing all four phases of the BladeLab master roadmap (`Phase 0`, `Phase 1`, `Phase 2`, `Phase 3`, and `Phase 4`). Verified by **153 Rust tests** (`blade-model`, `blade-geom`, `blade-mesh`, `blade-cad`, `blade-aero`, `blade-cli`, `blade-server`, `blade-wasm`) + **9 Node tests** (`web/scripts/types.test.mjs`), `cargo clippy --workspace --all-targets -- -D warnings`, `cargo fmt --all -- --check`, `tsc --noEmit`, and `vite build`.
  **Next:** All roadmap tasks `T-001` through `T-404` are complete!
  **Cautions:** None.

### 9.8 Session Log (Append-only, latest entries at bottom)

```
[INIT] 2026-11-05T17:17+07:00 agent=lead-1 mem=v1 note="Initialized plan.md and seeded shared memory"
[ACK] 2026-11-05T17:33:10+07:00 agent=geom-1 mem=v1 last_entry=F-lead1-005 task=T-003
[ACK-NOTE] geom-1: D-lead1-002 (B-spline loft from loft() is the single geometry source), D-lead1-003 (finite TE thickness; 4 open side panels + TE/root/tip caps) and F-lead1-001 (mm/deg, f64, must compile to wasm32) confirmed.
[ACK-NOTE] geom-1: blockers found — no .git in workspace (boot step 1 and every push impossible); T-003 depends on T-002 which is still todo, so ResolvedBlade does not exist yet. See L-geom1-001, Q-geom1-001.
[END] 2026-11-05T17:38+07:00 agent=geom-1 mem=v2 note="T-003 core done in crates/blade-geom (NACA4 + cosine resample + TE check); 19 tests, fmt/clippy/wasm32 clean; T-003 -> review; blocked on T-001 workspace + T-002 ResolvedBlade; no git repo so nothing pushed"
[RE-ACK] 2026-11-05T17:40+07:00 agent=geom-1 mem=v3 last_entry=D-geom1-002 note="lead approved D-geom1-001 and Q-geom1-001 in-session; standalone blade-geom proceeds, T-004 loft core next"
[NOTE] 2026-11-05T17:40+07:00 agent=geom-1 note="initialised local git repo (no remote configured yet) so claims/commits/trailers can follow §0.1/§0.3"
[END] 2026-11-05T17:45+07:00 agent=geom-1 mem=v4 note="T-004 loft core done (Section3D/Point3/BladeSurface/loft, pass-through <= 1e-6 mm, 30 tests, fmt/clippy/wasm32 clean); build_sections still needs blade-model ResolvedBlade (T-002)"
[RE-ACK] 2026-11-05T17:48+07:00 agent=geom-1 mem=v5 last_entry=D-geom1-003 note="lead approved geom-1 takeover of T-001 (workspace) + T-002 (blade-model schema v1); implementing build_sections to finish T-004"
[END] 2026-11-05T17:54+07:00 agent=geom-1 mem=v6 note="T-002 + T-004 done: workspace root, blade-model schema/validate/resolve, build_sections adapter; fixture pipeline Design->resolve->sections->loft passes <=1e-6 mm; 59 tests + fmt + clippy -D warnings + wasm32 builds clean; T-001 still in-progress (CI needs a git remote)"
[RE-ACK] 2026-11-05T18:03+07:00 agent=geom-1 mem=v7 last_entry=H-geom1-003 note="lead approved T-005 takeover (D-geom1-004); implementing tessellate/write_stl/check_mesh in crates/blade-mesh"
[END] 2026-11-05T18:07+07:00 agent=geom-1 mem=v8 note="T-005 in review: crates/blade-mesh tessellate/check_mesh/write_stl; fixture mesh watertight, 3538 tris, 126493.7 mm^3, 176984-byte STL; 72 workspace tests + fmt/clippy/wasm32 clean; independent Node STL parser agrees; slicer open is the remaining human check"
[NOTE] 2026-11-05T18:10+07:00 agent=geom-1 note="lead confirmed the fixture STL opens in a slicer; T-005 -> done"
[RE-ACK] 2026-11-05T18:10+07:00 agent=geom-1 mem=v9 last_entry=H-geom1-004 note="lead said 'stl works next' -> T-006 takeover approved (D-geom1-005); implementing blade-cad CadKernel + truck STEP export"
[END] 2026-11-05T18:24+07:00 agent=geom-1 mem=v10 note="T-006 done: crates/blade-cad CadKernel (blade 4-face solid, hub 12-face hollow cylinder, write_step); STEP exports target/naca4412.{blade,assembly}.step; FreeCAD 1.1.1 headless -> VALID, mm units, z 60..600 exact, volumes 126544.68 (blade) + 559831.81 (hub) mm^3, 0.04% above STL volume; 79 workspace tests + fmt/clippy/wasm32 clean; T-006 -> done"
[RE-ACK] 2026-11-05T18:30+07:00 agent=geom-1 mem=v10 last_entry=H-geom1-005 note="lead approved T-007 qa-role takeover (D-geom1-006) in-session; authoring .github/workflows/step-check.yml + tests/step_check.py, verifying both valid and corrupt STEP locally before claiming done"
[END] 2026-11-05T18:45+07:00 agent=geom-1 mem=v11 note="T-007 done: .github/workflows/step-check.yml (build + step-check jobs) and tests/step_check.py (FreeCAD OCCT headless validator); local proof runs: 2 positive PASS/exit0 (blade solids=1 z 60..600, assembly solids=2) and 4 negative FAIL/exit1 (corrupt, solids mismatch, z-bound, missing path); ran via FreeCAD bin/python.exe because FreeCADCmd argv conventions are hostile (L-geom1-010); CI activation still blocked by no git remote"
[RE-ACK] 2026-11-05T19:00+07:00 agent=geom-1 mem=v11 last_entry=H-geom1-006 note="lead delegated next-task choice ('up to you') -> T-008 web takeover approved (D-geom1-007); building crates/blade-wasm (wasm-bindgen wrap of model->geom->mesh) + web/ Three.js viewer with live twist/chord sliders and a 50 ms update budget"
[END] 2026-11-05T19:15+07:00 agent=geom-1 mem=v12 note="T-008 done: crates/blade-wasm build_mesh(design_json, overrides_json) wraps resolve->sections->loft->tessellate; web/ Vite+Three.js viewer renders blade (0 console errors), live twist/chord edits rebuild in 0.5 ms browser / 0.43 avg 0.80 max ms in Node bench (budget 50 ms); baseline matches STL (1771/3538/126493.7 mm^3/span 60..600); 83 workspace tests + fmt/clippy clean; wasm 292 kB, vite build bundles it; npm run wasm regenerates glue (wasm-bindgen 0.2.130)"
[RE-ACK] 2026-11-05T19:20+07:00 agent=geom-1 mem=v12 last_entry=H-geom1-007 note="lead: 'next' -> T-009 server-role takeover approved (D-geom1-008); building deploy/ Docker image with a Manifold boolean engine and unioning fixture blade+hub STLs; Docker Desktop engine not running yet, starting it for local verification"
[END] 2026-11-05T19:55+07:00 agent=geom-1 mem=v13 note="T-009 done: deploy/manifold Docker image (trixie, 117MB) with manifold3d 0.4.1 union runner; docker build --no-cache clean; union of fixture blade+hub STL = single watertight solid (genus 0, NoError), self-check PASS (8000/7000/10000 mm^3 exact), blade 126493.727 + hub 558932.941 = union 685426.668 mm^3; independent Node validator: 4050 tris, 0 boundary/non-manifold edges; Docker Desktop started to run it; gotchas: maniclot-csg-sys git-clones C++ at build time, runtime base must match rust:1-slim glibc (trixie)"
[RE-ACK] 2026-11-05T20:10+07:00 agent=geom-1 mem=v13 last_entry=H-geom1-008 note="lead: 'next' -> T-010 kernel-decision takeover approved (all deps T-005..T-009 done); recording the final truck-vs-occt Decision in §9.3 from in-session evidence (truck=STEP, Manifold=server booleans, occt=optional feature)"
[END] 2026-11-05T20:12+07:00 agent=geom-1 mem=v14 note="T-010 done: kernel decision recorded as D-geom1-009 in §9.3 -> truck = B-rep/STEP (truck-modeling 0.6), Manifold manifold3d 0.4.1 = server booleans/3MF, OCCT = optional feature only; no §8 CadKernel change needed; closes Phase 0 (all T-001..T-010 final: T-001 in-progress only for CI/remote); Phase 1 T-101/T-102 unblocked"
[RE-ACK] 2026-11-05T20:20+07:00 agent=geom-1 mem=v14 last_entry=H-geom1-009 note="lead: 'continues' -> T-102 cad takeover approved (D-geom1-010 + P-geom1-001 Accepted); adding optional Hub.shaft_flat_radial_mm and hub_solid D-flat via tsweep of a holed annular face (no booleans); round-bore revolve path unchanged"
[END] 2026-11-05T20:40+07:00 agent=geom-1 mem=v15 note="T-102 done: Hub.shaft_flat_radial_mm (optional) + D-flat hub via 2D extrusion (tsweep of holed annular face, no booleans); R=60 r=6 d=4.8 L=50 -> FreeCAD valid solid, volume 560126.1 mm^3 exactly matches closed form; round-bore revolve path untouched; 86 workspace tests + fmt/clippy/wasm32 clean; P-geom1-001 Accepted, F-geom1-016/L-geom1-013/H-geom1-010 recorded"
[ACK] 2026-11-05T23:20:00+07:00 agent=geom-1 mem=v15 last_entry=H-geom1-010 task=T-101
[ACK-NOTE] geom-1: F-lead1-001 (mm/deg, f64, wasm32-clean, no panics/NaN), D-lead1-002 (B-spline loft single geometry source), F-geom1-007/008 (schema v1 + resolve over uniform stations + Layer-3 overrides) and D-geom1-009/010 confirmed. Claiming T-101 (Schmitz Layer-1 chord/twist generation) with P-geom1-002 / D-geom1-011 Accepted.
[END] 2026-11-05T23:29+07:00 agent=geom-1 mem=v17 note="T-101 done: blade_geom::schmitz module + blade_model::CurveSource::Schmitz + fixtures/naca4412-schmitz.json; matches 11-station hand-calculated reference values to <1e-12 and lofts within 1e-6 mm; 97 workspace tests + fmt/clippy/wasm32 clean; F-geom1-017, L-geom1-014, H-geom1-011 recorded"
[RE-ACK] 2026-11-05T23:31:00+07:00 agent=geom-1 mem=v17 last_entry=H-geom1-011 task=T-104 note="lead: 'do next task' -> claiming T-104 (blade-cli export for stl, 3mf, step) under D-geom1-012"
[END] 2026-11-05T23:36+07:00 agent=geom-1 mem=v19 note="T-104 done: blade_mesh::write_3mf (pure-Rust OPC ZIP + 3MF Core XML in mm, wasm32-clean) + crates/blade-cli (`bladelab export design.json --format stl|3mf|step`); FreeCAD STEP check PASS + Python zipfile/XML 3MF check PASS; 103 workspace tests + fmt/clippy/wasm32 clean; F-geom1-018, H-geom1-012 recorded"
[RE-ACK] 2026-11-05T23:39:00+07:00 agent=geom-1 mem=v19 last_entry=H-geom1-012 task=T-103 note="lead: 'Next' -> claiming T-103 (crates/blade-server Axum POST /api/v1/export with blake3 caching and panic containment) under D-geom1-013"
[END] 2026-11-05T23:43+07:00 agent=geom-1 mem=v21 note="T-103 done: crates/blade-server Axum POST /api/v1/export (stl, 3mf, step) with canonical blake3 caching (ETag + HIT/MISS + 304) and panic containment (CatchPanicLayer + spawn_blocking catch_unwind); 106 workspace tests + fmt/clippy/wasm32 clean; F-geom1-019, H-geom1-013 recorded"
[RE-ACK] 2026-11-06T00:13:00+07:00 agent=geom-1 mem=v21 last_entry=H-geom1-013 task=T-106 note="lead: 'do nex' -> claiming T-106 (ts-rs automated TS type generation from blade-model + CI drift check) under D-geom1-014"
[END] 2026-11-06T00:20+07:00 agent=geom-1 mem=v23 note="T-106 done: ts-rs 10.1.0 bindings on blade-model + web/src/types/blade-model.ts + ts_bindings drift test + CI step + web lint/typecheck/test scripts; 107 Rust tests + 1 Node test + fmt/clippy/wasm32/vite build clean; F-geom1-020, L-geom1-015, H-geom1-014 recorded"
[RE-ACK] 2026-11-06T00:35:00+07:00 agent=geom-1 mem=v23 last_entry=H-geom1-014 task=T-107 note="lead: 'do next' -> claiming T-107 (5 fixtures + volume/bounding-box golden snapshots) under D-geom1-015"
[END] 2026-11-06T00:40+07:00 agent=geom-1 mem=v25 note="T-107 done: 5 fixtures in fixtures/ + fixtures/golden_snapshots.json + crates/blade-mesh/tests/golden_snapshots.rs + blade-cad 5-fixture STEP test + CI step; 110 Rust tests + 1 Node test + fmt/clippy/wasm32 clean; F-geom1-021, H-geom1-015 recorded"
[RE-ACK] 2026-11-06T00:50:00+07:00 agent=geom-1 mem=v25 last_entry=H-geom1-015 task=T-105 note="lead: 'do next' -> claiming T-105 (UI: Layer 1 controls + Layer 3 per-station table + undo/redo) under D-geom1-016"
[END] 2026-11-06T00:56+07:00 agent=geom-1 mem=v27 note="T-105 done (closes Phase 1 MVP): web/src/state.ts + web/index.html + web/src/main.ts (Layer 1 rotor/distribution controls, Layer 3 per-station override table, DesignHistory undo/redo, live <1 ms wasm 3D updates); 110 Rust tests + 4 Node tests + tsc + vite build + bench clean; F-geom1-022, H-geom1-016 recorded"
[RE-ACK] 2026-11-06T00:58:00+07:00 agent=geom-1 mem=v27 last_entry=H-geom1-016 task=T-201 note="lead: 'do all phase2' -> claiming T-201 (Layer 2 Bezier curves and evalexpr formulas with x = r/R) under D-geom1-017 / P-geom1-003"
[END] 2026-11-06T01:04+07:00 agent=geom-1 mem=v29 note="T-201 done: CurveSource::Bezier + CurveSource::Formula (evalexpr 11.3.1, x = r/R) + ts-rs bindings + validation/resolve tests; 112 Rust tests + 4 Node tests + fmt/clippy/wasm32 clean; F-geom1-023, H-geom1-017 recorded"
[RE-ACK] 2026-11-06T01:05:00+07:00 agent=geom-1 mem=v29 last_entry=H-geom1-017 task=T-202 note="lead: 'do all phase2' -> claiming T-202 (Airfoil library SG6043/SD7062/E387 + .dat import + blending) under D-geom1-018 / P-geom1-004"
[END] 2026-11-06T01:14+07:00 agent=geom-1 mem=v31 note="T-202 done: data/airfoils/{SG6043,SD7062,E387}.dat + DatAirfoil + library_airfoil + blend_airfoils + build_blended_sections + AirfoilSpec::Named support in resolve/build_sections; 117 Rust tests + 4 Node tests + fmt/clippy/wasm32 clean; F-geom1-024, H-geom1-018 recorded"
[RE-ACK] 2026-11-06T01:16:00+07:00 agent=geom-1 mem=v31 last_entry=H-geom1-018 task=T-203 note="lead: 'do all phase2' -> claiming T-203 (Unified blade+hub assembly via Manifold booleans + 3MF) under D-geom1-019"
[END] 2026-11-06T01:23+07:00 agent=geom-1 mem=v33 note="T-203 done: blade_cad::{hub_mesh, assembly_mesh} + deploy/manifold 3MF/overlap union + blade-cli/blade-server assembly 3MF/STL export; single connected watertight manifold solid across all 5 fixtures; 118 Rust tests + 4 Node tests + fmt/clippy/wasm32 clean; F-geom1-025, H-geom1-019 recorded"
[RE-ACK] 2026-11-06T01:24:00+07:00 agent=geom-1 mem=v33 last_entry=H-geom1-019 task=T-204 note="lead: 'do all phase2' -> claiming T-204 (PostgreSQL persistence: designs, versioning) under D-geom1-020"
[END] 2026-11-06T01:27+07:00 agent=geom-1 mem=v35 note="T-204 done: crates/blade-server/migrations/0001_designs.sql + DesignStore + /api/v1/designs CRUD and version history endpoints; 120 Rust tests + 4 Node tests + fmt/clippy clean; F-geom1-026, H-geom1-020 recorded"
[RE-ACK] 2026-11-06T01:28:00+07:00 agent=geom-1 mem=v35 last_entry=H-geom1-020 task=T-205 note="lead: 'do all phase2' -> claiming T-205 (UI: Curve editor, value scrubbing, locking & binding) under D-geom1-021"
[END] 2026-11-06T09:20+07:00 agent=geom-1 mem=v37 note="T-205 done (closes Phase 2): web/src/state.ts + web/index.html + web/src/main.ts (interactive Bezier SVG curve editor, Formula editor, Shift/Alt value scrubbing, station locking, root-tip taper binding); 120 Rust tests + 6 Node tests + tsc + vite build clean; F-geom1-027, H-geom1-021 recorded"
[RE-ACK] 2026-11-06T09:23:00+07:00 agent=geom-1 mem=v37 last_entry=H-geom1-021 task=T-301 note="lead: 'next' -> claiming T-301 (Precomputed polars + Viterna extrapolation across alpha -180..+180 deg) under D-geom1-022"
[END] 2026-11-06T09:29+07:00 agent=geom-1 mem=v39 note="T-301 done: crates/blade-aero + data/polars/*.json (7 builtin low-Re airfoil polar tables, bilinear Re/alpha lookup, Viterna-Corrigan 360-deg extrapolation across -180..+180 deg); 125 Rust tests + 6 Node tests + fmt/clippy/wasm32 clean; F-geom1-028, H-geom1-022 recorded"
[RE-ACK] 2026-11-06T09:37:00+07:00 agent=geom-1 mem=v39 last_entry=H-geom1-022 task=T-302 note="lead: 'lets do' -> claiming T-302 (BEM solver: Ning 2014 + Brent + Prandtl + Glauert) under D-geom1-023"
[END] 2026-11-06T09:45+07:00 agent=geom-1 mem=v41 note="T-302 done: crates/blade-aero/src/bem.rs (simulate + simulate_tsr_sweep with Ning 2014 + Brent + Prandtl + Glauert/Buhl); matches QBlade reference within |dCp|<0.025 and |dCt|<0.040 (F-geom1-029); 132 Rust tests + 6 Node tests + fmt/clippy/wasm32 clean; H-geom1-023 recorded"
[RE-ACK] 2026-11-06T09:50:00+07:00 agent=geom-1 mem=v41 last_entry=H-geom1-023 task=T-303 note="lead: 'lets do next' -> claiming T-303 (Generator matching: Kv, internal resistance, load curve) under D-geom1-024"
[END] 2026-11-06T09:53+07:00 agent=geom-1 mem=v43 note="T-303 done: crates/blade-aero/src/generator.rs (GeneratorSpec, eval_generator_at_rpm, match_generator, sweep_generator_load); accurately predicts equilibrium RPM, voltage, current, and electrical power across load curves; 137 Rust tests + 6 Node tests + fmt/clippy/wasm32 clean; F-geom1-030, H-geom1-024 recorded"
[RE-ACK] 2026-11-06T09:54:00+07:00 agent=geom-1 mem=v43 last_entry=H-geom1-024 task=T-304 note="lead: 'lets do next' -> claiming T-304 (UI: Cp-TSR charts, A/B comparison, test data logging) under D-geom1-025"
[END] 2026-11-06T10:04+07:00 agent=geom-1 mem=v45 note="T-304 done (closes Phase 3): blade-wasm simulate_aero + web/ Cp-TSR SVG chart, A/B comparison, generator controls, and experimental test data logger with RMSE/MAE fit; 138 Rust tests + 7 Node tests + tsc + vite build clean; F-geom1-031, H-geom1-025 recorded"
[RE-ACK] 2026-11-06T11:18:00+07:00 agent=geom-1 mem=v45 last_entry=H-geom1-025 task=T-205 note="lead requested adding UI controls for Move Chord (pitch_axis_ratio + 3D chord X-offset + global chord scale), direct Blade Length (L = R - r0), and Airfoil Profile/Thickness/Camber"
[END] 2026-11-06T11:22+07:00 agent=geom-1 mem=v47 note="added UI controls for Blade Length L=R-r0, Move Chord (Pitch Axis x/c + 3D X/Y offset sliders + 3D pitch-axis line), All-Chords width shift/scale (-5/+5 mm, x0.9/x1.1), and Airfoil Family/Thickness/Camber; 8 Node tests + tsc + vite build clean; F-geom1-032 recorded"
[RE-ACK] 2026-11-06T11:33:00+07:00 agent=geom-1 mem=v47 last_entry=F-geom1-032 task=T-008 note="lead requested adding global light illumination to the 3D viewport"
[END] 2026-11-06T11:35+07:00 agent=geom-1 mem=v49 note="added global light illumination (PMREM RoomEnvironment IBL + Ambient + Hemisphere + 3-point Key/Fill/Rim studio light rig + ACESFilmicToneMapping + live #global-light-intensity slider) in web/src/main.ts and web/index.html; 8 Node tests + tsc + vite build clean"
[RE-ACK] 2026-11-06T11:49:00+07:00 agent=geom-1 mem=v49 last_entry=F-geom1-032 task=T-105 note="lead requested applying UI skills (frontend-design / ui-taste), making the UI more visual, and adding CAD/mesh export buttons (STL, 3MF, STEP, JSON) to the web workbench"
[END] 2026-11-06T11:58+07:00 agent=geom-1 mem=v51 note="upgraded web workbench via frontend-design + ui-taste skills: top-right Viewport & Export Dock (Export STL/3MF via blade-wasm, Export STEP/Assembly via blade-server proxy, Save JSON, Single Blade vs Full Rotor B-blade + hub 3D assembly preview, Spin Rotor, Wireframe, Iso/Plan/Tip camera presets), live 2D Airfoil Cross-Section SVG preview, and split Left Geometry / Right Aero-Telemetry docks; 138 Rust tests + 9 Node tests + tsc + vite build clean; F-geom1-033 recorded"
[RE-ACK] 2026-11-06T12:08:00+07:00 agent=geom-1 mem=v51 last_entry=F-geom1-033 task=T-005 note="lead requested adding a base hole for a carbon fiber spar tube (diameter, depth, offset) and a spanwise Split Model function (printable segments with exploded view and per-segment or combined STL/3MF export)"
[END] 2026-11-06T12:21+07:00 agent=geom-1 mem=v53 note="added crates/blade-mesh/src/fabrication.rs (SparHoleSpec, FabricationSpec, tessellate_fabricated) + blade-wasm export_fabricated_{stl,3mf}_bytes + web #layer-fabrication UI (CF tube hole diameter/depth/offset + presets + 3D rod preview + 2D bore circle + 1..4 part split model + exploded gap + Export All Split Parts .STL); 140 Rust tests + 9 Node tests + fmt/clippy/tsc/vite build clean; F-geom1-034 recorded"
[RE-ACK] 2026-11-06T12:38:00+07:00 agent=geom-1 mem=v53 last_entry=F-geom1-034 task=T-005 note="lead requested alignment dowel pins/keys on split faces with custom tolerances"
[END] 2026-11-06T12:50+07:00 agent=geom-1 mem=v55 note="added round pins / rectangular keys + sockets on split faces with clearance, extra depth, min wall and tube bore tolerance; generic cap-with-holes triangulator; alignment_report/fabrication_report placement warnings; 6 mesh fabrication tests + 9 Node tests, fmt/clippy/tsc clean; F-geom1-035 recorded"
[RE-ACK] 2026-11-06T14:22:00+07:00 agent=geom-1 mem=v55 last_entry=F-geom1-035 task=T-401 note="lead: 'go to phase 4' -> populated Phase 4 (T-401..T-404) and claimed T-401 (Automated chord & twist optimizer + Web UI) under D-geom1-026"
[END] 2026-11-06T14:40+07:00 agent=geom-1 mem=v57 note="Phase 4 (T-401..T-404) done: blade-aero optimize.rs + neuralfoil.rs, blade-cad occt.rs (apply_root_fillet + OcctKernel), blade-server /api/v1/teams + team-scoped designs, blade-wasm optimize_blade_wasm, and web Phase 4 Auto-Optimizer + Team Cloud Workspace UI; 153 Rust tests + 9 Node tests + fmt/clippy/tsc/vite build clean; F-geom1-036, H-geom1-026 recorded"
[RE-ACK] 2026-11-06T14:47:00+07:00 agent=geom-1 mem=v57 last_entry=H-geom1-026 task=T-005 note="lead reported: switching to other airfoil profiles (SG6043/SD7062/E387) triggers 'could not triangulate the cap polygon of section 0'; fixing cap-with-holes triangulation and .dat trailing-edge contour"
[END] 2026-11-06T14:53+07:00 agent=geom-1 mem=v59 note="fixed section 0 cap triangulation on SG6043/SD7062/E387 in crates/blade-mesh/src/tessellate.rs (collinear .dat facet pass + keyhole-bridge ear validation); verified plain, spar-hole, round-pin, and rectangular-key meshes across all 3 library airfoils; rebuilt wasm; L-geom1-016 recorded"
[RE-ACK] 2026-11-06T15:36:00+07:00 agent=geom-1 mem=v59 last_entry=L-geom1-016 task=T-005 note="lead requested: Interlocking Joint for split blade fabrication; adding interlocking joint geometries (Dovetail/Butterfly, Cruciform Cross-Lock, and Tapered Self-Centering Lock) to blade-mesh, blade-wasm, and web UI"
[END] 2026-11-06T15:45+07:00 agent=geom-1 mem=v61 note="added Interlocking Joints (Dovetail Butterfly, Cruciform + Cross-Beam, 3D Snap-Lock Barb, and 3D Tapered Wedge) in crates/blade-mesh/src/fabrication.rs, crates/blade-wasm/src/mesh.rs, and web UI (#align-shape, 1-click Joint Presets, and 2D SVG preview); verified watertight manifold meshes across all 4 interlocking types; F-geom1-037 recorded"
[RE-ACK] 2026-11-06T16:42:30+07:00 agent=geom-1 mem=v61 last_entry=F-geom1-037 task=T-005 note="lead reported 3D model preview not level / not clean; aligned via /grill-me on: (1) straight coaxial CF spar tube bore & rod along span, (2) 32-deg crease-angle normals for crisp flat caps/split faces/pins + smooth airfoil skin, (3) centered hub/blade mid-plane & straight Z pitch-axis alignment, and (4) smooth cubic Catmull-Rom .dat resampling + denser spanwise loft tessellation"
[END] 2026-11-06T16:52+07:00 agent=geom-1 mem=v63 note="fixed 3D model preview leveling & cleanliness: coaxial straight SparTubeAxis + MIN_SEGMENT_STATIONS=14 in crates/blade-mesh/src/fabrication.rs, MeshData::tube_axis in blade-wasm, and 32-deg crease-angle normals + CAD feature edges + coaxial 3D rod + centered hub/pitch-axis in web/src/main.ts; F-geom1-038 recorded"
[RE-ACK] 2026-11-06T17:41:30+07:00 agent=geom-1 mem=v63 last_entry=F-geom1-038 task=T-105 note="lead requested making the web UI appealing and responsive; applying frontend-design and ui-taste skills across web/index.html and web/src/main.ts"
[END] 2026-11-06T17:47+07:00 agent=geom-1 mem=v65 note="upgraded web/index.html and web/src/main.ts for appealing CAD/telemetry styling and full responsiveness: glassmorphic docks, color-coded KPI cards, custom range sliders, desktop dock toggles (#btn-toggle-left, #btn-toggle-right, #btn-zen-3d + [ / ] shortcuts), quick-jump section nav pills with scroll-spy, collapsible section headers, and <=1180px / <=720px mobile/tablet workspace switcher (#mobile-workspace-nav); 9 Node tests + tsc + vite build clean; F-geom1-039 recorded"
[RE-ACK] 2026-11-06T18:21:30+07:00 agent=geom-1 mem=v65 last_entry=F-geom1-039 task=T-105 note="lead requested: web check, fix any UI/layout/interaction problems found, and apply strict /ui-taste audit & anti-slop craft (reference/audit.md + reference/anti-slop-craft.md)"
[END] 2026-11-06T18:28+07:00 agent=geom-1 mem=v67 note="completed /ui-taste 5-dimension web audit & fixes in web/index.html and web/src/main.ts: ResizeObserver --top-dock-h prevents toolbar wrap overlap, inert/aria-hidden prevents hidden dock tab traps, semantic button[data-collapse-section] + focus-visible, pointercancel/lostpointercapture + touch-action:none on scrubbers, removed WebGL-taxing backdrop-filter blur, and passed all 9 Anti-Slop pre-flight checks (1 accent, 1 grey family, 4-step radius lock, inline SVG icons, unified labels); F-geom1-040 recorded"
[RE-ACK] 2026-11-06T21:41:50+07:00 agent=geom-1 mem=v67 last_entry=F-geom1-040 task=T-105 note="lead invoked /unslop; executing unslop audit (references/signs.md + references/tokens.md) and presenting 5-line Direction for confirmation"
[END] 2026-11-06T21:49+07:00 agent=geom-1 mem=v69 note="completed 9-pass /unslop across web/index.html, web/src/main.ts, and web/src/state.ts: 4px grid rhythm, Dark Ink neutral ramp (#07080d/#0b0d14/#11141c/#1a1e28) with 8% hairlines and off-white primary CTAs, 16px stroke-1.5 icons, sentence-case zero-tracking type (weights 400/500), flattened hairline sub-rows, quiet mono meta, <kbd> keycaps, nested radii (16->12->8->4), and cubic-bezier(0.22,1,0.36,1) motion; 9 Node tests + tsc + vite build clean; F-geom1-041 recorded"
[RE-ACK] 2026-11-06T21:55:30+07:00 agent=geom-1 mem=v69 last_entry=F-geom1-041 task=T-105 note="lead invoked /frontend-design; executing two-pass studio design plan, self-critique against AI tells, and implementation"
[END] 2026-11-06T22:07+07:00 agent=geom-1 mem=v71 note="completed two-pass /frontend-design studio upgrade in web/index.html, web/src/main.ts, and web/src/state.ts: IBM Plex Sans + IBM Plex Mono typography, asymmetric .telemetry-deck with live Betz efficiency meter, 3D Viewport Title-Block Datum HUD (#viewport-datum-hud), L1/L2/FAB/L3 CAD layer tags, zero middle-dot strings, and staggered dock-enter animation; 9 Node tests + tsc + vite build clean; F-geom1-042 recorded"
[RE-ACK] 2026-11-06T22:11:30+07:00 agent=geom-1 mem=v71 last_entry=F-geom1-042 task=T-105 note="lead invoked /ui-taste; executing Uizze polish/operate/audit/craft pass to fix P0 dock-enter animation-fill-mode:both cascade bug blocking dock collapse, P1 WCAG AA --text-muted contrast + ARIA tablist roles, and craft browser details"
[END] 2026-11-06T22:16+07:00 agent=geom-1 mem=v73 note="completed /ui-taste polish/operate/audit/craft pass in web/index.html and web/src/main.ts: fixed P0 dock-enter animation-fill-mode:both cascade bug blocking dock collapse, lifted --text-muted to #8b93a7 for >=5.36:1 WCAG AA contrast, added WAI-ARIA role=tab/aria-selected/aria-pressed/aria-current state sync, centered #viewport-datum-hud inside open 3D canvas column, and themed selection/caret/underline; 9 Node tests + tsc + vite build clean; F-geom1-043 recorded"
```
[RE-ACK] 2026-11-06T22:24:00+07:00 agent=geom-1 mem=v73 last_entry=F-geom1-043 task=T-105 note="lead requested Planform & Span Transitions panel (Linear Taper / Smooth Cosine, mid-span center, plateau width, Root/Mid/Tip zone bar); implementing frontend-only by emitting a chord formula expr (no blade-model change)"
[END] 2026-11-06T22:30+07:00 agent=geom-1 mem=v74 note="added Planform & span transitions panel (Linear taper / Smooth cosine, center + plateau sliders, Root/Mid/Tip zone bar) via chord formula; 10 Node tests + tsc + vite build clean; F-geom1-044 recorded"
[RE-ACK] 2026-11-06T22:31:00+07:00 agent=geom-1 mem=v74 last_entry=F-geom1-044 task=T-105 note="lead reported chord width not matching value; root-caused to pinned tip station override"
[END] 2026-11-06T22:37+07:00 agent=geom-1 mem=v75 note="fixed chord width mismatch: removed pinned tip override from web default design, added override warning with Clear in planform panel; tsc + 10 tests + build clean; F-geom1-045 recorded"
[RE-ACK] 2026-11-06T22:37:00+07:00 agent=geom-1 mem=v75 last_entry=F-geom1-045 task=T-105 note="lead requested Root/Mid/Tip per-section editor (airfoil, chord, twist, thickness)"
[END] 2026-11-06T22:46+07:00 agent=geom-1 mem=v76 note="added Blade sections panel with per-section airfoil/chord/twist/thickness and to-scale section stack; 11 tests + tsc + build clean; F-geom1-046 recorded"
[RE-ACK] 2026-11-06T22:43:35+07:00 agent=geom-1 mem=v76 last_entry=F-geom1-046 task=T-105 note="lead requested adding NREL S833 root airfoil to kernel library and web UI"
[END] 2026-11-06T22:50+07:00 agent=geom-1 mem=v77 note="added NREL S833 (18% thick root airfoil) to data/airfoils/S833.dat, blade-geom, blade-model, blade-aero polar fallback, rebuilt wasm, and wired into web UI; all Rust & Node tests + vite build pass; F-geom1-047 recorded"
[RE-ACK] 2026-11-07T13:23:00+07:00 agent=geom-1 mem=v77 last_entry=F-geom1-047 task=T-105 note="lead requested airfoil-contour offset interlocking lip/socket joint around the blade shape; implementing AlignmentShape::AirfoilLip in blade-mesh, blade-wasm, and web UI"
[END] 2026-11-07T13:33+07:00 agent=geom-1 mem=v78 note="implemented AlignmentShape::AirfoilLip full-contour offset stepped lip and socket in blade-mesh, blade-wasm, and web UI; all Rust & Node tests + vite build pass; F-geom1-048 recorded"
[RE-ACK] 2026-11-07T14:18:00+07:00 agent=geom-1 mem=v78 last_entry=F-geom1-048 task=T-105 note="lead requested auto-save and load function via /grill-me; aligned on full Workbench Snapshot auto-save/restore in localStorage + Load/Export JSON (supporting both WorkbenchSnapshot and plain Design JSON) + Named local save slots UI + factory Reset"
[END] 2026-11-07T14:28:30+07:00 agent=geom-1 mem=v79 note="added full WorkbenchSnapshot auto-save/restore in localStorage, Load/Export JSON (supporting both WorkbenchSnapshot and plain Design JSON), named local save slots drawer (#projects-drawer), and factory Reset in web/src/state.ts, web/index.html, and web/src/main.ts; 12/12 Node tests + tsc + vite build pass; F-geom1-049 recorded"
[RE-ACK] 2026-11-07T14:44:15+07:00 agent=geom-1 mem=v79 last_entry=F-geom1-049 task=T-105 note="lead selected 4 features to add next: (1) Structural & Root-Bending Mechanics + CF Spar/Material Safety Factor, (2) 3D Aerodynamic & Wall-Thickness Color Heatmaps on the Blade, (4) Multi-Wind-Speed Power Curve + Starting Torque/Cut-In + Weibull AEP, and (5) Printer Build-Volume Fit Checker & Per-Segment Split Ratios"
[END] 2026-11-07T14:58:30+07:00 agent=geom-1 mem=v80 note="implemented (1) Structural & CF Spar Mechanics, (2) 3D Vertex Color Heatmaps (alpha, cl_cd, torque, wall_stress), (4) Multi-Wind-Speed Power Curve (2-18 m/s) + Cut-In + Weibull AEP, and (5) 3D Printer Build-Volume Fit Checker & 1-click Auto-Fit Split across web/src/state.ts, web/index.html, web/src/main.ts, and web/scripts/types.test.mjs; 13/13 Node tests + tsc + vite build pass; F-geom1-050 recorded"
[RE-ACK] 2026-11-07T16:21:00+07:00 agent=geom-1 mem=v80 last_entry=F-geom1-050 task=T-105 note="lead approved all 6 /ui-taste upgrades: (1) Right Aero Dock section-nav + 4 collapsible sections, (2) Left Dock section-nav Planform & Sections pills + scroll-spy, (3) fix var(--fg) token + responsive/accessible #viewport-heatmap-legend, (4) de-crowd #top-dock + clickable #autosave-badge + unified JSON labels, (5) Title Case headers + scrub-label on #layer2-sections, and (6) interactive hover crosshair & readout on #cp-tsr-svg and #wind-power-svg"
[END] 2026-11-07T16:31:30+07:00 agent=geom-1 mem=v81 note="completed all 6 /ui-taste polish upgrades across web/index.html, web/src/main.ts, web/src/state.ts, and web/scripts/types.test.mjs; 13/13 Node tests + tsc + vite build pass; F-geom1-051 recorded"
[RE-ACK] 2026-11-07T19:41:55+07:00 agent=geom-1 mem=v81 last_entry=F-geom1-051 task=T-105 note="lead requested: (1) Blade Presets for Low-Speed Wind vs High-Speed Wind (KidWind Challenge), (2) Generator Spec Presets & Gear Ratio controls, and (3) Drivetrain & Load Max-Out Optimizer (how to max out electrical power via optimal gear ratio, load resistance, and TSR matching)"
[END] 2026-11-07T20:03:00+07:00 agent=geom-1 mem=v82 last_entry=F-geom1-052 task=T-105 note="Added low-wind/KidWind/high-wind/reference blade presets, generator spec presets, gear ratio coupling in blade-wasm + UI, and Drivetrain & Load Max-Out Optimizer; 14/14 web tests + 29/29 aero/wasm tests + vite build clean"
[RE-ACK] 2026-11-07T20:56:45+07:00 agent=geom-1 mem=v82 last_entry=F-geom1-052 task=T-105 note="lead requested adding the Scimitar / Elliptical-Belly blade design (45 mm root -> 78 mm mid belly -> 22 mm tip) to the Wind & Competition Blade Presets"
[END] 2026-11-07T21:02:45+07:00 agent=geom-1 mem=v83 last_entry=F-geom1-053 task=T-105 note="Added scimitar_belly (45->76->22 mm + 5 mm CF spar) preset to BLADE_WIND_PRESETS and UI; 14/14 Node tests + tsc + vite build pass"
[RE-ACK] 2026-11-07T21:22:35+07:00 agent=geom-1 mem=v83 last_entry=F-geom1-053 task=T-105 note="lead requested Gearbox Prototype tab (/grill-me): 2-Stage Compound Step-Up Train (Gear 1 Mint 4-spoked Rotor Bull Gear + Orange Stepped Hub -> Gear 2 Purple+Lime Coaxial Compound Wheel/Pinion -> Gear 3 Slate Generator Pinion), True Involute Spur/Helical teeth with auto L/R hand + FDM backlash, Round/D-Flat shaft bores, 3D Viewport Gearbox Mode (Meshed & Side-by-Side + Spin animation), 2-way G:1 Aero Sync, and per-gear + full-plate binary STL export"
[END] 2026-11-07T21:34:30+07:00 agent=geom-1 mem=v84 last_entry=F-geom1-054 task=T-105 note="Implemented Gearbox Prototype tab (#layer-gearbox), 3D Viewport Gearbox mode (#btn-view-gearbox), true involute spur/helical 3-gear mesh builder (4-spoked Mint+Orange G1, Purple+Lime compound G2, Slate pinion G3), 2-way Aero G:1 sync, and per-gear + full-plate binary STL export; 15/15 Node tests + tsc + vite build pass"
[RE-ACK] 2026-11-07T21:40:30+07:00 agent=geom-1 mem=v84 last_entry=F-geom1-054 task=T-105 note="lead requested adding Web Cutouts to Gear 2 (Purple Compound Wheel) and adding more customization settings for Web Cutouts (spoke count 0..8, spoke width %, outer rim wall mm, inner hub ring margin mm)"
[END] 2026-11-07T21:48:30+07:00 agent=geom-1 mem=v85 last_entry=F-geom1-055 task=T-105 note="Added Web Cutouts to Gear 2 (g2_spokes 0..8 with automatic coaxial pinion collar clearance) and Web Cutout Settings (spoke_width_pct, rim_wall_mm, hub_ring_mm) across Gear 1 & Gear 2; 15/15 Node tests + tsc + vite build pass"
[ACK] 2026-11-08T11:21:00+07:00 agent=geom-1 mem=v85 last_entry=F-geom1-055 task=T-105
note="lead requested via /grill-me: move Gear section to a dedicated 'Gearbox' studio workspace tab hiding all blade panels (left CAD & right Aero docks), interactive 3D gear raycasting/click to open a left-side Gear Settings inspector panel beside the viewport focusing the clicked gear's parameters, with viewport toolbar adapting to gearbox mode"
[END] 2026-11-08T11:38:30+07:00 agent=geom-1 mem=v86 note="Moved Gear section to dedicated Gearbox Studio tab with complete blade settings hidden, added left-side Gear Settings Inspector drawer, and implemented interactive 3D gear click raycaster and selection; 16/16 Node tests + tsc + vite build + cargo test clean; F-geom1-056 recorded"
[ACK] 2026-11-08T12:20:00+07:00 agent=geom-1 mem=v86 last_entry=F-geom1-056 task=T-105
note="lead requested: flip the gear 3 helical angle; flipping Gear 3 helixHand in buildGearboxSubMeshes from -1 to 1 (Right Hand RH) so teeth properly mate with Gear 2 Wheel (-1 LH) in 3D and export, and adding an interactive Helical Hand selector (Right Hand RH vs Left Hand LH) in Gear 3 inspector card"
[END] 2026-11-08T12:25:30+07:00 agent=geom-1 mem=v87 note="Flipped Gear 3 helical angle (Right Hand RH +beta) and added Helical Hand selector in Gear 3 inspector card; 16/16 Node tests + tsc + vite build clean; F-geom1-057 recorded"
