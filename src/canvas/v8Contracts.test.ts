import { readFileSync } from "node:fs";
import { spacesToNuclei } from "./organismAdapter";
import type { SpaceCell } from "../types";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};
const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const space: SpaceCell = {
  id: "space-a", name: "Studio", area: 80, category: "Public", privacy: "public",
  color: "", x: 0, y: 0,
};
const camera = { x: 0, y: 0, zoom: 1 };
const unselected = spacesToNuclei([space], camera, 800, 600, null)[0];
const selected = spacesToNuclei([space], camera, 800, 600, space.id)[0];
equal(selected.r, unselected.r, "selection preserves radius");
equal(selected.strength, unselected.strength, "selection preserves field strength");
equal(selected.fx, unselected.fx, "selection preserves field x");
equal(selected.fy, unselected.fy, "selection preserves field y");

const shader = readFileSync(new URL("../experiments/organism-lab/organism-shader.ts", import.meta.url), "utf8");
ok(shader.includes("uNucleusColors"), "shader accepts per-nucleus colors");
ok(shader.includes("nucleusColors: Float32Array"), "render frame owns a reusable nucleus color buffer");

const organismView = readFileSync(new URL("./OrganismCanvasView.tsx", import.meta.url), "utf8");
ok(!organismView.includes("SelectedCellCommandMenu"), "automatic selection command menu is removed");
ok(organismView.includes("openContextSurface(\"inline-editor\""), "organism renderer opens the shared inline editor host");
const classicView = readFileSync(new URL("./CanvasView.tsx", import.meta.url), "utf8");
ok(classicView.includes("openContextSurface(\"inline-editor\""), "classic renderer opens the shared inline editor host");
const contextHost = readFileSync(new URL("../ui/context/ContextSurfaceHost.tsx", import.meta.url), "utf8");
ok(contextHost.includes("InlineCellEditor"), "one root host owns the shared inline editor instance");

console.info("V8 geometry, shader, and editor contracts passed");
