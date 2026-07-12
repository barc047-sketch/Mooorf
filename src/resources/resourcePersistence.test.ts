import { buildProjectSnapshot } from "../export/projectSnapshot";
import { buildProjectEnvelope, parseProjectEnvelope } from "../import/projectFiles";
import { DEFAULT_ORGANISM_SETTINGS } from "../canvas/organismProductionSettings";
import { DEFAULT_RESOURCE_SETTINGS, normalizeResourceSettings, RESOURCE_SCHEMA_VERSION } from "./resourcePersistence";
import { resourceCatalogue } from "./resourceCatalogue";

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

const settings = {
  rendererMode: "organism" as const, morphMode: "cellular-reverse" as const, attachMode: "soft" as const,
  mergeDistance: 120, blobOn: true, paletteMode: "core" as const, colorSource: "category" as const,
  layoutPreset: "organic" as const, annotationMode: "editorial" as const,
  annotationDetail: { textScale: 1, textShadow: true, showName: true, showArea: true, showCategory: true, position: "auto" as const, boundingBox: false },
  showGrid: true, nucleusPaletteId: "editorial-aurora", organismPaletteId: "mode", organism: DEFAULT_ORGANISM_SETTINGS,
  uiScale: 1, widgetScale: 1, resources: { ...DEFAULT_RESOURCE_SETTINGS, grid: { ...DEFAULT_RESOURCE_SETTINGS.grid, presetId: "technical" as const } },
};
const snapshot = buildProjectSnapshot({ spaces: [], camera: { x: 0, y: 0, zoom: 1 }, theme: "day", settings }, "Resources", new Date("2026-07-12T00:00:00.000Z"));
const roundTrip = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, []))).snapshot.settings.resources;
equal(roundTrip.grid.presetId, "technical", "grid preset round trips");
equal(roundTrip.materialBindings.spaceFill.materialId, DEFAULT_RESOURCE_SETTINGS.materialBindings.spaceFill.materialId, "material binding round trips");
ok(!JSON.stringify(roundTrip).includes("blob:"), "no Blob URLs persist");
ok(!JSON.stringify(roundTrip).includes("function"), "no functions persist");

ok(resourceCatalogue.getById("material", "palette:editorial-aurora") !== null, "catalogue gets by id");
ok(resourceCatalogue.listByCategory("material", "hue").length > 0, "catalogue lists by category");
ok(resourceCatalogue.listByTarget("material", "space-fill").length > 0, "catalogue lists by target");
ok(resourceCatalogue.search("aurora").some((entry) => entry.id === "palette:editorial-aurora"), "catalogue searches names and tags");
ok(resourceCatalogue.list({ status: "future" }).every((entry) => entry.status === "future"), "catalogue filters future resources");

console.info("resource persistence contracts passed");
