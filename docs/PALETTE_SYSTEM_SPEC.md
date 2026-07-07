# V6F.0B — Palette System Spec

Status: planning only. No tokens or runtime palette files are created in this phase.

## Purpose

The palette system separates organism style from color palette. Style controls the rendering behavior; palette controls color relationships, highlights, warning colors, and category influence.

Future file recommendation:

```text
src/design/palettes.ts
```

This file should export palette metadata, not hard-coded UI behavior. CSS tokens remain the final surface for implementation.

## Reference-Driven Direction

The `assets/references/01` images point toward a monochrome base with selective surreal accents. Production UI should stay grounded in cream, white, grey, graphite, near-black, and wine/red identity tones, then reserve gradients for meaningful emphasis.

- Monochrome base: most chrome, rails, popovers, labels, and inspectors stay grey/black/white/cream.
- Surreal accent gradients: allowed for active style chips, organism experiments, selected modes, metric interiors, warnings, and export/premium moments.
- Dark active buttons: high-importance actions such as `+ NUCLEUS`, selected organism style, export, and advanced toggles may use dark gradient depth.
- Muted high-end UI shades: prefer ash, graphite, fog, bone, oxblood, steel, and softened spectral accents over saturated rainbow UI.
- Avoid random color usage: colors must communicate state, category, warning, selection, palette, or organism material.

## Style Modes

Current selectable options:
- Cellular Reverse
- Plain Black
- Plain White
- Graphite
- Wine
- Auto

Future options:
- Melted Metal
- Ink
- Carbon
- Clay
- X-Ray
- Blueprint
- Gradient Field
- Glass
- Smoke
- Technical Wire

Rule: never replace styles destructively. Every new visual experiment becomes an option or preset so the user can choose later.

## Palette Groups

### Core

| Palette | Use case | Light behavior | Dark behavior | Active/highlight | Warning | Selected nucleus | Organism fill suggestion |
|---|---|---|---|---|---|---|---|
| Black Bone | Default organism identity | black on cream | bone on near-black | wine/red accent | muted yellow | thin red/ink ring | black or bone |
| Graphite | Quiet professional mode | graphite body | lifted graphite body | steel/white | muted yellow | graphite + red dot | graphite |
| Wine | Graph Noir identity | deep wine body | oxblood/wine body | red/wine | muted yellow | wine ring | wine |
| Ivory | Soft review mode | ivory body on ink accents | ivory on dark | graphite/red | muted yellow | graphite ring | ivory/bone |
| Ash | Neutral technical mode | ash grey body | ash grey body | black/red | muted yellow | dark grey ring | ash/grey |

### Surreal

| Palette | Use case | Light behavior | Dark behavior | Active/highlight | Warning | Selected nucleus | Organism fill suggestion |
|---|---|---|---|---|---|---|---|
| Oil Slick | Premium experimental previews | restrained iridescent accents | deeper iridescent accents | blue-green/red | yellow | chromatic rim | subtle gradient field |
| Deep Signal | High-contrast signal mode | dark accents on cream | luminous signal on black | cyan/red | yellow | signal ring | dark field |
| Muted Plasma | Controlled colorful organism | low-sat plasma | low-sat neon-plasma | magenta/red | yellow | plasma rim | gradient field |
| Burnt Clay | Warm architectural mood | clay/rust accents | burnt clay on graphite | clay/red | yellow | clay ring | clay body |
| Toxic Moss | Warning/analysis mood | moss accents only | moss on black | moss/red | yellow | moss dot | moss-tinted field |
| Dusk Violet | Dark editorial mood | violet grey accents | deep violet accents | violet/red | yellow | violet ring | violet graphite |
| Acid Moss | Strong warning aesthetic | acid only for focus | acid only for focus | acid/red | yellow | acid handle | dark with acid accents |
| Infra Red | Analysis scan mode | red infrared accents | red infrared glow | red | yellow/red | infrared ring | black/red gradient |
| Shadow Blue | Technical blueprint-adjacent | blue grey accents | dark blue grey | blue/red | yellow | blue ring | graphite-blue |

### Architecture

| Palette | Use case | Light behavior | Dark behavior | Active/highlight | Warning | Selected nucleus | Organism fill suggestion |
|---|---|---|---|---|---|---|---|
| Public | Category tint | soft public tint | dim public tint | red | yellow | public ring | category-influenced |
| Semi-public | Category tint | soft shared tint | dim shared tint | red | yellow | shared ring | category-influenced |
| Private | Category tint | muted private tint | dim private tint | red | yellow | private ring | category-influenced |
| Service | Category tint | utility-neutral | utility-dark | red | yellow | service ring | category-influenced |
| Circulation | Category tint | movement tint | movement-dark | red | yellow | circulation ring | category-influenced |
| Utility | Category tint | utility tint | utility-dark | red | yellow | utility ring | category-influenced |
| Retail | Category tint | commercial tint | commercial-dark | red | yellow | retail ring | category-influenced |
| Outdoor | Category tint | landscape tint | landscape-dark | red | yellow | outdoor ring | category-influenced |
| Admin | Category tint | admin tint | admin-dark | red | yellow | admin ring | category-influenced |
| Cultural | Category tint | cultural tint | cultural-dark | red | yellow | cultural ring | category-influenced |
| Education | Category tint | education tint | education-dark | red | yellow | education ring | category-influenced |
| Hospitality | Category tint | hospitality tint | hospitality-dark | red | yellow | hospitality ring | category-influenced |

Architecture palettes should align with `DEFAULT_CATEGORIES` later instead of inventing a separate taxonomy.

## Token Location

Recommended layering:
- `src/styles/tokens.css`: canonical CSS tokens for surfaces, text, red, warning, grid, glass.
- `src/design/palettes.ts`: palette metadata and semantic slots.
- Renderer style config: maps palette slots to WebGL uniforms.
- UI components: consume semantic CSS vars, not raw palette internals.

Do not add exact hex values until implementation, except where existing tokens already define the color.

## Gradient Rules

Allowed:
- Add Nucleus main button
- Active style chip
- Selected organism mode
- Export action
- Warning widget
- Premium/advanced toggle
- Metric widget internals
- Organism category blend

Avoid:
- Every button
- Random decoration
- Low-importance controls
- Full-page colorful chrome
- Palette noise that competes with data

## Highlight Rules

- Red/wine stays the identity and active emphasis.
- Muted yellow is warning-only.
- Selection should be visible without creating red halo spam.
- Category colors should influence labels, dots, rings, and future field accents before taking over the entire organism.
- In dark mode, highlights must remain crisp but not neon.

## Style And Palette Relationship

Examples:
- Cellular Reverse + Black Bone: default production organism.
- Plain Black + Core palettes: review mode.
- Graphite + Architecture palettes: technical programming mode.
- Gradient Field + Surreal palettes: optional future visual exploration.
- Blueprint + Architecture palettes: future technical export/review view.

The style panel chooses rendering behavior; the palette panel chooses color language.
