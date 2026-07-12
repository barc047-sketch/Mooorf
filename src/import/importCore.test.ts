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
const spaces: SpaceCell[] = [
  { id: "a", name: "Studio", area: 80, category: "Work", privacy: "shared", color: "#123456", x: 10, y: 20 },
];
const snapshot: ProjectExportSnapshot = {
  schemaVersion: 1,
  exportedAt: "2026-07-11T00:00:00.000Z",
  project: { title: "Test" },
  spaces,
  camera: { x: 1, y: 2, zoom: 1.2 },
  theme: "day",
  settings,
  summary: { spaceCount: 1, voidCount: 0, programmedAreaM2: 80 },
};
const savedViews: SavedCanvasSnapshot[] = [];

const project = buildProjectEnvelope(snapshot, savedViews, new Date("2026-07-11T00:00:00.000Z"));
equal(project.kind, "mooorf-project", "project discriminator");
equal(project.schemaVersion, PROJECT_FILE_VERSION, "project schema version");
equal(parseProjectEnvelope(JSON.stringify(project)).snapshot.spaces[0].color, "#123456", "complete project preserves explicit colors");
const savedView: SavedCanvasSnapshot = { id: "view-1", name: "Iteration", createdAt: 1, spaces, camera: snapshot.camera, rendererMode: settings.rendererMode, morphMode: settings.morphMode, attachMode: settings.attachMode, mergeDistance: settings.mergeDistance, blobOn: settings.blobOn, paletteMode: settings.paletteMode, colorSource: settings.colorSource, layoutPreset: settings.layoutPreset, annotationMode: settings.annotationMode, organism: settings.organism, theme: "day", uiScale: settings.uiScale, widgetScale: settings.widgetScale, annotationDetail: settings.annotationDetail, showGrid: settings.showGrid, nucleusPaletteId: settings.nucleusPaletteId, organismPaletteId: settings.organismPaletteId, resources: settings.resources };
equal(parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, [savedView]))).savedViews.length, 1, "saved views validate and round-trip");
equal(parseProjectEnvelope(JSON.stringify(snapshot)).snapshot.project.title, "Test", "V7.2 JSON snapshot is recognized");
throws(() => parseProjectEnvelope('{"kind":"wrong","schemaVersion":1}'), "kind", "invalid project kind rejected");
throws(() => parseProjectEnvelope('{"kind":"mooorf-project"}'), "schema", "missing schema rejected");
throws(() => parseProjectEnvelope(JSON.stringify({ ...project, schemaVersion: 99 })), "future", "future project rejected");
throws(() => parseProjectEnvelope("{"), "json", "malformed JSON rejected");
throws(() => parseProjectEnvelope(JSON.stringify({ ...project, snapshot: { ...snapshot, camera: { x: Infinity, y: 0, zoom: 1 } } })), "finite", "non-finite coordinates rejected");
throws(() => parseProjectEnvelope('{"kind":"mooorf-project","schemaVersion":1,"__proto__":{},"snapshot":{}}'), "unsafe", "prototype pollution keys rejected");

const config = buildConfigEnvelope(snapshot, new Date("2026-07-11T00:00:00.000Z"));
equal(parseConfigEnvelope(JSON.stringify(config)).kind, "mooorf-config", "settings-only config validates");
const configPreview = previewConfigChanges(config, [...spaces, { ...spaces[0], id: "b", name: "Other" }]);
equal(configPreview.matchingLayoutIds, 1, "matching layout ids counted");
equal(configPreview.unmatchedLayoutIds, 0, "unmatched ids absent");
equal(previewConfigChanges({ ...config, workspace: { ...config.workspace, spaceLayoutById: { missing: { x: 1, y: 2 } } } }, spaces).unmatchedLayoutIds, 1, "unmatched ids reported");
const badScale = parseConfigEnvelope(JSON.stringify({ ...config, settings: { ...config.settings, uiScale: 8, widgetScale: -2 } }));
ok(badScale.settings.uiScale <= 1.18 && badScale.settings.widgetScale >= 0.82, "invalid scales normalize safely");
ok(!("spaces" in badScale), "config never contains semantic space replacement");

const csv = 'Space Name,Area sqm,Category,Access,Colour,Pos X,Pos Y\n"Studio,\nNorth",80.5,Work,shared,#abcdef,10,20\n\n';
const csvPreview = parseCsvTable(csv);
equal(csvPreview.rows.length, 1, "quoted newline and empty row handling");
equal(csvPreview.rows[0].name, "Studio,\nNorth", "quoted comma and newline preserved");
equal(csvPreview.rows[0].area, 80.5, "area alias mapped");
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
const replaced = applyTableImport(spaces, parseCsvTable("name,area\nReplacement,50").rows, "replace");
equal(replaced.spaces.length, 1, "replace produces only imported schedule");

console.info("file intake contracts passed");
