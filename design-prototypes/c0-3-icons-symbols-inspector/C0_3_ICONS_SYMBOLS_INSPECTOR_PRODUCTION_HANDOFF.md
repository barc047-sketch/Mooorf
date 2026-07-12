# C0.3 Icons & Symbols Inspector Production Handoff

This document details the transition map, component structure, and state requirements for implementing the C0.3 Icons & Symbols Inspector in the production React environment.

---

## 1. Proposed React Component Structure

The inspector should be implemented as a new floating panel widget registered under the existing panel system:

- **`IconInspectorPanel.tsx` (New Host Component)**
  - Reuses `WidgetFrame` and `WidgetHost` from `src/ui/widgets/`.
  - Mounted inside the right-side inspector zone (controlled by `settings.showIconInspector` in store).
  - Width: locked at 320px (or 330px as justified in style parity checklist).
  - Children elements:
    - **`IconSearchAndFilter.tsx`:** contains search bar text inputs + scrolling category set chips.
    - **`IconLibraryGrid.tsx`:** virtualized or scrollable grid of `IconDefinition` cards.
    - **`IconPlacementControls.tsx`:** segmented choices for Anchor preset, sliders for offset X/Y, scale, rotation, opacity, and tint color picker swatches.
    - **`IconBackingControls.tsx`:** segmented choices for Backing type, sliders for backing size, opacity, and toggle for border outline width.
    - **`IconBehaviorControls.tsx`:** "Use Project Defaults" override toggle, "Hide Below Zoom" slider, and "Include in Export" toggle.

---

## 2. Shared Primitives & Tokens Reused

- **Design System Tokens:**
  - Leverage variables from [src/styles/tokens.css](file:///Users/tanisxq/Documents/ZONU0/src/styles/tokens.css) directly:
    - Glass style: `background: var(--glass-panel)`, `backdrop-filter: blur(var(--glass-blur))`, `border: 1px solid var(--glass-border)`.
    - **No panel shadow, pinned or floating** — post-V8.2C0 production keeps `box-shadow: none` on every `WidgetFrame` state; the inspector must follow. Slider thumbs keep production's micro contact shadow + hover halo only.
    - Slider theme styling: `background: var(--instrument-track)`, `thumb: var(--instrument-thumb)`.
    - **No red UI chrome (V6N):** switch on-states use the production `.org-switch[data-on="true"]` ink gradient; active library cards use `--selection-keyline-neutral`; `--zonuert-red` may appear only as icon tint data.
- **UI Primitives:**
  - Reuse `WidgetFrame` and `WidgetHost` for panel dragging, resizing, minimizing, and closing.
  - Slider controls should inherit styling patterns from `SliderRow` inside `src/ui/widgets/controls.tsx`.
  - Toggles should reuse `SwitchRow` controls.

---

## 3. State & Registry Integration Map

- **Registry Metadata:**
  - Extend [src/icons/iconRegistry.ts](file:///Users/tanisxq/Documents/ZONU0/src/icons/iconRegistry.ts) to register custom SVGs extracted from the V1 and V2 prototypes.
- **Zustand State Store additions:**
  - **`activeIconInspectorOpen` (boolean):** tracks open state.
  - **`projectDefaultIconSettings` (IconPlacementSettings):** stores global defaults.
  - **`spaces[id].iconSettings` (IconPlacementSettings | null):** stores override settings.
  - **`spaces[id].useDefaultIconSettings` (boolean):** defaults flag.
  - **`IconPlacementSettings` shape (as exercised by the prototype):** `anchor` (centre/above/below/top-left/top-right), `offsetX/Y`, `scale`, `rotation`, `opacity`, `tint`, `backingType` (none/circle/auto), `backingSize`, `backingOpacity`, `backingOffsetX/Y`, `backingBoundary`, `boundaryWidth`, `hideZoom`, `exportInclude`.
  - **Scope badge contract:** `Selection` (one cell), `N Cells` (multi), `Project Defaults` (none) — with no selection, controls write to project defaults and apply/remove are disabled.
- **Actions:**
  - `toggleIconInspector()`
  - `applyIconToCells(cellIds: string[], iconId: string)`
  - `removeIconFromCells(cellIds: string[])`
  - `updateCellIconSettings(cellId: string, settings: Partial<IconPlacementSettings>)`
  - `updateProjectDefaultIconSettings(settings: Partial<IconPlacementSettings>)`
- **History Undo/Redo integration:**
  - All apply, remove, and settings slider commit actions must be registered as single undo-able transactions in the global store history.
  - Sliders should update state *ephemerally* during drag (so rendering updates in real-time) and commit one final history frame when pointer drag ends (`onChangeEnd`).

---

## 4. Accessibility & Responsive Specifications

- **Keyboard navigation:**
  - The inspector grid must support focus outlines, tab index navigation, and arrow key traversal.
  - Pressing `Enter` on an icon card applies it; `Space` toggles it.
  - `I` key toggles inspector visibility (blocked if focused inside text inputs).
  - `Escape` closes the inspector.
- **Screen reader labels (`aria-`):**
  - Add descriptive screen-reader tags: `aria-label="Search icons"`, `aria-label="Scale override"`, `aria-label="Use project default icon settings"`.
- **Responsive Sizing at 1440/1280:**
  - Pinned sidebar layout shifts the canvas bounds to prevent layout overlap at 1440.
  - At 1280 laptop viewports, the inspector automatically falls back to **floating** mode to maximize canvas space, using frosted glass blur overlay shadows.
