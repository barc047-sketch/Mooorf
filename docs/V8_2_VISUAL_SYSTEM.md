# MOOORF V8.2 — Visual System

Definition of the permanent MOOORF visual language, prototyped in
`design-prototypes/v8-2-ui-system/`. Synthesized from the V8.2 reference pack
(`.references/v8-2/MOOORF_V8_2_REFERENCE_PACK/` — editorial spec sheets,
audio-instrument panels, circular material studies, technical dashboards,
tangent-circle blob drawings). No single reference is cloned; these are the
extracted principles.

Status legend used throughout:
**[P] production primitive · [X] experimental · [F] future · [R] rejected**

---

## 1. Principles

1. Black / white / grey chrome. **Colour belongs to data and materials only.**
   One signal red (`--signal`) for warnings, favourites and record-states.
2. Editorial composition: hairlines, index numbers (`01…08`), strong empty
   space, asymmetry. Never card-inside-card, never curve-inside-curve.
3. Scientific instrumentation: every control shows its exact numeric value and
   accepts typed input (click any readout).
4. Circles are semantic, not decorative: radial actions, material previews,
   icon previews, the player disc. Everything else uses the radius families.
5. Glass is subtle and scarce: menus, dock, shelf, rail, sheets. Nothing else blurs.

## 2. Colour tokens

| Token | Day (museum cream) | Night (graph noir) |
|---|---|---|
| `--bg` | `#EFEDE5` | `#0C0C0E` |
| `--ink` | `#17170F` | `#EFEEE8` |
| `--ink-70/45/25` | ink @ .70/.45/.25 | inverted equivalents |
| `--hair` | ink @ .14 | paper @ .14 |
| `--hair-strong` | ink @ .30 | paper @ .32 |
| `--pop` (menus/dock) | `rgba(252,251,246,.94)` | `rgba(22,22,25,.95)` |
| `--sheet` (screens) | cream @ .90 | noir @ .91 |
| `--panel` (instrument face) | `#F6F5F0` | `#131316` |
| `--railbg` | ink glass `rgba(24,24,20,.93)` — **dark in both modes** | `rgba(20,20,23,.93)` |
| `--signal` | `#D93A1E` | `#FF4B2B` |
| `--gridc` | `23,23,15` (rgb triplet) | `239,238,232` |

[P] all of the above. The rail staying dark in day mode is intentional
(anchors the shell against the cream field).

## 3. Typography

| Role | Stack | Size / weight / tracking | Status |
|---|---|---|---|
| UI grotesk | `-apple-system, SF Pro Text, Segoe UI, Inter` | 12 / 400–700 | [P] |
| Data mono | `ui-monospace, SF Mono, JetBrains Mono, Menlo` | 9–11 tabular | [P] |
| Micro caption | grotesk caps | 9 / 600 / +14% | [P] |
| Cell label | grotesk | 11 / 600 / +2% | [P] |
| Area data | mono | 9.5 / 500 | [P] |
| Section title | grotesk caps | 13 / 700 / +16% | [P] |
| **Dotted display** | mono + dot-matrix clip | display sizes only (≥28px) | [P] accent |

Dotted display implementation: `background-image: radial-gradient(dot)` +
`background-clip: text` (`.dot`). Solid-ink fallback under `@supports not`.
**Usage rule:** hero data only — one dotted element per view (total area,
timers, dynamic scale). Never for body text or labels. [R] dotted below 20px.

## 4. Spacing scale

`2 · 4 · 6 · 8 · 12 · 16 · 24 · 32 · 48 · 64` px. Sheet gutter 52/92px
(desktop), 28/84px (iPad). Section rhythm: 40px above a `.sec` header, 20px
below. Padding is deliberately non-uniform between component families.

## 5. Radius families

| Family | Value | Used by | Status |
|---|---|---|---|
| Editorial / technical | 0–2px | sheets' inner blocks, grid previews, drop zones, annotation tiles | [P] |
| Controls | 6–10px | menu items, dock, keycaps, segmented, steppers, chips (5px) | [P] |
| Instruments | 14–18px | rail (14), XY pad, floating panels | [P] |
| Circle | 50% | radial actions, material orbs, icon previews, knobs, player disc | [P] |
| Pill | 999px | recent-tool chips, analysis lenses only | [X] keep scarce |

