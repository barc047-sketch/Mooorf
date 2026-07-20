import { strict as assert } from "node:assert";
import type { SpaceCell } from "../../types";
import {
  CELL_LABEL_LAYOUT_IDS,
  DEFAULT_CELL_LABEL_LAYOUT,
  DEFAULT_LABEL_FIT_OPTIONS,
  FLAG_LABEL_BOUNDS,
  RING_LABEL_BOUNDS,
  mergeCellLabelConfig,
  normalizeCellLabelConfig,
  type CellLabelConfig,
} from "./layoutContract";
import {
  CELL_LABEL_PRESETS,
  cellLabelPreset,
  resolveEffectiveRoleStyle,
  sparsifyCellLabelOverride,
} from "./presets";
import {
  cellLabelContentSource,
  fitRingArc,
  formatAreaNumber,
  resolveCellLabelLayout,
  resolveFlagAutoDirection,
  resolveFlagRuntimeGeometry,
  resolveLabelRuntimeScale,
  selectRuntimeLabelLayout,
  type CellLabelLayoutInput,
} from "./resolveLayout";
import {
  normalizeCellAppearanceOverrides,
  normalizeProjectPresentationDefaults,
} from "../presentation/validation";
import { applyTextAppearancePatch, resetTextLabelAppearance } from "../presentation/editing";
import { resolveCellAppearance } from "../presentation/resolveAppearance";
import { useLab } from "../../state/store";

const cell = (patch: Partial<SpaceCell> = {}): SpaceCell => ({
  id: "space-a",
  spaceCode: "07",
  name: "Studio North",
  body: "Double-height workshop with north light.",
  kind: "space",
  area: 142.5,
  category: "Public",
  privacy: "public",
  color: "",
  x: 20,
  y: -10,
  ...patch,
});

const layoutInput = (patch: Partial<CellLabelLayoutInput> = {}): CellLabelLayoutInput => ({
  space: cellLabelContentSource(cell()),
  config: undefined,
  globalScaleMode: "world",
  textSize: 1,
  legacyVisibility: { showName: true, showArea: true, showMetadata: true },
  hasSymbol: false,
  flagAutoDirection: "above",
  ...patch,
});

/* --- twelve-preset registry completeness and distinction ----------------- */

assert.equal(CELL_LABEL_PRESETS.length, 12, "exactly twelve production presets exist");
assert.deepEqual(
  CELL_LABEL_PRESETS.map((preset) => preset.id),
  [...CELL_LABEL_LAYOUT_IDS],
  "preset registry covers every layout id in order"
);
assert.equal(
  new Set(CELL_LABEL_PRESETS.map((preset) => preset.label)).size,
  12,
  "preset labels are distinct"
);
assert.ok(
  CELL_LABEL_PRESETS.every((preset) => preset.thumbnail.length > 0),
  "every preset carries thumbnail data for the Inspector"
);

const signatures = CELL_LABEL_LAYOUT_IDS.map((layout) => {
  const resolved = resolveCellLabelLayout(layoutInput({ config: { layout } }));
  return JSON.stringify({
    blocks: resolved.blocks.map((block) => [
      block.role,
      block.anchorUnit,
      Math.round(block.offsetWorld.y * 10) / 10,
      block.segments[0].font.sizeWorld.toFixed(1),
      block.align,
    ]),
  ring: resolved.ring ? resolved.ring.arcs.map((arc) => [arc.source, arc.radiusRatio, arc.startAngleDeg]) : null,
    flag: resolved.flag ? { d: resolved.flag.direction, w: resolved.flag.widthWorld } : null,
  });
});
assert.equal(new Set(signatures).size, 12, "all twelve layouts resolve to visibly different projections");

/* --- canonical data use -------------------------------------------------- */

