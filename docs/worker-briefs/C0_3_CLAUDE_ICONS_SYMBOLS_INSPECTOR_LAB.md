# C0.3 Claude Brief — Icons & Symbols Inspector Lab

CODER: Claude Code
MODEL: Claude Fable 5 / strongest available Claude design model
EFFORT: High
ROLE: Focused interaction and visual-prototype designer
PARALLEL AGENT: Antigravity inventories icon/grid assets; GPT-5.6 Ultracode maps production architecture; Codex Luna completes merge integration. Do not touch their branches or files.

## Objective

Create one isolated, high-fidelity prototype for the future C0.3 **Icons & Symbols Inspector**.

This is not a full application redesign. It is one focused component and its immediate Canvas interaction.

## Critical rule: isolated Git, shared product identity

Isolation means branch/worktree safety only. It does **not** mean visual or product isolation.

The prototype must inherit the current production MOOORF identity, geometry, tokens, nomenclature and interaction language from the latest verified `origin/main` after the stabilization/governance merge.

Do not start until Codex reports that the merge is complete and the Project Manager provides the exact new `origin/main` SHA.

The old Claude V1/V2 branches are reference libraries only. Do not use either old prototype branch as the implementation base.

## Safe source and branch

Repository: `/Users/tanisxq/Documents/ZONU0`

Required source branch:
`origin/main`

Required source SHA:
To be supplied by the Project Manager after the current merge. Stop if it is not supplied or does not match remote main.

Create a new isolated branch from that exact main SHA:
`design/c0-3-icons-symbols-inspector-lab`

Preferred isolated worktree:
`/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3`

Before acting:

- fetch all remotes,
- verify exact `origin/main` SHA against the Project Manager-provided SHA,
- create the prototype branch from that exact SHA,
- inspect `design/v8-2-ui-lab` and `design/v8-2c1-desktop-shell-lab` read-only,
- inspect current production `src/styles/tokens.css`, shell geometry, WidgetFrame, right-side panels and Canvas controls,
- preserve `.claude/launch.json`,
- never switch or modify the primary ZONU0 worktree,
- never modify production `src/`, package files, stabilization branches, main, integration branches or another worker’s files.

If the new branch/worktree already exists, inspect it and stop on unknown work.

## Required reading

Read from the latest merged main unless explicitly noted:

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
4. `docs/PROJECT_MEMORY_INDEX.md`
5. `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
6. `docs/FEATURE_MAP.md`
7. `docs/COMPONENT_INVENTORY.md`
8. current production design tokens and shared visual primitives
9. current production right-panel and WidgetFrame geometry
10. existing production icon/resource types
11. Claude V1 Material Browser implementation and interaction patterns, read-only
12. Claude V2 right rail, material rail and contextual bottom layering, read-only
13. `/Users/tanisxq/Documents/ZONU0/.references/mooorf-desktop-v1/INDEX.md`

## Style lock

The prototype must look like the same product as the latest production Canvas.

Required:

- reuse current production CSS variables or mirror them exactly inside the prototype,
- reuse current spacing, radius, typography, border/keyline, glass and signal-dot language,
- match current day/night palette behaviour,
- match current right-panel width logic and WidgetFrame density,
- preserve the permanent left rail and existing Canvas visual context in any prototype shell framing,
- use production names: Cell, Boundary, Membrane, Membrane Edge, Core, Void,
- active state = signal dot + keyline + subtle tint,
- no UI shadows,
- no hover magnification,
- no Mac Dock scaling,
- stable blur only,
- Canvas remains visible,
- 1440 and 1280 desktop only.

Before finalizing, create a short **Style Parity Checklist** comparing the prototype against current main:

- typography
- spacing
- radii
- keylines
- glass/blur
- active states
- day/night colours
- inspector density
- Canvas visibility

Any intentional deviation must be listed and justified. Unlisted deviations are defects.

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
- pin only when it clearly improves the prototype

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

## Prototype states

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

- current production tokens and shared primitives first,
- V1 circular previews,
- search/categories/favourites/recents,
- pure hover preview/revert logic,
- original SVG icon paths,
- compact sliders and exact value fields,
- V2 right-inspector geometry only where it matches current production,
- V2 target-aware layering only where it matches current production.

Do not copy:

- full V1/V2 prototype shell,
- old prototype colour/token systems over current production,
- duplicate state architecture,
- hard-coded production Cells as product data,
- raw prototype material arrays,
- hover magnification,
- simulated export or file system.

## Deliverables

Keep all new prototype work outside production `src/`.

Create:

- focused interactive prototype files,
- `C0_3_ICONS_SYMBOLS_INSPECTOR_DESIGN_NOTES.md`,
- `C0_3_ICONS_SYMBOLS_INSPECTOR_PRODUCTION_HANDOFF.md`,
- `C0_3_STYLE_PARITY_CHECKLIST.md`.

The production handoff must identify:

- approved component structure,
- states,
- controls,
- exact production tokens/primitives reused,
- reusable SVG/pure logic,
- parts requiring React rebuild,
- accessibility labels,
- keyboard behaviour,
- responsive behaviour at 1440/1280,
- rejected ideas,
- intentional style deviations, if any.

Capture maximum four screenshots outside Git:

1. 1440 inspector open
2. 1440 icon applied with backing
3. 1280 inspector open
4. multi-selection state

## Validation

- source branch is exact latest merged main,
- no production files changed,
- no package changes,
- no main/stabilization/integration branch changes,
- prototype opens locally,
- keyboard `I` works inside the prototype,
- Escape cancels preview,
- Canvas stays visible,
- no full shell redesign,
- Style Parity Checklist completed,
- no unexplained visual drift from production.

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
PRODUCTION MAIN SHA:
SOURCE BRANCH:
SOURCE SHA:
NEW BRANCH:
NEW HEAD:
WORKTREE:
STYLE PARITY:
PRODUCTION TOKENS REUSED:
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
