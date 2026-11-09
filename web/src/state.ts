// Pure state management for BladeLab UI (T-105 + T-205):
// - Undo/redo history stack over immutable `Design` snapshots
// - Layer 1 rotor & distribution helpers (Linear / Constant / Schmitz)
// - Layer 2 Bézier curve editor & formula helpers
// - Value scrubbing (normal / Shift 10× / Alt 0.1×), station locking & taper binding
// - Layer 3 per-station resolution and override editing

import type {
  AirfoilSpec,
  BezierControlPoint,
  CurveSource,
  Design,
  Rotor,
  StationOverride,
} from "./types/blade-model";


export const RATIO_EPS = 1e-9;

export function evalBezierPoints(points: BezierControlPoint[], s: number): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0]!.y;
  const clamped = Math.min(1, Math.max(0, s));
  if (clamped <= 0) return points[0]!.y;
  if (clamped >= 1) return points[points.length - 1]!.y;

  const deCasteljau = (coord: "x" | "y", t: number): number => {
    const work = points.map((p) => p[coord]);
    const n = work.length;
    for (let k = 1; k < n; k++) {
      for (let i = 0; i < n - k; i++) {
        work[i] = (1 - t) * work[i]! + t * work[i + 1]!;
      }
    }
    return work[0]!;
  };

  let lo = 0;
  let hi = 1;
  for (let iter = 0; iter < 48; iter++) {
    const mid = 0.5 * (lo + hi);
    if (deCasteljau("x", mid) < clamped) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return deCasteljau("y", 0.5 * (lo + hi));
}

export function evalFormulaPreview(
  expr: string,
  rotor: Rotor,
  spanRatio: number,
  s: number,
): number {
  const trimmed = expr.trim();
  if (!trimmed) return 0;
  try {
    const fn = new Function(
      "x",
      "s",
      "r",
      "R",
      "r_hub",
      "B",
      "tsr",
      "pi",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "atan2",
      "sqrt",
      "abs",
      "exp",
      "ln",
      "pow",
      "deg",
      "rad",
      `"use strict"; return Number(${trimmed.replace(/\^/g, "**")});`,
    );
    const val = Number(
      fn(
        spanRatio,
        s,
        spanRatio * rotor.radius_mm,
        rotor.radius_mm,
        rotor.hub_radius_mm,
        rotor.blade_count,
        rotor.design_tsr,
        Math.PI,
        Math.sin,
        Math.cos,
        Math.tan,
        Math.asin,
        Math.acos,
        Math.atan,
        Math.atan2,
        Math.sqrt,
        Math.abs,
        Math.exp,
        Math.log,
        Math.pow,
        (rad: number) => (rad * 180) / Math.PI,
        (deg: number) => (deg * Math.PI) / 180,
      ),
    );
    return Number.isFinite(val) ? val : 0;
  } catch {
    return 0;
  }
}

export interface ResolvedStationRow {
  index: number;
  span_ratio: number;
  radius_mm: number;
  base_chord_mm: number;
  base_twist_deg: number;
  override_chord_mm: number | null;
  override_twist_deg: number | null;
  effective_chord_mm: number;
  effective_twist_deg: number;
  has_override: boolean;
}

export function cloneDesign(design: Design): Design {
  return JSON.parse(JSON.stringify(design)) as Design;
}

export function designsEqual(a: Design, b: Design): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Evaluates a `CurveSource` for chord (in mm) at radial `spanRatio = r / R`
 * and normalised blade coordinate `s = (r/R - r_hub/R) / (1 - r_hub/R)`.
 */
export function evalChordCurve(curve: CurveSource, rotor: Rotor, spanRatio: number, s: number): number {
  switch (curve.type) {
    case "constant":
      return curve.value;
    case "linear":
      return curve.root + (curve.tip - curve.root) * s;
    case "schmitz": {
      const cl = curve.design_cl ?? 1.0;
      const rMm = spanRatio * rotor.radius_mm;
      const localTsr = rotor.design_tsr * spanRatio;
      const phiRad = (2.0 / 3.0) * Math.atan2(1.0, localTsr);
      const sinHalf = Math.sin(0.5 * phiRad);
      return ((16.0 * Math.PI * rMm) / (rotor.blade_count * cl)) * sinHalf * sinHalf;
    }
    case "bezier":
      return evalBezierPoints(curve.points, s);
    case "formula":
      return evalFormulaPreview(curve.expr, rotor, spanRatio, s);
  }
}

/**
 * Evaluates a `CurveSource` for twist (in degrees) at radial `spanRatio = r / R`
 * and normalised blade coordinate `s = (r/R - r_hub/R) / (1 - r_hub/R)`.
 */
export function evalTwistCurve(curve: CurveSource, rotor: Rotor, spanRatio: number, s: number): number {
  switch (curve.type) {
    case "constant":
      return curve.value;
    case "linear":
      return curve.root + (curve.tip - curve.root) * s;
    case "schmitz": {
      const alphaDeg = curve.design_alpha_deg ?? 0.0;
      const localTsr = rotor.design_tsr * spanRatio;
      const phiDeg = ((2.0 / 3.0) * Math.atan2(1.0, localTsr) * 180.0) / Math.PI;
      return phiDeg - alphaDeg;
    }
    case "bezier":
      return evalBezierPoints(curve.points, s);
    case "formula":
      return evalFormulaPreview(curve.expr, rotor, spanRatio, s);
  }
}

/**
 * Mirrors `blade_model::resolve` station grid construction so the Layer-3
 * per-station table displays the exact stations consumed by the Rust kernel.
 */
export function resolveStationsPreview(design: Design): ResolvedStationRow[] {
  const { rotor, distributions, overrides } = design;
  const hubRatio = rotor.hub_radius_mm / rotor.radius_mm;
  const span = 1.0 - hubRatio;
  const count = Math.max(2, Math.round(rotor.station_count));

  const ratios: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    ratios.push(hubRatio + span * t);
  }
  for (const ov of overrides) {
    ratios.push(ov.span_ratio);
  }
  ratios.sort((a, b) => a - b);

  const uniqueRatios: number[] = [];
  for (const r of ratios) {
    if (
      uniqueRatios.length === 0 ||
      Math.abs(r - uniqueRatios[uniqueRatios.length - 1]!) > RATIO_EPS
    ) {
      uniqueRatios.push(r);
    }
  }

  return uniqueRatios.map((spanRatio, index) => {
    const s = span > 0 ? Math.min(1, Math.max(0, (spanRatio - hubRatio) / span)) : 0;
    const baseChord = evalChordCurve(distributions.chord_mm, rotor, spanRatio, s);
    const baseTwist = evalTwistCurve(distributions.twist_deg, rotor, spanRatio, s);
    const matchedOverride = overrides.find(
      (ov) => Math.abs(ov.span_ratio - spanRatio) <= RATIO_EPS,
    );

    const overrideChord = matchedOverride?.chord_mm ?? null;
    const overrideTwist = matchedOverride?.twist_deg ?? null;

    return {
      index,
      span_ratio: spanRatio,
      radius_mm: spanRatio * rotor.radius_mm,
      base_chord_mm: baseChord,
      base_twist_deg: baseTwist,
      override_chord_mm: overrideChord,
      override_twist_deg: overrideTwist,
      effective_chord_mm: overrideChord ?? baseChord,
      effective_twist_deg: overrideTwist ?? baseTwist,
      has_override: overrideChord !== null || overrideTwist !== null,
    };
  });
}

/**
 * Snaps a span ratio to the blade span [hub_radius/R, 1.0] and aligns with
 * exact uniform station grid floats to prevent float-rounding mismatch with
 * Rust kernel RATIO_EPS (which causes duplicate micro-loft stations and crumpled mesh).
 */
export function snapSpanRatioToGrid(ratio: number, rotor: Rotor): number {
  const hubRatio = rotor.hub_radius_mm / rotor.radius_mm;
  if (!Number.isFinite(ratio) || ratio <= hubRatio + 1e-5) {
    return hubRatio;
  }
  if (ratio >= 1.0 - 1e-5) {
    return 1.0;
  }
  const count = Math.max(2, Math.round(rotor.station_count));
  const span = 1.0 - hubRatio;
  for (let i = 0; i < count; i++) {
    const uni = hubRatio + span * (i / (count - 1));
    if (Math.abs(ratio - uni) <= 1e-4) {
      return uni;
    }
  }
  return ratio;
}

/**
 * Adapts station overrides when rotor radius or hub radius changes so that
 * all station positions remain physically on the blade span [hub_radius / R, 1.0].
 */
export function adaptOverridesToRotor(
  overrides: readonly StationOverride[],
  oldHubRatio: number,
  newHubRatio: number,
  rotor?: Rotor,
): StationOverride[] {
  if (!overrides || overrides.length === 0) return [];
  if (Math.abs(newHubRatio - oldHubRatio) < 1e-9) {
    if (rotor) {
      return overrides.map((ov) => ({
        ...ov,
        span_ratio: snapSpanRatioToGrid(ov.span_ratio, rotor),
      }));
    }
    return [...overrides];
  }
  const safeOldHub =
    Number.isFinite(oldHubRatio) && oldHubRatio >= 0 && oldHubRatio < 1.0
      ? oldHubRatio
      : newHubRatio;
  const oldSpan = Math.max(1e-6, 1.0 - safeOldHub);
  const newSpan = Math.max(1e-6, 1.0 - newHubRatio);

  const remapped = overrides.map((ov) => {
    // Relative span fraction along blade: 0 = root, 1 = tip
    const s = Math.max(0, Math.min(1, (ov.span_ratio - safeOldHub) / oldSpan));
    let newRatio = Math.max(newHubRatio, Math.min(1.0, newHubRatio + newSpan * s));
    if (rotor) {
      newRatio = snapSpanRatioToGrid(newRatio, rotor);
    }
    return {
      ...ov,
      span_ratio: newRatio,
    };
  });

  remapped.sort((a, b) => a.span_ratio - b.span_ratio);
  return remapped;
}

/**
 * Remaps a station span ratio from an old rotor geometry to a new rotor geometry,
 * preserving its relative position along the blade span [0 = root, 1 = tip].
 */
export function remapSpanRatio(
  spanRatio: number,
  oldHubRatio: number,
  newHubRatio: number,
  rotor?: Rotor,
): number {
  const safeOldHub =
    Number.isFinite(oldHubRatio) && oldHubRatio >= 0 && oldHubRatio < 1.0
      ? oldHubRatio
      : newHubRatio;
  const oldSpan = Math.max(1e-6, 1.0 - safeOldHub);
  const newSpan = Math.max(1e-6, 1.0 - newHubRatio);
  const s = Math.max(0, Math.min(1, (spanRatio - safeOldHub) / oldSpan));
  const rawRatio = Math.max(newHubRatio, Math.min(1.0, newHubRatio + newSpan * s));
  return rotor ? snapSpanRatioToGrid(rawRatio, rotor) : rawRatio;
}

/**
 * Updates a Layer-1 `Rotor` numeric field and returns a new `Design`.
 */
export function updateRotorField<K extends keyof Rotor>(
  design: Design,
  field: K,
  value: Rotor[K],
): Design {
  const next = cloneDesign(design);
  const oldHubRatio = design.rotor.hub_radius_mm / design.rotor.radius_mm;
  next.rotor[field] = value;
  const newHubRatio = next.rotor.hub_radius_mm / next.rotor.radius_mm;

  if (
    (field === "radius_mm" || field === "hub_radius_mm") &&
    Number.isFinite(newHubRatio) &&
    newHubRatio > 0 &&
    newHubRatio < 1.0 &&
    next.overrides.length > 0
  ) {
    next.overrides = adaptOverridesToRotor(next.overrides, oldHubRatio, newHubRatio, next.rotor);
  }
  return next;
}

/**
 * Updates the physical blade span length `L = R - r_0` (in mm) by setting
 * `rotor.radius_mm = rotor.hub_radius_mm + max(10, bladeLengthMm)`.
 */
export function updateBladeLengthMm(design: Design, bladeLengthMm: number): Design {
  const next = cloneDesign(design);
  const oldHubRatio = design.rotor.hub_radius_mm / design.rotor.radius_mm;
  const clampedLength = Math.max(10, bladeLengthMm);
  next.rotor.radius_mm = Number((next.rotor.hub_radius_mm + clampedLength).toFixed(4));
  const newHubRatio = next.rotor.hub_radius_mm / next.rotor.radius_mm;

  if (
    Number.isFinite(newHubRatio) &&
    newHubRatio > 0 &&
    newHubRatio < 1.0 &&
    next.overrides.length > 0
  ) {
    next.overrides = adaptOverridesToRotor(next.overrides, oldHubRatio, newHubRatio, next.rotor);
  }
  return next;
}

/**
 * Updates the chordwise pitch-axis pivot fraction (`0.0` = LE .. `1.0` = TE).
 */
export function updatePitchAxisRatio(design: Design, pitchAxisRatio: number): Design {
  const next = cloneDesign(design);
  next.rotor.pitch_axis_ratio = Number(
    Math.min(1.0, Math.max(0.0, pitchAxisRatio)).toFixed(4),
  );
  return next;
}

/**
 * Scales all chord widths across the blade by `factor` (e.g. `1.1` = +10%,
 * `0.9` = -10%), preserving any locked stations.
 */
export function scaleAllChords(
  design: Design,
  factor: number,
  lockedSpanRatios: readonly number[] = [],
): Design {
  const safeFactor = Math.max(0.1, Math.min(5.0, factor));
  const next = cloneDesign(design);
  const c = next.distributions.chord_mm;
  if (c.type === "linear") {
    c.root = Number(Math.max(2, c.root * safeFactor).toFixed(3));
    c.tip = Number(Math.max(2, c.tip * safeFactor).toFixed(3));
  } else if (c.type === "constant") {
    c.value = Number(Math.max(2, c.value * safeFactor).toFixed(3));
  } else if (c.type === "bezier") {
    c.points = c.points.map((pt) => ({
      x: pt.x,
      y: Number(Math.max(2, pt.y * safeFactor).toFixed(3)),
    }));
  } else if (c.type === "schmitz") {
    const baseCl = c.design_cl ?? 1.0;
    c.design_cl = Number(Math.max(0.1, baseCl / safeFactor).toFixed(4));
  } else if (c.type === "formula") {
    c.expr = `(${c.expr}) * ${Number(safeFactor.toFixed(4))}`;
  }
  next.overrides = next.overrides.map((ov) => ({
    ...ov,
    chord_mm:
      ov.chord_mm !== null
        ? Number(Math.max(2, ov.chord_mm * safeFactor).toFixed(3))
        : null,
  }));
  return preserveLockedStations(design, next, lockedSpanRatios);
}

/**
 * Shifts all chord widths across the blade by `deltaMm` (e.g. `+5` or `-5` mm),
 * preserving any locked stations.
 */
export function shiftAllChordsMm(
  design: Design,
  deltaMm: number,
  lockedSpanRatios: readonly number[] = [],
): Design {
  const next = cloneDesign(design);
  const c = next.distributions.chord_mm;
  if (c.type === "linear") {
    c.root = Number(Math.max(2, c.root + deltaMm).toFixed(3));
    c.tip = Number(Math.max(2, c.tip + deltaMm).toFixed(3));
  } else if (c.type === "constant") {
    c.value = Number(Math.max(2, c.value + deltaMm).toFixed(3));
  } else if (c.type === "bezier") {
    c.points = c.points.map((pt) => ({
      x: pt.x,
      y: Number(Math.max(2, pt.y + deltaMm).toFixed(3)),
    }));
  } else if (c.type === "formula") {
    const sign = deltaMm >= 0 ? "+" : "-";
    c.expr = `(${c.expr}) ${sign} ${Math.abs(deltaMm)}`;
  } else {
    // For Schmitz mode, apply the shift across station overrides
    const rows = resolveStationsPreview(design);
    for (const row of rows) {
      const shifted = Number(Math.max(2, row.effective_chord_mm + deltaMm).toFixed(3));
      const existing = next.overrides.find(
        (ov) => Math.abs(ov.span_ratio - row.span_ratio) <= RATIO_EPS,
      );
      if (existing) {
        existing.chord_mm = shifted;
      } else {
        next.overrides.push({
          span_ratio: row.span_ratio,
          chord_mm: shifted,
          twist_deg: null,
          airfoil: null,
        });
      }
    }
    next.overrides.sort((a, b) => a.span_ratio - b.span_ratio);
  }
  if (c.type !== "schmitz") {
    next.overrides = next.overrides.map((ov) => ({
      ...ov,
      chord_mm:
        ov.chord_mm !== null
          ? Number(Math.max(2, ov.chord_mm + deltaMm).toFixed(3))
          : null,
    }));
  }
  return preserveLockedStations(design, next, lockedSpanRatios);
}

/**
 * Updates the primary airfoil specification across the blade's airfoil stations.
 */
export function updatePrimaryAirfoil(design: Design, spec: AirfoilSpec): Design {
  const next = cloneDesign(design);
  if (next.airfoils.length === 0) {
    next.airfoils = [
      { span_ratio: 0.0, airfoil: spec },
      { span_ratio: 1.0, airfoil: spec },
    ];
  } else {
    next.airfoils = next.airfoils.map((st) => ({
      span_ratio: st.span_ratio,
      airfoil: JSON.parse(JSON.stringify(spec)) as AirfoilSpec,
    }));
  }
  return next;
}

/**
 * Preserves the effective chord and twist of any station whose `span_ratio`
 * appears in `lockedSpanRatios` when transitioning from `before` to `after`.
 */
export function preserveLockedStations(
  before: Design,
  after: Design,
  lockedSpanRatios: readonly number[],
): Design {
  if (lockedSpanRatios.length === 0) {
    return after;
  }
  const beforeRows = resolveStationsPreview(before);
  const beforeHub = before.rotor.hub_radius_mm / before.rotor.radius_mm;
  const afterHub = after.rotor.hub_radius_mm / after.rotor.radius_mm;
  const beforeSpan = Math.max(1e-6, 1.0 - beforeHub);
  const afterSpan = Math.max(1e-6, 1.0 - afterHub);

  let next = cloneDesign(after);
  for (const lockedRatio of lockedSpanRatios) {
    const matched = beforeRows.find(
      (row) => Math.abs(row.span_ratio - lockedRatio) <= RATIO_EPS,
    );
    if (matched) {
      const s = Math.max(0, Math.min(1, (matched.span_ratio - beforeHub) / beforeSpan));
      const targetRatio = snapSpanRatioToGrid(
        Math.max(afterHub, Math.min(1.0, afterHub + afterSpan * s)),
        next.rotor,
      );
      next = setStationOverride(next, targetRatio, {
        chord_mm: matched.effective_chord_mm,
        twist_deg: matched.effective_twist_deg,
      });
    }
  }
  return next;
}

/**
 * Default 4-point cubic Bézier control polygon for chord (in mm).
 */
export function defaultChordBezierPoints(
  rootMm = 70.0,
  tipMm = 35.0,
): BezierControlPoint[] {
  return [
    { x: 0.0, y: rootMm },
    { x: 1.0 / 3.0, y: rootMm + (tipMm - rootMm) * 0.25 },
    { x: 2.0 / 3.0, y: rootMm + (tipMm - rootMm) * 0.7 },
    { x: 1.0, y: tipMm },
  ];
}

/**
 * Default 4-point cubic Bézier control polygon for twist (in degrees).
 */
export function defaultTwistBezierPoints(
  rootDeg = 20.0,
  tipDeg = 3.0,
): BezierControlPoint[] {
  return [
    { x: 0.0, y: rootDeg },
    { x: 1.0 / 3.0, y: rootDeg + (tipDeg - rootDeg) * 0.45 },
    { x: 2.0 / 3.0, y: rootDeg + (tipDeg - rootDeg) * 0.8 },
    { x: 1.0, y: tipDeg },
  ];
}

export interface PlanformZones {
  /** Fraction of span where the root transition ends (and the mid plateau starts). */
  rootEnd: number;
  /** Fraction of span where the mid plateau ends (and the tip transition starts). */
  tipStart: number;
}

/**
 * Resolves Root / Mid / Tip zone boundaries (span fractions) from a plateau
 * center and width, both expressed as span fractions. The plateau is kept
 * inside `[0.05, 0.95]` so both cosine transitions retain non-zero length.
 */
export function planformZones(center: number, width: number): PlanformZones {
  const w = Math.min(0.9, Math.max(0.02, width));
  const half = w / 2;
  const c = Math.min(0.95 - half, Math.max(0.05 + half, center));
  return { rootEnd: c - half, tipStart: c + half };
}

/**
 * Builds a chord formula expression: smooth cosine transition from the root
 * chord to the mid-plateau chord (mean of root and tip), a flat plateau, then
 * a smooth cosine transition to the tip chord. Uses only `cos`, `abs` and
 * `pi`, so it evaluates identically in the Rust and TypeScript formula
 * engines. `clamp(u, 0, 1)` is expressed as `(abs(u) - abs(u - 1) + 1) / 2`.
 */
export function buildCosinePlateauExpr(
  rootMm: number,
  tipMm: number,
  center: number,
  width: number,
  midMm: number = 0.5 * (rootMm + tipMm),
): string {
  const { rootEnd, tipStart } = planformZones(center, width);
  const f = (n: number) => n.toFixed(4);
  const clamp01 = (u: string) => `((abs(${u}) - abs((${u}) - 1) + 1) / 2)`;
  const h1 = `(1 - cos(pi * ${clamp01(`s / ${f(rootEnd)}`)})) / 2`;
  const h2 = `(1 - cos(pi * ${clamp01(`(s - ${f(tipStart)}) / ${f(1 - tipStart)}`)})) / 2`;
  return `${f(rootMm)} + (${f(midMm - rootMm)}) * (${h1}) + (${f(tipMm - midMm)}) * (${h2})`;
}

export type SectionKey = "root" | "mid" | "tip";

/**
 * Recovers plateau `center` and `width` (span fractions) from an expression
 * produced by `buildCosinePlateauExpr`, or `null` for any other expression.
 */
