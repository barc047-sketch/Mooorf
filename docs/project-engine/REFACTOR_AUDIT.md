# R0 Structural Refactor Audit

## Executive decision

**TARGETED REFACTOR RECOMMENDED**

No P0 issue blocks PF1D, but three bounded passes should reduce immediate regression cost before it starts. `OrganismCanvasView.tsx` combines 1,330 lines, 27 production dependencies, six milestone commits, renderer lifecycle, gesture transactions, presentation overlays, performance and capture. Both Canvas owners also carry parallel selection/drag/pan/wheel state machines, while 13 test files use 503 source-text assertions. The central store and live/detached export paths are coupled but protected enough to defer deeper extraction. Execute R0.1–R0.3 only; leave R0.4 and R0.5 for their stated gates.

## Evidence summary

- Source SHA: `1cf47fef4188da89a0dbdcf0a8141457d11a959a`.
- Audit branch: `audit/r0-structural-refactor`.
- Commands used: branch/HEAD/status/fetch verification; `npm run audit:impact -- origin/main`; `npm run audit:deps`; `npm run audit:dead`; `npm run audit:summary`; direct `depcruise` fan-in/fan-out parsing; bounded `rg`, `wc -l`, and `git log --name-only/--numstat` queries.
- Tool evidence: 217 modules mapped; zero dependency cycles; nine orphan warnings; Knip production scan reported zero findings. Direct source verification classified seven warnings as type-only/canonical false positives, one as a real orphan, and one as an unused graph import contract that still needs Owner classification.
- Direct examination: 35 production files; metadata/history mapping: 217 modules and 91 changed paths against `origin/main`.
- Limitations: no tests, build, preview, browser QA, benchmark or runtime profiling ran. Ignored `.audit` artifacts were only an index; findings were checked against current source/imports/history. No historical phase reports were read.
- No-product-change confirmation: this audit changed Project Engine documentation only.

## Ranked findings

| Rank | ID | Area | Evidence | Change cost today | Risk | Expected benefit | Recommendation |
|---:|---|---|---|---|---|---|---|
| 1 | R0-F1 | Organism host concentration | `OrganismCanvasView.tsx`: 1,330 lines, 27 fan-out, six commits, 438 additions/229 deletions; owns lifecycle, gestures, render-frame mutation, overlays, readiness, Governor and capture. | Every renderer task rereads and retests several concerns. | P1 | Smaller blast radius and faster renderer work. | R0.1: extract only renderer-neutral gesture transactions behind adapters. |
| 2 | R0-F2 | Duplicated Canvas input paths | Both Canvas views independently implement press/drag/pan, selection intent, group translation, context opening, rAF move coalescing, wheel zoom and delayed camera commit. | Behaviour fixes must be mirrored across 1,330- and 476-line hosts. | P1 | One parity seam for selection, drag, pan, context and zoom. | Share state transitions; keep hit testing, coordinate projection and invalidation renderer-local. |
| 3 | R0-F3 | Test efficiency | 13 files read production source text; 503 source-text assertions. `pf1cContracts.test.ts` is 889 lines; Runtime Status and Organism host sources are reread 12+ times. | Small refactors cause broad string-test churn without proving runtime behaviour. | P1 | Faster focused validation and safer extraction. | R0.2: characterize parity, split suites, replace touched string assertions with behaviour seams. |
| 4 | R0-F4 | CSS ownership | `shell.css` is 2,287 lines and owns edge shell plus Organism controls, Arrangement and palette/widget rules; `widgets.css` already owns widget chrome. | Widget work crosses a global cascade file. | P2 | Lower visual regression radius and clearer ownership. | R0.3: move only widget-owned sections while preserving selector order/specificity. |
| 5 | R0-F5 | Store internal coupling | `store.ts`: 1,688 lines, 21 fan-out, 40 fan-in and 53 actions; four preview/commit/cancel families plus history and saved-view persistence. | New state work requires broad review even when the public store contract is unchanged. | P2 | Pure, testable internals without a second store. | R0.5 only when store work next requires these paths; preserve `useLab`. |
| 6 | R0-F6 | Live/export projection overlap | Live Organism and detached export both resolve palette, presentation, shadow, nuclei and `OrganismRenderFrame`; export deliberately omits Governor/motion and reuses Classic SVG for overlays. | Presentation changes require two careful audits. | P2 | A parity fixture can prevent authored/export drift. | Add parity characterization in R0.2; do not share lifecycle or mutable live frames yet. |
| 7 | R0-F7 | Stale/unreachable seams | `src/components/ui/sonner.tsx` has no importer; `src/domain/graph/import-contract.ts` exports have no caller; deprecated `useLab.select` has no application caller. | Low ongoing noise; deletion has limited payoff. | P2 | Smaller false ownership surface. | R0.4 deletes only the proven Sonner wrapper; Owner must separately classify the graph contract and store alias. |
| 8 | R0-F8 | Dependency warnings | Dependency Cruiser reports nine orphans but eight are imported type owners or explicit canonical graph/resource contracts; zero cycles. | Acting on raw warnings would delete required contracts. | P3 | Avoid destructive false-positive cleanup. | Tune audit classification later; retain type owners and graph selectors/adapters. |
| 9 | R0-F9 | Classic compatibility | `App.tsx` still mounts `CanvasView` for persisted `rendererMode: "classic"`; Classic owns a live renderer and SVG; detached Organism export uses `buildClassicSvg` for overlays. | Removal is a migration with export/fallback consequences. | P3 | Retention protects compatibility and authored export. | Leave Classic intact; removal is a separate Owner-approved migration. |
| 10 | R0-F10 | Stable isolated owners | Widget lifecycle is a 44-line pure helper; Governor/runtime are isolated services; capture clones one snapshot; registries are immutable/status-labelled. | Refactoring would spend credits without reducing current coupling. | P3 | Stability and clear contracts. | Do not refactor these owners now. |

