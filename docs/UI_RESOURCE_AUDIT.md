# V6H.2 — UI Resource Audit

Status: resource prep only. No packages were installed.

## Installed Resources To Reuse

| Resource | Use | Notes |
|---|---|---|
| `@floating-ui/react` | Popovers, anchored tooltips, future inspector positioning | Use before custom positioning for complex panels. Current dock popovers are local and small enough. |
| `motion` | Dock, rail, panel, hover, collapse, and widget transitions | Preferred for React UI motion. Keep motion restrained. |
| `gsap` | Loader and special organic/hero motion only | Do not use for ordinary buttons or forms. |
| `@use-gesture/react` | Future draggable widgets and magnetic snap experiments | Already installed; defer until real floating widgets start. |
| `vaul` | Future drawer/sheet interactions | Use only if a drawer is truly needed. |
| `chroma-js` | Palette interpolation, shade ramps, contrast checks | Installed. Good fit for future palette generation. |
| `culori` | Color-space conversion and perceptual interpolation | Installed. Use for high-quality palette work if needed. |
| `colorjs.io` | Color parsing/conversion and advanced color spaces | Installed. Use only if it simplifies real palette math. |
| `tinycolor2` | Lightweight color parsing and contrast helpers | Installed. Useful for simple checks. |
| `lucide-react` | Dock, rail, and panel icons | First icon source. Avoid mixing icon families unless necessary. |
| shadcn/Base UI primitives | Selects, inputs, switches, tables, future menus | Prefer existing primitives for ordinary interface pieces. |
| `cmdk` | Future command palette | Not part of V6H.2. |
| `sonner` | Future import/export status toasts | Not part of V6H.2. |
| `html-to-image`, `file-saver`, `pdf-lib`, `jszip` | Future export paths | Do not start export in UI cleanup phases. |

## Optional Future Resources

| Resource | Recommendation |
|---|---|
| `react-colorful` | Good optional color picker for a future custom palette phase. Do not install until color editing is scoped. |
| Radix Colors | Safe reference for token-scale thinking; inspect license and avoid blind copying. |
| Tweakpane / Leva | Useful inspiration for dense controls, but likely not final ZONUERT UI. Avoid shipping a lab-looking panel as the product UI. |

## Recommended Final Stack

- Reuse current `Dock`, `Rail`, and `OrganismControlPanel` as the first production UI layer.
- Keep dock popovers local while they remain small.
- Use one widget-panel pattern for detailed settings: organism, annotation, palette, saved views, selected space, stats, and export.
- Use installed color libraries only when palette generation begins; do not add new color packages now.
- Keep gradients reserved for high-emphasis actions, active controls, warning/metric internals, and organism material previews.

## License Caution

Reference images and online examples are mood and structure references only. Do not copy proprietary layouts, source code, branded assets, or paid component snippets into the project.

