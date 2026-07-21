# MOOORF CONNECTIONS V1 — TOKEN-EFFICIENT EXECUTION INDEX

**Status:** EXECUTION MAP — DOES NOT SUPERSEDE THE LOCKED MASTER SPEC  
**Authority:** `docs/connections/MOOORF_CONNECTIONS_V1_LOCKED_MASTER_SPEC.md`  
**Purpose:** Reduce token/context waste while executing the locked Connections V1 architecture with zero design drift.

---

# 1. AUTHORITY ORDER

1. Owner-approved amendments recorded in the Locked Master Spec
2. `MOOORF_CONNECTIONS_V1_LOCKED_MASTER_SPEC.md`
3. Current bounded stage brief
4. Current task brief
5. Existing implementation plan / earlier contracts
6. Existing code

If anything below conflicts with the Locked Master Spec, the Locked Master Spec wins.

This Execution Index is a routing document only. It is not a replacement specification.

---

# 2. TOKEN-EFFICIENCY RULE

## Lead / Orchestrator
Read the full Locked Master Spec:
- at the beginning of a new Connections phase/session;
- after context loss/restart;
- before approving a stage that changes architecture;
- after any Owner amendment.

Do NOT re-read or repaste it after every small task.

## Implementer subagent
Do NOT read the full 2,000+ line Locked Master Spec by default.

Read only:
1. current task brief;
2. compact Global Invariants block;
3. exact Locked Master Spec section numbers referenced by the task;
4. files/interfaces directly touched.

## Reviewer subagent
Read only:
1. task brief;
2. task report;
3. diff review package;
4. exact binding Global Invariants;
5. exact Locked Master Spec section references when required.

## Final whole-branch reviewer
Read:
1. compact Global Invariants;
2. stage completion matrix;
3. whole-branch diff package;
4. Locked Master Spec only for disputed/architecture-sensitive requirements.

---

# 3. ZERO-WASTE ARTIFACT PIPELINE

Use files instead of repeated prompt text.

## Persistent repository files

- `docs/connections/MOOORF_CONNECTIONS_V1_LOCKED_MASTER_SPEC.md`
- `docs/connections/MOOORF_CONNECTIONS_V1_EXECUTION_INDEX.md`
- `docs/superpowers/plans/2026-07-21-mooorf-connections-v1-surgical-plan.md`

## Local durable scratch

- `.superpowers/sdd/progress.md`
- `.superpowers/sdd/stage-<N>-brief.md`
- `.superpowers/sdd/task-<N>-brief.md`
- `.superpowers/sdd/task-<N>-report.md`
- `.superpowers/sdd/review-<N>-<sha>.diff`

The controller should pass PATHS, not paste the contents into every prompt.

---

# 4. GLOBAL INVARIANTS — ALWAYS INCLUDED IN TASK BRIEFS

1. Organism remains the sole production renderer.
2. Preserve recovered Canvas2D Connection renderer; no renderer rewrite without verified defect.
3. No React component per stored Connection.
4. No React component per authoring port.
5. No permanent SVG stored-Connection renderer.
6. One Connection state/history/camera/widget/export owner.
7. `Custom` is permanent default/fallback; never None/blank/undefined.
8. Quick Rail is one LEFT contextual rail only.
9. Right contextual bottom region stays reserved for future features.
10. Relationship Types are an extensible project library, not seven fixed UI buttons.
11. One reusable Connection Style Panel serves:
    - Custom Connection local style
    - individual Connection override
    - Relationship Type default
12. Relationship Manager is allowed custom large sizing; never force it into legacy small widget dimensions.
13. Title + Body are first-class Connection annotations and must support Canvas + visual export.
14. Global Connections OFF is a hard zero-work visual gate after settling.
15. Existing Cell Labels / Ring / Flag / Membrane / Table behaviour must not regress.
16. No Material dependency.
17. No full Relationship Matrix UI in this phase unless explicitly Owner-approved.
18. No broad unrelated refactor.
19. No new dependency unless unavoidable and Owner-escalated.
20. No merge to `main` before Owner QA.

---

# 5. EXECUTION STRATEGY

Do NOT run the remainder as one huge autonomous overnight task.

Use bounded stage gates.

Each stage:

1. verify HEAD/worktree;
2. read full Master Spec only if this is a new lead session or architecture-changing stage;
3. generate compact stage brief;
4. implement micro-tasks sequentially;
5. focused tests after each micro-task;
6. task review using diff package;
7. fix Important/Critical findings;
8. stage TypeScript + targeted browser QA;
9. Owner preview when UI changed;
10. commit stage;
11. update progress ledger;
12. STOP before next stage.

