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
  updateMinTrailingEdgeMm,
  updatePitchAxisRatio,
  updatePrimaryAirfoil,
  updateRotorField,
  upsertSavedSlot,
  applyBladeWindPreset,
  BLADE_WIND_PRESETS,
  defaultRulesetForGeneratorPreset,
  GENERATOR_PRESETS,
  isKidwindGeneratorPreset,
  KIDWIND_ASIA_2026_RULES,
  KIDWIND_OFFICIAL_RULES,
  optimizeGeneratorAndGearbox,
  defaultGearboxConfig,
  computeGearboxMetrics,
  solveGearTeethForTargetRatio,
  buildGearboxMeshes,
  exportGearStlBytes,
  defaultNoseConeConfig,
  initNoseConeKernel,
  computeNoseConeMetrics,
  buildNoseConeMeshes,
  exportNoseConeStlBytes,
  applyWingletToBladeGeometry,
  exportBufferGeometryStlBytes,
  snapSpanRatioToGrid,
  renderSectionStackSvgMarkup,
  UI_STYLE_STORAGE_KEY,
} from "../src/state.ts";
import {
  BLADELAB_GIST_FILENAME,
  BLADELAB_GIST_PREFIX,
  GITHUB_TOKEN_STORAGE_KEY,
  buildGistShareUrl,
  extractGistId,
  fetchBladeLabGist,
} from "../src/gist.ts";

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

  // 1b. Direct Blade Length reduction below 520 adapts overrides to remain valid on blade span
  const withRootOverride = structuredClone(initialDesign);
  withRootOverride.overrides = [
    { span_ratio: 60 / 580, chord_mm: 70, twist_deg: 20, airfoil: null },
  ];
  const shortBlade = updateBladeLengthMm(withRootOverride, 450);
  assert.equal(shortBlade.rotor.radius_mm, 510);
  const newHubRatio = 60 / 510;
  assert.ok(shortBlade.overrides[0].span_ratio >= newHubRatio - 1e-6);
  assert.ok(shortBlade.overrides[0].span_ratio <= 1.0 + 1e-6);

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
    const shortMesh = build_mesh(JSON.stringify(shortBlade), "{}");
    assert.ok(shortMesh.triangle_count > 0);
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

  // Verify in-browser STEP export and assembly STL/3MF export
  const {
    export_step,
    export_fabricated_step,
    export_all_split_step,
    export_part_stl_bytes,
    export_part_3mf_bytes,
  } = require(gluePath);
  const stepBlade = export_step(JSON.stringify(initialDesign), "blade");
  assert.ok(stepBlade.includes("MANIFOLD_SOLID_BREP"), "blade STEP has solid B-rep");
  assert.ok(stepBlade.includes("SI_UNIT(.MILLI.,.METRE.)"), "blade STEP has mm units");

  const stepAsm = export_step(JSON.stringify(initialDesign), "assembly");
  assert.ok(stepAsm.includes("MANIFOLD_SOLID_BREP"), "assembly STEP has solid B-rep");

  // Verify split STEP exports
  const smoothBladeStep = export_step(JSON.stringify(initialDesign), "blade");
  assert.ok(smoothBladeStep.includes("B_SPLINE_SURFACE_WITH_KNOTS"), "blade STEP is smooth B-spline");
  assert.equal((smoothBladeStep.match(/B_SPLINE_SURFACE_WITH_KNOTS/g) || []).length, 2, "2 B-spline surfaces for side and TE");
  assert.ok((smoothBladeStep.match(/PLANE/g) || []).length <= 4, "only 2 planar caps (root & tip), zero facet ripple");

  const splitFabJson = JSON.stringify({ split_parts: 3, split_ratio: 0.35, explode_gap_mm: 10.0 });
  const stepAllSplit = export_all_split_step(JSON.stringify(initialDesign), splitFabJson);
  assert.ok(stepAllSplit.includes("MANIFOLD_SOLID_BREP"), "all-split STEP has solid B-rep");
  assert.equal((stepAllSplit.match(/MANIFOLD_SOLID_BREP/g) || []).length, 3, "3 split B-rep solids");

  const stepPart0 = export_fabricated_step(
    JSON.stringify(initialDesign),
    JSON.stringify({ split_parts: 3, active_part: 0 }),
  );
  assert.ok(stepPart0.includes("MANIFOLD_SOLID_BREP"), "split part 0 STEP has solid B-rep");
  assert.equal((stepPart0.match(/MANIFOLD_SOLID_BREP/g) || []).length, 1, "1 split B-rep solid for part 0");

  // Verify split STEP exports with carbon fiber spar tube hole and interlocking joint features
  const fabWithTubeAndJoint = JSON.stringify({
    split_parts: 2,
    split_ratio: 0.5,
    spar_hole_diameter_mm: 5.0,
    spar_hole_depth_mm: 200.0,
    align_shape: "lip",
    active_part: 0,
  });
  const stepPart0WithFab = export_fabricated_step(JSON.stringify(initialDesign), fabWithTubeAndJoint);
  assert.ok(stepPart0WithFab.includes("MANIFOLD_SOLID_BREP"), "split part 0 with tube/joint has solid B-rep");
  assert.ok((stepPart0WithFab.match(/PLANE/g) || []).length > 500, "STEP contains tube hole cavity and joint faces");

  const asmStlBytes = export_part_stl_bytes(JSON.stringify(initialDesign), "assembly");
  assert.ok(asmStlBytes.byteLength > 100000, "assembly STL has valid length");

  const asm3mfBytes = export_part_3mf_bytes(JSON.stringify(initialDesign), "assembly");
  assert.equal(asm3mfBytes[0], 0x50, "assembly 3MF is valid zip");
  assert.equal(asm3mfBytes[1], 0x4b, "assembly 3MF is valid zip");
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

  // 1. Verify all 6 blade presets build valid 3D meshes and have tailored parameters
  for (const presetKey of [
    "asia_2026_scimitar",
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
  assert.ok(maxOut.opt_gear_ratio >= 1.0 && maxOut.opt_gear_ratio <= 16.0);
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
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
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

test("Parametric Winglets, Collective Pitch & Feathering, and Windward Impact Heatmap (T-105)", () => {
  const require = createRequire(import.meta.url);
  const { build_mesh, simulate_aero } = require("../../target/glue-node/blade_wasm.js");

  // 1. Windward Wind Impact & Stagnation Surface Pressure Heatmap
  const aeroJson = simulate_aero(
    JSON.stringify(initialDesign),
    JSON.stringify({ tsr_min: 1.5, tsr_max: 9.0, tsr_steps: 12 }),
  );
  const bundle = JSON.parse(aeroJson);
  const meshData = build_mesh(JSON.stringify(initialDesign), "{}");
  const vCount = Math.floor(meshData.positions.length / 3);

  // Synthesize normals: even pointing to lower windward face (-Y), odd pointing to upper suction face (+Y)
  const syntheticNormals = new Float32Array(vCount * 3);
  for (let i = 0; i < vCount; i++) {
    syntheticNormals[i * 3] = 0;
    syntheticNormals[i * 3 + 1] = i % 2 === 0 ? -1 : 1;
    syntheticNormals[i * 3 + 2] = 0;
  }

  const hmImpact = computeVertexHeatmapColors(
    meshData.positions,
    initialDesign,
    bundle,
    null,
    "wind_impact",
    syntheticNormals,
    0.0,
  );

  assert.equal(hmImpact.mode, "wind_impact");
  assert.equal(hmImpact.title, "Windward Impact & Surface Pressure (Pa)");
  assert.ok(hmImpact.minLabel.includes("Suction Lift"));
  assert.ok(hmImpact.maxLabel.includes("Stagnation Impact"));
  assert.ok(hmImpact.gradientCss.includes("#1e3a8a"));
  assert.ok(hmImpact.gradientCss.includes("#ef4444"));
  assert.equal(hmImpact.colors.length, meshData.positions.length);

  // Check RGB ranges and contrast:
  // Even vertex has ny = -1 (lower face facing incoming flow) -> warm stagnation impact (R >= B)
  // Odd vertex has ny = +1 (upper suction side) -> cool suction lift (B >= R)
  for (let i = 0; i < vCount; i++) {
    const r = hmImpact.colors[i * 3];
    const g = hmImpact.colors[i * 3 + 1];
    const b = hmImpact.colors[i * 3 + 2];
    assert.ok(r >= 0 && r <= 1, `red out of bounds at ${i}`);
    assert.ok(g >= 0 && g <= 1, `green out of bounds at ${i}`);
    assert.ok(b >= 0 && b <= 1, `blue out of bounds at ${i}`);

    if (i % 2 === 0) {
      assert.ok(r >= b, `windward vertex ${i} should have warm color (r >= b): r=${r}, b=${b}`);
    } else {
      assert.ok(b >= r, `leeward suction vertex ${i} should have cool color (b >= r): b=${b}, r=${r}`);
    }
  }

  // 2. Parametric Winglet / Up-Turned Blade Tip
  const rTip = initialDesign.rotor.radius_mm; // 600 mm
  const blendR = 25;
  const zStart = rTip - blendR; // 575 mm

  // Position buffer with root, mid, blend-start, and tip points
  const testPositions = new Float32Array([
    0, 0, 60,       // root
    10, 0, 300,     // mid
    5, 0, zStart,   // exact blend transition start
    0, 0, rTip,     // tip
  ]);
  const originalCopy = new Float32Array(testPositions);

  // When disabled: no changes
  applyWingletToBladeGeometry(testPositions, initialDesign, {
    enabled: false,
    cant_angle_deg: 50,
    height_mm: 30,
    sweep_angle_deg: 15,
    blend_radius_mm: blendR,
  });
  for (let i = 0; i < testPositions.length; i++) {
    assert.equal(testPositions[i], originalCopy[i], "disabled winglet must not modify coordinates");
  }

  // When enabled: root and mid are strictly untouched; tip is deflected
  applyWingletToBladeGeometry(testPositions, initialDesign, {
    enabled: true,
    cant_angle_deg: 50,
    height_mm: 30,
    sweep_angle_deg: 15,
    blend_radius_mm: blendR,
  });

  // Root (i=0) and Mid (i=1) and transition point (i=2) must be unchanged
  assert.equal(testPositions[0], originalCopy[0]);
  assert.equal(testPositions[1], originalCopy[1]);
  assert.equal(testPositions[2], originalCopy[2]);
  assert.equal(testPositions[3], originalCopy[3]);
  assert.equal(testPositions[4], originalCopy[4]);
  assert.equal(testPositions[5], originalCopy[5]);
  assert.equal(testPositions[6], originalCopy[6]);
  assert.equal(testPositions[7], originalCopy[7]);
  assert.equal(testPositions[8], originalCopy[8]);

  // Tip (i=3) must have positive out-of-plane dihedral bend (+Y) and backward sweep (+X)
  const tipX = testPositions[9];
  const tipY = testPositions[10];
  const tipZ = testPositions[11];
  assert.ok(tipY > 15, `expected tip upward dihedral deflection > 15 mm, got ${tipY}`);
  assert.ok(tipX > 5, `expected tip backward sweep deflection > 5 mm, got ${tipX}`);
  assert.ok(tipZ <= rTip + 0.001, `tip span should curve smoothly within radius: ${tipZ}`);

  // 3. Binary STL Export of BufferGeometry
  const flatPositions = new Float32Array([
    0, 0, 0,  10, 0, 0,  0, 10, 0, // Triangle 1
    10, 0, 0, 10, 10, 0, 0, 10, 0, // Triangle 2
  ]);
  const stlBytes = exportBufferGeometryStlBytes(flatPositions, "BladeLab Winglet Test STL");
  assert.equal(stlBytes.byteLength, 84 + 2 * 50);
  const stlView = new DataView(stlBytes.buffer, stlBytes.byteOffset, stlBytes.byteLength);
  assert.equal(stlView.getUint32(80, true), 2, "triangle count in header must be 2");
  // Triangle 1 normal should point along +Z (0, 0, 1)
  assert.ok(Math.abs(stlView.getFloat32(84 + 8, true) - 1.0) < 1e-4);

  // 4. Workbench Snapshot round-trip for Collective Pitch & Winglets
  const defWb = defaultWorkbenchUiSnapshot();
  assert.equal(defWb.collective_pitch_deg, 0.0);
  assert.equal(defWb.winglet.enabled, false);
  assert.equal(defWb.winglet.cant_angle_deg, 50.0);
  assert.equal(defWb.flip_blade, true);

  const customSnap = createWorkbenchSnapshot(
    initialDesign,
    {},
    {
      collective_pitch_deg: 4.0,
      flip_blade: true,
      winglet: {
        enabled: true,
        cant_angle_deg: 65,
        height_mm: 35,
        sweep_angle_deg: 18,
        blend_radius_mm: 20,
      },
    },
  );
  assert.equal(customSnap.workbench.collective_pitch_deg, 4.0);
  assert.equal(customSnap.workbench.flip_blade, true);
  assert.equal(customSnap.workbench.winglet?.enabled, true);
  assert.equal(customSnap.workbench.winglet?.cant_angle_deg, 65);
  assert.equal(customSnap.workbench.winglet?.height_mm, 35);

  // 5. HTML Elements Verification
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  assert.ok(html.includes('value="wind_impact"'), "Heatmap dropdown must contain wind_impact option");
  assert.ok(html.includes('id="collective-pitch-toolbar-group"'), "Toolbar must contain collective-pitch-toolbar-group");
  assert.ok(html.includes('id="tb-collective-pitch"'), "Toolbar must contain tb-collective-pitch slider");
  assert.ok(html.includes('id="btn-pitch-feather"'), "Toolbar must contain btn-pitch-feather button");
  assert.ok(html.includes('id="btn-flip-blade"'), "Toolbar must contain btn-flip-blade button");
  assert.ok(html.includes('id="btn-flip-blade-panel"'), "Rotor panel must contain btn-flip-blade-panel button");
  assert.ok(html.includes('id="rotor-collective-pitch"'), "Rotor panel must contain rotor-collective-pitch slider");
  assert.ok(html.includes('id="btn-pitch-run"'), "Rotor panel must contain btn-pitch-run button");
  assert.ok(html.includes('id="btn-pitch-start"'), "Rotor panel must contain btn-pitch-start button");
  assert.ok(html.includes('id="btn-pitch-feather-panel"'), "Rotor panel must contain btn-pitch-feather-panel button");
  assert.ok(html.includes('id="winglet-enabled"'), "Rotor panel must contain winglet-enabled checkbox");
  assert.ok(html.includes('id="winglet-controls-subbox"'), "Rotor panel must contain winglet-controls-subbox container");
  assert.ok(html.includes('id="winglet-cant"'), "Rotor panel must contain winglet-cant input");
  assert.ok(html.includes('id="winglet-height"'), "Rotor panel must contain winglet-height input");
  assert.ok(html.includes('id="winglet-sweep"'), "Rotor panel must contain winglet-sweep input");
  assert.ok(html.includes('id="winglet-radius"'), "Rotor panel must contain winglet-radius input");
});

test("GitHub Gists Cloud integration: constants, share URLs, and DOM elements (T-105)", () => {
  // 1. Constants
  assert.equal(BLADELAB_GIST_FILENAME, "bladelab-design.json");
  assert.equal(BLADELAB_GIST_PREFIX, "[BladeLab] ");
  assert.equal(GITHUB_TOKEN_STORAGE_KEY, "bladelab.github_token");

  // 2. Share URL builder and extractGistId parser
  const shareUrl = buildGistShareUrl("7fa4b12c890");
  assert.ok(shareUrl.includes("?gist=7fa4b12c890"), `URL must contain gist query param: ${shareUrl}`);

  assert.equal(extractGistId("7fa4b12c890"), "7fa4b12c890");
  assert.equal(extractGistId("https://gist.github.com/Pannawat2008/7fa4b12c890"), "7fa4b12c890");
  assert.equal(extractGistId("https://gist.github.com/7fa4b12c890"), "7fa4b12c890");
  assert.equal(extractGistId("https://gist.githubusercontent.com/Pannawat2008/7fa4b12c890/raw/abc"), "7fa4b12c890");
  assert.equal(extractGistId("https://api.github.com/gists/7fa4b12c890"), "7fa4b12c890");
  assert.equal(extractGistId("https://site.com/?gist=7fa4b12c890"), "7fa4b12c890");
  assert.equal(extractGistId("?gist=https%3A%2F%2Fgist.github.com%2Fuser%2F7fa4b12c890"), "7fa4b12c890");

  // 3. snapSpanRatioToGrid prevents float-rounding mismatch with kernel RATIO_EPS
  const testRotor = {
    radius_mm: 600,
    hub_radius_mm: 50,
    blade_count: 3,
    design_tsr: 6.0,
    wind_speed_mps: 10.0,
    station_count: 16,
    pitch_axis_ratio: 0.3,
  };
  const expectedHub = 50 / 600;
  assert.equal(snapSpanRatioToGrid(0.083333, testRotor), expectedHub);
  assert.equal(snapSpanRatioToGrid(0.0833333, testRotor), expectedHub);
  const expectedSt1 = expectedHub + (1 - expectedHub) * 1 / 15;
  assert.equal(snapSpanRatioToGrid(0.144444, testRotor), expectedSt1);
  assert.equal(snapSpanRatioToGrid(0.999999, testRotor), 1.0);

  // 4. Mock Gist JSON round-trip through parseLoadedProjectJson
  const mockGistContent = JSON.stringify({
    schema_version: 1,
    design: initialDesign,
    fabrication: defaultFabricationSnapshot(),
    workbench: defaultWorkbenchUiSnapshot(),
    saved_at: "2026-11-09T17:30:00Z",
    name: "Gist Competition Blade",
  });
  const parsed = parseLoadedProjectJson(mockGistContent);
  assert.equal(parsed.name, "Gist Competition Blade");
  assert.equal(parsed.design.rotor.radius_mm, initialDesign.rotor.radius_mm);

  // 5. HTML Elements Verification
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  assert.ok(html.includes('id="tab-drawer-gist"'), "Projects drawer must contain tab-drawer-gist button");
  assert.ok(html.includes('id="tab-drawer-local"'), "Projects drawer must contain tab-drawer-local button");
  assert.ok(html.includes('id="drawer-gist-panel"'), "Projects drawer must contain drawer-gist-panel");
  assert.ok(html.includes('id="gist-token-input"'), "Projects drawer must contain gist-token-input");
  assert.ok(html.includes('id="btn-gist-connect"'), "Projects drawer must contain btn-gist-connect button");
  assert.ok(html.includes('id="gist-load-input"'), "Projects drawer must contain gist-load-input for pasting Gist link or ID");
  assert.ok(html.includes('id="btn-gist-load"'), "Projects drawer must contain btn-gist-load button");
  assert.ok(html.includes('id="gist-load-status"'), "Projects drawer must contain gist-load-status");
  assert.ok(html.includes('id="btn-gist-refresh"'), "Projects drawer must contain btn-gist-refresh button");
  assert.ok(html.includes('id="btn-gist-disconnect"'), "Projects drawer must contain btn-gist-disconnect button");
  assert.ok(html.includes('id="btn-save-gist"'), "Projects drawer must contain btn-save-gist button");
  assert.ok(html.includes('id="gist-designs-list"'), "Projects drawer must contain gist-designs-list");
  assert.ok(html.includes('id="btn-cloud-open-drawer"'), "Aero dock must contain btn-cloud-open-drawer button");
});

test("Task 5 security: evalFormulaPreview blocks JS execution and evaluates math safely", () => {
  const rotor = initialDesign.rotor;
  delete globalThis.__xss_formula_test;
  const injected = evalFormulaPreview("(globalThis.__xss_formula_test = true, 42)", rotor, 0.5, 0.5);
  assert.equal(globalThis.__xss_formula_test, undefined, "formula evaluator must NEVER execute arbitrary JS");
  assert.equal(injected, 0);

  // Standard mathematical formulas including unary minus with exponentiation (-s^2 = -(s^2))
  assert.ok(Math.abs(evalFormulaPreview("60 - 25 * s", rotor, 0.55, 0.5) - 47.5) < 1e-9);
  assert.ok(Math.abs(evalFormulaPreview("-s^2 + 70", rotor, 0.55, 0.5) - 69.75) < 1e-9);
  assert.ok(Math.abs(evalFormulaPreview("2^-3", rotor, 0.55, 0.5) - 0.125) < 1e-9);
  assert.ok(Math.abs(evalFormulaPreview("2^3^2", rotor, 0.55, 0.5) - 512) < 1e-9);
  assert.ok(Math.abs(evalFormulaPreview("cos(pi * s)", rotor, 0.55, 1.0) - -1.0) < 1e-9);
  assert.ok(
    Math.abs(evalFormulaPreview("deg(atan2(1, tsr * x))", rotor, 0.5, 0.4444) - (Math.atan2(1, rotor.design_tsr * 0.5) * 180) / Math.PI) < 1e-9,
  );
  assert.ok(Math.abs(evalFormulaPreview("pow(2, 3) + abs(-4) + sqrt(9)", rotor, 0.5, 0.5) - 15) < 1e-9);
  assert.ok(Math.abs(evalFormulaPreview("max(10, min(25, r_hub))", rotor, 0.5, 0.5) - 25) < 1e-9);
});

test("Task 5 security: renderAirfoilSectionSvgMarkup escapes HTML/SVG injection in airfoil name", () => {
  const malicious = updatePrimaryAirfoil(initialDesign, {
    type: "named",
    name: "</text><image href=x onerror=alert(1)><text>",
  });
  const svg = renderAirfoilSectionSvgMarkup(malicious);
  assert.ok(!svg.includes("<image"), "raw <image tag must not appear in SVG output");
  assert.ok(svg.includes("&lt;image"), "injected markup must be HTML-escaped");
});

test("Task 5 gearbox: watertight outward normals (0 inconsistent edges, positive volume) & exact meshing", () => {
  const cfg = defaultGearboxConfig();
  const bundle = buildGearboxMeshes(cfg);

  for (const sub of bundle.submeshes) {
    const { positions, indices } = sub;
    const directedEdges = new Map();
    let signedVol6 = 0;

    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];

      const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
      const bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];
      const cx = positions[c * 3], cy = positions[c * 3 + 1], cz = positions[c * 3 + 2];
      signedVol6 +=
        ax * (by * cz - bz * cy) +
        ay * (bz * cx - bx * cz) +
        az * (bx * cy - by * cx);

      for (const [u, v] of [
        [a, b],
        [b, c],
        [c, a],
      ]) {
        const key = `${u},${v}`;
        directedEdges.set(key, (directedEdges.get(key) ?? 0) + 1);
      }
    }

    let inconsistent = 0;
    let boundary = 0;
    for (const [key, count] of directedEdges.entries()) {
      if (count > 1) inconsistent += count - 1;
      const [u, v] = key.split(",");
      if (!directedEdges.has(`${v},${u}`)) boundary++;
    }

    assert.equal(inconsistent, 0, `${sub.id}: expected 0 inconsistently wound shared edges, got ${inconsistent}`);
    assert.equal(boundary, 0, `${sub.id}: expected 0 boundary edges (watertight), got ${boundary}`);
    assert.ok(signedVol6 > 0, `${sub.id}: expected positive signed volume (outward normals), got ${signedVol6 / 6}`);
  }

  // Default Gear 2 Pinion has Z=15 (odd), so at world theta=pi it ALREADY has a valley when mesh_phase_rad === 0
  const g2Pinion = bundle.submeshes.find((s) => s.id === "gear2-pinion");
  assert.equal(g2Pinion.mesh_phase_rad, 0, "odd-tooth Gear 2 Pinion (15T) must have mesh_phase_rad === 0 so valley sits at pi");

  // Even-tooth Gear 2 Pinion (16T) must have mesh_phase_rad === pi/16, and Gear 3 phase must co-rotate by -(z2w/z3)*g2Phase
  const evenBundle = buildGearboxMeshes({ ...cfg, g2_pinion_teeth: 16 });
  const g2Even = evenBundle.submeshes.find((s) => s.id === "gear2-pinion");
  const g3Even = evenBundle.submeshes.find((s) => s.id === "gear3-pinion");
  assert.ok(Math.abs(g2Even.mesh_phase_rad - Math.PI / 16) < 1e-9);
  const expectedG3Even = Math.PI / cfg.g3_teeth - (cfg.g2_wheel_teeth / cfg.g3_teeth) * (Math.PI / 16);
  assert.ok(Math.abs(g3Even.mesh_phase_rad - expectedG3Even) < 1e-9);

  // Direct 1-stage mode: Gear 3 meshes directly with Gear 1 (+1 RH), so Gear 3 must use opposing -1 LH helix
  const directBundle = buildGearboxMeshes({ ...cfg, stage_mode: "direct_1stage", g3_helix_hand: 1 });
  const directG3 = directBundle.submeshes.find((s) => s.id === "gear3-pinion");
  const compoundG3Lh = buildGearboxMeshes({ ...cfg, stage_mode: "compound_2stage", g3_helix_hand: -1 }).submeshes.find(
    (s) => s.id === "gear3-pinion",
  );
  assert.deepEqual(
    Array.from(directG3.positions),
    Array.from(compoundG3Lh.positions),
    "direct_1stage Gear 3 must oppose Gear 1 (+1 RH) with -1 LH helix",
  );

  // Exact unrounded spin_ratio (e.g. 60/14 = 4.2857142857..., not 4.286)
  const exactCfg = { ...cfg, g1_teeth: 60, g2_pinion_teeth: 14, g2_wheel_teeth: 56, g3_teeth: 19 };
  const exactBundle = buildGearboxMeshes(exactCfg);
  const g2Exact = exactBundle.submeshes.find((s) => s.id === "gear2-wheel");
  const g3Exact = exactBundle.submeshes.find((s) => s.id === "gear3-pinion");
  assert.ok(Math.abs(g2Exact.spin_ratio - -(60 / 14)) < 1e-12, `expected exact -60/14, got ${g2Exact.spin_ratio}`);
  assert.ok(
    Math.abs(g3Exact.spin_ratio - (60 / 14) * (56 / 19)) < 1e-12,
    `expected exact (60/14)*(56/19), got ${g3Exact.spin_ratio}`,
  );
});

