import { strict as assert } from "node:assert";
import type { SpaceCell } from "../types";
import { useLab } from "../state/store";
import {
  normalizeSelectionState,
  resolveEscapeAction,
  resolveSelectionIntent,
  shouldCloseFromOutsidePointer,
  visibleSelectableIds,
} from "./selection";
import {
  CONTEXT_ACTIONS,
  getContextActions,
  resolveContextSurface,
  shouldOpenContextFromGesture,
} from "./contextActionRegistry";
import { layoutRadialActions } from "./radialLayout";
import { TOOL_REGISTRY } from "./toolRegistry";
import { executeContextCommand } from "./contextCommands";

const cell = (id: string, x = 0): SpaceCell => ({
  id,
  name: `Space ${id}`,
  kind: "space",
  area: 40,
  category: "Uncategorized",
  privacy: "public",
  color: "",
  x,
  y: 0,
});

assert.equal(resolveContextSurface(null), "blank-menu", "blank targets use the dropdown surface");
assert.equal(resolveContextSurface("a"), "object-radial", "object targets use the radial surface");

const blankActions = getContextActions("blank");
const objectActions = getContextActions("space");
assert.deepEqual(
  blankActions.map((action) => action.label),
  ["Add Space", "Add Void", "Add Line", "Add Relationship", "Add Text", "Add Paragraph", "Paste", "Import File", "View", "Tools"],
  "blank menu order stays canonical"
);
assert.deepEqual(
  objectActions.map((action) => action.label),
  ["Edit", "Materials", "Boundary", "Duplicate", "Lock", "Delete", "Group", "More"],
  "object radial order stays canonical"
);

for (const count of [6, 7, 8]) {
  const ids = objectActions.slice(0, count).map((action) => action.id);
  const layout = layoutRadialActions(ids, { x: 4, y: 4 }, { width: 768, height: 640 });
  assert.equal(layout.nodes.length, count, `radial returns ${count} action nodes`);
  assert.equal(layout.nodes.some((node) => node.x === layout.center.x && node.y === layout.center.y), false, "radial has no centre item");
  assert.equal(layout.nodes.every((node) => node.x >= 20 && node.x <= 748 && node.y >= 20 && node.y <= 620), true, "radial nodes clamp to viewport");
}

assert.equal(shouldCloseFromOutsidePointer(true, false), true, "outside pointer closes an open context surface");
assert.equal(shouldCloseFromOutsidePointer(true, true), false, "inside pointer preserves the context surface");
assert.equal(resolveEscapeAction("object-radial", ["a"]), "close-context", "Escape closes context first");
assert.equal(resolveEscapeAction(null, ["a"]), "clear-selection", "next Escape clears selection");
assert.equal(resolveEscapeAction(null, []), "none", "Escape is inert without context or selection");

assert.equal(resolveSelectionIntent({ altKey: false, shiftKey: false }), "replace", "normal click replaces selection");
assert.equal(resolveSelectionIntent({ altKey: true, shiftKey: false }), "toggle", "Alt toggles selection");
assert.equal(resolveSelectionIntent({ altKey: false, shiftKey: true }), "toggle", "Shift aliases additive selection");

assert.deepEqual(
  normalizeSelectionState({ selectedId: "legacy" }),
  { selectedId: "legacy", primarySelectedId: "legacy", selectedIds: ["legacy"] },
  "legacy selectedId migrates into canonical selection"
);

const many = Array.from({ length: 100 }, (_, index) => cell(String(index), index));
assert.equal(visibleSelectableIds(many, "organism").length, 96, "Organism select-all respects the render cap");
assert.equal(visibleSelectableIds(many, "classic").length, 100, "Classic select-all includes every rendered cell");

useLab.setState({
  spaces: [cell("a"), cell("b", 60)],
  selectedId: null,
  primarySelectedId: null,
  selectedIds: [],
  contextSurface: null,
  contextPoint: null,
  contextTargetId: null,
});

useLab.getState().replaceSelection("a");
useLab.getState().addToSelection("b");
assert.deepEqual(useLab.getState().selectedIds, ["a", "b"], "additive selection preserves prior IDs");
assert.equal(useLab.getState().primarySelectedId, "b", "latest additive target becomes primary");
assert.equal(useLab.getState().selectedId, "b", "legacy selectedId mirrors primary");

useLab.getState().toggleSelection("a");
assert.deepEqual(useLab.getState().selectedIds, ["b"], "toggle removes an existing ID");
useLab.getState().toggleSelection("a");
assert.deepEqual(useLab.getState().selectedIds, ["b", "a"], "toggle adds a missing ID");

useLab.getState().removeSpace("a");
assert.deepEqual(useLab.getState().selectedIds, ["b"], "delete removes the ID from multi-selection");
assert.equal(useLab.getState().primarySelectedId, "b", "delete promotes a remaining selected ID");
assert.equal(useLab.getState().selectedId, "b", "delete keeps the compatibility field aligned");

