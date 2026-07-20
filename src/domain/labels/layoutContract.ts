import type { LabelScaleMode } from "../../types";

/* Cell Text Layouts & Flag — canonical presentation contract.
   Everything here is presentation-only: it styles and arranges the existing
   No./Name/Area/Body/metadata content and never owns or duplicates it. */

export const CELL_LABEL_LAYOUT_IDS = [
  "centre-stack",
  "area-hero",
  "name-hero",
  "split",
  "symbol-text",
  "compact-technical",
  "ring",
  "minimal-number",
  "flag",
  "dual-ring",
  "ring-core",
  "technical-orbit",
] as const;

export type CellLabelLayoutId = typeof CELL_LABEL_LAYOUT_IDS[number];

export const LABEL_ROLE_IDS = ["no", "name", "areaNumber", "areaUnit", "body", "metadata"] as const;
export type LabelRoleId = typeof LABEL_ROLE_IDS[number];

export const LABEL_FONT_FAMILY_TOKENS = ["primary", "mono"] as const;
export type LabelFontFamilyToken = typeof LABEL_FONT_FAMILY_TOKENS[number];

/** Token-to-stack mapping shared by Canvas2D, DOM and future vector export. */
export const LABEL_FONT_FAMILY_CSS: Record<LabelFontFamilyToken, string> = {
  primary:
    '"Inter Tight", "Neue Haas Grotesk Display Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"Geist Mono", "SF Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace',
};

export const LABEL_WEIGHT_TOKENS = ["light", "regular", "medium", "semibold", "bold", "black"] as const;
export type LabelWeightToken = typeof LABEL_WEIGHT_TOKENS[number];

export const LABEL_WEIGHT_VALUES: Record<LabelWeightToken, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
};

export const LABEL_TEXT_CASES = ["original", "uppercase", "lowercase", "title"] as const;
export type LabelTextCase = typeof LABEL_TEXT_CASES[number];

export const LABEL_TEXT_ALIGNS = ["left", "centre", "right", "justify"] as const;
export type LabelTextAlign = typeof LABEL_TEXT_ALIGNS[number];

export type LabelOverflowMode = "wrap" | "truncate";
export type LabelColourModeToken = "auto" | "black" | "white" | "custom";
export type LabelRoleScaleMode = "inherit" | LabelScaleMode;

export interface LabelRoleStyle {
  visible: boolean;
  fontFamily: LabelFontFamilyToken;
  weight: LabelWeightToken;
  italic: boolean;
  /** Multiplier over the shared world base size; the coordinated Text Size
   * from the existing text system still multiplies on top. */
  size: number;
  lineHeight: number;
  /** em units. */
  letterSpacing: number;
  textCase: LabelTextCase;
  /** `justify` is accepted only for the Body role by the normalizer. */
  align: LabelTextAlign;
  colourMode: LabelColourModeToken;
  colour: string;
  opacity: number;
  maxLines: number;
  overflow: LabelOverflowMode;
  /** World units, applied inside the label's own scale mode. */
  offsetX: number;
  offsetY: number;
  rotation: number;
  /** Canvas zoom below which the role hides; 0 = never hides. */
  hideBelowZoom: number;
  /** `inherit` follows the project label scale mode (world by default). */
  scaleMode: LabelRoleScaleMode;
}

export type LabelRolePatch = Partial<LabelRoleStyle>;

export const AREA_UNIT_POSITIONS = ["after", "below"] as const;
export type AreaUnitPosition = typeof AREA_UNIT_POSITIONS[number];

export const AREA_PLACEMENT_REGIONS = ["auto", "centre", "top", "bottom"] as const;
export type AreaPlacementRegion = typeof AREA_PLACEMENT_REGIONS[number];

export interface AreaLabelOptions {
  showUnit: boolean;
  precision: number;
  unitPosition: AreaUnitPosition;
  region: AreaPlacementRegion;
}

export interface BodyLabelOptions {
  /** Paragraph width as a ratio of the Cell diameter. */
  paragraphWidth: number;
  /** Hide Body when the Cell lacks room instead of clipping content. */
  autoHide: boolean;
}