---

# 6. MODEL / AGENT ROUTING

## Most-capable model
Use only for:
- architecture-sensitive changes;
- state/history migrations;
- renderer integration/debugging;
- final whole-stage/whole-branch review;
- ambiguous cross-system conflicts.

## Standard model
Use for:
- multi-file implementation from precise task brief;
- UI integration;
- focused reviewer work.

## Fast/cheap model
Use for:
- mechanical single-file tests;
- exact CSS refinements;
- registry additions;
- documentation extraction;
- low-risk contract tests.

Never use an expensive model by default merely because the parent session is expensive.

---

# 7. PONYTAIL USE — LIMITED

Use Ponytail-style discipline only as an implementation economy rule:

- reuse before creating;
- native before dependency;
- smallest coherent diff;
- one owner per concern;
- no abstraction without a real second consumer;
- no framework for simple controls;
- no duplicate store/history/camera/renderer/export;
- test the risk.

Do NOT install/upgrade a third-party Ponytail package/ruleset during this phase.

Do NOT let “token saving” justify skipping tests, reviews, migrations, or browser proof.

---

# 8. SURGICAL DEPENDENCY MAP

## Foundation already recovered
- canonical Connection domain
- Custom type
- style inheritance foundation
- Connection mode
- authoring lifecycle
- Manager/Inspector footholds
- Canvas2D renderer partial
- geometry / lanes / clipping / culling
- hard OFF foundation
- instrumentation

## New locked architecture depends on foundation in this order

A. Finish renderer correctness
↓
B. Dynamic Relationship Type + annotation domain contracts
↓
C. Quick Rail / Inspector / flexible workspace shell
↓
D. Relationship Manager Types library
↓
E. Common Connection Style Panel
↓
F. Connections management tab + Canvas annotations
↓
G. Connection Settings + advanced port layouts
↓
H. Export/projection parity
↓
I. Final performance/accessibility/hardening

---

# 9. R1 — CLOSE RECOVERED TASK 3 ONLY

**Purpose:** Convert recovered dirty renderer work into a verified clean checkpoint before new architecture layers are added.

Do not redesign the old seven-button Rail in this stage beyond what is necessary for functional proof.

## R1.1 Gesture ownership
- real pointer drag from port
- pointer capture
- no accidental Cell drag
- no accidental Canvas pan
- drag cancel semantics
- click-to-click fallback preserved

## R1.2 Stored-line selection
- hover corridor
- direct line click
- nearest-lane hit testing
- Shift multi-selection

## R1.3 Focus behaviour
- selected Connection focus
- endpoint emphasis
- selected Cell incident-Connection focus
- unrelated-line fade

## R1.4 Renderer continuity
- zoom/pan torture
- move Cell
- lane stability
- clipping stability
- Table → Canvas without remount
- Undo/Redo
- delete endpoint Cell / Undo

## R1.5 Performance proof
- 25 Cells / ~50 Connections
- 60 Cells / ~200–300 Connections
- up to 96 visible Cells / high Connection stress
- 500+ authored spaces / bounded visible projection
- OFF gate = zero visual work after settled

## R1.6 Review and checkpoint
- focused tests
- TypeScript
- browser QA
- spec review
- renderer/performance review
- product/UX review
- commit recovered Task 3
- update ledger
- STOP

---

# 10. R2A — DOMAIN EVOLUTION, NO MAJOR UI

**Purpose:** Establish the new locked data contracts before changing UI.

## Deliverables
- project-extensible `RelationshipTypeDefinition`
- preserve factory IDs
- permanent Custom fallback
- factory + project-created combined library selector
- stable user-created type IDs
- safe archive/delete/reassign contracts
- type usage selector
- annotation model:
  - title
  - title source
  - show title
  - body
  - show body
  - annotation presentation override hooks
- sparse visual override compatibility
- migration/normalization for older projects
- persistence/import/export continuity
- future Matrix/Table stable code field

## No UI beyond test harnesses.

## Gate
- domain tests
- migration tests
- history tests
- TypeScript
- review
- commit
- STOP

---

# 11. R2B — FLEXIBLE WORKSPACE + QUICK RAIL + INSPECTOR

**Purpose:** Replace obsolete seven-button surface without touching renderer architecture.

