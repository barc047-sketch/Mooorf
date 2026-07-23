import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type {
  Connection,
  ConnectionAnnotationPresentationOverride,
} from "../graph/types";
import {
  clearConnectionAnnotationPlacementOverrides,
  createDefaultConnectionAnnotationPresentation,
  mergeConnectionAnnotationPresentationOverride,
  resolveConnectionAnnotationPresentation,
} from "./annotations";
import { resolveRelationshipType } from "./relationshipTypes";
import {
  createDefaultProjectConnectionStyles,
  resolveConnectionAnnotationPreview,
  resolveConnectionStylePreview,
} from "./styles";

const source = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  "utf8",
);

const connection = (
  id: string,
  typeId = "custom",
  patch: Partial<Connection> = {},
): Connection => ({
  id,
  fromSpaceId: "source",
  toSpaceId: "target",
  enabled: true,
  semantic: {
    typeId,
    requirement: "optional",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
  ...patch,
});

test("annotation presentation resolves Type defaults with sparse Connection overrides", () => {
  const defaults = createDefaultConnectionAnnotationPresentation();
  defaults.title.fontSize = 17;
  defaults.title.color = "#112233";
  defaults.body.lineHeight = 19;
  defaults.plate.cornerRadius = 0;
  defaults.placement.maxWidth = 280;

  const override: ConnectionAnnotationPresentationOverride = {
    title: { opacity: 0.62 },
    body: { color: "#445566" },
    placement: { pathPosition: 0.25, side: "a", offset: 44, alignment: "right" },
    plate: { backgroundColor: "#abcdef", backgroundOpacity: 0, paddingX: 12, paddingY: 12 },
  };
  const resolved = resolveConnectionAnnotationPresentation(defaults, override);

  assert.equal(resolved.title.fontSize, 17);
  assert.equal(resolved.title.color, "#112233");
  assert.equal(resolved.title.opacity, 0.62);
  assert.equal(resolved.body.lineHeight, 19);
  assert.equal(resolved.body.color, "#445566");
  assert.deepEqual(resolved.placement, {
    pathPosition: 0.25,
    side: "a",
    offset: 44,
    alignment: "right",
    maxWidth: 280,
  });
  assert.deepEqual(resolved.plate, {
    backgroundColor: "#abcdef",
    backgroundOpacity: 0,
    cornerRadius: 0,
    paddingX: 12,
    paddingY: 12,
  });
});

test("Reset Placement clears placement and plate only while sparse typography survives", () => {
  const override = mergeConnectionAnnotationPresentationOverride(undefined, {
    title: { fontSize: 22, fontWeight: 700 },
    body: { opacity: 0.7 },
    placement: { pathPosition: 0.75, side: "b", offset: 72, alignment: "left", maxWidth: 320 },
    plate: { backgroundColor: "#123456", backgroundOpacity: 0.4, cornerRadius: 0, paddingX: 4, paddingY: 4 },
  });
  const reset = clearConnectionAnnotationPlacementOverrides(override);

  assert.deepEqual(reset, {
    title: { fontSize: 22, fontWeight: 700 },
    body: { opacity: 0.7 },
  });
});

type R4BStore = {
  connections: Connection[];
  selectedConnectionIds: string[];
  transformUndoStack: unknown[];
  connectionStyleEditorPreview: unknown;
  settings: {
    connectionStyles: ReturnType<typeof createDefaultProjectConnectionStyles>;
    projectRelationshipTypes: [];
  };
  openConnectionStyleEditor(target: { context: "connection-override"; connectionIds: string[] }): boolean;
  previewConnectionStyleEditorAnnotationContent(patch: Connection["annotation"]): boolean;
  previewConnectionStyleEditorAnnotationPresentation(patch: ConnectionAnnotationPresentationOverride): boolean;
  commitConnectionStyleEditor(): boolean;
  cancelConnectionStyleEditor(): void;
  updateConnectionAnnotationPresentation(id: string, patch: ConnectionAnnotationPresentationOverride | null): boolean;
  copySelectedConnectionStyle(): boolean;
  pasteConnectionStyleToSelection(): number;
  selectConnection(id: string | null): void;
};

const setupStore = async (connections: Connection[]) => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  useLab.setState({
    spaces: [
      { id: "source", name: "Source", area: 30, category: "Shared", x: 0, y: 0 },
      { id: "target", name: "Target", area: 30, category: "Shared", x: 240, y: 0 },
    ],
    connections,
    selectedConnectionIds: connections[0] ? [connections[0].id] : [],
    primarySelectedConnectionId: connections[0]?.id ?? null,
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    transformUndoStack: [],
    transformRedoStack: [],
    connectionStyleClipboard: null,
    connectionStyleEditorTarget: null,
    connectionStyleEditorPreview: null,
    openWidgets: [],
    settings: {
      ...current.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes: [],
    },
  } as never);
  return {
    useLab,
    state: () => useLab.getState() as unknown as R4BStore,
  };
};

