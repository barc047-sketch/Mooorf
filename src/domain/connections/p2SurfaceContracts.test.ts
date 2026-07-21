import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Connections owns one canonical registered widget and one Dock launcher", async () => {
  const registry = await import("../../ui/panels/widgetRegistry");
  const definition = (registry.WIDGET_DEFINITIONS as Record<string, unknown>).connections as {
    id?: string;
    label?: string;
    launcher?: string;
    status?: string;
  } | undefined;
  assert.ok(definition, "Connections widget definition should exist");
  assert.equal(definition?.id, "connections");
  assert.equal(definition?.label, "Connections");
  assert.equal(definition?.launcher, "dock");
  assert.equal(definition?.status, "live");

  const dock = source("../../ui/Dock.tsx");
  assert.match(dock, /<Waypoints size=\{16\} strokeWidth=\{1\.5\} \/>/);
  assert.match(dock, /title="Connections"/);
  assert.match(dock, /aria-label="Open Connections"/);
  assert.match(dock, /active=\{isExpanded\("connections"\)\}/);
  assert.equal(dock.match(/openWidget\("connections"\)/g)?.length, 1, "Dock should launch Connections exactly once");
});

test("Connections widget reuses registry semantics and the existing WidgetHost lifecycle", () => {
  const widgetPath = new URL("../../ui/widgets/ConnectionsWidget.tsx", import.meta.url);
  assert.equal(existsSync(widgetPath), true, "ConnectionsWidget should exist");
  const widget = readFileSync(widgetPath, "utf8");
  const host = source("../../ui/widgets/WidgetHost.tsx");

  assert.match(host, /import ConnectionsWidget from "\.\/ConnectionsWidget"/);
  assert.match(host, /connections:\s*\(\) => <ConnectionsWidget \/>/);
  assert.match(widget, /CONNECTION_SEMANTIC_TYPES/);
  assert.match(widget, /beginConnectionAuthoring/);
  assert.match(widget, /connectSelectedCells/);
  assert.match(widget, /selectedConnectionIds/);
  assert.match(widget, /role="radiogroup"/);
  assert.match(widget, /aria-live="polite"/);
  assert.match(widget, /Connect Cells/);
  assert.match(widget, /Connect Selected/);
  assert.match(widget, /Existing Connections/);
  assert.doesNotMatch(widget, /useLab\(\(state\) => state\)/, "widget must not subscribe to the full store");
});

test("Connections widget lifecycle refocuses without duplication and close cancels authoring", async () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => null, setItem: () => undefined },
  });
  const model = await import("./model");
  const { useLab } = await import("../../state/store");
  useLab.setState({
    spaces: [{ id: "cell-a", name: "A", kind: "space", area: 40, category: "A", privacy: "public", color: "", x: 0, y: 0 }],
    selectedIds: ["cell-a"],
    primarySelectedId: "cell-a",
    selectedId: "cell-a",
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    connectionAuthoring: model.createConnectionAuthoringState(),
    openWidgets: [],
    minimizedWidgets: [],
    widgetLaunchRevisions: {},
  } as never);
  useLab.getState().openWidget("connections");
  useLab.getState().openWidget("connections");
  assert.equal(useLab.getState().openWidgets.filter((id) => id === "connections").length, 1);
  useLab.getState().beginConnectionAuthoring("adjacency");
  useLab.getState().closeWidget("connections");
  assert.equal(useLab.getState().connectionAuthoring.phase, "cancelled");
  assert.deepEqual(useLab.getState().selectedIds, ["cell-a"]);
});

test("the one production Inspector switches to semantic Connection editing", () => {
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  assert.match(inspector, /function ConnectionInspector/);
  assert.match(inspector, /primarySelectedConnectionId/);
  assert.match(inspector, /getPrimarySelectedConnection/);
  assert.match(inspector, /CONNECTION_DIRECTIONS/);
  assert.match(inspector, /CONNECTION_REQUIREMENTS/);
  assert.match(inspector, /CONNECTION_STRENGTHS/);
  assert.match(inspector, /CONNECTION_PRIORITIES/);
  assert.match(inspector, /updateConnectionSemantic/);
  assert.match(inspector, /setConnectionEnabled/);
  assert.match(inspector, /deleteConnection/);
  assert.match(inspector, /clearConnectionSelection/);
  assert.match(inspector, /Connection notes/);
  assert.match(inspector, /function CellInspector/);
  assert.match(inspector, /<ContentField label="Space Name"/);
  assert.doesNotMatch(inspector, /geometryId|strokePatternId|startMarkerId|endMarkerId|Morph Bridge/);
});

test("Organism owns one Canvas-local temporary authoring preview and no stored-line renderer", () => {
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.match(organism, /connectionPreviewLineRef/);
  assert.match(organism, /data-testid="connection-authoring-preview"/);
  assert.match(organism, /chooseConnectionSource/);
  assert.match(organism, /completeConnectionAuthoring/);
  assert.match(organism, /reduceConnectionAuthoring/);
  assert.match(organism, /connectionAuthoringPreviewRef/);
  assert.match(organism, /pointerEvents: "none"/);
  assert.match(
    organism,
    /connectionPreviewOverlayRef\.current\?\.style\.setProperty\("transform", transform\)/,
    "temporary preview should share the existing camera-feedback transform",
  );
  assert.equal(organism.match(/<line\b/g)?.length, 1, "only one temporary line should exist");
  assert.doesNotMatch(
    organism,
    /useLab\(\(s\) => s\.connections\)/,
    "P2 must not subscribe the Organism renderer to stored Connections",
  );
  assert.doesNotMatch(organism, /connections\.map\s*\(/, "P2 must not render stored Connections");
});
