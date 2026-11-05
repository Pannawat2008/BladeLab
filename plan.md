# BladeLab — Master Plan & Shared Memory

> This file is the single source of truth for the project.
> It acts as the master plan, agent rulebook, and shared memory system (§9).
>
> **MEMORY_VERSION: 10**
> **LAST_UPDATED: 2026-11-05 18:24 (UTC+7) by geom-1**

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
| T-007 | CI: Headless STEP verification using FreeCAD | qa | | todo | | T-006 | CI job fails if exported STEP file is not a valid solid |
| T-008 | blade-wasm + Three.js live blade rendering | web | | todo | | T-005 | Web view renders blade, updates within 50 ms upon twist change |
| T-009 | Build manifold-csg inside Docker container | server | | todo | | T-001 | `docker build` succeeds, successfully unions blade + hub |
| T-010 | Finalize kernel decision (truck vs occt) | lead | | todo | | T-005..T-009 | Recorded as a Decision in §9.3 |

### Phase 1 — MVP
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-101 | Layer 1: Initial chord/twist generation via Schmitz formulas | geom | | todo | | T-010 | Matches hand-calculated fixture values |
| T-102 | Hub (cylinder + shaft bore + D-flat) via 2D extrusion | cad | | todo | | T-010 | Generates STEP without requiring boolean operations |
| T-103 | Axum API: `POST /api/v1/export` (stl, 3mf, step) with blake3 caching | server | | todo | | T-005, T-006 | Integration tests pass; panics do not crash server |
| T-104 | blade-cli: `bladelab export design.json --format step` | server | | todo | | T-005, T-006 | Generates valid files for all formats |
| T-105 | UI: Layer 1 controls + Layer 3 per-station table | web | | todo | | T-008 | Live updates 3D model on parameter edit, supports undo/redo |
| T-106 | ts-rs: Automated generation of TS types from blade-model | web | | todo | | T-002 | CI checks that generated types match latest Rust structs |
| T-107 | Golden tests: 5 fixtures + volume/bounding box snapshots | qa | | todo | | T-005 | CI fails if geometry changes unexpectedly |

### Phase 2 — Advanced Tuning & Full STEP Support
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-201 | Layer 2: Bézier curves and formulas (evalexpr, variable x = r/R) | geom | | todo | | T-101 | Malformed formulas return friendly errors without panicking |
| T-202 | Airfoil library + .dat import + blending | geom | | todo | | T-003 | SG6043, SD7062, E387 pass all tests |
| T-203 | Unified blade+hub assembly via Manifold booleans + 3MF | cad | | todo | | T-102 | Yields a single watertight manifold part |
| T-204 | PostgreSQL persistence: designs, versioning | server | | todo | | T-103 | Full CRUD + version tracking functional |
| T-205 | UI: Curve editor, value scrubbing, locking & binding | web | | todo | | T-201 | Conforms to UI interaction specifications |

### Phase 3 — Simulation & Testing
| ID | Task | Role | Owner | Status | Since | Depends | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-301 | Precomputed polars + Viterna extrapolation | aero | | todo | | T-002 | Usable across full α ±180° range |
| T-302 | BEM solver (Ning 2014 + Brent) + Prandtl + Glauert | aero | | todo | | T-301 | Results closely match QBlade reference cases (tolerance logged as Fact) |
| T-303 | Generator matching (Kv, internal resistance, load curve) | aero | | todo | | T-302 | Accurately predicts voltage and output power |
| T-304 | UI: Cp–TSR charts, A/B comparison, test data logging | web | | todo | | T-302 | Successfully plots experimental data against simulation curves |

Lead will populate Phase 4 (optimizers, NeuralFoil, OCCT, team accounts) upon completion of Phase 3.

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

*(Add new entries above this line; do not delete existing ones.)*

### 9.6 Proposals (P)

*(None yet; format: Proposed Change / Rationale / Impacted Crates / Alternatives Considered)*

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
```
