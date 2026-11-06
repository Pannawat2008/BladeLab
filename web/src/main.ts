// Real-time BladeLab CAD & BEM Telemetry Workbench:
// - Layer 1 rotor & distribution controls (Linear / Schmitz) + direct Blade Length & Pitch Axis
// - Layer 2 interactive Bézier curve editor, Formula inputs & live 2D Airfoil Section SVG
// - Value scrubbing (Shift 10× / Alt 0.1×), station locking & taper binding
// - Layer 3 per-station override table
// - Undo / Redo history stack (buttons + Ctrl+Z / Ctrl+Y)
// - Full 3D Rotor Assembly view (B blades + hub) + Global IBL & 3-point Studio Illumination
// - One-click STL, 3MF, STEP, and JSON export + Phase 3 BEM telemetry & experimental data fit

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import wasmUrl from "../pkg/blade_wasm_bg.wasm?url";
import init, {
  build_mesh,
  export_3mf_bytes,
  export_fabricated_3mf_bytes,
  export_fabricated_stl_bytes,
  export_stl_bytes,
  fabrication_report,
  optimize_blade_wasm,
  simulate_aero,
} from "../pkg/blade_wasm.js";
import designJson from "./designs/naca4412-linear.json?raw";
import {
  type AeroSimulationBundle,
  applyBezierCurve,
  buildCosinePlateauExpr,
  planformZones,
  applyBoundRootChord,
  applyFormulaCurve,
  applyLinearLayer1,
  applySchmitzLayer1,
  applyScrubDelta,
  clearAllOverrides,
  clearStationOverride,
  cloneDesign,
  evalChordCurve,  compareABSimulation,
  defaultChordBezierPoints,
  defaultTwistBezierPoints,
  DesignHistory,
  evalBezierPoints,
  evaluateExperimentalFit,
  parseExperimentalDataLog,
  preserveLockedStations,
  RATIO_EPS,
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
} from "./state";
import type { AirfoilSpec, BezierControlPoint, Design } from "./types/blade-model";

// ---- wasm bootstrap ----
await init(wasmUrl);
const initialDesign: Design = JSON.parse(designJson) as Design;
const history = new DesignHistory(initialDesign);
let workingDesign: Design = history.current();

// ---- scene ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0f14);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 1, 10000);
camera.position.set(420, 320, 820);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
document.getElementById("app")!.appendChild(renderer.domElement);

// Global Image-Based Lighting (IBL) via PMREM RoomEnvironment
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.85;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 120);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.update();

// Omnidirectional global + 3-point studio light rig (zero dark sides when orbiting)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xeef4ff, 0x384152, 1.35);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
keyLight.position.set(220, 340, 380);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
fillLight.position.set(-240, -190, -260);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xfef3c7, 0.95);
rimLight.position.set(-160, 240, -360);
scene.add(rimLight);

function setGlobalIlluminationScale(scale: number) {
  const s = Math.max(0.1, scale);
  renderer.toneMappingExposure = 1.05 * s;
  scene.environmentIntensity = 0.65 * s;
  ambientLight.intensity = 0.7 * s;
  hemiLight.intensity = 1.0 * s;
  keyLight.intensity = 1.4 * s;
  fillLight.intensity = 0.9 * s;
  rimLight.intensity = 0.7 * s;
}
setGlobalIlluminationScale(1.35);

const grid = new THREE.GridHelper(1800, 36, 0x2c3648, 0x181f2b);
grid.position.y = -120;
scene.add(grid);

// ---- DOM elements ----
const btnUndo = document.getElementById("btn-undo") as HTMLButtonElement;
const btnRedo = document.getElementById("btn-redo") as HTMLButtonElement;
const btnReset = document.getElementById("btn-reset") as HTMLButtonElement;
const btnClearOverrides = document.getElementById("btn-clear-overrides") as HTMLButtonElement;

const btnViewSingle = document.getElementById("btn-view-single") as HTMLButtonElement;
const btnViewRotor = document.getElementById("btn-view-rotor") as HTMLButtonElement;
const btnViewWireframe = document.getElementById("btn-view-wireframe") as HTMLButtonElement;
const btnViewSpin = document.getElementById("btn-view-spin") as HTMLButtonElement;
const btnCamIso = document.getElementById("btn-cam-iso") as HTMLButtonElement;
const btnCamTop = document.getElementById("btn-cam-top") as HTMLButtonElement;
const btnCamTip = document.getElementById("btn-cam-tip") as HTMLButtonElement;

const selectExportPart = document.getElementById("export-part") as HTMLSelectElement;
const btnExportStl = document.getElementById("btn-export-stl") as HTMLButtonElement;
const btnExport3mf = document.getElementById("btn-export-3mf") as HTMLButtonElement;
const btnExportStep = document.getElementById("btn-export-step") as HTMLButtonElement;
const btnExportJson = document.getElementById("btn-export-json") as HTMLButtonElement;
const exportStatus = document.getElementById("export-status")!;

const rotorSummary = document.getElementById("rotor-summary")!;
const inputRadius = document.getElementById("rotor-radius") as HTMLInputElement;
const inputHubRadius = document.getElementById("rotor-hub-radius") as HTMLInputElement;
const inputBlades = document.getElementById("rotor-blades") as HTMLInputElement;
const inputTsr = document.getElementById("rotor-tsr") as HTMLInputElement;
const inputWind = document.getElementById("rotor-wind") as HTMLInputElement;
const inputStations = document.getElementById("rotor-stations") as HTMLInputElement;
const inputBladeLength = document.getElementById("rotor-blade-length") as HTMLInputElement;
const inputPitchAxis = document.getElementById("rotor-pitch-axis") as HTMLInputElement;
const sliderBladeLength = document.getElementById("rotor-length-slider") as HTMLInputElement;
const bladeLengthVal = document.getElementById("blade-length-val")!;
const sliderChordOffsetX = document.getElementById("chord-offset-x") as HTMLInputElement;
const chordOffsetXVal = document.getElementById("chord-offset-x-val")!;
const sliderChordOffsetY = document.getElementById("chord-offset-y") as HTMLInputElement;
const chordOffsetYVal = document.getElementById("chord-offset-y-val")!;
const sliderGlobalLight = document.getElementById("global-light-intensity") as HTMLInputElement;
const globalLightVal = document.getElementById("global-light-val")!;

const btnChordMinus = document.getElementById("btn-chord-minus") as HTMLButtonElement;
const btnChordPlus = document.getElementById("btn-chord-plus") as HTMLButtonElement;
const btnChordNarrow = document.getElementById("btn-chord-narrow") as HTMLButtonElement;
const btnChordWiden = document.getElementById("btn-chord-widen") as HTMLButtonElement;

const selectAirfoilFamily = document.getElementById("airfoil-family") as HTMLSelectElement;
const naca4Controls = document.getElementById("naca4-controls")!;
const inputAirfoilThickness = document.getElementById("airfoil-thickness") as HTMLInputElement;
const inputAirfoilCamber = document.getElementById("airfoil-camber") as HTMLInputElement;
const airfoilPreviewSvg = document.getElementById("airfoil-preview-svg") as unknown as SVGSVGElement;

const btnPlanformLinear = document.getElementById("planform-linear") as HTMLButtonElement;
const btnPlanformCosine = document.getElementById("planform-cosine") as HTMLButtonElement;
const sliderPlanformCenter = document.getElementById("planform-center") as HTMLInputElement;
const sliderPlanformWidth = document.getElementById("planform-width") as HTMLInputElement;
const planformCenterVal = document.getElementById("planform-center-val")!;
const planformWidthVal = document.getElementById("planform-width-val")!;
const planformBadge = document.getElementById("planform-badge")!;
const planformCard = document.querySelector(".planform-card") as HTMLElement;
const planformZoneBar = document.getElementById("planform-zone-bar")!;
const planformZoneRanges = document.getElementById("planform-zone-ranges")!;
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