test("Studio previews canonical Title/Body and presentation, then Apply commits one transaction while Cancel commits none", async () => {
  const authored = connection("studio", "adjacency", {
    annotation: { title: { source: "relationship-type" } },
  });
  const { state } = await setupStore([authored]);
  assert.equal(state().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["studio"] }), true);
  assert.equal(state().previewConnectionStyleEditorAnnotationContent({
    title: { source: "custom", text: "Service route" },
    body: { source: "custom", text: "Shared access for staff." },
  }), true);
  assert.equal(state().previewConnectionStyleEditorAnnotationPresentation({
    title: { fontSize: 20, color: "#123456" },
    body: { lineHeight: 18 },
    plate: { cornerRadius: 0 },
  }), true);
  const preview = state().connectionStyleEditorPreview as Parameters<typeof resolveConnectionAnnotationPreview>[2];
  const type = resolveRelationshipType("adjacency", [], state().settings.connectionStyles);
  assert.equal(resolveConnectionAnnotationPreview(state().connections[0]!, type, preview).title.text, "Service route");
  assert.equal(resolveConnectionStylePreview(
    state().connections[0]!,
    state().settings.connectionStyles,
    [],
    preview,
  ).annotationPresentation.title.fontSize, 20);
  assert.deepEqual(state().connections[0]?.annotation, authored.annotation, "live preview does not write canonical content");
  assert.equal(state().transformUndoStack.length, 0);
  state().cancelConnectionStyleEditor();
  assert.deepEqual(state().connections[0]?.annotation, authored.annotation);
  assert.equal(state().transformUndoStack.length, 0);

  assert.equal(state().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["studio"] }), true);
  state().previewConnectionStyleEditorAnnotationContent({
    title: { source: "custom", text: "Service route" },
    body: { source: "custom", text: "Shared access for staff." },
  });
  state().previewConnectionStyleEditorAnnotationPresentation({
    title: { fontSize: 20, color: "#123456" },
    body: { lineHeight: 18 },
    plate: { cornerRadius: 0 },
  });
  assert.equal(state().commitConnectionStyleEditor(), true);
  assert.deepEqual(state().connections[0]?.annotation, {
    title: { source: "custom", text: "Service route" },
    body: { source: "custom", text: "Shared access for staff." },
  });
  assert.equal(state().connections[0]?.annotationPresentation?.title?.fontSize, 20);
  assert.equal(state().connections[0]?.annotationPresentation?.plate?.cornerRadius, 0);
  assert.equal(state().transformUndoStack.length, 1);
});

