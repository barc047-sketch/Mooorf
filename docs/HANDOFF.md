# Handoff

Claude must update after each phase.

## Report format (use for every phase from now on)
```
ZONUERT REVIEW PACK

MODEL:
EFFORT:
ULTRACODE USED: yes/no
PHASE:
BUILD STATUS:
FILES CHANGED:
LIBRARIES USED:
CUSTOM CODE WRITTEN:
COMPONENTS REUSED:
PONYTAIL CHECK:
- reused:
- adapted:
- installed package/library used:
- new files justified:
- duplication avoided:

VISUAL STATUS:
- Palmer style:
- glass dock:
- left rail:
- loader:
- day/night:

SYNC STATUS:
- canvas/table:
- store:
- reset issue:

PERFORMANCE:
- cell count tested:
- lag:
- DPR/rAF:

BUGS:
NEXT:
```

## Current state
Prompt 03 execution: **Phases 1-4 COMPLETE**. **V4.5A COMPLETE** (docs, incl. reference patch). **V4.5B COMPLETE** (master graph domain layer). **V5 Readiness Audit COMPLETE**. **Phase 5 Table Sync COMPLETE**. **Phase 5.1 Table/Shell Polish COMPLETE**. **Phase 6A Organism Blob Foundation COMPLETE**. **Codex Workspace Setup COMPLETE**. **Phase 6B Visual Polish COMPLETE**. **Phase 6B.1 Blob Geometry Correction COMPLETE** (verified live). **Phase 6B.2 Morph Modes + Attachment Control COMPLETE**. **Phase 6C QA / Bugfix COMPLETE**. **Phase 6D Organism System Redesign + Morph Style Panel COMPLETE** (implementation only). **Phase 6E Organism Lab Shader Prototype COMPLETE** (implementation only). **V6F.0 Organism Production Integration Audit COMPLETE** (docs only). **V6F.0B Production Canvas UI / Control Architecture COMPLETE** (docs only). **V6F.0C Reference Folder Patch COMPLETE** (docs only). **V6F.0D GitHub-only Coding Workflow Setup COMPLETE**. **V6F.0F.3 GitHub Push / Doc Sync COMPLETE**. **V6F.1 Production Organism Canvas Integration COMPLETE**. **V6G QA / Stabilization COMPLETE**. **V6H Production Dock UI COMPLETE**. **V6H.1 Full Organism Control Surface COMPLETE**. **V6H.2 UI Command Architecture Cleanup + Resource Prep COMPLETE**. **V6H.3 Claude Premium UI Implementation COMPLETE**. **V6H.3Q Codex QA COMPLETE**. **V6H.4 Layout Presets / Colony Arrangement COMPLETE**. **V6H.4B Quick Add Cluster + Random Arrangement COMPLETE**. **V6I Palette + Category / Privacy Mapping COMPLETE**. **V6J Saved Views / Design Iterations COMPLETE**. **V6K Premium Visual System + Full Control Migration COMPLETE** (preview-verified). **V6L Multi-Color Organism Shader + Negative Nuclei COMPLETE**. **V6LQ Shader / Void QA COMPLETE** (no fixes needed). **V6M Codex Workflow OS COMPLETE**. **V6.5 Selection Arc + Canvas Rename COMPLETE**. **V6N Interface Density / Editorial Glass Refinement COMPLETE**. **V6N.1 Reference-Locked Premium Design System COMPLETE**. **V6N.2 Reference-Applied UI Polish COMPLETE**. **V6N.3 Premium Primitives + Moving Cell Border COMPLETE**. **V7.0 Spatial Intelligence System + Project Pulse Flagship COMPLETE** (preview-verified). Next: **Sol implements the remaining V7 widget family from docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md, or another explicit phase**. Old canvas remains fallback.

## V7.0 — Spatial Intelligence System + Project Pulse Flagship
- **What changed:** defined the complete V7 stats-widget system (`docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md`) and implemented ONE flagship production widget — Project Pulse — as the visual/architectural reference for Sol. No other family widgets, no dashboard page.
- **Selectors:** new `src/domain/stats/selectors.ts` — pure functions over store-owned `SpaceCell[]` (the runtime master graph): `computeSpatialPulse`, `getCategoryShares`, `getPrivacyBalance`, `getAreaLeaders`, `getLargestSpace`, counts/area. Voids never inflate programmed area; bad areas read 0 m² and surface via `missingAreaCount`; unknown categories fall back through `getCategoryToken`. Naming mirrors `src/domain/graph/selectors.ts` so the V9 graph migration is a data-source swap.
- **Widget:** `src/ui/widgets/stats/ProjectPulseWidget.tsx` + shared family primitives (`primitives.tsx`: MetricReadout, MicroDistribution, InsightRow, format helpers) + `stats.css`. Instrument hierarchy: asymmetric hero (total program m² + stacked space/void vitals), hairline program-mix band with top-3+Other legend, neutral openness band, Largest/Dominant insight rows. Zero metric state — the widget derives via `useMemo` from `s.spaces`. Elegant dormant empty state.
- **Wiring:** `WidgetId` gained `"stats"`; registered in `WIDGET_DEFS` (eyebrow INTELLIGENCE, 300 px); new rail `stats` section with an Activity launcher; `widgetRegistry.ts` stats entry → live. Drag/minimize/close/z-order/Escape/mobile sheet inherited from `WidgetFrame`.
- **Ponytail:** reused WidgetFrame/WidgetHost/rail/store/category tokens/glass tokens; no chart lib, no second widget framework, no duplicated metric state. New files justified: selector ownership + family-shared primitives.
- **Build/QA:** build green (known chunk warning, main ~691.83 kB). Preview-verified: rail launcher open/close, add 1/add 5 update metrics, void adds count but not area, area/category/privacy edits update, Random/layout metric-neutral, saved-view load restores metrics, table edit reflects after view switch, ORG/CLS with widget open, minimize/restore, close-after-exit, day+night premium, 390 px sheet no overflow, lab route, zero console warnings, no red chrome.
- **Next:** Sol implements Category Mix, Privacy Balance, Area Leaders, Data Health from the system doc. Relationship Health / Floor Summary stay future (need graph/floor runtime data).

## V6N.3 — Premium Primitives + Moving Cell Border
- **What changed:** upgraded shared visual primitives without adding product features, packages, state systems, shader rewrites, or table changes.
- **MovingBorder primitive:** added `src/ui/primitives/MovingBorder.tsx` + CSS as a small local reusable primitive because no existing `moving-border` component existed. It supports radius, border width, gradient width, duration, custom colors, circle mode, children, className, and reduced-motion safety.
- **Cell selection:** selected/edit-active organism nuclei now get a subtle moving border ring through the existing label overlay only. It is pointer-transparent, sized by the existing render-loop label sync, and uses hollow/subtractive styling for voids. It is not rendered for every cell.
- **Selection arc:** tightened the normal arc into a thinner scientific marker with smaller endpoint dots, a calmer leader, compact metadata chip, and less bulky default ring. Halo/influence remain intentional variants.
- **Glass + controls:** shared glass tokens and `.glass`, widget, dock, rail, popover, saved/palette card, slider, switch, chip, and layout-card styling now carry stronger frosted material, edge light, subtle grain, and neutral instrument controls.
- **Ponytail:** reused `WidgetFrame`, shared widget controls, dock/rail ownership, tokens, and the existing canvas overlay; no duplicate UI/control surface.
- **Build/QA:** `npm run build` passed with the known chunk warning. Preview verified app render, selected normal/void overlay path, edit popover, widgets, ORG/CLS fallback, table/canvas switch, lab route, no console warnings, and 390 px no-overflow.
- **Next:** V7 stats/widgets or another explicit phase.

## V6N.2 — Reference-Applied UI Polish
- **What changed:** applied the V6N.1 reference grammar directly to the live UI. Visual/CSS work only; no new features, state, or packages.
- **Selection system:** thinner arc (1.05 primary, quieter ghost), hairline leader line + micro anchor dot toward the metadata chip, softer drop shadows, subtle arc/chip entrance animations, dashed void arc tightened (`3 5`). Metadata chip is a deeper frosted card with muted eyebrow, tabular numerals, and calmer nucleus-ring tinting.
- **Selection command menu:** the V6.5-WIP radial command menu (`src/canvas/SelectedCellCommandMenu.tsx`) is now integrated and polished — frosted ring with backdrop blur, staggered bloom-in buttons, quieter chrome, dashed subtractive delete. Commands: rename, area, duplicate, convert space/void, focus, delete — all through existing store actions.
- **Edit popover:** glass instrument styling — translucent inset inputs, neutral focus halo, ghost cancel, ink-gradient save pill.
- **Canvas:** technical grid is now a camera-synced dot matrix (scan feel) in both themes; labels got lighter borders, more blur, tighter editorial text halos, tabular meta.
- **Dock/rail:** lighter dock group chrome, orbs with top highlight + bottom falloff, hollow subtractive void button, slimmer rail with faded section dividers and softer shadow.
- **Controls:** 1.5px hairline slider tracks with 9px thumbs, inset switch tracks with shadowed thumbs, gradient hairline popover dividers.
- **Cards:** saved-view items are bento glass tiles with inner highlight, hover lift, status dot, and tabular meta chips; widget head strips gained a soft highlight gradient and finer grips.
- **Tokens:** glass blur 22px / saturate 150%; dot-grid tokens retuned for the dot matrix.
- **QA:** build green (known chunk warning). Preview-verified: canvas, dock, rail, widgets, selection arc/menu/edit, rename→table sync, text shadow toggle, camera-aware morph toggle, saved views save/load, ORG/CLS round-trip, lab route, night + day, mobile 390 px no overflow, no red UI chrome.
- **Next:** V7 stats/widgets or another explicit phase.

