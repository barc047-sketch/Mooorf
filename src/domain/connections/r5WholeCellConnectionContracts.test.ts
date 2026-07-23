import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import {
  CONNECTION_HIT_TOLERANCE_MAX_PX,
  CONNECTION_HIT_TOLERANCE_MIN_PX,
  CONNECTION_UNRELATED_FADE_MIN,
  createDefaultConnectionViewSettings,
  createDefaultProjectConnectionStyles,
  normalizeConnectionViewSettings,
  resetConnectionSettings,
  resolveConnectionFocusOpacity,
  resolveConnectionStyle,
} from "./styles";
import { normalizeConnectionCollection } from "./model";
import { useLab } from "../../state/store";

const sourceText = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8");

const cell = (id: string, x: number) => ({
  id,
  name: id,
  body: "",
  kind: "space" as const,
  area: 12,
  category: "work",
  privacy: "public" as const,
  color: "#fff",
  x,
  y: 0,
  born: x + 1,
});

test("Connection settings omit the retired port-layout state and reset to the stronger focus default", () => {
  const defaults = createDefaultConnectionViewSettings();
  assert.deepEqual(defaults, {
    visible: true,
    focusMode: "all",
    visualScaleMode: "screen",
    defaultTypeId: "custom",
    stayInMode: true,
    selectNew: true,
    edgeAutoPan: true,
    hitTolerance: 12,
    unrelatedFade: 0.55,
    motion: "standard",
  });
  assert.equal("portLayout" in defaults, false);
  const normalized = normalizeConnectionViewSettings({
    visible: false,
    focusMode: "selected-cell",
    visualScaleMode: "canvas",
    portLayout: "cardinal",
    defaultTypeId: "project-egress",
    stayInMode: false,
    selectNew: false,
    edgeAutoPan: false,
    hitTolerance: 999,
    unrelatedFade: 0,
    motion: "reduced",
  });
  assert.equal("portLayout" in normalized, false);
  assert.equal(normalized.hitTolerance, CONNECTION_HIT_TOLERANCE_MAX_PX);
  assert.equal(normalized.unrelatedFade, CONNECTION_UNRELATED_FADE_MIN);
  assert.equal(CONNECTION_HIT_TOLERANCE_MIN_PX, 8);
  assert.deepEqual(resetConnectionSettings({ ...defaults, visible: false, focusMode: "selected-cell" }), {
    ...defaults,
    visible: false,
    focusMode: "selected-cell",
  });
  assert.equal(resolveConnectionFocusOpacity("focused", 0.28), 1);
  assert.equal(resolveConnectionFocusOpacity("related", 0.28), 0.82);
  assert.equal(resolveConnectionFocusOpacity("faded", 0.55), 0.55);
});

