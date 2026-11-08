import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import {
  applyBezierCurve,
  buildCosinePlateauExpr,
  parseCosinePlateauExpr,
  readSections,
  applySectionAirfoils,
  evalFormulaPreview,
  planformZones,
  applyBoundRootChord,
  applyFormulaCurve,
  applyLinearLayer1,
  applySchmitzLayer1,
  applyScrubDelta,
  clearAllOverrides,
  clearStationOverride,
  compareABSimulation,
  computeVertexHeatmapColors,
  createWorkbenchSnapshot,
  defaultChordBezierPoints,
  defaultFabricationSnapshot,
  defaultWorkbenchUiSnapshot,
  defaultTwistBezierPoints,
  DesignHistory,
  evaluateExperimentalFit,
  evaluatePrinterBuildFit,
  evaluateStructuralMechanics,
  evaluateWindSpeedCurveAndAep,
  inspectCpTsrAtSvgX,
  inspectWindPowerAtSvgX,
  interpolateSweepCp,
  parseExperimentalDataLog,
  parseLoadedProjectJson,
  removeSavedSlot,
  renderAirfoilSectionSvgMarkup,
  renderCpTsrSvgMarkup,
  renderWindPowerCurveSvgMarkup,
  resolveStationsPreview,
  scaleAllChords,
  setStationOverride,
  shiftAllChordsMm,
  updateBezierControlPoint,
  updateBladeLengthMm,
  updatePitchAxisRatio,
  updatePrimaryAirfoil,
  updateRotorField,
  upsertSavedSlot,
  applyBladeWindPreset,
  BLADE_WIND_PRESETS,
  GENERATOR_PRESETS,
  optimizeGeneratorAndGearbox,
  defaultGearboxConfig,
  computeGearboxMetrics,
  solveGearTeethForTargetRatio,
  buildGearboxMeshes,
  exportGearStlBytes,
} from "../src/state.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const typesPath = path.resolve(__dirname, "../src/types/blade-model.ts");
const fixturePath = path.resolve(__dirname, "../../fixtures/naca4412-linear.json");
const initialDesign = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

test("generated blade-model.ts exists and exports all schema types (T-106)", () => {
  const source = fs.readFileSync(typesPath, "utf8");
  for (const name of [
    "SCHEMA_VERSION = 1",
    "export type Design =",
    "export type Rotor =",
    "export type Distributions =",
    "export type CurveSource =",
    "export type AirfoilStation =",
    "export type AirfoilSpec =",
    "export type StationOverride =",
    "export type Hub =",
    "export type Manufacturing =",
    "export type ValidationIssue =",
  ]) {
    assert.ok(source.includes(name), `missing ${name} in blade-model.ts`);
  }
});

test("DesignHistory supports commit, undo, redo, and redo-branch clearing (T-105)", () => {
  const history = new DesignHistory(initialDesign);
  assert.equal(history.canUndo(), false);
  assert.equal(history.canRedo(), false);

  // No-op commit returns false
  assert.equal(history.commit(initialDesign), false);
  assert.equal(history.canUndo(), false);

  // Step 1: edit Layer 1 radius_mm
  const d1 = updateRotorField(history.current(), "radius_mm", 750);
  assert.equal(history.commit(d1), true);
  assert.equal(history.current().rotor.radius_mm, 750);
  assert.equal(history.canUndo(), true);
  assert.equal(history.canRedo(), false);

  // Step 2: edit Layer 3 station override at mid-span (r/R = 0.55)
  const d2 = setStationOverride(history.current(), 0.55, { chord_mm: 48.0, twist_deg: 9.5 });
  assert.equal(history.commit(d2), true);
  assert.deepEqual(history.counts(), { undo: 2, redo: 0 });

  // Undo back to d1
  const afterUndo1 = history.undo();
  assert.ok(afterUndo1);
  assert.equal(afterUndo1.rotor.radius_mm, 750);
  assert.equal(afterUndo1.overrides.length, 1); // only original tip override
  assert.deepEqual(history.counts(), { undo: 1, redo: 1 });

  // Undo back to initialDesign
  const afterUndo2 = history.undo();
  assert.ok(afterUndo2);
  assert.equal(afterUndo2.rotor.radius_mm, 600);
  assert.equal(history.canUndo(), false);
  assert.equal(history.canRedo(), true);

  // Redo forward to d1
  const afterRedo1 = history.redo();
  assert.ok(afterRedo1);
  assert.equal(afterRedo1.rotor.radius_mm, 750);

  // New commit from d1 clears redo stack
  const d3 = applySchmitzLayer1(history.current(), 1.1, 5.5);
  assert.equal(history.commit(d3), true);
  assert.equal(history.canRedo(), false);
  assert.equal(history.current().distributions.chord_mm.type, "schmitz");
});

test("resolveStationsPreview and Layer 3 station table helpers match Rust station grid (T-105)", () => {
  const rows = resolveStationsPreview(initialDesign);
  assert.equal(rows.length, 11);
  assert.ok(Math.abs(rows[0].span_ratio - 0.1) < 1e-9);
  assert.ok(Math.abs(rows[0].effective_chord_mm - 70.0) < 1e-9);
  assert.equal(rows[0].has_override, false);

  // Tip station has Layer-3 override (chord = 32 mm, twist = 2 deg vs base 35 mm / 3 deg)
  const tip = rows[10];
  assert.ok(Math.abs(tip.span_ratio - 1.0) < 1e-9);
  assert.ok(Math.abs(tip.base_chord_mm - 35.0) < 1e-9);
  assert.equal(tip.effective_chord_mm, 32.0);
  assert.equal(tip.effective_twist_deg, 2.0);
  assert.equal(tip.has_override, true);

  // Edit station 5 (span_ratio = 0.55)
  const edited = setStationOverride(initialDesign, rows[5].span_ratio, {
    chord_mm: 60.0,
    twist_deg: 14.0,
  });
  const editedRows = resolveStationsPreview(edited);
  assert.equal(editedRows[5].has_override, true);
  assert.equal(editedRows[5].effective_chord_mm, 60.0);
  assert.equal(editedRows[5].effective_twist_deg, 14.0);

  // Clear station 5 override
  const clearedOne = clearStationOverride(edited, rows[5].span_ratio);
  assert.equal(resolveStationsPreview(clearedOne)[5].has_override, false);

  // Clear all overrides
  const clearedAll = clearAllOverrides(edited);
  assert.equal(clearedAll.overrides.length, 0);
  assert.equal(resolveStationsPreview(clearedAll)[10].effective_chord_mm, 35.0);

  // Switch to Schmitz Layer 1 and back to Linear
  const schmitz = applySchmitzLayer1(clearedAll, 1.0, 6.0);
  const schmitzRows = resolveStationsPreview(schmitz);
  assert.ok(Math.abs(schmitzRows[0].effective_chord_mm - 140.15118654558518) < 1e-6);
  assert.ok(Math.abs(schmitzRows[10].effective_chord_mm - 53.31658284049927) < 1e-6);

  const linearAgain = applyLinearLayer1(schmitz, 70, 35, 20, 3);
  assert.equal(resolveStationsPreview(linearAgain)[0].effective_chord_mm, 70);
});

