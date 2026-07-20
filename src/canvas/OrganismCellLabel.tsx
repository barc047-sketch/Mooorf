import { memo, useId, useMemo, type CSSProperties } from "react";
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
  type ResolvedRingArc,
} from "../domain/labels/resolveLayout";
import { resolveLabelContrast } from "../design/labelContrast";

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

const blockStyle = (block: ResolvedLabelBlock, theme: Theme, panel = false): CSSProperties => {
  const primary = block.segments[0];
  const colour = blockColour(block, theme);
  const translate = block.styleOffsetWorld.x || block.styleOffsetWorld.y
    ? `translate(calc(${block.styleOffsetWorld.x}px * var(--bs)), calc(${block.styleOffsetWorld.y}px * var(--bs)))`
    : "";
  const rotate = block.rotationDeg ? `rotate(${block.rotationDeg}deg)` : "";
  return {
    "--bs": panel ? "var(--flag-scale, 1)" : `calc(${scaleVar(block.scaleMode)} * var(--layout-fit, 1))`,
    fontFamily: LABEL_FONT_FAMILY_CSS[primary.font.family],
    fontWeight: primary.font.weight,
    fontStyle: primary.font.italic ? "italic" : "normal",
    fontSize: `calc(${primary.font.sizeWorld}px * var(--bs))`,
    lineHeight: primary.font.lineHeight,
    letterSpacing: `${primary.font.letterSpacingEm}em`,
    textAlign: block.align === "centre" ? "center" : block.align,
    opacity: block.opacity,
    color: colour,
    /* Every inside composition, including numeric hero layouts, receives the
     * same runtime occupancy cap. `0` means the authored layout has no tighter
     * local ratio, not that it may escape the Cell when fitting is enabled. */
    width: !panel
      ? `min(calc(var(--cell-r) * ${((block.maxWidthRatio > 0 ? block.maxWidthRatio : 1) * 2).toFixed(3)}), calc(var(--cell-r) * 2 * var(--layout-occupancy, 0.82)))`
      : undefined,
    WebkitLineClamp: block.overflow === "wrap" ? block.maxLines : undefined,
    transform: translate || rotate ? `${translate} ${rotate}`.trim() : undefined,
  } as CSSProperties;
};

function LabelBlock({ block, theme, panel = false }: { block: ResolvedLabelBlock; theme: Theme; panel?: boolean }) {
  return (
    <span
      className="organism-layout-block"
      data-role={block.role}
      data-block-id={block.id}
      data-overflow={block.overflow}
      data-hide-below={block.hideBelowZoom > 0 ? block.hideBelowZoom : undefined}
      data-auto-hide={block.autoHide ? "true" : undefined}
      data-extent={block.autoHide
        ? (Math.abs(block.offsetWorld.y) + block.estimatedHeightWorld / 2).toFixed(1)
        : undefined}
      data-scale-mode={block.scaleMode}
      style={blockStyle(block, theme, panel)}
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
  ring: ResolvedRingArc;
  theme: Theme;
}) {
  const pathId = `organism-ring-${useId().replace(/:/g, "")}`;
  const colour = blockColour(ring, theme);
  return (
    <svg
      className="organism-ring-label"
      data-ring-id={ring.id}
      data-ring-ratio={ring.radiusRatio}
      data-ring-scale-mode={ring.scaleMode}
      data-ring-flipped={ring.flipped ? "true" : "false"}
      style={{
        "--bs": scaleVar(ring.scaleMode),
        "--ring-font-world": `${ring.font.sizeWorld}px`,
        "--ring-tracking": `${ring.font.letterSpacingEm}em`,
        color: colour,
        opacity: ring.opacity,
        transform: `rotate(${ring.startAngleDeg}deg)`,
      } as CSSProperties}
      aria-hidden="true"
    >
      <path
        id={pathId}
        className="organism-ring-path"
        d="M -1 0 A 1 1 0 0 1 1 0"
      />
      <text
        className="organism-ring-text"
        style={{
          fontFamily: LABEL_FONT_FAMILY_CSS[ring.font.family],
          fontWeight: ring.font.weight,
          fontStyle: ring.font.italic ? "italic" : "normal",
        }}
      >
        <textPath
          className="organism-ring-text-path"
          href={`#${pathId}`}
          startOffset="50%"
          textAnchor="middle"
        >
          {ring.text}
        </textPath>
      </text>
    </svg>
  );
}

function FlagLabel({ flag, theme }: {
  flag: NonNullable<ResolvedCellLabelLayout["flag"]>;
  theme: Theme;
}) {
  return (
    <div
      className="organism-flag-label"
      data-direction={flag.direction}
      data-leader={flag.options.leader}
      data-endpoint={flag.options.endpoint}
      data-background={flag.options.background}
      style={{ "--flag-scale": "1" } as CSSProperties}
    >
      <svg className="organism-flag-leader" aria-hidden="true">
        <path className="organism-flag-leader-path" />
        <path className="organism-flag-endpoint" />
      </svg>
      <div className="organism-flag-panel" data-flag-panel="true">
        {flag.blocks.map((block) => (
          <LabelBlock key={block.id} block={{ ...block, maxWidthRatio: 0 }} theme={theme} panel />
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
  const hasFallback = resolved.fallbackBlocks.length > 0;
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
      {resolved.ring?.arcs.map((ring) => <RingLabel key={ring.id} ring={ring} theme={theme} />)}
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