const centre = resolveCellLabelLayout(layoutInput());
assert.equal(centre.layout, DEFAULT_CELL_LABEL_LAYOUT, "empty config resolves to Centre Stack");
const nameBlock = centre.blocks.find((block) => block.role === "name");
assert.equal(nameBlock?.segments[0].text, "Studio North", "Name reads the canonical Cell name");
const areaBlock = centre.blocks.find((block) => block.role === "areaNumber");
assert.equal(areaBlock?.segments[0].text, "143", "Area number formats the canonical area (precision 0 rounds)");
assert.equal(areaBlock?.segments[1]?.text, "m²", "Area unit joins as an inline segment");
assert.equal(formatAreaNumber(142.5, 1), "142.5", "decimal precision is honoured");
const bodyBlock = centre.blocks.find((block) => block.role === "body");
assert.ok(bodyBlock?.segments[0].text.startsWith("Double-height"), "Body reads canonical content");

const compactTechnical = resolveCellLabelLayout(layoutInput({ config: { layout: "compact-technical" } }));
assert.equal(
  compactTechnical.blocks.find((block) => block.role === "no")?.segments[0].text,
  "07",
  "Compact Technical reads the stable Space No."
);
assert.ok(
  compactTechnical.blocks.find((block) => block.role === "metadata")?.segments[0].text.includes("PUBLIC"),
  "metadata derives from canonical category/privacy only"
);

const minimalByNo = resolveCellLabelLayout(
  layoutInput({ config: { layout: "minimal-number", minimalSource: "no" } })
);
assert.equal(minimalByNo.blocks.length, 1, "Minimal Number renders a single block");
assert.equal(minimalByNo.blocks[0].segments[0].text, "07", "Minimal Number can source the stable Space No.");

/* --- migration and defaults ---------------------------------------------- */

const migrated = normalizeProjectPresentationDefaults({
  schemaVersion: 5,
  text: { preset: "editorial", size: 1.1, colourMode: "auto", colour: "#171715" },
});
assert.equal(migrated.schemaVersion, 6, "v5 projects migrate to schema 6");
assert.deepEqual(migrated.text.labels, {}, "migrated projects start with the sparse empty label config");
assert.equal(migrated.text.preset, "editorial", "existing text settings survive migration");

const invalid = normalizeCellLabelConfig({
  layout: "hologram",
  roles: { name: { size: 99, weight: "heavy", align: "justify" }, body: { align: "justify" } },
  ring: { radiusRatio: 9, startAngleDeg: 900 },
  fit: { maximumCellOccupancy: 2, overflowPolicy: "drift" },
  flag: {
    direction: "sideways",
    distance: -50,
    width: 9999,
    leader: "loop",
    endpoint: "spark",
    lineStyle: "zigzag",
    background: "neon",
    contentOrder: ["name", "not-a-role", "name"],
  },
});
assert.equal(invalid?.layout, undefined, "unknown layout ids are discarded");
assert.equal(invalid?.roles?.name?.size, 3.2, "role sizes clamp to the bounded range");
assert.equal(invalid?.roles?.name?.weight, undefined, "unknown weights are discarded");
assert.equal(invalid?.roles?.name?.align, undefined, "justify is rejected for non-Body roles");
assert.equal(invalid?.roles?.body?.align, "justify", "justify stays available for Body");
assert.equal(invalid?.ring?.radiusRatio, RING_LABEL_BOUNDS.radiusRatio[1], "ring radius clamps");
assert.equal(invalid?.flag?.direction, undefined, "unknown flag directions are discarded");
assert.equal(invalid?.flag?.distance, FLAG_LABEL_BOUNDS.distance[0], "flag distance clamps to bounds");
assert.equal(invalid?.flag?.width, FLAG_LABEL_BOUNDS.width[1], "flag width clamps to bounds");
assert.equal(invalid?.fit?.maximumCellOccupancy, 0.95, "inside fit occupancy clamps to its safe range");
assert.equal(invalid?.fit?.overflowPolicy, undefined, "unknown overflow policy is discarded");
assert.equal(invalid?.flag?.leader, undefined, "unknown Flag leader is discarded");
assert.equal(invalid?.flag?.endpoint, undefined, "unknown Flag endpoint is discarded");
assert.equal(invalid?.flag?.lineStyle, undefined, "unknown Flag line styles are discarded");
assert.equal(invalid?.flag?.background, undefined, "unknown Flag panel backgrounds are discarded");
assert.deepEqual(invalid?.flag?.contentOrder, ["name"], "Flag content order keeps only unique canonical roles");

