import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import type { SpaceCell } from "../../types";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const browserStorage = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => browserStorage.get(key) ?? null,
    setItem: (key: string, value: string) => { browserStorage.set(key, value); },
    removeItem: (key: string) => { browserStorage.delete(key); },
    clear: () => { browserStorage.clear(); },
    key: (index: number) => [...browserStorage.keys()][index] ?? null,
    get length() { return browserStorage.size; },
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

const connection = (id: string, typeId: string, overrides: Partial<Connection> = {}): Connection => ({
  id,
  fromSpaceId: "a",
  toSpaceId: "b",
  enabled: true,
  semantic: {
    typeId,
    requirement: "preferred",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: id,
  },
  ...overrides,
});

test("Relationship Manager exposes only the R3A shell, canonical Types library, and bounded long-list strategy", () => {
  const widget = source("../../ui/widgets/ConnectionsWidget.tsx");
  const picker = source("../../ui/RelationshipTypePicker.tsx");
  const css = source("../../ui/widgets/widgets.css");

  assert.match(widget, /role="tablist"/);
  assert.match(widget, />TYPES</);
  assert.match(widget, />CONNECTIONS</);
  assert.match(widget, /Settings2/);
  assert.match(widget, /getAllRelationshipTypes/);
  assert.match(widget, /searchRelationshipTypes/);
  assert.match(widget, /getConnectionIndex/);
  assert.match(widget, /getRelationshipTypeUsageCount/);
  assert.match(widget, /RelationshipTypeStylePreview/);
  assert.match(picker, /visualDefaults/);
  assert.match(widget, /Add Relationship Type/);
  assert.match(widget, /Reset Factory Defaults/);
  assert.match(widget, /Connection management arrives in the next stage/);
  assert.doesNotMatch(widget, /filterConnections|Existing Connections|bulk selection|locate on Canvas/);
  assert.doesNotMatch(widget, /width slider|opacity slider|marker editor|geometry editor/i);
  assert.match(css, /\.relationship-type-list\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.relationship-type-row\s*\{[^}]*content-visibility:\s*auto/s);
  assert.match(css, /contain-intrinsic-size:\s*54px/);
});

test("Relationship Type search preserves canonical order and metadata validation rejects duplicate names and codes", async () => {
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const connectionStyles = styles.createDefaultProjectConnectionStyles();
  const patientFlow = types.createProjectRelationshipType({
    id: "rt_patient_flow",
    name: "Patient Flow",
    shortCode: "PF",
    description: "Public patient movement",
  }, [], connectionStyles, 1);
  const library = types.getAllRelationshipTypes([patientFlow], connectionStyles);

  assert.equal(typeof types.searchRelationshipTypes, "function");
  assert.deepEqual(types.searchRelationshipTypes(library, "patient").map((type) => type.id), [patientFlow.id]);
  assert.deepEqual(types.searchRelationshipTypes(library, "pf").map((type) => type.id), [patientFlow.id]);
  assert.deepEqual(
    types.searchRelationshipTypes(library, "movement").map((type) => type.id),
    ["circulation-flow", patientFlow.id],
    "description matches retain canonical factory-before-project ordering",
  );
  assert.deepEqual(types.searchRelationshipTypes(library, "").map((type) => type.id), library.map((type) => type.id));
  assert.equal(
    types.getRelationshipTypeMetadataError({ name: "patient flow", shortCode: "OTHER" }, [patientFlow]),
    "A Relationship Type with this name already exists.",
  );
  assert.equal(
    types.getRelationshipTypeMetadataError({ name: "Other", shortCode: "pf" }, [patientFlow]),
    "A Relationship Type with this code already exists.",
  );
});

