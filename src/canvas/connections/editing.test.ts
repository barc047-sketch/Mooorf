import { strict as assert } from "node:assert";
import test from "node:test";
import {
  CONNECTION_PORT_HIT_RADIUS_PX,
  CONNECTION_PORT_VISIBLE_RADIUS_PX,
  deriveConnectionPorts,
  hitConnectionPort,
  resolveConnectionAutoPan,
  resolveConnectionAutoPanDelta,
  resolveConnectionPressIntent,
  resolveConnectionRelease,
  type ConnectionPortCandidate,
} from "./editing";

const candidate = (id: string, patch: Partial<ConnectionPortCandidate> = {}): ConnectionPortCandidate => ({
  id,
  spaceId: id,
  x: 100,
  y: 100,
  visible: true,
  inVisibleSubset: true,
  kind: "space",
  locked: false,
  hidden: false,
  deleted: false,
  ...patch,
});

test("ports include only visible valid Cells in the current Organism subset", () => {
  const ports = deriveConnectionPorts([
    candidate("valid"),
    candidate("void", { kind: "void" }),
    candidate("hidden", { hidden: true }),
    candidate("invisible", { visible: false }),
    candidate("locked", { locked: true }),
    candidate("deleted", { deleted: true }),
    candidate("off-subset", { inVisibleSubset: false }),
  ]);
  assert.deepEqual(ports.map((port) => port.spaceId), ["valid"]);
  assert.equal(ports[0]?.state, "idle");
});

test("port hit testing is screen-stable, bounded, and deterministic", () => {
  assert.equal(CONNECTION_PORT_VISIBLE_RADIUS_PX, 3);
  assert.equal(CONNECTION_PORT_HIT_RADIUS_PX, 10);
  const ports = deriveConnectionPorts([
    candidate("b", { x: 106, y: 100 }),
    candidate("a", { x: 100, y: 100 }),
  ]);
  assert.equal(hitConnectionPort(ports, { x: 109.9, y: 100 })?.spaceId, "b");
  assert.equal(hitConnectionPort(ports, { x: 116.1, y: 100 }), null);
  assert.equal(hitConnectionPort(ports, { x: 103, y: 100 })?.spaceId, "a", "ties use stable id order");
});

test("auto-pan is zero in the safe interior and bounded at every edge", () => {
  const viewport = { x: 20, y: 30, width: 400, height: 300 };
  assert.deepEqual(resolveConnectionAutoPan({ x: 220, y: 180 }, viewport), { dx: 0, dy: 0 });
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

test("release decisions cover drag, click fallback, invalid, and empty outcomes", () => {
  const source = deriveConnectionPorts([candidate("a")])[0]!;
  const target = deriveConnectionPorts([candidate("b")])[0]!;
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", port: target, nucleusId: "b", moved: true }), {
    kind: "commit",
    targetId: "b",
  });
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", port: source, nucleusId: "a", moved: false }), {
    kind: "keep-source",
  });
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", port: null, nucleusId: "void", moved: true }), {
    kind: "invalid",
    targetId: "void",
  });
  assert.deepEqual(resolveConnectionRelease({ sourceId: "a", port: null, nucleusId: null, moved: true }), {
    kind: "cancel",
  });
});

test("temporary Space or middle-button pan keeps navigation available after a source is armed", () => {
  assert.equal(resolveConnectionPressIntent({
    modeActive: true,
    layerVisible: true,
    hasPort: false,
    sourceId: "a",
    temporaryPan: false,
  }), "connection");
  assert.equal(resolveConnectionPressIntent({
    modeActive: true,
    layerVisible: true,
    hasPort: false,
    sourceId: "a",
    temporaryPan: true,
  }), "canvas");
  assert.equal(resolveConnectionPressIntent({
    modeActive: true,
    layerVisible: true,
    hasPort: true,
    sourceId: null,
    temporaryPan: false,
  }), "connection");
});
