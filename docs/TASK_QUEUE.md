# Task Queue

## Current Roadmap
- [x] V8.2C0 Canvas Performance + Contrast Reset (implementation complete; final branch verification/audit handoff)
- [x] V8.2A.1 Multi-Selection Group Drag Foundation
- [x] V8.2B Expandable Resource Registry Foundation
- [x] V8.2A Interaction Foundation
- [x] V8.1 Spatial Colour Field + Minimal Direct Editing
- [x] Tooling: compact audit stack (impact/dependency/dead-code/performance/summary contracts)
- [x] V7.3 File Intake + Canvas Interaction System (desktop/laptop/iPad)
- [x] V6K Premium Visual System + Full Control Migration
- [x] V6L Multi-Color Organism Shader + Negative Nuclei
- [x] V6M Codex Workflow OS
- [x] V6M.1 Ponytail Enforcement Patch
- [x] V6LQ Shader / Void QA
- [x] V6.5 Selection Arc + Canvas Rename
- [x] V6N Interface Density / Editorial Glass Refinement
- [x] V6N.1 Reference-Locked Premium Design System
- [x] V6N.2 Reference-Applied UI Polish
- [x] V6N.3 Premium Primitives + Moving Cell Border
- [x] V7.0 Spatial Intelligence System + Project Pulse Flagship
- [x] V7.0B Liquid Glass Shell Correction
- [x] V7.1 Spatial Intelligence Widget Family
- [x] V7.1B Adaptive Instrument Geometry + Interface Polish
- [x] V7.1Q Independent QA + Stabilization (V7.0–V7.1B; no defects, no fixes)
- [x] V7.1C Continuous Interface Scale slider
- [x] V7.1D Independent Widget Scale (desktop/laptop/iPad)
- [x] V7.2 Export & Presentation Pack (desktop/laptop/iPad)

## V8.2C0 — Canvas Performance + Contrast Reset

- [x] rAF/coalesced pointer scheduling for pan, wheel zoom, single drag, and group drag in Classic/Organism
- [x] renderer-local preview; one pointer-up store/history transaction; zero/sub-threshold movement ignored
- [x] Screen/Adaptive/World label scale and shared label/editor/radial projection
- [x] deterministic Auto/Black/White/Custom contrast with 0.36 luminance threshold and export parity
- [x] semantic UI text tokens on controlled light/dark glass surfaces
- [x] project-level Cell Shadow Off/Soft/Defined contract, default Off, export inclusion, Fast fallback, geometry invariance
- [x] stable first-frame glass, no blur animation, WebKit prefix, no UI shadow on touched surfaces
- [x] focus-vs-mount widget lifecycle; 140ms first open and immediate refocus with stable position/state
- [x] plain startup: Morph off, Motion off, screen labels, Auto Contrast, Cell Shadow off
- [x] projected-cell-centre radial with adaptive edge layout and no centre/background object
- [x] existing snapshots/project/config/recovery/export paths extended with safe legacy migration
- [x] focused contract file and <=20-check 1440/1280 manual QA sheet
- [ ] Antigravity broad reference delta, multi-viewport, performance, export, deployment, and security audit
- [ ] deferred: future shell/drawer/docks/rails, resource browsers, Data/Dashboard, export queue, background references, touch layouts, 200+ renderer

## V8.2A.1 — Multi-Selection Group Drag Foundation  ✅ IMPLEMENTED

- [x] shared original-position group translation contract for Classic and Organism
- [x] unselected drag replaces selection; selected-member drag preserves the group and makes that member primary
- [x] one primary-derived delta preserves every valid member's relative offset without resize/re-layout
- [x] coordinated store preview plus one bounded undo/redo transform transaction at pointer-up
- [x] stale, duplicate, deleted, zero-motion, and non-finite transform inputs are safe
- [x] focused group/selection/context/editor/geometry/palette/resource contracts
- [ ] Antigravity broad browser and performance audit of the pushed branch
- [ ] deferred: marquee/lasso, scale, rotate, alignment, persistent grouping, transform UI, keyboard movement, iPad context gestures

## V8.2B — Expandable Resource Registry Foundation  ✅ IMPLEMENTED

