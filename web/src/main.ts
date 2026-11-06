// Real-time blade workbench (T-008 + T-105 + T-205):
// - Layer 1 rotor & distribution controls (Linear / Schmitz)
// - Layer 2 interactive Bézier curve editor & Formula inputs
// - Value scrubbing (Shift 10× / Alt 0.1×), station locking & taper binding
// - Layer 3 per-station override table
// - Undo / Redo history stack (buttons + Ctrl+Z / Ctrl+Y)
// - Live < 50 ms Three.js mesh rebuild via blade-wasm

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import wasmUrl from "../pkg/blade_wasm_bg.wasm?url";
import init, { build_mesh, simulate_aero } from "../pkg/blade_wasm.js";
import designJson from "./designs/naca4412-linear.json?raw";
import {
  type AeroSimulationBundle,
  applyBezierCurve,
  applyBoundRootChord,
  applyFormulaCurve,
  applyLinearLayer1,
  applySchmitzLayer1,
  applyScrubDelta,
  clearAllOverrides,
  clearStationOverride,
  cloneDesign,
  compareABSimulation,
  defaultChordBezierPoints,
  defaultTwistBezierPoints,
  DesignHistory,
  evalBezierPoints,
  evaluateExperimentalFit,
  parseExperimentalDataLog,
  preserveLockedStations,
  RATIO_EPS,
  renderCpTsrSvgMarkup,
  resolveStationsPreview,
  setStationOverride,
  updateBezierControlPoint,
  updateRotorField,
} from "./state";
import type { BezierControlPoint, Design } from "./types/blade-model";

// ---- wasm bootstrap ----
await init(wasmUrl);
const initialDesign: Design = JSON.parse(designJson) as Design;
const history = new DesignHistory(initialDesign);
let workingDesign: Design = history.current();

// ---- scene ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111318);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 8000);
camera.position.set(260, 210, 540);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.getElementById("app")!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(30, 0, 330);
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x22242a, 1.15));
const key = new THREE.DirectionalLight(0xffffff, 1.65);
key.position.set(160, 260, 320);
scene.add(key);

const grid = new THREE.GridHelper(1400, 28, 0x3a3f47, 0x23272e);
grid.position.y = -60;
scene.add(grid);

// ---- DOM elements ----
const btnUndo = document.getElementById("btn-undo") as HTMLButtonElement;
const btnRedo = document.getElementById("btn-redo") as HTMLButtonElement;
const btnReset = document.getElementById("btn-reset") as HTMLButtonElement;
const btnClearOverrides = document.getElementById("btn-clear-overrides") as HTMLButtonElement;

const rotorSummary = document.getElementById("rotor-summary")!;
const inputRadius = document.getElementById("rotor-radius") as HTMLInputElement;
const inputHubRadius = document.getElementById("rotor-hub-radius") as HTMLInputElement;
const inputBlades = document.getElementById("rotor-blades") as HTMLInputElement;
const inputTsr = document.getElementById("rotor-tsr") as HTMLInputElement;
const inputWind = document.getElementById("rotor-wind") as HTMLInputElement;
const inputStations = document.getElementById("rotor-stations") as HTMLInputElement;

const btnModeLinear = document.getElementById("mode-linear") as HTMLButtonElement;
const btnModeSchmitz = document.getElementById("mode-schmitz") as HTMLButtonElement;
const btnModeBezier = document.getElementById("mode-bezier") as HTMLButtonElement;
const btnModeFormula = document.getElementById("mode-formula") as HTMLButtonElement;

const controlsLinear = document.getElementById("controls-linear")!;
const controlsSchmitz = document.getElementById("controls-schmitz")!;
const controlsBezier = document.getElementById("controls-bezier")!;
const controlsFormula = document.getElementById("controls-formula")!;

const inputBindTaper = document.getElementById("bind-taper") as HTMLInputElement;
const inputTaperRatio = document.getElementById("taper-ratio") as HTMLInputElement;

const inputRootChord = document.getElementById("root-chord") as HTMLInputElement;
const inputRootTwist = document.getElementById("root-twist") as HTMLInputElement;
const twistSlider = document.getElementById("twist") as HTMLInputElement;
const chordSlider = document.getElementById("chord") as HTMLInputElement;
const twistVal = document.getElementById("twist-val")!;
const chordVal = document.getElementById("chord-val")!;

