import { strict as assert } from "node:assert";
import type { SpaceCell } from "../types";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import type { BoundaryStyle } from "../domain/presentation/types";
import { resolveCellAppearance } from "../domain/presentation/resolveAppearance";
import * as presentation from "./presentationLayers";

const styles: readonly BoundaryStyle[] = ["solid", "dashed", "dotted", "dash-dot", "double", "segmented-bars"];
const defaults = createProjectPresentationDefaults();
const base: SpaceCell = {
  id: "renderer-a",
  name: "Studio",
  body: "Renderer behaviour",
  area: 80,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
};
const context = {
  paletteMode: "core" as const,
  colorSource: "category" as const,
  nucleusPaletteId: "editorial-aurora",
  organismPaletteId: "mode",
  areaRange: { min: 80, max: 80 },
  spaces: [base],
  theme: "day" as const,
};

type RecordingPaint = string | CanvasGradient | CanvasPattern;

class RecordingContext {
  globalAlpha = 1;
  fillStyle: RecordingPaint = "#000000";
  strokeStyle: RecordingPaint = "#000000";
  lineWidth = 1;
  lineCap: CanvasLineCap = "butt";
  readonly dashCalls: number[][] = [];
  readonly arcs: Array<{ radius: number; lineCap: CanvasLineCap; dash: number[] }> = [];
  readonly fills: Array<{ alpha: number; style: string }> = [];
  readonly strokes: Array<{ alpha: number; style: string; lineCap: CanvasLineCap; dash: number[] }> = [];
  private dash: number[] = [];
  private stack: Array<{ alpha: number; fill: RecordingPaint; stroke: RecordingPaint; width: number; cap: CanvasLineCap; dash: number[] }> = [];

  save() { this.stack.push({ alpha: this.globalAlpha, fill: this.fillStyle, stroke: this.strokeStyle, width: this.lineWidth, cap: this.lineCap, dash: [...this.dash] }); }
  restore() { const state = this.stack.pop(); if (!state) return; this.globalAlpha = state.alpha; this.fillStyle = state.fill; this.strokeStyle = state.stroke; this.lineWidth = state.width; this.lineCap = state.cap; this.dash = state.dash; }
  beginPath() {}
  setLineDash(value: number[]) { this.dash = [...value]; this.dashCalls.push([...value]); }
  arc(_x: number, _y: number, radius: number) { this.arcs.push({ radius, lineCap: this.lineCap, dash: [...this.dash] }); }
  fill() { this.fills.push({ alpha: this.globalAlpha, style: String(this.fillStyle) }); }
  stroke() { this.strokes.push({ alpha: this.globalAlpha, style: String(this.strokeStyle), lineCap: this.lineCap, dash: [...this.dash] }); }
}

for (const style of styles) {
  const appearance = resolveCellAppearance({
    ...base,
    appearance: {
      boundary: {
        visible: true,
        style,
        width: 3,
        dashLength: 9,
        gapLength: 4,
        secondaryLineSpacing: 5,
      },
    },
  }, defaults, context);
  for (const renderer of ["classic", "organism"] as const) {
    const layers = presentation.projectCircleLayers(base, appearance, 50, 2, renderer);
    assert.equal(layers.boundary?.renderedStyle, style, `${renderer} renders ${style} without coercion`);
    assert.equal(layers.boundary?.fallback, null, `${renderer} reports no fallback for ${style}`);
    const ctx = new RecordingContext();
    presentation.drawCircleLayers(ctx as unknown as CanvasRenderingContext2D, 100, 100, layers, {
      cell: false,
      core: false,
      void: false,
    });
    assert.equal(ctx.strokes.length, style === "double" ? 2 : 1, `${renderer} draws the expected ${style} stroke count`);
  }
}

const technicalBoundary = {
  visible: true,
  style: "dash-dot" as const,
  width: 3,
  offset: 0,
  alignment: "centre",
  dashLength: 9,
  gapLength: 4,
  secondaryLineSpacing: 5,
  paint: { requestedMaterialId: "system:ink", materialId: "system:ink", status: "resolved", colour: "#171715", opacity: 1 },
} as const;
const dashDot = presentation.resolveBoundaryStroke(technicalBoundary, 2, "organism");
assert.equal(dashDot.lineDashPx.length, 4, "dash-dot emits dash, gap, dot and gap segments");
assert.ok(dashDot.lineDashPx[0] > 1 && dashDot.lineDashPx[2] > 0 && dashDot.lineDashPx[2] < 1, "dash-dot contains a visible dash and bounded dot mark");
assert.equal(dashDot.lineCap, "round", "dash-dot renders a rounded dot sequence");

