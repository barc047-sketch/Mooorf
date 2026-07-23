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

const cell = (id: string): SpaceCell => ({
  id,
  name: id,
  kind: "space",
  area: 40,
  category: "Uncategorized",
  privacy: "public",
  color: "",
  x: 0,
  y: 0,
});

type Result = { status: "created" | "duplicate" | "invalid"; connectionId: string | null };

interface V1AuthoringStore {
  spaces: SpaceCell[];
  connections: Connection[];
  connectionModeActive: boolean;
  connectionModeTypeId: ConnectionSemanticTypeId;
  connectionAuthoring: { phase: string; typeId: ConnectionSemanticTypeId; sourceId: string | null; message: string };
  settings: { connectionView: { visible: boolean; focusMode: string }; connectionStyles: unknown };
  view: "canvas" | "table";
  selectedConnectionIds: string[];
  primarySelectedConnectionId: string | null;
  transformUndoStack: unknown[];
  transformRedoStack: unknown[];
  enterConnectionMode(typeId?: ConnectionSemanticTypeId): void;
  exitConnectionMode(): void;
  toggleConnectionMode(): void;
  setConnectionModeType(typeId: ConnectionSemanticTypeId): void;
  cancelConnectionGesture(message?: string): void;
  chooseConnectionSource(id: string): boolean;
  completeConnectionAuthoring(id: string): Result;
  createConnection(input: { fromSpaceId: string; toSpaceId: string; typeId: ConnectionSemanticTypeId; visual?: Connection["visual"] }): string | null;
  selectConnection(id: string | null): void;
  setView(view: "canvas" | "table"): void;
}

const setup = async () => {
  const model = await import("./model");
  const { createDefaultConnectionViewSettings } = await import("./styles");
  const { useLab } = await import("../../state/store");
  useLab.setState({
    spaces: [cell("a"), cell("b"), cell("c")],
    connections: [],
    connectionModeActive: false,
    connectionModeTypeId: "custom",
    connectionAuthoring: model.createConnectionAuthoringState(),
    settings: {
      ...useLab.getState().settings,
      connectionView: { ...createDefaultConnectionViewSettings(), visible: false },
    },
    view: "canvas",
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    transformUndoStack: [],
    transformRedoStack: [],
    openWidgets: [],
    minimizedWidgets: [],
    widgetLaunchRevisions: {},
  } as never);
  return () => useLab.getState() as unknown as V1AuthoringStore;
};

test("one mode owner enters with Custom, forces visibility, changes type, toggles, and exits cleanly", async () => {
  const state = await setup();
  state().enterConnectionMode();
  assert.equal(state().connectionModeActive, true);
  assert.equal(state().connectionModeTypeId, "custom");
  assert.equal(state().connectionAuthoring.phase, "mode-ready");
  assert.equal(state().connectionAuthoring.message, "Connections shown for editing");
  assert.equal(state().settings.connectionView.visible, true);

  state().setConnectionModeType("direct-access");
  assert.equal(state().connectionModeTypeId, "direct-access");
  assert.equal(state().connectionAuthoring.typeId, "direct-access");
  state().toggleConnectionMode();
  assert.equal(state().connectionModeActive, false);
  assert.equal(state().connectionAuthoring.phase, "idle");
  state().toggleConnectionMode();
  assert.equal(state().connectionModeActive, true);
  assert.equal(state().connectionModeTypeId, "custom", "fresh entry activates Custom");
});

test("gesture cancellation keeps mode ready while Table activation exits it", async () => {
  const state = await setup();
  state().enterConnectionMode("adjacency");
  assert.equal(state().chooseConnectionSource("a"), true);
  state().cancelConnectionGesture();
  assert.equal(state().connectionModeActive, true);
  assert.equal(state().connectionAuthoring.phase, "mode-ready");
  assert.equal(state().connectionAuthoring.sourceId, null);
  assert.equal(state().connectionModeTypeId, "adjacency");
  state().setView("table");
  assert.equal(state().connectionModeActive, false);
  assert.equal(state().connectionAuthoring.phase, "idle");
  assert.equal(state().settings.connectionView.visible, true, "mode exit never hides permanent Connections");
});

