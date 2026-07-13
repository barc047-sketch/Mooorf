# MOOORF Roadmap and Current State — Knowledge Upload 03

This file is a recovery snapshot. Live GitHub state always overrides it.

## Current production main

Recorded main SHA:

`a0f7b33d4e13ad72d5203141d7688794ad377446`

C0.2 Icon and Grid Asset Registry is merged. It includes verified drawable symbols, separate UI-command icons, canonical grid IDs, aliases, persistence contracts and focused tests. Six future grids remain metadata only.

## Current active gate

C0.4.1 — Layer contracts, defaults and resolvers

- Worker: Codex
- Status: WAITING_REVIEW
- Feature branch: `feature/c0-4-1-layer-contracts-resolvers`
- Feature head: `c4600472ea76f651800c19b91cf8f67954ca992e`
- Next gate: fresh-session independent Antigravity delta audit
- No merge approval yet

## Immediate dependency-safe sequence

1. Audit C0.4.1.
2. Owner reviews the audit.
3. Correct and re-audit if required.
4. Owner explicitly approves merge.
5. Merge exact audited C0.4.1 head.
6. Prepare compact C0.4.2 contract against new main.
7. Owner GO for C0.4.2.

## C0 sequence

- C0.3P — isolated Cell Inspector prototype QA: approved with production adjustments; not production code.
- C0.2 — icon/grid registry: merged.
- C0.4 — Organism and presentation-layer separation.
- C0.5 — Production Cell Inspector, Label Layout, Flag, canonical Area resize and Table sync.
- C0.6 — Organism target rail.
- C0.7 — Quick Materials.
- C0.8 — Material Browser.
- C0.9 — Grid controls/snapping.
- C0.10 — Connection foundations: Relationships, Visual Connections, Morph Bridges and Cell Behaviour.
- C0.11 — advanced connection styling.
- C0.12 — advanced Membrane.
- C0.13 — Arrange and Markup.
- C0.13A — standalone Annotation Card.

## Safe C0.4 implementation slices

- C0.4.1 — layer contracts, project defaults, sparse overrides and resolvers.
- C0.4.2 — selection overlay separation.
- C0.4.3 — Classic renderer layer separation.
- C0.4.4 — Organism/WebGL renderer layer separation.
- C0.4.5 — persistence, migration and export parity.
- C0.4.6 — independent audit and manual Canvas QA.

Area editing belongs to C0.5, not C0.4.

## Later broad phases

- C1 — shell evolution.
- C2 — Data, Floors, Analysis and Dashboard.
- C3 — Project, presentation, import and export expansion.
- C4 — rules/bylaws.
- C5 — templates and AI-assisted workflows.
- C6 — devices, backend, authentication and collaboration last.

## Later-scope directory

Use `docs/later-scope/` for important approved ideas that are intentionally deferred.

Captured examples:

- dashed, dotted, double, technical, chain and dash-dot line styles,
- gradients, patterns, hatches and print-safe technical styles,
- advanced Core shapes,
- advanced Membrane geometry and motion,
- advanced Flags and label collision avoidance,
- advanced Annotation Card presets,
- advanced connections, grids, snapping and platform work.

Items in later-scope are not implementation permission.

## Worker snapshot

- Codex — ASSIGNED — WAITING_REVIEW — C0.4.1.
- Antigravity — UNASSIGNED — HOLD — last completed C0.4 architecture audit.
- Claude — UNASSIGNED — ABORTED — prior C0.3 prototype session exhausted; do not reuse that session.

## Known limitations

- 50+ Cell interactive performance is still a known limitation.
- Known Vite main-chunk warning is accepted.
- Annotation Card is planning only.
- Advanced technical styles are planning only.
- C0.4.2 onward is not implemented.

## Canonical live references

- `custom-gpt/state/CURRENT_PROJECT_STATE.json`
- status branches
- `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md`
- `docs/C0_4_SAFE_IMPLEMENTATION_SLICES.md`
- `docs/later-scope/README.md`
