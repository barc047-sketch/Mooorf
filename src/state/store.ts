import { create } from "zustand";
import type {
  AnnotationDetail,
  AnnotationMode,
  AttachMode,
  Camera,
  CanvasReadiness,
  ColorSource,
  ContextPoint,
  ContextSurface,
  ArrangementPatternId,
  LayoutPresetId,
  LabelColourMode,
  LabelScaleMode,
  MorphMode,
  OrganismSettings,
  PaletteMode,
  PerformanceQuality,
  RendererMode,
  SavedCanvasSnapshot,
  SpaceCell,
  SpaceKind,
  Theme,
  ToolId,
  ViewMode,
  WidgetId,
  CellShadowSettings,
} from "../types";
import { areaToRadius, clamp, scatterPoint } from "../lib/geometry";
import { DEMO_PROGRAM } from "../lib/demo";
import { DEFAULT_CAMERA, fitCamera, Z_MAX, Z_MIN } from "../lib/camera";
import { DEFAULT_ORGANISM_SETTINGS } from "../canvas/organismProductionSettings";
import { placeBatchCells } from "../canvas/layoutPresets";
import { calculateArrangement, isLegacyLayoutPreset, regenerateArrangementSeed, resolveArrangementScope } from "../arrangement/engine";
import { arrangementRuntime } from "../arrangement/runtime";
import { DEFAULT_ARRANGEMENT_PARAMETERS, type ArrangementParameters } from "../arrangement/types";
import { normalizeUiScale, normalizeWidgetScale } from "./uiScale";
import { readinessCanAdvance } from "../ui/readiness";
import {
  addSelectionState,
  normalizeSelectionState,
  removeSelectionState,
  replaceSelectionState,
  toggleSelectionState,
  visibleSelectableIds,
  type SelectionStateSlice,
} from "../interaction/selection";
import {
  isMeaningfulSpaceTransform,
  type SpacePosition,
  type SpaceTransform,
} from "../interaction/groupDrag";
import { cloneResourceSettings, defaultMaterialBindings, DEFAULT_RESOURCE_SETTINGS } from "../resources/resourcePersistence";
import type { ResourceSettings } from "../resources/types";
import { normalizeIconPlacement } from "../icons/iconValidation";
import type { IconPlacementSettings } from "../icons/types";
import { migrateLegacyGridSettings } from "../grid/gridValidation";
import { DEFAULT_CELL_SHADOW, normalizeCellShadow } from "../canvas/cellShadow";
import {
  normalizeLabelColourMode,
  normalizeLabelCustomColour,
  normalizeLabelScaleMode,
  normalizeLegacyCellShadow,
  normalizePerformanceQuality,
} from "./visualSettings";
import { resolveWidgetOpen } from "../ui/widgets/widgetLifecycle";
import type {
  CellAppearanceOverrides,
  PresentationTargetId,
  ProjectPresentationDefaults,
  TextAppearanceOverride,
} from "../domain/presentation/types";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import {
  cloneCellAppearanceOverrides,
  cloneProjectPresentationDefaults,
  normalizeCellAppearanceOverrides,
  normalizeProjectPresentationDefaults,
} from "../domain/presentation/validation";
import {
  applyAppearancePatch,
  applyTextAppearancePatch,
  cloneStyle,
  resetAppearanceChannel,
  resetAppearanceFamilyChannels,
  type AppearanceFamilyId,
} from "../domain/presentation/editing";

