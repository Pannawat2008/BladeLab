# BladeLab Approach A Stabilization & Bugfix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` with `superpowers:test-driven-development` and `superpowers:verification-before-completion`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the live CI failure and fix all Critical and High bugs (plus key Medium bugs) across CI, server/CLI/deploy, Rust core geometry/mesh/CAD/WASM/aero crates, and the web workbench while preserving all §8 interface contracts and 5-fixture golden mesh snapshots.

**Architecture:** Six self-contained, test-driven waves progressing from CI/backend safety → core model/geometry → mesh/CAD/WASM → aerodynamics → web state/security/gearbox/heatmap → web viewport/UI/export parity, followed by WASM rebuild, full workspace & web verification, and a fresh whole-branch code review.

**Tech Stack:** Rust workspace (`blade-model`, `blade-geom`, `blade-mesh`, `blade-cad`, `blade-wasm`, `blade-aero`, `blade-server`, `blade-cli`), `wasm-bindgen`, TypeScript + Vite + Three.js, Python + FreeCAD OCCT (`tests/step_check.py`).

**Spec:** Full audit report in conversation artifact `code_review_audit.md` and project rules in `plan.md` (§0, §6.1, §6.2, §8, §9).

## Global Constraints

- Internal units are **mm** and **degrees**; core crates (`blade-model`, `blade-geom`, `blade-mesh`, `blade-aero`) must remain I/O-free, zero C/C++, `f64`, and compile to `wasm32-unknown-unknown` (`plan.md §6.1`).
- Never panic or return `NaN`/`Inf` from public Rust functions (`plan.md §6.1`).
- Do NOT break §8 interface signatures (`Design`, `validate`, `resolve`, `build_sections`, `loft`, `tessellate`, `write_stl`, `check_mesh`, `CadKernel`, `simulate`) or invalidate `fixtures/golden_snapshots.json`.
- Every bugfix follows strict TDD: write failing test → verify RED → write minimal fix → verify GREEN → run full crate/project suite → commit with `Agent: geom-1`, `Task: audit`, `Memory-Ack: v<N>` trailers.
- Run `npm.cmd` (never bare `npm`) on Windows (`plan.md L-geom1-011`).

## Review Focus

1. Multi-solid STEP validation on a fresh FreeCAD install (`ReadShapeCompoundMode = False`) — covered by Task 1 (`Part.read(path)` verified locally against `naca4412.assembly.step`).
2. Untrusted `?gist=` / JSON payloads containing JS injection in `Formula.expr` or HTML/SVG tags in `AirfoilSpec::Named.name` — covered by Task 5 (`evalFormulaPreview` safe parser + `escapeHtml` tests).
3. Valid boundary inputs to Rust core (`hub_radius_mm == 0.0`, short `< 1 mm` blades, tiny `< 1e-3 mm` split segments, inverted optimizer bounds, `NaN` pivots) — covered by Tasks 2, 3, and 4.
4. Exported Gearbox STL topological consistency (0 inverted/inconsistent edges) and mating tooth phase on odd tooth counts (`g2_pinion_teeth = 15`) — covered by Task 5.
5. Three.js GPU disposal, single-frame Bézier drag preservation, and STEP fabrication/winglet export parity — covered by Task 6.

---

### Task 1: Fix Live CI (`tests/step_check.py`), Server Security/Cache (`blade-server`), CLI `--help`, and `deploy/manifold` 3MF

**Files:**
- Modify: `tests/step_check.py:52-151`
- Modify: `.github/workflows/step-check.yml:13-58`
- Modify: `crates/blade-server/src/lib.rs:66-128, 315-505`
- Modify: `crates/blade-server/src/store.rs:340-495`
- Modify: `crates/blade-server/tests/api_export.rs`, `crates/blade-server/tests/api_designs.rs`
- Modify: `crates/blade-cli/src/lib.rs:157-222`, `crates/blade-cli/src/main.rs:1-15`
- Modify: `deploy/manifold/src/main.rs:130-215`

**Interfaces:**
- Produces: Hardened `tests/step_check.py` using `Part.read(path)`; production-safe `blade-server` without `x-bladelab-debug-panic` header in production, bounded `ExportCache` (128 entries / 128 MiB max, `AtomicU64` hit/miss counters, `Bytes`), cache-verified `If-None-Match`, `author` propagation on `PUT`/`restore`, team ownership guard when `x-bladelab-team` is supplied; `blade-cli` `--help` returning exit code 0; valid OPC ZIP `.3mf` writer in `deploy/manifold`.