const inputSchmitzCl = document.getElementById("schmitz-cl") as HTMLInputElement;
const inputSchmitzAlpha = document.getElementById("schmitz-alpha") as HTMLInputElement;

const btnBezierTargetChord = document.getElementById("bezier-target-chord") as HTMLButtonElement;
const btnBezierTargetTwist = document.getElementById("bezier-target-twist") as HTMLButtonElement;
const bezierSvg = document.getElementById("bezier-svg") as unknown as SVGSVGElement;
const bezierPointsBody = document.getElementById("bezier-points-body")!;

const inputFormulaChord = document.getElementById("formula-chord") as HTMLInputElement;
const inputFormulaTwist = document.getElementById("formula-twist") as HTMLInputElement;

const stationTableBody = document.getElementById("station-table-body")!;
const errorBanner = document.getElementById("error-banner")!;

const aeroSummary = document.getElementById("aero-summary")!;
const cpTsrSvg = document.getElementById("cp-tsr-svg") as unknown as SVGSVGElement;
const btnSnapshotA = document.getElementById("btn-snapshot-a") as HTMLButtonElement;
const btnClearA = document.getElementById("btn-clear-a") as HTMLButtonElement;
const abDeltaSummary = document.getElementById("ab-delta-summary")!;
const inputGenKv = document.getElementById("gen-kv") as HTMLInputElement;
const inputGenRInt = document.getElementById("gen-r-int") as HTMLInputElement;
const inputGenRLoad = document.getElementById("gen-r-load") as HTMLInputElement;
const genSummary = document.getElementById("gen-summary")!;
const inputExpData = document.getElementById("exp-data-input") as HTMLTextAreaElement;
const expFitSummary = document.getElementById("exp-fit-summary")!;

let bezierTarget: "chord_mm" | "twist_deg" = "chord_mm";
const lockedSpanRatios: number[] = [];
let baselineBundleA: AeroSimulationBundle | null = null;
let latestBundleB: AeroSimulationBundle | null = null;

function isStationLocked(spanRatio: number): boolean {
  return lockedSpanRatios.some((r) => Math.abs(r - spanRatio) <= RATIO_EPS);
}

function toggleStationLock(spanRatio: number): void {
  const idx = lockedSpanRatios.findIndex((r) => Math.abs(r - spanRatio) <= RATIO_EPS);
  if (idx >= 0) {
    lockedSpanRatios.splice(idx, 1);
  } else {
    lockedSpanRatios.push(spanRatio);
  }
}

// ---- 3D mesh rebuild ----
let mesh: THREE.Mesh | null = null;

function rebuild3D(design: Design) {
  try {
    const start = performance.now();
    const data = build_mesh(JSON.stringify(design), "{}");
    const elapsed = performance.now() - start;

    errorBanner.style.display = "none";
    errorBanner.textContent = "";

    if (mesh !== null) {
      mesh.geometry.dispose();
      scene.remove(mesh);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(data.positions as Float32Array, 3),
    );
    geometry.setIndex(new THREE.BufferAttribute(data.indices as Uint32Array, 1));
    geometry.computeVertexNormals();

    mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x4f8bd6,
        metalness: 0.12,
        roughness: 0.52,
        side: THREE.DoubleSide,
      }),
    );
    scene.add(mesh);

    updateStats(elapsed, data);
    updateAeroPanel(design);
  } catch (err) {
    errorBanner.style.display = "block";
    errorBanner.textContent = String(err);
  }
}

