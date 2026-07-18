import type { LabelScaleMode, SpaceCell } from "../../types";
import {
  type AreaLabelOptions,
  type BodyLabelOptions,
  type CellLabelConfig,
  type CellLabelLayoutId,
  type FlagAlignment,
  type FlagDirection,
  type FlagLabelOptions,
  type LabelColourModeToken,
  type LabelFontFamilyToken,
  type LabelOverflowMode,
  type LabelRoleId,
  type LabelRoleStyle,
  type LabelTextAlign,
  type MinimalNumberSource,
  type RingLabelOptions,
  DEFAULT_AREA_LABEL_OPTIONS,
  DEFAULT_BODY_LABEL_OPTIONS,
  DEFAULT_CELL_LABEL_LAYOUT,
  DEFAULT_FLAG_LABEL_OPTIONS,
  DEFAULT_MINIMAL_NUMBER_SOURCE,
  DEFAULT_RING_LABEL_OPTIONS,
  LABEL_BASE_SIZE_WORLD,
  LABEL_COMPACT_SCREEN_RADIUS,
  LABEL_WEIGHT_VALUES,
} from "./layoutContract";
import { resolveEffectiveRoleStyle } from "./presets";

/* One pure resolved projection shared by the Organism and Classic renderers
   (and later by export adapters). Output is zoom- and radius-independent:
   anchors live in unit-radius space, sizes and offsets in world units, so no
   store or cache has to be touched while panning or zooming. */

export interface ResolvedLabelFont {
  family: LabelFontFamilyToken;
  weight: number;
  italic: boolean;
  sizeWorld: number;
  lineHeight: number;
  letterSpacingEm: number;
}

export interface ResolvedLabelSegment {
  role: LabelRoleId;
  text: string;
  font: ResolvedLabelFont;
  opacity: number;
}

export interface ResolvedLabelBlock {
  id: string;
  role: LabelRoleId;
  /** Inline segments; single-segment for every role except the Area line. */
  segments: readonly ResolvedLabelSegment[];
  align: LabelTextAlign;
  colourMode: LabelColourModeToken;
  colour: string;
  opacity: number;
  /** Multiplied by the current cell radius at draw time. */
  anchorUnit: { x: number; y: number };
  /** World units, multiplied by the block's resolved label scale at draw time.
   * Includes both stack-flow position and authored offsets. */
  offsetWorld: { x: number; y: number };
  /** Authored X/Y offsets only — for renderers that flow blocks natively. */
  styleOffsetWorld: { x: number; y: number };
  rotationDeg: number;
  /** Wrap/truncate width as a ratio of the cell diameter (0 = unconstrained). */
  maxWidthRatio: number;
  maxLines: number;
  overflow: LabelOverflowMode;
  scaleMode: LabelScaleMode;
  hideBelowZoom: number;
  /** Room-based hiding candidate (Body-style bounded degradation). */
  autoHide: boolean;
  /** Estimated world-unit vertical extent used for flow and room checks. */
  estimatedHeightWorld: number;
}

export interface ResolvedRingLabel {
  text: string;
  font: ResolvedLabelFont;
  colourMode: LabelColourModeToken;
  colour: string;
  opacity: number;
  radiusRatio: number;
  /** Centre angle of the arc, 0 = top, positive clockwise. */
  startAngleDeg: number;
  spacingEm: number;
  /** True when the arc centre sits in the lower semicircle, so glyphs run
   * counter-clockwise with flipped orientation and stay readable. */
  flipped: boolean;
  scaleMode: LabelScaleMode;
}

export interface ResolvedFlagLabel {
  direction: Exclude<FlagDirection, "auto">;
  requestedDirection: FlagDirection;
  distanceWorld: number;
  widthWorld: number;
  align: FlagAlignment;
  blocks: readonly ResolvedLabelBlock[];
  scaleMode: LabelScaleMode;
}

