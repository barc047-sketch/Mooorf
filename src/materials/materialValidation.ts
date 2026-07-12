import type { MaterialBinding, MaterialDefinition, MaterialParameterDefinition, MaterialParameterValue, MaterialTarget } from "./types";
import { materialRegistry } from "./materialRegistry";

const TARGETS = new Set<MaterialTarget>(["space-fill", "core-dot", "space-boundary", "organism", "organism-edge", "void-fill", "void-edge", "canvas", "grid", "line", "relationship", "text", "text-background", "frame"]);
const unsafeKey = (key: string) => key === "__proto__" || key === "prototype" || key === "constructor";
const safeReference = (value: string) => /^(asset:|local:|registry:)[a-z0-9._/-]+$/i.test(value);
const canonicalHex = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  if (/^#[0-9a-f]{3}$/.test(text)) return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
  return null;
};

export const normalizeParameterValue = (parameter: MaterialParameterDefinition, value: unknown): MaterialParameterValue => {
  if (parameter.type === "boolean") return typeof value === "boolean" ? value : parameter.defaultValue;
  if (["number", "range", "angle", "percentage"].includes(parameter.type)) {
    if (typeof value !== "number" || !Number.isFinite(value)) return parameter.defaultValue;
    const minimum = parameter.minimum ?? Number.NEGATIVE_INFINITY;
    const maximum = parameter.maximum ?? Number.POSITIVE_INFINITY;
    const clamped = Math.min(maximum, Math.max(minimum, value));
    const step = parameter.step && parameter.step > 0 ? parameter.step : 0;
    return step ? Math.round(clamped / step) * step : clamped;
  }
  if (parameter.type === "colour") return canonicalHex(value) ?? parameter.defaultValue;
  if (parameter.type === "enum") return typeof value === "string" && parameter.options.some((option) => option.value === value) ? value : parameter.defaultValue;
  if (parameter.type === "gradient") {
    return Array.isArray(value) && value.length >= 2 && value.every((stop) => canonicalHex(stop)) ? value.map((stop) => canonicalHex(stop)!) : parameter.defaultValue;
  }
  if (parameter.type === "texture-reference") return typeof value === "string" && safeReference(value) ? value : parameter.defaultValue;
  return parameter.defaultValue;
};

export const validateMaterialDefinition = (definition: MaterialDefinition): MaterialDefinition => {
  if (!definition.id || !definition.name || !definition.description) throw new Error("Material identity is invalid.");
  if (!definition.compatibleTargets.length || definition.compatibleTargets.some((target) => !TARGETS.has(target))) throw new Error("Material compatible targets are invalid.");
  if (!definition.exportFallback) throw new Error("Material export fallback is required.");
  if (!definition.licence || !definition.attribution) throw new Error("Material licence metadata is required.");
  for (const parameter of definition.parameters) {
    if (unsafeKey(parameter.id)) throw new Error("Unsafe material parameter key.");
    if (parameter.type === "texture-reference" && (typeof parameter.defaultValue !== "string" || !safeReference(parameter.defaultValue))) throw new Error("Unsafe texture reference.");
    normalizeParameterValue(parameter, parameter.defaultValue);
  }
  const serialized = JSON.stringify(definition);
  if (!serialized || serialized.includes("javascript:") || serialized.includes("blob:") || serialized.includes("data:")) throw new Error("Unsafe material definition.");
  return definition;
};

export const normalizeMaterialBinding = (value: unknown): MaterialBinding => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Material binding is invalid.");
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) if (unsafeKey(key)) throw new Error("Unsafe material binding key.");
  const overrides = record.parameterOverrides && typeof record.parameterOverrides === "object" && !Array.isArray(record.parameterOverrides) ? record.parameterOverrides as Record<string, unknown> : {};
  for (const key of Object.keys(overrides)) if (unsafeKey(key)) throw new Error("Unsafe material override key.");
  const materialId = typeof record.materialId === "string" ? record.materialId.slice(0, 160) : "system:ink";
  const sourceMode = ["global", "category", "privacy", "object"].includes(String(record.sourceMode)) ? record.sourceMode as MaterialBinding["sourceMode"] : "global";
  const opacity = typeof record.opacity === "number" && Number.isFinite(record.opacity) ? Math.min(1, Math.max(0, record.opacity)) : 1;
  const parameterOverrides: Record<string, MaterialParameterValue> = {};
  const definition = materialRegistry.get(materialId);
  for (const [key, item] of Object.entries(overrides)) {
    if (typeof item === "string" && (/^(javascript:|https?:|blob:|data:)/i.test(item) || /(#version|void\s+main|function\s*\()/i.test(item))) throw new Error("Unsafe executable or external material override.");
    const parameter = definition?.parameters.find((candidate) => candidate.id === key);
    if (parameter) parameterOverrides[key] = normalizeParameterValue(parameter, item);
  }
  return { materialId, parameterOverrides, sourceMode, opacity, enabled: record.enabled !== false };
};
