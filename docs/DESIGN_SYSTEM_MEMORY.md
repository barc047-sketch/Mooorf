# Design System Memory

Purpose: stable aesthetic memory for future UI work.

## Desired Feel

- Premium editorial.
- Clean futuristic.
- High-end architecture tool.
- Calm, precise, and spatial.
- More studio instrument than SaaS dashboard.

## Reference-Locked Visual Standard

V6N.1 locks the visual system to the premium reference grammar in
`docs/V6N_REFERENCE_STYLE_LOCK.md`. V6N.2 applied it across the live UI
(selection arc + command menu, edit popover, dot-matrix grid, dock, rail,
sliders, switches, saved-view tiles, widget chrome). V6N.3 hardened the
premium primitive layer and added the selected-cell moving border; treat the current
in-app look as the baseline to extend, not restyle.

- No red UI chrome. Red/wine is product or palette material only.
- UI chrome is neutral graphite / pearl / smoke / bone / black / warm stone.
- Color belongs to spatial data, category mapping, palette material, organism material, selected content, and true warnings.
- All future widgets must use `WidgetFrame`, `WidgetHost`, shared widget controls, and the shared glass tokens before custom styling.
- All future controls must use premium primitives: slim sliders, switches, segmented chips, metadata pills, micro cards, and glass popovers.
- Moving borders are reserved for selected/active/editing emphasis, not blanket decoration.
- Do not ship raw default HTML controls in production UI.
- Do not create cheap rectangular panels or uncontrolled card styles.
- Do not duplicate dock, rail, widget, table, or canvas responsibilities.
- New UI files must be justified by clearer ownership or reduced duplication.

## Visual Language

- Soft glass over the canvas.
- Precise ink typography.
- Cream, graphite, fog, black, bone, pearl, and warm stone for UI chrome.
- Subtle gradients only where they communicate emphasis, state, or organism material.
- Red/wine remains product/palette material only; V6N removes red from general UI chrome.
- Muted spectral accents are allowed inside palette/organism moments, not random chrome.

## Interaction Language

- Mac-like hover lift.
- Compact controls.
- Single-line sliders.
- Quiet active states.
- Smooth but restrained motion.
- No bounce-heavy or toy-like animation.

## Surface Ownership

- Rail = launcher.
- Dock = quick actions.
- Widget = details.
- Canvas = direct editing.
- Table = precise data editing.

## Avoid

- Cheap SaaS dashboards.
- Giant marketing cards.
- Rainbow chaos.
- Random neon.
- Over-large panels.
- Duplicate controls across rail/dock/widgets.
- Decorative gradients that compete with program data.
- Red halo spam for ordinary selection.
- Red chrome on rail buttons, dock groups, widget headers, sliders, chips, panel accents, or selection arcs.
- Moving borders on every cell/card/widget; use motion sparingly for active instrument emphasis.

## Current Anchors

- `docs/DESIGN_UI_UPGRADE_V6K.md` for premium widget system.
- `docs/V6N_GLASS_EDITORIAL_DIRECTION.md` for neutral glass chrome and density rules.
- `docs/V6N_REFERENCE_STYLE_LOCK.md` for the reference-locked dark HUD / frosted dashboard / spatial glass standard.
- `src/ui/primitives/MovingBorder.tsx` for selected/active moving border emphasis.
- `docs/PALETTE_SYSTEM_SPEC.md` for palette intent.
- `docs/PRODUCTION_CANVAS_UI_SYSTEM.md` for shell/control architecture.
- `assets/references/01` for mood/structure references only.
