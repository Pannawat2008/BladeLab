// Real-time blade preview: the Rust core (blade-wasm) does all of the
// resolve / loft / tessellate work and hands Three.js indexed triangles.

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import wasmUrl from "../pkg/blade_wasm_bg.wasm?url";
import init, { build_mesh } from "../pkg/blade_wasm.js";
import designJson from "./designs/naca4412-linear.json?raw";
import type { Design } from "./types/blade-model";

// ---- wasm bootstrap (fetches the compiled core, then exposes build_mesh) ----
await init(wasmUrl);
const baseDesign: Design = JSON.parse(designJson);
const baseDesignJson = JSON.stringify(baseDesign);

// ---- scene ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161a);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 5000);
camera.position.set(240, 200, 520);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.getElementById("app")!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(30, 0, 330);
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x22242a, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(150, 250, 300);
scene.add(key);

const grid = new THREE.GridHelper(1200, 24, 0x3a3f47, 0x262a30);
grid.position.y = -60;
scene.add(grid);

// ---- geometry from the Rust core ----
let mesh: THREE.Mesh | null = null;

function rebuild() {
  const overrides = {
    tip_twist_deg: twistSlider.valueAsNumber,
    tip_chord_mm: chordSlider.valueAsNumber,
  };

  const start = performance.now();
  const data = build_mesh(baseDesignJson, JSON.stringify(overrides));
  const elapsed = performance.now() - start;

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
      metalness: 0.1,
      roughness: 0.55,
      side: THREE.DoubleSide,
    }),
  );
  scene.add(mesh);

  updateStats(elapsed, data);
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

// ---- controls ----
const twistSlider = document.getElementById("twist") as HTMLInputElement;
const chordSlider = document.getElementById("chord") as HTMLInputElement;
const twistVal = document.getElementById("twist-val")!;
const chordVal = document.getElementById("chord-val")!;

function onInput() {
  twistVal.textContent = `${twistSlider.valueAsNumber}°`;
  chordVal.textContent = `${chordSlider.valueAsNumber} mm`;
  rebuild();
}
twistSlider.addEventListener("input", onInput);
chordSlider.addEventListener("input", onInput);

// ---- loop ----
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

rebuild();
