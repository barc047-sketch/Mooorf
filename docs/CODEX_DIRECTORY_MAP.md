# Codex Directory Map

## Runtime — do not rearrange during setup

- `src/canvas/` — canvas, renderer, and blob
- `src/state/` — Zustand state
- `src/views/` — synchronized views
- `src/domain/graph/` — protected central graph domain
- `src/ui/` and `src/components/` — application controls and primitives

## Project control

- `AGENTS.md` — Codex entry rules
- `docs/agents/` — agent workflow and handoff
- `docs/mcp/` — MCP planning
- `docs/skills/` — optional external-skill references
- `.codex/skills/` — project-local skill candidates

## Assets

- `assets/references/` — visual references
- `assets/licenses/` — future third-party license records
- `assets/generated-components/` — future reviewed generated UI

No runtime migration is needed. Create asset subdirectories only when real files need them.
