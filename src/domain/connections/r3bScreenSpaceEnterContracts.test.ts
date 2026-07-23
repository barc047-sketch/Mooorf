import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import { createDefaultConnectionFilterSpec } from "./filters";
import {
  buildConnectionStrokeMotif,
  resolveConnectionStrokePattern,
} from "./strokePatterns";
import {
  createDefaultProjectConnectionStyles,
  resolveConnectionStylePreview,
  type ResolvedConnectionStyle,
} from "./styles";

const source = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  "utf8",
);

type VisualScaleMode = "screen" | "canvas";
type VisualMetrics = {
  normalizedZoom: number;
  lineWidth: number;
  dashArray: number[];
  patternAmplitude: number;
  patternWavelength: number;
  markerSize: number;
  markerOffset: number;
  selectionExpansion: number;
  hitTolerance: number;
};
type ResolveVisualMetrics = (
  style: ResolvedConnectionStyle,
  cameraZoom: number,
  mode?: VisualScaleMode,
) => VisualMetrics;

const loadMetricsResolver = async (): Promise<ResolveVisualMetrics> => {
  const renderer = await import("../../canvas/connections/renderer") as unknown as Record<string, unknown>;
  assert.equal(
    typeof renderer.resolveConnectionVisualMetrics,
    "function",
    "the batched renderer needs one pure visual-scale resolver",
  );
  return renderer.resolveConnectionVisualMetrics as ResolveVisualMetrics;
};

const authoredStyle = (): ResolvedConnectionStyle => {
  const base = createDefaultProjectConnectionStyles().custom;
  return {
    ...base,
    strokePatternId: "vertical-hatch",
    startMarkerId: "circle",
    endMarkerId: "filled-arrow",
    appearance: {
      ...base.appearance,
      width: 8,
      dashScale: 1.5,
      patternAmplitude: 12,
      markerSize: 10,
      markerOffset: 6,
    },
  };
};

const connection = (id: string, visual?: Connection["visual"]): Connection => ({
  id,
  fromSpaceId: "a",
  toSpaceId: "b",
  enabled: true,
  semantic: {
    typeId: "custom",
    requirement: "optional",
    direction: "a-to-b",
    strength: "medium",
    priority: "normal",
    notes: `${id} notes`,
  },
  ...(visual ? { visual } : {}),
});

test("screen mode keeps every authored visual metric stable while sharing one Canvas-scale seam", async () => {
  const resolveMetrics = await loadMetricsResolver();
  const style = authoredStyle();
  const canonicalBefore = structuredClone(style);
  const screenMetrics = [0.25, 1, 4].map((zoom) => resolveMetrics(style, zoom, "screen"));

  for (const metrics of screenMetrics) {
    assert.equal(metrics.lineWidth, 8);
    assert.equal(metrics.patternAmplitude, 12);
    assert.equal(metrics.markerSize, 10);
    assert.equal(metrics.markerOffset, 6);
    assert.equal(metrics.patternWavelength, resolveConnectionStrokePattern("vertical-hatch").motif.baseWavelength * 1.5);
    assert.deepEqual(metrics.dashArray, screenMetrics[0]!.dashArray);
    assert.equal(metrics.selectionExpansion, screenMetrics[0]!.selectionExpansion);
    assert.equal(metrics.hitTolerance, 6);
  }
  assert.deepEqual(style, canonicalBefore, "live metrics cannot corrupt canonical authored values");

  assert.deepEqual(
    [0.25, 1, 4].map((zoom) => resolveMetrics(style, zoom, "canvas").lineWidth),
    [2, 8, 32],
    "the visible Canvas mode stays behind the same pure resolver",
  );
  assert.equal(resolveMetrics(style, 0, "screen").normalizedZoom, 1);
  assert.equal(resolveMetrics(style, Number.NaN, "screen").normalizedZoom, 1);
  assert.equal(resolveMetrics(style, Number.POSITIVE_INFINITY, "screen").normalizedZoom, 1);
  assert.equal(resolveMetrics(style, 0.001, "screen").normalizedZoom, 0.25);
  assert.equal(resolveMetrics(style, 99, "screen").normalizedZoom, 4);
});

