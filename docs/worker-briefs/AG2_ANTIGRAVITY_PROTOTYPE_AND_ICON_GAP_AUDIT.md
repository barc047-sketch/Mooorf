# AG2 — Antigravity Prototype Coverage and Icon Gap Audit

**Status:** AUTHORIZED BY OWNER — research only
**Worker:** Antigravity
**Repository:** `barc047-sketch/Mooorf`
**Work branch:** `research/m2-prototype-and-icon-gap-audit`
**Exact branch base:** `main@c4600472ea76f651800c19b91cf8f67954ca992e`

## 1. Purpose

Create a complete, durable evidence package that prevents approved Claude prototype behaviour, required drawable symbols, UI command icons and custom architectural symbols from being forgotten or incorrectly rebuilt in later Codex milestones.

This is a research, inventory and specification task. It must not change production code, feature branches, runtime state, schemas, UI components or renderer behaviour.

## 2. Non-negotiable restrictions

1. Work only on `research/m2-prototype-and-icon-gap-audit`.
2. Verify the branch begins exactly at `c4600472ea76f651800c19b91cf8f67954ca992e`.
3. Do not modify `main`.
4. Do not modify any Codex feature branch, especially `feature/c0-m1-inspector-layer-editing-recovery`.
5. Do not modify `status/codex`.
6. Do not write production code under `src/`, tests, package files, build configuration or runtime assets.
7. Do not merge prototype, research, audit or old divergent branches.
8. Do not create a new Inspector architecture. The locked rule is one Inspector with `Content | Appearance | Symbol`.
9. UI command icons and user-placeable drawable symbols must remain separate systems.
10. Do not recommend random third-party SVG downloads, icon marketplaces, base64 blobs or unknown-license assets.
11. Lucide candidates must be verified against the installed package or official Lucide source and licence.
12. Custom architectural symbols must be specified as original MOOORF-owned vector geometry, not copied from external plan libraries.
13. Do not inflate the catalogue merely to reach a number. Every addition must solve a documented product or architectural gap.

## 3. Exact evidence refs to inspect

### Current production and active work

- Production baseline: `main@c4600472ea76f651800c19b91cf8f67954ca992e`
- Current reviewed M1 snapshot: `feature/c0-m1-inspector-layer-editing-recovery@c4f05a1b32029c6cb29f4cfaa41983ba7f77c8f9`
- M1 Correction 3 may be running concurrently. Do not read moving unpushed work and do not block on it. Treat the fixed M1 snapshot above as the comparison point.

### Claude Inspector prototype

