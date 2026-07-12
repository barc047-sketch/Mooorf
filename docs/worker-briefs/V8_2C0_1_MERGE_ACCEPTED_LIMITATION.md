# V8.2C0.1 Merge Brief — Accepted Dense-Scene Limitation

CODER: Codex
MODEL: Luna / GPT-5 Codex
EFFORT: Medium
ROLE: Safe integration and release-state maintainer
PARALLEL AGENT: None

## Owner decision

The Owner has manually confirmed:

- the Morph control is now visible,
- the Membrane/Morph output is visible,
- the current dense-scene slowdown around approximately 50 Cells is acceptable for this stage,
- deeper 50–60 Cell optimization is deferred,
- proceed to the next milestone.

Record the dense-scene slowdown as a known limitation, not as a completed performance claim.

## Source state to verify

Repository: `/Users/tanisxq/Documents/ZONU0`

Expected main:
`70f593dffc38b8f37160567a4a18238f32fcf8ee`

Stabilization branch:
`feature/v8-2c0-1-canvas-stabilization`

Expected stabilization head:
`222dc7aa5e4bd4536aed9709abe45a94c758f857`

Governance branch:
`docs/mooorf-ai-team-operating-protocol`

Governance commit to integrate:
`8d401d253b4d30b56e74b38d53fce4cee4de6d62`

Do not integrate the later worker-brief-only commits from the governance branch into main unless they are explicitly required.

## Safety

1. Fetch all remotes and verify every SHA.
2. Preserve `.claude/launch.json`; never stage, reset, delete or overwrite it.
3. If the primary repo contains dirty production work, use an isolated temporary worktree.
4. Never force-push.
5. Never rebase shared branches.
6. Do not modify the stabilization branch.
7. Do not delete archive, prototype or audit branches.
8. Stop on any unexpected conflict.

## Temporary branch cleanup

The Project Manager accidentally created these empty temporary branches while preparing worker briefs:

- `tmp-ignore`
- `tmp-ignore-2`
- `tmp-ignore-3`
- `tmp-ignore-4`
- `tmp-ignore-5`
- `tmp-ignore-6`

Before deleting any of them, verify each still points exactly to the old main commit:
`70f593dffc38b8f37160567a4a18238f32fcf8ee`

If and only if each branch has no unique commit and still points to that SHA, delete those six remote branches after the verified main update. Do not delete any other branch. Report the cleanup explicitly.

## Integration sequence

Use an isolated integration branch from `origin/main`:

`integration/v8-2c0-1-stabilization-and-governance`

1. Fast-forward or merge the exact stabilization head into the integration branch without rewriting history.
2. Cherry-pick only governance commit `8d401d253b4d30b56e74b38d53fce4cee4de6d62`.
3. Resolve no conflict silently. Stop and report any conflict.
4. Update only the relevant stabilization status documentation to state:
   - Morph is visible and accepted by the Owner,
   - 50+ Cell interaction optimization is deferred,
   - current stage is accepted for progression,
   - next milestone is C0.2 Icon and Grid Asset Registry.
5. Do not claim 50–60 Cell performance is fixed.

## Verification

Run:

- existing stabilization focused tests,
- group drag tests,
- inline editor tests,
- Morph/Motion tests,
- resource persistence tests,
- icon resource tests,
- grid resource tests,
- import/export tests,
- `git diff --check`,
- exactly one final production build.

Do not run another full visual screenshot matrix.

## Main update gate

After verification, report the integration branch SHA and wait unless the Owner's command explicitly authorizes updating main.

When explicitly authorized to merge:

- update `main` only by fast-forward from the verified integration branch when possible,
- push `main`,
- verify remote `main` equals the integration SHA,
- do not delete source branches.

## Commit

Any documentation-only acceptance update:

`docs: record accepted canvas stabilization limitation`

## Final report

STATUS:
CODER:
MODEL:
MAIN BEFORE:
STABILIZATION VERIFIED:
GOVERNANCE COMMIT VERIFIED:
INTEGRATION BRANCH:
INTEGRATION HEAD:
MORPH ACCEPTED:
50-CELL LIMITATION RECORDED:
TESTS:
BUILD:
CONFLICTS:
MAIN UPDATED:
MAIN AFTER:
SOURCE BRANCHES PRESERVED:
TEMP BRANCHES CLEANED:
UNSTAGED LEFT:
NEXT:

PONYTAIL:
- reused:
- adapted:
- new files justified:
- duplication avoided: