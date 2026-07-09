# Task Queue

## Phase 0 — Setup  ✅ COMPLETE (Prompt 01)
- [x] Vite React TS app
- [x] install full core stack (renderer/anim/UI/color/import-export/table + types)
- [x] React 18 → 19 (Pixi peer)
- [x] Tailwind v4 + shadcn (Base UI registry) — 22 components
- [x] copy references/docs/skills
- [x] docs/RESOURCE_INDEX.md created
- [x] MCPs connected (filesystem, memory, sequential-thinking, playwright, context7)
- [x] build passes green

## Phase 1 — Tokens + Loader  ✅ COMPLETE
- [x] design tokens
- [x] day/night themes
- [x] animated loading screen (GSAP timeline, status sequence, click-to-skip "enter canvas")
- [x] red countdown timer (000→100, --zonuert-red, tabular-nums, bottom-right)
- [x] 30% gradient mass (58vw×54vh ≈ 31%, 3-layer liquid drift)
- [x] reveal transition (clip-path wipe up, 0.9s power3.inOut)
- [x] reduced-motion fallback (instant count, 0.4s fade)

## Phase 2 — App Shell  ✅ COMPLETE
- [x] full-screen canvas shell
- [x] top-center view toggle (Motion layout thumb, wired to store)
- [x] bottom dock (add/demo/merge-slider/palette/import/export; slider→store now, rest wire P3–P7)
- [x] left rail (theme ✓ wired, blob toggle ✓ wired, fit view P4)
- [x] bottom-right zoom (buttons P4; "drag to explore" hint)
- [x] shadcn vars aliased onto ZONUERT tokens (day+night verified in browser)

## Phase 3 — Store + Cells  ✅ COMPLETE
- [x] SpaceCell type (+born spawn field, Camera type)
- [x] Zustand store (+selectedId/camera/addDemo, dev window.lab handle)
- [x] sample data (lib/demo.ts — 10-space program, ceramic palette)
- [x] scattered editorial cell layout (golden-angle scatter, sqrt area→radius)
- [x] add/select/drag cells (verified numerically via dispatched pointer events)

## Phase 4 — Pan/Zoom  ✅ COMPLETE
- [x] camera (store + live ref mirror, wheel-around-cursor, clamp 0.25–4)
- [x] drag-to-explore (pan on empty, verified)
- [x] zoom in/out (wheel + buttons, eased adoption in CanvasView)
- [x] fit/reset view (lib/camera.ts fitCamera bbox math — verified exact; rail=reset, zoom cluster=fit)
- [x] HUD (bottom-left "n spaces · zoom%", commit-driven re-renders only)

## V4.5A — Visual Resource + CAD Glass UI System  ✅ COMPLETE (docs only)
- [x] visual direction doc (V4_5_VISUAL_DIRECTION.md)
- [x] CAD toolbar system doc (V4_5_CAD_TOOLBAR_SYSTEM.md)
- [x] component library rules doc (V4_5_COMPONENT_LIBRARY_RULES.md)
- [x] glass/shader token doc (V4_5_GLASS_SHADER_TOKENS.md)
- [x] floating widget system doc (V4_5_FLOATING_WIDGET_SYSTEM.md)
- [x] canvas grid/scale system doc (V4_5_CANVAS_GRID_AND_SCALE_SYSTEM.md)
- [x] selection arc system doc (V4_5_SELECTION_ARC_SYSTEM.md)
- [x] metric text animation doc (V4_5_METRIC_TEXT_ANIMATION.md)
- [x] interaction shortcuts doc (V4_5_INTERACTION_SHORTCUTS.md)
- [x] resource links doc (V4_5_RESOURCE_LINKS.md)
- [x] Headroom/Ponytail documented (PERFORMANCE_AND_TOKEN_STRATEGY.md, CLAUDE.md, V4_5_COMPONENT_LIBRARY_RULES.md)
- [x] no UI overbuild — spec/docs only
- [x] V4.5B not started
- [x] V5 not started
- [x] reference patch complete (Palmer/Rayon/Superpower/dark-scan images integrated into docs)

