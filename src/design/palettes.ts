/* V6K palette library — curated premium families for the two swatch systems:
   nucleus ramps (space/category color families) and organism palettes
   (membrane/body + ground). Metadata-first: colorMapping.ts resolves these into
   runtime colors; UI components render them as ramps/chips. No random rainbow —
   luxury neutral bases with controlled accents. */

export type PaletteGroup =
  | "core"
  | "architecture"
  | "surreal"
  | "monochrome"
  | "editorial"
  | "warm"
  | "cool"
  | "atmospheric";

export interface NucleusPalette {
  id: string;
  group: PaletteGroup;
  label: string;
  use: string;
  /** authored dark → light; depth mapping reads from the dark end */
  shades: readonly string[];
}

/** Future organism color blending — structure/naming prep only (V6K).
    The production shader still renders solid body/ground uniforms. */
export type OrganismBlendMode =
  | "solid"
  | "gradient"
  | "category-blend"
  | "privacy-blend"
  | "dual-layer"
  | "membrane-core";

export interface OrganismPaletteChoice {
  id: string;
  group: PaletteGroup;
  label: string;
  use: string;
  blend: OrganismBlendMode;
  /** body/ground per theme — solid palettes feed shader uniforms directly */
  day: { body: string; ground: string };
  night: { body: string; ground: string };
  accent: string;
  /** preview stops for gradient chips (UI only until the blend shader phase) */
  preview: readonly string[];
  /** false = UI-complete placeholder awaiting a later renderer phase */
  ready: boolean;
}

/** Special id meaning "derive from style + palette mode" (pre-V6K behavior). */
export const ORGANISM_PALETTE_MODE_ID = "mode";
/** Special id meaning "category mapping owns nucleus color" (pre-V6K behavior). */
export const NUCLEUS_PALETTE_AUTO_ID = "auto";

