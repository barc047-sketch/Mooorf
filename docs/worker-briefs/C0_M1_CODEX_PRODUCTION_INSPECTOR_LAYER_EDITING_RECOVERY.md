# Codex Contract — C0 M1 Production Inspector, Content and Layer Editing Recovery

**TASK ID:** `C0-M1`
**STATUS:** `AUTHORIZED BY OWNER — GO CODEX M1`
**WORKER:** Codex production implementation
**MODE:** One bounded milestone; one feature branch; one fixed review head

## 1. Exact base and branch

Do not start from `main`.

Production `main` must remain unchanged at:

`c4600472ea76f651800c19b91cf8f67954ca992e`

Create the M1 work branch directly from the independently audited C0.4F-A feature head:

`feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`

Required M1 branch:

`feature/c0-m1-inspector-layer-editing-recovery`

Before editing, prove:

```bash
git fetch origin --prune
git rev-parse origin/feature/c0-4f-a-runtime-layer-separation
# must equal 21388c0d765cd4bbc675d0321d94e77db9a41e5c

git switch -C feature/c0-m1-inspector-layer-editing-recovery 21388c0d765cd4bbc675d0321d94e77db9a41e5c
```

Do not merge C0.4F-A or M1 into `main`. Stop at `WAITING_REVIEW`.

## 2. Product reason

C0.4F-A safely separated the runtime presentation targets but intentionally did not build their complete user-facing editing workflow. M1 must turn that audited technical foundation into a coherent, usable production milestone.

The result must restore and complete:

- direct Cell content editing,
- compact production Inspector,
- truthful six-target appearance editing,
- dedicated detailed settings widgets,
- one canonical history/persistence/export path,
- removal or migration of every stale, broken or disconnected control.

This is not a shell redesign, Material Browser phase, Symbol Browser phase or prototype exercise.

## 3. Read first — exact provenance

Read and record the exact refs/files used in the implementation report.

### Current production and runtime foundation

1. `AGENTS.md` at the M1 base.
2. `docs/worker-briefs/C0_4F_A_CODEX_RUNTIME_LAYER_SEPARATION.md` from `docs/mooorf-ai-team-operating-protocol`.
3. `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md` from `feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`.
4. `docs/audits/C0_4F_A_ANTIGRAVITY_FIXED_HEAD_AUDIT.md` from `audit/c0-4f-a-runtime-layer-separation@2cb97065511bfa710e149438c41eafbd2fec4949`.
5. Canonical code under `src/domain/presentation/`, `src/canvas/presentationLayers.ts`, both live renderer paths, store/history, persistence, import/export and existing widget owners.

### Inspector and interaction prototype evidence

6. `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md` from `docs/mooorf-ai-team-operating-protocol`.
7. `design-prototypes/c0-3-icons-symbols-inspector/C0_3_ICONS_SYMBOLS_INSPECTOR_PRODUCTION_HANDOFF.md` from `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`.
8. The prototype implementation only as visual/interaction evidence for Inspector geometry, Content behaviour, compact controls, selection orbit and later integration seams.

Never merge the prototype branch and never copy its mock store, fake Cells, hard-coded registries, fake export or full shell.

### Architecture and reuse evidence

9. `docs/plans/C0_SEQUENTIAL_MILESTONE_MAP_V2.md` from the governance branch.
10. `docs/plans/C0_EDITING_WORKSPACE_CANVAS_MAP_AND_BUILD_PLAN.md` from the governance branch.
11. `docs/research/MOOORF_ESSENTIAL_PRODUCT_REUSE_ATLAS.md` and `docs/research/MOOORF_CODEX_CONTRACT_INPUTS_C0_4F_B_TO_HARDENING.md` from `research/c0-fast-track-essential-product-atlas@348ee8cd62e45de1b1c51f144e1b7607acd016ee`.

### Future symbol provenance — read for compatibility only

12. `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`.
13. `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`.

Do not implement or merge the Symbol library in M1. Preserve clean seams for M2 and do not create a competing symbol schema.

## 4. Non-negotiable architecture

