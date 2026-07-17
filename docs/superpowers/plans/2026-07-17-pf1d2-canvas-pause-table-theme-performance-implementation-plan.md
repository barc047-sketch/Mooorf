# PF1D.2 — Canvas Pause and Table Theme Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to implement this plan task-by-task under the
> repository’s Manual Prompt Mode. Every product gate requires Owner QA before
> commit or push.

**Goal:** Pause all Classic and Organism Canvas rendering while Table is
active, collapse hidden updates, and reveal Canvas only after one complete
current-state frame or the 400ms safety fallback.

**Architecture:** Extend the existing demand-frame scheduler with reversible
pause semantics. Both renderers remain mounted, retain only the latest hidden
state, and produce one protected preparation frame on resume. App owns the
generation-safe readiness gate and single 400ms fallback while the existing
PF1D.1E scrim protects the transition.

**Tech Stack:** React 19, TypeScript, Zustand, Motion, Canvas2D, WebGL,
Vitest, Vite.

## Global Constraints

- Branch:
  `feature/pf1d-lazy-workspaces`
- Base:
  `e2b4a3dfb99333a66005cd49483dea5ddbd22ad0`
- Canvas remains persistently mounted.
- Table remains the approved lazy floating PF1D.1E overlay.
- No new Zustand state.
- No persistence or schema change.
- No second scheduler.
- No renderer replacement.
- No TableView redesign.
- No virtualization, progressive rows, text-first editing, search, sorting,
  upload, template, or import drawer.
- Existing detached export paths remain independent.
- App owns the single 400ms fallback.
- Browser performance evidence is mandatory.
- No production build before Owner QA.
- No product commit or push before explicit Owner PASS.
- No merge without exact Owner command.
- Each implementation gate starts in a fresh Codex session unless explicitly
  authorized as a narrow continuation.
- No automatic worker dispatch.

The phrase “both renderers remain mounted” applies to Table switching: the
currently selected Classic or Organism component must not unmount when Table
opens. Existing renderer-mode ownership remains unchanged, so App still mounts
exactly one selected Canvas strategy rather than two simultaneous canvases.

## Repository Test Convention

The inspected repository tests use Node’s `node:test` runner directly against
TypeScript under Node 26. The commands below follow that established style and
do not introduce a test dependency. Every product gate runs only the named
focused checks. `npm run build` is prohibited until finalization after the
exact Owner verdict.

## File Ownership Map

### `src/interaction/frameScheduler.ts`

- Own reversible `setPaused` and `isPaused`.
- Retain one pending invalidation.
- Remember the requested continuous state while paused.
- Keep terminal `cancel()` separate from reversible pause.
- Catch a render callback failure at the frame boundary, retain retry work,
  and schedule no automatic continuous follow-up after that failure.

### `src/interaction/frameScheduler.test.ts`

- Create this file in PF1D.2A; it does not exist at the approved base.
- Own scheduler pause/resume/cancellation unit contracts.
- Use an in-memory frame map so scheduling and cancellation counts are exact.

### `src/canvas/CanvasView.tsx`

- Consume `active` and `onResumeReady`.
- Collapse Classic hidden store, governor, theme, and resize updates.
- Perform zero hidden drawing and zero hidden performance reporting.
- Cancel queued pointer and wheel work on pause.
- Produce one latest-state preparation frame on resume.

### `src/canvas/OrganismCanvasView.tsx`

- Consume the same activity contract.
- Stop continuous scheduling while inactive.
- Collapse presentation, palette, membrane, colour, label, grid, smoothing,
  theme, and resize work.
- Produce one latest-state preparation frame.
- Restart continuous motion only after successful readiness.

### `src/App.tsx`

- Pass renderer activity props to the one selected Canvas strategy.
- Own the generation-safe resume gate.
- Own the single 400ms fallback and timeout cleanup.
- Reject stale generation, view, and renderer readiness.
- Preserve the PF1D.1E Table panel exit while retaining the scrim until the
  protected resume releases.

### `src/App.css`

- Change only if a `data-resume-pending` selector is required to keep the
  existing scrim pointer-protective.
- Preserve the approved geometry, colours, z-index values, and motion design.

### `src/runtime/pf1d2Contracts.test.ts`

- Create in PF1D.2B.
- Own static architecture, ownership, timeout, export-independence, and
  no-second-scheduler contracts.
- Do not duplicate scheduler state-machine assertions from
  `src/interaction/frameScheduler.test.ts`.

### Existing integration and parity tests

- Extend only where the tested behaviour already belongs.
- `src/canvas/runtimeRendererIntegration.test.ts` remains the renderer-output
  integration contract; it does not become a scheduler unit suite.
- `src/runtime/pf1dContracts.test.ts` remains the PF1D.1 overlay/lazy-loading
  contract and must stay green without being rewritten for PF1D.2.
- `src/ui/readiness.test.ts` remains startup-readiness evidence.
- `src/interaction/inspectorShortcut.test.ts` remains global-listener parity
  evidence.

## Gate File Matrix

| Gate | Expected changed files | Conditionally allowed | Prohibited |
|---|---|---|---|
| PF1D.2A | `src/interaction/frameScheduler.ts`; create `src/interaction/frameScheduler.test.ts` | `src/runtime/pf1d2Contracts.test.ts` only if an architecture assertion cannot live in the unit test; the expected path is to defer its creation to PF1D.2B | Every other repository path |
| PF1D.2B | `src/canvas/CanvasView.tsx`; create `src/runtime/pf1d2Contracts.test.ts` | `src/canvas/runtimeRendererIntegration.test.ts` only for a Classic output contract that exercises existing `drawScene` ownership | App, CSS, Organism, store, schema, persistence, Table, export implementation, and every unlisted path |
| PF1D.2C | `src/canvas/OrganismCanvasView.tsx`; `src/runtime/pf1d2Contracts.test.ts` | `src/canvas/runtimeRendererIntegration.test.ts` only for an existing Organism output contract | App, CSS, Classic, shader replacement, store, schema, persistence, Table, export implementation, and every unlisted path |
| PF1D.2D | `src/App.tsx`; `src/runtime/pf1d2Contracts.test.ts` | `src/App.css` only if the existing scrim needs a resume-pending selector; a focused App lifecycle test file only if an already-present mounted-App test pattern is identified inside the approved surface | Renderer internals, scheduler, store, schema, persistence, TableView, chrome components, and every unlisted path |
| PF1D.2E | No product or test changes expected | None without a new Owner prompt | All repository modifications and all feature expansion |

