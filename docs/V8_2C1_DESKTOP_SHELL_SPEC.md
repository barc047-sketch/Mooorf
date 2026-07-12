# V8.2C1 — Desktop Shell Specification

Canonical specification for `design-prototypes/v8-2c1-desktop-shell/`.
Authority order when this doc and canonical scope disagree: canonical scope
(`MOOORF_MASTER_PRODUCT_SCOPE.md` → `MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`)
wins; this doc records how the prototype interpreted that scope, not a new
decision.

## 1. Device target

1440×900 / 1440×1000 desktop, 1280×720 / 1280×800 laptop. Below 1180px width
the shell shows a full desktop-required gate rather than compressing further
(`MOOORF_REFERENCE_GEOMETRY_CORRECTIONS.md` §3).

## 2. Shell composition

```
TOP        Project Drawer launcher · Project cluster · Floor cluster ·
           History cluster · Quick View cluster · Export cluster ·
           Mode switch · Account
LEFT       Long workspace rail (14 items) + contextual subrail
CENTRE     Canvas | Data | Dashboard workspace
RIGHT      Vertical material rail + pinnable inspector
BOTTOM     Left dock + centre + Space + right dock, common context rail
           floats above them
OVERLAYS   Project Drawer (top, slide-down) · Template Gallery / Material
           Browser / Export Builder / Download Center (right, ≤50vw) ·
           Notification stack (bottom-right) · Upload overlay (full-screen)
```

Exact geometry (1440 baseline, compressed values in
`V8_2C1_1280_COMPRESSION_RULES.md`):

| Token | 1440 | Source |
|---|---|---|
| `--edge` | 12px | `MOOORF_DESKTOP_SHELL_GEOMETRY_MAP.md` §2 |
| `--rail-w` | 42px | same |
| `--subrail-w` | 220px | same |
| `--inspector-w` | 340px | same |
| `--matrail-w` | 60px | same |
| `--dock-h` | 60px | same |
| `--dock-w` | 280px (each side) | same |
| `--addspace-d` | 50px | same |
| `--common-rail-h` / `-w` | 44px / 600px | same |
| `--drawer-h` | 58–64vh | `V8_2_PROJECT_DRAWER_ARCHITECTURE.md` §1 |

## 3. Top clusters

- **Drawer launcher** — 36px circle, outlined, opens the Project Drawer.
- **Project cluster** — mark, name (menu), save state.
- **Floor cluster** — prev/next/add, current floor name.
- **History cluster** — undo/redo/history.
- **Quick View** — Morph/Motion/Grid/Labels/Full Screen/More, icon-only,
  signal-dot active state, tooltip shows label + shortcut.
- **Export cluster** — Export button (opens Export Builder) + Download
  Center inbox with a badge.
- **Account** — circular, opens the account menu (prototype: toast stub).

## 4. Long left rail + contextual subrail

Order: Canvas, Data/Table, Dashboard, Templates, Floors, Scenes, Layers,
History, Files, Commands, Shortcuts, Learn, Help, Feedback
(`MOOORF_MASTER_PRODUCT_SCOPE.md` §7). Canvas/Data/Dashboard double as the
workspace switcher. The subrail mounts beside the rail for every item with
defined content (Canvas/Data/Dashboard/Templates/Floors/Scenes/Layers/
History/Files/Commands/Shortcuts/Learn/Help/Feedback); it floats over the
Canvas (acceptable — canvas stays visible behind it) and reserves left
padding inside the Data/Dashboard workspace bodies so their content never
sits underneath it (`body[data-subrail-open="true"]` rule in styles.css).

## 5. Bottom interaction architecture

Beginner collapsed state shows only Select / `+ Space` / Present
(`data-dock="collapsed"`). Clicking any dock tool (Materials, Arrange,
Connect, Markup) expands both docks (`data-dock="expanded"`) and mounts the
common context rail above them with mode-specific content. `+ Space`
primary click adds one space near the current selection/cluster/view centre
and avoids exact overlap; holding it opens the Add tray (Space / Multiple
Spaces / Void / Upload / From Template / More → Label/Note/Data Tag/Symbol/
Panel/Frame).

## 6. Right material rail + inspector

