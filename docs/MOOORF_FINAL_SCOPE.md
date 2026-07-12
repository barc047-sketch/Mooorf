# MOOORF Final Scope

**Status:** Canonical scope entry point  
**Authority:** Required before every new implementation prompt, audit, milestone, shell change, terminology change, or commercial phase  
**Current device target:** 1440 desktop and 1280 laptop only

## Required read order

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
4. `docs/PROJECT_MEMORY_INDEX.md`
5. `docs/FEATURE_MAP.md`
6. `docs/COMPONENT_INVENTORY.md`
7. `docs/CODEX_PHASE_PROTOCOL.md`
8. current `HANDOFF.md` and `TASK_QUEUE.md`

No future agent may begin implementation after reading only a chat summary. The repository scope is the source of truth.

## Authority model

- `MOOORF_MASTER_PRODUCT_SCOPE.md` owns the complete product, feature tree, terminology, user flows, workspaces, data model direction, exports, accounts, plans, billing, admin, roadmap, and no-go rules.
- `MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` owns current desktop composition, reference interpretation, contrast, performance, export queue, Download Center, global Project Drawer, shortcut hints, and 1440/1280 acceptance criteria.
- When the two documents overlap, the newer and more specific desktop addendum governs current desktop implementation without deleting the broader long-term product scope.
- A new decision must update the relevant canonical document and be recorded in `docs/DECISIONS.md`. Do not silently diverge.

## Current implementation priority

```text
Desktop scope merge
→ audited group drag merge
→ Canvas performance + contrast reset
→ desktop floating shell
→ global Project Drawer
→ beginner Add Space workflow
→ Data workspace + compact Canvas table
→ Dashboard
→ Materials
→ Arrange
→ Connections + Cell Behaviour
→ Markup + typography + A2 composition
→ references/uploads
→ templates
→ queued ZIP/GIF export platform
→ desktop hardening
→ accounts, plans, billing, launch
→ tablet/iPad last
→ phone decision last
```

## Current visual rules

```text
Blur: yes
UI shadow: no
Cell shadow: optional, default off
Animated blur: no
Delayed glass: no
Solid-black active buttons: no
Active state: signal dot + inner keyline + light tonal tint
Canvas label colour: Auto Contrast by default
Quick View: icon-only
Material Browser: maximum half screen
Canvas: dominant
Repeated actions: nearly instant
Heavy exports: queued, non-blocking
```

## Current reference hierarchy

- Primary shell composition: light golf-tracking reference.
- Expanded bottom dock/common rail: lemon cardiology reference.
- Global top slide-down drawer: management interface reference.
- Dashboard/Analysis: dark environmental and floating-organism references.
- Sparse local Canvas controls: dark node-canvas reference.

Reference images are visual inputs only. Never copy proprietary branding, assets, text, exact layouts, or product-specific controls.

## Prompt-generation rule

Every future coding or audit prompt must include:

- exact current GitHub base SHA,
- branch name,
- required canonical read order,
- milestone scope,
- explicit deferred items,
- preservation rules,
- Ponytail reuse report,
- verification plan,
- one-build limit where applicable,
- required final report format.

No prompt may invent a conflicting feature name, second data store, duplicate uploader, duplicate export engine, duplicate material system, or duplicate history path.

## Reference-pack setup

Local reference pack target:

```text
/Users/tanisxq/Documents/ZONU0/.references/mooorf-desktop-v1/
```

`.references/` remains local-only and must not be committed.

## Completion rule

A milestone is complete only when:

- implementation matches the canonical scope,
- focused contracts pass,
- one production build passes,
- performance remains within the milestone budget,
- no Critical or Major audit issue remains,
- manual desktop QA passes at 1440 and 1280,
- docs and handoff are updated,
- the feature branch is pushed but not merged until approved.
