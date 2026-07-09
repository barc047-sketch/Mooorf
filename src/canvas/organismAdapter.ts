import type { Camera, PaletteMode, Privacy, SpaceCell } from "../types";
import { areaToRadius, clamp } from "../lib/geometry";
import { getAreaRange, getNucleusColor } from "../design/colorMapping";
import { MAX_NUCLEI } from "../experiments/organism-lab/organism-types";
import {
  DEFAULT_ORGANISM_SETTINGS,
  type OrganismAdapterOptions,
} from "./organismProductionSettings";

export interface ProductionNucleus {
  id: string;
  label: string;
  fx: number;
  fy: number;
  r: number;
  strength: number;
  sx: number;
  sy: number;
  screenR: number;
  color: string;
  category: string;
  privacy: Privacy;
}

export interface DragPosition {
  id: string;
  x: number;
  y: number;
}

/* Per-frame runtime state owned by the canvas view: motion clock + world-space
   smoothing (V6H.1 response/drift/breathing/wobble). Never touches the store. */
export interface OrganismMotionState {
  time: number;
  /** dt handed over once per rAF tick; consumed by the first mapping call */
  pendingDt: number;
  /** true while smoothed positions/radii are still easing toward targets */
  settling: boolean;
  smooth: Map<string, { x: number; y: number; r: number }>;
}

export const createMotionState = (): OrganismMotionState => ({
  time: 0,
  pendingDt: 0,
  settling: false,
  smooth: new Map(),
});

/** Advance the clock once per frame; mapping consumes pendingDt exactly once. */
export function advanceMotion(
  state: OrganismMotionState,
  dt: number,
  timeScale: number
): void {
  state.time += dt * timeScale;
  state.pendingDt = dt;
}

const privacyStrength: Record<Privacy, number> = {
  public: 1.04,
  shared: 1,
  private: 0.94,
};

const DEFAULT_ADAPTER_OPTIONS: OrganismAdapterOptions = {
  radiusMin: DEFAULT_ORGANISM_SETTINGS.radiusMin,
  radiusMax: DEFAULT_ORGANISM_SETTINGS.radiusMax,
  sizeVariation: DEFAULT_ORGANISM_SETTINGS.sizeVariation,
  nucleusStrength: DEFAULT_ORGANISM_SETTINGS.nucleusStrength,
  globalOffset: DEFAULT_ORGANISM_SETTINGS.globalOffset,
  offsetX: DEFAULT_ORGANISM_SETTINGS.offsetX,
  offsetY: DEFAULT_ORGANISM_SETTINGS.offsetY,
  radialOffset: DEFAULT_ORGANISM_SETTINGS.radialOffset,
  angularOffset: DEFAULT_ORGANISM_SETTINGS.angularOffset,
  timeScale: DEFAULT_ORGANISM_SETTINGS.timeScale,
  response: DEFAULT_ORGANISM_SETTINGS.response,
  drift: DEFAULT_ORGANISM_SETTINGS.drift,
  breathing: DEFAULT_ORGANISM_SETTINGS.breathing,
  wobble: DEFAULT_ORGANISM_SETTINGS.wobble,
  phaseVariation: DEFAULT_ORGANISM_SETTINGS.phaseVariation,
};

const TAU = Math.PI * 2;

/** Deterministic 0..1 hash — per-space phase seeds that survive re-renders. */
export function hash01(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const fract = (v: number) => v - Math.floor(v);

export function worldToScreen(
  x: number,
  y: number,
  camera: Camera,
  width: number,
  height: number
): { sx: number; sy: number } {
  return {
    sx: (x - camera.x) * camera.zoom + width / 2,
    sy: (y - camera.y) * camera.zoom + height / 2,
  };
}

export function screenToWorld(
  sx: number,
  sy: number,
  camera: Camera,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: (sx - width / 2) / camera.zoom + camera.x,
    y: (sy - height / 2) / camera.zoom + camera.y,
  };
}

