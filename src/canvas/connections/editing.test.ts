import { strict as assert } from "node:assert";
import test from "node:test";
import {
  resolveConnectionAutoPan,
  resolveConnectionAutoPanDelta,
  resolveConnectionPressIntent,
  resolveConnectionRelease,
} from "./editing";

test("auto-pan is optional, zero in the safe interior, and bounded at every edge", () => {
  const viewport = { x: 20, y: 30, width: 400, height: 300 };
  assert.deepEqual(resolveConnectionAutoPan({ x: 220, y: 180 }, viewport), { dx: 0, dy: 0 });
  assert.deepEqual(resolveConnectionAutoPan({ x: 20, y: 30 }, viewport, false), { dx: 0, dy: 0 });
  const topLeft = resolveConnectionAutoPan({ x: 20, y: 30 }, viewport);
  const bottomRight = resolveConnectionAutoPan({ x: 420, y: 330 }, viewport);
  assert.ok(topLeft.dx < 0 && topLeft.dy < 0);
  assert.ok(bottomRight.dx > 0 && bottomRight.dy > 0);
  for (const value of [topLeft.dx, topLeft.dy, bottomRight.dx, bottomRight.dy]) {
    assert.ok(Math.abs(value) <= 14, "edge velocity must remain bounded");
  }
  assert.deepEqual(resolveConnectionAutoPanDelta({ dx: 12, dy: -6 }, 1 / 60, 2), { dx: 6, dy: -3 });
  assert.deepEqual(resolveConnectionAutoPanDelta({ dx: 12, dy: -6 }, 5, 1), { dx: 36, dy: -18 }, "elapsed time is clamped");
});

test("whole-Cell release decisions cover valid, armed-source, invalid, and empty outcomes", () => {
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", nucleusId: "b", targetValid: true, moved: true }), {
    kind: "commit",
    targetId: "b",
  });
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", nucleusId: "a", targetValid: true, moved: false }), {
    kind: "keep-source",
  });
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", nucleusId: "void", targetValid: false, moved: true }), {
    kind: "invalid",
    targetId: "void",
  });
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", nucleusId: null, targetValid: false, moved: true }), {
    kind: "cancel",
  });
});

test("an eligible whole Cell owns authoring while temporary pan keeps navigation available", () => {
  assert.equal(resolveConnectionPressIntent({
    modeActive: true,
    layerVisible: true,
    hasCell: false,
    sourceId: "a",
    temporaryPan: false,
  }), "connection");
  assert.equal(resolveConnectionPressIntent({
    modeActive: true,
    layerVisible: true,
    hasCell: false,
    sourceId: "a",
    temporaryPan: true,
  }), "canvas");
  assert.equal(resolveConnectionPressIntent({
    modeActive: true,
    layerVisible: true,
    hasCell: true,
    sourceId: null,
    temporaryPan: false,
  }), "connection");
});