interface RelationshipTypeStore {
  connections: Connection[];
  connectionModeTypeId: string;
  transformUndoStack: unknown[];
  transformRedoStack: unknown[];
  settings: {
    connectionStyles: ReturnType<typeof import("./styles").createDefaultProjectConnectionStyles>;
    projectRelationshipTypes: Array<{ id: string; name: string; shortCode: string; description: string; archived: boolean }>;
  };
  createProjectRelationshipType(input: { name: string; shortCode: string; description?: string }): string | null;
  updateProjectRelationshipTypeMetadata(id: string, input: { name: string; shortCode: string; description?: string }): boolean;
  setProjectRelationshipTypeArchived(id: string, archived: boolean, reassignToTypeId?: string): boolean;
  deleteProjectRelationshipType(id: string, reassignToTypeId?: string): boolean;
  resetFactoryRelationshipTypeDefaults(): boolean;
  setConnectionModeType(id: string): void;
  selectConnection(id: string | null, additive?: boolean): void;
  updateSelectedConnectionTypes(typeId: string): number;
  undoSpaceTransform(): void;
  redoSpaceTransform(): void;
}

const setupStore = async (projectType: unknown, connections: Connection[] = []) => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  useLab.setState({
    spaces: [cell("a"), cell("b")],
    connections,
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    transformUndoStack: [],
    transformRedoStack: [],
    settings: {
      ...current.settings,
      projectRelationshipTypes: projectType ? [projectType] : [],
    },
  } as never);
  return {
    useLab,
    state: () => useLab.getState() as unknown as RelationshipTypeStore,
  };
};

test("project Relationship Type create and metadata edit preserve stable identity and immediately feed shared selectors", async () => {
  const { state } = await setupStore(null);
  assert.equal(typeof state().createProjectRelationshipType, "function");
  const id = state().createProjectRelationshipType({
    name: "Patient Flow",
    shortCode: "PF",
    description: "Patient movement",
  });
  assert.match(id ?? "", /^rt_/);
  assert.equal(state().settings.projectRelationshipTypes[0]?.id, id);
  assert.equal(state().updateProjectRelationshipTypeMetadata(id!, {
    name: "Clinical Flow",
    shortCode: "CF",
    description: "Clinical movement",
  }), true);
  assert.deepEqual({
    id: state().settings.projectRelationshipTypes[0]?.id,
    name: state().settings.projectRelationshipTypes[0]?.name,
    shortCode: state().settings.projectRelationshipTypes[0]?.shortCode,
    description: state().settings.projectRelationshipTypes[0]?.description,
  }, { id, name: "Clinical Flow", shortCode: "CF", description: "Clinical movement" });
  assert.equal(state().transformUndoStack.length, 2);
});

test("archive safety is atomic: used types require reassignment and Undo restores both records and library state", async () => {
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const projectType = types.createProjectRelationshipType({
    id: "rt_patient_flow",
    name: "Patient Flow",
    shortCode: "PF",
  }, [], styles.createDefaultProjectConnectionStyles(), 1);
  const { state } = await setupStore(projectType, [connection("patient", projectType.id)]);

  assert.equal(typeof state().setProjectRelationshipTypeArchived, "function");
  assert.equal(state().setProjectRelationshipTypeArchived(projectType.id, true), false);
  assert.equal(state().connections[0]?.semantic.typeId, projectType.id);
  assert.equal(state().settings.projectRelationshipTypes[0]?.archived, false);
  assert.equal(state().transformUndoStack.length, 0);

  assert.equal(state().setProjectRelationshipTypeArchived(projectType.id, true, "custom"), true);
  assert.equal(state().connections[0]?.semantic.typeId, "custom");
  assert.equal(state().settings.projectRelationshipTypes[0]?.archived, true);
  assert.equal(state().transformUndoStack.length, 1);
  state().undoSpaceTransform();
  assert.equal(state().connections[0]?.semantic.typeId, projectType.id);
  assert.equal(state().settings.projectRelationshipTypes[0]?.archived, false);
  state().redoSpaceTransform();
  assert.equal(state().connections[0]?.semantic.typeId, "custom");
  assert.equal(state().settings.projectRelationshipTypes[0]?.archived, true);
});

