# MOOORF Project Engine

**Status:** Mandatory project entry point

**Authority:** Owner-approved repository memory

**Last updated:** 2026-07-16

## Product identity

MOOORF is a spatial programming and architectural-analysis studio. It turns one project graph into an editable spatial model and coordinated Canvas, Table, Dashboard, analysis, and export projections.

The visible product centres on the **Organism**: Cells, Boundaries, Membrane, Membrane Edge, Core, and Voids rendered as one spatial composition. MOOORF is not a generic node editor, drawing toy, or collection of disconnected UI tools.

## Authority and worker roles

- The **Owner** is the final decision-maker for product direction, visual QA, milestone approval, merges, and release.
- The coordinating **ChatGPT Project Manager** translates Owner intent, resolves contradictions, sequences work, prepares bounded tasks, and guards repository safety.
- **Codex** is the production implementer for architecture, state, React, Canvas, WebGL, import/export, performance, testing, and bounded repository work.
- Auditors report evidence; they do not silently change product direction or production code.
- Discussion, observation, and proposed ideas are not locked decisions. Work begins only after an explicit Owner GO command.
- No worker may merge automatically. A pushed feature branch is not a merged milestone.

## Canonical product architecture

### Master Graph

The Master Graph is the only project-data source of truth. It owns durable project meaning: spaces, floors, relationships, flows, metadata, and future graph semantics.

Current graph contracts live in:

- `src/domain/graph/types.ts`
- `src/domain/graph/adapters.ts`
- `src/domain/graph/selectors.ts`

The current production editor still projects its live Canvas/Table subset through `src/state/store.ts` and shared types in `src/types.ts`. New features must extend or adapt these owners; they must not create a second product store.

### Canonical state and session state

- `src/state/store.ts` owns current product settings, Cells/Voids, camera, selection, widgets, previews, saved views, and bounded history actions.
- `src/types.ts` owns shared application contracts.
- Renderer-local transient input may remain local, but final product state commits through the central store.
- Preview state is ephemeral. It must not leak into project persistence, saved views, history, or authored exports.
- Registries own immutable definitions; persistence stores IDs and safe scalar overrides, never registry objects or executable data.

### Visible renderer

- **Organism is the primary visible renderer.** `src/canvas/OrganismCanvasView.tsx` is the production host and `src/experiments/organism-lab/organism-shader.ts` is its WebGL field renderer.
- **Classic is retained only as an internal compatibility and failure fallback.** `src/canvas/CanvasView.tsx` and `src/canvas/renderer.ts` must remain operational but are not normal product UI choices.
- One Canvas mounts one renderer strategy. Do not create a second Canvas, duplicate camera, or duplicate selection model.
- Selection is temporary UI outside Organism geometry and authored export.

### Projections

- **Canvas** projects graph/store data into Organism or internal Classic rendering.
- **Table** edits the same store-backed product data through `src/views/TableView.tsx`.
- **Dashboard/analysis** must derive from Master Graph selectors; it must not own product data.
- **Exports** are authored, deterministic projections from graph/store snapshots through `src/export/*` and `src/canvas/exportCapture.ts`.
- Presentation previews may reduce only the live Membrane render target. Text, overlays, interaction geometry, and authored exports remain full resolution.

## Non-negotiable UI rules

- Canvas remains dominant at 1440px desktop and 1280px laptop.
- UI uses stable glass, thin keylines, quiet typography, and no UI shadows.
- Cell Shadow is an optional Canvas effect and defaults off.
- Active controls use a signal dot, inner keyline, and light tint; ordinary active controls are not solid black pills.
- Blur does not animate. Avoid nested backdrop filters and layout-moving hover effects.
- Quick View and compact controls are icon-led, accessible, and truthful.
- Labels default to Auto Contrast and must remain readable across themes and materials.
- Existing WidgetFrame lifecycle is reused; opening/focusing does not create duplicate widgets.
- Visual references guide proportion and hierarchy only; never copy proprietary assets, branding, or literal layouts.

## Non-negotiable performance rules

