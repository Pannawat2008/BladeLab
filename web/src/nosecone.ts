// Parametric Aerodynamic Nose Cone & Kidwind4-LockRev4 Hub Fit Builder (T-105)
// Powered by Manifold-3D C++ CSG WASM kernel for guaranteed single-solid watertight printable STL meshes.
// Carves exact cutouts by slicing the live 3D blade-wasm geometry, with 45-deg self-supporting
// blind M3 bosses, chamfered 3-lobe trefoil pocket, and self-supporting conical lightening dome.

import Module, {
  type CrossSection,
  type Manifold,
  type ManifoldToplevel,
  type Mesh as ManifoldMesh,
  type Polygons,
  type Vec2,
} from "manifold-3d";

export type NoseConeAeroProfile = "adaptive" | "vonkarman" | "elliptical" | "bell";
export type NoseConeWrapStyle = "saddle" | "closed" | "cuff" | "flush";
export type NoseConeFairingStyle = "none" | "delta" | "boot" | "fillet";
export type NoseConeHubFitMode = "kidwind4_lockrev4" | "match_design";
export type NoseConeViewMode = "mounted" | "cone_only" | "rear_fit";

export interface NoseConeConfig {
  enabled: boolean;
  hub_fit_mode: NoseConeHubFitMode;
  aero_profile: NoseConeAeroProfile;
  wrap_style: NoseConeWrapStyle;
  fairing_style: NoseConeFairingStyle;
  fairing_span_mm: number;
  fairing_blend_pct: number;
  view_mode: NoseConeViewMode;
  cone_length_mm: number;
  skirt_length_mm: number;
  wall_thickness_mm: number;
  blade_clearance_mm: number;
  trefoil_clearance_mm: number;
  assembly_slide_pct: number;
  cutaway_mode: boolean;
  // Measured constants for Kidwind4-LockRev4.step (in mm)
  hub_diameter_mm: number;
  bolt_circle_mm: number;
  trefoil_center_r_mm: number;
  trefoil_lobe_r_mm: number;
  trefoil_depth_mm: number;
}

export interface NoseBladeMeshInput {
  positions: Float32Array;
  indices: Uint32Array;
  pivot_shift_mm: number;
  rot_z_rad: number;
  hub_front_y_mm: number;
  radial_shift_mm: number;
  spar_radius_mm?: number;
}

export interface NoseConeBladeContext {
  blade_count: number;
  hub_diameter_mm: number;
  hub_length_mm: number;
  hub_bore_mm: number;
  root_chord_mm: number;
  root_twist_deg: number;
  collective_pitch_deg: number;
  blade_mesh?: NoseBladeMeshInput;
}

export interface NoseConeSubMesh {
  id: string;
  color_hex: number;
  positions: Float32Array;
  indices: Uint32Array;
}

export interface NoseConeMetrics {
  hub_diameter_mm: number;
  skirt_length_mm: number;
  bolt_circle_mm: number;
  nose_cd: number;
  root_flow_boost_pct: number;
  est_mass_g: number;
  volume_cm3: number;
  total_triangles: number;
  is_watertight: boolean;
  is_single_solid: boolean;
  print_status: string;
  hardware_label: string;
  fit_note: string;
}

export interface NoseConeMeshBundle {
  submeshes: NoseConeSubMesh[];
  cuff_submeshes: NoseConeSubMesh[];
  ghost_hub_submeshes: NoseConeSubMesh[];
  metrics: NoseConeMetrics;
}

let manifoldModPromise: Promise<ManifoldToplevel> | null = null;
let manifoldModInstance: ManifoldToplevel | null = null;

/**
 * Initializes the Manifold-3D WASM kernel (idempotent across Browser & Node tests).
 * Pass `wasmUrl` (e.g. `?url` asset in Vite) when bundling for browser deployment.
 */
export async function initNoseConeKernel(wasmUrl?: string): Promise<void> {
  if (manifoldModInstance) return;
  if (!manifoldModPromise) {
    manifoldModPromise = (async () => {
      const m = await Module(wasmUrl ? { locateFile: () => wasmUrl } : undefined);
      m.setup();
      manifoldModInstance = m;
      return m;
    })();
  }
  await manifoldModPromise;
}

export function isNoseConeKernelReady(): boolean {
  return manifoldModInstance !== null;
}

function requireManifoldKernel(): ManifoldToplevel {
  if (!manifoldModInstance) {
    throw new Error("Nose Cone Manifold-3D kernel not initialized; call await initNoseConeKernel() first.");
  }
  return manifoldModInstance;
}

export function defaultNoseConeConfig(): NoseConeConfig {
  return {
    enabled: true,
    hub_fit_mode: "kidwind4_lockrev4",
    aero_profile: "adaptive",
    wrap_style: "saddle",
    fairing_style: "delta",
    fairing_span_mm: 26,
    fairing_blend_pct: 35,
    view_mode: "mounted",
    cone_length_mm: 68,
    skirt_length_mm: 20,
    wall_thickness_mm: 2.2,
    blade_clearance_mm: 0.5,
    trefoil_clearance_mm: 0.25,
    assembly_slide_pct: 0,
    cutaway_mode: false,
    hub_diameter_mm: 60.0,
    bolt_circle_mm: 40.0,
    trefoil_center_r_mm: 15.0,
    trefoil_lobe_r_mm: 7.5,
    trefoil_depth_mm: 2.0,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function shortestAngleDiff(a: number, b: number): number {
  let d = ((a - b) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  if (d > Math.PI) d -= Math.PI * 2;
  return d;
}

/**
 * Evaluates nose cone outer radius `r(t)` at axial fraction `t ∈ [0 (apex), 1 (hub base)]`.
 * Supports all 4 profiles including azimuth-modulated blade-root ramps in `"adaptive"` mode.
 */
export function evalNoseProfileRadius(
  profile: NoseConeAeroProfile,
  t: number,
  baseR: number,
  minDeltaTheta = Math.PI,
  rootChordMm = 64,
  effPitchDeg = 18,
): number {
  const c = clamp(t, 0, 1);
  let r = baseR;

  if (profile === "elliptical") {
    r = baseR * Math.sqrt(Math.max(0, 1 - (1 - c) * (1 - c)));
  } else if (profile === "vonkarman") {
    const theta = Math.acos(clamp(1 - 2 * c, -1, 1));
    r = baseR * Math.sqrt(Math.max(0, (theta - 0.5 * Math.sin(2 * theta)) / Math.PI));
  } else if (profile === "bell") {
    const u = Math.pow(c, 1.32);
    const concaveBoost = 0.17 * Math.sin(Math.PI * c) * (1 - c);
    const norm = u * (3 - 2 * u) + concaveBoost * 1.4;
    r = baseR * clamp(norm, 0, 1.05);
  } else {
    // Blade-Adaptive: Von Kármán nose core + sculpted root ramp aligned with blade stations
    const theta = Math.acos(clamp(1 - 2 * c, -1, 1));
    const vk = Math.sqrt(Math.max(0, (theta - 0.5 * Math.sin(2 * theta)) / Math.PI));
    const rampMask = Math.exp(-(minDeltaTheta * minDeltaTheta) / (0.36 * 0.36));
    const pitchBoost = clamp((effPitchDeg - 6) / 28, 0, 1.2);
    const chordBoost = clamp((rootChordMm - 30) / 65, 0, 1.2);
    const adaptiveAdd =
      Math.pow(c, 2.2) * (0.75 + 2.5 * rampMask * (0.55 + 0.3 * chordBoost + 0.25 * pitchBoost));
    r = baseR * vk + adaptiveAdd;
  }

  return Math.max(0, r);
}

/**
 * Exact polar ray radius to the union of circles forming Kidwind4-LockRev4's 3-lobe trefoil boss.
 */
export function evalTrefoilRadius(
  theta: number,
  centerR: number,
  lobeR: number,
  boltCircleR: number,
  lobeCount: number,
  clearanceMm = 0,
): number {
  const ux = Math.cos(theta);
  const uy = Math.sin(theta);
  let best = centerR;
  const count = Math.max(2, Math.round(lobeCount));

  for (let k = 0; k < count; k++) {
    const ang = ((k + 0.5) * 2 * Math.PI) / count;
    const cx = boltCircleR * Math.cos(ang);
    const cy = boltCircleR * Math.sin(ang);
    const dot = cx * ux + cy * uy;
    const distSq = cx * cx + cy * cy;
    const disc = dot * dot - (distSq - lobeR * lobeR);
    if (disc > 0) {
      const s = dot + Math.sqrt(disc);
      if (s > best) best = s;
    }
  }
  return best + clearanceMm;
}

function polygonSignedArea2D(poly: readonly Vec2[]): number {
  let area2 = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i]!;
    const [x1, y1] = poly[(i + 1) % poly.length]!;
    area2 += x0 * y1 - x1 * y0;
  }
  return 0.5 * area2;
}

function ensureCCW2D(poly: Vec2[]): Vec2[] {
  return polygonSignedArea2D(poly) >= 0 ? poly : [...poly].reverse();
}

/**
 * Slices a 3D blade mesh by radial plane `nx = sliceX` and returns closed 2D `(ny, nz)` outer contours.
 */
function sliceBladeMeshAtRadialPlane(
  blade: NoseBladeMeshInput,
  sliceX: number,
): Vec2[][] {
  const pos = blade.positions;
  const idx = blade.indices;
  const cosR = Math.cos(blade.rot_z_rad);
  const sinR = Math.sin(blade.rot_z_rad);
  const nVerts = (pos.length / 3) | 0;

  // Transform all blade vertices once into nose cone local (nx, ny, nz)
  const nxArr = new Float64Array(nVerts);
  const nyArr = new Float64Array(nVerts);
  const nzArr = new Float64Array(nVerts);
  for (let v = 0; v < nVerts; v++) {
    const vx = pos[3 * v]! + blade.pivot_shift_mm;
    const vy = pos[3 * v + 1]!;
    const vz = pos[3 * v + 2]!;
    const bx = vx * cosR - vy * sinR;
    const by = vx * sinR + vy * cosR;
    nxArr[v] = vz + blade.radial_shift_mm;
    nyArr[v] = bx;
    nzArr[v] = by - blade.hub_front_y_mm;
  }

  interface EdgeSeg {
    aKey: string;
    bKey: string;
    ax: number;
    ay: number;
    bx: number;
    by: number;
    used: boolean;
  }

  const quantKey = (x: number, y: number) => `${Math.round(x * 1e4)}_${Math.round(y * 1e4)}`;
  const segs: EdgeSeg[] = [];
  const adj = new Map<string, number[]>();
  const nTris = (idx.length / 3) | 0;

  for (let t = 0; t < nTris; t++) {
    const i0 = idx[3 * t]!;
    const i1 = idx[3 * t + 1]!;
    const i2 = idx[3 * t + 2]!;
    const vs = [i0, i1, i2];
    // Perturb exact hits slightly so every crossing triangle produces exactly 2 edge intersections
    const ds = vs.map((vi) => {
      const d = nxArr[vi]! - sliceX;
      return d === 0 ? 1e-5 : d;
    });
    const hits: [number, number][] = [];
    for (let e = 0; e < 3; e++) {
      const a = vs[e]!;
      const b = vs[(e + 1) % 3]!;
      const da = ds[e]!;
      const db = ds[(e + 1) % 3]!;
      if ((da > 0 && db < 0) || (da < 0 && db > 0)) {
        const alpha = da / (da - db);
        const hy = nyArr[a]! + alpha * (nyArr[b]! - nyArr[a]!);
        const hz = nzArr[a]! + alpha * (nzArr[b]! - nzArr[a]!);
        hits.push([hy, hz]);
      }
    }
    if (hits.length === 2) {
      const [ax, ay] = hits[0]!;
      const [bx, by] = hits[1]!;
      if (Math.hypot(bx - ax, by - ay) < 1e-5) continue;
      const aKey = quantKey(ax, ay);
      const bKey = quantKey(bx, by);
      if (aKey === bKey) continue;
      const segIdx = segs.length;
      segs.push({ aKey, bKey, ax, ay, bx, by, used: false });
      const listA = adj.get(aKey) ?? [];
      listA.push(segIdx);
      adj.set(aKey, listA);
      const listB = adj.get(bKey) ?? [];
      listB.push(segIdx);
      adj.set(bKey, listB);
    }
  }

  const loops: { poly: Vec2[]; absArea: number }[] = [];
  for (let s = 0; s < segs.length; s++) {
    if (segs[s]!.used) continue;
    const seg = segs[s]!;
    seg.used = true;
    const pts: Vec2[] = [
      [seg.ax, seg.ay],
      [seg.bx, seg.by],
    ];
    let currKey = seg.bKey;
    const startKey = seg.aKey;
    let guard = 0;
    while (currKey !== startKey && guard++ < segs.length + 4) {
      const candidates = adj.get(currKey) ?? [];
      let nextIdx = -1;
      for (const c of candidates) {
        if (!segs[c]!.used) {
          nextIdx = c;
          break;
        }
      }
      if (nextIdx < 0) break;
      const nextSeg = segs[nextIdx]!;
      nextSeg.used = true;
      if (nextSeg.aKey === currKey) {
        currKey = nextSeg.bKey;
        pts.push([nextSeg.bx, nextSeg.by]);
      } else {
        currKey = nextSeg.aKey;
        pts.push([nextSeg.ax, nextSeg.ay]);
      }
    }
    if (currKey === startKey && pts.length >= 4) {
      pts.pop(); // remove duplicate closing endpoint
      const absArea = Math.abs(polygonSignedArea2D(pts));
      if (absArea > 1.5) {
        loops.push({ poly: ensureCCW2D(pts), absArea });
      }
    }
  }

  if (loops.length === 0) return [];
  // Keep largest outer skin loop (ignores internal spar holes inside the blade root)
  loops.sort((a, b) => b.absArea - a.absArea);
  return [loops[0]!.poly];
}

/**
 * Fallback analytical NACA 4412 airfoil 2D polygon in `(ny, nz)` frame when no 3D blade mesh is supplied.
 */
function fallbackNacaAirfoil2D(bladeCtx: NoseConeBladeContext, zBlade: number): Vec2[] {
  const chord = clamp(bladeCtx.root_chord_mm, 14, 120);
  const pitchRad = (clamp(bladeCtx.root_twist_deg + bladeCtx.collective_pitch_deg, -45, 55) * Math.PI) / 180;
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);
  const m = 0.04;
  const p = 0.4;
  const t = 0.14;
  const samples = 28;
  const upper: Vec2[] = [];
  const lower: Vec2[] = [];

  for (let i = 0; i <= samples; i++) {
    const xc = 0.5 * (1 - Math.cos((Math.PI * i) / samples));
    const yt =
      5 *
      t *
      (0.2969 * Math.sqrt(Math.max(1e-6, xc)) -
        0.126 * xc -
        0.3516 * xc * xc +
        0.2843 * xc * xc * xc -
        0.1015 * xc * xc * xc * xc);
    const yc =
      xc < p
        ? (m / (p * p)) * (2 * p * xc - xc * xc)
        : (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * xc - xc * xc);
    const lx = -(xc - 0.25) * chord;
    const yu = yc + yt;
    const yl = yc - yt;
    upper.push([lx * cosP - yu * chord * sinP, zBlade + lx * sinP + yu * chord * cosP]);
    lower.push([lx * cosP - yl * chord * sinP, zBlade + lx * sinP + yl * chord * cosP]);
  }
  const poly = upper.concat(lower.slice(1, -1).reverse());
  return ensureCCW2D(poly);
}

