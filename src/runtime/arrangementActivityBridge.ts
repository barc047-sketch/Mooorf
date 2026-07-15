import type { ActivityService } from "./activityRuntime";

export interface ArrangementStatusLike {
  phase: "idle" | "calculating" | "ready" | "error";
  requestId: number;
  entityCount: number;
  error: string | null;
}

export interface ArrangementRuntimeLike {
  subscribe: (listener: () => void) => () => void;
  getStatus: () => ArrangementStatusLike;
  cancel: () => void;
}

export const createArrangementActivityBridge = (
  runtime: ArrangementRuntimeLike,
  activityService: ActivityService,
): (() => void) => {
  let activeTaskId: string | null = null;
  const notifiedReady = new Set<number>();

  const sync = () => {
    const status = runtime.getStatus();
    if (status.phase === "calculating") {
      const taskId = `arrangement:${status.requestId}`;
      if (activeTaskId && activeTaskId !== taskId) activityService.remove(activeTaskId);
      activeTaskId = taskId;
      activityService.start({
        id: taskId,
        label: `Arranging ${status.entityCount} Cells`,
        kind: "compute",
        priority: 60,
        progress: null,
        cancellable: true,
        onCancel: runtime.cancel,
      });
      return;
    }

    if (status.phase === "ready") {
      const taskId = `arrangement:${status.requestId}`;
      const message = notifiedReady.has(status.requestId) ? undefined : "Arrangement preview ready";
      notifiedReady.add(status.requestId);
      activityService.complete(taskId, message);
      if (activeTaskId === taskId) activeTaskId = null;
      return;
    }

    if (status.phase === "error") {
      const taskId = `arrangement:${status.requestId}`;
      activityService.fail(taskId, status.error || "Arrangement failed");
      if (activeTaskId === taskId) activeTaskId = null;
      return;
    }

    if (activeTaskId) activityService.remove(activeTaskId);
    activeTaskId = null;
  };

  const unsubscribe = runtime.subscribe(sync);
  sync();
  return () => {
    unsubscribe();
    if (activeTaskId) activityService.remove(activeTaskId);
  };
};
