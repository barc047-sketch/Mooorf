# Project Ledger

Only durable current truth belongs here. Closed history stays in linked legacy reports unless it explains a present constraint.

## Owner decisions

- **DEC-001 — Organism is the primary visible renderer.** Classic is retained internally for compatibility and failure recovery, not exposed as the normal product choice.
- **DEC-002 — Master Graph owns project meaning.** Canvas, Table, Dashboard, analysis, and export are projections; UI tools and registries never become parallel product stores.
- **DEC-003 — Automatic performance is runtime-only.** It may reduce only the live Membrane target, motion cost, and Cell Shadow cost. Text, overlays, interaction geometry, and authored settings remain unchanged.
- **DEC-004 — Authored exports use full quality.** Export reads a stable authored snapshot and does not wait on or mutate live preview state.
- **DEC-005 — Owner performs visual QA.** Codex supplies focused contracts, typecheck, diff/console sanity, preview, and limitations; only Owner PASS opens finalization.
- **DEC-006 — Magnet remains disabled until M3C.** Metadata and disabled ToolIds do not constitute a snapping feature.
- **DEC-007 — Master Graph owns future relationships.** Semantic Relationship, Visual Connection, and Membrane Bridge remain separate concepts and owners.
- **DEC-008 — No automatic main merges.** Commit/push and merge are distinct gates; merge requires an explicit Owner command.
- **DEC-009 — One owner per surface.** Reuse the existing Inspector, Runtime Status, Quick Controls, WidgetHost/Frame, file-intake provider, export service, and history path.
- **DEC-010 — Preview is not product data.** Appearance, Arrangement, resource, Membrane, and performance previews remain ephemeral and absent from persistence/history until an explicit apply action.

## Recently resolved

- **PF1D.1E — Lazy floating Table workspace overlay.** On source SHA `019ca3de55c93bf5f8de7f57e666eeaeddaab7ed` and branch `feature/pf1d-lazy-workspaces`, `src/App.tsx`, `src/App.css`, and `src/runtime/pf1dContracts.test.ts` establish one persistent Canvas and one lazy conditional Motion Table under a direct-child isolated `.app-shell` stack: Canvas 0, widgets 40, Rail/Dock/auxiliary 60, Table 90, ViewToggle 100. The static theme-aware scrim contains no live blur. Browser samples proved panel opacity/transform changed from mount through 60ms to 200ms; Rail/Dock were intermediate at 80ms and settled at 320ms; `elementFromPoint` over a moved widget resolved inside `.table-workspace-panel`; the return scrim protected restoring chrome; moved and minimized widget geometry remained exact. Canvas start requested 0 Table modules, first Table open 1, and repeat switches 0 additional. Focused suites passed 78/78 and TypeScript passed. The single production build exited 0, transformed 2,898 modules, and emitted lazy `TableView-Bet7Cgpb.js` at 45.46 kB / 15.63 kB gzip with the non-blocking Vite warning for chunks above 500 kB. Owner verdict: PASS. Product commit `32e3a798fe0a78386bc573b0e11497cc65ea025c`; Project Engine closeout: this documentation commit; both pushed to `origin/feature/pf1d-lazy-workspaces`; no merge.

- **E1 — Organism Detached Export Overlay Alignment.** Pre-existing P1 export blocker discovered during R0.3 Owner QA. Diagnostic evidence retained: neutral settings resolve at `dx=0`, `dy=0`, `dr=0`; X/Y offsets reached `dx=43.52px`, `dy=27.20px`; global/radial/angular displacement reached about `54.92px` X and `85.92px` Y; size variation diverged; 1×/2× changes density, not logical placement. Root cause: detached Membrane used resolved `ProductionNucleus` geometry while the overlay used raw `SpaceCell` geometry. Correction: `organismExport.ts` passes resolved `sx`, `sy`, `screenR` only to the detached overlay in `svgExport.ts`; the neutral/raw Classic fallback remains intact. Cell, Boundary, Core, Void, labels, and symbols now share the resolved geometry. Non-neutral transform, size-variation, 1×/2× logical-placement, and Owner visual QA passed; no durable `SpaceCell` mutation. Product commit `beb5476164d171d25e4d61efef3e370b9bb1574b`; Owner PASS; Classic behaviour preserved.

- **BUG-001 — Day/Night background always black.** Resolved by PF1C: the Organism host owns the canonical background beneath the transparent surface.
- **BUG-002 — Membrane invisible.** Resolved by PF1C: transparent target presentation and invalidation retain a visible Membrane.
- **BUG-003 — Quick Controls shift with Inspector changes.** Resolved by PF1C: the shared fixed top-right anchor has no Inspector coupling.
- **R0.1 — Shared Canvas Gesture Transaction Core.** Renderer-neutral transaction ownership now lives in `src/interaction/canvasGestureController.ts`; Classic and Organism retain local hit testing, coordinates, invalidation, and render-loop ownership. A pre-finalization pan regression from a mutable camera anchor was corrected with immutable pan anchors and one zoom conversion. No schema, public store API, or persistence contract changed.
- **R0.2 — Behaviour-first parity and contract split.** Behavioural, wiring, and style contracts are explicitly separated. One redundant source-string download-delay assertion was replaced with executable proof; stale mounted-capture wiring now correctly names detached-export ownership; authored live/export characterization protects presentation, Membrane, Cell Shadow, nuclei projection, and runtime-state exclusion. No production API or behaviour changed.
- **R0.3 — Split Widget-owned CSS from Edge Shell.** Eleven semantic blocks and 95 selector clauses moved from `shell.css` to `widgets.css` with declaration/value/specificity/cascade parity exact. Shared Dock/widget range ownership remains in `shell.css`; Owner visual QA passed. No production TypeScript or React changed.

## Known limits

- **LIM-001 — Organism visible-nucleus cap is 96.** Larger-scale rendering needs a future texture/data-buffer architecture; current performance work does not claim 200+ Cells.
- **LIM-002 — Saved views are localStorage-only and capped at 20.** No cloud/account ownership exists.
- **LIM-003 — Organism SVG is unavailable.** The implicit Membrane has no reusable truthful vector path; PNG/PDF are the current Organism visual exports.
- **LIM-004 — Grid presets are mostly metadata.** Dotted/None are the only live paths; snapping/export behavior for other presets is not implemented.
- **LIM-005 — Relationships/connections are not a production editing feature.** Graph types and disabled tool placeholders exist, but G1 has no production engine/UI yet.
- **LIM-006 — Reference images, calibration, and rulers are unimplemented.** No canonical state, renderer layer, or preprocessing pipeline exists.
- **LIM-007 — Animation export is unimplemented.** Current export is static/presentation-pack only; GIF/WebM/MP4 require future queue/worker ownership.
- **LIM-008 — Dense labels remain crowded around 60+ spaces.** This is not resolved by PF1C preview scaling.
- **LIM-009 — The known Vite main-chunk warning is accepted evidence, not a completed lazy-loading solution.** PF1D owns lazy workspace work.

## Superseded decisions

- **DEC-011 — Visible ORG/CLS switching is superseded.** One visible Organism strategy is normal; Classic remains internal fallback.
- **DEC-012 — Partial selection orbit/halo feedback is superseded.** Selection is now renderer-neutral external keyline feedback and never Organism geometry or export content.
- **DEC-013 — Full-resolution live Membrane at all times is superseded.** Runtime preview may downscale only the Membrane target while presentation overlays and exports remain full resolution.
- **DEC-014 — Starting every task from the full historical documentation stack is superseded.** The Project Engine read order is mandatory; legacy evidence is subject-routed only.
