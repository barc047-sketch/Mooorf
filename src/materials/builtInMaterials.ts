import { NUCLEUS_PALETTES, ORGANISM_PALETTES } from "../design/palettes";
import type { MaterialCollection, MaterialDefinition } from "./types";

const licence = "ZONUERT built-in";
const attribution = "ZONUERT palette system";

const nucleusMaterials: MaterialDefinition[] = NUCLEUS_PALETTES.map((palette) => ({
  id: `palette:${palette.id}`,
  name: palette.label,
  category: "hue",
  description: palette.use,
  preview: { kind: "gradient", values: [...palette.shades] },
  compatibleTargets: ["space-fill", "core-dot", "space-boundary", "text-background"],
  parameters: [],
  performanceTier: "low",
  rendererSupport: { classic: true, organism: true },
  exportFallback: "preserve",
  source: { type: "palette-adapter", key: palette.id },
  licence,
  attribution,
  builtIn: true,
  version: 1,
  tags: [palette.group, "palette", "nucleus", ...palette.label.toLowerCase().split(/\s+/)],
}));

const organismMaterials: MaterialDefinition[] = ORGANISM_PALETTES.map((palette) => ({
  id: `organism:${palette.id}`,
  name: palette.label,
  category: palette.blend === "solid" ? "solid" : "gradient",
  description: palette.use,
  preview: { kind: palette.blend === "solid" ? "swatch" : "gradient", values: [...palette.preview] },
  compatibleTargets: ["organism", "organism-edge", "canvas"],
  parameters: [],
  performanceTier: palette.blend === "solid" ? "low" : "medium",
  rendererSupport: { classic: false, organism: true },
  exportFallback: "rasterize",
  source: { type: "palette-adapter", key: palette.id },
  licence,
  attribution,
  builtIn: true,
  version: 1,
  tags: [palette.group, palette.blend, "organism", ...palette.label.toLowerCase().split(/\s+/)],
}));

const systemMaterials: MaterialDefinition[] = [
  {
    id: "system:black", name: "Black", category: "solid", description: "Absolute black Membrane Field material.",
    preview: { kind: "swatch", values: ["#000000"] }, compatibleTargets: ["organism"],
    parameters: [], performanceTier: "low", rendererSupport: { classic: true, organism: true }, exportFallback: "preserve",
    source: { type: "system", key: "black" }, licence, attribution, builtIn: true, version: 1, tags: ["black", "solid", "membrane"],
  },
  {
    id: "system:mooorf-red", name: "MOOORF Red", category: "solid", description: "Canonical MOOORF red Membrane Field material.",
    preview: { kind: "swatch", values: ["#c31616"] }, compatibleTargets: ["organism"],
    parameters: [], performanceTier: "low", rendererSupport: { classic: true, organism: true }, exportFallback: "preserve",
    source: { type: "system", key: "mooorf-red" }, licence, attribution, builtIn: true, version: 1, tags: ["red", "brand", "solid", "membrane"],
  },
  {
    id: "system:charcoal", name: "Charcoal", category: "solid", description: "Neutral charcoal Membrane Field material.",
    preview: { kind: "swatch", values: ["#2f2f2f"] }, compatibleTargets: ["organism"],
    parameters: [], performanceTier: "low", rendererSupport: { classic: true, organism: true }, exportFallback: "preserve",
    source: { type: "system", key: "charcoal" }, licence, attribution, builtIn: true, version: 1, tags: ["charcoal", "neutral", "solid", "membrane"],
  },
  {
    id: "system:void", name: "Void", category: "solid", description: "Canonical subtractive void material.",
    preview: { kind: "swatch", values: ["#070707", "#8c877e"] }, compatibleTargets: ["void-fill", "void-edge"],
    parameters: [], performanceTier: "low", rendererSupport: { classic: true, organism: true }, exportFallback: "preserve",
    source: { type: "system", key: "void" }, licence, attribution, builtIn: true, version: 1, tags: ["void", "subtractive"],
  },
  {
    id: "system:canvas", name: "Theme Canvas", category: "solid", description: "Current day or night canvas background.",
    preview: { kind: "swatch", values: ["#f5f6ee", "#070707"] }, compatibleTargets: ["canvas"],
    parameters: [], performanceTier: "low", rendererSupport: { classic: true, organism: true }, exportFallback: "preserve",
    source: { type: "system", key: "theme-canvas" }, licence, attribution, builtIn: true, version: 1, tags: ["canvas", "theme"],
  },
  {
    id: "system:ink", name: "Ink", category: "solid", description: "Neutral technical ink material.",
    preview: { kind: "swatch", values: ["#171719"] }, compatibleTargets: ["organism", "grid", "line", "relationship", "text", "frame"],
    parameters: [], performanceTier: "low", rendererSupport: { classic: true, organism: true }, exportFallback: "preserve",
    source: { type: "system", key: "technical-ink" }, licence, attribution, builtIn: true, version: 1, tags: ["ink", "technical"],
  },
];

export const BUILT_IN_MATERIALS: readonly MaterialDefinition[] = [...nucleusMaterials, ...organismMaterials, ...systemMaterials];

export const MATERIAL_COLLECTIONS: readonly MaterialCollection[] = [
  ...NUCLEUS_PALETTES.map((palette) => ({ id: `collection:nucleus:${palette.id}`, name: palette.label, kind: "nucleus-palette" as const, sourcePaletteId: palette.id, materialIds: [`palette:${palette.id}`], tags: [palette.group, "nucleus"] })),
  ...ORGANISM_PALETTES.map((palette) => ({ id: `collection:organism:${palette.id}`, name: palette.label, kind: "organism-palette" as const, sourcePaletteId: palette.id, materialIds: [`organism:${palette.id}`], tags: [palette.group, "organism"] })),
];