/** Shared authored project-default fit policy. This lives alongside the
 * canonical label composition rather than in a renderer-local zoom cache. */
export const LABEL_OVERFLOW_POLICIES = ["fit", "simplify", "hide"] as const;
export type LabelOverflowPolicy = typeof LABEL_OVERFLOW_POLICIES[number];

export interface LabelFitOptions {
  fitInsideCell: boolean;
  /** Portion of the visible Cell diameter labels may occupy (0.5–0.95). */
  maximumCellOccupancy: number;
  /** Screen-pixel guardrails for adaptive/readable label modes. */
  minimumReadableScreenSize: number;
  maximumScreenTextSize: number;
  /** Camera zoom gates. Zero means never hide by that global gate. */
  lowZoomBodyThreshold: number;
  lowZoomMetadataThreshold: number;
  hideAllLabelsBelow: number;
  overflowPolicy: LabelOverflowPolicy;
}

export const DEFAULT_LABEL_FIT_OPTIONS: LabelFitOptions = {
  fitInsideCell: true,
  maximumCellOccupancy: 0.82,
  minimumReadableScreenSize: 7,
  maximumScreenTextSize: 30,
  lowZoomBodyThreshold: 0.45,
  lowZoomMetadataThreshold: 0.6,
  hideAllLabelsBelow: 0,
  overflowPolicy: "fit",
};

export const LABEL_FIT_BOUNDS = {
  maximumCellOccupancy: [0.5, 0.95],
  minimumReadableScreenSize: [4, 20],
  maximumScreenTextSize: [10, 72],
  lowZoomThreshold: [0, 4],
} as const;

export const RING_ARC_SOURCES = ["off", "name", "body", "space-no", "space-no-name", "area", "metadata"] as const;
export type RingArcSource = typeof RING_ARC_SOURCES[number];

export const RING_ARC_DIRECTIONS = ["clockwise", "counter-clockwise"] as const;
export type RingArcDirection = typeof RING_ARC_DIRECTIONS[number];

export const RING_ARC_ORIENTATIONS = ["inside", "outside"] as const;
export type RingArcOrientation = typeof RING_ARC_ORIENTATIONS[number];

export const RING_LOW_ZOOM_BEHAVIOURS = ["preserve", "simplify", "hide"] as const;
export type RingLowZoomBehaviour = typeof RING_LOW_ZOOM_BEHAVIOURS[number];

/** Each Ring may compose two independently authored arcs. Source content is
 * always read from the existing Cell fields; no curved-text strings persist. */
export interface RingArcOptions {
  source: RingArcSource;
  radiusRatio: number;
  startAngleDeg: number;
  arcSpanDeg: number;
  direction: RingArcDirection;
  orientation: RingArcOrientation;
  /** Selects one of the existing role styles for this arc. */
  fontRole: LabelRoleId;
  trackingEm: number;
  opacity: number;
  maxChars: number;
  ellipsis: boolean;
  lowZoomPriority: number;
  readableFlip: boolean;
  offsetX: number;
  offsetY: number;
}

export interface RingLabelOptions {
  /** Legacy aliases retain old project files and normalize into primaryArc. */
  /** Text-path radius as a ratio of the Cell radius. */
  radiusRatio: number;
  /** Centre angle of the text arc; 0 = top, positive = clockwise. */
  startAngleDeg: number;
  /** Additional tracking along the arc, in em. */
  spacingEm: number;
  lowZoomBehavior: RingLowZoomBehaviour;
  /** Camera zoom below which Hide below threshold suppresses the whole Ring. */
  hideBelowZoom: number;
  primaryArc: Partial<RingArcOptions>;
  secondaryArc: Partial<RingArcOptions>;
}

export const FLAG_DIRECTIONS = ["auto", "above", "below", "left", "right", "custom"] as const;
export type FlagDirection = typeof FLAG_DIRECTIONS[number];

