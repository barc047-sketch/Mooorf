import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import { areaToRadius } from "../lib/geometry";
import { useLab } from "../state/store";
import type { SpaceCell } from "../types";
import { calculateArrangement, regenerateArrangementSeed, resolveArrangementScope } from "./engine";
import { ARRANGEMENT_PATTERNS, getArrangementPattern } from "./registry";
import {
  DEFAULT_ARRANGEMENT_PARAMETERS,
  createLatestRequestGate,
  type ArrangementEntity,
  type ArrangementParameters,
} from "./types";

const fixture = (count: number): SpaceCell[] => Array.from({ length: count }, (_, index) => ({
  id: `cell-${index}`,
  name: `Cell ${index}`,
  body: `Body ${index}`,
  kind: index % 11 === 0 ? "void" : "space",
  area: 36 + (index % 7) * 18,
  category: index % 2 ? "Work" : "Living",
  privacy: index % 3 ? "shared" : "private",
  color: index % 2 ? "#112233" : "#ddeeff",
  x: (index % 10) * 90 - 405,
  y: Math.floor(index / 10) * 80 - 240,
  born: 1000 + index,
  appearance: index % 3 === 0 ? { text: { size: 1.1, colourMode: "auto" } } : undefined,
}));

const entities = (spaces: readonly SpaceCell[]): ArrangementEntity[] => spaces.map((space) => ({
  id: space.id,
  x: space.x,
  y: space.y,
  radius: areaToRadius(space.area),
  kind: space.kind ?? "space",
}));

const params = (patch: Partial<ArrangementParameters> = {}): ArrangementParameters => ({
  ...DEFAULT_ARRANGEMENT_PARAMETERS,
  ...patch,
});

const positions = (
  patternId: Parameters<typeof calculateArrangement>[0]["patternId"],
  spaces = fixture(10),
  patch: Partial<ArrangementParameters> = {},
) => calculateArrangement({ patternId, entities: entities(spaces), parameters: params(patch) });

const centroid = (points: readonly { x: number; y: number }[]) => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / Math.max(points.length, 1),
  y: points.reduce((sum, point) => sum + point.y, 0) / Math.max(points.length, 1),
});

test("registry IDs are unique and every pattern has compact UI metadata", () => {
  const ids = ARRANGEMENT_PATTERNS.map((pattern) => pattern.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const pattern of ARRANGEMENT_PATTERNS) {
    assert.ok(pattern.label && pattern.hint && pattern.category);
    assert.ok(pattern.miniature.length >= 3);
    assert.equal(getArrangementPattern(pattern.id), pattern);
  }
});

test("every registry pattern returns one finite position per entity without mutating inputs", () => {
  const input = entities(fixture(10));
  const snapshot = structuredClone(input);
  for (const pattern of ARRANGEMENT_PATTERNS) {
    const output = calculateArrangement({ patternId: pattern.id, entities: input, parameters: params() });
    assert.equal(output.length, input.length, pattern.id);
    assert.deepEqual(output.map(({ id }) => id), input.map(({ id }) => id), pattern.id);
    assert.ok(output.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y)), pattern.id);
  }
  assert.deepEqual(input, snapshot);
});

test("generated 10, 100 and 300 Cell fixtures calculate completely", () => {
  for (const count of [10, 100, 300]) {
    for (const patternId of ["grid", "golden-angle", "compact-pack"] as const) {
      assert.equal(positions(patternId, fixture(count)).length, count, `${patternId}:${count}`);
    }
  }
});

test("scope resolution follows Auto, visibility, locked state and Include Voids", () => {
  const spaces = fixture(6) as Array<SpaceCell & { locked?: boolean; hidden?: boolean }>;
  spaces[1].locked = true;
  spaces[2].hidden = true;
  const visible = spaces.map(({ id }) => id);
  assert.deepEqual(resolveArrangementScope(spaces, [spaces[0].id, spaces[3].id], visible, "auto", true), [spaces[0].id, spaces[3].id]);
  assert.deepEqual(resolveArrangementScope(spaces, [], visible, "auto", true), [spaces[0].id, spaces[3].id, spaces[4].id, spaces[5].id]);
  assert.deepEqual(resolveArrangementScope(spaces, [spaces[3].id], visible, "all-visible", false), [spaces[3].id, spaces[4].id, spaces[5].id]);
  assert.deepEqual(resolveArrangementScope(spaces, [spaces[0].id], visible, "selected", false), []);
});

