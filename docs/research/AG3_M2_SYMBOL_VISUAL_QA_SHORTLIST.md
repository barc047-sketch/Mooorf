# M2 Symbol Visual QA Shortlist

This document defines the staged, audited symbol library for the MOOORF spatial canvas. It reconciles the projected catalog ceiling into a disciplined implementation sequence, ensuring visual consistency, readable scaling, and correct licensing boundaries.

---

## 1. Symbol Library Classifications

To prevent overwhelming the M2 implementation scope, the projected ceiling of 156 active geometries and 176 searchable IDs is divided into the following four stages:

| Stage / Classification | Scope Summary | Approved for M2 |
| :--- | :--- | :--- |
| **M2 Essential — Students** | Basic shapes, simple furniture, basic landscape, entry markers. | **YES** |
| **M2 Essential — Professionals** | Doors, windows, columns, egress paths, standard annotations. | **YES** |
| **M2 Useful** | Trees, vehicles, specialized equipment, secondary furniture. | **DEFERRED (M3A/M3B)** |
| **Later Domain Pack** | Specialized structural/MEP, complex site/program assets. | **DEFERRED (M4+)** |

---

## 2. Shortlist Matrix (Staged for M2)

For each symbol, we verify its design parameters on a standard **24px optical grid** (with a 2px safe zone limit, yielding a `20px x 20px` active design area) using a **consistent 1.5px stroke weight**.

### 2.1 M2 Essential — Students

| Canonical ID | Source Key & Licence | Category | Default Scale | Backing | Tinting | Visual QA & Optical Centering |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `icon:architecture:door` | Lucide `DoorClosed` (ISC) | architecture | `1.0` | Solid | Allowed | **Optically Centered**: Align door handle projection. Readability at 16px is clear. |
| `icon:architecture:window` | Lucide `Layout` (ISC) | architecture | `1.0` | None | Allowed | Center-aligned double parallel lines. Avoid thick fill. |
| `icon:furniture:bed` | Lucide `Bed` (ISC) | architecture | `1.1` | Solid | Allowed | Pillow lines must be simplified at far zoom to prevent clutter. |
| `icon:furniture:chair` | Lucide `Armchair` (ISC) | architecture | `0.95` | Solid | Allowed | Centered square with backrest curve. |
| `icon:furniture:sofa` | Lucide `Sofa` (ISC) | architecture | `1.2` | Solid | Allowed | Elongated body. Visual collision risk with generic rects; keep cushions distinct. |
| `icon:landscape:tree` | Lucide `Trees` (ISC) | landscape | `1.0` | None | Allowed | Standard circular cloud profile. Center trunk aligned vertically. |
| `icon:landscape:flower` | Lucide `Flower` (ISC) | landscape | `0.9` | None | Allowed | Balanced petal distribution. Readability: petals merge below 50% zoom. |
| `icon:wayfinding:north-arrow` | Lucide `Compass` (ISC) | wayfinding | `1.0` | Solid | Allowed | Needle is centered. Do not confuse with direction snap compass. |
| `icon:wayfinding:entrance` | Lucide `LogIn` (ISC) | wayfinding | `1.0` | None | Allowed | Arrow entering bracket. High zoom visibility. |

### 2.2 M2 Essential — Professionals/Architects

| Canonical ID | Source Key & Licence | Category | Default Scale | Backing | Tinting | Visual QA & Optical Centering |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `icon:structural:column` | `custom:column` (Proprietary) | structural | `1.0` | Solid | Allowed | **Owner Approval Required**. Crosshair center-aligned on grid nodes. |
| `icon:structural:beam` | `custom:beam` (Proprietary) | structural | `1.0` | None | Allowed | **Owner Approval Required**. Dashed parallel lines. Must not align with cell border. |
| `icon:wayfinding:stairs` | Lucide `ChevronsUp` (ISC) | wayfinding | `1.0` | Solid | Allowed | Parallel treads. Arrows show upward climb. |
| `icon:wayfinding:egress` | Lucide `Activity` (ISC) | wayfinding | `1.0` | None | Allowed | High-contrast running figure. Essential for code compliance paths. |
| `icon:annotation:dimension` | Lucide `Ruler` (ISC) | annotation | `1.0` | None | Allowed | End tick marks centered. Clear of label text bounds. |
| `icon:annotation:north` | Lucide `ArrowUp` (ISC) | annotation | `1.0` | None | Allowed | Simplest vertical arrow. Readability: visible down to 10% zoom. |

---

## 3. Custom Geometries Requiring Owner Approval

The following 8 original custom symbols have full implementation briefs but are **deferred** to M2 review-only/Owner validation stage. They must **not** be integrated as automatic production scope without explicit Owner signature:

1. `icon:circulation:elevator-cab` (Elevator Lift Cab)
2. `icon:circulation:stairs-plan` (Stairs Plan View)
3. `icon:circulation:escalator-section` (Escalator Section)
4. `icon:furniture:wardrobe-layout` (Wardrobe Plan Outline)
5. `icon:furniture:sink-layout` (Plumbing: Sink Layout)
6. `icon:landscape:gate-layout` (Fence Gate Swing)
7. `icon:service:drainage-drain` (Floor Drainage Drain)
8. `icon:annotation:section-mark` (Architectural Section Cut)

---

## 4. Separation from UI Command Icons

To prevent classification collision in the interface, UI Command Icons (Quick Bar and Snapping menu controls) are separated from the drawable Symbol library. The following command keys must never appear in the drawable catalog:
- `cmd:quickbar:membrane` (Layers icon - collision with layout-grid drawable)
- `cmd:quickbar:grid` (Grid toggle - collision with structural column-grid drawables)
- `cmd:quickbar:snapping` (Magnet icon - collision with link drawable)
- `cmd:snap:center` (CircleDot - collision with center target marker)

---

## 5. Visual QA Acceptance Rules

1. **Stroke Weight**: Must render at exactly 1.5px equivalent on the SVG canvas.
2. **Optical Centering**: Icons with asymmetric weights (like `entrance` or `stairs`) must include a hard-coded CSS or transform offset to center their visual mass within circular space cells.
3. **Backing Fill**: Symbols that cross wall membranes (e.g. doors, windows) must use a solid white backing fill (100% opacity) to hide the underlying membrane line work.
4. **Far Zoom Behavior**: Below 25% zoom, detailed inner lines (like bed pillows or stair treads) are omitted, keeping only the outer envelope.
