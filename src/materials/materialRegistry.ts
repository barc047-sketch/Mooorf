import { BUILT_IN_MATERIALS } from "./builtInMaterials";
import type { MaterialCategory, MaterialDefinition, MaterialTarget } from "./types";

const byId = new Map(BUILT_IN_MATERIALS.map((material) => [material.id, material]));

export const materialRegistry = Object.freeze({
  get: (id: string): MaterialDefinition | null => byId.get(id) ?? null,
  list: (): readonly MaterialDefinition[] => BUILT_IN_MATERIALS,
  listByCategory: (category: MaterialCategory): readonly MaterialDefinition[] => BUILT_IN_MATERIALS.filter((item) => item.category === category),
  listByTarget: (target: MaterialTarget): readonly MaterialDefinition[] => BUILT_IN_MATERIALS.filter((item) => item.compatibleTargets.includes(target)),
  search: (query: string): readonly MaterialDefinition[] => {
    const needle = query.trim().toLowerCase();
    return needle ? BUILT_IN_MATERIALS.filter((item) => `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(needle)) : BUILT_IN_MATERIALS;
  },
});

export const listMaterialsForTarget = (target: MaterialTarget) => materialRegistry.listByTarget(target);

/** Bounded M1 Membrane presets. Definitions and swatches remain owned by the
 * audited registry so M4 can consume the same IDs without migration. */
export const MEMBRANE_SOLID_MATERIAL_IDS = [
  "system:black",
  "system:ink",
  "system:mooorf-red",
  "system:charcoal",
] as const;

export const listMembraneSolidMaterials = (): readonly MaterialDefinition[] =>
  MEMBRANE_SOLID_MATERIAL_IDS.map((id) => materialRegistry.get(id)).filter(
    (material): material is MaterialDefinition => material !== null
  );
