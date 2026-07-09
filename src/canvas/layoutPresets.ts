import type { LayoutPresetId, SpaceCell } from "../types";
import { areaToRadius, clamp } from "../lib/geometry";

export interface LayoutPreset {
  id: LayoutPresetId;
  label: string;
  hint: string;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: "organic", label: "Organic", hint: "soft golden-angle scatter" },
  { id: "random", label: "Random", hint: "fresh organic spread" },
  { id: "core", label: "Core", hint: "anchor with close satellites" },
  { id: "colony", label: "Colony", hint: "loose medium tissue" },
  { id: "division", label: "Division", hint: "two bodies pulling apart" },
  { id: "tendril", label: "Tendril", hint: "processional chain" },
  { id: "orbit", label: "Orbit", hint: "support ring around a core" },
  { id: "asymmetry", label: "Asymmetry", hint: "weighted cluster and escapee" },
];

export const VOID_LAYOUT_PRESET = {
  id: "void",
  label: "Void",
  hint: "dedicated subtractive layout later",
  disabled: true,
} as const;

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

interface RankedSpace {
  space: SpaceCell;
  rank: number;
}

interface LayoutContext {
  centerX: number;
  centerY: number;
  spacing: number;
  spread: number;
}

interface LayoutOptions {
  centerX?: number;
  centerY?: number;
}

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

function layoutContext(spaces: SpaceCell[]): LayoutContext {
  const centerX = mean(spaces.map((space) => space.x));
  const centerY = mean(spaces.map((space) => space.y));
  const radii = spaces.map((space) => areaToRadius(space.area));
  const avgRadius = mean(radii);
  const maxRadius = Math.max(avgRadius, ...radii, 40);
  const n = Math.max(spaces.length, 1);
  const spacing = clamp(maxRadius * 1.95, 82, 190);
  const spread = spacing * clamp(Math.sqrt(n) * 0.82, 1.1, 5.4);
  return { centerX, centerY, spacing, spread };
}

function contextWithOptions(spaces: SpaceCell[], options?: LayoutOptions): LayoutContext {
  const ctx = layoutContext(spaces);
  return {
    ...ctx,
    centerX: options?.centerX ?? ctx.centerX,
    centerY: options?.centerY ?? ctx.centerY,
  };
}

function rankSpaces(spaces: SpaceCell[]): RankedSpace[] {
  return spaces
    .map((space, index) => ({ space, index }))
    .sort((a, b) => b.space.area - a.space.area || a.index - b.index)
    .map(({ space }, rank) => ({ space, rank }));
}

function pointFor(presetId: LayoutPresetId, ranked: RankedSpace, count: number, ctx: LayoutContext) {
  const { centerX, centerY, spacing, spread } = ctx;
  const rank = ranked.rank;
  if (count === 1) return { x: centerX, y: centerY };

  if (presetId === "core") {
    if (rank === 0) return { x: centerX, y: centerY };
    const ring = Math.floor((rank - 1) / 8);
    const slot = (rank - 1) % 8;
    const slots = Math.min(8, count - 1 - ring * 8);
    const angle = -Math.PI / 2 + (slot / Math.max(slots, 1)) * TAU + ring * 0.34;
    const radius = spacing * (1.18 + ring * 0.82);
    return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
  }

  if (presetId === "colony") {
    const angle = rank * GOLDEN_ANGLE;
    const radius = spacing * 0.34 + Math.sqrt(rank) * spacing * 0.62;
    const wobble = rank % 3 === 0 ? 0.82 : rank % 3 === 1 ? 1.05 : 0.94;
    return {
      x: centerX + Math.cos(angle) * radius * wobble,
      y: centerY + Math.sin(angle) * radius * 0.78,
    };
  }

  if (presetId === "division") {
    const side = rank % 2 === 0 ? -1 : 1;
    const local = Math.floor(rank / 2);
    const angle = local * GOLDEN_ANGLE + (side < 0 ? 0.2 : Math.PI - 0.2);
    const radius = spacing * (0.24 + Math.sqrt(local) * 0.42);
    return {
      x: centerX + side * spacing * 1.18 + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius * 0.9,
    };
  }

  if (presetId === "tendril") {
    const t = count <= 1 ? 0 : rank / (count - 1);
    const curve = Math.sin(t * Math.PI * 1.25) * spacing * 0.52;
    return {
      x: centerX - spread * 0.72 + t * spread * 1.44,
      y: centerY + curve + (t - 0.5) * spacing * 1.05,
    };
  }

  if (presetId === "orbit") {
    if (rank === 0) return { x: centerX, y: centerY };
    const angle = ((rank - 1) / (count - 1)) * TAU - Math.PI / 2;
    const radius = spacing * clamp(Math.sqrt(count - 1) * 0.48, 1.05, 2.95);
    return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
  }

  if (presetId === "asymmetry") {
    if (rank === 0) return { x: centerX - spacing * 0.72, y: centerY + spacing * 0.12 };
    if (rank === count - 1 && count > 4) {
      return { x: centerX + spread * 0.78, y: centerY - spacing * 1.12 };
    }
    const local = rank - 1;
    const angle = local * GOLDEN_ANGLE + 0.42;
    const radius = spacing * (0.42 + Math.sqrt(local + 1) * 0.44);
    return {
      x: centerX + spacing * 0.42 + Math.cos(angle) * radius * 0.78,
      y: centerY + Math.sin(angle) * radius,
    };
  }

  const angle = rank * GOLDEN_ANGLE;
  const radius = spacing * 0.25 + Math.sqrt(rank) * spacing * 0.74;
  return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
}

function applyRandomLayout(spaces: SpaceCell[], ctx: LayoutContext): SpaceCell[] {
  const ranked = rankSpaces(spaces);
  const seed = Math.floor(Date.now() ^ Math.floor(Math.random() * 0xffffffff));
  let state = seed >>> 0;
  const rnd = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const positioned = new Map<string, { x: number; y: number }>();

  for (const item of ranked) {
    const angle = item.rank * GOLDEN_ANGLE + rnd() * TAU;
    const ring = item.rank === 0 ? 0.18 : Math.sqrt(item.rank) * 0.66;
    const radius = ctx.spacing * (0.24 + ring) * (0.84 + rnd() * 0.34);
    const lateral = (rnd() - 0.5) * ctx.spacing * 0.34;
    positioned.set(item.space.id, {
      x: ctx.centerX + Math.cos(angle) * radius + Math.cos(angle + Math.PI / 2) * lateral,
      y: ctx.centerY + Math.sin(angle) * radius * (0.82 + rnd() * 0.2),
    });
  }

  return spaces.map((space) => {
    const p = positioned.get(space.id);
    return p ? { ...space, x: p.x, y: p.y } : space;
  });
}

export function applyLayoutPreset(
  spaces: SpaceCell[],
  presetId: LayoutPresetId,
  options?: LayoutOptions
): SpaceCell[] {
  if (spaces.length === 0) return spaces;
  const ctx = contextWithOptions(spaces, presetId === "random" ? options : undefined);
  if (presetId === "random") return applyRandomLayout(spaces, ctx);

  const positioned = new Map<string, { x: number; y: number }>();
  const ranked = rankSpaces(spaces);

  for (const item of ranked) {
    positioned.set(item.space.id, pointFor(presetId, item, ranked.length, ctx));
  }

  return spaces.map((space) => {
    const p = positioned.get(space.id);
    return p ? { ...space, x: p.x, y: p.y } : space;
  });
}
