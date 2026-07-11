import { areaToRadius } from "../lib/geometry";
import { getAreaRange, getNucleusColor } from "../design/colorMapping";
import type { Camera, PaletteMode, SpaceCell } from "../types";

const FONT =
  '"Inter Tight","Neue Haas Grotesk Display Pro","Helvetica Neue",Helvetica,Arial,sans-serif';

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export interface ClassicSvgOptions {
  spaces: readonly SpaceCell[];
  camera: Camera;
  cssWidth: number;
  cssHeight: number;
  paletteMode: PaletteMode;
  nucleusPaletteId: string;
  /** Resolved background color, or null for a transparent SVG. */
  background: string | null;
  includeLabels: boolean;
  paddingPx: number;
}

/** True-vector Classic export: nuclei circles + label text mirror
 * src/canvas/renderer.ts's drawScene geometry exactly (same toX/toY/radius
 * math, same color resolver). The blob/membrane merge layer is intentionally
 * omitted — it is built from a Path2D contour+spline pipeline that is not
 * practically re-emittable as SVG path data in this phase, so leaving it out
 * keeps this a truthful vector export rather than silently rasterizing it.
 * See docs/DECISIONS.md V7.2 SVG truthfulness note. */
export const buildClassicSvg = (options: ClassicSvgOptions): string => {
  const { spaces, camera, cssWidth, cssHeight, paletteMode, nucleusPaletteId, background, includeLabels, paddingPx } =
    options;
  const w = Math.max(1, Math.round(cssWidth));
  const h = Math.max(1, Math.round(cssHeight));
  const pad = Math.max(0, Math.round(paddingPx));
  const totalW = w + pad * 2;
  const totalH = h + pad * 2;
  const z = camera.zoom || 1;
  const toX = (x: number) => (x - camera.x) * z + w / 2 + pad;
  const toY = (y: number) => (y - camera.y) * z + h / 2 + pad;
  const areaRange = getAreaRange(spaces);

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`
  );
  if (background) {
    parts.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${background}" />`);
  }

  for (const cell of spaces) {
    const r = areaToRadius(cell.area) * z;
    if (!Number.isFinite(r) || r <= 0) continue;
    const cx = toX(cell.x);
    const cy = toY(cell.y);
    const color = getNucleusColor(cell, paletteMode, areaRange, nucleusPaletteId);
    const isVoid = cell.kind === "void";

    if (isVoid) {
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(0,0,0,0.035)" stroke="${color.ring}" stroke-width="${Math.max(1.2, 1.5 * z)}" stroke-dasharray="${5 * z},${5 * z}" />`
      );
    } else {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color.fill}" />`);
    }

    if (includeLabels && r > 26) {
      const dark = /^#/.test(color.fill) ? luminanceOf(color.fill) < 140 : false;
      const nameSize = Math.min(15, Math.max(10, r * 0.22));
      const nameFill = dark ? "rgba(255,255,255,0.92)" : "rgba(20,20,20,0.82)";
      const metaFill = dark ? "rgba(255,255,255,0.55)" : "rgba(20,20,20,0.45)";
      parts.push(
        `<text x="${cx}" y="${cy - nameSize * 0.35}" text-anchor="middle" dominant-baseline="middle" font-family='${FONT}' font-size="${nameSize}" font-weight="500" fill="${nameFill}">${escapeXml(cell.name)}</text>`
      );
      parts.push(
        `<text x="${cx}" y="${cy + nameSize * 0.78}" text-anchor="middle" dominant-baseline="middle" font-family='${FONT}' font-size="${Math.max(9, nameSize * 0.72)}" fill="${metaFill}">${escapeXml(`${cell.area} m²`)}</text>`
      );
    }
  }

  parts.push("</svg>");
  return parts.join("");
};

const luminanceOf = (hex: string): number => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 255;
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
};

export interface OrganismSvgAvailability {
  available: false;
  reason: string;
}

/** Organism mode has no reusable true-vector membrane path (WebGL implicit
 * field), so SVG is truthfully reported as unavailable rather than faking a
 * vector export from a raster capture. */
export const organismSvgAvailability = (): OrganismSvgAvailability => ({
  available: false,
  reason:
    "SVG export isn't available in Organism mode — the membrane is a WebGL implicit field with no true vector path. Switch to Classic for true-vector SVG, or use PNG/PDF for Organism.",
});