/* --- sparse override merge ----------------------------------------------- */

const defaultsConfig: CellLabelConfig = { layout: "area-hero", roles: { name: { size: 0.8 } } };
const overrideConfig: CellLabelConfig = { roles: { name: { weight: "bold" } }, area: { precision: 2 } };
const merged = mergeCellLabelConfig(defaultsConfig, overrideConfig);
assert.equal(merged?.layout, "area-hero", "override without layout inherits the project layout");
assert.equal(merged?.roles?.name?.size, 0.8, "project role deviations survive the merge");
assert.equal(merged?.roles?.name?.weight, "bold", "cell role deviations win on their own fields");
assert.equal(merged?.area?.precision, 2, "area options merge sparsely");

const heroName = resolveEffectiveRoleStyle("area-hero", "areaNumber", undefined);
assert.equal(heroName.weight, "black", "preset seeds apply under sparse configs");
assert.equal(
  resolveEffectiveRoleStyle("area-hero", "areaNumber", { roles: { areaNumber: { weight: "light" } } }).weight,
  "light",
  "authored role fields override preset seeds"
);

const overrides = normalizeCellAppearanceOverrides(
  { text: { labels: { layout: "ring" } } },
  migrated
);
assert.equal(overrides?.text?.labels?.layout, "ring", "cell overrides persist sparse label config");
const patched = applyTextAppearancePatch(overrides, migrated, { labels: { ring: { startAngleDeg: 40 } } });
assert.equal(patched?.text?.labels?.layout, "ring", "incremental patches deep-merge instead of replacing");
assert.equal(patched?.text?.labels?.ring?.startAngleDeg, 40, "nested patch fields land");

const presetSparse = sparsifyCellLabelOverride(
  {
    layout: "ring",
    roles: { name: { size: 0.72 } },
    ring: { radiusRatio: 0.78, startAngleDeg: 0, spacingEm: 0.14 },
    flag: { direction: "auto", distance: 46, width: 120, align: "start" },
  },
  {}
);
assert.deepEqual(
  presetSparse,
  { layout: "ring" },
  "Cell overrides discard values already supplied by preset and Project Defaults"
);
assert.equal(
  sparsifyCellLabelOverride(
    { roles: { name: { size: 0.8 } } },
    { roles: { name: { size: 0.8 } } }
  ),
  undefined,
  "a Cell override equal to the Project Default stays sparse"
);
assert.equal(
  sparsifyCellLabelOverride(
    { layout: "ring", ring: { primaryArc: { source: "body", radiusRatio: 0.8 } } },
    { layout: "ring", ring: { primaryArc: { source: "body", radiusRatio: 0.8 } } },
  ),
  undefined,
  "equal nested Ring arc values return to true Project Default inheritance",
);
assert.equal(
  sparsifyCellLabelOverride(
    { layout: "flag", flag: { content: { body: false }, contentOrder: ["no", "name", "body"] } },
    { layout: "flag", flag: { content: { body: false }, contentOrder: ["no", "name", "body"] } },
  ),
  undefined,
  "equal nested Flag content and ordering do not leave stale local overrides",
);
const labelOnlyReset = resetTextLabelAppearance({
  text: { preset: "editorial", labels: { layout: "ring" } },
});
assert.equal(labelOnlyReset?.text?.preset, "editorial", "Label Studio reset preserves unrelated local text styling");
assert.equal(labelOnlyReset?.text?.labels, undefined, "Label Studio reset returns only labels to Project Default");

const resolvedAppearance = resolveCellAppearance(
  cell({ appearance: { text: { labels: { layout: "flag" } } } }),
  migrated,
  { paletteMode: "core", colorSource: "category", nucleusPaletteId: "auto", organismPaletteId: "mode", areaRange: { min: 1, max: 200 } }
);
assert.equal(resolvedAppearance.text.labels.layout, "flag", "resolved appearance carries the merged label config");