export function worldToField(
  x: number,
  y: number,
  camera: Camera,
  width: number,
  height: number
): { fx: number; fy: number } {
  const { sx, sy } = worldToScreen(x, y, camera, width, height);
  const halfMin = Math.max(1, Math.min(width, height) / 2);
  return {
    fx: (sx - width / 2) / halfMin,
    fy: -(sy - height / 2) / halfMin,
  };
}

export function fieldToScreen(
  fx: number,
  fy: number,
  width: number,
  height: number
): { sx: number; sy: number } {
  const halfMin = Math.max(1, Math.min(width, height) / 2);
  return {
    sx: width / 2 + fx * halfMin,
    sy: height / 2 - fy * halfMin,
  };
}

/** Invert the visual layout transform for drag deltas (world units) so a
    dragged nucleus tracks the pointer 1:1 while offsets are active — same
    contract as the lab's dragNucleusBy. Radial offset is delta-neutral. */
export function dragDeltaWorldToStore(
  dx: number,
  dy: number,
  opts: OrganismAdapterOptions
): { x: number; y: number } {
  const a = (-opts.angularOffset * Math.PI) / 180;
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);
  const g = Math.max(opts.globalOffset, 0.2);
  return {
    x: (dx * cosA - dy * sinA) / g,
    y: (dx * sinA + dy * cosA) / g,
  };
}

