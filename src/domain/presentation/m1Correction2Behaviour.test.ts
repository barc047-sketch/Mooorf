import { strict as assert } from "node:assert";
import { buildProjectSnapshot } from "../../export/projectSnapshot";
import * as presentation from "../../canvas/presentationLayers";
import * as registryModule from "../../materials/materialRegistry";
import { useLab } from "../../state/store";
import type { SpaceCell } from "../../types";
import { createProjectPresentationDefaults } from "./defaults";
import { resolveCellAppearance } from "./resolveAppearance";
import { normalizeProjectPresentationDefaults } from "./validation";

type Correction2Membrane = {
  colourMode: "cell-gradient" | "solid";
  solidMaterialId: "system:black" | "system:ink" | "system:mooorf-red" | "system:charcoal" | "custom";
};

const base = createProjectPresentationDefaults();
const baseMembrane = base.membrane as typeof base.membrane & Partial<Correction2Membrane>;
assert.equal(baseMembrane.colourMode, "cell-gradient", "Cell Gradient remains the canonical default");
assert.equal(baseMembrane.solidMaterialId, "system:black", "Solid mode has one deterministic canonical preset fallback");

const solidDefaults = normalizeProjectPresentationDefaults({
  ...base,
  membrane: {
    ...base.membrane,
    colourMode: "solid",
    solidMaterialId: "system:mooorf-red",
  },
}) as typeof base & { membrane: typeof base.membrane & Correction2Membrane };
assert.equal(solidDefaults.membrane.colourMode, "solid", "Solid Membrane mode survives canonical normalization");
assert.equal(solidDefaults.membrane.solidMaterialId, "system:mooorf-red", "Solid preset ID survives canonical normalization");

const membranePresets = (registryModule as Record<string, unknown>).MEMBRANE_SOLID_MATERIAL_IDS as readonly string[] | undefined;
assert.deepEqual(
  membranePresets,
  ["system:black", "system:ink", "system:mooorf-red", "system:charcoal"],
  "Solid Membrane presets come from one bounded registry-backed order"
);
for (const id of membranePresets ?? []) {
  const material = registryModule.materialRegistry.get(id);
  assert.ok(material?.compatibleTargets.includes("organism"), `${id} is a canonical Membrane Field material`);
  assert.equal(material?.preview.kind, "swatch", `${id} has one truthful solid swatch`);
}

const projectMembraneField = (presentation as Record<string, unknown>).projectMembraneField as ((input: {
  membrane: { colourMode: "cell-gradient" | "solid"; paint: { colour: string } };
  paletteBodyHex: string;
  paletteBodyBHex: string;
  membraneEdgeColour: string;
  paletteBlend: number;
}) => {
  bodyHex: string;
  bodyBHex: string;
  accentHex: string;
  colorMix: number;
  spatialColorMix: number;
}) | undefined;
assert.equal(typeof projectMembraneField, "function", "production renderer exposes an executable Membrane Field projection");
const gradientProjection = projectMembraneField?.({
  membrane: { colourMode: "cell-gradient", paint: { colour: "#112233" } },
  paletteBodyHex: "#112233",
  paletteBodyBHex: "#445566",
  membraneEdgeColour: "#778899",
  paletteBlend: 0.42,
});
assert.deepEqual(gradientProjection, {
  bodyHex: "#112233",
  bodyBHex: "#445566",
  accentHex: "#778899",
  colorMix: 0.42,
  spatialColorMix: 1,
}, "Cell Gradient preserves the existing palette and Cell-derived spatial colour path");
const solidProjection = projectMembraneField?.({
  membrane: { colourMode: "solid", paint: { colour: "#c31616" } },
  paletteBodyHex: "#112233",
  paletteBodyBHex: "#445566",
  membraneEdgeColour: "#778899",
  paletteBlend: 0.42,
});
assert.deepEqual(solidProjection, {
  bodyHex: "#c31616",
  bodyBHex: "#c31616",
  accentHex: "#778899",
  colorMix: 0,
  spatialColorMix: 0,
}, "Solid mode removes every palette and Cell-derived colour patch");