/**
 * Extracts a smooth offset 2D CrossSection of the actual blade root in nose-local `(ny, nz)` coords.
 */
function buildBladeCutCrossSection(
  mk: ManifoldToplevel,
  bladeCtx: NoseConeBladeContext,
  baseR: number,
  wall: number,
  effHubLen: number,
  clearanceMm: number,
  track: { delete(): void }[],
): { cut2D: CrossSection; rawPolys: Vec2[][] } {
  const zBlade = -effHubLen * 0.5;
  let slicedPolys: Vec2[][] = [];

  if (bladeCtx.blade_mesh && bladeCtx.blade_mesh.positions.length >= 9) {
    const bm = bladeCtx.blade_mesh;
    // Measure blade radial bounds once
    let minNx = Infinity;
    let maxNx = -Infinity;
    const nVerts = (bm.positions.length / 3) | 0;
    for (let v = 0; v < nVerts; v++) {
      const nx = bm.positions[3 * v + 2]! + bm.radial_shift_mm;
      if (nx < minNx) minNx = nx;
      if (nx > maxNx) maxNx = nx;
    }

    const rLow = clamp(baseR + 0.15, minNx + 0.4, maxNx - 0.5);
    const rMid = clamp(baseR + wall * 0.85, minNx + 0.4, maxNx - 0.5);
    const rHigh = clamp(baseR + wall + 3.0, minNx + 0.4, maxNx - 0.5);
    const sliceSet: number[] = [];
    for (const rS of [rLow, rMid, rHigh]) {
      if (Number.isFinite(rS) && rS > minNx + 0.2 && rS < maxNx - 0.2) {
        if (!sliceSet.some((prev) => Math.abs(prev - rS) < 0.25)) {
          sliceSet.push(rS);
        }
      }
    }

    for (const rS of sliceSet) {
      const polys = sliceBladeMeshAtRadialPlane(bm, rS);
      for (const p of polys) slicedPolys.push(p);
    }
  }

  let base2D: CrossSection;
  if (slicedPolys.length > 0) {
    const csList = slicedPolys.map((p) => {
      const c = new mk.CrossSection([p], "Positive");
      track.push(c);
      return c;
    });
    base2D = csList.length === 1 ? csList[0]! : mk.CrossSection.union(csList);
    if (csList.length > 1) track.push(base2D);
  } else {
    const fb = fallbackNacaAirfoil2D(bladeCtx, zBlade);
    slicedPolys = [fb];
    base2D = new mk.CrossSection([fb], "Positive");
    track.push(base2D);
  }

  const offset = base2D.offset(Math.max(0.15, clearanceMm), "Round", 2, 16);
  track.push(offset);
  const cleaned = offset.simplify(0.04);
  track.push(cleaned);
  return { cut2D: cleaned, rawPolys: slicedPolys };
}

/**
 * Converts a closed blade CrossSection into an axially slide-on saddle CrossSection by sweeping
 * its exact smooth upper airfoil contour vertically downward to `zMin`.
 */
function buildDownwardSaddleCrossSection(
  mk: ManifoldToplevel,
  bladeCut2D: CrossSection,
  zMin: number,
  track: { delete(): void }[],
): CrossSection {
  const polys = bladeCut2D.toPolygons();
  if (polys.length === 0) return bladeCut2D;

  // Build one saddle per polygon component and union cleanly
  const components: CrossSection[] = [];
  for (const poly of polys) {
    if (poly.length < 3) continue;
    let xMin = Infinity;
    let xMax = -Infinity;
    for (const [x] of poly) {
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
    }
    if (xMax - xMin < 0.5) continue;

    // Sample uniform x-grid + original vertices to trace the exact upper envelope zTop(x)
    const sampleSet: number[] = [xMin, xMax];
    const N_SAMP = 56;
    for (let k = 1; k < N_SAMP; k++) {
      sampleSet.push(xMin + ((xMax - xMin) * k) / N_SAMP);
    }
    for (const [x] of poly) sampleSet.push(x);
    sampleSet.sort((a, b) => a - b);

    const xs: number[] = [];
    for (const x of sampleSet) {
      if (xs.length === 0 || x - xs[xs.length - 1]! > 0.04) xs.push(x);
    }
    if (xs[xs.length - 1]! < xMax - 1e-4) xs.push(xMax);

    const topPts: Vec2[] = [];
    for (const x of xs) {
      let maxZ = -Infinity;
      for (let i = 0; i < poly.length; i++) {
        const [x0, z0] = poly[i]!;
        const [x1, z1] = poly[(i + 1) % poly.length]!;
        if ((x0 <= x && x1 >= x) || (x1 <= x && x0 >= x)) {
          const dx = x1 - x0;
          if (Math.abs(dx) < 1e-8) {
            maxZ = Math.max(maxZ, z0, z1);
          } else {
            const t = clamp((x - x0) / dx, 0, 1);
            maxZ = Math.max(maxZ, z0 + t * (z1 - z0));
          }
        }
      }
      if (Number.isFinite(maxZ) && maxZ > zMin + 0.4) {
        topPts.push([x, maxZ]);
      }
    }

    if (topPts.length < 2) continue;
    const leftX = topPts[0]![0];
    const rightX = topPts[topPts.length - 1]![0];
    const loop: Vec2[] = [[leftX, zMin], [rightX, zMin]];
    for (let i = topPts.length - 1; i >= 0; i--) {
      loop.push(topPts[i]!);
    }
    const cs = new mk.CrossSection([ensureCCW2D(loop)], "Positive");
    track.push(cs);
    components.push(cs);
  }

  if (components.length === 0) return bladeCut2D;
  if (components.length === 1) return components[0]!;
  const u = mk.CrossSection.union(components);
  track.push(u);
  return u;
}

/**
 * Builds the closed watertight outer aerodynamic Nose Cone Manifold solid (no internal hollows yet).
 */
