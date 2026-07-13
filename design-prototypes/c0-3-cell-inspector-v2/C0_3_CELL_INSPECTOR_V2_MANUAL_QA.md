# C0.3 Cell Inspector V2 — Owner Manual QA

## Run

```bash
cd /Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3-V2
python3 -m http.server 4175 --bind 127.0.0.1
```

Open:

`http://127.0.0.1:4175/design-prototypes/c0-3-cell-inspector-v2/`

Use desktop viewports only: 1440×900, then 1280×800.

## Checklist

- [ ] YES [ ] NO [ ] PARTIAL — Select one Cell; selection keyline/orbit and badge are correct.
- [ ] YES [ ] NO [ ] PARTIAL — Shift-select a second Cell; badge and differing settings show Mixed.
- [ ] YES [ ] NO [ ] PARTIAL — `I` opens/closes the Inspector; close button and Escape behave predictably.
- [ ] YES [ ] NO [ ] PARTIAL — Double-click a Cell; Name, Area, Body editor opens beside it and Cell drag is suspended.
- [ ] YES [ ] NO [ ] PARTIAL — Edit values and press Enter; Name/Area/Body update in Name → Area → Body order.
- [ ] YES [ ] NO [ ] PARTIAL — Edit and click outside; values commit once.
- [ ] YES [ ] NO [ ] PARTIAL — Edit and press Escape; original values return.
- [ ] YES [ ] NO [ ] PARTIAL — In Body, Shift+Enter adds a line break; Body stays 2–3 lines without changing Cell size.
- [ ] YES [ ] NO [ ] PARTIAL — All six Text Style presets change the whole Name/Area/Body hierarchy.
- [ ] YES [ ] NO [ ] PARTIAL — Text Size scales all three roles; Auto Contrast and palette colours remain readable.
- [ ] YES [ ] NO [ ] PARTIAL — Project Default, Create Override, Return to Default, and Mixed states are clear.
- [ ] YES [ ] NO [ ] PARTIAL — Symbol search and each populated category filter the library; Custom is clearly future-only.
- [ ] YES [ ] NO [ ] PARTIAL — Favourite toggle and Recent ordering work.
- [ ] YES [ ] NO [ ] PARTIAL — Hover previews a symbol; leave/Escape reverts; click applies/replaces; compact remove clears it.
- [ ] YES [ ] NO [ ] PARTIAL — Placement, offsets, scale, rotation, tint, backing, Backing Outline, and hide-below controls respond.
- [ ] YES [ ] NO [ ] PARTIAL — Quick Fill and labelled Material Browser handoff open/search/apply/close without becoming full-screen.
- [ ] YES [ ] NO [ ] PARTIAL — Boundary visible/style/width/offset/opacity/alignment/colour controls respond.
- [ ] YES [ ] NO [ ] PARTIAL — Core visible/size/colour/opacity/offset controls respond.
- [ ] YES [ ] NO [ ] PARTIAL — Copy/Paste Style changes appearance but not Name, Area, Body, or symbol identity; Reset and Preset work.
- [ ] YES [ ] NO [ ] PARTIAL — Keyline, Orbit, and Both modes switch; reduced-motion still shows selection.
- [ ] YES [ ] NO [ ] PARTIAL — Day/night both remain legible; no UI shadow or delayed/animated blur appears.
- [ ] YES [ ] NO [ ] PARTIAL — 1440×900 and 1280×800 keep Canvas dominant with no inspector/rail/cluster collision or horizontal overflow.

## Owner verdict

- [ ] APPROVE FOR PRODUCTION REBUILD
- [ ] REVISE PROTOTYPE

Undo/Redo, Table/Master Graph persistence, renderer/export integration, target rails, Quick Materials, and the production Material Browser are intentionally not implemented in this isolated prototype.