export function parseCosinePlateauExpr(expr: string): { center: number; width: number } | null {
  if (!expr.includes("cos(pi")) return null;
  const a = /abs\(s \/ ([0-9.]+)\)/.exec(expr);
  const b = /\(\(s - ([0-9.]+)\) \//.exec(expr);
  if (!a || !b) return null;
  const rootEnd = Number.parseFloat(a[1]!);
  const tipStart = Number.parseFloat(b[1]!);
  if (!Number.isFinite(rootEnd) || !Number.isFinite(tipStart) || tipStart <= rootEnd) return null;
  return { center: 0.5 * (rootEnd + tipStart), width: tipStart - rootEnd };
}

export interface SectionState {
  chord_mm: number;
  twist_deg: number;
  airfoil: AirfoilSpec;
}

/** Span ratio `r / R` of the mid-span section at plateau `center` (fraction of blade span). */
export function midSpanRatio(rotor: Rotor, center: number): number {
  const hub = rotor.hub_radius_mm / rotor.radius_mm;
  return hub + (1 - hub) * center;
}

function airfoilAt(design: Design, spanRatio: number): AirfoilSpec {
  let chosen = design.airfoils[0]?.airfoil;
  for (const st of design.airfoils) {
    if (st.span_ratio <= spanRatio + RATIO_EPS) chosen = st.airfoil;
  }
  return (
    chosen ?? { type: "naca4", max_camber: 0.04, camber_position: 0.4, thickness_ratio: 0.12 }
  );
}

/** Reads effective Root / Mid / Tip section values from any distribution mode. */
export function readSections(design: Design, center: number): Record<SectionKey, SectionState> {
  const { rotor, distributions } = design;
  const hub = rotor.hub_radius_mm / rotor.radius_mm;
  const at = (key: SectionKey): SectionState => {
    const s = key === "root" ? 0 : key === "tip" ? 1 : center;
    const sr = key === "root" ? hub : key === "tip" ? 1 : midSpanRatio(rotor, center);
    const airfoil =
      key === "root"
        ? (design.airfoils[0]?.airfoil ?? airfoilAt(design, sr))
        : key === "tip"
          ? (design.airfoils[design.airfoils.length - 1]?.airfoil ?? airfoilAt(design, sr))
          : airfoilAt(design, sr);
    return {
      chord_mm: evalChordCurve(distributions.chord_mm, rotor, sr, s),
      twist_deg: evalTwistCurve(distributions.twist_deg, rotor, sr, s),
      airfoil: JSON.parse(JSON.stringify(airfoil)) as AirfoilSpec,
    };
  };
  return { root: at("root"), mid: at("mid"), tip: at("tip") };
}

/** Writes three airfoil stations (root, mid-span, tip) into the design. */
export function applySectionAirfoils(
  design: Design,
  sections: Record<SectionKey, SectionState>,
  center: number,
): Design {
  const next = cloneDesign(design);
  next.airfoils = [
    { span_ratio: 0.0, airfoil: sections.root.airfoil },
    { span_ratio: midSpanRatio(design.rotor, center), airfoil: sections.mid.airfoil },
    { span_ratio: 1.0, airfoil: sections.tip.airfoil },
  ].map((st) => ({
    span_ratio: st.span_ratio,
    airfoil: JSON.parse(JSON.stringify(st.airfoil)) as AirfoilSpec,
  }));
  return next;
}

export function airfoilShapeParams(spec: AirfoilSpec): {
  m: number;
  p: number;
  t: number;
  label: string;
} {
  if (spec.type === "named") {
    const table: Record<string, [number, number, number]> = {
      SG6043: [0.055, 0.42, 0.1],
      SD7062: [0.038, 0.38, 0.14],
      E387: [0.032, 0.4, 0.091],
      S833: [0.025, 0.787, 0.18],
    };
    const [m, p, t] = table[spec.name] ?? [0.04, 0.4, 0.12];
    return { m, p, t, label: spec.name };
  }
  return {
    m: spec.max_camber,
    p: spec.camber_position > 0 ? spec.camber_position : 0.4,
    t: spec.thickness_ratio,
    label: `NACA t=${(spec.thickness_ratio * 100).toFixed(0)}%`,
  };
}

/**
 * Spanwise section stack: Root, Mid and Tip profiles drawn to a common scale,
 * aligned on the pitch axis (25% chord) and rotated by their twist, so chord,
 * thickness and twist differences are visible at once.
 */
export function renderSectionStackSvgMarkup(
  sections: Record<SectionKey, SectionState>,
  active: SectionKey,
): string {
  const w = 320;
  const h = 150;
  const cx = 96;
  const cy = h / 2;
  const maxChord = Math.max(1, sections.root.chord_mm, sections.mid.chord_mm, sections.tip.chord_mm);
  const scale = 224 / maxChord;
  const colors: Record<SectionKey, string> = { root: "#f6b94d", mid: "#8ea6ff", tip: "#6fd6a6" };
  const samples = 40;

  const outline = (key: SectionKey): string => {
    const sec = sections[key];
    const { m, p, t } = airfoilShapeParams(sec.airfoil);
    const c = sec.chord_mm * scale;
    const th = (sec.twist_deg * Math.PI) / 180;
    const cosT = Math.cos(th);
    const sinT = Math.sin(th);
    const upper: [number, number][] = [];
    const lower: [number, number][] = [];
    for (let i = 0; i <= samples; i++) {
      const xc = 0.5 * (1 - Math.cos((Math.PI * i) / samples));
      const yt =
        5 * t * (0.2969 * Math.sqrt(xc) - 0.126 * xc - 0.3516 * xc ** 2 + 0.2843 * xc ** 3 - 0.1015 * xc ** 4);
      let yc = 0;
      if (m > 0 && p > 0 && p < 1) {
        yc = xc < p ? (m / (p * p)) * (2 * p * xc - xc * xc) : (m / ((1 - p) ** 2)) * (1 - 2 * p + 2 * p * xc - xc * xc);
      }
      upper.push([(xc - 0.25) * c, -(yc + yt) * c]);
      lower.push([(xc - 0.25) * c, -(yc - yt) * c]);
    }
    const ring = [...upper, ...lower.reverse()];
    return ring
      .map(([x, y]) => `${(cx + x * cosT - y * sinT).toFixed(1)},${(cy + x * sinT + y * cosT).toFixed(1)}`)
      .join(" ");
  };

  const order: SectionKey[] = ["root", "mid", "tip"];
  const polys = order
    .map((key) => {
      const on = key === active;
      return `<polygon points="${outline(key)}" fill="${colors[key]}" fill-opacity="${on ? 0.34 : 0.12}" stroke="${colors[key]}" stroke-width="${on ? 1.8 : 1}" stroke-opacity="${on ? 1 : 0.7}" />`;
    })
    .join("");
  return `<line x1="${cx}" y1="14" x2="${cx}" y2="${h - 14}" stroke="rgba(238,240,245,0.16)" stroke-dasharray="3 3" />
<line x1="12" y1="${cy}" x2="${w - 12}" y2="${cy}" stroke="rgba(238,240,245,0.08)" />
${polys}
<circle cx="${cx}" cy="${cy}" r="2.5" fill="#f59e0b" />
<text x="${cx + 6}" y="22" font-size="10" fill="#8b93a7" font-family="IBM Plex Mono, monospace">pitch axis 25% c</text>`;
}

/**
 * Switches Layer-1/2 distributions to Schmitz optimum-rotor curves.
 */
export function applySchmitzLayer1(
  design: Design,
  designCl = 1.0,
  designAlphaDeg = 6.0,
  lockedSpanRatios: readonly number[] = [],
): Design {
  const next = cloneDesign(design);
  next.distributions.chord_mm = {
    type: "schmitz",
    design_cl: designCl,
  };
  next.distributions.twist_deg = {
    type: "schmitz",
    design_alpha_deg: designAlphaDeg,
  };
  return preserveLockedStations(design, next, lockedSpanRatios);
}

/**
 * Switches Layer-1/2 distributions to Linear root-to-tip curves.
 */
export function applyLinearLayer1(
  design: Design,
  rootChordMm = 70.0,
  tipChordMm = 35.0,
  rootTwistDeg = 20.0,
  tipTwistDeg = 3.0,
  lockedSpanRatios: readonly number[] = [],
): Design {
  const next = cloneDesign(design);
  next.distributions.chord_mm = {
    type: "linear",
    root: rootChordMm,
    tip: tipChordMm,
  };
  next.distributions.twist_deg = {
    type: "linear",
    root: rootTwistDeg,
    tip: tipTwistDeg,
  };
  return preserveLockedStations(design, next, lockedSpanRatios);
}

/**
 * Sets a Layer-2 Bézier control polygon on `chord_mm` or `twist_deg`.
 * Endpoint abscissae are clamped to `x_0 = 0` and `x_{n-1} = 1` and interior
 * abscissae are kept monotonically non-decreasing in `[0, 1]`.
 */
export function applyBezierCurve(
  design: Design,
  target: "chord_mm" | "twist_deg",
  points: BezierControlPoint[],
  lockedSpanRatios: readonly number[] = [],
): Design {
  const next = cloneDesign(design);
  const sanitized = points.map((pt, idx) => {
    let x = Math.min(1, Math.max(0, pt.x));
    if (idx === 0) x = 0;
    if (idx === points.length - 1) x = 1;
    return { x, y: pt.y };
  });
  for (let i = 1; i < sanitized.length - 1; i++) {
    sanitized[i]!.x = Math.max(sanitized[i - 1]!.x, sanitized[i]!.x);
  }
  for (let i = sanitized.length - 2; i >= 1; i--) {
    sanitized[i]!.x = Math.min(sanitized[i + 1]!.x, sanitized[i]!.x);
  }
  next.distributions[target] = {
    type: "bezier",
    points: sanitized,
  };
  return preserveLockedStations(design, next, lockedSpanRatios);
}

/**
 * Updates a single Bézier control point on `chord_mm` or `twist_deg`,
 * initializing from default cubic control points if the distribution is not
 * already a Bézier curve.
 */
export function updateBezierControlPoint(
  design: Design,
  target: "chord_mm" | "twist_deg",
  index: number,
  patch: { x?: number; y?: number },
  lockedSpanRatios: readonly number[] = [],
): Design {
  const current = design.distributions[target];
  const basePoints =
    current.type === "bezier"
      ? current.points.map((p) => ({ ...p }))
      : target === "chord_mm"
        ? defaultChordBezierPoints()
        : defaultTwistBezierPoints();
  if (index < 0 || index >= basePoints.length) {
    return cloneDesign(design);
  }
  const existing = basePoints[index]!;
  basePoints[index] = {
    x: patch.x !== undefined ? patch.x : existing.x,
    y: patch.y !== undefined ? patch.y : existing.y,
  };
  return applyBezierCurve(design, target, basePoints, lockedSpanRatios);
}

/**
 * Sets a Layer-2 formula (`evalexpr`, variable `x = r/R`) on `chord_mm` or `twist_deg`.
 */
export function applyFormulaCurve(
  design: Design,
  target: "chord_mm" | "twist_deg",
  expr: string,
  lockedSpanRatios: readonly number[] = [],
): Design {
  const next = cloneDesign(design);
  next.distributions[target] = {
    type: "formula",
    expr,
  };
  return preserveLockedStations(design, next, lockedSpanRatios);
}

/**
 * Computes a scrubbed numeric value from horizontal pointer drag (`deltaPx`),
 * supporting `Shift` (10× coarse step) and `Alt` (0.1× fine step) modifiers
 * and optional `[min, max]` clamping.
 */
export function applyScrubDelta(
  currentValue: number,
  deltaPx: number,
  baseStep: number,
  modifiers: { shiftKey?: boolean; altKey?: boolean } = {},
  bounds: { min?: number; max?: number } = {},
  pixelsPerStep = 4,
): number {
  const multiplier = modifiers.shiftKey ? 10 : modifiers.altKey ? 0.1 : 1;
  const effectiveStep = baseStep * multiplier;
  const steps = deltaPx / Math.max(1, pixelsPerStep);
  let next = currentValue + steps * effectiveStep;
  if (bounds.min !== undefined) {
    next = Math.max(bounds.min, next);
  }
  if (bounds.max !== undefined) {
    next = Math.min(bounds.max, next);
  }
  return Number(next.toFixed(6));
}

/**
 * Updates `root` chord and binds `tip = root * taperRatio` across Linear or
 * Bézier chord distributions, preserving any locked stations.
 */
export function applyBoundRootChord(
  design: Design,
  rootChordMm: number,
  taperRatio: number,
  lockedSpanRatios: readonly number[] = [],
): Design {
  const tipChordMm = Number((rootChordMm * taperRatio).toFixed(6));
  const next = cloneDesign(design);
  if (next.distributions.chord_mm.type === "bezier") {
    const pts = next.distributions.chord_mm.points.map((p) => ({ ...p }));
    if (pts.length >= 2) {
      pts[0]!.y = rootChordMm;
      pts[pts.length - 1]!.y = tipChordMm;
      return applyBezierCurve(design, "chord_mm", pts, lockedSpanRatios);
    }
  }
  next.distributions.chord_mm = {
    type: "linear",
    root: rootChordMm,
    tip: tipChordMm,
  };
  return preserveLockedStations(design, next, lockedSpanRatios);
}

/**
 * Sets or updates a Layer-3 station override at `spanRatio`. If all override
 * fields become `null`, the override entry is removed cleanly.
 */
export function setStationOverride(
  design: Design,
  spanRatio: number,
  patch: { chord_mm?: number | null; twist_deg?: number | null },
): Design {
  const next = cloneDesign(design);
  const existingIdx = next.overrides.findIndex(
    (ov) => Math.abs(ov.span_ratio - spanRatio) <= RATIO_EPS,
  );

  if (existingIdx >= 0) {
    const existing = next.overrides[existingIdx]!;
    const updated: StationOverride = {
      span_ratio: existing.span_ratio,
      chord_mm: patch.chord_mm !== undefined ? patch.chord_mm : existing.chord_mm,
      twist_deg: patch.twist_deg !== undefined ? patch.twist_deg : existing.twist_deg,
      airfoil: existing.airfoil,
    };
    if (
      updated.chord_mm === null &&
      updated.twist_deg === null &&
      updated.airfoil === null
    ) {
      next.overrides.splice(existingIdx, 1);
    } else {
      next.overrides[existingIdx] = updated;
    }
  } else {
    const created: StationOverride = {
      span_ratio: spanRatio,
      chord_mm: patch.chord_mm ?? null,
      twist_deg: patch.twist_deg ?? null,
      airfoil: null,
    };
    if (created.chord_mm !== null || created.twist_deg !== null) {
      next.overrides.push(created);
      next.overrides.sort((a, b) => a.span_ratio - b.span_ratio);
    }
  }

  return next;
}

/**
 * Removes any Layer-3 override at `spanRatio`.
 */
export function clearStationOverride(design: Design, spanRatio: number): Design {
  const next = cloneDesign(design);
  next.overrides = next.overrides.filter(
    (ov) => Math.abs(ov.span_ratio - spanRatio) > RATIO_EPS,
  );
  return next;
}

/**
 * Clears all Layer-3 station overrides.
 */
export function clearAllOverrides(design: Design): Design {
  const next = cloneDesign(design);
  next.overrides = [];
  return next;
}

/**
 * Bounded Undo/Redo history stack over immutable `Design` snapshots.
 */
export class DesignHistory {
  private past: Design[] = [];
  private present: Design;
  private future: Design[] = [];
  private readonly maxDepth: number;

  constructor(initial: Design, maxDepth = 100) {
    this.present = cloneDesign(initial);
    this.maxDepth = maxDepth;
  }

  current(): Design {
    return cloneDesign(this.present);
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  counts(): { undo: number; redo: number } {
    return { undo: this.past.length, redo: this.future.length };
  }

  /**
   * Commits a new `Design` snapshot onto the history stack and clears redo
   * history. Returns `false` if `next` is identical to `present`.
   */
  commit(next: Design): boolean {
    if (designsEqual(this.present, next)) {
      return false;
    }
    this.past.push(cloneDesign(this.present));
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.present = cloneDesign(next);
    this.future = [];
    return true;
  }

  /**
   * Steps back to the previous `Design` snapshot, or returns `null` if at the
   * beginning of history.
   */
  undo(): Design | null {
    const prev = this.past.pop();
    if (!prev) {
      return null;
    }
    this.future.push(cloneDesign(this.present));
    this.present = prev;
    return this.current();
  }

  /**
   * Steps forward to the next `Design` snapshot, or returns `null` if at the
   * end of history.
   */
  redo(): Design | null {
    const next = this.future.pop();
    if (!next) {
      return null;
    }
    this.past.push(cloneDesign(this.present));
    this.present = next;
    return this.current();
  }
}

// ============================================================================
// Phase 3 (T-304): Cp–TSR Charts, A/B Comparison, and Experimental Data Logging
// ============================================================================

export interface TsrSweepPoint {
  tsr: number;
  rpm: number;
  cp: number;
  ct: number;
  cq: number;
  power_w: number;
  torque_nm: number;
  thrust_n: number;
}

export interface GeneratorMatchSummary {
  tip_speed_ratio: number;
  net_cp_electrical: number;
  generator: {
    rotor_rpm: number;
    generator_rpm?: number;
    back_emf_v?: number;
    terminal_voltage_v: number;
    current_a: number;
    torque_nm?: number;
    mechanical_power_w?: number;
    electrical_power_w: number;
    copper_loss_w?: number;
    efficiency: number;
  };
}

export interface StationAeroSummary {
  span_ratio: number;
  radius_mm: number;
  chord_mm: number;
  twist_deg: number;
  inflow_angle_deg: number;
  alpha_deg: number;
  axial_induction: number;
  tangential_induction: number;
  tip_loss_factor: number;
  reynolds: number;
  cl: number;
  cd: number;
  cn: number;
  ct: number;
  relative_speed_mps: number;
  thrust_per_m_n: number;
  torque_per_m_nm: number;
}

export interface AeroSimulationBundle {
  design_point: {
    omega_rad_s?: number;
    rpm: number;
    cp: number;
    ct: number;
    cq: number;
    power_w: number;
    thrust_n: number;
    torque_nm: number;
    stations?: StationAeroSummary[];
  };
  sweep: TsrSweepPoint[];
  peak_cp: number;
  peak_tsr: number;
  peak_power_w: number;
  generator_match?: GeneratorMatchSummary | null;
}

export interface ExperimentalDataPoint {
  tsr: number;
  cp: number;
  rpm?: number | null;
  power_w?: number | null;
  label?: string | null;
}

export interface ABComparisonMetrics {
  delta_design_cp: number;
  delta_peak_cp: number;
  delta_peak_tsr: number;
  delta_power_w: number;
}

export interface ExperimentalResidualRow {
  tsr: number;
  measured_cp: number;
  simulated_cp: number;
  error_cp: number;
}

export interface ExperimentalFitStats {
  count: number;
  rmse_cp: number;
  mae_cp: number;
  residuals: ExperimentalResidualRow[];
}

/**
 * Linearly interpolates `cp` from a sorted `TsrSweepPoint[]` curve at `tsr`.
 */
export function interpolateSweepCp(
  sweep: readonly TsrSweepPoint[],
  tsr: number,
): number {
  if (sweep.length === 0) return 0;
  if (sweep.length === 1 || tsr <= sweep[0]!.tsr) return sweep[0]!.cp;
  const last = sweep[sweep.length - 1]!;
  if (tsr >= last.tsr) return last.cp;

  for (let i = 0; i < sweep.length - 1; i++) {
    const p0 = sweep[i]!;
    const p1 = sweep[i + 1]!;
    if (tsr >= p0.tsr && tsr <= p1.tsr) {
      const span = Math.max(1e-9, p1.tsr - p0.tsr);
      const t = (tsr - p0.tsr) / span;
      return p0.cp + t * (p1.cp - p0.cp);
    }
  }
  return last.cp;
}

/**
 * Computes A/B comparison deltas (`B - A`) between a snapshotted Baseline A
 * simulation bundle and the current Design B simulation bundle.
 */
export function compareABSimulation(
  baselineA: AeroSimulationBundle,
  currentB: AeroSimulationBundle,
): ABComparisonMetrics {
  return {
    delta_design_cp: currentB.design_point.cp - baselineA.design_point.cp,
    delta_peak_cp: currentB.peak_cp - baselineA.peak_cp,
    delta_peak_tsr: currentB.peak_tsr - baselineA.peak_tsr,
    delta_power_w: currentB.design_point.power_w - baselineA.design_point.power_w,
  };
}

/**
 * Parses CSV or whitespace-separated experimental wind-tunnel / field test logs.
 * Supports:
 * - `tsr, cp` (e.g. `4.5, 0.42`)
 * - `tsr, cp, rpm, power_w`
 * - `rpm=<val>, power_w=<val>` (converts RPM & Watts to dimensionless TSR & Cp
 *   using `rotorRadiusMm`, `windSpeedMps`, and `airDensityKgM3`).
 */
export function parseExperimentalDataLog(
  text: string,
  rotorRadiusMm = 600,
  windSpeedMps = 8.0,
  airDensityKgM3 = 1.225,
): ExperimentalDataPoint[] {
  const points: ExperimentalDataPoint[] = [];
  const rM = Math.max(1e-3, rotorRadiusMm * 1e-3);
  const vInf = Math.max(1e-3, windSpeedMps);
  const pWind = 0.5 * airDensityKgM3 * Math.PI * rM * rM * vInf * vInf * vInf;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    // Key-value format: rpm=570, power_w=195
    if (line.toLowerCase().includes("rpm=")) {
      const rpmMatch = /rpm\s*=\s*([+-]?\d+(?:\.\d+)?)/i.exec(line);
      const pMatch = /power_w\s*=\s*([+-]?\d+(?:\.\d+)?)/i.exec(line);
      if (rpmMatch && pMatch) {
        const rpm = Number.parseFloat(rpmMatch[1]!);
        const powerW = Number.parseFloat(pMatch[1]!);
        if (Number.isFinite(rpm) && Number.isFinite(powerW) && rpm >= 0) {
          const omega = (rpm * 2 * Math.PI) / 60;
          const tsr = (omega * rM) / vInf;
          const cp = pWind > 0 ? powerW / pWind : 0;
          points.push({ tsr, cp, rpm, power_w: powerW });
        }
      }
      continue;
    }

    const parts = line.split(/[,\s;]+/).filter(Boolean);
    if (parts.length < 2) continue;
    const c0 = Number.parseFloat(parts[0]!);
    const c1 = Number.parseFloat(parts[1]!);
    if (!Number.isFinite(c0) || !Number.isFinite(c1)) continue;

    const rpm = parts.length >= 3 ? Number.parseFloat(parts[2]!) : null;
    const powerW = parts.length >= 4 ? Number.parseFloat(parts[3]!) : null;
    points.push({
      tsr: c0,
      cp: c1,
      rpm: rpm !== null && Number.isFinite(rpm) ? rpm : null,
      power_w: powerW !== null && Number.isFinite(powerW) ? powerW : null,
    });
  }

  return points;
}

/**
 * Evaluates residuals, MAE, and RMSE between experimental test points and a
 * simulated BEM `TsrSweepPoint[]` curve.
 */
export function evaluateExperimentalFit(
  sweep: readonly TsrSweepPoint[],
  points: readonly ExperimentalDataPoint[],
): ExperimentalFitStats {
  if (points.length === 0 || sweep.length === 0) {
    return { count: 0, rmse_cp: 0, mae_cp: 0, residuals: [] };
  }
  const residuals: ExperimentalResidualRow[] = [];
  let sumSq = 0;
  let sumAbs = 0;

  for (const pt of points) {
    const simCp = interpolateSweepCp(sweep, pt.tsr);
    const err = pt.cp - simCp;
    sumSq += err * err;
    sumAbs += Math.abs(err);
    residuals.push({
      tsr: pt.tsr,
      measured_cp: pt.cp,
      simulated_cp: simCp,
      error_cp: err,
    });
  }

  return {
    count: points.length,
    rmse_cp: Math.sqrt(sumSq / points.length),
    mae_cp: sumAbs / points.length,
    residuals,
  };
}

/**
 * Generates the SVG markup for the $C_p$–TSR performance chart, plotting:
 * - Betz limit ($C_p = 16/27 \approx 0.593$) dashed reference line
 * - Optional Baseline A $C_p(\lambda)$ curve (`class="curve-a"`)
 * - Active Design B $C_p(\lambda)$ curve (`class="curve-b"`)
 * - Experimental test data scatter points (`class="exp-point"`)
 */
export function renderCpTsrSvgMarkup(
  currentSweep: readonly TsrSweepPoint[],
  options: {
    baselineASweep?: readonly TsrSweepPoint[] | null;
    experimentalPoints?: readonly ExperimentalDataPoint[];
    designTsr?: number;
  } = {},
): string {
  const w = 320;
  const h = 155;
  const padX = 28;
  const padY = 18;
  const xMin = 1.0;
  const xMax = 9.5;
  const yMin = 0.0;
  const yMax = 0.65;

  const toX = (tsr: number) =>
    padX + ((Math.min(xMax, Math.max(xMin, tsr)) - xMin) / (xMax - xMin)) * (w - 2 * padX);
  const toY = (cp: number) =>
    h - padY - ((Math.min(yMax, Math.max(yMin, cp)) - yMin) / (yMax - yMin)) * (h - 2 * padY);

  const buildPath = (sweep: readonly TsrSweepPoint[]): string =>
    sweep
      .map((pt, i) => `${i === 0 ? "M" : "L"}${toX(pt.tsr).toFixed(1)},${toY(pt.cp).toFixed(1)}`)
      .join(" ");

  const betzY = toY(16.0 / 27.0).toFixed(1);
  const parts: string[] = [
    `<line class="betz-limit" x1="${padX}" y1="${betzY}" x2="${w - padX}" y2="${betzY}" stroke="#e5484d" stroke-width="1" stroke-dasharray="4 3" />`,
  ];

  if (options.designTsr !== undefined && Number.isFinite(options.designTsr)) {
    const dx = toX(options.designTsr).toFixed(1);
    parts.push(
      `<line class="design-tsr" x1="${dx}" y1="${padY}" x2="${dx}" y2="${h - padY}" stroke="#262c3a" stroke-width="1" stroke-dasharray="2 2" />`,
    );
  }

  if (options.baselineASweep && options.baselineASweep.length > 0) {
    parts.push(
      `<path class="curve-a" d="${buildPath(options.baselineASweep)}" fill="none" stroke="#7a8296" stroke-width="1.5" stroke-dasharray="4 3" />`,
    );
  }

  if (currentSweep.length > 0) {
    parts.push(
      `<path class="curve-b" d="${buildPath(currentSweep)}" fill="none" stroke="#38bdf8" stroke-width="2" />`,
    );
  }

  for (const exp of options.experimentalPoints ?? []) {
    const cx = toX(exp.tsr).toFixed(1);
    const cy = toY(exp.cp).toFixed(1);
    parts.push(
      `<circle class="exp-point" data-tsr="${exp.tsr}" data-cp="${exp.cp}" cx="${cx}" cy="${cy}" r="3.5" fill="#f59e0b" stroke="#07080d" stroke-width="1.2" />`,
    );
  }

  parts.push(
    `<g class="chart-crosshair" style="display:none;pointer-events:none">` +
      `<line class="ch-line" x1="${padX}" y1="${padY}" x2="${padX}" y2="${h - padY}" stroke="#edeff5" stroke-width="1" stroke-dasharray="2 2" opacity="0.65" />` +
      `<circle class="ch-dot-secondary" cx="${padX}" cy="${h - padY}" r="3.2" fill="#7a8296" stroke="#07080d" stroke-width="1.2" style="display:none" />` +
      `<circle class="ch-dot-primary" cx="${padX}" cy="${h - padY}" r="4" fill="#38bdf8" stroke="#07080d" stroke-width="1.5" />` +
      `</g>`,
  );

  return parts.join("\n");
}

export interface CpTsrHoverInspection {
  tsr: number;
  cp: number;
  cp_baseline_a: number | null;
  betz_pct: number;
  rpm: number;
  svg_x: number;
  svg_y_b: number;
  svg_y_a: number | null;
  readout: string;
}

/**
 * Computes interpolated $C_p$–TSR values and SVG crosshair coordinates at a
 * pointer `svgX` position (`0..320` viewBox coordinates).
 */
export function inspectCpTsrAtSvgX(
  svgX: number,
  currentSweep: readonly TsrSweepPoint[],
  baselineASweep: readonly TsrSweepPoint[] | null = null,
  rotorRadiusMm = 600,
  windSpeedMps = 8.0,
): CpTsrHoverInspection {
  const w = 320;
  const h = 155;
  const padX = 28;
  const padY = 18;
  const xMin = 1.0;
  const xMax = 9.5;
  const yMin = 0.0;
  const yMax = 0.65;

  const clampedX = Math.min(w - padX, Math.max(padX, svgX));
  const frac = (clampedX - padX) / Math.max(1e-6, w - 2 * padX);
  const tsr = xMin + frac * (xMax - xMin);
  const cp = interpolateSweepCp(currentSweep, tsr);
  const toY = (val: number) =>
    h - padY - ((Math.min(yMax, Math.max(yMin, val)) - yMin) / (yMax - yMin)) * (h - 2 * padY);

  const svgYB = toY(cp);
  let cpA: number | null = null;
  let svgYA: number | null = null;
  if (baselineASweep && baselineASweep.length > 0) {
    cpA = interpolateSweepCp(baselineASweep, tsr);
    svgYA = toY(cpA);
  }

  const betzPct = Math.max(0, (cp / (16.0 / 27.0)) * 100);
  const rM = Math.max(1e-3, rotorRadiusMm * 1e-3);
  const rpm = ((tsr * Math.max(0.1, windSpeedMps)) / rM) * (60 / (2 * Math.PI));
  const deltaStr =
    cpA !== null ? `  ΔA ${(cp - cpA) >= 0 ? "+" : ""}${(cp - cpA).toFixed(3)}` : "";

  return {
    tsr,
    cp,
    cp_baseline_a: cpA,
    betz_pct: betzPct,
    rpm,
    svg_x: clampedX,
    svg_y_b: svgYB,
    svg_y_a: svgYA,
    readout: `λ ${tsr.toFixed(2)}  |  Cp ${cp.toFixed(3)} (${betzPct.toFixed(0)}% Betz)  |  ${rpm.toFixed(0)} RPM${deltaStr}`,
  };
}

export interface AirfoilPreviewHoleOptions {
  diameterMm: number;
  offsetXMm?: number;
  offsetYMm?: number;
  jointShape?: string;
  jointCount?: number;
  jointSizeMm?: number;
  jointLengthMm?: number;
}

/**
 * Generates an SVG cross-section diagram of the blade's primary airfoil
 * showing the upper/lower contour, mean camber line, chord line, the
 * pitch-axis pivot marker at `x/c = rotor.pitch_axis_ratio`, and an optional
 * carbon-fiber spar tube bore circle.
 */
export function renderAirfoilSectionSvgMarkup(
  design: Design,
  holeSpec?: AirfoilPreviewHoleOptions,
): string {
  const w = 320;
  const h = 92;
  const padX = 22;
  const midY = 52;
  const scale = w - 2 * padX;

  const primary = design.airfoils[0]?.airfoil;
  let m = 0.04;
  let p = 0.4;
  let t = 0.12;
  let label = "NACA 4412";

  if (primary) {
    if (primary.type === "named") {
      label = primary.name;
      if (primary.name === "SG6043") {
        m = 0.055;
        p = 0.42;
        t = 0.1;
      } else if (primary.name === "SD7062") {
        m = 0.038;
        p = 0.38;
        t = 0.14;
      } else if (primary.name === "E387") {
        m = 0.032;
        p = 0.4;
        t = 0.091;
      } else if (primary.name === "S833") {
        m = 0.025;
        p = 0.787;
        t = 0.18;
      }
    } else {
      m = primary.max_camber;
      p = primary.camber_position > 0 ? primary.camber_position : 0.4;
      t = primary.thickness_ratio;
      label = `NACA t=${(t * 100).toFixed(1)}% m=${(m * 100).toFixed(1)}%`;
    }
  }

  const samples = 48;
  const upperPts: string[] = [];
  const lowerPts: string[] = [];
  const camberPts: string[] = [];

  for (let i = 0; i <= samples; i++) {
    const beta = (Math.PI * i) / samples;
    const xc = 0.5 * (1 - Math.cos(beta));
    const yt =
      5 *
      t *
      (0.2969 * Math.sqrt(xc) -
        0.126 * xc -
        0.3516 * xc * xc +
        0.2843 * xc * xc * xc -
        0.1015 * xc * xc * xc * xc);
    let yc = 0;
    let dyc = 0;
    if (m > 0 && p > 0 && p < 1) {
      if (xc < p) {
        yc = (m / (p * p)) * (2 * p * xc - xc * xc);
        dyc = ((2 * m) / (p * p)) * (p - xc);
      } else {
        yc = (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * xc - xc * xc);
        dyc = ((2 * m) / ((1 - p) * (1 - p))) * (p - xc);
      }
    }
    const theta = Math.atan(dyc);
    const xu = xc - yt * Math.sin(theta);
    const yu = yc + yt * Math.cos(theta);
    const xl = xc + yt * Math.sin(theta);
    const yl = yc - yt * Math.cos(theta);

    const toSvgX = (xVal: number) => (padX + xVal * scale).toFixed(1);
    const toSvgY = (yVal: number) => (midY - yVal * scale * 1.35).toFixed(1);

    upperPts.push(`${toSvgX(xu)},${toSvgY(yu)}`);
    lowerPts.unshift(`${toSvgX(xl)},${toSvgY(yl)}`);
    camberPts.push(`${i === 0 ? "M" : "L"}${toSvgX(xc)},${toSvgY(yc)}`);
  }

  const contourPoly = [...upperPts, ...lowerPts].join(" ");
  const pivotX = (padX + design.rotor.pitch_axis_ratio * scale).toFixed(1);

  const elements = [
    `<line x1="${padX}" y1="${midY}" x2="${w - padX}" y2="${midY}" stroke="#262c3a" stroke-width="1" stroke-dasharray="3 3" />`,
    `<polygon class="airfoil-contour" points="${contourPoly}" fill="rgba(56, 189, 248, 0.14)" stroke="#38bdf8" stroke-width="1.5" />`,
    `<path class="airfoil-camber" d="${camberPts.join(" ")}" fill="none" stroke="#7a8296" stroke-width="1" stroke-dasharray="2 2" />`,
    `<line x1="${pivotX}" y1="12" x2="${pivotX}" y2="${h - 8}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 2" />`,
  ];

  const rootChordMm = Math.max(resolveStationsPreview(design)[0]?.effective_chord_mm ?? 70, 5);
  const maxThickMm = t * rootChordMm;
  let coreXc = 0.3;
  let coreYc = 0.75 * m;
  let effRadiusMm = 0;

  if (holeSpec && holeSpec.diameterMm > 0.1) {
    effRadiusMm = Math.min(0.5 * holeSpec.diameterMm, 0.38 * maxThickMm);
    const oxMm = Math.max(-0.15 * maxThickMm, Math.min(0.15 * maxThickMm, holeSpec.offsetXMm ?? 0));
    const oyMm = Math.max(-0.15 * maxThickMm, Math.min(0.15 * maxThickMm, holeSpec.offsetYMm ?? 0));
    coreXc = 0.3 + oxMm / rootChordMm;
    coreYc = 0.75 * m + oyMm / rootChordMm;
    const holeCx = (padX + coreXc * scale).toFixed(1);
    const holeCy = (midY - coreYc * scale * 1.35).toFixed(1);
    const holeR = Math.max(2.2, (effRadiusMm / rootChordMm) * scale * 1.35).toFixed(1);
    elements.push(
      `<circle class="spar-hole-circle" cx="${holeCx}" cy="${holeCy}" r="${holeR}" fill="rgba(76, 195, 138, 0.22)" stroke="#4cc38a" stroke-width="1.5" />`,
    );
  }

  if (holeSpec?.jointShape && holeSpec.jointShape !== "none") {
    const shape = holeSpec.jointShape;
    const count = Math.max(1, Math.min(2, holeSpec.jointCount ?? 2));
    const halfW = Math.max(0.8, 0.5 * (holeSpec.jointSizeMm ?? 3.0));
    const halfL =
      shape === "round" || shape === "snaplock"
        ? halfW
        : Math.max(1.2, 0.5 * (holeSpec.jointLengthMm ?? 6.0));
    const signs = count === 2 ? [-1, 1] : effRadiusMm > 0 ? [1] : [0];
    const spacingMm = effRadiusMm + Math.hypot(halfL, halfW) + 1.2;

    for (const sgn of signs) {
      const jx = padX + (coreXc + (sgn * spacingMm) / rootChordMm) * scale;
      const jy = midY - coreYc * scale * 1.35;
      const rx = Math.max(2.0, (halfL / rootChordMm) * scale);
      const ry = Math.max(1.8, (halfW / rootChordMm) * scale * 1.35);

      if (shape === "round" || shape === "snaplock") {
        elements.push(
          `<circle class="joint-preview" cx="${jx.toFixed(1)}" cy="${jy.toFixed(1)}" r="${ry.toFixed(1)}" fill="rgba(245, 158, 11, 0.28)" stroke="#f59e0b" stroke-width="1.3" />`,
        );
      } else if (shape === "dovetail") {
        const wy = ry * 0.52;
        const pts = [
          `${jx.toFixed(1)},${(jy + wy).toFixed(1)}`,
          `${(jx + rx).toFixed(1)},${(jy + ry).toFixed(1)}`,
          `${(jx + rx).toFixed(1)},${(jy - ry).toFixed(1)}`,
          `${jx.toFixed(1)},${(jy - wy).toFixed(1)}`,
          `${(jx - rx).toFixed(1)},${(jy - ry).toFixed(1)}`,
          `${(jx - rx).toFixed(1)},${(jy + ry).toFixed(1)}`,
        ].join(" ");
        elements.push(
          `<polygon class="joint-preview" points="${pts}" fill="rgba(245, 158, 11, 0.28)" stroke="#f59e0b" stroke-width="1.3" />`,
        );
      } else if (shape === "cruciform") {
        const tl = rx * 0.38;
        const tw = ry * 0.42;
        const pts = [
          `${(jx + tl).toFixed(1)},${(jy + ry).toFixed(1)}`,
          `${(jx + tl).toFixed(1)},${(jy + tw).toFixed(1)}`,
          `${(jx + rx).toFixed(1)},${(jy + tw).toFixed(1)}`,
          `${(jx + rx).toFixed(1)},${(jy - tw).toFixed(1)}`,
          `${(jx + tl).toFixed(1)},${(jy - tw).toFixed(1)}`,
          `${(jx + tl).toFixed(1)},${(jy - ry).toFixed(1)}`,
          `${(jx - tl).toFixed(1)},${(jy - ry).toFixed(1)}`,
          `${(jx - tl).toFixed(1)},${(jy - tw).toFixed(1)}`,
          `${(jx - rx).toFixed(1)},${(jy - tw).toFixed(1)}`,
          `${(jx - rx).toFixed(1)},${(jy + tw).toFixed(1)}`,
          `${(jx - tl).toFixed(1)},${(jy + tw).toFixed(1)}`,
          `${(jx - tl).toFixed(1)},${(jy + ry).toFixed(1)}`,
        ].join(" ");
        elements.push(
          `<polygon class="joint-preview" points="${pts}" fill="rgba(245, 158, 11, 0.28)" stroke="#f59e0b" stroke-width="1.3" />`,
        );
      } else {
        elements.push(
          `<rect class="joint-preview" x="${(jx - rx).toFixed(1)}" y="${(jy - ry).toFixed(1)}" width="${(2 * rx).toFixed(1)}" height="${(2 * ry).toFixed(1)}" fill="rgba(245, 158, 11, 0.28)" stroke="#f59e0b" stroke-width="1.3" />`,
        );
      }
    }
  }

  elements.push(
    `<circle class="pitch-axis-dot" cx="${pivotX}" cy="${midY}" r="3.8" fill="#f59e0b" stroke="#07080d" stroke-width="1.4" />`,
    `<text x="${padX}" y="14" fill="#7a8296" font-size="10" font-family="'IBM Plex Mono', ui-monospace, monospace">${label}  [x/c ${design.rotor.pitch_axis_ratio.toFixed(2)}]</text>`,
  );

  return elements.join("\n");
}

// ---- Full Workbench Snapshot & Auto-Save / Load Helpers ----

export const AUTOSAVE_STORAGE_KEY = "bladelab.autosave.v1";
export const SAVED_SLOTS_STORAGE_KEY = "bladelab.slots.v1";

export interface FabricationSnapshot {
  spar_hole_enabled: boolean;
  spar_show_rod: boolean;
  spar_hole_diameter_mm: number;
  spar_hole_depth_mm: number;
  spar_hole_offset_x_mm: number;
  spar_hole_offset_y_mm: number;
  spar_hole_tolerance_mm: number;
  split_parts: number;
  split_active_part: string;
  split_ratio_pct: number;
  split_explode_gap_mm: number;
  align_shape: string;
  align_count: number;
  align_size_mm: number;
  align_key_length_mm: number;
  align_height_mm: number;
  align_spacing_mm: number;
  align_clearance_mm: number;
  align_depth_clearance_mm: number;
  align_min_wall_mm: number;
}

export type StructuralMaterialKey = "pla" | "petg" | "asa" | "pacf";
export type HeatmapMode = "segment" | "alpha" | "cl_cd" | "torque" | "wall_stress" | "wind_impact";

export interface WingletConfig {
  enabled: boolean;
  cant_angle_deg: number;  // 15..75 deg out-of-plane dihedral bend
  height_mm: number;       // 5..50 mm tip upward extension
  sweep_angle_deg: number; // 0..25 deg backward aerodynamic sweep
  blend_radius_mm: number; // 5..40 mm blend transition radius
}
export type PrinterPresetKey = "bambu_256" | "prusa_mk4" | "ender3" | "voron_350" | "custom";
export type BladeWindPresetKey =
  | "low_wind"
  | "med_kidwind"
  | "scimitar_belly"
  | "high_wind"
  | "schmitz_600";
export type GeneratorPresetKey =
  | "kidwind_red"
  | "kidwind_gen2"
  | "outrunner_bldc"
  | "low_rpm_pmg"
  | "custom";

export interface WorkbenchUiSnapshot {
  planform_cosine: boolean;
  planform_center_pct: number;
  planform_width_pct: number;
  locked_span_ratios: number[];
  bind_taper: boolean;
  taper_ratio: number;
  chord_offset_x_mm: number;
  chord_offset_y_mm: number;
  global_light_intensity: number;
  view_mode: "single" | "rotor" | "gearbox";
  wireframe_mode: boolean;
  heatmap_mode?: HeatmapMode;
  structural_material?: StructuralMaterialKey;
  site_avg_wind_mps?: number;
  printer_preset?: PrinterPresetKey;
  printer_max_z_mm?: number;
  blade_preset?: BladeWindPresetKey;
  gen_preset?: GeneratorPresetKey;
  gen_gear_ratio?: number;
  gen_kv: number;
  gen_r_int: number;
  gen_r_load: number;
  exp_data_log: string;
  gearbox?: GearboxConfig;
  studio_mode?: "blade" | "gearbox";
  gearbox_selected_gear?: 1 | 2 | 3 | null;
  gearbox_inspector_open?: boolean;
  collective_pitch_deg?: number;
  winglet?: WingletConfig;
  flip_blade?: boolean;
}

export interface WorkbenchSnapshot {
  bladelab_snapshot_version: 1;
  saved_at: string;
  name?: string;
  design: Design;
  fabrication: FabricationSnapshot;
  workbench: WorkbenchUiSnapshot;
}

export interface SavedSlotEntry {
  id: string;
  name: string;
  saved_at: string;
  snapshot: WorkbenchSnapshot;
}

/**
 * Returns factory default fabrication settings matching `web/index.html`.
 */
export function defaultFabricationSnapshot(): FabricationSnapshot {
  return {
    spar_hole_enabled: false,
    spar_show_rod: true,
    spar_hole_diameter_mm: 5.0,
    spar_hole_depth_mm: 240,
    spar_hole_offset_x_mm: 0.0,
    spar_hole_offset_y_mm: 0.0,
    spar_hole_tolerance_mm: 0.2,
    split_parts: 1,
    split_active_part: "all",
    split_ratio_pct: 50,
    split_explode_gap_mm: 0,
    align_shape: "round",
    align_count: 2,
    align_size_mm: 3.0,
    align_key_length_mm: 6.0,
    align_height_mm: 6.0,
    align_spacing_mm: 0,
    align_clearance_mm: 0.2,
    align_depth_clearance_mm: 0.5,
    align_min_wall_mm: 0.8,
  };
}

/**
 * Returns factory default workbench UI settings matching `web/index.html`.
 */
export function defaultWorkbenchUiSnapshot(): WorkbenchUiSnapshot {
  return {
    planform_cosine: false,
    planform_center_pct: 45,
    planform_width_pct: 25,
    locked_span_ratios: [],
    bind_taper: false,
    taper_ratio: 0.457,
    chord_offset_x_mm: 0,
    chord_offset_y_mm: 0,
    global_light_intensity: 1.35,
    view_mode: "rotor",
    wireframe_mode: false,
    heatmap_mode: "segment",
    structural_material: "petg",
    site_avg_wind_mps: 5.5,
    printer_preset: "bambu_256",
    printer_max_z_mm: 256,
    blade_preset: "schmitz_600",
    gen_preset: "low_rpm_pmg",
    gen_gear_ratio: 1.0,
    gen_kv: 35,
    gen_r_int: 0.8,
    gen_r_load: 12.0,
    exp_data_log: "",
    gearbox: defaultGearboxConfig(),
    studio_mode: "blade",
    gearbox_selected_gear: null,
    gearbox_inspector_open: true,
    collective_pitch_deg: 0.0,
    winglet: {
      enabled: false,
      cant_angle_deg: 50.0,
      height_mm: 22.0,
      sweep_angle_deg: 10.0,
      blend_radius_mm: 15.0,
    },
    flip_blade: true,
  };
}

/**
 * Builds a complete `WorkbenchSnapshot` from a `Design` and optional partial
 * fabrication / workbench UI overrides.
 */
export function createWorkbenchSnapshot(
  design: Design,
  fabrication: Partial<FabricationSnapshot> = {},
  workbench: Partial<WorkbenchUiSnapshot> = {},
  name?: string,
  savedAt?: string,
): WorkbenchSnapshot {
  const clonedDesign = cloneDesign(design);
  if (Array.isArray(clonedDesign.overrides) && clonedDesign.overrides.length > 0) {
    const hubRatio = clonedDesign.rotor.hub_radius_mm / clonedDesign.rotor.radius_mm;
    clonedDesign.overrides = adaptOverridesToRotor(
      clonedDesign.overrides,
      hubRatio,
      hubRatio,
      clonedDesign.rotor,
    );
  }
  const fab: FabricationSnapshot = {
    ...defaultFabricationSnapshot(),
    ...fabrication,
  };
  const wb: WorkbenchUiSnapshot = {
    ...defaultWorkbenchUiSnapshot(),
    ...workbench,
    locked_span_ratios: Array.isArray(workbench.locked_span_ratios)
      ? [...workbench.locked_span_ratios]
      : [],
  };

  // Auto-infer planform cosine parameters when chord_mm uses a cosine plateau formula
  if (
    workbench.planform_cosine === undefined &&
    clonedDesign.distributions.chord_mm.type === "formula"
  ) {
    const parsed = parseCosinePlateauExpr(clonedDesign.distributions.chord_mm.expr);
    if (parsed) {
      wb.planform_cosine = true;
      wb.planform_center_pct = Math.round(parsed.center * 100);
      wb.planform_width_pct = Math.round(parsed.width * 100);
    }
  }

  const snapshot: WorkbenchSnapshot = {
    bladelab_snapshot_version: 1,
    saved_at: savedAt ?? new Date().toISOString(),
    design: clonedDesign,
    fabrication: fab,
    workbench: wb,
  };
  if (name && name.trim().length > 0) {
    snapshot.name = name.trim();
  }
  return snapshot;
}

function isValidDesignObject(obj: unknown): obj is Design {
  if (!obj || typeof obj !== "object") return false;
  const rec = obj as Record<string, unknown>;
  const rotor = rec.rotor as Record<string, unknown> | undefined;
  const dist = rec.distributions as Record<string, unknown> | undefined;
  const airfoils = rec.airfoils;
  if (!rotor || typeof rotor !== "object") return false;
  if (typeof rotor.radius_mm !== "number" || !Number.isFinite(rotor.radius_mm)) return false;
  if (typeof rotor.hub_radius_mm !== "number" || !Number.isFinite(rotor.hub_radius_mm)) return false;
  if (typeof rotor.blade_count !== "number" || !Number.isFinite(rotor.blade_count)) return false;
  if (!dist || typeof dist !== "object" || !dist.chord_mm || !dist.twist_deg) return false;
  if (!Array.isArray(airfoils) || airfoils.length === 0) return false;
  return true;
}

/**
 * Parses either a full `WorkbenchSnapshot` JSON or a plain `Design` JSON string
 * (such as `naca4412-linear.json` or legacy exports) into a validated `WorkbenchSnapshot`.
 */
export function parseLoadedProjectJson(rawJson: string): WorkbenchSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    throw new Error(`Invalid JSON syntax: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Project JSON must be an object.");
  }

  const record = parsed as Record<string, unknown>;

  // Case 1: Full WorkbenchSnapshot (or Cloud Design wrapper `{ design: Design, name?: string }`)
  if ("design" in record && isValidDesignObject(record.design)) {
    const fabRaw =
      record.fabrication && typeof record.fabrication === "object"
        ? (record.fabrication as Partial<FabricationSnapshot>)
        : {};
    const wbRaw =
      record.workbench && typeof record.workbench === "object"
        ? (record.workbench as Partial<WorkbenchUiSnapshot>)
        : {};
    const name = typeof record.name === "string" ? record.name : undefined;
    const savedAt = typeof record.saved_at === "string" ? record.saved_at : undefined;
    return createWorkbenchSnapshot(record.design, fabRaw, wbRaw, name, savedAt);
  }

  // Case 2: Plain BladeLab `Design` JSON
  if (isValidDesignObject(record)) {
    return createWorkbenchSnapshot(record);
  }

  throw new Error(
    "Unrecognized JSON schema: expected a BladeLab WorkbenchSnapshot or Design object with rotor, distributions, and airfoils.",
  );
}

/**
 * Inserts or updates a named saved slot in the slots array (most recent first),
 * bounded to `maxSlots` entries.
 */
export function upsertSavedSlot(
  slots: readonly SavedSlotEntry[],
  snapshot: WorkbenchSnapshot,
  name: string,
  id?: string,
  maxSlots = 25,
): SavedSlotEntry[] {
  const cleanName =
    name.trim() ||
    snapshot.name ||
    `Rotor R${snapshot.design.rotor.radius_mm} B${snapshot.design.rotor.blade_count}`;
  const nowIso = new Date().toISOString();
  const existingIdx = id
    ? slots.findIndex((s) => s.id === id)
    : slots.findIndex((s) => s.name.toLowerCase() === cleanName.toLowerCase());

  const slotId =
    existingIdx >= 0
      ? slots[existingIdx]!.id
      : id || `slot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const snapWithMeta: WorkbenchSnapshot = {
    ...createWorkbenchSnapshot(
      snapshot.design,
      snapshot.fabrication,
      snapshot.workbench,
      cleanName,
      nowIso,
    ),
  };

  const entry: SavedSlotEntry = {
    id: slotId,
    name: cleanName,
    saved_at: nowIso,
    snapshot: snapWithMeta,
  };

  const remaining = slots.filter((_, idx) => idx !== existingIdx);
  return [entry, ...remaining].slice(0, Math.max(1, maxSlots));
}

/**
 * Removes a saved slot by `id`.
 */
export function removeSavedSlot(
  slots: readonly SavedSlotEntry[],
  id: string,
): SavedSlotEntry[] {
  return slots.filter((s) => s.id !== id);
}

// ============================================================================
// Feature #1: Structural & Root-Bending Mechanics + CF Spar Safety Factor
// ============================================================================

export interface MaterialSpec {
  name: string;
  density_kg_m3: number;
  modulus_gpa: number;
  yield_mpa: number;
  shell_infill_factor: number;
}

export const STRUCTURAL_MATERIALS: Record<StructuralMaterialKey, MaterialSpec> = {
  pla: {
    name: "PLA (Standard 3D Print)",
    density_kg_m3: 1240,
    modulus_gpa: 3.1,
    yield_mpa: 45,
    shell_infill_factor: 0.42,
  },
  petg: {
    name: "PETG (Tough / Outdoor)",
    density_kg_m3: 1270,
    modulus_gpa: 2.1,
    yield_mpa: 42,
    shell_infill_factor: 0.42,
  },
  asa: {
    name: "ASA (UV / Weather Resistant)",
    density_kg_m3: 1070,
    modulus_gpa: 2.2,
    yield_mpa: 40,
    shell_infill_factor: 0.42,
  },
  pacf: {
    name: "PA-CF (Carbon-Reinforced Nylon)",
    density_kg_m3: 1180,
    modulus_gpa: 6.8,
    yield_mpa: 85,
    shell_infill_factor: 0.48,
  },
};

export interface StationStructuralRow {
  span_ratio: number;
  radius_mm: number;
  chord_mm: number;
  thickness_mm: number;
  bending_moment_nm: number;
  shell_stress_mpa: number;
  cf_stress_mpa: number;
  safety_factor: number;
}

export interface StructuralMechanicsReport {
  material: StructuralMaterialKey;
  material_name: string;
  root_moment_nm: number;
  split_moment_nm: number;
  centrifugal_root_n: number;
  centrifugal_runaway_n: number;
  blade_mass_g: number;
  tip_deflection_mm: number;
  tip_deflection_pct: number;
  root_safety_factor: number;
  joint_safety_factor: number;
  max_shell_stress_mpa: number;
  status: "safe" | "caution" | "critical";
  recommendation: string;
  stations: StationStructuralRow[];
}

/**
 * Integrates spanwise aerodynamic flapwise loads (`thrust_per_m_n / B`) and
 * centrifugal inertia from tip (`R`) to hub root (`r0`) to compute root &
 * split-plane bending moments, composite CF-tube + 3D-printed shell stress,
 * safety factors, and Euler–Bernoulli tip deflection.
 */
export function evaluateStructuralMechanics(
  design: Design,
  bundle: AeroSimulationBundle,
  fabrication: FabricationSnapshot,
  materialKey: StructuralMaterialKey = "petg",
): StructuralMechanicsReport {
  const mat = STRUCTURAL_MATERIALS[materialKey] ?? STRUCTURAL_MATERIALS.petg;
  const { rotor } = design;
  const B = Math.max(1, rotor.blade_count);
  const r0Mm = rotor.hub_radius_mm;
  const rTipMm = rotor.radius_mm;
  const bladeLenMm = Math.max(10, rTipMm - r0Mm);
  const bladeLenM = bladeLenMm * 1e-3;

  const previewStations = resolveStationsPreview(design);
  const aeroStations = bundle.design_point.stations ?? [];
  const N = previewStations.length;

  // Build radial grid r_i (m), chord c_i (m), thickness t_i (m), and per-blade normal load q_n (N/m)
  const rM: number[] = [];
  const cMm: number[] = [];
  const tMm: number[] = [];
  const qNormalNPerM: number[] = [];

  const totalThrustPerBladeN = Math.max(0.05, bundle.design_point.thrust_n / B);

  for (let i = 0; i < N; i++) {
    const st = previewStations[i]!;
    const rCurrMm = st.radius_mm;
    const cCurrMm = Math.max(4, st.effective_chord_mm);
    // Interpolate thickness ratio from design.airfoils
    const tcRatio = airfoilThicknessRatioAtSpan(design, st.span_ratio);
    const thickMm = Math.max(1.2, cCurrMm * tcRatio);

    // Match or interpolate thrust_per_m_n from aeroStations
    let dTdrTotal = 0;
    if (aeroStations.length > 0) {
      dTdrTotal = interpolateStationField(aeroStations, st.span_ratio, "thrust_per_m_n");
    } else {
      // Triangular spanwise load fallback if stations array absent
      dTdrTotal = (2 * totalThrustPerBladeN * B * st.span_ratio) / bladeLenM;
    }

    rM.push(rCurrMm * 1e-3);
    cMm.push(cCurrMm);
    tMm.push(thickMm);
    qNormalNPerM.push(Math.max(0, dTdrTotal / B));
  }

  // Spanwise integration of bending moment M(r_i) = \int_{r_i}^{R} q_n(\xi) (\xi - r_i) d\xi
  const momentNm = new Array<number>(N).fill(0);
  for (let i = 0; i < N; i++) {
    let m = 0;
    const ri = rM[i]!;
    for (let j = i; j < N - 1; j++) {
      const rA = rM[j]!;
      const rB = rM[j + 1]!;
      const dr = Math.max(0, rB - rA);
      const qA = qNormalNPerM[j]! * (rA - ri);
      const qB = qNormalNPerM[j + 1]! * (rB - ri);
      m += 0.5 * (qA + qB) * dr;
    }
    momentNm[i] = m;
  }

  // Carbon-fiber pultruded spar tube properties
  const cfEnabled = Boolean(fabrication.spar_hole_enabled && fabrication.spar_hole_diameter_mm >= 1);
  const dCfOutM = cfEnabled ? fabrication.spar_hole_diameter_mm * 1e-3 : 0;
  const wallCfM = Math.min(0.0012, 0.22 * dCfOutM);
  const dCfInM = Math.max(0, dCfOutM - 2 * wallCfM);
  const iCfM4 = cfEnabled ? (Math.PI / 64) * (dCfOutM ** 4 - dCfInM ** 4) : 0;
  const aCfM2 = cfEnabled ? (Math.PI / 4) * (dCfOutM ** 2 - dCfInM ** 2) : 0;
  const eCfPa = 115e9;
  const yieldCfMpa = 850;
  const cfDepthMm = cfEnabled ? Math.max(0, fabrication.spar_hole_depth_mm) : 0;

  const eShellPa = mat.modulus_gpa * 1e9;
  const omegaRadS =
    bundle.design_point.omega_rad_s ?? (bundle.design_point.rpm * 2 * Math.PI) / 60;

  let bladeMassKg = 0;
  let centrifugalRootN = 0;
  let maxShellStressMpa = 0;
  const curvaturePerM = new Array<number>(N).fill(0);
  const stationRows: StationStructuralRow[] = [];

  for (let i = 0; i < N; i++) {
    const st = previewStations[i]!;
    const spanDistMm = st.radius_mm - r0Mm;
    const hasCfHere = cfEnabled && spanDistMm <= cfDepthMm + 1e-3;

    const cM = cMm[i]! * 1e-3;
    const tM = tMm[i]! * 1e-3;

    // Effective printed airfoil cross-section area and flapwise second moment of area I_xx
    const aShellM2 = Math.max(1e-7, 0.65 * cM * tM * mat.shell_infill_factor - (hasCfHere ? (Math.PI / 4) * dCfOutM ** 2 : 0));
    const iShellM4 = Math.max(
      1e-13,
      0.036 * cM * tM ** 3 * (0.55 + 0.45 * mat.shell_infill_factor) -
        (hasCfHere ? (Math.PI / 64) * dCfOutM ** 4 : 0),
    );

    const eiTotalNm2 = eShellPa * iShellM4 + (hasCfHere ? eCfPa * iCfM4 : 0);
    const mNm = momentNm[i]!;
    const kappa = eiTotalNm2 > 0 ? mNm / eiTotalNm2 : 0;
    curvaturePerM[i] = kappa;

    // Outer fiber bending stress: \sigma = E * \kappa * (t / 2)
    const shellStressMpa = (eShellPa * kappa * (0.5 * tM)) * 1e-6;
    const cfStressMpa = hasCfHere ? (eCfPa * kappa * (0.5 * dCfOutM)) * 1e-6 : 0;
    maxShellStressMpa = Math.max(maxShellStressMpa, shellStressMpa);

    const sfShell = shellStressMpa > 1e-4 ? mat.yield_mpa / shellStressMpa : 99.9;
    const sfCf = hasCfHere && cfStressMpa > 1e-4 ? yieldCfMpa / cfStressMpa : 99.9;
    const sfStation = Math.min(99.9, Math.min(sfShell, sfCf));

    stationRows.push({
      span_ratio: st.span_ratio,
      radius_mm: st.radius_mm,
      chord_mm: cMm[i]!,
      thickness_mm: tMm[i]!,
      bending_moment_nm: mNm,
      shell_stress_mpa: shellStressMpa,
      cf_stress_mpa: cfStressMpa,
      safety_factor: sfStation,
    });

    if (i < N - 1) {
      const drM = Math.max(0, rM[i + 1]! - rM[i]!);
      const rMidM = 0.5 * (rM[i]! + rM[i + 1]!);
      const linearMassKgPerM =
        mat.density_kg_m3 * aShellM2 + (hasCfHere ? 1550 * aCfM2 : 0);
      const dmKg = linearMassKgPerM * drM;
      bladeMassKg += dmKg;
      centrifugalRootN += dmKg * omegaRadS * omegaRadS * rMidM;
    }
  }

  // Double integration of curvature \kappa(r) from root (i=0) to tip (i=N-1)
  let slopeRad = 0;
  let tipDeflectionM = 0;
  for (let i = 0; i < N - 1; i++) {
    const dr = Math.max(0, rM[i + 1]! - rM[i]!);
    const kAvg = 0.5 * (curvaturePerM[i]! + curvaturePerM[i + 1]!);
    const dSlope = kAvg * dr;
    tipDeflectionM += slopeRad * dr + 0.5 * kAvg * dr * dr;
    slopeRad += dSlope;
  }

  const tipDeflectionMm = tipDeflectionM * 1000;
  const tipDeflectionPct = (tipDeflectionMm / bladeLenMm) * 100;

  // Evaluate first split-plane moment and joint safety factor
  const splitParts = Math.max(1, fabrication.split_parts || 1);
  const splitRatio =
    splitParts === 2
      ? Math.max(0.12, Math.min(0.88, (fabrication.split_ratio_pct || 50) / 100))
      : splitParts > 2
        ? 1 / splitParts
        : 0.5;
  const splitIdx = Math.min(N - 1, Math.max(0, Math.round(splitRatio * (N - 1))));
  const splitRow = stationRows[splitIdx]!;
  const splitMomentNm = splitParts > 1 ? splitRow.bending_moment_nm : 0;

  const rootSf = stationRows[0]?.safety_factor ?? 99.9;
  let jointSf = rootSf;
  if (splitParts > 1) {
    const splitDistMm = splitRow.radius_mm - r0Mm;
    const cfBridgesSplit = cfEnabled && cfDepthMm >= splitDistMm + 15;
    const jointFactor =
      fabrication.align_shape === "contour"
        ? 0.78
        : fabrication.align_shape === "dovetail" || fabrication.align_shape === "cruciform"
          ? 0.65
          : fabrication.align_shape === "none"
            ? 0.35
            : 0.55;
    jointSf = Math.min(
      99.9,
      splitRow.safety_factor * (cfBridgesSplit ? 0.95 : jointFactor),
    );
  }

  const minSf = Math.min(rootSf, jointSf);
  const status: "safe" | "caution" | "critical" =
    minSf >= 2.0 && tipDeflectionPct <= 6.0
      ? "safe"
      : minSf >= 1.2 && tipDeflectionPct <= 10.0
        ? "caution"
        : "critical";

  let recommendation = "Cantilever stress & tip deflection within safe operating envelope.";
  if (status === "critical") {
    if (!cfEnabled) {
      recommendation = "Enable a 6 mm or 8 mm Carbon-Fiber Spar Tube to reinforce root bending.";
    } else if (splitParts > 1 && cfDepthMm < (splitRow.radius_mm - r0Mm) + 20) {
      recommendation = "Extend CF Spar Tube depth past the split plane or use Full-Span 85%.";
    } else {
      recommendation = "Increase root chord / thickness ratio or switch to PA-CF / larger CF tube.";
    }
  } else if (status === "caution") {
    recommendation = cfEnabled
      ? "Moderate load: consider increasing CF tube diameter or Contour Lip engagement."
      : "Consider enabling a Carbon-Fiber Spar Tube for higher safety margin.";
  }

  return {
    material: materialKey,
    material_name: mat.name,
    root_moment_nm: momentNm[0] ?? 0,
    split_moment_nm: splitMomentNm,
    centrifugal_root_n: centrifugalRootN,
    centrifugal_runaway_n: centrifugalRootN * 2.25, // 1.5x runaway RPM => 2.25x centrifugal pull
    blade_mass_g: Math.max(5, bladeMassKg * 1000),
    tip_deflection_mm: tipDeflectionMm,
    tip_deflection_pct: tipDeflectionPct,
    root_safety_factor: rootSf,
    joint_safety_factor: jointSf,
    max_shell_stress_mpa: maxShellStressMpa,
    status,
    recommendation,
    stations: stationRows,
  };
}

function airfoilThicknessRatioAtSpan(design: Design, spanRatio: number): number {
  const stations = design.airfoils;
  if (!stations || stations.length === 0) return 0.12;
  const first = stations[0]!;
  if (stations.length === 1 || spanRatio <= first.span_ratio) {
    return airfoilShapeParams(first.airfoil).t;
  }
  const last = stations[stations.length - 1]!;
  if (spanRatio >= last.span_ratio) {
    return airfoilShapeParams(last.airfoil).t;
  }
  for (let i = 0; i < stations.length - 1; i++) {
    const a = stations[i]!;
    const b = stations[i + 1]!;
    if (spanRatio >= a.span_ratio && spanRatio <= b.span_ratio) {
      const u = (spanRatio - a.span_ratio) / Math.max(1e-9, b.span_ratio - a.span_ratio);
      return (
        (1 - u) * airfoilShapeParams(a.airfoil).t + u * airfoilShapeParams(b.airfoil).t
      );
    }
  }
  return airfoilShapeParams(last.airfoil).t;
}

function interpolateStationField(
  stations: readonly StationAeroSummary[],
  spanRatio: number,
  field: keyof StationAeroSummary,
): number {
  if (stations.length === 0) return 0;
  if (stations.length === 1 || spanRatio <= stations[0]!.span_ratio) {
    return Number(stations[0]![field]) || 0;
  }
  const last = stations[stations.length - 1]!;
  if (spanRatio >= last.span_ratio) {
    return Number(last[field]) || 0;
  }
  for (let i = 0; i < stations.length - 1; i++) {
    const a = stations[i]!;
    const b = stations[i + 1]!;
    if (spanRatio >= a.span_ratio && spanRatio <= b.span_ratio) {
      const u = (spanRatio - a.span_ratio) / Math.max(1e-9, b.span_ratio - a.span_ratio);
      const va = Number(a[field]) || 0;
      const vb = Number(b[field]) || 0;
      return va + u * (vb - va);
    }
  }
  return Number(last[field]) || 0;
}

// ============================================================================
// Feature #2: 3D Aerodynamic & Wall-Thickness Color Heatmaps on the Blade
// ============================================================================

export interface HeatmapResult {
  mode: HeatmapMode;
  colors: Float32Array;
  title: string;
  minLabel: string;
  midLabel: string;
  maxLabel: string;
  gradientCss: string;
}

function sampleThermalRamp(t01: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, t01));
  // 4-stop scientific ramp: Deep Sky Blue (0.0) -> Emerald Green (0.42) -> Amber Gold (0.75) -> Crimson Red (1.0)
  if (t <= 0.42) {
    const u = t / 0.42;
    return [
      0.16 + u * (0.29 - 0.16),
      0.62 + u * (0.78 - 0.62),
      0.96 + u * (0.54 - 0.96),
    ];
  }
  if (t <= 0.75) {
    const u = (t - 0.42) / 0.33;
    return [
      0.29 + u * (0.96 - 0.29),
      0.78 + u * (0.62 - 0.78),
      0.54 + u * (0.05 - 0.54),
    ];
  }
  const u = (t - 0.75) / 0.25;
  return [
    0.96 + u * (0.91 - 0.96),
    0.62 + u * (0.26 - 0.62),
    0.05 + u * (0.29 - 0.05),
  ];
}

