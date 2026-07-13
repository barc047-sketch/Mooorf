# Antigravity Brief — C0.4 Modular Layer Architecture Audit

WORKER: Antigravity  
MODEL: Sonnet 4.6 / strongest audit mode  
TYPE: Read-only architecture and implementation-readiness audit  
START CONDITION: Start only after Codex reports the C0.2 merge and canonical scope sync as `DONE` on `status/codex`.

## Goal

Produce the exact production architecture map for C0.4 before any implementation begins.

C0.4 must separate architectural, presentation, selection, renderer, export and table ownership so later Cell Inspector, Flag labels and Annotation Cards can be added without rewriting the Canvas or creating duplicate state.

## Source verification

At start:

1. fetch all remotes,
2. read latest `origin/main`,
3. confirm Codex's C0.2 merge task is `DONE`,
4. record the exact latest main SHA,
5. stop as `BLOCKED` if main does not contain the approved C0.2 registry and canonical scope documents.

Required canonical documents on main:

- `docs/MOOORF_FINAL_SCOPE.md`
- `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
- `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
- `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md`
- `docs/MOOORF_CHANGE_CONTROL_PROTOCOL.md`
- `docs/MOOORF_ANNOTATION_CARD_AND_LABEL_LAYOUT_SCOPE.md`
- `docs/MOOORF_ROADMAP_AMENDMENT_2026_07_13_ANNOTATION_CARD.md`
- `docs/PROJECT_MEMORY_INDEX.md`

## Status protocol

Publish before analysis:

- branch: `status/antigravity`
- file: `worker-status/ANTIGRAVITY.json`
- status: `RUNNING`
- task: `C0.4 modular layer architecture audit`
- source branch: `main`
- source SHA: exact latest merged main
- work branch: `null`

Update after source verification, state ownership map, renderer/export map, table/history map and final recommendation.

## Write boundaries

Allowed writes only:

- Antigravity status branch/file,
- external artifacts under `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/`.

Do not:

- modify product code,
- create a feature branch,
- modify prototypes,
- merge anything,
- install packages,
- touch `.claude/launch.json`,
- touch `.references/`,
- implement C0.4 or later features.

## Required production systems to inspect

At minimum inspect exact owners for:

- `SpaceCell` / Master Graph projections,
- area-to-radius geometry,
- Zustand store and selectors,
- history/Undo/Redo,
- Classic renderer,
- Organism/WebGL renderer,
- organism adapter/settings,
- Cell labels and annotation modes,
- Boundary/Core/Membrane rendering,
- Void representation,
- selection overlays,
- material registry/resolver,
- C0.2 icon/grid registries,
- persistence and migration,
- Canvas capture and PNG/PDF/SVG exports,
- TableView and table import/export,
- WidgetHost/WidgetFrame/Inspector candidates.

## Architecture questions to answer

### A. Organism targets

Map current and required ownership for:

- Cell
- Boundary
- Membrane
- Membrane Edge
- Core
- Void
- Selection UI

For each identify:

- canonical state owner,
- renderer owner,
- export owner,
- persistence owner,
- material target support,
- hit-testing rules,
- current coupling that must be separated,
- safe migration path.

### B. Presentation layers

Reserve modular ownership for:

- Cell Label Layout,
- independent Name/Area/Body placement,
- Flag leader overlay,
- Annotation Card overlay,
- selection/editing overlay.

Important locked rules:

- there is no Linked Callout object,
- Annotation Card is standalone,
- Flag belongs to Cell Label Layout,
- Annotation Card implementation is deferred to C0.13A,
- C0.4 reserves architecture only.

### C. Area edit geometry

Trace the exact current command paths for Area edits from:

- Canvas inline editor,
- Inspector/future Inspector,
- TableView/import.

Recommend one canonical command/transaction path so a committed Area update immediately recalculates Cell radius and updates Canvas, Table, Dashboard and export.

Identify why the prototype's Area text change did not resize and distinguish prototype limitation from production ownership.

### D. Table projections

Recommend modular Data workspace projections for:

- Spaces,
- Cell Labels,
- future Annotation Cards.

These must be views over central state, not independent stores.

State exact schema/projection boundaries and migration implications without implementing them.

### E. Inspector modularity

Map how one contextual Inspector shell can load separate auditable modules such as:

- Content module,
- Text/Label module,
- Symbol module,
- Cell Style module,
- future Annotation Card Content module,
- future Card Appearance module,
- future Logo module.

Do not recommend one mega-component or independent per-object Inspector stores.

### F. Renderer and export layers

Recommend exact layer order and adapters for:

- selection/editing UI,
- future Annotation Cards,
- Cell labels and Flag leaders,
- Core,
- Boundary,
- Cell,
- Visual Connections,
- Morph Bridges,
- Membrane Edge,
- Membrane,
- Grid/background.

Confirm which layers export and which never export.

### G. Expansion safety

Identify how future redesigns can change:

- Annotation Card visuals,
- Flag geometry,
- typography presets,
- logo treatment,
- material styling,
- renderer technology,
- table presentation,

without schema corruption or duplicate ownership.

## Required deliverables

Write:

1. `C0_4_LAYER_OWNERSHIP_MATRIX.md`
2. `C0_4_STATE_HISTORY_TABLE_ARCHITECTURE.md`
3. `C0_4_RENDERER_EXPORT_LAYER_PLAN.md`
4. `C0_4_IMPLEMENTATION_SEQUENCE_AND_RISK.md`
5. `C0_4_AUDIT_STATE.json`

The ownership matrix must include:

- system/layer,
- current file owner,
- proposed owner,
- state fields,
- renderer/export adapters,
- persistence/migration,
- table projection,
- dependencies,
- risk,
- implementation milestone.

## Completion standard

Finish only when:

- latest merged main was verified,
- exact files/functions were inspected,
- current coupling is documented,
- no duplicate store/renderer/history/table path is proposed,
- C0.4 is divided into small auditable implementation slices,
- C0.5 and C0.13A dependencies are explicit,
- no product code changed.

Final status: `DONE`.

Final response must include:

- verified main SHA,
- top architecture risks,
- recommended C0.4 implementation slices,
- exact artifact paths,
- blockers,
- confirmation of no product-code changes,
- next: Project Manager prepares one Codex C0.4 implementation brief after Owner review.

PONYTAIL:

- reused: existing store, geometry, renderer, export, table, history, resource and Inspector owners
- adapted: architecture recommendations only
- new code: none
- duplication avoided: explicit purpose of the audit