const fabSummary = document.getElementById("fab-summary")!;
const inputSparHoleEnabled = document.getElementById("spar-hole-enabled") as HTMLInputElement;
const inputSparShowRod = document.getElementById("spar-show-rod") as HTMLInputElement;
const btnCf4 = document.getElementById("btn-cf-4") as HTMLButtonElement;
const btnCf5 = document.getElementById("btn-cf-5") as HTMLButtonElement;
const btnCf6 = document.getElementById("btn-cf-6") as HTMLButtonElement;
const btnCf8 = document.getElementById("btn-cf-8") as HTMLButtonElement;
const btnSparFullSpan = document.getElementById("btn-spar-full-span") as HTMLButtonElement;
const inputSparHoleDiameter = document.getElementById("spar-hole-diameter") as HTMLInputElement;
const inputSparHoleDepth = document.getElementById("spar-hole-depth") as HTMLInputElement;
const inputSparHoleOffsetX = document.getElementById("spar-hole-offset-x") as HTMLInputElement;
const inputSparHoleOffsetY = document.getElementById("spar-hole-offset-y") as HTMLInputElement;
const sliderSparHoleDepth = document.getElementById("spar-hole-depth-slider") as HTMLInputElement;
const sparHoleDepthVal = document.getElementById("spar-hole-depth-val")!;
const sparHoleStatus = document.getElementById("spar-hole-status")!;
const selectSplitParts = document.getElementById("split-parts") as HTMLSelectElement;
const selectSplitActivePart = document.getElementById("split-active-part") as HTMLSelectElement;
const sliderSplitRatio = document.getElementById("split-ratio-slider") as HTMLInputElement;
const splitRatioVal = document.getElementById("split-ratio-val")!;
const sliderSplitExplodeGap = document.getElementById("split-explode-gap") as HTMLInputElement;
const splitExplodeVal = document.getElementById("split-explode-val")!;
const btnExportSplitAll = document.getElementById("btn-export-split-all") as HTMLButtonElement;
const inputSparHoleTolerance = document.getElementById("spar-hole-tolerance") as HTMLInputElement;
const selectAlignShape = document.getElementById("align-shape") as HTMLSelectElement;
const selectAlignCount = document.getElementById("align-count") as HTMLSelectElement;
const inputAlignSize = document.getElementById("align-size") as HTMLInputElement;
const inputAlignKeyLength = document.getElementById("align-key-length") as HTMLInputElement;
const inputAlignHeight = document.getElementById("align-height") as HTMLInputElement;
const inputAlignSpacing = document.getElementById("align-spacing") as HTMLInputElement;
const inputAlignClearance = document.getElementById("align-clearance") as HTMLInputElement;
const inputAlignDepthClearance = document.getElementById(
  "align-depth-clearance",
) as HTMLInputElement;
const inputAlignMinWall = document.getElementById("align-min-wall") as HTMLInputElement;
const btnFitTight = document.getElementById("btn-fit-tight") as HTMLButtonElement;
const btnFitStandard = document.getElementById("btn-fit-standard") as HTMLButtonElement;
const btnFitLoose = document.getElementById("btn-fit-loose") as HTMLButtonElement;
const alignStatus = document.getElementById("align-status")!;

const stationTableBody = document.getElementById("station-table-body")!;
const errorBanner = document.getElementById("error-banner")!;

const aeroSummary = document.getElementById("aero-summary")!;
const kpiCp = document.getElementById("kpi-cp")!;
const kpiBetzPct = document.getElementById("kpi-betz-pct");
const kpiBetzBar = document.getElementById("kpi-betz-bar") as HTMLElement | null;
const kpiPeakCp = document.getElementById("kpi-peak-cp")!;
const kpiPower = document.getElementById("kpi-power")!;
const kpiGenElec = document.getElementById("kpi-gen-elec")!;
const hudRotorSpec = document.getElementById("hud-rotor-spec");
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
let planformCosine = false;
const lockedSpanRatios: number[] = [];
let baselineBundleA: AeroSimulationBundle | null = null;
let latestBundleB: AeroSimulationBundle | null = null;

let viewMode: "single" | "rotor" = "rotor";
let wireframeMode = false;
let spinRotorMode = false;

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

// ---- 3D mesh & rotor assembly rebuild ----
let rotorGroup: THREE.Group | null = null;

function applyMeshChordOffset() {
  const ox = sliderChordOffsetX ? sliderChordOffsetX.valueAsNumber || 0 : 0;
  const oy = sliderChordOffsetY ? sliderChordOffsetY.valueAsNumber || 0 : 0;
  if (!rotorGroup) return;
  rotorGroup.children.forEach((child) => {
    if (child.userData.isBladeBranch) {
      const inner = child.children[0];
      if (inner) {
        inner.position.set(ox, oy, 0);
      }
    }
  });
}

function buildFabricationOverridesJson(overrideActivePart?: number | null): string {
  const holeEnabled = inputSparHoleEnabled.checked;
  const holeDiameter = Math.max(0.5, Number.parseFloat(inputSparHoleDiameter.value) || 5.0);
  const holeDepth = Math.max(5, Number.parseFloat(inputSparHoleDepth.value) || 240);
  const holeOffsetX = Number.parseFloat(inputSparHoleOffsetX.value) || 0;
  const holeOffsetY = Number.parseFloat(inputSparHoleOffsetY.value) || 0;

  const splitParts = Math.max(1, Number.parseInt(selectSplitParts.value, 10) || 1);
  const splitRatio = Math.max(0.12, Math.min(0.88, (sliderSplitRatio.valueAsNumber || 50) / 100));
  const explodeGap = sliderSplitExplodeGap.valueAsNumber || 0;

  let activePart: number | undefined;
  if (overrideActivePart !== undefined) {
    activePart = overrideActivePart === null ? undefined : overrideActivePart;
  } else if (selectSplitActivePart.value !== "all") {
    const idx = Number.parseInt(selectSplitActivePart.value, 10);
    if (Number.isFinite(idx) && idx >= 0 && idx < splitParts) {
      activePart = idx;
    }
  }

  const dto: Record<string, unknown> = {};
  if (holeEnabled) {
    dto.spar_hole_diameter_mm = holeDiameter;
    dto.spar_hole_depth_mm = holeDepth;
    dto.spar_hole_offset_x_mm = holeOffsetX;
    dto.spar_hole_offset_y_mm = holeOffsetY;
    dto.spar_hole_tolerance_mm = Math.max(0, Number.parseFloat(inputSparHoleTolerance.value) || 0);
  }
  if (splitParts > 1) {
    dto.split_parts = splitParts;
    dto.split_ratio = splitRatio;
    if (activePart !== undefined) {
      dto.active_part = activePart;
    } else if (explodeGap > 0) {
      dto.explode_gap_mm = explodeGap;
    }
    if (selectAlignShape.value !== "none") {
      dto.align_shape = selectAlignShape.value;
      dto.align_count = Number.parseInt(selectAlignCount.value, 10) || 2;
      dto.align_size_mm = Math.max(1, Number.parseFloat(inputAlignSize.value) || 3);
      dto.align_key_length_mm = Math.max(2, Number.parseFloat(inputAlignKeyLength.value) || 6);
      dto.align_height_mm = Math.max(1, Number.parseFloat(inputAlignHeight.value) || 6);
      dto.align_spacing_mm = Math.max(0, Number.parseFloat(inputAlignSpacing.value) || 0);
      dto.align_clearance_mm = Math.max(0, Number.parseFloat(inputAlignClearance.value) || 0);
      dto.align_depth_clearance_mm = Math.max(
        0,
        Number.parseFloat(inputAlignDepthClearance.value) || 0,
      );
      dto.align_min_wall_mm = Math.max(0.4, Number.parseFloat(inputAlignMinWall.value) || 0.8);
    }
  }
  return JSON.stringify(dto);
}

interface AlignmentPlaneReport {
  span_mm: number;
  requested: number;
  placed: number;
  pin_height_mm: number;
  socket_depth_mm: number;
}

function updateAlignmentStatus(design: Design) {
  const splitParts = Math.max(1, Number.parseInt(selectSplitParts.value, 10) || 1);
  const shape = selectAlignShape.value;
  const usesLength =
    shape === "key" || shape === "dovetail" || shape === "cruciform" || shape === "tapered";
  inputAlignKeyLength.disabled = !usesLength;
  if (shape === "none") {
    alignStatus.textContent = "Alignment / interlocking joints off";
    alignStatus.classList.remove("warn");
    return;
  }
  if (splitParts < 2) {
    alignStatus.textContent = "Choose 2+ split parts (or click a Joint Preset) to place interlocking joints";
    return;
  }
  try {
    const rows = JSON.parse(
      fabrication_report(JSON.stringify(design), buildFabricationOverridesJson(null)),
    ) as AlignmentPlaneReport[];
    const short = rows.filter((r) => r.placed < r.requested);
    const placedTotal = rows.reduce((n, r) => n + r.placed, 0);
    const requestedTotal = rows.reduce((n, r) => n + r.requested, 0);
    const labelMap: Record<string, string> = {
      dovetail: "dovetail interlocks",
      cruciform: "cruciform (+) interlocks",
      snaplock: "3D snap-lock joints",
      tapered: "tapered wedge locks",
      key: "keys",
      round: "dowel pins",
    };
    const label = labelMap[shape] ?? "joints";
    const first = rows[0];
    const dims = first
      ? ` / height ${first.pin_height_mm.toFixed(1)} mm, socket depth ${first.socket_depth_mm.toFixed(1)} mm`
      : "";
    if (short.length > 0) {
      const where = short.map((r) => `r=${r.span_mm.toFixed(0)} mm`).join(", ");
      alignStatus.textContent = `Warning: only ${placedTotal}/${requestedTotal} ${label} fit (${where}). Reduce size, clearance or min wall${dims}`;
    } else {
      alignStatus.textContent = `${placedTotal}/${requestedTotal} ${label} placed on ${rows.length} split face(s)${dims}`;
    }
    alignStatus.classList.toggle("warn", short.length > 0);
  } catch (err) {
    alignStatus.textContent = `Alignment plan error: ${String(err)}`;
  }
}

