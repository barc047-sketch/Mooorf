/* V6H.1 — production organism settings resolver.
   Merges Organism Lab DEFAULT_PARAMS with the store-owned OrganismSettings and
   the simplified reach control (settings.mergeDistance). Advanced sliders own
   the detail values; reach stays a bounded trim around them so both controls
   coexist without stomping each other. Defaults reproduce the pre-V6H.1
   production look exactly (mass 1.04, bias 0.368 @ reach 120, softness 0.02,
   pockets 7.8/0.48, motion off). */

import type { LabSettings } from "../state/store";
import type { CameraShakeMode, OrganismLowZoomDetail, OrganismSettings } from "../types";
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
  preserveMorphology: true,
  lowZoomDetail: "full",
  minimumMorphologyDetail: 0.6,
  edgeStability: 0.5,
  /* Legacy projects may carry this field. It is intentionally inert: camera
     zoom must never change the field geometry that defines the membrane. */
  cameraAwareMorph: false,
  cameraShakeMode: "off",
  cameraShakeIntensity: 1,
  cameraShakeFrequency: 10,
  cameraShakeDamping: 10,
  cameraShakeDragInfluence: 0.5,
  cameraShakeSettleDuration: 0.3,
  showFieldDebug: false,
  showNucleiDebug: false,
};

const finiteOr = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const booleanOr = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const lowZoomDetailOr = (value: unknown): OrganismLowZoomDetail =>
  value === "balanced" || value === "simplified" || value === "full"
    ? value
    : DEFAULT_ORGANISM_SETTINGS.lowZoomDetail;

const cameraShakeModeOr = (value: unknown): CameraShakeMode =>
  value === "soft" || value === "responsive" || value === "custom" || value === "off"
    ? value
    : DEFAULT_ORGANISM_SETTINGS.cameraShakeMode;

/**
 * Canonical persisted Organism settings migration. It accepts partial legacy
 * snapshots, drops unknown fields, clamps authored numbers, and deliberately
 * normalizes the retired camera-aware field to false. Keeping this at the
 * production boundary makes imports, saved views, and UI edits agree.
 */
export function normalizeOrganismSettings(value: unknown): OrganismSettings {
  const input = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
  const d = DEFAULT_ORGANISM_SETTINGS;
  const authoredRadiusMin = clamp(finiteOr(input.radiusMin, d.radiusMin), 0.008, 0.3);
  const authoredRadiusMax = clamp(finiteOr(input.radiusMax, d.radiusMax), 0.1, 0.75);
  return {
    mass: clamp(finiteOr(input.mass, d.mass), 0.4, 2.4),
    isoLevel: clamp(finiteOr(input.isoLevel, d.isoLevel), 0.4, 2.2),
    surfaceTension: clamp(finiteOr(input.surfaceTension, d.surfaceTension), 0.5, 1.7),
    edgeSoftness: clamp(finiteOr(input.edgeSoftness, d.edgeSoftness), 0.004, 0.6),
    connectionBias: clamp(finiteOr(input.connectionBias, d.connectionBias), 0, 1),

    nucleusStrength: clamp(finiteOr(input.nucleusStrength, d.nucleusStrength), 0.3, 2),
    radiusMin: Math.min(authoredRadiusMin, authoredRadiusMax),
    radiusMax: Math.max(authoredRadiusMin, authoredRadiusMax),
    sizeVariation: clamp(finiteOr(input.sizeVariation, d.sizeVariation), 0, 1),

    globalOffset: clamp(finiteOr(input.globalOffset, d.globalOffset), 0.4, 1.8),
    offsetX: clamp(finiteOr(input.offsetX, d.offsetX), -0.6, 0.6),
    offsetY: clamp(finiteOr(input.offsetY, d.offsetY), -0.6, 0.6),
    radialOffset: clamp(finiteOr(input.radialOffset, d.radialOffset), -0.3, 0.5),
    angularOffset: clamp(finiteOr(input.angularOffset, d.angularOffset), -180, 180),

    motionEnabled: booleanOr(input.motionEnabled, d.motionEnabled),
    idleMotion: booleanOr(input.idleMotion, d.idleMotion),
    timeScale: clamp(finiteOr(input.timeScale, d.timeScale), 0, 2.5),
    response: clamp(finiteOr(input.response, d.response), 1, 18),
    drift: clamp(finiteOr(input.drift, d.drift), 0, 1),
    breathing: clamp(finiteOr(input.breathing, d.breathing), 0, 1),
    wobble: clamp(finiteOr(input.wobble, d.wobble), 0, 1),
    phaseVariation: clamp(finiteOr(input.phaseVariation, d.phaseVariation), 0, 1),

    pocketThreshold: clamp(finiteOr(input.pocketThreshold, d.pocketThreshold), 2, 14),
    pocketSoftness: clamp(finiteOr(input.pocketSoftness, d.pocketSoftness), 0.05, 3),

    showLabels: booleanOr(input.showLabels, d.showLabels),
    showNuclei: booleanOr(input.showNuclei, d.showNuclei),
    preserveMorphology: booleanOr(input.preserveMorphology, d.preserveMorphology),
    lowZoomDetail: lowZoomDetailOr(input.lowZoomDetail),
    minimumMorphologyDetail: clamp(
      finiteOr(input.minimumMorphologyDetail, d.minimumMorphologyDetail),
      0.2,
      1,
    ),
    edgeStability: clamp(finiteOr(input.edgeStability, d.edgeStability), 0, 1),
    cameraAwareMorph: false,
    cameraShakeMode: cameraShakeModeOr(input.cameraShakeMode),
    cameraShakeIntensity: clamp(finiteOr(input.cameraShakeIntensity, d.cameraShakeIntensity), 0, 5),
    cameraShakeFrequency: clamp(finiteOr(input.cameraShakeFrequency, d.cameraShakeFrequency), 2, 24),
    cameraShakeDamping: clamp(finiteOr(input.cameraShakeDamping, d.cameraShakeDamping), 3, 30),
    cameraShakeDragInfluence: clamp(finiteOr(input.cameraShakeDragInfluence, d.cameraShakeDragInfluence), 0, 1.5),
    cameraShakeSettleDuration: clamp(finiteOr(input.cameraShakeSettleDuration, d.cameraShakeSettleDuration), 0.08, 1.2),
    showFieldDebug: booleanOr(input.showFieldDebug, d.showFieldDebug),
    showNucleiDebug: booleanOr(input.showNucleiDebug, d.showNucleiDebug),
  };
}

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
  /** Retained in the adapter contract so callers can state their intent. */
  preserveMorphology: boolean;
  /** Always false after normalization; retained only for project migration. */
  cameraAwareMorph: boolean;
}

