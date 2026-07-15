import { strict as assert } from "node:assert";
import { DEFAULT_CELL_SHADOW, resolveCellShadowGated } from "./cellShadow";
import { DEFAULT_ORGANISM_SETTINGS, resolveOrganism } from "./organismProductionSettings";
import { resolveRuntimeGates, runOwnedWork } from "./runtimeGates";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import { normalizeProjectPresentationDefaults } from "../domain/presentation/validation";
import { iconRegistry } from "../icons/iconRegistry";
import { normalizeIconPlacement } from "../icons/iconValidation";
import { DEFAULT_RESOURCE_SETTINGS, normalizeResourceSettings, RESOURCE_SCHEMA_VERSION } from "../resources/resourcePersistence";
import { useLab } from "../state/store";

const settings = useLab.getInitialState().settings;

// Canonical appearance migration keeps the two softness owners independent.
const appearance = normalizeProjectPresentationDefaults({
  ...createProjectPresentationDefaults(settings),
  schemaVersion: 4,
  membraneEdge: { ...settings.presentationDefaults.membraneEdge, softness: 0.62 },
  core: { ...settings.presentationDefaults.core, offsetX: 14, offsetY: -9 },
}, settings);
assert.equal(appearance.schemaVersion, 4);
assert.equal(appearance.membraneEdge.softness, 0.62);
assert.equal(appearance.core.offsetX, 14);
assert.equal(appearance.core.offsetY, -9);
assert.notEqual(appearance.membraneEdge.softness, DEFAULT_ORGANISM_SETTINGS.edgeSoftness);

// Off gates skip feature-owned resolution/work rather than merely returning invisible output.
let shadowResolutions = 0;
const shadow = resolveCellShadowGated(
  { ...DEFAULT_CELL_SHADOW, enabled: false, mode: "off" },
  "high",
  "day",
  () => {
    shadowResolutions += 1;
    throw new Error("disabled shadow resolver must not run");
  },
);
assert.equal(shadow.enabled, false);
assert.equal(shadowResolutions, 0);

const gates = resolveRuntimeGates({
  membraneVisible: false,
  membraneEdgeVisible: false,
  shadowEnabled: false,
  motionEnabled: false,
  labelsVisible: false,
  gridVisible: false,
  interactionActive: false,
  snappingEnabled: false,
});
let ownedWork = 0;
runOwnedWork(gates.membrane, () => { ownedWork += 1; });
runOwnedWork(gates.membraneEdge, () => { ownedWork += 1; });
runOwnedWork(gates.labels, () => { ownedWork += 1; });
runOwnedWork(gates.grid, () => { ownedWork += 1; });
runOwnedWork(gates.snapping, () => { ownedWork += 1; });
assert.equal(ownedWork, 0);
assert.equal(gates.continuous, false);

const moving = {
  ...settings,
  organism: {
    ...settings.organism,
    motionEnabled: true,
    idleMotion: true,
    drift: 0.4,
  },
};
assert.equal(resolveOrganism(moving).motionActive, true);
assert.equal(resolveOrganism({ ...moving, organism: { ...moving.organism, motionEnabled: false } }).motionActive, false);

// Resource v2 migration owns full placement/backing and normalizes one symbol per Cell.
assert.equal(RESOURCE_SCHEMA_VERSION, 2);
const placement = normalizeIconPlacement({
  iconId: "icon:door",
  targetSpaceId: "space-a",
  placement: "top-right",
  offsetX: 999,
  offsetY: -999,
  scale: 2,
  rotation: -45,
  opacity: 0.8,
  tint: "#ABC",
  backing: "circle",
  backingSize: 64,
  backingOffsetX: 9,
  backingOffsetY: -8,
  backingOpacity: 0.4,
  backingOutline: true,
  backingOutlineWidth: 3,
  hideBelowZoom: 0.45,
});
assert.equal(placement.iconId, "icon:architecture:door");
assert.equal(placement.placement, "top-right");
assert.equal(placement.offsetX, 128);
assert.equal(placement.offsetY, -128);
assert.equal(placement.tint, "#aabbcc");
assert.equal(placement.backingOutline, true);

const resources = normalizeResourceSettings({
  ...DEFAULT_RESOURCE_SETTINGS,
  schemaVersion: 1,
  iconPlacements: [placement, { ...placement, iconId: "icon:architecture:kitchen" }],
  iconFavourites: ["icon:door", "icon:missing", "icon:door"],
  iconRecents: ["icon:wc", "icon:door", "icon:wc"],
});
assert.equal(resources.iconPlacements.length, 1, "one primary symbol is retained per Cell");
assert.equal(resources.iconPlacements[0]?.iconId, "icon:architecture:kitchen", "latest symbol replaces the earlier one");
assert.deepEqual(resources.iconFavourites, ["icon:architecture:door"]);
assert.equal(resources.iconRecents[0], "icon:architecture:toilet");

useLab.setState({
  spaces: [{ id: "space-a", name: "Studio", kind: "space", area: 80, category: "Work", privacy: "public", color: "", x: 10, y: 20 }],
  settings: { ...settings, resources: normalizeResourceSettings(DEFAULT_RESOURCE_SETTINGS) },
  transformUndoStack: [],
  transformRedoStack: [],
});
useLab.getState().previewSymbolPlacement("space-a", placement);
assert.equal(useLab.getState().resourcesPreview?.iconPlacements.length, 1, "hover preview is store-owned and ephemeral");
assert.equal(useLab.getState().transformUndoStack.length, 0, "hover preview creates no history");
useLab.getState().cancelSymbolPreview();
useLab.getState().commitSymbolPlacement("space-a", placement);
assert.equal(useLab.getState().settings.resources.iconPlacements[0]?.iconId, "icon:architecture:door");
assert.equal(useLab.getState().transformUndoStack.length, 1, "symbol apply creates one bounded history transaction");
useLab.getState().undoSpaceTransform();
assert.equal(useLab.getState().settings.resources.iconPlacements.length, 0, "Undo restores symbol resources");
useLab.getState().redoSpaceTransform();
assert.equal(useLab.getState().settings.resources.iconPlacements.length, 1, "Redo restores symbol resources");

// Accepted M2 staging: 77 audited input, 3 rejected baseline IDs removed, 59 additions.
assert.equal(iconRegistry.list().length, 133);
for (const rejected of [
  "icon:circulation:step-forward",
  "icon:circulation:step-back",
  "icon:landscape:sunlight",
  "icon:diagram:share",
  "icon:annotation:section",
]) assert.equal(iconRegistry.get(rejected), null, `${rejected} remains unavailable`);
for (const alias of ["icon:wc", "icon:dining", "icon:office", "icon:elevator", "icon:wifi", "icon:power"]) {
  assert.ok(iconRegistry.resolveId(alias), `${alias} resolves deterministically`);
}

console.info("C0 M2 canonical schema, runtime gate, and symbol contracts passed");
