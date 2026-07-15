# C0 M1 Correction 4 — Global `I` Inspector Shortcut

**Status:** CORRECTION REQUIRED — same authorized M1 task
**Worker:** Codex
**Repository:** `barc047-sketch/Mooorf`
**Work branch:** `feature/c0-m1-inspector-layer-editing-recovery`
**Exact correction base:** `f2d6f99c34257a04e42d4dd6aae2f9b59898d8f6`
**Protected production:** `main@c4600472ea76f651800c19b91cf8f67954ca992e`

## 1. Owner finding

Correction 3 fixed the rendered Dock/Rail Inspector controls and proved pointer click plus Enter/Space activation while those buttons were focused. It did **not** implement the approved global keyboard shortcut from the Claude Inspector prototype.

Owner verification:

- pressing keyboard `I` while the Canvas/Table surface has focus does nothing;
- Escape works;
- right-click workflows work;
- rendered Inspector buttons now work.

The production `MainApp` contains no global `I` keyboard-command listener. Therefore M1 remains blocked.

## 2. Required canonical behaviour

One global command owns the Inspector shortcut.

### `I` key behaviour

When focus is not inside an editable control and no Ctrl/Meta/Alt modifier is held:

- Inspector closed → open, expand, focus and reveal inside viewport;
- Inspector minimized → expand, focus and reveal;
- Inspector behind another widget → bring to front and reveal, do not close;
- Inspector partly off-screen → restore into viewport and focus;
- Inspector already full, frontmost and reachable → close it, preserving the approved prototype toggle behaviour.

Support both lowercase and uppercase through `event.key.toLowerCase() === "i"` or an equivalent layout-safe command mapping.

Ignore repeated keydown events.

### Editing guards

Typing `i` or `I` must remain normal text input when the event target is any of:

- `input`,
- `textarea`,
- `select`,
- `[contenteditable="true"]`,
- a textbox/combobox/spinbutton-like editable role,
- the inline Cell editor,
- any future text editor surface.

Do not intercept `Ctrl+I`, `Meta+I` or `Alt+I`.

### Escape

Preserve the current working Escape behaviour. Do not create conflicting global listeners or alter content-edit cancellation.

## 3. Architecture constraints

1. Reuse the existing canonical widget lifecycle and store actions.
2. Do not create a second Inspector, keyboard-only widget state or duplicate command registry.
3. Prefer one reusable command/shortcut owner at the application shell or established command layer.
4. Dock, Rail and keyboard shortcut must converge on the same canonical Inspector activation/toggle semantics.
5. Add `Inspector (I)` to launcher tooltips where appropriate without changing the visual icon.
6. No M2, shadow, runtime-gate, Quick Bar, snapping, material or Symbol work.

## 4. Real-browser acceptance tests

Use physical browser keyboard input against the built app. Do not prove the shortcut through direct store/helper calls.

Required scenarios at 1440×900 and 1280×800:

1. Canvas body focused, Inspector closed, press `i` → exactly one full Inspector opens.
2. Press `I` with Shift → same command.
3. Inspector minimized, press `i` → expands and becomes reachable.
4. Inspector behind another widget, press `i` → focuses/reveals rather than closes.
5. Inspector off-screen, press `i` → viewport-contained.
6. Table focused, press `i` → full Inspector opens.
7. Full frontmost Inspector, press `i` → closes.
8. Name, Area, Body, Table fields and inline editor: typing `i` inserts text/value where valid and does not toggle Inspector.
9. Ctrl/Meta/Alt+I do not toggle Inspector.
10. Escape remains functional.
11. No duplicate Inspector frames or duplicate key listeners after view switches/remounts.

Record the real event target, view, pre-state and post-state in the M1 report.

## 5. Verification

Run:

- focused shortcut/browser integration tests;
- affected M1 tests;
- typecheck;
- `git diff --check f2d6f99c34257a04e42d4dd6aae2f9b59898d8f6...HEAD`;
- exactly one final production build;
- deterministic 1440×900 and 1280×800 QA.

Update:

- `docs/C0_M1_INSPECTOR_LAYER_EDITING_REPORT.md`;
- `docs/C0_M1_CONTROL_OWNERSHIP_MAP.md`;
- `worker-status/CODEX.json` on `status/codex`.

Push one corrected fixed head, return to `WAITING_REVIEW`, and stop.

Do not merge. Do not start M2.