[R] identical radius everywhere; [R] every control as a pill.

## 6. Borders & dividers

- Hairline `1px var(--hair)` — structure (sections, columns, rows).
- Strong hairline `var(--hair-strong)` — interactive boundaries (inputs,
  segmented, keycap).
- Dashed `1px dashed` — selection ring, voids, placeholders, future-state
  chips. Dash rhythm 2–3px on 3–3.4px.
- Keycap: 1px border with **2.5px bottom** — the designed "key" read. [P]

## 7. Opacity, blur, shadow

- Text hierarchy via ink opacities (.70/.45/.25), never grey hexes. [P]
- Blur: 12–14px (dock/shelf/rail/menus 18px), sheets 20px + saturate(1.05).
  Nothing else. [P] — [R] "excessive glass".
- Shadows: `--e1` 0 1 2 @.10 (swatches), `--e2` 0 6 22 @.13 (floating chrome),
  `--e3` 0 18 44 @.20 (menus/editor). [R] giant soft shadows.

## 8. Z-index ladder

`0` grid · `1` world/cells · `5` canvas widgets · `40` screen sheets ·
`60` shelf · `62` player · `70` shell (topbar/rail/dock) · `90` menus+radial ·
`92` cell editor · `95` toast · `99` tooltip.
Shell sits above all movable widgets; transient surfaces sit above the shell.
Shelf and dock retire (display:none) while a sheet is open — they are
canvas-context chrome. [P]

## 9. Motion

| Token | Value | Use |
|---|---|---|
| `--t-tap` | 120ms ease | hovers, taps |
| `--t-ctrl` | 190ms | control state, menus in |
| `--t-panel` | 280ms | shelf, player width |
| `--t-sheet` | 420ms | screen cross-fade + 14px rise |
| `--ease-pop` | `cubic-bezier(.34,1.45,.38,1)` | radial fly-out, toggles, selection ring |
| `--ease-glide` | `cubic-bezier(.22,1,.3,1)` | sheets, shelf, player |

Radial: buttons fly from centre to ring, 340ms pop, 24ms stagger per button;
pointer-events suppressed for the first 500ms to avoid stray hover. Shader
orbs: 7s linear spin / 3.2s pulse. Player disc: 8s spin, paused unless playing.
`prefers-reduced-motion` collapses everything to ~0ms. [P]

## 10. Component families

### Inspector [P]
Right-hand 300px column (Studio Browser, Icon Library). Circular preview,
name, category · tier, hairline, labelled rows (`label · control · mono
value`), chip block, action rows (1 primary ink button max), meta footnote.

### Studio Browser [P]
Three-column sheet: category list with counts → orb grid (54px circles,
9px caps names, tier dot, favourite dot) → Inspector. Search is an underline
field, not a boxed input. Categories: Solid, Hue, Gradient, Shader, Texture,
Pattern, Custom, Favourites, Recent. Targets (12): Space Fill, Core Dot,
Space Boundary, Organism, Organism Edge, Void, Void Edge, Canvas, Grid, Line,
Relationship, Text. Performance tiers: A static paint · B layered paint ·
C animated/GPU (tier dot goes signal-red).

### Microbar [P]
The bottom dock: 4px padding, 30px controls, radius 10, hairline groups
separated by 1px dividers. Zoom −/%/+, fit, grid, snap. Numeric zoom is a
button (click = reset).

### Shelf Rail [P]
Contextual quick materials above the dock: slab-less — a target selector
(8 targets, caps chips) floating over a bare row of 34px circular swatches
with Mac-dock magnification (gaussian, σ44, amp .55, translate-up 15px),
`Recent`/`All` inline tags, favourite = signal dot, incompatible = dimmed +
desaturated, `More` opens the Studio Browser. Appears on selection or
Materials tool; never under sheets.

### Sidebar Sheet [P]
The screens (02–08): translucent sheet under the topbar, editorial `.sec`
headers (`index number · caps title · right-aligned note`), asymmetric column
grids divided by hairlines, 140px bottom clearance.

