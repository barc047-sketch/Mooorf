import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

test("detached Organism export uses the shared Connection and Legend projection seams", () => {
  const organism = source("./organismExport.ts");
  const capture = source("../canvas/exportCapture.ts");
  assert.match(organism, /projectConnectionsForExport/);
  assert.match(organism, /drawConnectionsForExport/);
  assert.match(organism, /projectRelationshipLegend/);
  assert.match(organism, /renderRelationshipLegendForExport/);
  assert.match(capture, /connections:\s*Connection\[\]/);
  assert.match(capture, /relationshipLegend\?:/);
  assert.doesNotMatch(organism, /querySelector|html-to-image|toDataURL|WidgetHost|RelationshipLegendWidget/);
});

test("PNG, PDF and presentation ZIP share one detached capture and packs include relationship CSV", () => {
  const service = source("./exportService.ts");
  assert.match(service, /exportPng[\s\S]*captureAndComposite/);
  assert.match(service, /exportPdf[\s\S]*captureAndComposite/);
  assert.match(service, /buildPresentationPack[\s\S]*captureAndComposite/);
  assert.match(service, /relationships\.csv/);
  assert.match(service, /relationshipsToCsv/);
});

test("Organism SVG stays unavailable rather than adding a screenshot or second renderer", () => {
  const svg = source("./svgExport.ts");
  const widget = source("../ui/widgets/ExportWidget.tsx");
  assert.match(svg, /organismSvgAvailability/);
  assert.match(widget, /SVG remains a legacy Classic-only export/);
  assert.doesNotMatch(source("./connectionExport.ts"), /from ["']react|document\.querySelector|WidgetHost/);
});
