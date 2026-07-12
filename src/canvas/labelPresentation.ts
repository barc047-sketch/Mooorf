import type { Camera, LabelScaleMode } from "../types";

export interface CanvasViewport {
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Shared live/export label-scale contract. Interface Scale remains chrome-only;
 * the existing annotation text scale is the authored label multiplier. */
export const resolveLabelScale = (mode: LabelScaleMode, zoom: number, authoredScale = 1): number => {
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const safeAuthored = Number.isFinite(authoredScale) && authoredScale > 0 ? authoredScale : 1;
  if (mode === "world") return safeAuthored * safeZoom;
  if (mode === "adaptive") return safeAuthored * clamp(Math.sqrt(safeZoom), 0.82, 1.22);
  return safeAuthored;
};

export const projectCanvasPoint = (
  point: { x: number; y: number },
  camera: Camera,
  viewport: CanvasViewport
): { x: number; y: number } => ({
  x: (point.x - camera.x) * camera.zoom + viewport.width / 2,
  y: (point.y - camera.y) * camera.zoom + viewport.height / 2,
});

export const projectClientPoint = (
  screenPoint: { x: number; y: number },
  bounds: Pick<DOMRect, "left" | "top">
): { x: number; y: number } => ({
  x: bounds.left + screenPoint.x,
  y: bounds.top + screenPoint.y,
});
