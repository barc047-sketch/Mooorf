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

export interface ConnectionPort {
  id: string;
  spaceId: string;
  x: number;
  y: number;
  state: "idle" | "source" | "valid-target" | "invalid-target";
}

export interface ConnectionPortCandidate {
  id: string;
  spaceId: string;
  x: number;
  y: number;
  visible: boolean;
  inVisibleSubset: boolean;
  kind?: string;
  locked?: boolean;
  hidden?: boolean;
  deleted?: boolean;
}

export type ConnectionReleaseDecision =
  | { kind: "commit"; targetId: string }
  | { kind: "invalid"; targetId: string }
  | { kind: "keep-source" }
  | { kind: "cancel" };

export type ConnectionPressIntent = "connection" | "canvas";

export const CONNECTION_PORT_VISIBLE_RADIUS_PX = 3;
export const CONNECTION_PORT_HIT_RADIUS_PX = 10;
export const CONNECTION_AUTO_PAN_EDGE_PX = 48;
export const CONNECTION_AUTO_PAN_MAX_PX = 14;

export function deriveConnectionPorts(
  candidates: readonly ConnectionPortCandidate[],
  sourceId: string | null = null,
  targetId: string | null = null,
  targetValid = true,
): ConnectionPort[] {
  return candidates.flatMap((candidate) => {
    if (
      !candidate.inVisibleSubset
      || !isValidConnectionEndpoint(candidate)
      || !Number.isFinite(candidate.x)
      || !Number.isFinite(candidate.y)
    ) return [];
    const state: ConnectionPort["state"] = candidate.spaceId === sourceId
      ? "source"
      : candidate.spaceId === targetId
        ? targetValid ? "valid-target" : "invalid-target"
        : "idle";
    return [{
      id: candidate.id,
      spaceId: candidate.spaceId,
      x: candidate.x,
      y: candidate.y,
      state,
    }];
  });
}

export function hitConnectionPort(
  ports: readonly ConnectionPort[],
  point: ScreenPoint,
  radiusPx = CONNECTION_PORT_HIT_RADIUS_PX,
): ConnectionPort | null {
  const radius = Math.max(0, radiusPx);
  return ports
    .flatMap((port) => {
      const dx = port.x - point.x;
      const dy = port.y - point.y;
      const distanceSquared = dx * dx + dy * dy;
      return distanceSquared <= radius * radius ? [{ port, distanceSquared }] : [];
    })
    .sort((left, right) => left.distanceSquared - right.distanceSquared || left.port.id.localeCompare(right.port.id))[0]
    ?.port ?? null;
}

const edgeVelocity = (distance: number): number => {
  if (distance >= CONNECTION_AUTO_PAN_EDGE_PX) return 0;
  const progress = Math.min(1, Math.max(0, 1 - distance / CONNECTION_AUTO_PAN_EDGE_PX));
  return CONNECTION_AUTO_PAN_MAX_PX * progress * progress;
};

export function resolveConnectionAutoPan(point: ScreenPoint, viewport: ViewportRect): ScreenVector {
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
  hasPort: boolean;
  sourceId: string | null;
  temporaryPan: boolean;
}): ConnectionPressIntent {
  if (!input.modeActive || !input.layerVisible || input.temporaryPan) return "canvas";
  return input.hasPort || Boolean(input.sourceId) ? "connection" : "canvas";
}

export function resolveConnectionRelease(input: {
  sourceId: string | null;
  port: ConnectionPort | null;
  nucleusId: string | null;
  moved: boolean;
}): ConnectionReleaseDecision {
  if (!input.sourceId) return { kind: "cancel" };
  if (input.port && input.port.spaceId !== input.sourceId) {
    return { kind: "commit", targetId: input.port.spaceId };
  }
  if (input.port?.spaceId === input.sourceId && !input.moved) return { kind: "keep-source" };
  if (input.nucleusId) return { kind: "invalid", targetId: input.nucleusId };
  return { kind: "cancel" };
}
import { isValidConnectionEndpoint } from "../../domain/connections/model";
