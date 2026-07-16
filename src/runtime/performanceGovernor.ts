import type { ActivityService } from "./activityRuntime";
import { activity } from "./activityRuntime";
import type { PerformanceRuntime, PerformanceSnapshot } from "./performanceRuntime";
import { performanceRuntime } from "./performanceRuntime";
import type { PerformanceQuality, RendererMode } from "../types";
import {
  resolvePreviewRenderScale,
  type EffectivePerformanceQuality,
  type PreviewFilter,
  type PreviewMode,
} from "./performanceProfiles";

export type PerformanceGovernorReason = "initial" | "manual" | "sustained-low" | "sustained-high" | "reset";

export interface PerformanceGovernorSnapshot extends PerformanceSnapshot {
  authoredQuality: PerformanceQuality;
  effectiveQuality: EffectivePerformanceQuality;
  automatic: boolean;
  reason: PerformanceGovernorReason;
  lastTransitionAt: number | null;
  cooldownUntil: number;
  lowSince: number | null;
  highSince: number | null;
  transitionCount: number;
  configuredRenderer: RendererMode | null;
  previewMode: PreviewMode;
  previewFilter: PreviewFilter;
  interactionBoost: boolean;
  interacting: boolean;
  effectiveRenderScale: number;
}

export interface PerformanceGovernorConfiguration {
  authoredQuality: PerformanceQuality;
  renderer: RendererMode;
}

export interface PerformanceGovernor {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PerformanceGovernorSnapshot;
  configure: (input: PerformanceGovernorConfiguration) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setPreviewFilter: (filter: PreviewFilter) => void;
  setInteractionBoost: (enabled: boolean) => void;
  beginInteraction: () => void;
  endInteraction: () => void;
  reset: () => void;
  destroy: () => void;
}

export interface PerformanceGovernorThresholds {
  minSamples: number;
  rendererSettleMs: number;
  cooldownMs: number;
  highToBalanced: { fpsBelow: number; frameTimeAbove: number; sustainMs: number };
  balancedToFast: { fpsBelow: number; frameTimeAbove: number; sustainMs: number };
  fastToBalanced: { fpsAbove: number; frameTimeBelow: number; sustainMs: number };
  balancedToHigh: { fpsAbove: number; frameTimeBelow: number; sustainMs: number };
}

export const PERFORMANCE_GOVERNOR_THRESHOLDS: PerformanceGovernorThresholds = {
  minSamples: 18,
  rendererSettleMs: 900,
  cooldownMs: 3_500,
  highToBalanced: { fpsBelow: 48, frameTimeAbove: 20.8, sustainMs: 1_800 },
  balancedToFast: { fpsBelow: 38, frameTimeAbove: 26.3, sustainMs: 2_200 },
  fastToBalanced: { fpsAbove: 52, frameTimeBelow: 19.3, sustainMs: 5_000 },
  balancedToHigh: { fpsAbove: 57, frameTimeBelow: 17.6, sustainMs: 6_000 },
};