function buildOuterAeroSolid(
  mk: ManifoldToplevel,
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  baseR: number,
  wall: number,
  effSkirtLen: number,
  coneLen: number,
  track: { delete(): void }[],
): Manifold {
  const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
  const effPitch = bladeCtx.root_twist_deg + bladeCtx.collective_pitch_deg;
  const maxOuterBaseR = baseR + 0.25 + wall;

  // Axisymmetric profiles can use Manifold's exact Revolved CrossSection directly!
  if (cfg.aero_profile !== "adaptive") {
    const prof: Vec2[] = [];
    const zBot = -effSkirtLen;
    prof.push([0, zBot]);
    if (effSkirtLen > 0) {
      prof.push([maxOuterBaseR, zBot]);
      prof.push([maxOuterBaseR, 0]);
    } else {
      prof.push([maxOuterBaseR, 0]);
    }
    const N_NOSE = 42;
    for (let i = 1; i < N_NOSE; i++) {
      // Cluster rings smoothly near z=0 base & near apex where curvature changes fastest
      const frac = i / N_NOSE;
      const z = frac * coneLen;
      const r = evalNoseProfileRadius(
        cfg.aero_profile,
        1 - frac,
        maxOuterBaseR,
        Math.PI,
        bladeCtx.root_chord_mm,
        effPitch,
      );
      if (r > 0.05) {
        prof.push([r, z]);
      }
    }
    prof.push([0, coneLen]);
    const cs = new mk.CrossSection([ensureCCW2D(prof)], "Positive");
    track.push(cs);
    const rev = cs.revolve(96);
    track.push(rev);
    return rev;
  }

  // Adaptive profile varies smoothly with azimuth theta -> welded closed mesh loft
  const NA = 96;
  const N_SKIRT = effSkirtLen > 0 ? 8 : 0;
  const N_NOSE = 36;
  const zVals: number[] = [];
  for (let i = 0; i < N_SKIRT; i++) {
    zVals.push(-effSkirtLen + (i / N_SKIRT) * effSkirtLen);
  }
  for (let i = 0; i < N_NOSE; i++) {
    // End ring at t=0.985 before apex pole
    const t = (i / N_NOSE) * 0.985;
    zVals.push(t * coneLen);
  }

  const bladeAngles: number[] = [];
  for (let k = 0; k < bCount; k++) {
    bladeAngles.push((k * 2 * Math.PI) / bCount);
  }

  const cosArr: number[] = [];
  const sinArr: number[] = [];
  const minDeltaArr: number[] = [];
  for (let j = 0; j < NA; j++) {
    const theta = (j * 2 * Math.PI) / NA;
    cosArr.push(Math.cos(theta));
    sinArr.push(Math.sin(theta));
    let md = Math.PI;
    for (const ba of bladeAngles) {
      md = Math.min(md, Math.abs(shortestAngleDiff(theta, ba)));
    }
    minDeltaArr.push(md);
  }

  const pos: number[] = [];
  const idx: number[] = [];
  const addVert = (x: number, y: number, z: number) => {
    const vi = pos.length / 3;
    pos.push(x, y, z);
    return vi;
  };
  const addTri = (a: number, b: number, c: number) => {
    if (a !== b && b !== c && a !== c) idx.push(a, b, c);
  };

  const rings: number[][] = [];
  for (let i = 0; i < zVals.length; i++) {
    const z = zVals[i]!;
    const row: number[] = [];
    for (let j = 0; j < NA; j++) {
      let r: number;
      if (z < 0) {
        const rearFrac = Math.abs(z) / Math.max(1, effSkirtLen);
        const ramp = Math.exp(-(minDeltaArr[j]! * minDeltaArr[j]!) / (0.36 * 0.36));
        const pitchBoost = clamp((effPitch - 6) / 28, 0, 1.2);
        const chordBoost = clamp((bladeCtx.root_chord_mm - 30) / 65, 0, 1.2);
        const addR = (0.75 + 2.5 * ramp * (0.55 + 0.3 * chordBoost + 0.25 * pitchBoost)) * (1 - 0.35 * rearFrac);
        r = maxOuterBaseR + addR;
      } else {
        r = evalNoseProfileRadius(
          "adaptive",
          clamp(1 - z / coneLen, 0, 1),
          maxOuterBaseR,
          minDeltaArr[j]!,
          bladeCtx.root_chord_mm,
          effPitch,
        );
        if (i === zVals.length - 1) r = Math.max(0.75, r);
      }
      row.push(addVert(r * cosArr[j]!, r * sinArr[j]!, z));
    }
    rings.push(row);
  }

  const zBot = effSkirtLen > 0 ? -effSkirtLen : 0;
  const botPole = addVert(0, 0, zBot);
  const topPole = addVert(0, 0, coneLen);

  // Side quads (+R outward)
  for (let i = 0; i < rings.length - 1; i++) {
    const r0 = rings[i]!;
    const r1 = rings[i + 1]!;
    for (let j = 0; j < NA; j++) {
      const jNext = (j + 1) % NA;
      addTri(r0[j]!, r0[jNext]!, r1[jNext]!);
      addTri(r0[j]!, r1[jNext]!, r1[j]!);
    }
  }
  // Bottom cap (-Z outward)
  for (let j = 0; j < NA; j++) {
    const jNext = (j + 1) % NA;
    addTri(botPole, rings[0]![jNext]!, rings[0]![j]!);
  }
  // Top apex cap (+Z outward)
  const lastRow = rings[rings.length - 1]!;
  for (let j = 0; j < NA; j++) {
    const jNext = (j + 1) % NA;
    addTri(lastRow[j]!, lastRow[jNext]!, topPole);
  }

  const mMesh: ManifoldMesh = new mk.Mesh({
    numProp: 3,
    vertProperties: new Float32Array(pos),
    triVerts: new Uint32Array(idx),
  });
  mMesh.merge();
  const man = new mk.Manifold(mMesh);
  track.push(man);
  return man;
}

interface BladeEdgeSummary {
  nyMin: number;
  nyMax: number;
  wideSign: -1 | 1;
  yWideRoot: number;
  zWideRoot: number;
  yNarrowRoot: number;
  zNarrowRoot: number;
  yWideOut: number;
  zWideOut: number;
  yNarrowOut: number;
  zNarrowOut: number;
}

function extractExtremeEdgesFromPolys(polys: Vec2[][], fallbackZ: number) {
  let nyMin = Infinity;
  let nyMax = -Infinity;
  for (const poly of polys) {
    for (const [ny] of poly) {
      if (ny < nyMin) nyMin = ny;
      if (ny > nyMax) nyMax = ny;
    }
  }
  if (!Number.isFinite(nyMin) || !Number.isFinite(nyMax)) {
    return {
      nyMin: -32,
      nyMax: 14,
      zAtMin: fallbackZ,
      zAtMax: fallbackZ,
    };
  }
  let sumZMin = 0;
  let cntMin = 0;
  let sumZMax = 0;
  let cntMax = 0;
  for (const poly of polys) {
    for (const [ny, nz] of poly) {
      if (ny <= nyMin + 2.2) {
        sumZMin += nz;
        cntMin++;
      }
      if (ny >= nyMax - 2.2) {
        sumZMax += nz;
        cntMax++;
      }
    }
  }
  return {
    nyMin,
    nyMax,
    zAtMin: cntMin > 0 ? sumZMin / cntMin : fallbackZ,
    zAtMax: cntMax > 0 ? sumZMax / cntMax : fallbackZ,
  };
}

function measureBladeRootEdges(
  bladeCtx: NoseConeBladeContext,
  baseR: number,
  wall: number,
  effHubLen: number,
  fairingSpanMm: number,
  rootPolys: Vec2[][],
): BladeEdgeSummary {
  const zFallback = -effHubLen * 0.5;
  const rootExt = extractExtremeEdgesFromPolys(rootPolys, zFallback);
  const wideSign: -1 | 1 = Math.abs(rootExt.nyMin) >= Math.abs(rootExt.nyMax) ? -1 : 1;
  const yWideRoot = wideSign < 0 ? rootExt.nyMin : rootExt.nyMax;
  const zWideRoot = wideSign < 0 ? rootExt.zAtMin : rootExt.zAtMax;
  const yNarrowRoot = wideSign < 0 ? rootExt.nyMax : rootExt.nyMin;
  const zNarrowRoot = wideSign < 0 ? rootExt.zAtMax : rootExt.zAtMin;

  let yWideOut = yWideRoot;
  let zWideOut = zWideRoot;
  let yNarrowOut = yNarrowRoot;
  let zNarrowOut = zNarrowRoot;

  if (bladeCtx.blade_mesh && bladeCtx.blade_mesh.positions.length >= 9) {
    const bm = bladeCtx.blade_mesh;
    let minNx = Infinity;
    let maxNx = -Infinity;
    const nVerts = (bm.positions.length / 3) | 0;
    for (let v = 0; v < nVerts; v++) {
      const nx = bm.positions[3 * v + 2]! + bm.radial_shift_mm;
      if (nx < minNx) minNx = nx;
      if (nx > maxNx) maxNx = nx;
    }
    const rOut = clamp(baseR + wall + fairingSpanMm * 0.65, minNx + 0.4, maxNx - 0.5);
    if (Number.isFinite(rOut) && rOut > minNx + 0.2 && rOut < maxNx - 0.2) {
      const outPolys = sliceBladeMeshAtRadialPlane(bm, rOut);
      if (outPolys.length > 0) {
        const outExt = extractExtremeEdgesFromPolys(outPolys, zFallback);
        yWideOut = wideSign < 0 ? outExt.nyMin : outExt.nyMax;
        zWideOut = wideSign < 0 ? outExt.zAtMin : outExt.zAtMax;
        yNarrowOut = wideSign < 0 ? outExt.nyMax : outExt.nyMin;
        zNarrowOut = wideSign < 0 ? outExt.zAtMax : outExt.zAtMin;
      }
    }
  }

  return {
    nyMin: rootExt.nyMin,
    nyMax: rootExt.nyMax,
    wideSign,
    yWideRoot,
    zWideRoot,
    yNarrowRoot,
    zNarrowRoot,
    yWideOut,
    zWideOut,
    yNarrowOut,
    zNarrowOut,
  };
}

/**
 * Builds one closed, watertight swept blade-root fairing wing attached inside the nose shell
 * so `solid.add(...)` followed by internal/blade boolean subtractions yields a seamless bridge.
 */
