# Active Task

## PF1D.1 — Glass Table Overlay and Canvas Chrome Transitions

**Status:** PF1D.1E COMPLETE — OWNER QA PASSED — PUSHED UNMERGED

### PF1D.1E visual stacking and animation hotfix

- **Owner verdict:** PF1D.1E PASS. Finalization is authorized on `feature/pf1d-lazy-workspaces` from source SHA `019ca3de55c93bf5f8de7f57e666eeaeddaab7ed`; merge is not authorized.
- **Exact product files:** `src/App.tsx`, `src/App.css`, and `src/runtime/pf1dContracts.test.ts`.
- **Lazy Table request evidence:** Canvas start loaded 0 TableView requests; first Table open loaded 1; repeated Canvas/Table switches loaded 0 additional requests.

- **Root cause:** Table was still nested under `.stage`, its conditional overlay used `initial={false}`, Canvas was immediately `visibility: hidden`, and Rail/Dock/widget/auxiliary motion depended on CSS-class transitions. Those transformed/opacity-owned stacking contexts made the earlier relative z-index values incomparable and suppressed reliable mount/return animation frames.
- **Shared root:** `.app-shell` is now the fixed isolated stacking root. Canvas, the conditional `AnimatePresence` Table overlay, all four permanently mounted Motion chrome wrappers, and ViewToggle are direct `.app-shell` children. Canvas is z-index 0; widgets 40; Rail/Dock/auxiliary 60; Table 90; ViewToggle 100. Existing Runtime Status, toast, Loader, and dialog ownership remains unchanged.
- **Table Motion:** the approved floating panel geometry, lazy `TableView`, local skeleton, glass appearance, and static non-blur tint remain unchanged. Panel enter is 170ms with opacity 0→1, Y 8→0, scale 0.995→1, and `[0.22, 1, 0.36, 1]`; panel exit is 100ms to opacity 0, Y 5, scale 0.997. The static scrim is immediate and the overlay exits after a 240ms hold plus 40ms fade, protecting returning Canvas/chrome for 280ms total.
- **Chrome Motion:** Rail uses 90ms opacity / 270ms X to -18px; Dock 90ms / 275ms Y to 18px; widgets 120ms / 160ms X to 24px; auxiliary 100ms / 140ms Y to 8px. Wrappers remain mounted, inert, `aria-hidden`, and pointer-disabled in Table without closing, minimizing, resetting, or duplicating state. Reduced motion is opacity-only with transforms fixed at zero.
- **Browser stacking evidence:** at 1440×900, a moved Display widget at `x=896.008`, `y=101.992`, `w=287.998`, `h=470` was covered at centre point `(1064.007, 336.992)`. `document.elementFromPoint` returned a Table `TD`, whose nearest protected owner was `.table-workspace-panel`; it never returned `.wframe` or a widget child. DOM inspection reported `.app-shell` as the direct parent of Canvas, Table, Rail, Dock, widgets, auxiliary, and ViewToggle.
- **Browser animation evidence:** panel computed values were immediate-after-mount opacity `0` / `matrix(0.995, 0, 0, 0.995, 0, 8)`, 60ms opacity `0.92817` / `matrix(0.999667, 0, 0, 0.999667, 0, 0.533481)`, and 200ms opacity `1` / `none`. At 80ms Rail was opacity `0.0299308` / X `-11.9937px`; Dock was opacity `0.0299308` / Y `11.8531px`. At 320ms they settled to opacity `0`, X `-18px` and Y `18px` respectively.
- **Browser return evidence:** at 100ms after Canvas activation, Table overlay remained opacity 1 / z-index 90 while Rail and Dock were returning at opacity `0.634912`; `elementFromPoint` at the widget centre still resolved inside `.table-workspace-panel`. At 280ms the widget wrapper was restored at z-index 40 beneath Rail/Dock z-index 60 while the overlay remained mounted. After 360ms the overlay was removed and the moved widget returned exactly to `x=896.008`, `y=101.992`. A separate minimized cycle preserved the exact minimized rect `x=976.008`, `y=101.992`, `w=207.998`, `h=36.25` before and after Table.
- **Browser health:** `http://127.0.0.1:4173/`, title `ZONUERT Canvas Lab`, meaningful Canvas/Table DOM, no Vite/framework overlay, and console errors/warnings `0`. Five screenshots were captured outside the repository for Canvas-before, Table-entry, settled Table, protected Canvas-return, and settled Canvas.
- **Focused checks:** final PF1D, PF1C, readiness, runtime-renderer integration, and Inspector-shortcut suites passed 78/78. The final `npx tsc -b --pretty false` run passed. The one permitted `npm run build` passed with exit 0: Vite transformed 2,898 modules and emitted lazy `TableView-Bet7Cgpb.js` at 45.46 kB / 15.63 kB gzip; Vite also reported its non-blocking warning for chunks above 500 kB.
- **Git closeout:** product commit `32e3a798fe0a78386bc573b0e11497cc65ea025c`; documentation commit pending until this closeout commit is created. The feature branch is pushed by the authorized finalization step and remains unmerged. PF1D.2 waits for explicit Owner GO.

