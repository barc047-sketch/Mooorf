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
  assert.doesNotMatch(widget, /aria-live="polite"/, "Manager must not announce mode state");
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

test("Quick Rail owns one dynamic type dropdown, Manager, and Close", async () => {
  const railPath = new URL("../../ui/ConnectionQuickRail.tsx", import.meta.url);
  assert.equal(existsSync(railPath), true, "ConnectionQuickRail should exist");
  const rail = readFileSync(railPath, "utf8");
  const app = source("../../App.tsx");
  const shell = source("../../ui/shell.css");
  assert.match(app, /import ConnectionQuickRail from "\.\/ui\/ConnectionQuickRail"/);
  assert.match(app, /<ConnectionQuickRail \/>/);
  assert.match(rail, /aria-label="Connections mode active"/);
  assert.match(rail, /aria-label="Current Relationship Type"/);
  assert.match(rail, /aria-haspopup="listbox"/);
  assert.match(rail, /role="listbox"/);
  assert.match(rail, /role="option"/);
  assert.match(rail, /CONNECTION_SEMANTIC_TYPES\.map/);
  assert.match(rail, /openWidget\("connections"\)/);
  assert.match(rail, /exitConnectionMode/);
  assert.match(rail, /role="toolbar"/);
  assert.match(rail, />Connections</);
  assert.match(rail, />Manage</);
  assert.match(rail, /SlidersHorizontal/);
  assert.match(rail, /querySelector<HTMLElement>\("\.dock-group-center"\)/);
  assert.match(rail, /dockCenterRect\.left/);
  assert.match(rail, /createPortal/);
  assert.match(rail, /className="connection-quick-type-menu glass"/);
  assert.doesNotMatch(rail, /CONNECTION_SEMANTIC_TYPES\.slice/);
  assert.doesNotMatch(rail, /function TypeButton|className="connection-quick-type"|connection-quick-wing/);
  assert.doesNotMatch(rail, /openWidget\("connection-studio"\)/);
  assert.doesNotMatch(rail, /aria-live="polite"|connection-onboarding-hint/);
  assert.match(rail, /performanceQuality/);
  assert.match(rail, /y: 8/);
  assert.match(rail, /scale: \.985/);
  assert.match(rail, /--connection-rail-width/);
  assert.doesNotMatch(rail, /Math\.max\(420,/, "Rail width must not exceed the measured narrow workspace");
  assert.match(shell, /\.connection-quick-type-menu\s*\{[^}]*position: fixed;/s);
  assert.match(shell, /\.connection-quick-type-menu\s*\{[^}]*var\(--z-tooltip\)/s);
  assert.match(shell, /left: var\(--connection-rail-left, 24px\)/);
  assert.doesNotMatch(rail, /<select\b/, "Quick Rail must not use a native downward/OS-styled select");
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

test("Organism owns one batched base renderer and one shared interaction overlay", () => {
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.match(organism, /connectionCanvasRef/);
  assert.match(organism, /data-testid="connection-base-layer"/);
  assert.match(organism, /connectionEditingCanvasRef/);
  assert.match(organism, /data-testid="connection-editing-overlay"/);
  assert.match(organism, /projectConnections/);
  assert.match(organism, /drawConnectionBatch/);
  assert.match(organism, /hitTestConnections/);
  assert.match(organism, /getConnectionIndex/);
  assert.match(organism, /selectConnection\(connectionHit, e\.shiftKey\)/);
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
  assert.doesNotMatch(organism, /useLab\(\(s\) => s\.connections\)/, "stored rows stay out of React subscriptions");
  assert.doesNotMatch(organism, /connections\.map\s*\([^)]*=>\s*</, "stored rows must not create JSX");
  assert.doesNotMatch(organism, /<svg|<line\b/, "stored lines and ports remain batched Canvas2D work");
});

test("WidgetHost defers Connection Escape from every guarded editing target", () => {
  const host = source("../../ui/widgets/WidgetHost.tsx");
  assert.match(host, /isConnectionShortcutEditingTarget/);
  assert.match(host, /isConnectionShortcutEditingTarget\(e\.target\)/);
});

test("QuickToggleBar keeps the semantic Connections visibility switch outside collapsed controls", () => {
  const quickToggle = source("../../ui/QuickToggleBar.tsx");
  assert.match(quickToggle, /Connections \{connectionsVisible \? "ON" : "OFF"\}/);
  assert.match(quickToggle, /settings\.connectionView\.visible/);
  assert.match(quickToggle, /setSettings\(\{ connectionView:/);
  assert.ok(
    quickToggle.indexOf("connection-visibility-toggle") < quickToggle.indexOf('id="live-toggle-controls"'),
    "Connections visibility must remain reachable while the optional controls are collapsed",
  );
  assert.doesNotMatch(quickToggle, /setConnectionEnabled|updateConnectionVisual|filterConnections/);
});

test("Organism gives primary port drag and transient line interaction deterministic ownership", () => {
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  const directInteraction = organism.slice(
    organism.indexOf("if (isInlineEditorCommitPointer(e))"),
    organism.indexOf("const processMove"),
  );
  const idleHover = organism.slice(
    organism.indexOf('if (gesture.mode === "none")'),
    organism.indexOf("const transition = advanceCanvasGesture"),
  );
  assert.match(
    organism,
    /const connectionPressIntent = e\.button === 0 && connectionPort\s*\? "connection"\s*: resolveConnectionPressIntent/,
    "a primary press on a visible Connection port must win before temporary pan, Cell drag, or Canvas pan",
  );
  assert.match(organism, /const CONNECTION_PORT_VISIBLE_RADIUS_PX = 7\.25/);
  assert.match(organism, /const CONNECTION_PORT_HIT_RADIUS_PX = 14/);
  assert.match(
    organism,
    /hitConnectionPort\(connectionPorts, \{ x: sx, y: sy \}, CONNECTION_PORT_HIT_RADIUS_PX\)/,
    "source, move, and release must share the practical port hit target",
  );
  assert.doesNotMatch(organism, /hitConnectionPort\(connectionPorts, \{ x: sx, y: sy \}\)/);
  assert.match(organism, /arc\(port\.x, port\.y, CONNECTION_PORT_VISIBLE_RADIUS_PX/);
  assert.match(organism, /let hoveredConnectionId: string \| null = null/);
  assert.match(organism, /const hoveredCommand = hoveredConnectionId[\s\S]{0,120}connectionProjection\.commands\.find/);
  assert.match(organism, /hoveredEndpointIds/);
  assert.match(organism, /const effectiveConnectionFocusMode = selectedConnectionIdSet\.size/);
  assert.match(organism, /pointerleave/);
  assert.match(organism, /const shouldSettleConnectionOff =/);
  assert.ok(
    directInteraction.indexOf("hitTestConnections") < directInteraction.indexOf("hitTestNuclei"),
    "a visible Connection corridor must win over an overlapping Cell on pointerdown",
  );
  assert.ok(
    idleHover.indexOf("hitTestConnections") < idleHover.indexOf("hitTestNuclei"),
    "line hover must resolve before Cell hover when their screen-space targets overlap",
  );
  assert.doesNotMatch(
    organism,
    /setState\([^)]*hoveredConnection|set\([^)]*hoveredConnection/,
    "line hover must remain renderer-local transient state",
  );
});

test("Connection integration preserves hard-OFF, camera-shake, and production presentation owners", () => {
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.match(organism, /let connectionEditingSurfaceCleared = false/);
  assert.match(organism, /if \(connectionEditingSurfaceCleared\) return/);
  assert.match(organism, /connectionCanvas\.style\.transform = transform/);
  assert.match(organism, /connectionEditingCanvas\.style\.setProperty\("transform", transform\)/);
  assert.match(organism, /const local = \(e:[\s\S]{0,180}canvas\.getBoundingClientRect\(\)/);
  assert.match(organism, /data-testid="connection-base-layer"/);
  assert.match(organism, /OrganismCellLabel/);
  assert.match(organism, /\.organism-ring-label/);
  assert.match(organism, /\.organism-flag-label/);
  assert.match(organism, /projectMembraneField/);
  assert.match(organism, /pulseCameraShake/);
  assert.match(organism, /applyCameraShakeOffset/);
  assert.match(organism, /recordPortProjection/);
  assert.match(organism, /selectionOverlayDraws/);
  assert.match(organism, /anchorResolutions/);
});
