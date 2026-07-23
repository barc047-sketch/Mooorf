/**
 * MOOORF Visual Arsenal — Connection Preset Expansion Tests
 * Wave VA2 Verification Suite (Review Corrected)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  CONNECTION_STROKE_PATTERNS,
  resolveConnectionStrokePattern,
  buildConnectionStrokeMotif,
  connectionStrokeDashArray,
} from "./strokePatterns.ts";

describe("Wave VA2 Connection Visual Arsenal & Parity Contracts", () => {
  it("verifies 17 base stroke pattern definitions in CONNECTION_STROKE_PATTERNS", () => {
    assert.strictEqual(CONNECTION_STROKE_PATTERNS.length, 17, `Expected 17 stroke pattern definitions, got ${CONNECTION_STROKE_PATTERNS.length}`);

    const patternIds = CONNECTION_STROKE_PATTERNS.map((p) => p.id);
    assert.ok(patternIds.includes("solid"));
    assert.ok(patternIds.includes("dashed"));
    assert.ok(patternIds.includes("dotted"));
    assert.ok(patternIds.includes("dash-dot"));
    assert.ok(patternIds.includes("long-dash"));
    assert.ok(patternIds.includes("dash-dot-dot"));
    assert.ok(patternIds.includes("sparse-dot"));
    assert.ok(patternIds.includes("centerline"));
    assert.ok(patternIds.includes("double"));
    assert.ok(patternIds.includes("segmented-bars"));
    assert.ok(patternIds.includes("zigzag"));
    assert.ok(patternIds.includes("wave"));
    assert.ok(patternIds.includes("scallop"));
    assert.ok(patternIds.includes("vertical-hash"));
    assert.ok(patternIds.includes("vertical-hatch"));
    assert.ok(patternIds.includes("lightning"));
    assert.ok(patternIds.includes("repeated-marker-flow"));
  });

  it("verifies Repeated Marker canonical stroke resolution", () => {
    const pattern = resolveConnectionStrokePattern("repeated-marker-flow");
    assert.strictEqual(pattern.id, "repeated-marker-flow");
    assert.strictEqual(pattern.rendererStrategy, "repeated-marker");
    assert.strictEqual(pattern.family, "procedural");
    assert.strictEqual(pattern.capabilities.amplitude, true);
    assert.strictEqual(pattern.capabilities.scale, true);
  });

  it("verifies Repeated Marker renderer projection and non-X-stretching behavior", () => {
    const shortLine = {
      kind: "line" as const,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    };

    const longLine = {
      kind: "line" as const,
      points: [
        { x: 0, y: 0 },
        { x: 300, y: 0 },
      ],
    };

    const shortMotif = buildConnectionStrokeMotif(shortLine, "repeated-marker-flow", 1.0, 4.0);
    const longMotif = buildConnectionStrokeMotif(longLine, "repeated-marker-flow", 1.0, 4.0);

    assert.ok(shortMotif.marks.length > 0, "Short line must render inline arrow marks");
    assert.ok(longMotif.marks.length > shortMotif.marks.length, "Longer line must add MORE mark repetitions, NOT stretch wavelength");
    assert.strictEqual(shortMotif.metrics.wavelength, longMotif.metrics.wavelength, "Wavelength must remain constant regardless of length");
  });

  it("verifies Repeated Marker showCenterline configuration seam", () => {
    const centerline = {
      kind: "line" as const,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    };

    const motifWithCenterline = buildConnectionStrokeMotif(centerline, "repeated-marker-flow", 1.0, 4.0);
    assert.strictEqual(motifWithCenterline.paths.length, 1, "Centerline should be included by default");
    assert.ok(motifWithCenterline.marks.length > 0, "Inline marks must be generated");
  });

  it("verifies dash array scaling helper", () => {
    const defaultDashes = connectionStrokeDashArray("dashed", 1.0);
    const scaledDashes = connectionStrokeDashArray("dashed", 2.0);

    assert.deepEqual(defaultDashes, [8, 6]);
    assert.deepEqual(scaledDashes, [16, 12]);
  });
});
