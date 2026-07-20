import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => readFileSync(path, "utf8");

test("Label Studio stays a WidgetHost body over the canonical label defaults", () => {
  const types = source("src/types.ts");
  const registry = source("src/ui/panels/widgetRegistry.ts");
  const host = source("src/ui/widgets/WidgetHost.tsx");
  const studio = source("src/ui/widgets/LabelStudioWidget.tsx");

  assert.match(types, /\| "label-studio"/);
  assert.match(registry, /"label-studio": \{[\s\S]*?label: "Label Studio"[\s\S]*?launcher: "widget"/);
  assert.match(host, /"label-studio": \(\) => <LabelStudioWidget \/>/);
  assert.match(studio, /appearancePreview \?\? state\.spaces/);
  assert.match(studio, /presentationDefaultsPreview \?\? state\.settings\.presentationDefaults/);
  assert.match(studio, /commitText\(selectedIds, \{ labels \}\)/);
  assert.match(studio, /previewText\(selectedIds, \{ labels \}\)/);
  assert.match(studio, /space\.appearance\?\.text\?\.labels !== undefined/);
  assert.match(studio, /inheritanceStateLabel\(inheritanceState\)/);
  assert.match(studio, /resetTextLabels\(selectedIds\)/);
  assert.match(studio, /cancelAppearancePreview\(\);[\s\S]*?cancelDefaultsPreview\(\);/, "closing Label Studio clears transient preview owners");
  assert.match(studio, /mergeCellLabelConfig\(next\.text\.labels, labels\)/);
  assert.match(studio, /applyGlobalTextSize/);
  assert.match(studio, /previewGlobalTextSize/);
  assert.match(studio, /<LabelLayoutPane[\s\S]*?detailed[\s\S]*?selected=\{selected\}/);
});

test("Display uses canonical camera actions and the same project-default label path", () => {
  const store = source("src/state/store.ts");
  const display = source("src/ui/widgets/DisplayWidget.tsx");

  assert.match(store, /fitSelection: \(\)\s*=>[\s\S]*?s\.selectedIds\.includes\(space\.id\)[\s\S]*?fitCamera\(selected/);
  assert.match(display, /title="Camera"/);
  assert.match(display, /Fit project/);
  assert.match(display, /Fit selection/);
  assert.match(display, /Label Zoom &amp; Fit/);
  assert.match(display, /MEMBRANE AT ZOOM/);
  assert.match(display, /preserveMorphology/);
  assert.match(display, /lowZoomDetail/);
  assert.match(display, /minimumMorphologyDetail/);
  assert.match(display, /edgeStability/);
  assert.match(display, /Camera Shake/);
  assert.match(display, /cameraShakeMode/);
  assert.match(display, /cameraShakeIntensity/);
  assert.match(display, /cameraShakeFrequency/);
  assert.match(display, /cameraShakeDamping/);
  assert.match(display, /cameraShakeDragInfluence/);
  assert.match(display, /cameraShakeSettleDuration/);
  assert.match(display, /mergeCellLabelConfig\(next\.text\.labels, labels\)/);
  assert.match(display, /commitProjectDefaults\(nextLabelDefaults/);
  assert.match(display, /previewProjectDefaults\(nextLabelDefaults/);
  assert.match(display, /onChangeCancel=\{cancelDefaultsPreview\}/);
  assert.doesNotMatch(display, /useState\(/, "Display has no parallel camera or label state");
});