function buildOneFairingWingManifold(
  mk: ManifoldToplevel,
  baseR: number,
  wall: number,
  coneLen: number,
  effSkirtLen: number,
  bCount: number,
  style: "delta" | "boot" | "fillet",
  sideSign: -1 | 1,
  isWideSide: boolean,
  spanMm: number,
  blendPct: number,
  yTargetRoot: number,
  yTargetOut: number,
  zTargetEdge: number,
  track: { delete(): void }[],
): Manifold {
  const sectorFull = (2 * Math.PI) / bCount;
  const safeMaxFlankRad = Math.max(0.45, Math.min(1.22, sectorFull - 0.62));
  const thetaA = sideSign * (isWideSide ? safeMaxFlankRad : Math.min(safeMaxFlankRad * 0.72, 0.85));
  const thetaB = sideSign * Math.min(0.28, safeMaxFlankRad * 0.30);

  // Anchor well inside the solid outer nose cone shell so the root edge blends without a seam step
  const rA = baseR * 0.65;
  const rB = baseR * 0.63;
  const pA: Vec2 = [rA * Math.cos(thetaA), rA * Math.sin(thetaA)];
  const pB: Vec2 = [rB * Math.cos(thetaB), rB * Math.sin(thetaB)];

  const spanScale = isWideSide ? (style === "fillet" ? 0.92 : 1.0) : style === "boot" ? 0.68 : 0.55;
  const effSpan = clamp(spanMm, 10, 48) * spanScale;
  const xTip = baseR + wall + effSpan;
  const maxTan = Math.tan(Math.min(1.08, sectorFull * (isWideSide ? 0.50 : 0.38)));
  const clampAbsY = (raw: number) => clamp(Math.abs(raw), baseR * (isWideSide ? 0.52 : 0.32), xTip * maxTan);
  const yTip = sideSign * clampAbsY(yTargetOut);
  const yCorner = sideSign * clamp(Math.abs(yTargetRoot), baseR * (isWideSide ? 0.52 : 0.32), (baseR + 4) * maxTan);

  const cornerPad = isWideSide ? 2.6 : 1.6;
  const pCorner: Vec2 = [baseR + 1.5, yCorner + sideSign * cornerPad];
  const pCOut: Vec2 = [xTip, yTip + sideSign * 0.9];
  const pCIn: Vec2 = [Math.max(baseR + 0.5, xTip - 1.5), yTip - sideSign * 2.4];

  const blendEff =
    style === "fillet" ? Math.max(0.65, clamp(blendPct / 100, 0, 1)) : clamp(blendPct / 100, 0, 1);
  // Blend between crisp triangular delta elbow (pA -> pCorner -> pCOut) and smooth quadratic Karman curve
  const midAC: Vec2 = [0.5 * (pA[0] + pCOut[0]), 0.5 * (pA[1] + pCOut[1])];
  const qSmooth: Vec2 = [
    1.84 * pCorner[0] - 0.84 * midAC[0],
    1.84 * pCorner[1] - 0.84 * midAC[1],
  ];

  const zSkirtBot = effSkirtLen > 0 ? -effSkirtLen : 0;
  const zTopStart = clamp(coneLen * (isWideSide ? 0.25 : 0.19), 9.5, coneLen * 0.34);
  const zBotTarget = clamp(zTargetEdge - 0.8, zSkirtBot, 4.0);

  // 12-point closed perimeter (s ∈ [0=P_in..1=P_out], fz ∈ [0=zBot..1=zTop])
  const profTemplate: [number, number][] = [
    [0.0, 0.0],
    [0.45, 0.0],
    [0.86, 0.0],
    [0.98, 0.08],
    [1.0, 0.20],
    [0.92, 0.36],
    [0.74, 0.56],
    [0.52, 0.76],
    [0.30, 0.91],
    [0.10, 0.99],
    [0.0, 1.0],
    [0.0, 0.5],
  ];
  const N_PROF = profTemplate.length;
  const N_U = 16;

  const pos: number[] = [];
  const idx: number[] = [];
  const rings: number[][] = [];

  for (let i = 0; i <= N_U; i++) {
    const u = i / N_U;
    const omt = 1 - u;
    const bX = omt * omt * pA[0] + 2 * omt * u * qSmooth[0] + u * u * pCOut[0];
    const bY = omt * omt * pA[1] + 2 * omt * u * qSmooth[1] + u * u * pCOut[1];
    const uElbow = 0.38;
    const lX =
      u <= uElbow
        ? pA[0] + ((pCorner[0] - pA[0]) * u) / uElbow
        : pCorner[0] + ((pCOut[0] - pCorner[0]) * (u - uElbow)) / (1 - uElbow);
    const lY =
      u <= uElbow
        ? pA[1] + ((pCorner[1] - pA[1]) * u) / uElbow
        : pCorner[1] + ((pCOut[1] - pCorner[1]) * (u - uElbow)) / (1 - uElbow);

    let outX = lX + (bX - lX) * blendEff;
    let outY = lY + (bY - lY) * blendEff;
    const inX = pB[0] + (pCIn[0] - pB[0]) * u;
    const inY = pB[1] + (pCIn[1] - pB[1]) * u;

    const wVecY = (outY - inY) * sideSign;
    if (wVecY < 2.8) {
      outY += sideSign * (2.8 - wVecY);
    }
    const wLen = Math.hypot(outX - inX, outY - inY);
    if (wLen < 2.8) {
      outX += 2.8 - wLen;
    }

    const distU = Math.hypot(outX - pA[0], outY - pA[1]);
    const rMinU = Math.min(Math.hypot(outX, outY), Math.hypot(inX, inY));
    const distPastSkirtBevel = Math.max(0, rMinU - (baseR + 1.2));
    const skirtBevelLift = effSkirtLen > 0 ? Math.max(0, 0.9 - distPastSkirtBevel * 0.9) : 0;
    const zBotFloor = zSkirtBot + skirtBevelLift;
    const zBot = Math.max(zBotFloor, Math.min(zBotTarget, zBotFloor + distU * 0.78));
    const zTopEnd =
      style === "fillet"
        ? Math.max(zBot + 2.4, Math.min(zTargetEdge + 3.0, zTopStart - 3))
        : Math.max(zBot + 2.4, Math.min(zTargetEdge + 2.8, zBot + 6.5));
    const zTop = Math.max(zBot + 2.2, zTopStart + (zTopEnd - zTopStart) * Math.pow(u, 0.72));

    const ring: number[] = [];
    for (let j = 0; j < N_PROF; j++) {
      const [s, fz] = profTemplate[j]!;
      const x = inX + (outX - inX) * s;
      const y = inY + (outY - inY) * s;
      const z = zBot + (zTop - zBot) * fz;
      ring.push(pos.length / 3);
      pos.push(x, y, z);
    }
    rings.push(ring);
  }

  for (let i = 0; i < N_U; i++) {
    const r0 = rings[i]!;
    const r1 = rings[i + 1]!;
    for (let j = 0; j < N_PROF; j++) {
      const jNext = (j + 1) % N_PROF;
      idx.push(r0[j]!, r1[j]!, r1[jNext]!);
      idx.push(r0[j]!, r1[jNext]!, r0[jNext]!);
    }
  }

  // Start cap (u = 0) and End cap (u = 1) using centroid fan
  const addCap = (ring: number[], reverse: boolean) => {
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (const vi of ring) {
      cx += pos[3 * vi]!;
      cy += pos[3 * vi + 1]!;
      cz += pos[3 * vi + 2]!;
    }
    const cIdx = pos.length / 3;
    pos.push(cx / ring.length, cy / ring.length, cz / ring.length);
    for (let j = 0; j < ring.length; j++) {
      const a = ring[j]!;
      const b = ring[(j + 1) % ring.length]!;
      if (reverse) idx.push(cIdx, b, a);
      else idx.push(cIdx, a, b);
    }
  };
  addCap(rings[0]!, false);
  addCap(rings[rings.length - 1]!, true);

  // Guarantee positive signed volume (outward normals regardless of sideSign)
  let signedVol6 = 0;
  for (let t = 0; t + 2 < idx.length; t += 3) {
    const ia = idx[t]! * 3;
    const ib = idx[t + 1]! * 3;
    const ic = idx[t + 2]! * 3;
    const ax = pos[ia]!, ay = pos[ia + 1]!, az = pos[ia + 2]!;
    const bx = pos[ib]!, by = pos[ib + 1]!, bz = pos[ib + 2]!;
    const cx = pos[ic]!, cy = pos[ic + 1]!, cz = pos[ic + 2]!;
    signedVol6 +=
      ax * (by * cz - bz * cy) +
      ay * (bz * cx - bx * cz) +
      az * (bx * cy - by * cx);
  }
  if (signedVol6 < 0) {
    for (let t = 0; t + 2 < idx.length; t += 3) {
      const tmp = idx[t + 1]!;
      idx[t + 1] = idx[t + 2]!;
      idx[t + 2] = tmp;
    }
  }

  const mMesh: ManifoldMesh = new mk.Mesh({
    numProp: 3,
    vertProperties: new Float32Array(pos),
    triVerts: new Uint32Array(idx),
  });
  mMesh.merge();
  const man = new mk.Manifold(mMesh);
  track.push(man);
  return man;
}

/**
 * Carves the full printable Nose Cone single solid with Manifold-3D CSG operations.
 */