test("delete safety reassigns used records in one transaction while unused types delete directly", async () => {
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const projectType = types.createProjectRelationshipType({
    id: "rt_service_route",
    name: "Service Route",
    shortCode: "SR",
  }, [], styles.createDefaultProjectConnectionStyles(), 1);
  const { state } = await setupStore(projectType, [connection("service", projectType.id)]);

  assert.equal(typeof state().deleteProjectRelationshipType, "function");
  assert.equal(state().deleteProjectRelationshipType(projectType.id), false);
  assert.equal(state().deleteProjectRelationshipType(projectType.id, "custom"), true);
  assert.equal(state().connections[0]?.semantic.typeId, "custom");
  assert.deepEqual(state().settings.projectRelationshipTypes, []);
  assert.equal(state().transformUndoStack.length, 1);
  state().undoSpaceTransform();
  assert.equal(state().connections[0]?.semantic.typeId, projectType.id);
  assert.equal(state().settings.projectRelationshipTypes[0]?.id, projectType.id);

  const unused = await setupStore(projectType, []);
  assert.equal(unused.state().deleteProjectRelationshipType(projectType.id), true);
  assert.deepEqual(unused.state().settings.projectRelationshipTypes, []);
});

test("Quick Rail and Inspector both consume the same dynamic selectable Relationship Type library", () => {
  const rail = source("../../ui/ConnectionQuickRail.tsx");
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  assert.match(rail, /getSelectableRelationshipTypes\(projectRelationshipTypes, connectionStyles\)/);
  assert.match(rail, /options=\{typeOptions\}/);
  assert.match(inspector, /getSelectableRelationshipTypes\(projectRelationshipTypes, connectionStyles\)/);
  assert.match(inspector, /options=\{typeOptions\}/);
});

test("normalization preserves legacy duplicate metadata while new authoring still rejects new duplicates", async () => {
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const connectionStyles = styles.createDefaultProjectConnectionStyles();
  const normalized = types.normalizeProjectRelationshipTypes([
    { id: "rt_legacy_a", name: "Patient Flow", shortCode: "PF", description: "First legacy record" },
    { id: "rt_legacy_b", name: "Patient Flow", shortCode: "PF", description: "Second legacy record" },
  ], connectionStyles);

  assert.deepEqual(normalized.map((type) => type.id), ["rt_legacy_a", "rt_legacy_b"]);
  assert.throws(() => types.createProjectRelationshipType({
    name: "Patient Flow",
    shortCode: "NEW",
  }, normalized, connectionStyles, 3), /already exists/);
});

test("Relationship Type history never leaves authoring pointed at a removed or archived type", async () => {
  const { state } = await setupStore(null);
  const id = state().createProjectRelationshipType({ name: "Patient Flow", shortCode: "PF" })!;
  state().setConnectionModeType(id);
  state().undoSpaceTransform();
  assert.equal(state().connectionModeTypeId, "custom");

  state().redoSpaceTransform();
  state().setConnectionModeType(id);
  assert.equal(state().setProjectRelationshipTypeArchived(id, true), true);
  state().undoSpaceTransform();
  state().setConnectionModeType(id);
  state().redoSpaceTransform();
  assert.equal(state().connectionModeTypeId, "custom");
});

test("shared Relationship Type picker caps five preview rows with internal scrolling and preserves launch direction", () => {
  const picker = source("../../ui/RelationshipTypePicker.tsx");
  const shell = source("../../ui/shell.css");
  const rail = source("../../ui/ConnectionQuickRail.tsx");
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  const manager = source("../../ui/widgets/ConnectionsWidget.tsx");

  assert.match(picker, /PICKER_MAX_HEIGHT_PX\s*=\s*240/);
  assert.match(picker, /Math\.min\(PICKER_MAX_HEIGHT_PX, available\)/);
  assert.match(shell, /\.connection-quick-type-menu\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(shell, /\.connection-quick-type-menu button\s*\{[^}]*min-height:\s*42px/s);
  assert.match(picker, /RelationshipTypeStylePreview/);
  assert.match(picker, /type\.visualDefaults/);
  assert.match(manager, /import \{[^}]*RelationshipTypeStylePreview[^}]*\} from "\.\.\/RelationshipTypePicker"/s);
  assert.doesNotMatch(manager, /function RelationshipTypeStylePreview/);
  assert.match(rail, /direction="up"/);
  assert.match(inspector, /direction="down"/);
});

