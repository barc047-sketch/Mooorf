import type { IconBacking, IconCategory, IconDefinition, IconPlacementSettings, IconSourceType } from "./types";

const SOURCE_TYPES = new Set<IconSourceType>(["lucide", "local-svg", "local-png", "uploaded"]);
const CATEGORIES = new Set<IconCategory>(["architecture", "landscape", "diagram", "annotation", "navigation", "custom"]);
const BACKINGS = new Set<IconBacking>(["none", "circle", "square", "pill"]);
const hex = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const text = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  if (/^#[0-9a-f]{3}$/.test(text)) return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
  return fallback;
};

export const validateIconDefinition = (definition: IconDefinition): IconDefinition => {
  if (!definition.id || !definition.name || !CATEGORIES.has(definition.category) || !SOURCE_TYPES.has(definition.sourceType)) throw new Error("Icon definition is invalid.");
  if (!definition.licence || !definition.attribution) throw new Error("Icon licence metadata is required.");
  if (/^(data:|blob:|https?:|javascript:)/i.test(definition.sourceKey)) throw new Error("Icon source must be a local or registry asset reference.");
  if (definition.sourceType === "uploaded" && !/^asset:[a-z0-9._/-]+$/i.test(definition.sourceKey)) throw new Error("Uploaded icon source must be an asset reference.");
  if ((definition.sourceType === "local-svg" || definition.sourceType === "local-png") && !/^local:[a-z0-9._/-]+$/i.test(definition.sourceKey)) throw new Error("Local icon source must be a local reference.");
  return definition;
};

export const normalizeIconPlacement = (value: unknown): IconPlacementSettings => {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const finite = (input: unknown, fallback: number) => typeof input === "number" && Number.isFinite(input) ? input : fallback;
  const rotation = ((finite(record.rotation, 0) % 360) + 360) % 360;
  return {
    iconId: typeof record.iconId === "string" ? record.iconId.slice(0, 160) : "",
    targetSpaceId: typeof record.targetSpaceId === "string" ? record.targetSpaceId.slice(0, 160) : "",
    scale: Math.min(8, Math.max(0.1, finite(record.scale, 1))),
    rotation,
    opacity: Math.min(1, Math.max(0, finite(record.opacity, 1))),
    tint: hex(record.tint, "#171719"),
    backing: BACKINGS.has(record.backing as IconBacking) ? record.backing as IconBacking : "none",
    boundary: record.boundary === true,
    hideBelowZoom: Math.min(8, Math.max(0, finite(record.hideBelowZoom, 0))),
  };
};
