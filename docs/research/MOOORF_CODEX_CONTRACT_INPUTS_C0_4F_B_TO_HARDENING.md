# Future Codex Contract Inputs (Batches 1–4)

**Document Purpose:** Future implementation specifications for the Codex worker.
**Base Revision:** `c4600472ea76f651800c19b91cf8f67954ca992e` (main)
**Task Scope:** Batches 1 to 4 post C0.4F-A.

---

## Batch 1: C0.4F-B Editing, History & Minimal Inspector Integration

### Goal
Implement editing controls, transactional history, and visual override indicators in the floating Cell Inspector panel using the C0.2 registry and C0.4F-A presentation models.

### Exact Required Base Condition
* Successful merge of `feature/c0-4f-a-runtime-layer-separation` and `feature/c0-2-icon-grid-asset-registry` into `main`.

### Likely Work Branch Name
`feature/c0-4f-b-inspector-editing-history`

### Allowed File Families
* `src/ui/widgets/` (specifically `CellInspectorWidget.tsx` and child components)
* `src/state/` (store actions, snapshot mapping helpers)
* `src/domain/presentation/` (appearance resolvers, validation, defaults)

### Forbidden Scope
* No modifications to WebGL shaders, camera zoom parameters, or physical hit-testing math.
* No changes to `src/views/TableView.tsx` or `src/import/` (File Intake).
* No integration of the full Material Browser or connections.

### Data/Store Invariants
* Override values must write strictly to `spaces[id].appearanceOverrides`.
* If a property matches the project default, it must remain undefined in the cell object to ensure clean serialization.

### History Transaction Requirements
* Slider drag movements update the canvas local preview dynamically; mouse release (`onChangeEnd`) must commit exactly one undo history transaction.
* Direct inputs (checkboxes, text boxes, buttons) commit a history entry instantly on change.

### Migration Requirements
* Legacy view snapshots with null or missing `appearanceOverrides` must default to project default inheritance without triggering runtime crashes.

### Renderer/Export Implications
* Real-time update of cell strokes and cores in the active viewport (rAF scheduled); offscreen captures must render overlays correctly.

### Focused Automated Tests
* Unit tests verifying that custom overrides override defaults, and clearing the override falls back to default values.
* History tests validating that undo/redo restores coordinate overlays exactly.

### Manual QA at 1440 and 1280
* Floating layout validation at 1280 (frosted glass panel overlapping stage right).
* Pinned layout check at 1440 (canvas shifts to keep the selected cell in view).

### Stop Conditions
* **STOP** if updating the slider coordinates triggers infinite react-rerender loops.
* **STOP** if the canvas drag behavior is blocked while the inline editor is active.

### Independent Audit Checklist
- [ ] Verify that no red UI accents are added to the sliders or switches.
- [ ] Confirm that active state checks do not run inline inside the loop.
- [ ] Validate that the entry chunk remains below the 900 kB threshold.

### Owner Acceptance Checklist
- [ ] Double-click inline editor successfully modifies Space Name and commits on click-outside.
- [ ] Escape key discards inline edits.
- [ ] Selection orbit supports static mode for reduced-motion settings.

---

## Batch 2: Area Editing, Table/Canvas Sync & Reliable File Intake

### Goal
Establish bi-directional synchronizations between the Table and Canvas views, and provide a reliable file intake pipeline supporting CSV and XLS imports.

### Exact Required Base Condition
* Batch 1 merged into `main`.

### Likely Work Branch Name
`feature/c0-2-area-sync-import`

### Allowed File Families
* `src/views/TableView.tsx` (Table columns, bulk edit rows)
* `src/import/` (parsing logic, Intake widget, file intake providers)
* `src/domain/graph/adapters.ts` (radius-area logic)

### Forbidden Scope
* No dashboard rendering or floor systems integration.
* No modifications to WebGL shaders or raw WebGL coordinate arrays.

### Data/Store Invariants
* Cell area must remain a strict positive float: `area >= 1.0`.
* Cell name must default to "Untitled Space" if blank.

### History Transaction Requirements
* CSV file import must execute as a single transactional push on the history stack, enabling full reversion of changes with a single click.

### Migration Requirements
* Normalizes non-matching headers during CSV import, mapping aliases (e.g. `sq_m` or `sq_ft` to `area`).

### Renderer/Export Implications
* Updates to space area must trigger immediate radius recalculation on the canvas stage: `radius = Math.sqrt(area / Math.PI) * scale`.

### Focused Automated Tests
* Validate area scaling mathematics: verify that updating m² updates screen coordinates accurately.
* Validate CSV parser robustness against empty rows and malicious scripts.

