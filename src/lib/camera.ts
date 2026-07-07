import type { Camera, SpaceCell } from "../types";
import { areaToRadius, clamp } from "./geometry";

export const Z_MIN = 0.25;
export const Z_MAX = 4;

export const DEFAULT_CAMERA: Camera = { x: 0, y: 0, zoom: 1 };

// Camera that frames all cells with editorial padding.
export function fitCamera(
  spaces: SpaceCell[],
  vw: number,
  vh: number,
  pad = 140
): Camera {
  if (spaces.length === 0) return { ...DEFAULT_CAMERA };
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const c of spaces) {
    const r = areaToRadius(c.area);
    minX = Math.min(minX, c.x - r);
    minY = Math.min(minY, c.y - r);
    maxX = Math.max(maxX, c.x + r);
    maxY = Math.max(maxY, c.y + r);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const zoom = clamp(
    Math.min((vw - pad * 2) / Math.max(1, w), (vh - pad * 2) / Math.max(1, h)),
    Z_MIN,
    Z_MAX
  );
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, zoom };
}