Finding counts: **P0 0 · P1 3 · P2 4 · P3 3**.

## Recommended passes

### R0.1 — Shared Canvas gesture transaction core

- Current behaviour: Classic and Organism independently implement the same selection/drag/pan/context/wheel transaction flow with renderer-specific hit testing and invalidation.
- Structural improvement: extract a pure gesture state machine/controller with injected hit-test, projection, invalidation and interaction-boost adapters. Do not move render loops.
- Likely files: add `src/interaction/canvasGestureController.ts` and `src/interaction/canvasGestureController.test.ts`; modify `src/canvas/CanvasView.tsx` and `src/canvas/OrganismCanvasView.tsx`.
- Public API impact: internal API only. Persistence/schema impact: none. Expected production files: 3.
- Model: **Terra**; reasoning: high; planned units: **2**; limit: 75 minutes; read limit: 12 files; write limit: 4 files.
- Validation: focused controller, `groupDrag`, `v8_2c0Contracts` and `contextHost` checks before/after; TypeScript; Owner manual selection, single/group drag, pan, zoom and context in both renderers.
- Stop conditions: any store-action signature change, renderer-lifecycle unification, coordinate drift, changed Undo cardinality, or inability to exercise Classic parity.
- Rollback boundary: one new controller/test plus two host adapters; revert the pass without persistence migration.

### R0.2 — Behaviour-first parity and contract split

- Current behaviour: PF1B/PF1C mix service behaviour, UI source strings and CSS text in 451/889-line suites; 13 suites contain source reads.
- Structural improvement: inventory each touched assertion, split runtime behaviour from wiring/style contracts, and replace source-string assertions only where an existing exported behaviour seam can prove the same contract. Add live-versus-detached authored projection characterization before any future export extraction.
- Likely files: `src/runtime/pf1bContracts.test.ts`, `src/runtime/pf1cContracts.test.ts`, `src/canvas/runtimeOrganismWiring.test.ts`, `src/export/backgroundExportContracts.test.ts`.
- Public API impact: none. Persistence/schema impact: none. Expected production files: 0.
- Model: **Terra**; reasoning: medium; planned units: **2**; limit: 60 minutes; read limit: 12 files; write limit: 4 files.
- Validation: run the original focused suites before editing; preserve an assertion-to-behaviour map; run rewritten focused suites after editing; no broad suite required.
- Stop conditions: a proposed replacement proves less than the original, requires a production test-only export, or needs browser DOM/WebGL to be truthful.
- Rollback boundary: test files only.

### R0.3 — Split widget-owned CSS from the edge shell

