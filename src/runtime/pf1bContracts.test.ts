import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { createArrangementActivityBridge, type ArrangementRuntimeLike } from "./arrangementActivityBridge";
import {
  createActivityService,
  selectActivityMessage,
  type ActivityService,
} from "./activityRuntime";
import { createDownloadFeedback } from "./downloadActivity";
import { createPerformanceRuntime } from "./performanceRuntime";

const task = (id: string, priority = 1, progress: number | null = null) => ({
  id,
  label: `Task ${id}`,
  kind: "compute" as const,
  priority,
  progress,
  cancellable: false,
});

test("activity IDs deduplicate", () => {
  const service = createActivityService({ now: () => 10 });
  service.start(task("same"));
  service.start({ ...task("same"), label: "Updated" });
  assert.equal(service.getSnapshot().tasks.length, 1);
  assert.equal(service.getSnapshot().tasks[0]?.label, "Updated");
});

test("activity progress clamps to 0–1", () => {
  const service = createActivityService();
  service.start(task("low", 1, -2));
  service.start(task("high", 1, 4));
  assert.equal(service.getSnapshot().tasks.find(({ id }) => id === "low")?.progress, 0);
  assert.equal(service.getSnapshot().tasks.find(({ id }) => id === "high")?.progress, 1);
});

test("highest priority active task wins", () => {
  const service = createActivityService();
  service.start(task("low", 1));
  service.start(task("high", 50));
  assert.equal(service.getSnapshot().activeTask?.id, "high");
});

test("only one visible activity message is selected", () => {
  const service = createActivityService();
  service.notify({ id: "first", message: "First", kind: "warning" });
  service.notify({ id: "second", message: "Second", kind: "error" });
  assert.equal(selectActivityMessage(service.getSnapshot())?.message, "First");
  service.start(task("active", 3, 0.5));
  assert.deepEqual(selectActivityMessage(service.getSnapshot()), {
    id: "active",
    kind: "compute",
    message: "Task active · 50%",
    source: "task",
  });
});

test("notification queue is bounded and equivalent messages deduplicate", () => {
  const service = createActivityService({ maxNotifications: 3 });
  service.notify({ message: "Same", kind: "warning" });
  service.notify({ message: "Same", kind: "warning" });
  service.notify({ message: "Two", kind: "warning" });
  service.notify({ message: "Three", kind: "warning" });
  service.notify({ message: "Four", kind: "warning" });
  assert.deepEqual(service.getSnapshot().notifications.map(({ message }) => message), ["Two", "Three", "Four"]);
});

test("complete, fail and cancel transitions remove tasks and preserve truthful events", () => {
  const service = createActivityService();
  let cancelled = 0;
  service.start(task("complete"));
  service.complete("complete", "Ready");
  service.start(task("failed"));
  service.fail("failed", "Failed truthfully");
  service.start({ ...task("cancelled"), cancellable: true, onCancel: () => { cancelled += 1; } });
  service.cancel("cancelled");
  assert.equal(service.getSnapshot().tasks.length, 0);
  assert.equal(cancelled, 1);
  assert.deepEqual(service.getSnapshot().notifications.map(({ message }) => message), ["Ready", "Failed truthfully"]);
});

const arrangementHarness = (service: ActivityService) => {
  let status: {
    phase: "calculating" | "ready" | "error" | "idle";
    requestId: number;
    entityCount: number;
    error: string | null;
  } = { phase: "idle", requestId: 0, entityCount: 0, error: null };
  let listener = () => {};
  let cancelCalls = 0;
  const runtime: ArrangementRuntimeLike = {
    getStatus: () => status,
    subscribe: (next) => {
      listener = next;
      return () => { listener = () => {}; };
    },
    cancel: () => { cancelCalls += 1; },
  };
  const stop = createArrangementActivityBridge(runtime, service);
  return {
    emit: (next: typeof status) => { status = next; listener(); },
    cancelCalls: () => cancelCalls,
    stop,
  };
};

