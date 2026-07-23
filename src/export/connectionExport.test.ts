import { strict as assert } from "node:assert";
import { performance } from "node:perf_hooks";
import test from "node:test";
import type { Connection } from "../domain/graph/types";
import {
  createDefaultRelationshipLegendConfig,
  projectRelationshipLegend,
} from "../domain/connections/relationshipLegend";
import {
  createProjectRelationshipType,
  getAllRelationshipTypes,
} from "../domain/connections/relationshipTypes";
import { createDefaultProjectConnectionStyles } from "../domain/connections/styles";
import type { ConnectionEndpointGeometry } from "../canvas/connections/geometry";
import {
  projectConnectionsForExport,
  relationshipsToCsv,
  renderRelationshipLegendForExport,
} from "./connectionExport";
import {
  projectRelationshipMatrix,
  projectRelationshipRows,
} from "../domain/connections/selectors";

const semantic = (typeId: string): Connection["semantic"] => ({
  typeId,
  requirement: "preferred",
  direction: "none",
  strength: "medium",
  priority: "normal",
  notes: "",
});

const connection = (
  id: string,
  patch: Partial<Connection> = {},
): Connection => ({
  id,
  fromSpaceId: "a",
  toSpaceId: "b",
  enabled: true,
  semantic: semantic("custom"),
  ...patch,
});

const endpoints = new Map<string, ConnectionEndpointGeometry>([
  ["a", { id: "a", x: 80, y: 140, radius: 24 }],
  ["b", { id: "b", x: 520, y: 140, radius: 32 }],
]);

const bounds = { x: 0, y: 0, width: 640, height: 320 };

test("detached export preserves all geometry families and sparse local visual overrides", () => {
  const styles = createDefaultProjectConnectionStyles();
  const connections = [
    connection("straight", { visual: { geometryId: "straight" } }),
    connection("curved", { visual: { geometryId: "curved" } }),
    connection("orthogonal", { visual: { geometryId: "orthogonal" } }),
    connection("elbow", {
      visual: {
        geometryId: "elbow",
        strokePatternId: "dash-dot-dot",
        startMarkerId: "circle",
        endMarkerId: "filled-arrow",
        lineCap: "square",
        lineJoin: "bevel",
        appearance: {
          color: "#b31d2f",
          width: 7,
          opacity: 0.46,
          dashScale: 1.7,
          patternAmplitude: 9,
        },
      },
    }),
  ];
  const projected = projectConnectionsForExport({
    connections,
    endpoints,
    styles,
    bounds,
    globalVisible: true,
  });
  assert.deepEqual(
    projected.primitives.map(({ path }) => path.kind).sort(),
    ["bezier", "polyline", "polyline", "line"].sort(),
  );
  const elbow = projected.primitives.find((primitive) => primitive.id === "elbow")!;
  assert.equal(elbow.style.geometryId, "elbow");
  assert.equal(elbow.style.strokePatternId, "dash-dot-dot");
  assert.equal(elbow.style.startMarkerId, "circle");
  assert.equal(elbow.style.endMarkerId, "filled-arrow");
  assert.equal(elbow.style.appearance.color, "#b31d2f");
  assert.equal(elbow.style.appearance.width, 7);
  assert.equal(elbow.style.appearance.opacity, 0.46);
  assert.equal(elbow.style.lineCap, "square");
  assert.equal(elbow.style.lineJoin, "bevel");
  assert.ok(elbow.metrics.dashArray.length > 0);
});

