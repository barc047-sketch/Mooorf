# V8.2C1 — Manual Review

Verified live in-browser (Claude Browser pane, local static server) at all
four required viewports. Checklist per the brief §34 plus
`V8_2C0_MANUAL_QA.md`'s existing format. Every FAIL found during this pass
was fixed before this document was finalized; the "Found via" column
records what QA actually caught so this isn't a rubber stamp.

## 1440×900 / 1440×1000

| # | Check | Verdict | Found via |
|---|---|---|---|
| 1 | Initial shell renders (cells, chrome, subrail) | ✅ PASS | Fixed a crash first: `syncFloor()` referenced `#cl-floor-name`, which existed as a class but not an id in index.html — the whole script threw on load and the canvas was empty. Added the missing `id`. |
| 2 | Project cluster text doesn't overlap "Saved" badge | ✅ PASS | Was FAIL: `.cluster button` (class+element specificity) beat `.cl-name` (class-only), forcing it into the generic 26×26 icon-button box. Fixed with `.cluster button.cl-name`. |
| 3 | Project Drawer open/close, sections, cards | ✅ PASS | Verified: launcher click, `⌘K`, Escape, scrim-click, all 8 nav sections, project-card thumbnails (4 real SVG assets), favourite toggle. |
| 4 | Project Drawer background defocus | ✅ PASS | `data-drawer="open"` correctly dims subrail/workspace/shell via opacity, transform/opacity only — no blur animated. |
| 5 | Left subrail content per rail item | ✅ PASS | Verified Canvas, Data, Dashboard, Templates subrail content renders correctly. |
| 6 | Bottom docks collapsed → expanded | ✅ PASS | Beginner 3-button state confirmed; any side tool expands both docks + mounts common rail. |
| `+ Space` tray | Add tray + More sub-tray | ✅ PASS | Hold opens tray; Multiple Spaces fans out 5 cells; More opens Label/Note/Data Tag/Symbol/Panel/Frame. |
| 7 | Material rail scroll + magnification | ✅ PASS | Gaussian proximity scale confirmed on hover; click applies; right-click favourites. |
| 8 | Material Browser (half-screen) | ✅ PASS | Opens via "More"; search/category filters work; max 620px (well under 50vw at 1440). |
| 9 | Inspector pinned/floating, Advanced collapse | ✅ PASS | Pin icon toggles docking; Advanced section starts collapsed, expands on click. |
| 10 | Compact table 3 modes | ✅ PASS | Compact → Expanded → Mini cycles via header button; content matches live `S.cells`. |
| 11 | Data workspace (7 tabs, AI-fill) | ✅ PASS | Was FAIL at first check of Dashboard (see #14) for the same padding bug, confirmed also affected Data — fixed once, verified on both. Copy button genuinely writes to clipboard. |
| 12 | Dashboard workspace composition | ✅ PASS | Was FAIL: title/subrail text overlapped because `.ws-body` padding didn't reserve subrail width. Fixed via `data-subrail-open` body flag + CSS rule. |
| 13 | Dashboard dark cinematic mode | ✅ PASS | Was FAIL: dotted Total Area numeral and Data Health dots were invisible (they inherit `--ink`/text tokens, which stayed at day-mode values under the *separate* `data-dash-mode` flag). Fixed with scoped token overrides on `#ws-dashboard[data-dash-mode="dark"]`. |
| 14 | Radial: empty centre, 8 buttons, edge-clamp | ✅ PASS | Confirmed via DOM inspection and screenshot: 8 `.rb` buttons, transparent centre, no backing disc/ring. |
| 15 | Blank menu is a dropdown, never radial | ✅ PASS | Confirmed compact dropdown with icons/keycaps/submenus. |
| 16 | Overlay panels open/close (Template Gallery, Material Browser, Export Builder, Download Center) | ✅ PASS | Was FAIL: all four had a static `hidden` attribute in HTML that `openPanel()` never cleared, so `[hidden]{display:none!important}` always won regardless of the `.open` class. Removed `hidden` from all four; the existing opacity/pointer-events CSS already fully owns the closed state. |
| 17 | Overlay panel header not covered by top bar | ✅ PASS | Was FAIL: panels started at `top: var(--edge)`, same as the top clusters (z-index 70 > panel's 40), hiding the panel header. Fixed by offsetting panels to `top: calc(var(--edge) + 48px)`. |
| 18 | Export queue → Download Center → notification | ✅ PASS | Job progresses queued→…→ready on schedule; badge updates; notification card shows, Download/Inbox/Dismiss all work; 6s auto-dismiss confirmed. |
| 19 | No UI shadow on shell chrome | ✅ PASS | Only `--e1/e2/e3` soft elevation tokens (inherited from V1, already validated) — no `box-shadow` outside those tokens; Cell Shadow remains an explicit opt-in Canvas setting, off by default. |
| 20 | Stable blur from first frame | ✅ PASS | No `backdrop-filter` transitions exist anywhere in styles.css. |

## 1280×720 / 1280×800

| # | Check | Verdict | Found via |
|---|---|---|---|
| 13 | No rail/subrail/inspector collision | ✅ PASS | Was FAIL: with the dock expanded *and* the inspector open, the right dock's buttons rendered underneath the inspector panel (both anchored to the same `bottom: var(--edge)`, and inspector's width overlapped the dock's X-range at both 1280 and 1440). Root cause affected all four persistent side panels (rail, subrail, material rail, inspector) against both bottom docks, not just the one instance first spotted. Fixed by giving all four `bottom: calc(var(--edge) + var(--dock-h) + 12px)` so they stop above the dock row instead of sharing its corner. |
| 14 | Canvas remains dominant with all panels open | ✅ PASS | Safe canvas area at 1280 with subrail+material-rail+inspector open matches the geometry map's documented ~646×704px minimum; canvas remains the largest single region. |
| 15 | Inspector coverage of selected cell | ✅ PASS (after fix above) | Selected "Living" cell fully visible with its selection ring, previously partially hidden behind the dock/inspector overlap. |
| 16 | Material rail fit between inspector and canvas | ✅ PASS | 52px compressed width, no clipping. |
| 17 | Quick View icon readability on glass | ✅ PASS | Signal-dot active state remains legible at 1280. |
| 18 | Top cluster horizontal safety | ✅ PASS | Project name truncates via `max-width`+ellipsis under the 1366px query; History/Export button text hides, icons remain; no overlap observed across the full cluster row at 1280×720/800. |
| 19 | Common rail stays clear of dock buttons | ✅ PASS | Measured via `getBoundingClientRect()`: dock-left right edge 248px, common rail 390–890px, dock-right left edge 1032px — no overlap at 1280×720. |
| 20 | No mobile-style overrides visible | ✅ PASS | No sheet/bottom-drawer mobile pattern exists in this stylesheet; the only breakpoints are the 1366px compression tier and the 1180px desktop-required gate. |

## Below 1180px

Verified: `#desktop-gate` appears and every shell region (`#top`, `#rail`,
`#subrail`, `#material-rail`, `#inspector`, `.dock`, `#add-space`,
`#common-rail`, `#stage`, `.workspace`) is hidden via the
`@media (max-width: 1180px)` rule. Confirmed both on initial load at a
narrow width and via live window resize (the `resize` listener toggles the
gate without a reload).

## Console

Checked after every fix in this document: **zero console errors** in the
final state at all four resolutions.

## Summary

7 real issues found and fixed during this pass (1 load-crashing bug, 1 CSS
specificity bug, 2 dark/padding token-scoping bugs, 1 attribute/class
conflict affecting 4 panels, 1 z-order bug affecting the same 4 panels, 1
geometry collision affecting 4 side-panels × 2 docks). Zero issues remain
open. Two interaction paths (export-job Cancel, compact-table drag) were
code-reviewed but not individually screenshot-verified — see
`V8_2C1_INTERACTION_STATE_MATRIX.md` "Notes on verified vs. documented-only
behaviour."
