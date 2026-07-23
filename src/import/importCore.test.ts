import {
  PROJECT_FILE_VERSION,
  buildConfigEnvelope,
  buildProjectEnvelope,
  parseConfigEnvelope,
  parseProjectEnvelope,
  previewConfigChanges,
} from "./projectFiles";
import {
  applyTableImport,
  autoMapHeaders,
  parseCsvTable,
  parseWorksheetTable,
} from "./tableImport";
import type { ProjectExportSnapshot } from "../export/projectSnapshot";
import type { SavedCanvasSnapshot, SpaceCell } from "../types";
import { DEFAULT_RESOURCE_SETTINGS } from "../resources/resourcePersistence";
import { DEFAULT_CELL_SHADOW } from "../canvas/cellShadow";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import {
  createDefaultConnectionViewSettings,
  createDefaultProjectConnectionStyles,
  updateProjectConnectionStyle,
} from "../domain/connections/styles";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};
const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};
const throws = (fn: () => unknown, includes: string, message: string) => {
  try {
    fn();
  } catch (error) {
    ok(error instanceof Error && error.message.toLowerCase().includes(includes.toLowerCase()), message);
    return;
  }
  throw new Error(`${message}: did not throw`);
};

const settings = {
  rendererMode: "organism" as const,
  morphMode: "cellular-reverse" as const,
  attachMode: "soft" as const,
  mergeDistance: 120,
  blobOn: true,
  paletteMode: "core" as const,
  colorSource: "category" as const,
  layoutPreset: "organic" as const,
  annotationMode: "editorial" as const,
  annotationDetail: { textScale: 1, textShadow: true, showName: true, showArea: true, showCategory: true, position: "auto" as const, boundingBox: false },
  showGrid: false,
  nucleusPaletteId: "architecture-warm",
  organismPaletteId: "mode",
  organism: {} as import("../types").OrganismSettings,
  uiScale: 1.03,
  widgetScale: 0.96,
  resources: DEFAULT_RESOURCE_SETTINGS,
  labelScaleMode: "screen" as const,
  labelColourMode: "auto" as const,
  labelCustomColour: "#171719",
  cellShadow: DEFAULT_CELL_SHADOW,
  performanceQuality: "automatic" as const,
};
const presentationDefaults = createProjectPresentationDefaults(settings);
const connectionStyles = updateProjectConnectionStyle(
  createDefaultProjectConnectionStyles(),
  "direct-access",
  { appearance: { width: 4.5 } },
);
const connectionView = {
  ...createDefaultConnectionViewSettings(),
  focusMode: "selected-cell" as const,
  defaultTypeId: "direct-access",
  stayInMode: false,
  selectNew: false,
  edgeAutoPan: false,
  hitTolerance: 24,
  unrelatedFade: 0.62,
  motion: "reduced" as const,
};
const settingsWithPresentation = {
  ...settings,
  presentationDefaults,
  connectionStyles,
  connectionView,
};
const spaces: SpaceCell[] = [
  {
    id: "a",
    name: "Studio",
    area: 80,
    category: "Work",
    privacy: "shared",
    color: "#123456",
    x: 10,
    y: 20,
    appearance: { boundary: { visible: true, width: 3 } },
  },
];
const snapshot: ProjectExportSnapshot = {
  schemaVersion: 1,
  exportedAt: "2026-07-11T00:00:00.000Z",
  project: { title: "Test" },
  spaces,
  connections: [],
  camera: { x: 1, y: 2, zoom: 1.2 },
  theme: "day",
  settings: settingsWithPresentation,
  summary: { spaceCount: 1, voidCount: 0, programmedAreaM2: 80 },
};
const savedViews: SavedCanvasSnapshot[] = [];