export const FLAG_ALIGNMENTS = ["start", "centre", "end"] as const;
export type FlagAlignment = typeof FLAG_ALIGNMENTS[number];

export const FLAG_LEADER_KINDS = ["straight", "elbow", "curved"] as const;
export type FlagLeaderKind = typeof FLAG_LEADER_KINDS[number];

export const FLAG_LINE_STYLES = ["solid", "dashed", "dotted"] as const;
export type FlagLineStyle = typeof FLAG_LINE_STYLES[number];

export const FLAG_ENDPOINTS = ["none", "dot", "bar", "arrow"] as const;
export type FlagEndpoint = typeof FLAG_ENDPOINTS[number];

export const FLAG_PANEL_BACKGROUNDS = ["none", "glass", "solid"] as const;
export type FlagPanelBackground = typeof FLAG_PANEL_BACKGROUNDS[number];

export const FLAG_ZOOM_MODES = ["world", "adaptive", "screen"] as const;
export type FlagZoomMode = typeof FLAG_ZOOM_MODES[number];

export interface FlagLabelOptions {
  direction: FlagDirection;
  anchorAngleDeg: number;
  /** Leader length from the Cell edge to the panel, world units. */
  distance: number;
  radialOffset: number;
  offsetX: number;
  offsetY: number;
  clampToFrame: boolean;
  avoidSourceCell: boolean;
  leader: FlagLeaderKind;
  lineThickness: number;
  lineOpacity: number;
  lineStyle: FlagLineStyle;
  elbowLength: number;
  curvature: number;
  endpoint: FlagEndpoint;
  autoWidth: boolean;
  /** Panel width, world units. */
  width: number;
  minimumWidth: number;
  maximumWidth: number;
  paddingX: number;
  paddingY: number;
  contentGap: number;
  cornerRadius: number;
  background: FlagPanelBackground;
  backgroundOpacity: number;
  border: boolean;
  borderThickness: number;
  borderOpacity: number;
  align: FlagAlignment;
  /** Includes the existing Cell Symbol as a compact marker when one is placed. */
  symbol: boolean;
  content: Partial<Record<LabelRoleId, boolean>>;
  contentOrder: LabelRoleId[];
  bodyLineClamp: number;
  compact: boolean;
  zoomMode: FlagZoomMode;
  minimumPanelScale: number;
  maximumPanelScale: number;
  hideBelowZoom: number;
  keepReadable: boolean;
}

export type MinimalNumberSource = "area" | "no";

/** Sparse by construction at every level: project defaults hold user
 * deviations from the preset seeds, Cell overrides hold deviations from the
 * project defaults. Registry preset data is never persisted. */
export interface CellLabelConfig {
  layout?: CellLabelLayoutId;
  roles?: Partial<Record<LabelRoleId, LabelRolePatch>>;
  area?: Partial<AreaLabelOptions>;
  body?: Partial<BodyLabelOptions>;
  fit?: Partial<LabelFitOptions>;
  ring?: Partial<RingLabelOptions>;
  flag?: Partial<FlagLabelOptions>;
  minimalSource?: MinimalNumberSource;
}

export const DEFAULT_CELL_LABEL_LAYOUT: CellLabelLayoutId = "centre-stack";

export const DEFAULT_AREA_LABEL_OPTIONS: AreaLabelOptions = {
  showUnit: true,
  precision: 0,
  unitPosition: "after",
  region: "auto",
};

export const DEFAULT_BODY_LABEL_OPTIONS: BodyLabelOptions = {
  paragraphWidth: 0.85,
  autoHide: true,
};

