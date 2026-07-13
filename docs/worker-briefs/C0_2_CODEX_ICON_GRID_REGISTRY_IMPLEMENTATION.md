# C0.2 Codex Brief — Icon and Grid Asset Registry Implementation

CODER: Codex
MODEL: Sol / strongest available GPT-5 Codex implementation model
EFFORT: High
EFFORT REASON: This is structured production registry, metadata, persistence and contract-test work across existing resource owners. It does not require a visual redesign or renderer rewrite.
ROLE: Icon and grid registry implementation engineer
WHY THIS MODEL: Strong production implementation and test discipline without spending a visual-design model on mechanical registry work.
PARALLEL AGENT: Claude prototypes Cell Inspector V2 on an isolated design branch. Antigravity is on hold for later delta audit. Do not touch their branches, worktrees, files or artifacts.

## Objective

Implement C0.2 — the production **Icon and Grid Asset Registry** foundation.

This milestone creates the legal, deduplicated symbol and grid resources that the future Cell Inspector and Grid UI will consume.

Do not implement the Cell Inspector UI in this task.

## Verified source

Repository:
`/Users/tanisxq/Documents/ZONU0`

Required base:
- `origin/main`
- exact SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

Create:
- branch: `feature/c0-2-icon-grid-asset-registry`
- preferred worktree: `/Users/tanisxq/Documents/ZONU0-CODEX-C0-2`

Fallback to a numbered worktree suffix only when the preferred path is occupied.

Commit:
`feat: add icon and grid asset registry`

Push the feature branch. Do not merge.

## Safety

Before work:

- run `git fetch --all --prune`,
- verify exact `origin/main` SHA,
- verify the work branch does not already contain unknown work,
- use an isolated worktree,
- preserve `.claude/launch.json`,
- preserve local-only `.references/`,
- never switch, reset, stash, clean or modify the primary ZONU0 checkout,
- never force-push,
- stop on unexpected changes or conflicts.

## Status before work

Follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Publish before starting:

- branch: `status/codex`
- file: `worker-status/CODEX.json`
- worker: `Codex`
- model: `Sol / GPT-5 Codex`
- status: `RUNNING`
- task: `C0.2 icon and grid asset registry implementation`
- source SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`
- work branch: `feature/c0-2-icon-grid-asset-registry`

Update status after source verification, after icon registry, after grid registry, before push and after completion.

## Required reading

Read in order:

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/PROJECT_MEMORY_INDEX.md`
4. `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
5. `docs/FEATURE_MAP.md`
6. `docs/COMPONENT_INVENTORY.md`
7. current `src/icons/*`
8. current `src/resources/*`
9. current material registry and persistence patterns
10. current icon validation and tests

Read the external Antigravity artifacts from:

`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/`

Required:

- `C0_2_ICON_MASTER_INVENTORY.md`
- `C0_2_GRID_MASTER_INVENTORY.md`
- `C0_2_PROTOTYPE_ASSET_REUSE_MATRIX.md`
- `C0_2_PRODUCTION_INTEGRATION_MAP.md`
- `C0_2_IMPLEMENTATION_PLAN.md`
- `C0_2_AUDIT_STATE.json`

Also read the C0.3 architecture artifacts only to ensure registry compatibility:

- `C0_3_ULTRACODE_ICON_INSPECTOR_ARCHITECTURE.md`
- `C0_3_ULTRACODE_IMPLEMENTATION_BRIEF.md`

Where an external artifact conflicts with canonical product scope or current production ownership, canonical scope/current production wins. Record the conflict rather than inventing a parallel system.

## Plain-language scope

### Icon/symbol registry

Expand the current production icon skeleton into a real registry with as many useful, legal and approved drawable symbols as practical from the audited set.

Include useful categories such as:

- Architecture
- Landscape
- Diagram
- Annotation
- Wayfinding
- Environmental
- Accessibility
- Services
- Custom metadata hook

For each drawable symbol include normalized metadata:

- canonical ID
- label
- category
- tags/search terms
- accessible label
- tooltip
- source/original status
- licence/attribution fields
- SVG geometry or approved asset reference
- validation status

Separate:

- product UI icons used for application controls,
- drawable symbols users can place on Cells.

Do not expose the complete UI icon set as drawable Cell symbols.

Use only original, legally safe or clearly licensed geometry. Flag and exclude uncertain assets rather than silently shipping them.

### One-symbol compatibility

The future first production Cell Inspector supports one primary symbol per Cell.

C0.2 should provide registry/resource IDs and metadata only. Do not implement Cell symbol placement, Inspector controls or multiple-symbol state.

### Grid registry

Create/consolidate the production grid registry using the audited presets, including the compatible set of:

- Off
- Dots
- Square
- Major/Minor Technical
- Isometric
- Triangular
- Hexagonal
- Polar/Radial

Use the existing production rendering capabilities and canonical scope to resolve exact supported presets. Do not add a duplicate rendering engine.

Each grid definition should include only metadata and parameters required by current/future production ownership, such as:

- canonical ID
- label
- preview metadata
- supported parameters
- snapping compatibility
- camera behavior
- theme/material compatibility
- export behavior metadata where required by existing contracts

### Resource catalogue and persistence

Extend existing resource ownership rather than creating a parallel icon or grid store.

Ensure:

- resource catalogue discovers approved icons and grids,
- IDs normalize consistently,
- favourites/recents can reference canonical IDs,
- saved project/config formats persist IDs only where appropriate,
- older files receive safe migration/default behavior,
- unknown/missing IDs fail safely.

## Explicit exclusions

Do not implement:

- Cell Inspector UI
- Text Style presets
- inline Name/Area/Body editing
- symbol placement/scale/rotation/tint/backing
- keyboard `I`
- Copy/Paste Style
- Boundary/Core UI
- Material Browser UI
- target rails
- selection orbit
- Canvas renderer changes
- shader changes
- shell redesign
- new packages
- package.json changes
- backend/auth/cloud

Do not import prototype files directly into production. Harvest only approved, normalized and legal pure asset data or redraw into canonical registry entries.

## Tests

Add focused contract tests for:

- icon registry uniqueness
- icon category and metadata validity
- licence/source metadata presence
- SVG/path validation
- UI icon versus drawable symbol separation
- grid registry uniqueness
- grid metadata validity
- resource catalogue integration
- persistence/migration of canonical resource IDs
- unknown ID fallback

Keep tests focused. Do not create a broad unrelated test suite.

## Validation

Run:

- focused icon/grid/resource/persistence tests,
- `git diff --check`,
- one final production build.

One final build only. The known Vite chunk-size warning is acceptable if unchanged.

Verify the diff contains only justified registry, resource, persistence, tests and documentation changes. No UI or Canvas implementation files unless an existing canonical registry import requires a minimal, documented change.

## Documentation

Create:

- `docs/C0_2_ICON_GRID_REGISTRY_IMPLEMENTATION_REPORT.md`

Update relevant handoff/task queue documents with:

- C0.2 implementation status,
- exact registry counts,
- excluded/licence-uncertain assets,
- C0.3 unblocked only after audit/merge approval.

Do not falsely mark C0.3 implemented.

## Completion

Commit once after validation and push:

`origin/feature/c0-2-icon-grid-asset-registry`

Do not merge.

Final response begins with the status block, then reports:

- source SHA
- branch/head SHA
- files changed
- icon count
- drawable versus UI icon separation
- grid count
- excluded/licence-uncertain assets
- tests
- build
- persistence/migration
- packages modified
- commit/push
- limitations
- exact report path
- next: return control to Project Manager for Antigravity delta audit

PONYTAIL:
- reused: current resource, validation, persistence and registry owners
- adapted: approved legal icon geometry and audited grid metadata
- new files justified: canonical grid registry/tests and implementation report only
- duplication avoided: no parallel stores, renderers or UI systems