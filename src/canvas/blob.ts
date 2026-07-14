// Organism layer: nearby cells cluster into ONE continuous body. Each cluster
// renders a compact-support metaball field (Wyvill kernels) contoured at an
// exact iso-level, with every vertex projected back onto the analytic surface
// and fit with closed Catmull-Rom splines — connection is a consequence of the
// shared membrane, never an explicit bridge. Geometry is cached in world
// space, so pan/zoom only refill the path.

import { contours } from "d3-contour";
import type { AttachMode, MorphMode } from "../types";

export interface BlobBody {
  x: number;
  y: number;
  r: number;
}

export interface BlobLayerAppearance {
  fillColour: string;
  fillOpacity: number;
  edgeVisible: boolean;
  edgeColour: string;
  edgeOpacity: number;
  edgeWidth: number;
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

interface Pt {
  x: number;
  y: number;
}

// Eased per-frame membrane parameters — style/attachment switches melt
// between values instead of snapping.
interface OrganismParams {
  reach: number; // kernel radius multiplier over the padded body radius
  pad: number; // silhouette padding ratio over the cell radius
  pocketCull: number; // pockets smaller than π·(pocketCull·minBody)² are dropped
  fill: [number, number, number];
}

interface OrganismTarget extends OrganismParams {
  gapRatio: number; // clustering: max edge gap / pair average radius (snaps)
}

interface BlobCache {
  key: string;
  path: Path2D | null;
}

const cache: BlobCache = { key: "", path: null };
const anim: { p: OrganismParams | null } = { p: null };

const GRID_BUDGET = 32000; // per-cluster sample cap keeps drag rebuilds cheap

// Attachment presets: how far apart (edge gap / avg radius) nuclei may sit and
// still share one membrane. The slider fine-tunes within safe limits only.
const GAP_BASE: Record<AttachMode, number> = {
  tight: 0.06,
  soft: 0.14,
  long: 0.26,
  extreme: 0.32, // experimental far reach — still bounded by the 0.32 hard cap
};

// Kernel reach over the padded radius. Cellular stays tight so interstitial
// pockets survive; plain runs fatter for a fuller Illustrator-union body.
const REACH_CELLULAR: Record<AttachMode, number> = {
  tight: 1.15,
  soft: 1.19,
  long: 1.28,
  extreme: 1.34,
};
const REACH_PLAIN: Record<AttachMode, number> = {
  tight: 1.26,
  soft: 1.33,
  long: 1.42,
  extreme: 1.5,
};

const FILLS: Record<MorphMode, { day: string; night: string }> = {
  "cellular-reverse": { day: "#070707", night: "#f1efe6" }, // invert-fill logic
  "plain-black": { day: "#050505", night: "#17181b" },
  "plain-white": { day: "#fbfaf3", night: "#f1efe6" },
  graphite: { day: "#242527", night: "#292a2e" },
  wine: { day: "#460a16", night: "#360812" },
  auto: { day: "#070707", night: "#f1efe6" },
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const hexRgb = (hex: string): [number, number, number] => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

function targetOrganism(
  mergeDistance: number,
  morphMode: MorphMode,
  attachMode: AttachMode,
  night: boolean
): OrganismTarget {
  const t = clamp01(mergeDistance / 300);
  const cellular = morphMode === "cellular-reverse";
  const reachBase = (cellular ? REACH_CELLULAR : REACH_PLAIN)[attachMode];
  const fill = FILLS[morphMode];
  return {
    reach: reachBase * (0.97 + t * 0.06),
    pad: cellular ? 0.07 + t * 0.04 : 0.1 + t * 0.05,
    pocketCull: cellular ? 0.2 : 0.55,
    gapRatio: Math.min(0.32, GAP_BASE[attachMode] * (0.6 + t * 0.8)),
    fill: hexRgb(night ? fill.night : fill.day),
  };
}

// Returns true while parameters are still settling (caller keeps painting).
function settle(target: OrganismTarget): boolean {
  if (!anim.p) {
    anim.p = {
      reach: target.reach,
      pad: target.pad,
      pocketCull: target.pocketCull,
      fill: [...target.fill],
    };
    return false;
  }
  const p = anim.p;
  const e = 0.16;
  p.reach += (target.reach - p.reach) * e;
  p.pad += (target.pad - p.pad) * e;
  p.pocketCull += (target.pocketCull - p.pocketCull) * e;
  for (let i = 0; i < 3; i++) p.fill[i] += (target.fill[i] - p.fill[i]) * e;
  const done =
    Math.abs(target.reach - p.reach) < 0.0015 &&
    Math.abs(target.pad - p.pad) < 0.001 &&
    Math.abs(target.pocketCull - p.pocketCull) < 0.004 &&
    Math.abs(target.fill[0] - p.fill[0]) < 0.8 &&
    Math.abs(target.fill[1] - p.fill[1]) < 0.8 &&
    Math.abs(target.fill[2] - p.fill[2]) < 0.8;
  if (done) {
    p.reach = target.reach;
    p.pad = target.pad;
    p.pocketCull = target.pocketCull;
    p.fill = [...target.fill];
  }
  return !done;
}

const signedArea = (ring: Pt[]) => {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
};

// GeoJSON rings repeat the first point; drop it and map grid → world.
function toWorldRing(
  ring: number[][],
  x0: number,
  y0: number,
  h: number
): Pt[] {
  const last = ring.length - 1;
  const closed =
    ring[0][0] === ring[last][0] && ring[0][1] === ring[last][1];
  const end = closed ? last : ring.length;
  const out: Pt[] = [];
  for (let i = 0; i < end; i++) {
    out.push({ x: x0 + (ring[i][0] - 0.5) * h, y: y0 + (ring[i][1] - 0.5) * h });
  }
  return out;
}

function resampleClosed(ring: Pt[], spacing: number): Pt[] {
  const n = ring.length;
  if (n < 3) return [];
  let per = 0;
  for (let i = 0; i < n; i++) {
    const b = ring[(i + 1) % n];
    per += Math.hypot(b.x - ring[i].x, b.y - ring[i].y);
  }
  if (per < spacing * 3) return [];
  const count = Math.max(10, Math.round(per / spacing));
  const step = per / count;
  const out: Pt[] = [];
  let need = 0;
  for (let i = 0; i < n; i++) {
    let ax = ring[i].x;
    let ay = ring[i].y;
    const bx = ring[(i + 1) % n].x;
    const by = ring[(i + 1) % n].y;
    let edge = Math.hypot(bx - ax, by - ay);
    while (need <= edge && out.length < count) {
      const t = edge === 0 ? 0 : need / edge;
      ax += (bx - ax) * t;
      ay += (by - ay) * t;
      out.push({ x: ax, y: ay });
      edge -= need;
      need = step;
    }
    need -= edge;
    if (out.length >= count) break;
  }
  return out;
}

// Closed-loop Laplacian relax — kills marching-square stair steps before the
// vertices are pulled back onto the exact iso-surface.
function smoothClosed(pts: Pt[], passes: number, w: number) {
  const n = pts.length;
  for (let pass = 0; pass < passes; pass++) {
    const px = pts.map((p) => p.x);
    const py = pts.map((p) => p.y);
    for (let i = 0; i < n; i++) {
      const a = (i - 1 + n) % n;
      const b = (i + 1) % n;
      pts[i].x = px[i] * (1 - w) + ((px[a] + px[b]) / 2) * w;
      pts[i].y = py[i] * (1 - w) + ((py[a] + py[b]) / 2) * w;
    }
  }
}

// Newton projection onto F(p)=τ — the field is analytic, so refined vertices
// sit on a perfectly smooth curve regardless of grid resolution.
function projectToIso(
  pts: Pt[],
  bodies: BlobBody[],
  members: number[],
  R: number[],
  tau: number,
  maxStep: number
) {
  for (let pass = 0; pass < 2; pass++) {
    for (const p of pts) {
      let F = -tau;
      let gx = 0;
      let gy = 0;
      for (let m = 0; m < members.length; m++) {
        const c = bodies[members[m]];
        const R2 = R[m] * R[m];
        const dx = p.x - c.x;
        const dy = p.y - c.y;
        const q = (dx * dx + dy * dy) / R2;
        if (q >= 1) continue;
        const u = 1 - q;
        F += u * u;
        const g = (-4 * u) / R2;
        gx += g * dx;
        gy += g * dy;
      }
      const g2 = gx * gx + gy * gy;
      if (g2 < 1e-9) continue;
      let sx = gx * (F / g2);
      let sy = gy * (F / g2);
      const len = Math.hypot(sx, sy);
      if (len > maxStep) {
        sx *= maxStep / len;
        sy *= maxStep / len;
      }
      p.x -= sx;
      p.y -= sy;
    }
  }
}

// Closed Catmull-Rom → cubic Béziers: C1-continuous, no polygonal stiffness.
function emitClosedSpline(path: Path2D, pts: Pt[]) {
  const n = pts.length;
  path.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    path.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y
    );
  }
  path.closePath();
}