test("success, duplicate, invalid, and empty cancellation keep repeated mode history bounded", async () => {
  const state = await setup();
  state().enterConnectionMode("adjacency");
  state().chooseConnectionSource("a");
  const first = state().completeConnectionAuthoring("b");
  assert.equal(first.status, "created");
  assert.equal(state().connections.length, 1);
  assert.deepEqual(
    state().connections[0]?.visual,
    { startAnchorId: "auto", endAnchorId: "auto" },
    "whole-Cell creation explicitly overrides any side-specific Type anchors",
  );
  assert.equal(state().transformUndoStack.length, 1);
  assert.equal(state().connectionModeActive, true);
  assert.equal(state().connectionAuthoring.phase, "mode-ready");
  assert.equal(state().primarySelectedConnectionId, first.connectionId);

  state().chooseConnectionSource("a");
  const duplicate = state().completeConnectionAuthoring("b");
  assert.equal(duplicate.status, "duplicate");
  assert.equal(state().connections.length, 1);
  assert.equal(state().transformUndoStack.length, 1);
  assert.match(state().connectionAuthoring.message, /already exists/i);

  state().setConnectionModeType("direct-access");
  state().chooseConnectionSource("a");
  const second = state().completeConnectionAuthoring("b");
  assert.equal(second.status, "created", "same pair with another semantic type is valid");
  assert.equal(state().connections.length, 2);
  assert.equal(state().transformUndoStack.length, 2);

  state().chooseConnectionSource("a");
  assert.equal(state().completeConnectionAuthoring("a").status, "invalid");
  assert.equal(state().transformUndoStack.length, 2);
  assert.equal(state().connectionAuthoring.phase, "mode-ready");
  state().cancelConnectionGesture("Choose a source Cell.");
  assert.equal(state().transformUndoStack.length, 2);
});

test("mode-only work preserves Connection selection, project styles, and sparse overrides", async () => {
  const state = await setup();
  const existingId = state().createConnection({
    fromSpaceId: "a",
    toSpaceId: "c",
    typeId: "custom",
    visual: { appearance: { width: 2 } },
  });
  assert.ok(existingId);
  state().selectConnection(existingId);
  const stylesBefore = JSON.stringify(state().settings.connectionStyles);
  const visualBefore = JSON.stringify(state().connections[0]?.visual);
  const historyBefore = state().transformUndoStack.length;

  state().enterConnectionMode();
  assert.equal(state().primarySelectedConnectionId, existingId);
  state().setConnectionModeType("separation");
  state().chooseConnectionSource("a");
  state().cancelConnectionGesture();
  assert.equal(state().primarySelectedConnectionId, existingId, "empty/cancel preserves Connection selection");
  state().exitConnectionMode();

  assert.equal(JSON.stringify(state().settings.connectionStyles), stylesBefore);
  assert.equal(JSON.stringify(state().connections[0]?.visual), visualBefore);
  assert.equal(state().transformUndoStack.length, historyBefore);
});

test("canonical recovery and schedule replacement reset unified mode atomically", async () => {
  const state = await setup();
  const transfer = await import("../../import/projectTransfer");
  const recovery = transfer.captureRecoverySnapshot();

  state().enterConnectionMode("adjacency");
  state().chooseConnectionSource("a");
  transfer.restoreRecoverySnapshot(recovery);
  assert.equal(state().connectionModeActive, false);
  assert.equal(state().connectionModeTypeId, "custom");
  assert.equal(state().connectionAuthoring.phase, "idle");

  state().enterConnectionMode("separation");
  state().chooseConnectionSource("a");
  transfer.applySpaceSchedule([cell("a"), cell("b"), cell("c")]);
  assert.equal(state().connectionModeActive, false);
  assert.equal(state().connectionModeTypeId, "custom");
  assert.equal(state().connectionAuthoring.phase, "idle");

  const { buildCurrentProjectSnapshot } = await import("../../export/exportService");
  const { buildProjectEnvelope } = await import("../../import/projectFiles");
  const project = buildProjectEnvelope(buildCurrentProjectSnapshot("Mode reset contract"), []);
  state().enterConnectionMode("direct-access");
  state().chooseConnectionSource("a");
  transfer.applyProjectFile(project);
  assert.equal(state().connectionModeActive, false);
  assert.equal(state().connectionModeTypeId, "custom");
  assert.equal(state().connectionAuthoring.phase, "idle");
});
