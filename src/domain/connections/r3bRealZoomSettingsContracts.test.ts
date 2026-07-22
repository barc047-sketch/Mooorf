import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import { createDefaultConnectionFilterSpec } from "./filters";
import {
  createDefaultProjectConnectionStyles,
  normalizeConnectionViewSettings,
  type ResolvedConnectionStyle,
} from "./styles";

const source = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  "utf8",
);

type Point = { x: number; y: number };

class FinalBoundaryContext {
  globalAlpha = 1;
  lineWidth = 1;
  lineCap: CanvasLineCap = "butt";
  lineJoin: CanvasLineJoin = "miter";
  strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
  fillStyle: string | CanvasGradient | CanvasPattern = "#000";
  currentDash: number[] = [];
  currentPath: Point[] = [];
  strokes: Array<{ width: number; dash: number[]; points: Point[] }> = [];
  fills: Point[][] = [];
  translations: Point[] = [];
  readonly canvas = {
    width: 800,
    height: 600,
    getBoundingClientRect: () => ({ width: 400, height: 300 }),
  };

  save() {}
  restore() {}
  beginPath() { this.currentPath = []; }
  moveTo(x: number, y: number) { this.currentPath.push({ x, y }); }
  lineTo(x: number, y: number) { this.currentPath.push({ x, y }); }
  bezierCurveTo(_a: number, _b: number, _c: number, _d: number, x: number, y: number) {
    this.currentPath.push({ x, y });
  }
  closePath() {}
  translate(x: number, y: number) { this.translations.push({ x, y }); }
  rotate() {}
  arc(_x: number, _y: number, radius: number) { this.currentPath.push({ x: radius, y: 0 }); }
  rect(x: number, y: number, width: number, height: number) {
    this.currentPath.push({ x, y }, { x: x + width, y: y + height });
  }
  fill() { this.fills.push(this.currentPath.map((point) => ({ ...point }))); }
  setLineDash(value: number[]) { this.currentDash = [...value]; }
  stroke() {
    this.strokes.push({
      width: this.lineWidth,
      dash: [...this.currentDash],
      points: this.currentPath.map((point) => ({ ...point })),
    });
  }
  getTransform() { return { a: 3, b: 0, c: 0, d: 3, e: 0, f: 0 }; }
}

const authoredStyle = (strokePatternId: ResolvedConnectionStyle["strokePatternId"] = "dashed"): ResolvedConnectionStyle => {
  const base = createDefaultProjectConnectionStyles().custom;
  return {
    ...base,
    strokePatternId,
    startMarkerId: "none",
    endMarkerId: "filled-arrow",
    appearance: {
      ...base.appearance,
      width: 8,
      dashScale: 1.5,
      patternAmplitude: 6,
      markerSize: 10,
      markerOffset: 6,
    },
  };
};

const command = (style: ResolvedConnectionStyle) => ({
  id: "visual-scale",
  fromSpaceId: "a",
  toSpaceId: "b",
  path: { kind: "line" as const, points: [{ x: 0, y: 0 }, { x: 240, y: 0 }] },
  bounds: { x: 0, y: 0, width: 240, height: 0 },
  style,
  lane: { pairKey: "a::b", laneIndex: 0, laneCount: 1, laneOffset: 0 },
  selected: true,
  emphasis: "focused" as const,
  labelText: null,
});

