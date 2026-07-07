# ZONUERT Agent Rules

Work one phase at a time and preserve the browser-first, local-first architecture.

## Read order

1. Read `docs/HANDOFF.md`.
2. Read `docs/TASK_QUEUE.md`.
3. Read `docs/BUGS.md` only when fixing a bug.
4. Read `docs/DECISIONS.md` only when architecture matters.
5. Read `package.json` only when scripts or dependencies matter.

Never scan the full repository. Never read `node_modules`, `dist`, `build`, `.next`, `coverage`, `.env*`, secrets, or `package-lock.json` unless a dependency issue explicitly requires the lockfile.

## Guardrails

- Complete only the requested phase.
- Reuse existing layout, store, graph, and view logic.
- Do not rewrite the store, central graph, canvas, table sync, import/export contracts, or project model unless the phase explicitly requires it.
- Product data remains owned by the central graph/store, never UI tools, skills, or MCPs.
- Do not add backend, auth, cloud save, payment, public gallery, or online deployment.
- Do not install packages unless the phase explicitly requires them.
- Do not touch secrets or delete major folders without approval.
- Prefer small, deterministic changes and existing components.

## Phase completion

For code changes, run `npm run build`. Update `docs/HANDOFF.md` and `docs/TASK_QUEUE.md`. Update `docs/BUGS.md` only for a real bug and `docs/DECISIONS.md` only for a real architecture decision.
