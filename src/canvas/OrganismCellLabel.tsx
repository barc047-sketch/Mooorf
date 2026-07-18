import { memo, useMemo, type CSSProperties } from "react";
import type { LabelScaleMode, SpaceCell, Theme } from "../types";
import type { ProjectPresentationDefaults } from "../domain/presentation/types";
import {
  LABEL_COMPACT_SCREEN_RADIUS,
  LABEL_FONT_FAMILY_CSS,
  mergeCellLabelConfig,
  type FlagDirection,
} from "../domain/labels/layoutContract";
import {
  cellLabelContentSource,
  resolveCellLabelLayout,
  type ResolvedLabelBlock,
  type ResolvedCellLabelLayout,
} from "../domain/labels/resolveLayout";
import { resolveLabelContrast } from "../design/labelContrast";
import { ringGlyphLayout } from "./cellLabelDraw";

/* Memoized per-Cell label content for the Organism DOM layer. React renders
   structure only when content/style commits change; the per-frame loop in
   OrganismCanvasView updates CSS variables (--cell-r, --ls-*) and data flags,
   so pan/zoom and selection never rebuild these subtrees. */

export interface OrganismCellLabelProps {
  space: SpaceCell;
  defaults: ProjectPresentationDefaults;
  globalScaleMode: LabelScaleMode;
  textSize: number;
  showName: boolean;
  showArea: boolean;
  showMetadata: boolean;
  hasSymbol: boolean;
  flagAutoDirection: Exclude<FlagDirection, "auto">;
  theme: Theme;
}

const blockColour = (
  block: Pick<ResolvedLabelBlock, "colourMode" | "colour">,
  theme: Theme
): string | undefined =>
  block.colourMode === "auto"
    ? undefined // inherits the per-Cell Auto Contrast var(--label-ink)
    : resolveLabelContrast({ mode: block.colourMode, customColor: block.colour, theme }).color;

const scaleVar = (mode: LabelScaleMode): string => `var(--ls-${mode})`;

const blockStyle = (block: ResolvedLabelBlock, theme: Theme): CSSProperties => {
  const primary = block.segments[0];
  const colour = blockColour(block, theme);
  const translate = block.styleOffsetWorld.x || block.styleOffsetWorld.y
    ? `translate(calc(${block.styleOffsetWorld.x}px * var(--bs)), calc(${block.styleOffsetWorld.y}px * var(--bs)))`
    : "";
  const rotate = block.rotationDeg ? `rotate(${block.rotationDeg}deg)` : "";
  return {
    "--bs": scaleVar(block.scaleMode),
    fontFamily: LABEL_FONT_FAMILY_CSS[primary.font.family],
    fontWeight: primary.font.weight,
    fontStyle: primary.font.italic ? "italic" : "normal",
    fontSize: `calc(${primary.font.sizeWorld}px * var(--bs))`,
    lineHeight: primary.font.lineHeight,
    letterSpacing: `${primary.font.letterSpacingEm}em`,
    textAlign: block.align === "centre" ? "center" : block.align,
    opacity: block.opacity,
    color: colour,
    width: block.maxWidthRatio > 0
      ? `max(52px, calc(var(--cell-r) * ${(block.maxWidthRatio * 2).toFixed(3)}))`
      : undefined,
    WebkitLineClamp: block.overflow === "wrap" ? block.maxLines : undefined,
    transform: translate || rotate ? `${translate} ${rotate}`.trim() : undefined,
  } as CSSProperties;
};

function LabelBlock({ block, theme }: { block: ResolvedLabelBlock; theme: Theme }) {
  return (
    <span
      className="organism-layout-block"
      data-role={block.role}
      data-overflow={block.overflow}
      data-hide-below={block.hideBelowZoom > 0 ? block.hideBelowZoom : undefined}
      data-auto-hide={block.autoHide ? "true" : undefined}
      data-extent={block.autoHide
        ? (Math.abs(block.offsetWorld.y) + block.estimatedHeightWorld / 2).toFixed(1)
        : undefined}
      data-scale-mode={block.scaleMode}
      style={blockStyle(block, theme)}
    >
      {block.segments.length === 1
        ? block.segments[0].text
        : block.segments.map((segment, index) => (
            <span
              key={`${segment.role}-${index}`}
              className="organism-layout-segment"
              style={{
                fontFamily: LABEL_FONT_FAMILY_CSS[segment.font.family],
                fontWeight: segment.font.weight,
                fontStyle: segment.font.italic ? "italic" : "normal",
                fontSize: `calc(${segment.font.sizeWorld}px * var(--bs))`,
                letterSpacing: `${segment.font.letterSpacingEm}em`,
                opacity: segment.opacity,
                marginLeft: index > 0 ? `calc(${(segment.font.sizeWorld * 0.28).toFixed(2)}px * var(--bs))` : undefined,
              }}
            >
              {segment.text}
            </span>
          ))}
    </span>
  );
}

