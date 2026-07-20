import type { LabelScaleMode, SpaceCell } from "../../types";
import {
  type AreaLabelOptions,
  type BodyLabelOptions,
  type CellLabelConfig,
  type CellLabelLayoutId,
  type FlagAlignment,
  type FlagDirection,
  type FlagLabelOptions,
  type LabelFitOptions,
  type LabelColourModeToken,
  type LabelFontFamilyToken,
  type LabelOverflowMode,
  type LabelRoleId,
  type LabelRoleStyle,
  type LabelTextAlign,
  type MinimalNumberSource,
  type RingArcOptions,
  type RingArcSource,
  type RingLowZoomBehaviour,
  type RingLabelOptions,
  DEFAULT_AREA_LABEL_OPTIONS,
  DEFAULT_BODY_LABEL_OPTIONS,
  DEFAULT_CELL_LABEL_LAYOUT,
  DEFAULT_FLAG_LABEL_OPTIONS,
  DEFAULT_LABEL_FIT_OPTIONS,
  DEFAULT_MINIMAL_NUMBER_SOURCE,
  DEFAULT_RING_LABEL_OPTIONS,
  LABEL_BASE_SIZE_WORLD,
  LABEL_COMPACT_SCREEN_RADIUS,
  LABEL_WEIGHT_VALUES,
} from "./layoutContract";
import { resolveEffectiveLabelConfig, resolveEffectiveRoleStyle } from "./presets";

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
  arcs: readonly ResolvedRingArc[];
  lowZoomBehavior: RingLowZoomBehaviour;
  hideBelowZoom: number;
}

export interface ResolvedRingArc {
  id: "primary" | "secondary";
  source: Exclude<RingArcSource, "off">;
  text: string;
  font: ResolvedLabelFont;
  colourMode: LabelColourModeToken;
  colour: string;
  opacity: number;
  radiusRatio: number;
  /** Centre angle of the arc, 0 = top, positive clockwise. */
  startAngleDeg: number;
  arcSpanDeg: number;
  clockwise: boolean;
  orientation: "inside" | "outside";
  trackingEm: number;
  maxChars: number;
  ellipsis: boolean;
  lowZoomPriority: number;
  readableFlip: boolean;
  offsetWorld: { x: number; y: number };
  /** True when the arc centre sits in the lower semicircle, so glyphs run
   * counter-clockwise with flipped orientation and stay readable. */
  flipped: boolean;
  scaleMode: LabelScaleMode;
}

export interface RingFitEvidence {
  availableArcWorld: number;
  totalArcWorld: number;
  trackingEm: number;
  usedTrackingReduction: boolean;
  usedFontReduction: boolean;
  truncated: boolean;
}

export interface RuntimeRingLabel extends ResolvedRingLabel {
  arcs: readonly RuntimeRingArc[];
}

export interface RuntimeRingArc extends ResolvedRingArc {
  fit: RingFitEvidence;
}

export interface ResolvedFlagLabel {
  direction: Exclude<FlagDirection, "auto">;
  requestedDirection: FlagDirection;
  distanceWorld: number;
  widthWorld: number;
  align: FlagAlignment;
  blocks: readonly ResolvedLabelBlock[];
  scaleMode: LabelScaleMode;
  options: FlagLabelOptions;
}

export interface ResolvedLabelDivider {
  /** Unit-radius vertical position of a hairline rule (Split layout). */
  yUnit: number;
  widthRatio: number;
}

export interface ResolvedCellLabelLayout {
  layout: CellLabelLayoutId;
  fit: LabelFitOptions;
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
  const config = resolveEffectiveLabelConfig(input.config);
  const layout = config?.layout ?? DEFAULT_CELL_LABEL_LAYOUT;
  const area: AreaLabelOptions = { ...DEFAULT_AREA_LABEL_OPTIONS, ...config?.area };
  const bodyOptions: BodyLabelOptions = { ...DEFAULT_BODY_LABEL_OPTIONS, ...config?.body };
  const fit: LabelFitOptions = { ...DEFAULT_LABEL_FIT_OPTIONS, ...config?.fit };
  const ringOptions: RingLabelOptions = {
    ...DEFAULT_RING_LABEL_OPTIONS,
    ...config?.ring,
    primaryArc: { ...DEFAULT_RING_LABEL_OPTIONS.primaryArc, ...config?.ring?.primaryArc },
    secondaryArc: { ...DEFAULT_RING_LABEL_OPTIONS.secondaryArc, ...config?.ring?.secondaryArc },
  };
  const flagOptions: FlagLabelOptions = {
    ...DEFAULT_FLAG_LABEL_OPTIONS,
    ...config?.flag,
    content: { ...DEFAULT_FLAG_LABEL_OPTIONS.content, ...config?.flag?.content },
    contentOrder: config?.flag?.contentOrder ?? DEFAULT_FLAG_LABEL_OPTIONS.contentOrder,
  };
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

