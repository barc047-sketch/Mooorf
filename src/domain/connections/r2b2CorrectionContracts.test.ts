import { strict as assert } from "node:assert";
import test from "node:test";
import type { Connection } from "../graph/types";
import type { SpaceCell } from "../../types";
import { createDefaultProjectConnectionStyles, resolveConnectionStyle } from "./styles";

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  },
});

const cell = (id: string): SpaceCell => ({
  id,
  name: `Cell ${id}`,
  kind: "space",
  area: 40,
  category: "Uncategorized",
  privacy: "public",
  color: "",
  x: 0,
  y: 0,
});

const connection = (id: string, fromSpaceId: string, toSpaceId: string, overrides: Partial<Connection> = {}): Connection => ({
  id,
  fromSpaceId,
  toSpaceId,
  enabled: true,
  semantic: {
    typeId: "adjacency",
    requirement: "preferred",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
  ...overrides,
});

type ClipboardAppearance = {
  geometryId: string;
  strokePatternId: string;
  startMarkerId: string;
  endMarkerId: string;
  appearance: Record<string, string | number>;
};

interface CorrectionStore {
  connections: Connection[];
  selectedConnectionIds: string[];
  primarySelectedConnectionId: string | null;
  connectionStyleClipboard: ClipboardAppearance | null;
  transformUndoStack: unknown[];
  transformRedoStack: unknown[];
  settings: {
    connectionStyles: ReturnType<typeof createDefaultProjectConnectionStyles>;
    projectRelationshipTypes: [];
  };
  selectConnection(id: string | null, additive?: boolean): void;
  deleteConnection(id: string): boolean;
  deleteSelectedConnections(): number;
  copySelectedConnectionStyle(): boolean;
  pasteConnectionStyleToSelection(): number;
  undoSpaceTransform(): void;
  redoSpaceTransform(): void;
}

const setup = async (connections: Connection[]) => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  const connectionStyles = createDefaultProjectConnectionStyles();
  useLab.setState({
    spaces: [cell("a"), cell("b"), cell("c"), cell("d")],
    connections,
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    connectionStyleClipboard: null,
    transformUndoStack: [],
    transformRedoStack: [],
    settings: {
      ...current.settings,
      connectionStyles,
      projectRelationshipTypes: [],
    },
  } as never);
  return {
    useLab,
    connectionStyles,
    state: () => useLab.getState() as unknown as CorrectionStore,
  };
};

test("Inspector Delete removes one selected canonical Connection in one undoable transaction", async () => {
  const { state } = await setup([connection("a-b", "a", "b")]);
  state().selectConnection("a-b");
  assert.equal(state().deleteConnection("a-b"), true);
  assert.equal(state().connections.length, 0);
  assert.equal(state().transformUndoStack.length, 1);
  state().undoSpaceTransform();
  assert.equal(state().connections[0]?.id, "a-b");
});

test("multi-delete removes the selected canonical set in one history transaction and Undo restores order", async () => {
  const { state } = await setup([
    connection("a-b", "a", "b"),
    connection("b-c", "b", "c"),
    connection("c-d", "c", "d"),
  ]);
  assert.equal(typeof state().deleteSelectedConnections, "function");
  state().selectConnection("a-b");
  state().selectConnection("b-c", true);
  state().selectConnection("c-d", true);
  assert.equal(state().deleteSelectedConnections(), 3);
  assert.deepEqual(state().connections, []);
  assert.equal(state().transformUndoStack.length, 1);
  state().undoSpaceTransform();
  assert.deepEqual(state().connections.map((item) => item.id), ["a-b", "b-c", "c-d"]);
  state().redoSpaceTransform();
  assert.deepEqual(state().connections, []);
});

test("style Copy captures one resolved source without history and survives selection changes", async () => {
  const source = connection("source", "a", "b", {
    semantic: { ...connection("source", "a", "b").semantic, typeId: "direct-access" },
    visual: { appearance: { color: "#123456", width: 3, opacity: 0.57 } },
  });
  const { state } = await setup([source, connection("target-b", "b", "c"), connection("target-c", "c", "d")]);
  assert.equal(typeof state().copySelectedConnectionStyle, "function");
  state().selectConnection("source");
  assert.equal(state().copySelectedConnectionStyle(), true);
  assert.equal(state().transformUndoStack.length, 0);
  const copied = structuredClone(state().connectionStyleClipboard);
  assert.ok(copied);

  state().selectConnection("target-b");
  state().selectConnection("target-c", true);
  assert.deepEqual(state().connectionStyleClipboard, copied);
  assert.equal(state().copySelectedConnectionStyle(), false);
  assert.deepEqual(state().connectionStyleClipboard, copied);
  assert.equal(state().transformUndoStack.length, 0);
});