test("Task 5 heatmaps: radial span_ratio mapping, wind_impact twist_deg + qLocal, and wall_stress lookup", () => {
  const bigHubDesign = structuredClone(initialDesign);
  bigHubDesign.rotor.hub_radius_mm = 150;
  bigHubDesign.rotor.radius_mm = 600;
  const mockBundle = {
    design_point: {
      rpm: 600,
      cp: 0.42,
      ct: 0.7,
      cq: 0.08,
      power_w: 120,
      thrust_n: 20,
      torque_nm: 1.9,
      stations: [
        { span_ratio: 0.25, radius_mm: 150, chord_mm: 70, twist_deg: 25, inflow_angle_deg: 35, alpha_deg: 1.0, axial_induction: 0.2, tangential_induction: 0.05, tip_loss_factor: 1, reynolds: 5e4, cl: 0.4, cd: 0.04, cn: 0.4, ct: 0.1, relative_speed_mps: 10, thrust_per_m_n: 10, torque_per_m_nm: 1 },
        { span_ratio: 0.42, radius_mm: 252, chord_mm: 60, twist_deg: 15, inflow_angle_deg: 22, alpha_deg: 13.0, axial_induction: 0.3, tangential_induction: 0.02, tip_loss_factor: 1, reynolds: 8e4, cl: 1.2, cd: 0.015, cn: 1.2, ct: 0.3, relative_speed_mps: 20, thrust_per_m_n: 30, torque_per_m_nm: 4 },
        { span_ratio: 1.0, radius_mm: 600, chord_mm: 35, twist_deg: 2, inflow_angle_deg: 8, alpha_deg: 6.0, axial_induction: 0.33, tangential_induction: 0.01, tip_loss_factor: 0.9, reynolds: 1.2e5, cl: 0.9, cd: 0.012, cn: 0.9, ct: 0.2, relative_speed_mps: 45, thrust_per_m_n: 50, torque_per_m_nm: 6 },
      ],
    },
    sweep: [],
    peak_cp: 0.42,
    peak_tsr: 4.5,
    peak_power_w: 120,
  };

  const positions = new Float32Array([0, 0, 150, 0, 0, 252]);
  const alphaHm = computeVertexHeatmapColors(positions, bigHubDesign, mockBundle, null, "alpha");
  const diffAlpha =
    Math.abs(alphaHm.colors[0] - alphaHm.colors[3]) +
    Math.abs(alphaHm.colors[1] - alphaHm.colors[4]) +
    Math.abs(alphaHm.colors[2] - alphaHm.colors[5]);
  assert.ok(diffAlpha > 0.5, `z=150 (alpha=1°) and z=252 (alpha=13°) must have distinct colors; got diff=${diffAlpha}`);

  const bundleTwistA = structuredClone(mockBundle);
  const bundleTwistB = structuredClone(mockBundle);
  for (const st of bundleTwistA.design_point.stations) st.twist_deg = 0;
  for (const st of bundleTwistB.design_point.stations) st.twist_deg = 22;
  const impactPos = new Float32Array([0, -2, 300, 0, -2, 580]);
  const impactNorm = new Float32Array([0, -1, 0, 0, -1, 0]);
  const hmA = computeVertexHeatmapColors(impactPos, bigHubDesign, bundleTwistA, null, "wind_impact", impactNorm, 0);
  const hmB = computeVertexHeatmapColors(impactPos, bigHubDesign, bundleTwistB, null, "wind_impact", impactNorm, 0);
  const twistDelta =
    Math.abs(hmA.colors[0] - hmB.colors[0]) +
    Math.abs(hmA.colors[1] - hmB.colors[1]) +
    Math.abs(hmA.colors[2] - hmB.colors[2]);
  assert.ok(twistDelta > 0.02, `wind_impact must depend on twist_deg (not alpha_deg); got delta=${twistDelta}`);

  const bundleConstTwist = structuredClone(mockBundle);
  for (const st of bundleConstTwist.design_point.stations) {
    st.twist_deg = 5;
    st.alpha_deg = 6;
  }
  const hmRadial = computeVertexHeatmapColors(impactPos, bigHubDesign, bundleConstTwist, null, "wind_impact", impactNorm, 0);
  const radialDelta =
    Math.abs(hmRadial.colors[0] - hmRadial.colors[3]) +
    Math.abs(hmRadial.colors[1] - hmRadial.colors[4]) +
    Math.abs(hmRadial.colors[2] - hmRadial.colors[5]);
  assert.ok(radialDelta > 0.02, `wind_impact must reflect radial dynamic pressure qLocal; got delta=${radialDelta}`);
});