  const ringSourceText = (source: Exclude<RingArcSource, "off">): string => {
    if (source === "name") return nameText;
    if (source === "body") return bodyText;
    if (source === "space-no") return noText;
    if (source === "space-no-name") return [noText, nameText].filter(Boolean).join(" · ");
    if (source === "area") return areaNumberText
      ? `${areaNumberText}${area.showUnit ? ` ${AREA_UNIT_TEXT}` : ""}`
      : "";
    return metadataText;
  };
  const ringSourceRole = (source: Exclude<RingArcSource, "off">): LabelRoleId => {
    if (source === "space-no") return "no";
    if (source === "space-no-name") return "name";
    if (source === "area") return "areaNumber";
    return source;
  };
  const makeRingArc = (
    id: "primary" | "secondary",
    options: Partial<RingArcOptions>
  ): ResolvedRingArc | null => {
    const source = options.source ?? "off";
    if (source === "off") return null;
    const sourceRole = ringSourceRole(source);
    const style = resolveEffectiveRoleStyle(layout, options.fontRole ?? sourceRole, config);
    const original = ringSourceText(source).trim();
    if (!original) return null;
    const maxChars = Math.max(4, Math.round(options.maxChars ?? 72));
    const text = original.length > maxChars
      ? `${original.slice(0, Math.max(1, maxChars - 1)).trimEnd()}${options.ellipsis === false ? "" : "…"}`
      : original;
    const startAngleDeg = options.startAngleDeg ?? 0;
    const centre = ((startAngleDeg % 360) + 360) % 360;
    const readableFlip = options.readableFlip !== false;
    return {
      id,
      source,
      text,
      font: roleFont(style, input.textSize),
      colourMode: style.colourMode,
      colour: style.colour,
      opacity: style.opacity * (options.opacity ?? 1),
      radiusRatio: options.radiusRatio ?? 0.78,
      startAngleDeg,
      arcSpanDeg: options.arcSpanDeg ?? 162,
      clockwise: (options.direction ?? "clockwise") === "clockwise",
      orientation: options.orientation ?? "outside",
      trackingEm: options.trackingEm ?? 0,
      maxChars,
      ellipsis: options.ellipsis !== false,
      lowZoomPriority: Math.max(1, Math.round(options.lowZoomPriority ?? 1)),
      readableFlip,
      offsetWorld: { x: options.offsetX ?? 0, y: options.offsetY ?? 0 },
      flipped: readableFlip && centre > 90 && centre < 270,
      scaleMode: style.scaleMode === "inherit" ? scaleMode : style.scaleMode,
    };
  };

  const segment = (role: LabelRoleId, text: string, style: LabelRoleStyle): ResolvedLabelSegment => ({
    role,
    text,
    font: roleFont(style, input.textSize),
    opacity: style.opacity,
  });

  const noSeed = (force = false): BlockSeed | null => ((force || no.visible) && noText ? {
    id: "no",
    role: "no",
    segments: [segment("no", noText, no.style)],
    style: no.style,
    maxWidthRatio: 0.85,
  } : null);

  const nameSeed = (force = false): BlockSeed | null => ((force || name.visible) && nameText ? {
    id: "name",
    role: "name",
    segments: [segment("name", nameText, name.style)],
    style: name.style,
    maxWidthRatio: 0.85,
  } : null);

