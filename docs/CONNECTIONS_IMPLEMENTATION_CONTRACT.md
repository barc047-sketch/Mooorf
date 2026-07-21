# MOOORF Connections Implementation Contract

**Authority:** Owner-approved P1 architecture and performance foundation

**Applies to:** every Connections stage, renderer, editor, import, analysis, and export path

**Current stage:** P1 domain foundation; no Connections UI or renderer exists

## 1. Canonical product meaning

`Connection` is the only authored relationship record. The Master Graph and the central store own one canonical `connections` collection; Canvas, Table, statistics, matrices, analysis, and exports are projections of that collection.

A Connection keeps architectural meaning separate from optional presentation:

```text
Connection
├── id
├── fromSpaceId
├── toSpaceId
├── enabled
├── semantic
│   ├── typeId
│   ├── requirement
│   ├── direction
│   ├── strength
│   ├── priority
│   └── notes
└── visual?
    ├── visible
    ├── geometryId
    ├── strokePatternId
    ├── startMarkerId
    ├── endMarkerId
    └── lightweight appearance scalars
```

Semantic data must remain valid when visual data is absent, hidden, degraded, culled, unsupported, or rendered by a later adapter. Preview paths, pointer state, selection handles, resolved anchors, tessellation, and cached geometry are transient runtime data and never belong in this record.

Morph Bridge is a future modular representation of compatible semantic Connections. It is not a Connection field, semantic type, renderer fallback, or P1 implementation.

## 2. Registry contract

Launch semantic IDs are:

- `adjacency`
- `direct-access`
- `visual-access`
- `shared-support`
- `circulation-flow`
- `separation`

Every semantic definition owns a stable ID, user-facing name, concise description, category, default modifiers, optional suggested visual preset ID, future validation metadata, and stable Table/Matrix code. Store and UI branches consume the registry; they do not reproduce semantic behavior with scattered conditionals.

Modifier IDs are fixed at launch:

- requirement: `required`, `preferred`, `optional`, `avoid`
- direction: `none`, `two-way`, `a-to-b`, `b-to-a`
- strength: `weak`, `medium`, `strong`
- priority: `low`, `normal`, `high`, `critical`

Initial geometry IDs are `straight`, `curved`, `orthogonal`, and `elbow`. Initial stroke-pattern IDs are `solid`, `dashed`, `dotted`, `dash-dot`, `double`, and `segmented-bars`. Initial marker IDs are `none`, `open-arrow`, `filled-arrow`, `open-triangle`, `filled-triangle`, `circle`, `filled-dot`, `square`, `diamond`, `bar`, `slash`, `cross`, `architectural-tick`, and `chevron`.

Persist registry-compatible IDs, not registry objects or executable behavior. Unknown future semantic or visual IDs must remain recoverable. An unknown semantic type resolves through a safe fallback definition while retaining its authored `typeId`; it is never silently discarded or rewritten. Adding dozens of future stroke patterns or adapter IDs must not require rewriting every Connection record.

## 3. Commands, indexes, and history

All completed Connection mutations use the existing central store and history owner. Create, semantic update, visual update/removal, enable/disable, and delete each create exactly one Undo transaction. Preview state never creates history.

Connection creation rejects missing endpoints, Void endpoints, self-connections, and exact semantic duplicates. Different semantic types—and non-identical semantic records—may coexist between the same Cell pair. Exact duplicate comparison is pair-order independent and normalizes directional meaning when endpoint order is reversed.

Derived indexes provide:

- ID lookup;
- endpoint lookup for one Cell;
- unordered Cell-pair lookup;
- exact-semantic duplicate lookup.

Indexes are derived runtime structures and are not persisted. Cell deletion uses the endpoint index once, removes all dependent Connections in the same canonical transaction, and records one Undo entry. Undo restores the Cell, its dependent Connections, prior selection, and dependent resource placement together; Redo removes them together. No invalid endpoint ID may survive a completed delete, project import, or schedule replacement.

## 4. Persistence and data continuity

New projects and migrated projects without a Connections field normalize to an empty collection. Project JSON, `.mooorf` save/load, recovery snapshots, applicable schedule transfer, and Saved Views preserve canonical Connection records through existing owners. Settings-only configuration files do not duplicate Connections.

JSON data outputs include the canonical collection. P1 does not add Connection rows to the space CSV, visual lines to PNG/PDF/presentation ZIP, or any Classic SVG behavior. Later visual export work must use the existing authored snapshot and production Organism export path.

