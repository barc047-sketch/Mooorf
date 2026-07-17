# PF1D.2 — Canvas Pause and Table Theme Performance Design

## Status and approved decisions

- Owner approval: **PF1D.2 DESIGN APPROVED**
- Branch: `feature/pf1d-lazy-workspaces`
- Base SHA: `1683e96f6f77eca29f4e771812c1fc71b4c90fce`
- PF1D.1E is complete, pushed, and unmerged.
- Selected strategy: **Full Canvas pause**.
- Selected recovery: **one prepared current-state frame plus an App-owned 400ms fallback**.
- Production implementation, build, push, and merge remain unauthorized.

## Goal

While Table mode is active:

- Classic Canvas performs zero drawing work.
- Organism Canvas performs zero drawing work.
- Continuous Organism motion stops.
- Hidden theme changes do not repaint Canvas.
- Hidden spaces, settings, camera, selection, and resize changes do not repaint Canvas.
- Hidden presentation layers do not draw.
- Performance frame reporting stops.
- Project state and renderer resources remain mounted and preserved.
- Table Day/Night switching stays independent of Canvas rendering.

When returning to Canvas:

- The existing static scrim remains visible.
- Canvas consumes the latest canonical state and current theme.
- One complete fresh frame renders beneath the scrim.
- Readiness releases the scrim.
- Organism continuous motion resumes afterward.
- A 400ms safety fallback prevents permanent visual blocking.

## Non-goals

PF1D.2 does not include:

- virtualization;
- progressive rows;
- text-first cells;
- search;
- numeric area queries;
- sorting;
- upload;
- template download;
- an import-review drawer;
- a `TableView` redesign;
- store, schema, or persistence changes;
- renderer replacement;
- export redesign;
- a second scheduler; or
- a workspace registry.

The full-DOM Table cost remains PF1D.3 scope.

## Current architecture

- Classic and Organism both use the existing `createDemandFrameLoop` owner in
  `src/interaction/frameScheduler.ts`.
- Classic is demand-driven. It schedules work after invalidation and while
  bounded drawing or camera interpolation still needs another frame.
- Organism is demand-driven but can request continuous frames while resolved
  Organism motion is active.
- Both renderers subscribe to canonical store changes and observe root theme
  changes. Those changes currently invalidate their live render loops.
- Canvas remains persistently mounted beneath the PF1D.1E Table overlay.
  Inertness, `aria-hidden`, pointer isolation, and visual concealment currently
  do not stop renderer-owned work.
- The Table is the approved lazy, conditional, floating Motion overlay.
- Its static non-blur scrim protects transition frames.
- Canvas, the four chrome layers, Table, and `ViewToggle` are direct children of
  one isolated app-shell stacking root.
- Reversible renderer-loop pausing does not exist yet.
- Existing detached export registration is independent of the mounted
  presentation canvas and remains available while the visible renderer is
  paused.
- The existing static scrim can protect the fresh resume-preparation frame.
- `TableView` currently renders every space with `spaces.map`. Virtualization
  remains PF1D.3.

## Shared frame-loop pause contract

The existing interface is extended in place:

```ts
export interface DemandFrameLoop {
  invalidate(): void;
  setContinuous(active: boolean): void;
  setPaused(paused: boolean): void;
  isPaused(): boolean;
  cancel(): void;
}
```

`createDemandFrameLoop` remains the only renderer frame-loop scheduler. The
pause capability is a reversible lifecycle state of that owner, not a second
scheduler and not a replacement loop.

### State model

The loop distinguishes:

- **pending invalidation**: one collapsed request for current-state work;
- **requested continuous state**: the caller's latest continuous-motion intent;
- **paused state**: scheduling is temporarily prohibited;
- **scheduled frame**: at most one owned animation-frame callback;
- **resume preparation**: the first frame scheduled by a paused-to-active
  transition; and
- **cancelled state**: terminal cleanup.

Pending invalidation is boolean ownership. Repeated invalidations never build a
queue or preserve intermediate snapshots.

### Pause semantics

`setPaused(true)`:

- is idempotent;
- marks the loop paused immediately;
- cancels any currently scheduled animation frame;
- retains one pending invalidation when work was already invalidated;
- preserves the latest requested continuous state;
- prevents all new frame scheduling;
- makes `invalidate()` record pending work without scheduling;
- makes `setContinuous()` record the latest intent without scheduling;
- leaves `isPaused()` returning `true`;
- remains reversible; and
- does not perform permanent cancellation.

