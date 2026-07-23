import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { Connection, ResolvedConnectionAnnotation } from "../../domain/graph/types";
import { createDefaultConnectionAnnotationPresentation } from "../../domain/connections/annotations";
import { createDefaultConnectionFilterSpec } from "../../domain/connections/filters";
import { createProjectRelationshipType } from "../../domain/connections/relationshipTypes";
import { createDefaultProjectConnectionStyles } from "../../domain/connections/styles";
import type { ConnectionEndpointGeometry, ConnectionPath } from "./geometry";
import {
  CONNECTION_ANNOTATION_BODY_MAX_LINES,
  CONNECTION_ANNOTATION_FULL_BUDGET,
  CONNECTION_ANNOTATION_TITLE_BUDGET,
  drawConnectionAnnotations,
  projectConnectionAnnotations,
  resolveConnectionAnnotationLod,
  resolveConnectionPathMidpoint,
  type ConnectionAnnotationProjectionInput,
} from "./annotationProjection";
import {
  CONNECTION_FOCUS_OPACITY,
  createConnectionPathCache,
  projectConnections,
  type ConnectionProjectionInput,
} from "./renderer";

const resolved = (
  title: string | null,
  body: string | null,
): ResolvedConnectionAnnotation => ({
  title: { source: title ? "custom" : "hidden", text: title ?? "", visible: Boolean(title) },
  body: { source: body ? "custom" : "hidden", text: body ?? "", visible: Boolean(body) },
});

const linePath = (y = 150, length = 320): ConnectionPath => ({
  kind: "line",
  points: [{ x: 40, y }, { x: 40 + length, y }],
});

const candidate = (
  connectionId: string,
  patch: Partial<ConnectionAnnotationProjectionInput> = {},
): ConnectionAnnotationProjectionInput => ({
  connectionId,
  annotation: resolved("Kitchen to dining", "Shared service circulation between public and staff zones."),
  path: linePath(),
  viewport: { x: 0, y: 0, width: 400, height: 300 },
  priority: "normal",
  cameraZoom: 1,
  visualScaleMode: "screen",
  presentation: createDefaultConnectionAnnotationPresentation(),
  ...patch,
});

const measureText = (text: string, role: "title" | "body") =>
  [...text].length * (role === "title" ? 6.4 : 5.4);

test("canonical path midpoint follows actual polyline and bezier length with a stable tangent", () => {
  const elbow = resolveConnectionPathMidpoint({
    kind: "polyline",
    points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 300 }],
  });
  assert.deepEqual(elbow.point, { x: 100, y: 100 });
  assert.ok(Math.abs(elbow.length - 400) < 1e-6);
  assert.deepEqual(elbow.tangent, { x: 0, y: 1 });

  const curve = resolveConnectionPathMidpoint({
    kind: "bezier",
    points: [{ x: 0, y: 0 }, { x: 0, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 0 }],
  });
  assert.ok(Math.abs(curve.point.x - 100) < 1);
  assert.ok(curve.point.y > 145, "curve midpoint must not collapse to averaged endpoints");
  assert.ok(curve.length > 390);
  assert.ok(Math.abs(curve.tangent.y) < 0.05);
});

test("LOD is based on projected path length and selection priority without violating authored visibility", () => {
  const base = { titleVisible: true, bodyVisible: true, selected: false, priority: "normal" as const };
  assert.equal(resolveConnectionAnnotationLod({ ...base, projectedPathLength: 260 }), "full");
  assert.equal(resolveConnectionAnnotationLod({ ...base, projectedPathLength: 120 }), "title");
  assert.equal(resolveConnectionAnnotationLod({ ...base, projectedPathLength: 30 }), "none");
  assert.equal(resolveConnectionAnnotationLod({ ...base, projectedPathLength: 30, selected: true }), "title");
  assert.equal(resolveConnectionAnnotationLod({ ...base, projectedPathLength: 160, selected: true }), "full");
  assert.equal(resolveConnectionAnnotationLod({
    ...base,
    projectedPathLength: 30,
    selected: true,
    titleVisible: false,
  }), "none");
  assert.equal(resolveConnectionAnnotationLod({
    ...base,
    projectedPathLength: 160,
    selected: true,
    titleVisible: false,
  }), "full");
});

