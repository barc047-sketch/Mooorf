# V8.2C1 — V1 Reuse Matrix

V1 = `design-prototypes/v8-2-ui-system/` (commit `8170f14`, restored intact
alongside V2 in this branch). V2 = `design-prototypes/v8-2c1-desktop-shell/`.
V1 is never rewritten; V2 forks its tokens/components file-by-file.

## KEEP verbatim (copied, unchanged behaviour)

| V1 piece | File | Why |
|---|---|---|
| Colour/motion/radius token core (`--bg`, `--ink*`, `--hair*`, `--pop`, `--sheet`, `--panel`, `--signal`, `--r-*`, `--e*`, `--t-*`, `--ease-*`) | styles.css `:root` / `[data-mode="night"]` | Already matches `MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` (blur yes/shadow no/signal-dot active) and reference 06's ink-on-cream system. |
| Dotted-display type technique (`.dot`) | styles.css | Matches the hero-numeral pattern in reference 01; reused for Dashboard total area / drawer counts. |
| 7 grid-pattern classes (`.g-dotted`…`.g-radial`) + live `--g-*` vars | styles.css / prototype.js | Section 23.3 grid presets are identical in V2; no reason to redefine. |
| Object radial menu (empty-centre 8-circle geometry, edge-clamp, pointer-event suppression during fly-in) | prototype.js `openRadial`/`RADIAL_ACTIONS`, styles.css `.rb`/`#radial` | Interaction contract is unchanged in V2; this was already QA'd for the empty-centre requirement. |
| Blank-canvas dropdown pattern (`.menu`/`.mi`/keycap `kbd.key`) | styles.css/prototype.js | Same "compact conventional dropdown, never radial" rule applies to V2's canvas blank-menu. |
| Tiny cell editor (name+area inline bar) | prototype.js `openEditor`, styles.css `#cell-editor` | Direct Cell Editing contract (`COMPONENT_INVENTORY.md` → `InlineCellEditor`) is identical. |
| Mac-dock magnification math (gaussian σ44 amp.55) | prototype.js material shelf hover handler | Reused verbatim for V2's vertical material rail hover (rail is vertical, math is axis-agnostic). |
| Icon sprite defs (UI + architecture + landscape + diagram symbols) | index.html `<svg>` sprite | V2 references the same `#i-*`/`#a-*`/`#l-*`/`#d-*` symbol IDs via a shared sprite include; no icon set is redrawn. |
| Toast/tooltip system | prototype.js, styles.css `#tip`/`#toast` | Generic, reused as-is for export notifications (restyled per §14 mail-like card, new markup, same show/hide timing). |
| Knob/EQ/dotrange/numctl/vslider/xy-pad/seg control primitives | styles.css `.knob`/`.eq`/`.dotrange`/`.numctl`/`.vslider`/`.xy`/`.seg`, prototype.js `makeKnob`/`knobSVG` | Section 6/16/21/23 controls in V2 (Motion speed/intensity, Morph reach/softness, typography size/tracking) are the same primitive shapes: linear values get sliders+numeric input, only genuinely angular values (hue, gradient angle) keep the knob, per the master scope §22.4 rule V1 already followed. |

## ADAPT (same idea, new geometry/behaviour)

| V1 piece | Change for V2 | Why |
|---|---|---|
| Single left rail (icon-only, 7 items, floating capsule) | Split into **long workspace rail** (14 items: Canvas/Data/Dashboard/Templates/Floors/Scenes/Layers/History/Files/Commands/Shortcuts/Learn/Help/Feedback) + a separate **contextual subrail** panel that mounts beside it | Master scope §7/§8 requires the three-workspace switcher plus 5 more subrail contexts V1 never had. |
| Contextual quick-material shelf (bottom, horizontal, slab-less) | Rebuilt as a **vertical** right-edge material rail (48–60px) next to the inspector, scrollable, same magnification math on the Y axis | Master scope §11 and geometry map explicitly place this rail vertically beside the inspector, not floating above the dock; V1's shelf clipped at narrow widths (a known V1 bug) which the vertical rail's independent scroll avoids. |
| Studio Browser inspector column (300px, fixed) | Right inspector becomes **340px @1440 / 300px @1280**, movable/pinnable, with the universal Essentials/Appearance/Behaviour/Data/Advanced structure from master scope §12 | V1's inspector was Materials-only; V2's inspector must serve 20 object types (§12 list). |
| Single bottom dock (zoom/fit/grid/snap microbar) | Split into **left dock + centre `+ Space` + right dock + common context rail above them**, with the beginner-collapsed 3-button state | Master scope §9/§10 — V1 never had the Select/Materials/Arrange | Connect/Markup/Present split or the beginner/expanded states. |
| 8 static screens switched by top tabs | Screens become true **workspace views** (Canvas/Data/Dashboard) reached from the rail, plus **movable panels** (Material Browser, Templates, Files) reached contextually — matches master scope §5.1's anchored-floating vs. movable vs. full-workspace split, which V1 collapsed into one `.screen` pattern | V1 flattened "workspace" and "panel" into the same sheet component; V2 needs the distinction because Data/Dashboard must feel like destinations, not overlays. |
| Player disc bottom-right | Unchanged position/behaviour, becomes one component among several bottom-right floating elements (Download Center notifications also anchor bottom-right per `V8_2_EXPORT_QUEUE_READINESS.md` §4) — stacking order documented in V2 z-index ladder | Both must coexist without collision. |

## REMOVE (not carried into V2)

| V1 piece | Why removed |
|---|---|
| `.shelf`'s slab-less horizontal-only layout | Superseded by the vertical material rail; horizontal shelf clipping at narrow viewports was a known V1 bug (see V1 README "known limits" and the mid-session CSS fixes for `.mb` column overflow) that the brief explicitly says not to reuse ("Do not reuse V1's previously clipped shelf architecture"). |
| Flat 8-tab top nav (`.tabs`) as the primary navigation | Master scope has no "8 equal tabs" model; navigation is rail-owned (§7), top clusters are Project/Floor/History/Quick View/Export/Account (§6) — a fundamentally different top-bar contract. |
| Recommendation to merge prototype code into production | Both V1 and V2 stay design-lab-only per `MOOORF_MASTER_PRODUCT_SCOPE.md` §36 no-go list ("do not merge Claude prototype HTML/CSS/JS directly"). |

## REBUILD (net-new, no V1 equivalent)

Global Project Drawer, dual bottom docks + beginner/expanded state machine,
common context rail (8 modes), Data workspace (tables + AI-fill box +
compact canvas table 3 modes), Dashboard workspace (hero + support column,
dark cinematic mode), Template Gallery, whole-canvas upload/drop resolver,
Export Builder + Download Center + notification stack, Connect/Cell
Behaviour inspector panels, Project Block/A2 sheet composition, Arrange
preview tray, 1280 compression rules, desktop-required gate (<1180px).

## DEFER (documented, not built this phase)

Real ZIP/GIF encoders, real file parsing, ARIA live regions beyond static
markup, iPad/tablet layouts, marquee/lasso selection, persistence/store
wiring — consistent with V1's own "known limits" and the brief's explicit
prototype-only UI scope.