If a frame was scheduled only because continuous mode was active, preserving
the continuous intent is enough to require a preparation frame on resume. If a
scheduled invalidation frame is cancelled, its invalidation remains pending.

### Resume semantics

`setPaused(false)`:

- has no effect after terminal cancellation;
- is idempotent when the loop is already active;
- changes `isPaused()` to `false`;
- schedules exactly one resume-preparation frame when pending invalidation or
  requested continuous work exists;
- schedules no frame when neither condition exists;
- never duplicates an already scheduled frame; and
- permits ordinary continuous scheduling only after that preparation callback
  completes successfully.

The renderer activity owner must record a pending full redraw before it resumes
the loop. Therefore a Canvas workspace activation always has preparation work,
even if no store, theme, or size event occurred while Table was active.

For the scheduler, a preparation callback succeeds only when its render
callback returns normally. Invalidation raised during that callback is
collapsed into the next frame. Requested continuous work may schedule its next
frame only after the preparation callback returns normally. If preparation
throws, the loop catches the frame-boundary failure, retains one pending
invalidation, schedules no automatic continuous follow-up, and remains
eligible for a later explicit invalidation or activation retry. The renderer
owns bounded diagnostics and must not emit readiness for that failed frame.

If `setPaused(true)` runs after resume but before the preparation callback
executes, it cancels that callback and retains the pending preparation work for
the next valid resume.

### Cancel semantics

`cancel()` is permanent cleanup:

- it is idempotent;
- it cancels the scheduled frame;
- it clears pending invalidation;
- it clears requested continuous state;
- it makes future pause/resume calls inert;
- it cannot be resumed; and
- invalidation or continuous changes after cancellation schedule nothing.

`isPaused()` reports reversible pause state, not cancellation. A cancelled loop
must not be mistaken for a resumable paused loop.

### Required edge-case behaviour

| Case | Required result |
|---|---|
| Pause with a frame already scheduled | Cancel the callback and retain one pending invalidation or continuous intent. |
| Repeated invalidations while paused | Retain one pending invalidation and schedule zero frames. |
| Continuous toggles while paused | Retain only the latest requested boolean and schedule zero frames. |
| Resume with pending work | Schedule exactly one preparation frame. |
| Resume with continuous intent but no invalidation | Schedule exactly one preparation frame before continuous work. |
| Resume with neither pending nor continuous work | Schedule nothing. Renderer activation prevents this case by first recording a full redraw. |
| Repeated resume | Do not duplicate the scheduled preparation frame. |
| Repause before preparation | Cancel preparation and retain its pending work. |
| Cancel while paused | Clear all retained work and make the loop terminal. |
| Invalidate after cancel | Record and schedule nothing. |

## Renderer activity contract

Both renderer components receive the same activity contract:

```ts
interface CanvasActivityProps {
  active: boolean;
  onResumeReady?: () => void;
}
```

`active` describes visible Canvas workspace activity, not component mounting.
The App passes it to the one mounted renderer selected by the canonical
renderer mode.

### Inactive renderers

When `active` becomes `false`, each renderer:

- pauses its demand frame loop;
- cancels queued pointer and wheel scheduler work;
- suppresses all drawing;
- suppresses performance reporting;
- suppresses presentation-layer painting;
- suppresses hidden resize work;
- preserves renderer resources;
- preserves canonical store, governor, theme, reduced-motion, and resize
  subscriptions;
- preserves detached export registration;
- preserves camera, selection, settings, history, and project data; and
- remains mounted.

Event callbacks may update lightweight latest-value ownership while inactive,
but they must not call expensive drawing or derivation paths.

### Active renderers

When `active` becomes `true`, each renderer:

1. records a pending full redraw while its loop is still paused;
2. reads only the latest canonical store snapshot;
3. reads the current root theme;
4. applies the latest required dimensions;
5. rebuilds derived render data once;
6. resumes the shared frame loop;
7. completes one full current-state presentation frame;
8. calls the activation-owned `onResumeReady` only after that presentation
   succeeds; and
9. allows Organism continuous motion to proceed only afterward.

No timeout exists inside either renderer. A renderer readiness callback is
specific to the activation that supplied it and is not a global Canvas-ready
claim.

## Hidden-update collapsing

While paused, each renderer retains only lightweight latest ownership:

