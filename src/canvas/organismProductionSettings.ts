/* V6H.1 — production organism settings resolver.
   Merges Organism Lab DEFAULT_PARAMS with the store-owned OrganismSettings and
   the simplified reach control (settings.mergeDistance). Advanced sliders own
   the detail values; reach stays a bounded trim around them so both controls
   coexist without stomping each other. Defaults reproduce the pre-V6H.1
   production look exactly (mass 1.04, bias 0.368 @ reach 120, softness 0.02,
   pockets 7.8/0.48, motion off). */

import type { LabSettings } from "../state/store";
import type { OrganismSettings } from "../types";
import { clamp } from "../lib/geometry";
import {
  DEFAULT_PARAMS,
  type OrganismParams,
} from "../experiments/organism-lab/organism-types";

export const DEFAULT_ORGANISM_SETTINGS: OrganismSettings = {
  mass: 1.04,
  isoLevel: 1,
  surfaceTension: 1,
  edgeSoftness: 0.02,
  connectionBias: 0.37,

  nucleusStrength: 1,
  radiusMin: 0.018,
  radiusMax: 0.42,
  sizeVariation: 0,

  globalOffset: 1,
  offsetX: 0,
  offsetY: 0,
  radialOffset: 0,
  angularOffset: 0,

  motionEnabled: false,
  idleMotion: true,
  timeScale: 1,
  response: 10,
  drift: 0,
  breathing: 0,
  wobble: 0,
  phaseVariation: 0.7,

  pocketThreshold: 7.8,
  pocketSoftness: 0.48,

  showLabels: true,
  showNuclei: true,
  cameraAwareMorph: true,
  showFieldDebug: false,
  showNucleiDebug: false,
};

export const MOTION_DEFAULTS: Pick<
  OrganismSettings,
  "timeScale" | "response" | "drift" | "breathing" | "wobble" | "phaseVariation"
> = {
  timeScale: DEFAULT_ORGANISM_SETTINGS.timeScale,
  response: DEFAULT_ORGANISM_SETTINGS.response,
  drift: DEFAULT_ORGANISM_SETTINGS.drift,
  breathing: DEFAULT_ORGANISM_SETTINGS.breathing,
  wobble: DEFAULT_ORGANISM_SETTINGS.wobble,
  phaseVariation: DEFAULT_ORGANISM_SETTINGS.phaseVariation,
};

/** Everything the SpaceCell → nucleus adapter needs per frame. */
export interface OrganismAdapterOptions {
  radiusMin: number;
  radiusMax: number;
  sizeVariation: number;
  nucleusStrength: number;
  globalOffset: number;
  offsetX: number;
  offsetY: number;
  radialOffset: number;
  angularOffset: number;
  timeScale: number;
  response: number;
  drift: number;
  breathing: number;
  wobble: number;
  phaseVariation: number;
  cameraAwareMorph: boolean;
}

export interface ResolvedOrganism {
  /** shader/field params — feed effectiveField() + the uniform smoother */
  params: OrganismParams;
  /** per-nucleus mapping options — feed spacesToNuclei() */
  adapter: OrganismAdapterOptions;
  /** true when idle motion demands continuous rendering */
  motionActive: boolean;
}

export function resolveOrganism(settings: LabSettings, reducedMotion = false): ResolvedOrganism {
  const o = settings.organism;
  const fast = settings.performanceQuality === "fast";
  const reach = clamp(settings.mergeDistance / 300, 0, 1);

  const params: OrganismParams = {
    ...DEFAULT_PARAMS,
    style: settings.morphMode,
    attachment: settings.attachMode,
    mass: clamp(o.mass, 0.4, 2.4),
    isoLevel: clamp(o.isoLevel, 0.4, 2.2),
    surfaceTension: clamp(o.surfaceTension, 0.5, 1.7),
    /* reach trim keeps the dock slider meaningful next to the detail sliders;
       neutral reach (120 → 0.4) leaves the advanced values untouched */
    edgeSoftness: clamp(o.edgeSoftness + (reach - 0.4) * 0.02, 0.004, 0.6),
    connectionBias: clamp(o.connectionBias + (reach - 0.4) * 0.62, 0, 1),
    nucleusStrength: clamp(o.nucleusStrength, 0.3, 2),
    pocketThreshold: clamp(o.pocketThreshold, 2, 14),
    pocketSoftness: clamp(o.pocketSoftness, 0.05, 3),
    showNuclei: o.showNuclei,
    showFieldDebug: o.showFieldDebug,
    showNucleiDebug: o.showNucleiDebug,
  };

  const adapter: OrganismAdapterOptions = {
    radiusMin: clamp(Math.min(o.radiusMin, o.radiusMax), 0.008, 0.3),
    radiusMax: clamp(Math.max(o.radiusMin, o.radiusMax), 0.1, 0.75),
    sizeVariation: clamp(o.sizeVariation, 0, 1),
    nucleusStrength: params.nucleusStrength,
    globalOffset: clamp(o.globalOffset, 0.4, 1.8),
    offsetX: clamp(o.offsetX, -0.6, 0.6),
    offsetY: clamp(o.offsetY, -0.6, 0.6),
    radialOffset: clamp(o.radialOffset, -0.3, 0.5),
    angularOffset: clamp(o.angularOffset, -180, 180),
    timeScale: clamp(o.timeScale, 0, 2.5),
    response: clamp(o.response, 1, 18),
    drift: fast || reducedMotion ? 0 : clamp(o.drift, 0, 1),
    breathing: fast || reducedMotion ? 0 : clamp(o.breathing, 0, 1),
    wobble: fast || reducedMotion ? 0 : clamp(o.wobble, 0, 1),
    phaseVariation: clamp(o.phaseVariation, 0, 1),
    cameraAwareMorph: o.cameraAwareMorph ?? true,
  };

  const motionActive =
    o.motionEnabled &&
    o.idleMotion &&
    adapter.timeScale > 0 &&
    (adapter.drift > 0.001 || adapter.breathing > 0.001 || adapter.wobble > 0.001);

  return { params, adapter, motionActive };
}

