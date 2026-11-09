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
  AUTOSAVE_STORAGE_KEY,
  applyBezierCurve,
  applyBladeWindPreset,
  BLADE_WIND_PRESETS,
  type BladeWindPresetKey,
  buildCosinePlateauExpr,
  planformZones,
  parseCosinePlateauExpr,
  applySectionAirfoils,
  airfoilShapeParams,
  readSections,
  renderSectionStackSvgMarkup,
  type SectionKey,
  applyBoundRootChord,
  applyFormulaCurve,
  applyLinearLayer1,
  applySchmitzLayer1,
  applyScrubDelta,
  clearAllOverrides,
  clearStationOverride,
  cloneDesign,
  compareABSimulation,
  computeVertexHeatmapColors,
  createWorkbenchSnapshot,
  defaultFabricationSnapshot,
  defaultWorkbenchUiSnapshot,
  evalChordCurve,
  defaultChordBezierPoints,
  defaultTwistBezierPoints,
  DesignHistory,
  type DrivetrainMaxOutReport,
  evalBezierPoints,
  evaluateExperimentalFit,
  evaluatePrinterBuildFit,
  evaluateStructuralMechanics,
  evaluateWindSpeedCurveAndAep,
  type FabricationSnapshot,
  buildGearboxMeshes,
  computeGearboxMetrics,
  defaultGearboxConfig,
  exportGearStlBytes,
  type GearExportTarget,
  type GearboxConfig,
  type GearboxLayoutMode,
  type GearboxStageMode,
  solveGearTeethForTargetRatio,
  GENERATOR_PRESETS,
  type GeneratorPresetKey,
  type HeatmapMode,
  inspectCpTsrAtSvgX,
  inspectWindPowerAtSvgX,
  optimizeGeneratorAndGearbox,
  parseExperimentalDataLog,
  parseLoadedProjectJson,
  preserveLockedStations,
  PRINTER_PRESETS,
  type PrinterPresetKey,
  RATIO_EPS,
  removeSavedSlot,
  renderAirfoilSectionSvgMarkup,
  renderCpTsrSvgMarkup,
  renderWindPowerCurveSvgMarkup,
  resolveStationsPreview,
  SAVED_SLOTS_STORAGE_KEY,
  type SavedSlotEntry,
  scaleAllChords,
  setStationOverride,
  shiftAllChordsMm,
  type StructuralMaterialKey,
  type StructuralMechanicsReport,
  updateBezierControlPoint,
  updateBladeLengthMm,
  updatePitchAxisRatio,
  updatePrimaryAirfoil,
  updateRotorField,
  upsertSavedSlot,
  type WindPowerAepReport,
  type WingletConfig,
  applyWingletToBladeGeometry,
  exportBufferGeometryStlBytes,
  type WorkbenchSnapshot,
  type WorkbenchUiSnapshot,
} from "./state";
import {
  getStoredGitHubToken,
  setStoredGitHubToken,
  verifyGitHubUser,
  listBladeLabGists,
  saveBladeLabGist,
  fetchBladeLabGist,
  deleteBladeLabGist,
  buildGistShareUrl,
  type BladeLabGistSummary,
} from "./gist";
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
const btnViewGearbox = document.getElementById("btn-view-gearbox") as HTMLButtonElement | null;
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
const btnLoadJson = document.getElementById("btn-load-json") as HTMLButtonElement;
const inputLoadJsonFile = document.getElementById("input-load-json-file") as HTMLInputElement;
const autosaveBadge = document.getElementById("autosave-badge")!;
const exportStatus = document.getElementById("export-status")!;

const btnToggleProjects = document.getElementById("btn-toggle-projects") as HTMLButtonElement;
const projectsDrawer = document.getElementById("projects-drawer")!;
const savedSlotsCount = document.getElementById("saved-slots-count")!;
const autosaveDetail = document.getElementById("autosave-detail")!;
const slotNameInput = document.getElementById("slot-name-input") as HTMLInputElement;
const btnSaveSlot = document.getElementById("btn-save-slot") as HTMLButtonElement;
const btnDrawerLoadJson = document.getElementById("btn-drawer-load-json") as HTMLButtonElement;
const btnDrawerSaveJson = document.getElementById("btn-drawer-save-json") as HTMLButtonElement;
const savedSlotsList = document.getElementById("saved-slots-list")!;

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

// ---- Collective Pitch & Feathering Controls ----
const inputTbCollectivePitch = document.getElementById("tb-collective-pitch") as HTMLInputElement | null;
const tbPitchVal = document.getElementById("tb-pitch-val");
const btnPitchFeather = document.getElementById("btn-pitch-feather") as HTMLButtonElement | null;
const inputRotorCollectivePitch = document.getElementById("rotor-collective-pitch") as HTMLInputElement | null;
const rotorCollectivePitchVal = document.getElementById("rotor-collective-pitch-val");
const collectivePitchBadge = document.getElementById("collective-pitch-badge");
const btnPitchRun = document.getElementById("btn-pitch-run") as HTMLButtonElement | null;
const btnPitchStart = document.getElementById("btn-pitch-start") as HTMLButtonElement | null;
const btnPitchFeatherPanel = document.getElementById("btn-pitch-feather-panel") as HTMLButtonElement | null;
const btnFlipBlade = document.getElementById("btn-flip-blade") as HTMLButtonElement | null;
const btnFlipBladePanel = document.getElementById("btn-flip-blade-panel") as HTMLButtonElement | null;
let collectivePitchDeg = 0.0;
let bladeFlipped = true;

// ---- Parametric Winglet / Up-Turned Tip Controls ----
const inputWingletEnabled = document.getElementById("winglet-enabled") as HTMLInputElement | null;
const wingletControlsSubbox = document.getElementById("winglet-controls-subbox");
const inputWingletCant = document.getElementById("winglet-cant") as HTMLInputElement | null;
const inputWingletHeight = document.getElementById("winglet-height") as HTMLInputElement | null;
const inputWingletSweep = document.getElementById("winglet-sweep") as HTMLInputElement | null;
const inputWingletRadius = document.getElementById("winglet-radius") as HTMLInputElement | null;

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
const planformPin = document.getElementById("planform-pin")!;
const planformPinText = document.getElementById("planform-pin-text")!;
const btnPlanformUnpin = document.getElementById("btn-planform-unpin") as HTMLButtonElement;
const secTabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".sec-tab"));
const secRole = document.getElementById("sec-role")!;
const secAirfoil = document.getElementById("sec-airfoil") as HTMLSelectElement;
const secChord = document.getElementById("sec-chord") as HTMLInputElement;
const secChordNum = document.getElementById("sec-chord-num") as HTMLInputElement;
const secTwist = document.getElementById("sec-twist") as HTMLInputElement;
const secTwistNum = document.getElementById("sec-twist-num") as HTMLInputElement;
const secThick = document.getElementById("sec-thick") as HTMLInputElement;
const secThickNum = document.getElementById("sec-thick-num") as HTMLInputElement;
const secNote = document.getElementById("sec-note")!;
const secStack = document.getElementById("sec-stack") as unknown as SVGSVGElement;
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
const selectPrinterPreset = document.getElementById("printer-preset") as HTMLSelectElement;
const inputPrinterMaxZ = document.getElementById("printer-max-z") as HTMLInputElement;
const btnAutoFitPrinter = document.getElementById("btn-auto-fit-printer") as HTMLButtonElement;
const printerFitStatus = document.getElementById("printer-fit-status")!;

const selectHeatmapMode = document.getElementById("heatmap-mode") as HTMLSelectElement;
const viewportHeatmapLegend = document.getElementById("viewport-heatmap-legend")!;
const heatmapLegendTitle = document.getElementById("heatmap-legend-title")!;
const heatmapLegendMin = document.getElementById("heatmap-legend-min")!;
const heatmapLegendBar = document.getElementById("heatmap-legend-bar") as HTMLElement;
const heatmapLegendMax = document.getElementById("heatmap-legend-max")!;

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
const cpTsrHoverReadout = document.getElementById("cp-tsr-hover-readout");
const bemSecMeta = document.getElementById("bem-sec-meta");
const btnSnapshotA = document.getElementById("btn-snapshot-a") as HTMLButtonElement;
const btnClearA = document.getElementById("btn-clear-a") as HTMLButtonElement;
const abDeltaSummary = document.getElementById("ab-delta-summary")!;
const btnPresetLowWind = document.getElementById("btn-preset-low-wind") as HTMLButtonElement | null;
const btnPresetKidwind = document.getElementById("btn-preset-kidwind") as HTMLButtonElement | null;
const btnPresetScimitar = document.getElementById("btn-preset-scimitar") as HTMLButtonElement | null;
const btnPresetHighWind = document.getElementById("btn-preset-high-wind") as HTMLButtonElement | null;
const btnPresetRef = document.getElementById("btn-preset-ref") as HTMLButtonElement | null;
const bladePresetDesc = document.getElementById("blade-preset-desc");

const selectGenPreset = document.getElementById("gen-preset") as HTMLSelectElement;
const inputGenKv = document.getElementById("gen-kv") as HTMLInputElement;
const inputGenRInt = document.getElementById("gen-r-int") as HTMLInputElement;
const inputGenGearRatio = document.getElementById("gen-gear-ratio") as HTMLInputElement;
const inputGenRLoad = document.getElementById("gen-r-load") as HTMLInputElement;
const btnGear1 = document.getElementById("btn-gear-1") as HTMLButtonElement | null;
const btnGear2 = document.getElementById("btn-gear-2") as HTMLButtonElement | null;
const btnGear3 = document.getElementById("btn-gear-3") as HTMLButtonElement | null;
const btnGear4 = document.getElementById("btn-gear-4") as HTMLButtonElement | null;
const genSummary = document.getElementById("gen-summary")!;
const genOptTarget = document.getElementById("gen-opt-target");
const genRegimeBadge = document.getElementById("gen-regime-badge");
const btnMaxOutDrivetrain = document.getElementById("btn-max-out-drivetrain") as HTMLButtonElement | null;
const btnMatchLoadOnly = document.getElementById("btn-match-load-only") as HTMLButtonElement | null;
const genMaxoutGuide = document.getElementById("gen-maxout-guide");
const inputSiteAvgWind = document.getElementById("site-avg-wind") as HTMLInputElement;
const aepCutinBadge = document.getElementById("aep-cutin-badge")!;
const kpiAepKwh = document.getElementById("kpi-aep-kwh")!;
const windPowerSvg = document.getElementById("wind-power-svg") as unknown as SVGSVGElement;
const windPowerHoverReadout = document.getElementById("wind-power-hover-readout");
const aepSummary = document.getElementById("aep-summary")!;
const selectStructMaterial = document.getElementById("struct-material") as HTMLSelectElement;
const structSecMeta = document.getElementById("struct-sec-meta");
const structRootMoment = document.getElementById("struct-root-moment")!;
const structTipDefl = document.getElementById("struct-tip-defl")!;
const structSf = document.getElementById("struct-sf")!;
const structMassPull = document.getElementById("struct-mass-pull")!;
const structStatus = document.getElementById("struct-status")!;
const inputExpData = document.getElementById("exp-data-input") as HTMLTextAreaElement;
const expFitSummary = document.getElementById("exp-fit-summary")!;
const expSecMeta = document.getElementById("exp-sec-meta");
const sectionsSummary = document.getElementById("sections-summary");

let bezierTarget: "chord_mm" | "twist_deg" = "chord_mm";
let planformCosine = false;
let activeSection: SectionKey = "root";
let activeBladePreset: BladeWindPresetKey = "schmitz_600";
const lockedSpanRatios: number[] = [];
let baselineBundleA: AeroSimulationBundle | null = null;
let latestBundleB: AeroSimulationBundle | null = null;
let latestStructuralReport: StructuralMechanicsReport | null = null;
let latestAepReport: WindPowerAepReport | null = null;
let latestMaxOutReport: DrivetrainMaxOutReport | null = null;

let viewMode: "single" | "rotor" | "gearbox" = "rotor";
let studioMode: "blade" | "gearbox" = "blade";
let selectedGearIndex: 1 | 2 | 3 | null = null;
let hoveredGearIndex: number | null = null;
let wireframeMode = false;
let spinRotorMode = false;
let gearSpinAngleRad = 0;

// ---- Studio Tabs & Gearbox Inspector DOM Elements ----
const tabStudioBlade = document.getElementById("tab-studio-blade") as HTMLButtonElement | null;
const tabStudioGearbox = document.getElementById("tab-studio-gearbox") as HTMLButtonElement | null;
const gearboxInspector = document.getElementById("gearbox-inspector");
const btnCloseGearboxInspector = document.getElementById("btn-close-gearbox-inspector") as HTMLButtonElement | null;
const btnToggleGearboxInspector = document.getElementById("btn-toggle-gearbox-inspector") as HTMLButtonElement | null;
const gearInspectorActiveBadge = document.getElementById("gear-inspector-active-badge");

const btnSelectGearTrain = document.getElementById("btn-select-gear-train") as HTMLButtonElement | null;
const btnSelectGearG1 = document.getElementById("btn-select-gear-g1") as HTMLButtonElement | null;
const btnSelectGearG2 = document.getElementById("btn-select-gear-g2") as HTMLButtonElement | null;
const btnSelectGearG3 = document.getElementById("btn-select-gear-g3") as HTMLButtonElement | null;

const btnTbGearLayoutSide = document.getElementById("btn-tb-gear-layout-side") as HTMLButtonElement | null;
const btnTbGearLayoutMesh = document.getElementById("btn-tb-gear-layout-mesh") as HTMLButtonElement | null;
const btnTbGearSpin = document.getElementById("btn-tb-gear-spin") as HTMLButtonElement | null;
const btnTbGearExportAll = document.getElementById("btn-tb-gear-export-all") as HTMLButtonElement | null;

// ---- Gearbox Prototype DOM Elements ----
const gearboxSummary = document.getElementById("gearbox-summary");
const btnGearbox3dView = document.getElementById("btn-gearbox-3d-view") as HTMLButtonElement | null;
const btnGearLayoutSide = document.getElementById("btn-gear-layout-side") as HTMLButtonElement | null;
const btnGearLayoutMesh = document.getElementById("btn-gear-layout-mesh") as HTMLButtonElement | null;
const gearToothBadge = document.getElementById("gear-tooth-badge");
const selectGearStageMode = document.getElementById("gear-stage-mode") as HTMLSelectElement | null;
const inputGearModule = document.getElementById("gear-module") as HTMLInputElement | null;
const inputGearHelix = document.getElementById("gear-helix") as HTMLInputElement | null;
const inputGearPressure = document.getElementById("gear-pressure") as HTMLInputElement | null;
const inputGearBacklash = document.getElementById("gear-backlash") as HTMLInputElement | null;
const btnGearSolveRatio = document.getElementById("btn-gear-solve-ratio") as HTMLButtonElement | null;
const btnGearSyncAero = document.getElementById("btn-gear-sync-aero") as HTMLButtonElement | null;
const gearCutoutBadge = document.getElementById("gear-cutout-badge");
const inputGearSpokeWidth = document.getElementById("gear-spoke-width") as HTMLInputElement | null;
const inputGearRimWall = document.getElementById("gear-rim-wall") as HTMLInputElement | null;
const inputGearHubRing = document.getElementById("gear-hub-ring") as HTMLInputElement | null;

const g1DiaBadge = document.getElementById("g1-dia-badge");
const inputG1Teeth = document.getElementById("g1-teeth") as HTMLInputElement | null;
const inputG1Face = document.getElementById("g1-face") as HTMLInputElement | null;
const selectG1Spokes = document.getElementById("g1-spokes") as HTMLSelectElement | null;
const inputG1Bore = document.getElementById("g1-bore") as HTMLInputElement | null;
const inputG1DFlat = document.getElementById("g1-dflat") as HTMLInputElement | null;
const inputG1HubDia = document.getElementById("g1-hub-dia") as HTMLInputElement | null;
const inputG1HubH = document.getElementById("g1-hub-h") as HTMLInputElement | null;

