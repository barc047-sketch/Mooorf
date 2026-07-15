# Palette and Material Curation

This document presents the curated production shortlist for the MOOORF spatial color and material systems. It implements a disciplined editorial visual grammar, limiting color volume to prevent cheap/neon interfaces while protecting accessibility and design clarity.

---

## 1. Neutral UI Design Rule

MOOORF adheres to a strict editorial layout language:
- **Global UI Shell**: Limited entirely to white, black, grey, and glass/frosted-backdrop filters.
- **Accents**: Restricted to MOOORF red (`#c31616`) for active system states, errors, or critical alerts.
- **Color Boundaries**: Cell and membrane colors must never bleed into the panels, title bars, or tool rails, ensuring a clear visual separation between the canvas viewport and spatial controls.

---

## 2. Essential Cell (Nucleus) Palettes Shortlist

These curated palettes determine individual Cell filled surfaces, boundaries, core dots, and label text backgrounds.

### Black Bone (`black-bone`)
* **ID**: `palette:black-bone`
* **Group**: `core`
* **Architectural Use**: Default monochrome scale for structural grids and structural plan components.
* **Day / Night Behavior**: Spans `#f4f2e9` (light clay) to `#0c0c0c` (deep ink).
* **Pairing**: Pairs perfectly with the `ink` and `core-field` membrane modes.
* **Contrast / Accessibility**: Exceptionally safe. High contrast across all shades.
* **Risks**: None.
* **Status**: **ESSENTIAL**

### Graphite Fog (`graphite-fog`)
* **ID**: `palette:graphite-fog`
* **Group**: `monochrome`
* **Architectural Use**: Quiet grey values for service zones, back-of-house utility plans, or backing outlines.
* **Day / Night Behavior**: Slate grays that shift cleanly with theme luminance.
* **Pairing**: Pairs with the `graphite` membrane.
* **Contrast / Accessibility**: Safe. Complies with WCAG AA targets when paired with auto-contrast text.
* **Risks**: Can look cold or clinical if used globally.
* **Status**: **ESSENTIAL**

### Architecture Warm (`architecture-warm`)
* **ID**: `palette:architecture-warm`
* **Group**: `warm`
* **Architectural Use**: Terracotta, ochre, and warm clay tones for public, residential, and dining zones.
* **Day / Night Behavior**: Spans `#efe2d2` to `#33201a`.
* **Pairing**: Pairs with `umber` or `core-field` membranes.
* **Contrast / Accessibility**: Requires Auto Contrast for text on darker terracotta tiles.
* **Risks**: Muddy blending if layered with cool slate-blue accents.
* **Status**: **ESSENTIAL**

### Architecture Cool (`architecture-cool`)
* **ID**: `palette:architecture-cool`
* **Group**: `cool`
* **Architectural Use**: Steel, water-adjacent, and service-shaft blue-grey tones.
* **Day / Night Behavior**: Spans `#dbe0e1` to `#161d24`.
* **Pairing**: Pairs with `slate-blue` membrane.
* **Contrast / Accessibility**: High readability. Text contrasts cleanly.
* **Risks**: None.
* **Status**: **ESSENTIAL**

### Sage & Stone (`sage-stone`)
* **ID**: `palette:sage-stone`
* **Group**: `architecture`
* **Architectural Use**: Landscape plans, garden walkways, courtyards, and exterior site furniture.
* **Day / Night Behavior**: Soft sage greens that blend into dark night grounds.
* **Pairing**: Pairs with the `sage` membrane.
* **Contrast / Accessibility**: Excellent distinction from architectural cool/warm scales.
* **Risks**: Lower saturation makes it easily overwhelmed by bright red accents.
* **Status**: **ESSENTIAL**

### Oxblood Editorial (`oxblood-editorial`)
* **ID**: `palette:oxblood-editorial`
* **Group**: `editorial`
* **Architectural Use**: Highlights, selected focus cells, fire escape stairs, and primary entrance lobbies.
* **Day / Night Behavior**: Deep maroon/brand red values.
* **Pairing**: Pairs with `wine` or `ink` membranes.
* **Contrast / Accessibility**: Dark shades require white text; light shades require black text.
* **Risks**: Avoid over-use; redundant red zones dilute focus.
* **Status**: **ESSENTIAL**

