export const CAMERA_COMMIT_DELAY_MS = 160;
export type SelectionIntent = "replace" | "toggle";

export type CanvasGestureMode = "none" | "press" | "drag" | "pan";
export interface CanvasScreenPoint { sx: number; sy: number; }
export interface CanvasCameraPoint { x: number; y: number; }
export interface CanvasWheelFrame extends CanvasScreenPoint { deltaY: number; }

export interface CanvasGestureState<TDrag, TGroup, TPosition> {
  mode: CanvasGestureMode;
  press: CanvasScreenPoint | null;
  drag: TDrag | null;
  pan: { press: CanvasScreenPoint; camera: CanvasCameraPoint } | null;
  pressIntent: SelectionIntent;
  groupTranslation: TGroup | null;
  translatedPositions: TPosition[];
}

export const createCanvasGestureState = <TDrag, TGroup, TPosition>(): CanvasGestureState<TDrag, TGroup, TPosition> => ({
  mode: "none",
  press: null,
  drag: null,
  pan: null,
  pressIntent: "replace",
  groupTranslation: null,
  translatedPositions: [],
});

export type CanvasPressSelection = {
  action: "replace" | "add" | "defer-toggle";
  selectedIds: string[];
};

export const resolveCanvasPressSelection = (
  selectedIds: readonly string[],
  targetId: string,
  intent: SelectionIntent
): CanvasPressSelection => {
  if (intent === "toggle") {
    return {
      action: "defer-toggle",
      selectedIds: selectedIds.includes(targetId)
        ? selectedIds.filter((id) => id !== targetId)
        : [...selectedIds, targetId],
    };
  }
  return selectedIds.includes(targetId)
    ? { action: "add", selectedIds: [...selectedIds] }
    : { action: "replace", selectedIds: [targetId] };
};

export const beginCanvasCellGesture = <TDrag, TGroup, TPosition>(
  state: CanvasGestureState<TDrag, TGroup, TPosition>,
  press: CanvasScreenPoint,
  drag: TDrag,
  groupTranslation: TGroup,
  pressIntent: SelectionIntent,
): void => {
  state.mode = "press";
  state.press = press;
  state.drag = drag;
  state.pan = null;
  state.pressIntent = pressIntent;
  state.groupTranslation = groupTranslation;
  state.translatedPositions = [];
};

export const beginCanvasPanGesture = <TDrag, TGroup, TPosition>(
  state: CanvasGestureState<TDrag, TGroup, TPosition>,
  press: CanvasScreenPoint,
  camera: CanvasCameraPoint,
): void => {
  state.mode = "pan";
  state.press = press;
  state.drag = null;
  state.pan = { press: { ...press }, camera: { ...camera } };
  state.groupTranslation = null;
  state.translatedPositions = [];
};

export interface CanvasGestureAdvance {
  enteredDrag: boolean;
  pan: CanvasCameraPoint | null;
}

export const advanceCanvasGesture = <TDrag, TGroup, TPosition>(
  state: CanvasGestureState<TDrag, TGroup, TPosition>,
  point: CanvasScreenPoint,
  dragThresholdPx: number,
): CanvasGestureAdvance => {
  let enteredDrag = false;
  if (state.mode === "press" && state.press && Math.hypot(point.sx - state.press.sx, point.sy - state.press.sy) >= dragThresholdPx) {
    state.mode = "drag";
    enteredDrag = true;
  }
  const pan = state.mode === "pan" && state.pan
    ? {
      x: state.pan.camera.x - (point.sx - state.pan.press.sx),
      y: state.pan.camera.y - (point.sy - state.pan.press.sy),
    }
    : null;
  return { enteredDrag, pan };
};

/** Converts one absolute client-pointer position from the immutable pan
 * anchors. The renderer owns its camera unit conversion through `zoom`. */
export const resolveCanvasPanCamera = <TDrag, TGroup, TPosition>(
  state: CanvasGestureState<TDrag, TGroup, TPosition>,
  point: CanvasScreenPoint,
  zoom: number,
): CanvasCameraPoint | null => {
  if (state.mode !== "pan" || !state.pan || !Number.isFinite(zoom) || zoom <= 0) return null;
  return {
    x: state.pan.camera.x - (point.sx - state.pan.press.sx) / zoom,
    y: state.pan.camera.y - (point.sy - state.pan.press.sy) / zoom,
  };
};

export interface CanvasGestureCompletion<TDrag, TGroup, TPosition> {
  mode: CanvasGestureMode;
  drag: TDrag | null;
  pressIntent: SelectionIntent;
  groupTranslation: TGroup | null;
  translatedPositions: TPosition[];
}

export const cancelCanvasGesture = <TDrag, TGroup, TPosition>(
  state: CanvasGestureState<TDrag, TGroup, TPosition>,
): void => {
  state.mode = "none";
  state.press = null;
  state.drag = null;
  state.pan = null;
  state.pressIntent = "replace";
  state.groupTranslation = null;
  state.translatedPositions = [];
};

export const completeCanvasGesture = <TDrag, TGroup, TPosition>(
  state: CanvasGestureState<TDrag, TGroup, TPosition>,
): CanvasGestureCompletion<TDrag, TGroup, TPosition> => {
  const completed = {
    mode: state.mode,
    drag: state.drag,
    pressIntent: state.pressIntent,
    groupTranslation: state.groupTranslation,
    translatedPositions: state.translatedPositions,
  };
  cancelCanvasGesture(state);
  return completed;
};

export const shouldCommitCanvasCamera = <TDrag, TGroup, TPosition>(
  completion: CanvasGestureCompletion<TDrag, TGroup, TPosition>,
): boolean => completion.mode === "pan";

export const mergeCanvasWheelFrame = (queued: CanvasWheelFrame, incoming: CanvasWheelFrame): CanvasWheelFrame => ({
  ...incoming,
  deltaY: queued.deltaY + incoming.deltaY,
});