const connection = (): Connection => ({
  id: "visual-scale",
  fromSpaceId: "a",
  toSpaceId: "b",
  enabled: true,
  semantic: {
    typeId: "custom",
    requirement: "optional",
    direction: "a-to-b",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
});

test("final draw metrics include the active transform and CSS/backing-store ratio", async () => {
  const renderer = await import("../../canvas/connections/renderer") as unknown as Record<string, any>;
  assert.equal(typeof renderer.resolveConnectionCanvasOutputScale, "function");
  const context = new FinalBoundaryContext();
  const outputScale = renderer.resolveConnectionCanvasOutputScale(context as unknown as CanvasRenderingContext2D);
  assert.equal(outputScale, 1.5, "3x active transform times 0.5 CSS/backing ratio");

  for (const mode of ["screen", "canvas"] as const) {
    const widths: number[] = [];
    const dashSets: number[][] = [];
    const markerSizes: number[] = [];
    const markerOffsets: number[] = [];
    for (const zoom of [0.25, 1, 4]) {
      const drawContext = new FinalBoundaryContext();
      const work: any = renderer.drawConnectionBatch(drawContext as unknown as CanvasRenderingContext2D, [command(authoredStyle())], {
        theme: "day",
        cameraZoom: zoom,
        visualScaleMode: mode,
        outputScale,
        fadeUnrelated: false,
        drawLabels: false,
        markerDetail: "full",
        patternFallback: false,
      });
      assert.deepEqual(work.finalRender, {
        connectionId: "visual-scale",
        visualScaleMode: mode,
        cameraZoom: zoom,
        outputScale,
        authoredWidth: 8,
        visibleWidth: 8 * (mode === "screen" ? 1 : zoom),
        visiblePatternAmplitude: 6 * (mode === "screen" ? 1 : zoom),
        visiblePatternWavelength: 21 * (mode === "screen" ? 1 : zoom),
        visibleMarkerSize: 10 * (mode === "screen" ? 1 : zoom),
      });
      widths.push(drawContext.strokes[0]!.width * outputScale);
      dashSets.push(drawContext.strokes[0]!.dash.map((value) => value * outputScale));
      const marker = drawContext.fills[0]!;
      markerSizes.push(Math.max(...marker.map((point) => Math.abs(point.x))) * outputScale);
      markerOffsets.push((drawContext.translations[0]!.x - 240) * outputScale);
    }
    const expectedScale = mode === "screen" ? [1, 1, 1] : [0.25, 1, 4];
    assert.deepEqual(widths, expectedScale.map((scale) => 8 * scale));
    assert.deepEqual(dashSets, expectedScale.map((scale) => [12 * scale, 9 * scale]));
    assert.deepEqual(markerSizes, expectedScale.map((scale) => 10 * scale));
    assert.deepEqual(markerOffsets, expectedScale.map((scale) => 6 * scale));
  }
});

test("final procedural geometry and selection expansion obey the active mode without revealing Hatch's base", async () => {
  const renderer = await import("../../canvas/connections/renderer") as unknown as Record<string, any>;
  const outputScale = renderer.resolveConnectionCanvasOutputScale(new FinalBoundaryContext() as unknown as CanvasRenderingContext2D);
  for (const pattern of ["zigzag", "wave", "scallop", "vertical-hash", "vertical-hatch", "lightning"] as const) {
    for (const mode of ["screen", "canvas"] as const) {
      const amplitudes: number[] = [];
      for (const zoom of [0.25, 1, 4]) {
        const context = new FinalBoundaryContext();
        renderer.drawConnectionBatch(context as unknown as CanvasRenderingContext2D, [command(authoredStyle(pattern))], {
          theme: "day",
          cameraZoom: zoom,
          visualScaleMode: mode,
          outputScale,
          fadeUnrelated: false,
          drawLabels: false,
          markerDetail: "hidden",
          patternFallback: false,
        });
        const motif = context.strokes[0]!.points;
        amplitudes.push(Math.max(...motif.map((point) => Math.abs(point.y))) * outputScale);
        if (pattern === "vertical-hatch") {
          assert.equal(motif.some((point) => point.y === 0 && (point.x === 0 || point.x === 240)), false);
        }
      }
      const expected = mode === "screen" ? [6, 6, 6] : [1.5, 6, 24];
      amplitudes.forEach((value, index) => {
        const target = expected[index]!;
        assert.ok(Math.abs(value - target) < Math.max(0.8, target * 0.12), `${pattern} ${mode} ${index}: ${value}`);
      });
    }
  }
  const metrics = renderer.resolveConnectionVisualMetrics(authoredStyle(), 4, "canvas");
  assert.equal(metrics.selectionExpansion, 8);
  assert.equal(metrics.hitTolerance, 6, "appearance mode never changes the practical hit corridor");
});

test("global visual scale mode defaults safely, updates immediately without history, and persists through project serialization", async () => {
  assert.equal(normalizeConnectionViewSettings(undefined).visualScaleMode, "screen");
  assert.equal(normalizeConnectionViewSettings({ visible: true, focusMode: "all" }).visualScaleMode, "screen");
  const { useLab } = await import("../../state/store");
  const before = useLab.getState();
  useLab.setState({
    spaces: [
      { id: "a", name: "A", x: 60, y: 100, area: 20, category: "Shared", kind: "space", privacy: "public", color: "" },
      { id: "b", name: "B", x: 300, y: 100, area: 20, category: "Shared", kind: "space", privacy: "public", color: "" },
    ],
    connections: [connection()],
    transformUndoStack: [],
    transformRedoStack: [],
    settings: {
      ...before.settings,
      connectionStyles: createDefaultProjectConnectionStyles(),
      projectRelationshipTypes: [],
      connectionView: normalizeConnectionViewSettings(before.settings.connectionView),
    },
  } as never);
  const recordsBefore = structuredClone(useLab.getState().connections);
  const stylesBefore = structuredClone(useLab.getState().settings.connectionStyles);
  const typesBefore = structuredClone(useLab.getState().settings.projectRelationshipTypes);
  assert.equal(typeof useLab.getState().setConnectionVisualScaleMode, "function");
  useLab.getState().setConnectionVisualScaleMode("canvas");
  assert.equal(useLab.getState().settings.connectionView.visualScaleMode, "canvas");
  assert.equal(useLab.getState().transformUndoStack.length, 0);
  assert.deepEqual(useLab.getState().connections, recordsBefore);
  assert.deepEqual(useLab.getState().settings.connectionStyles, stylesBefore);
  assert.deepEqual(useLab.getState().settings.projectRelationshipTypes, typesBefore);

  const { buildCurrentProjectSnapshot } = await import("../../export/exportService");
  const { buildProjectEnvelope, parseProjectEnvelope } = await import("../../import/projectFiles");
  const roundTrip = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(buildCurrentProjectSnapshot("Visual scale"), [])));
  assert.equal(roundTrip.snapshot.settings.connectionView.visualScaleMode, "canvas");
});

