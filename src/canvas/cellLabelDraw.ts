import type { LabelScaleMode, SpaceCell, Theme } from "../types";
import type { ProjectPresentationDefaults } from "../domain/presentation/types";
import {
  LABEL_FONT_FAMILY_CSS,
  mergeCellLabelConfig,
  type FlagDirection,
} from "../domain/labels/layoutContract";
import {
  resolveCellLabelLayout,
  resolveLabelRuntimeScale,
  selectRuntimeLabelLayout,
  cellLabelContentSource,
  type ResolvedCellLabelLayout,
  type ResolvedLabelBlock,
  type ResolvedLabelFont,
  type ResolvedLabelSegment,
  type RuntimeLabelSelection,
} from "../domain/labels/resolveLayout";
import { resolveLabelContrast } from "../design/labelContrast";

/* Canvas2D adapter for the shared Cell Label Layout projection. Pure module —
   no React, no store and no renderer-specific preset truth. Organism detached
   exports and the compile-only Classic path consume this same projection. */

export interface CellLabelLayoutOptions {
  globalScaleMode: LabelScaleMode;
  textSize: number;
  showName: boolean;
  showArea: boolean;
  showMetadata: boolean;
  hasSymbol: boolean;
  flagAutoDirection: Exclude<FlagDirection, "auto">;
}

interface LayoutCacheEntry extends CellLabelLayoutOptions {
  defaults: ProjectPresentationDefaults;
  resolved: ResolvedCellLabelLayout;
}

const layoutCache = new WeakMap<SpaceCell, LayoutCacheEntry>();

const sameOptions = (entry: LayoutCacheEntry, options: CellLabelLayoutOptions): boolean =>
  entry.globalScaleMode === options.globalScaleMode
  && entry.textSize === options.textSize
  && entry.showName === options.showName
  && entry.showArea === options.showArea
  && entry.showMetadata === options.showMetadata
  && entry.hasSymbol === options.hasSymbol
  && entry.flagAutoDirection === options.flagAutoDirection;

/** Cached per immutable SpaceCell object; content or style commits create new
 * objects and refresh the entry automatically. Zoom never touches it. */
export const getCellLabelLayout = (
  space: SpaceCell,
  defaults: ProjectPresentationDefaults,
  options: CellLabelLayoutOptions
): ResolvedCellLabelLayout => {
  const cached = layoutCache.get(space);
  if (cached && cached.defaults === defaults && sameOptions(cached, options)) return cached.resolved;
  const resolved = resolveCellLabelLayout({
    space: cellLabelContentSource(space),
    config: mergeCellLabelConfig(defaults.text.labels, space.appearance?.text?.labels),
    globalScaleMode: options.globalScaleMode,
    textSize: options.textSize,
    legacyVisibility: {
      showName: options.showName,
      showArea: options.showArea,
      showMetadata: options.showMetadata,
    },
    hasSymbol: options.hasSymbol,
    flagAutoDirection: options.flagAutoDirection,
  });
  layoutCache.set(space, { ...options, defaults, resolved });
  return resolved;
};

/* ------------------------------------------------------------------ */
/* Bounded measurement caches (content/style/width keys; LRU eviction) */

const MEASURE_CACHE_LIMIT = 800;
const lineCache = new Map<string, string[]>();
const glyphCache = new Map<string, number[]>();

const remember = <T>(cache: Map<string, T>, key: string, compute: () => T): T => {
  const existing = cache.get(key);
  if (existing !== undefined) {
    cache.delete(key);
    cache.set(key, existing);
    return existing;
  }
  const value = compute();
  cache.set(key, value);
  if (cache.size > MEASURE_CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return value;
};

export const cellLabelCacheSizes = () => ({ lines: lineCache.size, glyphs: glyphCache.size });

const fontCss = (font: ResolvedLabelFont): string =>
  `${font.italic ? "italic " : ""}${font.weight} ${Math.round(font.sizeWorld * 10) / 10}px ${LABEL_FONT_FAMILY_CSS[font.family]}`;

const bucket = (value: number, step = 8): number => Math.round(value / step) * step;

const ellipsize = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped && ctx.measureText(`${clipped}…`).width > maxWidth) clipped = clipped.slice(0, -1);
  return `${clipped.trimEnd()}…`;
};

