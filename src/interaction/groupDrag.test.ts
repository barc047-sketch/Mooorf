import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import type { SpaceCell } from "../types";
import { useLab } from "../state/store";
import {
  applyGroupTranslation,
  createGroupTranslation,
  resolveGroupTranslationPositions,
} from "./groupDrag";

const cell = (id: string, x: number, y: number, area = 40): SpaceCell => ({
  id,
  name: `Space ${id}`,
  kind: "space",
  area,
  category: "Uncategorized",
  privacy: "public",
  color: "",
  x,
  y,
});

const positions = (spaces: readonly SpaceCell[]) =>
  spaces.map(({ id, x, y }) => ({ id, x, y }));

const initial = [cell("a", 10, 20, 25), cell("b", 40, 65, 64), cell("c", -15, 5, 81)];

const single = createGroupTranslation(initial, ["a"], "a");
assert.deepEqual(single.ids, ["a"], "single selected drag captures one object");
assert.deepEqual(
  positions(applyGroupTranslation(initial, single, { x: 12, y: -7 })),
  [{ id: "a", x: 22, y: 13 }, { id: "b", x: 40, y: 65 }, { id: "c", x: -15, y: 5 }],
  "single selected drag moves only its object"
);

const replacement = createGroupTranslation(initial, ["a", "b"], "c");
assert.deepEqual(replacement.ids, ["c"], "dragging an unselected object replaces the group");
assert.equal(replacement.selection.primarySelectedId, "c", "unselected drag makes its target primary");

const pair = createGroupTranslation(initial, ["a", "b"], "b");
assert.deepEqual(pair.ids, ["a", "b"], "selected drag preserves ordered secondary selection");
assert.equal(pair.selection.primarySelectedId, "b", "dragged group member becomes primary");
const pairAfter = applyGroupTranslation(initial, pair, { x: 8, y: -11 });
assert.deepEqual(positions(pairAfter).slice(0, 2), [{ id: "a", x: 18, y: 9 }, { id: "b", x: 48, y: 54 }], "two selected spaces receive one identical delta");
assert.deepEqual(
  { x: pairAfter[1].x - pairAfter[0].x, y: pairAfter[1].y - pairAfter[0].y },
  { x: 30, y: 45 },
  "relative offsets stay exact"
);

const ten = Array.from({ length: 10 }, (_, index) => cell(`n${index}`, index * 17, index * -9));
const tenDrag = createGroupTranslation(ten, ten.map(({ id }) => id), "n4");
assert.deepEqual(
  positions(applyGroupTranslation(ten, tenDrag, { x: -4, y: 13 })),
  ten.map(({ id, x, y }) => ({ id, x: x - 4, y: y + 13 })),
  "ten selected spaces receive the exact same delta"
);

const malformed = createGroupTranslation(initial, ["a", "a", "deleted", "b"], "b");
assert.deepEqual(malformed.ids, ["a", "b"], "duplicate and stale selection IDs normalize safely");
assert.deepEqual(
  resolveGroupTranslationPositions(malformed, { x: Number.NaN, y: 2 }),
  [],
  "non-finite deltas are rejected safely"
);
assert.deepEqual(
  positions(applyGroupTranslation(initial, malformed, { x: 0, y: 0 })),
  positions(initial),
  "zero movement creates no transform"
);
assert.equal(pairAfter[0].area, initial[0].area, "translation never changes area");
assert.equal(pairAfter[0].color, initial[0].color, "translation never changes colour or material inputs");

useLab.setState({
  spaces: initial.map((space) => ({ ...space })),
  selectedIds: ["a", "b"],
  primarySelectedId: "b",
  selectedId: "b",
  transformUndoStack: [],
  transformRedoStack: [],
});
const storeDrag = createGroupTranslation(useLab.getState().spaces, useLab.getState().selectedIds, "b");
const finalPositions = resolveGroupTranslationPositions(storeDrag, { x: 14, y: -6 });
assert.deepEqual(positions(useLab.getState().spaces), positions(initial), "pointermove preview leaves canonical spaces untouched");
useLab.getState().commitSpaceTransform(storeDrag.before, finalPositions);
assert.equal(useLab.getState().transformUndoStack.length, 1, "one group drag creates one undo entry");
assert.deepEqual(positions(useLab.getState().spaces).slice(0, 2), [{ id: "a", x: 24, y: 14 }, { id: "b", x: 54, y: 59 }], "pointer-up commit preserves group geometry");
useLab.getState().undoSpaceTransform();
assert.deepEqual(positions(useLab.getState().spaces), positions(initial), "undo restores every initial position");
useLab.getState().redoSpaceTransform();
assert.deepEqual(positions(useLab.getState().spaces).slice(0, 2), [{ id: "a", x: 24, y: 14 }, { id: "b", x: 54, y: 59 }], "redo restores every final position");

for (const rendererFile of ["../canvas/CanvasView.tsx", "../canvas/OrganismCanvasView.tsx"]) {
  const source = readFileSync(new URL(rendererFile, import.meta.url), "utf8");
  assert.equal(source.includes("createGroupTranslation"), true, `${rendererFile} uses the shared group translation contract`);
  assert.equal(source.includes("commitSpaceTransform"), true, `${rendererFile} commits one store transform`);
  assert.equal(source.includes("previewSpaceTransform"), false, `${rendererFile} keeps pointermove preview renderer-local`);
}

console.info("group drag contracts passed");
