export interface FrameSchedulerOptions<T> {
  schedule: (callback: () => void) => number;
  cancel: (id: number) => void;
  process: (value: T) => void;
  merge?: (queued: T, incoming: T) => T;
}

export interface FrameScheduler<T> {
  push: (value: T) => void;
  flush: () => void;
  cancel: () => void;
}

export interface DemandFrameLoopOptions {
  schedule: (callback: (now: number) => void) => number;
  cancel: (id: number) => void;
  /** Return true only when interpolation or another bounded task needs a follow-up frame. */
  render: (now: number) => boolean;
}

export interface DemandFrameLoop {
  invalidate(): void;
  setContinuous(active: boolean): void;
  setPaused(paused: boolean): void;
  isPaused(): boolean;
  cancel(): void;
}

/** One canonical raw-input -> animation-frame boundary. The latest value wins
 * unless a caller supplies an accumulator (wheel zoom uses summed delta). */
export const createFrameScheduler = <T>({ schedule, cancel, process, merge }: FrameSchedulerOptions<T>): FrameScheduler<T> => {
  let queued: T | undefined;
  let frameId: number | null = null;

  const run = () => {
    frameId = null;
    if (queued === undefined) return;
    const value = queued;
    queued = undefined;
    process(value);
  };

  return {
    push(value) {
      queued = queued === undefined || !merge ? value : merge(queued, value);
      if (frameId === null) frameId = schedule(run);
    },
    flush() {
      if (frameId !== null) cancel(frameId);
      frameId = null;
      run();
    },
    cancel() {
      if (frameId !== null) cancel(frameId);
      frameId = null;
      queued = undefined;
    },
  };
};

/** One canonical dirty/continuous render scheduler. Idle canvases own no rAF;
 * invalidation, bounded interpolation, or explicit Motion wakes one frame. */
export const createDemandFrameLoop = ({
  schedule,
  cancel,
  render,
}: DemandFrameLoopOptions): DemandFrameLoop => {
  let frameId: number | null = null;
  let invalidated = false;
  let continuous = false;
  let paused = false;
  let cancelled = false;

  const request = () => {
    if (cancelled || paused || frameId !== null) return;
    frameId = schedule(run);
  };

  const run = (now: number) => {
    frameId = null;
    if (cancelled || paused) return;
    invalidated = false;
    let needsAnotherFrame: boolean;
    try {
      needsAnotherFrame = render(now);
    } catch {
      invalidated = true;
      return;
    }
    if (invalidated || continuous || needsAnotherFrame) request();
  };

  return {
    invalidate() {
      if (cancelled) return;
      invalidated = true;
      request();
    },
    setContinuous(active) {
      if (cancelled) return;
      continuous = active;
      if (active) request();
    },
    setPaused(active) {
      if (cancelled || paused === active) return;
      paused = active;
      if (paused) {
        if (frameId !== null) {
          cancel(frameId);
          frameId = null;
          invalidated = true;
        }
        return;
      }
      if (invalidated || continuous) request();
    },
    isPaused() {
      return !cancelled && paused;
    },
    cancel() {
      if (cancelled) return;
      cancelled = true;
      invalidated = false;
      continuous = false;
      paused = false;
      if (frameId !== null) cancel(frameId);
      frameId = null;
    },
  };
};

export const latestCoalescedPointerEvent = (event: PointerEvent): PointerEvent => {
  try {
    const samples = event.getCoalescedEvents?.() ?? [];
    return samples[samples.length - 1] ?? event;
  } catch {
    return event;
  }
};
