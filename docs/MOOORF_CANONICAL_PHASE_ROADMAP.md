# MOOORF Canonical Phase Roadmap

**Status:** Canonical planning and sequencing document
**Authority:** Required before every new milestone, worker brief, implementation, audit, or merge decision
**Product-code effect:** None. This document plans work; it does not authorize implementation.
**Current production base at publication:** `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

## 1. Purpose

This roadmap converts the full MOOORF product scope into a dependency-safe implementation sequence.

It exists so that:

- new Owner ideas modify the plan before they modify code,
- workers do not implement attractive but premature features,
- prototypes are treated as design evidence rather than mergeable product code,
- the Master Graph remains the only project-data source of truth,
- Organism layers, materials, connections, Data, Dashboard, exports and shell work are introduced in a controlled order,
- every milestone has a clear completion gate and Owner review point.

The roadmap may change as the Owner refines the product, but changes must follow `docs/MOOORF_CHANGE_CONTROL_PROTOCOL.md`.

---

## 2. Product architecture that governs all phases

### 2.1 Organism system

`Organism` is the umbrella architectural composition, not the name of one thick outer circle.

```text
ORGANISM
├── Cell
├── Boundary
├── Membrane
├── Membrane Edge
├── Core
└── Void
```

- **Cell** — the architectural space. It is area-driven and always visible.
- **Boundary** — the independent visual edge of a Cell. Visual offset never changes Cell area or hit testing.
- **Membrane** — the optional shared spatial field or envelope around Cells.
- **Membrane Edge** — an appearance target independent from Membrane fill.
- **Core** — an optional central architectural/diagrammatic marker. It never represents selection.
- **Void** — a subtractive architectural element such as courtyard, atrium, setback or exclusion region.
- **Selection UI** — temporary editing feedback. It is not Organism content and is never exported.

### 2.2 Connection system

Connections are related to the Organism but remain a separate architectural family.

```text
CONNECTION SYSTEM
├── Relationship
├── Visual Connection
├── Morph Bridge
└── Cell Behaviour
```

- **Relationship** — semantic Master Graph information. It may exist without a visible line.
- **Visual Connection** — the line rendered on the Canvas.
- **Morph Bridge** — a physical-looking Membrane connection, not a normal line.
- **Cell Behaviour** — merge, touch, keep-clear, attract, repel, bridge or ignore behaviour. It must not silently change semantic Relationships.

Changing line style must never change architectural meaning. Changing Membrane material must never change a Visual Connection or Cell Boundary.

### 2.3 Primary production ownership rule

```text
MASTER GRAPH = brain
Canvas / Table / Floors / Data / Dashboard / Sankey / Charts /
Bylaw Check / Export = views
```

No phase may introduce a second project-data store, duplicate material registry, duplicate icon registry, duplicate camera, duplicate history path or mock export system.

---

## 3. Roadmap summary

| Phase | Main result | Status / gate |
|---|---|---|
| C0.1 | Stable single Canvas runtime and basic editing | Accepted; deeper ~50+ Cell optimisation deferred |
| C0.2 | Legal icon and grid registry foundation | Implemented and independently marked merge candidate |
| C0.3P | Cell Inspector V2 design prototype | Built; Owner manual QA pending |
| C0.4 | Explicit Organism layer separation | Planned; must precede production Inspector integration |
| C0.5 | Production Cell Inspector and selection orbit | Planned after C0.4 and C0.2 merge |
| C0.6 | Organism target rail | Planned after target ownership is stable |
| C0.7 | Quick Materials rail | Planned after target rail |
| C0.8 | Production Material Browser | Planned after Quick Materials |
| C0.9 | Grid controls and snapping | Planned after C0.2 registry merge |
| C0.10 | Connection foundation | Planned after Organism/material foundations |
| C0.11 | Advanced connections | Later, after connection foundation is stable |
| C0.12 | Advanced Membrane | Later, performance-gated |
| C0.13 | Arrange and Markup foundation | Later, after Organism and Connections |
| C0.14 | Canvas/export hardening | Gate before broad shell and analysis expansion |
| C1 | Desktop shell evolution | Incremental rail/dock/drawer implementation |
| C2 | Master Graph, Data, Floors and Analysis | Table sync, floor system, dashboard and graph views |
| C3 | Project, import, export and presentation system | Files, frames, queues and presentation workflows |
| C4 | Rules, bylaw and city-pack system | Structured compliance and warning engine |
| C5 | Templates, onboarding and assisted workflows | Beginner flows, galleries, presets and AI assistance |
| C6 | Accounts, cloud, collaboration, commercial and devices | Last major platform layer; tablet/phone last |

---

# 4. C0 — Canvas and architectural editing foundation

## C0.1 — Canvas stabilisation

### Goal

A reliable single Canvas runtime before richer editing systems are added.

### Included

- one stable Canvas runtime,
- pan, zoom and Cell drag,
- multi-selection and group drag,
- basic inline Name/Area editing,
- Morph/Membrane visibility wiring,
- Motion wiring,
- clear primary/secondary selection,
- Auto Contrast preservation,
- no bottom-dock hover magnification,
- stable blur and no UI shadows.

### Current status

Accepted by the Owner. Dense-scene interaction slowdown around approximately 50+ Cells remains a known limitation. Deeper optimisation is deferred and is not claimed fixed.

### Gate

- normal projects remain usable,
- known limitations are documented,
- later milestones do not reintroduce multiple render loops or expensive frame derivations.

---

## C0.2 — Icon and Grid Asset Registry

### Goal

Create legal, stable resource IDs and metadata before any production symbol or grid UI consumes them.

### Included

- 77 verified drawable symbols,
- UI-command icons kept separate from drawable symbols,
- eight canonical grid definitions,
- licence and provenance metadata,
- categories, tags and accessibility labels,
- legacy ID normalisation,
- unknown-ID recovery,
- resource catalogue integration,
- ID-only persistence contracts,
- focused registry tests.

### Current status

Implementation branch: `feature/c0-2-icon-grid-asset-registry`
Head: `028c90541481b07a185e768fae921a7108a4e5d2`
Independent audit result: `MERGE CANDIDATE`.

### Explicit exclusions

- no Inspector UI,
- no Canvas placement system,
- no live implementation of the six future grid styles,
- no package or renderer changes.

### Gate

Merge only after a narrow merge brief verifies current `main`, runs focused contracts and one final build.

---

## C0.3P — Cell Inspector V2 prototype

`P` means prototype. This phase is not production implementation.

### Goal

Approve the interaction and visual language of a compact Cell Inspector before rebuilding it against production state.

### Prototype branch

`design/c0-3-cell-inspector-v2-lab`
Head: `462bf9bacbb1ee60015fc1e794539ab3b25f6b97`

### Included prototype behaviour

- three tabs: Content, Symbol and Cell Style,
- double-click Cell editor for Space Name, Area and Body,
- Enter and click-outside commit,
- Escape cancel,
- Shift+Enter Body line break,
- Body clamped to approximately 2–3 lines without resizing the Cell,
- Text Style presets controlling Heading + Area + Body together,
- one global Text Size control,
- Text Colour and Auto Contrast,
- Project Default, Local Override and Mixed multi-selection states,
- one primary symbol per Cell with many library choices,
- search, categories, recents, favourites and hover preview,
- symbol placement, scale, rotation, tint and backing,
- Cell Fill, Boundary and Core controls,
- Copy/Paste Style excluding content and symbol identity,
- dotted selection orbit as temporary UI.

### Explicit truthfulness boundary

The prototype does not implement:

- real Master Graph/Table persistence,
- production Undo/Redo,
- renderer/export integration,
- target rail,
- Quick Materials,
- production Material Browser,
- production resource/state ownership.

### Current status

Waiting for Owner manual QA. A hard narrow-screen prototype blocker may need a small revision to allow QA on the Owner's actual laptop; that is a prototype usability correction, not a product-scope change.

### Gate

Owner chooses one:

- `APPROVE FOR PRODUCTION REBUILD`, or
- `REVISE PROTOTYPE` with a consolidated issue list.

The prototype branch is never merged wholesale into production.

---

## C0.4 — Explicit Organism layer separation

### Why this must come before production Inspector integration

The Inspector cannot safely edit Cell, Boundary, Membrane, Membrane Edge and Core until those targets have explicit production ownership. Implementing the Inspector first would bind controls to temporary or combined state and create rework.

### Goal

Make every visible architectural layer explicit across state, renderer, export, persistence and material targeting.

### Required targets

```text
Cell
Boundary
Membrane
Membrane Edge
Core
Void
Selection UI
```

### Required behaviour

#### Cell

- always visible,
- size remains area-driven,
- independent fill/material,
- valid selection and drag target,
- visual settings cannot alter area data.

#### Boundary

- independent visibility,
- styles: none, hairline, solid, dashed, dotted, double, technical,
- width, offset and inner/centre/outer alignment,
- visual offset does not change area or hit testing,
- material/colour/gradient/pattern compatibility only where technically safe.

#### Membrane

- independently toggleable,
- separate fill/material target,
- current Morph logic preserved,
- shape and motion settings remain store-owned,
- no connection-line ownership.

#### Membrane Edge

- independent visibility and appearance,
- width, softness, opacity and alignment,
- separate material target from Membrane fill.

#### Core

- independently toggleable,
- initial shapes: dot, circle and ring only when renderer/export parity supports them,
- size, opacity and material ownership,
- never used as selection feedback.

#### Void

- separate fill and edge,
- subtraction behaviour remains architectural rather than cosmetic,
- clearance/buffer behaviour separated from visual offset.

#### Selection UI

- clean keyline, dotted orbit or both,
- never persisted as Cell style,
- never included in export,
- reduced-motion fallback.

### Internal rendering order to validate

```text
Selection and Editing UI
Labels and Markup
Core
Boundary
Cell
Visual Connections
Morph Bridges
Membrane Edge
Membrane
Grid and Background
```

Exact renderer ordering may be adjusted after inspection, but semantic ownership must remain separate.

### Gate

- changing one target never unintentionally changes another,
- export and persistence recognise every target,
- Classic and Organism renderers remain compatible,
- no duplicate material system or state store,
- focused layer-contract tests and 1440/1280 QA pass.

---

## C0.5 — Production Cell Inspector and selection orbit

### Prerequisites

- C0.2 registry merged,
- C0.3P Owner-approved,
- C0.4 Organism targets implemented and audited.

### Goal

Rebuild the approved prototype in production React and connect it to existing owners.

### Production ownership

- Name, Area and Body: Master Graph and Table projection,
- selection: existing selection owner,
- panel: WidgetHost/WidgetFrame,
- history: existing Undo/Redo transaction owner,
- symbols: C0.2 canonical icon registry,
- Fill/Boundary/Core: C0.4 target ownership,
- export: existing export service,
- persistence: existing migration path.

### Included

- Content, Symbol and Cell Style tabs,
- real Canvas/Table sync,
- inline editor commit/cancel behaviour,
- sparse Project Default and Local Override settings,
- Mixed multi-selection values,
- one history transaction per commit or multi-paste,
- ephemeral slider/hover previews,
- one primary symbol per Cell,
- Copy/Paste Style with explicit exclusions,
- selection orbit as overlay UI.

### Excluded

- full Material Browser,
- target rail,
- Quick Materials,
- relationship controls,
- advanced Membrane controls.

### Gate

- focused data/history/persistence/export contracts pass,
- one production build passes,
- no selector loops or fresh-object Zustand selectors,
- Owner QA passes at 1440 and 1280.

---

## C0.6 — Organism target rail

### Goal

Give the user one clear active appearance target.

```text
Cell · Boundary · Membrane · Membrane Edge · Core · Void
```

### Interaction

- circular, fixed-size target buttons,
- unique technical glyph for each target,
- active state uses keyline, signal dot and subtle tint,
- no solid-black active fill,
- no hover magnification,
- target priority:
  1. last edited valid target,
  2. current control context,
  3. selected object type,
  4. Cell fallback.

### Gate

The user can always understand what will change before applying a material or style.

---

## C0.7 — Quick Materials rail

### Goal

Provide fast target-compatible materials without opening the full browser.

### Included

- active-target label,
- compatible material filtering,
- circular swatches,
- recent and favourite materials,
- hover preview and deterministic revert,
- click to apply,
- `More Materials` action,
- production registry only.

### Gate

Changing Membrane material never changes Cell, Boundary, Core or connection materials. Preview never enters history; apply creates one transaction.

---

## C0.8 — Production Material Browser

### Goal

Provide a deep searchable material library while keeping the Canvas visible.

### Approved prototype concepts to adapt

- circular material previews,
- search and categories,
- recents and favourites,
- target compatibility,
- selected material preview,
- compact parameter controls,
- source/licence information,
- maximum half-screen geometry.

### Must be rebuilt

- React structure,
- registry queries,
- Zustand integration,
- history transactions,
- persistence,
- renderer preview/apply,
- export compatibility.

### Rejected

- full prototype shell import,
- mock material arrays,
- fish-eye or Mac-Dock magnification,
- clipped shelves,
- fake Apply/export logic.

### Gate

Canvas remains visible, browser uses production registries only, and target compatibility is enforced.

---

## C0.9 — Grid controls and snapping

### Goal

Turn the C0.2 grid registry into truthful Canvas controls.

### Initial scope

- None and Dotted current behaviour,
- progressive implementation of approved future presets,
- size and major/minor parameters,
- theme compatibility,
- display and snapping separated,
- snapping commits only on pointer release,
- no continuous expensive snapping calculations during drag.

### Gate

Each grid reports truthfully whether rendering, snapping and export are implemented. No metadata-only preset appears functional.

---

## C0.10 — Connection foundation

### Goal

Implement semantic Relationships and visible lines as separate systems.

### Initial scope

#### Relationship

- type,
- direction,
- strength,
- priority,
- required/preferred,
- notes,
- may exist without a line.

#### Visual Connection

- create, select and delete,
- straight and curved geometry,
- automatic Cell-Boundary anchors,
- solid, dashed and dotted styles,
- thickness and opacity,
- material,
- direction arrow,
- updates while Cells move,
- screen-size default for conceptual diagrams.

#### Morph Bridge

- minimal enable/disable and width/fusion foundation only when Membrane ownership can support it safely.

#### Cell Behaviour

- merge, touch, keep clear, attract, repel, bridge and ignore,
- must not silently create or change a Relationship.

### Gate

- line appearance changes without altering semantic data,
- Relationship can exist invisibly,
- movement updates attachments deterministically,
- one connection system and one graph owner only.

---

## C0.11 — Advanced connections

### Included later

- Bezier,
- orthogonal and elbow routes,
- arcs,
- double and dash-dot lines,
- dash/gap controls,
- line labels,
- custom anchors,
- start/end markers,
- animated flow,
- screen/world thickness,
- presets such as Adjacency, Direct Access, Visual Link, Circulation, Service, Avoid and Presentation.

### Gate

Presets may recommend semantic and visual settings, but both remain separately editable.

---

## C0.12 — Advanced Membrane

### Goal

Translate current technical Morph controls into understandable architectural presets without sacrificing performance.

### Presets

```text
Soft · Fluid · Tidal · Folded · Crisp · Cellular
```

### Advanced controls

- reach,
- fusion,
- tension,
- pocket amount,
- waves and frequency,
- fold depth and scale,
- edge ripple,
- contour variation,
- flow direction,
- breathing and wobble,
- motion response.

### Safety

- geometry and motion remain separate from material selection,
- performance profile first,
- quality levels degrade gracefully,
- no additional uncontrolled render loop.

### Gate

15-Cell Morph remains smooth; larger projects reduce quality predictably rather than failing.

---

## C0.13 — Arrange and Markup foundation

### Arrange

- align and distribute,
- pack and cluster,
- floor/category arrangements,
- keep-clear behaviour,
- repeatable presets,
- no Random Scale because area owns Cell size.

### Markup

- labels and notes,
- dimensions,
- north and environmental arrows,
- project block,
- frames,
- technical annotation symbols,
- basic typography presets rather than uncontrolled font settings.

### Gate

Markup does not corrupt Master Graph data; Arrange creates deterministic Undo transactions.

---

## C0.14 — Canvas and export hardening

### Goal

Stabilise the complete C0 editing platform before larger workspaces depend on it.

### Included

- renderer parity,
- export parity,
- migration and recovery tests,
- keyboard and command palette contracts,
- performance profiling,
- 1440 and 1280 collision checks,
- deferred dense-scene performance review,
- selection/editor/UI export exclusion,
- SVG/PNG/PDF compatibility review.

### Gate

No Critical or Major issue remains in C0 foundations.

---

# 5. C1 — Desktop shell evolution

The shell is implemented incrementally. Entire prototype shells are never merged.

## C1A — Top clusters

- project identity,
- save/state feedback,
- mode/workspace switch,
- Quick View icon-only controls.

## C1B — Permanent left rail

- stable long rail,
- no hover magnification,
- tooltips and keyboard hints,
- active state via keyline/signal dot/tint.

## C1C — Contextual left subrail

- appears beside the permanent rail,
- contains context-specific subtools,
- does not duplicate Inspector controls.

## C1D — Bottom dock structure

```text
Select · Organism · Materials · Arrange · + SPACE · Connect · Markup · Present
```

- two horizontally expandable docks around central `+ Space`,
- one common contextual rail above,
- stable button dimensions,
- no fish-eye behaviour.

## C1E — Right-side panel positioning

- Inspector and quick-material rail placement,
- movable/pinnable secondary panels,
- Material Browser maximum 50vw,
- Canvas always visible.

## C1F — Global Project Drawer

- files,
- project settings,
- references,
- imports,
- export/download access,
- global rather than duplicated per workspace.

### C1 gate

Each subphase requires production implementation, 1440 screenshot, 1280 screenshot, Owner approval and only then progression.

---

# 6. C2 — Master Graph, Data, Floors and Analysis

## C2.1 — Master Graph contract expansion

- ProjectMeta,
- FloorNode,
- SpaceNode,
- RelationshipEdge,
- FlowPath,
- CategoryDefinition,
- derived GraphStats,
- stable IDs and migrations.

## C2.2 — Table and Canvas sync

- Space Name, Area and Body,
- category, privacy and floor,
- relationships,
- bulk edit,
- CSV/Excel import,
- view changes never reset Canvas,
- import never silently destroys layout.

## C2.3 — Floor system

- add/remove/reorder floors,
- visible and locked states,
- floor filtering,
- floor totals,
- floor-aware Canvas and Table.

## C2.4 — Data workspace

- full table,
- split Canvas/table,
- compact overlay table,
- equal status with Canvas and Dashboard.

## C2.5 — Derived statistics

- total area and built-up area,
- FAR and ground coverage,
- category and privacy totals,
- public/private and service ratios,
- largest spaces,
- missing-data warnings,
- graph health.

## C2.6 — Dashboard

- donut/pie where appropriate,
- floor and category summaries,
- relationship health,
- export summary,
- no cheap generic SaaS cards.

## C2.7 — Graph views

- Sankey/flow,
- adjacency matrix,
- shortest paths,
- relationship filtering,
- graph-derived only.

### C2 gate

Every view is computed from the same Master Graph. No manually maintained duplicate statistics.

---

# 7. C3 — Project, import, export and presentation system

## C3.1 — Project persistence and recovery

- local-first save,
- recovery snapshots,
- migrations,
- project metadata,
- no cloud dependency yet.

## C3.2 — Import contract

- CSV,
- Excel,
- JSON,
- schema validation,
- preview and error reporting,
- sample templates,
- stable import mapping.

## C3.3 — References and uploads

- whole Canvas as drag/drop target where appropriate,
- project asset references,
- no duplicated uploader,
- generated images reopen projects only when metadata exists.

## C3.4 — Frames and presentation

- export frames,
- A2 and presentation composition,
- frame list and active frame,
- project block,
- view presets.

## C3.5 — Export foundation

- PNG,
- SVG,
- PDF,
- project data formats,
- export parity with Canvas targets,
- selection/UI excluded.

## C3.6 — Export queue and Download Center

- queued heavy exports,
- non-blocking progress,
- ZIP for multiple frames,
- GIF/animation only after performance proof,
- download history and failure recovery.

### C3 gate

Export never blocks normal editing and never uses fake prototype data.

---

# 8. C4 — Rules, bylaws and city packs

## C4.1 — Rule-engine foundation

- structured rule schema,
- warnings rather than silent mutation,
- source and jurisdiction metadata,
- versioning and effective dates.

## C4.2 — Bylaw checks

- FAR,
- ground coverage,
- setbacks,
- parking,
- height and floor limits,
- occupancy and circulation warnings where data supports them.

## C4.3 — City packs

- researched sources,
- auditable citations,
- separated data ingestion from UI,
- no unsupported legal claims.

## C4.4 — Warning and resolution UX

- severity,
- affected Cells/floors,
- source link,
- suggested review action,
- no automatic architectural compliance guarantee.

### C4 gate

Every rule is traceable, versioned and presented as assistance—not legal certification.

---

# 9. C5 — Templates, onboarding and assisted workflows

## C5.1 — Beginner Add Space flow

- simple first-run path,
- starter categories,
- common architectural templates,
- advanced controls remain discoverable rather than overwhelming.

## C5.2 — Template gallery

- project templates,
- diagram style templates,
- text-style presets,
- material and connection presets,
- legal asset provenance.

## C5.3 — Saved style presets

- Cell styles,
- text systems,
- connection styles,
- project/category/floor scope,
- inheritance and override visibility.

## C5.4 — Assisted arrangement and diagnostics

- deterministic recommendations,
- missing-data prompts,
- adjacency suggestions,
- graph health guidance,
- user approves all structural changes.

## C5.5 — AI assistance

- generate or refine program schedules,
- suggest relationships,
- explain warnings,
- create editable starting points,
- never replace the Master Graph with hidden AI state,
- no autonomous destructive actions.

### C5 gate

Assistance remains transparent, reversible and editable.

---

# 10. C6 — Accounts, cloud, collaboration, commercial and devices

## C6.1 — Accounts and plans

Only after the local-first product is stable:

- authentication,
- account settings,
- plan limits,
- billing,
- entitlement checks.

## C6.2 — Cloud projects

- sync design,
- conflict strategy,
- offline-first recovery,
- no loss of local project ownership.

## C6.3 — Collaboration

- sharing,
- comments,
- permissions,
- presence,
- later real-time editing only after conflict architecture is proven.

## C6.4 — Admin and commercial operations

- plan management,
- usage visibility,
- support and moderation tools,
- launch readiness.

## C6.5 — Device expansion

- tablet/iPad after desktop hardening,
- touch-specific interaction review,
- phone decision last,
- no forced desktop UI compression onto mobile.

### C6 gate

Platform features do not destabilise the browser-first architecture studio.

---

# 11. Prototype reuse policy

Use this pipeline:

```text
Prototype concept
→ audit exact source
→ classify COPY_PURE_ASSET / ADAPT_PATTERN /
  REBUILD_PRODUCTION / REJECT / DEFER
