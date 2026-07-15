import { areaToRadius } from "../lib/geometry";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import { DEFAULT_RESOURCE_SETTINGS } from "../resources/resourcePersistence";
import type { SpaceCell } from "../types";
import { DEFAULT_CELL_SHADOW } from "./cellShadow";
import { drawScene } from "./renderer";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};

const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

interface ArcRecord {
  radius: number;
  fillStyle: unknown;
  strokeStyle: unknown;
  lineWidth: number;
  lineDash: readonly number[];
  alpha: number;
}

const records: { fills: ArcRecord[]; strokes: ArcRecord[] } = { fills: [], strokes: [] };
let currentRadius = 0;
let lineDash: number[] = [];
let currentAlpha = 1;
let currentFillStyle: string | CanvasGradient | CanvasPattern = "";
let currentStrokeStyle: string | CanvasGradient | CanvasPattern = "";
let currentLineWidth = 1;
const stack: Array<{ alpha: number; fillStyle: unknown; strokeStyle: unknown; lineWidth: number; lineDash: number[] }> = [];
const gradient = { addColorStop: () => undefined } as unknown as CanvasGradient;
const ctx = {
  get globalAlpha() { return currentAlpha; },
  set globalAlpha(value: number) { currentAlpha = value; },
  get fillStyle() { return currentFillStyle; },
  set fillStyle(value: string | CanvasGradient | CanvasPattern) { currentFillStyle = value; },
  get strokeStyle() { return currentStrokeStyle; },
  set strokeStyle(value: string | CanvasGradient | CanvasPattern) { currentStrokeStyle = value; },
  get lineWidth() { return currentLineWidth; },
  set lineWidth(value: number) { currentLineWidth = value; },
  lineCap: "butt",
  lineJoin: "miter",
  filter: "none",
  font: "",
  textAlign: "start",
  textBaseline: "alphabetic",
  setTransform: () => undefined,
  translate: () => undefined,
  scale: () => undefined,
  clearRect: () => undefined,
  save() {
    stack.push({
      alpha: currentAlpha,
      fillStyle: currentFillStyle,
      strokeStyle: currentStrokeStyle,
      lineWidth: currentLineWidth,
      lineDash: [...lineDash],
    });
  },
  restore() {
    const state = stack.pop();
    if (!state) return;
    currentAlpha = state.alpha;
    currentFillStyle = state.fillStyle as typeof currentFillStyle;
    currentStrokeStyle = state.strokeStyle as typeof currentStrokeStyle;
    currentLineWidth = state.lineWidth;
    lineDash = state.lineDash;
  },
  beginPath: () => undefined,
  arc: (_x: number, _y: number, radius: number) => { currentRadius = radius; },
  fill() {
    records.fills.push({
      radius: currentRadius,
      fillStyle: currentFillStyle,
      strokeStyle: currentStrokeStyle,
      lineWidth: currentLineWidth,
      lineDash: [...lineDash],
      alpha: currentAlpha,
    });
  },
  stroke() {
    records.strokes.push({
      radius: currentRadius,
      fillStyle: currentFillStyle,
      strokeStyle: currentStrokeStyle,
      lineWidth: currentLineWidth,
      lineDash: [...lineDash],
      alpha: currentAlpha,
    });
  },
  setLineDash: (dash: number[]) => { lineDash = [...dash]; },
  createRadialGradient: () => gradient,
  strokeText: () => undefined,
  fillText: () => undefined,
} as unknown as CanvasRenderingContext2D;

const defaults = createProjectPresentationDefaults();
const cell: SpaceCell = {
  id: "styled",
  name: "Styled",
  area: 100,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
  appearance: {
    cell: { paint: { colour: "#445566", opacity: 0.8 } },
    boundary: {
      visible: true,
      style: "dashed",
      width: 3,
      offset: 4,
      alignment: "outer",
      dashLength: 10,
      gapLength: 5,
      paint: { colour: "#123456", opacity: 0.7 },
    },
    core: { visible: true, size: 0.2, paint: { colour: "#abcdef", opacity: 0.6 } },
  },
};