### Manual QA at 1440 and 1280
* Verify worksheet choice dropdown for multi-sheet Excel files.
* Confirm that split-screen layout keeps both canvas and table synchronized under high-density views.

### Stop Conditions
* **STOP** if uploading a CSV file containing invalid rows deletes existing valid cell structures without prompting recovery.
* **STOP** if drag-and-drop overlay intercepts click events on widgets.

### Independent Audit Checklist
- [ ] Verify that CSV column mapping aliases are static.
- [ ] Confirm that table virtualization prevents DOM slowdown for 200+ row lists.

### Owner Acceptance Checklist
- [ ] Table rows bulk update updates Canvas colors immediately.
- [ ] CSV import replaces or appends cells safely.

---

## Batch 3: Floor System, Derived Statistics & Compact Dashboard

### Goal
Implement a multi-level floor system with visibility filters, and derive real-time programmatic statistics (FAR, category mix) for display on the compact Project Pulse widget.

### Exact Required Base Condition
* Batch 2 merged into `main`.

### Likely Work Branch Name
`feature/c0-3-floors-stats-dashboard`

### Allowed File Families
* `src/domain/stats/` (pure derived selectors)
* `src/ui/widgets/stats/` (dashboard primitives and metrics)
* `src/state/` (floor node slice additions)

### Forbidden Scope
* No implementation of visible connection lines or relationships.
* No changes to SVG export.

### Data/Store Invariants
* Floor elevations must remain unique: `level` is an integer index (basement < 0, ground = 0, upper > 0).
* Cells must belong to a valid `floor_id`.

### History Transaction Requirements
* Adding or reordering floors is a history-tracked action. Toggle visibility is transient.

### Migration Requirements
* Legacy view snapshots with missing floors default to placing all cells on "Ground Floor" (`level: 0`) automatically.

### Renderer/Export Implications
* Changing the active floor level visibility updates the visible cells map on the canvas. Stats selectors reflect the filtered set.

### Focused Automated Tests
* Unit tests for `computeSpatialPulse`: verify that void cells do not inflate total built-up area.
* Validation of Category Mix calculations under malformed category codes.

### Manual QA at 1440 and 1280
* Verify scroll behavior in Category Mix widget under comfort UI scaling settings.
* Test floor ordering drag handle behavior on touchpads.

### Stop Conditions
* **STOP** if switching floor visibility triggers redrawing delay or visual glitches on the WebGL canvas.
* **STOP** if calculating statistics throws NaN values on empty projects.

### Independent Audit Checklist
- [ ] Verify that no third-party charting libraries are installed.
- [ ] Confirm that statistics selectors are memoized to avoid re-triggering on camera pans.

### Owner Acceptance Checklist
- [ ] Active floor selector filters canvas and table views cleanly.
- [ ] Project Pulse widget correctly highlights dominant categories and data warnings.

---

## Batch 4: Essential Connections, Export Parity & Hardening

### Goal
Establish semantic relationships and visible lines between cells on the canvas, harden offscreen capture engines, and resolve dense-scene performance bottlenecks.

### Exact Required Base Condition
* Batch 3 merged into `main`.

### Likely Work Branch Name
`feature/c0-4-connections-export-hardening`

### Allowed File Families
* `src/export/` (pdf-lib, jszip composite modules)
* `src/canvas/` (WebGL shader lines, Classic vector exports)
* `src/interaction/` (connection tools and anchor math)

### Forbidden Scope
* No animated connection paths, flow rate visualizations, or routing algorithms.

### Data/Store Invariants
* Connection edges must reference valid `from` and `to` space cell IDs.

### History Transaction Requirements
* Edge creation and deletion are undoable actions. Drag-based connection line adjustments commit on mouse release.

### Migration Requirements
* Legacy files load with empty connection lists. Unknown target edges are pruned during load.

### Renderer/Export Implications
* Renders lines between cell borders. Offscreen PDF captures composite HTML label layers correctly.

### Focused Automated Tests
* Verify SVG export vector output: check circle and text coordinates.
* Validate filename format generator.

### Manual QA at 1440 and 1280
* Verify ZIP Presentation Pack generation: confirm it contains canvas.png, presentation.pdf, spaces.csv, project.json, and manifest.json.
* Test UI scalability at 82% and 118% zoom.

### Stop Conditions
* **STOP** if generating exports triggers page reloads or breaks WebGL drawing contexts.

### Independent Audit Checklist
- [ ] Verify that external libraries are imported dynamically (code-splitting).
- [ ] Confirm that deleting a cell automatically cleans up associated relationship edges.

### Owner Acceptance Checklist
- [ ] Connections update in real-time as cells are dragged.
- [ ] PDF export includes a custom project title and date metadata footer.
