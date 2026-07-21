import type { Connection } from "../../domain/graph/types";
import {
  filterConnections,
  type ConnectionFilterCell,
  type ConnectionFilterSpec,
} from "../../domain/connections/filters";
import {
  cloneResolvedConnectionStyle,
  resolveConnectionStyle,
  type ConnectionFocusMode,
  type ProjectConnectionStyles,
  type ResolvedConnectionStyle,
} from "../../domain/connections/styles";
import {
  buildConnectionPath,
  connectionBoundsIntersectViewport,
  connectionEndpointsMayIntersectViewport,
  connectionPathBounds,
  distanceToConnectionPath,
  expandConnectionPathBounds,
  resolveConnectionLanes,
  type ConnectionEndpointGeometry,
  type ConnectionLane,
  type ConnectionPath,
  type ConnectionPathBounds,
  type ConnectionPoint,
} from "./geometry";
import type { ConnectionDrawWork, ConnectionProjectionMetrics } from "./instrumentation";

export type ConnectionLod = "full" | "dense" | "critical";
export type ConnectionEmphasis = "normal" | "focused" | "related" | "faded";

/** Presentation-only focus hierarchy. Contextual lines stay readable rather
 * than inheriting a compounding fade from their authored appearance opacity. */
export const CONNECTION_FOCUS_OPACITY = {
  focused: 1,
  related: 0.76,
  contextual: 0.44,
} as const;

/** Half-width of the practical 12 px screen-space line hit corridor. */
export const CONNECTION_HIT_TOLERANCE_PX = 6;

/**
 * One frame never projects, draws, or hit-indexes more than this retained
 * screen-space subset. Selection and selected-Cell context win the budget;
 * authored records remain untouched in the canonical store.
 */
export const MAX_VISIBLE_CONNECTION_COMMANDS = 1_024;

/**
 * Exact path attempts may refill commands rejected by expanded-bounds culling,
 * but remain capped independently of the authored collection.
 */
export const MAX_CONNECTION_PROJECTION_ATTEMPTS = 2_048;

export interface ConnectionDrawCommand {
  id: string;
  fromSpaceId: string;
  toSpaceId: string;
  path: ConnectionPath;
  bounds: ConnectionPathBounds;
  style: ResolvedConnectionStyle;
  lane: ConnectionLane;
  selected: boolean;
  emphasis: ConnectionEmphasis;
  labelText: string | null;
}

export interface ConnectionHitEntry {
  id: string;
  path: ConnectionPath;
  bounds: ConnectionPathBounds;
  selected: boolean;
  drawOrder: number;
}

export interface ConnectionHitIndex {
  readonly entries: readonly ConnectionHitEntry[];
}

export interface ConnectionProjectionInput {
  connections: readonly Connection[];
  authoredCount?: number;
  endpoints: ReadonlyMap<string, ConnectionEndpointGeometry>;
  styles: ProjectConnectionStyles;
  filter: ConnectionFilterSpec;
  cellsById?: ReadonlyMap<string, ConnectionFilterCell>;
  viewport: ConnectionPathBounds;
  selectedIds: ReadonlySet<string>;
  changedEndpointIds: ReadonlySet<string>;
  lod: ConnectionLod;
  focusMode: ConnectionFocusMode;
}

export interface ConnectionProjectionResult {
  commands: ConnectionDrawCommand[];
  hitIndex: ConnectionHitIndex;
  metrics: ConnectionProjectionMetrics;
}

interface CachedPath {
  key: string;
  connectionId: string;
  fromSpaceId: string;
  toSpaceId: string;
  path: ConnectionPath;
  bounds: ConnectionPathBounds;
  style: ResolvedConnectionStyle;
  lane: ConnectionLane;
}

export interface ConnectionPathCache {
  readonly size: number;
  get(key: string): CachedPath | undefined;
  set(entry: CachedPath): void;
  invalidateEndpoints(endpointIds: ReadonlySet<string>): number;
  clear(): void;
}

const DEFAULT_CACHE_LIMIT = 2_048;