function updateFabricationStatus(design: Design) {
  const rows = resolveStationsPreview(design);
  const rootChord = rows[0]?.effective_chord_mm ?? 70;
  const primary = design.airfoils[0]?.airfoil;
  let tRatio = 0.12;
  if (primary) {
    if (primary.type === "naca4") {
      tRatio = primary.thickness_ratio;
    } else if (primary.name === "SG6043") {
      tRatio = 0.1;
    } else if (primary.name === "SD7062") {
      tRatio = 0.14;
    } else if (primary.name === "E387") {
      tRatio = 0.091;
    }
  }
  const rootThickMm = rootChord * tRatio;
  const maxSafeDiaMm = 2 * 0.38 * rootThickMm;

  const holeEnabled = inputSparHoleEnabled.checked;
  const reqDia = Number.parseFloat(inputSparHoleDiameter.value) || 5.0;
  const effDia = Math.min(reqDia, maxSafeDiaMm);
  const depth = Number.parseFloat(inputSparHoleDepth.value) || 240;
  const splitParts = Math.max(1, Number.parseInt(selectSplitParts.value, 10) || 1);
  const splitRatio = (sliderSplitRatio.valueAsNumber || 50) / 100;
  const splitRadiusMm =
    design.rotor.hub_radius_mm +
    splitRatio * (design.rotor.radius_mm - design.rotor.hub_radius_mm);

  splitRatioVal.textContent = `${Math.round(splitRatio * 100)}% (r=${splitRadiusMm.toFixed(0)} mm)`;
  splitExplodeVal.textContent = `${sliderSplitExplodeGap.valueAsNumber || 0} mm`;
  sparHoleDepthVal.textContent = `${depth.toFixed(0)} mm`;

  if (holeEnabled) {
    const clampedNote =
      reqDia > maxSafeDiaMm + 0.05 ? ` (clamped to safe Ø${effDia.toFixed(1)} mm)` : "";
    sparHoleStatus.textContent = `Root thickness ${rootThickMm.toFixed(
      1,
    )} mm (max safe Ø${maxSafeDiaMm.toFixed(1)} mm) / Bore Ø${effDia.toFixed(
      1,
    )} × ${depth.toFixed(0)} mm${clampedNote}`;
  } else {
    sparHoleStatus.textContent = `Root thickness ${rootThickMm.toFixed(
      1,
    )} mm (max safe Ø${maxSafeDiaMm.toFixed(1)} mm) / Base hole off`;
  }

  const holeTag = holeEnabled ? `CF Ø${effDia.toFixed(1)}×${depth.toFixed(0)}mm` : "Solid";
  const splitTag = splitParts > 1 ? `${splitParts} Parts` : "1 Part";
  const tagMap: Record<string, string> = {
    dovetail: " / Dovetail Lock",
    cruciform: " / Cruciform +",
    snaplock: " / 3D Snap-Lock",
    tapered: " / Taper Wedge",
    key: " / Keys",
    round: " / Pins",
  };
  const alignTag =
    splitParts > 1 && selectAlignShape.value !== "none"
      ? (tagMap[selectAlignShape.value] ?? " / Joint")
      : "";
  fabSummary.textContent = `${holeTag} / ${splitTag}${alignTag}`;
  updateAlignmentStatus(design);

  const jointActive = splitParts > 1 && selectAlignShape.value !== "none";
  airfoilPreviewSvg.innerHTML = renderAirfoilSectionSvgMarkup(
    design,
    holeEnabled || jointActive
      ? {
          diameterMm: holeEnabled ? reqDia : 0,
          offsetXMm: Number.parseFloat(inputSparHoleOffsetX.value) || 0,
          offsetYMm: Number.parseFloat(inputSparHoleOffsetY.value) || 0,
          jointShape: jointActive ? selectAlignShape.value : "none",
          jointCount: Number.parseInt(selectAlignCount.value, 10) || 2,
          jointSizeMm: Number.parseFloat(inputAlignSize.value) || 3.0,
          jointLengthMm: Number.parseFloat(inputAlignKeyLength.value) || 6.0,
        }
      : undefined,
  );
}

/**
 * Builds a clean, CAD-shaded Three.js `BufferGeometry` from the indexed WASM mesh:
 * Computes 32° crease-angle normals so curved airfoil surfaces are silky-smooth
 * while flat root/tip caps, split faces, interlocking tenons/sockets, bore rims,
 * and finite trailing edges remain 100% flat and free of dark shading smears.
 */