- One central Zustand/Master Graph store remains the sole project-data owner.
- One canonical `resolveCellAppearance` path remains the complete appearance resolver.
- Project presentation defaults and sparse per-Cell overrides remain the only appearance ownership model.
- One existing Undo/Redo/history owner remains canonical.
- One existing export/capture system remains canonical.
- `WidgetHost`, `WidgetFrame`, widget registry, shared controls and semantic tokens are mandatory.
- Do not create another Inspector store, layer store, content store, material registry, renderer-specific settings model, history stack, camera or export path.
- Temporary UI state may include active Inspector tab, active appearance target, open sections and ephemeral previews only.
- The active appearance target must have one shared ephemeral owner suitable for the future M3 Target Rail; do not bury independent active-target state inside each widget.
- Selection, active target, open widgets, hover previews and slider previews never persist or export.

## 5. M1 product outcome

A user can select one or multiple Cells and truthfully edit architectural content and all six separated appearance targets without encountering a dead, stale, fake or misowned control.

M1 ships:

1. production Inspector,
2. direct Name/Area/Body editing,
3. minimal Table sync for those three fields,
4. Content text system,
5. six dedicated layer settings widgets,
6. inheritance/multi-selection/history/persistence/export completion,
7. complete legacy control ownership cleanup.

## 6. Production Inspector

### Geometry and shell

- Reuse `WidgetFrame`, `WidgetHost`, widget registry and shared controls.
- Width target: approximately 320–340 px.
- 1440×900: support a stable right-side pinned position without hiding the selected Cell where practical.
- 1280×800: float above the Canvas rather than permanently compressing it excessively.
- Preserve production glass/tokens/compact technical density.
- No red chrome, heavy cards, oversized accordions, generic SaaS forms or new draggable-window framework.

### Initial live tabs

1. `Content`
2. `Appearance`

The production Symbol library belongs to M2. Do not expose a fake Symbol browser. A truthful disabled/future indicator is acceptable only if the current product navigation requires the tab to remain visible.

### Context and scope header

Support:

- no selection → Project Defaults,
- one selected Cell → Cell name,
- multiple selected Cells → `N Cells`,
- differing values → `Mixed`.

Use compact badges, signal dots and subtle keylines.

## 7. Direct Cell editing — Name, Area and Body

Double-click/double-activate a Cell to open one compact inline editor inside or directly beside that Cell.

Fields, in this order:

1. Space Name
2. Area
3. Body / subtext

Required behaviour:

- `Enter` commits when appropriate.
- Clicking outside commits.
- `Escape` cancels and restores the exact pre-edit state.
- `Shift+Enter` inserts a Body line break.
- Cell dragging is suspended while the editor is active.
- Body is intended for approximately 2–3 visible lines.
- Long Body content clips/ellipsizes and never changes Cell geometry.
- Area is finite, validated numeric architectural data.
- Area remains the owner of area-driven Cell radius/size.
- Name/Area/Body edits create one atomic history transaction per completed edit session.
- No duplicate local component copy becomes project data.

### Canonical data and minimal Table sync

Name, Area and Body must use the same canonical Cell/Space data consumed by Canvas and Table.

M1 may make the minimum Table changes necessary so:

- Inspector/inline Name edits appear in Table,
- Area edits appear in Table and update Cell size without resetting position/layout,
- Body edits appear in a compact Table field/column or existing detail surface,
- Table edits to Name/Area/Body update Canvas/Inspector,
- switching views does not reset Canvas,
- no broad Table redesign, bulk-editor redesign or CSV/XLS/XLSX work enters M1.

If a canonical Body field is absent, add one through the existing versioned type, validation, snapshot, recovery and migration path. Legacy files without Body must load safely with an empty value.

## 8. Content tab

Expose:

- Space Name
- Area
- Body
- Text Style preset
- Text Size
- Text Colour
- Auto Contrast

### Text Style presets

Provide complete coordinated presets for Heading + Area + Body, using the approved prototype direction:

- Technical
- Editorial
- Minimal
- Compact
- Presentation
- Diagram

Each preset controls the three-role hierarchy together.

