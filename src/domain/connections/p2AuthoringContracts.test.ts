import { strict as assert } from "node:assert";
import test from "node:test";
import type { Connection, ConnectionSemanticTypeId } from "../graph/types";
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

type AuthoringModule = {
  createConnectionAuthoringState?: () => unknown;
  reduceConnectionAuthoring?: (state: unknown, action: unknown) => unknown;
  isConnectionAuthoringActive?: (state: unknown) => boolean;
  isValidConnectionEndpoint?: (space: unknown) => boolean;
};

type AuthoringApi = {
  create: NonNullable<AuthoringModule["createConnectionAuthoringState"]>;
  reduce: NonNullable<AuthoringModule["reduceConnectionAuthoring"]>;
  active: NonNullable<AuthoringModule["isConnectionAuthoringActive"]>;
  validEndpoint: NonNullable<AuthoringModule["isValidConnectionEndpoint"]>;
};

const authoring = async () => {
  const module = await import("./model") as AuthoringModule;
  assert.equal(typeof module.createConnectionAuthoringState, "function", "authoring factory should exist");
  assert.equal(typeof module.reduceConnectionAuthoring, "function", "authoring reducer should exist");
  assert.equal(typeof module.isConnectionAuthoringActive, "function", "authoring activity selector should exist");
  assert.equal(typeof module.isValidConnectionEndpoint, "function", "endpoint policy should exist");
  return {
    create: module.createConnectionAuthoringState!,
    reduce: module.reduceConnectionAuthoring!,
    active: module.isConnectionAuthoringActive!,
    validEndpoint: module.isValidConnectionEndpoint!,
  } satisfies AuthoringApi;
};

test("Connection authoring follows the bounded source-preview-commit sequence", async () => {
  const { create, reduce, active } = await authoring();
  const idle = create();
  const choosing = reduce(idle, {
    type: "start",
    typeId: "direct-access",
    priorSelection: { selectedIds: ["cell-a"], primarySelectedId: "cell-a" },
  });
  assert.equal((choosing as { phase: string }).phase, "choosing-source");
  assert.equal(active(choosing), true);

  const source = reduce(choosing, { type: "choose-source", sourceId: "cell-a" });
  assert.equal((source as { phase: string }).phase, "source-chosen");
  const preview = reduce(source, { type: "preview-target", targetId: "cell-b" });
  assert.equal((preview as { phase: string }).phase, "target-preview");
  const commit = reduce(preview, { type: "commit", connectionId: "connection-1" });
  assert.equal((commit as { phase: string }).phase, "commit");
  assert.equal(active(commit), false);
});

test("Escape cancels every active Connection authoring state", async () => {
  const { create, reduce, active } = await authoring();
  const choosing = reduce(create(), {
    type: "start",
    typeId: "adjacency",
    priorSelection: { selectedIds: [], primarySelectedId: null },
  });
  const source = reduce(choosing, { type: "choose-source", sourceId: "cell-a" });
  const preview = reduce(source, { type: "preview-target", targetId: "cell-b" });
  const invalid = reduce(source, { type: "invalid-target", message: "Choose another Cell." });

  for (const state of [choosing, source, preview, invalid]) {
    assert.equal(active(state), true);
    const cancelled = reduce(state, { type: "cancel" });
    assert.equal((cancelled as { phase: string }).phase, "cancelled");
    assert.equal(active(cancelled), false);
  }
});

test("Connection authoring records invalid and duplicate outcomes without confusing them with a commit", async () => {
  const { create, reduce } = await authoring();
  const choosing = reduce(create(), {
    type: "start",
    typeId: "adjacency",
    priorSelection: { selectedIds: [], primarySelectedId: null },
  });
  const source = reduce(choosing, { type: "choose-source", sourceId: "cell-a" });
  const invalid = reduce(source, { type: "invalid-target", message: "A Cell cannot connect to itself." });
  assert.equal((invalid as { phase: string }).phase, "invalid-target");
  const duplicate = reduce(source, { type: "duplicate", targetId: "cell-b", connectionId: "connection-1" });
  assert.equal((duplicate as { phase: string }).phase, "existing-duplicate");
  assert.equal((duplicate as { existingConnectionId: string }).existingConnectionId, "connection-1");
});

