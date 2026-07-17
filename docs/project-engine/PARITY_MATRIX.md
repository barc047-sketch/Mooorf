# R0 Behaviour Parity Matrix

Automated proof and Owner/manual proof are distinct. “Missing proof” below is not a failed behaviour; it is the minimum evidence a refactor must add or repeat.

| System | Current protected behaviour | Existing proof | Missing proof | Refactor-safe boundary |
|---|---|---|---|---|
| Startup/render readiness | Loader advances monotonically through one mounted renderer to ready. | Automated: `src/ui/readiness.test.ts`; source wiring in `runtimeOrganismWiring.test.ts`. | Automated mounted-renderer readiness; Owner/manual startup with no blank frame. | Do not change readiness stages or mount two renderers. |
| Day/Night background | `--bg` is canonical for host, Canvas and authored export background. | Automated: `backgroundExportContracts.test.ts`; PF1C source contracts. | Owner/manual Day/Night live/export comparison. | Preserve token ownership and transparent Membrane composition. |
| Membrane ON/OFF | Membrane and Edge remain independent; OFF clears live field without changing authored settings. | Automated: `runtimePresentation.test.ts`, `runtimeRendererIntegration.test.ts`, `runtimeOrganismWiring.test.ts`, `pf1cContracts.test.ts`. | Owner/manual Organism ON/OFF/Edge-only visual parity. | Keep shared presentation projection; renderer adapters may differ. |
| Preview quality | AUTO/Sharp/Balanced/Fast/Ultra Fast affect live target only and keep authored/export quality. | Automated: pure preview-scale/effective-pixel-ratio cases in `pf1cContracts.test.ts`; R0.2 authored-live/detached characterization excludes preview/runtime state from export truth. | Owner/manual live sharpness and export authored-quality comparison. | Do not persist preview mode or route it into export snapshots. |
| Selection | Replace/toggle/multi-select remain one canonical store selection; overlays are temporary. | Automated: `selection.ts` consumers through `groupDrag.test.ts`, `v8_2Contracts.test.ts`, renderer contracts. | Pointer-level parity in both renderers. | Share transaction logic only; keep renderer hit testing/projection local. |
| Single/group drag | Move preview is renderer-local; pointer-up creates one transform/Undo entry. | Automated: `groupDrag.test.ts`, `v8_2c0Contracts.test.ts`. | Pointer-capture/cancel parity and Owner/manual feel in both renderers. | Preserve `commitSpaceTransform` inputs and one-entry cardinality. |
| Arrangement preview/apply/cancel | Preview is x/y-only and ephemeral; Apply is one history entry; Cancel is none. | Automated: `arrangementContracts.test.ts`. | Owner/manual preview appearance and cancel/apply interaction. | Do not move preview into persistence/export or duplicate runtime ownership. |
| Cell/Boundary editing | Shared appearance resolution drives both renderers; preview is transient and commit is bounded. | Automated: presentation contracts, `m1EditingContracts.test.ts`, `runtimePresentation.test.ts`, `runtimeRendererIntegration.test.ts`. | Mounted widget-to-renderer behaviour and Owner visual parity. | Keep `resolveAppearance`/`presentationLayers` canonical; UI only emits patches. |
| History/Undo | Drag, Arrangement, content, appearance and resource commits keep expected bounded entry counts. | Automated: `groupDrag.test.ts`, `arrangementContracts.test.ts`, presentation behaviour, `contentEditSession.test.ts`, `m2Contracts.test.ts`. | Cross-feature sequence fixture before store extraction. | Public actions and serialized final state remain identical. |
| Widgets | Reopen focuses, minimized restores, frames stay reachable, IDs do not duplicate. | Automated: `widgetLifecycle.test.ts`, registry contracts. | Owner/manual geometry, drag and responsive recovery. | Keep pure lifecycle helper, registry IDs and one WidgetHost. |
| Runtime Status | One shell surface selects the highest-priority task and truthful notifications/FPS. | Automated: R0.2-labelled service behaviour in `pf1bContracts.test.ts`; retained source-wiring/style ownership contracts. | Mounted React integration for task/notification transitions. | Keep one activity service and renderer-fed FPS; no new loop/status owner. |
| Quick Controls | One fixed surface edits canonical settings; AUTO shows effective tier; Magnet stays disabled. | Automated: `pf1cContracts.test.ts` source and pure Governor/profile cases. | Owner/manual clicks, disclosure and Inspector-independent position. | Keep existing store actions and Governor snapshot; no duplicate controls. |
| Import | Validate before atomic central-store apply; recovery/Undo stays bounded. | Automated: `src/import/importCore.test.ts`, resource persistence contracts. | Real file-input attachment/browser proof remains manual. | Preserve one FileIntake provider and central-store commit boundary. |
| Export | Snapshot is cloned once; Organism renders detached authored quality; composite owns padding/background. | Automated: `backgroundExportContracts.test.ts`, `exportCore.test.ts`, `svgExport.test.ts`, and detached-Organism ownership wiring. | **E1 PASSED:** neutral, X/Y offsets, global/radial/angular transforms, size variation, 1×/2× logical coordinates, and Cell/Boundary/Core/Void/label/symbol alignment. Owner visual output comparison passed; Classic SVG is unchanged. This does not claim general WebGL pixel identity beyond the alignment contract. | Keep snapshot/provider/composite architecture; detached overlays consume resolved geometry only; Classic SVG remains unchanged. |
| Organism capture/wiring | Mounted Organism capture delegates to detached export; live presentation Canvas is not export truth. | Automated: R0.2 `runtimeOrganismWiring.test.ts` verifies delegation plus authored overlay build/composite ownership. | WebGL detached-render pixel/parity fixture and Owner visual output comparison. | Preserve detached snapshot/provider/composite ownership; do not capture mutable mounted presentation. |
| Classic fallback | Persisted Classic mode renders through `CanvasView`/`renderer`; SVG remains truthful. | Automated: `m1RendererBehaviour.test.ts`, `runtimeRendererIntegration.test.ts`, `svgExport.test.ts`. | Explicit startup/failure-fallback integration and Owner/manual Classic gesture parity. | Retain Classic; no removal or renderer unification in R0. |
| Persistence/saved views | Final authored settings/positions round-trip; previews/session state do not persist. | Automated: `importCore.test.ts`, `resourcePersistence.test.ts`, `uiScale.test.ts`, presentation correction tests. | One consolidated saved-view round-trip fixture before store extraction. | No schema/key/default change; public `useLab` actions remain stable. |
| Table synchronization | Table edits the same `spaces` store projection as Canvas. | Automated: limited source ownership evidence in `m1ProductContracts.test.ts` and import/store tests. | Behavioural Canvas↔Table edit synchronization test. | Do not create Table-local product state. |
| PF1D workspace switching | Canvas spaces, camera, selection, renderer mode, open/minimized/moved widgets, Inspector shortcut, and Loader/readiness remain owned by their existing persistent instances while Table mounts lazily above them. | Automated: `pf1dContracts.test.ts`, `pf1cContracts.test.ts`, `readiness.test.ts`, `runtimeRendererIntegration.test.ts`, and `inspectorShortcut.test.ts` passed 78/78. Browser: moved/minimized widget geometry and Canvas state survived repeated switches; Canvas start requested 0 Table modules, first Table open 1, and repeat switches 0 additional. Owner PF1D.1E visual QA passed. | PF1D.2 must separately measure true Canvas renderer-loop pause and Table theme-switch performance; dense-row/search/import parity remains later scope. | Preserve one Canvas, one Table projection, one store, one Loader/readiness path, one Inspector listener, and permanently mounted chrome wrappers; workspace switching must not reset project/session state. |

