import type { PaletteMode, Privacy, SpaceCell, Theme } from "../types";
import {
  getNucleusPalette,
  getOrganismPaletteChoice,
  NUCLEUS_PALETTE_AUTO_ID,
  ORGANISM_PALETTE_MODE_ID,
} from "./palettes";

export interface AreaRange {
  min: number;
  max: number;
}

export interface CategoryToken {
  id: string;
  label: string;
  aliases: readonly string[];
  soft: string;
  base: string;
  deep: string;
  surreal: string;
}

export interface NucleusColor {
  fill: string;
  ring: string;
  muted: string;
  text: string;
  token: CategoryToken;
  areaDepth: number;
}

export interface OrganismPaletteResult {
  bodyHex: string;
  groundHex: string;
  accentHex: string;
  body: [number, number, number];
  ground: [number, number, number];
}

const NEUTRAL = "#777a79";
const GRAPHITE = "#171719";
const BONE = "#f5f2e8";
const NIGHT = "#070707";
const WINE = "#8f1424";

export const CATEGORY_TOKENS: readonly CategoryToken[] = [
  {
    id: "public",
    label: "Public",
    aliases: ["public", "lobby", "gallery", "auditorium", "cafe", "café"],
    soft: "#d9a18f",
    base: "#aa5544",
    deep: "#662329",
    surreal: "#db6158",
  },
  {
    id: "shared",
    label: "Shared",
    aliases: ["shared", "semi public", "semi-public", "semi_public", "community"],
    soft: "#d7c18a",
    base: "#a78643",
    deep: "#6b5225",
    surreal: "#d8a738",
  },
  {
    id: "private",
    label: "Private",
    aliases: ["private", "quiet", "archive", "residential"],
    soft: "#aaa3b7",
    base: "#655a78",
    deep: "#2d2536",
    surreal: "#7456a4",
  },
  {
    id: "service",
    label: "Service",
    aliases: ["service", "support", "back of house", "boh"],
    soft: "#aab5bd",
    base: "#60717d",
    deep: "#28343c",
    surreal: "#4d7b9d",
  },
  {
    id: "utility",
    label: "Utility",
    aliases: ["utility", "plant", "mechanical", "storage"],
    soft: "#b1b4b2",
    base: "#777c7b",
    deep: "#373a3b",
    surreal: "#697887",
  },
  {
    id: "circulation",
    label: "Circulation",
    aliases: ["circulation", "corridor", "stair", "lift", "elevator", "path"],
    soft: "#d7bf79",
    base: "#a78029",
    deep: "#604716",
    surreal: "#d89227",
  },
  {
    id: "outdoor",
    label: "Outdoor",
    aliases: ["outdoor", "landscape", "courtyard", "garden", "terrace"],
    soft: "#a8c3ad",
    base: "#5f8568",
    deep: "#2e4f3a",
    surreal: "#39a16d",
  },
  {
    id: "retail",
    label: "Retail",
    aliases: ["retail", "shop", "commercial", "market"],
    soft: "#d99d91",
    base: "#b76559",
    deep: "#743136",
    surreal: "#dc5c77",
  },
  {
    id: "admin",
    label: "Admin",
    aliases: ["admin", "office", "work", "studio", "workshop"],
    soft: "#a8b0bc",
    base: "#647086",
    deep: "#2f3748",
    surreal: "#496e9b",
  },
  {
    id: "uncategorized",
    label: "Uncategorized",
    aliases: ["uncategorized", "unknown", "other", ""],
    soft: "#c3c1b9",
    base: NEUTRAL,
    deep: "#3d3e40",
    surreal: "#77738b",
  },
];

const normalizeCategory = (category: string) =>
  category
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ");

