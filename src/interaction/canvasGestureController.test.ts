import { strict as assert } from "node:assert";
import {
  CAMERA_COMMIT_DELAY_MS,
  advanceCanvasGesture,
  beginCanvasCellGesture,
  beginCanvasPanGesture,
  cancelCanvasGesture,
  completeCanvasGesture,
  createCanvasGestureState,
  mergeCanvasWheelFrame,
  resolveCanvasPanCamera,
  resolveCanvasPressSelection,
  shouldCommitCanvasCamera,
} from "./canvasGestureController";
import { createGroupTranslation, resolveGroupTranslationPositions } from "./groupDrag";

type Drag = { id: string };
type Group = { ids: string[] };
type Position = { id: string; x: number; y: number };
const state = () => createCanvasGestureState<Drag, Group, Position>();

const replace = resolveCanvasPressSelection(["a", "b"], "c", "replace");
assert.deepEqual(replace, { action: "replace", selectedIds: ["c"] }, "normal press replaces selection");
const toggle = resolveCanvasPressSelection(["a"], "b", "toggle");
assert.deepEqual(toggle, { action: "defer-toggle", selectedIds: ["a", "b"] }, "modifier press defers its toggle handoff");

const press = state();
beginCanvasCellGesture(press, { sx: 10, sy: 20 }, { id: "a" }, { ids: ["a"] }, "replace");
assert.equal(advanceCanvasGesture(press, { sx: 12, sy: 22 }, 5).enteredDrag, false, "press below threshold stays a press");
assert.equal(advanceCanvasGesture(press, { sx: 15, sy: 24 }, 5).enteredDrag, true, "threshold transition enters drag once");
assert.equal(press.mode, "drag", "threshold transition persists drag state");
press.translatedPositions = [{ id: "a", x: 18, y: 29 }];
const completed = completeCanvasGesture(press);
assert.equal(completed.mode, "drag", "group drag exposes one final commit payload");
assert.deepEqual(completed.translatedPositions, [{ id: "a", x: 18, y: 29 }], "group drag retains final positions until commit");
assert.equal(press.mode, "none", "completion resets transaction state");

const zero = state();
beginCanvasCellGesture(zero, { sx: 1, sy: 1 }, { id: "a" }, { ids: ["a"] }, "replace");
assert.equal(completeCanvasGesture(zero).mode, "press", "zero-movement release remains a click");

const cancelled = state();
beginCanvasCellGesture(cancelled, { sx: 1, sy: 1 }, { id: "a" }, { ids: ["a"] }, "toggle");
cancelCanvasGesture(cancelled);
assert.deepEqual(cancelled, state(), "pointer/context cancellation clears stale gesture state");

const pan = state();
const liveCamera = { x: 0, y: 0 };
beginCanvasPanGesture(pan, { sx: 100, sy: 100 }, liveCamera);
assert.deepEqual(resolveCanvasPanCamera(pan, { sx: 150, sy: 130 }, 1), { x: -50, y: -30 }, "one 50px/30px pointer move resolves from immutable pan anchors");
Object.assign(liveCamera, resolveCanvasPanCamera(pan, { sx: 120, sy: 110 }, 1));
assert.deepEqual(resolveCanvasPanCamera(pan, { sx: 150, sy: 130 }, 1), { x: -50, y: -30 }, "multiple moves use the total start-to-current delta rather than replaying prior movement");
Object.assign(liveCamera, resolveCanvasPanCamera(pan, { sx: 150, sy: 130 }, 1));
assert.deepEqual(resolveCanvasPanCamera(pan, { sx: 150, sy: 130 }, 1), { x: -50, y: -30 }, "repeating one pointer coordinate does not move the camera again");
assert.deepEqual(resolveCanvasPanCamera(pan, { sx: 150, sy: 130 }, 2), { x: -25, y: -15 }, "one renderer camera-zoom conversion applies no second scale factor");
const panCompletion = completeCanvasGesture(pan);
assert.equal(shouldCommitCanvasCamera(panCompletion), true, "pointer-up requests exactly one pan camera commit");
const cancelledPan = state();
beginCanvasPanGesture(cancelledPan, { sx: 100, sy: 100 }, { x: 0, y: 0 });
cancelCanvasGesture(cancelledPan);
assert.equal(shouldCommitCanvasCamera(completeCanvasGesture(cancelledPan)), false, "pointer cancellation ends without an extra camera commit");

assert.deepEqual(
  mergeCanvasWheelFrame({ deltaY: 3, sx: 10, sy: 20 }, { deltaY: -1, sx: 30, sy: 40 }),
  { deltaY: 2, sx: 30, sy: 40 },
  "wheel frames merge delta while retaining the latest cursor"
);
assert.equal(CAMERA_COMMIT_DELAY_MS, 160, "camera commit keeps the existing delayed commit request");

const translation = createGroupTranslation(
  [{ id: "a", x: 2, y: 3 } as any],
  ["a", "deleted", "a"],
  "a"
);
assert.deepEqual(resolveGroupTranslationPositions(translation, { x: 4, y: -2 }), [{ id: "a", x: 6, y: 1 }], "stale group members remain safe at the controller boundary");

console.info("canvas gesture controller contracts passed");
