# C0.3 Claude Brief — Cell Inspector V2 Prototype

CODER: Claude Code
MODEL: Claude Fable 5 / strongest available Claude design model
EFFORT: High
EFFORT REASON: This is a focused visual and interaction refinement that expands the accepted symbol Inspector into a compact Cell Inspector while preserving production style and avoiding settings-form bloat.
ROLE: Cell Inspector V2 interaction and visual-prototype designer
WHY THIS MODEL: Strong visual hierarchy, compact control design and rapid interaction prototyping.
PARALLEL AGENT: Codex implements C0.2 icon/grid registries on an isolated feature branch. Antigravity is on hold. Do not touch their branches, worktrees, files or artifacts.

## Objective

Refine the accepted C0.3 prototype into **Cell Inspector V2** using the locked scope in:

`docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`

This remains an isolated prototype and production handoff. Do not implement production state or merge into main.

## Verified sources

Repository:
`/Users/tanisxq/Documents/ZONU0`

Production style source:
- `origin/main`
- exact SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

Accepted prototype source:
- branch: `design/c0-3-icons-symbols-inspector-lab`
- exact source commit: `e97e59984a74dee94675f77a22b270424a773115`

Create a new isolated branch from the exact accepted prototype commit:

`design/c0-3-cell-inspector-v2-lab`

Preferred worktree:

`/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3-V2`

Fetch all remotes and stop if either exact source SHA cannot be verified.

Preserve `.claude/launch.json`. Never switch, reset, clean or modify the primary ZONU0 checkout.

## Status before work

Follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Publish before starting:

- branch: `status/claude`
- file: `worker-status/CLAUDE.json`
- status: `RUNNING`
- task: `C0.3 Cell Inspector V2 prototype`
- source SHA: `e97e59984a74dee94675f77a22b270424a773115`
- work branch: `design/c0-3-cell-inspector-v2-lab`

Update at major checkpoints and finish at `WAITING_REVIEW`, not self-approved.

## Required reading

1. `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`
2. `docs/MOOORF_FINAL_SCOPE.md`
3. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
4. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
5. `docs/PROJECT_MEMORY_INDEX.md`
6. current production tokens and WidgetFrame/right-panel geometry at `92f4c64`
7. existing accepted C0.3 prototype at `e97e599`
8. Claude V1 Material Browser patterns, read-only
9. Claude V2 rail and shell patterns, read-only

## Plain-language scope

Turn the current symbol-only Inspector into one compact Cell Inspector with three tabs:

- Content
- Symbol
- Cell Style

### Content

Prototype:

- double-click Cell inline editing for Space Name, Area and Body,
- Enter commits,
- click outside commits,
- Escape cancels,
- Shift+Enter inserts a Body line break,
- visual indication that Name, Area and Body sync with the Table/Master Graph,
- Body displayed as approximately 2–3 lines without changing Cell size,
- Text Style preset previews,
- one global Text Size control for the complete heading/area/body system,
- Text Colour with Auto Contrast and compact palette dots,
- Project Default / Local Cell Override behavior,
- Mixed state for multi-selection.

Do not add per-role typography controls.

### Symbol

Keep one primary symbol per Cell.

Prototype:

- a large useful library of symbol choices,
- search, categories, recent, favourites,
- hover preview,
- apply/replace/remove,
- compact placement, scale, rotation, tint and backing controls,
- no `Include in Export` control,
- product UI icons separated from drawable symbols.

### Cell Style

Prototype compact controls for:

- quick material dots,
- Open Material Browser action,
- Boundary on/off, style, width and offset,
- Core dot on/off and compact style controls,
- Copy Style,
- Paste Style,
- Reset Style,
- Save as Preset.

Copy Style must not copy content or symbol identity.

### Selection visuals

Reuse/adapt the dotted rotating selection orbit as global editing UI.

Show compact selection-mode options in the prototype or its handoff:

- Clean Keyline
- Dotted Orbit
- Keyline + Orbit

The orbit is never exported or copied as Cell style.

## Compact UI rule

Use as many small, clear controls as practical:

- icon toggles,
- signal dots,
- circular palette/material dots,
- compact segmented controls,
- small disclosure rows,
- concise tooltips.

Avoid:

- large full-width buttons,
- long permanently expanded settings forms,
- large cards,
- repeated helper paragraphs inside the interface.

The current large `Remove Icon` action should become a compact icon action or overflow action.

## Material and rail reuse handoff

Do not build a full production Material Browser or shell.

Create a precise reuse handoff identifying what should later be rebuilt from:

- Claude V1 Material Browser,
- Claude V2 target rail and quick material rail,
- current C0.3 Inspector geometry,
- current dotted selection orbit.

The prototype may include a compact mock/open state demonstrating how Cell Inspector connects to the Material Browser, but must not duplicate the entire library inside the Inspector.

## Explicit exclusions

Do not:

- modify production `src/`,
- modify packages,
- implement real Table/Master Graph persistence,
- implement genuine production Undo/Redo,
- add multiple symbols per Cell,
- add per-role font controls,
- add rich text or Markdown,
- add export toggles for normal content/symbols,
- redesign the complete shell,
- merge any branch.

## Required prototype states

1. Cell selected, Inspector closed.
2. Cell selected, Inspector open.
3. Double-click inline editor with Name, Area and Body.
4. Enter commit state.
5. click-outside commit state.
6. Text Style preset browsing.
7. Text Size adjustment.
8. Text Colour/Auto Contrast adjustment.
9. Project Default state.
10. Local Override state.
11. Symbol library search and hover preview.
12. Symbol applied/replaced/removed.
13. Cell Style with Boundary and Core controls.
14. Copy/Paste Style state.
15. multi-selection Mixed state.
16. dotted selection orbit state.
17. 1440 layout.
18. 1280 layout.

## Deliverables

Keep all prototype work outside production `src/`.

Create/update:

- interactive prototype files,
- `C0_3_CELL_INSPECTOR_V2_DESIGN_NOTES.md`,
- `C0_3_CELL_INSPECTOR_V2_PRODUCTION_HANDOFF.md`,
- `C0_3_CELL_INSPECTOR_V2_REUSE_MAP.md`,
- `C0_3_CELL_INSPECTOR_V2_MANUAL_QA.md`.

Maximum six screenshots outside Git:

1. Content tab with inline editor
2. Text Style/Size/Colour
3. Symbol tab
4. Cell Style tab
5. multi-selection Mixed state
6. 1280 parity

## Manual QA rule

Owner QA is authoritative.

The final response must provide:

- exact local run command and URL,
- exact branch and head SHA,
- concise manual QA steps,
- known prototype limitations,
- a clear statement that Undo/Redo is deferred to production.

Do not mark the visual design approved yourself. End at `WAITING_REVIEW`.

## Commit and push

Commit:

`design: expand inspector into Cell Inspector V2`

Push:

`origin/design/c0-3-cell-inspector-v2-lab`

Do not merge.

PONYTAIL:
- reused: accepted C0.3 interactions, production tokens, V1/V2 prototype patterns
- adapted: compact Cell Inspector hierarchy and controls
- new files justified: isolated V2 prototype and handoff docs
- duplication avoided: no production store, shell or Material Browser duplication