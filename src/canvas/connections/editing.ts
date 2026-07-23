export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ScreenVector {
  dx: number;
  dy: number;
}

export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ConnectionReleaseDecision =
  | { kind: "commit"; targetId: string }
  | { kind: "invalid"; targetId: string }
  | { kind: "keep-source" }
  | { kind: "cancel" };

export type ConnectionPressIntent = "connection" | "canvas";

export const CONNECTION_AUTO_PAN_EDGE_PX = 48;
export const CONNECTION_AUTO_PAN_MAX_PX = 14;

const edgeVelocity = (distance: number): number => {
  if (distance >= CONNECTION_AUTO_PAN_EDGE_PX) return 0;
  const progress = Math.min(1, Math.max(0, 1 - distance / CONNECTION_AUTO_PAN_EDGE_PX));
  return CONNECTION_AUTO_PAN_MAX_PX * progress * progress;
};

export function resolveConnectionAutoPan(
  point: ScreenPoint,
  viewport: ViewportRect,
  enabled = true,
): ScreenVector {
  if (!enabled) return { dx: 0, dy: 0 };
  const right = viewport.x + Math.max(0, viewport.width);
  const bottom = viewport.y + Math.max(0, viewport.height);
  const leftVelocity = edgeVelocity(point.x - viewport.x);
  const rightVelocity = edgeVelocity(right - point.x);
  const topVelocity = edgeVelocity(point.y - viewport.y);
  const bottomVelocity = edgeVelocity(bottom - point.y);
  return {
    dx: rightVelocity - leftVelocity,
    dy: bottomVelocity - topVelocity,
  };
}

export function resolveConnectionAutoPanDelta(
  vector: ScreenVector,
  elapsedSeconds: number,
  zoom: number,
): ScreenVector {
  const frameScale = Math.min(Math.max(elapsedSeconds, 0), .05) * 60 / Math.max(zoom, .001);
  return { dx: vector.dx * frameScale, dy: vector.dy * frameScale };
}

export function resolveConnectionPressIntent(input: {
  modeActive: boolean;
  layerVisible: boolean;
  hasCell: boolean;
  sourceId: string | null;
  temporaryPan: boolean;
}): ConnectionPressIntent {
  if (!input.modeActive || !input.layerVisible || input.temporaryPan) return "canvas";
  return input.hasCell || Boolean(input.sourceId) ? "connection" : "canvas";
}

export function resolveConnectionRelease(input: {
  sourceId: string | null;
  nucleusId: string | null;
  targetValid: boolean;
  moved: boolean;
}): ConnectionReleaseDecision {
  if (!input.sourceId) return { kind: "cancel" };
  if (input.nucleusId && input.nucleusId !== input.sourceId && input.targetValid) {
    return { kind: "commit", targetId: input.nucleusId };
  }
  if (input.nucleusId === input.sourceId && !input.moved) return { kind: "keep-source" };
  if (input.nucleusId) return { kind: "invalid", targetId: input.nucleusId };
  return { kind: "cancel" };
}