function buildCleanBladeGeometry(
  pos: Float32Array,
  indices: Uint32Array,
  creaseAngleDeg = 32,
): THREE.BufferGeometry {
  const vCount = (pos.length / 3) | 0;
  const triCount = (indices.length / 3) | 0;
  const faceUnitNormals = new Float32Array(triCount * 3);
  const faceWeightedNormals = new Float32Array(triCount * 3);
  const vertTris: number[][] = Array.from({ length: vCount }, () => []);

  for (let t = 0; t < triCount; t++) {
    const ia = indices[3 * t]!;
    const ib = indices[3 * t + 1]!;
    const ic = indices[3 * t + 2]!;
    vertTris[ia]?.push(t);
    vertTris[ib]?.push(t);
    vertTris[ic]?.push(t);

    const ax = pos[3 * ia]!,
      ay = pos[3 * ia + 1]!,
      az = pos[3 * ia + 2]!;
    const bx = pos[3 * ib]!,
      by = pos[3 * ib + 1]!,
      bz = pos[3 * ib + 2]!;
    const cx = pos[3 * ic]!,
      cy = pos[3 * ic + 1]!,
      cz = pos[3 * ic + 2]!;

    const abx = bx - ax,
      aby = by - ay,
      abz = bz - az;
    const acx = cx - ax,
      acy = cy - ay,
      acz = cz - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const len = Math.hypot(nx, ny, nz);

    faceWeightedNormals[3 * t] = nx;
    faceWeightedNormals[3 * t + 1] = ny;
    faceWeightedNormals[3 * t + 2] = nz;
    if (len > 1e-12) {
      faceUnitNormals[3 * t] = nx / len;
      faceUnitNormals[3 * t + 1] = ny / len;
      faceUnitNormals[3 * t + 2] = nz / len;
    }
  }

  const cosThresh = Math.cos((creaseAngleDeg * Math.PI) / 180);
  const outPositions = new Float32Array(triCount * 9);
  const outNormals = new Float32Array(triCount * 9);

  for (let t = 0; t < triCount; t++) {
    const ux = faceUnitNormals[3 * t]!;
    const uy = faceUnitNormals[3 * t + 1]!;
    const uz = faceUnitNormals[3 * t + 2]!;

    for (let k = 0; k < 3; k++) {
      const vi = indices[3 * t + k]!;
      const outBase = 9 * t + 3 * k;
      outPositions[outBase] = pos[3 * vi]!;
      outPositions[outBase + 1] = pos[3 * vi + 1]!;
      outPositions[outBase + 2] = pos[3 * vi + 2]!;

      let sx = 0,
        sy = 0,
        sz = 0;
      const adj = vertTris[vi]!;
      for (let j = 0; j < adj.length; j++) {
        const tj = adj[j]!;
        const vx = faceUnitNormals[3 * tj]!;
        const vy = faceUnitNormals[3 * tj + 1]!;
        const vz = faceUnitNormals[3 * tj + 2]!;
        if (ux * vx + uy * vy + uz * vz >= cosThresh) {
          sx += faceWeightedNormals[3 * tj]!;
          sy += faceWeightedNormals[3 * tj + 1]!;
          sz += faceWeightedNormals[3 * tj + 2]!;
        }
      }
      const slen = Math.hypot(sx, sy, sz);
      if (slen > 1e-12) {
        outNormals[outBase] = sx / slen;
        outNormals[outBase + 1] = sy / slen;
        outNormals[outBase + 2] = sz / slen;
      } else {
        outNormals[outBase] = ux;
        outNormals[outBase + 1] = uy;
        outNormals[outBase + 2] = uz;
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(outPositions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(outNormals, 3));
  return geo;
}

function rebuild3D(design: Design) {
  try {
    updateFabricationStatus(design);
    const start = performance.now();
    const overridesJson = buildFabricationOverridesJson();
    const data = build_mesh(JSON.stringify(design), overridesJson);
    const elapsed = performance.now() - start;

    errorBanner.style.display = "none";
    errorBanner.textContent = "";

    if (rotorGroup !== null) {
      scene.remove(rotorGroup);
    }
    rotorGroup = new THREE.Group();

    const rawPositions = data.positions as Float32Array;
    const rawIndices = data.indices as Uint32Array;
    const tubeAxis = data.tube_axis;
    const bladeGeo = buildCleanBladeGeometry(rawPositions, rawIndices, 32);
    const edgeGeo = !wireframeMode ? new THREE.EdgesGeometry(bladeGeo, 32) : null;
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.36,
    });

    const holeEnabled = inputSparHoleEnabled.checked;
    const showRod = holeEnabled && inputSparShowRod.checked;

    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.16,
      roughness: 0.38,
      wireframe: wireframeMode,
      transparent: showRod,
      opacity: showRod ? 0.86 : 1.0,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    const stationRows = resolveStationsPreview(design);
    const rootChord = stationRows[0]?.effective_chord_mm ?? 70;
    const pivotX = design.rotor.pitch_axis_ratio * rootChord;
    const axisPoints = stationRows.map(
      (r) =>
        new THREE.Vector3(
          design.rotor.pitch_axis_ratio * r.effective_chord_mm,
          0,
          r.radius_mm,
        ),
    );
    const lineGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b });

    const holeDia = Math.max(0.5, Number.parseFloat(inputSparHoleDiameter.value) || 5.0);
    const holeDepth = Math.max(5, Number.parseFloat(inputSparHoleDepth.value) || 240);
    const holeOx = Number.parseFloat(inputSparHoleOffsetX.value) || 0;
    const holeOy = Number.parseFloat(inputSparHoleOffsetY.value) || 0;

    // Center the blade pitch axis on X = 0 in both Single Blade and Full Rotor modes
    const pivotShift = -pivotX;

    const count = viewMode === "rotor" ? Math.max(1, design.rotor.blade_count) : 1;
    for (let i = 0; i < count; i++) {
      const branch = new THREE.Group();
      branch.userData.isBladeBranch = true;
      const inner = new THREE.Group();

      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMaterial);
      bladeMesh.position.x = pivotShift;
      inner.add(bladeMesh);

      if (edgeGeo) {
        const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
        edgeLines.position.x = pivotShift;
        inner.add(edgeLines);
      }

      const axisLine = new THREE.Line(lineGeo, lineMat);
      axisLine.position.x = pivotShift;
      inner.add(axisLine);

      if (showRod) {
        const stubOutMm = 18;
        const startPt =
          tubeAxis && tubeAxis.length >= 7
            ? new THREE.Vector3(tubeAxis[0]! + pivotShift, tubeAxis[1]!, tubeAxis[2]!)
            : new THREE.Vector3(pivotX + holeOx + pivotShift, holeOy, design.rotor.hub_radius_mm);
        const endPt =
          tubeAxis && tubeAxis.length >= 7
            ? new THREE.Vector3(tubeAxis[3]! + pivotShift, tubeAxis[4]!, tubeAxis[5]!)
            : new THREE.Vector3(
                pivotX + holeOx + pivotShift,
                holeOy,
                design.rotor.hub_radius_mm + holeDepth,
              );
        const effRodRadius =
          tubeAxis && tubeAxis.length >= 7
            ? Math.max(0.4, tubeAxis[6]! * 0.94)
            : Math.max(0.5, holeDia * 0.48);

        const dir = new THREE.Vector3().subVectors(endPt, startPt);
        const dirUnit = dir.length() > 1e-6 ? dir.clone().normalize() : new THREE.Vector3(0, 0, 1);
        const rodStart = startPt.clone().addScaledVector(dirUnit, -stubOutMm);
        const totalRodLen = rodStart.distanceTo(endPt);
        const rodMid = new THREE.Vector3().addVectors(rodStart, endPt).multiplyScalar(0.5);

        const rodGeo = new THREE.CylinderGeometry(effRodRadius, effRodRadius, totalRodLen, 28);
        const rodMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          metalness: 0.65,
          roughness: 0.25,
        });
        const rodMesh = new THREE.Mesh(rodGeo, rodMat);
        rodMesh.position.copy(rodMid);
        rodMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirUnit);
        inner.add(rodMesh);
      }

      branch.add(inner);

      if (viewMode === "rotor") {
        const angle = (2 * Math.PI * i) / count;
        branch.rotation.y = angle;
      }
      rotorGroup.add(branch);
    }

    if (viewMode === "rotor") {
      const hubOuterR = Math.max(12, design.hub.diameter_mm / 2);
      const hubInnerR = Math.max(2, Math.min(hubOuterR - 2, design.hub.bore_diameter_mm / 2));
      const hubLen = Math.max(10, design.hub.length_mm);
      const rootCoreY =
        tubeAxis && tubeAxis.length >= 7 ? tubeAxis[1]! : 0;

      const hubShape = new THREE.Shape();
      hubShape.absarc(0, 0, hubOuterR, 0, Math.PI * 2, false);
      const boreHole = new THREE.Path();
      boreHole.absarc(0, 0, hubInnerR, 0, Math.PI * 2, true);
      hubShape.holes.push(boreHole);

      const hubGeo = new THREE.ExtrudeGeometry(hubShape, {
        depth: hubLen,
        bevelEnabled: false,
        curveSegments: 64,
      });
      hubGeo.rotateX(Math.PI / 2);
      hubGeo.translate(0, hubLen / 2 + rootCoreY, 0);

      const hubMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.45,
        roughness: 0.35,
        wireframe: wireframeMode,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      rotorGroup.add(hubMesh);
      if (!wireframeMode) {
        const hubEdges = new THREE.LineSegments(
          new THREE.EdgesGeometry(hubGeo, 32),
          edgeMat,
        );
        rotorGroup.add(hubEdges);
      }
    }

    scene.add(rotorGroup);
    applyMeshChordOffset();

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

    const betzLimit = 16.0 / 27.0;
    const betzPct = Math.min(100, Math.max(0, (bundle.design_point.cp / betzLimit) * 100));
    aeroSummary.textContent = `Cp ${bundle.design_point.cp.toFixed(3)}  P ${bundle.design_point.power_w.toFixed(0)} W`;
    kpiCp.textContent = bundle.design_point.cp.toFixed(3);
    if (kpiBetzPct) {
      kpiBetzPct.textContent = `${betzPct.toFixed(0)}% Betz`;
    }
    if (kpiBetzBar) {
      kpiBetzBar.style.width = `${betzPct.toFixed(1)}%`;
    }
    kpiPeakCp.textContent = `${bundle.peak_cp.toFixed(3)} @${bundle.peak_tsr.toFixed(1)}`;
    kpiPower.textContent = `${bundle.design_point.power_w.toFixed(1)} W`;

    if (bundle.generator_match) {
      const gm = bundle.generator_match;
      const st = gm.generator;
      kpiGenElec.textContent = `${st.terminal_voltage_v.toFixed(1)}V / ${st.electrical_power_w.toFixed(0)}W`;
      genSummary.textContent = `Eq ${st.rotor_rpm.toFixed(0)} RPM (λ=${gm.tip_speed_ratio.toFixed(
        2,
      )}) / V=${st.terminal_voltage_v.toFixed(1)} V / I=${st.current_a.toFixed(
        2,
      )} A / P=${st.electrical_power_w.toFixed(1)} W (η=${(st.efficiency * 100).toFixed(
        0,
      )}%)`;
    } else {
      kpiGenElec.textContent = "–";
      genSummary.textContent = "Gen: uncoupled";
    }

    const expPoints = parseExperimentalDataLog(
      inputExpData.value,
      design.rotor.radius_mm,
      design.rotor.wind_speed_mps,
    );
    const fit = evaluateExperimentalFit(bundle.sweep, expPoints);
    if (fit.count > 0) {
      expFitSummary.textContent = `Exp log: ${fit.count} pts / RMSE ΔCp=${fit.rmse_cp.toFixed(
        4,
      )} / MAE=${fit.mae_cp.toFixed(4)}`;
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
      )} (pk ${signPk}${ab.delta_peak_cp.toFixed(3)}) / ΔP=${signPw}${ab.delta_power_w.toFixed(
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
  document.title = `BladeLab — ${data.span_min_mm.toFixed(0)}–${data.span_max_mm.toFixed(
    0,
  )} mm [${elapsed.toFixed(1)} ms]`;
}

// ---- UI synchronization ----
function activeDistributionMode(design: Design): "linear" | "schmitz" | "bezier" | "formula" {
  const { chord_mm, twist_deg } = design.distributions;
  if (chord_mm.type === "bezier" || twist_deg.type === "bezier") return "bezier";
  if (chord_mm.type === "formula" || twist_deg.type === "formula") return "formula";
  if (chord_mm.type === "schmitz" || twist_deg.type === "schmitz") return "schmitz";
  return "linear";
}

function renderPlanformPanel(design: Design) {
  const chord = design.distributions.chord_mm;
  planformCosine = chord.type === "formula" && chord.expr.includes("cos(pi");
  const bladeLenMm = Math.max(0, design.rotor.radius_mm - design.rotor.hub_radius_mm);
  const center = Number.parseFloat(sliderPlanformCenter.value) / 100;
  const width = Number.parseFloat(sliderPlanformWidth.value) / 100;
  const { rootEnd, tipStart } = planformZones(center, width);

  btnPlanformLinear.classList.toggle("active", !planformCosine);
  btnPlanformLinear.setAttribute("aria-selected", String(!planformCosine));
  btnPlanformCosine.classList.toggle("active", planformCosine);
  btnPlanformCosine.setAttribute("aria-selected", String(planformCosine));
  planformCard.classList.toggle("is-linear", !planformCosine);
  planformBadge.textContent = planformCosine ? "Optimized" : "Linear";
  sliderPlanformCenter.disabled = !planformCosine;
  sliderPlanformWidth.disabled = !planformCosine;

  planformCenterVal.textContent = `${Math.round(center * 100)}% of span`;
  planformWidthVal.textContent = `${Math.round(width * 100)}% (${Math.round(width * bladeLenMm)} mm)`;
  sliderPlanformCenter.style.setProperty("--fill", `${((Number(sliderPlanformCenter.value) - 15) / 70) * 100}%`);
  sliderPlanformWidth.style.setProperty("--fill", `${((Number(sliderPlanformWidth.value) - 5) / 55) * 100}%`);

  planformZoneBar.style.setProperty("--z-root", `${rootEnd}fr`);
  planformZoneBar.style.setProperty("--z-mid", `${tipStart - rootEnd}fr`);
  planformZoneBar.style.setProperty("--z-tip", `${1 - tipStart}fr`);
  const m = (frac: number) => ((frac * bladeLenMm) / 1000).toFixed(2);
  planformZoneRanges.textContent =
    `Root 0 – ${m(rootEnd)} m | Mid ${m(rootEnd)} – ${m(tipStart)} m | Tip ${m(tipStart)} – ${m(1)} m`;
}

function syncControlsFromDesign(design: Design) {
  const { rotor, distributions } = design;

  const bladeLenMm = Math.max(0, rotor.radius_mm - rotor.hub_radius_mm);
  rotorSummary.textContent = `R ${rotor.radius_mm}  L ${bladeLenMm.toFixed(0)}  B ${rotor.blade_count}`;
  if (hudRotorSpec) {
    hudRotorSpec.textContent = `R ${rotor.radius_mm} mm  L ${bladeLenMm.toFixed(0)} mm  B ${rotor.blade_count}`;
  }
  inputRadius.value = String(rotor.radius_mm);
  inputHubRadius.value = String(rotor.hub_radius_mm);
  inputBlades.value = String(rotor.blade_count);
  inputTsr.value = String(rotor.design_tsr);
  inputWind.value = String(rotor.wind_speed_mps);
  inputStations.value = String(rotor.station_count);
  inputBladeLength.value = String(Number(bladeLenMm.toFixed(1)));
  sliderBladeLength.value = String(Math.round(bladeLenMm));
  bladeLengthVal.textContent = `${bladeLenMm.toFixed(0)} mm`;
  inputPitchAxis.value = String(rotor.pitch_axis_ratio);

  const primaryAirfoil = design.airfoils[0]?.airfoil;
  if (primaryAirfoil) {
    if (primaryAirfoil.type === "named") {
      selectAirfoilFamily.value = primaryAirfoil.name;
      naca4Controls.style.display = "none";
    } else {
      selectAirfoilFamily.value = "naca4";
      naca4Controls.style.display = "grid";
      inputAirfoilThickness.value = String(
        Number((primaryAirfoil.thickness_ratio * 100).toFixed(1)),
      );
      inputAirfoilCamber.value = String(
        Number((primaryAirfoil.max_camber * 100).toFixed(1)),
      );
    }
  }
  updateFabricationStatus(design);

  const mode = activeDistributionMode(design);
  btnModeLinear.classList.toggle("active", mode === "linear");
  btnModeLinear.setAttribute("aria-selected", String(mode === "linear"));
  btnModeSchmitz.classList.toggle("active", mode === "schmitz");
  btnModeSchmitz.setAttribute("aria-selected", String(mode === "schmitz"));
  btnModeBezier.classList.toggle("active", mode === "bezier");
  btnModeBezier.setAttribute("aria-selected", String(mode === "bezier"));
  btnModeFormula.classList.toggle("active", mode === "formula");
  btnModeFormula.setAttribute("aria-selected", String(mode === "formula"));

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
  btnBezierTargetChord.setAttribute("aria-selected", String(bezierTarget === "chord_mm"));
  btnBezierTargetTwist.classList.toggle("active", bezierTarget === "twist_deg");
  btnBezierTargetTwist.setAttribute("aria-selected", String(bezierTarget === "twist_deg"));
  renderBezierEditor(design);
  renderPlanformPanel(design);

  const counts = history.counts();
  btnUndo.disabled = !history.canUndo();
  btnRedo.disabled = !history.canRedo();
  btnUndo.textContent = counts.undo > 0 ? `Undo (${counts.undo})` : "Undo";
  btnRedo.textContent = counts.redo > 0 ? `Redo (${counts.redo})` : "Redo";

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
    <polyline points="${polyPts}" fill="none" stroke="#262c3a" stroke-width="1" stroke-dasharray="3 3" />
    <path d="${samples.join(" ")}" fill="none" stroke="#38bdf8" stroke-width="2" />
  `;

  pts.forEach((pt, idx) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", toSvgX(pt.x).toFixed(1));
    circle.setAttribute("cy", toSvgY(pt.y).toFixed(1));
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", idx === 0 || idx === pts.length - 1 ? "#f59e0b" : "#38bdf8");
    circle.setAttribute("stroke", "#07080d");
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
        circle.removeEventListener("pointercancel", onUp);
        circle.removeEventListener("lostpointercapture", onUp);
        commitDesign(workingDesign);
      };

      circle.addEventListener("pointermove", onMove);
      circle.addEventListener("pointerup", onUp);
      circle.addEventListener("pointercancel", onUp);
      circle.addEventListener("lostpointercapture", onUp);
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
    lockBtn.textContent = locked ? "Locked" : "Pin";
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
      clearBtn.textContent = "Clear";
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

// ---- 3D Viewport Mode & Camera Listeners ----
btnViewSingle.addEventListener("click", () => {
  viewMode = "single";
  btnViewSingle.classList.add("active");
  btnViewSingle.setAttribute("aria-pressed", "true");
  btnViewRotor.classList.remove("active");
  btnViewRotor.setAttribute("aria-pressed", "false");
  controls.target.set(30, 0, workingDesign.rotor.radius_mm * 0.55);
  rebuild3D(workingDesign);
});

btnViewRotor.addEventListener("click", () => {
  viewMode = "rotor";
  btnViewRotor.classList.add("active");
  btnViewRotor.setAttribute("aria-pressed", "true");
  btnViewSingle.classList.remove("active");
  btnViewSingle.setAttribute("aria-pressed", "false");
  controls.target.set(0, 0, 0);
  rebuild3D(workingDesign);
});

btnViewWireframe.addEventListener("click", () => {
  wireframeMode = !wireframeMode;
  btnViewWireframe.classList.toggle("active", wireframeMode);
  btnViewWireframe.setAttribute("aria-pressed", String(wireframeMode));
  rebuild3D(workingDesign);
});

btnViewSpin.addEventListener("click", () => {
  spinRotorMode = !spinRotorMode;
  btnViewSpin.classList.toggle("active", spinRotorMode);
  btnViewSpin.setAttribute("aria-pressed", String(spinRotorMode));
});

btnCamIso.addEventListener("click", () => {
  const r = workingDesign.rotor.radius_mm;
  camera.position.set(r * 0.85, r * 0.65, r * 1.35);
  controls.target.set(0, 0, viewMode === "rotor" ? 0 : r * 0.5);
  controls.update();
});

btnCamTop.addEventListener("click", () => {
  const r = workingDesign.rotor.radius_mm;
  camera.position.set(0, r * 1.9, 0.01);
  controls.target.set(0, 0, viewMode === "rotor" ? 0 : r * 0.5);
  controls.update();
});

btnCamTip.addEventListener("click", () => {
  const r = workingDesign.rotor.radius_mm;
  camera.position.set(0, 60, r * 1.75);
  controls.target.set(0, 0, viewMode === "rotor" ? 0 : r * 0.5);
  controls.update();
});

// ---- CAD & Mesh Export Listeners (STL, 3MF, STEP, JSON) ----
function triggerBlobDownload(bytes: Uint8Array | string, filename: string, mime: string) {
  const blob =
    typeof bytes === "string"
      ? new Blob([bytes], { type: mime })
      : new Blob([bytes.buffer as ArrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function handleExport(format: "stl" | "3mf" | "step") {
  const part = selectExportPart.value as "blade" | "assembly" | "hub";
  const splitParts = Math.max(1, Number.parseInt(selectSplitParts.value, 10) || 1);
  const activePartSuffix =
    splitParts > 1 && selectSplitActivePart.value !== "all"
      ? `-part${Number.parseInt(selectSplitActivePart.value, 10) + 1}`
      : "";
  const holeSuffix = inputSparHoleEnabled.checked ? "-cfhole" : "";
  const baseName = `bladelab-R${workingDesign.rotor.radius_mm}-B${workingDesign.rotor.blade_count}-${part}${holeSuffix}${activePartSuffix}`;
  exportStatus.textContent = `Exporting ${format.toUpperCase()}...`;

  try {
    const fabJson = buildFabricationOverridesJson();
    // Fast in-browser wasm export for blade STL and 3MF (including carbon tube hole & split parts)
    if (part === "blade" && format === "stl") {
      const bytes =
        fabJson === "{}"
          ? export_stl_bytes(JSON.stringify(workingDesign))
          : export_fabricated_stl_bytes(JSON.stringify(workingDesign), fabJson);
      triggerBlobDownload(bytes, `${baseName}.stl`, "model/stl");
      exportStatus.textContent = `Saved ${baseName}.stl (${(bytes.byteLength / 1024).toFixed(1)} kB)`;
      return;
    }
    if (part === "blade" && format === "3mf") {
      const bytes =
        fabJson === "{}"
          ? export_3mf_bytes(JSON.stringify(workingDesign))
          : export_fabricated_3mf_bytes(JSON.stringify(workingDesign), fabJson);
      triggerBlobDownload(
        bytes,
        `${baseName}.3mf`,
        "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
      );
      exportStatus.textContent = `Saved ${baseName}.3mf (${(bytes.byteLength / 1024).toFixed(1)} kB)`;
      return;
    }

    // Server-side export for STEP or unified blade+hub assembly/hub parts
    const resp = await fetch(`/api/v1/export?format=${format}&part=${part}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workingDesign),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${errText}`);
    }
    const buf = new Uint8Array(await resp.arrayBuffer());
    const mime =
      format === "step"
        ? "application/step"
        : format === "3mf"
          ? "application/vnd.ms-package.3dmanufacturing-3dmodel+xml"
          : "model/stl";
    triggerBlobDownload(buf, `${baseName}.${format}`, mime);
    exportStatus.textContent = `Saved ${baseName}.${format} (${(buf.byteLength / 1024).toFixed(1)} kB)`;
  } catch (err) {
    const fabJson = buildFabricationOverridesJson();
    // Fallback to in-browser blade STL/3MF if server is offline
    if (format === "stl") {
      const bytes = export_fabricated_stl_bytes(JSON.stringify(workingDesign), fabJson);
      triggerBlobDownload(bytes, `${baseName}-blade.stl`, "model/stl");
      exportStatus.textContent = `Saved blade STL (${(bytes.byteLength / 1024).toFixed(1)} kB)`;
      return;
    }
    if (format === "3mf") {
      const bytes = export_fabricated_3mf_bytes(JSON.stringify(workingDesign), fabJson);
      triggerBlobDownload(
        bytes,
        `${baseName}-blade.3mf`,
        "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
      );
      exportStatus.textContent = `Saved blade 3MF (${(bytes.byteLength / 1024).toFixed(1)} kB)`;
      return;
    }
    exportStatus.textContent = `Export failed: ${String(err)}`;
  }
}

// ---- Fabrication: Carbon Fiber Tube Hole & Split Model Listeners ----
for (const el of [
  inputSparHoleEnabled,
  inputSparShowRod,
  inputSparHoleDiameter,
  inputSparHoleDepth,
  inputSparHoleOffsetX,
  inputSparHoleOffsetY,
  selectSplitParts,
  selectSplitActivePart,
  sliderSplitRatio,
  sliderSplitExplodeGap,
  inputSparHoleTolerance,
  selectAlignShape,
  selectAlignCount,
  inputAlignSize,
  inputAlignKeyLength,
  inputAlignHeight,
  inputAlignSpacing,
  inputAlignClearance,
  inputAlignDepthClearance,
  inputAlignMinWall,
]) {
  el.addEventListener("input", () => {
    if (el === inputSparHoleDepth) {
      sliderSparHoleDepth.value = inputSparHoleDepth.value;
    }
    rebuild3D(workingDesign);
  });
  el.addEventListener("change", () => {
    rebuild3D(workingDesign);
  });
}

sliderSparHoleDepth.addEventListener("input", () => {
  inputSparHoleDepth.value = String(sliderSparHoleDepth.valueAsNumber);
  rebuild3D(workingDesign);
});

for (const [btn, clearance, tubeTol] of [
  [btnFitTight, 0.1, 0.1],
  [btnFitStandard, 0.2, 0.2],
  [btnFitLoose, 0.35, 0.4],
] as const) {
  btn.addEventListener("click", () => {
    inputAlignClearance.value = clearance.toFixed(2);
    inputSparHoleTolerance.value = tubeTol.toFixed(2);
    rebuild3D(workingDesign);
  });
}

for (const [btnId, shapeVal, sizeMm, lenMm] of [
  ["btn-joint-dovetail", "dovetail", 3.2, 6.5],
  ["btn-joint-cruciform", "cruciform", 3.6, 6.5],
  ["btn-joint-snaplock", "snaplock", 3.4, 6.0],
  ["btn-joint-tapered", "tapered", 3.2, 6.0],
  ["btn-joint-round", "round", 3.0, 6.0],
] as const) {
  const el = document.getElementById(btnId);
  el?.addEventListener("click", () => {
    if ((Number.parseInt(selectSplitParts.value, 10) || 1) < 2) {
      selectSplitParts.value = "2";
    }
    selectAlignShape.value = shapeVal;
    inputAlignSize.value = sizeMm.toFixed(1);
    inputAlignKeyLength.value = lenMm.toFixed(1);
    rebuild3D(workingDesign);
  });
}

for (const [btn, dia] of [
  [btnCf4, 4.0],
  [btnCf5, 5.0],
  [btnCf6, 6.0],
  [btnCf8, 8.0],
] as const) {
  btn.addEventListener("click", () => {
    inputSparHoleEnabled.checked = true;
    inputSparHoleDiameter.value = dia.toFixed(1);
    rebuild3D(workingDesign);
  });
}

btnSparFullSpan.addEventListener("click", () => {
  inputSparHoleEnabled.checked = true;
  const bladeLen = Math.max(20, workingDesign.rotor.radius_mm - workingDesign.rotor.hub_radius_mm);
  const fullDepth = Math.round(bladeLen * 0.85);
  inputSparHoleDepth.value = String(fullDepth);
  sliderSparHoleDepth.max = String(Math.round(bladeLen));
  sliderSparHoleDepth.value = String(fullDepth);
  rebuild3D(workingDesign);
});

btnExportSplitAll.addEventListener("click", () => {
  const splitParts = Math.max(1, Number.parseInt(selectSplitParts.value, 10) || 1);
  const holeSuffix = inputSparHoleEnabled.checked ? "-cfhole" : "";
  for (let p = 0; p < splitParts; p++) {
    const fabJson = buildFabricationOverridesJson(p);
    const bytes = export_fabricated_stl_bytes(JSON.stringify(workingDesign), fabJson);
    const fname = `bladelab-R${workingDesign.rotor.radius_mm}-part${p + 1}of${splitParts}${holeSuffix}.stl`;
    triggerBlobDownload(bytes, fname, "model/stl");
  }
  exportStatus.textContent = `Saved ${splitParts} split STL part(s)`;
});

btnExportStl.addEventListener("click", () => {
  void handleExport("stl");
});

btnExport3mf.addEventListener("click", () => {
  void handleExport("3mf");
});

btnExportStep.addEventListener("click", () => {
  void handleExport("step");
});

btnExportJson.addEventListener("click", () => {
  const filename = `bladelab-R${workingDesign.rotor.radius_mm}-B${workingDesign.rotor.blade_count}.json`;
  triggerBlobDownload(
    JSON.stringify(workingDesign, null, 2),
    filename,
    "application/json",
  );
  exportStatus.textContent = `Saved ${filename}`;
});

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

inputBladeLength.addEventListener("change", () => {
  const len = Number.parseFloat(inputBladeLength.value);
  if (Number.isFinite(len) && len >= 10) {
    commitDesign(updateBladeLengthMm(workingDesign, len));
  }
});

sliderBladeLength.addEventListener("input", () => {
  const len = sliderBladeLength.valueAsNumber;
  bladeLengthVal.textContent = `${len} mm`;
  workingDesign = updateBladeLengthMm(history.current(), len);
  inputRadius.value = String(workingDesign.rotor.radius_mm);
  inputBladeLength.value = String(len);
  renderStationTable(workingDesign);
  rebuild3D(workingDesign);
});

sliderBladeLength.addEventListener("change", () => {
  commitDesign(updateBladeLengthMm(history.current(), sliderBladeLength.valueAsNumber));
});

inputPitchAxis.addEventListener("change", () => {
  const ratio = Number.parseFloat(inputPitchAxis.value);
  if (Number.isFinite(ratio)) {
    commitDesign(updatePitchAxisRatio(workingDesign, ratio));
  }
});

sliderChordOffsetX.addEventListener("input", () => {
  chordOffsetXVal.textContent = `${sliderChordOffsetX.valueAsNumber} mm`;
  applyMeshChordOffset();
});

sliderChordOffsetY.addEventListener("input", () => {
  chordOffsetYVal.textContent = `${sliderChordOffsetY.valueAsNumber} mm`;
  applyMeshChordOffset();
});

sliderGlobalLight.addEventListener("input", () => {
  const val = sliderGlobalLight.valueAsNumber || 1.35;
  globalLightVal.textContent = `${val.toFixed(2)}×`;
  setGlobalIlluminationScale(val);
});

btnChordMinus.addEventListener("click", () => {
  commitDesign(shiftAllChordsMm(workingDesign, -5, lockedSpanRatios));
});

btnChordPlus.addEventListener("click", () => {
  commitDesign(shiftAllChordsMm(workingDesign, 5, lockedSpanRatios));
});

btnChordNarrow.addEventListener("click", () => {
  commitDesign(scaleAllChords(workingDesign, 0.9, lockedSpanRatios));
});

btnChordWiden.addEventListener("click", () => {
  commitDesign(scaleAllChords(workingDesign, 1.1, lockedSpanRatios));
});

function applySelectedAirfoil() {
  const family = selectAirfoilFamily.value;
  let spec: AirfoilSpec;
  if (family === "naca4") {
    const thicknessPct = Math.min(30, Math.max(4, Number.parseFloat(inputAirfoilThickness.value) || 12));
    const camberPct = Math.min(9.5, Math.max(0, Number.parseFloat(inputAirfoilCamber.value) || 0));
    spec = {
      type: "naca4",
      max_camber: Number((camberPct / 100).toFixed(4)),
      camber_position: camberPct > 0 ? 0.4 : 0.0,
      thickness_ratio: Number((thicknessPct / 100).toFixed(4)),
    };
  } else {
    spec = {
      type: "named",
      name: family,
    };
  }
  commitDesign(updatePrimaryAirfoil(workingDesign, spec));
}

selectAirfoilFamily.addEventListener("change", applySelectedAirfoil);
inputAirfoilThickness.addEventListener("change", applySelectedAirfoil);
inputAirfoilCamber.addEventListener("change", applySelectedAirfoil);

// ---- Planform & Span Transitions Listeners ----
function planformEndpoints(design: Design): { root: number; tip: number } {
  const { rotor, distributions } = design;
  return {
    root: evalChordCurve(distributions.chord_mm, rotor, 0, 0),
    tip: evalChordCurve(distributions.chord_mm, rotor, 1, 1),
  };
}

function applyPlanformCosine() {
  const { root, tip } = planformEndpoints(workingDesign);
  const center = Number.parseFloat(sliderPlanformCenter.value) / 100;
  const width = Number.parseFloat(sliderPlanformWidth.value) / 100;
  commitDesign(
    applyFormulaCurve(
      workingDesign,
      "chord_mm",
      buildCosinePlateauExpr(root, tip, center, width),
      lockedSpanRatios,
    ),
  );
}

btnPlanformLinear.addEventListener("click", () => {
  if (!planformCosine) return;
  const { root, tip } = planformEndpoints(workingDesign);
  const next = cloneDesign(workingDesign);
  next.distributions.chord_mm = { type: "linear", root, tip };
  commitDesign(preserveLockedStations(workingDesign, next, lockedSpanRatios));
});

btnPlanformCosine.addEventListener("click", () => {
  if (planformCosine) return;
  applyPlanformCosine();
});

for (const slider of [sliderPlanformCenter, sliderPlanformWidth]) {
  slider.addEventListener("input", () => renderPlanformPanel(workingDesign));
  slider.addEventListener("change", () => {
    if (planformCosine) applyPlanformCosine();
  });
}

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

    const onEnd = () => {
      labelEl.removeEventListener("pointermove", onMove);
      labelEl.removeEventListener("pointerup", onEnd);
      labelEl.removeEventListener("pointercancel", onEnd);
      labelEl.removeEventListener("lostpointercapture", onEnd);
    };

    labelEl.addEventListener("pointermove", onMove);
    labelEl.addEventListener("pointerup", onEnd);
    labelEl.addEventListener("pointercancel", onEnd);
    labelEl.addEventListener("lostpointercapture", onEnd);
  });
});

// ---- Layer 3 Clear All Overrides ----
btnClearOverrides.addEventListener("click", () => {
  commitDesign(clearAllOverrides(workingDesign));
});

// ---- Phase 3 Aero / A-B / Generator / Test Data Listeners ----
const selectOptObjective = document.getElementById("opt-objective") as HTMLSelectElement;
const btnAutoOptimize = document.getElementById("btn-auto-optimize") as HTMLButtonElement;
const optStatusEl = document.getElementById("opt-status")!;

btnAutoOptimize.addEventListener("click", () => {
  try {
    // Snapshot current design as Baseline A so the user sees the before/after Cp-TSR curve comparison
    if (latestBundleB && !baselineBundleA) {
      baselineBundleA = JSON.parse(JSON.stringify(latestBundleB)) as AeroSimulationBundle;
      btnClearA.disabled = false;
    }
    const mode = selectOptObjective.value;
    const cfg = {
      objective:
        mode === "broadband_tsr"
          ? { mode: "broadband_tsr", spread_ratio: 0.2 }
          : { mode: "design_tsr" },
      locked_span_ratios: Array.from(lockedSpanRatios),
      max_iterations: 20,
    };
    const raw = optimize_blade_wasm(JSON.stringify(workingDesign), JSON.stringify(cfg));
    const parsed = JSON.parse(raw) as {
      optimized_design: Design;
      initial_cp: number;
      optimized_cp: number;
      delta_cp: number;
      initial_power_w: number;
      optimized_power_w: number;
      iterations: number;
      evaluations: number;
    };
    commitDesign(parsed.optimized_design);
    const sign = parsed.delta_cp >= 0 ? "+" : "";
    optStatusEl.textContent = `Optimized in ${parsed.evaluations} evals: Cp ${parsed.initial_cp.toFixed(3)} → ${parsed.optimized_cp.toFixed(3)} (${sign}${parsed.delta_cp.toFixed(3)}) / P ${parsed.optimized_power_w.toFixed(1)} W`;
  } catch (err) {
    optStatusEl.textContent = `Optimization error: ${String(err)}`;
  }
});

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

// ---- Phase 4 Team & Cloud Workspace Listeners ----
const selectCloudTeam = document.getElementById("cloud-team") as HTMLSelectElement;
const inputCloudAuthor = document.getElementById("cloud-author") as HTMLInputElement;
const inputCloudDesignName = document.getElementById("cloud-design-name") as HTMLInputElement;
const btnCloudSave = document.getElementById("btn-cloud-save") as HTMLButtonElement;
const btnCloudRefresh = document.getElementById("btn-cloud-refresh") as HTMLButtonElement;
const cloudStatusEl = document.getElementById("cloud-status")!;
const cloudDesignsListEl = document.getElementById("cloud-designs-list")!;

interface CloudDesignSummary {
  id: string;
  name: string;
  team_id: string;
  author: string;
  current_version: number;
}

async function refreshCloudDesigns() {
  const team = selectCloudTeam.value || "team-default";
  try {
    const resp = await fetch(`/api/v1/designs?team_id=${encodeURIComponent(team)}`);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const items = (await resp.json()) as CloudDesignSummary[];
    cloudDesignsListEl.innerHTML = "";
    if (items.length === 0) {
      cloudStatusEl.textContent = `0 saved designs in ${team}`;
      return;
    }
    cloudStatusEl.textContent = `${items.length} design(s) in ${team}`;
    for (const item of items) {
      const row = document.createElement("div");
      row.className = "bind-row";
      row.style.margin = "0";

      const info = document.createElement("span");
      info.style.fontSize = "11px";
      info.textContent = `${item.name} [v${item.current_version} @${item.author}]`;

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "btn-mini";
      loadBtn.textContent = "Load";
      loadBtn.addEventListener("click", async () => {
        try {
          const r = await fetch(`/api/v1/designs/${encodeURIComponent(item.id)}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const rec = (await r.json()) as { name: string; design: Design; current_version: number };
          inputCloudDesignName.value = rec.name;
          commitDesign(rec.design);
          cloudStatusEl.textContent = `Loaded ${rec.name} (v${rec.current_version})`;
        } catch (err) {
          cloudStatusEl.textContent = `Load failed: ${String(err)}`;
        }
      });

      row.append(info, loadBtn);
      cloudDesignsListEl.appendChild(row);
    }
  } catch {
    cloudStatusEl.textContent = "Cloud server offline (local WASM active)";
  }
}