- **Branch:** `feature/pf1d-lazy-workspaces`
- **Source HEAD:** `019ca3de55c93bf5f8de7f57e666eeaeddaab7ed`
- **Pre-existing PF1D dirty files:** `src/App.tsx`, `src/runtime/pf1dContracts.test.ts`, `docs/project-engine/ACTIVE_TASK.md`
- **Exact product files changed:** `src/App.tsx`, `src/App.css`, and `src/runtime/pf1dContracts.test.ts`.
- **Exact closeout records:** `docs/project-engine/ACTIVE_TASK.md`, `docs/project-engine/STATE.md`, `docs/project-engine/ROADMAP.md`, `docs/project-engine/LEDGER.md`, `docs/project-engine/REPO_MAP.md`, and `docs/project-engine/PARITY_MATRIX.md`.

### PF1D.1D restore approved Table overlay, retain static non-blur scrim

- **PF1D.1C rejection and root cause:** its always-mounted `table-workspace-shell`/`table-workspace-cover` made the Table read as a full-stage replacement rather than the approved floating workspace. That regressive geometry removed the panel hierarchy and made the intended Table-over-widget stack visually unstable.
- **Removed PF1D.1C structure:** the always-mounted shell, full-page cover, and shell data-state ownership were manually removed. No reset, checkout, restore, clean, stash, TableView, renderer, store, or ViewMode change was used.
- **Restored overlay:** Canvas remains persistently mounted beneath a conditional `table-workspace-overlay`, which owns a static `table-workspace-scrim` and a separate rounded `table-workspace-panel` containing the existing lazy `Suspense` TableView and local schedule skeleton. The panel is again a large inset floating workspace with scrolling content, translucent layered gradients, thin glass border, soft inner keyline, and no large shadow or accent.
- **Static scrim:** Day uses approximately 95%/92% bone-background coverage and Night 97%/94% charcoal-background coverage, with a quiet themed radial tint. It is pointer-blocking, applies as part of Table overlay mounting, and contains no `backdrop-filter`, `-webkit-backdrop-filter`, CSS `filter`, blur, or saturation animation.
- **Persistent paused surfaces:** Canvas is inert, `aria-hidden`, pointer-disabled, and `visibility: hidden` during Table while retaining renderer, spaces, camera, selection, history, and readiness ownership. Widgets and auxiliary controls remain mounted once, are inert/`aria-hidden`/pointer-disabled, transition away, and keep their existing instances, moved positions, and minimized state. This remains paint suppression only, not PF1D.2 render-loop pausing.
- **Explicit stack:** Canvas 0; widgets 97 (`calc(var(--z-shell) - 3)`); Rail/Dock/auxiliary 98 (`calc(var(--z-shell) - 2)`); Table overlay 99 (`calc(var(--z-shell) - 1)`); ViewToggle 100 (`var(--z-shell)`). No z-index is animated and Table overlay blocks widgets in every transition state.
- **Timing:** panel enters 120ms and exits 100ms with opacity, 6px Y, and 0.997 scale only. Widgets use 120ms opacity / 160ms right 24px; Rail 90ms / 270ms left 18px; Dock 90ms / 275ms down 18px; auxiliary 100ms / 140ms. All begin immediately. On Canvas return, declarative exit motion keeps the static scrim opaque for 230ms before its 75ms fade, with no timer, store flag, or added React state. Reduced motion removes transforms and uses 0.01ms chrome opacity.
- **PF1D.1D checks:** the corrected source contract was red against PF1D.1C structure, then green after the restoration. Requested `pf1dContracts`, `pf1cContracts`, readiness, runtime-renderer integration, and Inspector-shortcut suites passed 76/76. The one required TypeScript run passed. No production build ran.
- **PF1D.1D preview status:** `http://127.0.0.1:4173/` remains available. The in-app browser’s local-tab policy previously blocked active interaction, so console and 1440×900/1280×900 Day/Night/reduced-motion visual rechecks remain Owner-manual; no browser automation result is represented as a pass.
- **Remaining Table limit:** static cover removes live blur/compositing cost only. Canvas render-loop pause, virtualization/progressive rows, text-first editing, search, numeric area queries, sorting, preload, and theme-lag optimisation remain PF1D.2/PF1D.3 scope.