test("horizontal Body wrapping is bounded and visual truncation preserves canonical text", () => {
  const body = Array.from({ length: 36 }, (_, index) => `relationship-${index}`).join(" ");
  const result = projectConnectionAnnotations([
    candidate("long", { annotation: resolved("A professional title", body) }),
  ], { measureText });
  const projected = result.annotations[0]!;

  assert.equal(projected.rotation, 0);
  assert.equal(projected.alignment, "horizontal-center");
  assert.ok(projected.bounds.width >= 160 && projected.bounds.width <= 220);
  assert.equal(projected.body?.text, body);
  assert.ok((projected.body?.lines.length ?? 0) <= CONNECTION_ANNOTATION_BODY_MAX_LINES);
  assert.equal(projected.body?.truncated, true);
  const bodyLines = projected.body?.lines ?? [];
  assert.match(bodyLines[bodyLines.length - 1] ?? "", /…$/);
  assert.equal(projected.typography.titleFontSize, 12);
  assert.equal(projected.typography.bodyFontSize, 10.5);
});

test("an unbroken oversized Body token reports visual truncation without mutating text", () => {
  const body = "ArchitecturalRelationshipAnnotation".repeat(12);
  const projected = projectConnectionAnnotations([
    candidate("unbroken", { annotation: resolved(null, body) }),
  ], { measureText }).annotations[0]!;
  assert.equal(projected.body?.text, body);
  assert.equal(projected.body?.truncated, true);
  assert.match(projected.body?.lines[0] ?? "", /…$/);
});

test("placement tries the opposite side and collision resolution is deterministic", () => {
  const edge = projectConnectionAnnotations([
    candidate("edge", { path: linePath(8) }),
  ], { measureText });
  assert.equal(edge.annotations[0]?.side, "opposite");

  const inputs = [candidate("c"), candidate("a"), candidate("b")];
  const first = projectConnectionAnnotations(inputs, { measureText });
  const second = projectConnectionAnnotations([...inputs].reverse(), { measureText });
  assert.deepEqual(first.annotations, second.annotations);
  assert.deepEqual(first.annotations.map((item) => item.connectionId), ["a", "b"]);
  assert.deepEqual(first.annotations.map((item) => item.side), ["preferred", "opposite"]);
  assert.equal(first.metrics.annotationCollisionRejected, 1);
  assert.ok(first.metrics.annotationCollisionChecks > 0);
});

test("authored path position, manual side, offset, width, alignment, and square plate resolve without mutating text", () => {
  const body = "One two three four five six seven eight nine ten eleven twelve thirteen fourteen.";
  const startPresentation = createDefaultConnectionAnnotationPresentation();
  startPresentation.placement = {
    pathPosition: 0.25,
    side: "a",
    offset: 36,
    alignment: "right",
    maxWidth: 140,
  };
  startPresentation.plate = {
    backgroundColor: "#123456",
    backgroundOpacity: 0,
    cornerRadius: 0,
    paddingX: 4,
    paddingY: 4,
  };
  const endPresentation = createDefaultConnectionAnnotationPresentation();
  endPresentation.placement = {
    pathPosition: 0.75,
    side: "b",
    offset: 36,
    alignment: "left",
    maxWidth: 320,
  };
  const [start] = projectConnectionAnnotations([
    candidate("start", {
      annotation: resolved("Positioned", body),
      presentation: startPresentation,
      viewport: { x: 0, y: 0, width: 600, height: 300 },
    }),
  ], { measureText }).annotations;
  const [end] = projectConnectionAnnotations([
    candidate("end", {
      annotation: resolved("Positioned", body),
      presentation: endPresentation,
      viewport: { x: 0, y: 0, width: 600, height: 300 },
    }),
  ], { measureText }).annotations;

  assert.ok(Math.abs(start!.anchor.x - 120) < 1e-6);
  assert.ok(Math.abs(end!.anchor.x - 280) < 1e-6);
  assert.equal(start!.side, "preferred");
  assert.equal(end!.side, "opposite");
  assert.equal(start!.textAlign, "right");
  assert.equal(end!.textAlign, "left");
  assert.equal(start!.typography.pathGap, 36);
  assert.equal(start!.typography.maxWidth, 140);
  assert.equal(start!.typography.plateRadius, 0);
  assert.equal(start!.typography.plateBackgroundOpacity, 0);
  assert.equal(start!.body?.text, body);
  assert.equal(end!.body?.text, body);
  assert.ok((start!.body?.lines.length ?? 0) > (end!.body?.lines.length ?? 0));
});

