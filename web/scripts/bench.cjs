"use strict";

// Node benchmark of the wasm blade pipeline (T-008 acceptance: the Live view
// updates within 50 ms upon a twist change).
//
//   npm run bench
//
// Uses the wasm-bindgen "nodejs" glue generated to target/glue-node. Asserts
// the baseline matches the known STL numbers (F-geom1-009) and that every one
// of N consecutive twist/chord re-edits completes within the 50 ms budget.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const fixture = fs.readFileSync(
  path.join(root, "fixtures", "naca4412-linear.json"),
  "utf8",
);
const wasm = require(path.join(root, "target", "glue-node", "blade_wasm.js"));

let failures = 0;
function check(condition, message) {
  if (condition) {
    console.log("ok   " + message);
  } else {
    console.error("FAIL " + message);
    failures += 1;
  }
}

const base = wasm.build_mesh(fixture, "{}");
check(
  base.vertex_count === 1771,
  `baseline vertex_count = ${base.vertex_count} (expect 1771)`,
);
check(
  base.triangle_count === 3538,
  `baseline triangle_count = ${base.triangle_count} (expect 3538)`,
);
check(
  Math.abs(base.volume_mm3 - 126493.7) < 1.0,
  `baseline volume = ${base.volume_mm3.toFixed(1)} mm^3 (expect ~126493.7)`,
);
check(
  base.span_min_mm > 59.9 && base.span_min_mm < 60.1,
  `baseline span_min = ${base.span_min_mm.toFixed(3)} mm`,
);
check(
  base.span_max_mm > 599.9 && base.span_max_mm < 600.1,
  `baseline span_max = ${base.span_max_mm.toFixed(3)} mm`,
);

// Warm up the wasm module/allocator before timing.
wasm.build_mesh(fixture, JSON.stringify({ tip_twist_deg: 3 }));

const N = 40;
const BUDGET_MS = 50;
const times = [];
for (let i = 0; i < N; i += 1) {
  const overrides = {
    tip_twist_deg: 3 + (i % 6) * 2,
    tip_chord_mm: 35 + (i % 4) * 8,
  };
  const t0 = performance.now();
  const data = wasm.build_mesh(fixture, JSON.stringify(overrides));
  times.push(performance.now() - t0);
  check(
    data.triangle_count === 3538,
    `iteration ${i} triangles = ${data.triangle_count}`,
  );
}

const avg = times.reduce((a, b) => a + b, 0) / times.length;
const max = Math.max(...times);
console.log(
  `\nupdate latency over ${N} twist/chord edits: avg=${avg.toFixed(2)} ms  max=${max.toFixed(2)} ms  budget=${BUDGET_MS} ms`,
);
check(max < BUDGET_MS, `max update ${max.toFixed(2)} ms < ${BUDGET_MS} ms budget`);

if (failures > 0) {
  console.error(`\nBENCH FAILED (${failures} failed checks)`);
  process.exit(1);
}
console.log("\nBENCH PASS");
process.exit(0);
