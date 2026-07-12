import type { SpaceCell } from "../types";
import { normalizeSelectionState, type SelectionStateSlice } from "./selection";

export interface SpacePosition {
  id: string;
  x: number;
  y: number;
}

export interface SpaceTransform {
  before: SpacePosition[];
  after: SpacePosition[];
}

export interface GroupTranslation {
  ids: string[];
  before: SpacePosition[];
  selection: SelectionStateSlice;
}

const hasFinitePosition = (space: Pick<SpaceCell, "id" | "x" | "y">): boolean =>
  Boolean(space.id) && Number.isFinite(space.x) && Number.isFinite(space.y);

const isFiniteDelta = (delta: { x: number; y: number }): boolean =>
  Number.isFinite(delta.x) && Number.isFinite(delta.y);

export const createGroupTranslation = (
  spaces: readonly SpaceCell[],
  selectedIds: readonly string[],
  draggedId: string
): GroupTranslation => {
  const live = spaces.filter(hasFinitePosition);
  const liveIds = new Set(live.map(({ id }) => id));
  const draggedSelected = selectedIds.includes(draggedId);
  const selection = normalizeSelectionState({
    selectedIds: draggedSelected ? [...selectedIds] : [draggedId],
    primarySelectedId: draggedId,
  }, liveIds);
  const ids = selection.selectedIds;
  const positionsById = new Map(live.map(({ id, x, y }) => [id, { id, x, y }]));
  const before = ids.flatMap((id) => {
    const position = positionsById.get(id);
    return position ? [{ ...position }] : [];
  });
  return { ids: before.map(({ id }) => id), before, selection };
};

export const resolveGroupTranslationPositions = (
  translation: GroupTranslation,
  delta: { x: number; y: number }
): SpacePosition[] => {
  if (!isFiniteDelta(delta)) return [];
  return translation.before.map(({ id, x, y }) => ({ id, x: x + delta.x, y: y + delta.y }));
};

export const applyGroupTranslation = (
  spaces: readonly SpaceCell[],
  translation: GroupTranslation,
  delta: { x: number; y: number }
): SpaceCell[] => {
  const positions = resolveGroupTranslationPositions(translation, delta);
  if (positions.length === 0) return [...spaces];
  const byId = new Map(positions.map((position) => [position.id, position]));
  return spaces.map((space) => {
    const position = byId.get(space.id);
    return position ? { ...space, x: position.x, y: position.y } : space;
  });
};

export const isMeaningfulSpaceTransform = (
  before: readonly SpacePosition[],
  after: readonly SpacePosition[]
): boolean => {
  const afterById = new Map(after.map((position) => [position.id, position]));
  return before.some((position) => {
    const next = afterById.get(position.id);
    return next && Number.isFinite(next.x) && Number.isFinite(next.y) && (next.x !== position.x || next.y !== position.y);
  });
};
