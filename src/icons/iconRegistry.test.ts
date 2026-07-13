import { icons as lucideIcons } from "lucide-react";
import { BUILT_IN_ICONS, iconRegistry } from "./iconRegistry";
import type { IconDefinition } from "./types";
import { normalizeIconPlacement, validateIconDefinition } from "./iconValidation";

const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const equal = (actual: unknown, expected: unknown, message: string) => { if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); };
const throws = (fn: () => unknown, includes: string, message: string) => { try { fn(); } catch (error) { ok(error instanceof Error && error.message.toLowerCase().includes(includes.toLowerCase()), message); return; } throw new Error(`${message}: did not throw`); };

type ExpandedIconDefinition = IconDefinition & {
  accessibleLabel: string;
  tooltip: string;
  origin: "lucide" | "mooorf-original" | "user-supplied";
  usage: "drawable-symbol" | "ui-control";
  validationStatus: "approved" | "pending" | "rejected";
  attributionUrl?: string;
  requiresVisibleAttribution: boolean;
  placeableTargets: readonly string[];
};
type ExpandedIconRegistry = typeof iconRegistry & {
  resolveId: (id: string) => string | null;
  listByTarget: (target: "space") => readonly ExpandedIconDefinition[];
};

const definitions = BUILT_IN_ICONS as readonly ExpandedIconDefinition[];
const registry = iconRegistry as ExpandedIconRegistry;

equal(definitions.length, 77, "approved drawable inventory count is exact");
equal(new Set(definitions.map((icon) => icon.id)).size, definitions.length, "icon ids are unique");
equal(new Set(definitions.map((icon) => icon.sourceKey)).size, definitions.length, "approved built-in source references are deduplicated");

const expectedCategories = ["architecture", "landscape", "diagram", "annotation", "wayfinding", "environmental", "accessibility", "service"];
for (const category of expectedCategories) ok(definitions.some((icon) => icon.category === category), `${category} symbols are present`);
const missingLucideSources = definitions.filter((icon) => !lucideIcons[icon.sourceKey as keyof typeof lucideIcons]).map((icon) => `${icon.id}:${icon.sourceKey}`);
equal(missingLucideSources.join(","), "", "all installed Lucide geometry references resolve");

for (const icon of definitions) {
  validateIconDefinition(icon);
  ok(/^icon:[a-z0-9-]+:[a-z0-9-]+$/.test(icon.id), `${icon.id} is a canonical namespaced id`);
  ok(icon.tags.length > 0, `${icon.id} includes search tags`);
  ok(icon.accessibleLabel.length > 0 && icon.tooltip.length > 0, `${icon.id} includes accessible copy`);
  equal(icon.origin, "lucide", `${icon.id} has a verified origin`);
  equal(icon.usage, "drawable-symbol", `${icon.id} is a drawable symbol`);
  equal(icon.validationStatus, "approved", `${icon.id} is approved`);
  equal(icon.placeableTargets.join(","), "space", `${icon.id} is explicitly placeable on Cells`);
  ok(icon.licence.length > 0 && icon.attribution.length > 0 && Boolean(icon.attributionUrl), `${icon.id} includes licence metadata`);
  ok(!/^(data:|blob:|https?:|javascript:)/i.test(icon.sourceKey), `${icon.id} stores no raw or remote asset`);
}

equal(registry.listByTarget("space").length, definitions.length, "drawable symbols are discoverable by Cell target");
equal(registry.resolveId("icon:door"), "icon:architecture:door", "legacy door id resolves canonically");
equal(registry.resolveId("icon:stairs"), "icon:architecture:stairs", "legacy stairs id resolves canonically");
equal(registry.resolveId("icon:tree"), "icon:landscape:tree", "legacy tree id resolves canonically");
equal(registry.resolveId("icon:node"), "icon:diagram:node", "legacy node id resolves canonically");
equal(registry.resolveId("icon:north"), "icon:annotation:north", "legacy north id resolves canonically");
equal(registry.resolveId("icon:route"), "icon:wayfinding:route", "legacy route id resolves canonically");
equal(registry.resolveId("icon:missing"), null, "unknown ids fail safely");
equal(registry.search("wheelchair access")[0]?.id, "icon:accessibility:access", "search uses normalized tags");

const uploaded = validateIconDefinition({
  id: "icon:custom:test", name: "Test", category: "custom", sourceType: "uploaded", sourceKey: "asset:icon-1",
  tags: ["test"], accessibleLabel: "Test symbol", tooltip: "Test symbol", defaultTint: "#171719", defaultBacking: "none",
  origin: "user-supplied", usage: "drawable-symbol", validationStatus: "approved", licence: "User supplied",
  attribution: "Project asset", requiresVisibleAttribution: false, builtIn: false, placeableTargets: ["space"], status: "active",
} as ExpandedIconDefinition);
equal(uploaded.sourceKey, "asset:icon-1", "uploaded icons remain asset references");
throws(() => validateIconDefinition({ ...uploaded, sourceKey: "data:image/png;base64,AAAA" }), "asset", "uploaded raw data is rejected");
throws(() => validateIconDefinition({ ...uploaded, usage: "ui-control", placeableTargets: ["space"] } as ExpandedIconDefinition), "placeable", "UI controls cannot become drawable Cell symbols");

const placement = normalizeIconPlacement({ iconId: "icon:door", targetSpaceId: "a", scale: 99, rotation: 725, opacity: -2, tint: "#ABC", backing: "circle", boundary: true, hideBelowZoom: -1 });
equal(placement.iconId, "icon:architecture:door", "legacy placement ids migrate to canonical ids");
equal(placement.scale, 8, "icon scale clamps");
equal(placement.rotation, 5, "icon rotation normalizes");
equal(placement.opacity, 0, "icon opacity clamps");
equal(normalizeIconPlacement({ iconId: "icon:missing", targetSpaceId: "a" }).iconId, "icon:missing", "unknown placement references remain recoverable");

console.info("icon registry contracts passed");