Do not expose unrestricted font family, weight, line height, letter spacing, per-role sizes, rotation, arbitrary offsets or uncontrolled typography in M1.

Text Size scales all three roles proportionally. Text Colour applies coherently to the three roles and supports Auto Contrast plus current project palette choices.

Text Style, Text Size and Text Colour support Project Default, Local Override and Mixed states through canonical sparse ownership. Do not create a parallel typography store.

## 9. Appearance tab and active target

Appearance uses exactly six targets:

1. Cell
2. Boundary
3. Membrane
4. Membrane Edge
5. Core
6. Void

Inside the Inspector provide a compact target selector/summary and an `Open Detailed Settings` action.

Rules:

- only one active target at a time,
- shared active-target ephemeral state,
- target status shows inherited/local/mixed where relevant,
- no Selection target,
- no Connection target,
- no Annotation target,
- no unsupported setting shown merely for visual completeness.

The Inspector contains essential summaries and frequent actions. Full target controls belong to six separate widgets.

## 10. Six dedicated detailed settings widgets

Create six separate widget IDs and widget bodies. They may coexist independently and must all reuse production widget ownership.

### 10.1 Cell Settings

Expose only schema/runtime-supported controls:

- visible/on-off where canonical behaviour supports it,
- fill material/colour preview using existing owners,
- project palette choices,
- opacity where canonical schema supports it,
- Return to Default / Reset Target.

Do not create gradients, texture uploads or a new material system.

### 10.2 Boundary Settings

Expose all canonical C0.4F-A fields:

- visibility,
- solid,
- dashed,
- dotted,
- dash-dot,
- double,
- segmented bars,
- width,
- inner/centre/outer alignment,
- visual offset,
- dash/bar length where relevant,
- gap length where relevant,
- double-line spacing where relevant,
- colour,
- opacity.

Classic must preview all six styles truthfully. Organism must preserve the audited solid fallback for unsupported non-solid requests and clearly surface compatibility rather than fake WebGL dash support.

### 10.3 Membrane Settings

Migrate valid legacy Morph ownership here:

- visibility,
- fill colour/material preview,
- opacity,
- existing Reach / merge-distance / density control where canonical,
- existing Attachment/Fusion behaviour renamed into understandable architectural terminology only after mapping exact current semantics,
- existing safe motion controls only if they already have canonical ownership and remain within current performance limits.

Do not introduce new turbulence, procedural geometry, premium shaders, arbitrary shader source or a second render loop.

Every current Morph/Attachment/Density control must be mapped to one of:

- retained here with corrected naming/ownership,
- moved to a more truthful existing owner,
- hidden/removed as unsupported.

### 10.4 Membrane Edge Settings

Expose:

- visibility,
- width,
- colour,
- opacity,
- softness only if already canonical and renderer-safe.

Membrane Edge remains independent from Membrane fill.

### 10.5 Core Settings

Expose:

- visibility,
- size,
- colour,
- opacity,
- Auto Contrast through the canonical colour owner,
- presentation-only offset X/Y only if geometry/hit-testing/area remain unchanged,
- shape only where both runtime and clean export truthfully support it.

Core is not independently selectable and never represents selection.

### 10.6 Void Settings

Appearance only:

- fill visibility,
- fill colour,
- fill opacity,
- edge visibility,
- edge width,
- edge colour,
- edge opacity.

Never alter subtractive geometry, programmed area, semantic kind, hit testing, clearance or buffer behaviour from this widget.

## 11. Defaults, overrides and Mixed state

All applicable Content and Appearance controls follow:

- Project Default
- Local Cell Override
- Mixed multi-selection

Required operations:

- `Create Override` creates only required sparse fields.
- `Return to Default` removes the target/content override.
- Values equal to defaults normalize back to `undefined` where canonical normalization supports it.
- Multi-selection never invents a false shared value.
- Applying one value to many Cells creates one history transaction.
- Undo/Redo restores exact values and inheritance state.

## 12. Style actions

Provide compact actions:

- Copy Style
- Paste Style
- Reset Target
- Reset All Appearance
- Save as Preset only if an existing canonical preset owner already exists; otherwise leave this for M4 rather than adding a mock preset system.

Copy/Paste includes supported visual style for:

- Cell
- Boundary
- Membrane
- Membrane Edge
- Core
- Void
- Text Style
- Text Size
- Text Colour

Copy/Paste excludes:

- Space Name
- Area
- Body
- category
- privacy
- floor
- relationships
- selection
- active target/tab
- symbol identity

Multi-Cell Paste is one atomic transaction.

## 13. Selection feedback

Preserve the clean production selection keyline.

The approved dotted rotating orbit may be selectively adapted only if it is:

- renderer-neutral,
- clearly distinct from Boundary/Core,
- temporary UI only,
- excluded from persistence/copy/export,
- pointer-transparent,
- reduced-motion safe,
- not allowed to affect organism geometry.

If those conditions cannot be met cleanly in M1, keep only the existing clean keyline and record the orbit as deferred. Do not force it at the cost of stability.

## 14. Legacy control ownership map

Before removing controls, create:

`docs/C0_M1_CONTROL_OWNERSHIP_MAP.md`

For every currently visible Content/appearance/Morph/Core/Void/selection control, record exactly one disposition:

- `KEEP + REBIND`
- `MOVE`
- `MERGE`
- `REMOVE AS DUPLICATE`
- `HIDE AS UNSUPPORTED`

The map must include its previous owner, final owner and canonical state/action path.

Required invariants:

- no visible no-op controls,
- old Fill changes Cell only,
- Boundary changes Boundary only,
- Membrane and Membrane Edge remain independent,
- Core has one owner,
- Void appearance cannot alter subtraction,
- Selection never enters appearance,
- renderer switching never changes stored values,
- no behaviour is silently deleted before its destination is proven.

## 15. History and previews

- Slider/knob drag uses ephemeral live preview and commits once on release/change-end.
- Toggle, swatch, preset and reset commit once.
- Inline editor commits once per completed session.
- Multi-selection apply/paste/reset commits once.
- Do not add one history record per animation frame or keystroke.
- Undo/Redo must restore content, area-driven geometry, appearance and inheritance correctly.

## 16. Persistence, migration and recovery

Complete project/config/saved-view/recovery support for every field exposed in M1.

Requirements:

- legacy files load safely,
- presentation schema v1/v2 continues to migrate deterministically,
- optional Body defaults safely when absent,
- Content text settings round-trip through canonical owners,
- sparse appearance overrides remain sparse,
- project defaults and local overrides round-trip exactly,
- unknown recoverable IDs remain recoverable,
- selection, active tabs/targets, hover previews and temporary slider values never persist.

No major schema bump unless a proven blocker requires it and the report explains why.

## 17. Renderer and export parity

Truthful output is mandatory:

- clean PNG/canvas captures include final architectural content and appearance,
- Selection, Inspector/widgets and previews are excluded,
- Classic SVG/PDF supports all six Boundary styles, widths, offsets, alignment, gaps and double spacing,
- Organism raster/vector limitations are reported honestly,
- Core, Void and labels export consistently,
- Body rendering follows the chosen text preset and remains bounded,
- project export retains canonical content/defaults/sparse overrides,
- no fake vector Membrane path.

## 18. Responsive and accessibility

At both 1440×900 and 1280×800:

- Inspector and six widgets do not clip critical controls,
- pinned/floating behaviour is usable,
- selected Cell remains reasonably visible,
- no new dock/rail redesign enters M1,
- full keyboard navigation for tabs, target selector, controls and actions,
- correct focus-visible and `aria-*`,
- Escape cancels temporary editing/previews without discarding committed state,
- reduced motion respected.

## 19. Explicit exclusions

Do not implement in M1:

- production Symbol browser/library or Antigravity symbol ingestion,
- bottom dock redesign or shared contextual dock rails,
- Quick Materials rail,
- Preset rail/system unless reusing an already-live owner for a narrow action,
- full Material Browser,
- Connection system,
- Annotation Card/Studio,
- broad Table redesign or bulk editing,
- CSV/XLS/XLSX redesign,
- Floors, Dashboard or city packs,
- advanced procedural Membrane geometry/shaders,
- accounts/cloud/collaboration,
- new dependency without a proven blocker,
- merge to `main`.