export interface ResolvedLabelDivider {
  /** Unit-radius vertical position of a hairline rule (Split layout). */
  yUnit: number;
  widthRatio: number;
}

export interface ResolvedCellLabelLayout {
  layout: CellLabelLayoutId;
  blocks: readonly ResolvedLabelBlock[];
  /** Compact replacements used when the on-screen cell is too small. */
  fallbackBlocks: readonly ResolvedLabelBlock[];
  ring: ResolvedRingLabel | null;
  flag: ResolvedFlagLabel | null;
  divider: ResolvedLabelDivider | null;
}

export interface CellLabelContentSource {
  spaceCode?: string;
  name: string;
  area: number;
  body?: string;
  category: string;
  privacy: string;
}

export interface CellLabelLayoutInput {
  space: CellLabelContentSource;
  /** Project-default + Cell-override merge (preset seeds join here). */
  config: CellLabelConfig | undefined;
  globalScaleMode: LabelScaleMode;
  /** Global text size multiplier from the existing coordinated text system. */
  textSize: number;
  /** Legacy annotation gates keep gating Name/Area/metadata until an explicit
   * role visibility is authored; they stay the single owner of those flags. */
  legacyVisibility: { showName: boolean; showArea: boolean; showMetadata: boolean };
  hasSymbol: boolean;
  /** Pre-resolved deterministic direction for `flag.direction === "auto"`. */
  flagAutoDirection?: Exclude<FlagDirection, "auto">;
}

const toTitleCase = (value: string): string =>
  value.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));

export const applyLabelTextCase = (value: string, textCase: LabelRoleStyle["textCase"]): string => {
  if (textCase === "uppercase") return value.toUpperCase();
  if (textCase === "lowercase") return value.toLowerCase();
  if (textCase === "title") return toTitleCase(value.toLowerCase());
  return value;
};

export const AREA_UNIT_TEXT = "m²";

export const formatAreaNumber = (area: number, precision: number): string =>
  Number.isFinite(area) ? area.toFixed(Math.min(2, Math.max(0, Math.round(precision)))) : "";

/** Deterministic auto placement: the dominant axis of the Cell relative to the
 * project reference (organism centroid). Never reads the camera. */
export const resolveFlagAutoDirection = (
  space: { x: number; y: number },
  reference: { x: number; y: number } | null
): Exclude<FlagDirection, "auto"> => {
  if (!reference) return "above";
  const dx = space.x - reference.x;
  const dy = space.y - reference.y;
  if (dx === 0 && dy === 0) return "above";
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "below" : "above";
};

const roleFont = (style: LabelRoleStyle, textSize: number): ResolvedLabelFont => ({
  family: style.fontFamily,
  weight: LABEL_WEIGHT_VALUES[style.weight],
  italic: style.italic,
  sizeWorld: LABEL_BASE_SIZE_WORLD * style.size * textSize,
  lineHeight: style.lineHeight,
  letterSpacingEm: style.letterSpacing,
});

const estimateLines = (text: string, font: ResolvedLabelFont, maxWidthRatio: number, maxLines: number): number => {
  if (maxLines <= 1 || maxWidthRatio <= 0) return 1;
  const referenceWidth = maxWidthRatio * 2 * 60; // nominal 60-world-unit radius
  const charsPerLine = Math.max(4, referenceWidth / (font.sizeWorld * 0.52));
  return Math.min(maxLines, Math.max(1, Math.ceil(text.length / charsPerLine)));
};

interface BlockSeed {
  id: string;
  role: LabelRoleId;
  segments: readonly ResolvedLabelSegment[];
  style: LabelRoleStyle;
  maxWidthRatio: number;
  autoHide?: boolean;
}