- [x] canonical serializable material registry and palette-backed collections; Editorial Aurora preserved
- [x] 14 material targets, renderer/performance/source/licence metadata, and explicit export fallback policy
- [x] parameter schema/normalization for colour, number/range/angle/percentage, boolean, enum, gradient, and texture references
- [x] compatibility adapter preserves current Category/Privacy/explicit/uncategorized/void colour output
- [x] dotted/fine-line/technical/architectural/major-minor/isometric/radial/none grid registry and legacy boolean migration
- [x] 18 truthful future annotation definitions; no fake canvas tools
- [x] icon metadata and placement contracts; uploaded assets remain `asset:` references, never raw data
- [x] read-only resource catalogue for ID/category/target/search/status and favourites/recent-ready IDs
- [x] nested project/config/saved-view persistence with safe defaults, future-version rejection, and no registry-object duplication
- [x] export manifest resource metadata plus per-material fallback declarations; existing export rendering unchanged
- [x] focused material/grid/annotation/icon/resource/palette/project/config/export contracts
- [ ] Antigravity broad audit of the pushed V8.2B branch
- [ ] Claude prototype review before Material Browser, circular shelf, Grid Shelf, Icon Library, Annotation Studio, or Tools UI

## V8.2A — Interaction Foundation  ✅ IMPLEMENTED

- [x] canonical store-owned tool, temporary-tool, context, primary-selection, and ordered multi-selection state
- [x] synchronized `selectedId` compatibility plus delete/import/load recovery invariants
- [x] normal replace, Alt/Option/Shift toggle, blank clear, Escape ordering, and Cmd/Ctrl+A visible select-all
- [x] shared selection contract in Classic and Organism; selected drag preserves the group and moves one primary object
- [x] registry-driven blank Base UI dropdown with working Space/Void/Import/View and truthful disabled future entries
- [x] eight-button object radial with adaptive viewport-clamped geometry and a transparent empty centre
- [x] working Edit/Materials/Duplicate/Delete commands through existing editor/widget/store paths
- [x] canonical context action registry, tool registry, command executor, radial layout, and root context-surface host
- [x] focused interaction contracts and directly affected V8.1 contracts
- [x] compact audit summary and one final production build (886.89 kB main entry; known chunk warning only)
- [x] `git diff --check`
- [ ] Antigravity broad multi-viewport/browser/export/performance audit
- [ ] deferred: marquee, iPad long-press/two-finger context, material shelf, detailed Tools page, future tool/product actions

## Tooling — Compact Audit Stack  ✅ COMPLETE
- [x] compact impact grouping with safe base-revision validation
- [x] dependency-cruiser circular/orphan capture and Knip production dead-code capture
- [x] production entry-size budget capture from the final Vite build
- [x] JSON artifacts plus Markdown summary capped at 120 lines
- [x] focused tooling contracts, one production build, and `git diff --check` green
- [x] exhaustive findings/regression/deployment/performance/security audit handed to Antigravity

## V7.3 — File Intake + Canvas Interaction System  ✅ COMPLETE
- [x] selection orbit/arc, halo/influence state/control/CSS/export marks removed; moving keyline + metadata/edit preserved
- [x] real readiness numeral milestones 00→16→34→58→82→96→100, reduced motion, no replay
- [x] canonical explicit/category/palette/stable-ID resolver shared by ORG/CLS/SVG/export
- [x] global file drag-depth overlay + one five-item File Intake widget/queue
- [x] `.mooorf` and `.mooorf-config.json` download/validate/preview/atomic apply/recovery/Undo
- [x] V7.2 project JSON recognition; future schema/unsafe key/non-finite/binary/presentation rejection
- [x] CSV/XLS/XLSX worksheets, header detection, aliases, manual mapping, preview, diagnostics, replace/merge/append
- [x] truthful queued/reading/parsing/validating/review/applying/complete/failed progress semantics
- [x] restrained Motion dock magnification with adjacent/focus response and touch/reduced-motion safety
- [x] canonical canvas/widget/shell/popover/tooltip/drop/dialog/toast/loader z-layer tokens
- [x] all launchers focus already-open widgets without duplicate/remount/entrance replay
- [x] V7.2 capture/export architecture preserved; CSV adds explicit color column
- [x] contracts + build + 1440/1024/768 live QA green; browser harness cannot attach local files