export const DEFAULT_RING_LABEL_OPTIONS: RingLabelOptions = {
  radiusRatio: 0.78,
  startAngleDeg: 0,
  spacingEm: 0.14,
  lowZoomBehavior: "preserve",
  hideBelowZoom: 0,
  primaryArc: {
    source: "name",
    radiusRatio: 0.78,
    startAngleDeg: 0,
    arcSpanDeg: 162,
    direction: "clockwise",
    orientation: "outside",
    fontRole: "name",
    trackingEm: 0.14,
    opacity: 1,
    maxChars: 72,
    ellipsis: true,
    lowZoomPriority: 1,
    readableFlip: true,
    offsetX: 0,
    offsetY: 0,
  },
  secondaryArc: {
    source: "off",
    radiusRatio: 0.58,
    startAngleDeg: 180,
    arcSpanDeg: 148,
    direction: "counter-clockwise",
    orientation: "inside",
    fontRole: "body",
    trackingEm: 0.02,
    opacity: 0.78,
    maxChars: 84,
    ellipsis: true,
    lowZoomPriority: 2,
    readableFlip: true,
    offsetX: 0,
    offsetY: 0,
  },
};

export const DEFAULT_FLAG_LABEL_OPTIONS: FlagLabelOptions = {
  direction: "auto",
  anchorAngleDeg: 0,
  distance: 46,
  radialOffset: 0,
  offsetX: 0,
  offsetY: 0,
  clampToFrame: true,
  avoidSourceCell: true,
  leader: "straight",
  lineThickness: 1,
  lineOpacity: 0.62,
  lineStyle: "solid",
  elbowLength: 22,
  curvature: 0.35,
  endpoint: "dot",
  autoWidth: true,
  width: 120,
  minimumWidth: 72,
  maximumWidth: 280,
  paddingX: 7,
  paddingY: 7,
  contentGap: 1.2,
  cornerRadius: 7,
  background: "glass",
  backgroundOpacity: 0.86,
  border: true,
  borderThickness: 1,
  borderOpacity: 0.48,
  align: "start",
  symbol: true,
  content: { no: true, name: true, areaNumber: true, areaUnit: true, body: false, metadata: true },
  contentOrder: ["no", "name", "areaNumber", "areaUnit", "body", "metadata"],
  bodyLineClamp: 2,
  compact: false,
  zoomMode: "world",
  minimumPanelScale: 0.55,
  maximumPanelScale: 1.35,
  hideBelowZoom: 0,
  keepReadable: true,
};

export const DEFAULT_MINIMAL_NUMBER_SOURCE: MinimalNumberSource = "area";

/** Shared world-unit base size; 11 preserves the pre-phase label metric. */
export const LABEL_BASE_SIZE_WORLD = 11;

/** Screen radius under which Ring and Split fall back to their compact form. */
export const LABEL_COMPACT_SCREEN_RADIUS = 34;

export interface LabelRoleBounds {
  size: readonly [number, number];
  lineHeight: readonly [number, number];
  letterSpacing: readonly [number, number];
  opacity: readonly [number, number];
  maxLines: readonly [number, number];
  offset: readonly [number, number];
  rotation: readonly [number, number];
  hideBelowZoom: readonly [number, number];
}

export const LABEL_ROLE_BOUNDS: LabelRoleBounds = {
  size: [0.3, 3.2],
  lineHeight: [0.85, 2],
  letterSpacing: [-0.06, 0.6],
  opacity: [0, 1],
  maxLines: [1, 6],
  offset: [-120, 120],
  rotation: [-180, 180],
  hideBelowZoom: [0, 4],
};

export const RING_LABEL_BOUNDS = {
  radiusRatio: [0.55, 1.2],
  startAngleDeg: [-180, 180],
  spacingEm: [0, 0.6],
} as const;

export const RING_ARC_BOUNDS = {
  radiusRatio: [0.32, 1.3],
  startAngleDeg: [-180, 180],
  arcSpanDeg: [36, 320],
  trackingEm: [-0.08, 0.6],
  opacity: [0, 1],
  maxChars: [4, 220],
  lowZoomPriority: [1, 9],
  offset: [-120, 120],
} as const;

