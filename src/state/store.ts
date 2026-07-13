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
import { clamp, scatterPoint } from "../lib/geometry";
import { DEMO_PROGRAM } from "../lib/demo";
import { DEFAULT_CAMERA, fitCamera, Z_MAX, Z_MIN } from "../lib/camera";
import { DEFAULT_ORGANISM_SETTINGS } from "../canvas/organismProductionSettings";
import { applyLayoutPreset as arrangeLayoutPreset } from "../canvas/layoutPresets";
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
import type { ProjectPresentationDefaults } from "../domain/presentation/types";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import {
  cloneCellAppearanceOverrides,
  cloneProjectPresentationDefaults,
  normalizeCellAppearanceOverrides,
  normalizeProjectPresentationDefaults,
} from "../domain/presentation/validation";

let idCounter = 0;
const uid = () => `sc_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
const TAU = Math.PI * 2;
const SAVED_VIEWS_KEY = "mooorf.savedViews.v1";
export const SAVED_VIEWS_LIMIT = 20;
const TRANSFORM_HISTORY_LIMIT = 50;

interface SpaceEditSnapshot {
  name: string;
  area: number;
}

type SpaceHistoryEntry =
  | { kind: "transform"; before: SpacePosition[]; after: SpacePosition[] }
  | { kind: "edit"; id: string; before: SpaceEditSnapshot; after: SpaceEditSnapshot };

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
  moveSpace: (id: string, x: number, y: number) => void;
  commitSpaceTransform: (before: readonly SpacePosition[], after: readonly SpacePosition[]) => void;
  undoSpaceTransform: () => void;
  redoSpaceTransform: () => void;
  removeSpace: (id: string) => void;
  applyLayoutPreset: (presetId: LayoutPresetId) => void;
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
  kind: normalizeSpaceKind(space.kind),
  appearance: cloneCellAppearanceOverrides(space.appearance),
});
const cloneCamera = (camera: Camera): Camera => ({ ...camera });
const cloneOrganism = (organism: OrganismSettings): OrganismSettings => ({ ...organism });

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
  const value = entry[direction];
  return spaces.map((space) => space.id === entry.id ? { ...space, ...value } : space);
};

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
    set((s) => ({ openWidgets: resolveWidgetOpen(s.openWidgets, id).stack })),

  closeWidget: (id) =>
    set((s) => ({ openWidgets: s.openWidgets.filter((w) => w !== id) })),

  focusWidget: (id) =>
    set((s) =>
      s.openWidgets[s.openWidgets.length - 1] === id || !s.openWidgets.includes(id)
        ? {}
        : { openWidgets: [...s.openWidgets.filter((w) => w !== id), id] }
    ),

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
      const ringR = 58;
      const added = Array.from({ length: total }, (_, k) => {
        const center = k === 0;
        const angle = -Math.PI / 2 + ((Math.max(k - 1, 0) / Math.max(total - 1, 1)) * TAU);
        const radius = center ? 0 : ringR * (k % 2 === 0 ? 1 : 0.82);
        return makeCell(s.spaces.length + k, {
          x: s.camera.x + Math.cos(angle) * radius,
          y: s.camera.y + Math.sin(angle) * radius,
          born: now + k * 45,
        });
      });
      return {
        spaces: [...s.spaces, ...added],
        ...(added.length > 0 ? replaceSelectionState(added[added.length - 1].id) : selectionFromState(s)),
      };
    }),

  duplicateSpace: (id) => {
    let duplicateId: string | null = null;
    set((s) => {
      const source = s.spaces.find((space) => space.id === id);
      if (!source) return {};
      const duplicate = makeCell(s.spaces.length, {
        name: `${source.name} Copy`,
        kind: source.kind,
        area: source.area,
        category: source.category,
        privacy: source.privacy,
        color: source.color,
        x: source.x + 18,
        y: source.y + 18,
      });
      duplicateId = duplicate.id;
      return {
        spaces: [...s.spaces, duplicate],
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
      const current = s.spaces.find((space) => space.id === id);
      if (!current) return {};
      const after = {
        name: patch.name.trim() || current.name,
        area: Number.isFinite(patch.area) && patch.area > 0 ? patch.area : current.area,
      };
      const before = { name: current.name, area: current.area };
      if (before.name === after.name && before.area === after.area) return {};
      const entry: SpaceHistoryEntry = { kind: "edit", id, before, after };
      return {
        spaces: applyHistoryEntry(s.spaces, entry, "after"),
        transformUndoStack: [...s.transformUndoStack, entry].slice(-TRANSFORM_HISTORY_LIMIT),
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
        transformUndoStack: [...s.transformUndoStack, entry].slice(-TRANSFORM_HISTORY_LIMIT),
        transformRedoStack: [],
      };
    }),

  undoSpaceTransform: () =>
    set((s) => {
      const entry = s.transformUndoStack[s.transformUndoStack.length - 1];
      if (!entry) return {};
      return {
        spaces: applyHistoryEntry(s.spaces, entry, "before"),
        transformUndoStack: s.transformUndoStack.slice(0, -1),
        transformRedoStack: [...s.transformRedoStack, entry].slice(-TRANSFORM_HISTORY_LIMIT),
      };
    }),

  redoSpaceTransform: () =>
    set((s) => {
      const entry = s.transformRedoStack[s.transformRedoStack.length - 1];
      if (!entry) return {};
      return {
        spaces: applyHistoryEntry(s.spaces, entry, "after"),
        transformUndoStack: [...s.transformUndoStack, entry].slice(-TRANSFORM_HISTORY_LIMIT),
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
        ...selection,
        ...(s.contextTargetId === id ? closedContext : {}),
      };
    }),

  applyLayoutPreset: (presetId) =>
    set((s) => {
      const spaces = arrangeLayoutPreset(s.spaces, presetId, {
        centerX: s.camera.x,
        centerY: s.camera.y,
      });
      return {
        spaces,
        settings: { ...s.settings, layoutPreset: presetId },
        ...normalizeSelectionState(selectionFromState(s), new Set(spaces.map((space) => space.id))),
      };
    }),

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