/* --- scale modes ---------------------------------------------------------- */

assert.equal(resolveLabelRuntimeScale("world", 2.5), 2.5, "world scales with the Cell");
assert.equal(resolveLabelRuntimeScale("screen", 2.5), 1, "screen stays readable");
assert.equal(resolveLabelRuntimeScale("adaptive", 100), 1.22, "adaptive clamps");
const perRole = resolveCellLabelLayout(
  layoutInput({ config: { roles: { name: { scaleMode: "screen" } } }, globalScaleMode: "world" })
);
assert.equal(
  perRole.blocks.find((block) => block.role === "name")?.scaleMode,
  "screen",
  "explicit role scale mode wins"
);
assert.equal(
  perRole.blocks.find((block) => block.role === "areaNumber")?.scaleMode,
  "world",
  "inherit follows the approved project default"
);

/* --- ring geometry -------------------------------------------------------- */

const ringTop = resolveCellLabelLayout(layoutInput({ config: { layout: "ring" } }));
assert.ok(ringTop.ring, "ring layout produces a ring spec");
assert.equal(ringTop.ring?.arcs[0]?.flipped, false, "top arcs are not flipped");
assert.equal(ringTop.ring?.arcs[0]?.text, "STUDIO NORTH", "ring text uses the cased canonical name");
const ringBottom = resolveCellLabelLayout(
  layoutInput({ config: { layout: "ring", ring: { startAngleDeg: 180 } } })
);
assert.equal(ringBottom.ring?.arcs[0]?.flipped, true, "bottom arcs flip so text is never upside-down");
const ringBottomNegative = resolveCellLabelLayout(
  layoutInput({ config: { layout: "ring", ring: { startAngleDeg: -170 } } })
);
assert.equal(ringBottomNegative.ring?.arcs[0]?.flipped, true, "negative bottom angles flip identically");
assert.equal(ringTop.fallbackBlocks.length, 0, "Ring never stores a straight compact fallback");
assert.ok(
  ringTop.blocks.some((block) => block.role === "areaNumber"),
  "Area remains readable inside the ring"
);
const longRing = resolveCellLabelLayout(layoutInput({
  space: cellLabelContentSource(cell({
    name: "Interdisciplinary Advanced Materials Research and Fabrication Laboratory",
  })),
  config: { layout: "ring" },
}));
const fittedLongRing = fitRingArc(longRing.ring!.arcs[0], { screenRadius: 12, zoom: 1 });
assert.ok(fittedLongRing, "a medium Cell produces a fitted Ring projection");
assert.ok(
  fittedLongRing!.fit.totalArcWorld <= fittedLongRing!.fit.availableArcWorld + 0.001,
  "Ring fitting never exceeds the deterministic available arc"
);
assert.ok(
  fittedLongRing!.fit.trackingEm <=
    longRing.ring!.arcs[0].font.letterSpacingEm + longRing.ring!.arcs[0].trackingEm,
  "Ring fitting reduces tracking before truncation"
);
assert.ok(
  fittedLongRing!.font.sizeWorld <= longRing.ring!.arcs[0].font.sizeWorld,
  "Ring fitting may reduce typography without changing the selected layout"
);
assert.ok(
  fittedLongRing!.fit.truncated && fittedLongRing!.text.endsWith("…"),
  "a still-overlong Ring name truncates with a truthful ellipsis"
);
assert.equal(
  fitRingArc(longRing.ring!.arcs[0], { screenRadius: 20, zoom: 1 })?.source,
  "name",
  "a small Ring remains a curved Ring instead of requesting a straight fallback"
);