## V6N.1 — Reference-Locked Premium Design System
- **What changed:** locked the premium visual reference grammar into docs and shared primitives without adding product features.
- **Reference system:** added `docs/V6N_REFERENCE_STYLE_LOCK.md` covering dark scientific HUD, light frosted dashboard, spatial glass, editorial cinematic overlay, architecture translation, selection arcs, typography, density, color/chrome, data cards, and future widgets.
- **Rules:** references are mood/structure/style grammar only. Do not copy exact layouts, branding, medical content, or proprietary assets. External reference images were not moved or duplicated.
- **Tokens:** `src/styles/tokens.css` now exposes shared glass dark/light, border, inner highlight, shadow, card/pill radius, HUD/muted text, dot-grid, selection-arc neutral, and warning-data tokens.
- **Primitives:** shared widget, dock, rail, popover, saved-view, palette, micro-card, grid, and selection/edit overlay CSS now reuse more of the shared token language.
- **Docs:** design memory, component inventory, V6K/V6N docs, decisions, handoff, and task queue were updated. Future UI must reuse premium primitives and avoid uncontrolled card styles.
- **Runtime/product data:** no state, renderer, shader, table, saved-view, package, or feature changes.
- **Build status:** `npm run build` passed with the known chunk warning.
- **Next:** V6N.2 can apply the style more aggressively, or V7 stats/widgets can start by explicit request.

## V6N — Interface Density / Editorial Glass Refinement
- **What changed:** refined the existing V6K widget/dock/rail/canvas overlay system into a slimmer neutral glass UI without adding a second design system or duplicate control surface.
- **UI chrome:** rail, dock, widgets, popovers, sliders, chips, loader action text, classic selection tick, and organism selection arc now use neutral ink/stone chrome instead of red. `--zonuert-red` remains available for product palette material only.
- **Glass system:** added shared glass/chrome tokens (`--chrome-accent`, `--glass-panel`, `--glass-panel-strong`, `--glass-highlight`, blur/saturate tokens) and applied them across dock, rail, widgets, popovers, saved views, palette rows, and canvas edit overlays.
- **Density:** dock groups, rail, widget headers, range thumbs, and selection metadata were tightened for a more editorial/scientific control feel.
- **Selection arc:** default arc is smaller and calmer, with partial paths, subtle endpoint dots, neutral metadata glass, and void styling in the same family.
- **New controls:** `annotationDetail.textShadow` toggles label text shadow from the Annotation widget; `organism.cameraAwareMorph` toggles zoom-responsive radius behavior from the Organism widget.
- **Persistence:** both settings are stored in existing Zustand settings and saved views through existing snapshot paths.
- **Docs:** `docs/V6N_GLASS_EDITORIAL_DIRECTION.md` captures the neutral chrome/glass/density/selection rules.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~680.32 kB.
- **Next:** V7 stats/widgets or another explicit phase. Do not start export, floors, backend, or engine scaling without instruction.

## V6.5 — Selection Arc + Canvas Rename
- **What changed:** selected nuclei now get a premium editorial selection layer in the existing organism label overlay: tight ring, partial SVG arc, handle dots, and compact metadata for name, area, and category/type.
- **Canvas editing:** selected arc metadata includes an Edit chip that opens a compact inline popover for direct rename and numeric area edit. Enter/save and blur commit through existing `updateSpace`; Escape cancels. Empty names fall back to `Untitled Space`; area clamps to at least 1 m².
- **Void support:** void nuclei use dashed/subtractive arc styling and show `Void` / `subtractive` metadata. Rename and area edit use the same store path as normal spaces.
- **Data safety:** no schema changes and no parallel state system. Table sync and saved views work because edits mutate store-owned `SpaceCell` records through `updateSpace`.
- **Annotation behavior:** hidden mode suppresses ordinary labels but keeps the selected arc/edit affordance reachable; editorial/pill/technical labels remain intact.
- **Fallback:** classic canvas still round-trips through `ORG`/`CLS`; no fallback renderer rewrite was needed.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~679.91 kB.
- **Preview QA:** Chrome verified add/select arc, canvas rename, area edit, table reflection, save/load after edit, void select/edit, tight/halo/influence modes, hidden annotation mode, ORG/CLS fallback, 390 px no-overflow arc/dock fit, and `/experiments/organism-lab`.
- **Next:** V7 stats/widgets or another explicit phase.

## V6LQ — Shader / Void QA
- **Result:** QA pass completed with no code fixes needed.
- **Verified:** V6L void data model, signed shader contribution, palette uniforms, table type chip path, saved-view kind preservation, layout/random kind preservation, classic hollow/dashed void fallback, 96-nucleus cap docs, mobile fit, and lab route.
- **Build status:** `npm run build` passed with the known chunk warning.

## V6M — Codex Workflow OS
- **What changed:** added a Codex-only workflow memory layer so future phase prompts can be shorter and still precise.
- **Protocol:** `docs/CODEX_PHASE_PROTOCOL.md` defines the standard phase loop: sync GitHub first, inspect dirty files, avoid `.claude/launch.json`, read targeted files, implement modularly, update docs, build, focused smoke test, commit/push, short final report.
- **Memory:** `docs/PROJECT_MEMORY_INDEX.md` summarizes where project truth lives; `docs/FEATURE_MAP.md` maps features to files/docs/risks.
- **Prompt system:** `docs/PROMPT_RULES.md` defines concise phase prompt structure and commit-message conventions. Future prompts should reference `PROJECT_MEMORY_INDEX` and `FEATURE_MAP` instead of repeating full history.
- **Roadmap/design/components:** `docs/NEXT_PHASES.md`, `docs/COMPONENT_INVENTORY.md`, and `docs/DESIGN_SYSTEM_MEMORY.md` capture roadmap order, reusable component ownership, and aesthetic constraints.
- **Automation:** `scripts/repo-health.mjs` plus `npm run repo:health` prints branch, latest commit, dirty files, package scripts, and known warning notes.
- **Runtime code:** not changed.
- **Build status:** `npm run build` passed. Known chunk warning remains.
- **Next:** V6LQ shader/void QA or V6.5 selection arc by explicit choice.

## V6M.1 — Ponytail Enforcement Patch
- **What changed:** Ponytail is now a hard workflow rule: reuse existing components/utilities/packages first, add adapters before rewrites, avoid duplicate controls/state systems, and justify new files.
- **Prompt rule:** every phase prompt must include a Ponytail checklist.
- **Report rule:** handoff/final reports include reused, adapted, new files justified, and duplication avoided.
- **Runtime code:** untouched.
- **Build status:** not run; docs-only patch.

## V6L — Multi-Color Organism Shader + Negative Nuclei
- **What changed:** added production void nuclei and a restrained multi-color organism shader path without changing the canvas architecture, table ownership, saved views, classic fallback, or lab route.
- **Void nuclei:** `SpaceCell.kind?: "space" | "void"` is backward-compatible; old spaces/snapshots default to `space`. The dock void button now creates a store-owned subtractive nucleus. Voids can be dragged, selected, renamed, area-edited, categorized, saved/loaded, and preserved through layout/random presets.
- **Shader:** production now sends negative signed strength for voids. The WebGL field clamps signed contributions to avoid visual blow-ups, and receives body A, body B, accent, ground, and blend uniforms for controlled color mixing.
- **Multi-color:** category/privacy/area-informed CPU color mixing now influences the organism membrane through a second body color and accent. Solid organism palettes still work; Atmospheric Blend, Category Blend, and Dual Layer now render as staged two-color blends rather than disabled UI.
- **Capacity:** `MAX_NUCLEI` raised from 48 to 96. Store/canvas data remains unlimited; 96 is the current uniform-array render/label cap. Details: `docs/ORGANISM_ENGINE_LIMITS.md`.
- **Fallback/table:** classic canvas excludes voids from the additive blob and draws them as hollow dashed circles; table adds a compact type chip and dashed void swatch.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~677.09 kB.
- **Deferred:** true per-nucleus color textures/data buffers, dedicated void layout preset, dual-layer editing controls, and high-density label strategy.
- **Next:** V6.5 selection arc or another explicit post-shader phase.

## V6K — Premium Visual System + Full Control Migration
- **What changed:** production UI upgraded from prototype panels to a premium floating-widget system; all detailed controls migrated out of the single control surface. Full spec: `docs/DESIGN_UI_UPGRADE_V6K.md`.
- **Widget system:** `openWidgets: WidgetId[]` in the store (order = z-order) + `WidgetHost`/`WidgetFrame` (`src/ui/widgets/`). Seven widgets: Annotation, Organism, Layout, Palette, Saved Views, Display, Advanced. Frames are draggable (title strip), minimizable, closable, internally scrolling, magnetically snapping, near-opaque glass, Escape-closes-front, mobile sheet fallback. `OrganismControlPanel.tsx` deleted; shared metadata moved to `src/ui/controlMeta.ts`.
- **Rail:** launchers only — view/build/note/organism/color/layout/saved/display/system, 26 px buttons.
- **Dock:** tighter (30 px buttons, 47 px orb), saved-views popover replaced by a widget launcher, Random arrangement button added, palette popover gained "All palettes →" hand-off; V6L later enabled the void action.
- **Palette:** 12 curated 10-step nucleus families (functional — ramp tints the category mapping via `getNucleusColor(..., nucleusPaletteId)`) + 12 organism palettes. V6K shipped 9 solid shader palettes and staged 3 blends; V6L later enabled the blend rows through two-color shader uniforms. New settings `nucleusPaletteId`/`organismPaletteId`, snapshot-persisted as optional fields so old snapshots keep loading.
- **Annotation:** new `annotationDetail` (text scale, show name/area/category, position auto/center/above/below, bounding box) consumed by the label layer; selection ring default tightened (1.05×, 14 px floor, 1.25 px stroke); influence mode behind an advanced disclosure in the Organism widget.
- **Display:** new `settings.showGrid` camera-synced technical grid (CSS background, render-loop offsets).
- **Tokens/controls:** `--ease-out`, `--shadow-soft/float/deep`; V6N later moved custom range inputs to neutral ink/stone chrome.
- **Files changed:** `src/types.ts`, `src/state/store.ts`, `src/design/palettes.ts`, `src/design/colorMapping.ts`, `src/ui/{Rail,Dock,SavedViewsPanel}.tsx`, `src/ui/controlMeta.ts` (new), `src/ui/widgets/*` (new: host, frame, controls, 7 widgets, widgets.css), `src/ui/panels/widgetRegistry.ts`, `src/ui/shell.css`, `src/styles/tokens.css`, `src/canvas/{OrganismCanvasView.tsx,organismAdapter.ts,organismCanvas.css}`, `src/views/TableView.tsx`, `src/App.tsx`; deleted `src/ui/OrganismControlPanel.tsx`.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~673.75 kB.
- **Preview QA:** zero console warnings/errors; verified widget drag/snap/minimize/z-order/Escape, wine organism palette live on the shader, warm nucleus family on labels + program mapping, grid, text scale + placement modes, saved view save/delete, layout presets + Random, night mode, ORG/CLS round-trip, table edit → canvas label, `/experiments/organism-lab` route.
- **Deferred after V6K:** custom palette slot, interface density, canvas label rename flow. V6L later handled gradient/category organism blends and negative nuclei.
- **Next:** multi-color organism shader phase or V6.5 selection arc by explicit choice.