test("live 3D model updates via wasm on Layer 1 & Layer 3 edits and Undo/Redo within 50 ms (T-105)", () => {
  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  if (!fs.existsSync(gluePath)) {
    return;
  }
  const require = createRequire(import.meta.url);
  const { build_mesh } = require(gluePath);

  const history = new DesignHistory(initialDesign);
  const baseline = build_mesh(JSON.stringify(history.current()), "{}");
  assert.equal(baseline.triangle_count, 3538);
  assert.ok(Math.abs(baseline.volume_mm3 - 126493.727) < 0.5);

  // 1. Edit Layer 1 parameter (radius_mm 600 -> 660)
  history.commit(updateRotorField(history.current(), "radius_mm", 660));
  const t0 = performance.now();
  const afterLayer1 = build_mesh(JSON.stringify(history.current()), "{}");
  const dt1 = performance.now() - t0;
  assert.ok(dt1 < 50, `Layer 1 rebuild took ${dt1.toFixed(2)} ms (> 50 ms budget)`);
  assert.ok(afterLayer1.volume_mm3 > baseline.volume_mm3 * 1.08);
  assert.ok(Math.abs(afterLayer1.span_max_mm - 660.0) < 0.1);

  // 2. Edit Layer 3 per-station table override at tip (chord 32 -> 55 mm)
  history.commit(setStationOverride(history.current(), 1.0, { chord_mm: 55.0 }));
  const t1 = performance.now();
  const afterLayer3 = build_mesh(JSON.stringify(history.current()), "{}");
  const dt2 = performance.now() - t1;
  assert.ok(dt2 < 50, `Layer 3 rebuild took ${dt2.toFixed(2)} ms (> 50 ms budget)`);
  assert.ok(afterLayer3.volume_mm3 > afterLayer1.volume_mm3);

  // 3. Undo twice -> restores exact baseline 3D geometry
  history.undo();
  history.undo();
  const restored = build_mesh(JSON.stringify(history.current()), "{}");
  assert.ok(Math.abs(restored.volume_mm3 - baseline.volume_mm3) < 1e-6);
  assert.deepEqual(Array.from(restored.positions), Array.from(baseline.positions));
});

test("Layer 2 BÃ©zier curve editor and Formula helpers match Rust wasm evaluation (T-205)", () => {
  const cleared = clearAllOverrides(initialDesign);
  const withBezier = applyBezierCurve(cleared, "chord_mm", defaultChordBezierPoints(80, 40));
  const withTwistBezier = applyBezierCurve(
    withBezier,
    "twist_deg",
    defaultTwistBezierPoints(22, 4),
  );
  const rows = resolveStationsPreview(withTwistBezier);
  assert.ok(Math.abs(rows[0].effective_chord_mm - 80.0) < 1e-6);
  assert.ok(Math.abs(rows[10].effective_chord_mm - 40.0) < 1e-6);
  assert.ok(Math.abs(rows[0].effective_twist_deg - 22.0) < 1e-6);
  assert.ok(Math.abs(rows[10].effective_twist_deg - 4.0) < 1e-6);

  // Drag interior control point P1 up to 95 mm and clamp endpoint P0 x to 0
  const dragged = updateBezierControlPoint(withTwistBezier, "chord_mm", 1, {
    x: 0.35,
    y: 95.0,
  });
  const draggedRows = resolveStationsPreview(dragged);
  assert.ok(draggedRows[3].effective_chord_mm > rows[3].effective_chord_mm);

  // Formula curve helper (variable x = r/R, s = 0..1)
  const withFormula = applyFormulaCurve(dragged, "chord_mm", "90 - 50 * s");
  const formulaRows = resolveStationsPreview(withFormula);
  assert.ok(Math.abs(formulaRows[0].effective_chord_mm - 90.0) < 1e-6);
  assert.ok(Math.abs(formulaRows[5].effective_chord_mm - 65.0) < 1e-6);
  assert.ok(Math.abs(formulaRows[10].effective_chord_mm - 40.0) < 1e-6);

  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  if (fs.existsSync(gluePath)) {
    const require = createRequire(import.meta.url);
    const { build_mesh } = require(gluePath);
    const bezierMesh = build_mesh(JSON.stringify(dragged), "{}");
    const formulaMesh = build_mesh(JSON.stringify(withFormula), "{}");
    assert.equal(bezierMesh.triangle_count, 3538);
    assert.equal(formulaMesh.triangle_count, 3538);
    assert.ok(bezierMesh.volume_mm3 > 100000);
    assert.ok(formulaMesh.volume_mm3 > 100000);
  }
});