function buildPrintableNoseManifold(
  mk: ManifoldToplevel,
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
): {
  manifold: Manifold;
  metricsExtra: {
    volume_cm3: number;
    is_watertight: boolean;
    is_single_solid: boolean;
    print_status: string;
    chord_fit_warning: string | null;
  };
  submesh: NoseConeSubMesh;
} {
  const track: { delete(): void }[] = [];
  const effHubDia = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
  const effHubLen = cfg.hub_fit_mode === "kidwind4_lockrev4" ? 20.0 : clamp(bladeCtx.hub_length_mm, 8, 80);
  const baseR = effHubDia * 0.5;
  const effSkirtLen = cfg.wrap_style === "flush" ? 0 : clamp(cfg.skirt_length_mm, 8, Math.max(10, effHubLen + 4));
  const coneLen = clamp(cfg.cone_length_mm, 35, 150);
  const wall = clamp(cfg.wall_thickness_mm, 1.4, 5.0);
  const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
  const boreR = Math.max(2.65, bladeCtx.hub_bore_mm * 0.5);
  const clearance = clamp(cfg.blade_clearance_mm, 0.2, 2.5);
  const effPitch = bladeCtx.root_twist_deg + bladeCtx.collective_pitch_deg;
  const effFairingStyle: NoseConeFairingStyle = cfg.fairing_style ?? "delta";
  const effFairingSpan =
    effFairingStyle === "none" ? 0 : clamp(cfg.fairing_span_mm ?? 26, 10, 48);
  const effFairingBlend = clamp(cfg.fairing_blend_pct ?? 35, 0, 100);

  try {
    // Pre-slice blade root contours so both swept fairings & skirt cutouts match exact 3D blade geometry
    let bladeCutInfo: { cut2D: CrossSection; rawPolys: Vec2[][] } | null = null;
    if (cfg.wrap_style !== "flush" || effFairingStyle !== "none") {
      bladeCutInfo = buildBladeCutCrossSection(
        mk,
        bladeCtx,
        baseR,
        wall,
        effHubLen,
        clearance,
        track,
      );
    }
    const edgeSummary = measureBladeRootEdges(
      bladeCtx,
      baseR,
      wall,
      effHubLen,
      effFairingSpan || 26,
      bladeCutInfo?.rawPolys ?? [],
    );

    // 1. Base outer aerodynamic solid (+ monolithic swept blade-root fairings if enabled)
    let solid = buildOuterAeroSolid(mk, cfg, bladeCtx, baseR, wall, effSkirtLen, coneLen, track);
    if (effFairingStyle !== "none" && effFairingSpan >= 8) {
      let wing0 = buildOneFairingWingManifold(
        mk,
        baseR,
        wall,
        coneLen,
        effSkirtLen,
        bCount,
        effFairingStyle,
        edgeSummary.wideSign,
        true,
        effFairingSpan,
        effFairingBlend,
        edgeSummary.yWideRoot,
        edgeSummary.yWideOut,
        edgeSummary.zWideOut,
        track,
      );
      if (effFairingStyle === "boot" || effFairingStyle === "fillet") {
        const narrowSign: -1 | 1 = edgeSummary.wideSign > 0 ? -1 : 1;
        const narrowWing = buildOneFairingWingManifold(
          mk,
          baseR,
          wall,
          coneLen,
          effSkirtLen,
          bCount,
          effFairingStyle,
          narrowSign,
          false,
          effFairingSpan,
          effFairingBlend,
          edgeSummary.yNarrowRoot,
          edgeSummary.yNarrowOut,
          edgeSummary.zNarrowOut,
          track,
        );
        wing0 = wing0.add(narrowWing);
        track.push(wing0);
      }
      const fairingInstances: Manifold[] = [];
      for (let k = 0; k < bCount; k++) {
        const deg = (k * 360) / bCount;
        const inst = deg === 0 ? wing0 : wing0.rotate([0, 0, deg]);
        if (deg !== 0) track.push(inst);
        fairingInstances.push(inst);
      }
      const fairingsUnion = fairingInstances.length === 1 ? fairingInstances[0]! : mk.Manifold.union(fairingInstances);
      if (fairingInstances.length > 1) track.push(fairingsUnion);
      solid = solid.add(fairingsUnion);
      track.push(solid);
    }

    const subtractList: Manifold[] = [];

    // 2. Hub skirt bore + 0.5mm x 45-deg bottom lead-in bevel
    if (effSkirtLen > 0) {
      const hubSlipR = baseR + 0.25;
      const bevelR = hubSlipR + 0.55;
      const hubCavityProfile: Vec2[] = [
        [0, -effSkirtLen - 2.0],
        [bevelR, -effSkirtLen - 2.0],
        [bevelR, -effSkirtLen],
        [hubSlipR, -effSkirtLen + 0.55],
        [hubSlipR, 0.15],
        [0, 0.15],
      ];
      const hubCs = new mk.CrossSection([ensureCCW2D(hubCavityProfile)], "Positive");
      track.push(hubCs);
      const hubCavity = hubCs.revolve(96);
      track.push(hubCavity);
      subtractList.push(hubCavity);
    }

    // 3. Carved 3-lobe chamfered Trefoil Pocket (z = 0..trefoilDepth+0.35mm) or shaft step
    if (cfg.hub_fit_mode === "kidwind4_lockrev4") {
      const tDepth = cfg.trefoil_depth_mm + 0.35;
      const trefPts: Vec2[] = [];
      const NA = 96;
      for (let j = 0; j < NA; j++) {
        const theta = (j * 2 * Math.PI) / NA;
        const r = Math.min(
          baseR - 1.2,
          evalTrefoilRadius(
            theta,
            cfg.trefoil_center_r_mm,
            cfg.trefoil_lobe_r_mm,
            cfg.bolt_circle_mm * 0.5,
            bCount,
            cfg.trefoil_clearance_mm,
          ),
        );
        trefPts.push([r * Math.cos(theta), r * Math.sin(theta)]);
      }
      const trefCs = new mk.CrossSection([ensureCCW2D(trefPts)], "Positive");
      track.push(trefCs);
      const trefExt = trefCs.extrude(tDepth + 0.4).translate([0, 0, -0.4]);
      track.push(trefExt);
      subtractList.push(trefExt);

      // Lead-in 45-deg trefoil bevel at z = -0.3 .. +0.55
      const trefLeadCs = trefCs.offset(0.6, "Round", 2, 8);
      track.push(trefLeadCs);
      const trefLeadCone = trefLeadCs.extrude(0.85, 1, 0, [baseR > 20 ? 0.96 : 0.92, baseR > 20 ? 0.96 : 0.92]).translate([0, 0, -0.3]);
      track.push(trefLeadCone);
      subtractList.push(trefLeadCone);
    } else {
      // Auto-Match Hub: clean chamfered shaft pilot bore
      const pilotR = Math.min(baseR * 0.65, boreR + cfg.trefoil_clearance_mm + 0.4);
      const pDepth = clamp(cfg.trefoil_depth_mm + 2.0, 2.0, 5.0);
      const pilotProf: Vec2[] = [
        [0, -0.5],
        [pilotR + 0.6, -0.5],
        [pilotR + 0.6, 0.0],
        [pilotR, 0.6],
        [pilotR, pDepth],
        [0, pDepth + 0.4],
      ];
      const pCs = new mk.CrossSection([ensureCCW2D(pilotProf)], "Positive");
      track.push(pCs);
      const pMan = pCs.revolve(64);
      track.push(pMan);
      subtractList.push(pMan);
    }

    // 4. Carved 3x Rear Blind M3 Screw Holes with 45-deg self-supporting conical roofs
    const boltR =
      cfg.hub_fit_mode === "kidwind4_lockrev4"
        ? cfg.bolt_circle_mm * 0.5
        : clamp(effHubDia * 0.31, 6, effHubDia * 0.38);
    const blindDepth = clamp(coneLen * 0.16, 7.5, 10.5);
    const trefDepthEff =
      cfg.hub_fit_mode === "kidwind4_lockrev4"
        ? cfg.trefoil_depth_mm + 0.35
        : clamp(cfg.trefoil_depth_mm + 2.0, 2.0, 5.0);
    const floorTopZ = clamp(trefDepthEff + Math.max(2.4, wall + 0.4), 4.6, Math.max(5.4, coneLen * 0.14));
    const nutClearR = clamp(
      boreR + 2.5,
      Math.min(4.5, Math.max(2.0, baseR - wall - 1.0)),
      Math.max(5.2, boltR - 5.2),
    );
    const bossR = clamp(Math.min(4.6, boltR - nutClearR - 0.5), 3.1, 4.6);
    const bossTopZ = blindDepth + Math.max(2.2, wall);

    const m3Prof: Vec2[] = [
      [0, -0.6],
      [2.1, -0.6],
      [2.1, 0.0],
      [1.5, 0.6],
      [1.5, blindDepth],
      [0, blindDepth + 1.5], // 45-deg self-supporting conical drill-point roof!
    ];
    const m3Cs = new mk.CrossSection([ensureCCW2D(m3Prof)], "Positive");
    track.push(m3Cs);
    const m3Proto = m3Cs.revolve(36);
    track.push(m3Proto);
    for (let k = 0; k < bCount; k++) {
      const ang = ((k + 0.5) * 2 * Math.PI) / bCount;
      const cx = boltR * Math.cos(ang);
      const cy = boltR * Math.sin(ang);
      const hole = m3Proto.translate([cx, cy, 0]);
      track.push(hole);
      subtractList.push(hole);
    }

    // 5. Compute true blade root cutouts + track max blade height
    const bladeNYMin = edgeSummary.nyMin;
    const bladeNYMax = edgeSummary.nyMax;
    if (cfg.wrap_style !== "flush" && bladeCutInfo) {
      const { cut2D } = bladeCutInfo;

      // Build sector safety clip so adjacent 120-deg blades can NEVER merge and detach skirt segments,
      // and radial start never breaches internal trefoil/M3 boss pillars.
      const sectorHalfRad = Math.PI / bCount;
      const pierHalfRad = Math.min(0.16, sectorHalfRad * 0.25);
      const maxAngle = Math.max(0.15, sectorHalfRad - pierHalfRad);
      const rCutIn = Math.max(boltR + bossR + 0.4, baseR - 0.7);
      const rCutOut = baseR + wall + Math.max(36, effFairingSpan + 24);
      const wedgePts: Vec2[] = [];
      const nArc = 16;
      for (let i = 0; i <= nArc; i++) {
        const a = -maxAngle + ((2 * maxAngle) * i) / nArc;
        wedgePts.push([rCutOut * Math.cos(a), rCutOut * Math.sin(a)]);
      }
      for (let i = nArc; i >= 0; i--) {
        const a = -maxAngle + ((2 * maxAngle) * i) / nArc;
        wedgePts.push([rCutIn * Math.cos(a), rCutIn * Math.sin(a)]);
      }
      const wedgeCs = new mk.CrossSection([ensureCCW2D(wedgePts)], "Positive");
      track.push(wedgeCs);
      const wedgeHeight = coneLen + effSkirtLen + 20;
      let wedgeSolid = wedgeCs.extrude(wedgeHeight).translate([0, 0, -effSkirtLen - 8]);
      track.push(wedgeSolid);

      // When swept root fairings extend beyond the hub wall, widen the outboard cutout sector
      // so wide blade trailing edges are cleanly carved through the fairing without blocking piers
      if (effFairingSpan > 0) {
        const rOutIn = baseR + wall + 0.8;
        const outAngle = Math.max(maxAngle, Math.min(1.22, sectorHalfRad * 2 - 0.14));
        const outPts: Vec2[] = [];
        for (let i = 0; i <= nArc; i++) {
          const a = -outAngle + ((2 * outAngle) * i) / nArc;
          outPts.push([rCutOut * Math.cos(a), rCutOut * Math.sin(a)]);
        }
        for (let i = nArc; i >= 0; i--) {
          const a = -outAngle + ((2 * outAngle) * i) / nArc;
          outPts.push([rOutIn * Math.cos(a), rOutIn * Math.sin(a)]);
        }
        const outCs = new mk.CrossSection([ensureCCW2D(outPts)], "Positive");
        track.push(outCs);
        const outWedge = outCs.extrude(wedgeHeight).translate([0, 0, -effSkirtLen - 8]);
        track.push(outWedge);
        wedgeSolid = wedgeSolid.add(outWedge);
        track.push(wedgeSolid);
      }

      let blade0Cutter: Manifold;
      if (cfg.wrap_style === "cuff") {
        const cuffHoleR =
          clamp(
            Math.min(effSkirtLen * 0.44, baseR * Math.sin(maxAngle) - 1.2),
            6.5,
            13.5,
          ) + clearance;
        const zBlade = -clamp(effHubLen * 0.5, 4.5, Math.max(5.0, effSkirtLen - 2.5));
        const cyl = mk.Manifold.cylinder(rCutOut + 4, cuffHoleR, cuffHoleR, 64, false);
        track.push(cyl);
        const rawCuff = cyl.rotate([0, 90, 0]).translate([0, 0, zBlade]);
        track.push(rawCuff);
        blade0Cutter = rawCuff.intersect(wedgeSolid);
        track.push(blade0Cutter);
      } else {
        let profile2D = cut2D;
        if (cfg.wrap_style === "saddle") {
          profile2D = buildDownwardSaddleCrossSection(mk, cut2D, -effSkirtLen - 4.0, track);
        }
        // Check non-empty crossSection before extrude
        const b = profile2D.bounds();
        const padW = b.max[0] - b.min[0];
        const padH = b.max[1] - b.min[1];
        if (!profile2D.isEmpty() && padW > 0.2 && padH > 0.2) {
          const extLen = rCutOut + 4;
          // rotate([90, 0, 90]) maps (u=ny, v=nz, t in [0..extLen]) -> (+t, ny, nz) from r=0 through rCutOut
          const rawExtrude = profile2D.extrude(extLen).rotate([90, 0, 90]);
          track.push(rawExtrude);
          blade0Cutter = rawExtrude.intersect(wedgeSolid);
          track.push(blade0Cutter);
        } else {
          blade0Cutter = mk.Manifold.cube([0.1, 0.1, 0.1]).translate([9999, 9999, 9999]);
          track.push(blade0Cutter);
        }
      }

      if (!blade0Cutter.isEmpty()) {
        for (let k = 0; k < bCount; k++) {
          const deg = (k * 360) / bCount;
          const rotCut = deg === 0 ? blade0Cutter : blade0Cutter.rotate([0, 0, deg]);
          if (deg !== 0) track.push(rotCut);
          subtractList.push(rotCut);
        }
      }
    }

    // 6. Carve thin-wall self-supporting hollow aerodynamic dome + protect integrated ribbed M3 bosses
    const maxCavityTipZ = coneLen - Math.max(wall * 1.6, 3.6);
    const rInnerTargetAt = (z: number) => {
      const c = clamp(1 - z / coneLen, 0, 1);
      const rOutMin = evalNoseProfileRadius(
        cfg.aero_profile,
        c,
        baseR + wall + 0.25,
        Math.PI,
        bladeCtx.root_chord_mm,
        effPitch,
      );
      return Math.max(0, rOutMin - wall);
    };

    const domeProf: Vec2[] = [[0, -0.5], [nutClearR, -0.5], [nutClearR, floorTopZ]];
    if (maxCavityTipZ > floorTopZ + 5.0) {
      const N_CAV = 32;
      const zStep = (maxCavityTipZ - floorTopZ) / N_CAV;
      const rVals: number[] = [];
      for (let i = 0; i <= N_CAV; i++) {
        const z = floorTopZ + i * zStep;
        const target = rInnerTargetAt(z);
        if (i === 0) {
          rVals.push(Math.max(nutClearR, target));
        } else {
          // Enforce <= 40-deg outward expansion from lower ring so dome wall never overhangs
          rVals.push(Math.min(target, rVals[i - 1]! + 0.84 * zStep));
        }
      }
      if (rVals[0]! > nutClearR + 0.3) {
        domeProf.push([rVals[0]!, floorTopZ]);
      }
      let tipZ = maxCavityTipZ;
      for (let i = 1; i < N_CAV; i++) {
        const z = floorTopZ + i * zStep;
        const r = rVals[i]!;
        if (r > 0.25) {
          domeProf.push([r, z]);
        } else {
          tipZ = z;
          break;
        }
      }
      domeProf.push([0, tipZ]);
    } else {
      domeProf.push([0, floorTopZ + nutClearR]);
    }

    const domeCs = new mk.CrossSection([ensureCCW2D(domeProf)], "Positive");
    track.push(domeCs);
    const rawDomeRev = domeCs.revolve(72);
    track.push(rawDomeRev);

    // Protect 3x integral blind M3 screw bosses + radial stiffener ribs fused into the pier shell
    const bossProf: Vec2[] = [
      [0, -1.0],
      [bossR, -1.0],
      [bossR, bossTopZ],
      [0, bossTopZ + bossR * 0.75],
    ];
    const bossCs = new mk.CrossSection([ensureCCW2D(bossProf)], "Positive");
    track.push(bossCs);
    const bossProto = bossCs.revolve(32);
    track.push(bossProto);

    const ribW = Math.min(3.2, bossR * 0.72);
    const ribOverlap = Math.min(1.8, bossR * 0.45);
    const ribLen = Math.max(5.5, baseR + wall + 6 - boltR + ribOverlap);
    const ribTopZ = Math.max(floorTopZ + 1.5, bossTopZ - 1.5);
    const ribProto = mk.Manifold.cube([ribLen, ribW, ribTopZ + 1.0], false).translate([
      boltR - ribOverlap,
      -ribW * 0.5,
      -1.0,
    ]);
    track.push(ribProto);
    const bossUnitProto = bossProto.translate([boltR, 0, 0]).add(ribProto);
    track.push(bossUnitProto);

    const bossProtectList: Manifold[] = [];
    for (let k = 0; k < bCount; k++) {
      const deg = ((k + 0.5) * 360) / bCount;
      const unit = bossUnitProto.rotate([0, 0, deg]);
      track.push(unit);
      bossProtectList.push(unit);
    }
    const m3BossProtect = mk.Manifold.union(bossProtectList);
    track.push(m3BossProtect);
    const lighteningCavity = rawDomeRev.subtract(m3BossProtect);
    track.push(lighteningCavity);
    subtractList.push(lighteningCavity);

    // Execute batch Boolean difference
    const carved = solid.subtract(mk.Manifold.union(subtractList));
    track.push(carved);

    // Decompose and keep single largest solid component (eliminating any tiny detached corner fragments)
    const decomposed = carved.decompose();
    for (const part of decomposed) track.push(part);

    let singleSolid = carved;
    if (decomposed.length > 1) {
      let bestVol = -1;
      for (const part of decomposed) {
        const v = part.volume();
        if (v > bestVol) {
          bestVol = v;
          singleSolid = part;
        }
      }
    } else if (decomposed.length === 1) {
      singleSolid = decomposed[0]!;
    }

    // Measure full un-cutaway printable solid volume before optional viewport cutaway
    const volumeCm3 = Math.max(0.1, singleSolid.volume() / 1000);
    const statusOk = singleSolid.status() === "NoError";

    // Optional viewport-only 90-deg solid quarter-cutaway (faces front-right camera)
    let displaySolid = singleSolid;
    if (cfg.cutaway_mode) {
      const cutBox = mk.Manifold.cube([baseR + 40, baseR + 40, coneLen + effSkirtLen + 20], false).translate([
        0,
        0,
        -effSkirtLen - 6,
      ]);
      track.push(cutBox);
      displaySolid = singleSolid.subtract(cutBox);
      track.push(displaySolid);
    }

    const outMesh = displaySolid.getMesh();
    const nVerts = outMesh.numVert;
    const positions = new Float32Array(nVerts * 3);
    const numProp = outMesh.numProp;
    for (let v = 0; v < nVerts; v++) {
      positions[3 * v] = outMesh.vertProperties[numProp * v]!;
      positions[3 * v + 1] = outMesh.vertProperties[numProp * v + 1]!;
      positions[3 * v + 2] = outMesh.vertProperties[numProp * v + 2]!;
    }
    const indices = new Uint32Array(outMesh.triVerts);

    const chordLimitHalfW = baseR * Math.sin(Math.max(0.2, Math.PI / bCount - 0.16));
    const chordFitWarning =
      Math.max(Math.abs(bladeNYMin), Math.abs(bladeNYMax)) > chordLimitHalfW + 1.5 && cfg.wrap_style !== "flush" && cfg.wrap_style !== "cuff"
        ? cfg.hub_fit_mode === "kidwind4_lockrev4"
          ? `Blade root spans wider than Ø${effHubDia.toFixed(0)}mm pier spacing — switch Hub Fit to Auto-Match or reduce root chord`
          : `Blade root (${(bladeNYMax - bladeNYMin).toFixed(0)}mm) nears Ø${effHubDia.toFixed(0)}mm pier spacing — increase Hub Dia or reduce root chord`
        : null;

    return {
      manifold: displaySolid,
      metricsExtra: {
        volume_cm3: Number(volumeCm3.toFixed(2)),
        is_watertight: statusOk,
        is_single_solid: true,
        print_status: statusOk ? "Manifold-3D · 1 Solid · Watertight · Printable" : `Mesh Error (${singleSolid.status()})`,
        chord_fit_warning: chordFitWarning,
      },
      submesh: {
        id: "nose-cone-solid",
        color_hex: 0x2563eb,
        positions,
        indices,
      },
    };
  } finally {
    for (const item of track) {
      try {
        item.delete();
      } catch {
        // already deleted or moved
      }
    }
  }
}

