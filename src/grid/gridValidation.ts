import { gridRegistry } from "./gridRegistry";
import type { GridPresetId, GridSettings } from "./types";

const hex = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const text = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  if (/^#[0-9a-f]{3}$/.test(text)) return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
  return fallback;
};
const number = (value: unknown, fallback: number, minimum: number, maximum: number): number => typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;

export const normalizeGridSettings = (value: unknown): GridSettings => {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const presetId = gridRegistry.get(String(record.presetId))?.id ?? "dotted";
  const defaults = gridRegistry.get(presetId)!.defaults;
  return {
    presetId,
    foreground: hex(record.foreground, defaults.foreground),
    background: hex(record.background, defaults.background),
    opacity: number(record.opacity, defaults.opacity, 0, 1),
    lineWeight: number(record.lineWeight, defaults.lineWeight, 0.25, 8),
    spacing: number(record.spacing, defaults.spacing, 4, 512),
    majorInterval: Math.round(number(record.majorInterval, defaults.majorInterval, 1, 64)),
    snap: typeof record.snap === "boolean" ? record.snap : defaults.snap,
    dynamicZoomDensity: typeof record.dynamicZoomDensity === "boolean" ? record.dynamicZoomDensity : defaults.dynamicZoomDensity,
    exportGrid: typeof record.exportGrid === "boolean" ? record.exportGrid : defaults.exportGrid,
  };
};

export const migrateLegacyGridSettings = (showGrid: boolean, value?: unknown): GridSettings => {
  if (value) return normalizeGridSettings(value);
  const presetId: GridPresetId = showGrid ? "dotted" : "none";
  return { ...gridRegistry.get(presetId)!.defaults };
};
