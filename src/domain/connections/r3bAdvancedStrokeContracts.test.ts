import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import {
  applyConnectionStylePatch,
  copyResolvedConnectionStyle,
  createDefaultProjectConnectionStyles,
  pasteConnectionStyleVisual,
  resolveConnectionStyle,
  resolveConnectionStylePreview,
  updateProjectConnectionStyle,
} from "./styles";
import {
  createConnectionPathCache,
  drawConnectionBatch,
  projectConnections,
} from "../../canvas/connections/renderer";
import { createDefaultConnectionFilterSpec } from "./filters";

const source = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  "utf8",
);

type StrokePoint = { x: number; y: number };
type StrokeMotif = {
  paths: StrokePoint[][];
  marks: Array<{ from: StrokePoint; to: StrokePoint }>;
  metrics: { amplitude: number; repetitions: number; wavelength: number };
};
type StrokePatternModule = {
  CONNECTION_STROKE_PATTERNS: Array<{
    id: string;
    name: string;
    family: string;
    preview: { strategy: string };
    rendererStrategy: string;
    capabilities: { amplitude: boolean; scale: boolean };
  }>;
  buildConnectionStrokeMotif(
    centerline: { kind: "polyline" | "bezier"; points: StrokePoint[] },
    patternId: string,
    patternScale: number,
    patternAmplitude: number,
  ): StrokeMotif;
  resolveConnectionStrokePattern(id: string): { id: string; capabilities: { amplitude: boolean; scale: boolean } };
};

const loadStrokePatternModule = async (): Promise<Partial<StrokePatternModule>> => {
  const modulePath = "./strokePatterns";
  try {
    return await import(modulePath) as Partial<StrokePatternModule>;
  } catch {
    return {};
  }
};

const connection = (id: string, visual?: Connection["visual"]): Connection => ({
  id,
  fromSpaceId: "a",
  toSpaceId: "b",
  enabled: true,
  semantic: {
    typeId: "adjacency",
    requirement: "optional",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: `${id} notes`,
  },
  annotation: { title: { source: "custom", text: `${id} title` } },
  ...(visual ? { visual } : {}),
});

test("stroke pattern registry preserves the core set and exposes the bounded advanced set", async () => {
  const module = await loadStrokePatternModule();
  assert.ok(Array.isArray(module.CONNECTION_STROKE_PATTERNS), "canonical stroke registry must exist");
  const definitions = module.CONNECTION_STROKE_PATTERNS!;
  const ids = definitions.map((definition) => definition.id);
  for (const id of [
    "solid", "dashed", "dotted", "dash-dot", "double", "segmented-bars",
    "zigzag", "wave", "scallop", "vertical-hash", "lightning",
  ]) assert.ok(ids.includes(id), `${id} must be registry-backed`);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(definitions.every((definition) => definition.preview.strategy === definition.rendererStrategy));
  assert.equal(module.resolveConnectionStrokePattern?.("wave").capabilities.amplitude, true);
  assert.equal(module.resolveConnectionStrokePattern?.("dashed").capabilities.amplitude, false);
});