test("annotation budgets prioritize selected and related records in stable order", () => {
  const inputs = Array.from({ length: 240 }, (_, index) => candidate(
    `normal-${String(index).padStart(3, "0")}`,
    { path: linePath(30 + index * 36) },
  ));
  inputs.push(candidate("selected-last", {
    priority: "selected",
    path: linePath(30 + inputs.length * 36),
  }));
  inputs.push(candidate("related-last", {
    priority: "related",
    path: linePath(30 + (inputs.length + 1) * 36),
  }));
  const result = projectConnectionAnnotations(inputs, {
    measureText,
    viewport: { x: 0, y: 0, width: 400, height: 12_000 },
  });

  assert.ok(result.annotations.some((item) => item.connectionId === "selected-last"));
  assert.ok(result.annotations.some((item) => item.connectionId === "related-last"));
  assert.ok(result.metrics.annotationCandidates <= CONNECTION_ANNOTATION_TITLE_BUDGET);
  assert.ok(result.metrics.annotationFull <= CONNECTION_ANNOTATION_FULL_BUDGET);
  assert.ok(result.metrics.annotationTitleOnly + result.metrics.annotationFull <= CONNECTION_ANNOTATION_TITLE_BUDGET);
  assert.equal(result.metrics.annotationLayouts, result.annotations.length);
});

test("Fixed on Screen keeps Title, Body, plate, wrapping, and offset metrics stable at 0.25 / 1 / 4 zoom", () => {
  const presentation = createDefaultConnectionAnnotationPresentation();
  const canonicalBefore = structuredClone(presentation);
  const fixed = [0.25, 1, 4].map((cameraZoom) => projectConnectionAnnotations([candidate("fixed", {
    cameraZoom,
    visualScaleMode: "screen",
    presentation,
  })], { measureText }).annotations[0]!);

  for (const projection of fixed.slice(1)) {
    assert.deepEqual(projection.typography, fixed[0]!.typography);
    assert.deepEqual(projection.bounds, fixed[0]!.bounds);
    assert.deepEqual(projection.title?.lines, fixed[0]!.title?.lines);
    assert.deepEqual(projection.body?.lines, fixed[0]!.body?.lines);
  }
  assert.equal(fixed[0]!.visualScale, 1);
  assert.equal(fixed[0]!.typography.titleFontSize, presentation.title.fontSize);
  assert.equal(fixed[0]!.typography.bodyFontSize, presentation.body.fontSize);
  assert.equal(fixed[0]!.typography.paddingX, presentation.plate.paddingX);
  assert.equal(fixed[0]!.typography.plateRadius, presentation.plate.cornerRadius);
  assert.equal(fixed[0]!.typography.pathGap, presentation.placement.offset);
  assert.deepEqual(presentation, canonicalBefore, "projection must not persist zoom-compensated values");
});

test("Scale with Canvas scales the complete annotation unit while text wrapping stays coherent", () => {
  const presentation = createDefaultConnectionAnnotationPresentation();
  const largeViewport = { x: 0, y: 0, width: 3_000, height: 2_000 };
  const projected = [0.25, 1, 4].map((cameraZoom) => projectConnectionAnnotations([candidate("canvas", {
    cameraZoom,
    visualScaleMode: "canvas",
    presentation,
    path: linePath(1_000, 1_000),
    viewport: largeViewport,
  })], { measureText }).annotations[0]!);
  const [quarter, one, four] = projected;

  assert.equal(quarter!.visualScale, 0.25);
  assert.equal(one!.visualScale, 1);
  assert.equal(four!.visualScale, 4);
  for (const key of [
    "titleFontSize",
    "bodyFontSize",
    "titleLineHeight",
    "bodyLineHeight",
    "paddingX",
    "paddingY",
    "plateRadius",
    "plateBorderWidth",
    "titleBodyGap",
    "pathGap",
    "maxWidth",
  ] as const) {
    assert.equal(quarter!.typography[key], one!.typography[key] * 0.25, `${key} should scale at far zoom`);
    assert.equal(four!.typography[key], one!.typography[key] * 4, `${key} should scale at near zoom`);
  }
  assert.equal(quarter!.bounds.width, one!.bounds.width * 0.25);
  assert.equal(four!.bounds.width, one!.bounds.width * 4);
  assert.equal(quarter!.bounds.height, one!.bounds.height * 0.25);
  assert.equal(four!.bounds.height, one!.bounds.height * 4);
  assert.deepEqual(quarter!.title?.lines, four!.title?.lines);
  assert.deepEqual(quarter!.body?.lines, four!.body?.lines);
});