test("Relationship Type MRU is de-duplicated, prunes unavailable IDs, and orders authoring options only", async () => {
  browserStorage.clear();
  const picker = await import("../../ui/RelationshipTypePicker");
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const connectionStyles = styles.createDefaultProjectConnectionStyles();
  const projectType = types.createProjectRelationshipType({
    id: "rt_patient_flow",
    name: "Patient Flow",
    shortCode: "PF",
  }, [], connectionStyles, 1);
  const canonical = types.getSelectableRelationshipTypes([projectType], connectionStyles);

  assert.deepEqual(
    picker.orderRelationshipTypePickerOptions(canonical, []).map((type) => type.id),
    canonical.map((type) => type.id),
  );
  picker.recordRelationshipTypeUse("direct-access");
  picker.recordRelationshipTypeUse(projectType.id);
  picker.recordRelationshipTypeUse("direct-access");
  assert.deepEqual(picker.readRelationshipTypeMRU(), ["direct-access", projectType.id]);
  assert.deepEqual(
    picker.orderRelationshipTypePickerOptions(canonical, ["missing", projectType.id, "direct-access", projectType.id])
      .slice(0, 2)
      .map((type) => type.id),
    [projectType.id, "direct-access"],
  );
  assert.deepEqual(
    types.getAllRelationshipTypes([projectType], connectionStyles).map((type) => type.id),
    canonical.map((type) => type.id),
    "Manager canonical library order must not consume authoring MRU",
  );
});

test("recording Relationship Type use writes only UI preference state and creates no Connection history", async () => {
  browserStorage.clear();
  const picker = await import("../../ui/RelationshipTypePicker");
  const { state } = await setupStore(null, [connection("existing", "adjacency")]);
  const before = state().transformUndoStack.length;
  picker.recordRelationshipTypeUse("adjacency");
  assert.equal(state().transformUndoStack.length, before);
  assert.match(browserStorage.get("mooorf:recent-relationship-types") ?? "", /adjacency/);
});

test("multi-Connection Inspector exposes same-type and Mixed Type presentation with explicit counted deletion", () => {
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  assert.match(inspector, /selectedConnections/);
  assert.match(inspector, /typeSelection\.mixed/);
  assert.match(inspector, /placeholder=\{typeSelection\.mixed \? "Mixed"/);
  assert.match(inspector, /updateSelectedConnectionTypes/);
  assert.match(inspector, /Delete \{count\} Connections/);
  assert.match(inspector, /Delete Connection</);
});

test("bulk Relationship Type assignment is one undoable transaction and preserves every local override", async () => {
  const first = connection("first", "adjacency", {
    visual: {
      visible: false,
      startAnchorId: "left",
      endAnchorId: "bottom",
      appearance: { color: "#123456", width: 3 },
    },
    annotation: {
      title: { source: "custom", text: "First title" },
      body: { source: "custom", text: "First body" },
    },
  });
  const second = connection("second", "visual-access", {
    enabled: false,
    visual: {
      geometryId: "curved",
      label: { content: "custom", text: "Second label" },
    },
    annotation: { title: { source: "custom", text: "Second title" } },
  });
  const { state } = await setupStore(null, [first, second]);
  const before = structuredClone(state().connections);
  state().selectConnection("first");
  state().selectConnection("second", true);

  assert.equal(typeof state().updateSelectedConnectionTypes, "function");
  assert.equal(state().updateSelectedConnectionTypes("direct-access"), 2);
  assert.deepEqual(state().connections.map((item) => item.semantic.typeId), ["direct-access", "direct-access"]);
  assert.equal(state().transformUndoStack.length, 1);
  for (const [index, item] of state().connections.entries()) {
    assert.deepEqual(item.visual, before[index]?.visual);
    assert.deepEqual(item.annotation, before[index]?.annotation);
    assert.equal(item.enabled, before[index]?.enabled);
    assert.equal(item.fromSpaceId, before[index]?.fromSpaceId);
    assert.equal(item.toSpaceId, before[index]?.toSpaceId);
    assert.deepEqual({ ...item.semantic, typeId: before[index]?.semantic.typeId }, before[index]?.semantic);
  }

  state().undoSpaceTransform();
  assert.deepEqual(state().connections, before);
  state().redoSpaceTransform();
  assert.deepEqual(state().connections.map((item) => item.semantic.typeId), ["direct-access", "direct-access"]);
});
