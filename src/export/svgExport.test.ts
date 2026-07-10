import { buildClassicSvg, organismSvgAvailability } from "./svgExport";
import type { SpaceCell } from "../types";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
  }
};
const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const spaces: SpaceCell[] = [
  { id: "a", name: "Studio <One> & \"Two\"", area: 200, category: "Service", privacy: "shared", color: "#000", x: 0, y: 0 },
  { id: "b", name: "Void", kind: "void", area: 60, category: "Void", privacy: "shared", color: "#111", x: 100, y: 0 },
];

const svg = buildClassicSvg({
  spaces,
  camera: { x: 0, y: 0, zoom: 1 },
  cssWidth: 800,
  cssHeight: 600,
  paletteMode: "core",
  background: "#f5f6ee",
  includeLabels: true,
  selectedId: "a",
  paddingPx: 0,
});

ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), "emits a valid SVG root element");
ok(svg.includes('width="800"') && svg.includes('height="600"'), "dimensions match cssWidth/cssHeight with no padding");
ok(svg.includes("<circle"), "nuclei render as true vector circles, not raster");
ok(svg.includes("Studio &lt;One&gt; &amp; &quot;Two&quot;"), "label text is XML-escaped");
ok(svg.includes('stroke-dasharray'), "void nuclei render with the dashed ring, matching drawScene");
ok(!svg.includes("data:image"), "no embedded raster data URI — truthful vector output");

const noLabels = buildClassicSvg({
  spaces,
  camera: { x: 0, y: 0, zoom: 1 },
  cssWidth: 800,
  cssHeight: 600,
  paletteMode: "core",
  background: null,
  includeLabels: false,
  selectedId: null,
  paddingPx: 0,
});
ok(!noLabels.includes("<text"), "labels excluded when includeLabels is false");
ok(!noLabels.includes("<rect"), "no background rect when background is null (transparent)");

const padded = buildClassicSvg({
  spaces: [],
  camera: { x: 0, y: 0, zoom: 1 },
  cssWidth: 800,
  cssHeight: 600,
  paletteMode: "core",
  background: "#fff",
  includeLabels: true,
  selectedId: null,
  paddingPx: 32,
});
ok(padded.includes('width="864"') && padded.includes('height="664"'), "padding adds to total canvas dimensions");
ok(padded.includes("<svg"), "empty spaces array still produces a valid SVG (no spaces edge case)");

const zoomed = buildClassicSvg({
  spaces: [{ ...spaces[0], area: 100 }],
  camera: { x: 0, y: 0, zoom: 2 },
  cssWidth: 800,
  cssHeight: 600,
  paletteMode: "core",
  background: null,
  includeLabels: false,
  selectedId: null,
  paddingPx: 0,
});
ok(zoomed.includes("<circle"), "zoomed camera still produces valid circle geometry");

const availability = organismSvgAvailability();
equal(availability.available, false, "organism SVG is truthfully unavailable");
ok(availability.reason.length > 0, "organism SVG unavailability carries an explanation");
ok(!availability.reason.toLowerCase().includes("raster"), "reason does not imply a hidden raster fallback exists");

console.info("svg export contracts passed");