const project = buildProjectEnvelope(snapshot, savedViews, new Date("2026-07-11T00:00:00.000Z"));
equal(project.kind, "mooorf-project", "project discriminator");
equal(project.schemaVersion, PROJECT_FILE_VERSION, "project schema version");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.spaces[0].color, "#123456", "complete project preserves explicit colors");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.spaces[0].appearance?.boundary?.width, 3, "project preserves sparse Cell appearance");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.settings.presentationDefaults.schemaVersion, 6, "project preserves presentation defaults");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.settings.connectionStyles["direct-access"].appearance.width, 4.5, "project preserves Connection type styles");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.settings.connectionView.focusMode, "selected-cell", "project preserves Connection view state");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.settings.connectionView.defaultTypeId, "direct-access", "project preserves the authoring default type");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.settings.connectionView.hitTolerance, 24, "project preserves Connection hit tolerance");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.settings.connectionView.unrelatedFade, 0.62, "project preserves contextual fade");
const solidPresentationDefaults = {
  ...presentationDefaults,
  membrane: {
    ...presentationDefaults.membrane,
    colourMode: "solid" as const,
    solidMaterialId: "system:charcoal" as const,
    paint: { ...presentationDefaults.membrane.paint, opacity: 0.44 },
  },
};
const solidProject = buildProjectEnvelope({
  ...snapshot,
  settings: { ...settingsWithPresentation, presentationDefaults: solidPresentationDefaults },
}, savedViews);
const importedSolid = parseProjectEnvelope(JSON.stringify(solidProject)).snapshot.settings.presentationDefaults.membrane;
equal(importedSolid.colourMode, "solid", "project export/import preserves Membrane Solid mode");
equal(importedSolid.solidMaterialId, "system:charcoal", "project export/import preserves registry-backed preset ID");
equal(importedSolid.paint.opacity, 0.44, "project export/import preserves Solid opacity");
const savedView: SavedCanvasSnapshot = { id: "view-1", name: "Iteration", createdAt: 1, spaces, camera: snapshot.camera, rendererMode: settings.rendererMode, morphMode: settings.morphMode, attachMode: settings.attachMode, mergeDistance: settings.mergeDistance, blobOn: settings.blobOn, paletteMode: settings.paletteMode, colorSource: settings.colorSource, layoutPreset: settings.layoutPreset, annotationMode: settings.annotationMode, organism: settings.organism, theme: "day", uiScale: settings.uiScale, widgetScale: settings.widgetScale, annotationDetail: settings.annotationDetail, showGrid: settings.showGrid, nucleusPaletteId: settings.nucleusPaletteId, organismPaletteId: settings.organismPaletteId, resources: settings.resources, presentationDefaults };
const parsedSavedView = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, [savedView]))).savedViews[0];
equal(parsedSavedView.presentationDefaults?.schemaVersion, 6, "saved-view presentation defaults round-trip");
equal(parsedSavedView.spaces[0].appearance?.boundary?.visible, true, "saved-view sparse appearance round-trips");
equal(parsedSavedView.connectionStyles?.custom.geometryId, "curved", "legacy saved view receives Connection style defaults");
equal(parsedSavedView.connectionView?.visible, true, "legacy saved view receives Connection view defaults");
const labelPresentationDefaults = {
  ...presentationDefaults,
  text: {
    ...presentationDefaults.text,
    labels: {
      layout: "ring" as const,
      ring: { startAngleDeg: 28, radiusRatio: 0.82 },
    },
  },
};
const labelSpace: SpaceCell = {
  ...spaces[0],
  appearance: {
    ...spaces[0].appearance,
    text: {
      labels: {
        layout: "flag",
        flag: { direction: "right", distance: 54, width: 104 },
      },
    },
  },
};
const labelSnapshot: ProjectExportSnapshot = {
  ...snapshot,
  spaces: [labelSpace],
  settings: {
    ...settingsWithPresentation,
    labelScaleMode: "world",
    presentationDefaults: labelPresentationDefaults,
  },
};
const parsedLabelProject = parseProjectEnvelope(
  JSON.stringify(buildProjectEnvelope(labelSnapshot, []))
);
equal(
  parsedLabelProject.snapshot.settings.presentationDefaults.text.labels.layout,
  "ring",
  "project files preserve the Project Default label layout"
);
equal(
  parsedLabelProject.snapshot.spaces[0].appearance?.text?.labels?.layout,
  "flag",
  "project files preserve sparse Cell label overrides"
);
equal(
  parsedLabelProject.snapshot.settings.labelScaleMode,
  "world",
  "project files preserve the Scale with Cell default"
);
const labelSavedView: SavedCanvasSnapshot = {
  ...savedView,
  id: "view-labels",
  spaces: [labelSpace],
  presentationDefaults: labelPresentationDefaults,
  labelScaleMode: "world",
};
const parsedLabelSavedView = parseProjectEnvelope(
  JSON.stringify(buildProjectEnvelope(labelSnapshot, [labelSavedView]))
).savedViews[0];
equal(
  parsedLabelSavedView.presentationDefaults?.text.labels.layout,
  "ring",
  "Saved Views preserve Project Default label layouts"
);
equal(
  parsedLabelSavedView.spaces[0].appearance?.text?.labels?.layout,
  "flag",
  "Saved Views preserve sparse Cell label overrides"
);
const advancedLabelPresentationDefaults: typeof presentationDefaults = {
  ...presentationDefaults,
  text: {
    ...presentationDefaults.text,
    labels: {
      layout: "technical-orbit",
      fit: {
        fitInsideCell: true,
        maximumCellOccupancy: 0.73,
        minimumReadableScreenSize: 8,
        maximumScreenTextSize: 26,
        lowZoomBodyThreshold: 0.5,
        lowZoomMetadataThreshold: 0.7,
        hideAllLabelsBelow: 0.3,
        overflowPolicy: "simplify",
      },
      ring: {
        lowZoomBehavior: "simplify",
        primaryArc: { source: "space-no-name", radiusRatio: 0.9, startAngleDeg: -12, arcSpanDeg: 176, fontRole: "name" },
        secondaryArc: { source: "body", radiusRatio: 0.58, startAngleDeg: 180, arcSpanDeg: 142, fontRole: "body", lowZoomPriority: 2 },
      },
    },
  },
};
const advancedLabelSpace: SpaceCell = {
  ...labelSpace,
  appearance: {
    ...labelSpace.appearance,
    text: {
      ...labelSpace.appearance?.text,
      labels: {
        layout: "flag",
        flag: {
          direction: "custom",
          anchorAngleDeg: 38,
          distance: 64,
          clampToFrame: true,
          avoidSourceCell: true,
          leader: "curved",
          lineStyle: "dashed",
          endpoint: "arrow",
          autoWidth: false,
          width: 136,
          minimumWidth: 84,
          maximumWidth: 220,
          background: "none",
          border: true,
          content: { no: true, name: true, body: true, metadata: false },
          contentOrder: ["name", "body", "no"],
          bodyLineClamp: 3,
          zoomMode: "adaptive",
          minimumPanelScale: 0.62,
          maximumPanelScale: 1.24,
          keepReadable: true,
        },
      },
    },
  },
};
const advancedLabelSnapshot: ProjectExportSnapshot = {
  ...labelSnapshot,
  spaces: [advancedLabelSpace],
  settings: { ...labelSnapshot.settings, presentationDefaults: advancedLabelPresentationDefaults },
};
const advancedLabelSavedView: SavedCanvasSnapshot = {
  ...labelSavedView,
  id: "view-advanced-labels",
  spaces: [advancedLabelSpace],
  presentationDefaults: advancedLabelPresentationDefaults,
};
const parsedAdvancedLabelView = parseProjectEnvelope(
  JSON.stringify(buildProjectEnvelope(advancedLabelSnapshot, [advancedLabelSavedView]))
).savedViews[0]!;
equal(parsedAdvancedLabelView.presentationDefaults?.text.labels.fit?.maximumCellOccupancy, 0.73, "Saved Views preserve advanced label fit settings");
equal(parsedAdvancedLabelView.presentationDefaults?.text.labels.ring?.primaryArc?.source, "space-no-name", "Saved Views preserve combined Space No. and Name Ring arcs");
equal(parsedAdvancedLabelView.presentationDefaults?.text.labels.ring?.secondaryArc?.source, "body", "Saved Views preserve Body secondary Ring arcs");
equal(parsedAdvancedLabelView.spaces[0].appearance?.text?.labels?.flag?.leader, "curved", "Saved Views preserve advanced Flag leader settings");
equal(parsedAdvancedLabelView.spaces[0].appearance?.text?.labels?.flag?.content?.body, true, "Saved Views preserve Flag content mapping");
equal(parsedAdvancedLabelView.spaces[0].appearance?.text?.labels?.flag?.contentOrder?.join(","), "name,body,no", "Saved Views preserve Flag content ordering");
const legacySavedView = {
  ...savedView,
  spaces: savedView.spaces.map(({ appearance: _appearance, ...space }) => space),
  nucleusPaletteId: "architecture-warm",
  resources: undefined,
  presentationDefaults: undefined,
};
const migratedSavedView = parseProjectEnvelope(JSON.stringify({ ...project, savedViews: [legacySavedView] })).savedViews[0];
equal(migratedSavedView.presentationDefaults?.cell.paint.materialId, "palette:architecture-warm", "legacy saved view derives presentation materials from its palette");
equal(migratedSavedView.spaces[0].appearance, undefined, "legacy saved-view Cells remain sparse");
equal(parseProjectEnvelope(JSON.stringify(snapshot)).snapshot.project.title, "Test", "V7.2 JSON snapshot is recognized");
const legacySnapshot = {
  ...snapshot,
  spaces: snapshot.spaces.map(({ appearance: _appearance, ...space }) => space),
  settings: Object.fromEntries(Object.entries(snapshot.settings).filter(
    ([key]) => !["presentationDefaults", "connectionStyles", "connectionView"].includes(key),
  )),
};
const migratedLegacy = parseProjectEnvelope(JSON.stringify(legacySnapshot));
equal(migratedLegacy.snapshot.settings.presentationDefaults.membrane.visible, settings.blobOn, "legacy Morph state migrates to Membrane defaults");
equal(migratedLegacy.snapshot.settings.presentationDefaults.core.visible, true, "legacy Core visibility migrates safely");
equal(migratedLegacy.snapshot.spaces[0].appearance, undefined, "legacy Cells remain sparse after migration");
equal(migratedLegacy.snapshot.settings.connectionStyles.custom.geometryId, "curved", "legacy projects receive default Connection styles");
equal(migratedLegacy.snapshot.settings.connectionView.focusMode, "all", "legacy projects receive default Connection view state");
throws(() => parseProjectEnvelope('{"kind":"wrong","schemaVersion":1}'), "kind", "invalid project kind rejected");
throws(() => parseProjectEnvelope('{"kind":"mooorf-project"}'), "schema", "missing schema rejected");
throws(() => parseProjectEnvelope(JSON.stringify({ ...project, schemaVersion: 99 })), "future", "future project rejected");
throws(() => parseProjectEnvelope("{"), "json", "malformed JSON rejected");
throws(() => parseProjectEnvelope(JSON.stringify({ ...project, snapshot: { ...snapshot, camera: { x: Infinity, y: 0, zoom: 1 } } })), "finite", "non-finite coordinates rejected");
throws(() => parseProjectEnvelope('{"kind":"mooorf-project","schemaVersion":1,"__proto__":{},"snapshot":{}}'), "unsafe", "prototype pollution keys rejected");
throws(() => parseProjectEnvelope(JSON.stringify({
  ...project,
  snapshot: {
    ...snapshot,
    settings: { ...snapshot.settings, presentationDefaults: { schemaVersion: 99 } },
  },
})), "future presentation", "future presentation schema rejected");

