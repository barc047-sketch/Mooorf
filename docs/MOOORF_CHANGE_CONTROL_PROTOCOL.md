# MOOORF Change Control Protocol

**Status:** Canonical product-management protocol  
**Authority:** Applies to every new idea, correction, preference, architectural change, phase adjustment, prototype, implementation brief and merge recommendation  
**Product-code effect:** None. This document controls how decisions become work.

## 1. Purpose

The Owner may describe ideas quickly, approximately or while exploring alternatives. That is valuable product input, but it must not automatically become code.

The Project Manager must act as a critical product manager, architecture reviewer and sequencing gatekeeper.

The required behaviour is:

```text
Owner input
→ interpret intent
→ test against product architecture
→ identify dependencies and conflicts
→ recommend placement in the roadmap
→ explain proposed documentation change
→ receive Owner approval
→ update GitHub planning documents
→ prepare one worker brief
→ receive explicit GO
→ implement
→ audit
→ receive merge approval
```

No step is skipped merely because an idea sounds good.

---

## 2. Input classification

Every Owner message is classified internally as one or more of:

- observation,
- bug report,
- idea,
- preference,
- question,
- proposed decision,
- locked decision,
- command,
- approval,
- rejection.

### Important distinctions

- An **idea** is not automatically a requirement.
- A **preference** is not automatically a system-wide rule.
- A **bug report** is evidence, not automatically the root cause.
- A **prototype approval** is not production merge approval.
- Approval to **push planning documents** is not permission to implement.
- A **GO command** authorises only the exact prepared worker brief.
- A worker saying `DONE` does not authorise merge.

Use `DECISION LOCKED` only after the proposal has been critically refined and the Owner has approved the refined decision.

---

## 3. Project Manager responsibilities

For each meaningful new idea, the Project Manager must:

1. Restate the intended product meaning in clear language.
2. Check canonical nomenclature.
3. Check the Master Graph and existing ownership.
4. Check whether the idea duplicates an existing system.
5. Check technical and performance dependencies.
6. Check whether it belongs in the active phase.
7. Check prototype, production and export implications.
8. Recommend `NOW`, `NEXT`, `LATER`, `RESEARCH` or `REJECT`.
9. Update the proposed phase structure rather than immediately dispatching code.
10. Explain the exact GitHub change before pushing it.
11. Wait for approval unless the Owner already issued a precise approved command.
12. Prepare implementation only after the planning decision is canonical.

The Project Manager must disagree when a proposal would create unnecessary complexity, premature architecture, duplicate ownership, weak usability or avoidable performance risk.

---

## 4. Roadmap placement categories

### NOW

Use only when the change is:

- required to complete the active phase,
- a proven blocker,
- a necessary prerequisite,
- a Critical or Major defect preventing safe progression.

### NEXT

Use when the idea is approved and logically follows the current gate.

### LATER

Use when the idea is valuable but depends on future state, shell, renderer, graph, performance or platform work.

### RESEARCH

Use when:

- the implementation reality is unclear,
- evidence conflicts,
- legal/licence questions remain,
- performance impact is unknown,
- terminology or user flow is unresolved.

Research tasks are read-only by default.

### REJECT

Use when the proposal:

- duplicates an existing owner,
- creates a second store or registry,
- harms product clarity,
- adds complexity without sufficient value,
- conflicts with locked architecture,
- introduces unsafe legal/licence risk,
- repeats a rejected visual behaviour,
- is premature and has no useful later placement.

A rejected idea may be revisited only with new evidence or a changed product goal.

---

## 5. Mandatory pre-push explanation

Before pushing a new planning document, roadmap change, decision lock or worker brief, the Project Manager explains in simple language:

```text
I am going to push:
[exact files or brief]

This changes:
[what becomes canonical]

This is how:
[plain-language structure]

Why it belongs here:
[dependency and sequencing reason]

Risks or conflicts:
[most important risks]

What remains unchanged:
[explicit boundaries]

Should I proceed or make changes?
```

The Owner may:

- approve,
- modify,
- reject,
- ask for alternatives.

When the Owner gives clear approval such as `APPROVE ROADMAP PUSH`, the Project Manager may push only the described planning changes.

---

## 6. Approval levels

MOOORF uses separate approval gates.

### A. Discussion approval

The Owner agrees with the direction. Nothing is necessarily pushed or implemented.

### B. Documentation approval

The Owner authorises specific roadmap, scope, decision or brief documents to be pushed.

### C. Prototype GO

The Owner authorises an isolated prototype brief. Prototype work must remain outside production unless the brief explicitly states otherwise.

### D. Implementation GO

The Owner authorises one exact implementation brief on one exact branch and base SHA.

### E. Audit GO

The Owner authorises an independent audit of a fixed branch/commit.

### F. Merge approval

The Owner authorises merge only after:

- implementation completion,
- evidence,
- audit where required,
- manual QA where required,
- current-main staleness verification,
- a narrow merge brief.

No earlier approval implies a later approval.

---

## 7. Required phase-adjustment record

When an approved idea modifies the roadmap, record:

```text
CHANGE ID:
DATE:
OWNER INPUT:
REFINED DECISION:
STATUS: NOW / NEXT / LATER / RESEARCH / REJECT
AFFECTED PHASES:
DEPENDENCIES:
RISKS:
MOVED EARLIER:
MOVED LATER:
UNCHANGED:
OWNER APPROVAL:
RELATED DOCS / COMMITS:
```

The record may live in the canonical roadmap, `docs/DECISIONS.md`, or a dedicated phase-planning document depending on scope.

