/* V7.2 — renderer-aware export capture bridge. Whichever canvas view is
   mounted (Classic or Organism) registers one provider here; the export
   service never talks to canvas/WebGL internals directly. Only one provider
   is ever active since App.tsx mounts exactly one renderer at a time. */

export interface CaptureRequestOptions {
  scale: 1 | 2 | 4;
  includeLabels: boolean;
  includeSelection: boolean;
}

import type { Camera, SpaceCell, Theme } from "../types";
import type { LabSettings } from "../state/store";

export interface CanvasExportSnapshot {
  spaces: SpaceCell[];
  camera: Camera;
  theme: Theme;
  settings: LabSettings;
  selectedId: string | null;
  selectedIds: string[];
}

export interface CanvasExportSnapshotSource {
  spaces: SpaceCell[];
  camera: Camera;
  theme: Theme;
  settings: LabSettings;
  selectedId: string | null;
  selectedIds: string[];
}

/** Authored export truth is copied once and then passed explicitly through the
 * capture boundary. Ephemeral preview owners are deliberately not consumed. */
export const createCanvasExportSnapshot = (
  source: CanvasExportSnapshotSource,
): CanvasExportSnapshot => structuredClone({
  spaces: source.spaces,
  camera: source.camera,
  theme: source.theme,
  settings: source.settings,
  selectedId: source.selectedId,
  selectedIds: source.selectedIds,
});

export interface CaptureResult {
  /** Pixel content at the requested scale — canvas.width/height already
   * reflect cssWidth*scale / cssHeight*scale. */
  canvas: HTMLCanvasElement;
  cssWidth: number;
  cssHeight: number;
  /** Organism only — a separately captured label-layer raster to composite
   * on top of the canvas at the same scale. Undefined when labels excluded
   * or the renderer bakes labels into the canvas itself (Classic). */
  labelLayer?: HTMLCanvasElement;
}

type CaptureProvider = (
  options: CaptureRequestOptions,
  snapshot: CanvasExportSnapshot,
) => Promise<CaptureResult>;

let activeProvider: CaptureProvider | null = null;

export const registerCanvasCapture = (fn: CaptureProvider): (() => void) => {
  activeProvider = fn;
  return () => {
    if (activeProvider === fn) activeProvider = null;
  };
};

export const hasCanvasCaptureProvider = (): boolean => activeProvider !== null;

export const requestCanvasCapture = (
  options: CaptureRequestOptions,
  snapshot: CanvasExportSnapshot,
): Promise<CaptureResult> => {
  if (!activeProvider) {
    return Promise.reject(new Error("No canvas renderer is mounted to export."));
  }
  return activeProvider(options, snapshot);
};