At the approved base there is no suitable mounted-App lifecycle harness in the
inspected files. PF1D.2D therefore uses `pf1d2Contracts.test.ts` for structural
ownership plus browser lifecycle evidence. It must not add a production-only
test export.

## Locked Shared Interfaces

Use this interface unchanged in every gate:

```ts
export interface DemandFrameLoop {
  invalidate(): void;
  setContinuous(active: boolean): void;
  setPaused(paused: boolean): void;
  isPaused(): boolean;
  cancel(): void;
}
```

Use this renderer contract unchanged in both Canvas components:

```ts
interface CanvasActivityProps {
  active: boolean;
  onResumeReady?: () => void;
}
```

Generation ownership remains in App. Renderers report only successful
completion of a fresh frame. No generation token enters Zustand. No timeout
exists inside either renderer.

### Scheduler Behaviour Lock

| Event | Exact result |
|---|---|
| Pause with an already scheduled invalidation frame | Cancel that callback, set the scheduled id to `null`, retain one pending invalidation, and report paused. |
| Pause with a frame scheduled only by continuous mode | Cancel that callback, remember `continuous=true`, and require one preparation frame on resume. |
| Repeated invalidation while paused | Keep one boolean pending invalidation and schedule zero frames. |
| `setContinuous(true)` while paused | Remember `true` and schedule zero frames. |
| `setContinuous(false)` while paused | Replace the remembered intent with `false`; a separately pending invalidation remains pending. |
| Resume with pending invalidation | Schedule exactly one preparation frame. |
| Resume with continuous mode | Schedule exactly one preparation frame; continuous follow-up becomes eligible only after that callback returns normally. |
| Pause again before preparation runs | Cancel preparation and retain one pending preparation request. |
| Repeated resume | Leave the one scheduled preparation callback unchanged. |
| Preparation callback throws | Catch at the scheduler boundary, retain one pending invalidation, schedule no automatic follow-up, and permit a later explicit invalidation or activation retry. |
| Permanent cancellation | Cancel the current callback; clear invalidation and continuous intent; make invalidate, pause, resume, and continuous calls inert. |
| Invalidation after cancellation | Schedule nothing and retain nothing. |
| `isPaused()` after cancellation | Return `false`, because cancellation is terminal and is not reversible pause. |

## Gate Protocol

For PF1D.2A through PF1D.2D, the worker must begin by verifying the branch,
gate source SHA supplied by the Owner, and clean or explicitly authorized
working tree. Each gate is TDD-only implementation without a build, commit,
push, merge, or automatic dispatch. A gate ends after browser evidence where
required and waits for an Owner prompt before the next gate.

TypeScript rule for each implementation gate: run
`npx tsc -b --pretty false` exactly once after the focused and regression
checks are green. This is a type check, not a production build. If a required
RED command fails for a reason other than the newly asserted missing
behaviour, stop and report that failure without editing production code.

---

## PF1D.2A — Demand Frame Loop Pause Semantics

**Goal:** Extend the one existing demand-frame loop with reversible pause while
preserving terminal cancellation.

**Exact allowed files:**

- `src/interaction/frameScheduler.ts`
- `src/interaction/frameScheduler.test.ts`
- `src/runtime/pf1d2Contracts.test.ts` only when a scheduler ownership
  assertion genuinely cannot live in the new unit suite

**Expected changed files:**

- `src/interaction/frameScheduler.ts`
- `src/interaction/frameScheduler.test.ts`

**Prohibited files:** Every repository path outside the exact allowed list.
Do not edit either renderer, App, CSS, store, Table, export, package metadata,
or Project Engine documents in this gate.

**Interfaces consumed:**

- Existing `DemandFrameLoopOptions`
- Existing single `schedule`, `cancel`, and `render` callback ownership

**Interfaces produced:**

- The locked `DemandFrameLoop` interface with `setPaused` and `isPaused`
- Reversible pause semantics consumed by both renderer gates

- [ ] **Step 1: Write the failing test**

Create `src/interaction/frameScheduler.test.ts` with the complete scheduler
harness and contracts below:

```ts
import { strict as assert } from "node:assert";
import test from "node:test";
import { createDemandFrameLoop } from "./frameScheduler";

const harness = (render: (now: number) => boolean = () => false) => {
  let nextId = 0;
  const frames = new Map<number, (now: number) => void>();
  const cancelled: number[] = [];
  const loop = createDemandFrameLoop({
    schedule: (callback) => {
      const id = ++nextId;
      frames.set(id, callback);
      return id;
    },
    cancel: (id) => {
      cancelled.push(id);
      frames.delete(id);
    },
    render,
  });
  const runOnlyFrame = (now: number) => {
    assert.equal(frames.size, 1, "exactly one owned frame is scheduled");
    const [id, callback] = [...frames.entries()][0];
    frames.delete(id);
    callback(now);
    return id;
  };
  return { loop, frames, cancelled, runOnlyFrame };
};

test("pause cancels scheduled work and paused invalidations collapse", () => {
  const { loop, frames, cancelled, runOnlyFrame } = harness();
  loop.invalidate();
  assert.equal(frames.size, 1);
  loop.setPaused(true);
  assert.equal(loop.isPaused(), true);
  assert.deepEqual(cancelled, [1]);
  assert.equal(frames.size, 0);
  loop.invalidate();
  loop.invalidate();
  loop.invalidate();
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(loop.isPaused(), false);
  assert.equal(frames.size, 1);
  loop.setPaused(false);
  assert.equal(frames.size, 1, "repeated resume does not duplicate preparation");
  runOnlyFrame(16);
  assert.equal(frames.size, 0);
});

test("continuous intent is dormant while paused and starts after preparation", () => {
  const rendered: number[] = [];
  const { loop, frames, runOnlyFrame } = harness((now) => {
    rendered.push(now);
    return false;
  });
  loop.setPaused(true);
  loop.setContinuous(true);
  loop.setContinuous(false);
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(frames.size, 0, "latest false intent replaces paused continuous work");
  loop.setPaused(true);
  loop.setContinuous(true);
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(frames.size, 1);
  assert.deepEqual(rendered, []);
  runOnlyFrame(20);
  assert.deepEqual(rendered, [20]);
  assert.equal(frames.size, 1, "continuous follow-up starts after preparation");
  loop.setContinuous(false);
  runOnlyFrame(36);
  assert.equal(frames.size, 0);
});

test("pausing an already scheduled continuous frame remembers its intent", () => {
  const { loop, frames, cancelled, runOnlyFrame } = harness();
  loop.setContinuous(true);
  assert.equal(frames.size, 1);
  loop.setPaused(true);
  assert.deepEqual(cancelled, [1]);
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(frames.size, 1, "resume schedules one preparation frame");
  runOnlyFrame(40);
  assert.equal(frames.size, 1, "continuous work follows successful preparation");
  loop.setContinuous(false);
  runOnlyFrame(56);
  assert.equal(frames.size, 0);
});

test("repause prevents preparation and the next resume retries once", () => {
  const { loop, frames, cancelled, runOnlyFrame } = harness();
  loop.setPaused(true);
  loop.invalidate();
  loop.setPaused(false);
  assert.equal(frames.size, 1);
  loop.setPaused(true);
  assert.equal(frames.size, 0);
  assert.deepEqual(cancelled, [1]);
  loop.setPaused(false);
  assert.equal(frames.size, 1);
  runOnlyFrame(48);
  assert.equal(frames.size, 0);
});

test("a thrown preparation retains retry work without automatic follow-up", () => {
  let attempts = 0;
  const { loop, frames, runOnlyFrame } = harness(() => {
    attempts += 1;
    if (attempts === 1) throw new Error("preparation failed");
    return false;
  });
  loop.setPaused(true);
  loop.invalidate();
  loop.setPaused(false);
  assert.doesNotThrow(() => runOnlyFrame(64));
  assert.equal(frames.size, 0, "failure does not create a continuous retry loop");
  loop.invalidate();
  assert.equal(frames.size, 1, "explicit invalidation retries retained work");
  runOnlyFrame(80);
  assert.equal(attempts, 2);
  assert.equal(frames.size, 0);
});

test("cancel is terminal and isPaused reports only reversible pause", () => {
  const { loop, frames, cancelled } = harness();
  loop.invalidate();
  loop.setPaused(true);
  assert.deepEqual(cancelled, [1]);
  loop.cancel();
  assert.equal(loop.isPaused(), false);
  loop.invalidate();
  loop.setContinuous(true);
  loop.setPaused(false);
  loop.setPaused(true);
  assert.equal(frames.size, 0);
  loop.cancel();
  assert.equal(frames.size, 0);
});
```