test("procedural motifs retain screen wavelength and amplitude while camera-scaled paths change repetition count", async () => {
  const resolveMetrics = await loadMetricsResolver();
  const style = authoredStyle();
  const motifs = [0.25, 1, 4].map((zoom) => {
    const metrics = resolveMetrics(style, zoom, "screen");
    return buildConnectionStrokeMotif(
      { kind: "polyline", points: [{ x: 100, y: 100 }, { x: 100 + 160 * zoom, y: 100 }] },
      style.strokePatternId,
      metrics.patternWavelength / resolveConnectionStrokePattern(style.strokePatternId).motif.baseWavelength,
      metrics.patternAmplitude,
    );
  });
  assert.deepEqual(motifs.map((motif) => motif.metrics.wavelength), [18, 18, 18]);
  assert.deepEqual(motifs.map((motif) => motif.metrics.amplitude), [12, 12, 12]);
  assert.ok(motifs[0]!.metrics.repetitions < motifs[1]!.metrics.repetitions);
  assert.ok(motifs[1]!.metrics.repetitions < motifs[2]!.metrics.repetitions);
  assert.equal(motifs.every((motif) => motif.paths.length === 0), true, "Vertical Hatch keeps its base hidden");

  const hash = buildConnectionStrokeMotif(
    { kind: "polyline", points: [{ x: 0, y: 0 }, { x: 180, y: 0 }] },
    "vertical-hash",
    1.5,
    12,
  );
  assert.equal(hash.paths.length, 1, "Vertical Hash retains its visible base");
  assert.equal(hash.metrics.wavelength, 18);
  assert.equal(hash.metrics.amplitude, 12);
});