## V6J — Saved Views / Design Iterations
- **What changed:** added architecture-style saved canvas iterations from the dock Saved Views utility, using the existing store as the source of truth.
- **Files changed:** `src/types.ts`, `src/state/store.ts`, `src/ui/Dock.tsx`, `src/ui/SavedViewsPanel.tsx`, `src/ui/shell.css`, docs.
- **Saved data:** each snapshot stores `id`, `name`, `createdAt`, deep-copied `spaces`, `camera`, `theme`, `rendererMode`, `paletteMode`, `layoutPreset`, `annotationMode`, `organism` settings, morph/attachment/reach/blob/selection display state.
- **Store actions:** `saveCurrentView`, `loadSavedView`, `renameSavedView`, `deleteSavedView`, and `duplicateSavedView`. Loading replaces spaces/camera/settings safely, clears selection, and restamps `born` values for a smooth nucleus pop-in.
- **Persistence:** saved views are stored in guarded localStorage under `mooorf.savedViews.v1`, capped at 20 snapshots. If localStorage parsing or writing fails, the app continues with in-memory state.
- **UI:** compact premium Saved Views panel with Save Current, timestamp, metadata chips, Load, Rename, Duplicate, and Delete. It stays dock-scoped and does not create a large modal or dashboard surface.
- **Data safety:** snapshots preserve names, areas, categories, privacy, colors, positions, palettes, annotation mode, renderer mode, and organism settings. No table data is deleted or randomly replaced.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~663.07 kB.
- **Preview QA:** Chrome against `http://127.0.0.1:5174/` verified two saved iterations, palette/layout/annotation/renderer restoration, rename, duplicate, delete, localStorage persistence, table edit after load, Add 5, Random, annotation modes, ORG/CLS fallback, 390 px fit, and `/experiments/organism-lab`. Only the known non-breaking favicon 404 appeared.
- **Next:** V6K multi-layer nucleus / void shader or V6.5 selection arc by explicit choice. Do not start export, floors, backend, or V7 widgets unless requested.

## V6I — Palette + Category / Privacy Mapping
- **What changed:** added semantic color mapping for program categories, privacy tone, area depth, selected accents, and global organism palette mode without rewriting the shader or starting saved views.
- **Files changed:** `src/design/colorMapping.ts`, `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismAdapter.ts`, `src/canvas/renderer.ts`, `src/canvas/organismCanvas.css`, `src/ui/OrganismControlPanel.tsx`, `src/ui/shell.css`, `src/views/TableView.tsx`, docs.
- **Category mapping:** Public, Shared, Private, Service, Utility, Circulation, Outdoor, Retail, Admin/Work, and Uncategorized map to restrained architectural hue families. Unknown category strings normalize safely to Uncategorized.
- **Privacy / area:** privacy shifts tone/depth (`public` brighter, `shared` medium, `private` deeper) and area increases shade depth without making tiny spaces unreadable.
- **Organism palette:** `settings.paletteMode` now changes the production WebGL field's global body/ground colors: Core preserves current style color behavior, Architecture uses graphite/sage direction, Surreal uses restrained experimental dark-violet tone, Auto is theme-aware.
- **Nucleus colors:** per-space mapped colors now drive organism label accents/rings, the classic fallback cell fill/selection ring, and table category swatches. The current WebGL shader still has global body/ground uniforms only; true per-nucleus shader gradients remain deferred to V6K or a later explicit shader phase.
- **Palette panel:** existing palette UI remains compact and now includes a live program-mapping token preview while preserving nucleus ramps, organism strips, gradient previews, and the custom placeholder.
- **Data safety:** mapping is derived from existing `SpaceCell` fields only. It does not change ids, names, areas, categories, privacy, x/y, camera, layouts, add-5 behavior, table sync, fallback, or the lab route.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~655.19 kB.
- **Preview QA:** Chrome against `http://127.0.0.1:5174/` verified palette changes affect label colors, palette panel active state/token previews, add-5, Random position-only data safety, table category/privacy/area edit -> swatch + canvas label color update, ORG/CLS fallback round-trip, 390 px dock/panel fit, and `/experiments/organism-lab`. Only the known non-breaking favicon 404 appeared.
- **Next:** V6J saved views or another explicit next phase. Do not start selection arc, V7 widgets, floors, export, backend, or shader rewrite unless requested.

## V6H.4B — Quick Add Cluster + Random Arrangement
- **What changed:** added fast creation and arrangement workflow improvements without starting palette mapping, saved views, selection arc, widgets, shader work, or export.
- **Files changed:** `src/canvas/layoutPresets.ts`, `src/types.ts`, `src/state/store.ts`, `src/ui/Dock.tsx`, `src/ui/OrganismControlPanel.tsx`, `src/ui/shell.css`, docs.
- **Random arrangement:** Layout panel now includes Random with hint "fresh organic spread". Random is intentionally non-deterministic each click, area-aware, and updates existing spaces by `x/y` only.
- **Add 5 nuclei:** bottom dock center now reads `[ + ] [ five-dot cluster ] [ Void disabled ]`. The five-dot circular button calls `addSpaces(5)` and creates neutral `New Space` nuclei around the current camera center; the last new nucleus is selected.
- **Data safety:** ids, names, areas, categories, privacy, colors, table data, and camera are preserved by Random. Batch creation uses normal store-owned `SpaceCell` records and keeps table sync.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~650.36 kB.
- **Preview QA:** local preview endpoint responded at `http://127.0.0.1:5174/`. Temporary Chrome QA verified `+` adds 1, five-dot button adds 5, Random appears and applies without deleting spaces, table row count and table edit -> canvas label sync, ORG/CLS fallback round-trip, 390 px dock fit, and lab route opens. Headless Chrome showed WebGL fallback, so visual organism rendering remains best checked in the normal in-app preview tab.
- **Next:** V6I palette/category color mapping or V6J saved views by explicit choice. Do not start Phase 6.5 selection arc, V7 widgets, floors, export, shader rewrite, or graph migration.

## V6H.4 — Layout Presets / Colony Arrangement
- **What changed:** added production layout presets derived from the Organism Lab arrangement language without importing lab-only negative nuclei or random replacement behavior.
- **Files changed:** `src/canvas/layoutPresets.ts`, `src/types.ts`, `src/state/store.ts`, `src/ui/OrganismControlPanel.tsx`, `src/ui/shell.css`, docs.
- **Presets:** Organic, Core, Colony, Division, Tendril, Orbit, and Asymmetry. Void is shown disabled/future because production negative/subtractive nuclei are not ready.
- **Data safety:** presets rearrange existing `SpaceCell` records by updating `x/y` only. They keep ids, names, areas, categories, privacy, colors, camera, table data, fallback mode, and lab route intact.
- **UI:** compact Layout section added inside the existing Organism Control Surface panel; bottom dock stayed unchanged. Active preset state is stored as `settings.layoutPreset`.
- **Animation:** no new animation system; existing production organism smoothing eases nuclei toward the new positions.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~648.63 kB.
- **Preview QA:** local preview verified 11-space canvas, all enabled presets, disabled Void row, table name/area edit -> canvas label/radius path, ORG/CLS fallback round-trip, `/experiments/organism-lab`, browser logs clean, and 390 px dock/panel fit.
- **Next:** V6I palette/category color mapping or V6J saved views by explicit choice. Do not start Phase 6.5 selection arc, V7 widgets, floors, export, shader rewrite, or graph migration.

## V6H.3 — Claude Premium UI Implementation
- **What changed:** visual/premium pass over the V6H.2 command architecture. No store, renderer, shader, or table changes; no packages installed.
- **Dock:** tighter scale (32 px buttons, 4 px padding), soft drop shadow, Mac-like hover lift on buttons, CSS mount animation for expanding side groups, right group reordered to palette → saved views → import → export → advanced. `+` orb grew to 50 px with an unstable/liquid border-radius wobble + red bloom on hover; void placeholder now reads as a hollow dashed future-subtractive nucleus.
- **Rail:** slimmer (28 px buttons, 6.5 px captions), hover lift, soft shadow, "note" section renamed "annotate". Sections: view / build / annotate / organism / color / display / system.
- **Panel:** header gained a grip affordance (dock-later visual), minimize-to-header-chip (236 px) and close; Motion section has a master switch (on = gentle drift/breathing/wobble preset, off = zeros — response/phase untouched); debug switches tucked behind an "Advanced debug" disclosure with a red live-dot; pockets master toggle deferred (no non-destructive off state in the field model).
- **Palette UI:** Style section now renders the `src/design/palettes.ts` metadata — 10-step nucleus shade ramps, organism ground/body/accent field strips, a gradient preview row, and a disabled custom-palette placeholder. Still metadata-only; no renderer mapping.
- **Labels:** editorial labels got a denser bg halo (readable over the black body) and stay boxless when selected (red type accent only); technical mode simplified to name · area m² · category; `m²` typography everywhere.
- **QA note:** the preview harness tab reports `visibilityState: hidden` with 0 rAF ticks/s — all Motion enter/exit animations freeze until a screenshot forces frames. Dock group expand was moved to a CSS mount animation partly for this reason; popover open/Escape/outside-close verified with forced frames.
- **Verified:** add nucleus, ORG/CLS fallback, style popover rows, Escape/outside close, dock collapse/expand, panel minimize/restore, motion master toggle both ways, debug disclosure, annotation editorial/technical/hidden, tight ring (~1.08×), table name/area round-trip with camera persistence, night mode, `/experiments/organism-lab`, 390 px fit.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~645.09 kB.
- **Next:** Codex QA pass, then V6H.4 layout presets or V6I palette/category color mapping.