export const createConnectionPathCache = (
  maximumEntries = DEFAULT_CACHE_LIMIT,
): ConnectionPathCache => {
  const limit = Math.max(1, Math.floor(maximumEntries));
  const entries = new Map<string, CachedPath>();
  const keysByEndpoint = new Map<string, Set<string>>();

  const detach = (key: string, entry: CachedPath) => {
    entries.delete(key);
    for (const endpointId of [entry.fromSpaceId, entry.toSpaceId]) {
      const keys = keysByEndpoint.get(endpointId);
      keys?.delete(key);
      if (!keys?.size) keysByEndpoint.delete(endpointId);
    }
  };

  return {
    get size() {
      return entries.size;
    },
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      entries.delete(key);
      entries.set(key, entry);
      return entry;
    },
    set(entry) {
      const previous = entries.get(entry.key);
      if (previous) detach(entry.key, previous);
      entries.set(entry.key, entry);
      for (const endpointId of [entry.fromSpaceId, entry.toSpaceId]) {
        const keys = keysByEndpoint.get(endpointId) ?? new Set<string>();
        keys.add(entry.key);
        keysByEndpoint.set(endpointId, keys);
      }
      while (entries.size > limit) {
        const oldestKey = entries.keys().next().value as string | undefined;
        if (!oldestKey) break;
        const oldest = entries.get(oldestKey);
        if (oldest) detach(oldestKey, oldest);
      }
    },
    invalidateEndpoints(endpointIds) {
      const keys = new Set<string>();
      for (const endpointId of endpointIds) {
        for (const key of keysByEndpoint.get(endpointId) ?? []) keys.add(key);
      }
      const connectionIds = new Set<string>();
      for (const key of keys) {
        const entry = entries.get(key);
        if (!entry) continue;
        connectionIds.add(entry.connectionId);
        detach(key, entry);
      }
      return connectionIds.size;
    },
    clear() {
      entries.clear();
      keysByEndpoint.clear();
    },
  };
};

const cacheKey = (
  connection: Connection,
  style: ResolvedConnectionStyle,
  source: ConnectionEndpointGeometry,
  target: ConnectionEndpointGeometry,
  lane: ConnectionLane,
  viewport: ConnectionPathBounds,
  lod: ConnectionLod,
): string => JSON.stringify([
  connection.id,
  connection.fromSpaceId,
  connection.toSpaceId,
  style,
  [source.x, source.y, source.radius],
  [target.x, target.y, target.radius],
  [lane.pairKey, lane.pairIndex, lane.pairCount, lane.laneOffset],
  [viewport.x, viewport.y, viewport.width, viewport.height],
  lod,
]);

const resolvedForLod = (
  connection: Connection,
  styles: ProjectConnectionStyles,
  lod: ConnectionLod,
): ResolvedConnectionStyle => {
  const style = resolveConnectionStyle(connection, styles);
  if (lod !== "critical") return style;
  const degraded = cloneResolvedConnectionStyle(style);
  if (degraded.strokePatternId === "double" || degraded.strokePatternId === "segmented-bars") {
    degraded.strokePatternId = "solid";
  }
  degraded.label.content = "hidden";
  return degraded;
};

const defaultCells = (
  endpoints: ReadonlyMap<string, ConnectionEndpointGeometry>,
): ReadonlyMap<string, ConnectionFilterCell> => new Map(
  [...endpoints].map(([id]) => [id, { id, name: id }]),
);

const projectionFilter = (
  input: ConnectionProjectionInput,
): ConnectionFilterSpec => input.focusMode === "selected-cell"
  ? { ...input.filter, selectedCellIds: [] }
  : input.filter;

const emphasisFor = (
  connection: Connection,
  input: ConnectionProjectionInput,
  selectedEndpointIds: ReadonlySet<string>,
): ConnectionEmphasis => {
  if (input.selectedIds.size) {
    if (input.selectedIds.has(connection.id)) return "focused";
    return selectedEndpointIds.has(connection.fromSpaceId) || selectedEndpointIds.has(connection.toSpaceId)
      ? "related"
      : "faded";
  }
  if (input.focusMode === "selected-cell" && input.filter.selectedCellIds.length) {
    const selectedCells = new Set(input.filter.selectedCellIds);
    return selectedCells.has(connection.fromSpaceId) || selectedCells.has(connection.toSpaceId)
      ? "focused"
      : "faded";
  }
  if (input.focusMode === "selected-connections") return "faded";
  return "normal";
};

