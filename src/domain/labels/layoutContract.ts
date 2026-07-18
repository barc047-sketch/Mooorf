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

export interface RingLabelOptions {
  /** Text-path radius as a ratio of the Cell radius. */
  radiusRatio: number;
  /** Centre angle of the text arc; 0 = top, positive = clockwise. */
  startAngleDeg: number;
  /** Additional tracking along the arc, in em. */
  spacingEm: number;
}

export const FLAG_DIRECTIONS = ["auto", "above", "below", "left", "right"] as const;
export type FlagDirection = typeof FLAG_DIRECTIONS[number];

export const FLAG_ALIGNMENTS = ["start", "centre", "end"] as const;
export type FlagAlignment = typeof FLAG_ALIGNMENTS[number];

export interface FlagLabelOptions {
  direction: FlagDirection;
  /** Leader length from the Cell edge to the panel, world units. */
  distance: number;
  /** Panel width, world units. */
  width: number;
  align: FlagAlignment;
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
};

export const DEFAULT_FLAG_LABEL_OPTIONS: FlagLabelOptions = {
  direction: "auto",
  distance: 46,
  width: 120,
  align: "start",
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

export const FLAG_LABEL_BOUNDS = {
  distance: [12, 200],
  width: [40, 280],
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
  const ring = isRecord(value.ring)
    ? compact({
        radiusRatio: boundedNumber(value.ring.radiusRatio, RING_LABEL_BOUNDS.radiusRatio),
        startAngleDeg: boundedNumber(value.ring.startAngleDeg, RING_LABEL_BOUNDS.startAngleDeg),
        spacingEm: boundedNumber(value.ring.spacingEm, RING_LABEL_BOUNDS.spacingEm),
      })
    : undefined;
  const flag = isRecord(value.flag)
    ? compact({
        direction: oneOf(value.flag.direction, FLAG_DIRECTIONS),
        distance: boundedNumber(value.flag.distance, FLAG_LABEL_BOUNDS.distance),
        width: boundedNumber(value.flag.width, FLAG_LABEL_BOUNDS.width),
        align: oneOf(value.flag.align, FLAG_ALIGNMENTS),
      })
    : undefined;
  return compact({
    layout: oneOf(value.layout, CELL_LABEL_LAYOUT_IDS),
    roles,
    area,
    body,
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
    ring: compact({ ...(base?.ring ?? {}), ...(patch?.ring ?? {}) } as Record<string, unknown>) as CellLabelConfig["ring"],
    flag: compact({ ...(base?.flag ?? {}), ...(patch?.flag ?? {}) } as Record<string, unknown>) as CellLabelConfig["flag"],
    minimalSource: patch?.minimalSource ?? base?.minimalSource,
  };
  return compact(merged as Record<string, unknown>) as CellLabelConfig | undefined;
};

export const cloneCellLabelConfig = (value: CellLabelConfig | undefined): CellLabelConfig | undefined =>
  value ? (structuredClone(value) as CellLabelConfig) : undefined;
