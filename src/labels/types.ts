import type { LabelScaleMode } from "../types";

export const CELL_LABEL_LAYOUT_IDS = [
  "architectural-stack",
  "area-hero",
  "name-hero",
  "editorial-split",
  "minimal",
  "compact-technical",
  "arc",
  "ring-lite",
  "side-flag",
  "lollipop",
  "radial-flag",
] as const;

export type CellLabelLayoutId = typeof CELL_LABEL_LAYOUT_IDS[number];
export type CellLabelLayoutFamily = "inside" | "perimeter" | "flag";
export type CellLabelTypeSystemId =
  | "architectural"
  | "editorial"
  | "technical"
  | "data"
  | "minimal"
  | "poster";
export type TextFontRole = "sans" | "serif" | "mono" | "condensed" | "display";
export type TextCaseMode = "original" | "uppercase" | "lowercase" | "title";
export type TextHorizontalAlign = "left" | "center" | "right";
export type TextVerticalAlign = "top" | "middle" | "bottom";
export type TextTokenColourMode = "auto" | "custom";
export type CellLabelDensityMode = "adaptive" | "full" | "compact";

export interface TextTokenStyle {
  visible: boolean;
  fontRole: TextFontRole;
  size: number;
  weight: number;
  italic: boolean;
  caseMode: TextCaseMode;
  letterSpacing: number;
  lineHeight: number;
  horizontalAlign: TextHorizontalAlign;
  verticalAlign: TextVerticalAlign;
  colourMode: TextTokenColourMode;
  colour: string;
  anchorX: number;
  anchorY: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  maxWidth: number;
  maxLines: number;
}

export interface AreaTokenStyle extends TextTokenStyle {
  showUnit: boolean;
  unit: "m²" | "ft²";
  decimals: 0 | 1 | 2;
  unitScale: number;
  unitPosition: "inline" | "superscript" | "below";
}

export interface FlagSettings {
  enabled: boolean;
  direction:
    | "auto"
    | "top"
    | "top-right"
    | "right"
    | "bottom-right"
    | "bottom"
    | "bottom-left"
    | "left"
    | "top-left";
  leaderStyle: "straight" | "elbow" | "radial" | "vertical-lollipop" | "horizontal-lollipop";
  distance: number;
  angle: number;
  offsetX: number;
  offsetY: number;
  justification: TextHorizontalAlign;
  verticalAlignment: TextVerticalAlign;
  endpoint: "none" | "dot" | "square" | "tick";
  background: "none" | "quiet" | "outline";
  collisionAvoidance: boolean;
}

export interface CellLabelSettings {
  schemaVersion: 1;
  layoutId: CellLabelLayoutId;
  typeSystemId: CellLabelTypeSystemId;
  scaleMode: LabelScaleMode;
  overallScale: number;
  autoFit: boolean;
  densityMode: CellLabelDensityMode;
  serial: TextTokenStyle;
  name: TextTokenStyle;
  area: AreaTokenStyle;
  body: TextTokenStyle;
  flag: FlagSettings;
}

export interface CellLabelLayoutDefinition {
  id: CellLabelLayoutId;
  name: string;
  family: CellLabelLayoutFamily;
  description: string;
  supports: {
    serial: boolean;
    name: boolean;
    area: boolean;
    body: boolean;
    symbol: boolean;
    arcText: boolean;
    flag: boolean;
  };
}
