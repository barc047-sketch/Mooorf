# C0 M1 Production Inspector, Content and Layer Editing Recovery Report

## Fixed-head identity

- Task: `C0-M1`
- Source base: `feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`
- Feature branch: `feature/c0-m1-inspector-layer-editing-recovery`
- Fixed review head: the single pushed head of that branch; its immutable SHA is recorded in the completion commit on `status/codex` and in the worker handoff because a commit cannot contain its own SHA.
- Production guard: `origin/main` was verified before work at `c4600472ea76f651800c19b91cf8f67954ca992e` and is rechecked at handoff. No merge was performed.

## Outcome

M1 is a production recovery milestone, not a prototype panel. Name, Area and optional Body/subtext are canonical `SpaceCell` data edited through one history-aware action from Canvas inline editing, Inspector and the minimal Table. A compact two-tab Inspector and six independent detailed settings widgets reuse `WidgetHost`, `WidgetFrame`, the existing registry, controls and semantic glass tokens.

Text Style provides six coordinated Heading/Area/Body presets with one proportional Text Size and Text Colour/Auto Contrast. Project defaults plus normalized sparse per-Cell overrides provide Project Default, Local Override and Mixed states. Sliders preview ephemerally and commit once. Copy/Paste/Reset excludes content, selection and shared-field values.

Cell, Boundary, Core and Void support sparse per-Cell overrides. The audited Organism Membrane and Membrane Edge are independent shared fields, so their detailed widgets truthfully edit Project Defaults for every Cell; they do not create per-Cell values the field renderer cannot display. Supported legacy Morph/Fusion/Reach controls moved into Membrane Settings and use the same canonical runtime settings/history owner.

## Exact provenance read

| Evidence | Exact ref and file |
| --- | --- |
| M1 contract and governance | `origin/docs/mooorf-ai-team-operating-protocol@5483a76b7028db1541cf0d1187d7685a18fb6b98`: `docs/worker-briefs/C0_M1_CODEX_PRODUCTION_INSPECTOR_LAYER_EDITING_RECOVERY.md`, `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`, `docs/MOOORF_FINAL_SCOPE.md`, `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`, `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`, `docs/PROJECT_MEMORY_INDEX.md`, `docs/CODEX_PHASE_PROTOCOL.md` |
| Runtime contract | same governance ref: `docs/worker-briefs/C0_4F_A_CODEX_RUNTIME_LAYER_SEPARATION.md` |
| Audited runtime implementation | `feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`: `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md`, canonical presentation/renderer/store/persistence/export code |
| Fixed-head audit | `audit/c0-4f-a-runtime-layer-separation@2cb97065511bfa710e149438c41eafbd2fec4949`: `docs/audits/C0_4F_A_ANTIGRAVITY_FIXED_HEAD_AUDIT.md` |
| Inspector scope | governance ref: `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md` |
| Approved prototype evidence only | `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`: `design-prototypes/c0-3-icons-symbols-inspector/C0_3_ICONS_SYMBOLS_INSPECTOR_PRODUCTION_HANDOFF.md` and prototype geometry/interaction implementation |
| Editing/reuse plans | governance ref: `docs/plans/C0_SEQUENTIAL_MILESTONE_MAP_V2.md`, `docs/plans/C0_EDITING_WORKSPACE_CANVAS_MAP_AND_BUILD_PLAN.md` |
| Reuse research | `research/c0-fast-track-essential-product-atlas@348ee8cd62e45de1b1c51f144e1b7607acd016ee`: `docs/research/MOOORF_ESSENTIAL_PRODUCT_REUSE_ATLAS.md`, `docs/research/MOOORF_CODEX_CONTRACT_INPUTS_C0_4F_B_TO_HARDENING.md` |
| M2 compatibility only | `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`; `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4` |

The prototype contributed only compact right-side geometry, two-tab interaction density and Content editing evidence. Its mock store, fake Cells, prototype shell, hard-coded registries and fake export were not copied or merged. No Symbol UI or symbol schema was implemented.

## Architecture decisions

1. The central Zustand/Master Graph store remains the only data/settings owner. Its existing bounded transform history now also records Cell content/appearance, project defaults and supported Membrane runtime changes.
2. `resolveCellAppearance` plus `projectRuntimePresentation` remains the renderer-neutral appearance projection. Both live renderers and true-vector Classic SVG consume it.
3. M1 adds schema-v2-compatible text defaults/overrides and optional Body without a major project schema bump. Legacy label scale/fixed colour migrate into text defaults; legacy files without Body load as an empty string.
4. One ephemeral store projection owns active target, Cell/default previews, Membrane runtime preview and style clipboard. None is persisted or exported.
5. Clean raster capture temporarily clears every M1 preview before the existing capture bridge runs, then restores UI preview state. It does not add an export path.
6. Body is bounded to three display lines and never enters radius, centre, hit testing, clearance or Void subtraction.
7. Classic implements all six Boundary styles. Organism retains its audited solid fallback for non-solid requests and reports that limitation in the widget.

## Control migration summary

The exhaustive table is [C0_M1_CONTROL_OWNERSHIP_MAP.md](C0_M1_CONTROL_OWNERSHIP_MAP.md).