const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number,
  maxLines: number,
  overflow: "wrap" | "truncate"
): string[] => {
  if (!Number.isFinite(maxWidth)) return [text];
  const key = `${overflow}|${maxLines}|${bucket(maxWidth)}|${font}|${text}`;
  return remember(lineCache, key, () => {
    ctx.font = font;
    if (overflow === "truncate" || maxLines <= 1) return [ellipsize(ctx, text, maxWidth)];
    const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    const lines: string[] = [];
    for (const word of words) {
      const candidate = lines.length ? `${lines[lines.length - 1]} ${word}` : word;
      if (!lines.length) {
        lines.push(candidate);
      } else if (ctx.measureText(candidate).width <= maxWidth) {
        lines[lines.length - 1] = candidate;
      } else if (lines.length < maxLines) {
        lines.push(word);
      } else {
        lines[maxLines - 1] = ellipsize(ctx, `${lines[maxLines - 1]} ${word}`, maxWidth);
        return lines;
      }
    }
    return lines.slice(0, maxLines);
  });
};

const glyphWidths = (ctx: CanvasRenderingContext2D, text: string, font: string): number[] => {
  const key = `${font}|${text}`;
  return remember(glyphCache, key, () => {
    ctx.font = font;
    return [...text].map((glyph) => ctx.measureText(glyph).width);
  });
};

let measureCtx: CanvasRenderingContext2D | null = null;
const sharedMeasureCtx = (): CanvasRenderingContext2D | null => {
  if (measureCtx) return measureCtx;
  if (typeof document === "undefined") return null;
  measureCtx = document.createElement("canvas").getContext("2d");
  return measureCtx;
};

export interface RingGlyphPlacement {
  glyph: string;
  /** Centred cumulative arc position in world px; multiply by the runtime
   * degrees-per-world-px factor to obtain the glyph angle. */
  arcWorld: number;
}

/** World-unit ring glyph layout shared by the Organism DOM ring and tests. */
export const ringGlyphLayout = (
  text: string,
  font: ResolvedLabelFont,
  spacingEm: number
): RingGlyphPlacement[] => {
  const ctx = sharedMeasureCtx();
  const glyphs = [...text];
  const fallbackWidth = font.sizeWorld * 0.6;
  const widths = ctx ? glyphWidths(ctx, text, fontCss(font)) : glyphs.map(() => fallbackWidth);
  const tracking = (font.letterSpacingEm + spacingEm) * font.sizeWorld;
  const total = widths.reduce((sum, width) => sum + width + tracking, -tracking);
  let cursor = -total / 2;
  return glyphs.map((glyph, index) => {
    const width = widths[index] ?? fallbackWidth;
    const placement = { glyph, arcWorld: cursor + width / 2 };
    cursor += width + tracking;
    return placement;
  });
};

/* --------------------------------- */
/* Drawing                           */

export interface CellLabelDrawContext {
  sx: number;
  sy: number;
  screenRadius: number;
  zoom: number;
  theme: Theme;
  /** Resolved fill behind the label used for Auto Contrast. */
  backgroundColor: string;
  voidBackground: boolean;
  /** Existing text-channel colour route; roles left on Auto keep obeying it. */
  legacyColour: { mode: "auto" | "custom"; colour: string };
  textShadow: boolean;
  /** Canvas surface colour used for panels sitting outside the Cell. */
  surfaceColor: string;
  hairlineColor: string;
}

const blockContrast = (block: Pick<ResolvedLabelBlock, "colourMode" | "colour">, draw: CellLabelDrawContext) =>
  resolveLabelContrast({
    mode: block.colourMode === "auto" ? draw.legacyColour.mode : block.colourMode,
    customColor: block.colourMode === "custom" ? block.colour : draw.legacyColour.colour,
    backgroundColor: draw.backgroundColor,
    voidBackground: draw.voidBackground,
    theme: draw.theme,
  });

