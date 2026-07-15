# AG2 Research Handoff

## Overview

This research handoff completes the **AG2 - Prototype Coverage and Icon Gap Audit** research task for the `barc047-sketch/Mooorf` repository. This is a research, inventory, and specification study. It does not introduce any changes to the production source code under `src/`, package configurations, or runtime assets.

---

## 1. Branch and Base Verification

- **Work Branch**: `research/m2-prototype-and-icon-gap-audit`
- **Work Branch Base**: `main@c4600472ea76f651800c19b91cf8f67954ca992e`
- **Reviewed Feature Snapshot**: `feature/c0-m1-inspector-layer-editing-recovery@f2d6f99c34257a04e42d4dd6aae2f9b59898d8f6`
- **Design Prototype Reference**: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`

---

## 2. Deliverables List

Six files have been created under `docs/research/` on this branch:

1. [M2_CLAUDE_PROTOTYPE_COVERAGE_LEDGER.md](M2_CLAUDE_PROTOTYPE_COVERAGE_LEDGER.md): Maps fifty approved features to their implementation status, milestones, owners, evidence, and acceptance tests.
2. [M2_DRAWABLE_SYMBOL_GAP_PASS_2.md](M2_DRAWABLE_SYMBOL_GAP_PASS_2.md): Audits missing architectural families (structural, sanitary, MEP, circulation, site, program, and annotation) and suggests new verified symbols.
3. [MOOORF_UI_COMMAND_ICON_MAP.md](MOOORF_UI_COMMAND_ICON_MAP.md): Defines the complete visual mapping for canvas controls, snapping options, and launchers.
4. [MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md](MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md): Detailed vector/geometric construction briefs for the eight custom MOOORF architectural symbols.
5. [M2_SYMBOL_PRIORITY_MANIFEST.json](M2_SYMBOL_PRIORITY_MANIFEST.json): A structured, valid JSON manifest aggregating base and proposed symbols/commands with their metadata, licensing, and milestone mappings.
6. [AG2_RESEARCH_HANDOFF.md](AG2_RESEARCH_HANDOFF.md): This file, serving as the coordinator handoff guide.

---

## 3. Prototype Feature Summary (50 Features)

All fifty features from the Claude V2 visual prototype and global shortcuts have been mapped:
- **IMPLEMENTED**: 24 (e.g. inline Name/Area/Body editing, preset styles, family groupings, reset style, and viewport framing)
- **PARTIAL**: 5 (Symbol tab seam, quick color swatches/Fill, Copy Style, Paste Style, and the Dock baseline)
- **PLANNED**: 20 (all Symbol-tab detailed controls, search, favourites, recents, keyboard focus, hover preview/revert, custom offsets, backing lines, dotted selection orbit, and reduced-motion safe behavior)
- **MISSING**: 1 (global keyboard `I` Inspector toggle shortcut)
- **REJECTED**: 0

---

## 4. Symbol Count Reconciliations and Scope

The gap-pass audit identifies the catalog ceiling and staging scope:
- **Baseline/Current Symbols**: 77
- **Proposed Lucide Candidates to ADD**: 59
- **Proposed Lucide Candidates to ALIAS**: 14
- **Proposed Custom Design Symbols (Workstream D)**: 8 (full implementation briefs in `MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md`)
- **Proposed Custom Gap Geometries**: 12 (research candidates in `M2_DRAWABLE_SYMBOL_GAP_PASS_2.md`)
- **Candidates to REJECT**: 5
- **Projected Research Ceiling**: **156 active geometries** / **176 searchable IDs** (including aliases)

> [!IMPORTANT]
> The final count of 156 active geometries and 176 searchable IDs is a projected research ceiling. It is **not** automatically approved M2 scope. Staging rules:
> 1. Stage verified baseline + approved Lucide/aliases first.
> 2. Propose Owner-approved essential custom symbols.
> 3. Defer structural/MEP/program symbols to later domain packs.

---

## 5. UI Commands Separation

All UI command icons (Quick Bar, Snapping menu, Canvas editing launchers) are mapped in a dedicated collection in the manifest. These controls must never appear in the user-placeable drawable Symbol library. This protects interfaces from icon classification collision (e.g. distinguishing the Canvas targeting `Crosshair` tool from the Center snapping dot or target-aiming drawable markers).

---

## 6. Unresolved Owner Decisions

The following architectural and design questions remain open for Owner review:
1. **Prayer/Worship Symbol Representation**: Confirm whether the proposed neutral `custom:worship-neutral` (circle enclosing stylized light/waves) is approved, or if Lucide `Sunrise` or similar is preferred.
2. **Expansion Joint Line Markings**: Confirm if expansion joints should be handled as custom stencil stamps or simply represented as standard dashed double-lines.
3. **Level of Detail (LoD) Threshold sliders**: Determine if zoom visibility thresholds are standard settings or advanced controls hidden inside disclosures in the Symbol tab.
