export const UI_SCALE_MIN = 0.82;
export const UI_SCALE_MAX = 1.18;

export const UI_SCALE_PRESETS = [
  { id: "compact", label: "Compact", value: 0.88 },
  { id: "standard", label: "Standard", value: 1 },
  { id: "comfortable", label: "Comfortable", value: 1.12 },
] as const;

export type UiScalePresetId = (typeof UI_SCALE_PRESETS)[number]["id"];

export const normalizeUiScale = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  const clamped = Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, value));
  return Math.round(clamped * 100) / 100;
};

export const getUiScalePreset = (value: number): UiScalePresetId | null =>
  UI_SCALE_PRESETS.find((preset) => preset.value === normalizeUiScale(value))?.id ?? null;
