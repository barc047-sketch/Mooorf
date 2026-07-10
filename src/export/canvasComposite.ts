import { requestCanvasCapture, type CaptureRequestOptions } from "../canvas/exportCapture";
import { resolvePaddingPx, validateExportDimensions } from "./resolution";
import type { ExportBackground, ExportVisualOptions } from "./types";

const resolveBackgroundColor = (background: ExportBackground): string | null => {
  if (background === "transparent") return null;
  if (background === "white") return "#ffffff";
  const cs = getComputedStyle(document.documentElement);
  const bg = cs.getPropertyValue("--bg").trim();
  return bg || "#ffffff";
};

export interface CompositeResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

/** Requests a renderer-aware capture, then composites it with the chosen
 * background/padding into one flattened output canvas — the only place PNG
 * background/padding rules live, independent of which renderer supplied the
 * source pixels. */
export const captureAndComposite = async (
  visual: ExportVisualOptions
): Promise<CompositeResult> => {
  const requestOptions: CaptureRequestOptions = {
    scale: visual.resolution,
    includeLabels: visual.labels === "include",
    includeSelection: visual.selection === "include",
  };
  const capture = await requestCanvasCapture(requestOptions);
  const dims = validateExportDimensions(capture.cssWidth, capture.cssHeight, visual.resolution);
  if (!dims.ok) {
    throw new Error(dims.error ?? "Export dimensions are invalid.");
  }

  const paddingPx = resolvePaddingPx(visual.padding, visual.resolution);
  const outW = dims.width + paddingPx * 2;
  const outH = dims.height + paddingPx * 2;
  const finalDims = validateExportDimensions(outW, outH, 1);
  if (!finalDims.ok) {
    throw new Error(finalDims.error ?? "Padded export dimensions are invalid.");
  }

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Could not create the export composite surface.");

  const bg = resolveBackgroundColor(visual.background);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, outW, outH);
  }

  ctx.drawImage(capture.canvas, paddingPx, paddingPx, dims.width, dims.height);
  if (capture.labelLayer) {
    ctx.drawImage(capture.labelLayer, paddingPx, paddingPx, dims.width, dims.height);
  }

  return { canvas: out, width: outW, height: outH };
};