## V6H.2 — UI Command Architecture Cleanup + Resource Prep
- **What changed:** clarified command ownership so the left rail is navigation/widget launchers, the bottom dock is quick creation/mode control, the right-side surface is the detailed widget panel, and the canvas remains direct-edit space interaction.
- **Duplicates reduced:** rail renderer switching and demo controls were removed; dock keeps ORG/CLS, style, attachment, reach, palette, import/export placeholders, and the widget launcher. Rail keeps view navigation, secondary build shortcuts/placeholders, annotation/organism/color/display launchers, and system controls.
- **Dock:** side groups are collapsible; center now uses a circular high-emphasis add nucleus button plus a disabled void placeholder. Saved views is prepared as a disabled/placeholder utility entry.
- **Annotation:** added `settings.annotationMode` (`editorial`, `pill`, `technical`, `hidden`), defaulting to editorial. Canvas labels now support editorial, pill, technical, and hidden modes.
- **Selection:** added `settings.selectionDisplay` (`tight`, `halo`, `influence`), defaulting to tight. Normal selection ring is now small; large red circle is preserved only as future influence/measurement mode.
- **Palette/widget prep:** added typed palette metadata at `src/design/palettes.ts`, saved-view snapshot typing, widget panel metadata at `src/ui/panels/widgetRegistry.ts`, and `docs/UI_RESOURCE_AUDIT.md`. No package installs and no category/renderer color mapping.
- **Preserved:** table sync, classic fallback, `/experiments/organism-lab`, organism shader path, old `CanvasView`, and store-owned product data.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS reported ~640.56 kB.
- **Next:** V6H.3 Claude Premium UI Implementation. Do not start Phase 6.5 selection arc, V7 widgets, floors, export, or graph migration unless explicitly requested.

## V6H.1 — Full Organism Control Surface
- **What changed:** imported the full Organism Lab parameter model into production as typed `settings.organism` (`OrganismSettings` in `src/types.ts`) with a resolver at `src/canvas/organismProductionSettings.ts` that merges lab `DEFAULT_PARAMS` + store settings + the simplified reach control. Production defaults reproduce the pre-V6H.1 look exactly (mass 1.04, effective bias ≈0.368 at reach 120, softness 0.02, pockets 7.8/0.48, motion off).
- **Advanced panel:** new `src/ui/OrganismControlPanel.tsx` — right-anchored floating glass panel with internal scroll and collapsible sections: Style (morph + palette rows with swatch/description/active state), Organism, Nuclei (count is display-only from `spaces.length`), Attachment & Offset (T/S/L/Extreme chips + hint, reach mirror, global/X/Y/radial/angular offsets), Motion, Pockets, Display & Debug (labels/nuclei/field/nuclei-debug switches), and a footer with Reset organism / Reset motion / Debug off. Escape + outside click close; launchers marked `data-orgpanel-keep`. Panel state (`orgPanelOpen/orgPanelFocus`) lives in the store.
- **Left rail:** rebuilt into captioned sections — VIEW (Canvas/Table), RENDER (Organism/Classic + classic-only blob toggle), BUILD (Add nucleus/Demo), PANELS (Controls/Style/Display — all focus the one control surface), SYSTEM (theme/reset view). Short-viewport crunch under 640 px height.
- **Dock:** kept V6H structure; attach popover gained Extreme (with per-mode hint caption + red dot marker), style/palette popovers upgraded to two-line rows with descriptions, and a right-side Advanced launcher toggles the panel. Import/export placeholders hide at ≤480 px so 390 px still fits.
- **Renderer wiring:** `OrganismCanvasView` consumes `resolveOrganism(settings)` instead of hardcoded `DEFAULT_PARAMS`+reach. Adapter (`organismAdapter.ts`) adds radius min/max clamps, deterministic per-id size variation, nucleus strength, a world-space layout transform about the space centroid (global/radial/angular) plus field-space offset X/Y, lab-style idle motion (drift/breathing/wobble with per-id phase seeds), and response-based world smoothing (drag snaps — pointer feel unchanged). Drag uses delta-inverse transform (`dragDeltaWorldToStore`), verified numerically exact under globalOffset 1.35 + 35°. Render gating extends `shouldRender` with motionActive/settling; motion defaults are off so the canvas stays dirty-gated at rest. No per-frame React state.
- **AttachMode:** union gained `"extreme"`; classic `blob.ts` records got safe extreme entries (gap capped at existing 0.32).
- **QA status:** preview verified organism render, mass/iso/bias sliders live from the panel, field debug bands, motion drift/breathing (labels track animated nuclei), display/debug toggles, all three resets (motion-only preserves mass), attach Extreme, style Wine + palette Surreal via panel, dock popovers, Escape close, + NUCLEUS, table rename/area round-trip with camera persistence, classic fallback + rail blob toggle, `/experiments/organism-lab`, night mode, 1280 px laptop and 390 px mobile, zero console warnings/errors. Preview-harness stale-click/rAF-throttle artifacts were worked around with eval-driven assertions (documented pattern since Phase 5).
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS ~636.98 kB (+21 kB for the control surface).
- **Next:** V6I palette/category color mapping or the next explicitly requested UI phase. Do not start Phase 6.5 selection arc, V7 widgets/right inspector, floors, export, or graph migration unless explicitly requested.

## V6H — Production Dock UI
- **What changed:** rebuilt `Dock` into grouped left/center/right production controls using local subcomponents (`DockGroup`, `DockButton`, `DockPopover`) and existing Motion/Lucide resources.
- **Dock structure:** left group now holds `ORG`/`CLS`, organism style, attachment, and reach/density. Center has the high-emphasis `+ NUCLEUS` button wired to `addSpace()`. Right group holds palette, demo, import placeholder, and export placeholder.
- **Panels:** style panel keeps Cellular Reverse, Plain Black, Plain White, Graphite, Wine, Auto; attachment panel keeps Tight, Soft, Long; palette panel adds Core, Surreal, Architecture, Auto.
- **Store change:** added tiny `settings.paletteMode` (`core | surreal | architecture | auto`) for UI readiness only. No category color mapping or renderer palette mapping was built.
- **Preserved:** organism renderer, classic canvas fallback, table view, table sync, and `/experiments/organism-lab` route. No packages installed.
- **QA status:** preview verified app open, add nucleus, add demo, style/attachment/palette panel selection, Escape/outside close, reach slider, `ORG`/`CLS`, table name/area edit -> canvas label/radius update, 390 px dock fit, mobile popover fit, no browser warnings/errors, and lab route.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS reported ~616.09 kB.
- **Fixed during QA:** mobile HUD was too close to the wider V6H dock; narrow viewport CSS now lifts HUD above the dock.
- **Next:** V6I palette/category color mapping can wire palette semantics. Do not start Phase 6.5 selection arc, V7 widgets, floors, export, inspector, or graph migration unless explicitly requested.

## V6G — QA / Stabilization
- **What changed:** fixed production organism label alignment during live drag/pan/zoom by syncing label transforms and selected ring sizes from the same render-loop camera used by the WebGL shader. React still owns label existence/text only; no per-frame React state was added.
- **Mobile stabilization:** tightened the existing bottom dock spacing below 480 px so a 390 px viewport no longer overflows while keeping `ORG`/`CLS` reachable.
- **Files changed:** `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismCanvas.css`, `src/ui/shell.css`, docs.
- **QA status:** local preview verified empty state, add space, add demo, drag nucleus, empty-space pan, wheel zoom, zoom/fit/reset controls, table name/area/category/privacy edits, table add/delete, canvas/table return without reset, classic fallback toggle, organism remount, `/experiments/organism-lab`, 31/61-space stress, and 390 px mobile layout.
- **WebGL lifecycle:** DPR clamp remains 2; resize and organism/classic unmount/remount checked. Shared shader renderer already has context lost/restored listeners; forced context-loss simulation was not run.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS reported ~614.41 kB.
- **Remaining risks:** high-density labels are usable but crowded at 60+ spaces; full label-density/inspector/dock design belongs to the next UI phase. Known chunk warning remains deferred.
- **Next:** V6H Production Dock UI. Do not start Phase 6.5 selection arc, V7 widgets, floors, export, or graph migration yet.

## V6F.1 — Production Organism Canvas Integration
- **What changed:** added production WebGL organism canvas using the V6E shader renderer, plus a `SpaceCell` -> nucleus adapter. Main canvas defaults to organism mode; old `CanvasView` remains available as Classic fallback.
- **Files changed:** `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismAdapter.ts`, `src/canvas/organismCanvas.css`, `src/App.tsx`, `src/types.ts`, `src/state/store.ts`, `src/ui/Dock.tsx`, `src/ui/shell.css`, docs.
- **Source of truth:** spaces, selected id, camera, and renderer settings still come from Zustand. TableView is unchanged. Add space now selects the new space.
- **Interactions:** organism canvas supports WebGL render, labels, selected ring/label state, drag nucleus -> `moveSpace`, empty-space pan -> camera, wheel zoom -> camera, and `ORG`/`CLS` dock renderer toggle.
- **Fallbacks preserved:** `src/canvas/CanvasView.tsx`, `renderer.ts`, and `blob.ts` remain intact. `/experiments/organism-lab` route remains intact.
- **Build status:** `npm run build` passed. Known chunk warning remains; main JS now ~614 kB after production organism integration.
- **Preview QA:** Chrome headless against `http://127.0.0.1:5173/` verified organism render screenshot, add demo, drag nucleus, pan, wheel zoom, table name/area edit -> canvas label/area update, classic/organism toggle, and `/experiments/organism-lab`. Only known non-breaking favicon 404 appeared.
- **Risks for V6G:** broader mobile layout pass, deeper WebGL context-loss checks, 30-60 nuclei performance sampling, label density at high counts, and chunk/code-split follow-up.
- **Next:** V6G QA / stabilization. Do not start Phase 6.5 selection arc, V7 widgets, floors, export, or graph migration yet.

