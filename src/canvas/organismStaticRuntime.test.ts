import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { SpaceCell } from "../types";
import { useLab } from "../state/store";
import { areaToRadius } from "../lib/geometry";
import * as organismAdapter from "./organismAdapter";
import { resolveConnectionLanes } from "./connections/geometry";

test.afterEach(() => {
  useLab.setState(useLab.getInitialState(), true);
});

type RuntimeStateSelector = (
  active: boolean,
  state: organismAdapter.OrganismMotionState,
) => organismAdapter.OrganismMotionState | undefined;

type MotionStateReset = (state: organismAdapter.OrganismMotionState) => void;

const optionalRuntimeState = (organismAdapter as typeof organismAdapter & {
  motionStateForRuntime?: RuntimeStateSelector;
}).motionStateForRuntime;

const optionalResetMotionState = (organismAdapter as typeof organismAdapter & {
  resetMotionState?: MotionStateReset;
}).resetMotionState;

// Before PF1A exists, this fallback reproduces the committed caller behavior:
// OrganismCanvasView passes its cache for both active and inactive runtimes.
const motionStateForRuntime: RuntimeStateSelector = optionalRuntimeState
  ?? ((_active, state) => state);
const resetMotionState: MotionStateReset = optionalResetMotionState ?? (() => undefined);

const camera = { x: 0, y: 0, zoom: 1 };
const width = 800;
const height = 600;

const cell = (id: string, x: number, y: number, area = 80): SpaceCell => ({
  id,
  name: `Cell ${id}`,
  kind: "space",
  area,
  category: "Work",
  privacy: "shared",
  color: "",
  x,
  y,
});

const worldPosition = (nucleus: organismAdapter.ProductionNucleus) =>
  organismAdapter.screenToWorld(nucleus.sx, nucleus.sy, camera, width, height);

const project = (
  spaces: SpaceCell[],
  motion: organismAdapter.OrganismMotionState | undefined,
  drag?: organismAdapter.DragPosition | null,
) => organismAdapter.spacesToNuclei(
  spaces,
  camera,
  width,
  height,
  null,
  drag,
  undefined,
  motion,
);

const assertProjectedCanonical = (
  projected: organismAdapter.ProductionNucleus[],
  canonical: SpaceCell[],
  message: string,
) => {
  assert.equal(projected.length, canonical.length, `${message}: count`);
  projected.forEach((nucleus, index) => {
    const world = worldPosition(nucleus);
    assert.ok(Math.abs(world.x - canonical[index].x) < 1e-9, `${message}: ${nucleus.id} x`);
    assert.ok(Math.abs(world.y - canonical[index].y) < 1e-9, `${message}: ${nucleus.id} y`);
  });
};

test("static runtime projects canonical position and radius without reading the motion cache", () => {
  const initial = cell("a", 0, 0, 80);
  const moved = cell("a", 300, 180, 320);
  const motion = organismAdapter.createMotionState();

  project([initial], motionStateForRuntime(true, motion));
  const projected = project([moved], motionStateForRuntime(false, motion))[0];
  const canonical = project([moved], undefined)[0];

  assert.deepEqual(
    worldPosition(projected),
    { x: 300, y: 180 },
    "the next inactive projection must display canonical geometry without a Cell click",
  );
  assert.equal(projected.screenR, canonical.screenR, "Area/radius changes project immediately while inactive");
  assert.equal(typeof optionalRuntimeState, "function", "the renderer uses one explicit active/static runtime decision");
});

test("active Motion still interpolates and direct drag remains exact", () => {
  const initial = cell("a", 0, 0, 80);
  const moved = cell("a", 300, 180, 320);
  const motion = organismAdapter.createMotionState();
  const activeState = motionStateForRuntime(true, motion);

  project([initial], activeState);
  organismAdapter.advanceMotion(motion, 0.016, 1);
  const interpolated = project([moved], activeState)[0];
  const interpolatedWorld = worldPosition(interpolated);
  assert.ok(interpolatedWorld.x > 0 && interpolatedWorld.x < 300, "active x interpolates without snapping");
  assert.ok(interpolatedWorld.y > 0 && interpolatedWorld.y < 180, "active y interpolates without snapping");

  organismAdapter.advanceMotion(motion, 0.016, 1);
  const dragged = project([moved], activeState, { id: "a", x: 125, y: 75 })[0];
  assert.deepEqual(worldPosition(dragged), { x: 125, y: 75 }, "drag override tracks the supplied pointer position exactly");
});

test("Motion transitions discard stale geometry and reactivate from canonical coordinates", () => {
  const initial = cell("a", 0, 0);
  const moved = cell("a", 300, 180);
  const motion = organismAdapter.createMotionState();

  project([initial], motionStateForRuntime(true, motion));
  motion.settling = true;
  motion.pendingDt = 0.016;

  resetMotionState(motion);
  const inactive = project([moved], motionStateForRuntime(false, motion))[0];
  assert.deepEqual(worldPosition(inactive), { x: 300, y: 180 }, "active-to-inactive cannot restore cached coordinates");
  assert.equal(motion.pendingDt, 0, "active-to-inactive cancels pending advancement");
  assert.equal(motion.settling, false, "active-to-inactive releases bounded settling work");
  assert.equal(motion.smooth.size, 0, "active-to-inactive clears stale smooth geometry");

  const reactivated = project([moved], motionStateForRuntime(true, motion))[0];
  assert.deepEqual(worldPosition(reactivated), { x: 300, y: 180 }, "inactive-to-active seeds from current canonical geometry");
  assert.deepEqual(
    motion.smooth.get("a"),
    { x: 300, y: 180, r: areaToRadius(moved.area) },
    "reactivation owns only a fresh canonical smooth entry",
  );
});