function updateAeroPanel(design: Design) {
  try {
    const kv = Number.parseFloat(inputGenKv.value) || 35;
    const rInt = Number.parseFloat(inputGenRInt.value) || 0.8;
    const rLoad = Number.parseFloat(inputGenRLoad.value) || 5.0;
    const rawJson = simulate_aero(
      JSON.stringify(design),
      JSON.stringify({
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: kv,
        generator_r_int: rInt,
        generator_r_load: rLoad,
      }),
    );
    const bundle = JSON.parse(rawJson) as AeroSimulationBundle;
    latestBundleB = bundle;

    aeroSummary.textContent = `Cp=${bundle.design_point.cp.toFixed(3)} (pk ${bundle.peak_cp.toFixed(
      3,
    )} @ λ=${bundle.peak_tsr.toFixed(1)}) · P=${bundle.design_point.power_w.toFixed(0)} W`;

    if (bundle.generator_match) {
      const gm = bundle.generator_match;
      const st = gm.generator;
      genSummary.textContent = `Eq: ${st.rotor_rpm.toFixed(0)} RPM (λ=${gm.tip_speed_ratio.toFixed(
        2,
      )}) · V_load=${st.terminal_voltage_v.toFixed(1)} V · I=${st.current_a.toFixed(
        2,
      )} A · P_elec=${st.electrical_power_w.toFixed(1)} W (η=${(st.efficiency * 100).toFixed(
        0,
      )}%)`;
    } else {
      genSummary.textContent = "Gen: uncoupled";
    }

    const expPoints = parseExperimentalDataLog(
      inputExpData.value,
      design.rotor.radius_mm,
      design.rotor.wind_speed_mps,
    );
    const fit = evaluateExperimentalFit(bundle.sweep, expPoints);
    if (fit.count > 0) {
      expFitSummary.textContent = `Exp log: ${fit.count} pts · RMSE ΔCp=${fit.rmse_cp.toFixed(
        4,
      )} · MAE=${fit.mae_cp.toFixed(4)}`;
    } else {
      expFitSummary.textContent = "Exp log: 0 pts (enter 'tsr, cp' or 'rpm=.., power_w=..')";
    }

    if (baselineBundleA) {
      const ab = compareABSimulation(baselineBundleA, bundle);
      const signCp = ab.delta_design_cp >= 0 ? "+" : "";
      const signPk = ab.delta_peak_cp >= 0 ? "+" : "";
      const signPw = ab.delta_power_w >= 0 ? "+" : "";
      abDeltaSummary.textContent = `B−A: ΔCp=${signCp}${ab.delta_design_cp.toFixed(
        3,
      )} (pk ${signPk}${ab.delta_peak_cp.toFixed(3)}) · ΔP=${signPw}${ab.delta_power_w.toFixed(
        1,
      )} W`;
    } else {
      abDeltaSummary.textContent = "No Baseline A";
    }

    cpTsrSvg.innerHTML = renderCpTsrSvgMarkup(bundle.sweep, {
      baselineASweep: baselineBundleA ? baselineBundleA.sweep : null,
      experimentalPoints: expPoints,
      designTsr: design.rotor.design_tsr,
    });
  } catch (err) {
    aeroSummary.textContent = `Aero error: ${String(err)}`;
  }
}

function updateStats(
  elapsed: number,
  data: {
    triangle_count: number;
    volume_mm3: number;
    span_min_mm: number;
    span_max_mm: number;
  },
) {
  const ms = document.getElementById("ms")!;
  ms.textContent = `${elapsed.toFixed(1)} ms`;
  ms.className = elapsed < 50 ? "ok" : "slow";
  document.getElementById("tris")!.textContent = String(data.triangle_count);
  document.getElementById("vol")!.textContent = data.volume_mm3.toFixed(0);
  document.title = `BladeLab · ${data.span_min_mm.toFixed(0)}–${data.span_max_mm.toFixed(
    0,
  )} mm · ${elapsed.toFixed(1)} ms`;
}

// ---- UI synchronization ----
function activeDistributionMode(design: Design): "linear" | "schmitz" | "bezier" | "formula" {
  const { chord_mm, twist_deg } = design.distributions;
  if (chord_mm.type === "bezier" || twist_deg.type === "bezier") return "bezier";
  if (chord_mm.type === "formula" || twist_deg.type === "formula") return "formula";
  if (chord_mm.type === "schmitz" || twist_deg.type === "schmitz") return "schmitz";
  return "linear";
}