test("Relationship Manager owns the visible bounded setting and Canvas consumes it on every draw pass", () => {
  const quickRail = source("../../ui/ConnectionQuickRail.tsx");
  const host = source("../../ui/widgets/WidgetHost.tsx");
  const manager = source("../../ui/widgets/ConnectionsWidget.tsx");
  assert.match(quickRail, /aria-label="Open Connections Manager"[\s\S]{0,220}?openWidget\("connections"\)/);
  assert.match(host, /connections:\s*\(\) => <ConnectionsWidget \/>/);
  assert.match(manager, /aria-label="Relationship Manager settings"[\s\S]{0,220}?setSettingsOpen/);
  assert.match(manager, /CONNECTION SETTINGS/);
  assert.match(manager, /VISUAL SCALE/);
  assert.match(manager, /Fixed on Screen/);
  assert.match(manager, /Scale with Canvas/);
  assert.match(manager, /setConnectionVisualScaleMode/);
  assert.doesNotMatch(source("../../ui/widgets/ConnectionStudioWidget.tsx"), /Fixed on Screen|Scale with Canvas/);

  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.match(organism, /connectionVisualScaleMode\s*=\s*initialState\.settings\.connectionView\.visualScaleMode/);
  assert.match(organism, /visualScaleMode:\s*connectionVisualScaleMode/g);
  assert.match(organism, /outputScale:\s*connectionCanvasOutputScale/g);
  assert.match(organism, /dataset\.finalVisibleWidth/);
  assert.doesNotMatch(organism, /visualScaleMode:\s*CONNECTION_VISUAL_SCALE_MODE_DEFAULT/);
});

test("live drafts retain the selected global mode and no second uncompensated Connection batch exists", async () => {
  const renderer = await import("../../canvas/connections/renderer") as unknown as Record<string, any>;
  const styles = createDefaultProjectConnectionStyles();
  const { useLab } = await import("../../state/store");
  useLab.setState({
    spaces: [
      { id: "a", name: "A", x: 60, y: 100, area: 20, category: "Shared", kind: "space" },
      { id: "b", name: "B", x: 300, y: 100, area: 20, category: "Shared", kind: "space" },
    ],
    connections: [connection()],
    selectedConnectionIds: ["visual-scale"],
    primarySelectedConnectionId: "visual-scale",
    connectionStyleEditorTarget: null,
    connectionStyleEditorPreview: null,
    settings: {
      ...useLab.getState().settings,
      connectionStyles: styles,
      projectRelationshipTypes: [],
      connectionView: { ...normalizeConnectionViewSettings(undefined), visualScaleMode: "canvas" },
    },
  } as never);
  useLab.getState().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["visual-scale"] });
  useLab.getState().previewConnectionStyleEditor({ appearance: { width: 12 } });
  const projected = renderer.projectConnections({
    connections: useLab.getState().connections,
    endpoints: new Map([
      ["a", { id: "a", x: 60, y: 100, radius: 10 }],
      ["b", { id: "b", x: 300, y: 100, radius: 10 }],
    ]),
    styles,
    stylePreview: useLab.getState().connectionStyleEditorPreview,
    filter: createDefaultConnectionFilterSpec(),
    viewport: { x: 0, y: 0, width: 400, height: 240 },
    selectedIds: new Set(["visual-scale"]),
    changedEndpointIds: new Set(),
    lod: "full",
    focusMode: "all",
    cameraZoom: 4,
    visualScaleMode: useLab.getState().settings.connectionView.visualScaleMode,
  }, renderer.createConnectionPathCache());
  const context = new FinalBoundaryContext();
  const outputScale = renderer.resolveConnectionCanvasOutputScale(context as unknown as CanvasRenderingContext2D);
  renderer.drawConnectionBatch(context as unknown as CanvasRenderingContext2D, projected.commands, {
    theme: "day",
    cameraZoom: 4,
    visualScaleMode: "canvas",
    outputScale,
    fadeUnrelated: false,
    drawLabels: false,
    markerDetail: "hidden",
    patternFallback: false,
  });
  assert.equal(context.strokes[0]!.width * outputScale, 48);
  assert.equal(useLab.getState().transformUndoStack.length, 0);
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.equal((organism.match(/drawConnectionBatch\(/g) ?? []).length, 2, "base plus the one existing hover pass only");
});