const gear2Card = document.getElementById("gear2-card");
const g2DiaBadge = document.getElementById("g2-dia-badge");
const inputG2WheelTeeth = document.getElementById("g2-wheel-teeth") as HTMLInputElement | null;
const inputG2WheelFace = document.getElementById("g2-wheel-face") as HTMLInputElement | null;
const selectG2Spokes = document.getElementById("g2-spokes") as HTMLSelectElement | null;
const inputG2PinionTeeth = document.getElementById("g2-pinion-teeth") as HTMLInputElement | null;
const inputG2PinionFace = document.getElementById("g2-pinion-face") as HTMLInputElement | null;
const inputG2Bore = document.getElementById("g2-bore") as HTMLInputElement | null;
const inputG2DFlat = document.getElementById("g2-dflat") as HTMLInputElement | null;

const g3DiaBadge = document.getElementById("g3-dia-badge");
const inputG3Teeth = document.getElementById("g3-teeth") as HTMLInputElement | null;
const inputG3Face = document.getElementById("g3-face") as HTMLInputElement | null;
const inputG3Bore = document.getElementById("g3-bore") as HTMLInputElement | null;
const inputG3DFlat = document.getElementById("g3-dflat") as HTMLInputElement | null;
const inputG3BossH = document.getElementById("g3-boss-h") as HTMLInputElement | null;
const selectG3HelixHand = document.getElementById("g3-helix-hand") as HTMLSelectElement | null;

const gearboxMetricsReadout = document.getElementById("gearbox-metrics-readout");
const btnExportGearsAll = document.getElementById("btn-export-gears-all") as HTMLButtonElement | null;
const btnExportGear1 = document.getElementById("btn-export-gear1") as HTMLButtonElement | null;
const btnExportGear2 = document.getElementById("btn-export-gear2") as HTMLButtonElement | null;
const btnExportGear3 = document.getElementById("btn-export-gear3") as HTMLButtonElement | null;
let activeGearLayoutMode: GearboxLayoutMode = "side_by_side";

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

// ---- Collective Pitch & Winglet Helpers ----
let latestCleanBladePositions: Float32Array | null = null;

function readCurrentWingletConfig(): WingletConfig {
  return {
    enabled: Boolean(inputWingletEnabled?.checked),
    cant_angle_deg: Math.max(
      15,
      Math.min(75, Number.parseFloat(inputWingletCant?.value || "50") || 50),
    ),
    height_mm: Math.max(
      5,
      Math.min(50, Number.parseFloat(inputWingletHeight?.value || "22") || 22),
    ),
    sweep_angle_deg: Math.max(
      0,
      Math.min(25, Number.parseFloat(inputWingletSweep?.value || "10") || 10),
    ),
    blend_radius_mm: Math.max(
      5,
      Math.min(40, Number.parseFloat(inputWingletRadius?.value || "15") || 15),
    ),
  };
}

function applyWingletConfigToDom(cfg?: WingletConfig) {
  const c = cfg || {
    enabled: false,
    cant_angle_deg: 50,
    height_mm: 22,
    sweep_angle_deg: 10,
    blend_radius_mm: 15,
  };
  if (inputWingletEnabled) inputWingletEnabled.checked = c.enabled;
  if (wingletControlsSubbox) {
    wingletControlsSubbox.style.display = c.enabled ? "block" : "none";
  }
  if (inputWingletCant) inputWingletCant.value = String(c.cant_angle_deg);
  if (inputWingletHeight) inputWingletHeight.value = String(c.height_mm);
  if (inputWingletSweep) inputWingletSweep.value = String(c.sweep_angle_deg);
  if (inputWingletRadius) inputWingletRadius.value = String(c.blend_radius_mm);
}

function setCollectivePitch(deg: number, triggerRebuild = true) {
  collectivePitchDeg = Math.max(-10, Math.min(35, Math.round(deg * 2) / 2));
  const valStr = `${collectivePitchDeg >= 0 ? "+" : ""}${collectivePitchDeg.toFixed(1)}°`;
  if (inputRotorCollectivePitch) inputRotorCollectivePitch.value = String(collectivePitchDeg);
  if (inputTbCollectivePitch) inputTbCollectivePitch.value = String(collectivePitchDeg);
  if (rotorCollectivePitchVal) rotorCollectivePitchVal.textContent = valStr;
  if (collectivePitchBadge) collectivePitchBadge.textContent = valStr;
  if (tbPitchVal) tbPitchVal.textContent = valStr;

  if (btnPitchRun) btnPitchRun.classList.toggle("active", Math.abs(collectivePitchDeg - 0) < 0.2);
  if (btnPitchStart) btnPitchStart.classList.toggle("active", Math.abs(collectivePitchDeg - 4) < 0.2);
  if (btnPitchFeatherPanel)
    btnPitchFeatherPanel.classList.toggle("active", Math.abs(collectivePitchDeg - 30) < 0.2);
  if (btnPitchFeather)
    btnPitchFeather.classList.toggle("active", Math.abs(collectivePitchDeg - 30) < 0.2);

  if (triggerRebuild) {
    rebuild3D(workingDesign);
    scheduleAutoSave();
  }
}

function setBladeFlipped(flipped: boolean, triggerRebuild = true) {
  bladeFlipped = flipped;
  if (btnFlipBlade) {
    btnFlipBlade.classList.toggle("active", bladeFlipped);
    btnFlipBlade.setAttribute("aria-pressed", String(bladeFlipped));
  }
  if (btnFlipBladePanel) {
    btnFlipBladePanel.classList.toggle("active", bladeFlipped);
    btnFlipBladePanel.setAttribute("aria-pressed", String(bladeFlipped));
  }
  if (triggerRebuild) {
    rebuild3D(workingDesign);
    scheduleAutoSave();
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
  const isContour = shape === "contour";
  const usesLength =
    shape === "key" || shape === "dovetail" || shape === "cruciform" || shape === "tapered";
  inputAlignKeyLength.disabled = !usesLength;
  selectAlignCount.disabled = isContour;
  inputAlignSize.disabled = isContour;
  inputAlignSpacing.disabled = isContour;
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
      contour: "airfoil contour lip sleeves",
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
    } else if (primary.name === "S833") {
      tRatio = 0.18;
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
    contour: " / Contour Lip",
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
  updatePrinterFitStatus(design);

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

function updatePrinterFitStatus(design: Design) {
  const preset = (selectPrinterPreset.value || "bambu_256") as PrinterPresetKey;
  if (preset !== "custom") {
    const presetSpec = PRINTER_PRESETS[preset];
    if (presetSpec) {
      inputPrinterMaxZ.value = String(presetSpec.max_z_mm);
    }
  }
  const customZ = Number.parseFloat(inputPrinterMaxZ.value) || 256;
  const fit = evaluatePrinterBuildFit(
    design,
    readCurrentFabricationSnapshot(),
    preset,
    customZ,
  );
  printerFitStatus.textContent = fit.summary;
  printerFitStatus.classList.toggle("ok", fit.all_fit);
  printerFitStatus.classList.toggle("warn", !fit.all_fit);
  btnAutoFitPrinter.disabled = fit.all_fit;
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

function readCurrentGearboxConfig(): GearboxConfig {
  const def = defaultGearboxConfig();
  return {
    stage_mode: (selectGearStageMode?.value as GearboxStageMode) || def.stage_mode,
    layout_mode: activeGearLayoutMode,
    module_mm: Math.max(0.4, Number.parseFloat(inputGearModule?.value || "") || def.module_mm),
    pressure_angle_deg: Math.max(
      14.5,
      Math.min(25, Number.parseFloat(inputGearPressure?.value || "") || def.pressure_angle_deg),
    ),
    helix_angle_deg: Math.max(
      0,
      Math.min(35, Number.parseFloat(inputGearHelix?.value || "0") || 0),
    ),
    backlash_mm: Math.max(
      0,
      Math.min(0.6, Number.parseFloat(inputGearBacklash?.value || "0") || 0),
    ),
    spoke_width_pct: Math.max(
      10,
      Math.min(65, Number.parseFloat(inputGearSpokeWidth?.value || "") || def.spoke_width_pct),
    ),
    rim_wall_mm: Math.max(
      1.5,
      Math.min(12, Number.parseFloat(inputGearRimWall?.value || "") || def.rim_wall_mm),
    ),
    hub_ring_mm: Math.max(
      1.0,
      Math.min(12, Number.parseFloat(inputGearHubRing?.value || "") || def.hub_ring_mm),
    ),

    g1_teeth: Math.max(10, Math.round(Number.parseFloat(inputG1Teeth?.value || "") || def.g1_teeth)),
    g1_face_width_mm: Math.max(
      2,
      Number.parseFloat(inputG1Face?.value || "") || def.g1_face_width_mm,
    ),
    g1_spokes: Number.parseInt(selectG1Spokes?.value ?? String(def.g1_spokes), 10) || 0,
    g1_bore_mm: Math.max(1.5, Number.parseFloat(inputG1Bore?.value || "") || def.g1_bore_mm),
    g1_d_flat_mm: Math.max(0, Number.parseFloat(inputG1DFlat?.value || "0") || 0),
    g1_hub_diameter_mm: Math.max(
      8,
      Number.parseFloat(inputG1HubDia?.value || "") || def.g1_hub_diameter_mm,
    ),
    g1_hub_height_mm: Math.max(0, Number.parseFloat(inputG1HubH?.value || "0") || 0),

    g2_wheel_teeth: Math.max(
      10,
      Math.round(Number.parseFloat(inputG2WheelTeeth?.value || "") || def.g2_wheel_teeth),
    ),
    g2_wheel_face_mm: Math.max(
      2,
      Number.parseFloat(inputG2WheelFace?.value || "") || def.g2_wheel_face_mm,
    ),
    g2_spokes: Number.parseInt(selectG2Spokes?.value ?? String(def.g2_spokes), 10) || 0,
    g2_pinion_teeth: Math.max(
      8,
      Math.round(Number.parseFloat(inputG2PinionTeeth?.value || "") || def.g2_pinion_teeth),
    ),
    g2_pinion_face_mm: Math.max(
      2,
      Number.parseFloat(inputG2PinionFace?.value || "") || def.g2_pinion_face_mm,
    ),
    g2_bore_mm: Math.max(1.5, Number.parseFloat(inputG2Bore?.value || "") || def.g2_bore_mm),
    g2_d_flat_mm: Math.max(0, Number.parseFloat(inputG2DFlat?.value || "0") || 0),

    g3_teeth: Math.max(8, Math.round(Number.parseFloat(inputG3Teeth?.value || "") || def.g3_teeth)),
    g3_face_width_mm: Math.max(
      2,
      Number.parseFloat(inputG3Face?.value || "") || def.g3_face_width_mm,
    ),
    g3_bore_mm: Math.max(1.2, Number.parseFloat(inputG3Bore?.value || "") || def.g3_bore_mm),
    g3_d_flat_mm: Math.max(0, Number.parseFloat(inputG3DFlat?.value || "0") || 0),
    g3_boss_height_mm: Math.max(0, Number.parseFloat(inputG3BossH?.value || "0") || 0),
    g3_helix_hand: (selectG3HelixHand?.value === "-1" ? -1 : 1),
  };
}

function applyGearboxConfigToDom(cfg: GearboxConfig) {
  activeGearLayoutMode = cfg.layout_mode || "side_by_side";
  btnGearLayoutSide?.classList.toggle("active", activeGearLayoutMode === "side_by_side");
  btnGearLayoutMesh?.classList.toggle("active", activeGearLayoutMode === "meshed");
  if (selectGearStageMode) selectGearStageMode.value = cfg.stage_mode;
  if (inputGearModule) inputGearModule.value = String(cfg.module_mm);
  if (inputGearHelix) inputGearHelix.value = String(cfg.helix_angle_deg);
  if (inputGearPressure) inputGearPressure.value = String(cfg.pressure_angle_deg);
  if (inputGearBacklash) inputGearBacklash.value = String(cfg.backlash_mm);
  if (inputGearSpokeWidth) inputGearSpokeWidth.value = String(cfg.spoke_width_pct ?? 26);
  if (inputGearRimWall) inputGearRimWall.value = String(cfg.rim_wall_mm ?? 3.5);
  if (inputGearHubRing) inputGearHubRing.value = String(cfg.hub_ring_mm ?? 2.5);

  if (inputG1Teeth) inputG1Teeth.value = String(cfg.g1_teeth);
  if (inputG1Face) inputG1Face.value = String(cfg.g1_face_width_mm);
  if (selectG1Spokes) selectG1Spokes.value = String(cfg.g1_spokes);
  if (inputG1Bore) inputG1Bore.value = String(cfg.g1_bore_mm);
  if (inputG1DFlat) inputG1DFlat.value = String(cfg.g1_d_flat_mm);
  if (inputG1HubDia) inputG1HubDia.value = String(cfg.g1_hub_diameter_mm);
  if (inputG1HubH) inputG1HubH.value = String(cfg.g1_hub_height_mm);

  if (inputG2WheelTeeth) inputG2WheelTeeth.value = String(cfg.g2_wheel_teeth);
  if (inputG2WheelFace) inputG2WheelFace.value = String(cfg.g2_wheel_face_mm);
  if (selectG2Spokes) selectG2Spokes.value = String(cfg.g2_spokes ?? 4);
  if (inputG2PinionTeeth) inputG2PinionTeeth.value = String(cfg.g2_pinion_teeth);
  if (inputG2PinionFace) inputG2PinionFace.value = String(cfg.g2_pinion_face_mm);
  if (inputG2Bore) inputG2Bore.value = String(cfg.g2_bore_mm);
  if (inputG2DFlat) inputG2DFlat.value = String(cfg.g2_d_flat_mm);

  if (inputG3Teeth) inputG3Teeth.value = String(cfg.g3_teeth);
  if (inputG3Face) inputG3Face.value = String(cfg.g3_face_width_mm);
  if (inputG3Bore) inputG3Bore.value = String(cfg.g3_bore_mm);
  if (inputG3DFlat) inputG3DFlat.value = String(cfg.g3_d_flat_mm);
  if (inputG3BossH) inputG3BossH.value = String(cfg.g3_boss_height_mm);
  if (selectG3HelixHand) selectG3HelixHand.value = String(cfg.g3_helix_hand ?? 1);
}

function updateGearboxPanelUi(): GearboxConfig {
  const cfg = readCurrentGearboxConfig();
  const m = computeGearboxMetrics(cfg);

  if (gearboxSummary) {
    gearboxSummary.textContent = `${m.total_ratio.toFixed(2)}:1 · m ${cfg.module_mm}`;
  }
  if (gearToothBadge) {
    gearToothBadge.textContent =
      cfg.helix_angle_deg > 0.1
        ? `Helical ${cfg.helix_angle_deg.toFixed(0)}°`
        : `Spur 0°`;
  }
  if (gearCutoutBadge) {
    const sw = Math.round(cfg.spoke_width_pct);
    gearCutoutBadge.textContent = `${sw}% Spoke · ${100 - sw}% Window`;
  }
  if (g1DiaBadge) {
    g1DiaBadge.textContent = `Øp ${m.g1_pitch_dia_mm.toFixed(1)} · Øo ${m.g1_outer_dia_mm.toFixed(1)} mm`;
  }
  if (g2DiaBadge) {
    g2DiaBadge.textContent = `Øp ${m.g2_wheel_pitch_dia_mm.toFixed(1)} / ${m.g2_pinion_pitch_dia_mm.toFixed(1)} mm`;
  }
  if (g3DiaBadge) {
    g3DiaBadge.textContent = `Øp ${m.g3_pitch_dia_mm.toFixed(1)} · Øo ${m.g3_outer_dia_mm.toFixed(1)} mm`;
  }
  if (gear2Card) {
    gear2Card.style.display = cfg.stage_mode === "direct_1stage" ? "none" : "block";
  }
  if (btnExportGear2) {
    btnExportGear2.disabled = cfg.stage_mode === "direct_1stage";
  }
  if (btnGearbox3dView) {
    btnGearbox3dView.textContent =
      viewMode === "gearbox" ? "Viewing 3D Gearbox (Switch to Rotor)" : "Show Gearbox in 3D Viewport";
  }
  if (gearboxMetricsReadout) {
    const centerInfo =
      cfg.stage_mode === "direct_1stage"
        ? `Shaft Center Distance: a₁₃ = ${m.center_distance_12_mm.toFixed(2)} mm`
        : `Shaft Centers: a₁₂ = ${m.center_distance_12_mm.toFixed(2)} mm · a₂₃ = ${m.center_distance_23_mm.toFixed(2)} mm`;
    gearboxMetricsReadout.textContent = `Total Ratio G = ${m.total_ratio.toFixed(2)}:1 (Stage 1: ${m.stage1_ratio.toFixed(2)}× · Stage 2: ${m.stage2_ratio.toFixed(2)}×) · ${centerInfo}`;
  }
  return cfg;
}

function highlightSelectedGearIn3D(gearIdx: number | null) {
  if (!rotorGroup || !rotorGroup.userData.isGearboxGroup) return;
  rotorGroup.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.userData.gearIndex) {
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (gearIdx !== null && obj.userData.gearIndex === gearIdx) {
        mat.emissive.setHex(0x38bdf8);
        mat.emissiveIntensity = 0.45;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
  });
}

function updateGearboxHud(gearIdx: number | null) {
  if (viewMode !== "gearbox") return;
  const cfg = readCurrentGearboxConfig();
  const m = computeGearboxMetrics(cfg);

  let datumText = "";
  if (gearIdx === 1) {
    datumText = `GEAR 1 · ROTOR BULL GEAR (Z1 = ${cfg.g1_teeth}, Øp ${m.g1_pitch_dia_mm.toFixed(1)} mm, Face ${cfg.g1_face_width_mm} mm)`;
  } else if (gearIdx === 2) {
    datumText = `GEAR 2 · COMPOUND IDLER (Z2w = ${cfg.g2_wheel_teeth}, Z2p = ${cfg.g2_pinion_teeth}, Øp ${m.g2_wheel_pitch_dia_mm.toFixed(1)} / ${m.g2_pinion_pitch_dia_mm.toFixed(1)} mm)`;
  } else if (gearIdx === 3) {
    datumText = `GEAR 3 · GENERATOR PINION (Z3 = ${cfg.g3_teeth}, Øp ${m.g3_pitch_dia_mm.toFixed(1)} mm, Face ${cfg.g3_face_width_mm} mm)`;
  } else {
    datumText = `GEAR TRAIN G = ${m.total_ratio.toFixed(2)}:1 · m ${cfg.module_mm} · CLICK ANY GEAR IN 3D TO EDIT SETTINGS`;
  }

  if (hudRotorSpec) {
    hudRotorSpec.textContent = datumText;
  }
}

function selectGear(gearIdx: 1 | 2 | 3 | null, openInspector: boolean = true) {
  selectedGearIndex = gearIdx;
  highlightSelectedGearIn3D(gearIdx);

  if (openInspector && gearboxInspector) {
    gearboxInspector.classList.add("open");
    btnToggleGearboxInspector?.classList.add("active");
    btnToggleGearboxInspector?.setAttribute("aria-pressed", "true");
  }

  // Update badge in inspector header
  if (gearInspectorActiveBadge) {
    if (gearIdx === 1) {
      gearInspectorActiveBadge.textContent = "Gear 1: Bull Gear (Z1)";
      gearInspectorActiveBadge.style.color = "#8fd9b6";
    } else if (gearIdx === 2) {
      gearInspectorActiveBadge.textContent = "Gear 2: Compound (Z2)";
      gearInspectorActiveBadge.style.color = "#b84ba1";
    } else if (gearIdx === 3) {
      gearInspectorActiveBadge.textContent = "Gear 3: Pinion (Z3)";
      gearInspectorActiveBadge.style.color = "#38bdf8";
    } else {
      gearInspectorActiveBadge.textContent = "All Gears";
      gearInspectorActiveBadge.style.color = "var(--text-secondary)";
    }
  }

  // Update quick-nav buttons
  btnSelectGearTrain?.classList.toggle("active", gearIdx === null);
  btnSelectGearG1?.classList.toggle("active", gearIdx === 1);
  btnSelectGearG2?.classList.toggle("active", gearIdx === 2);
  btnSelectGearG3?.classList.toggle("active", gearIdx === 3);

  // Update card highlights
  const g1Card = document.getElementById("gear1-card");
  const g2Card = document.getElementById("gear2-card");
  const g3Card = document.getElementById("gear3-card");
  const trainCard = document.getElementById("gear-train-card");
  g1Card?.classList.toggle("card-selected", gearIdx === 1);
  g2Card?.classList.toggle("card-selected", gearIdx === 2);
  g3Card?.classList.toggle("card-selected", gearIdx === 3);

  if (gearIdx !== null) {
    const targetCard = document.getElementById(`gear${gearIdx}-card`);
    targetCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    trainCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  updateGearboxHud(gearIdx);
}

function rebuild3D(design: Design) {
  try {
    updateFabricationStatus(design);
    updateAeroPanel(design);
    const gearCfg = updateGearboxPanelUi();

    if (viewMode === "gearbox") {
      const start = performance.now();
      const gearBundle = buildGearboxMeshes(gearCfg);
      const elapsed = performance.now() - start;

      errorBanner.style.display = "none";
      errorBanner.textContent = "";
      viewportHeatmapLegend.classList.remove("visible");
      viewportHeatmapLegend.setAttribute("aria-hidden", "true");

      if (rotorGroup !== null) {
        scene.remove(rotorGroup);
      }
      rotorGroup = new THREE.Group();
      rotorGroup.userData.isGearboxGroup = true;

      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.35,
      });

      // Group submeshes by gear_index (1, 2, 3) so each gear spins around its own shaft axis
      const pivots = new Map<number, THREE.Group>();
      for (const sub of gearBundle.submeshes) {
        let pivot = pivots.get(sub.gear_index);
        if (!pivot) {
          pivot = new THREE.Group();
          // Map gear CAD (x, y, z_height) -> Three.js (x, z_height, -y) so shaft axis is +Y
          pivot.position.set(sub.center_x_mm, sub.base_z_mm, -sub.center_y_mm);
          pivot.userData.isGearPivot = true;
          pivot.userData.spinRatio = sub.spin_ratio;
          pivot.userData.meshPhaseRad = sub.mesh_phase_rad;
          pivot.rotation.y = gearSpinAngleRad * sub.spin_ratio + sub.mesh_phase_rad;
          pivots.set(sub.gear_index, pivot);
          rotorGroup.add(pivot);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(sub.positions, 3));
        geo.setAttribute("normal", new THREE.BufferAttribute(sub.normals, 3));
        geo.setIndex(new THREE.BufferAttribute(sub.indices, 1));
        // Rotate gear local Z height axis onto Three.js +Y vertical axis
        geo.rotateX(-Math.PI / 2);

        const mat = new THREE.MeshStandardMaterial({
          color: sub.color_hex,
          metalness: sub.metalness,
          roughness: sub.roughness,
          wireframe: wireframeMode,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData.gearIndex = sub.gear_index;
        mesh.userData.submeshId = sub.id;
        mesh.userData.submeshName = sub.label;
        mesh.userData.baseColor = sub.color_hex;
        pivot.add(mesh);

        if (!wireframeMode) {
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), edgeMat);
          pivot.add(edges);
        }
      }

      scene.add(rotorGroup);
      highlightSelectedGearIn3D(selectedGearIndex);
      updateStats(elapsed, {
        triangle_count: gearBundle.total_triangles,
        volume_mm3: 0,
        span_min_mm: 0,
        span_max_mm: gearBundle.metrics.total_span_width_mm,
      });
      return;
    }

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

    const posCopy = new Float32Array(rawPositions);
    const wingletCfg = readCurrentWingletConfig();
    applyWingletToBladeGeometry(posCopy, design, wingletCfg);

    const bladeGeo = buildCleanBladeGeometry(posCopy, rawIndices, 32);
    const posAttr = bladeGeo.getAttribute("position") as THREE.BufferAttribute;
    latestCleanBladePositions = posAttr.array as Float32Array;
    const edgeGeo = !wireframeMode ? new THREE.EdgesGeometry(bladeGeo, 32) : null;
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.36,
    });

    const holeEnabled = inputSparHoleEnabled.checked;
    const showRod = holeEnabled && inputSparShowRod.checked;

    const hmMode = (selectHeatmapMode.value || "segment") as HeatmapMode;
    const useHeatmap = hmMode !== "segment";
    if (useHeatmap) {
      const normAttr = bladeGeo.getAttribute("normal") as THREE.BufferAttribute | null;
      const hm = computeVertexHeatmapColors(
        posAttr.array as ArrayLike<number>,
        design,
        latestBundleB,
        latestStructuralReport,
        hmMode,
        normAttr ? normAttr.array : undefined,
        collectivePitchDeg,
      );
      bladeGeo.setAttribute("color", new THREE.BufferAttribute(hm.colors, 3));
      viewportHeatmapLegend.classList.add("visible");
      viewportHeatmapLegend.setAttribute("aria-hidden", "false");
      heatmapLegendTitle.textContent = hm.title;
      heatmapLegendMin.textContent = hm.minLabel;
      heatmapLegendBar.style.background = hm.gradientCss;
      heatmapLegendMax.textContent = hm.maxLabel;
    } else {
      viewportHeatmapLegend.classList.remove("visible");
      viewportHeatmapLegend.setAttribute("aria-hidden", "true");
    }

    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: useHeatmap ? 0xffffff : 0x3b82f6,
      vertexColors: useHeatmap,
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
      const baseAngle = bladeFlipped ? Math.PI : 0;
      inner.rotation.z = baseAngle + (collectivePitchDeg * Math.PI) / 180;

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
  } catch (err) {
    errorBanner.style.display = "block";
    errorBanner.textContent = String(err);
  }
}

