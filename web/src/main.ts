// Real-time blade workbench (T-008 + T-105):
// - Layer 1 rotor & distribution controls (Linear / Schmitz)
// - Layer 3 per-station override table
// - Undo / Redo history stack (buttons + Ctrl+Z / Ctrl+Y)
// - Live < 50 ms Three.js mesh rebuild via blade-wasm

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import wasmUrl from "../pkg/blade_wasm_bg.wasm?url";
import init, { build_mesh } from "../pkg/blade_wasm.js";
import designJson from "./designs/naca4412-linear.json?raw";
import {
  applyLinearLayer1,
  applySchmitzLayer1,
  clearAllOverrides,
  clearStationOverride,
  cloneDesign,
  DesignHistory,
  resolveStationsPreview,
  setStationOverride,
  updateRotorField,
} from "./state";
import type { Design } from "./types/blade-model";

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
const controlsLinear = document.getElementById("controls-linear")!;
const controlsSchmitz = document.getElementById("controls-schmitz")!;

const inputRootChord = document.getElementById("root-chord") as HTMLInputElement;
const inputRootTwist = document.getElementById("root-twist") as HTMLInputElement;
const twistSlider = document.getElementById("twist") as HTMLInputElement;
const chordSlider = document.getElementById("chord") as HTMLInputElement;
const twistVal = document.getElementById("twist-val")!;
const chordVal = document.getElementById("chord-val")!;

const inputSchmitzCl = document.getElementById("schmitz-cl") as HTMLInputElement;
const inputSchmitzAlpha = document.getElementById("schmitz-alpha") as HTMLInputElement;

const stationTableBody = document.getElementById("station-table-body")!;
const errorBanner = document.getElementById("error-banner")!;

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
  } catch (err) {
    errorBanner.style.display = "block";
    errorBanner.textContent = String(err);
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
function syncControlsFromDesign(design: Design) {
  const { rotor, distributions } = design;

  rotorSummary.textContent = `R=${rotor.radius_mm} mm · B=${rotor.blade_count} · λ=${rotor.design_tsr}`;
  inputRadius.value = String(rotor.radius_mm);
  inputHubRadius.value = String(rotor.hub_radius_mm);
  inputBlades.value = String(rotor.blade_count);
  inputTsr.value = String(rotor.design_tsr);
  inputWind.value = String(rotor.wind_speed_mps);
  inputStations.value = String(rotor.station_count);

  const isSchmitz =
    distributions.chord_mm.type === "schmitz" ||
    distributions.twist_deg.type === "schmitz";

  btnModeLinear.classList.toggle("active", !isSchmitz);
  btnModeSchmitz.classList.toggle("active", isSchmitz);
  controlsLinear.style.display = isSchmitz ? "none" : "block";
  controlsSchmitz.style.display = isSchmitz ? "block" : "none";

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

  const counts = history.counts();
  btnUndo.disabled = !history.canUndo();
  btnRedo.disabled = !history.canRedo();
  btnUndo.textContent = counts.undo > 0 ? `↶ Undo (${counts.undo})` : "↶ Undo";
  btnRedo.textContent = counts.redo > 0 ? `↷ Redo (${counts.redo})` : "↷ Redo";

  renderStationTable(design);
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

    tr.append(tdIndex, tdRatio, tdRadius, tdChord, tdTwist, tdClear);
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
  commitDesign(applyLinearLayer1(workingDesign, rootChord, tipChord, rootTwist, tipTwist));
});

btnModeSchmitz.addEventListener("click", () => {
  const cl = Number.parseFloat(inputSchmitzCl.value) || 1.0;
  const alpha = Number.parseFloat(inputSchmitzAlpha.value) || 6.0;
  commitDesign(applySchmitzLayer1(workingDesign, cl, alpha));
});

inputRootChord.addEventListener("change", () => {
  const val = Number.parseFloat(inputRootChord.value);
  if (Number.isFinite(val) && workingDesign.distributions.chord_mm.type === "linear") {
    const next = cloneDesign(workingDesign);
    next.distributions.chord_mm = {
      type: "linear",
      root: val,
      tip: workingDesign.distributions.chord_mm.tip,
    };
    commitDesign(next);
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
    commitDesign(next);
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
  return next;
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
    commitDesign(applySchmitzLayer1(workingDesign, cl, alpha));
  }
});

inputSchmitzAlpha.addEventListener("change", () => {
  const cl = Number.parseFloat(inputSchmitzCl.value) || 1.0;
  const alpha = Number.parseFloat(inputSchmitzAlpha.value);
  if (Number.isFinite(alpha)) {
    commitDesign(applySchmitzLayer1(workingDesign, cl, alpha));
  }
});

// ---- Layer 3 Clear All Overrides ----
btnClearOverrides.addEventListener("click", () => {
  commitDesign(clearAllOverrides(workingDesign));
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
