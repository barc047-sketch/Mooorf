# Codex Rules

`AGENTS.md` is the controlling project guide. Codex must:

- follow its read order and forbidden-directory rules;
- make the smallest phase-scoped change;
- keep graph/store/canvas/table ownership inside the application;
- use skills and MCPs only as workflow or UI aids;
- never expose secrets, deploy, or add backend/auth/payment/cloud features;
- build after code changes and update the phase handoff.

When the working structure differs from a preferred future structure, document a migration instead of moving working runtime files.