- [ ] **Step 2: Run the exact focused command and verify RED**

Run:

```bash
node --test src/interaction/frameScheduler.test.ts
```

Expected RED: the new suite fails because `setPaused` and `isPaused` do not
exist on the current loop. A module-resolution failure, syntax failure, or
pre-existing scheduler assertion failure is not the expected RED and stops
the gate.

- [ ] **Step 3: Implement the minimal behaviour**

Modify only `DemandFrameLoop` and `createDemandFrameLoop`. Use these exact
state owners:

```ts
let frameId: number | null = null;
let invalidated = false;
let continuous = false;
let paused = false;
let cancelled = false;
```

`request()` must return while cancelled, paused, or already scheduled.
`setPaused(true)` must cancel the owned frame and retain work. A cancelled
scheduled frame must set `invalidated = true` so a later resume has one
preparation request. `setPaused(false)` must request one frame only when
`invalidated || continuous`. `run()` must catch a thrown renderer callback,
restore `invalidated = true`, and return without calling `request()`.
`cancel()` must clear reversible state and make every future method inert.

- [ ] **Step 4: Run the exact command and verify GREEN**

Run:

```bash
node --test src/interaction/frameScheduler.test.ts
```

Expected GREEN: all named scheduler tests pass, no uncaught frame error is
printed, and the process exits 0.

- [ ] **Step 5: Run relevant regression suites**

Run:

```bash
node --test src/canvas/v8_2c0_1Contracts.test.ts src/canvas/v8_2c0Contracts.test.ts
```

Expected GREEN: the existing demand-frame and raw-input scheduler contracts
pass unchanged.

- [ ] **Step 6: Run TypeScript only when required**

Run exactly once:

```bash
npx tsc -b --pretty false
```

Expected: exit 0. Do not run `npm run build`.

- [ ] **Step 7: Run diff/status checks**

Run:

```bash
git diff --check
git status --short
git diff --name-only
```

Expected paths: only `src/interaction/frameScheduler.ts` and
`src/interaction/frameScheduler.test.ts`.

- [ ] **Step 8: Perform required browser evidence**

No dedicated browser QA is required for this isolated scheduler gate. If an
existing consumer smoke page is already running, confirm it opens without a
framework overlay; do not start PF1D.2B browser work in this gate.

- [ ] **Step 9: Stop for Owner review**

Return scheduler RED/GREEN results, regression and TypeScript outcomes, and
the exact dirty paths. Do not build, commit, push, merge, or begin PF1D.2B.

---

## PF1D.2B — Classic Canvas Full Pause and Prepared Resume

**Goal:** Keep Classic mounted while Table is active, perform zero hidden
Canvas work, and report readiness only after one successful latest-state
frame.

**Exact allowed files:**

- `src/canvas/CanvasView.tsx`
- `src/runtime/pf1d2Contracts.test.ts`
- `src/canvas/runtimeRendererIntegration.test.ts` only if an existing
  `drawScene` output assertion must be extended for Classic preparation output

**Expected changed files:**

- `src/canvas/CanvasView.tsx`
- Create `src/runtime/pf1d2Contracts.test.ts`

**Prohibited files:** App, App CSS, Organism, scheduler, store, schema,
persistence, TableView, renderer replacement, export implementation, and
every path outside the exact allowed list.

**Interfaces consumed:**

- `DemandFrameLoop.setPaused(paused)`
- `DemandFrameLoop.isPaused()`
- `CanvasActivityProps`

**Interfaces produced:**

- `<CanvasView active={boolean} onResumeReady={callback} />`
- One successful Classic preparation-frame readiness callback
- DOM evidence counters for Classic draw and performance-report frames

- [ ] **Step 1: Write the failing test**

Create `src/runtime/pf1d2Contracts.test.ts` with this complete initial
contract:

```ts
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => readFileSync(path, "utf8");

test("Classic Canvas pauses hidden work and reports only a prepared frame", () => {
  const classic = source("src/canvas/CanvasView.tsx");

  assert.match(classic, /interface CanvasActivityProps[\s\S]*?active:\s*boolean[\s\S]*?onResumeReady\?:\s*\(\) => void/);
  assert.match(classic, /function CanvasView\(\{\s*active,\s*onResumeReady\s*\}:\s*CanvasActivityProps\)/);
  assert.match(classic, /activeRef/);
  assert.match(classic, /onResumeReadyRef/);
  assert.match(classic, /pendingFullRefresh/);
  assert.match(classic, /pendingThemeRefresh/);
  assert.match(classic, /pendingDimensions/);
  assert.match(classic, /renderLoop\?\.setPaused\(!active\)|renderLoop\.setPaused\(!active\)/);
  assert.match(classic, /moveScheduler\.cancel\(\)[\s\S]*?wheelScheduler\.cancel\(\)/);
  assert.match(classic, /dataset\.drawFrameCount/);
  assert.match(classic, /dataset\.performanceReportCount/);
  assert.match(classic, /dataset\.preparedTheme/);
  assert.match(classic, /dataset\.resumeReadyAt/);
  assert.match(classic, /drawScene\([\s\S]*?onResumeReadyRef\.current\?\.\(\)/);
  assert.match(classic, /registerCanvasCapture/);
  assert.equal(classic.match(/createDemandFrameLoop\(/g)?.length, 1);
  assert.doesNotMatch(classic, /resumeTimeout|CANVAS_RESUME_FALLBACK_MS|\b400\b/);
});
```

- [ ] **Step 2: Run the exact focused command and verify RED**

Run:

```bash
node --test --test-name-pattern="Classic Canvas pauses hidden work" src/runtime/pf1d2Contracts.test.ts
```

Expected RED: the activity props and pause/preparation owners are absent from
the approved Classic source.

- [ ] **Step 3: Implement the minimal behaviour**

Add `CanvasActivityProps` and keep the main renderer effect mounted. Mirror
changing props through `activeRef` and `onResumeReadyRef`; do not add
`active` to the main renderer effect’s dependency array.

While inactive, the store subscription must retain the latest
`ReturnType<typeof useLab.getState>` reference and set one
`pendingFullRefresh` flag without calling `projectedCanvasSpaces`,
`authoredCanvasSettings`, `resolveLivePerformanceSettings`, or `invalidate`.
The theme observer sets `pendingThemeRefresh` without `readTokens()`. The
ResizeObserver stores `{ width, height, dpr }` in `pendingDimensions` without
changing either canvas backing dimension.

On the active-to-inactive transition:

```ts
moveScheduler.cancel();
wheelScheduler.cancel();
renderLoop.setPaused(true);
```

On the inactive-to-active transition, while the loop is still paused:

1. Read `useLab.getState()` once.
2. Replace `spaces`, selection, settings, and camera with that latest snapshot.
3. Clear `camTarget` so no hidden intermediate camera interpolation appears.
4. Read current theme tokens once.
5. Apply the latest valid dimensions once; zero dimensions retain pending work
   and emit no readiness.
6. Set `dirty = true` and `pendingFullRefresh = true`.
7. Call `renderLoop.invalidate()` and then `renderLoop.setPaused(false)`.

Wrap the full preparation draw boundary so an unavailable context or thrown
`drawScene` emits one bounded diagnostic, emits no readiness, and leaves retry
work. Increment `canvas.dataset.drawFrameCount` only after a completed
`drawScene`. Increment `canvas.dataset.performanceReportCount` only beside the
actual `performanceRuntime.reportFrame` call. Invoke
`onResumeReadyRef.current?.()` once after the successful full draw. Immediately
before that callback, store the current theme in
`canvas.dataset.preparedTheme` and `performance.now()` in
`canvas.dataset.resumeReadyAt`, then clear the activation-owned readiness flag.

Keep `registerCanvasCapture` independent. Export must continue to use its
fresh offscreen canvas and canonical snapshot without unpausing the visible
loop or invoking readiness.

- [ ] **Step 4: Run the exact command and verify GREEN**

Run:

```bash
node --test --test-name-pattern="Classic Canvas pauses hidden work" src/runtime/pf1d2Contracts.test.ts
node --test src/interaction/frameScheduler.test.ts src/runtime/pf1d2Contracts.test.ts
```

Expected GREEN: the Classic ownership contract and scheduler suite pass.

- [ ] **Step 5: Run relevant regression suites**

Run:

```bash
node --test src/canvas/runtimeRendererIntegration.test.ts src/canvas/v8_2c0_1Contracts.test.ts src/canvas/v8_2c0Contracts.test.ts
```

Expected GREEN: Classic rendering, gestures, demand scheduling, selection,
presentation, and detached export ownership remain intact.

- [ ] **Step 6: Run TypeScript only when required**

Run exactly once:

```bash
npx tsc -b --pretty false
```

Expected: exit 0. Do not run a production build.

- [ ] **Step 7: Run diff/status checks**

Run:

```bash
git diff --check
git status --short
git diff --name-only
```

Expected paths: `src/canvas/CanvasView.tsx`,
`src/runtime/pf1d2Contracts.test.ts`, plus the uncommitted PF1D.2A files
carried forward only when the Owner explicitly authorized a narrow
continuation. No App, CSS, Organism, store, Table, or export path may appear.

- [ ] **Step 8: Perform required browser evidence**

Use Classic at 1440×900 with a non-default camera and selected Cell. Record
`data-draw-frame-count` and `data-performance-report-count`, open Table, and
perform at least three Day/Night changes plus canonical Name/Area/position
edits through existing UI paths. Verify both counters remain byte-for-byte
unchanged while Table is active. Record `canvas.width`, `canvas.height`, and
the host rectangle before and during Table; backing dimensions must remain
unchanged while only the latest observed host dimensions are retained. Return
to Canvas and verify:

- exactly one fresh Classic draw occurs before scrim release;
- the first revealed frame uses the final theme;
- canonical edits persist;
- camera and selection are unchanged;
- a failed or zero-size preparation emits no readiness; and
- detached export while paused completes without changing either visible
  counter.

- [ ] **Step 9: Stop for Owner review**

Return automated outcomes and the before/hidden/resume counter snapshots.
Do not build, commit, push, merge, or begin PF1D.2C.

---

## PF1D.2C — Organism Canvas Full Pause and Prepared Resume

**Goal:** Suspend all mounted Organism membrane, presentation, derivation, and
continuous-motion work while Table is active, then prepare one destination
theme frame before motion restarts.

**Exact allowed files:**

- `src/canvas/OrganismCanvasView.tsx`
- `src/runtime/pf1d2Contracts.test.ts`
- `src/canvas/runtimeRendererIntegration.test.ts` only if an existing
  renderer-output assertion must be extended for Organism preparation output

**Expected changed files:**

- `src/canvas/OrganismCanvasView.tsx`
- `src/runtime/pf1d2Contracts.test.ts`

