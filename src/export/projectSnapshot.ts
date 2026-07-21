import type {
  AnnotationDetail,
  AnnotationMode,
  AttachMode,
  Camera,
  CellShadowSettings,
  ColorSource,
  LabelColourMode,
  LabelScaleMode,
  LayoutPresetId,
  MorphMode,
  OrganismSettings,
  PaletteMode,
  PerformanceQuality,
  RendererMode,
  SpaceCell,
  Theme,
} from "../types";
import { PROJECT_SNAPSHOT_SCHEMA_VERSION } from "./types";
import { normalizeOrganismSettings } from "../canvas/organismProductionSettings";
import type { ResourceSettings } from "../resources/types";
import { cloneResourceSettings } from "../resources/resourcePersistence";
import type { ProjectPresentationDefaults } from "../domain/presentation/types";
import {
  cloneProjectPresentationDefaults,
  normalizeCellAppearanceOverrides,
} from "../domain/presentation/validation";
import type { Connection } from "../domain/graph/types";
import { cloneConnections } from "../domain/connections/model";
import {
  normalizeConnectionViewSettings,
  normalizeProjectConnectionStyles,
  type ConnectionViewSettings,
  type ProjectConnectionStyles,
} from "../domain/connections/styles";

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
  resources: ResourceSettings;
  labelScaleMode: LabelScaleMode;
  labelColourMode: LabelColourMode;
  labelCustomColour: string;
  cellShadow: CellShadowSettings;
  performanceQuality: PerformanceQuality;
  presentationDefaults: ProjectPresentationDefaults;
  /** Optional only at the serialized compatibility boundary; current snapshots always emit it. */
  connectionStyles?: ProjectConnectionStyles;
  /** Optional only at the serialized compatibility boundary; current snapshots always emit it. */
  connectionView?: ConnectionViewSettings;
}

export interface NormalizedProjectExportSettings extends ProjectExportSettings {
  connectionStyles: ProjectConnectionStyles;
  connectionView: ConnectionViewSettings;
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
  connections: Connection[];
  camera: Camera;
  theme: Theme;
  settings: NormalizedProjectExportSettings;
  summary: ProjectExportSummary;
}

export interface ProjectExportInput {
  spaces: SpaceCell[];
  connections?: readonly Connection[];
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
    spaces: input.spaces.map((space) => ({
      ...space,
      appearance: normalizeCellAppearanceOverrides(space.appearance, input.settings.presentationDefaults),
    })),
    connections: cloneConnections(input.connections ?? []),
    camera: { ...input.camera },
    theme: input.theme,
    settings: {
      ...input.settings,
      organism: normalizeOrganismSettings(input.settings.organism),
      cellShadow: { ...input.settings.cellShadow },
      resources: cloneResourceSettings(input.settings.resources),
      presentationDefaults: cloneProjectPresentationDefaults(input.settings.presentationDefaults),
      connectionStyles: normalizeProjectConnectionStyles(input.settings.connectionStyles),
      connectionView: normalizeConnectionViewSettings(input.settings.connectionView),
    },
    summary: {
      spaceCount: input.spaces.length,
      voidCount,
      programmedAreaM2: computeProgrammedArea(input.spaces),
    },
  };
};