function sampleEfficiencyRamp(t01: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, t01));
  // Slate Blue (0.0) -> Cyan (0.45) -> Bright Emerald (0.82) -> Warm Gold (1.0)
  if (t <= 0.45) {
    const u = t / 0.45;
    return [
      0.22 + u * (0.20 - 0.22),
      0.32 + u * (0.74 - 0.32),
      0.62 + u * (0.96 - 0.62),
    ];
  }
  if (t <= 0.82) {
    const u = (t - 0.45) / 0.37;
    return [
      0.20 + u * (0.30 - 0.20),
      0.74 + u * (0.82 - 0.74),
      0.96 + u * (0.54 - 0.96),
    ];
  }
  const u = (t - 0.82) / 0.18;
  return [
    0.30 + u * (0.96 - 0.30),
    0.82 + u * (0.72 - 0.82),
    0.54 + u * (0.18 - 0.54),
  ];
}

function sampleWindPressureRamp(pNorm: number): [number, number, number] {
  // pNorm: -1 (Peak Suction Lift) .. 0 (Neutral Ambient) .. +1 (Peak Windward Stagnation)
  const p = Math.max(-1, Math.min(1, pNorm));
  if (p < 0) {
    const u = -p;
    if (u <= 0.45) {
      const f = u / 0.45;
      return [
        0.06 + f * (0.02 - 0.06), // #10b981 (Teal/Green) -> #06b6d4 (Cyan)
        0.72 + f * (0.71 - 0.72),
        0.51 + f * (0.83 - 0.51),
      ];
    }
    const f = (u - 0.45) / 0.55;
    return [
      0.02 + f * (0.12 - 0.02), // #06b6d4 -> #1e3a8a (Deep Cobalt Blue)
      0.71 + f * (0.23 - 0.71),
      0.83 + f * (0.54 - 0.83),
    ];
  } else {
    if (p <= 0.45) {
      const f = p / 0.45;
      return [
        0.06 + f * (0.96 - 0.06), // #10b981 -> #f59e0b (Warm Amber)
        0.72 + f * (0.62 - 0.72),
        0.51 + f * (0.04 - 0.51),
      ];
    }
    const f = (p - 0.45) / 0.55;
    return [
      0.96 + f * (0.94 - 0.96), // #f59e0b -> #ef4444 (Crimson Stagnation)
      0.62 + f * (0.27 - 0.62),
      0.04 + f * (0.27 - 0.04),
    ];
  }
}

