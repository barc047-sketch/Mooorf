import {
  type CellLabelConfig,
  type CellLabelLayoutId,
  type LabelRoleId,
  type LabelRoleStyle,
  DEFAULT_AREA_LABEL_OPTIONS,
  DEFAULT_BODY_LABEL_OPTIONS,
  DEFAULT_CELL_LABEL_LAYOUT,
  DEFAULT_FLAG_LABEL_OPTIONS,
  DEFAULT_MINIMAL_NUMBER_SOURCE,
  DEFAULT_RING_LABEL_OPTIONS,
  LABEL_ROLE_IDS,
  mergeCellLabelConfig,
  normalizeCellLabelConfig,
} from "./layoutContract";

/* Registry data only. Preset seeds are never persisted; project defaults and
   Cell overrides store sparse deviations on top of these. */

/** Shared baseline every role starts from before preset/default/override merges. */
export const BASE_LABEL_ROLE_STYLES: Record<LabelRoleId, LabelRoleStyle> = {
  no: {
    visible: false,
    fontFamily: "mono",
    weight: "semibold",
    italic: false,
    size: 0.6,
    lineHeight: 1.1,
    letterSpacing: 0.1,
    textCase: "original",
    align: "centre",
    colourMode: "auto",
    colour: "#171715",
    opacity: 0.72,
    maxLines: 1,
    overflow: "truncate",
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    hideBelowZoom: 0,
    scaleMode: "inherit",
  },
  name: {
    visible: true,
    fontFamily: "primary",
    weight: "semibold",
    italic: false,
    size: 1,
    lineHeight: 1.12,
    letterSpacing: 0.02,
    textCase: "original",
    align: "centre",
    colourMode: "auto",
    colour: "#171715",
    opacity: 1,
    maxLines: 2,
    overflow: "wrap",
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    hideBelowZoom: 0,
    scaleMode: "inherit",
  },
  areaNumber: {
    visible: true,
    fontFamily: "primary",
    weight: "semibold",
    italic: false,
    size: 0.68,
    lineHeight: 1.05,
    letterSpacing: 0.05,
    textCase: "original",
    align: "centre",
    colourMode: "auto",
    colour: "#171715",
    opacity: 0.74,
    maxLines: 1,
    overflow: "truncate",
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    hideBelowZoom: 0,
    scaleMode: "inherit",
  },
  areaUnit: {
    visible: true,
    fontFamily: "primary",
    weight: "medium",
    italic: false,
    size: 0.5,
    lineHeight: 1.05,
    letterSpacing: 0.06,
    textCase: "original",
    align: "centre",
    colourMode: "auto",
    colour: "#171715",
    opacity: 0.6,
    maxLines: 1,
    overflow: "truncate",
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    hideBelowZoom: 0,
    scaleMode: "inherit",
  },
  body: {
    visible: true,
    fontFamily: "primary",
    weight: "regular",
    italic: false,
    size: 0.62,
    lineHeight: 1.26,
    letterSpacing: 0.015,
    textCase: "original",
    align: "centre",
    colourMode: "auto",
    colour: "#171715",
    opacity: 0.82,
    maxLines: 3,
    overflow: "wrap",
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    hideBelowZoom: 0.45,
    scaleMode: "inherit",
  },
  metadata: {
    visible: false,
    fontFamily: "mono",
    weight: "medium",
    italic: false,
    size: 0.48,
    lineHeight: 1.15,
    letterSpacing: 0.09,
    textCase: "uppercase",
    align: "centre",
    colourMode: "auto",
    colour: "#171715",
    opacity: 0.58,
    maxLines: 1,
    overflow: "truncate",
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    hideBelowZoom: 0.6,
    scaleMode: "inherit",
  },
};

/** Editorial-glass thumbnail glyph vocabulary rendered by the Inspector. */
export interface LabelPresetThumbGlyph {
  kind: "bar" | "dot" | "ring" | "stem";
  x: number;
  y: number;
  w?: number;
  h?: number;
  r?: number;
  emphasis?: boolean;
}

export interface CellLabelPresetDefinition {
  id: CellLabelLayoutId;
  label: string;
  description: string;
  /** Sparse deviations from BASE_LABEL_ROLE_STYLES for this composition. */
  seed: CellLabelConfig;
  thumbnail: readonly LabelPresetThumbGlyph[];
}

