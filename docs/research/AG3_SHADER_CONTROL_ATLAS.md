# Shader Control Atlas

This document details the mapping of MOOORF's raw fragment shader and CPU simulation parameters into user-facing controls for the one-Inspector visual workflow. It serves as the visual reference to prevent arbitrary parameter additions and ensure performant rendering with clear architectural ownership.

---

## 1. Core Field Parameters

### Mass / Influence
* **Canonical Uniform / State**: `uMass` (float) / `params.mass` (OrganismSettings)
* **Visual Effect**: Scales the overall field potential. Visually grows or shrinks the merged organism field thickness across all cells.
* **Recommended Range / Step**: Min: `0.4`, Default: `1.04`, Max: `2.2` | Step: `0.01`
* **Control Type**: Slider (Advanced disclosure)
* **Interactions**: Highly coupled with `uIso` (Iso Level) and cell radii. Increasing mass makes satellites merge at larger physical distances.
* **Dangerous Combinations**: If combined with high `uTension` (surface tension) and low `uIso`, the field can overflow screen bounds or create jagged artifact boundaries.
* **Performance Tier**: Low (Standard float uniform)
* **Visibility**: Advanced
* **Day/Night Implications**: None
* **Export Behavior**: Evaluated in Canvas2D / SVG export boundary path generation.
* **Off State Behavior**: None (System-critical uniform; cannot be disabled)
* **Acceptance Observation**: Drag slider; observe smooth, fluid growth of the unified membrane without individual cell center displacement.

### Iso Threshold / Level
* **Canonical Uniform / State**: `uIso` (float) / `params.isoLevel` (OrganismSettings)
* **Visual Effect**: The threshold contour value that defines the edge of the visible membrane body.
* **Recommended Range / Step**: Min: `0.4`, Default: `1.0`, Max: `2.0` | Step: `0.01`
* **Control Type**: Slider (Advanced disclosure)
* **Interactions**: Inverse relationship with Mass. Increasing Iso level shrinks the visible boundary.
* **Dangerous Combinations**: Setting Iso level higher than the maximum accumulated field strength causes the organism to completely disappear.
* **Performance Tier**: Low
* **Visibility**: Advanced
* **Day/Night Implications**: None
* **Export Behavior**: Used directly in the march-contour math for exporting vector boundary paths.
* **Off State Behavior**: None
* **Acceptance Observation**: Slide Iso higher; observe the organism body contracting and splitting into separate cells around their nuclei.

### Field Edge Softness / Body Feather
* **Canonical Uniform / State**: `uSoftness` (float) / `params.edgeSoftness` (OrganismSettings)
* **Visual Effect**: Sets the width of the smoothstep edge transition, acting as an artistic blur/feather on the outer membrane body.
* **Recommended Range / Step**: Min: `0.004`, Default: `0.02`, Max: `0.3` | Step: `0.002`
* **Control Type**: Slider (Basic UI)
* **Interactions**: Combined with `uMembraneEdgeWidth` in the shader to scale the visual edge band.
* **Dangerous Combinations**: High softness (> 0.25) with low mass creates a ghostly, barely visible mist instead of a defined floor plan.
* **Performance Tier**: Low
* **Visibility**: Basic
* **Day/Night Implications**: Requires higher opacity in day mode to stand out against light backgrounds.
* **Export Behavior**: Exported as an SVG gradient filter fallback; rasterized if high-fidelity soft glow is required.
* **Off State Behavior**: None
* **Acceptance Observation**: Increasing softness feathers the membrane edge into a beautiful, organic glow; lower values yield crisp vector-like outlines.

### Surface Tension
* **Canonical Uniform / State**: `uTension` (float) / `params.surfaceTension` (OrganismSettings)
* **Visual Effect**: Alters the kernel core clamp power (`pow(core, uTension)`). Controls the sharpness of fusion joints when cells merge.
* **Recommended Range / Step**: Min: `0.5`, Default: `1.0`, Max: `1.7` | Step: `0.01`
* **Control Type**: Slider (Advanced disclosure)
* **Interactions**: Higher tension prevents long-range blending, making merging cells look like separate circular bubbles stuck together.
* **Dangerous Combinations**: Tension < 0.5 causes extreme melting, warping cells into long, unnatural lines.
* **Performance Tier**: Medium (GPU pow calculation per nucleus)
* **Visibility**: Advanced
* **Day/Night Implications**: None
* **Export Behavior**: Maps directly into contour calculations.
* **Off State Behavior**: None
* **Acceptance Observation**: Slide tension to 1.6; observe the gooey bridges between cells thinning out, leaving sharp cusp intersections.

