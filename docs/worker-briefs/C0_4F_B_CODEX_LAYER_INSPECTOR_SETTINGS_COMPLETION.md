# Codex Brief — C0.4F-B Production Layer Inspector and Settings Completion

TASK ID: C0.4F-B
STATUS: PREPARED — START ONLY AFTER C0.4F-A MERGE
WORKER: Codex production implementation
MODE: One substantial bounded completion batch

## Exact prerequisite

Do not start until production `main` is exactly:

`21388c0d765cd4bbc675d0321d94e77db9a41e5c`

This must be the audited fast-forward result of merging:

`feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`

Planned work branch:

`feature/c0-4f-b-layer-inspector-settings`

Create it from the exact post-merge `main` SHA above.

## Owner direction

C0.4F-A successfully separated the runtime presentation targets, but the product is incomplete until users can actually edit those targets. Existing flat or stale settings that no longer control the correct renderer layer are unacceptable.

C0.4F-B must finish the layer system as one coherent product milestone:

- repair every broken, stale or no-op visual setting,
- redesign the production Cell Inspector around the six canonical presentation targets,
- connect every visible control to the canonical presentation defaults/override model,
- preserve one Master Graph/store, one appearance resolver and one history system,
- complete persistence and clean export parity,
- verify the complete flow in one implementation session,
- do not create another broad audit/research loop.

## Read first

1. `AGENTS.md`
2. `docs/worker-briefs/C0_4F_A_CODEX_RUNTIME_LAYER_SEPARATION.md`
3. `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md` at merged main
4. `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md` from the governance branch
5. `docs/research/MOOORF_ESSENTIAL_PRODUCT_REUSE_ATLAS.md` from `research/c0-fast-track-essential-product-atlas@348ee8cd62e45de1b1c51f144e1b7607acd016ee`
6. `docs/research/MOOORF_CODEX_CONTRACT_INPUTS_C0_4F_B_TO_HARDENING.md` from the same research head
7. `design-prototypes/c0-3-icons-symbols-inspector/C0_3_ICONS_SYMBOLS_INSPECTOR_PRODUCTION_HANDOFF.md` from `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`
8. Existing production `WidgetFrame`, `WidgetHost`, compact controls, palette controls, inline editor, settings panels, store actions, history, persistence and export owners proven through imports/search
9. Canonical presentation files under `src/domain/presentation/` and `src/canvas/presentationLayers.ts`

Record the exact files and refs used. Prototype branches are design evidence only; never merge or copy their mock store/shell wholesale.

## Product outcome

A selected Cell or multi-selection must have one compact production Inspector where every separated presentation target can be edited truthfully and immediately.

The user must never see a control that is disconnected, fake, stale, silently ignored or writing to the wrong layer.

## Inspector information architecture

Use three compact top-level tabs:

1. `Content`
2. `Appearance`
3. `Symbol`

The primary work of this phase is the `Appearance` tab. Preserve/adapt existing Content and Symbol work only where needed for a coherent production panel; do not expand into Table/Area/File Intake scope.

### Panel geometry

- Reuse production `WidgetFrame` and `WidgetHost`.
- Target width approximately 320–340 px.
- At 1440 desktop, support pinned/right-zone behaviour without covering the selected Cell.
- At 1280 laptop, use floating behaviour to protect canvas width.
- Reuse current glass/tokens/compact control density.
- No red UI chrome.
- No heavy cards, large accordion blocks or generic SaaS form styling.
- No full Material Browser embedded inside the Inspector.

## Scope and inheritance header

At the top of the Inspector show a compact scope state:

- `Project Default` when no Cell is selected,
- selected Cell name for one selection,
- `N Cells` for multi-selection,
- `Mixed` where selected Cells differ.

All presentation targets use the same two-level ownership rule:

- Project Default
- Local Cell Override

Required behaviour:

- inherited values are visibly identified,
- `Create Override` creates only the necessary sparse override object,
- `Return to Default` removes the relevant sparse override fields,
- if a local value equals the project default, normalize it back to `undefined`,
- multi-selection shows Mixed without inventing a false value,
- applying a value to multiple Cells creates one history transaction.

Use small state dots, compact badges and subtle keylines rather than large banners.

## Appearance target rail

Inside `Appearance`, add a compact target rail or segmented target selector containing exactly:

1. Cell
2. Boundary
3. Membrane
4. Membrane Edge
5. Core
6. Void

