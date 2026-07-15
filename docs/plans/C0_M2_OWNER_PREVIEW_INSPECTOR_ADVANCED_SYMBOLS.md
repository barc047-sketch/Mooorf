# MOOORF C0 M2 Owner Preview — One Inspector, Advanced Appearance, Symbols and Runtime Gates

**Status:** OWNER PREVIEW ONLY — not authorized for Codex
**Prerequisite:** final corrected M1 fixed head reviewed and merged with C0.4F-A.

## 1. Purpose

Complete the approved Inspector design without creating separate inspectors or exposing a maze of six top-level layer targets.

There is exactly one Inspector with three durable tabs:

- Content,
- Appearance,
- Symbol.

M2 adds:

1. advanced, truthful instruments inside the grouped Appearance workflow;
2. the production Symbol tab inside the same Inspector;
3. canonical runtime power gates so Off means both hidden and not needlessly running;
4. the approved optional selection orbit if it remains temporary, non-exported and reduced-motion safe.

## 2. Proven inputs

- final corrected M1 production Inspector and canonical appearance owners,
- Claude prototype: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`,
- locked Inspector scope: `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`,
- audited baseline registry: `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`,
- Antigravity symbol research: `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`,
- fast-track atlas: `research/c0-fast-track-essential-product-atlas@348ee8cd62e45de1b1c51f144e1b7607acd016ee`,
- M1 Correction 2 canonical Membrane `Cell Gradient` / `Solid` colour source and solid preset seam,
- quick controls/runtime/snapping plan: `docs/plans/C0_CANVAS_QUICK_CONTROLS_RUNTIME_GATES_AND_SNAPPING_STAGE_PLAN.md`.

Prototype, research and divergent branches are selectively forward-ported, never merged wholesale.

## 3. One Inspector architecture

### Content tab

Retain corrected M1:

- Space Name,
- Area,
- Body/subtext,
- text presets,
- Text Size,
- Text Colour,
- Auto Contrast,
- defaults/local/mixed,
- direct inline editing sync.

### Appearance tab

Exactly three primary families:

```text
Cell
├── Surface
├── Boundary
└── Core / nucleus

Membrane
├── Field
└── Edge