## V6F.0F.3 — GitHub Push / Doc Sync
- **Remote:** `origin`
- **Repo URL:** https://github.com/barc047-sketch/Mooorf
- **Branch:** `main`
- **Decision:** GitHub is now the source of truth for code. Google Drive is not used for the code workflow.
- **Docs synced:** `docs/GITHUB_WORKFLOW.md`, `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`, root `HANDOFF.md`, root `TASK_QUEUE.md`.
- **Runtime code:** untouched. V6F.1 was not started.
- **Next:** V6F.1 Production Organism Canvas Integration remains next.

## V6F.0D — GitHub-only Coding Workflow Setup
- **Decision:** GitHub is now documented as the source of truth for code. Google Drive should not be used as the code workflow source of truth.
- **Root workflow files created:** `README.md`, `HANDOFF.md`, `TASK_QUEUE.md`, `DECISIONS.md`, `BUGS.md`, `CODEX_RULES.md`.
- **Workflow roles:** GitHub = code backup/source of truth; Codex = code editing/implementation/checks; ChatGPT = planning/prompts/audits/product decisions; Claude = design-heavy coding only when needed.
- **Repo setup:** local git repository initialized safely because none existed. No remote was added, no commit was made, and no push was attempted.
- **Docs synced:** `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`, `docs/DECISIONS.md`, and `docs/BUGS.md` updated.
- **Runtime code:** untouched. No UI, renderer, store, table, or organism integration work started.
- **Checks:** no lint/typecheck/test scripts exist separately. `npm run build` passed; known Vite chunk warning remains (main JS ~596 kB).
- **Next:** V6F.1 production organism canvas integration remains next.

## V6F.0C — Reference Folder Patch (docs only, no implementation)
- **Reference folder:** production canvas UI references now live at `assets/references/01`.
- **Docs patched:** `docs/PRODUCTION_CANVAS_UI_SYSTEM.md`, `docs/CONTROL_PANEL_ARCHITECTURE.md`, `docs/PALETTE_SYSTEM_SPEC.md`, `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`, `docs/DECISIONS.md`.
- **Reference interpretation:** bottom panel color/style/device, light dashboard/map widgets, grey left rail/system, dark gradient dashboard, and compact side rail references are visual/structural only. They inform hierarchy, density, mood, dock grouping, popovers, inspector sections, active buttons, and restrained palette use; no layouts or branding should be copied.
- **Runtime code:** untouched. No React components, renderer, store, table, or import/export code changed.
- **Build status:** not run by instruction.
- **Next:** V6F.1 production organism canvas integration remains next.

## V6F.0B — Production Canvas UI / Control Architecture (docs only, no implementation)
- **Decision:** production canvas controls are organized around a modular left rail, bottom dock, right inspector, floating widgets, and hidden advanced/lab panel. The organism is treated as the primary canvas object; spaces remain store/graph-owned nuclei.
- **Docs created:** `docs/PRODUCTION_CANVAS_UI_SYSTEM.md`, `docs/CONTROL_PANEL_ARCHITECTURE.md`, `docs/PALETTE_SYSTEM_SPEC.md`, `docs/SITE_FEATURE_FLOW_MAP.md`.
- **UI architecture summary:** left rail handles modes/tools; bottom dock handles primary creation and organism controls; the center dock action becomes a high-emphasis `+ NUCLEUS` button; the right inspector owns selected nucleus properties; floating widgets stay selector-backed; lab controls are preserved but hidden as advanced/debug.
- **Control preservation:** production exposes style, attachment, reach/density/offset, theme, palette, labels, grid, nuclei visibility, add nucleus, and optional reset/randomize. Advanced/debug preserves mass, iso, tension, edge softness, connection bias, radius/strength/variation, motion, pockets, field debug, nuclei debug, shader diagnostics, and performance counters.
- **Palette plan:** future `src/design/palettes.ts` recommended for metadata only. Core, Surreal, and Architecture palette groups are documented. Gradients are restricted to high-emphasis actions, selected modes, export, warnings, premium toggles, metric internals, and organism/category blend.
- **Library/asset plan:** use installed project components, Base UI/shadcn primitives, Lucide, Motion, Floating UI, cmdk, Sonner, color libraries, and existing export libraries when phases need them. No packages installed. Optional Tweakpane-like inspector, extra icons, palette generation, shader preset tooling, or token generators are deferred.
- **Reference folder note:** superseded by V6F.0C; production canvas UI references now live at `assets/references/01`. No images were moved or processed.
- **Build status:** not run; V6F.0B is docs-only and no runtime code changed.
- **Next:** V6F.1 production organism canvas integration using the new docs. Do not start V6G, Phase 6.5 selection arc, V7 widgets, package installs, backend, deployment, or store/graph rewrites.

## V6F.0 — Organism Production Integration Audit (docs only, no implementation)
- **Decision:** Organism Lab is the preferred production canvas direction. Production should shift from "circle/cell with blob behind it" to "Space data → nucleus → organism field → labels/controls/table/stats" while keeping the existing `CanvasView`/2D blob path as fallback during rollout.
- **Lab architecture:** `OrganismLab` owns a WebGL2 fullscreen-triangle renderer (`organism-shader.ts`), a packed `Float32Array` uniform buffer (`xy,r,signedStrength` per nucleus, max 48), CPU nucleus smoothing/drag/idle motion (`organism-motion.ts`), style and attachment resolution (`organism-controls.ts`), and explicit lifecycle cleanup (ResizeObserver, rAF cancel, WebGL context lost/restored listeners, program/VAO dispose). Field units are centered, y-up, shorter viewport axis spanning roughly `[-1,1]`.
- **Production app architecture:** `SpaceCell` already contains the required source fields: `id`, `name`, `area`, `category`, `privacy`, `x/y`, `color`, optional `born`. Zustand remains source of truth with `addSpace`, `addDemo`, `updateSpace`, `moveSpace`, `removeSpace`, `select`, `setCamera`; table edits already sync through the same store and view switching does not reset spaces/camera.
- **Space → nucleus mapping:** `SpaceCell.id → nucleus.id`; `name → label`; `area → radius` via existing `areaToRadius` then normalized into shader field units; `x/y → target/home position`; `category → later material/style influence`; `privacy → later opacity/field-strength influence`; `selectedId → selected nucleus`; future `locked/visible → interaction/visibility`; table area/name edits update radius/label; add/delete rows add/remove nuclei; dragging a nucleus commits `moveSpace(id,x,y)`.
- **Recommended V6F.1 strategy:** preserve `/experiments/organism-lab` as the dev lab; add a production organism canvas component (`src/canvas/OrganismCanvasView.tsx`) plus a small store-to-nuclei adapter rather than mutating the old blob path first. Keep `TableView` unchanged. Use existing `settings.morphMode`, `settings.attachMode`, `settings.mergeDistance`, `theme`, `camera`, and CRUD actions. Add a conservative renderer toggle only if needed (Classic Canvas / Organism Canvas), defaulting only after preview proves stable.
- **Production controls:** expose only add/demo, style, attachment, reach/offset-density slider, theme, import/export placeholders, and possibly reset/randomize if already in the shell language. Keep iso, mass, tension, edge softness, pocket softness, debug, nuclei count, and lab presets hidden until a later advanced/debug pass.
- **V6F.1 files likely to touch:** `src/canvas/OrganismCanvasView.tsx` (new), optional `src/canvas/organism-production-renderer.ts` or adapter module (new, reusing lab shader/control logic), `src/App.tsx` (wire fallback/toggle), `src/state/store.ts` and `src/types.ts` only if a renderer-mode setting is needed, `src/ui/Dock.tsx`/`src/ui/shell.css` only for reduced production controls, docs. Keep `src/canvas/CanvasView.tsx`, `src/canvas/renderer.ts`, and `src/canvas/blob.ts` as fallback unless a later phase explicitly removes them.
- **Risks:** WebGL lifecycle and fallback note, DPR/performance at 30–60 spaces, world↔field↔screen coordinate conversion with pan/zoom, label overlay alignment over shader canvas, drag hit testing and commit throttling, table sync while WebGL animation smooths, old/new canvas sharing one store, route lazy chunk size, mobile dock/label layout, and preserving the no-reset camera/spaces behavior.
- **Build status:** not run; V6F.0 is a read-only audit plus docs update by instruction.
- **Next:** V6F.1 production organism canvas integration. Do not start V6G, selection arc, widgets, store rewrite, package installs, backend, deployment, or master-graph runtime migration.

## Phase 6E — Organism Lab Shader Prototype (implementation only, ULTRA mode — NOT verified)
- **What it is:** isolated prototype of the true-liquid organism renderer at `src/experiments/organism-lab/` — one continuous implicit scalar field evaluated per pixel per frame in a WebGL2 fragment shader. Topology (merge/split/internal voids) is emergent; no pairwise bridges, no contour extraction, no SVG/path morphing, no per-frame React state.
- **Three.js note:** not installed, and installing wasn't allowed by default — the renderer is a raw WebGL2 fullscreen triangle with **zero new dependencies** (`organism-shader.ts`); the GLSL ports 1:1 into a Three.js ShaderMaterial if V6F wants it. WebGL2-unavailable → graceful fallback note.
- **Field:** clamped inverse-square kernels (`r²/(d²+0.09r²)`, finite interior) raised to an attachment-driven tension exponent + a 1/d connection tail scaled by bias; signed strengths support **negative/subtractive nuclei**; a second higher iso band opens **controlled cellular pockets** where energy stacks (Cellular Reverse). fwidth AA floor under an Edge Softness control.
- **Motion:** every animated quantity is target + rendered with `cur += (target−cur)·(1−e^(−response·dt))`; nuclei draggable (hit-test rendered positions, deltas inverse-transformed through the offset layout, pointer-capture try/catch); idle breathing/drift/wobble with per-nucleus phase seeds; style/attachment switches cross-fade through the same smoother.
- **Styles kept selectable (not destructive):** Cellular Reverse (theme-inverting, pockets), Plain Black, Plain White, Graphite, Wine, Auto + lab-local day/night toggle; panel tone auto-flips for legibility on style-forced grounds.
- **Controls:** full data model wired — Organism (Mass/Iso/Surface Tension/Edge Softness/Connection Bias), Nuclei (Count buds from the core, Radius Min/Max, Strength, Size Variation), Attachment T/S/L/Extreme + Global/X/Y/Radial/Angular offsets, Motion (Time Scale/Response/Drift/Breathing/Wobble/Phase Variation), Pockets, Debug (field bands + iso lines, nuclei rings). Dock: style/attachment chips, offset slider, show/hide nuclei, randomize, reset; presets top-center.
- **Presets:** Core, Colony, Division, Tendril, Void (negative nuclei), Orbit, Asymmetry (`organism-presets.ts`).
- **Main app impact:** `src/App.tsx` only — hidden lazy route `/experiments/organism-lab` (or `/#organism-lab`) returned before the shell mounts; existing body moved unchanged into internal `MainApp()`. Store, canvas, blob, table, dock untouched. Lab chunk is lazy → zero main-bundle cost.
- Files: `src/experiments/organism-lab/{OrganismLab.tsx, organism-types.ts, organism-shader.ts, organism-motion.ts, organism-controls.ts, organism-presets.ts, organism-lab.css}`, `src/App.tsx`, `docs/ORGANISM_LAB_SPEC.md`, docs.
- **NOT run this phase (by instruction):** build, dev, preview, QA. Codex: `npm run build`, then open `/experiments/organism-lab` — full checklist at the end of `docs/ORGANISM_LAB_SPEC.md`.
- **Next:** Codex verify V6E (+ pending V6D QA). Then V6F: integrate the winning renderer into the main canvas. V6.5/V7 not started.

