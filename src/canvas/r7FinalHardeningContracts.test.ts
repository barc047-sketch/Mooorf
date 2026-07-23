import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MAX_NUCLEI } from "../experiments/organism-lab/organism-types";
import type { SpaceCell } from "../types";
import { spacesToNuclei } from "./organismAdapter";

const cell = (index: number): SpaceCell => ({
  id: `r7-cell-${index}`,
  name: `R7 Cell ${index}`,
  kind: "space",
  area: 20 + (index % 5) * 4,
  category: "R7",
  privacy: "shared",
  color: "",
  x: (index % 25) * 36 - 432,
  y: Math.floor(index / 25) * 36 - 342,
});

test("production Organism accepts deterministic 100, 250 and 500 Cell fixtures", () => {
  assert.equal(MAX_NUCLEI, 500);
  for (const count of [100, 250, 500]) {
    const nuclei = spacesToNuclei(
      Array.from({ length: count }, (_, index) => cell(index)),
      { x: 0, y: 0, zoom: 1 },
      1_200,
      900,
      null,
    );
    assert.equal(nuclei.length, count);
    assert.equal(new Set(nuclei.map((nucleus) => nucleus.id)).size, count);
  }
});

test("500-Cell shader payload uses one bounded data texture instead of oversized uniform arrays", () => {
  const shader = readFileSync(
    `${process.cwd()}/src/experiments/organism-lab/organism-shader.ts`,
    "utf8",
  );
  assert.match(shader, /uniform sampler2D uNucleusData/);
  assert.match(shader, /texelFetch\(uNucleusData/);
  assert.ok(!shader.includes("uniform vec4 uNuclei[MAX_NUCLEI]"));
  assert.ok(!shader.includes("uniform vec3 uNucleusColors[MAX_NUCLEI]"));
  assert.ok(
    !shader.includes("for (int i = 0; i < MAX_NUCLEI"),
    "fragment work must stop at the uploaded runtime Cell count",
  );
});

test("production host retains one batched Connection surface and bounded sleep gates", () => {
  const view = readFileSync(`${process.cwd()}/src/canvas/OrganismCanvasView.tsx`, "utf8");
  assert.equal(view.match(/data-testid="connection-base-layer"/g)?.length, 1);
  assert.equal(view.match(/data-testid="connection-editing-overlay"/g)?.length, 1);
  assert.match(view, /if \(!runtimeActive \|\| !connectionLayerVisible\)/);
  assert.match(view, /connectionInstrumentation\.settleOff\(connections\.length\)/);
  assert.match(view, /renderLoop\?\.setPaused\(true\)/);
  assert.match(view, /renderLoop\?\.setPaused\(false\)/);
});