export const FLAG_LABEL_BOUNDS = {
  distance: [12, 200],
  width: [40, 280],
  offset: [-240, 240],
  lineThickness: [0.5, 6],
  opacity: [0, 1],
  elbowLength: [0, 180],
  curvature: [0, 1],
  padding: [0, 40],
  contentGap: [0, 24],
  cornerRadius: [0, 40],
  panelScale: [0.35, 2.5],
  hideBelowZoom: [0, 4],
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clamp = (value: number, [minimum, maximum]: readonly [number, number]): number =>
  Math.min(maximum, Math.max(minimum, value));

const boundedNumber = (value: unknown, bounds: readonly [number, number]): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? clamp(value, bounds) : undefined;

const oneOf = <T extends string>(value: unknown, options: readonly T[]): T | undefined =>
  options.includes(value as T) ? (value as T) : undefined;

const boolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const hexColour = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const colour = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(colour) ? colour : undefined;
};

const compact = <T extends Record<string, unknown>>(value: T): T | undefined => {
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);
  return entries.length ? (Object.fromEntries(entries) as T) : undefined;
};

const normalizeRolePatch = (value: unknown, role: LabelRoleId): LabelRolePatch | undefined => {
  if (!isRecord(value)) return undefined;
  const align = oneOf(value.align, LABEL_TEXT_ALIGNS);
  return compact({
    visible: boolean(value.visible),
    fontFamily: oneOf(value.fontFamily, LABEL_FONT_FAMILY_TOKENS),
    weight: oneOf(value.weight, LABEL_WEIGHT_TOKENS),
    italic: boolean(value.italic),
    size: boundedNumber(value.size, LABEL_ROLE_BOUNDS.size),
    lineHeight: boundedNumber(value.lineHeight, LABEL_ROLE_BOUNDS.lineHeight),
    letterSpacing: boundedNumber(value.letterSpacing, LABEL_ROLE_BOUNDS.letterSpacing),
    textCase: oneOf(value.textCase, LABEL_TEXT_CASES),
    align: align === "justify" && role !== "body" ? undefined : align,
    colourMode: oneOf(value.colourMode, ["auto", "black", "white", "custom"] as const),
    colour: hexColour(value.colour),
    opacity: boundedNumber(value.opacity, LABEL_ROLE_BOUNDS.opacity),
    maxLines: (() => {
      const lines = boundedNumber(value.maxLines, LABEL_ROLE_BOUNDS.maxLines);
      return lines === undefined ? undefined : Math.round(lines);
    })(),
    overflow: oneOf(value.overflow, ["wrap", "truncate"] as const),
    offsetX: boundedNumber(value.offsetX, LABEL_ROLE_BOUNDS.offset),
    offsetY: boundedNumber(value.offsetY, LABEL_ROLE_BOUNDS.offset),
    rotation: boundedNumber(value.rotation, LABEL_ROLE_BOUNDS.rotation),
    hideBelowZoom: boundedNumber(value.hideBelowZoom, LABEL_ROLE_BOUNDS.hideBelowZoom),
    scaleMode: oneOf(value.scaleMode, ["inherit", "world", "adaptive", "screen"] as const),
  });
};

const integer = (value: unknown, bounds: readonly [number, number]): number | undefined => {
  const normalized = boundedNumber(value, bounds);
  return normalized === undefined ? undefined : Math.round(normalized);
};

const normalizeFitPatch = (value: unknown): Partial<LabelFitOptions> | undefined => {
  if (!isRecord(value)) return undefined;
  return compact({
    fitInsideCell: boolean(value.fitInsideCell),
    maximumCellOccupancy: boundedNumber(value.maximumCellOccupancy, LABEL_FIT_BOUNDS.maximumCellOccupancy),
    minimumReadableScreenSize: boundedNumber(value.minimumReadableScreenSize, LABEL_FIT_BOUNDS.minimumReadableScreenSize),
    maximumScreenTextSize: boundedNumber(value.maximumScreenTextSize, LABEL_FIT_BOUNDS.maximumScreenTextSize),
    lowZoomBodyThreshold: boundedNumber(value.lowZoomBodyThreshold, LABEL_FIT_BOUNDS.lowZoomThreshold),
    lowZoomMetadataThreshold: boundedNumber(value.lowZoomMetadataThreshold, LABEL_FIT_BOUNDS.lowZoomThreshold),
    hideAllLabelsBelow: boundedNumber(value.hideAllLabelsBelow, LABEL_FIT_BOUNDS.lowZoomThreshold),
    overflowPolicy: oneOf(value.overflowPolicy, LABEL_OVERFLOW_POLICIES),
  });
};

