import { useLab } from "../state/store";
import { hasCanvasCaptureProvider } from "../canvas/exportCapture";
import { captureAndComposite } from "./canvasComposite";
import { spacesToCsv } from "./csv";
import { buildProjectSnapshot, computeProgrammedArea, type ProjectExportSettings } from "./projectSnapshot";
import { buildManifest } from "./manifest";
import { buildPresentationPdf } from "./pdfExport";
import { buildClassicSvg } from "./svgExport";
import {
  buildCanvasFilename,
  buildDataFilename,
  buildPackFilename,
  buildPresentationFilename,
  sanitizeFilename,
} from "./filenames";
import type { ExportPresentationOptions, ExportVisualOptions } from "./types";
import { cloneResourceSettings } from "../resources/resourcePersistence";
import { cloneProjectPresentationDefaults } from "../domain/presentation/validation";
import { normalizeOrganismSettings } from "../canvas/organismProductionSettings";
import { createDownloadFeedback, type DownloadFeedback } from "../runtime/downloadActivity";
import {
  cloneProjectConnectionStyles,
  normalizeConnectionViewSettings,
} from "../domain/connections/styles";
import { cloneProjectRelationshipTypes } from "../domain/connections/relationshipTypes";
import {
  projectRelationshipRows,
} from "../domain/connections/selectors";
import { relationshipsToCsv } from "./connectionExport";

export type PackProgressStage =
  | "RENDERING"
  | "ENCODING"
  | "SAVING"
  | "COMPLETE";

const setExportStage = async (
  feedback: DownloadFeedback,
  stage: "RENDERING" | "ENCODING" | "SAVING",
): Promise<void> => {
  feedback.stage(stage);
  await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 0));
};

export const currentSettingsForSnapshot = (): ProjectExportSettings => {
  const s = useLab.getState().settings;
  return {
    rendererMode: s.rendererMode,
    morphMode: s.morphMode,
    attachMode: s.attachMode,
    mergeDistance: s.mergeDistance,
    blobOn: s.blobOn,
    paletteMode: s.paletteMode,
    colorSource: s.colorSource,
    layoutPreset: s.layoutPreset,
    annotationMode: s.annotationMode,
    annotationDetail: { ...s.annotationDetail },
    showGrid: s.showGrid,
    nucleusPaletteId: s.nucleusPaletteId,
    organismPaletteId: s.organismPaletteId,
    organism: normalizeOrganismSettings(s.organism),
    uiScale: s.uiScale,
    widgetScale: s.widgetScale,
    resources: cloneResourceSettings(s.resources),
    labelScaleMode: s.labelScaleMode,
    labelColourMode: s.labelColourMode,
    labelCustomColour: s.labelCustomColour,
    cellShadow: { ...s.cellShadow },
    performanceQuality: s.performanceQuality,
    presentationDefaults: cloneProjectPresentationDefaults(s.presentationDefaults),
    connectionStyles: cloneProjectConnectionStyles(s.connectionStyles),
    projectRelationshipTypes: cloneProjectRelationshipTypes(s.projectRelationshipTypes),
    connectionView: normalizeConnectionViewSettings(s.connectionView),
  };
};

export const download = async (
  blob: Blob,
  filename: string,
  feedback: DownloadFeedback = createDownloadFeedback(filename),
) => {
  await feedback.complete(async () => {
    const { saveAs } = await import("file-saver");
    saveAs(blob, filename);
  });
};

const withDownloadFeedback = async <T>(
  filename: string,
  operation: (feedback: DownloadFeedback) => Promise<T>,
): Promise<T> => {
  const feedback = createDownloadFeedback(filename);
  try {
    return await operation(feedback);
  } catch (error) {
    feedback.fail(error);
    throw error;
  }
};

export const buildCurrentProjectSnapshot = (project: string) => {
  const state = useLab.getState();
  return buildProjectSnapshot(
    { spaces: state.spaces, connections: state.connections, camera: state.camera, theme: state.theme, settings: currentSettingsForSnapshot() },
    project
  );
};

