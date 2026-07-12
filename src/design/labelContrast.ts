import type { LabelColourMode, Theme } from "../types";

const INK = "#171719";
const BONE = "#f4f2e9";
const isHex = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim());

export const relativeLuminance = (hex: string): number => {
  if (!isHex(hex)) return 0;
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export interface LabelContrastInput {
  mode: LabelColourMode;
  theme: Theme;
  customColor?: string;
  /** Highest-priority resolved cell/material/category/privacy colour. */
  backgroundColor?: string;
  voidBackground?: boolean;
  morphDominantColor?: string;
  /** Future cached background-reference hook, normalized relative luminance. */
  backgroundLuminanceSample?: number;
}

export interface ResolvedLabelContrast {
  color: string;
  keyline: string;
  source: "forced" | "custom" | "background" | "void" | "morph" | "sample" | "theme";
}

const fromLuminance = (luminance: number, source: ResolvedLabelContrast["source"]): ResolvedLabelContrast => {
  const darkText = luminance > 0.36;
  return { color: darkText ? INK : BONE, keyline: darkText ? BONE : INK, source };
};

export const resolveLabelContrast = (input: LabelContrastInput): ResolvedLabelContrast => {
  if (input.mode === "black") return { color: INK, keyline: BONE, source: "forced" };
  if (input.mode === "white") return { color: BONE, keyline: INK, source: "forced" };
  if (input.mode === "custom" && isHex(input.customColor)) {
    const color = input.customColor.trim().toLowerCase();
    return { color, keyline: relativeLuminance(color) > 0.36 ? BONE : INK, source: "custom" };
  }
  if (isHex(input.backgroundColor)) return fromLuminance(relativeLuminance(input.backgroundColor), "background");
  if (input.voidBackground) return { color: BONE, keyline: INK, source: "void" };
  if (isHex(input.morphDominantColor)) return fromLuminance(relativeLuminance(input.morphDominantColor), "morph");
  if (Number.isFinite(input.backgroundLuminanceSample)) {
    return fromLuminance(Math.min(Math.max(input.backgroundLuminanceSample!, 0), 1), "sample");
  }
  return input.theme === "night"
    ? { color: BONE, keyline: INK, source: "theme" }
    : { color: INK, keyline: BONE, source: "theme" };
};