## V4.5B — Master Graph + Floor System + Import Contract  ✅ COMPLETE
- [x] central graph types (src/domain/graph/types.ts — ZonuertProject + ProjectMeta/FloorNode/SpaceNode/RelationshipEdge/FlowPath/CategoryDefinition + code unions)
- [x] derived selectors (src/domain/graph/selectors.ts — 16 required + getGraphStats roll-up)
- [x] sample project (sample-project.ts — 3 floors, 24 spaces, 10 relationships, 2 flows)
- [x] floors (FloorNode + floor_id on every space + getFloorTotals; FLOOR_SYSTEM_SPEC.md)
- [x] import contract (import-contract.ts — CSV simple / XLSX 6-sheet / .zonuert future; IMPORT_TEMPLATE_SPEC.md)
- [x] AI table template prompt (AI_TEMPLATE_PROMPT.md)
- [x] bylaw future spec (BYLAW_CHECK_FUTURE_SPEC.md — hook only)
- [x] category gradients supported in data (DEFAULT_CATEGORIES, 16 codes, restrained palette)
- [x] area-left / selected-space-stats / missing-data-warnings selectors
- [x] store compatibility documented (CENTRAL_GRAPH_SCHEMA.md + adapters.ts; existing store untouched)
- [x] token saver doc (TOKEN_SAVER_SETUP.md)
- [x] build passes
- [x] no table sync yet — V5 not started

## V5 Readiness Audit  ✅ COMPLETE
- [x] verify V4.5A complete
- [x] verify V4.5B complete
- [x] verify build passes (green, ~2.3s)
- [x] local preview verified — npm run dev @ http://localhost:5173, app renders, 10 cells, no console/dev errors, V4.5B did not break UI
- [x] no-reset confirmed (view is a store field; spaces + camera separate → switch cannot reset)
- [x] area→radius path confirmed (renderer derives via lib/geometry.areaToRadius / adapters.radiusFromArea)
- [x] store already supports table sync (updateSpace / addSpace / removeSpace)
- [x] identify exact Phase 5 files (see below + HANDOFF.md)
- [x] READY TO START V5: yes
- [x] Phase 5 NOT started

### Phase 5 files likely to touch (from audit)
- NEW src/views/TableView.tsx (TanStack Table + shadcn table/input/select, edits via store actions)
- src/App.tsx (replace "Phase 5." placeholder in view === "table" branch)
- src/state/store.ts (only if adding category/privacy option lists — edits already supported)
- src/types.ts (optional, only if aligning categories to CategoryCode)
- docs/HANDOFF.md, docs/TASK_QUEUE.md · CanvasView needs NO change
- Risk: legacy SpaceCell vs graph codes — recommend editing SpaceCell directly in V5 (no store rewrite); CSV dup IDs deferred with import UI