**Prohibited files:** App, App CSS, Classic, scheduler, shader replacement,
store, schema, persistence, TableView, export implementation, and every path
outside the exact allowed list.

**Interfaces consumed:**

- The PF1D.2A pause-capable `DemandFrameLoop`
- The locked `CanvasActivityProps`

**Interfaces produced:**

- `<OrganismCanvasView active={boolean} onResumeReady={callback} />`
- One full membrane/current-mode plus presentation readiness callback
- Continuous motion restart only after readiness
- Browser counters for membrane, presentation, and performance reports

- [ ] **Step 1: Write the failing test**

Append this complete contract to `src/runtime/pf1d2Contracts.test.ts`:

```ts
test("Organism Canvas collapses hidden derivation and restarts motion after readiness", () => {
  const organism = source("src/canvas/OrganismCanvasView.tsx");

  assert.match(organism, /interface CanvasActivityProps[\s\S]*?active:\s*boolean[\s\S]*?onResumeReady\?:\s*\(\) => void/);
  assert.match(organism, /function OrganismCanvasView\(\{\s*active,\s*onResumeReady\s*\}:\s*CanvasActivityProps\)/);
  assert.match(organism, /activeRef/);
  assert.match(organism, /onResumeReadyRef/);
  assert.match(organism, /pendingFullRefresh/);
  assert.match(organism, /pendingThemeRefresh/);
  assert.match(organism, /pendingDimensions/);
  assert.match(organism, /renderLoop\?\.setPaused\(!active\)|renderLoop\.setPaused\(!active\)/);
  assert.match(organism, /moveScheduler\.cancel\(\)[\s\S]*?wheelScheduler\.cancel\(\)/);
  assert.match(organism, /themeTransitionUntil\s*=\s*0/);
  assert.match(organism, /dataset\.membraneRenderCount/);
  assert.match(organism, /dataset\.presentationFrameCount/);
  assert.match(organism, /dataset\.performanceReportCount/);
  assert.match(organism, /dataset\.preparedTheme/);
  assert.match(organism, /dataset\.resumeReadyAt/);
  assert.match(organism, /drawPresentationOverlay\([\s\S]*?onResumeReadyRef\.current\?\.\(\)[\s\S]*?setContinuous/);
  assert.match(organism, /renderDetachedOrganismExport/);
  assert.equal(organism.match(/createDemandFrameLoop\(/g)?.length, 1);
  assert.doesNotMatch(organism, /resumeTimeout|CANVAS_RESUME_FALLBACK_MS|\b400\b/);
});
```

- [ ] **Step 2: Run the exact focused command and verify RED**

Run:

```bash
node --test --test-name-pattern="Organism Canvas collapses hidden derivation" src/runtime/pf1d2Contracts.test.ts
```

Expected RED: the common activity props and hidden-update/preparation owners
are absent from the approved Organism source.

- [ ] **Step 3: Implement the minimal behaviour**

Add the common activity props without remounting the renderer effect. Mirror
props through refs and install one activity transition function after
`renderLoop`, input schedulers, observers, and subscriptions exist.

Freeze the React-rendered label projection while inactive: retain the latest
raw selector inputs, but keep the dependencies passed to
`applySpacePositionsPreview`, `getAreaRange`,
`projectRuntimePresentation`, `projectSelectionOverlay`, colour mapping, and
label reconstruction fixed at the last active snapshot. Hooks remain
unconditional; only expensive memo inputs are frozen.

Inside imperative subscriptions while inactive:

- retain the latest canonical store reference;
- retain final governor and reduced-motion snapshots;
- set one `pendingFullRefresh` flag;
- record only the final root theme in `pendingTheme`;
- record only the final `{ width, height, dpr }` in `pendingDimensions`;
- remember `resolved.motionActive` as requested continuous intent;
- skip `applySpacePositionsPreview`, `patchRuntimePresentation`,
  `refreshDerived`, palette generation, Cell-colour mapping, membrane-field
  projection, label/grid synchronization, render-target resize, render,
  clear, present, overlay draw, and performance reporting.

On pause, cancel pointer and wheel schedulers, call
`renderLoop.setPaused(true)`, and leave renderer/context/export registration
mounted.

On resume, while still paused:

1. Read one current store snapshot, theme, governor snapshot, reduced-motion
   value, and latest valid dimensions.
2. Resolve settings and `resolved.motionActive` once without enabling
   continuous scheduling.
3. Replace hidden intermediate spaces, selection, camera, presentation,
   palette, field, label, and grid inputs with the latest snapshot.
4. Set `smooth = null`, clear old per-theme colour smoothing, set
   `themeTransitionUntil = 0`, and reset motion timing so the destination theme
   is used directly.
5. Apply presentation and WebGL dimensions once. A zero-size result retains
   pending preparation and emits no readiness.
6. Mark `derivedDirty`, `membraneNeedsRender`, `surfaceNeedsClear`, and the
   full-redraw scope.
7. Invalidate once and unpause.
8. Complete the correct membrane render or clear/present path and then
   `drawPresentationOverlay`.
9. Increment presentation/performance counters only after those calls.
10. Record the destination theme in `canvas.dataset.preparedTheme` and
    `performance.now()` in `canvas.dataset.resumeReadyAt`.
11. Invoke readiness once; only then call
    `renderLoop.setContinuous(resolved.motionActive)`.

If renderer creation is unavailable or preparation throws, emit no readiness,
do not enable continuous mode, retain retry eligibility, and keep project
state intact. `renderDetachedOrganismExport` remains registered and must not
wake the live loop.

- [ ] **Step 4: Run the exact command and verify GREEN**

Run:

```bash
node --test --test-name-pattern="Organism Canvas collapses hidden derivation" src/runtime/pf1d2Contracts.test.ts
node --test src/interaction/frameScheduler.test.ts src/runtime/pf1d2Contracts.test.ts
```

Expected GREEN: Organism activity ownership and shared scheduler contracts
pass.

- [ ] **Step 5: Run relevant regression suites**

Run:

```bash
node --test src/canvas/runtimeRendererIntegration.test.ts src/canvas/v8_2c0_1Contracts.test.ts src/canvas/v8_2c0Contracts.test.ts
```

Expected GREEN: membrane/current-mode presentation, labels, selection,
gestures, motion gating, and detached export ownership remain intact.

- [ ] **Step 6: Run TypeScript only when required**

Run exactly once:

```bash
npx tsc -b --pretty false
```

Expected: exit 0. Do not run a production build.

- [ ] **Step 7: Run diff/status checks**

Run:

