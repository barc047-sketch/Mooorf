# Visual Preset Recipes

This document details the visual preset recipes designed for the MOOORF spatial canvas. These configurations leverage existing shader uniforms, CPU simulation variables, and curated palette/material IDs to provide instant plan drafting styles.

---

## 1. Technical Diagram
* **Intended Use**: Accurate architectural floor plan drafting and dimensioning.
* **Palette Bindings**:
  - Cell Palette: `black-bone` (Monochrome)
  - Membrane Material: `system:ink` (Solid black-ink contour)
* **Shader Parameters**:
  - `uMass`: `1.0`
  - `uIso`: `1.2` (Tight contours)
  - `uSoftness`: `0.005` (Crisp edge)
  - `uTension`: `1.4` (Separate cell intersections)
  - `uBias`: `0.0` (Zero corridor reach)
* **Shadow State**: `Off` (`uShadowEnabled = 0.0`)
* **Motion State**: `Off` (Static geometry)
* **Power-Gate Expectations**:
  - Motion loop is fully paused (0 Hz).
  - Shadow uniform lookup is bypassed.
  - Edge glow shaders are disabled.
* **Day / Night Variation**:
  - Day: Ink boundaries on cream canvas.
  - Night: Bone white boundaries on charcoal canvas.
* **Export Fallback**: Pure vector path shapes.
* **Performance Tier**: Low (Very light GPU load)
* **Exposing Milestone**: `M2 review-only` (as baseline) / `M4 preset`

---

## 2. Soft Organism
* **Intended Use**: Artistic and organic spatial planning presentations.
* **Palette Bindings**:
  - Cell Palette: `editorial-aurora` (Soft blush/peach)
  - Membrane Material: `organism:core-field` (Standard blended background)
* **Shader Parameters**:
  - `uMass`: `1.1`
  - `uIso`: `0.95`
  - `uSoftness`: `0.08` (Feathered edge glow)
  - `uTension`: `0.8` (Smooth melting joints)
  - `uBias`: `0.5` (Wide blending corridors)
* **Shadow State**: `Soft` (`uShadowOpacity = 0.45`, `uShadowSoftness = 0.08`, `uShadowSpread = 0.0`)
* **Motion State**: `On` (`timeScale: 1.0`, `drift: 0.2`, `breathing: 0.15`, `wobble: 0.0`)
* **Power-Gate Expectations**: Full render loops active; continuously calculates CPU sat offsets and GPU contours.
* **Day / Night Variation**: Day: Pastels on bone ground | Night: Muted purples on charcoal.
* **Export Fallback**: Rasterized canvas snapshot overlay.
* **Performance Tier**: Medium
* **Exposing Milestone**: `M4 preset`

---

## 3. Dense Tissue
* **Intended Use**: Complex master plans representing packed urban density.
* **Palette Bindings**:
  - Cell Palette: `oxblood-editorial` (Deep contrast reds)
  - Membrane Material: `organism:wine` (Deep brand maroon)
* **Shader Parameters**:
  - `uMass`: `1.4` (Thick merging)
  - `uIso`: `0.8`
  - `uSoftness`: `0.03`
  - `uTension`: `0.6` (Heavy melting)
  - `uBias`: `0.7`
* **Shadow State**: `Defined` (`uShadowOpacity = 0.6`, `uShadowOffset = [0.03, 0.03]`, `uShadowSpread = 0.02`)
* **Motion State**: `On` (`timeScale: 0.7`, `drift: 0.1`, `breathing: 0.35`, `wobble: 0.1`)
* **Power-Gate Expectations**: Full GPU simulation running.
* **Day / Night Variation**: Shakes and breathes slowly with heavy mass adjustments.
* **Export Fallback**: Rasterized SVG texture.
* **Performance Tier**: Medium
* **Exposing Milestone**: `M4 preset`

---

## 4. Editorial Blob
* **Intended Use**: Premium branding and print-focused marketing assets.
* **Palette Bindings**:
  - Cell Palette: `oxblood-editorial`
  - Membrane Material: `organism:wine`
* **Shader Parameters**:
  - `uMass`: `1.25`
  - `uIso`: `1.0`
  - `uSoftness`: `0.015`
  - `uTension`: `0.9`
  - `uBias`: `0.45`
* **Shadow State**: `Soft` (`uShadowOpacity = 0.3`)
* **Motion State**: `Off`
* **Power-Gate Expectations**: Motion loops paused. Shadow pass active.
* **Day / Night Variation**: Day: Rich crimson on cream.
* **Export Fallback**: Vector contours with high-resolution shadow filters.
* **Performance Tier**: Low
* **Exposing Milestone**: `M4 preset`