btnCloudSave.addEventListener("click", async () => {
  const team = selectCloudTeam.value === "all" ? "team-default" : selectCloudTeam.value;
  const author = inputCloudAuthor.value.trim() || "engineer";
  const name =
    inputCloudDesignName.value.trim() ||
    `Rotor-R${workingDesign.rotor.radius_mm}-B${workingDesign.rotor.blade_count}`;
  try {
    const resp = await fetch("/api/v1/designs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bladelab-team": team,
        "x-bladelab-user": author,
      },
      body: JSON.stringify({
        name,
        design: workingDesign,
        note: `Saved from Web Workbench by @${author}`,
        team_id: team,
        author,
      }),
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const created = (await resp.json()) as CloudDesignSummary;
    cloudStatusEl.textContent = `Saved ${created.name} (${created.id} v${created.current_version}) to ${created.team_id}`;
    await refreshCloudDesigns();
  } catch (err) {
    cloudStatusEl.textContent = `Cloud save error: ${String(err)}`;
  }
});

btnCloudRefresh.addEventListener("click", () => {
  void refreshCloudDesigns();
});

selectCloudTeam.addEventListener("change", () => {
  void refreshCloudDesigns();
});
void refreshCloudDesigns();

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

// ---- Responsive Workspace Switcher, Dock Toggles & Section Navigation ----
const topDockEl = document.getElementById("top-dock");
const panelEl = document.getElementById("panel");
const aeroDockEl = document.getElementById("aero-dock");
const btnToggleLeft = document.getElementById("btn-toggle-left") as HTMLButtonElement | null;
const btnToggleRight = document.getElementById("btn-toggle-right") as HTMLButtonElement | null;
const btnZen3d = document.getElementById("btn-zen-3d") as HTMLButtonElement | null;
const panelScrollContainer = document.getElementById("panel-scroll-container");
const sectionNavButtons = document.querySelectorAll<HTMLButtonElement>(
  "#panel-section-nav button[data-scroll-target]",
);
const mobileNavButtons = document.querySelectorAll<HTMLButtonElement>(
  "#mobile-workspace-nav button[data-mobile-target]",
);

