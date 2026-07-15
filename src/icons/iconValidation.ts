import { iconRegistry } from "./iconRegistry";
import type { IconBacking, IconCategory, IconDefinition, IconOrigin, IconPlacementPreset, IconPlacementSettings, IconSourceType, IconTarget, IconTintMode, IconUsage, IconValidationStatus } from "./types";

const SOURCE_TYPES = new Set<IconSourceType>(["lucide", "local-svg", "local-png", "uploaded"]);
const CATEGORIES = new Set<IconCategory>(["architecture", "landscape", "diagram", "annotation", "wayfinding", "environmental", "accessibility", "service", "navigation", "custom", "shell", "tools", "insert", "utility"]);
const BACKINGS = new Set<IconBacking>(["none", "circle", "square", "pill"]);
const PLACEMENTS = new Set<IconPlacementPreset>(["centre", "above", "below", "top-left", "top-right"]);
const ORIGINS = new Set<IconOrigin>(["lucide", "mooorf-original", "user-supplied"]);
const USAGES = new Set<IconUsage>(["drawable-symbol", "ui-control"]);
const VALIDATION_STATUSES = new Set<IconValidationStatus>(["approved", "pending", "rejected"]);
const TARGETS = new Set<IconTarget>(["space", "void"]);
const TINT_MODES = new Set<IconTintMode>(["auto", "custom"]);
const hex = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const text = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  if (/^#[0-9a-f]{3}$/.test(text)) return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
  return fallback;
};

export const validateIconDefinition = (definition: IconDefinition): IconDefinition => {
  if (!/^icon:[a-z0-9-]+:[a-z0-9-]+$/.test(definition.id) || !definition.name || !CATEGORIES.has(definition.category) || !SOURCE_TYPES.has(definition.sourceType)) throw new Error("Icon definition is invalid.");
  if (!definition.tags.length || definition.tags.some((tag) => !tag.trim()) || !definition.accessibleLabel || !definition.tooltip) throw new Error("Icon search and accessible metadata are required.");
  if (!ORIGINS.has(definition.origin) || !USAGES.has(definition.usage) || !VALIDATION_STATUSES.has(definition.validationStatus)) throw new Error("Icon source or validation metadata is invalid.");
  if (!definition.licence || !definition.attribution) throw new Error("Icon licence metadata is required.");
  if (definition.attributionUrl && !/^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(definition.attributionUrl)) throw new Error("Icon attribution URL is invalid.");
  if (typeof definition.requiresVisibleAttribution !== "boolean" || !BACKINGS.has(definition.defaultBacking) || hex(definition.defaultTint, "") !== definition.defaultTint.toLowerCase()) throw new Error("Icon appearance metadata is invalid.");
  if (!Array.isArray(definition.placeableTargets) || definition.placeableTargets.some((target) => !TARGETS.has(target))) throw new Error("Icon placeable targets are invalid.");
  if (definition.usage === "drawable-symbol" && !definition.placeableTargets.length) throw new Error("Drawable icons require a placeable target.");
  if (definition.usage === "ui-control" && definition.placeableTargets.length) throw new Error("UI control icons cannot be placeable Cell symbols.");
  if (definition.status === "active" && definition.validationStatus !== "approved") throw new Error("Active icons must be approved.");
  if (/^(data:|blob:|https?:|javascript:)/i.test(definition.sourceKey)) throw new Error("Icon source must be a local or registry asset reference.");
  if (definition.sourceType === "lucide" && (!/^[A-Z][A-Za-z0-9]+$/.test(definition.sourceKey) || definition.origin !== "lucide")) throw new Error("Lucide icon source metadata is invalid.");
  if (definition.sourceType === "uploaded" && !/^asset:[a-z0-9._/-]+$/i.test(definition.sourceKey)) throw new Error("Uploaded icon source must be an asset reference.");
  if ((definition.sourceType === "local-svg" || definition.sourceType === "local-png") && !/^local:[a-z0-9._/-]+$/i.test(definition.sourceKey)) throw new Error("Local icon source must be a local reference.");
  return definition;
};

export const normalizeIconPlacement = (value: unknown): IconPlacementSettings => {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const finite = (input: unknown, fallback: number) => typeof input === "number" && Number.isFinite(input) ? input : fallback;
  const rotation = ((finite(record.rotation, 0) % 360) + 360) % 360;
  const rawIconId = typeof record.iconId === "string" ? record.iconId.slice(0, 160) : "";
  return {
    iconId: iconRegistry.resolveId(rawIconId) ?? rawIconId,
    targetSpaceId: typeof record.targetSpaceId === "string" ? record.targetSpaceId.slice(0, 160) : "",
    placement: PLACEMENTS.has(record.placement as IconPlacementPreset) ? record.placement as IconPlacementPreset : "centre",
    offsetX: Math.min(128, Math.max(-128, finite(record.offsetX, 0))),
    offsetY: Math.min(128, Math.max(-128, finite(record.offsetY, 0))),
    scale: Math.min(8, Math.max(0.1, finite(record.scale, 1))),
    rotation,
    opacity: Math.min(1, Math.max(0, finite(record.opacity, 1))),
    // Schema 1/2 placements authored a visible tint. Treating an absent mode
    // as custom is the deterministic no-visual-change migration.
    tintMode: TINT_MODES.has(record.tintMode as IconTintMode) ? record.tintMode as IconTintMode : "custom",
    tint: hex(record.tint, "#171719"),
    backing: BACKINGS.has(record.backing as IconBacking) ? record.backing as IconBacking : "none",
    backingSize: Math.min(160, Math.max(8, finite(record.backingSize, 32))),
    backingOffsetX: Math.min(128, Math.max(-128, finite(record.backingOffsetX, 0))),
    backingOffsetY: Math.min(128, Math.max(-128, finite(record.backingOffsetY, 0))),
    backingOpacity: Math.min(1, Math.max(0, finite(record.backingOpacity, 1))),
    backingOutline: typeof record.backingOutline === "boolean" ? record.backingOutline : record.boundary === true,
    backingOutlineWidth: Math.min(16, Math.max(0, finite(record.backingOutlineWidth, record.boundary === true ? 1 : 0))),
    boundary: record.boundary === true,
    hideBelowZoom: Math.min(8, Math.max(0, finite(record.hideBelowZoom, 0))),
  };
};
