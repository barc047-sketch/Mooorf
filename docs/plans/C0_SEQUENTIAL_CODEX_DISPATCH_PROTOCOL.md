# MOOORF C0 Sequential Codex Dispatch Protocol

**Owner direction:** Build the complete C0 Editing Workspace one bounded milestone at a time. Before any milestone is dispatched to Codex, present its exact scope to the Owner for additions, removals and approval.

## Core rule

Do not send the complete Editing Workspace to Codex as one giant task.

For every milestone:

1. Assistant presents the proposed scope, exclusions, branch and acceptance checks.
2. Owner may add, remove or change requirements.
3. Assistant updates the durable GitHub contract.
4. Owner gives explicit `GO`.
5. Only then is the Codex launch prompt issued.
6. Codex implements on one bounded feature branch and stops at `WAITING_REVIEW`.
7. Assistant verifies the pushed GitHub evidence.
8. Owner reviews and explicitly approves merge or correction.
9. After merge, Assistant presents the next milestone before dispatch.

No later milestone may be silently pushed while the Owner is reviewing the current one.

## Immediate gate

Current production gate remains:

`MERGE C0.4F-A`

Exact audited feature:

`feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`

No new production branch begins until this exact head is merged to `main` by explicit Owner command.

## Sequential milestone order

### M1 — Canvas Shell, Bottom Dock and Shared Contextual Rails

Purpose: establish the final control placement before adding deeper product panels.

Planned branch:

`feature/c0-m1-canvas-shell-context-rails`

Included:

- final bottom dock structure,
- left island: Select, Target, Arrange,
- centre: Add Cell, Add Cluster, Add Void,
- right island: Connect, Material, Preset, Markup, Detail,
- circular launcher language where practical,
- one reusable contextual rail opening above its launcher,
- only one rail open at a time,
- Escape/outside-click close,
- narrow-width horizontal fallback,
- migrate/remove duplicated legacy dock controls,
- preserve current canvas, drag, pan, zoom, selection and creation behaviour,
- 1440×900 and 1280×800 collision checks.

Not included:

- full Inspector rebuild,
- working Material Browser,
- working Connections,
- working Annotation Card,
- dedicated layer setting bodies,
- new graph entities.

Gate: shell placement and interaction must be Owner-approved before M2.

### M2 — Inspector Context, Target Rail and Dedicated Organism Settings Widgets

Planned branch:

`feature/c0-m2-inspector-layer-settings`

Included:

- context-aware Inspector,
- Content / Appearance / Symbol structure,
- Project Default / Local Override / Mixed,
- active six-target rail,
- separate widgets for Cell, Boundary, Membrane, Membrane Edge, Core and Void,
- migrate Morph Style, Attachment and Density to correct Membrane ownership,
- repair or remove every stale/no-op appearance setting,
- transactional history and ephemeral previews,
- persistence/migration,
- clean export parity for exposed settings,
- audited C0.2 symbol registry forward-port only where needed.

Gate: each Organism target edits independently and no visible dead setting remains.

### M3 — Quick Materials, Presets and Material Browser Foundation

Planned branch:

`feature/c0-m3-materials-presets-browser`

Included:

- Quick Material rail,
- Preset rail,
- context filtering for all six Organism targets,
- recent/favourite/project materials,
- hover preview and deterministic revert,
- one-third-width Material Browser,
- maximum half-screen Material Studio shell,
- parameter-driven knobs, faders, volume bars and shared controls,
- registry-only material IDs and sparse overrides,
- renderer/export compatibility badges,
- future shader-pack expansion hooks without arbitrary shader source persistence.

Gate: Material and Preset systems remain separate and target-safe.

### M4 — Straight Connection Foundation

Planned branch:

`feature/c0-m4-straight-connections`

Included:

- separate semantic Relationship and Visual Connection data,
- straight centre-to-centre line creation,
- source Cell then target Cell workflow,
- line updates during Cell movement,
- line selection, hide/show and delete,
- solid/dashed/dotted, width, opacity and material/colour,
- Connection Settings with Meaning and Line sections,
- history, save/load and export,
- Connection context in Inspector.

Gate: line appearance never changes semantic meaning and a Relationship may exist invisibly.

### M5 — Markup Rail, Annotation Card and Annotation Studio

Planned branch:

`feature/c0-m5-annotation-markup`

Included:

- Markup rail,
- standalone Annotation Card,
- optional transparent PNG logo,
- heading, body, position and size,
- shared typography presets,
- background/material and export visibility,
- Annotation Studio,
- Annotation context in Inspector,
- rename/move existing label-mode AnnotationWidget to Label Settings,
- persistence, history and export.

Gate: Annotation Card remains standalone markup and is never stored as Cell content or Cell appearance.

### M6 — C0 Editing Workspace Hardening

Planned branch:

`feature/c0-m6-editing-workspace-hardening`

Included:

- full control ownership review,
- keyboard/accessibility,
- no dead or duplicate controls,
- renderer and export parity,
- migration/recovery tests,
- performance/collision review,
- 1440×900 and 1280×800 final QA,
- focused tests, typecheck, diff check and one final production build.

Gate: no Critical/Major C0 Editing Workspace issue remains.

## Review and audit rule

- No routine extra independent audit after every milestone.
- Codex provides focused tests, typecheck, diff check, one final build and deterministic browser QA.
- Assistant verifies exact GitHub branch/head and changed scope.
- A separate audit is introduced only when a BLOCKER/HIGH-risk contradiction appears.
- Every merge still requires explicit Owner approval.

## Current next milestone presentation rule

Before dispatching M1, the Assistant must present M1 in plain language and explicitly list:

- what will visibly change,
- what will be moved or removed,
- what remains temporarily non-functional,
- exact acceptance behaviour,
- the following milestone M2 as a preview only.

The Owner can then add changes before issuing `GO CODEX M1`.
