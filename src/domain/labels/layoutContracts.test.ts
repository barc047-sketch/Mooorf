import { strict as assert } from "node:assert";
import type { SpaceCell } from "../../types";
import {
  CELL_LABEL_LAYOUT_IDS,
  DEFAULT_CELL_LABEL_LAYOUT,
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
  fitRingLabel,
  formatAreaNumber,
  resolveCellLabelLayout,
  resolveFlagAutoDirection,
  resolveLabelRuntimeScale,
  selectRuntimeLabelLayout,
  type CellLabelLayoutInput,
} from "./resolveLayout";
import {
  normalizeCellAppearanceOverrides,
  normalizeProjectPresentationDefaults,
} from "../presentation/validation";
import { applyTextAppearancePatch } from "../presentation/editing";
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

/* --- nine-preset registry completeness and distinction ------------------- */

assert.equal(CELL_LABEL_PRESETS.length, 9, "exactly nine production presets exist");
assert.deepEqual(
  CELL_LABEL_PRESETS.map((preset) => preset.id),
  [...CELL_LABEL_LAYOUT_IDS],
  "preset registry covers every layout id in order"
);
assert.equal(
  new Set(CELL_LABEL_PRESETS.map((preset) => preset.label)).size,
  9,
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
    ring: resolved.ring ? { r: resolved.ring.radiusRatio, text: resolved.ring.text } : null,
    flag: resolved.flag ? { d: resolved.flag.direction, w: resolved.flag.widthWorld } : null,
  });
});
assert.equal(new Set(signatures).size, 9, "all nine layouts resolve to visibly different projections");

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
  flag: { direction: "sideways", distance: -50, width: 9999 },
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
assert.equal(ringTop.ring?.flipped, false, "top arcs are not flipped");
assert.equal(ringTop.ring?.text, "STUDIO NORTH", "ring text uses the cased canonical name");
const ringBottom = resolveCellLabelLayout(
  layoutInput({ config: { layout: "ring", ring: { startAngleDeg: 180 } } })
);
assert.equal(ringBottom.ring?.flipped, true, "bottom arcs flip so text is never upside-down");
const ringBottomNegative = resolveCellLabelLayout(
  layoutInput({ config: { layout: "ring", ring: { startAngleDeg: -170 } } })
);
assert.equal(ringBottomNegative.ring?.flipped, true, "negative bottom angles flip identically");
assert.ok(
  ringTop.fallbackBlocks.length > 0,
  "ring keeps a compact fallback for small Cells"
);
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
const fittedLongRing = fitRingLabel(longRing.ring!, { screenRadius: 48, zoom: 1 });
assert.ok(fittedLongRing, "a medium Cell produces a fitted Ring projection");
assert.ok(
  fittedLongRing!.fit.totalArcWorld <= fittedLongRing!.fit.availableArcWorld + 0.001,
  "Ring fitting never exceeds the deterministic available arc"
);
assert.ok(
  fittedLongRing!.fit.trackingEm <=
    longRing.ring!.font.letterSpacingEm + longRing.ring!.spacingEm,
  "Ring fitting reduces tracking before truncation"
);
assert.ok(
  fittedLongRing!.font.sizeWorld <= longRing.ring!.font.sizeWorld
    && fittedLongRing!.font.sizeWorld >= longRing.ring!.font.sizeWorld * 0.72,
  "Ring fitting reduces font size only within the preset bound"
);
assert.ok(
  fittedLongRing!.fit.truncated && fittedLongRing!.text.endsWith("…"),
  "a still-overlong Ring name truncates with a truthful ellipsis"
);
assert.equal(
  fitRingLabel(longRing.ring!, { screenRadius: 20, zoom: 1 }),
  null,
  "a physically unsuitable Ring requests the preset fallback"
);

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

/* --- runtime selection: zoom gates, fallback, bounded degradation ---------- */

const runtimeResolved = resolveCellLabelLayout(layoutInput());
const wideView = selectRuntimeLabelLayout(runtimeResolved, { zoom: 1, radiusWorld: 60 });
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
assert.equal(ringRuntime.ring, null, "small cells drop the ring");
assert.equal(ringRuntime.usedFallback, true, "small cells switch to the compact fallback");
const ringRuntimeLarge = selectRuntimeLabelLayout(ringTop, { zoom: 1, radiusWorld: 80 });
assert.ok(ringRuntimeLarge.ring, "large cells keep the ring");

const denseResolved = resolveCellLabelLayout(layoutInput({
  config: {
    roles: {
      name: { size: 2.4 },
      body: { visible: true, size: 1.2 },
      metadata: { visible: true, size: 0.8 },
    },
  },
}));
const denseRuntime = selectRuntimeLabelLayout(denseResolved, { zoom: 1, radiusWorld: 28 });
assert.ok(
  !denseRuntime.blocks.some((block) => block.role === "body"),
  "bounded degradation hides Body first"
);
assert.ok(
  !denseRuntime.blocks.some((block) => block.role === "metadata"),
  "bounded degradation hides optional metadata second"
);
assert.ok(
  denseRuntime.blocks.some((block) => block.role === "name")
    && denseRuntime.blocks.some((block) => block.role === "areaNumber"),
  "bounded degradation preserves enabled Name and Area"
);
assert.ok(
  denseRuntime.fitScale >= 0.72 && denseRuntime.fitScale <= 1,
  "bounded degradation reduces typography and spacing within safe bounds"
);

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