/* ——— control metadata: the advanced panel renders itself from this ——— */

export type NumericOrgKey = {
  [K in keyof OrganismSettings]: OrganismSettings[K] extends number ? K : never;
}[keyof OrganismSettings];

export interface OrgSliderDef {
  key: NumericOrgKey;
  label: string;
  min: number;
  max: number;
  step: number;
  fmt?: (v: number) => string;
}

export interface OrgControlSection {
  id: string;
  title: string;
  hint?: string;
  sliders: OrgSliderDef[];
}

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);
const deg = (v: number) => `${Math.round(v)}°`;

export const ORG_CONTROL_SECTIONS: OrgControlSection[] = [
  {
    id: "organism",
    title: "Organism",
    hint: "field body",
    sliders: [
      { key: "mass", label: "Mass", min: 0.5, max: 2.2, step: 0.01, fmt: f2 },
      { key: "isoLevel", label: "Iso Level", min: 0.5, max: 2, step: 0.01, fmt: f2 },
      { key: "surfaceTension", label: "Surface Tension", min: 0.6, max: 1.6, step: 0.01, fmt: f2 },
      { key: "edgeSoftness", label: "Edge Softness", min: 0.004, max: 0.3, step: 0.002, fmt: f3 },
      { key: "connectionBias", label: "Connection Bias", min: 0, max: 1, step: 0.01, fmt: f2 },
    ],
  },
  {
    id: "nuclei",
    title: "Nuclei",
    hint: "per-space bodies",
    sliders: [
      { key: "nucleusStrength", label: "Strength", min: 0.4, max: 1.8, step: 0.01, fmt: f2 },
      { key: "radiusMin", label: "Radius Min", min: 0.008, max: 0.15, step: 0.002, fmt: f3 },
      { key: "radiusMax", label: "Radius Max", min: 0.15, max: 0.7, step: 0.005, fmt: f2 },
      { key: "sizeVariation", label: "Size Variation", min: 0, max: 1, step: 0.01, fmt: f2 },
    ],
  },
  {
    id: "offset",
    title: "Attachment & Offset",
    hint: "visual layout only",
    sliders: [
      { key: "globalOffset", label: "Global Offset", min: 0.4, max: 1.8, step: 0.01, fmt: f2 },
      { key: "offsetX", label: "Offset X", min: -0.6, max: 0.6, step: 0.01, fmt: f2 },
      { key: "offsetY", label: "Offset Y", min: -0.6, max: 0.6, step: 0.01, fmt: f2 },
      { key: "radialOffset", label: "Radial Offset", min: -0.3, max: 0.5, step: 0.01, fmt: f2 },
      { key: "angularOffset", label: "Angular Offset", min: -180, max: 180, step: 1, fmt: deg },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    hint: "idle life",
    sliders: [
      { key: "timeScale", label: "Time Scale", min: 0, max: 2.5, step: 0.01, fmt: f2 },
      { key: "response", label: "Response", min: 1, max: 18, step: 0.1, fmt: f2 },
      { key: "drift", label: "Drift", min: 0, max: 1, step: 0.01, fmt: f2 },
      { key: "breathing", label: "Breathing", min: 0, max: 1, step: 0.01, fmt: f2 },
      { key: "wobble", label: "Wobble", min: 0, max: 1, step: 0.01, fmt: f2 },
      { key: "phaseVariation", label: "Phase Variation", min: 0, max: 1, step: 0.01, fmt: f2 },
    ],
  },
  {
    id: "pockets",
    title: "Pockets",
    hint: "cellular voids",
    sliders: [
      { key: "pocketThreshold", label: "Pocket Threshold", min: 2, max: 14, step: 0.05, fmt: f2 },
      { key: "pocketSoftness", label: "Pocket Softness", min: 0.05, max: 2.5, step: 0.01, fmt: f2 },
    ],
  },
];
