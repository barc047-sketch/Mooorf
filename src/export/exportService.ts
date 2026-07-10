import { useLab } from "../state/store";
import { hasCanvasCaptureProvider } from "../canvas/exportCapture";
import { captureAndComposite } from "./canvasComposite";
import { spacesToCsv } from "./csv";
import { buildProjectSnapshot, computeProgrammedArea, type ProjectExportSettings } from "./projectSnapshot";
import { buildManifest } from "./manifest";
import { buildPresentationPdf } from "./pdfExport";
import { buildClassicSvg, organismSvgAvailability } from "./svgExport";
import {
  buildCanvasFilename,
  buildDataFilename,
  buildPackFilename,
  buildPresentationFilename,
  sanitizeFilename,
} from "./filenames";
import type { ExportPresentationOptions, ExportVisualOptions } from "./types";

export type PackProgressStage =
  | "Capturing canvas"
  | "Building PDF"
  | "Writing data"
  | "Compressing pack"
  | "Complete";

const currentSettingsForSnapshot = (): ProjectExportSettings => {
  const s = useLab.getState().settings;
  return {
    rendererMode: s.rendererMode,
    morphMode: s.morphMode,
    attachMode: s.attachMode,
    mergeDistance: s.mergeDistance,
    blobOn: s.blobOn,
    paletteMode: s.paletteMode,
    layoutPreset: s.layoutPreset,
    annotationMode: s.annotationMode,
    selectionDisplay: s.selectionDisplay,
    annotationDetail: { ...s.annotationDetail },
    showGrid: s.showGrid,
    nucleusPaletteId: s.nucleusPaletteId,
    organismPaletteId: s.organismPaletteId,
    organism: { ...s.organism },
    uiScale: s.uiScale,
    widgetScale: s.widgetScale,
  };
};

const download = async (blob: Blob, filename: string) => {
  const { saveAs } = await import("file-saver");
  saveAs(blob, filename);
};

export const exportPng = async (project: string, visual: ExportVisualOptions): Promise<void> => {
  const composite = await captureAndComposite(visual);
  const renderer = useLab.getState().settings.rendererMode;
  const blob: Blob | null = await new Promise((resolve) => composite.canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not encode the canvas as PNG.");
  await download(blob, buildCanvasFilename(project, renderer, "png"));
};

export const exportSvg = async (project: string): Promise<void> => {
  const state = useLab.getState();
  if (state.settings.rendererMode !== "classic") {
    throw new Error(organismSvgAvailability().reason);
  }
  const host = document.querySelector<HTMLElement>(".canvas-host");
  const cssWidth = host?.clientWidth ?? window.innerWidth;
  const cssHeight = host?.clientHeight ?? window.innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const svg = buildClassicSvg({
    spaces: state.spaces,
    camera: state.camera,
    cssWidth,
    cssHeight,
    paletteMode: state.settings.paletteMode,
    background: (cs.getPropertyValue("--bg").trim() || "#ffffff"),
    includeLabels: true,
    selectedId: state.selectedId,
    paddingPx: 0,
  });
  const blob = new Blob([svg], { type: "image/svg+xml" });
  await download(blob, buildCanvasFilename(project, "classic", "svg"));
};

export const exportCsv = async (project: string): Promise<void> => {
  const csv = spacesToCsv(useLab.getState().spaces);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  await download(blob, buildDataFilename(project, "csv"));
};

export const exportJson = async (project: string): Promise<void> => {
  const state = useLab.getState();
  const snapshot = buildProjectSnapshot(
    { spaces: state.spaces, camera: state.camera, theme: state.theme, settings: currentSettingsForSnapshot() },
    project
  );
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  await download(blob, buildDataFilename(project, "json"));
};

export const exportPdf = async (
  project: string,
  visual: ExportVisualOptions,
  presentation: ExportPresentationOptions
): Promise<void> => {
  const composite = await captureAndComposite(visual);
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
  await download(blob, buildPresentationFilename(project, presentation.page));
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
  onProgress?.("Capturing canvas");
  const composite = await captureAndComposite(visual);
  const state = useLab.getState();
  const pngBlob: Blob | null = await new Promise((resolve) => composite.canvas.toBlob(resolve, "image/png"));
  if (!pngBlob) throw new Error("Could not encode the canvas as PNG.");

  onProgress?.("Building PDF");
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

  onProgress?.("Writing data");
  const csv = spacesToCsv(state.spaces);
  const snapshot = buildProjectSnapshot(
    { spaces: state.spaces, camera: state.camera, theme: state.theme, settings: currentSettingsForSnapshot() },
    project
  );
  const jsonText = JSON.stringify(snapshot, null, 2);

  const files: Array<{ name: string; data: Blob | string }> = [];
  if (pngBlob.size > 0) files.push({ name: "canvas.png", data: pngBlob });
  if (pdfBytes.byteLength > 0) files.push({ name: "presentation.pdf", data: new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }) });
  if (csv.trim().length > 0) files.push({ name: "spaces.csv", data: csv });
  if (jsonText.length > 0) files.push({ name: "project.json", data: jsonText });

  const manifest = buildManifest({
    project,
    files: files.map((f) => f.name),
    renderer: state.settings.rendererMode,
    dimensions: { width: composite.width, height: composite.height },
    visual,
    summary: {
      spaceCount: state.spaces.length,
      voidCount: state.spaces.filter((s) => s.kind === "void").length,
      programmedAreaM2: computeProgrammedArea(state.spaces),
    },
  });

  onProgress?.("Compressing pack");
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const file of files) zip.file(file.name, file.data);
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  const zipBlob = await zip.generateAsync({ type: "blob" });
  await download(zipBlob, buildPackFilename(project));

  onProgress?.("Complete");
  return { filesIncluded: [...files.map((f) => f.name), "manifest.json"] };
};

/** Cheap readiness probe the widget can use to disable actions when no
 * canvas renderer is currently mounted (e.g. mid-navigation). */
export const isExportReady = (): boolean => hasCanvasCaptureProvider();

export const defaultProjectTitle = (): string => "ZONUERT";

export const projectFilenameSlug = (title: string): string => sanitizeFilename(title, "zonuert");
