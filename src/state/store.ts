import { create } from "zustand";
import type {
  AnnotationDetail,
  AnnotationMode,
  AttachMode,
  Camera,
  CanvasReadiness,
  LayoutPresetId,
  MorphMode,
  OrganismSettings,
  PaletteMode,
  RendererMode,
  SavedCanvasSnapshot,
  SelectionDisplay,
  SpaceCell,
  SpaceKind,
  Theme,
  ViewMode,
  WidgetId,
} from "../types";
import { clamp, scatterPoint } from "../lib/geometry";
import { CELL_PALETTE, DEMO_PROGRAM } from "../lib/demo";
import { DEFAULT_CAMERA, fitCamera, Z_MAX, Z_MIN } from "../lib/camera";
import { DEFAULT_ORGANISM_SETTINGS } from "../canvas/organismProductionSettings";
import { applyLayoutPreset as arrangeLayoutPreset } from "../canvas/layoutPresets";
import { normalizeUiScale } from "./uiScale";

let idCounter = 0;
const uid = () => `sc_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
const TAU = Math.PI * 2;
const SAVED_VIEWS_KEY = "mooorf.savedViews.v1";
export const SAVED_VIEWS_LIMIT = 20;

export interface LabSettings {
  uiScale: number;
  mergeDistance: number; // 0–300 — fine-tunes membrane reach within the attachment preset
  blobOn: boolean;
  morphMode: MorphMode;
  attachMode: AttachMode;
  paletteMode: PaletteMode;
  layoutPreset: LayoutPresetId;
  annotationMode: AnnotationMode;
  annotationDetail: AnnotationDetail;
  selectionDisplay: SelectionDisplay;
  rendererMode: RendererMode;
  showGrid: boolean;
  /** "auto" = category mapping owns nucleus colors (pre-V6K behavior) */
  nucleusPaletteId: string;
  /** "mode" = style + palette mode derive body/ground (pre-V6K behavior) */
  organismPaletteId: string;
  organism: OrganismSettings;
}

export const DEFAULT_ANNOTATION_DETAIL: AnnotationDetail = {
  textScale: 1,
  textShadow: true,
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
  selectedId: string | null;
  camera: Camera;
  savedViews: SavedCanvasSnapshot[];
  /** V6K widget system — array order is stacking order (last = front) */
  openWidgets: WidgetId[];

  toggleTheme: () => void;
  setView: (view: ViewMode) => void;
  setLoaderDone: () => void;
  setCanvasReadiness: (stage: CanvasReadiness) => void;
  setSettings: (patch: Partial<LabSettings>) => void;
  setOrganism: (patch: Partial<OrganismSettings>) => void;
  setAnnotationDetail: (patch: Partial<AnnotationDetail>) => void;
  openWidget: (id: WidgetId) => void;
  closeWidget: (id: WidgetId) => void;
  toggleWidget: (id: WidgetId) => void;
  focusWidget: (id: WidgetId) => void;
  select: (id: string | null) => void;
  setCamera: (camera: Camera) => void;
  zoomBy: (factor: number) => void;
  fitView: () => void;
  resetView: () => void;

  addSpace: (partial?: Partial<SpaceCell>) => void;
  addVoid: () => void;
  addSpaces: (count: number) => void;
  addDemo: (n?: number) => void;
  updateSpace: (id: string, patch: Partial<SpaceCell>) => void;
  moveSpace: (id: string, x: number, y: number) => void;
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

const cloneSpace = (space: SpaceCell): SpaceCell => ({
  ...space,
  kind: normalizeSpaceKind(space.kind),
});
const cloneCamera = (camera: Camera): Camera => ({ ...camera });
const cloneOrganism = (organism: OrganismSettings): OrganismSettings => ({ ...organism });

const cloneSnapshot = (snapshot: SavedCanvasSnapshot): SavedCanvasSnapshot => ({
  ...snapshot,
  uiScale: normalizeUiScale(snapshot.uiScale),
  spaces: snapshot.spaces.map(cloneSpace),
  camera: cloneCamera(snapshot.camera),
  organism: cloneOrganism(snapshot.organism),
});

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
  layoutPreset: state.settings.layoutPreset,
  annotationMode: state.settings.annotationMode,
  selectionDisplay: state.settings.selectionDisplay,
  organism: cloneOrganism(state.settings.organism),
  theme: state.theme,
  uiScale: normalizeUiScale(state.settings.uiScale),
  annotationDetail: { ...state.settings.annotationDetail },
  showGrid: state.settings.showGrid,
  nucleusPaletteId: state.settings.nucleusPaletteId,
  organismPaletteId: state.settings.organismPaletteId,
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
    color: CELL_PALETTE[i % CELL_PALETTE.length],
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
  canvasReadiness: "initialising",
  settings: {
    uiScale: 1,
    mergeDistance: 120,
    blobOn: true,
    morphMode: "cellular-reverse",
    attachMode: "soft",
    paletteMode: "core",
    layoutPreset: "organic",
    annotationMode: "editorial",
    annotationDetail: { ...DEFAULT_ANNOTATION_DETAIL },
    selectionDisplay: "tight",
    rendererMode: "organism",
    showGrid: false,
    nucleusPaletteId: "auto",
    organismPaletteId: "mode",
    organism: { ...DEFAULT_ORGANISM_SETTINGS },
  },
  selectedId: null,
  camera: { x: 0, y: 0, zoom: 1 },
  savedViews: loadSavedViews(),
  openWidgets: [],

  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "day" ? "night" : "day" })),

  setView: (view) => set({ view }),

  setLoaderDone: () => set({ loaderDone: true }),

  setCanvasReadiness: (canvasReadiness) => set({ canvasReadiness }),

  setSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  setOrganism: (patch) =>
    set((s) => ({
      settings: { ...s.settings, organism: { ...s.settings.organism, ...patch } },
    })),

  setAnnotationDetail: (patch) =>
    set((s) => ({
      settings: {
        ...s.settings,
        annotationDetail: { ...s.settings.annotationDetail, ...patch },
      },
    })),

  openWidget: (id) =>
    set((s) => ({
      openWidgets: s.openWidgets.includes(id)
        ? [...s.openWidgets.filter((w) => w !== id), id]
        : [...s.openWidgets, id],
    })),

  closeWidget: (id) =>
    set((s) => ({ openWidgets: s.openWidgets.filter((w) => w !== id) })),

  toggleWidget: (id) =>
    set((s) => ({
      openWidgets: s.openWidgets.includes(id)
        ? s.openWidgets.filter((w) => w !== id)
        : [...s.openWidgets, id],
    })),

  focusWidget: (id) =>
    set((s) =>
      s.openWidgets[s.openWidgets.length - 1] === id || !s.openWidgets.includes(id)
        ? {}
        : { openWidgets: [...s.openWidgets.filter((w) => w !== id), id] }
    ),

  select: (id) => set({ selectedId: id }),

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
        selectedId: cell.id,
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
        selectedId: cell.id,
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
        selectedId: added[added.length - 1]?.id ?? s.selectedId,
      };
    }),

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

  moveSpace: (id, x, y) =>
    set((s) => ({
      spaces: s.spaces.map((c) => (c.id === id ? { ...c, x, y } : c)),
    })),

  removeSpace: (id) =>
    set((s) => ({
      spaces: s.spaces.filter((c) => c.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  applyLayoutPreset: (presetId) =>
    set((s) => ({
      spaces: arrangeLayoutPreset(s.spaces, presetId, {
        centerX: s.camera.x,
        centerY: s.camera.y,
      }),
      settings: { ...s.settings, layoutPreset: presetId },
      selectedId: s.selectedId && s.spaces.some((space) => space.id === s.selectedId)
        ? s.selectedId
        : null,
    })),

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
      const spaces = snapshot.spaces.map((space, index) => ({
        ...cloneSpace(space),
        born: now + index * 24,
      }));
      return {
        theme: snapshot.theme,
        spaces,
        camera: cloneCamera(snapshot.camera),
        selectedId: null,
        settings: {
          ...s.settings,
          uiScale: normalizeUiScale(snapshot.uiScale),
          blobOn: snapshot.blobOn ?? s.settings.blobOn,
          mergeDistance: snapshot.mergeDistance ?? s.settings.mergeDistance,
          morphMode: snapshot.morphMode ?? s.settings.morphMode,
          attachMode: snapshot.attachMode ?? s.settings.attachMode,
          paletteMode: snapshot.paletteMode,
          layoutPreset: snapshot.layoutPreset,
          annotationMode: snapshot.annotationMode,
          annotationDetail: {
            ...DEFAULT_ANNOTATION_DETAIL,
            ...(snapshot.annotationDetail ?? {}),
          },
          selectionDisplay: snapshot.selectionDisplay ?? s.settings.selectionDisplay,
          rendererMode: snapshot.rendererMode,
          showGrid: snapshot.showGrid ?? s.settings.showGrid,
          nucleusPaletteId: snapshot.nucleusPaletteId ?? s.settings.nucleusPaletteId,
          organismPaletteId: snapshot.organismPaletteId ?? s.settings.organismPaletteId,
          organism: { ...DEFAULT_ORGANISM_SETTINGS, ...cloneOrganism(snapshot.organism) },
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
if (import.meta.env.DEV) {
  (window as unknown as { lab: typeof useLab }).lab = useLab;
}