const makeBlock = (
  seed: BlockSeed,
  globalScaleMode: LabelScaleMode,
  anchorUnit: { x: number; y: number },
  offsetWorld: { x: number; y: number }
): ResolvedLabelBlock => {
  const { style } = seed;
  const primary = seed.segments[0];
  const text = seed.segments.map((segment) => segment.text).join(" ");
  const lines = style.overflow === "wrap"
    ? estimateLines(text, primary.font, seed.maxWidthRatio, style.maxLines)
    : 1;
  return {
    id: seed.id,
    role: seed.role,
    segments: seed.segments,
    align: style.align,
    colourMode: style.colourMode,
    colour: style.colour,
    opacity: style.opacity,
    anchorUnit,
    offsetWorld: { x: offsetWorld.x + style.offsetX, y: offsetWorld.y + style.offsetY },
    styleOffsetWorld: { x: style.offsetX, y: style.offsetY },
    rotationDeg: style.rotation,
    maxWidthRatio: seed.maxWidthRatio,
    maxLines: style.maxLines,
    overflow: style.overflow,
    scaleMode: style.scaleMode === "inherit" ? globalScaleMode : style.scaleMode,
    hideBelowZoom: style.hideBelowZoom,
    autoHide: seed.autoHide ?? false,
    estimatedHeightWorld: primary.font.sizeWorld * primary.font.lineHeight * lines,
  };
};

/** Stacks seeds vertically around a unit anchor, world-unit flow offsets. */
const stackBlocks = (
  seeds: readonly BlockSeed[],
  globalScaleMode: LabelScaleMode,
  anchorUnit: { x: number; y: number },
  gapWorld = 2
): ResolvedLabelBlock[] => {
  const blocks = seeds.map((seed) => makeBlock(seed, globalScaleMode, anchorUnit, { x: 0, y: 0 }));
  const totalHeight = blocks.reduce((sum, block) => sum + block.estimatedHeightWorld, 0)
    + gapWorld * Math.max(0, blocks.length - 1);
  let cursor = -totalHeight / 2;
  return blocks.map((block) => {
    const centred = cursor + block.estimatedHeightWorld / 2;
    cursor += block.estimatedHeightWorld + gapWorld;
    return { ...block, offsetWorld: { x: block.offsetWorld.x, y: block.offsetWorld.y + centred } };
  });
};

interface RoleResolution {
  style: LabelRoleStyle;
  visible: boolean;
}

const resolveRole = (
  layout: CellLabelLayoutId,
  role: LabelRoleId,
  config: CellLabelConfig | undefined,
  legacy: CellLabelLayoutInput["legacyVisibility"]
): RoleResolution => {
  const style = resolveEffectiveRoleStyle(layout, role, config);
  const authored = config?.roles?.[role]?.visible;
  let visible = style.visible;
  if (authored === undefined) {
    if ((role === "name") && !legacy.showName) visible = false;
    if ((role === "areaNumber" || role === "areaUnit") && !legacy.showArea) visible = false;
    if (role === "metadata" && !legacy.showMetadata) visible = false;
  }
  return { style, visible };
};

/** Inspector-facing truth for the Elements switches: authored visibility wins,
 * then the legacy annotation gates, then the preset seed. */
export const resolveEffectiveRoleVisibility = (
  layout: CellLabelLayoutId,
  role: LabelRoleId,
  config: CellLabelConfig | undefined,
  legacy: CellLabelLayoutInput["legacyVisibility"]
): boolean => resolveRole(layout, role, config, legacy).visible;