```bash
git diff --check
git status --short
git diff --name-only
```

Expected new gate paths: only `src/canvas/OrganismCanvasView.tsx` and
`src/runtime/pf1d2Contracts.test.ts`. Earlier approved uncommitted gate files
may remain only under an Owner-authorized narrow continuation.

- [ ] **Step 8: Perform required browser evidence**

At 1440×900, run Organism in Day and Night with motion first enabled and then
disabled. Record membrane, presentation-frame, and performance-report
counters. Open Table and verify all three remain unchanged through multiple
theme changes, canonical edits, and at least two seconds with authored motion
enabled. Record WebGL target, presentation-canvas backing dimensions, and
`dataset.visibleResizeCount`; all remain unchanged while Table is active even
if the latest host dimensions change. Return to Canvas and verify:

- one current-theme preparation frame completes under the scrim;
- readiness occurs after membrane/current-mode and presentation completion;
- no previous-theme flash appears;
- continuous motion changes counters only after readiness;
- a no-membrane configuration completes its clear/present plus presentation
  preparation path;
- reduced motion keeps continuous scheduling off; and
- paused detached export changes no visible counter.

- [ ] **Step 9: Stop for Owner review**

Return exact counter/timestamp evidence and test results. Do not build, commit,
push, merge, or begin PF1D.2D.

---

## PF1D.2D — App Resume Gate and 400ms Fallback

**Goal:** Make App the sole owner of generation-safe Canvas reveal, one 400ms
fallback, and scrim release without altering the approved PF1D.1E composition.

**Exact allowed files:**

- `src/App.tsx`
- `src/App.css` only when necessary
- `src/runtime/pf1d2Contracts.test.ts`
- A focused App lifecycle test file only when an existing suitable mounted-App
  pattern is present

**Expected changed files:**

- `src/App.tsx`
- `src/runtime/pf1d2Contracts.test.ts`
- `src/App.css` only if `data-resume-pending` needs an explicit selector

**Prohibited files:** Scheduler, both renderer internals, store, schema,
persistence, TableView, ViewToggle, Rail, Dock, widgets, runtime services, and
every path outside the exact allowed list.

**Interfaces consumed:**

- `CanvasActivityProps` on the selected renderer
- Renderer readiness meaning “one full fresh frame completed”

**Interfaces produced:**

- `resumePending`
- `resumeGenerationRef`
- `resumeTimeoutRef`
- One generation/view/renderer-safe readiness closure
- One 400ms non-readiness fallback

- [ ] **Step 1: Write the failing test**

Append this complete contract to `src/runtime/pf1d2Contracts.test.ts`:

```ts
test("App alone owns the generation-safe 400ms Canvas resume gate", () => {
  const app = source("src/App.tsx");
  const css = source("src/App.css");
  const classic = source("src/canvas/CanvasView.tsx");
  const organism = source("src/canvas/OrganismCanvasView.tsx");

  assert.match(app, /const CANVAS_RESUME_FALLBACK_MS = 400/);
  assert.match(app, /resumePending/);
  assert.match(app, /resumeGenerationRef/);
  assert.match(app, /resumeTimeoutRef/);
  assert.match(app, /window\.clearTimeout\(resumeTimeoutRef\.current\)/);
  assert.match(app, /generation !== resumeGenerationRef\.current/);
  assert.match(app, /useLab\.getState\(\)\.view !== "canvas"/);
  assert.match(app, /rendererMode/);
  assert.match(app, /console\.warn\(/);
  assert.match(app, /<OrganismCanvasView[\s\S]*?active=\{canvasRendererActive\}[\s\S]*?onResumeReady=/);
  assert.match(app, /<CanvasView[\s\S]*?active=\{canvasRendererActive\}[\s\S]*?onResumeReady=/);
  assert.match(app, /tableActive \|\| resumePending/);
  assert.match(app, /data-resume-pending/);
  assert.match(app, /tableActive && \([\s\S]*?className="table-workspace-panel"/);
  assert.match(css, /\.table-workspace-scrim[\s\S]*?pointer-events:\s*auto/);
  assert.doesNotMatch(classic, /CANVAS_RESUME_FALLBACK_MS|resumeTimeout/);
  assert.doesNotMatch(organism, /CANVAS_RESUME_FALLBACK_MS|resumeTimeout/);
});
```

- [ ] **Step 2: Run the exact focused command and verify RED**

Run:

```bash
node --test --test-name-pattern="App alone owns the generation-safe" src/runtime/pf1d2Contracts.test.ts
```

Expected RED: App does not yet own resume state, generation, timeout, activity
props, or retained-scrim presence.

- [ ] **Step 3: Implement the minimal behaviour**

Add:

```ts
const CANVAS_RESUME_FALLBACK_MS = 400;
```

Inside `MainApp`, add exactly these local owners:

```ts
const [resumePending, setResumePending] = useState(false);
const resumeGenerationRef = useRef(0);
const resumeTimeoutRef = useRef<number | null>(null);
```

Use one cleanup function that clears the timeout and sets the ref to `null`.
Table activation must increment the generation, clear the timeout, clear
resume-pending state, and pass `active={false}` to the selected renderer.

Canvas activation must increment the generation, set resume pending, keep the
renderer inactive for the transition render that establishes the new
generation, then activate the selected renderer with a closure capturing both
generation and renderer identity. Start one timeout only after that ownership
exists.

The readiness closure must return unless all three checks match:

```ts
generation === resumeGenerationRef.current
useLab.getState().view === "canvas"
useLab.getState().settings.rendererMode === rendererIdentity
```

Matching readiness clears the timeout and resume-pending state. The fallback
performs the same ownership checks, sets the timeout ref to `null`, releases
the scrim, and emits one bounded `console.warn` that explicitly says fallback
rather than readiness. It must not reset, recreate, or mutate project state.

Preserve initial startup readiness: the initially selected Canvas renderer is
active without a PF1D.2 return gate. A Table-to-Canvas transition is the event
that starts `resumePending`.

Keep the overlay mounted while `tableActive || resumePending`. Keep the Table
panel’s own conditional presence tied to `tableActive` so its existing exit
begins immediately. Keep the scrim as the stable sibling that remains
pointer-protective until matching readiness or fallback. Do not change panel
geometry, Motion distances/durations, chrome transitions, z-index values,
ViewToggle placement, lazy `TableView`, or request deduplication.

On rapid return to Table, clear the timeout, increment the generation, clear
pending state, and pause Canvas. On renderer-mode change while Table is
active, invalidate the generation so the old renderer cannot satisfy the next
resume. On unmount, clear the timeout and increment generation ownership.

