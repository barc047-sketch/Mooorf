import { strict as assert } from "node:assert";
import test from "node:test";
import { resolveCellShadowGated } from "../canvas/cellShadow";
import { useLab } from "../state/store";
import { spacesToNuclei } from "../canvas/organismAdapter";
import { resolveOrganism } from "../canvas/organismProductionSettings";
import { projectRuntimePresentation } from "../canvas/presentationLayers";
import {
  createCanvasExportSnapshot,
  registerCanvasCapture,
  requestCanvasCapture,
} from "../canvas/exportCapture";
import { resolveLivePerformanceSettings, resolvePreviewRenderScale } from "../runtime/performanceProfiles";

// Behavioural snapshot and authored-projection contracts.
test("canonical export snapshot is detached from live project and preview owners", () => {
  const initial = useLab.getInitialState();
  const input = {
    spaces: [{
      id: "export-cell",
      name: "Export Cell",
      area: 20,
      category: "Studio",
      privacy: "shared" as const,
      color: "#6f7f75",
      x: 0,
      y: 0,
    }],
    camera: { ...initial.camera },
    theme: initial.theme,
    settings: structuredClone(initial.settings),
    selectedId: initial.selectedId,
    selectedIds: [...initial.selectedIds],
    appearancePreview: structuredClone(initial.spaces),
    presentationDefaultsPreview: structuredClone(initial.settings.presentationDefaults),
    membraneRuntimePreview: { mergeDistance: 44 },
    visualSettingsPreview: {
      organism: structuredClone(initial.settings.organism),
      cellShadow: structuredClone(initial.settings.cellShadow),
    },
    resourcesPreview: structuredClone(initial.settings.resources),
  };
  const previewRefs = {
    appearance: input.appearancePreview,
    defaults: input.presentationDefaultsPreview,
    membrane: input.membraneRuntimePreview,
    visual: input.visualSettingsPreview,
    resources: input.resourcesPreview,
  };
  const snapshot = createCanvasExportSnapshot(input);

  input.spaces[0]!.name = "Live mutation";
  input.camera.x = 999;
  input.settings.blobOn = !input.settings.blobOn;

  assert.notEqual(snapshot.spaces[0]?.name, "Live mutation");
  assert.notEqual(snapshot.camera.x, 999);
  assert.notEqual(snapshot.settings.blobOn, input.settings.blobOn);
  assert.strictEqual(input.appearancePreview, previewRefs.appearance);
  assert.strictEqual(input.presentationDefaultsPreview, previewRefs.defaults);
  assert.strictEqual(input.membraneRuntimePreview, previewRefs.membrane);
  assert.strictEqual(input.visualSettingsPreview, previewRefs.visual);
  assert.strictEqual(input.resourcesPreview, previewRefs.resources);
});

test("capture provider receives one explicit immutable snapshot", async () => {
  const snapshot = createCanvasExportSnapshot(useLab.getInitialState());
  let calls = 0;
  const unregister = registerCanvasCapture(async (_options, received) => {
    calls += 1;
    assert.strictEqual(received, snapshot);
    return { canvas: {} as HTMLCanvasElement, cssWidth: 10, cssHeight: 10 };
  });
  try {
    await requestCanvasCapture({ scale: 1, includeLabels: true, includeSelection: false }, snapshot);
    assert.equal(calls, 1);
  } finally {
    unregister();
  }
});

test("detached export preserves the authored Organism projection while excluding runtime state", () => {
  const initial = useLab.getInitialState();
  const settings = structuredClone(initial.settings);
  settings.blobOn = true;
  settings.performanceQuality = "automatic";
  Object.assign(settings.organism, {
    motionEnabled: true,
    idleMotion: true,
    drift: 0.6,
    breathing: 0.4,
    wobble: 0.2,
  });
  Object.assign(settings.cellShadow, {
    enabled: true,
    mode: "soft",
    strength: 0.8,
    opacity: 0.45,
    softness: 36,
    includeInExport: true,
  });
  Object.assign(settings.presentationDefaults.cell.paint, { colour: "#0f6b64", opacity: 0.72 });
  Object.assign(settings.presentationDefaults.membrane, { visible: true, colourMode: "solid" });
  Object.assign(settings.presentationDefaults.membrane.paint, { colour: "#1a8a80", opacity: 0.63 });
  Object.assign(settings.presentationDefaults.membraneEdge, { visible: true, width: 2.5, softness: 0.12 });
  Object.assign(settings.presentationDefaults.membraneEdge.paint, { colour: "#d5f0ea", opacity: 0.54 });

  const spaces = [{
    id: "parity-cell",
    name: "Parity Cell",
    area: 42,
    category: "Studio",
    privacy: "shared" as const,
    color: "#6f7f75",
    x: 24,
    y: -16,
  }];
  const source = {
    spaces,
    camera: { ...initial.camera },
    theme: initial.theme,
    settings,
    selectedId: null,
    selectedIds: [],
    runtimeOnly: {
      automaticTier: "fast",
      previewScale: resolvePreviewRenderScale("ultra-fast", "fast", true, true),
      interactionBoost: true,
      fps: 19,
      shadowDisabled: true,
      motionThrottled: true,
      previewMode: "ultra-fast",
    },
  };
  const snapshot = createCanvasExportSnapshot(source);
  const liveRuntimeSettings = resolveLivePerformanceSettings(settings, {
    authoredQuality: "automatic",
    effectiveQuality: "fast",
    configuredRenderer: "organism",
  }, "organism");

  const livePresentation = projectRuntimePresentation(source.spaces, settings, source.theme);
  const detachedPresentation = projectRuntimePresentation(snapshot.spaces, snapshot.settings, snapshot.theme);
  assert.deepEqual([...detachedPresentation.byId.entries()], [...livePresentation.byId.entries()]);
  assert.deepEqual(detachedPresentation.membrane, livePresentation.membrane);
  assert.deepEqual(detachedPresentation.membraneEdge, livePresentation.membraneEdge);

  const colours = (projection: typeof livePresentation) => new Map(
    [...projection.byId].map(([id, appearance]) => [id, appearance.cell.paint.colour]),
  );
  const liveNuclei = spacesToNuclei(
    source.spaces,
    source.camera,
    1280,
    720,
    null,
    null,
    resolveOrganism(settings, true).adapter,
    undefined,
    settings.paletteMode,
    settings.nucleusPaletteId,
    settings.colorSource,
    undefined,
    colours(livePresentation),
  );
  const detachedNuclei = spacesToNuclei(
    snapshot.spaces,
    snapshot.camera,
    1280,
    720,
    null,
    null,
    resolveOrganism(snapshot.settings, true).adapter,
    undefined,
    snapshot.settings.paletteMode,
    snapshot.settings.nucleusPaletteId,
    snapshot.settings.colorSource,
    undefined,
    colours(detachedPresentation),
  );
  assert.deepEqual(detachedNuclei, liveNuclei);

  assert.equal(snapshot.settings.performanceQuality, "automatic");
  assert.deepEqual(snapshot.settings.organism, settings.organism);
  assert.deepEqual(snapshot.settings.cellShadow, settings.cellShadow);
  assert.equal(resolveCellShadowGated(snapshot.settings.cellShadow, "high", snapshot.theme).enabled, true);
  assert.equal(liveRuntimeSettings.performanceQuality, "fast");
  assert.equal(liveRuntimeSettings.cellShadow.enabled, false);
  assert.equal(liveRuntimeSettings.organism.drift, 0);
  assert.equal("runtimeOnly" in snapshot, false);
});