Void
├── Fill
└── Edge
```

The six internal canonical targets remain separate for state, renderer, history and export. The user does not navigate six unrelated top-level editors.

### Symbol tab

The real symbol browser, placement and backing controls live inside this same Inspector. Do not build a separate `Symbol Inspector` window.

## 4. Advanced Appearance instruments

Only expose parameters with a canonical owner and visible renderer effect. Use compact collapsible groups, not one giant form.

### 4.1 Cell family

#### Surface

- visible,
- fill material/colour,
- opacity,
- future gradient/texture parameter seam,
- inheritance/mixed/reset/history/export.

#### Cell Shadow

Reuse the existing canonical `CellShadowSettings`; never create another shadow model.

Fast controls:

- Off / Soft / Defined,
- **Shadow Strength** slider.

Advanced disclosure:

- opacity,
- softness,
- offset X,
- offset Y,
- spread,
- Auto/custom colour,
- include in export,
- reset/history/persistence/export.

Rules:

- shadow is visual only and never affects Cell radius, Area, hit testing or selection;
- Shadow Off must skip shadow resolution/mask/uniform work, not merely render opacity zero;
- Fast performance mode may simplify a live shadow, but explicit Off is always a hard runtime gate.

#### Boundary

- all six styles in Classic and Organism,
- width,
- inner/centre/outer alignment,
- visual offset,
- dash length,
- dot size/round cap,
- gap,
- explicit dash-dot sequence,
- segmented-bar length/gap,
- double-line spacing,
- colour/material,
- opacity,
- deterministic zoom behaviour,
- inheritance/mixed/reset/history/export.

#### Core / nucleus

- visible,
- explicit explanation that Core is the optional centre presentation marker—not the geometry field nucleus,
- size,
- colour/material,
- opacity,
- Auto Contrast,
- safe presentation offset X/Y,
- shape presets only with renderer/export parity,
- inheritance/mixed/reset/history/export.

### 4.2 Membrane family

#### Field

Basic colour/material behaviour carried forward from M1 Correction 2:

- `Cell Gradient` remains the current/default mode and keeps spatial Cell-derived colour blending,
- `Solid` mode remains available with Black, Ink, MOOORF Red, Charcoal and Custom,
- M2 may expose these through richer previews, but it must reuse the same canonical mode/material IDs rather than duplicate state,
- opacity,
- field character / Morph style,
- Fusion / attachment,
- Reach / merge distance.

**Shape instruments**

- `Field Edge Softness` — the field/body boundary feather owner already supported by the bounded Organism shader,
- surface tension,
- iso threshold/level,
- mass/influence,
- connection bias.

`Field Edge Softness` must be named clearly so it is not confused with the separate Membrane Edge softness below.

**Distribution instruments**

- strength,
- radius minimum/maximum,
- size variation,
- safe presentation offsets only where Cell centres and hit testing remain unchanged.

**Motion instruments**

- master Motion On/Off,
- idle motion,
- speed/time scale,
- response,
- drift,
- breathing,
- wobble,
- phase variation.

Every advanced control must visibly affect the existing bounded Organism renderer and be performance-gated. Unsupported controls remain absent rather than fake.

#### Edge

- visible,
- width,
- `Edge Softness` — an independent presentation-band feather owner,
- material/colour,
- opacity,
- glow/pulse only if live renderer and export parity exist,
- reset/history/export.

`Edge Softness` must not be a second label wired to `Field Edge Softness`. It needs a separate canonical field/uniform/projection with a visibly independent effect and export fallback.

Membrane Edge never appears as a separate primary Appearance family.

### 4.3 Void family

- fill visible/material/colour/opacity,
- edge visible/material/colour/opacity/width,
- standard Void has no inner echo,
- optional `Inner Echo` may be added only as an explicit presentation control with visibility/opacity/scale, default OFF,
- Inner Echo must never affect subtraction, clearance, area, hit testing or drag geometry,
- live and export parity are required before exposing it,
- reset/inheritance/mixed/history/export.

### 4.4 Runtime power gates

Visibility and execution are related but not identical. Turning a system off must preserve its authored parameters while stopping work owned only by that system.

| System | Off result | Runtime requirement |
| --- | --- | --- |
| Membrane family | no Field or Edge | skip field/palette/spatial-colour preparation owned only by Membrane; no continuous loop solely for Membrane |
| Membrane Edge | no edge band | skip edge-band projection and uniform work |
| Cell Shadow | no shadow | skip shadow resolution, mask and uniforms |
| Motion | static geometry | stop continuous rAF when no other consumer needs it; skip motion advancement and offsets |
| Labels | no labels | do not build/sync hidden label DOM every frame |
| Grid | no grid | no grid DOM and no grid sync work |
| Snapping | no snapping | no candidate generation outside active drag/creation |

Requirements:

- disabled Membrane + disabled Motion must leave the canvas idle with no owned continuous animation frame;
- an explicit edit, camera move, resize or export may wake one bounded render and then return to idle;
- Off must not be implemented as opacity zero while expensive work continues;
- executable tests use counters/injected schedulers to prove owned work stops;
- power gates never alter Cell area, centres, hit testing, Void subtraction or saved geometry;
- M3 Quick Bar will call these same canonical gates rather than inventing duplicate settings.

## 5. Production Symbol tab

### 5.1 Registry integration

- forward-port the 77-symbol canonical baseline,
- validate and ingest 59 Antigravity-approved Lucide additions,
- ingest 14 aliases with deterministic normalization,
- exclude all 5 rejected candidates,
- keep UI command icons separate from drawable symbols,
- no raw/base64 or unknown-license assets.

### 5.2 Library UX

- search,
- categories,
- recent,
- favourites,
- hover preview/revert,
- one primary symbol per Cell,
- apply/replace/remove,
- clear accessibility labels and search tags.

### 5.3 Placement and backing

- placement presets,
- offset X/Y,
- scale,
- rotation,
- tint,
- backing type,
- backing size,
- backing offset,
- backing opacity,
- backing outline on/off,
- backing outline width,
- hide when zoomed far out,
- history, persistence and export.

### 5.4 Custom vectors deferred for Owner visual review

- elevator cab,
- stairs plan,
- escalator section,
- wardrobe plan,
- sink plan,
- gate swing,
- floor drain,
- section cut.

Use original MOOORF-owned vectors; never misleading generic substitutes.

## 6. Approved Inspector prototype coverage ledger

By M2 completion:

**Inside the one Inspector**

- Content interactions,
- Appearance grouped controls,
- Symbol tab,
- search/categories/recents/favourites,
- hover symbol preview,
- placement/backing,
- Copy/Paste/Reset,
- inheritance states,
- optional dotted selection orbit,
- Cell Shadow strength and advanced controls,
- Field Edge Softness,
- independent Membrane Edge Softness,
- Cell Gradient and Solid Membrane colour modes,
- Motion master and advanced motion parameters,
- truthful runtime power gates.

**Still assigned to M4**

- full Material Browser,
- circular material previews,
- material recents/favourites,
- hover material preview/revert,
- parameter-driven Material Studio.

M4 consumes the same canonical Membrane colour/material state established earlier. It must not replace or fork Cell Gradient/Solid modes.

Nothing from the approved prototype or Owner additions is silently dropped.

## 7. M2 exclusions

- final bottom-dock redesign,
- bottom-left Quick Bar,
- snapping menu/engine,
- full Material Browser/Studio,
- Connections,
- standalone Annotation Card,
- broad Table/import,
- Floors/Dashboard.

M3 owns the Quick Bar and first truthful snapping foundation after M2 establishes the runtime gates.

## 8. Acceptance gate

M2 is complete only when:

1. there is still exactly one Inspector;
2. Symbol is a tab inside it;
3. Appearance has exactly Cell, Membrane and Void primary families;
4. Boundary/Core are grouped under Cell and Edge is grouped under Membrane;
5. Cell Gradient and Solid Membrane modes remain available through one canonical state owner;
6. Field Edge Softness and Membrane Edge Softness are separate controls with separate visible renderer effects;
7. Cell Shadow has a primary Strength slider plus truthful advanced controls using the existing canonical owner;
8. standard Void has no inner echo and any optional Inner Echo is explicit and default OFF;
9. every advanced control visibly affects its canonical renderer owner;
10. explicit Off states skip owned runtime work and disabled Membrane/Motion leaves no continuous animation loop;
11. no advanced appearance control changes architectural area, centre, hit testing or Void subtraction;
12. Symbol search/categories/recents/favourites/hover/apply/remove work;
13. symbol placement/backing persists and exports;
14. catalogue counts and rejects match the Antigravity manifest;
15. 1440×900 and 1280×800 pass;
16. tests, typecheck, diff check and one final build pass;
17. one fixed head stops at `WAITING_REVIEW`.

## 9. Following sequence

- M3A — Final Bottom Dock and compact bottom-left Quick Bar.
- M3B — Snapping Foundation and collapsible Snap menu.
- M4 — Quick Materials, Presets and Material Browser/Studio.
- M5 — Straight Connections plus Endpoint/Midpoint/Perpendicular/Intersection snap extensions.
- M6 — Markup/Annotation plus Auto-link Annotation snapping.
- M7 — Advanced Arrange, Grid presets and Snap optimization.
- M8 — Table and Import completion.
- M9 — Floors, Stats and Dashboard.