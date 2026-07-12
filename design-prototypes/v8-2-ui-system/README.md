# MOOORF V8.2 — UI System Lab

Isolated visual prototype of the permanent MOOORF visual language: canvas shell,
materials, control instruments, icon library, type & annotation, grid language,
tools index, analysis workspace and the single ambient player.

**This is a design lab, not production code.** It touches no `src/`, no store,
no renderer, no packages. See `docs/V8_2_VISUAL_SYSTEM.md` for the token spec
and production/experimental status of every element.

## Run

Open `index.html` directly in any modern browser. No build step, no server,
no dependencies — three files:

```
index.html     shell + screens + inline SVG glyph sprite
styles.css     full token system and every component family
prototype.js   interaction engine (plain JS, one IIFE)
```

## Screen map

| # | Screen | Entry |
|---|--------|-------|
| 01 | Canvas shell | default · `1` |
| 02 | Material Studio Browser | tab · shelf **More** · `2` |
| 03 | Control Instruments | tab · `3` |
| 04 | Icon Library | tab · `4` |
| 05 | Type & Annotation | tab · `5` |
| 06 | Canvas & Grid | tab · rail **View** · `6` |
| 07 | Tools | tab · `7` |
| 08 | Analysis | tab · rail **Analysis** · `8` |
| — | Files intake | rail **Files** · blank-menu **Import File** |

## Interaction contract (V8.2 critical rules)

- **Blank canvas right-click** → compact conventional dropdown. Never radial.
- **Object right-click** → exactly 8 independent circular actions with a fully
  transparent, empty centre. No centre circle, no backing disc, no enclosing
  ring. Edge-clamped when opened near a viewport edge.
- **Single click** → select only. Dashed technical ring + centre cross.
  No geometry enlargement, no metadata window.
- **Double click** → tiny horizontal Name + Area editor. Enter commits,
  Esc cancels. Area edits resize the cell live.

## Things to try

- Drag cells; drag empty canvas to pan; wheel to zoom; `F` to fit.
- Right-click a swatch on the quick shelf → toggles favourite (red dot).
- Hover the shelf → Mac-dock magnification with neighbour falloff.
- Radial → **Materials / Boundary / Duplicate / Lock / Delete** are all live.
- Materials screen → select any orb, adjust angle/intensity/grain, duplicate
  or save it into Custom, apply to the selection.
- Instruments → every knob/slider/pad readout is clickable for exact numeric entry.
- Grid screen → all changes apply live to the canvas behind the sheet.
- Analysis → totals, leaders, mix, adjacency and the mini graph are computed
  from the live cells on the canvas.
- Player (bottom-right disc) → click to expand, again to play; silent demo,
  no audio asset is shipped.
- Day/night toggle (top-right) or `⇧D` — museum cream ↔ graph noir.

## Keyboard

`V C M R` tools · `1–8` screens · `G` grid · `S` snap · `F` fit · `⇧D` mode ·
`Esc` closes menus / returns to canvas.

## Known limits (deliberate, design-lab scope)

- No persistence, no import wiring, no store/graph sync (V8.3 targets;
  ghost-tagged in the UI as `V8.3`).
- Relationships connect the two nearest cells at spawn point and follow drags,
  but have no editing UI yet.
- Organism/blob merge is represented by the boundary/tension instruments only —
  the field renderer stays in production code, not in this lab.
