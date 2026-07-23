/**
 * MOOORF Visual Arsenal — Locked Registry Contract & Cross-Validation Tests
 * Wave VA0 Verification Suite (Review Corrected)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  UIIconRegistry,
  SiteSymbolRegistry,
  AnalysisGeneratorRegistry,
  VisualPresetRegistry,
} from "./registries.ts";
import { UI_ICON_COMPONENTS } from "../../icons/uiIconComponents.ts";

describe("Wave VA0 Locked Registry Contracts", () => {
  it("verifies locked UI Icon Registry exact manifest count (36) and unique IDs", () => {
    const icons = UIIconRegistry.getAll();
    assert.strictEqual(icons.length, 36, `Expected exactly 36 locked UI icons, got ${icons.length}`);

    const idSet = new Set<string>();
    for (const icon of icons) {
      assert.ok(icon.id, "Icon ID must not be empty");
      assert.ok(!idSet.has(icon.id), `Duplicate UI icon ID detected: ${icon.id}`);
      idSet.add(icon.id);

      assert.ok(icon.semanticName, `Icon ${icon.id} missing semantic name`);
      assert.ok(icon.tooltip, `Icon ${icon.id} missing tooltip`);
      assert.ok(icon.ariaLabel, `Icon ${icon.id} missing ariaLabel`);
      assert.strictEqual(icon.strokeWidth, 2.0, `Icon ${icon.id} strokeWidth must be 2.0`);
    }
  });

  it("verifies every VA1 semantic UI icon has a corresponding component in UI_ICON_COMPONENTS", () => {
    const icons = UIIconRegistry.getAll();
    for (const icon of icons) {
      const Component = UI_ICON_COMPONENTS[icon.id];
      assert.ok(Component, `Icon '${icon.id}' is missing a component mapping in UI_ICON_COMPONENTS`);
    }
  });

  it("verifies locked Site Symbol Registry exact manifest count (10) and architectural naming", () => {
    const symbols = SiteSymbolRegistry.getAll();
    assert.strictEqual(symbols.length, 10, `Expected exactly 10 launch site symbols, got ${symbols.length}`);

    const idSet = new Set<string>();
    for (const sym of symbols) {
      assert.ok(!idSet.has(sym.id), `Duplicate site symbol ID: ${sym.id}`);
      idSet.add(sym.id);

      assert.ok(sym.name, `Site symbol ${sym.id} missing name`);
      assert.ok(Number.isFinite(sym.anchor.x) && sym.anchor.x >= 0 && sym.anchor.x <= 1, `Invalid anchor.x for ${sym.id}`);
      assert.ok(Number.isFinite(sym.anchor.y) && sym.anchor.y >= 0 && sym.anchor.y <= 1, `Invalid anchor.y for ${sym.id}`);
      assert.ok(Number.isFinite(sym.defaultScale) && sym.defaultScale > 0, `Invalid defaultScale for ${sym.id}`);
      assert.ok(["technical", "editorial", "soft-analysis"].includes(sym.defaultVisualMode), `Invalid visual mode for ${sym.id}`);
      assert.ok(["P0", "P1", "P2", "P3"].includes(sym.performanceTier), `Invalid performance tier for ${sym.id}`);
    }

    // Verify architectural generic naming
    const deciduous = SiteSymbolRegistry.getById("tree:deciduous-mature");
    assert.ok(deciduous);
    assert.strictEqual(deciduous.name, "Mature Deciduous");

    const broadCanopy = SiteSymbolRegistry.getById("tree:broad-canopy");
    assert.ok(broadCanopy);
    assert.strictEqual(broadCanopy.name, "Broad Canopy Tree");

    const conifer = SiteSymbolRegistry.getById("tree:conifer");
    assert.ok(conifer);
    assert.strictEqual(conifer.name, "Conifer");
  });

  it("verifies cross-validation: every generator-backed SiteSymbol generatorId exists in AnalysisGeneratorRegistry", () => {
    const symbols = SiteSymbolRegistry.getAll();
    for (const sym of symbols) {
      if (sym.sourceType === "generator") {
        assert.ok(sym.generatorId, `Generator-backed symbol ${sym.id} missing generatorId`);
        const generatorExists = AnalysisGeneratorRegistry.hasId(sym.generatorId);
        assert.ok(generatorExists, `Symbol ${sym.id} references unknown generatorId '${sym.generatorId}'`);

        const generator = AnalysisGeneratorRegistry.getById(sym.generatorId)!;
        if (sym.presetParameters) {
          const specNames = generator.parameterSpecs.map((p) => p.name);
          for (const paramKey of Object.keys(sym.presetParameters)) {
            assert.ok(specNames.includes(paramKey), `Preset parameter '${paramKey}' in symbol ${sym.id} not defined in generator ${generator.id}`);
          }
        }
      }
    }
  });

  it("verifies locked Analysis Generator Registry exact count (18 approved generator families)", () => {
    const generators = AnalysisGeneratorRegistry.getAll();
    assert.strictEqual(generators.length, 18, `Expected exactly 18 approved analysis generator families, got ${generators.length}`);

    const expectedGeneratorIds = [
      "TreePlan", "Shrub", "Hedge", "WindFlow", "WindRose", "FlowPath",
      "SunPath", "SolarCone", "ViewCone", "NoiseCone", "DrainageFlow",
      "Contour", "Slope", "NorthArrow", "ScaleBar", "ActivityFigure",
      "UtilityLine", "StatusOverlay",
    ];

    for (const id of expectedGeneratorIds) {
      assert.ok(AnalysisGeneratorRegistry.hasId(id), `Missing approved generator family '${id}' in AnalysisGeneratorRegistry`);
    }
  });

  it("verifies locked Visual Preset Registry (10 launch presets) and canonical strokePatternId linkage", () => {
    const presets = VisualPresetRegistry.getAll();
    assert.strictEqual(presets.length, 10, `Expected exactly 10 launch visual presets, got ${presets.length}`);

    for (const preset of presets) {
      assert.ok(preset.strokePatternId, `Preset ${preset.id} missing strokePatternId`);
      assert.ok(["technical", "analytical", "architectural", "infrastructure", "flow", "landscape", "cadastral"].includes(preset.category));
    }
  });
});
