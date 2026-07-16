import { getAreaRange } from "../design/colorMapping";
import { areaToRadius, hitTest } from "../lib/geometry";
import type { SpaceCell } from "../types";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import { projectSelectionOverlay } from "../interaction/selection";
import {
  patchRuntimePresentation,
  projectCircleLayers,
  projectRuntimePresentation,
  resolveBoundaryStroke,
  type RuntimePresentationSettings,
} from "./presentationLayers";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};

const deepEqual = (actual: unknown, expected: unknown, message: string) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
  }
};

const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const base: SpaceCell = {
  id: "cell-a",
  name: "Studio",
  area: 100,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 20,
  y: 30,
};

const defaults = createProjectPresentationDefaults();
const settings: RuntimePresentationSettings = {
  presentationDefaults: {
    ...defaults,
    membrane: { ...defaults.membrane, visible: true },
    membraneEdge: { ...defaults.membraneEdge, visible: true, width: 2 },
  },
  paletteMode: "core",
  colorSource: "category",
  nucleusPaletteId: "editorial-aurora",
  organismPaletteId: "mode",
  morphMode: "cellular-reverse",
};

const styled: SpaceCell = {
  ...base,
  appearance: {
    boundary: {
      visible: true,
      style: "dash-dot",
      width: 3,
      offset: 4,
      alignment: "outer",
      dashLength: 10,
      gapLength: 5,
      paint: { colour: "#123456", opacity: 0.75 },
    },
    core: { visible: false },
  },
};

const runtime = projectRuntimePresentation([styled], settings, "day");
const appearance = runtime.byId.get(styled.id);
ok(appearance, "runtime projection resolves every visible Cell once");
equal(appearance?.boundary.style, "dash-dot", "runtime projection consumes canonical Boundary style");
equal(appearance?.boundary.paint.colour, "#123456", "runtime projection consumes canonical Boundary paint");
equal(appearance?.core.visible, false, "runtime targets remain independent");
equal(runtime.membrane.visible, true, "shared Membrane projection consumes project ownership");
equal(runtime.membraneEdge.visible, true, "Membrane Edge projects independently from Membrane fill");

const unaffected: SpaceCell = { ...base, id: "cell-b", x: 180 };
const patchBaseline = projectRuntimePresentation([styled, unaffected], settings, "day");
const patchedStyled: SpaceCell = {
  ...styled,
  appearance: {
    ...styled.appearance,
    boundary: { ...styled.appearance!.boundary!, width: 8 },
  },
};
const patchedRuntime = patchRuntimePresentation(
  patchBaseline,
  [patchedStyled],
  [patchedStyled, unaffected],
  settings,
  "day",
  getAreaRange([patchedStyled, unaffected]),
);
equal(patchedRuntime.byId.get(styled.id)?.boundary.width, 8, "selected-only patch resolves the changed Cell");
equal(
  patchedRuntime.byId.get(unaffected.id),
  patchBaseline.byId.get(unaffected.id),
  "selected-only patch reuses unaffected projection objects",
);
equal(patchedRuntime.membrane, patchBaseline.membrane, "selected-only patch reuses the shared Membrane projection");
equal(patchedRuntime.membraneEdge, patchBaseline.membraneEdge, "selected-only patch reuses the shared Membrane Edge projection");

const classic = resolveBoundaryStroke(appearance!.boundary, 2, "classic");
equal(classic.requestedStyle, "dash-dot", "Classic reports the requested Boundary style");
equal(classic.renderedStyle, "dash-dot", "Classic supports the complete essential style set");
equal(classic.fallback, null, "Classic does not claim a fallback for supported styles");
equal(classic.widthPx, 6, "Boundary width is world-scaled");
equal(classic.offsetPx, 8, "Boundary offset is world-scaled");
equal(classic.radiusDeltaPx, 11, "outer alignment positions the stroke outside its anchor");
deepEqual(classic.lineDashPx, [20, 10, 0.12, 16], "dash-dot geometry scales deterministically");

const organism = resolveBoundaryStroke(appearance!.boundary, 2, "organism");
equal(organism.requestedStyle, "dash-dot", "Organism preserves requested-style metadata");
equal(organism.renderedStyle, "dash-dot", "Organism renders the canonical technical stroke through its Canvas2D overlay");
equal(organism.fallback, null, "Organism no longer needs a technical-style fallback");
deepEqual(organism.lineDashPx, [20, 10, 0.12, 16], "Organism uses the same deterministic dash-dot sequence");

