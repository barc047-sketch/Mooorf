import { strict as assert } from "node:assert";
import test from "node:test";
import type { Connection } from "../graph/types";
import type { SavedCanvasSnapshot, SpaceCell } from "../../types";

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
    typeId: "custom",
    requirement: "optional",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
  ...overrides,
});

test("V1 launches Custom first and keeps future semantic IDs open", async () => {
  const registry = await import("./registry");
  const model = await import("./model");

  assert.equal(registry.CONNECTION_SEMANTIC_TYPE_IDS.length, 7);
  assert.equal(registry.CONNECTION_SEMANTIC_TYPE_IDS[0], "custom");
  assert.equal(registry.resolveConnectionSemanticType("custom").tableCode, "CUS");
  assert.equal(registry.resolveConnectionSemanticType("custom").matrixCode, "CUS");
  assert.equal(registry.resolveConnectionSemanticType("visual-access").name, "Visual Link");
  assert.equal(model.createConnectionAuthoringState().typeId, "custom");

  const normalized = model.normalizeConnectionCollection([
    connection({
      semantic: {
        ...connection().semantic,
        typeId: "future-acoustic-link",
      },
    }),
  ], new Set(["cell-a", "cell-b"]));
  assert.equal(normalized[0]?.semantic.typeId, "future-acoustic-link");
});

test("Connection visual normalization preserves only authored sparse overrides", async () => {
  const { cloneConnection, normalizeConnectionVisual } = await import("./model");

  assert.deepEqual(normalizeConnectionVisual({ appearance: { width: 2 } }), {
    appearance: { width: 2 },
  });
  assert.equal(normalizeConnectionVisual({}), undefined);
  assert.deepEqual(normalizeConnectionVisual({
    visible: false,
    geometryId: "future-spline",
    startAnchorId: "future-anchor",
    label: { content: "custom", text: "Short link", offsetPx: 12 },
    appearance: { color: "#123456", curve: 0.4, markerSize: 9, dashScale: 1.5 },
  }), {
    visible: false,
    geometryId: "future-spline",
    startAnchorId: "future-anchor",
    label: { content: "custom", text: "Short link", offsetPx: 12 },
    appearance: { color: "#123456", curve: 0.4, markerSize: 9, dashScale: 1.5 },
  });

  const original = connection({
    visual: {
      appearance: { width: 2 },
      label: { text: "Clone me" },
    },
  });
  const clone = cloneConnection(original);
  assert.notEqual(clone.visual, original.visual);
  assert.notEqual(clone.visual?.appearance, original.visual?.appearance);
  assert.notEqual(clone.visual?.label, original.visual?.label);
});

test("project type styles resolve inheritance, sparse overrides, packs, and unknown types", async () => {
  const styles = await import("./styles");
  const defaults = styles.createDefaultProjectConnectionStyles();

  assert.deepEqual(Object.keys(defaults), [
    "custom",
    "adjacency",
    "direct-access",
    "visual-access",
    "shared-support",
    "circulation-flow",
    "separation",
  ]);
  assert.equal(styles.CONNECTION_STYLE_PACK_IDS.length, 5);
  assert.deepEqual(styles.CONNECTION_STYLE_PACK_IDS, [
    "minimal",
    "technical",
    "presentation",
    "monochrome",
    "high-contrast",
  ]);

  const inherited = styles.resolveConnectionStyle(connection(), defaults);
  assert.equal(inherited.geometryId, defaults.custom.geometryId);
  assert.equal(inherited.label.content, "hidden");
  const locallyOverridden = styles.resolveConnectionStyle(connection({
    visual: { geometryId: "elbow", appearance: { width: 3 } },
  }), defaults);
  assert.equal(locallyOverridden.geometryId, "elbow");
  assert.equal(locallyOverridden.appearance.width, 3);
  assert.equal(locallyOverridden.appearance.opacity, defaults.custom.appearance.opacity);

  const future = styles.resolveConnectionStyle(connection({
    semantic: { ...connection().semantic, typeId: "future-acoustic-link" },
  }), defaults);
  assert.deepEqual(future, defaults.custom);

  for (const packId of styles.CONNECTION_STYLE_PACK_IDS) {
    const packed = styles.applyConnectionStylePack(defaults, packId);
    assert.equal(Object.keys(packed).length, 7);
    for (const style of Object.values(packed)) {
      assert.equal(typeof style.visible, "boolean");
      assert.ok(style.geometryId);
      assert.ok(style.strokePatternId);
      assert.ok(style.startAnchorId);
      assert.ok(style.endAnchorId);
      assert.ok(Number.isFinite(style.appearance.width));
    }
    assert.deepEqual(
      styles.applyConnectionStylePack(packed, packId),
      packed,
      `${packId} should be an idempotent preset`,
    );
  }
});

