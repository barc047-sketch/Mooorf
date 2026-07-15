# C0 M2 Correction 1 — Owner Review Regressions and Symbol/Void Completion

**Worker:** Codex  
**Mode:** bounded production correction  
**Owner evidence:** live preview at `feature/c0-m2-advanced-inspector-symbols-runtime-gates@1cc8ec0c7ab756bc6b091b87014da2c3e27383d2`  
**Exact correction base:** `1cc8ec0c7ab756bc6b091b87014da2c3e27383d2`  
**Work branch:** `feature/c0-m2-advanced-inspector-symbols-runtime-gates`  
**Main remains protected:** `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`

## 1. Owner acceptance retained

The Owner confirmed YES for the five M2 review checks:

- one Inspector with Content / Appearance / Symbol;
- advanced appearance and separate softness effects;
- Off/On values restore;
- Symbol search, favourites, preview/apply and placement/backing;
- export behavior.

Preserve these outcomes. Do not redesign working M2 surfaces.

## 2. Blocking regressions to correct before merge

### 2.1 Layout preset execution

Reproduce and repair the Owner-visible regression where Random and Layout preset controls no longer visibly arrange entities.

Requirements:

- existing preset buttons must execute through the canonical layout/store owner;
- no selection: arrange all visible entities;
- one or more selected entities: arrange only the selected entities and leave unselected entities fixed;
- preserve the arranged subset centroid unless the command explicitly uses the viewport centre;
- preserve Name, Body, Area, category, privacy, kind, appearance, symbols and relationships;
- create one bounded undo transaction per arrangement;
- current existing presets remain available; do not build the full future arrangement catalogue in this correction.

### 2.2 Multi-add overlap

The batch Add Cells command currently places large Cells on a fixed small ring, causing visible stacking/overlap.

Requirements:

- use radius/Area-aware golden-angle or collision-aware initial placement around the current viewport centre;
- newly added entities must start at visibly distinct positions;
- select the newly added batch as a multi-selection rather than only the final Cell;
- one batch-add action must be one undoable transaction;
- do not run a heavy force simulation.

### 2.3 Symbol Inspector preview flicker

The Symbol pane currently reads `resourcesPreview` as its own UI source. Hover/focus preview can therefore mount/change placement controls, move the pointer target, cancel the preview, and re-enter repeatedly.

Requirements:

- canonical Symbol pane controls, filters, recents, favourites and placement-panel geometry read canonical resources;
- ephemeral `resourcesPreview` affects Canvas/export-preview projection only;
- pointer and keyboard preview remains ephemeral and reverts cleanly;
- no rapid remount, flash, reopen, scroll jump or pointer enter/leave loop;
- applying a symbol remains one history transaction.

### 2.4 Void edge hard-coded dash

The current Void projection hard-codes `[5, 5]` dash values, producing the unexplained striped/dashed border reported by the Owner.

Requirements:

- remove the hard-coded mandatory dashed Void edge;
- default Void edge is truthful solid unless the authored Void style requests another style;
- implement one shared reusable Stroke Style control/projection used by Cell Boundary and Void Edge for the current six supported styles:
  - solid,
  - dashed,
  - dotted,
  - dash-dot,
  - segmented bars,
  - double;
- Void owns its own style values; it must not silently inherit a selected Cell Boundary style;
- live Classic, live Organism overlay, PNG, PDF and Classic SVG remain consistent;
- preserve subtractive geometry, Area and hit testing.

Do not add Wavy or Corner-Bracket styles yet. Reserve them for the later shared Stroke Library after a visual definition and renderer/export contract exist.

## 3. Symbol completion requested by Owner

### 3.1 Auto Contrast

Add a canonical Symbol tint mode:

- `Auto Contrast` and `Custom`;
- Auto resolves from the effective Cell or Void fill/background using the existing contrast principles;
- Custom preserves the current tint picker;
- migrate existing placements deterministically without changing their visible tint unexpectedly;
- live Canvas, PNG, PDF and Classic SVG parity;
- no duplicate colour owner.

### 3.2 Symbols on Void

Allow one presentation-only Symbol placement on a Void:

- apply, replace, remove, placement, backing, recents/favourites and Undo/Redo work exactly as for a normal Cell;
- live Classic and Organism overlay plus PNG/PDF/Classic SVG parity;
- Auto Contrast resolves against the Void presentation surface/background;
- Symbol placement never affects subtraction, clearance, Area, radius or hit testing.

## 4. Explicit deferrals after this correction

Do not implement in Correction 1:

- final common rail;
- visible Undo/Redo shell buttons;
- right-click Copy Style / Paste Style buttons;
- full new Arrangement Engine patterns;
- Quick Bar or snapping;
- Material Browser/Studio;
- Wavy or Corner-Bracket stroke styles;
- Connections, Annotation, Floors, Dashboard or Table redesign.

These are mapped as follows:

- **M3A:** final common rail, permanent Undo/Redo, history coverage, right-click Copy Style/Paste Style and Quick Bar;
- **M3B:** selection-aware advanced Arrangement Engine: random, golden-angle/phyllotaxis, spiral, circle, oval, horizontal, vertical, diagonal, cross, grid, orbit, core, colony, division, tendril and asymmetry;
- **M3C:** snapping foundation;
- **M4:** Materials, palettes, presets and Material Browser/Studio using AG3 research;
- **M5 shared Stroke Library expansion:** Wavy and Corner-Bracket styles with Connection/Annotation-compatible path generation.

## 5. Fast Owner-QA

Obey `docs/governance/FAST_OWNER_QA_MODE.md`.

Required:

- focused contracts for corrected owners only;
- affected history, persistence, migration, renderer and export tests;
- TypeScript check;
- `git diff --check 1cc8ec0c7ab756bc6b091b87014da2c3e27383d2...HEAD`;
- exactly one final production build for this correction;
- no exhaustive browser matrix;
- stop browser-harness tuning after 10 minutes;
- push one fixed correction head, set `status/codex` to `WAITING_REVIEW`, and stop.

Owner review must be a short checklist covering:

1. presets move all vs selected entities correctly;
2. multi-add no longer stacks;
3. Symbol hover/focus no longer flickers;
4. Void edge defaults solid and shares the six style choices;
5. Symbol Auto Contrast and symbols on Void work and export.

## 6. Merge gate

No merge. M2 remains blocked until this correction is reviewed and the Owner gives the exact merge command.