  /** Area line: number + optional unit segment; unit can also drop below.
   * Hero-scale numeric layouts stay unconstrained so the number is never
   * ellipsized — the numeric hero may overflow the Cell like the references. */
  const areaSeeds = (options?: { force?: boolean; includeUnit?: boolean }): BlockSeed[] => {
    if (!(options?.force || areaNumber.visible) || !areaNumberText) return [];
    const unconstrained = layout === "area-hero" || layout === "minimal-number";
    const showUnit = area.showUnit && (options?.force || areaUnit.visible) && options?.includeUnit !== false;
    const inlineUnit = showUnit && area.unitPosition === "after";
    const numberSegments: ResolvedLabelSegment[] = [segment("areaNumber", areaNumberText, areaNumber.style)];
    if (inlineUnit) numberSegments.push(segment("areaUnit", AREA_UNIT_TEXT, areaUnit.style));
    const seeds: BlockSeed[] = [{
      id: "area",
      role: "areaNumber",
      segments: numberSegments,
      style: areaNumber.style,
      maxWidthRatio: unconstrained ? 0 : 0.85,
    }];
    if (showUnit && area.unitPosition === "below") {
      seeds.push({
        id: "area-unit",
        role: "areaUnit",
        segments: [segment("areaUnit", AREA_UNIT_TEXT, areaUnit.style)],
        style: areaUnit.style,
        maxWidthRatio: unconstrained ? 0 : 0.85,
      });
    }
    return seeds;
  };

  const bodySeed = (force = false): BlockSeed | null => ((force || body.visible) && bodyText ? {
    id: "body",
    role: "body",
    segments: [segment("body", bodyText, body.style)],
    style: body.style,
    maxWidthRatio: bodyOptions.paragraphWidth,
    autoHide: bodyOptions.autoHide,
  } : null);

