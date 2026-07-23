import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import {
  createProjectRelationshipType,
  type ProjectRelationshipType,
} from "./relationshipTypes";
import {
  cloneResolvedConnectionStyle,
  createDefaultProjectConnectionStyles,
  resolveConnectionStyle,
  type ResolvedConnectionStyle,
} from "./styles";
import { createDefaultConnectionFilterSpec } from "./filters";
import {
  createConnectionPathCache,
  projectConnections,
} from "../../canvas/connections/renderer";

const source = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  "utf8",
);

const cell = (id: string) => ({
  id,
  name: id === "a" ? "Kitchen" : "Dining",
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
    notes: "",
  },
  ...(visual ? { visual } : {}),
});

type StyleTarget =
  | { context: "relationship-type"; typeId: string }
  | { context: "connection-override"; connectionIds: string[] };

type StyleStore = {
  connections: Connection[];
  selectedConnectionIds: string[];
  primarySelectedConnectionId: string | null;
  openWidgets: string[];
  connectionStyleEditorTarget: StyleTarget | null;
  settings: {
    connectionStyles: ReturnType<typeof createDefaultProjectConnectionStyles>;
    projectRelationshipTypes: ProjectRelationshipType[];
  };
  transformUndoStack: unknown[];
  transformRedoStack: unknown[];
  connectionStyleClipboard: unknown;
  openConnectionStyleEditor(target: StyleTarget): boolean;
  commitConnectionStyleEditor(style: ResolvedConnectionStyle | null): boolean;
  closeWidget(id: string): void;
  copySelectedConnectionStyle(): boolean;
  selectConnection(id: string | null, additive?: boolean): void;
  undoSpaceTransform(): void;
  redoSpaceTransform(): void;
};

const setupStore = async ({
  connections,
  projectTypes = [],
}: {
  connections: Connection[];
  projectTypes?: ProjectRelationshipType[];
}) => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  useLab.setState({
    spaces: [cell("a"), cell("b")],
    connections,
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: connections[0] ? [connections[0].id] : [],
    primarySelectedConnectionId: connections[0]?.id ?? null,
    transformUndoStack: [],
    transformRedoStack: [],
    openWidgets: [],
    connectionStyleEditorTarget: null,
    connectionStyleEditorPreview: null,
    connectionStyleClipboard: null,
    settings: {
      ...current.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes: projectTypes,
    },
  } as never);
  return {
    useLab,
    state: () => useLab.getState() as unknown as StyleStore,
  };
};

test("one registry-owned universal panel exposes the full canonical visual grammar and shared preview", () => {
  const studio = source("../../ui/widgets/ConnectionStudioWidget.tsx");
  const registry = source("../../ui/panels/widgetRegistry.ts");
  const manager = source("../../ui/widgets/ConnectionsWidget.tsx");
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");

  assert.equal((registry.match(/id:\s*["']connection-studio["']/g) ?? []).length, 1);
  assert.match(studio, /RelationshipTypeStylePreview/);
  assert.match(studio, /CONNECTION_GEOMETRY_IDS/);
  assert.match(studio, /CONNECTION_STROKE_PATTERNS/);
  assert.match(studio, /CONNECTION_MARKER_IDS/);
  for (const label of ["Width", "Opacity", "Color", "Curve", "Line cap", "Line join", "Pattern scale", "Pattern amplitude", "Marker size", "Marker offset"]) {
    assert.match(studio, new RegExp(label, "i"));
  }
  assert.match(studio, /Apply/);
  assert.match(studio, /Cancel/);
  assert.match(studio, /Use Relationship Type Style/);
  assert.match(studio, /ANNOTATION/);
  assert.match(studio, /ConnectionAnnotationContentControls/);
  assert.match(manager, /Edit Style/);
  assert.match(inspector, /Edit Style/);
  assert.match(inspector, /RelationshipTypeStylePreview/);
  assert.match(inspector, /ConnectionMultiInspector[\s\S]*?Edit Style/);
});

test("editor target is explicit, validated, and remains fixed when Connection selection changes", async () => {
  const { state } = await setupStore({
    connections: [connection("first", "custom"), connection("second", "adjacency")],
  });
  assert.equal(typeof state().openConnectionStyleEditor, "function");
  assert.equal(state().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["first"] }), true);
  assert.deepEqual(state().connectionStyleEditorTarget, { context: "connection-override", connectionIds: ["first"] });
  assert.equal(state().openWidgets.includes("connection-studio"), true);
  state().selectConnection("second");
  assert.deepEqual(state().connectionStyleEditorTarget, { context: "connection-override", connectionIds: ["first"] });
  assert.equal(state().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["missing"] }), false);
  assert.deepEqual(state().connectionStyleEditorTarget, { context: "connection-override", connectionIds: ["first"] });
  state().closeWidget("connection-studio");
  assert.equal(state().connectionStyleEditorTarget, null);
  assert.equal(state().transformUndoStack.length, 0, "Cancel closes the local draft with zero history");
});

