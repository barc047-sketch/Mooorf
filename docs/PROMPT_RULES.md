# Prompt Rules

Purpose: make future phase prompts shorter and more reliable.

## Concise Phase Prompt Format

Use this structure:

```text
PHASE:
GOAL:
CURRENT BASELINE COMMIT:
READ:
TOUCH:
DO NOT:
CHECKS:
COMMIT MESSAGE:
FINAL REPORT FIELDS:
PONYTAIL CHECK:
```

Prefer references to `docs/PROJECT_MEMORY_INDEX.md` and `docs/FEATURE_MAP.md` instead of repeating all project context.

## Required Prompt Rules

- Tell Codex to read repo state first: `git status --short`, `git pull --ff-only`, `git log --oneline -8`, `git diff --stat`.
- Include latest expected commit.
- Mention `.claude/launch.json` if it is still dirty: do not stage it.
- Ask no unnecessary questions; Codex should make reasonable local assumptions.
- Tell Codex to read only relevant files and auto-discover with `rg`.
- Ask for useful file additions when they reduce future prompt length.
- Reuse existing components, store actions, adapters, docs, and CSS patterns before custom code.
- Do not install random packages.
- Do not run full QA unless the phase is QA. Use focused smoke checks.
- Always run `npm run build`.
- Keep final report under 220 words unless a phase explicitly needs more.
- Every phase prompt must include a Ponytail check:
  - reused existing?
  - used installed package/library?
  - avoided duplicate UI?
  - adapter over rewrite?
  - new files justified?

## Commit Message Convention

- Docs/workflow: `docs: ...`
- Features: `feat: ...`
- Fixes: `fix: ...`
- Maintenance: `chore: ...`
- Refactors without feature change: `refactor: ...`

## Good Short Prompt Example

```text
MOOORF / ZONUERT — V6LQ SHADER/VOID QA

Read repo state first. Use docs/PROJECT_MEMORY_INDEX.md and docs/FEATURE_MAP.md.
Expected latest commit: <hash>.

Goal: QA only for void nuclei and multi-color shader. Fix real bugs only.
Do not start selection arc, direct rename, export, floors, or texture-buffer renderer.

Read: docs/ORGANISM_ENGINE_LIMITS.md, docs/BUGS.md, src/canvas/OrganismCanvasView.tsx,
src/canvas/organismAdapter.ts, src/experiments/organism-lab/organism-shader.ts,
src/state/store.ts, src/views/TableView.tsx.

Checks: npm run build, focused preview QA for void add/edit/save/load/fallback/lab.
PONYTAIL CHECK: reuse existing shader/store/table/fallback paths; no duplicate UI/state.
Commit: fix: stabilize void nuclei shader behavior
Final report under 220 words.
```

## Anti-Patterns

- Repeating the full phase history in every prompt.
- Asking for unrelated polish inside QA.
- Mixing product features with workflow maintenance.
- Telling Codex to read the whole repo.
- Allowing package installs for small UI or docs work.
- Omitting the expected latest commit.
