import {
  READINESS_PROGRESS,
  readinessCanAdvance,
  type StartupMilestone,
} from "./readiness";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};

const ordered: StartupMilestone[] = [
  "shell-start",
  "store-restored",
  "fonts-ready",
  "canvas-mounted",
  "renderer-ready",
  "render-requested",
  "ready",
];

equal(READINESS_PROGRESS[ordered[0]], 0, "first visible milestone is 00");
equal(READINESS_PROGRESS[ordered[ordered.length - 1]], 100, "usable frame is exactly 100");
equal(readinessCanAdvance("fonts-ready", "canvas-mounted"), true, "real milestones advance");
equal(readinessCanAdvance("renderer-ready", "canvas-mounted"), false, "late events cannot regress progress");
equal(readinessCanAdvance("ready", "renderer-ready"), false, "readiness cannot replay after completion");

console.info("readiness contracts passed");
