import { strict as assert } from "node:assert";
import test from "node:test";
import type { Connection, ConnectionAnchorId } from "../../domain/graph/types";
import { createDefaultConnectionFilterSpec } from "../../domain/connections/filters";
import { CONNECTION_MARKER_IDS } from "../../domain/connections/registry";
import {
  createDefaultProjectConnectionStyles,
  resolveConnectionStyle,
} from "../../domain/connections/styles";
import {
  buildConnectionPath,
  connectionEndpointsMayIntersectViewport,
  connectionPathBounds,
  distanceToConnectionPath,
  pathIntersectsViewport,
  resolveBoundaryAnchor,
  resolveConnectionLanes,
  type ConnectionEndpointGeometry,
} from "./geometry";
import { createConnectionInstrumentation } from "./instrumentation";
import {
  CONNECTION_HIT_TOLERANCE_PX,
  MAX_CONNECTION_PROJECTION_ATTEMPTS,
  MAX_VISIBLE_CONNECTION_COMMANDS,
  createConnectionPathCache,
  drawConnectionBatch,
  hitTestConnections,
  projectConnections,
  type ConnectionDrawCommand,
  type ConnectionProjectionInput,
} from "./renderer";

const endpoint = (
  id: string,
  x: number,
  y: number,
  radius = 20,
): ConnectionEndpointGeometry => ({ id, x, y, radius });

