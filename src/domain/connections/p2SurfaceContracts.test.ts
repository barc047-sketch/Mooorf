import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Dock owns one Connection mode toggle while Manager remains registry-owned", async () => {
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
  assert.match(dock, /title="Toggle Connection mode"/);
  assert.match(dock, /aria-label="Toggle Connection mode"/);
  assert.match(dock, /active=\{connectionModeActive\}/);
  assert.match(dock, /onClick=\{toggleConnectionMode\}/);
  assert.doesNotMatch(dock, /openWidget\("connections"\)/, "Dock must not open Manager directly");
});

test("Manager reuses shared semantics/filtering and retains a bounded native fallback", () => {
  const widgetPath = new URL("../../ui/widgets/ConnectionsWidget.tsx", import.meta.url);
  assert.equal(existsSync(widgetPath), true, "ConnectionsWidget should exist");
  const widget = readFileSync(widgetPath, "utf8");
  const host = source("../../ui/widgets/WidgetHost.tsx");

  assert.match(host, /import ConnectionsWidget from "\.\/ConnectionsWidget"/);
  assert.match(host, /connections:\s*\(\) => <ConnectionsWidget \/>/);
  assert.match(widget, /CONNECTION_SEMANTIC_TYPES/);
  assert.match(widget, /filterConnections/);
  assert.match(widget, /connectionModeTypeId/);
  assert.match(widget, /enterConnectionMode/);
  assert.match(widget, /chooseConnectionSource/);
  assert.match(widget, /completeConnectionAuthoring/);
  assert.match(widget, /connectSelectedCells/);
  assert.match(widget, /selectedConnectionIds/);
  assert.match(widget, /Relationship type/);
  assert.match(widget, /<select/);
  assert.match(widget, /Show next/);
  assert.match(widget, /rowOffset/);
  assert.match(widget, /slice\(rowOffset, rowOffset \+ MANAGER_ROW_LIMIT\)/);
  assert.doesNotMatch(widget, /setRowLimit|slice\(0, rowLimit\)/, "Manager pagination must replace the bounded page instead of accumulating mounted rows");
  assert.doesNotMatch(widget, /aria-live="polite"/, "Quick Rail must own the only mode live region");
  assert.match(widget, /Connect Cells/);
  assert.match(widget, /Connect Selected/);
  assert.match(widget, /Existing Connections/);
  assert.doesNotMatch(widget, /useLab\(\(state\) => state\)/, "widget must not subscribe to the full store");
});

test("Manager lifecycle refocuses without duplication and never owns Connection mode", async () => {
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
    connectionModeActive: false,
    connectionModeTypeId: "custom",
    openWidgets: [],
    minimizedWidgets: [],
    widgetLaunchRevisions: {},
  } as never);
  useLab.getState().openWidget("connections");
  useLab.getState().openWidget("connections");
  assert.equal(useLab.getState().openWidgets.filter((id) => id === "connections").length, 1);
  useLab.getState().enterConnectionMode("adjacency");
  useLab.getState().closeWidget("connections");
  assert.equal(useLab.getState().connectionModeActive, true);
  assert.equal(useLab.getState().connectionAuthoring.phase, "mode-ready");
  assert.deepEqual(useLab.getState().selectedIds, ["cell-a"]);
});