let idCounter = 0;
const uid = () => `sc_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
const SAVED_VIEWS_KEY = "mooorf.savedViews.v1";
export const SAVED_VIEWS_LIMIT = 20;
const TRANSFORM_HISTORY_LIMIT = 50;

interface SpaceEditSnapshot {
  name: string;
  area: number;
  body?: string;
}

interface CellHistorySnapshot extends SpaceEditSnapshot {
  id: string;
  body: string;
  appearance?: CellAppearanceOverrides;
}

interface SelectionSnapshot {
  selectedIds: string[];
  primarySelectedId: string | null;
}

interface MembraneRuntimeSnapshot {
  morphMode: MorphMode;
  attachMode: AttachMode;
  mergeDistance: number;
}

interface VisualSettingsSnapshot {
  organism: OrganismSettings;
  cellShadow: CellShadowSettings;
}

type SymbolPlacementStyle = Omit<IconPlacementSettings, "iconId" | "targetSpaceId">;

interface StyleClipboard {
  appearance: CellAppearanceOverrides | null;
  /** Placement/backing only. Symbol identity deliberately remains on the target Cell. */
  symbolStyle: SymbolPlacementStyle | null;
}

type SpaceHistoryEntry =
  | { kind: "transform"; before: SpacePosition[]; after: SpacePosition[] }
  | { kind: "batch-add"; added: SpaceCell[]; beforeSelection: SelectionSnapshot; afterSelection: SelectionSnapshot }
  | { kind: "cells"; before: CellHistorySnapshot[]; after: CellHistorySnapshot[] }
  | { kind: "defaults"; before: ProjectPresentationDefaults; after: ProjectPresentationDefaults }
  | { kind: "membrane-runtime"; before: MembraneRuntimeSnapshot; after: MembraneRuntimeSnapshot }
  | { kind: "visual-settings"; before: VisualSettingsSnapshot; after: VisualSettingsSnapshot }
  | { kind: "resources"; before: ResourceSettings; after: ResourceSettings }
  | { kind: "style"; before: CellHistorySnapshot[]; after: CellHistorySnapshot[]; beforeResources: ResourceSettings; afterResources: ResourceSettings };

export interface LabSettings {
  uiScale: number;
  /** V7.1D — widget windows + internal widget content only; never rail/dock/canvas. */
  widgetScale: number;
  mergeDistance: number; // 0–300 — fine-tunes membrane reach within the attachment preset
  blobOn: boolean;
  morphMode: MorphMode;
  attachMode: AttachMode;
  paletteMode: PaletteMode;
  colorSource: ColorSource;
  layoutPreset: LayoutPresetId;
  annotationMode: AnnotationMode;
  annotationDetail: AnnotationDetail;
  labelScaleMode: LabelScaleMode;
  labelColourMode: LabelColourMode;
  labelCustomColour: string;
  cellShadow: CellShadowSettings;
  performanceQuality: PerformanceQuality;
  rendererMode: RendererMode;
  showGrid: boolean;
  /** "auto" = category mapping owns nucleus colors (pre-V6K behavior) */
  nucleusPaletteId: string;
  /** "mode" = style + palette mode derive body/ground (pre-V6K behavior) */
  organismPaletteId: string;
  organism: OrganismSettings;
  resources: ResourceSettings;
  presentationDefaults: ProjectPresentationDefaults;
}

export const DEFAULT_ANNOTATION_DETAIL: AnnotationDetail = {
  textScale: 1,
  textShadow: false,
  showName: true,
  showArea: true,
  showCategory: true,
  position: "auto",
  boundingBox: false,
};

interface LabState {
  theme: Theme;
  view: ViewMode;
  spaces: SpaceCell[];
  loaderDone: boolean;
  canvasReadiness: CanvasReadiness;
  settings: LabSettings;
  activeTool: ToolId;
  temporaryTool: ToolId | null;
  contextSurface: ContextSurface;
  contextPoint: ContextPoint | null;
  contextTargetId: string | null;
  primarySelectedId: string | null;
  selectedIds: string[];
  /** Compatibility mirror for pre-V8.2 consumers. Always equals primarySelectedId. */
  selectedId: string | null;
  camera: Camera;
  savedViews: SavedCanvasSnapshot[];
  /** Ephemeral canvas translation history. Saved project/view data stores final positions only. */
  transformUndoStack: SpaceHistoryEntry[];
  transformRedoStack: SpaceHistoryEntry[];
  /** V6K widget system — array order is stacking order (last = front) */
  openWidgets: WidgetId[];
  /** Ephemeral widget-window lifecycle. Launchers can restore minimized and
   * off-screen frames without persisting UI state into project data. */
  minimizedWidgets: WidgetId[];
  widgetLaunchRevisions: Partial<Record<WidgetId, number>>;
  /** M1 shared ephemeral target and preview owners. Never persisted/exported. */
  activeAppearanceTarget: PresentationTargetId;
  appearancePreview: SpaceCell[] | null;
  appearancePreviewIds: string[] | null;
  appearancePreviewTarget: PresentationTargetId | "text" | null;
  presentationDefaultsPreview: ProjectPresentationDefaults | null;
  membraneRuntimePreview: MembraneRuntimeSnapshot | null;
  visualSettingsPreview: VisualSettingsSnapshot | null;
  resourcesPreview: ResourceSettings | null;
  /** Arrangement V2 x/y-only renderer projection. Never persisted/exported. */
  arrangementPreview: SpacePosition[] | null;
  arrangementPreviewPatternId: ArrangementPatternId | null;
  styleClipboard: StyleClipboard | null;

  toggleTheme: () => void;
  setView: (view: ViewMode) => void;
  setLoaderDone: () => void;
  setCanvasReadiness: (stage: CanvasReadiness) => void;
  setSettings: (patch: Partial<LabSettings>) => void;
  setWidgetScale: (value: number) => void;
  setOrganism: (patch: Partial<OrganismSettings>) => void;
  setAnnotationDetail: (patch: Partial<AnnotationDetail>) => void;
  openWidget: (id: WidgetId) => void;
  closeWidget: (id: WidgetId) => void;
  focusWidget: (id: WidgetId) => void;
  setWidgetMinimized: (id: WidgetId, minimized: boolean) => void;
  setActiveTool: (id: ToolId) => void;
  setTemporaryTool: (id: ToolId) => void;
  clearTemporaryTool: () => void;
  replaceSelection: (id: string | null) => void;
  toggleSelection: (id: string) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAllVisible: () => void;
  openContextSurface: (
    surface: Exclude<ContextSurface, null>,
    point: ContextPoint,
    targetId?: string | null
  ) => void;
  closeContextSurface: () => void;
  /** @deprecated V8.2A — use replaceSelection/clearSelection. */
  select: (id: string | null) => void;
  setCamera: (camera: Camera) => void;
  zoomBy: (factor: number) => void;
  fitView: () => void;
  resetView: () => void;

  addSpace: (partial?: Partial<SpaceCell>) => void;
  addVoid: () => void;
  addSpaces: (count: number) => void;
  duplicateSpace: (id: string) => string | null;
  addDemo: (n?: number) => void;
  updateSpace: (id: string, patch: Partial<SpaceCell>) => void;
  commitSpaceEdit: (id: string, patch: SpaceEditSnapshot) => void;
  commitSpaceContent: (ids: readonly string[], patch: Partial<SpaceEditSnapshot>) => void;
  setActiveAppearanceTarget: (target: PresentationTargetId) => void;
  commitAppearancePatch: (ids: readonly string[], target: PresentationTargetId, patch: Record<string, unknown>) => void;
  previewAppearancePatch: (ids: readonly string[], target: PresentationTargetId, patch: Record<string, unknown>) => void;
  commitAppearancePreview: () => void;
  cancelAppearancePreview: () => void;
  commitTextAppearancePatch: (ids: readonly string[], patch: Partial<TextAppearanceOverride>) => void;
  previewTextAppearancePatch: (ids: readonly string[], patch: Partial<TextAppearanceOverride>) => void;
  resetAppearanceTarget: (ids: readonly string[], target: PresentationTargetId | "text") => void;
  resetAppearanceFamily: (ids: readonly string[], family: AppearanceFamilyId) => void;
  resetAllAppearance: (ids: readonly string[]) => void;
  copyStyle: (id: string) => void;
  pasteStyle: (ids: readonly string[]) => void;
  commitProjectPresentationDefaults: (defaults: ProjectPresentationDefaults) => void;
  previewProjectPresentationDefaults: (defaults: ProjectPresentationDefaults) => void;
  commitPresentationDefaultsPreview: () => void;
  cancelPresentationDefaultsPreview: () => void;
  commitMembraneRuntime: (patch: Partial<MembraneRuntimeSnapshot>) => void;
  previewMembraneRuntime: (patch: Partial<MembraneRuntimeSnapshot>) => void;
  commitMembraneRuntimePreview: () => void;
  cancelMembraneRuntimePreview: () => void;
  commitVisualSettings: (patch: { organism?: Partial<OrganismSettings>; cellShadow?: Partial<CellShadowSettings> }) => void;
  previewVisualSettings: (patch: { organism?: Partial<OrganismSettings>; cellShadow?: Partial<CellShadowSettings> }) => void;
  commitVisualSettingsPreview: () => void;
  cancelVisualSettingsPreview: () => void;
  commitSymbolPlacement: (targetSpaceId: string, placement: IconPlacementSettings | null) => void;
  commitSymbolPreview: () => void;
  previewSymbolPlacement: (targetSpaceId: string, placement: IconPlacementSettings | null) => void;
  cancelSymbolPreview: () => void;
  toggleIconFavourite: (iconId: string) => void;
  moveSpace: (id: string, x: number, y: number) => void;
  commitSpaceTransform: (before: readonly SpacePosition[], after: readonly SpacePosition[]) => void;
  undoSpaceTransform: () => void;
  redoSpaceTransform: () => void;
  removeSpace: (id: string) => void;
  applyLayoutPreset: (presetId: LayoutPresetId) => void;
  previewArrangement: (patternId: ArrangementPatternId, parameters: ArrangementParameters) => Promise<void>;
  applyArrangementPreview: () => void;
  cancelArrangementPreview: () => void;
  saveCurrentView: (name?: string) => string | null;
  loadSavedView: (id: string) => void;
  renameSavedView: (id: string, name: string) => void;
  deleteSavedView: (id: string) => void;
  duplicateSavedView: (id: string) => string | null;
}

const normalizeSpaceKind = (kind: unknown): SpaceKind =>
  kind === "void" ? "void" : "space";

const selectionFromState = (state: SelectionStateSlice): SelectionStateSlice => ({
  selectedId: state.selectedId,
  primarySelectedId: state.primarySelectedId,
  selectedIds: state.selectedIds,
});

const closedContext = {
  contextSurface: null,
  contextPoint: null,
  contextTargetId: null,
} as const;

const cloneSpace = (space: SpaceCell): SpaceCell => ({
  ...space,
  body: typeof space.body === "string" ? space.body : "",
  kind: normalizeSpaceKind(space.kind),
  appearance: cloneCellAppearanceOverrides(space.appearance),
});
const cloneCamera = (camera: Camera): Camera => ({ ...camera });
const cloneOrganism = (organism: OrganismSettings): OrganismSettings => ({ ...organism });
const snapshotVisualSettings = (settings: LabSettings): VisualSettingsSnapshot => ({
  organism: cloneOrganism(settings.organism),
  cellShadow: normalizeCellShadow(settings.cellShadow),
});

const cloneVisualSettings = (value: VisualSettingsSnapshot): VisualSettingsSnapshot => ({
  organism: cloneOrganism(value.organism),
  cellShadow: normalizeCellShadow(value.cellShadow),
});

const symbolStyle = (placement: IconPlacementSettings): SymbolPlacementStyle => {
  const { iconId: _iconId, targetSpaceId: _targetSpaceId, ...style } = placement;
  return { ...style };
};

const withSymbolPlacement = (
  resources: ResourceSettings,
  targetSpaceId: string,
  placement: IconPlacementSettings | null,
  recordRecent: boolean,
): ResourceSettings => {
  const next = cloneResourceSettings(resources);
  next.iconPlacements = next.iconPlacements.filter((item) => item.targetSpaceId !== targetSpaceId);
  if (placement) {
    const normalized = normalizeIconPlacement({ ...placement, targetSpaceId });
    if (normalized.iconId && normalized.targetSpaceId) next.iconPlacements.push(normalized);
    if (recordRecent) next.iconRecents = [normalized.iconId, ...next.iconRecents.filter((id) => id !== normalized.iconId)].slice(0, 24);
  }
  return cloneResourceSettings(next);
};

const syncLegacyPresentationDefaults = (
  current: ProjectPresentationDefaults,
  patch: Partial<LabSettings>,
  legacy: { blobOn: boolean; organism: OrganismSettings; resources: ResourceSettings },
  resourcesChanged: boolean
): ProjectPresentationDefaults => {
  if (patch.presentationDefaults) {
    return normalizeProjectPresentationDefaults(patch.presentationDefaults, legacy);
  }
  const next = cloneProjectPresentationDefaults(current);
  const derived = createProjectPresentationDefaults(legacy);
  if (typeof patch.blobOn === "boolean") next.membrane.visible = patch.blobOn;
  if (patch.organism && typeof patch.organism.showNuclei === "boolean") {
    next.core.visible = patch.organism.showNuclei;
  }
  if (resourcesChanged) {
    next.cell.paint = { ...next.cell.paint, materialId: derived.cell.paint.materialId, opacity: derived.cell.paint.opacity };
    next.boundary.paint = { ...next.boundary.paint, materialId: derived.boundary.paint.materialId, opacity: derived.boundary.paint.opacity };
    next.membrane.paint = { ...next.membrane.paint, materialId: derived.membrane.paint.materialId, opacity: derived.membrane.paint.opacity };
    next.membraneEdge.paint = { ...next.membraneEdge.paint, materialId: derived.membraneEdge.paint.materialId, opacity: derived.membraneEdge.paint.opacity };
    next.core.paint = { ...next.core.paint, materialId: derived.core.paint.materialId, opacity: derived.core.paint.opacity };
    next.void.fill = { ...next.void.fill, materialId: derived.void.fill.materialId, opacity: derived.void.fill.opacity };
    next.void.edge = { ...next.void.edge, materialId: derived.void.edge.materialId, opacity: derived.void.edge.opacity };
  }
  return next;
};

const isFinitePosition = (position: SpacePosition): boolean =>
  Boolean(position.id) && Number.isFinite(position.x) && Number.isFinite(position.y);

const applySpacePositions = (spaces: readonly SpaceCell[], positions: readonly SpacePosition[]): SpaceCell[] => {
  const byId = new Map<string, SpacePosition>();
  for (const position of positions) {
    if (isFinitePosition(position) && !byId.has(position.id)) byId.set(position.id, position);
  }
  if (byId.size === 0) return [...spaces];
  return spaces.map((space) => {
    const position = byId.get(space.id);
    return position ? { ...space, x: position.x, y: position.y } : space;
  });
};

const normalizeLiveTransform = (
  spaces: readonly SpaceCell[],
  before: readonly SpacePosition[],
  after: readonly SpacePosition[]
): SpaceTransform => {
  const afterById = new Map(after.filter(isFinitePosition).map((position) => [position.id, position]));
  const seen = new Set<string>();
  const liveIds = new Set(spaces.map((space) => space.id));
  const pairs = before.flatMap((position) => {
    if (!isFinitePosition(position) || seen.has(position.id) || !liveIds.has(position.id)) return [];
    seen.add(position.id);
    const next = afterById.get(position.id);
    return next ? [{ before: { ...position }, after: { ...next } }] : [];
  });
  return { before: pairs.map((pair) => pair.before), after: pairs.map((pair) => pair.after) };
};

const applyHistoryEntry = (
  spaces: readonly SpaceCell[],
  entry: SpaceHistoryEntry,
  direction: "before" | "after"
): SpaceCell[] => {
  if (entry.kind === "transform") return applySpacePositions(spaces, entry[direction]);
  if (entry.kind === "batch-add") {
    const addedIds = new Set(entry.added.map((space) => space.id));
    if (direction === "before") return spaces.filter((space) => !addedIds.has(space.id));
    const liveIds = new Set(spaces.map((space) => space.id));
    return [...spaces, ...entry.added.filter((space) => !liveIds.has(space.id)).map(cloneSpace)];
  }
  if (entry.kind === "defaults" || entry.kind === "membrane-runtime" || entry.kind === "visual-settings" || entry.kind === "resources") return [...spaces];
  const values = new Map(entry[direction].map((value) => [value.id, value]));
  return spaces.map((space) => {
    const value = values.get(space.id);
    if (!value) return space;
    return {
      ...space,
      name: value.name,
      area: value.area,
      body: value.body,
      appearance: cloneCellAppearanceOverrides(value.appearance),
    };
  });
};

const snapshotCells = (spaces: readonly SpaceCell[], ids: ReadonlySet<string>): CellHistorySnapshot[] =>
  spaces.flatMap((space) => ids.has(space.id) ? [{
    id: space.id,
    name: space.name,
    area: space.area,
    body: space.body ?? "",
    appearance: cloneCellAppearanceOverrides(space.appearance),
  }] : []);

const sameCellSnapshots = (left: readonly CellHistorySnapshot[], right: readonly CellHistorySnapshot[]): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const normalizeBody = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value.replace(/\r\n?/g, "\n").slice(0, 1200) : fallback;

const updateCellsWithHistory = (
  spaces: readonly SpaceCell[],
  ids: readonly string[],
  update: (space: SpaceCell) => SpaceCell
): { spaces: SpaceCell[]; entry: SpaceHistoryEntry } | null => {
  const idSet = new Set(ids);
  const before = snapshotCells(spaces, idSet);
  if (!before.length) return null;
  const nextSpaces = spaces.map((space) => idSet.has(space.id) ? update(space) : space);
  const after = snapshotCells(nextSpaces, idSet);
  if (sameCellSnapshots(before, after)) return null;
  return { spaces: nextSpaces, entry: { kind: "cells", before, after } };
};

const pushHistory = (stack: readonly SpaceHistoryEntry[], entry: SpaceHistoryEntry): SpaceHistoryEntry[] =>
  [...stack, entry].slice(-TRANSFORM_HISTORY_LIMIT);

const cloneSnapshot = (snapshot: SavedCanvasSnapshot): SavedCanvasSnapshot => {
  const resources = snapshot.resources
    ? cloneResourceSettings(snapshot.resources)
    : {
        ...cloneResourceSettings(DEFAULT_RESOURCE_SETTINGS),
        materialBindings: defaultMaterialBindings(
          snapshot.nucleusPaletteId ?? "editorial-aurora",
          snapshot.organismPaletteId ?? "mode"
        ),
        grid: migrateLegacyGridSettings(snapshot.showGrid ?? false),
        annotationInstances: [],
        iconPlacements: [],
      };
  const presentationDefaults = normalizeProjectPresentationDefaults(snapshot.presentationDefaults, {
    blobOn: snapshot.blobOn ?? true,
    organism: snapshot.organism,
    resources,
    annotationDetail: snapshot.annotationDetail,
    labelColourMode: snapshot.labelColourMode,
    labelCustomColour: snapshot.labelCustomColour,
  });
  return {
    ...snapshot,
    colorSource: snapshot.colorSource === "privacy" ? "privacy" : "category",
    uiScale: normalizeUiScale(snapshot.uiScale),
    widgetScale: normalizeWidgetScale(snapshot.widgetScale),
    spaces: snapshot.spaces.map((space) => ({
      ...cloneSpace(space),
      appearance: normalizeCellAppearanceOverrides(space.appearance, presentationDefaults),
    })),
    camera: cloneCamera(snapshot.camera),
    organism: cloneOrganism(snapshot.organism),
    resources,
    presentationDefaults,
    labelScaleMode: normalizeLabelScaleMode(snapshot.labelScaleMode, snapshot.rendererMode),
    labelColourMode: normalizeLabelColourMode(snapshot.labelColourMode),
    labelCustomColour: normalizeLabelCustomColour(snapshot.labelCustomColour),
    cellShadow: normalizeLegacyCellShadow(snapshot.cellShadow, snapshot.rendererMode),
    performanceQuality: normalizePerformanceQuality(snapshot.performanceQuality),
  };
};

const safeStorage = () => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const validSpace = (value: unknown): value is SpaceCell =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  (value.body === undefined || typeof value.body === "string") &&
  (value.kind === undefined || value.kind === "space" || value.kind === "void") &&
  typeof value.area === "number" &&
  typeof value.category === "string" &&
  (value.privacy === "public" || value.privacy === "shared" || value.privacy === "private") &&
  typeof value.color === "string" &&
  typeof value.x === "number" &&
  typeof value.y === "number";

const validSnapshot = (value: unknown): value is SavedCanvasSnapshot =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.createdAt === "number" &&
  Array.isArray(value.spaces) &&
  value.spaces.every(validSpace) &&
  isRecord(value.camera) &&
  typeof value.camera.x === "number" &&
  typeof value.camera.y === "number" &&
  typeof value.camera.zoom === "number" &&
  (value.theme === "day" || value.theme === "night") &&
  (value.rendererMode === "organism" || value.rendererMode === "classic") &&
  (value.paletteMode === "core" ||
    value.paletteMode === "surreal" ||
    value.paletteMode === "architecture" ||
    value.paletteMode === "auto") &&
  isRecord(value.organism);

const loadSavedViews = (): SavedCanvasSnapshot[] => {
  const storage = safeStorage();
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(SAVED_VIEWS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(validSnapshot).slice(0, SAVED_VIEWS_LIMIT).map(cloneSnapshot);
  } catch {
    return [];
  }
};

const persistSavedViews = (views: SavedCanvasSnapshot[]) => {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views.slice(0, SAVED_VIEWS_LIMIT)));
  } catch {
    // Persistence is best-effort; in-memory saved views still work.
  }
};

const snapshotId = () => `sv_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