## Flexible workspace system
Extend existing WidgetHost/WidgetFrame sizing:
- compact
- standard
- wide
- tall
- workspace / bounded custom
- responsive min/max

No second widget manager.

## Quick Rail
Final:
`[ Connections ] [ Current Type ▼ ] [ Manager ] [ Close ]`

Rules:
- LEFT side only
- aligns before centre Add/Cluster/Void circles
- right region reserved
- searchable long type dropdown
- Custom default
- Manage opens Relationship Manager

## Ports
- visible 14–15 px target
- 26–30 px hit area
- automatic contrast
- current Center/Auto behaviour
- advanced layouts remain R5

## Inspector
Default:
- endpoints
- Relationship Type dropdown
- Title
- Body
- style preview
- Edit Style
- Reverse
- Delete

Hide advanced semantic clutter behind optional deeper disclosure.

## Gate
- targeted UI tests
- TypeScript
- 1440×900
- 1280×800
- constrained effective Canvas width
- Owner preview
- commit
- STOP

---

# 12. R3A — RELATIONSHIP MANAGER SHELL + TYPES LIBRARY

**Purpose:** Build the professional large workspace and extensible type library.

## Workspace
Target desktop:
- ~36–44vw
- ~70–85vh
- responsive bounds
- split-pane capable

Header:
`[ TYPES ] [ CONNECTIONS ] [ System Settings ]`

## Types library
Compact vertical rows:
`Name -------------------- live style preview ---- usage ---- edit`

Capabilities:
- long/endless list
- virtualization/bounded rendering
- add type
- factory vs project-created distinction
- metadata expansion
- duplicate
- archive/delete/reassign safety
- Reset to Factory Default

Do not build full Style Panel yet; row edit invokes shell/placeholder only if needed.

## Gate
- long-list fixture
- accessibility/keyboard
- responsive QA
- Owner preview
- commit
- STOP

---

# 13. R3B — ONE COMMON CONNECTION STYLE PANEL

**Purpose:** Implement the single reusable styling surface once.

## Context modes
- `CUSTOM_CONNECTION`
- `CONNECTION_OVERRIDE`
- `RELATIONSHIP_TYPE`

## Controls
- live preview
- Straight / Curved / Orthogonal / Elbow
- Solid / Dashed / Dotted / Dash-dot / Double / Segmented
- width
- opacity
- start marker registry
- end marker registry
- anchors
- annotation appearance
- reset/default behaviour

## History
- runtime preview without history spam
- final commit = one history transaction
- cancel restores original
- Relationship Type style change = one project-level transaction, not N Connection rewrites

## Gate
- same component proven from:
  - Type row
  - Custom Connection Inspector
  - preset Connection override
- resolver parity
- TypeScript
- browser QA
- review
- Owner preview
- commit
- STOP

---

# 14. R4A — RELATIONSHIP MANAGER CONNECTIONS TAB

**Purpose:** Manage actual authored records at scale.

Capabilities:
- search
- Relationship Type filter
- selected Cell filter
- floor filter
- cross-floor only
- Relationship Active
- Custom only
- local override indicator/filter
- locate on Canvas
- selection sync
- multi-select
- bulk type assignment
- bulk reset style to type default
- virtualization

Use shared pure filter semantics.

Gate:
- large result-set fixture
- selection sync
- bulk history tests
- browser QA
- commit
- STOP

---

# 15. R4B — TITLE + BODY CANVAS ANNOTATIONS

**Purpose:** Make Connection annotations first-class diagram content.

Implement:
- title source: hidden / Relationship Type / custom
- custom title
- body
- show/hide title
- show/hide body
- resolved annotation projection
- Canvas title/body layout
- wrapped horizontal body block
- annotation positioning
- annotation LOD:
  - near: title + body
  - medium: title
  - far: lines only
- no semantic data loss at LOD transitions

Reuse existing Cell Label architecture patterns where appropriate, without coupling ownership.

Gate:
- overlap/degradation tests
- zoom QA
- dense scene QA
- Owner preview
- commit
- STOP

---

# 16. R5 — CONNECTION SETTINGS + ADVANCED PORT LAYOUTS

Global Connection Settings:
- port layout
- port size
- auto contrast
- default Relationship Type
- stay in mode
- select new Connection
- show layer on C
- edge auto-pan
- line hit tolerance
- fade unrelated
- motion/reduced motion

Port layouts:
- Center / Auto
- Cardinal 4
- Horizontal 2
- Vertical 2

