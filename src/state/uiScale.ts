/* Interface Scale and Widget Scale (V7.1D) are two independent canonical
   store values that happen to share identical bounds and preset values, so
   one normalization contract serves both — see docs/DECISIONS.md V7.1D. */
const SCALE_MIN = 0.82;
const SCALE_MAX = 1.18;

const SCALE_PRESETS = [
  { id: "compact", label: "Compact", value: 0.88 },
  { id: "standard", label: "Standard", value: 1 },
  { id: "comfortable", label: "Comfortable", value: 1.12 },
] as const;

export type ScalePresetId = (typeof SCALE_PRESETS)[number]["id"];

const normalizeScale = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
  return Math.round(clamped * 100) / 100;
};

const getScalePreset = (value: number): ScalePresetId | null =>
  SCALE_PRESETS.find((preset) => preset.value === normalizeScale(value))?.id ?? null;

export const UI_SCALE_MIN = SCALE_MIN;
export const UI_SCALE_MAX = SCALE_MAX;
export const UI_SCALE_PRESETS = SCALE_PRESETS;
export type UiScalePresetId = ScalePresetId;
export const normalizeUiScale = normalizeScale;
export const getUiScalePreset = getScalePreset;

export const WIDGET_SCALE_MIN = SCALE_MIN;
export const WIDGET_SCALE_MAX = SCALE_MAX;
export const WIDGET_SCALE_PRESETS = SCALE_PRESETS;
export type WidgetScalePresetId = ScalePresetId;
export const normalizeWidgetScale = normalizeScale;
export const getWidgetScalePreset = getScalePreset;