test("value scrubbing, station locking, and taper binding conform to UI interaction rules (T-205)", () => {
  // 1. Value scrubbing: normal (1Ã—), Shift (10Ã—), Alt (0.1Ã—), and min/max clamping
  assert.equal(applyScrubDelta(600, 16, 10), 640); // 16 px / 4 px per step = +4 steps * 10 = +40
  assert.equal(applyScrubDelta(600, 16, 10, { shiftKey: true }), 1000); // +4 * 100 = +400
  assert.equal(applyScrubDelta(600, 16, 10, { altKey: true }), 604); // +4 * 1 = +4
  assert.equal(
    applyScrubDelta(600, 500, 10, { shiftKey: true }, { min: 100, max: 2500 }),
    2500,
  );
  assert.equal(
    applyScrubDelta(600, -500, 10, { shiftKey: true }, { min: 100, max: 2500 }),
    100,
  );

  // 2. Station locking: locking station 5 (r/R = 0.55) preserves its chord & twist across Layer 1/2 edits
  const base = clearAllOverrides(initialDesign);
  const baseRows = resolveStationsPreview(base);
  const lockedRatio = baseRows[5].span_ratio;
  const lockedChord = baseRows[5].effective_chord_mm;
  const lockedTwist = baseRows[5].effective_twist_deg;

  const afterSchmitz = applySchmitzLayer1(base, 1.2, 5.0, [lockedRatio]);
  const schmitzRows = resolveStationsPreview(afterSchmitz);
  assert.ok(Math.abs(schmitzRows[5].effective_chord_mm - lockedChord) < 1e-6);
  assert.ok(Math.abs(schmitzRows[5].effective_twist_deg - lockedTwist) < 1e-6);
  // Unlocked stations did change to Schmitz values
  assert.ok(Math.abs(schmitzRows[0].effective_chord_mm - baseRows[0].effective_chord_mm) > 10);

  // 3. Parameter binding: root chord bound to tip via taperRatio = 0.45
  const bound = applyBoundRootChord(base, 80.0, 0.45, [lockedRatio]);
  assert.equal(bound.distributions.chord_mm.type, "linear");
  assert.equal(bound.distributions.chord_mm.root, 80.0);
  assert.equal(bound.distributions.chord_mm.tip, 36.0);
  const boundRows = resolveStationsPreview(bound);
  assert.ok(Math.abs(boundRows[0].effective_chord_mm - 80.0) < 1e-6);
  assert.ok(Math.abs(boundRows[10].effective_chord_mm - 36.0) < 1e-6);
  assert.ok(Math.abs(boundRows[5].effective_chord_mm - lockedChord) < 1e-6);
});

test("Cp-TSR chart, A/B comparison, and experimental test data logging plot against simulation curves (T-304)", () => {
  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  assert.ok(fs.existsSync(gluePath), "blade_wasm.js node glue must exist");
  const require = createRequire(import.meta.url);
  const { simulate_aero } = require(gluePath);

  // 1. Simulate Baseline A (Linear NACA 4412) and Design B (Schmitz optimal)
  const optsJson = JSON.stringify({
    tsr_min: 1.5,
    tsr_max: 9.0,
    tsr_steps: 16,
    generator_kv: 35,
    generator_r_int: 0.8,
    generator_r_load: 5.0,
  });
  const bundleA = JSON.parse(simulate_aero(JSON.stringify(initialDesign), optsJson));
  const schmitzDesign = applySchmitzLayer1(clearAllOverrides(initialDesign), 1.0, 6.0);
  const bundleB = JSON.parse(simulate_aero(JSON.stringify(schmitzDesign), optsJson));

  assert.ok(bundleA.sweep.length >= 16);
  assert.ok(bundleB.sweep.length >= 16);
  assert.ok(bundleB.generator_match && bundleB.generator_match.tip_speed_ratio > 0);
  assert.ok(bundleB.generator_match.generator.terminal_voltage_v > 0);
  assert.ok(bundleB.generator_match.generator.electrical_power_w > 0);

  // 2. A/B comparison shows positive Cp and power gain for Schmitz over Linear
  const ab = compareABSimulation(bundleA, bundleB);
  assert.ok(
    ab.delta_design_cp > 0.01,
    `expected Schmitz Design B to exceed Linear Baseline A Cp, got delta=${ab.delta_design_cp}`,
  );
  assert.ok(ab.delta_power_w > 3.0);

  // 3. Parse experimental test data log supporting both (tsr, cp) and rpm=.., power_w=.. rows
  const simCpAt45 = interpolateSweepCp(bundleB.sweep, 4.5);
  const rawLog = [
    "# Wind tunnel & bench log",
    `3.0, ${(interpolateSweepCp(bundleB.sweep, 3.0) - 0.01).toFixed(4)}`,
    `4.5, ${(simCpAt45 + 0.008).toFixed(4)}`,
    `rpm=572.96, power_w=${(bundleB.design_point.power_w - 3.5).toFixed(1)}`,
  ].join("\n");

  const expPoints = parseExperimentalDataLog(
    rawLog,
    schmitzDesign.rotor.radius_mm,
    schmitzDesign.rotor.wind_speed_mps,
  );
  assert.equal(expPoints.length, 3);
  assert.ok(Math.abs(expPoints[2].tsr - 4.5) < 0.01);
  assert.ok(expPoints[2].cp > 0.35 && expPoints[2].cp < 0.593);

  // 4. Residual fit statistics against Design B simulation curve
  const fit = evaluateExperimentalFit(bundleB.sweep, expPoints);
  assert.equal(fit.count, 3);
  assert.ok(fit.rmse_cp < 0.05, `expected tight fit RMSE < 0.05, got ${fit.rmse_cp}`);
  assert.ok(fit.mae_cp <= fit.rmse_cp + 1e-9);

  // 5. Render Cp-TSR SVG markup with Baseline A, Design B, and Experimental points
  const svgMarkup = renderCpTsrSvgMarkup(bundleB.sweep, {
    baselineASweep: bundleA.sweep,
    experimentalPoints: expPoints,
    designTsr: schmitzDesign.rotor.design_tsr,
  });
  assert.ok(svgMarkup.includes('class="betz-limit"'));
  assert.ok(svgMarkup.includes('class="curve-a"'));
  assert.ok(svgMarkup.includes('class="curve-b"'));
  const expCircleCount = (svgMarkup.match(/class="exp-point"/g) || []).length;
  assert.equal(expCircleCount, 3);
});

