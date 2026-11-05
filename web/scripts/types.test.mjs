import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import {
  applyLinearLayer1,
  applySchmitzLayer1,
  clearAllOverrides,
  clearStationOverride,
  DesignHistory,
  resolveStationsPreview,
  setStationOverride,
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