function syncControlsFromDesign(design: Design) {
  const { rotor, distributions } = design;

  rotorSummary.textContent = `R=${rotor.radius_mm} mm · B=${rotor.blade_count} · λ=${rotor.design_tsr}`;
  inputRadius.value = String(rotor.radius_mm);
  inputHubRadius.value = String(rotor.hub_radius_mm);
  inputBlades.value = String(rotor.blade_count);
  inputTsr.value = String(rotor.design_tsr);
  inputWind.value = String(rotor.wind_speed_mps);
  inputStations.value = String(rotor.station_count);

  const mode = activeDistributionMode(design);
  btnModeLinear.classList.toggle("active", mode === "linear");
  btnModeSchmitz.classList.toggle("active", mode === "schmitz");
  btnModeBezier.classList.toggle("active", mode === "bezier");
  btnModeFormula.classList.toggle("active", mode === "formula");

  controlsLinear.style.display = mode === "linear" ? "block" : "none";
  controlsSchmitz.style.display = mode === "schmitz" ? "block" : "none";
  controlsBezier.style.display = mode === "bezier" ? "block" : "none";
  controlsFormula.style.display = mode === "formula" ? "block" : "none";

  if (distributions.chord_mm.type === "linear") {
    inputRootChord.value = String(distributions.chord_mm.root);
    chordSlider.value = String(distributions.chord_mm.tip);
    chordVal.textContent = `${distributions.chord_mm.tip} mm`;
  }
  if (distributions.twist_deg.type === "linear") {
    inputRootTwist.value = String(distributions.twist_deg.root);
    twistSlider.value = String(distributions.twist_deg.tip);
    twistVal.textContent = `${distributions.twist_deg.tip}°`;
  }
  if (distributions.chord_mm.type === "schmitz") {
    inputSchmitzCl.value = String(distributions.chord_mm.design_cl ?? 1.0);
  }
  if (distributions.twist_deg.type === "schmitz") {
    inputSchmitzAlpha.value = String(distributions.twist_deg.design_alpha_deg ?? 6.0);
  }
  if (distributions.chord_mm.type === "formula") {
    inputFormulaChord.value = distributions.chord_mm.expr;
  }
  if (distributions.twist_deg.type === "formula") {
    inputFormulaTwist.value = distributions.twist_deg.expr;
  }

  btnBezierTargetChord.classList.toggle("active", bezierTarget === "chord_mm");
  btnBezierTargetTwist.classList.toggle("active", bezierTarget === "twist_deg");
  renderBezierEditor(design);

  const counts = history.counts();
  btnUndo.disabled = !history.canUndo();
  btnRedo.disabled = !history.canRedo();
  btnUndo.textContent = counts.undo > 0 ? `↶ Undo (${counts.undo})` : "↶ Undo";
  btnRedo.textContent = counts.redo > 0 ? `↷ Redo (${counts.redo})` : "↷ Redo";

  renderStationTable(design);
}

function getBezierPointsForTarget(
  design: Design,
  target: "chord_mm" | "twist_deg",
): BezierControlPoint[] {
  const curve = design.distributions[target];
  if (curve.type === "bezier") {
    return curve.points;
  }
  return target === "chord_mm" ? defaultChordBezierPoints() : defaultTwistBezierPoints();
}

