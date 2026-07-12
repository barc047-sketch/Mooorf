import { NUCLEUS_PALETTES } from "../design/palettes";
import { getNucleusColor } from "../design/colorMapping";
import { BUILT_IN_MATERIALS, MATERIAL_COLLECTIONS } from "./builtInMaterials";
import { listMaterialsForTarget, materialRegistry } from "./materialRegistry";
import { resolveLegacyCellMaterial } from "./materialResolver";
import { normalizeMaterialBinding, normalizeParameterValue, validateMaterialDefinition } from "./materialValidation";
import type { MaterialDefinition, MaterialParameterDefinition } from "./types";

const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};
const throws = (fn: () => unknown, includes: string, message: string) => {
  try { fn(); } catch (error) {
    ok(error instanceof Error && error.message.toLowerCase().includes(includes.toLowerCase()), message);
    return;
  }
  throw new Error(`${message}: did not throw`);
};

equal(new Set(BUILT_IN_MATERIALS.map((item) => item.id)).size, BUILT_IN_MATERIALS.length, "material ids are unique");
for (const material of BUILT_IN_MATERIALS) {
  validateMaterialDefinition(material);
  ok(material.compatibleTargets.length > 0, `${material.id} declares targets`);
  ok(material.exportFallback.length > 0, `${material.id} declares export fallback`);
  ok(JSON.stringify(material).length > 0, `${material.id} is serializable`);
  ok(!JSON.stringify(material).includes("function"), `${material.id} stores no functions`);
}
ok(listMaterialsForTarget("space-fill").length > 0, "space fill materials are discoverable");
ok(materialRegistry.get("palette:editorial-aurora") !== null, "Editorial Aurora material is registered");
ok(MATERIAL_COLLECTIONS.some((collection) => collection.sourcePaletteId === "editorial-aurora"), "Editorial Aurora collection is preserved");
equal(MATERIAL_COLLECTIONS.filter((collection) => collection.kind === "nucleus-palette").length, NUCLEUS_PALETTES.length, "every nucleus palette has a collection");

const space = { id: "stable-a", name: "Studio", area: 80, category: "Work", privacy: "shared" as const, color: "", x: 0, y: 0 };
for (const colorSource of ["category", "privacy"] as const) {
  const legacy = getNucleusColor(space, "core", { min: 20, max: 100 }, "editorial-aurora", colorSource);
  const adapted = resolveLegacyCellMaterial(space, { paletteMode: "core", areaRange: { min: 20, max: 100 }, nucleusPaletteId: "editorial-aurora", colorSource });
  equal(adapted.color.fill, legacy.fill, `${colorSource} palette output is unchanged`);
}
const explicit = { ...space, color: "#123456" };
equal(resolveLegacyCellMaterial(explicit, { paletteMode: "core", nucleusPaletteId: "editorial-aurora", colorSource: "privacy" }).color.fill, "#123456", "explicit color remains highest priority");
const voidSpace = { ...space, id: "void-a", kind: "void" as const, color: "" };
equal(resolveLegacyCellMaterial(voidSpace, { paletteMode: "core", nucleusPaletteId: "editorial-aurora", colorSource: "category" }).color.fill, getNucleusColor(voidSpace, "core", undefined, "editorial-aurora", "category").fill, "void semantics are unchanged");

const numberParameter: MaterialParameterDefinition = { id: "density", label: "Density", type: "number", defaultValue: 2, minimum: 0, maximum: 10, step: 1, unit: "px", options: [], targetCompatibility: ["grid"] };
equal(normalizeParameterValue(numberParameter, Number.NaN), 2, "NaN falls back safely");
equal(normalizeParameterValue(numberParameter, Number.POSITIVE_INFINITY), 2, "Infinity falls back safely");
equal(normalizeParameterValue(numberParameter, 14), 10, "numbers clamp to maximum");
throws(() => normalizeMaterialBinding(JSON.parse('{"materialId":"palette:editorial-aurora","parameterOverrides":{"__proto__":{"polluted":true}},"sourceMode":"global","opacity":1,"enabled":true}')), "unsafe", "prototype keys are rejected");
throws(() => normalizeMaterialBinding({ materialId: "palette:editorial-aurora", parameterOverrides: { shaderSource: "void main() {}" }, sourceMode: "global", opacity: 1, enabled: true }), "executable", "project bindings reject arbitrary shader source");

const unsafeTexture: MaterialDefinition = {
  ...BUILT_IN_MATERIALS[0],
  id: "unsafe-texture",
  parameters: [{ id: "texture", label: "Texture", type: "texture-reference", defaultValue: "javascript:alert(1)", options: [], targetCompatibility: ["space-fill"] }],
};
throws(() => validateMaterialDefinition(unsafeTexture), "unsafe", "unsafe texture URLs are rejected");

console.info("material registry contracts passed");