- [ ] **Step 1:** Reproduce CI bug & write failing tests for server debug-panic rejection, bounded cache eviction, cold `If-None-Match` not returning fake 304, `PUT` author attribution, team isolation on `GET/DELETE /designs/{id}`, and `blade-cli --help` exit status.
- [ ] **Step 2:** Verify RED across `blade-server` and `blade-cli` tests.
- [ ] **Step 3:** Implement fixes in `tests/step_check.py`, `.github/workflows/step-check.yml`, `blade-server`, `blade-cli`, and `deploy/manifold/src/main.rs`.
- [ ] **Step 4:** Verify GREEN (`cargo test -p blade-server -p blade-cli`, local FreeCAD `python.exe tests/step_check.py` on blade, assembly, and dflat hub).
- [ ] **Step 5:** Commit Task 1 with trailers.

---

### Task 2: Harden Core Model & Geometry (`crates/blade-model`, `crates/blade-geom`)

**Files:**
- Modify: `crates/blade-model/src/validate.rs`, `crates/blade-model/src/schema.rs`, `crates/blade-model/src/resolve.rs`, `crates/blade-model/src/curve.rs`
- Modify: `crates/blade-geom/src/surface.rs`, `crates/blade-geom/src/airfoil/naca4.rs`, `crates/blade-geom/src/airfoil/dat.rs`, `crates/blade-geom/src/sections.rs`
- Test: `crates/blade-model/tests/design.rs`, `crates/blade-model/tests/resolve.rs`, `crates/blade-geom/tests/loft_properties.rs`, `crates/blade-geom/src/airfoil/naca4.rs`, `crates/blade-geom/src/airfoil/dat.rs`

**Interfaces:**
- Produces: Additive `BladeSurface::section_at_span_mm(&self, span_mm: f64) -> Result<Vec<Point3>, GeomError>` consumed by Task 3 (`blade-mesh`, `blade-wasm`).

- [ ] **Step 1:** Write failing tests for: (a) `Formula` invalid/div-by-zero at an override station caught by `validate()` and `resolve()`; (b) `uniform_stations` tip `span_ratio == 1.0` exactly (`R=100, r_hub=19, count=6`); (c) `Schmitz` extreme overflow/twist > 90° rejected; (d) narrow-span / root-boundary override not producing 1-station collapse, negative `span_mm`, or `MissingAirfoil`; (e) `eval_bezier` with `NaN`; (f) `loft()` rejecting `NaN` pivots and non-finite control points / pass-through tolerance violations; (g) `Naca4::camber_line` with `p = 1e-160` and `p = 1 - 1e-8`; (h) `DatAirfoil::from_dat` with negative-`x` nose points; (i) `build_blended_sections` rejecting `NaN` `min_trailing_edge_mm`.
- [ ] **Step 2:** Verify RED (`cargo test -p blade-model -p blade-geom`).
- [ ] **Step 3:** Implement minimal fixes + `BladeSurface::section_at_span_mm`.
- [ ] **Step 4:** Verify GREEN (`cargo test -p blade-model -p blade-geom`, plus golden snapshots intact).
- [ ] **Step 5:** Commit Task 2 with trailers.

---

### Task 3: Fix Mesh, CAD & WASM Critical/High Bugs (`crates/blade-mesh`, `crates/blade-cad`, `crates/blade-wasm`)

**Files:**
- Modify: `crates/blade-mesh/src/fabrication.rs`, `crates/blade-mesh/src/tessellate.rs`, `crates/blade-mesh/src/mesh.rs`, `crates/blade-mesh/src/threemf.rs`
- Modify: `crates/blade-cad/src/assembly.rs`, `crates/blade-cad/src/kernel.rs`
- Modify: `crates/blade-wasm/src/mesh.rs`, `crates/blade-wasm/src/lib.rs`
- Test: `crates/blade-mesh/src/fabrication.rs`, `crates/blade-mesh/tests/stl.rs`, `crates/blade-cad/src/assembly.rs`, `crates/blade-cad/tests/step.rs`, `crates/blade-wasm/src/mesh.rs`

**Interfaces:**
- Consumes: `BladeSurface::section_at_span_mm` from Task 2.
- Produces: Validated `assembly_mesh` (all `+z` hub top cap triangles outward), BOPCheck-clean 8-face `tsweep` round `hub_solid`, bounds-checked `TruckKernel::mesh_solid`, panic/infinite-loop-free `fabrication.rs`, hardened `triangulate_cap`, unsplit fabricated STEP support & `explode_gap_mm` in `blade-wasm`, JSON-serialized override-aware `fabrication_report_json`, and checked `blade_part_<N>`.