const classicLayers = projectCircleLayers(styled, appearance!, 40, 2, "classic");
equal(classicLayers.cell?.radiusPx, 40, "Cell paint uses the unchanged area-driven radius");
equal(classicLayers.cell?.colour, appearance!.cell.paint.colour, "Cell layer consumes canonical paint");
equal(classicLayers.boundary?.strokes.length, 1, "single-line Boundary styles project one stroke");
equal(classicLayers.boundary?.strokes[0].radiusPx, 51, "Boundary offset/alignment changes only visual stroke radius");
deepEqual(classicLayers.boundary?.strokes[0].lineDashPx, [20, 10, 0.12, 16], "Boundary layer consumes technical dash geometry");
equal(classicLayers.core, null, "Core visibility remains independent from Cell and Boundary");
equal(classicLayers.void, null, "ordinary Cells never project Void appearance");

const doubleLayers = projectCircleLayers(
  styled,
  { ...appearance!, boundary: { ...appearance!.boundary, style: "double" } },
  40,
  2,
  "classic"
);
equal(doubleLayers.boundary?.strokes.length, 2, "double Boundary projects two deterministic strokes");

const organismLayers = projectCircleLayers(styled, appearance!, 40, 2, "organism");
equal(organismLayers.boundary?.fallback, null, "Organism layer reports canonical technical-style support");
equal(organismLayers.boundary?.strokes[0].renderedStyle, "dash-dot", "Organism layer renders the requested technical stroke");

for (const style of ["solid", "dashed", "dotted", "dash-dot", "double", "segmented-bars"] as const) {
  const boundary = { ...appearance!.boundary, style };
  equal(resolveBoundaryStroke(boundary, 1, "classic").renderedStyle, style, `Classic supports ${style}`);
  equal(resolveBoundaryStroke(boundary, 1, "organism").renderedStyle, style, `Organism supports ${style}`);
}

const includedSelection = projectSelectionOverlay({
  visibleIds: [styled.id],
  selectedIds: [styled.id],
  primarySelectedId: styled.id,
  hoveredId: null,
  include: true,
});
equal(includedSelection.get(styled.id), "primary", "selection is an explicit temporary overlay projection");
equal(projectSelectionOverlay({
  visibleIds: [styled.id],
  selectedIds: [styled.id],
  primarySelectedId: styled.id,
  hoveredId: null,
  include: false,
}).size, 0, "clean export excludes the complete selection projection");

const radiusBefore = areaToRadius(base.area);
const radiusAfter = areaToRadius(styled.area);
equal(radiusAfter, radiusBefore, "Boundary appearance never changes area-driven radius");
equal(hitTest([base], base.x + radiusBefore - 0.1, base.y)?.id, base.id, "baseline hit test reaches the Cell edge");
equal(hitTest([styled], styled.x + radiusAfter - 0.1, styled.y)?.id, styled.id, "styled hit test remains geometry-owned");
equal(hitTest([styled], styled.x + radiusAfter + 0.1, styled.y), null, "visual Boundary offset never expands hit testing");

const voidCell: SpaceCell = { ...styled, id: "void-a", kind: "void" };
const resolvedVoidCell = projectRuntimePresentation([voidCell], settings, "day").byId.get(voidCell.id);
const voidAppearance = resolvedVoidCell?.void;
equal(voidAppearance?.semantics.subtractive, true, "Void remains subtractive in runtime projection");
equal(voidAppearance?.semantics.appearanceAffectsGeometry, false, "Void paint never alters subtraction geometry");
equal(voidAppearance?.semantics.appearanceAffectsHitTesting, false, "Void paint never alters hit testing");
const voidLayers = projectCircleLayers(voidCell, resolvedVoidCell!, 30, 2, "classic");
equal(voidLayers.cell, null, "Void never aliases the Cell fill layer");
equal(voidLayers.boundary, null, "Void never aliases the Boundary layer");
equal(voidLayers.core, null, "Void never aliases the Core layer");
equal(voidLayers.void?.radiusPx, 30, "Void appearance uses but never changes subtractive geometry");
equal(voidLayers.void?.edgeWidthPx, 3, "Void edge width is world-scaled presentation only");
deepEqual(voidLayers.void?.lineDashPx, [], "Void Edge defaults to a solid world-scaled stroke");
equal("innerRadiusPx" in (voidLayers.void ?? {}), false, "Void projection contains no unconditional inner-circle instruction");
equal("innerEdgeOpacity" in (voidLayers.void ?? {}), false, "Void projection contains no hidden inner-edge presentation owner");

console.info("runtime presentation contracts passed");