/**
 * Computes per-vertex RGB `Float32Array` colors (`3 * vertexCount` entries) for
 * 3D aerodynamic & structural heatmaps on the blade mesh.
 */
export function computeVertexHeatmapColors(
  positions: ArrayLike<number>,
  design: Design,
  bundle: AeroSimulationBundle | null,
  structural: StructuralMechanicsReport | null,
  mode: HeatmapMode,
  normals?: ArrayLike<number>,
  collectivePitchDeg: number = 0,
): HeatmapResult {
  const vCount = Math.floor(positions.length / 3);
  const colors = new Float32Array(vCount * 3);
  const r0 = design.rotor.hub_radius_mm;
  const rTip = Math.max(r0 + 10, design.rotor.radius_mm);
  const spanLen = rTip - r0;
  const stations = bundle?.design_point.stations ?? [];

  let title = "Angle of Attack α & Stall Margin";
  let minLabel = "0° (Low)";
  let midLabel = "6.5° (Opt)";
  let maxLabel = "14°+ (Stall)";
  let gradientCss = "linear-gradient(90deg, #299ef5 0%, #4ac78a 42%, #f59e0b 75%, #e8434a 100%)";

  if (mode === "cl_cd") {
    let maxLd = 25;
    for (const st of stations) {
      if (st.cd > 1e-5) {
        maxLd = Math.max(maxLd, st.cl / st.cd);
      }
    }
    title = "Aerodynamic Glide Ratio (Cl / Cd)";
    minLabel = "0";
    midLabel = `${(0.5 * maxLd).toFixed(0)}`;
    maxLabel = `${maxLd.toFixed(0)} Peak L/D`;
    gradientCss = "linear-gradient(90deg, #38529e 0%, #33bdf5 45%, #4cd18a 82%, #f5b82e 100%)";

    for (let i = 0; i < vCount; i++) {
      const z = Number(positions[i * 3 + 2]) || r0;
      const s = Math.max(0, Math.min(1, (z - r0) / spanLen));
      const cl = interpolateStationField(stations, s, "cl");
      const cd = Math.max(1e-4, interpolateStationField(stations, s, "cd"));
      const ld = Math.max(0, cl / cd);
      const [r, g, b] = sampleEfficiencyRamp(ld / Math.max(10, maxLd));
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    return { mode, colors, title, minLabel, midLabel, maxLabel, gradientCss };
  }

  if (mode === "torque") {
    let maxTq = 0.5;
    for (const st of stations) {
      maxTq = Math.max(maxTq, st.torque_per_m_nm);
    }
    title = "Spanwise Torque Production (dQ/dr)";
    minLabel = "0 N·m/m";
    midLabel = `${(0.5 * maxTq).toFixed(2)}`;
    maxLabel = `${maxTq.toFixed(2)} N·m/m`;
    gradientCss = "linear-gradient(90deg, #38529e 0%, #33bdf5 45%, #4cd18a 82%, #f5b82e 100%)";

    for (let i = 0; i < vCount; i++) {
      const z = Number(positions[i * 3 + 2]) || r0;
      const s = Math.max(0, Math.min(1, (z - r0) / spanLen));
      const tq = Math.max(0, interpolateStationField(stations, s, "torque_per_m_nm"));
      const [r, g, b] = sampleEfficiencyRamp(tq / maxTq);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    return { mode, colors, title, minLabel, midLabel, maxLabel, gradientCss };
  }

  if (mode === "wall_stress") {
    const structRows = structural?.stations ?? [];
    const maxStress = Math.max(5, structural?.max_shell_stress_mpa ?? 20);
    title = "Bending Stress & Wall Utilization";
    minLabel = "0 MPa (Low)";
    midLabel = `${(0.5 * maxStress).toFixed(1)} MPa`;
    maxLabel = `${maxStress.toFixed(1)} MPa`;

    for (let i = 0; i < vCount; i++) {
      const y = Number(positions[i * 3 + 1]) || 0;
      const z = Number(positions[i * 3 + 2]) || r0;
      const s = Math.max(0, Math.min(1, (z - r0) / spanLen));
      // Interpolate station bending stress, modulated by outer-fiber distance |y|
      let stStress = 0;
      let stThick = 6;
      if (structRows.length > 0) {
        const idx = Math.min(
          structRows.length - 1,
          Math.max(0, Math.round(s * (structRows.length - 1))),
        );
        stStress = structRows[idx]!.shell_stress_mpa;
        stThick = Math.max(1.5, structRows[idx]!.thickness_mm);
      }
      const fiberRatio = Math.min(1.15, Math.abs(y) / (0.45 * stThick));
      const localStress = stStress * (0.35 + 0.65 * fiberRatio);
      const [r, g, b] = sampleThermalRamp(localStress / Math.max(10, maxStress * 1.1));
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    return { mode, colors, title, minLabel, midLabel, maxLabel, gradientCss };
  }

  if (mode === "wind_impact") {
    const vWind = design.rotor.wind_speed_mps || 8.0;
    const tsr = design.rotor.design_tsr || 4.5;
    const rTipM = Math.max(0.1, design.rotor.radius_mm / 1000);
    const omega = (tsr * vWind) / rTipM;
    const rho = 1.225; // kg/m^3
    const qMid = 0.5 * rho * (vWind * vWind + Math.pow(omega * rTipM * 0.7, 2));
    const pMaxImpact = Math.max(20, qMid * 1.05);
    const pMaxSuction = Math.max(25, qMid * 1.35);

    title = "Windward Impact & Surface Pressure (Pa)";
    minLabel = `-${pMaxSuction.toFixed(0)} Pa (Suction Lift)`;
    midLabel = "0 Pa (Ambient)";
    maxLabel = `+${pMaxImpact.toFixed(0)} Pa (Stagnation Impact)`;
    gradientCss = "linear-gradient(90deg, #1e3a8a 0%, #06b6d4 30%, #10b981 50%, #f59e0b 75%, #ef4444 100%)";

    const hasNormals = Boolean(normals && normals.length >= vCount * 3);
    for (let i = 0; i < vCount; i++) {
      const z = Number(positions[i * 3 + 2]) || r0;
      const rM = Math.max(0.01, z / 1000);
      const s = Math.max(0, Math.min(1, (z - r0) / spanLen));

      const vAxial = vWind * 0.75;
      const vTangential = omega * rM * 1.01;
      const wSpeed = Math.hypot(vAxial, vTangential);
      const qLocal = 0.5 * rho * wSpeed * wSpeed;
      const phi = Math.atan2(vAxial, Math.max(0.1, vTangential));

      const twistDeg = stations.length > 0 ? interpolateStationField(stations, s, "alpha_deg") : 6.0;
      const effTheta = (twistDeg + collectivePitchDeg) * (Math.PI / 180);
      const alpha = phi - effTheta;

      let nx = 0;
      let ny = -1;
      if (hasNormals && normals) {
        nx = Number(normals[i * 3]) || 0;
        ny = Number(normals[i * 3 + 1]) || 0;
      } else {
        ny = Number(positions[i * 3 + 1]) <= 0 ? -1 : 1;
      }

      // Relative flow aerodynamic exposure:
      // -nx * cos(alpha) > 0: Leading edge facing oncoming chordwise flow (crimson stagnation line)
      // ny < 0: Windward pressure side (lower face) facing oncoming axial wind flow (warm amber/red)
      // ny > 0: Leeward suction side (upper curved face) generating aerodynamic lift depression (cool cyan/blue)
      const leImpact = Math.max(0, -nx * Math.cos(alpha));
      const windwardLift = ny < 0 ? (-ny) * (0.35 + 0.65 * Math.sin(Math.max(0.04, alpha))) : 0;
      const posExposure = Math.min(1.0, leImpact + windwardLift);

      let pNorm = 0;
      if (ny <= 0 || leImpact > 0.25) {
        pNorm = posExposure;
      } else {
        const cl = stations.length > 0 ? Math.max(0.25, interpolateStationField(stations, s, "cl")) : 0.85;
        const suctionIntensity = Math.min(1.0, ny * (cl / 1.35));
        pNorm = -suctionIntensity;
      }

      const [r, g, b] = sampleWindPressureRamp(pNorm);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    return { mode, colors, title, minLabel, midLabel, maxLabel, gradientCss };
  }

  // Default heatmap: "alpha" (Angle of Attack & Stall Margin)
  for (let i = 0; i < vCount; i++) {
    const z = Number(positions[i * 3 + 2]) || r0;
    const s = Math.max(0, Math.min(1, (z - r0) / spanLen));
    const alpha = stations.length > 0 ? interpolateStationField(stations, s, "alpha_deg") : 6.0;
    // Map alpha in [-2..15 deg] -> [0..1] where 6 deg -> ~0.42 (optimal green), 13+ deg -> red
    const t01 = (alpha + 1.0) / 15.0;
    const [r, g, b] = sampleThermalRamp(t01);
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  return { mode, colors, title, minLabel, midLabel, maxLabel, gradientCss };
}

/**
 * Smoothly curves the tip section of the blade into an up-turned aerodynamic winglet
 * with user-defined cant angle, height, sweep angle, and blend radius.
 */
export function applyWingletToBladeGeometry(
  positions: Float32Array,
  design: Design,
  winglet: WingletConfig,
): void {
  if (!winglet.enabled) return;
  const rTip = design.rotor.radius_mm;
  const blendR = Math.max(5, Math.min(80, winglet.blend_radius_mm || 15));
  const zStart = rTip - blendR;
  const len = rTip - zStart;
  if (len <= 0) return;

  const cantRad = ((winglet.cant_angle_deg || 50) * Math.PI) / 180;
  const sweepRad = ((winglet.sweep_angle_deg || 10) * Math.PI) / 180;
  const height = Math.max(2, Math.min(100, winglet.height_mm || 20));

  const vCount = Math.floor(positions.length / 3);
  for (let i = 0; i < vCount; i++) {
    const z = positions[i * 3 + 2]!;
    if (z > zStart) {
      const u = Math.min(1, Math.max(0, (z - zStart) / len));
      const f = u * u * (3 - 2 * u); // smoothstep Hermite C1

      const x = positions[i * 3]!;
      const y = positions[i * 3 + 1]!;

      // Out-of-plane dihedral bend (+Y upward)
      const dy = f * height * Math.sin(cantRad);
      // Backward chordwise sweep (+X)
      const dx = f * height * Math.tan(sweepRad);
      // Spanwise curve
      const zNew = zStart + (z - zStart) * Math.cos(cantRad * f);

      positions[i * 3] = x + dx;
      positions[i * 3 + 1] = y + dy;
      positions[i * 3 + 2] = zNew;
    }
  }
}

// ============================================================================
// Feature #4: Multi-Wind-Speed Power Curve (2–18 m/s), Cut-In & Weibull AEP
// ============================================================================

export interface WindCurvePoint {
  wind_mps: number;
  rpm: number;
  tsr: number;
  mech_power_w: number;
  elec_power_w: number;
  torque_nm: number;
}

export interface WindPowerAepReport {
  cut_in_mps: number;
  rated_mech_power_w: number;
  rated_elec_power_w: number;
  aep_kwh_yr: number;
  capacity_factor_pct: number;
  site_avg_wind_mps: number;
  points: WindCurvePoint[];
}

/**
 * Evaluates rotor mechanical & matched generator electrical power across wind
 * speeds `2..18 m/s`, determines Cut-In wind speed (where starting aerodynamic
 * torque exceeds cogging/friction torque), and integrates Weibull ($k = 2.0$
 * Rayleigh) Annual Energy Production ($\text{kWh/yr}$).
 */
export function evaluateWindSpeedCurveAndAep(
  design: Design,
  bundle: AeroSimulationBundle,
  genSpec: { kv: number; r_int: number; r_load: number; gear_ratio?: number },
  siteAvgWindMps = 5.5,
  airDensityKgM3 = 1.225,
): WindPowerAepReport {
  const rM = Math.max(0.05, design.rotor.radius_mm * 1e-3);
  const areaM2 = Math.PI * rM * rM;
  const peakCp = Math.max(0.05, bundle.peak_cp || bundle.design_point.cp || 0.35);
  const optTsr = Math.max(0.5, bundle.peak_tsr || design.rotor.design_tsr || 4.5);
  const gearRatio = Math.max(0.1, genSpec.gear_ratio ?? 1.0);

  // Estimate low-TSR starting torque coefficient Cq_start from the lowest TSR point in sweep
  const firstSweep = bundle.sweep[0];
  const lowTsrCq =
    firstSweep && firstSweep.tsr > 0.1
      ? Math.max(0.008, firstSweep.cp / firstSweep.tsr)
      : Math.max(0.012, peakCp / (optTsr * 2.4));

  // Typical small PMG cogging + bearing static friction torque scales with rotor size and step-up gear ratio
  const gearCoggingFactor = 0.65 + 0.35 * Math.min(4.0, gearRatio);
  const coggingTorqueNm = Math.max(0.012, 0.032 * rM * rM * gearCoggingFactor);
  // 0.5 * rho * A * R * V_cut^2 * Cq_start = coggingTorqueNm
  const denomStart = Math.max(1e-6, 0.5 * airDensityKgM3 * areaM2 * rM * lowTsrCq);
  const cutInMps = Math.min(7.5, Math.max(1.4, Math.sqrt(coggingTorqueNm / denomStart)));

  const kv = Math.max(1, genSpec.kv || 35);
  const rInt = Math.max(0.02, genSpec.r_int || 0.8);
  const rLoad = Math.max(0.1, genSpec.r_load || 12.0);
  const rTot = rInt + rLoad;
  const gearMeshEff =
    Math.abs(gearRatio - 1.0) < 1e-3
      ? 1.0
      : Math.max(0.85, 0.97 - 0.012 * Math.abs(gearRatio - 1.0));

  const points: WindCurvePoint[] = [];
  for (let v = 2; v <= 18; v += 1) {
    if (v < cutInMps) {
      points.push({
        wind_mps: v,
        rpm: 0,
        tsr: 0,
        mech_power_w: 0,
        elec_power_w: 0,
        torque_nm: 0.5 * airDensityKgM3 * areaM2 * rM * v * v * lowTsrCq,
      });
      continue;
    }

    // Soft ramp just above cut-in and passive furling/stall regulation above 13 m/s
    const startFactor = Math.min(1, (v - cutInMps) / Math.max(0.8, 0.35 * cutInMps) + 0.25);
    const highWindDerate = v > 13 ? 1 / (1 + 0.08 * (v - 13) ** 1.6) : 1;
    const effCp = peakCp * startFactor * highWindDerate;
    const pWind = 0.5 * airDensityKgM3 * areaM2 * v ** 3;
    const mechPowerW = pWind * effCp;
    const omega = (optTsr * v) / rM;
    const rpm = (omega * 60) / (2 * Math.PI);
    const torqueNm = omega > 1e-3 ? mechPowerW / omega : 0;

    // Coupled PMG electrical output including step-up gear ratio G = RPM_gen / RPM_rotor
    const genRpm = rpm * gearRatio;
    const emfV = genRpm / kv;
    const currentUnclampedA = emfV / rTot;
    const pGenInputDemand = emfV * currentUnclampedA;
    // Generator electrical efficiency at matched load * gearbox mesh efficiency
    const elecEff = Math.min(0.92, (rLoad / rTot) * 0.94) * gearMeshEff;
    const elecPowerW =
      pGenInputDemand > 0
        ? Math.min(mechPowerW * elecEff, (currentUnclampedA ** 2) * rLoad * gearMeshEff)
        : mechPowerW * 0.78 * gearMeshEff;

    points.push({
      wind_mps: v,
      rpm,
      tsr: optTsr,
      mech_power_w: mechPowerW,
      elec_power_w: Math.max(0, elecPowerW),
      torque_nm: torqueNm,
    });
  }

  // Weibull (k = 2 Rayleigh) Annual Energy Production integration over 8760 hours/yr
  const vAvg = Math.max(2.0, Math.min(14.0, siteAvgWindMps || 5.5));
  const cScale = (2 * vAvg) / Math.sqrt(Math.PI);
  let expectedElecPowerW = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const cdf0 = 1 - Math.exp(-((p0.wind_mps / cScale) ** 2));
    const cdf1 = 1 - Math.exp(-((p1.wind_mps / cScale) ** 2));
    const probBin = Math.max(0, cdf1 - cdf0);
    expectedElecPowerW += 0.5 * (p0.elec_power_w + p1.elec_power_w) * probBin;
  }

  const aepKwhYr = (expectedElecPowerW * 8760) / 1000;
  const ratedPoint = points.find((p) => p.wind_mps === 12) ?? points[points.length - 1]!;
  const ratedElecW = Math.max(1, ratedPoint.elec_power_w);
  const capacityFactorPct = Math.min(100, (expectedElecPowerW / ratedElecW) * 100);

  return {
    cut_in_mps: cutInMps,
    rated_mech_power_w: ratedPoint.mech_power_w,
    rated_elec_power_w: ratedPoint.elec_power_w,
    aep_kwh_yr: aepKwhYr,
    capacity_factor_pct: capacityFactorPct,
    site_avg_wind_mps: vAvg,
    points,
  };
}

/**
 * Renders the Multi-Wind-Speed Power Curve (`2..18 m/s`) SVG showing Mechanical
 * Power (`P_mech`), Electrical Output (`P_elec`), and Cut-In Wind Speed datum.
 */
export function renderWindPowerCurveSvgMarkup(report: WindPowerAepReport): string {
  const width = 320;
  const height = 148;
  const padL = 38;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const vMin = 2;
  const vMax = 18;
  const maxP = Math.max(
    25,
    ...report.points.map((p) => Math.max(p.mech_power_w, p.elec_power_w)),
  ) * 1.1;

  const xOf = (v: number) => padL + ((v - vMin) / (vMax - vMin)) * plotW;
  const yOf = (p: number) => padT + plotH - (Math.min(maxP, Math.max(0, p)) / maxP) * plotH;

  const mechPath = report.points
    .map((pt, idx) => `${idx === 0 ? "M" : "L"}${xOf(pt.wind_mps).toFixed(1)},${yOf(pt.mech_power_w).toFixed(1)}`)
    .join(" ");
  const elecPath = report.points
    .map((pt, idx) => `${idx === 0 ? "M" : "L"}${xOf(pt.wind_mps).toFixed(1)},${yOf(pt.elec_power_w).toFixed(1)}`)
    .join(" ");

  const cutInX = xOf(Math.max(vMin, Math.min(vMax, report.cut_in_mps))).toFixed(1);

  const lines: string[] = [
    `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#262c3a" stroke-width="1" />`,
    `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#262c3a" stroke-width="1" />`,
    `<line x1="${padL}" y1="${(padT + plotH * 0.5).toFixed(1)}" x2="${padL + plotW}" y2="${(padT + plotH * 0.5).toFixed(1)}" stroke="#1b202c" stroke-width="1" stroke-dasharray="3 3" />`,
    `<line x1="${cutInX}" y1="${padT}" x2="${cutInX}" y2="${padT + plotH}" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3 2" />`,
    `<path d="${mechPath}" fill="none" stroke="#38bdf8" stroke-width="1.8" />`,
    `<path d="${elecPath}" fill="none" stroke="#4cc38a" stroke-width="1.8" />`,
    `<text x="${Number(cutInX) + 4}" y="${padT + 10}" fill="#f59e0b" font-size="9.5" font-family="'IBM Plex Mono', monospace">Cut-in ${report.cut_in_mps.toFixed(1)} m/s</text>`,
    `<text x="${padL - 4}" y="${padT + 8}" text-anchor="end" fill="#8b93a7" font-size="9.5" font-family="'IBM Plex Mono', monospace">${Math.round(maxP)}W</text>`,
    `<text x="${padL - 4}" y="${padT + plotH}" text-anchor="end" fill="#8b93a7" font-size="9.5" font-family="'IBM Plex Mono', monospace">0W</text>`,
    `<text x="${padL}" y="${height - 8}" fill="#8b93a7" font-size="9.5" font-family="'IBM Plex Mono', monospace">2 m/s</text>`,
    `<text x="${padL + plotW * 0.5}" y="${height - 8}" text-anchor="middle" fill="#8b93a7" font-size="9.5" font-family="'IBM Plex Mono', monospace">10 m/s</text>`,
    `<text x="${padL + plotW}" y="${height - 8}" text-anchor="end" fill="#8b93a7" font-size="9.5" font-family="'IBM Plex Mono', monospace">18 m/s</text>`,
    `<g class="chart-crosshair" style="display:none;pointer-events:none">` +
      `<line class="ch-line" x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#edeff5" stroke-width="1" stroke-dasharray="2 2" opacity="0.65" />` +
      `<circle class="ch-dot-primary" cx="${padL}" cy="${padT + plotH}" r="3.8" fill="#38bdf8" stroke="#07080d" stroke-width="1.4" />` +
      `<circle class="ch-dot-secondary" cx="${padL}" cy="${padT + plotH}" r="3.8" fill="#4cc38a" stroke="#07080d" stroke-width="1.4" />` +
      `</g>`,
  ];

  return lines.join("\n");
}

export interface WindPowerHoverInspection {
  wind_mps: number;
  mech_power_w: number;
  elec_power_w: number;
  rpm: number;
  svg_x: number;
  svg_y_mech: number;
  svg_y_elec: number;
  readout: string;
}

/**
 * Computes interpolated Mechanical & Electrical power, RPM, and SVG crosshair
 * coordinates at a pointer `svgX` position (`0..320` viewBox coordinates).
 */
export function inspectWindPowerAtSvgX(
  svgX: number,
  report: WindPowerAepReport,
): WindPowerHoverInspection {
  const width = 320;
  const height = 148;
  const padL = 38;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const vMin = 2;
  const vMax = 18;

  const maxP =
    Math.max(
      25,
      ...report.points.map((p) => Math.max(p.mech_power_w, p.elec_power_w)),
    ) * 1.1;

  const clampedX = Math.min(padL + plotW, Math.max(padL, svgX));
  const frac = (clampedX - padL) / Math.max(1e-6, plotW);
  const v = vMin + frac * (vMax - vMin);

  let mechW = 0;
  let elecW = 0;
  let rpm = 0;
  const pts = report.points;
  if (pts.length > 0) {
    if (v <= pts[0]!.wind_mps) {
      mechW = pts[0]!.mech_power_w;
      elecW = pts[0]!.elec_power_w;
      rpm = pts[0]!.rpm;
    } else if (v >= pts[pts.length - 1]!.wind_mps) {
      const last = pts[pts.length - 1]!;
      mechW = last.mech_power_w;
      elecW = last.elec_power_w;
      rpm = last.rpm;
    } else {
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i]!;
        const p1 = pts[i + 1]!;
        if (v >= p0.wind_mps && v <= p1.wind_mps) {
          const t = (v - p0.wind_mps) / Math.max(1e-6, p1.wind_mps - p0.wind_mps);
          mechW = p0.mech_power_w + t * (p1.mech_power_w - p0.mech_power_w);
          elecW = p0.elec_power_w + t * (p1.elec_power_w - p0.elec_power_w);
          rpm = p0.rpm + t * (p1.rpm - p0.rpm);
          break;
        }
      }
    }
  }

  const yOf = (p: number) => padT + plotH - (Math.min(maxP, Math.max(0, p)) / maxP) * plotH;

  return {
    wind_mps: v,
    mech_power_w: mechW,
    elec_power_w: elecW,
    rpm,
    svg_x: clampedX,
    svg_y_mech: yOf(mechW),
    svg_y_elec: yOf(elecW),
    readout:
      v < report.cut_in_mps
        ? `V ${v.toFixed(1)} m/s  |  Below cut-in (${report.cut_in_mps.toFixed(1)} m/s) — parked`
        : `V ${v.toFixed(1)} m/s  |  Mech ${mechW.toFixed(0)} W  |  Elec ${elecW.toFixed(0)} W  |  ${rpm.toFixed(0)} RPM`,
  };
}

// ============================================================================
// Feature #5: Printer Build-Volume Fit Checker & Auto-Fit Split Calculator
// ============================================================================

export interface PrinterVolumeSpec {
  name: string;
  bed_x_mm: number;
  bed_y_mm: number;
  max_z_mm: number;
}

export const PRINTER_PRESETS: Record<PrinterPresetKey, PrinterVolumeSpec> = {
  bambu_256: {
    name: "Bambu X1/P1/A1 (256³ mm)",
    bed_x_mm: 256,
    bed_y_mm: 256,
    max_z_mm: 256,
  },
  prusa_mk4: {
    name: "Prusa MK4 / Core One (250×210×220 mm)",
    bed_x_mm: 250,
    bed_y_mm: 210,
    max_z_mm: 220,
  },
  ender3: {
    name: "Ender 3 / 220 Class (220×220×250 mm)",
    bed_x_mm: 220,
    bed_y_mm: 220,
    max_z_mm: 250,
  },
  voron_350: {
    name: "Voron 2.4 / Large (350³ mm)",
    bed_x_mm: 350,
    bed_y_mm: 350,
    max_z_mm: 350,
  },
  custom: {
    name: "Custom Build Height",
    bed_x_mm: 250,
    bed_y_mm: 250,
    max_z_mm: 250,
  },
};

export interface SegmentPrintCheck {
  part_index: number;
  span_start_mm: number;
  span_end_mm: number;
  body_length_mm: number;
  joint_protrusion_mm: number;
  total_print_z_mm: number;
  max_chord_mm: number;
  fits_z: boolean;
  fits_xy: boolean;
}

export interface PrinterBuildFitReport {
  preset: PrinterPresetKey;
  printer_name: string;
  max_z_mm: number;
  bed_xy_mm: number;
  blade_span_mm: number;
  all_fit: boolean;
  segments: SegmentPrintCheck[];
  recommended_split_parts: number;
  recommended_split_ratio_pct: number;
  summary: string;
}

/**
 * Checks whether every split blade segment (including male interlocking pin /
 * Contour Lip protrusion along `+Z`) fits within the selected 3D printer's
 * build volume, and computes the minimum split count (`1..4`) required.
 */
export function evaluatePrinterBuildFit(
  design: Design,
  fabrication: FabricationSnapshot,
  preset: PrinterPresetKey = "bambu_256",
  customMaxZMm?: number,
): PrinterBuildFitReport {
  const spec = PRINTER_PRESETS[preset] ?? PRINTER_PRESETS.bambu_256;
  const maxZMm =
    preset === "custom" && customMaxZMm && customMaxZMm >= 50
      ? customMaxZMm
      : spec.max_z_mm;
  const bedDiagMm = Math.hypot(spec.bed_x_mm, spec.bed_y_mm) * 0.92;

  const r0 = design.rotor.hub_radius_mm;
  const rTip = design.rotor.radius_mm;
  const bladeSpanMm = Math.max(10, rTip - r0);
  const splitParts = Math.max(1, Math.min(4, fabrication.split_parts || 1));
  const splitRatio = Math.max(0.12, Math.min(0.88, (fabrication.split_ratio_pct || 50) / 100));
  const jointPinHeightMm =
    splitParts > 1 && fabrication.align_shape !== "none"
      ? Math.max(0, fabrication.align_height_mm || 6.0)
      : 0;

  // Compute split plane fractions [0, ..., 1]
  const fractions: number[] = [0];
  if (splitParts === 2) {
    fractions.push(splitRatio, 1);
  } else {
    for (let k = 1; k <= splitParts; k++) {
      fractions.push(k / splitParts);
    }
  }

  const stations = resolveStationsPreview(design);
  const maxChordGlobalMm = Math.max(
    10,
    ...stations.map((s) => s.effective_chord_mm),
  );

  const segments: SegmentPrintCheck[] = [];
  for (let p = 0; p < splitParts; p++) {
    const f0 = fractions[p]!;
    const f1 = fractions[p + 1]!;
    const z0 = r0 + f0 * bladeSpanMm;
    const z1 = r0 + f1 * bladeSpanMm;
    const bodyLen = z1 - z0;
    // Lower segments (p < splitParts - 1) carry the male pin / Contour Lip on their +Z face
    const protrusion = p < splitParts - 1 ? jointPinHeightMm : 0;
    const totalPrintZ = bodyLen + protrusion;

    segments.push({
      part_index: p,
      span_start_mm: z0,
      span_end_mm: z1,
      body_length_mm: bodyLen,
      joint_protrusion_mm: protrusion,
      total_print_z_mm: totalPrintZ,
      max_chord_mm: maxChordGlobalMm,
      fits_z: totalPrintZ <= maxZMm + 1e-6,
      fits_xy: maxChordGlobalMm <= bedDiagMm,
    });
  }

  const allFit = segments.every((s) => s.fits_z && s.fits_xy);

  // Calculate minimum split parts (1..4) so that every part + pin protrusion fits maxZMm
  const usableZPerPart = Math.max(30, maxZMm - jointPinHeightMm - 2);
  const recommendedParts = Math.min(4, Math.max(1, Math.ceil(bladeSpanMm / usableZPerPart)));
  const recommendedRatioPct = 50;

  const tallestSeg = segments.reduce(
    (best, cur) => (cur.total_print_z_mm > best.total_print_z_mm ? cur : best),
    segments[0]!,
  );

  const summary = allFit
    ? `All ${splitParts} part(s) fit ${maxZMm} mm Z limit (tallest: Part ${tallestSeg.part_index + 1} at ${tallestSeg.total_print_z_mm.toFixed(1)} mm)`
    : `Part ${tallestSeg.part_index + 1} is ${tallestSeg.total_print_z_mm.toFixed(1)} mm tall (exceeds ${maxZMm} mm Z limit by ${(tallestSeg.total_print_z_mm - maxZMm).toFixed(1)} mm) — split into ${recommendedParts} parts`;

  return {
    preset,
    printer_name: spec.name,
    max_z_mm: maxZMm,
    bed_xy_mm: Math.min(spec.bed_x_mm, spec.bed_y_mm),
    blade_span_mm: bladeSpanMm,
    all_fit: allFit,
    segments,
    recommended_split_parts: recommendedParts,
    recommended_split_ratio_pct: recommendedRatioPct,
    summary,
  };
}

// ============================================================================
// KidWind & Competition Blade Wind Presets + Generator & Gear Max-Out Solver
// ============================================================================

export interface BladeWindPresetSpec {
  key: BladeWindPresetKey;
  name: string;
  badge: string;
  description: string;
  rotor: {
    radius_mm: number;
    hub_radius_mm: number;
    blade_count: number;
    design_tsr: number;
    wind_speed_mps: number;
    station_count: number;
    pitch_axis_ratio: number;
  };
  planform: {
    cosine: boolean;
    center_pct: number;
    width_pct: number;
  };
  sections: {
    root: { chord_mm: number; twist_deg: number; airfoil: AirfoilSpec };
    mid: { chord_mm: number; twist_deg: number; airfoil: AirfoilSpec };
    tip: { chord_mm: number; twist_deg: number; airfoil: AirfoilSpec };
  };
  recommended_drivetrain: {
    gen_preset: GeneratorPresetKey;
    gear_ratio: number;
    r_load_ohm: number;
    site_avg_wind_mps: number;
  };
  recommended_spar_mm?: number;
}

export const BLADE_WIND_PRESETS: Record<BladeWindPresetKey, BladeWindPresetSpec> = {
  low_wind: {
    key: "low_wind",
    name: "Low-Speed Wind (3.5 m/s · High Starting Torque · λ 3.5)",
    badge: "3.5 m/s Low-Wind",
    description:
      "Wide root/mid chord (74→58→32 mm) and steep 26° root twist with S833 root + Selig SG6043 low-Re high-lift profile to overcome generator cogging and self-start at 1.8–2.2 m/s.",
    rotor: {
      radius_mm: 300,
      hub_radius_mm: 35,
      blade_count: 3,
      design_tsr: 3.5,
      wind_speed_mps: 3.5,
      station_count: 13,
      pitch_axis_ratio: 0.25,
    },
    planform: {
      cosine: true,
      center_pct: 45,
      width_pct: 28,
    },
    sections: {
      root: {
        chord_mm: 74,
        twist_deg: 26.0,
        airfoil: { type: "named", name: "S833" },
      },
      mid: {
        chord_mm: 58,
        twist_deg: 13.0,
        airfoil: { type: "named", name: "SG6043" },
      },
      tip: {
        chord_mm: 32,
        twist_deg: 3.5,
        airfoil: { type: "named", name: "SG6043" },
      },
    },
    recommended_drivetrain: {
      gen_preset: "kidwind_red",
      gear_ratio: 3.0,
      r_load_ohm: 12.0,
      site_avg_wind_mps: 3.5,
    },
  },
  med_kidwind: {
    key: "med_kidwind",
    name: "KidWind Competition Standard (4.5 m/s · Geared 3:1 · λ 4.2)",
    badge: "4.5 m/s KidWind",
    description:
      "Balanced 350 mm radius competition rotor (64→48→25 mm cosine planform, S833 root + SG6043 mid/tip) tuned for 4.0–5.0 m/s KidWind tunnels with a 2.5:1–3.5:1 gear stage.",
    rotor: {
      radius_mm: 350,
      hub_radius_mm: 40,
      blade_count: 3,
      design_tsr: 4.2,
      wind_speed_mps: 4.5,
      station_count: 13,
      pitch_axis_ratio: 0.25,
    },
    planform: {
      cosine: true,
      center_pct: 45,
      width_pct: 25,
    },
    sections: {
      root: {
        chord_mm: 64,
        twist_deg: 22.0,
        airfoil: { type: "named", name: "S833" },
      },
      mid: {
        chord_mm: 48,
        twist_deg: 10.5,
        airfoil: { type: "named", name: "SG6043" },
      },
      tip: {
        chord_mm: 25,
        twist_deg: 2.5,
        airfoil: { type: "named", name: "SG6043" },
      },
    },
    recommended_drivetrain: {
      gen_preset: "kidwind_red",
      gear_ratio: 3.0,
      r_load_ohm: 10.0,
      site_avg_wind_mps: 4.5,
    },
  },
  scimitar_belly: {
    key: "scimitar_belly",
    name: "Scimitar Elliptical Belly (45→76→22 mm · High Mid-Span Torque · λ 4.5)",
    badge: "45→76→22 Scimitar",
    description:
      "Pinched 45 mm S833 root swelling into a 76 mm SG6043 mid-span power belly and tapering to a low-drag 22 mm tip (22°→11.5°→2.5° twist). Auto-enables 5 mm CF spar tube for high Root Safety Factor.",
    rotor: {
      radius_mm: 350,
      hub_radius_mm: 40,
      blade_count: 3,
      design_tsr: 4.5,
      wind_speed_mps: 4.5,
      station_count: 13,
      pitch_axis_ratio: 0.25,
    },
    planform: {
      cosine: true,
      center_pct: 45,
      width_pct: 22,
    },
    sections: {
      root: {
        chord_mm: 45,
        twist_deg: 22.0,
        airfoil: { type: "named", name: "S833" },
      },
      mid: {
        chord_mm: 76,
        twist_deg: 11.5,
        airfoil: { type: "named", name: "SG6043" },
      },
      tip: {
        chord_mm: 22,
        twist_deg: 2.5,
        airfoil: { type: "named", name: "SG6043" },
      },
    },
    recommended_drivetrain: {
      gen_preset: "kidwind_red",
      gear_ratio: 3.0,
      r_load_ohm: 10.0,
      site_avg_wind_mps: 4.5,
    },
    recommended_spar_mm: 5.0,
  },
  high_wind: {
    key: "high_wind",
    name: "High-Speed Wind (8.0 m/s · Fast TSR Direct-Drive · λ 5.5)",
    badge: "8.0 m/s High-Speed",
    description:
      "Slender low-drag planform (52→36→24 mm) pairing S833 root, SD7062 mid, and Eppler E387 fast tip for high RPM and minimal profile drag at 7–10 m/s.",
    rotor: {
      radius_mm: 350,
      hub_radius_mm: 40,
      blade_count: 3,
      design_tsr: 5.5,
      wind_speed_mps: 8.0,
      station_count: 13,
      pitch_axis_ratio: 0.25,
    },
    planform: {
      cosine: true,
      center_pct: 48,
      width_pct: 22,
    },
    sections: {
      root: {
        chord_mm: 52,
        twist_deg: 16.5,
        airfoil: { type: "named", name: "S833" },
      },
      mid: {
        chord_mm: 36,
        twist_deg: 6.5,
        airfoil: { type: "named", name: "SD7062" },
      },
      tip: {
        chord_mm: 24,
        twist_deg: 1.0,
        airfoil: { type: "named", name: "E387" },
      },
    },
    recommended_drivetrain: {
      gen_preset: "outrunner_bldc",
      gear_ratio: 1.0,
      r_load_ohm: 6.0,
      site_avg_wind_mps: 7.5,
    },
  },
  schmitz_600: {
    key: "schmitz_600",
    name: "Reference 600 mm Rotor (8.0 m/s · NACA 4412 · λ 4.5)",
    badge: "600 mm Reference",
    description:
      "Full-scale 600 mm radius 3-blade NACA 4412 reference rotor (70→35 mm linear taper, 20°→3° twist) paired with a 1:1 low-RPM permanent-magnet alternator.",
    rotor: {
      radius_mm: 600,
      hub_radius_mm: 60,
      blade_count: 3,
      design_tsr: 4.5,
      wind_speed_mps: 8.0,
      station_count: 11,
      pitch_axis_ratio: 0.25,
    },
    planform: {
      cosine: false,
      center_pct: 45,
      width_pct: 25,
    },
    sections: {
      root: {
        chord_mm: 70,
        twist_deg: 20.0,
        airfoil: { type: "naca4", max_camber: 0.04, camber_position: 0.4, thickness_ratio: 0.12 },
      },
      mid: {
        chord_mm: 52.5,
        twist_deg: 11.5,
        airfoil: { type: "naca4", max_camber: 0.04, camber_position: 0.4, thickness_ratio: 0.12 },
      },
      tip: {
        chord_mm: 35,
        twist_deg: 3.0,
        airfoil: { type: "naca4", max_camber: 0.04, camber_position: 0.4, thickness_ratio: 0.12 },
      },
    },
    recommended_drivetrain: {
      gen_preset: "low_rpm_pmg",
      gear_ratio: 1.0,
      r_load_ohm: 5.0,
      site_avg_wind_mps: 6.0,
    },
  },
};

/**
 * Applies a competition Blade Wind Preset (`low_wind`, `med_kidwind`,
 * `high_wind`, or `schmitz_600`) to `baseDesign`, returning the updated `Design`
 * along with its recommended planform and drivetrain settings.
 */
export function applyBladeWindPreset(
  baseDesign: Design,
  presetKey: BladeWindPresetKey,
): {
  design: Design;
  spec: BladeWindPresetSpec;
} {
  const spec = BLADE_WIND_PRESETS[presetKey] ?? BLADE_WIND_PRESETS.med_kidwind;
  let next = cloneDesign(baseDesign);
  next.overrides = [];
  next.rotor = {
    ...next.rotor,
    ...spec.rotor,
  };
  next.hub = {
    ...next.hub,
    diameter_mm: Math.max(24, spec.rotor.hub_radius_mm * 2),
  };

  const center = spec.planform.center_pct / 100;
  const width = spec.planform.width_pct / 100;
  if (spec.planform.cosine) {
    next.distributions.chord_mm = {
      type: "formula",
      expr: buildCosinePlateauExpr(
        spec.sections.root.chord_mm,
        spec.sections.tip.chord_mm,
        center,
        width,
        spec.sections.mid.chord_mm,
      ),
    };
    next.distributions.twist_deg = {
      type: "formula",
      expr: buildCosinePlateauExpr(
        spec.sections.root.twist_deg,
        spec.sections.tip.twist_deg,
        center,
        width,
        spec.sections.mid.twist_deg,
      ),
    };
  } else {
    next.distributions.chord_mm = {
      type: "linear",
      root: spec.sections.root.chord_mm,
      tip: spec.sections.tip.chord_mm,
    };
    next.distributions.twist_deg = {
      type: "linear",
      root: spec.sections.root.twist_deg,
      tip: spec.sections.tip.twist_deg,
    };
  }

  next = applySectionAirfoils(next, spec.sections, center);
  return { design: next, spec };
}

export interface GeneratorPresetSpec {
  key: GeneratorPresetKey;
  name: string;
  kv_rpm_per_v: number;
  r_int_ohm: number;
  no_load_current_a: number;
  default_gear_ratio: number;
  default_r_load_ohm: number;
  notes: string;
}

export const GENERATOR_PRESETS: Record<GeneratorPresetKey, GeneratorPresetSpec> = {
  kidwind_red: {
    key: "kidwind_red",
    name: "KidWind Red Generator (Kv 240 · R_int 6.2 Ω)",
    kv_rpm_per_v: 240,
    r_int_ohm: 6.2,
    no_load_current_a: 0.03,
    default_gear_ratio: 3.0,
    default_r_load_ohm: 10.0,
    notes:
      "Standard KidWind DC generator. Because Kv=240 RPM/V is high and R_int=6.2 Ω, use a 2.5:1–4:1 gear ratio and 8–15 Ω load resistor so voltage isn't lost as heat.",
  },
  kidwind_gen2: {
    key: "kidwind_gen2",
    name: "KidWind GEN2 / High-RPM DC (Kv 320 · R_int 4.8 Ω)",
    kv_rpm_per_v: 320,
    r_int_ohm: 4.8,
    no_load_current_a: 0.035,
    default_gear_ratio: 3.5,
    default_r_load_ohm: 12.0,
    notes:
      "Fast small DC armature (320 RPM/V). Needs 3:1–5:1 step-up gearing in 3.5–4.5 m/s wind tunnels to spin the generator fast enough for high voltage.",
  },
  outrunner_bldc: {
    key: "outrunner_bldc",
    name: "Gimbal / Drone Outrunner BLDC (Kv 100 · R_int 1.4 Ω)",
    kv_rpm_per_v: 100,
    r_int_ohm: 1.4,
    no_load_current_a: 0.05,
    default_gear_ratio: 1.5,
    default_r_load_ohm: 6.0,
    notes:
      "3-phase rectified outrunner with low winding resistance (1.4 Ω). Delivers >80% electrical efficiency with 1:1 direct drive or 1.5:1–2:1 gearing.",
  },
  low_rpm_pmg: {
    key: "low_rpm_pmg",
    name: "Low-RPM Direct-Drive PMG (Kv 35 · R_int 0.8 Ω)",
    kv_rpm_per_v: 35,
    r_int_ohm: 0.8,
    no_load_current_a: 0.08,
    default_gear_ratio: 1.0,
    default_r_load_ohm: 5.0,
    notes:
      "High-pole-count permanent magnet alternator (Kv=35 RPM/V, R_int=0.8 Ω) designed for 1:1 direct drive at 400–800 RPM.",
  },
  custom: {
    key: "custom",
    name: "Custom Generator Spec",
    kv_rpm_per_v: 100,
    r_int_ohm: 2.0,
    no_load_current_a: 0.05,
    default_gear_ratio: 1.0,
    default_r_load_ohm: 10.0,
    notes: "Custom Kv, internal winding resistance R_int, gear ratio G:1, and load resistor R_load.",
  },
};

export interface DrivetrainMaxOutReport {
  regime: "stalled_overload" | "overspeed_underload" | "optimal_band";
  regime_label: string;
  current_tsr: number;
  current_rotor_rpm: number;
  current_gen_rpm: number;
  current_voltage_v: number;
  current_current_a: number;
  current_elec_power_w: number;
  current_efficiency_pct: number;
  best_r_load_at_current_gear_ohm: number;
  power_at_current_gear_best_load_w: number;
  opt_gear_ratio: number;
  opt_r_load_ohm: number;
  opt_tsr: number;
  opt_rotor_rpm: number;
  opt_gen_rpm: number;
  opt_voltage_v: number;
  opt_elec_power_w: number;
  opt_efficiency_pct: number;
  gain_power_w: number;
  gain_pct: number;
  how_to_max_out_steps: string[];
}

function evalCoupledPointOnSweep(
  sweep: readonly TsrSweepPoint[],
  peakTsr: number,
  kv: number,
  rInt: number,
  i0: number,
  gearRatio: number,
  rLoad: number,
): {
  tsr: number;
  rotor_rpm: number;
  gen_rpm: number;
  voltage_v: number;
  current_a: number;
  elec_power_w: number;
  mech_power_w: number;
  efficiency: number;
  stalled: boolean;
} {
  const kt = 60.0 / (2.0 * Math.PI * Math.max(1e-3, kv));
  const totalR = Math.max(0.05, rInt + rLoad);
  const gearEff =
    Math.abs(gearRatio - 1.0) < 1e-3
      ? 1.0
      : Math.max(0.85, 0.97 - 0.012 * Math.abs(gearRatio - 1.0));

  const genReactionTorque = (rotorRpm: number) => {
    if (rotorRpm <= 0) return 0;
    const genRpm = rotorRpm * gearRatio;
    const emf = genRpm / kv;
    const current = emf / totalR;
    // Gear step-up reflects Gx torque to rotor shaft, divided by gearbox mesh efficiency
    return (gearRatio * kt * (current + i0)) / gearEff;
  };

  if (sweep.length === 0) {
    return {
      tsr: peakTsr,
      rotor_rpm: 0,
      gen_rpm: 0,
      voltage_v: 0,
      current_a: 0,
      elec_power_w: 0,
      mech_power_w: 0,
      efficiency: 0,
      stalled: true,
    };
  }

  // Scan from high TSR down to low TSR to find stable torque crossing (diff = Q_aero - Q_gen)
  let eqTsr = sweep[0]!.tsr;
  let eqRpm = sweep[0]!.rpm;
  let eqMechW = sweep[0]!.power_w;
  let foundCrossing = false;
  let bestAbsDiff = Number.POSITIVE_INFINITY;

  for (let i = sweep.length - 1; i >= 1; i--) {
    const pHi = sweep[i]!;
    const pLo = sweep[i - 1]!;
    const diffHi = pHi.torque_nm - genReactionTorque(pHi.rpm);
    const diffLo = pLo.torque_nm - genReactionTorque(pLo.rpm);

    if (Math.abs(diffHi) < bestAbsDiff) {
      bestAbsDiff = Math.abs(diffHi);
      eqTsr = pHi.tsr;
      eqRpm = pHi.rpm;
      eqMechW = pHi.power_w;
    }

    // Stable high-speed branch crossing: diffLo >= 0 and diffHi <= 0
    if (diffLo >= 0 && diffHi <= 0) {
      const span = Math.max(1e-9, diffLo - diffHi);
      const u = diffLo / span;
      eqTsr = pLo.tsr + u * (pHi.tsr - pLo.tsr);
      eqRpm = pLo.rpm + u * (pHi.rpm - pLo.rpm);
      eqMechW = Math.max(0, pLo.power_w + u * (pHi.power_w - pLo.power_w));
      foundCrossing = true;
      break;
    }
  }

  // Check if generator braking torque exceeds blade torque everywhere (stalled)
  const maxAeroTorque = Math.max(...sweep.map((s) => s.torque_nm));
  const peakRow = sweep.reduce((b, c) => (c.cp > b.cp ? c : b), sweep[0]!);
  const genTorqueAtPeak = genReactionTorque(peakRow.rpm);
  const stalled = !foundCrossing && genTorqueAtPeak > maxAeroTorque;

  if (stalled) {
    eqTsr = sweep[0]!.tsr * 0.55;
    eqRpm = sweep[0]!.rpm * 0.55;
    eqMechW = sweep[0]!.power_w * 0.35;
  }

  const genRpm = eqRpm * gearRatio;
  const emfV = genRpm / kv;
  const currentA = emfV / totalR;
  const voltageV = currentA * rLoad;
  const rawElecW = voltageV * currentA;
  const elecPowerW = Math.min(Math.max(0, eqMechW * gearEff * 0.94), rawElecW);
  const efficiency = eqMechW > 1e-6 ? Math.min(0.95, elecPowerW / eqMechW) : 0;

  return {
    tsr: eqTsr,
    rotor_rpm: eqRpm,
    gen_rpm: genRpm,
    voltage_v: voltageV,
    current_a: currentA,
    elec_power_w: elecPowerW,
    mech_power_w: eqMechW,
    efficiency,
    stalled,
  };
}

/**
 * Solves for the optimal Gear Ratio (`G:1`) and Load Resistance (`R_load` in Ω)
 * that maximize electrical power output ($P_{\text{elec}} = V_{\text{load}} I$)
 * for the active blade BEM sweep and generator specification, and returns
 * step-by-step competition tuning instructions on how to max out output.
 */
export function optimizeGeneratorAndGearbox(
  design: Design,
  bundle: AeroSimulationBundle,
  spec: {
    kv: number;
    r_int: number;
    r_load: number;
    gear_ratio: number;
    i0?: number;
  },
): DrivetrainMaxOutReport {
  const kv = Math.max(1, spec.kv || 35);
  const rInt = Math.max(0.05, spec.r_int || 0.8);
  const curRLoad = Math.max(0.1, spec.r_load || 5.0);
  const curGear = Math.max(0.25, spec.gear_ratio || 1.0);
  const i0 = Math.max(0, spec.i0 ?? 0.04);
  const peakTsr = Math.max(0.5, bundle.peak_tsr || design.rotor.design_tsr || 4.5);

  const curEval = evalCoupledPointOnSweep(
    bundle.sweep,
    peakTsr,
    kv,
    rInt,
    i0,
    curGear,
    curRLoad,
  );

  // Use wasm generator_match for current point if available, blended with gear efficiency
  const curTsr = bundle.generator_match?.tip_speed_ratio ?? curEval.tsr;
  const curRotorRpm = bundle.generator_match?.generator.rotor_rpm ?? curEval.rotor_rpm;
  const curGenRpm =
    bundle.generator_match?.generator.generator_rpm ?? curRotorRpm * curGear;
  const curVolt = bundle.generator_match?.generator.terminal_voltage_v ?? curEval.voltage_v;
  const curCurr = bundle.generator_match?.generator.current_a ?? curEval.current_a;
  const curElecW = bundle.generator_match?.generator.electrical_power_w ?? curEval.elec_power_w;
  const curEffPct =
    (bundle.generator_match?.generator.efficiency ?? curEval.efficiency) * 100;

  // Candidate load resistances from 0.5 Ω to 120 Ω
  const loadGrid: number[] = [];
  for (let r = 0.5; r <= 15.0; r += 0.5) loadGrid.push(Number(r.toFixed(2)));
  for (let r = 16.0; r <= 50.0; r += 1.0) loadGrid.push(Number(r.toFixed(2)));
  for (let r = 55.0; r <= 120.0; r += 5.0) loadGrid.push(Number(r.toFixed(2)));

  // 1. Best load resistor at current gear ratio
  let bestRLoadAtCurGear = curRLoad;
  let bestPowerAtCurGear = -1;
  for (const rL of loadGrid) {
    const ev = evalCoupledPointOnSweep(bundle.sweep, peakTsr, kv, rInt, i0, curGear, rL);
    const stabilityBonus = !ev.stalled && ev.tsr >= 0.9 * peakTsr ? 1.0 : 0.72;
    const score = ev.elec_power_w * stabilityBonus;
    if (score > bestPowerAtCurGear) {
      bestPowerAtCurGear = score;
      bestRLoadAtCurGear = rL;
    }
  }
  const curGearOptEval = evalCoupledPointOnSweep(
    bundle.sweep,
    peakTsr,
    kv,
    rInt,
    i0,
    curGear,
    bestRLoadAtCurGear,
  );

  // 2. Global search over Gear Ratio G in [1.0 .. 8.0] and Load R_load
  const gearCandidates = [
    1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0,
  ];
  let optGear = curGear;
  let optRLoad = bestRLoadAtCurGear;
  let optEval = curGearOptEval;
  let bestGlobalScore = -1;

  for (const g of gearCandidates) {
    for (const rL of loadGrid) {
      const ev = evalCoupledPointOnSweep(bundle.sweep, peakTsr, kv, rInt, i0, g, rL);
      // Prefer operating near or slightly above peak_tsr (0.94..1.14 * peakTsr) so the turbine never stalls in tunnel gusts
      const inSweetSpot = !ev.stalled && ev.tsr >= 0.92 * peakTsr && ev.tsr <= 1.18 * peakTsr;
      const score = ev.elec_power_w * (inSweetSpot ? 1.05 : ev.stalled ? 0.5 : 0.9);
      if (score > bestGlobalScore) {
        bestGlobalScore = score;
        optGear = g;
        optRLoad = rL;
        optEval = ev;
      }
    }
  }

  // Classify current operating regime relative to blade peak TSR
  let regime: "stalled_overload" | "overspeed_underload" | "optimal_band" = "optimal_band";
  let regimeLabel = `Matched near Peak Cp (λ=${curTsr.toFixed(2)} vs Opt λ=${peakTsr.toFixed(2)})`;
  if (curEval.stalled || curTsr < 0.88 * peakTsr) {
    regime = "stalled_overload";
    regimeLabel = `Over-Loaded / Braking Stall (λ=${curTsr.toFixed(2)} < Opt λ=${peakTsr.toFixed(2)})`;
  } else if (curTsr > 1.14 * peakTsr) {
    regime = "overspeed_underload";
    regimeLabel = `Under-Loaded / Free-Spinning High TSR (λ=${curTsr.toFixed(2)} > Opt λ=${peakTsr.toFixed(2)})`;
  }

  const gainPowerW = Math.max(0, optEval.elec_power_w - curElecW);
  const gainPct = curElecW > 1e-3 ? (gainPowerW / curElecW) * 100 : 0;

  // Build 3 clear "How to Max Out" steps tailored to current state
  const steps: string[] = [];
  if (regime === "stalled_overload") {
    steps.push(
      `1. Relieve Generator Braking: Your load pulls rotor TSR down to λ=${curTsr.toFixed(2)} (stalling the blades). Increase Load R_load toward ${optRLoad.toFixed(1)} Ω or reduce Gear Ratio to ${optGear.toFixed(2)}:1 so the rotor can spin up to Peak λ=${peakTsr.toFixed(2)} (${optEval.rotor_rpm.toFixed(0)} RPM).`,
    );
  } else if (regime === "overspeed_underload") {
    steps.push(
      `1. Capture More Shaft Torque: Rotor is overspeeding at λ=${curTsr.toFixed(2)} because generator counter-torque is too weak. Step up Gear Ratio to ${optGear.toFixed(2)}:1 (Gen ${optEval.gen_rpm.toFixed(0)} RPM) and set Load R_load = ${optRLoad.toFixed(1)} Ω to load the blades at Peak λ=${peakTsr.toFixed(2)}.`,
    );
  } else {
    steps.push(
      `1. Fine-Tune Gear & Load Impedance: Set Gear Ratio = ${optGear.toFixed(2)}:1 and Load Resistor R_load = ${optRLoad.toFixed(1)} Ω (R_load / R_int = ${(optRLoad / rInt).toFixed(1)}×) to reach ${optEval.elec_power_w.toFixed(1)} W (${(optEval.efficiency * 100).toFixed(0)}% efficiency).`,
    );
  }

  steps.push(
    `2. Match Blade Design TSR to Tunnel Equilibrium: Set Rotor Design TSR λ = ${peakTsr.toFixed(2)} and click "Auto-Optimize Blade (Max Cp)" in the BEM section so every station sits at its peak Cl/Cd glide angle (~6°).`,
  );

  if (design.rotor.wind_speed_mps <= 4.5) {
    steps.push(
      `3. Low-Wind Tunnel Tip: At ${design.rotor.wind_speed_mps.toFixed(1)} m/s, keep R_load ≥ ${(1.6 * rInt).toFixed(1)} Ω during start-up so current draw doesn't brake the hub before the blades pass Cut-In.`,
    );
  } else {
    steps.push(
      `3. High-Wind Tip: At ${design.rotor.wind_speed_mps.toFixed(1)} m/s (${optEval.rotor_rpm.toFixed(0)} RPM), enable a Carbon-Fiber Spar Tube in Fabrication so tip deflection stays < 5% and pitch twist doesn't wash out.`,
    );
  }

  return {
    regime,
    regime_label: regimeLabel,
    current_tsr: curTsr,
    current_rotor_rpm: curRotorRpm,
    current_gen_rpm: curGenRpm,
    current_voltage_v: curVolt,
    current_current_a: curCurr,
    current_elec_power_w: curElecW,
    current_efficiency_pct: curEffPct,
    best_r_load_at_current_gear_ohm: bestRLoadAtCurGear,
    power_at_current_gear_best_load_w: curGearOptEval.elec_power_w,
    opt_gear_ratio: optGear,
    opt_r_load_ohm: optRLoad,
    opt_tsr: optEval.tsr,
    opt_rotor_rpm: optEval.rotor_rpm,
    opt_gen_rpm: optEval.gen_rpm,
    opt_voltage_v: optEval.voltage_v,
    opt_elec_power_w: optEval.elec_power_w,
    opt_efficiency_pct: optEval.efficiency * 100,
    gain_power_w: gainPowerW,
    gain_pct: gainPct,
    how_to_max_out_steps: steps,
  };
}

/**
 * Parametric 3D Gearbox Prototype Generator (`GearboxConfig`, Involute Spur/Helical
 * tooth profile solver, 4-spoke rotor bull gear + stepped orange hub, coaxial
 * compound wheel/pinion, generator pinion, and binary STL export).
 */

export type GearboxStageMode = "compound_2stage" | "idler_reference" | "direct_1stage";
export type GearboxLayoutMode = "side_by_side" | "meshed";
export type GearExportTarget = "all" | "gear1" | "gear2" | "gear3";

export interface GearboxConfig {
  stage_mode: GearboxStageMode;
  layout_mode: GearboxLayoutMode;
  module_mm: number;
  pressure_angle_deg: number;
  helix_angle_deg: number;
  backlash_mm: number;

  // Web Cutout Geometry (shared across Spoked Gears 1 & 2)
  spoke_width_pct: number; // 10..65% of each sector occupied by solid spoke arm (default 26%)
  rim_wall_mm: number; // radial rim thickness inside tooth root circle r_f (default 3.5 mm)
  hub_ring_mm: number; // radial solid margin outside hub skirt / coaxial pinion (default 2.5 mm)

  // Gear 1: Rotor Bull Gear (Mint 4-spoke wheel + Orange stepped hub boss)
  g1_teeth: number;
  g1_face_width_mm: number;
  g1_spokes: number; // 0 = solid, 3..8 = spoked cutouts (default 4)
  g1_bore_mm: number;
  g1_d_flat_mm: number;
  g1_hub_diameter_mm: number;
  g1_hub_height_mm: number;

  // Gear 2: Compound Idler Gear (Purple Wheel + Lime-Green Coaxial Pinion)
  g2_wheel_teeth: number;
  g2_wheel_face_mm: number;
  g2_spokes: number; // 0 = solid, 3..8 = spoked cutouts on Purple Wheel (default 4)
  g2_pinion_teeth: number;
  g2_pinion_face_mm: number;
  g2_bore_mm: number;
  g2_d_flat_mm: number;

  // Gear 3: Generator Output Pinion (Slate-Grey Pinion + Motor Shaft Boss)
  g3_teeth: number;
  g3_face_width_mm: number;
  g3_bore_mm: number;
  g3_d_flat_mm: number;
  g3_boss_height_mm: number;
  g3_helix_hand?: 1 | -1; // 1 = Right Hand (RH +β), -1 = Left Hand (LH -β). Flipped to 1 so Gear 3 meshes properly
}

export interface GearboxMetrics {
  stage1_ratio: number;
  stage2_ratio: number;
  total_ratio: number;
  efficiency_pct: number;
  g1_pitch_dia_mm: number;
  g1_outer_dia_mm: number;
  g2_wheel_pitch_dia_mm: number;
  g2_wheel_outer_dia_mm: number;
  g2_pinion_pitch_dia_mm: number;
  g2_pinion_outer_dia_mm: number;
  g3_pitch_dia_mm: number;
  g3_outer_dia_mm: number;
  center_distance_12_mm: number;
  center_distance_23_mm: number;
  total_span_width_mm: number;
  max_height_z_mm: number;
}

export interface GearSubMesh {
  id: string;
  gear_index: 1 | 2 | 3;
  label: string;
  color_hex: number;
  metalness: number;
  roughness: number;
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  center_x_mm: number;
  center_y_mm: number;
  base_z_mm: number;
  mesh_phase_rad: number;
  spin_ratio: number; // Angular velocity multiplier relative to rotor shaft (+1 = rotor CCW, -ratio = CW)
}

export interface GearboxMeshBundle {
  metrics: GearboxMetrics;
  submeshes: GearSubMesh[];
  total_triangles: number;
}

/**
 * Returns default Gearbox Prototype settings matching the 3-gear reference CAD:
 * - Gear 1: 60T Mint 4-spoked bull gear + Orange stepped hub boss
 * - Gear 2: 54T Purple wheel + 16T Lime-green coaxial tall helical pinion
 * - Gear 3: 20T Slate-grey generator pinion with motor shaft collar
 */
export function defaultGearboxConfig(): GearboxConfig {
  return {
    stage_mode: "compound_2stage",
    layout_mode: "meshed",
    module_mm: 1.25,
    pressure_angle_deg: 20.0,
    helix_angle_deg: 15.0,
    backlash_mm: 0.15,

    spoke_width_pct: 26.0,
    rim_wall_mm: 3.5,
    hub_ring_mm: 2.5,

    g1_teeth: 60,
    g1_face_width_mm: 5.0,
    g1_spokes: 4,
    g1_bore_mm: 6.0,
    g1_d_flat_mm: 0.5,
    g1_hub_diameter_mm: 24.0,
    g1_hub_height_mm: 18.0,

    g2_wheel_teeth: 56,
    g2_wheel_face_mm: 5.0,
    g2_spokes: 4,
    g2_pinion_teeth: 15,
    g2_pinion_face_mm: 14.0,
    g2_bore_mm: 5.0,
    g2_d_flat_mm: 0.0,

    g3_teeth: 20,
    g3_face_width_mm: 14.0,
    g3_bore_mm: 3.0,
    g3_d_flat_mm: 0.4,
    g3_boss_height_mm: 4.5,
    g3_helix_hand: 1, // Flipped from legacy -1 to 1 (Right Hand RH) so Gear 3 meshes properly
  };
}

/**
 * Computes exact pitch diameters, outside diameters, center-to-center shaft
 * distances ($a_{12}, a_{23}$), and step-up ratio $G_{\text{total}}$.
 */
export function computeGearboxMetrics(cfg: GearboxConfig): GearboxMetrics {
  const m = Math.max(0.4, cfg.module_mm || 1.25);
  const z1 = Math.max(10, Math.round(cfg.g1_teeth || 60));
  const z2w = Math.max(10, Math.round(cfg.g2_wheel_teeth || 56));
  const z2p = Math.max(8, Math.round(cfg.g2_pinion_teeth || 15));
  const z3 = Math.max(8, Math.round(cfg.g3_teeth || 20));

  const d1 = m * z1;
  const da1 = d1 + 2 * m;
  const d2w = m * z2w;
  const da2w = d2w + 2 * m;
  const d2p = m * z2p;
  const da2p = d2p + 2 * m;
  const d3 = m * z3;
  const da3 = d3 + 2 * m;

  let stage1 = 1.0;
  let stage2 = 1.0;
  let a12 = 0;
  let a23 = 0;
  let effPct = 96.0;

  if (cfg.stage_mode === "direct_1stage") {
    stage1 = z1 / z3;
    stage2 = 1.0;
    a12 = 0.5 * (d1 + d3);
    a23 = 0;
    effPct = 96.5;
  } else if (cfg.stage_mode === "compound_2stage") {
    // Stage 1: Rotor Gear 1 (z1) drives Compound Pinion (z2p)
    // Stage 2: Compound Wheel (z2w) drives Generator Pinion (z3)
    stage1 = z1 / z2p;
    stage2 = z2w / z3;
    a12 = 0.5 * (d1 + d2p);
    a23 = 0.5 * (d2w + d3);
    effPct = 93.5;
  } else {
    // "idler_reference": Reference CAD layout where Gear 1 (z1) meshes with Purple Wheel (z2w)
    // and Coaxial Green Pinion (z2p) or Purple Wheel drives Generator Pinion (z3).
    // In Idler Reference mode: Stage 1 = z1 / z2w, Stage 2 = z2w / z3 => Total = z1 / z3
    stage1 = z1 / z2w;
    stage2 = z2w / z3;
    a12 = 0.5 * (d1 + d2w);
    a23 = 0.5 * (d2w + d3);
    effPct = 94.5;
  }

  const totalRatio = stage1 * stage2;
  const totalSpan =
    cfg.stage_mode === "direct_1stage"
      ? 0.5 * da1 + a12 + 0.5 * da3
      : 0.5 * da1 + a12 + a23 + 0.5 * da3;
  const maxZ = Math.max(
    cfg.g1_face_width_mm + cfg.g1_hub_height_mm,
    cfg.g2_wheel_face_mm + cfg.g2_pinion_face_mm + 2.5,
    cfg.g3_face_width_mm + cfg.g3_boss_height_mm,
  );

  return {
    stage1_ratio: Number(stage1.toFixed(3)),
    stage2_ratio: Number(stage2.toFixed(3)),
    total_ratio: Number(totalRatio.toFixed(3)),
    efficiency_pct: effPct,
    g1_pitch_dia_mm: d1,
    g1_outer_dia_mm: da1,
    g2_wheel_pitch_dia_mm: d2w,
    g2_wheel_outer_dia_mm: da2w,
    g2_pinion_pitch_dia_mm: d2p,
    g2_pinion_outer_dia_mm: da2p,
    g3_pitch_dia_mm: d3,
    g3_outer_dia_mm: da3,
    center_distance_12_mm: Number(a12.toFixed(2)),
    center_distance_23_mm: Number(a23.toFixed(2)),
    total_span_width_mm: Number(totalSpan.toFixed(1)),
    max_height_z_mm: Number(maxZ.toFixed(1)),
  };
}

/**
 * Automatically solves for integer tooth counts `(g1_teeth, g2_wheel_teeth, g2_pinion_teeth, g3_teeth)`
 * that best match `targetRatio` ($G \in [0.5, 20]$) while keeping pinion teeth $\ge 12$ to avoid undercutting.
 */
export function solveGearTeethForTargetRatio(
  cfg: GearboxConfig,
  targetRatio: number,
): GearboxConfig {
  const goal = Math.max(0.5, Math.min(20.0, targetRatio || 3.0));
  const next: GearboxConfig = { ...cfg };

  if (cfg.stage_mode === "direct_1stage" || cfg.stage_mode === "idler_reference") {
    // Total ratio = z1 / z3
    let bestZ1 = next.g1_teeth;
    let bestZ3 = next.g3_teeth;
    let bestErr = Number.POSITIVE_INFINITY;
    for (let z3 = 14; z3 <= 30; z3++) {
      const z1 = Math.max(16, Math.min(96, Math.round(z3 * goal)));
      const ratio = z1 / z3;
      const err = Math.abs(ratio - goal) + 0.002 * Math.abs(z1 - 60);
      if (err < bestErr) {
        bestErr = err;
        bestZ1 = z1;
        bestZ3 = z3;
      }
    }
    next.g1_teeth = bestZ1;
    next.g3_teeth = bestZ3;
    if (cfg.stage_mode === "idler_reference") {
      next.g2_wheel_teeth = Math.max(24, Math.min(84, Math.round(0.92 * bestZ1)));
    }
    return next;
  }

  // compound_2stage: Total ratio = (z1 / z2p) * (z2w / z3)
  const targetPerStage = Math.sqrt(goal);
  let best = {
    z1: next.g1_teeth,
    z2p: next.g2_pinion_teeth,
    z2w: next.g2_wheel_teeth,
    z3: next.g3_teeth,
  };
  let bestScore = Number.POSITIVE_INFINITY;

  for (let z2p = 13; z2p <= 24; z2p++) {
    for (let z3 = 14; z3 <= 26; z3++) {
      const z1 = Math.max(20, Math.min(84, Math.round(z2p * targetPerStage)));
      const remRatio = goal / (z1 / z2p);
      const z2w = Math.max(20, Math.min(80, Math.round(z3 * remRatio)));
      const achieved = (z1 / z2p) * (z2w / z3);
      const err =
        Math.abs(achieved - goal) +
        0.015 * Math.abs(z1 / z2p - z2w / z3) +
        0.001 * Math.abs(z1 - 56);
      if (err < bestScore) {
        bestScore = err;
        best = { z1, z2p, z2w, z3 };
      }
    }
  }

  next.g1_teeth = best.z1;
  next.g2_pinion_teeth = best.z2p;
  next.g2_wheel_teeth = best.z2w;
  next.g3_teeth = best.z3;
  return next;
}

// ============================================================================
// Procedural 2D Involute Contour & 3D Watertight Helical / Spoked Mesh Builder
// ============================================================================

function involute(alphaRad: number): number {
  return Math.tan(alphaRad) - alphaRad;
}

/**
 * Evaluates the outer radius $r(\theta)$ of an involute gear with `teeth` ($Z$),
 * `moduleMm` ($m$), `pressureAngleDeg` ($\alpha_0$), and `backlashMm` at angle $\theta$.
 */
function sampleInvoluteRadiusRing(
  teeth: number,
  moduleMm: number,
  pressureAngleDeg: number,
  backlashMm: number,
  samplesPerTooth: number,
): { angles: Float64Array; radii: Float64Array } {
  const z = Math.max(8, Math.round(teeth));
  const m = Math.max(0.4, moduleMm);
  const alpha0 = ((pressureAngleDeg || 20) * Math.PI) / 180;
  const rp = 0.5 * m * z;
  const rb = rp * Math.cos(alpha0);
  const ra = rp + 1.0 * m;
  const rf = Math.max(0.35 * rp, rp - 1.2 * m);

  const pitchAngle = (2 * Math.PI) / z;
  const backlashAngle = Math.min(0.18 * pitchAngle, Math.max(0, backlashMm) / Math.max(1, rp));
  const halfPitchToothAngle = Math.PI / (2 * z) - 0.5 * backlashAngle;
  const psiBase = halfPitchToothAngle + involute(alpha0);

  // Tip half-angle
  const alphaTip = rb < ra ? Math.acos(rb / ra) : 0;
  const psiTip = Math.max(0.08 * (pitchAngle / 2), psiBase - involute(alphaTip));
  const psiRoot = Math.min(0.36 * pitchAngle, Math.max(psiTip * 1.65, psiBase * 1.08));

  const nTotal = z * samplesPerTooth;
  const angles = new Float64Array(nTotal);
  const radii = new Float64Array(nTotal);

  for (let i = 0; i < nTotal; i++) {
    const theta = (2 * Math.PI * i) / nTotal;
    angles[i] = theta;

    // Local angle relative to nearest tooth center in [-pitchAngle/2, +pitchAngle/2]
    const toothIdx = Math.floor((theta + 0.5 * pitchAngle) / pitchAngle);
    const localAbs = Math.abs(theta - toothIdx * pitchAngle);

    let r = rf;
    if (localAbs <= psiTip) {
      // Tip land with slight crowning
      const u = localAbs / Math.max(1e-6, psiTip);
      r = ra - 0.03 * m * u * u;
    } else if (localAbs < psiRoot) {
      // Involute tooth flank: interpolate from ra at psiTip down to rf at psiRoot
      const t = (localAbs - psiTip) / Math.max(1e-6, psiRoot - psiTip);
      // Smooth S-curve + involute profile curvature
      const invCurve = 1 - Math.pow(t, 1.35);
      r = rf + (ra - rf) * invCurve;
    } else {
      // Root space with subtle fillet
      r = rf;
    }
    radii[i] = r;
  }

  return { angles, radii };
}

/**
 * Evaluates a round or D-flat shaft bore radius $r_{\text{bore}}(\theta)$.
 * For a D-flat bore (`dFlatMm > 0`), the chord at $x = r_0 - d_{\text{flat}}$
 * flattens the circle on the $+x$ side ($|\theta| < \arccos(d / r_0)$).
 */
function sampleBoreRadiusRing(
  angles: Float64Array,
  boreDiaMm: number,
  dFlatMm: number,
): Float64Array {
  const n = angles.length;
  const r0 = Math.max(0.8, 0.5 * boreDiaMm);
  const flatDepth = Math.max(0, Math.min(0.42 * r0, dFlatMm || 0));
  const d = r0 - flatDepth;
  const out = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    const th = angles[i]!;
    const cosT = Math.cos(th);
    if (flatDepth > 1e-4 && cosT > d / r0) {
      out[i] = d / cosT;
    } else {
      out[i] = r0;
    }
  }
  return out;
}

class MeshBuilder {
  positions: number[] = [];
  indices: number[] = [];

  addVertex(x: number, y: number, z: number): number {
    const idx = this.positions.length / 3;
    this.positions.push(x, y, z);
    return idx;
  }

  addTri(a: number, b: number, c: number) {
    if (a === b || b === c || c === a) return;
    this.indices.push(a, b, c);
  }

  addQuad(a: number, b: number, c: number, d: number) {
    this.addTri(a, b, c);
    this.addTri(a, c, d);
  }

  /**
   * Builds a ring of `angles.length` vertices at height `z`, rotating each angle by `twistRad`.
   */
  addPolarRing(angles: Float64Array, radii: Float64Array | number, z: number, twistRad = 0): number {
    const startIdx = this.positions.length / 3;
    const isConst = typeof radii === "number";
    for (let i = 0; i < angles.length; i++) {
      const th = angles[i]! + twistRad;
      const r = isConst ? (radii as number) : (radii as Float64Array)[i]!;
      this.addVertex(r * Math.cos(th), r * Math.sin(th), z);
    }
    return startIdx;
  }

  /**
   * Connects two rings of length `n` into a closed cylindrical/annular strip.
   * When `outwardOrUp` is true, normals point from `ringA -> ringB` crossed with $+\theta$.
   */
  stitchRings(ringA: number, ringB: number, n: number, flipWinding = false) {
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      const a0 = ringA + i;
      const a1 = ringA + next;
      const b0 = ringB + i;
      const b1 = ringB + next;
      if (!flipWinding) {
        this.addQuad(a0, a1, b1, b0);
      } else {
        this.addQuad(a0, b0, b1, a1);
      }
    }
  }

  toSubMesh(meta: {
    id: string;
    gear_index: 1 | 2 | 3;
    label: string;
    color_hex: number;
    metalness: number;
    roughness: number;
    center_x_mm: number;
    center_y_mm: number;
    base_z_mm: number;
    mesh_phase_rad: number;
    spin_ratio: number;
  }): GearSubMesh {
    const pos = new Float32Array(this.positions);
    const ind = new Uint32Array(this.indices);
    const norm = computeVertexNormals(pos, ind);
    return {
      ...meta,
      positions: pos,
      normals: norm,
      indices: ind,
    };
  }
}