## Phase 6D — Organism System Redesign + Morph Style Panel (implementation only, ULTRA mode — NOT verified)
- **New organism concept:** no more pairwise circle+bridge stacking. Union-find clusters cells by attachment gap; each cluster renders as ONE continuous membrane — compact-support Wyvill metaball field per cluster (far clusters exchange zero field energy → no global island), `d3-contour` at an exact iso-level, every vertex Newton-projected onto the analytic surface, closed Catmull-Rom splines. Internal pockets/cut-ins emerge as contour holes (nonzero fill). Lone cells stay exact circles.
- **Morph modes** (`src/types.ts`): `cellular-reverse` (default; tight kernels keep pockets; theme-inverts — black organism/day, bone organism/night), `plain-black`, `plain-white` (fatter kernels, pockets culled, fuller Illustrator-union silhouette), plus kept `graphite`/`wine`/`auto` (plain geometry; auto is now theme-adaptive black/bone).
- **Attachment:** `tight`/`soft`/`long` presets = base edge-gap ratio 6/14/26% of pair average radius; slider ("reach") fine-tunes ×0.6–1.4 within presets, hard cap 32%. Presets no longer stomp the slider. Padding capped toward nearest foreign organism so separate bodies never kiss.
- **Dock:** morph button opens a compact anchored glass style panel (3 main modes, hairline divider, 3 extras, red active dot); attach button opens a T/S/L chip micro-panel with a tiny caption. Escape/outside-click close. Same Motion `x:"-50%"` centering gotcha applies to panels.
- **Liquid transitions:** membrane params + fill ease per frame in `blob.ts`; `drawScene` now returns a settling flag and `CanvasView` keeps `dirty` true while it settles (rAF loop is dirty-gated).
- Files: `src/types.ts`, `src/state/store.ts`, `src/canvas/blob.ts` (rewrite), `src/canvas/renderer.ts`, `src/canvas/CanvasView.tsx`, `src/ui/Dock.tsx`, `src/ui/shell.css`, docs.
- **NOT run this phase (by instruction):** build, dev server, preview, tests. Codex must run `npm run build`, then QA: all 6 morph modes day+night, T/S/L presets + slider sweep, pocket behavior, no-kiss between separate organisms, drag rebuild perf at 30–60 cells, style-transition settling, table sync regression, dock panels (open/close/Escape/outside-click, narrow viewport).
- **Next:** Codex QA / bugfix of V6D. V6.5 selection arc and V7 floating widgets remain not started.

## Phase 6C — QA / Bugfix
- QA-only pass after V6B.2. No app code changes were required.
- Files checked: `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`, `docs/BUGS.md`, `docs/DECISIONS.md`, `package.json`, `src/types.ts`, `src/state/store.ts`, `src/canvas/blob.ts`, `src/canvas/renderer.ts`, `src/canvas/CanvasView.tsx`, `src/ui/Dock.tsx`, `src/ui/shell.css`, `src/views/TableView.tsx`.
- Build: `npm run build` passed. Only the known Vite chunk warning remains (`index` js ~580 kB > 500 kB), still deferred.
- Local preview: in-app browser at `http://127.0.0.1:5173/` rendered correctly with no app console errors. The in-app browser DOM snapshot API failed with an internal `incrementalAriaSnapshot` method error, so deeper interaction QA used Chrome/Playwright against the same URL.
- Canvas QA: 10 demo cells visible; select/drag, pan, zoom, selection state, and blob toggle all verified.
- Morph QA: Cellular, Plain Black, Graphite, Wine, and Auto cycled without crashes or resets.
- Attachment QA: Tight, Soft, and Wide cycled correctly; controlled near/far sample showed near cells connected and far gap stayed transparent in Wide.
- Table QA: table switch, name/area/category/privacy edits, add/delete row, canvas return, area→radius update, morph update after edits, camera persistence, and no-reset behavior verified. Canvas-only dock/rail/zoom/HUD stayed hidden in table view, including a 720 px narrow viewport.
- Performance sanity: 30 cells checked; no severe lag observed in the quick rAF sample.
- Bugs fixed: none. Remaining issues: known chunk warning deferred; non-breaking favicon 404 seen in browser logs.
- **Next:** Phase 6.5 Selection Arc + cmd-scroll resize through Claude/Fable xhigh. V7 floating widgets not started.

## Phase 6B.2 — Morph Modes + Attachment Control
- Resumed from the current files in-place. No Git repo metadata was present at `/Users/tanisxq/Documents/ZONU0`, so current disk files were treated as the interrupted V6B state.
- Added `MorphMode` and `AttachMode` to `src/types.ts`, with default settings `morphMode: "cellular"` and `attachMode: "soft"` in `src/state/store.ts`.
- `src/canvas/blob.ts` now supports Cellular, Plain Black, Graphite, Wine, and Auto. Cellular preserves the liked black cellular/rim style; Plain Black uses a fuller pair-only bridge fill plus smooth cubic necks for a cleaner black body.
- Attachment modes Tight / Soft / Wide are capped by edge-gap logic. Wide still hard-caps at 20% of the pair's average original radius; visual padding stays below the 20% radius cap.
- `src/ui/Dock.tsx` keeps the compact bottom dock, reuses the existing palette slot for morph mode cycling, and adds a compact attachment button that cycles Tight → Soft → Wide and applies safe slider presets. Existing merge slider, import/export placeholders, add/demo buttons, and table-hidden canvas controls are preserved.
- `src/ui/shell.css` adds only compact mode-button styling and tiny in-button labels/swatch states.
- Verification: `npm run build` green. Local preview at `http://127.0.0.1:5173/` checked in Chrome: canvas renders, Plain Black and Cellular work, attachment button changes state/presets, Wide did not create a giant island in a controlled far-cell sample, table switch works, dock hides in table view, and no blank screen. Observed non-breaking favicon 404 and a test-induced `getImageData` readback warning only.
- Files changed: `src/types.ts`, `src/state/store.ts`, `src/canvas/blob.ts`, `src/canvas/renderer.ts`, `src/ui/Dock.tsx`, `src/ui/shell.css`, `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`.
- Remaining risk for V6C: sample more organic multi-size layouts by eye and decide whether Plain Black should become even more filled between very close equal-radius pairs.
- **Next:** Phase 6C Codex QA / bugfix. V6.5 selection arc and V7 floating widgets remain not started.

## Phase 6B.1 — Blob Geometry Correction
- Root cause: the old inverse-square field used `r·1.02 + 10 + mergeDistance·0.4`; at the default slider a 60 px cell reached 119.2 px, and distant field contributions accumulated into a global island.
- Final geometry stays inside `src/canvas/blob.ts` and preserves the cache/renderer API, but replaces sampled d3-contours with exact expanded circle arcs plus pairwise cubic metaball necks.
- Boundary padding maps safely from 8% at slider minimum to 12% maximum (60 px cell: 4.8–7.2 px). Pair eligibility uses real edge gap and maps from 0% to 20% of the pair's average original radius (60 px equal pair: 0–12 px).
- Far cells cannot influence one another; close/overlapping cells get tangent cubic bridges. Exact arcs remove marching-square scallops, accidental holes, and convex-hull flooding.
- Black/Graphite/Wine/Auto modes, blob toggle, slider UI, cache behavior, drag/pan/zoom, table sync, and hidden table-view controls are preserved.
- Live verification: tight separate groups, close-cell union, Black mode, table area edit 120→500, canvas/table round-trip, and no current app errors. Production build green.
- Remaining risk for V6C: visually sample more hand-arranged unequal-radius pairs and stress drag at 50+ cells; pair scan is O(n²) but bounded and cheap at current scale.
- **Next:** Phase 6C Codex QA / bugfix. V6.5 and V7 remain not started.

## Phase 6B — Venom Blob Polish
- `src/canvas/blob.ts`: preserved the Phase 6A metaball field, cache, merge semantics, and renderer pipeline. Normal sampling increased 128→176, dense sampling 96→112 (hard cap 220), with two rebuild-time Chaikin passes before the existing quadratic path fit for cleaner Illustrator-like boundaries and cavities.
- Final direction is a single opaque graphic silhouette: no shadow blur, haze, layered tissue, glow, halo, outline, or fuzzy edge. Default Black is near-black in day and lifted deep-black in night; Graphite, Wine, and theme-aware Auto are also solid fills.
- Added the smallest store setting, `settings.morphColorMode`, defaulting to `black`. The existing unused palette slot in `Dock.tsx` now cycles Black → Graphite → Wine → Auto with a compact swatch and accessible changing label. Dock dimensions did not grow.
- Existing Phase 6B scale polish remains: 34 px controls, tightened dock/rail gaps, 88 px merge slider. View toggle unchanged and table still hides canvas-only controls.
- Live verification: all four morph modes, day/night, blob toggle, merge control presence, fit/zoom alignment, table switch, area 120→640 sync/radius, morph/camera persistence, and zero console warnings/errors.
- Future overlays only: dark-scan + Superpower glass language, compact metric/warning chips, animated key numbers, affected-cell highlights; avoid generic cards.
- **Not started:** V6.5 selection arc and V7 floating widgets.
- **Next:** Phase 6C QA / bugfix through Codex.

