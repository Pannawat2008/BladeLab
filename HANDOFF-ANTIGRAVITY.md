# BladeLab — Handoff brief for Antigravity

> **Prepared:** 2026-11-05 (UTC+7) by `geom-1`
> **Repo root:** `C:\Users\Panna\Documents\BladeLab` (branch `main`, **21 commits**, **no git remote**)
> **Source of truth:** `plan.md` (read §0 and §9 *before anything* — see the paste-ready instruction at the end)

---

## 1. What this is

BladeLab is a **Rust-first web app for designing small wind-turbine blades** (competition use). A single Rust core produces geometry, meshes, STEP and a browser preview; the frontend is TS/Three.js; the server does heavy/boolean operations. Core crates compile to `wasm32-unknown-unknown`; STEP and booleans are server-only.

**Non-negotiable standards (Definition of Done):**
- Units: **mm** for length, **degrees** for angles (trig in radians; convert only at API boundaries).
- All computation `f64`; **no panics, no NaN/Inf** (error paths return typed errors via `thiserror`).
- Public items have doc comments (`#![deny(missing_docs)]` where already set).
- Core crates (`blade-model`, `blade-geom`, `blade-mesh`, `blade-aero`) are **I/O-free, zero C/C++**, and must build for `wasm32-unknown-unknown`.

**Kernel split (D-geom1-009, T-010 done):** **truck** = B-rep/STEP engine; **Manifold** (`manifold3d`) = server-side boolean/mesh engine; **OCCT** = optional cargo `occt` feature only. **Never** use booleans in the STEP path or in wasm.

## 2. Repo layout

