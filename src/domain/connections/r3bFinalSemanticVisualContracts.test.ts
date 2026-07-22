import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import {
  createConnectionPathCache,
  hitTestConnections,
  projectConnections,
} from "../../canvas/connections/renderer";
import { createDefaultConnectionFilterSpec } from "./filters";
import { createProjectRelationshipType } from "./relationshipTypes";
import { createDefaultProjectConnectionStyles, resolveConnectionStyle } from "./styles";
import {
  buildConnectionStrokeMotif,
  resolveConnectionStrokePattern,
} from "./strokePatterns";

const source = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  "utf8",
);

const cell = (id: string) => ({
  id,
  name: id,
  x: id === "a" ? 80 : 300,
  y: 120,
  area: 24,
  category: "Shared",
  kind: "space" as const,
});

const connection = (
  id: string,
  typeId: string,
  visual?: Connection["visual"],
): Connection => ({
  id,
  fromSpaceId: "a",
  toSpaceId: "b",
  enabled: true,
  semantic: {
    typeId,
    requirement: "preferred",
      direction: "a-to-b",
    strength: "strong",
    priority: "high",
    notes: `${id} semantic notes`,
  },
  annotation: {
    title: { source: "custom", text: `${id} title` },
    body: { source: "custom", text: `${id} body` },
  },
  ...(visual ? { visual } : {}),
});

const setupStore = async (connections: Connection[], projectRelationshipTypes: readonly unknown[] = []) => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  useLab.setState({
    spaces: [cell("a"), cell("b")],
    connections,
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: connections.map((item) => item.id),
    primarySelectedConnectionId: connections[connections.length - 1]?.id ?? null,
    transformUndoStack: [],
    transformRedoStack: [],
    connectionModeActive: true,
    connectionModeTypeId: "custom",
    settings: {
      ...current.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes,
    },
  } as never);
  return useLab;
};

test("explicit single-Connection type selection clears styling, preserves topology/content, and Undo restores both", async () => {
  const authored = connection("single", "adjacency", {
    geometryId: "curved",
    strokePatternId: "zigzag",
    lineCap: "round",
    startAnchorId: "left",
    endAnchorId: "right",
    appearance: { color: "#b4232f", width: 12, patternAmplitude: 9 },
  });
  const useLab = await setupStore([authored]);
  const before = structuredClone(useLab.getState().connections[0]!);

  assert.equal(useLab.getState().updateConnectionSemantic("single", { typeId: "direct-access" }), true);
  const changed = useLab.getState().connections[0]!;
  assert.equal(changed.semantic.typeId, "direct-access");
  assert.deepEqual(changed.visual, { startAnchorId: "left", endAnchorId: "right" });
  assert.equal(resolveConnectionStyle(
    changed,
    useLab.getState().settings.connectionStyles,
  ).appearance.color, useLab.getState().settings.connectionStyles["direct-access"].appearance.color);
  assert.deepEqual({
    id: changed.id,
    fromSpaceId: changed.fromSpaceId,
    toSpaceId: changed.toSpaceId,
    enabled: changed.enabled,
    requirement: changed.semantic.requirement,
    direction: changed.semantic.direction,
    strength: changed.semantic.strength,
    priority: changed.semantic.priority,
    notes: changed.semantic.notes,
    annotation: changed.annotation,
  }, {
    id: before.id,
    fromSpaceId: before.fromSpaceId,
    toSpaceId: before.toSpaceId,
    enabled: before.enabled,
    requirement: before.semantic.requirement,
    direction: before.semantic.direction,
    strength: before.semantic.strength,
    priority: before.semantic.priority,
    notes: before.semantic.notes,
    annotation: before.annotation,
  });
  assert.equal(useLab.getState().transformUndoStack.length, 1);
  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().connections[0], before);
  useLab.getState().redoSpaceTransform();
  assert.deepEqual(useLab.getState().connections[0]?.visual, { startAnchorId: "left", endAnchorId: "right" });
});

test("explicit multi-Connection and Quick Rail type selection clear each visual independently in one transaction", async () => {
  const first = connection("first", "adjacency", {
    startAnchorId: "top",
    appearance: { color: "#aa0000", width: 3 },
  });
  const second = connection("second", "direct-access", {
    endAnchorId: "bottom",
    strokePatternId: "dotted",
    appearance: { width: 22 },
  });
  const useLab = await setupStore([first, second]);

  assert.equal(useLab.getState().updateSelectedConnectionTypes("visual-access"), 2);
  assert.deepEqual(useLab.getState().connections.map((item) => item.visual), [
    { startAnchorId: "top" },
    { endAnchorId: "bottom" },
  ]);
  assert.equal(useLab.getState().transformUndoStack.length, 1);
  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().connections, [first, second]);

  assert.equal(useLab.getState().chooseConnectionQuickRailType("separation"), 2);
  assert.equal(useLab.getState().connectionModeTypeId, "separation");
  assert.deepEqual(useLab.getState().connections.map((item) => item.visual), [
    { startAnchorId: "top" },
    { endAnchorId: "bottom" },
  ]);
  assert.equal(useLab.getState().transformUndoStack.length, 1);
  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().connections, [first, second]);

  useLab.getState().clearConnectionSelection();
  const historyBefore = useLab.getState().transformUndoStack.length;
  assert.equal(useLab.getState().chooseConnectionQuickRailType("circulation-flow"), 0);
  assert.equal(useLab.getState().connectionModeTypeId, "circulation-flow");
  assert.equal(useLab.getState().transformUndoStack.length, historyBefore);
});