- [ ] **Step 1:** Write failing tests for: (a) short `< 1 mm` blade with spar hole & `< 1e-3 mm` split segment not panicking/looping; (b) `section_core_station` with `< 3` points & `NaN` fabrication specs returning `Err`/safe defaults; (c) `SparTubeAxis` on ultra-thin blade returning `None` instead of breaking through skin; (d) `assembly_mesh` top-cap collar fan triangles all having positive `+z` normal (`cross_z > 0`); (e) `TruckKernel::mesh_solid` rejecting OOB triangle indices with `Err(CadError::Topology)` instead of panicking; (f) `hub_solid` round hub using 8-face `tsweep` and passing FreeCAD `sol.check(True)`; (g) `blade-wasm` unsplit `step_mode = "features"` keeping spar hole, multi-solid fabricated STEP honoring `explode_gap_mm`, `fabrication_report_json` honoring `tip_chord_mm`, and `blade_part_8` / `blade_part_0` erroring cleanly.
- [ ] **Step 2:** Verify RED (`cargo test -p blade-mesh -p blade-cad -p blade-wasm`).
- [ ] **Step 3:** Implement minimal fixes across `blade-mesh`, `blade-cad`, and `blade-wasm`.
- [ ] **Step 4:** Verify GREEN (`cargo test -p blade-mesh -p blade-cad -p blade-wasm` + FreeCAD `sol.check(True)` on `naca4412.assembly.step` + `golden_snapshots` unchanged).
- [ ] **Step 5:** Commit Task 3 with trailers.

---

### Task 4: Fix Aerodynamics Physics & Optimizer Panics (`crates/blade-aero`)

**Files:**
- Modify: `crates/blade-aero/src/bem.rs`, `crates/blade-aero/src/neuralfoil.rs`, `crates/blade-aero/src/polar.rs`, `crates/blade-aero/src/generator.rs`, `crates/blade-aero/src/optimize.rs`
- Test: `crates/blade-aero/tests/bem_solver.rs`, `crates/blade-aero/tests/generator_matching.rs`, `crates/blade-aero/tests/polars_viterna.rs`, `crates/blade-aero/src/neuralfoil.rs`, `crates/blade-aero/src/optimize.rs`

- [ ] **Step 1:** Write failing tests for: (a) `simulate()` with valid `hub_radius_mm == 0.0` producing finite `cp/ct/cq/power_w`; (b) `prandtl_loss_factor` matching exact `r_hub_m` denominator formula and finite at `r_m == 0.0`; (c) `brent_root` handling flat `fa == fb` and non-finite intermediate `s` without `NaN`; (d) `neuralfoil` `NACA4412` and `NACA0012` peak `Cl` within 15% of built-in polar at `Re = 100k` and Lednicer `SG6043` contour camber extraction accurate; (e) symmetric `Naca4 { max_camber: 0.0, camber_position: 0.4, thickness_ratio: 0.12 }` resolving built-in `NACA0012`; (f) `optimize_blade` returning `Err` on inverted/NaN config bounds and preserving non-integer locked stations on `naca4412-schmitz.json` within `1e-9`; (g) `match_generator` preferring stable crossings and handling light-load runaway > TSR 12.
- [ ] **Step 2:** Verify RED (`cargo test -p blade-aero`).
- [ ] **Step 3:** Implement minimal fixes in `bem.rs`, `neuralfoil.rs`, `polar.rs`, `generator.rs`, and `optimize.rs`.
- [ ] **Step 4:** Verify GREEN (`cargo test -p blade-aero` — including QBlade reference & all proptests).
- [ ] **Step 5:** Commit Task 4 with trailers.

---

### Task 5: Fix Web Security (XSS), Gearbox STL Normals & Meshing, Heatmaps, Winglets, Printer Fit & Gist Client (`web/src/state.ts`, `web/src/gist.ts`)

**Files:**
- Modify: `web/src/state.ts`, `web/src/gist.ts`
- Test: `web/scripts/types.test.mjs`

**Interfaces:**
- Produces: Safe recursive-descent `evalFormulaPreview` (no `new Function`), `escapeHtml`, outward-wound gearbox STLs (0 inconsistent edges), odd/even-parity mating tooth phases & exact `spin_ratio`, fixed `computeVertexHeatmapColors` (`span_ratio` + `twist_deg`), hardened `isValidDesignObject` & deep-merged `createWorkbenchSnapshot`, fixed winglet `sweep=0` & monotonic `z`, fixed `evaluatePrinterBuildFit` convergence, safe `extractGistId` & `file.truncated` fallback.