test("shared filters use one semantic projection without duplicating records", async () => {
  const { createDefaultConnectionFilterSpec, filterConnections } = await import("./filters");
  const cellsById = new Map([
    ["cell-a", { id: "cell-a", name: "Lobby", floorId: "ground" }],
    ["cell-b", { id: "cell-b", name: "Studio", floorId: "level-1" }],
    ["cell-c", { id: "cell-c", name: "Storage", floorId: "level-1" }],
  ]);
  const connections = [
    connection({ id: "custom-cross", visual: { appearance: { width: 2 } } }),
    connection({
      id: "access",
      fromSpaceId: "cell-b",
      toSpaceId: "cell-c",
      semantic: {
        ...connection().semantic,
        typeId: "direct-access",
        requirement: "required",
        direction: "two-way",
        strength: "strong",
        priority: "high",
        notes: "Service route",
      },
    }),
    connection({
      id: "future",
      fromSpaceId: "cell-a",
      toSpaceId: "cell-c",
      enabled: false,
      semantic: { ...connection().semantic, typeId: "future-acoustic-link", notes: "Quiet" },
    }),
  ];

  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), search: "service" },
  }).map((item) => item.id), ["access"]);
  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), crossFloorOnly: true },
  }).map((item) => item.id), ["custom-cross", "future"]);
  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), customOnly: true },
  }).map((item) => item.id), ["custom-cross"]);
  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), localOverrideOnly: true },
  }).map((item) => item.id), ["custom-cross"]);
  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), activeState: "inactive" },
  }).map((item) => item.id), ["future"]);
  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), typeIds: ["direct-access"] },
  }).map((item) => item.id), ["access"]);
  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), floorIds: ["ground"] },
  }).map((item) => item.id), ["custom-cross", "future"]);
  assert.deepEqual(filterConnections({
    connections,
    cellsById,
    spec: { ...createDefaultConnectionFilterSpec(), selectedCellIds: ["cell-c"] },
  }).map((item) => item.id), ["access", "future"]);
});

test("future pair projections retain multiple canonical records, codes, and direction", async () => {
  const selectors = await import("./selectors");
  const connections = [
    connection({ id: "adjacency", semantic: { ...connection().semantic, typeId: "adjacency" } }),
    connection({
      id: "access",
      semantic: { ...connection().semantic, typeId: "direct-access", direction: "a-to-b" },
    }),
    connection({
      id: "reverse-flow",
      fromSpaceId: "cell-b",
      toSpaceId: "cell-a",
      semantic: { ...connection().semantic, typeId: "circulation-flow", direction: "a-to-b" },
    }),
  ];
  const rows = selectors.projectConnectionPairs(connections);

  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0]?.connectionIds, ["adjacency", "access", "reverse-flow"]);
  assert.deepEqual(rows[0]?.tableCodes, ["ADJ", "ACC", "FLOW"]);
  assert.deepEqual(rows[0]?.matrixCodes, ["ADJ", "ACC", "FLOW"]);
  assert.deepEqual(rows[0]?.directions, ["none", "a-to-b", "b-to-a"]);
  assert.deepEqual(selectors.selectConnectionIdsForPair(rows[0]), ["adjacency", "access", "reverse-flow"]);
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