/**
 * Watertight rotating blade-base cuff (`wrap_style === "cuff"`), built via Manifold-3D CSG
 * with real blade airfoil/dowel slot subtracted cleanly through the center.
 */
function buildBladeCuffManifolds(
  mk: ManifoldToplevel,
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  effHubDiameterMm: number,
  effHubLen: number,
): NoseConeSubMesh[] {
  if (cfg.wrap_style !== "cuff") return [];
  const track: { delete(): void }[] = [];
  try {
    const baseR = effHubDiameterMm * 0.5;
    const effSkirtLen = clamp(cfg.skirt_length_mm, 8, Math.max(10, effHubLen + 4));
    const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
    const sectorHalfRad = Math.PI / bCount;
    const maxAngle = Math.max(0.15, sectorHalfRad - 0.16);
    const cuffR = clamp(Math.min(effSkirtLen * 0.44, baseR * Math.sin(maxAngle) - 1.2), 6.5, 13.5);
    const flangeR = cuffR + 1.2;
    const wallT = clamp(cfg.wall_thickness_mm + 1.4, 2.8, 5.2);

    // Outer stepped collar cylinder (flange sits inside spinner rim, main boss seats flush in circular aperture)
    const flange = mk.Manifold.cylinder(1.2, flangeR, flangeR, 64, false);
    track.push(flange);
    const collar = mk.Manifold.cylinder(wallT - 1.0, cuffR, cuffR, 64, false).translate([0, 0, 1.2]);
    track.push(collar);
    let solid = flange.add(collar);
    track.push(solid);

    // Carve dowel center bore + airfoil-shaped shallow entry socket on outer face
    const bore = mk.Manifold.cylinder(wallT + 2.0, 2.6, 2.6, 36, false).translate([0, 0, -0.5]);
    track.push(bore);
    solid = solid.subtract(bore);
    track.push(solid);

    // Optional blade-shaped key pocket inside the cuff (clipped strictly inside cuffR - 1.5mm rim wall)
    const { cut2D } = buildBladeCutCrossSection(
      mk,
      bladeCtx,
      baseR,
      cfg.wall_thickness_mm,
      effHubLen,
      cfg.blade_clearance_mm * 0.6,
      track,
    );
    const bounds = cut2D.bounds();
    const cuX = 0.5 * (bounds.min[0] + bounds.max[0]);
    const cuY = 0.5 * (bounds.min[1] + bounds.max[1]);
    const centeredCut = cut2D.translate([-cuX, -cuY]);
    track.push(centeredCut);
    const rimLimit = mk.CrossSection.circle(Math.max(3.5, cuffR - 1.6), 48);
    track.push(rimLimit);
    const safePocket = centeredCut.intersect(rimLimit);
    track.push(safePocket);
    if (!safePocket.isEmpty()) {
      const pocketExt = safePocket.extrude(wallT + 2.0).translate([0, 0, -0.5]);
      track.push(pocketExt);
      solid = solid.subtract(pocketExt);
      track.push(solid);
    }

    const parts = solid.decompose();
    for (const p of parts) track.push(p);
    let mainCuff = solid;
    if (parts.length > 1) {
      mainCuff = parts.reduce((a, b) => (a.volume() >= b.volume() ? a : b));
    }

    const m = mainCuff.getMesh();
    const nVerts = m.numVert;
    const positions = new Float32Array(nVerts * 3);
    for (let v = 0; v < nVerts; v++) {
      positions[3 * v] = m.vertProperties[m.numProp * v]!;
      positions[3 * v + 1] = m.vertProperties[m.numProp * v + 1]!;
      positions[3 * v + 2] = m.vertProperties[m.numProp * v + 2]!;
    }
    return [
      {
        id: "blade-rotating-cuff",
        color_hex: 0xf59e0b,
        positions,
        indices: new Uint32Array(m.triVerts),
      },
    ];
  } finally {
    for (const item of track) {
      try {
        item.delete();
      } catch {}
    }
  }
}

/**
 * Visual-only reference hub + trefoil boss + 3x rear blind M3 bolts matching `Kidwind4-LockRev4.step`
 * (`z = -20..0` hub, `z = 0..+2` trefoil boss, `z = -23..+8` M3 screws).
 */
function buildGhostHubMeshes(
  mk: ManifoldToplevel,
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
): NoseConeSubMesh[] {
  const track: { delete(): void }[] = [];
  const meshToSub = (id: string, color_hex: number, man: Manifold): NoseConeSubMesh => {
    const m = man.getMesh();
    const positions = new Float32Array(m.numVert * 3);
    for (let v = 0; v < m.numVert; v++) {
      positions[3 * v] = m.vertProperties[m.numProp * v]!;
      positions[3 * v + 1] = m.vertProperties[m.numProp * v + 1]!;
      positions[3 * v + 2] = m.vertProperties[m.numProp * v + 2]!;
    }
    return { id, color_hex, positions, indices: new Uint32Array(m.triVerts) };
  };

  try {
    const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
    const effHubDia = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
    const effHubLen = cfg.hub_fit_mode === "kidwind4_lockrev4" ? 20.0 : clamp(bladeCtx.hub_length_mm, 8, 80);
    const hubR = effHubDia * 0.5;
    const boreR = Math.max(2.65, bladeCtx.hub_bore_mm * 0.5);

    // 1. Hub cylinder with bore
    const hubProf: Vec2[] = [
      [boreR, -effHubLen],
      [hubR, -effHubLen],
      [hubR, 0],
      [boreR, 0],
    ];
    const hubCs = new mk.CrossSection([ensureCCW2D(hubProf)], "Positive");
    track.push(hubCs);
    const hubMan = hubCs.revolve(64);
    track.push(hubMan);

    const out: NoseConeSubMesh[] = [meshToSub("ghost-hub-body", 0x64748b, hubMan)];

    // 2. Front chamfered Trefoil Boss on z = 0..+2mm
    if (cfg.hub_fit_mode === "kidwind4_lockrev4") {
      const trefPts: Vec2[] = [];
      const NA = 84;
      for (let j = 0; j < NA; j++) {
        const theta = (j * 2 * Math.PI) / NA;
        const r = evalTrefoilRadius(
          theta,
          cfg.trefoil_center_r_mm,
          cfg.trefoil_lobe_r_mm,
          cfg.bolt_circle_mm * 0.5,
          bCount,
          0,
        );
        trefPts.push([r * Math.cos(theta), r * Math.sin(theta)]);
      }
      const trefCs = new mk.CrossSection([ensureCCW2D(trefPts)], "Positive");
      track.push(trefCs);
      const boreCircle = mk.CrossSection.circle(boreR, 32);
      track.push(boreCircle);
      const ringCs = trefCs.subtract(boreCircle);
      track.push(ringCs);
      const bossMan = ringCs.extrude(cfg.trefoil_depth_mm, 1, 0, [0.95, 0.95]);
      track.push(bossMan);
      out.push(meshToSub("ghost-hub-trefoil", 0x94a3b8, bossMan));
    }

    // 3. 3x M3 Rear Blind Socket Cap Bolts
    const boltR = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.bolt_circle_mm * 0.5 : clamp(hubR * 0.62, 6, hubR * 0.76);
    const boltProf: Vec2[] = [
      [0, -effHubLen - 3.0],
      [2.7, -effHubLen - 3.0],
      [2.7, -effHubLen],
      [1.45, -effHubLen],
      [1.45, 8.0],
      [0, 8.0],
    ];
    const boltCs = new mk.CrossSection([ensureCCW2D(boltProf)], "Positive");
    track.push(boltCs);
    const boltProto = boltCs.revolve(20);
    track.push(boltProto);

    const boltsList: Manifold[] = [];
    for (let k = 0; k < bCount; k++) {
      const ang = ((k + 0.5) * 2 * Math.PI) / bCount;
      const b = boltProto.translate([boltR * Math.cos(ang), boltR * Math.sin(ang), 0]);
      track.push(b);
      boltsList.push(b);
    }
    const boltsMan = mk.Manifold.union(boltsList);
    track.push(boltsMan);
    out.push(meshToSub("ghost-hub-bolts", 0xe8451e, boltsMan));

    return out;
  } finally {
    for (const item of track) {
      try {
        item.delete();
      } catch {}
    }
  }
}

