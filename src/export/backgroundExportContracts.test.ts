import { strict as assert } from "node:assert";
import test from "node:test";
import { useLab } from "../state/store";
import {
  createCanvasExportSnapshot,
  registerCanvasCapture,
  requestCanvasCapture,
} from "../canvas/exportCapture";

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