const config = buildConfigEnvelope(snapshot, new Date("2026-07-11T00:00:00.000Z"));
equal(parseConfigEnvelope(JSON.stringify(config)).kind, "mooorf-config", "settings-only config validates");
equal(parseConfigEnvelope(JSON.stringify(config)).settings.presentationDefaults.schemaVersion, 6, "config presentation defaults round-trip");
equal(parseConfigEnvelope(JSON.stringify(config)).settings.connectionStyles["direct-access"].appearance.width, 4.5, "config Connection styles round-trip");
equal(parseConfigEnvelope(JSON.stringify(config)).settings.connectionView.focusMode, "selected-cell", "config Connection view state round-trips");
equal(parseConfigEnvelope(JSON.stringify(config)).settings.connectionView.motion, "reduced", "config Connection motion round-trips");
const legacyConfig = {
  ...config,
  settings: Object.fromEntries(Object.entries(config.settings).filter(
    ([key]) => !["presentationDefaults", "connectionStyles", "connectionView"].includes(key),
  )),
};
equal(parseConfigEnvelope(JSON.stringify(legacyConfig)).settings.presentationDefaults.membrane.visible, settings.blobOn, "legacy config gains presentation defaults");
equal(parseConfigEnvelope(JSON.stringify(legacyConfig)).settings.connectionStyles.custom.geometryId, "curved", "legacy config gains Connection styles");
equal(parseConfigEnvelope(JSON.stringify(legacyConfig)).settings.connectionView.focusMode, "all", "legacy config gains Connection view state");
const configPreview = previewConfigChanges(config, [...spaces, { ...spaces[0], id: "b", name: "Other" }]);
equal(configPreview.matchingLayoutIds, 1, "matching layout ids counted");
equal(configPreview.unmatchedLayoutIds, 0, "unmatched ids absent");
equal(previewConfigChanges({ ...config, workspace: { ...config.workspace, spaceLayoutById: { missing: { x: 1, y: 2 } } } }, spaces).unmatchedLayoutIds, 1, "unmatched ids reported");
const badScale = parseConfigEnvelope(JSON.stringify({ ...config, settings: { ...config.settings, uiScale: 8, widgetScale: -2 } }));
ok(badScale.settings.uiScale <= 1.18 && badScale.settings.widgetScale >= 0.82, "invalid scales normalize safely");
ok(!("spaces" in badScale), "config never contains semantic space replacement");
ok(!("connections" in badScale), "config never contains semantic Connection records");