export const projectConnections = (
  input: ConnectionProjectionInput,
  cache: ConnectionPathCache,
): ConnectionProjectionResult => {
  const metrics: ConnectionProjectionMetrics = {
    authoredCount: input.authoredCount ?? input.connections.length,
    eligibleCount: 0,
    visibleCount: 0,
    anchorResolutions: 0,
    pathResolutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
    endpointInvalidations: cache.invalidateEndpoints(input.changedEndpointIds),
    hitIndexEntries: 0,
    labelLayouts: 0,
  };
  const filtered = filterConnections({
    connections: input.connections,
    cellsById: input.cellsById ?? defaultCells(input.endpoints),
    spec: projectionFilter(input),
  });
  const selectedCells = new Set(input.filter.selectedCellIds);
  const selectedEndpointIds = new Set(
    input.connections
      .filter((connection) => input.selectedIds.has(connection.id))
      .flatMap((connection) => [connection.fromSpaceId, connection.toSpaceId]),
  );
  const drawable: Array<{
    connection: Connection;
    source: ConnectionEndpointGeometry;
    target: ConnectionEndpointGeometry;
    style: ResolvedConnectionStyle;
  }> = [];
  for (const connection of filtered) {
    if (!connection.enabled) continue;
    const source = input.endpoints.get(connection.fromSpaceId);
    const target = input.endpoints.get(connection.toSpaceId);
    if (!source || !target) continue;
    const style = resolvedForLod(connection, input.styles, input.lod);
    if (!style.visible) continue;
    drawable.push({ connection, source, target, style });
  }

  // Lanes derive from the full drawable projection, never the selected/focused
  // budget subset, so transient focus cannot recenter unchanged siblings.
  const lanes = resolveConnectionLanes(drawable.map(({ connection }) => connection));
  const candidates = drawable
    .map((candidate) => ({ ...candidate, lane: lanes.get(candidate.connection.id) }))
    .filter((candidate): candidate is typeof candidate & { lane: ConnectionLane } => Boolean(candidate.lane))
    .filter(({ source, target, lane }) => connectionEndpointsMayIntersectViewport(
      source,
      target,
      lane.laneOffset,
      input.viewport,
    ))
    .sort((left, right) => {
      const priorityFor = (connection: Connection): number => {
        if (input.selectedIds.has(connection.id)) return 0;
        if (selectedCells.has(connection.fromSpaceId) || selectedCells.has(connection.toSpaceId)) return 1;
        return 2;
      };
      return priorityFor(left.connection) - priorityFor(right.connection)
        || left.connection.id.localeCompare(right.connection.id);
    });
  const commands: ConnectionDrawCommand[] = [];
  let projectionAttempts = 0;

  for (const { connection, source, target, style, lane } of candidates) {
    if (
      commands.length >= MAX_VISIBLE_CONNECTION_COMMANDS
      || projectionAttempts >= MAX_CONNECTION_PROJECTION_ATTEMPTS
    ) break;
    projectionAttempts += 1;
    metrics.eligibleCount += 1;
    const key = cacheKey(connection, style, source, target, lane, input.viewport, input.lod);
    let cached = cache.get(key);
    if (cached) {
      metrics.cacheHits += 1;
    } else {
      const path = buildConnectionPath(source, target, style, lane.laneOffset);
      const renderExtent = Math.max(
        CONNECTION_HIT_TOLERANCE_PX,
        style.appearance.width / 2 + 2,
        style.appearance.markerSize * 1.5 + Math.abs(style.appearance.markerOffset),
      ) + 2;
      cached = {
        key,
        connectionId: connection.id,
        fromSpaceId: connection.fromSpaceId,
        toSpaceId: connection.toSpaceId,
        path,
        bounds: expandConnectionPathBounds(connectionPathBounds(path), renderExtent),
        style,
        lane,
      };
      cache.set(cached);
      metrics.cacheMisses += 1;
      metrics.anchorResolutions += 2;
      metrics.pathResolutions += 1;
    }
    if (!connectionBoundsIntersectViewport(cached.bounds, input.viewport)) continue;
    const selected = input.selectedIds.has(connection.id);
    commands.push({
      id: connection.id,
      fromSpaceId: connection.fromSpaceId,
      toSpaceId: connection.toSpaceId,
      path: cached.path,
      bounds: cached.bounds,
      style: cached.style,
      lane: cached.lane,
      selected,
      emphasis: emphasisFor(connection, input, selectedEndpointIds),
      labelText: null,
    });
  }
  commands.sort((left, right) => Number(left.selected) - Number(right.selected) || left.id.localeCompare(right.id));
  const entries = commands.map<ConnectionHitEntry>((command, drawOrder) => ({
    id: command.id,
    path: command.path,
    bounds: command.bounds,
    selected: command.selected,
    drawOrder,
  }));
  metrics.visibleCount = commands.length;
  metrics.hitIndexEntries = entries.length;
  return { commands, hitIndex: { entries }, metrics };
};