Major architecture changes must update the relevant canonical scope document and `docs/DECISIONS.md`; they must not exist only in chat.

---

## 8. Safe implementation sequence

Every production milestone follows:

```text
1. Verify latest main and worker status
2. Read canonical scope and roadmap
3. Inspect existing owners/components
4. Define exact milestone boundary
5. List explicit exclusions
6. Push worker brief to GitHub
7. Explain brief to Owner
8. Wait for GO
9. Worker publishes RUNNING status
10. Worker implements in isolated branch/worktree
11. Focused tests
12. One final production build where applicable
13. Worker pushes branch and report
14. Owner/manual QA where visual
15. Independent audit where complex
16. Fix only validated issues
17. Verify branch against current main
18. Prepare narrow merge brief
19. Wait for merge approval
20. Merge and update roadmap/handoff
```

---

## 9. Brief preparation rule

Every worker brief must contain:

- worker and exact model route,
- task type,
- exact base SHA,
- source branch and work branch,
- required read order,
- goal and reason for current sequencing,
- exact included work,
- explicit exclusions,
- production ownership to reuse,
- preservation rules,
- test and build plan,
- deliverables and report path,
- status protocol,
- commit/push rules,
- completion gate,
- Ponytail reuse report.

Briefs are stored in `docs/worker-briefs/` on the governance/coordination branch.

The user receives a concise GO command, not a giant prompt.

---

## 10. Prototype governance

Prototypes answer design and interaction questions. They do not become product architecture automatically.

Before production reuse, classify every relevant prototype item:

- `COPY_PURE_ASSET`,
- `ADAPT_PATTERN`,
- `REBUILD_PRODUCTION`,
- `REJECT`,
- `DEFER`.

### Prototype code that generally must not enter production directly

- independent DOM state,
- fixture data,
- mock project stores,
- fake export,
- hard-coded Cells,
- full HTML/CSS shells,
- duplicate icon/material arrays,
- unverified SVG geometry,
- prototype-only keyboard or selection managers.

### Required production adaptation

```text
Approved interaction
→ existing React component ownership
→ existing Zustand/Master Graph ownership
→ existing history
→ existing registries
→ persistence/migration
→ renderer/export parity
→ tests and Owner QA
```

---

## 11. Architecture safety checks

Before approving implementation, confirm the change does not create:

- a second Master Graph,
- duplicate Cell records,
- duplicate Table data,
- duplicate material or symbol definitions,
- another renderer/camera,
- another history system,
- another uploader,
- another export engine,
- hidden AI-owned project state,
- UI controls that silently modify architectural meaning.

Special separation rules:

- Cell area is data; Boundary offset is visual.
- Relationship is semantic; Visual Connection is rendered appearance.
- Morph Bridge is not a normal line.
- Cell Behaviour does not silently change Relationship.
- Selection orbit is UI, not Cell style.
- Membrane fill and Membrane Edge are separate targets.
- Applied symbols export by default; no unnecessary export toggle.

---

## 12. Performance and complexity gate

A feature should not move earlier merely because a prototype looks good.

Check:

- frame-loop cost,
- drag/zoom cost,
- selector stability,
- memory and persistence impact,
- 1440 and 1280 layout pressure,
- renderer/export parity,
- quality fallback for dense projects,
- package/dependency cost,
- whether a preset can replace many manual controls.

Prefer:

- preset-first UI,
- small icon toggles,
- dots/swatches,
- compact segmented controls,
- progressive disclosure,
- one or two clear actions.

Avoid uncontrolled accumulation of sliders, giant buttons and permanently expanded settings.

---

## 13. Bug and urgent-fix exception

A proven Critical bug may be expedited, but still requires:

- current GitHub verification,
- root-cause inspection,
- a narrow fix brief,
- preservation rules,
- focused tests,
- no unrelated cleanup,
- Owner GO unless immediate repository safety is at risk.

Urgency does not permit broad refactors or silent architecture changes.

---

## 14. Worker assignment policy

Available worker slots:

- Codex,
- Claude,
- Antigravity.

Codex and GPT-5.6 Ultracode are one worker slot, not separate workers.

Default roles:

- **Codex** — production implementation, technical architecture, testing, recovery and precise fixes.
- **Claude** — focused visual/interaction prototypes and design refinement.
- **Antigravity** — read-only audit, architecture mapping, performance investigation and merge recommendation.

Do not assign overlapping write tasks. A worker is not `RUNNING` until its status branch or branch activity proves execution.

---

## 15. Owner review format

For a proposed next task, present:

```text
Worker / model:
Task type:
Source / branch:
Current status:

Goal:
Why now:
Worker will do:
Worker will not do:
Deliverables:
Decisions the Owner may change:
Success condition:
Next step after completion:

GO COMMAND:
```

After a worker task completes, ask exactly:

`Quick audit this task? — YES / NO`

Do not ask that question for mere discussion or documentation drafting before a worker task completes.

---

## 16. Current sequencing lock

As of this protocol's publication:

1. Cell Inspector V2 remains an isolated prototype awaiting Owner QA.
2. C0.2 Icon/Grid Registry is a merge candidate but is not yet on `main`.
3. Explicit Organism layer separation must be implemented before the production Cell Inspector is integrated.
4. Production Cell Inspector follows layer separation.
5. Target rail follows production target ownership.
6. Quick Materials follows target rail.
7. Material Browser follows Quick Materials.
8. Connections remain a separate system and follow the Organism/material foundation.
9. Advanced Membrane and broad shell work remain later phases.

This sequence may be changed only through the process defined in this document.
