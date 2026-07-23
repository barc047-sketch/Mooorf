import type { Connection } from "../graph/types";
import type { RelationshipTypeDefinition } from "./relationshipTypes";
import type { ResolvedConnectionStyle } from "./styles";

export type RelationshipLegendLayoutMode = "auto" | "horizontal" | "vertical";
export type RelationshipLegendDensity = "compact" | "standard" | "large";
export type RelationshipLegendScope = "all-active" | "used-only";
export type RelationshipLegendSpecimenLength = "short" | "standard" | "long";
export type RelationshipLegendSpecimenWeight = "legible" | "true";
export type RelationshipLegendTextAlign = "left" | "center" | "right";
export type RelationshipLegendTextPlacementX = "left" | "center" | "right";
export type RelationshipLegendTextPlacementY = "top" | "middle" | "bottom";

export interface RelationshipLegendConfig {
  layoutMode: RelationshipLegendLayoutMode;
  horizontalRows: number;
  density: RelationshipLegendDensity;
  specimenLength: RelationshipLegendSpecimenLength;
  specimenWeight: RelationshipLegendSpecimenWeight;
  /** Semantic text-column width for the detached Legend and future export. */
  textWidth: number;
  textAlign: RelationshipLegendTextAlign;
  textPlacementX: RelationshipLegendTextPlacementX;
  textPlacementY: RelationshipLegendTextPlacementY;
  scope: RelationshipLegendScope;
  showStyle: boolean;
  showName: boolean;
  showCode: boolean;
  showDescription: boolean;
}

export interface RelationshipLegendBounds {
  width: number;
  height: number;
}

export interface RelationshipLegendItemBounds extends RelationshipLegendBounds {
  x: number;
  y: number;
}

export interface RelationshipLegendItem {
  typeId: string;
  name: string;
  code: string;
  description: string;
  stylePreview: ResolvedConnectionStyle;
  row: number;
  column: number;
  bounds: RelationshipLegendItemBounds;
}

export interface RelationshipLegendLayout {
  mode: RelationshipLegendLayoutMode;
  columns: number;
  rows: number;
  itemWidth: number;
  itemHeight: number;
  minimumItemWidth: number;
  specimenLengthMinimum: number;
  specimenLengthMaximum: number;
  textWidth: number;
  gap: number;
  padding: number;
  contentWidth: number;
  contentHeight: number;
  requiredWidth: number;
  requiredHeight: number;
}

export interface RelationshipLegendProjection {
  layout: RelationshipLegendLayout;
  bounds: RelationshipLegendBounds;
  items: RelationshipLegendItem[];
}

export interface ProjectRelationshipLegendInput {
  types: readonly RelationshipTypeDefinition[];
  connections: readonly Pick<Connection, "semantic">[];
  config: RelationshipLegendConfig;
  bounds: RelationshipLegendBounds;
}

type DensityMetrics = {
  gap: number;
  idealItemWidth: number;
  minimumItemWidth: number;
  padding: number;
  rowHeight: number;
  itemGap: number;
};

const DENSITY_METRICS: Record<RelationshipLegendDensity, DensityMetrics> = {
  compact: {
    gap: 2,
    idealItemWidth: 216,
    minimumItemWidth: 128,
    padding: 6,
    rowHeight: 20,
    itemGap: 5,
  },
  standard: {
    gap: 3,
    idealItemWidth: 252,
    minimumItemWidth: 136,
    padding: 8,
    rowHeight: 24,
    itemGap: 7,
  },
  large: {
    gap: 4,
    idealItemWidth: 294,
    minimumItemWidth: 148,
    padding: 10,
    rowHeight: 30,
    itemGap: 9,
  },
};

const SPECIMEN_LENGTH_RANGES: Record<
  RelationshipLegendSpecimenLength,
  readonly [number, number]
