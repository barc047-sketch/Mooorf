import type { LabelScaleMode } from "../types";

const finitePositive = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export interface LabelScaleInput {
  mode: LabelScaleMode;
  authoredWorldSize: number;
  zoom: number;
  minimumScreenSize?: number;
  maximumScreenSize?: number;
}

export interface ResolvedLabelScale {
  screenSize: number;
  worldSize: number;
  inverseCameraScale: number;
}

/** Pure projection only. Camera movement never mutates authored label settings. */
export const resolveLabelScale = ({
  mode,
  authoredWorldSize,
  zoom,
  minimumScreenSize = 9,
  maximumScreenSize = 34,
}: LabelScaleInput): ResolvedLabelScale => {
  const safeWorldSize = finitePositive(authoredWorldSize, 1);
  const safeZoom = finitePositive(zoom, 1);
  const minimum = finitePositive(minimumScreenSize, 9);
  const maximum = Math.max(minimum, finitePositive(maximumScreenSize, 34));
  const naturalScreenSize = safeWorldSize * safeZoom;

  if (mode === "screen") {
    return {
      screenSize: safeWorldSize,
      worldSize: safeWorldSize / safeZoom,
      inverseCameraScale: 1 / safeZoom,
    };
  }

  if (mode === "adaptive") {
    const screenSize = Math.min(maximum, Math.max(minimum, naturalScreenSize));
    return {
      screenSize,
      worldSize: screenSize / safeZoom,
      inverseCameraScale: screenSize / naturalScreenSize,
    };
  }

  return {
    screenSize: naturalScreenSize,
    worldSize: safeWorldSize,
    inverseCameraScale: 1,
  };
};