test("preserve centre retains the arranged subset centroid", () => {
  const input = entities(fixture(10));
  const before = centroid(input);
  const after = centroid(calculateArrangement({ patternId: "golden-angle", entities: input, parameters: params({ preserveCentre: true }) }));
  assert.ok(Math.abs(before.x - after.x) < 1e-9);
  assert.ok(Math.abs(before.y - after.y) < 1e-9);
});

test("Horizontal, Vertical and Diagonal produce their named alignment", () => {
  const horizontal = positions("horizontal-line");
  const vertical = positions("vertical-line");
  const diagonal = positions("diagonal-line");
  assert.equal(new Set(horizontal.map(({ y }) => y.toFixed(8))).size, 1);
  assert.equal(new Set(vertical.map(({ x }) => x.toFixed(8))).size, 1);
  const slopes = diagonal.slice(1).map((point) => (point.y - diagonal[0].y) / (point.x - diagonal[0].x || 1));
  assert.ok(slopes.every((slope) => Math.abs(slope - slopes[0]) < 1e-8));
});

test("Circle and Oval are distinct, Square uses its boundary, and Grid is two-dimensional", () => {
  const circle = positions("circle", fixture(12));
  const oval = positions("oval", fixture(12), { aspectRatio: 1.8 });
  assert.notDeepEqual(circle, oval);
  const square = positions("square-perimeter", fixture(16));
  const minX = Math.min(...square.map(({ x }) => x));
  const maxX = Math.max(...square.map(({ x }) => x));
  const minY = Math.min(...square.map(({ y }) => y));
  const maxY = Math.max(...square.map(({ y }) => y));
  assert.ok(square.every(({ x, y }) => Math.abs(x - minX) < 1e-8 || Math.abs(x - maxX) < 1e-8 || Math.abs(y - minY) < 1e-8 || Math.abs(y - maxY) < 1e-8));
  const grid = positions("grid", fixture(12), { count: 4 });
  assert.ok(new Set(grid.map(({ x }) => x.toFixed(8))).size > 1);
  assert.ok(new Set(grid.map(({ y }) => y.toFixed(8))).size > 1);
});

test("Golden Angle and Golden Spiral are deterministic and distinct", () => {
  const angleA = positions("golden-angle");
  const angleB = positions("golden-angle");
  const spiralA = positions("golden-spiral");
  const spiralB = positions("golden-spiral");
  assert.deepEqual(angleA, angleB);
  assert.deepEqual(spiralA, spiralB);
  assert.notDeepEqual(angleA, spiralA);
});

test("Seeded Random reproduces a seed and Regenerate changes seed and result", () => {
  const first = positions("seeded-random", fixture(20), { seed: 42 });
  const again = positions("seeded-random", fixture(20), { seed: 42 });
  const regeneratedSeed = regenerateArrangementSeed(42);
  const regenerated = positions("seeded-random", fixture(20), { seed: regeneratedSeed });
  assert.deepEqual(first, again);
  assert.notEqual(regeneratedSeed, 42);
  assert.notDeepEqual(first, regenerated);
});

test("area-aware Circle defaults prevent ordinary overlap", () => {
  const input = fixture(24);
  const output = positions("circle", input);
  for (let a = 0; a < output.length; a += 1) {
    for (let b = a + 1; b < output.length; b += 1) {
      const distance = Math.hypot(output[a].x - output[b].x, output[a].y - output[b].y);
      assert.ok(distance + 1e-7 >= areaToRadius(input[a].area) + areaToRadius(input[b].area) + DEFAULT_ARRANGEMENT_PARAMETERS.collisionMargin);
    }
  }
});

test("Preview is transient, Apply is one x/y-only history entry, Cancel is none, and Undo/Redo are immediate", async () => {
  const initial = useLab.getInitialState();
  const spaces = fixture(8);
  useLab.setState({
    spaces,
    selectedIds: spaces.slice(0, 4).map(({ id }) => id),
    primarySelectedId: spaces[3].id,
    selectedId: spaces[3].id,
    transformUndoStack: [],
    transformRedoStack: [],
    arrangementPreview: null,
  });
  const canonicalBefore = structuredClone(useLab.getState().spaces);
  await useLab.getState().previewArrangement("horizontal-line", params());
  assert.deepEqual(useLab.getState().spaces, canonicalBefore);
  assert.equal(useLab.getState().transformUndoStack.length, 0);
  assert.equal(useLab.getState().arrangementPreview?.length, 4);
  useLab.getState().cancelArrangementPreview();
  assert.equal(useLab.getState().arrangementPreview, null);
  assert.equal(useLab.getState().transformUndoStack.length, 0);

  await useLab.getState().previewArrangement("horizontal-line", params());
  useLab.getState().applyArrangementPreview();
  const applied = structuredClone(useLab.getState().spaces);
  assert.equal(useLab.getState().transformUndoStack.length, 1);
  assert.equal(useLab.getState().arrangementPreview, null);
  assert.deepEqual(applied.slice(4), canonicalBefore.slice(4), "unselected entities stay exactly fixed");
  applied.forEach((space, index) => {
    const before = canonicalBefore[index];
    const { x: _beforeX, y: _beforeY, ...beforeData } = before;
    const { x: _afterX, y: _afterY, ...afterData } = space;
    assert.deepEqual(afterData, beforeData, `${space.id} preserves every non-x/y property`);
  });
  assert.deepEqual(useLab.getState().selectedIds, canonicalBefore.slice(0, 4).map(({ id }) => id));
  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().spaces, canonicalBefore);
  useLab.getState().redoSpaceTransform();
  assert.deepEqual(useLab.getState().spaces, applied);
  useLab.setState(initial, true);
});

