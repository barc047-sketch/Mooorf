import { areaToRadius } from "../lib/geometry";
import type {
  AnnotationDetail,
  Camera,
  CellShadowSettings,
  ColorSource,
  LabelColourMode,
  LabelScaleMode,
  MorphMode,
  PaletteMode,
  PerformanceQuality,
  SpaceCell,
  Theme,
} from "../types";
import { resolveLabelScale } from "../canvas/labelPresentation";
import { resolveLabelContrast } from "../design/labelContrast";
import { resolveCellShadowGated } from "../canvas/cellShadow";
import type { ProjectPresentationDefaults } from "../domain/presentation/types";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import { textStylePreset } from "../domain/presentation/editing";
import { projectCircleLayers, projectRuntimePresentation } from "../canvas/presentationLayers";
import type { ResourceSettings } from "../resources/types";
import { DEFAULT_RESOURCE_SETTINGS } from "../resources/resourcePersistence";
import { iconRegistry } from "../icons/iconRegistry";
import { resolveSymbolTint, symbolSvgMarkup } from "../icons/iconDrawing";

const FONT =
  '"Inter Tight","Neue Haas Grotesk Display Pro","Helvetica Neue",Helvetica,Arial,sans-serif';

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const wrapSvgBody = (body: string, maxWidth: number, fontSize: number, maxLines: number): string[] => {
  const words = body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const maxCharacters = Math.max(4, Math.floor(maxWidth / Math.max(1, fontSize * 0.54)));
  const lines: string[] = [];
  for (const word of words) {
    const candidate = lines.length ? `${lines[lines.length - 1]} ${word}` : word;
    if (candidate.length <= maxCharacters || !lines.length) {
      if (!lines.length) lines.push(candidate);
      else lines[lines.length - 1] = candidate;
    } else if (lines.length < maxLines) {
      lines.push(word);
    } else {
      lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, Math.max(1, maxCharacters - 1)).trimEnd()}…`;
      break;
    }
  }
  return lines.slice(0, maxLines);
};

export interface ClassicSvgOptions {
  spaces: readonly SpaceCell[];
  camera: Camera;
  cssWidth: number;
  cssHeight: number;
  paletteMode: PaletteMode;
  nucleusPaletteId: string;
  organismPaletteId?: string;
  morphMode?: MorphMode;
  presentationDefaults?: ProjectPresentationDefaults;
  colorSource?: ColorSource;
  labelScaleMode?: LabelScaleMode;
  labelColourMode?: LabelColourMode;
  labelCustomColour?: string;
  annotationDetail?: AnnotationDetail;
  cellShadow?: CellShadowSettings;
  performanceQuality?: PerformanceQuality;
  resources?: ResourceSettings;
  theme?: Theme;
  /** Resolved background color, or null for a transparent SVG. */
  background: string | null;
  includeLabels: boolean;
  paddingPx: number;
  /** Screen-space geometry supplied by a detached renderer that has already
   * resolved authored Organism transforms. Omit for unchanged Classic SVG. */
  resolvedGeometryById?: ReadonlyMap<string, ResolvedCircleGeometry>;
}

export interface ResolvedCircleGeometry {
  screenX: number;
  screenY: number;
  screenRadius: number;
}

/** True-vector Classic export: nuclei circles + label text mirror
 * src/canvas/renderer.ts's drawScene geometry exactly (same toX/toY/radius
 * math, same color resolver). The blob/membrane merge layer is intentionally
 * omitted — it is built from a Path2D contour+spline pipeline that is not
 * practically re-emittable as SVG path data in this phase, so leaving it out
 * keeps this a truthful vector export rather than silently rasterizing it.
 * See docs/DECISIONS.md V7.2 SVG truthfulness note. */
export const buildClassicSvg = (options: ClassicSvgOptions): string => {
  const { spaces, camera, cssWidth, cssHeight, paletteMode, nucleusPaletteId, organismPaletteId = "mode", morphMode = "cellular-reverse", presentationDefaults = createProjectPresentationDefaults(), colorSource = "category", labelScaleMode = "screen", annotationDetail, cellShadow, performanceQuality = "automatic", resources = DEFAULT_RESOURCE_SETTINGS, theme = "day", background, includeLabels, paddingPx, resolvedGeometryById } =
    options;
  const w = Math.max(1, Math.round(cssWidth));
  const h = Math.max(1, Math.round(cssHeight));
  const pad = Math.max(0, Math.round(paddingPx));
  const totalW = w + pad * 2;
  const totalH = h + pad * 2;
  const z = camera.zoom || 1;
  const toX = (x: number) => (x - camera.x) * z + w / 2 + pad;
  const toY = (y: number) => (y - camera.y) * z + h / 2 + pad;
  const presentation = projectRuntimePresentation(spaces, {
    presentationDefaults,
    paletteMode,
    colorSource,
    nucleusPaletteId,
    organismPaletteId,
    morphMode,
  }, theme);

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`
  );
  if (background) {
    parts.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${background}" />`);
  }
  const resolvedShadow = resolveCellShadowGated(cellShadow, performanceQuality, theme);
  if (resolvedShadow.enabled && resolvedShadow.includeInExport) {
    parts.push(`<defs><filter id="cell-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${resolvedShadow.offsetX}" dy="${resolvedShadow.offsetY}" stdDeviation="${resolvedShadow.softness / 2}" flood-color="${resolvedShadow.color}" flood-opacity="${resolvedShadow.opacity}" /></filter></defs>`);
  }

  for (const cell of spaces) {
    const resolvedGeometry = resolvedGeometryById?.get(cell.id);
    const hasResolvedGeometry = resolvedGeometry
      && Number.isFinite(resolvedGeometry.screenX)
      && Number.isFinite(resolvedGeometry.screenY)
      && Number.isFinite(resolvedGeometry.screenRadius);
    const r = hasResolvedGeometry ? resolvedGeometry.screenRadius : areaToRadius(cell.area) * z;
    if (!Number.isFinite(r) || r <= 0) continue;
    const cx = hasResolvedGeometry ? resolvedGeometry.screenX + pad : toX(cell.x);
    const cy = hasResolvedGeometry ? resolvedGeometry.screenY + pad : toY(cell.y);
    const appearance = presentation.byId.get(cell.id);
    if (!appearance) continue;
    const layers = projectCircleLayers(cell, appearance, r, z, "classic");
    const isVoid = cell.kind === "void";

    if (layers.void) {
      const layer = layers.void;
      if (layer.fillVisible) parts.push(`<circle cx="${cx}" cy="${cy}" r="${layer.radiusPx}" fill="${layer.fillColour}" fill-opacity="${layer.fillOpacity}" />`);
      if (layer.edgeVisible) {
        for (const stroke of layer.strokes) {
          parts.push(`<circle cx="${cx}" cy="${cy}" r="${stroke.radiusPx}" fill="none" stroke="${stroke.colour}" stroke-opacity="${stroke.opacity}" stroke-width="${stroke.widthPx}" stroke-dasharray="${stroke.lineDashPx.join(" ")}" stroke-linecap="${stroke.lineCap}" data-void-edge-style="${stroke.renderedStyle}" />`);
        }
      }
    } else {
      if (layers.cell) parts.push(`<circle cx="${cx}" cy="${cy}" r="${layers.cell.radiusPx}" fill="${layers.cell.colour}" fill-opacity="${layers.cell.opacity}"${resolvedShadow.enabled && resolvedShadow.includeInExport ? ' filter="url(#cell-shadow)"' : ""} />`);
      if (layers.boundary) {
        for (const stroke of layers.boundary.strokes) {
          parts.push(`<circle cx="${cx}" cy="${cy}" r="${stroke.radiusPx}" fill="none" stroke="${stroke.colour}" stroke-opacity="${stroke.opacity}" stroke-width="${stroke.widthPx}" stroke-dasharray="${stroke.lineDashPx.join(" ")}" stroke-linecap="${stroke.lineCap}" data-boundary-style="${stroke.renderedStyle}" />`);
        }
      }
      if (layers.core) parts.push(`<circle cx="${cx + (layers.core.offsetXPx ?? 0)}" cy="${cy + (layers.core.offsetYPx ?? 0)}" r="${layers.core.radiusPx}" fill="${layers.core.colour}" fill-opacity="${layers.core.opacity}" />`);
    }

    const placement = resources.iconPlacements.find((item) => item.targetSpaceId === cell.id);
    const definition = placement ? iconRegistry.get(placement.iconId) : null;
    if (placement && definition) parts.push(symbolSvgMarkup(definition, placement, {
      x: cx,
      y: cy,
      radius: r,
      zoom: z,
      tint: resolveSymbolTint(placement, {
        theme,
        backgroundColor: isVoid ? appearance.void.fill.colour : appearance.cell.paint.colour,
        surfaceOpacity: isVoid ? appearance.void.fill.opacity : appearance.cell.paint.opacity,
        canvasColor: background ?? (theme === "night" ? "#070707" : "#f5f6ee"),
        voidBackground: isVoid,
      }),
    }));

    if (includeLabels) {
      const text = appearance.text;
      const preset = textStylePreset(text.preset);
      const backgroundColor = isVoid ? appearance.void.fill.colour : appearance.cell.paint.colour;
      const contrast = resolveLabelContrast({ mode: text.colourMode === "custom" ? "custom" : "auto", customColor: text.colour, backgroundColor, voidBackground: isVoid, theme });
      const scale = resolveLabelScale(labelScaleMode, z, 1) * text.size;
      const nameSize = 11 * scale * preset.heading.scale;
      const areaSize = Math.max(7, 11 * scale * preset.area.scale);
      const bodySize = Math.max(7, 11 * scale * preset.body.scale);
      const nameFill = contrast.color;
      const metaFill = contrast.color;
      const maxWidth = Math.max(56, r * 1.62);
      const anchor = preset.align === "left" ? "start" : "middle";
      const x = preset.align === "left" ? cx - maxWidth / 2 : cx;
      const bodyLines = wrapSvgBody(cell.body ?? "", maxWidth, bodySize, 3);
      const rows = (annotationDetail?.showName === false ? 0 : 1) + (annotationDetail?.showArea === false ? 0 : 1) + bodyLines.length;
      let y = cy - Math.min(r * 0.42, Math.max(0, rows - 1) * bodySize * 0.5);
      if (annotationDetail?.showName !== false) {
        parts.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family='${FONT}' font-size="${nameSize}" font-weight="${preset.heading.weight}" letter-spacing="${preset.heading.tracking}em" fill="${nameFill}">${escapeXml(cell.name)}</text>`);
        y += nameSize * 0.9;
      }
      if (annotationDetail?.showArea !== false) {
        parts.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family='${FONT}' font-size="${areaSize}" font-weight="${preset.area.weight}" letter-spacing="${preset.area.tracking}em" fill="${metaFill}" fill-opacity="0.72">${escapeXml(`${cell.area} m²`)}</text>`);
        y += areaSize * 1.15;
      }
      for (const line of bodyLines) {
        parts.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family='${FONT}' font-size="${bodySize}" font-weight="${preset.body.weight}" letter-spacing="${preset.body.tracking}em" fill="${metaFill}" fill-opacity="0.76">${escapeXml(line)}</text>`);
        y += bodySize * preset.body.lineHeight;
      }
    }
  }

  parts.push("</svg>");
  return parts.join("");
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