## V7.2 — Export & Presentation Pack  ✅ COMPLETE
- [x] activate existing Dock Export placeholder → Export widget (no duplicate launcher)
- [x] PNG: 1×/2×/4×, theme/white/transparent background, labels include/exclude, selection clean/include, tight/standard/wide padding
- [x] PDF: A4/A3, landscape/portrait, optional title + area/count/date metadata footer via pdf-lib
- [x] CSV: id/name/area/category/privacy/kind/x/y via PapaParse unparse
- [x] JSON: versioned snapshot reusing the SavedCanvasSnapshot field set (no second schema)
- [x] ZIP presentation pack: canvas.png + presentation.pdf + spaces.csv + project.json + manifest.json, one shared capture reused
- [x] SVG: true vector for Classic (circles/text); Organism truthfully reported unavailable; blob/membrane merge layer documented as omitted
- [x] renderer-aware capture bridge; Classic pure re-render, Organism synchronous same-tick WebGL capture + html-to-image label layer, DOM-filtered command menu/edit form/selection
- [x] Interface Scale / Widget Scale verified to never affect export pixel dimensions
- [x] heavy libs (pdf-lib/jszip/file-saver/html-to-image) dynamically imported, code-split out of main chunk
- [x] contract tests (filenames/CSV/snapshot/manifest/page-layout/resolution/SVG) + build green

## V7.1D — Independent Widget Scale  ✅ COMPLETE
- [x] second Display section, identical format to Interface Scale (presets + 82–118% slider)
- [x] canonical `settings.widgetScale` + dedicated `setWidgetScale` store action; fully independent of `uiScale`
- [x] outer frame footprint = `uiScale * widgetScale` (each applied once); internal content = widgetScale only
- [x] new `--widget-scale` root token; rail/dock/canvas-controls/tooltips and Dock.tsx's shared pop-chip/org-slider unaffected
- [x] all five V7 widgets keep distinct authored geometry/aspect at every scale combination
- [x] drag-clamp safety net reused on scale-driven resize; never resets position
- [x] independent saved-view persistence/restore; legacy migration to 1.0 without disturbing uiScale
- [x] verified at 1440/1280/1024/768px; no mobile-specific work; contract tests + build green

## V7.1C — Continuous Interface Scale  ✅ COMPLETE
- [x] keep Compact 88% / Standard 100% / Comfortable 112% presets
- [x] add continuous slider 82–118%, 1% step, tabular % readout, default 100%
- [x] presets + slider drive one canonical `settings.uiScale`; no second state
- [x] custom values show no active preset + subtle "Custom" header state
- [x] reuse `SliderRow` primitive (added optional `aria-valuetext`) and `normalizeUiScale`
- [x] custom values persist and restore exactly from saved views; legacy → 1.0
- [x] mobile renders at 100% but preserves stored preference + slider readout
- [x] a11y: aria-valuemin/max/now/text, arrows + Home/End, preset pressed state
- [x] canvas coordinates/radii unchanged; contract tests + build green; 390px no overflow

## V7.1B — Adaptive Instrument Geometry + Interface Polish  ✅ COMPLETE
- [x] semantic registry geometry variants with authored width/minimum/height intent
- [x] V7 shapes: Project Pulse large; Category Mix rail-horizontal; Privacy Balance horizontal; Area Leaders rail-vertical; Data Health vertical
- [x] existing mobile `<=640px` sheet override wins over every geometry
- [x] canonical registry icons reused by rail, Instruments submenu, and one-line WidgetFrame headers
- [x] Display Interface Scale presets: Compact 88%, Standard 100%, Comfortable 112%
- [x] one normalized store-owned `uiScale`; root tokens/chrome only; mobile clamps to 100%
- [x] saved-view persistence and old-snapshot migration to 1.0; canvas coordinates/radii unchanged
- [x] editorial/technical labels fully unbounded; Pill and selected/edit glass preserved
- [x] existing loader refactored to first usable WebGL/Classic paint with anti-flash floor and safety exit
- [x] contract tests + build green; focused desktop/mobile/renderer/sync/stress QA green
- [x] Terra V7.1Q reviews V7.0 + V7.0B + V7.1 + V7.1B together (no defects found)

## V7.1 — Spatial Intelligence Widget Family  ✅ COMPLETE
- [x] pure `selectCategoryMix`, `selectPrivacyBalance`, `selectAreaLeaders`, and `selectDataHealth` APIs with dependency-free malformed/empty/void edge tests
- [x] additive program area excludes voids; invalid values remain finite and surface as deterministic health evidence
- [x] Category Mix ships top-six + Other with category-token colors, m², share, and counts
- [x] Privacy Balance ships public/shared/private/unknown evidence plus service-category context; no invented thresholds
- [x] Area Leaders ships selectable top-five valid program spaces via the existing `select` action
- [x] Data Health ships blocking numeric vs attention metadata signals and reuses the existing table/view flow
- [x] one rail Stats launcher retained; Project Pulse Instruments popover opens all four independent WidgetFrames
- [x] shared `RankedMetricRow` and `HealthSignal` primitives; no chart package, dashboard, manager, metric state, shader, or store rewrite
- [x] stable Zustand pattern: select `spaces`, derive with `useMemo`
- [x] build green; main bundle 733.00 kB, below the ~750 kB review threshold
- [x] focused live QA: four launch paths/coexistence, add/add-five/void, table edits, ranking selection, Open Table, Random, saved restore, themes, 390 px, ORG/CLS, lab route, console and finite-output checks
- [x] Terra V7.1Q combined live QA/fixes handoff after V7.1B (QA passed, no fixes)

