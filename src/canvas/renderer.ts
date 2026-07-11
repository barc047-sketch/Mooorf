import type { Camera, PaletteMode, SpaceCell } from "../types";
import { areaToRadius } from "../lib/geometry";
import { getAreaRange, getNucleusColor } from "../design/colorMapping";
import { drawBlobLayer, type BlobBody } from "./blob";
import type { AttachMode, MorphMode } from "../types";

// Pure canvas draw layer — no React, no store. CanvasView feeds it snapshots.

export interface BlobSettings {
  blobOn: boolean;
  mergeDistance: number;
  morphMode: MorphMode;
  attachMode: AttachMode;
  paletteMode: PaletteMode;
  nucleusPaletteId: string;
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
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h); // body token bg shows through
  let blobSettling = false;

  const z = cam.zoom;
  const toX = (x: number) => (x - cam.x) * z + w / 2;
  const toY = (y: number) => (y - cam.y) * z + h / 2;
  const areaRange = getAreaRange(spaces);

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
    const mappedColor = getNucleusColor(c, blob.paletteMode, areaRange, blob.nucleusPaletteId);
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
      // Object shadow — soft, museum-floor.
      ctx.save();
      ctx.shadowColor = lifted ? "rgba(0,0,0,0.26)" : "rgba(0,0,0,0.16)";
      ctx.shadowBlur = (lifted ? 34 : 22) * z;
      ctx.shadowOffsetY = (lifted ? 14 : 9) * z;
      ctx.fillStyle = mappedColor.fill;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

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

    /* Selection uses only a subtle boundary keyline in Classic. The removed
       orbit/arc/halo geometry is not recreated, and export adapters pass null. */
    if (c.id === selectedId) {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = mappedColor.ring;
      ctx.lineWidth = Math.max(1, 1.15 * z);
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(1, r - 0.75), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Label — only when legible.
    if (r > 26 && includeLabels) {
      const dark = isDark(mappedColor.fill);
      const nameSize = Math.min(15, Math.max(10, r * 0.22));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dark ? "rgba(255,255,255,0.92)" : "rgba(20,20,20,0.82)";
      ctx.font = `500 ${nameSize}px ${FONT}`;
      ctx.fillText(c.name, sx, sy - nameSize * 0.35, r * 1.7);
      ctx.fillStyle = dark ? "rgba(255,255,255,0.55)" : "rgba(20,20,20,0.45)";
      ctx.font = `400 ${Math.max(9, nameSize * 0.72)}px ${FONT}`;
      ctx.fillText(`${c.area} m²`, sx, sy + nameSize * 0.78, r * 1.7);
    }

    ctx.globalAlpha = 1;
  }

  return blobSettling;
}