const CATEGORY_LOOKUP = new Map<string, CategoryToken>();
for (const token of CATEGORY_TOKENS) {
  CATEGORY_LOOKUP.set(token.id, token);
  for (const alias of token.aliases) CATEGORY_LOOKUP.set(normalizeCategory(alias), token);
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const hexToRgb = (hex: string): [number, number, number] => {
  const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : NEUTRAL.slice(1);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");

export const mixHex = (a: string, b: string, t: number): string => {
  const m = clamp01(t);
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return `#${toHex(ar + (br - ar) * m)}${toHex(ag + (bg - ag) * m)}${toHex(ab + (bb - ab) * m)}`;
};

export const hexToRgb01 = (hex: string): [number, number, number] => {
  const [r, g, b] = hexToRgb(hex);
  return [r / 255, g / 255, b / 255];
};

const luminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function getCategoryToken(category: string): CategoryToken {
  return CATEGORY_LOOKUP.get(normalizeCategory(category)) ?? CATEGORY_LOOKUP.get("uncategorized")!;
}

export function getAreaRange(spaces: readonly Pick<SpaceCell, "area">[]): AreaRange {
  if (spaces.length === 0) return { min: 1, max: 1 };
  let min = Infinity;
  let max = -Infinity;
  for (const space of spaces) {
    if (!Number.isFinite(space.area)) continue;
    min = Math.min(min, space.area);
    max = Math.max(max, space.area);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 1, max: 1 };
  return { min, max };
}

const privacyDepth: Record<Privacy, number> = {
  public: 0.08,
  shared: 0.28,
  private: 0.52,
};

function areaDepth(area: number, range?: AreaRange): number {
  if (!range || range.max <= range.min) return 0.38;
  return clamp01((area - range.min) / (range.max - range.min));
}

/** Sample a curated ramp (authored dark → light) at a 0..1 depth. */
const rampShadeAt = (shades: readonly string[], depth: number): string => {
  const pos = clamp01(1 - depth) * (shades.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, shades.length - 1);
  return mixHex(shades[lo], shades[hi], pos - lo);
};

export function getCategoryColor(
  category: string,
  privacy: Privacy,
  area: number,
  paletteMode: PaletteMode,
  range?: AreaRange,
  nucleusPaletteId?: string
): NucleusColor {
  const token = getCategoryToken(category);
  const areaT = areaDepth(area, range);
  const depth = clamp01(privacyDepth[privacy] + areaT * 0.44);
  let fill = mixHex(token.soft, token.deep, depth);

  if (paletteMode === "core") {
    const neutral = mixHex("#d8d5ca", GRAPHITE, depth * 0.86);
    fill = mixHex(fill, neutral, 0.52);
  } else if (paletteMode === "surreal") {
    fill = mixHex(mixHex(fill, token.surreal, 0.42 + areaT * 0.14), "#1d1a25", privacy === "private" ? 0.22 : 0.08);
  } else if (paletteMode === "auto") {
    fill = mixHex(fill, privacy === "private" ? GRAPHITE : "#e4ded0", privacy === "private" ? 0.18 : 0.08);
  }

  /* V6K — a concrete nucleus palette pulls every space toward one curated
     family; category still separates hue, the ramp unifies the mood */
  if (nucleusPaletteId && nucleusPaletteId !== NUCLEUS_PALETTE_AUTO_ID) {
    const ramp = getNucleusPalette(nucleusPaletteId);
    if (ramp) fill = mixHex(fill, rampShadeAt(ramp.shades, depth), 0.58);
  }

  const ring = mixHex(fill, paletteMode === "surreal" ? "#d8c985" : WINE, paletteMode === "core" ? 0.2 : 0.28);
  const muted = mixHex(fill, luminance(fill) > 0.35 ? "#4f4f4d" : "#d8d3c2", 0.46);
  const text = luminance(fill) > 0.36 ? "#171719" : "#f4f2e9";

  return { fill, ring, muted, text, token, areaDepth: areaT };
}

export function getNucleusColor(
  space: Pick<SpaceCell, "category" | "privacy" | "area">,
  paletteMode: PaletteMode,
  range?: AreaRange,
  nucleusPaletteId?: string
): NucleusColor {
  return getCategoryColor(space.category, space.privacy, space.area, paletteMode, range, nucleusPaletteId);
}

export function getOrganismPalette(
  paletteMode: PaletteMode,
  theme: Theme,
  base?: { bodyHex: string; bgHex: string },
  organismPaletteId?: string
): OrganismPaletteResult {
  const night = theme === "night";

  /* V6K — a concrete organism palette overrides the mode-derived colors.
     Only "ready" (solid) palettes resolve; gradient placeholders fall through. */
  if (organismPaletteId && organismPaletteId !== ORGANISM_PALETTE_MODE_ID) {
    const choice = getOrganismPaletteChoice(organismPaletteId);
    if (choice?.ready) {
      const c = night ? choice.night : choice.day;
      return {
        bodyHex: c.body,
        groundHex: c.ground,
        accentHex: choice.accent,
        body: hexToRgb01(c.body),
        ground: hexToRgb01(c.ground),
      };
    }
  }

  const fallback = {
    bodyHex: night ? BONE : GRAPHITE,
    groundHex: night ? NIGHT : "#f5f6ee",
    accentHex: WINE,
  };
  const core = {
    bodyHex: base?.bodyHex ?? fallback.bodyHex,
    groundHex: base?.bgHex ?? fallback.groundHex,
    accentHex: WINE,
  };
  const mapped =
    paletteMode === "architecture"
      ? {
          bodyHex: night ? "#4c5550" : "#303432",
          groundHex: night ? NIGHT : "#f5f6ee",
          accentHex: "#5f8568",
        }
      : paletteMode === "surreal"
        ? {
            bodyHex: night ? "#30264a" : "#2b243d",
            groundHex: night ? "#08080a" : "#f4f1ec",
            accentHex: "#b15b7a",
          }
        : paletteMode === "auto"
          ? fallback
          : core;

  return {
    ...mapped,
    body: hexToRgb01(mapped.bodyHex),
    ground: hexToRgb01(mapped.groundHex),
  };
}
