import { strict as assert } from "node:assert";
import test from "node:test";
import { DEFAULT_CELL_LABEL_SETTINGS } from "./defaults";
import { resolveLabelScale } from "./scale";
import {
  ensureMissingSpaceCodes,
  findDuplicateSpaceCodes,
  nextSpaceCode,
  normalizeSpaceCode,
} from "./spaceCode";
import type { SpaceCell } from "../types";

const cell = (id: string, spaceCode?: string): SpaceCell => ({
  id,
  spaceCode,
  name: id,
  body: "",
  kind: "space",
  area: 20,
  category: "Uncategorized",
  privacy: "public",
  color: "",
  x: 0,
  y: 0,
});

test("new Cell labels default to scaling with the Cell", () => {
  assert.equal(DEFAULT_CELL_LABEL_SETTINGS.scaleMode, "world");
});

test("world label scale preserves the authored text-to-Cell ratio", () => {
  const atOne = resolveLabelScale({ mode: "world", authoredWorldSize: 12, zoom: 1 });
  const atFour = resolveLabelScale({ mode: "world", authoredWorldSize: 12, zoom: 4 });
  assert.equal(atOne.worldSize, 12);
  assert.equal(atFour.worldSize, 12);
  assert.equal(atFour.screenSize / atOne.screenSize, 4);
  assert.equal(atFour.inverseCameraScale, 1);
});

test("screen scale remains readable without mutating authored size", () => {
  const resolved = resolveLabelScale({ mode: "screen", authoredWorldSize: 12, zoom: 4 });
  assert.equal(resolved.screenSize, 12);
  assert.equal(resolved.worldSize, 3);
  assert.equal(resolved.inverseCameraScale, 0.25);
});

test("adaptive scale clamps only the renderer projection", () => {
  const small = resolveLabelScale({
    mode: "adaptive",
    authoredWorldSize: 12,
    zoom: 0.1,
    minimumScreenSize: 9,
    maximumScreenSize: 34,
  });
  const large = resolveLabelScale({
    mode: "adaptive",
    authoredWorldSize: 12,
    zoom: 10,
    minimumScreenSize: 9,
    maximumScreenSize: 34,
  });
  assert.equal(small.screenSize, 9);
  assert.equal(large.screenSize, 34);
});

test("missing Space Nos receive stable two-digit values without changing authored codes", () => {
  const result = ensureMissingSpaceCodes([
    cell("a", "G-01"),
    cell("b"),
    cell("c"),
  ]);
  assert.equal(result.changed, true);
  assert.deepEqual(result.spaces.map((space) => space.spaceCode), ["G-01", "01", "02"]);
  assert.equal(nextSpaceCode(result.spaces), "03");
});

test("unchanged Space Nos preserve the original array reference", () => {
  const spaces = [cell("a", "01"), cell("b", "02")];
  const result = ensureMissingSpaceCodes(spaces);
  assert.equal(result.changed, false);
  assert.equal(result.spaces, spaces);
});

test("duplicate authored Space Nos remain visible for diagnostics", () => {
  const spaces = [cell("a", "a 01"), cell("b", "A-01")];
  const result = ensureMissingSpaceCodes(spaces);
  assert.deepEqual(result.spaces.map((space) => space.spaceCode), ["A-01", "A-01"]);
  assert.deepEqual(findDuplicateSpaceCodes(result.spaces), [
    { code: "A-01", firstIndex: 0, duplicateIndex: 1 },
  ]);
  assert.equal(normalizeSpaceCode("  l2 / 07 "), "L2/07");
});