| Path | What it is |
|---|---|
| `plan.md` | Source of truth: rules (§0), architecture (§2), ownership (§4), task board (§7), immutable contracts (§8), shared memory (§9, `MEMORY_VERSION: 15`). |
| `AGENTS.md` | Points agents to plan.md §0. |
| `Cargo.toml` / `Cargo.lock` | Workspace (resolver 2): `blade-model geom mesh cad wasm`. |
| `crates/blade-model` | Schema v1 (`Design`, `Rotor`, `CurveSource`, `AirfoilSpec`, `Hub`, …), validation, `resolve` → `ResolvedBlade`. stylized: lead-owned core. |
| `crates/blade-geom` | NACA 4-digit + cosine resample, `build_sections`, B-spline `loft` (`BladeSurface`). |
| `crates/blade-mesh` | `tessellate` → watertight `Mesh`, `check_mesh`, binary `write_stl`. |
| `crates/blade-cad` | `CadKernel` trait (truck): `blade_solid`, `hub_solid`, `write_step` → STEP. **Native/server, NOT wasm.** |
| `crates/blade-wasm` | wasm-bindgen wrapper: `build_mesh(design_json, overrides_json)` → indexed triangles. |
| `web/` | Vite 8 + Three.js 0.187 viewer; `src/main.ts`, `scripts/bench.cjs` (50 ms budget gate); `wasm` npm script regenerates `web/pkg` glue. |
| `deploy/manifold/` | Docker image (`bladelab/manifold:spike`) with a `manifold3d` union runner; `run-demo.ps1`. |
| `tests/` | `step_check.py` — FreeCAD headless STEP validator (used by CI + locally). |
| `fixtures/naca4412-linear.json` | Canonical end-to-end fixture (R=600, hub=60 mm, 70→35 mm chord, 20°→3° twist, NACA 4412, tip override 32/2, hub 120/12/50). |
| `.github/workflows/step-check.yml` | CI: build+test job and FreeCAD STEP-validation job (can't run yet — no remote). |

## 3. Task board snapshot (§7)

### Phase 0 — done except CI bootstrap
| ID | Task | Status |
|---|---|---|
| T-001 | Workspace init, base CI, AGENTS.md | **in-progress** (only CI activation missing — needs a git remote) |
| T-002..T-010 | model / geom / mesh / cad / STEP-CI / wasm-web / manifold-Docker / kernel decision | **done** |

### Phase 1 — one in progress, rest todo
| ID | Task | Depends on | Status |
|---|---|---|---|
| **T-101** | Layer 1: Schmitz chord/twist generation (`geom`) | T-010 ✅ | **todo — recommended next** |
| T-102 | Hub: cylinder + shaft bore + **D-flat** via 2D extrusion | T-010 ✅ | **done** (2026-11-05; `Hub.shaft_flat_radial_mm`, no booleans) |
| T-103 | Axum API `POST /api/v1/export` (stl, 3mf, step) + blake3 cache (`server`) | T-005,T-006 ✅ | todo |
| T-104 | `bladelab` CLI: `export design.json --format step` (`server`) | T-005,T-006 ✅ | todo |
| T-105 | UI: Layer-1 controls + per-station table (`web`) | T-008 ✅ | todo |
| T-106 | ts-rs TS type generation from `blade-model` (`web`) | T-002 ✅ | todo |
| T-107 | Golden tests: fixtures + volume/bbox snapshots (`qa`) | T-005 ✅ | todo |
| T-201 | Layer 2: Bézier/formulas (`evalexpr`, x = r/R) | T-101 | todo |
| T-202 | Airfoil library + `.dat` import + blending | T-003 ✅ | todo |
| T-203 | Unified blade+hub assembly via Manifold + 3MF (`cad`) | T-102 ✅ | todo |
| T-204 | PostgreSQL persistence (`server`) | T-103 | todo |
| T-205 | UI: curve editor, scrubbing, locking (`web`) | T-201 | todo |
| T-301..T-304 | Aero: polars/Viterna, BEM (Ning 2014 + Brent, Prandtl, Glauert), generator matching, Cp–TSR UI (`aero`/`web`) | T-002/T-301/T-302 | todo |

**Pattern used so far:** the single agent (`geom-1`) has been executing tasks across every role (geom→mesh→cad→qa→web→server) with **in-session lead approval for each**; each task gets a conventional-commit with trailers `Agent: geom-1 / Task: T-xxx / Memory-Ack: vN`.

## 4. Key memory to respect (§9)

- **F-lead1-002:** truck cannot export boolean results → no booleans in the STEP pipeline.
- **D-lead1-002 / D-geom1-001:** the B-spline `loft()` is the single geometry source; contour = `2·n−1` points, upper TE → LE → lower TE, finite TE (`0.021·t·c`).
- **D-geom1-009 (kernel decision):** truck=STEP, Manifold=server booleans, OCCT=optional only.
- **D-lead1-005:** mesh booleans exclusively `manifold` on the server; forbidden in core/wasm/STEP.
- **F-geom1-008:** fixture numbers to anchor cross-checks (1771 verts / 3538 tris / 126 493.7 mm³ blade; STEP blade 126 544.7 mm³, hub π(60²−6²)·50).
- **F-geom1-011/012/014/016:** FreeCAD-verified STEP, the headless STEP gate, the Manifold Docker union, and the D-flat hub (volume closed form `L·(πR² − [r²(π−acos(d/r)) + d·√(r²−d²)])`).
- **Gotchas worth knowing (L entries):** PowerShell `$LASTEXITCODE` lies through `Select-String` pipes; `npm` must run as `npm.cmd`; `wasm-bindgen-cli` must match the crate version (0.2.130); FreeCAD headless scripts should use its bundled `bin\python.exe`, not `FreeCADCmd` argv; Docker runtime base must match the build base glibc (`debian:trixie-slim` for `rust:1-slim`).

## 5. Verification commands (golden)

```bash
cargo test --workspace                                   # currently 86 tests, all green
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo build -p blade-model -p blade-geom -p blade-mesh --target wasm32-unknown-unknown   # wasm32 clean

# web (from web/)
npm.cmd run wasm       # cargo build wasm + wasm-bindgen glue (web/pkg)
npm.cmd run bench      # 50 ms update-budget gate against Node wasm (expect PASS, ~0.4 ms avg)
npm.cmd run build      # vite build
# then `npm.cmd run preview` → http://localhost:4173 (Three.js viewer, twist/chord sliders)

# STEP gate
"C:\Program Files\FreeCAD 1.1\bin\python.exe" tests\step_check.py target\naca4412.blade.step --solids 1 --z-min 59 --z-max 601
# expects: PASS … valid=True solids=1 volume=126544.7 …

# Manifold spike (needs Docker Desktop running)
.\deploy\manifold\run-demo.ps1                          # builds image + unions blade+hub STL in target/

# regenerate CAD exports
cargo run -p blade-cad --example export_step             # target/naca4412.{blade,assembly,hub-dflat}.step
```

## 6. Current blockers / environment notes

- **No git remote** → `git pull --rebase`/`push` and GitHub Actions are impossible; T-001 stays `in-progress` (CI activation) until the lead adds a remote. Commits are local-only.
- **Docker Desktop** is running (engine 29.6.1) — the manifold spike is repeatable.
- Machine: Windows; node v26; FreeCAD 1.1.1 installed at `C:\Program Files\FreeCAD 1.1`; `wasm32-unknown-unknown` toolchain installed.

## 7. Recommended next steps (pick one)

1. **T-101 (recommended)** — Schmitz layer-1 chord/twist formulas in `crates/blade-geom`/`blade-model`; acceptance: matches hand-calculated fixture values. Natural continuation of the geom line.
2. **T-104** — `blade-cli` (blades server path `crates/blade-cli/`): `bladelab export design.json --format step` reusing `blade-cad` + `blade-mesh`.
3. **T-203** — server unified blade+hub assembly via `manifold3d` + 3MF (feed the D-flat hub from T-102 into the proven Docker/manifold path).
4. **T-107** — qa golden snapshots wiring the existing step_check/mesh checks into versioned fixtures.

---

## Paste-ready instruction for Antigravity

> You are continuing the **BladeLab** project at `C:\Users\Panna\Documents\BladeLab`.
> **BEFORE writing any code**, read `plan.md` end-to-end — pay special attention to §0 (mandatory rules + boot sequence) and §9 (shared memory). It is currently `MEMORY_VERSION: 15`; confirm nothing changed, then append your `[ACK] line to the Session Log (§9.8)` per §0.1.
>
> The repo is a Rust workspace (model, geom, mesh, cad, wasm) + `web/` (Vite+Three.js) + `deploy/manifold` (Docker) + `tests/step_check.py` (FreeCAD STEP gate). Standards: mm/deg, `f64`, no panics/NaN, `thiserror`, doc comments; core crates I/O-free + `wasm32-unknown-unknown`-clean; STEP via truck with **no booleans**; booleans only via Manifold on the server (§8 + D-geom1-009). 86 workspace tests are green; verify with the command block in §5 of `HANDOFF-ANTIGRAVITY.md`.
>
> Claim and execute the **next task: T-101** (Layer 1 Schmitz chord/twist generation, `geom` role). Follow §5.1 task claiming (update the board row, commit with trailers `Agent: <you> / Task: T-101 / Memory-Ack: v<next>`), then implement with tests, run the full verification block, and update `plan.md` per §0.3 before committing.
> **Do not** modify §0–§6 (lead-owned), do not change §8/`blade-model` interfaces without a §9.6 Proposal, and do not introduce booleans into the STEP or wasm paths.
> Blockers to know: no git remote (local commits only; CI inactive — T-001), and `npm` must run as `npm.cmd`.