export interface ResolvedMembraneDetail {
  preserveMorphology: boolean;
  lowZoomDetail: OrganismLowZoomDetail;
  minimumMorphologyDetail: number;
  edgeStability: number;
}

export interface ResolvedOrganism {
  /** shader/field params — feed effectiveField() + the uniform smoother */
  params: OrganismParams;
  /** per-nucleus mapping options — feed spacesToNuclei() */
  adapter: OrganismAdapterOptions;
  /** Non-geometric low-resolution policy for the renderer integration. */
  membraneDetail: ResolvedMembraneDetail;
  /** true when idle motion demands continuous rendering */
  motionActive: boolean;
}

/** Resolve a renderer-target sampling ratio from the persisted zoom-quality
 * policy. It changes only target density: no field coordinates, radii, or
 * shader morphology parameters participate. Full density is retained at
 * normal/close zoom; the chosen low-zoom preference fades in toward Z_MIN. */
export const resolveMembraneSamplingScale = (
  detail: ResolvedMembraneDetail,
  cameraZoom: number,
): number => {
  const zoom = clamp(Number.isFinite(cameraZoom) ? cameraZoom : 1, 0.25, 4);
  const lowZoomPressure = clamp((1 - zoom) / 0.75, 0, 1);
  const lowZoomTarget = detail.lowZoomDetail === "full"
    ? 1
    : detail.lowZoomDetail === "balanced"
      ? 0.82
      : 0.64;
  const requested = 1 + (lowZoomTarget - 1) * lowZoomPressure;
  const minimum = clamp(detail.minimumMorphologyDetail, 0.2, 1);
  /* Preserve Morphology strengthens only the sampling floor. Turning it off
   * can reduce target detail further, but never changes authored topology. */
  const stabilityFloor = detail.preserveMorphology
    ? minimum + (1 - minimum) * clamp(detail.edgeStability, 0, 1) * 0.25
    : minimum;
  return clamp(Math.max(requested, stabilityFloor), minimum, 1);
};

export function resolveOrganism(settings: LabSettings, reducedMotion = false): ResolvedOrganism {
  const o = normalizeOrganismSettings(settings.organism);
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
    /* Edge stability belongs to the target sampling policy below. It must not
       alter this field threshold or reshape the authored membrane contour. */
    edgeSoftness: clamp(
      o.edgeSoftness + (reach - 0.4) * 0.02,
      0.004,
      0.6,
    ),
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
    preserveMorphology: o.preserveMorphology,
    cameraAwareMorph: false,
  };

  const membraneDetail: ResolvedMembraneDetail = {
    preserveMorphology: o.preserveMorphology,
    lowZoomDetail: o.lowZoomDetail,
    minimumMorphologyDetail: o.minimumMorphologyDetail,
    edgeStability: o.edgeStability,
  };

  const motionActive =
    o.motionEnabled &&
    o.idleMotion &&
    adapter.timeScale > 0 &&
    (adapter.drift > 0.001 || adapter.breathing > 0.001 || adapter.wobble > 0.001);

  return { params, adapter, membraneDetail, motionActive };
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