const defaultSnapshotName = (views: SavedCanvasSnapshot[]) =>
  `Iteration ${String(views.length + 1).padStart(2, "0")}`;

const makeSnapshot = (
  state: Pick<LabState, "spaces" | "camera" | "settings" | "theme" | "savedViews">,
  name?: string
): SavedCanvasSnapshot => ({
  id: snapshotId(),
  name: name?.trim() || defaultSnapshotName(state.savedViews),
  createdAt: Date.now(),
  spaces: state.spaces.map(cloneSpace),
  camera: cloneCamera(state.camera),
  rendererMode: state.settings.rendererMode,
  morphMode: state.settings.morphMode,
  attachMode: state.settings.attachMode,
  mergeDistance: state.settings.mergeDistance,
  blobOn: state.settings.blobOn,
  paletteMode: state.settings.paletteMode,
  colorSource: state.settings.colorSource,
  layoutPreset: state.settings.layoutPreset,
  annotationMode: state.settings.annotationMode,
  organism: cloneOrganism(state.settings.organism),
  theme: state.theme,
  uiScale: normalizeUiScale(state.settings.uiScale),
  widgetScale: normalizeWidgetScale(state.settings.widgetScale),
  annotationDetail: { ...state.settings.annotationDetail },
  showGrid: state.settings.showGrid,
  nucleusPaletteId: state.settings.nucleusPaletteId,
  organismPaletteId: state.settings.organismPaletteId,
  resources: cloneResourceSettings(state.settings.resources),
  presentationDefaults: cloneProjectPresentationDefaults(state.settings.presentationDefaults),
  labelScaleMode: state.settings.labelScaleMode,
  labelColourMode: state.settings.labelColourMode,
  labelCustomColour: state.settings.labelCustomColour,
  cellShadow: normalizeCellShadow(state.settings.cellShadow),
  performanceQuality: state.settings.performanceQuality,
});

