import type { Connection, ConnectionAnchorId } from "../../domain/graph/types";
import type { ResolvedConnectionStyle } from "../../domain/connections/styles";

export interface ConnectionPoint {
  x: number;
  y: number;
}

export interface ConnectionEndpointGeometry extends ConnectionPoint {
  id: string;
  radius: number;
}

export interface ConnectionPath {
  kind: "line" | "polyline" | "bezier";
  points: ConnectionPoint[];
}

export interface ConnectionPathBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConnectionLane {
  pairKey: string;
  pairIndex: number;
  pairCount: number;
  laneOffset: number;
}

const EPSILON = 1e-9;
const LANE_GAP_PX = 8;

const finiteRadius = (endpoint: ConnectionEndpointGeometry): number =>
  Number.isFinite(endpoint.radius) ? Math.max(0, endpoint.radius) : 0;

/**
 * Conservative cheap rejection before path/style/cache work. The maximum
 * curve bow is just under half the endpoint distance; lane and Cell margins
 * keep every crossing or potentially entering path eligible for exact culling.
 */
export const connectionEndpointsMayIntersectViewport = (
  source: ConnectionEndpointGeometry,
  target: ConnectionEndpointGeometry,
  laneOffset: number,
  viewport: ConnectionPathBounds,
): boolean => {
  const distance = Math.hypot(target.x - source.x, target.y - source.y);
  const margin = Math.max(finiteRadius(source), finiteRadius(target))
    + Math.abs(Number.isFinite(laneOffset) ? laneOffset : 0)
    + distance * 0.5
    + 16;
  const minX = Math.min(source.x, target.x) - margin;
  const maxX = Math.max(source.x, target.x) + margin;
  const minY = Math.min(source.y, target.y) - margin;
  const maxY = Math.max(source.y, target.y) + margin;
  return minX <= viewport.x + Math.max(0, viewport.width)
    && maxX >= viewport.x
    && minY <= viewport.y + Math.max(0, viewport.height)
    && maxY >= viewport.y;
};

const unitDirection = (from: ConnectionPoint, to: ConnectionPoint): ConnectionPoint => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  return length > EPSILON ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
};

export const resolveBoundaryAnchor = (
  endpoint: ConnectionEndpointGeometry,
  opposite: ConnectionPoint,
  anchorId: ConnectionAnchorId,
): ConnectionPoint => {
  const radius = finiteRadius(endpoint);
  if (anchorId === "top") return { x: endpoint.x, y: endpoint.y - radius };
  if (anchorId === "right") return { x: endpoint.x + radius, y: endpoint.y };
  if (anchorId === "bottom") return { x: endpoint.x, y: endpoint.y + radius };
  if (anchorId === "left") return { x: endpoint.x - radius, y: endpoint.y };
  const direction = unitDirection(endpoint, opposite);
  return {
    x: endpoint.x + direction.x * radius,
    y: endpoint.y + direction.y * radius,
  };
};

const pairKeyFor = (connection: Connection): string =>
  [connection.fromSpaceId, connection.toSpaceId].sort((left, right) => left.localeCompare(right)).join("\u0000");

export const resolveConnectionLanes = (
  connections: readonly Connection[],
): Map<string, ConnectionLane> => {
  const pairs = new Map<string, Connection[]>();
  for (const connection of connections) {
    const key = pairKeyFor(connection);
    const siblings = pairs.get(key);
    if (siblings) siblings.push(connection);
    else pairs.set(key, [connection]);
  }
  const lanes = new Map<string, ConnectionLane>();
  for (const [pairKey, siblings] of pairs) {
    const ordered = [...siblings].sort((left, right) => left.id.localeCompare(right.id));
    const center = (ordered.length - 1) / 2;
    ordered.forEach((connection, pairIndex) => {
      lanes.set(connection.id, {
        pairKey,
        pairIndex,
        pairCount: ordered.length,
        laneOffset: (pairIndex - center) * LANE_GAP_PX,
      });
    });
  }
  return lanes;
};

const laneShift = (
  source: ConnectionEndpointGeometry,
  target: ConnectionEndpointGeometry,
  laneOffset: number,
): ConnectionPoint => {
  const direction = source.id.localeCompare(target.id) <= 0
    ? unitDirection(source, target)
    : unitDirection(target, source);
  return { x: -direction.y * laneOffset, y: direction.x * laneOffset };
};

const resolveLaneBoundaryAnchor = (
  endpoint: ConnectionEndpointGeometry,
  opposite: ConnectionEndpointGeometry,
  anchorId: ConnectionAnchorId,
  shift: ConnectionPoint,
): ConnectionPoint => {
  if (anchorId !== "auto" && ["top", "right", "bottom", "left"].includes(anchorId)) {
    return resolveBoundaryAnchor(endpoint, opposite, anchorId);
  }
  const radius = finiteRadius(endpoint);
  const shiftLength = Math.hypot(shift.x, shift.y);
  const maximumShift = radius * 0.92;
  const boundedShiftLength = shiftLength <= maximumShift
    ? shiftLength
    : maximumShift + (radius - maximumShift) * (1 - Math.exp(-(shiftLength - maximumShift) / Math.max(radius, 1)));
  const factor = shiftLength > EPSILON ? boundedShiftLength / shiftLength : 1;
  const clippedShift = { x: shift.x * factor, y: shift.y * factor };
  const toward = unitDirection(endpoint, opposite);
  const radialLength = Math.sqrt(Math.max(0, radius * radius - Math.hypot(clippedShift.x, clippedShift.y) ** 2));
  return {
    x: endpoint.x + clippedShift.x + toward.x * radialLength,
    y: endpoint.y + clippedShift.y + toward.y * radialLength,
  };
};

