# V6F.0B — Production Canvas UI System

Status: planning only. No runtime UI is implemented in this phase.

## Visual Direction

The production canvas shifts from "cells with a blob behind them" to:

Space data -> nucleus -> organism field -> labels / controls / table / stats.

The organism is the primary canvas object. Spaces are still the product data, but the canvas presents each space as a nucleus inside one living organism field. The existing classic canvas remains the fallback renderer during V6F.1.

Reference images for this phase live in `assets/references/01`. Use them for structural mood only: compact segmented controls, premium grey/black glass panels, bottom dock hierarchy, left rail logic, modular dashboard widgets, and restrained gradient emphasis. Do not copy branding, exact layouts, or proprietary content.

## Panel Zones

## V6H.2 Command Split

The production canvas command structure is:

- **Left rail:** view navigation and widget launchers. It is not a parameter-editing surface.
- **Bottom dock:** quick creation and quick mode controls. It owns ORG/CLS, style, attachment, reach, add nucleus, enabled void nucleus creation, saved views placeholder, palette, import/export placeholders, and the widget-panel launcher.
- **Widget panel:** detailed settings. The current right-side control surface is the first widget panel and now includes annotation and selection display controls.
- **Canvas:** direct manipulation of store-owned spaces through select, drag, and future inline edit gestures.

This prevents full duplication between rail and dock. When a concept appears in multiple places, one surface is only a shortcut or launcher.

### 1. Left Rail

Purpose: primary modes, tools, and view switching.

Production MVP:
- Canvas
- Table
- Floors
- Stats
- Export
- Settings

Later:
- Relationships
- Organism Lab / Advanced dev link, hidden by default
- Command/search entry

Rules:
- The left rail is navigation and mode selection, not parameter editing.
- Icons come from Lucide first; use another approved icon set only if a needed glyph is missing.
- The current Canvas/Table view logic remains shared-store-first.

### 2. Bottom Dock

Purpose: primary creation and organism controls.

V6F.1 bottom dock hierarchy:

Left side:
- View / organism style
- Attachment / reach
- Palette
- Theme

Center:
- Large high-emphasis `+ NUCLEUS` action

Right side:
- Table / import
- Export
- Advanced / settings
- Optional reset / randomize

The Add Nucleus button becomes the main production action. It should feel heavier than surrounding chips through size, contrast, and a controlled dark gradient or active red accent. It creates a new `SpaceCell`, which is projected to a nucleus by the production adapter. It must not create renderer-only data.

### 3. Right Inspector

Purpose: selected nucleus and graph-backed property editing.

Production MVP sub-panels:
- Selected Nucleus
- Area / Size
- Label
- Category
- Privacy
- Floor
- Relationships summary
- Notes placeholder

Advanced sub-panel:
- Renderer influence overrides, hidden unless advanced mode is open.

Rules:
- Values come from the store / graph, not from the WebGL renderer.
- Editing area/name/category/privacy/floor updates the same source that table view uses.
- The inspector can be absent in V6F.1 if scope requires; the architecture should leave room for it.

### 4. Floating Widgets

Purpose: compact graph-derived cards over the canvas.

Future widgets:
- Total area
- Selected space area
- Category ratio
- Privacy ratio
- Graph health
- Floor stats
- Warnings
- Export frame

Rules:
- Widgets float over canvas; they are not a docked dashboard page.
- Values are computed from graph selectors.
- Widget positions are UI state only and do not belong in product data.

### 5. Advanced / Lab Panel

Purpose: preserve the Organism Lab control model without crowding production UI.

Contains:
- Mass
- Iso Level
- Surface Tension
- Edge Softness
- Connection Bias
- Nucleus count
- Radius Min/Max
- Strength
- Size Variation
- Offset X/Y/Radial/Angular
- Motion Response
- Drift
- Breathing
- Wobble
- Pocket controls
- Field Debug
- Nuclei Debug
- Shader diagnostics
- Performance counters

The Advanced panel is hidden from MVP production controls. It may be reachable through a small settings/dev affordance when the renderer is being tuned.

## Production Versus Advanced

Production MVP:
- Style
- Attachment
- Reach / Offset / Density
- Theme
- Palette
- Show Labels
- Show Grid
- Show Nuclei
- Add Nucleus
- Reset / Randomize, optional

Advanced:
- Mass
- Iso Level
- Surface Tension
- Edge Softness
- Connection Bias
- Radius Min/Max
- Strength
- Size Variation
- Motion Response
- Drift
- Breathing
- Wobble
- Pockets

Debug:
- Field Debug
- Nuclei Debug
- Shader diagnostics
- Performance counters

## Add Nucleus Behavior

`+ NUCLEUS` creates a new space through the existing store action, then the production organism adapter maps that `SpaceCell` into a nucleus:

- `SpaceCell.id` -> `nucleus.id`
- `SpaceCell.name` -> label
- `SpaceCell.area` -> radius
- `SpaceCell.x/y` -> home/target position
- `SpaceCell.category` -> palette/material influence later
- `SpaceCell.privacy` -> opacity/field-strength influence later

Default placement should use the current camera center or a near-center scatter location, not hidden offscreen. Selection should move to the new space after creation.

## Labels, Grid, Floor, Table, Stats, Export

- Labels are a production toggle. They draw above the organism field and follow smoothed nucleus positions.
- Grid is a canvas overlay controlled by UI settings, not part of the organism renderer.
- Floors are graph/store state. The canvas can filter or ghost nuclei by floor later.
- Table remains a peer view of the same source data; table edits update nuclei through the adapter.
- Stats come from selectors and appear in floating widgets or the right inspector.
- Export actions should export the visible canvas state first, then add SVG/PDF/ZIP later.

## Gradient Rules

Allowed gradient emphasis:
- Add Nucleus main button
- Active style chip
- Selected organism mode
- Export action
- Warning widget
- Premium/advanced toggle

Avoid gradients on every button, random decoration, low-importance controls, and unrelated chrome.

## Reference Interpretation

- Bottom panel color/style/device reference -> grouped dock, compact segmented controls, palette/style clusters, and a high-emphasis central create action.
- Light dashboard/map widgets reference -> compact data cards, map-adjacent overlays, warning chips, and glass widgets over the canvas, not a generic dashboard page.
- Grey left rail/system reference -> quiet vertical navigation, premium grey/black contrast, tight icon rhythm, and clear primary-mode hierarchy.
- Dark gradient dashboard reference -> selective gradient depth for active controls, advanced/export actions, warning states, and metric internals.
- Compact side rail reference -> future settings/advanced panel density, narrow sub-panel behavior, and clear plan/tier-style grouping logic.

These references are visual and structural inputs only. They define mood, hierarchy, density, and control organization; they are not layouts to copy.

## V6F.1 Implementation Boundary

V6F.1 should use this document to shape reduced production controls while preserving:
- Organism Lab route
- Classic canvas fallback
- Table sync
- Central store ownership
- No backend, auth, cloud save, public gallery, or deployment