// One continuous membrane around a cluster of nuclei. Interior pockets arrive
// naturally as contour holes (nonzero fill cuts them out).
function fieldOutline(
  path: Path2D,
  bodies: BlobBody[],
  body: Float64Array,
  members: number[],
  reach: number,
  pocketCull: number
) {
  const tau = (1 - 1 / (reach * reach)) ** 2;
  const R = members.map((i) => body[i] * reach);

  let minBody = Infinity;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let m = 0; m < members.length; m++) {
    const c = bodies[members[m]];
    minBody = Math.min(minBody, body[members[m]]);
    x0 = Math.min(x0, c.x - R[m]);
    y0 = Math.min(y0, c.y - R[m]);
    x1 = Math.max(x1, c.x + R[m]);
    y1 = Math.max(y1, c.y + R[m]);
  }

  let h = Math.max(2, Math.min(10, minBody / 5));
  x0 -= h * 2;
  y0 -= h * 2;
  x1 += h * 2;
  y1 += h * 2;
  let nx = Math.max(4, Math.ceil((x1 - x0) / h) + 1);
  let ny = Math.max(4, Math.ceil((y1 - y0) / h) + 1);
  if (nx * ny > GRID_BUDGET) {
    h *= Math.sqrt((nx * ny) / GRID_BUDGET);
    nx = Math.max(4, Math.ceil((x1 - x0) / h) + 1);
    ny = Math.max(4, Math.ceil((y1 - y0) / h) + 1);
  }

  const values = new Float64Array(nx * ny);
  for (let m = 0; m < members.length; m++) {
    const c = bodies[members[m]];
    const Rm = R[m];
    const R2 = Rm * Rm;
    const gi0 = Math.max(0, Math.floor((c.x - Rm - x0) / h));
    const gi1 = Math.min(nx - 1, Math.ceil((c.x + Rm - x0) / h));
    const gj0 = Math.max(0, Math.floor((c.y - Rm - y0) / h));
    const gj1 = Math.min(ny - 1, Math.ceil((c.y + Rm - y0) / h));
    for (let gj = gj0; gj <= gj1; gj++) {
      const dy = y0 + gj * h - c.y;
      for (let gi = gi0; gi <= gi1; gi++) {
        const dx = x0 + gi * h - c.x;
        const q = (dx * dx + dy * dy) / R2;
        if (q >= 1) continue;
        const u = 1 - q;
        values[gj * nx + gi] += u * u;
      }
    }
  }

  // Float64Array is array-like enough for d3 at runtime; types want number[].
  const polys = contours()
    .size([nx, ny])
    .thresholds([tau])(values as unknown as number[]);
  if (!polys.length) return;

  const spacing = Math.max(2.5, Math.min(12, h * 1.3));
  const minRing = Math.PI * (0.3 * minBody) ** 2;
  const minPocket = Math.PI * (pocketCull * minBody) ** 2;

  for (const poly of polys[0].coordinates) {
    const kept: Pt[][] = [];
    for (let ri = 0; ri < poly.length; ri++) {
      const ring = toWorldRing(poly[ri], x0, y0, h);
      const area = Math.abs(signedArea(ring));
      if (ri === 0) {
        if (area < minRing) break; // speckle body — drop holes with it
      } else if (area < minPocket) {
        continue;
      }
      kept.push(ring);
    }
    for (const ring of kept) {
      const pts = resampleClosed(ring, spacing);
      if (pts.length < 6) continue;
      smoothClosed(pts, 2, 0.5);
      projectToIso(pts, bodies, members, R, tau, h * 1.6);
      emitClosedSpline(path, pts);
    }
  }
}

