# C0.3 GPT-5.6 Ultracode Brief — Icon Inspector Production Architecture

CODER: GPT-5.6 Ultracode
MODEL: GPT-5.6 Ultracode / maximum available coding-reasoning mode
EFFORT: Very High
ROLE: Production architecture, state-contract and implementation-readiness lead
PARALLEL AGENT: Antigravity inventories icon/grid assets; Claude prototypes the focused inspector; Codex Luna may perform merge integration. Remain read-only and do not touch their branches.

## Objective

Use the remaining Ultracode allocation on a high-value, deep production integration plan for:

- C0.2 Icon Asset Registry integration boundaries
- C0.3 Icons & Symbols Inspector architecture

This is a read-only architecture task. Do not implement product code yet. Produce an exact, test-first implementation contract that Codex can execute after main is updated and the Antigravity/Claude outputs are reviewed.

## Repository and state

Repository:
`/Users/tanisxq/Documents/ZONU0`

Expected main before current merge:
`70f593dffc38b8f37160567a4a18238f32fcf8ee`

Accepted stabilization branch:
`feature/v8-2c0-1-canvas-stabilization`

Expected stabilization head:
`222dc7aa5e4bd4536aed9709abe45a94c758f857`

Governance branch:
`docs/mooorf-ai-team-operating-protocol`

Artifact output root:
`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS`

Do not switch branches in the primary repository. If local source inspection needs another branch, use an isolated temporary worktree and remove it afterward.

Never modify:

- product source
- package files
- main
- stabilization branch
- integration branch
- Claude branches
- Antigravity artifacts
- `.claude/launch.json`
- `.references/`

