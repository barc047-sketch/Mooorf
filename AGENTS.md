# MOOORF Agent Entry Point

Before planning, modifying, auditing, finalizing, or merging MOOORF, read only:

1. `docs/project-engine/MASTER.md`
2. `docs/project-engine/STATE.md`
3. `docs/project-engine/ACTIVE_TASK.md`
4. the relevant section of `docs/project-engine/REPO_MAP.md`

Additional routing:

- Read `docs/project-engine/WORKFLOW.md` before implementation or finalization.
- Read `docs/project-engine/ROADMAP.md` when sequencing milestones.
- Read `docs/project-engine/LEDGER.md` when architecture, Owner decisions, known bugs, or limits matter.
- Read legacy documentation only when `MASTER.md` or `REPO_MAP.md` links to it for the current subject.
- Never default-read full historical reports.

## Authority and safety

- The user is the Owner and final decision-maker.
- The coordinating ChatGPT conversation is the Project Manager.
- No worker starts without an explicit Owner GO command.
- Do not interpret rough discussion as a locked decision.
- Verify the current branch, HEAD, remote source SHA, and working-tree state before every implementation prompt.
- Never merge automatically or without the Owner's explicit merge command.
- Never merge unaudited complex work or Claude prototype branches wholesale.
- Master Graph and the central store remain the only project-data source of truth.
- Preserve `.claude/launch.json`; never stage it unless the Owner explicitly requests it.
- Keep `.references/` local-only.

## Workspace hygiene

- Complete only the active task and reuse existing owners, components, actions, adapters, and tests.
- Never scan the full repository.
- Never read or scan `node_modules`, `dist`, `build`, `.next`, `coverage`, `.audit`, `.references`, `.env*`, secrets, or `package-lock.json` unless a dependency issue explicitly requires the lockfile.
- Do not add backend, auth, cloud save, payment, public gallery, or online deployment unless an Owner-approved roadmap task explicitly authorizes it.
- Do not install packages unless the active task explicitly requires them.
- Follow the budgets, forbidden areas, checks, QA ownership, finalization gate, and report contract in `docs/project-engine/WORKFLOW.md` and `ACTIVE_TASK.md`.
- Update `STATE.md`, replace/close `ACTIVE_TASK.md`, and append the compact result to `LEDGER.md` after every completed task.
