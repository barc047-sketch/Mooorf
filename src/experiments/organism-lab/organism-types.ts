/* V6E Organism Lab — data model.
   Pure types + defaults. No React, no DOM, nothing here is imported by the
   main canvas/table app. Field units: the shorter viewport axis spans [-1, 1],
   origin centered, y up (matches gl_FragCoord math in the shader). */

/** Owner-approved production Organism/visible Cell budget. */
export const MAX_NUCLEI = 500;

export type OrganismStyleId =
  | "cellular-reverse"
  | "plain-black"
  | "plain-white"
  | "graphite"
  | "wine"
  | "auto";

export type AttachmentMode = "tight" | "soft" | "long" | "extreme";

export type LabTheme = "day" | "night";

export type RGB = [number, number, number];

/** Preset-authored nucleus (field units). */
export interface NucleusSpec {
  x: number;
  y: number;
  r: number;
  /** relative field strength multiplier (default 1) */
  strength?: number;
  /** -1 = subtractive void nucleus — carves the membrane instead of adding to it */
  polarity?: 1 | -1;
  /** 0..1 idle-motion phase seed */
  phase?: number;
}

/** Live simulated nucleus. Every animated quantity keeps target + rendered value. */
export interface Nucleus {
  id: number;
  /** drag/authoring anchor, before offset layout + idle motion */
  homeX: number;
  homeY: number;
  /** post-layout + idle-motion target */
  targetX: number;
  targetY: number;
  /** rendered (exponentially smoothed) */
  x: number;
  y: number;
  baseR: number;
  targetR: number;
  r: number;
  specStrength: number;
  polarity: 1 | -1;
  phase: number;
  /** per-nucleus random phase seeds decorrelating drift/wobble/breathing */
  seeds: [number, number, number, number];
  dragging: boolean;
}

export interface OrganismParams {
  // ORGANISM
  mass: number;
  isoLevel: number;
  /** fine-tunes the attachment base kernel falloff (gooeyness) */
  surfaceTension: number;
  /** smoothstep half-width in field-value units (AA floor applied in shader) */
  edgeSoftness: number;
  /** fine-tunes the attachment base long-range 1/d tail (merge eagerness) */
  connectionBias: number;

  // NUCLEI
  count: number;
  radiusMin: number;
  radiusMax: number;
  nucleusStrength: number;
  sizeVariation: number;

  // ATTACHMENT / OFFSET
  attachment: AttachmentMode;
  /** scales every satellite's distance from the core (1 = authored layout) */
  globalOffset: number;
  offsetX: number;
  offsetY: number;
  /** absolute push outward from the core, after global scaling */
  radialOffset: number;
  /** rotates satellites around the core, degrees */
  angularOffset: number;

  // MOTION
  timeScale: number;
  /** exponential smoothing rate for the target→rendered follow */
  response: number;
  drift: number;
  breathing: number;
  wobble: number;
  phaseVariation: number;

  // STYLE
  style: OrganismStyleId;
  /** inner field band that opens voids (Cellular Reverse); higher = fewer pockets */
  pocketThreshold: number;
  pocketSoftness: number;

  // DEBUG / DISPLAY
  showNuclei: boolean;
  showFieldDebug: boolean;
  showNucleiDebug: boolean;
}

export type NumericParamKey = {
  [K in keyof OrganismParams]: OrganismParams[K] extends number ? K : never;
}[keyof OrganismParams];

export const DEFAULT_PARAMS: OrganismParams = {
  mass: 1,
  isoLevel: 1,
  surfaceTension: 1,
  edgeSoftness: 0.01,
  connectionBias: 0.25,

  count: 6,
  radiusMin: 0.06,
  radiusMax: 0.52,
  nucleusStrength: 1,
  sizeVariation: 0.6,

  attachment: "soft",
  globalOffset: 1,
  offsetX: 0,
  offsetY: 0,
  radialOffset: 0,
  angularOffset: 0,

  timeScale: 1,
  response: 6,
  drift: 0.25,
  breathing: 0.35,
  wobble: 0.16,
  phaseVariation: 0.7,

  style: "cellular-reverse",
  pocketThreshold: 8,
  pocketSoftness: 0.45,

  showNuclei: true,
  showFieldDebug: false,
  showNucleiDebug: false,
};

export interface OrganismPreset {
  id: string;
  label: string;
  hint?: string;
  specs: NucleusSpec[];
  params?: Partial<OrganismParams>;
}

export interface StyleColors {
  body: RGB;
  bg: RGB;
  bodyHex: string;
  bgHex: string;
  /** 0..1 — how much the inner field band carves pockets */
  pocketAmount: number;
}

export function hexToRgb01(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}