export function computeNoseConeMetrics(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  overrides?: Partial<{
    totalTriangles: number;
    volumeCm3: number;
    isWatertight: boolean;
    isSingleSolid: boolean;
    printStatus: string;
    chordFitWarning: string | null;
  }>,
): NoseConeMetrics {
  const effHubDia = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
  const effSkirt = cfg.wrap_style === "flush" ? 0 : cfg.skirt_length_mm;
  const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
  const boltCircle = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.bolt_circle_mm : Number((effHubDia * 0.62).toFixed(1));
  const effPitch = bladeCtx.root_twist_deg + bladeCtx.collective_pitch_deg;

  const profileMeta: Record<NoseConeAeroProfile, { cd: number; boost: number }> = {
    adaptive: { cd: 0.14, boost: 18 },
    vonkarman: { cd: 0.12, boost: 11 },
    elliptical: { cd: 0.16, boost: 13 },
    bell: { cd: 0.21, boost: 21 },
  };
  const wrapBonus: Record<NoseConeWrapStyle, number> = {
    saddle: 4,
    closed: 8,
    cuff: 6,
    flush: 0,
  };
  const fairingMeta: Record<NoseConeFairingStyle, { cdDelta: number; boost: number }> = {
    none: { cdDelta: 0, boost: 0 },
    delta: { cdDelta: 0.01, boost: 5 },
    boot: { cdDelta: 0.015, boost: 7 },
    fillet: { cdDelta: 0.02, boost: 8 },
  };
  const fMeta = fairingMeta[cfg.fairing_style ?? "none"] ?? fairingMeta.none;
  const base = profileMeta[cfg.aero_profile];
  const cd = clamp(
    base.cd + (68 - cfg.cone_length_mm) * 0.0009 - wrapBonus[cfg.wrap_style] * 0.002 - fMeta.cdDelta,
    0.07,
    0.34,
  );
  const boost = Math.max(
    4,
    Math.round(
      base.boost +
        wrapBonus[cfg.wrap_style] * 0.6 +
        fMeta.boost +
        (effPitch - 14) * 0.12 +
        (bladeCtx.root_chord_mm - 60) * 0.06,
    ),
  );

  let volCm3 = overrides?.volumeCm3;
  if (volCm3 === undefined) {
    const r = effHubDia * 0.5;
    const slantArea =
      Math.PI * r * Math.sqrt(r * r + cfg.cone_length_mm * cfg.cone_length_mm) * 0.72 +
      Math.PI * effHubDia * effSkirt * 0.78;
    volCm3 = Number(((slantArea * cfg.wall_thickness_mm + bCount * 1150 + 2100) / 1000).toFixed(2));
  }
  const massG = volCm3 * 1.27; // PETG / Tough PLA density

  const fitNoteBase =
    cfg.hub_fit_mode === "kidwind4_lockrev4"
      ? `Kidwind4-LockRev4 Ø${effHubDia.toFixed(0)}mm · +${cfg.trefoil_clearance_mm.toFixed(2)}mm Trefoil slip`
      : `Auto-matched Rotor Hub Ø${effHubDia.toFixed(0)}mm (${bCount} blades)`;
  const fitNote = overrides?.chordFitWarning
    ? `${fitNoteBase} · Notice: ${overrides.chordFitWarning}`
    : `${fitNoteBase} · ${overrides?.printStatus ?? "Manifold-3D · 1 Solid · Watertight · Printable"}`;

  return {
    hub_diameter_mm: effHubDia,
    skirt_length_mm: effSkirt,
    bolt_circle_mm: boltCircle,
    nose_cd: Number(cd.toFixed(2)),
    root_flow_boost_pct: boost,
    est_mass_g: Number(massG.toFixed(1)),
    volume_cm3: volCm3,
    total_triangles: overrides?.totalTriangles ?? 0,
    is_watertight: overrides?.isWatertight ?? true,
    is_single_solid: overrides?.isSingleSolid ?? true,
    print_status: overrides?.printStatus ?? "Manifold-3D · 1 Solid · Watertight · Printable",
    hardware_label: `${bCount}× M3×30 Blind`,
    fit_note: fitNote,
  };
}

/**
 * Generates a single unified watertight CSG-printable Nose Cone solid via Manifold-3D WASM
 * (+ optional rotating blade cuffs and visual reference Kidwind4 hub).
 */
export function buildNoseConeMeshes(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
): NoseConeMeshBundle {
  const mk = requireManifoldKernel();
  const effHubDia = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
  const effHubLen = cfg.hub_fit_mode === "kidwind4_lockrev4" ? 20.0 : clamp(bladeCtx.hub_length_mm, 8, 80);

  const built = buildPrintableNoseManifold(mk, cfg, bladeCtx);
  const cuffs = buildBladeCuffManifolds(mk, cfg, bladeCtx, effHubDia, effHubLen);
  const ghostHub = buildGhostHubMeshes(mk, cfg, bladeCtx);

  const submeshes = [built.submesh];
  const totalTriangles = Math.floor(built.submesh.indices.length / 3);

  return {
    submeshes,
    cuff_submeshes: cuffs,
    ghost_hub_submeshes: ghostHub,
    metrics: computeNoseConeMetrics(cfg, bladeCtx, {
      totalTriangles,
      volumeCm3: built.metricsExtra.volume_cm3,
      isWatertight: built.metricsExtra.is_watertight,
      isSingleSolid: built.metricsExtra.is_single_solid,
      printStatus: built.metricsExtra.print_status,
      chordFitWarning: built.metricsExtra.chord_fit_warning,
    }),
  };
}

/**
 * Exports either the single-solid printable Nose Cone (with `cutaway_mode` forced false)
 * or the Rotating Blade Cuffs (`B` copies side-by-side) as binary `.STL` placed flat on `z >= 0`.
 */
export function exportNoseConeStlBytes(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  target: "cone" | "cuff" = "cone",
): Uint8Array {
  const mk = requireManifoldKernel();
  const exportCfg: NoseConeConfig = { ...cfg, cutaway_mode: false };
  const parts: { positions: Float32Array; indices: Uint32Array; offsetX: number; offsetY: number }[] = [];
  let metrics: NoseConeMetrics;

  if (target === "cuff") {
    const effHubDia =
      exportCfg.hub_fit_mode === "kidwind4_lockrev4" ? exportCfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
    const effHubLen =
      exportCfg.hub_fit_mode === "kidwind4_lockrev4" ? 20.0 : clamp(bladeCtx.hub_length_mm, 8, 80);
    const cuffs = buildBladeCuffManifolds(mk, { ...exportCfg, wrap_style: "cuff" }, bladeCtx, effHubDia, effHubLen);
    const cuffSrc = cuffs[0]!;
    const count = Math.max(1, Math.round(bladeCtx.blade_count));
    for (let k = 0; k < count; k++) {
      parts.push({
        positions: cuffSrc.positions,
        indices: cuffSrc.indices,
        offsetX: k * 34,
        offsetY: 0,
      });
    }
    metrics = computeNoseConeMetrics(exportCfg, bladeCtx);
  } else {
    const bundle = buildNoseConeMeshes(exportCfg, bladeCtx);
    metrics = bundle.metrics;
    for (const s of bundle.submeshes) {
      parts.push({ positions: s.positions, indices: s.indices, offsetX: 0, offsetY: 0 });
    }
  }

  let minZ = Infinity;
  let triCount = 0;
  for (const part of parts) {
    triCount += Math.floor(part.indices.length / 3);
    for (let i = 2; i < part.positions.length; i += 3) {
      const z = part.positions[i]!;
      if (z < minZ) minZ = z;
    }
  }
  const shiftZ = Number.isFinite(minZ) ? -minZ : 0;

  const buf = new ArrayBuffer(84 + triCount * 50);
  const view = new DataView(buf);
  const fairingTag = cfg.fairing_style && cfg.fairing_style !== "none" ? `+${cfg.fairing_style}` : "";
  const header = `BladeLab NoseCone ${cfg.aero_profile}/${cfg.wrap_style}${fairingTag} D=${metrics.hub_diameter_mm.toFixed(0)}mm 1Solid-v2`;
  for (let i = 0; i < Math.min(80, header.length); i++) {
    view.setUint8(i, header.charCodeAt(i));
  }
  view.setUint32(80, triCount, true);

  let off = 84;
  for (const part of parts) {
    const pos = part.positions;
    const idx = part.indices;
    for (let t = 0; t + 2 < idx.length; t += 3) {
      const i0 = idx[t]! * 3;
      const i1 = idx[t + 1]! * 3;
      const i2 = idx[t + 2]! * 3;
      const x0 = pos[i0]! + part.offsetX;
      const y0 = pos[i0 + 1]! + part.offsetY;
      const z0 = pos[i0 + 2]! + shiftZ;
      const x1 = pos[i1]! + part.offsetX;
      const y1 = pos[i1 + 1]! + part.offsetY;
      const z1 = pos[i1 + 2]! + shiftZ;
      const x2 = pos[i2]! + part.offsetX;
      const y2 = pos[i2 + 1]! + part.offsetY;
      const z2 = pos[i2 + 2]! + shiftZ;

      const ux = x1 - x0;
      const uy = y1 - y0;
      const uz = z1 - z0;
      const vx = x2 - x0;
      const vy = y2 - y0;
      const vz = z2 - z0;
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz);
      if (len > 1e-12) {
        nx /= len;
        ny /= len;
        nz /= len;
      }

      view.setFloat32(off, nx, true);
      view.setFloat32(off + 4, ny, true);
      view.setFloat32(off + 8, nz, true);
      view.setFloat32(off + 12, x0, true);
      view.setFloat32(off + 16, y0, true);
      view.setFloat32(off + 20, z0, true);
      view.setFloat32(off + 24, x1, true);
      view.setFloat32(off + 28, y1, true);
      view.setFloat32(off + 32, z1, true);
      view.setFloat32(off + 36, x2, true);
      view.setFloat32(off + 40, y2, true);
      view.setFloat32(off + 44, z2, true);
      view.setUint16(off + 48, 0, true);
      off += 50;
    }
  }

  return new Uint8Array(buf);
}

/**
 * Computes NACA 4412 upper & lower points in local frame (for fallback 2D cutout preview).
 */