## Phase 5 — Table View Sync  ✅ COMPLETE
- [x] separate table view (src/views/TableView.tsx, replaces App.tsx placeholder)
- [x] same Zustand store as canvas (no data duplication — reads spaces, writes via updateSpace/addSpace/removeSpace)
- [x] edit name (verified: "Lobby" → "Lobby Grand" shows on canvas)
- [x] edit area (verified: 120 → 400 m², radius grows on canvas; safe numeric draft, clamp ≥ 1)
- [x] edit category (verified: Public → Admin persists; shadcn/Base UI Select)
- [x] edit privacy (public/shared/private select, same wiring)
- [x] add/delete row (verified: 10→11→10, unique ids, selection cleared on delete)
- [x] switch canvas/table without reset (verified: camera {50,30,1.4} + 10 spaces persist both directions)
- [x] canvas drag positions persist across switch (verified via moveSpace x/y)
- [x] table edits update canvas (screenshot proof: Lobby Grand 400 m²)
- [x] import CSV — DEFERRED to Phase 7 (per phase prompt: no import UI in V5)
- [x] build passes (green; chunk-size warning only — split in perf phase)
- [x] local preview checked (http://localhost:5173, zero console errors)

## Phase 5.1 — Table/Shell Polish  ✅ COMPLETE
- [x] keep the global Canvas/Table toggle in both views
- [x] hide canvas-only rail, dock, zoom controls, and HUD in table view
- [x] preserve canvas view, shared store, camera, and table sync behavior
- [x] leave chunk splitting deferred as a separate performance task

## Phase 6A — Organism Blob Foundation  ✅ COMPLETE
- [x] blob layer exists (src/canvas/blob.ts — metaball field → d3-contour → smoothed world-space Path2D)
- [x] blob draws below cells; labels/selection stay crisp above
- [x] blob toggle works (rail button / settings.blobOn — verified on/off screenshots)
- [x] merge distance affects connectedness (dock slider 0–300; verified islands @20 vs one organism @120)
- [x] drag updates blob live (drag override feeds bodies each frame)
- [x] pan/zoom aligned (world-space path cache re-filled under camera transform — verified mid-ease)
- [x] table edits update blob through area/radius (verified 120→600 m²)
- [x] add/delete updates blob (spaces change → content key change → rebuild)
- [x] no reset issue (camera + spaces persist across table round-trip)
- [x] build passes; local preview checked (http://localhost:5173, zero console errors)
- [x] stress: 60 cells @ 61 fps with worst-case per-frame field rebuild

## Codex Workspace Setup  ✅ COMPLETE
- [x] workspace rules and agent handoff docs
- [x] safe directory and local preview docs
- [x] skill and MCP policies
- [x] lightweight visual-polish and QA skill candidates
- [x] UI/UX Pro Max documented as optional; not installed
- [x] MCP inventory checked; none added
- [x] runtime directories and protected core untouched

## Phase 6B — Venom Blob Polish  ✅ COMPLETE
- [x] morph is visibly smoother with higher capped sampling and two-pass curve polish
- [x] morph is high-contrast and solid Black by default
- [x] no pale flat stain, cloudy haze, fuzzy edge, or rough marching-square look
- [x] no pipe bridges, halos, hard outlines, or seams
- [x] Black / Graphite / Wine / Auto morph control added to existing dock palette slot
- [x] bottom panel remains compact
- [x] blob toggle, merge slider, pan/zoom, and table sync preserved
- [x] canvas controls remain hidden in table view
- [x] build passes; local preview checked at http://localhost:5173

## Phase 6B.1 — Blob Geometry Correction  ✅ COMPLETE
- [x] blob offset capped at 12% (below 20% maximum)
- [x] default offset restrained to 9.6% at slider value 120
- [x] no giant black island or accumulated far-field flooding
- [x] far cells stay separate
- [x] near cells form pairwise cubic elastic necks
- [x] exact circle arcs remove sampled contour wobble
- [x] morph color control preserved
- [x] merge slider remapped safely to a 0–20% average-radius edge gap
- [x] table sync and canvas controls preserved
- [x] build passes; local preview checked at http://localhost:5173

## Phase 6B.2 — Morph Modes + Attachment Control  ✅ COMPLETE
- [x] interrupted V6B resumed safely from current files
- [x] cellular morph mode preserved as the default liked black/cellular style
- [x] plain black morph mode added
- [x] existing Graphite, Wine, and Auto color options preserved
- [x] morph style/color sub-control added to the compact bottom panel
- [x] attachment distance control added to the compact bottom panel
- [x] Tight / Soft / Wide attachment presets added
- [x] attachment distance capped safely at 20% maximum pair average-radius gap
- [x] no giant black island in controlled far-cell preview check
- [x] bottom panel remains compact
- [x] table sync, pan/zoom, blob toggle, add/delete, and table-hidden canvas controls preserved
- [x] build passes; local preview checked at http://127.0.0.1:5173

## Phase 6C — QA / Bugfix  ✅ COMPLETE
- [x] build passes
- [x] local preview checked
- [x] loader/canvas render checked
- [x] 10-cell canvas baseline verified
- [x] pan/zoom/drag/select verified
- [x] blob toggle verified
- [x] all morph modes verified (Cellular, Plain Black, Graphite, Wine, Auto)
- [x] attachment modes verified (Tight, Soft, Wide)
- [x] Wide checked against giant-island/far-cell merge regression
- [x] table sync verified (name, area, category, privacy, add, delete)
- [x] radius/morph update after table edits verified
- [x] no reset issue verified (camera + spaces persist)
- [x] table view hides canvas-only rail/dock/zoom/HUD, including narrow viewport
- [x] 30-cell performance sanity checked
- [x] chunk warning documented/deferred
- [x] ready for V6.5 selection arc

## Phase 6D — Organism System Redesign + Morph Style Panel  ✅ COMPLETE (implementation only — Codex QA pending)
- [x] organism rebuilt as continuous per-cluster membrane field — no pairwise bridges
- [x] compact Wyvill kernels: far clusters exchange zero field energy (no global island)
- [x] contour vertices Newton-projected onto the exact iso-surface + closed Catmull-Rom splines
- [x] internal pockets/cut-ins emerge as contour holes (Cellular Reverse)
- [x] Cellular Reverse theme-inverts (black organism day / bone organism night)
- [x] Plain Black + Plain White modes (fuller silhouette, pockets culled)
- [x] Graphite / Wine / Auto kept; Auto now theme-adaptive
- [x] morph button opens compact anchored style panel (3 main + 3 extra modes)
- [x] attachment Tight/Soft/Long micro-panel; presets = base, slider = fine-tune (cap 32%)
- [x] separate organisms cannot visually kiss (foreign padding cap)
- [x] soft liquid transitions between style/attachment changes (eased membrane params)
- [x] dock stays compact; panels close on Escape/outside click
- [ ] NOT built/verified this phase (per V6D rules) — Codex: `npm run build` + full QA next

## Phase 6E — Organism Lab Shader Prototype  ✅ COMPLETE (implementation only — Codex verify pending)
- [x] isolated lab at src/experiments/organism-lab/ — main app untouched except a hidden lazy route in App.tsx (/experiments/organism-lab or /#organism-lab)
- [x] real-time implicit-field metaball renderer: raw WebGL2 fullscreen-triangle fragment shader, uniform array of nuclei (Three.js not installed → zero new deps; GLSL ports 1:1 to a Three ShaderMaterial for V6F)
- [x] continuous scalar field — clamped inverse-square kernels + attachment tension exponent + 1/d connection tail; merge/split topology emerges, never pairwise
- [x] internal voids: controlled pocket field band (Cellular Reverse) + negative/subtractive nuclei
- [x] styles kept selectable, none destructive: Cellular Reverse, Plain Black, Plain White, Graphite, Wine, Auto (+ lab day/night, auto panel tone)
- [x] full control data model wired: Organism / Nuclei / Attachment+Offset / Motion / Style+Pockets / Debug
- [x] attachment presets Tight/Soft/Long/Extreme = base tension+bias, sliders fine-tune around the base
- [x] nuclei draggable with smooth exp(-response·dt) follow; offset controls coexist (inverse-delta drag)
- [x] idle life: breathing, drift, wobble, per-nucleus phase variation — no shaking, no bounce
- [x] presets: Core, Colony, Division, Tendril, Void, Orbit, Asymmetry + randomize/reset
- [x] debug views: field bands + iso lines, nuclei rings
- [x] docs/ORGANISM_LAB_SPEC.md written (incl. Codex verify checklist)
- [ ] NOT run this phase (per V6E rules): build/dev/preview/QA — Codex: `npm run build` + open the lab route

## V6F.0 — Organism Production Integration Audit  ✅ COMPLETE (docs only)
- [x] read-only audit completed; no runtime code edited
- [x] organism lab selected as preferred production renderer direction
- [x] current production store/table/canvas data flow mapped
- [x] SpaceCell → organism nucleus mapping defined
- [x] old CanvasView/2D blob fallback rule documented
- [x] V6F.1 integration strategy documented: new production organism canvas/adaptor, lab route preserved, table unchanged, store remains source of truth
- [x] production control reduction documented
- [x] V6F.1 file list and risks documented in HANDOFF
- [x] V6F.1 not started

## V6F.0B — Production Canvas UI / Control Architecture  ✅ COMPLETE (docs only)
- [x] production canvas UI zones documented
- [x] high-emphasis bottom-dock Add Nucleus action defined
- [x] left rail, bottom dock, right inspector, floating widgets, and advanced/lab panel architecture documented
- [x] full control hierarchy and source-of-truth table documented
- [x] production / advanced / debug control split documented
- [x] Organism Lab settings preserved conceptually
- [x] style modes and future non-destructive style options documented
- [x] palette groups and gradient/highlight rules documented
- [x] library/asset recommendations documented without installing packages
- [x] site/app feature flow map documented
- [x] reference folder absence noted; no images moved or processed
- [x] runtime UI not implemented
- [x] React components, canvas renderer, store, table, import/export contracts untouched
- [x] build not run because docs-only

## V6F.0C — Reference Folder Patch  ✅ COMPLETE (docs only)
- [x] actual reference folder documented: `assets/references/01`
- [x] stale missing-folder note removed from production canvas UI docs
- [x] bottom panel, light dashboard/map widget, grey rail, dark gradient dashboard, and compact side rail interpretations documented
- [x] control architecture patched with reference-driven notes for dock grouping, compact popovers, left rail hierarchy, right inspector/sub-panels, and `+ NUCLEUS`
- [x] palette spec patched with monochrome base, surreal accent gradients, dark active buttons, muted high-end shades, and no-random-color rule
- [x] no images moved, renamed, processed, or duplicated
- [x] runtime UI not implemented
- [x] build not run by instruction

## V6F.0D — GitHub-only Coding Workflow Setup  ✅ COMPLETE
- [x] repository structure inspected without scanning protected folders
- [x] tech stack documented in root README
- [x] package manager documented as npm
- [x] root gateway files created: README, HANDOFF, TASK_QUEUE, DECISIONS, BUGS, CODEX_RULES
- [x] GitHub documented as code source of truth
- [x] Google Drive documented as not the code workflow source of truth
- [x] Codex / ChatGPT / Claude role split documented
- [x] `.gitignore` protections verified
- [x] git repository initialized locally because none existed
- [x] no remote added, no commit made, no push attempted
- [x] docs/HANDOFF, docs/TASK_QUEUE, docs/DECISIONS, and docs/BUGS synced
- [x] npm run build passed with known chunk warning
- [x] runtime UI not implemented
- [x] V6F.1 not started

## V6F.0F.3 — GitHub Push / Doc Sync  ✅ COMPLETE
- [x] remote documented as `origin`
- [x] GitHub repo documented: https://github.com/barc047-sketch/Mooorf
- [x] branch documented as `main`
- [x] GitHub documented as source of truth
- [x] Google Drive documented as not used for code workflow
- [x] `docs/GITHUB_WORKFLOW.md` created
- [x] handoff and task queue docs synced
- [x] V6F.1 not started

## V6F.1 — Production Organism Canvas Integration  ✅ COMPLETE
- [x] add production organism canvas component using SpaceCell nuclei
- [x] add SpaceCell → nucleus adapter
- [x] preserve Organism Lab route
- [x] preserve old canvas as fallback
- [x] keep table view unchanged and synced
- [x] drag nucleus → update SpaceCell x/y
- [x] table area/name edits update organism radius/label
- [x] add/delete row support organism add/remove
- [x] expose reduced controls following PRODUCTION_CANVAS_UI_SYSTEM
- [x] renderer toggle added: Organism / Classic
- [x] build passed with known chunk warning
- [x] local preview smoke checked

## V6G — QA / Stabilization  ✅ COMPLETE
- [x] full organism/classic regression pass
- [x] label overlay camera sync fixed for drag/pan/zoom without per-frame React state
- [x] WebGL fallback/lifecycle inspected; organism/classic unmount/remount verified
- [x] 31/61-space production organism stress pass
- [x] mobile/narrow viewport dock pass at 390 px; dock overflow fixed
- [x] table sync regression pass: name, area, category, privacy, add, delete, canvas return
- [x] `/experiments/organism-lab` route rechecked
- [x] build passed with known chunk warning
- [x] chunk split remains deferred unless a later performance phase prioritizes it

## V6H — Production Dock UI  ✅ COMPLETE
- [x] build the new production dock UI only after V6G stabilization
- [x] add grouped left/center/right dock structure
- [x] make `+ NUCLEUS` the high-emphasis center action wired to `addSpace()`
- [x] keep `ORG`/`CLS` renderer toggle working
- [x] keep demo add action working
- [x] add compact organism style panel with all six modes preserved
- [x] add compact attachment panel with Tight / Soft / Long
- [x] keep reach/density slider wired
- [x] add compact palette panel with Core / Surreal / Architecture / Auto
- [x] add tiny `settings.paletteMode` for UI readiness only
- [x] do not build category color mapping yet
- [x] preserve table sync and classic fallback
- [x] preserve `/experiments/organism-lab`
- [x] 390 px dock and mobile popovers fit
- [x] build passed with known chunk warning
- [x] do not start Phase 6.5 selection arc
- [x] do not start V7 floating widgets

## V6H.1 — Full Organism Control Surface  ✅ COMPLETE
- [x] typed `OrganismSettings` added to store (`settings.organism`) with `setOrganism` merge action
- [x] production resolver `src/canvas/organismProductionSettings.ts` merges DEFAULT_PARAMS + settings + reach trim with safe clamps
- [x] production defaults visually match the pre-V6H.1 stable canvas on first load
- [x] advanced floating panel `src/ui/OrganismControlPanel.tsx` with collapsible Style / Organism / Nuclei / Attachment & Offset / Motion / Pockets / Display sections
- [x] nucleus count display-only (from spaces) — no count slider creates/deletes spaces
- [x] attach modes Tight / Soft / Long / Extreme (types + dock + panel + classic blob records)
- [x] offsets (global/X/Y/radial/angular) as visual layout transform; drag delta-inverse verified numerically
- [x] motion group (timeScale/response/drift/breathing/wobble/phaseVariation) wired with idle life + world smoothing, defaults off
- [x] pockets group wired (threshold/softness)
- [x] display toggles: labels, nuclei dots; debug toggles tucked under Display: field, nuclei
- [x] resets: organism defaults / motion only / debug off — user spaces untouched
- [x] left rail rebuilt into captioned VIEW / RENDER / BUILD / PANELS / SYSTEM sections
- [x] dock: premium style/palette rows with descriptions, attach hint caption, advanced launcher; placeholders hide ≤480 px
- [x] panel closes on Escape/outside click, scrolls internally, never covers the whole canvas
- [x] no per-frame React state; canvas reads via existing subscribe/ref pattern
- [x] table sync, classic fallback, `/experiments/organism-lab`, + NUCLEUS, night mode all re-verified
- [x] 390 px and 1280 px layouts checked
- [x] build passed with known chunk warning (~637 kB)

## V6H.2 — UI Command Architecture Cleanup + Resource Prep  ✅ COMPLETE
- [x] left rail clarified as navigation/widget launcher surface
- [x] bottom dock clarified as quick creation and quick mode controls
- [x] widget panel clarified as detailed settings surface
- [x] rail renderer/demo duplication removed
- [x] dock side quick-control groups made collapsible
- [x] circular add nucleus button added as strongest center command
- [x] disabled void placeholder added without changing the space data model
- [x] saved views placeholder added without implementing snapshots
- [x] `annotationMode` added: editorial / pill / technical / hidden
- [x] editorial annotation set as default
- [x] `selectionDisplay` added: tight / halo / influence
- [x] tight selection set as default; large influence ring preserved as future mode
- [x] typed palette metadata prepared in `src/design/palettes.ts`
- [x] widget panel metadata prepared in `src/ui/panels/widgetRegistry.ts`
- [x] UI resource audit documented in `docs/UI_RESOURCE_AUDIT.md`
- [x] no packages installed
- [x] no category color mapping, final selection arc, floating widgets, export, floors, or graph migration started
- [x] build passed with known chunk warning (~640.56 kB)

## V6H.3 — Claude Premium UI Implementation  ✅ COMPLETE
- [x] design-heavy pass used V6H.2 command architecture (rail launches, dock quick controls, panel details)
- [x] no rail/dock setting duplication introduced
- [x] classic fallback and organism lab route preserved
- [x] dock: tighter premium scale, shadow, hover lift, animated group expand, palette-first right group
- [x] `+` orb: liquid/unstable hover, 50 px, still wired to `addSpace()`
- [x] void placeholder styled as future subtractive nucleus; still disabled, breaks nothing
- [x] rail: slimmer pro-tool scale, hover motion, annotate caption
- [x] panel: grip + minimize/close affordances, internal scroll kept
- [x] motion section master toggle (safe preset on / zeros off); pockets toggle deferred, documented
- [x] debug switches tucked behind Advanced debug disclosure with live dot
- [x] palette widget: nucleus shade ramps, organism field strips, gradient row, custom placeholder
- [x] annotation modes cleaned: editorial boxless (selected = red type), technical = name · area · category
- [x] selection ring stays tight (1.08×); halo/influence preserved
- [x] reduced-motion guards for lifts and liquid wobble
- [x] table sync, night mode, 390 px, lab route re-verified
- [x] build passed with known chunk warning (~645 kB)

## V6H.4 — Layout Presets / Colony Arrangement  ✅ COMPLETE
- [x] production layout preset module added (`src/canvas/layoutPresets.ts`)
- [x] presets added: Organic, Core, Colony, Division, Tendril, Orbit, Asymmetry
- [x] Void shown as disabled/future; negative/subtractive production nuclei not started
- [x] presets rearrange existing spaces only by `x/y`
- [x] ids, names, areas, categories, privacy, colors, camera, and table data preserved
- [x] store action added: `applyLayoutPreset(presetId)`
- [x] compact Layout section added to the Organism Control Surface panel
- [x] bottom dock, classic fallback, and organism lab route preserved
- [x] table name/area edit still updates canvas after preset application
- [x] 390 px dock/panel fit checked
- [x] build passed with known chunk warning (~648.63 kB)

## V6H.4B — Quick Add Cluster + Random Arrangement  ✅ COMPLETE
- [x] Random layout added to the Layout panel
- [x] Random uses fresh non-deterministic organic placement each click
- [x] Random rearranges existing spaces by `x/y` only
- [x] ids, names, areas, categories, privacy, colors, table data, and camera preserved
- [x] store action added: `addSpaces(count)`
- [x] five-dot circular dock button added near `+ NUCLEUS`
- [x] five-dot button adds 5 neutral `New Space` nuclei around current camera center
- [x] main `+` button still adds 1 nucleus
- [x] bottom dock remains centered and compact; no rail duplication
- [x] table row count and table edit -> canvas label sync checked
- [x] ORG/CLS fallback and lab route checked
- [x] 390 px dock fit checked
- [x] build passed with known chunk warning (~650.36 kB)

## V6I — Palette + Category / Privacy Mapping  ✅ COMPLETE
- [x] semantic color resolver added at `src/design/colorMapping.ts`
- [x] category controls restrained architectural hue family
- [x] unknown category strings normalize safely to Uncategorized
- [x] privacy controls tone/depth; area controls shade intensity
- [x] `paletteMode` now affects production organism global body/ground colors
- [x] organism label accents/rings use mapped nucleus colors
- [x] classic fallback canvas uses mapped fill/selection ring colors
- [x] table category cell shows a live mapped swatch
- [x] palette panel includes live program-mapping token previews
- [x] add-5, Random layout, table sync, ORG/CLS fallback, 390 px layout, and lab route checked
- [x] build passed with known chunk warning (~655.19 kB)
- [x] per-nucleus WebGL shader gradients deferred to V6K or later explicit shader phase
- [x] next is V6J saved views or the next explicit phase

## V6J — Saved Views / Design Iterations  ✅ COMPLETE
- [x] saved canvas iterations implemented from the existing `SavedCanvasSnapshot` concept
- [x] store actions added: `saveCurrentView`, `loadSavedView`, `renameSavedView`, `deleteSavedView`, `duplicateSavedView`
- [x] snapshots deep-copy spaces and camera
- [x] snapshots preserve theme, renderer mode, palette mode, layout preset, annotation mode, organism settings, morph style, attachment mode, reach, blob, and selection display
- [x] loading a saved view safely replaces spaces/camera/settings, clears selection, and restamps `born` values for smooth nucleus pop-in
- [x] compact Saved Views dock panel added with Save Current, timestamp, metadata, Load, Rename, Duplicate, and Delete
- [x] localStorage persistence added under `mooorf.savedViews.v1`
- [x] saved views capped at 20 and guarded against JSON/storage failures
- [x] table sync after loading checked
- [x] Add 5, Random, annotation modes, ORG/CLS fallback, 390 px layout, and lab route checked
- [x] build passed with known chunk warning (~663.07 kB)
- [x] next is V6K multi-layer nucleus / void shader or V6.5 selection arc by explicit choice

## Phase 6.5 — Selection Arc
- [ ] implement only from approved visual/system docs

## Phase 7 — Floating Widgets
- [ ] implement only from approved visual/system docs

## Export + QA (future scheduling)
- [ ] PNG export
- [ ] Playwright test
- [ ] build pass
- [ ] HANDOFF update
