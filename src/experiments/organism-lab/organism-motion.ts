/* V6E Organism Lab — CPU simulation: offset layout, idle life, drag,
   and delta-time-aware exponential smoothing. Runs once per frame inside the
   rAF loop; never touches React state. Positions are field units. */

import {
  MAX_NUCLEI,
  type Nucleus,
  type NucleusSpec,
  type OrganismParams,
} from "./organism-types";

export interface SimState {
  nuclei: Nucleus[];
  time: number;
  nextId: number;
}

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = 2.39996322973;

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** frame-rate independent smoothing factor: current += (target-current) * k */
export function expK(response: number, dt: number): number {
  return 1 - Math.exp(-Math.max(response, 0.0001) * dt);
}

function makeNucleus(id: number, spec: NucleusSpec, rand: () => number): Nucleus {
  return {
    id,
    homeX: spec.x,
    homeY: spec.y,
    targetX: spec.x,
    targetY: spec.y,
    x: spec.x,
    y: spec.y,
    baseR: spec.r,
    targetR: spec.r,
    /* spawn small — the smoother grows it in organically */
    r: spec.r * 0.15,
    specStrength: spec.strength ?? 1,
    polarity: spec.polarity ?? 1,
    phase: spec.phase ?? rand(),
    seeds: [rand() * TAU, rand() * TAU, rand() * TAU, rand() * TAU],
    dragging: false,
  };
}

export function createSimulation(specs: NucleusSpec[], rand: () => number = Math.random): SimState {
  const state: SimState = { nuclei: [], time: 0, nextId: 1 };
  resetSimulation(state, specs, rand);
  return state;
}

export function resetSimulation(
  state: SimState,
  specs: NucleusSpec[],
  rand: () => number = Math.random
): void {
  state.nuclei = specs.slice(0, MAX_NUCLEI).map((s) => makeNucleus(state.nextId++, s, rand));
}

/** Index of the dominant positive body — the anchor for all offset layout. */
export function coreIndex(state: SimState): number {
  let best = 0;
  let bestR = -Infinity;
  for (let i = 0; i < state.nuclei.length; i++) {
    const n = state.nuclei[i];
    if (n.polarity > 0 && n.baseR > bestR) {
      bestR = n.baseR;
      best = i;
    }
  }
  return best;
}

function randomRadius(params: OrganismParams, rand: () => number): number {
  const mid = lerp(params.radiusMin, params.radiusMax, 0.35);
  const spread = (rand() * 2 - 1) * params.sizeVariation * 0.85;
  return clamp(mid * (1 + spread), params.radiusMin, params.radiusMax);
}

/** Grow/shrink the population toward params.count. New satellites bud from the core. */
export function syncNucleusCount(
  state: SimState,
  params: OrganismParams,
  rand: () => number = Math.random
): void {
  const target = clamp(Math.round(params.count), 1, MAX_NUCLEI);
  while (state.nuclei.length < target) {
    const ci = coreIndex(state);
    const core = state.nuclei[ci];
    const idx = state.nextId;
    const angle = idx * GOLDEN_ANGLE + rand() * 0.5;
    const dist = 0.42 + 0.3 * rand();
    const spec: NucleusSpec = {
      x: (core?.homeX ?? 0) + Math.cos(angle) * dist,
      y: (core?.homeY ?? 0) + Math.sin(angle) * dist,
      r: randomRadius(params, rand),
    };
    const n = makeNucleus(state.nextId++, spec, rand);
    /* bud out of the core body instead of popping in place */
    if (core) {
      n.x = core.x;
      n.y = core.y;
    }
    state.nuclei.push(n);
  }
  while (state.nuclei.length > target) {
    const ci = coreIndex(state);
    let removeAt = state.nuclei.length - 1;
    if (removeAt === ci) removeAt -= 1;
    if (removeAt < 0) break;
    state.nuclei.splice(removeAt, 1);
  }
}

/** Re-scatter everything but the core. Voids stay tucked inside the core body. */
export function randomizeNuclei(
  state: SimState,
  params: OrganismParams,
  rand: () => number = Math.random
): void {
  const ci = coreIndex(state);
  const core = state.nuclei[ci];
  for (let i = 0; i < state.nuclei.length; i++) {
    if (i === ci) continue;
    const n = state.nuclei[i];
    const angle = rand() * TAU;
    const dist =
      n.polarity < 0
        ? (core ? core.baseR : 0.3) * (0.15 + 0.5 * rand())
        : 0.3 + 0.5 * rand();
    n.homeX = (core?.homeX ?? 0) + Math.cos(angle) * dist;
    n.homeY = (core?.homeY ?? 0) + Math.sin(angle) * dist;
    if (n.polarity > 0) n.baseR = randomRadius(params, rand);
    n.phase = rand();
    n.seeds = [rand() * TAU, rand() * TAU, rand() * TAU, rand() * TAU];
  }
}