const bodyOnPrimaryArc = resolveCellLabelLayout(layoutInput({
  config: { layout: "ring", ring: { primaryArc: { source: "body" }, secondaryArc: { source: "name" } } },
}));
assert.equal(bodyOnPrimaryArc.ring?.arcs[0]?.source, "body", "Body can be canonical primary Ring text");
assert.equal(bodyOnPrimaryArc.ring?.arcs[1]?.source, "name", "Name can remain a secondary Ring arc");
assert.ok(bodyOnPrimaryArc.ring?.arcs[0]?.text.startsWith("Double-height"), "Body Ring reads the canonical Body field");
const bodyOnSecondaryArc = resolveCellLabelLayout(layoutInput({
  config: { layout: "ring", ring: { primaryArc: { source: "name" }, secondaryArc: { source: "body" } } },
}));
assert.equal(bodyOnSecondaryArc.ring?.arcs[1]?.source, "body", "Body can be canonical secondary Ring text");

assert.deepEqual(
  ["dual-ring", "ring-core", "technical-orbit"].map((layout) => cellLabelPreset(layout as typeof CELL_LABEL_LAYOUT_IDS[number]).label),
  ["Dual Ring", "Ring + Core", "Technical Orbit"],
  "the three new production Ring presets are distinct and named"
);
const technicalOrbit = resolveCellLabelLayout(layoutInput({ config: { layout: "technical-orbit" } }));
assert.equal(technicalOrbit.ring?.arcs[0]?.source, "space-no-name", "Technical Orbit composes Space No. and Name on its primary arc");
assert.match(technicalOrbit.ring?.arcs[0]?.text ?? "", /^07 · STUDIO NORTH$/, "Technical Orbit reads both canonical arc sources without a duplicate string");

/* --- flag determinism ------------------------------------------------------ */

assert.equal(resolveFlagAutoDirection({ x: 40, y: 2 }, { x: 0, y: 0 }), "right", "east cells flag right");
assert.equal(resolveFlagAutoDirection({ x: -9, y: 2 }, { x: 0, y: 0 }), "left", "west cells flag left");
assert.equal(resolveFlagAutoDirection({ x: 1, y: 30 }, { x: 0, y: 0 }), "below", "south cells flag below");
assert.equal(resolveFlagAutoDirection({ x: 1, y: -30 }, { x: 0, y: 0 }), "above", "north cells flag above");
assert.equal(resolveFlagAutoDirection({ x: 5, y: 5 }, null), "above", "no reference falls back deterministically");