export const resolveCellLabelLayout = (input: CellLabelLayoutInput): ResolvedCellLabelLayout => {
  const config = input.config;
  const layout = config?.layout ?? DEFAULT_CELL_LABEL_LAYOUT;
  const area: AreaLabelOptions = { ...DEFAULT_AREA_LABEL_OPTIONS, ...config?.area };
  const bodyOptions: BodyLabelOptions = { ...DEFAULT_BODY_LABEL_OPTIONS, ...config?.body };
  const ringOptions: RingLabelOptions = { ...DEFAULT_RING_LABEL_OPTIONS, ...config?.ring };
  const flagOptions: FlagLabelOptions = { ...DEFAULT_FLAG_LABEL_OPTIONS, ...config?.flag };
  const minimalSource: MinimalNumberSource = config?.minimalSource ?? DEFAULT_MINIMAL_NUMBER_SOURCE;
  const scaleMode = input.globalScaleMode;

  const no = resolveRole(layout, "no", config, input.legacyVisibility);
  const name = resolveRole(layout, "name", config, input.legacyVisibility);
  const areaNumber = resolveRole(layout, "areaNumber", config, input.legacyVisibility);
  const areaUnit = resolveRole(layout, "areaUnit", config, input.legacyVisibility);
  const body = resolveRole(layout, "body", config, input.legacyVisibility);
  const metadata = resolveRole(layout, "metadata", config, input.legacyVisibility);

  const noText = applyLabelTextCase((input.space.spaceCode ?? "").trim(), no.style.textCase);
  const nameText = applyLabelTextCase(input.space.name.trim(), name.style.textCase);
  const areaNumberText = formatAreaNumber(input.space.area, area.precision);
  const bodyText = applyLabelTextCase((input.space.body ?? "").trim(), body.style.textCase);
  const metadataText = applyLabelTextCase(
    [input.space.category, input.space.privacy].filter(Boolean).join(" · "),
    metadata.style.textCase
  );

  const segment = (role: LabelRoleId, text: string, style: LabelRoleStyle): ResolvedLabelSegment => ({
    role,
    text,
    font: roleFont(style, input.textSize),
    opacity: style.opacity,
  });

  const noSeed = (): BlockSeed | null => (no.visible && noText ? {
    id: "no",
    role: "no",
    segments: [segment("no", noText, no.style)],
    style: no.style,
    maxWidthRatio: 0.85,
  } : null);

  const nameSeed = (): BlockSeed | null => (name.visible && nameText ? {
    id: "name",
    role: "name",
    segments: [segment("name", nameText, name.style)],
    style: name.style,
    maxWidthRatio: 0.85,
  } : null);

  /** Area line: number + optional unit segment; unit can also drop below. */
  const areaSeeds = (): BlockSeed[] => {
    if (!areaNumber.visible || !areaNumberText) return [];
    const showUnit = area.showUnit && areaUnit.visible;
    const inlineUnit = showUnit && area.unitPosition === "after";
    const numberSegments: ResolvedLabelSegment[] = [segment("areaNumber", areaNumberText, areaNumber.style)];
    if (inlineUnit) numberSegments.push(segment("areaUnit", AREA_UNIT_TEXT, areaUnit.style));
    const seeds: BlockSeed[] = [{
      id: "area",
      role: "areaNumber",
      segments: numberSegments,
      style: areaNumber.style,
      maxWidthRatio: 0.85,
    }];
    if (showUnit && area.unitPosition === "below") {
      seeds.push({
        id: "area-unit",
        role: "areaUnit",
        segments: [segment("areaUnit", AREA_UNIT_TEXT, areaUnit.style)],
        style: areaUnit.style,
        maxWidthRatio: 0.85,
      });
    }
    return seeds;
  };

  const bodySeed = (): BlockSeed | null => (body.visible && bodyText ? {
    id: "body",
    role: "body",
    segments: [segment("body", bodyText, body.style)],
    style: body.style,
    maxWidthRatio: bodyOptions.paragraphWidth,
    autoHide: bodyOptions.autoHide,
  } : null);

  const metadataSeed = (): BlockSeed | null => (metadata.visible && metadataText ? {
    id: "metadata",
    role: "metadata",
    segments: [segment("metadata", metadataText, metadata.style)],
    style: metadata.style,
    maxWidthRatio: 0.9,
  } : null);

  const present = (...seeds: (BlockSeed | null)[]): BlockSeed[] =>
    seeds.filter((seed): seed is BlockSeed => seed !== null);

  const compactFallback = (): ResolvedLabelBlock[] =>
    stackBlocks(present(nameSeed(), ...areaSeeds()), scaleMode, { x: 0, y: 0 });

  let blocks: ResolvedLabelBlock[] = [];
  let fallbackBlocks: ResolvedLabelBlock[] = [];
  let ring: ResolvedRingLabel | null = null;
  let flag: ResolvedFlagLabel | null = null;
  let divider: ResolvedLabelDivider | null = null;

  const areaRegionAnchor = (fallbackY: number): { x: number; y: number } => {
    if (area.region === "top") return { x: 0, y: -0.45 };
    if (area.region === "bottom") return { x: 0, y: 0.45 };
    if (area.region === "centre") return { x: 0, y: 0 };
    return { x: 0, y: fallbackY };
  };

  switch (layout) {
    case "area-hero": {
      const hero = stackBlocks(present(nameSeed(), ...areaSeeds(), bodySeed()), scaleMode, areaRegionAnchor(0));
      blocks = [...hero, ...(metadataSeed() ? stackBlocks(present(metadataSeed()), scaleMode, { x: 0, y: 0.6 }) : [])];
      break;
    }
    case "name-hero": {
      blocks = stackBlocks(present(nameSeed(), ...areaSeeds(), bodySeed(), metadataSeed()), scaleMode, { x: 0, y: 0 });
      break;
    }
    case "split": {
      const top = stackBlocks(present(noSeed(), nameSeed()), scaleMode, { x: 0, y: -0.34 });
      const bottom = stackBlocks(present(...areaSeeds(), metadataSeed()), scaleMode, { x: 0, y: 0.36 });
      const bodyBlocks = stackBlocks(present(bodySeed()), scaleMode, { x: 0, y: 0.72 });
      blocks = [...top, ...bottom, ...bodyBlocks];
      divider = { yUnit: 0.02, widthRatio: 0.62 };
      fallbackBlocks = compactFallback();
      break;
    }
    case "symbol-text": {
      const anchorY = input.hasSymbol ? 0.42 : 0;
      blocks = stackBlocks(present(nameSeed(), ...areaSeeds(), bodySeed(), metadataSeed()), scaleMode, { x: 0, y: anchorY });
      break;
    }
    case "compact-technical": {
      blocks = stackBlocks(
        present(noSeed(), nameSeed(), ...areaSeeds(), bodySeed(), metadataSeed()),
        scaleMode,
        { x: 0, y: 0 },
        1.4
      );
      break;
    }
    case "ring": {
      if (name.visible && nameText) {
        const centre = ((ringOptions.startAngleDeg % 360) + 360) % 360;
        ring = {
          text: nameText,
          font: roleFont(name.style, input.textSize),
          colourMode: name.style.colourMode,
          colour: name.style.colour,
          opacity: name.style.opacity,
          radiusRatio: ringOptions.radiusRatio,
          startAngleDeg: ringOptions.startAngleDeg,
          spacingEm: ringOptions.spacingEm,
          flipped: centre > 90 && centre < 270,
          scaleMode: name.style.scaleMode === "inherit" ? scaleMode : name.style.scaleMode,
        };
      }
      blocks = stackBlocks(present(...areaSeeds(), metadataSeed()), scaleMode, { x: 0, y: 0 });
      fallbackBlocks = compactFallback();
      break;
    }
    case "minimal-number": {
      if (minimalSource === "no" && noText) {
        const style = { ...no.style, visible: true, size: Math.max(no.style.size, 1.6), align: "centre" as const };
        blocks = stackBlocks([{
          id: "minimal-no",
          role: "no",
          segments: [segment("no", noText, style)],
          style,
          maxWidthRatio: 0.9,
        }], scaleMode, { x: 0, y: 0 });
      } else {
        blocks = stackBlocks(areaSeeds(), scaleMode, areaRegionAnchor(0));
      }
      break;
    }
    case "flag": {
      const requested = flagOptions.direction;
      const direction = requested === "auto" ? (input.flagAutoDirection ?? "above") : requested;
      const panelSeeds = present(noSeed(), nameSeed(), ...areaSeeds(), metadataSeed());
      const panelBlocks = stackBlocks(panelSeeds, scaleMode, { x: 0, y: 0 }, 1.2);
      flag = {
        direction,
        requestedDirection: requested,
        distanceWorld: flagOptions.distance,
        widthWorld: flagOptions.width,
        align: flagOptions.align,
        blocks: panelBlocks,
        scaleMode,
      };
      blocks = [];
      break;
    }
    case "centre-stack":
    default: {
      blocks = stackBlocks(
        present(noSeed(), nameSeed(), ...areaSeeds(), bodySeed(), metadataSeed()),
        scaleMode,
        { x: 0, y: 0 }
      );
      break;
    }
  }

  return { layout, blocks, fallbackBlocks, ring, flag, divider };
};