test("Connection and style history stores only changed indexed records", async () => {
  const { useLab } = await import("../../state/store");
  const filler = Array.from({ length: 250 }, (_, index) => connection({
    id: `filler-${index}`,
    semantic: { ...connection().semantic, notes: `untouched-${index}` },
  }));
  const target = connection({ id: "target" });
  useLab.setState({
    spaces: [cell("cell-a"), cell("cell-b")],
    connections: [target, ...filler],
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    transformUndoStack: [],
    transformRedoStack: [],
  } as never);

  const state = () => useLab.getState() as unknown as {
    connections: Connection[];
    settings: {
      connectionStyles: Record<string, { appearance: { width: number } }>;
    };
    transformUndoStack: Array<Record<string, unknown>>;
    transformRedoStack: Array<Record<string, unknown>>;
    updateConnectionVisual(id: string, visual: Connection["visual"] | null): boolean;
    updateConnectionTypeStyle(typeId: "custom", patch: { appearance: { width: number } }): boolean;
    applyConnectionStylePack(packId: "technical"): boolean;
    undoSpaceTransform(): void;
    redoSpaceTransform(): void;
  };

  assert.equal(state().updateConnectionVisual("target", { appearance: { width: 3 } }), true);
  const connectionEntry = state().transformUndoStack[state().transformUndoStack.length - 1] as {
    kind?: string;
    patches?: Array<{ id: string; before: unknown; after: unknown }>;
    before?: unknown;
    after?: unknown;
  };
  assert.equal(connectionEntry.kind, "connections");
  assert.equal(connectionEntry.patches?.length, 1);
  assert.equal(connectionEntry.patches?.[0]?.id, "target");
  assert.equal(connectionEntry.before, undefined);
  assert.equal(connectionEntry.after, undefined);
  assert.equal(JSON.stringify(connectionEntry).includes("filler-249"), false);
  assert.ok(JSON.stringify(connectionEntry).length < 3_000);

  state().undoSpaceTransform();
  assert.equal(state().connections[0]?.visual, undefined);
  assert.equal(state().connections[state().connections.length - 1]?.id, "filler-249");
  state().redoSpaceTransform();
  assert.equal(state().connections[0]?.visual?.appearance?.width, 3);
  assert.equal(state().connections[state().connections.length - 1]?.id, "filler-249");

  const beforeStyleHistory = state().transformUndoStack.length;
  assert.equal(state().updateConnectionTypeStyle("custom", { appearance: { width: 4 } }), true);
  assert.equal(state().transformUndoStack.length, beforeStyleHistory + 1);
  assert.equal(state().transformUndoStack[state().transformUndoStack.length - 1]?.kind, "connection-styles");
  assert.equal(state().settings.connectionStyles.custom.appearance.width, 4);
  state().undoSpaceTransform();
  assert.notEqual(state().settings.connectionStyles.custom.appearance.width, 4);
  state().redoSpaceTransform();
  assert.equal(state().settings.connectionStyles.custom.appearance.width, 4);

  const beforePackHistory = state().transformUndoStack.length;
  assert.equal(state().applyConnectionStylePack("technical"), true);
  assert.equal(state().transformUndoStack.length, beforePackHistory + 1);
  assert.equal(state().transformUndoStack[state().transformUndoStack.length - 1]?.kind, "connection-styles");
});

test("atomic Cell deletion records only its bulk Connection changes and preserves collection order", async () => {
  const { useLab } = await import("../../state/store");
  const records = [
    connection({ id: "dependent-first", fromSpaceId: "cell-a", toSpaceId: "cell-b" }),
    connection({ id: "unaffected-middle", fromSpaceId: "cell-c", toSpaceId: "cell-d" }),
    connection({ id: "dependent-second", fromSpaceId: "cell-b", toSpaceId: "cell-c" }),
    connection({ id: "unaffected-tail", fromSpaceId: "cell-a", toSpaceId: "cell-d" }),
  ];
  useLab.setState({
    spaces: [cell("cell-a"), cell("cell-b"), cell("cell-c"), cell("cell-d")],
    connections: records,
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    transformUndoStack: [],
    transformRedoStack: [],
  } as never);

  useLab.getState().removeSpace("cell-b");
  assert.deepEqual(useLab.getState().connections.map((item) => item.id), [
    "unaffected-middle",
    "unaffected-tail",
  ]);
  assert.equal(useLab.getState().transformUndoStack.length, 1);
  const entry = useLab.getState().transformUndoStack[0] as unknown as {
    kind: string;
    dependentConnections: Array<{ index: number; connection: Connection }>;
  };
  assert.equal(entry.kind, "space-delete");
  assert.deepEqual(entry.dependentConnections.map(({ index, connection: item }) => [index, item.id]), [
    [0, "dependent-first"],
    [2, "dependent-second"],
  ]);
  assert.equal(JSON.stringify(entry).includes("unaffected-middle"), false);
  assert.equal(JSON.stringify(entry).includes("unaffected-tail"), false);

  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().connections.map((item) => item.id), records.map((item) => item.id));
  useLab.getState().redoSpaceTransform();
  assert.deepEqual(useLab.getState().connections.map((item) => item.id), [
    "unaffected-middle",
    "unaffected-tail",
  ]);
});

