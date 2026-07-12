import { annotationRegistry } from "../annotations/annotationRegistry";
import type { AnnotationInstance } from "../annotations/types";
import { migrateLegacyGridSettings, normalizeGridSettings } from "../grid/gridValidation";
import { normalizeIconPlacement } from "../icons/iconValidation";
import { normalizeMaterialBinding } from "../materials/materialValidation";
import type { MaterialBinding, MaterialBindings } from "../materials/types";
import type { ResourceSettings } from "./types";

export const RESOURCE_SCHEMA_VERSION = 1 as const;

const binding = (materialId: string, sourceMode: MaterialBinding["sourceMode"] = "global"): MaterialBinding => ({ materialId, parameterOverrides: {}, sourceMode, opacity: 1, enabled: true });

export const defaultMaterialBindings = (nucleusPaletteId = "editorial-aurora", organismPaletteId = "mode"): MaterialBindings => ({
  spaceFill: binding(`palette:${nucleusPaletteId}`, "category"),
  coreDot: binding(`palette:${nucleusPaletteId}`, "category"),
  spaceBoundary: binding(`palette:${nucleusPaletteId}`, "category"),
  organism: binding(organismPaletteId === "mode" ? "organism:core-field" : `organism:${organismPaletteId}`),
  organismEdge: binding(organismPaletteId === "mode" ? "organism:core-field" : `organism:${organismPaletteId}`),
  voidFill: binding("system:void"), voidEdge: binding("system:void"), canvas: binding("system:canvas"), grid: binding("system:ink"),
  line: binding("system:ink"), relationship: binding("system:ink"), text: binding("system:ink"), textBackground: binding("system:canvas"), frame: binding("system:ink"),
});

export const DEFAULT_RESOURCE_SETTINGS: ResourceSettings = {
  schemaVersion: RESOURCE_SCHEMA_VERSION,
  materialBindings: defaultMaterialBindings(),
  grid: migrateLegacyGridSettings(false),
  annotationInstances: [],
  iconPlacements: [],
};

const unsafe = (value: unknown): void => {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") throw new Error(`Unsafe resource key "${key}".`);
    unsafe((value as Record<string, unknown>)[key]);
  }
};

const normalizeAnnotation = (value: unknown): AnnotationInstance | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const definition = annotationRegistry.get(String(record.definitionId));
  if (!definition || typeof record.id !== "string") return null;
  const parameterValues = record.parameterValues && typeof record.parameterValues === "object" && !Array.isArray(record.parameterValues) ? record.parameterValues as AnnotationInstance["parameterValues"] : {};
  return { id: record.id.slice(0, 160), definitionId: definition.id, targetId: typeof record.targetId === "string" ? record.targetId.slice(0, 160) : undefined, parameterValues, enabled: record.enabled !== false };
};

export const normalizeResourceSettings = (
  value: unknown,
  legacy: { showGrid?: boolean; nucleusPaletteId?: string; organismPaletteId?: string } = {}
): ResourceSettings => {
  unsafe(value);
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  if (record && typeof record.schemaVersion === "number" && record.schemaVersion > RESOURCE_SCHEMA_VERSION) throw new Error("Future resource schema versions are not supported.");
  const defaults = defaultMaterialBindings(legacy.nucleusPaletteId, legacy.organismPaletteId);
  const rawBindings = record?.materialBindings && typeof record.materialBindings === "object" && !Array.isArray(record.materialBindings) ? record.materialBindings as Record<string, unknown> : {};
  const materialBindings = Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, rawBindings[key] ? normalizeMaterialBinding(rawBindings[key]) : fallback])) as unknown as MaterialBindings;
  const annotationInstances = Array.isArray(record?.annotationInstances) ? record.annotationInstances.map(normalizeAnnotation).filter((item): item is AnnotationInstance => item !== null).slice(0, 10_000) : [];
  const iconPlacements = Array.isArray(record?.iconPlacements) ? record.iconPlacements.map(normalizeIconPlacement).filter((item) => item.iconId && item.targetSpaceId).slice(0, 10_000) : [];
  return {
    schemaVersion: RESOURCE_SCHEMA_VERSION,
    materialBindings,
    grid: record?.grid ? normalizeGridSettings(record.grid) : migrateLegacyGridSettings(Boolean(legacy.showGrid)),
    annotationInstances,
    iconPlacements,
  };
};

export const cloneResourceSettings = (value: ResourceSettings): ResourceSettings => normalizeResourceSettings(JSON.parse(JSON.stringify(value)));
