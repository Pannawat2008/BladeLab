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
 * Updates a Layer-1 `Rotor` numeric field and returns a new `Design`.
 */
export function updateRotorField<K extends keyof Rotor>(
  design: Design,
  field: K,
  value: Rotor[K],
): Design {
  const next = cloneDesign(design);
  next.rotor[field] = value;
  return next;
}

/**
 * Updates the physical blade span length `L = R - r_0` (in mm) by setting
 * `rotor.radius_mm = rotor.hub_radius_mm + max(10, bladeLengthMm)`.
 */
export function updateBladeLengthMm(design: Design, bladeLengthMm: number): Design {
  const next = cloneDesign(design);
  const clampedLength = Math.max(10, bladeLengthMm);
  next.rotor.radius_mm = Number((next.rotor.hub_radius_mm + clampedLength).toFixed(4));
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
  let next = cloneDesign(after);
  for (const lockedRatio of lockedSpanRatios) {
    const matched = beforeRows.find(
      (row) => Math.abs(row.span_ratio - lockedRatio) <= RATIO_EPS,
    );
    if (matched) {
      next = setStationOverride(next, matched.span_ratio, {
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
    terminal_voltage_v: number;
    current_a: number;
    electrical_power_w: number;
    efficiency: number;
  };
}

export interface AeroSimulationBundle {
  design_point: {
    rpm: number;
    cp: number;
    ct: number;
    cq: number;
    power_w: number;
    thrust_n: number;
    torque_nm: number;
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
    `<line class="betz-limit" x1="${padX}" y1="${betzY}" x2="${w - padX}" y2="${betzY}" stroke="#d85858" stroke-width="1" stroke-dasharray="4 3" />`,
  ];

  if (options.designTsr !== undefined && Number.isFinite(options.designTsr)) {
    const dx = toX(options.designTsr).toFixed(1);
    parts.push(
      `<line class="design-tsr" x1="${dx}" y1="${padY}" x2="${dx}" y2="${h - padY}" stroke="#384152" stroke-width="1" stroke-dasharray="2 2" />`,
    );
  }

  if (options.baselineASweep && options.baselineASweep.length > 0) {
    parts.push(
      `<path class="curve-a" d="${buildPath(options.baselineASweep)}" fill="none" stroke="#a0aec0" stroke-width="1.75" stroke-dasharray="4 3" />`,
    );
  }

  if (currentSweep.length > 0) {
    parts.push(
      `<path class="curve-b" d="${buildPath(currentSweep)}" fill="none" stroke="#7bd88f" stroke-width="2.2" />`,
    );
  }

  for (const exp of options.experimentalPoints ?? []) {
    const cx = toX(exp.tsr).toFixed(1);
    const cy = toY(exp.cp).toFixed(1);
    parts.push(
      `<circle class="exp-point" data-tsr="${exp.tsr}" data-cp="${exp.cp}" cx="${cx}" cy="${cy}" r="4" fill="#f5a623" stroke="#111318" stroke-width="1.2" />`,
    );
  }

  return parts.join("\n");
}

export interface AirfoilPreviewHoleOptions {
  diameterMm: number;
  offsetXMm?: number;
  offsetYMm?: number;
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
    `<line x1="${padX}" y1="${midY}" x2="${w - padX}" y2="${midY}" stroke="#283242" stroke-width="1" stroke-dasharray="3 3" />`,
    `<polygon class="airfoil-contour" points="${contourPoly}" fill="rgba(59, 130, 246, 0.18)" stroke="#3b82f6" stroke-width="1.75" />`,
    `<path class="airfoil-camber" d="${camberPts.join(" ")}" fill="none" stroke="#60a5fa" stroke-width="1" stroke-dasharray="2 2" />`,
    `<line x1="${pivotX}" y1="12" x2="${pivotX}" y2="${h - 8}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 2" />`,
  ];

  if (holeSpec && holeSpec.diameterMm > 0.1) {
    const rootChordMm = Math.max(resolveStationsPreview(design)[0]?.effective_chord_mm ?? 70, 5);
    const maxThickMm = t * rootChordMm;
    const effRadiusMm = Math.min(0.5 * holeSpec.diameterMm, 0.38 * maxThickMm);
    const oxMm = Math.max(-0.15 * maxThickMm, Math.min(0.15 * maxThickMm, holeSpec.offsetXMm ?? 0));
    const oyMm = Math.max(-0.15 * maxThickMm, Math.min(0.15 * maxThickMm, holeSpec.offsetYMm ?? 0));
    const coreXc = 0.3 + oxMm / rootChordMm;
    const coreYc = 0.75 * m + oyMm / rootChordMm;
    const holeCx = (padX + coreXc * scale).toFixed(1);
    const holeCy = (midY - coreYc * scale * 1.35).toFixed(1);
    const holeR = Math.max(2.2, (effRadiusMm / rootChordMm) * scale * 1.35).toFixed(1);
    elements.push(
      `<circle class="spar-hole-circle" cx="${holeCx}" cy="${holeCy}" r="${holeR}" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="1.6" />`,
    );
  }

  elements.push(
    `<circle class="pitch-axis-dot" cx="${pivotX}" cy="${midY}" r="4.2" fill="#f59e0b" stroke="#0c0f14" stroke-width="1.4" />`,
    `<text x="${padX}" y="14" fill="#94a3b8" font-size="10" font-family="ui-monospace, monospace">${label} · Pivot x/c=${design.rotor.pitch_axis_ratio.toFixed(2)}</text>`,
  );

  return elements.join("\n");
}
