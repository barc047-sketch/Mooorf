import { sanitizeFilename, exportTimestamp, buildCanvasFilename, buildPresentationFilename, buildDataFilename, buildPackFilename } from "./filenames";
import { spacesToCsv } from "./csv";
import { buildProjectSnapshot, computeProgrammedArea } from "./projectSnapshot";
import { buildManifest } from "./manifest";
import { resolvePageSize, fitRect } from "./pageLayout";
import { validateExportDimensions, resolvePaddingPx } from "./resolution";
import { PROJECT_SNAPSHOT_SCHEMA_VERSION, MANIFEST_SCHEMA_VERSION, DEFAULT_VISUAL_OPTIONS } from "./types";
import type { SpaceCell } from "../types";
import { DEFAULT_RESOURCE_SETTINGS } from "../resources/resourcePersistence";
import { DEFAULT_CELL_SHADOW } from "../canvas/cellShadow";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
  }
};
const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

// ---- filenames ----
equal(sanitizeFilename("My  Cool Project!!"), "my-cool-project", "sanitizes spaces/punctuation");
equal(sanitizeFilename("Café Ünïçödé"), "cafe-unicode", "strips diacritics");
equal(sanitizeFilename(""), "untitled", "empty falls back");
equal(sanitizeFilename("   "), "untitled", "whitespace-only falls back");
equal(sanitizeFilename("../../etc/passwd"), "etc-passwd", "path traversal chars stripped");
ok(sanitizeFilename("A".repeat(500)).length <= 80, "very long project titles are length-capped");
ok(!sanitizeFilename("A".repeat(500) + " " + "B".repeat(50)).endsWith("-"), "length cap never leaves a trailing dash");
equal(exportTimestamp(new Date(2026, 6, 10, 9, 5, 3)), "20260710-090503", "timestamp format");
equal(
  buildCanvasFilename("Zonuert Lab", "organism", "png", new Date(2026, 0, 1, 0, 0, 0)),
  "zonuert-lab-canvas-organism-20260101-000000.png",
  "canvas filename convention"
);
equal(
  buildPresentationFilename("Zonuert Lab", "a4", new Date(2026, 0, 1, 0, 0, 0)),
  "zonuert-lab-presentation-a4-20260101-000000.pdf",
  "presentation filename convention"
);
equal(
  buildDataFilename("Zonuert Lab", "csv", new Date(2026, 0, 1, 0, 0, 0)),
  "zonuert-lab-spaces-20260101-000000.csv",
  "CSV filename convention"
);
equal(
  buildDataFilename("Zonuert Lab", "json", new Date(2026, 0, 1, 0, 0, 0)),
  "zonuert-lab-project-20260101-000000.json",
  "JSON filename convention"
);
equal(
  buildPackFilename("Zonuert Lab", new Date(2026, 0, 1, 0, 0, 0)),
  "zonuert-lab-presentation-pack-20260101-000000.zip",
  "pack filename convention"
);

// ---- csv ----
const spaces: SpaceCell[] = [
  { id: "a", name: "Kitchen", area: 20, category: "Service", privacy: "shared", color: "#000", x: 1, y: 2 },
  { id: "b", name: "Void Nucleus", kind: "void", area: 36, category: "Void", privacy: "shared", color: "#111", x: -1, y: 0 },
  { id: "c", name: 'Quote"s, comma', area: Number.NaN, category: "Test", privacy: "private", color: "#222", x: 0, y: 0 },
];
const csv = spacesToCsv(spaces);
const csvLines = csv.trim().split("\r\n");
equal(csvLines[0], "id,name,area,category,privacy,kind,color,x,y", "CSV header order");
equal(csvLines.length, 4, "one row per space plus header");
ok(csv.includes('"Quote""s, comma"'), "CSV escapes embedded quotes/commas");
ok(csvLines[2].includes(",void,"), "void kind is labeled explicitly");
ok(csvLines[3].includes(",0,"), "NaN area serializes as 0, never NaN");

