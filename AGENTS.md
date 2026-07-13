# MOOORF Agent Entry Point

## Custom GPT / Project Manager boot

A fresh MOOORF Project Manager or Custom GPT session must begin with:

1. `custom-gpt/bootstrap/BOOT_PROTOCOL.md`
2. `custom-gpt/state/CURRENT_PROJECT_STATE.json`
3. live `main` and worker-status branch verification

The command used by the Owner is: `BOOT MOOORF`.

GitHub live state overrides uploaded Knowledge and previous chat memory.

Before planning, modifying, auditing or merging MOOORF, read:

1. `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
2. `docs/MOOORF_FINAL_SCOPE.md`
3. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
4. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
5. `docs/PROJECT_MEMORY_INDEX.md`
6. `docs/CODEX_PHASE_PROTOCOL.md`
7. relevant current handoff, task queue and audit artifacts.

Rules:

- The user is the Owner and final decision-maker.
- The coordinating ChatGPT conversation is the Project Manager.
- No worker starts without an explicit Owner GO command.
- Do not interpret rough discussion as a locked decision.
- Verify GitHub state before every implementation prompt.
- Never merge unaudited complex work.
- Preserve `.claude/launch.json`.
- Keep `.references/` local-only.
- Do not merge Claude prototype branches wholesale.
- Master Graph remains the only project-data source of truth.
- Read the full operating protocol for worker routing, branch safety and report
  requirements.

## Workspace hygiene (carried forward)

These pre-protocol repository rules remain in force:

- Read `docs/HANDOFF.md` then `docs/TASK_QUEUE.md` before phase work; read
  `docs/BUGS.md` only when fixing a bug and `docs/DECISIONS.md` only when
  architecture matters.
- Never scan the full repository. Never read `node_modules`, `dist`, `build`,
  `.next`, `coverage`, `.env*`, secrets, or `package-lock.json` unless a
  dependency issue explicitly requires the lockfile.
- Complete only the requested phase; prefer small, deterministic changes and
  existing components.
- Product data remains owned by the central graph/store, never UI tools,
  skills, or MCPs.
- Do not add backend, auth, cloud save, payment, public gallery, or online
  deployment.
- Do not install packages unless the phase explicitly requires them.
- For code changes, run `npm run build`; update `docs/HANDOFF.md` and
  `docs/TASK_QUEUE.md` on phase completion.
