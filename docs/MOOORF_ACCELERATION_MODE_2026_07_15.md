# MOOORF Acceleration Mode — Essential Product Fast Track

**Date:** 2026-07-15
**Status:** Owner-approved operating and roadmap amendment
**Product-code effect:** None until an exact worker brief receives GO

## 1. Objective

Finish the usable browser-first MOOORF product as quickly as possible without creating duplicate architecture or merging unaudited complex code.

Temporary routing:

- Codex is the only production implementation and merge-preparation lane.
- Antigravity is used only for independent read-only audit, delta review and verification, including in parallel after a fixed feature head is pushed.
- Claude is held.
- Use larger bounded milestones instead of many tiny implementation slices.
- Keep one production coding lane. No two workers edit the same store, renderer, schema, persistence or export surface.
- Every complex branch still stops at review; no automatic merge.

## 2. Boundary decision

Boundary is primarily a **technical stroke system**, not a material surface.

The essential user-facing Boundary controls are:

- visibility: none / on,
- type: solid, dashed, dotted, dash-dot, double, segmented bars,
- stroke width,
- visual offset,
- inner / centre / outer alignment where technically valid,
- dash or bar length,
- gap length,
- secondary-line spacing for double boundaries,
- colour,
- opacity,
- compact sliders and numeric input where useful.

Deferred unless proven essential:

- gradient Boundary,
- texture/material-browser requirement,
- hatch or pattern fills,
- complex technical presets,
- custom shader-only effects.

The already-audited C0.4.1 `materialId` field may remain as an internal compatibility/fallback reference so the audited foundation is not reopened solely for naming. Production UI must not require the user to assign a material to a Boundary. A later Codex implementation may narrow this to stroke paint/token ownership only if migration and renderer compatibility remain safe.

Architectural invariant:

```text
Boundary offset/style
!= Cell area
!= hit testing
!= clearance
!= Membrane appearance
```

## 3. Consolidated C0.4 fast track

The old C0.4.2–C0.4.5 micro-slices are replaced operationally by two bounded implementation milestones. Their architectural requirements remain mandatory.

### C0.4F-A — Runtime Layer Separation

One Codex branch may include:

- temporary selection-overlay isolation,
- Classic renderer semantic separation,
- Organism/WebGL semantic separation,
- independent Cell, Boundary, Membrane, Membrane Edge, Core and Void projections,
- essential Boundary stroke types and controls at the domain/renderer level,
- truthful renderer fallback when a style is unsupported,
- no production Inspector redesign yet,
- no full Material Browser,
- no advanced Membrane geometry.

Gate:

- each target changes independently,
- selection is never persisted/exported,
- Cell area and hit testing remain unchanged,
- current baseline appearance remains stable,
- focused tests and one production build pass,
- Antigravity audits the fixed head.

### C0.4F-B — Essential Editing, History and Export Parity

One Codex branch may include:

- essential target-selection UI,
- compact settings controls for Cell, Boundary, Membrane, Membrane Edge, Core and Void,
- sparse project defaults and per-Cell overrides,
- one Undo/Redo transaction per committed setting change,
- ephemeral previews,
- save/load migration parity,
- PNG/SVG/PDF parity and UI/selection exclusion,
- minimal production Inspector integration required to edit the layers,
- no full material-library browser.

Gate:

- settings survive save/load and Undo/Redo,
- Canvas and exports match,
- one target never silently changes another,
- 1440 and 1280 QA pass,
- independent audit and Owner approval.

## 4. Essential product sequence after C0.4

Prioritise only the shortest path to a useful architecture product:

1. Production Cell Inspector essentials: Name, Area, Body, symbol, target settings.
2. Canonical Area edit and Cell resize.
3. Table/Canvas sync and reliable CSV/Excel import.
4. Floor system.
5. Derived statistics and compact Dashboard.
6. Essential Connections: semantic relationship plus basic visible line.
7. Reliable PNG, SVG, PDF and project-file export.
8. Canvas/export hardening and dense-scene review.

Defer until the core product is usable:

- full Material Browser,
- advanced Membrane presets and motion,
- advanced connection routing/animation,
- broad shell redesign,
- city packs and rules,
- AI assistance,
- accounts, cloud and collaboration,
- tablet and phone work.

## 5. Batch execution rule

A fast-track Codex task may contain multiple tightly coupled substeps when they share the same architecture owner and branch. It must still define:

- one clear milestone result,
- exact base and branch SHA,
- file ownership boundaries,
- checkpoints and stop conditions,
- focused tests,
- one final production build,
- a fixed pushed head for independent audit.

Antigravity may audit a fixed pushed head while the Project Manager prepares the next dependency-gated plan, but no dependent product branch starts from unmerged or unaudited assumptions.