test("split Quick Rail owns seven types, Manager, Detail, Close, and the one live status", async () => {
  const railPath = new URL("../../ui/ConnectionQuickRail.tsx", import.meta.url);
  assert.equal(existsSync(railPath), true, "ConnectionQuickRail should exist");
  const rail = readFileSync(railPath, "utf8");
  const app = source("../../App.tsx");
  assert.match(app, /import ConnectionQuickRail from "\.\/ui\/ConnectionQuickRail"/);
  assert.match(app, /<ConnectionQuickRail \/>/);
  assert.match(rail, /CONNECTION_SEMANTIC_TYPES\.slice\(0, 4\)/);
  assert.match(rail, /CONNECTION_SEMANTIC_TYPES\.slice\(4\)/);
  assert.match(rail, /openWidget\("connections"\)/);
  assert.match(rail, /openWidget\("connection-studio"\)/);
  assert.match(rail, /exitConnectionMode/);
  assert.match(rail, /role="toolbar"/);
  assert.match(rail, /aria-pressed=\{active\}/);
  assert.doesNotMatch(rail, /role="radiogroup"|role="radio"/, "both wings are one toolbar, not two radio sets");
  assert.match(rail, /aria-live="polite"/);
  assert.match(rail, /Press C to connect Cells/);
  assert.match(rail, /Drag a centre point to another Cell/);
  assert.match(rail, /Connection created/);
  assert.match(rail, /localStorage/);
  assert.match(rail, /effectiveWidth/);
  assert.match(rail, /widgetScale \* uiScale/);
  assert.match(rail, /performanceQuality/);
  assert.match(rail, /y: 8/);
  assert.match(rail, /scale: \.985/);
  assert.match(rail, /--connection-rail-width/);
  assert.match(rail, /effectiveWidth < 420/);
  assert.match(rail, /Connection relationship type/);
  assert.doesNotMatch(rail, /Math\.max\(420,/, "Rail width must not exceed the measured narrow workspace");
  assert.match(rail, /Connection created · Press Esc to exit · C to toggle/);
});

test("Connection Studio is registered once and remains a read-only Task 2 shell", async () => {
  const registry = await import("../../ui/panels/widgetRegistry");
  const definition = (registry.WIDGET_DEFINITIONS as Record<string, unknown>)["connection-studio"] as {
    id?: string;
    label?: string;
  } | undefined;
  assert.equal(definition?.id, "connection-studio");
  assert.equal(definition?.label, "Connection Studio");
  const host = source("../../ui/widgets/WidgetHost.tsx");
  const studio = source("../../ui/widgets/ConnectionStudioWidget.tsx");
  assert.match(host, /import ConnectionStudioWidget from "\.\/ConnectionStudioWidget"/);
  assert.match(host, /"connection-studio":\s*\(\) => <ConnectionStudioWidget \/>/);
  assert.match(studio, /Editing:/);
  assert.match(studio, /Type Default/);
  assert.match(studio, /connectionModeTypeId/);
  assert.match(studio, /getPrimarySelectedConnection/);
  assert.match(studio, /selectedConnection\?\.semantic\.typeId/);
  assert.doesNotMatch(studio, /geometryId|markerId|strokePatternId|resetConnection|updateConnectionVisual/);
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

test("Organism owns one batched Canvas-local ports/preview overlay and no stored-line renderer", () => {
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.match(organism, /connectionEditingCanvasRef/);
  assert.match(organism, /data-testid="connection-editing-overlay"/);
  assert.match(organism, /deriveConnectionPorts/);
  assert.match(organism, /hitConnectionPort/);
  assert.match(organism, /resolveConnectionAutoPan/);
  assert.match(organism, /setPointerCapture/);
  assert.match(organism, /releasePointerCapture/);
  assert.match(organism, /lostpointercapture/);
  assert.match(organism, /finalizeConnectionPointer/);
  assert.match(organism, /connectionCameraCommitted/);
  assert.match(organism, /externalCameraChanged/);
  assert.match(organism, /finalizeConnectionPointer\(!externalCameraChanged\)/);
  assert.match(organism, /stateAtPress\.temporaryTool === "pan"/);
  assert.doesNotMatch(organism, /connectionTemporaryPan|onConnectionPanKeyDown/, "Canvas must consume the shared temporary pan tool instead of owning Space again");
  assert.match(organism, /connectionAuthoring\.sourceId && gesture\.mode === "none"/);
  assert.match(organism, /target\?\.state === "valid-target"/, "Cell keyline must be restricted to a valid target state");
  assert.match(organism, /screenR/, "valid targets receive a Cell keyline around the nucleus");
  assert.match(organism, /chooseConnectionSource/);
  assert.match(organism, /completeConnectionAuthoring/);
  assert.match(organism, /connectionAuthoringPreviewRef/);
  assert.match(organism, /pointerEvents: "none"/);
  assert.doesNotMatch(organism, /<line\b/, "ports/preview must be drawn in one batch");
  assert.doesNotMatch(organism, /ports\.map\s*\(/, "ports must not create one React node each");
  assert.doesNotMatch(
    organism,
    /useLab\(\(s\) => s\.connections\)/,
    "P2 must not subscribe the Organism renderer to stored Connections",
  );
  assert.doesNotMatch(organism, /connections\.map\s*\(/, "P2 must not render stored Connections");
});

test("WidgetHost defers Connection Escape from every guarded editing target", () => {
  const host = source("../../ui/widgets/WidgetHost.tsx");
  assert.match(host, /isConnectionShortcutEditingTarget/);
  assert.match(host, /isConnectionShortcutEditingTarget\(e\.target\)/);
});
