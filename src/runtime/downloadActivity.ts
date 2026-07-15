import { activity, type ActivityService } from "./activityRuntime";

export const DOWNLOAD_FEEDBACK_MIN_MS = 1_100;
let downloadSequence = 0;

export interface DownloadFeedbackOptions {
  activityService?: ActivityService;
  now?: () => number;
  wait?: (milliseconds: number) => Promise<void>;
  minimumDurationMs?: number;
}

export interface DownloadFeedback {
  taskId: string;
  complete: (startBrowserDownload: () => void | Promise<void>) => Promise<void>;
  fail: (error: unknown) => void;
}

export const announceDownloadStarted = (
  filename: string,
  activityService: ActivityService = activity,
): void => {
  activityService.notify({
    message: `Download started — ${filename}`,
    kind: "download",
  });
};

export const createDownloadFeedback = (
  filename: string,
  {
    activityService = activity,
    now = () => performance.now(),
    wait = (milliseconds) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds)),
    minimumDurationMs = DOWNLOAD_FEEDBACK_MIN_MS,
  }: DownloadFeedbackOptions = {},
): DownloadFeedback => {
  downloadSequence += 1;
  const taskId = `download:${downloadSequence}`;
  const startedAt = now();
  const minimumDuration = Math.max(0, minimumDurationMs);
  let settled = false;

  activityService.start({
    id: taskId,
    label: "Preparing download",
    kind: "download",
    priority: 30,
    progress: null,
    cancellable: false,
  });

  return {
    taskId,
    async complete(startBrowserDownload) {
      if (settled) return;
      const remaining = Math.max(0, minimumDuration - (now() - startedAt));
      if (remaining > 0) await wait(remaining);
      try {
        await startBrowserDownload();
        settled = true;
        activityService.complete(taskId, `Download started — ${filename}`);
      } catch (error) {
        settled = true;
        activityService.fail(taskId, error instanceof Error ? error.message : "Download could not be started");
        throw error;
      }
    },
    fail(error) {
      if (settled) return;
      settled = true;
      activityService.fail(taskId, error instanceof Error ? error.message : "Download could not be prepared");
    },
  };
};
