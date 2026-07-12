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
import { getAreaRange, getNucleusColor } from "../design/colorMapping";
import { drawBlobLayer, type BlobBody } from "./blob";
import type { AttachMode, MorphMode } from "../types";
import { resolveLabelScale } from "./labelPresentation";
import { resolveLabelContrast } from "../design/labelContrast";
import { resolveCellShadow } from "./cellShadow";
import { resolveSelectionRingState } from "../interaction/selection";

// Pure canvas draw layer — no React, no store. CanvasView feeds it snapshots.

export interface BlobSettings {
  blobOn: boolean;
  mergeDistance: number;
  morphMode: MorphMode;
  attachMode: AttachMode;
  paletteMode: PaletteMode;
  nucleusPaletteId: string;
  colorSource: ColorSource;
  annotationDetail: AnnotationDetail;
  labelScaleMode: LabelScaleMode;
  labelColourMode: LabelColourMode;
  labelCustomColour: string;
  cellShadow: CellShadowSettings;
  performanceQuality: PerformanceQuality;
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
  const selectedSet = new Set(selectedIds);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h); // body token bg shows through
  let blobSettling = false;

  const z = cam.zoom;
  const toX = (x: number) => (x - cam.x) * z + w / 2;
  const toY = (y: number) => (y - cam.y) * z + h / 2;
  const areaRange = getAreaRange(spaces);
  const theme = !isDark(tokens.ink) ? "night" : "day";
  const cellShadow = resolveCellShadow(blob.cellShadow, blob.performanceQuality, theme);

  // Organism tissue underneath the cells. Bodies are world-space (no viewport
  // cull — the layer caches world geometry; the canvas clips it for free).
  if (blob.blobOn && spaces.length > 0) {
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
      blob.attachMode
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
    const mappedColor = getNucleusColor(c, blob.paletteMode, areaRange, blob.nucleusPaletteId, blob.colorSource);
    const isVoid = c.kind === "void";

    ctx.globalAlpha = Math.min(1, Math.max(0, spawn));

    if (isVoid) {
      ctx.save();
      ctx.setLineDash([5 * z, 5 * z]);
      ctx.lineWidth = Math.max(1.2, 1.5 * z);
      ctx.strokeStyle = mappedColor.ring;
      ctx.fillStyle = "rgba(0,0,0,0.035)";
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha *= 0.68;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      if (cellShadow.enabled && (!options?.isExport || cellShadow.includeInExport)) {
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

      ctx.fillStyle = mappedColor.fill;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // Ceramic shading — subtle top-light.
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
    }

    /* Selection is one external presentation-only ring. It never enters
       radius, position, Morph geometry, material, or field calculations. */
    const ringState = resolveSelectionRingState(
      selectedSet.has(c.id),
      selectedId === c.id,
      options?.hoveredId === c.id
    );
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
      const labelScale = resolveLabelScale(blob.labelScaleMode, z, blob.annotationDetail.textScale);
      const contrast = resolveLabelContrast({
        mode: blob.labelColourMode,
        customColor: blob.labelCustomColour,
        backgroundColor: mappedColor.fill,
        voidBackground: isVoid,
        theme,
      });
      const nameSize = 11 * labelScale;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(0.75, labelScale * 0.85);
      ctx.strokeStyle = `${contrast.keyline}55`;
      ctx.fillStyle = contrast.color;
      ctx.font = `500 ${nameSize}px ${FONT}`;
      const labelWidth = Math.max(56, r * 1.7);
      if (blob.annotationDetail.textShadow) ctx.strokeText(c.name, sx, sy - nameSize * 0.35, labelWidth);
      ctx.fillText(c.name, sx, sy - nameSize * 0.35, labelWidth);
      ctx.globalAlpha *= 0.68;
      ctx.font = `400 ${Math.max(9, nameSize * 0.72)}px ${FONT}`;
      if (blob.annotationDetail.textShadow) ctx.strokeText(`${c.area} m²`, sx, sy + nameSize * 0.78, labelWidth);
      ctx.fillText(`${c.area} m²`, sx, sy + nameSize * 0.78, labelWidth);
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = 1;
  }

  return blobSettling;
}
