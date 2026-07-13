import { buildProjectSnapshot } from "../export/projectSnapshot";
import { buildProjectEnvelope, parseProjectEnvelope } from "../import/projectFiles";
import { DEFAULT_ORGANISM_SETTINGS } from "../canvas/organismProductionSettings";
import { DEFAULT_RESOURCE_SETTINGS, normalizeResourceSettings, RESOURCE_SCHEMA_VERSION } from "./resourcePersistence";
import { resourceCatalogue } from "./resourceCatalogue";
import { DEFAULT_CELL_SHADOW } from "../canvas/cellShadow";

const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const equal = (actual: unknown, expected: unknown, message: string) => { if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); };
const throws = (fn: () => unknown, includes: string, message: string) => { try { fn(); } catch (error) { ok(error instanceof Error && error.message.toLowerCase().includes(includes.toLowerCase()), message); return; } throw new Error(`${message}: did not throw`); };

const normalized = normalizeResourceSettings(undefined, { showGrid: false, nucleusPaletteId: "editorial-aurora", organismPaletteId: "mode" });
equal(normalized.schemaVersion, RESOURCE_SCHEMA_VERSION, "missing resources receive current schema");
equal(normalized.grid.presetId, "none", "legacy grid setting migrates");
equal(normalized.materialBindings.spaceFill.materialId, "palette:editorial-aurora", "legacy palette migrates to equivalent material binding");
equal(normalized.annotationInstances.length, 0, "missing annotations default empty");
equal(normalized.iconPlacements.length, 0, "missing icons default empty");
throws(() => normalizeResourceSettings({ ...DEFAULT_RESOURCE_SETTINGS, schemaVersion: 99 }), "future", "future resource major versions reject");
throws(() => normalizeResourceSettings(JSON.parse('{"schemaVersion":1,"__proto__":{}}')), "unsafe", "unsafe resource keys reject");

const normalizedIconReferences = normalizeResourceSettings({
  ...DEFAULT_RESOURCE_SETTINGS,
  iconPlacements: [
    { iconId: "icon:door", targetSpaceId: "space-a", scale: 1, rotation: 0, opacity: 1, tint: "#171719", backing: "none", boundary: false, hideBelowZoom: 0 },
    { iconId: "icon:missing", targetSpaceId: "space-b", scale: 1, rotation: 0, opacity: 1, tint: "#171719", backing: "none", boundary: false, hideBelowZoom: 0 },
  ],
});
equal(normalizedIconReferences.iconPlacements[0]?.iconId, "icon:architecture:door", "legacy placement IDs migrate canonically");
equal(normalizedIconReferences.iconPlacements[1]?.iconId, "icon:missing", "unknown icon IDs remain recoverable");

const settings = {
  rendererMode: "organism" as const, morphMode: "cellular-reverse" as const, attachMode: "soft" as const,
  mergeDistance: 120, blobOn: true, paletteMode: "core" as const, colorSource: "category" as const,
  layoutPreset: "organic" as const, annotationMode: "editorial" as const,
  annotationDetail: { textScale: 1, textShadow: true, showName: true, showArea: true, showCategory: true, position: "auto" as const, boundingBox: false },
  showGrid: true, nucleusPaletteId: "editorial-aurora", organismPaletteId: "mode", organism: DEFAULT_ORGANISM_SETTINGS,
  uiScale: 1, widgetScale: 1, resources: { ...normalizedIconReferences, grid: { ...DEFAULT_RESOURCE_SETTINGS.grid, presetId: "technical" as const } },
  labelScaleMode: "screen" as const, labelColourMode: "auto" as const, labelCustomColour: "#171719",
  cellShadow: DEFAULT_CELL_SHADOW, performanceQuality: "automatic" as const,
};
const snapshot = buildProjectSnapshot({ spaces: [], camera: { x: 0, y: 0, zoom: 1 }, theme: "day", settings }, "Resources", new Date("2026-07-12T00:00:00.000Z"));
const roundTrip = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, []))).snapshot.settings.resources;
equal(roundTrip.grid.presetId, "technical", "grid preset round trips");
equal(roundTrip.materialBindings.spaceFill.materialId, DEFAULT_RESOURCE_SETTINGS.materialBindings.spaceFill.materialId, "material binding round trips");
equal(roundTrip.iconPlacements[0]?.iconId, "icon:architecture:door", "canonical icon IDs round trip");
equal(roundTrip.iconPlacements[1]?.iconId, "icon:missing", "unknown icon references round trip without crashing");
ok(!JSON.stringify(roundTrip).includes("accessibleLabel"), "registry definitions are not persisted in project resources");
ok(!JSON.stringify(roundTrip).includes("blob:"), "no Blob URLs persist");
ok(!JSON.stringify(roundTrip).includes("function"), "no functions persist");

ok(resourceCatalogue.getById("material", "palette:editorial-aurora") !== null, "catalogue gets by id");
ok(resourceCatalogue.listByCategory("material", "hue").length > 0, "catalogue lists by category");
ok(resourceCatalogue.listByTarget("material", "space-fill").length > 0, "catalogue lists by target");
ok(resourceCatalogue.search("aurora").some((entry) => entry.id === "palette:editorial-aurora"), "catalogue searches names and tags");
ok(resourceCatalogue.list({ status: "future" }).every((entry) => entry.status === "future"), "catalogue filters future resources");
equal(resourceCatalogue.list({ kind: "icon", status: "active" }).length, 77, "catalogue discovers all approved drawable symbols");
equal(resourceCatalogue.listByTarget("icon", "space").length, 77, "catalogue filters drawable symbols by Cell target");
equal(resourceCatalogue.list({ kind: "grid", status: "future" }).length, 6, "catalogue reports all metadata-only grid presets truthfully");
equal(resourceCatalogue.getById("icon", "icon:door")?.id, "icon:architecture:door", "catalogue resolves legacy icon aliases");
equal(resourceCatalogue.normalizeReadyIds(["icon:door", "icon:architecture:door", "icon:missing"]).join(","), "icon:architecture:door", "favourites and recents normalize to canonical known IDs");

console.info("resource persistence contracts passed");
