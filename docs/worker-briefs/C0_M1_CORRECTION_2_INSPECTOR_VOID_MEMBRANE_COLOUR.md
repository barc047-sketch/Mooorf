# Codex Correction Contract — C0 M1 Correction 2: Inspector Restore, Void Echo and Membrane Colour Truth

**TASK:** `C0-M1-CORRECTION-2`
**STATUS:** Required same-branch correction under the already-authorized M1 milestone
**WORKER:** Same Codex M1 implementation session
**WORK BRANCH:** `feature/c0-m1-inspector-layer-editing-recovery`
**CURRENT REVIEWED HEAD:** `484ddeb859fcb18256a6acf7b7287e2be917aedc`
**PRODUCTION MAIN:** must remain `c4600472ea76f651800c19b91cf8f67954ca992e`

## 1. Why M1 is still not merge-ready

Owner browser review confirmed that the previous correction solved Boundary, Core-off, Void creation and the other reported issues, but found three remaining product defects.

### A. Inspector launcher does not reliably open the Inspector

The current dock/rail launcher calls `openWidget("inspector")`. `openWidget` can mount or focus a widget, but `WidgetFrame` owns `minimized` as private local state. Therefore a minimized Inspector can remain only a header chip when the Owner clicks the `i` launcher, which is experienced as “the button does not open the Inspector.” A launcher also needs to recover a reachable frame if its remembered offset is no longer useful.

This must be fixed generically for the widget system, not with an Inspector-only DOM hack.

### B. Void has an unexplained hard-coded inner circle

The current `CircleVoidProjection` always creates an `innerRadiusPx` at `0.42 × outer radius` and draws an inner edge at `0.68 × outer edge opacity`. There is no Inspector setting for this inner echo.

A standard Void must not show an unexplained second circle. The inner echo may return only as an explicit advanced Void presentation option in M2, default OFF.

### C. Membrane colour control cannot produce a true solid colour

The current Organism shader blends the membrane body 88% toward spatial Cell colours whenever Cell colour weights exist. This preserves the attractive current Cell-derived gradient, but it prevents the exposed Membrane colour control from producing a genuinely solid membrane.

The current gradient must remain. M1 must add an explicit truthful choice rather than silently replacing it.

## 2. Required correction

### 2.1 Generic open-or-restore widget semantics

Implement one canonical ephemeral widget-launch action used by dock, rail and other launchers.

Clicking a widget launcher must behave as follows:

- closed → mount, expand and focus;
- open behind another widget → focus;
- minimized → expand and focus;
- remembered outside a useful viewport area → clamp/reveal it so the title and body are reachable;
- repeated click must not close the widget unless a separate explicit close action is used.

Requirements:

- use the shared widget lifecycle/host/frame architecture;
- do not query arbitrary DOM selectors from Dock;
- do not special-case only `inspector` if the underlying defect applies to every widget;
- keep minimization ephemeral and non-persistent;
- Dock and Rail `i` launchers both use the same action;
- active/open/minimized accessibility state must be truthful;
- one click must visibly show the full Inspector body at 1440×900 and 1280×800.

### 2.2 Remove the default Void inner echo

For corrected M1:

- standard Void appearance has one outer fill and one outer edge only;
- remove the unconditional `innerRadiusPx` / `innerEdgeOpacity` projection and draw path;
- remove the same unexplained inner echo from PNG, SVG and PDF/export paths if duplicated there;
- do not alter Void subtraction, area contribution, hit testing, drag geometry or clearance semantics;
- do not add a hidden setting or compatibility toggle just to preserve the old visual;
- document `Inner Echo` as an optional M2 advanced Void control, default OFF, only if live/export parity is later implemented.

### 2.3 Add explicit Membrane colour source

Add one canonical persisted Membrane field colour source/mode with exactly these initial choices:

1. `Cell Gradient` — current behaviour and current default; keeps spatial colour inheritance from Cells.
2. `Solid` — ignores spatial Cell colour dominance for the membrane body and renders one truthful field colour.