const flagAuto = resolveCellLabelLayout(
  layoutInput({ config: { layout: "flag" }, flagAutoDirection: "right" })
);
assert.equal(flagAuto.flag?.direction, "right", "auto direction resolves deterministically from data");
assert.equal(flagAuto.flag?.requestedDirection, "auto", "the authored request is preserved");
const flagExplicit = resolveCellLabelLayout(
  layoutInput({ config: { layout: "flag", flag: { direction: "below", distance: 60, width: 150, align: "end" } } })
);
assert.equal(flagExplicit.flag?.direction, "below", "explicit directions are honoured");
assert.equal(flagExplicit.flag?.distanceWorld, 60, "flag distance flows to the projection");
assert.equal(flagExplicit.flag?.widthWorld, 150, "flag width flows to the projection");
assert.equal(flagExplicit.flag?.align, "end", "flag alignment flows to the projection");
assert.ok(
  flagExplicit.flag!.blocks.some((block) => block.role === "name"),
  "the flag panel reads canonical content"
);
assert.equal(flagExplicit.blocks.length, 0, "flag moves text outside the Cell interior");
assert.ok(
  !("targetSpaceId" in flagExplicit.flag!) && !("relationshipId" in flagExplicit.flag!),
  "a Flag is presentation only and never references another object"
);
const flagWithSymbol = resolveCellLabelLayout(
  layoutInput({ config: { layout: "flag", flag: { symbol: true } }, hasSymbol: true })
);
assert.ok(flagWithSymbol.flag?.blocks.some((block) => block.id === "flag-symbol"), "Flag can include the existing Cell Symbol marker");
const flagWithoutSymbol = resolveCellLabelLayout(
  layoutInput({ config: { layout: "flag", flag: { symbol: false } }, hasSymbol: true })
);
assert.ok(!flagWithoutSymbol.flag?.blocks.some((block) => block.id === "flag-symbol"), "Flag Symbol toggle stays presentation-only");
const flagGeometry = resolveFlagRuntimeGeometry({
  flag: flagExplicit.flag!,
  centre: { x: 1220, y: 760 },
  screenRadius: 42,
  zoom: 1,
  contentWidthWorld: 102,
  contentHeightWorld: 28,
  frame: { width: 1280, height: 800 },
});
assert.ok(flagGeometry.visible, "Flag geometry is visible when it has canonical content");
assert.ok(flagGeometry.panel.x + flagGeometry.panel.width <= 1276.01, "Flag panel clamps to an export/live frame edge");
assert.ok(
  Math.hypot(flagGeometry.start.x - 1220, flagGeometry.start.y - 760) >= 42,
  "Flag leader stays attached to the source Cell edge"
);
const zoomedDraggedFlagGeometry = resolveFlagRuntimeGeometry({
  flag: flagExplicit.flag!,
  centre: { x: 860, y: 280 },
  screenRadius: 84,
  zoom: 2,
  contentWidthWorld: 102,
  contentHeightWorld: 28,
  frame: { width: 1280, height: 800 },
});
assert.deepEqual(
  {
    x: zoomedDraggedFlagGeometry.start.x - 860,
    y: zoomedDraggedFlagGeometry.start.y - 280,
  },
  {
    x: (flagGeometry.start.x - 1220) * 2,
    y: (flagGeometry.start.y - 760) * 2,
  },
  "Flag leader remains attached to the moved Cell edge across camera zoom"
);
const edgeFlag = resolveCellLabelLayout(layoutInput({
  config: { layout: "flag", flag: { direction: "left", distance: 20, clampToFrame: true, avoidSourceCell: true } },
}));
const edgeFlagGeometry = resolveFlagRuntimeGeometry({
  flag: edgeFlag.flag!,
  centre: { x: 20, y: 400 },
  screenRadius: 42,
  zoom: 1,
  contentWidthWorld: 120,
  contentHeightWorld: 28,
  frame: { width: 1280, height: 800 },
});
const distanceFromPanel = (point: { x: number; y: number }, panel: typeof edgeFlagGeometry.panel) => {
  const nearestX = Math.max(panel.x, Math.min(panel.x + panel.width, point.x));
  const nearestY = Math.max(panel.y, Math.min(panel.y + panel.height, point.y));
  return Math.hypot(nearestX - point.x, nearestY - point.y);
};
assert.ok(
  distanceFromPanel({ x: 20, y: 400 }, edgeFlagGeometry.panel) >= 46,
  "viewport clamping keeps an edge Flag clear of its source Cell"
);
const invertedScaleGeometry = resolveFlagRuntimeGeometry({
  flag: {
    ...flagExplicit.flag!,
    options: { ...flagExplicit.flag!.options, minimumPanelScale: 1.8, maximumPanelScale: 1.35 },
  },
  centre: { x: 640, y: 400 },
  screenRadius: 42,
  zoom: 1.6,
  contentWidthWorld: 102,
  contentHeightWorld: 28,
  frame: { width: 1280, height: 800 },
});
assert.equal(invertedScaleGeometry.scale, 1.6, "separately authored Flag min/max scales normalize at runtime");
const rightStartGeometry = resolveFlagRuntimeGeometry({
  flag: { ...flagExplicit.flag!, direction: "right", align: "start", options: { ...flagExplicit.flag!.options, clampToFrame: false, avoidSourceCell: false } },
  centre: { x: 640, y: 400 }, screenRadius: 42, zoom: 1, contentWidthWorld: 102, contentHeightWorld: 28,
});
const rightEndGeometry = resolveFlagRuntimeGeometry({
  flag: { ...flagExplicit.flag!, direction: "right", align: "end", options: { ...flagExplicit.flag!.options, clampToFrame: false, avoidSourceCell: false } },
  centre: { x: 640, y: 400 }, screenRadius: 42, zoom: 1, contentWidthWorld: 102, contentHeightWorld: 28,
});
const leftStartGeometry = resolveFlagRuntimeGeometry({
  flag: { ...flagExplicit.flag!, direction: "left", align: "start", options: { ...flagExplicit.flag!.options, clampToFrame: false, avoidSourceCell: false } },
  centre: { x: 640, y: 400 }, screenRadius: 42, zoom: 1, contentWidthWorld: 102, contentHeightWorld: 28,
});
const leftEndGeometry = resolveFlagRuntimeGeometry({
  flag: { ...flagExplicit.flag!, direction: "left", align: "end", options: { ...flagExplicit.flag!.options, clampToFrame: false, avoidSourceCell: false } },
  centre: { x: 640, y: 400 }, screenRadius: 42, zoom: 1, contentWidthWorld: 102, contentHeightWorld: 28,
});
assert.ok(
  rightStartGeometry.panel.y > rightEndGeometry.panel.y && leftStartGeometry.panel.y > leftEndGeometry.panel.y,
  "Flag Start/End stay screen-consistent when the callout flips sides"
);

