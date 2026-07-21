import { strict as assert } from "node:assert";
import test from "node:test";
import type {
  Connection,
  ConnectionSemantic,
  ConnectionVisual,
  CreateConnectionInput,
} from "../graph/types";
import type { SpaceCell } from "../../types";

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

const connection = (overrides: Partial<Connection> = {}): Connection => ({
  id: "connection-1",
  fromSpaceId: "cell-a",
  toSpaceId: "cell-b",
  enabled: true,
  semantic: {
    typeId: "adjacency",
    requirement: "preferred",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "Near the public entry",
  },
  ...overrides,
});

const cell = (id: string, kind: "space" | "void" = "space"): SpaceCell => ({
  id,
  name: `Cell ${id}`,
  kind,
  area: 40,
  category: kind === "void" ? "Void" : "Uncategorized",
  privacy: "public",
  color: "",
  x: 0,
  y: 0,
});

interface ConnectionStoreContract {
  connections: Connection[];
  transformUndoStack: unknown[];
  transformRedoStack: unknown[];
  createConnection(input: CreateConnectionInput): string | null;
  updateConnectionSemantic(id: string, patch: Partial<ConnectionSemantic>): boolean;
  updateConnectionVisual(id: string, visual: ConnectionVisual | null): boolean;
  setConnectionEnabled(id: string, enabled: boolean): boolean;
  deleteConnection(id: string): boolean;
  getConnectionById(id: string): Connection | null;
  getConnectionsForSpace(spaceId: string): readonly Connection[];
  getConnectionsBetweenSpaces(firstSpaceId: string, secondSpaceId: string): readonly Connection[];
  removeSpace(id: string): void;
  undoSpaceTransform(): void;
  redoSpaceTransform(): void;
}

const connectionStore = async () => {
  const { useLab } = await import("../../state/store");
  useLab.setState({
    spaces: [cell("cell-a"), cell("cell-b"), cell("cell-c"), cell("void-1", "void")],
    connections: [],
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    transformUndoStack: [],
    transformRedoStack: [],
  } as never);
  return { useLab, state: () => useLab.getState() as unknown as ConnectionStoreContract };
};

test("Connections launch registries expose unique stable IDs", async () => {
  const registry = await import("./registry");

  assert.deepEqual(
    registry.CONNECTION_SEMANTIC_TYPE_IDS,
    [
      "custom",
      "adjacency",
      "direct-access",
      "visual-access",
      "shared-support",
      "circulation-flow",
      "separation",
    ],
  );
  assert.equal(new Set(registry.CONNECTION_SEMANTIC_TYPE_IDS).size, 7);
  assert.deepEqual(registry.CONNECTION_REQUIREMENTS, ["required", "preferred", "optional", "avoid"]);
  assert.deepEqual(registry.CONNECTION_DIRECTIONS, ["none", "two-way", "a-to-b", "b-to-a"]);
  assert.deepEqual(registry.CONNECTION_STRENGTHS, ["weak", "medium", "strong"]);
  assert.deepEqual(registry.CONNECTION_PRIORITIES, ["low", "normal", "high", "critical"]);

  for (const id of registry.CONNECTION_SEMANTIC_TYPE_IDS) {
    const definition = registry.resolveConnectionSemanticType(id);
    assert.equal(definition.id, id);
    assert.equal(definition.known, true);
    assert.ok(definition.name.length > 0);
    assert.ok(definition.description.length > 0);
    assert.ok(definition.tableCode.length > 0);
    assert.ok(definition.matrixCode.length > 0);
  }

  for (const ids of [
    registry.CONNECTION_GEOMETRY_IDS,
    registry.CONNECTION_STROKE_PATTERN_IDS,
    registry.CONNECTION_MARKER_IDS,
    registry.CONNECTION_ANCHOR_IDS,
  ]) {
    assert.equal(new Set(ids).size, ids.length);
  }
});

test("unknown future semantic IDs resolve safely without changing the authored ID", async () => {
  const { resolveConnectionSemanticType } = await import("./registry");
  const definition = resolveConnectionSemanticType("future-acoustic-link");

  assert.equal(definition.id, "future-acoustic-link");
  assert.equal(definition.known, false);
  assert.match(definition.name, /unknown/i);
});

test("Connection normalization rejects invalid endpoints and preserves future semantic IDs", async () => {
  const { normalizeConnectionCollection } = await import("./model");
  const future = connection({
    semantic: { ...connection().semantic, typeId: "future-acoustic-link" },
  });

  const normalized = normalizeConnectionCollection([future], new Set(["cell-a", "cell-b"]));
  assert.equal(normalized[0]?.semantic.typeId, "future-acoustic-link");
  assert.notEqual(normalized[0], future);

  assert.throws(
    () => normalizeConnectionCollection([connection({ toSpaceId: "missing" })], new Set(["cell-a", "cell-b"])),
    /endpoint/i,
  );
  assert.throws(
    () => normalizeConnectionCollection([connection({ toSpaceId: "cell-a" })], new Set(["cell-a", "cell-b"])),
    /different/i,
  );
  assert.throws(
    () => normalizeConnectionCollection([{
      ...connection(),
      semantic: { ...connection().semantic, requirement: "mandatory" },
    }], new Set(["cell-a", "cell-b"])),
    /requirement/i,
  );
});