→ map production owner
→ implement in isolated branch
→ focused tests
→ visual QA
→ independent audit
→ merge approval
```

### Safe to copy directly only when verified

- legal isolated path/geometry data,
- constants,
- labels/category names,
- state-free pure functions,
- approved tokens after review.

### Must be rebuilt

- DOM manipulation,
- mock state,
- HTML/CSS prototype shells,
- hard-coded Cells,
- duplicate arrays,
- fake export,
- project simulations,
- radial/context interactions that duplicate production menus.

### Explicitly rejected from prior prototypes

- Mac-Dock/fish-eye magnification,
- unverified custom SVGs,
- full branch or prototype-directory merges,
- mock stores and duplicate registries,
- clickable-looking inert controls,
- UI command icons mixed into the drawable symbol library.

---

# 12. Phase adjustment rule

New Owner ideas do not automatically become implementation tasks.

Each idea is first classified as:

- `NOW` — required for the active phase or prerequisite,
- `NEXT` — approved and sequenced after the current gate,
- `LATER` — valuable but dependent on future architecture,
- `RESEARCH` — insufficient evidence or unresolved risk,
- `REJECT` — duplicates, conflicts, harms usability/performance, or does not support the product.

A roadmap adjustment records:

- idea,
- refined product meaning,
- affected phases,
- dependencies,
- risks,
- what moves earlier/later,
- what remains unchanged,
- Owner approval.

Implementation begins only after a separate approved worker brief and explicit GO command.

---

# 13. Current next-decision queue

1. Make the C0.3P prototype viewable on the Owner's laptop if browser zoom is insufficient.
2. Complete Owner manual QA of Cell Inspector V2.
3. Prepare and approve a narrow C0.2 merge brief.
4. Plan C0.4 Organism layer separation before production Inspector work.
5. Rebuild the approved Inspector only after C0.4 ownership exists.

No Material Browser, Connection implementation, advanced Membrane or broad shell merge should start before these gates are complete.