export const CELL_LABEL_PRESETS: readonly CellLabelPresetDefinition[] = [
  {
    id: "centre-stack",
    label: "Centre Stack",
    description: "Name, Area and Body in one balanced central composition.",
    seed: {},
    thumbnail: [
      { kind: "bar", x: 10, y: 15, w: 16, h: 3.4, emphasis: true },
      { kind: "bar", x: 13, y: 20.4, w: 10, h: 2 },
      { kind: "bar", x: 11.5, y: 24, w: 13, h: 1.4 },
      { kind: "bar", x: 12.5, y: 26.4, w: 11, h: 1.4 },
    ],
  },
  {
    id: "area-hero",
    label: "Area Hero",
    description: "Area dominates as the numeric hero; Name supports it.",
    seed: {
      roles: {
        areaNumber: { size: 2.1, weight: "black", opacity: 1, letterSpacing: -0.015 },
        areaUnit: { size: 0.62, opacity: 0.66 },
        name: { size: 0.66, weight: "semibold", letterSpacing: 0.1, textCase: "uppercase", opacity: 0.78 },
        body: { visible: false },
      },
    },
    thumbnail: [
      { kind: "bar", x: 12.5, y: 11.4, w: 11, h: 1.8 },
      { kind: "bar", x: 8.5, y: 15.6, w: 19, h: 7.4, emphasis: true },
      { kind: "bar", x: 14, y: 25.4, w: 8, h: 1.6 },
    ],
  },
  {
    id: "name-hero",
    label: "Name Hero",
    description: "Name dominates; Area steps back to a technical secondary.",
    seed: {
      roles: {
        name: { size: 1.5, weight: "bold", maxLines: 2, letterSpacing: -0.01 },
        areaNumber: { size: 0.56, letterSpacing: 0.08 },
        areaUnit: { size: 0.44 },
        body: { visible: false },
      },
    },
    thumbnail: [
      { kind: "bar", x: 8.5, y: 13.4, w: 19, h: 5.6, emphasis: true },
      { kind: "bar", x: 12.5, y: 21.6, w: 11, h: 1.8 },
    ],
  },
  {
    id: "split",
    label: "Split",
    description: "Name and Area hold separate horizontal zones.",
    seed: {
      roles: {
        name: { align: "left", maxLines: 1, overflow: "truncate" },
        areaNumber: { align: "right", size: 0.9, weight: "bold" },
        areaUnit: { align: "right" },
        body: { visible: false },
      },
    },
    thumbnail: [
      { kind: "bar", x: 7.5, y: 13, w: 12, h: 3, emphasis: true },
      { kind: "bar", x: 18.5, y: 22.6, w: 10, h: 2.6 },
      { kind: "bar", x: 7.5, y: 18.6, w: 21, h: 0.6 },
    ],
  },
  {
    id: "symbol-text",
    label: "Symbol + Text",
    description: "The production Symbol keeps the upper field; text sits below.",
    seed: {
      roles: {
        name: { size: 0.9 },
        areaNumber: { size: 0.6 },
        body: { visible: false },
      },
    },
    thumbnail: [
      { kind: "dot", x: 18, y: 13.4, r: 4.4, emphasis: true },
      { kind: "bar", x: 11, y: 21.4, w: 14, h: 2.6 },
      { kind: "bar", x: 13.5, y: 25.6, w: 9, h: 1.6 },
    ],
  },
  {
    id: "compact-technical",
    label: "Compact Technical",
    description: "Stable Space No., Name and Area as a disciplined index row.",
    seed: {
      roles: {
        no: { visible: true, size: 0.56, letterSpacing: 0.14 },
        name: { align: "left", size: 0.82, weight: "semibold", maxLines: 1 },
        areaNumber: { align: "left", size: 0.56, fontFamily: "mono" },
        areaUnit: { align: "left", size: 0.46, fontFamily: "mono" },
        body: { visible: false },
        metadata: { visible: true, align: "left" },
      },
    },
    thumbnail: [
      { kind: "bar", x: 7.5, y: 10.6, w: 5, h: 1.8, emphasis: true },
      { kind: "bar", x: 7.5, y: 14.4, w: 15, h: 2.6 },
      { kind: "bar", x: 7.5, y: 19, w: 10, h: 1.6 },
      { kind: "bar", x: 7.5, y: 22.4, w: 13, h: 1.4 },
    ],
  },
  {
    id: "ring",
    label: "Ring Label",
    description: "Name follows the outer ring; Area stays readable inside.",
    seed: {
      roles: {
        name: { letterSpacing: 0.12, textCase: "uppercase", size: 0.72, weight: "semibold" },
        areaNumber: { size: 1.15, weight: "bold", opacity: 1 },
        areaUnit: { size: 0.52 },
        body: { visible: false },
      },
    },
    thumbnail: [
      { kind: "ring", x: 18, y: 18, r: 11.4, emphasis: true },
      { kind: "bar", x: 13, y: 16.6, w: 10, h: 3 },
    ],
  },
  {
    id: "minimal-number",
    label: "Minimal Number",
    description: "One clean number; full content stays in Table and Inspector.",
    seed: {
      roles: {
        name: { visible: false },
        areaNumber: { size: 1.7, weight: "bold", opacity: 1 },
        areaUnit: { visible: false },
        body: { visible: false },
      },
    },
    thumbnail: [
      { kind: "bar", x: 12, y: 14.8, w: 12, h: 6.4, emphasis: true },
    ],
  },
  {
    id: "flag",
    label: "Flag",
    description: "A leader stem carries a compact label panel beside the Cell.",
    seed: {
      roles: {
        name: { align: "left", size: 0.82, maxLines: 1 },
        areaNumber: { align: "left", size: 0.56 },
        areaUnit: { align: "left", size: 0.46 },
        body: { visible: false },
      },
    },
    thumbnail: [
      { kind: "dot", x: 12.4, y: 21.6, r: 6.4 },
      { kind: "stem", x: 17, y: 17, w: 7, h: -5 },
      { kind: "bar", x: 24, y: 8.4, w: 8, h: 2.4, emphasis: true },
      { kind: "bar", x: 24, y: 12, w: 5.6, h: 1.4 },
    ],
  },
];