test("Arrangement calculating creates the correct task label", () => {
  const service = createActivityService();
  const harness = arrangementHarness(service);
  harness.emit({ phase: "calculating", requestId: 7, entityCount: 300, error: null });
  assert.equal(service.getSnapshot().activeTask?.id, "arrangement:7");
  assert.equal(service.getSnapshot().activeTask?.label, "Arranging 300 Cells");
  assert.equal(service.getSnapshot().activeTask?.cancellable, true);
  harness.stop();
});

test("Arrangement ready produces one completion notification per request", () => {
  const service = createActivityService();
  const harness = arrangementHarness(service);
  harness.emit({ phase: "calculating", requestId: 8, entityCount: 100, error: null });
  harness.emit({ phase: "ready", requestId: 8, entityCount: 100, error: null });
  harness.emit({ phase: "ready", requestId: 8, entityCount: 100, error: null });
  assert.deepEqual(service.getSnapshot().notifications.map(({ message }) => message), ["Arrangement preview ready"]);
  harness.stop();
});

test("Arrangement cancellation calls the existing runtime", () => {
  const service = createActivityService();
  const harness = arrangementHarness(service);
  harness.emit({ phase: "calculating", requestId: 9, entityCount: 80, error: null });
  service.cancel("arrangement:9");
  assert.equal(harness.cancelCalls(), 1);
  harness.stop();
});

test("instant downloads show indeterminate preparation for at least 1100ms", async () => {
  const service = createActivityService();
  let now = 100;
  let waited = 0;
  const order: string[] = [];
  const feedback = createDownloadFeedback("project.png", {
    activityService: service,
    now: () => now,
    wait: async (milliseconds) => {
      waited += milliseconds;
      now += milliseconds;
      order.push("wait");
    },
  });
  assert.equal(service.getSnapshot().activeTask?.label, "Preparing download");
  assert.equal(service.getSnapshot().activeTask?.kind, "download");
  assert.equal(service.getSnapshot().activeTask?.progress, null);
  await feedback.complete(() => { order.push("download"); });
  assert.match(readFileSync("src/runtime/downloadActivity.ts", "utf8"), /export const DOWNLOAD_FEEDBACK_MIN_MS = 1_100/);
  assert.equal(waited, 1_100);
  assert.deepEqual(order, ["wait", "download"]);
  const message = service.getSnapshot().notifications[0]?.message ?? "";
  assert.equal(message, "Download started — project.png");
  assert.equal(message.includes("Downloaded"), false);
});

test("real preparation longer than 1100ms adds no download delay", async () => {
  const service = createActivityService();
  let now = 0;
  let waited = 0;
  const feedback = createDownloadFeedback("project.pdf", {
    activityService: service,
    now: () => now,
    wait: async (milliseconds) => { waited += milliseconds; },
  });
  now = 1_200;
  let started = false;
  await feedback.complete(() => { started = true; });
  assert.equal(waited, 0);
  assert.equal(started, true);
});

test("download feedback stays indeterminate and owns no interval loop", () => {
  const source = readFileSync("src/runtime/downloadActivity.ts", "utf8");
  assert.match(source, /progress:\s*null/);
  assert.doesNotMatch(source, /setInterval|progress:\s*[0-9]/);
});

test("failed preparation clears its download task truthfully", () => {
  const service = createActivityService();
  const feedback = createDownloadFeedback("project.pdf", { activityService: service });
  feedback.fail(new Error("PDF renderer unavailable"));
  assert.equal(service.getSnapshot().tasks.length, 0);
  assert.equal(service.getSnapshot().notifications[0]?.message, "PDF renderer unavailable");
  assert.equal(service.getSnapshot().notifications[0]?.kind, "error");
});