## Required reading

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
4. `docs/PROJECT_MEMORY_INDEX.md`
5. `docs/FEATURE_MAP.md`
6. `docs/COMPONENT_INVENTORY.md`
7. `docs/DECISIONS.md`
8. `docs/V8_2C0_1_CANVAS_STABILIZATION_REPORT.md`
9. current production icon/resource/annotation/grid types and persistence
10. current command/context/keyboard systems
11. current history and multi-selection ownership
12. current export/snapshot/import/migration systems
13. `git show origin/docs/mooorf-ai-team-operating-protocol:docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
14. both Claude prototype branches for reusable interaction ideas only

## Locked product behaviour

### Open

- Select one Cell or multiple Cells.
- Press `I`.
- Open the right-side **Icons & Symbols Inspector**.

### Apply

- Browse/search icons.
- Hover creates temporary preview.
- Click applies icon to selected Cell(s).
- Multi-selection application is one Undo transaction.
- Initial UI supports one primary icon per Cell.

### Visual

- Icon appears above Organism layers.
- Default backing is a white circle below the icon.
- Labels and selection UI remain above the icon.
- Icon is never Core, Boundary, selection or an independent architectural Cell.

### Controls

- placement preset
- custom offset X/Y
- scale
- rotation
- opacity
- tint
- backing type
- backing size
- backing opacity
- backing offset
- backing boundary and width
- `Use Project Icon Defaults`
- Hide Below Zoom
- Include in Export

### Global/local

Project defaults control shared scale/opacity/backing/tint behaviour.

A Cell placement can opt out and store local overrides.

### Persistence

Icons must survive:

- save/open
- snapshot
- project transfer
- migration
- duplicate Cell
- delete Cell
- Undo/Redo
- floor visibility
- export

## Existing production foundation to inspect

Production already has concepts including:

- `IconDefinition`
- `IconPlacementSettings`
- icon categories
- icon source types
- backing types
- target Cell ID
- scale
- rotation
- opacity
- tint
- boundary
- hide-below-zoom

Do not create a parallel icon system.

Determine exactly:

- whether the existing placement type is singular or collection-based
- current persistence location
- current default generation
- current migration path
- current export behaviour
- current icon registry ownership
- current built-in versus uploaded icon handling
- missing global-default model
- missing local-override semantics
- whether `boundary` should become a richer backing-edge structure without breaking old projects

## Required architecture decisions

### 1. Domain model

Specify the minimum schema required for:

- built-in icon definition
- uploaded/custom icon definition
- per-Cell icon placement
- project icon defaults
- local override flags
- one-primary-icon UI with future multiple placements
- stable IDs
- source licensing/attribution
- favourites and recents as UI state versus project state

Provide exact TypeScript interfaces or discriminated unions as a proposal.

Do not casually rename existing persisted keys. Include migration strategy for every changed field.

### 2. State ownership

Map:

- project data
- transient hover preview
- inspector open/closed state
- current icon category/search
- favourites
- recents
- project defaults
- local overrides
- current selection scope

State must not duplicate Master Graph or Material Registry ownership.

Identify exact Zustand slices/actions/selectors to reuse or extend.

Selectors must not return fresh arrays/objects on every render unless memoized safely.

### 3. Selection and scope

Define behaviour for:

- one selected Cell
- multiple selected Cells
- mixed Cell + Void selection
- no selection
- stale/deleted IDs
- hidden/locked floor
- primary versus secondary selection

Only Cells receive normal icons in the first release unless a strong existing contract already supports Void icons. Do not invent unsupported scope silently.

### 4. History

Specify exact Undo/Redo transaction boundaries for:

- apply icon
- replace icon
- remove icon
- multi-apply
- scale/opacity/rotation changes
- project-default changes
- switching local override on/off
- hover preview cancellation

Hover preview must never enter persistent history.

Continuous sliders should preview ephemerally and commit one transaction.

### 5. Keyboard and command system

Map `I` through the existing keyboard/command/context architecture.

Define:

- focus exceptions when typing
- Escape
- Enter
- arrow-key navigation in icon grid
- search focus
- command palette entry
- accessible names

Do not add global listeners outside the canonical command owner.

### 6. Inspector architecture

Propose the minimum React component tree:

- inspector host
- search/category bar
- virtualized or efficient icon grid
- preview cell
- placement controls
- backing controls
- defaults/local override controls
- empty/multi-selection states

Keep Canvas visible and inspector width bounded.

Identify which existing Widget/Panel/Inspector primitives should be reused.

### 7. Rendering

Determine the safest rendering owner for icons:

- DOM overlay
- Canvas 2D
- WebGL
- hybrid

Compare:

- performance
- export parity
- zoom behaviour
- screen-fixed versus world-fixed sizing
- hit testing
- label stacking
- Auto Contrast interaction
- 50+ Cell implications

Recommend one architecture for the first release and one future path.

The first release should avoid adding another expensive per-frame DOM-query loop.

### 8. Global scale behaviour

The user asked for a global scale toggle.

Use the final label:
`Use Project Icon Defaults`

Define whether global scale is:

- screen-fixed
- world-fixed
- adaptive

Recommend the default and explain architectural/export implications.

Specify how per-Cell local scale composes with project default scale.

### 9. White circular backing

Specify:

- default diameter relationship to icon size
- padding
- opacity
- tint
- optional boundary
- day/night behaviour
- Auto Contrast option
- export representation
- no-shadow rule

Avoid confusing backing with Core or Cell Boundary.

### 10. Export and persistence

Map exact changes for:

- raster export
- SVG export
- PDF export
- snapshot
- project JSON
- project transfer
- import validation
- migration
- missing custom icon asset
- unsupported source type

Define graceful fallback for unavailable uploaded assets.

### 11. Performance

Estimate and test for:

- 50 Cells with icons
- 96 Cells engine limit
- labels + icons
- selection + icons
- pan/zoom
- multi-selection preview
- icon-grid browsing with hundreds of icons

Propose caching, virtualization and invalidation rules.

Do not introduce continuous rendering solely for icons.

### 12. Security and licensing

Define:

- accepted local SVG/PNG handling
- sanitization
- data URL/object URL lifecycle
- maximum file size/dimensions
- SVG script/external reference rejection
- built-in licence metadata
- attribution export policy

No backend/cloud/upload service yet.

## Exact file ownership map

Produce a table of likely files to:

- reuse
- adapt
- add
- avoid

Include current exact paths after source inspection.

Flag any conflict with the incoming C0.2 asset inventory or Claude prototype.

## Test-first contract

Create a maximum 24-test implementation matrix covering:

- registry
- search/filter
- project defaults
- local overrides
- selection scope
- multi-apply
- preview/revert
- Undo/Redo
- keyboard `I`
- focus isolation
- persistence
- migration
- duplicate/delete Cell
- export
- missing assets
- performance invalidation
- accessibility

Separate unit, integration and manual checks.

## Implementation phases

Recommend the smallest safe sequence, for example:

1. registry/data contract
2. persistence/migration
3. placement rendering
4. history/actions
5. inspector shell
6. icon library/search
7. defaults/local overrides
8. export
9. QA

Do not combine everything into one commit when separation improves safety.

## Deliverables

Create outside Git:

`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/C0_3_ULTRACODE_ICON_INSPECTOR_ARCHITECTURE.md`

`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/C0_3_ULTRACODE_STATE_AND_HISTORY_MATRIX.md`

`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/C0_3_ULTRACODE_TEST_CONTRACT.md`

`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/C0_3_ULTRACODE_IMPLEMENTATION_BRIEF.md`

The final implementation brief must be ready for the Project Manager to reconcile with:

- Antigravity inventory
- Claude inspector prototype
- updated main

Do not commit or push product changes.

## Final response

STATUS:
CODER:
MODEL:
AUDITED MAIN:
STABILIZATION HEAD:
EXISTING ICON MODEL:
MISSING DOMAIN FIELDS:
PROJECT DEFAULT MODEL:
LOCAL OVERRIDE MODEL:
SELECTION SCOPE:
HISTORY MODEL:
KEYBOARD I:
INSPECTOR COMPONENT TREE:
RENDERING RECOMMENDATION:
GLOBAL SCALE RECOMMENDATION:
WHITE BACKING CONTRACT:
EXPORT CONTRACT:
MIGRATION CONTRACT:
SECURITY:
PERFORMANCE:
TEST MATRIX:
IMPLEMENTATION PHASES:
FILES TO REUSE:
FILES TO ADAPT:
NEW FILES JUSTIFIED:
CONFLICT RISKS:
PRODUCT CODE MODIFIED:
GIT MODIFIED:
ARTIFACTS:
LIMITATIONS:
NEXT:
Return control to the Project Manager.