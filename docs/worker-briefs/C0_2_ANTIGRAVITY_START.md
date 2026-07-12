# C0.2 Antigravity Start Brief

CODER: Antigravity
MODEL: Sonnet 4.6
EFFORT: High
EFFORT REASON: This is a read-only cross-branch asset audit covering production plus two prototype branches, with legal, duplication, naming and production-ownership decisions.
ROLE: Icon and grid asset cartographer
WHY THIS MODEL: Strong cross-file comparison, visual taxonomy, duplication detection and implementation mapping.
PARALLEL AGENT: Claude may work on the isolated C0.3 prototype. Codex may work read-only on C0.2/C0.3 architecture. Do not touch their branches or files.

## Start command

Execute the full task in:

`docs/worker-briefs/C0_2_ANTIGRAVITY_ICON_GRID_INVENTORY.md`

This start brief overrides only the outdated source-state lines in that file.

## Current verified source state

- Repository: `/Users/tanisxq/Documents/ZONU0`
- Required production source: `origin/main`
- Exact required main SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`
- Stabilization is already merged and accepted.
- Prototype references remain read-only:
  - `design/v8-2-ui-lab`
  - `design/v8-2c1-desktop-shell-lab`
- External artifact root: `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS`

Fetch remotes and stop if `origin/main` does not exactly match the SHA above.

## Status requirement before work

Before reading or auditing, follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Publish:

- branch: `status/antigravity`
- file: `worker-status/ANTIGRAVITY.json`
- status: `RUNNING`
- task: `C0.2 icon and grid asset inventory`
- brief: `docs/worker-briefs/C0_2_ANTIGRAVITY_ICON_GRID_INVENTORY.md`
- source SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

Update the status at major checkpoints, when blocked, and when done.

## Plain-language scope

Audit and organize everything that already exists before any implementation begins.

Do:

- inventory production icons and symbols,
- inventory Claude V1 and V2 icons and symbols,
- inventory all production and prototype grid presets,
- remove duplicates and near-duplicates,
- propose canonical IDs, names, categories, tooltips and command mappings,
- identify original, third-party and licence-uncertain assets,
- classify each asset as copy, adapt, redraw, future, debug or reject,
- map every approved asset to the existing production registry ownership,
- create a narrow C0.2 implementation plan for Codex,
- keep C0.3 Inspector UI completely separate.

Do not:

- modify product code,
- commit or push product changes,
- install packages,
- build the Inspector,
- add shortcut `I`,
- redesign rails or the Canvas,
- merge prototype branches,
- create a parallel icon or grid store,
- claim uncertain licences are safe.

## Required outputs

Write only to `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS`:

1. `C0_2_ICON_MASTER_INVENTORY.md`
2. `C0_2_GRID_MASTER_INVENTORY.md`
3. `C0_2_PROTOTYPE_ASSET_REUSE_MATRIX.md`
4. `C0_2_PRODUCTION_INTEGRATION_MAP.md`
5. `C0_2_IMPLEMENTATION_PLAN.md`
6. `C0_2_AUDIT_STATE.json`

Optional only when genuinely useful:

7. `C0_2_ICON_GRID_CONTACT_SHEET.png`

## Completion rule

Do not mark complete until:

- production, V1 and V2 sources are all verified,
- icon and grid inventories are deduplicated,
- licence uncertainty is explicitly flagged,
- production ownership is mapped,
- the C0.2 implementation slice excludes visible Inspector UI,
- `status/antigravity` is updated to `DONE`,
- the final response includes the exact artifact paths and status commit.

PONYTAIL:
- reused: production registries, prototype assets, existing cartography
- adapted: canonical naming and metadata only
- new files justified: external audit artifacts and status telemetry only
- duplication avoided: no new production store, registry or UI