## Codex Workspace Setup
- Added `AGENTS.md` plus focused agent, skill, MCP, preview, routing, workspace, and directory documentation.
- Added lightweight project-local skill candidates for visual polish and QA; installed CLI does not explicitly document project-local discovery, so they also serve as checked-in workflow references.
- UI/UX Pro Max was not installed; optional reference and protected-core limits are documented.
- `codex mcp list` checked: bundled browser-support tools available; no MCP added and no auth or secrets touched.
- Runtime directories were not moved. No packages, UI, blob polish, backend, deployment, or architecture changes.
- **Next:** Phase 6B Venom Blob Polish through Codex if Claude remains limited — awaiting explicit prompt.

## Phase 6A — Organism Blob Foundation (just shipped, ULTRA mode)
- NEW `src/canvas/blob.ts` (pure geometry/draw, no React/store): metaball implicit field `f(p)=Σ Re²/d²` sampled on an adaptive world-space grid (≤128/axis, ≤96 past 24 cells, hard cap 200), iso-contour at 1 via **d3-contour** (already installed — zero new deps), rings rounded with midpoint-quadratic smoothing + speckle-ring cull, baked into a **world-space Path2D**.
- **Perf architecture:** path cached by content key (rounded body x/y/r + mergeDistance) — pan/zoom NEVER recompute the field, they only re-fill the cached path under the camera transform; per-cell squared-distance cutoff (5·Re) bounds field cost. Measured worst case: **60 cells @ 61 fps with a full rebuild every frame** (animated merge slider).
- Wiring: `renderer.ts` builds spawn-scaled bodies (drag override included, no viewport cull) and calls `drawBlobLayer` FIRST (blob under cells); night detection = luminance of `tokens.ink`. `CanvasView.tsx` mirrors `settings` into the rAF loop (3-line change). Store untouched — reuses Phase-2 `settings.blobOn` (rail toggle) + `settings.mergeDistance` (dock slider 0–300).
- **Merge semantics:** reach `Re = r·1.02 + 10 + mergeDistance·0.4`; lone-cell edge at Re, necks form ≈ centers < 2.83·Re. Verified: merge 20 → separate islands + one smooth Library↔Lobby neck; merge 120 → single connected organism.
- **Visual:** single low-alpha linear gradient fill, no outline/glow/halo/pipes. Day: wine 10% → fog 18% on cream. Night: wine 26% → graphite 45% on near-black. Cells, labels, selection ring stay crisp above. Screenshots verified day + night + toggle-off.
- **Sync re-verified:** table area edit 120→600 reflects in blob, camera + spaces persist across table round-trip, add/delete rebuild via content key, zero console errors.
- Known QA quirk again: preview-eval re-execution inflated addDemo counts (50→60) — harness artifact; used it as a bonus stress case.
- Local preview: http://localhost:5173 (left running). Build: green.
- **Remaining blob polish (6B, not started):** category-aware gradient blend (graph `DEFAULT_CATEGORIES` gradients ready), quality/perf mode switch, optional edge-softness pass.
- **Next:** Phase 6B polish or Phase 7 Export + QA — awaiting GO.

## Phase 5.1 — Table/Shell Polish
- `src/App.tsx` now keeps the global Canvas/Table toggle visible while mounting rail, dock, zoom controls, and HUD only in canvas view.
- Table/store/camera logic is unchanged; switching views does not reset spaces or camera.
- The 576 kB Vite warning remains deferred: splitting the table view is optional performance work, not required for this overlap-only patch.

## Phase 5 — Table View Sync (just shipped)
- NEW `src/views/TableView.tsx` — compact technical table in a `.glass` panel; columns #/name/area/category/privacy/x/y/r(read-only)/delete. Plain row-map over shadcn Table + Input + Select + Button (TanStack deliberately skipped for now — no sorting/filtering yet; revisit when needed). `src/App.tsx`: "Phase 5." placeholder → `<TableView/>` (2-line change). CanvasView, store, ViewToggle untouched.
- **Same store, zero duplication:** table reads `spaces` and writes via existing `updateSpace`/`addSpace`/`removeSpace`. Name/category/privacy commit onChange; area goes through a local draft (`AreaCell`) so clearing while typing never writes NaN — valid parses commit, clamped ≥ 1 m².
- **Sync tests (all verified in live preview via store assertions + screenshots):** name edit → canvas label ✓ · area 120→400 → radius grows ✓ · category Public→Admin persists ✓ · add row (11, unique ids) ✓ · delete row (10, selection cleared) ✓ · moveSpace position persists across switch ✓ · camera {50,30,1.4} persists both directions ✓ · view switch never resets spaces ✓ · zero console errors ✓.
- **QA gotcha (again):** preview-eval re-execution inflated demo cells (21, then 40) — harness artifact, not an app bug. Mitigation used: idempotent setup evals (reset-from-empty), real `preview_fill`/`preview_click` for interactions, read-only evals for assertions.
- Build: green (`tsc -b && vite build`); NEW: 576 kB js warning (>500 kB) from Base UI select/table joining the bundle — code-split in a perf/export phase, not now.
- Polish deferred (intentional): canvas-only controls (rail/zoom/merge slider/HUD zoom%) still float over the table view — harmless on desktop, overlaps on narrow viewports; hide-or-dim them in the visual polish phase.
- Local preview: http://localhost:5173 (dev server left running).
- **Next:** Phase 6 — Organism Blob per queue, or a shell polish pass first. Import CSV deferred to Phase 7.

## V5 Readiness Audit (just completed — audit only, no V5 code)
- **Local preview:** `npm run dev` → http://localhost:5173. App renders green: loader completes → canvas shows 10 demo cells, view toggle / rail / dock / zoom / HUD all present. Zero console errors, zero dev-server errors. V4.5B domain layer did NOT affect runtime (it is imported nowhere yet).
- **Build:** green (`tsc -b && vite build`, ~2.3s, 415 kB js / 138 kB gz).
- **Readiness = YES.** Store already supports everything table sync needs: `updateSpace(id,patch)` (name/area/category/privacy edits), `addSpace`/`removeSpace` (add/delete rows), single Zustand store shared by any view.
- **No-reset confirmed:** `view` is a store field (`ViewToggle` just calls `setView`); `spaces` + `camera` are separate store fields, untouched by view switch → switching canvas↔table cannot reset spaces or camera. Camera stays canvas-only; table won't read it.
- **Area→radius path exists:** canvas renderer derives radius from area every frame via `lib/geometry.areaToRadius` (also exposed as `adapters.radiusFromArea`), so a table area edit → `updateSpace` → canvas re-renders new radius automatically. No extra wiring needed.
- **V5 files likely to touch:** NEW `src/views/TableView.tsx` (TanStack Table + shadcn table/input/select, edits via store actions); `src/App.tsx` (replace the "Phase 5." placeholder in the `view === "table"` branch with `<TableView/>`); `src/state/store.ts` (only if adding category/privacy option lists or a delete confirm — edits already supported); optional `src/types.ts` (only if aligning categories to CategoryCode). Docs: HANDOFF.md, TASK_QUEUE.md. CanvasView needs NO change.
- **V5 risks:** (1) Store still uses legacy `SpaceCell` (privacy `public/shared/private`, category free string) vs the V4.5B graph's `CategoryCode`/`PrivacyCode` — decide at V5 start whether table edits `SpaceCell` directly (simplest, keeps canvas stable) or begins the graph migration; recommend editing `SpaceCell` for V5 to avoid a store rewrite. (2) Category/privacy dropdown values must match whatever the canvas/palette expects. (3) CSV duplicate IDs (BUGS.md) — deferred with import UI. (4) Keep table→store edits from thrashing the canvas rAF (store is already commit-driven, low risk).

## V4.5B — Master Graph + Floor System + Import Contract (just shipped)
- New domain layer `src/domain/graph/` (pure TS, zero new deps, no UI/store changes):
  - `types.ts` — `ZonuertProject` root (version/timestamps/meta/floors/spaces/relationships/flows/categories); `ProjectMeta`, `FloorNode`, `SpaceNode` (required `floor_id`), `RelationshipEdge`, `FlowPath`, `CategoryDefinition`; unions `CategoryCode` (16), `PrivacyCode` P0–P5, `RelationshipCode` (9), `AreaUnit`, `SpaceShape`, `FlowType`; `DEFAULT_CATEGORIES` with restrained gradient palette; `GraphStats` marked computed-only.
  - `selectors.ts` — all 16 required pure selectors + `getGraphStats` roll-up. Rules encoded: locked AND hidden spaces count; safe divide-by-zero → 0; built-up excludes OUT; area-left prefers `meta.total_built_up_area` target over site_area; FAR = built-up/site; warnings cover missing area/category/privacy/floor, unknown floor, missing site_area, duplicate ids.
  - `sample-project.ts` — "Meridian Community Hub": 3 floors (Basement/Ground/First), 24 spaces (all with floor_id/area/category/privacy/x/y/radius), 10 relationships, 2 flows, DEFAULT_CATEGORIES.
  - `import-contract.ts` — CSV simple (name,area,category,privacy,floor), XLSX 6 sheets (PROJECT/FLOORS/SPACES/RELATIONSHIPS/FLOWS/CATEGORIES) with per-column required/default/rule, cross-sheet VALIDATION_RULES, future `ZonuertSaveFile` (.zonuert). **No import UI built.**
  - `adapters.ts` — `spaceNodeToCanvasCell` / `canvasCellToSpaceNode` / `radiusFromArea` (reuses `lib/geometry.areaToRadius`) / `shortLabelFromName`; legacy Privacy↔PrivacyCode maps.
- New docs: `CENTRAL_GRAPH_SCHEMA.md` (graph=brain, views, V5 migration path), `IMPORT_TEMPLATE_SPEC.md`, `AI_TEMPLATE_PROMPT.md` (paste-into-Gemini/Claude/ChatGPT prompt), `FLOOR_SYSTEM_SPEC.md`, `BYLAW_CHECK_FUTURE_SPEC.md` (hook only, not legal approval), `TOKEN_SAVER_SETUP.md`.
- **Store compatibility:** V4 `SpaceCell` store untouched and still drives canvas. V5 migration = store adopts `ZonuertProject`, `SpaceCell` becomes render projection via adapters (documented in CENTRAL_GRAPH_SCHEMA.md).
- Headroom: not checked (optional). Ponytail: reused areaToRadius/uid patterns, zero new dependencies, no UI code.
- **Next exact step:** V5 Readiness Audit. V5/Table Sync NOT started.

## V4.5A — Visual Resource + CAD Glass UI System (just shipped, docs only)
- New docs (all in `docs/`): `V4_5_VISUAL_DIRECTION.md`, `V4_5_CAD_TOOLBAR_SYSTEM.md`, `V4_5_COMPONENT_LIBRARY_RULES.md`, `V4_5_GLASS_SHADER_TOKENS.md`, `V4_5_FLOATING_WIDGET_SYSTEM.md`, `V4_5_INTERACTION_SHORTCUTS.md`, `V4_5_CANVAS_GRID_AND_SCALE_SYSTEM.md`, `V4_5_SELECTION_ARC_SYSTEM.md`, `V4_5_METRIC_TEXT_ANIMATION.md`, `V4_5_RESOURCE_LINKS.md`.
- Reference interpretation: Palmer (editorial canvas/spacing), Rayon (CAD toolbar/inspector precision), Superpower (soft glass metric widgets), dark-scan UI (dotted grid, warning chips, orbit-selection arc, animated metrics) — mood/interaction references only, no proprietary layouts/branding/health-dashboard content copied.
- Resources added: glasscn-ui, Tabler Icons, Iconoir, React Icons, cmdk (corrected canonical repo `pacocoursey/cmdk`), react-circular-slider-svg/react-round-slider (arc), Konva/Flowscape-UI (canvas reference only, no migration planned).
- Updated: `RESOURCE_INDEX.md` (new V4.5A section), `DECISIONS.md` (new V4.5A entry), `TASK_QUEUE.md` (V4.5A marked complete; V4.5B, V5 Readiness Audit, Phase 5 sections added in order).
- No build run (docs/settings only, no TS/config changed). Last known build: green (Phase 4).
- **Next exact step:** V4.5B — Master Graph + Floor System + Import Contract. V5 (Table Sync) not started.

## V4.5A reference patch (just shipped, docs only)
- Attached visual references (Palmer editorial canvas, Rayon CAD toolbar/inspector, Superpower grey/white metric dashboard, dark-scan orbit/arc + dotted-grid UI) were integrated into the V4.5A docs after initial completion — explicit reference list + per-doc interpretation added to visual direction, CAD toolbar, glass/shader tokens, floating widgets, canvas grid, selection arc, metric text animation.
- No UI built, no code touched. Next remains V4.5B; V5 not started.

## Phase 2 — App Shell (just shipped)
- `src/ui/ViewToggle.tsx` / `Dock.tsx` / `Rail.tsx` / `ZoomControls.tsx` / `shell.css` — glass edge controls, Motion entrances staggered 0/.08/.16/.24s, mounted only when `loaderDone`.
- Wired now: view pill (layout-animated thumb), theme toggle (rail), blob on/off + merge slider → `settings` (new store slice: `{mergeDistance:120, blobOn:true}` + `setSettings`), add-space button. No-op until later phases: demo/palette/import/export (P3/5/7), zoom/fit (P4).
- **Token reconciliation DONE:** `src/index.css` shadcn vars now alias ZONUERT tokens (`--background:var(--bg)` etc., single `[data-theme]` night path, `--font-sans:var(--font-ui)`); Geist import dropped (-76 kB fonts). Verified: body cream `#f5f6ee` day / `#070707` night.
- **Gotcha fixed:** Motion inline `transform` clobbers CSS `translate(-50%)` centering — centering offsets must live in Motion `x`/`y` values (see ViewToggle/Dock/Rail). Do the same for any future absolutely-centered motion element.
- Narrow-viewport rules in shell.css (hint hidden <1100px, zoom lifts above dock <1024px).
- Old top-right theme button removed from App.tsx (now in rail).

## Phase 1 — Loader (just shipped)
- `src/ui/Loader.tsx` + `src/ui/loader.css` — GSAP timeline: fade-in → 3-layer liquid gradient bloom (bottom-left, 58vw×54vh ≈ 31% viewport, orange/magenta/indigo, ≥9s yoyo drift) → red countdown 000→100 (bottom-right, tabular-nums, --zonuert-red, verified computed) → status sequence (loading spatial graph / preparing cells / building canvas / ready) → red underlined "enter canvas" (click = seek to exit) → clip-path wipe-up reveal 0.9s → `setLoaderDone`.
- `store.ts`: + `loaderDone` / `setLoaderDone` — Phase 2 shell entrances must gate on this.
- `App.tsx`: `{!loaderDone && <Loader />}` above stage.
- Reduced-motion: instant 100 + 0.4s fade (media query, no crawl/drift).
- Verified in preview: mid-run + full-bloom screenshots, countdown color inspected, unmount confirmed, zero console errors.

## Setup outcome (Prompt 01)
- Full core stack installed: pixi/@pixi/react, d3-*, rbush, simplify-js, matter-js, use-gesture, zustand, nanoid, stats.js, comlink; gsap/@gsap/react, motion, lucide, sonner, cmdk, vaul, floating-ui; culori/colorjs/chroma/tinycolor, simplex-noise; papaparse/xlsx/jszip/pdf-lib/html-to-image/file-saver; @tanstack/react-table. Dev @types/* + vite-plugin-checker.
- React upgraded 18 → 19 (@pixi/react@8 peer). See DECISIONS.md.
- Tailwind v4 + shadcn (Base UI registry): `src/components/ui/*` (22 comps), `src/lib/utils.ts`, `components.json`, alias `@/*`→`src/*`. shadcn theme vars in `src/index.css`; editorial tokens still in `src/styles/tokens.css` (reconcile in UI phases).
- MCPs (project scope): zonuert-files, memory, sequential-thinking, playwright, context7 — all ✔. fetch skipped (needs uv/Python; use native WebFetch).
- `docs/RESOURCE_INDEX.md` added.
- Build: green (~198 kB js / 62 kB gz; +92 kB css from shadcn/geist fonts).

## Built
- Vite/React/TS app (manual scaffold, in-place)
- Design tokens (`src/styles/tokens.css`) — day (gallery cream) + night (graph-noir) themes as CSS vars
- Zustand store (`src/state/store.ts`) — theme, view mode, SpaceCell CRUD (add/update/move/remove)
- Full-screen app shell (`src/App.tsx`) — brand mark, editorial empty state, glass theme toggle

## Working
- `npm run build` passes
- Day/night toggle switches document `data-theme`, tokens re-theme whole app
- No page scroll (body overflow hidden)

## Broken
- none

## Files changed
package.json, vite.config.ts, tsconfig*.json, index.html, .gitignore, .claude/launch.json,
src/main.tsx, src/App.tsx, src/App.css, src/styles/tokens.css, src/state/store.ts, src/types.ts

## Commands run
npm install · npm run build (green) · preview screenshots (day + night OK)

## Performance notes
Foundation deps only (react, react-dom, zustand). Heavy libs (pixi/three/d3/gsap/etc.)
deliberately DEFERRED to the phases that need them — keeps bundle + install lean.
Current bundle: ~147 kB js / 47 kB gzip.

## Phase 3 — Cells + gestures (just shipped)
- New: `lib/geometry.ts` (sqrt area→radius, golden-angle scatter, hit-test, clamp), `lib/demo.ts` (10-space program + ceramic palette), `canvas/renderer.ts` (pure draw: shadow→body→ceramic shading→label→selection ring, spawn easeOutBack), `canvas/CanvasView.tsx` (imperative: rAF loop, store subscribe→dirty flag, refs for drag/pan, wheel zoom-to-cursor, DPR≤2, drag commits throttled 90ms + on end, camera commit on gesture-end/160ms debounce), `canvas/canvas.css`.
- Store: +`selectedId/select`, `camera/setCamera`, `addDemo(n)`; `addSpace` auto-scatters+palette; dev handle `window.lab` (DEV only) for QA evals.
- Verified numerically: drag Δx=60 ✓ select ✓ pan Δx=−80 ✓ zoom 1.468 ✓ add 10→11 ✓; screenshots premium in day mode.
- **Gotchas:** `setPointerCapture` needs try/catch (synthetic pointerIds throw pre-branch — killed all gestures in tests); `types:["vite/client"]` added to tsconfig.app.json for `import.meta.env`.
- Spawn stagger animates via `born` timestamps; loader-exit reveal = demo cells born after `loaderDone`.

## Phase 4 — Camera controls (just shipped)
- `lib/camera.ts`: `fitCamera` bbox+pad math, `DEFAULT_CAMERA`, Z clamps (single source; CanvasView imports same). Store: `zoomBy/fitView/resetView`. `ui/Hud.tsx`: bottom-left count+zoom caption.
- CanvasView adopts externally-set camera via `lastCommitted` reference marker → eases 18%/frame in rAF; user gestures cancel (`camTarget=null` in onDown/onWheel). Own commits route through `commitCamera()` to skip self-adoption.
- Verified exact: fit zoom+center match independent recompute; zoom buttons, reset {0,0,1}, HUD live.
- **QA note:** preview-eval harness sometimes re-executes long async scripts (inflated cell counts). App verified deterministic; write sync, self-checking assertions.

## Next task
**Phase 5 — Table sync:** `views/TableView.tsx` (TanStack + shadcn table/input/select), inline edit name/area/category/privacy, add/delete rows, same store (edits ripple to canvas automatically), switch-no-reset verification. CSV import comes with it or in P7 per queue.