test("switching the shared mode updates annotation metrics immediately while LOD stays projected-screen-space", () => {
  const shared = candidate("switch", {
    cameraZoom: 4,
    path: linePath(1_000, 1_000),
    viewport: { x: 0, y: 0, width: 3_000, height: 2_000 },
  });
  const fixed = projectConnectionAnnotations([{ ...shared, visualScaleMode: "screen" }], { measureText }).annotations[0]!;
  const canvas = projectConnectionAnnotations([{ ...shared, visualScaleMode: "canvas" }], { measureText }).annotations[0]!;

  assert.equal(fixed.visualScale, 1);
  assert.equal(canvas.visualScale, 4);
  assert.equal(canvas.typography.titleFontSize, fixed.typography.titleFontSize * 4);
  assert.equal(canvas.lod, fixed.lod, "visual scaling must not alter projected screen-space LOD");

  const titleOnly = projectConnectionAnnotations([candidate("compact", {
    annotation: resolved("Short title", null),
    path: linePath(150, 120),
  })], { measureText }).annotations[0]!;
  assert.equal(titleOnly.lod, "title");
  assert.ok(titleOnly.bounds.width < 160, "Title-only plate should fit its content instead of using Body width");
});

class AnnotationRecordingContext {
  globalAlpha = 1;
  fillStyle: string | CanvasGradient | CanvasPattern = "";
  strokeStyle: string | CanvasGradient | CanvasPattern = "";
  lineWidth = 1;
  font = "";
  textAlign: CanvasTextAlign = "start";
  textBaseline: CanvasTextBaseline = "alphabetic";
  fonts: string[] = [];
  texts: string[] = [];
  fills: string[] = [];
  rotations: number[] = [];
  rectCalls = 0;
  roundRectCalls = 0;
  strokeCalls = 0;
  drawnWidths: number[] = [];
  strokeWidths: number[] = [];
  save() {}
  restore() {}
  beginPath() {}
  roundRect(_x: number, _y: number, width: number) { this.roundRectCalls += 1; this.drawnWidths.push(width); }
  rect(_x: number, _y: number, width: number) { this.rectCalls += 1; this.drawnWidths.push(width); }
  fill() { this.fills.push(String(this.fillStyle)); }
  stroke() { this.strokeCalls += 1; this.strokeWidths.push(this.lineWidth); }
  fillText(text: string) { this.fonts.push(this.font); this.texts.push(text); }
  rotate(value: number) { this.rotations.push(value); }
}

test("Canvas-batched drawing stays horizontal, theme-aware, and output-scale stable", () => {
  const projection = projectConnectionAnnotations([candidate("draw")], { measureText }).annotations;
  const day = new AnnotationRecordingContext();
  const dayWork = drawConnectionAnnotations(
    day as unknown as CanvasRenderingContext2D,
    projection,
    { theme: "day", outputScale: 1 },
  );
  const night = new AnnotationRecordingContext();
  const nightWork = drawConnectionAnnotations(
    night as unknown as CanvasRenderingContext2D,
    projection,
    { theme: "night", outputScale: 2 },
  );

  assert.equal(dayWork.annotationDrawn, 1);
  assert.equal(nightWork.annotationDrawn, 1);
  assert.equal(day.rotations.length + night.rotations.length, 0);
  assert.ok(day.fonts.some((font) => /600 12px/.test(font)));
  assert.ok(night.fonts.some((font) => /600 6px/.test(font)));
  assert.notDeepEqual(day.fills, night.fills);
  assert.ok(day.texts.includes("Kitchen to dining"));
});