/** One simulation tick: layout targets from offsets, add idle life, smooth. */
export function stepSimulation(state: SimState, params: OrganismParams, dtRaw: number): void {
  const dt = clamp(dtRaw, 0, 0.05);
  state.time += dt * params.timeScale;
  const t = state.time;
  const ci = coreIndex(state);
  const core = state.nuclei[ci];
  if (!core) return;
  const angRad = (params.angularOffset * Math.PI) / 180;
  const cosA = Math.cos(angRad);
  const sinA = Math.sin(angRad);
  const k = expK(params.response, dt);
  const rRange = Math.max(params.radiusMax - params.radiusMin, 1e-4);

  for (let i = 0; i < state.nuclei.length; i++) {
    const n = state.nuclei[i];
    let lx: number;
    let ly: number;

    if (i === ci) {
      lx = n.homeX;
      ly = n.homeY;
    } else {
      let rx = n.homeX - core.homeX;
      let ry = n.homeY - core.homeY;
      const len = Math.hypot(rx, ry);
      if (len > 1e-5) {
        const scaledLen = Math.max(len * params.globalOffset + params.radialOffset, 0.001);
        const ux = (rx * cosA - ry * sinA) / len;
        const uy = (rx * sinA + ry * cosA) / len;
        rx = ux * scaledLen;
        ry = uy * scaledLen;
      }
      lx = core.homeX + rx + params.offsetX;
      ly = core.homeY + ry + params.offsetY;
    }

    const ph = n.phase * TAU * params.phaseVariation;
    const rNorm = clamp((n.baseR - params.radiusMin) / rRange, 0, 1);
    const motionScale = lerp(1.25, 0.55, rNorm); /* small nuclei livelier */

    if (!n.dragging) {
      lx += params.drift * 0.055 * motionScale * Math.sin(t * 0.26 + ph + n.seeds[0]);
      ly += params.drift * 0.055 * motionScale * Math.cos(t * 0.21 + ph + n.seeds[1]);
      lx += params.wobble * 0.016 * motionScale * Math.sin(t * 1.45 + n.seeds[2]);
      ly += params.wobble * 0.016 * motionScale * Math.cos(t * 1.62 + n.seeds[3]);
    }

    n.targetX = lx;
    n.targetY = ly;

    const effR = clamp(n.baseR, params.radiusMin, params.radiusMax);
    const breathe = 1 + params.breathing * 0.085 * Math.sin(t * 0.85 + ph + n.seeds[0] * 0.7);
    n.targetR = effR * breathe;

    n.x += (n.targetX - n.x) * k;
    n.y += (n.targetY - n.y) * k;
    n.r += (n.targetR - n.r) * k;
  }
}

/** Pack rendered nuclei into the shader's vec4 uniform array. Returns count. */
export function packNuclei(state: SimState, params: OrganismParams, out: Float32Array): number {
  const count = Math.min(state.nuclei.length, MAX_NUCLEI);
  const rRange = Math.max(params.radiusMax - params.radiusMin, 1e-4);
  for (let i = 0; i < count; i++) {
    const n = state.nuclei[i];
    const rNorm = clamp((n.r - params.radiusMin) / rRange, 0, 1);
    /* small satellites carry less field energy — keeps pockets at cores/overlaps */
    const taper = lerp(0.62, 1, rNorm);
    const o = i * 4;
    out[o] = n.x;
    out[o + 1] = n.y;
    out[o + 2] = n.r;
    out[o + 3] = n.polarity * n.specStrength * params.nucleusStrength * taper;
  }
  return count;
}

/** Hit-test rendered positions; returns nucleus id or null. */
export function findNucleusAt(state: SimState, fx: number, fy: number): number | null {
  let bestId: number | null = null;
  let bestScore = Infinity;
  for (const n of state.nuclei) {
    const d = Math.hypot(fx - n.x, fy - n.y);
    const margin = Math.max(n.r * 1.1, n.r + 0.05);
    const score = d - n.r;
    if (d < margin && score < bestScore) {
      bestScore = score;
      bestId = n.id;
    }
  }
  return bestId;
}

export function setNucleusDragging(state: SimState, id: number | null, dragging: boolean): void {
  for (const n of state.nuclei) {
    if (id === null || n.id === id) n.dragging = dragging && n.id === id;
  }
}

/** Apply a drag delta given in laid-out (screen/field) space back onto the home
    anchor, inverting the offset layout so the nucleus tracks the pointer 1:1. */
export function dragNucleusBy(
  state: SimState,
  params: OrganismParams,
  id: number,
  dLaidX: number,
  dLaidY: number
): void {
  const i = state.nuclei.findIndex((n) => n.id === id);
  if (i < 0) return;
  const n = state.nuclei[i];
  if (i === coreIndex(state)) {
    n.homeX += dLaidX;
    n.homeY += dLaidY;
    return;
  }
  const angRad = (-params.angularOffset * Math.PI) / 180;
  const cosA = Math.cos(angRad);
  const sinA = Math.sin(angRad);
  const s = Math.max(params.globalOffset, 0.2);
  n.homeX += (dLaidX * cosA - dLaidY * sinA) / s;
  n.homeY += (dLaidX * sinA + dLaidY * cosA) / s;
}