test("a stale worker response cannot overwrite a newer preview", () => {
  const gate = createLatestRequestGate();
  const older = gate.begin();
  const newer = gate.begin();
  assert.equal(gate.isCurrent(older), false);
  assert.equal(gate.isCurrent(newer), true);
  gate.cancel();
  assert.equal(gate.isCurrent(newer), false);
});

test("worker routing uses the bounded threshold and always offloads packing", async () => {
  const runtime = await import("./runtime");
  assert.equal(runtime.ARRANGEMENT_WORKER_THRESHOLD, 80);
  assert.equal(runtime.shouldUseArrangementWorker("grid", 80), false);
  assert.equal(runtime.shouldUseArrangementWorker("grid", 81), true);
  assert.equal(runtime.shouldUseArrangementWorker("compact-pack", 4), true);
  assert.equal(runtime.shouldUseArrangementWorker("relaxed-pack", 4), true);
});

test("both Canvas owners project the shared transient positions while exports stay canonical", () => {
  const classic = readFileSync(new URL("../canvas/CanvasView.tsx", import.meta.url), "utf8");
  const organism = readFileSync(new URL("../canvas/OrganismCanvasView.tsx", import.meta.url), "utf8");
  assert.match(classic, /arrangementPreview/);
  assert.match(classic, /applySpacePositionsPreview/);
  assert.match(organism, /arrangementPreview/);
  assert.match(organism, /applySpacePositionsPreview/);
  assert.match(classic, /canonical\.spaces/);
  assert.match(organism, /canonical\.spaces/);
  assert.ok(organism.indexOf("toCanvas(layer") < organism.indexOf("spaces = liveSpaces"), "Organism restores preview positions only after canonical labels are captured");
});

test("closing ARRANGE clears an unapplied preview without history", async () => {
  const initial = useLab.getInitialState();
  const spaces = fixture(6);
  useLab.setState({ spaces, selectedIds: [], primarySelectedId: null, selectedId: null, openWidgets: ["layout"], transformUndoStack: [] });
  await useLab.getState().previewArrangement("circle", params());
  assert.ok(useLab.getState().arrangementPreview?.length);
  useLab.getState().closeWidget("layout");
  assert.equal(useLab.getState().arrangementPreview, null);
  assert.equal(useLab.getState().transformUndoStack.length, 0);
  useLab.setState(initial, true);
});

test("ARRANGE UI is registry-driven, searchable, scoped and has Preview Apply Cancel", () => {
  const widget = readFileSync(new URL("../ui/widgets/LayoutWidget.tsx", import.meta.url), "utf8");
  const registry = readFileSync(new URL("../ui/panels/widgetRegistry.ts", import.meta.url), "utf8");
  assert.match(widget, /ARRANGEMENT_PATTERNS/);
  assert.match(widget, /\.map\(\(pattern\)/);
  assert.match(widget, /type="search"/);
  assert.match(widget, /Auto/);
  assert.match(widget, /Selected/);
  assert.match(widget, /All Visible/);
  assert.match(widget, /Include Voids/);
  assert.match(widget, />Preview</);
  assert.match(widget, />Apply</);
  assert.match(widget, />Cancel</);
  assert.doesNotMatch(widget, /globalOffset|Spread \(visual\)/);
  assert.match(registry, /label: "ARRANGE"/);
});

test("the existing eight layout IDs remain supported", () => {
  for (const id of ["organic", "random", "core", "colony", "division", "tendril", "orbit", "asymmetry"] as const) {
    assert.equal(getArrangementPattern(id)?.id, id);
    assert.equal(positions(id).length, 10);
  }
});