---

## 5. Static Presentation
* **Intended Use**: Formal client boards and gallery layouts.
* **Palette Bindings**:
  - Cell Palette: `clay-porcelain` (Warm neutral)
  - Membrane Material: `organism:porcelain` (Reversed light body)
* **Shader Parameters**:
  - `uMass`: `1.05`
  - `uIso`: `1.0`
  - `uSoftness`: `0.02`
  - `uTension`: `1.0`
  - `uBias`: `0.35`
* **Shadow State**: `Defined` (`uShadowOpacity = 0.5`)
* **Motion State**: `Off`
* **Power-Gate Expectations**: Bypasses CPU motion simulation.
* **Day / Night Variation**: Day: Bone white cells on dark charcoal canvas.
* **Export Fallback**: Vector SVG paths.
* **Performance Tier**: Low
* **Exposing Milestone**: `M4 preset`

---

## 6. High-Performance / Large Project
* **Intended Use**: Working in heavy files with >100 space cells.
* **Palette Bindings**:
  - Cell Palette: `graphite-fog`
  - Membrane Material: `organism:graphite` (Bypassed)
* **Shader Parameters**:
  - Bypassed (Organism field calculations are fully gated Off)
* **Shadow State**: `Off`
* **Motion State**: `Off`
* **Power-Gate Expectations**:
  - **Membrane Off**: Bypasses GPU contour rendering loops.
  - **Motion Off**: Pauses continuous frame updates.
  - **Shadow Off**: Bypasses shadow computations.
* **Day / Night Variation**: Default flat wireframe layout.
* **Export Fallback**: High-speed, lightweight standard SVG vector outlines.
* **Performance Tier**: Low (Highly optimized; canvas sleeps when idle)
* **Exposing Milestone**: `M2 review-only` / `M4 preset`

---

## 7. Monochrome Print
* **Intended Use**: Black and white architectural submission documents.
* **Palette Bindings**:
  - Cell Palette: `black-bone`
  - Membrane Material: `system:ink` (Disabled for flat print)
* **Shader Parameters**:
  - Bypassed (Rendered as flat vectors)
* **Shadow State**: `Off`
* **Motion State**: `Off`
* **Power-Gate Expectations**: Bypasses all shader passes.
* **Day / Night Variation**: Ink outlines on absolute white paper.
* **Export Fallback**: Standard CAD vector files.
* **Performance Tier**: Low
* **Exposing Milestone**: `M2 review-only` / `M4 preset`

---

## 8. Category Gradient
* **Intended Use**: Dynamic plan showing color-blended functional programming.
* **Palette Bindings**:
  - Cell Palette: `auto` (Category-derived hues)
  - Membrane Material: `organism:category-blend` (Interpolated spatial blending)
* **Shader Parameters**:
  - `uMass`: `1.1`
  - `uIso`: `1.0`
  - `uSoftness`: `0.025`
  - `uTension`: `1.0`
  - `uBias`: `0.4`
* **Shadow State**: `Soft` (`uShadowOpacity = 0.25`)
* **Motion State**: `On` (`drift: 0.15`, `breathing: 0.2`, `wobble: 0.05`)
* **Power-Gate Expectations**: Full render loops active; utilizes localized CPU spatial weight updates.
* **Day / Night Variation**: Blends vibrant hues (ochre for public, slate for wet services) smoothly.
* **Export Fallback**: Rasterized SVG.
* **Performance Tier**: High (Per-pixel GPU iteration over positive nuclei)
* **Exposing Milestone**: `M4 preset`

---

## 9. Privacy Study
* **Intended Use**: Highlighting public vs. private zone separation.
* **Palette Bindings**:
  - Cell Palette: `medical-clean`
  - Membrane Material: `organism:slate-blue`
* **Shader Parameters**:
  - `uMass`: `1.1`
  - `uIso`: `1.05`
  - `uSoftness`: `0.02`
  - `uTension`: `1.1`
  - `uBias`: `0.3`
* **Shadow State**: `Off`
* **Motion State**: `Off`
* **Power-Gate Expectations**: Motion loop paused.
* **Day / Night Variation**: Clear separation of slate-blue privacy borders.
* **Export Fallback**: Solid vector shapes.
* **Performance Tier**: Low
* **Exposing Milestone**: `M4 preset`