const normalizeRingArcPatch = (value: unknown): Partial<RingArcOptions> | undefined => {
  if (!isRecord(value)) return undefined;
  return compact({
    source: oneOf(value.source, RING_ARC_SOURCES),
    radiusRatio: boundedNumber(value.radiusRatio, RING_ARC_BOUNDS.radiusRatio),
    startAngleDeg: boundedNumber(value.startAngleDeg, RING_ARC_BOUNDS.startAngleDeg),
    arcSpanDeg: boundedNumber(value.arcSpanDeg, RING_ARC_BOUNDS.arcSpanDeg),
    direction: oneOf(value.direction, RING_ARC_DIRECTIONS),
    orientation: oneOf(value.orientation, RING_ARC_ORIENTATIONS),
    fontRole: oneOf(value.fontRole, LABEL_ROLE_IDS),
    trackingEm: boundedNumber(value.trackingEm, RING_ARC_BOUNDS.trackingEm),
    opacity: boundedNumber(value.opacity, RING_ARC_BOUNDS.opacity),
    maxChars: integer(value.maxChars, RING_ARC_BOUNDS.maxChars),
    ellipsis: boolean(value.ellipsis),
    lowZoomPriority: integer(value.lowZoomPriority, RING_ARC_BOUNDS.lowZoomPriority),
    readableFlip: boolean(value.readableFlip),
    offsetX: boundedNumber(value.offsetX, RING_ARC_BOUNDS.offset),
    offsetY: boundedNumber(value.offsetY, RING_ARC_BOUNDS.offset),
  });
};

const normalizeFlagContent = (value: unknown): Partial<Record<LabelRoleId, boolean>> | undefined => {
  if (!isRecord(value)) return undefined;
  return compact(Object.fromEntries(
    LABEL_ROLE_IDS.map((role) => [role, boolean(value[role])])
  ) as Partial<Record<LabelRoleId, boolean>>);
};

const normalizeContentOrder = (value: unknown): LabelRoleId[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<LabelRoleId>();
  const order = value.flatMap((candidate) => {
    const role = oneOf(candidate, LABEL_ROLE_IDS);
    if (!role || seen.has(role)) return [];
    seen.add(role);
    return [role];
  });
  return order.length ? order : undefined;
};