// ---- project snapshot ----
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
  nucleusPaletteId: "auto",
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
equal(computeProgrammedArea(spaces), 20, "programmed area excludes voids and NaN-safe");
const snapshot = buildProjectSnapshot(
  { spaces, camera: { x: 0, y: 0, zoom: 1 }, theme: "day", settings },
  "  My Project  ",
  new Date(2026, 0, 1)
);
equal(snapshot.schemaVersion, PROJECT_SNAPSHOT_SCHEMA_VERSION, "schema version stamped");
equal(snapshot.project.title, "My Project", "title trimmed");
equal(snapshot.spaces.length, 3, "spaces included, voids too");
equal(snapshot.summary.voidCount, 1, "void count correct");
equal(snapshot.summary.spaceCount, 3, "total space count includes voids");
equal(snapshot.summary.programmedAreaM2, 20, "summary programmed area excludes voids");
ok(JSON.stringify(snapshot).length > 0, "snapshot serializes to JSON");
ok(!("openWidgets" in snapshot), "no widget-position/session state included");

// ---- manifest ----
const manifest = buildManifest(
  {
    project: "My Project",
    files: ["canvas.png", "presentation.pdf", "spaces.csv", "project.json"],
    renderer: "organism",
    colorSource: "category",
    dimensions: { width: 1600, height: 1200 },
    visual: DEFAULT_VISUAL_OPTIONS,
    summary: { spaceCount: 3, voidCount: 1, programmedAreaM2: 20 },
  },
  new Date(2026, 0, 1)
);
equal(manifest.manifestVersion, MANIFEST_SCHEMA_VERSION, "manifest schema version stamped");
equal(manifest.files.length, 4, "manifest lists only provided files");
ok(!manifest.files.includes("manifest.json"), "manifest never lists itself as a content file");
equal(manifest.resourceSchemaVersion, 1, "manifest records resource schema version");
equal(manifest.activeGridPresetId, "none", "legacy manifest input receives safe grid fallback");

// ---- page layout ----
const a4Landscape = resolvePageSize("a4", "landscape");
ok(a4Landscape.width > a4Landscape.height, "A4 landscape is wider than tall");
const a4Portrait = resolvePageSize("a4", "portrait");
ok(a4Portrait.height > a4Portrait.width, "A4 portrait is taller than wide");
equal(a4Landscape.width, a4Portrait.height, "landscape/portrait are simple swaps, not distortions");
const a3 = resolvePageSize("a3", "portrait");
ok(a3.width > a4Portrait.width && a3.height > a4Portrait.height, "A3 is larger than A4");

const fit = fitRect(1600, 900, 800, 800);
equal(Math.round(fit.width), 800, "wide content fits to box width");
ok(fit.height < 800, "aspect ratio preserved, not stretched to fill box height");
ok(fit.x === 0, "horizontally maxed content has no x margin");
ok(fit.y > 0, "vertically short content is centered with margin");
const zeroFit = fitRect(0, 900, 800, 800);
equal(zeroFit.width, 0, "zero content width yields a safe degenerate rect");
const nanFit = fitRect(Number.NaN, 900, 800, 800);
ok(Number.isFinite(nanFit.width) && Number.isFinite(nanFit.height), "NaN input never propagates to NaN output");

// ---- resolution ----
const okDim = validateExportDimensions(1200, 800, 2);
equal(okDim.ok, true, "reasonable dimensions validate");
equal(okDim.width, 2400, "scale applied to width");
equal(okDim.height, 1600, "scale applied to height");
const hugeDim = validateExportDimensions(20000, 20000, 4);
equal(hugeDim.ok, false, "oversized dimensions are rejected");
ok(typeof hugeDim.error === "string" && hugeDim.error.length > 0, "oversized rejection carries a message");
const badDim = validateExportDimensions(Number.NaN, 800, 2);
equal(badDim.ok, false, "NaN input is rejected, not propagated");
const zeroDim = validateExportDimensions(0, 800, 2);
equal(zeroDim.ok, false, "zero dimension is rejected");
const infDim = validateExportDimensions(Number.POSITIVE_INFINITY, 800, 2);
equal(infDim.ok, false, "Infinity input is rejected");
equal(resolvePaddingPx("tight", 1), 0, "tight padding is zero");
equal(resolvePaddingPx("standard", 2), 64, "standard padding scales with resolution");
equal(resolvePaddingPx("wide", 4), 256, "wide padding scales with resolution");

console.info("export core contracts passed");