Rules:
- port preference is UI/project-view configuration as specified
- explicit side-port choice persists as authored start/end anchor
- no one component per port
- no conflicts with Cell drag/pan

Gate:
- all layouts browser-tested
- anchor persistence
- Undo/Redo
- zoom alignment
- Owner preview
- commit
- STOP

---

# 17. R6 — EXPORT + MATRIX/TABLE PROJECTION PARITY

Visual exports:
- PNG
- PDF
- presentation ZIP

Must preserve:
- resolved Connection visual
- type inheritance
- local overrides
- title
- body
- wrapping
- annotation placement

Semantic:
- JSON continuity
- relationship CSV

Matrix/Table:
- projection hooks only
- stable Relationship Type IDs/codes
- pair index
- multiple types per pair
- direction preservation
- shared filters
- shared selection contract

No full Matrix UI.

Gate:
- detached export parity tests
- data round trips
- fixtures
- review
- commit
- STOP

---

# 18. R7 — FINAL HARDENING

- normal/dense/max visible fixtures
- 500+ authored project
- hard OFF zero-work
- Table pause/resume
- panel responsiveness
- large Relationship Type library
- Manager virtualization
- annotation LOD
- keyboard accessibility
- reduced motion
- no `C` while typing
- no Connection/port component explosion
- no renderer remount regression
- final whole-branch diff review
- exactly one production build
- Project Engine status
- push feature branch only
- Owner QA
- no merge

---

# 19. CONTEXT-BUDGET POLICY

## Never paste:
- full Master Spec into every task;
- complete prior task reports into future prompts;
- giant raw diffs into controller context;
- full Git history when SHA + brief suffices.

## Always pass as file path:
- task brief;
- report;
- diff package;
- screenshots;
- performance logs.

## Subagent response contract
Return only:
- DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- commit SHA(s)
- one-line tests summary
- one-line concerns
- report file path

Full detail lives in report file.

---

# 20. REVIEW POLICY

Per task:
- independent spec-compliance verdict
- independent code-quality verdict

Do not re-run the same expensive test suite in reviewer unless evidence is missing or review specifically requires it.

Fix all Critical/Important findings before next task.

Minor findings go into ledger for final review.

Final reviewer receives one whole-branch review package, not accumulated chat history.

---

# 21. STOP CONDITIONS

Stop instead of guessing if:
- Git HEAD differs unexpectedly;
- unexpected dirty files appear;
- current task would require a new dependency;
- migration would lose valid Connections/type data;
- recovered renderer would need broad replacement;
- existing Label/Ring/Flag/Membrane/Table system regresses;
- hard OFF cannot remain a hard gate;
- solution requires component-per-Connection or component-per-port;
- a task forces a second state/history/camera/widget/export owner;
- a spec contradiction requires Owner choice;
- full Matrix/Material/Morph/Behaviour enters scope;
- build/test failure requires unrelated scope expansion.

---

# 22. COMMIT STRATEGY

Prefer one clean commit per independently reviewed stage or micro-stage.

Do not create dozens of tiny commits when one reviewed micro-stage is coherent.

Suggested sequence:

1. `perf(connections): complete recovered batched renderer`
2. `feat(connections): add extensible relationship type and annotation contracts`
3. `feat(connections): simplify connection rail and inspector workspace`
4. `feat(connections): add relationship type manager`
5. `feat(connections): add shared connection style editor`
6. `feat(connections): add scalable connection management`
7. `feat(connections): add connection title and body annotations`
8. `feat(connections): add connection authoring settings and port layouts`
9. `feat(connections): complete export and projection parity`
10. `perf(connections): harden v1 for dense projects`

Exact messages may be adjusted to match repo conventions.

---

# 23. FIRST ACTION

Do not start R2 yet.

First:
1. install the Locked Master Spec in repository;
2. install this Execution Index in repository;
3. preserve current recovered dirty Task 3 state;
4. close R1 renderer gates;
5. commit R1;
6. preview;
7. only then start R2A.

This avoids mixing recovered uncommitted renderer work with the new architecture.

---

# 24. FINAL EXECUTION PRINCIPLE

**Master Spec = law.**  
**Execution Index = routing map.**  
**Stage brief = current mission.**  
**Task brief = only context the implementer needs.**  
**Diff package = reviewer context.**  
**Progress ledger + Git = recovery memory.**

This is the token-efficient anti-drift architecture for completing MOOORF Connections V1.
