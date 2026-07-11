# V4.5A — Component Library Rules

Library-first is mandatory. Check in this order before writing custom UI:
1. Reuse existing project code/component.
2. Adapt an existing component.
3. shadcn/ui or Base UI/Radix-style primitive (already in project).
4. Skiper UI / Cult UI / Watermelon UI / Magic UI / Aceternity UI / React Bits / 21st.dev Magic / glasscn-ui.
5. CSS/tokens.
6. Tiny local helper.
7. Custom system — only if none of the above solve it cleanly.

## Approved resources
shadcn/ui, Base UI/Radix-style primitives, Skiper UI, Cult UI, Watermelon UI, Magic UI, Aceternity UI, React Bits, 21st.dev Magic, glasscn-ui, Lucide, Tabler Icons, Iconoir, React Icons, cmdk, Sonner, Motion, GSAP, TanStack Table.

## Use approved resources for
Bottom docks, glass panels, toolbars, hover menus, command menus, sliders, switches, dropdowns, drawers, inspectors, floating widgets, metric panels, loaders, text animations, hover states, empty states.

## Custom code allowed mainly for
- CanvasView
- renderer
- pan/zoom/drag
- selected keyline/metadata/edit feedback (the historical arc spec was removed in V7.3)
- organism/blob
- graph/store sync
- import/export glue
- performance helpers

Do not hand-build generic UI if a component library can solve it. This rule governs all future V4.5B/V5+ implementation phases.
