# C0.3 Icons & Symbols Inspector Design Notes

This document captures the visual, structural, and behavioral design decisions implemented in the C0.3 Icons & Symbols Inspector prototype.

---

## 1. User Interaction Flows

### Open / Toggle Flow
1. **Selection Trigger:** The user selects a single space cell (e.g. "Studio") or a group of cells on the canvas stage.
2. **Keyboard shortcut:** Pressing `I` (case-insensitive) toggles the Icons Inspector open or closed on the right side of the screen.
3. **Focus Guard:** Keyboard events are ignored when typing inside search inputs or name text fields.
4. **Window Pinning:** The user can click the pin icon in the header to switch between **pinned** layout (canvas compresses to accommodate the 330px width sidebar) and **floating** layout (sidebar floats on top of the canvas with a soft glass drop shadow).

### Browsing & Search Flow
1. **Search Input:** Typing in the search bar dynamically filters the icon library grid using name and tags.
2. **Category Chips:** Horizontally scrollable chips (All, Architecture, Landscape, Diagram, Annotation, Navigation, Custom, Recent, Favourites) allow quick set narrowing.
3. **Favourites & Recents:** Quick lists populate based on user interactions.

### Hover Preview & Applying Flow
1. **Hover Preview:** Moving the pointer over any icon in the library grid temporarily previews that icon on the selected cell(s) in real-time.
2. **Preview Visual State:** Previewed icons render at 50% opacity with a dashed visual indicator to distinguish them from committed icons.
3. **Revert on Leave:** Moving the pointer off the icon resets the cell icon to its pre-hover state.
4. **Escape Dismissal:** Pressing `Escape` cancels any active hover preview.
5. **Apply Commit:** Clicking an icon applies the icon permanently to the selected cell(s), updating the cell's underlying data model.

---

## 2. Layer Stacking Order

The visual representation of cells with icons requires precise stacking to ensure readability and prevent collision with selection lines or cell cores.

From top to bottom:
1. **Selection Ring & Focus Indicator:** Dashed animated outer line + centering crosshairs (`z-index: 10` parent).
2. **Text Labels:** Cell name and area tags (`z-index: 10`).
3. **Icon Graphic:** Stretched/rotated SVG path (`z-index: 6`).
4. **White Circular Backing:** circular mask background (`z-index: 6`).
5. **Core Dot:** Centre reference point (`z-index: 5`).
6. **Cell Body & Boundary:** Radial color fill + boundary stroke (`z-index: 1`).
7. **Membrane & Visual Connections:** WebGL shaders / connecting lines (`z-index: 0`).
8. **Grid Layer & Stage Background:** Dot matrix guides (`z-index: -1`).

---

## 3. Backing Configuration Design

- **None:** The icon path is rendered directly over the cell fill color. Useful for dark cells or high-contrast icons.
- **Circle (Default):** A solid white circular shield is placed behind the icon. This ensures that the icon remains perfectly readable regardless of the cell's background color or texture.
- **Auto Contrast Circle:** In day mode, the backing circle is white. In night mode, the backing circle shifts to dark gallery ink (`#222222`), maintaining high contrast with night-themed background states.
- **Boundary Outline:** A thin outline surrounding the backing circle. The thickness can be adjusted dynamically via a slider (0.5px to 3.0px), mirroring industrial draft layouts.
