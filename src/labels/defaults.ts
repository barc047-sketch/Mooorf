import type { AreaTokenStyle, CellLabelSettings, FlagSettings, TextTokenStyle } from "./types";

export const DEFAULT_TEXT_TOKEN_STYLE: TextTokenStyle = {
  visible: true,
  fontRole: "sans",
  size: 1,
  weight: 500,
  italic: false,
  caseMode: "original",
  letterSpacing: 0,
  lineHeight: 1.15,
  horizontalAlign: "center",
  verticalAlign: "middle",
  colourMode: "auto",
  colour: "#171715",
  anchorX: 0,
  anchorY: 0,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  maxWidth: 1.5,
  maxLines: 2,
};

export const DEFAULT_AREA_TOKEN_STYLE: AreaTokenStyle = {
  ...DEFAULT_TEXT_TOKEN_STYLE,
  size: 1.2,
  weight: 600,
  showUnit: true,
  unit: "m²",
  decimals: 0,
  unitScale: 0.45,
  unitPosition: "inline",
};

export const DEFAULT_FLAG_SETTINGS: FlagSettings = {
  enabled: false,
  direction: "auto",
  leaderStyle: "straight",
  distance: 32,
  angle: -45,
  offsetX: 0,
  offsetY: 0,
  justification: "left",
  verticalAlignment: "middle",
  endpoint: "dot",
  background: "none",
  collisionAvoidance: true,
};

export const DEFAULT_CELL_LABEL_SETTINGS: CellLabelSettings = {
  schemaVersion: 1,
  layoutId: "architectural-stack",
  typeSystemId: "architectural",
  scaleMode: "world",
  overallScale: 1,
  autoFit: true,
  densityMode: "adaptive",
  serial: {
    ...DEFAULT_TEXT_TOKEN_STYLE,
    size: 0.58,
    weight: 600,
    letterSpacing: 0.08,
    caseMode: "uppercase",
    maxLines: 1,
  },
  name: {
    ...DEFAULT_TEXT_TOKEN_STYLE,
    weight: 600,
    caseMode: "uppercase",
    letterSpacing: 0.04,
    maxLines: 2,
  },
  area: { ...DEFAULT_AREA_TOKEN_STYLE },
  body: {
    ...DEFAULT_TEXT_TOKEN_STYLE,
    size: 0.68,
    weight: 400,
    maxLines: 3,
  },
  flag: { ...DEFAULT_FLAG_SETTINGS },
};

export const cloneCellLabelSettings = (
  settings: CellLabelSettings = DEFAULT_CELL_LABEL_SETTINGS,
): CellLabelSettings => ({
  ...settings,
  serial: { ...settings.serial },
  name: { ...settings.name },
  area: { ...settings.area },
  body: { ...settings.body },
  flag: { ...settings.flag },
});