test("endpoint and pair indexes support bounded Connection lookup", async () => {
  const selectors = await import("./selectors");
  const adjacency = connection();
  const access = connection({
    id: "connection-2",
    semantic: { ...connection().semantic, typeId: "direct-access" },
  });
  const elsewhere = connection({ id: "connection-3", fromSpaceId: "cell-b", toSpaceId: "cell-c" });
  const connections = [adjacency, access, elsewhere];
  const index = selectors.buildConnectionIndex(connections);

  assert.equal(selectors.getConnectionById(index, "connection-2")?.id, "connection-2");
  assert.deepEqual(selectors.getConnectionsForSpace(index, "cell-a").map((item) => item.id), ["connection-1", "connection-2"]);
  assert.deepEqual(selectors.getConnectionsBetweenSpaces(index, "cell-b", "cell-a").map((item) => item.id), ["connection-1", "connection-2"]);
  assert.equal(selectors.getConnectionsForSpace(index, "missing").length, 0);
  assert.equal(selectors.getConnectionIndex(connections), selectors.getConnectionIndex(connections));
  assert.notEqual(selectors.getConnectionIndex([...connections]), selectors.getConnectionIndex(connections));
});

test("exact semantic duplicates normalize pair orientation while different types remain valid", async () => {
  const selectors = await import("./selectors");
  const directed = connection({
    semantic: { ...connection().semantic, direction: "a-to-b" },
  });
  const index = selectors.buildConnectionIndex([directed]);
  const reversedEquivalent = connection({
    id: "candidate",
    fromSpaceId: "cell-b",
    toSpaceId: "cell-a",
    semantic: { ...directed.semantic, direction: "b-to-a" },
  });
  const differentType = connection({
    id: "candidate-2",
    semantic: { ...directed.semantic, typeId: "visual-access" },
  });
  const differentNotes = connection({
    id: "candidate-3",
    semantic: { ...directed.semantic, notes: "Different authored meaning" },
  });

  assert.equal(selectors.findExactConnectionDuplicate(index, reversedEquivalent)?.id, directed.id);
  assert.equal(selectors.findExactConnectionDuplicate(index, differentType), null);
  assert.equal(selectors.findExactConnectionDuplicate(index, differentNotes), null);
});

test("canonical store creates valid Connections and rejects invalid or exact duplicate semantics", async () => {
  const { state } = await connectionStore();
  const firstId = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  assert.ok(firstId);
  assert.equal(state().connections.length, 1);
  assert.equal(state().connections[0]?.semantic.requirement, "preferred");
  assert.equal(state().transformUndoStack.length, 1);

  assert.equal(state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "missing", typeId: "adjacency" }), null);
  assert.equal(state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-a", typeId: "adjacency" }), null);
  assert.equal(state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "void-1", typeId: "adjacency" }), null);
  assert.equal(state().createConnection({ fromSpaceId: "cell-b", toSpaceId: "cell-a", typeId: "adjacency" }), null);
  assert.equal(state().connections.length, 1);
  assert.equal(state().transformUndoStack.length, 1);

  const secondId = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "visual-access" });
  assert.ok(secondId);
  assert.equal(state().connections.length, 2);
  assert.equal(state().transformUndoStack.length, 2);
});

test("canonical store retrieves Connections by ID, Cell, and unordered pair", async () => {
  const { state } = await connectionStore();
  const firstId = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  const secondId = state().createConnection({ fromSpaceId: "cell-b", toSpaceId: "cell-c", typeId: "direct-access" });
  assert.ok(firstId && secondId);

  assert.equal(state().getConnectionById(firstId)?.id, firstId);
  assert.deepEqual(state().getConnectionsForSpace("cell-b").map((item) => item.id), [firstId, secondId]);
  assert.deepEqual(state().getConnectionsBetweenSpaces("cell-b", "cell-a").map((item) => item.id), [firstId]);
});

test("Connection update, visual configuration, enablement, and delete each create one Undo transaction", async () => {
  const { state } = await connectionStore();
  const id = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  assert.ok(id);

  const beforeUpdate = state().transformUndoStack.length;
  assert.equal(state().updateConnectionSemantic(id, { priority: "critical", notes: "Life safety route" }), true);
  assert.equal(state().transformUndoStack.length, beforeUpdate + 1);
  assert.equal(state().getConnectionById(id)?.semantic.priority, "critical");
  state().undoSpaceTransform();
  assert.equal(state().getConnectionById(id)?.semantic.priority, "normal");
  state().redoSpaceTransform();
  assert.equal(state().getConnectionById(id)?.semantic.priority, "critical");

  const visual: ConnectionVisual = {
    visible: true,
    geometryId: "curved",
    strokePatternId: "dashed",
    startMarkerId: "none",
    endMarkerId: "open-arrow",
    appearance: { color: "#7b2d26", width: 2, opacity: 0.8 },
  };
  const beforeVisual = state().transformUndoStack.length;
  assert.equal(state().updateConnectionVisual(id, visual), true);
  assert.equal(state().transformUndoStack.length, beforeVisual + 1);
  assert.equal(state().getConnectionById(id)?.visual?.geometryId, "curved");

  const beforeDisable = state().transformUndoStack.length;
  assert.equal(state().setConnectionEnabled(id, false), true);
  assert.equal(state().transformUndoStack.length, beforeDisable + 1);
  assert.equal(state().getConnectionById(id)?.enabled, false);

  const beforeDelete = state().transformUndoStack.length;
  assert.equal(state().deleteConnection(id), true);
  assert.equal(state().transformUndoStack.length, beforeDelete + 1);
  assert.equal(state().getConnectionById(id), null);
  state().undoSpaceTransform();
  assert.equal(state().getConnectionById(id)?.enabled, false);
  state().redoSpaceTransform();
  assert.equal(state().getConnectionById(id), null);
});