function computeVertexNormals(positions: Float32Array, indices: Uint32Array): Float32Array {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const ia = indices[i]! * 3;
    const ib = indices[i + 1]! * 3;
    const ic = indices[i + 2]! * 3;
    const ax = positions[ia]!;
    const ay = positions[ia + 1]!;
    const az = positions[ia + 2]!;
    const bx = positions[ib]!;
    const by = positions[ib + 1]!;
    const bz = positions[ib + 2]!;
    const cx = positions[ic]!;
    const cy = positions[ic + 1]!;
    const cz = positions[ic + 2]!;

    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const vx = cx - ax;
    const vy = cy - ay;
    const vz = cz - az;

    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;

    normals[ia] += nx;
    normals[ia + 1] += ny;
    normals[ia + 2] += nz;
    normals[ib] += nx;
    normals[ib + 1] += ny;
    normals[ib + 2] += nz;
    normals[ic] += nx;
    normals[ic + 1] += ny;
    normals[ic + 2] += nz;
  }

  for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i]!;
    const ny = normals[i + 1]!;
    const nz = normals[i + 2]!;
    const len = Math.hypot(nx, ny, nz);
    if (len > 1e-12) {
      normals[i] = nx / len;
      normals[i + 1] = ny / len;
      normals[i + 2] = nz / len;
    } else {
      normals[i + 2] = 1;
    }
  }
  return normals;
}