test("reclassification retains a sparse local override and reset returns to inheritance", async () => {
  const { useLab } = await import("../../state/store");
  useLab.setState({
    spaces: [cell("cell-a"), cell("cell-b")],
    connections: [connection({ id: "reclassify", visual: { appearance: { width: 3 } } })],
    transformUndoStack: [],
    transformRedoStack: [],
  } as never);
  const before = useLab.getState().transformUndoStack.length;

  assert.equal(useLab.getState().updateConnectionSemantic("reclassify", { typeId: "direct-access" }), true);
  assert.equal(useLab.getState().connections[0]?.semantic.typeId, "direct-access");
  assert.deepEqual(useLab.getState().connections[0]?.visual, { appearance: { width: 3 } });
  assert.equal(useLab.getState().transformUndoStack.length, before + 1);

  assert.equal(useLab.getState().updateConnectionVisual("reclassify", null), true);
  assert.equal(useLab.getState().connections[0]?.visual, undefined);
  assert.equal(useLab.getState().transformUndoStack.length, before + 2);
});

test("project and Saved View persistence migrate style/view defaults and preserve live settings", async () => {
  const { useLab } = await import("../../state/store");
  const styles = await import("./styles");
  const { buildCurrentProjectSnapshot } = await import("../../export/exportService");
  const { buildProjectEnvelope, parseProjectEnvelope } = await import("../../import/projectFiles");
  const current = useLab.getState();
  const connectionStyles = styles.updateProjectConnectionStyle(
    styles.createDefaultProjectConnectionStyles(),
    "direct-access",
    { geometryId: "elbow", appearance: { width: 5, opacity: 0.66 } },
  );
  const legacyVisual = {
    visible: true,
    geometryId: "straight",
    strokePatternId: "solid",
    startMarkerId: "none",
    endMarkerId: "none",
    appearance: { width: 2, opacity: 0.8 },
  } as const;
  const authored = connection({
    id: "persisted",
    semantic: {
      ...connection().semantic,
      typeId: "direct-access",
      requirement: "required",
      direction: "two-way",
      strength: "strong",
      priority: "high",
    },
    visual: legacyVisual,
  });
  useLab.setState({
    spaces: [cell("cell-a"), cell("cell-b")],
    connections: [authored],
    settings: {
      ...current.settings,
      connectionStyles,
      connectionView: { visible: false, focusMode: "selected-cell" },
    },
    savedViews: [],
  } as never);

  const snapshot = buildCurrentProjectSnapshot("V1 persistence") as ReturnType<typeof buildCurrentProjectSnapshot> & {
    settings: {
      connectionStyles?: ReturnType<typeof styles.createDefaultProjectConnectionStyles>;
      connectionView?: { visible: boolean; focusMode: string };
    };
  };
  assert.equal(snapshot.settings.connectionStyles?.["direct-access"].appearance.width, 5);
  assert.deepEqual(snapshot.settings.connectionView, { visible: false, focusMode: "selected-cell" });

  const beforeResolved = styles.resolveConnectionStyle(authored, connectionStyles);
  const parsed = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, [])));
  assert.equal(parsed.snapshot.settings.connectionStyles["direct-access"].appearance.width, 5);
  assert.deepEqual(parsed.snapshot.settings.connectionView, { visible: false, focusMode: "selected-cell" });
  assert.deepEqual(
    styles.resolveConnectionStyle(parsed.snapshot.connections[0]!, parsed.snapshot.settings.connectionStyles),
    beforeResolved,
  );

  const {
    connectionStyles: _connectionStyles,
    connectionView: _connectionView,
    ...legacySettings
  } = snapshot.settings;
  const { connections: _connections, ...legacySnapshot } = snapshot;
  const migrated = parseProjectEnvelope(JSON.stringify({
    ...legacySnapshot,
    settings: legacySettings,
  }));
  assert.deepEqual(migrated.snapshot.connections, []);
  assert.deepEqual(
    migrated.snapshot.settings.connectionStyles,
    styles.createDefaultProjectConnectionStyles(),
  );
  assert.deepEqual(
    migrated.snapshot.settings.connectionView,
    styles.createDefaultConnectionViewSettings(),
  );

  useLab.getState().saveCurrentView("Styled view");
  const saved = useLab.getState().savedViews[0] as SavedCanvasSnapshot & {
    connectionStyles?: ReturnType<typeof styles.createDefaultProjectConnectionStyles>;
    connectionView?: { visible: boolean; focusMode: string };
  };
  assert.equal(saved.connectionStyles?.["direct-access"].appearance.width, 5);
  assert.deepEqual(saved.connectionView, { visible: false, focusMode: "selected-cell" });
  const parsedView = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, [saved]))).savedViews[0]!;
  assert.equal(parsedView.connectionStyles?.["direct-access"].appearance.width, 5);
  assert.deepEqual(parsedView.connectionView, { visible: false, focusMode: "selected-cell" });
});