## Minimum parity gates by recommended pass

### R0.1 — Shared Canvas gesture transaction core

- Before: capture passing focused results for `groupDrag`, `v8_2c0Contracts` and `contextHost`; record current Undo counts and camera-commit timing.
- After automated: the same focused results plus pure controller cases for replace/toggle, threshold transition, pointer cancel, group commit, pan commit and wheel merge.
- After Owner/manual: Classic and Organism single select, modifier toggle, single/group drag, pan, cursor-centred zoom, context menu and inline-editor activation.
- Boundary: renderer-specific hit testing, coordinates, invalidation, Governor boost and render loops stay adapter-owned.

### R0.2 — Behaviour-first parity and contract split

- Before: create an assertion inventory for the four named suites; label each behavioural, source-wiring, style or Owner/manual.
- After automated: every removed string assertion maps to an equal or stronger behavioural assertion; live/detached authored settings, presentation, shadow and export-preview exclusion receive a characterization fixture.
- After Owner/manual: none required for test-only edits unless a discovered gap requires DOM/WebGL; stop instead of claiming automation.
- Boundary: no production test-only exports and no weakened coverage.

### R0.3 — Split widget-owned CSS from the edge shell

- Before: inventory moved selectors, declarations, media queries and source-contract file assumptions.
- After automated: selector/declaration inventory is identical and focused PF1B/PF1C/widget contracts pass.
- After Owner/manual: compare Day/Night at 1440px and 1280px for Dock, Rail, Runtime Status, Quick Controls, Arrangement, Appearance and palette widgets; verify reduced motion.
- Boundary: no token, selector, specificity, order or visual-value changes.

**Outcome:** CSS ownership parity passed: 11 semantic blocks and 95 selector clauses moved with exact declaration/value/specificity/cascade parity; focused PF1B/PF1C contracts passed and Owner visual parity passed. E1 detached-export geometry parity passed for the bounded resolved-overlay contract; it does not claim general WebGL pixel identity.

### R0.4 — Delete the proven local Sonner orphan

- Before: `rg` confirms zero imports/exports through application and package entrypoints.
- After automated: Knip/dependency checks, TypeScript and focused startup shell proof remain clean.
- After Owner/manual: none beyond normal startup sanity.
- Boundary: delete one file only; no dependency changes.

### R0.5 — Extract pure store transaction internals

- Before: capture focused presentation, drag, Arrangement, content, resource, import and saved-view results plus serialized snapshot fixtures.
- After automated: identical action names, history entry counts, Undo/Redo results and serialized snapshots; add pure helper cases without replacing end-to-end store cases.
- After Owner/manual: Arrangement apply/cancel, appearance preview/commit and saved-view load remain unchanged.
- Boundary: one Zustand store, unchanged persistence/schema and no second public state API.