function renderBezierEditor(design: Design) {
  const pts = getBezierPointsForTarget(design, bezierTarget);
  const w = 320;
  const h = 150;
  const padX = 24;
  const padY = 18;
  const yMin = bezierTarget === "chord_mm" ? 5 : -20;
  const yMax = bezierTarget === "chord_mm" ? 140 : 45;

  const toSvgX = (x: number) => padX + x * (w - 2 * padX);
  const toSvgY = (y: number) =>
    h - padY - ((y - yMin) / Math.max(1e-6, yMax - yMin)) * (h - 2 * padY);

  const samples: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const s = i / 48;
    const y = evalBezierPoints(pts, s);
    samples.push(`${i === 0 ? "M" : "L"}${toSvgX(s).toFixed(1)},${toSvgY(y).toFixed(1)}`);
  }
  const polyPts = pts.map((p) => `${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`).join(" ");

  bezierSvg.innerHTML = `
    <polyline points="${polyPts}" fill="none" stroke="#4a5568" stroke-width="1" stroke-dasharray="3 3" />
    <path d="${samples.join(" ")}" fill="none" stroke="#5b9bf0" stroke-width="2" />
  `;

  pts.forEach((pt, idx) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", toSvgX(pt.x).toFixed(1));
    circle.setAttribute("cy", toSvgY(pt.y).toFixed(1));
    circle.setAttribute("r", "5.5");
    circle.setAttribute("fill", idx === 0 || idx === pts.length - 1 ? "#f5a623" : "#9ec5ff");
    circle.setAttribute("stroke", "#111318");
    circle.setAttribute("stroke-width", "1.5");
    circle.style.cursor = "grab";

    circle.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      circle.setPointerCapture(ev.pointerId);
      const baseSnap = history.current();

      const onMove = (moveEv: PointerEvent) => {
        const rect = bezierSvg.getBoundingClientRect();
        const relX = (moveEv.clientX - rect.left) * (w / Math.max(1, rect.width));
        const relY = (moveEv.clientY - rect.top) * (h / Math.max(1, rect.height));
        const normX =
          idx === 0
            ? 0
            : idx === pts.length - 1
              ? 1
              : Math.min(1, Math.max(0, (relX - padX) / (w - 2 * padX)));
        const valY =
          yMin + (1 - (relY - padY) / (h - 2 * padY)) * (yMax - yMin);
        workingDesign = updateBezierControlPoint(
          baseSnap,
          bezierTarget,
          idx,
          {
            x: Number(normX.toFixed(3)),
            y: Number(Math.min(yMax, Math.max(yMin, valY)).toFixed(2)),
          },
          lockedSpanRatios,
        );
        renderBezierEditor(workingDesign);
        renderStationTable(workingDesign);
        rebuild3D(workingDesign);
      };

      const onUp = () => {
        circle.removeEventListener("pointermove", onMove);
        circle.removeEventListener("pointerup", onUp);
        commitDesign(workingDesign);
      };

      circle.addEventListener("pointermove", onMove);
      circle.addEventListener("pointerup", onUp);
    });

    bezierSvg.appendChild(circle);
  });

  bezierPointsBody.innerHTML = "";
  pts.forEach((pt, idx) => {
    const tr = document.createElement("tr");
    const tdLabel = document.createElement("td");
    tdLabel.textContent = `P${idx}`;

    const tdX = document.createElement("td");
    const inputX = document.createElement("input");
    inputX.type = "number";
    inputX.step = "0.05";
    inputX.min = "0";
    inputX.max = "1";
    inputX.value = pt.x.toFixed(3);
    inputX.disabled = idx === 0 || idx === pts.length - 1;
    inputX.addEventListener("change", () => {
      const val = Number.parseFloat(inputX.value);
      if (Number.isFinite(val)) {
        commitDesign(
          updateBezierControlPoint(workingDesign, bezierTarget, idx, { x: val }, lockedSpanRatios),
        );
      }
    });
    tdX.appendChild(inputX);

    const tdY = document.createElement("td");
    const inputY = document.createElement("input");
    inputY.type = "number";
    inputY.step = "0.5";
    inputY.value = pt.y.toFixed(2);
    inputY.addEventListener("change", () => {
      const val = Number.parseFloat(inputY.value);
      if (Number.isFinite(val)) {
        commitDesign(
          updateBezierControlPoint(workingDesign, bezierTarget, idx, { y: val }, lockedSpanRatios),
        );
      }
    });
    tdY.appendChild(inputY);

    tr.append(tdLabel, tdX, tdY);
    bezierPointsBody.appendChild(tr);
  });
}