test("Connection click replacement and Shift toggle share ephemeral central selection without history", () => {
  const initial = useLab.getInitialState();
  const spaces = [cell("a", 0, 0), cell("b", 100, 0), cell("c", 200, 0)];
  const semantic = {
    typeId: "custom" as const,
    requirement: "optional" as const,
    direction: "none" as const,
    strength: "medium" as const,
    priority: "normal" as const,
    notes: "",
  };
  useLab.setState({
    spaces,
    connections: [
      { id: "ab", fromSpaceId: "a", toSpaceId: "b", enabled: true, semantic },
      { id: "bc", fromSpaceId: "b", toSpaceId: "c", enabled: true, semantic },
    ],
    selectedIds: ["a"],
    primarySelectedId: "a",
    selectedId: "a",
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    transformUndoStack: initial.transformUndoStack,
    transformRedoStack: initial.transformRedoStack,
  });
  const historyBefore = useLab.getState().transformUndoStack;
  useLab.getState().selectConnection("ab");
  assert.deepEqual(useLab.getState().selectedConnectionIds, ["ab"]);
  assert.deepEqual(useLab.getState().selectedIds, []);
  useLab.getState().selectConnection("bc", true);
  assert.deepEqual(useLab.getState().selectedConnectionIds, ["ab", "bc"]);
  useLab.getState().selectConnection("ab", true);
  assert.deepEqual(useLab.getState().selectedConnectionIds, ["bc"]);
  assert.equal(useLab.getState().primarySelectedConnectionId, "bc");
  assert.equal(useLab.getState().transformUndoStack, historyBefore);
});

test("C while the visual layer is OFF enters editing instead of exiting an active mode", () => {
  const state = useLab.getState();
  state.enterConnectionMode("adjacency");
  useLab.setState((current) => ({
    settings: {
      ...current.settings,
      connectionView: { ...current.settings.connectionView, visible: false },
    },
  }));

  useLab.getState().toggleConnectionMode();
  assert.equal(useLab.getState().connectionModeActive, true);
  assert.equal(useLab.getState().settings.connectionView.visible, true);
  assert.equal(useLab.getState().connectionModeTypeId, "adjacency");
  assert.equal(useLab.getState().connectionAuthoring.phase, "mode-ready");
});

test("Connection create, Undo/Redo, and endpoint delete/Undo preserve canonical record and lane", () => {
  const spaces = [cell("a", 0, 0), cell("b", 100, 0), cell("c", 200, 0)];
  useLab.setState({
    spaces,
    connections: [],
    selectedIds: [],
    primarySelectedId: null,
    selectedId: null,
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    transformUndoStack: [],
    transformRedoStack: [],
  });

  const createdId = useLab.getState().createConnection({
    fromSpaceId: "a",
    toSpaceId: "b",
    typeId: "direct-access",
  });
  assert.ok(createdId);
  const created = structuredClone(useLab.getState().connections[0]!);
  const createdLane = resolveConnectionLanes([created]).get(created.id)?.laneOffset;
  assert.equal(createdLane, 0);
  assert.equal(useLab.getState().transformUndoStack.length, 1);

  useLab.getState().undoSpaceTransform();
  assert.equal(useLab.getState().connections.length, 0);
  useLab.getState().redoSpaceTransform();
  assert.deepEqual(useLab.getState().connections[0], created);
  assert.equal(resolveConnectionLanes(useLab.getState().connections).get(created.id)?.laneOffset, createdLane);

  const historyBeforeDelete = useLab.getState().transformUndoStack.length;
  useLab.getState().removeSpace("b");
  assert.equal(useLab.getState().connections.length, 0);
  assert.equal(useLab.getState().transformUndoStack.length, historyBeforeDelete + 1);
  useLab.getState().undoSpaceTransform();
  assert.equal(useLab.getState().spaces.some((space) => space.id === "b"), true);
  assert.deepEqual(useLab.getState().connections[0], created);
  assert.equal(resolveConnectionLanes(useLab.getState().connections).get(created.id)?.laneOffset, createdLane);
});

test("Undo and Redo arrangements project immediately through the static path", () => {
  const initialState = useLab.getInitialState();
  const before = [cell("a", -120, -20), cell("b", 80, 40), cell("fixed", 900, 700)];
  useLab.setState({
    spaces: before,
    selectedIds: ["a", "b"],
    primarySelectedId: "b",
    selectedId: "b",
    camera,
    settings: { ...initialState.settings, rendererMode: "organism" },
    transformUndoStack: [],
    transformRedoStack: [],
  });

  const motion = organismAdapter.createMotionState();
  useLab.getState().applyLayoutPreset("colony");
  const arranged = useLab.getState().spaces;
  const arrangedProjection = project(arranged, motionStateForRuntime(false, motion));
  assertProjectedCanonical(arrangedProjection, arranged, "selected-only arrangement is visible on the next static projection");

  useLab.getState().undoSpaceTransform();
  const undone = useLab.getState().spaces;
  const undoProjection = project(undone, motionStateForRuntime(false, motion));
  assertProjectedCanonical(undoProjection, undone, "Undo is visible immediately");

  useLab.getState().redoSpaceTransform();
  const redone = useLab.getState().spaces;
  const redoProjection = project(redone, motionStateForRuntime(false, motion));
  assertProjectedCanonical(redoProjection, redone, "Redo is visible immediately");

  useLab.setState(initialState, true);
});

test("OrganismCanvasView consumes the tested runtime boundary", () => {
  const source = readFileSync(new URL("./OrganismCanvasView.tsx", import.meta.url), "utf8");
  assert.match(source, /motionStateForRuntime\(resolved\.motionActive, motionState\)/);
  assert.match(source, /resetMotionState\(motionState\)/);
});
