# Codex Brief — C0.4.1 Audited Merge

TASK: Merge audited C0.4.1 layer contracts foundation
SESSION: NEW
GOAL: Verify the exact audited source and feature SHAs, merge only the audited feature into main, run final checks, push main, and stop. Do not begin C0.4F-A in this task.
BASE SHA: a0f7b33d4e13ad72d5203141d7688794ad377446
BRANCH: main
FEATURE BRANCH: feature/c0-4-1-layer-contracts-resolvers
FEATURE HEAD: c4600472ea76f651800c19b91cf8f67954ca992e
AUDIT VERDICT: MERGE CANDIDATE
AUDIT REPORT: docs/audits/C0_4_1_ANTIGRAVITY_DELTA_AUDIT.md on audit/c0-4-1-layer-contracts-resolvers

READ ALLOWLIST:
1. AGENTS.md
2. docs/worker-briefs/C0_4_1_CODEX_AUDITED_MERGE.md
3. docs/C0_4_1_LAYER_CONTRACTS_IMPLEMENTATION_REPORT.md from the feature head
4. docs/audits/C0_4_1_ANTIGRAVITY_DELTA_AUDIT.md from the audit branch
5. worker-status/CODEX.json from status/codex
6. worker-status/ANTIGRAVITY.json from status/antigravity

WRITE ALLOWLIST:
- main only through the exact audited merge
- worker-status/CODEX.json on status/codex
- custom-gpt/state/CURRENT_PROJECT_STATE.json only if the Project Manager separately requests governance writeback

DO NOT TOUCH:
- feature branch content
- audit branch
- product files beyond the exact merge result
- .claude/launch.json
- .references/
- packages or dependencies
- C0.4F-A implementation

SCOPE:
- Fetch all refs.
- Verify origin/main is exactly a0f7b33d4e13ad72d5203141d7688794ad377446.
- Verify origin/feature/c0-4-1-layer-contracts-resolvers is exactly c4600472ea76f651800c19b91cf8f67954ca992e.
- Verify the feature remains exactly one commit ahead and zero behind main.
- Verify Antigravity status is DONE and verdict is MERGE CANDIDATE for the exact SHAs.
- Merge without rebasing or modifying the audited feature.
- Preserve a clear merge relationship; do not squash unless the Owner explicitly changes this brief.
- Run focused presentation/import/export/resource contracts, git diff --check and one final production build.
- Push main.
- Update Codex status to DONE with the resulting main SHA.
- Stop.

LIMITATIONS:
- The audit branch has divergent governance ancestry and is report-only. Never merge it.
- Two Markdown trailing-space warnings in the feature report are accepted and do not justify changing the audited feature during merge.
- Known Vite chunk warning remains accepted.

ACCEPTANCE:
- Exact audited feature is merged with no extra product changes.
- Main push succeeds.
- Tests and build pass.
- Resulting main SHA is reported.
- No C0.4F-A code starts.

TESTS:
- npx tsx src/domain/presentation/presentationContracts.test.ts
- npx tsx src/export/exportCore.test.ts
- npx tsx src/import/importCore.test.ts
- npx tsx src/resources/resourcePersistence.test.ts
- git diff --check against pre-merge main
- npm run build exactly once after merge

STOP CONDITIONS:
- main or feature SHA differs
- feature is no longer one commit ahead / zero behind
- audit status or verdict does not match exact SHAs
- merge conflict
- new test or build regression
- protected/local-only file would be changed

OUTPUT:
- resulting main SHA
- merge method and parents
- commands and test/build results
- files changed must equal the audited feature diff
- Codex status update
- next gate: Project Manager creates exact C0.4F-A implementation brief from the resulting main SHA

PONYTAIL:
- reused: exact audited feature, existing test scripts and main history
- adapted: none
- new files justified: none
- duplication avoided: no copied implementation, second branch history or duplicate system
