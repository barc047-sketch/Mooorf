# C0.3 Codex Takeover Brief — Finish Cell Inspector V2

CODER: Codex
MODEL: Sol / strongest available GPT-5 Codex visual-implementation mode
EFFORT: High
EFFORT REASON: Claude stopped mid-task with potentially valuable uncommitted prototype work. This requires careful recovery, visual refinement, interaction completion, and browser verification without restarting or touching production code.
ROLE: Prototype recovery and completion engineer
WHY THIS MODEL: Strong code recovery, interaction debugging, visual implementation, and verification in one pass.
PARALLEL AGENT: Antigravity may audit C0.2 on a separate read-only task. Claude is stopped. Do not modify production main, C0.2 feature work, Antigravity artifacts, or another worker's status file.

## Objective

Take over Claude's interrupted **C0.3 Cell Inspector V2** task and finish the existing local prototype.

Do not restart from scratch. Recover and preserve all useful work already present in Claude's local worktree.

## Verified repository state

Production main:
- `origin/main`
- exact SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

Accepted V1 Inspector prototype:
- branch: `design/c0-3-icons-symbols-inspector-lab`
- exact commit: `e97e59984a74dee94675f77a22b270424a773115`

Claude V2 intended branch:
- `design/c0-3-cell-inspector-v2-lab`

Claude V2 local worktree:
- `/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3-V2`

Current GitHub evidence:
- no remote `design/c0-3-cell-inspector-v2-lab` branch was published,
- Claude status was stopped before completion,
- the local worktree may contain uncommitted or partially staged work.

C0.2 feature implementation is separate and already pushed:
- branch: `feature/c0-2-icon-grid-asset-registry`
- head: `028c90541481b07a185e768fae921a7108a4e5d2`

Do not touch or merge C0.2 in this task.

## Mandatory recovery procedure

1. Fetch remotes from the shared repository.
2. Verify `origin/main` and accepted prototype commit exactly.
3. Inspect `/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3-V2` before any write:
   - `git status --short --branch`
   - current branch and HEAD
   - staged changes
   - unstaged changes
   - untracked files
   - recent reflog
4. Do not reset, clean, checkout over, stash, or discard anything.
5. Before editing, create an external recovery backup in:
   - `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/C0_3_CLAUDE_INTERRUPTED_RECOVERY/`
6. Save there:
   - `STATUS_BEFORE.txt`
   - `DIFF_STAGED.patch`
   - `DIFF_UNSTAGED.patch`
   - `UNTRACKED_FILES.txt`
   - copies of all untracked prototype files
7. If the worktree contains unknown changes outside the intended prototype path, publish `BLOCKED` and stop.
8. If the worktree is missing or has no recoverable V2 work, create the intended branch from `e97e599` and implement the locked scope, clearly reporting that no Claude partial work was recoverable.

Never modify or remove `.claude/launch.json`. Never touch `.references/`.

## Status before work

Follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Update only:
- branch: `status/codex`
- file: `worker-status/CODEX.json`

Publish before starting:
- worker: `Codex`
- model: `Sol / GPT-5 Codex`
- status: `RUNNING`
- task: `C0.3 Cell Inspector V2 takeover and completion`
- source branch: `design/c0-3-icons-symbols-inspector-lab`
- source SHA: `e97e59984a74dee94675f77a22b270424a773115`
- work branch: `design/c0-3-cell-inspector-v2-lab`
- checkpoint: `Recovering interrupted Claude worktree without discarding local changes`

Do not modify `status/claude`; it is already marked stopped for takeover.

## Required reading

1. `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`
2. `docs/worker-briefs/C0_3_CLAUDE_CELL_INSPECTOR_V2.md`
3. `docs/MOOORF_FINAL_SCOPE.md`
4. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
5. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
6. `docs/PROJECT_MEMORY_INDEX.md`
7. production tokens and panel geometry at `92f4c64`
8. accepted prototype at `e97e599`
9. recovered Claude V2 diff and files

## Locked product scope

Finish one compact **Cell Inspector** with three tabs:

- Content
- Symbol
- Cell Style

### Content

Complete and verify:

- double-click a Cell to edit Space Name, Area, and Body,
- visual order inside the Cell: Space Name, Area, then Body,
- `Enter` commits,
- clicking outside commits,
- `Escape` cancels,
- `Shift + Enter` inserts a Body line break,
- dragging is disabled while editing,
- Body shows approximately 2–3 lines without growing Cell geometry,
- prototype/handoff clearly states Name, Area, and Body sync with Master Graph and Table in production.

Text controls must remain simple:

- Text Style preset
- Text Size
- Text Colour

Text Style controls the complete Heading + Area + Body hierarchy.

Text Size scales the complete three-role system proportionally.

Text Colour offers:

- Auto Contrast
- compact project palette dots

Support:

- Project Default
- Local Cell Override
- Mixed state for multi-selection

Do not add per-role font, weight, line-height, alignment, rotation, offset, opacity, or backing controls.

### Symbol

Keep exactly one primary symbol per Cell in this prototype.

Complete and verify:

- many useful symbol choices,
- categories,
- search,
- recent,
- favourites,
- hover preview and revert,
- apply,
- replace,
- remove,
- placement preset,
- offset X/Y,
- scale,
- rotation,
- tint,
- backing type/size/offset/opacity,
- Backing Outline on/off and width,
- hide when zoomed far out.

Remove any `Include in Export` control.

Separate product UI icons from drawable Cell symbols. Do not show Undo, Redo, Fullscreen, Close, and other shell controls as normal drawable symbols unless a specific icon also exists as a deliberately named diagram symbol.

### Cell Style

Complete and verify compact controls for:

- quick material dots,
- compact `Open Material Browser` action,
- Boundary visible on/off,
- Boundary style: solid/dashed/dotted/double,
- Boundary width,
- Boundary offset,
- Core dot on/off,
- compact Core size/colour/opacity/offset controls,
- Copy Style,
- Paste Style,
- Reset Style,
- Save as Preset.

Copy Style copies visual settings but excludes:

- Space Name
- Area
- Body
- symbol identity
- category
- privacy
- floor
- relationships

### Selection orbit

Preserve/adapt the dotted rotating selection orbit.

Prototype or handoff must show:

- Clean Keyline
- Dotted Orbit
- Keyline + Orbit

The orbit is editing UI only, never exported, and never copied as Cell style.

## Compact interface rule

Use small controls wherever practical:

- icon toggles,
- dots,
- circular swatches,
- compact segmented controls,
- disclosure rows,
- concise tooltips.

Avoid:

- huge buttons,
- long full-width action blocks,
- large cards,
- permanently expanded advanced settings,
- repeated instructional paragraphs.

Convert large destructive actions such as `Remove Icon` into compact icon or overflow actions with clear tooltips.

## Interaction quality

Every visible control in the prototype must either work or be clearly presented as a labelled future handoff—not appear clickable while inert.

At minimum verify in a real browser:

1. selecting one Cell,
2. selecting multiple Cells,
3. `I` open/close,
4. double-click inline edit,
5. Enter commit,
6. click-outside commit,
7. Escape cancel,
8. Text Style switching,
9. Text Size,
10. Text Colour/Auto Contrast,
11. Default/Override switching,
12. Symbol search/category/favourite/recent,
13. hover preview/revert,
14. apply/replace/remove,
15. Symbol placement and backing controls,
16. Boundary controls,
17. Core controls,
18. Copy/Paste Style prototype behavior,
19. selection orbit mode,
20. day/night,
21. 1440 layout,
22. 1280 layout.

Undo/Redo may remain documented as a production requirement; do not fake it as completed.

## Material/rail reuse handoff

Finish the handoff mapping for later production rebuild of:

- Claude V1 Material Browser,
- Claude V2 target rail,
- Claude V2 quick material rail,
- current Inspector panel geometry,
- dotted selection orbit.

Do not copy a complete prototype shell or Material Browser into production.

## Deliverables

Complete/preserve these paths under the V2 prototype directory:

- `design-prototypes/c0-3-cell-inspector-v2/index.html`
- `design-prototypes/c0-3-cell-inspector-v2/styles.css`
- `design-prototypes/c0-3-cell-inspector-v2/prototype.js`
- `design-prototypes/c0-3-cell-inspector-v2/C0_3_CELL_INSPECTOR_V2_DESIGN_NOTES.md`
- `design-prototypes/c0-3-cell-inspector-v2/C0_3_CELL_INSPECTOR_V2_PRODUCTION_HANDOFF.md`
- `design-prototypes/c0-3-cell-inspector-v2/C0_3_CELL_INSPECTOR_V2_REUSE_MAP.md`
- `design-prototypes/c0-3-cell-inspector-v2/C0_3_CELL_INSPECTOR_V2_MANUAL_QA.md`

Also create:

- `design-prototypes/c0-3-cell-inspector-v2/C0_3_CODEX_TAKEOVER_REPORT.md`

The takeover report must state:

- what Claude had completed,
- what was recovered,
- what Codex changed,
- what remained incomplete,
- browser checks actually run,
- exact manual QA instructions for the Owner.

Maximum six screenshots outside Git, only after the prototype is stable.

## Git and completion

Use or create:

`design/c0-3-cell-inspector-v2-lab`

Commit once after verification:

`design: complete Cell Inspector V2 prototype`

Push:

`origin/design/c0-3-cell-inspector-v2-lab`

Do not merge.

Do not run a production application build unless required to serve the prototype. This task is an isolated prototype; prioritize browser interaction verification.

Finish Codex status as `WAITING_REVIEW`, not `DONE`, because Owner visual QA is authoritative.

Final response begins with the required status block and includes:

- recovered work summary,
- branch and exact head SHA,
- local run command and URL,
- browser checks passed/failed,
- remaining prototype limitations,
- manual QA checklist,
- exact report path.

PONYTAIL:
- reused: Claude's interrupted local V2 work and accepted C0.3 prototype
- adapted: locked compact Cell Inspector scope and production visual language
- new files justified: recovery backup and takeover report only
- duplication avoided: no production store, shell, Material Browser, renderer, or registry duplication