function rebuild(
  bodies: BlobBody[],
  reach: number,
  pad: number,
  pocketCull: number,
  gapRatio: number,
  key: string
) {
  cache.key = key;
  const n = bodies.length;
  const path = new Path2D();

  // Union-find clusters — only the attachment threshold decides which nuclei
  // share one membrane, so separate organisms never exchange field energy and
  // a global island cannot form.
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const gap = Math.hypot(b.x - a.x, b.y - a.y) - a.r - b.r;
      if (gap <= ((a.r + b.r) / 2) * gapRatio) parent[find(i)] = find(j);
    }
  }

  // Padded body radii, capped toward the nearest foreign organism so two
  // separate bodies can never visually kiss.
  const body = new Float64Array(n);
  const foreign = new Float64Array(n).fill(Infinity);
  for (let i = 0; i < n; i++) body[i] = bodies[i].r * (1 + pad);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (find(i) === find(j)) continue;
      const a = bodies[i];
      const b = bodies[j];
      const gap = Math.hypot(b.x - a.x, b.y - a.y) - a.r - b.r;
      if (gap < foreign[i]) foreign[i] = gap;
      if (gap < foreign[j]) foreign[j] = gap;
    }
  }
  for (let i = 0; i < n; i++) {
    if (foreign[i] < Infinity) {
      body[i] = Math.min(body[i], bodies[i].r + Math.max(0, foreign[i]) * 0.45);
    }
    body[i] = Math.max(body[i], bodies[i].r * 1.005);
  }

  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const g = groups.get(root);
    if (g) g.push(i);
    else groups.set(root, [i]);
  }

  for (const members of groups.values()) {
    if (members.length === 1) {
      // Lone nucleus: an exact circle is the exact iso-surface.
      const i = members[0];
      path.moveTo(bodies[i].x + body[i], bodies[i].y);
      path.arc(bodies[i].x, bodies[i].y, body[i], 0, Math.PI * 2);
      path.closePath();
    } else {
      fieldOutline(path, bodies, body, members, reach, pocketCull);
    }
  }

  cache.path = path;
}

