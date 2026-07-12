import type { IconCategory, IconDefinition } from "./types";

const builtIn = (id: string, name: string, category: IconCategory, sourceKey: string, tags: string[]): IconDefinition => ({
  id, name, category, sourceType: "lucide", sourceKey, tags, defaultTint: "#171719", defaultBacking: "none",
  licence: "ISC", attribution: "Lucide Contributors", builtIn: true, status: "active",
});

export const BUILT_IN_ICONS: readonly IconDefinition[] = [
  builtIn("icon:door", "Door", "architecture", "DoorOpen", ["entry", "opening"]),
  builtIn("icon:stairs", "Stairs", "architecture", "BetweenVerticalStart", ["level", "circulation"]),
  builtIn("icon:tree", "Tree", "landscape", "TreePine", ["plant", "outdoor"]),
  builtIn("icon:node", "Node", "diagram", "CircleDot", ["graph", "point"]),
  builtIn("icon:north", "North", "annotation", "Navigation", ["direction", "north"]),
  builtIn("icon:route", "Route", "navigation", "Route", ["movement", "path"]),
];

const byId = new Map(BUILT_IN_ICONS.map((item) => [item.id, item]));
export const iconRegistry = Object.freeze({
  get: (id: string) => byId.get(id) ?? null,
  list: () => BUILT_IN_ICONS,
  listByCategory: (category: IconCategory) => BUILT_IN_ICONS.filter((item) => item.category === category),
  search: (query: string) => { const needle = query.trim().toLowerCase(); return needle ? BUILT_IN_ICONS.filter((item) => `${item.name} ${item.tags.join(" ")}`.toLowerCase().includes(needle)) : BUILT_IN_ICONS; },
});