test("full project, Saved View, schedule, and recovery replacement clear stale Connection UI and history", async () => {
  const { useLab } = await import("../../state/store");
  const { buildCurrentProjectSnapshot } = await import("../../export/exportService");
  const { buildProjectEnvelope } = await import("../../import/projectFiles");
  const transfer = await import("../../import/projectTransfer");
  const seedStaleState = () => {
    useLab.setState({
      selectedConnectionIds: ["stale"],
      primarySelectedConnectionId: "stale",
      connectionAuthoring: {
        phase: "source-chosen",
        typeId: "custom",
        sourceId: "cell-a",
        targetId: null,
        existingConnectionId: null,
        message: "Choose a target Cell.",
        priorSelection: { selectedIds: [], primarySelectedId: null },
      },
      transformUndoStack: [{ kind: "connections", patches: [] }],
      transformRedoStack: [{ kind: "connections", patches: [] }],
    } as never);
  };
  const assertCleared = () => {
    const state = useLab.getState();
    assert.deepEqual(state.selectedConnectionIds, []);
    assert.equal(state.primarySelectedConnectionId, null);
    assert.equal(state.connectionAuthoring.phase, "idle");
    assert.deepEqual(state.transformUndoStack, []);
    assert.deepEqual(state.transformRedoStack, []);
  };

  useLab.setState({
    spaces: [cell("cell-a"), cell("cell-b")],
    connections: [connection({ id: "stale" })],
    savedViews: [],
  } as never);
  const savedViewId = useLab.getState().saveCurrentView("Replacement");
  assert.ok(savedViewId);
  seedStaleState();
  useLab.getState().loadSavedView(savedViewId);
  assertCleared();

  const project = buildProjectEnvelope(buildCurrentProjectSnapshot("Replacement"), []);
  seedStaleState();
  transfer.applyProjectFile(project);
  assertCleared();

  seedStaleState();
  transfer.applySpaceSchedule([cell("cell-a"), cell("cell-b")]);
  assertCleared();

  const recovery = transfer.captureRecoverySnapshot();
  seedStaleState();
  transfer.restoreRecoverySnapshot(recovery);
  assertCleared();
});

test("a rejected project import restores the current Undo and Redo stacks", async () => {
  const { useLab } = await import("../../state/store");
  const { buildCurrentProjectSnapshot } = await import("../../export/exportService");
  const { buildProjectEnvelope } = await import("../../import/projectFiles");
  const { applyProjectFile } = await import("../../import/projectTransfer");

  useLab.setState({
    spaces: [cell("cell-a"), cell("cell-b")],
    connections: [connection({ id: "rollback-target" })],
    transformUndoStack: [],
    transformRedoStack: [],
  } as never);
  assert.equal(useLab.getState().updateConnectionVisual("rollback-target", { appearance: { width: 3 } }), true);
  useLab.getState().undoSpaceTransform();
  const undoBefore = [...useLab.getState().transformUndoStack];
  const redoBefore = [...useLab.getState().transformRedoStack];
  assert.equal(redoBefore.length, 1);

  const project = buildProjectEnvelope(buildCurrentProjectSnapshot("Rejected import"), []);
  const invalidProject = {
    ...project,
    snapshot: {
      ...project.snapshot,
      settings: { ...project.snapshot.settings, connectionStyles: undefined },
    },
  } as unknown as typeof project;

  assert.throws(() => applyProjectFile(invalidProject));
  assert.deepEqual(useLab.getState().transformUndoStack, undoBefore);
  assert.deepEqual(useLab.getState().transformRedoStack, redoBefore);
  assert.equal(useLab.getState().connections[0]?.id, "rollback-target");
});