test("Connection endpoint policy rejects Void, locked, hidden, deleted and missing endpoints", async () => {
  const { validEndpoint } = await authoring();
  assert.equal(validEndpoint({ id: "cell-a", kind: "space" }), true);
  assert.equal(validEndpoint({ id: "void-a", kind: "void" }), false);
  assert.equal(validEndpoint({ id: "cell-b", kind: "space", locked: true }), false);
  assert.equal(validEndpoint({ id: "cell-c", kind: "space", visible: false }), false);
  assert.equal(validEndpoint({ id: "cell-d", kind: "space", deleted: true }), false);
  assert.equal(validEndpoint(null), false);
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

type AuthoringResult = {
  status: "created" | "duplicate" | "invalid";
  connectionId: string | null;
};

interface P2StoreContract {
  spaces: SpaceCell[];
  connections: Connection[];
  selectedIds: string[];
  primarySelectedId: string | null;
  selectedId: string | null;
  selectedConnectionIds: string[];
  primarySelectedConnectionId: string | null;
  connectionAuthoring: { phase: string; sourceId: string | null; message: string };
  connectionModeActive: boolean;
  connectionModeTypeId: ConnectionSemanticTypeId;
  transformUndoStack: unknown[];
  transformRedoStack: unknown[];
  openWidgets: string[];
  view: "canvas" | "table";
  replaceSelection(id: string | null): void;
  addToSelection(id: string): void;
  selectConnection(id: string | null, additive?: boolean): void;
  clearConnectionSelection(): void;
  addSpace(partial?: Partial<SpaceCell>): void;
  beginConnectionAuthoring(typeId: ConnectionSemanticTypeId): void;
  chooseConnectionSource(id: string): boolean;
  completeConnectionAuthoring(id: string): AuthoringResult;
  cancelConnectionAuthoring(): void;
  connectSelectedCells(typeId: ConnectionSemanticTypeId): AuthoringResult;
  createConnection(input: { fromSpaceId: string; toSpaceId: string; typeId: ConnectionSemanticTypeId }): string | null;
  deleteConnection(id: string): boolean;
  updateConnectionSemantic(id: string, patch: Partial<Connection["semantic"]>): boolean;
  setView(view: "canvas" | "table"): void;
  undoSpaceTransform(): void;
  redoSpaceTransform(): void;
}

const connectionStore = async () => {
  const model = await import("./model");
  const { useLab } = await import("../../state/store");
  useLab.setState({
    view: "canvas",
    spaces: [cell("cell-a"), cell("cell-b"), cell("cell-c"), cell("void-1", "void")],
    connections: [],
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    connectionAuthoring: model.createConnectionAuthoringState(),
    connectionModeActive: false,
    connectionModeTypeId: "custom",
    transformUndoStack: [],
    transformRedoStack: [],
    openWidgets: [],
    minimizedWidgets: [],
    widgetLaunchRevisions: {},
  } as never);
  const state = () => useLab.getState() as unknown as P2StoreContract;
  assert.equal(typeof state().selectConnection, "function", "Connection selection action should exist");
  assert.equal(typeof state().beginConnectionAuthoring, "function", "authoring start action should exist");
  assert.equal(typeof state().completeConnectionAuthoring, "function", "authoring completion action should exist");
  assert.equal(typeof state().connectSelectedCells, "function", "Connect Selected action should exist");
  return { useLab, state };
};

test("Connection selection and Cell selection are mutually exclusive", async () => {
  const { state } = await connectionStore();
  const id = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  assert.ok(id);
  state().replaceSelection("cell-a");
  state().selectConnection(id);
  assert.deepEqual(state().selectedIds, []);
  assert.deepEqual(state().selectedConnectionIds, [id]);
  assert.equal(state().primarySelectedConnectionId, id);

  state().replaceSelection("cell-b");
  assert.deepEqual(state().selectedConnectionIds, []);
  assert.equal(state().primarySelectedConnectionId, null);
  assert.deepEqual(state().selectedIds, ["cell-b"]);

  state().selectConnection(id);
  state().addSpace({ name: "New Cell" });
  assert.deepEqual(state().selectedConnectionIds, []);
  assert.equal(state().primarySelectedConnectionId, null);
  assert.equal(state().selectedIds.length, 1);
});

test("Connection click and Shift-click reuse one toggleable history-free selection owner", async () => {
  const { state } = await connectionStore();
  const first = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  const second = state().createConnection({ fromSpaceId: "cell-b", toSpaceId: "cell-c", typeId: "direct-access" });
  const third = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-c", typeId: "visual-access" });
  assert.ok(first && second && third);
  const historyAfterCreate = state().transformUndoStack.length;

  state().selectConnection(first);
  assert.deepEqual(state().selectedConnectionIds, [first]);
  state().selectConnection(second, true);
  assert.deepEqual(state().selectedConnectionIds, [first, second]);
  state().selectConnection(third, true);
  assert.deepEqual(state().selectedConnectionIds, [first, second, third]);
  state().selectConnection(second, true);
  assert.deepEqual(state().selectedConnectionIds, [first, third]);
  assert.equal(state().primarySelectedConnectionId, third);
  assert.equal(state().transformUndoStack.length, historyAfterCreate);
});

test("Connect Selected creates one transaction, selects the result and permits a different semantic type", async () => {
  const { state } = await connectionStore();
  state().replaceSelection("cell-a");
  state().addToSelection("cell-b");
  const before = state().transformUndoStack.length;
  const created = state().connectSelectedCells("adjacency");
  assert.equal(created.status, "created");
  assert.ok(created.connectionId);
  assert.equal(state().connections.length, 1);
  assert.equal(state().transformUndoStack.length, before + 1);
  assert.deepEqual(state().selectedIds, []);
  assert.equal(state().primarySelectedConnectionId, created.connectionId);
  assert.equal(state().openWidgets.includes("inspector"), true);

  state().replaceSelection("cell-a");
  state().addToSelection("cell-b");
  const second = state().connectSelectedCells("direct-access");
  assert.equal(second.status, "created");
  assert.equal(state().connections.length, 2);
  assert.equal(state().transformUndoStack.length, before + 2);
});

test("an exact duplicate selects the existing Connection without history", async () => {
  const { state } = await connectionStore();
  state().replaceSelection("cell-a");
  state().addToSelection("cell-b");
  const created = state().connectSelectedCells("adjacency");
  const historyAfterCreate = state().transformUndoStack.length;

  state().replaceSelection("cell-b");
  state().addToSelection("cell-a");
  const duplicate = state().connectSelectedCells("adjacency");
  assert.equal(duplicate.status, "duplicate");
  assert.equal(duplicate.connectionId, created.connectionId);
  assert.equal(state().connections.length, 1);
  assert.equal(state().transformUndoStack.length, historyAfterCreate);
  assert.equal(state().primarySelectedConnectionId, created.connectionId);
  assert.equal(state().connectionAuthoring.phase, "mode-ready");
  assert.match(state().connectionAuthoring.message, /already exists/i);
});

test("manual authoring rejects self and Void targets and creates no preview or cancellation history", async () => {
  const { state } = await connectionStore();
  state().replaceSelection("cell-c");
  const historyBefore = state().transformUndoStack.length;
  const projectBefore = JSON.stringify({ spaces: state().spaces, connections: state().connections });
  state().beginConnectionAuthoring("adjacency");
  assert.equal(state().connectionAuthoring.phase, "mode-ready");
  assert.deepEqual(state().selectedIds, ["cell-c"]);
  assert.equal(state().chooseConnectionSource("cell-a"), true);
  assert.equal(state().connectionAuthoring.phase, "source-chosen");
  assert.equal(state().completeConnectionAuthoring("cell-a").status, "invalid");
  assert.equal(state().chooseConnectionSource("cell-a"), true);
  assert.equal(state().completeConnectionAuthoring("void-1").status, "invalid");
  assert.equal(JSON.stringify({ spaces: state().spaces, connections: state().connections }), projectBefore);
  assert.equal(state().transformUndoStack.length, historyBefore);
  state().cancelConnectionAuthoring();
  assert.equal(state().connectionAuthoring.phase, "idle");
  assert.equal(state().connectionModeActive, false);
  assert.deepEqual(state().selectedIds, ["cell-c"]);
  assert.equal(state().transformUndoStack.length, historyBefore);
});

test("Table activation cancels authoring and restores the prior Cell selection", async () => {
  const { state } = await connectionStore();
  state().replaceSelection("cell-a");
  state().beginConnectionAuthoring("direct-access");
  state().chooseConnectionSource("cell-b");
  state().setView("table");
  assert.equal(state().view, "table");
  assert.equal(state().connectionAuthoring.phase, "idle");
  assert.equal(state().connectionModeActive, false);
  assert.deepEqual(state().selectedIds, ["cell-a"]);
  assert.equal(state().connections.length, 0);
  assert.equal(state().transformUndoStack.length, 0);
});

test("deleting the selected Connection clears Connection selection and Undo never leaves a stale selection", async () => {
  const { state } = await connectionStore();
  const id = state().createConnection({ fromSpaceId: "cell-a", toSpaceId: "cell-b", typeId: "adjacency" });
  assert.ok(id);
  state().selectConnection(id);
  assert.equal(state().deleteConnection(id), true);
  assert.equal(state().primarySelectedConnectionId, null);
  assert.deepEqual(state().selectedConnectionIds, []);
  state().undoSpaceTransform();
  assert.equal(state().connections.length, 1);
  assert.equal(state().primarySelectedConnectionId, null);
  state().redoSpaceTransform();
  assert.equal(state().connections.length, 0);
  assert.equal(state().primarySelectedConnectionId, null);
});

test("the primary selected Connection selector returns only a live canonical record", async () => {
  const selectors = await import("./selectors") as Record<string, unknown>;
  const getPrimary = selectors.getPrimarySelectedConnection as ((connections: readonly Connection[], id: string | null) => Connection | null) | undefined;
  assert.equal(typeof getPrimary, "function", "primary Connection selector should exist");
  const connection: Connection = {
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
      notes: "",
    },
  };
  assert.equal(getPrimary?.([connection], "connection-1"), connection);
  assert.equal(getPrimary?.([connection], "missing"), null);
  assert.equal(getPrimary?.([connection], null), null);
});