### PF1D.1D Owner recheck

1. With Organism, seven Cells, non-default pan/zoom, one widget near the Rail, and one moved/minimized centre widget, open Table and confirm the large rounded panel is above all widgets while the static scrim conceals Canvas immediately and ViewToggle remains clickable.
2. Repeat rapid Canvas → Table → Canvas at 1440×900 and 1280×900 in Day, Night, and reduced motion. Confirm Rail/Dock/widgets restore beneath the departing scrim, continuity is exact, no duplicate instances or blank flash occur, and the browser console remains clean.

### PF1D.1B zero-delay frost and stable chrome stacking

- **Owner recheck findings:** Owner observed a remaining first-frame frost delay and a temporary widget-over-Rail hierarchy inversion on Table → Canvas.
- **Root cause:** `table-workspace-frost` was a `motion.div` initialized at opacity 0, so its useful tint did not exist on the first Table frame. Animated chrome wrappers had no explicit z-index ownership, so their transform-created stacking contexts fell back to DOM order while widgets and Rail returned at different speeds.
- **Correction:** frost is now a static mounted element at its final theme-aware tint with fixed `blur(12px) saturate(1.2)`, no opacity transition, no animation, no delay, and immediate pointer interception. The Table panel remains the only animated surface: enter 120ms / exit 100ms, opacity plus 6px Y and 0.997 scale.
- **Stable hierarchy:** Canvas `var(--z-canvas)`; widget wrapper `calc(var(--z-shell) - 3)` (computed 97); Rail, Dock, and auxiliary wrappers `calc(var(--z-shell) - 2)` (computed 98); frost and Table panel `calc(var(--z-shell) - 1)` (computed 99); ViewToggle `var(--z-shell)` (computed 100); existing dialog, toast, and Loader bands remain above their established owners. Transforms never change these values.
- **Chrome timing:** Rail opacity 90ms / transform 270ms left 18px; Dock opacity 90ms / transform 275ms down 18px; widgets opacity 120ms / transform 160ms right 24px; auxiliary opacity 100ms / transform 140ms. All begin together with no delay.
- **Reduced motion:** frost remains immediate and non-animated; all chrome transitions compute to 0.01ms opacity-only with hidden transforms removed; hierarchy remains widgets 97 below Rail/Dock 98.
- **PF1D.1B checks:** added one source contract after RED confirmation; requested `pf1dContracts`, `pf1cContracts`, and readiness suites passed 74/74. The single required TypeScript run passed. No production build ran.
- **PF1D.1B browser evidence:** first Table frame showed frost opacity 1, computed z-index 99, pointer interception, fixed blur, animation none, and transition duration 0s while the panel was still mid-enter. Canvas return restored both widget instances (Display remained minimized), no frost/panel, Canvas non-inert, and all wrappers settled to opacity 1 / transform none with the required z-index hierarchy. 1440 Night and 1280 Day viewport checks remained non-blank; console errors/warnings: 0. Automated widget dragging did not reliably establish a left-Rail position, so exact moved-position continuity remains Owner-manual.

