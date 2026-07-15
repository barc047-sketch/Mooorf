# Launch C0 M2 Correction 1

Execute the authorized bounded correction for `barc047-sketch/Mooorf`.

Read and obey:

`docs/worker-briefs/C0_M2_CORRECTION_1_OWNER_REVIEW_REGRESSIONS.md`

from:

`origin/docs/mooorf-ai-team-operating-protocol`

Work only on:

`feature/c0-m2-advanced-inspector-symbols-runtime-gates`

Verify exact starting head:

`1cc8ec0c7ab756bc6b091b87014da2c3e27383d2`

Before editing:

1. fetch origin;
2. confirm the work branch equals the exact correction base;
3. update `status/codex` to `RUNNING` for `C0 M2 Correction 1`;
4. read `docs/governance/FAST_OWNER_QA_MODE.md`.

Correct only:

- broken visible Layout preset/Random execution;
- selected-only versus all-entity arrangement scope for the current presets;
- one history transaction per arrangement;
- radius-aware non-overlapping batch Cell creation, multi-selecting the new batch and making the batch undoable;
- Symbol preview/revert flicker by separating canonical pane state from ephemeral Canvas preview;
- the hard-coded dashed Void edge;
- one shared current-six-style Stroke Style owner/control for Cell Boundary and Void Edge;
- Symbol Auto Contrast versus Custom tint;
- presentation-only Symbols on Void with live, persistence, history and export parity.

Preserve every Owner-confirmed M2 behavior.

Do not implement:

- common rail;
- visible Undo/Redo buttons;
- right-click Copy/Paste Style;
- the future expanded arrangement catalogue;
- Quick Bar or snapping;
- Material Browser;
- Wavy/Corner-Bracket styles;
- M3, M4 or M5 work.

Verification:

- focused tests only;
- affected history/persistence/migration/renderer/export contracts;
- TypeScript check;
- `git diff --check 1cc8ec0c7ab756bc6b091b87014da2c3e27383d2...HEAD`;
- exactly one final production build;
- no exhaustive CDP matrix;
- maximum 10 minutes of browser-harness tuning.

Push one fixed head to the same feature branch, update `status/codex` to `WAITING_REVIEW`, report a five-item Owner checklist, and stop.

Do not merge.