test("Cell deletion removes dependent Connections in one transaction and Undo restores both", async () => {
  const { useLab, state } = await connectionStore();
  const firstId = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  const secondId = state().createConnection({ fromSpaceId: "cell-b", toSpaceId: "cell-c", typeId: "direct-access" });
  assert.ok(firstId && secondId);
  useLab.setState({ transformUndoStack: [], transformRedoStack: [] });

  state().removeSpace("cell-b");
  assert.equal(useLab.getState().spaces.some((space) => space.id === "cell-b"), false);
  assert.equal(state().connections.length, 0);
  assert.equal(state().transformUndoStack.length, 1);

  state().undoSpaceTransform();
  assert.equal(useLab.getState().spaces.some((space) => space.id === "cell-b"), true);
  assert.deepEqual(state().connections.map((item) => item.id), [firstId, secondId]);
  assert.equal(state().transformRedoStack.length, 1);

  state().redoSpaceTransform();
  assert.equal(useLab.getState().spaces.some((space) => space.id === "cell-b"), false);
  assert.equal(state().connections.length, 0);
});

test("project JSON save/load preserves Connections and migrates old projects to an empty collection", async () => {
  const { useLab } = await connectionStore();
  const authored = connection({
    semantic: { ...connection().semantic, typeId: "future-acoustic-link" },
  });
  useLab.setState({ connections: [authored] } as never);
  const { buildCurrentProjectSnapshot } = await import("../../export/exportService");
  const { buildProjectEnvelope, parseProjectEnvelope } = await import("../../import/projectFiles");

  const snapshot = buildCurrentProjectSnapshot("Connections P1");
  assert.equal(snapshot.connections.length, 1);
  const parsed = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, [])));
  assert.equal(parsed.snapshot.connections[0]?.semantic.typeId, "future-acoustic-link");
  assert.equal(parsed.snapshot.connections[0]?.visual, undefined);

  const { connections: _connections, ...legacySnapshot } = snapshot;
  const migrated = parseProjectEnvelope(JSON.stringify(legacySnapshot));
  assert.deepEqual(migrated.snapshot.connections, []);

  assert.throws(
    () => parseProjectEnvelope(JSON.stringify({
      ...snapshot,
      connections: [connection({ toSpaceId: "missing" })],
    })),
    /endpoint/i,
  );
});

test("Saved Views and project transfer retain canonical Connections without keeping invalid endpoints", async () => {
  const { useLab, state } = await connectionStore();
  const id = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  assert.ok(id);
  useLab.setState({ savedViews: [] });

  const savedViewId = useLab.getState().saveCurrentView("With Connections");
  assert.ok(savedViewId);
  const savedView = useLab.getState().savedViews[0] as { connections?: Connection[] };
  assert.equal(savedView.connections?.[0]?.id, id);

  useLab.setState({ connections: [] } as never);
  useLab.getState().loadSavedView(savedViewId);
  assert.equal(state().connections[0]?.id, id);

  const transfer = await import("../../import/projectTransfer");
  const recovery = transfer.captureRecoverySnapshot() as ReturnType<typeof transfer.captureRecoverySnapshot> & { connections?: Connection[] };
  assert.equal(recovery.connections?.[0]?.id, id);

  transfer.applySpaceSchedule([cell("cell-a"), cell("cell-c")]);
  assert.deepEqual(state().connections, []);
  transfer.restoreRecoverySnapshot(recovery);
  assert.equal(state().connections[0]?.id, id);
});

test("the Master Graph root uses the canonical Connection collection", async () => {
  const { SAMPLE_PROJECT } = await import("../graph/sample-project");
  const { getConnectionCount, getSelectedSpaceStats } = await import("../graph/selectors");
  const project = SAMPLE_PROJECT as typeof SAMPLE_PROJECT & { connections?: Connection[]; relationships?: unknown[] };

  assert.ok(Array.isArray(project.connections));
  assert.equal(project.relationships, undefined);
  assert.equal(getConnectionCount(project), project.connections.length);
  assert.ok((getSelectedSpaceStats(project, "sp_g01")?.relationship_count ?? 0) > 0);
});
