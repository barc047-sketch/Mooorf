import type { Camera, Privacy, SpaceCell } from "../types";
import { areaToRadius, clamp } from "../lib/geometry";
import { MAX_NUCLEI } from "../experiments/organism-lab/organism-types";

export interface ProductionNucleus {
  id: string;
  label: string;
  fx: number;
  fy: number;
  r: number;
  strength: number;
  sx: number;
  sy: number;
  screenR: number;
  color: string;
  category: string;
  privacy: Privacy;
}

export interface DragPosition {
  id: string;
  x: number;
  y: number;
}

const privacyStrength: Record<Privacy, number> = {
  public: 1.04,
  shared: 1,
  private: 0.94,
};

export function worldToScreen(
  x: number,
  y: number,
  camera: Camera,
  width: number,
  height: number
): { sx: number; sy: number } {
  return {
    sx: (x - camera.x) * camera.zoom + width / 2,
    sy: (y - camera.y) * camera.zoom + height / 2,
  };
}

export function screenToWorld(
  sx: number,
  sy: number,
  camera: Camera,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: (sx - width / 2) / camera.zoom + camera.x,
    y: (sy - height / 2) / camera.zoom + camera.y,
  };
}

export function worldToField(
  x: number,
  y: number,
  camera: Camera,
  width: number,
  height: number
): { fx: number; fy: number } {
  const { sx, sy } = worldToScreen(x, y, camera, width, height);
  const halfMin = Math.max(1, Math.min(width, height) / 2);
  return {
    fx: (sx - width / 2) / halfMin,
    fy: -(sy - height / 2) / halfMin,
  };
}

export function fieldToScreen(
  fx: number,
  fy: number,
  width: number,
  height: number
): { sx: number; sy: number } {
  const halfMin = Math.max(1, Math.min(width, height) / 2);
  return {
    sx: width / 2 + fx * halfMin,
    sy: height / 2 - fy * halfMin,
  };
}

export function spacesToNuclei(
  spaces: SpaceCell[],
  camera: Camera,
  width: number,
  height: number,
  selectedId: string | null,
  drag?: DragPosition | null
): ProductionNucleus[] {
  const halfMin = Math.max(1, Math.min(width, height) / 2);
  return spaces.slice(0, MAX_NUCLEI).map((space) => {
    const x = drag?.id === space.id ? drag.x : space.x;
    const y = drag?.id === space.id ? drag.y : space.y;
    const screen = worldToScreen(x, y, camera, width, height);
    const field = worldToField(x, y, camera, width, height);
    const screenR = areaToRadius(space.area) * camera.zoom;
    const r = clamp(screenR / halfMin, 0.018, 0.42);
    return {
      id: space.id,
      label: space.name,
      fx: field.fx,
      fy: field.fy,
      r,
      strength: privacyStrength[space.privacy] * (space.id === selectedId ? 1.16 : 1),
      sx: screen.sx,
      sy: screen.sy,
      screenR,
      color: space.color,
      category: space.category,
      privacy: space.privacy,
    };
  });
}

export function hitTestNuclei(
  nuclei: ProductionNucleus[],
  sx: number,
  sy: number
): ProductionNucleus | null {
  let best: ProductionNucleus | null = null;
  let bestScore = Infinity;
  for (let i = nuclei.length - 1; i >= 0; i--) {
    const n = nuclei[i];
    const dx = sx - n.sx;
    const dy = sy - n.sy;
    const hitR = Math.max(18, n.screenR * 1.08);
    const d = Math.hypot(dx, dy);
    if (d <= hitR && d - hitR < bestScore) {
      best = n;
      bestScore = d - hitR;
    }
  }
  return best;
}