const normalizeFlagPatch = (value: unknown): Partial<FlagLabelOptions> | undefined => {
  if (!isRecord(value)) return undefined;
  const minimumPanelScale = boundedNumber(value.minimumPanelScale, FLAG_LABEL_BOUNDS.panelScale);
  const maximumPanelScale = boundedNumber(value.maximumPanelScale, FLAG_LABEL_BOUNDS.panelScale);
  return compact({
    direction: oneOf(value.direction, FLAG_DIRECTIONS),
    anchorAngleDeg: boundedNumber(value.anchorAngleDeg, RING_LABEL_BOUNDS.startAngleDeg),
    distance: boundedNumber(value.distance, FLAG_LABEL_BOUNDS.distance),
    radialOffset: boundedNumber(value.radialOffset, FLAG_LABEL_BOUNDS.offset),
    offsetX: boundedNumber(value.offsetX, FLAG_LABEL_BOUNDS.offset),
    offsetY: boundedNumber(value.offsetY, FLAG_LABEL_BOUNDS.offset),
    clampToFrame: boolean(value.clampToFrame),
    avoidSourceCell: boolean(value.avoidSourceCell),
    leader: oneOf(value.leader, FLAG_LEADER_KINDS),
    lineThickness: boundedNumber(value.lineThickness, FLAG_LABEL_BOUNDS.lineThickness),
    lineOpacity: boundedNumber(value.lineOpacity, FLAG_LABEL_BOUNDS.opacity),
    lineStyle: oneOf(value.lineStyle, FLAG_LINE_STYLES),
    elbowLength: boundedNumber(value.elbowLength, FLAG_LABEL_BOUNDS.elbowLength),
    curvature: boundedNumber(value.curvature, FLAG_LABEL_BOUNDS.curvature),
    endpoint: oneOf(value.endpoint, FLAG_ENDPOINTS),
    autoWidth: boolean(value.autoWidth),
    width: boundedNumber(value.width, FLAG_LABEL_BOUNDS.width),
    minimumWidth: boundedNumber(value.minimumWidth, FLAG_LABEL_BOUNDS.width),
    maximumWidth: boundedNumber(value.maximumWidth, FLAG_LABEL_BOUNDS.width),
    paddingX: boundedNumber(value.paddingX, FLAG_LABEL_BOUNDS.padding),
    paddingY: boundedNumber(value.paddingY, FLAG_LABEL_BOUNDS.padding),
    contentGap: boundedNumber(value.contentGap, FLAG_LABEL_BOUNDS.contentGap),
    cornerRadius: boundedNumber(value.cornerRadius, FLAG_LABEL_BOUNDS.cornerRadius),
    background: oneOf(value.background, FLAG_PANEL_BACKGROUNDS),
    backgroundOpacity: boundedNumber(value.backgroundOpacity, FLAG_LABEL_BOUNDS.opacity),
    border: boolean(value.border),
    borderThickness: boundedNumber(value.borderThickness, FLAG_LABEL_BOUNDS.lineThickness),
    borderOpacity: boundedNumber(value.borderOpacity, FLAG_LABEL_BOUNDS.opacity),
    align: oneOf(value.align, FLAG_ALIGNMENTS),
    symbol: boolean(value.symbol),
    content: normalizeFlagContent(value.content),
    contentOrder: normalizeContentOrder(value.contentOrder),
    bodyLineClamp: integer(value.bodyLineClamp, LABEL_ROLE_BOUNDS.maxLines),
    compact: boolean(value.compact),
    zoomMode: oneOf(value.zoomMode, FLAG_ZOOM_MODES),
    minimumPanelScale: minimumPanelScale !== undefined && maximumPanelScale !== undefined
      ? Math.min(minimumPanelScale, maximumPanelScale)
      : minimumPanelScale,
    maximumPanelScale: minimumPanelScale !== undefined && maximumPanelScale !== undefined
      ? Math.max(minimumPanelScale, maximumPanelScale)
      : maximumPanelScale,
    hideBelowZoom: boundedNumber(value.hideBelowZoom, FLAG_LABEL_BOUNDS.hideBelowZoom),
    keepReadable: boolean(value.keepReadable),
  });
};

/** Bounded sparse normalization shared by project defaults, Cell overrides,
 * persistence and import. Unknown fields and layouts are discarded. */
export const normalizeCellLabelConfig = (value: unknown): CellLabelConfig | undefined => {
  if (!isRecord(value)) return undefined;
  const roles = isRecord(value.roles)
    ? compact(
        Object.fromEntries(
          LABEL_ROLE_IDS.map((role) => [role, normalizeRolePatch(value.roles && (value.roles as Record<string, unknown>)[role], role)])
        ) as Partial<Record<LabelRoleId, LabelRolePatch>>
      )
    : undefined;
  const area = isRecord(value.area)
    ? compact({
        showUnit: boolean(value.area.showUnit),
        precision: (() => {
          const precision = boundedNumber(value.area.precision, [0, 2]);
          return precision === undefined ? undefined : Math.round(precision);
        })(),
        unitPosition: oneOf(value.area.unitPosition, AREA_UNIT_POSITIONS),
        region: oneOf(value.area.region, AREA_PLACEMENT_REGIONS),
      })
    : undefined;
  const body = isRecord(value.body)
    ? compact({
        paragraphWidth: boundedNumber(value.body.paragraphWidth, [0.4, 2]),
        autoHide: boolean(value.body.autoHide),
      })
    : undefined;
  const fit = normalizeFitPatch(value.fit);
  const ring = isRecord(value.ring)
    ? compact({
        radiusRatio: boundedNumber(value.ring.radiusRatio, RING_LABEL_BOUNDS.radiusRatio),
        startAngleDeg: boundedNumber(value.ring.startAngleDeg, RING_LABEL_BOUNDS.startAngleDeg),
        spacingEm: boundedNumber(value.ring.spacingEm, RING_LABEL_BOUNDS.spacingEm),
        lowZoomBehavior: oneOf(value.ring.lowZoomBehavior, RING_LOW_ZOOM_BEHAVIOURS),
        hideBelowZoom: boundedNumber(value.ring.hideBelowZoom, LABEL_FIT_BOUNDS.lowZoomThreshold),
        primaryArc: normalizeRingArcPatch(value.ring.primaryArc),
        secondaryArc: normalizeRingArcPatch(value.ring.secondaryArc),
      })
    : undefined;
  const flag = normalizeFlagPatch(value.flag);
  return compact({
    layout: oneOf(value.layout, CELL_LABEL_LAYOUT_IDS),
    roles,
    area,
    body,
    fit,
    ring,
    flag,
    minimalSource: oneOf(value.minimalSource, ["area", "no"] as const),
  });
};