test("Canvas mode draws scaled text, plate, radius, padding, and border as one output-compensated unit", () => {
  const shared = {
    path: linePath(1_000, 1_000),
    viewport: { x: 0, y: 0, width: 3_000, height: 2_000 },
  };
  const fixed = projectConnectionAnnotations([candidate("fixed-draw", {
    ...shared,
    cameraZoom: 4,
    visualScaleMode: "screen",
  })], { measureText }).annotations;
  const canvas = projectConnectionAnnotations([candidate("canvas-draw", {
    ...shared,
    cameraZoom: 4,
    visualScaleMode: "canvas",
  })], { measureText }).annotations;
  const fixedContext = new AnnotationRecordingContext();
  const canvasContext = new AnnotationRecordingContext();

  drawConnectionAnnotations(fixedContext as unknown as CanvasRenderingContext2D, fixed, { theme: "day", outputScale: 2 });
  drawConnectionAnnotations(canvasContext as unknown as CanvasRenderingContext2D, canvas, { theme: "day", outputScale: 2 });

  assert.ok(fixedContext.fonts.some((font) => /600 6px/.test(font)));
  assert.ok(canvasContext.fonts.some((font) => /600 24px/.test(font)));
  assert.equal(canvasContext.drawnWidths[0], fixedContext.drawnWidths[0]! * 4);
  assert.equal(canvasContext.strokeWidths[0], fixedContext.strokeWidths[0]! * 4);
});

test("square and fully transparent plates retain horizontal text without a hidden box stroke", () => {
  const squarePresentation = createDefaultConnectionAnnotationPresentation();
  squarePresentation.plate.cornerRadius = 0;
  squarePresentation.plate.backgroundOpacity = 0.5;
  const squareProjection = projectConnectionAnnotations([
    candidate("square", { presentation: squarePresentation }),
  ], { measureText }).annotations;
  const square = new AnnotationRecordingContext();
  drawConnectionAnnotations(square as unknown as CanvasRenderingContext2D, squareProjection, { theme: "day" });
  assert.equal(square.rectCalls, 1);
  assert.equal(square.roundRectCalls, 0);
  assert.equal(square.fills.length, 1);
  assert.equal(square.strokeCalls, 1);

  const transparentPresentation = createDefaultConnectionAnnotationPresentation();
  transparentPresentation.plate.backgroundOpacity = 0;
  const transparentProjection = projectConnectionAnnotations([
    candidate("transparent", { presentation: transparentPresentation }),
  ], { measureText }).annotations;
  const transparent = new AnnotationRecordingContext();
  drawConnectionAnnotations(transparent as unknown as CanvasRenderingContext2D, transparentProjection, { theme: "day" });
  assert.equal(transparent.fills.length, 0);
  assert.equal(transparent.strokeCalls, 0);
  assert.ok(transparent.texts.includes("Kitchen to dining"));
  assert.equal(transparent.rotations.length, 0);
});

test("mounted Organism wires annotation measurement, batched draw, instrumentation, and Table sleep", async () => {
  const source = await readFile(new URL("../OrganismCanvasView.tsx", import.meta.url), "utf8");
  assert.match(source, /drawConnectionAnnotations/);
  assert.match(source, /annotationMeasureText:\s*measureConnectionAnnotationText/);
  assert.match(source, /recordAnnotationDraw\(annotationWork\)/);
  assert.match(source, /dataset\.annotationCandidates/);
  assert.match(source, /dataset\.annotationCollisionChecks/);
  const baseStart = source.indexOf("const drawConnectionBase");
  const lineDraw = source.indexOf("drawConnectionBatch", baseStart);
  const annotationDraw = source.indexOf("drawConnectionAnnotations", baseStart);
  assert.ok(baseStart >= 0 && lineDraw > baseStart && annotationDraw > lineDraw);
  const sleepStart = source.indexOf("const setRuntimeActive");
  const sleepEnd = source.indexOf("const latestState", sleepStart);
  assert.match(source.slice(sleepStart, sleepEnd), /settleAnnotations\(\)/);
  assert.doesNotMatch(source, /createRoot\([^)]*ConnectionAnnotation|<ConnectionAnnotation/);
});

