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
  nucleusPaletteId: "auto",
  background: "#f5f6ee",
  includeLabels: true,
  paddingPx: 0,
});

ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), "emits a valid SVG root element");
ok(svg.includes('width="800"') && svg.includes('height="600"'), "dimensions match cssWidth/cssHeight with no padding");
ok(svg.includes("<circle"), "nuclei render as true vector circles, not raster");
ok(svg.includes("Studio &lt;One&gt; &amp; &quot;Two&quot;"), "label text is XML-escaped");
ok(svg.includes('stroke-dasharray'), "void nuclei render with the dashed ring, matching drawScene");
equal((svg.match(/<circle cx="500" cy="300"/g) ?? []).length, 2, "Void SVG emits one outer fill and one outer edge with no inner echo");
ok(!svg.includes("data:image"), "no embedded raster data URI — truthful vector output");

const noLabels = buildClassicSvg({
  spaces,
  camera: { x: 0, y: 0, zoom: 1 },
  cssWidth: 800,
  cssHeight: 600,
  paletteMode: "core",
  nucleusPaletteId: "auto",
  background: null,
  includeLabels: false,
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
  nucleusPaletteId: "auto",
  background: "#fff",
  includeLabels: true,
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
  nucleusPaletteId: "auto",
  background: null,
  includeLabels: false,
  paddingPx: 0,
});
ok(zoomed.includes("<circle"), "zoomed camera still produces valid circle geometry");

const availability = organismSvgAvailability();
equal(availability.available, false, "organism SVG is truthfully unavailable");
ok(availability.reason.length > 0, "organism SVG unavailability carries an explanation");
ok(!availability.reason.toLowerCase().includes("raster"), "reason does not imply a hidden raster fallback exists");

const overlaySpaces: SpaceCell[] = [
  { id: "overlay-a", name: "Resolved A", area: 100, category: "Studio", privacy: "shared", color: "#000", x: -120, y: 80 },
  { id: "overlay-b", name: "Resolved B", kind: "void", area: 64, category: "Void", privacy: "shared", color: "#111", x: 210, y: -140 },
];
const resolvedOverlayGeometry = new Map([
  ["overlay-a", { screenX: 142.5, screenY: 267.25, screenRadius: 37.5 }],
  ["overlay-b", { screenX: 631.75, screenY: 118.5, screenRadius: 29.25 }],
]);
const overlayOptions = {
  spaces: overlaySpaces,
  camera: { x: 0, y: 0, zoom: 1.5 },
  cssWidth: 800,
  cssHeight: 600,
  paletteMode: "core" as const,
  nucleusPaletteId: "auto",
  background: null,
  includeLabels: true,
  paddingPx: 12,
};
const classicOverlay = buildClassicSvg(overlayOptions);
const resolvedOverlay = buildClassicSvg({
  ...overlayOptions,
  resolvedGeometryById: resolvedOverlayGeometry,
} as any);

ok(classicOverlay.includes('cx="232" cy="432"'), "Classic SVG retains raw camera geometry without an override");
ok(resolvedOverlay.includes('cx="154.5" cy="279.25" r="37.5"'), "resolved Cell centre and base radius receive export padding exactly once");
equal((resolvedOverlay.match(/cx="154.5" cy="279.25"/g) ?? []).length, 2, "resolved Cell and Boundary share the transformed centre without a raw-position ghost circle");
equal((resolvedOverlay.match(/cx="643.75" cy="130.5"/g) ?? []).length, 2, "resolved Void fill and edge share its transformed centre");
ok(resolvedOverlay.includes('<text x="154.5"'), "labels use the resolved Cell centre");
ok(resolvedOverlay.includes('<text x="643.75"'), "labels use the resolved Void centre");
ok(!resolvedOverlay.includes('cx="232" cy="432"'), "resolved geometry replaces raw Cell projection when supplied");

console.info("svg export contracts passed");