- Current behaviour: `shell.css` supplies edge shell and the shared `org-*`, Arrangement and palette control language; `WidgetFrame` already imports `widgets.css`.
- Structural improvement: move only widget-owned Organism/Arrangement/palette blocks into `widgets.css`, preserving selector text, cascade order, variables and responsive/reduced-motion rules.
- Likely files: `src/ui/shell.css`, `src/ui/widgets/widgets.css`, and the focused source-contract tests that name their current file owner.
- Public API impact: none. Persistence/schema impact: none. Expected production files: 2.
- Model: **Luna**; reasoning: medium; planned units: **1**; limit: 45 minutes; read limit: 6 files; write limit: 4 files.
- Validation: selector/declaration inventory before/after, focused PF1B/PF1C/widget contracts, TypeScript, and Owner manual 1440/1280 Day/Night widget/shell comparison.
- Stop conditions: a moved selector serves non-widget shell/Organism Lab, cascade order cannot remain equivalent, or visual parity is unavailable.
- Rollback boundary: two stylesheet moves plus focused contract-path updates.

### R0.4 — Delete the proven local Sonner orphan

- Current behaviour: `App.tsx` imports `Toaster` directly from `sonner`; `src/components/ui/sonner.tsx` has no importer.
- Structural improvement: delete only the unused wrapper. Do not combine graph-contract, dependency or store-API decisions.
- Likely files: delete `src/components/ui/sonner.tsx`.
- Public API impact: none inside this repository. Persistence/schema impact: none. Expected production files: 1.
- Model: **Luna**; reasoning: low; planned units: **1**; limit: 20 minutes; read limit: 3 files; write limit: 1 file.
- Validation: zero-import `rg`, Knip/dependency check, TypeScript and startup shell focused check.
- Stop conditions: any dynamic/plugin import or package export exposes the wrapper.
- Rollback boundary: restore one file.

### R0.5 — Extract pure store transaction internals

- Current behaviour: one Zustand creator owns canonical state correctly but also embeds preview families, history application and saved-view normalization.
- Structural improvement: extract pure history and presentation-transaction helpers while retaining one `useLab`, identical action names and the same persisted shapes.
- Likely files: add `src/state/historyTransactions.ts` and `src/state/presentationTransactions.ts`; modify `src/state/store.ts`; add focused state tests.
- Public API impact: none permitted. Persistence/schema impact: none permitted. Expected production files: 3.
- Model: **Sol**; reasoning: high; planned units: **4**; limit: 90 minutes; read limit: 10 files; write limit: 5 files.
- Validation: snapshot equality plus focused presentation, group-drag, Arrangement, content-edit, resource-persistence, import and saved-view tests before/after; TypeScript.
- Stop conditions: second store/slice API, action rename, history-count change, saved-view/schema change, or more than five writes.
- Rollback boundary: helper files and one store adapter commit; no data migration.

Total proposed relative credit units: **10**. Immediate pre-PF1D recommendation R0.1–R0.3: **5 units**.

## Do not refactor

| System | Conclusion |
|---|---|
| Classic fallback | Retain. It remains a persisted renderer path and supplies Classic SVG plus detached Organism overlay output. Removal is not refactoring. |
| Master Graph adapters | Retain. They are a small explicit migration bridge and preserve the only planned graph boundary. |
| Widget lifecycle | Retain. The pure resolver/clamp helper and focused tests already isolate lifecycle rules. |
| Central store public API | Preserve exactly. Internal pure extraction may be useful later; do not introduce slices, a second store or renamed actions. |
| Export snapshot architecture | Retain. The explicit structured clone and provider bridge correctly detach authored truth from preview/live mutation. |
| Performance Governor | Retain. It is an isolated service with injected clock/runtime seams and focused behavioural coverage. |
| Registries | Retain. Immutable definitions, stable IDs and explicit `future` status prevent metadata from masquerading as live behaviour. |

## Separate migrations

Never mix these with R0 passes: framework or dependency upgrades; React/Vite/TypeScript migration; Zustand migration; renderer replacement; uniform-array to texture/data-buffer scaling; saved-project schema changes; full Master Graph migration; worker architecture; or removal of Classic.

## Decision gate

Owner decision requested: approve isolated execution of **R0.1 → R0.2 → R0.3**, each with its own parity gate and rollback boundary, then continue to PF1D. Do not authorize R0.4 or R0.5 yet; R0.4 is next-touch cleanup and R0.5 waits for a store-owning milestone.
