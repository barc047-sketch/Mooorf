import { strict as assert } from "node:assert";
import { useLab } from "../state/store";
import type { SpaceCell } from "../types";

const modulePath = "./contentEditSession";
let editing: Record<string, unknown> | null = null;
try {
  editing = await import(modulePath) as Record<string, unknown>;
} catch {
  editing = null;
}

assert.ok(editing, "Table and Inspector share an explicit content edit state machine");

type Session = {
  canonical: string;
  draft: string;
  exit: "active" | "cancelled" | "committed";
};
type Result = {
  session: Session;
  action: { kind: "none" | "cancel" | "commit"; value?: string };
  blur: boolean;
};

const begin = editing.beginContentEdit as (canonical: string) => Session;
const change = editing.changeContentEdit as (session: Session, draft: string) => Session;
const key = editing.resolveContentEditKey as (
  session: Session,
  input: { key: string; shiftKey?: boolean; multiline?: boolean }
) => Result;
const blur = editing.resolveContentEditBlur as (session: Session) => Result;

for (const [name, value] of Object.entries({ begin, change, key, blur })) {
  assert.equal(typeof value, "function", `content edit state machine exposes ${name}`);
}

const baseCell: SpaceCell = {
  id: "edit-a",
  name: "Studio",
  body: "Quiet work room",
  area: 80,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
};

const resetStore = () => useLab.setState({
  spaces: [{ ...baseCell }],
  selectedIds: [baseCell.id],
  primarySelectedId: baseCell.id,
  selectedId: baseCell.id,
  transformUndoStack: [],
  transformRedoStack: [],
});

const commitName = (result: Result) => {
  if (result.action.kind !== "commit") return;
  useLab.getState().commitSpaceContent([baseCell.id], { name: result.action.value });
};

resetStore();
const cancelledKey = key(change(begin("Studio"), "Cancelled name"), { key: "Escape" });
assert.equal(cancelledKey.action.kind, "cancel", "Escape resolves as cancellation");
assert.equal(cancelledKey.session.draft, "Studio", "Escape restores the exact canonical draft");
assert.equal(cancelledKey.blur, true, "Escape may blur after marking cancellation");
const cancelledBlur = blur(cancelledKey.session);
assert.equal(cancelledBlur.action.kind, "none", "blur after Escape cannot commit");
commitName(cancelledBlur);
assert.equal(useLab.getState().spaces[0].name, "Studio", "Escape preserves canonical content");
assert.equal(useLab.getState().transformUndoStack.length, 0, "Escape creates zero history entries");

resetStore();
const entered = key(change(begin("Studio"), "Entered once"), { key: "Enter" });
assert.equal(entered.action.kind, "commit", "Enter requests a commit");
commitName(entered);
commitName(blur(entered.session));
assert.equal(useLab.getState().spaces[0].name, "Entered once", "Enter commits canonical content");
assert.equal(useLab.getState().transformUndoStack.length, 1, "Enter plus blur creates exactly one transaction");

resetStore();
const normalBlur = blur(change(begin("Studio"), "Blurred once"));
assert.equal(normalBlur.action.kind, "commit", "ordinary blur requests a commit");
commitName(normalBlur);
assert.equal(useLab.getState().spaces[0].name, "Blurred once", "ordinary blur commits content");
assert.equal(useLab.getState().transformUndoStack.length, 1, "ordinary blur creates one transaction");

resetStore();
const bodyShiftEnter = key(change(begin("Quiet work room"), "Quiet work room\nSecond line"), {
  key: "Enter",
  shiftKey: true,
  multiline: true,
});
assert.equal(bodyShiftEnter.action.kind, "none", "Shift+Enter in Body does not commit");
assert.equal(bodyShiftEnter.blur, false, "Shift+Enter in Body keeps the editor active");
assert.equal(useLab.getState().transformUndoStack.length, 0, "Shift+Enter creates zero history entries");

console.info("C0 M1 content edit session behaviour passed");