- latest relevant store snapshot or references;
- one pending data-refresh flag;
- one pending theme-refresh flag;
- latest pending dimensions; and
- one pending full-redraw flag.

While paused, renderers do not repeatedly perform:

- `applySpacePositionsPreview`;
- presentation projection;
- palette generation;
- Cell-colour mapping;
- membrane-field derivation;
- label reconstruction;
- render-target resizing;
- WebGL render or present;
- Canvas2D drawing; or
- performance frame reporting.

Intermediate hidden states are disposable. On resume, the renderer consumes
only the latest canonical state, performs expensive derivation once, and
renders one complete current-state frame.

## Theme lifecycle

While Table is active:

- root `data-theme` changes normally;
- Table, `ViewToggle`, and shell CSS repaint immediately;
- Canvas records only the final theme;
- Canvas schedules no animation frame;
- Organism interpolation does not run invisibly; and
- repeated Day/Night changes collapse to the final theme.

On return:

- the preparation frame uses the destination theme directly;
- no previous Day or Night frame may be revealed;
- Organism smoothing and interpolation may resume only after the protected
  frame; and
- theme-transition state is normalized so it cannot expose a stale palette.

The prepared frame is a current-theme frame, not the next step of a hidden
theme interpolation.

## Protected resume lifecycle

The return to Canvas follows this lifecycle:

1. Canvas is selected.
2. The Table panel begins its existing exit.
3. The static scrim remains visible and pointer-protective.
4. The active renderer resumes underneath.
5. The renderer reads the latest theme, data, settings, camera, and selection.
6. The renderer completes one full frame.
7. The renderer emits readiness for the current resume generation.
8. Matching readiness releases the scrim.
9. Chrome finishes its existing restoration.
10. Organism continuous motion proceeds.

PF1D.2 does not redesign the PF1D.1E overlay, geometry, stacking, or animation
hierarchy.

## App-owned 400ms fallback

The App owns local lifecycle state only:

- resume-pending state;
- a monotonically increasing resume-generation ref;
- one timeout ref; and
- active renderer identity only when required to reject a stale renderer
  callback.

This ownership is React-local. It is not Zustand state, persistence, or a
renderer-owned timeout.

### Normal path

When Canvas is selected:

1. increment the resume generation;
2. mark the current generation resume-pending;
3. activate the selected renderer with a readiness closure for that generation
   and renderer identity;
4. start one 400ms fallback;
5. keep the existing scrim mounted and pointer-protective;
6. accept readiness only when generation, current view, and renderer identity
   still match;
7. clear the timeout;
8. release the scrim; and
9. mark the resume complete.

Renderer readiness is the normal release path. It means a complete fresh frame
was presented successfully.

### Fallback path

If matching readiness has not arrived after 400ms:

- release the scrim;
- emit one bounded, non-fatal development/runtime diagnostic;
- do not claim renderer readiness;
- do not reset project state; and
- do not recreate the renderer.

The fallback prevents permanent visual blocking. It is not evidence that the
renderer prepared successfully.

### Rapid switching and cleanup

- Switching back to Table cancels the fallback timeout.
- Every relevant view or renderer transition changes callback ownership.
- A generation change invalidates late readiness.
- A stale callback cannot expose Canvas over Table.
- Only one timeout may exist.
- A timeout that fires after successful readiness is prevented by cleanup and
  cannot release a later generation.
- Component unmount clears the timeout and invalidates callback ownership.

## Classic Canvas design

Classic uses the shared loop pause API and the common activity props.

While inactive:

- latest canonical store references win;
- store, governor, theme, and resize notifications collapse into lightweight
  pending flags;
- no hidden `drawScene` occurs;
- no hidden token redraw occurs;
- no hidden target resize occurs;
- no hidden performance report occurs;
- queued pointer and wheel work is cancelled; and
- camera, gesture state, subscriptions, the 2D context, and detached export
  registration remain intact.

For resume preparation, Classic:

1. reads the latest spaces, settings, selection, camera, and root theme;
2. applies the latest host size and device-pixel ratio once;
3. clears obsolete camera interpolation that would reveal an intermediate
   hidden state, while preserving the latest canonical camera;
4. performs one full `drawScene`; and
5. emits readiness only after that draw succeeds.

An unavailable Canvas2D context or a thrown draw does not emit readiness.
Classic remains eligible for a later retry. Detached export stays operational
while the visible Classic Canvas is paused because export uses its independent
offscreen draw path and canonical snapshot.