/* --- runtime selection: zoom gates, fallback, bounded degradation ---------- */

const runtimeResolved = resolveCellLabelLayout(layoutInput());
const wideView = selectRuntimeLabelLayout(runtimeResolved, { zoom: 1, radiusWorld: 160 });
assert.ok(wideView.blocks.some((block) => block.role === "body"), "large cells keep Body");
const zoomedOut = selectRuntimeLabelLayout(runtimeResolved, { zoom: 0.3, radiusWorld: 60 });
assert.ok(
  !zoomedOut.blocks.some((block) => block.role === "body"),
  "Body hides first below its zoom threshold"
);
const tinyCell = selectRuntimeLabelLayout(runtimeResolved, { zoom: 1, radiusWorld: 9 });
assert.ok(
  !tinyCell.blocks.some((block) => block.role === "body"),
  "Body auto-hides when the Cell lacks room without deleting content"
);
const ringRuntime = selectRuntimeLabelLayout(ringTop, { zoom: 1, radiusWorld: 12 });
assert.ok(ringRuntime.ring?.arcs.length, "small cells preserve curved Ring identity by default");
assert.equal(ringRuntime.usedFallback, false, "Ring never switches to a compact straight fallback");
const ringRuntimeLarge = selectRuntimeLabelLayout(ringTop, { zoom: 1, radiusWorld: 80 });
assert.ok(ringRuntimeLarge.ring, "large cells keep the ring");
const ringHideWithThreshold = resolveCellLabelLayout(layoutInput({
  config: { layout: "ring", ring: { lowZoomBehavior: "hide", hideBelowZoom: 0.55 } },
}));
const hiddenRingRuntime = selectRuntimeLabelLayout(ringHideWithThreshold, { zoom: 0.4, radiusWorld: 12 });
assert.equal(hiddenRingRuntime.ring, null, "Hide below threshold suppresses Ring arcs only at the authored threshold");
assert.equal(hiddenRingRuntime.blocks.length, 0, "Hide below threshold never converts a Ring into straight core text");
const hideWithoutThreshold = resolveCellLabelLayout(layoutInput({
  config: { layout: "ring", ring: { lowZoomBehavior: "hide" } },
}));
assert.ok(
  selectRuntimeLabelLayout(hideWithoutThreshold, { zoom: 0.2, radiusWorld: 9 }).ring,
  "Hide mode without an authored threshold still preserves Ring identity"
);

const denseResolved = resolveCellLabelLayout(layoutInput({
  config: {
    roles: {
      name: { size: 2.4 },
      body: { visible: true, size: 1.2 },
      metadata: { visible: true, size: 0.8 },
    },
  },
}));
const denseRuntime = selectRuntimeLabelLayout(denseResolved, { zoom: 1, radiusWorld: 12 });
assert.ok(
  !denseRuntime.blocks.some((block) => block.role === "body"),
  "bounded degradation hides Body first"
);
assert.ok(
  denseRuntime.blocks.some((block) => block.role === "name")
    && denseRuntime.blocks.some((block) => block.role === "areaNumber"),
  "bounded degradation preserves enabled Name and Area"
);
assert.ok(
  denseRuntime.fitScale > 0 && denseRuntime.fitScale <= 1,
  "bounded fitting has no hard minimum that can exceed a small Cell"
);
const fitResolved = resolveCellLabelLayout(layoutInput({
  config: { fit: { ...DEFAULT_LABEL_FIT_OPTIONS, maximumCellOccupancy: 0.5 } },
}));
const beforeFit = JSON.stringify(fitResolved);
const fitTiny = selectRuntimeLabelLayout(fitResolved, { zoom: 0.25, radiusWorld: 14 });
assert.ok(fitTiny.fitScale > 0 && fitTiny.insideOccupancy === 0.5, "inside fitting uses the authored occupancy ratio");
assert.equal(JSON.stringify(fitResolved), beforeFit, "runtime fitting never mutates project/resolved data");

