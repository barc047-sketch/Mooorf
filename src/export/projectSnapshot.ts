import type {
  AnnotationDetail,
  AnnotationMode,
  AttachMode,
  Camera,
  ColorSource,
  LayoutPresetId,
  MorphMode,
  OrganismSettings,
  PaletteMode,
  RendererMode,
  SpaceCell,
  Theme,
} from "../types";
import { PROJECT_SNAPSHOT_SCHEMA_VERSION } from "./types";

/* Mirrors the existing SavedCanvasSnapshot field set (src/types.ts) so the
   JSON project export reuses one canonical project-state shape instead of
   inventing a second schema. openWidgets/debug/browser-only state are never
   included — this is project data, not UI session state. */
export interface ProjectExportSettings {
  rendererMode: RendererMode;
  morphMode: MorphMode;
  attachMode: AttachMode;
  mergeDistance: number;
  blobOn: boolean;
  paletteMode: PaletteMode;
  colorSource: ColorSource;
  layoutPreset: LayoutPresetId;
  annotationMode: AnnotationMode;
  annotationDetail: AnnotationDetail;
  showGrid: boolean;
  nucleusPaletteId: string;
  organismPaletteId: string;
  organism: OrganismSettings;
  uiScale: number;
  widgetScale: number;
}

export interface ProjectExportSummary {
  spaceCount: number;
  voidCount: number;
  programmedAreaM2: number;
}

export interface ProjectExportSnapshot {
  schemaVersion: number;
  exportedAt: string;
  project: { title: string };
  spaces: SpaceCell[];
  camera: Camera;
  theme: Theme;
  settings: ProjectExportSettings;
  summary: ProjectExportSummary;
}

export interface ProjectExportInput {
  spaces: SpaceCell[];
  camera: Camera;
  theme: Theme;
  settings: ProjectExportSettings;
}

/** Programmed area excludes voids — matches the domain convention used by
 * every V7 stats selector (voids never inflate program totals). */
export const computeProgrammedArea = (spaces: readonly SpaceCell[]): number =>
  spaces.reduce((sum, s) => {
    if (s.kind === "void") return sum;
    return sum + (Number.isFinite(s.area) ? s.area : 0);
  }, 0);

export const buildProjectSnapshot = (
  input: ProjectExportInput,
  title: string,
  now: Date = new Date()
): ProjectExportSnapshot => {
  const voidCount = input.spaces.filter((s) => s.kind === "void").length;
  return {
    schemaVersion: PROJECT_SNAPSHOT_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    project: { title: title.trim() },
    spaces: input.spaces.map((s) => ({ ...s })),
    camera: { ...input.camera },
    theme: input.theme,
    settings: { ...input.settings, organism: { ...input.settings.organism } },
    summary: {
      spaceCount: input.spaces.length,
      voidCount,
      programmedAreaM2: computeProgrammedArea(input.spaces),
    },
  };
};