test("Connection Apply derives one minimal sparse override, preserves authored meaning, clipboard reads it, and Reset is one undoable transaction", async () => {
  const authored = connection("styled", "adjacency");
  authored.annotation = { title: { source: "custom", text: "Keep me" } };
  const { state } = await setupStore({ connections: [authored] });
  const identityBefore = {
    fromSpaceId: state().connections[0]?.fromSpaceId,
    toSpaceId: state().connections[0]?.toSpaceId,
    semantic: state().connections[0]?.semantic,
    annotation: state().connections[0]?.annotation,
  };
  const initial = resolveConnectionStyle(
    state().connections[0]!,
    state().settings.connectionStyles,
    state().settings.projectRelationshipTypes,
  );
  const draft = cloneResolvedConnectionStyle(initial);
  draft.geometryId = "curved";
  draft.strokePatternId = "dash-dot";
  draft.endMarkerId = "filled-arrow";
  draft.appearance.color = "#123456";
  draft.appearance.width = 99;
  draft.appearance.opacity = -1;

  assert.equal(state().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["styled"] }), true);
  assert.equal(state().commitConnectionStyleEditor(draft), true);
  assert.deepEqual(state().connections[0]?.visual, {
    geometryId: "curved",
    strokePatternId: "dash-dot",
    endMarkerId: "filled-arrow",
    appearance: { color: "#123456", width: 64, opacity: 0 },
  });
  assert.deepEqual({
    fromSpaceId: state().connections[0]?.fromSpaceId,
    toSpaceId: state().connections[0]?.toSpaceId,
    semantic: state().connections[0]?.semantic,
    annotation: state().connections[0]?.annotation,
  }, identityBefore);
  assert.equal(state().transformUndoStack.length, 1);
  assert.equal(state().copySelectedConnectionStyle(), true);
  assert.deepEqual(state().connectionStyleClipboard, {
    geometryId: "curved",
    strokePatternId: "dash-dot",
    lineCap: initial.lineCap,
    lineJoin: initial.lineJoin,
    startMarkerId: initial.startMarkerId,
    endMarkerId: "filled-arrow",
    appearance: { ...draft.appearance, width: 64, opacity: 0 },
    annotationAppearance: {
      title: { ...draft.annotationPresentation.title },
      body: { ...draft.annotationPresentation.body },
      plate: { ...draft.annotationPresentation.plate },
    },
  });

  assert.equal(state().commitConnectionStyleEditor(null), true);
  assert.equal(state().connections[0]?.visual, undefined);
  assert.equal(state().transformUndoStack.length, 2);
  state().undoSpaceTransform();
  assert.deepEqual(state().connections[0]?.visual, {
    geometryId: "curved",
    strokePatternId: "dash-dot",
    endMarkerId: "filled-arrow",
    appearance: { color: "#123456", width: 64, opacity: 0 },
  });
  state().redoSpaceTransform();
  assert.equal(state().connections[0]?.visual, undefined);
});

test("type-default Apply updates inheritors in one history entry while explicit local overrides remain", async () => {
  const baseStyles = createDefaultProjectConnectionStyles();
  const projectType = createProjectRelationshipType({
    id: "rt_patient_flow",
    name: "Patient Flow",
    shortCode: "PF",
  }, [], baseStyles, 1);
  const { state } = await setupStore({
    projectTypes: [projectType],
    connections: [
      connection("inheriting", projectType.id),
      connection("overridden", projectType.id, { appearance: { width: 7 } }),
    ],
  });
  const draft = cloneResolvedConnectionStyle(projectType.visualDefaults);
  draft.geometryId = "orthogonal";
  draft.strokePatternId = "segmented-bars";
  draft.appearance.color = "#654321";
  draft.appearance.width = 2.5;

  assert.equal(state().openConnectionStyleEditor({ context: "relationship-type", typeId: projectType.id }), true);
  assert.equal(state().commitConnectionStyleEditor(draft), true);
  assert.equal(state().transformUndoStack.length, 1);
  assert.equal(state().connections[0]?.visual, undefined);
  assert.deepEqual(state().connections[1]?.visual, { appearance: { width: 7 } });
  assert.deepEqual(
    resolveConnectionStyle(state().connections[0]!, state().settings.connectionStyles, state().settings.projectRelationshipTypes),
    draft,
  );
  assert.equal(
    resolveConnectionStyle(state().connections[1]!, state().settings.connectionStyles, state().settings.projectRelationshipTypes).appearance.width,
    7,
  );
  state().undoSpaceTransform();
  assert.deepEqual(state().settings.projectRelationshipTypes[0]?.visualDefaults, projectType.visualDefaults);

  const factoryDraft = cloneResolvedConnectionStyle(state().settings.connectionStyles.adjacency);
  factoryDraft.appearance.width = 4;
  assert.equal(state().openConnectionStyleEditor({ context: "relationship-type", typeId: "adjacency" }), true);
  assert.equal(state().commitConnectionStyleEditor(factoryDraft), true);
  assert.equal(state().settings.connectionStyles.adjacency.appearance.width, 4);
});

test("Canvas projection consumes project Relationship Type defaults through the canonical resolver", () => {
  const styles = createDefaultProjectConnectionStyles();
  const projectType = createProjectRelationshipType({
    id: "rt_service_route",
    name: "Service Route",
    shortCode: "SR",
    visualDefaults: {
      geometryId: "elbow",
      strokePatternId: "dotted",
      appearance: { color: "#336699", width: 3 },
    },
  }, [], styles, 2);
  const result = projectConnections({
    connections: [connection("route", projectType.id)],
    endpoints: new Map([
      ["a", { id: "a", x: 80, y: 120, radius: 20 }],
      ["b", { id: "b", x: 260, y: 120, radius: 20 }],
    ]),
    styles,
    projectRelationshipTypes: [projectType],
    filter: createDefaultConnectionFilterSpec(),
    viewport: { x: 0, y: 0, width: 400, height: 300 },
    selectedIds: new Set(),
    changedEndpointIds: new Set(),
    lod: "full",
    focusMode: "all",
  }, createConnectionPathCache());

  assert.equal(result.commands[0]?.style.geometryId, "elbow");
  assert.equal(result.commands[0]?.style.strokePatternId, "dotted");
  assert.equal(result.commands[0]?.style.appearance.color, "#336699");
  assert.equal(result.commands[0]?.style.appearance.width, 3);
});
