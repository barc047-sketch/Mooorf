import { MAX_NUCLEI } from "../experiments/organism-lab/organism-types";
import type { ContextSurface, RendererMode, SpaceCell } from "../types";

export interface SelectionStateSlice {
  selectedId: string | null;
  primarySelectedId: string | null;
  selectedIds: string[];
}

type SelectionInput = Partial<SelectionStateSlice>;

const uniqueIds = (ids: readonly string[]) => [...new Set(ids.filter(Boolean))];

export const normalizeSelectionState = (
  input: SelectionInput,
  liveIds?: ReadonlySet<string>
): SelectionStateSlice => {
  const candidates = input.selectedIds ?? (input.selectedId ? [input.selectedId] : []);
  const selectedIds = uniqueIds(candidates).filter((id) => !liveIds || liveIds.has(id));
  const requestedPrimary = input.primarySelectedId ?? input.selectedId ?? null;
  const primarySelectedId = requestedPrimary && selectedIds.includes(requestedPrimary)
    ? requestedPrimary
    : selectedIds[selectedIds.length - 1] ?? null;
  return { selectedId: primarySelectedId, primarySelectedId, selectedIds };
};

export const replaceSelectionState = (id: string | null): SelectionStateSlice =>
  id
    ? { selectedId: id, primarySelectedId: id, selectedIds: [id] }
    : { selectedId: null, primarySelectedId: null, selectedIds: [] };

export const addSelectionState = (
  current: SelectionStateSlice,
  id: string
): SelectionStateSlice => ({
  selectedId: id,
  primarySelectedId: id,
  selectedIds: current.selectedIds.includes(id) ? [...current.selectedIds] : [...current.selectedIds, id],
});

export const removeSelectionState = (
  current: SelectionStateSlice,
  id: string
): SelectionStateSlice => normalizeSelectionState({
  selectedIds: current.selectedIds.filter((selectedId) => selectedId !== id),
  primarySelectedId: current.primarySelectedId === id ? null : current.primarySelectedId,
});

export const toggleSelectionState = (
  current: SelectionStateSlice,
  id: string
): SelectionStateSlice => current.selectedIds.includes(id)
  ? removeSelectionState(current, id)
  : addSelectionState(current, id);

export const resolveSelectionIntent = ({ altKey, shiftKey }: {
  altKey: boolean;
  shiftKey: boolean;
}): "replace" | "toggle" => altKey || shiftKey ? "toggle" : "replace";

export const visibleSelectableIds = (
  spaces: readonly SpaceCell[],
  rendererMode: RendererMode
): string[] => (rendererMode === "organism" ? spaces.slice(0, MAX_NUCLEI) : spaces).map((space) => space.id);

export const resolveEscapeAction = (
  contextSurface: ContextSurface,
  selectedIds: readonly string[]
): "close-context" | "clear-selection" | "none" =>
  contextSurface ? "close-context" : selectedIds.length > 0 ? "clear-selection" : "none";

export const shouldCloseFromOutsidePointer = (
  contextOpen: boolean,
  pointerInsideSurface: boolean
): boolean => contextOpen && !pointerInsideSurface;

type MatchableEventTarget = {
  matches: (selector: string) => boolean;
};

const pathMatches = (
  path: readonly unknown[],
  selector: string,
): boolean => path.some((target) => {
  if (!target || typeof target !== "object" || !("matches" in target)) return false;
  const candidate = target as Partial<MatchableEventTarget>;
  return typeof candidate.matches === "function" && candidate.matches(selector);
});

/** The full-screen radial wrapper is positioning only. Only a radial action is
 * interactive; blank-menu content keeps its existing outside-click boundary,
 * while the inline editor continues to own outside-click commit itself. */
export const shouldCloseContextFromPointer = (
  contextSurface: ContextSurface,
  composedPath: readonly unknown[],
): boolean => {
  if (!contextSurface || contextSurface === "inline-editor") return false;
  if (contextSurface === "object-radial") {
    return !pathMatches(composedPath, ".object-radial-action");
  }
  return !pathMatches(composedPath, '[data-context-surface="blank-menu"]');
};

export const shouldCloseRadialFromSelection = (
  contextSurface: ContextSurface,
  contextTargetId: string | null,
  selectedIds: readonly string[],
): boolean =>
  contextSurface === "object-radial"
  && contextTargetId !== null
  && !selectedIds.includes(contextTargetId);

export const isEnabledRadialActionActivation = (
  contextSurface: ContextSurface,
  key: string,
  focusedEnabledAction: boolean,
): boolean =>
  contextSurface === "object-radial"
  && focusedEnabledAction
  && (key === "Enter" || key === " ");

/** Let a focused enabled radial action receive its native Enter activation;
 * otherwise Enter is a compact, deterministic dismissal shortcut. */
export const shouldCloseRadialFromEnter = (
  contextSurface: ContextSurface,
  focusedEnabledAction: boolean,
): boolean =>
  contextSurface === "object-radial"
  && !isEnabledRadialActionActivation(contextSurface, "Enter", focusedEnabledAction);

export type SelectionRingState = "none" | "hover" | "primary" | "secondary";

/** Presentation-only selection language. Selected state always wins over
 * hover so a Cell can never show two competing external rings. */
export const resolveSelectionRingState = (
  selected: boolean,
  primary: boolean,
  hovered: boolean
): SelectionRingState => selected ? (primary ? "primary" : "secondary") : hovered ? "hover" : "none";

export interface SelectionOverlayProjectionInput {
  visibleIds: readonly string[];
  selectedIds: readonly string[];
  primarySelectedId: string | null;
  hoveredId: string | null;
  /** False for clean export. The complete temporary projection is omitted. */
  include: boolean;
}

/** One renderer-neutral temporary projection for Classic and Organism.
 * It is computed from session selection and is never persisted in Cell
 * appearance, project snapshots, copy/paste style, or clean exports. */
export const projectSelectionOverlay = ({
  visibleIds,
  selectedIds,
  primarySelectedId,
  hoveredId,
  include,
}: SelectionOverlayProjectionInput): ReadonlyMap<string, SelectionRingState> => {
  const projection = new Map<string, SelectionRingState>();
  if (!include) return projection;
  const selected = new Set(selectedIds);
  for (const id of visibleIds) {
    const state = resolveSelectionRingState(
      selected.has(id),
      primarySelectedId === id,
      hoveredId === id
    );
    if (state !== "none") projection.set(id, state);
  }
  return projection;
};
