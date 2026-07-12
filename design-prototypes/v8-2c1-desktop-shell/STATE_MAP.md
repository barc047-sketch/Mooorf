# V2 State Map

Every interactive state in this prototype, keyed to the DOM attribute or
class that drives it. Cross-reference `docs/V8_2C1_INTERACTION_STATE_MATRIX.md`
for the fuller state-by-surface table.

## Body-level attributes

| Attribute | Values | Drives |
|---|---|---|
| `data-mode` | `day` \| `night` | full colour token swap |
| `data-workspace` | `canvas` \| `data` \| `dashboard` | which workspace is visible; stage/ws-body cross-fade |
| `data-dock` | `collapsed` \| `expanded` | beginner 3-button vs full 6-tool dock |
| `data-inspector-pinned` | `true` \| `false` | inspector pushes vs floats over canvas |
| `data-rail-context` | rail item key | which subrail content is mounted |
| `data-tool` | active dock tool | cursor/canvas affordance |
| `data-cell-shadow` | `off` \| `soft` \| `defined` | Canvas cell shadow filter |
| `data-drawer` | `open` \| `""` | dims subrail/workspace/shell behind the Project Drawer |
| `data-dash-mode` | `light` \| `dark` | Dashboard workspace cinematic mode |

## Canvas object states

- **default** — plain fill, no ring, no shadow (unless Cell Shadow is on).
- **selected** — dashed ring + centre cross (`.cell.selected`), inspector +
  material rail mount, common rail mounts.
- **dragging** — `moved=true` in the pointer handler; position updates live,
  no history entry until pointerup.
- **locked** — dimmed via inspector "Locked" toggle (visual only in this lab).
- **void** — dashed outline, transparent fill (`.cell.is-void`).
- **morph-field** — subtle blur/saturate applied when Quick View → Morph is on.

## Object radial (empty centre)

`#radial` idle → `.open` (8 buttons fly to `--tx/--ty` with per-button
`--d` stagger, pointer-events suppressed ~460ms) → `.closing` (collapse back
to centre) → hidden. Edge-clamped inside a 60px margin (100px from the
bottom for dock clearance).

## Blank canvas menu

`#ctx-blank` hidden → positioned + populated → visible. Closes on any
outside pointerdown or Escape. Never shares markup with the radial.

## Project Drawer

`#project-drawer` hidden → `.open` (translateY 0, opacity 1) with
`#drawer-scrim` `.show` in lockstep. Section switch via `.dn.active`
re-renders `#drawer-content` only. Escape and scrim-click both call
`closeDrawer()`. Body gets `data-drawer="open"` for the defocus rule.

## Bottom docks

Collapsed (`data-dock="collapsed"`): only `.dk.always`-less buttons hidden,
leaving Select/`+ Space`/Present visible per the beginner 3-button spec.
Any dock button click sets `data-dock="expanded"` and marks that button
`.active`, which drives `renderCommonRail()`.

## Common context rail

Mounts (`#common-rail` not `[hidden]`) whenever a cell is selected OR a
non-`select` dock tool is active. Content is fully replaced per mode
(`space` / `void` / `materials` / `arrange` / `connect` / `markup` /
`present` / multi-select fallback) — one rail, one surface, never stacked.

## Material rail + inspector

Both mount together on selection (`S.primary` set) and unmount together on
deselect. Material rail: hover computes gaussian magnification per swatch
(`magnify()`), click applies + records recent, right-click toggles
favourite (`.fav` + red dot). Inspector: `Advanced` section is
collapsed by default (`.insp-adv-body` without `.open`); pin icon toggles
`data-inspector-pinned`.

## Overlay panels (Template Gallery / Material Browser / Export Builder / Download Center)

Shared `.overlay-panel` class: hidden-by-default (`opacity:0`,
`translateX(10px)`, `pointer-events:none`) → `.open`. Only one call site
(`openPanel()`) toggles them, so at most the panel you asked for gains
`.open` — others are explicitly cleared first.

## Export queue

`queueExportJob()` pushes a job through
`queued → preparing → rendering → packaging → ready` on a 620ms interval
(`stepJob()`), updating the inbox badge and, if open, the Download Center
list at each stage. On `ready`, a notification card mounts in
`#notification-stack` and self-dismisses after 6s unless acted on.

## Upload / drop resolver

`dragenter` (depth-counted to survive child-element bubbling) shows
`#upload-overlay`; `drop` resolves the extension against a static map and
shows the detected action for ~1.1s before dismissing. The Add tray's
Upload button and the drawer's Open/Upload both simulate the same flow via
`showUploadOverlay(ms)`.

## Desktop-required gate

`innerWidth < 1180` on load or resize shows `#desktop-gate` and (via the
1180px media query) hides every shell region rather than attempting a
compressed layout.
