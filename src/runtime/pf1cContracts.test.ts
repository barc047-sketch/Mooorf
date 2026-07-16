import { strict as assert } from "node:assert";
import { existsSync, readFileSync as readSourceFileSync } from "node:fs";
import test from "node:test";
import { DEFAULT_ORGANISM_SETTINGS } from "../canvas/organismProductionSettings";
import { DEFAULT_CELL_SHADOW, normalizeCellShadow } from "../canvas/cellShadow";
import { DEFAULT_RESOURCE_SETTINGS } from "../resources/resourcePersistence";
import { DEFAULT_ANNOTATION_DETAIL } from "../state/store";
import type { PerformanceQuality, RendererMode } from "../types";
import { createActivityService } from "./activityRuntime";
import type { PerformanceRuntime, PerformanceSnapshot } from "./performanceRuntime";
import { createPerformanceGovernor, PERFORMANCE_GOVERNOR_THRESHOLDS } from "./performanceGovernor";
import {
  BALANCED_MOTION_FACTOR,
  BALANCED_SHADOW_SOFTNESS_MAX,
  ORGANISM_DPR_CAPS,
  resolveEffectivePerformanceProfile,
  resolveOrganismDpr,
} from "./performanceProfiles";
import * as performanceProfiles from "./performanceProfiles";

const sourceCache = new Map<string, string>();
const readFileSync = (path: string, _encoding: "utf8") => {
  const cached = sourceCache.get(path);
  if (cached !== undefined) return cached;
  const source = readSourceFileSync(path, "utf8");
  sourceCache.set(path, source);
  return source;
};

const activeSnapshot = (overrides: Partial<PerformanceSnapshot> = {}): PerformanceSnapshot => ({
  idle: false,
  fps: 60,
  averageFrameTime: 16.2,
  renderer: "classic",
  visibleCells: 24,
  totalCells: 24,
  sampleCount: 24,
  ...overrides,
});

const createGovernorHarness = () => {
  let now = 0;
  let nextTimerId = 1;
  const timers = new Map<number, { at: number; run: () => void }>();
  let hidden = false;
  let runtimeSnapshot = activeSnapshot({ sampleCount: 0, fps: null, averageFrameTime: null });
  const runtimeListeners = new Set<() => void>();
  const visibilityListeners = new Set<() => void>();
  const runtime: PerformanceRuntime = {
    subscribe(listener) {
      runtimeListeners.add(listener);
      return () => runtimeListeners.delete(listener);
    },
    getSnapshot: () => runtimeSnapshot,
    reportFrame: () => {},
    destroy: () => runtimeListeners.clear(),
  };
  const activity = createActivityService({ now: () => now });
  const governor = createPerformanceGovernor({
    runtime,
    activityService: activity,
    now: () => now,
    isDocumentHidden: () => hidden,
    subscribeVisibility: (listener) => {
      visibilityListeners.add(listener);
      return () => visibilityListeners.delete(listener);
    },
    setTimer: (run, delay) => {
      const id = nextTimerId++;
      timers.set(id, { at: now + delay, run });
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimer: (id) => timers.delete(id as unknown as number),
  });
  return {
    activity,
    governor,
    at(milliseconds: number, overrides: Partial<PerformanceSnapshot> = {}) {
      now = milliseconds;
      runtimeSnapshot = activeSnapshot(overrides);
      runtimeListeners.forEach((listener) => listener());
    },
    configure(authoredQuality: PerformanceQuality, renderer: RendererMode = "classic") {
      governor.configure({ authoredQuality, renderer });
    },
    setHidden(value: boolean) {
      hidden = value;
      visibilityListeners.forEach((listener) => listener());
    },
    advanceTimers(milliseconds: number) {
      now += milliseconds;
      const due = [...timers].filter(([, timer]) => timer.at <= now);
      for (const [id, timer] of due) {
        timers.delete(id);
        timer.run();
      }
    },
    pendingTimers: () => timers.size,
    destroy() {
      governor.destroy();
    },
  };
};

const settleRenderer = (harness: ReturnType<typeof createGovernorHarness>) =>
  harness.at(PERFORMANCE_GOVERNOR_THRESHOLDS.rendererSettleMs, { sampleCount: 24 });

const sustainHighToBalanced = (harness: ReturnType<typeof createGovernorHarness>, start = 1_000) => {
  harness.at(start, { fps: 44, averageFrameTime: 23, sampleCount: 24 });
  harness.at(start + PERFORMANCE_GOVERNOR_THRESHOLDS.highToBalanced.sustainMs, {
    fps: 44,
    averageFrameTime: 23,
    sampleCount: 24,
  });
};

const sustainBalancedToFast = (harness: ReturnType<typeof createGovernorHarness>, start: number) => {
  harness.at(start, { fps: 32, averageFrameTime: 31, sampleCount: 24 });
  harness.at(start + PERFORMANCE_GOVERNOR_THRESHOLDS.balancedToFast.sustainMs, {
    fps: 32,
    averageFrameTime: 31,
    sampleCount: 24,
  });
};

const automaticFastHarness = () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  sustainHighToBalanced(harness, 1_000);
  const secondStart = harness.governor.getSnapshot().cooldownUntil + 1;
  sustainBalancedToFast(harness, secondStart);
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "fast");
  return harness;
};

// Governor, profile, and preview-resolution service behaviour.
test("Automatic starts at HIGH", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  assert.deepEqual(
    {
      authored: harness.governor.getSnapshot().authoredQuality,
      effective: harness.governor.getSnapshot().effectiveQuality,
      automatic: harness.governor.getSnapshot().automatic,
      reason: harness.governor.getSnapshot().reason,
    },
    { authored: "automatic", effective: "high", automatic: true, reason: "initial" },
  );
  harness.destroy();
});