### PF1D.1B Owner recheck

1. On the first uncached Canvas → Table frame, confirm frost is already full-strength over Canvas/widgets while only the Table panel enters.
2. With one moved/minimized widget near the Rail, repeat rapid Canvas → Table → Canvas switching and confirm Rail/Dock are immediately visible and always above widgets.

### PF1D.1A timing correction

- **Root cause:** the original single `motion.section` owned both the Table panel opacity and its backdrop filter for 250ms. Frost was therefore visually delayed by the panel fade while widgets remained sharp outside the panel until their wrappers had finished leaving.
- **Correction:** the existing workspace now uses one full-viewport `table-workspace-frost` sibling below the Table panel. It mounts and intercepts pointer input in the same render as Table activation, fades opacity only over 75ms, and keeps `blur(12px) saturate(1.2)` fixed. The panel no longer owns backdrop blur.
- **Timing now:** frost 75ms opacity only; Table panel enter 150ms / exit 130ms with 7px Y and scale floor 0.995; widgets and auxiliary wrappers 160ms; Rail 270ms left 18px; Dock 275ms down 18px. No transition or animation delay is used.
- **PF1D.1A checks:** requested `pf1dContracts`, `pf1cContracts`, and readiness suites passed 73/73. The one required TypeScript run passed. No production build was run.
- **PF1D.1A browser evidence:** with Inspector and Display widgets open, Table activation produced frost at computed z-index 98, `pointer-events: auto`, and fixed `blur(12px) saturate(1.2)` while the panel was z-index 99 and ViewToggle z-index 100 / interactive. On Canvas return, frost/panel were absent, Canvas was non-inert, all four chrome wrappers were opacity 1 / transform none / non-inert, and both widgets remained mounted. Console errors/warnings: 0.

### Implemented ownership

- Canvas now has one stable `canvas-workspace` layer. `CanvasView`/`OrganismCanvasView` and the empty-Canvas hint remain mounted when Table is active; the layer becomes `aria-hidden`, inert, and non-interactive without mutating camera, selection, spaces, or renderer mode.
- Table renders conditionally in one `table-workspace-overlay` at `calc(var(--z-shell) - 1)`. A separate existing-workspace frost layer sits directly below it at `calc(var(--z-shell) - 2)`, intercepts pointer input immediately, and reaches opacity in 75ms with fixed `blur(12px) saturate(1.2)`; blur never animates. The Table panel now enters in 150ms and exits in 130ms with opacity plus only 7px Y / 0.995 scale motion.
- `ViewToggle` remains outside all hidden wrappers at `var(--z-shell)` and stayed visible and interactive above the Table overlay.
- Rail, Dock, `WidgetHost`, `QuickToggleBar`, `ZoomControls`, and `ContextSurfaceHost` remain mounted in four state-preserving wrappers. Table mode applies inert/`aria-hidden`, disables pointer interaction, and transitions Rail left 18px over 270ms, Dock down 18px over 275ms, and widgets/auxiliary controls over 160ms; Canvas return reverses those states without resetting widget lifecycle state.
- `RuntimeStatus`, Toaster, global Loader/readiness ownership, File Intake ownership, and the one global Inspector listener remain unchanged and globally mounted.
- `TableWorkspaceSkeleton` is local to `App.tsx`, uses `role="status"` and `aria-label="Loading space schedule"`, and contains a title/count rhythm, one five-column header representation, and eleven compact row representations. It never uses the global Loader.
- Reduced motion is opacity-only for the Table overlay, removes chrome transforms, reduces chrome duration to 0.01ms, and disables skeleton pulse.

