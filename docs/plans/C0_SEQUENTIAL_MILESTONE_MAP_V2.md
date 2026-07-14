# MOOORF C0 Sequential Milestone Map V2

**Status:** Owner-review planning map. No production dispatch is authorized by this document.

## Core correction

Do not merge the audited C0.4F-A layer-separation commit into `main` as a standalone user-facing state while known appearance controls remain stale, broken or disconnected.

Use exact audited head `21388c0d765cd4bbc675d0321d94e77db9a41e5c` as the base of M1. Merge to `main` only after M1 restores complete, truthful layer editing.

This preserves the audit evidence while avoiding a temporarily incomplete production branch.

## M1 — Layer Editing Recovery and Dedicated Settings

**Proposed branch:** `feature/c0-m1-layer-editing-recovery`
**Exact base:** `21388c0d765cd4bbc675d0321d94e77db9a41e5c`

Goal: finish the product consequence of layer separation before redesigning the shell.

Included:

- map every currently visible appearance control,
- rebind, move or remove every stale/broken/no-op control,
- retain the compact Inspector as the context hub,
- add six dedicated widgets:
  - Cell Settings,
  - Boundary Settings,
  - Membrane Settings,
  - Membrane Edge Settings,
  - Core Settings,
  - Void Settings,
- Project Default / Local Override / Mixed,
- sparse overrides and canonical resolver only,
- one history transaction per commit,
- ephemeral slider previews,
- persistence/migration round-trip,
- clean PNG/SVG/PDF parity for exposed settings,
- migrate legacy Morph/Attachment/Density controls to Membrane ownership where valid,
- no visible disconnected control,
- 1440×900 and 1280×800 QA.

Excluded:

- bottom dock redesign,
- Material Browser,
- Quick Material rail,
- Preset rail,
- Connections,
- Annotation Card,
- new Symbol UI,
- advanced procedural Membrane work.

Merge result: C0.4F-A plus M1 become one complete usable layer-editing foundation on `main`.

## M2 — Symbol Registry Forward-Port and Production Symbol Inspector

Goal: integrate the previous audited registry and the Antigravity expansion research without merging old divergent branches wholesale.

Inputs:

- baseline registry branch `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`,
- Antigravity research branch `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`,
- candidate manifest `docs/research/C0_2_SYMBOL_CANDIDATE_MANIFEST.json`.

Included:

- forward-port the 77-symbol canonical baseline,
- ingest the 59 verified Lucide additions after current-package validation,
- ingest the 14 aliases with deterministic canonical normalization,
- keep the 5 rejected candidates excluded,
- preserve UI-command icons as a separate registry,
- build the real Inspector Symbol tab/library,
- search, categories, recent, favourites and hover preview,
- one primary symbol per Cell,
- placement, scale, rotation, tint and backing,
- history, persistence and export,
- no raw/base64 assets and no unverified third-party SVGs.

Deferred to a custom-symbol milestone:

- 8 original custom vectors: elevator cab, stairs plan, escalator section, wardrobe plan, sink plan, gate swing, floor drain and section cut.

The baseline grid registry is forward-ported here only if required by shared catalogue dependencies; visible grid controls and snapping remain a later milestone.

## M3 — Bottom Dock and Shared Contextual Rails

- left: Select, Target, Arrange,
- centre: Add Cell, Add Cluster, Add Void,
- right: Connect, Material, Preset, Markup, Detail,
- one reusable contextual rail,
- move/remove duplicate old launchers,
- no false feature activation.

M3 comes after M1 because shell redesign must not precede working layer controls.

## M4 — Quick Materials, Presets and Material Browser

- active-target filtering for Cell, Boundary, Membrane, Edge, Core and Void,
- later Connection and Annotation compatibility hooks,
- circular quick shelf,
- recents/favourites,
- hover preview/revert,
- one-third browser and optional half-screen studio,
- parameter-driven knobs/faders/volume bars,
- registry IDs and sparse overrides only,
- future premium shader compatibility without arbitrary persisted shader source.

## M5 — Straight Connection Foundation

- semantic Relationship separate from Visual Connection,
- straight centre-to-centre line,
- create/select/hide/delete,
- line follows Cell movement,
- solid/dashed/dotted, width, opacity, material and direction,
- Connection Settings with Meaning and Line sections,
- persistence/history/export.

The Antigravity `diagram` and relationship-link symbol candidates feed the drawable library and future connection presets, but drawable symbols never replace the canonical connection model.

## M6 — Markup and Annotation Foundation

- Markup rail,
- standalone Annotation Card,
- optional transparent PNG logo,
- heading/body/position/size/text preset/material/export visibility,
- Annotation Studio,
- move existing label-mode AnnotationWidget to Inspector Content → Label Settings,
- use the research annotation-symbol category in the drawable library,
- custom architectural section-cut symbol may be introduced here after original-vector approval.

## M7 — Arrange, Grid and Snapping

- align/distribute/pack/cluster,
- deterministic one-transaction transforms,
- forward-ported grid registry becomes truthful visible controls,
- snapping separate from grid display,
- no metadata-only option presented as functional.

## M8 — Area, Table and Import Completion

- Area editing,
- Table/Canvas sync,
- CSV/XLS/XLSX reliability,
- import never silently resets layout,
- one Master Graph.

## M9 — Floors, Stats and Dashboard

- floors,
- derived selectors,
- floor-aware Canvas/Table,
- compact dashboard and graph health.

## Custom architectural symbol milestone

The 8 custom candidates require original MOOORF-owned vectors, visual QA and geometry validation. They must not be substituted with misleading Lucide approximations. This milestone can run after M2 or alongside M6, but only after the Owner reviews the exact symbol drawings.

## Dispatch protocol

For every milestone:

1. show the complete proposed scope to the Owner,
2. absorb additions/corrections,
3. write the fixed Codex contract,
4. dispatch only after explicit `GO CODEX M#`,
5. Codex pushes one fixed head and stops at `WAITING_REVIEW`,
6. verify evidence and merge only after explicit Owner approval,
7. show the next milestone before creating or dispatching its final contract.