test("Inspector reset preserves canonical content and Style clipboard excludes content and placement", async () => {
  const sourceConnection = connection("copy", "custom", {
    annotation: {
      title: { source: "custom", text: "Do not copy" },
      body: { source: "custom", text: "Canonical content stays local." },
    },
    annotationPresentation: {
      title: { color: "#ff0000", fontSize: 24 },
      body: { color: "#00ff00" },
      placement: { pathPosition: 0.25, side: "a", offset: 80, alignment: "right", maxWidth: 340 },
      plate: { backgroundColor: "#0000ff", backgroundOpacity: 0.5, cornerRadius: 0, paddingX: 6, paddingY: 6 },
    },
  });
  const targetConnection = connection("paste", "adjacency", {
    annotation: { title: { source: "custom", text: "Keep target" } },
    annotationPresentation: {
      placement: { pathPosition: 0.75, side: "b", offset: 32, alignment: "left", maxWidth: 180 },
    },
  });
  const { state } = await setupStore([sourceConnection, targetConnection]);

  assert.equal(state().copySelectedConnectionStyle(), true);
  state().selectConnection("paste");
  assert.equal(state().pasteConnectionStyleToSelection(), 1);
  const pasted = state().connections.find((item) => item.id === "paste")!;
  assert.deepEqual(pasted.annotation, targetConnection.annotation);
  assert.deepEqual(pasted.annotationPresentation?.placement, targetConnection.annotationPresentation?.placement);
  assert.equal(pasted.annotationPresentation?.title?.color, "#ff0000");
  assert.equal(pasted.annotationPresentation?.body?.color, "#00ff00");
  assert.equal(pasted.annotationPresentation?.plate?.backgroundColor, "#0000ff");

  assert.equal(state().updateConnectionAnnotationPresentation(
    "paste",
    clearConnectionAnnotationPlacementOverrides(pasted.annotationPresentation) ?? null,
  ), true);
  const reset = state().connections.find((item) => item.id === "paste")!;
  assert.deepEqual(reset.annotation, targetConnection.annotation);
  assert.equal(reset.annotationPresentation?.placement, undefined);
  assert.equal(reset.annotationPresentation?.plate, undefined);
  assert.equal(reset.annotationPresentation?.title?.color, "#ff0000");
});

test("Studio, Inspector, and locked spec expose the bounded R4B authoring surfaces", () => {
  const studio = source("../../ui/widgets/ConnectionStudioWidget.tsx");
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  const shared = source("../../ui/widgets/ConnectionAnnotationControls.tsx");
  const spec = source("../../../docs/connections/MOOORF_CONNECTIONS_V1_LOCKED_MASTER_SPEC.md");

  assert.match(studio, /ANNOTATION/);
  assert.match(studio, /ConnectionAnnotationContentControls/);
  for (const label of ["Title size", "Title weight", "Title color", "Title opacity", "Body size", "Body weight", "Body color", "Body opacity", "Line height", "Background color", "Background opacity", "Corner radius", "Padding"]) {
    assert.match(studio, new RegExp(label, "i"));
  }
  assert.match(inspector, /PLACEMENT/);
  assert.match(inspector, /Start[\s\S]*Center[\s\S]*End/);
  assert.match(inspector, /Auto[\s\S]*Side A[\s\S]*Side B/);
  assert.match(inspector, /Offset/);
  assert.match(inspector, /Max Width/);
  assert.match(inspector, /Left[\s\S]*Center[\s\S]*Right/);
  assert.match(inspector, /Reset Placement/);
  assert.match(shared, /Title[\s\S]*Body/);
  assert.match(studio, /ConnectionAnnotationContentControls[\s\S]*enterApplies/);
  assert.match(spec, /Annotation Authoring in Universal Style Panel/);
  assert.match(spec, /Annotation Presentation/);
  assert.match(spec, /Horizontal Annotation and Shared Visual Scale Rule/);
});

test("annotations reuse the one canonical Connection Visual Scale setting without an annotation-only owner", () => {
  const store = source("../../state/store.ts");
  const graph = source("../graph/types.ts");
  const manager = source("../../ui/widgets/ConnectionsWidget.tsx");
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  const projection = source("../../canvas/connections/annotationProjection.ts");

  assert.match(store, /setConnectionVisualScaleMode:[\s\S]*visualScaleMode:\s*mode === "canvas" \? "canvas" : "screen"/);
  assert.match(manager, /connectionView\.visualScaleMode/);
  assert.match(organism, /visualScaleMode:\s*connectionVisualScaleMode[\s\S]*annotationMeasureText/);
  assert.match(projection, /resolveConnectionAnnotationVisualScale/);
  for (const owner of [store, graph, manager, organism, projection]) {
    assert.doesNotMatch(owner, /annotation(?:Visual)?ScaleMode|annotationScale(?:Mode)?/i);
  }
});