When `Solid` is active, expose compact preset choices:

- Black,
- Ink,
- MOOORF Red,
- Charcoal,
- Custom.

Rules:

- preserve the existing Cell Gradient mode unchanged;
- use canonical material/colour tokens or registry-backed IDs where available; do not create a second UI-only material catalogue;
- Custom uses the existing Membrane colour control;
- the selected mode, preset/custom colour and opacity persist, undo/redo and export truthfully;
- Classic fallback/projection and Organism must represent the selected mode consistently where applicable;
- clean PNG/PDF and supported SVG/project export/import must preserve the choice;
- do not implement the full Material Browser, recents, favourites or Material Studio in M1;
- leave a clean compatibility seam so M4 Material Rail/Browser operates on the same canonical material IDs/mode rather than duplicating state.

### 2.4 Softness ownership remains M2, but must be recorded precisely

Do not expand M1 into the full advanced Membrane milestone.

M2 must add inside the same Inspector:

- `Membrane → Field → Field Edge Softness`: the existing field/body feather owner;
- `Membrane → Edge → Edge Softness`: an independent presentation-band softness owner, not a duplicate alias of Field softness;
- both controls must have distinct visible effects, history/persistence/export support and performance gates;
- unsupported glow/pulse remains absent.

Update the M1 report and M2 preview so neither control can be forgotten or collapsed into one misleading slider.

## 3. Executable tests

Add behavioral and renderer tests for:

- Inspector closed → launcher mounts expanded body;
- Inspector minimized → launcher restores expanded body;
- Inspector behind another widget → launcher focuses it;
- generic launcher restore semantics apply to another widget as proof the fix is not Inspector-only;
- standard Void projection/drawing contains no inner echo;
- Void subtraction and outer fill/edge remain unchanged;
- `Cell Gradient` mode preserves current spatial Cell-gradient behaviour;
- `Solid` mode ignores spatial Cell colour dominance;
- Black, Ink, MOOORF Red and Charcoal resolve deterministically;
- Custom solid colour works;
- colour source/mode round-trips through history, saved views/project persistence and exports;
- no duplicate material registry or state owner is introduced.

Source-string assertions alone are insufficient for launcher restoration and shader/renderer colour behaviour.

## 4. Browser QA

At both `1440×900` and `1280×800`, record deterministic evidence for:

1. close Inspector, click `i`, full Inspector body appears;
2. minimize Inspector, click `i`, full body expands;
3. place another widget over Inspector, click `i`, Inspector comes to front;
4. Add Void shows no unexplained inner circle;
5. Void still subtracts, selects, drags and edits outer fill/edge;
6. Membrane `Cell Gradient` looks exactly like the current gradient behaviour;
7. Membrane `Solid` visibly produces Black, Ink, MOOORF Red and Charcoal bodies without Cell colour patches;
8. Custom solid colour and opacity work;
9. no console errors, widget collision or viewport overflow.

## 5. Verification

Run:

- new focused widget lifecycle and renderer tests;
- all affected M1/C0.4F-A tests;
- application typecheck;
- `git diff --check 484ddeb859fcb18256a6acf7b7287e2be917aedc...HEAD`;
- exactly one final production build after all correction work;
- deterministic browser QA above.

Update:

- `docs/C0_M1_INSPECTOR_LAYER_EDITING_REPORT.md`,
- `docs/C0_M1_CONTROL_OWNERSHIP_MAP.md`,
- `worker-status/CODEX.json`.

## 6. Completion

Push one corrected fixed head to the same feature branch. Set `status/codex` to `WAITING_REVIEW` with:

- previous reviewed head `484ddeb859fcb18256a6acf7b7287e2be917aedc`,
- corrected feature SHA,
- exact test/build/QA evidence,
- issue disposition for Inspector restore, Void inner echo and Membrane Cell Gradient/Solid modes.

Stop. Do not merge. Do not start M2.