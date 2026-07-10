# V6N.1 — Reference-Locked Premium Design System

Status: active visual standard for all future UI work. V6N.2 applied this
standard to the live UI: dot-matrix scan grid, thin leader-line selection arc,
radial selection command menu, glass instrument edit popover, hairline
sliders/switches, lightened dock/rail, and bento saved-view tiles.
V6N.3 adds the reusable MovingBorder primitive and selected-cell moving border
as part of this standard. V7.0B corrects the production shell to true stacked
liquid glass, independent dock islands, and an icon-only rail.

The new reference images are visual grammar, not layouts to copy. They define mood, density, surface behavior, and control language for ZONUERT/MOOORF. Do not reproduce proprietary screens, brands, medical content, dashboard compositions, or exact card arrangements.

## Reference Interpretation

- **Dark scientific HUD**: use graphite/black fields, low-contrast dotted grids, tiny precise icons, thin measurement arcs, compact warning chips, and quiet floating controls.
- **Light frosted dashboard**: use calm bento rhythm, pearl/fog surfaces, small data cards, tabular numerals, subtle micro charts, and generous negative space.
- **Spatial glass / VisionOS**: use translucent frosted panels, soft inner highlights, ambient blur, rounded pill controls, and real depth without noisy stacked blur.
- **Editorial cinematic overlay**: let the canvas stay dominant. Controls float as art-directed instruments over content, never as a generic SaaS dashboard.
- **Architecture translation**: canvas is the living spatial scan; widgets are scientific instruments; selection arcs are measurement markers; table remains the schedule/data layer; saved views are design iterations.

## What To Copy Conceptually

- Thin partial arcs with endpoint dots.
- Dark scan grids and biometric/HUD precision.
- Bento-like data density for future stats widgets.
- Floating glass panels with soft edge highlights.
- Small type, tabular readouts, and restrained icon controls.
- Controlled warning yellow/acid as semantic data warning only.
- Warm/surreal gradients only as content material or palette previews.

## What Not To Copy Literally

- Do not copy exact health dashboard layouts, body diagrams, medical labels, app branding, or screenshots.
- Do not convert the canvas into a dashboard page.
- Do not add decorative cards just to match a reference.
- Do not use red, orange, or neon color as generic UI chrome.
- Do not create one-off panel styles outside the shared primitives.

## Dark Scientific HUD Rules

- Night UI should read graphite/black first, with a low-contrast technical dot matrix.
- Controls should be tiny, precise, and reachable.
- Warning chips use muted acid/yellow only when the data actually warns.
- Arcs and selection affordances stay thin and neutral.
- Avoid loud glows, thick rings, and high-saturation chrome.

## Light Frosted Dashboard Rules

- Day UI should read pearl, bone, fog, warm stone, and soft black.
- Data cards should be calm, compact, and bento-aware.
- Numbers use tabular alignment and restrained hierarchy.
- Glass is subtle: soft translucency, blur, hairline border, inner highlight.
- No cheap white boxes or uncontrolled card styles.

## Glass Card Rules

- Reuse `WidgetFrame`, `.glass`, `.wframe`, `.org-*`, `.pop-*`, `.saved-*`, `.pal-*`, and shared tokens.
- Panels use shared blur, border, shadow, radius, and inner highlight tokens.
- Focused and background widgets must expose readable depth through the existing
  stack: focused glass is clearer with a stronger edge/contact shadow; background
  glass is softer and more translucent, never simply dimmed.
- Day glass should remain in the approximate 0.40–0.62 surface-alpha range and
  night glass in the approximate 0.32–0.55 range unless readability requires a
  small exception. Large near-opaque cream rectangles are prohibited.
- Use `backdrop-filter` plus `-webkit-backdrop-filter`, and provide an opaque
  fallback only when backdrop filtering is unavailable.
- Floating cards must feel like one family across dock, rail, widgets, popovers, saved views, palette panels, and canvas edit popovers.
- New controls should extend the shared primitives before adding CSS.
- MovingBorder is an active/selected instrument primitive, not a default card frame.

## Selection Arc Rules

- Selection is a measurement marker, not a decorative ring.
- Use a partial arc, endpoint dots, neutral stroke, and small metadata chip.
- Use the moving border only for selected/edit-active cell emphasis; it must stay thin, pointer-transparent, and reduced-motion safe.
- Default tight selection stays compact.
- Halo and influence modes may scale, but must feel intentional.
- Void selection uses subtractive/hollow language in the same family.
- No red rings, thick strokes, dashed chaos, or cluttered metadata.

## Typography Rules

- UI type stays slim, precise, and editorial.
- Labels and readouts prefer tabular numerals where values compare.
- Avoid hero-sized type inside tools, widgets, panels, and chips.
- Use uppercase micro-eyebrows sparingly for system context.
- Keep letter spacing controlled; no negative tracking for small controls.

## Spacing / Density Rules

- Rail is a 40–46px icon-only launcher, not a tool panel. Labels live in accessible
  names and external shared-glass tooltips, not permanent section text.
- Dock is quick action, not a dashboard. It has no enclosing outer capsule: left
  and right glass islands flank open-canvas central actions.
- Widgets own details and should stay compact.
- Sliders stay single-line.
- Cards and chips should be dense but not cramped.
- Mobile 390 px is a hard fit target for dock, rail, widgets, and selection edit popovers.

## Color / Chrome Rules

- UI chrome is neutral graphite / pearl / smoke / bone / black / warm stone.
- Color is for spatial data, category mapping, palette material, organism material, selection content, and real warnings.
- Warning yellow/acid is semantic, never brand chrome.
- Red/wine remains product/palette material only, not rail/dock/widget/selection chrome.
- No random rainbow accents.

## Data Card Rules

- Future stat widgets should reuse widget primitives and shared micro-card styling.
- Data cards may include small charts, dot matrices, numeric badges, and compact metadata.
- Data cards should not become large SaaS dashboard tiles.
- Micro charts must support the canvas story instead of competing with it.

## Future Widget Rules

- Check `docs/COMPONENT_INVENTORY.md` before adding UI.
- Use `WidgetFrame`, `WidgetHost`, and shared controls from `src/ui/widgets/controls.tsx`.
- Keep dock/rail/widget/canvas ownership clean.
- New widget files are justified only when existing widgets cannot own the behavior.
- Future V6N.2/V7 work should apply this standard more aggressively to dock, rail, widgets, selection, and data cards.
- Every future V7 widget inherits V7.0B `WidgetFrame` depth/material and must not
  create an opaque card shell or its own stacking logic.