const duplicateId = useLab.getState().duplicateSpace("b");
assert.ok(duplicateId && duplicateId !== "b", "duplicate creates a new ID");
assert.equal(useLab.getState().primarySelectedId, duplicateId, "duplicate selects the new object");
assert.deepEqual(useLab.getState().selectedIds, [duplicateId], "duplicate replaces selection with the new object");

let editorRequest: { id: string; x: number; y: number } | null = null;
let browseCount = 0;
const commandEffects = {
  browseFiles: () => { browseCount += 1; },
  openInlineEditor: (id: string, point: { x: number; y: number }) => {
    editorRequest = { id, ...point };
  },
};

useLab.setState({
  spaces: [cell("a"), cell("b", 60)],
  camera: { x: 0, y: 0, zoom: 1 },
  openWidgets: [],
  ...normalizeSelectionState({ selectedIds: ["a", "b"], primarySelectedId: "b" }),
});
executeContextCommand("materials", { point: { x: 400, y: 300 }, targetId: "a", viewport: { width: 800, height: 600 }, effects: commandEffects });
assert.equal(useLab.getState().primarySelectedId, "a", "Materials focuses its target without dropping the selection");
assert.deepEqual(useLab.getState().openWidgets, ["palette"], "Materials opens the canonical Palette widget");

executeContextCommand("edit", { point: { x: 120, y: 160 }, targetId: "a", viewport: { width: 800, height: 600 }, effects: commandEffects });
assert.deepEqual(editorRequest, { id: "a", x: 120, y: 160 }, "Edit opens the shared inline editor at the context point");

executeContextCommand("import-file", { point: { x: 0, y: 0 }, targetId: null, viewport: { width: 800, height: 600 }, effects: commandEffects });
assert.equal(browseCount, 1, "Import delegates to the existing file intake browser");
executeContextCommand("view", { point: { x: 0, y: 0 }, targetId: null, viewport: { width: 800, height: 600 }, effects: commandEffects });
assert.deepEqual(useLab.getState().openWidgets, ["palette", "display"], "View opens the existing Display widget");

const beforeAdd = useLab.getState().spaces.length;
executeContextCommand("add-space", { point: { x: 400, y: 300 }, targetId: null, viewport: { width: 800, height: 600 }, effects: commandEffects });
assert.equal(useLab.getState().spaces.length, beforeAdd + 1, "Add Space creates one store-owned object");
const spacesAfterAdd = useLab.getState().spaces;
const addedAtPoint = spacesAfterAdd[spacesAfterAdd.length - 1];
assert.deepEqual({ x: addedAtPoint.x, y: addedAtPoint.y }, { x: 0, y: 0 }, "Add Space maps the context point into world coordinates");

useLab.setState({
  spaces: [cell("a"), cell("b", 60)],
  ...normalizeSelectionState({ selectedIds: ["a", "b"], primarySelectedId: "a" }),
});
executeContextCommand("delete", { point: { x: 0, y: 0 }, targetId: "a", viewport: { width: 800, height: 600 }, effects: commandEffects });
assert.equal(useLab.getState().spaces.length, 0, "Delete removes every selected target");
assert.deepEqual(useLab.getState().selectedIds, [], "Delete clears selected IDs");
assert.equal(useLab.getState().primarySelectedId, null, "Delete clears the primary ID");

useLab.getState().openContextSurface("blank-menu", { x: 10, y: 12 }, null);
useLab.getState().openContextSurface("blank-menu", { x: 80, y: 96 }, null);
assert.deepEqual(useLab.getState().contextPoint, { x: 80, y: 96 }, "second right-click repositions the surface");
useLab.getState().closeContextSurface();
assert.equal(useLab.getState().contextSurface, null, "close action clears the active surface");

assert.equal(shouldOpenContextFromGesture(2, false), true, "secondary click opens context");
assert.equal(shouldOpenContextFromGesture(0, false), false, "primary click never opens context");
assert.equal(shouldOpenContextFromGesture(2, true), false, "drag never opens context");

const actionIds = CONTEXT_ACTIONS.map((action) => action.id);
assert.equal(new Set(actionIds).size, actionIds.length, "context action IDs are unique");
const actionShortcuts = CONTEXT_ACTIONS.flatMap((action) => action.shortcut ? [action.shortcut] : []);
assert.equal(new Set(actionShortcuts).size, actionShortcuts.length, "context action shortcuts are unique");

const toolIds = TOOL_REGISTRY.map((tool) => tool.id);
assert.deepEqual(toolIds, ["select", "space", "void", "line", "relationship", "text", "paragraph", "frame", "pan"], "tool registry contains the canonical IDs");
assert.equal(new Set(toolIds).size, toolIds.length, "tool IDs are unique");
const toolShortcuts = TOOL_REGISTRY.map((tool) => tool.shortcut);
assert.equal(new Set(toolShortcuts).size, toolShortcuts.length, "tool shortcuts are unique");

console.info("V8.2A interaction contracts passed");
