import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import { createDefaultProjectConnectionStyles } from "./styles";
import { createDefaultConnectionFilterSpec } from "./filters";
import { createConnectionPathCache, projectConnections } from "../../canvas/connections/renderer";

const source = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  "utf8",
);

const cell = (id: string) => ({
  id,
  name: id,
  x: id === "a" ? 80 : 260,
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
    requirement: "optional",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: `${id} semantics`,
  },
  annotation: { title: { source: "custom", text: `${id} title` } },
  ...(visual ? { visual } : {}),
});

test("transient style preview resolves on Canvas without mutating canonical records", async () => {
  const styleModule = await import("./styles") as typeof import("./styles") & Record<string, unknown>;
  assert.equal(typeof styleModule.resolveConnectionStylePreview, "function");
  const styles = createDefaultProjectConnectionStyles();
  const authored = connection("one", "adjacency", { appearance: { color: "#123456" } });
  const preview = {
    context: "connection-override" as const,
    connectionIds: ["one"],
    patch: { strokePatternId: "dash-dot" as const, appearance: { width: 5 } },
  };
  const resolvePreview = styleModule.resolveConnectionStylePreview as (
    connection: Connection,
    styles: ReturnType<typeof createDefaultProjectConnectionStyles>,
    projectTypes: readonly [],
    transient: typeof preview,
  ) => import("./styles").ResolvedConnectionStyle;
  const resolved = resolvePreview(authored, styles, [], preview);
  assert.equal(resolved.strokePatternId, "dash-dot");
  assert.equal(resolved.appearance.width, 5);
  assert.equal(resolved.appearance.color, "#123456", "untouched local colour remains resolved");
  assert.deepEqual(authored.visual, { appearance: { color: "#123456" } }, "preview never mutates canonical data");
});

test("Relationship Type drafts paint inheriting Canvas lines live while local overrides still win and Cancel is history-free", async () => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  const inheriting = connection("inheriting", "adjacency");
  const overridden = connection("overridden", "adjacency", { appearance: { width: 9 } });
  useLab.setState({
    spaces: [cell("a"), cell("b")],
    connections: [inheriting, overridden],
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    transformUndoStack: [],
    transformRedoStack: [],
    openWidgets: [],
    connectionStyleEditorTarget: null,
    connectionStyleEditorPreview: null,
    settings: {
      ...current.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes: [],
    },
  } as never);
  const state = () => useLab.getState();
  assert.equal(state().openConnectionStyleEditor({ context: "relationship-type", typeId: "adjacency" }), true);
  assert.equal(state().previewConnectionStyleEditor({
    geometryId: "elbow",
    appearance: { color: "#abcdef", width: 4 },
  }), true);
  const projection = projectConnections({
    connections: state().connections,
    endpoints: new Map([
      ["a", { id: "a", x: 80, y: 120, radius: 20 }],
      ["b", { id: "b", x: 260, y: 120, radius: 20 }],
    ]),
    styles: state().settings.connectionStyles,
    projectRelationshipTypes: state().settings.projectRelationshipTypes,
    stylePreview: state().connectionStyleEditorPreview,
    filter: createDefaultConnectionFilterSpec(),
    viewport: { x: 0, y: 0, width: 400, height: 300 },
    selectedIds: new Set(),
    changedEndpointIds: new Set(),
    lod: "full",
    focusMode: "all",
  }, createConnectionPathCache());
  const inheritingCommand = projection.commands.find((command) => command.id === "inheriting");
  const overriddenCommand = projection.commands.find((command) => command.id === "overridden");
  assert.equal(inheritingCommand?.style.geometryId, "elbow");
  assert.equal(inheritingCommand?.style.appearance.color, "#abcdef");
  assert.equal(inheritingCommand?.style.appearance.width, 4);
  assert.equal(overriddenCommand?.style.appearance.width, 9, "local width remains above the draft type default");
  assert.equal(state().transformUndoStack.length, 0);
  assert.deepEqual(state().settings.connectionStyles, createDefaultProjectConnectionStyles());
  state().cancelConnectionStyleEditor();
  assert.equal(state().connectionStyleEditorPreview, null);
  assert.equal(state().transformUndoStack.length, 0);
});

