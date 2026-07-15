import type { WidgetId } from "../../types";

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