const dashed = presentation.resolveBoundaryStroke({ ...technicalBoundary, style: "dashed" }, 2, "organism");
const segmentedBars = presentation.resolveBoundaryStroke({ ...technicalBoundary, style: "segmented-bars" }, 2, "organism");
assert.notDeepEqual(segmentedBars.lineDashPx, dashed.lineDashPx, "segmented bars are visibly distinct from dashed strokes");
assert.deepEqual(segmentedBars.lineDashPx, [18, 4, 18, 12], "segmented bars render deterministic grouped bar pairs");

const coreOffAppearance = resolveCellAppearance(base, {
  ...defaults,
  core: { ...defaults.core, visible: false },
}, context);
const coreOffLayers = presentation.projectCircleLayers(base, coreOffAppearance, 50, 1, "organism");
assert.equal(coreOffLayers.core, null, "Project Defaults Core off projects no Core layer");
const coreOffCtx = new RecordingContext();
presentation.drawCircleLayers(coreOffCtx as unknown as CanvasRenderingContext2D, 100, 100, coreOffLayers, {
  cell: false,
  boundary: false,
  void: false,
});
assert.equal(coreOffCtx.fills.length, 0, "Core-off Canvas2D rendering creates no centre fill");
const debugProjection = (presentation as Record<string, unknown>).projectOrganismDebugPresentation as ((enabled: boolean) => { rings: boolean; centreDots: boolean }) | undefined;
assert.equal(typeof debugProjection, "function", "Organism debug markers use an explicit renderer projection");
assert.deepEqual(debugProjection?.(true), { rings: true, centreDots: false }, "Cell field debug never reintroduces a Core-like centre dot");

const voidCell: SpaceCell = {
  ...base,
  id: "void-a",
  kind: "void",
  appearance: {
    cell: { visible: true },
    boundary: { visible: true },
    core: { visible: true },
    void: { visible: true, fillVisible: true, edgeVisible: true, edgeWidth: 4 },
  },
};
const voidAppearance = resolveCellAppearance(voidCell, defaults, { ...context, spaces: [voidCell] });
const voidLayers = presentation.projectCircleLayers(voidCell, voidAppearance, 50, 1, "organism");
assert.equal(voidLayers.cell, null, "Cell Surface never renders on Void");
assert.equal(voidLayers.boundary, null, "Boundary never renders on Void");
assert.equal(voidLayers.core, null, "Core never renders on Void");
assert.ok(voidLayers.void, "Void Fill and Edge remain renderable");

const drawOrganismOverlay = (presentation as Record<string, unknown>).drawOrganismCircleOverlay as ((
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  layers: ReturnType<typeof presentation.projectCircleLayers>,
  options: { spaceKind: "space" | "void"; plainMode: boolean; backgroundColour: string; baseRadiusPx: number }
) => void) | undefined;
assert.equal(typeof drawOrganismOverlay, "function", "Organism uses one executable Canvas2D Cell/Boundary/Core/Void overlay adapter");

const translucentAppearance = resolveCellAppearance({
  ...base,
  appearance: {
    cell: { visible: true, paint: { colour: "#224466", opacity: 0.35 } },
    core: { visible: false },
  },
}, defaults, context);
const translucentLayers = presentation.projectCircleLayers(base, translucentAppearance, 50, 1, "organism");
const translucentCtx = new RecordingContext();
drawOrganismOverlay?.(translucentCtx as unknown as CanvasRenderingContext2D, 100, 100, translucentLayers, {
  spaceKind: "space",
  plainMode: true,
  backgroundColour: "#ffffff",
  baseRadiusPx: 50,
});
assert.deepEqual(translucentCtx.fills.map(({ alpha, style }) => ({ alpha, style })), [
  { alpha: 1, style: "#ffffff" },
  { alpha: 0.35, style: "#224466" },
], "Organism plain mode masks the legacy body then draws canonical Cell opacity");

console.info("C0 M1 executable renderer behaviour passed");