export const hitTestConnections = (
  index: ConnectionHitIndex,
  point: ConnectionPoint,
  tolerancePx: number,
): string | null => {
  let winner: { id: string; distance: number; drawOrder: number } | null = null;
  const tolerance = Math.max(0, tolerancePx);
  for (const entry of index.entries) {
    if (
      point.x < entry.bounds.x - tolerance
      || point.x > entry.bounds.x + entry.bounds.width + tolerance
      || point.y < entry.bounds.y - tolerance
      || point.y > entry.bounds.y + entry.bounds.height + tolerance
    ) continue;
    const distance = distanceToConnectionPath(point, entry.path);
    if (distance > tolerance) continue;
    if (!winner || distance < winner.distance - 1e-6 || (
      Math.abs(distance - winner.distance) <= 1e-6 && entry.drawOrder > winner.drawOrder
    )) winner = { id: entry.id, distance, drawOrder: entry.drawOrder };
  }
  return winner?.id ?? null;
};

export interface ConnectionDrawOptions {
  theme: "day" | "night" | string;
  scale: number;
  fadeUnrelated: boolean;
  drawLabels: boolean;
  markerDetail: "full" | "simple" | "hidden";
  patternFallback: boolean;
}

const dashFor = (style: ResolvedConnectionStyle, patternFallback: boolean): number[] => {
  if (patternFallback) return [];
  const scale = style.appearance.dashScale;
  if (style.strokePatternId === "dashed") return [8 * scale, 6 * scale];
  if (style.strokePatternId === "dotted") return [1 * scale, 5 * scale];
  if (style.strokePatternId === "dash-dot") return [8 * scale, 4 * scale, 1 * scale, 4 * scale];
  if (style.strokePatternId === "segmented-bars") return [12 * scale, 3 * scale];
  return [];
};

const tracePath = (context: CanvasRenderingContext2D, path: ConnectionPath) => {
  const start = path.points[0];
  if (!start) return;
  context.beginPath();
  context.moveTo(start.x, start.y);
  if (path.kind === "bezier" && path.points.length >= 4) {
    context.bezierCurveTo(
      path.points[1]!.x,
      path.points[1]!.y,
      path.points[2]!.x,
      path.points[2]!.y,
      path.points[3]!.x,
      path.points[3]!.y,
    );
    return;
  }
  for (let index = 1; index < path.points.length; index += 1) {
    context.lineTo(path.points[index]!.x, path.points[index]!.y);
  }
};