export interface LabelRuntimeViewport {
  zoom: number;
  radiusWorld: number;
}

/** Canonical scale formula. `world` = Scale with Cell (approved default),
 * `adaptive` = Auto, `screen` = Keep readable. The canvas-layer
 * resolveLabelScale delegates here so exactly one owner exists. */
export const resolveLabelRuntimeScale = (mode: LabelScaleMode, zoom: number): number => {
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  if (mode === "world") return safeZoom;
  if (mode === "adaptive") return Math.min(1.22, Math.max(0.82, Math.sqrt(safeZoom)));
  return 1;
};
const runtimeScale = resolveLabelRuntimeScale;

export interface RuntimeLabelSelection {
  blocks: readonly ResolvedLabelBlock[];
  ring: ResolvedRingLabel | null;
  flag: ResolvedFlagLabel | null;
  divider: ResolvedLabelDivider | null;
  usedFallback: boolean;
}

/** Pure per-frame gate: hide-below-zoom thresholds, small-cell fallbacks and
 * Body-first bounded degradation. Cheap comparisons only — safe per frame. */
export const selectRuntimeLabelLayout = (
  resolved: ResolvedCellLabelLayout,
  viewport: LabelRuntimeViewport
): RuntimeLabelSelection => {
  const screenRadius = viewport.radiusWorld * (Number.isFinite(viewport.zoom) && viewport.zoom > 0 ? viewport.zoom : 1);
  const compact = screenRadius < LABEL_COMPACT_SCREEN_RADIUS
    && (resolved.ring !== null || resolved.fallbackBlocks.length > 0)
    && resolved.layout !== "flag";
  const sourceBlocks = compact && resolved.fallbackBlocks.length > 0 ? resolved.fallbackBlocks : resolved.blocks;

  const zoomVisible = sourceBlocks.filter(
    (block) => block.hideBelowZoom <= 0 || viewport.zoom >= block.hideBelowZoom
  );

  const roomBounded = zoomVisible.filter((block) => {
    if (!block.autoHide) return true;
    const scale = runtimeScale(block.scaleMode, viewport.zoom);
    const bottom = Math.abs(block.anchorUnit.y) * screenRadius
      + (Math.abs(block.offsetWorld.y) + block.estimatedHeightWorld / 2) * scale;
    return bottom <= screenRadius * 0.94;
  });

  return {
    blocks: roomBounded,
    ring: compact ? null : resolved.ring,
    flag: resolved.flag,
    divider: compact ? null : resolved.divider,
    usedFallback: compact,
  };
};

/** Canonical content accessor kept beside the resolver so every consumer keeps
 * reading the same Cell fields (no duplicated label content anywhere). */
export const cellLabelContentSource = (
  space: Pick<SpaceCell, "spaceCode" | "name" | "area" | "body" | "category" | "privacy">
): CellLabelContentSource => ({
  spaceCode: space.spaceCode,
  name: space.name,
  area: space.area,
  body: space.body,
  category: space.category,
  privacy: space.privacy,
});
