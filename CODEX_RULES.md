# Codex Rules

Use these rules for future Codex work in this project.

- Do not rewrite the whole app unless absolutely necessary.
- Preserve the existing visual direction.
- Preserve current store/table sync unless the phase explicitly says otherwise.
- Make small, safe changes.
- Prefer adapter layers over rewrites.
- Ponytail is mandatory: prefer reuse/adapters over rewrites. Do not create duplicate components or parallel state systems.
- Run available lint/typecheck/build checks before the final answer. If scripts are missing, say so.
- Explain changed files clearly.
- Never touch secrets, `.env` files, API keys, tokens, credentials, or private config.
- Do not edit `node_modules`, `dist`, `build`, `.next`, or `coverage`.
- Keep code modular and reusable.
- Keep the old canvas fallback until the new organism canvas is fully stable.
- Do not start later roadmap phases without explicit instruction.
- Update `docs/HANDOFF.md`, `docs/TASK_QUEUE.md`, `docs/BUGS.md`, and `docs/DECISIONS.md` after meaningful work.
- Final reports must include build status and the next suggested task.

Project read order remains defined in [AGENTS.md](AGENTS.md).
