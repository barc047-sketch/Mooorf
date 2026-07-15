import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { buildClassicSvg } from "../../export/svgExport";
import { normalizeIconPlacement } from "../../icons/iconValidation";
import { DEFAULT_RESOURCE_SETTINGS, normalizeResourceSettings } from "../../resources/resourcePersistence";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const inspector = source("../../ui/widgets/InspectorWidget.tsx");
const symbols = source("../../ui/widgets/SymbolInspectorPane.tsx");
const appearance = source("../../ui/widgets/AppearanceSettingsWidgets.tsx");
const organism = source("../../canvas/OrganismCanvasView.tsx");
const classic = source("../../canvas/renderer.ts");
const shader = source("../../experiments/organism-lab/organism-shader.ts");
const store = source("../../state/store.ts");

assert.match(inspector, /"content", "appearance", "symbol"/, "one Inspector owns all three tabs");
assert.match(symbols, /Search symbols[\s\S]*recent[\s\S]*favourites/, "Symbol tab exposes search, recents and favourites");
assert.match(symbols, /onMouseEnter[\s\S]*onMouseLeave[\s\S]*onFocus[\s\S]*onBlur/, "pointer and keyboard focus share ephemeral preview/revert");
assert.match(symbols, /commitSymbolPlacement[\s\S]*Remove/, "apply, replace and remove route to the canonical store action");
for (const label of ["Shadow Strength", "Field Edge Softness", "Edge Softness", "Motion", "Presentation offset X", "Void fill", "Void edge"]) {
  assert.ok(appearance.includes(label), `${label} is exposed by its approved owner`);
}
assert.match(shader, /uSoftness[\s\S]*uMembraneEdgeSoftness/, "field and Membrane Edge softness have separate uniforms");
assert.match(organism, /if \(resolved\.motionActive\) advanceMotion/, "Motion Off skips advancement");
assert.match(organism, /if \(gates\.labels\) syncLabels[\s\S]*if \(gates\.grid\) syncGrid/, "Labels and Grid skip synchronization while Off");
assert.match(organism, /showLabels && annotationMode !== "hidden" && <div/, "Labels Off does not build hidden label DOM");
assert.match(classic, /resolveCellShadowGated/, "Classic uses the hard Shadow resolver gate");
assert.match(store, /symbolStyle: SymbolPlacementStyle \| null/, "Copy Style owns placement/backing without symbol identity");

const placement = normalizeIconPlacement({
  iconId: "icon:architecture:door",
  targetSpaceId: "a",
  placement: "top-right",
  scale: 1.4,
  rotation: 22,
  opacity: 0.75,
  tint: "#223344",
  backing: "circle",
  backingSize: 40,
  backingOpacity: 0.5,
  backingOutline: true,
  backingOutlineWidth: 2,
});
const resources = normalizeResourceSettings({ ...DEFAULT_RESOURCE_SETTINGS, iconPlacements: [placement] });
const svg = buildClassicSvg({
  spaces: [{ id: "a", name: "Studio", area: 80, category: "Work", privacy: "public", color: "", x: 0, y: 0 }],
  camera: { x: 0, y: 0, zoom: 1 },
  cssWidth: 800,
  cssHeight: 600,
  paletteMode: "core",
  nucleusPaletteId: "editorial-aurora",
  resources,
  background: null,
  includeLabels: false,
  paddingPx: 0,
});
assert.match(svg, /rotate\(22\)[\s\S]*stroke="#223344"/, "SVG emits transformed Lucide geometry with canonical tint");
assert.match(svg, /fill-opacity="0.5"[\s\S]*stroke-width="2"/, "SVG emits canonical backing opacity and outline");
assert.doesNotMatch(svg, /data:image|base64/, "SVG symbol export stays clean vector geometry");

console.info("C0 M2 Inspector, runtime, and export contracts passed");