## V7.0B — Liquid Glass Shell Correction  ✅ COMPLETE
- [x] shared day/night glass surfaces are translucent with 32px blur, saturation, edge light, layered/contact shadows, WebKit support, and unsupported-filter fallback
- [x] focused/background WidgetFrame depth comes from existing `openWidgets` order through `data-depth`; no second z-index manager
- [x] overlapping widgets show canvas and lower panels while preserving readable text
- [x] dock outer rectangle removed; left/right controls are independent glass islands
- [x] Add and Add-5 are plain near-black circles; Void remains hollow/subtractive; MovingBorder is not used in the dock
- [x] rail is 42px icon-only with concise glass tooltips, ARIA labels, keyboard focus, and reduced separators
- [x] shared widget header/body/row density tightened; Project Pulse hierarchy and selectors untouched
- [x] future V7 widgets locked to corrected primitives in design/component docs
- [x] no dependencies, product state, shader, graph, table, saved-view, or selector changes
- [x] build passes with known chunk warning; focused desktop/mobile live QA complete

## V7.0 — Spatial Intelligence System + Project Pulse Flagship  ✅ COMPLETE
- [x] `docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md` defines purpose, hierarchy, widget family, visual grammar, metric formatting, data-color rules, compact/expanded behavior, empty/error states, selector ownership, graph/floor future integration, and Sol guidance
- [x] pure selectors added at `src/domain/stats/selectors.ts` over store-owned `SpaceCell[]` — no duplicated metric state anywhere
- [x] voids counted separately and excluded from programmed area
- [x] non-finite/non-positive areas read 0 m² and surface via `missingAreaCount`
- [x] unknown categories fall back safely through `getCategoryToken`
- [x] Project Pulse implemented from shared primitives (`MetricReadout`, `MicroDistribution`, `InsightRow`) inside the existing `WidgetFrame`
- [x] content: total program, space count, void count, program-mix band + legend, openness balance, largest space, dominant category
- [x] elegant dormant empty state for zero-space projects
- [x] `WidgetId` + `WIDGET_DEFS` + rail Stats launcher + registry entry (live)
- [x] table/canvas edits, add 1/add 5, saved-view load, Random/layout neutrality preview-verified
- [x] drag/minimize/close/z-order/Escape/mobile sheet inherited from WidgetFrame and verified
- [x] day/night premium, 390 px sheet, ORG/CLS, lab route, zero console warnings, no red chrome
- [x] build passes with known chunk warning
- [x] only the flagship shipped — no dashboard page, no other family widgets

## V6N.3 — Premium Primitives + Moving Cell Border  ✅ COMPLETE
- [x] checked for existing `moving-border` primitive; none existed
- [x] added reusable `src/ui/primitives/MovingBorder.tsx` + CSS
- [x] primitive supports radius, border width, gradient width, duration, colors, circle mode, children, className, and reduced-motion safety
- [x] selected/edit-active organism nuclei use the moving border through the existing label overlay
- [x] moving border is not rendered for every cell and does not create duplicate selection state
- [x] void selection uses hollow/subtractive moving border styling
- [x] selection arc refined thinner with smaller endpoint dots, quieter leader, and compact metadata chip
- [x] shared glass tokens strengthened for edge light, grain, instrument track/thumb/halo
- [x] WidgetFrame, dock, rail, popovers, saved cards, palette cards, sliders, switches, chips, and layout cards inherit upgraded primitive language
- [x] no product data, shader, table, saved-view, package, classic fallback, or lab-route rewrite
- [x] build passes with known chunk warning
- [x] preview QA: app render, selection border, edit popover, widgets, ORG/CLS, table/canvas switch, lab route, 390 px no overflow