const connection = (
  id: string,
  fromSpaceId: string,
  toSpaceId: string,
  patch: Partial<Connection> = {},
): Connection => ({
  id,
  fromSpaceId,
  toSpaceId,
  enabled: true,
  semantic: {
    typeId: "custom",
    requirement: "optional",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
  ...patch,
});

const endpoint = (id: string, x: number, y: number): ConnectionEndpointGeometry => ({ id, x, y, radius: 10 });
const styles = createDefaultProjectConnectionStyles();
const rendererInput = (
  connections: readonly Connection[],
  patch: Partial<ConnectionProjectionInput> = {},
): ConnectionProjectionInput => ({
  connections,
  endpoints: new Map([
    ["a", endpoint("a", 40, 150)],
    ["b", endpoint("b", 360, 150)],
    ["c", endpoint("c", 40, 230)],
    ["d", endpoint("d", 360, 230)],
  ]),
  styles,
  filter: createDefaultConnectionFilterSpec(),
  viewport: { x: 0, y: 0, width: 400, height: 300 },
  selectedIds: new Set(),
  changedEndpointIds: new Set(),
  lod: "full",
  focusMode: "all",
  ...patch,
});

test("renderer reuses live Relationship Type annotation resolution and local hidden overrides", () => {
  const type = createProjectRelationshipType({
    name: "Primary Circulation",
    annotationDefaults: {
      title: { source: "relationship-type" },
      body: { source: "custom", text: "Main public route." },
    },
  }, [], styles, 100);
  const inherited = connection("inherited", "a", "b", {
    semantic: { ...connection("base", "a", "b").semantic, typeId: type.id },
  });
  const hidden = connection("hidden", "c", "d", {
    semantic: { ...connection("base", "c", "d").semantic, typeId: type.id },
    annotation: { title: { source: "hidden" }, body: { source: "hidden" } },
  });
  const cache = createConnectionPathCache();
  const initial = projectConnections(rendererInput([inherited, hidden], {
    projectRelationshipTypes: [type],
  }), cache);
  assert.deepEqual(initial.annotations.map((item) => item.connectionId), ["inherited"]);
  assert.equal(initial.annotations[0]?.title?.text, "Primary Circulation");

  const renamed = { ...type, name: "Public Spine" };
  const updated = projectConnections(rendererInput([inherited, hidden], {
    projectRelationshipTypes: [renamed],
  }), cache);
  assert.equal(updated.annotations[0]?.title?.text, "Public Spine");
  assert.equal(updated.metrics.pathResolutions, 0, "text changes should reuse unchanged canonical paths");
});

test("procedural stroke motifs do not move the canonical annotation midpoint", () => {
  const base = connection("base", "a", "b", {
    annotation: { title: { source: "custom", text: "Stable midpoint" } },
  });
  const wave = connection("wave", "a", "b", {
    annotation: base.annotation,
    visual: { strokePatternId: "wave" },
  });
  const solidProjection = projectConnections(rendererInput([base]), createConnectionPathCache()).annotations[0]!;
  const waveProjection = projectConnections(rendererInput([wave]), createConnectionPathCache()).annotations[0]!;
  assert.deepEqual(waveProjection.anchor, solidProjection.anchor);
  assert.equal(waveProjection.rotation, 0);
});

test("annotation focus stays readable without changing accepted stroke focus", () => {
  const rows = [
    connection("selected", "a", "b", { annotation: { title: { source: "custom", text: "Selected" } } }),
    connection("unrelated", "c", "d", { annotation: { title: { source: "custom", text: "Context" } } }),
  ];
  const result = projectConnections(rendererInput(rows, {
    selectedIds: new Set(["selected"]),
  }), createConnectionPathCache());
  const byId = new Map(result.annotations.map((item) => [item.connectionId, item.opacity]));
  assert.equal(byId.get("selected"), 1);
  assert.ok((byId.get("unrelated") ?? 0) >= 0.68);
  assert.deepEqual(CONNECTION_FOCUS_OPACITY, { focused: 1, related: 0.76, contextual: 0.44 });
});