const csv = 'Space Name,Area sqm,Body,Category,Access,Colour,Pos X,Pos Y\n"Studio,\nNorth",80.5,"North light",Work,shared,#abcdef,10,20\n\n';
const csvPreview = parseCsvTable(csv);
equal(csvPreview.rows.length, 1, "quoted newline and empty row handling");
equal(csvPreview.rows[0].name, "Studio,\nNorth", "quoted comma and newline preserved");
equal(csvPreview.rows[0].area, 80.5, "area alias mapped");
equal(csvPreview.rows[0].body, "North light", "optional body mapped");
equal(csvPreview.rows[0].color, "#abcdef", "optional color mapped");
equal(csvPreview.rows[0].x, 10, "optional x mapped");
const aliases = autoMapHeaders(["Room", "Area m2", "Type", "Privacy"]);
equal(aliases.name, 0, "name alias recognized");
equal(aliases.area, 1, "area alias recognized");
const invalid = parseCsvTable("Name,Area\nGood,20\nBad,-1\nOther,nope");
equal(invalid.validCount, 1, "valid row count");
equal(invalid.errorCount, 2, "invalid areas carry row errors");
const dupes = parseCsvTable("id,name,area\na,One,20\na,Two,30\n,One,40");
ok(dupes.diagnostics.some((d) => d.message.includes("Duplicate ID")), "duplicate ids reported");
ok(dupes.diagnostics.some((d) => d.message.includes("Duplicate name")), "duplicate names reported");
const sheet = parseWorksheetTable("SPACES", [["Name", "Area"], ["Room", 25]]);
equal(sheet.sheetName, "SPACES", "worksheet name preserved");
equal(sheet.rows.length, 1, "worksheet rows mapped");
equal(parseWorksheetTable("EMPTY", []).errorCount, 1, "empty worksheet rejected");

