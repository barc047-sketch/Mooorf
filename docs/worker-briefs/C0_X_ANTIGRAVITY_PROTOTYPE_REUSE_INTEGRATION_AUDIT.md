# Antigravity Brief — Prototype Reuse and Production Integration Audit

CODER: Antigravity
MODEL: Sonnet 4.6 / strongest available audit mode
EFFORT: High
EFFORT REASON: This requires cross-branch source inspection, ownership reconciliation, duplicate detection, and production milestone planning across three prototypes and current production.
ROLE: Read-only prototype archaeologist and production integration planner
WHY THIS MODEL: Strong source comparison and architectural judgement without touching live product code.
PARALLEL AGENT: Codex is actively recovering and finishing Cell Inspector V2 in `/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3-V2`. Do not inspect, modify, serve, copy, reset, stash, clean, or otherwise touch that running worktree or its unfinished branch.

## Objective

Create one precise, evidence-based map of what should be taken from the earlier MOOORF prototypes and how each approved part should be rebuilt into production.

The result must prevent two opposite failures:

1. losing valuable prototype work by ignoring it,
2. contaminating production by merging entire prototype shells, mock stores, duplicate arrays, or fake interactions.

This is a read-only planning task. Do not modify product code or prototype branches.

## Verified source state

Production source:

- repository: `/Users/tanisxq/Documents/ZONU0`
- `origin/main`
- exact main SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

Prototype references:

- Claude V1: `design/v8-2-ui-lab` at `8170f14a130da26cd41fd5fe0c196a332c3c1791`
- Claude V2: `design/v8-2c1-desktop-shell-lab` at `1b872afcdc47cedcd576ed3653b089fab2653b6b`
- accepted C0.3 Inspector: `design/c0-3-icons-symbols-inspector-lab` at `e97e59984a74dee94675f77a22b270424a773115`

Future production registry foundation, read-only context only:

- `feature/c0-2-icon-grid-asset-registry`
- exact head: `028c90541481b07a185e768fae921a7108a4e5d2`
- independently audited as merge candidate

Running work that must remain untouched:

- Codex status: `RUNNING`
- task: Cell Inspector V2 takeover and completion
- intended branch: `design/c0-3-cell-inspector-v2-lab`
- local worktree: `/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3-V2`

Fetch remotes and verify every accessible fixed SHA before analysis. Mark any unavailable source explicitly rather than guessing.

## Status protocol

Follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Update only:

- branch: `status/antigravity`
- file: `worker-status/ANTIGRAVITY.json`

Publish before work:

- worker: `Antigravity`
- model: `Sonnet 4.6`
- status: `RUNNING`
- task: `Prototype reuse and production integration audit`
- source branch: `main`
- source SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`
- work branch: `null`
- checkpoint: `Verifying fixed prototype and production sources`

Update after source verification, after each prototype inventory, after ownership reconciliation, and on completion.

## Write boundaries

Allowed writes only:

1. your own `status/antigravity` status file,
2. external audit artifacts under:
   `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/`

Do not:

- modify or commit product code,
- modify any prototype branch,
- create a feature or design branch,
- merge anything,
- install packages,
- modify package files,
- alter any worktree,
- touch `.claude/launch.json`,
- touch `.references/`,
- touch Codex's active V2 worktree.

## Required reading

Read current production and governance first:

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
4. `docs/PROJECT_MEMORY_INDEX.md`
5. `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
6. `docs/FEATURE_MAP.md`
7. `docs/COMPONENT_INVENTORY.md`
8. production shell, WidgetFrame, right-panel, context-menu, registry, store, history, and Canvas ownership files
9. C0.2 registry implementation report at `028c905`, read-only
10. `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`

Then inspect the three fixed prototype commits read-only.

## Decision vocabulary

Every reusable item must receive exactly one decision:

- `COPY_PURE_ASSET`
  - only for legal, isolated SVG path data, geometry, constants, labels, category names, or other state-free pure assets
- `ADAPT_PATTERN`
  - interaction or visual pattern is valuable, but implementation must be rewritten against production tokens and ownership
- `REBUILD_PRODUCTION`
  - component concept is approved, but React/state/history/registry integration must be implemented from scratch in production owners
- `REJECT`
  - duplicate, unsafe, fake, conflicting, visually rejected, performance-risky, or unnecessary
- `DEFER`
  - valuable but belongs to a later milestone

Never recommend merging a full prototype directory or shell.

## Part A — Claude V1 inventory

Focus especially on:

- Material Browser structure
- material search
- categories and filters
- favourites and recents
- circular material swatches/previews
- hover preview and revert
- compact sliders/value rows
- radial/context-menu ideas
- icon and grid pure assets
- any useful preset or resource metadata

For each valuable item record:

- exact source path and symbol/component/function name,
- what it does,
- decision vocabulary result,
- exact production owner it should connect to,
- dependencies and mock-state assumptions,
- duplicate/conflict risk,
- milestone recommendation.

## Part B — Claude V2 inventory

Focus especially on:

- permanent left rail framing
- target rail
- quick-material vertical rail
- contextual bottom rails around centre `+ Space`
- common contextual rail above bottom dock
- right Inspector geometry
- Material Browser width/Canvas visibility behavior
- panel density and spacing
- movable/pinnable secondary panel patterns
- right-click/context menu structure
- table/drawer/dashboard layering ideas
- keyboard/tooltip/motion patterns

Identify what is genuinely reusable versus merely attractive mock shell code.

## Part C — Accepted C0.3 Inspector inventory

Focus especially on:

- dotted rotating selection orbit
- selection badge and primary/multi-selection signalling
- Inspector panel geometry
- compact control styling
- icon/symbol search, category, recent and favourite interactions
- hover preview/revert
- placement and backing controls
- project-default/local-override presentation
- day/night and production-token parity fixes
- tooltip pattern
- any remaining UI-icon/drawable-symbol mixing that must be rejected

Do not inspect Codex's unfinished Cell Inspector V2 work. Audit only the fixed accepted commit `e97e599`.

## Part D — Production ownership reconciliation

For every approved item, map it to the existing or planned production owner.

At minimum cover:

- Master Graph / Cell data
- Zustand store and selectors
- history/Undo/Redo
- resource catalogue
- material registry
- icon registry
- grid registry
- WidgetFrame/WidgetHost
- shell/left rail/right inspector/bottom dock
- target-aware context state
- Canvas selection overlay
- radial context menu
- export and persistence

Flag any proposed feature that would create:

- a second store,
- duplicated resource arrays,
- duplicated shell geometry,
- duplicated keyboard state,
- duplicated selection logic,
- fake export,
- hard-coded Cells,
- an independent camera or renderer.

## Part E — Recommended production extraction order

Produce a dependency-aware milestone order. Use current milestone naming where possible.

Expected structure to evaluate:

- C0.3: Cell Inspector and selection orbit
- C0.5: target rail
- C0.6: quick material rail
- C0.7: Material Browser
- C0.8: Grid system UI
- C0.9: connections
- later: full C1 shell integration

For each milestone state:

- exact prerequisite,
- approved prototype sources,
- production owners,
- what must be rebuilt,
- what may be copied as a pure asset,
- validation required,
- visual/manual QA checkpoint,
- risk level.

## Important questions to answer

1. Which five prototype elements provide the highest production value?
2. Which exact files/functions/assets can be copied safely?
3. Which ideas must be rebuilt rather than copied?
4. Which prototype systems duplicate one another?
5. Where should Material Browser end and Cell Inspector begin?
6. Where should target rail, quick material rail, and right Inspector each own state?
7. How should Copy/Paste Style connect to the future radial menu without duplicate logic?
8. How should the dotted selection orbit integrate without becoming Cell style or export content?
9. Which UI components should wait until the C0.2 registry is merged?
10. What should be explicitly rejected from all prototypes?

## Required deliverables

Write to `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/`:

1. `MOOORF_PROTOTYPE_REUSE_AND_INTEGRATION_MAP.md`
   - exhaustive item-by-item matrix

2. `MOOORF_REUSE_PRIORITY_AND_MILESTONE_PLAN.md`
   - ranked high-value items and dependency order

3. `MOOORF_PROTOTYPE_DUPLICATION_AND_OWNERSHIP_RISK.md`
   - duplicate/conflict/state/performance risks

4. `MOOORF_PROTOTYPE_REUSE_AUDIT_STATE.json`
   - source SHAs, artifact paths, counts by decision, blockers and completion state

The primary matrix should include columns:

- feature/item
- prototype source
- exact path/symbol
- decision
- production owner
- dependencies
- milestone
- risk
- notes

## Completion standard

The audit is complete only when:

- all three fixed prototypes were inspected,
- current production ownership was inspected,
- C0.2 future ownership was considered,
- every recommendation has an exact source and target,
- there is a clear rejection list,
- there is a dependency-aware implementation sequence,
- no live code or prototype files were modified.

Finish status as `DONE` with exact artifact paths and counts for:

- `COPY_PURE_ASSET`
- `ADAPT_PATTERN`
- `REBUILD_PRODUCTION`
- `REJECT`
- `DEFER`

Final response begins with the required status block, then reports:

- verified SHAs,
- highest-value reusable items,
- strongest rejection warnings,
- recommended milestone order,
- artifact paths,
- blockers,
- confirmation that Codex's active worktree was untouched.

PONYTAIL:
- reused: fixed prototype branches and production ownership maps
- adapted: none; read-only audit only
- new files justified: four external audit artifacts
- duplication avoided: explicit purpose of the task