const segmentBaselineDraw = (
  ctx: CanvasRenderingContext2D,
  segments: readonly ResolvedLabelSegment[],
  startX: number,
  baselineY: number,
  shadow: boolean,
  keyline: string
): void => {
  let cursor = startX;
  for (const [index, segment] of segments.entries()) {
    ctx.font = fontCss(segment.font);
    const gap = index === 0 ? 0 : segment.font.sizeWorld * 0.28;
    cursor += gap;
    const previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha = previousAlpha * segment.opacity;
    if (shadow) {
      ctx.strokeStyle = `${keyline}55`;
      ctx.strokeText(segment.text, cursor, baselineY);
    }
    ctx.fillText(segment.text, cursor, baselineY);
    cursor += ctx.measureText(segment.text).width;
    ctx.globalAlpha = previousAlpha;
  }
};

const segmentsWidth = (ctx: CanvasRenderingContext2D, segments: readonly ResolvedLabelSegment[]): number =>
  segments.reduce((sum, segment, index) => {
    ctx.font = fontCss(segment.font);
    return sum + ctx.measureText(segment.text).width + (index === 0 ? 0 : segment.font.sizeWorld * 0.28);
  }, 0);

interface BlockBox {
  /** Box centre in the pre-scale (world-unit) space. */
  x: number;
  y: number;
  widthWorld: number;
}

const drawJustifiedLine = (
  ctx: CanvasRenderingContext2D,
  line: string,
  leftX: number,
  baselineY: number,
  width: number,
  shadow: boolean,
  keyline: string
): void => {
  const words = line.split(" ").filter(Boolean);
  const wordsWidth = words.reduce((sum, word) => sum + ctx.measureText(word).width, 0);
  const gaps = words.length - 1;
  if (gaps < 1 || wordsWidth >= width) {
    if (shadow) ctx.strokeText(line, leftX, baselineY);
    ctx.fillText(line, leftX, baselineY);
    return;
  }
  const gap = (width - wordsWidth) / gaps;
  let cursor = leftX;
  for (const word of words) {
    if (shadow) {
      ctx.strokeStyle = `${keyline}55`;
      ctx.strokeText(word, cursor, baselineY);
    }
    ctx.fillText(word, cursor, baselineY);
    cursor += ctx.measureText(word).width + gap;
  }
};

/** Draws one block inside a world-unit coordinate frame already translated to
 * the block anchor and scaled by the block's resolved label scale. */