export function spacesToNuclei(
  spaces: SpaceCell[],
  camera: Camera,
  width: number,
  height: number,
  selectedId: string | null,
  drag?: DragPosition | null,
  opts: OrganismAdapterOptions = DEFAULT_ADAPTER_OPTIONS,
  motion?: OrganismMotionState,
  paletteMode: PaletteMode = "core",
  nucleusPaletteId?: string
): ProductionNucleus[] {
  const halfMin = Math.max(1, Math.min(width, height) / 2);
  const visible = spaces.slice(0, MAX_NUCLEI);
  const areaRange = getAreaRange(visible);

  /* — 1. world targets + response smoothing (consume pendingDt at most once) — */
  const dt = motion ? motion.pendingDt : 0;
  if (motion) motion.pendingDt = 0;
  const k = 1 - Math.exp(-Math.max(opts.response, 0.0001) * Math.max(dt, 0));
  let settling = false;

  const eff = visible.map((space) => {
    const dragging = drag?.id === space.id;
    const tx = dragging ? drag.x : space.x;
    const ty = dragging ? drag.y : space.y;
    const sizeVar = 1 + (hash01(space.id) * 2 - 1) * opts.sizeVariation * 0.4;
    const tr = areaToRadius(space.area) * sizeVar;

    if (!motion) return { space, x: tx, y: ty, r: tr };

    let sm = motion.smooth.get(space.id);
    if (!sm) {
      sm = { x: tx, y: ty, r: tr };
      motion.smooth.set(space.id, sm);
    } else if (dragging) {
      /* drag snaps — pointer feel stays exactly as V6G stabilized it */
      sm.x = tx;
      sm.y = ty;
    }
    if (dt > 0 && !dragging) {
      sm.x += (tx - sm.x) * k;
      sm.y += (ty - sm.y) * k;
    }
    if (dt > 0) sm.r += (tr - sm.r) * k;
    settling =
      settling ||
      (Math.abs(tx - sm.x) + Math.abs(ty - sm.y)) * camera.zoom > 0.15 ||
      Math.abs(tr - sm.r) * camera.zoom > 0.15;
    return { space, x: sm.x, y: sm.y, r: sm.r };
  });

  if (motion && dt > 0) {
    motion.settling = settling;
    if (motion.smooth.size > visible.length) {
      const alive = new Set(visible.map((s) => s.id));
      for (const id of motion.smooth.keys()) {
        if (!alive.has(id)) motion.smooth.delete(id);
      }
    }
  }

  /* — 2. visual layout transform about the layout centroid (world space) — */
  const hasTransform =
    opts.globalOffset !== 1 || opts.radialOffset !== 0 || opts.angularOffset !== 0;
  let cx = 0;
  let cy = 0;
  let meanDist = 0;
  if (hasTransform && eff.length > 0) {
    for (const e of eff) {
      cx += e.x;
      cy += e.y;
    }
    cx /= eff.length;
    cy /= eff.length;
    for (const e of eff) meanDist += Math.hypot(e.x - cx, e.y - cy);
    meanDist = Math.max(meanDist / eff.length, 1e-4);
  }
  const ang = (opts.angularOffset * Math.PI) / 180;
  const cosA = Math.cos(ang);
  const sinA = Math.sin(ang);

  const time = motion ? motion.time : 0;
  const motionOn =
    !!motion &&
    opts.timeScale > 0 &&
    (opts.drift > 0.001 || opts.breathing > 0.001 || opts.wobble > 0.001);

  /* — 3. camera map + idle motion + field offsets — */
  return eff.map(({ space, x, y, r }) => {
    const mappedColor = getNucleusColor(space, paletteMode, areaRange, nucleusPaletteId);
    let wx = x;
    let wy = y;
    if (hasTransform) {
      const rx = wx - cx;
      const ry = wy - cy;
      const len = Math.hypot(rx, ry);
      if (len > 1e-5) {
        const scaled = Math.max(len * opts.globalOffset + opts.radialOffset * meanDist, 0.001);
        const ux = (rx * cosA - ry * sinA) / len;
        const uy = (rx * sinA + ry * cosA) / len;
        wx = cx + ux * scaled;
        wy = cy + uy * scaled;
      }
    }

    const field = worldToField(wx, wy, camera, width, height);
    let fx = field.fx + opts.offsetX;
    let fy = field.fy + opts.offsetY;

    const rBase = clamp((r * camera.zoom) / halfMin, opts.radiusMin, opts.radiusMax);
    let rf = rBase;

    if (motionOn) {
      const h = hash01(space.id);
      const ph = h * TAU * opts.phaseVariation;
      const s0 = fract(h * 7.13) * TAU;
      const s1 = fract(h * 13.7) * TAU;
      const s2 = fract(h * 29.3) * TAU;
      const s3 = fract(h * 47.9) * TAU;
      const rNorm = clamp(
        (rBase - opts.radiusMin) / Math.max(opts.radiusMax - opts.radiusMin, 1e-4),
        0,
        1
      );
      const ms = 1.25 + (0.55 - 1.25) * rNorm; /* small nuclei livelier (lab) */
      if (drag?.id !== space.id) {
        fx += opts.drift * 0.055 * ms * Math.sin(time * 0.26 + ph + s0);
        fy += opts.drift * 0.055 * ms * Math.cos(time * 0.21 + ph + s1);
        fx += opts.wobble * 0.016 * ms * Math.sin(time * 1.45 + s2);
        fy += opts.wobble * 0.016 * ms * Math.cos(time * 1.62 + s3);
      }
      rf = rBase * (1 + opts.breathing * 0.085 * Math.sin(time * 0.85 + ph + s0 * 0.7));
    }

    const screen = fieldToScreen(fx, fy, width, height);
    return {
      id: space.id,
      label: space.name,
      fx,
      fy,
      r: rf,
      strength:
        privacyStrength[space.privacy] *
        (space.id === selectedId ? 1.16 : 1) *
        opts.nucleusStrength,
      sx: screen.sx,
      sy: screen.sy,
      screenR: rf * halfMin,
      color: mappedColor.fill,
      category: space.category,
      privacy: space.privacy,
    };
  });
}

export function hitTestNuclei(
  nuclei: ProductionNucleus[],
  sx: number,
  sy: number
): ProductionNucleus | null {
  let best: ProductionNucleus | null = null;
  let bestScore = Infinity;
  for (let i = nuclei.length - 1; i >= 0; i--) {
    const n = nuclei[i];
    const dx = sx - n.sx;
    const dy = sy - n.sy;
    const hitR = Math.max(18, n.screenR * 1.08);
    const d = Math.hypot(dx, dy);
    if (d <= hitR && d - hitR < bestScore) {
      best = n;
      bestScore = d - hitR;
    }
  }
  return best;
}