const storeDefaults = createProjectPresentationDefaults();
useLab.setState((state) => ({
  settings: { ...state.settings, presentationDefaults: storeDefaults },
  transformUndoStack: [],
  transformRedoStack: [],
  savedViews: [],
}));
useLab.getState().commitProjectPresentationDefaults(solidDefaults);
assert.equal(useLab.getState().transformUndoStack.length, 1, "Membrane mode and preset commit as one history transaction");
assert.equal(
  (useLab.getState().settings.presentationDefaults.membrane as typeof base.membrane & Partial<Correction2Membrane>).solidMaterialId,
  "system:mooorf-red",
  "committed Solid preset lives in canonical project defaults"
);
useLab.getState().undoSpaceTransform();
assert.equal(
  (useLab.getState().settings.presentationDefaults.membrane as typeof base.membrane & Partial<Correction2Membrane>).colourMode,
  "cell-gradient",
  "history Undo restores Cell Gradient"
);
useLab.getState().redoSpaceTransform();
assert.equal(
  (useLab.getState().settings.presentationDefaults.membrane as typeof base.membrane & Partial<Correction2Membrane>).colourMode,
  "solid",
  "history Redo restores Solid mode"
);

const space: SpaceCell = {
  id: "solid-round-trip",
  name: "Solid round trip",
  body: "Persistence proof",
  area: 80,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
};
const resolveContext = {
  paletteMode: "core" as const,
  colorSource: "category" as const,
  nucleusPaletteId: "editorial-aurora",
  organismPaletteId: "mode",
  morphMode: "cellular-reverse" as const,
  theme: "day" as const,
  spaces: [space],
};
const presetColours = new Map([
  ["system:black", "#000000"],
  ["system:ink", "#171719"],
  ["system:mooorf-red", "#c31616"],
  ["system:charcoal", "#2f2f2f"],
]);
for (const [solidMaterialId, expectedColour] of presetColours) {
  const presetDefaults = normalizeProjectPresentationDefaults({
    ...base,
    membrane: { ...base.membrane, colourMode: "solid", solidMaterialId },
  });
  const resolved = resolveCellAppearance(space, presetDefaults, resolveContext);
  assert.equal(resolved.membrane.paint.colour, expectedColour, `${solidMaterialId} resolves deterministically`);
  assert.equal(resolved.membrane.paint.materialId, solidMaterialId, `${solidMaterialId} stays registry-backed`);
}
const customDefaults = normalizeProjectPresentationDefaults({
  ...base,
  membrane: {
    ...base.membrane,
    colourMode: "solid",
    solidMaterialId: "custom",
    paint: { ...base.membrane.paint, colour: "#1a2b3c", opacity: 0.37 },
  },
});
const customResolved = resolveCellAppearance(space, customDefaults, resolveContext);
assert.equal(customResolved.membrane.paint.colour, "#1a2b3c", "Custom Solid uses the canonical Membrane colour control");
assert.equal(customResolved.membrane.paint.opacity, 0.37, "Custom Solid preserves canonical Membrane opacity");

const state = useLab.getState();
const snapshot = buildProjectSnapshot({
  spaces: [space],
  camera: state.camera,
  theme: state.theme,
  settings: state.settings,
}, "Correction 2 persistence");
const snapshotMembrane = snapshot.settings.presentationDefaults.membrane as typeof base.membrane & Partial<Correction2Membrane>;
assert.equal(snapshotMembrane.colourMode, "solid", "project export snapshot preserves Solid mode");
assert.equal(snapshotMembrane.solidMaterialId, "system:mooorf-red", "project export snapshot preserves the registry material ID");

const historyCountBeforeCustom = useLab.getState().transformUndoStack.length;
useLab.getState().commitProjectPresentationDefaults(customDefaults);
assert.equal(useLab.getState().transformUndoStack.length, historyCountBeforeCustom + 1, "Custom colour and opacity commit as one history transaction");
assert.equal(useLab.getState().settings.presentationDefaults.membrane.paint.colour, "#1a2b3c", "Custom colour commits to canonical defaults");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().settings.presentationDefaults.membrane.solidMaterialId, "system:mooorf-red", "Custom Undo restores the prior preset");
useLab.getState().redoSpaceTransform();
assert.equal(useLab.getState().settings.presentationDefaults.membrane.paint.opacity, 0.37, "Custom Redo restores colour and opacity together");

useLab.setState({ spaces: [space], savedViews: [] });
const savedId = useLab.getState().saveCurrentView("Correction 2 Custom Solid");
const savedMembrane = useLab.getState().savedViews.find(({ id }) => id === savedId)?.presentationDefaults?.membrane as
  | (typeof base.membrane & Partial<Correction2Membrane>)
  | undefined;
assert.equal(savedMembrane?.colourMode, "solid", "saved view preserves Solid mode");
assert.equal(savedMembrane?.solidMaterialId, "custom", "saved view preserves the Custom material sentinel");
assert.equal(savedMembrane?.paint.colour, "#1a2b3c", "saved view preserves Custom Solid colour");
assert.equal(savedMembrane?.paint.opacity, 0.37, "saved view preserves Custom Solid opacity");

console.info("C0 M1 correction 2 Membrane, history and persistence behaviour passed");