test("blade length L, pitch-axis pivot, global chord width shift/scale, and airfoil profile helpers update 3D geometry (T-205)", () => {
  // 1. Direct Blade Length L = R - r_0 updates radius_mm = hub_radius_mm + L
  const withLen = updateBladeLengthMm(initialDesign, 700);
  assert.equal(withLen.rotor.hub_radius_mm, 60);
  assert.equal(withLen.rotor.radius_mm, 760);

  // 2. Pitch-axis ratio clamps to [0, 1]
  const withPitchAxis = updatePitchAxisRatio(withLen, 0.35);
  assert.equal(withPitchAxis.rotor.pitch_axis_ratio, 0.35);

  // 3. Global chord shift (+10 mm) and scale (1.2Ã—)
  const shifted = shiftAllChordsMm(clearAllOverrides(initialDesign), 10);
  const shiftedRows = resolveStationsPreview(shifted);
  assert.ok(Math.abs(shiftedRows[0].effective_chord_mm - 80.0) < 1e-6);
  assert.ok(Math.abs(shiftedRows[10].effective_chord_mm - 45.0) < 1e-6);

  const scaled = scaleAllChords(shifted, 1.2);
  const scaledRows = resolveStationsPreview(scaled);
  assert.ok(Math.abs(scaledRows[0].effective_chord_mm - 96.0) < 1e-6);
  assert.ok(Math.abs(scaledRows[10].effective_chord_mm - 54.0) < 1e-6);

  // 4. Airfoil profile switcher (SG6043 and parametric NACA 4-digit thickness)
  const sgDesign = updatePrimaryAirfoil(scaled, { type: "named", name: "SG6043" });
  assert.equal(sgDesign.airfoils[0].airfoil.type, "named");
  assert.equal(sgDesign.airfoils[0].airfoil.name, "SG6043");

  const thickNaca = updatePrimaryAirfoil(sgDesign, {
    type: "naca4",
    max_camber: 0.04,
    camber_position: 0.4,
    thickness_ratio: 0.18,
  });

  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  if (fs.existsSync(gluePath)) {
    const require = createRequire(import.meta.url);
    const { build_mesh } = require(gluePath);
    const thinMesh = build_mesh(JSON.stringify(scaled), "{}");
    const thickMesh = build_mesh(JSON.stringify(thickNaca), "{}");
    assert.ok(thickMesh.volume_mm3 > thinMesh.volume_mm3 * 1.3);
  }
});

test("2D airfoil cross-section SVG preview and in-browser STL/3MF export wasm bytes work end-to-end", () => {
  const nacaSvg = renderAirfoilSectionSvgMarkup(initialDesign, { diameterMm: 5.0 });
  assert.ok(nacaSvg.includes('class="airfoil-contour"'));
  assert.ok(nacaSvg.includes('class="airfoil-camber"'));
  assert.ok(nacaSvg.includes('class="pitch-axis-dot"'));
  assert.ok(nacaSvg.includes('class="spar-hole-circle"'));

  const sgDesign = updatePrimaryAirfoil(initialDesign, { type: "named", name: "SG6043" });
  const sgSvg = renderAirfoilSectionSvgMarkup(sgDesign);
  assert.ok(sgSvg.includes("SG6043"));

  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  assert.ok(fs.existsSync(gluePath), "blade_wasm.js node glue must exist");
  const require = createRequire(import.meta.url);
  const {
    build_mesh,
    export_stl_bytes,
    export_3mf_bytes,
    export_fabricated_stl_bytes,
    export_fabricated_3mf_bytes,
  } = require(gluePath);

  const stlBytes = export_stl_bytes(JSON.stringify(initialDesign));
  assert.equal(stlBytes.byteLength, 84 + 50 * 3538);

  const threemfBytes = export_3mf_bytes(JSON.stringify(initialDesign));
  assert.ok(threemfBytes.byteLength > 10000);
  // 3MF is a ZIP archive starting with 'PK\x03\x04'
  assert.equal(threemfBytes[0], 0x50);
  assert.equal(threemfBytes[1], 0x4b);

  // Verify carbon-fiber base hole + 2-part split model build & STL/3MF export
  const fabJson = JSON.stringify({
    spar_hole_diameter_mm: 5.0,
    spar_hole_depth_mm: 360.0,
    split_parts: 2,
    split_ratio: 0.5,
    explode_gap_mm: 24.0,
  });
  const fabMesh = build_mesh(JSON.stringify(initialDesign), fabJson);
  assert.ok(fabMesh.triangle_count > 3538);
  assert.ok(fabMesh.volume_mm3 < 126493.7);

  const part0Stl = export_fabricated_stl_bytes(
    JSON.stringify(initialDesign),
    JSON.stringify({
      spar_hole_diameter_mm: 5.0,
      spar_hole_depth_mm: 360.0,
      split_parts: 2,
      split_ratio: 0.5,
      active_part: 0,
    }),
  );
  assert.ok(part0Stl.byteLength > 50000);

  const fab3mf = export_fabricated_3mf_bytes(JSON.stringify(initialDesign), fabJson);
  assert.equal(fab3mf[0], 0x50);
  assert.equal(fab3mf[1], 0x4b);

  // Alignment pins + sockets with custom tolerances
  const { fabrication_report } = require(gluePath);
  const alignJson = (part, clearance) =>
    JSON.stringify({
      spar_hole_diameter_mm: 5.0,
      spar_hole_depth_mm: 360.0,
      spar_hole_tolerance_mm: 0.2,
      split_parts: 2,
      split_ratio: 0.5,
      ...(part === null ? { explode_gap_mm: 24.0 } : { active_part: part }),
      align_shape: "round",
      align_count: 2,
      align_size_mm: 3.0,
      align_height_mm: 6.0,
      align_clearance_mm: clearance,
    });
  const report = JSON.parse(fabrication_report(JSON.stringify(initialDesign), alignJson(null, 0.2)));
  assert.equal(report.length, 1);
  assert.equal(report[0].placed, 2);
  assert.ok(report[0].socket_depth_mm > report[0].pin_height_mm);

  const lowerSnug = build_mesh(JSON.stringify(initialDesign), alignJson(0, 0.1));
  const upperSnug = build_mesh(JSON.stringify(initialDesign), alignJson(1, 0.1));
  const upperLoose = build_mesh(JSON.stringify(initialDesign), alignJson(1, 0.4));
  const lowerPlain = build_mesh(
    JSON.stringify(initialDesign),
    JSON.stringify({ spar_hole_diameter_mm: 5.0, spar_hole_depth_mm: 360.0, spar_hole_tolerance_mm: 0.2, split_parts: 2, split_ratio: 0.5, active_part: 0 }),
  );
  assert.ok(lowerSnug.volume_mm3 > lowerPlain.volume_mm3, "pins add volume to the lower part");
  assert.ok(upperLoose.volume_mm3 < upperSnug.volume_mm3, "larger clearance cuts bigger sockets");

  // Phase 4: Auto-optimize blade via WASM (T-401 / T-402)
  const { optimize_blade_wasm } = require(gluePath);
  const optRes = JSON.parse(
    optimize_blade_wasm(
      JSON.stringify(initialDesign),
      JSON.stringify({
        objective: { mode: "design_tsr" },
        locked_span_ratios: [0.1],
        max_iterations: 10,
      }),
    ),
  );
  assert.ok(
    optRes.optimized_cp > optRes.initial_cp + 0.02,
    `expected WASM optimizer to improve Cp: ${optRes.initial_cp} -> ${optRes.optimized_cp}`,
  );
  assert.ok(optRes.optimized_design.overrides.length >= 10);
});