/**
 * Builds a watertight involute gear ring (with optional `spokes` quadrant cutouts!)
 * between `innerRadius` (or bore ring) and the outer involute tooth profile.
 */
function buildToothedWheelMesh(opts: {
  teeth: number;
  moduleMm: number;
  pressureAngleDeg: number;
  helixAngleDeg: number;
  helixHand: 1 | -1;
  backlashMm: number;
  faceWidthMm: number;
  boreDiaMm: number;
  dFlatMm: number;
  spokes: number;
  spokeWidthPct?: number;
  rimWallMm?: number;
  hubOuterRadiusMm: number;
  zOffsetMm: number;
}): MeshBuilder {
  const mb = new MeshBuilder();
  const samplesPerTooth = 8;
  const { angles, radii: toothRadii } = sampleInvoluteRadiusRing(
    opts.teeth,
    opts.moduleMm,
    opts.pressureAngleDeg,
    opts.backlashMm,
    samplesPerTooth,
  );
  const n = angles.length;
  const rp = 0.5 * opts.moduleMm * opts.teeth;
  const rf = Math.max(0.35 * rp, rp - 1.2 * opts.moduleMm);
  const rimWall = Math.max(1.2, opts.rimWallMm ?? 2.8 * opts.moduleMm);
  const rimInnerR = Math.max(opts.hubOuterRadiusMm + 2.0, rf - rimWall);
  const useSpokes =
    opts.spokes >= 3 && opts.spokes <= 8 && rimInnerR > opts.hubOuterRadiusMm + 2.5;

  const boreRadii = sampleBoreRadiusRing(angles, opts.boreDiaMm, opts.dFlatMm);
  const z0 = opts.zOffsetMm;
  const z1 = opts.zOffsetMm + opts.faceWidthMm;
  const zLayers = 6;
  const betaRad = ((opts.helixAngleDeg || 0) * Math.PI) / 180;

  // 1. Outer involute tooth surface (helical extruded layers z0 .. z1)
  const outerRings: number[] = [];
  for (let k = 0; k <= zLayers; k++) {
    const frac = k / zLayers;
    const z = z0 + frac * opts.faceWidthMm;
    const twist = opts.helixHand * ((z - z0) * Math.tan(betaRad)) / Math.max(2, rp);
    outerRings.push(mb.addPolarRing(angles, toothRadii, z, twist));
  }
  for (let k = 0; k < zLayers; k++) {
    mb.stitchRings(outerRings[k]!, outerRings[k + 1]!, n, false);
  }

  const topTwist = opts.helixHand * (opts.faceWidthMm * Math.tan(betaRad)) / Math.max(2, rp);

  if (!useSpokes) {
    // Solid gear web from bore out to outer tooth ring
    const boreBot = mb.addPolarRing(angles, boreRadii, z0, 0);
    const boreTop = mb.addPolarRing(angles, boreRadii, z1, 0);
    // Inner bore wall (normals pointing inward toward shaft axis)
    mb.stitchRings(boreBot, boreTop, n, true);
    // Bottom cap (z = z0, normal -z)
    mb.stitchRings(boreBot, outerRings[0]!, n, true);
    // Top cap (z = z1, normal +z)
    mb.stitchRings(boreTop, outerRings[zLayers]!, n, false);
    return mb;
  }

  // Spoked Gear Web (4 quadrant windows between hubOuterR and rimInnerR, matching Reference Gear 1!)
  const hubR = Math.max(opts.boreDiaMm * 0.65, opts.hubOuterRadiusMm);
  const boreBot = mb.addPolarRing(angles, boreRadii, z0, 0);
  const boreTop = mb.addPolarRing(angles, boreRadii, z1, 0);
  const hubBot = mb.addPolarRing(angles, hubR, z0, 0);
  const hubTop = mb.addPolarRing(angles, hubR, z1, 0);
  const rimBot = mb.addPolarRing(angles, rimInnerR, z0, 0);
  const rimTop = mb.addPolarRing(angles, rimInnerR, z1, topTwist);

  // Inner bore wall
  mb.stitchRings(boreBot, boreTop, n, true);
  // Inner solid hub collar annulus (bore -> hubR)
  mb.stitchRings(boreBot, hubBot, n, true);
  mb.stitchRings(boreTop, hubTop, n, false);
  // Outer solid rim annulus (rimInnerR -> toothRadii)
  mb.stitchRings(rimBot, outerRings[0]!, n, true);
  mb.stitchRings(rimTop, outerRings[zLayers]!, n, false);

  // Classify each angular sector i into spoke vs window cutout
  const spokeCount = opts.spokes;
  const spokeFrac = Math.max(0.1, Math.min(0.65, (opts.spokeWidthPct ?? 26) / 100));
  const halfSpoke = 0.5 * spokeFrac;
  const isSpokeSector = new Array<boolean>(n);
  for (let i = 0; i < n; i++) {
    const thMid = (2 * Math.PI * (i + 0.5)) / n;
    const sectorPhase = ((thMid * spokeCount) / (2 * Math.PI)) % 1;
    // Spoke occupies spokeFrac of each sector (default 26%), window cutout occupies the remaining (1 - spokeFrac)
    isSpokeSector[i] = sectorPhase < halfSpoke || sectorPhase > 1.0 - halfSpoke;
  }

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const prev = (i - 1 + n) % n;
    const inSpoke = isSpokeSector[i]!;

    if (inSpoke) {
      // Fill bottom & top spoke faces across [hubR .. rimInnerR]
      mb.addQuad(hubBot + i, rimBot + i, rimBot + next, hubBot + next);
      mb.addQuad(hubTop + i, hubTop + next, rimTop + next, rimTop + i);

      // If previous sector was a window, close the leading radial spoke side wall at index i
      if (!isSpokeSector[prev]) {
        mb.addQuad(hubBot + i, hubTop + i, rimTop + i, rimBot + i);
      }
      // If next sector is a window, close the trailing radial spoke side wall at index next
      if (!isSpokeSector[next]) {
        mb.addQuad(hubBot + next, rimBot + next, rimTop + next, hubTop + next);
      }
    } else {
      // Window cutout: close inner hub outer wall (at hubR) and outer rim inner wall (at rimInnerR)
      mb.addQuad(hubBot + i, hubBot + next, hubTop + next, hubTop + i);
      mb.addQuad(rimBot + i, rimTop + i, rimTop + next, rimBot + next);
    }
  }

  return mb;
}

