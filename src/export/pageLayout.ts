import type { ExportOrientation, ExportPageSize } from "./types";

/** ISO 216 page sizes in PDF points (1pt = 1/72in), portrait orientation. */
const PAGE_SIZES_PT: Record<ExportPageSize, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  a3: { width: 841.89, height: 1190.55 },
};

export interface PageSize {
  width: number;
  height: number;
}

/** Portrait base size rotated to landscape when requested. Never distorts —
 * width/height are simply swapped, not scaled independently. */
export const resolvePageSize = (
  page: ExportPageSize,
  orientation: ExportOrientation
): PageSize => {
  const base = PAGE_SIZES_PT[page] ?? PAGE_SIZES_PT.a4;
  return orientation === "landscape"
    ? { width: base.height, height: base.width }
    : { width: base.width, height: base.height };
};

export interface FittedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Aspect-preserving fit of (contentW × contentH) centered inside a box —
 * never distorts, never exceeds the box. Returns a degenerate zero rect
 * (never NaN/Infinity) for non-finite or non-positive inputs. */
export const fitRect = (
  contentW: number,
  contentH: number,
  boxW: number,
  boxH: number
): FittedRect => {
  const safe = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);
  const cw = safe(contentW);
  const ch = safe(contentH);
  const bw = safe(boxW);
  const bh = safe(boxH);
  if (cw === 0 || ch === 0 || bw === 0 || bh === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const scale = Math.min(bw / cw, bh / ch);
  const width = cw * scale;
  const height = ch * scale;
  return {
    x: (bw - width) / 2,
    y: (bh - height) / 2,
    width,
    height,
  };
};