### Focused evidence

- **TDD red:** the retained lazy-boundary contract passed while four new PF1D.1 ownership/skeleton/orchestration contracts failed before production changes.
- **PF1D.1 green:** 5/5 checks passed.
- **Focused regression total:** 75/75 passed across `pf1dContracts`, `pf1cContracts`, runtime renderer integration, Inspector shortcut, and readiness suites.
- **TypeScript:** the single permitted `npx tsc -b --pretty false` run passed.
- **Diff checks:** `git diff --check` passed. Dirty paths are exactly the four authorized files.

### Development QA

- **URL:** `http://127.0.0.1:4173/` (development server left running; Owner QA tab left open on Day Canvas)
- **Console:** 0 errors / warnings after Canvas → Table → Canvas, repeated switching, theme changes, viewport changes, and reduced-motion emulation.
- **TableView resource evidence:** Canvas start observed 0 TableView assets; first Table open observed 1; repeated switches remained at 1 total, therefore 0 additional loads.
- **Canvas persistence:** DOM inspection confirmed the same Canvas workspace remains present beneath Table with `aria-hidden="true"` and `inert`; it restores in place after overlay exit.
- **Overlay stacking:** computed Table z-index `99`; computed ViewToggle z-index `100`; fixed frost is layered immediately below the panel and uses `blur(12px) saturate(1.2)` without blur animation.
- **Chrome transitions:** computed hidden states were Rail `translateX(-18px)`, Dock `translateY(18px)`, widgets `translateX(24px)`, and auxiliary `translateY(8px) scale(0.992)`, all at opacity 0/inert/no pointer input. All four returned to opacity 1, transform none, and non-inert on Canvas.
- **Viewport/theme:** 1440×900 Day PASS; 1440×900 Night PASS; 1280×900 Day PASS; 1280×900 Night PASS. No blank white/black flash or overlay/widget stacking leak was observed.
- **Reduced motion:** media emulation matched `reduce`; chrome transition computed to 0.01ms and hidden transform computed to none. Emulation was reset after QA.
- **State continuity:** seven spaces, Organism rendering, one selected Cell, non-default camera pan, and two mounted widget dialogs survived repeated Canvas/Table switches. Selected Inspector context returned as `CELL / New Space`; the Display widget bounding box was unchanged.
- **Harness limitation:** scripted widget dragging and minimize controls did not produce a reliable detectable state change in this in-app browser, so exact moved/minimized-state continuity and subjective motion feel remain Owner-manual QA. The local skeleton is contract-verified but resolved too quickly for a truthful visual capture.

### Remaining PF1D.2–PF1D.6 scope

Not implemented or claimed here: Canvas render-loop pause, Table Day/Night lag correction, 300+ row virtualization, progressive row materialization, search, numeric area queries, sorting, Upload Space Schedule, Download Template, or inline import review.

### Owner QA checklist

- With at least seven spaces in Organism, select a Cell, open two widgets, move one, minimize one, and set non-default zoom/pan.
- Switch Canvas → Table and confirm the local schedule skeleton appears on the first uncached load without the fullscreen Loader, blank flash, or console issue.
- Confirm Canvas remains visible beneath the frost; Table stays above widgets; ViewToggle stays clickable; Rail/Dock/widgets/auxiliary controls exit in the specified directions.
- Switch Table → Canvas and confirm exact widget position/minimized state, camera zoom/pan, selection, renderer, and spaces return unchanged.
- Repeat Canvas → Table → Canvas → Table and confirm no additional Table module request, duplicate rows, duplicate widgets, or duplicate Inspector response to global `I`.
- Confirm subjective transition smoothness at 1440px and 1280px in Day, Night, and OS reduced-motion mode.

No `TableView`, Canvas renderer, store, `ViewMode`, schema, persistence, shell.css, widgets.css, design-token, upload, search, import-review, or project-data change occurred.