function renderStationTable(design: Design) {
  const rows = resolveStationsPreview(design);
  stationTableBody.innerHTML = "";

  for (const row of rows) {
    const tr = document.createElement("tr");
    if (row.has_override) {
      tr.classList.add("overridden");
    }

    const tdIndex = document.createElement("td");
    tdIndex.textContent = String(row.index + 1);

    const tdRatio = document.createElement("td");
    tdRatio.textContent = row.span_ratio.toFixed(3);

    const tdRadius = document.createElement("td");
    tdRadius.textContent = row.radius_mm.toFixed(1);

    const tdChord = document.createElement("td");
    const chordInput = document.createElement("input");
    chordInput.type = "number";
    chordInput.step = "0.5";
    chordInput.min = "2";
    chordInput.max = "500";
    chordInput.value = row.effective_chord_mm.toFixed(2);
    chordInput.title =
      row.override_chord_mm !== null
        ? `Layer 3 override (base: ${row.base_chord_mm.toFixed(2)} mm)`
        : `Layer 1/2 base (${row.base_chord_mm.toFixed(2)} mm)`;
    chordInput.addEventListener("change", () => {
      const val = Number.parseFloat(chordInput.value);
      if (Number.isFinite(val) && val > 0) {
        commitDesign(
          setStationOverride(workingDesign, row.span_ratio, { chord_mm: val }),
        );
      }
    });
    tdChord.appendChild(chordInput);

    const tdTwist = document.createElement("td");
    const twistInput = document.createElement("input");
    twistInput.type = "number";
    twistInput.step = "0.25";
    twistInput.min = "-90";
    twistInput.max = "90";
    twistInput.value = row.effective_twist_deg.toFixed(2);
    twistInput.title =
      row.override_twist_deg !== null
        ? `Layer 3 override (base: ${row.base_twist_deg.toFixed(2)}°)`
        : `Layer 1/2 base (${row.base_twist_deg.toFixed(2)}°)`;
    twistInput.addEventListener("change", () => {
      const val = Number.parseFloat(twistInput.value);
      if (Number.isFinite(val)) {
        commitDesign(
          setStationOverride(workingDesign, row.span_ratio, { twist_deg: val }),
        );
      }
    });
    tdTwist.appendChild(twistInput);

    const tdLock = document.createElement("td");
    const locked = isStationLocked(row.span_ratio);
    const lockBtn = document.createElement("button");
    lockBtn.type = "button";
    lockBtn.className = locked ? "lock-btn locked" : "lock-btn";
    lockBtn.textContent = locked ? "🔒" : "🔓";
    lockBtn.title = locked
      ? "Station locked against Layer 1/2 changes (click to unlock)"
      : "Click to lock station against Layer 1/2 changes";
    lockBtn.addEventListener("click", () => {
      toggleStationLock(row.span_ratio);
      renderStationTable(workingDesign);
    });
    tdLock.appendChild(lockBtn);

    const tdClear = document.createElement("td");
    if (row.has_override) {
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "btn-mini";
      clearBtn.textContent = "×";
      clearBtn.title = "Clear station override";
      clearBtn.addEventListener("click", () => {
        commitDesign(clearStationOverride(workingDesign, row.span_ratio));
      });
      tdClear.appendChild(clearBtn);
    }

    tr.append(tdIndex, tdRatio, tdRadius, tdChord, tdTwist, tdLock, tdClear);
    stationTableBody.appendChild(tr);
  }
}

function commitDesign(next: Design) {
  history.commit(next);
  workingDesign = history.current();
  syncControlsFromDesign(workingDesign);
  rebuild3D(workingDesign);
}

// ---- Layer 1 Rotor Listeners ----
function bindRotorNumberInput(input: HTMLInputElement, field: keyof Design["rotor"], isInt = false) {
  input.addEventListener("change", () => {
    const raw = isInt ? Number.parseInt(input.value, 10) : Number.parseFloat(input.value);
    if (Number.isFinite(raw)) {
      commitDesign(updateRotorField(workingDesign, field, raw));
    }
  });
}

bindRotorNumberInput(inputRadius, "radius_mm");
bindRotorNumberInput(inputHubRadius, "hub_radius_mm");
bindRotorNumberInput(inputBlades, "blade_count", true);
bindRotorNumberInput(inputTsr, "design_tsr");
bindRotorNumberInput(inputWind, "wind_speed_mps");
bindRotorNumberInput(inputStations, "station_count", true);

// ---- Layer 1/2 Distribution Listeners ----
btnModeLinear.addEventListener("click", () => {
  const rootChord = Number.parseFloat(inputRootChord.value) || 70;
  const tipChord = Number.parseFloat(chordSlider.value) || 35;
  const rootTwist = Number.parseFloat(inputRootTwist.value) || 20;
  const tipTwist = Number.parseFloat(twistSlider.value) || 3;
  commitDesign(
    applyLinearLayer1(workingDesign, rootChord, tipChord, rootTwist, tipTwist, lockedSpanRatios),
  );
});

btnModeSchmitz.addEventListener("click", () => {
  const cl = Number.parseFloat(inputSchmitzCl.value) || 1.0;
  const alpha = Number.parseFloat(inputSchmitzAlpha.value) || 6.0;
  commitDesign(applySchmitzLayer1(workingDesign, cl, alpha, lockedSpanRatios));
});