> = {
  short: [70, 100],
  standard: [110, 160],
  long: [170, 240],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;

const boundedInteger = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;

const finiteDimension = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;

export const createDefaultRelationshipLegendConfig = (): RelationshipLegendConfig => ({
  layoutMode: "auto",
  horizontalRows: 4,
  density: "standard",
  specimenLength: "standard",
  specimenWeight: "legible",
  textWidth: 120,
  textAlign: "left",
  textPlacementX: "right",
  textPlacementY: "middle",
  scope: "all-active",
  showStyle: true,
  showName: true,
  showCode: false,
  showDescription: false,
});

export const normalizeRelationshipLegendConfig = (value: unknown): RelationshipLegendConfig => {
  const defaults = createDefaultRelationshipLegendConfig();
  if (!isRecord(value)) return defaults;
  const config: RelationshipLegendConfig = {
    layoutMode: oneOf<RelationshipLegendLayoutMode>(
      value.layoutMode,
      ["auto", "horizontal", "vertical"],
      defaults.layoutMode,
    ),
    horizontalRows: boundedInteger(value.horizontalRows, defaults.horizontalRows, 2, 6),
    density: oneOf<RelationshipLegendDensity>(
      value.density,
      ["compact", "standard", "large"],
      defaults.density,
    ),
    specimenLength: oneOf<RelationshipLegendSpecimenLength>(
      value.specimenLength,
      ["short", "standard", "long"],
      defaults.specimenLength,
    ),
    specimenWeight: oneOf<RelationshipLegendSpecimenWeight>(
      value.specimenWeight,
      ["legible", "true"],
      defaults.specimenWeight,
    ),
    textWidth: boundedInteger(value.textWidth, defaults.textWidth, 80, 320),
    textAlign: oneOf<RelationshipLegendTextAlign>(
      value.textAlign,
      ["left", "center", "right"],
      defaults.textAlign,
    ),
    textPlacementX: oneOf<RelationshipLegendTextPlacementX>(
      value.textPlacementX,
      ["left", "center", "right"],
      defaults.textPlacementX,
    ),
    textPlacementY: oneOf<RelationshipLegendTextPlacementY>(
      value.textPlacementY,
      ["top", "middle", "bottom"],
      defaults.textPlacementY,
    ),
    scope: oneOf<RelationshipLegendScope>(
      value.scope,
      ["all-active", "used-only"],
      defaults.scope,
    ),
    showStyle: typeof value.showStyle === "boolean" ? value.showStyle : defaults.showStyle,
    showName: typeof value.showName === "boolean" ? value.showName : defaults.showName,
    showCode: typeof value.showCode === "boolean" ? value.showCode : defaults.showCode,
    showDescription: typeof value.showDescription === "boolean"
      ? value.showDescription
      : defaults.showDescription,
  };
  if (!config.showName && !config.showCode) config.showName = true;
  return config;
};

const itemHeightFor = (
  metrics: DensityMetrics,
  config: RelationshipLegendConfig,
): number => metrics.rowHeight
  + (config.showCode && config.showName ? (config.density === "large" ? 11 : 9) : 0)
  + (config.showDescription ? (config.density === "compact" ? 18 : config.density === "large" ? 28 : 22) : 0);

export const resolveRelationshipLegendSpecimenStyle = (
  style: ResolvedConnectionStyle,
  weight: RelationshipLegendSpecimenWeight,
): ResolvedConnectionStyle => ({
  ...style,
  appearance: {
    ...style.appearance,
    width: weight === "legible"
      ? Math.max(1, style.appearance.width)
      : style.appearance.width,
  },
});

const availableColumns = (
  innerWidth: number,
  minimumItemWidth: number,
  gap: number,
  count: number,
): number => Math.max(
  1,
  Math.min(count || 1, Math.floor((innerWidth + gap) / (minimumItemWidth + gap)) || 1),
);

const autoColumns = ({
  count,
  gap,
  idealItemWidth,
  innerHeight,
  innerWidth,
  itemHeight,
  maximumColumns,
}: {
  count: number;
  gap: number;
  idealItemWidth: number;
  innerHeight: number;
  innerWidth: number;
  itemHeight: number;
  maximumColumns: number;
}): number => {
  if (count <= 1) return 1;
  const maximumRows = Math.max(1, Math.floor((innerHeight + gap) / (itemHeight + gap)) || 1);
  let bestColumns = 1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let columns = 1; columns <= maximumColumns; columns += 1) {
    const rows = Math.ceil(count / columns);
    const itemWidth = Math.max(1, (innerWidth - gap * (columns - 1)) / columns);
    const overflowRows = Math.max(0, rows - maximumRows);
    const widthPenalty = Math.abs(itemWidth - idealItemWidth) / idealItemWidth;
    const unusedPenalty = ((columns * rows) - count) / count;
    const score = overflowRows * 100 + widthPenalty + unusedPenalty * 0.2;
    if (score < bestScore) {
      bestScore = score;
      bestColumns = columns;
    }
  }
  return bestColumns;
};

