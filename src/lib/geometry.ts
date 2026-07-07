import type { SpaceCell } from "../types";

// Area (m²) → radius (world px). Sqrt scale keeps big programs readable.
export const areaToRadius = (area: number) =>
  Math.min(96, Math.max(18, 4.2 * Math.sqrt(Math.max(1, area))));

// Curated-feeling scatter: golden-angle spiral + deterministic jitter.
export const scatterPoint = (i: number) => {
  const a = i * 2.39996;
  const r = 110 * Math.sqrt(i + 0.6);
  const jx = Math.sin(i * 12.9898) * 34;
  const jy = Math.cos(i * 78.233) * 30;
  return { x: Math.cos(a) * r + jx, y: Math.sin(a) * r * 0.74 + jy };
};

// Topmost cell under a world point (last drawn wins).
export const hitTest = (spaces: SpaceCell[], x: number, y: number) => {
  for (let i = spaces.length - 1; i >= 0; i--) {
    const c = spaces[i];
    const r = areaToRadius(c.area);
    const dx = x - c.x;
    const dy = y - c.y;
    if (dx * dx + dy * dy <= r * r) return c;
  }
  return null;
};

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
