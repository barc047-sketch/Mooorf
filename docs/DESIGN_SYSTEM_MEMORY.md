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
premium primitive layer and added the selected-cell moving border. V7.0B
corrected that baseline from near-opaque card chrome to true stacked liquid
glass; treat the current in-app look as the baseline to extend, not restyle.

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

## V7.0B Liquid Glass Shell Lock

- Floating surfaces use theme-specific translucent material: focused widgets are
  approximately 0.58 alpha in day mode, background widgets approximately 0.36;
  both keep 32px backdrop blur and 158% saturation. Night mode uses the same
  hierarchy with dark tints.
- `WidgetHost` remains the only z-order owner. `WidgetFrame` receives the current
  focus state and exposes `data-depth="front|back"`; do not add a second focus or
  z-index manager.
- The dock has no outer glass slab. Left quick controls and right utilities are
  independent `.glass` islands; the center creation group floats in open canvas.
- Add and Add-5 are plain near-black circles with white marks and only a quiet
  contact shadow. MovingBorder stays exclusive to selected/edit-active cells.
- The rail is a 42px icon-only launcher with accessible names and external glass
  tooltips. Permanent section captions are prohibited.
- Future V7 widgets inherit these corrected primitives, compact headers, and
  controlled vertical density. They must not reintroduce cream-heavy cards.

## V7.1B Adaptive Interface Lock

- Floating instruments use semantic authored shapes from the canonical widget
  registry. Horizontal analytical rails and vertical diagnostic strips should
  coexist; equal dashboard-card geometry is prohibited.
- Every widget header is one icon plus one non-wrapping title. Eyebrows do not
  stack above titles. The same registry icon appears in rail launchers,
  submenus, and headers.
- Interface Scale is store-owned and token-driven: 88% / 100% / 112% presets
  plus a continuous 82–118% slider (V7.1C), both writing the one canonical
  `settings.uiScale`. It may change chrome density but never canvas world
  coordinates or nucleus radii. Custom values show no active preset (subtle
  "Custom" header state); mobile clamps rendered scale to 100% but the stored
  preference and the slider readout keep the user's value.
- Normal editorial and technical cell labels are unbounded text only. No
  background, border, blur, or card is allowed outside explicit Pill mode.
- The readiness intro uses a giant edge-clipped index on the right and compact
  actual stage copy on the left; exit follows first renderer paint, not a fake
  countdown.

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

## Stats Instruments (V7)

- Stats widgets are spatial diagnostic instruments, never SaaS dashboard cards.
- Hierarchy per instrument: hero readout → side vitals → hairline micro distribution → footer insight rows. Values are tabular; hero stays ≤ ~22px.
- Category data colors come only from `CATEGORY_TOKENS`; balance bands use neutral instrument tones; `--warning-data` only for true warnings.
- Shared family primitives live in `src/ui/widgets/stats/primitives.tsx`; the flagship reference is Project Pulse. V7.1 adds restrained ranked rows and deterministic health signals without dashboard cards.
- Keep one rail Stats launcher. Project Pulse owns the compact Instruments popover; Category Mix, Privacy Balance, Area Leaders, and Data Health remain independent WidgetFrames with existing stack depth.
- Category bands use category tokens, privacy uses neutral ink depth, and `--warning-data` appears only as actual health evidence. No compliance thresholds or red chrome.
- Spec: `docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md`.

## Current Anchors

- `docs/DESIGN_UI_UPGRADE_V6K.md` for premium widget system.
- `docs/V6N_GLASS_EDITORIAL_DIRECTION.md` for neutral glass chrome and density rules.
- `docs/V6N_REFERENCE_STYLE_LOCK.md` for the reference-locked dark HUD / frosted dashboard / spatial glass standard.
- `src/ui/primitives/MovingBorder.tsx` for selected/active moving border emphasis.
- `docs/PALETTE_SYSTEM_SPEC.md` for palette intent.
- `docs/PRODUCTION_CANVAS_UI_SYSTEM.md` for shell/control architecture.
- `assets/references/01` for mood/structure references only.