Material rail (48–60px, vertical, scrollable) mounts whenever an object is
selected or Materials is the active dock tool; hover uses the same gaussian
proximity-magnification math as V1's horizontal shelf, ported to the Y axis.
Inspector (340px @1440 / 300px @1280) mounts with the object's Essentials /
Appearance / Behaviour / Data / Advanced sections — Advanced collapsed by
default. Pin icon toggles `data-inspector-pinned`; unpinned the inspector
gains a stronger shadow token (`--e3`) to read as floating rather than
docked (full "drag to move" is a documented [F] future item — see
`V8_2C1_PRODUCTION_MAPPING.md`).

## 7. Workspaces

- **Canvas** — plain-cell default, Quick View toggles for Morph/Motion/Grid/
  Labels, Cell Shadow off by default (`data-cell-shadow`), Auto Contrast
  resolves per `V8_2C0_AUTO_CONTRAST_CONTRACT.md` Rule 1 (implemented as
  `autoContrast()` in prototype.js, same 0.36 luminance threshold).
- **Data** — 7 tabs (Space Schedule, Relationship Matrix, Floor Summary,
  Materials, Markup Schedule, Project Metadata, Analysis Results); Space
  Schedule is a live editable table over `S.cells`; Project Metadata
  includes the Import Assistant (5-step AI-fill flow with a working
  copy-to-clipboard prompt box); a compact canvas table widget
  (`#compact-table`) floats over the Canvas workspace with 3 modes
  (Compact Rows / Expanded List / Mini Dashboard), draggable by its header.
- **Dashboard** — composed hierarchy (hero relationship graph + narrow
  supporting column + bottom metric strip), never an equal-card grid; all
  numbers derive live from `S.cells` (total area, category mix, data
  health, leaders); optional dark cinematic mode (`data-dash-mode`) is
  independent of the global day/night toggle and carries its own token
  overrides so dotted-display numerals and health dots stay legible against
  the black background.

## 8. Overlays

Template Gallery, Material Browser, Export Builder, and Download Center
share one `.overlay-panel` component: max 50vw (620px cap), positioned
below the top clusters (`top: calc(var(--edge) + 48px)` — a fix applied
during verification after the header first rendered underneath the top
bar), `openPanel()` ensures only one is `.open` at a time. The Export
Builder's Generate button queues a job (`queued → preparing → rendering →
packaging → ready`, 620ms/stage) that updates the Download Center badge and
ends in a mail-like notification card, per `V8_2_EXPORT_QUEUE_READINESS.md`.

## 9. Global Project Drawer

Top-left launcher → `#project-drawer` slides down (`transform`/`opacity`
only) to `--drawer-h` (58–64vh at 1440, 64–68vh compressed at 1280) with a
single flat scrim behind it (no nested blur) per
`V8_2_PROJECT_DRAWER_ARCHITECTURE.md` §2. Body gets `data-drawer="open"`,
which dims (not blurs) the subrail/workspace/shell at reduced opacity —
transform/opacity only, no animated blur. Left nav list (Projects/
Templates/Files/Settings/Account/Help/Shortcuts/Commands) + right
horizontal project-card scroller with original generated SVG thumbnails.
Escape and scrim-click both close it; reopening is instant (DOM stays
mounted, only classes toggle).

## 10. Upload / drop resolver

Whole-window `dragenter`/`dragover`/`drop` listeners show a full-screen
glass overlay and resolve the extension against a static map (mooorf/zip →
open project, csv/xlsx → import, png/jpg/svg/pdf/gif → reference), matching
`MOOORF_MASTER_PRODUCT_SCOPE.md` §14's resolver table. The Add tray's
Upload button and the Drawer's Open/Upload item both simulate the same
flow with a timed auto-resolve for demonstration purposes.

## 11. What this prototype does not attempt

Real ZIP/GIF encoding, real file parsing, persistence, store/graph wiring,
marquee selection, iPad/tablet layouts, rendered relationship/bridge
geometry on the Canvas (represented in inspector/common-rail language only).
See `README.md` "Known limits" and `V8_2C1_PRODUCTION_MAPPING.md` for what
each surface maps to when it eventually moves to production.