test("Canvas wiring supplies live camera zoom to the screen-space resolver without changing practical hit ownership", async () => {
  const renderer = await import("../../canvas/connections/renderer") as unknown as Record<string, any>;
  const resolveMetrics = await loadMetricsResolver();
  const styles = createDefaultProjectConnectionStyles();
  const authored = connection("zoomed", {
    geometryId: "straight",
    strokePatternId: "dashed",
    appearance: { width: 64, dashScale: 2, markerSize: 10, markerOffset: 4 },
  });
  for (const zoom of [0.25, 1, 4]) {
    const result = renderer.projectConnections({
      connections: [authored],
      endpoints: new Map([
        ["a", { id: "a", x: 200 - 80 * zoom, y: 120, radius: 12 * zoom }],
        ["b", { id: "b", x: 200 + 80 * zoom, y: 120, radius: 12 * zoom }],
      ]),
      styles,
      filter: createDefaultConnectionFilterSpec(),
      viewport: { x: 0, y: 0, width: 400, height: 240 },
      selectedIds: new Set(["zoomed"]),
      changedEndpointIds: new Set(),
      lod: "full",
      focusMode: "all",
      cameraZoom: zoom,
      visualScaleMode: "screen",
    }, renderer.createConnectionPathCache());
    const command = result.commands[0]!;
    const midpoint = command.path.points[Math.floor(command.path.points.length / 2)]!;
    assert.equal(renderer.hitTestConnections(result.hitIndex, { x: midpoint.x, y: midpoint.y + 5.5 }, 6), "zoomed");
    assert.equal(resolveMetrics(command.style, zoom, "screen").lineWidth, 64, "intentional thick styles stay thick");
  }
  const organism = source("../../canvas/OrganismCanvasView.tsx");
  assert.match(organism, /cameraZoom:\s*cam\.zoom/);
  assert.match(organism, /visualScaleMode:\s*connectionVisualScaleMode/);
  assert.match(organism, /outputScale:\s*connectionCanvasOutputScale/);
  assert.doesNotMatch(organism, /selectedCommands\.map\([\s\S]{0,900}?width:\s*command\.style\.appearance\.width\s*\+/);
  const rendererSource = source("../../canvas/connections/renderer.ts");
  assert.match(rendererSource, /resolveConnectionDrawMetrics\([\s\S]{0,140}?resolveConnectionVisualMetrics\(style, cameraZoom, visualScaleMode\)/);
  assert.match(rendererSource, /traceProceduralStroke\(context, command\.path, style, metrics\)/);
  assert.match(rendererSource, /CONNECTION_FOCUS_OPACITY[\s\S]{0,180}?focused:\s*1[\s\S]{0,120}?related:\s*0\.82[\s\S]{0,120}?contextual:\s*0\.55/);
});

test("single, multi and Relationship Type live drafts resolve through unchanged screen metrics and retain history semantics", async () => {
  const resolveMetrics = await loadMetricsResolver();
  const { useLab } = await import("../../state/store");
  const current = useLab.getState();
  const first = connection("first", { appearance: { width: 2 } });
  const second = connection("second", { appearance: { width: 5 } });
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

  assert.equal(useLab.getState().openConnectionStyleEditor({ context: "connection-override", connectionIds: ["first", "second"] }), true);
  assert.equal(useLab.getState().previewConnectionStyleEditor({ appearance: { width: 32, patternAmplitude: 12 } }), true);
  for (const authored of useLab.getState().connections) {
    const resolved = resolveConnectionStylePreview(
      authored,
      useLab.getState().settings.connectionStyles,
      [],
      useLab.getState().connectionStyleEditorPreview,
    );
    assert.deepEqual([0.25, 1, 4].map((zoom) => resolveMetrics(resolved, zoom, "screen").lineWidth), [32, 32, 32]);
  }
  assert.deepEqual(useLab.getState().connections, [first, second]);
  assert.equal(useLab.getState().transformUndoStack.length, 0);
  useLab.getState().cancelConnectionStyleEditor();
  assert.equal(useLab.getState().transformUndoStack.length, 0);

  useLab.getState().openConnectionStyleEditor({ context: "relationship-type", typeId: "custom" });
  useLab.getState().previewConnectionStyleEditor({ appearance: { width: 32 } });
  const typePreview = useLab.getState().connectionStyleEditorPreview;
  assert.equal(typePreview?.context, "relationship-type");
  if (typePreview?.context === "relationship-type") {
    assert.deepEqual([0.25, 1, 4].map((zoom) => resolveMetrics(typePreview.style, zoom, "screen").lineWidth), [32, 32, 32]);
  }
  assert.equal(useLab.getState().commitConnectionStyleEditor(), true);
  assert.equal(useLab.getState().transformUndoStack.length, 1);
});

test("Enter Apply policy preserves menus, native buttons, multiline editing and IME ownership", async () => {
  const shortcuts = await import("../../interaction/connectionShortcut") as unknown as Record<string, unknown>;
  assert.equal(
    typeof shortcuts.resolveConnectionStyleEnterAction,
    "function",
    "Style Panel Enter needs a pure ownership policy",
  );
  const resolve = shortcuts.resolveConnectionStyleEnterAction as (input: {
    key: string;
    defaultPrevented?: boolean;
    isComposing?: boolean;
    repeat?: boolean;
    openMenu?: boolean;
    targetKind: string;
  }) => "apply" | "preserve";
  assert.equal(resolve({ key: "Enter", targetKind: "surface" }), "apply");
  assert.equal(resolve({ key: "Enter", targetKind: "style-control" }), "apply");
  assert.equal(resolve({ key: "Enter", targetKind: "number-input" }), "apply");
  assert.equal(resolve({ key: "Enter", targetKind: "range-input" }), "apply");
  assert.equal(resolve({ key: "Enter", targetKind: "single-line-input" }), "apply");
  assert.equal(resolve({ key: "Enter", targetKind: "button" }), "preserve");
  assert.equal(resolve({ key: "Enter", targetKind: "multiline" }), "preserve");
  assert.equal(resolve({ key: "Enter", targetKind: "contenteditable" }), "preserve");
  assert.equal(resolve({ key: "Enter", targetKind: "option", openMenu: true }), "preserve");
  assert.equal(resolve({ key: "Enter", targetKind: "surface", defaultPrevented: true }), "preserve");
  assert.equal(resolve({ key: "Enter", targetKind: "surface", isComposing: true }), "preserve");
  assert.equal(resolve({ key: "Enter", targetKind: "surface", repeat: true }), "preserve");

  const studio = source("../../ui/widgets/ConnectionStudioWidget.tsx");
  const controls = source("../../ui/widgets/controls.tsx");
  const picker = source("../../ui/RelationshipTypePicker.tsx");
  assert.match(controls, /event\.key === "Enter"[\s\S]{0,140}?finishInteraction\(\)/);
  assert.match(studio, /connection-mixed-colour[\s\S]{0,620}?onKeyDown=\{\(event\) => \{[\s\S]{0,180}?event\.key !== "Enter"[\s\S]{0,260}?update\(/);
  assert.match(studio, /data-connection-style-control="true"/);
  assert.match(studio, /onKeyDown=\{[^}]*handleEnterApply/);
  assert.match(studio, /resolveConnectionStyleEnterAction/);
  assert.match(
    studio,
    /event\.preventDefault\(\)[\s\S]{0,160}?event\.stopPropagation\(\)[\s\S]{0,220}?queueMicrotask\(apply\)/,
    "Enter waits until the focused single-line control has committed its draft before sharing Apply",
  );
  assert.match(studio, /Apply[\s\S]{0,80}↵/);
  assert.equal((studio.match(/const apply = \(\) =>/g) ?? []).length, 1, "button and Enter share one canonical Apply command");
  assert.match(picker, /event\.key === "Enter"[\s\S]{0,180}?chooseOption\(/);
  assert.match(picker, /const chooseOption = [\s\S]{0,220}?onChange\([\s\S]{0,120}?setOpen\(false\)/);
});
