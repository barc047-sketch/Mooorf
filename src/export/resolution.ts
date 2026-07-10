import {
  MAX_EXPORT_DIMENSION,
  MAX_EXPORT_PIXELS,
  PADDING_PX,
  type ExportPadding,
  type ExportResolutionScale,
} from "./types";

export interface ExportDimensions {
  ok: boolean;
  width: number;
  height: number;
  error?: string;
}

/** Validates a requested export size against browser canvas limits and a
 * total-pixel safety ceiling. Never returns NaN/Infinity — non-finite or
 * non-positive inputs fail with ok:false rather than producing bad output. */
export const validateExportDimensions = (
  cssWidth: number,
  cssHeight: number,
  scale: ExportResolutionScale
): ExportDimensions => {
  if (
    !Number.isFinite(cssWidth) ||
    !Number.isFinite(cssHeight) ||
    !Number.isFinite(scale) ||
    cssWidth <= 0 ||
    cssHeight <= 0 ||
    scale <= 0
  ) {
    return { ok: false, width: 0, height: 0, error: "Invalid export dimensions." };
  }
  const width = Math.round(cssWidth * scale);
  const height = Math.round(cssHeight * scale);
  if (width > MAX_EXPORT_DIMENSION || height > MAX_EXPORT_DIMENSION) {
    return {
      ok: false,
      width,
      height,
      error: `Export exceeds the ${MAX_EXPORT_DIMENSION}px per-side limit at this resolution. Try a lower scale.`,
    };
  }
  if (width * height > MAX_EXPORT_PIXELS) {
    return {
      ok: false,
      width,
      height,
      error: "Export exceeds the safe pixel-count limit at this resolution. Try a lower scale.",
    };
  }
  return { ok: true, width, height };
};

/** Padding preset resolved to device pixels at the chosen export scale. */
export const resolvePaddingPx = (padding: ExportPadding, scale: ExportResolutionScale): number =>
  Math.round(PADDING_PX[padding] * scale);
