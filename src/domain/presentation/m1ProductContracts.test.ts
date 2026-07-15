import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { buildClassicSvg } from "../../export/svgExport";
import { buildProjectSnapshot } from "../../export/projectSnapshot";
import { buildProjectEnvelope, parseProjectEnvelope } from "../../import/projectFiles";
import { DEFAULT_CELL_SHADOW } from "../../canvas/cellShadow";
import { DEFAULT_RESOURCE_SETTINGS } from "../../resources/resourcePersistence";
import type { BoundaryStyle } from "./types";
import type { SpaceCell } from "../../types";
import { createProjectPresentationDefaults } from "./defaults";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const inline = source("../../canvas/InlineCellEditor.tsx");
const table = source("../../views/TableView.tsx");
const inspector = source("../../ui/widgets/InspectorWidget.tsx");
const details = source("../../ui/widgets/AppearanceSettingsWidgets.tsx");
const host = source("../../ui/widgets/WidgetHost.tsx");
const registry = source("../../ui/panels/widgetRegistry.ts");
const rail = source("../../ui/Rail.tsx");
const dock = source("../../ui/Dock.tsx");
const composite = source("../../export/canvasComposite.ts");

assert.match(inline, /Body \/ subtext/, "inline editor exposes Body");
assert.match(inline, /event\.shiftKey/, "inline Body preserves Shift+Enter line breaks");
assert.match(inline, /commitSpaceEdit/, "inline content commits through canonical history");
assert.match(table, /field="body"/, "minimal Table exposes Body");
assert.match(table, /commitSpaceEdit/, "minimal Table uses canonical history-aware content commit");
assert.match(inspector, /Content[\s\S]*Appearance/i, "the one Inspector exposes live Content and Appearance tabs");
assert.match(inspector, /data-future-tab="symbol"/, "the same Inspector declares the future M2 Symbol tab seam");
assert.doesNotMatch(inspector, /Symbol library|Symbol browser/, "M1 does not expose a fake Symbol surface");
for (const id of ["cell-settings", "membrane-settings", "void-settings"]) {
  assert.ok(host.includes(`"${id}"`), `${id} has a dedicated widget body`);
  assert.ok(registry.includes(`id: "${id}"`), `${id} has canonical widget metadata`);
}
for (const staleId of ["boundary-settings", "membrane-edge-settings", "core-settings"]) {
  assert.ok(!host.includes(`"${staleId}"`), `${staleId} no longer exposes a separate user-facing detail widget`);
  assert.ok(!registry.includes(`id: "${staleId}"`), `${staleId} no longer duplicates family settings metadata`);
}
assert.match(details, /BOUNDARY_STYLES/, "Boundary settings derive all styles from the canonical domain list");
assert.doesNotMatch(details, /unsupported non-solid|solid fallback/, "Organism no longer reports a false Boundary fallback");
assert.match(details, /Cell Surface[\s\S]*Boundary[\s\S]*Core \/ nucleus/, "Cell Detail nests Surface, Boundary and Core/nucleus");
assert.match(details, /Membrane Field[\s\S]*Membrane Edge/, "Membrane Detail nests Field and Edge");
assert.match(details, /Project Defaults · shared field/, "shared Membrane targets route to their truthful project owner");
assert.match(details, /MORPHS/, "supported legacy Morph choices move into Membrane Settings");
assert.match(rail, /launcher\("inspector"/, "visible rail i path launches the one production Inspector");
assert.match(dock, /openWidget\("inspector"\)/, "bottom bar exposes one-click Inspector access");
assert.match(dock, /appearanceFamilyDefinition[\s\S]*detailWidgetId/, "bottom bar Detail follows the active Appearance family");
assert.doesNotMatch(rail, /launcher\("annotation"|launcher\("organism"|launcher\("palette"/, "stale duplicate rail owners are removed");
assert.doesNotMatch(dock, /Reach density fine-tune|Morph style:|Attachment:/, "stale Dock appearance owners are removed");
assert.match(composite, /appearancePreview: null, presentationDefaultsPreview: null/, "clean raster capture excludes previews");

const defaults = createProjectPresentationDefaults();
const settings = {
  rendererMode: "classic" as const,
  morphMode: "cellular-reverse" as const,
  attachMode: "soft" as const,
  mergeDistance: 120,
  blobOn: false,
  paletteMode: "core" as const,
  colorSource: "category" as const,
  layoutPreset: "organic" as const,
  annotationMode: "editorial" as const,
  annotationDetail: { textScale: 1, textShadow: false, showName: true, showArea: true, showCategory: true, position: "center" as const, boundingBox: false },
  showGrid: false,
  nucleusPaletteId: "editorial-aurora",
  organismPaletteId: "mode",
  organism: {} as import("../../types").OrganismSettings,
  uiScale: 1,
  widgetScale: 1,
  resources: DEFAULT_RESOURCE_SETTINGS,
  labelScaleMode: "screen" as const,
  labelColourMode: "auto" as const,
  labelCustomColour: "#171715",
  cellShadow: DEFAULT_CELL_SHADOW,
  performanceQuality: "automatic" as const,
  presentationDefaults: defaults,
};
const base: SpaceCell = {
  id: "a",
  name: "Studio",
  body: "A quiet, bounded body with architectural subtext.",
  area: 80,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
  appearance: { text: { preset: "editorial", size: 1.2, colourMode: "custom", colour: "#203040" } },
};
const snapshot = buildProjectSnapshot({ spaces: [base], camera: { x: 0, y: 0, zoom: 1 }, theme: "day", settings }, "M1");
const roundTrip = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, []))).snapshot;
assert.equal(roundTrip.spaces[0].body, base.body, "Body round-trips through project validation");
assert.equal(roundTrip.spaces[0].appearance?.text?.preset, "editorial", "text preset round-trips sparsely");
assert.equal(roundTrip.settings.presentationDefaults.text.colourMode, "auto", "project text defaults round-trip");
const legacy = JSON.parse(JSON.stringify(buildProjectEnvelope(snapshot, []))) as Record<string, unknown>;
const legacySnapshot = (legacy.snapshot as { spaces: Array<Record<string, unknown>> });
delete legacySnapshot.spaces[0].body;
assert.equal(parseProjectEnvelope(JSON.stringify(legacy)).snapshot.spaces[0].body, "", "legacy project without Body migrates safely");

const boundaryStyles: readonly BoundaryStyle[] = ["solid", "dashed", "dotted", "dash-dot", "double", "segmented-bars"];
for (const style of boundaryStyles) {
  const svg = buildClassicSvg({
    spaces: [{ ...base, appearance: { ...base.appearance, boundary: { visible: true, style, width: 3, alignment: "outer", offset: 2, dashLength: 9, gapLength: 4, secondaryLineSpacing: 5 } } }],
    camera: { x: 0, y: 0, zoom: 1 },
    cssWidth: 800,
    cssHeight: 600,
    paletteMode: "core",
    nucleusPaletteId: "editorial-aurora",
    presentationDefaults: defaults,
    background: "#ffffff",
    includeLabels: true,
    paddingPx: 0,
  });
  assert.ok(svg.includes(`data-boundary-style="${style}"`), `Classic SVG exports ${style} Boundary truthfully`);
  assert.ok(svg.includes("bounded body") && svg.includes("with…"), `${style} SVG includes bounded, ellipsized Body content`);
  if (style === "double") assert.equal(svg.match(/data-boundary-style="double"/g)?.length, 2, "double Boundary exports two strokes");
}

console.info("C0 M1 product contracts passed");