// Measure #top-dock height dynamically so #aero-dock / #panel never collide when toolbar wraps
function syncTopDockOffset() {
  if (!topDockEl) return;
  const h = Math.max(44, Math.ceil(topDockEl.getBoundingClientRect().height));
  document.documentElement.style.setProperty("--top-dock-h", `${h}px`);
}
if (topDockEl && typeof ResizeObserver !== "undefined") {
  const ro = new ResizeObserver(() => syncTopDockOffset());
  ro.observe(topDockEl);
}
syncTopDockOffset();

// Synchronize inert & aria-hidden on hidden docks so off-screen inputs never trap keyboard focus (ui-taste Audit §1)
function syncDockAccessibilityState() {
  const isMobileLayout = innerWidth <= 1180;
  const mobilePane = document.body.getAttribute("data-mobile-pane") || "cad";
  const leftHidden = isMobileLayout
    ? mobilePane !== "cad"
    : document.body.classList.contains("hide-left-dock");
  const rightHidden = isMobileLayout
    ? mobilePane !== "aero"
    : document.body.classList.contains("hide-right-dock");

  if (panelEl) {
    panelEl.inert = leftHidden;
    panelEl.setAttribute("aria-hidden", String(leftHidden));
  }
  if (aeroDockEl) {
    aeroDockEl.inert = rightHidden;
    aeroDockEl.setAttribute("aria-hidden", String(rightHidden));
  }

  btnToggleLeft?.classList.toggle("active", !leftHidden);
  btnToggleLeft?.setAttribute("aria-pressed", String(!leftHidden));
  btnToggleRight?.classList.toggle("active", !rightHidden);
  btnToggleRight?.setAttribute("aria-pressed", String(!rightHidden));
  const bothHidden =
    document.body.classList.contains("hide-left-dock") &&
    document.body.classList.contains("hide-right-dock");
  btnZen3d?.classList.toggle("active", bothHidden);
  btnZen3d?.setAttribute("aria-pressed", String(bothHidden));
}