Rules:

- only one target editor is expanded at a time,
- each target shows a small enabled/inherited/override/mixed status signal,
- target selection is temporary UI state and is not project data,
- settings shown must be relevant to that target only,
- Selection UI is not a seventh appearance target,
- do not expose unsupported controls merely for visual completeness.

## Target controls

### 1. Cell

Expose:

- visible on/off,
- fill colour/material preview using existing palette/material owners,
- compact project palette swatches,
- opacity only if supported by the canonical schema,
- compact `Open Material Browser` action only if the existing owner is safely callable.

Do not add textures, gradients or a new material system.

### 2. Boundary

Expose all canonical C0.4F-A fields:

- visible on/off,
- style: solid, dashed, dotted, dash-dot, double, segmented-bars,
- width,
- alignment: inner, centre, outer,
- visual offset,
- dash/bar length when applicable,
- gap length when applicable,
- secondary-line spacing when `double`,
- colour,
- opacity.

Use compact icon/preset controls. Conditional settings must appear only when relevant.

Classic must preview every style truthfully. Organism must display the documented truthful solid fallback for unsupported non-solid requests; do not fake WebGL dash support.

### 3. Membrane

Expose only essential current capabilities:

- visible on/off,
- fill colour/material preview,
- opacity.

Do not add advanced membrane geometry, texture, motion, turbulence or physics controls.

### 4. Membrane Edge

Expose:

- visible on/off,
- width,
- colour,
- opacity.

Membrane Edge must remain editable independently from Membrane fill.

### 5. Core

Expose:

- visible on/off,
- size,
- colour,
- opacity,
- Auto Contrast if it reuses the canonical colour/contrast owner,
- offset X/Y only if implemented as presentation-only values without affecting geometry, hit testing or area.

Do not make Core an independently selectable canvas object.

### 6. Void

Void controls are appearance only. Never expose or modify subtraction geometry, programmed area, hit testing, clearance or semantic kind in this phase.

Expose:

- fill visible on/off,
- fill colour,
- fill opacity,
- edge visible on/off,
- edge width,
- edge colour,
- edge opacity.

Preserve the quiet default Void appearance and immutable subtractive semantics.

## Repair and migration of existing settings

Audit every currently visible appearance/settings control in production.

For every control, do exactly one:

- rebind it to the canonical target/default/override field,
- migrate it to the correct new target editor,
- hide/remove it because the capability is deferred or unsupported.

No visible no-op controls may remain.

Required checks:

- old Fill controls update Cell only,
- old Boundary controls update Boundary only,
- old organism/body controls map correctly to Membrane or Membrane Edge,
- Core controls no longer affect shader-owned duplicate state,
- Void appearance controls never alter subtraction geometry,
- Selection controls never enter appearance persistence,
- changing renderer does not silently change stored appearance values.

## Store and resolver rules

- One central Zustand/Master Graph remains the sole data owner.
- `resolveCellAppearance` remains the canonical complete resolver.
- Per-Cell values write only to canonical sparse `appearanceOverrides` ownership.
- Project defaults remain separate from local overrides.
- Do not create a second settings store, layer store, UI schema or renderer-local persisted state.
- The Inspector may keep only temporary UI state locally: active tab, active target, open/closed sections and ephemeral slider preview.
- Unknown future fields/IDs must remain recoverable where current migration contracts require it.

## History and live-preview contract

- Slider/pointer drag: render an ephemeral live preview, then commit exactly one history transaction on pointer-up/change-end.
- Keyboard slider edits: coalesce logically and commit at blur/Enter according to existing history conventions.
- Toggle, preset, colour swatch and reset: one immediate history transaction.
- `Create Override`, `Return to Default`, `Reset Target`, `Reset All`, Paste Style and multi-Cell edits: one atomic transaction each.
- Undo/Redo must restore exact target values and inheritance state.
- Do not push one history record per animation frame.

## Style actions

Provide compact actions:

- Copy Style
- Paste Style
- Reset Target
- Reset All Appearance

Copy/Paste includes appearance settings for Cell, Boundary, Membrane, Membrane Edge, Core and Void.

It excludes:

- Space Name,
- Area,
- Body,
- category,
- privacy,
- floor,
- relationships,
- Selection UI,
- symbol identity unless an existing separately approved symbol-style contract explicitly includes placement styling.

Multi-Cell Paste is one transaction.