// Returns true while a style/attachment transition is still settling so the
// caller keeps repainting.
export function drawBlobLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cam: Camera,
  bodies: BlobBody[],
  mergeDistance: number,
  night: boolean,
  morphMode: MorphMode,
  attachMode: AttachMode,
  appearance?: BlobLayerAppearance
): boolean {
  if (bodies.length === 0) return false;

  const target = targetOrganism(mergeDistance, morphMode, attachMode, night);
  const settling = settle(target);
  const p = anim.p!;

  let key = `${p.reach.toFixed(3)}|${p.pad.toFixed(3)}|${p.pocketCull.toFixed(
    2
  )}|${target.gapRatio.toFixed(3)}|`;
  for (const body of bodies) {
    key += `${body.x | 0},${body.y | 0},${body.r | 0};`;
  }
  if (key !== cache.key) {
    rebuild(bodies, p.reach, p.pad, p.pocketCull, target.gapRatio, key);
  }
  if (!cache.path) return settling;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);
  const baseAlpha = ctx.globalAlpha;
  ctx.fillStyle = appearance?.fillColour ?? `rgb(${p.fill[0] | 0}, ${p.fill[1] | 0}, ${p.fill[2] | 0})`;
  ctx.globalAlpha = baseAlpha * (appearance?.fillOpacity ?? 1);
  ctx.fill(cache.path, "nonzero");
  if (appearance?.edgeVisible && appearance.edgeWidth > 0) {
    ctx.strokeStyle = appearance.edgeColour;
    ctx.lineWidth = appearance.edgeWidth;
    ctx.globalAlpha = baseAlpha * appearance.edgeOpacity;
    ctx.stroke(cache.path);
  }
  ctx.restore();
  return settling;
}