export const buildConnectionPath = (
  source: ConnectionEndpointGeometry,
  target: ConnectionEndpointGeometry,
  style: ResolvedConnectionStyle,
  laneOffset: number,
): ConnectionPath => {
  const shift = laneShift(source, target, laneOffset);
  const start = resolveLaneBoundaryAnchor(source, target, style.startAnchorId, shift);
  const end = resolveLaneBoundaryAnchor(target, source, style.endAnchorId, shift);
  const authoredDirection = unitDirection(source, target);
  const centerDistance = Math.hypot(target.x - source.x, target.y - source.y);
  const fanDistance = Math.min(centerDistance / 3, Math.max(finiteRadius(source), finiteRadius(target)) + 12);
  const bodyStart = {
    x: source.x + shift.x + authoredDirection.x * fanDistance,
    y: source.y + shift.y + authoredDirection.y * fanDistance,
  };
  const bodyEnd = {
    x: target.x + shift.x - authoredDirection.x * fanDistance,
    y: target.y + shift.y - authoredDirection.y * fanDistance,
  };

  if (style.geometryId === "curved") {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const bend = Math.max(-2, Math.min(2, style.appearance.curve));
    const normal = unitDirection({ x: 0, y: 0 }, { x: -dy, y: dx });
    const bow = Math.hypot(dx, dy) * bend * 0.24;
    return {
      kind: "bezier",
      points: [
        start,
        { x: start.x + dx / 3 + normal.x * bow + shift.x * .7, y: start.y + dy / 3 + normal.y * bow + shift.y * .7 },
        { x: start.x + dx * 2 / 3 + normal.x * bow + shift.x * .7, y: start.y + dy * 2 / 3 + normal.y * bow + shift.y * .7 },
        end,
      ],
    };
  }
  if (style.geometryId === "orthogonal") {
    const middleX = (bodyStart.x + bodyEnd.x) / 2;
    return {
      kind: "polyline",
      points: [start, bodyStart, { x: middleX, y: bodyStart.y }, { x: middleX, y: bodyEnd.y }, bodyEnd, end],
    };
  }
  if (style.geometryId === "elbow") {
    return {
      kind: "polyline",
      points: [start, bodyStart, { x: bodyEnd.x, y: bodyStart.y }, bodyEnd, end],
    };
  }
  return Math.abs(laneOffset) > EPSILON
    ? { kind: "line", points: [start, bodyStart, bodyEnd, end] }
    : { kind: "line", points: [start, end] };
};

export const connectionPathBounds = (path: ConnectionPath): ConnectionPathBounds => {
  if (!path.points.length) return { x: 0, y: 0, width: 0, height: 0 };
  const xs = path.points.map((point) => point.x);
  const ys = path.points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

export const expandConnectionPathBounds = (
  bounds: ConnectionPathBounds,
  padding: number,
): ConnectionPathBounds => {
  const extent = Number.isFinite(padding) ? Math.max(0, padding) : 0;
  return {
    x: bounds.x - extent,
    y: bounds.y - extent,
    width: bounds.width + extent * 2,
    height: bounds.height + extent * 2,
  };
};

export const connectionBoundsIntersectViewport = (
  bounds: ConnectionPathBounds,
  viewport: ConnectionPathBounds,
): boolean => bounds.x <= viewport.x + Math.max(0, viewport.width)
  && bounds.x + Math.max(0, bounds.width) >= viewport.x
  && bounds.y <= viewport.y + Math.max(0, viewport.height)
  && bounds.y + Math.max(0, bounds.height) >= viewport.y;

export const pathIntersectsViewport = (
  path: ConnectionPath,
  viewport: ConnectionPathBounds,
): boolean => connectionBoundsIntersectViewport(connectionPathBounds(path), viewport);

const pointToSegmentDistance = (
  point: ConnectionPoint,
  start: ConnectionPoint,
  end: ConnectionPoint,
): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const denominator = dx * dx + dy * dy;
  if (denominator <= EPSILON) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / denominator));
  return Math.hypot(point.x - (start.x + dx * t), point.y - (start.y + dy * t));
};

const bezierPoint = (points: readonly ConnectionPoint[], t: number): ConnectionPoint => {
  const [start, controlA, controlB, end] = points;
  if (!start || !controlA || !controlB || !end) return start ?? { x: 0, y: 0 };
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * start.x + 3 * inverse ** 2 * t * controlA.x + 3 * inverse * t ** 2 * controlB.x + t ** 3 * end.x,
    y: inverse ** 3 * start.y + 3 * inverse ** 2 * t * controlA.y + 3 * inverse * t ** 2 * controlB.y + t ** 3 * end.y,
  };
};

export const distanceToConnectionPath = (
  point: ConnectionPoint,
  path: ConnectionPath,
): number => {
  const sampled = path.kind === "bezier"
    ? Array.from({ length: 25 }, (_, index) => bezierPoint(path.points, index / 24))
    : path.points;
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 1; index < sampled.length; index += 1) {
    distance = Math.min(distance, pointToSegmentDistance(point, sampled[index - 1]!, sampled[index]!));
  }
  return distance;
};