test("the single Settings surface has no port controls and the Canvas uses whole-Cell hit geometry", () => {
  const manager = sourceText("../../ui/widgets/ConnectionsWidget.tsx");
  const organism = sourceText("../../canvas/OrganismCanvasView.tsx");
  const editing = sourceText("../../canvas/connections/editing.ts");
  const inspector = sourceText("../../ui/widgets/InspectorWidget.tsx");
  assert.equal([...manager.matchAll(/CONNECTION SETTINGS/g)].length, 1);
  for (const label of ["VISUAL SCALE", "AUTHORING", "INTERACTION", "MOTION"]) assert.match(manager, new RegExp(label));
  assert.doesNotMatch(manager, /PORT LAYOUT|Auto \/ Center|Cardinal 4|Horizontal 2|Vertical 2|portLayout/);
  assert.doesNotMatch(organism, /ConnectionPort|connectionPort|deriveConnectionPorts|hitConnectionPort|CONNECTION_PORT/);
  assert.doesNotMatch(editing, /ConnectionPort|deriveConnectionPorts|hitConnectionPort|CONNECTION_PORT/);
  assert.match(organism, /const connectionCell = [\s\S]{0,180}hitTestNuclei\(lastNuclei, sx, sy\)/);
  assert.match(organism, /hasCell: Boolean\(connectionCell && isValidConnectionEndpoint\(connectionEndpoint\)\)/);
  assert.match(organism, /connectionHoverValid = Boolean\(sourceId && nucleusHit && nucleusHit\.id !== sourceId && isValidConnectionEndpoint\(targetSpace\)\)/);
  assert.match(organism, /arc\(source\.sx, source\.sy/);
  assert.match(organism, /arc\(validTarget\.sx, validTarget\.sy/);
  assert.match(organism, /moveTo\(source\.sx, source\.sy\)/);
  assert.match(organism, /lineTo\(validTarget\?\.sx \?\? connectionPreviewPointer\.sx/);
  assert.match(organism, /resolveConnectionAutoPan\([\s\S]{0,180}connectionEdgeAutoPan/);
  assert.match(inspector, /selectedConnectionIds\.length > 1[\s\S]{0,260}const connectionId[\s\S]{0,180}if \(connectionModeActive\) return <ConnectionModeInspector/);
});

test("new whole-Cell authoring creates one center-anchored history transaction and preserves R5 preferences", () => {
  const before = useLab.getState();
  try {
    useLab.setState({
      spaces: [cell("source", 0), cell("target", 120)],
      connections: [],
      selectedConnectionIds: [],
      primarySelectedConnectionId: null,
      connectionModeActive: false,
      connectionModeTypeId: "custom",
      connectionAuthoring: before.connectionAuthoring,
      transformUndoStack: [],
      transformRedoStack: [],
      settings: {
        ...before.settings,
        connectionStyles: createDefaultProjectConnectionStyles(),
        projectRelationshipTypes: [{
          id: "project-egress",
          name: "Egress",
          shortCode: "EGR",
          description: "",
          archived: false,
          semanticDefaults: { requirement: "required", direction: "none", strength: "medium", priority: "normal" },
          visualDefaults: {
            ...createDefaultProjectConnectionStyles().custom,
            startAnchorId: "right",
            endAnchorId: "left",
          },
          annotationDefaults: { title: { source: "hidden" }, body: { source: "hidden" } },
          origin: "project",
          builtIn: false,
        }],
        connectionView: {
          ...createDefaultConnectionViewSettings(),
          defaultTypeId: "project-egress",
          stayInMode: false,
          selectNew: false,
        },
      },
    });
    useLab.getState().enterConnectionMode();
    assert.equal(useLab.getState().connectionModeTypeId, "project-egress");
    assert.equal(useLab.getState().chooseConnectionSource("source"), true);
    const result = useLab.getState().completeConnectionAuthoring("target");
    assert.equal(result.status, "created");
    const created = useLab.getState().connections[0] as Connection;
    assert.equal(created.semantic.typeId, "project-egress");
    assert.deepEqual(created.visual, { startAnchorId: "auto", endAnchorId: "auto" });
    assert.equal(useLab.getState().connectionModeActive, false);
    assert.deepEqual(useLab.getState().selectedConnectionIds, []);
    assert.equal(useLab.getState().transformUndoStack.length, 1);
    assert.equal(useLab.getState().setProjectRelationshipTypeArchived("project-egress", true, "custom"), true);
    assert.equal(useLab.getState().settings.connectionView.defaultTypeId, "custom");
  } finally {
    useLab.setState(before, true);
  }
});

test("canonical legacy anchors remain readable while the generic default becomes strong and fluid", () => {
  const styles = createDefaultProjectConnectionStyles();
  assert.equal(styles.custom.geometryId, "curved");
  assert.equal(styles.custom.appearance.width, 3);
  assert.equal(styles.custom.appearance.opacity, 0.82);
  assert.equal(styles.custom.appearance.curve, 0.24);
  const legacy = normalizeConnectionCollection([{
    id: "legacy",
    fromSpaceId: "source",
    toSpaceId: "target",
    enabled: true,
    semantic: { typeId: "custom", requirement: "optional", direction: "none", strength: "medium", priority: "normal", notes: "" },
    visual: { startAnchorId: "left", endAnchorId: "right" },
  }], new Set(["source", "target"]))[0]!;
  assert.equal(legacy.visual?.startAnchorId, "left");
  assert.equal(legacy.visual?.endAnchorId, "right");
  assert.equal(resolveConnectionStyle({ ...legacy, visual: { appearance: { width: 0.5 } } }, styles).appearance.width, 0.5);
  assert.equal(resolveConnectionStyle({ ...legacy, visual: { appearance: { width: 64 } } }, styles).appearance.width, 64);
});