## 20. Automated verification

Add focused tests for at least:

1. Name/Area/Body edit commit and Escape cancel.
2. Body does not change Cell radius or hit testing.
3. Area changes area-driven radius while preserving Cell centre/layout.
4. Canvas/Inspector/minimal Table Name/Area/Body sync.
5. Text preset/default/override/Mixed behaviour.
6. Project Default → Create Override → Return to Default.
7. Sparse normalization when local appearance equals defaults.
8. Mixed multi-selection and one-transaction apply.
9. Each appearance target updates only its canonical fields.
10. All six Boundary styles and conditional controls.
11. Membrane/Membrane Edge independence.
12. Core single ownership.
13. Void appearance cannot change subtraction/area/hit testing.
14. Undo/Redo counts for inline edits, sliders, toggles, reset and multi-paste.
15. Project/config/saved-view/recovery round-trip.
16. Selection and temporary UI exclusion.
17. PNG clean capture.
18. SVG/PDF Classic technical-stroke parity.
19. Classic/Organism projection and truthful fallback.
20. No visible control is disconnected from a canonical action/field.

Run all affected existing tests plus:

```bash
npx tsc --noEmit -p tsconfig.app.json --pretty false
git diff --check 21388c0d765cd4bbc675d0321d94e77db9a41e5c...HEAD
npm run build
```

Run exactly one final production build after corrections. The existing Vite large-chunk warning alone is accepted.

## 21. Manual deterministic QA

At 1440×900 and 1280×800 verify:

- no selection / one selection / multi-selection,
- inline Name/Area/Body editing,
- Enter/outside commit, Escape cancel, Shift+Enter Body,
- Content preset/Text Size/Text Colour/Auto Contrast,
- Inspector pinned/floating behaviour,
- all six dedicated settings widgets,
- inherited/local/mixed state,
- every Boundary style and conditional field,
- Membrane fill off + Edge on,
- Cell off + Core on where runtime supports it,
- Void visual changes with subtraction intact,
- renderer switching without value loss,
- slider preview plus one-step Undo,
- Copy/Paste/Reset Style,
- clean PNG/SVG/PDF,
- no console errors,
- no UI collision/clipping.

## 22. Required outputs

On the M1 feature branch create:

1. `docs/C0_M1_CONTROL_OWNERSHIP_MAP.md`
2. `docs/C0_M1_INSPECTOR_LAYER_EDITING_REPORT.md`

The final report must include:

- exact base/head,
- files changed,
- prototype/research provenance used,
- architecture decisions,
- control migration table,
- tests/commands and exact results,
- 1440/1280 QA evidence,
- accepted limitations/deferred items,
- confirmation that `main` was not changed.

Update `worker-status/CODEX.json` on `status/codex` at start and completion.

### Start status

- `status`: `RUNNING`
- task: `C0 M1 Production Inspector, Content and Layer Editing Recovery`
- source SHA: exact audited head `21388c0d...`
- planned branch: `feature/c0-m1-inspector-layer-editing-recovery`

### Completion status

- `status`: `WAITING_REVIEW`
- exact feature SHA
- report paths
- verification summary
- known limitations
- next gate: Owner review of combined C0.4F-A + M1 result

Push the feature branch and status branch. Stop. Do not merge and do not begin M2.

## 23. Definition of done

M1 is done only when:

- Name/Area/Body are real canonical data and edit correctly from Canvas/Inspector/minimal Table,
- all six appearance targets are truthfully editable,
- six dedicated widgets exist,
- Inspector remains compact,
- every old visible setting has a documented final owner or removal reason,
- no dead/no-op control remains,
- history/persistence/migration/export are complete for exposed fields,
- tests/typecheck/diff/build/QA pass,
- one exact fixed feature head is pushed,
- Codex stops at `WAITING_REVIEW`,
- `main` remains unchanged.
