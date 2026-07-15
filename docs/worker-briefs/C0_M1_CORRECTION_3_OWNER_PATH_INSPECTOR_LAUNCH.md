# Codex Correction Contract — C0 M1 Correction 3: Real UI Inspector Launch

**TASK:** `C0-M1-CORRECTION-3`
**STATUS:** Required same-branch correction under the already-authorized M1 milestone
**WORKER:** Same Codex M1 implementation session
**WORK BRANCH:** `feature/c0-m1-inspector-layer-editing-recovery`
**CURRENT REVIEWED HEAD:** `c4f05a1b32029c6cb29f4cfaa41983ba7f77c8f9`
**PRODUCTION MAIN:** must remain `c4600472ea76f651800c19b91cf8f67954ca992e`

## 1. Why M1 is still blocked

Owner browser review says the visible `i` control still does not open the Inspector, even though internal lifecycle tests and worker browser QA report success.

This evidence conflict means the current tests prove the store/frame lifecycle in isolation but do not yet prove the exact Owner-facing rendered command path in the actual application shell.

The Owner-observed result is authoritative. Do not merge M1 until the real visible command works.

## 2. Required correction

### 2.1 Trace the exact rendered command path

Reproduce the failure from the built application by clicking the actual rendered controls, not by calling `useLab.getState().openWidget`, dev handles, synthetic store mutations or isolated lifecycle helpers.

Trace both:

- bottom Dock `i` control,
- left Rail `i` control.

Inspect and resolve the actual cause, including as applicable:

- stale or duplicate rendered launcher,
- pointer/click event interception,
- Motion parent transforms,
- canvas pointer capture,
- z-index or pointer-events layering,
- closed/minimized/focused widget state,
- view-specific shell composition,
- stale event closure,
- unreachable widget geometry,
- a different control being clicked than the test targets.

Do not guess. Record the reproduced cause in the implementation report.

### 2.2 One canonical Inspector command

Create or retain one shared application command for all Inspector launchers.

The exact user-visible result of one click, keyboard Enter or Space must be:

- Inspector closed → full Inspector mounts and is visible,
- Inspector minimized → full body expands,
- Inspector behind another widget → Inspector comes to front,
- Inspector partly or fully off-screen → full body returns to a reachable viewport position,
- no Cell selected → Inspector still opens with a truthful empty/no-selection state,
- Canvas view → works,
- Table view → works,
- repeated activation → keeps Inspector open/focused; it never toggles closed.

The command must not:

- create a second Inspector,
- create another store or WidgetHost,
- depend on direct DOM queries from Dock/Rail,
- modify project data or history,
- require the Owner to first open another left-panel destination.

### 2.3 Stable command identity and accessibility

Both visible launchers must expose a stable application command identity such as:

`data-command="open-inspector"`

and truthful:

- `aria-label`,
- `aria-haspopup="dialog"`,
- `aria-expanded`,
- active/focused visual state.

The icon may remain visually compact, but its hit target must be at least the existing 30 × 30 authored control size and must not be covered by another element.

### 2.4 Integration tests must click the real controls

Add built-application browser tests that:

1. locate the actual Dock control by `data-command`/accessible name;
2. dispatch a real pointer click;
3. assert exactly one `[data-widget="inspector"]` exists;
4. assert its body is rendered and non-minimized;
5. assert it is within the viewport;
6. repeat from minimized, background and no-selection states;
7. repeat for the Rail control;
8. repeat in Canvas and Table views;
9. test Enter and Space keyboard activation.

The test must fail if it calls store actions directly or relies on the dev-only `window.lab` handle.

Record the final rendered button bounds, target element, event path and resulting Inspector bounds at 1440×900 and 1280×800.

## 3. Scope guard

Correction 3 fixes only the real Inspector launch path and any generic launcher defect proven to cause it.

Do not begin:

- M2 advanced appearance,
- Cell Shadow instruments,
- runtime power gates,
- quick-toggle bar,
- snapping,
- Symbol tab,
- Materials,
- Connections,
- Annotations.

Those are mapped in `docs/plans/C0_CANVAS_QUICK_CONTROLS_RUNTIME_GATES_AND_SNAPPING_STAGE_PLAN.md`.

## 4. Verification

Run:

- new real-shell Inspector launcher integration tests,
- existing widget lifecycle tests,
- affected M1 tests,
- typecheck,
- `git diff --check c4f05a1b32029c6cb29f4cfaa41983ba7f77c8f9...HEAD`,
- exactly one final production build,
- deterministic 1440×900 and 1280×800 QA through the actual rendered Dock and Rail controls.

Update:

- `docs/C0_M1_INSPECTOR_LAYER_EDITING_REPORT.md`,
- `docs/C0_M1_CONTROL_OWNERSHIP_MAP.md`,
- `worker-status/CODEX.json`.

## 5. Completion

Push one corrected fixed head to the same feature branch. Set `status/codex` to `WAITING_REVIEW` with:

- previous reviewed head `c4f05a1b32029c6cb29f4cfaa41983ba7f77c8f9`,
- corrected feature SHA,
- exact reproduced root cause,
- real-control browser evidence,
- tests/typecheck/build/viewport results.

Stop. Do not merge. Do not start M2.