test("multi style session is fixed, previews only touched fields, applies once, and undoes individual records", async () => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  const first = connection("first", "adjacency", { appearance: { color: "#aa0000", width: 2 } });
  const second = connection("second", "direct-access", { appearance: { color: "#0000aa", width: 7 } });
  useLab.setState({
    spaces: [cell("a"), cell("b")],
    connections: [first, second],
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: ["first", "second"],
    primarySelectedConnectionId: "second",
    transformUndoStack: [],
    transformRedoStack: [],
    openWidgets: [],
    connectionStyleEditorTarget: null,
    connectionStyleEditorPreview: null,
    settings: {
      ...current.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes: [],
    },
  } as never);
  const state = () => useLab.getState() as typeof useLab.getState extends () => infer T ? T & {
    openConnectionStyleEditor(target: { context: "connection-override"; connectionIds: string[] }): boolean;
    previewConnectionStyleEditor(patch: { strokePatternId: "dotted" }): boolean;
    commitConnectionStyleEditor(): boolean;
    cancelConnectionStyleEditor(): void;
  } : never;

  assert.equal(typeof state().previewConnectionStyleEditor, "function");
  assert.equal(state().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["first", "second"] }), true);
  assert.equal(state().previewConnectionStyleEditor({ strokePatternId: "dotted" }), true);
  assert.equal(state().transformUndoStack.length, 0);
  assert.deepEqual(state().connections, [first, second]);
  state().selectConnection("first");
  assert.deepEqual(state().connectionStyleEditorTarget, {
    context: "connection-override",
    connectionIds: ["first", "second"],
  });
  assert.equal(state().commitConnectionStyleEditor(), true);
  assert.equal(state().transformUndoStack.length, 1, "bulk Apply is one history entry total");
  assert.equal(state().connections[0]?.visual?.strokePatternId, "dotted");
  assert.equal(state().connections[1]?.visual?.strokePatternId, "dotted");
  assert.equal(state().connections[0]?.visual?.appearance?.color, "#aa0000");
  assert.equal(state().connections[1]?.visual?.appearance?.color, "#0000aa");
  assert.deepEqual(state().connections[0]?.visual, {
    strokePatternId: "dotted",
    appearance: { color: "#aa0000", width: 2 },
  });
  assert.deepEqual(state().connections[1]?.visual, {
    strokePatternId: "dotted",
    appearance: { color: "#0000aa", width: 7 },
  });
  assert.equal(state().connections[0]?.semantic.notes, "first semantics");
  assert.equal(state().connections[1]?.annotation?.title?.text, "second title");
  state().undoSpaceTransform();
  assert.deepEqual(state().connections, [first, second]);

  assert.equal(state().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["first", "second"] }), true);
  assert.equal(state().previewConnectionStyleEditor({ strokePatternId: "dotted" }), true);
  const historyBeforeCancel = state().transformUndoStack.length;
  state().cancelConnectionStyleEditor();
  assert.deepEqual(state().connections, [first, second]);
  assert.equal(state().transformUndoStack.length, historyBeforeCancel, "Cancel adds zero history");
});

test("Quick Rail type choice keeps authoring active and bulk-assigns selected Connections in one history entry", async () => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  const first = connection("first", "custom", { geometryId: "curved" });
  const second = connection("second", "direct-access", { appearance: { color: "#246810" } });
  useLab.setState({
    spaces: [cell("a"), cell("b")],
    connections: [first, second],
    selectedConnectionIds: ["first", "second"],
    primarySelectedConnectionId: "second",
    connectionModeActive: true,
    connectionModeTypeId: "custom",
    transformUndoStack: [],
    transformRedoStack: [],
    settings: {
      ...current.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes: [],
    },
  } as never);
  const state = () => useLab.getState() as typeof useLab.getState extends () => infer T ? T & {
    chooseConnectionQuickRailType(typeId: string): number;
  } : never;
  assert.equal(typeof state().chooseConnectionQuickRailType, "function");
  assert.equal(state().chooseConnectionQuickRailType("adjacency"), 2);
  assert.equal(state().connectionModeTypeId, "adjacency");
  assert.equal(state().connectionModeActive, true);
  assert.equal(state().transformUndoStack.length, 1);
  assert.equal(state().connections.every((item) => item.semantic.typeId === "adjacency"), true);
  assert.equal(state().connections[0]?.visual, undefined);
  assert.equal(state().connections[1]?.visual, undefined);
  assert.equal(state().connections[0]?.annotation?.title?.text, "first title");
  assert.equal(state().connections[1]?.annotation?.title?.text, "second title");
  state().undoSpaceTransform();
  assert.deepEqual(state().connections.map((item) => item.semantic.typeId), ["custom", "direct-access"]);
  assert.equal(state().connections[0]?.visual?.geometryId, "curved");
  assert.equal(state().connections[1]?.visual?.appearance?.color, "#246810");

  state().selectConnection("first");
  assert.equal(state().chooseConnectionQuickRailType("separation"), 1);
  assert.deepEqual(state().connections.map((item) => item.semantic.typeId), ["separation", "direct-access"]);
  assert.equal(state().transformUndoStack.length, 1);
  state().undoSpaceTransform();

  state().clearConnectionSelection();
  const historyBefore = state().transformUndoStack.length;
  assert.equal(state().chooseConnectionQuickRailType("separation"), 0);
  assert.equal(state().connectionModeTypeId, "separation");
  assert.equal(state().transformUndoStack.length, historyBefore);
});

test("style UI is icon-first and shared previews adapt without stretching motif metrics", () => {
  const studio = source("../../ui/widgets/ConnectionStudioWidget.tsx");
  const preview = source("../../ui/RelationshipTypePicker.tsx");
  const css = source("../../ui/widgets/widgets.css");
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  const quickRail = source("../../ui/ConnectionQuickRail.tsx");

  assert.match(studio, /ConnectionGeometrySpecimen/);
  assert.match(studio, /ConnectionStrokeSpecimen/);
  assert.match(studio, /ConnectionMarkerSpecimen/);
  assert.doesNotMatch(studio, /aria-label="Stroke pattern"[\s\S]{0,220}<select/);
  assert.doesNotMatch(studio, /aria-label="Start marker"[\s\S]{0,220}<select/);
  assert.match(preview, /ResizeObserver/);
  assert.match(preview, /data-specimen-length/);
  assert.doesNotMatch(preview, /preserveAspectRatio="none"/);
  assert.match(css, /\.relationship-type-preview\s*\{[^}]*width:\s*clamp\(145px,\s*100%,\s*240px\)/i);
  assert.doesNotMatch(css, /\.relationship-type-preview\s*\{[^}]*min-width:\s*132px/i);
  assert.match(inspector, /ConnectionMultiInspector[\s\S]*Edit Style/);
  assert.match(quickRail, /chooseConnectionQuickRailType/);
  assert.equal((quickRail.match(/recordRelationshipTypeUse\(nextTypeId\)/g) ?? []).length, 1);
});
