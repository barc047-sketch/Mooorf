# C0 M2 — Advanced Appearance, Production Symbol Tab and Runtime Power Gates

**Worker:** Codex  
**Authorization:** Owner command `GO CODEX M2`  
**Repository:** `barc047-sketch/Mooorf`  
**Exact production base:** `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`  
**Work branch:** `feature/c0-m2-advanced-inspector-symbols-runtime-gates`  
**Merge authority:** none; stop at `WAITING_REVIEW`

## 1. Purpose

Complete the approved one-Inspector architecture with:

1. truthful advanced Appearance controls;
2. a production Symbol tab inside the same Inspector;
3. canonical runtime power gates so Off means hidden **and** not needlessly computing;
4. persistence, history and export parity for the new canonical state.

This milestone must preserve M1 and C0.4F-A. Do not redesign the product shell, Table, Master Graph, canvas geometry or current interaction model.

## 2. Mandatory inputs

Read before editing:

- `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`
- `docs/plans/C0_M2_OWNER_PREVIEW_INSPECTOR_ADVANCED_SYMBOLS.md`
- `docs/plans/C0_CANVAS_QUICK_CONTROLS_RUNTIME_GATES_AND_SNAPPING_STAGE_PLAN.md`
- `docs/governance/FAST_OWNER_QA_MODE.md`
- `docs/C0_M1_INSPECTOR_LAYER_EDITING_REPORT.md`
- `docs/C0_M1_CONTROL_OWNERSHIP_MAP.md`
- Claude evidence: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`
- symbol baseline: `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`
- prior symbol research: `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`
- accepted AG2 research: `research/m2-prototype-and-icon-gap-audit@55bbda488ae223a6ad53de8cc2a5ea5de0cdcf51`

Prototype and research branches are evidence only. Selectively forward-port approved ideas and registry data; never merge those branches wholesale.

## 3. Protected architecture

These are immutable constraints:

- exactly one Inspector;
- tabs: `Content | Appearance | Symbol`;
- global `I/i` remains owned by the one Inspector;
- Appearance has exactly three primary families:
  - Cell → Surface, Boundary, Core / nucleus;
  - Membrane → Field, Edge;
  - Void → Fill, Edge;
- six canonical internal targets remain separate:
  `cell`, `boundary`, `core`, `membrane`, `membrane-edge`, `void`;
- Master Graph/store remains the sole product data owner;
- no duplicate UI-only appearance, material, symbol, history or persistence state;
- current `Cell Gradient` and `Solid` Membrane modes remain canonical and available;
- standard Void has no unconditional inner echo;
- visual controls never alter Area, Cell centres, hit testing, drag geometry or Void subtraction.

## 4. Workstream A — Advanced Appearance

### 4.1 Cell Surface and Shadow

Reuse the existing canonical `CellShadowSettings`; do not create another shadow model.

Expose compact fast controls:

- Off;
- Soft;
- Defined;
- **Shadow Strength** slider.

Advanced disclosure:

- opacity;
- softness;
- X offset;
- Y offset;
- spread;
- Auto/custom colour;
- include in export;
- reset.

Requirements:

- one canonical owner across Inspector, future Quick Bar, renderer, persistence and export;
- shadow Off skips shadow resolution, mask and uniform work;
- shadow never affects geometry, selection or hit testing;
- preview changes remain ephemeral; final release is one history transaction.

### 4.2 Boundary and Core

Preserve all working M1 controls and add only truthful advanced instruments with live and export parity.

Boundary:

- all six existing styles;
- width, alignment, offset;
- dash/bar length and gap;
- rounded dot/dash-dot behaviour;
- double spacing;
- colour/material and opacity;
- deterministic zoom behaviour.

Core:

- visible;
- size;
- colour/material and opacity;
- Auto Contrast;
- bounded presentation offset X/Y;
- optional shape presets only where live/export parity exists.

Core remains the optional presentation marker, not the Organism field geometry nucleus.

### 4.3 Membrane Field

Preserve:

- `Cell Gradient` as default/current behaviour;
- `Solid` with Black, Ink, MOOORF Red, Charcoal and Custom;
- Field character / Morph;
- Fusion / attachment;
- Reach / merge distance;
- opacity.

Add truthful advanced controls only where the renderer has a real visible owner:

- **Field Edge Softness** — field/body boundary feather;
- surface tension;
- iso threshold/level;
- mass/influence;
- connection bias;
- distribution strength;
- radius minimum/maximum;
- size variation;
- safe presentation offsets where geometry ownership remains unchanged.

Do not expose fake sliders. Unsupported controls stay absent and are documented.

### 4.4 Motion

Add a canonical Motion master and only supported parameters:

- On/Off;
- idle motion;
- speed/time scale;
- response;
- drift;
- breathing;
- wobble;
- phase variation.

Motion Off must stop motion advancement and continuous animation frames when no other consumer needs them.

### 4.5 Membrane Edge

Inside Membrane Detail only:

- visible;
- width;
- **Edge Softness** with a separate canonical owner and visibly independent effect from Field Edge Softness;
- colour/material;
- opacity;
- reset/history/export.

Do not alias two labels to one field or uniform. If a truthful independent edge-softness renderer and export fallback cannot be completed, do not expose the control; document the exact technical blocker instead.

### 4.6 Void

Preserve working creation, selection, drag, subtraction, hit testing, persistence and exports.

Expose:

- fill visible/colour/material/opacity;
- edge visible/colour/material/opacity/width.

Do not restore the removed hard-coded inner circle. Optional Inner Echo may remain deferred; if implemented, it must be explicit, default Off, presentation-only and live/export equivalent.

## 5. Workstream B — Runtime power gates

Off must preserve authored settings while skipping feature-owned work.

Required gates:

- Membrane family Off → skip field, palette and spatial-colour work owned only by Membrane;
- Membrane Edge Off → skip edge-band projection/uniform work;
- Shadow Off → skip shadow resolution/mask/uniform work;
- Motion Off → stop continuous rAF and motion advancement when no other consumer needs them;
- Labels Off → do not build or synchronize hidden label DOM every frame;
- Grid Off → no hidden grid DOM/synchronization work;
- Snapping Off/future inactive → no candidate generation outside active drag/creation.

Requirements:

- Membrane Off + Motion Off leaves canvas idle with no owned continuous loop;
- camera movement, explicit edits, resize and export may wake one bounded render then return to idle;
- use executable counters/injected scheduler tests where practical;
- gates must not alter saved geometry, Area, centres, hit testing or Void subtraction;
- future M3 Quick Bar must call these exact canonical gates.

Do not implement the M3 Quick Bar or snapping UI/engine in M2.

## 6. Workstream C — Production Symbol tab

### 6.1 Registry scope

Build from the existing audited registry and accepted research:

- forward-port the 77-symbol canonical baseline;
- validate and ingest the 59 verified Lucide additions;
- ingest 14 aliases with deterministic normalization;
- exclude all 5 rejected candidates;
- keep UI command icons separate from user-placeable drawable symbols;
- no unknown-license, raw downloaded or base64 assets.

The AG2 `156 geometries / 176 searchable IDs` figure is a projected research ceiling, not automatic implementation scope. Do not implement the 8 original custom vectors or 12 pending custom-gap candidates in this milestone without a later explicit Owner approval.

### 6.2 Library UX

Inside the one Inspector Symbol tab:

- real clickable Symbol tab;
- search;
- categories;
- recents;
- favourites;
- keyboard navigation and accessible labels;
- hover preview and revert;
- one primary symbol per Cell;
- apply, replace and remove.

Hover preview must remain ephemeral and create no history entry. Apply/replace/remove must create one bounded history transaction.

### 6.3 Placement and backing

Implement canonical persisted controls:

- placement presets;
- offset X/Y;
- scale;
- rotation;
- tint;
- backing type;
- backing size;
- backing offset;
- backing opacity;
- backing outline On/Off;
- backing outline width;
- automatic hide below a safe far-out zoom threshold, with any threshold control placed under Advanced rather than permanent basic UI.

Requirements:

- live Canvas parity;
- clean PNG/SVG/PDF export parity;
- project persistence/import and saved-view compatibility where applicable;
- Copy/Paste Style includes symbol placement/backing after M2;
- symbols do not alter Cell geometry, Area, hit testing or Master Graph relationships.

## 7. Explicit exclusions

Do not implement:

- separate Symbol Inspector;
- final bottom Dock redesign;
- bottom-left Quick Bar;
- snapping menu or snapping engine;
- full Material Browser/Studio;
- material favourites/recents/hover studio;
- custom MOOORF architectural vectors;
- selection orbit unless it is trivial, temporary, non-exported and reduced-motion safe; it is not required for acceptance;
- Connections;
- Annotation/Markup;
- broad Table/import redesign;
- 100+ row Table optimization;
- Floors, Stats or Dashboard;
- unrelated refactors.

Editable Body/subtext in Table remains as accepted. Dense Table hardening belongs to M8.

## 8. Implementation sequence

Use one branch and bounded internal batches:

1. canonical schema/migration/history/persistence seams;
2. Advanced Appearance and runtime gates;
3. Symbol registry and library UX;
4. placement/backing/live/export parity;
5. focused verification, one build, report and stop.

Do not stop for a broad audit between batches. Keep commits bounded and reversible. Never merge to `main`.

## 9. Fast Owner-QA and credit protection

Obey `docs/governance/FAST_OWNER_QA_MODE.md`.

Required automation:

- focused executable tests for changed owners;
- affected history/persistence/migration/renderer/export contracts;
- TypeScript check;
- `git diff --check bd160b8c615cdafbbdd8a76332be46b69a6e765e...HEAD`;
- exactly one final production build.

Browser rules:

- no exhaustive CDP/E2E matrix by default;
- do not spend more than 10 minutes tuning a browser harness;
- do not rerun a production build;
- visible behavior is accepted through a short Owner yes/no checklist after `WAITING_REVIEW`;
- record incomplete browser automation truthfully without blocking a working product unless a real product failure is reproduced.

## 10. Required executable coverage

At minimum prove:

- one Inspector and one `I/i` owner remain;
- Symbol is a tab inside it;
- appearance primary families remain Cell/Membrane/Void;
- Field Edge Softness and Edge Softness have separate state and renderer projections if both exposed;
- Shadow Off, Membrane Off and Motion Off skip their owned work;
- disabled Membrane + Motion has no continuous owned loop;
- Cell Gradient and Solid remain compatible and persistent;
- standard Void has no inner echo;
- Symbol search/filter/recents/favourites/hover/apply/remove;
- symbol placement/backing history, persistence, migration and export;
- aliases normalize deterministically and rejected IDs remain unavailable;
- no new control changes architectural geometry or Void subtraction.

## 11. Reports and handoff

Create/update:

- `docs/C0_M2_ADVANCED_INSPECTOR_SYMBOLS_RUNTIME_GATES_REPORT.md`
- `docs/C0_M2_CONTROL_OWNERSHIP_MAP.md`
- relevant task/handoff/decision records
- `worker-status/CODEX.json` on `status/codex`

The report must include:

- fixed-head identity;
- exact implemented vs deferred advanced controls;
- runtime-gate evidence;
- exact symbol counts and exclusions;
- persistence/export/history evidence;
- known limitations;
- a 3–7 item Owner manual QA checklist.

## 12. Worker lifecycle

1. Verify branch/base exactly.
2. Set `status/codex` to `RUNNING` before production edits.
3. Implement only this contract.
4. Push one final fixed feature head.
5. Set `status/codex` to `WAITING_REVIEW` with exact feature SHA and truthful checks.
6. Stop.

Do not merge. Do not begin M3, M4 or another task.