test("smooth cosine planform: root, plateau and tip values", () => {
  const rotor = { radius_mm: 500, hub_radius_mm: 100, blade_count: 3, design_tsr: 6 };
  const expr = buildCosinePlateauExpr(70, 30, 0.45, 0.25);
  const { rootEnd, tipStart } = planformZones(0.45, 0.25);
  assert.ok(Math.abs(rootEnd - 0.325) < 1e-9 && Math.abs(tipStart - 0.575) < 1e-9);
  const at = (s) => evalFormulaPreview(expr, rotor, s, s);
  assert.ok(Math.abs(at(0) - 70) < 1e-6);
  assert.ok(Math.abs(at(1) - 30) < 1e-6);
  assert.ok(Math.abs(at(0.4) - 50) < 1e-6);
  assert.ok(Math.abs(at(0.5) - 50) < 1e-6);
  let prev = at(0);
  for (let i = 1; i <= 100; i++) {
    const v = at(i / 100);
    assert.ok(v <= prev + 1e-9, "monotonic non-increasing");
    prev = v;
  }
});

test("three-section planform: explicit mid chord/twist, parse round-trip and airfoil stations", () => {
  const rotor = { radius_mm: 600, hub_radius_mm: 60, blade_count: 3, design_tsr: 4.5 };
  const expr = buildCosinePlateauExpr(45, 22, 0.45, 0.25, 90);
  const at = (s) => evalFormulaPreview(expr, rotor, s, s);
  assert.ok(Math.abs(at(0) - 45) < 1e-6);
  assert.ok(Math.abs(at(0.45) - 90) < 1e-6);
  assert.ok(Math.abs(at(1) - 22) < 1e-6);
  const parsed = parseCosinePlateauExpr(expr);
  assert.ok(parsed && Math.abs(parsed.center - 0.45) < 1e-4 && Math.abs(parsed.width - 0.25) < 1e-4);
  assert.equal(parseCosinePlateauExpr("70 - 35 * s"), null);

  const design = structuredClone(initialDesign);
  design.overrides = [];
  design.distributions.chord_mm = { type: "formula", expr };
  design.distributions.twist_deg = { type: "linear", root: 24, tip: 1.5 };
  const secs = readSections(design, 0.45);
  assert.ok(Math.abs(secs.root.chord_mm - 45) < 1e-6);
  assert.ok(Math.abs(secs.mid.chord_mm - 90) < 1e-6);
  assert.ok(Math.abs(secs.tip.chord_mm - 22) < 1e-6);
  secs.tip.airfoil = { type: "named", name: "SG6043" };
  const next = applySectionAirfoils(design, secs, 0.45);
  assert.equal(next.airfoils.length, 3);
  assert.equal(next.airfoils[0].span_ratio, 0);
  assert.equal(next.airfoils[2].airfoil.name, "SG6043");
  assert.ok(next.airfoils[1].span_ratio > 0.1 && next.airfoils[1].span_ratio < 1);
});

test("workbench snapshot auto-save/load: full snapshot round-trip, plain Design JSON load, and named slots", () => {
  const customDesign = updateRotorField(initialDesign, "radius_mm", 750);
  const snap = createWorkbenchSnapshot(
    customDesign,
    {
      spar_hole_enabled: true,
      spar_hole_diameter_mm: 6.0,
      split_parts: 2,
      align_shape: "contour",
      align_height_mm: 8.0,
      align_min_wall_mm: 1.2,
    },
    {
      planform_cosine: true,
      planform_center_pct: 48,
      planform_width_pct: 30,
      locked_span_ratios: [0.0, 1.0],
      gen_kv: 42,
      exp_data_log: "4.5, 0.41",
    },
    "S833 750mm Contour",
  );

  assert.equal(snap.bladelab_snapshot_version, 1);
  assert.equal(snap.name, "S833 750mm Contour");
  assert.equal(snap.design.rotor.radius_mm, 750);
  assert.equal(snap.fabrication.spar_hole_enabled, true);
  assert.equal(snap.fabrication.align_shape, "contour");
  assert.equal(snap.workbench.planform_center_pct, 48);
  assert.deepEqual(snap.workbench.locked_span_ratios, [0.0, 1.0]);

  // 1. Round-trip full WorkbenchSnapshot JSON
  const loadedSnap = parseLoadedProjectJson(JSON.stringify(snap));
  assert.equal(loadedSnap.name, "S833 750mm Contour");
  assert.equal(loadedSnap.design.rotor.radius_mm, 750);
  assert.equal(loadedSnap.fabrication.split_parts, 2);
  assert.equal(loadedSnap.fabrication.align_shape, "contour");
  assert.equal(loadedSnap.workbench.gen_kv, 42);
  assert.equal(loadedSnap.workbench.exp_data_log, "4.5, 0.41");

  // 2. Load plain Design JSON (like naca4412-linear.json or legacy export)
  const plainDesign = structuredClone(initialDesign);
  plainDesign.distributions.chord_mm = {
    type: "formula",
    expr: buildCosinePlateauExpr(65, 25, 0.42, 0.28, 80),
  };
  const loadedFromPlain = parseLoadedProjectJson(JSON.stringify(plainDesign));
  assert.equal(loadedFromPlain.bladelab_snapshot_version, 1);
  assert.equal(loadedFromPlain.design.rotor.radius_mm, initialDesign.rotor.radius_mm);
  assert.equal(loadedFromPlain.fabrication.split_parts, 1);
  assert.equal(loadedFromPlain.workbench.planform_cosine, true);
  assert.equal(loadedFromPlain.workbench.planform_center_pct, 42);
  assert.equal(loadedFromPlain.workbench.planform_width_pct, 28);

  // 3. Reject invalid JSON
  assert.throws(() => parseLoadedProjectJson("{not valid json"), /Invalid JSON syntax/);
  assert.throws(() => parseLoadedProjectJson(JSON.stringify({ hello: "world" })), /Unrecognized JSON schema/);

  // 4. Named slot upsert, update-by-name, and removal
  let slots = [];
  slots = upsertSavedSlot(slots, snap, "Slot Alpha");
  assert.equal(slots.length, 1);
  assert.equal(slots[0].name, "Slot Alpha");

  slots = upsertSavedSlot(slots, loadedFromPlain, "Slot Beta");
  assert.equal(slots.length, 2);
  assert.equal(slots[0].name, "Slot Beta");

  // Updating "Slot Alpha" by case-insensitive name moves it to top without duplicating
  slots = upsertSavedSlot(slots, snap, "slot alpha");
  assert.equal(slots.length, 2);
  assert.equal(slots[0].name, "slot alpha");

  slots = removeSavedSlot(slots, slots[0].id);
  assert.equal(slots.length, 1);
  assert.equal(slots[0].name, "Slot Beta");
});

