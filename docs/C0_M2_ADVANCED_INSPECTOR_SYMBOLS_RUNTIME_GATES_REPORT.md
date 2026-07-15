# C0 M2 — Advanced Inspector, Symbols and Runtime Gates Report

## Fixed-head identity

- Authorized branch: `feature/c0-m2-advanced-inspector-symbols-runtime-gates`
- Exact base: `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`
- Correction 1 exact base: `1cc8ec0c7ab756bc6b091b87014da2c3e27383d2`
- Merge authority: none
- Fixed feature SHA: recorded after the single final push in `status/codex` and the worker final report. The immutable branch ref is the fixed-head source of truth because a commit cannot contain its own SHA.

## Implemented scope

- Correction 1 preserves every Owner-accepted M2 surface while repairing the five bounded review groups: current-preset execution/scope/history; non-overlapping batch add; canonical Symbol-pane preview state; solid/shared-style Void Edge; and Auto Contrast plus Symbols on Void.
- Current presets arrange all renderer-visible entities when selection is empty and only selected entities otherwise. The arranged subset centroid and every non-position field remain stable; one action is one transform history entry.
- Add Cells uses deterministic Area-aware golden-angle candidate expansion with collision clearance around the current viewport centre. The complete new batch becomes one multi-selection and one batch-add Undo/Redo entry.
- Preserved exactly one Inspector and promoted the existing seam to live `Content | Appearance | Symbol` tabs. Global `I/i`, Dock/Rail launchers and WidgetHost ownership are unchanged.
- Preserved exactly three primary Appearance families over six internal targets: Cell → Surface/Boundary/Core, Membrane → Field/Edge, Void → Fill/Edge.
- Reused canonical `CellShadowSettings`; added Shadow Strength, Off/Soft/Defined, full advanced values, export inclusion, reset, ephemeral slider preview and one final history transaction. The hard Off path bypasses shadow normalization/colour/mask projection and repeated WebGL uniforms.
- Preserved all six Boundary styles and their width/alignment/offset/dash/bar/gap/rounded/double-spacing/paint/opacity behavior. Added bounded Core X/Y presentation offsets without changing Cell centres, Area, hit testing or field nuclei.
- Preserved Membrane `Cell Gradient` and `Solid` modes plus Morph/Fusion/Reach/opacity. Added Field Edge Softness and the supported field, distribution, radius, variation and presentation-offset instruments.
- Added canonical Motion `On/Off` and idle-motion gates over the existing supported speed, response, drift, breathing, wobble and phase controls. Motion Off skips advancement and releases continuous demand-frame ownership.
- Added independent Membrane Edge Softness, retained in presentation schema v5. It has separate state from field softness, a separate Organism uniform, an independent shader band effect, and a Canvas2D/PNG/PDF blur fallback shared by Classic live/export capture.
- Void Edge now defaults solid, owns its own style/dash/gap/double-spacing values, and reuses the same six-style UI/projection as Boundary. The removed unconditional inner echo remains absent and Void subtraction/Area/radius/hit/clearance are unchanged.

## Runtime power-gate evidence

- `src/canvas/runtimeGates.ts` is the pure canonical gate projection for Membrane, Edge, Shadow, Motion, Labels, Grid and future inactive Snapping.
- Classic enters the blob contour only while Membrane/Edge is visible and uses `resolveCellShadowGated` before any shadow-owned work.
- Organism skips `effectiveField` while Membrane/Edge is Off, skips `projectMembraneField` behind the Membrane gate, and only advances motion while the Motion master resolves active.
- Edge and Shadow upload their WebGL parameter families only while enabled; transition to Off writes the disabling uniform once, then stops repeated owned uniform work.
- Labels Off does not mount the label DOM and does not synchronize it. Grid Off does not mount or synchronize grid DOM.
- Snapping remains intentionally unimplemented. Its gate can become active only when both a future snapping owner is enabled and drag/creation interaction is active; M2 creates no candidates, menu or engine.
- Demand schedulers still wake for explicit edits, camera movement, resize and export, then return to idle. Membrane Off + Motion Off owns no continuous loop.

## Symbol registry and UX