/**
 * Builds the Orange Stepped Hub Boss on top of Gear 1 (matching Reference Images 1, 2, 3:
 * flared conical base skirt -> tall cylindrical collar -> 3 concentric stepped top rings + D-bore).
 */
function buildSteppedRotorHubBossMesh(opts: {
  boreDiaMm: number;
  dFlatMm: number;
  hubDiaMm: number;
  hubHeightMm: number;
  zBaseMm: number;
}): MeshBuilder {
  const mb = new MeshBuilder();
  const n = 96;
  const angles = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    angles[i] = (2 * Math.PI * i) / n;
  }
  const boreRadii = sampleBoreRadiusRing(angles, opts.boreDiaMm, opts.dFlatMm);
  const rMain = Math.max(opts.boreDiaMm * 0.8, 0.5 * opts.hubDiaMm);
  const rSkirt = rMain * 1.24;
  const h = Math.max(4.0, opts.hubHeightMm);
  const z0 = opts.zBaseMm;

  // Stepped axisymmetric profile from z0 up to z0 + h (matching the orange hub in Image 1 & 3)
  const profile: Array<{ z: number; r: number }> = [
    { z: z0, r: rSkirt },
    { z: z0 + 0.22 * h, r: rMain },
    { z: z0 + 0.78 * h, r: rMain },
    { z: z0 + 0.84 * h, r: rMain * 0.86 },
    { z: z0 + 0.90 * h, r: rMain * 0.86 },
    { z: z0 + 0.94 * h, r: rMain * 0.68 },
    { z: z0 + 1.00 * h, r: rMain * 0.68 },
  ];

  const extRings: number[] = [];
  for (const pt of profile) {
    extRings.push(mb.addPolarRing(angles, pt.r, pt.z, 0));
  }
  for (let k = 0; k < extRings.length - 1; k++) {
    mb.stitchRings(extRings[k]!, extRings[k + 1]!, n, false);
  }

  const boreBot = mb.addPolarRing(angles, boreRadii, z0, 0);
  const boreTop = mb.addPolarRing(angles, boreRadii, z0 + h, 0);
  // Inner bore wall
  mb.stitchRings(boreBot, boreTop, n, true);
  // Bottom cap (z = z0)
  mb.stitchRings(boreBot, extRings[0]!, n, true);
  // Top cap (z = z0 + h)
  mb.stitchRings(boreTop, extRings[extRings.length - 1]!, n, false);

  return mb;
}