export const cellLabelPreset = (id: CellLabelLayoutId): CellLabelPresetDefinition =>
  CELL_LABEL_PRESETS.find((preset) => preset.id === id) ?? CELL_LABEL_PRESETS[0];

/** Effective role style after preset seed → project default → override merge.
 * `config` must already contain the defaults/override merge. */
export const resolveEffectiveRoleStyle = (
  layout: CellLabelLayoutId,
  role: LabelRoleId,
  config: CellLabelConfig | undefined
): LabelRoleStyle => {
  const seed = cellLabelPreset(layout).seed.roles?.[role];
  const patch = config?.roles?.[role];
  return { ...BASE_LABEL_ROLE_STYLES[role], ...seed, ...patch };
};

/** Effective sparse config with the preset seed folded underneath. */
export const resolveEffectiveLabelConfig = (config: CellLabelConfig | undefined): CellLabelConfig => {
  const layout = config?.layout ?? DEFAULT_CELL_LABEL_LAYOUT;
  return mergeCellLabelConfig(cellLabelPreset(layout).seed, config) ?? {};
};

const difference = (
  value: Record<string, unknown> | undefined,
  inherited: Record<string, unknown>
): Record<string, unknown> | undefined => {
  if (!value) return undefined;
  const entries = Object.entries(value).filter(([key, item]) => !Object.is(item, inherited[key]));
  return entries.length ? Object.fromEntries(entries) : undefined;
};

/** Reduces a Cell's normalized label config to deviations from the effective
 * preset + Project Default projection. Project Defaults remain independently
 * sparse over preset data; Cells never persist values they merely inherit. */
export const sparsifyCellLabelOverride = (
  value: CellLabelConfig | undefined,
  projectDefaults: CellLabelConfig | undefined
): CellLabelConfig | undefined => {
  const normalized = normalizeCellLabelConfig(value);
  if (!normalized) return undefined;
  const defaults = normalizeCellLabelConfig(projectDefaults);
  const layout = normalized.layout ?? defaults?.layout ?? DEFAULT_CELL_LABEL_LAYOUT;
  const inheritedForLayout = mergeCellLabelConfig(defaults, { layout });
  const roles: Partial<Record<LabelRoleId, Record<string, unknown>>> = {};
  for (const role of LABEL_ROLE_IDS) {
    const patch = normalized.roles?.[role] as Record<string, unknown> | undefined;
    const inherited = resolveEffectiveRoleStyle(layout, role, inheritedForLayout) as unknown as Record<string, unknown>;
    const sparse = difference(patch, inherited);
    if (sparse) roles[role] = sparse;
  }
  const area = difference(
    normalized.area as Record<string, unknown> | undefined,
    { ...DEFAULT_AREA_LABEL_OPTIONS, ...defaults?.area }
  );
  const body = difference(
    normalized.body as Record<string, unknown> | undefined,
    { ...DEFAULT_BODY_LABEL_OPTIONS, ...defaults?.body }
  );
  const ring = difference(
    normalized.ring as Record<string, unknown> | undefined,
    { ...DEFAULT_RING_LABEL_OPTIONS, ...defaults?.ring }
  );
  const flag = difference(
    normalized.flag as Record<string, unknown> | undefined,
    { ...DEFAULT_FLAG_LABEL_OPTIONS, ...defaults?.flag }
  );
  const sparse = normalizeCellLabelConfig({
    layout: normalized.layout !== (defaults?.layout ?? DEFAULT_CELL_LABEL_LAYOUT)
      ? normalized.layout
      : undefined,
    roles: Object.keys(roles).length ? roles : undefined,
    area,
    body,
    ring,
    flag,
    minimalSource: normalized.minimalSource !==
      (defaults?.minimalSource ?? DEFAULT_MINIMAL_NUMBER_SOURCE)
      ? normalized.minimalSource
      : undefined,
  });
  return sparse && Object.keys(sparse).length ? sparse : undefined;
};
