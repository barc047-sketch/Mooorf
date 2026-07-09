import { create } from "zustand";
import type {
  AnnotationMode,
  AttachMode,
  Camera,
  LayoutPresetId,
  MorphMode,
  OrganismSettings,
  OrgPanelFocus,
  PaletteMode,
  RendererMode,
  SelectionDisplay,
  SpaceCell,
  Theme,
  ViewMode,
} from "../types";
import { clamp, scatterPoint } from "../lib/geometry";
import { CELL_PALETTE, DEMO_PROGRAM } from "../lib/demo";
import { DEFAULT_CAMERA, fitCamera, Z_MAX, Z_MIN } from "../lib/camera";
import { DEFAULT_ORGANISM_SETTINGS } from "../canvas/organismProductionSettings";
import { applyLayoutPreset as arrangeLayoutPreset } from "../canvas/layoutPresets";

let idCounter = 0;
const uid = () => `sc_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
const TAU = Math.PI * 2;

export interface LabSettings {
  mergeDistance: number; // 0–300 — fine-tunes membrane reach within the attachment preset
  blobOn: boolean;
  morphMode: MorphMode;
  attachMode: AttachMode;
  paletteMode: PaletteMode;
  layoutPreset: LayoutPresetId;
  annotationMode: AnnotationMode;
  selectionDisplay: SelectionDisplay;
  rendererMode: RendererMode;
  organism: OrganismSettings;
}

interface LabState {
  theme: Theme;
  view: ViewMode;
  spaces: SpaceCell[];
  loaderDone: boolean;
  settings: LabSettings;
  selectedId: string | null;
  camera: Camera;
  orgPanelOpen: boolean;
  orgPanelFocus: OrgPanelFocus;

  toggleTheme: () => void;
  setView: (view: ViewMode) => void;
  setLoaderDone: () => void;
  setSettings: (patch: Partial<LabSettings>) => void;
  setOrganism: (patch: Partial<OrganismSettings>) => void;
  setOrgPanel: (open: boolean, focus?: OrgPanelFocus) => void;
  select: (id: string | null) => void;
  setCamera: (camera: Camera) => void;
  zoomBy: (factor: number) => void;
  fitView: () => void;
  resetView: () => void;

  addSpace: (partial?: Partial<SpaceCell>) => void;
  addSpaces: (count: number) => void;
  addDemo: (n?: number) => void;
  updateSpace: (id: string, patch: Partial<SpaceCell>) => void;
  moveSpace: (id: string, x: number, y: number) => void;
  removeSpace: (id: string) => void;
  applyLayoutPreset: (presetId: LayoutPresetId) => void;
}

const makeCell = (i: number, partial?: Partial<SpaceCell>): SpaceCell => {
  const p = scatterPoint(i);
  return {
    id: uid(),
    name: "New Space",
    area: 20,
    category: "Uncategorized",
    privacy: "public",
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
  settings: {
    mergeDistance: 120,
    blobOn: true,
    morphMode: "cellular-reverse",
    attachMode: "soft",
    paletteMode: "core",
    layoutPreset: "organic",
    annotationMode: "editorial",
    selectionDisplay: "tight",
    rendererMode: "organism",
    organism: { ...DEFAULT_ORGANISM_SETTINGS },
  },
  selectedId: null,
  camera: { x: 0, y: 0, zoom: 1 },
  orgPanelOpen: false,
  orgPanelFocus: null,

  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "day" ? "night" : "day" })),

  setView: (view) => set({ view }),

  setLoaderDone: () => set({ loaderDone: true }),

  setSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  setOrganism: (patch) =>
    set((s) => ({
      settings: { ...s.settings, organism: { ...s.settings.organism, ...patch } },
    })),

  setOrgPanel: (open, focus) =>
    set((s) => ({
      orgPanelOpen: open,
      orgPanelFocus: open ? focus ?? s.orgPanelFocus : null,
    })),

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
}));

// Dev-only handle for Playwright/preview QA.
if (import.meta.env.DEV) {
  (window as unknown as { lab: typeof useLab }).lab = useLab;
}