for (const quality of ["high", "balanced", "fast"] as const) {
  test(`${quality.toUpperCase()} manual mode remains ${quality.toUpperCase()}`, () => {
    const harness = createGovernorHarness();
    harness.configure(quality);
    settleRenderer(harness);
    harness.at(10_000, { fps: 12, averageFrameTime: 80, sampleCount: 90 });
    assert.equal(harness.governor.getSnapshot().effectiveQuality, quality);
    assert.equal(harness.governor.getSnapshot().reason, "manual");
    harness.destroy();
  });
}

test("returning to Automatic resets to HIGH", () => {
  const harness = createGovernorHarness();
  harness.configure("fast");
  harness.configure("automatic");
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "high");
  assert.equal(harness.governor.getSnapshot().reason, "reset");
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  assert.equal(harness.governor.getSnapshot().highSince, null);
  harness.destroy();
});

test("fewer than 18 samples cannot trigger adaptation", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  harness.at(1_000, { fps: 20, averageFrameTime: 50, sampleCount: 17 });
  harness.at(8_000, { fps: 20, averageFrameTime: 50, sampleCount: 17 });
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "high");
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  harness.destroy();
});

test("a short FPS dip does not degrade", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  harness.at(1_000, { fps: 44, averageFrameTime: 23 });
  harness.at(2_000, { fps: 60, averageFrameTime: 16 });
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "high");
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  harness.destroy();
});

test("sustained low performance changes HIGH to BALANCED", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  sustainHighToBalanced(harness);
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "balanced");
  assert.equal(harness.governor.getSnapshot().reason, "sustained-low");
  harness.destroy();
});

test("sustained severe low performance changes BALANCED to FAST", () => {
  const harness = automaticFastHarness();
  assert.equal(harness.governor.getSnapshot().transitionCount, 2);
  harness.destroy();
});

test("Automatic mode changes only one level at a time", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  sustainHighToBalanced(harness, 1_000);
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "balanced");
  assert.notEqual(harness.governor.getSnapshot().effectiveQuality, "fast");
  harness.destroy();
});

test("cooldown blocks an immediate second transition", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  sustainHighToBalanced(harness, 1_000);
  const transitionAt = harness.governor.getSnapshot().lastTransitionAt;
  if (transitionAt === null) throw new Error("expected the first automatic transition");
  harness.at(transitionAt + 1_000, { fps: 20, averageFrameTime: 50 });
  harness.at(transitionAt + 3_499, { fps: 20, averageFrameTime: 50 });
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "balanced");
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  harness.destroy();
});

test("sustained recovery changes FAST to BALANCED", () => {
  const harness = automaticFastHarness();
  const start = harness.governor.getSnapshot().cooldownUntil + 1;
  harness.at(start, { fps: 58, averageFrameTime: 16 });
  harness.at(start + PERFORMANCE_GOVERNOR_THRESHOLDS.fastToBalanced.sustainMs, {
    fps: 58,
    averageFrameTime: 16,
  });
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "balanced");
  assert.equal(harness.governor.getSnapshot().reason, "sustained-high");
  harness.destroy();
});

test("sustained recovery changes BALANCED to HIGH", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  sustainHighToBalanced(harness, 1_000);
  const start = harness.governor.getSnapshot().cooldownUntil + 1;
  harness.at(start, { fps: 60, averageFrameTime: 16 });
  harness.at(start + PERFORMANCE_GOVERNOR_THRESHOLDS.balancedToHigh.sustainMs, {
    fps: 60,
    averageFrameTime: 16,
  });
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "high");
  harness.destroy();
});

test("recovery requires a longer window than degradation", () => {
  assert.ok(
    PERFORMANCE_GOVERNOR_THRESHOLDS.fastToBalanced.sustainMs
      > PERFORMANCE_GOVERNOR_THRESHOLDS.balancedToFast.sustainMs,
  );
  assert.ok(
    PERFORMANCE_GOVERNOR_THRESHOLDS.balancedToHigh.sustainMs
      > PERFORMANCE_GOVERNOR_THRESHOLDS.highToBalanced.sustainMs,
  );
});

for (const direction of ["degrade", "recover"] as const) {
  test(`IDLE does not ${direction}`, () => {
    const harness = direction === "degrade" ? createGovernorHarness() : automaticFastHarness();
    if (direction === "degrade") {
      harness.configure("automatic");
      settleRenderer(harness);
    }
    const before = harness.governor.getSnapshot().effectiveQuality;
    const start = harness.governor.getSnapshot().cooldownUntil + 1;
    harness.at(start, { idle: true, fps: null, averageFrameTime: null, sampleCount: 0 });
    harness.at(start + 10_000, { idle: true, fps: null, averageFrameTime: null, sampleCount: 0 });
    assert.equal(harness.governor.getSnapshot().effectiveQuality, before);
    harness.destroy();
  });
}

test("hidden-document measurements do not trigger transitions", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  harness.setHidden(true);
  harness.at(1_000, { fps: 20, averageFrameTime: 50 });
  harness.at(10_000, { fps: 20, averageFrameTime: 50 });
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "high");
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  harness.destroy();
});

test("renderer changes reset hysteresis", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic", "classic");
  settleRenderer(harness);
  harness.at(1_000, { fps: 44, averageFrameTime: 23, renderer: "classic" });
  assert.equal(harness.governor.getSnapshot().lowSince, 1_000);
  harness.configure("automatic", "organism");
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "high");
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  harness.at(10_000, { fps: 20, averageFrameTime: 50, renderer: "organism" });
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "high");
  harness.destroy();
});

