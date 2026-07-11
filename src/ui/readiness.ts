export type StartupMilestone =
  | "shell-start"
  | "store-restored"
  | "fonts-ready"
  | "canvas-mounted"
  | "renderer-ready"
  | "render-requested"
  | "ready";

export const READINESS_PROGRESS: Record<StartupMilestone, number> = {
  "shell-start": 0,
  "store-restored": 16,
  "fonts-ready": 34,
  "canvas-mounted": 58,
  "renderer-ready": 82,
  "render-requested": 96,
  ready: 100,
};

export const readinessCanAdvance = (
  current: StartupMilestone,
  next: StartupMilestone
): boolean => READINESS_PROGRESS[next] > READINESS_PROGRESS[current];
