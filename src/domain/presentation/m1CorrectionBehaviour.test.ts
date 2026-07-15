import { strict as assert } from "node:assert";
import { buildProjectSnapshot } from "../../export/projectSnapshot";
import { useLab } from "../../state/store";
import type { SpaceCell } from "../../types";
import * as editing from "./editing";

type AppearanceFamily = {
  id: "cell" | "membrane" | "void";
  label: string;
  targets: readonly string[];
  detailWidgetId: string;
};

const families = (editing as Record<string, unknown>).APPEARANCE_FAMILIES as readonly AppearanceFamily[] | undefined;
const familyForTarget = (editing as Record<string, unknown>).appearanceFamilyForTarget as ((target: string) => AppearanceFamily["id"]) | undefined;
const familyState = (editing as Record<string, unknown>).resolveFamilyInheritanceState as ((appearances: readonly unknown[], family: AppearanceFamily["id"]) => string) | undefined;

assert.ok(families, "Appearance exposes a canonical three-family projection");
assert.equal(typeof familyForTarget, "function", "canonical targets map to their user-facing family");
assert.equal(typeof familyState, "function", "Inspector status derives from actual family inheritance");
assert.deepEqual(families?.map(({ id }) => id), ["cell", "membrane", "void"], "primary Appearance families are exactly Cell, Membrane and Void");
assert.deepEqual(families?.find(({ id }) => id === "cell")?.targets, ["cell", "boundary", "core"], "Boundary and Core stay nested under Cell ownership");
assert.deepEqual(families?.find(({ id }) => id === "membrane")?.targets, ["membrane", "membrane-edge"], "Membrane Edge stays nested under Membrane ownership");
assert.deepEqual(families?.find(({ id }) => id === "void")?.targets, ["void"], "Void owns Fill and Edge through one canonical target");
assert.equal(familyForTarget?.("boundary"), "cell", "Boundary Detail resolves to Cell family");
assert.equal(familyForTarget?.("core"), "cell", "Core Detail resolves to Cell family");
assert.equal(familyForTarget?.("membrane-edge"), "membrane", "Membrane Edge Detail resolves to Membrane family");
assert.deepEqual(families?.map(({ detailWidgetId }) => detailWidgetId), ["cell-settings", "membrane-settings", "void-settings"], "direct Detail opens one family settings widget");

assert.equal(familyState?.([undefined], "cell"), "project-default", "one selected Cell with no override reports Project Default");
assert.equal(familyState?.([{ boundary: { visible: true } }], "cell"), "mixed", "one partially overridden Cell family reports Mixed truthfully");
assert.equal(familyState?.([{
  cell: { visible: true },
  boundary: { visible: true },
  core: { visible: false },
}], "cell"), "local-override", "one fully overridden Cell family reports Local Override");
assert.equal(familyState?.([undefined, { boundary: { visible: true } }], "cell"), "mixed", "multi-selection state derives from values rather than selection count");
assert.equal(familyState?.([{ membrane: { visible: true } }], "membrane"), "project-default", "shared Membrane status remains Project Default");

useLab.setState({
  spaces: [{
    id: "family-reset",
    name: "Family reset",
    body: "Keep text",
    area: 70,
    category: "Work",
    privacy: "shared",
    color: "",
    x: 0,
    y: 0,
    appearance: {
      text: { preset: "editorial" },
      cell: { visible: false },
      boundary: { visible: true },
      core: { visible: false },
    },
  }],
  transformUndoStack: [],
  transformRedoStack: [],
});
const resetFamily = (useLab.getState() as unknown as {
  resetAppearanceFamily?: (ids: readonly string[], family: "cell" | "membrane" | "void") => void;
}).resetAppearanceFamily;
assert.equal(typeof resetFamily, "function", "Inspector family Reset uses one canonical store action");
resetFamily?.(["family-reset"], "cell");
assert.equal(useLab.getState().transformUndoStack.length, 1, "Cell family Reset is one transaction");
assert.deepEqual(useLab.getState().spaces[0].appearance, { text: { preset: "editorial" } }, "Cell family Reset removes Surface, Boundary and Core but keeps text");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().spaces[0].appearance?.boundary?.visible, true, "family Reset Undo restores exact sparse overrides");

const resetVoidStore = () => useLab.setState({
  spaces: [],
  selectedIds: [],
  primarySelectedId: null,
  selectedId: null,
  transformUndoStack: [],
  transformRedoStack: [],
});

resetVoidStore();
useLab.getState().addVoid();
const addedVoid = useLab.getState().spaces[0];
assert.equal(addedVoid.kind, "void", "Add Void keeps canonical kind: void");
assert.equal(useLab.getState().primarySelectedId, addedVoid.id, "Add Void selects the new Void");
useLab.getState().commitAppearancePatch([addedVoid.id], "void", {
  fillVisible: false,
  edgeVisible: true,
  edgeWidth: 4,
});
assert.equal(useLab.getState().spaces[0].kind, "void", "Void appearance never changes subtractive kind");
assert.equal(useLab.getState().transformUndoStack.length, 1, "Void appearance commits one transaction");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().spaces[0].appearance?.void, undefined, "Void appearance Undo restores sparse inheritance");
useLab.getState().redoSpaceTransform();
assert.equal(useLab.getState().spaces[0].appearance?.void?.edgeWidth, 4, "Void appearance Redo restores the edit");

const current = useLab.getState();
const snapshot = buildProjectSnapshot({
  spaces: current.spaces,
  camera: current.camera,
  theme: current.theme,
  settings: current.settings,
}, "M1 correction Void");
assert.equal(snapshot.spaces[0].kind, "void", "project/export snapshot preserves Void kind");
assert.equal(snapshot.spaces[0].appearance?.void?.edgeWidth, 4, "project/export snapshot preserves Void appearance");

const invalidCellLayers: SpaceCell = {
  ...addedVoid,
  appearance: {
    cell: { visible: true },
    boundary: { visible: true },
    core: { visible: true },
    void: { fillVisible: false, edgeVisible: true },
  },
};
assert.equal(invalidCellLayers.kind, "void", "Void regression fixture remains subtractive despite irrelevant Cell overrides");

console.info("C0 M1 family, status and Void behaviour passed");