btnModeBezier.addEventListener("click", () => {
  const chordPts = getBezierPointsForTarget(workingDesign, "chord_mm");
  const twistPts = getBezierPointsForTarget(workingDesign, "twist_deg");
  const withChord = applyBezierCurve(workingDesign, "chord_mm", chordPts, lockedSpanRatios);
  commitDesign(applyBezierCurve(withChord, "twist_deg", twistPts, lockedSpanRatios));
});

btnModeFormula.addEventListener("click", () => {
  const chordExpr = inputFormulaChord.value.trim() || "70 - 35 * s";
  const twistExpr = inputFormulaTwist.value.trim() || "20 - 17 * s";
  const withChord = applyFormulaCurve(workingDesign, "chord_mm", chordExpr, lockedSpanRatios);
  commitDesign(applyFormulaCurve(withChord, "twist_deg", twistExpr, lockedSpanRatios));
});

btnBezierTargetChord.addEventListener("click", () => {
  bezierTarget = "chord_mm";
  syncControlsFromDesign(workingDesign);
});

btnBezierTargetTwist.addEventListener("click", () => {
  bezierTarget = "twist_deg";
  syncControlsFromDesign(workingDesign);
});

inputFormulaChord.addEventListener("change", () => {
  commitDesign(
    applyFormulaCurve(workingDesign, "chord_mm", inputFormulaChord.value, lockedSpanRatios),
  );
});

inputFormulaTwist.addEventListener("change", () => {
  commitDesign(
    applyFormulaCurve(workingDesign, "twist_deg", inputFormulaTwist.value, lockedSpanRatios),
  );
});

inputRootChord.addEventListener("change", () => {
  const val = Number.parseFloat(inputRootChord.value);
  if (!Number.isFinite(val)) return;
  if (inputBindTaper.checked) {
    const ratio = Number.parseFloat(inputTaperRatio.value) || 0.5;
    commitDesign(applyBoundRootChord(workingDesign, val, ratio, lockedSpanRatios));
    return;
  }
  if (workingDesign.distributions.chord_mm.type === "linear") {
    const next = cloneDesign(workingDesign);
    next.distributions.chord_mm = {
      type: "linear",
      root: val,
      tip: workingDesign.distributions.chord_mm.tip,
    };
    commitDesign(preserveLockedStations(workingDesign, next, lockedSpanRatios));
  }
});

inputTaperRatio.addEventListener("change", () => {
  if (inputBindTaper.checked) {
    const rootVal = Number.parseFloat(inputRootChord.value) || 70;
    const ratio = Number.parseFloat(inputTaperRatio.value) || 0.5;
    commitDesign(applyBoundRootChord(workingDesign, rootVal, ratio, lockedSpanRatios));
  }
});

inputRootTwist.addEventListener("change", () => {
  const val = Number.parseFloat(inputRootTwist.value);
  if (Number.isFinite(val) && workingDesign.distributions.twist_deg.type === "linear") {
    const next = cloneDesign(workingDesign);
    next.distributions.twist_deg = {
      type: "linear",
      root: val,
      tip: workingDesign.distributions.twist_deg.tip,
    };
    commitDesign(preserveLockedStations(workingDesign, next, lockedSpanRatios));
  }
});

// Live range sliders: `input` updates 3D view & table in < 50 ms, `change` commits to Undo stack
function applySliderEditToDesign(base: Design): Design {
  const next = cloneDesign(base);
  if (next.distributions.twist_deg.type === "linear") {
    next.distributions.twist_deg.tip = twistSlider.valueAsNumber;
  }
  if (next.distributions.chord_mm.type === "linear") {
    next.distributions.chord_mm.tip = chordSlider.valueAsNumber;
  }
  return preserveLockedStations(base, next, lockedSpanRatios);
}

function onSliderInput() {
  twistVal.textContent = `${twistSlider.valueAsNumber}°`;
  chordVal.textContent = `${chordSlider.valueAsNumber} mm`;
  workingDesign = applySliderEditToDesign(history.current());
  renderStationTable(workingDesign);
  rebuild3D(workingDesign);
}

function onSliderChange() {
  commitDesign(applySliderEditToDesign(history.current()));
}

