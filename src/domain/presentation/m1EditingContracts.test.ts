import { strict as assert } from "node:assert";
import { areaToRadius, hitTest } from "../../lib/geometry";
import { useLab } from "../../state/store";
import type { SpaceCell } from "../../types";
import { createProjectPresentationDefaults } from "./defaults";
import {
  applyAppearancePatch,
  cloneStyle,
  resolveInheritanceState,
  TEXT_STYLE_PRESETS,
} from "./editing";
import { normalizeProjectPresentationDefaults } from "./validation";

const cell = (id: string, patch: Partial<SpaceCell> = {}): SpaceCell => ({
  id,
  name: "Studio",
  body: "A quiet place to work.",
  area: 80,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 20,
  y: -10,
  ...patch,
});

const defaults = createProjectPresentationDefaults();

assert.deepEqual(
  TEXT_STYLE_PRESETS.map(({ id }) => id),
  ["technical", "editorial", "minimal", "compact", "presentation", "diagram"],
  "M1 exposes the six coordinated Heading/Area/Body presets"
);
assert.equal(defaults.text.preset, "technical", "legacy projects gain a deterministic text preset");
assert.equal(defaults.text.size, 1, "legacy projects gain neutral text scale");
assert.equal(defaults.text.colourMode, "auto", "legacy projects retain automatic contrast");
const migratedLegacyText = normalizeProjectPresentationDefaults({ schemaVersion: 2 }, {
  annotationDetail: { textScale: 1.35 },
  labelColourMode: "white",
});
assert.equal(migratedLegacyText.text.size, 1.35, "legacy Text Scale migrates into the canonical text default");
assert.equal(migratedLegacyText.text.colourMode, "custom", "legacy fixed label colour migrates into canonical text colour mode");
assert.equal(migratedLegacyText.text.colour, "#f7f6f2", "legacy white label colour migrates exactly");

const boundaryOnly = applyAppearancePatch(undefined, defaults, "boundary", {
  visible: true,
  width: 4,
});
assert.equal(boundaryOnly?.boundary?.visible, true, "target patches create sparse overrides");
assert.equal(boundaryOnly?.boundary?.width, 4, "target patches update canonical fields");
assert.equal(boundaryOnly?.membrane, undefined, "Boundary never mutates Membrane");
assert.equal(boundaryOnly?.membraneEdge, undefined, "Boundary never mutates Membrane Edge");
assert.equal(resolveInheritanceState([undefined, boundaryOnly], "boundary"), "mixed", "mixed inheritance is explicit");
assert.equal(resolveInheritanceState([boundaryOnly], "boundary"), "local-override", "local inheritance is explicit");
assert.equal(resolveInheritanceState([undefined], "boundary"), "project-default", "default inheritance is explicit");

const bodyBefore = cell("body");
const bodyAfter = { ...bodyBefore, body: "Changed content that never changes geometry." };
assert.equal(areaToRadius(bodyAfter.area), areaToRadius(bodyBefore.area), "Body never changes Cell radius");
assert.equal(
  hitTest([bodyAfter], bodyAfter.x + areaToRadius(bodyAfter.area) - 0.1, bodyAfter.y)?.id,
  bodyAfter.id,
  "Body never changes hit testing"
);

useLab.setState({
  spaces: [cell("a"), cell("b", { x: 160, appearance: boundaryOnly })],
  selectedIds: ["a", "b"],
  primarySelectedId: "a",
  selectedId: "a",
  transformUndoStack: [],
  transformRedoStack: [],
});

useLab.getState().commitSpaceEdit("a", {
  name: "Gallery",
  area: 120,
  body: "Public exhibitions and events.",
});
assert.equal(useLab.getState().spaces[0].body, "Public exhibitions and events.", "Body commits through canonical Cell data");
assert.equal(useLab.getState().transformUndoStack.length, 1, "Name/Area/Body commit is one transaction");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().spaces[0].body, "A quiet place to work.", "Undo restores Body");
assert.equal(useLab.getState().spaces[0].area, 80, "Undo restores area-driven geometry data");
useLab.getState().redoSpaceTransform();
assert.equal(useLab.getState().spaces[0].body, "Public exhibitions and events.", "Redo restores Body");