### Analysis Workspace [P layout · data bindings X]
Asymmetric 1.45/1/1.1 columns. Hero dotted total (live sum), ranked leaders
with hairline bars, thin category mixbar (data colours), privacy split bar,
health dial (SVG arc), floor summary [F], relationship mini-graph (live),
distance-derived adjacency matrix [X], Sankey [F]. Lenses as pills — dashed
= future. One ink export button.

### Radial Actions [P]
8 × 46px independent circles at r=92 from the anchor; **empty centre —
no centre circle, no backing disc, no enclosing ring** (the dashed ring seen
on canvas is the object's own selection state at cell radius). Hover inverts
to ink; Delete hovers signal; active/toggled buttons hold the ink state;
tooltips are 9px caps ink chips. Edge-clamp: ring centre shifts inside a
125px margin. Order: Edit · Materials · Boundary · Duplicate · Lock · Delete ·
Group · More (top, clockwise). `More` opens a conventional submenu. [R] any
central object.

### Blank Menu [P]
Compact conventional dropdown, 236px, radius 10, icon + label + keycap(s).
Add Space/Void/Line/Relationship/Text/Paragraph · Paste · Import File ·
View › · Tools ›. [R] radial on blank canvas.

### Cell Editor [P]
Tiny horizontal bar under the object: name field, area field, `m²`, ink ✓.
Underline inputs, no labels. Enter/Esc.

### Instruments [P unless noted]
Rotary knob (270° arc, value arc, tick pointer, drag-vertical, click-to-type),
dual knob (concentric) [X], 5-band equalizer, dotted range track
(ref: range_component — dots + hairline fill + cursor), vertical slider,
numeric stepper, segmented switch, two-axis gradient pad (angle × blend, live
gradient), material orb, line-width list (real strokes), hue slider + hex,
blend segmented [X until renderer supports].

### Icon Library [P glyphs · controls P]
Circular previews on hairline orbs. Controls: scale, rotation, opacity,
tint (Ink/Paper/Material), circular backing + border, category auto-map,
zoom-visibility window (min/max). Sets: Architecture (9), Landscape (5),
Diagram (6), Annotation (on Type screen), SVG/PNG/Uploaded/Saved Sets [F].

### Type & Annotation [P]
Label / paragraph / data-bound label / dotted display samples; presets
(Cell Label, Area Data, Section Caption, Editorial Note, Display Dot);
family/size/weight/line-height/tracking/alignment/rotation/dotted controls.
Annotations: north, sun path, wind, hot wind (signal), cold wind, scale bar,
**dynamic digital scale (zoom-linked, live)**, dimension, area tag, floor
mark, entry/exit, section, view cone — all 1.2px stroke, 48px grid.

### Canvas & Grid [P]
Grid languages: dotted · fine line · technical (dot minor + line major) ·
architectural · major/minor · isometric · radial · none. Modes: ink-on-paper,
paper-on-ink, custom hue. Controls: scale, opacity, weight, major interval,
snap, dynamic zoom density (doubles/halves outside 14–84px), export-grid
toggle. Backgrounds: auto, white, black, solid, gradient, paper (grain),
material. All live on the canvas behind the sheet.

### Music Player [P]
Single track, silent demo. Collapsed: one 46px disc (vintage conic gradient +
groove rings, spins when playing). Expanded: slim 384px bar — disc,
title, 5-bar visualizer, hairline progress with dot knob, mono elapsed,
volume hairline slider, mute, collapse. Rises above the dock under 1160px.
[R] playlists, artwork cards, second track.

## 11. Desktop / iPad

- ≤1160px: expanded player lifts above the dock.
- ≤1060px: sheets go single-column; browser columns compress
  (218/1fr/254); tab index numerals drop; tool-row previews drop.
- All drag surfaces use pointer events + `touch-action:none` — knobs, EQ,
  XY pad, shelf and cells work with touch. Hover magnification degrades
  gracefully (no hover = no magnify, plain scroll). [P]

## 12. Rejected on the record

Generic SaaS dashboard grids · card-in-card · nested same-radius curves ·
uniform padding · all-pill controls · heavy glass everywhere · neon accents ·
giant shadows · ordinary shadcn composition · radial menus with centre hubs ·
metadata popups on single click.