twistSlider.addEventListener("input", onSliderInput);
chordSlider.addEventListener("input", onSliderInput);
twistSlider.addEventListener("change", onSliderChange);
chordSlider.addEventListener("change", onSliderChange);

inputSchmitzCl.addEventListener("change", () => {
  const cl = Number.parseFloat(inputSchmitzCl.value);
  const alpha = Number.parseFloat(inputSchmitzAlpha.value) || 6.0;
  if (Number.isFinite(cl) && cl > 0) {
    commitDesign(applySchmitzLayer1(workingDesign, cl, alpha, lockedSpanRatios));
  }
});

inputSchmitzAlpha.addEventListener("change", () => {
  const cl = Number.parseFloat(inputSchmitzCl.value) || 1.0;
  const alpha = Number.parseFloat(inputSchmitzAlpha.value);
  if (Number.isFinite(alpha)) {
    commitDesign(applySchmitzLayer1(workingDesign, cl, alpha, lockedSpanRatios));
  }
});

// ---- Value Scrubbing on [data-scrub-for] labels ----
document.querySelectorAll<HTMLElement>("[data-scrub-for]").forEach((labelEl) => {
  const targetId = labelEl.dataset.scrubFor;
  if (!targetId) return;
  const inputEl = document.getElementById(targetId) as HTMLInputElement | null;
  if (!inputEl) return;

  labelEl.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    labelEl.setPointerCapture(ev.pointerId);
    const startX = ev.clientX;
    const startVal = Number.parseFloat(inputEl.value) || 0;
    const step = Number.parseFloat(inputEl.step) || 1;
    const min = inputEl.min !== "" ? Number.parseFloat(inputEl.min) : undefined;
    const max = inputEl.max !== "" ? Number.parseFloat(inputEl.max) : undefined;

    const onMove = (moveEv: PointerEvent) => {
      const nextVal = applyScrubDelta(
        startVal,
        moveEv.clientX - startX,
        step,
        { shiftKey: moveEv.shiftKey, altKey: moveEv.altKey },
        { min, max },
      );
      inputEl.value = String(nextVal);
      inputEl.dispatchEvent(new Event("change"));
    };

    const onUp = () => {
      labelEl.removeEventListener("pointermove", onMove);
      labelEl.removeEventListener("pointerup", onUp);
    };

    labelEl.addEventListener("pointermove", onMove);
    labelEl.addEventListener("pointerup", onUp);
  });
});

// ---- Layer 3 Clear All Overrides ----
btnClearOverrides.addEventListener("click", () => {
  commitDesign(clearAllOverrides(workingDesign));
});

// ---- Phase 3 Aero / A-B / Generator / Test Data Listeners ----
btnSnapshotA.addEventListener("click", () => {
  if (latestBundleB) {
    baselineBundleA = JSON.parse(JSON.stringify(latestBundleB)) as AeroSimulationBundle;
    btnClearA.disabled = false;
    updateAeroPanel(workingDesign);
  }
});

btnClearA.addEventListener("click", () => {
  baselineBundleA = null;
  btnClearA.disabled = true;
  updateAeroPanel(workingDesign);
});

[inputGenKv, inputGenRInt, inputGenRLoad].forEach((el) => {
  el.addEventListener("change", () => updateAeroPanel(workingDesign));
});

inputExpData.addEventListener("input", () => {
  updateAeroPanel(workingDesign);
});

// ---- Undo / Redo / Reset ----
function performUndo() {
  const prev = history.undo();
  if (prev) {
    workingDesign = prev;
    syncControlsFromDesign(workingDesign);
    rebuild3D(workingDesign);
  }
}

function performRedo() {
  const next = history.redo();
  if (next) {
    workingDesign = next;
    syncControlsFromDesign(workingDesign);
    rebuild3D(workingDesign);
  }
}

btnUndo.addEventListener("click", performUndo);
btnRedo.addEventListener("click", performRedo);
btnReset.addEventListener("click", () => {
  commitDesign(initialDesign);
});

addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    if (event.shiftKey) {
      event.preventDefault();
      performRedo();
    } else {
      event.preventDefault();
      performUndo();
    }
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
    event.preventDefault();
    performRedo();
  }
});

// ---- render loop ----
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

syncControlsFromDesign(workingDesign);
rebuild3D(workingDesign);
