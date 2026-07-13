# C0.3 Cell Inspector V2 — Design Notes

## Status

This is an isolated interaction prototype. It does not own production project data, history, rendering, persistence, materials, or export.

Codex recovered Claude's interrupted V2 `index.html` and completed it in place. The original three-tab structure, SVG registry split, inline-editor shell, text presets, style controls, and Material Browser connection were preserved.

## Information architecture

One compact right-side Cell Inspector has three tabs:

1. **Content** — Space Name, Area, Body, Text Style, Text Size, Text Colour.
2. **Symbol** — one primary drawable symbol, discovery, placement, tint, backing, and zoom visibility.
3. **Cell Style** — quick Fill, Boundary, Core, and visual-style actions.

Advanced rows use disclosures. Large destructive buttons are avoided. The symbol remove action is icon-only with a tooltip.

## Content interaction

- Double-click a Cell to open the inline editor beside it.
- The visible hierarchy is Space Name, Area, then Body.
- `Enter` commits; `Escape` cancels.
- `Shift + Enter` adds a Body line break.
- Clicking outside commits once.
- Dragging is suspended while editing.
- Body is clamped to a short 2–3-line display and never changes Cell geometry.
- Inspector fields and inline fields operate on the same prototype record.

The `Table · Master Graph` marker is a production ownership contract, not a claim of real graph persistence inside this prototype.

## Text system

The six preset previews—Technical, Editorial, Minimal, Compact, Presentation, and Diagram—each define the complete Name + Area + Body hierarchy. Text Size scales all three roles proportionally. Text Colour applies to all three roles and supports deterministic Auto Contrast or a compact project-colour swatch.

There are no per-role font, weight, line-height, alignment, rotation, offset, opacity, or backing controls.

## Inheritance and multi-selection

Text, Symbol settings, and Cell Style each expose one scope row:

- Project Default
- Local Override
- Mixed for a multi-selection with differing scope or values

`Create Override` clones the resolved project values into the selected Cell or Cells. `Return to Default` removes the local override. Mixed values remain visible rather than being silently replaced by the first selected value.

## Symbol system

Product UI icons (`i-*`) and drawable Cell symbols (`a-*`, `l-*`, `d-*`, `n-*`, `w-*`, `e-*`, `x-*`, `s-*`) are deliberately separate.

Drawable discovery includes categories, search, recent, favourites, keyboard-focusable cards, hover preview/revert, apply/replace, and compact remove. A Cell has exactly one primary symbol. Hover is preview-only; click commits. Recent and favourite state is prototype-memory only.

The first version exposes placement preset, X/Y offset, scale, rotation, tint, backing type/size/offset/opacity, Backing Outline and width, plus Hide Below Zoom. There is no `Include in Export` control; production exports an applied symbol by default.

## Cell Style

- Quick Fill uses circular material dots and a compact Material Browser handoff.
- Boundary supports visible, solid/dashed/dotted/double, width, offset, opacity, alignment, and colour.
- Core supports visible, size, colour/Auto Contrast, opacity, and X/Y offset.
- Copy Style copies appearance only.
- Paste Style supports one or multiple selected targets in the prototype.
- Reset returns appearance to project defaults.
- Save as Preset creates a session-only prototype preset.

Copy Style excludes Space Name, Area, Body, symbol identity, category, privacy, floor, and relationships.

## Selection display

Selection display is global editing UI:

- Clean Keyline
- Dotted Orbit
- Keyline + Orbit

The orbit is never part of copied Cell style and must never be exported. Reduced-motion mode stops rotation without removing selection evidence.

## Visual language

- Production token variables are loaded directly.
- Canvas remains dominant at 1440 and 1280.
- Stable glass uses `backdrop-filter` and `-webkit-backdrop-filter` from first render.
- Blur is never animated.
- UI box/drop shadows are absent.
- Active state uses a signal dot, keyline, or light tonal fill.
- Colour is reserved for Cell/material/symbol data, not generic active chrome.

## Truthfulness boundary

The local Material Browser is a labelled handoff preview, not the production resource system. Undo/Redo, Master Graph/Table persistence, renderer/export integration, target rails, Quick Materials, and full Material Browser ownership remain production work.