export interface PerformanceGovernorOptions {
  runtime?: Pick<PerformanceRuntime, "subscribe" | "getSnapshot">;
  activityService?: Pick<ActivityService, "notify">;
  now?: () => number;
  isDocumentHidden?: () => boolean;
  subscribeVisibility?: (listener: () => void) => () => void;
  thresholds?: PerformanceGovernorThresholds;
  setTimer?: (run: () => void, delay: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (id: ReturnType<typeof setTimeout>) => void;
}

export const INTERACTION_RESTORE_MS = 220;

const defaultVisibilitySubscription = (listener: () => void) => {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};

const transitionNotification = (quality: EffectivePerformanceQuality) => {
  if (quality === "balanced") {
    return {
      message: "BALANCED MODE ENABLED — Performance adjusted for smoother interaction",
      kind: "warning" as const,
    };
  }
  if (quality === "fast") {
    return {
      message: "FAST MODE ENABLED — Rendering detail temporarily reduced",
      kind: "warning" as const,
    };
  }
  return {
    message: "HIGH MODE RESTORED — Full live detail restored",
    kind: "load" as const,
  };
};

export const createPerformanceGovernor = ({
  runtime = performanceRuntime,
  activityService = activity,
  now = () => performance.now(),
  isDocumentHidden = () => typeof document !== "undefined" && document.hidden,
  subscribeVisibility = defaultVisibilitySubscription,
  thresholds = PERFORMANCE_GOVERNOR_THRESHOLDS,
  setTimer = (run, delay) => setTimeout(run, delay),
  clearTimer = (id) => clearTimeout(id),
}: PerformanceGovernorOptions = {}): PerformanceGovernor => {
  const listeners = new Set<() => void>();
  let performanceSnapshot = runtime.getSnapshot();
  let authoredQuality: PerformanceQuality = "automatic";
  let effectiveQuality: EffectivePerformanceQuality = "high";
  let reason: PerformanceGovernorReason = "initial";
  let configuredRenderer: RendererMode | null = null;
  let measurementRenderer: RendererMode | null = performanceSnapshot.renderer;
  let rendererChangedAt = now();
  let lastTransitionAt: number | null = null;
  let cooldownUntil = 0;
  let lowSince: number | null = null;
  let highSince: number | null = null;
  let transitionCount = 0;
  let previewMode: PreviewMode = "automatic";
  let previewFilter: PreviewFilter = "smooth";
  let interactionBoost = true;
  let interacting = false;
  let interactionRestoreTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;
  let snapshot: PerformanceGovernorSnapshot;

  const buildSnapshot = (): PerformanceGovernorSnapshot => ({
    ...performanceSnapshot,
    authoredQuality,
    effectiveQuality,
    automatic: authoredQuality === "automatic",
    reason,
    lastTransitionAt,
    cooldownUntil,
    lowSince,
    highSince,
    transitionCount,
    configuredRenderer,
    previewMode,
    previewFilter,
    interactionBoost,
    interacting,
    effectiveRenderScale: resolvePreviewRenderScale(
      previewMode,
      effectiveQuality,
      interacting,
      interactionBoost,
    ),
  });

  snapshot = buildSnapshot();

  const publish = () => {
    if (destroyed) return;
    snapshot = buildSnapshot();
    listeners.forEach((listener) => listener());
  };

  const clearHysteresis = () => {
    lowSince = null;
    highSince = null;
  };

  const clearInteractionRestore = () => {
    if (interactionRestoreTimer === null) return;
    clearTimer(interactionRestoreTimer);
    interactionRestoreTimer = null;
  };

  const transition = (
    nextQuality: EffectivePerformanceQuality,
    nextReason: Extract<PerformanceGovernorReason, "sustained-low" | "sustained-high">,
    at: number,
  ) => {
    if (nextQuality === effectiveQuality) return;
    effectiveQuality = nextQuality;
    reason = nextReason;
    lastTransitionAt = at;
    cooldownUntil = at + thresholds.cooldownMs;
    transitionCount += 1;
    clearHysteresis();
    activityService.notify({
      id: `performance-governor:${transitionCount}:${nextQuality}`,
      ...transitionNotification(nextQuality),
    });
  };

  const evaluate = () => {
    if (authoredQuality !== "automatic") return;
    const at = now();
    const fps = performanceSnapshot.fps;
    const frameTime = performanceSnapshot.averageFrameTime;
    if (
      performanceSnapshot.idle
      || isDocumentHidden()
      || performanceSnapshot.sampleCount < thresholds.minSamples
      || fps === null
      || frameTime === null
      || at - rendererChangedAt < thresholds.rendererSettleMs
      || at < cooldownUntil
    ) {
      clearHysteresis();
      return;
    }

    if (effectiveQuality === "high") {
      highSince = null;
      const underPressure = fps < thresholds.highToBalanced.fpsBelow
        || frameTime > thresholds.highToBalanced.frameTimeAbove;
      if (!underPressure) {
        lowSince = null;
        return;
      }
      lowSince ??= at;
      if (at - lowSince >= thresholds.highToBalanced.sustainMs) {
        transition("balanced", "sustained-low", at);
      }
      return;
    }

    if (effectiveQuality === "balanced") {
      const severePressure = fps < thresholds.balancedToFast.fpsBelow
        || frameTime > thresholds.balancedToFast.frameTimeAbove;
      const healthy = fps > thresholds.balancedToHigh.fpsAbove
        && frameTime < thresholds.balancedToHigh.frameTimeBelow;
      if (severePressure) {
        highSince = null;
        lowSince ??= at;
        if (at - lowSince >= thresholds.balancedToFast.sustainMs) {
          transition("fast", "sustained-low", at);
        }
      } else if (healthy) {
        lowSince = null;
        highSince ??= at;
        if (at - highSince >= thresholds.balancedToHigh.sustainMs) {
          transition("high", "sustained-high", at);
        }
      } else {
        clearHysteresis();
      }
      return;
    }

    lowSince = null;
    const healthy = fps > thresholds.fastToBalanced.fpsAbove
      && frameTime < thresholds.fastToBalanced.frameTimeBelow;
    if (!healthy) {
      highSince = null;
      return;
    }
    highSince ??= at;
    if (at - highSince >= thresholds.fastToBalanced.sustainMs) {
      transition("balanced", "sustained-high", at);
    }
  };

  const resetState = (nextReason: PerformanceGovernorReason) => {
    clearHysteresis();
    cooldownUntil = 0;
    lastTransitionAt = null;
    rendererChangedAt = now();
    effectiveQuality = authoredQuality === "automatic" ? "high" : authoredQuality;
    reason = authoredQuality === "automatic" ? nextReason : "manual";
  };

  const onPerformanceSnapshot = () => {
    performanceSnapshot = runtime.getSnapshot();
    if (performanceSnapshot.renderer !== null && performanceSnapshot.renderer !== measurementRenderer) {
      measurementRenderer = performanceSnapshot.renderer;
      resetState("reset");
    }
    evaluate();
    publish();
  };

  const stopRuntime = runtime.subscribe(onPerformanceSnapshot);
  const stopVisibility = subscribeVisibility(() => {
    if (isDocumentHidden()) {
      clearHysteresis();
      publish();
    }
  });

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    configure(input) {
      if (destroyed) return;
      const hadConfiguredRenderer = configuredRenderer !== null;
      const rendererChanged = hadConfiguredRenderer && configuredRenderer !== input.renderer;
      const qualityChanged = authoredQuality !== input.authoredQuality;
      configuredRenderer = input.renderer;
      if (!hadConfiguredRenderer && !qualityChanged) {
        rendererChangedAt = now();
        publish();
        return;
      }
      if (!rendererChanged && !qualityChanged) return;
      authoredQuality = input.authoredQuality;
      resetState(rendererChanged || authoredQuality === "automatic" ? "reset" : "manual");
      publish();
    },
    setPreviewMode(mode) {
      if (destroyed || mode === previewMode) return;
      previewMode = mode;
      publish();
    },
    setPreviewFilter(filter) {
      if (destroyed || filter === previewFilter) return;
      previewFilter = filter;
      publish();
    },
    setInteractionBoost(enabled) {
      if (destroyed || enabled === interactionBoost) return;
      interactionBoost = enabled;
      if (!enabled && interacting) {
        clearInteractionRestore();
        interacting = false;
      }
      publish();
    },
    beginInteraction() {
      if (destroyed || !interactionBoost) return;
      clearInteractionRestore();
      if (interacting) return;
      interacting = true;
      publish();
    },
    endInteraction() {
      if (destroyed || !interactionBoost || !interacting) return;
      clearInteractionRestore();
      interactionRestoreTimer = setTimer(() => {
        interactionRestoreTimer = null;
        if (destroyed || !interacting) return;
        interacting = false;
        publish();
      }, INTERACTION_RESTORE_MS);
    },
    reset() {
      if (destroyed) return;
      transitionCount = 0;
      resetState("reset");
      publish();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearInteractionRestore();
      stopRuntime();
      stopVisibility();
      listeners.clear();
    },
  };
};

export const performanceGovernor = createPerformanceGovernor();