export const exportPng = async (project: string, visual: ExportVisualOptions): Promise<void> => {
  const filename = buildCanvasFilename(project, "png");
  return withDownloadFeedback(filename, async (feedback) => {
    await setExportStage(feedback, "RENDERING");
    const composite = await captureAndComposite(visual);
    await setExportStage(feedback, "ENCODING");
    const blob: Blob | null = await new Promise((resolve) => composite.canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not encode the canvas as PNG.");
    await setExportStage(feedback, "SAVING");
    await download(blob, filename, feedback);
  });
};

export const exportSvg = async (project: string): Promise<void> => {
  const filename = buildCanvasFilename(project, "svg");
  return withDownloadFeedback(filename, async (feedback) => {
    await setExportStage(feedback, "RENDERING");
    const state = useLab.getState();
    const host = document.querySelector<HTMLElement>(".canvas-host, .organism-canvas-host");
    const cssWidth = host?.clientWidth ?? window.innerWidth;
    const cssHeight = host?.clientHeight ?? window.innerHeight;
    const cs = getComputedStyle(document.documentElement);
    const svg = buildClassicSvg({
      spaces: state.spaces,
      camera: state.camera,
      cssWidth,
      cssHeight,
      paletteMode: state.settings.paletteMode,
      nucleusPaletteId: state.settings.nucleusPaletteId,
      organismPaletteId: state.settings.organismPaletteId,
      morphMode: state.settings.morphMode,
      presentationDefaults: state.settings.presentationDefaults,
      colorSource: state.settings.colorSource,
      labelScaleMode: state.settings.labelScaleMode,
      labelColourMode: state.settings.labelColourMode,
      labelCustomColour: state.settings.labelCustomColour,
      annotationDetail: state.settings.annotationDetail,
      cellShadow: state.settings.cellShadow,
      performanceQuality: state.settings.performanceQuality,
      resources: state.settings.resources,
      theme: state.theme,
      background: (cs.getPropertyValue("--bg").trim() || "#ffffff"),
      includeLabels: true,
      paddingPx: 0,
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    await setExportStage(feedback, "SAVING");
    await download(blob, filename, feedback);
  });
};

export const exportCsv = async (project: string): Promise<void> => {
  const filename = buildDataFilename(project, "csv");
  return withDownloadFeedback(filename, async (feedback) => {
    await setExportStage(feedback, "ENCODING");
    const csv = spacesToCsv(useLab.getState().spaces);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    await setExportStage(feedback, "SAVING");
    await download(blob, filename, feedback);
  });
};

export const exportJson = async (project: string): Promise<void> => {
  const filename = buildDataFilename(project, "json");
  return withDownloadFeedback(filename, async (feedback) => {
    await setExportStage(feedback, "ENCODING");
    const snapshot = buildCurrentProjectSnapshot(project);
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    await setExportStage(feedback, "SAVING");
    await download(blob, filename, feedback);
  });
};

export const exportPdf = async (
  project: string,
  visual: ExportVisualOptions,
  presentation: ExportPresentationOptions
): Promise<void> => {
  const filename = buildPresentationFilename(project, presentation.page);
  return withDownloadFeedback(filename, async (feedback) => {
    await setExportStage(feedback, "RENDERING");
    const composite = await captureAndComposite(visual);
    await setExportStage(feedback, "ENCODING");
    const state = useLab.getState();
    const bytes = await buildPresentationPdf({
      canvas: composite.canvas,
      page: presentation.page,
      orientation: presentation.orientation,
      title: presentation.title || project,
      metadata: {
        programmedAreaM2: presentation.includeAreaMeta ? computeProgrammedArea(state.spaces) : undefined,
        spaceCount: presentation.includeCountMeta ? state.spaces.length : undefined,
        renderer: presentation.includeCountMeta || presentation.includeAreaMeta ? state.settings.rendererMode : undefined,
        exportDate: presentation.includeDateMeta ? new Date() : undefined,
      },
    });
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    await setExportStage(feedback, "SAVING");
    await download(blob, filename, feedback);
  });
};

export interface PresentationPackResult {
  filesIncluded: string[];
}

/** Builds every artifact from ONE shared canvas capture/composite pass (no
 * redundant 4× re-renders per format) and zips them with a manifest. */
export const buildPresentationPack = async (
  project: string,
  visual: ExportVisualOptions,
  presentation: ExportPresentationOptions,
  onProgress?: (stage: PackProgressStage) => void
): Promise<PresentationPackResult> => {
  const filename = buildPackFilename(project);
  return withDownloadFeedback(filename, async (feedback) => {
  onProgress?.("RENDERING");
  await setExportStage(feedback, "RENDERING");
  const composite = await captureAndComposite(visual);
  const state = useLab.getState();
  const pngBlob: Blob | null = await new Promise((resolve) => composite.canvas.toBlob(resolve, "image/png"));
  if (!pngBlob) throw new Error("Could not encode the canvas as PNG.");

  onProgress?.("ENCODING");
  await setExportStage(feedback, "ENCODING");
  const pdfBytes = await buildPresentationPdf({
    canvas: composite.canvas,
    page: presentation.page,
    orientation: presentation.orientation,
    title: presentation.title || project,
    metadata: {
      programmedAreaM2: presentation.includeAreaMeta ? computeProgrammedArea(state.spaces) : undefined,
      spaceCount: presentation.includeCountMeta ? state.spaces.length : undefined,
      renderer: state.settings.rendererMode,
      exportDate: presentation.includeDateMeta ? new Date() : undefined,
    },
  });

  const csv = spacesToCsv(state.spaces);
  const relationshipCsv = relationshipsToCsv(projectRelationshipRows({
    connections: state.connections,
    spaces: state.spaces,
    styles: state.settings.connectionStyles,
    projectRelationshipTypes: state.settings.projectRelationshipTypes,
  }));
  const snapshot = buildProjectSnapshot(
    { spaces: state.spaces, connections: state.connections, camera: state.camera, theme: state.theme, settings: currentSettingsForSnapshot() },
    project
  );
  const jsonText = JSON.stringify(snapshot, null, 2);

  const files: Array<{ name: string; data: Blob | string }> = [];
  if (pngBlob.size > 0) files.push({ name: "canvas.png", data: pngBlob });
  if (pdfBytes.byteLength > 0) files.push({ name: "presentation.pdf", data: new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }) });
  if (csv.trim().length > 0) files.push({ name: "spaces.csv", data: csv });
  if (relationshipCsv.trim().length > 0) files.push({ name: "relationships.csv", data: relationshipCsv });
  if (jsonText.length > 0) files.push({ name: "project.json", data: jsonText });

  const manifest = buildManifest({
    project,
    files: files.map((f) => f.name),
    renderer: state.settings.rendererMode,
    colorSource: state.settings.colorSource,
    dimensions: { width: composite.width, height: composite.height },
    visual,
    resourceSchemaVersion: state.settings.resources.schemaVersion,
    activeMaterialIds: [...new Set(Object.values(state.settings.resources.materialBindings).filter((binding) => binding.enabled).map((binding) => binding.materialId))],
    activeGridPresetId: state.settings.resources.grid.presetId,
    summary: {
      spaceCount: state.spaces.length,
      voidCount: state.spaces.filter((s) => s.kind === "void").length,
      programmedAreaM2: computeProgrammedArea(state.spaces),
    },
  });

  onProgress?.("SAVING");
  await setExportStage(feedback, "SAVING");
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const file of files) zip.file(file.name, file.data);
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  const zipBlob = await zip.generateAsync({ type: "blob" });
  await download(zipBlob, filename, feedback);

  onProgress?.("COMPLETE");
  return { filesIncluded: [...files.map((f) => f.name), "manifest.json"] };
  });
};

/** Cheap readiness probe the widget can use to disable actions when no
 * canvas renderer is currently mounted (e.g. mid-navigation). */
export const isExportReady = (): boolean => hasCanvasCaptureProvider();

export const defaultProjectTitle = (): string => "ZONUERT";

export const projectFilenameSlug = (title: string): string => sanitizeFilename(title, "zonuert");