test("adaptive preview length adds motif repetitions without changing wavelength or amplitude", async () => {
  const module = await loadStrokePatternModule();
  assert.equal(typeof module.buildConnectionStrokeMotif, "function");
  const build = module.buildConnectionStrokeMotif!;
  const short = build({ kind: "polyline", points: [{ x: 0, y: 15 }, { x: 110, y: 15 }] }, "wave", 1, 5);
  const long = build({ kind: "polyline", points: [{ x: 0, y: 15 }, { x: 220, y: 15 }] }, "wave", 1, 5);
  assert.equal(short.metrics.wavelength, long.metrics.wavelength);
  assert.equal(short.metrics.amplitude, long.metrics.amplitude);
  assert.ok(long.metrics.repetitions > short.metrics.repetitions);
  assert.ok(long.paths[0]!.length > short.paths[0]!.length);

  const previewSource = source("../../ui/RelationshipTypePicker.tsx");
  const widgetCss = source("../../ui/widgets/widgets.css");
  assert.match(previewSource, /ResizeObserver/);
  assert.match(previewSource, /data-specimen-length/);
  assert.doesNotMatch(previewSource, /preserveAspectRatio="none"/);
  assert.match(widgetCss, /\.relationship-type-preview\s*\{[^}]*clamp\(/i);
  assert.doesNotMatch(widgetCss, /\.relationship-type-preview\s*\{[^}]*min-width:\s*132px/i);
});

test("cap, join, width, pattern scale, and amplitude normalize and round-trip canonically", () => {
  const styles = createDefaultProjectConnectionStyles() as unknown as Record<string, any>;
  assert.equal(styles.custom.lineCap, "butt");
  assert.equal(styles.custom.lineJoin, "miter");
  const updated = updateProjectConnectionStyle(styles as never, "custom", {
    lineCap: "round",
    lineJoin: "bevel",
    strokePatternId: "wave",
    appearance: { width: 96, dashScale: 2.5, patternAmplitude: 80 },
  } as never) as unknown as Record<string, any>;
  assert.equal(updated.custom.lineCap, "round");
  assert.equal(updated.custom.lineJoin, "bevel");
  assert.equal(updated.custom.strokePatternId, "wave");
  assert.equal(updated.custom.appearance.width, 64);
  assert.equal(updated.custom.appearance.dashScale, 2.5);
  assert.equal(updated.custom.appearance.patternAmplitude, 64);
  const bounded = applyConnectionStylePatch(updated.custom, {
    lineCap: "square",
    lineJoin: "round",
    appearance: { width: -4, patternAmplitude: -2 },
  } as never) as any;
  assert.equal(bounded.lineCap, "square");
  assert.equal(bounded.lineJoin, "round");
  assert.equal(bounded.appearance.width, 0.5);
  assert.equal(bounded.appearance.patternAmplitude, 0.5);
});

class RecordingContext {
  globalAlpha = 1;
  lineWidth = 1;
  lineCap: CanvasLineCap = "butt";
  lineJoin: CanvasLineJoin = "miter";
  strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
  fillStyle: string | CanvasGradient | CanvasPattern = "#000";
  currentDash: number[] = [];
  lineSegments = 0;
  strokes: Array<{ cap: CanvasLineCap; join: CanvasLineJoin; dash: number[] }> = [];
  save() {}
  restore() {}
  beginPath() {}
  moveTo() {}
  lineTo() { this.lineSegments += 1; }
  bezierCurveTo() {}
  closePath() {}
  translate() {}
  rotate() {}
  arc() {}
  rect() {}
  fill() {}
  setLineDash(value: number[]) { this.currentDash = [...value]; }
  stroke() { this.strokes.push({ cap: this.lineCap, join: this.lineJoin, dash: [...this.currentDash] }); }
}

test("Canvas consumes canonical cap/join and renders vertical-hash around an unchanged centerline", () => {
  const styles = createDefaultProjectConnectionStyles();
  const authored = connection("technical", {
    geometryId: "orthogonal",
    strokePatternId: "vertical-hash",
    lineCap: "square",
    lineJoin: "bevel",
    appearance: { width: 12, dashScale: 1.25, patternAmplitude: 7 },
  } as never);
  const result = projectConnections({
    connections: [authored],
    endpoints: new Map([
      ["a", { id: "a", x: 80, y: 120, radius: 20 }],
      ["b", { id: "b", x: 300, y: 120, radius: 20 }],
    ]),
    styles,
    filter: createDefaultConnectionFilterSpec(),
    viewport: { x: 0, y: 0, width: 400, height: 300 },
    selectedIds: new Set(),
    changedEndpointIds: new Set(),
    lod: "full",
    focusMode: "all",
  }, createConnectionPathCache());
  assert.equal(result.commands[0]?.style.geometryId, "orthogonal");
  assert.equal(result.commands[0]?.style.strokePatternId, "vertical-hash");
  const canonicalPath = structuredClone(result.commands[0]!.path);
  const context = new RecordingContext();
  drawConnectionBatch(context as unknown as CanvasRenderingContext2D, result.commands, {
    theme: "day",
    scale: 1,
    fadeUnrelated: false,
    drawLabels: false,
    markerDetail: "full",
    patternFallback: false,
  });
  assert.ok(context.strokes.some((stroke) => stroke.cap === "square" && stroke.join === "bevel"));
  assert.ok(context.lineSegments > 8, "vertical hash must render repeated canonical marks");
  assert.deepEqual(result.commands[0]!.path, canonicalPath, "pattern treatment cannot mutate topology");
  const rendererSource = source("../../canvas/connections/renderer.ts");
  assert.doesNotMatch(rendererSource, /appearance\.patternAmplitude\s*\/\s*screenScale/);
  assert.doesNotMatch(rendererSource, /appearance\.dashScale\s*\/\s*screenScale/);
});

test("advanced fields participate in live fixed-target multi preview and remain history-free until Apply", async () => {
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  const first = connection("first", { lineCap: "butt", lineJoin: "miter", appearance: { width: 2 } } as never);
  const second = connection("second", { lineCap: "round", lineJoin: "round", appearance: { width: 7 } } as never);
  useLab.setState({
    spaces: [
      { id: "a", name: "A", x: 80, y: 120, area: 24, category: "Shared", kind: "space" },
      { id: "b", name: "B", x: 300, y: 120, area: 24, category: "Shared", kind: "space" },
    ],
    connections: [first, second],
    selectedConnectionIds: ["first", "second"],
    primarySelectedConnectionId: "second",
    transformUndoStack: [],
    transformRedoStack: [],
    connectionStyleEditorTarget: null,
    connectionStyleEditorPreview: null,
    settings: {
      ...current.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes: [],
    },
  } as never);
  assert.equal(useLab.getState().openConnectionStyleEditor({
    context: "connection-override",
    connectionIds: ["first", "second"],
  }), true);
  assert.equal(useLab.getState().previewConnectionStyleEditor({
    lineCap: "square",
    lineJoin: "bevel",
    strokePatternId: "zigzag",
    appearance: { dashScale: 1.5, patternAmplitude: 8 },
  } as never), true);
  assert.deepEqual(useLab.getState().connections, [first, second]);
  assert.equal(useLab.getState().transformUndoStack.length, 0);
  for (const authored of useLab.getState().connections) {
    const resolved = resolveConnectionStylePreview(
      authored,
      useLab.getState().settings.connectionStyles,
      [],
      useLab.getState().connectionStyleEditorPreview,
    ) as any;
    assert.equal(resolved.lineCap, "square");
    assert.equal(resolved.lineJoin, "bevel");
    assert.equal(resolved.strokePatternId, "zigzag");
    assert.equal(resolved.appearance.patternAmplitude, 8);
  }
  useLab.getState().cancelConnectionStyleEditor();
  assert.deepEqual(useLab.getState().connections, [first, second]);
  assert.equal(useLab.getState().transformUndoStack.length, 0);

  useLab.getState().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["first", "second"] });
  useLab.getState().previewConnectionStyleEditor({ lineJoin: "bevel" } as never);
  assert.equal(useLab.getState().commitConnectionStyleEditor(), true);
  assert.equal(useLab.getState().transformUndoStack.length, 1);
  assert.equal((useLab.getState().connections[0]?.visual as any)?.lineCap, "butt", "untouched cap stays local");
  assert.equal((useLab.getState().connections[1]?.visual as any)?.lineCap, "round", "untouched mixed cap stays local");
});

