# MOOORF V8.2C1 — Desktop Studio Shell Lab

Canonical desktop shell prototype: Global Project Drawer, long left rail +
contextual subrail, dual bottom docks + centre `+ Space` + common context
rail, vertical material rail + pinnable inspector, Canvas / Data / Dashboard
workspaces, Template Gallery, whole-canvas upload resolver, Export Builder +
Download Center + notification stack.

**This is a design lab, not production code.** It touches no `src/`, no
store, no renderer, no packages. See `docs/V8_2C1_DESKTOP_SHELL_SPEC.md` for
the full specification and `docs/V8_2C1_PRODUCTION_MAPPING.md` for what each
surface maps to in production.

V1 (`design-prototypes/v8-2-ui-system/`) remains untouched alongside this
prototype as a historical reference — see `docs/V8_2C1_V1_REUSE_MATRIX.md`
for what was kept, adapted, removed, or rebuilt.

## Run

Open `index.html` directly in any modern browser. No build step, no server,
no dependencies.

```
index.html     shell markup + inline SVG glyph sprite
styles.css     token system + every component family
prototype.js   interaction engine (plain JS, one IIFE)
assets/        4 original abstract SVG project-preview placeholders
```

Target viewport: **1440 and 1280 desktop/laptop only.** Below 1180px width
the shell shows a desktop-required gate instead of compressing further.

## Shell map

| Region | Entry |
|---|---|
| Global Project Drawer | top-left circular launcher · `⌘K` |
| Long left rail (Canvas/Data/Dashboard/Templates/Floors/Scenes/Layers/History/Files/Commands/Shortcuts/Learn/Help/Feedback) | always visible |
| Contextual subrail | opens beside the rail for the active item |
| Right material rail | appears on selection or Materials tool |
| Right inspector | appears on selection, pin/unpin via header icon |
| Common context rail | appears above the docks for the active tool/selection |
| Dual bottom docks + `+ Space` | beginner-collapsed by default, click any side tool to expand |
| Template Gallery / Material Browser / Export Builder / Download Center | slide in from the right, max 50vw |

## Interaction contract (unchanged from V1, still critical)

- **Blank canvas right-click** → compact conventional dropdown. Never radial.
- **Object right-click** → exactly 8 independent circular actions with a
  fully transparent, empty centre.
- **Single click** → select only.
- **Double click** → tiny horizontal Name + Area editor.

## Things to try

- Click the top-left circle to open the Project Drawer; try Escape, click
  outside, and the section list (Projects/Templates/Files/Settings/Account/
  Help/Shortcuts/Commands).
- Switch Canvas → Data → Dashboard on the left rail (keys `1` `2` `3`).
- Click a dock side tool (Materials/Arrange/Connect/Markup) to expand the
  docks and populate the common context rail.
- Hold `+ Space` to open the Add tray; try Multiple Spaces (adds 5 fanned
  out) and More (Label/Note/Data Tag/Symbol/Panel/Frame).
- Select a space → the material rail and inspector both appear; hover the
  rail for Mac-dock magnification; open More Materials for the half-screen
  browser.
- In Data workspace, open Project Metadata for the AI-fill prompt box (Copy
  button actually copies to your clipboard).
- Drag a real file (or wait 1.2s after choosing Upload in the Add tray) to
  see the whole-canvas drop resolver.
- Export → build a pack in the Export Builder → watch the Download Center
  badge and the mail-like notification when the job completes.
- Resize the window under 1180px to see the desktop-required gate.

## Keyboard

`1 2 3` workspaces · `T` templates · `V B R C X P` dock tools · `A`/`⇧A` add
space/multi · `F` fit · `G` grid · `⌘K` drawer · `⌘E` export · `⇧D` mode ·
`?` shortcuts sheet · `Esc` closes menus/panels/drawer.

## Known limits (deliberate, design-lab scope)

- No persistence, no import wiring, no store/graph sync.
- Real ZIP/GIF encoders and file parsers are simulated (staged progress,
  no actual bytes produced).
- Relationships/Visual Connections/Morph Bridges are represented in the
  inspector/common-rail language only; no rendered connection geometry.
- iPad/tablet layouts are explicitly out of scope for this phase.
