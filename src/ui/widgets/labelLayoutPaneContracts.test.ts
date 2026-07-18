import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./LabelLayoutPane.tsx", import.meta.url), "utf8");
const opacityControls = source.match(/roleSlider\(role,\s*"Opacity"/g) ?? [];

assert.equal(opacityControls.length, 1, "each role exposes exactly one Opacity control");
assert.match(source, /Label Layout · Mixed/, "multi-selection exposes a truthful mixed layout state");
assert.match(source, /title="Ring controls"/, "Ring controls stay conditional inside the existing Inspector");
assert.match(source, /title="Flag controls"/, "Flag controls stay conditional inside the existing Inspector");

console.log("Label Layout Inspector contracts passed");
