export const CELL_DRAG_THRESHOLD_PX = 6;
export const CELL_DOUBLE_ACTIVATION_MS = 360;
export const CELL_DOUBLE_ACTIVATION_PX = 24;

export interface CellActivationState {
  id: string | null;
  at: number;
  x: number;
  y: number;
}

export const createCellActivationState = (): CellActivationState => ({ id: null, at: 0, x: 0, y: 0 });

export const normalizeInlineCellDraft = (name: string, area: string, fallbackArea: number) => {
  const parsed = Number.parseFloat(area);
  return {
    name: name.trim() || "Untitled Space",
    area: Number.isFinite(parsed) ? Math.max(1, parsed) : Math.max(1, fallbackArea),
  };
};

export const registerCellActivation = (
  state: CellActivationState,
  id: string,
  x: number,
  y: number,
  at: number,
  dragged: boolean
): boolean => {
  if (dragged) {
    state.id = null;
    return false;
  }
  const double = state.id === id && at - state.at <= CELL_DOUBLE_ACTIVATION_MS && Math.hypot(x - state.x, y - state.y) <= CELL_DOUBLE_ACTIVATION_PX;
  state.id = double ? null : id;
  state.at = at;
  state.x = x;
  state.y = y;
  return double;
};