/**
 * React-free, deterministic Legend composition for Manager, future Sheet and
 * authored export consumers. Canonical type records and resolved styles remain
 * inputs; the projection owns no duplicate semantic data or item positions.
 */
export const projectRelationshipLegend = ({
  bounds: rawBounds,
  config: rawConfig,
  connections,
  types,
}: ProjectRelationshipLegendInput): RelationshipLegendProjection => {
  const config = normalizeRelationshipLegendConfig(rawConfig);
  const bounds = {
    width: finiteDimension(rawBounds.width),
    height: finiteDimension(rawBounds.height),
  };
  const metrics = DENSITY_METRICS[config.density];
  const specimenLengthRange = SPECIMEN_LENGTH_RANGES[config.specimenLength];
  const hasText = config.showName || config.showCode || config.showDescription;
  const hasSpecimenAndText = config.showStyle && hasText;
  const minimumItemWidth = Math.max(
    metrics.minimumItemWidth,
    (config.showStyle ? specimenLengthRange[0] : 0)
      + (hasText ? config.textWidth : 0)
      + (hasSpecimenAndText ? metrics.itemGap : 0),
  );
  const idealItemWidth = Math.max(
    metrics.idealItemWidth,
    (config.showStyle ? specimenLengthRange[1] : 0)
      + (hasText ? config.textWidth : 0)
      + (hasSpecimenAndText ? metrics.itemGap : 0),
  );
  const itemHeight = itemHeightFor(metrics, config);
  const innerWidth = Math.max(0, bounds.width - metrics.padding * 2);
  const innerHeight = Math.max(0, bounds.height - metrics.padding * 2);
  const usedTypeIds = config.scope === "used-only"
    ? new Set(connections.map((connection) => connection.semantic.typeId))
    : null;
  const includedTypes = types.filter((type) =>
    !type.archived && (!usedTypeIds || usedTypeIds.has(type.id)));
  const maximumColumns = availableColumns(
    innerWidth,
    minimumItemWidth,
    metrics.gap,
    includedTypes.length,
  );

  let columns = 1;
  let rows = includedTypes.length > 0 ? 1 : 0;
  if (config.layoutMode === "horizontal") {
    rows = includedTypes.length > 0
      ? Math.min(includedTypes.length, config.horizontalRows)
      : 0;
    columns = rows > 0 ? Math.ceil(includedTypes.length / rows) : 1;
  } else {
    columns = config.layoutMode === "vertical"
      ? maximumColumns
      : autoColumns({
        count: includedTypes.length,
        gap: metrics.gap,
        idealItemWidth,
        innerHeight,
        innerWidth,
        itemHeight,
        maximumColumns,
      });
    rows = includedTypes.length > 0 ? Math.ceil(includedTypes.length / columns) : 0;
  }

  const itemWidth = columns > 0
    ? Math.max(
      minimumItemWidth,
      (innerWidth - metrics.gap * (columns - 1)) / columns,
    )
    : minimumItemWidth;
  const contentWidth = columns * itemWidth + Math.max(0, columns - 1) * metrics.gap;
  const contentHeight = rows * itemHeight + Math.max(0, rows - 1) * metrics.gap;
  const requiredWidth = contentWidth + metrics.padding * 2;
  const requiredHeight = contentHeight + metrics.padding * 2;
  const items = includedTypes.map<RelationshipLegendItem>((type, index) => {
    const row = config.layoutMode === "horizontal" ? index % rows : Math.floor(index / columns);
    const column = config.layoutMode === "horizontal" ? Math.floor(index / rows) : index % columns;
    return {
      typeId: type.id,
      name: type.name,
      code: type.shortCode,
      description: type.description,
      stylePreview: type.visualDefaults,
      row,
      column,
      bounds: {
        x: metrics.padding + column * (itemWidth + metrics.gap),
        y: metrics.padding + row * (itemHeight + metrics.gap),
        width: itemWidth,
        height: itemHeight,
      },
    };
  });

  return {
    layout: {
      mode: config.layoutMode,
      columns,
      rows,
      itemWidth,
      itemHeight,
      minimumItemWidth,
      specimenLengthMinimum: specimenLengthRange[0],
      specimenLengthMaximum: specimenLengthRange[1],
      textWidth: config.textWidth,
      gap: metrics.gap,
      padding: metrics.padding,
      contentWidth,
      contentHeight,
      requiredWidth,
      requiredHeight,
    },
    bounds,
    items,
  };
};