test("advanced pattern identities remain vector-ready and Vertical Hatch has no base path", () => {
  const styles = createDefaultProjectConnectionStyles();
  const patternIds = [
    "solid",
    "dashed",
    "dotted",
    "dash-dot",
    "double",
    "segmented-bars",
    "zigzag",
    "wave",
    "scallop",
    "vertical-hash",
    "vertical-hatch",
    "lightning",
    "long-dash",
    "dash-dot-dot",
    "sparse-dot",
    "centerline",
  ] as const;
  const projected = projectConnectionsForExport({
    connections: patternIds.map((strokePatternId, index) => connection(
      `pattern-${String(index).padStart(2, "0")}`,
      { visual: { strokePatternId } },
    )),
    endpoints,
    styles,
    bounds,
    globalVisible: true,
  });
  assert.deepEqual(
    projected.primitives.map((primitive) => primitive.style.strokePatternId).sort(),
    [...patternIds].sort(),
  );
  const hatch = projected.primitives.find(
    (primitive) => primitive.style.strokePatternId === "vertical-hatch",
  )!;
  assert.deepEqual(hatch.motif.paths, []);
  assert.ok(hatch.motif.marks.length > 0);
  const hash = projected.primitives.find(
    (primitive) => primitive.style.strokePatternId === "vertical-hash",
  )!;
  assert.ok(hash.motif.paths.length > 0);
  assert.ok(hash.motif.marks.length > 0);
});

test("export metrics ignore live camera zoom and use only explicit document scale", () => {
  const input = {
    connections: [connection("scale", {
      visual: { appearance: { width: 3, dashScale: 1.25, patternAmplitude: 6 } },
    })],
    endpoints,
    styles: createDefaultProjectConnectionStyles(),
    bounds,
    globalVisible: true,
    documentScale: 1,
  };
  const near = projectConnectionsForExport({ ...input, cameraZoom: 0.1 } as typeof input);
  const far = projectConnectionsForExport({ ...input, cameraZoom: 10 } as typeof input);
  assert.deepEqual(near.primitives[0]?.metrics, far.primitives[0]?.metrics);
  assert.equal(near.primitives[0]?.metrics.lineWidth, 3);

  const sheet = projectConnectionsForExport({ ...input, documentScale: 2 });
  assert.equal(sheet.primitives[0]?.metrics.lineWidth, 6);
});

test("export annotations use current Type semantics, full canonical Body, and authored presentation without live LOD", () => {
  const styles = createDefaultProjectConnectionStyles();
  const projectTypeBase = createProjectRelationshipType({
    id: "rt_service",
    name: "Service Link",
    shortCode: "SRV",
    annotationDefaults: {
      title: { source: "relationship-type" },
      body: { source: "hidden" },
    },
  }, [], styles, 1);
  const projectType = {
    ...projectTypeBase,
    visualDefaults: {
      ...projectTypeBase.visualDefaults,
      annotationPresentation: {
        title: { fontSize: 16, fontWeight: 720, color: "#123456", opacity: 0.8 },
        body: { fontSize: 11, fontWeight: 430, color: "#654321", opacity: 0.7, lineHeight: 15 },
        placement: { pathPosition: 0.25, side: "b" as const, offset: 18, alignment: "right" as const, maxWidth: 180 },
        plate: { backgroundColor: "#f0eadc", backgroundOpacity: 0.75, cornerRadius: 9, paddingX: 8, paddingY: 6 },
      },
    },
  };
  const body = Array.from({ length: 32 }, (_, index) => `canonical-${index}`).join(" ");
  const typed = connection("typed", {
    semantic: semantic(projectType.id),
    annotation: { body: { source: "custom", text: body } },
  });
  const custom = connection("custom-title", {
    visual: { geometryId: "straight" },
    annotation: {
      title: { source: "custom", text: "Custom Title" },
      body: { source: "hidden" },
    },
  });
  const projected = projectConnectionsForExport({
    connections: [typed, custom],
    endpoints,
    styles,
    projectRelationshipTypes: [projectType],
    bounds,
    globalVisible: true,
  });
  const typedAnnotation = projected.annotations.find((item) => item.connectionId === "typed")!;
  assert.equal(typedAnnotation.title?.text, "Service Link");
  assert.equal(typedAnnotation.body?.text, body);
  assert.equal(typedAnnotation.lod, "full");
  assert.equal(typedAnnotation.presentation.title.fontSize, 16);
  assert.equal(typedAnnotation.presentation.placement.pathPosition, 0.25);
  assert.equal(typedAnnotation.presentation.placement.side, "b");
  assert.equal(typedAnnotation.presentation.placement.alignment, "right");
  assert.equal(typedAnnotation.presentation.plate.cornerRadius, 9);
  assert.equal(typedAnnotation.opacity, 1);
  assert.equal(
    projected.annotations.find((item) => item.connectionId === "custom-title")?.title?.text,
    "Custom Title",
  );

  const renamed = projectConnectionsForExport({
    connections: [typed],
    endpoints,
    styles,
    projectRelationshipTypes: [{ ...projectType, name: "Operations Link" }],
    bounds,
    globalVisible: true,
  });
  assert.equal(renamed.annotations[0]?.title?.text, "Operations Link");
});