### Clay & Porcelain (`clay-porcelain`)
* **ID**: `palette:clay-porcelain`
* **Group**: `warm`
* **Architectural Use**: Craft, residential living areas, and luxury hotel suites.
* **Day / Night Behavior**: Spans `#efe4d8` to `#241b16`.
* **Pairing**: Pairs with `porcelain` or `umber` membranes.
* **Contrast / Accessibility**: Clean, soft contrast.
* **Risks**: Can appear low-contrast on standard cream backdrops if opacity is low.
* **Status**: **ESSENTIAL**

---

## 3. Essential Membrane Palettes & Material Shortlist

These specify the color mapping of the unified implicit-field organism background.

### Core Field (`core-field`)
* **ID**: `organism:core-field`
* **Architectural Use**: Standard high-contrast editorial floor plan style.
* **Day / Night Behavior**: Day: body `#131313` on `#f5f6ee` ground | Night: body `#ededea` on `#070707`.
* **Contrast / Accessibility**: Highest level of readability. Ideal for professional drawings.
* **Status**: **ESSENTIAL**

### Ink (`ink`)
* **ID**: `organism:ink`
* **Architectural Use**: Solid deep black technical drawing layout.
* **Day / Night Behavior**: Body `#0c0c0c` in both themes. Ground matches theme.
* **Contrast / Accessibility**: High, crisp contrast. Text labels auto-invert to white on top of the ink body.
* **Status**: **ESSENTIAL**

### Porcelain (`porcelain`)
* **ID**: `organism:porcelain`
* **Architectural Use**: Reversed light organism body on dark ground. Excellent for presentations.
* **Day / Night Behavior**: Body `#f4f2e9` on `#101010` ground.
* **Contrast / Accessibility**: High readability. Requires dark grey text on the porcelain surface.
* **Status**: **ESSENTIAL**

### Graphite (`graphite`)
* **ID**: `organism:graphite`
* **Architectural Use**: Muted gray professional base for technical overlays.
* **Day / Night Behavior**: Day: body `#2f2f31` on `#f5f6ee` | Night: body `#47474b` on `#0a0a0b`.
* **Contrast / Accessibility**: Clean neutral backdrop that makes colorful symbols pop.
* **Status**: **ESSENTIAL**

### Wine (`wine`)
* **ID**: `organism:wine`
* **Architectural Use**: Brand identity styling and client-facing presentation layouts.
* **Day / Night Behavior**: Day: body `#421015` on `#f5f4ec` | Night: body `#5a1119` on `#080607`.
* **Contrast / Accessibility**: Solid brand contrast.
* **Status**: **ESSENTIAL**

### Sage (`sage`)
* **ID**: `organism:sage`
* **Architectural Use**: Landscape layout integration and ecological park mapping.
* **Day / Night Behavior**: Day: body `#303432` on `#f3f4ec` | Night: body `#4c5550` on `#070808`.
* **Contrast / Accessibility**: Softer contrast; best for natural light studies.
* **Status**: **ESSENTIAL**

### Category Blend (`category-blend`)
* **ID**: `organism:category-blend`
* **Architectural Use**: Dynamic field mapping that blends colors based on localized cell programs (public, private, services).
* **Day / Night Behavior**: Blends colors at the fragment shader level.
* **Contrast / Accessibility**: Complex. Relies on auto-contrast routines for overlapping text.
* **Status**: **ESSENTIAL** (GPU-bound dynamic mode)

---

## 4. Pairing and Safety Rules

### Muddy Merging Warnings
Do not combine warm terracotta cell fills with cool blue-grey membranes. This causes muddy brown blending regions in the spatial mixing zones of the shader.

### Excessive Saturation Guard
Never pair neon accents with low-saturation backgrounds. All colors must remain within the authored luxury muted scales.

### Color-Blind Safe Zones
Program cell types must use double-encoding:
- **Hue**: Distinguish zones using colors.
- **Symbol / Label**: Always label structural columns (`icon:structural:column`) and spaces to ensure screen-reader and color-blind utility.

### Contrast Thresholds
Auto-contrast calculations (`resolveCellAppearance.ts`) must enforce a minimum contrast ratio of `4.5:1` (WCAG AA). If a cell fill color's luminance drops below `0.18` (standard threshold), text color must automatically flip to bone (`#f4f2e9`).