interface BlockGroup {
  key: string;
  anchor: { x: number; y: number };
  blocks: ResolvedLabelBlock[];
}

const groupByAnchor = (blocks: readonly ResolvedLabelBlock[]): BlockGroup[] => {
  const groups = new Map<string, BlockGroup>();
  for (const block of blocks) {
    const key = `${block.anchorUnit.x.toFixed(3)}|${block.anchorUnit.y.toFixed(3)}`;
    const group = groups.get(key);
    if (group) group.blocks.push(block);
    else groups.set(key, { key, anchor: block.anchorUnit, blocks: [block] });
  }
  return [...groups.values()];
};

function BlockGroups({ blocks, theme, tier }: {
  blocks: readonly ResolvedLabelBlock[];
  theme: Theme;
  tier: "primary" | "fallback";
}) {
  const groups = groupByAnchor(blocks);
  if (!groups.length) return null;
  return (
    <>
      {groups.map((group) => (
        <div
          key={`${tier}-${group.key}`}
          className="organism-layout-group"
          data-tier={tier}
          style={{
            left: `calc(var(--cell-r) * ${group.anchor.x.toFixed(3)})`,
            top: `calc(var(--cell-r) * ${group.anchor.y.toFixed(3)})`,
          }}
        >
          {group.blocks.map((block) => <LabelBlock key={block.id} block={block} theme={theme} />)}
        </div>
      ))}
    </>
  );
}

function RingLabel({ ring, theme }: {
  ring: NonNullable<ResolvedCellLabelLayout["ring"]>;
  theme: Theme;
}) {
  const glyphs = useMemo(
    () => ringGlyphLayout(ring.text, ring.font, ring.spacingEm),
    [ring.text, ring.font, ring.spacingEm]
  );
  const colour = blockColour(ring, theme);
  return (
    <div
      className="organism-ring-label"
      data-ring-ratio={ring.radiusRatio}
      data-ring-scale-mode={ring.scaleMode}
      style={{
        "--bs": scaleVar(ring.scaleMode),
        color: colour,
        opacity: ring.opacity,
        fontFamily: LABEL_FONT_FAMILY_CSS[ring.font.family],
        fontWeight: ring.font.weight,
        fontStyle: ring.font.italic ? "italic" : "normal",
        fontSize: `calc(${ring.font.sizeWorld}px * var(--bs))`,
        letterSpacing: 0,
      } as CSSProperties}
      aria-hidden="true"
    >
      {glyphs.map((glyph, index) => (
        /* --ring-k (deg per world px) is written per frame by syncLabels, so
         * glyph angles track the live nucleus radius without React work. */
        <span
          key={`${index}-${glyph.glyph}`}
          className="organism-ring-glyph"
          style={{
            transform: ring.flipped
              ? `rotate(calc(${ring.startAngleDeg + 180}deg - var(--ring-k, 0.6deg) * ${glyph.arcWorld.toFixed(2)})) translateY(calc(var(--cell-r) * ${ring.radiusRatio})) translate(-50%, -50%)`
              : `rotate(calc(${ring.startAngleDeg}deg + var(--ring-k, 0.6deg) * ${glyph.arcWorld.toFixed(2)})) translateY(calc(var(--cell-r) * -${ring.radiusRatio})) translate(-50%, -50%)`,
          }}
        >
          {glyph.glyph}
        </span>
      ))}
    </div>
  );
}

const FLAG_PANEL_PADDING = 7;