test("structural mechanics, 3D vertex heatmaps, wind power AEP curve, and printer build fit checker", () => {
  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  const require = createRequire(import.meta.url);
  const { simulate_aero, build_mesh } = require(gluePath);

  const bundle = JSON.parse(
    simulate_aero(
      JSON.stringify(initialDesign),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: 35,
        generator_r_int: 0.8,
        generator_r_load: 5.0,
      }),
    ),
  );

  // 1. Structural & Root-Bending Mechanics + CF Spar Safety Factor
  const fabSolid = defaultFabricationSnapshot();
  const structSolid = evaluateStructuralMechanics(initialDesign, bundle, fabSolid, "petg");
  assert.ok(structSolid.root_moment_nm > 0.1, "root flapwise bending moment must be positive");
  assert.ok(structSolid.tip_deflection_mm > 0.05, "tip deflection must be positive");
  assert.ok(structSolid.blade_mass_g > 10, "blade mass must be positive");

  const fabCf = {
    ...defaultFabricationSnapshot(),
    spar_hole_enabled: true,
    spar_hole_diameter_mm: 6.0,
    spar_hole_depth_mm: 480,
    split_parts: 2,
    split_ratio_pct: 50,
    align_shape: "contour",
  };
  const structCf = evaluateStructuralMechanics(initialDesign, bundle, fabCf, "petg");
  assert.ok(
    structCf.tip_deflection_mm < structSolid.tip_deflection_mm,
    `CF spar tube should reduce tip deflection: ${structCf.tip_deflection_mm} < ${structSolid.tip_deflection_mm}`,
  );
  assert.ok(
    structCf.root_safety_factor > structSolid.root_safety_factor,
    `CF spar tube should increase root safety factor: ${structCf.root_safety_factor} > ${structSolid.root_safety_factor}`,
  );
  assert.ok(structCf.split_moment_nm > 0 && structCf.split_moment_nm < structCf.root_moment_nm);

  // 2. 3D Aerodynamic & Wall-Stress Vertex Heatmaps
  const meshData = build_mesh(JSON.stringify(initialDesign), "{}");
  for (const mode of ["alpha", "cl_cd", "torque", "wall_stress"]) {
    const hm = computeVertexHeatmapColors(
      meshData.positions,
      initialDesign,
      bundle,
      structCf,
      mode,
    );
    assert.equal(hm.colors.length, meshData.positions.length);
    for (let i = 0; i < hm.colors.length; i++) {
      assert.ok(hm.colors[i] >= 0 && hm.colors[i] <= 1, `RGB out of range at ${i} in mode ${mode}`);
    }
  }

  // 3. Multi-Wind-Speed Power Curve (2..18 m/s), Cut-In & Weibull AEP
  const aep = evaluateWindSpeedCurveAndAep(
    initialDesign,
    bundle,
    { kv: 35, r_int: 0.8, r_load: 5.0 },
    5.5,
  );
  assert.ok(aep.cut_in_mps >= 1.4 && aep.cut_in_mps <= 7.5);
  assert.ok(aep.aep_kwh_yr > 1.0, `expected positive Weibull AEP, got ${aep.aep_kwh_yr}`);
  assert.equal(aep.points.length, 17); // 2..18 m/s
  const windSvg = renderWindPowerCurveSvgMarkup(aep);
  assert.ok(windSvg.includes("<path"));
  assert.ok(windSvg.includes("Cut-in"));

  // 4. Printer Build-Volume Fit Checker (540 mm blade vs 256 mm Bambu Z height)
  const fitUnsplit = evaluatePrinterBuildFit(initialDesign, fabSolid, "bambu_256");
  assert.equal(fitUnsplit.all_fit, false, "540 mm unsplit blade exceeds 256 mm Z limit");
  assert.equal(fitUnsplit.recommended_split_parts, 3, "540 mm blade needs 3 parts to fit 256 mm Z with pin protrusion");

  const fab3Part = {
    ...defaultFabricationSnapshot(),
    split_parts: fitUnsplit.recommended_split_parts,
    align_shape: "contour",
    align_height_mm: 8.0,
  };
  const fitSplit = evaluatePrinterBuildFit(initialDesign, fab3Part, "bambu_256");
  assert.equal(fitSplit.all_fit, true, "3-part split fits 256 mm Z limit including 8 mm Contour Lip");

  // 5. Interactive SVG chart crosshair & hover inspection helpers (/ui-taste polish)
  assert.ok(windSvg.includes('class="chart-crosshair"'));
  const cpHover = inspectCpTsrAtSvgX(160, bundle.sweep, bundle.sweep, 600, 8.0);
  assert.ok(cpHover.tsr >= 1.0 && cpHover.tsr <= 9.5);
  assert.ok(cpHover.cp > 0.1 && cpHover.cp < 0.6);
  assert.ok(cpHover.readout.includes("Cp") && cpHover.readout.includes("RPM"));
  const windHover = inspectWindPowerAtSvgX(200, aep);
  assert.ok(windHover.wind_mps >= 2.0 && windHover.wind_mps <= 18.0);
  assert.ok(windHover.mech_power_w >= windHover.elec_power_w);
  assert.ok(windHover.readout.includes("m/s"));
});