- Audited input baseline: 77 active Lucide geometries.
- Rejected baseline removals: 3 (`icon:landscape:sunlight`, `icon:diagram:share`, `icon:annotation:section`). The other 2 rejected proposals were never active (`icon:circulation:step-forward`, `icon:circulation:step-back`). All 5 resolve unavailable.
- Verified M2 additions: exactly 59 unique installed Lucide geometries. The ordered AG2 ADD list was deduplicated against installed canonical geometry; the `Waves` and `HelpCircle` compatibility names duplicated baseline geometry, so the next accepted unique entries (`Airport / Heliport`, `Map Location`) complete the exact 59.
- Final active drawable geometries: **133** (`77 - 3 + 59`).
- Aliases: 14 added plus 6 baseline aliases = **20** deterministic searchable aliases. Final searchable known IDs: **153**.
- Deferred exactly as contracted: 8 approved-original custom briefs, 12 pending custom-gap candidates, all raw/downloaded/base64 assets, and every UI command icon.
- The live Symbol tab implements search, category/Recent/Favourites filtering, keyboard-focusable accessible cards, hover/focus preview and revert, apply/replace/remove, and one primary presentation symbol per Cell or Void.
- Canonical pane geometry never reads ephemeral preview resources; `resourcesPreview` is consumed only by Canvas/export-preview projection and commits through one store action on release.
- Persisted placement/backing owns preset, X/Y offset, scale, rotation, opacity, `Auto Contrast | Custom` tint mode, custom tint, backing type/size/offset/opacity/outline/width and advanced far-zoom hide threshold.
- Copy/Paste Style includes placement/backing only; it deliberately never copies symbol identity.

## History, persistence, migration and export

- Resource schema v3 migrates legacy placements to Custom tint so their authored visible colour does not change, canonicalizes aliases, deduplicates one placement per Cell/Void target, and persists recents/favourites as known canonical IDs only.
- Presentation schema v5 migrates earlier Void appearance to a truthful solid style and stores Void-owned values for the same six-style stroke projection used by Boundary.
- Symbol hover/focus previews and visual slider previews remain ephemeral. Apply/replace/remove, placement/backing release, favourites, advanced visual release and Copy/Paste each use bounded central-store history entries with Undo/Redo.
- Project files, import/recovery, saved views, project snapshots and manifests continue through the existing resource/settings owners; registry definitions and React/Lucide objects never serialize.
- Classic and Organism live Canvas plus PNG/PDF capture use the same Lucide node adapter. Classic SVG emits clean vector Lucide geometry and vector backing with no raster/base64 data.
- Clean export temporarily clears every appearance/runtime/visual/resource preview and restores it after capture.

## Verification evidence

- Correction contract: `src/canvas/m2Correction1Contracts.test.ts` passes all seven focused arrangement, batch-add, canonical-preview, migration, shared-stroke and Void-symbol assertions.
- Affected history/persistence/migration/renderer/import/export run: 24/24 passing across 18 focused files.
- TypeScript: `npx tsc -b --pretty false` passed.
- Exactly one correction production build passed (`npm run build`); Vite reported only the accepted existing chunk-size warning.
- Bounded correction browser smoke passed at 1280×800: one Inspector, 133 enabled symbols, canonical apply, pointer/keyboard preview stability, favourites and zero shell overflow. The verified production preview reports no console errors at `http://127.0.0.1:4173/`.
- Focused contracts: icon registry/source/provenance; resource schema/migration; M1 editing/product regressions; M2 schema/gates/history; M2 Inspector/runtime/export; Classic SVG; V8.2 demand scheduler and Motion behavior.
- Browser smoke: real rendered controls passed at 1280×800 and 1440×900. Each run proved one Inspector, 133 enabled symbol cards, apply, hover preview/revert, favourite persistence and no document overflow.
- One broader legacy M1 browser attempt was stopped after its existing controlled Area editing guard stalled; the dedicated bounded M2 smoke completed green and no product error was reproduced.
- The exact correction-base diff check is repeated against the committed fixed head at finalization.

## Known limitations / truthful deferrals

- Organism SVG remains truthfully unavailable because its implicit WebGL membrane has no reusable vector path. Organism symbols export through clean PNG/PDF; switch to Classic for true-vector SVG.
- Classic Membrane Edge softness uses a Canvas2D blur fallback around the existing contour; Organism owns the independent shader band.
- No Quick Bar, snapping UI/engine, Material Browser/Studio, custom architectural vector, selection orbit, Connections, Annotation/Markup or Table redesign was added.
- Browser QA is deliberately bounded by Fast Owner-QA; exhaustive CDP, performance and device matrices remain review work.

## Owner correction checklist

1. Do current presets move all renderer-visible entities with no selection and only selected entities when any are selected, leaving the rest fixed?
2. Does multi-add create visibly separated Cells, select the complete new batch and Undo/Redo it as one action?
3. Does pointer/keyboard Symbol preview remain ephemeral and revert without pane flicker, remount or scroll jump?
4. Does Void Edge default solid and offer the same six truthful style choices as Boundary while retaining Void-owned values?
5. Do Auto Contrast/Custom tint and one symbol on a Void work in live Classic/Organism plus PNG/PDF/Classic SVG without changing Void geometry?

## PONYTAIL

- Existing store, Inspector shell, presentation targets, demand scheduler, resource persistence and export owners were adapted before adding any new surface.
- New code is limited to the unique Symbol pane, the shared Lucide live/vector adapter, pure runtime gates and focused contracts. No package, backend, parallel state store or duplicate Inspector was added.
