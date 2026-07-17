import type {
  CellShadowSettings,
  LabelColourMode,
  LabelScaleMode,
  PerformanceQuality,
  RendererMode,
} from "../types";
import { DEFAULT_CELL_SHADOW, normalizeCellShadow } from "../canvas/cellShadow";

export const normalizeLabelScaleMode = (
  value: unknown,
  legacyRenderer: RendererMode = "organism"
): LabelScaleMode => {
  void legacyRenderer;
  return value === "screen" || value === "adaptive" || value === "world" ? value : "world";
};

export const normalizeLabelColourMode = (value: unknown): LabelColourMode =>
  value === "black" || value === "white" || value === "custom" ? value : "auto";

export const normalizeLabelCustomColour = (value: unknown): string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim().toLowerCase()
    : "#171719";

export const normalizePerformanceQuality = (value: unknown): PerformanceQuality =>
  value === "high" || value === "balanced" || value === "fast" ? value : "automatic";

export const normalizeLegacyCellShadow = (
  value: Partial<CellShadowSettings> | null | undefined,
  renderer: RendererMode
): CellShadowSettings => value
  ? normalizeCellShadow(value)
  : renderer === "classic"
    ? normalizeCellShadow({ ...DEFAULT_CELL_SHADOW, enabled: true, mode: "soft" })
    : { ...DEFAULT_CELL_SHADOW };