### Connection Bias
* **Canonical Uniform / State**: `uBias` (float) / `params.connectionBias` (OrganismSettings)
* **Visual Effect**: Multiplies the long-range tail attraction force. Increases the "reach" or eager bridging of distant cells.
* **Recommended Range / Step**: Min: `0.0`, Default: `0.37`, Max: `1.0` | Step: `0.01`
* **Control Type**: Slider (Basic UI - mapped to the Dock "Reach" control)
* **Interactions**: Directly offsets the raw `mergeDistance` CPU parameter.
* **Dangerous Combinations**: High bias combined with high mass merges cells across the entire drawing, losing spatial structure.
* **Performance Tier**: Low
* **Visibility**: Basic (via "Reach")
* **Day/Night Implications**: None
* **Export Behavior**: Contributes to contour generation.
* **Off State Behavior**: None
* **Acceptance Observation**: Drag reach/bias slider; watch distant cells reach out and join together with thin organic corridors.

---

## 2. Pocket and Inner-Field Behavior

### Pocket Threshold / Cellular Voids
* **Canonical Uniform / State**: `uPocketIso` (float) / `params.pocketThreshold` (OrganismSettings)
* **Visual Effect**: Opens hollow "pockets" or voids in the interior of the organism where field values stack highest (center of dense cell clusters).
* **Recommended Range / Step**: Min: `2.0`, Default: `7.8`, Max: `14.0` | Step: `0.05`
* **Control Type**: Slider (Advanced disclosure)
* **Interactions**: Requires `uPocketAmount` to be non-zero to show any effect.
* **Dangerous Combinations**: Low threshold (< 3.0) with high pocket amount carves out the entire center of cells, leaving only a thin ring.
* **Performance Tier**: Low
* **Visibility**: Advanced (Only shown under "Pockets" segment in Appearance tab)
* **Day/Night Implications**: Day mode reveals background grid through pockets; night mode reveals dark void underlay.
* **Export Behavior**: Exported as subtractive inner paths inside the cell cluster SVG shape.
* **Off State Behavior**: Mapped to `uPocketAmount = 0.0`. Skip pocket calculations when disabled.
* **Acceptance Observation**: Slide pocket threshold down; watch circular hollow spaces bloom inside dense cell clusters.

### Pocket Softness / Feather
* **Canonical Uniform / State**: `uPocketSoft` (float) / `params.pocketSoftness` (OrganismSettings)
* **Visual Effect**: Feathers the inner edges of the cellular pockets.
* **Recommended Range / Step**: Min: `0.05`, Default: `0.48`, Max: `2.5` | Step: `0.01`
* **Control Type**: Slider (Advanced disclosure)
* **Interactions**: Direct counterpart to `uSoftness` for pockets.
* **Dangerous Combinations**: High softness washes out small pockets completely.
* **Performance Tier**: Low
* **Visibility**: Advanced
* **Day/Night Implications**: None
* **Export Behavior**: SVG gradient mask fallback.
* **Off State Behavior**: None
* **Acceptance Observation**: Slide softness up; watch pocket inner boundaries transition from sharp stencil cuts to smooth smoke rings.

---

## 3. Membrane & Colour Systems

### Membrane Opacity
* **Canonical Uniform / State**: `uMembraneOpacity` (float) / `defaults.membrane.paint.opacity` (PresentationDefaults)
* **Visual Effect**: Global transparency of the membrane field surface.
* **Recommended Range / Step**: Min: `0.0`, Default: `1.0`, Max: `1.0` | Step: `0.05`
* **Control Type**: Slider (Basic UI)
* **Interactions**: At 0.0, the membrane is invisible (revealing cells and canvas background).
* **Dangerous Combinations**: Low opacity values (< 0.2) make it hard to distinguish edge colors.
* **Performance Tier**: Low
* **Visibility**: Basic
* **Day/Night Implications**: In day mode, lower opacity helps maintain grid visibility.
* **Export Behavior**: Mapped to SVG fill opacity.
* **Off State Behavior**: **Power Gated**. When `defaults.membrane.visible = false`, the entire membrane rendering pass (fields, palettes, color mixing) is skipped.
* **Acceptance Observation**: Toggle visible switch; watch the entire colored blob instantly vanish or fade cleanly.

