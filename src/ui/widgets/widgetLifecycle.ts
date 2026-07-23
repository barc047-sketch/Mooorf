import type { WidgetId } from "../../types";

export interface WidgetFrameSize {
  width: number;
  height: number;
}

export interface WidgetGrowthSizeInput {
  currentWidth: number;
  currentHeight: number;
  requiredWidth: number;
  requiredHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  minimumWidth: number;
  minimumHeight: number;
  horizontalMargin: number;
  verticalMargin: number;
}

const frameSizeMemory = new Map<WidgetId, WidgetFrameSize>();

/** Session-only floating-window size. It is intentionally module memory:
 * never serialized, never canonical project data, and never history. */
export const rememberWidgetFrameSize = (
  id: WidgetId,
  width: number,
  height: number,
): void => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
  frameSizeMemory.set(id, {
    width: Math.round(width),
    height: Math.round(height),
  });
};

export const getRememberedWidgetFrameSize = (id: WidgetId): WidgetFrameSize | undefined => {
  const remembered = frameSizeMemory.get(id);
  return remembered ? { ...remembered } : undefined;
};

/** Grows a workspace only as far as needed and never beyond the reachable
 * viewport. It never shrinks an authored/user-resized frame. */
export const resolveWidgetGrowthSize = ({
  currentWidth,
  currentHeight,
  requiredWidth,
  requiredHeight,
  viewportWidth,
  viewportHeight,
  minimumWidth,
  minimumHeight,
  horizontalMargin,
  verticalMargin,
}: WidgetGrowthSizeInput): WidgetFrameSize => ({
  width: Math.min(
    Math.max(minimumWidth, viewportWidth - Math.max(0, horizontalMargin)),
    Math.max(currentWidth, requiredWidth, minimumWidth),
  ),
  height: Math.min(
    Math.max(minimumHeight, viewportHeight - Math.max(0, verticalMargin)),
    Math.max(currentHeight, requiredHeight, minimumHeight),
  ),
});

export interface WidgetOpenResolution {
  stack: WidgetId[];
  mounted: boolean;
}

export interface WidgetViewportRect {
  x: number;
  y: number;
  frameWidth: number;
  frameHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  margin: number;
}

export const resolveWidgetOpen = (stack: readonly WidgetId[], id: WidgetId): WidgetOpenResolution => {
  const mounted = !stack.includes(id);
  return {
    stack: mounted ? [...stack, id] : [...stack.filter((candidate) => candidate !== id), id],
    mounted,
  };
};

/** Returns an absolute viewport position with the complete frame visible when
 * it fits, or with its title edge reachable when it is larger than the
 * viewport. This is UI-session geometry only. */
export const clampWidgetOffset = ({
  x,
  y,
  frameWidth,
  frameHeight,
  viewportWidth,
  viewportHeight,
  margin,
}: WidgetViewportRect): { x: number; y: number } => {
  const safeMargin = Math.max(0, margin);
  const maxX = Math.max(safeMargin, viewportWidth - safeMargin - frameWidth);
  const maxY = Math.max(safeMargin, viewportHeight - safeMargin - frameHeight);
  return {
    x: Math.min(Math.max(x, safeMargin), maxX),
    y: Math.min(Math.max(y, safeMargin), maxY),
  };
};