btnToggleLeft?.addEventListener("click", () => {
  document.body.classList.toggle("hide-left-dock");
  syncDockAccessibilityState();
  syncTopDockOffset();
});

btnToggleRight?.addEventListener("click", () => {
  document.body.classList.toggle("hide-right-dock");
  syncDockAccessibilityState();
});

btnZen3d?.addEventListener("click", () => {
  const bothHidden =
    document.body.classList.contains("hide-left-dock") &&
    document.body.classList.contains("hide-right-dock");
  if (bothHidden) {
    document.body.classList.remove("hide-left-dock", "hide-right-dock");
  } else {
    document.body.classList.add("hide-left-dock", "hide-right-dock");
  }
  syncDockAccessibilityState();
  syncTopDockOffset();
});

// Quick Section Jump Pills inside Left CAD Dock
sectionNavButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.scrollTarget;
    if (!targetId) return;
    const sectionEl = document.getElementById(targetId);
    if (!sectionEl) return;
    sectionEl.classList.remove("collapsed");
    const toggleBtn = sectionEl.querySelector<HTMLButtonElement>("[data-collapse-section]");
    toggleBtn?.setAttribute("aria-expanded", "true");
    sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
    sectionNavButtons.forEach((b) => {
      const isTarget = b === btn;
      b.classList.toggle("active", isTarget);
      if (isTarget) {
        b.setAttribute("aria-current", "true");
      } else {
        b.removeAttribute("aria-current");
      }
    });
  });
});

