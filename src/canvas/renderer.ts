import type {
  AnnotationDetail,
  Camera,
  CellShadowSettings,
  ColorSource,
  LabelColourMode,
  LabelScaleMode,
  PaletteMode,
  PerformanceQuality,
  SpaceCell,
} from "../types";
import { areaToRadius } from "../lib/geometry";
import { drawBlobLayer, type BlobBody } from "./blob";
import type { AttachMode, MorphMode } from "../types";
import { resolveLabelScale } from "./labelPresentation";
import { resolveLabelContrast } from "../design/labelContrast";
import { resolveCellShadowGated } from "./cellShadow";
import { iconRegistry } from "../icons/iconRegistry";
import { drawSymbolPlacement, resolveSymbolTint } from "../icons/iconDrawing";
import type { ResourceSettings } from "../resources/types";
import { projectSelectionOverlay } from "../interaction/selection";
import type { ProjectPresentationDefaults } from "../domain/presentation/types";
import {
  drawCircleLayers,
  projectCircleLayers,
  projectRuntimePresentation,
} from "./presentationLayers";
import { textStylePreset } from "../domain/presentation/editing";

// Pure canvas draw layer — no React, no store. CanvasView feeds it snapshots.

export interface BlobSettings {
  blobOn: boolean;
  mergeDistance: number;
  morphMode: MorphMode;
  attachMode: AttachMode;
  paletteMode: PaletteMode;
  nucleusPaletteId: string;
  organismPaletteId: string;
  colorSource: ColorSource;
  annotationDetail: AnnotationDetail;
  labelScaleMode: LabelScaleMode;
  labelColourMode: LabelColourMode;
  labelCustomColour: string;
  cellShadow: CellShadowSettings;
  performanceQuality: PerformanceQuality;
  presentationDefaults: ProjectPresentationDefaults;
  resources: ResourceSettings;
}

export interface Tokens {
  ink: string;
  fog: string;
  hairline: string;
  surface: string;
  chromeAccent: string;
}

export const readTokens = (): Tokens => {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    ink: v("--ink"),
    fog: v("--fog"),
    hairline: v("--hairline"),
    surface: v("--surface"),
    chromeAccent: v("--chrome-accent"),
  };
};

export interface DragOverride {
  id: string;
  x: number;
  y: number;
}

const FONT =
  '"Inter Tight", "Neue Haas Grotesk Display Pro", "Helvetica Neue", Helvetica, Arial, sans-serif';

// Perceived luminance of #rrggbb — picks label ink vs bone.
const isDark = (hex: string) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return false;
  const n = parseInt(hex.slice(1), 16);
  const l =
    0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return l < 140;
};

const easeOutBack = (t: number) => {
  const c = 1.70158;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};

export const SPAWN_MS = 450;

