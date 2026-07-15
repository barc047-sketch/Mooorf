# AG2 Research Handoff

## Overview

This research handoff completes the **AG2 - Prototype Coverage and Icon Gap Audit** research task for the `barc047-sketch/Mooorf` repository. This is a research, inventory, and specification study. It does not introduce any changes to the production source code under `src/`, package configurations, or runtime assets.

---

## 1. Branch and Base Verification

- **Work Branch**: `research/m2-prototype-and-icon-gap-audit`
- **Work Branch Base**: `main@c4600472ea76f651800c19b91cf8f67954ca992e`
- **Reviewed Feature Snapshot**: `feature/c0-m1-inspector-layer-editing-recovery@c4f05a1b32029c6cb29f4cfaa41983ba7f77c8f9`
- **Design Prototype Reference**: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`

---

## 2. Deliverables List

Six files have been created under `docs/research/` on this branch:

1. [M2_CLAUDE_PROTOTYPE_COVERAGE_LEDGER.md](file:///Users/tanisxq/Documents/ZONU0/docs/research/M2_CLAUDE_PROTOTYPE_COVERAGE_LEDGER.md): Maps forty-nine approved features to their implementation status, milestones, owners, evidence, and acceptance tests.
2. [M2_DRAWABLE_SYMBOL_GAP_PASS_2.md](file:///Users/tanisxq/Documents/ZONU0/docs/research/M2_DRAWABLE_SYMBOL_GAP_PASS_2.md): Audits missing architectural families (structural, sanitary, MEP, circulation, site, program, and annotation) and suggests new verified symbols.
3. [MOOORF_UI_COMMAND_ICON_MAP.md](file:///Users/tanisxq/Documents/ZONU0/docs/research/MOOORF_UI_COMMAND_ICON_MAP.md): Defines the complete visual mapping for canvas controls, snapping options, and launchers.
4. [MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md](file:///Users/tanisxq/Documents/ZONU0/docs/research/MOOORF_CUSTOM_ARCHITECTURAL_SYMBOL_BRIEFS.md): Detailed vector/geometric construction briefs for the eight custom MOOORF architectural symbols.
5. [M2_SYMBOL_PRIORITY_MANIFEST.json](file:///Users/tanisxq/Documents/ZONU0/docs/research/M2_SYMBOL_PRIORITY_MANIFEST.json): A structured, valid JSON manifest aggregating base and proposed symbols/commands with their metadata, licensing, and milestone mappings.
6. [AG2_RESEARCH_HANDOFF.md](file:///Users/tanisxq/Documents/ZONU0/docs/research/AG2_RESEARCH_HANDOFF.md): This file, serving as the coordinator handoff guide.

---

## 3. Prototype Feature Summary (49 Features)

All forty-nine features from the Claude V2 visual prototype have been mapped:
- **IMPLEMENTED**: 25 (e.g. inline Name/Area/Body editing, preset styles, family groupings, copy/paste style, and viewport framing)
- **PARTIAL**: 3 (Symbol tab seam, quick Fill/material swatches, and Material Browser handoff button)
- **PLANNED**: 21 (all Symbol-tab detailed controls, search, favourites, recents, keyboard focus, hover preview/revert, custom offsets, backing lines, dotted selection orbit, and reduced-motion safe behavior)
- **REJECTED**: 0
- **MISSING**: 0

---

## 4. Symbol Count Reconciliations

The gap-pass audit preserves perfect counts and deduplication:
- **Baseline Symbols**: 77
- **Proposed Lucide Candidates to ADD**: 59
- **Proposed Lucide Candidates to ALIAS**: 14
- **Proposed Custom Design Symbols to ADD (Workstream D)**: 8
- **Proposed Custom Gap Geometries to ADD**: 12
- **Candidates to REJECT**: 5
- **Final Active Geometries**: 156 (77 baseline + 59 new Lucide + 8 custom briefs + 12 custom gaps)
- **Final Searchable IDs**: 176 (including aliases)

---

## 5. UI Commands Separation

All UI command icons (Quick Bar, Snapping menu, Canvas editing launchers) are mapped in a dedicated collection in the manifest. These controls must never appear in the user-placeable drawable Symbol library. This protects interfaces from icon classification collision (e.g. distinguishing the Canvas targeting `Crosshair` tool from the Center snapping dot or target-aiming drawable markers).

---

## 6. Unresolved Owner Decisions

The following architectural and design questions remain open for Owner review:
1. **Prayer/Worship Symbol Representation**: Confirm whether the proposed neutral `custom:worship-neutral` (circle enclosing stylized light/waves) is approved, or if Lucide `Sunrise` or similar is preferred.
2. **Expansion Joint Line Markings**: Confirm if expansion joints should be handled as custom stencil stamps or simply represented as standard dashed double-lines.
3. **Level of Detail (LoD) Threshold sliders**: Determine if zoom visibility thresholds are standard settings or advanced controls hidden inside disclosures in the Symbol tab.
