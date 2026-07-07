# Codex Workspace Setup

Status: complete.

- Workspace rules: `AGENTS.md`
- Agent handoff rules: `docs/agents/`
- Skill policy and candidates: `docs/SKILL_POLICY.md`, `.codex/skills/`
- MCP policy and plan: `docs/MCP_POLICY.md`, `docs/mcp/CODEX_MCP_PLAN.md`
- Preview instructions: `docs/CODEX_LOCAL_PREVIEW.md`
- Phase routing: `docs/CODEX_PHASE_ROUTING.md`
- Directory map: `docs/CODEX_DIRECTORY_MAP.md`

The runtime directories were not moved. No package, MCP, backend, deployment, or secret configuration was added.

Codex CLI and `codex mcp` are available. Project-local `.codex/skills` discovery was not explicitly documented by the installed CLI, so the checked-in skills are treated as lightweight candidates and readable project policy.