test("canonical exports start feedback before preparation and clear it on errors", () => {
  const source = readFileSync("src/export/exportService.ts", "utf8");
  assert.match(source, /withDownloadFeedback/);
  assert.match(source, /feedback\.fail\(/);
  assert.doesNotMatch(source, /announceDownloadStarted/);
});

test("architectural scale UI, responsive wiring and unused PF1B utility are removed", () => {
  const component = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  assert.doesNotMatch(component, /architecturalScale|Architectural scale|scaleLayout|runtime-scale|runtime-architectural-scale/);
  assert.doesNotMatch(css, /runtime-scale|runtime-architectural-scale|data-layout/);
  assert.equal(existsSync("src/runtime/architecturalScale.ts"), false);
});

const fakeClock = () => {
  let time = 0;
  let nextId = 1;
  const timers = new Map<number, { at: number; run: () => void }>();
  const flush = () => {
    let due = [...timers].filter(([, timer]) => timer.at <= time).sort((a, b) => a[1].at - b[1].at);
    while (due.length > 0) {
      for (const [id, timer] of due) {
        timers.delete(id);
        timer.run();
      }
      due = [...timers].filter(([, timer]) => timer.at <= time).sort((a, b) => a[1].at - b[1].at);
    }
  };
  return {
    now: () => time,
    set: (run: () => void, delay: number) => {
      const id = nextId++;
      timers.set(id, { at: time + delay, run });
      return id;
    },
    clear: (id: number) => { timers.delete(id); },
    advance: (milliseconds: number) => { time += milliseconds; flush(); },
    pending: () => timers.size,
  };
};

test("performance sampler creates no requestAnimationFrame loop", () => {
  const source = readFileSync("src/runtime/performanceRuntime.ts", "utf8");
  assert.equal(source.includes("requestAnimationFrame"), false);
});

test("frame reports publish at no more than four times per second", () => {
  const clock = fakeClock();
  const runtime = createPerformanceRuntime({
    now: clock.now,
    setTimer: clock.set,
    clearTimer: clock.clear,
    publishIntervalMs: 250,
  });
  let publishes = 0;
  runtime.subscribe(() => { publishes += 1; });
  for (let timestamp = 0; timestamp <= 1_000; timestamp += 10) {
    clock.advance(timestamp - clock.now());
    runtime.reportFrame({ renderer: "classic", timestamp, visibleCells: 20, totalCells: 20 });
  }
  assert.ok(publishes <= 5, `published ${publishes} times`);
  runtime.destroy();
});

test("performance inactivity resolves to IDLE without a permanent timer", () => {
  const clock = fakeClock();
  const runtime = createPerformanceRuntime({ now: clock.now, setTimer: clock.set, clearTimer: clock.clear, idleAfterMs: 800 });
  runtime.reportFrame({ renderer: "classic", timestamp: 0, visibleCells: 20, totalCells: 20 });
  runtime.reportFrame({ renderer: "classic", timestamp: 16, visibleCells: 20, totalCells: 20 });
  clock.advance(900);
  assert.equal(runtime.getSnapshot().idle, true);
  assert.equal(clock.pending(), 0);
  runtime.destroy();
});

test("hidden-document samples do not corrupt FPS", () => {
  const clock = fakeClock();
  let hidden = false;
  const runtime = createPerformanceRuntime({ now: clock.now, setTimer: clock.set, clearTimer: clock.clear, isDocumentHidden: () => hidden, publishIntervalMs: 0 });
  runtime.reportFrame({ renderer: "classic", timestamp: 0, visibleCells: 4, totalCells: 4 });
  hidden = true;
  runtime.reportFrame({ renderer: "classic", timestamp: 10_000, visibleCells: 4, totalCells: 4 });
  hidden = false;
  runtime.reportFrame({ renderer: "classic", timestamp: 10_016, visibleCells: 4, totalCells: 4 });
  runtime.reportFrame({ renderer: "classic", timestamp: 10_032, visibleCells: 4, totalCells: 4 });
  assert.ok((runtime.getSnapshot().fps ?? 0) > 50);
  runtime.destroy();
});

test("renderer changes reset the performance sample window", () => {
  const clock = fakeClock();
  const runtime = createPerformanceRuntime({ now: clock.now, setTimer: clock.set, clearTimer: clock.clear, publishIntervalMs: 0 });
  runtime.reportFrame({ renderer: "classic", timestamp: 0, visibleCells: 4, totalCells: 5 });
  runtime.reportFrame({ renderer: "classic", timestamp: 16, visibleCells: 4, totalCells: 5 });
  runtime.reportFrame({ renderer: "organism", timestamp: 32, visibleCells: 3, totalCells: 5 });
  assert.equal(runtime.getSnapshot().renderer, "organism");
  assert.equal(runtime.getSnapshot().sampleCount, 0);
  assert.equal(runtime.getSnapshot().fps, null);
  runtime.destroy();
});

test("root application shell mounts exactly one Runtime Status component", () => {
  const source = readFileSync("src/App.tsx", "utf8");
  assert.equal(source.match(/<RuntimeStatus\b/g)?.length, 1);
});

test("both renderers report existing frames without starting another loop", () => {
  for (const file of ["src/canvas/CanvasView.tsx", "src/canvas/OrganismCanvasView.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.equal(source.includes("performanceRuntime.reportFrame({"), true, file);
    assert.equal(source.match(/createDemandFrameLoop\(/g)?.length, 1, file);
  }
});

test("the edge activity line uses scaleX transform progress", () => {
  const source = readFileSync("src/ui/runtimeStatus.css", "utf8");
  assert.match(source, /transform:\s*scaleX\(var\(--runtime-progress\)\)/);
  assert.match(source, /transform-origin:\s*left/);
});

test("the edge activity line is a four-pixel theme-readable lightsaber", () => {
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  const tokens = readFileSync("src/styles/tokens.css", "utf8");
  assert.match(css, /\.runtime-edge-line\s*\{[\s\S]*?height:\s*4px/);
  assert.match(css, /\.runtime-edge-line-fill\s*\{[\s\S]*?box-shadow:\s*0\s+0/);
  assert.match(css, /\.runtime-edge-line-fill::after/);
  assert.match(tokens, /--runtime-activity-core:\s*#222222/);
  assert.match(tokens, /\[data-theme="night"\][\s\S]*?--runtime-activity-core:\s*#ffffff/);
  const nonLineGlow = css
    .split("\n")
    .filter((line) => /box-shadow:/.test(line) && !/box-shadow:\s*none/.test(line));
  assert.equal(nonLineGlow.length, 1);
});

test("indeterminate activity motion uses transform without animated blur", () => {
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  const scanKeyframes = css.match(/@keyframes runtime-edge-scan\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(scanKeyframes, /transform:/);
  assert.doesNotMatch(scanKeyframes, /(?:filter|blur|box-shadow):/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?runtime-edge-pulse/);
  assert.match(css, /@keyframes runtime-edge-pulse\s*\{[\s\S]*?opacity:/);
});

test("status and zoom controls share canonical shell geometry and glass", () => {
  const tokens = readFileSync("src/styles/tokens.css", "utf8");
  const shell = readFileSync("src/ui/shell.css", "utf8");
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  const component = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  for (const token of ["--shell-control-bottom", "--shell-control-height", "--shell-control-radius"]) {
    assert.equal(tokens.includes(token), true, token);
    assert.equal(shell.includes(`var(${token})`), true, `zoom ${token}`);
    assert.equal(css.includes(`var(${token})`), true, `status ${token}`);
  }
  assert.match(component, /className="runtime-status-bar glass"/);
  assert.match(component, /className="runtime-notification glass"/);
});

test("collapsed status height includes its glass keyline instead of exceeding the zoom control", () => {
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  assert.match(css, /\.runtime-status-bar\s*\{[\s\S]*?height:\s*var\(--shell-control-height\)/);
  assert.match(css, /\.runtime-status-bar\[data-expanded="true"\]\s*\{[\s\S]*?height:\s*auto/);
  assert.match(css, /\.runtime-status-toggle\s*\{[\s\S]*?height:\s*100%/);
});

test("constrained shell lift updates the shared bottom token for status and zoom together", () => {
  const shell = readFileSync("src/ui/shell.css", "utf8");
  const constrained = shell.match(/@media \(max-width: 1024px\) \{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(constrained, /:root\s*\{[\s\S]*?--shell-control-bottom:/);
  assert.doesNotMatch(constrained, /\.zoom-controls\s*\{[\s\S]*?bottom:/);
});

test("notification remains left-aligned above status", () => {
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  const notificationBlock = css.match(/\.runtime-notification \{\n  --runtime-status-left([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(notificationBlock, /left:\s*var\(--runtime-status-left\)/);
  assert.match(notificationBlock, /bottom:\s*calc\(var\(--shell-control-bottom\)/);
  assert.doesNotMatch(notificationBlock, /(?:margin-left|translateX)/);
});

test("the circular Runtime Bot is removed and one bottom-left status bar absorbs the HUD", () => {
  const component = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  const app = readFileSync("src/App.tsx", "utf8");
  assert.doesNotMatch(component, /runtime-bot|MOOORF Bot/i);
  assert.doesNotMatch(css, /runtime-bot|bot-ring|bot-count/i);
  assert.equal(app.match(/<RuntimeStatus\b/g)?.length, 1);
  assert.doesNotMatch(app, /<Hud\b/);
  assert.match(component, /className="runtime-status-bar glass"/);
  assert.match(css, /\.runtime-status-area\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?left:/);
});

test("status bar supports compact expansion and active-task priority", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /setExpanded\(\(value\) => !value\)/);
  assert.match(source, /activeTask\s*\?/);
  assert.match(source, /WORKING/);
  assert.match(source, /averageFrameTime/);
  assert.match(source, /visibleCells/);
  assert.match(source, /camera\.zoom|cameraZoom|zoom/);
});

test("all text inside the Runtime Status Bar uses normal weight", () => {
  const component = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  assert.doesNotMatch(component, /<b\b|<\/b>/);
  assert.match(component, /className="runtime-status-value"/);
  assert.match(css, /\.runtime-status-bar\s*\{[\s\S]*?font-weight:\s*400/);
  assert.match(css, /\.runtime-status-compact\s*\{[\s\S]*?font-weight:\s*400/);
  assert.match(css, /\.runtime-status-details small\s*\{[\s\S]*?font-weight:\s*400/);
  assert.match(css, /\.runtime-status-value\s*\{[\s\S]*?font-weight:\s*400/);
});

test("export activity uses the selected format name instead of a generic task", () => {
  const source = readFileSync("src/ui/widgets/ExportWidget.tsx", "utf8");
  assert.match(source, /Exporting PDF/);
  assert.match(source, /Exporting PNG/);
  assert.doesNotMatch(source, /label:\s*"Preparing export"/);
});

test("one glass notification tray sits above the status bar", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  assert.equal(source.match(/className="runtime-notification glass"/g)?.length, 1);
  assert.match(source, /notifications\[0\]/);
  assert.match(source, /aria-live="polite"/);
  assert.match(css, /\.runtime-notification\s*\{[\s\S]*?bottom:\s*calc\(/);
  assert.match(css, /\.runtime-notification[\s\S]*?box-shadow:\s*none/);
  assert.match(css, /@keyframes runtime-notification-in[\s\S]*?translateY\(10px\)/);
});

test("day/night glass and reduced-motion expansion remain supported", () => {
  const css = readFileSync("src/ui/runtimeStatus.css", "utf8");
  const shell = readFileSync("src/ui/shell.css", "utf8");
  assert.match(shell, /\.glass\s*\{[\s\S]*?backdrop-filter:\s*blur\(var\(--glass-blur\)\)/);
  assert.match(shell, /-webkit-backdrop-filter:/);
  assert.match(css, /box-shadow:\s*none/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /transition:\s*none/);
});

test("automatic performance quality uses the compact AUTO label", () => {
  const source = readFileSync("src/ui/RuntimeStatus.tsx", "utf8");
  assert.match(source, /performanceQuality === "automatic" \? "AUTO"/);
});