test("Task 5 snapshots, winglet geometry, printer fit, and gist safety", async () => {
  const incomplete = structuredClone(initialDesign);
  delete incomplete.overrides;
  assert.throws(() => parseLoadedProjectJson(JSON.stringify(incomplete)));
  const noHub = structuredClone(initialDesign);
  delete noHub.hub;
  assert.throws(() => parseLoadedProjectJson(JSON.stringify(noHub)));

  const merged = createWorkbenchSnapshot(initialDesign, {}, { winglet: { enabled: true }, gearbox: { g1_teeth: 48 } });
  assert.equal(merged.workbench.winglet.enabled, true);
  assert.equal(merged.workbench.winglet.cant_angle_deg, 50.0);
  assert.equal(merged.workbench.gearbox.g1_teeth, 48);
  assert.equal(merged.workbench.gearbox.g3_teeth, 20);

  const zeroSweepPts = new Float32Array([0, 0, 585, 0, 0, 600]);
  applyWingletToBladeGeometry(zeroSweepPts, initialDesign, {
    enabled: true,
    cant_angle_deg: 50,
    height_mm: 30,
    sweep_angle_deg: 0,
    blend_radius_mm: 20,
  });
  assert.equal(zeroSweepPts[3], 0, "sweep_angle_deg: 0 must produce dx === 0 (not fallback 10°)");

  const highCantPts = new Float32Array([0, 0, 560, 0, 0, 570, 0, 0, 580, 0, 0, 590, 0, 0, 600]);
  applyWingletToBladeGeometry(highCantPts, initialDesign, {
    enabled: true,
    cant_angle_deg: 75,
    height_mm: 10,
    sweep_angle_deg: 0,
    blend_radius_mm: 40,
  });
  for (let i = 1; i < 5; i++) {
    assert.ok(
      highCantPts[i * 3 + 2] >= highCantPts[(i - 1) * 3 + 2] - 1e-6,
      `winglet z must remain monotonically non-decreasing (no backward fold): z[${i - 1}]=${highCantPts[(i - 1) * 3 + 2]} > z[${i}]=${highCantPts[i * 3 + 2]}`,
    );
  }

  const fitDesign = updateBladeLengthMm(initialDesign, 508);
  const fab1 = { ...defaultFabricationSnapshot(), split_parts: 1, align_shape: "contour", align_height_mm: 8 };
  const fit1 = evaluatePrinterBuildFit(fitDesign, fab1, "bambu_256");
  assert.equal(fit1.all_fit, false);
  assert.equal(fit1.recommended_split_parts, 3, "508 mm blade with 8 mm split lip needs 3 parts on 256 mm Z bed");
  const fitAfter = evaluatePrinterBuildFit(fitDesign, { ...fab1, split_parts: fit1.recommended_split_parts }, "bambu_256");
  assert.equal(fitAfter.all_fit, true, "recommended_split_parts must fit on the first click");

  const wideChordDesign = applyLinearLayer1(clearAllOverrides(updateBladeLengthMm(initialDesign, 200)), 400, 400, 15, 3);
  const xyFail = evaluatePrinterBuildFit(wideChordDesign, { ...defaultFabricationSnapshot(), split_parts: 1 }, "bambu_256");
  assert.equal(xyFail.all_fit, false);
  assert.ok(!xyFail.summary.includes("-"), `XY-only failure must not report negative Z exceedance: ${xyFail.summary}`);

  assert.doesNotThrow(() => extractGistId("?gist=%E0%A4%A"));

  const origFetch = globalThis.fetch;
  const fullPayload = JSON.stringify(createWorkbenchSnapshot(initialDesign, {}, {}, "Truncated Test"));
  let rawFetched = false;
  globalThis.fetch = async (url) => {
    const s = String(url);
    if (s.includes("api.github.com/gists/")) {
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          id: "abc1234",
          description: "[BladeLab] Truncated Test",
          html_url: "https://gist.github.com/abc1234",
          files: {
            [BLADELAB_GIST_FILENAME]: {
              filename: BLADELAB_GIST_FILENAME,
              truncated: true,
              content: fullPayload.slice(0, 40),
              raw_url: "https://gist.githubusercontent.com/raw/abc1234/bladelab-design.json",
            },
          },
        }),
      };
    }
    rawFetched = true;
    return { ok: true, status: 200, statusText: "OK", text: async () => fullPayload };
  };
  try {
    const loaded = await fetchBladeLabGist("abc1234");
    assert.equal(rawFetched, true, "truncated gist file must fetch raw_url");
    assert.equal(loaded.name, "Truncated Test");
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("Task 6: CSS design tokens/classes, hub diameter sync, WASM fabricated STEP parity & main.ts safeguards", () => {
  // 1. index.html defines all referenced CSS tokens and utility classes without duplicate .table-wrap
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  assert.ok(html.includes("--radius-sm:"), "index.html :root must define --radius-sm");
  assert.ok(html.includes("--bg-hover:"), "index.html :root must define --bg-hover");
  assert.ok(/\.grid-3\s*\{/.test(html), "index.html must define .grid-3 CSS rule");
  assert.ok(/\.btn-secondary\b[^{]*\{/.test(html), "index.html must define .btn-secondary CSS rule");
  const tableWrapMatches = html.match(/^\s*\.table-wrap\s*\{/gm) || [];
  assert.equal(tableWrapMatches.length, 1, `expected 1 .table-wrap rule, found ${tableWrapMatches.length}`);

  // 2. Updating hub_radius_mm syncs hub.diameter_mm = 2 * hub_radius_mm
  const smallHub = updateRotorField(initialDesign, "hub_radius_mm", 45);
  assert.equal(smallHub.hub.diameter_mm, 90, "hub.diameter_mm must stay synced with 2 * rotor.hub_radius_mm");

  // 3. Rebuilt WASM export_fabricated_step supports unsplit features + exploded split STEP
  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  assert.ok(fs.existsSync(gluePath), "blade_wasm.js node glue must exist");
  const require = createRequire(import.meta.url);
  const { export_fabricated_step } = require(gluePath);
  const unsplitFabStep = export_fabricated_step(
    JSON.stringify(initialDesign),
    JSON.stringify({ spar_hole_diameter_mm: 5.0, spar_hole_depth_mm: 240, step_mode: "features" }),
  );
  const planeCount = (unsplitFabStep.match(/PLANE\(/g) || []).length;
  assert.ok(planeCount > 500, `unsplit features STEP must carry spar bore geometry, got ${planeCount} PLANEs`);

  const explodedStep = export_fabricated_step(
    JSON.stringify(initialDesign),
    JSON.stringify({ split_parts: 2, split_ratio: 0.5, explode_gap_mm: 20, step_mode: "features" }),
  );
  // Extract max Z coordinate across all CARTESIAN_POINTs in exploded STEP
  let maxZ = -Infinity;
  for (const m of explodedStep.matchAll(/CARTESIAN_POINT\s*\(\s*'[^']*'\s*,\s*\([^,]+,[^,]+,([^)]+)\)\s*\)/g)) {
    const z = Number.parseFloat(m[1]);
    if (Number.isFinite(z) && z > maxZ) maxZ = z;
  }
  assert.ok(
    maxZ >= initialDesign.rotor.radius_mm + 19.0,
    `exploded split STEP must translate upper part by explode_gap_mm (20 mm), got maxZ=${maxZ}`,
  );

  // 4. main.ts structural safeguards (disposal, no dead STEP tautology, no unused export_all_split_step, safe PAT handling)
  const mainTs = fs.readFileSync(path.resolve(__dirname, "../src/main.ts"), "utf8");
  assert.ok(mainTs.includes("function disposeObject3D("), "main.ts must define recursive GPU disposeObject3D helper");
  assert.ok(mainTs.includes("data.free()"), "main.ts must free WASM MeshData in rebuild3D");
  assert.ok(
    !mainTs.includes('part === "blade" || part === "assembly" || part === "hub"'),
    "main.ts must not contain dead tautology blocking export_fabricated_step",
  );
  assert.ok(!mainTs.includes("export_all_split_step"), "main.ts must not import unused export_all_split_step");
  assert.ok(mainTs.includes("activeGistId"), "main.ts must track activeGistId for PATCH updates");

  // 5. Exploded winglet preserves monotonic Z across split gap without pancaking at z >= rTip
  const wingletCfg = {
    enabled: true,
    cant_angle_deg: 55,
    height_mm: 25,
    sweep_angle_deg: 10,
    blend_radius_mm: 25,
  };
  const explodedPts = new Float32Array([
    0, 0, 580,
    0, 0, 600,
    0, 0, 610,
    0, 0, 620,
    0, 0, 630,
  ]);
  applyWingletToBladeGeometry(explodedPts, initialDesign, wingletCfg);
  for (let i = 1; i < 5; i++) {
    assert.ok(
      explodedPts[i * 3 + 2] > explodedPts[(i - 1) * 3 + 2] + 1.0,
      `exploded winglet must stay strictly increasing in z without flat collapse: z[${i - 1}]=${explodedPts[(i - 1) * 3 + 2]}, z[${i}]=${explodedPts[i * 3 + 2]}`,
    );
  }
  assert.equal(explodedPts[0], 0, "vertices below zTip - blendR remain unbent");
  assert.ok(explodedPts[13] > 15, "exploded tip y bends upward smoothly");

  // Isolated root segment (active_part = 0, z <= 330 < rTip = 600) must remain untouched
  const rootOnly = new Float32Array([0, 0, 60, 0, 0, 330]);
  applyWingletToBladeGeometry(rootOnly, initialDesign, wingletCfg);
  assert.deepEqual(Array.from(rootOnly), [0, 0, 60, 0, 0, 330], "isolated root segment must not be bent by winglet");

  // 6. main.ts restores lockedSpanRatios when slider returns to start & clears activeGistId on local JSON/slot load
  assert.match(
    mainTs,
    /const changed = Math\.abs\(newHub - oldHub\) > RATIO_EPS;[\s\S]*?: bladeLenDragBaseLocked\[i\]!/,
    "sliderBladeLength must restore bladeLenDragBaseLocked[i]! when returned to initial length",
  );
  assert.ok(
    (mainTs.match(/activeGistId = null;\s*activeGistName = null;/g) || []).length >= 6,
    "activeGistId/Name must be cleared on disconnect, auth rejection, delete, reset, local JSON load, and local slot load",
  );
});

test("Task 7 (/ui-taste): Focus Workbench DOM integrity, zero chrome emoji, and focused tab layout", () => {
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  const mainTs = fs.readFileSync(path.resolve(__dirname, "../src/main.ts"), "utf8");

  // 1. Zero chrome emoji glyphs in UI markup (inline stroke SVGs only)
  assert.ok(!html.includes("⚙"), "index.html must not contain ⚙ emoji in chrome");
  assert.ok(!html.includes("▶"), "index.html must not contain ▶ emoji in chrome");

  // 2. Focus Workbench architectural containers exist
  assert.ok(html.includes('id="viewport-stage-bar"'), "index.html must include floating bottom #viewport-stage-bar");
  assert.ok(html.includes('id="rotor-radius-slider"'), "index.html must include #rotor-radius-slider");
  assert.ok(html.includes('id="rotor-hub-slider"'), "index.html must include #rotor-hub-slider");
  assert.ok(html.includes('id="rotor-blades-slider"'), "index.html must include #rotor-blades-slider");
  assert.ok(html.includes('id="hud-mesh-ms"'), "index.html must include #hud-mesh-ms in datum pill");
  assert.ok(html.includes("tab-active"), "focused section tabs must use .tab-active single-pane display");

  // 3. Every static document.getElementById("...") in main.ts resolves to a real id in index.html
  const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const missingIds = [];
  for (const m of mainTs.matchAll(/document\.getElementById\("([^"]+)"\)/g)) {
    const id = m[1];
    if (!htmlIds.has(id)) {
      missingIds.push(id);
    }
  }
  assert.deepEqual(missingIds, [], `missing DOM IDs in index.html: ${missingIds.join(", ")}`);
});

test("Task 8: Atelier Blueprint UI style mode, dual-theme SVGs, and 4-step wizard DOM integrity", () => {
  // 1. Default ui_style & storage key + snapshot round-trip
  assert.equal(UI_STYLE_STORAGE_KEY, "bladelab:ui-style:v1");
  const defWb = defaultWorkbenchUiSnapshot();
  assert.equal(defWb.ui_style, "atelier");
  const darkSnap = createWorkbenchSnapshot(initialDesign, {}, { ui_style: "dark" });
  assert.equal(darkSnap.workbench.ui_style, "dark");

  // 2. Dual-theme SVG generators emit Atelier Cobalt (#1d4ed8) & Vermilion (#e8451e) while preserving dark defaults
  const sampleSweep = [
    { tsr: 2.0, cp: 0.21, ct: 0.45, cq: 0.1, rpm: 250, power_w: 80, axial_thrust_n: 12 },
    { tsr: 4.5, cp: 0.43, ct: 0.78, cq: 0.095, rpm: 570, power_w: 220, axial_thrust_n: 26 },
  ];
  const darkCpSvg = renderCpTsrSvgMarkup(sampleSweep);
  const atelierCpSvg = renderCpTsrSvgMarkup(sampleSweep, { theme: "atelier" });
  assert.ok(darkCpSvg.includes("#22d3ee"), "dark Cp curve must default to cyan #22d3ee");
  assert.ok(atelierCpSvg.includes("#1d4ed8") && atelierCpSvg.includes("#e8451e"), "atelier Cp SVG must use Cobalt & Vermilion");

  const sampleAep = {
    site_avg_wind_mps: 5.5,
    cut_in_mps: 2.8,
    rated_mech_power_w: 380,
    rated_elec_power_w: 320,
    aep_kwh_yr: 410,
    capacity_factor_pct: 18.2,
    points: [
      { wind_mps: 3, mech_power_w: 18, elec_power_w: 10, rpm: 200 },
      { wind_mps: 10, mech_power_w: 380, elec_power_w: 320, rpm: 720 },
    ],
  };
  const darkWindSvg = renderWindPowerCurveSvgMarkup(sampleAep);
  const atelierWindSvg = renderWindPowerCurveSvgMarkup(sampleAep, "atelier");
  assert.ok(darkWindSvg.includes("#22d3ee"), "dark wind curve must default to cyan");
  assert.ok(atelierWindSvg.includes("#1d4ed8") && atelierWindSvg.includes("#047857"), "atelier wind curve must use Cobalt & Emerald");

  const darkAirfoilSvg = renderAirfoilSectionSvgMarkup(initialDesign);
  const atelierAirfoilSvg = renderAirfoilSectionSvgMarkup(initialDesign, undefined, "atelier");
  assert.ok(darkAirfoilSvg.includes("#38bdf8"), "dark airfoil SVG must default to sky blue");
  assert.ok(atelierAirfoilSvg.includes("#1d4ed8") && atelierAirfoilSvg.includes("#e8451e"), "atelier airfoil SVG must use Cobalt & Vermilion");

  const secs = readSections(initialDesign);
  const darkStackSvg = renderSectionStackSvgMarkup(secs, "root");
  const atelierStackSvg = renderSectionStackSvgMarkup(secs, "root", "atelier");
  assert.ok(darkStackSvg.includes("#f6b94d"), "dark stack SVG must default to amber root");
  assert.ok(atelierStackSvg.includes("#1d4ed8") && atelierStackSvg.includes("#e8451e"), "atelier stack SVG must use Cobalt & Vermilion");

  // 3. index.html contains Atelier Blueprint switcher, HUD, and 4-step wizard with intact .table-wrap & IDs
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  const mainTs = fs.readFileSync(path.resolve(__dirname, "../src/main.ts"), "utf8");
  assert.ok(html.includes('data-ui-style="atelier"'), "body must default to data-ui-style='atelier'");
  assert.ok(html.includes('id="ui-style-switcher"'), "top bar must include #ui-style-switcher");
  assert.ok(html.includes('id="btn-style-atelier"'), "top bar must include #btn-style-atelier");
  assert.ok(html.includes('id="btn-style-dark"'), "top bar must include #btn-style-dark");
  assert.ok(html.includes('id="atelier-canvas-hud"'), "HTML must include #atelier-canvas-hud");
  assert.ok(html.includes('id="atelier-wizard-header"'), "HTML must include #atelier-wizard-header");
  assert.ok(html.includes('id="atelier-wizard-footer"'), "HTML must include #atelier-wizard-footer");
  for (const stepNum of [1, 2, 3, 4]) {
    assert.ok(html.includes(`data-wizard-step="${stepNum}"`), `HTML must include wizard step ${stepNum}`);
  }
  const tableWrapMatches = html.match(/^\s*\.table-wrap\s*\{/gm) || [];
  assert.equal(tableWrapMatches.length, 1, "index.html must keep exactly 1 top-level .table-wrap rule");
  assert.ok(!html.includes("⚙") && !html.includes("▶"), "index.html must not contain chrome emojis");

  const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const missingIds = [];
  for (const m of mainTs.matchAll(/document\.getElementById\("([^"]+)"\)/g)) {
    if (!htmlIds.has(m[1])) missingIds.push(m[1]);
  }
  assert.deepEqual(missingIds, [], `missing DOM IDs in index.html: ${missingIds.join(", ")}`);
});











test("Task 9: Nose Cone parametric metrics, Kidwind4-LockRev4 defaults, and studio_mode snapshot round-trip", () => {
  const def = defaultNoseConeConfig();
  assert.equal(def.hub_fit_mode, "kidwind4_lockrev4");
  assert.equal(def.aero_profile, "adaptive");
  assert.equal(def.wrap_style, "saddle");
  assert.equal(def.hub_diameter_mm, 60);
  assert.equal(def.bolt_circle_mm, 40);
  assert.equal(def.trefoil_center_r_mm, 15);
  assert.equal(def.trefoil_lobe_r_mm, 7.5);
  assert.equal(def.trefoil_depth_mm, 2.0);

  const bladeCtx = {
    blade_count: 3,
    hub_diameter_mm: 60,
    hub_length_mm: 20,
    hub_bore_mm: 5.3,
    root_chord_mm: 70,
    root_twist_deg: 20,
    collective_pitch_deg: 0,
  };
  const mKid = computeNoseConeMetrics(def, bladeCtx);
  assert.ok(mKid.nose_cd > 0 && mKid.nose_cd < 0.5);
  assert.ok(mKid.root_flow_boost_pct >= 4);
  assert.ok(mKid.est_mass_g > 5);
  assert.ok(mKid.hardware_label.includes("M3"));
  assert.ok(mKid.fit_note.includes("Kidwind4-LockRev4"));

  const mAuto = computeNoseConeMetrics({ ...def, hub_fit_mode: "match_design" }, { ...bladeCtx, hub_diameter_mm: 84 });
  assert.equal(mAuto.hub_diameter_mm, 84);
  assert.ok(mAuto.fit_note.includes("84mm"));

  const baseWb = defaultWorkbenchUiSnapshot();
  const customNose = {
    ...def,
    aero_profile: "bell",
    wrap_style: "closed",
    cone_length_mm: 84,
    blade_clearance_mm: 0.7,
    assembly_slide_pct: 40,
  };
  const snap = createWorkbenchSnapshot(initialDesign, {}, { ...baseWb, studio_mode: "nose", nosecone: customNose }, "Nose Test");
  const parsed = parseLoadedProjectJson(JSON.stringify(snap));
  assert.equal(parsed.workbench.studio_mode, "nose");
  assert.equal(parsed.workbench.nosecone?.aero_profile, "bell");
  assert.equal(parsed.workbench.nosecone?.wrap_style, "closed");
  assert.equal(parsed.workbench.nosecone?.cone_length_mm, 84);
  assert.equal(parsed.workbench.nosecone?.blade_clearance_mm, 0.7);
  assert.equal(parsed.workbench.nosecone?.assembly_slide_pct, 40);
});

test("Task 9: Nose Cone single-solid watertight CSG meshes across all 16 profile×wrap combos + real blade-wasm slicing & STL verification", async () => {
  await initNoseConeKernel();
  const def = defaultNoseConeConfig();

  // Build actual live 3D blade geometry via blade-wasm just as the UI does
  const gluePath = path.resolve(__dirname, "../../target/glue-node/blade_wasm.js");
  const req = createRequire(import.meta.url);
  const { build_mesh } = req(gluePath);
  const wasmMesh = build_mesh(JSON.stringify(initialDesign), "{}");
  const bladeMeshInput = {
    positions: new Float32Array(wasmMesh.positions),
    indices: new Uint32Array(wasmMesh.indices),
    pivot_shift_mm: -initialDesign.rotor.pitch_axis_ratio * 70,
    rot_z_rad: Math.PI,
    hub_front_y_mm: 25,
    radial_shift_mm: 0,
  };
  wasmMesh.free();

  const bladeCtxMatch = {
    blade_count: 3,
    hub_diameter_mm: 120,
    hub_length_mm: 50,
    hub_bore_mm: 12,
    root_chord_mm: 70,
    root_twist_deg: 20,
    collective_pitch_deg: 0,
    blade_mesh: bladeMeshInput,
  };
  const bladeCtxKid = {
    blade_count: 3,
    hub_diameter_mm: 60,
    hub_length_mm: 20,
    hub_bore_mm: 5.3,
    root_chord_mm: 48,
    root_twist_deg: 20,
    collective_pitch_deg: 0,
  };

  function countConnectedComponents(numVerts, indices) {
    const parent = new Int32Array(numVerts);
    for (let i = 0; i < numVerts; i++) parent[i] = i;
    const find = (x) => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    const unite = (a, b) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    };
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];
      unite(a, b);
      unite(b, c);
    }
    const usedRoots = new Set();
    for (let i = 0; i < indices.length; i++) {
      usedRoots.add(find(indices[i]));
    }
    return usedRoots.size;
  }

  function assertWatertightPositive(submeshes, comboLabel, requireSingleSolid = false) {
    assert.ok(submeshes.length > 0, `${comboLabel}: expected at least 1 submesh`);
    for (const sub of submeshes) {
      const { positions, indices } = sub;
      assert.ok(positions.length > 0 && indices.length > 0 && indices.length % 3 === 0, `${comboLabel}/${sub.id}: empty or non-triangle geometry`);
      const directedEdges = new Map();
      const undirectedCounts = new Map();
      let signedVol6 = 0;

      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];
        const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
        const bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];
        const cx = positions[c * 3], cy = positions[c * 3 + 1], cz = positions[c * 3 + 2];
        assert.ok(
          Number.isFinite(ax) && Number.isFinite(ay) && Number.isFinite(az) &&
          Number.isFinite(bx) && Number.isFinite(by) && Number.isFinite(bz) &&
          Number.isFinite(cx) && Number.isFinite(cy) && Number.isFinite(cz),
          `${comboLabel}/${sub.id}: non-finite vertex coordinate`,
        );
        signedVol6 +=
          ax * (by * cz - bz * cy) +
          ay * (bz * cx - bx * cz) +
          az * (bx * cy - by * cx);

        for (const [u, v] of [[a, b], [b, c], [c, a]]) {
          const dKey = `${u},${v}`;
          directedEdges.set(dKey, (directedEdges.get(dKey) ?? 0) + 1);
          const uKey = u < v ? `${u}-${v}` : `${v}-${u}`;
          undirectedCounts.set(uKey, (undirectedCounts.get(uKey) ?? 0) + 1);
        }
      }

      let inconsistent = 0;
      let boundary = 0;
      let nonManifold = 0;
      for (const [key, count] of directedEdges.entries()) {
        if (count > 1) inconsistent += count - 1;
        const [u, v] = key.split(",");
        if (!directedEdges.has(`${v},${u}`)) boundary++;
      }
      for (const count of undirectedCounts.values()) {
        if (count !== 2) nonManifold++;
      }

      assert.equal(inconsistent, 0, `${comboLabel}/${sub.id}: inconsistent winding edges=${inconsistent}`);
      assert.equal(boundary, 0, `${comboLabel}/${sub.id}: boundary edges=${boundary}`);
      assert.equal(nonManifold, 0, `${comboLabel}/${sub.id}: non-manifold edges=${nonManifold}`);
      assert.ok(signedVol6 > 0, `${comboLabel}/${sub.id}: expected positive signed volume, got ${signedVol6 / 6}`);
      if (requireSingleSolid) {
        const comps = countConnectedComponents(positions.length / 3, indices);
        assert.equal(comps, 1, `${comboLabel}/${sub.id}: expected 1 connected solid component, got ${comps}`);
      }
    }
  }

  const profiles = ["adaptive", "vonkarman", "elliptical", "bell"];
  const wraps = ["saddle", "closed", "cuff", "flush"];
  for (const aero_profile of profiles) {
    for (const wrap_style of wraps) {
      const cfg = { ...def, aero_profile, wrap_style, fairing_style: "none", cutaway_mode: false };
      const bundle = buildNoseConeMeshes(cfg, bladeCtxKid);
      const label = `kid/${aero_profile}/${wrap_style}`;
      assert.equal(bundle.submeshes.length, 1, `${label}: nose cone must be 1 unified CSG solid`);
      assert.equal(bundle.submeshes[0].id, "nose-cone-solid");
      assert.equal(bundle.metrics.is_watertight, true);
      assert.equal(bundle.metrics.is_single_solid, true);
      assert.ok(
        bundle.metrics.volume_cm3 > 15 && bundle.metrics.volume_cm3 < 50,
        `${label}: expected thin-walled lightweight volume in (15, 50) cm3, got ${bundle.metrics.volume_cm3}`,
      );
      assertWatertightPositive(bundle.submeshes, label, true);
      assertWatertightPositive(bundle.ghost_hub_submeshes, `${label}/ghost`, false);
      if (wrap_style === "cuff") {
        assert.equal(bundle.cuff_submeshes.length, 1);
        assert.equal(bundle.cuff_submeshes[0].id, "blade-rotating-cuff");
        assertWatertightPositive(bundle.cuff_submeshes, `${label}/cuff`, true);
      } else {
        assert.equal(bundle.cuff_submeshes.length, 0);
      }
    }
  }

  // Verify live blade-wasm mesh slicing in Auto-Match hub mode + cutaway preview
  for (const wrap_style of wraps) {
    for (const cutaway_mode of [false, true]) {
      const bundle = buildNoseConeMeshes(
        {
          ...def,
          hub_fit_mode: "match_design",
          wrap_style,
          fairing_style: "none",
          cutaway_mode,
          skirt_length_mm: 30,
          cone_length_mm: 85,
        },
        bladeCtxMatch,
      );
      const label = `match_wasm/${wrap_style}/cut=${cutaway_mode}`;
      assert.equal(bundle.submeshes.length, 1);
      assert.equal(bundle.metrics.is_watertight, true);
      if (!cutaway_mode) {
        assert.ok(
          bundle.metrics.volume_cm3 > 40 && bundle.metrics.volume_cm3 < 200,
          `${label}: expected thin-walled Auto-Match Ø120mm volume in (40, 200) cm3, got ${bundle.metrics.volume_cm3}`,
        );
      }
      assertWatertightPositive(bundle.submeshes, label, true);
    }
  }

  // Verify all 3 Swept Blade-Root Fairing styles on Kidwind4 Ø60 & Auto-Match Ø120
  for (const fairing_style of ["delta", "boot", "fillet"]) {
    for (const [modeLabel, cfg, ctx, minMaxR] of [
      [
        `kid/${fairing_style}`,
        { ...def, fairing_style, fairing_span_mm: 28, fairing_blend_pct: 40, cutaway_mode: false },
        bladeCtxKid,
        30 + 2.2 + 12,
      ],
      [
        `match_wasm/${fairing_style}`,
        {
          ...def,
          hub_fit_mode: "match_design",
          fairing_style,
          fairing_span_mm: 30,
          fairing_blend_pct: 45,
          skirt_length_mm: 30,
          cone_length_mm: 85,
          cutaway_mode: false,
        },
        bladeCtxMatch,
        60 + 2.2 + 12,
      ],
    ]) {
      const bundle = buildNoseConeMeshes(cfg, ctx);
      assert.equal(bundle.submeshes.length, 1, `${modeLabel}: fairing must fuse into 1 monolithic solid`);
      assert.equal(bundle.metrics.is_watertight, true);
      assert.equal(bundle.metrics.is_single_solid, true);
      assertWatertightPositive(bundle.submeshes, modeLabel, true);
      const pos = bundle.submeshes[0].positions;
      let maxR = 0;
      for (let i = 0; i < pos.length; i += 3) {
        const r = Math.hypot(pos[i], pos[i + 1]);
        if (r > maxR) maxR = r;
      }
      assert.ok(
        maxR > minMaxR,
        `${modeLabel}: expected swept fairing radial reach > ${minMaxR}mm, got ${maxR.toFixed(1)}mm`,
      );
    }
  }

  // Binary STL export (must remain full watertight 1-solid even when cutaway_mode is toggled on)
  const coneFullBundle = buildNoseConeMeshes({ ...def, cutaway_mode: false }, bladeCtxKid);
  const expectedConeTris = coneFullBundle.submeshes[0].indices.length / 3;
  const coneStl = exportNoseConeStlBytes({ ...def, cutaway_mode: true }, bladeCtxKid, "cone");
  const coneHeader = Buffer.from(coneStl.subarray(0, 80)).toString("ascii").replace(/\0+$/, "");
  assert.ok(coneHeader.includes("1Solid-v2"), `Expected STL header to include '1Solid-v2', got '${coneHeader}'`);
  const coneView = new DataView(coneStl.buffer, coneStl.byteOffset, coneStl.byteLength);
  const coneTriCount = coneView.getUint32(80, true);
  assert.equal(coneTriCount, expectedConeTris, "exportNoseConeStlBytes must ignore cutaway_mode and export full cone");
  assert.equal(coneStl.byteLength, 84 + coneTriCount * 50);
  let minZ = Infinity;
  const vMap = new Map();
  const stlPositions = [];
  const stlIndices = [];
  for (let t = 0; t < coneTriCount; t++) {
    for (let v = 0; v < 3; v++) {
      const base = 84 + t * 50 + 12 + v * 12;
      const x = coneView.getFloat32(base, true);
      const y = coneView.getFloat32(base + 4, true);
      const z = coneView.getFloat32(base + 8, true);
      if (z < minZ) minZ = z;
      const k = `${Math.round(x * 1e4)}_${Math.round(y * 1e4)}_${Math.round(z * 1e4)}`;
      let idx = vMap.get(k);
      if (idx === undefined) {
        idx = stlPositions.length / 3;
        vMap.set(k, idx);
        stlPositions.push(x, y, z);
      }
      stlIndices.push(idx);
    }
  }
  assert.ok(minZ >= -1e-4, `STL must sit flat on build plate z >= 0, got minZ=${minZ}`);
  assertWatertightPositive(
    [{ id: "exported-stl", positions: new Float32Array(stlPositions), indices: new Uint32Array(stlIndices) }],
    "exported-cone-stl",
    true,
  );

  const cuffStl = exportNoseConeStlBytes({ ...def, wrap_style: "cuff" }, bladeCtxKid, "cuff");
  const cuffView = new DataView(cuffStl.buffer, cuffStl.byteOffset, cuffStl.byteLength);
  const cuffTris = cuffView.getUint32(80, true);
  assert.ok(cuffTris > 100);
  assert.equal(cuffStl.byteLength, 84 + cuffTris * 50);
});

test("Task 9: Nose Cone Studio HTML DOM integrity", () => {
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  for (const id of [
    "tab-studio-nose",
    "nosecone-inspector",
    "nose-toolbar-controls",
    "nose-preview-canvas",
    "nose-profile-tabs",
    "nose-wrap-tabs",
    "nose-fairing-tabs",
    "nose-fairing-span",
    "nose-fairing-blend",
    "nose-slide",
    "nose-length",
    "nose-skirt",
    "nose-wall",
    "nose-gap",
    "nose-trefoil-tol",
    "nose-kpi-cd",
    "nose-kpi-boost",
    "nose-kpi-mass",
    "nose-kpi-hardware",
    "btn-export-nose-stl",
    "btn-export-nose-cuff-stl",
    "btn-export-nose-menu",
  ]) {
    assert.ok(html.includes(`id="${id}"`), `Missing expected Nose Cone Studio element id="${id}"`);
  }
});

test("Task 10: Stalled-generator WASM fix, 16:1 drivetrain optimizer & official KidWind rules (T-105)", () => {
  const require = createRequire(import.meta.url);
  const { simulate_aero } = require("../../target/glue-node/blade_wasm.js");

  // 1. Constants & preset helper
  assert.equal(KIDWIND_OFFICIAL_RULES.fixed_load_ohm, 30.0);
  assert.equal(KIDWIND_OFFICIAL_RULES.max_voltage_v, 30.0);
  assert.equal(KIDWIND_OFFICIAL_RULES.max_current_a, 1.0);
  assert.equal(KIDWIND_OFFICIAL_RULES.max_gear_ratio, 16.0);
  assert.equal(isKidwindGeneratorPreset("kidwind_red"), true);
  assert.equal(isKidwindGeneratorPreset("kidwind_gen2"), true);
  assert.equal(isKidwindGeneratorPreset("outrunner_bldc"), false);
  assert.equal(isKidwindGeneratorPreset("low_rpm_pmg"), false);

  // 2. WASM stalled-generator fix: overloaded PMG at 2.0 m/s reports stalled === true and exact 0 W output
  const lowWindRef = updateRotorField(initialDesign, "wind_speed_mps", 2.0);
  const pmg = GENERATOR_PRESETS.low_rpm_pmg;
  const stalledBundle = JSON.parse(
    simulate_aero(
      JSON.stringify(lowWindRef),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: pmg.kv_rpm_per_v,
        generator_r_int: pmg.r_int_ohm,
        generator_r_load: 2.0,
        generator_gear_ratio: 16.0,
        generator_i0: pmg.no_load_current_a,
      }),
    ),
  );
  assert.equal(stalledBundle.generator_match.stalled, true);
  assert.equal(stalledBundle.generator_match.tip_speed_ratio, 0);
  assert.equal(stalledBundle.generator_match.generator.rotor_rpm, 0);
  assert.equal(stalledBundle.generator_match.generator.terminal_voltage_v, 0);
  assert.equal(stalledBundle.generator_match.generator.current_a, 0);
  assert.equal(stalledBundle.generator_match.generator.electrical_power_w, 0);
  assert.equal(stalledBundle.generator_match.net_cp_electrical, 0);

  const stalledOpt = optimizeGeneratorAndGearbox(lowWindRef, stalledBundle, {
    kv: pmg.kv_rpm_per_v,
    r_int: pmg.r_int_ohm,
    r_load: 2.0,
    gear_ratio: 16.0,
    i0: pmg.no_load_current_a,
    kidwind_rules: false,
  });
  assert.equal(stalledOpt.current_stalled, true);
  assert.equal(stalledOpt.regime, "stalled_overload");
  assert.equal(stalledOpt.current_elec_power_w, 0);

  // 3. KidWind Rules (30 ohm fixed load, <= 30 V, <= 1 A) + >8:1 drivetrain search
  let { design: scimitarLow } = applyBladeWindPreset(initialDesign, "scimitar_belly");
  scimitarLow = updateRotorField(scimitarLow, "hub_radius_mm", 30);
  scimitarLow = updateBladeLengthMm(scimitarLow, 500);
  scimitarLow = updateRotorField(scimitarLow, "wind_speed_mps", 2.0);
  const red = GENERATOR_PRESETS.kidwind_red;
  const kwLowBundle = JSON.parse(
    simulate_aero(
      JSON.stringify(scimitarLow),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: red.kv_rpm_per_v,
        generator_r_int: red.r_int_ohm,
        generator_r_load: 30.0,
        generator_gear_ratio: 8.0,
        generator_i0: red.no_load_current_a,
      }),
    ),
  );
  const kwLowOpt = optimizeGeneratorAndGearbox(scimitarLow, kwLowBundle, {
    kv: red.kv_rpm_per_v,
    r_int: red.r_int_ohm,
    r_load: 30.0,
    gear_ratio: 8.0,
    i0: red.no_load_current_a,
    kidwind_rules: true,
  });
  assert.equal(kwLowOpt.kidwind_rules_active, true);
  assert.equal(kwLowOpt.opt_r_load_ohm, 30.0);
  assert.equal(kwLowOpt.best_r_load_at_current_gear_ohm, 30.0);
  assert.ok(
    kwLowOpt.opt_gear_ratio > 8.0 && kwLowOpt.opt_gear_ratio <= 16.0,
    `expected >8:1 optimal KidWind gear ratio in 2 m/s wind, got ${kwLowOpt.opt_gear_ratio}`,
  );
  assert.ok(kwLowOpt.opt_gear_ratio < 16.0, `expected optimizer to avoid stalled 16:1 ratio at 2 m/s, got ${kwLowOpt.opt_gear_ratio}`);
  assert.ok(kwLowOpt.opt_voltage_v <= 30.0);
  assert.ok(kwLowOpt.opt_elec_power_w / Math.max(1e-6, kwLowOpt.opt_voltage_v) <= 1.0);
  assert.equal(kwLowOpt.how_to_max_out_steps.length, 3);
  assert.ok(kwLowOpt.how_to_max_out_steps[0].includes("30 Ω"));

  // 4. High-wind KidWind 30 V / 1 A sensor limit enforcement (avoid Vernier DQ)
  let { design: scimitarHigh } = applyBladeWindPreset(initialDesign, "scimitar_belly");
  scimitarHigh = updateRotorField(scimitarHigh, "hub_radius_mm", 30);
  scimitarHigh = updateBladeLengthMm(scimitarHigh, 470);
  scimitarHigh = updateRotorField(scimitarHigh, "wind_speed_mps", 12.0);
  const kwHighBundle = JSON.parse(
    simulate_aero(
      JSON.stringify(scimitarHigh),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: red.kv_rpm_per_v,
        generator_r_int: red.r_int_ohm,
        generator_r_load: 30.0,
        generator_gear_ratio: 8.0,
        generator_i0: red.no_load_current_a,
      }),
    ),
  );
  const kwHighOpt = optimizeGeneratorAndGearbox(scimitarHigh, kwHighBundle, {
    kv: red.kv_rpm_per_v,
    r_int: red.r_int_ohm,
    r_load: 30.0,
    gear_ratio: 8.0,
    i0: red.no_load_current_a,
    kidwind_rules: true,
  });
  assert.equal(kwHighOpt.opt_r_load_ohm, 30.0);
  assert.equal(kwHighOpt.current_over_voltage, true);
  assert.equal(kwHighOpt.kidwind_compliant, false);
  assert.ok(
    kwHighOpt.opt_voltage_v <= 30.0,
    `expected legal KidWind recommendation <= 30 V, got ${kwHighOpt.opt_voltage_v}`,
  );
  assert.ok(kwHighOpt.opt_elec_power_w / Math.max(1e-6, kwHighOpt.opt_voltage_v) <= 1.0);

  // 5. Open Division (kidwind_rules: false) searches up to 16:1 with variable Load R
  const openOpt = optimizeGeneratorAndGearbox(scimitarLow, kwLowBundle, {
    kv: red.kv_rpm_per_v,
    r_int: red.r_int_ohm,
    r_load: 10.0,
    gear_ratio: 3.0,
    i0: red.no_load_current_a,
    kidwind_rules: false,
  });
  assert.equal(openOpt.kidwind_rules_active, false);
  assert.ok(openOpt.opt_gear_ratio >= 8.0 && openOpt.opt_gear_ratio <= 16.0);
  assert.notEqual(openOpt.best_r_load_at_current_gear_ohm, 30.0);

  // 6. Snapshot round-trip & HTML DOM elements
  const snap = createWorkbenchSnapshot(
    scimitarLow,
    {},
    {
      gen_preset: "kidwind_red",
      gen_kidwind_rules: true,
      gen_gear_ratio: 10.0,
      gen_r_load: 30.0,
    },
  );
  const parsedSnap = parseLoadedProjectJson(JSON.stringify(snap));
  assert.equal(parsedSnap.workbench.gen_kidwind_rules, true);
  assert.equal(parsedSnap.workbench.gen_gear_ratio, 10.0);
  assert.equal(parsedSnap.workbench.gen_r_load, 30.0);

  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  for (const id of ["gen-kidwind-rules", "btn-gear-8", "btn-gear-12"]) {
    assert.ok(html.includes(`id="${id}"`), `Missing expected DOM id="${id}"`);
  }
});

