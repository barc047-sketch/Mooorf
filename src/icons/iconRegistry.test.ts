import { BUILT_IN_ICONS, iconRegistry } from "./iconRegistry";
import { normalizeIconPlacement, validateIconDefinition } from "./iconValidation";

const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const equal = (actual: unknown, expected: unknown, message: string) => { if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); };
const throws = (fn: () => unknown, includes: string, message: string) => { try { fn(); } catch (error) { ok(error instanceof Error && error.message.toLowerCase().includes(includes.toLowerCase()), message); return; } throw new Error(`${message}: did not throw`); };

equal(new Set(BUILT_IN_ICONS.map((icon) => icon.id)).size, BUILT_IN_ICONS.length, "icon ids are unique");
for (const icon of BUILT_IN_ICONS) {
  validateIconDefinition(icon);
  ok(!icon.sourceKey.startsWith("data:"), `${icon.id} has no raw binary/base64 source`);
  ok(icon.licence.length > 0 && icon.attribution.length > 0, `${icon.id} includes licence metadata`);
}
ok(iconRegistry.listByCategory("architecture").length > 0, "architecture icons are discoverable");
const uploaded = validateIconDefinition({ id: "uploaded:test", name: "Test", category: "custom", sourceType: "uploaded", sourceKey: "asset:icon-1", tags: ["test"], defaultTint: "#fff", defaultBacking: "none", licence: "User supplied", attribution: "Project asset", builtIn: false, status: "active" });
equal(uploaded.sourceKey, "asset:icon-1", "uploaded icons remain asset references");
throws(() => validateIconDefinition({ ...uploaded, sourceKey: "data:image/png;base64,AAAA" }), "asset", "uploaded raw data is rejected");
const placement = normalizeIconPlacement({ iconId: "icon:door", targetSpaceId: "a", scale: 99, rotation: 725, opacity: -2, tint: "#ABC", backing: "circle", boundary: true, hideBelowZoom: -1 });
equal(placement.scale, 8, "icon scale clamps");
equal(placement.rotation, 5, "icon rotation normalizes");
equal(placement.opacity, 0, "icon opacity clamps");

console.info("icon registry contracts passed");
