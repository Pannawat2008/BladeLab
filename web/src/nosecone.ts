// Parametric Aerodynamic Nose Cone & Kidwind4-LockRev4 Hub Fit Builder (T-105)
// Pure TypeScript geometry, binary STL exporter, and 2D blueprint canvas renderer.
// Watertight manifold shell + self-centering 3-lobe trefoil pocket + blind M3 bosses.

export type NoseConeAeroProfile = "adaptive" | "vonkarman" | "elliptical" | "bell";
export type NoseConeWrapStyle = "saddle" | "closed" | "cuff" | "flush";
export type NoseConeHubFitMode = "kidwind4_lockrev4" | "match_design";
export type NoseConeViewMode = "mounted" | "cone_only" | "rear_fit";

export interface NoseConeConfig {
  enabled: boolean;
  hub_fit_mode: NoseConeHubFitMode;
  aero_profile: NoseConeAeroProfile;
  wrap_style: NoseConeWrapStyle;
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

export interface NoseConeBladeContext {
  blade_count: number;
  hub_diameter_mm: number;
  hub_length_mm: number;
  hub_bore_mm: number;
  root_chord_mm: number;
  root_twist_deg: number;
  collective_pitch_deg: number;
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
  total_triangles: number;
  hardware_label: string;
  fit_note: string;
}

export interface NoseConeMeshBundle {
  submeshes: NoseConeSubMesh[];
  cuff_submeshes: NoseConeSubMesh[];
  ghost_hub_submeshes: NoseConeSubMesh[];
  metrics: NoseConeMetrics;
}

export function defaultNoseConeConfig(): NoseConeConfig {
  return {
    enabled: true,
    hub_fit_mode: "kidwind4_lockrev4",
    aero_profile: "adaptive",
    wrap_style: "saddle",
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
    const rampMask = Math.exp(-(minDeltaTheta * minDeltaTheta) / (0.34 * 0.34));
    const pitchBoost = clamp((effPitchDeg - 6) / 28, 0, 1.2);
    const chordBoost = clamp((rootChordMm - 30) / 65, 0, 1.2);
    const adaptiveAdd =
      Math.pow(c, 2.4) * (0.9 + 2.4 * rampMask * (0.55 + 0.3 * chordBoost + 0.25 * pitchBoost));
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

/**
 * Computes root-section NACA 4412 signed distance approximation (mm) in `(ds = baseR * dTheta, dz = z - zBlade)`
 * for clean skirt cutout masking.
 */
function airfoilCutoutNormalizedDist(
  dsMm: number,
  dzMm: number,
  rootChordMm: number,
  pitchDeg: number,
  clearanceMm: number,
): number {
  // Clamp visual/skirt root neck chord inside reasonable printable socket bounds on a Ø60 hub
  const neckChord = clamp(rootChordMm * 0.44, 18, 38);
  const halfC = neckChord * 0.5;
  const rad = (clamp(pitchDeg, -35, 55) * Math.PI) / 180;
  const cosP = Math.cos(rad);
  const sinP = Math.sin(rad);

  // Rotate (dz = axial chord axis, ds = thickness direction) into airfoil frame
  const xcLocal = dzMm * cosP + dsMm * sinP;
  const ytLocal = -dzMm * sinP + dsMm * cosP;

  // Normalized chord u in [-0.42, 0.58] (centered near 0.38c pitch axis)
  const u = (xcLocal + 0.38 * neckChord) / neckChord;
  if (u >= 0 && u <= 1) {
    const t = 0.145;
    const halfThick =
      5 * t * (0.2969 * Math.sqrt(Math.max(1e-5, u)) - 0.126 * u - 0.3516 * u * u + 0.2843 * u * u * u - 0.1015 * u * u * u * u) * neckChord;
    const allowY = Math.max(2.6, halfThick + clearanceMm);
    const dyRatio = Math.abs(ytLocal) / allowY;
    const dxEdge = Math.min(u, 1 - u) * neckChord;
    if (dxEdge < clearanceMm) {
      return Math.hypot(clearanceMm - dxEdge, Math.max(0, Math.abs(ytLocal) - halfThick)) / Math.max(0.5, clearanceMm);
    }
    return dyRatio;
  }

  const endDist = u < 0 ? -u * neckChord : (u - 1) * neckChord;
  const baseThick = u < 0 ? 1.8 : 0.9;
  const radialOut = Math.hypot(endDist, Math.max(0, Math.abs(ytLocal) - baseThick));
  return radialOut / Math.max(2.5, clearanceMm + 2.2);
}

interface SubMeshBuilder {
  positions: number[];
  indices: number[];
  addVert(x: number, y: number, z: number): number;
  addTri(a: number, b: number, c: number): void;
}

function createSubMeshBuilder(): SubMeshBuilder {
  const positions: number[] = [];
  const indices: number[] = [];
  return {
    positions,
    indices,
    addVert(x: number, y: number, z: number): number {
      const idx = positions.length / 3;
      positions.push(x, y, z);
      return idx;
    },
    addTri(a: number, b: number, c: number): void {
      if (a === b || b === c || a === c) return;
      indices.push(a, b, c);
    },
  };
}

function buildMaskedThickShell(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  effHubDiameterMm: number,
): NoseConeSubMesh {
  const baseR = effHubDiameterMm * 0.5;
  const effSkirtLen = cfg.wrap_style === "flush" ? 0 : clamp(cfg.skirt_length_mm, 8, Math.max(10, bladeCtx.hub_length_mm + 2));
  const coneLen = clamp(cfg.cone_length_mm, 30, 140);
  const wall = clamp(cfg.wall_thickness_mm, 1.2, 5.0);
  const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
  const clearance = clamp(cfg.blade_clearance_mm, 0.2, 1.5);
  const effPitch = bladeCtx.root_twist_deg + bladeCtx.collective_pitch_deg;

  const NA = 120;
  const N_SKIRT = cfg.wrap_style === "flush" ? 0 : 16;
  const N_NOSE = 26;
  const NZ = N_SKIRT + N_NOSE; // total vertex rings; grid quads = (NZ - 1) x NA

  // Build monotonic z levels: row 0 = -effSkirtLen .. row N_SKIRT = 0 .. row NZ-1 = near apex
  const zVals: number[] = [];
  for (let i = 0; i < N_SKIRT; i++) {
    zVals.push(-effSkirtLen + (i / N_SKIRT) * effSkirtLen);
  }
  for (let i = 0; i < N_NOSE; i++) {
    // Last vertex ring sits cleanly near the apex so apex fan has finite triangle span
    const t = (i / N_NOSE) * 0.96;
    zVals.push(t * coneLen);
  }

  // Locate blade radial axis along hub midpoint (z = -hubLen/2 in local coords -> z_hub = 10mm)
  const effHubLen = cfg.hub_fit_mode === "kidwind4_lockrev4" ? 20.0 : bladeCtx.hub_length_mm;
  const zBlade = -clamp(effHubLen * 0.5, 4, Math.max(4.5, effSkirtLen - 3));
  const cuffHoleR = clamp(bladeCtx.root_chord_mm * 0.22, 9, 15.5) + clearance;

  const qZ = NZ - 1;
  const active: boolean[][] = Array.from({ length: qZ }, () => Array<boolean>(NA).fill(true));
  const filletBoost: number[][] = Array.from({ length: NZ }, () => Array<number>(NA).fill(0));

  const bladeAngles: number[] = [];
  for (let k = 0; k < bCount; k++) {
    bladeAngles.push((k * 2 * Math.PI) / bCount);
  }

  const evalCellDist = (zMid: number, thetaMid: number) => {
    let minNorm = Infinity;
    let minDelta = Math.PI;
    for (const ba of bladeAngles) {
      const dTheta = shortestAngleDiff(thetaMid, ba);
      minDelta = Math.min(minDelta, Math.abs(dTheta));
      if (Math.abs(dTheta) < 1.15) {
        const dsMm = baseR * dTheta;
        const dzMm = zMid - zBlade;
        if (cfg.wrap_style === "cuff") {
          const rDist = Math.hypot(dsMm, dzMm);
          minNorm = Math.min(minNorm, rDist / Math.max(4, cuffHoleR));
        } else if (cfg.wrap_style === "closed" || cfg.wrap_style === "saddle") {
          const nd = airfoilCutoutNormalizedDist(dsMm, dzMm, bladeCtx.root_chord_mm, effPitch, clearance);
          minNorm = Math.min(minNorm, nd);
        }
      }
    }
    return { minNorm, minDelta };
  };

  if (cfg.wrap_style !== "flush") {
    // First pass: mark airfoil / socket cutouts (strictly leaving top nose cap rows solid)
    for (let i = 0; i < qZ - 4; i++) {
      const zMid = 0.5 * (zVals[i]! + zVals[i + 1]!);
      if (zMid > 3.5) continue; // Keep forward windward dome untouched!
      for (let j = 0; j < NA; j++) {
        const thetaMid = ((j + 0.5) * 2 * Math.PI) / NA;
        const { minNorm } = evalCellDist(zMid, thetaMid);
        if (minNorm < 1.0) {
          active[i]![j] = false;
        }
      }
    }

    // Rear-Open Saddle: sweep any cutout column straight open down to the back edge (i = 0)
    if (cfg.wrap_style === "saddle") {
      for (let j = 0; j < NA; j++) {
        let highestCutRow = -1;
        for (let i = 0; i < N_SKIRT; i++) {
          if (!active[i]![j]) highestCutRow = Math.max(highestCutRow, i);
        }
        if (highestCutRow >= 0) {
          for (let i = 0; i <= highestCutRow; i++) {
            active[i]![j] = false;
          }
        }
      }
    }

    // Eliminate diagonal checkerboards ([T,F; F,T] or [F,T; T,F]) and single-cell islands for guaranteed manifold topology
    let changed = true;
    let passes = 0;
    while (changed && passes < 16) {
      changed = false;
      passes++;
      for (let i = 0; i < qZ - 1; i++) {
        for (let j = 0; j < NA; j++) {
          const jNext = (j + 1) % NA;
          const a = active[i]![j]!;
          const b = active[i]![jNext]!;
          const c = active[i + 1]![j]!;
          const d = active[i + 1]![jNext]!;
          if (a === d && b === c && a !== b) {
            // Fill the false diagonal cell so boundary loops remain strictly disjoint simple cycles
            if (!a) active[i]![j] = true;
            else active[i]![jNext] = true;
            changed = true;
          }
        }
      }
    }
  }

  // Compute vertex-level fillet boost for Closed Window + Blade-Adaptive blend
  for (let i = 0; i < NZ; i++) {
    const z = zVals[i]!;
    for (let j = 0; j < NA; j++) {
      const theta = (j * 2 * Math.PI) / NA;
      const { minNorm } = evalCellDist(z, theta);
      if (cfg.wrap_style === "closed" && minNorm >= 0.95 && minNorm < 1.65) {
        const w = 1 - (minNorm - 0.95) / 0.7;
        filletBoost[i]![j] = 2.2 * Math.sin(clamp(w, 0, 1) * Math.PI * 0.5);
      }
    }
  }

  const builder = createSubMeshBuilder();
  const outerVert: number[][] = Array.from({ length: NZ }, () => Array<number>(NA).fill(-1));
  const innerVert: number[][] = Array.from({ length: NZ }, () => Array<number>(NA).fill(-1));

  for (let i = 0; i < NZ; i++) {
    const z = zVals[i]!;
    const cosArr: number[] = [];
    const sinArr: number[] = [];
    for (let j = 0; j < NA; j++) {
      const theta = (j * 2 * Math.PI) / NA;
      cosArr.push(Math.cos(theta));
      sinArr.push(Math.sin(theta));
    }

    for (let j = 0; j < NA; j++) {
      const theta = (j * 2 * Math.PI) / NA;
      let minDelta = Math.PI;
      for (const ba of bladeAngles) {
        minDelta = Math.min(minDelta, Math.abs(shortestAngleDiff(theta, ba)));
      }

      let rOut = baseR + wall;
      let rIn = baseR + 0.25;

      if (z < 0) {
        // Skirt region wrapping over hub (smooth outer blend from baseR+wall at z=0 down slightly toward rear edge)
        const rearFrac = Math.abs(z) / Math.max(1, effSkirtLen);
        let adaptiveSkirtAdd = 0;
        if (cfg.aero_profile === "adaptive") {
          const ramp = Math.exp(-(minDelta * minDelta) / (0.34 * 0.34));
          const pitchBoost = clamp((effPitch - 6) / 28, 0, 1.2);
          const chordBoost = clamp((bladeCtx.root_chord_mm - 30) / 65, 0, 1.2);
          adaptiveSkirtAdd = (0.9 + 2.4 * ramp * (0.55 + 0.3 * chordBoost + 0.25 * pitchBoost)) * (1 - 0.35 * rearFrac);
        }
        rIn = baseR + 0.25;
        rOut = rIn + wall + adaptiveSkirtAdd + filletBoost[i]![j]!;
      } else {
        // Forward aerodynamic cone region (t in [0..0.96], vertex i = NZ-1 matches t = 0.96!)
        const cNose = clamp(1 - z / coneLen, 0, 1); // 1 at base z=0, 0.04 near apex
        const rSurface = evalNoseProfileRadius(
          cfg.aero_profile,
          cNose,
          baseR + 0.25 + wall,
          minDelta,
          bladeCtx.root_chord_mm,
          effPitch,
        );
        rOut = rSurface + filletBoost[i]![j]!;
        const innerWallR = z < 1.5 ? baseR + 0.25 : Math.max(0.9, rOut - wall);
        rIn = Math.min(rOut - 0.85, innerWallR);
        // Shrink last ring smoothly just short of apex
        if (i === NZ - 1) {
          rOut = Math.max(2.6, rOut);
          rIn = Math.max(0.7, rOut - wall * 0.72);
        }
      }

      outerVert[i]![j] = builder.addVert(rOut * cosArr[j]!, rOut * sinArr[j]!, z);
      innerVert[i]![j] = builder.addVert(rIn * cosArr[j]!, rIn * sinArr[j]!, z);
    }
  }

  const outerApexIdx = builder.addVert(0, 0, coneLen);
  const innerApexIdx = builder.addVert(0, 0, Math.max(4.0, coneLen - Math.max(wall, 2.6)));

  // 1. Emit active outer & inner quads + exposed boundary walls
  for (let i = 0; i < qZ; i++) {
    for (let j = 0; j < NA; j++) {
      if (!active[i]![j]) continue;
      const jNext = (j + 1) % NA;

      const o00 = outerVert[i]![j]!;
      const o01 = outerVert[i]![jNext]!;
      const o11 = outerVert[i + 1]![jNext]!;
      const o10 = outerVert[i + 1]![j]!;

      const i00 = innerVert[i]![j]!;
      const i01 = innerVert[i]![jNext]!;
      const i11 = innerVert[i + 1]![jNext]!;
      const i10 = innerVert[i + 1]![j]!;

      // Outer face (+R outward): o00 -> o01 -> o11, o00 -> o11 -> o10
      builder.addTri(o00, o01, o11);
      builder.addTri(o00, o11, o10);

      // Inner face (-R outward): reversed winding
      builder.addTri(i00, i11, i01);
      builder.addTri(i00, i10, i11);

      // Helper to emit a watertight boundary side-wall quad for outer directed edge (a -> b)
      const capBoundary = (oa: number, ob: number, ia: number, ib: number) => {
        builder.addTri(oa, ib, ob);
        builder.addTri(oa, ia, ib);
      };

      // Bottom edge (o00 -> o01)
      if (i === 0 || !active[i - 1]![j]) {
        capBoundary(o00, o01, i00, i01);
      }
      // Top edge (o11 -> o10)
      if (i + 1 < qZ && !active[i + 1]![j]) {
        capBoundary(o11, o10, i11, i10);
      }
      // Right edge (o01 -> o11)
      if (!active[i]![jNext]) {
        capBoundary(o01, o11, i01, i11);
      }
      // Left edge (o10 -> o00)
      const jPrev = (j - 1 + NA) % NA;
      if (!active[i]![jPrev]) {
        capBoundary(o10, o00, i10, i00);
      }
    }
  }

  // 2. Cap outer & inner nose apex fans (all cells in top row qZ - 1 are strictly active)
  const topRow = NZ - 1;
  for (let j = 0; j < NA; j++) {
    const jNext = (j + 1) % NA;
    builder.addTri(outerVert[topRow]![j]!, outerVert[topRow]![jNext]!, outerApexIdx);
    builder.addTri(innerVert[topRow]![j]!, innerApexIdx, innerVert[topRow]![jNext]!);
  }

  return {
    id: "nose-shell",
    color_hex: 0x2563eb,
    positions: new Float32Array(builder.positions),
    indices: new Uint32Array(builder.indices),
  };
}

/**
 * Watertight 3-lobe trefoil alignment sleeve seated flush inside `z = 0..trefoilDepth + 1.4mm`
 * so the nose cone self-centers onto `Kidwind4-LockRev4.step`'s front chamfered trefoil boss.
 */
function buildTrefoilCollarMesh(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  effHubDiameterMm: number,
): NoseConeSubMesh {
  const baseR = effHubDiameterMm * 0.5;
  const builder = createSubMeshBuilder();
  const NA = 120;
  const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
  const depth = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.trefoil_depth_mm : Math.min(3.5, cfg.trefoil_depth_mm);
  const topZ = depth + 1.5;
  const outerR = baseR + 0.35; // cleanly overlaps inner wall of nose shell

  const zRings = [0, 0.55, topZ];
  const outerIdx: number[][] = [];
  const innerIdx: number[][] = [];

  for (let rz = 0; rz < zRings.length; rz++) {
    const z = zRings[rz]!;
    const oRow: number[] = [];
    const iRow: number[] = [];
    const chamferAdd = rz === 0 ? 0.55 : 0;
    for (let j = 0; j < NA; j++) {
      const theta = (j * 2 * Math.PI) / NA;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      let rPocket = baseR * 0.45;
      if (cfg.hub_fit_mode === "kidwind4_lockrev4") {
        rPocket = evalTrefoilRadius(
          theta,
          cfg.trefoil_center_r_mm,
          cfg.trefoil_lobe_r_mm,
          cfg.bolt_circle_mm * 0.5,
          bCount,
          cfg.trefoil_clearance_mm + chamferAdd,
        );
      } else {
        rPocket = Math.max(3.0, bladeCtx.hub_bore_mm * 0.5 + cfg.trefoil_clearance_mm + chamferAdd);
      }
      rPocket = Math.min(outerR - 1.5, rPocket);

      oRow.push(builder.addVert(outerR * cosT, outerR * sinT, z));
      iRow.push(builder.addVert(rPocket * cosT, rPocket * sinT, z));
    }
    outerIdx.push(oRow);
    innerIdx.push(iRow);
  }

  for (let rz = 0; rz < zRings.length - 1; rz++) {
    for (let j = 0; j < NA; j++) {
      const jNext = (j + 1) % NA;
      // Outer surface (+R)
      builder.addTri(outerIdx[rz]![j]!, outerIdx[rz]![jNext]!, outerIdx[rz + 1]![jNext]!);
      builder.addTri(outerIdx[rz]![j]!, outerIdx[rz + 1]![jNext]!, outerIdx[rz + 1]![j]!);
      // Inner pocket surface (-R)
      builder.addTri(innerIdx[rz]![j]!, innerIdx[rz + 1]![jNext]!, innerIdx[rz]![jNext]!);
      builder.addTri(innerIdx[rz]![j]!, innerIdx[rz + 1]![j]!, innerIdx[rz + 1]![jNext]!);
    }
  }

  const lastZ = zRings.length - 1;
  for (let j = 0; j < NA; j++) {
    const jNext = (j + 1) % NA;
    // Bottom face (-Z normal)
    builder.addTri(innerIdx[0]![j]!, innerIdx[0]![jNext]!, outerIdx[0]![jNext]!);
    builder.addTri(innerIdx[0]![j]!, outerIdx[0]![jNext]!, outerIdx[0]![j]!);
    // Top face (+Z normal)
    builder.addTri(innerIdx[lastZ]![j]!, outerIdx[lastZ]![jNext]!, innerIdx[lastZ]![jNext]!);
    builder.addTri(innerIdx[lastZ]![j]!, outerIdx[lastZ]![j]!, outerIdx[lastZ]![jNext]!);
  }

  return {
    id: "trefoil-pocket-ring",
    color_hex: 0xf59e0b,
    positions: new Float32Array(builder.positions),
    indices: new Uint32Array(builder.indices),
  };
}

/**
 * Builds watertight captive blind M3 nut-boss towers inside the spinner (`60°` offset from blades)
 * so M3 socket screws enter from the rear of the hub with ZERO windward fastener holes.
 */
function buildBlindM3Bosses(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  effHubDiameterMm: number,
): NoseConeSubMesh {
  const builder = createSubMeshBuilder();
  const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
  const boltR =
    cfg.hub_fit_mode === "kidwind4_lockrev4"
      ? cfg.bolt_circle_mm * 0.5
      : clamp(effHubDiameterMm * 0.31, 6, effHubDiameterMm * 0.38);
  const segs = 20;
  const maxBossH = clamp(cfg.cone_length_mm * 0.42, 8.5, 14.5);
  const startZ = 0.05;
  const blindTopZ = maxBossH - 2.6;
  const bossOutR = 4.5;
  const threadR = 1.48; // Ø2.96mm M3 tap / captive M3 heat-insert / nut step

  // Closed axisymmetric cross-section: outer wall bottom->top -> top pole -> inner blind ceiling -> inner bore bottom->base
  const prof: [number, number][] = [
    [threadR, startZ],
    [bossOutR, startZ],
    [bossOutR, maxBossH],
    [0, maxBossH], // top outer pole
    [0, blindTopZ], // inner blind roof pole
    [threadR, blindTopZ],
  ];

  for (let k = 0; k < bCount; k++) {
    const ang = ((k + 0.5) * 2 * Math.PI) / bCount;
    const cx = boltR * Math.cos(ang);
    const cy = boltR * Math.sin(ang);

    const ringIdx: number[][] = [];
    let topPoleIdx = -1;
    let blindPoleIdx = -1;

    for (let pi = 0; pi < prof.length; pi++) {
      const [pr, pz] = prof[pi]!;
      if (pr === 0) {
        if (pi === 3) topPoleIdx = builder.addVert(cx, cy, pz);
        else blindPoleIdx = builder.addVert(cx, cy, pz);
        ringIdx.push([]);
      } else {
        const row: number[] = [];
        for (let s = 0; s < segs; s++) {
          const a = (s * 2 * Math.PI) / segs;
          row.push(builder.addVert(cx + pr * Math.cos(a), cy + pr * Math.sin(a), pz));
        }
        ringIdx.push(row);
      }
    }

    // Bottom cap (ring 0 [threadR] -> ring 1 [bossOutR], normal -Z)
    for (let s = 0; s < segs; s++) {
      const sNext = (s + 1) % segs;
      builder.addTri(ringIdx[0]![s]!, ringIdx[0]![sNext]!, ringIdx[1]![sNext]!);
      builder.addTri(ringIdx[0]![s]!, ringIdx[1]![sNext]!, ringIdx[1]![s]!);

      // Outer boss wall (ring 1 -> ring 2, normal +R)
      builder.addTri(ringIdx[1]![s]!, ringIdx[1]![sNext]!, ringIdx[2]![sNext]!);
      builder.addTri(ringIdx[1]![s]!, ringIdx[2]![sNext]!, ringIdx[2]![s]!);

      // Top boss cap fan (ring 2 -> topPoleIdx, normal +Z)
      builder.addTri(ringIdx[2]![s]!, ringIdx[2]![sNext]!, topPoleIdx);

      // Inner blind ceiling fan (ring 5 -> blindPoleIdx, normal -Z pointing into blind hole)
      builder.addTri(ringIdx[5]![s]!, blindPoleIdx, ringIdx[5]![sNext]!);

      // Inner M3 pilot bore wall (ring 0 [startZ] -> ring 5 [blindTopZ], normal -R pointing inward)
      builder.addTri(ringIdx[0]![s]!, ringIdx[5]![sNext]!, ringIdx[0]![sNext]!);
      builder.addTri(ringIdx[0]![s]!, ringIdx[5]![s]!, ringIdx[5]![sNext]!);
    }
  }

  return {
    id: "m3-blind-bosses",
    color_hex: 0x0ea5e9,
    positions: new Float32Array(builder.positions),
    indices: new Uint32Array(builder.indices),
  };
}

/**
 * Watertight circular rotating blade-base cuffs for `wrap_style === "cuff"`,
 * sized to nest cleanly inside the circular spinner socket openings with `blade_clearance_mm`.
 */
function buildBladeCuffMeshes(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
): NoseConeSubMesh[] {
  if (cfg.wrap_style !== "cuff") return [];
  const builder = createSubMeshBuilder();
  const cuffR = clamp(bladeCtx.root_chord_mm * 0.22, 9, 15.5);
  const dowelHoleR = 2.55; // Ø5.1mm slip fit over Ø4.9-5.0mm blade root dowel
  const thickness = clamp(cfg.wall_thickness_mm + 1.4, 2.8, 5.2);
  const segs = 28;

  const botIn: number[] = [];
  const botOut: number[] = [];
  const topOut: number[] = [];
  const topIn: number[] = [];

  for (let s = 0; s < segs; s++) {
    const a = (s * 2 * Math.PI) / segs;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    botIn.push(builder.addVert(dowelHoleR * ca, dowelHoleR * sa, 0));
    botOut.push(builder.addVert(cuffR * ca, cuffR * sa, 0));
    topOut.push(builder.addVert(cuffR * ca, cuffR * sa, thickness));
    topIn.push(builder.addVert(dowelHoleR * ca, dowelHoleR * sa, thickness));
  }

  for (let s = 0; s < segs; s++) {
    const sNext = (s + 1) % segs;
    builder.addTri(botOut[s]!, botOut[sNext]!, topOut[sNext]!);
    builder.addTri(botOut[s]!, topOut[sNext]!, topOut[s]!);
    builder.addTri(botIn[s]!, topIn[sNext]!, botIn[sNext]!);
    builder.addTri(botIn[s]!, topIn[s]!, topIn[sNext]!);
    builder.addTri(botIn[s]!, botIn[sNext]!, botOut[sNext]!);
    builder.addTri(botIn[s]!, botOut[sNext]!, botOut[s]!);
    builder.addTri(topIn[s]!, topOut[sNext]!, topIn[sNext]!);
    builder.addTri(topIn[s]!, topOut[s]!, topOut[sNext]!);
  }

  return [
    {
      id: "blade-rotating-cuff",
      color_hex: 0xf59e0b,
      positions: new Float32Array(builder.positions),
      indices: new Uint32Array(builder.indices),
    },
  ];
}

/**
 * Visual-only reference hub + trefoil boss + 3x rear blind M3 bolts matching `Kidwind4-LockRev4.step`
 * (`z = -20..0` hub, `z = 0..+2` trefoil boss, `z = -24..-10` M3 screws).
 */
function buildGhostHubMeshes(cfg: NoseConeConfig, bladeCtx: NoseConeBladeContext): NoseConeSubMesh[] {
  const bCount = Math.max(1, Math.round(bladeCtx.blade_count));
  const effHubDia = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
  const effHubLen = cfg.hub_fit_mode === "kidwind4_lockrev4" ? 20.0 : bladeCtx.hub_length_mm;
  const hubR = effHubDia * 0.5;
  const boreR = Math.max(2.65, bladeCtx.hub_bore_mm * 0.5);
  const segs = 48;

  // 1. Main Ø60 Hub Cylinder with center bore
  const hubB = createSubMeshBuilder();
  const botIn: number[] = [];
  const botOut: number[] = [];
  const topOut: number[] = [];
  const topIn: number[] = [];
  for (let s = 0; s < segs; s++) {
    const a = (s * 2 * Math.PI) / segs;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    botIn.push(hubB.addVert(boreR * c, boreR * sn, -effHubLen));
    botOut.push(hubB.addVert(hubR * c, hubR * sn, -effHubLen));
    topOut.push(hubB.addVert(hubR * c, hubR * sn, 0));
    topIn.push(hubB.addVert(boreR * c, boreR * sn, 0));
  }
  for (let s = 0; s < segs; s++) {
    const sNext = (s + 1) % segs;
    hubB.addTri(botOut[s]!, botOut[sNext]!, topOut[sNext]!);
    hubB.addTri(botOut[s]!, topOut[sNext]!, topOut[s]!);
    hubB.addTri(botIn[s]!, topIn[sNext]!, botIn[sNext]!);
    hubB.addTri(botIn[s]!, topIn[s]!, topIn[sNext]!);
    hubB.addTri(botIn[s]!, botIn[sNext]!, botOut[sNext]!);
    hubB.addTri(botIn[s]!, botOut[sNext]!, botOut[s]!);
    hubB.addTri(topIn[s]!, topOut[sNext]!, topIn[sNext]!);
    hubB.addTri(topIn[s]!, topOut[s]!, topOut[sNext]!);
  }

  const meshes: NoseConeSubMesh[] = [
    {
      id: "ghost-hub-body",
      color_hex: 0x64748b,
      positions: new Float32Array(hubB.positions),
      indices: new Uint32Array(hubB.indices),
    },
  ];

  // 2. Front 2mm 45-deg Chamfered Trefoil Boss on z = 0..+2mm (for Kidwind4-LockRev4)
  if (cfg.hub_fit_mode === "kidwind4_lockrev4") {
    const bossB = createSubMeshBuilder();
    const NA = 96;
    const bBotIn: number[] = [];
    const bBotOut: number[] = [];
    const bTopOut: number[] = [];
    const bTopIn: number[] = [];
    for (let j = 0; j < NA; j++) {
      const theta = (j * 2 * Math.PI) / NA;
      const rB = evalTrefoilRadius(
        theta,
        cfg.trefoil_center_r_mm,
        cfg.trefoil_lobe_r_mm,
        cfg.bolt_circle_mm * 0.5,
        bCount,
        0,
      );
      const rChamfer = Math.max(boreR + 1.0, rB - 1.2);
      const c = Math.cos(theta);
      const sn = Math.sin(theta);
      bBotIn.push(bossB.addVert(boreR * c, boreR * sn, 0));
      bBotOut.push(bossB.addVert(rB * c, rB * sn, 0));
      bTopOut.push(bossB.addVert(rChamfer * c, rChamfer * sn, cfg.trefoil_depth_mm));
      bTopIn.push(bossB.addVert(boreR * c, boreR * sn, cfg.trefoil_depth_mm));
    }
    for (let j = 0; j < NA; j++) {
      const jNext = (j + 1) % NA;
      bossB.addTri(bBotOut[j]!, bBotOut[jNext]!, bTopOut[jNext]!);
      bossB.addTri(bBotOut[j]!, bTopOut[jNext]!, bTopOut[j]!);
      bossB.addTri(bBotIn[j]!, bTopIn[jNext]!, bBotIn[jNext]!);
      bossB.addTri(bBotIn[j]!, bTopIn[j]!, bTopIn[jNext]!);
      bossB.addTri(bBotIn[j]!, bBotIn[jNext]!, bBotOut[jNext]!);
      bossB.addTri(bBotIn[j]!, bBotOut[jNext]!, bBotOut[j]!);
      bossB.addTri(bTopIn[j]!, bTopOut[jNext]!, bTopIn[jNext]!);
      bossB.addTri(bTopIn[j]!, bTopOut[j]!, bTopOut[jNext]!);
    }
    meshes.push({
      id: "ghost-hub-trefoil",
      color_hex: 0x94a3b8,
      positions: new Float32Array(bossB.positions),
      indices: new Uint32Array(bossB.indices),
    });
  }

  // 3. 3x M3 Rear Blind Socket Cap Bolts
  const boltB = createSubMeshBuilder();
  const boltR = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.bolt_circle_mm * 0.5 : clamp(hubR * 0.62, 6, hubR * 0.76);
  const bSegs = 14;
  for (let k = 0; k < bCount; k++) {
    const ang = ((k + 0.5) * 2 * Math.PI) / bCount;
    const cx = boltR * Math.cos(ang);
    const cy = boltR * Math.sin(ang);
    const zHeadBot = -effHubLen - 3.0;
    const zHeadTop = -effHubLen;
    const zShankTip = 8.0;
    const headPoleBot = boltB.addVert(cx, cy, zHeadBot);
    const shankPoleTop = boltB.addVert(cx, cy, zShankTip);
    const rHeadOutBot: number[] = [];
    const rHeadOutTop: number[] = [];
    const rShankBot: number[] = [];
    const rShankTop: number[] = [];
    for (let s = 0; s < bSegs; s++) {
      const a = (s * 2 * Math.PI) / bSegs;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      rHeadOutBot.push(boltB.addVert(cx + 2.7 * c, cy + 2.7 * sn, zHeadBot));
      rHeadOutTop.push(boltB.addVert(cx + 2.7 * c, cy + 2.7 * sn, zHeadTop));
      rShankBot.push(boltB.addVert(cx + 1.45 * c, cy + 1.45 * sn, zHeadTop));
      rShankTop.push(boltB.addVert(cx + 1.45 * c, cy + 1.45 * sn, zShankTip));
    }
    for (let s = 0; s < bSegs; s++) {
      const sNext = (s + 1) % bSegs;
      boltB.addTri(headPoleBot, rHeadOutBot[sNext]!, rHeadOutBot[s]!);
      boltB.addTri(rHeadOutBot[s]!, rHeadOutBot[sNext]!, rHeadOutTop[sNext]!);
      boltB.addTri(rHeadOutBot[s]!, rHeadOutTop[sNext]!, rHeadOutTop[s]!);
      boltB.addTri(rShankBot[s]!, rHeadOutTop[s]!, rHeadOutTop[sNext]!);
      boltB.addTri(rShankBot[s]!, rHeadOutTop[sNext]!, rShankBot[sNext]!);
      boltB.addTri(rShankBot[s]!, rShankBot[sNext]!, rShankTop[sNext]!);
      boltB.addTri(rShankBot[s]!, rShankTop[sNext]!, rShankTop[s]!);
      boltB.addTri(rShankTop[s]!, rShankTop[sNext]!, shankPoleTop);
    }
  }
  meshes.push({
    id: "ghost-hub-bolts",
    color_hex: 0xe8451e,
    positions: new Float32Array(boltB.positions),
    indices: new Uint32Array(boltB.indices),
  });

  return meshes;
}

export function computeNoseConeMetrics(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  totalTriangles = 0,
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
  const base = profileMeta[cfg.aero_profile];
  const cd = clamp(base.cd + (68 - cfg.cone_length_mm) * 0.0009 - wrapBonus[cfg.wrap_style] * 0.002, 0.08, 0.34);
  const boost = Math.max(
    4,
    Math.round(base.boost + wrapBonus[cfg.wrap_style] * 0.6 + (effPitch - 14) * 0.12 + (bladeCtx.root_chord_mm - 60) * 0.06),
  );
  const r = effHubDia * 0.5;
  const slantArea = Math.PI * r * Math.sqrt(r * r + cfg.cone_length_mm * cfg.cone_length_mm) * 0.72 + Math.PI * effHubDia * effSkirt * 0.78;
  const volCm3 = (slantArea * cfg.wall_thickness_mm + bCount * 1150 + 2100) / 1000;
  const massG = volCm3 * 1.27; // PETG density

  const fitNote =
    cfg.hub_fit_mode === "kidwind4_lockrev4"
      ? `Fits Kidwind4-LockRev4.step: Ø${effHubDia.toFixed(0)}mm · +${cfg.trefoil_clearance_mm.toFixed(2)}mm Trefoil slip · 60° blade-bolt clearance`
      : `Auto-matched to current Rotor Hub Ø${effHubDia.toFixed(0)}mm (${bCount} blades)`;

  return {
    hub_diameter_mm: effHubDia,
    skirt_length_mm: effSkirt,
    bolt_circle_mm: boltCircle,
    nose_cd: Number(cd.toFixed(2)),
    root_flow_boost_pct: boost,
    est_mass_g: Number(massG.toFixed(1)),
    total_triangles: totalTriangles,
    hardware_label: `${bCount}× M3×30 Blind`,
    fit_note: fitNote,
  };
}

/**
 * Generates watertight 3D nose cone meshes (+ optional rotating cuffs and visual reference hub).
 */
export function buildNoseConeMeshes(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
): NoseConeMeshBundle {
  const effHubDia = cfg.hub_fit_mode === "kidwind4_lockrev4" ? cfg.hub_diameter_mm : bladeCtx.hub_diameter_mm;
  const shell = buildMaskedThickShell(cfg, bladeCtx, effHubDia);
  const trefoil = buildTrefoilCollarMesh(cfg, bladeCtx, effHubDia);
  const bosses = buildBlindM3Bosses(cfg, bladeCtx, effHubDia);
  const cuffs = buildBladeCuffMeshes(cfg, bladeCtx);
  const ghostHub = buildGhostHubMeshes(cfg, bladeCtx);

  const submeshes = [shell, trefoil, bosses];
  const totalTriangles = submeshes.reduce((acc, s) => acc + Math.floor(s.indices.length / 3), 0);

  return {
    submeshes,
    cuff_submeshes: cuffs,
    ghost_hub_submeshes: ghostHub,
    metrics: computeNoseConeMetrics(cfg, bladeCtx, totalTriangles),
  };
}

/**
 * Exports either the complete printable Nose Cone (`shell + trefoil ring + M3 blind bosses`)
 * or the Rotating Blade Cuffs (`B` copies side-by-side) as a binary STL placed flat at `z >= 0`.
 */
export function exportNoseConeStlBytes(
  cfg: NoseConeConfig,
  bladeCtx: NoseConeBladeContext,
  target: "cone" | "cuff" = "cone",
): Uint8Array {
  const exportCfg: NoseConeConfig = { ...cfg, cutaway_mode: false };
  const bundle = buildNoseConeMeshes(exportCfg, bladeCtx);
  const parts: { positions: Float32Array; indices: Uint32Array; offsetX: number; offsetY: number }[] = [];

  if (target === "cuff") {
    const cuffSrc = bundle.cuff_submeshes[0] ?? buildBladeCuffMeshes({ ...cfg, wrap_style: "cuff" }, bladeCtx)[0]!;
    const count = Math.max(1, Math.round(bladeCtx.blade_count));
    for (let k = 0; k < count; k++) {
      parts.push({
        positions: cuffSrc.positions,
        indices: cuffSrc.indices,
        offsetX: k * 38,
        offsetY: 0,
      });
    }
  } else {
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
  const header = `BladeLab NoseCone ${cfg.aero_profile}/${cfg.wrap_style} D=${bundle.metrics.hub_diameter_mm.toFixed(0)}mm`;
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
 * Computes NACA 4412 upper & lower points in local frame (for the live 2D cutout blueprint canvas).
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
  const h = canvas.clientHeight || 196;
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
    ctx.fillRect(z0X - 2 * s, cy - 26 * s, 2 * s, 52 * s);
  }

  // Rear M3 Blind Bolt
  const boltY = cy + (cfg.hub_fit_mode === "kidwind4_lockrev4" ? 20 * s : hubR * 0.62);
  ctx.fillStyle = cTheme.warn;
  ctx.fillRect(z0X - 9 * s + coneOffsetX, boltY - 1.2 * s, hubW + 12 * s - coneOffsetX, 2.4 * s);

  // Nose + Skirt Envelope
  const noseCurve = (xPos: number) => {
    const tNose = clamp((xPos - coneNoseX) / Math.max(1, cfg.cone_length_mm * s), 0, 1);
    return (evalNoseProfileRadius(cfg.aero_profile, tNose, effHubR + cfg.wall_thickness_mm, 0, bladeCtx.root_chord_mm, effPitchDeg)) * s;
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

  ctx.font = "400 9.5px ui-monospace, monospace";
  ctx.fillStyle = cTheme.muted;
  ctx.textAlign = "center";
  ctx.fillText(`Z=0..${effSkirt.toFixed(0)}mm`, rcx, h - 6);
  ctx.restore();
  ctx.restore();
}
