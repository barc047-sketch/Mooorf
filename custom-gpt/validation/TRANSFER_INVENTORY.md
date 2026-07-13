# Custom GPT Transfer Inventory

This inventory prevents hidden project rules from being lost during transfer.

| Project truth | Canonical GitHub source | Custom GPT location | Type | Update owner |
|---|---|---|---|---|
| Owner authority and GO rules | `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md` | `GPT_INSTRUCTIONS.md`, Knowledge 01 | live + snapshot | Project Manager after Owner approval |
| Product vision | `docs/MOOORF_FINAL_SCOPE.md`, `docs/MOOORF_MASTER_PRODUCT_SCOPE.md` | Knowledge 02 | live + snapshot | Owner/Project Manager |
| Desktop visual system | `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` | Knowledge 01/02 references | live | Owner/Project Manager |
| Canonical roadmap | `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md` | Knowledge 03 | live + snapshot | Project Manager after approval |
| Change control | `docs/MOOORF_CHANGE_CONTROL_PROTOCOL.md` | `GPT_INSTRUCTIONS.md`, `ORCHESTRATION_OS.md` | live + snapshot | Project Manager |
| Current phase and gate | `custom-gpt/state/CURRENT_PROJECT_STATE.json` | state file + Knowledge 03 fallback | live | Project Manager |
| Worker statuses | `status/codex`, `status/claude`, `status/antigravity` | boot protocol | live only | each worker |
| Active task contract | `docs/worker-briefs/*` | boot protocol | live only | Project Manager |
| CAVEMAN | `custom-gpt/orchestration/ORCHESTRATION_OS.md` | Instructions + Knowledge 04 | live + snapshot | Project Manager |
| HEADROOM | `custom-gpt/orchestration/ORCHESTRATION_OS.md` | Instructions + Knowledge 04 | live + snapshot | Project Manager |
| PONYTAIL | `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`, `docs/CODEX_PHASE_PROTOCOL.md` | Instructions + Knowledge 04 | live + snapshot | Project Manager |
| Branch/worktree safety | operating protocol and worker briefs | Instructions + templates | live + snapshot | Project Manager |
| Audit gate | operating protocol, audit briefs | `AUDIT_QA_MERGE_GATES.md` | live + snapshot | Project Manager |
| Merge gate | operating protocol, merge briefs | `AUDIT_QA_MERGE_GATES.md` | live + snapshot | Owner/Project Manager |
| Product architecture owners | `docs/PROJECT_MEMORY_INDEX.md`, component/feature maps | Knowledge 02 | live + snapshot | production workers via audit |
| Organism targets | scope/roadmap/C0.4 docs | Knowledge 01/02 | live + snapshot | Owner/Project Manager |
| Connections | connection scope docs/later scope | Knowledge 01/02 | live + snapshot | Owner/Project Manager |
| Annotation Card | annotation scope and roadmap amendment | Knowledge 01/02/03 | live + snapshot | Owner/Project Manager |
| Cell Label/Flag/Area sync | annotation scope, C0.5 roadmap | Knowledge 01/02/03 | live + snapshot | Owner/Project Manager |
| Later-scope items | `docs/later-scope/` | Knowledge 03 | live + snapshot | Owner/Project Manager |
| Known bugs/limits | `docs/BUGS.md`, `docs/ORGANISM_ENGINE_LIMITS.md`, reports | current state + live docs | live | worker/auditor |
| Component/file ownership | `docs/COMPONENT_INVENTORY.md`, `docs/FEATURE_MAP.md`, `docs/PROJECT_MEMORY_INDEX.md` | live read order | live only | workers via approved task |
| Prototype reuse | prototype branches and reuse audits | live active contract only | live only | auditor/Project Manager |
| Security boundaries | operating protocol, `.gitignore`, this pack | setup guide + security rules | live + snapshot | Owner/Project Manager |
| New-chat recovery | this directory | boot protocol | live + snapshot | Project Manager |
| End-of-chat handoff | state file + worker statuses | Instructions | live | Project Manager |

## Completeness requirements

Transfer is complete only when:

- every row above has a readable source,
- the Custom GPT can access the repository and status branches,
- the four Knowledge uploads match the manifest,
- `CURRENT_PROJECT_STATE.json` reflects live state or clearly reports mismatch,
- all critical Preview tests pass,
- no secrets/local-only references are uploaded.

## Items intentionally not copied into Knowledge

These must remain live reads to avoid stale or oversized context:

- full source code,
- complete commit history,
- all old task briefs,
- generated build/audit output,
- binary/image/video reference archives,
- local worktree paths as operational truth,
- secrets and credentials.
