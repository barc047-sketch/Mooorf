# MOOORF Fast-Track Risk and Deferred Scope Register

**Author:** Antigravity AI
**Role:** Independent Read-Only Auditor
**Production Base SHA:** `c4600472ea76f651800c19b91cf8f67954ca992e`

---

## 1. Architectural and Technical Risks

| ID | Description | Severity | Affected Milestone | Evidence | Mitigation Strategy | Decision Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Master Graph Expansion Lock** | **High** | *Batch 2 (Table Sync)* | `spaces` array in Zustand is flat. Complex graph structures (e.g. parent/child, floor bindings) will require updating the schema. | Establish clear mapper/adapter utilities before changing the Zustand state model. | Owner / PM |
| **R-02** | **WebGL Shader Limits (Uniforms)** | **Medium** | *Batch 4 (Hardening)* | `MAX_NUCLEI` is capped at 96 to fit typical hardware GPU registers. High-density plans will exceed this limit. | Implement dynamic shader paging or fallback to the Classic 2D canvas renderer. | Technical Lead |
| **R-03** | **History Bloat during Slider Drag** | **High** | *Batch 1 (Inspector)* | Moving slider thumbs generates hundreds of updates. If not throttled, they clog the history stack. | Update UI state ephemerally; commit exactly one history transaction on pointer release. | Technical Lead |
| **R-04** | **PDF-Lib/JSZip Bundle Bloat** | **Medium** | *Batch 4 (Export)* | Adding jszip/pdf-lib directly increases initial download size, slowing page load. | Import these heavy libraries dynamically (`import()`) only when the export flow begins. | Auditor |

---

## 2. Migration and Compatibility Risks

| ID | Description | Severity | Affected Milestone | Evidence | Mitigation Strategy | Decision Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M-01** | **Legacy View Format Rejection** | **High** | *Batch 1 (Inspector)* | Pre-V6K saved views do not have `appearanceOverrides` fields, causing rendering exceptions. | Implement migration parsers inside `cloneSnapshot` to populate default values. | PM |
| **M-02** | **XLS/XLSX Parser Parsing Errors** | **Medium** | *Batch 2 (Import)* | Different Excel sheets use varying layouts, headers, and coordinate formatting. | Provide a column mapping UI in `FileIntakeWidget` to validate inputs before committing. | PM |

---

## 3. Renderer Parity and Export Risks

| ID | Description | Severity | Affected Milestone | Evidence | Mitigation Strategy | Decision Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **E-01** | **Classic/WebGL Visual Mismatch** | **Medium** | *Batch 4 (Hardening)* | Classic renderer draws vector circles; WebGL uses complex fragment blending. | Maintain unified styling boundaries. Classic remains a schematic fallback. | Technical Lead |
| **E-02** | **Raster Capture Resolution Limitations** | **Medium** | *Batch 4 (Export)* | Mobile viewports and high-DPR screens produce varying PNG resolutions. | Render scene to an isolated offscreen canvas using fixed bounding sizes. | Technical Lead |

---

## 4. Prototype Reuse Risks

| ID | Description | Severity | Affected Milestone | Evidence | Mitigation Strategy | Decision Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P-01** | **Prototype Store Coupling** | **High** | *Batch 1 (Inspector)* | V2 prototype uses inline states, mock arrays, and bypasses history stacks. | Extract only layout structure and CSS; reimplement state and actions inside the Zustand store. | Technical Lead |
| **P-02** | **Z-Index Collision on Overlays** | **Medium** | *Batch 1 (Inspector)* | Inline editor overlaps floating panel headers if not bounded. | Apply strict z-index tokens: shell (100), popovers (70), widgets (40–59), canvas (0). | Auditor |

---

## 5. Licensing and Provenance Risks

| ID | Description | Severity | Affected Milestone | Evidence | Mitigation Strategy | Decision Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **L-01** | **Lucide Key Verification Failures** | **Medium** | *Batch 1 (Inspector)* | Importing uninstalled Lucide keys crashes the build context. | Verify registry keys exist in `package.json` before writing SVG selectors. | Auditor |

---

## 6. Unresolved Design Decisions

1. **Membrane Material UI Integration:** Should Membrane settings belong in the Cell Inspector or are they strictly controlled by the target rail?
   *Current Direction:* Keep Membrane parameters separate to prevent style confusion.
2. **Floor Elevation Datums:** Do elevations support automatic layout spacing?
   *Current Direction:* Floor offsets remain decorative; manual entry is required.

---

## 7. Explicitly Deferred Scope

The following features have been deferred from the fast-track milestones to ensure timely delivery of core capabilities:
* **Advanced Membrane Motion:** Ripple variations, waves, wobble speed, and motion responses are deferred.
* **Relationship Routing Algorithms:** Auto-orthogonal routing, elbow bends, and line crossing avoidance are deferred.
* **Interactive Timeline / History Slider:** Visual history navigation is deferred; undo/redo remains shortcut-based.
* **Collaboration & Multi-user Sync:** Real-time editing synchronization is deferred.
* **Public Gallery & Cloud Save:** Projects remain local-first; cloud synchronization is deferred.