export const NUCLEUS_PALETTES: readonly NucleusPalette[] = [
  {
    id: "editorial-aurora",
    group: "editorial",
    label: "Editorial Aurora",
    use: "Soft lavender, blush, peach, sand, and restrained gold categorical field.",
    shades: ["#E0D0F3", "#DEC1EF", "#CBAFD4", "#F5DECD", "#F3CFB6", "#E1BC92", "#EFC981", "#D3B7C1", "#342D2B"],
  },
  {
    id: "black-bone",
    group: "core",
    label: "Black Bone",
    use: "Default monochrome identity scale.",
    shades: ["#0c0c0c", "#191919", "#2b2b2d", "#444448", "#626369", "#85868c", "#a8a9ad", "#c9c9c7", "#e0ded5", "#f4f2e9"],
  },
  {
    id: "graphite-fog",
    group: "monochrome",
    label: "Graphite Fog",
    use: "Quiet technical grey family.",
    shades: ["#101113", "#1c1e21", "#2b2e32", "#3d4045", "#52555b", "#6b6e74", "#87898e", "#a5a6a9", "#c4c4c4", "#e2e1dd"],
  },
  {
    id: "architecture-warm",
    group: "warm",
    label: "Architecture Warm",
    use: "Terracotta, ochre, umber program tones.",
    shades: ["#33201a", "#4d2c1f", "#6b3d27", "#8a5233", "#a56a42", "#b98356", "#c99d72", "#d6b592", "#e3ccb2", "#efe2d2"],
  },
  {
    id: "architecture-cool",
    group: "cool",
    label: "Architecture Cool",
    use: "Slate, steel, and sea-grey program tones.",
    shades: ["#161d24", "#22303a", "#31434f", "#425663", "#556a76", "#6b7f8a", "#84959e", "#9fadb4", "#bcc6ca", "#dbe0e1"],
  },
  {
    id: "sage-stone",
    group: "architecture",
    label: "Sage & Stone",
    use: "Landscape and outdoor program family.",
    shades: ["#1a211b", "#28352b", "#39493c", "#4c5e4e", "#617362", "#788877", "#919d8e", "#acb5a7", "#c9cfc2", "#e5e8df"],
  },
  {
    id: "oxblood-editorial",
    group: "editorial",
    label: "Oxblood Editorial",
    use: "Graph-noir identity reds, print-like contrast.",
    shades: ["#1d0709", "#350c11", "#4f1119", "#691823", "#832230", "#9c3341", "#b25058", "#c67674", "#d9a099", "#ecccc4"],
  },
  {
    id: "dusk-violet",
    group: "surreal",
    label: "Dusk Violet",
    use: "Dark editorial mood, restrained violet greys.",
    shades: ["#131019", "#201a2b", "#2f273f", "#3f3453", "#514567", "#655a7a", "#7c728e", "#968ea3", "#b3adbc", "#d4d0d8"],
  },
  {
    id: "surreal-soft",
    group: "surreal",
    label: "Surreal Soft",
    use: "Low-saturation spectral accents, never neon.",
    shades: ["#171420", "#262138", "#37304f", "#474063", "#565873", "#5d7476", "#7d7f63", "#a3796b", "#c39a8a", "#dfc9b8"],
  },
  {
    id: "medical-clean",
    group: "cool",
    label: "Medical Clean",
    use: "Analytical, near-white clinical scale.",
    shades: ["#20262a", "#333d42", "#48555b", "#5e6d73", "#77868b", "#91a0a3", "#abb8b9", "#c5cfce", "#dde4e1", "#f1f5f1"],
  },
  {
    id: "dark-premium",
    group: "editorial",
    label: "Dark Premium",
    use: "Deep charcoal with warm metal lift.",
    shades: ["#0a0a0b", "#151416", "#211f22", "#2f2c2e", "#403b3a", "#565049", "#6f675c", "#8d8272", "#b0a48e", "#d5cab2"],
  },
  {
    id: "atmospheric",
    group: "atmospheric",
    label: "Atmospheric",
    use: "Hazy horizon blend — ink to warm light.",
    shades: ["#101318", "#1c2230", "#2b3247", "#3e435c", "#55536e", "#6f647a", "#8c7883", "#ab9089", "#c9ac93", "#e5cfa8"],
  },
  {
    id: "clay-porcelain",
    group: "warm",
    label: "Clay & Porcelain",
    use: "Warm neutral craft family.",
    shades: ["#241b16", "#3a2c23", "#514034", "#685446", "#7f695a", "#968070", "#ad9888", "#c4b1a1", "#dacbbc", "#efe4d8"],
  },
];

