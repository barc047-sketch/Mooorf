import {
  createCellActivationState,
  isInlineEditorCommitPointer,
  markInlineEditorCommitPointer,
  normalizeInlineCellDraft,
  registerCellActivation,
  resetCellActivation,
} from "./cellActivation";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};

equal(normalizeInlineCellDraft("  Studio  ", "0", 40).name, "Studio", "name trims atomically");
equal(normalizeInlineCellDraft("   ", "NaN", 0).name, "Untitled Space", "blank name normalizes");
equal(normalizeInlineCellDraft("Studio", "0", 40).area, 1, "area clamps to minimum one");
equal(normalizeInlineCellDraft("Studio", "bad", 40).area, 40, "invalid area restores original");

const taps = createCellActivationState();
equal(registerCellActivation(taps, "a", 10, 10, 100, false), false, "single activation selects only");
equal(registerCellActivation(taps, "a", 12, 12, 300, false), true, "double activation opens once");
equal(registerCellActivation(taps, "a", 12, 12, 320, false), false, "double activation state resets");
equal(registerCellActivation(taps, "a", 30, 30, 400, true), false, "drag never opens editor");
resetCellActivation(taps);
equal(taps.id, null, "context gestures reset double-activation history");

const committingPointer = {} as PointerEvent;
markInlineEditorCommitPointer(committingPointer);
equal(isInlineEditorCommitPointer(committingPointer), true, "outside editor commit marks the pointer for canvas guards");

console.info("inline editor contracts passed");