## V6N.2 — Reference-Applied UI Polish  ✅ COMPLETE
- [x] selection arc thinned with leader line, anchor dot, and quieter shadows/animations
- [x] radial selection command menu integrated and polished (rename/area/duplicate/convert/focus/delete via existing store actions)
- [x] edit popover restyled as glass instrument (inset inputs, ghost cancel, ink save)
- [x] technical grid converted to camera-synced dot matrix in both themes
- [x] canvas labels: lighter borders, more blur, tighter editorial halos, tabular meta
- [x] dock lightened; orbs refined; void button reads hollow/subtractive
- [x] rail slimmed with faded dividers and softer shadow
- [x] sliders 1.5px hairline tracks, 9px thumbs; switches inset with shadowed thumbs
- [x] saved-view cards are bento glass tiles with status dot and tabular meta chips
- [x] widget head strip highlight, finer grips, softer dividers, minimized chip styling
- [x] tokens: blur 22px, saturate 150%, dot-grid retuned
- [x] no red UI chrome anywhere; neutral graphite/pearl/bone throughout
- [x] preview QA: selection/edit/menu, table sync, toggles, saved views, ORG/CLS, lab route, 390 px
- [x] build passes with known chunk warning

## V6N.1 — Reference-Locked Premium Design System  ✅ COMPLETE
- [x] `docs/V6N_REFERENCE_STYLE_LOCK.md` added as the canonical reference grammar
- [x] docs clarify references are mood/structure/style grammar only, not layouts to copy
- [x] reference standard covers dark scientific HUD, light frosted dashboard, spatial glass, cinematic overlay, architecture translation, selection arcs, typography, density, color/chrome, data cards, and future widgets
- [x] `docs/DESIGN_SYSTEM_MEMORY.md` strengthened with the Reference-Locked Visual Standard
- [x] `docs/COMPONENT_INVENTORY.md` strengthened with the Premium Primitive Rule
- [x] `docs/DESIGN_UI_UPGRADE_V6K.md` and `docs/V6N_GLASS_EDITORIAL_DIRECTION.md` now point to the style lock
- [x] shared tokens refined for glass dark/light, border, inner highlight, blur, shadow, card/pill radius, HUD/muted text, dot grid, selection arc neutral, and warning-data color
- [x] widget, dock, rail, micro-card, saved-view, palette, and selection/edit overlay CSS now reuse more shared tokens
- [x] no product feature, state, renderer, shader, table, saved-view, or package changes
- [x] build passes with known chunk warning

## V6N — Interface Density / Editorial Glass Refinement  ✅ COMPLETE
- [x] neutral smoke/ink/stone chrome replaces red rail/dock/widget/slider/chip/selection accents
- [x] shared glass/chrome tokens added in `src/styles/tokens.css`
- [x] dock/rail/widget density tightened without redesigning command ownership
- [x] widget glass and palette/saved-view surfaces refined through existing CSS/classes
- [x] selection arc redesigned smaller and calmer in the existing organism label overlay
- [x] void selection keeps hollow/subtractive language without red/dashed chaos
- [x] label text shadow toggle added to Annotation via existing `annotationDetail`
- [x] camera-aware morph toggle added to Organism via existing `organism` settings
- [x] saved views preserve both toggles through existing snapshot paths
- [x] classic fallback selection tick moved to neutral chrome
- [x] docs/V6N_GLASS_EDITORIAL_DIRECTION.md added
- [x] build passes with known chunk warning

## V6.5 — Selection Arc + Canvas Rename  ✅ COMPLETE
- [x] selected organism nuclei show compact editorial selection arc
- [x] tight selection remains default; halo and influence modes scale the ring/arc
- [x] selected metadata shows name, area m², and category/type
- [x] direct canvas rename implemented from selected arc Edit chip
- [x] safe canvas area edit implemented in the same popover
- [x] edits write through existing `updateSpace` store action
- [x] empty names fall back to `Untitled Space`
- [x] area edits clamp to at least 1 m²
- [x] void nuclei use hollow/dashed/subtractive selection styling
- [x] void rename and area edit work
- [x] hidden annotation mode hides ordinary labels but keeps selected edit arc reachable
- [x] table reflects canvas rename/area edits
- [x] saved views preserve loaded renamed/area-edited spaces
- [x] ORG/CLS fallback round-trip preserved
- [x] `/experiments/organism-lab` route opens
- [x] 390 px mobile dock/arc fit checked with no horizontal overflow
- [x] build passes with known chunk warning