test("authored quality changes reset hysteresis", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  harness.at(1_000, { fps: 44, averageFrameTime: 23 });
  harness.configure("balanced");
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  assert.equal(harness.governor.getSnapshot().highSince, null);
  assert.equal(harness.governor.getSnapshot().effectiveQuality, "balanced");
  harness.destroy();
});

test("opposite-direction timers are cleared on transition", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  sustainHighToBalanced(harness, 1_000);
  assert.equal(harness.governor.getSnapshot().lowSince, null);
  assert.equal(harness.governor.getSnapshot().highSince, null);
  harness.destroy();
});

const authoredProfileInput = () => ({
  authoredQuality: "automatic" as const,
  automaticQuality: "high" as const,
  renderer: "organism" as const,
  authoredOrganism: {
    ...DEFAULT_ORGANISM_SETTINGS,
    motionEnabled: true,
    idleMotion: true,
    timeScale: 1.2,
    drift: 0.8,
    breathing: 0.6,
    wobble: 0.4,
  },
  authoredCellShadow: {
    ...DEFAULT_CELL_SHADOW,
    enabled: true,
    mode: "defined" as const,
    softness: 48,
  },
  authoredAnnotationDetail: { ...DEFAULT_ANNOTATION_DETAIL },
  authoredResources: structuredClone(DEFAULT_RESOURCE_SETTINGS),
});

test("profile resolution never mutates authored objects", () => {
  const input = authoredProfileInput();
  const before = structuredClone(input);
  resolveEffectivePerformanceProfile({ ...input, automaticQuality: "fast" });
  assert.deepEqual(input, before);
});

test("HIGH profile preserves authored live values", () => {
  const input = authoredProfileInput();
  const profile = resolveEffectivePerformanceProfile(input);
  assert.equal(profile.effectiveQuality, "high");
  assert.deepEqual(profile.organism, input.authoredOrganism);
  assert.deepEqual(profile.cellShadow, input.authoredCellShadow);
  assert.deepEqual(profile.annotationDetail, input.authoredAnnotationDetail);
  assert.deepEqual(profile.resources, input.authoredResources);
});

test("BALANCED applies only permitted runtime reductions", () => {
  const input = authoredProfileInput();
  const profile = resolveEffectivePerformanceProfile({ ...input, automaticQuality: "balanced" });
  assert.equal(profile.effectiveQuality, "balanced");
  assert.equal(profile.cellShadow.enabled, true);
  assert.equal(profile.cellShadow.softness, BALANCED_SHADOW_SOFTNESS_MAX);
  assert.equal(profile.organism.timeScale, input.authoredOrganism.timeScale * BALANCED_MOTION_FACTOR);
  assert.equal(profile.organism.drift, input.authoredOrganism.drift * BALANCED_MOTION_FACTOR);
  assert.deepEqual(profile.annotationDetail, input.authoredAnnotationDetail);
  assert.deepEqual(profile.resources, input.authoredResources);
});

test("FAST applies only permitted runtime reductions", () => {
  const input = authoredProfileInput();
  const profile = resolveEffectivePerformanceProfile({ ...input, automaticQuality: "fast" });
  assert.equal(profile.effectiveQuality, "fast");
  assert.equal(profile.cellShadow.enabled, false);
  assert.equal(profile.cellShadow.mode, "off");
  assert.equal(profile.organism.drift, 0);
  assert.equal(profile.organism.breathing, 0);
  assert.equal(profile.organism.wobble, 0);
  assert.deepEqual(profile.annotationDetail, input.authoredAnnotationDetail);
  assert.deepEqual(profile.resources, input.authoredResources);
});

test("the canonical Shadow master preserves authored style and advanced values while OFF", () => {
  const authored = normalizeCellShadow({
    enabled: false,
    mode: "defined",
    strength: 0.73,
    opacity: 0.41,
    softness: 17,
    offsetX: 6,
    offsetY: 11,
    spread: 4,
    colorMode: "custom",
    color: "#123456",
    includeInExport: false,
  });
  assert.equal(authored.enabled, false);
  assert.equal(authored.mode, "defined");
  assert.deepEqual(
    { ...authored, enabled: true },
    {
      enabled: true,
      mode: "defined",
      strength: 0.73,
      opacity: 0.41,
      softness: 17,
      offsetX: 6,
      offsetY: 11,
      spread: 4,
      colorMode: "custom",
      color: "#123456",
      includeInExport: false,
    },
  );
});

test("Organism live DPR follows the effective quality tier", () => {
  assert.equal(resolveOrganismDpr(2, "high"), ORGANISM_DPR_CAPS.high);
  assert.equal(resolveOrganismDpr(2, "balanced"), ORGANISM_DPR_CAPS.balanced);
  assert.equal(resolveOrganismDpr(2, "fast"), ORGANISM_DPR_CAPS.fast);
  assert.equal(resolveOrganismDpr(1.25, "high"), 1.25);
});

test("preview modes resolve the approved render scales without changing DPR caps", () => {
  const resolver = (performanceProfiles as Record<string, unknown>).resolvePreviewRenderScale;
  assert.equal(typeof resolver, "function", "one pure preview-scale resolver exists");
  const resolve = resolver as (mode: string, quality: string, interacting: boolean, boost: boolean) => number;
  assert.equal(resolve("automatic", "high", false, true), 1);
  assert.equal(resolve("automatic", "balanced", false, true), 0.72);
  assert.equal(resolve("automatic", "fast", false, true), 0.5);
  assert.equal(resolve("sharp", "fast", false, true), 1);
  assert.equal(resolve("balanced", "high", false, true), 0.72);
  assert.equal(resolve("fast", "high", false, true), 0.5);
  assert.equal(resolve("ultra-fast", "high", false, true), 0.4);
  assert.equal(resolve("sharp", "high", true, true), 0.4);
  assert.equal(resolve("sharp", "high", true, false), 1);
});