drawScene(
  ctx,
  800,
  600,
  1,
  { x: 0, y: 0, zoom: 2 },
  [cell],
  null,
  null,
  { ink: "#111111", fog: "#777777", hairline: "#aaaaaa", surface: "#ffffff", chromeAccent: "#ff0000" },
  1_000,
  {
    blobOn: false,
    mergeDistance: 0,
    morphMode: "cellular-reverse",
    attachMode: "soft",
    paletteMode: "core",
    nucleusPaletteId: "editorial-aurora",
    organismPaletteId: "mode",
    colorSource: "category",
    annotationDetail: {
      textScale: 1,
      textShadow: false,
      showName: true,
      showArea: true,
      showCategory: true,
      position: "auto",
      boundingBox: false,
    },
    labelScaleMode: "screen",
    labelColourMode: "auto",
    labelCustomColour: "#000000",
    cellShadow: DEFAULT_CELL_SHADOW,
    performanceQuality: "balanced",
    presentationDefaults: defaults,
    resources: DEFAULT_RESOURCE_SETTINGS,
  },
  { includeLabels: false, selectedIds: [], isExport: true }
);

const radius = areaToRadius(cell.area) * 2;
ok(records.fills.some((record) => record.fillStyle === "#445566" && record.radius === radius && record.alpha === 0.8), "Classic consumes canonical Cell paint");
ok(records.strokes.some((record) => record.strokeStyle === "#123456" && record.radius === radius + 11 && record.lineWidth === 6), "Classic consumes Boundary offset/alignment without changing Cell radius");
ok(records.strokes.some((record) => record.strokeStyle === "#123456" && JSON.stringify(record.lineDash) === JSON.stringify([20, 10])), "Classic consumes Boundary dash/bar geometry");
ok(records.fills.some((record) => record.fillStyle === "#abcdef" && record.radius === radius * 0.2 && record.alpha === 0.6), "Classic renders Core as an independent dot layer");
equal(records.strokes.filter((record) => record.strokeStyle === "#123456").length, 1, "dashed Boundary is one technical stroke");

Object.defineProperty(globalThis, "Path2D", {
  configurable: true,
  value: class {
    moveTo() {}
    arc() {}
    closePath() {}
  },
});
records.fills.length = 0;
records.strokes.length = 0;
const membraneDefaults = {
  ...defaults,
  membrane: { ...defaults.membrane, visible: true, paint: { ...defaults.membrane.paint, colour: "#112233", opacity: 0.4 } },
  membraneEdge: { ...defaults.membraneEdge, visible: true, width: 2, paint: { ...defaults.membraneEdge.paint, colour: "#334455", opacity: 0.65 } },
};
const membraneSettings = {
  blobOn: true,
  mergeDistance: 0,
  morphMode: "cellular-reverse" as const,
  attachMode: "soft" as const,
  paletteMode: "core" as const,
  nucleusPaletteId: "editorial-aurora",
  organismPaletteId: "mode",
  colorSource: "category" as const,
  annotationDetail: {
    textScale: 1,
    textShadow: false,
    showName: true,
    showArea: true,
    showCategory: true,
    position: "auto" as const,
    boundingBox: false,
  },
  labelScaleMode: "screen" as const,
  labelColourMode: "auto" as const,
  labelCustomColour: "#000000",
  cellShadow: DEFAULT_CELL_SHADOW,
  performanceQuality: "balanced" as const,
  presentationDefaults: membraneDefaults,
  resources: DEFAULT_RESOURCE_SETTINGS,
};
drawScene(
  ctx,
  800,
  600,
  1,
  { x: 0, y: 0, zoom: 2 },
  [cell],
  null,
  null,
  { ink: "#111111", fog: "#777777", hairline: "#aaaaaa", surface: "#ffffff", chromeAccent: "#ff0000" },
  1_000,
  membraneSettings,
  { includeLabels: false, selectedIds: [], isExport: true }
);
ok(records.fills.some((record) => record.fillStyle === "#112233" && record.alpha === 0.4), "Classic Membrane consumes canonical fill paint");
ok(records.strokes.some((record) => record.strokeStyle === "#334455" && record.lineWidth === 2 && record.alpha === 0.65), "Classic Membrane Edge is independently rendered in world units");

records.fills.length = 0;
records.strokes.length = 0;
drawScene(
  ctx,
  800,
  600,
  1,
  { x: 0, y: 0, zoom: 2 },
  [cell],
  null,
  null,
  { ink: "#111111", fog: "#777777", hairline: "#aaaaaa", surface: "#ffffff", chromeAccent: "#ff0000" },
  1_000,
  {
    ...membraneSettings,
    blobOn: false,
    presentationDefaults: {
      ...membraneDefaults,
      membrane: { ...membraneDefaults.membrane, visible: false },
    },
  },
  { includeLabels: false, selectedIds: [], isExport: true }
);
ok(!records.fills.some((record) => record.fillStyle === "#112233" && record.alpha > 0), "Membrane fill can be disabled independently");
ok(records.strokes.some((record) => record.strokeStyle === "#334455"), "Membrane Edge remains visible without Membrane fill");

console.info("runtime renderer integration contracts passed");
