# MOOORF C0 M2 Owner Preview — Inspector V2 Completion, Advanced Layer Instruments and Symbols

**Status:** OWNER PREVIEW ONLY — not authorized for Codex
**Prerequisite:** M1 correction fixed head reviewed and merged with C0.4F-A.

## 1. Purpose

Complete the previously approved Inspector design rather than leaving M1 as a shallow Content/Appearance panel.

M2 combines two tightly related systems:

1. advanced, truthful per-target editing inside the six dedicated settings widgets;
2. the production Symbol tab and audited drawable-symbol catalogue.

This keeps all Inspector-owned work together before the final bottom-dock redesign.

## 2. Exact proven inputs

- M1 corrected production Inspector and six target widgets.
- Claude prototype: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`.
- Locked Inspector scope: `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`.
- Audited baseline registry: `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`.
- Antigravity research: `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`.
- Fast-track reuse atlas: `research/c0-fast-track-essential-product-atlas@348ee8cd62e45de1b1c51f144e1b7607acd016ee`.

Never merge prototype/research/divergent branches wholesale.

## 3. Inspector V2 completion

Live tabs:

- Content,
- Appearance,
- Symbol.

Retain:

- no selection → Project Defaults,
- one Cell → inherited/local state,
- multi-select → truthful Mixed state,
- Copy/Paste/Reset Style,
- direct Detail launcher,
- direct Material Browser seam for M4,
- compact panel density,
- optional non-exported dotted selection orbit with reduced-motion support.

## 4. Advanced layer instruments

Only expose parameters with a canonical owner and visible renderer effect. Advanced sections are collapsible and metadata-driven where possible.

### 4.1 Cell Settings

- visible,
- fill material/colour,
- opacity,
- future-compatible gradient/texture parameter seam,
- optional production Cell shadow controls if already canonical,
- reset/inheritance/mixed/history/export.

### 4.2 Boundary Settings

- all six technical styles in Classic and Organism,
- width,
- inner/centre/outer alignment,
- visual offset,
- dash length,
- dot size/round cap,
- gap,
- dash-dot sequence,
- segmented-bar length/gap,
- double-line spacing,
- colour/material,
- opacity,
- zoom behaviour,
- reset/inheritance/mixed/history/export.

### 4.3 Membrane Settings

Organize into clear groups.

**Field**

- visible,
- material/colour,
- opacity,
- field character / Morph style,
- Fusion / attachment mode,
- Reach / merge distance.

**Shape**

- softness,
- surface tension,
- iso threshold/level,
- mass/influence where the current shader truthfully supports it,
- connection bias.

**Distribution**

- strength,
- radius minimum/maximum,
- size variation,
- safe presentation offsets only where they do not change architectural centres or hit testing.

**Motion**

- idle motion on/off,
- speed/time scale,
- response,
- drift,
- breathing,
- wobble,
- phase variation.

Every control must be performance-gated and must visibly affect the existing bounded Organism renderer. Unsupported controls remain absent rather than fake.

### 4.4 Membrane Edge Settings

- visible,
- width,
- edge softness,
- material/colour,
- opacity,
- safe glow/pulse only if renderer/export truth is implemented,
- reset/history/export.

### 4.5 Core Settings

- visible,
- clear `Core / nucleus` explanation,
- size,
- colour/material,
- opacity,
- Auto Contrast,
- presentation offset X/Y if geometry-safe,
- shape presets only if renderer/export parity exists,
- reset/inheritance/mixed/history/export.

### 4.6 Void Settings

- fill visible/material/colour/opacity,
- edge visible/material/colour/opacity/width,
- inner echo visibility/opacity/scale if presentation-only,
- no appearance control may change subtraction, clearance, area or hit geometry,
- reset/inheritance/mixed/history/export.

## 5. Production Symbol tab

### 5.1 Registry ingestion

- forward-port existing 77-symbol canonical baseline,
- validate and ingest 59 Antigravity-approved Lucide additions,
- ingest 14 aliases with deterministic canonical normalization,
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
- remove/replace,
- clear accessibility labels and search tags.

### 5.3 Symbol placement and backing

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
- persistence/history/export.

### 5.4 Custom architectural vectors deferred for Owner visual review

- elevator cab,
- stairs plan,
- escalator section,
- wardrobe plan,
- sink plan,
- gate swing,
- floor drain,
- section cut.

Use original MOOORF-owned vectors; never substitute misleading generic icons.

## 6. M2 exclusions

- final bottom-dock redesign,
- full Material Browser/Studio,
- Connections,
- standalone Annotation Card,
- Grid/Snapping,
- broad Table/import,
- Floors/Dashboard.

## 7. Acceptance gate

M2 is complete only when:

1. every approved Inspector-owned feature is either implemented or explicitly assigned to M4 with no dead UI,
2. all advanced controls visibly affect the correct renderer owner,
3. no advanced setting changes architectural Cell centre, area, hit testing or Void subtraction unless explicitly geometry-owned,
4. Symbol search/categories/recents/favourites/hover/apply/remove work,
5. symbol placement/backing persists and exports,
6. all accepted catalogue counts and rejects match the Antigravity manifest,
7. 1440×900 and 1280×800 pass,
8. tests, typecheck, diff check and one final build pass,
9. one fixed head stops at `WAITING_REVIEW`.

## 8. Following milestone sequence

- M3 — Final Bottom Dock and Shared Contextual Rails.
- M4 — Quick Materials, Presets and Material Browser/Studio.
- M5 — Straight Connections.
- M6 — Markup and Annotation.
- M7 — Arrange, Grid and Snapping.
- M8 — Table and Import completion.
- M9 — Floors, Stats and Dashboard.
