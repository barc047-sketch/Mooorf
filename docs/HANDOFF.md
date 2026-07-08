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
- reused existing?
- used library first?
- avoided unnecessary custom code?

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
Prompt 03 execution: **Phases 1–4 COMPLETE**. **V4.5A COMPLETE** (docs, incl. reference patch). **V4.5B COMPLETE** (master graph domain layer). **V5 Readiness Audit COMPLETE**. **Phase 5 Table Sync COMPLETE**. **Phase 5.1 Table/Shell Polish COMPLETE**. **Phase 6A Organism Blob Foundation COMPLETE**. **Codex Workspace Setup COMPLETE**. **Phase 6B Visual Polish COMPLETE**. **Phase 6B.1 Blob Geometry Correction COMPLETE** (verified live). **Phase 6B.2 Morph Modes + Attachment Control COMPLETE**. **Phase 6C QA / Bugfix COMPLETE**. **Phase 6D Organism System Redesign + Morph Style Panel COMPLETE** (implementation only). **Phase 6E Organism Lab Shader Prototype COMPLETE** (implementation only). **V6F.0 Organism Production Integration Audit COMPLETE** (docs only). **V6F.0B Production Canvas UI / Control Architecture COMPLETE** (docs only). **V6F.0C Reference Folder Patch COMPLETE** (docs only). **V6F.0D GitHub-only Coding Workflow Setup COMPLETE**. **V6F.0F.3 GitHub Push / Doc Sync COMPLETE**. **V6F.1 Production Organism Canvas Integration COMPLETE**. **V6G QA / Stabilization COMPLETE**. Next: **V6H Production Dock UI**. Old canvas remains fallback. Phase 6.5 Selection Arc and V7 remain not started.

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