const mergeRolePatches = (
  base: Partial<Record<LabelRoleId, LabelRolePatch>> | undefined,
  patch: Partial<Record<LabelRoleId, LabelRolePatch>> | undefined
): Partial<Record<LabelRoleId, LabelRolePatch>> | undefined => {
  if (!base && !patch) return undefined;
  const merged: Partial<Record<LabelRoleId, LabelRolePatch>> = {};
  for (const role of LABEL_ROLE_IDS) {
    const combined = compact({ ...(base?.[role] ?? {}), ...(patch?.[role] ?? {}) } as Record<string, unknown>);
    if (combined) merged[role] = combined as LabelRolePatch;
  }
  return Object.keys(merged).length ? merged : undefined;
};

/** Deep sparse merge: patch fields win, absent fields inherit. Used both for
 * defaults-over-preset and override-over-defaults resolution and for the
 * Inspector's incremental patches. */
export const mergeCellLabelConfig = (
  base: CellLabelConfig | undefined,
  patch: CellLabelConfig | undefined
): CellLabelConfig | undefined => {
  if (!base && !patch) return undefined;
  const merged: CellLabelConfig = {
    layout: patch?.layout ?? base?.layout,
    roles: mergeRolePatches(base?.roles, patch?.roles),
    area: compact({ ...(base?.area ?? {}), ...(patch?.area ?? {}) } as Record<string, unknown>) as CellLabelConfig["area"],
    body: compact({ ...(base?.body ?? {}), ...(patch?.body ?? {}) } as Record<string, unknown>) as CellLabelConfig["body"],
    fit: compact({ ...(base?.fit ?? {}), ...(patch?.fit ?? {}) } as Record<string, unknown>) as CellLabelConfig["fit"],
    ring: compact({
      ...(base?.ring ?? {}),
      ...(patch?.ring ?? {}),
      primaryArc: compact({ ...(base?.ring?.primaryArc ?? {}), ...(patch?.ring?.primaryArc ?? {}) }),
      secondaryArc: compact({ ...(base?.ring?.secondaryArc ?? {}), ...(patch?.ring?.secondaryArc ?? {}) }),
    } as Record<string, unknown>) as CellLabelConfig["ring"],
    flag: compact({
      ...(base?.flag ?? {}),
      ...(patch?.flag ?? {}),
      content: compact({ ...(base?.flag?.content ?? {}), ...(patch?.flag?.content ?? {}) }),
    } as Record<string, unknown>) as CellLabelConfig["flag"],
    minimalSource: patch?.minimalSource ?? base?.minimalSource,
  };
  return compact(merged as Record<string, unknown>) as CellLabelConfig | undefined;
};

export const cloneCellLabelConfig = (value: CellLabelConfig | undefined): CellLabelConfig | undefined =>
  value ? (structuredClone(value) as CellLabelConfig) : undefined;
