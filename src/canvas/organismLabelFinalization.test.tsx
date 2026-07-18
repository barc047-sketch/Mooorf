import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import type { SpaceCell } from "../types";

(globalThis as typeof globalThis & { React: typeof React }).React = React;
const { default: OrganismCellLabel } = await import("./OrganismCellLabel");

const defaults = createProjectPresentationDefaults();
defaults.text.labels = { layout: "ring" };
const space: SpaceCell = {
  id: "ring-cell",
  spaceCode: "07",
  name: "Interdisciplinary Materials Research Laboratory",
  body: "Prototype and test advanced assemblies.",
  area: 96,
  category: "Research",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
};

const markup = renderToStaticMarkup(React.createElement(OrganismCellLabel, {
  space,
  defaults,
  globalScaleMode: "world",
  textSize: 1,
  showName: true,
  showArea: true,
  showMetadata: true,
  hasSymbol: false,
  flagAutoDirection: "above",
  theme: "day",
}));

assert.match(markup, /<textPath\b/, "live Organism Ring uses one text path");
assert.doesNotMatch(markup, /organism-ring-glyph/, "live Organism Ring does not create one React node per glyph");

const viewSource = readFileSync(new URL("./OrganismCanvasView.tsx", import.meta.url), "utf8");
assert.match(
  viewSource,
  /selectRuntimeLabelLayout/,
  "live Organism consumes the shared runtime label projection"
);
assert.match(
  viewSource,
  /dataset\.runtimeHidden/,
  "live Organism applies shared bounded-degradation visibility"
);

console.log("Organism live label finalization contracts passed");