- [ ] **Step 4: Run the exact command and verify GREEN**

Run:

```bash
node --test --test-name-pattern="App alone owns the generation-safe" src/runtime/pf1d2Contracts.test.ts
node --test src/runtime/pf1d2Contracts.test.ts src/runtime/pf1dContracts.test.ts
```

Expected GREEN: App ownership passes and every PF1D.1E overlay, Motion,
stacking, lazy Table, and persistent-chrome contract remains green.

- [ ] **Step 5: Run relevant regression suites**

Run:

```bash
node --test src/interaction/frameScheduler.test.ts src/canvas/runtimeRendererIntegration.test.ts src/ui/readiness.test.ts src/interaction/inspectorShortcut.test.ts src/canvas/v8_2c0_1Contracts.test.ts
```

Expected GREEN: startup readiness, one Inspector listener, renderer parity,
state preservation, and scheduler ownership remain intact.

- [ ] **Step 6: Run TypeScript only when required**

Run exactly once:

```bash
npx tsc -b --pretty false
```

Expected: exit 0. Do not run a production build.

- [ ] **Step 7: Run diff/status checks**

Run:

```bash
git diff --check
git status --short
git diff --name-only
```

Expected new gate paths: `src/App.tsx`,
`src/runtime/pf1d2Contracts.test.ts`, and `src/App.css` only if the existing
scrim requires the resume-pending selector. No other application-shell or
renderer path may be introduced by this gate.

- [ ] **Step 8: Perform required browser evidence**

Verify the complete lifecycle in both renderer modes:

1. Table activation invalidates the prior generation and pauses the selected
   renderer.
2. Canvas activation starts one generation and one timeout.
3. The Table panel begins its existing exit while the static scrim remains
   mounted and pointer-protective.
4. Matching readiness clears the timeout and releases the scrim.
5. A zero-size deliberate preparation fault releases through fallback at
   400ms or later, emits one warning, and never claims readiness.
6. Canvas then immediate Table clears the timeout and keeps Table protected.
7. A late callback from the prior renderer and a stale timeout cannot release
   the active Table.
8. Component unmount with an active timeout produces no later state update.
9. Rail, Dock, widgets, auxiliary controls, ViewToggle, camera, selection,
   Cell positions, renderer mode, and moved/minimized widget state are exact
   before and after the cycle.

- [ ] **Step 9: Stop for Owner review**

Return normal-readiness and fallback timestamps, stale-callback results,
console output, and the exact dirty paths. Do not build, commit, push, merge,
or begin PF1D.2E.

---

## PF1D.2E — Integrated Browser Performance and Parity QA

**Goal:** Prove the completed PF1D.2 behaviour across automated contracts and
the required runtime matrix without expanding the feature.

**Exact allowed files:** None. This gate is verification-only.

**Expected changed files:** None.

**Prohibited files:** Every repository modification. Any discovered defect
returns to the owning PF1D.2A–PF1D.2D gate under a new Owner prompt.

**Interfaces consumed:**

- Final scheduler, Classic, Organism, and App activity contracts
- Existing store, renderer, Table, chrome, readiness, Inspector, and export
  parity contracts

**Interfaces produced:**

- Automated check record
- Browser counter/timestamp record
- Owner QA handoff

- [ ] **Step 1: Write the failing test**

No new test file is authorized in this verification-only gate. Before running
the matrix, identify any acceptance row that lacks an assertion or browser
observation. If one exists, stop and return it to the owning earlier gate; do
not edit files in PF1D.2E.

- [ ] **Step 2: Run the exact focused command and verify RED**

There is no intentional RED command in PF1D.2E because all implementation
gates must already be green. Run the integrated command in Step 4. Any failure
is a regression and stops the gate without a repair in this session.

- [ ] **Step 3: Implement the minimal behaviour**

No implementation is permitted. Confirm `git status --short` matches the exact
Owner-authorized uncommitted PF1D.2 file set before QA.

- [ ] **Step 4: Run the exact command and verify GREEN**

Run:

```bash
node --test \
  src/interaction/frameScheduler.test.ts \
  src/runtime/pf1d2Contracts.test.ts \
  src/runtime/pf1dContracts.test.ts \
  src/runtime/pf1cContracts.test.ts \
  src/canvas/runtimeRendererIntegration.test.ts \
  src/canvas/v8_2c0_1Contracts.test.ts \
  src/canvas/v8_2c0Contracts.test.ts \
  src/ui/readiness.test.ts \
  src/interaction/inspectorShortcut.test.ts
```

Expected GREEN: scheduler pause, PF1D.2, PF1D.1, PF1C, runtime-renderer,
readiness, Inspector shortcut, store, gesture, and parity checks all exit 0.

- [ ] **Step 5: Run relevant regression suites**

The Step 4 command is the bounded integrated regression suite. Record every
file’s pass count and total. Do not run a broad repository test sweep.

- [ ] **Step 6: Run TypeScript only when required**

Run exactly once:

```bash
npx tsc -b --pretty false
```

Expected: exit 0. Do not run `npm run build`.

- [ ] **Step 7: Run diff/status checks**

Run:

```bash
git diff --check
git status --short
git diff --name-only
```

Expected: no whitespace errors and only the accumulated Owner-authorized
PF1D.2A–PF1D.2D file set. No Project Engine file is changed before
finalization.

- [ ] **Step 8: Perform required browser evidence**

Run this matrix:

- Classic Day and Night.
- Organism Day and Night.
- Organism motion enabled and disabled.
- OS reduced motion.
- 1440×900.
- 1280×900.
- Rapid Canvas/Table switching.
- At least 300 spaces when practical.

For each applicable row, capture:

- Classic draw/frame count.
- Organism membrane count.
- Organism presentation count.
- Canvas performance-report count.
- Current theme.
- Scrim state.
- Readiness timestamp.
- Fallback timestamp.
- Renderer mode.
- Camera.
- Selection.
- Cell positions.
- Widget positions and minimized state.

In the Vite development page, read canonical parity without adding a product
debug export:

```js
const { useLab } = await import("/src/state/store.ts");
const state = useLab.getState();
const parity = {
  theme: state.theme,
  rendererMode: state.settings.rendererMode,
  camera: structuredClone(state.camera),
  selectedIds: [...state.selectedIds],
  spaces: state.spaces.map(({ id, x, y, name, area }) => ({ id, x, y, name, area })),
};
```

