/**
 * MOOORF Visual Arsenal — Registry Contract Tests
 * Wave VA0 Verification Suite
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  UIIconRegistry,
  SiteSymbolRegistry,
  AnalysisGeneratorRegistry,
  VisualPresetRegistry,
} from "./registries.ts";

describe("Wave VA0 Registry Contracts", () => {
  it("verifies UI Icon Registry uniqueness and non-empty IDs", () => {
    const icons = UIIconRegistry.getAll();
    assert.ok(icons.length >= 30, `Expected at least 30 UI icons, got ${icons.length}`);

    const idSet = new Set<string>();
    for (const icon of icons) {
      assert.ok(icon.id, "Icon ID must not be empty");
      assert.ok(!idSet.has(icon.id), `Duplicate UI icon ID detected: ${icon.id}`);
      idSet.add(icon.id);

      assert.ok(icon.semanticName, `Icon ${icon.id} missing semantic name`);
      assert.ok(icon.tooltip, `Icon ${icon.id} missing tooltip`);
      assert.ok(icon.ariaLabel, `Icon ${icon.id} missing ariaLabel`);
      assert.ok(icon.strokeWidth === 2.0, `Icon ${icon.id} strokeWidth should be 2.0`);
    }
  });

  it("verifies lookup helpers for UI Icon Registry", () => {
    assert.strictEqual(UIIconRegistry.hasId("ui:act:select"), true);
    assert.strictEqual(UIIconRegistry.hasId("ui:nonexistent:id"), false);

    const selectIcon = UIIconRegistry.getById("ui:act:select");
    assert.ok(selectIcon);
    assert.strictEqual(selectIcon.iconName, "MousePointer");
  });

  it("verifies Site Symbol Registry definitions and parameters", () => {
    const symbols = SiteSymbolRegistry.getAll();
    assert.ok(symbols.length >= 10, "Expected launch site symbols");

    const idSet = new Set<string>();
    for (const sym of symbols) {
      assert.ok(!idSet.has(sym.id), `Duplicate site symbol ID: ${sym.id}`);
      idSet.add(sym.id);

      assert.ok(sym.name, `Site symbol ${sym.id} missing name`);
      assert.ok(sym.anchor, `Site symbol ${sym.id} missing anchor`);
      assert.ok(sym.defaultScale > 0, `Site symbol ${sym.id} scale must be positive`);
    }
  });

  it("verifies Analysis Generator Registry entries", () => {
    const generators = AnalysisGeneratorRegistry.getAll();
    assert.ok(generators.length >= 10, "Expected launch generators");

    const treePlanGen = AnalysisGeneratorRegistry.getById("TreePlan");
    assert.ok(treePlanGen);
    assert.strictEqual(treePlanGen.category, "landscape");

    const windFlowGen = AnalysisGeneratorRegistry.getById("WindFlow");
    assert.ok(windFlowGen);
    assert.strictEqual(windFlowGen.category, "wind");
  });

  it("verifies Visual Preset Registry 16 launch line entries", () => {
    const presets = VisualPresetRegistry.getAll();
    assert.ok(presets.length >= 10, "Expected launch visual presets");

    const solidPrimary = VisualPresetRegistry.getById("solid-primary");
    assert.ok(solidPrimary);
    assert.strictEqual(solidPrimary.baseFamily, "continuous");
    assert.strictEqual(solidPrimary.defaultWidth, 2.0);

    const doubleBarrier = VisualPresetRegistry.getById("double-barrier");
    assert.ok(doubleBarrier);
    assert.strictEqual(doubleBarrier.baseFamily, "parallel");
  });
});