## Persistence and migration

Complete project/config/saved-view/recovery compatibility for all controls exposed in this phase.

Requirements:

- schema v1/v2 and missing appearance data load safely,
- sparse overrides remain sparse,
- project defaults and local overrides round-trip exactly,
- old flat/stale settings migrate to canonical targets where a deterministic mapping exists,
- unsupported legacy fields are preserved/recoverable or explicitly documented,
- no major schema bump unless a proven blocker requires it,
- Selection, active target/tab, hover preview and temporary slider values are never persisted.

## Export parity

Complete truthful clean-output behaviour for settings exposed by the Inspector:

- PNG/canvas captures include the final architectural appearance layers,
- Selection, Inspector chrome, hover previews and temporary UI state remain excluded,
- SVG/PDF vector export supports the six Classic Boundary styles, widths, offsets, alignment and double spacing,
- Membrane limitations remain truthful; do not claim vector geometry that is raster-only,
- Core and Void appearance export consistently,
- Organism unsupported Boundary styles use the documented fallback rather than silently disappearing,
- project export retains canonical defaults and sparse overrides.

## Responsive and accessibility requirements

- Full keyboard access for tabs, target rail, toggles, preset buttons, sliders and reset actions.
- Correct `aria-label`, focus-visible state and disabled explanations.
- `Escape` closes/cancels temporary UI where appropriate without altering committed project state.
- Respect reduced motion.
- No panel clipping at 1440×900 or 1280×800.

## Explicit exclusions

Do not implement in C0.4F-B:

- Area resizing or Table/Canvas sync,
- CSV/Excel import redesign,
- Floors,
- Dashboard/statistics,
- Connections,
- advanced Membrane motion/geometry,
- full Material Browser redesign,
- city packs,
- AI assistance,
- accounts/cloud/collaboration,
- broad shell redesign,
- new dependencies without a proven blocker.

## Required automated verification

Add focused tests for at least:

1. Project Default -> Create Override -> Return to Default.
2. Sparse normalization when local values equal defaults.
3. Mixed multi-selection state and one-transaction apply.
4. Each target updates only its own canonical fields.
5. Boundary conditional fields and all six styles.
6. Membrane and Membrane Edge independence.
7. Core ownership remains single and renderer-consistent.
8. Void appearance cannot change subtraction/area/hit testing.
9. Undo/Redo transaction count for sliders, toggles, reset and multi-paste.
10. Project/save/load/recovery round-trip.
11. Selection and temporary UI exclusion.
12. PNG clean capture.
13. SVG/PDF technical Boundary parity.
14. Classic and Organism projection/fallback consistency.
15. No visible control is disconnected from a canonical action/field.

Run existing affected tests plus:

- app typecheck,
- `git diff --check`,
- exactly one final production build after corrections.

The known Vite large-chunk warning alone is not a failure.

## Manual deterministic QA

At both 1440×900 and 1280×800 verify:

- panel pinned/floating behaviour,
- single selection, no selection and multi-selection,
- inherited/local/mixed indicators,
- each of the six target editors,
- every Boundary style and conditional control,
- Membrane fill off + Membrane Edge on,
- Cell off + Core on,
- Void appearance while subtraction remains intact,
- renderer switching without value loss,
- slider preview and one-step Undo,
- reset target/default behaviour,
- clean PNG/SVG/PDF output,
- no selection/UI contamination,
- pan, zoom and drag remain usable while Inspector is open,
- no console errors or infinite render loops.

## Stop conditions

Stop and report rather than expanding scope if:

- main is not exact prerequisite SHA,
- a second store/resolver/history system appears necessary,
- settings require geometry or hit-testing changes,
- Inspector controls create update-depth/selector loops,
- a visible control cannot be connected truthfully,
- project migration would silently lose data,
- renderer switching corrupts values,
- clean export cannot exclude UI state,
- package/dependency changes appear necessary without explicit approval.

## Output and stop gate

- Push one fixed feature head to `feature/c0-4f-b-layer-inspector-settings`.
- Write `docs/C0_4F_B_LAYER_INSPECTOR_SETTINGS_COMPLETION_REPORT.md`.
- Update `status/codex` with exact base, feature head, changed files, test evidence, build evidence, browser QA and known limits.
- Stop at `WAITING_REVIEW`.
- Do not merge.
- Do not begin Area/Table/File Intake work.