### Membrane Edge Width
* **Canonical Uniform / State**: `uMembraneEdgeWidth` (float) / `defaults.membraneEdge.width` (PresentationDefaults)
* **Visual Effect**: Thickens the colored boundary stroke around the outer membrane contours.
* **Recommended Range / Step**: Min: `0.5`, Default: `1.0`, Max: `12.0` | Step: `0.5`
* **Control Type**: Slider (Basic UI)
* **Interactions**: Multiplied by fragment edge thickness.
* **Dangerous Combinations**: Edge widths > 10.0 over-saturate small cells, filling their interior entirely with the accent color.
* **Performance Tier**: Low
* **Visibility**: Basic
* **Day/Night Implications**: None
* **Export Behavior**: Maps to SVG stroke-width.
* **Off State Behavior**: **Power Gated**. When `defaults.membraneEdge.visible = false`, `uMembraneEdgeOpacity` is set to `0.0`, and edge shader projection math is bypassed.
* **Acceptance Observation**: Slide width up; see the outer silhouette stroke thicken, highlighting the unified plan boundary.

### Proposed independent Membrane Edge Softness
* **Canonical Uniform / State**: `uMembraneEdgeSoftness` (Proposed float uniform) / `defaults.membraneEdge.softness` (Proposed)
* **Visual Effect**: Separately blurs or glows the contour edge stroke independently of the main body field softness.
* **Recommended Range / Step**: Min: `0.0`, Default: `0.0`, Max: `0.5` | Step: `0.01`
* **Control Type**: Slider (Advanced disclosure)
* **Interactions**: Highly dependent on `uMembraneEdgeWidth`.
* **Technical Blockers**: The current fragment shader (`organism-frag`) lacks a separate uniform or calculation for edge-only smoothstepping, causing edge softness to mirror main body softness.
* **Visibility**: **Deferred** to M3 (documented as a future enhancement).
* **Export Behavior**: Rasterized SVG neon glow filter.
* **Off State Behavior**: Skips edge blur when 0.

### Spatial Cell-Gradient Dominance
* **Canonical Uniform / State**: `uSpatialColorMix` (float) / `defaults.membrane.colourMode` (Zustand context)
* **Visual Effect**: Blends the unified membrane body color between the global palette body color and individual localized cell core colors.
* **Recommended Range / Step**: Min: `0.0` (Solid Global), Default: `1.0` (Full Local Gradient), Max: `1.0` | Step: `0.1` (Or toggle switch)
* **Control Type**: Switch or Slider (Basic UI)
* **Interactions**: Local color is derived from `spatialColorAt()` in the fragment shader.
* **Dangerous Combinations**: None.
* **Performance Tier**: High (Requires iterating over all positive nuclei to compute spatial weight vectors per pixel)
* **Visibility**: Basic
* **Day/Night Implications**: None.
* **Export Behavior**: Falls back to SVG linear/radial gradients or rasterized canvas overlays.
* **Off State Behavior**: When set to solid mode (`0.0`), spatial color weight iteration is skipped in the shader logic.
* **Acceptance Observation**: Toggle colour mode; watch the organism blend from a solid slate grey into a vibrant multi-colored cellular tapestry.

---

## 4. Cell Shadow Parameters

### Cell Shadow Opacity
* **Canonical Uniform / State**: `uShadowOpacity` (float) / `o.shadowOpacity` (OrganismSettings)
* **Visual Effect**: Controls the visibility/strength of the simulated drop shadow under the membrane.
* **Recommended Range / Step**: Min: `0.0`, Default: `0.35`, Max: `1.0` | Step: `0.05`
* **Control Type**: Slider (Basic UI - via "Shadow Strength")
* **Interactions**: Coupled with `uShadowSoftness` and offsets.
* **Dangerous Combinations**: None.
* **Performance Tier**: Low
* **Visibility**: Basic
* **Day/Night Implications**: Night mode requires lower opacity (`0.15`) and darker hues to prevent a cheap glowing effect.
* **Export Behavior**: Recreated in SVG using standard `<feDropShadow>` filters.
* **Off State Behavior**: **Power Gated**. When shadow is set to `Off`, `uShadowEnabled` is set to `0.0`, skipping the entire shadow lookup and smoothstep calculation in the fragment shader.
* **Acceptance Observation**: Toggle shadow to Off; observe immediately crisp background grids and flat visual styling.

### Cell Shadow Softness, Offsets & Spread
* **Canonical Uniforms**: `uShadowSoftness` (float), `uShadowOffset` (vec2), `uShadowSpread` (float)
* **Visual Effects**:
  - `uShadowSoftness`: Blurs the shadow outline edge.
  - `uShadowOffset`: Shifts the shadow in screen-space X/Y to simulate light angles.
  - `uShadowSpread`: Expands or contracts the shadow profile.
