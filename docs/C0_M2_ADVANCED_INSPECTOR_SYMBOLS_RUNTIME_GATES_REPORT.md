# C0 M2 — Advanced Inspector, Symbols and Runtime Gates Report

## Fixed-head identity

- Authorized branch: `feature/c0-m2-advanced-inspector-symbols-runtime-gates`
- Exact base: `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`
- Merge authority: none
- Fixed feature SHA: recorded after the single final push in `status/codex` and the worker final report. The immutable branch ref is the fixed-head source of truth because a commit cannot contain its own SHA.

## Implemented scope

- Preserved exactly one Inspector and promoted the existing seam to live `Content | Appearance | Symbol` tabs. Global `I/i`, Dock/Rail launchers and WidgetHost ownership are unchanged.
- Preserved exactly three primary Appearance families over six internal targets: Cell → Surface/Boundary/Core, Membrane → Field/Edge, Void → Fill/Edge.
- Reused canonical `CellShadowSettings`; added Shadow Strength, Off/Soft/Defined, full advanced values, export inclusion, reset, ephemeral slider preview and one final history transaction. The hard Off path bypasses shadow normalization/colour/mask projection and repeated WebGL uniforms.
- Preserved all six Boundary styles and their width/alignment/offset/dash/bar/gap/rounded/double-spacing/paint/opacity behavior. Added bounded Core X/Y presentation offsets without changing Cell centres, Area, hit testing or field nuclei.
- Preserved Membrane `Cell Gradient` and `Solid` modes plus Morph/Fusion/Reach/opacity. Added Field Edge Softness and the supported field, distribution, radius, variation and presentation-offset instruments.
- Added canonical Motion `On/Off` and idle-motion gates over the existing supported speed, response, drift, breathing, wobble and phase controls. Motion Off skips advancement and releases continuous demand-frame ownership.
- Added independent Membrane Edge Softness in presentation schema v4. It has separate state from field softness, a separate Organism uniform, an independent shader band effect, and a Canvas2D/PNG/PDF blur fallback shared by Classic live/export capture.
- Preserved Void fill/edge controls and the subtractive geometry path. The removed unconditional inner echo remains absent.

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
- The live Symbol tab implements search, category/Recent/Favourites filtering, keyboard-focusable accessible cards, hover/focus preview and revert, apply/replace/remove, and one primary symbol per Cell.
- Persisted placement/backing owns preset, X/Y offset, scale, rotation, opacity/tint, backing type/size/offset/opacity/outline/width and advanced far-zoom hide threshold.
- Copy/Paste Style includes placement/backing only; it deliberately never copies symbol identity.

## History, persistence, migration and export

- Resource schema v2 migrates old placements to complete defaults, canonicalizes aliases, deduplicates one placement per Cell, and persists recents/favourites as known canonical IDs only.
- Symbol hover/focus previews and visual slider previews remain ephemeral. Apply/replace/remove, placement/backing release, favourites, advanced visual release and Copy/Paste each use bounded central-store history entries with Undo/Redo.
- Project files, import/recovery, saved views, project snapshots and manifests continue through the existing resource/settings owners; registry definitions and React/Lucide objects never serialize.
- Classic and Organism live Canvas plus PNG/PDF capture use the same Lucide node adapter. Classic SVG emits clean vector Lucide geometry and vector backing with no raster/base64 data.
- Clean export temporarily clears every appearance/runtime/visual/resource preview and restores it after capture.

## Verification evidence

- Focused contracts: icon registry/source/provenance; resource schema/migration; M1 editing/product regressions; M2 schema/gates/history; M2 Inspector/runtime/export; Classic SVG; V8.2 demand scheduler and Motion behavior.
- TypeScript: `npx tsc --noEmit` passed.
- Browser smoke: real rendered controls passed at 1280×800 and 1440×900. Each run proved one Inspector, 133 enabled symbol cards, apply, hover preview/revert, favourite persistence and no document overflow.
- One broader legacy M1 browser attempt was stopped after its existing controlled Area editing guard stalled; the dedicated bounded M2 smoke completed green and no product error was reproduced.
- Exact diff check and the one final production build are recorded at fixed-head finalization.

## Known limitations / truthful deferrals

- Organism SVG remains truthfully unavailable because its implicit WebGL membrane has no reusable vector path. Organism symbols export through clean PNG/PDF; switch to Classic for true-vector SVG.
- Classic Membrane Edge softness uses a Canvas2D blur fallback around the existing contour; Organism owns the independent shader band.
- No Quick Bar, snapping UI/engine, Material Browser/Studio, custom architectural vector, selection orbit, Connections, Annotation/Markup or Table redesign was added.
- Browser QA is deliberately bounded by Fast Owner-QA; exhaustive CDP, performance and device matrices remain review work.

## Owner yes/no checklist

1. Does `I` open the same single Inspector with `Content | Appearance | Symbol`, and do Canvas/Table keep the existing Inspector lifecycle?
2. Do Shadow Off, Membrane/Edge Off and Motion Off visibly stop their effect while preserving authored values, with Labels/Grid Off leaving no hidden DOM work?
3. Does Symbol search/category/Recent/Favourites work, and does pointer/keyboard preview revert until Apply is chosen?
4. Do apply/replace/remove plus placement/backing create correct Undo/Redo, persist after save/import, and leave Cell geometry/Area unchanged?
5. Do PNG/PDF and Classic SVG show the same symbol placement, tint and backing, with Organism SVG still truthfully unavailable?

## PONYTAIL

- Existing store, Inspector shell, presentation targets, demand scheduler, resource persistence and export owners were adapted before adding any new surface.
- New code is limited to the unique Symbol pane, the shared Lucide live/vector adapter, pure runtime gates and focused contracts. No package, backend, parallel state store or duplicate Inspector was added.
