# Codex Correction Contract — C0 M1 Functional Recovery and Owner-Observed Regressions

**TASK:** `C0-M1-CORRECTION-1`
**STATUS:** Required correction under the already-authorized M1 contract
**WORKER:** Same Codex M1 implementation session
**WORK BRANCH:** `feature/c0-m1-inspector-layer-editing-recovery`
**CURRENT REVIEWED HEAD:** `e9bd67e8c7778dccdd4afb4c1508db0792e70b21`
**PRODUCTION MAIN:** must remain `c4600472ea76f651800c19b91cf8f67954ca992e`

## 1. Why correction is required

Fixed-head review plus Owner browser use found real functional and discoverability regressions. M1 is not merge-ready.

### A. Escape commits instead of cancelling

Table and Inspector Name/Area/Body fields clear local draft and blur on Escape while their blur handlers still commit. Escape must restore the exact canonical value and create zero history entries.

### B. Inspector status is semantically false

The Inspector header labels every single selection `Local` and every multi-selection `Mixed` using selection count rather than actual scope/inheritance.

### C. Bottom-bar access regressed

M1 removed the complete left quick-control group and reduced the dock from the audited base. The Owner reports missing buttons. The correction must restore a coherent functional baseline without implementing the final M3 dock redesign.

Required baseline:

- keep Add Cell, Add Cluster and Add Void,
- keep Saved Views, Random Arrangement, Import and Export,
- provide one visible one-click Inspector launcher,
- provide one visible one-click `Detail` launcher that opens the dedicated widget for the active target,
- do not reintroduce duplicate Morph/Palette state owners,
- do not expose false Connect/Material/Preset/Markup functionality before their milestones,
- no launcher may disappear unless its replacement is directly reachable.

### D. Inspector / “i” access is not direct enough

The Owner must not need to navigate left rail → Inspector → Appearance → Open Detailed Settings for every edit.

Required behaviour:

- one visible Inspector/info launcher opens the Inspector immediately,
- with a selected Cell it opens in that Cell context,
- with no selection it opens Project Defaults,
- a direct Detail launcher opens the active target widget,
- selecting a target in Inspector and pressing Detail opens the corresponding widget,
- the launcher must have a truthful icon, tooltip, aria-label and active/open state,
- no dead `i`/info button remains anywhere.

### E. Cell and Boundary settings are reported non-working

Every exposed control must create a visible canonical result in both live renderer paths where technically supported.

Required proof matrix:

**Cell**

- visible,
- fill colour,
- opacity,
- Project Default,
- Local Override,
- Mixed multi-selection,
- reset,
- undo/redo,
- persistence and export.

**Boundary**

- visible,
- solid,
- dashed,
- dotted,
- dash-dot,
- double,
- segmented bars,
- width,
- inner/centre/outer alignment,
- offset,
- dash/bar length,
- gap,
- double spacing,
- colour,
- opacity,
- reset,
- undo/redo,
- persistence and export.

A control that updates state but produces no visible renderer change is a failure.

### F. Organism dash-dot and other technical strokes must work

The previous audited solid fallback was accepted only as a temporary limitation. The Owner now requires technical strokes to render in Organism.

Use the existing pointer-transparent Canvas2D Organism overlay to render all six Boundary styles truthfully around Cells. Do not redesign the WebGL field shader and do not fake dash-dot metadata while drawing solid.

Required:

- Classic and Organism both visibly distinguish all six styles,
- dash-dot must contain a dash and a rounded dot separated by deterministic gaps,
- zoom scaling remains deterministic,
- selection, hit testing, area and Cell geometry remain unchanged,
- SVG/PDF/PNG must remain truthful for exposed styles,
- remove/update the old fallback warning and tests only after parity is real.

### G. Void is reported non-working

Prove and repair the complete Void workflow:

1. Add Void from the bottom dock.
2. The new Void appears at the intended Canvas location and becomes selected.
3. It remains a canonical `kind: "void"` object.
4. It subtracts from the Organism field.
5. It remains selectable, draggable and editable.
6. Void Settings visibly control fill, fill opacity, edge, edge width, edge colour and edge opacity.
7. Cell, Boundary and Core presentation never render on a Void.
8. Save/load, project export/import, PNG, SVG where supported, and PDF preserve it.
9. Undo/redo remains deterministic.

Do not alter architectural area/clearance/subtraction semantics through appearance controls.

### H. Unexplained white dots

The likely owner is the Core/nucleus presentation layer. The correction must identify the exact renderer owner in QA and make it understandable:

- use the canonical term `Core` with optional supporting text `nucleus`,
- add a clear tooltip/help sentence where the Core control appears,
- prove Core visible/size/colour/opacity/Auto Contrast controls work,
- prove Core can be turned off,
- never confuse Core with Selection or Boundary,
- do not remove or change the default merely by assumption; document the exact source of the white dots.

### I. Earlier approved Inspector features must remain durably mapped

M1 must fully deliver its promised Content/Appearance features. It must not falsely claim the complete prior Inspector prototype is already implemented.

Before handoff, the report must explicitly list:

- implemented now: Content, Name/Area/Body, text presets, target selection, six dedicated widgets, Copy/Paste/Reset, defaults/overrides/mixed;
- deferred to M2: advanced per-target instruments, approved selection orbit, production Symbol tab and Antigravity symbol catalogue;
- deferred to M4: full Material Browser, recents/favourites and hover material preview.

No approved prototype feature may become unassigned.

## 2. Required correction

1. Add explicit cancel/commit state machines for Table and Inspector Name/Area/Body.
2. Correct Inspector status language.
3. Restore the bounded bottom-bar access baseline.
4. Repair the Inspector/info and Detail launch paths.
5. Repair and prove every Cell and Boundary control.
6. Render all six Boundary styles truthfully in Organism using the existing overlay.
7. Repair and prove Void end-to-end.
8. Identify and explain the white Core/nucleus dots; prove Core controls.
9. Update the implementation report and ownership map with exact final owners and deferred destinations.

## 3. Behavioral tests

Add executable tests for:

- Table Name/Area/Body Escape,
- Inspector Name/Area/Body Escape,
- normal blur commit,
- Enter exactly one transaction,
- Shift+Enter Body no commit,
- truthful Inspector header status,
- Inspector launcher and direct Detail launcher,
- Cell control renderer effect in Classic and Organism,
- all six Boundary styles in Classic and Organism,
- dash-dot pattern sequence,
- Add Void → selected canonical Void,
- Void subtraction invariant,
- Void appearance controls,
- Core visibility and white-dot ownership,
- persistence/export/undo round-trip for affected targets.

Regex/source-presence checks alone are insufficient for interaction and renderer behaviour.

## 4. Browser QA

At both `1440×900` and `1280×800`, record deterministic evidence for:

- all missing/restored bottom actions,
- one-click Inspector/info access,
- one-click active Detail access,
- Cell settings visibly changing the selected Cell,
- Boundary all-six-style matrix in Classic and Organism,
- dash-dot clearly distinct,
- Add Void, drag Void, edit Void, confirm subtraction,
- Core toggle explaining/removing the white dot,
- Table and Inspector Escape cancellation,
- no console errors,
- no dock/rail/widget collision.

## 5. Verification

Run:

- new focused behavioural/renderer tests,
- all affected M1 and C0.4F-A contracts,
- application typecheck,
- `git diff --check e9bd67e8c7778dccdd4afb4c1508db0792e70b21...HEAD`,
- exactly one final production build after all corrections,
- the deterministic browser QA matrix above.

## 6. Completion

Push one corrected fixed head to the same branch. Update `worker-status/CODEX.json` on `status/codex` with:

- status `WAITING_REVIEW`,
- previous reviewed head `e9bd67e8c7778dccdd4afb4c1508db0792e70b21`,
- corrected feature SHA,
- exact test/build/QA evidence,
- owner-observed issue disposition table.

Stop. Do not merge. Do not start M2.