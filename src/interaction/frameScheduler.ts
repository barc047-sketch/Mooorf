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

export const latestCoalescedPointerEvent = (event: PointerEvent): PointerEvent => {
  try {
    const samples = event.getCoalescedEvents?.() ?? [];
    return samples[samples.length - 1] ?? event;
  } catch {
    return event;
  }
};