function nacaContourParts2D(chord: number, pitchRad: number, cx: number, cy: number, growPx = 0) {
  const samples = 24;
  const m = 0.04;
  const p = 0.4;
  const t = 0.14;
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);
  const upper: [number, number][] = [];
  const lower: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const xc = 0.5 * (1 - Math.cos((Math.PI * i) / samples));
    const yt =
      5 *
      t *
      (0.2969 * Math.sqrt(xc) - 0.126 * xc - 0.3516 * xc * xc + 0.2843 * xc ** 3 - 0.1015 * xc ** 4);
    const yc =
      xc < p
        ? (m / (p * p)) * (2 * p * xc - xc * xc)
        : (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * xc - xc * xc);
    const lx = (xc - 0.35) * chord;
    const uy = -(yc + yt) * chord - growPx;
    const ly = -(yc - yt) * chord + growPx;
    upper.push([cx + lx * cosP - uy * sinP, cy + lx * sinP + uy * cosP]);
    lower.push([cx + lx * cosP - ly * sinP, cy + lx * sinP + ly * cosP]);
  }
  return { upper, lower, all: upper.concat([...lower].reverse()) };
}

/**
 * Renders the dual-pane animated 2D aero flow + radial wrap-cutout blueprint onto an HTML5 Canvas.
 */
export function drawNoseConeBlueprint2D(
  canvas: HTMLCanvasElement,
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  phase: number,
  themeMode: "atelier" | "dark",
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const w = canvas.clientWidth || 340;
  const h = canvas.clientHeight || 172;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const isLight = themeMode === "atelier";
  const cTheme = {
    fg: isLight ? "#18181b" : "#f1f5f9",
    muted: isLight ? "#475569" : "#94a3b8",
    card: isLight ? "#ffffff" : "#0b0e15",
    border: isLight ? "#cbd5e1" : "rgba(255,255,255,0.12)",
    primary: isLight ? "#1d4ed8" : "#22d3ee",
    warn: isLight ? "#e8451e" : "#fbbf24",
    ok: isLight ? "#047857" : "#34d399",
    hubFill: isLight ? "rgba(100,116,139,0.20)" : "rgba(148,163,184,0.20)",
    hubStroke: isLight ? "#475569" : "#94a3b8",
  };

  const effHubDia = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
  const effHubR = effHubDia * 0.5;
  const effPitchDeg = bladeCtx.root_twist_deg + bladeCtx.collective_pitch_deg;
  const slideFrac = cfg.assembly_slide_pct / 100;

  // Left 57%: Side Aero Streamlines + Assembly Slide
  const splitX = Math.round(w * 0.57);
  const s = Math.min(1.5, (splitX * 0.44) / Math.max(55, cfg.cone_length_mm * 0.9));
  const cy = h * 0.56;
  const z0X = splitX * 0.65;
  const hubW = 20 * s;
  const hubR = effHubR * s;
  const skirtOuterR = (effHubR + cfg.wall_thickness_mm) * s;
  const effSkirt = cfg.wrap_style === "flush" ? 0 : cfg.skirt_length_mm;
  const coneOffsetX = cfg.wrap_style === "saddle" || cfg.wrap_style === "flush" ? -slideFrac * 24 * s : 0;
  const bladePullY = cfg.wrap_style === "closed" || cfg.wrap_style === "cuff" ? slideFrac * 20 * s : 0;

  const coneNoseX = z0X - cfg.cone_length_mm * s + coneOffsetX;
  const skirtEndX = z0X + effSkirt * s + coneOffsetX;

  ctx.save();
  ctx.font = "600 10px ui-monospace, monospace";
  ctx.fillStyle = cTheme.fg;
  ctx.fillText("Side Aero + Slide", 8, 14);

  // Hub box + front trefoil boss
  ctx.fillStyle = cTheme.hubFill;
  ctx.strokeStyle = cTheme.hubStroke;
  ctx.lineWidth = 1.3;
  ctx.fillRect(z0X, cy - hubR, hubW, hubR * 2);
  ctx.strokeRect(z0X, cy - hubR, hubW, hubR * 2);
  if (cfg.hub_fit_mode === "kidwind4_lockrev4") {
    ctx.fillRect(z0X - 2 * s, cy - 24 * s, 2 * s, 48 * s);
  }

  // Rear M3 Blind Bolt
  const boltY = cy + (cfg.hub_fit_mode === "kidwind4_lockrev4" ? 20 * s : hubR * 0.62);
  ctx.fillStyle = cTheme.warn;
  ctx.fillRect(z0X - 9 * s + coneOffsetX, boltY - 1.2 * s, hubW + 12 * s - coneOffsetX, 2.4 * s);

  // Nose + Skirt Envelope
  const noseCurve = (xPos: number) => {
    const tNose = clamp((xPos - coneNoseX) / Math.max(1, cfg.cone_length_mm * s), 0, 1);
    return evalNoseProfileRadius(cfg.aero_profile, tNose, effHubR + cfg.wall_thickness_mm, 0, bladeCtx.root_chord_mm, effPitchDeg) * s;
  };
  ctx.fillStyle = isLight ? "rgba(29,78,216,0.16)" : "rgba(34,211,238,0.16)";
  ctx.strokeStyle = cTheme.primary;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(coneNoseX, cy);
  for (let x = coneNoseX; x <= z0X + coneOffsetX; x += 2) ctx.lineTo(x, cy - noseCurve(x));
  ctx.lineTo(skirtEndX, cy - skirtOuterR);
  ctx.lineTo(skirtEndX, cy + skirtOuterR);
  for (let x = z0X + coneOffsetX; x >= coneNoseX; x -= 2) ctx.lineTo(x, cy + noseCurve(x));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Upper blade stub at Z=10mm
  const bx = z0X + 10 * s;
  const bladeStartY = cy - hubR - bladePullY;
  const bladeTopY = Math.max(18, bladeStartY - 26 * s);
  ctx.fillStyle = isLight ? "rgba(29,78,216,0.25)" : "rgba(34,211,238,0.28)";
  ctx.strokeStyle = cTheme.primary;
  ctx.fillRect(bx - 5 * s, bladeTopY, 10 * s, bladeStartY - bladeTopY);
  ctx.strokeRect(bx - 5 * s, bladeTopY, 10 * s, bladeStartY - bladeTopY);
  if (cfg.wrap_style === "cuff") {
    ctx.fillStyle = cTheme.warn;
    ctx.fillRect(bx - 7 * s, bladeStartY - 4 * s, 14 * s, 4 * s);
  }

  // Animated wind streamlines
  ctx.setLineDash([5, 5]);
  ctx.lineDashOffset = -phase * 22;
  for (let l = 0; l < 3; l++) {
    ctx.strokeStyle = l === 0 ? cTheme.ok : cTheme.primary;
    ctx.globalAlpha = l === 0 ? 0.9 : 0.45;
    ctx.lineWidth = l === 0 ? 1.4 : 1.0;
    ctx.beginPath();
    for (let px = 6; px <= splitX - 8; px += 4) {
      let yy = cy - 8 - l * 10;
      if (px > coneNoseX - 8) {
        const rS = px <= z0X + coneOffsetX ? noseCurve(px) : skirtOuterR;
        yy = Math.min(yy, cy - rS - (5 + l * 5));
      }
      if (px === 6) ctx.moveTo(px, yy);
      else ctx.lineTo(px, yy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Right 43%: Radial Cutout Blueprint
  ctx.save();
  ctx.strokeStyle = cTheme.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(splitX, 8);
  ctx.lineTo(splitX, h - 8);
  ctx.stroke();

  const rw = w - splitX;
  const rcx = splitX + rw * 0.5;
  const rcy = h * 0.55;
  const rs = Math.min(rw, h) / 48;

  ctx.font = "600 10px ui-monospace, monospace";
  ctx.fillStyle = cTheme.fg;
  ctx.fillText("Skirt Cutout", splitX + 8, 14);

  const skirtL = rcx - 10 * rs * 1.4;
  const skirtR = rcx + 10 * rs * 1.4;
  ctx.fillStyle = isLight ? "rgba(29,78,216,0.08)" : "rgba(34,211,238,0.08)";
  ctx.fillRect(skirtL, 24, skirtR - skirtL, h - 42);

  const chordPx = 18 * rs;
  const gapPx = cfg.blade_clearance_mm * rs * 2.0;
  const pitchRad = (clamp(effPitchDeg, -35, 55) * Math.PI) / 180;

  if (cfg.wrap_style === "saddle") {
    const { upper, lower } = nacaContourParts2D(chordPx, pitchRad, rcx, rcy, gapPx);
    let topIdx = 0;
    for (let i = 1; i < upper.length; i++) if (upper[i]![1] < upper[topIdx]![1]) topIdx = i;
    let botIdx = 0;
    for (let i = 1; i < lower.length; i++) if (lower[i]![1] > lower[botIdx]![1]) botIdx = i;
    ctx.fillStyle = cTheme.card;
    ctx.strokeStyle = cTheme.warn;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(skirtR + 4, upper[topIdx]![1]);
    for (let i = topIdx; i >= 0; i--) ctx.lineTo(upper[i]![0], upper[i]![1]);
    for (let i = 0; i <= botIdx; i++) ctx.lineTo(lower[i]![0], lower[i]![1]);
    ctx.lineTo(skirtR + 4, lower[botIdx]![1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (cfg.wrap_style === "closed") {
    const hole = nacaContourParts2D(chordPx, pitchRad, rcx, rcy, gapPx).all;
    ctx.fillStyle = cTheme.card;
    ctx.strokeStyle = cTheme.ok;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    hole.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (cfg.wrap_style === "cuff") {
    const cR = chordPx * 0.56;
    ctx.fillStyle = cTheme.card;
    ctx.strokeStyle = cTheme.warn;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(rcx, rcy, cR + gapPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = cTheme.warn;
    ctx.beginPath();
    ctx.arc(rcx, rcy, cR, 0, Math.PI * 2);
    ctx.stroke();
  }

  const af = nacaContourParts2D(chordPx, pitchRad, rcx, rcy, 0).all;
  ctx.fillStyle = isLight ? "rgba(29,78,216,0.26)" : "rgba(34,211,238,0.28)";
  ctx.strokeStyle = cTheme.primary;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  af.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw swept blade-root fairing triangle/fillet footprint when active
  const fStyle = cfg.fairing_style ?? "none";
  if (fStyle !== "none") {
    const blend = clamp((cfg.fairing_blend_pct ?? 35) / 100, 0, 1);
    const spanVis = clamp((cfg.fairing_span_mm ?? 26) / 48, 0.25, 1) * rs * 13;
    const tePt = af[0]!;
    const midLow = af[Math.floor(af.length * 0.72)]!;
    const rootTipX = skirtR + spanVis;
    ctx.fillStyle = isLight ? "rgba(232,69,30,0.20)" : "rgba(251,191,36,0.22)";
    ctx.strokeStyle = cTheme.warn;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tePt[0], tePt[1]);
    ctx.quadraticCurveTo(
      tePt[0] + spanVis * (0.45 + 0.25 * blend),
      tePt[1] - (tePt[1] - midLow[1]) * (0.25 + 0.45 * blend),
      rootTipX,
      tePt[1] - 4 * rs,
    );
    ctx.lineTo(midLow[0], midLow[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (fStyle === "boot" || fStyle === "fillet") {
      const lePt = af[Math.floor(af.length * 0.48)]!;
      ctx.beginPath();
      ctx.moveTo(lePt[0], lePt[1]);
      ctx.quadraticCurveTo(lePt[0] + spanVis * 0.4, lePt[1] + 2 * rs, skirtR + spanVis * 0.65, lePt[1] + 2.5 * rs);
      ctx.lineTo(af[Math.floor(af.length * 0.28)]![0], af[Math.floor(af.length * 0.28)]![1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.font = "400 9.5px ui-monospace, monospace";
  ctx.fillStyle = cTheme.muted;
  ctx.textAlign = "center";
  ctx.fillText(`Z=0..${effSkirt.toFixed(0)}mm`, rcx, h - 6);
  ctx.restore();
  ctx.restore();
}