## Organism Canvas design

Organism uses the shared loop pause API and the common activity props.

While inactive:

- requested `resolved.motionActive` remains remembered;
- continuous scheduling remains inactive;
- store changes record only latest references and refresh flags;
- theme changes record only the final root theme;
- `ResizeObserver` records only the latest dimensions;
- no expensive derived presentation is rebuilt;
- no membrane render, clear, or present occurs;
- no presentation-layer canvas draws;
- no label or grid reconstruction occurs;
- no performance frame reports occur;
- queued pointer and wheel work is cancelled;
- its WebGL context and render resources remain mounted; and
- detached export remains independent.

For resume preparation, Organism:

1. reads the latest canonical state and current root theme;
2. resolves current settings, performance profile, reduced motion, and motion
   intent;
3. applies the latest required presentation and render-target dimensions once;
4. discards hidden intermediate derived states;
5. rebuilds palette, Cell colours, presentation projection, membrane field,
   labels, grid, and related derived data once;
6. normalizes smoothing and `themeTransitionUntil` to the destination theme;
7. renders and presents one full membrane/current-mode frame;
8. draws the complete current presentation layer;
9. emits readiness only after both membrane/current-mode presentation and
   presentation-layer drawing succeed; and
10. enables remembered continuous motion only after readiness.

No frame using the previous theme may be exposed. If no membrane is active,
the preparation still completes the renderer's correct clear/present path plus
the presentation layers before readiness. A missing WebGL renderer or a thrown
preparation does not emit readiness and does not dispose canonical state.

Detached Organism export remains independent because it renders from the
canonical snapshot through `renderDetachedOrganismExport`, not by reading or
unpausing the live WebGL surface.

## Resize and visibility

- `ResizeObserver` may retain the latest host dimensions while paused.
- Live Canvas render targets do not resize repeatedly while Table is active.
- At most one required resize occurs before the preparation frame.
- A zero-size observation is retained but is not treated as a successful
  prepared frame.
- Preparation waits for valid dimensions or fails safely into the App fallback.
- PF1D.2 does not rely on `display: none`.
- Canvas DOM, renderer contexts, resources, and subscriptions remain mounted.
- Scrim, inertness, `aria-hidden`, and pointer isolation remain App-owned.

## Export

- Existing detached export paths remain active.
- Export does not unpause the visible Canvas.
- Export reads the latest canonical project snapshot.
- Export completion does not trigger resume readiness.
- No screenshot buffer, live-buffer readback, or new capture owner is added.
- Export while paused neither schedules a visible Canvas frame nor changes the
  paused loop's continuous intent.

## Failure and recovery

| Failure or race | Required behaviour |
|---|---|
| Canvas2D context unavailable | Do not crash the App shell or emit false readiness; allow the 400ms fallback and later retry. |
| WebGL renderer unavailable | Do not emit readiness; preserve project state and let fallback release the scrim. |
| Preparation render throws | Contain the frame-boundary failure, emit a bounded non-fatal diagnostic, retain retry eligibility, and do not start continuous motion. |
| Zero-size resize | Record the latest size, skip false readiness, and retry on a valid resize or later activation. |
| Repeated theme changes while paused | Retain only the final theme and perform zero Canvas frames. |
| Repeated data changes while paused | Retain only latest canonical ownership and one full-refresh flag. |
| Renderer mode changes while Table is active | Keep both view selection and readiness ownership generation-safe; only the selected renderer may satisfy the next Canvas resume. |
| Canvas selected and Table immediately reselected | Cancel preparation scheduling through pause, cancel the timeout, invalidate callbacks, and keep Table protected. |
| Late readiness from an old renderer | Ignore it by generation, view, and renderer identity. |
| Timeout after successful readiness | Prevent it by clearing the one owned timeout before releasing the matching generation. |
| Component unmount with pending timeout | Clear timeout and invalidate readiness ownership. |
| Export while paused | Run detached export from the latest canonical snapshot without waking the visible Canvas or emitting readiness. |

Across all failures:

- the App shell does not crash;
- readiness is never falsely claimed;
- the fallback releases the scrim after 400ms;
- timeout cleanup occurs;
- the renderer remains eligible for a later retry;
- project state is never reset; and
- diagnostics remain bounded and non-fatal.

## File ownership

Expected implementation ownership is:

- `src/interaction/frameScheduler.ts`
  - reversible pause semantics;