test("effective Organism pixel ratio combines the existing cap with preview scale once", () => {
  const resolver = (performanceProfiles as Record<string, unknown>).resolveOrganismPixelRatio;
  assert.equal(typeof resolver, "function", "one pure effective-pixel-ratio resolver exists");
  const resolve = resolver as (deviceDpr: number, quality: PerformanceQuality, renderScale: number) => number;
  assert.equal(resolve(2, "high", 0.72), 1.44);
  assert.equal(resolve(2, "balanced", 0.5), 0.625);
  assert.equal(resolve(2, "fast", 0.4), 0.4);
});

test("Governor owns session-only preview preferences and bounded interaction restoration", () => {
  const harness = createGovernorHarness();
  const governor = harness.governor;
  assert.equal(governor.getSnapshot().previewMode, "automatic");
  assert.equal(governor.getSnapshot().previewFilter, "smooth");
  assert.equal(governor.getSnapshot().interactionBoost, true);
  governor.setPreviewMode("sharp");
  governor.beginInteraction();
  assert.equal(governor.getSnapshot().effectiveRenderScale, 0.4);
  governor.endInteraction();
  assert.equal(harness.pendingTimers(), 1, "one bounded restoration timeout is pending");
  harness.advanceTimers(219);
  assert.equal(governor.getSnapshot().interacting, true);
  harness.advanceTimers(1);
  assert.equal(governor.getSnapshot().interacting, false);
  assert.equal(governor.getSnapshot().effectiveRenderScale, 1);
  governor.setPreviewFilter("pixel");
  assert.equal(governor.getSnapshot().previewFilter, "pixel");
  governor.setInteractionBoost(false);
  governor.beginInteraction();
  assert.equal(governor.getSnapshot().interacting, false);
  harness.destroy();
});

test("selected and editing readability inputs are retained", () => {
  const input = authoredProfileInput();
  const profile = resolveEffectivePerformanceProfile({ ...input, automaticQuality: "fast" });
  assert.equal(profile.annotationDetail.showName, true);
  assert.equal(profile.annotationDetail.showArea, true);
});

test("Motion OFF remains OFF in every profile", () => {
  const input = authoredProfileInput();
  input.authoredOrganism.motionEnabled = false;
  for (const automaticQuality of ["high", "balanced", "fast"] as const) {
    const profile = resolveEffectivePerformanceProfile({ ...input, automaticQuality });
    assert.equal(profile.organism.motionEnabled, false);
  }
});

test("Governor and profiles never change rendererMode", () => {
  const input = authoredProfileInput();
  for (const renderer of ["classic", "organism"] as const) {
    const profile = resolveEffectivePerformanceProfile({ ...input, renderer, automaticQuality: "fast" });
    assert.equal(profile.renderer, renderer);
  }
  const governorSource = readFileSync("src/runtime/performanceGovernor.ts", "utf8");
  assert.doesNotMatch(governorSource, /setSettings|rendererMode\s*:/);
});

test("one notification occurs per real automatic transition", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  settleRenderer(harness);
  sustainHighToBalanced(harness, 1_000);
  assert.deepEqual(harness.activity.getSnapshot().notifications.map(({ message }) => message), [
    "BALANCED MODE ENABLED — Performance adjusted for smoother interaction",
  ]);
  harness.destroy();
});

test("initial HIGH and manual quality changes produce no automatic notification", () => {
  const harness = createGovernorHarness();
  harness.configure("automatic");
  harness.configure("balanced");
  harness.configure("fast");
  harness.configure("high");
  assert.equal(harness.activity.getSnapshot().notifications.length, 0);
  harness.destroy();
});

test("Governor owns no requestAnimationFrame loop", () => {
  const source = readFileSync("src/runtime/performanceGovernor.ts", "utf8");
  assert.doesNotMatch(source, /requestAnimationFrame/);
});

test("Governor owns no setInterval polling", () => {
  const source = readFileSync("src/runtime/performanceGovernor.ts", "utf8");
  assert.doesNotMatch(source, /setInterval/);
});

// Source-wiring contracts for ownership boundaries without a public runtime seam.
test("preview preferences stay out of product, history, saved-view and export ownership", () => {
  const store = readFileSync("src/state/store.ts", "utf8");
  const projectSnapshot = readFileSync("src/export/projectSnapshot.ts", "utf8");
  const exportService = readFileSync("src/export/exportService.ts", "utf8");
  for (const source of [store, projectSnapshot, exportService]) {
    assert.doesNotMatch(source, /previewMode|previewFilter|interactionBoost|effectiveRenderScale/);
  }
});

test("Governor state is not added to Zustand persistence", () => {
  const store = readFileSync("src/state/store.ts", "utf8");
  assert.doesNotMatch(store, /performanceGovernor|effectiveQuality|cooldownUntil|transitionCount/);
  assert.match(store, /performanceQuality:\s*state\.settings\.performanceQuality/);
});

test("Governor state is not added to saved snapshots", () => {
  const projectSnapshot = readFileSync("src/export/projectSnapshot.ts", "utf8");
  assert.doesNotMatch(projectSnapshot, /performanceGovernor|effectiveQuality|cooldownUntil|transitionCount/);
});

test("export paths use authored settings and never import the Governor", () => {
  const exportService = readFileSync("src/export/exportService.ts", "utf8");
  const classic = readFileSync("src/canvas/CanvasView.tsx", "utf8");
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  assert.doesNotMatch(exportService, /performanceGovernor|effectiveQuality/);
  assert.match(exportService, /performanceQuality:\s*state\.settings\.performanceQuality/);
  assert.match(classic, /snapshot\.settings/);
  assert.match(organism, /renderDetachedOrganismExport/);
});

