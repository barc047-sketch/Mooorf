# C0.3 Claude Brief — Icons & Symbols Inspector Lab

CODER: Claude Code
MODEL: Claude Fable 5 / strongest available Claude design model
EFFORT: High
ROLE: Focused interaction and visual-prototype designer
PARALLEL AGENT: Antigravity inventories icon/grid assets; GPT-5.6 Ultracode maps production architecture; Codex Luna may complete merge integration. Do not touch their branches or files.

## Objective

Create one isolated, high-fidelity prototype for the future C0.3 **Icons & Symbols Inspector**.

This is not a full application redesign. It is one focused component and its immediate Canvas interaction.

## Safe source and branch

Repository: `/Users/tanisxq/Documents/ZONU0`

Preferred prototype source branch:
`design/v8-2c1-desktop-shell-lab`

Create a new isolated branch:
`design/c0-3-icons-symbols-inspector-lab`

Preferred isolated worktree:
`/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3`

Before acting:

- fetch all remotes,
- verify the exact current SHA of `design/v8-2c1-desktop-shell-lab`,
- inspect both `design/v8-2-ui-lab` and `design/v8-2c1-desktop-shell-lab`,
- preserve `.claude/launch.json`,
- never switch or modify the primary ZONU0 worktree,
- never modify production `src/`, package files, current stabilization branches, main, or integration branches.

If the new branch/worktree already exists, inspect it and stop on unknown work.

## Required reading

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
4. `docs/PROJECT_MEMORY_INDEX.md`
5. `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md` from the governance branch
6. existing production icon/resource types
7. Claude V1 Material Browser implementation and interaction patterns
8. Claude V2 right rail, material rail and contextual bottom layering

## Locked interaction

1. User selects one Cell or multiple Cells.
2. User presses `I`.
3. A right-corner **Icons & Symbols Inspector** opens.
4. User searches or browses icons.
5. Hover temporarily previews an icon on the selected Cell(s).
6. Click applies the icon.
7. Escape/revert cancels preview.
8. Applied icon stays attached to its Cell and moves with it.

The first production version supports one primary icon per Cell, but the visual structure should not prevent multiple icon placements later.

## Inspector content

### Header

- Icons & Symbols
- compact selected scope label: `Selection`, `3 Cells`, or `Project Defaults`
- close button
- pin only when it clearly improves the prototype; do not add complexity merely for decoration

### Library

- Search
- All
- Architecture
- Landscape
- Diagram
- Annotation
- Navigation
- Custom
- Recent
- Favourites

Use placeholder/open icons only. Antigravity will produce the canonical inventory separately.

### Placement

- Centre
- Above
- Below
- Top Left
- Top Right
- Custom Offset X/Y

### Appearance

- Scale
- Rotation
- Opacity
- Tint

### Backing

Default:
- White circular backing below the icon

Controls:
- None / White Circle / Auto Contrast Circle
- backing size
- backing opacity
- backing offset X/Y
- backing boundary on/off
- boundary width

### Defaults

Use this exact label:
`Use Project Icon Defaults`

When enabled:
- scale, opacity, backing and tint behaviour follow project defaults.

When disabled:
- the selected Cell icon uses local overrides.

### Behaviour

- Hide Below Zoom
- Include in Export

## Visual stacking

From top to bottom:

1. selection/editing UI
2. labels
3. icon
4. white circular backing
5. Core
6. Boundary and Cell
7. visual connections
8. Membrane
9. grid/background

The icon must not be confused with Core or selection.

## Visual direction

- Preserve the current MOOORF visual identity.
- Premium, quiet, technical, editorial.
- Right inspector remains compact; Canvas remains visible.
- No cheap SaaS cards.
- No UI shadows.
- Stable blur only; no blur animation.
- Circular icon previews and controls may reuse the strongest V1 Material Browser language.
- Inspector geometry may reuse the strongest V2 right-rail structure.
- Active state: signal dot + keyline + subtle tint.
- No hover magnification or Mac Dock behaviour.
- 1440 and 1280 desktop only.

## Required prototype states

1. One selected Cell, inspector closed.
2. One selected Cell, inspector opened with `I`.
3. Icon library browsing/search.
4. Hover preview on Cell.
5. Applied icon with white circular backing.
6. Local scale and opacity adjustment.
7. `Use Project Icon Defaults` enabled and disabled.
8. Multi-selection applying one icon to several Cells.
9. No selected Cell: project defaults state or clearly disabled apply state.

## Reuse rules

Reuse/adapt:

- V1 circular previews
- search/categories/favourites/recents
- pure hover preview/revert logic
- SVG icon paths
- compact sliders and exact value fields
- V2 right inspector geometry
- V2 target-aware layering

Do not copy:

- full prototype shell
- duplicate state architecture
- hard-coded production Cells as product data
- raw prototype material arrays
- hover magnification
- simulated export or file system

## Deliverables

Keep all new prototype work outside production `src/`.

Create:

- focused interactive prototype files
- `C0_3_ICONS_SYMBOLS_INSPECTOR_DESIGN_NOTES.md`
- `C0_3_ICONS_SYMBOLS_INSPECTOR_PRODUCTION_HANDOFF.md`

The production handoff must identify:

- approved component structure
- states
- controls
- reusable SVG/pure logic
- parts requiring React rebuild
- accessibility labels
- keyboard behaviour
- responsive behaviour at 1440/1280
- rejected ideas

Capture maximum four screenshots outside Git:

1. 1440 inspector open
2. 1440 icon applied with backing
3. 1280 inspector open
4. multi-selection state

## Validation

- no production files changed
- no package changes
- no main/stabilization/integration branch changes
- prototype opens locally
- keyboard `I` works inside the prototype
- Escape cancels preview
- Canvas stays visible
- no full shell redesign

## Commit and push

Commit:
`design: prototype icons and symbols inspector`

Push:
`design/c0-3-icons-symbols-inspector-lab`

Do not merge.

## Final report

STATUS:
CODER:
MODEL:
SOURCE BRANCH:
SOURCE SHA:
NEW BRANCH:
NEW HEAD:
WORKTREE:
INSPECTOR BUILT:
KEYBOARD I:
SEARCH:
CATEGORIES:
RECENTS/FAVOURITES:
HOVER PREVIEW:
WHITE BACKING:
SCALE:
OPACITY:
PROJECT DEFAULTS:
LOCAL OVERRIDES:
MULTI-SELECTION:
1440:
1280:
PRODUCTION FILES MODIFIED:
PACKAGES MODIFIED:
SCREENSHOTS:
HANDOFF:
COMMIT:
PUSH:
LIMITATIONS:
PONYTAIL:
- reused:
- adapted:
- new files justified:
- duplication avoided:
NEXT:
Return control to the Project Manager.