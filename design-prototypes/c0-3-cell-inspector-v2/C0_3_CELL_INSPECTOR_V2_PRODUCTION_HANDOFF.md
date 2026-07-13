# C0.3 Cell Inspector V2 — Production Handoff

## Do not merge prototype code directly

This directory is a dependency-free design lab. Its local `Set`, fixture records, DOM rendering, and session clipboard are disposable interaction evidence. Production must adapt the accepted interaction contracts through existing owners.

## Canonical production owners

| Concern | Production owner / adaptation |
|---|---|
| Selected Cells and primary Cell | Existing central interaction/store selection; do not add a second selection store. |
| Name, Area, Body | Master Graph/store record and Table projection. Extend the existing inline-editor/table path; do not create inspector-owned data. |
| Inspector mount/focus/geometry | Existing `WidgetHost`, `WidgetFrame`, widget registry, and focus-without-remount lifecycle. |
| Text rendering | Shared Classic/Organism label projection, scale, contrast, inline-editor anchor, and export resolver. |
| Drawable symbols | Canonical icon registry after the separately audited C0.2 branch is accepted. Persist IDs and sparse placement overrides only. |
| Materials | Existing material registry/resolver and resource catalogue; the Inspector exposes quick bindings, not definitions. |
| Boundary/Core rendering | Existing Cell appearance settings and both renderer/export adapters. Appearance must not alter area, hit testing, selection, or Morph geometry. |
| History | Existing history transaction owner. One transaction per commit/paste; no history during hover or slider preview. |
| Persistence/migration | Existing project/config/saved-view/recovery schema and migration functions. Never persist registry objects. |
| Export | Existing renderer capture/export service. Selection orbit/editor/UI are always excluded; applied symbols are included by default. |

## Content contract

Production should extend the canonical Cell record with Body only through the existing graph migration path. Name, Area, and Body must be edited by both Canvas and Table over the same record.

- Inline editor: Enter/outside commit once, Escape cancel, Shift+Enter Body line break.
- A pointer gesture cannot begin a Cell drag while editing.
- Area remains finite, positive, and area-driven.
- Body display is clamped; content never resizes Cell geometry.
- Text preset/size/colour use project defaults plus sparse local overrides.
- Multi-selection displays Mixed and applies through one transaction.

## Symbol contract

- One primary symbol ID per Cell.
- UI command icons are not drawable symbols.
- Unknown persisted symbol IDs remain recoverable.
- Hover preview is ephemeral and reverts on leave/Escape.
- Apply/replace/remove are canonical commands with one history entry.
- Placement and backing persist as bounded sparse values, not copied registry definitions.
- Applied symbols export by default. No per-symbol `Include in Export` toggle.

If C0.2 is not yet merged, do not copy its branch code into this prototype branch. Integrate only after its independent acceptance.

## Copy/Paste Style contract

Copy:

- Fill, Boundary, Core
- Text Style, Text Size, Text Colour
- Symbol placement, scale, rotation, tint, backing

Exclude:

- Space Name, Area, Body
- symbol identity
- category, privacy, floor, relationships
- selection keyline/orbit

Pasting to multiple Cells must be one Undo transaction. Preview changes never enter history.

## Material relationship

The Cell Inspector owns only compact quick-material dots and `Open Material Browser`.

**FUTURE ONLY:** no Claude V2 target/Quick Materials rail prototype exists in the recovered worktree. The V1 shelf and Material Browser are design references only and have no production store, history, renderer, persistence, or export wiring. C0.5 Organism Target Rail, C0.6 Quick Materials, and C0.7 Material Browser are not implemented or verified by C0.3.

The future systems remain separate:

- Cell Inspector — compact selected-Cell editing
- target rail — active appearance target
- Quick Materials — recent/favourite compatible resources
- Material Browser — half-screen maximum deep library

## Verification required for production rebuild

- Focused contracts for content commits/cancel, inheritance/mixed values, symbol preview/commit/revert, Copy/Paste exclusions, history boundaries, persistence/migration, renderer parity, export exclusion, and unknown-ID recovery.
- Exactly one production build for that future implementation phase.
- Real-browser QA at 1440 and 1280.
- Owner visual approval before merge.