test("Competition Blade Presets, Generator Presets, Gear Ratio & Max-Out Optimizer (T-105)", () => {
  const require = createRequire(import.meta.url);
  const { build_mesh, simulate_aero } = require("../../target/glue-node/blade_wasm.js");

  // 1. Verify all 5 blade presets build valid 3D meshes and have tailored parameters
  for (const presetKey of [
    "low_wind",
    "med_kidwind",
    "scimitar_belly",
    "high_wind",
    "schmitz_600",
  ]) {
    const { design, spec } = applyBladeWindPreset(initialDesign, presetKey);
    assert.equal(design.rotor.wind_speed_mps, spec.rotor.wind_speed_mps);
    assert.equal(design.rotor.design_tsr, spec.rotor.design_tsr);
    assert.equal(design.rotor.radius_mm, spec.rotor.radius_mm);
    const mesh = build_mesh(JSON.stringify(design), "{}");
    assert.ok(mesh.positions.length > 300, `preset ${presetKey} should produce valid mesh`);
  }

  assert.equal(BLADE_WIND_PRESETS.low_wind.rotor.wind_speed_mps, 3.5);
  assert.equal(BLADE_WIND_PRESETS.med_kidwind.rotor.wind_speed_mps, 4.5);
  assert.equal(BLADE_WIND_PRESETS.scimitar_belly.sections.root.chord_mm, 45);
  assert.equal(BLADE_WIND_PRESETS.scimitar_belly.sections.mid.chord_mm, 76);
  assert.equal(BLADE_WIND_PRESETS.scimitar_belly.sections.tip.chord_mm, 22);
  assert.equal(BLADE_WIND_PRESETS.scimitar_belly.recommended_spar_mm, 5.0);
  assert.equal(BLADE_WIND_PRESETS.high_wind.rotor.wind_speed_mps, 8.0);

  // 2. Verify WASM simulate_aero couples generator_gear_ratio properly
  const { design: kwDesign } = applyBladeWindPreset(initialDesign, "med_kidwind");
  const genRed = GENERATOR_PRESETS.kidwind_red;
  const bundleDirect = JSON.parse(
    simulate_aero(
      JSON.stringify(kwDesign),
      JSON.stringify({
        tsr_min: 1.0,
        tsr_max: 9.0,
        tsr_steps: 25,
        generator_kv: genRed.kv_rpm_per_v,
        generator_r_int: genRed.r_int_ohm,
        generator_r_load: 10.0,
        generator_gear_ratio: 1.0,
      }),
    ),
  );
  const bundleGeared = JSON.parse(
    simulate_aero(
      JSON.stringify(kwDesign),
      JSON.stringify({
        tsr_min: 1.0,
        tsr_max: 9.0,
        tsr_steps: 25,
        generator_kv: genRed.kv_rpm_per_v,
        generator_r_int: genRed.r_int_ohm,
        generator_r_load: 10.0,
        generator_gear_ratio: 3.0,
      }),
    ),
  );
  assert.ok(
    Math.abs(
      bundleDirect.generator_match.generator.generator_rpm -
        bundleDirect.generator_match.generator.rotor_rpm * 1.0,
    ) < 1e-3,
    "direct-drive generator_rpm must equal rotor_rpm * 1.0",
  );
  assert.ok(
    Math.abs(
      bundleGeared.generator_match.generator.generator_rpm -
        bundleGeared.generator_match.generator.rotor_rpm * 3.0,
    ) < 1e-3,
    "geared generator_rpm must equal rotor_rpm * 3.0",
  );

  // 3. Verify optimizeGeneratorAndGearbox diagnoses mismatch and solves for optimal G:1 & R_load
  const maxOut = optimizeGeneratorAndGearbox(kwDesign, bundleDirect, {
    kv: genRed.kv_rpm_per_v,
    r_int: genRed.r_int_ohm,
    r_load: 2.0,
    gear_ratio: 1.0,
  });
  assert.ok(maxOut.opt_gear_ratio >= 1.0 && maxOut.opt_gear_ratio <= 8.0);
  assert.ok(maxOut.opt_r_load_ohm >= 0.5 && maxOut.opt_r_load_ohm <= 120.0);
  assert.ok(
    maxOut.opt_elec_power_w >= maxOut.current_elec_power_w,
    `optimal power (${maxOut.opt_elec_power_w}) should be >= unoptimized (${maxOut.current_elec_power_w})`,
  );
  assert.equal(maxOut.how_to_max_out_steps.length, 3);
});

