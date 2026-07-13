# MOOORF Later Scope Registry

**Purpose:** Preserve approved future ideas without implementing them prematurely.

This directory is the canonical holding area for features that are valuable, intentionally deferred, and expected to be reviewed again after their dependencies are stable.

## Status meanings

- `CAPTURED` — approved as a useful future direction.
- `DEPENDENCY-GATED` — cannot start until named earlier phases are complete.
- `READY-FOR-PLANNING` — dependencies are complete; architecture review may begin.
- `BRIEF-APPROVED` — Owner approved a worker brief.
- `IMPLEMENTING` — active worker status proves work has started.
- `DONE` — implemented, audited and merged.
- `REJECTED` — explicitly removed by Owner decision.

Nothing in this directory authorises implementation by itself.

## Rules

1. Every deferred feature must record why it is useful.
2. Every deferred feature must record its dependency gate.
3. Deferred does not mean rejected or forgotten.
4. A future feature must move through architecture review, roadmap placement and Owner approval before a worker brief is created.
5. Future features must reuse current state, material, typography, renderer, history, persistence and export owners.
6. No future feature may introduce a duplicate store, renderer, material registry, icon registry, table database or Inspector shell.
7. When a deferred feature becomes active, its canonical implementation scope moves into the phase documentation; this file keeps a history link.

## Current registry

| File | Main category | Current status |
|---|---|---|
| `2D_TECHNICAL_ILLUSTRATION_STYLES.md` | Boundaries, patterns, gradients, technical graphics and Core shapes | CAPTURED / DEPENDENCY-GATED |
| `ADVANCED_ORGANISM_AND_MARKUP.md` | Membrane, labels, Flags, Annotation Cards, collision and editing | CAPTURED / DEPENDENCY-GATED |
| `ADVANCED_CONNECTIONS_GRID_AND_PLATFORM.md` | Connections, grids, export, performance, devices and collaboration | CAPTURED / DEPENDENCY-GATED |

## Immediate production boundary

The current C0.4 baseline intentionally implements only the minimum layer ownership needed for safe expansion.

Advanced visual language remains here until:

```text
C0.4 layer foundation
→ C0.5 production Inspector
→ material/target systems
→ relevant renderer/export parity
→ future feature architecture review
```
