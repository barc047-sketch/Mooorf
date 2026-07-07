# MCP Policy

MCPs are optional support tools. None are required for the current Codex setup.

Allowed roles:

- local preview and browser QA;
- official library documentation lookup;
- visual component generation adapted to local tokens;
- GitHub issues and pull requests when that workflow is active;
- Figma design context when a reference exists.

MCPs must not own or rewrite the central graph, store, table sync, import/export contracts, project model, or export truth. Do not add an unknown MCP with broad write access, transmit secrets, or introduce backend/auth/payment/cloud behavior.

See `docs/mcp/CODEX_MCP_PLAN.md`.
