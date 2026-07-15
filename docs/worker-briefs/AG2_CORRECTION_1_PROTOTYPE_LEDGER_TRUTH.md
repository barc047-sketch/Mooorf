# AG2 Correction 1 — Prototype Ledger Truth and Durable Handoff

**Status:** CORRECTION REQUIRED — same authorized AG2 research task
**Worker:** Antigravity
**Repository:** `barc047-sketch/Mooorf`
**Work branch:** `research/m2-prototype-and-icon-gap-audit`
**Exact correction base:** `2482b11ca5f72b2898ea0b2f516d35fecb08ced2`
**Protected production:** `main@c4600472ea76f651800c19b91cf8f67954ca992e`

## 1. Review result

The branch structure and six required deliverables are correct, but the prototype coverage ledger is not yet reliable enough to become a production contract input.

Confirmed factual issues:

1. The approved Claude prototype/manual QA includes keyboard `I` opening/closing the Inspector. The AG2 ledger omitted this feature and therefore incorrectly reports `MISSING: 0`. At the reviewed M1 snapshot, no global `I` shortcut exists.
2. `Save as Preset` is marked `IMPLEMENTED` in M1, but the production Inspector at the reviewed head exposes Copy Style, Paste Style, Reset Family and Reset All Appearance only. Production Presets remain planned for M4.
3. `Material Browser handoff` is marked `PARTIAL` with an implemented button hook, but the reviewed M1 appearance widgets expose colour inputs/swatches and no real `Open Material Browser` command. The full handoff remains planned for M4.
4. `contextual bottom rail structure` is marked `IMPLEMENTED`, but M1 has only a bounded baseline Dock. The final contextual launcher/rail architecture remains M3A.
5. Copy/Paste Style must not be described as fully covering the Claude prototype until Symbol placement/backing exists. Current Cell/text appearance copying is implemented; symbol-related style coverage remains M2.
6. Several deliverables contain local `file:///Users/...` links. These are not durable GitHub evidence.
7. `156 active geometries / 176 searchable IDs` is a projected research ceiling, not an automatically approved M2 intake. The 20 custom candidates require Owner approval and staging.
8. The handoff must distinguish eight complete original custom briefs from twelve additional custom-gap candidates; do not describe all twenty as equally complete or approved briefs.

## 2. Required corrections

### A. Rebuild the prototype coverage ledger truthfully

Re-audit every meaningful Claude prototype interaction against:

- `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`;
- `feature/c0-m1-inspector-layer-editing-recovery@f2d6f99c34257a04e42d4dd6aae2f9b59898d8f6` for current fixed evidence;
- current milestone plans on `docs/mooorf-ai-team-operating-protocol`.

Do not preserve the number 49 if the evidence contains more features. Derive the total from the audited rows.

At minimum add/correct:

- global keyboard `I` Inspector toggle → `MISSING` at the reviewed head, assigned to M1 Correction 4;
- Save as Preset → `PLANNED`, M4;
- Material Browser handoff → `PLANNED`, M4; quick colour swatches may remain a separate `PARTIAL` feature;
- contextual bottom rail → `PARTIAL` or `PLANNED`, M3A, with the existing baseline Dock described separately;
- Copy Style and Paste Style → `PARTIAL` relative to the complete prototype contract until Symbol placement/backing is implemented in M2;
- Symbol tab seam versus an actual clickable/live Symbol tab must remain clearly distinguished.

Every status must cite exact repository path/ref evidence and an acceptance test.

### B. Fix durable links

Replace all local `file:///Users/...`, `/private/tmp/...` or machine-only paths in AG2 deliverables with:

- repository-relative paths;
- exact branch/SHA references;
- plain code-formatted paths when no GitHub link is available.

### C. Correct catalogue language

Keep validated count math where correct, but label it accurately:

- baseline/current;
- previously proposed;
- new pass-2 candidates;
- Owner-approved versus pending;
- projected ceiling versus committed milestone scope.

M2 must not automatically ingest all 156 geometries. Recommended staging:

1. verified baseline + approved Lucide/aliases;
2. Owner-approved essential custom symbols;
3. later domain packs for additional structural/MEP/program symbols.

### D. Correct custom-symbol wording

State precisely:

- eight original custom symbols have full implementation-ready briefs in `MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md`;
- twelve additional custom-gap geometries are research candidates/specifications in the gap-pass document;
- none are production-approved merely by appearing in research.

### E. Update all affected outputs

Update as necessary:

- `docs/research/M2_CLAUDE_PROTOTYPE_COVERAGE_LEDGER.md`;
- `docs/research/M2_DRAWABLE_SYMBOL_GAP_PASS_2.md`;
- `docs/research/MOOORF_UI_COMMAND_ICON_MAP.md`;
- `docs/research/MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md`;
- `docs/research/M2_SYMBOL_PRIORITY_MANIFEST.json`;
- `docs/research/AG2_RESEARCH_HANDOFF.md`.

The JSON manifest must reflect corrected milestone/status classifications and approval states where represented.

## 3. Restrictions

- Research/docs only.
- No `src/`, package, test, configuration or runtime changes.
- Do not modify `main`, Codex feature branches or `status/codex`.
- Do not merge any research/prototype branch.
- Do not begin production icon creation.

## 4. Verification

1. Validate JSON parsing.
2. Search all six outputs and prove no `file:///`, `/Users/` or `/private/tmp/` links remain.
3. Prove changed files remain only under `docs/research/`.
4. Run `git diff --check 2482b11ca5f72b2898ea0b2f516d35fecb08ced2...HEAD`.
5. Update `worker-status/ANTIGRAVITY.json` to `WAITING_REVIEW` with the corrected fixed head.
6. Push one corrected research head and stop.

Do not merge. Do not begin another task.