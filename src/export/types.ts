/* V7.2 — shared export contract. Pure types only; no DOM/React deps so
   every consumer (service, widget, tests) shares one vocabulary. */

export type ExportFormat = "png" | "pdf" | "csv" | "json" | "svg" | "pack";

export type ExportResolutionScale = 1 | 2 | 4;

export type ExportBackground = "theme" | "white" | "transparent";

export type ExportLabels = "include" | "exclude";

export type ExportSelection = "clean" | "include";

export type ExportPadding = "tight" | "standard" | "wide";

export type ExportPageSize = "a4" | "a3";

export type ExportOrientation = "landscape" | "portrait";

export type ExportStage = "idle" | "preparing" | "complete" | "error";

/** Presentation-facing visual options shared by PNG / PDF / SVG / pack. */
export interface ExportVisualOptions {
  resolution: ExportResolutionScale;
  background: ExportBackground;
  labels: ExportLabels;
  selection: ExportSelection;
  padding: ExportPadding;
}

export interface ExportPresentationOptions {
  page: ExportPageSize;
  orientation: ExportOrientation;
  title: string;
  includeAreaMeta: boolean;
  includeCountMeta: boolean;
  includeDateMeta: boolean;
}

export const DEFAULT_VISUAL_OPTIONS: ExportVisualOptions = {
  resolution: 1,
  background: "theme",
  labels: "include",
  selection: "clean",
  padding: "standard",
};

export const DEFAULT_PRESENTATION_OPTIONS: ExportPresentationOptions = {
  page: "a4",
  orientation: "landscape",
  title: "",
  includeAreaMeta: true,
  includeCountMeta: true,
  includeDateMeta: true,
};

export const PADDING_PX: Record<ExportPadding, number> = {
  tight: 0,
  standard: 32,
  wide: 64,
};

/** Hard safety ceiling — guards against runaway canvas allocation. */
export const MAX_EXPORT_PIXELS = 40_000_000; // ~40MP, safe across browsers
export const MAX_EXPORT_DIMENSION = 16_384; // browser canvas dimension cap

export const PROJECT_SNAPSHOT_SCHEMA_VERSION = 1;

export const MANIFEST_SCHEMA_VERSION = 1;
