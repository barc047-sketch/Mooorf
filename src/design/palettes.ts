export type PaletteGroup =
  | "core"
  | "architecture"
  | "surreal"
  | "monochrome"
  | "warm"
  | "cool";

export interface NucleusPalette {
  id: string;
  group: PaletteGroup;
  label: string;
  use: string;
  shades: readonly string[];
}

export interface OrganismPalette {
  id: string;
  group: PaletteGroup;
  label: string;
  use: string;
  ground: readonly string[];
  body: readonly string[];
  accent: readonly string[];
}

export const NUCLEUS_PALETTES: readonly NucleusPalette[] = [
  {
    id: "black-bone",
    group: "core",
    label: "Black Bone",
    use: "Default monochrome space/category scale.",
    shades: [
      "#0c0c0c",
      "#191919",
      "#2b2b2d",
      "#444448",
      "#626369",
      "#85868c",
      "#a8a9ad",
      "#c9c9c7",
      "#e0ded5",
      "#f4f2e9",
    ],
  },
  {
    id: "architecture-program",
    group: "architecture",
    label: "Architecture Program",
    use: "Future category hue families with restrained saturation.",
    shades: [
      "#2f3133",
      "#596061",
      "#7b7567",
      "#8b6f5a",
      "#8a4f4b",
      "#72556d",
      "#50647b",
      "#486f61",
      "#7d7a4f",
      "#9b8f74",
      "#b7b0a0",
      "#ded9cc",
    ],
  },
  {
    id: "surreal-signal",
    group: "surreal",
    label: "Surreal Signal",
    use: "Experimental accents, never random chrome.",
    shades: [
      "#111113",
      "#252238",
      "#36315f",
      "#423d83",
      "#4b5f8a",
      "#3f7b74",
      "#8c7f4f",
      "#a06462",
      "#b15b7a",
      "#d8c985",
    ],
  },
];

export const ORGANISM_PALETTES: readonly OrganismPalette[] = [
  {
    id: "core-field",
    group: "core",
    label: "Core Field",
    use: "Production default organism body/ground relationship.",
    ground: ["#f5f6ee", "#070707"],
    body: ["#131313", "#ededea"],
    accent: ["#8f1424", "#d9c36b"],
  },
  {
    id: "architecture-field",
    group: "architecture",
    label: "Architecture Field",
    use: "Future category-influenced organism material.",
    ground: ["#f5f6ee", "#0b0b0b"],
    body: ["#2f3133", "#4d4f55"],
    accent: ["#486f61", "#8a4f4b", "#9b8f74"],
  },
  {
    id: "surreal-field",
    group: "surreal",
    label: "Surreal Field",
    use: "Future experimental organism gradient set.",
    ground: ["#08080a", "#15141e"],
    body: ["#18151f", "#2e274d", "#5b3f72"],
    accent: ["#3f7b74", "#b15b7a", "#d8c985"],
  },
];