/**
 * Builds all 3 gears (with distinct submeshes matching the Reference CAD colors:
 * Mint spoked gear + Orange stepped hub, Purple wheel + Lime-green coaxial pinion,
 * and Slate-grey generator pinion) positioned for either `side_by_side` or `meshed` view.
 */
export function buildGearboxMeshes(cfg: GearboxConfig): GearboxMeshBundle {
  const metrics = computeGearboxMetrics(cfg);
  const submeshes: GearSubMesh[] = [];

  const r1 = 0.5 * metrics.g1_pitch_dia_mm;
  const r2w = 0.5 * metrics.g2_wheel_pitch_dia_mm;
  const r2p = 0.5 * metrics.g2_pinion_pitch_dia_mm;
  const r3 = 0.5 * metrics.g3_pitch_dia_mm;

  // Compute (x, y, z) centers for Gear 1, Gear 2, Gear 3
  let x1 = 0;
  let z1Base = 0;
  let x2 = 0;
  let z2Base = 0;
  let x3 = 0;
  let z3Base = 0;

  if (cfg.layout_mode === "side_by_side") {
    // Side-by-side layout matching the 3 Reference CAD views (Images 1, 2, 3)
    const gap = 4.0 * cfg.module_mm;
    x1 = -(r1 + r2w + gap);
    x2 = 0;
    x3 = r2w + r3 + gap;
    // Match Image 3 Z-elevation alignment: Gear 1 level with Gear 2 Pinion, Gear 3 level with Gear 2 Wheel
    z1Base = cfg.g2_wheel_face_mm;
    z2Base = 0;
    z3Base = 0;
  } else {
    // True meshed center-to-center assembly
    if (cfg.stage_mode === "direct_1stage") {
      x1 = -0.5 * metrics.center_distance_12_mm;
      x3 = +0.5 * metrics.center_distance_12_mm;
      z1Base = 0;
      z3Base = 0;
    } else if (cfg.stage_mode === "compound_2stage") {
      // Gear 1 (at z = g2_wheel_face_mm) meshes with Gear 2 Pinion (z = g2_wheel_face_mm .. top)
      // Gear 2 Wheel (at z = 0) meshes with Gear 3 Pinion (at z = 0)
      x1 = -metrics.center_distance_12_mm;
      x2 = 0;
      x3 = +metrics.center_distance_23_mm;
      z1Base = cfg.g2_wheel_face_mm;
      z2Base = 0;
      z3Base = 0;
    } else {
      // "idler_reference": Gear 1 meshes with Gear 2 Wheel, Gear 2 Wheel/Pinion meshes with Gear 3
      x1 = -metrics.center_distance_12_mm;
      x2 = 0;
      x3 = +metrics.center_distance_23_mm;
      z1Base = 0;
      z2Base = 0;
      z3Base = 0;
    }
  }

  const spokeWidthPct = Math.max(10, Math.min(65, cfg.spoke_width_pct ?? 26));
  const rimWallMm = Math.max(1.5, Math.min(12.0, cfg.rim_wall_mm ?? 3.5));
  const hubRingMm = Math.max(1.0, Math.min(12.0, cfg.hub_ring_mm ?? 2.5));

  // ---- Gear 1: Mint-Green Spoked Bull Gear + Orange Stepped Hub Boss ----
  const g1BossBaseR = cfg.g1_hub_height_mm > 0.5 ? 0.5 * cfg.g1_hub_diameter_mm : 0.5 * cfg.g1_bore_mm;
  const hubOuterR = Math.max(cfg.g1_bore_mm * 0.75, g1BossBaseR + hubRingMm);
  const g1RimBuilder = buildToothedWheelMesh({
    teeth: cfg.g1_teeth,
    moduleMm: cfg.module_mm,
    pressureAngleDeg: cfg.pressure_angle_deg,
    helixAngleDeg: cfg.helix_angle_deg,
    helixHand: 1,
    backlashMm: cfg.backlash_mm,
    faceWidthMm: cfg.g1_face_width_mm,
    boreDiaMm: cfg.g1_bore_mm,
    dFlatMm: cfg.g1_d_flat_mm,
    spokes: cfg.g1_spokes,
    spokeWidthPct,
    rimWallMm,
    hubOuterRadiusMm: hubOuterR,
    zOffsetMm: 0,
  });
  submeshes.push(
    g1RimBuilder.toSubMesh({
      id: "gear1-rim",
      gear_index: 1,
      label: `Gear 1 · Rotor Spoked Wheel (${cfg.g1_teeth}T)`,
      color_hex: 0x8fd9b6, // Mint green from Reference CAD
      metalness: 0.18,
      roughness: 0.36,
      center_x_mm: x1,
      center_y_mm: 0,
      base_z_mm: z1Base,
      mesh_phase_rad: 0,
      spin_ratio: 1.0,
    }),
  );

  if (cfg.g1_hub_height_mm > 0.5) {
    const g1BossBuilder = buildSteppedRotorHubBossMesh({
      boreDiaMm: cfg.g1_bore_mm,
      dFlatMm: cfg.g1_d_flat_mm,
      hubDiaMm: cfg.g1_hub_diameter_mm,
      hubHeightMm: cfg.g1_hub_height_mm,
      zBaseMm: cfg.g1_face_width_mm,
    });
    submeshes.push(
      g1BossBuilder.toSubMesh({
        id: "gear1-hub-boss",
        gear_index: 1,
        label: "Gear 1 · Stepped Rotor Hub Boss",
        color_hex: 0xd95326, // Orange stepped hub boss from Reference CAD
        metalness: 0.25,
        roughness: 0.32,
        center_x_mm: x1,
        center_y_mm: 0,
        base_z_mm: z1Base,
        mesh_phase_rad: 0,
        spin_ratio: 1.0,
      }),
    );
  }

  // ---- Gear 2: Purple Wheel + Lime-Green Coaxial Helical Pinion ----
  if (cfg.stage_mode !== "direct_1stage") {
    const g2SpinRatio = -metrics.stage1_ratio;
    // Align tooth spaces with Gear 1's teeth at the mesh point with Gear 2 Pinion
    const g2Phase = Math.PI / Math.max(8, cfg.g2_pinion_teeth);
    // Keep a solid purple hub collar outside the Lime-Green coaxial pinion's outer diameter
    const g2HubOuterR = Math.max(
      cfg.g2_bore_mm * 0.75,
      0.5 * metrics.g2_pinion_outer_dia_mm + hubRingMm,
    );

    const g2WheelBuilder = buildToothedWheelMesh({
      teeth: cfg.g2_wheel_teeth,
      moduleMm: cfg.module_mm,
      pressureAngleDeg: cfg.pressure_angle_deg,
      helixAngleDeg: cfg.helix_angle_deg,
      helixHand: -1,
      backlashMm: cfg.backlash_mm,
      faceWidthMm: cfg.g2_wheel_face_mm,
      boreDiaMm: cfg.g2_bore_mm,
      dFlatMm: cfg.g2_d_flat_mm,
      spokes: cfg.g2_spokes ?? 0,
      spokeWidthPct,
      rimWallMm,
      hubOuterRadiusMm: g2HubOuterR,
      zOffsetMm: 0,
    });
    submeshes.push(
      g2WheelBuilder.toSubMesh({
        id: "gear2-wheel",
        gear_index: 2,
        label: `Gear 2 · Compound Wheel (${cfg.g2_wheel_teeth}T)`,
        color_hex: 0xb84ba1, // Magenta/Purple from Reference CAD
        metalness: 0.2,
        roughness: 0.38,
        center_x_mm: x2,
        center_y_mm: 0,
        base_z_mm: z2Base,
        mesh_phase_rad: g2Phase,
        spin_ratio: g2SpinRatio,
      }),
    );

    const g2PinionBuilder = buildToothedWheelMesh({
      teeth: cfg.g2_pinion_teeth,
      moduleMm: cfg.module_mm,
      pressureAngleDeg: cfg.pressure_angle_deg,
      helixAngleDeg: cfg.helix_angle_deg,
      helixHand: -1, // Flipped to -1 (LH) so it mates with Gear 1 (RH +1)
      backlashMm: cfg.backlash_mm,
      faceWidthMm: cfg.g2_pinion_face_mm,
      boreDiaMm: cfg.g2_bore_mm,
      dFlatMm: cfg.g2_d_flat_mm,
      spokes: 0,
      hubOuterRadiusMm: cfg.g2_bore_mm,
      zOffsetMm: cfg.g2_wheel_face_mm,
    });
    submeshes.push(
      g2PinionBuilder.toSubMesh({
        id: "gear2-pinion",
        gear_index: 2,
        label: `Gear 2 · Coaxial Helical Pinion (${cfg.g2_pinion_teeth}T)`,
        color_hex: 0x72c455, // Lime green from Reference CAD
        metalness: 0.22,
        roughness: 0.34,
        center_x_mm: x2,
        center_y_mm: 0,
        base_z_mm: z2Base,
        mesh_phase_rad: g2Phase,
        spin_ratio: g2SpinRatio,
      }),
    );

    // Small top collar on the lime-green coaxial pinion (matching Image 1 & 3)
    const g2CollarBuilder = buildSteppedRotorHubBossMesh({
      boreDiaMm: cfg.g2_bore_mm,
      dFlatMm: cfg.g2_d_flat_mm,
      hubDiaMm: Math.max(cfg.g2_bore_mm + 3.0, 2 * r2p * 0.62),
      hubHeightMm: 2.2,
      zBaseMm: cfg.g2_wheel_face_mm + cfg.g2_pinion_face_mm,
    });
    submeshes.push(
      g2CollarBuilder.toSubMesh({
        id: "gear2-collar",
        gear_index: 2,
        label: "Gear 2 · Pinion Collar",
        color_hex: 0x72c455,
        metalness: 0.22,
        roughness: 0.34,
        center_x_mm: x2,
        center_y_mm: 0,
        base_z_mm: z2Base,
        mesh_phase_rad: g2Phase,
        spin_ratio: g2SpinRatio,
      }),
    );
  }

  // ---- Gear 3: Slate-Grey Generator Pinion + Motor Shaft Collar ----
  const g3SpinRatio =
    cfg.stage_mode === "direct_1stage" ? -metrics.total_ratio : +metrics.total_ratio;
  const g3Phase = Math.PI / Math.max(8, cfg.g3_teeth);

  const g3HelixHand: 1 | -1 = cfg.g3_helix_hand === -1 ? -1 : 1;
  const g3PinionBuilder = buildToothedWheelMesh({
    teeth: cfg.g3_teeth,
    moduleMm: cfg.module_mm,
    pressureAngleDeg: cfg.pressure_angle_deg,
    helixAngleDeg: cfg.helix_angle_deg,
    helixHand: g3HelixHand,
    backlashMm: cfg.backlash_mm,
    faceWidthMm: cfg.g3_face_width_mm,
    boreDiaMm: cfg.g3_bore_mm,
    dFlatMm: cfg.g3_d_flat_mm,
    spokes: 0,
    hubOuterRadiusMm: cfg.g3_bore_mm,
    zOffsetMm: 0,
  });
  submeshes.push(
    g3PinionBuilder.toSubMesh({
      id: "gear3-pinion",
      gear_index: 3,
      label: `Gear 3 · Generator Pinion (${cfg.g3_teeth}T)`,
      color_hex: 0x6d8388, // Slate grey from Reference CAD
      metalness: 0.28,
      roughness: 0.35,
      center_x_mm: x3,
      center_y_mm: 0,
      base_z_mm: z3Base,
      mesh_phase_rad: g3Phase,
      spin_ratio: g3SpinRatio,
    }),
  );

  if (cfg.g3_boss_height_mm > 0.5) {
    const g3BossBuilder = buildSteppedRotorHubBossMesh({
      boreDiaMm: cfg.g3_bore_mm,
      dFlatMm: cfg.g3_d_flat_mm,
      hubDiaMm: Math.max(cfg.g3_bore_mm + 3.2, 2 * r3 * 0.42),
      hubHeightMm: cfg.g3_boss_height_mm,
      zBaseMm: cfg.g3_face_width_mm,
    });
    submeshes.push(
      g3BossBuilder.toSubMesh({
        id: "gear3-boss",
        gear_index: 3,
        label: "Gear 3 · Motor Shaft Boss",
        color_hex: 0x6d8388,
        metalness: 0.28,
        roughness: 0.35,
        center_x_mm: x3,
        center_y_mm: 0,
        base_z_mm: z3Base,
        mesh_phase_rad: g3Phase,
        spin_ratio: g3SpinRatio,
      }),
    );
  }

  const totalTriangles = submeshes.reduce((acc, s) => acc + s.indices.length / 3, 0);
  return {
    metrics,
    submeshes,
    total_triangles: totalTriangles,
  };
}

/**
 * Serializes either a single gear (`gear1`, `gear2`, `gear3`) or all 3 gears
 * (`all`, placed flat on the $z = 0$ build plate) into an IEEE-754 binary STL.
 */
export function exportGearStlBytes(cfg: GearboxConfig, target: GearExportTarget): Uint8Array {
  const plateCfg: GearboxConfig = { ...cfg, layout_mode: "side_by_side" };
  const bundle = buildGearboxMeshes(plateCfg);
  const selected = bundle.submeshes.filter((s) => {
    if (target === "all") return true;
    if (target === "gear1") return s.gear_index === 1;
    if (target === "gear2") return s.gear_index === 2;
    return s.gear_index === 3;
  });

  const triCount = selected.reduce((sum, s) => sum + s.indices.length / 3, 0);
  const buf = new ArrayBuffer(84 + triCount * 50);
  const view = new DataView(buf);

  const headerText = `BladeLab Gearbox STL (${target}) G=${bundle.metrics.total_ratio}:1 m=${cfg.module_mm}mm`;
  for (let i = 0; i < Math.min(79, headerText.length); i++) {
    view.setUint8(i, headerText.charCodeAt(i));
  }
  view.setUint32(80, triCount, true);

  let offset = 84;
  for (const sub of selected) {
    // When exporting for 3D printing, place each gear's bottom face flat at z = 0
    // and center single-gear exports at (x=0, y=0)
    const ox = target === "all" ? sub.center_x_mm : 0;
    const oy = target === "all" ? sub.center_y_mm : 0;
    const oz = 0;

    const pos = sub.positions;
    const ind = sub.indices;
    for (let i = 0; i < ind.length; i += 3) {
      const ia = ind[i]! * 3;
      const ib = ind[i + 1]! * 3;
      const ic = ind[i + 2]! * 3;

      const ax = pos[ia]! + ox;
      const ay = pos[ia + 1]! + oy;
      const az = pos[ia + 2]! + oz;
      const bx = pos[ib]! + ox;
      const by = pos[ib + 1]! + oy;
      const bz = pos[ib + 2]! + oz;
      const cx = pos[ic]! + ox;
      const cy = pos[ic + 1]! + oy;
      const cz = pos[ic + 2]! + oz;

      const ux = bx - ax;
      const uy = by - ay;
      const uz = bz - az;
      const vx = cx - ax;
      const vy = cy - ay;
      const vz = cz - az;
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz);
      if (len > 1e-12) {
        nx /= len;
        ny /= len;
        nz /= len;
      } else {
        nz = 1;
      }

      view.setFloat32(offset, nx, true);
      view.setFloat32(offset + 4, ny, true);
      view.setFloat32(offset + 8, nz, true);
      view.setFloat32(offset + 12, ax, true);
      view.setFloat32(offset + 16, ay, true);
      view.setFloat32(offset + 20, az, true);
      view.setFloat32(offset + 24, bx, true);
      view.setFloat32(offset + 28, by, true);
      view.setFloat32(offset + 32, bz, true);
      view.setFloat32(offset + 36, cx, true);
      view.setFloat32(offset + 40, cy, true);
      view.setFloat32(offset + 44, cz, true);
      view.setUint16(offset + 48, 0, true);
      offset += 50;
    }
  }

  return new Uint8Array(buf);
}

/**
 * Exports raw triangle positions (non-indexed or flattened) as a binary STL byte array.
 * Each triangle consists of 9 consecutive numbers: [ax, ay, az, bx, by, bz, cx, cy, cz].
 */
export function exportBufferGeometryStlBytes(
  positions: ArrayLike<number>,
  headerText: string = "BladeLab STL Model",
): Uint8Array {
  const triCount = Math.floor(positions.length / 9);
  const buf = new ArrayBuffer(84 + triCount * 50);
  const view = new DataView(buf);

  for (let i = 0; i < Math.min(79, headerText.length); i++) {
    view.setUint8(i, headerText.charCodeAt(i));
  }
  view.setUint32(80, triCount, true);

  let offset = 84;
  for (let t = 0; t < triCount; t++) {
    const ax = Number(positions[t * 9]) || 0;
    const ay = Number(positions[t * 9 + 1]) || 0;
    const az = Number(positions[t * 9 + 2]) || 0;
    const bx = Number(positions[t * 9 + 3]) || 0;
    const by = Number(positions[t * 9 + 4]) || 0;
    const bz = Number(positions[t * 9 + 5]) || 0;
    const cx = Number(positions[t * 9 + 6]) || 0;
    const cy = Number(positions[t * 9 + 7]) || 0;
    const cz = Number(positions[t * 9 + 8]) || 0;

    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const vx = cx - ax;
    const vy = cy - ay;
    const vz = cz - az;
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz);
    if (len > 1e-12) {
      nx /= len;
      ny /= len;
      nz /= len;
    } else {
      nz = 1;
    }

    view.setFloat32(offset, nx, true);
    view.setFloat32(offset + 4, ny, true);
    view.setFloat32(offset + 8, nz, true);
    view.setFloat32(offset + 12, ax, true);
    view.setFloat32(offset + 16, ay, true);
    view.setFloat32(offset + 20, az, true);
    view.setFloat32(offset + 24, bx, true);
    view.setFloat32(offset + 28, by, true);
    view.setFloat32(offset + 32, bz, true);
    view.setFloat32(offset + 36, cx, true);
    view.setFloat32(offset + 40, cy, true);
    view.setFloat32(offset + 44, cz, true);
    view.setUint16(offset + 48, 0, true);
    offset += 50;
  }

  return new Uint8Array(buf);
}

