# MOOORF C0 Sequential Milestone Map V3

**Status:** Owner-review planning map. No production dispatch is authorized by this document.

## Core correction

Do not merge the audited C0.4F-A layer-separation commit into `main` as a standalone user-facing state while known appearance controls remain stale, broken or disconnected.

Use exact audited head `21388c0d765cd4bbc675d0321d94e77db9a41e5c` as the base of M1. Merge to `main` only after M1 restores complete, truthful editing.

This preserves the audit evidence while avoiding a temporarily incomplete production branch.

---

## Proven asset and research ledger

Every prior useful output has a named production destination. Nothing is merged wholesale; every item is selectively forward-ported into the current architecture.

### A. C0.4F-A runtime layer separation

- Branch/head: `feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`
- Independent audit: `MERGE CANDIDATE`
- Production destination: exact base of M1.
- Supplies: six separated Organism targets, technical Boundary strokes, canonical runtime projection, selection isolation, migration and renderer foundations.

### B. Claude C0.3 Inspector prototype and locked scope

- Prototype branch/head: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`
- Product scope: `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`
- Never merge the prototype branch wholesale.

Production destinations:

- **M1:** Inspector geometry, Content editing, double-click Name/Area/Body, Text Style presets, inheritance states, Copy/Paste/Reset Style, selection-orbit option where safe.
- **M2:** Symbol library, search/categories, recents/favourites, hover preview, placement, tint and backing.
- **M3:** contextual bottom-rail and right-panel composition concepts.
- **M4:** Material Browser composition, circular previews, hover preview/revert, compact parameter controls.

Rejected prototype parts remain rejected:

- mock store,
- hard-coded Cells,
- duplicate icon/material arrays,
- fake export,
- full prototype shell,
- fish-eye magnification.

### C. Audited C0.2 Icon/Grid registry

- Branch/head: `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`
- Production destinations:
  - M2: drawable symbol registry and catalogue dependencies,
  - M7: grid registry, rendering and snapping.
- Old divergent branch is never merged wholesale.

### D. Antigravity symbol expansion research

- Branch/head: `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`
- Outputs:
  - 77-symbol audited baseline,
  - 59 verified Lucide additions,
  - 14 aliases,
  - 8 custom-vector candidates,
  - 5 rejected candidates,
  - target 144 active geometries / 164 searchable IDs after custom vectors.

Production destinations:

- **M2:** baseline 77, verified 59 additions, 14 aliases, search tags, accessibility metadata; keep all 5 rejects excluded.
- **M5:** diagram/link candidates support drawable symbols and preset vocabulary only; they never replace canonical graph Connections.
- **M6:** annotation-category symbols feed Markup tools.
- **M7:** any relevant grid/catalogue dependencies.
- **Custom Symbol milestone:** eight original MOOORF-owned vectors after Owner visual approval.

### E. Antigravity fast-track atlas

- Branch/head: `research/c0-fast-track-essential-product-atlas@348ee8cd62e45de1b1c51f144e1b7607acd016ee`
- Production destination: contract input for every milestone from M1 through hardening.
- Supplies exact provenance, ownership, dependency, risk and reuse guidance.
- Research branch is never merged wholesale.

---

## M1 — Production Inspector, Content and Layer Editing Recovery

**Proposed branch:** `feature/c0-m1-inspector-layer-editing-recovery`
**Exact base:** `21388c0d765cd4bbc675d0321d94e77db9a41e5c`

### Goal

Finish the user-facing consequence of layer separation and recover the strongest approved Inspector interactions before redesigning the shell.

### Inspector shell

- compact production Inspector using `WidgetFrame` and `WidgetHost`,
- context hub retained rather than one giant settings form,
- initial live tabs:
  - Content,
  - Appearance,
- Symbol tab becomes fully live in M2; no fake or dead Symbol UI in M1,
- no-selection, one-Cell and multi-selection contexts,
- Project Default / Local Override / Mixed,
- pinned/right-zone behaviour at 1440,
- floating behaviour at 1280.

### Content editing from Claude prototype

Double-clicking a Cell opens one compact inline editor for:

1. Space Name,
2. Area,
3. Body/subtext.

Required behaviour:

- Enter commits,
- outside click commits,
- Escape cancels,
- Shift+Enter inserts a Body line break,
- Cell drag is suspended while editing,
- Body remains approximately 2–3 visible lines and never changes Cell geometry,
- Area remains numeric and area-driven,
- Name/Area/Body write to the canonical Master Graph/store,
- existing Table projection must reflect these same values where already supported,
- no broad Table redesign, bulk editor or import redesign in M1.

Content controls:

- complete Text Style presets: Technical, Editorial, Minimal, Compact, Presentation and Diagram,
- one proportional Text Size,
- Text Colour with Auto Contrast and project swatches,
- Project Text Default / Local Override / Mixed,
- no uncontrolled typography panel.

### Appearance and dedicated layer settings

Map every visible appearance control and do exactly one:

- rebind to canonical owner,
- move to correct layer widget,
- remove/hide because unsupported or deferred.

Dedicated widgets:

- Cell Settings,
- Boundary Settings,
- Membrane Settings,
- Membrane Edge Settings,
- Core Settings,
- Void Settings.

Required ownership:

- six canonical Organism targets only,
- sparse overrides and `resolveCellAppearance`,
- no second settings store,
- one history transaction per commit,
- ephemeral slider previews,
- persistence/migration round-trip,
- clean PNG/SVG/PDF parity for exposed settings,
- migrate legacy Morph/Attachment/Density controls to Membrane ownership where valid,
- no visible disconnected control.

### Style actions

- Copy Style,
- Paste Style,
- Reset Target,
- Reset All Appearance,
- Save as Preset hook only if it can truthfully store a canonical preset; otherwise defer the visible action to M4,
- content values and symbol identity excluded from Copy Style,
- multi-Cell Paste is one Undo transaction.

### Selection feedback

- preserve current clean keyline,
- selectively adapt the approved dotted orbit as an optional temporary editing overlay only if it remains renderer-neutral, non-persistent, non-exported and reduced-motion safe,
- never confuse orbit with Boundary or Core.

### M1 exclusions

- bottom dock redesign,
- Material Browser,
- Quick Material rail,
- Preset rail implementation,
- Connections,
- Annotation Card,
- production Symbol library,
- advanced procedural Membrane work,
- broad Table redesign/import.

### M1 merge result

C0.4F-A plus M1 become one complete usable Content + layer-editing foundation on `main`.

---

## M2 — Symbol Registry Forward-Port and Production Symbol Inspector

Goal: integrate the previous audited registry and Antigravity expansion research without merging old divergent branches wholesale.

Inputs:

- baseline registry `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`,
- Antigravity research `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`,
- candidate manifest `docs/research/C0_2_SYMBOL_CANDIDATE_MANIFEST.json`,
- Claude Inspector prototype Symbol tab.

Included:

- forward-port the 77-symbol canonical baseline,
- ingest the 59 verified Lucide additions after current-package validation,
- ingest the 14 aliases with deterministic canonical normalization,
- keep the 5 rejected candidates excluded,
- preserve UI-command icons as a separate registry,
- build the real Inspector Symbol tab/library,
- search, categories, recent, favourites and hover preview,
- one primary symbol per Cell,
- placement presets, offset X/Y, scale, rotation, tint and backing,
- backing size/offset/opacity/outline,
- hide-when-zoomed-out,
- history, persistence and export,
- no raw/base64 assets and no unverified third-party SVGs.

Deferred to custom-symbol milestone:

- elevator cab,
- stairs plan,
- escalator section,
- wardrobe plan,
- sink plan,
- gate swing,
- floor drain,
- section cut.

The baseline grid registry is forward-ported here only when required by shared catalogue dependencies; visible grid controls and snapping remain M7.

---

## M3 — Bottom Dock and Shared Contextual Rails

- selectively adapt Claude’s contextual bottom-rail composition,
- left: Select, Target, Arrange,
- centre: Add Cell, Add Cluster, Add Void,
- right: Connect, Material, Preset, Markup, Detail,
- one reusable contextual rail,
- move/remove duplicate old launchers,
- no false feature activation,
- no fish-eye magnification.

M3 comes after M1 because shell redesign must not precede working layer controls.

---

## M4 — Quick Materials, Presets and Material Browser

Inputs:

- production material registry,
- Claude V1/V2 Material Browser and quick-shelf design evidence,
- M1 target ownership,
- M3 launchers/rails.

Included:

- active-target filtering for Cell, Boundary, Membrane, Edge, Core and Void,
- later Connection and Annotation compatibility hooks,
- circular quick shelf,
- recents/favourites,
- hover preview/revert,
- target presets and complete Cell presets,
- one-third Browser and optional half-screen Studio,
- parameter-driven knobs/faders/volume bars,
- registry IDs and sparse overrides only,
- future premium shader compatibility without arbitrary persisted shader source.

---

## M5 — Straight Connection Foundation

- semantic Relationship separate from Visual Connection,
- straight centre-to-centre line,
- create/select/hide/delete,
- line follows Cell movement,
- solid/dashed/dotted, width, opacity, material and direction,
- Connection Settings with Meaning and Line sections,
- persistence/history/export.

Antigravity diagram/link symbols support the drawable library and preset vocabulary, but drawable symbols never replace the canonical connection model.

---

## M6 — Markup and Annotation Foundation

- Markup rail,
- standalone Annotation Card,
- optional transparent PNG logo,
- heading/body/position/size/text preset/material/export visibility,
- Annotation Studio,
- move existing label-mode AnnotationWidget to Inspector Content → Label Settings,
- use Antigravity’s annotation-category symbols,
- custom architectural section-cut symbol only after original-vector Owner approval.

---

## M7 — Arrange, Grid and Snapping

- align/distribute/pack/cluster,
- deterministic one-transaction transforms,
- forward-port the C0.2 grid registry,
- truthful visible grid controls,
- snapping separate from display,
- no metadata-only option shown as functional.

---

## M8 — Table and Import Completion

M1 already supplies direct Name/Area/Body editing through the canonical store. M8 completes the broader data workspace:

- full Table/Canvas sync hardening,
- category/privacy/floor fields,
- bulk edit,
- reliable CSV/XLS/XLSX,
- import never silently resets layout,
- one Master Graph,
- no duplicate table data.

---

## M9 — Floors, Stats and Dashboard

- floors,
- derived selectors,
- floor-aware Canvas/Table,
- compact dashboard,
- graph health.

---

## Custom architectural symbol milestone

The eight custom candidates require original MOOORF-owned vectors, visual QA and geometry validation. They must not be substituted with misleading generic icons. This milestone can run after M2 or alongside M6, but only after the Owner reviews the exact symbol drawings.

---

## Dispatch protocol

For every milestone:

1. show the complete proposed scope to the Owner,
2. absorb additions/corrections,
3. write the fixed Codex contract,
4. dispatch only after explicit `GO CODEX M#`,
5. Codex pushes one fixed head and stops at `WAITING_REVIEW`,
6. verify evidence and merge only after explicit Owner approval,
7. show the next milestone before creating or dispatching its final contract.