test("one Paste applies resolved appearance sparsely to one target and leaves identity and authored meaning unchanged", async () => {
  const source = connection("source", "a", "b", {
    semantic: { ...connection("source", "a", "b").semantic, typeId: "direct-access", notes: "source notes" },
    visual: {
      visible: true,
      startAnchorId: "top",
      endAnchorId: "right",
      label: { content: "custom", text: "Source visual label" },
      appearance: { color: "#123456", width: 3, opacity: 0.57 },
    },
    annotation: { title: { source: "custom", text: "Source title" } },
  });
  const target = connection("target", "b", "c", {
    enabled: false,
    semantic: { ...connection("target", "b", "c").semantic, typeId: "direct-access", notes: "target notes" },
    visual: {
      visible: false,
      startAnchorId: "left",
      endAnchorId: "bottom",
      label: { content: "custom", text: "Target visual label" },
    },
    annotation: {
      title: { source: "custom", text: "Target title" },
      body: { source: "custom", text: "Target body" },
    },
  });
  const { state, connectionStyles } = await setup([source, target]);
  const beforeTarget = structuredClone(target);
  state().selectConnection("source");
  state().copySelectedConnectionStyle();
  state().selectConnection("target");
  assert.equal(state().pasteConnectionStyleToSelection(), 1);
  assert.equal(state().transformUndoStack.length, 1);

  const pasted = state().connections.find((item) => item.id === "target")!;
  const sourceStyle = resolveConnectionStyle(source, connectionStyles);
  const pastedStyle = resolveConnectionStyle(pasted, connectionStyles);
  assert.deepEqual({
    geometryId: pastedStyle.geometryId,
    strokePatternId: pastedStyle.strokePatternId,
    startMarkerId: pastedStyle.startMarkerId,
    endMarkerId: pastedStyle.endMarkerId,
    appearance: pastedStyle.appearance,
  }, {
    geometryId: sourceStyle.geometryId,
    strokePatternId: sourceStyle.strokePatternId,
    startMarkerId: sourceStyle.startMarkerId,
    endMarkerId: sourceStyle.endMarkerId,
    appearance: sourceStyle.appearance,
  });
  assert.equal(pasted.visual?.geometryId, undefined, "source default geometry must stay inherited");
  assert.equal(pasted.visual?.strokePatternId, undefined, "source default pattern must stay inherited");
  assert.equal(pasted.visual?.startMarkerId, undefined, "source default start marker must stay inherited");
  assert.equal(pasted.visual?.endMarkerId, undefined, "source default end marker must stay inherited");
  assert.equal(pasted.visual?.visible, false);
  assert.equal(pasted.visual?.startAnchorId, "left");
  assert.equal(pasted.visual?.endAnchorId, "bottom");
  assert.equal(pasted.visual?.label?.text, "Target visual label");
  assert.equal(pasted.enabled, beforeTarget.enabled);
  assert.equal(pasted.fromSpaceId, beforeTarget.fromSpaceId);
  assert.equal(pasted.toSpaceId, beforeTarget.toSpaceId);
  assert.deepEqual(pasted.semantic, beforeTarget.semantic);
  assert.deepEqual(pasted.annotation, beforeTarget.annotation);
});

test("multi-target Paste is one transaction and Undo/Redo restores every sparse target override together", async () => {
  const source = connection("source", "a", "b", {
    semantic: { ...connection("source", "a", "b").semantic, typeId: "direct-access" },
    visual: { appearance: { color: "#6b3fa0", width: 4, opacity: 0.71 } },
  });
  const firstTarget = connection("target-b", "b", "c", {
    visual: { visible: false, startAnchorId: "left", appearance: { width: 2 } },
    annotation: { title: { source: "custom", text: "B title" } },
  });
  const secondTarget = connection("target-c", "c", "d", {
    semantic: { ...connection("target-c", "c", "d").semantic, typeId: "visual-access", priority: "critical" },
    visual: { endAnchorId: "bottom", appearance: { color: "#abcdef" } },
    annotation: { body: { source: "custom", text: "C body" } },
  });
  const { state, connectionStyles } = await setup([source, firstTarget, secondTarget]);
  const before = structuredClone([firstTarget, secondTarget]);
  state().selectConnection("source");
  state().copySelectedConnectionStyle();
  state().selectConnection("target-b");
  state().selectConnection("target-c", true);
  assert.equal(state().pasteConnectionStyleToSelection(), 2);
  assert.equal(state().transformUndoStack.length, 1);
  assert.deepEqual(state().selectedConnectionIds, ["target-b", "target-c"]);

  const sourceStyle = resolveConnectionStyle(source, connectionStyles);
  for (const id of ["target-b", "target-c"]) {
    const target = state().connections.find((item) => item.id === id)!;
    const targetStyle = resolveConnectionStyle(target, connectionStyles);
    assert.deepEqual({
      geometryId: targetStyle.geometryId,
      strokePatternId: targetStyle.strokePatternId,
      startMarkerId: targetStyle.startMarkerId,
      endMarkerId: targetStyle.endMarkerId,
      appearance: targetStyle.appearance,
    }, {
      geometryId: sourceStyle.geometryId,
      strokePatternId: sourceStyle.strokePatternId,
      startMarkerId: sourceStyle.startMarkerId,
      endMarkerId: sourceStyle.endMarkerId,
      appearance: sourceStyle.appearance,
    });
  }
  assert.equal(state().connections.find((item) => item.id === "target-b")?.visual?.visible, false);
  assert.equal(state().connections.find((item) => item.id === "target-b")?.visual?.startAnchorId, "left");
  assert.equal(state().connections.find((item) => item.id === "target-c")?.visual?.endAnchorId, "bottom");
  assert.deepEqual(state().connections.find((item) => item.id === "target-b")?.annotation, firstTarget.annotation);
  assert.deepEqual(state().connections.find((item) => item.id === "target-c")?.annotation, secondTarget.annotation);

  state().undoSpaceTransform();
  assert.deepEqual(state().connections.filter((item) => item.id !== "source"), before);
  state().redoSpaceTransform();
  assert.equal(resolveConnectionStyle(state().connections.find((item) => item.id === "target-b")!, connectionStyles).appearance.width, 4);
  assert.equal(resolveConnectionStyle(state().connections.find((item) => item.id === "target-c")!, connectionStyles).appearance.width, 4);
});
