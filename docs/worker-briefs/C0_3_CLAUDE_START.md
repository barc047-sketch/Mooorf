# C0.3 Claude Start Brief

CODER: Claude Code
MODEL: Claude Fable 5 / strongest available Claude design model
EFFORT: High
EFFORT REASON: This is a focused high-fidelity interaction prototype that must match current production style exactly while remaining isolated from production code.
ROLE: Icons & Symbols Inspector visual-prototype designer
WHY THIS MODEL: Strongest available visual interaction design and rapid high-fidelity prototyping.
PARALLEL AGENT: Antigravity audits icon/grid assets. Codex performs read-only production architecture. Do not touch their branches or files.

## Start command

Execute the full task in:

`docs/worker-briefs/C0_3_CLAUDE_ICONS_SYMBOLS_INSPECTOR_LAB.md`

This start brief supplies the exact merged production SHA and mandatory status telemetry.

## Verified source

- Repository: `/Users/tanisxq/Documents/ZONU0`
- Required base: `origin/main`
- Exact required SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`
- New branch: `design/c0-3-icons-symbols-inspector-lab`
- Preferred worktree: `/Users/tanisxq/Documents/ZONU0-CLAUDE-C0-3`

Fetch remotes and stop if `origin/main` differs from the exact SHA.

## Status before work

Follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Publish before starting:

- branch: `status/claude`
- file: `worker-status/CLAUDE.json`
- status: `RUNNING`
- task: `C0.3 Icons & Symbols Inspector prototype`
- source SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

## Plain-language scope

Build one isolated visual prototype showing how a user selects Cell(s), presses `I`, browses/searches icons, previews on hover, applies an icon, adjusts placement/scale/rotation/opacity/tint/backing, uses project defaults or local overrides, and applies one icon to multiple selected Cells.

Style must match current production tokens, typography, spacing, keylines, glass, palettes, WidgetFrame density and right-panel geometry. Canvas stays visible. No UI shadows, hover magnification, Mac Dock scaling or full-shell redesign.

Do not modify production `src/`, packages, main, stabilization, integration or another worker's branch. Do not implement production state, export, persistence or final icon assets.

## Manual QA handoff

After push, report:

- branch and head SHA,
- exact local run command/URL,
- four maximum screenshots,
- a 6-step manual QA checklist covering `I`, search, hover preview, apply, Escape/revert, multi-select and 1280/1440 style parity.

Do not mark visually approved yourself. End at `WAITING_REVIEW`; Owner performs final manual QA.

PONYTAIL:
- reused: current production tokens and primitives
- adapted: approved V1/V2 interaction ideas only
- new files justified: isolated prototype and handoff docs
- duplication avoided: no production store or shell duplication