const drawBlockContent = (
  ctx: CanvasRenderingContext2D,
  block: ResolvedLabelBlock,
  box: BlockBox,
  draw: CellLabelDrawContext
): void => {
  const contrast = blockContrast(block, draw);
  ctx.fillStyle = contrast.color;
  ctx.lineJoin = "round";
  ctx.lineWidth = 0.85;
  ctx.strokeStyle = `${contrast.keyline}55`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const previousAlpha = ctx.globalAlpha;
  ctx.globalAlpha = previousAlpha * block.opacity;

  const primary = block.segments[0];
  const lineHeight = primary.font.sizeWorld * primary.font.lineHeight;
  const applyTracking = "letterSpacing" in ctx;
  if (applyTracking) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${(primary.font.letterSpacingEm * primary.font.sizeWorld).toFixed(2)}px`;
  }

  if (block.segments.length > 1) {
    const width = segmentsWidth(ctx, block.segments);
    const boxWidth = Number.isFinite(box.widthWorld) ? box.widthWorld : width;
    const startX = block.align === "left"
      ? box.x - boxWidth / 2
      : block.align === "right"
        ? box.x + boxWidth / 2 - width
        : box.x - width / 2;
    segmentBaselineDraw(ctx, block.segments, startX, box.y + primary.font.sizeWorld * 0.36, draw.textShadow, contrast.keyline);
  } else {
    const font = fontCss(primary.font);
    const lines = wrapLines(ctx, primary.text, font, box.widthWorld, block.maxLines, block.overflow);
    ctx.font = font;
    const totalHeight = lineHeight * lines.length;
    let baseline = box.y - totalHeight / 2 + primary.font.sizeWorld * 0.86;
    for (const [index, line] of lines.entries()) {
      if (block.align === "justify" && Number.isFinite(box.widthWorld) && index < lines.length - 1) {
        drawJustifiedLine(ctx, line, box.x - box.widthWorld / 2, baseline, box.widthWorld, draw.textShadow, contrast.keyline);
      } else {
        const width = ctx.measureText(line).width;
        const boxWidth = Number.isFinite(box.widthWorld) ? box.widthWorld : width;
        const x = block.align === "left" || block.align === "justify"
          ? box.x - boxWidth / 2
          : block.align === "right"
            ? box.x + boxWidth / 2 - width
            : box.x - width / 2;
        if (draw.textShadow) {
          ctx.strokeStyle = `${contrast.keyline}55`;
          ctx.strokeText(line, x, baseline);
        }
        ctx.fillText(line, x, baseline);
      }
      baseline += lineHeight;
    }
  }

  if (applyTracking) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  }
  ctx.globalAlpha = previousAlpha;
};

const drawBlock = (
  ctx: CanvasRenderingContext2D,
  block: ResolvedLabelBlock,
  draw: CellLabelDrawContext,
  fitScale = 1
): void => {
  const scale = resolveLabelRuntimeScale(block.scaleMode, draw.zoom) * fitScale;
  if (scale <= 0) return;
  const anchorX = draw.sx + block.anchorUnit.x * draw.screenRadius + block.offsetWorld.x * scale;
  const anchorY = draw.sy + block.anchorUnit.y * draw.screenRadius + block.offsetWorld.y * scale;
  const widthWorld = block.maxWidthRatio > 0
    ? Math.max(52, (block.maxWidthRatio * 2 * draw.screenRadius) / scale)
    : Number.POSITIVE_INFINITY;
  ctx.save();
  ctx.translate(anchorX, anchorY);
  if (block.rotationDeg) ctx.rotate((block.rotationDeg * Math.PI) / 180);
  ctx.scale(scale, scale);
  drawBlockContent(ctx, block, { x: 0, y: 0, widthWorld }, draw);
  ctx.restore();
};

const drawRing = (
  ctx: CanvasRenderingContext2D,
  ring: NonNullable<ResolvedCellLabelLayout["ring"]>,
  draw: CellLabelDrawContext
): void => {
  const scale = resolveLabelRuntimeScale(ring.scaleMode, draw.zoom);
  if (scale <= 0 || !ring.text) return;
  const radius = ring.radiusRatio * draw.screenRadius;
  if (radius <= 4) return;
  const font = fontCss(ring.font);
  const widths = glyphWidths(ctx, ring.text, font);
  const glyphSize = ring.font.sizeWorld * scale;
  const tracking = (ring.font.letterSpacingEm + ring.spacingEm) * glyphSize;
  const totalArc = widths.reduce((sum, width) => sum + width * scale + tracking, -tracking);
  const anglePerPx = 1 / radius;
  const totalAngle = totalArc * anglePerPx;
  if (totalAngle > Math.PI * 1.9) return; // never wrap the full circle illegibly
  const contrast = blockContrast(ring, draw);
  const centre = (ring.startAngleDeg * Math.PI) / 180;
  const previousAlpha = ctx.globalAlpha;
  ctx.globalAlpha = previousAlpha * ring.opacity;
  ctx.fillStyle = contrast.color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const glyphs = [...ring.text];
  let cursor = -totalArc / 2;
  for (const [index, glyph] of glyphs.entries()) {
    const glyphWidth = widths[index] * scale;
    const glyphCentre = cursor + glyphWidth / 2;
    /* Readable direction: top-arc text runs clockwise upright; lower-arc text
     * runs counter-clockwise flipped outward so it is never upside-down. */
    const angle = ring.flipped
      ? centre - glyphCentre * anglePerPx
      : centre + glyphCentre * anglePerPx;
    const x = draw.sx + radius * Math.sin(angle);
    const y = draw.sy - radius * Math.cos(angle);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ring.flipped ? angle + Math.PI : angle);
    ctx.scale(scale, scale);
    if (draw.textShadow) {
      ctx.strokeStyle = `${contrast.keyline}55`;
      ctx.lineWidth = 0.85;
      ctx.strokeText(glyph, 0, 0);
    }
    ctx.fillText(glyph, 0, 0);
    ctx.restore();
    cursor += glyphWidth + tracking;
  }
  ctx.globalAlpha = previousAlpha;
};

const FLAG_VECTORS: Record<Exclude<FlagDirection, "auto">, { x: number; y: number }> = {
  above: { x: 0, y: -1 },
  below: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const FLAG_PANEL_PADDING = 7;

const drawFlag = (
  ctx: CanvasRenderingContext2D,
  flag: NonNullable<ResolvedCellLabelLayout["flag"]>,
  draw: CellLabelDrawContext,
  fitScale = 1
): void => {
  const scale = resolveLabelRuntimeScale(flag.scaleMode, draw.zoom) * fitScale;
  if (scale <= 0 || flag.blocks.length === 0) return;
  const vector = FLAG_VECTORS[flag.direction];
  const startX = draw.sx + vector.x * draw.screenRadius;
  const startY = draw.sy + vector.y * draw.screenRadius;
  const endX = startX + vector.x * flag.distanceWorld * scale;
  const endY = startY + vector.y * flag.distanceWorld * scale;

  const panelWidth = flag.widthWorld * scale;
  const contentHeightWorld = flag.blocks.reduce(
    (max, block) => Math.max(max, Math.abs(block.offsetWorld.y) + block.estimatedHeightWorld / 2),
    0
  ) * 2;
  const panelHeight = (contentHeightWorld + FLAG_PANEL_PADDING * 2) * scale;

  let panelX: number;
  let panelY: number;
  if (flag.direction === "right") {
    panelX = endX;
    panelY = flag.align === "start" ? endY : flag.align === "end" ? endY - panelHeight : endY - panelHeight / 2;
  } else if (flag.direction === "left") {
    panelX = endX - panelWidth;
    panelY = flag.align === "start" ? endY : flag.align === "end" ? endY - panelHeight : endY - panelHeight / 2;
  } else if (flag.direction === "above") {
    panelY = endY - panelHeight;
    panelX = flag.align === "start" ? endX : flag.align === "end" ? endX - panelWidth : endX - panelWidth / 2;
  } else {
    panelY = endY;
    panelX = flag.align === "start" ? endX : flag.align === "end" ? endX - panelWidth : endX - panelWidth / 2;
  }

  /* Leader stem + edge tick. Hairline editorial language, never a data edge. */
  ctx.save();
  ctx.strokeStyle = draw.hairlineColor;
  ctx.lineWidth = Math.max(1, scale);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.fillStyle = draw.hairlineColor;
  ctx.beginPath();
  ctx.arc(startX, startY, Math.max(1.4, 1.6 * scale), 0, Math.PI * 2);
  ctx.fill();

  /* Compact glass panel. */
  const radius = Math.min(6 * scale, panelHeight / 2);
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, radius);
  ctx.fillStyle = draw.surfaceColor;
  ctx.globalAlpha = 0.86;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = draw.hairlineColor;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  const centreX = panelX + panelWidth / 2;
  const centreY = panelY + panelHeight / 2;
  const innerWidthWorld = flag.widthWorld - FLAG_PANEL_PADDING * 2;
  const panelDraw: CellLabelDrawContext = {
    ...draw,
    backgroundColor: draw.surfaceColor,
    voidBackground: false,
  };
  for (const block of flag.blocks) {
    ctx.save();
    ctx.translate(centreX + block.offsetWorld.x * scale, centreY + block.offsetWorld.y * scale);
    if (block.rotationDeg) ctx.rotate((block.rotationDeg * Math.PI) / 180);
    ctx.scale(scale, scale);
    drawBlockContent(ctx, { ...block, maxWidthRatio: 0 }, { x: 0, y: 0, widthWorld: innerWidthWorld }, panelDraw);
    ctx.restore();
  }
};

/** Full per-Cell label pass shared by Organism export and compile-only Classic. */
export const drawCellLabelLayout = (
  ctx: CanvasRenderingContext2D,
  selection: RuntimeLabelSelection,
  draw: CellLabelDrawContext
): void => {
  if (selection.divider) {
    const width = selection.divider.widthRatio * 2 * draw.screenRadius;
    ctx.save();
    ctx.strokeStyle = draw.hairlineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(draw.sx - width / 2, draw.sy + selection.divider.yUnit * draw.screenRadius);
    ctx.lineTo(draw.sx + width / 2, draw.sy + selection.divider.yUnit * draw.screenRadius);
    ctx.stroke();
    ctx.restore();
  }
  for (const block of selection.blocks) {
    drawBlock(ctx, block, draw, selection.fitScale);
  }
  if (selection.ring) drawRing(ctx, selection.ring, draw);
  if (selection.flag) drawFlag(ctx, selection.flag, draw, selection.fitScale);
};

export { selectRuntimeLabelLayout };