test("Runtime Status consumes the Governor and shows AUTO with the effective tier", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  assert.match(source, /performanceGovernor\.subscribe/);
  assert.match(source, /performanceGovernor\.configure\(\{ authoredQuality: performanceQuality, renderer: rendererMode \}\)/);
  assert.match(source, /`AUTO · \$\{performanceSnapshot\.effectiveQuality\.toUpperCase\(\)\}`/);
  assert.doesNotMatch(source, /performanceRuntime\.subscribe/);
});

test("expanded Runtime Status exposes canonical quality while Classic stays internal", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  for (const label of ["AUTO", "HIGH", "BALANCED", "FAST"]) {
    assert.match(source, new RegExp(`label: "${label}"`), label);
  }
  assert.match(source, />QUALITY</);
  assert.match(source, /setSettings\(\{ performanceQuality: option\.id \}\)/);
  assert.match(source, /aria-pressed=\{active\}/);
  assert.doesNotMatch(source, /RENDERER_OPTIONS|>RENDERER<|ORGANISM UNDER PRESSURE|SWITCH TO CLASSIC|Classic is recommended/);
  assert.doesNotMatch(source, /setSettings\(\{ rendererMode:/);
  assert.match(css, /\.runtime-choice\[data-active="true"\][\s\S]*?background:[^;]*color-mix/);
  assert.match(css, /\.runtime-choice\[data-active="true"\]::before/);
  assert.doesNotMatch(css, /\.runtime-choice\[data-active="true"\][^{]*\{[^}]*background:\s*(?:#000|black)/s);
});

test("Runtime Status opens the canonical Advanced widget and reports preview scale", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  assert.match(source, /openWidget\("advanced"\)/);
  assert.match(source, />PERFORMANCE</);
  assert.match(source, />PREVIEW</);
  assert.match(source, /effectiveRenderScale/);
});

test("Advanced Performance reuses the existing floating widget for detailed preview controls", () => {
  const source = readFileSync("src/ui/widgets/AdvancedWidget.tsx", "utf8");
  const registry = readFileSync("src/ui/panels/widgetRegistry.ts", "utf8");
  for (const label of ["PREVIEW", "BOOST", "FILTER", "STATUS", "CANVAS", "DEBUG"]) {
    assert.match(source, new RegExp(label));
  }
  for (const label of ["AUTO", "SHARP", "BALANCED", "FAST", "ULTRA", "SMOOTH", "PIXEL"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(registry, /label:\s*"Performance"/);
  assert.doesNotMatch(source, /setInterval|requestAnimationFrame/);
});

test("one accessible top-right quick bar owns only canonical live toggles", () => {
  assert.equal(existsSync("src/ui/QuickToggleBar.tsx"), true, "quick bar component exists");
  const app = readFileSync("src/App.tsx", "utf8");
  const source = readFileSync("src/ui/QuickToggleBar.tsx", "utf8");
  const css = readFileSync("src/ui/quickToggleBar.css", "utf8");
  assert.equal(app.match(/<QuickToggleBar\b/g)?.length, 1);
  for (const label of ["Membrane", "Motion", "Magnet", "Grid", "Shadow"]) assert.match(source, new RegExp(`ariaLabel="${label}"`));
  assert.match(source, /aria-label="Canvas quick controls"/);
  assert.match(source, /data-tooltip="Controls"/);
  assert.doesNotMatch(source, /title=/);
  assert.doesNotMatch(source, />LIVE<|<span>LIVE<|label="MEMBRANE"|label="MOTION"|label="GRID"|label="SHADOW"/);
  assert.match(source, /SlidersHorizontal/);
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /settings\.showGrid/);
  assert.match(source, /settings\.blobOn/);
  assert.match(source, /state\.settings\.organism/);
  assert.match(source, /settings\.cellShadow/);
  assert.match(source, /Magnetic snapping arrives in M3C/);
  assert.doesNotMatch(source, /magnetEnabled|snappingEnabled\s*=|useState\([^)]*magnet/i);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /top:/);
  assert.match(css, /right:/);
  assert.match(css, /font-weight:\s*400/);
  assert.doesNotMatch(css, /box-shadow:(?!\s*none)/);
  const tokens = readFileSync("src/styles/tokens.css", "utf8");
  const shell = readFileSync("src/ui/shell.css", "utf8");
  assert.match(tokens, /--shell-top-control-offset:\s*var\(--sp-24\)/);
  assert.match(tokens, /--shell-top-control-height:/);
  assert.match(tokens, /--shell-top-control-radius:/);
  assert.match(shell, /\.view-toggle\s*\{[\s\S]*?top:\s*var\(--shell-top-control-offset\)/);
  assert.match(css, /top:\s*var\(--shell-top-control-offset\)/);
  assert.match(css, /height:\s*var\(--shell-top-control-height\)/);
  assert.match(css, /border-radius:\s*var\(--shell-top-control-radius\)/);
});

test("Organism membrane target scales independently while presentation stays full resolution", () => {
  const source = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  assert.match(source, /resolveOrganismPixelRatio/);
  assert.match(source, /effectiveRenderScale/);
  assert.match(source, /presentationPixelRatio/);
  assert.match(source, /renderer\?\.resizeTarget\(w, h, effectivePixelRatio\)/);
  assert.doesNotMatch(source, /presentationCanvas\.width\s*=\s*Math\.max\(1, Math\.round\(w \* effectivePixelRatio\)\)/);
  assert.match(source, /data-preview-filter/);
});

test("Membrane OFF and Classic mode hard-gate the Organism runtime", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  const shader = readFileSync("src/experiments/organism-lab/organism-shader.ts", "utf8");
  assert.match(app, /rendererMode === "organism" \? <OrganismCanvasView \/> : <CanvasView \/>/);
  assert.match(organism, /const shouldRenderMembrane = gates\.membrane[\s\S]*?if \(shouldRenderMembrane\)[\s\S]*?renderer\?\.render\(frame\)/);
  assert.match(organism, /renderer\?\.clear/);
  assert.match(organism, /membraneTurnedOff[\s\S]*?surfaceNeedsClear\s*=\s*true/);
  assert.match(organism, /gates\.membrane\s*&&\s*\(membraneNeedsRender/);
  assert.match(shader, /clear\(\):\s*void/);
  assert.doesNotMatch(readFileSync("src/canvas/CanvasView.tsx", "utf8"), /resolveOrganismPixelRatio|previewMode|previewFilter/);
});

test("Motion quick control preserves authored amounts and the legacy widget uses motionEnabled", () => {
  const quick = readFileSync("src/ui/QuickToggleBar.tsx", "utf8");
  const organismWidget = readFileSync("src/ui/widgets/OrganismWidget.tsx", "utf8");
  assert.match(quick, /motionEnabled:\s*!organism\.motionEnabled/);
  assert.doesNotMatch(quick, /drift:\s*0|breathing:\s*0|wobble:\s*0/);
  assert.match(organismWidget, /const motionOn = organism\.motionEnabled/);
  assert.match(organismWidget, /motionEnabled:\s*!organism\.motionEnabled/);
  assert.doesNotMatch(organismWidget, /drift:\s*0,\s*breathing:\s*0,\s*wobble:\s*0/);
});

test("Shadow quick control and detailed controls share the canonical enabled master", () => {
  const quick = readFileSync("src/ui/QuickToggleBar.tsx", "utf8");
  const details = readFileSync("src/ui/widgets/AppearanceSettingsWidgets.tsx", "utf8");
  const display = readFileSync("src/ui/widgets/DisplayWidget.tsx", "utf8");
  assert.match(quick, /enabled:\s*!authoredShadowOn/);
  assert.match(quick, /mode:\s*authoredShadowOn \? cellShadow\.mode/);
  assert.match(details, /mode === "off"[\s\S]*?\? \{ enabled: false \}/);
  assert.match(details, /value=\{shadow\.enabled \? shadow\.mode : "off"\}/);
  assert.match(display, /value=\{cellShadow\.enabled \? cellShadow\.mode : "off"\}/);
});

test("Runtime Status removes the Classic pressure recommendation", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  assert.doesNotMatch(source, /ORGANISM UNDER PRESSURE|Classic is recommended|SWITCH TO CLASSIC|isOrganismUnderPressure/);
});

test("selected appearance previews use local projection and invalidation paths", () => {
  const store = readFileSync("src/state/store.ts", "utf8");
  const presentation = readFileSync("src/canvas/presentationLayers.ts", "utf8");
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  const controls = readFileSync("src/ui/widgets/controls.tsx", "utf8");
  assert.match(store, /appearancePreviewIds/);
  assert.match(store, /appearancePreviewTarget/);
  assert.match(presentation, /patchRuntimePresentation/);
  assert.match(organism, /CELL_PRESENTATION/);
  assert.match(organism, /MEMBRANE_FIELD/);
  assert.match(organism, /patchRuntimePresentation/);
  assert.match(organism, /appearancePreviewTarget === "boundary" \|\| s\.appearancePreviewTarget === "core"/);
  assert.match(controls, /requestAnimationFrame/);
  assert.match(controls, /cancelAnimationFrame/);
  assert.doesNotMatch(controls, /setInterval/);
});

test("Runtime Status keeps one panel and no Bot", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  assert.equal(source.match(/className="runtime-status-bar glass"/g)?.length, 1);
  assert.doesNotMatch(source, /runtime-bot|MOOORF Bot/i);
  assert.doesNotMatch(css, /runtime-bot|bot-ring|bot-count/i);
});

test("Runtime Status keeps normal-weight status text", () => {
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  for (const selector of [
    ".runtime-status-bar",
    ".runtime-status-compact",
    ".runtime-status-details small",
    ".runtime-status-value",
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(css, new RegExp(`${escaped}\\s*\\{[\\s\\S]*?font-weight:\\s*400`));
  }
});

test("both renderers consume one shared effective profile", () => {
  for (const file of ["src/canvas/CanvasView.tsx", "src/canvas/OrganismCanvasView.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /performanceGovernor\.subscribe/, file);
    assert.match(source, /resolveLivePerformanceSettings/, file);
    assert.equal(source.match(/createDemandFrameLoop\(/g)?.length, 1, file);
    assert.doesNotMatch(source, /performanceRuntime\.subscribe/, file);
  }
});

test("Organism quality changes resize the existing renderer without adding a loop", () => {
  const source = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  assert.match(source, /resolveOrganismPixelRatio\([\s\S]*?settings\.performanceQuality,[\s\S]*?effectiveRenderScale/);
  assert.match(source, /if \(qualityChanged \|\| previewScaleChanged\) resizeTarget\(\);/);
  assert.equal(source.match(/createDemandFrameLoop\(/g)?.length, 1);
  assert.doesNotMatch(source, /setSettings\(\{ rendererMode: "classic" \}\)/);
});

test("Governor FPS publications cannot invalidate either Canvas while quality is unchanged", () => {
  const classic = readFileSync("src/canvas/CanvasView.tsx", "utf8");
  assert.match(classic, /if \(nextSettings\.performanceQuality === settings\.performanceQuality\) return;[\s\S]*?settings = nextSettings;[\s\S]*?invalidate\(\);/);
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  assert.match(organism, /if \(!qualityChanged && !previewScaleChanged && !filterChanged\) return;/);
  assert.match(organism, /if \(qualityChanged \|\| previewScaleChanged\) resizeTarget\(\);/);
});

test("PF1A static Organism behavior remains protected", () => {
  const resolver = readFileSync("src/canvas/organismProductionSettings.ts", "utf8");
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  assert.match(resolver, /o\.motionEnabled\s*&&\s*o\.idleMotion/);
  assert.match(organism, /if \(resolved\.motionActive\) advanceMotion/);
  assert.match(organism, /renderLoop\.setContinuous\(resolved\.motionActive\)/);
});

test("background export never mutates or waits on the live preview store", () => {
  const composite = readFileSync("src/export/canvasComposite.ts", "utf8");
  const capture = readFileSync("src/canvas/exportCapture.ts", "utf8");
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  assert.match(composite, /createCanvasExportSnapshot/);
  assert.doesNotMatch(composite, /useLab\.setState|appearancePreview|presentationDefaultsPreview|membraneRuntimePreview|visualSettingsPreview|resourcesPreview/);
  assert.doesNotMatch(composite, /requestAnimationFrame/);
  assert.match(capture, /snapshot:\s*CanvasExportSnapshot/);
  assert.match(organism, /renderDetachedOrganismExport/);
  assert.doesNotMatch(organism, /pendingCapture|captureWebglFrame|CAPTURE_TIMEOUT_MS/);
});

test("Organism export owns and disposes one detached renderer", () => {
  const source = readFileSync("src/export/organismExport.ts", "utf8");
  assert.match(source, /document\.createElement\("canvas"\)/);
  assert.match(source, /createOrganismRenderer\(renderSurface\)/);
  assert.equal((source.match(/renderer\.render\(/g) ?? []).length, 1);
  assert.match(source, /finally\s*\{[\s\S]*renderer\?\.dispose\(\)/);
  assert.doesNotMatch(source, /querySelector|canvasRef|organism-canvas-host|registerCanvasCapture/);
});

test("preview quality resizes only the internal Organism target", () => {
  const shader = readFileSync("src/experiments/organism-lab/organism-shader.ts", "utf8");
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  assert.match(shader, /createFramebuffer\(/);
  assert.match(shader, /blitFramebuffer\(/);
  assert.match(shader, /resizeTarget\(cssWidth:\s*number,\s*cssHeight:\s*number,\s*dpr:\s*number\)/);
  assert.match(organism, /renderer\?\.resizeTarget\(w, h, effectivePixelRatio\)/);
  assert.doesNotMatch(organism, /if \(qualityChanged \|\| previewScaleChanged\) resize\(\);/);
});

test("selection and theme preserve the completed visible Organism frame", () => {
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  const shader = readFileSync("src/experiments/organism-lab/organism-shader.ts", "utf8");
  assert.match(organism, /selectionChanged \? "LABEL_PRESENTATION" : null/);
  assert.doesNotMatch(organism, /selectionChanged[\s\S]{0,180}beginInteraction/);
  assert.match(shader, /preserveDrawingBuffer:\s*false/);
  assert.match(shader, /present\(\):\s*void/);
  assert.match(shader, /previousFramebuffer\s*=\s*targetFramebuffer/);
  assert.match(shader, /bindFramebuffer\(gl\.READ_FRAMEBUFFER, previousFramebuffer\)/);
  assert.match(organism, /renderer\?\.present\(\)/);
  assert.match(organism, /presentationBackCanvasRef/);
  assert.match(organism, /stagingPresentationCanvas\.style\.visibility\s*=\s*"visible"/);
  assert.match(organism, /activePresentationCanvas\.style\.visibility\s*=\s*"hidden"/);
  assert.match(organism, /if \(!settings\.blobOn\) surfaceNeedsClear = true/);
  assert.match(organism, /renderer\?\.clear\(\)/);
  assert.match(organism, /THEME_TRANSITION_MS\s*=\s*200/);
  assert.match(organism, /themeTransitionUntil/);
  assert.match(organism, /dataset\.visibleResizeCount/);
  assert.match(organism, /dataset\.rendererCreateCount/);
});

test("Organism presents a transparent single-sample membrane over the canonical theme background", () => {
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  const shader = readFileSync("src/experiments/organism-lab/organism-shader.ts", "utf8");
  const css = readFileSync("src/canvas/organismCanvas.css", "utf8");

  assert.match(css, /\.organism-canvas-host\s*\{[\s\S]*?background:\s*var\(--bg\)/);
  assert.match(css, /\.organism-canvas\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(shader, /alpha:\s*true/);
  assert.match(shader, /antialias:\s*false/);
  assert.match(shader, /premultipliedAlpha:\s*false/);
  assert.match(shader, /gl\.disable\(gl\.BLEND\)/);
  assert.match(shader, /outColor\s*=\s*vec4\(col,\s*surfaceAlpha\)/);
  assert.match(shader, /clearColor\(0,\s*0,\s*0,\s*0\)/);
  assert.match(shader, /drawArrays\([\s\S]*?presentTarget\(\)/);
  assert.match(organism, /renderer\?\.clear\(\)/);
  assert.doesNotMatch(organism, /disabledMembraneGround/);
});

test("Membrane redraw and preview-quality changes keep the existing stable renderer", () => {
  const organism = readFileSync("src/canvas/OrganismCanvasView.tsx", "utf8");
  const shader = readFileSync("src/experiments/organism-lab/organism-shader.ts", "utf8");

  assert.match(organism, /membraneTurnedOff[\s\S]*?surfaceNeedsClear\s*=\s*true/);
  assert.match(organism, /const shouldRenderMembrane = gates\.membrane[\s\S]*?renderer\?\.render\(frame\)/);
  assert.match(organism, /if \(qualityChanged \|\| previewScaleChanged\) resizeTarget\(\);[\s\S]*?invalidate\(\)/);
  assert.match(shader, /previousFramebuffer[\s\S]*?blitFramebuffer\([\s\S]*?previousWidth[\s\S]*?nextWidth/);
  assert.equal(organism.match(/createOrganismRenderer\(canvas\)/g)?.length, 1);
});

test("Quick Bar position is independent of Inspector state", () => {
  const quick = readFileSync("src/ui/QuickToggleBar.tsx", "utf8");
  const css = readFileSync("src/ui/quickToggleBar.css", "utf8");

  assert.doesNotMatch(quick, /inspectorOpen|data-inspector/);
  assert.doesNotMatch(css, /data-inspector|transition:\s*right/);
  assert.match(css, /\.live-toggle-bar\.glass\s*\{[\s\S]*?top:\s*var\(--shell-top-control-offset\);[\s\S]*?right:\s*var\(--sp-24\)/);
});

test("Quick Bar uses the shared Rail tooltip language without native titles", () => {
  const quick = readFileSync("src/ui/QuickToggleBar.tsx", "utf8");
  const shell = readFileSync("src/ui/shell.css", "utf8");
  for (const label of ["Controls", "Membrane", "Motion", "Magnet", "Grid", "Shadow"]) {
    assert.match(quick, new RegExp(`dataTooltip=\\"${label}\\"|data-tooltip=\\"${label}\\"`));
  }
  assert.doesNotMatch(quick, /title=/);
  assert.match(quick, /aria-disabled=\{disabled\}/);
  assert.doesNotMatch(quick, /\sdisabled=\{disabled\}/);
  assert.match(shell, /\.rail \.rail-btn::after,\s*\.live-toggle-tooltip::after/);
});

test("Performance widget keeps the approved minimal copy and equal preview layout", () => {
  const widget = readFileSync("src/ui/widgets/AdvancedWidget.tsx", "utf8");
  const registry = readFileSync("src/ui/panels/widgetRegistry.ts", "utf8");
  const css = readFileSync("src/ui/widgets/widgets.css", "utf8");
  assert.match(registry, /label:\s*"Performance"/);
  for (const title of ["PREVIEW", "BOOST", "FILTER", "STATUS", "CANVAS", "DEBUG"]) {
    assert.match(widget, new RegExp(`title=\\"${title}\\"`));
  }
  assert.match(widget, /id:\s*"ultra-fast",\s*label:\s*"ULTRA"/);
  assert.doesNotMatch(widget, /Organism membrane only|Canvas geometry and overlays stay full resolution|temporary 40%|Restores selected preview quality|live membrane upscale|CURRENT EFFECTIVE QUALITY|runtime only|diagnostics|field \+ nuclei|Experimental/);
  assert.match(css, /grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(widget, /title="DEBUG"/);
  assert.doesNotMatch(widget, /title="DEBUG"[^>]*defaultOpen/);
});

test("widget-owned control CSS stays in widgets.css", () => {
  const shell = readFileSync("src/ui/shell.css", "utf8");
  const widgets = readFileSync("src/ui/widgets/widgets.css", "utf8");
  const selectors = [
    ".org-sec + .org-sec",
    ".org-sec-headwrap",
    ".org-sec-head",
    ".org-sec-head:hover",
    ".org-sec-hint",
    ".org-chev",
    ".org-sec-body",
    ".org-slider-meta",
    ".org-slider-val",
    ".org-readout",
    ".org-readout-val",
    ".org-choice",
    ".org-choice:hover",
    ".org-choice-text",
    ".org-choice-name",
    ".org-choice-desc",
    ".arrange-panel",
    ".arrange-scope",
    ".arrange-category-tabs",
    ".arrange-search",
    ".arrange-pattern-grid",
    ".arrange-pattern",
    ".arrange-miniature",
    ".arrange-empty",
    ".arrange-selected-copy",
    ".arrange-signal",
    ".arrange-inline-control",
    ".arrange-seed",
    ".arrange-regenerate",
    ".arrange-status",
    ".arrange-actions",
    ".org-subcap",
    ".org-attach-chips",
    ".org-attach-hint",
    ".org-switch-row",
    ".org-switch",
    ".org-switch-thumb",
    ".org-adv-toggle",
    ".category-map-grid",
    ".category-token",
    ".category-token i",
    ".category-token span",
    ".pal-ramp",
    ".pal-ramp i",
    ".pal-custom",
    ".org-foot",
    ".org-reset",
  ];
  const countRule = (source: string, selector: string) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return source.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{`, "g"))?.length ?? 0;
  };
  for (const selector of selectors) {
    assert.equal(countRule(widgets, selector), 1, `widgets.css owns ${selector}`);
    assert.equal(countRule(shell, selector), 0, `shell.css does not own ${selector}`);
  }
  assert.match(widgets, /@media \(max-width: 480px\) \{\s*\.org-slider\s*\{/);
  assert.match(widgets, /\.org-foot\s*\{[\s\S]*?padding: 8px 10px 10px;[\s\S]*?\n\.org-foot--widget\s*\{/);
  assert.match(shell, /\.dock\s*\{/);
  assert.match(shell, /\.rail\s*\{/);
  assert.match(shell, /\.dock-merge input\[type="range"\],[\s\S]*?\.org-slider input\[type="range"\]/);
});
