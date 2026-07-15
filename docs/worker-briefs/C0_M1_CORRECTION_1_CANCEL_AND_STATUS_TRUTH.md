# Codex Correction Contract — C0 M1 Functional Recovery and Owner-Observed Regressions

**TASK:** `C0-M1-CORRECTION-1`
**STATUS:** Required correction under the already-authorized M1 contract
**WORKER:** Same Codex M1 implementation session
**WORK BRANCH:** `feature/c0-m1-inspector-layer-editing-recovery`
**CURRENT REVIEWED HEAD:** `e9bd67e8c7778dccdd4afb4c1508db0792e70b21`
**PRODUCTION MAIN:** must remain `c4600472ea76f651800c19b91cf8f67954ca992e`

## 1. Locked user-facing architecture

There is exactly **one Inspector**.

Its durable tabs are:

- Content,
- Appearance,
- Symbol — becomes live in M2 inside this same Inspector.

Do not create a separate Symbol Inspector or separate inspectors for different appearance layers.

The six canonical renderer targets remain internally separate, but the user-facing Appearance hierarchy is simplified to three families:

```text
Cell
├── Surface
├── Boundary
└── Core / nucleus

Membrane
├── Field
└── Edge

Void
├── Fill
└── Edge
```

Required M1 user-facing structure:

- Inspector Appearance offers only `Cell`, `Membrane`, and `Void` as the primary families.
- Boundary controls live inside Cell detail/settings.
- Core controls live inside Cell detail/settings.
- Membrane Edge controls live inside Membrane detail/settings.
- Void remains its own appearance family.
- Internal canonical paths remain `cell`, `boundary`, `core`, `membrane`, `membrane-edge`, and `void`; do not merge their state or renderer owners.
- A direct Detail action opens the currently active family settings without forcing repeated navigation.

## 2. Why correction is required

Fixed-head review plus Owner browser use found real functional and discoverability regressions. M1 is not merge-ready.

### A. Escape commits instead of cancelling

Table and Inspector Name/Area/Body fields clear local draft and blur on Escape while their blur handlers still commit. Escape must restore the exact canonical value and create zero history entries.

### B. Inspector status is semantically false

The Inspector header labels every single selection `Local` and every multi-selection `Mixed` using selection count rather than actual scope/inheritance.

### C. Bottom-bar access regressed

M1 removed the complete left quick-control group and reduced the dock from the audited base. The Owner reports missing buttons. Restore a coherent functional baseline without implementing the final M3 dock redesign.

Required baseline:

- keep Add Cell, Add Cluster and Add Void,
- keep Saved Views, Random Arrangement, Import and Export,
- provide one visible one-click Inspector/info launcher,
- provide one visible one-click `Detail` launcher that opens Cell, Membrane or Void detail according to the active Appearance family,
- do not reintroduce duplicate Morph/Palette state owners,
- do not expose false Connect/Material/Preset/Markup functionality before their milestones,
- no launcher may disappear unless its replacement is directly reachable.

### D. Inspector / `i` access is not direct enough

The Owner must not need to navigate left rail → Inspector → Appearance → advanced settings for every edit.

Required behaviour:

- one visible Inspector/info launcher opens the Inspector immediately,
- selected Cell → selected context,
- no selection → Project Defaults,
- the `i`/Inspector button must work from its visible location,
- direct Detail opens the active family settings,
- a family change in Inspector updates what Detail opens,
- truthful icon, tooltip, aria-label and active/open state,
- no dead `i`/info path remains.

### E. Cell and Boundary controls are reported non-working

Every exposed control must create a visible canonical result in both live renderer paths where technically supported.

**Cell Surface**

- visible,
- fill colour,
- opacity,
- Project Default,
- Local Override,
- Mixed multi-selection,
- reset,
- undo/redo,
- persistence and export.

**Boundary inside Cell**

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

### F. Organism dash-dot and technical strokes must work

The prior solid fallback is no longer accepted as a user-facing result.

Use the existing pointer-transparent Canvas2D Organism overlay to render all six Boundary styles truthfully around Cells. Do not redesign the WebGL field shader.

Required:

- Classic and Organism visibly distinguish all six styles,
- dash-dot contains a visible dash and rounded dot sequence,
- deterministic zoom scaling,
- selection, hit testing, area and Cell geometry unchanged,
- PNG/SVG/PDF truthful for exposed styles,
- old fallback warning removed only after parity is real.

### G. Void clarification

The Owner confirms that Void creation currently works. Do not redesign or remove it.

Treat Void as a regression-protected workflow:

1. Add Void remains in the bottom dock.
2. New Void appears and becomes selected.
3. Canonical `kind: "void"` remains intact.
4. It subtracts from the Organism field.
5. It remains selectable, draggable and editable.
6. Void Appearance visibly controls fill and edge properties.
7. Cell Surface, Boundary and Core never render on Void.
8. Save/load, project import/export and visual export preserve it.

Only fix a Void defect if the deterministic QA reproduces one. Do not falsely report Void as broken when it passes.

### H. White centre dots remain while Core is off

The code already forces the legacy WebGL embedded nucleus-dot strength to zero. Therefore the screenshot’s white centre dots are expected to come from the Canvas2D presentation/Core path or a default/local resolution mismatch—not from the old shader dot toggle.

Required:

- reproduce the issue with Project Defaults Core off,
- reproduce with one selected Cell and any local Core override cleared,
- identify whether the remaining dots come from Core overlay, stale local override, preview state, debug state or another renderer path,
- when Core visible is false, no Core/nucleus centre dot may remain,
- Core visible/size/colour/opacity/Auto Contrast must work,
- add clear `Core / nucleus` explanation inside Cell settings,
- Core must never be confused with Selection, Boundary or the organism field nuclei used only for geometry.

### I. Earlier approved Inspector features

M1 must deliver its promised Content and Appearance foundation. It must not claim the full prototype is already complete.

The final report must state:

**Implemented in corrected M1**

- one Inspector,
- Content and Appearance tabs,
- Name/Area/Body direct editing,
- text presets/size/colour/Auto Contrast,
- Cell/Membrane/Void Appearance families,
- Boundary and Core nested in Cell,
- Edge nested in Membrane,
- Copy/Paste/Reset,
- defaults/local/mixed,
- direct Inspector and Detail access.

**Assigned to M2 in the same Inspector**

- Symbol tab,
- advanced Cell/Boundary/Core instruments,
- advanced Membrane/Edge instruments including softness and other proven field controls,
- approved selection orbit,
- Antigravity symbol catalogue.

**Assigned to M4**

- full Material Browser,
- recents/favourites,
- hover material preview/revert,
- Material Studio.

No approved prototype feature may become unassigned.

## 3. Required correction

1. Implement explicit cancel/commit state machines for Table and Inspector Name/Area/Body.
2. Correct Inspector status language.
3. Restructure Appearance UI into Cell, Membrane and Void families while preserving six canonical internal targets.
4. Restore bounded bottom-bar access.
5. Repair the Inspector/info and direct Detail paths.
6. Repair and prove Cell Surface and Boundary controls.
7. Render all six Boundary styles truthfully in Organism.
8. Regression-protect the working Void flow.
9. Diagnose and fix white centre dots remaining when Core is off.
10. Update report and ownership map with final owners and deferred destinations.

## 4. Executable tests

Add behavioural/renderer tests for:

- Table and Inspector Name/Area/Body Escape,
- normal blur commit,
- Enter exactly one transaction,
- Shift+Enter Body no commit,
- truthful Inspector header status,
- one Inspector with Content/Appearance and future Symbol seam,
- primary Appearance families exactly Cell/Membrane/Void,
- Boundary/Core nested under Cell ownership,
- Membrane Edge nested under Membrane ownership,
- Inspector launcher and direct Detail launcher,
- Cell renderer effects,
- all six Boundary styles in Classic and Organism,
- dash-dot sequence,
- working Add Void regression path,
- Core-off means no visible centre dot,
- persistence/export/undo round-trip.

Regex/source-presence checks alone are insufficient for interaction and renderer behaviour.

## 5. Browser QA

At `1440×900` and `1280×800` record:

- restored bottom actions,
- working one-click `i`/Inspector access,
- working one-click Detail access,
- single Inspector architecture,
- Cell → Surface/Boundary/Core grouping,
- Membrane → Field/Edge grouping,
- Void appearance grouping,
- Cell control effects,
- all-six Boundary matrix in Classic and Organism,
- dash-dot clearly distinct,
- working Void add/drag/subtract/edit path,
- Core off removes every white centre dot,
- Table and Inspector Escape cancellation,
- no console errors or layout collisions.

## 6. Verification and completion

Run:

- focused behavioural/renderer tests,
- affected M1 and C0.4F-A contracts,
- application typecheck,
- `git diff --check e9bd67e8c7778dccdd4afb4c1508db0792e70b21...HEAD`,
- exactly one final production build after corrections,
- complete browser QA matrix.

Push one corrected fixed head to the same branch. Update `worker-status/CODEX.json` with the previous reviewed head, corrected SHA, issue disposition, tests and QA. Stop at `WAITING_REVIEW`.

Do not merge. Do not start M2.