  const metadataSeed = (force = false): BlockSeed | null => ((force || metadata.visible) && metadataText ? {
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

  const composeRing = (overrides?: {
    primary?: Partial<RingArcOptions>;
    secondary?: Partial<RingArcOptions>;
  }): ResolvedRingLabel | null => {
    /* Legacy Ring values remain a valid primary-arc shorthand. Explicit arc
     * fields always win, so migration never silently changes composition. */
    const primary = makeRingArc("primary", {
      ...ringOptions.primaryArc,
      radiusRatio: config?.ring?.primaryArc?.radiusRatio ?? config?.ring?.radiusRatio ?? ringOptions.radiusRatio,
      startAngleDeg: config?.ring?.primaryArc?.startAngleDeg ?? config?.ring?.startAngleDeg ?? ringOptions.startAngleDeg,
      trackingEm: config?.ring?.primaryArc?.trackingEm ?? config?.ring?.spacingEm ?? ringOptions.spacingEm,
      ...overrides?.primary,
    });
    const secondary = makeRingArc("secondary", {
      ...ringOptions.secondaryArc,
      ...overrides?.secondary,
    });
    const arcs = [primary, secondary].filter((arc): arc is ResolvedRingArc => arc !== null);
    return arcs.length
      ? { arcs, lowZoomBehavior: ringOptions.lowZoomBehavior, hideBelowZoom: ringOptions.hideBelowZoom }
      : null;
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
      ring = composeRing();
      blocks = stackBlocks(present(...areaSeeds(), metadataSeed()), scaleMode, { x: 0, y: 0 });
      break;
    }
    case "dual-ring": {
      ring = composeRing();
      blocks = stackBlocks(present(...areaSeeds()), scaleMode, { x: 0, y: 0 });
      break;
    }
    case "ring-core": {
      ring = composeRing();
      blocks = stackBlocks(present(...areaSeeds()), scaleMode, { x: 0, y: 0 });
      break;
    }
    case "technical-orbit": {
      ring = composeRing();
      blocks = stackBlocks(present(...areaSeeds()), scaleMode, { x: 0, y: 0 });
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
      const flagBody = bodySeed(true);
      const symbolSeeds: BlockSeed[] = flagOptions.symbol && input.hasSymbol
        ? [{
            id: "flag-symbol",
            role: "no",
            segments: [segment("no", "◆", { ...no.style, visible: true, size: Math.min(no.style.size, 0.72) })],
            style: { ...no.style, visible: true, size: Math.min(no.style.size, 0.72) },
            maxWidthRatio: 0,
          }]
        : [];
      const byRole: Partial<Record<LabelRoleId, BlockSeed[]>> = {
        no: flagOptions.content.no ? present(noSeed(true)) : [],
        name: flagOptions.content.name ? present(nameSeed(true)) : [],
        areaNumber: flagOptions.content.areaNumber
          ? areaSeeds({ force: true, includeUnit: flagOptions.content.areaUnit !== false })
          : [],
        areaUnit: [],
        body: flagOptions.content.body && !flagOptions.compact && flagBody
          ? [{
              ...flagBody,
              style: { ...flagBody.style, maxLines: flagOptions.bodyLineClamp },
            }]
          : [],
        metadata: flagOptions.content.metadata ? present(metadataSeed(true)) : [],
      };
      const panelSeeds = [...symbolSeeds, ...flagOptions.contentOrder.flatMap((role) => byRole[role] ?? [])];
      const panelBlocks = stackBlocks(panelSeeds, scaleMode, { x: 0, y: 0 }, flagOptions.contentGap);
      flag = {
        direction,
        requestedDirection: requested,
        distanceWorld: flagOptions.distance,
        widthWorld: flagOptions.width,
        align: flagOptions.align,
        blocks: panelBlocks,
        scaleMode,
        options: flagOptions,
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

  return { layout, fit, blocks, fallbackBlocks, ring, flag, divider };
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

const RING_MIN_ARC_RADIANS = Math.PI / 5;
const RING_MIN_TRACKING_EM = -0.04;
const RING_MIN_FONT_SCALE = 0.24;

const glyphAdvanceEm = (glyph: string): number => {
  if (/\s/.test(glyph)) return 0.34;
  if (/[ilI1|.,'`]/.test(glyph)) return 0.31;
  if (/[mwMW@%&]/.test(glyph)) return 0.84;
  if (glyph === "…") return 0.72;
  if (/[A-Z0-9]/.test(glyph)) return 0.62;
  return 0.56;
};

const ringArcWorld = (
  text: string,
  fontSizeWorld: number,
  trackingEm: number
): number => {
  const glyphs = [...text];
  if (!glyphs.length) return 0;
  const advances = glyphs.reduce((sum, glyph) => sum + glyphAdvanceEm(glyph), 0);
  return Math.max(0, (advances + trackingEm * Math.max(0, glyphs.length - 1)) * fontSizeWorld);
};

/** Shared deterministic arc fitter. It deliberately uses bounded authored
 * metrics rather than renderer measurement, so live Organism and detached
 * exports make the same spacing/font/ellipsis decision without swapping the
 * selected Ring layout for straight text. */
export const fitRingArc = (
  arc: ResolvedRingArc,
  viewport: { screenRadius: number; zoom: number }
): RuntimeRingArc | null => {
  const screenRadius = Number.isFinite(viewport.screenRadius) ? Math.max(0, viewport.screenRadius) : 0;
  if (!arc.text || screenRadius <= 0) return null;
  const scale = resolveLabelRuntimeScale(arc.scaleMode, viewport.zoom);
  if (scale <= 0) return null;
  const arcRadians = Math.max(RING_MIN_ARC_RADIANS, Math.min(Math.PI * 1.78, (arc.arcSpanDeg * Math.PI) / 180));
  const availableArcWorld =
    Math.max(0.25, (screenRadius * arc.radiusRatio * arcRadians) / scale);

  const originalTracking = arc.font.letterSpacingEm + arc.trackingEm;
  const glyphCount = [...arc.text].length;
  const advanceEm = [...arc.text].reduce((sum, glyph) => sum + glyphAdvanceEm(glyph), 0);
  let trackingEm = originalTracking;
  let fontSizeWorld = arc.font.sizeWorld;
  let totalArcWorld = ringArcWorld(arc.text, fontSizeWorld, trackingEm);

  if (totalArcWorld > availableArcWorld && glyphCount > 1) {
    const availableTracking =
      (availableArcWorld / fontSizeWorld - advanceEm) / (glyphCount - 1);
    trackingEm = Math.max(
      RING_MIN_TRACKING_EM,
      Math.min(originalTracking, availableTracking)
    );
    totalArcWorld = ringArcWorld(arc.text, fontSizeWorld, trackingEm);
  }

  if (totalArcWorld > availableArcWorld) {
    const requiredScale = availableArcWorld / Math.max(totalArcWorld, 0.0001);
    fontSizeWorld *= Math.max(RING_MIN_FONT_SCALE, Math.min(1, requiredScale));
    totalArcWorld = ringArcWorld(arc.text, fontSizeWorld, trackingEm);
  }

  let text = arc.text;
  let truncated = false;
  if (totalArcWorld > availableArcWorld) {
    const glyphs = [...arc.text.trim()];
    text = "";
    for (let length = glyphs.length - 1; length >= 1; length -= 1) {
      const suffix = arc.ellipsis ? "…" : "";
      const candidate = `${glyphs.slice(0, length).join("").trimEnd()}${suffix}`;
      if (ringArcWorld(candidate, fontSizeWorld, trackingEm) <= availableArcWorld) {
        text = candidate;
        break;
      }
    }
    if (!text) text = glyphs[0] ?? "";
    if (!text) return null;
    const minimumWidth = ringArcWorld(text, fontSizeWorld, trackingEm);
    if (minimumWidth > availableArcWorld) {
      fontSizeWorld *= Math.max(0.08, availableArcWorld / Math.max(minimumWidth, 0.0001));
    }
    truncated = true;
    totalArcWorld = ringArcWorld(text, fontSizeWorld, trackingEm);
  }

  return {
    ...arc,
    text,
    font: {
      ...arc.font,
      sizeWorld: fontSizeWorld,
      letterSpacingEm: trackingEm,
    },
    fit: {
      availableArcWorld,
      totalArcWorld,
      trackingEm,
      usedTrackingReduction: trackingEm < originalTracking - 0.0001,
      usedFontReduction: fontSizeWorld < arc.font.sizeWorld - 0.0001,
      truncated,
    },
  };
};

export interface RuntimeLabelSelection {
  blocks: readonly ResolvedLabelBlock[];
  ring: RuntimeRingLabel | null;
  flag: ResolvedFlagLabel | null;
  divider: ResolvedLabelDivider | null;
  usedFallback: boolean;
  fitScale: number;
  insideOccupancy: number;
}

/** Pure per-frame gate: hide-below-zoom thresholds, small-cell fallbacks and
 * Body-first bounded degradation. Cheap comparisons only — safe per frame. */
export const selectRuntimeLabelLayout = (
  resolved: ResolvedCellLabelLayout,
  viewport: LabelRuntimeViewport
): RuntimeLabelSelection => {
  const screenRadius = viewport.radiusWorld * (Number.isFinite(viewport.zoom) && viewport.zoom > 0 ? viewport.zoom : 1);
  const fit = resolved.fit;
  const allHidden = fit.hideAllLabelsBelow > 0 && viewport.zoom < fit.hideAllLabelsBelow;
  /* Hide is never a hard compact-mode fallback. It hides the complete Ring
   * composition only when the author supplied an explicit threshold. */
  const ringHiddenByThreshold = Boolean(
    !allHidden
    && resolved.ring
    && resolved.ring.lowZoomBehavior === "hide"
    && resolved.ring.hideBelowZoom > 0
    && viewport.zoom < resolved.ring.hideBelowZoom
  );
  let compact = !resolved.ring
    && screenRadius < LABEL_COMPACT_SCREEN_RADIUS
    && resolved.fallbackBlocks.length > 0
    && resolved.layout !== "flag";
  let ring: RuntimeRingLabel | null = null;
  if (!allHidden && !ringHiddenByThreshold && resolved.ring) {
    let arcs = [...resolved.ring.arcs];
    if (resolved.ring.lowZoomBehavior === "simplify" && screenRadius < LABEL_COMPACT_SCREEN_RADIUS) {
      arcs = arcs
        .filter((arc) => arc.source !== "body")
        .sort((left, right) => left.lowZoomPriority - right.lowZoomPriority)
        .slice(0, 1);
    }
    const fitted = arcs
      .sort((left, right) => left.lowZoomPriority - right.lowZoomPriority)
      .flatMap((arc) => {
        const next = fitRingArc(arc, { screenRadius, zoom: viewport.zoom });
        return next ? [next] : [];
      });
    if (fitted.length) {
      ring = {
        arcs: fitted,
        lowZoomBehavior: resolved.ring.lowZoomBehavior,
        hideBelowZoom: resolved.ring.hideBelowZoom,
      };
    }
  }
  let sourceBlocks = ringHiddenByThreshold
    ? []
    : compact && resolved.fallbackBlocks.length > 0
      ? resolved.fallbackBlocks
      : resolved.blocks;

  let visible = sourceBlocks.filter(
    (block) => {
      const threshold = block.role === "body"
        ? Math.max(block.hideBelowZoom, fit.lowZoomBodyThreshold)
        : block.role === "metadata"
          ? Math.max(block.hideBelowZoom, fit.lowZoomMetadataThreshold)
          : block.hideBelowZoom;
      return !allHidden && !ringHiddenByThreshold && (threshold <= 0 || viewport.zoom >= threshold);
    }
  );
  /* Ring arcs are fitted on their own circular paths above. Their central
   * Area/Core blocks are still inside the Cell and must obey the same fit
   * invariant as every other non-Flag composition. */
  const insideLayout = resolved.layout !== "flag";
  const availableHalfExtent = screenRadius * fit.maximumCellOccupancy;
  const estimatedTextWidth = (block: ResolvedLabelBlock): number =>
    block.segments.reduce((sum, segment, index) => {
      const letters = [...segment.text].reduce((total, glyph) => total + glyphAdvanceEm(glyph), 0);
      return sum + letters * segment.font.sizeWorld + (index ? segment.font.sizeWorld * 0.28 : 0);
    }, 0);
  const requiredHalfExtent = (blocks: readonly ResolvedLabelBlock[], layoutFit = 1): number =>
    blocks.reduce((maximum, block) => {
      const scale = runtimeScale(block.scaleMode, viewport.zoom) * layoutFit;
      const naturalWidth = estimatedTextWidth(block) * scale;
      const allowedWidth = Math.min(
        availableHalfExtent * 2,
        block.maxWidthRatio > 0 ? block.maxWidthRatio * screenRadius * 2 : Number.POSITIVE_INFINITY,
      );
      const width = Math.min(naturalWidth, allowedWidth);
      const x = Math.abs(block.anchorUnit.x) * screenRadius + Math.abs(block.offsetWorld.x) * scale + width / 2;
      const y = Math.abs(block.anchorUnit.y) * screenRadius
        + (Math.abs(block.offsetWorld.y) + block.estimatedHeightWorld / 2) * scale;
      /* A radial envelope is deliberately conservative: it makes rectangular
       * text fit inside the visible circle rather than merely inside its
       * square bounding box. */
      return Math.max(maximum, Math.hypot(x, y));
    }, 0);

  if (
    visible.some((block) => block.role === "body" && block.autoHide)
    && (fit.overflowPolicy === "simplify" || visible.some((block) => block.autoHide))
    && requiredHalfExtent(visible) > availableHalfExtent
  ) {
    visible = visible.filter((block) => block.role !== "body");
  }
  if (
    visible.some((block) => block.role === "metadata")
    && (fit.overflowPolicy === "simplify" || visible.some((block) => block.autoHide))
    && requiredHalfExtent(visible) > availableHalfExtent
  ) {
    visible = visible.filter((block) => block.role !== "metadata");
  }
  const required = requiredHalfExtent(visible);
  if (insideLayout && fit.fitInsideCell && fit.overflowPolicy === "hide" && required > availableHalfExtent) {
    visible = [];
  }
  let fitScale = !insideLayout || !fit.fitInsideCell || required <= 0 || !visible.length
    ? 1
    : Math.min(1, availableHalfExtent / required);
  const largestScreenFont = (block: ResolvedLabelBlock, layoutFit = 1): number =>
    block.segments.reduce(
      (largest, segment) => Math.max(
        largest,
        segment.font.sizeWorld * runtimeScale(block.scaleMode, viewport.zoom) * layoutFit,
      ),
      0,
    );
  const maximumNaturalScreenFont = visible.reduce(
    (largest, block) => Math.max(largest, largestScreenFont(block)),
    0,
  );
  if (insideLayout && maximumNaturalScreenFont > 0) {
    fitScale = Math.min(fitScale, fit.maximumScreenTextSize / maximumNaturalScreenFont);
  }
  if (insideLayout && fit.fitInsideCell && fitScale < 1) {
    const afterFit = requiredHalfExtent(visible, fitScale);
    fitScale *= afterFit > 0 ? Math.min(1, availableHalfExtent / afterFit) : 1;
  }
  fitScale = Math.max(0.001, Math.min(1, fitScale));
  /* Minimum readable size never expands text beyond its Cell. Optional
   * Body/metadata drop only when the shared fit factor cannot keep them
   * legible; authored canonical data remains intact in Table/Inspector. */
  const readable = fitScale < 0.999
    ? visible.filter((block) => {
        if (block.role !== "body" && block.role !== "metadata") return true;
        return largestScreenFont(block, fitScale) >= fit.minimumReadableScreenSize;
      })
    : visible;
  if (readable.length !== visible.length) {
    visible = readable;
    const readableRequired = requiredHalfExtent(visible);
    fitScale = !insideLayout || !fit.fitInsideCell || readableRequired <= 0
      ? 1
      : Math.min(1, availableHalfExtent / readableRequired);
    const readableMaximum = visible.reduce(
      (largest, block) => Math.max(largest, largestScreenFont(block)),
      0,
    );
    if (insideLayout && readableMaximum > 0) {
      fitScale = Math.min(fitScale, fit.maximumScreenTextSize / readableMaximum);
    }
    fitScale = Math.max(0.001, Math.min(1, fitScale));
  }
  return {
    blocks: visible,
    ring,
    flag: allHidden || ringHiddenByThreshold ? null : resolved.flag,
    divider: compact || ringHiddenByThreshold ? null : resolved.divider,
    usedFallback: compact,
    fitScale,
    insideOccupancy: fit.fitInsideCell ? fit.maximumCellOccupancy : 1,
  };
};

export interface FlagRuntimeGeometry {
  visible: boolean;
  scale: number;
  panel: { x: number; y: number; width: number; height: number };
  start: { x: number; y: number };
  end: { x: number; y: number };
  elbow: { x: number; y: number } | null;
  controlA: { x: number; y: number } | null;
  controlB: { x: number; y: number } | null;
  vector: { x: number; y: number };
}

export interface FlagRuntimeGeometryInput {
  flag: ResolvedFlagLabel;
  centre: { x: number; y: number };
  screenRadius: number;
  zoom: number;
  contentWidthWorld: number;
  contentHeightWorld: number;
  frame?: { width: number; height: number };
}

const flagVector = (flag: ResolvedFlagLabel): { x: number; y: number } => {
  if (flag.direction === "above") return { x: 0, y: -1 };
  if (flag.direction === "below") return { x: 0, y: 1 };
  if (flag.direction === "left") return { x: -1, y: 0 };
  if (flag.direction === "right") return { x: 1, y: 0 };
  const radians = (flag.options.anchorAngleDeg * Math.PI) / 180;
  return { x: Math.sin(radians), y: -Math.cos(radians) };
};

const clampToRect = (
  value: { x: number; y: number; width: number; height: number },
  frame: { width: number; height: number } | undefined,
): { x: number; y: number; width: number; height: number } => {
  if (!frame) return value;
  const margin = 4;
  const maxX = Math.max(margin, frame.width - value.width - margin);
  const maxY = Math.max(margin, frame.height - value.height - margin);
  return {
    ...value,
    x: Math.min(maxX, Math.max(margin, value.x)),
    y: Math.min(maxY, Math.max(margin, value.y)),
  };
};

const nearestRectPoint = (
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number },
): { x: number; y: number } => ({
  x: Math.max(rect.x, Math.min(rect.x + rect.width, point.x)),
  y: Math.max(rect.y, Math.min(rect.y + rect.height, point.y)),
});

const distanceToRect = (
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number },
): number => {
  const nearest = nearestRectPoint(point, rect);
  return Math.hypot(nearest.x - point.x, nearest.y - point.y);
};

/** Keep a callout panel clear of its source after clamping. A constrained
 * viewport edge can undo the initial outward placement, so try a small,
 * deterministic set of in-frame alternatives before accepting the position. */
const keepPanelAwayFromSource = (
  panel: { x: number; y: number; width: number; height: number },
  source: { x: number; y: number },
  sourceRadius: number,
  vector: { x: number; y: number },
  frame: { width: number; height: number } | undefined,
): { x: number; y: number; width: number; height: number } => {
  const required = sourceRadius + 4;
  if (distanceToRect(source, panel) >= required) return panel;
  const perpendicular = { x: -vector.y, y: vector.x };
  const directions = [
    vector,
    perpendicular,
    { x: -perpendicular.x, y: -perpendicular.y },
    { x: -vector.x, y: -vector.y },
  ];
  const travel = Math.max(panel.width, panel.height) + required;
  for (const direction of directions) {
    const candidate = clampToRect({
      ...panel,
      x: panel.x + direction.x * travel,
      y: panel.y + direction.y * travel,
    }, frame);
    if (distanceToRect(source, candidate) >= required) return candidate;
  }
  return panel;
};

/** One projected Flag geometry resolver used by the live DOM overlay and
 * detached PNG/PDF/ZIP Canvas2D drawing. It is presentation-only and never
 * reads selection, writes a store, or creates a Relationship. */
export const resolveFlagRuntimeGeometry = (input: FlagRuntimeGeometryInput): FlagRuntimeGeometry => {
  const { flag } = input;
  if (!flag.blocks.length || (flag.options.hideBelowZoom > 0 && input.zoom < flag.options.hideBelowZoom)) {
    return {
      visible: false,
      scale: 0,
      panel: { x: input.centre.x, y: input.centre.y, width: 0, height: 0 },
      start: input.centre,
      end: input.centre,
      elbow: null,
      controlA: null,
      controlB: null,
      vector: { x: 0, y: -1 },
    };
  }
  const modeScale = resolveLabelRuntimeScale(flag.options.zoomMode, input.zoom);
  const minimumPanelScale = Math.min(flag.options.minimumPanelScale, flag.options.maximumPanelScale);
  const maximumPanelScale = Math.max(flag.options.minimumPanelScale, flag.options.maximumPanelScale);
  const scale = Math.max(
    flag.options.keepReadable ? minimumPanelScale : 0.001,
    Math.min(maximumPanelScale, modeScale),
  );
  const vector = flagVector(flag);
  const perpendicular = { x: -vector.y, y: vector.x };
  /* A sparse import can set one width bound without the other. Resolve the
   * pair defensively here as well as normalizing complete patches so no
   * transient panel geometry can invert its bounds. */
  const minimumWidth = Math.min(flag.options.minimumWidth, flag.options.maximumWidth);
  const maximumWidth = Math.max(flag.options.minimumWidth, flag.options.maximumWidth);
  const contentWidth = flag.options.autoWidth
    ? Math.min(maximumWidth, Math.max(minimumWidth, input.contentWidthWorld + flag.options.paddingX * 2))
    : Math.min(maximumWidth, Math.max(minimumWidth, flag.options.width));
  const width = contentWidth * scale;
  const height = Math.max(1, (input.contentHeightWorld + flag.options.paddingY * 2) * scale);
  const start = {
    x: input.centre.x + vector.x * (input.screenRadius + flag.options.radialOffset * scale),
    y: input.centre.y + vector.y * (input.screenRadius + flag.options.radialOffset * scale),
  };
  const rawEnd = {
    x: start.x + vector.x * flag.options.distance * scale + flag.options.offsetX * scale,
    y: start.y + vector.y * flag.options.distance * scale + flag.options.offsetY * scale,
  };
  const along = Math.abs(vector.x) * width / 2 + Math.abs(vector.y) * height / 2;
  const crossSize = Math.abs(vector.x) * height + Math.abs(vector.y) * width;
  /* Start/End retain a stable screen meaning when a Flag flips sides: Start
   * anchors the panel's top (horizontal Flags) or left (vertical Flags) edge
   * at the leader end, rather than inverting with the perpendicular vector. */
  const screenStartSign = Math.abs(perpendicular.y) >= Math.abs(perpendicular.x)
    ? Math.sign(perpendicular.y) || 1
    : Math.sign(perpendicular.x) || 1;
  const cross = flag.align === "start"
    ? screenStartSign * crossSize / 2
    : flag.align === "end"
      ? -screenStartSign * crossSize / 2
      : 0;
  const proposedCentre = {
    x: rawEnd.x + vector.x * along + perpendicular.x * cross,
    y: rawEnd.y + vector.y * along + perpendicular.y * cross,
  };
  const rawPanel = {
    x: proposedCentre.x - width / 2,
    y: proposedCentre.y - height / 2,
    width,
    height,
  };
  const clampedPanel = flag.options.clampToFrame ? clampToRect(rawPanel, input.frame) : rawPanel;
  const panel = flag.options.avoidSourceCell
    ? keepPanelAwayFromSource(clampedPanel, input.centre, input.screenRadius, vector, flag.options.clampToFrame ? input.frame : undefined)
    : clampedPanel;
  const end = nearestRectPoint(rawEnd, panel);
  const elbow = flag.options.leader === "elbow"
    ? {
        x: start.x + vector.x * Math.min(flag.options.elbowLength * scale, Math.hypot(end.x - start.x, end.y - start.y) * 0.7),
        y: start.y + vector.y * Math.min(flag.options.elbowLength * scale, Math.hypot(end.x - start.x, end.y - start.y) * 0.7),
      }
    : null;
  const curveDistance = Math.hypot(end.x - start.x, end.y - start.y) * flag.options.curvature;
  const controlA = flag.options.leader === "curved"
    ? { x: start.x + vector.x * curveDistance, y: start.y + vector.y * curveDistance }
    : null;
  const controlB = flag.options.leader === "curved"
    ? { x: end.x - vector.x * curveDistance, y: end.y - vector.y * curveDistance }
    : null;
  return { visible: true, scale, panel, start, end, elbow, controlA, controlB, vector };
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