test("visual visibility and enabled state are explicit while semantic rows retain disabled records", () => {
  const styles = createDefaultProjectConnectionStyles();
  const records = [
    connection("active"),
    connection("disabled", { enabled: false }),
    connection("locally-hidden", { visual: { visible: false } }),
  ];
  const hidden = projectConnectionsForExport({
    connections: records,
    endpoints,
    styles,
    bounds,
    globalVisible: false,
  });
  assert.equal(hidden.primitives.length, 0);
  assert.equal(hidden.metrics.omittedByGlobalVisibility, 3);

  const visible = projectConnectionsForExport({
    connections: records,
    endpoints,
    styles,
    bounds,
    globalVisible: true,
  });
  assert.deepEqual(visible.primitives.map(({ id }) => id), ["active"]);
  const rows = projectRelationshipRows({
    connections: records,
    spaces: [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }],
    styles,
    projectRelationshipTypes: [],
  });
  assert.equal(rows.length, 3);
  assert.equal(rows.find((row) => row.connectionId === "disabled")?.enabled, false);
});

test("2,400-record detached projection is deterministic, uncapped, and bounded without React or DOM", () => {
  const styles = createDefaultProjectConnectionStyles();
  const manyEndpoints = new Map<string, ConnectionEndpointGeometry>();
  const manyConnections = Array.from({ length: 2_400 }, (_, index) => {
    const sourceId = `source-${index}`;
    const targetId = `target-${index}`;
    const y = 20 + (index % 240) * 4;
    manyEndpoints.set(sourceId, { id: sourceId, x: 10, y, radius: 2 });
    manyEndpoints.set(targetId, { id: targetId, x: 590, y, radius: 2 });
    return connection(`bulk-${String(index).padStart(4, "0")}`, {
      fromSpaceId: sourceId,
      toSpaceId: targetId,
    });
  });
  const started = performance.now();
  const first = projectConnectionsForExport({
    connections: manyConnections,
    endpoints: manyEndpoints,
    styles,
    bounds: { x: 0, y: 0, width: 600, height: 1_000 },
    globalVisible: true,
  });
  const elapsedMs = performance.now() - started;
  const second = projectConnectionsForExport({
    connections: manyConnections,
    endpoints: manyEndpoints,
    styles,
    bounds: { x: 0, y: 0, width: 600, height: 1_000 },
    globalVisible: true,
  });
  assert.equal(first.primitives.length, 2_400);
  assert.deepEqual(first, second);
  assert.ok(elapsedMs < 2_000, `projection took ${elapsedMs.toFixed(1)}ms`);
});

