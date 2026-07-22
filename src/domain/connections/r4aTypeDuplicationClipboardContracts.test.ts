import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import {
  duplicateRelationshipType,
  getAllRelationshipTypes,
} from "./relationshipTypes";
import { createDefaultProjectConnectionStyles } from "./styles";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const browserStorage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => browserStorage.get(key) ?? null,
    setItem: (key: string, value: string) => { browserStorage.set(key, value); },
    removeItem: (key: string) => { browserStorage.delete(key); },
    clear: () => browserStorage.clear(),
    key: (index: number) => [...browserStorage.keys()][index] ?? null,
    get length() { return browserStorage.size; },
  },
});

const connection = (id: string, typeId: string): Connection => ({
  id,
  fromSpaceId: "source",
  toSpaceId: "target",
  enabled: true,
  semantic: { typeId, requirement: "preferred", direction: "none", strength: "medium", priority: "normal", notes: "" },
});

test("Relationship Type duplication creates a unique project type without usage or factory identity", () => {
  const styles = createDefaultProjectConnectionStyles();
  const factory = getAllRelationshipTypes([], styles).find((type) => type.id === "direct-access")!;
  const copy = duplicateRelationshipType(factory, [], styles, 100);
  assert.equal(copy.origin, "project");
  assert.equal(copy.builtIn, false);
  assert.notEqual(copy.id, factory.id);
  assert.match(copy.name, /^Direct Access Copy$/);
  assert.notEqual(copy.shortCode, factory.shortCode);
  assert.deepEqual(copy.visualDefaults, factory.visualDefaults);
  assert.deepEqual(copy.annotationDefaults, factory.annotationDefaults);
  assert.equal(copy.archived, false);
});

test("duplicate helper suffixes names/codes uniquely and Custom becomes ordinary project type", () => {
  const styles = createDefaultProjectConnectionStyles();
  const existing = [{
    ...duplicateRelationshipType(getAllRelationshipTypes([], styles).find((type) => type.id === "custom")!, [], styles, 1),
  }];
  const sourceType = getAllRelationshipTypes(existing, styles).find((type) => type.id === "custom")!;
  const copy = duplicateRelationshipType(sourceType, existing, styles, 2);
  assert.equal(copy.origin, "project");
  assert.equal(copy.builtIn, false);
  assert.match(copy.name, /^Custom Copy 2$/);
  assert.notEqual(copy.shortCode, existing[0]!.shortCode);
  assert.equal(copy.archived, false);
});

test("Manager Type actions reuse the one visual clipboard and canonical store targets", () => {
  const widget = source("../../ui/widgets/ConnectionsWidget.tsx");
  const store = source("../../state/store.ts");
  const styles = source("./styles.ts");
  assert.match(widget, /Duplicate Relationship Type/);
  assert.match(widget, /Copy Relationship Type style/);
  assert.match(widget, /Paste visual style to Relationship Type/);
  assert.match(widget, /copyRelationshipTypeStyle/);
  assert.match(widget, /pasteConnectionStyleToRelationshipType/);
  assert.match(widget, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(widget, /data-connection-shortcut="ignore"/);
  assert.match(store, /connectionStyleClipboard: copyResolvedStyle\(type\.visualDefaults\)/);
  assert.match(store, /pasteConnectionStyleToRelationshipType/);
  assert.doesNotMatch(store, /relationshipTypeStyleClipboard/);
  assert.match(styles, /pasteConnectionStyleToResolvedStyle/);
});

test("shared Type clipboard copies without history, pastes once, and keeps Connection compatibility", async () => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  useLab.setState({
    spaces: [
      { id: "source", name: "Source", area: 40, category: "Uncategorized", privacy: "public", color: "", x: 0, y: 0 },
      { id: "target", name: "Target", area: 40, category: "Uncategorized", privacy: "public", color: "", x: 120, y: 0 },
    ],
    connections: [connection("one", "custom")],
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    transformUndoStack: [],
    transformRedoStack: [],
    connectionStyleClipboard: null,
    settings: { ...current.settings, projectRelationshipTypes: [] },
  } as never);
  const state = () => useLab.getState();
  assert.equal(state().copyRelationshipTypeStyle("direct-access"), true);
  assert.equal(state().transformUndoStack.length, 0);
  assert.equal(state().pasteConnectionStyleToRelationshipType("custom"), true);
  assert.equal(state().transformUndoStack.length, 1);
  assert.equal(state().settings.connectionStyles.custom.endMarkerId, state().settings.connectionStyles["direct-access"].endMarkerId);
  state().undoSpaceTransform();
  assert.notEqual(state().settings.connectionStyles.custom.endMarkerId, state().settings.connectionStyles["direct-access"].endMarkerId);
  state().selectConnection("one");
  assert.equal(state().pasteConnectionStyleToSelection(), 1);
});