test("Gearbox Prototype 3-gear CAD mesh builder, ratio solver, and binary STL export (T-105)", () => {
  const cfg = defaultGearboxConfig();
  assert.equal(cfg.g1_teeth, 60);
  assert.equal(cfg.g1_spokes, 4);
  assert.equal(cfg.g2_wheel_teeth, 56);
  assert.equal(cfg.g2_spokes, 4);
  assert.equal(cfg.g2_pinion_teeth, 15);
  assert.equal(cfg.g3_teeth, 20);
  assert.equal(cfg.g3_helix_hand, 1);
  assert.equal(cfg.spoke_width_pct, 26.0);
  assert.equal(cfg.rim_wall_mm, 3.5);
  assert.equal(cfg.hub_ring_mm, 2.5);

  assert.equal(cfg.stage_mode, "compound_2stage");
  const metrics = computeGearboxMetrics(cfg);
  assert.equal(metrics.stage1_ratio, 4.0); // 60 / 15 = 4.0:1 (Gear 1 rotates on Gear 2 Pinion)
  assert.equal(metrics.stage2_ratio, 2.8); // 56 / 20 = 2.8:1 (Gear 2 Wheel drives Gear 3)
  assert.equal(metrics.total_ratio, 11.2); // 4.0 * 2.8 = 11.2:1 true 2-stage step-up
  assert.equal(metrics.g1_pitch_dia_mm, 75.0);
  assert.equal(metrics.g2_pinion_pitch_dia_mm, 18.75);
  assert.equal(metrics.g2_wheel_pitch_dia_mm, 70.0);
  assert.equal(metrics.g3_pitch_dia_mm, 25.0);
  assert.equal(metrics.center_distance_12_mm, 46.88); // 0.5 * (75 + 18.75) = 46.875 -> 46.88 mm
  assert.equal(metrics.center_distance_23_mm, 47.5);

  // Build 3D submeshes (Gear 1 elevated to mesh with Gear 2 Pinion, Gear 2 Compound, Gear 3 Pinion)
  const bundle = buildGearboxMeshes(cfg);
  assert.equal(bundle.submeshes.length, 7);
  assert.equal(bundle.submeshes.find((s) => s.id === "gear1-rim").base_z_mm, cfg.g2_wheel_face_mm);
  assert.equal(bundle.submeshes.find((s) => s.id === "gear2-wheel").spin_ratio, -4.0);
  assert.equal(bundle.submeshes.find((s) => s.id === "gear3-pinion").spin_ratio, 11.2);
  assert.ok(bundle.total_triangles > 3000, `expected > 3000 triangles, got ${bundle.total_triangles}`);

  // Verify Gear 3 helical angle flip produces different vertex geometry
  const g3PinionMesh = bundle.submeshes.find((s) => s.id === "gear3-pinion");
  assert.ok(g3PinionMesh, "Gear 3 pinion submesh must exist");
  const invertedG3Bundle = buildGearboxMeshes({ ...cfg, g3_helix_hand: -1 });
  const invertedG3Mesh = invertedG3Bundle.submeshes.find((s) => s.id === "gear3-pinion");
  assert.notDeepEqual(g3PinionMesh.positions, invertedG3Mesh.positions);

  // Verify Gear 2 solid vs spoked (0, 3, 4, 5, 6, 8 spokes) and custom Web Cutout geometry settings
  const g2SolidBundle = buildGearboxMeshes({ ...cfg, g2_spokes: 0 });
  const g2Spoke6Bundle = buildGearboxMeshes({
    ...cfg,
    g1_spokes: 6,
    g2_spokes: 6,
    spoke_width_pct: 20,
    rim_wall_mm: 4.5,
    hub_ring_mm: 3.0,
  });
  const g2WheelSolidTris = g2SolidBundle.submeshes.find((s) => s.id === "gear2-wheel").indices.length / 3;
  const g2WheelSpokedTris = bundle.submeshes.find((s) => s.id === "gear2-wheel").indices.length / 3;
  assert.ok(
    g2WheelSpokedTris > g2WheelSolidTris,
    `spoked Gear 2 wheel (${g2WheelSpokedTris} tris) should have inner/outer cutout walls vs solid (${g2WheelSolidTris} tris)`,
  );
  assert.equal(g2Spoke6Bundle.submeshes.length, 7);

  // Verify tooth solver for compound_2stage mode targeting 4.5:1
  const compoundSolved = solveGearTeethForTargetRatio(
    { ...cfg, stage_mode: "compound_2stage" },
    4.5,
  );
  const compMetrics = computeGearboxMetrics(compoundSolved);
  assert.ok(
    Math.abs(compMetrics.total_ratio - 4.5) < 0.25,
    `compound solved ratio ${compMetrics.total_ratio} should be close to 4.5`,
  );

  // Verify binary STL export for all 3 gears and individual gears
  for (const target of ["all", "gear1", "gear2", "gear3"]) {
    const stl = exportGearStlBytes(cfg, target);
    const triCount = new DataView(stl.buffer, stl.byteOffset, stl.byteLength).getUint32(80, true);
    assert.ok(triCount > 400, `STL target ${target} must have > 400 triangles`);
    assert.equal(stl.byteLength, 84 + triCount * 50, `STL byte length must match 84 + 50 * triCount`);
  }
});

test("Gearbox Studio workspace tab and interactive 3D gear settings inspector (T-105)", () => {
  // 1. Verify Workbench UI snapshot defaults and round-trip
  const defWb = defaultWorkbenchUiSnapshot();
  assert.equal(defWb.studio_mode, "blade");
  assert.equal(defWb.gearbox_selected_gear, null);
  assert.equal(defWb.gearbox_inspector_open, true);

  const snap = createWorkbenchSnapshot(
    initialDesign,
    {},
    { studio_mode: "gearbox", gearbox_selected_gear: 2, gearbox_inspector_open: true },
  );
  assert.equal(snap.workbench.studio_mode, "gearbox");
  assert.equal(snap.workbench.gearbox_selected_gear, 2);
  assert.equal(snap.workbench.gearbox_inspector_open, true);

  // 2. Verify HTML template layout separation
  const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
  assert.ok(html.includes('id="tab-studio-blade"'), "top dock must have Blade Studio tab");
  assert.ok(html.includes('id="tab-studio-gearbox"'), "top dock must have Gearbox Studio tab");
  assert.ok(html.includes('id="gearbox-toolbar-controls"'), "top dock must have Gearbox toolbar controls");
  assert.ok(html.includes('id="btn-toggle-gearbox-inspector"'), "must have toggle gearbox inspector button");
  assert.ok(html.includes('id="gearbox-inspector"'), "must have dedicated gearbox-inspector aside");
  assert.ok(html.includes('id="gearbox-quick-nav"'), "gearbox inspector must have quick gear navigation");
  assert.ok(html.includes('id="gear1-card"'), "gearbox inspector must have gear1-card");
  assert.ok(html.includes('id="gear2-card"'), "gearbox inspector must have gear2-card");
  assert.ok(html.includes('id="gear3-card"'), "gearbox inspector must have gear3-card");
  assert.ok(html.includes('id="g3-helix-hand"'), "Gear 3 card must have g3-helix-hand selector");

  // Verify CAD dock #panel does not contain layer-gearbox
  const panelStart = html.indexOf('<aside id="panel"');
  const panelEnd = html.indexOf('</aside>', panelStart);
  const panelHtml = html.slice(panelStart, panelEnd);
  assert.ok(!panelHtml.includes('id="layer-gearbox"'), "CAD panel must not contain layer-gearbox");
  assert.ok(!panelHtml.includes('data-scroll-target="layer-gearbox"'), "CAD section nav must not contain Gears button");
});