- Interaction latency outranks decorative animation.
- Pointer and wheel input coalesce through the existing frame scheduler.
- Transient drag previews stay local/ephemeral; release creates one canonical commit and one Undo entry.
- Motion Off sleeps after invalidation work. Motion On owns the existing continuous scheduler.
- Automatic performance changes runtime presentation only and never mutates authored project settings.
- The live quality system may lower Membrane resolution, motion amount/frequency, and Cell Shadow cost only through existing runtime profiles.
- Text, overlays, selection, hit testing, camera geometry, and exports remain full quality.
- Heavy future export, analysis, and preprocessing work must not block Canvas interaction.
- Do not claim performance success without runtime evidence.

## Mandatory read order

Every task starts with:

1. `docs/project-engine/MASTER.md`
2. `docs/project-engine/STATE.md`
3. `docs/project-engine/ACTIVE_TASK.md`
4. the relevant section of `docs/project-engine/REPO_MAP.md`

Then route by need:

- Implementation or finalization: `docs/project-engine/WORKFLOW.md`
- Milestone sequencing: `docs/project-engine/ROADMAP.md`
- Architecture, Owner decisions, bugs, or limits: `docs/project-engine/LEDGER.md`

Historical reports are **not default reading**. Read them only when this file or `REPO_MAP.md` links to the subject and current evidence is insufficient.

## Project Engine files

- `docs/project-engine/STATE.md` — exact branch, SHA, working tree, milestone, and integration truth.
- `docs/project-engine/ACTIVE_TASK.md` — exactly one bounded active task.
- `docs/project-engine/REPO_MAP.md` — feature ownership, tests, constraints, and impact lookup.
- `docs/project-engine/ROADMAP.md` — dependency-safe milestone sequence and status.
- `docs/project-engine/WORKFLOW.md` — intake, audit, implementation, QA, finalization, and reporting gates.
- `docs/project-engine/LEDGER.md` — durable Owner decisions, open issues, known limits, and superseded decisions.

## Legacy evidence by subject

Use only the relevant document:

- Authority and worker routing: `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
- Full product scope and no-go rules: `docs/MOOORF_FINAL_SCOPE.md`, `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
- Desktop composition and performance: `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
- Canonical historical phase dependencies: `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md`
- Existing feature ownership detail: `docs/FEATURE_MAP.md`, `docs/PROJECT_MEMORY_INDEX.md`
- Current historical handoff evidence: `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`
- Durable older architecture decisions: `docs/DECISIONS.md`
- Older bug register: `docs/BUGS.md`
- Component reuse inventory: `docs/COMPONENT_INVENTORY.md`

Do not copy historical bulk forward. Extract current truth, cite the evidence, and keep this engine compact.

## Task update obligations

After every completed task:

1. Update `STATE.md` with exact Git and milestone truth.
2. Replace `ACTIVE_TASK.md` with the next single task, or close it without appending history.
3. Update only affected ownership rows or impact lookups in `REPO_MAP.md`.
4. Change `ROADMAP.md` only when sequencing or status genuinely changed.
5. Add durable decisions, active bugs, or limits to `LEDGER.md`; move superseded items instead of duplicating narratives.
6. Record the compact task-closing evidence required by `WORKFLOW.md`.
7. Preserve the distinction between COMMITTED, PUSHED, LOCAL UNCOMMITTED, OWNER APPROVED, WAITING OWNER QA, and BLOCKED.

## Repository safety

- Verify branch, HEAD, remote source SHA, and dirty files before work.
- Respect `ACTIVE_TASK.md` read/write budgets and forbidden areas.
- Preserve unrelated changes byte-for-byte; never reset, stash, clean, or silently reformat them.
- Preserve `.claude/launch.json` and keep `.references/` local-only.
- Never scan generated, dependency, secret, or environment paths by default.
- Never stage outside the approved task scope.
- Build, commit, push, and merge only at the gates defined in `WORKFLOW.md` and by explicit Owner command.

## Truth labels

Use the exact state labels in `STATE.md`. COMMITTED, PUSHED, LOCAL UNCOMMITTED, OWNER APPROVED, WAITING OWNER QA, and BLOCKED describe different evidence. Never collapse them into a generic "done" status.