| Previous surface | Disposition | Production owner |
| --- | --- | --- |
| Inline and Table Name/Area | KEEP + REBIND | one `commitSpaceEdit` transaction; Body merged into the same path |
| Annotation Text Scale/Colour | MERGE | Inspector coordinated text defaults/overrides with legacy migration |
| Dock + Organism Morph/Attachment/Reach | MOVE | Membrane Settings Field character/Fusion/Reach |
| Display Morph | REMOVE AS DUPLICATE | Membrane visibility |
| Display Show nuclei | MOVE | Core Settings |
| Old broad Organism procedural controls | HIDE AS UNSUPPORTED | compatibility state retained; excluded advanced Membrane work |
| Old Palette browser/quick control | HIDE AS UNSUPPORTED | canonical resolver retained; M1 paint swatches reuse it |
| Duplicate Rail Add Void | REMOVE AS DUPLICATE | existing Dock Add Void |
| Selected keyline | KEEP + REBIND | existing ephemeral selection overlay; prototype orbit deferred |
| Six target appearance gaps | MERGE | six independent detailed settings widgets |

## Files changed

- Domain/data/history: `src/types.ts`, `src/state/store.ts`, `src/domain/presentation/{types,defaults,validation,resolveAppearance,editing}.ts`.
- Focused contracts: `src/domain/presentation/m1EditingContracts.test.ts`, `src/domain/presentation/m1ProductContracts.test.ts`.
- Canvas/content/rendering: `src/canvas/CanvasView.tsx`, `InlineCellEditor.tsx`, `cellActivation.ts`, `inlineCellEditor.css`, `OrganismCanvasView.tsx`, `organismCanvas.css`, `presentationLayers.ts`, `renderer.ts`.
- Inspector/widgets/shell: `src/ui/widgets/InspectorWidget.tsx`, `AppearanceSettingsWidgets.tsx`, `WidgetHost.tsx`, `DisplayWidget.tsx`, `controls.tsx`, `widgets.css`, `src/ui/panels/widgetRegistry.ts`, `src/ui/Rail.tsx`, `src/ui/Dock.tsx`, `src/ui/shell.css`.
- Table/import/export: `src/views/TableView.tsx`, `src/import/projectFiles.ts`, `src/export/canvasComposite.ts`, `exportService.ts`, `svgExport.ts`.
- Required handoff: this report, `docs/C0_M1_CONTROL_OWNERSHIP_MAP.md`, `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`, root gateways `HANDOFF.md` and `TASK_QUEUE.md`.

## Automated verification

Executed after all source corrections:

| Command | Exact result |
| --- | --- |
| all repository `*.test.ts` files executed with `npx --yes tsx` | PASS; all affected and existing contract files green |
| `npx tsc --noEmit -p tsconfig.app.json --pretty false` | PASS; zero diagnostics |
| `git diff --check 21388c0d765cd4bbc675d0321d94e77db9a41e5c...HEAD` | PASS; no whitespace errors |
| `npm run build` | PASS; exactly one final production build after corrections; accepted Vite large-chunk warning only |

Focused M1 coverage includes canonical content commit/Escape source contracts, Body geometry invariance, Table/Inspector/Canvas ownership, six text presets, default/local/mixed inheritance, sparse reset, multi-selection one-transaction preview/apply, target isolation, all six Boundary SVG styles, Membrane/Edge independence and shared ownership, single Core owner, Void invariants, undo/redo, legacy migration/project round-trip, preview/selection exclusion, clean-capture wiring, renderer fallback and visible-control action wiring.

## Deterministic browser QA

### 1440 × 900

- No selection showed Project Defaults; one selection showed the Cell context; Shift-click multi-selection showed `2 Cells` and Mixed state.
- Inline Name, Area and two-line Body committed with Enter/Shift+Enter; Escape restored the exact pre-edit Name.
- Table Body edit (`Table synced body`) immediately appeared in Canvas and Inspector after returning to Canvas.
- Editorial preset, Text Size and custom Text Colour/Auto Contrast projected into the live label hierarchy.
- All six detailed widgets opened independently and exposed Return to Default. Boundary inherited values rendered as finite defaults after the mixed-value correction.
- Inspector pinned geometry measured `left 1090`, `right 1422`, `top 72`, width `332`, height `617.75`; the selected Cell remained reasonably visible.
- Fresh-tab console warnings/errors: `[]`.
- PNG, Classic true-vector SVG and PDF each reached the product `Complete` state without console error.

### 1280 × 800

- Inspector floated above Canvas at `left 936`, `right 1268`, `top 72`, width `332`, height `617.75`.
- Widget body `scrollHeight` equalled `clientHeight` (`581`), so no critical controls clipped and the page had no body-level overflow.
- One/multi/default contexts, Content controls and target navigation remained usable without rail/dock collision.

The in-app browser does not surface `file-saver` downloads as a browser download event; therefore artifact transport was evidenced by each production `Complete` state plus zero fresh-console errors, while deterministic SVG/project/export contracts cover generated content. No local file picker was required for M1.

## Accepted limitations and deferred items

- Organism non-solid Boundary requests render the audited solid fallback. Classic and Classic SVG render all six requested styles.
- Membrane and Membrane Edge are one shared organism field/edge pair. They remain independent targets but edit Project Defaults, not misleading per-Cell overrides.
- Organism true-vector Membrane extraction remains unavailable; M1 does not fake a vector path. Raster PNG/PDF use the canonical live renderer.
- The prototype dotted selection orbit is deferred; the clean existing keyline remains.
- Advanced procedural field/nucleus/offset/motion/pocket controls and the legacy Palette browser have no production M1 launcher. Their compatibility data remains preserved.
- Symbols, Material Browser, Annotation Studio, connection tools, broad Table redesign and M2 are not started.

## Gate

The feature branch is pushed as one fixed review head, `status/codex` records that exact SHA as `WAITING_REVIEW`, and the next gate is Owner review of the combined C0.4F-A + M1 result. No merge and no M2 work occurred.