const connection = (
  id: string,
  fromSpaceId: string,
  toSpaceId: string,
  patch: Partial<Connection> = {},
): Connection => ({
  id,
  fromSpaceId,
  toSpaceId,
  enabled: true,
  semantic: {
    typeId: "custom",
    requirement: "optional",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
  ...patch,
});

const styles = createDefaultProjectConnectionStyles();
const viewport = { x: 0, y: 0, width: 400, height: 300 };

const projectionInput = (
  connections: readonly Connection[],
  endpoints: ReadonlyMap<string, ConnectionEndpointGeometry>,
  patch: Partial<ConnectionProjectionInput> = {},
): ConnectionProjectionInput => ({
  connections,
  endpoints,
  styles,
  filter: createDefaultConnectionFilterSpec(),
  viewport,
  selectedIds: new Set(),
  changedEndpointIds: new Set(),
  lod: "full",
  focusMode: "all",
  ...patch,
});

test("auto and explicit anchors clip visible endpoints to the Cell boundary", () => {
  const source = endpoint("a", 100, 100, 20);
  const target = endpoint("b", 300, 100, 30);
  const expected: Record<ConnectionAnchorId, { x: number; y: number }> = {
    auto: { x: 120, y: 100 },
    top: { x: 100, y: 80 },
    right: { x: 120, y: 100 },
    bottom: { x: 100, y: 120 },
    left: { x: 80, y: 100 },
  };
  for (const anchorId of ["auto", "top", "right", "bottom", "left"] as const) {
    assert.deepEqual(resolveBoundaryAnchor(source, target, anchorId), expected[anchorId]);
  }
  const reverse = resolveBoundaryAnchor(target, source, "auto");
  assert.deepEqual(reverse, { x: 270, y: 100 });
});

test("all launch geometries are deterministic and unknown geometry falls back to a line", () => {
  const source = endpoint("a", 100, 100, 20);
  const target = endpoint("b", 300, 180, 30);
  const base = resolveConnectionStyle(connection("c", "a", "b"), styles);
  const expectedKinds = {
    straight: "line",
    curved: "bezier",
    orthogonal: "polyline",
    elbow: "polyline",
  } as const;
  for (const [geometryId, kind] of Object.entries(expectedKinds)) {
    const style = { ...base, geometryId };
    const first = buildConnectionPath(source, target, style, 8);
    const second = buildConnectionPath(source, target, style, 8);
    assert.equal(first.kind, kind);
    assert.deepEqual(first, second, `${geometryId} output must be deterministic`);
    assert.ok(first.points.length >= 2);
  }
  const fallback = buildConnectionPath(source, target, { ...base, geometryId: "future-spline" }, 0);
  assert.equal(fallback.kind, "line");
});

test("unordered pair lanes are symmetric, ID-stable, and unaffected by unrelated insertion", () => {
  const pair = [
    connection("lane-d", "a", "b"),
    connection("lane-b", "b", "a"),
    connection("lane-c", "a", "b"),
    connection("lane-a", "a", "b"),
  ];
  const lanes = resolveConnectionLanes(pair);
  assert.deepEqual(
    [...pair].sort((left, right) => left.id.localeCompare(right.id)).map((item) => lanes.get(item.id)?.laneOffset),
    [-12, -4, 4, 12],
  );
  assert.equal(new Set([...lanes.values()].map((lane) => lane.pairKey)).size, 1);
  const withUnrelated = resolveConnectionLanes([
    connection("unrelated", "x", "y"),
    ...pair,
  ]);
  for (const item of pair) assert.deepEqual(withUnrelated.get(item.id), lanes.get(item.id));

  const one = resolveConnectionLanes([connection("only", "a", "b")]);
  assert.equal(one.get("only")?.laneOffset, 0);
  const three = resolveConnectionLanes(pair.slice(0, 3));
  assert.deepEqual([...three.values()].map((lane) => lane.laneOffset).sort((a, b) => a - b), [-8, 0, 8]);
});

test("reverse-directed siblings occupy distinct canonical lanes and remain clipped to original Cell boundaries", () => {
  const source = endpoint("a", 100, 100, 20);
  const target = endpoint("b", 300, 100, 20);
  const rows = [connection("lane-a", "a", "b"), connection("lane-b", "b", "a")];
  const lanes = resolveConnectionLanes(rows);
  const base = resolveConnectionStyle(rows[0]!, styles);
  const paths = rows.map((row) => buildConnectionPath(
    row.fromSpaceId === "a" ? source : target,
    row.toSpaceId === "b" ? target : source,
    base,
    lanes.get(row.id)!.laneOffset,
  ));
  const physicalLaneY = paths.map((path) => path.points[0]!.y).sort((left, right) => left - right);
  assert.deepEqual(physicalLaneY, [96, 104]);
  paths.forEach((path, index) => {
    const row = rows[index]!;
    const from = row.fromSpaceId === "a" ? source : target;
    const to = row.toSpaceId === "b" ? target : source;
    assert.ok(Math.abs(Math.hypot(path.points[0]!.x - from.x, path.points[0]!.y - from.y) - from.radius) < 1e-6);
    const end = path.points[path.points.length - 1]!;
    assert.ok(Math.abs(Math.hypot(end.x - to.x, end.y - to.y) - to.radius) < 1e-6);
  });
});

test("explicit anchors fan parallel lanes after the shared boundary point", () => {
  const source = endpoint("a", 100, 100, 20);
  const target = endpoint("b", 300, 100, 20);
  const rows = [connection("lane-a", "a", "b"), connection("lane-b", "a", "b")];
  const lanes = resolveConnectionLanes(rows);
  const base = resolveConnectionStyle(rows[0]!, styles);
  const paths = rows.map((row) => buildConnectionPath(source, target, {
    ...base,
    startAnchorId: "right",
    endAnchorId: "left",
  }, lanes.get(row.id)!.laneOffset));
  assert.deepEqual(paths.map((path) => path.points[0]), [{ x: 120, y: 100 }, { x: 120, y: 100 }]);
  assert.deepEqual(paths.map((path) => path.points[path.points.length - 1]), [{ x: 280, y: 100 }, { x: 280, y: 100 }]);
  assert.notEqual(paths[0]!.points[1]!.y, paths[1]!.points[1]!.y);
});

test("large sibling sets keep distinct physical lane bodies without leaving Cell boundaries", () => {
  const source = endpoint("a", 100, 100, 20);
  const target = endpoint("b", 300, 100, 20);
  const rows = Array.from({ length: 12 }, (_, index) => connection(`lane-${String(index).padStart(2, "0")}`, "a", "b"));
  const lanes = resolveConnectionLanes(rows);
  const base = resolveConnectionStyle(rows[0]!, styles);
  const paths = rows.map((row) => buildConnectionPath(source, target, base, lanes.get(row.id)!.laneOffset));
  assert.equal(new Set(paths.map((path) => path.points[1]!.y.toFixed(6))).size, rows.length);
  for (const path of paths) {
    const start = path.points[0]!;
    const end = path.points[path.points.length - 1]!;
    assert.ok(Math.abs(Math.hypot(start.x - source.x, start.y - source.y) - source.radius) < 1e-6);
    assert.ok(Math.abs(Math.hypot(end.x - target.x, end.y - target.y) - target.radius) < 1e-6);
  }
});

test("viewport culling keeps crossing paths and rejects fully offscreen paths", () => {
  const base = resolveConnectionStyle(connection("c", "a", "b"), styles);
  const crossing = buildConnectionPath(endpoint("a", -80, 150), endpoint("b", 480, 150), base, 0);
  const offscreen = buildConnectionPath(endpoint("a", -180, -120), endpoint("b", -80, -60), base, 0);
  assert.equal(pathIntersectsViewport(crossing, viewport), true);
  assert.equal(pathIntersectsViewport(offscreen, viewport), false);
  assert.deepEqual(connectionPathBounds(crossing), { x: -60, y: 150, width: 520, height: 0 });
});

test("cheap viewport rejection runs before path resolution while retaining crossing pairs", () => {
  const rows = [
    connection("crossing", "cross-a", "cross-b"),
    connection("offscreen", "off-a", "off-b"),
  ];
  const endpoints = new Map([
    ["cross-a", endpoint("cross-a", -120, 150)],
    ["cross-b", endpoint("cross-b", 520, 150)],
    ["off-a", endpoint("off-a", -900, -700)],
    ["off-b", endpoint("off-b", -760, -620)],
  ]);
  assert.equal(connectionEndpointsMayIntersectViewport(endpoints.get("cross-a")!, endpoints.get("cross-b")!, 0, viewport), true);
  assert.equal(connectionEndpointsMayIntersectViewport(endpoints.get("off-a")!, endpoints.get("off-b")!, 0, viewport), false);

  const cache = createConnectionPathCache();
  const result = projectConnections(projectionInput(rows, endpoints), cache);
  assert.deepEqual(result.commands.map((command) => command.id), ["crossing"]);
  assert.equal(result.metrics.pathResolutions, 1);
  assert.equal(result.metrics.cacheMisses, 1);
  assert.equal(cache.size, 1);
});

test("projection resolves inherited styles, clips boundaries, culls, and draws selected siblings last", () => {
  const rows = [
    connection("lane-b", "a", "b"),
    connection("lane-a", "a", "b"),
    connection("off", "x", "y"),
    connection("hidden", "a", "b", { visual: { visible: false } }),
    connection("inactive", "a", "b", { enabled: false }),
  ];
  const endpoints = new Map([
    ["a", endpoint("a", 100, 100)],
    ["b", endpoint("b", 300, 100)],
    ["x", endpoint("x", -200, -100)],
    ["y", endpoint("y", -100, -50)],
  ]);
  const result = projectConnections(projectionInput(rows, endpoints, {
    selectedIds: new Set(["lane-a"]),
  }), createConnectionPathCache());
  assert.deepEqual(result.commands.map((command) => command.id), ["lane-b", "lane-a"]);
  assert.equal(result.commands[result.commands.length - 1]?.selected, true);
  assert.equal(result.commands[0]?.emphasis, "related");
  assert.equal(result.commands[1]?.emphasis, "focused");
  assert.equal(result.metrics.authoredCount, 5);
  assert.equal(result.metrics.eligibleCount, 2);
  assert.equal(result.metrics.visibleCount, 2);
  assert.equal(result.metrics.hitIndexEntries, 2);
  assert.equal(result.metrics.labelLayouts, 0);
  for (const command of result.commands) {
    const start = command.path.points[0]!;
    const end = command.path.points[command.path.points.length - 1]!;
    assert.ok(start.x > 100 && end.x < 300, "line endpoints are clipped outside Cell content");
  }
});

test("annotation projection resolves authored Canvas text only after Connection culling", () => {
  const visible = connection("visible-note", "a", "b", {
    annotation: {
      title: { source: "custom", text: "Kitchen to dining" },
      body: { source: "custom", text: "Shared service circulation between public and staff zones." },
    },
  });
  const offscreen = connection("offscreen-note", "x", "y", {
    annotation: { title: { source: "custom", text: "Must never be laid out" } },
  });
  const result = projectConnections(projectionInput([visible, offscreen], new Map([
    ["a", endpoint("a", 40, 150)],
    ["b", endpoint("b", 360, 150)],
    ["x", endpoint("x", -900, -700)],
    ["y", endpoint("y", -760, -620)],
  ])), createConnectionPathCache());
  const annotations = result.annotations;

  assert.equal(annotations?.length, 1);
  assert.equal(annotations?.[0]?.connectionId, visible.id);
  assert.equal(annotations?.[0]?.lod, "full");
  assert.equal(annotations?.[0]?.title?.text, "Kitchen to dining");
  assert.equal(annotations?.[0]?.body?.text, visible.annotation?.body?.text);
});

test("Connection focus keeps selected, endpoint-related, and contextual lines visibly ordered", () => {
  const rows = [
    connection("ab", "a", "b"),
    connection("bc", "b", "c"),
    connection("de", "d", "e"),
  ];
  const endpoints = new Map([
    ["a", endpoint("a", 60, 80)],
    ["b", endpoint("b", 160, 80)],
    ["c", endpoint("c", 260, 80)],
    ["d", endpoint("d", 160, 180)],
    ["e", endpoint("e", 260, 180)],
  ]);
  const result = projectConnections(projectionInput(rows, endpoints, {
    selectedIds: new Set(["ab"]),
  }), createConnectionPathCache());
  const commandById = new Map(result.commands.map((command) => [command.id, command]));
  assert.equal(commandById.get("ab")?.emphasis, "focused");
  assert.equal(commandById.get("bc")?.emphasis, "related");
  assert.equal(commandById.get("de")?.emphasis, "faded");

  const context = new RecordingContext();
  drawConnectionBatch(context as unknown as CanvasRenderingContext2D, result.commands, {
    theme: "day",
    scale: 1,
    fadeUnrelated: true,
    drawLabels: false,
    markerDetail: "hidden",
    patternFallback: false,
  });
  const alphaById = new Map(result.commands.map((command, index) => [command.id, context.strokes[index]?.alpha]));
  assert.equal(alphaById.get("ab"), 1);
  assert.equal(alphaById.get("bc"), 0.76);
  assert.equal(alphaById.get("de"), 0.44);
});

test("selected-Cell focus fades unrelated commands without deleting semantic rows", () => {
  const rows = [connection("ab", "a", "b"), connection("cd", "c", "d")];
  const endpoints = new Map([
    ["a", endpoint("a", 60, 80)],
    ["b", endpoint("b", 160, 80)],
    ["c", endpoint("c", 240, 180)],
    ["d", endpoint("d", 340, 180)],
  ]);
  const result = projectConnections(projectionInput(rows, endpoints, {
    focusMode: "selected-cell",
    filter: { ...createDefaultConnectionFilterSpec(), selectedCellIds: ["a"] },
  }), createConnectionPathCache());
  assert.equal(result.commands.length, 2);
  assert.equal(result.commands.find((command) => command.id === "ab")?.emphasis, "focused");
  assert.equal(result.commands.find((command) => command.id === "cd")?.emphasis, "faded");
});

test("dependency cache is bounded and invalidates only incident Connections", () => {
  const rows = [connection("ab", "a", "b"), connection("cd", "c", "d")];
  const endpoints = new Map([
    ["a", endpoint("a", 60, 80)],
    ["b", endpoint("b", 160, 80)],
    ["c", endpoint("c", 240, 180)],
    ["d", endpoint("d", 340, 180)],
  ]);
  const cache = createConnectionPathCache(2);
  const first = projectConnections(projectionInput(rows, endpoints), cache);
  assert.equal(first.metrics.cacheMisses, 2);
  assert.equal(first.metrics.pathResolutions, 2);
  const warm = projectConnections(projectionInput(rows, endpoints), cache);
  assert.equal(warm.metrics.cacheHits, 2);
  assert.equal(warm.metrics.pathResolutions, 0);
  const changed = projectConnections(projectionInput(rows, endpoints, {
    changedEndpointIds: new Set(["a"]),
  }), cache);
  assert.equal(changed.metrics.endpointInvalidations, 1);
  assert.equal(changed.metrics.cacheMisses, 1);
  assert.equal(changed.metrics.cacheHits, 1);
  assert.ok(cache.size <= 2);

  projectConnections(projectionInput([connection("ef", "e", "f")], new Map([
    ["e", endpoint("e", 80, 240)],
    ["f", endpoint("f", 180, 240)],
  ])), cache);
  assert.ok(cache.size <= 2, "cache must evict instead of growing with authored count");
});

test("parallel lanes stay individually hit-testable with a fixed screen tolerance", () => {
  const rows = [connection("a-lane", "a", "b"), connection("b-lane", "a", "b")];
  const endpoints = new Map([
    ["a", endpoint("a", 100, 100)],
    ["b", endpoint("b", 300, 100)],
  ]);
  const result = projectConnections(projectionInput(rows, endpoints), createConnectionPathCache());
  const first = result.commands.find((command) => command.id === "a-lane")!;
  const second = result.commands.find((command) => command.id === "b-lane")!;
  const firstMid = first.path.points[Math.floor(first.path.points.length / 2)]!;
  const secondMid = second.path.points[Math.floor(second.path.points.length / 2)]!;
  assert.ok(CONNECTION_HIT_TOLERANCE_PX * 2 >= 10 && CONNECTION_HIT_TOLERANCE_PX * 2 <= 14);
  assert.equal(hitTestConnections(result.hitIndex, firstMid, CONNECTION_HIT_TOLERANCE_PX), "a-lane");
  assert.equal(hitTestConnections(result.hitIndex, secondMid, CONNECTION_HIT_TOLERANCE_PX), "b-lane");
  assert.equal(hitTestConnections(result.hitIndex, { x: 200, y: 140 }, CONNECTION_HIT_TOLERANCE_PX), null);
  assert.ok(distanceToConnectionPath(firstMid, first.path) < 1e-6);
});

test("bounded density fixtures project only the supported visible subset and reuse cached paths", () => {
  const scenes = [
    { visibleCells: 25, visibleConnections: 50, authoredCount: 50, lod: "full" as const },
    { visibleCells: 60, visibleConnections: 300, authoredCount: 300, lod: "dense" as const },
    { visibleCells: 96, visibleConnections: 800, authoredCount: 1_200, lod: "critical" as const },
  ];

  for (const scene of scenes) {
    const columns = Math.ceil(Math.sqrt(scene.visibleCells));
    const endpoints = new Map(Array.from({ length: scene.visibleCells }, (_, index) => {
      const id = `cell-${index}`;
      return [id, endpoint(id, 18 + (index % columns) * 34, 18 + Math.floor(index / columns) * 30, 7)] as const;
    }));
    const rows = Array.from({ length: scene.authoredCount }, (_, index) => {
      if (index >= scene.visibleConnections) {
        return connection(`authored-offscreen-${index}`, `authored-cell-${index}`, `authored-cell-${index + 1}`);
      }
      const fromIndex = index % scene.visibleCells;
      let toIndex = (index * 37 + 11 + Math.floor(index / scene.visibleCells)) % scene.visibleCells;
      if (toIndex === fromIndex) toIndex = (toIndex + 1) % scene.visibleCells;
      return connection(`connection-${index}`, `cell-${fromIndex}`, `cell-${toIndex}`);
    });
    const cache = createConnectionPathCache();
    const input = projectionInput(rows, endpoints, {
      authoredCount: scene.authoredCount,
      lod: scene.lod,
    });
    const cold = projectConnections(input, cache);
    const warm = projectConnections(input, cache);

    assert.equal(cold.metrics.authoredCount, scene.authoredCount);
    assert.equal(cold.metrics.visibleCount, scene.visibleConnections);
    assert.equal(cold.metrics.hitIndexEntries, scene.visibleConnections);
    assert.equal(cold.metrics.pathResolutions, scene.visibleConnections);
    assert.equal(warm.metrics.pathResolutions, 0);
    assert.equal(warm.metrics.cacheHits, scene.visibleConnections);
    assert.ok(cache.size <= 2_048);
  }
});

test("2,400 canonical Connections keep annotation work bounded after visible-path culling", () => {
  const visibleCount = 800;
  const authoredCount = 2_400;
  const visibleCells = 96;
  const columns = 12;
  const endpoints = new Map(Array.from({ length: visibleCells }, (_, index) => {
    const id = `annotation-cell-${index}`;
    return [id, endpoint(id, 20 + (index % columns) * 30, 20 + Math.floor(index / columns) * 34, 6)] as const;
  }));
  const rows = Array.from({ length: authoredCount }, (_, index) => {
    if (index >= visibleCount) {
      return connection(`authored-only-${index}`, `missing-${index}`, `missing-${index + 1}`, {
        annotation: { body: { source: "custom", text: "Must not enter annotation layout." } },
      });
    }
    const fromIndex = index % visibleCells;
    let toIndex = (index * 31 + 7 + Math.floor(index / visibleCells)) % visibleCells;
    if (toIndex === fromIndex) toIndex = (toIndex + 1) % visibleCells;
    return connection(
      `visible-annotation-${String(index).padStart(4, "0")}`,
      `annotation-cell-${fromIndex}`,
      `annotation-cell-${toIndex}`,
      {
        annotation: {
          title: { source: "custom", text: `Connection ${index}` },
          body: { source: "custom", text: "Bounded professional relationship annotation." },
        },
      },
    );
  });
  const result = projectConnections(projectionInput(rows, endpoints, {
    authoredCount,
    lod: "critical",
  }), createConnectionPathCache());
  const metrics = result.metrics;

  assert.equal(result.commands.length, visibleCount);
  assert.ok(metrics.annotationCandidates <= 96);
  assert.ok(metrics.annotationFull <= 24);
  assert.ok(metrics.annotationTitleOnly + metrics.annotationFull <= 96);
  assert.ok(metrics.labelLayouts <= 96);
  assert.ok(metrics.annotationCollisionChecks < visibleCount * visibleCount);
});

test("adversarial visible density stays within one deterministic command and hit budget", () => {
  const visibleCells = 96;
  const endpoints = new Map(Array.from({ length: visibleCells }, (_, index) => {
    const id = `dense-cell-${index}`;
    return [id, endpoint(id, 30 + (index % 12) * 28, 30 + Math.floor(index / 12) * 28, 6)] as const;
  }));
  const rows = Array.from({ length: 3_000 }, (_, index) => {
    const fromIndex = index % visibleCells;
    let toIndex = (index * 31 + 7 + Math.floor(index / visibleCells)) % visibleCells;
    if (toIndex === fromIndex) toIndex = (toIndex + 1) % visibleCells;
    return connection(
      `overflow-${String(index).padStart(4, "0")}`,
      `dense-cell-${fromIndex}`,
      `dense-cell-${toIndex}`,
    );
  });
  const selectedId = rows[rows.length - 1]!.id;
  const cache = createConnectionPathCache();
  const input = projectionInput(rows, endpoints, {
    authoredCount: rows.length,
    selectedIds: new Set([selectedId]),
    lod: "critical",
  });
  const cold = projectConnections(input, cache);
  const warm = projectConnections(input, cache);

  assert.equal(cold.metrics.authoredCount, 3_000);
  assert.equal(cold.metrics.visibleCount, MAX_VISIBLE_CONNECTION_COMMANDS);
  assert.equal(cold.metrics.pathResolutions, MAX_VISIBLE_CONNECTION_COMMANDS);
  assert.equal(cold.metrics.hitIndexEntries, MAX_VISIBLE_CONNECTION_COMMANDS);
  assert.equal(cold.commands.some((command) => command.id === selectedId), true);
  assert.equal(cold.commands[cold.commands.length - 1]?.id, selectedId, "selected work remains the final hit/draw priority");
  assert.equal(warm.metrics.cacheHits, MAX_VISIBLE_CONNECTION_COMMANDS);
  assert.equal(warm.metrics.pathResolutions, 0);
  assert.ok(cache.size <= MAX_VISIBLE_CONNECTION_COMMANDS);
});

test("hidden and conservative false-positive rows cannot starve a later visible command", () => {
  const hiddenRows = Array.from({ length: MAX_VISIBLE_CONNECTION_COMMANDS }, (_, index) => connection(
    `a-hidden-${String(index).padStart(4, "0")}`,
    "hidden-a",
    "hidden-b",
    { visual: { visible: false } },
  ));
  const falsePositiveCount = 1_100;
  const falsePositiveRows = Array.from({ length: falsePositiveCount }, (_, index) => connection(
    `m-false-${String(index).padStart(4, "0")}`,
    `false-a-${index}`,
    `false-b-${index}`,
  ));
  const visible = connection("z-visible", "visible-a", "visible-b");
  const endpoints = new Map<string, ConnectionEndpointGeometry>([
    ["hidden-a", endpoint("hidden-a", 80, 80)],
    ["hidden-b", endpoint("hidden-b", 180, 80)],
    ["visible-a", endpoint("visible-a", 100, 150)],
    ["visible-b", endpoint("visible-b", 300, 150)],
  ]);
  for (let index = 0; index < falsePositiveCount; index += 1) {
    endpoints.set(`false-a-${index}`, endpoint(`false-a-${index}`, -500, -200));
    endpoints.set(`false-b-${index}`, endpoint(`false-b-${index}`, 900, -200));
  }

  const result = projectConnections(projectionInput([
    ...hiddenRows,
    ...falsePositiveRows,
    visible,
  ], endpoints), createConnectionPathCache());

  assert.deepEqual(result.commands.map((command) => command.id), [visible.id]);
  assert.equal(result.metrics.pathResolutions, falsePositiveCount + 1);
  assert.ok(result.metrics.pathResolutions <= MAX_CONNECTION_PROJECTION_ATTEMPTS);
});

test("overflow selection and selected-Cell focus retain stable lanes and warm paths", () => {
  const stable = connection("a-stable", "stable-a", "stable-b");
  const overflow = connection("z-overflow", "stable-a", "stable-b");
  const middle = Array.from({ length: MAX_VISIBLE_CONNECTION_COMMANDS - 1 }, (_, index) => connection(
    `m-${String(index).padStart(4, "0")}`,
    `middle-a-${index}`,
    `middle-b-${index}`,
  ));
  const rows = [stable, ...middle, overflow];
  const endpoints = new Map<string, ConnectionEndpointGeometry>([
    ["stable-a", endpoint("stable-a", 80, 140)],
    ["stable-b", endpoint("stable-b", 320, 140)],
  ]);
  middle.forEach((_, index) => {
    const y = 20 + (index % 32) * 8;
    endpoints.set(`middle-a-${index}`, endpoint(`middle-a-${index}`, 40, y, 4));
    endpoints.set(`middle-b-${index}`, endpoint(`middle-b-${index}`, 360, y, 4));
  });

  const selectionCache = createConnectionPathCache();
  const selectionBaseline = projectConnections(projectionInput(rows, endpoints), selectionCache);
  const selected = projectConnections(projectionInput(rows, endpoints, {
    selectedIds: new Set([overflow.id]),
  }), selectionCache);
  assert.equal(selectionBaseline.commands.length, MAX_VISIBLE_CONNECTION_COMMANDS);
  assert.equal(selected.commands[selected.commands.length - 1]?.id, overflow.id);
  assert.equal(
    selected.commands.find((command) => command.id === stable.id)?.lane.laneOffset,
    selectionBaseline.commands.find((command) => command.id === stable.id)?.lane.laneOffset,
  );
  assert.equal(selected.metrics.pathResolutions, 1);
  assert.equal(selected.metrics.cacheHits, MAX_VISIBLE_CONNECTION_COMMANDS - 1);

  const focusCache = createConnectionPathCache();
  const focusBaseline = projectConnections(projectionInput(rows, endpoints), focusCache);
  const focused = projectConnections(projectionInput(rows, endpoints, {
    filter: { ...createDefaultConnectionFilterSpec(), selectedCellIds: ["stable-b"] },
    focusMode: "selected-cell",
  }), focusCache);
  assert.equal(focused.commands.some((command) => command.id === overflow.id), true);
  assert.equal(
    focused.commands.find((command) => command.id === stable.id)?.lane.laneOffset,
    focusBaseline.commands.find((command) => command.id === stable.id)?.lane.laneOffset,
  );
  assert.equal(focused.metrics.pathResolutions, 1);
  assert.equal(focused.metrics.cacheHits, MAX_VISIBLE_CONNECTION_COMMANDS - 1);
});

test("render extents keep thick strokes, markers, selection, and hit corridors alive at viewport edges", () => {
  const authored = connection("edge", "a", "b", {
    visual: {
      startMarkerId: "circle",
      endMarkerId: "filled-arrow",
      appearance: { width: 20, markerSize: 16 },
    },
  });
  const endpoints = new Map([
    ["a", endpoint("a", 100, -8, 0)],
    ["b", endpoint("b", 300, -8, 0)],
  ]);
  const rawPath = buildConnectionPath(
    endpoints.get("a")!,
    endpoints.get("b")!,
    resolveConnectionStyle(authored, styles),
    0,
  );
  assert.equal(pathIntersectsViewport(rawPath, viewport), false, "the centreline itself is outside");
  const cache = createConnectionPathCache();
  const cold = projectConnections(projectionInput([authored], endpoints, {
    selectedIds: new Set([authored.id]),
  }), cache);
  const warm = projectConnections(projectionInput([authored], endpoints, {
    selectedIds: new Set([authored.id]),
  }), cache);
  assert.equal(cold.commands.length, 1, "rendered extents enter the viewport");
  assert.ok(cold.commands[0]!.bounds.y <= 0 && cold.commands[0]!.bounds.y + cold.commands[0]!.bounds.height >= 0);
  assert.equal(warm.metrics.cacheHits, 1);
  assert.equal(warm.metrics.pathResolutions, 0);
});

class RecordingContext {
  globalAlpha = 1;
  lineWidth = 1;
  lineCap: CanvasLineCap = "butt";
  lineJoin: CanvasLineJoin = "miter";
  strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
  fillStyle: string | CanvasGradient | CanvasPattern = "#000";
  strokes: Array<{ alpha: number; width: number; dash: number[] }> = [];
  fills = 0;
  translations: Array<{ x: number; y: number }> = [];
  rotations: number[] = [];
  currentDash: number[] = [];
  save() {}
  restore() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  closePath() {}
  translate(x: number, y: number) { this.translations.push({ x, y }); }
  rotate(angle: number) { this.rotations.push(angle); }
  arc() {}
  rect() {}
  fill() { this.fills += 1; }
  setLineDash(value: number[]) { this.currentDash = [...value]; }
  stroke() { this.strokes.push({ alpha: this.globalAlpha, width: this.lineWidth, dash: [...this.currentDash] }); }
}

test("batch drawing keeps widths/dashes screen-stable and emits no per-record surface", () => {
  const rows = [
    connection("solid", "a", "b"),
    connection("dash", "a", "b", { visual: { strokePatternId: "dashed", appearance: { width: 2 } } }),
  ];
  const endpoints = new Map([
    ["a", endpoint("a", 100, 100)],
    ["b", endpoint("b", 300, 100)],
  ]);
  const result = projectConnections(projectionInput(rows, endpoints), createConnectionPathCache());
  const context = new RecordingContext();
  const work = drawConnectionBatch(context as unknown as CanvasRenderingContext2D, result.commands, {
    theme: "day",
    scale: 1,
    fadeUnrelated: false,
    drawLabels: false,
    markerDetail: "full",
    patternFallback: false,
  });
  assert.ok(context.strokes.length >= 2);
  assert.ok(context.strokes.some((stroke) => stroke.width === 2));
  assert.ok(context.strokes.some((stroke) => stroke.dash.length > 0));
  assert.equal(work.commandCount, 2);
  assert.equal(work.strokeCalls, context.strokes.length);
});

test("full and simple marker detail preserve distinct start/end markers and endpoint tangents", () => {
  const authored = connection("marked", "a", "b", {
    visual: { startMarkerId: "circle", endMarkerId: "filled-arrow" },
  });
  const projected = projectConnections(projectionInput([authored], new Map([
    ["a", endpoint("a", 100, 100)],
    ["b", endpoint("b", 300, 100)],
  ])), createConnectionPathCache()).commands;

  for (const markerDetail of ["full", "simple"] as const) {
    const context = new RecordingContext();
    const work = drawConnectionBatch(context as unknown as CanvasRenderingContext2D, projected, {
      theme: "day",
      scale: 1,
      fadeUnrelated: false,
      drawLabels: false,
      markerDetail,
      patternFallback: false,
    });
    assert.equal(work.markerCalls, 2);
    assert.equal(context.translations.length, 2);
    assert.ok(Math.abs(Math.abs(context.rotations[0]!) - Math.PI) < 1e-6, "start marker points out of the first segment");
    assert.ok(Math.abs(context.rotations[1]!) < 1e-6, "end marker follows the final segment");
  }

  const noMarkers = projected.map((command) => ({
    ...command,
    style: { ...command.style, startMarkerId: "none", endMarkerId: "none" },
  }));
  const noneContext = new RecordingContext();
  const noneWork = drawConnectionBatch(noneContext as unknown as CanvasRenderingContext2D, noMarkers, {
    theme: "day",
    scale: 1,
    fadeUnrelated: false,
    drawLabels: false,
    markerDetail: "full",
    patternFallback: false,
  });
  assert.equal(noneWork.markerCalls, 0);
  assert.equal(noneContext.translations.length, 0);
});

test("every launch marker registry entry stays native, batched, and safe at either endpoint", () => {
  const rows = CONNECTION_MARKER_IDS.map((markerId, index) => connection(`marker-${index}`, "a", "b", {
    visual: { startMarkerId: markerId, endMarkerId: markerId },
  }));
  const projected = projectConnections(projectionInput(rows, new Map([
    ["a", endpoint("a", 100, 100)],
    ["b", endpoint("b", 300, 100)],
  ])), createConnectionPathCache()).commands;
  const context = new RecordingContext();
  const work = drawConnectionBatch(context as unknown as CanvasRenderingContext2D, projected, {
    theme: "day",
    scale: 1,
    fadeUnrelated: false,
    drawLabels: false,
    markerDetail: "full",
    patternFallback: false,
  });
  assert.equal(work.commandCount, CONNECTION_MARKER_IDS.length);
  assert.equal(work.markerCalls, (CONNECTION_MARKER_IDS.length - 1) * 2);
  assert.equal(context.translations.length, work.markerCalls);
  assert.equal(work.strokeCalls, context.strokes.length);
  assert.equal(work.fillCalls, context.fills);
});

test("OFF instrumentation preserves authored count and settles every visual-work counter to zero", () => {
  const instrumentation = createConnectionInstrumentation();
  instrumentation.beginFrame(300);
  instrumentation.recordProjection({
    authoredCount: 300,
    eligibleCount: 180,
    visibleCount: 96,
    anchorResolutions: 80,
    pathResolutions: 40,
    cacheHits: 56,
    cacheMisses: 40,
    endpointInvalidations: 3,
    hitIndexEntries: 96,
    labelLayouts: 0,
    annotationCandidates: 0,
    annotationFull: 0,
    annotationTitleOnly: 0,
    annotationCollisionRejected: 0,
    annotationCollisionChecks: 0,
  });
  instrumentation.recordDrawBatch({ commandCount: 96, strokeCalls: 100, fillCalls: 4, markerCalls: 4 }, "base");
  instrumentation.recordDrawBatch({ commandCount: 2, strokeCalls: 4, fillCalls: 0, markerCalls: 0 }, "overlay");
  instrumentation.recordOverlayPrimitives(3, 2);
  instrumentation.recordOverlayClear();
  instrumentation.recordPortProjection(96);
  instrumentation.recordHitTest();
  instrumentation.setSleeping(true);
  assert.equal(instrumentation.snapshot().drawCalls, 112);
  assert.equal(instrumentation.snapshot().batchPasses, 2);
  assert.equal(instrumentation.snapshot().hitTests, 1);
  assert.equal(instrumentation.snapshot().portProjections, 96);
  assert.equal(instrumentation.snapshot().selectionOverlayDraws, 2);
  assert.equal(instrumentation.snapshot().sleeping, true);
  instrumentation.settleOff(300);
  assert.deepEqual(instrumentation.snapshot(), {
    authoredCount: 300,
    eligibleCount: 0,
    visibleCount: 0,
    anchorResolutions: 0,
    pathResolutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
    endpointInvalidations: 0,
    hitIndexEntries: 0,
    labelLayouts: 0,
    annotationCandidates: 0,
    annotationFull: 0,
    annotationTitleOnly: 0,
    annotationCollisionRejected: 0,
    annotationCollisionChecks: 0,
    annotationDrawn: 0,
    annotationDrawCalls: 0,
    batchPasses: 0,
    drawCalls: 0,
    drawnCommands: 0,
    baseDrawCalls: 0,
    overlayDrawCalls: 0,
    overlayDrawnCommands: 0,
    overlayClears: 0,
    hitTests: 0,
    portProjections: 0,
    selectionOverlayDraws: 0,
    sleeping: true,
  });
});

test("Table sleep clears annotation projection, collision, and draw work without erasing authored lines", () => {
  const instrumentation = createConnectionInstrumentation();
  assert.equal(typeof instrumentation.recordAnnotationDraw, "function");
  assert.equal(typeof instrumentation.settleAnnotations, "function");
  instrumentation.beginFrame(2_400);
  instrumentation.recordProjection({
    authoredCount: 2_400,
    eligibleCount: 800,
    visibleCount: 800,
    anchorResolutions: 1_600,
    pathResolutions: 800,
    cacheHits: 0,
    cacheMisses: 800,
    endpointInvalidations: 0,
    hitIndexEntries: 800,
    labelLayouts: 20,
    annotationCandidates: 96,
    annotationFull: 12,
    annotationTitleOnly: 8,
    annotationCollisionRejected: 76,
    annotationCollisionChecks: 500,
  });
  instrumentation.recordAnnotationDraw({ annotationDrawn: 20, fillCalls: 20, strokeCalls: 20, textCalls: 36 });
  instrumentation.settleAnnotations();
  instrumentation.setSleeping(true);
  const snapshot = instrumentation.snapshot();

  assert.equal(snapshot.authoredCount, 2_400);
  assert.equal(snapshot.visibleCount, 800);
  assert.equal(snapshot.annotationCandidates, 0);
  assert.equal(snapshot.annotationFull, 0);
  assert.equal(snapshot.annotationTitleOnly, 0);
  assert.equal(snapshot.annotationCollisionRejected, 0);
  assert.equal(snapshot.annotationCollisionChecks, 0);
  assert.equal(snapshot.annotationDrawn, 0);
  assert.equal(snapshot.annotationDrawCalls, 0);
  assert.equal(snapshot.labelLayouts, 0);
  assert.equal(snapshot.sleeping, true);
});

test("synchronous overlay accounting never invents scheduler wakefulness", () => {
  const instrumentation = createConnectionInstrumentation();
  instrumentation.recordDrawBatch({ commandCount: 1, strokeCalls: 1, fillCalls: 0, markerCalls: 0 }, "overlay");
  instrumentation.recordOverlayPrimitives(2, 1);
  assert.equal(instrumentation.snapshot().sleeping, true);
  instrumentation.beginFrame(1);
  assert.equal(instrumentation.snapshot().sleeping, false);
  instrumentation.setSleeping(true);
  instrumentation.recordDrawBatch({ commandCount: 1, strokeCalls: 1, fillCalls: 0, markerCalls: 0 }, "overlay");
  assert.equal(instrumentation.snapshot().sleeping, true);
});

test("critical LOD declares pattern fallback without mutating authored visual data", () => {
  const authored = connection("dense", "a", "b", {
    visual: { strokePatternId: "double", appearance: { width: 3 } },
  });
  const before = structuredClone(authored);
  const result = projectConnections(projectionInput([authored], new Map([
    ["a", endpoint("a", 100, 100)],
    ["b", endpoint("b", 300, 100)],
  ]), { lod: "critical" }), createConnectionPathCache());
  assert.equal(result.commands[0]?.style.strokePatternId, "solid");
  assert.deepEqual(authored, before);
});

test("draw command contract remains serializable for detached export reuse", () => {
  const command: ConnectionDrawCommand = projectConnections(projectionInput(
    [connection("one", "a", "b")],
    new Map([
      ["a", endpoint("a", 100, 100)],
      ["b", endpoint("b", 300, 100)],
    ]),
  ), createConnectionPathCache()).commands[0]!;
  assert.doesNotThrow(() => structuredClone(command));
  assert.equal(command.labelText, null);
});
