import type { RendererMode } from "../types";

export interface FrameReport {
  renderer: RendererMode;
  timestamp: number;
  visibleCells: number;
  totalCells: number;
}

export interface PerformanceSnapshot {
  idle: boolean;
  fps: number | null;
  averageFrameTime: number | null;
  renderer: RendererMode | null;
  visibleCells: number;
  totalCells: number;
  sampleCount: number;
}

export interface PerformanceRuntime {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PerformanceSnapshot;
  reportFrame: (report: FrameReport) => void;
  destroy: () => void;
}

export interface PerformanceRuntimeOptions {
  now?: () => number;
  setTimer?: (callback: () => void, delay: number) => number;
  clearTimer?: (id: number) => void;
  isDocumentHidden?: () => boolean;
  publishIntervalMs?: number;
  idleAfterMs?: number;
  maxSamples?: number;
}

const INITIAL_SNAPSHOT: PerformanceSnapshot = {
  idle: true,
  fps: null,
  averageFrameTime: null,
  renderer: null,
  visibleCells: 0,
  totalCells: 0,
  sampleCount: 0,
};

export const createPerformanceRuntime = ({
  now = () => performance.now(),
  setTimer = (callback, delay) => globalThis.setTimeout(callback, delay) as unknown as number,
  clearTimer = (id) => globalThis.clearTimeout(id),
  isDocumentHidden = () => typeof document !== "undefined" && document.hidden,
  publishIntervalMs = 250,
  idleAfterMs = 900,
  maxSamples = 90,
}: PerformanceRuntimeOptions = {}): PerformanceRuntime => {
  const listeners = new Set<() => void>();
  const samples: number[] = [];
  let snapshot = INITIAL_SNAPSHOT;
  let renderer: RendererMode | null = null;
  let visibleCells = 0;
  let totalCells = 0;
  let lastTimestamp: number | null = null;
  let lastFrameAt: number | null = null;
  let lastPublishedTimestamp = Number.NEGATIVE_INFINITY;
  let idleTimer: number | null = null;
  let destroyed = false;

  const publish = (idle: boolean) => {
    if (destroyed) return;
    const averageFrameTime = samples.length > 0
      ? samples.reduce((sum, sample) => sum + sample, 0) / samples.length
      : null;
    snapshot = {
      idle,
      fps: idle || averageFrameTime === null ? null : 1000 / averageFrameTime,
      averageFrameTime: idle ? null : averageFrameTime,
      renderer,
      visibleCells,
      totalCells,
      sampleCount: samples.length,
    };
    listeners.forEach((listener) => listener());
  };

  const checkIdle = () => {
    idleTimer = null;
    if (lastFrameAt === null || destroyed) return;
    const remaining = idleAfterMs - (now() - lastFrameAt);
    if (remaining > 0) {
      idleTimer = setTimer(checkIdle, remaining);
      return;
    }
    samples.length = 0;
    lastTimestamp = null;
    lastFrameAt = null;
    publish(true);
  };

  const scheduleIdleCheck = () => {
    if (idleTimer !== null || destroyed) return;
    idleTimer = setTimer(checkIdle, idleAfterMs);
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    reportFrame(report) {
      if (destroyed) return;
      if (isDocumentHidden()) {
        lastTimestamp = null;
        return;
      }

      if (renderer !== report.renderer || snapshot.idle) {
        samples.length = 0;
        lastTimestamp = null;
      }
      renderer = report.renderer;
      visibleCells = Math.max(0, Math.round(report.visibleCells));
      totalCells = Math.max(visibleCells, Math.round(report.totalCells));

      if (lastTimestamp !== null) {
        const duration = report.timestamp - lastTimestamp;
        if (duration > 0 && duration <= idleAfterMs) {
          samples.push(duration);
          if (samples.length > maxSamples) samples.shift();
        }
      }
      lastTimestamp = report.timestamp;
      lastFrameAt = now();
      scheduleIdleCheck();

      if (report.timestamp - lastPublishedTimestamp >= Math.max(0, publishIntervalMs)) {
        lastPublishedTimestamp = report.timestamp;
        publish(false);
      }
    },
    destroy() {
      destroyed = true;
      if (idleTimer !== null) clearTimer(idleTimer);
      idleTimer = null;
      listeners.clear();
    },
  };
};

export const performanceRuntime = createPerformanceRuntime();
