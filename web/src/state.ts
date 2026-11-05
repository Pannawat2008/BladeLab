// Pure state management for BladeLab UI (T-105):
// - Undo/redo history stack over immutable `Design` snapshots
// - Layer 1 rotor & distribution helpers (Linear / Constant / Schmitz)
// - Layer 3 per-station resolution and override editing

import type { CurveSource, Design, Rotor, StationOverride } from "./types/blade-model";

export const RATIO_EPS = 1e-9;

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
 * Switches Layer-1/2 distributions to Schmitz optimum-rotor curves.
 */
export function applySchmitzLayer1(
  design: Design,
  designCl = 1.0,
  designAlphaDeg = 6.0,
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
  return next;
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
  return next;
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