const makeCell = (i: number, partial?: Partial<SpaceCell>): SpaceCell => {
  const p = scatterPoint(i);
  const kind = normalizeSpaceKind(partial?.kind);
  return {
    id: uid(),
    name: kind === "void" ? "Void Nucleus" : "New Space",
    body: "",
    kind,
    area: kind === "void" ? 36 : 20,
    category: kind === "void" ? "Void" : "Uncategorized",
    privacy: kind === "void" ? "shared" : "public",
    color: "",
    x: p.x,
    y: p.y,
    born: Date.now(),
    ...partial,
  };
};

export const useLab = create<LabState>((set) => ({
  theme: "day",
  view: "canvas",
  spaces: [],
  loaderDone: false,
  canvasReadiness: "shell-start",
  settings: {
    uiScale: 1,
    widgetScale: 1,
    mergeDistance: 120,
    blobOn: false,
    morphMode: "cellular-reverse",
    attachMode: "soft",
    paletteMode: "core",
    colorSource: "category",
    layoutPreset: "organic",
    annotationMode: "editorial",
    annotationDetail: { ...DEFAULT_ANNOTATION_DETAIL },
    labelScaleMode: "screen",
    labelColourMode: "auto",
    labelCustomColour: "#171719",
    cellShadow: { ...DEFAULT_CELL_SHADOW },
    performanceQuality: "automatic",
    rendererMode: "organism",
    showGrid: false,
    nucleusPaletteId: "editorial-aurora",
    organismPaletteId: "mode",
    organism: { ...DEFAULT_ORGANISM_SETTINGS },
    resources: cloneResourceSettings(DEFAULT_RESOURCE_SETTINGS),
    presentationDefaults: createProjectPresentationDefaults({
      blobOn: false,
      organism: DEFAULT_ORGANISM_SETTINGS,
      resources: DEFAULT_RESOURCE_SETTINGS,
    }),
  },
  activeTool: "select",
  temporaryTool: null,
  contextSurface: null,
  contextPoint: null,
  contextTargetId: null,
  primarySelectedId: null,
  selectedIds: [],
  selectedId: null,
  camera: { x: 0, y: 0, zoom: 1 },
  savedViews: loadSavedViews(),
  transformUndoStack: [],
  transformRedoStack: [],
  openWidgets: [],
  minimizedWidgets: [],
  widgetLaunchRevisions: {},
  activeAppearanceTarget: "cell",
  appearancePreview: null,
  appearancePreviewIds: null,
  appearancePreviewTarget: null,
  presentationDefaultsPreview: null,
  membraneRuntimePreview: null,
  visualSettingsPreview: null,
  resourcesPreview: null,
  arrangementPreview: null,
  arrangementPreviewPatternId: null,
  styleClipboard: null,

  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "day" ? "night" : "day" })),

  setView: (view) => set(view === "canvas" ? { view } : { view, ...closedContext }),

  setLoaderDone: () => set({ loaderDone: true }),

  setCanvasReadiness: (canvasReadiness) =>
    set((state) =>
      state.loaderDone || !readinessCanAdvance(state.canvasReadiness, canvasReadiness)
        ? {}
        : { canvasReadiness }
    ),

  setSettings: (patch) =>
    set((s) => {
      const nucleusPaletteId = patch.nucleusPaletteId ?? s.settings.nucleusPaletteId;
      const organismPaletteId = patch.organismPaletteId ?? s.settings.organismPaletteId;
      const resources = patch.resources
        ? cloneResourceSettings(patch.resources)
        : {
            ...cloneResourceSettings(s.settings.resources),
            materialBindings: patch.nucleusPaletteId || patch.organismPaletteId
              ? defaultMaterialBindings(nucleusPaletteId, organismPaletteId)
              : cloneResourceSettings(s.settings.resources).materialBindings,
            grid: typeof patch.showGrid === "boolean"
              ? migrateLegacyGridSettings(patch.showGrid)
              : cloneResourceSettings(s.settings.resources).grid,
          };
      const organism = patch.organism ? { ...s.settings.organism, ...patch.organism } : s.settings.organism;
      const presentationDefaults = syncLegacyPresentationDefaults(
        s.settings.presentationDefaults,
        patch,
        { blobOn: patch.blobOn ?? s.settings.blobOn, organism, resources },
        Boolean(patch.resources || patch.nucleusPaletteId || patch.organismPaletteId)
      );
      return {
        settings: {
          ...s.settings,
          ...patch,
          labelScaleMode: normalizeLabelScaleMode(patch.labelScaleMode ?? s.settings.labelScaleMode, s.settings.rendererMode),
          labelColourMode: normalizeLabelColourMode(patch.labelColourMode ?? s.settings.labelColourMode),
          labelCustomColour: normalizeLabelCustomColour(patch.labelCustomColour ?? s.settings.labelCustomColour),
          cellShadow: patch.cellShadow ? normalizeCellShadow(patch.cellShadow) : normalizeCellShadow(s.settings.cellShadow),
          performanceQuality: normalizePerformanceQuality(patch.performanceQuality ?? s.settings.performanceQuality),
          resources,
          presentationDefaults,
        },
      };
    }),

  setWidgetScale: (value) =>
    set((s) => ({
      settings: { ...s.settings, widgetScale: normalizeWidgetScale(value) },
    })),

  setOrganism: (patch) =>
    set((s) => {
      const organism = { ...s.settings.organism, ...patch };
      const presentationDefaults = cloneProjectPresentationDefaults(s.settings.presentationDefaults);
      if (typeof patch.showNuclei === "boolean") presentationDefaults.core.visible = patch.showNuclei;
      return {
        settings: {
          ...s.settings,
          organism,
          presentationDefaults,
        },
      };
    }),

  setAnnotationDetail: (patch) =>
    set((s) => ({
      settings: {
        ...s.settings,
        annotationDetail: { ...s.settings.annotationDetail, ...patch },
      },
    })),

  openWidget: (id) =>
    set((s) => ({
      openWidgets: resolveWidgetOpen(s.openWidgets, id).stack,
      minimizedWidgets: s.minimizedWidgets.filter((widgetId) => widgetId !== id),
      widgetLaunchRevisions: {
        ...s.widgetLaunchRevisions,
        [id]: (s.widgetLaunchRevisions[id] ?? 0) + 1,
      },
    })),

  closeWidget: (id) =>
    set((s) => {
      if (id === "layout") arrangementRuntime.cancel();
      return {
        openWidgets: s.openWidgets.filter((w) => w !== id),
        minimizedWidgets: s.minimizedWidgets.filter((widgetId) => widgetId !== id),
        ...(id === "layout" ? { arrangementPreview: null, arrangementPreviewPatternId: null } : {}),
      };
    }),

  focusWidget: (id) =>
    set((s) =>
      s.openWidgets[s.openWidgets.length - 1] === id || !s.openWidgets.includes(id)
        ? {}
        : { openWidgets: [...s.openWidgets.filter((w) => w !== id), id] }
    ),

  setWidgetMinimized: (id, minimized) =>
    set((s) => ({
      minimizedWidgets: minimized
        ? s.minimizedWidgets.includes(id)
          ? s.minimizedWidgets
          : [...s.minimizedWidgets, id]
        : s.minimizedWidgets.filter((widgetId) => widgetId !== id),
    })),

  setActiveTool: (activeTool) => set({ activeTool }),

  setTemporaryTool: (temporaryTool) => set({ temporaryTool }),

  clearTemporaryTool: () => set({ temporaryTool: null }),

  replaceSelection: (id) =>
    set((s) => id && !s.spaces.some((space) => space.id === id) ? {} : replaceSelectionState(id)),

  toggleSelection: (id) =>
    set((s) => s.spaces.some((space) => space.id === id)
      ? toggleSelectionState(selectionFromState(s), id)
      : {}),

  addToSelection: (id) =>
    set((s) => s.spaces.some((space) => space.id === id)
      ? addSelectionState(selectionFromState(s), id)
      : {}),

  removeFromSelection: (id) =>
    set((s) => removeSelectionState(selectionFromState(s), id)),

  clearSelection: () => set(replaceSelectionState(null)),

  selectAllVisible: () =>
    set((s) => {
      const selectedIds = visibleSelectableIds(s.spaces, s.settings.rendererMode);
      return normalizeSelectionState({
        selectedIds,
        primarySelectedId: selectedIds[selectedIds.length - 1] ?? null,
      });
    }),

  openContextSurface: (contextSurface, contextPoint, contextTargetId = null) =>
    set({ contextSurface, contextPoint: { ...contextPoint }, contextTargetId }),

  closeContextSurface: () => set(closedContext),

  select: (id) =>
    set((s) => id && !s.spaces.some((space) => space.id === id) ? {} : replaceSelectionState(id)),

  setCamera: (camera) => set({ camera }),

  zoomBy: (factor) =>
    set((s) => ({
      camera: {
        ...s.camera,
        zoom: clamp(s.camera.zoom * factor, Z_MIN, Z_MAX),
      },
    })),

  fitView: () =>
    set((s) => ({
      camera: fitCamera(s.spaces, window.innerWidth, window.innerHeight),
    })),

  resetView: () => set({ camera: { ...DEFAULT_CAMERA } }),

  addSpace: (partial) =>
    set((s) => {
      const cell = makeCell(s.spaces.length, partial);
      return {
        spaces: [...s.spaces, cell],
        ...replaceSelectionState(cell.id),
      };
    }),

  addVoid: () =>
    set((s) => {
      const cell = makeCell(s.spaces.length, {
        kind: "void",
        x: s.camera.x,
        y: s.camera.y,
      });
      return {
        spaces: [...s.spaces, cell],
        ...replaceSelectionState(cell.id),
      };
    }),

  addSpaces: (count) =>
    set((s) => {
      const total = Math.max(0, Math.floor(count));
      if (total === 0) return {};
      const now = Date.now();
      const candidates = Array.from({ length: total }, (_, k) =>
        makeCell(s.spaces.length + k, {
          born: now + k * 45,
        })
      );
      const added = placeBatchCells(s.spaces, candidates, { x: s.camera.x, y: s.camera.y });
      const beforeSelection: SelectionSnapshot = {
        selectedIds: [...s.selectedIds],
        primarySelectedId: s.primarySelectedId,
      };
      const afterSelection: SelectionSnapshot = {
        selectedIds: added.map((space) => space.id),
        primarySelectedId: added[added.length - 1]?.id ?? null,
      };
      const entry: SpaceHistoryEntry = {
        kind: "batch-add",
        added: added.map(cloneSpace),
        beforeSelection,
        afterSelection,
      };
      return {
        spaces: [...s.spaces, ...added],
        ...normalizeSelectionState(afterSelection),
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  duplicateSpace: (id) => {
    let duplicateId: string | null = null;
    set((s) => {
      const source = s.spaces.find((space) => space.id === id);
      if (!source) return {};
      const duplicate = makeCell(s.spaces.length, {
        name: `${source.name} Copy`,
        body: source.body ?? "",
        kind: source.kind,
        area: source.area,
        category: source.category,
        privacy: source.privacy,
        color: source.color,
        appearance: cloneCellAppearanceOverrides(source.appearance),
        x: source.x + 18,
        y: source.y + 18,
      });
      duplicateId = duplicate.id;
      const sourcePlacement = s.settings.resources.iconPlacements.find((placement) => placement.targetSpaceId === id);
      const resources = sourcePlacement
        ? withSymbolPlacement(s.settings.resources, duplicate.id, { ...sourcePlacement, targetSpaceId: duplicate.id }, false)
        : s.settings.resources;
      return {
        spaces: [...s.spaces, duplicate],
        settings: resources === s.settings.resources ? s.settings : { ...s.settings, resources },
        ...replaceSelectionState(duplicate.id),
      };
    });
    return duplicateId;
  },

  addDemo: (n = 10) =>
    set((s) => {
      const now = Date.now();
      const added = Array.from({ length: n }, (_, k) => {
        const prog = DEMO_PROGRAM[(s.spaces.length + k) % DEMO_PROGRAM.length];
        return makeCell(s.spaces.length + k, { ...prog, born: now + k * 45 });
      });
      return { spaces: [...s.spaces, ...added] };
    }),

  updateSpace: (id, patch) =>
    set((s) => ({
      spaces: s.spaces.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  commitSpaceEdit: (id, patch) =>
    set((s) => {
      const result = updateCellsWithHistory(s.spaces, [id], (current) => ({
        ...current,
        name: patch.name.trim() || current.name,
        area: Number.isFinite(patch.area) && patch.area > 0 ? patch.area : current.area,
        body: normalizeBody(patch.body, current.body ?? ""),
      }));
      if (!result) return {};
      return {
        spaces: result.spaces,
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  commitSpaceContent: (ids, patch) =>
    set((s) => {
      const result = updateCellsWithHistory(s.spaces, ids, (current) => ({
        ...current,
        name: typeof patch.name === "string" ? patch.name.trim() || current.name : current.name,
        area: typeof patch.area === "number" && Number.isFinite(patch.area) && patch.area > 0 ? patch.area : current.area,
        body: patch.body === undefined ? current.body ?? "" : normalizeBody(patch.body, current.body ?? ""),
      }));
      if (!result) return {};
      return {
        spaces: result.spaces,
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  setActiveAppearanceTarget: (activeAppearanceTarget) => set({ activeAppearanceTarget }),

  commitAppearancePatch: (ids, target, patch) =>
    set((s) => {
      const defaults = s.settings.presentationDefaults;
      const result = updateCellsWithHistory(s.spaces, ids, (space) => ({
        ...space,
        appearance: applyAppearancePatch(space.appearance, defaults, target, patch),
      }));
      if (!result) return { appearancePreview: null, appearancePreviewIds: null, appearancePreviewTarget: null };
      return {
        spaces: result.spaces,
        appearancePreview: null,
        appearancePreviewIds: [...ids],
        appearancePreviewTarget: target,
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  previewAppearancePatch: (ids, target, patch) =>
    set((s) => {
      const idSet = new Set(ids);
      const defaults = s.settings.presentationDefaults;
      return {
        appearancePreview: s.spaces.map((space) => idSet.has(space.id) ? {
          ...space,
          appearance: applyAppearancePatch(space.appearance, defaults, target, patch),
        } : space),
        appearancePreviewIds: [...ids],
        appearancePreviewTarget: target,
      };
    }),

  commitAppearancePreview: () =>
    set((s) => {
      if (!s.appearancePreview) return {};
      const beforeById = new Map(s.spaces.map((space) => [space.id, space]));
      const changedIds = s.appearancePreview
        .filter((space) => JSON.stringify(space.appearance) !== JSON.stringify(beforeById.get(space.id)?.appearance))
        .map((space) => space.id);
      const result = updateCellsWithHistory(s.spaces, changedIds, (space) =>
        s.appearancePreview!.find((preview) => preview.id === space.id) ?? space
      );
      if (!result) return { appearancePreview: null, appearancePreviewIds: null, appearancePreviewTarget: null };
      return {
        spaces: result.spaces,
        appearancePreview: null,
        appearancePreviewIds: s.appearancePreviewIds ? [...s.appearancePreviewIds] : null,
        appearancePreviewTarget: s.appearancePreviewTarget,
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  cancelAppearancePreview: () => set({ appearancePreview: null, appearancePreviewIds: null, appearancePreviewTarget: null }),

  commitTextAppearancePatch: (ids, patch) =>
    set((s) => {
      const defaults = s.settings.presentationDefaults;
      const result = updateCellsWithHistory(s.spaces, ids, (space) => ({
        ...space,
        appearance: applyTextAppearancePatch(space.appearance, defaults, patch),
      }));
      if (!result) return {};
      return {
        spaces: result.spaces,
        appearancePreviewIds: [...ids],
        appearancePreviewTarget: "text",
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  previewTextAppearancePatch: (ids, patch) =>
    set((s) => {
      const idSet = new Set(ids);
      const defaults = s.settings.presentationDefaults;
      return {
        appearancePreview: s.spaces.map((space) => idSet.has(space.id) ? {
          ...space,
          appearance: applyTextAppearancePatch(space.appearance, defaults, patch),
        } : space),
        appearancePreviewIds: [...ids],
        appearancePreviewTarget: "text",
      };
    }),

  resetAppearanceTarget: (ids, target) =>
    set((s) => {
      const result = updateCellsWithHistory(s.spaces, ids, (space) => ({
        ...space,
        appearance: resetAppearanceChannel(space.appearance, target),
      }));
      if (!result) return {};
      return {
        spaces: result.spaces,
        appearancePreviewIds: [...ids],
        appearancePreviewTarget: target,
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  resetAppearanceFamily: (ids, family) =>
    set((s) => {
      const result = updateCellsWithHistory(s.spaces, ids, (space) => ({
        ...space,
        appearance: resetAppearanceFamilyChannels(space.appearance, family),
      }));
      if (!result) return {};
      return {
        spaces: result.spaces,
        appearancePreview: null,
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  resetAllAppearance: (ids) =>
    set((s) => {
      const result = updateCellsWithHistory(s.spaces, ids, (space) => ({ ...space, appearance: undefined }));
      if (!result) return {};
      return {
        spaces: result.spaces,
        transformUndoStack: pushHistory(s.transformUndoStack, result.entry),
        transformRedoStack: [],
      };
    }),

  copyStyle: (id) =>
    set((s) => {
      const source = s.spaces.find((space) => space.id === id);
      const placement = s.settings.resources.iconPlacements.find((item) => item.targetSpaceId === id);
      return source ? { styleClipboard: {
        appearance: cloneStyle(source.appearance) ?? null,
        symbolStyle: placement ? symbolStyle(placement) : null,
      } } : {};
    }),

  pasteStyle: (ids) =>
    set((s) => {
      if (!s.styleClipboard) return {};
      const defaults = s.settings.presentationDefaults;
      const result = updateCellsWithHistory(s.spaces, ids, (space) => ({
        ...space,
        appearance: normalizeCellAppearanceOverrides(s.styleClipboard!.appearance, defaults),
      }));
      const beforeResources = cloneResourceSettings(s.settings.resources);
      let afterResources = cloneResourceSettings(beforeResources);
      if (s.styleClipboard.symbolStyle) {
        const targetSet = new Set(ids);
        afterResources.iconPlacements = afterResources.iconPlacements.map((placement) => targetSet.has(placement.targetSpaceId)
          ? normalizeIconPlacement({ ...placement, ...s.styleClipboard!.symbolStyle })
          : placement);
        afterResources = cloneResourceSettings(afterResources);
      }
      if (!result && JSON.stringify(beforeResources) === JSON.stringify(afterResources)) return {};
      const before = result?.entry.kind === "cells" ? result.entry.before : snapshotCells(s.spaces, new Set(ids));
      const nextSpaces = result?.spaces ?? s.spaces;
      const after = snapshotCells(nextSpaces, new Set(ids));
      const entry: SpaceHistoryEntry = { kind: "style", before, after, beforeResources, afterResources };
      return {
        spaces: nextSpaces,
        settings: { ...s.settings, resources: afterResources },
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  commitProjectPresentationDefaults: (defaults) =>
    set((s) => {
      const after = normalizeProjectPresentationDefaults(defaults, s.settings);
      const before = cloneProjectPresentationDefaults(s.settings.presentationDefaults);
      if (JSON.stringify(before) === JSON.stringify(after)) return { presentationDefaultsPreview: null };
      const entry: SpaceHistoryEntry = { kind: "defaults", before, after };
      return {
        settings: { ...s.settings, presentationDefaults: after },
        presentationDefaultsPreview: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  previewProjectPresentationDefaults: (defaults) =>
    set((s) => ({
      presentationDefaultsPreview: normalizeProjectPresentationDefaults(defaults, s.settings),
    })),

  commitPresentationDefaultsPreview: () =>
    set((s) => {
      if (!s.presentationDefaultsPreview) return {};
      const before = cloneProjectPresentationDefaults(s.settings.presentationDefaults);
      const after = cloneProjectPresentationDefaults(s.presentationDefaultsPreview);
      if (JSON.stringify(before) === JSON.stringify(after)) return { presentationDefaultsPreview: null };
      const entry: SpaceHistoryEntry = { kind: "defaults", before, after };
      return {
        settings: { ...s.settings, presentationDefaults: after },
        presentationDefaultsPreview: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  cancelPresentationDefaultsPreview: () => set({ presentationDefaultsPreview: null }),

  commitMembraneRuntime: (patch) =>
    set((s) => {
      const before: MembraneRuntimeSnapshot = {
        morphMode: s.settings.morphMode,
        attachMode: s.settings.attachMode,
        mergeDistance: s.settings.mergeDistance,
      };
      const after: MembraneRuntimeSnapshot = {
        morphMode: patch.morphMode ?? before.morphMode,
        attachMode: patch.attachMode ?? before.attachMode,
        mergeDistance: typeof patch.mergeDistance === "number" && Number.isFinite(patch.mergeDistance)
          ? clamp(patch.mergeDistance, 0, 300)
          : before.mergeDistance,
      };
      if (JSON.stringify(before) === JSON.stringify(after)) return { membraneRuntimePreview: null };
      const entry: SpaceHistoryEntry = { kind: "membrane-runtime", before, after };
      return {
        settings: { ...s.settings, ...after },
        membraneRuntimePreview: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  previewMembraneRuntime: (patch) =>
    set((s) => ({
      membraneRuntimePreview: {
        morphMode: patch.morphMode ?? s.settings.morphMode,
        attachMode: patch.attachMode ?? s.settings.attachMode,
        mergeDistance: typeof patch.mergeDistance === "number" && Number.isFinite(patch.mergeDistance)
          ? clamp(patch.mergeDistance, 0, 300)
          : s.settings.mergeDistance,
      },
    })),

  commitMembraneRuntimePreview: () =>
    set((s) => {
      if (!s.membraneRuntimePreview) return {};
      const before: MembraneRuntimeSnapshot = {
        morphMode: s.settings.morphMode,
        attachMode: s.settings.attachMode,
        mergeDistance: s.settings.mergeDistance,
      };
      const after = { ...s.membraneRuntimePreview };
      if (JSON.stringify(before) === JSON.stringify(after)) return { membraneRuntimePreview: null };
      const entry: SpaceHistoryEntry = { kind: "membrane-runtime", before, after };
      return {
        settings: { ...s.settings, ...after },
        membraneRuntimePreview: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  cancelMembraneRuntimePreview: () => set({ membraneRuntimePreview: null }),

  commitVisualSettings: (patch) =>
    set((s) => {
      const before = snapshotVisualSettings(s.settings);
      const after: VisualSettingsSnapshot = {
        organism: { ...before.organism, ...(patch.organism ?? {}) },
        cellShadow: normalizeCellShadow({ ...before.cellShadow, ...(patch.cellShadow ?? {}) }),
      };
      if (JSON.stringify(before) === JSON.stringify(after)) return { visualSettingsPreview: null };
      const entry: SpaceHistoryEntry = { kind: "visual-settings", before, after };
      return {
        settings: { ...s.settings, organism: after.organism, cellShadow: after.cellShadow },
        visualSettingsPreview: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  previewVisualSettings: (patch) =>
    set((s) => {
      const base = s.visualSettingsPreview ?? snapshotVisualSettings(s.settings);
      return { visualSettingsPreview: {
        organism: { ...base.organism, ...(patch.organism ?? {}) },
        cellShadow: normalizeCellShadow({ ...base.cellShadow, ...(patch.cellShadow ?? {}) }),
      } };
    }),

  commitVisualSettingsPreview: () =>
    set((s) => {
      if (!s.visualSettingsPreview) return {};
      const before = snapshotVisualSettings(s.settings);
      const after = cloneVisualSettings(s.visualSettingsPreview);
      if (JSON.stringify(before) === JSON.stringify(after)) return { visualSettingsPreview: null };
      const entry: SpaceHistoryEntry = { kind: "visual-settings", before, after };
      return {
        settings: { ...s.settings, organism: after.organism, cellShadow: after.cellShadow },
        visualSettingsPreview: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  cancelVisualSettingsPreview: () => set({ visualSettingsPreview: null }),

  commitSymbolPlacement: (targetSpaceId, placement) =>
    set((s) => {
      const before = cloneResourceSettings(s.settings.resources);
      const after = withSymbolPlacement(before, targetSpaceId, placement, true);
      if (JSON.stringify(before) === JSON.stringify(after)) return { resourcesPreview: null };
      const entry: SpaceHistoryEntry = { kind: "resources", before, after };
      return {
        settings: { ...s.settings, resources: after },
        resourcesPreview: null,
        arrangementPreview: null,
        arrangementPreviewPatternId: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  commitSymbolPreview: () =>
    set((s) => {
      if (!s.resourcesPreview) return {};
      const before = cloneResourceSettings(s.settings.resources);
      const after = cloneResourceSettings(s.resourcesPreview);
      if (JSON.stringify(before) === JSON.stringify(after)) return { resourcesPreview: null };
      const entry: SpaceHistoryEntry = { kind: "resources", before, after };
      return {
        settings: { ...s.settings, resources: after },
        resourcesPreview: null,
        arrangementPreview: null,
        arrangementPreviewPatternId: null,
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  previewSymbolPlacement: (targetSpaceId, placement) =>
    set((s) => ({ resourcesPreview: withSymbolPlacement(s.settings.resources, targetSpaceId, placement, false) })),

  cancelSymbolPreview: () => set({ resourcesPreview: null }),

  toggleIconFavourite: (iconId) =>
    set((s) => {
      const before = cloneResourceSettings(s.settings.resources);
      const canonicalId = normalizeIconPlacement({ iconId, targetSpaceId: "__favourite__" }).iconId;
      if (!canonicalId) return {};
      const after = cloneResourceSettings({
        ...before,
        iconFavourites: before.iconFavourites.includes(canonicalId)
          ? before.iconFavourites.filter((id) => id !== canonicalId)
          : [...before.iconFavourites, canonicalId],
      });
      const entry: SpaceHistoryEntry = { kind: "resources", before, after };
      return {
        settings: { ...s.settings, resources: after },
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  moveSpace: (id, x, y) =>
    set((s) => ({
      spaces: s.spaces.map((c) => (c.id === id ? { ...c, x, y } : c)),
    })),

  commitSpaceTransform: (before, after) =>
    set((s) => {
      const transform = normalizeLiveTransform(s.spaces, before, after);
      if (!isMeaningfulSpaceTransform(transform.before, transform.after)) return {};
      const entry: SpaceHistoryEntry = { kind: "transform", ...transform };
      return {
        spaces: applyHistoryEntry(s.spaces, entry, "after"),
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: [],
      };
    }),

  undoSpaceTransform: () =>
    set((s) => {
      const entry = s.transformUndoStack[s.transformUndoStack.length - 1];
      if (!entry) return {};
      const historySelection = entry.kind === "batch-add" ? entry.beforeSelection : null;
      return {
        spaces: applyHistoryEntry(s.spaces, entry, "before"),
        settings: entry.kind === "defaults"
          ? { ...s.settings, presentationDefaults: cloneProjectPresentationDefaults(entry.before) }
          : entry.kind === "membrane-runtime"
            ? { ...s.settings, ...entry.before }
            : entry.kind === "visual-settings"
              ? { ...s.settings, ...cloneVisualSettings(entry.before) }
              : entry.kind === "resources"
                ? { ...s.settings, resources: cloneResourceSettings(entry.before) }
                : entry.kind === "style"
                  ? { ...s.settings, resources: cloneResourceSettings(entry.beforeResources) }
                  : s.settings,
        appearancePreview: null,
        presentationDefaultsPreview: null,
        membraneRuntimePreview: null,
        visualSettingsPreview: null,
        resourcesPreview: null,
        ...(historySelection ? normalizeSelectionState(historySelection) : {}),
        transformUndoStack: s.transformUndoStack.slice(0, -1),
        transformRedoStack: [...s.transformRedoStack, entry].slice(-TRANSFORM_HISTORY_LIMIT),
      };
    }),

  redoSpaceTransform: () =>
    set((s) => {
      const entry = s.transformRedoStack[s.transformRedoStack.length - 1];
      if (!entry) return {};
      const historySelection = entry.kind === "batch-add" ? entry.afterSelection : null;
      return {
        spaces: applyHistoryEntry(s.spaces, entry, "after"),
        settings: entry.kind === "defaults"
          ? { ...s.settings, presentationDefaults: cloneProjectPresentationDefaults(entry.after) }
          : entry.kind === "membrane-runtime"
            ? { ...s.settings, ...entry.after }
            : entry.kind === "visual-settings"
              ? { ...s.settings, ...cloneVisualSettings(entry.after) }
              : entry.kind === "resources"
                ? { ...s.settings, resources: cloneResourceSettings(entry.after) }
                : entry.kind === "style"
                  ? { ...s.settings, resources: cloneResourceSettings(entry.afterResources) }
                  : s.settings,
        appearancePreview: null,
        presentationDefaultsPreview: null,
        membraneRuntimePreview: null,
        visualSettingsPreview: null,
        resourcesPreview: null,
        ...(historySelection ? normalizeSelectionState(historySelection) : {}),
        transformUndoStack: pushHistory(s.transformUndoStack, entry),
        transformRedoStack: s.transformRedoStack.slice(0, -1),
      };
    }),

  removeSpace: (id) =>
    set((s) => {
      const spaces = s.spaces.filter((c) => c.id !== id);
      const selection = normalizeSelectionState(
        selectionFromState(s),
        new Set(spaces.map((space) => space.id))
      );
      return {
        spaces,
        settings: {
          ...s.settings,
          resources: cloneResourceSettings({
            ...s.settings.resources,
            iconPlacements: s.settings.resources.iconPlacements.filter((placement) => placement.targetSpaceId !== id),
          }),
        },
        ...selection,
        ...(s.contextTargetId === id ? closedContext : {}),
      };
    }),

  applyLayoutPreset: (presetId) =>
    set((s) => {
      const arrangedIds = s.selectedIds.length > 0
        ? s.selectedIds.filter((id) => s.spaces.some((space) => space.id === id))
        : visibleSelectableIds(s.spaces, s.settings.rendererMode);
      const arrangedIdSet = new Set(arrangedIds);
      const beforeSubset = s.spaces.filter((space) => arrangedIdSet.has(space.id));
      const generated = calculateArrangement({
        patternId: presetId,
        entities: beforeSubset.map((space) => ({
          id: space.id,
          x: space.x,
          y: space.y,
          radius: areaToRadius(space.area),
          kind: space.kind ?? "space",
        })),
        parameters: {
          ...DEFAULT_ARRANGEMENT_PARAMETERS,
          seed: presetId === "random" ? regenerateArrangementSeed(Date.now()) : DEFAULT_ARRANGEMENT_PARAMETERS.seed,
        },
      });
      const spaces = applySpacePositions(s.spaces, generated);
      const before = beforeSubset.map(({ id, x, y }) => ({ id, x, y }));
      const afterById = new Map(spaces.map((space) => [space.id, space]));
      const after = beforeSubset.map(({ id }) => {
        const space = afterById.get(id)!;
        return { id, x: space.x, y: space.y };
      });
      const entry: SpaceHistoryEntry | null = isMeaningfulSpaceTransform(before, after)
        ? { kind: "transform", before, after }
        : null;
      return {
        spaces,
        settings: { ...s.settings, layoutPreset: presetId },
        ...normalizeSelectionState(selectionFromState(s), new Set(spaces.map((space) => space.id))),
        ...(entry ? {
          transformUndoStack: pushHistory(s.transformUndoStack, entry),
          transformRedoStack: [],
        } : {}),
      };
    }),

  previewArrangement: async (patternId, parameters) => {
    const state = useLab.getState();
    const visibleIds = visibleSelectableIds(state.spaces, state.settings.rendererMode);
    const arrangedIds = resolveArrangementScope(
      state.spaces,
      state.selectedIds,
      visibleIds,
      parameters.scope,
      parameters.includeVoids,
    );
    const arrangedSet = new Set(arrangedIds);
    const entities = state.spaces.filter((space) => arrangedSet.has(space.id)).map((space) => ({
      id: space.id,
      x: space.x,
      y: space.y,
      radius: areaToRadius(space.area),
      kind: space.kind ?? "space" as const,
    }));
    const arrangementPreview = await arrangementRuntime.calculate({ patternId, entities, parameters });
    if (!arrangementPreview) return;
    set({ arrangementPreview, arrangementPreviewPatternId: patternId });
  },

  applyArrangementPreview: () =>
    set((s) => {
      const preview = s.arrangementPreview;
      if (!preview?.length) return { arrangementPreview: null, arrangementPreviewPatternId: null };
      const previewIds = new Set(preview.map(({ id }) => id));
      const before = s.spaces.filter((space) => previewIds.has(space.id)).map(({ id, x, y }) => ({ id, x, y }));
      const transform = normalizeLiveTransform(s.spaces, before, preview);
      const entry: SpaceHistoryEntry | null = isMeaningfulSpaceTransform(transform.before, transform.after)
        ? { kind: "transform", ...transform }
        : null;
      const patternId = s.arrangementPreviewPatternId;
      return {
        spaces: entry ? applyHistoryEntry(s.spaces, entry, "after") : s.spaces,
        settings: patternId && isLegacyLayoutPreset(patternId)
          ? { ...s.settings, layoutPreset: patternId }
          : s.settings,
        arrangementPreview: null,
        arrangementPreviewPatternId: null,
        ...(entry ? {
          transformUndoStack: pushHistory(s.transformUndoStack, entry),
          transformRedoStack: [],
        } : {}),
      };
    }),

  cancelArrangementPreview: () => {
    arrangementRuntime.cancel();
    set({ arrangementPreview: null, arrangementPreviewPatternId: null });
  },

  saveCurrentView: (name) => {
    let id: string | null = null;
    set((s) => {
      const snapshot = makeSnapshot(s, name);
      id = snapshot.id;
      const savedViews = [snapshot, ...s.savedViews].slice(0, SAVED_VIEWS_LIMIT);
      persistSavedViews(savedViews);
      return { savedViews };
    });
    return id;
  },

  loadSavedView: (id) =>
    set((s) => {
      const snapshot = s.savedViews.find((view) => view.id === id);
      if (!snapshot) return {};
      const now = Date.now();
      const organism = { ...DEFAULT_ORGANISM_SETTINGS, ...cloneOrganism(snapshot.organism) };
      const resources = snapshot.resources
        ? cloneResourceSettings(snapshot.resources)
        : {
            ...cloneResourceSettings(s.settings.resources),
            materialBindings: defaultMaterialBindings(
              snapshot.nucleusPaletteId ?? s.settings.nucleusPaletteId,
              snapshot.organismPaletteId ?? s.settings.organismPaletteId
            ),
            grid: migrateLegacyGridSettings(snapshot.showGrid ?? s.settings.showGrid),
            annotationInstances: [],
            iconPlacements: [],
          };
      const presentationDefaults = normalizeProjectPresentationDefaults(snapshot.presentationDefaults, {
        blobOn: snapshot.blobOn ?? true,
        organism,
        resources,
        annotationDetail: snapshot.annotationDetail,
        labelColourMode: snapshot.labelColourMode,
        labelCustomColour: snapshot.labelCustomColour,
      });
      const spaces = snapshot.spaces.map((space, index) => ({
        ...cloneSpace(space),
        appearance: normalizeCellAppearanceOverrides(space.appearance, presentationDefaults),
        born: now + index * 24,
      }));
      return {
        theme: snapshot.theme,
        spaces,
        camera: cloneCamera(snapshot.camera),
        ...replaceSelectionState(null),
        ...closedContext,
        settings: {
          ...s.settings,
          uiScale: normalizeUiScale(snapshot.uiScale),
          widgetScale: normalizeWidgetScale(snapshot.widgetScale),
          blobOn: snapshot.blobOn ?? true,
          mergeDistance: snapshot.mergeDistance ?? s.settings.mergeDistance,
          morphMode: snapshot.morphMode ?? s.settings.morphMode,
          attachMode: snapshot.attachMode ?? s.settings.attachMode,
          paletteMode: snapshot.paletteMode,
          colorSource: snapshot.colorSource === "privacy" ? "privacy" : "category",
          layoutPreset: snapshot.layoutPreset,
          annotationMode: snapshot.annotationMode,
          annotationDetail: {
            ...DEFAULT_ANNOTATION_DETAIL,
            ...(snapshot.annotationDetail ?? {}),
          },
          rendererMode: snapshot.rendererMode,
          showGrid: snapshot.showGrid ?? s.settings.showGrid,
          nucleusPaletteId: snapshot.nucleusPaletteId ?? s.settings.nucleusPaletteId,
          organismPaletteId: snapshot.organismPaletteId ?? s.settings.organismPaletteId,
          organism,
          resources,
          presentationDefaults,
          labelScaleMode: normalizeLabelScaleMode(snapshot.labelScaleMode, snapshot.rendererMode),
          labelColourMode: normalizeLabelColourMode(snapshot.labelColourMode),
          labelCustomColour: normalizeLabelCustomColour(snapshot.labelCustomColour),
          cellShadow: normalizeLegacyCellShadow(snapshot.cellShadow, snapshot.rendererMode),
          performanceQuality: normalizePerformanceQuality(snapshot.performanceQuality),
        },
      };
    }),

  renameSavedView: (id, name) =>
    set((s) => {
      const trimmed = name.trim();
      if (!trimmed) return {};
      const savedViews = s.savedViews.map((view) =>
        view.id === id ? { ...view, name: trimmed } : view
      );
      persistSavedViews(savedViews);
      return { savedViews };
    }),

  deleteSavedView: (id) =>
    set((s) => {
      const savedViews = s.savedViews.filter((view) => view.id !== id);
      persistSavedViews(savedViews);
      return { savedViews };
    }),

  duplicateSavedView: (id) => {
    let newId: string | null = null;
    set((s) => {
      const snapshot = s.savedViews.find((view) => view.id === id);
      if (!snapshot) return {};
      const duplicate: SavedCanvasSnapshot = {
        ...cloneSnapshot(snapshot),
        id: snapshotId(),
        name: `${snapshot.name} Copy`,
        createdAt: Date.now(),
      };
      newId = duplicate.id;
      const savedViews = [duplicate, ...s.savedViews].slice(0, SAVED_VIEWS_LIMIT);
      persistSavedViews(savedViews);
      return { savedViews };
    });
    return newId;
  },
}));

// Dev-only handle for Playwright/preview QA.
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as unknown as { lab: typeof useLab }).lab = useLab;
}
