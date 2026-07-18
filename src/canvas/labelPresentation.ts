import type { Camera, LabelScaleMode } from "../types";
import { resolveLabelRuntimeScale } from "../domain/labels/resolveLayout";

export interface CanvasViewport {
  width: number;
  height: number;
}

/** Shared live/export label-scale contract. Interface Scale remains chrome-only;
 * the existing annotation text scale is the authored label multiplier. The
 * formula itself is owned by the domain label resolver. */
export const resolveLabelScale = (mode: LabelScaleMode, zoom: number, authoredScale = 1): number => {
  const safeAuthored = Number.isFinite(authoredScale) && authoredScale > 0 ? authoredScale : 1;
  return safeAuthored * resolveLabelRuntimeScale(mode, zoom);
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