* **Recommended Ranges**:
  - Softness: Min `0.0`, Default `0.05`, Max `0.2` | Step `0.01`
  - Offset X/Y: Min `-0.1`, Default `0.02`, Max `0.1` | Step `0.005`
  - Spread: Min `-0.05`, Default `0.0`, Max `0.05` | Step `0.002`
* **Control Type**: Sliders grouped under Advanced disclosure.
* **Performance Tier**: Low.
* **Visibility**: Advanced.
* **Export Behavior**: Exported directly into SVG shadow filter parameters.
* **Acceptance Observation**: Drag offset sliders; watch the shadow slide behind the organism, creating a striking glassmorphic depth effect.

---

## 5. CPU Motion & Simulation Parameters

### Time Scale / Speed
* **Canonical State**: `params.timeScale` / `state.time` accumulator
* **Visual Effect**: Speeds up or slows down the continuous idle wobble, breathing, and drift simulations.
* **Recommended Range / Step**: Min: `0.0` (Pause), Default: `1.0`, Max: `2.5` | Step: `0.05`
* **Control Type**: Slider (Basic UI)
* **Performance Tier**: Low (CPU multiplier)
* **Visibility**: Basic
* **Off State Behavior**: **Power Gated**. When set to `0.0` or when Motion is disabled, the requestAnimationFrame loop pauses advancement, leaving the canvas idle.
* **Acceptance Observation**: Slide to 0; watch all pulsing and wobbling freeze instantly.

### Response / Smoothing Rate
* **Canonical State**: `params.response` (smoothing coefficient)
* **Visual Effect**: Controls the follow delay (inertia) when drag-moving cells. High response yields snappy following; low response creates laggy, organic fluid drag trails.
* **Recommended Range / Step**: Min: `1.0`, Default: `6.0`, Max: `18.0` | Step: `0.1`
* **Control Type**: Slider (Advanced disclosure)
* **Performance Tier**: Low
* **Visibility**: Advanced
* **Acceptance Observation**: Drag a cell with response at `2.0`; watch it float gracefully behind the cursor with strong lag, slowly settling back to its home node.

### Drift, Breathing & Wobble
* **Canonical States**: `params.drift`, `params.breathing`, `params.wobble` (OrganismSettings)
* **Visual Effects**:
  - `drift`: Controls slow, large-scale floating movement of cells away from their home points.
  - `breathing`: Induces pulsing size expansions and contractions of individual cell radii.
  - `wobble`: High-frequency, small-scale shivering/wobbling of cell outlines.
* **Recommended Ranges**: Min: `0.0` (Off), Default: `0.1 - 0.3`, Max: `1.0` | Step: `0.01`
* **Control Types**: Sliders under Advanced disclosure.
* **Performance Tier**: Low.
* **Visibility**: Advanced.
* **Off State Behavior**: **Power Gated**. If all three are set to `0.0`, the motion loop shuts down, saving CPU cycles.
* **Acceptance Observation**: Increase wobble to `0.8`; watch the cell membrane shiver like water under wind.

---

## 6. Canonical Runtime Power Gates

To protect user battery life and CPU resources, the following execution gates are mandatory:

| Gate Target | Visual Off State | GPU/CPU Savings | Trigger Location |
| :--- | :--- | :--- | :--- |
| **Membrane Family** | `defaults.membrane.visible = false` | Skips GPU implicit-field contour calculations; forces canvas render loops to sleep unless camera moves. | Zustand `membrane.visible` |
| **Membrane Edge** | `defaults.membraneEdge.visible = false` | Bypasses boundary edge projection shader loops; clears edge-band uniforms. | Zustand `membraneEdge.visible` |
| **Cell Shadow** | `defaults.cell.shadowEnabled = false` | Skips shadow contour evaluation in fragment shader. | Zustand `uShadowEnabled = 0.0` |
| **Motion** | `timeScale = 0` or all vectors `0` | Pauses continuous rAF render requests entirely. Canvas is drawn static. | `ResolvedOrganism.motionActive = false` |
| **Labels** | `defaults.text.visible = false` | Stops updating, recalculating text size, and synchronizing HTML text labels every frame. | Zustand `text.visible` |
| **Grid** | `defaults.grid.visible = false` | Bypasses grid line calculations and canvas grid rendering routines. | Zustand `grid.visible` |
| **Snapping** | `defaults.snapping.active = false` | Disables geometry snapping checks on mousemove; stops generating candidate snap coordinates. | Zustand `snapping.active` |
