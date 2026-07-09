# Codex Phase Protocol

Purpose: the standard operating loop for every future Codex phase in this repo.

## Start Every Phase

Run from the repo root:

```bash
git status --short
git pull --ff-only
git log --oneline -8
git diff --stat
```

Confirm:

- branch is `main`;
- latest commit matches the requested baseline or explain the mismatch;
- dirty files are understood before editing;
- `.claude/launch.json` is never staged unless the user explicitly requests it;
- GitHub `origin` remains the source of truth.

## Read Strategy

Read only relevant files.

Default entry points:

- `HANDOFF.md`
- `TASK_QUEUE.md`
- `docs/PROJECT_MEMORY_INDEX.md`
- `docs/FEATURE_MAP.md`
- `docs/DECISIONS.md` when architecture matters
- `docs/BUGS.md` only for bugfix/QA work
- `package.json` only for scripts/dependencies

Use `rg` to discover exact files and symbols. Do not scan the full repo, and never read generated/dependency folders.

## Before Editing

Report the requested phase preflight:

- phase
- latest commit
- dirty files
- files read
- implementation/workflow plan
- risks

Then edit.

## Implementation Rules

- Complete only the requested phase.
- Reuse existing components, store actions, adapters, and renderer utilities before adding new code.
- Prefer small deterministic changes.
- Keep data ownership in `src/state/store.ts` and typed product data.
- Do not rewrite UI, renderer, graph, table sync, or saved views unless the phase explicitly requires it.
- Do not install packages unless explicitly required.
- Do not touch secrets, `.env*`, generated outputs, or local machine junk.

## Ponytail Reuse Check

Ponytail is mandatory reuse-first discipline. Codex must run this check mentally before implementation and report it when relevant.

- Reuse an existing component first.
- Reuse an existing utility/module first.
- Reuse an installed package/library first.
- Add a small adapter before rewriting behavior.
- Avoid duplicate controls.
- Avoid parallel state systems.
- Avoid new files unless they increase modularity or reduce future duplication.
- If a new file is added, explain why existing files were insufficient.
- Confirm the change reduces duplicate UI/control logic instead of increasing it.

## Docs

For meaningful work, update:

- `docs/HANDOFF.md`
- `docs/TASK_QUEUE.md`
- `docs/DECISIONS.md` only for real architecture decisions
- `docs/BUGS.md` only for real bugs/risks
- root `HANDOFF.md`
- root `TASK_QUEUE.md`

Future prompts should reference:

- `docs/PROJECT_MEMORY_INDEX.md`
- `docs/FEATURE_MAP.md`

## Verification

Always run:

```bash
npm run build
```

Run focused smoke tests only for the touched surface unless the phase is explicitly QA.

Examples:

- UI phase: app opens, relevant dock/rail/widget action, table sync if data changes, classic fallback if renderer mode is touched.
- Engine phase: organism renders, table sync, fallback, lab route, relevant stress case.
- Docs/workflow phase: `npm run build` and any added helper script.

Known acceptable warning: Vite main chunk size warning.

## Commit And Push

Before commit:

```bash
git status --short
git diff --stat
```

Stage relevant files only. Never stage `.claude/launch.json`.

Use concise commit messages:

- `docs: ...` for docs/workflow phases
- `feat: ...` for product features
- `fix: ...` for bugfixes
- `chore: ...` for repo maintenance

Push to `origin main` when the phase passes checks.

## Final Report

Keep final reports short, normally under 220 words unless the user asks otherwise.

Include:

- phase done
- latest commit checked
- files added/updated
- build status
- commit hash
- unstaged files left
- next phase
