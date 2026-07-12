# V8.2C1 — Interaction State Matrix

Every interactive surface, its states, and the trigger/exit for each.
Companion to `design-prototypes/v8-2c1-desktop-shell/STATE_MAP.md` (DOM/CSS
detail); this table is the product-behaviour view requested by the brief.

| Surface | States | Enter trigger | Exit trigger |
|---|---|---|---|
| Project Drawer | closed → open → closed | launcher click, `⌘K` | Escape, scrim click, project selected |
| Drawer section | Projects/Templates/Files/Settings/Account/Help/Shortcuts/Commands | nav item click | another nav item click |
| Long rail item | idle → active | click, `1`/`2`/`3`/`T` | another rail item clicked |
| Subrail | closed → open → closed | rail item with content | subrail close button |
| Workspace | Canvas ↔ Data ↔ Dashboard | rail Canvas/Data/Dashboard | another workspace selected |
| Canvas object | idle → hover(tooltip only, no state change) → selected → editing | single click selects, double click edits | click blank canvas, Escape |
| Canvas object | idle → dragging | pointerdown + move >3px | pointerup (commits position) |
| Object radial | closed → opening (pointer-events off ~460ms) → open → closing → closed | right-click object | action click, Escape, outside click |
| Blank menu | closed → open → closed | right-click blank canvas | item click, Escape, outside click |
| Cell editor | closed → open → closed | double-click object, radial "Edit" | Enter/✓ commits, Escape cancels |
| Bottom docks | collapsed (3 buttons) → expanded (6 buttons + common rail) | any non-Select dock tool click | — (stays expanded; matches "beginner default, one click to full power") |
| `+ Space` | idle → held (tray open) | click adds one space; hold ~420ms opens tray | tray: outside click, item selected |
| Add tray → More tray | closed → open | "More" in Add tray | outside click, item selected |
| Common context rail | hidden → mode-specific (space/void/materials/arrange/connect/markup/present/multi) | selection changes or dock tool changes | selection cleared AND tool = Select |
| Material rail | hidden → visible | object selected or Materials tool active | selection cleared |
| Material swatch | idle → hover(magnified) → active → favourite | mouseenter computes gaussian scale; click applies; right-click toggles favourite | mouseleave resets scale |
| Inspector | hidden → visible, pinned ↔ floating | object selected; pin icon toggles docking | close icon, selection cleared |
| Inspector "Advanced" | collapsed → expanded | section header click | same click (toggle) |
| Overlay panels (4) | closed → open | respective launcher (More Materials / Templates / Export / Inbox) | close icon, Escape (global) |
| Export job | queued → preparing → rendering → packaging → ready → downloaded (or cancelled) | Export Builder "Generate" | auto-advances on a timer; user can Cancel pre-ready or Download once ready |
| Notification card | mounted → dismissed | export job reaches `ready` | Dismiss click, Download click, 6s auto-timeout |
| Upload overlay | hidden → detecting → resolved → hidden | window `dragenter`, or simulated Upload action | drop resolves after ~1.1s and self-dismisses |
| Quick View toggle | off → on | click | click again |
| Day/Night mode | day ↔ night | mode-switch click, `⇧D` | — |
| Dashboard dark mode | light ↔ dark | in-workspace toggle | — (independent of global mode) |
| Compact table widget | compact → expanded → mini → compact | header mode-cycle button | — (cycles) |
| Compact table widget | fixed position → dragged | pointerdown on header (not the mode button) | pointerup |
| Desktop-required gate | hidden → shown | `innerWidth < 1180` on load or resize | window widened past 1180px |

## Notes on verified vs. documented-only behaviour

Every row above was exercised during the manual verification pass
(`docs/V8_2C1_MANUAL_REVIEW.md`) except: Cancel on an in-flight export job,
and the compact table widget's drag repositioning, which were code-reviewed
but not screenshot-verified. Both are simple, low-risk paths (a filter on
an array; a pointer-delta position update already used identically
elsewhere in the file) and are flagged rather than silently assumed.
