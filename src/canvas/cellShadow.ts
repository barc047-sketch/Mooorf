import type { CellShadowSettings, PerformanceQuality, Theme } from "../types";

export const DEFAULT_CELL_SHADOW: CellShadowSettings = {
  enabled: false,
  mode: "off",
  opacity: 0.16,
  softness: 22,
  offsetX: 0,
  offsetY: 9,
  spread: 0,
  colorMode: "auto",
  color: "#000000",
  includeInExport: true,
};

const finite = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const color = (value: unknown) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toLowerCase() : "#000000";

export const normalizeCellShadow = (value?: Partial<CellShadowSettings> | null): CellShadowSettings => {
  const mode = value?.mode === "soft" || value?.mode === "defined" ? value.mode : "off";
  const enabled = value?.enabled === true && mode !== "off";
  return {
    enabled,
    mode: enabled ? mode : "off",
    opacity: clamp(finite(value?.opacity, DEFAULT_CELL_SHADOW.opacity), 0, 1),
    softness: clamp(finite(value?.softness, DEFAULT_CELL_SHADOW.softness), 0, 64),
    offsetX: clamp(finite(value?.offsetX, DEFAULT_CELL_SHADOW.offsetX), -64, 64),
    offsetY: clamp(finite(value?.offsetY, DEFAULT_CELL_SHADOW.offsetY), -64, 64),
    spread: clamp(finite(value?.spread, DEFAULT_CELL_SHADOW.spread), -32, 32),
    colorMode: value?.colorMode === "custom" ? "custom" : "auto",
    color: color(value?.color),
    includeInExport: value?.includeInExport !== false,
  };
};

export interface ResolvedCellShadow extends CellShadowSettings {
  rgba: string;
}

export const resolveCellShadow = (
  value: Partial<CellShadowSettings> | null | undefined,
  quality: PerformanceQuality,
  theme: Theme
): ResolvedCellShadow => {
  const normalized = normalizeCellShadow(value);
  const enabled = normalized.enabled && normalized.mode !== "off" && quality !== "fast";
  const rgb = normalized.colorMode === "custom"
    ? normalized.color
    : theme === "night" ? "#000000" : "#222222";
  const hex = Number.parseInt(rgb.slice(1), 16);
  const opacity = normalized.mode === "defined" ? Math.max(normalized.opacity, 0.24) : normalized.opacity;
  return {
    ...normalized,
    enabled,
    mode: enabled ? normalized.mode : "off",
    opacity,
    softness: quality === "balanced" ? Math.min(normalized.softness, 28) : normalized.softness,
    rgba: `rgba(${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255},${opacity})`,
  };
};