test("Legend export consumes the pure projection and emits style/text work into caller-owned sheet bounds", () => {
  const styles = createDefaultProjectConnectionStyles();
  const types = getAllRelationshipTypes([], styles);
  const config = {
    ...createDefaultRelationshipLegendConfig(),
    layoutMode: "horizontal" as const,
    horizontalRows: 2,
    specimenLength: "long" as const,
    specimenWeight: "true" as const,
    textWidth: 140,
    textAlign: "right" as const,
    textPlacementX: "left" as const,
    textPlacementY: "bottom" as const,
    showCode: true,
    showDescription: true,
  };
  const projection = projectRelationshipLegend({
    types,
    connections: [connection("used", { semantic: semantic("adjacency") })],
    config,
    bounds: { width: 860, height: 300 },
  });
  const calls: string[] = [];
  const context = new Proxy({}, {
    get(target, property) {
      if (property in target) return Reflect.get(target, property);
      if (property === "measureText") return (text: string) => ({ width: text.length * 5 });
      return (..._args: unknown[]) => calls.push(String(property));
    },
    set(target, property, value) {
      Reflect.set(target, property, value);
      return true;
    },
  }) as CanvasRenderingContext2D;
  const work = renderRelationshipLegendForExport(projection, {
    context,
    config,
    x: 42,
    y: 64,
    width: 860,
    height: 300,
    theme: "day",
  });
  assert.equal(work.itemsRendered, projection.items.length);
  assert.ok(work.specimensRendered > 0);
  assert.ok(work.textCalls >= projection.items.length);
  assert.ok(calls.includes("fillText"));
  assert.ok(calls.includes("stroke"));
});

test("relationship CSV contains semantic columns and excludes renderer artifacts", () => {
  const styles = createDefaultProjectConnectionStyles();
  const rows = projectRelationshipRows({
    connections: [connection("csv", {
      annotation: {
        title: { source: "custom", text: "Door adjacency" },
        body: { source: "custom", text: "Full canonical body" },
      },
      visual: { strokePatternId: "wave" },
    })],
    spaces: [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }],
    styles,
    projectRelationshipTypes: [],
  });
  const csv = relationshipsToCsv(rows);
  assert.match(csv, /Connection ID,Source,Target,Type,Type Code,Enabled,Title,Body/);
  assert.match(csv, /csv,Alpha,Beta,Custom,CUS,true,Door adjacency,Full canonical body/);
  assert.doesNotMatch(csv, /sampled|path geometry|wrapped|window position/i);
});

test("Table and Matrix projections retain canonical IDs, dynamic Types, and multiple pair records", () => {
  const styles = createDefaultProjectConnectionStyles();
  const projectType = createProjectRelationshipType({
    id: "rt_access",
    name: "Secure Access",
    shortCode: "SEC",
    annotationDefaults: {
      title: { source: "relationship-type" },
      body: { source: "hidden" },
    },
  }, [], styles, 1);
  const records = [
    connection("first", { semantic: semantic(projectType.id) }),
    connection("second", {
      semantic: semantic("adjacency"),
      enabled: false,
      annotationPresentation: { placement: { offset: 24 } },
    }),
  ];
  const input = {
    connections: records,
    spaces: [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }],
    styles,
    projectRelationshipTypes: [projectType],
  };
  const rows = projectRelationshipRows(input);
  assert.deepEqual(rows.map((row) => row.connectionId), ["first", "second"]);
  assert.equal(rows[0]?.connection, records[0]);
  assert.equal(rows[0]?.typeName, "Secure Access");
  assert.equal(rows[0]?.typeCode, "SEC");
  assert.equal(rows[0]?.title, "Secure Access");
  assert.equal(rows[1]?.annotationOverride, true);

  const matrix = projectRelationshipMatrix(input);
  assert.deepEqual(matrix.rows.map((space) => space.id), ["a", "b"]);
  assert.deepEqual(matrix.columns.map((space) => space.id), ["a", "b"]);
  const cell = matrix.cells.find(
    (entry) => entry.rowSpaceId === "a" && entry.columnSpaceId === "b",
  )!;
  assert.deepEqual(cell.connectionIds, ["first", "second"]);
  assert.deepEqual(cell.relationships[0], rows[0]);
  assert.equal(cell.relationships[1]?.connection, records[1]);
});
