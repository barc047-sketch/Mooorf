# C0.2 Antigravity Brief — Icon and Grid Asset Inventory

CODER: Antigravity
MODEL: Sonnet 4.6
EFFORT: High
ROLE: Read-only prototype-to-production asset cartographer
PARALLEL AGENT: Codex Luna may perform the stabilization/governance merge in an isolated integration worktree. Do not touch its branch or files.

## Objective

Prepare the exact implementation map for C0.2 — Icon and Grid Asset Registry while the merge runs.

This is read-only. Do not modify product code, commit, push, merge, install packages, or alter any worktree.

## Source state to verify

Repository: `/Users/tanisxq/Documents/ZONU0`

Expected current main before merge:
`70f593dffc38b8f37160567a4a18238f32fcf8ee`

Accepted stabilization branch:
`feature/v8-2c0-1-canvas-stabilization`

Expected stabilization head:
`222dc7aa5e4bd4536aed9709abe45a94c758f857`

Prototype branches:
- `design/v8-2-ui-lab`
- `design/v8-2c1-desktop-shell-lab`

Prototype worktrees/reference locations:
- `/Users/tanisxq/Documents/ZONU0-CLAUDE`
- `/Users/tanisxq/Documents/ZONU0-CLAUDE-C1`
- `/Users/tanisxq/Documents/ZONU0/.references/mooorf-desktop-v1/`

Artifact root:
`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS`

Preserve `.claude/launch.json` and all local-only `.references/` content.

## Required reading

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
4. `docs/PROJECT_MEMORY_INDEX.md`
5. `docs/FEATURE_MAP.md`
6. `docs/COMPONENT_INVENTORY.md`
7. `docs/V8_2C0_1_CANVAS_STABILIZATION_REPORT.md`
8. Existing production icon, annotation, resource and grid types/registries
9. `git show origin/docs/mooorf-ai-team-operating-protocol:docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`

## Audit A — Complete icon inventory

Inspect production plus both Claude prototypes.

Inventory every distinct icon or symbol, including:

- workspace/navigation
- primary tools
- Organism targets
- connection tools
- Arrange presets
- Labels & Markup
- Quick View
- project/file actions
- materials
- grids
- floors/scenes/layers
- export/download
- custom architectural and environmental symbols

For each icon record:

- source branch/file
- current name
- proposed canonical ID
- proposed final label
- category
- SVG path/component/source type
- whether original or third-party
- licence/attribution requirement
- duplicate/near-duplicate IDs
- production equivalent, if any
- command ID or future command mapping
- usable now / future / debug / reject
- whether safe to copy directly, adapt, or redraw
- accessible label and tooltip

Do not claim third-party icon paths are original. Flag all licence uncertainty.

## Audit B — Grid inventory

Inspect production plus both prototypes for every distinct grid implementation or visual preset.

At minimum evaluate:

- Off
- Dots
- Square
- Major/Minor Technical
- Isometric
- Triangular
- Hexagonal
- Polar/Radial
- Axonometric/Diagonal

For each grid record:

- source file/branch
- rendering method
- existing production equivalent
- canonical preset ID
- duplicate status
- parameters supported
- snapping compatibility
- camera behaviour
- export behaviour
- theme/material compatibility
- performance risk
- whether safe to copy, adapt, or rebuild

Map all compatible controls:

- visible
- spacing
- major interval
- scale
- rotation
- offsets X/Y
- opacity
- dot/line size
- major/minor weights
- colour/material
- snap on/off
- snap strength
- follow camera
- export visibility

## Audit C — Production integration ownership

Map the safest production owners for:

- IconDefinition registry
- IconPlacementSettings
- icon source/loading
- SVG sprite or React components
- command metadata
- categories/tags
- favourites/recent later
- grid definitions
- grid settings
- grid rendering
- snapping
- persistence/migration
- import/export
- tests

Do not propose a new parallel icon or grid store when an existing resource owner can be extended.

## Audit D — C0.2 implementation slice

Produce a narrow implementation plan for Codex Luna/Terra that does only:

1. extract and register legal/original icons,
2. deduplicate IDs,
3. normalize metadata,
4. consolidate grid definitions,
5. preserve current behaviour,
6. add tests and documentation,
7. add no new Inspector or large visible UI.

C0.3 Icons & Symbols Inspector remains separate.

## Explicit exclusions

Do not:

- implement the Icon Inspector,
- add shortcut `I`,
- change Canvas selection,
- change Organism layers,
- redesign rails,
- create Material Browser UI,
- implement connections,
- modify production code,
- merge prototype branches,
- make screenshots unless one contact sheet is genuinely needed to distinguish near-duplicate icons or grids.

## Required artifacts

Create only in the external artifact root:

1. `C0_2_ICON_MASTER_INVENTORY.md`
2. `C0_2_GRID_MASTER_INVENTORY.md`
3. `C0_2_PROTOTYPE_ASSET_REUSE_MATRIX.md`
4. `C0_2_PRODUCTION_INTEGRATION_MAP.md`
5. `C0_2_IMPLEMENTATION_PLAN.md`
6. `C0_2_AUDIT_STATE.json`

Optional, only when useful:

7. `C0_2_ICON_GRID_CONTACT_SHEET.png`

## Final response

STATUS:
AUDITOR:
MODEL:
MAIN VERIFIED:
STABILIZATION VERIFIED:
V1 VERIFIED:
V2 VERIFIED:
PRODUCTION ICONS:
V1 ICONS:
V2 ICONS:
UNIQUE ICONS AFTER DEDUPE:
DIRECT COPY:
ADAPT:
REDRAW:
REJECT:
LICENCE BLOCKERS:
PRODUCTION GRIDS:
V1 GRIDS:
V2 GRIDS:
UNIQUE GRID PRESETS:
DUPLICATES:
PRODUCTION OWNERS:
IMPLEMENTATION SIZE:
CONFLICT WITH MERGE WORK:
PRODUCT CODE MODIFIED:
GIT MODIFIED:
ARTIFACTS:
NEXT:
Return control to the Project Manager.