const merged = applyTableImport(spaces, parseCsvTable("id,name,area\na,Studio Updated,90").rows, "merge-id");
equal(merged.spaces[0].x, 10, "merge preserves existing x without imported x");
equal(merged.spaces[0].name, "Studio Updated", "merge updates semantic fields");
const appended = applyTableImport(spaces, parseCsvTable("name,area\nNew Room,30").rows, "append");
equal(appended.spaces.length, 2, "append adds new spaces");
equal(appended.spaces[0].name, "Studio", "append preserves existing spaces");
const replaced = applyTableImport(spaces, parseCsvTable("name,area,body,x,y\nReplacement,50,Imported body,123,456").rows, "replace");
equal(replaced.spaces.length, 1, "replace produces only imported schedule");
equal(replaced.spaces[0].body, "Imported body", "body round-trips through table import");
equal(replaced.spaces[0].x, 123, "imported x coordinate is preserved");
equal(replaced.spaces[0].y, 456, "imported y coordinate is preserved");
const scattered = applyTableImport([], parseCsvTable("name,area\nScatter me,20").rows, "replace");
ok(Number.isFinite(scattered.spaces[0].x) && Number.isFinite(scattered.spaces[0].y), "missing coordinates use scatter placement");

console.info("file intake contracts passed");