/* --- legacy visibility gates keep one owner -------------------------------- */

const legacyHidden = resolveCellLabelLayout(
  layoutInput({ legacyVisibility: { showName: false, showArea: false, showMetadata: false } })
);
assert.ok(!legacyHidden.blocks.some((block) => block.role === "name"), "legacy showName keeps gating Name");
assert.ok(!legacyHidden.blocks.some((block) => block.role === "areaNumber"), "legacy showArea keeps gating Area");
const explicitWins = resolveCellLabelLayout(
  layoutInput({
    config: { roles: { name: { visible: true } } },
    legacyVisibility: { showName: false, showArea: true, showMetadata: true },
  })
);
assert.ok(
  explicitWins.blocks.some((block) => block.role === "name"),
  "explicit role visibility overrides the legacy gate"
);

/* --- store: preview without history spam, one commit, Undo/Redo ------------ */

useLab.setState({
  spaces: [cell(), cell({ id: "space-b", spaceCode: "08", name: "Atelier", x: 90, y: 40 })],
  selectedIds: ["space-a", "space-b"],
  primarySelectedId: "space-a",
  selectedId: "space-a",
  transformUndoStack: [],
  transformRedoStack: [],
  appearancePreview: null,
  appearancePreviewIds: null,
  appearancePreviewTarget: null,
});

const historyBefore = useLab.getState().transformUndoStack.length;
useLab.getState().previewTextAppearancePatch(["space-a", "space-b"], { labels: { layout: "name-hero" } });
useLab.getState().previewTextAppearancePatch(["space-a", "space-b"], { labels: { layout: "ring" } });
assert.equal(
  useLab.getState().transformUndoStack.length,
  historyBefore,
  "label previews never write history"
);
assert.equal(
  useLab.getState().appearancePreview?.[0].appearance?.text?.labels?.layout,
  "ring",
  "preview projection carries the pending label config"
);
useLab.getState().commitAppearancePreview();
assert.equal(
  useLab.getState().transformUndoStack.length,
  historyBefore + 1,
  "one release produces exactly one history entry"
);
assert.equal(
  useLab.getState().spaces[0].appearance?.text?.labels?.layout,
  "ring",
  "committed label overrides land on the canonical Cells"
);
assert.equal(
  useLab.getState().spaces[1].appearance?.text?.labels?.layout,
  "ring",
  "multi-selection applies one shared commit"
);
useLab.getState().undoSpaceTransform();
assert.equal(
  useLab.getState().spaces[0].appearance?.text?.labels,
  undefined,
  "Undo restores the Project Default"
);
useLab.getState().redoSpaceTransform();
assert.equal(
  useLab.getState().spaces[0].appearance?.text?.labels?.layout,
  "ring",
  "Redo restores the label override"
);
useLab.getState().resetAppearanceTarget(["space-a", "space-b"], "text");
assert.equal(
  useLab.getState().spaces[0].appearance?.text,
  undefined,
  "reset returns the text channel to Project Default"
);

/* --- preset thumbnails stay data-driven ------------------------------------ */

assert.ok(
  cellLabelPreset("flag").thumbnail.some((glyph) => glyph.kind === "stem"),
  "the Flag thumbnail declares its leader stem"
);

console.log("Cell label layout, ring, flag, migration, store and runtime contracts passed");