function FlagLabel({ flag, theme }: {
  flag: NonNullable<ResolvedCellLabelLayout["flag"]>;
  theme: Theme;
}) {
  const direction = flag.direction;
  const horizontal = direction === "left" || direction === "right";
  const stemStyle: CSSProperties = horizontal
    ? {
        width: `calc(${flag.distanceWorld}px * var(--bs))`,
        height: "1px",
        left: direction === "right" ? "var(--cell-r)" : `calc(-1 * var(--cell-r) - ${flag.distanceWorld}px * var(--bs))`,
        top: 0,
      }
    : {
        height: `calc(${flag.distanceWorld}px * var(--bs))`,
        width: "1px",
        top: direction === "below" ? "var(--cell-r)" : `calc(-1 * var(--cell-r) - ${flag.distanceWorld}px * var(--bs))`,
        left: 0,
      };
  const tickStyle: CSSProperties = {
    left: direction === "right" ? "var(--cell-r)" : direction === "left" ? "calc(-1 * var(--cell-r))" : 0,
    top: direction === "below" ? "var(--cell-r)" : direction === "above" ? "calc(-1 * var(--cell-r))" : 0,
  };
  const offset = `calc(var(--cell-r) + ${flag.distanceWorld}px * var(--bs))`;
  const cross = flag.align === "start" ? "0px" : flag.align === "end" ? "-100%" : "-50%";
  const panelStyle: CSSProperties = {
    width: `calc(${flag.widthWorld}px * var(--bs))`,
    padding: `calc(${FLAG_PANEL_PADDING}px * var(--bs))`,
    ...(direction === "right" && { left: offset, top: 0, transform: `translateY(${cross})` }),
    ...(direction === "left" && { right: offset, top: 0, transform: `translateY(${cross})` }),
    ...(direction === "above" && { bottom: offset, left: 0, transform: `translateX(${cross})` }),
    ...(direction === "below" && { top: offset, left: 0, transform: `translateX(${cross})` }),
  };
  return (
    <div className="organism-flag-label" data-direction={direction} style={{ "--bs": scaleVar(flag.scaleMode) } as CSSProperties}>
      <span className="organism-flag-tick" style={tickStyle} aria-hidden="true" />
      <span className="organism-flag-stem" style={stemStyle} aria-hidden="true" />
      <div className="organism-flag-panel" style={panelStyle}>
        {flag.blocks.map((block) => (
          <LabelBlock key={block.id} block={{ ...block, maxWidthRatio: 0 }} theme={theme} />
        ))}
      </div>
    </div>
  );
}

function OrganismCellLabelContent({
  space,
  defaults,
  globalScaleMode,
  textSize,
  showName,
  showArea,
  showMetadata,
  hasSymbol,
  flagAutoDirection,
  theme,
}: OrganismCellLabelProps) {
  const resolved = useMemo(
    () =>
      resolveCellLabelLayout({
        space: cellLabelContentSource(space),
        config: mergeCellLabelConfig(defaults.text.labels, space.appearance?.text?.labels),
        globalScaleMode,
        textSize,
        legacyVisibility: { showName, showArea, showMetadata },
        hasSymbol,
        flagAutoDirection,
      }),
    [space, defaults, globalScaleMode, textSize, showName, showArea, showMetadata, hasSymbol, flagAutoDirection]
  );
  const hasFallback = resolved.fallbackBlocks.length > 0 || resolved.ring !== null;
  return (
    <div
      className="organism-cell-layout"
      data-layout={resolved.layout}
      data-has-fallback={hasFallback && resolved.layout !== "flag" ? "true" : undefined}
      data-compact-radius={LABEL_COMPACT_SCREEN_RADIUS}
    >
      <BlockGroups blocks={resolved.blocks} theme={theme} tier="primary" />
      {resolved.divider && (
        <span
          className="organism-layout-divider"
          data-tier="primary"
          style={{
            top: `calc(var(--cell-r) * ${resolved.divider.yUnit.toFixed(3)})`,
            width: `calc(var(--cell-r) * ${(resolved.divider.widthRatio * 2).toFixed(3)})`,
          }}
          aria-hidden="true"
        />
      )}
      {resolved.ring && <RingLabel ring={resolved.ring} theme={theme} />}
      {resolved.flag && <FlagLabel flag={resolved.flag} theme={theme} />}
      {hasFallback && resolved.layout !== "flag" && (
        <BlockGroups blocks={resolved.fallbackBlocks} theme={theme} tier="fallback" />
      )}
    </div>
  );
}

/** Selection, hover and zoom state stay outside these props, so selection
 * changes never rebuild label subtrees. */
export default memo(OrganismCellLabelContent);