test("Relationship Manager retirement reassignment preserves bespoke local visuals", async () => {
  const styles = createDefaultProjectConnectionStyles();
  const projectType = createProjectRelationshipType({
    id: "rt_patient_flow",
    name: "Patient Flow",
    shortCode: "PF",
  }, [], styles, 1);
  const bespoke = connection("managed", projectType.id, {
    strokePatternId: "wave",
    startAnchorId: "left",
    appearance: { color: "#7a234f", width: 14 },
  });
  const useLab = await setupStore([bespoke], [projectType]);
  assert.equal(useLab.getState().setProjectRelationshipTypeArchived(projectType.id, true, "custom"), true);
  assert.equal(useLab.getState().connections[0]?.semantic.typeId, "custom");
  assert.deepEqual(useLab.getState().connections[0]?.visual, bespoke.visual);
  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().connections[0], bespoke);
});

test("Vertical Hash keeps its base while Vertical Hatch renders marks only with shared scale and amplitude", () => {
  const hash = resolveConnectionStrokePattern("vertical-hash");
  const hatch = resolveConnectionStrokePattern("vertical-hatch");
  assert.equal(hash.rendererStrategy, "vertical-hash");
  assert.equal(hatch.id, "vertical-hatch");
  assert.equal(hatch.name, "Vertical Hatch");
  assert.equal(hatch.rendererStrategy, "vertical-hatch");
  assert.equal(hatch.preview.strategy, hatch.rendererStrategy);

  const centerline = { kind: "polyline" as const, points: [{ x: 0, y: 15 }, { x: 180, y: 15 }] };
  const hashMotif = buildConnectionStrokeMotif(centerline, "vertical-hash", 1, 5);
  const hatchMotif = buildConnectionStrokeMotif(centerline, "vertical-hatch", 1, 5);
  assert.equal(hashMotif.paths.length, 1, "Vertical Hash retains the visible canonical base");
  assert.equal(hatchMotif.paths.length, 0, "Vertical Hatch hides the canonical base");
  assert.ok(hatchMotif.marks.length > 8);

  const sparse = buildConnectionStrokeMotif(centerline, "vertical-hatch", 2, 5);
  assert.ok(sparse.marks.length < hatchMotif.marks.length, "Pattern Scale changes spacing");
  const tall = buildConnectionStrokeMotif(centerline, "vertical-hatch", 1, 11);
  const markLength = (motif: typeof hatchMotif) => Math.hypot(
    motif.marks[0]!.to.x - motif.marks[0]!.from.x,
    motif.marks[0]!.to.y - motif.marks[0]!.from.y,
  );
  assert.ok(markLength(tall) > markLength(hatchMotif), "Pattern Amplitude changes hatch length");
});

test("Vertical Hatch uses the canonical Canvas path for projection and hit testing while previews share its registry strategy", () => {
  const styles = createDefaultProjectConnectionStyles();
  const authored = connection("hatch", "custom", {
    strokePatternId: "vertical-hatch",
    lineCap: "square",
    lineJoin: "bevel",
    appearance: { color: "#2456aa", width: 6, dashScale: 1.5, patternAmplitude: 8 },
  });
  const result = projectConnections({
    connections: [authored],
    endpoints: new Map([
      ["a", { id: "a", x: 80, y: 120, radius: 20 }],
      ["b", { id: "b", x: 300, y: 120, radius: 20 }],
    ]),
    styles,
    filter: createDefaultConnectionFilterSpec(),
    viewport: { x: 0, y: 0, width: 400, height: 300 },
    selectedIds: new Set(["hatch"]),
    changedEndpointIds: new Set(),
    lod: "full",
    focusMode: "all",
  }, createConnectionPathCache());
  const command = result.commands[0]!;
  assert.equal(command.style.strokePatternId, "vertical-hatch");
  assert.equal(command.style.appearance.color, "#2456aa");
  assert.equal(command.style.lineCap, "square");
  assert.equal(command.style.lineJoin, "bevel");
  const midpoint = command.path.points[Math.floor(command.path.points.length / 2)]!;
  assert.equal(hitTestConnections(result.hitIndex, midpoint, 6), "hatch");

  const previewSource = source("../../ui/RelationshipTypePicker.tsx");
  assert.match(previewSource, /buildConnectionStrokeMotif/);
  assert.match(previewSource, /definition\.family === "procedural"/);
  assert.match(previewSource, /motif\.paths\.length === 0[\s\S]{0,500}?markerStart/);
  assert.doesNotMatch(previewSource, /adaptive preview[^\n]*(toggle|checkbox)/i);
  assert.doesNotMatch(source("../../ui/widgets/ConnectionStudioWidget.tsx"), /Adaptive preview/);
});

test("selected Connections retain authored motifs without a thick neutral replacement overlay", () => {
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.doesNotMatch(organism, /selectedCommands\.map\(\(command\) => \(\{[\s\S]{0,700}?color:\s*accent/);
  assert.doesNotMatch(organism, /selectedCommands\.map\(\(command\) => \(\{[\s\S]{0,700}?width:\s*command\.style\.appearance\.width\s*\+\s*2/);
  assert.doesNotMatch(organism, /selectedCommands\.map\(\(command\) => \(\{[\s\S]{0,700}?drawConnectionBatch/);
  assert.match(organism, /CONNECTION_FOCUS_OPACITY|focusMode|command\.selected/);
  const renderer = source("../../canvas/connections/renderer.ts");
  assert.match(renderer, /focused:\s*1/);
  assert.match(renderer, /related:\s*0\.76/);
  assert.match(renderer, /contextual:\s*0\.44/);
});
