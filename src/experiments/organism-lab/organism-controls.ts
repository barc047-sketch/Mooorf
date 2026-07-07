/* V6E Organism Lab — control system schema + style/attachment mapping.
   The panel UI is generated from this metadata so every parameter in the data
   model stays reachable without bespoke UI code per slider. */

import {
  hexToRgb01,
  type AttachmentMode,
  type LabTheme,
  type NumericParamKey,
  type OrganismParams,
  type OrganismStyleId,
  type StyleColors,
} from "./organism-types";

export interface SliderDef {
  key: NumericParamKey;
  label: string;
  min: number;
  max: number;
  step: number;
  fmt?: (v: number) => string;
}

export interface ControlGroup {
  id: string;
  title: string;
  sliders: SliderDef[];
}

const f2 = (v: number) => v.toFixed(2);
const int = (v: number) => String(Math.round(v));
const deg = (v: number) => `${Math.round(v)}°`;

export const CONTROL_GROUPS: ControlGroup[] = [
  {
    id: "organism",
    title: "Organism",
    sliders: [
      { key: "mass", label: "Mass", min: 0.4, max: 2.4, step: 0.01, fmt: f2 },
      { key: "isoLevel", label: "Iso Level", min: 0.4, max: 2.2, step: 0.01, fmt: f2 },
      { key: "surfaceTension", label: "Surface Tension", min: 0.5, max: 1.7, step: 0.01, fmt: f2 },
      { key: "edgeSoftness", label: "Edge Softness", min: 0.004, max: 0.6, step: 0.002, fmt: f2 },
      { key: "connectionBias", label: "Connection Bias", min: 0, max: 1, step: 0.01, fmt: f2 },
    ],
  },
  {
    id: "nuclei",
    title: "Nuclei",
    sliders: [
      { key: "count", label: "Count", min: 1, max: 24, step: 1, fmt: int },
      { key: "radiusMin", label: "Radius Min", min: 0.03, max: 0.3, step: 0.005, fmt: f2 },
      { key: "radiusMax", label: "Radius Max", min: 0.15, max: 0.75, step: 0.005, fmt: f2 },
      { key: "nucleusStrength", label: "Strength", min: 0.3, max: 2, step: 0.01, fmt: f2 },
      { key: "sizeVariation", label: "Size Variation", min: 0, max: 1, step: 0.01, fmt: f2 },
    ],
  },
  {
    id: "offset",
    title: "Offset",
    sliders: [
      { key: "globalOffset", label: "Global Offset", min: 0.2, max: 2.2, step: 0.01, fmt: f2 },
      { key: "offsetX", label: "Offset X", min: -0.8, max: 0.8, step: 0.01, fmt: f2 },
      { key: "offsetY", label: "Offset Y", min: -0.8, max: 0.8, step: 0.01, fmt: f2 },
      { key: "radialOffset", label: "Radial Offset", min: -0.35, max: 0.6, step: 0.01, fmt: f2 },
      { key: "angularOffset", label: "Angular Offset", min: -180, max: 180, step: 1, fmt: deg },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    sliders: [
      { key: "timeScale", label: "Time Scale", min: 0, max: 3, step: 0.01, fmt: f2 },
      { key: "response", label: "Response", min: 0.5, max: 18, step: 0.1, fmt: f2 },
      { key: "drift", label: "Drift", min: 0, max: 1, step: 0.01, fmt: f2 },
      { key: "breathing", label: "Breathing", min: 0, max: 1, step: 0.01, fmt: f2 },
      { key: "wobble", label: "Wobble", min: 0, max: 1, step: 0.01, fmt: f2 },
      { key: "phaseVariation", label: "Phase Variation", min: 0, max: 1, step: 0.01, fmt: f2 },
    ],
  },
  {
    id: "pockets",
    title: "Pockets",
    sliders: [
      { key: "pocketThreshold", label: "Pocket Threshold", min: 2, max: 14, step: 0.05, fmt: f2 },
      { key: "pocketSoftness", label: "Pocket Softness", min: 0.05, max: 3, step: 0.01, fmt: f2 },
    ],
  },
];

export const STYLE_OPTIONS: { id: OrganismStyleId; label: string; short: string }[] = [
  { id: "cellular-reverse", label: "Cellular Reverse", short: "Cellular" },
  { id: "plain-black", label: "Plain Black", short: "Black" },
  { id: "plain-white", label: "Plain White", short: "White" },
  { id: "graphite", label: "Graphite", short: "Graphite" },
  { id: "wine", label: "Wine", short: "Wine" },
  { id: "auto", label: "Auto (theme-adaptive)", short: "Auto" },
];

export const ATTACHMENT_OPTIONS: { id: AttachmentMode; label: string; short: string }[] = [
  { id: "tight", label: "Tight", short: "T" },
  { id: "soft", label: "Soft", short: "S" },
  { id: "long", label: "Long", short: "L" },
  { id: "extreme", label: "Extreme", short: "X" },
];

/* Attachment preset = base field character. Sliders fine-tune around the base
   (same preset-vs-slider contract as the V6D dock attachment control). */
export const ATTACHMENT_BASE: Record<AttachmentMode, { tension: number; bias: number }> = {
  tight: { tension: 1.3, bias: 0.03 },
  soft: { tension: 1.0, bias: 0.18 },
  long: { tension: 0.82, bias: 0.4 },
  extreme: { tension: 0.6, bias: 0.72 },
};

/** Combine attachment base with the fine-tune sliders (0.25 bias = neutral trim). */
export function effectiveField(params: OrganismParams): { tension: number; bias: number } {
  const base = ATTACHMENT_BASE[params.attachment];
  const tension = Math.min(Math.max(base.tension * params.surfaceTension, 0.35), 2.4);
  const bias = Math.min(Math.max(base.bias + (params.connectionBias - 0.25) * 0.8, 0), 1.25);
  return { tension, bias };
}

/* Lab palette — mirrors src/styles/tokens.css (cream #f5f6ee, night #070707,
   night ink #ededea) so V6F integration lands on the same grounds. */
const CREAM = "#f5f6ee";
const NIGHT = "#070707";
const INK_BLACK = "#131313";
const BONE = "#ededea";
const TRUE_BLACK = "#0c0c0c";
const WHITE_BODY = "#f4f4ee";
const DEEP_GROUND = "#0b0b0b";
const GRAPHITE_DAY = "#2f2f31";
const GRAPHITE_NIGHT = "#47474b";
const WINE_DAY = "#421015";
const WINE_NIGHT = "#5a1119";

function colors(bodyHex: string, bgHex: string, pocketAmount: number): StyleColors {
  return { body: hexToRgb01(bodyHex), bg: hexToRgb01(bgHex), bodyHex, bgHex, pocketAmount };
}

/** Resolve a style + lab theme into shader colors. Plain Black / Plain White
    define their own ground; the rest respect the lab day/night theme. */
export function styleColors(style: OrganismStyleId, theme: LabTheme): StyleColors {
  const night = theme === "night";
  switch (style) {
    case "cellular-reverse":
      return night ? colors(BONE, NIGHT, 1) : colors(INK_BLACK, CREAM, 1);
    case "plain-black":
      return colors(TRUE_BLACK, CREAM, 0);
    case "plain-white":
      return colors(WHITE_BODY, DEEP_GROUND, 0);
    case "graphite":
      return night ? colors(GRAPHITE_NIGHT, NIGHT, 0) : colors(GRAPHITE_DAY, CREAM, 0);
    case "wine":
      return night ? colors(WINE_NIGHT, NIGHT, 0) : colors(WINE_DAY, CREAM, 0);
    case "auto":
      return night ? colors(BONE, NIGHT, 0) : colors(INK_BLACK, CREAM, 0);
  }
}

/** Panels must stay legible on whichever ground the style forces. */
export function uiToneForBg(bg: StyleColors["bg"]): LabTheme {
  const luminance = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
  return luminance > 0.5 ? "day" : "night";
}
