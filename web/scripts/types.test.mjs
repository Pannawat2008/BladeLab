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
  defaultChordBezierPoints,
  defaultTwistBezierPoints,
  DesignHistory,
  evaluateExperimentalFit,
  interpolateSweepCp,
  parseExperimentalDataLog,
  renderAirfoilSectionSvgMarkup,
  renderCpTsrSvgMarkup,
  resolveStationsPreview,
  scaleAllChords,
  setStationOverride,
  shiftAllChordsMm,
  updateBezierControlPoint,
  updateBladeLengthMm,
  updatePitchAxisRatio,
  updatePrimaryAirfoil,
  updateRotorField,
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