- Prototype branch/head: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`
- Locked product scope: `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`

### Existing registries and prior research

- Audited icon/grid registry: `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`
- Symbol expansion research: `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`
- Existing outputs:
  - `docs/research/C0_2_SYMBOL_ASSET_EXPANSION.md`
  - `docs/research/C0_2_SYMBOL_CANDIDATE_MANIFEST.json`
- Fast-track atlas: `research/c0-fast-track-essential-product-atlas@348ee8cd62e45de1b1c51f144e1b7607acd016ee`

### Current milestone plans

Read from `docs/mooorf-ai-team-operating-protocol`:

- `docs/plans/C0_M2_OWNER_PREVIEW_INSPECTOR_ADVANCED_SYMBOLS.md`
- `docs/plans/C0_CANVAS_QUICK_CONTROLS_RUNTIME_GATES_AND_SNAPPING_STAGE_PLAN.md`
- `docs/plans/C0_EDITING_WORKSPACE_CANVAS_MAP_AND_BUILD_PLAN.md`
- `custom-gpt/state/CURRENT_PROJECT_STATE.json`

## 4. Workstream A — Claude prototype coverage ledger

Inspect the complete Claude/Codex prototype commit and compare every meaningful interaction, information architecture element and visual pattern against the fixed M1 snapshot and future milestone plans.

Create one row per feature. At minimum include:

- inline Space Name editing,
- inline Area editing,
- inline Body/subtext editing,
- Enter commit,
- outside-click commit,
- Escape cancellation,
- Shift+Enter Body line break,
- drag suspension while editing,
- Table/Master Graph sync contract,
- six Text Style presets,
- Text Size,
- Text Colour and Auto Contrast,
- Project Default,
- Local Override,
- Mixed state,
- one Inspector geometry,
- Content tab,
- Appearance/Cell Style grouping,
- Symbol tab,
- symbol search,
- categories,
- recent,
- favourites,
- keyboard focus,
- hover preview/revert,
- apply/replace/remove,
- one-symbol-per-Cell,
- placement preset,
- X/Y offset,
- scale,
- rotation,
- tint,
- backing type/size/offset/opacity,
- Backing Outline and width,
- hide below zoom,
- quick Fill/material dots,
- Material Browser handoff,
- Boundary controls,
- Core controls,
- Copy Style,
- Paste Style,
- Reset Style,
- Save as Preset,
- dotted selection orbit,
- reduced-motion behaviour,
- permanent left rail framing,
- contextual bottom rail structure,
- compact panel density,
- 1440 and 1280 geometry.

For each row record exactly:

- prototype evidence path/component/interaction,
- current status: `IMPLEMENTED`, `PARTIAL`, `PLANNED`, `REJECTED`, or `MISSING`,
- current production evidence if implemented/partial,
- canonical production owner,
- target milestone (`M1`, `M2`, `M3A`, `M3B`, `M4`, `M5`, `M6`, `M7`, `M8`, or rejected),
- required Codex acceptance test,
- notes explaining any intentional redesign.

Important architecture corrections:

- There is exactly one Inspector.
- The final tabs are `Content | Appearance | Symbol`.
- Appearance has three user-facing families:
  - Cell → Surface, Boundary, Core,
  - Membrane → Field, Edge,
  - Void → Fill, Edge.
- Do not revive six competing top-level inspectors.
- The prototype mock store, fixture Cells, fake export and prototype shell are evidence only and must remain rejected.

## 5. Workstream B — drawable symbol gap pass 2

Audit the prior 164 searchable IDs / 144 planned geometries before proposing anything new.

### Required gap families

Evaluate at least:

1. Structural
   - wall,
   - column,
   - beam,
   - slab,
   - structural core,
   - expansion joint where useful.
2. Sanitary and plumbing
   - basin/washbasin,
   - urinal,
   - bathtub,
   - floor drain,
   - water tank/pump where useful.
3. MEP and life safety
   - electrical panel,
   - outlet/socket,
   - HVAC supply,
   - HVAC return,
   - sprinkler,
   - hydrant/hose reel,
   - emergency light,
   - detector variants only when visually distinct.
4. Furniture and plan fixtures
   - chair,
   - sofa,
   - desk,
   - dining table,
   - bed variants,
   - wardrobe,
   - kitchen counter/sink only when truthful at Cell-symbol scale.
5. Circulation
   - stair plan,
   - lift/elevator cab,
   - escalator,
   - ramp,
   - revolving door or turnstile only when useful.
6. Site and mobility
   - bench,
   - bollard,
   - fence,
   - gate,
   - EV charging,
   - accessible parking,
   - drop-off/loading,
   - pedestrian crossing.
7. Program types
   - healthcare,
   - hospitality,
   - education,
   - industrial,
   - civic,
   - sports/recreation,
   - prayer/worship only if represented neutrally and usefully.
8. Annotation/presentation
   - level marker,
   - section marker,
   - elevation marker,
   - revision marker,
   - detail/reference marker,
   - north/orientation variants only when distinct.

### Candidate decision fields

Every candidate must record:

- canonical ID,
- display name,
- proposed category,
- source type: `LUCIDE`, `ALIAS`, `CUSTOM`, or `REJECT`,
- exact Lucide source key when applicable,
- verified availability,
- licence/provenance,
- search tags and aliases,
- accessible label,
- architectural use,
- placeable target,
- visual similarity warning,
- existing-ID collision check,
- priority: `ESSENTIAL`, `USEFUL`, or `LATER`,
- recommendation with reasoning.

Do not turn technical plan components into misleading pictograms. When a generic Lucide metaphor is not sufficiently architectural, prefer a custom brief or reject it.

## 6. Workstream C — UI command icon map

Create a separate command-icon system. These are application controls and must never appear in the drawable Symbol library.

Map at least:

### Quick Bar

- Membrane,
- Shadow,
- Motion,
- Labels,
- Grid,
- Snapping/Magnet,
- collapse/expand.

### Snapping menu

Initial M3B:

- Center,
- Nearest,
- Quadrant,
- Direction,
- Bounding Box,
- Grid,
- Axis,
- Cursor Magnet Effect,
- master Snapping.

After M5 Connections:

- Endpoint,
- Midpoint,
- Perpendicular,
- Intersection,
- connection direction/anchor.

After M6 Annotation:

- Auto-link Annotations,
- annotation anchor,
- leader attachment.

### Canvas editing launchers

- Select,
- Target,
- Arrange,
- Connect,
- Material,
- Preset,
- Markup,
- Detail,
- Inspector/info,
- Add Cell,
- Add Cluster,
- Add Void,
- Import,
- Export,
- Saved Views,
- Random Arrangement.

For every command provide:

- primary Lucide key,
- alternate key,
- recommendation and reason,
- active-state treatment,
- off/disabled-state treatment,
- tooltip label,
- keyboard/accessibility label,
- visual collision check,
- whether a custom MOOORF command glyph is required.

Avoid using the same glyph for unrelated commands. Specifically distinguish:

- Inspector/info from annotations/info symbols,
- Target from Select,
- Material from colour picker,
- Membrane from Motion,
- Grid visibility from snapping-to-grid,
- drawable architectural symbols from UI commands.

## 7. Workstream D — original custom architectural symbol briefs

Produce implementation-ready briefs for the eight already approved custom candidates:

1. Elevator Lift Cab
2. Stairs Plan View
3. Escalator Section
4. Wardrobe Plan Outline
5. Sink Plan
6. Fence Gate Swing
7. Floor Drain
8. Architectural Section Cut

Also identify any new gap-pass candidate that truly requires custom geometry, but do not exceed a carefully justified shortlist.

Each brief must specify:

- user meaning,
- plan/section/elevation orientation,
- geometry construction rules,
- optical grid and safe zone,
- stroke/fill behaviour,
- open/closed path rules,
- minimum readable size,
- 16/20/24/32 px behaviour,
- rotation behaviour,
- tint/backing compatibility,
- search tags,
- accessible label,
- category,
- likely confusion risks,
- export requirements,
- exact rejection criteria for misleading substitutes.

Do not create final production SVG code in this research task. The output is a design specification for later Owner-reviewed implementation.

## 8. Required deliverables

Create exactly these primary outputs on the research branch:

1. `docs/research/M2_CLAUDE_PROTOTYPE_COVERAGE_LEDGER.md`
2. `docs/research/M2_DRAWABLE_SYMBOL_GAP_PASS_2.md`
3. `docs/research/MOOORF_UI_COMMAND_ICON_MAP.md`
4. `docs/research/MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md`
5. `docs/research/M2_SYMBOL_PRIORITY_MANIFEST.json`
6. `docs/research/AG2_RESEARCH_HANDOFF.md`

The JSON manifest must be valid JSON and include:

- source refs,
- prior catalogue counts,
- proposed additions/aliases/custom/rejects,
- deduplicated final projected counts,
- per-candidate metadata,
- milestone assignment,
- provenance/licence fields,
- `ui_command_icons` in a separate top-level collection from `drawable_symbols`,
- unresolved Owner decisions.

## 9. Completion and quality gates

Before stopping:

1. Verify all exact source refs exist.
2. Reconcile all counts against the previous research rather than overwriting them.
3. Validate the JSON manifest parses successfully.
4. Confirm the research branch differs from its base only under `docs/research/`.
5. Run `git diff --check c4600472ea76f651800c19b91cf8f67954ca992e...HEAD`.
6. Confirm no `src/`, package, configuration, worker Codex status or production files changed.
7. Record every ambiguity as an Owner decision; never guess silently.
8. Push one fixed research head.
9. Update `worker-status/ANTIGRAVITY.json` on `status/antigravity` to `WAITING_REVIEW` with exact work SHA and deliverable list.
10. Stop. Do not merge and do not begin another task.

## 10. Final response format

Report:

- exact research branch and fixed SHA,
- exact status SHA,
- prior and projected drawable/searchable counts,
- number of prototype features classified by each status,
- number of new Lucide, alias, custom and rejected recommendations,
- unresolved Owner decisions,
- confirmation that production code and `main` were untouched.