test("style clipboard carries advanced visual language while excluding topology and annotations", () => {
  const styles = createDefaultProjectConnectionStyles();
  const authored = connection("source", {
    geometryId: "curved",
    strokePatternId: "lightning",
    lineCap: "square",
    lineJoin: "bevel",
    appearance: { width: 40, dashScale: 1.8, patternAmplitude: 11 },
  } as never);
  const clipboard = copyResolvedConnectionStyle(authored, styles) as any;
  assert.equal(clipboard.lineCap, "square");
  assert.equal(clipboard.lineJoin, "bevel");
  assert.equal(clipboard.strokePatternId, "lightning");
  assert.equal(clipboard.appearance.width, 40);
  assert.equal(clipboard.appearance.dashScale, 1.8);
  assert.equal(clipboard.appearance.patternAmplitude, 11);

  const target = connection("target", { startAnchorId: "left" });
  const visual = pasteConnectionStyleVisual(clipboard, target, styles) as any;
  const pasted = { ...target, visual };
  const resolved = resolveConnectionStyle(pasted, styles) as any;
  assert.equal(resolved.lineCap, "square");
  assert.equal(resolved.lineJoin, "bevel");
  assert.equal(resolved.strokePatternId, "lightning");
  assert.equal(resolved.appearance.patternAmplitude, 11);
  assert.equal(visual.startAnchorId, "left");
  assert.deepEqual(pasted.annotation, target.annotation);
  assert.deepEqual(pasted.semantic, target.semantic);
});

test("Style Panel exposes icon-first cap/join controls and capability-driven amplitude", () => {
  const studio = source("../../ui/widgets/ConnectionStudioWidget.tsx");
  assert.match(studio, /ConnectionLineCapSpecimen/);
  assert.match(studio, /ConnectionLineJoinSpecimen/);
  assert.match(studio, /resolveConnectionStrokePattern/);
  assert.match(studio, /Pattern scale/);
  assert.match(studio, /Pattern amplitude/);
  assert.match(studio, /capabilities\.amplitude/);
  assert.doesNotMatch(studio, /aria-label="Line cap"[\s\S]{0,180}<select/);
  assert.doesNotMatch(studio, /aria-label="Line join"[\s\S]{0,180}<select/);
});