const boundedBodyLines = (
  ctx: CanvasRenderingContext2D,
  body: string,
  maxWidth: number,
  maxLines = 3
): string[] => {
  const words = body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const candidate = lines.length ? `${lines[lines.length - 1]} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !lines.length) {
      if (!lines.length) lines.push(candidate);
      else lines[lines.length - 1] = candidate;
    } else if (lines.length < maxLines) {
      lines.push(word);
    } else {
      const last = lines[maxLines - 1];
      let clipped = last;
      while (clipped && ctx.measureText(`${clipped}…`).width > maxWidth) clipped = clipped.slice(0, -1);
      lines[maxLines - 1] = `${clipped.trimEnd()}…`;
      break;
    }
  }
  return lines.slice(0, maxLines);
};

export interface DrawSceneOptions {
  /** V7.2 export adapter — omit to keep the live canvas's existing behavior. */
  includeLabels?: boolean;
  /** V8.2A — selected object keylines; primarySelectedId remains selectedId. */
  selectedIds?: readonly string[];
  hoveredId?: string | null;
  isExport?: boolean;
}

// Returns true while the organism layer is mid-transition (caller repaints).
export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  cam: Camera,
  spaces: SpaceCell[],
  selectedId: string | null,
  drag: DragOverride | null,
  tokens: Tokens,
  now: number,
  blob: BlobSettings,
  options?: DrawSceneOptions
): boolean {
  const includeLabels = options?.includeLabels ?? true;
  const selectedIds = options?.selectedIds ?? (selectedId ? [selectedId] : []);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h); // body token bg shows through
  let blobSettling = false;

  const z = cam.zoom;
  const toX = (x: number) => (x - cam.x) * z + w / 2;
  const toY = (y: number) => (y - cam.y) * z + h / 2;
  const theme = !isDark(tokens.ink) ? "night" : "day";
  const cellShadow = resolveCellShadowGated(blob.cellShadow, blob.performanceQuality, theme);
  const presentation = projectRuntimePresentation(spaces, blob, theme);
  const selection = projectSelectionOverlay({
    visibleIds: spaces.map((space) => space.id),
    selectedIds,
    primarySelectedId: selectedId,
    hoveredId: options?.hoveredId ?? null,
    include: !options?.isExport || selectedIds.length > 0,
  });

  // Organism tissue underneath the cells. Bodies are world-space (no viewport
  // cull — the layer caches world geometry; the canvas clips it for free).
  if ((presentation.membrane.visible || presentation.membraneEdge.visible) && spaces.length > 0) {
    const bodies: BlobBody[] = [];
    for (const c of spaces) {
      if (c.kind === "void") continue;
      let spawn = 1;
      if (c.born) {
        const t = (now - c.born) / SPAWN_MS;
        if (t < 0) continue; // staggered — not born yet
        if (t < 1) spawn = easeOutBack(Math.max(0, t));
      }
      const r = areaToRadius(c.area) * spawn;
      if (r <= 0) continue;
      const lifted = drag?.id === c.id;
      bodies.push({ x: lifted ? drag.x : c.x, y: lifted ? drag.y : c.y, r });
    }
    const night = !isDark(tokens.ink); // light ink ⇒ night theme
    blobSettling = drawBlobLayer(
      ctx,
      w,
      h,
      cam,
      bodies,
      blob.mergeDistance,
      night,
      blob.morphMode,
      blob.attachMode,
      {
        fillColour: presentation.membrane.paint.colour,
        fillOpacity: presentation.membrane.visible ? presentation.membrane.paint.opacity : 0,
        edgeVisible: presentation.membraneEdge.visible,
        edgeColour: presentation.membraneEdge.paint.colour,
        edgeOpacity: presentation.membraneEdge.paint.opacity,
        edgeWidth: presentation.membraneEdge.width,
        edgeSoftness: presentation.membraneEdge.softness,
      }
    );
  }

  for (const c of spaces) {
    const lifted = drag?.id === c.id;
    const wx = lifted ? drag.x : c.x;
    const wy = lifted ? drag.y : c.y;
    const sx = toX(wx);
    const sy = toY(wy);

    // Spawn stagger: scale/alpha in.
    let spawn = 1;
    if (c.born) {
      const t = (now - c.born) / SPAWN_MS;
      if (t < 0) continue; // staggered — not born yet
      if (t < 1) spawn = easeOutBack(Math.max(0, t));
    }

    const r = areaToRadius(c.area) * z * spawn * (lifted ? 1.03 : 1);
    if (r <= 0 || sx < -r - 60 || sx > w + r + 60 || sy < -r - 60 || sy > h + r + 60) continue;
    const appearance = presentation.byId.get(c.id);
    if (!appearance) continue;
    const layers = projectCircleLayers(c, appearance, r, z, "classic");
    const mappedColor = { fill: appearance.cell.paint.colour, ring: appearance.boundary.paint.colour };
    const isVoid = c.kind === "void";

    ctx.globalAlpha = Math.min(1, Math.max(0, spawn));

    if (isVoid) {
      drawCircleLayers(ctx, sx, sy, layers, { cell: false, boundary: false, core: false });
    } else {
      if (layers.cell && cellShadow.enabled && (!options?.isExport || cellShadow.includeInExport)) {
        ctx.save();
        ctx.filter = `blur(${cellShadow.softness}px)`;
        ctx.fillStyle = cellShadow.rgba;
        ctx.beginPath();
        ctx.arc(
          sx + cellShadow.offsetX,
          sy + cellShadow.offsetY,
          Math.max(0, r + cellShadow.spread),
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }

      drawCircleLayers(ctx, sx, sy, layers, { boundary: false, core: false, void: false });

      // Ceramic shading — subtle top-light.
      if (layers.cell) {
        ctx.save();
        ctx.globalAlpha *= layers.cell.opacity;
        const g = ctx.createRadialGradient(
          sx - r * 0.32,
          sy - r * 0.38,
          r * 0.15,
          sx,
          sy,
          r
        );
        g.addColorStop(0, "rgba(255,255,255,0.16)");
        g.addColorStop(0.55, "rgba(255,255,255,0)");
        g.addColorStop(1, "rgba(0,0,0,0.12)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      drawCircleLayers(ctx, sx, sy, layers, { cell: false, void: false });
    }

    const symbolPlacement = blob.resources.iconPlacements.find((placement) => placement.targetSpaceId === c.id);
    const symbolDefinition = symbolPlacement ? iconRegistry.get(symbolPlacement.iconId) : null;
    if (symbolPlacement && symbolDefinition) drawSymbolPlacement(ctx, symbolDefinition, symbolPlacement, {
      x: sx,
      y: sy,
      radius: r,
      zoom: z,
      tint: resolveSymbolTint(symbolPlacement, {
        theme,
        backgroundColor: isVoid ? appearance.void.fill.colour : appearance.cell.paint.colour,
        surfaceOpacity: isVoid ? appearance.void.fill.opacity : appearance.cell.paint.opacity,
        canvasColor: tokens.surface,
        voidBackground: isVoid,
      }),
    });

    /* Selection is one external presentation-only ring. It never enters
       radius, position, Morph geometry, material, or field calculations. */
    const ringState = selection.get(c.id) ?? "none";
    if (ringState !== "none") {
      ctx.save();
      ctx.globalAlpha = ringState === "hover" ? 0.34 : ringState === "secondary" ? 0.58 : 0.86;
      ctx.strokeStyle = ringState === "hover" ? tokens.hairline : mappedColor.ring;
      ctx.lineWidth = ringState === "primary" ? 1.6 : 1.1;
      ctx.setLineDash(ringState === "secondary" ? [5, 4] : []);
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(1, r + 6), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Label — only when legible.
    if (includeLabels) {
      const text = appearance.text;
      const preset = textStylePreset(text.preset);
      const labelScale = resolveLabelScale(blob.labelScaleMode, z, 1) * text.size;
      const contrast = resolveLabelContrast({
        mode: text.colourMode === "custom" ? "custom" : "auto",
        customColor: text.colourMode === "custom" ? text.colour : blob.labelCustomColour,
        backgroundColor: mappedColor.fill,
        voidBackground: isVoid,
        theme,
      });
      const nameSize = 11 * labelScale * preset.heading.scale;
      const areaSize = Math.max(7, 11 * labelScale * preset.area.scale);
      const bodySize = Math.max(7, 11 * labelScale * preset.body.scale);
      ctx.textAlign = preset.align;
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(0.75, labelScale * 0.85);
      ctx.strokeStyle = `${contrast.keyline}55`;
      ctx.fillStyle = contrast.color;
      const labelWidth = Math.max(56, r * 1.62);
      const anchorX = preset.align === "left" ? sx - labelWidth / 2 : sx;
      const body = c.body?.trim() ?? "";
      const rowCount = (blob.annotationDetail.showName ? 1 : 0) + (blob.annotationDetail.showArea ? 1 : 0) + (body ? Math.min(3, body.split(/\s+/).length) : 0);
      let y = sy - Math.min(r * 0.42, Math.max(0, rowCount - 1) * bodySize * 0.5);
      if (blob.annotationDetail.showName) {
        ctx.font = `${preset.heading.weight} ${nameSize}px ${FONT}`;
        if (blob.annotationDetail.textShadow) ctx.strokeText(c.name, anchorX, y, labelWidth);
        ctx.fillText(c.name, anchorX, y, labelWidth);
        y += nameSize * 0.9;
      }
      if (blob.annotationDetail.showArea) {
        ctx.globalAlpha *= 0.72;
        ctx.font = `${preset.area.weight} ${areaSize}px ${FONT}`;
        if (blob.annotationDetail.textShadow) ctx.strokeText(`${c.area} m²`, anchorX, y, labelWidth);
        ctx.fillText(`${c.area} m²`, anchorX, y, labelWidth);
        y += areaSize * 1.15;
      }
      if (body) {
        ctx.globalAlpha *= 0.82;
        ctx.font = `${preset.body.weight} ${bodySize}px ${FONT}`;
        const lines = boundedBodyLines(ctx, body, labelWidth, 3);
        for (const line of lines) {
          if (blob.annotationDetail.textShadow) ctx.strokeText(line, anchorX, y, labelWidth);
          ctx.fillText(line, anchorX, y, labelWidth);
          y += bodySize * preset.body.lineHeight;
        }
      }
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = 1;
  }

  return blobSettling;
}