test("Task 11: KidWind Asia 2026 KW-GEN3 preset and VES-VL (2–200 ohm, <=10V, <=0.3A, R<=500mm) ruleset", () => {
  const require = createRequire(import.meta.url);
  const { simulate_aero } = require("../../target/glue-node/blade_wasm.js");

  // 1. Official KW-GEN3 preset & ruleset defaults
  const asiaGen = GENERATOR_PRESETS.kidwind_asia_2026;
  assert.ok(asiaGen, "Missing kidwind_asia_2026 generator preset");
  assert.equal(asiaGen.kv_rpm_per_v, 366);
  assert.equal(asiaGen.r_int_ohm, 40.1);
  assert.equal(asiaGen.no_load_current_a, 0.011);
  assert.equal(isKidwindGeneratorPreset("kidwind_asia_2026"), true);
  assert.equal(defaultRulesetForGeneratorPreset("kidwind_asia_2026"), "asia_2026_vesvl");
  assert.equal(defaultRulesetForGeneratorPreset("kidwind_red"), "us_30ohm");
  assert.equal(defaultRulesetForGeneratorPreset("kidwind_gen2"), "us_30ohm");
  assert.equal(KIDWIND_ASIA_2026_RULES.min_load_ohm, 2.0);
  assert.equal(KIDWIND_ASIA_2026_RULES.max_load_ohm, 200.0);
  assert.equal(KIDWIND_ASIA_2026_RULES.max_voltage_v, 10.0);
  assert.equal(KIDWIND_ASIA_2026_RULES.max_current_a, 0.3);
  assert.equal(KIDWIND_ASIA_2026_RULES.max_rotor_radius_mm, 500.0);

  // 2. Scimitar R=490mm (hub=30mm, blade=460mm) in Tunnel B (3.5 m/s) & Tunnel A (2.5 m/s)
  let { design: scimitarAsia } = applyBladeWindPreset(initialDesign, "scimitar_belly");
  scimitarAsia = updateRotorField(scimitarAsia, "hub_radius_mm", 30);
  scimitarAsia = updateBladeLengthMm(scimitarAsia, 460); // R = 490 mm <= 500 mm
  assert.equal(scimitarAsia.rotor.radius_mm, 490);

  for (const windMps of [3.5, 2.5]) {
    const tunedRotor = updateRotorField(scimitarAsia, "wind_speed_mps", windMps);
    const bundle = JSON.parse(
      simulate_aero(
        JSON.stringify(tunedRotor),
        JSON.stringify({
          tsr_min: 1.5,
          tsr_max: 9.0,
          tsr_steps: 16,
          generator_kv: asiaGen.kv_rpm_per_v,
          generator_r_int: asiaGen.r_int_ohm,
          generator_r_load: 45.0,
          generator_gear_ratio: 8.0,
          generator_i0: asiaGen.no_load_current_a,
        }),
      ),
    );
    const opt = optimizeGeneratorAndGearbox(tunedRotor, bundle, {
      kv: asiaGen.kv_rpm_per_v,
      r_int: asiaGen.r_int_ohm,
      r_load: 45.0,
      gear_ratio: 8.0,
      i0: asiaGen.no_load_current_a,
      kidwind_rules: true,
      kidwind_ruleset: "asia_2026_vesvl",
    });
    assert.equal(opt.kidwind_rules_active, true);
    assert.equal(opt.kidwind_ruleset, "asia_2026_vesvl");
    assert.equal(opt.current_over_radius, false);
    assert.equal(opt.kidwind_compliant, true);
    assert.ok(
      opt.opt_r_load_ohm >= 20 && opt.opt_r_load_ohm <= 200,
      `expected Asia VES-VL opt_r_load_ohm in [20, 200] at ${windMps} m/s, got ${opt.opt_r_load_ohm}`,
    );
    assert.ok(
      opt.best_r_load_at_current_gear_ohm >= 2 && opt.best_r_load_at_current_gear_ohm <= 200,
      `expected VES-VL best load in [2, 200], got ${opt.best_r_load_at_current_gear_ohm}`,
    );
    assert.ok(opt.opt_voltage_v <= 10.0 + 1e-6, `expected opt_voltage_v <= 10V, got ${opt.opt_voltage_v}`);
    const optCurrent = opt.opt_elec_power_w / Math.max(1e-6, opt.opt_voltage_v);
    assert.ok(optCurrent <= 0.3 + 1e-6, `expected opt current <= 0.3A, got ${optCurrent}`);
    assert.equal(opt.how_to_max_out_steps.length, 3);
    assert.ok(
      opt.how_to_max_out_steps[2].includes("2 Ω") && opt.how_to_max_out_steps[2].includes("VES-VL"),
      `expected step 3 to mention 2 Ω reset & VES-VL, got: ${opt.how_to_max_out_steps[2]}`,
    );
  }

  // 3. High-wind (12 m/s) Asia 2026 10 V / 0.3 A cap enforcement
  const highWindAsia = updateRotorField(scimitarAsia, "wind_speed_mps", 12.0);
  const highBundle = JSON.parse(
    simulate_aero(
      JSON.stringify(highWindAsia),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: asiaGen.kv_rpm_per_v,
        generator_r_int: asiaGen.r_int_ohm,
        generator_r_load: 150.0,
        generator_gear_ratio: 16.0,
        generator_i0: asiaGen.no_load_current_a,
      }),
    ),
  );
  const highOpt = optimizeGeneratorAndGearbox(highWindAsia, highBundle, {
    kv: asiaGen.kv_rpm_per_v,
    r_int: asiaGen.r_int_ohm,
    r_load: 150.0,
    gear_ratio: 16.0,
    i0: asiaGen.no_load_current_a,
    kidwind_rules: true,
    kidwind_ruleset: "asia_2026_vesvl",
  });
  assert.equal(highOpt.current_over_voltage || highOpt.current_over_current, true);
  assert.equal(highOpt.kidwind_compliant, false);
  assert.ok(highOpt.opt_voltage_v <= 10.0 + 1e-6, `expected opt <= 10 V, got ${highOpt.opt_voltage_v}`);
  const highOptCurr = highOpt.opt_elec_power_w / Math.max(1e-6, highOpt.opt_voltage_v);
  assert.ok(highOptCurr <= 0.3 + 1e-6, `expected opt <= 0.3 A, got ${highOptCurr}`);

  // 4. R > 500 mm size DQ check under asia_2026_vesvl
  const oversizeAsia = updateRotorField(
    updateBladeLengthMm(scimitarAsia, 520), // R = 550 mm > 500 mm
    "wind_speed_mps",
    3.5,
  );
  const overBundle = JSON.parse(
    simulate_aero(
      JSON.stringify(oversizeAsia),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: asiaGen.kv_rpm_per_v,
        generator_r_int: asiaGen.r_int_ohm,
        generator_r_load: 55.0,
        generator_gear_ratio: 12.0,
        generator_i0: asiaGen.no_load_current_a,
      }),
    ),
  );
  const overOpt = optimizeGeneratorAndGearbox(oversizeAsia, overBundle, {
    kv: asiaGen.kv_rpm_per_v,
    r_int: asiaGen.r_int_ohm,
    r_load: 55.0,
    gear_ratio: 12.0,
    i0: asiaGen.no_load_current_a,
    kidwind_rules: true,
    kidwind_ruleset: "asia_2026_vesvl",
  });
  assert.equal(overOpt.current_over_radius, true);
  assert.equal(overOpt.kidwind_compliant, false);
  assert.ok(
    overOpt.compliance_note.includes("500 mm"),
    `expected compliance_note to mention 500 mm, got: ${overOpt.compliance_note}`,
  );

  // 5. Snapshot round-trip preserves Asia 2026 fields
  const asiaSnap = createWorkbenchSnapshot(
    scimitarAsia,
    {},
    {
      gen_preset: "kidwind_asia_2026",
      gen_kidwind_rules: true,
      gen_kidwind_ruleset: "asia_2026_vesvl",
      gen_gear_ratio: 12.0,
      gen_r_load: 55.0,
    },
  );
  const parsedAsiaSnap = parseLoadedProjectJson(JSON.stringify(asiaSnap));
  assert.equal(parsedAsiaSnap.workbench.gen_preset, "kidwind_asia_2026");
  assert.equal(parsedAsiaSnap.workbench.gen_kidwind_rules, true);
  assert.equal(parsedAsiaSnap.workbench.gen_kidwind_ruleset, "asia_2026_vesvl");
  assert.equal(parsedAsiaSnap.workbench.gen_r_load, 55.0);

  // 6. Baked Asia 2026 Slender Scimitar 1-click preset checks (< 400 mm blade length)
  const asiaPresetSpec = BLADE_WIND_PRESETS.asia_2026_scimitar;
  assert.ok(asiaPresetSpec, "Missing asia_2026_scimitar blade preset");
  assert.equal(asiaPresetSpec.rotor.radius_mm, 420);
  assert.equal(asiaPresetSpec.rotor.hub_radius_mm, 30);
  assert.equal(asiaPresetSpec.rotor.radius_mm - asiaPresetSpec.rotor.hub_radius_mm, 390);
  assert.ok(asiaPresetSpec.rotor.radius_mm - asiaPresetSpec.rotor.hub_radius_mm < 400);
  assert.equal(asiaPresetSpec.rotor.blade_count, 3);
  assert.equal(asiaPresetSpec.rotor.design_tsr, 5.5);
  assert.equal(asiaPresetSpec.sections.root.chord_mm, 36);
  assert.equal(asiaPresetSpec.sections.mid.chord_mm, 48);
  assert.equal(asiaPresetSpec.sections.tip.chord_mm, 21);
  assert.equal(asiaPresetSpec.recommended_drivetrain.gen_preset, "kidwind_asia_2026");
  assert.equal(asiaPresetSpec.recommended_drivetrain.gear_ratio, 11.0);
  assert.equal(asiaPresetSpec.recommended_drivetrain.r_load_ohm, 42.0);
  assert.equal(asiaPresetSpec.recommended_spar_mm, 5.0);

  const { design: asiaPresetDesign } = applyBladeWindPreset(initialDesign, "asia_2026_scimitar");
  const asiaPresetBundle = JSON.parse(
    simulate_aero(
      JSON.stringify(asiaPresetDesign),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: asiaGen.kv_rpm_per_v,
        generator_r_int: asiaGen.r_int_ohm,
        generator_r_load: asiaPresetSpec.recommended_drivetrain.r_load_ohm,
        generator_gear_ratio: asiaPresetSpec.recommended_drivetrain.gear_ratio,
        generator_i0: asiaGen.no_load_current_a,
      }),
    ),
  );
  assert.equal(asiaPresetBundle.generator_match.stalled, false);
  assert.ok(asiaPresetBundle.generator_match.generator.terminal_voltage_v <= 10.0);
  assert.ok(asiaPresetBundle.generator_match.generator.current_a <= 0.3);
  assert.ok(asiaPresetBundle.generator_match.generator.electrical_power_w >= 2.1);
  const asiaPresetOpt = optimizeGeneratorAndGearbox(asiaPresetDesign, asiaPresetBundle, {
    kv: asiaGen.kv_rpm_per_v,
    r_int: asiaGen.r_int_ohm,
    r_load: asiaPresetSpec.recommended_drivetrain.r_load_ohm,
    gear_ratio: asiaPresetSpec.recommended_drivetrain.gear_ratio,
    i0: asiaGen.no_load_current_a,
    kidwind_rules: true,
    kidwind_ruleset: "asia_2026_vesvl",
  });
  assert.equal(asiaPresetOpt.kidwind_compliant, true);
  assert.equal(asiaPresetOpt.current_over_radius, false);

  const asiaStartBundle = JSON.parse(
    simulate_aero(
      JSON.stringify(updateRotorField(asiaPresetDesign, "wind_speed_mps", 2.0)),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: asiaGen.kv_rpm_per_v,
        generator_r_int: asiaGen.r_int_ohm,
        generator_r_load: 2.0,
        generator_gear_ratio: asiaPresetSpec.recommended_drivetrain.gear_ratio,
        generator_i0: asiaGen.no_load_current_a,
      }),
    ),
  );
  assert.equal(asiaStartBundle.generator_match.stalled, false);

  // 7. Smooth STEP analytical spar bore via WASM export_part_step on asia_2026_scimitar
  const { export_part_step } = require("../../target/glue-node/blade_wasm.js");
  const asiaStepFab = JSON.stringify({
    spar_hole_diameter_mm: 5.0,
    spar_hole_depth_mm: 240.0,
    step_mode: "smooth",
  });
  const asiaBladeStep = export_part_step(JSON.stringify(asiaPresetDesign), asiaStepFab, "blade");
  assert.ok(asiaBladeStep.includes("B_SPLINE_SURFACE_WITH_KNOTS"), "blade STEP must be smooth B-spline");
  assert.ok(asiaBladeStep.includes("RATIONAL_B_SPLINE_SURFACE"), "blade STEP must include analytical NURBS spar bore");
  assert.equal((asiaBladeStep.match(/PLANE\(/g) || []).length, 3, "blind bore blade STEP has root, tip, and bore end caps");

  const asiaAsmStep = export_part_step(JSON.stringify(asiaPresetDesign), asiaStepFab, "assembly");
  assert.equal((asiaAsmStep.match(/MANIFOLD_SOLID_BREP/g) || []).length, 2);
  assert.ok(asiaAsmStep.includes("B_SPLINE_SURFACE_WITH_KNOTS"));
  assert.ok(asiaAsmStep.includes("RATIONAL_B_SPLINE_SURFACE"));

  for (const partIdx of [0, 1]) {
    const splitStep = export_part_step(
      JSON.stringify(asiaPresetDesign),
      JSON.stringify({
        spar_hole_diameter_mm: 5.0,
        spar_hole_depth_mm: 240.0,
        split_parts: 2,
        split_ratio: 0.5,
        active_part: partIdx,
        step_mode: "smooth",
      }),
      "blade",
    );
    assert.ok(splitStep.includes("B_SPLINE_SURFACE_WITH_KNOTS"), `split part ${partIdx} must be smooth B-spline`);
    assert.ok(splitStep.includes("RATIONAL_B_SPLINE_SURFACE"), `split part ${partIdx} must carry analytical spar bore`);
  }

  // 8. Printable Trailing-Edge & Aft-Tail Wedge Thickening (min_trailing_edge_mm >= 0.8 mm)
  assert.equal(asiaPresetDesign.manufacturing.min_trailing_edge_mm, 0.8);
  const { build_mesh } = require("../../target/glue-node/blade_wasm.js");
  const asiaMesh = build_mesh(JSON.stringify(asiaPresetDesign), "{}");
  const pos = asiaMesh.positions;
  const vCount = asiaMesh.vertex_count;
  assert.equal(vCount, 13 * 161);
  // Check every station (0..12) of the 161-point contour:
  // TE gap (pt 0 to pt 160) and aft 35% tail (d = 52..80 from LE index 80) must be >= 0.8 mm!
  for (let s = 0; s < 13; s++) {
    const base = s * 161;
    const teDx = pos[base * 3] - pos[(base + 160) * 3];
    const teDy = pos[base * 3 + 1] - pos[(base + 160) * 3 + 1];
    const teGap = Math.hypot(teDx, teDy);
    assert.ok(
      teGap + 1e-4 >= 0.8,
      `Station ${s} trailing-edge gap ${teGap.toFixed(3)} mm < 0.8 mm`,
    );
    for (let d = 52; d <= 80; d++) {
      const iu = base + (80 - d);
      const il = base + (80 + d);
      const gap = Math.hypot(pos[iu * 3] - pos[il * 3], pos[iu * 3 + 1] - pos[il * 3 + 1]);
      assert.ok(
        gap + 1e-4 >= 0.8,
        `Station ${s} aft station d=${d} gap ${gap.toFixed(3)} mm < 0.8 mm`,
      );
    }
  }
  const customTeDesign = updateMinTrailingEdgeMm(asiaPresetDesign, 1.0);
  assert.equal(customTeDesign.manufacturing.min_trailing_edge_mm, 1.0);
  const customTeMesh = build_mesh(JSON.stringify(customTeDesign), "{}");
  const pos1 = customTeMesh.positions;
  const tipBase = 12 * 161;
  const tipTeGap = Math.hypot(
    pos1[tipBase * 3] - pos1[(tipBase + 160) * 3],
    pos1[tipBase * 3 + 1] - pos1[(tipBase + 160) * 3 + 1],
  );
  assert.ok(tipTeGap + 1e-4 >= 1.0, `Expected tip TE >= 1.0 mm, got ${tipTeGap}`);

  // 9. Verify web/index.html DOM markers
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  for (const snippet of [
    'id="btn-preset-asia-2026"',
    'value="kidwind_asia_2026"',
    'id="gen-kidwind-rule-set"',
    'value="asia_2026_vesvl"',
    'id="gen-kidwind-rules-label"',
    'id="mfg-min-te"',
  ]) {
    assert.ok(html.includes(snippet), `Missing expected HTML marker ${snippet}`);
  }
});
