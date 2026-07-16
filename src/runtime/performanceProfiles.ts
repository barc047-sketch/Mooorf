import type { ResourceSettings } from "../resources/types";
import type {
  AnnotationDetail,
  CellShadowSettings,
  OrganismSettings,
  PerformanceQuality,
  RendererMode,
} from "../types";

export type EffectivePerformanceQuality = Exclude<PerformanceQuality, "automatic">;
export type PreviewMode = "automatic" | "sharp" | "balanced" | "fast" | "ultra-fast";
export type PreviewFilter = "smooth" | "pixel";

export const BALANCED_MOTION_FACTOR = 0.75;
export const BALANCED_SHADOW_SOFTNESS_MAX = 28;
export const ORGANISM_DPR_CAPS: Readonly<Record<EffectivePerformanceQuality, number>> = {
  high: 2,
  balanced: 1.25,
  fast: 1,
};
export const ORGANISM_PRESSURE_MIN_SAMPLES = 18;

export const PREVIEW_RENDER_SCALES: Readonly<Record<Exclude<PreviewMode, "automatic">, number>> = {
  sharp: 1,
  balanced: 0.72,
  fast: 0.5,
  "ultra-fast": 0.4,
};

export const AUTOMATIC_PREVIEW_SCALES: Readonly<Record<EffectivePerformanceQuality, number>> = {
  high: 1,
  balanced: 0.72,
  fast: 0.5,
};

export const INTERACTION_PREVIEW_SCALE = 0.4;

export const resolvePreviewRenderScale = (
  mode: PreviewMode,
  quality: EffectivePerformanceQuality,
  interacting: boolean,
  interactionBoost: boolean,
): number => interacting && interactionBoost
  ? INTERACTION_PREVIEW_SCALE
  : mode === "automatic"
    ? AUTOMATIC_PREVIEW_SCALES[quality]
    : PREVIEW_RENDER_SCALES[mode];

export const resolveOrganismDpr = (
  devicePixelRatio: number,
  quality: PerformanceQuality,
): number => {
  const safeDeviceDpr = Number.isFinite(devicePixelRatio) ? Math.max(1, devicePixelRatio) : 1;
  const effectiveQuality = quality === "automatic" ? "high" : quality;
  return Math.min(safeDeviceDpr, ORGANISM_DPR_CAPS[effectiveQuality]);
};

export const resolveOrganismPixelRatio = (
  devicePixelRatio: number,
  quality: PerformanceQuality,
  renderScale: number,
): number => resolveOrganismDpr(devicePixelRatio, quality)
  * Math.min(Math.max(Number.isFinite(renderScale) ? renderScale : 1, INTERACTION_PREVIEW_SCALE), 1);

export interface OrganismPressureInput {
  renderer: RendererMode;
  totalSpaces: number;
  authoredQuality: PerformanceQuality;
  effectiveQuality: EffectivePerformanceQuality;
  idle: boolean;
  fps: number | null;
  sampleCount: number;
}

export const isOrganismUnderPressure = ({
  renderer,
  totalSpaces,
  authoredQuality,
  effectiveQuality,
  idle,
  fps,
  sampleCount,
}: OrganismPressureInput): boolean => {
  if (renderer !== "organism" || totalSpaces < 20) return false;
  if (authoredQuality === "automatic" && effectiveQuality === "fast") return true;
  return !idle
    && fps !== null
    && fps < 40
    && sampleCount >= ORGANISM_PRESSURE_MIN_SAMPLES;
};

export interface EffectivePerformanceProfileInput {
  authoredQuality: PerformanceQuality;
  automaticQuality: EffectivePerformanceQuality;
  renderer: RendererMode;
  authoredOrganism: OrganismSettings;
  authoredCellShadow: CellShadowSettings;
  authoredAnnotationDetail: AnnotationDetail;
  authoredResources: ResourceSettings;
}

export interface EffectivePerformanceProfile {
  renderer: RendererMode;
  effectiveQuality: EffectivePerformanceQuality;
  organism: OrganismSettings;
  cellShadow: CellShadowSettings;
  annotationDetail: AnnotationDetail;
  resources: ResourceSettings;
}

export interface RuntimePerformanceSelection {
  authoredQuality: PerformanceQuality;
  effectiveQuality: EffectivePerformanceQuality;
  configuredRenderer: RendererMode | null;
}

interface RuntimeProfileSettings {
  performanceQuality: PerformanceQuality;
  organism: OrganismSettings;
  cellShadow: CellShadowSettings;
  annotationDetail: AnnotationDetail;
  resources: ResourceSettings;
}

const effectiveQualityFrom = (
  authoredQuality: PerformanceQuality,
  automaticQuality: EffectivePerformanceQuality,
): EffectivePerformanceQuality => authoredQuality === "automatic" ? automaticQuality : authoredQuality;

export const resolveEffectivePerformanceProfile = ({
  authoredQuality,
  automaticQuality,
  renderer,
  authoredOrganism,
  authoredCellShadow,
  authoredAnnotationDetail,
  authoredResources,
}: EffectivePerformanceProfileInput): EffectivePerformanceProfile => {
  const effectiveQuality = effectiveQualityFrom(authoredQuality, automaticQuality);
  const organism = { ...authoredOrganism };
  const cellShadow = { ...authoredCellShadow };

  if (effectiveQuality === "balanced") {
    cellShadow.softness = Math.min(cellShadow.softness, BALANCED_SHADOW_SOFTNESS_MAX);
    organism.timeScale *= BALANCED_MOTION_FACTOR;
    organism.drift *= BALANCED_MOTION_FACTOR;
    organism.breathing *= BALANCED_MOTION_FACTOR;
    organism.wobble *= BALANCED_MOTION_FACTOR;
  } else if (effectiveQuality === "fast") {
    cellShadow.enabled = false;
    cellShadow.mode = "off";
    organism.drift = 0;
    organism.breathing = 0;
    organism.wobble = 0;
  }

  return {
    renderer,
    effectiveQuality,
    organism,
    cellShadow,
    annotationDetail: { ...authoredAnnotationDetail },
    resources: authoredResources,
  };
};

export const resolveLivePerformanceSettings = <Settings extends RuntimeProfileSettings>(
  authoredSettings: Settings,
  governor: RuntimePerformanceSelection,
  renderer: RendererMode,
): Settings => {
  const automaticQuality = governor.authoredQuality === "automatic"
    && governor.configuredRenderer === renderer
    ? governor.effectiveQuality
    : "high";
  const profile = resolveEffectivePerformanceProfile({
    authoredQuality: authoredSettings.performanceQuality,
    automaticQuality,
    renderer,
    authoredOrganism: authoredSettings.organism,
    authoredCellShadow: authoredSettings.cellShadow,
    authoredAnnotationDetail: authoredSettings.annotationDetail,
    authoredResources: authoredSettings.resources,
  });
  return {
    ...authoredSettings,
    performanceQuality: profile.effectiveQuality,
    organism: profile.organism,
    cellShadow: profile.cellShadow,
    annotationDetail: profile.annotationDetail,
    resources: profile.resources,
  } as Settings;
};
