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
  assert.equal(definition?.label, "RELATIONSHIP MANAGER");
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

test("Manager reuses the canonical Relationship Type library and leaves Connection management for R4", () => {
  const widgetPath = new URL("../../ui/widgets/ConnectionsWidget.tsx", import.meta.url);
  assert.equal(existsSync(widgetPath), true, "ConnectionsWidget should exist");
  const widget = readFileSync(widgetPath, "utf8");
  const host = source("../../ui/widgets/WidgetHost.tsx");

  assert.match(host, /import ConnectionsWidget from "\.\/ConnectionsWidget"/);
  assert.match(host, /connections:\s*\(\) => <ConnectionsWidget \/>/);
  assert.match(widget, /getAllRelationshipTypes/);
  assert.match(widget, /getRelationshipTypeUsageCount/);
  assert.match(widget, /getConnectionIndex/);
  assert.match(widget, /searchRelationshipTypes/);
  assert.match(widget, />TYPES</);
  assert.match(widget, />CONNECTIONS</);
  assert.match(widget, /ConnectionManagementTab/);
  assert.match(widget, /filterConnections/);
  assert.doesNotMatch(widget, /CONNECTION_SEMANTIC_TYPES|Connect endpoints/);
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
  const typePicker = source("../../ui/RelationshipTypePicker.tsx");
  const app = source("../../App.tsx");
  const shell = source("../../ui/shell.css");
  assert.match(app, /import ConnectionQuickRail from "\.\/ui\/ConnectionQuickRail"/);
  assert.match(app, /<ConnectionQuickRail \/>/);
  assert.match(rail, /aria-label="Connections mode active"/);
  assert.match(rail, /RelationshipTypePicker/);
  assert.match(rail, /direction="up"/);
  assert.match(rail, /getSelectableRelationshipTypes/);
  assert.match(rail, /projectRelationshipTypes/);
  assert.match(rail, /connectionStyles/);
  assert.match(rail, /options=\{typeOptions\}/);
  assert.match(typePicker, /aria-haspopup="listbox"/);
  assert.match(typePicker, /role="listbox"/);
  assert.match(typePicker, /role="option"/);
  assert.match(typePicker, /createPortal/);
  assert.match(typePicker, /className="connection-quick-type-menu glass"/);
  assert.match(rail, /openWidget\("connections"\)/);
  assert.match(rail, /exitConnectionMode/);
  assert.match(rail, /role="toolbar"/);
  assert.match(rail, />Connections</);
  assert.match(rail, />Manage</);
  assert.match(rail, /SlidersHorizontal/);
  assert.match(rail, /querySelector<HTMLElement>\("\.dock-group-center"\)/);
  assert.match(rail, /dockCenterRect\.left/);
  assert.doesNotMatch(rail, /CONNECTION_SEMANTIC_TYPES\.slice/);
  assert.doesNotMatch(rail, /CONNECTION_SEMANTIC_TYPES/, "Quick Rail must consume the same dynamic selectable library as Manager and Inspector");
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

test("Connection Studio remains registered once and owns the universal style draft", async () => {
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
  assert.match(studio, /connectionStyleEditorTarget/);
  assert.match(studio, /relationship-type/);
  assert.match(studio, /connection-override/);
  assert.match(studio, /CONNECTION_GEOMETRY_IDS/);
  assert.match(studio, /CONNECTION_MARKER_IDS/);
  assert.match(studio, /CONNECTION_STROKE_PATTERNS/);
  assert.match(studio, /commitConnectionStyleEditor/);
  assert.match(studio, /RelationshipTypeStylePreview/);
  assert.doesNotMatch(studio, /updateConnectionVisual/);
});

test("the one production Inspector keeps Connection editing compact, dynamic, and annotation-led", () => {
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  assert.match(inspector, /function ConnectionInspector/);
  assert.match(inspector, /primarySelectedConnectionId/);
  assert.match(inspector, /getPrimarySelectedConnection/);
  assert.match(inspector, /getSelectableRelationshipTypes/);
  assert.match(inspector, /resolveRelationshipType/);
  assert.match(inspector, /resolveConnectionAnnotation/);
  assert.match(inspector, /resolveConnectionStyle/);
  assert.match(inspector, /updateConnectionSemantic/);
  assert.match(inspector, /updateConnectionAnnotation/);
  assert.match(inspector, /reverseConnection/);
  assert.match(inspector, /deleteConnection/);
  assert.match(inspector, /Title/);
  assert.match(inspector, /Body/);
  assert.match(inspector, /RelationshipTypeStylePreview/);
  assert.match(inspector, /openConnectionStyleEditor/);
  assert.match(inspector, /Edit Style/);
  assert.match(inspector, /Relationship Type/);
  assert.match(inspector, /Custom appearance/);
  assert.match(inspector, /function CellInspector/);
  assert.match(inspector, /<ContentField label="Space Name"/);
  assert.doesNotMatch(inspector, /CONNECTION_SEMANTIC_TYPES/);
  assert.doesNotMatch(inspector, /CONNECTION_DIRECTIONS|CONNECTION_REQUIREMENTS|CONNECTION_STRENGTHS|CONNECTION_PRIORITIES/);
  assert.doesNotMatch(inspector, /Connection notes|Select endpoints|Clear selection|Morph Bridge/);
});

test("Connection mode owns Inspector presentation without replacing canonical selection", () => {
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  assert.match(inspector, /function ConnectionModeInspector/);
  assert.match(inspector, /connectionModeActive/);
  assert.match(inspector, /Connection Mode Active/);
  assert.match(inspector, /Draw from a Cell\/port to create a Connection\./);
  assert.match(inspector, /ConnectionModeInspector[\s\S]*RelationshipTypeStylePreview/);
  assert.match(
    inspector,
    /selectedConnectionIds\.length > 1[\s\S]*connectionId[\s\S]*ConnectionInspector[\s\S]*connectionModeActive[\s\S]*ConnectionModeInspector[\s\S]*CellInspector/,
    "selected Connections win first, then Connection mode, then normal Cell presentation",
  );
});

test("Inspector consumes the shared selectable Relationship Type library including active project types", async () => {
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const connectionStyles = styles.createDefaultProjectConnectionStyles();
  const patientFlow = types.createProjectRelationshipType({
    id: "rt_patient_flow",
    name: "Patient Flow",
    shortCode: "PF",
  }, [], connectionStyles, 1);
  const archived = {
    ...types.createProjectRelationshipType({
      id: "rt_archived_flow",
      name: "Archived Flow",
      shortCode: "AF",
    }, [patientFlow], connectionStyles, 2),
    archived: true,
  };
  const selectable = types.getSelectableRelationshipTypes([patientFlow, archived], connectionStyles);

  assert.match(inspector, /getSelectableRelationshipTypes\(projectRelationshipTypes, connectionStyles\)/);
  assert.equal(selectable[0]?.id, "custom");
  assert.equal(selectable.some((type) => type.id === patientFlow.id && type.name === "Patient Flow"), true);
  assert.equal(selectable.some((type) => type.id === archived.id), false);
  assert.equal(types.resolveRelationshipType("missing", [patientFlow], connectionStyles).id, "custom");
});

test("Inspector reuses the Quick Rail-style Relationship Type listbox and opens it downward", () => {
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  assert.match(inspector, /RelationshipTypePicker/);
  assert.match(inspector, /direction="down"/);
  assert.doesNotMatch(inspector, /<select[\s\S]*?aria-label="Relationship Type"/);
});

test("Inspector exposes a distinct multi-Connection state without collapsing selection", () => {
  const inspector = source("../../ui/widgets/InspectorWidget.tsx");
  assert.match(inspector, /function ConnectionMultiInspector/);
  assert.match(inspector, /selectedConnectionIds\.length > 1/);
  assert.match(inspector, /Connections selected/);
  assert.match(inspector, /deleteSelectedConnections/);
  assert.doesNotMatch(inspector, /ConnectionMultiInspector[\s\S]{0,500}selectConnection\(/);
});

test("MainApp owns guarded Connection style clipboard and Delete shortcuts", () => {
  const app = source("../../App.tsx");
  assert.match(app, /resolveConnectionSelectionShortcut/);
  assert.match(app, /copySelectedConnectionStyle/);
  assert.match(app, /pasteConnectionStyleToSelection/);
  assert.match(app, /deleteSelectedConnections/);
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