const beforePreview = useLab.getState().spaces;
useLab.getState().previewAppearancePatch(["a", "b"], "boundary", { width: 7 });
assert.strictEqual(useLab.getState().spaces, beforePreview, "slider preview never mutates canonical Cells");
assert.equal(useLab.getState().transformUndoStack.length, 1, "preview creates no history transaction");
useLab.getState().commitAppearancePreview();
assert.equal(useLab.getState().transformUndoStack.length, 2, "preview release commits one multi-selection transaction");
assert.deepEqual(
  useLab.getState().spaces.map((space) => space.appearance?.boundary?.width),
  [7, 7],
  "one multi-selection commit applies the same canonical value"
);
useLab.getState().undoSpaceTransform();
assert.deepEqual(
  useLab.getState().spaces.map((space) => space.appearance?.boundary?.width),
  [undefined, 4],
  "Undo restores exact sparse inheritance per Cell"
);

const runtimeHistory = useLab.getState().transformUndoStack.length;
useLab.getState().previewMembraneRuntime({ mergeDistance: 188 });
assert.equal(useLab.getState().settings.mergeDistance, 120, "Membrane Reach preview remains ephemeral");
assert.equal(useLab.getState().transformUndoStack.length, runtimeHistory, "Membrane Reach preview creates no history");
useLab.getState().commitMembraneRuntimePreview();
assert.equal(useLab.getState().settings.mergeDistance, 188, "Membrane Reach commits through its canonical setting");
assert.equal(useLab.getState().transformUndoStack.length, runtimeHistory + 1, "Membrane Reach release commits once");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().settings.mergeDistance, 120, "Undo restores Membrane Reach");

const morphHistory = useLab.getState().transformUndoStack.length;
const morphBefore = useLab.getState().settings.morphMode;
useLab.getState().commitMembraneRuntime({ morphMode: "graphite" });
assert.equal(useLab.getState().settings.morphMode, "graphite", "legacy Morph style moves to the canonical Membrane runtime owner");
assert.equal(useLab.getState().transformUndoStack.length, morphHistory + 1, "Morph preset commits once");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().settings.morphMode, morphBefore, "Undo restores Morph style");

assert.equal(cloneStyle({ membrane: { visible: true }, membraneEdge: { visible: true } }).membrane, undefined, "style copy excludes the shared Membrane field");
assert.equal(cloneStyle({ membrane: { visible: true }, membraneEdge: { visible: true } }).membraneEdge, undefined, "style copy excludes the shared Membrane Edge field");

useLab.getState().commitAppearancePatch(["a"], "core", { visible: false, size: 0.6 });
useLab.getState().copyStyle("a");
const pasteHistory = useLab.getState().transformUndoStack.length;
const bodyBeforePaste = useLab.getState().spaces.find((space) => space.id === "b")?.body;
useLab.getState().pasteStyle(["b"]);
assert.equal(useLab.getState().transformUndoStack.length, pasteHistory + 1, "multi-target Paste Style is one transaction");
assert.equal(useLab.getState().spaces.find((space) => space.id === "b")?.appearance?.core?.size, 0.6, "Paste Style includes Core appearance");
assert.equal(useLab.getState().spaces.find((space) => space.id === "b")?.body, bodyBeforePaste, "Paste Style excludes Body content");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().spaces.find((space) => space.id === "b")?.appearance?.core, undefined, "Undo restores the exact pre-paste style");

const appearanceBeforeSwitch = JSON.stringify(useLab.getState().spaces.map((space) => space.appearance));
useLab.getState().setSettings({ rendererMode: "classic" });
useLab.getState().setSettings({ rendererMode: "organism" });
assert.equal(JSON.stringify(useLab.getState().spaces.map((space) => space.appearance)), appearanceBeforeSwitch, "renderer switching never changes stored appearance");

console.info("C0 M1 editing contracts passed");