## V6LQ — Shader / Void QA  ✅ COMPLETE
- [x] build passed with known chunk warning
- [x] V6L void add/edit/table/saved-view/layout preservation paths inspected
- [x] shader signed-strength contribution and multi-color uniforms inspected
- [x] classic hollow/dashed void fallback inspected
- [x] 96-nucleus cap documentation verified
- [x] no code fixes needed

## V6M — Codex Workflow OS  ✅ COMPLETE
- [x] `docs/CODEX_PHASE_PROTOCOL.md` added as the standard Codex phase loop
- [x] `docs/PROJECT_MEMORY_INDEX.md` added as compact project-state index
- [x] `docs/FEATURE_MAP.md` added as feature-to-file/doc/risk map
- [x] `docs/PROMPT_RULES.md` added for concise future phase prompts
- [x] `docs/NEXT_PHASES.md` added as living roadmap
- [x] `docs/COMPONENT_INVENTORY.md` added for reusable UI/component ownership
- [x] `docs/DESIGN_SYSTEM_MEMORY.md` added for aesthetic constraints
- [x] `scripts/repo-health.mjs` added with `npm run repo:health`
- [x] Future prompts should reference `PROJECT_MEMORY_INDEX` and `FEATURE_MAP`
- [x] Runtime/product code untouched

## V6M.1 — Ponytail Enforcement Patch  ✅ COMPLETE
- [x] Ponytail Reuse Check added as mandatory workflow protocol
- [x] Future prompts must include Ponytail checklist
- [x] Component inventory marked as first UI/control reuse reference
- [x] CODEX_RULES compact Ponytail rule added
- [x] Handoff/final report fields updated: reused, adapted, new files justified, duplication avoided
- [x] Docs-only; runtime/product code untouched

## V6L — Multi-Color Organism Shader + Negative Nuclei  ✅ COMPLETE
- [x] optional `SpaceCell.kind` added for normal/void nuclei with old snapshot compatibility
- [x] dock void button enabled and wired to store-owned `addVoid()`
- [x] production shader receives negative strength for voids and clamps signed field contribution
- [x] body A/body B/accent/ground/color-mix uniforms added for restrained multi-color organism blending
- [x] category/privacy/area-informed CPU color mixing feeds the organism membrane
- [x] staged organism gradient palettes enabled through the V6L two-color shader path
- [x] render cap raised to 96 nuclei; store/canvas data remains unlimited
- [x] classic fallback renders void as hollow/dashed and excludes voids from additive blob body
- [x] table rows show space/void type and preserve rename/area/category/privacy editing
- [x] saved views preserve void state through `kind`
- [x] docs/ORGANISM_ENGINE_LIMITS.md added
- [x] build passes with known chunk warning

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

## V6K — Premium Visual System + Full Control Migration  ✅ COMPLETE
- [x] floating widget system: `WidgetHost`/`WidgetFrame` + `openWidgets` store state (order = z-order)
- [x] seven widgets: Annotation, Organism, Layout, Palette, Saved Views, Display, Advanced
- [x] widgets draggable / minimizable / closable / scrollable / magnetic snap / Escape close / mobile sheet fallback
- [x] rail rebuilt as launchers only (view/build/note/organism/color/layout/saved/display/system)
- [x] dock tightened; Random arrangement added; saved-views popover → widget launcher; "All palettes →" hand-off
- [x] `OrganismControlPanel.tsx` deleted; shared metadata in `src/ui/controlMeta.ts`
- [x] 12 nucleus palette families (functional ramp tint of category mapping) + 12 organism palettes (9 solid functional, 3 gradient staged)
- [x] `nucleusPaletteId` / `organismPaletteId` settings, snapshot-persisted as optional fields
- [x] annotation detail: text scale, show name/area/category, position modes, bounding box
- [x] selection ring default tightened; influence behind advanced disclosure
- [x] `showGrid` camera-synced technical grid
- [x] premium tokens + custom range inputs + tighter dock/rail
- [x] preserved: table sync, saved views, classic fallback, organism mode, lab route
- [x] build passed with known chunk warning (~673.75 kB); preview QA zero console errors
- [x] next: multi-color organism shader phase or V6.5 selection arc by explicit choice

## Phase 6.5 — Selection Arc
- [ ] implement only from approved visual/system docs

## Phase 7 — Floating Widgets
- [ ] implement only from approved visual/system docs

## Export + QA (future scheduling)
- [ ] PNG export
- [ ] Playwright test
- [ ] build pass
- [ ] HANDOFF update
