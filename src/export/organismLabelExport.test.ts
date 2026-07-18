import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./organismExport.ts", import.meta.url), "utf8");
const exportWidgetSource = readFileSync(
  new URL("../ui/widgets/ExportWidget.tsx", import.meta.url),
  "utf8"
);

assert.doesNotMatch(
  source,
  /buildClassicSvg|drawSvgOverlay/,
  "Organism PNG/PDF/ZIP never route presentation labels through Classic SVG"
);
assert.match(
  source,
  /getCellLabelLayout/,
  "Organism export consumes the shared resolved Cell label projection"
);
assert.match(
  source,
  /selectRuntimeLabelLayout/,
  "Organism export consumes the shared runtime fit and degradation projection"
);
assert.match(
  source,
  /drawCellLabelLayout/,
  "Organism export draws the shared Ring, Flag and block composition"
);
assert.match(
  exportWidgetSource,
  /rendererMode[\s\S]*?vectorSvgAvailable[\s\S]*?rendererMode !== "organism"/,
  "Organism mode explicitly excludes the legacy SVG export route"
);
assert.match(
  exportWidgetSource,
  /SVG remains a legacy Classic-only export/,
  "the Organism export UI explains the SVG limitation"
);

console.log("Organism label export wiring contracts passed");
