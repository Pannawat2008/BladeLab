# BladeLab — Master Plan & Shared Memory

> This file is the single source of truth for the project.
> It acts as the master plan, agent rulebook, and shared memory system (§9).
>
> **MEMORY_VERSION: 23**
> **LAST_UPDATED: 2026-11-06 00:13 (UTC+7) by geom-1**

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
| T-105 | UI: Layer 1 controls + Layer 3 per-station table | web | | todo | | T-008 | Live updates 3D model on parameter edit, supports undo/redo |
| T-106 | ts-rs: Automated generation of TS types from blade-model | web | geom-1 | done | 2026-11-06 00:20 | T-002 | CI checks that generated types match latest Rust structs |
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
```