function syncGearQuickButtons(gearRatio: number) {
  for (const [btn, val] of [
    [btnGear1, 1.0],
    [btnGear2, 2.0],
    [btnGear3, 3.0],
    [btnGear4, 4.0],
  ] as const) {
    if (btn) {
      btn.classList.toggle("active", Math.abs(gearRatio - val) < 0.04);
    }
  }
}

function updateAeroPanel(design: Design) {
  try {
    const kv = Number.parseFloat(inputGenKv.value) || 35;
    const rInt = Number.parseFloat(inputGenRInt.value) || 0.8;
    const gearRatio = Math.max(0.25, Number.parseFloat(inputGenGearRatio.value) || 1.0);
    const rLoad = Number.parseFloat(inputGenRLoad.value) || 5.0;
    const presetKey = (selectGenPreset?.value || "low_rpm_pmg") as GeneratorPresetKey;
    const presetI0 = GENERATOR_PRESETS[presetKey]?.no_load_current_a ?? 0.05;
    syncGearQuickButtons(gearRatio);

    const rawJson = simulate_aero(
      JSON.stringify(design),
      JSON.stringify({
        pitch_deg: collectivePitchDeg,
        tsr_min: 1.5,
        tsr_max: 9.0,
        tsr_steps: 16,
        generator_kv: kv,
        generator_r_int: rInt,
        generator_r_load: rLoad,
        generator_gear_ratio: gearRatio,
        generator_i0: presetI0,
      }),
    );
    const bundle = JSON.parse(rawJson) as AeroSimulationBundle;
    latestBundleB = bundle;

    const betzLimit = 16.0 / 27.0;
    const betzPct = Math.min(100, Math.max(0, (bundle.design_point.cp / betzLimit) * 100));
    aeroSummary.textContent = `Cp ${bundle.design_point.cp.toFixed(3)}  P ${bundle.design_point.power_w.toFixed(0)} W`;
    if (bemSecMeta) {
      bemSecMeta.textContent = `Pk ${bundle.peak_cp.toFixed(3)} @λ${bundle.peak_tsr.toFixed(1)}`;
    }
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
      const genRpm = st.generator_rpm ?? st.rotor_rpm * gearRatio;
      kpiGenElec.textContent = `${st.terminal_voltage_v.toFixed(1)}V / ${st.electrical_power_w.toFixed(1)}W`;
      genSummary.textContent = `Rotor ${st.rotor_rpm.toFixed(0)} RPM · Gen ${genRpm.toFixed(0)} RPM (${gearRatio.toFixed(2)}:1, λ=${gm.tip_speed_ratio.toFixed(
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

    // Drivetrain & Load Max-Out Solver ("How to Max Out")
    const maxOut = optimizeGeneratorAndGearbox(design, bundle, {
      kv,
      r_int: rInt,
      r_load: rLoad,
      gear_ratio: gearRatio,
      i0: presetI0,
    });
    latestMaxOutReport = maxOut;
    if (genOptTarget) {
      genOptTarget.textContent = `Opt ${maxOut.opt_gear_ratio.toFixed(2)}:1 · ${maxOut.opt_r_load_ohm.toFixed(1)} Ω (${maxOut.opt_elec_power_w.toFixed(1)} W)`;
    }
    if (genRegimeBadge) {
      const gainTag =
        maxOut.gain_power_w >= 0.15
          ? ` — Max-Out adds +${maxOut.gain_power_w.toFixed(1)} W (+${maxOut.gain_pct.toFixed(0)}%)`
          : " — Drivetrain at peak output";
      genRegimeBadge.textContent = `${maxOut.regime_label}${gainTag}`;
      genRegimeBadge.classList.toggle("ok", maxOut.regime === "optimal_band");
      genRegimeBadge.classList.toggle("warn", maxOut.regime === "overspeed_underload");
      genRegimeBadge.classList.toggle("crit", maxOut.regime === "stalled_overload");
    }
    if (genMaxoutGuide) {
      genMaxoutGuide.textContent = maxOut.how_to_max_out_steps.join("\n");
    }

    // Feature #4: Multi-Wind-Speed Power Curve (2–18 m/s), Cut-In & Weibull AEP
    const siteAvgWind = Number.parseFloat(inputSiteAvgWind.value) || 5.5;
    const aepReport = evaluateWindSpeedCurveAndAep(
      design,
      bundle,
      { kv, r_int: rInt, r_load: rLoad, gear_ratio: gearRatio },
      siteAvgWind,
    );
    latestAepReport = aepReport;
    aepCutinBadge.textContent = `Cut-in ${aepReport.cut_in_mps.toFixed(1)} m/s`;
    kpiAepKwh.textContent = `${aepReport.aep_kwh_yr.toFixed(0)} kWh/yr`;
    windPowerSvg.innerHTML = renderWindPowerCurveSvgMarkup(aepReport);
    aepSummary.textContent = `Rated @12 m/s: ${aepReport.rated_elec_power_w.toFixed(
      0,
    )} W elec (${aepReport.rated_mech_power_w.toFixed(
      0,
    )} W mech) / CF ${aepReport.capacity_factor_pct.toFixed(1)}% @ V_avg=${aepReport.site_avg_wind_mps.toFixed(
      1,
    )} m/s`;

    // Feature #1: Structural & Root-Bending Mechanics + CF Spar Safety Factor
    const matKey = (selectStructMaterial.value || "petg") as StructuralMaterialKey;
    const structReport = evaluateStructuralMechanics(
      design,
      bundle,
      readCurrentFabricationSnapshot(),
      matKey,
    );
    latestStructuralReport = structReport;
    structRootMoment.textContent =
      structReport.split_moment_nm > 0
        ? `${structReport.root_moment_nm.toFixed(2)} / ${structReport.split_moment_nm.toFixed(2)} N·m`
        : `${structReport.root_moment_nm.toFixed(2)} N·m`;
    structTipDefl.textContent = `${structReport.tip_deflection_mm.toFixed(1)} mm (${structReport.tip_deflection_pct.toFixed(1)}%)`;
    const rSfStr =
      structReport.root_safety_factor >= 50
        ? ">50×"
        : `${structReport.root_safety_factor.toFixed(1)}×`;
    const jSfStr =
      structReport.joint_safety_factor >= 50
        ? ">50×"
        : `${structReport.joint_safety_factor.toFixed(1)}×`;
    structSf.textContent = `${rSfStr} / ${jSfStr}`;
    if (structSecMeta) {
      structSecMeta.textContent = `SF ${rSfStr}`;
    }
    structMassPull.textContent = `${structReport.blade_mass_g.toFixed(0)} g / ${structReport.centrifugal_root_n.toFixed(1)} N`;
    structStatus.textContent = `[${structReport.status.toUpperCase()}] Peak shell σ=${structReport.max_shell_stress_mpa.toFixed(
      1,
    )} MPa — ${structReport.recommendation}`;
    structStatus.classList.toggle("ok", structReport.status === "safe");
    structStatus.classList.toggle("warn", structReport.status === "caution");
    structStatus.classList.toggle("crit", structReport.status === "critical");

    const expPoints = parseExperimentalDataLog(
      inputExpData.value,
      design.rotor.radius_mm,
      design.rotor.wind_speed_mps,
    );
    const fit = evaluateExperimentalFit(bundle.sweep, expPoints);
    if (expSecMeta) {
      expSecMeta.textContent = `${fit.count} pts`;
    }
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

function renderPlanformPanel(design: Design, adoptFromExpr = true) {
  const chord = design.distributions.chord_mm;
  planformCosine = chord.type === "formula" && chord.expr.includes("cos(pi");
  if (adoptFromExpr && chord.type === "formula") {
    const parsed = parseCosinePlateauExpr(chord.expr);
    if (parsed) {
      sliderPlanformCenter.value = String(Math.round(parsed.center * 100));
      sliderPlanformWidth.value = String(Math.round(parsed.width * 100));
    }
  }
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

  const pinned = design.overrides.filter((ov) => ov.chord_mm !== null && ov.chord_mm !== undefined);
  planformPin.hidden = pinned.length === 0;
  if (pinned.length > 0) {
    const where = pinned.map((ov) => `${Math.round(ov.span_ratio * 100)}%`).join(", ");
    planformPinText.textContent = `Station override pins chord at ${where} of span`;
  }
}

const SECTION_ROLES: Record<SectionKey, string> = {
  root: "Structural and hub attachment",
  mid: "Primary power production",
  tip: "Low drag and vortex relief",
};

function sectionCenterFrac(): number {
  return (Number.parseFloat(sliderPlanformCenter.value) || 45) / 100;
}

function setRangeFill(input: HTMLInputElement) {
  const min = Number(input.min);
  const max = Number(input.max);
  input.style.setProperty("--fill", `${((Number(input.value) - min) / (max - min)) * 100}%`);
}

function renderSectionsPanel(design: Design) {
  const sections = readSections(design, sectionCenterFrac());
  if (sectionsSummary) {
    sectionsSummary.textContent = `c ${sections.root.chord_mm.toFixed(0)}→${sections.tip.chord_mm.toFixed(0)} mm`;
  }
  for (const tab of secTabs) {
    const key = tab.dataset.sec as SectionKey;
    const on = key === activeSection;
    tab.classList.toggle("active", on);
    tab.setAttribute("aria-selected", String(on));
    const sum = document.getElementById(`sec-sum-${key}`)!;
    sum.textContent = `${sections[key].chord_mm.toFixed(0)} mm / ${sections[key].twist_deg.toFixed(1).replace(/\.0$/, "")}°`;
  }
  secRole.textContent = SECTION_ROLES[activeSection];

  const sec = sections[activeSection];
  const shape = airfoilShapeParams(sec.airfoil);
  secAirfoil.value = sec.airfoil.type === "named" ? sec.airfoil.name : "naca4";
  secChord.value = String(Math.round(sec.chord_mm));
  secChordNum.value = String(Math.round(sec.chord_mm));
  secTwist.value = String(Number(sec.twist_deg.toFixed(1)));
  secTwistNum.value = String(Number(sec.twist_deg.toFixed(1)));
  secThick.value = String(Number((shape.t * 100).toFixed(1)));
  secThickNum.value = String(Number((shape.t * 100).toFixed(1)));
  const fixedProfile = sec.airfoil.type === "named";
  secThick.disabled = fixedProfile;
  secThickNum.disabled = fixedProfile;
  secNote.textContent =
    sec.airfoil.type === "named"
      ? `${sec.airfoil.name} has a fixed profile; t/c is nominal. Switch to NACA to tune thickness.`
      : "";
  for (const r of [secChord, secTwist, secThick]) setRangeFill(r);

  secStack.innerHTML = renderSectionStackSvgMarkup(sections, activeSection);
}

function commitSectionAirfoil() {
  const center = sectionCenterFrac();
  const sections = readSections(workingDesign, center);
  const prev = sections[activeSection].airfoil;
  const thickness = (Number.parseFloat(secThickNum.value) || 12) / 100;
  sections[activeSection].airfoil =
    secAirfoil.value === "naca4"
      ? {
          type: "naca4",
          max_camber: prev.type === "naca4" ? prev.max_camber : 0.04,
          camber_position: prev.type === "naca4" ? prev.camber_position : 0.4,
          thickness_ratio: Math.min(0.3, Math.max(0.06, thickness)),
        }
      : { type: "named", name: secAirfoil.value };
  commitDesign(applySectionAirfoils(workingDesign, sections, center));
}

function commitSectionCurve(target: "chord_mm" | "twist_deg", value: number) {
  const center = sectionCenterFrac();
  const width = (Number.parseFloat(sliderPlanformWidth.value) || 25) / 100;
  const sections = readSections(workingDesign, center);
  const field = target === "chord_mm" ? "chord_mm" : "twist_deg";
  sections[activeSection][field] = value;
  const expr = buildCosinePlateauExpr(
    sections.root[field],
    sections.tip[field],
    center,
    width,
    sections.mid[field],
  );
  commitDesign(applyFormulaCurve(workingDesign, target, expr, lockedSpanRatios));
}

function syncSectionPair(range: HTMLInputElement, num: HTMLInputElement, commit: (v: number) => void) {
  range.addEventListener("input", () => {
    num.value = range.value;
    setRangeFill(range);
  });
  range.addEventListener("change", () => commit(Number(range.value)));
  num.addEventListener("change", () => {
    const min = Number(num.min);
    const max = Number(num.max);
    const v = Math.min(max, Math.max(min, Number.parseFloat(num.value)));
    if (!Number.isFinite(v)) {
      renderSectionsPanel(workingDesign);
      return;
    }
    range.value = String(v);
    num.value = String(v);
    commit(v);
  });
}

for (const tab of secTabs) {
  tab.addEventListener("click", () => {
    activeSection = tab.dataset.sec as SectionKey;
    renderSectionsPanel(workingDesign);
  });
}
secAirfoil.addEventListener("change", commitSectionAirfoil);
syncSectionPair(secChord, secChordNum, (v) => commitSectionCurve("chord_mm", v));
syncSectionPair(secTwist, secTwistNum, (v) => commitSectionCurve("twist_deg", v));
syncSectionPair(secThick, secThickNum, () => commitSectionAirfoil());

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
  renderSectionsPanel(design);

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
      scheduleAutoSave();
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

// ---- Full Workbench Snapshot Read / Apply & Auto-Save ----
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
let suppressAutoSave = false;

function readCurrentFabricationSnapshot(): FabricationSnapshot {
  return {
    spar_hole_enabled: inputSparHoleEnabled.checked,
    spar_show_rod: inputSparShowRod.checked,
    spar_hole_diameter_mm: Math.max(0.5, Number.parseFloat(inputSparHoleDiameter.value) || 5.0),
    spar_hole_depth_mm: Math.max(5, Number.parseFloat(inputSparHoleDepth.value) || 240),
    spar_hole_offset_x_mm: Number.parseFloat(inputSparHoleOffsetX.value) || 0,
    spar_hole_offset_y_mm: Number.parseFloat(inputSparHoleOffsetY.value) || 0,
    spar_hole_tolerance_mm: Math.max(0, Number.parseFloat(inputSparHoleTolerance.value) || 0),
    split_parts: Math.max(1, Number.parseInt(selectSplitParts.value, 10) || 1),
    split_active_part: selectSplitActivePart.value || "all",
    split_ratio_pct: Math.max(12, Math.min(88, sliderSplitRatio.valueAsNumber || 50)),
    split_explode_gap_mm: Math.max(0, sliderSplitExplodeGap.valueAsNumber || 0),
    align_shape: selectAlignShape.value || "round",
    align_count: Math.max(1, Number.parseInt(selectAlignCount.value, 10) || 2),
    align_size_mm: Math.max(1, Number.parseFloat(inputAlignSize.value) || 3),
    align_key_length_mm: Math.max(2, Number.parseFloat(inputAlignKeyLength.value) || 6),
    align_height_mm: Math.max(1, Number.parseFloat(inputAlignHeight.value) || 6),
    align_spacing_mm: Math.max(0, Number.parseFloat(inputAlignSpacing.value) || 0),
    align_clearance_mm: Math.max(0, Number.parseFloat(inputAlignClearance.value) || 0),
    align_depth_clearance_mm: Math.max(
      0,
      Number.parseFloat(inputAlignDepthClearance.value) || 0,
    ),
    align_min_wall_mm: Math.max(0.4, Number.parseFloat(inputAlignMinWall.value) || 0.8),
  };
}

function applyFabricationSnapshotToDom(fab: FabricationSnapshot) {
  inputSparHoleEnabled.checked = Boolean(fab.spar_hole_enabled);
  inputSparShowRod.checked = fab.spar_show_rod !== false;
  inputSparHoleDiameter.value = String(fab.spar_hole_diameter_mm ?? 5.0);
  inputSparHoleDepth.value = String(fab.spar_hole_depth_mm ?? 240);
  sliderSparHoleDepth.value = String(fab.spar_hole_depth_mm ?? 240);
  inputSparHoleOffsetX.value = String(fab.spar_hole_offset_x_mm ?? 0);
  inputSparHoleOffsetY.value = String(fab.spar_hole_offset_y_mm ?? 0);
  inputSparHoleTolerance.value = String(fab.spar_hole_tolerance_mm ?? 0.2);
  selectSplitParts.value = String(Math.max(1, Math.min(4, fab.split_parts || 1)));
  selectSplitActivePart.value = fab.split_active_part || "all";
  sliderSplitRatio.value = String(Math.max(12, Math.min(88, fab.split_ratio_pct ?? 50)));
  splitRatioVal.textContent = `${sliderSplitRatio.value}%`;
  sliderSplitExplodeGap.value = String(Math.max(0, fab.split_explode_gap_mm ?? 0));
  splitExplodeVal.textContent = `${sliderSplitExplodeGap.value} mm`;
  selectAlignShape.value = fab.align_shape || "round";
  selectAlignCount.value = String(Math.max(1, Math.min(2, fab.align_count ?? 2)));
  inputAlignSize.value = String(fab.align_size_mm ?? 3.0);
  inputAlignKeyLength.value = String(fab.align_key_length_mm ?? 6.0);
  inputAlignHeight.value = String(fab.align_height_mm ?? 6.0);
  inputAlignSpacing.value = String(fab.align_spacing_mm ?? 0);
  inputAlignClearance.value = String(fab.align_clearance_mm ?? 0.2);
  inputAlignDepthClearance.value = String(fab.align_depth_clearance_mm ?? 0.5);
  inputAlignMinWall.value = String(fab.align_min_wall_mm ?? 0.8);
}

function readCurrentWorkbenchUiSnapshot(): WorkbenchUiSnapshot {
  return {
    planform_cosine: planformCosine,
    planform_center_pct: Number.parseFloat(sliderPlanformCenter.value) || 45,
    planform_width_pct: Number.parseFloat(sliderPlanformWidth.value) || 25,
    locked_span_ratios: [...lockedSpanRatios],
    bind_taper: inputBindTaper.checked,
    taper_ratio: Number.parseFloat(inputTaperRatio.value) || 0.457,
    chord_offset_x_mm: sliderChordOffsetX.valueAsNumber || 0,
    chord_offset_y_mm: sliderChordOffsetY.valueAsNumber || 0,
    global_light_intensity: sliderGlobalLight.valueAsNumber || 1.35,
    view_mode: viewMode,
    wireframe_mode: wireframeMode,
    heatmap_mode: (selectHeatmapMode.value || "segment") as HeatmapMode,
    structural_material: (selectStructMaterial.value || "petg") as StructuralMaterialKey,
    site_avg_wind_mps: Number.parseFloat(inputSiteAvgWind.value) || 5.5,
    printer_preset: (selectPrinterPreset.value || "bambu_256") as PrinterPresetKey,
    printer_max_z_mm: Number.parseFloat(inputPrinterMaxZ.value) || 256,
    blade_preset: activeBladePreset,
    gen_preset: (selectGenPreset?.value || "low_rpm_pmg") as GeneratorPresetKey,
    gen_gear_ratio: Math.max(0.25, Number.parseFloat(inputGenGearRatio?.value) || 1.0),
    gen_kv: Number.parseFloat(inputGenKv.value) || 35,
    gen_r_int: Number.parseFloat(inputGenRInt.value) || 0.8,
    gen_r_load: Number.parseFloat(inputGenRLoad.value) || 12.0,
    exp_data_log: inputExpData.value || "",
    gearbox: readCurrentGearboxConfig(),
    studio_mode: studioMode,
    gearbox_selected_gear: selectedGearIndex,
    gearbox_inspector_open: gearboxInspector?.classList.contains("open") ?? true,
    collective_pitch_deg: collectivePitchDeg,
    winglet: readCurrentWingletConfig(),
    flip_blade: bladeFlipped,
  };
}

function syncBladePresetButtons(presetKey: BladeWindPresetKey) {
  activeBladePreset = presetKey;
  for (const [btn, key] of [
    [btnPresetLowWind, "low_wind"],
    [btnPresetKidwind, "med_kidwind"],
    [btnPresetScimitar, "scimitar_belly"],
    [btnPresetHighWind, "high_wind"],
    [btnPresetRef, "schmitz_600"],
  ] as const) {
    if (btn) {
      btn.classList.toggle("active", presetKey === key);
    }
  }
  const spec = BLADE_WIND_PRESETS[presetKey];
  if (bladePresetDesc && spec) {
    bladePresetDesc.textContent = spec.description;
  }
}

function applyWorkbenchUiSnapshotToDom(wb: WorkbenchUiSnapshot) {
  planformCosine = Boolean(wb.planform_cosine);
  sliderPlanformCenter.value = String(wb.planform_center_pct ?? 45);
  sliderPlanformWidth.value = String(wb.planform_width_pct ?? 25);
  lockedSpanRatios.splice(0, lockedSpanRatios.length, ...(wb.locked_span_ratios ?? []));
  inputBindTaper.checked = Boolean(wb.bind_taper);
  inputTaperRatio.value = String(wb.taper_ratio ?? 0.457);

  const ox = wb.chord_offset_x_mm ?? 0;
  const oy = wb.chord_offset_y_mm ?? 0;
  sliderChordOffsetX.value = String(ox);
  chordOffsetXVal.textContent = `${ox} mm`;
  sliderChordOffsetY.value = String(oy);
  chordOffsetYVal.textContent = `${oy} mm`;

  const light = wb.global_light_intensity ?? 1.35;
  sliderGlobalLight.value = String(light);
  globalLightVal.textContent = `${light.toFixed(2)}×`;
  setGlobalIlluminationScale(light);

  viewMode =
    wb.view_mode === "single"
      ? "single"
      : wb.view_mode === "gearbox"
        ? "gearbox"
        : "rotor";
  btnViewSingle.classList.toggle("active", viewMode === "single");
  btnViewSingle.setAttribute("aria-pressed", String(viewMode === "single"));
  btnViewRotor.classList.toggle("active", viewMode === "rotor");
  btnViewRotor.setAttribute("aria-pressed", String(viewMode === "rotor"));
  btnViewGearbox?.classList.toggle("active", viewMode === "gearbox");
  btnViewGearbox?.setAttribute("aria-pressed", String(viewMode === "gearbox"));

  if (wb.gearbox) {
    applyGearboxConfigToDom(wb.gearbox);
  } else {
    applyGearboxConfigToDom(defaultGearboxConfig());
  }

  if (wb.studio_mode === "gearbox" || wb.view_mode === "gearbox") {
    setStudioMode("gearbox");
    if (wb.gearbox_selected_gear !== undefined) {
      selectGear(wb.gearbox_selected_gear, Boolean(wb.gearbox_inspector_open ?? true));
    }
  } else {
    setStudioMode("blade");
  }

  wireframeMode = Boolean(wb.wireframe_mode);
  btnViewWireframe.classList.toggle("active", wireframeMode);
  btnViewWireframe.setAttribute("aria-pressed", String(wireframeMode));

  selectHeatmapMode.value = wb.heatmap_mode || "segment";
  selectStructMaterial.value = wb.structural_material || "petg";
  inputSiteAvgWind.value = String(wb.site_avg_wind_mps ?? 5.5);
  selectPrinterPreset.value = wb.printer_preset || "bambu_256";
  inputPrinterMaxZ.value = String(wb.printer_max_z_mm ?? 256);

  syncBladePresetButtons(wb.blade_preset || "schmitz_600");
  if (selectGenPreset) {
    selectGenPreset.value = wb.gen_preset || "low_rpm_pmg";
  }
  if (inputGenGearRatio) {
    inputGenGearRatio.value = String(wb.gen_gear_ratio ?? 1.0);
  }
  syncGearQuickButtons(wb.gen_gear_ratio ?? 1.0);
  inputGenKv.value = String(wb.gen_kv ?? 35);
  inputGenRInt.value = String(wb.gen_r_int ?? 0.8);
  inputGenRLoad.value = String(wb.gen_r_load ?? 12.0);
  inputExpData.value = wb.exp_data_log ?? "";
  setCollectivePitch(wb.collective_pitch_deg ?? 0.0, false);
  applyWingletConfigToDom(wb.winglet);
  setBladeFlipped(wb.flip_blade ?? true, false);
}

function buildCurrentWorkbenchSnapshot(name?: string): WorkbenchSnapshot {
  return createWorkbenchSnapshot(
    workingDesign,
    readCurrentFabricationSnapshot(),
    readCurrentWorkbenchUiSnapshot(),
    name || slotNameInput.value.trim() || undefined,
  );
}

function formatShortTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return "just now";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "just now";
  }
}

function flushAutoSaveNow(badgePrefix = "Auto-saved") {
  if (suppressAutoSave) return;
  if (autoSaveTimer !== null) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
  try {
    const snap = buildCurrentWorkbenchSnapshot();
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(snap));
    const timeLabel = formatShortTime(snap.saved_at);
    autosaveBadge.classList.remove("saving");
    autosaveBadge.textContent = `${badgePrefix} ${timeLabel}`;
    autosaveDetail.textContent = `${badgePrefix} at ${timeLabel}`;
  } catch {
    autosaveBadge.classList.remove("saving");
    autosaveBadge.textContent = "Local save full";
  }
}

function scheduleAutoSave(badgePrefix = "Auto-saved") {
  if (suppressAutoSave) return;
  autosaveBadge.classList.add("saving");
  autosaveBadge.textContent = "Saving...";
  if (autoSaveTimer !== null) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = setTimeout(() => {
    flushAutoSaveNow(badgePrefix);
  }, 160);
}

function applyWorkbenchSnapshot(
  snapshot: WorkbenchSnapshot,
  options: { commitToHistory?: boolean; badgePrefix?: string } = {},
) {
  const prevSuppress = suppressAutoSave;
  suppressAutoSave = true;
  try {
    applyFabricationSnapshotToDom(snapshot.fabrication);
    applyWorkbenchUiSnapshotToDom(snapshot.workbench);
    if (snapshot.name) {
      slotNameInput.value = snapshot.name;
    }
    if (options.commitToHistory !== false) {
      history.commit(snapshot.design);
    }
    workingDesign = history.current();
    syncControlsFromDesign(workingDesign);
    rebuild3D(workingDesign);
    applyMeshChordOffset();
  } finally {
    suppressAutoSave = prevSuppress;
  }
  flushAutoSaveNow(options.badgePrefix ?? "Loaded");
}

function commitDesign(next: Design) {
  history.commit(next);
  workingDesign = history.current();
  syncControlsFromDesign(workingDesign);
  rebuild3D(workingDesign);
  scheduleAutoSave();
}

// ---- 3D Viewport Mode & Camera Listeners ----
function setViewportMode(nextMode: "single" | "rotor" | "gearbox") {
  viewMode = nextMode;
  btnViewSingle.classList.toggle("active", viewMode === "single");
  btnViewSingle.setAttribute("aria-pressed", String(viewMode === "single"));
  btnViewRotor.classList.toggle("active", viewMode === "rotor");
  btnViewRotor.setAttribute("aria-pressed", String(viewMode === "rotor"));
  btnViewGearbox?.classList.toggle("active", viewMode === "gearbox");
  btnViewGearbox?.setAttribute("aria-pressed", String(viewMode === "gearbox"));

  if (viewMode === "single") {
    const r = workingDesign.rotor.radius_mm;
    camera.position.set(r * 0.7, r * 0.55, r * 1.35);
    controls.target.set(30, 0, r * 0.55);
  } else if (viewMode === "rotor") {
    const r = workingDesign.rotor.radius_mm;
    camera.position.set(r * 0.7, r * 0.55, r * 1.35);
    controls.target.set(0, 0, 0);
  } else {
    const gm = computeGearboxMetrics(readCurrentGearboxConfig());
    const span = Math.max(120, gm.total_span_width_mm);
    camera.position.set(0, span * 0.85, span * 1.15);
    controls.target.set(0, 8, 0);
  }
  controls.update();
  rebuild3D(workingDesign);
  scheduleAutoSave();
}

function setStudioMode(mode: "blade" | "gearbox") {
  studioMode = mode;
  tabStudioBlade?.classList.toggle("active", mode === "blade");
  tabStudioBlade?.setAttribute("aria-selected", String(mode === "blade"));
  tabStudioGearbox?.classList.toggle("active", mode === "gearbox");
  tabStudioGearbox?.setAttribute("aria-selected", String(mode === "gearbox"));

  if (mode === "gearbox") {
    document.body.classList.add("studio-gearbox-mode");
    setViewportMode("gearbox");
    gearboxInspector?.classList.add("open");
    btnToggleGearboxInspector?.classList.add("active");
    btnToggleGearboxInspector?.setAttribute("aria-pressed", "true");
    selectGear(1, true);
  } else {
    document.body.classList.remove("studio-gearbox-mode");
    gearboxInspector?.classList.remove("open");
    btnToggleGearboxInspector?.classList.remove("active");
    btnToggleGearboxInspector?.setAttribute("aria-pressed", "false");
    selectGear(null, false);
    setViewportMode("rotor");
    const r = workingDesign.rotor.radius_mm;
    const l = Math.max(0, r - workingDesign.rotor.hub_radius_mm);
    if (hudRotorSpec) {
      hudRotorSpec.textContent = `R ${r} mm  L ${l.toFixed(0)} mm  B ${workingDesign.rotor.blade_count}`;
    }
  }
  syncDockAccessibilityState();
  syncTopDockOffset();
  scheduleAutoSave();
}

tabStudioBlade?.addEventListener("click", () => setStudioMode("blade"));
tabStudioGearbox?.addEventListener("click", () => setStudioMode("gearbox"));

btnCloseGearboxInspector?.addEventListener("click", () => {
  gearboxInspector?.classList.remove("open");
  btnToggleGearboxInspector?.classList.remove("active");
  btnToggleGearboxInspector?.setAttribute("aria-pressed", "false");
  syncDockAccessibilityState();
});

btnToggleGearboxInspector?.addEventListener("click", () => {
  const isOpen = gearboxInspector?.classList.toggle("open");
  btnToggleGearboxInspector.classList.toggle("active", Boolean(isOpen));
  btnToggleGearboxInspector.setAttribute("aria-pressed", String(Boolean(isOpen)));
  syncDockAccessibilityState();
});

btnSelectGearTrain?.addEventListener("click", () => selectGear(null, true));
btnSelectGearG1?.addEventListener("click", () => selectGear(1, true));
btnSelectGearG2?.addEventListener("click", () => selectGear(2, true));
btnSelectGearG3?.addEventListener("click", () => selectGear(3, true));

btnViewSingle.addEventListener("click", () => setViewportMode("single"));
btnViewRotor.addEventListener("click", () => setViewportMode("rotor"));
btnViewGearbox?.addEventListener("click", () => setStudioMode("gearbox"));
btnGearbox3dView?.addEventListener("click", () => {
  setStudioMode(studioMode === "gearbox" ? "blade" : "gearbox");
});

btnTbGearLayoutSide?.addEventListener("click", () => {
  activeGearLayoutMode = "side_by_side";
  btnTbGearLayoutSide.classList.add("active");
  btnTbGearLayoutMesh?.classList.remove("active");
  btnGearLayoutSide?.classList.add("active");
  btnGearLayoutMesh?.classList.remove("active");
  rebuild3D(workingDesign);
  scheduleAutoSave();
});

btnTbGearLayoutMesh?.addEventListener("click", () => {
  activeGearLayoutMode = "meshed";
  btnTbGearLayoutMesh.classList.add("active");
  btnTbGearLayoutSide?.classList.remove("active");
  btnGearLayoutMesh?.classList.add("active");
  btnGearLayoutSide?.classList.remove("active");
  rebuild3D(workingDesign);
  scheduleAutoSave();
});

btnTbGearSpin?.addEventListener("click", () => {
  btnViewSpin.click();
  btnTbGearSpin.classList.toggle("active", spinRotorMode);
});

btnTbGearExportAll?.addEventListener("click", () => {
  btnExportGearsAll?.click();
});

btnGearLayoutSide?.addEventListener("click", () => {
  activeGearLayoutMode = "side_by_side";
  btnGearLayoutSide.classList.add("active");
  btnGearLayoutMesh?.classList.remove("active");
  btnTbGearLayoutSide?.classList.add("active");
  btnTbGearLayoutMesh?.classList.remove("active");
  if (viewMode !== "gearbox") {
    setStudioMode("gearbox");
  } else {
    rebuild3D(workingDesign);
    scheduleAutoSave();
  }
});

btnGearLayoutMesh?.addEventListener("click", () => {
  activeGearLayoutMode = "meshed";
  btnGearLayoutMesh.classList.add("active");
  btnGearLayoutSide?.classList.remove("active");
  btnTbGearLayoutMesh?.classList.add("active");
  btnTbGearLayoutSide?.classList.remove("active");
  if (viewMode !== "gearbox") {
    setStudioMode("gearbox");
  } else {
    rebuild3D(workingDesign);
    scheduleAutoSave();
  }
});

[
  selectGearStageMode,
  inputGearModule,
  inputGearHelix,
  inputGearPressure,
  inputGearBacklash,
  inputGearSpokeWidth,
  inputGearRimWall,
  inputGearHubRing,
  inputG1Teeth,
  inputG1Face,
  selectG1Spokes,
  inputG1Bore,
  inputG1DFlat,
  inputG1HubDia,
  inputG1HubH,
  inputG2WheelTeeth,
  inputG2WheelFace,
  selectG2Spokes,
  inputG2PinionTeeth,
  inputG2PinionFace,
  inputG2Bore,
  inputG2DFlat,
  inputG3Teeth,
  inputG3Face,
  inputG3Bore,
  inputG3DFlat,
  inputG3BossH,
  selectG3HelixHand,
].forEach((el) => {
  el?.addEventListener("change", () => {
    rebuild3D(workingDesign);
    scheduleAutoSave();
  });
});

btnGearSolveRatio?.addEventListener("click", () => {
  const targetG =
    latestMaxOutReport?.opt_gear_ratio ||
    Number.parseFloat(inputGenGearRatio?.value || "3.0") ||
    3.0;
  const solved = solveGearTeethForTargetRatio(readCurrentGearboxConfig(), targetG);
  applyGearboxConfigToDom(solved);
  const m = computeGearboxMetrics(solved);
  if (inputGenGearRatio) {
    inputGenGearRatio.value = String(m.total_ratio);
    syncGearQuickButtons(m.total_ratio);
  }
  rebuild3D(workingDesign);
  scheduleAutoSave();
});

btnGearSyncAero?.addEventListener("click", () => {
  const m = computeGearboxMetrics(readCurrentGearboxConfig());
  if (inputGenGearRatio) {
    inputGenGearRatio.value = String(m.total_ratio);
    syncGearQuickButtons(m.total_ratio);
  }
  updateAeroPanel(workingDesign);
  scheduleAutoSave();
});

function exportGearboxTargetStl(target: GearExportTarget) {
  const cfg = readCurrentGearboxConfig();
  const m = computeGearboxMetrics(cfg);
  const bytes = exportGearStlBytes(cfg, target);
  const suffix =
    target === "all"
      ? `all-3gears-G${m.total_ratio.toFixed(2)}-m${cfg.module_mm}`
      : target === "gear1"
        ? `gear1-rotor-${cfg.g1_teeth}T-m${cfg.module_mm}`
        : target === "gear2"
          ? `gear2-compound-${cfg.g2_wheel_teeth}T-${cfg.g2_pinion_teeth}T-m${cfg.module_mm}`
          : `gear3-pinion-${cfg.g3_teeth}T-m${cfg.module_mm}`;
  const filename = `bladelab-${suffix}.stl`;
  triggerBlobDownload(bytes, filename, "model/stl");
  exportStatus.textContent = `Saved ${filename} (${(bytes.byteLength / 1024).toFixed(1)} kB)`;
}

btnExportGearsAll?.addEventListener("click", () => exportGearboxTargetStl("all"));
btnExportGear1?.addEventListener("click", () => exportGearboxTargetStl("gear1"));
btnExportGear2?.addEventListener("click", () => exportGearboxTargetStl("gear2"));
btnExportGear3?.addEventListener("click", () => exportGearboxTargetStl("gear3"));

btnViewWireframe.addEventListener("click", () => {
  wireframeMode = !wireframeMode;
  btnViewWireframe.classList.toggle("active", wireframeMode);
  btnViewWireframe.setAttribute("aria-pressed", String(wireframeMode));
  rebuild3D(workingDesign);
  scheduleAutoSave();
});

btnViewSpin.addEventListener("click", () => {
  spinRotorMode = !spinRotorMode;
  btnViewSpin.classList.toggle("active", spinRotorMode);
  btnViewSpin.setAttribute("aria-pressed", String(spinRotorMode));
});

selectHeatmapMode.addEventListener("change", () => {
  rebuild3D(workingDesign);
  scheduleAutoSave();
});

selectPrinterPreset.addEventListener("change", () => {
  const preset = (selectPrinterPreset.value || "bambu_256") as PrinterPresetKey;
  if (preset !== "custom") {
    const spec = PRINTER_PRESETS[preset];
    if (spec) {
      inputPrinterMaxZ.value = String(spec.max_z_mm);
    }
  }
  updatePrinterFitStatus(workingDesign);
  scheduleAutoSave();
});

inputPrinterMaxZ.addEventListener("change", () => {
  selectPrinterPreset.value = "custom";
  updatePrinterFitStatus(workingDesign);
  scheduleAutoSave();
});

btnAutoFitPrinter.addEventListener("click", () => {
  const preset = (selectPrinterPreset.value || "bambu_256") as PrinterPresetKey;
  const customZ = Number.parseFloat(inputPrinterMaxZ.value) || 256;
  const fit = evaluatePrinterBuildFit(
    workingDesign,
    readCurrentFabricationSnapshot(),
    preset,
    customZ,
  );
  selectSplitParts.value = String(fit.recommended_split_parts);
  sliderSplitRatio.value = String(fit.recommended_split_ratio_pct);
  rebuild3D(workingDesign);
  scheduleAutoSave();
});

btnCamIso.addEventListener("click", () => {
  if (viewMode === "gearbox") {
    const gm = computeGearboxMetrics(readCurrentGearboxConfig());
    const span = Math.max(120, gm.total_span_width_mm);
    camera.position.set(0, span * 0.85, span * 1.15);
    controls.target.set(0, 8, 0);
    controls.update();
    return;
  }
  const r = workingDesign.rotor.radius_mm;
  camera.position.set(r * 0.85, r * 0.65, r * 1.35);
  controls.target.set(0, 0, viewMode === "rotor" ? 0 : r * 0.5);
  controls.update();
});

btnCamTop.addEventListener("click", () => {
  if (viewMode === "gearbox") {
    const gm = computeGearboxMetrics(readCurrentGearboxConfig());
    const span = Math.max(120, gm.total_span_width_mm);
    camera.position.set(0, span * 1.5, 0.01);
    controls.target.set(0, 0, 0);
    controls.update();
    return;
  }
  const r = workingDesign.rotor.radius_mm;
  camera.position.set(0, r * 1.9, 0.01);
  controls.target.set(0, 0, viewMode === "rotor" ? 0 : r * 0.5);
  controls.update();
});

btnCamTip.addEventListener("click", () => {
  if (viewMode === "gearbox") {
    const gm = computeGearboxMetrics(readCurrentGearboxConfig());
    const span = Math.max(120, gm.total_span_width_mm);
    camera.position.set(0, 12, span * 1.3);
    controls.target.set(0, 10, 0);
    controls.update();
    return;
  }
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
      const winglet = readCurrentWingletConfig();
      let bytes: Uint8Array;
      if (winglet.enabled && latestCleanBladePositions && latestCleanBladePositions.length > 0) {
        bytes = exportBufferGeometryStlBytes(
          latestCleanBladePositions,
          `BladeLab R${workingDesign.rotor.radius_mm} Winglet Blade STL`,
        );
      } else {
        bytes =
          fabJson === "{}"
            ? export_stl_bytes(JSON.stringify(workingDesign))
            : export_fabricated_stl_bytes(JSON.stringify(workingDesign), fabJson);
      }
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
    scheduleAutoSave();
  });
  el.addEventListener("change", () => {
    rebuild3D(workingDesign);
    scheduleAutoSave();
  });
}

sliderSparHoleDepth.addEventListener("input", () => {
  inputSparHoleDepth.value = String(sliderSparHoleDepth.valueAsNumber);
  rebuild3D(workingDesign);
  scheduleAutoSave();
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
    scheduleAutoSave();
  });
}

for (const [btnId, shapeVal, sizeMm, lenMm] of [
  ["btn-joint-contour", "contour", 3.0, 6.0],
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
    if (shapeVal === "contour") {
      inputAlignMinWall.value = "1.2";
      inputAlignHeight.value = "8.0";
    } else {
      inputAlignSize.value = sizeMm.toFixed(1);
      inputAlignKeyLength.value = lenMm.toFixed(1);
    }
    rebuild3D(workingDesign);
    scheduleAutoSave();
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
    scheduleAutoSave();
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
  scheduleAutoSave();
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

function exportWorkbenchSnapshotJson() {
  const snapshot = buildCurrentWorkbenchSnapshot();
  const slug = snapshot.name
    ? snapshot.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : `R${workingDesign.rotor.radius_mm}-B${workingDesign.rotor.blade_count}`;
  const filename = `bladelab-${slug || "project"}.json`;
  triggerBlobDownload(
    JSON.stringify(snapshot, null, 2),
    filename,
    "application/json",
  );
  exportStatus.textContent = `Saved ${filename}`;
  flushAutoSaveNow("Saved");
}

btnExportJson.addEventListener("click", exportWorkbenchSnapshotJson);
btnDrawerSaveJson.addEventListener("click", exportWorkbenchSnapshotJson);

function triggerLoadJsonPicker() {
  inputLoadJsonFile.value = "";
  inputLoadJsonFile.click();
}

btnLoadJson.addEventListener("click", triggerLoadJsonPicker);
btnDrawerLoadJson.addEventListener("click", triggerLoadJsonPicker);

inputLoadJsonFile.addEventListener("change", async () => {
  const file = inputLoadJsonFile.files?.[0];
  if (!file) return;
  try {
    const rawText = await file.text();
    const snapshot = parseLoadedProjectJson(rawText);
    if (!snapshot.name) {
      snapshot.name = file.name.replace(/\.json$/i, "");
    }
    applyWorkbenchSnapshot(snapshot, { commitToHistory: true, badgePrefix: "Loaded" });
    exportStatus.textContent = `Loaded ${file.name}`;
    errorBanner.style.display = "none";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    exportStatus.textContent = "Load failed";
    errorBanner.textContent = `Could not load ${file.name}: ${msg}`;
    errorBanner.style.display = "block";
  }
});

// ---- Saved Projects & Named Local Slots Manager ----
let savedSlots: SavedSlotEntry[] = [];

function loadSavedSlotsFromStorage(): SavedSlotEntry[] {
  try {
    const raw = localStorage.getItem(SAVED_SLOTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedSlotEntry =>
        Boolean(item && typeof item === "object" && "id" in item && "snapshot" in item),
    );
  } catch {
    return [];
  }
}

function persistSavedSlotsToStorage(slots: readonly SavedSlotEntry[]) {
  try {
    localStorage.setItem(SAVED_SLOTS_STORAGE_KEY, JSON.stringify(slots));
  } catch {
    // Ignore storage quota errors
  }
}

function renderSavedSlotsList() {
  savedSlotsCount.textContent = String(savedSlots.length);
  savedSlotsList.innerHTML = "";
  if (savedSlots.length === 0) {
    const empty = document.createElement("div");
    empty.className = "slot-empty";
    empty.textContent = "No named slots saved yet";
    savedSlotsList.appendChild(empty);
    return;
  }

  for (const entry of savedSlots) {
    const row = document.createElement("div");
    row.className = "slot-row";
    row.setAttribute("role", "listitem");

    const info = document.createElement("div");
    info.className = "slot-info";

    const nameEl = document.createElement("span");
    nameEl.className = "slot-name";
    nameEl.textContent = entry.name;

    const subEl = document.createElement("span");
    subEl.className = "slot-sub";
    const d = entry.snapshot.design.rotor;
    const fab = entry.snapshot.fabrication;
    const splitTag =
      fab && fab.split_parts > 1 ? `${fab.split_parts}-part (${fab.align_shape})` : "1-part";
    subEl.textContent = `R${d.radius_mm} B${d.blade_count} · ${splitTag} · ${formatShortTime(entry.saved_at)}`;

    info.append(nameEl, subEl);

    const actions = document.createElement("div");
    actions.className = "slot-actions";

    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "btn-mini";
    loadBtn.textContent = "Load";
    loadBtn.title = `Load "${entry.name}" into workbench`;
    loadBtn.addEventListener("click", () => {
      try {
        const validated = parseLoadedProjectJson(JSON.stringify(entry.snapshot));
        validated.name = entry.name;
        applyWorkbenchSnapshot(validated, { commitToHistory: true, badgePrefix: "Loaded" });
        exportStatus.textContent = `Loaded slot "${entry.name}"`;
      } catch (err) {
        exportStatus.textContent = `Slot error: ${String(err)}`;
      }
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-mini";
    delBtn.textContent = "×";
    delBtn.title = `Delete saved slot "${entry.name}"`;
    delBtn.setAttribute("aria-label", `Delete saved slot ${entry.name}`);
    delBtn.addEventListener("click", () => {
      savedSlots = removeSavedSlot(savedSlots, entry.id);
      persistSavedSlotsToStorage(savedSlots);
      renderSavedSlotsList();
    });

    actions.append(loadBtn, delBtn);
    row.append(info, actions);
    savedSlotsList.appendChild(row);
  }
}

function toggleProjectsDrawer(forceOpen?: boolean) {
  const isOpen =
    forceOpen !== undefined
      ? projectsDrawer.classList.toggle("open", forceOpen)
      : projectsDrawer.classList.toggle("open");
  btnToggleProjects.classList.toggle("active", isOpen);
  btnToggleProjects.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    document.body.classList.remove("hide-left-dock");
    if (innerWidth <= 1180) {
      document.body.setAttribute("data-mobile-pane", "cad");
    }
  }
}

btnToggleProjects.addEventListener("click", () => {
  toggleProjectsDrawer();
});

autosaveBadge.addEventListener("click", () => {
  toggleProjectsDrawer();
});

btnSaveSlot.addEventListener("click", () => {
  const rawName = slotNameInput.value.trim();
  const snap = buildCurrentWorkbenchSnapshot(rawName);
  const slotName =
    rawName ||
    `Rotor R${workingDesign.rotor.radius_mm} B${workingDesign.rotor.blade_count}`;
  savedSlots = upsertSavedSlot(savedSlots, snap, slotName);
  slotNameInput.value = slotName;
  persistSavedSlotsToStorage(savedSlots);
  renderSavedSlotsList();
  flushAutoSaveNow("Saved");
  exportStatus.textContent = `Saved slot "${slotName}"`;

  // Also sync to Team Cloud Workspace if blade-server is reachable
  if (inputCloudDesignName) {
    inputCloudDesignName.value = slotName;
  }
});

slotNameInput.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    btnSaveSlot.click();
  }
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
  scheduleAutoSave();
});

sliderChordOffsetY.addEventListener("input", () => {
  chordOffsetYVal.textContent = `${sliderChordOffsetY.valueAsNumber} mm`;
  applyMeshChordOffset();
  scheduleAutoSave();
});

sliderGlobalLight.addEventListener("input", () => {
  const val = sliderGlobalLight.valueAsNumber || 1.35;
  globalLightVal.textContent = `${val.toFixed(2)}×`;
  setGlobalIlluminationScale(val);
  scheduleAutoSave();
});

// Collective Pitch Listeners
inputRotorCollectivePitch?.addEventListener("input", () => {
  setCollectivePitch(inputRotorCollectivePitch.valueAsNumber);
});
inputTbCollectivePitch?.addEventListener("input", () => {
  setCollectivePitch(inputTbCollectivePitch.valueAsNumber);
});
btnPitchRun?.addEventListener("click", () => setCollectivePitch(0.0));
btnPitchStart?.addEventListener("click", () => setCollectivePitch(4.0));
btnPitchFeatherPanel?.addEventListener("click", () => setCollectivePitch(30.0));
btnPitchFeather?.addEventListener("click", () => setCollectivePitch(30.0));
btnFlipBlade?.addEventListener("click", () => setBladeFlipped(!bladeFlipped));
btnFlipBladePanel?.addEventListener("click", () => setBladeFlipped(!bladeFlipped));

// Winglet Listeners
inputWingletEnabled?.addEventListener("change", () => {
  if (wingletControlsSubbox) {
    wingletControlsSubbox.style.display = inputWingletEnabled.checked ? "block" : "none";
  }
  rebuild3D(workingDesign);
  scheduleAutoSave();
});
for (const input of [inputWingletCant, inputWingletHeight, inputWingletSweep, inputWingletRadius]) {
  input?.addEventListener("input", () => {
    rebuild3D(workingDesign);
    scheduleAutoSave();
  });
  input?.addEventListener("change", () => {
    rebuild3D(workingDesign);
    scheduleAutoSave();
  });
}

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

function cosineCenterOf(design: Design, target: "chord_mm" | "twist_deg"): number | null {
  const curve = design.distributions[target];
  return curve.type === "formula" ? (parseCosinePlateauExpr(curve.expr)?.center ?? null) : null;
}

function applyPlanformCosine() {
  const center = Number.parseFloat(sliderPlanformCenter.value) / 100;
  const width = Number.parseFloat(sliderPlanformWidth.value) / 100;
  let next = workingDesign;
  for (const target of ["chord_mm", "twist_deg"] as const) {
    const oldCenter = cosineCenterOf(workingDesign, target);
    if (oldCenter === null && target === "twist_deg") continue;
    const field = target;
    const secs = readSections(workingDesign, oldCenter ?? center);
    const root = secs.root[field];
    const tip = secs.tip[field];
    const mid = oldCenter === null ? 0.5 * (root + tip) : secs.mid[field];
    next = applyFormulaCurve(
      next,
      target,
      buildCosinePlateauExpr(root, tip, center, width, mid),
      lockedSpanRatios,
    );
  }
  commitDesign(next);
}

btnPlanformLinear.addEventListener("click", () => {
  if (!planformCosine) return;
  const { root, tip } = planformEndpoints(workingDesign);
  const next = cloneDesign(workingDesign);
  next.distributions.chord_mm = { type: "linear", root, tip };
  commitDesign(preserveLockedStations(workingDesign, next, lockedSpanRatios));
});

btnPlanformUnpin.addEventListener("click", () => {
  commitDesign(clearAllOverrides(workingDesign));
});

btnPlanformCosine.addEventListener("click", () => {
  if (planformCosine) return;
  applyPlanformCosine();
});

for (const slider of [sliderPlanformCenter, sliderPlanformWidth]) {
  slider.addEventListener("input", () => renderPlanformPanel(workingDesign, false));
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

function applySelectedBladePreset(presetKey: BladeWindPresetKey) {
  const { design, spec: preset } = applyBladeWindPreset(workingDesign, presetKey);
  planformCosine = preset.planform.cosine;
  sliderPlanformCenter.value = String(preset.planform.center_pct);
  sliderPlanformWidth.value = String(preset.planform.width_pct);
  planformCenterVal.textContent = `${preset.planform.center_pct}%`;
  planformWidthVal.textContent = `${preset.planform.width_pct}%`;

  const genPresetKey = preset.recommended_drivetrain.gen_preset;
  const genSpec = GENERATOR_PRESETS[genPresetKey];
  selectGenPreset.value = genPresetKey;
  if (genSpec) {
    inputGenKv.value = String(genSpec.kv_rpm_per_v);
    inputGenRInt.value = String(genSpec.r_int_ohm);
  }
  inputGenGearRatio.value = String(preset.recommended_drivetrain.gear_ratio);
  inputGenRLoad.value = String(preset.recommended_drivetrain.r_load_ohm);
  inputSiteAvgWind.value = String(preset.recommended_drivetrain.site_avg_wind_mps);
  if (preset.recommended_spar_mm && preset.recommended_spar_mm > 0) {
    inputSparHoleEnabled.checked = true;
    inputSparHoleDiameter.value = String(preset.recommended_spar_mm);
  }
  syncGearQuickButtons(preset.recommended_drivetrain.gear_ratio);
  syncBladePresetButtons(presetKey);
  commitDesign(design);
}

btnPresetLowWind?.addEventListener("click", () => applySelectedBladePreset("low_wind"));
btnPresetKidwind?.addEventListener("click", () => applySelectedBladePreset("med_kidwind"));
btnPresetScimitar?.addEventListener("click", () => applySelectedBladePreset("scimitar_belly"));
btnPresetHighWind?.addEventListener("click", () => applySelectedBladePreset("high_wind"));
btnPresetRef?.addEventListener("click", () => applySelectedBladePreset("schmitz_600"));

selectGenPreset.addEventListener("change", () => {
  const key = selectGenPreset.value as GeneratorPresetKey;
  const spec = GENERATOR_PRESETS[key];
  if (spec && key !== "custom") {
    inputGenKv.value = String(spec.kv_rpm_per_v);
    inputGenRInt.value = String(spec.r_int_ohm);
    inputGenGearRatio.value = String(spec.default_gear_ratio);
    inputGenRLoad.value = String(spec.default_r_load_ohm);
    syncGearQuickButtons(spec.default_gear_ratio);
  }
  updateAeroPanel(workingDesign);
  scheduleAutoSave();
});

[inputGenKv, inputGenRInt, inputGenGearRatio, inputGenRLoad, inputSiteAvgWind].forEach((el) => {
  el.addEventListener("change", () => {
    if (el === inputGenKv || el === inputGenRInt) {
      selectGenPreset.value = "custom";
    }
    if (el === inputGenGearRatio) {
      const g = Math.max(0.25, Math.min(20, parseFloat(inputGenGearRatio.value) || 1.0));
      inputGenGearRatio.value = String(g);
      syncGearQuickButtons(g);
    }
    updateAeroPanel(workingDesign);
    scheduleAutoSave();
  });
});

[
  { btn: btnGear1, g: 1 },
  { btn: btnGear2, g: 2 },
  { btn: btnGear3, g: 3 },
  { btn: btnGear4, g: 4 },
].forEach(({ btn, g }) => {
  btn?.addEventListener("click", () => {
    inputGenGearRatio.value = String(g);
    syncGearQuickButtons(g);
    updateAeroPanel(workingDesign);
    scheduleAutoSave();
  });
});

btnMaxOutDrivetrain?.addEventListener("click", () => {
  if (!latestMaxOutReport) return;
  inputGenGearRatio.value = String(latestMaxOutReport.opt_gear_ratio);
  inputGenRLoad.value = String(latestMaxOutReport.opt_r_load_ohm);
  syncGearQuickButtons(latestMaxOutReport.opt_gear_ratio);
  if (
    latestBundleB &&
    Number.isFinite(latestBundleB.peak_tsr) &&
    Math.abs(workingDesign.rotor.design_tsr - latestBundleB.peak_tsr) > 0.05
  ) {
    commitDesign(
      updateRotorField(workingDesign, "design_tsr", Number(latestBundleB.peak_tsr.toFixed(2))),
    );
  } else {
    updateAeroPanel(workingDesign);
    scheduleAutoSave();
  }
});

btnMatchLoadOnly?.addEventListener("click", () => {
  if (!latestMaxOutReport) return;
  inputGenRLoad.value = String(latestMaxOutReport.best_r_load_at_current_gear_ohm);
  updateAeroPanel(workingDesign);
  scheduleAutoSave();
});

selectStructMaterial.addEventListener("change", () => {
  updateAeroPanel(workingDesign);
  if (selectHeatmapMode.value === "wall_stress") {
    rebuild3D(workingDesign);
  }
  scheduleAutoSave();
});

inputExpData.addEventListener("input", () => {
  updateAeroPanel(workingDesign);
  scheduleAutoSave();
});

// ---- GitHub Gists Cloud Storage & Team Workspace ----
const tabDrawerGist = document.getElementById("tab-drawer-gist") as HTMLButtonElement | null;
const tabDrawerLocal = document.getElementById("tab-drawer-local") as HTMLButtonElement | null;
const drawerGistPanel = document.getElementById("drawer-gist-panel");
const drawerLocalPanel = document.getElementById("drawer-local-panel");

const gistAuthRow = document.getElementById("gist-auth-row");
const gistTokenInput = document.getElementById("gist-token-input") as HTMLInputElement | null;
const btnGistConnect = document.getElementById("btn-gist-connect") as HTMLButtonElement | null;
const gistTokenHelp = document.getElementById("gist-token-help");
const gistUserBar = document.getElementById("gist-user-bar");
const gistUserLogin = document.getElementById("gist-user-login");
const btnGistRefresh = document.getElementById("btn-gist-refresh") as HTMLButtonElement | null;
const btnGistDisconnect = document.getElementById("btn-gist-disconnect") as HTMLButtonElement | null;
const gistSaveContainer = document.getElementById("gist-save-container");
const gistDesignNameInput = document.getElementById("gist-design-name") as HTMLInputElement | null;
const gistIsPublicCheck = document.getElementById("gist-is-public") as HTMLInputElement | null;
const btnSaveGist = document.getElementById("btn-save-gist") as HTMLButtonElement | null;
const gistStatusEl = document.getElementById("gist-status");
const gistDesignsListEl = document.getElementById("gist-designs-list");

// Aero Dock Cloud widgets
const inputCloudDesignName = document.getElementById("cloud-design-name") as HTMLInputElement | null;
const btnCloudSave = document.getElementById("btn-cloud-save") as HTMLButtonElement | null;
const btnCloudOpenDrawer = document.getElementById("btn-cloud-open-drawer") as HTMLButtonElement | null;
const cloudStatusEl = document.getElementById("cloud-status");
const cloudDesignsListEl = document.getElementById("cloud-designs-list");

tabDrawerGist?.addEventListener("click", () => {
  tabDrawerGist.classList.add("active");
  tabDrawerGist.setAttribute("aria-selected", "true");
  tabDrawerLocal?.classList.remove("active");
  tabDrawerLocal?.setAttribute("aria-selected", "false");
  if (drawerGistPanel) drawerGistPanel.style.display = "block";
  if (drawerLocalPanel) drawerLocalPanel.style.display = "none";
});

tabDrawerLocal?.addEventListener("click", () => {
  tabDrawerLocal.classList.add("active");
  tabDrawerLocal.setAttribute("aria-selected", "true");
  tabDrawerGist?.classList.remove("active");
  tabDrawerGist?.setAttribute("aria-selected", "false");
  if (drawerGistPanel) drawerGistPanel.style.display = "none";
  if (drawerLocalPanel) drawerLocalPanel.style.display = "block";
});

btnCloudOpenDrawer?.addEventListener("click", () => {
  toggleProjectsDrawer(true);
  tabDrawerGist?.click();
});

let currentGists: BladeLabGistSummary[] = [];

function renderGistsList(gists: BladeLabGistSummary[]) {
  if (gistDesignsListEl) {
    gistDesignsListEl.innerHTML = "";
    if (gists.length === 0) {
      const empty = document.createElement("div");
      empty.className = "slot-empty";
      empty.textContent = "No BladeLab Gists saved yet in this account.";
      gistDesignsListEl.appendChild(empty);
    } else {
      for (const g of gists) {
        const row = document.createElement("div");
        row.className = "slot-row";

        const info = document.createElement("div");
        info.className = "slot-info";

        const nameEl = document.createElement("div");
        nameEl.className = "slot-name";
        nameEl.style.display = "flex";
        nameEl.style.alignItems = "center";
        nameEl.style.gap = "6px";

        const nameText = document.createElement("span");
        nameText.textContent = g.name;

        const badge = document.createElement("span");
        badge.className = "layer-tag";
        badge.style.fontSize = "10px";
        badge.textContent = g.is_public ? "Public" : "Secret";
        if (g.is_public) {
          badge.style.color = "var(--accent)";
          badge.style.borderColor = "var(--accent)";
        }

        nameEl.append(nameText, badge);

        const sub = document.createElement("div");
        sub.className = "slot-sub";
        const dateStr = new Date(g.updated_at).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        sub.textContent = `${dateStr} · ID: ${g.id.slice(0, 7)}`;

        info.append(nameEl, sub);

        const actions = document.createElement("div");
        actions.className = "slot-actions";

        // Load button
        const loadBtn = document.createElement("button");
        loadBtn.type = "button";
        loadBtn.className = "btn-mini btn-primary";
        loadBtn.textContent = "Load";
        loadBtn.title = `Load Gist "${g.name}" into workbench`;
        loadBtn.addEventListener("click", async () => {
          try {
            loadBtn.textContent = "Loading...";
            loadBtn.disabled = true;
            const res = await fetchBladeLabGist(g.id, getStoredGitHubToken());
            applyWorkbenchSnapshot(res.snapshot, { commitToHistory: true, badgePrefix: "Gist" });
            if (gistDesignNameInput) gistDesignNameInput.value = res.name;
            if (inputCloudDesignName) inputCloudDesignName.value = res.name;
            if (gistStatusEl) gistStatusEl.textContent = `Loaded "${res.name}"`;
            loadBtn.textContent = "Loaded!";
            setTimeout(() => {
              loadBtn.textContent = "Load";
              loadBtn.disabled = false;
            }, 1200);
          } catch (err) {
            alert(`Failed to load Gist: ${String(err)}`);
            loadBtn.textContent = "Load";
            loadBtn.disabled = false;
          }
        });

        // Share button (copies ?gist=<id> URL)
        const shareBtn = document.createElement("button");
        shareBtn.type = "button";
        shareBtn.className = "btn-mini";
        shareBtn.textContent = "Share";
        shareBtn.title = "Copy shareable link for any device";
        shareBtn.addEventListener("click", async () => {
          const shareUrl = buildGistShareUrl(g.id);
          try {
            await navigator.clipboard.writeText(shareUrl);
            shareBtn.textContent = "Copied!";
            shareBtn.style.color = "var(--status-ok)";
            setTimeout(() => {
              shareBtn.textContent = "Share";
              shareBtn.style.color = "";
            }, 1500);
          } catch {
            prompt("Share link:", shareUrl);
          }
        });

        // View on GitHub
        const linkBtn = document.createElement("a");
        linkBtn.href = g.html_url;
        linkBtn.target = "_blank";
        linkBtn.rel = "noopener";
        linkBtn.className = "btn-mini";
        linkBtn.title = "View raw Gist file & Git history on GitHub";
        linkBtn.textContent = "↗";
        linkBtn.style.display = "inline-flex";
        linkBtn.style.alignItems = "center";
        linkBtn.style.textDecoration = "none";

        // Delete button
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn-mini";
        delBtn.textContent = "×";
        delBtn.title = `Delete Gist "${g.name}"`;
        delBtn.style.color = "var(--status-err)";
        delBtn.addEventListener("click", async () => {
          if (!confirm(`Delete Gist "${g.name}" permanently from GitHub?`)) return;
          const token = getStoredGitHubToken();
          if (!token) return;
          try {
            delBtn.textContent = "...";
            delBtn.disabled = true;
            await deleteBladeLabGist(token, g.id);
            currentGists = currentGists.filter((item) => item.id !== g.id);
            renderGistsList(currentGists);
            if (gistStatusEl) gistStatusEl.textContent = `Deleted Gist "${g.name}"`;
          } catch (err) {
            alert(`Failed to delete Gist: ${String(err)}`);
            delBtn.textContent = "×";
            delBtn.disabled = false;
          }
        });

        actions.append(loadBtn, shareBtn, linkBtn, delBtn);
        row.append(info, actions);
        gistDesignsListEl.appendChild(row);
      }
    }
  }

  // Also update right dock cloud list if present
  if (cloudDesignsListEl) {
    cloudDesignsListEl.innerHTML = "";
    if (gists.length === 0) {
      const empty = document.createElement("div");
      empty.className = "slot-empty";
      empty.textContent = "No cloud Gists saved yet.";
      cloudDesignsListEl.appendChild(empty);
    } else {
      for (const g of gists) {
        const itemRow = document.createElement("div");
        itemRow.className = "bind-row";
        itemRow.style.margin = "0";

        const label = document.createElement("span");
        label.style.fontSize = "11px";
        label.textContent = `${g.name} [${g.is_public ? "Public" : "Secret"}]`;

        const btnLoad = document.createElement("button");
        btnLoad.type = "button";
        btnLoad.className = "btn-mini";
        btnLoad.textContent = "Load";
        btnLoad.addEventListener("click", async () => {
          try {
            btnLoad.textContent = "...";
            const res = await fetchBladeLabGist(g.id, getStoredGitHubToken());
            applyWorkbenchSnapshot(res.snapshot, { commitToHistory: true, badgePrefix: "Gist" });
            if (cloudStatusEl) cloudStatusEl.textContent = `Loaded ${res.name}`;
            btnLoad.textContent = "Load";
          } catch (err) {
            alert(`Load failed: ${String(err)}`);
            btnLoad.textContent = "Load";
          }
        });

        const btnShare = document.createElement("button");
        btnShare.type = "button";
        btnShare.className = "btn-mini";
        btnShare.textContent = "Share";
        btnShare.addEventListener("click", async () => {
          const url = buildGistShareUrl(g.id);
          try {
            await navigator.clipboard.writeText(url);
            btnShare.textContent = "Copied!";
            setTimeout(() => { btnShare.textContent = "Share"; }, 1500);
          } catch {
            prompt("Share link:", url);
          }
        });

        itemRow.append(label, btnLoad, btnShare);
        cloudDesignsListEl.appendChild(itemRow);
      }
    }
    if (cloudStatusEl) cloudStatusEl.textContent = `GitHub Gists: ${gists.length} saved`;
  }
}

async function refreshGistsFromGitHub(token: string) {
  if (gistStatusEl) gistStatusEl.textContent = "Fetching gists...";
  try {
    currentGists = await listBladeLabGists(token);
    renderGistsList(currentGists);
    if (gistStatusEl) gistStatusEl.textContent = `${currentGists.length} cloud design(s)`;
  } catch (err) {
    if (gistStatusEl) gistStatusEl.textContent = `Fetch error: ${String(err)}`;
  }
}

async function syncGistAuthState() {
  const token = getStoredGitHubToken();
  if (token) {
    try {
      if (btnGistConnect) {
        btnGistConnect.textContent = "Verifying...";
        btnGistConnect.disabled = true;
      }
      const user = await verifyGitHubUser(token);
      if (gistAuthRow) gistAuthRow.style.display = "none";
      if (gistTokenHelp) gistTokenHelp.style.display = "none";
      if (gistUserBar) gistUserBar.style.display = "flex";
      if (gistUserLogin) gistUserLogin.textContent = `@${user.login}`;
      if (gistSaveContainer) gistSaveContainer.style.display = "block";
      if (gistDesignNameInput && !gistDesignNameInput.value) {
        gistDesignNameInput.value = `Rotor-R${workingDesign.rotor.radius_mm}-B${workingDesign.rotor.blade_count}`;
      }
      if (cloudStatusEl) cloudStatusEl.textContent = `Connected as @${user.login}`;
      await refreshGistsFromGitHub(token);
    } catch (err) {
      console.warn("GitHub token verification failed:", err);
      setStoredGitHubToken(null);
      if (gistAuthRow) gistAuthRow.style.display = "flex";
      if (gistTokenHelp) gistTokenHelp.style.display = "block";
      if (gistUserBar) gistUserBar.style.display = "none";
      if (gistSaveContainer) gistSaveContainer.style.display = "none";
      if (gistDesignsListEl) {
        gistDesignsListEl.innerHTML = `<div class="slot-empty" style="color: var(--status-err)">Invalid token or expired. Please re-enter your GitHub token.</div>`;
      }
      if (cloudStatusEl) cloudStatusEl.textContent = "Not connected to GitHub";
    } finally {
      if (btnGistConnect) {
        btnGistConnect.textContent = "Connect";
        btnGistConnect.disabled = false;
      }
    }
  } else {
    if (gistAuthRow) gistAuthRow.style.display = "flex";
    if (gistTokenHelp) gistTokenHelp.style.display = "block";
    if (gistUserBar) gistUserBar.style.display = "none";
    if (gistSaveContainer) gistSaveContainer.style.display = "none";
    if (gistDesignsListEl) {
      gistDesignsListEl.innerHTML = `<div class="slot-empty">Connect your GitHub token to view and save cloud designs</div>`;
    }
    if (cloudStatusEl) cloudStatusEl.textContent = "Not connected to GitHub";
  }
}

btnGistConnect?.addEventListener("click", async () => {
  const tokenVal = gistTokenInput?.value.trim() || "";
  if (!tokenVal) {
    alert("Please enter a GitHub personal access token with 'gist' scope.");
    return;
  }
  setStoredGitHubToken(tokenVal);
  if (gistTokenInput) gistTokenInput.value = "";
  await syncGistAuthState();
});

gistTokenInput?.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    btnGistConnect?.click();
  }
});

btnGistRefresh?.addEventListener("click", () => {
  const token = getStoredGitHubToken();
  if (token) void refreshGistsFromGitHub(token);
});

btnGistDisconnect?.addEventListener("click", () => {
  if (confirm("Disconnect GitHub account and remove token from this browser?")) {
    setStoredGitHubToken(null);
    void syncGistAuthState();
  }
});

async function handleSaveCurrentToGist() {
  const token = getStoredGitHubToken();
  if (!token) {
    toggleProjectsDrawer(true);
    tabDrawerGist?.click();
    gistTokenInput?.focus();
    return;
  }

  const nameVal =
    gistDesignNameInput?.value.trim() ||
    inputCloudDesignName?.value.trim() ||
    `Rotor-R${workingDesign.rotor.radius_mm}-B${workingDesign.rotor.blade_count}`;

  const isPublic = gistIsPublicCheck?.checked || false;

  try {
    if (btnSaveGist) {
      btnSaveGist.textContent = "Saving...";
      btnSaveGist.disabled = true;
    }
    if (btnCloudSave) {
      btnCloudSave.textContent = "Saving...";
      btnCloudSave.disabled = true;
    }
    if (gistStatusEl) gistStatusEl.textContent = "Saving to GitHub Gist...";

    const snap = buildCurrentWorkbenchSnapshot(nameVal);
    const created = await saveBladeLabGist(token, nameVal, snap, isPublic);

    if (gistStatusEl) gistStatusEl.textContent = `Saved: ${created.id.slice(0, 7)}`;
    if (exportStatus) exportStatus.textContent = `Saved to Gist "${nameVal}"`;
    flushAutoSaveNow("Saved to Gist");

    await refreshGistsFromGitHub(token);

    if (btnSaveGist) {
      btnSaveGist.textContent = "Saved!";
      setTimeout(() => {
        btnSaveGist.textContent = "Save to Gist";
        btnSaveGist.disabled = false;
      }, 1500);
    }
    if (btnCloudSave) {
      btnCloudSave.textContent = "Saved!";
      setTimeout(() => {
        btnCloudSave.textContent = "Save to Gist";
        btnCloudSave.disabled = false;
      }, 1500);
    }
  } catch (err) {
    alert(`Failed to save Gist: ${String(err)}`);
    if (btnSaveGist) {
      btnSaveGist.textContent = "Save to Gist";
      btnSaveGist.disabled = false;
    }
    if (btnCloudSave) {
      btnCloudSave.textContent = "Save to Gist";
      btnCloudSave.disabled = false;
    }
    if (gistStatusEl) gistStatusEl.textContent = "Save error";
  }
}

btnSaveGist?.addEventListener("click", handleSaveCurrentToGist);
btnCloudSave?.addEventListener("click", handleSaveCurrentToGist);

// Initialize Gists Auth state
void syncGistAuthState();

// ---- Undo / Redo / Reset ----
function performUndo() {
  const prev = history.undo();
  if (prev) {
    workingDesign = prev;
    syncControlsFromDesign(workingDesign);
    rebuild3D(workingDesign);
    scheduleAutoSave("Auto-saved");
  }
}

function performRedo() {
  const next = history.redo();
  if (next) {
    workingDesign = next;
    syncControlsFromDesign(workingDesign);
    rebuild3D(workingDesign);
    scheduleAutoSave("Auto-saved");
  }
}

btnUndo.addEventListener("click", performUndo);
btnRedo.addEventListener("click", performRedo);
btnReset.addEventListener("click", () => {
  slotNameInput.value = "";
  const factorySnapshot = createWorkbenchSnapshot(
    initialDesign,
    defaultFabricationSnapshot(),
    defaultWorkbenchUiSnapshot(),
  );
  applyWorkbenchSnapshot(factorySnapshot, { commitToHistory: true, badgePrefix: "Reset" });
  exportStatus.textContent = "Reset to factory default";
});

// ---- Responsive Workspace Switcher, Dock Toggles & Section Navigation ----
const topDockEl = document.getElementById("top-dock");
const panelEl = document.getElementById("panel");
const aeroDockEl = document.getElementById("aero-dock");
const btnToggleLeft = document.getElementById("btn-toggle-left") as HTMLButtonElement | null;
const btnToggleRight = document.getElementById("btn-toggle-right") as HTMLButtonElement | null;
const btnZen3d = document.getElementById("btn-zen-3d") as HTMLButtonElement | null;
const panelScrollContainer = document.getElementById("panel-scroll-container");
const aeroScrollContainer = document.getElementById("aero-scroll-container");
const mobileNavButtons = document.querySelectorAll<HTMLButtonElement>(
  "#mobile-workspace-nav button[data-mobile-target]",
);

// Interactive SVG Chart Crosshair & Hover Readout (#cp-tsr-svg & #wind-power-svg)
cpTsrSvg.addEventListener("pointermove", (ev) => {
  if (!latestBundleB) return;
  const rect = cpTsrSvg.getBoundingClientRect();
  if (rect.width <= 0) return;
  const svgX = ((ev.clientX - rect.left) / rect.width) * 320;
  const info = inspectCpTsrAtSvgX(
    svgX,
    latestBundleB.sweep,
    baselineBundleA ? baselineBundleA.sweep : null,
    workingDesign.rotor.radius_mm,
    workingDesign.rotor.wind_speed_mps,
  );
  const g = cpTsrSvg.querySelector<SVGGElement>(".chart-crosshair");
  if (g) {
    g.style.display = "block";
    const line = g.querySelector<SVGLineElement>(".ch-line");
    const dotB = g.querySelector<SVGCircleElement>(".ch-dot-primary");
    const dotA = g.querySelector<SVGCircleElement>(".ch-dot-secondary");
    if (line) {
      line.setAttribute("x1", info.svg_x.toFixed(1));
      line.setAttribute("x2", info.svg_x.toFixed(1));
    }
    if (dotB) {
      dotB.setAttribute("cx", info.svg_x.toFixed(1));
      dotB.setAttribute("cy", info.svg_y_b.toFixed(1));
    }
    if (dotA) {
      if (info.svg_y_a !== null) {
        dotA.style.display = "block";
        dotA.setAttribute("cx", info.svg_x.toFixed(1));
        dotA.setAttribute("cy", info.svg_y_a.toFixed(1));
      } else {
        dotA.style.display = "none";
      }
    }
  }
  if (cpTsrHoverReadout) {
    cpTsrHoverReadout.classList.add("active");
    cpTsrHoverReadout.textContent = info.readout;
  }
});

cpTsrSvg.addEventListener("pointerleave", () => {
  const g = cpTsrSvg.querySelector<SVGGElement>(".chart-crosshair");
  if (g) g.style.display = "none";
  if (cpTsrHoverReadout) {
    cpTsrHoverReadout.classList.remove("active");
    cpTsrHoverReadout.textContent = "Hover curve to inspect λ, Cp & RPM";
  }
});

windPowerSvg.addEventListener("pointermove", (ev) => {
  if (!latestAepReport) return;
  const rect = windPowerSvg.getBoundingClientRect();
  if (rect.width <= 0) return;
  const svgX = ((ev.clientX - rect.left) / rect.width) * 320;
  const info = inspectWindPowerAtSvgX(svgX, latestAepReport);
  const g = windPowerSvg.querySelector<SVGGElement>(".chart-crosshair");
  if (g) {
    g.style.display = "block";
    const line = g.querySelector<SVGLineElement>(".ch-line");
    const dotMech = g.querySelector<SVGCircleElement>(".ch-dot-primary");
    const dotElec = g.querySelector<SVGCircleElement>(".ch-dot-secondary");
    if (line) {
      line.setAttribute("x1", info.svg_x.toFixed(1));
      line.setAttribute("x2", info.svg_x.toFixed(1));
    }
    if (dotMech) {
      dotMech.setAttribute("cx", info.svg_x.toFixed(1));
      dotMech.setAttribute("cy", info.svg_y_mech.toFixed(1));
    }
    if (dotElec) {
      dotElec.setAttribute("cx", info.svg_x.toFixed(1));
      dotElec.setAttribute("cy", info.svg_y_elec.toFixed(1));
    }
  }
  if (windPowerHoverReadout) {
    windPowerHoverReadout.classList.add("active");
    windPowerHoverReadout.textContent = info.readout;
  }
});

windPowerSvg.addEventListener("pointerleave", () => {
  const g = windPowerSvg.querySelector<SVGGElement>(".chart-crosshair");
  if (g) g.style.display = "none";
  if (windPowerHoverReadout) {
    windPowerHoverReadout.classList.remove("active");
    windPowerHoverReadout.textContent = "Hover curve to inspect V, Watts & RPM";
  }
});

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

  if (studioMode === "gearbox") {
    if (panelEl) {
      panelEl.inert = true;
      panelEl.setAttribute("aria-hidden", "true");
    }
    if (aeroDockEl) {
      aeroDockEl.inert = true;
      aeroDockEl.setAttribute("aria-hidden", "true");
    }
    if (gearboxInspector) {
      const open = gearboxInspector.classList.contains("open");
      (gearboxInspector as any).inert = !open;
      gearboxInspector.setAttribute("aria-hidden", String(!open));
    }
    return;
  }

  if (panelEl) {
    panelEl.inert = leftHidden;
    panelEl.setAttribute("aria-hidden", String(leftHidden));
  }
  if (aeroDockEl) {
    aeroDockEl.inert = rightHidden;
    aeroDockEl.setAttribute("aria-hidden", String(rightHidden));
  }
  if (gearboxInspector) {
    (gearboxInspector as any).inert = true;
    gearboxInspector.setAttribute("aria-hidden", "true");
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

// Quick Section Jump Pills & Scroll-Spy inside Left CAD Dock and Right Telemetry Dock
function bindDockSectionNav(
  navSelector: string,
  scrollContainerEl: HTMLElement | null,
  sectionIds: readonly string[],
) {
  const navButtons = document.querySelectorAll<HTMLButtonElement>(
    `${navSelector} button[data-scroll-target]`,
  );
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.scrollTarget;
      if (!targetId) return;
      const sectionEl = document.getElementById(targetId);
      if (!sectionEl) return;
      sectionEl.classList.remove("collapsed");
      const toggleBtn = sectionEl.querySelector<HTMLButtonElement>("[data-collapse-section]");
      toggleBtn?.setAttribute("aria-expanded", "true");
      sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
      navButtons.forEach((b) => {
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

  scrollContainerEl?.addEventListener("scroll", () => {
    const containerTop = scrollContainerEl.getBoundingClientRect().top;
    let activeId = sectionIds[0] ?? "";
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const offset = el.getBoundingClientRect().top - containerTop;
      if (offset <= 88) {
        activeId = id;
      }
    }
    navButtons.forEach((btn) => {
      const isAct = btn.dataset.scrollTarget === activeId;
      btn.classList.toggle("active", isAct);
      if (isAct) {
        btn.setAttribute("aria-current", "true");
      } else {
        btn.removeAttribute("aria-current");
      }
    });
  });
}

bindDockSectionNav("#panel-section-nav", panelScrollContainer, [
  "layer1-rotor",
  "layer1-distributions",
  "layer2-planform",
  "layer2-sections",
  "layer-fabrication",
  "layer3-stations",
]);

bindDockSectionNav("#aero-section-nav", aeroScrollContainer, [
  "layer-aero",
  "layer-aero-aep",
  "layer-aero-struct",
  "layer-aero-cloud",
]);

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
    if (rotorGroup.userData.isGearboxGroup) {
      gearSpinAngleRad += visualRadPerSec * 0.65 * dt;
      rotorGroup.children.forEach((child) => {
        if (child.userData.isGearPivot) {
          const ratio = Number(child.userData.spinRatio ?? 1);
          const phase = Number(child.userData.meshPhaseRad ?? 0);
          child.rotation.y = gearSpinAngleRad * ratio + phase;
        }
      });
    } else {
      rotorGroup.rotation.y += visualRadPerSec * dt;
    }
  }

  controls.update();
  renderer.render(scene, camera);
});

// ---- 3D Gear Raycaster & Interactive Click/Hover Selection ----
const gearRaycaster = new THREE.Raycaster();
const gearMouse = new THREE.Vector2();
let gearPointerDownPos = { x: 0, y: 0 };

renderer.domElement.addEventListener("pointerdown", (ev) => {
  gearPointerDownPos = { x: ev.clientX, y: ev.clientY };
});

renderer.domElement.addEventListener("pointermove", (ev) => {
  if (viewMode !== "gearbox" || !rotorGroup || !rotorGroup.userData.isGearboxGroup) {
    renderer.domElement.style.cursor = "default";
    return;
  }
  const rect = renderer.domElement.getBoundingClientRect();
  gearMouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  gearMouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  gearRaycaster.setFromCamera(gearMouse, camera);

  const intersects = gearRaycaster.intersectObjects(rotorGroup.children, true);
  let foundGearIndex: (1 | 2 | 3) | null = null;
  for (const hit of intersects) {
    if (hit.object instanceof THREE.Mesh && hit.object.userData.gearIndex) {
      foundGearIndex = hit.object.userData.gearIndex as (1 | 2 | 3);
      break;
    }
  }

  if (foundGearIndex !== null) {
    renderer.domElement.style.cursor = "pointer";
    if (hoveredGearIndex !== foundGearIndex) {
      hoveredGearIndex = foundGearIndex;
      updateGearboxHud(foundGearIndex);
    }
  } else {
    renderer.domElement.style.cursor = "default";
    if (hoveredGearIndex !== null) {
      hoveredGearIndex = null;
      updateGearboxHud(selectedGearIndex);
    }
  }
});

renderer.domElement.addEventListener("pointerup", (ev) => {
  if (Math.hypot(ev.clientX - gearPointerDownPos.x, gearPointerDownPos.y - ev.clientY) > 6) {
    return; // Orbit drag
  }
  if (viewMode !== "gearbox" || !rotorGroup || !rotorGroup.userData.isGearboxGroup) {
    return;
  }
  const rect = renderer.domElement.getBoundingClientRect();
  gearMouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  gearMouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  gearRaycaster.setFromCamera(gearMouse, camera);

  const intersects = gearRaycaster.intersectObjects(rotorGroup.children, true);
  let foundGearIndex: (1 | 2 | 3) | null = null;
  for (const hit of intersects) {
    if (hit.object instanceof THREE.Mesh && hit.object.userData.gearIndex) {
      foundGearIndex = hit.object.userData.gearIndex as (1 | 2 | 3);
      break;
    }
  }

  if (foundGearIndex !== null) {
    selectGear(foundGearIndex, true);
  } else {
    // Clicked empty background
    selectGear(null, false);
  }
});

addEventListener("keydown", (event) => {
  if (event.key === "Escape" && studioMode === "gearbox" && gearboxInspector?.classList.contains("open")) {
    gearboxInspector.classList.remove("open");
    btnToggleGearboxInspector?.classList.remove("active");
    btnToggleGearboxInspector?.setAttribute("aria-pressed", "false");
    syncDockAccessibilityState();
  }
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  syncTopDockOffset();
  syncDockAccessibilityState();
});

addEventListener("beforeunload", () => {
  flushAutoSaveNow("Auto-saved");
});

// ---- Startup Restore (Auto-Save, Saved Slots & ?gist= URL param) ----
savedSlots = loadSavedSlotsFromStorage();
renderSavedSlotsList();

let restoredOnStartup = false;

// 1. Check if a ?gist=<gist_id> URL parameter was passed for instant cross-device opening
const urlParams = new URLSearchParams(window.location.search);
const gistParam = urlParams.get("gist");
if (gistParam) {
  try {
    const gistData = await fetchBladeLabGist(gistParam, getStoredGitHubToken());
    applyWorkbenchSnapshot(gistData.snapshot, {
      commitToHistory: true,
      badgePrefix: "Gist",
    });
    autosaveBadge.textContent = `Gist: ${gistData.name}`;
    autosaveBadge.title = `Loaded from GitHub Gist ${gistParam}`;
    if (gistDesignNameInput) gistDesignNameInput.value = gistData.name;
    if (inputCloudDesignName) inputCloudDesignName.value = gistData.name;
    restoredOnStartup = true;
    console.log(`Loaded design from GitHub Gist ${gistParam} (${gistData.name})`);
  } catch (err) {
    console.error("Failed to load Gist from URL param:", err);
    errorBanner.textContent = `Could not load design from Gist URL: ${String(err)}`;
    errorBanner.style.display = "block";
  }
}

// 2. If no Gist URL param, restore from local auto-save
if (!restoredOnStartup) {
  try {
    const rawAutoSave = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (rawAutoSave) {
      const restoredSnapshot = parseLoadedProjectJson(rawAutoSave);
      const isDifferentFromInitial =
        JSON.stringify(restoredSnapshot.design) !== JSON.stringify(initialDesign);
      applyWorkbenchSnapshot(restoredSnapshot, {
        commitToHistory: isDifferentFromInitial,
        badgePrefix: "Restored",
      });
      restoredOnStartup = true;
    }
  } catch {
    // Ignore corrupted storage and start from initialDesign
  }
}

if (!restoredOnStartup) {
  syncControlsFromDesign(workingDesign);
  rebuild3D(workingDesign);
  flushAutoSaveNow("Auto-saved");
}
