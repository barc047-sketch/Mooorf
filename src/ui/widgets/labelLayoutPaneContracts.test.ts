import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./LabelLayoutPane.tsx", import.meta.url), "utf8");
const opacityControls = source.match(/roleSlider\(role,\s*"Opacity"/g) ?? [];

assert.equal(opacityControls.length, 1, "each role exposes exactly one Opacity control");
assert.match(source, /Label Layout · Mixed/, "multi-selection exposes a truthful mixed layout state");
assert.match(source, /title="Ring controls"/, "Ring controls stay conditional inside the existing Inspector");
assert.match(source, /title="Flag controls"/, "Flag controls stay conditional inside the existing Inspector");
assert.match(source, /DETAILED LABEL SETTINGS/, "compact Inspector hands off to the detailed Label Studio");
assert.match(source, /title="Fit inside Cell"/, "detailed authoring exposes the shared fit policy");
assert.match(source, /title="Ring arcs"/, "detailed authoring exposes both Ring arcs");
assert.match(source, /horizontal offset\$\{mixedTag\(offsetX\.mixed\)\}/, "each Ring arc exposes its persisted horizontal offset");
assert.match(source, /vertical offset\$\{mixedTag\(offsetY\.mixed\)\}/, "each Ring arc exposes its persisted vertical offset");
assert.match(source, /title="Flag placement"/, "detailed authoring exposes Flag placement");
assert.match(source, /title="Flag leader"/, "detailed authoring exposes Flag leader controls");
assert.match(source, /title="Flag panel"/, "detailed authoring exposes Flag panel controls");
assert.match(source, /title="Flag content"/, "detailed authoring exposes Flag content ordering");
assert.match(source, /title="Flag zoom rules"/, "detailed authoring exposes Flag zoom controls");
assert.match(source, /PreviewCancelContext/, "detailed sliders can cancel transient previews");
assert.match(source, /applyGlobal \?\? apply/, "global fit controls retain their Project Default owner");

console.log("Label Layout Inspector contracts passed");
