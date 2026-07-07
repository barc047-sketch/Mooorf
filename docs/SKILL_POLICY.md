# Skill Policy

Skills guide execution; they do not own product data or architecture.

- Prefer concise, project-specific skills with clear triggers.
- Visual skills may affect canvas helpers, CSS, controls, and presentation only.
- QA skills may build, preview, inspect, and perform small scoped bugfixes.
- Skills must preserve the central graph, store, canvas/table synchronization, project model, and import/export contracts.
- No skill may add backend/auth/payment/cloud behavior, touch secrets, deploy, or install dependencies without explicit phase approval.

Project-local candidates live under `.codex/skills/`. If the installed Codex version does not discover project-local skills, use these files as checked-in workflow references; do not copy them globally without approval.