- `src/interaction/frameScheduler.test.ts`
  - scheduler unit tests;
- `src/canvas/CanvasView.tsx`
  - Classic activity and preparation readiness;
- `src/canvas/OrganismCanvasView.tsx`
  - Organism activity, hidden-update collapsing, and motion restart;
- `src/App.tsx`
  - activity props, generation-safe gate, and the 400ms fallback;
- `src/App.css`
  - only if the existing scrim needs explicit resume-pending ownership;
- `src/runtime/pf1d2Contracts.test.ts`
  - architecture contracts; and
- existing integration and parity tests
  - only where the behaviour belongs.

This is an ownership map, not a requirement to change every listed file.

## Testing strategy

### Scheduler unit tests

- pause cancels a scheduled frame;
- paused invalidation schedules zero frames;
- repeated invalidations collapse;
- continuous state is remembered while paused;
- resume schedules exactly one preparation frame;
- repause prevents preparation;
- repeated resume does not duplicate a frame;
- cancel is terminal; and
- `isPaused()` remains accurate.

### Renderer tests

- an inactive renderer schedules no draw;
- an inactive theme change schedules no Canvas frame;
- an inactive data change schedules no Canvas frame;
- latest state wins on resume;
- readiness occurs only after a successful fresh frame;
- a failed render emits no readiness; and
- Organism continuous motion restarts only after readiness.

### App gate tests

- the scrim remains while resume is pending;
- matching readiness releases it;
- the 400ms fallback releases it without claiming readiness;
- Table reactivation cancels pending release;
- stale readiness is ignored; and
- rapid switching leaks no timeout.

### Parity tests

- spaces;
- camera;
- selection;
- renderer mode;
- open, moved, and minimized widgets;
- Inspector shortcut;
- Loader and readiness ownership; and
- Table lazy-request deduplication.

## Browser performance evidence

Implementation QA must prove the following runtime behaviour.

While Table is active:

- Classic frame count remains unchanged;
- Organism membrane count remains unchanged;
- Organism presentation count remains unchanged;
- Canvas performance-report count remains unchanged;
- multiple theme switches change no Canvas counters;
- hidden data edits change no Canvas counters; and
- no Canvas-owned animation frame remains active.

On resume:

- the scrim remains visible;
- exactly one preparation frame occurs before reveal;
- the current theme appears in the first visible frame;
- normal readiness resolves before 400ms;
- motion resumes only after readiness; and
- the fallback can be deliberately exercised.

The browser test matrix is:

- Classic Day and Night;
- Organism Day and Night;
- motion enabled and disabled;
- reduced motion;
- 1440×900;
- 1280×900;
- rapid repeated switching; and
- at least 300 spaces when practical.

Source tests alone are insufficient evidence for implementation acceptance.

## Acceptance criteria

### Table active

- zero Canvas drawing;
- zero hidden theme frames;
- zero hidden performance reports;
- Organism motion suspended;
- Table remains interactive;
- theme switching does not wake Canvas; and
- canonical edits still persist.

### Canvas return

- latest state;
- latest theme;
- one prepared frame;
- no stale-theme flash;
- readiness releases the scrim;
- fallback releases by 400ms;
- no permanent pause; and
- Organism motion resumes afterward.

### Rapid switching

- no stale timeout;
- no stale readiness;
- no duplicate scheduler;
- no overlay leak;
- no state reset; and
- no console error.

### Parity

- PF1D.1E layout remains unchanged;
- Table remains above widgets;
- Canvas remains mounted;
- widget state remains preserved; and
- lazy Table loading remains deduplicated.

## Implementation gates

PF1D.2A — Demand Frame Loop Pause Semantics

PF1D.2B — Classic Canvas Full Pause and Prepared Resume

PF1D.2C — Organism Canvas Full Pause and Prepared Resume

PF1D.2D — App Resume Gate and 400ms Fallback

PF1D.2E — Integrated Browser Performance and Parity QA

Every gate remains subject to Manual Prompt Mode:

- implementation without build;
- no commit or push;
- Owner QA; and
- finalization only after explicit PF1D.2 PASS.

## Next milestone boundary

PF1D.3 remains:

- virtualized rows;
- progressive visible rows;
- text-first editing;
- global search;
- area queries;
- sorting; and
- large-data Table performance.

PF1D.4 and PF1D.5 remain upload, template, and import-review work.