export const ORGANISM_PALETTES: readonly OrganismPaletteChoice[] = [
  {
    id: "core-field",
    group: "core",
    label: "Core Field",
    use: "Black organism on cream, bone on near-black.",
    blend: "solid",
    day: { body: "#131313", ground: "#f5f6ee" },
    night: { body: "#ededea", ground: "#070707" },
    accent: "#8f1424",
    preview: ["#131313", "#f5f6ee"],
    ready: true,
  },
  {
    id: "ink",
    group: "monochrome",
    label: "Ink",
    use: "Solid near-black body in both themes.",
    blend: "solid",
    day: { body: "#0c0c0c", ground: "#f4f4ee" },
    night: { body: "#0c0c0c", ground: "#e8e6dc" },
    accent: "#c31616",
    preview: ["#0c0c0c", "#2a2a2a"],
    ready: true,
  },
  {
    id: "porcelain",
    group: "monochrome",
    label: "Porcelain",
    use: "Light body on deep ground — reversed review mode.",
    blend: "solid",
    day: { body: "#f4f2e9", ground: "#101010" },
    night: { body: "#f4f2e9", ground: "#0b0b0b" },
    accent: "#8f1424",
    preview: ["#f4f2e9", "#101010"],
    ready: true,
  },
  {
    id: "graphite",
    group: "monochrome",
    label: "Graphite",
    use: "Quiet professional grey body.",
    blend: "solid",
    day: { body: "#2f2f31", ground: "#f5f6ee" },
    night: { body: "#47474b", ground: "#0a0a0b" },
    accent: "#9a9a94",
    preview: ["#2f2f31", "#47474b"],
    ready: true,
  },
  {
    id: "wine",
    group: "editorial",
    label: "Wine",
    use: "Graph-noir deep red identity body.",
    blend: "solid",
    day: { body: "#421015", ground: "#f5f4ec" },
    night: { body: "#5a1119", ground: "#080607" },
    accent: "#c31616",
    preview: ["#421015", "#5a1119"],
    ready: true,
  },
  {
    id: "sage",
    group: "architecture",
    label: "Sage",
    use: "Architectural landscape body.",
    blend: "solid",
    day: { body: "#303432", ground: "#f3f4ec" },
    night: { body: "#4c5550", ground: "#070808" },
    accent: "#5f8568",
    preview: ["#303432", "#4c5550", "#5f8568"],
    ready: true,
  },
  {
    id: "slate-blue",
    group: "cool",
    label: "Slate Blue",
    use: "Technical blueprint-adjacent body.",
    blend: "solid",
    day: { body: "#232b34", ground: "#f2f3ee" },
    night: { body: "#31435a", ground: "#06070a" },
    accent: "#6b8398",
    preview: ["#232b34", "#31435a"],
    ready: true,
  },
  {
    id: "dusk-violet-field",
    group: "surreal",
    label: "Dusk Violet",
    use: "Restrained experimental violet body.",
    blend: "solid",
    day: { body: "#2b243d", ground: "#f4f1ec" },
    night: { body: "#30264a", ground: "#08080a" },
    accent: "#b15b7a",
    preview: ["#2b243d", "#30264a", "#5b3f72"],
    ready: true,
  },
  {
    id: "umber",
    group: "warm",
    label: "Umber",
    use: "Burnt clay / warm architectural body.",
    blend: "solid",
    day: { body: "#3a2a20", ground: "#f5f2ea" },
    night: { body: "#54382a", ground: "#080706" },
    accent: "#a56a42",
    preview: ["#3a2a20", "#54382a", "#a56a42"],
    ready: true,
  },
  {
    id: "atmospheric-blend",
    group: "atmospheric",
    label: "Atmospheric Blend",
    use: "Gradient membrane — hazy field blend.",
    blend: "gradient",
    day: { body: "#1c2230", ground: "#f3f2ea" },
    night: { body: "#2b3247", ground: "#070709" },
    accent: "#e5cfa8",
    preview: ["#101318", "#3e435c", "#8c7883", "#e5cfa8"],
    ready: true,
  },
  {
    id: "category-blend",
    group: "architecture",
    label: "Category Blend",
    use: "Program-colored organism influence.",
    blend: "category-blend",
    day: { body: "#2f3133", ground: "#f5f6ee" },
    night: { body: "#4d4f55", ground: "#0b0b0b" },
    accent: "#8a4f4b",
    preview: ["#aa5544", "#a78643", "#655a78", "#5f8568", "#647086"],
    ready: true,
  },
  {
    id: "dual-layer",
    group: "surreal",
    label: "Dual Layer",
    use: "Staged membrane/core color blend.",
    blend: "dual-layer",
    day: { body: "#131313", ground: "#f5f6ee" },
    night: { body: "#ededea", ground: "#070707" },
    accent: "#8f1424",
    preview: ["#131313", "#8f1424", "#f4f2e9"],
    ready: true,
  },
];

export const getNucleusPalette = (id: string): NucleusPalette | null =>
  NUCLEUS_PALETTES.find((p) => p.id === id) ?? null;

export const getOrganismPaletteChoice = (id: string): OrganismPaletteChoice | null =>
  ORGANISM_PALETTES.find((p) => p.id === id) ?? null;
