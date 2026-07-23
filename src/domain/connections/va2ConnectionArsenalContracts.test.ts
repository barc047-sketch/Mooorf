/**
 * MOOORF Visual Arsenal — Connection Preset Expansion Tests
 * Wave VA2 Verification Suite
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  CONNECTION_STROKE_PATTERNS,
  resolveConnectionStrokePattern,
  buildConnectionStrokeMotif,
  connectionStrokeDashArray,
} from "./strokePatterns.ts";

describe("Wave VA2 Connection Visual Arsenal", () => {
  it("verifies 16 launch stroke pattern definitions including repeated-marker-flow", () => {
    assert.ok(CONNECTION_STROKE_PATTERNS.length >= 16, `Expected at least 16 stroke patterns, got ${CONNECTION_STROKE_PATTERNS.length}`);

    const patternIds = CONNECTION_STROKE_PATTERNS.map((p) => p.id);
    assert.ok(patternIds.includes("solid"));
    assert.ok(patternIds.includes("dashed"));
    assert.ok(patternIds.includes("dotted"));
    assert.ok(patternIds.includes("double"));
    assert.ok(patternIds.includes("zigzag"));
    assert.ok(patternIds.includes("wave"));
    assert.ok(patternIds.includes("scallop"));
    assert.ok(patternIds.includes("vertical-hash"));
    assert.ok(patternIds.includes("vertical-hatch"));
    assert.ok(patternIds.includes("lightning"));
    assert.ok(patternIds.includes("repeated-marker-flow"));
  });

  it("verifies repeated-marker-flow motif generation", () => {
    const pattern = resolveConnectionStrokePattern("repeated-marker-flow");
    assert.strictEqual(pattern.rendererStrategy, "repeated-marker");
    assert.strictEqual(pattern.family, "procedural");

    const centerline = {
      kind: "line" as const,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    };

    const motif = buildConnectionStrokeMotif(centerline, "repeated-marker-flow", 1.0, 4.0);
    assert.ok(motif.paths.length > 0, "Repeated marker must produce centerline path");
    assert.ok(motif.marks.length > 0, "Repeated marker must produce inline arrow marks");
    assert.ok(motif.metrics.repetitions > 0, "Motif metrics must record repetitions");
  });

  it("verifies motif scale invariance and bounds", () => {
    const centerline = {
      kind: "line" as const,
      points: [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
      ],
    };

    const shortMotif = buildConnectionStrokeMotif(centerline, "zigzag", 1.0, 5.0);
    const scaledMotif = buildConnectionStrokeMotif(centerline, "zigzag", 2.0, 5.0);

    assert.ok(shortMotif.paths[0]!.length > 0);
    assert.ok(scaledMotif.paths[0]!.length > 0);
    assert.strictEqual(shortMotif.metrics.amplitude, 5.0);
  });

  it("verifies dash array scaling helper", () => {
    const defaultDashes = connectionStrokeDashArray("dashed", 1.0);
    const scaledDashes = connectionStrokeDashArray("dashed", 2.0);

    assert.deepEqual(defaultDashes, [8, 6]);
    assert.deepEqual(scaledDashes, [16, 12]);
  });
});