const drawMarker = (
  context: CanvasRenderingContext2D,
  markerId: string,
  point: ConnectionPoint,
  previous: ConnectionPoint,
  size: number,
  offset: number,
  color: string,
): Pick<ConnectionDrawWork, "strokeCalls" | "fillCalls" | "markerCalls"> => {
  if (markerId === "none") return { strokeCalls: 0, fillCalls: 0, markerCalls: 0 };
  const angle = Math.atan2(point.y - previous.y, point.x - previous.x);
  context.save();
  context.translate(point.x + Math.cos(angle) * offset, point.y + Math.sin(angle) * offset);
  context.rotate(angle);
  context.beginPath();
  let fill = false;
  if (markerId === "circle" || markerId === "filled-dot") {
    context.arc(0, 0, size * (markerId === "filled-dot" ? 0.32 : 0.38), 0, Math.PI * 2);
    fill = markerId === "filled-dot";
  } else if (markerId === "square") {
    context.rect(-size * 0.72, -size * 0.36, size * 0.72, size * 0.72);
  } else if (markerId === "diamond") {
    context.moveTo(0, 0);
    context.lineTo(-size * 0.5, size * 0.4);
    context.lineTo(-size, 0);
    context.lineTo(-size * 0.5, -size * 0.4);
    context.closePath();
  } else if (markerId === "bar") {
    context.moveTo(0, -size * 0.52);
    context.lineTo(0, size * 0.52);
  } else if (markerId === "slash") {
    context.moveTo(-size * 0.2, size * 0.52);
    context.lineTo(size * 0.2, -size * 0.52);
  } else if (markerId === "cross") {
    context.moveTo(-size * 0.36, -size * 0.36);
    context.lineTo(size * 0.36, size * 0.36);
    context.moveTo(-size * 0.36, size * 0.36);
    context.lineTo(size * 0.36, -size * 0.36);
  } else if (markerId === "architectural-tick") {
    context.moveTo(0, -size * 0.5);
    context.lineTo(0, size * 0.5);
    context.moveTo(-size * 0.42, size * 0.5);
    context.lineTo(size * 0.42, -size * 0.5);
  } else {
    const triangle = markerId === "open-triangle"
      || markerId === "filled-triangle"
      || markerId === "filled-arrow";
    context.moveTo(0, 0);
    context.lineTo(-size, size * 0.45);
    if (triangle) {
      context.lineTo(-size, -size * 0.45);
      context.closePath();
    } else {
      context.moveTo(0, 0);
      context.lineTo(-size, -size * 0.45);
      if (markerId === "chevron") {
        context.moveTo(-size * 0.38, size * 0.45);
        context.lineTo(-size * 1.38, 0);
        context.lineTo(-size * 0.38, -size * 0.45);
      }
    }
    fill = markerId === "filled-arrow" || markerId === "filled-triangle";
  }
  context.fillStyle = color;
  context.strokeStyle = color;
  context.setLineDash([]);
  if (fill) context.fill();
  else context.stroke();
  context.restore();
  return {
    strokeCalls: fill ? 0 : 1,
    fillCalls: fill ? 1 : 0,
    markerCalls: 1,
  };
};

export const drawConnectionBatch = (
  context: CanvasRenderingContext2D,
  commands: readonly ConnectionDrawCommand[],
  options: ConnectionDrawOptions,
): ConnectionDrawWork => {
  const work: ConnectionDrawWork = {
    commandCount: commands.length,
    strokeCalls: 0,
    fillCalls: 0,
    markerCalls: 0,
  };
  const screenScale = Number.isFinite(options.scale) && options.scale > 0 ? options.scale : 1;
  for (const command of commands) {
    const style = command.style;
    context.save();
    context.globalAlpha = !options.fadeUnrelated || command.emphasis === "normal"
      ? style.appearance.opacity
      : command.emphasis === "focused"
        ? CONNECTION_FOCUS_OPACITY.focused
        : command.emphasis === "related"
          ? CONNECTION_FOCUS_OPACITY.related
          : CONNECTION_FOCUS_OPACITY.contextual;
    context.strokeStyle = style.appearance.color;
    context.lineWidth = style.appearance.width / screenScale;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash(dashFor(style, options.patternFallback).map((value) => value / screenScale));
    tracePath(context, command.path);
    context.stroke();
    work.strokeCalls += 1;
    if (style.strokePatternId === "double" && !options.patternFallback) {
      context.lineWidth = Math.max(0.5, style.appearance.width * 0.35) / screenScale;
      context.strokeStyle = options.theme === "night" ? "#16181b" : "#ffffff";
      tracePath(context, command.path);
      context.stroke();
      work.strokeCalls += 1;
    }
    if (options.markerDetail !== "hidden" && command.path.points.length >= 2) {
      const markerScale = options.markerDetail === "simple" ? 0.72 : 1;
      const markerSize = style.appearance.markerSize * markerScale / screenScale;
      const markerOffset = style.appearance.markerOffset / screenScale;
      const start = command.path.points[0]!;
      const next = command.path.points[1]!;
      const end = command.path.points[command.path.points.length - 1]!;
      const previous = command.path.points[command.path.points.length - 2]!;
      for (const markerWork of [
        drawMarker(context, style.startMarkerId, start, next, markerSize, markerOffset, style.appearance.color),
        drawMarker(context, style.endMarkerId, end, previous, markerSize, markerOffset, style.appearance.color),
      ]) {
        work.strokeCalls += markerWork.strokeCalls;
        work.fillCalls += markerWork.fillCalls;
        work.markerCalls += markerWork.markerCalls;
      }
    }
    context.restore();
  }
  return work;
};