- [ ] **Step 1:** Write failing Node tests in `web/scripts/types.test.mjs` proving each bug: (a) `evalFormulaPreview` rejects JS payload without mutating `globalThis` AND evaluates `-s^2 + 70` accurately; (b) `renderAirfoilSectionSvgMarkup` escapes `<image onerror=...>` in `airfoil.name`; (c) `buildGearboxMeshes` / `exportGearStlBytes` has **0** inconsistently wound edges and positive signed volume; (d) Gear 2 Pinion (`15T`) meshes valley-to-peak with Gear 1 (`60T`) and `direct_1stage` uses opposite helical hands; (e) `computeVertexHeatmapColors` maps `span_ratio = z/R` and reads `twist_deg` (not `alpha_deg`) in `wind_impact`; (f) `isValidDesignObject` rejects missing `overrides`/`hub`/`manufacturing` and `createWorkbenchSnapshot` deep-merges partial `winglet`/`gearbox`; (g) `applyWingletToBladeGeometry` respects `sweep_angle_deg: 0` and stays monotonic in `z` at `75°` cant; (h) `evaluatePrinterBuildFit` converges in 1 step with lip height; (i) `extractGistId("%E0%A4%A")` returns `null` without throwing.
- [ ] **Step 2:** Verify RED (`cd web; npm.cmd test`).
- [ ] **Step 3:** Implement fixes in `web/src/state.ts` and `web/src/gist.ts`.
- [ ] **Step 4:** Verify GREEN (`cd web; npm.cmd run typecheck; npm.cmd test`).
- [ ] **Step 5:** Commit Task 5 with trailers.

---

### Task 6: Fix Web GPU Leak, Bézier Drag, STEP/Export Parity, Gist PAT Safety, UI Sync & CSS (`web/src/main.ts`, `web/index.html`) + WASM Rebuild + Final Review

**Files:**
- Modify: `web/src/main.ts`, `web/index.html`, `web/scripts/types.test.mjs`
- Rebuild: `web/pkg/` and `target/glue-node/` via `npm.cmd run wasm` and `npm.cmd run build`

- [ ] **Step 1:** Write failing regression tests in `web/scripts/types.test.mjs` for CSS token/class presence (`--radius-sm`, `--bg-hover`, `.grid-3`, `.btn-secondary`), `main.ts` disposal/export/PAT invariants, and end-to-end WASM unsplit fabricated STEP & exploded split STEP.
- [ ] **Step 2:** Rebuild WASM (`cd web; npm.cmd run wasm`) and implement fixes in `web/src/main.ts` and `web/index.html`:
  - `disposeObject3D(group)` + shared `rodGeo`/`rodMat` + `data.free()` in `finally` + PMREM/RoomEnvironment disposal.
  - In-place SVG attribute update during Bézier `<circle>` pointer drag (keep pointer capture alive!).
  - Fix dead STEP fabrication tautology at `main.ts:2905-2908`, fix misleading `-cfhole`/`-part` filenames on `"assembly"`/`"hub"`, fix winglet STL export not exporting exploded segments or stale gearbox buffers.
  - Preserve GitHub PAT on offline/non-401 errors in `syncGistAuthState`; track `activeGistId` to `PATCH` existing gists on Save; guard `loadSavedSlotsFromStorage` against corrupt localStorage entries.
  - Fix `sliderBladeLength` locked-ratio drift, preview-on-move / commit-on-pointerup for value scrubbing + integer rounding, hub vertical offset sign when `bladeFlipped = true`, falsy-zero `||` fallbacks (`0°` twist/alpha, `sweep=0`), sync spin button & gearbox inspector open state, add `try/catch` + staggered delay on multi-part download loop, and fix missing CSS tokens/classes.
- [ ] **Step 3:** Run full verification suite (`cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace`, `cargo build -p blade-model -p blade-geom -p blade-mesh -p blade-aero --target wasm32-unknown-unknown`, `cd web; npm.cmd run wasm; npm.cmd run lint; npm.cmd run typecheck; npm.cmd test; npm.cmd run build`, plus local FreeCAD `step_check.py`!).
- [ ] **Step 4:** Dispatch a fresh whole-branch code reviewer subagent (`requesting-code-review`), address any Critical/Important findings with TDD, update `plan.md` §9 (`MEMORY_VERSION: 102`, Fact entry, `[END]`), commit and push!