Capture widget rectangles from existing mounted `.wframe` elements with
`getBoundingClientRect()` and their existing minimized attributes/classes.
Capture renderer counters from the selected Canvas element’s datasets.

Required proof:

- zero Canvas frames while Table is active;
- multiple theme switches produce zero Canvas frames;
- hidden edits persist;
- the final theme is used by the first revealed frame;
- normal readiness completes before 400ms;
- deliberate zero-size preparation makes fallback release correctly;
- fallback never reveals Canvas over active Table;
- no stale timeout or callback releases a later generation;
- no duplicate demand loop exists;
- camera, selection, Cells, widgets, and renderer mode do not reset;
- console errors and warnings are zero on the normal path;
- the deliberate fallback produces only its one expected bounded warning; and
- no framework error overlay appears.

- [ ] **Step 9: Stop for Owner review**

Return the automated record, browser matrix, instrumentation snapshots,
normal and fallback timings, console status, and manual-only limitations.
Owner must send exactly:

```text
PF1D.2 PASS
```

before finalization. Do not build, commit, push, merge, or open a pull request.

## Error and Edge-Case Matrix

| Case | Test or verification | Required result |
|---|---|---|
| Canvas2D context unavailable | PF1D.2B source contract plus a disposable-page `getContext("2d")` fault before mount | Shell remains reachable; no false readiness; App fallback releases; project state remains intact. |
| WebGL renderer unavailable | PF1D.2C source contract plus a disposable-page renderer-creation fault | No readiness or continuous motion; fallback releases; canonical state remains intact. |
| Preparation render throws | PF1D.2A thrown-render unit test and renderer bounded-diagnostic contract | Scheduler catches the frame boundary, no automatic loop starts, readiness is absent, and explicit retry remains possible. |
| Zero-size dimensions | PF1D.2B/PF1D.2C browser resize fault and PF1D.2D fallback timing | No prepared claim at zero size; latest valid size prepares later; fallback does not reset state. |
| Multiple theme changes while paused | Classic and Organism counter snapshots | Only the final theme is retained; Canvas counters do not change. |
| Multiple space changes while paused | Canonical snapshot before resume plus render counters | Only latest canonical state is projected on resume; hidden frames remain zero. |
| Renderer mode changes while Table is active | PF1D.2D rapid-switch browser sequence | Prior identity is invalidated; only the newly selected renderer may satisfy resume. |
| Canvas selected and immediately Table selected | App lifecycle browser sequence | Preparation is repaused, timeout is cleared, callbacks are invalidated, and Table remains protected. |
| Late readiness from the previous renderer | Generation/identity contract and browser sequence | Callback is ignored and cannot release the scrim. |
| Timeout firing after successful readiness | Fake timing observation and real browser timestamps | Matching readiness clears the one timeout; no later release affects a new generation. |
| Component unmount with active timeout | App cleanup contract and disposable-page unmount | Timeout is cleared and callback ownership is invalidated. |
| Export requested while paused | Existing export UI with before/after visible counters | Detached export uses latest canonical state without waking Canvas or emitting readiness. |
| Reduced-motion switching | Organism motion and App transition matrix | Motion intent updates without hidden frames; destination state prepares once; no state resets. |

No failure path may reset project state.

## Acceptance Coverage Review

| Approved requirement | Owning gate |
|---|---|
| Reversible scheduler pause, collapsed invalidation, remembered continuous intent, terminal cancellation | PF1D.2A |
| Classic zero hidden draw/theme/resize/performance work and prepared resume | PF1D.2B |
| Classic context failure, thrown draw, zero size, paused export | PF1D.2B and PF1D.2E |
| Organism zero hidden membrane/presentation/derivation work | PF1D.2C |
| Organism destination-theme normalization and post-readiness motion | PF1D.2C |
| Organism renderer failure, thrown preparation, zero size, paused export | PF1D.2C and PF1D.2E |
| App generation, renderer identity, timeout, cleanup, fallback, and scrim ownership | PF1D.2D |
| PF1D.1E geometry, animation, stacking, ViewToggle, lazy request, and widget continuity | PF1D.2D and PF1D.2E |
| Zero hidden frames, theme independence, latest state, first-frame theme, readiness timing, deliberate fallback | PF1D.2E |
| No PF1D.3 dense-row/search/sort/import scope | Global constraints and every gate file boundary |

## Finalization — Dormant Until Exact Owner PASS

Do not execute this section until the Owner sends exactly:

```text
PF1D.2 PASS
```

Finalization then runs in a fresh bounded session from the Owner-supplied
source SHA:

1. Reverify branch, full HEAD, remote source SHA, working tree, and exact
   PF1D.2 file set.
2. Run the final focused command from PF1D.2E and record every pass count.
3. Run `npx tsc -b --pretty false`.
4. Run exactly one production build: `npm run build`.
5. Recap the approved browser evidence, including normal readiness,
   deliberate fallback, counters, themes, viewports, motion, reduced motion,
   rapid switching, state parity, console, and framework-overlay status.
6. Update only the closeout truth in:
   - `docs/project-engine/ACTIVE_TASK.md`
   - `docs/project-engine/STATE.md`
   - `docs/project-engine/ROADMAP.md`
   - `docs/project-engine/LEDGER.md`
   - `docs/project-engine/REPO_MAP.md`
   - `docs/project-engine/PARITY_MATRIX.md`
7. Create the product commit with:

   ```text
   perf: pause canvas rendering in table workspace
   ```

8. Create the documentation commit with:

   ```text
   docs: close PF1D.2 canvas pause lifecycle
   ```

9. Push only `feature/pf1d-lazy-workspaces` and verify the remote SHA equals
   the local documentation commit.
10. Verify `git status --short` is empty and report both commit SHAs.
11. Do not merge and do not open a pull request without an explicit Owner
    command.

The suggested messages above are future finalization instructions only.

## Plan Self-Review Record

- [x] Every approved-spec requirement maps to a gate or edge-case row.
- [x] PF1D.2A through PF1D.2E are independently testable and have separate
  Manual Prompt Mode stops.
- [x] `DemandFrameLoop` and `CanvasActivityProps` names are consistent.
- [x] Scheduler pause is reversible and cancellation remains terminal.
- [x] App alone owns the single 400ms timeout.
- [x] Neither renderer owns a resume timeout.
- [x] Classic and Organism detached export paths remain independent.
- [x] PF1D.3 scope is excluded.
- [x] Browser performance evidence is mandatory.
- [x] No product commit occurs before exact Owner PASS.
- [x] No automatic worker dispatch is permitted.