## 5. Non-negotiable performance rules

- Do not mount one React component per Connection in any future renderer.
- Do not write to the store or history on any animation frame.
- Do not persist derived path geometry, resolved anchors, visibility results, tessellation, or caches in project state.
- Do not run a permanent render loop for static Connections.
- Moving one Cell must eventually invalidate only Connections involving that Cell.
- Use indexed lookup by endpoint and unordered Cell pair.
- Cache resolved anchors and paths in the future renderer and invalidate them by dependency.
- Batch visible line rendering; do not issue one independent renderer tree or draw lifecycle per Connection.
- Cull offscreen Connections before path work and drawing.
- Use bounded level-of-detail for dense diagrams.
- Hide or degrade labels before degrading core semantic lines.
- Preserve the existing Organism pause while Table is active; Connections must not create a second scheduler.
- Never run unchecked all-to-all Cell-pair calculations.
- Keep selection overlays, handles, previews, and hit affordances separate from static Connection geometry.
- More than 500 authored spaces do not imply more than 500 simultaneously rendered Organism Cells; the current visible-nucleus limit remains 96.
- Preserve complete semantic data under every culling, label, quality, and visual fallback.
- Interaction latency outranks decoration. Static Connections sleep after invalidation; animated stages must use bounded existing runtime ownership.
- Production exports read one stable authored snapshot and never capture mutable preview or runtime cache state as truth.

## 6. Eight-stage Connections roadmap

Each stage requires a separate bounded Owner GO. Completion of one stage does not authorize the next.

### Stage 1 — Domain and performance foundation

Canonical types, six-type semantic registry, modifier and visual-ID contracts, validation, derived indexes/selectors, central-store commands, one-transaction history, dependent cleanup, project migration/save/load, Saved View continuity, JSON continuity, focused contracts, and this durable performance contract. No UI or renderer.

### Stage 2 — Authoring and selection surfaces

Add the bounded Connections launcher/tool flow, endpoint picking, ephemeral line preview, Connection selection, and Connection Inspector editing through the existing Dock, context host, Inspector, camera, and widget lifecycle. No parallel store or duplicated controls. Preview remains local; completion commits once.

### Stage 3 — Static batched Organism renderer

Add one batched static line layer for visible Connections, anchor resolution, dependency-based cache invalidation, culling, hit testing, and separate selection overlays. Preserve Table pause, demand-frame sleep, the 96-visible-nucleus limit, and one camera/scheduler. Establish authored PNG/PDF/presentation-ZIP parity through the detached Organism export owner; Classic remains untouched.

### Stage 4 — Visual grammar and readable labels

Activate registry-backed geometry, stroke-pattern, marker, appearance, Material, and Connection-label adapters without changing semantic records. Add bounded label collision/degradation rules, accessibility behavior, export parity, and truthful availability filtering. Dense fallback hides labels before core lines.

### Stage 5 — Relationship Matrix and Table projection

Add Table and Matrix projections over the same canonical collection, using stable registry codes, indexed queries, atomic edits, import/export diagnostics, virtualization, and bounded dense-data operations. Neither surface owns duplicate relationship state or runs all-to-all calculations.

### Stage 6 — Morph Bridge module

Introduce Morph Bridge as a separately registered representation derived from compatible Connection semantics. It owns its own validation and presentation adapter, never overloads the base Connection schema, never mutates Cell geometry implicitly, and falls back to the core semantic line when unsupported.

### Stage 7 — Cell Behaviour and analysis

Add bounded behavior/analysis consumers that read semantic Connections and explicit applied settings. Simulation and suggestions remain derived until the user applies one canonical transaction. Analysis cannot become a store, mutate authored semantics per frame, or bypass history.

### Stage 8 — Advanced motion and dense-scale finalization

Add optional animated-line adapters, final dense-diagram level-of-detail, worker/off-main-thread preprocessing where justified, stress evidence, accessibility/reduced-motion behavior, and complete export/data continuity. Animation uses the existing scheduler, sleeps when inactive, and never weakens the semantic source of truth.

## 7. Gate for later work

P1 proves data and ownership only. It does not prove visual quality, line performance, interaction feel, Matrix scalability, Morph Bridge behavior, animated-line cost, or renderer/export parity. Those claims require their own focused contracts, runtime evidence, Owner QA, and explicit stage authorization.
