import { GRID_PRESETS, gridRegistry } from "./gridRegistry";
import type { GridPresetDefinition } from "./types";
import { migrateLegacyGridSettings, normalizeGridSettings } from "./gridValidation";

const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const equal = (actual: unknown, expected: unknown, message: string) => { if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); };

type ExpandedGridDefinition = GridPresetDefinition & {
  status: "active" | "future";
  preview: { kind: string; label: string };
  supportedParameters: readonly string[];
  snapping: { compatible: boolean; mode: "none" | "orthogonal" | "isometric" | "radial"; implemented: boolean };
  cameraBehavior: "camera-synced" | "center-locked" | "none";
  themeCompatibility: readonly ("day" | "night")[];
  compatibleMaterialTargets: readonly string[];
  exportBehavior: { mode: "optional-raster" | "excluded"; implemented: boolean };
  rendererSupport: { classic: boolean; organism: boolean };
};

const presets = GRID_PRESETS as readonly ExpandedGridDefinition[];
const expectedIds = ["dotted", "fine-line", "technical", "architectural", "major-minor", "isometric", "radial", "none"];
equal(presets.map((preset) => preset.id).join(","), expectedIds.join(","), "canonical grid ids and order remain stable");
equal(new Set(presets.map((preset) => preset.id)).size, 8, "grid preset ids are unique");

for (const preset of presets) {
  ok(preset.preview?.kind && preset.preview.label, `${preset.id} includes preview metadata`);
  equal(new Set(preset.supportedParameters).size, preset.supportedParameters.length, `${preset.id} parameter metadata is unique`);
  ok(["active", "future"].includes(preset.status), `${preset.id} declares truthful status`);
  ok(preset.themeCompatibility.includes("day") && preset.themeCompatibility.includes("night"), `${preset.id} supports both themes`);
  equal(preset.compatibleMaterialTargets.join(","), "grid", `${preset.id} declares grid material compatibility`);
  equal(preset.renders, preset.rendererSupport.classic || preset.rendererSupport.organism, `${preset.id} render flag matches current renderer support`);
  equal(preset.snapping.implemented, false, `${preset.id} does not falsely claim snapping implementation`);
  equal(preset.exportBehavior.implemented, false, `${preset.id} does not falsely claim export implementation`);
  equal(gridRegistry.get(preset.id), preset, `${preset.id} is discoverable`);
}

const dotted = gridRegistry.get("dotted") as ExpandedGridDefinition;
equal(dotted.status, "active", "dotted is the current live grid");
equal(dotted.rendererSupport.classic, false, "Classic grid rendering is not claimed");
equal(dotted.rendererSupport.organism, true, "Organism dotted rendering is truthful");
equal(dotted.cameraBehavior, "camera-synced", "dotted grid follows camera pan and zoom");
equal(dotted.snapping.mode, "orthogonal", "dotted snap compatibility is orthogonal");

const futureIds = ["fine-line", "technical", "architectural", "major-minor", "isometric", "radial"];
for (const id of futureIds) {
  const preset = gridRegistry.get(id) as ExpandedGridDefinition;
  equal(preset.status, "future", `${id} remains metadata-only`);
  equal(preset.renders, false, `${id} does not falsely claim current rendering`);
}
ok((gridRegistry.get("fine-line")?.tags ?? []).includes("square"), "square grid terminology maps to fine-line metadata");
ok((gridRegistry.get("major-minor")?.tags ?? []).includes("technical"), "major/minor technical terminology is searchable");
equal((gridRegistry.get("isometric") as ExpandedGridDefinition).snapping.mode, "isometric", "isometric snap compatibility is declared");
equal((gridRegistry.get("radial") as ExpandedGridDefinition).snapping.mode, "radial", "radial snap compatibility is declared");
equal((gridRegistry.get("radial") as ExpandedGridDefinition).cameraBehavior, "center-locked", "radial metadata is center-origin locked");

const none = gridRegistry.get("none") as ExpandedGridDefinition;
equal(none.status, "active", "grid-off is an active safe state");
equal(none.renders, false, "none preset disables rendering");
equal(none.snapping.compatible, false, "none preset cannot snap");
equal(none.exportBehavior.mode, "excluded", "none preset is excluded from export");
equal(none.supportedParameters.length, 0, "none exposes no visual parameters");

const normalized = normalizeGridSettings({ presetId: "technical", opacity: 9, lineWeight: Number.NaN, spacing: -10, majorInterval: 0, foreground: "#ABC", background: "#fff", snap: true, dynamicZoomDensity: true, exportGrid: false });
equal(normalized.opacity, 1, "opacity clamps");
equal(normalized.lineWeight, 1, "non-finite line weight defaults");
equal(normalized.spacing, 4, "spacing clamps");
equal(normalized.foreground, "#aabbcc", "custom colors normalize");
equal(normalizeGridSettings({ presetId: "missing" }).presetId, "dotted", "unknown preset ids fail to the safe dotted default");
equal(migrateLegacyGridSettings(false).presetId, "none", "legacy hidden grid migrates to none");
equal(migrateLegacyGridSettings(true).presetId, "dotted", "legacy visible grid migrates to dotted");

console.info("grid registry contracts passed");
