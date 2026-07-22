import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import {
  defaultConnectionFilterState,
  filterConnections,
  orderedConnectionRange,
  type ConnectionFilterMetadata,
} from "./selectors";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const connection = (id: string, typeId = "custom", patch: Partial<Connection> = {}): Connection => ({
  id,
  fromSpaceId: `${id}-source`,
  toSpaceId: `${id}-target`,
  enabled: true,
  semantic: {
    typeId,
    requirement: "preferred",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
  ...patch,
});

const metadata = (patch: Partial<ConnectionFilterMetadata> = {}): ConnectionFilterMetadata => ({
  sourceName: "Kitchen",
  targetName: "Dining",
  typeName: "Direct Access",
  typeCode: "ACC",
  title: "Staff route",
  body: "Service movement",
  hasVisualOverride: false,
  hasAnnotationOverride: false,
  ...patch,
});

test("R4A Manager consumes canonical Connections and shared selection/camera owners", () => {
  const widget = source("../../ui/widgets/ConnectionsWidget.tsx");
  const store = source("../../state/store.ts");
  const css = source("../../ui/widgets/widgets.css");
  const canvas = source("../../canvas/OrganismCanvasView.tsx");
  assert.match(widget, /connections = useLab\(\(state\) => state\.connections\)/);
  assert.match(widget, /selectedConnectionIds = useLab\(\(state\) => state\.selectedConnectionIds\)/);
  assert.match(widget, /selectConnectionFromList\(connection\.id, event\)/);
  assert.match(widget, /selectionAnchorConnectionId/);
  assert.match(widget, /event\.shiftKey/);
  assert.match(widget, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(widget, /orderedConnectionRange\(filteredConnectionIds/);
  assert.match(widget, /Select all visible Connections/);
  assert.match(widget, /HTMLInputElement \|\| target instanceof HTMLTextAreaElement \|\| target\.isContentEditable/);
  assert.match(canvas, /selectConnection\(connectionHit, e\.shiftKey\)/);
  assert.match(widget, /selectConnection\(connection\.id\); setSelectionAnchorConnectionId\(connection\.id\); locateConnection\(connection\.id\)/);
  assert.match(store, /locateConnection: \(id\) =>/);
  assert.match(store, /view: "canvas"/);
  assert.match(store, /fitCamera\(endpoints, window\.innerWidth, window\.innerHeight, 220\)/);
  assert.match(widget, /updateSelectedConnectionTypes/);
  assert.match(widget, /deleteSelectedConnections/);
  assert.match(css, /\.connection-management-list[^}]*overflow-y:\s*auto/s);
  assert.match(widget, /CONNECTION_ROW_HEIGHT/);
  assert.match(widget, /CONNECTION_OVERSCAN/);
});

test("Connection filter model preserves canonical order and separates semantic active/override filters", () => {
  const connections = [
    connection("first", "custom"),
    connection("second", "direct-access", { enabled: false }),
    connection("third", "custom"),
  ];
  const metadataById: Record<string, ConnectionFilterMetadata> = {
    first: metadata(),
    second: metadata({ typeName: "Adjacency", typeCode: "ADJ", hasAnnotationOverride: true }),
    third: metadata({ sourceName: "Lobby", targetName: "Stair", hasVisualOverride: true }),
  };
  const metadataFor = (item: Connection) => metadataById[item.id]!;
  assert.deepEqual(filterConnections(connections, defaultConnectionFilterState(), metadataFor).map((item) => item.id), ["first", "second", "third"]);
  assert.deepEqual(filterConnections(connections, { ...defaultConnectionFilterState(), enabled: "inactive" }, metadataFor).map((item) => item.id), ["second"]);
  assert.deepEqual(filterConnections(connections, { ...defaultConnectionFilterState(), overrideMode: "inherited" }, metadataFor).map((item) => item.id), ["first"]);
  assert.deepEqual(filterConnections(connections, { ...defaultConnectionFilterState(), overrideMode: "visual" }, metadataFor).map((item) => item.id), ["third"]);
  assert.deepEqual(filterConnections(connections, { ...defaultConnectionFilterState(), relationshipTypeId: "custom" }, metadataFor).map((item) => item.id), ["first", "third"]);
});

test("Connection filter search covers endpoints, type code, title and body", () => {
  const item = connection("route");
  for (const query of ["kitchen", "dining", "access", "acc", "staff route", "service movement"]) {
    assert.deepEqual(filterConnections([item], { ...defaultConnectionFilterState(), query }, () => metadata()).map((value) => value.id), ["route"]);
  }
  assert.deepEqual(filterConnections([item], { ...defaultConnectionFilterState(), query: "missing" }, () => metadata()).map((value) => value.id), []);
});

test("ordered range selection uses only filtered model order, both directions, and is virtualization-independent", () => {
  const filtered = ["A", "C", "E", "G"];
  assert.deepEqual(orderedConnectionRange(filtered, "C", "G"), ["C", "E", "G"]);
  assert.deepEqual(orderedConnectionRange(filtered, "G", "C"), ["C", "E", "G"]);
  const large = Array.from({ length: 2_400 }, (_, index) => `connection-${index}`);
  assert.equal(orderedConnectionRange(large, "connection-10", "connection-500").length, 491);
  assert.equal(orderedConnectionRange(large, "connection-10", "connection-500")[490], "connection-500");
  assert.deepEqual(orderedConnectionRange(large, "missing", "connection-500"), ["connection-500"]);
});

test("Manager exposes explicit empty/reset states and keeps global visibility distinct", () => {
  const widget = source("../../ui/widgets/ConnectionsWidget.tsx");
  assert.match(widget, /No Connections yet\./);
  assert.match(widget, /No Connections match these filters\./);
  assert.match(widget, /Reset filters/);
  assert.match(widget, /global|visible/i);
  assert.match(widget, /aria-label=\"Select all visible Connections\"/);
  assert.match(widget, /Locate on Canvas/);
});