// Highlight active section pill while scrolling the left dock
panelScrollContainer?.addEventListener("scroll", () => {
  const containerTop = panelScrollContainer.getBoundingClientRect().top;
  let activeId = "layer1-rotor";
  for (const id of ["layer1-rotor", "layer1-distributions", "layer-fabrication", "layer3-stations"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    const offset = el.getBoundingClientRect().top - containerTop;
    if (offset <= 80) {
      activeId = id;
    }
  }
  sectionNavButtons.forEach((btn) => {
    const isAct = btn.dataset.scrollTarget === activeId;
    btn.classList.toggle("active", isAct);
    if (isAct) {
      btn.setAttribute("aria-current", "true");
    } else {
      btn.removeAttribute("aria-current");
    }
  });
});

// Collapsible section toggle buttons with aria-expanded state
document.querySelectorAll<HTMLButtonElement>("button[data-collapse-section]").forEach((toggleBtn) => {
  toggleBtn.addEventListener("click", () => {
    const sec = toggleBtn.closest("section");
    if (!sec) return;
    const isCollapsed = sec.classList.toggle("collapsed");
    toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
  });
});

// Mobile & Tablet Workspace Switcher (<= 1180px)
mobileNavButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetPane = btn.dataset.mobileTarget || "cad";
    document.body.setAttribute("data-mobile-pane", targetPane);
    mobileNavButtons.forEach((b) => {
      const isAct = b === btn;
      b.classList.toggle("active", isAct);
      b.setAttribute("aria-pressed", String(isAct));
    });
    syncDockAccessibilityState();
  });
});

syncDockAccessibilityState();

addEventListener("keydown", (event) => {
  const tag = (document.activeElement?.tagName || "").toLowerCase();
  const isTyping = tag === "input" || tag === "textarea" || tag === "select";

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
  } else if (!isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (event.key === "[") {
      document.body.classList.toggle("hide-left-dock");
      syncDockAccessibilityState();
      syncTopDockOffset();
    } else if (event.key === "]") {
      document.body.classList.toggle("hide-right-dock");
      syncDockAccessibilityState();
    }
  }
});

// ---- render loop ----
let lastFrameTime = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
  lastFrameTime = now;

  if (spinRotorMode && rotorGroup) {
    const rpm = latestBundleB?.design_point.rpm ?? 300;
    // Visually scaled angular rate so high-RPM rotors remain smooth to inspect
    const visualRadPerSec = Math.min(8.0, (rpm * 2 * Math.PI) / 60 / 12);
    rotorGroup.rotation.y += visualRadPerSec * dt;
  }

  controls.update();
  renderer.render(scene, camera);
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  syncTopDockOffset();
  syncDockAccessibilityState();
});

syncControlsFromDesign(workingDesign);
rebuild3D(workingDesign);
