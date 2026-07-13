# Later Scope — 2D Technical Illustration Styles

**Status:** CAPTURED / DEPENDENCY-GATED
**Primary value:** Architectural diagrams, technical illustration, presentation graphics and editorial design.

## Why this matters

Advanced Boundary, fill and marker styles are not decorative extras. They allow MOOORF diagrams to communicate hierarchy, enclosure, uncertainty, construction logic, circulation, zoning and technical distinction.

They are intentionally deferred from the C0.4 baseline so renderer ownership and export parity can be stabilised first.

## Advanced Boundary styles

Future approved styles:

- Hairline
- Dashed
- Dotted
- Double
- Technical
- Chain / centre line
- Dash-dot
- Custom dash preset

Future controls may include:

- width,
- inner / centre / outer alignment,
- visual offset,
- dash length,
- gap length,
- secondary-line spacing,
- opacity,
- end cap,
- join style,
- technical scale behaviour.

Architectural rule:

```text
Visual Boundary offset
≠ Cell area
≠ hit testing
≠ clearance behaviour
```

## Advanced Boundary appearance

Future appearance targets:

- solid colour,
- gradient,
- pattern,
- hatch,
- dot screen,
- line screen,
- material-compatible technical stroke,
- print-safe monochrome preset.

Every style requires:

- Classic renderer support,
- Organism/WebGL strategy or truthful fallback,
- PNG/PDF/SVG export behaviour,
- screen-fixed or world-scaled thickness decision,
- high-density performance check.

## Advanced Cell fill language

Future Cell fill possibilities:

- linear and radial gradients,
- controlled multi-stop gradients,
- architectural hatches,
- dot patterns,
- grid patterns,
- diagonal technical patterns,
- material texture presets,
- monochrome print styles,
- category/privacy-driven pattern mapping.

The material registry remains the single source. Pattern definitions are not copied into each Cell.

## Advanced Core shapes

Future approved Core shapes:

- Circle
- Ring
- Double ring
- Square
- Diamond
- Crosshair
- Target
- Number marker
- Technical centroid marker

Future Core controls may include:

- shape,
- size,
- fill,
- outline,
- opacity,
- X/Y offset,
- screen-fixed/world-scaled behaviour,
- motion response,
- Auto Contrast.

The Core never represents selection.

## Technical preset families

Possible later preset collections:

- CAD Hairline
- Survey Dashed
- Diagram Dotted
- Construction Double
- Editorial Technical
- Monochrome Print
- Presentation Gradient
- Zoning Hatch
- Accessibility Pattern

Presets configure existing targets; they do not create new object types.

## Dependency gate

Do not plan implementation until:

- C0.4 baseline layer ownership is complete,
- Classic and Organism target parity is audited,
- C0.5 Inspector can edit target settings,
- material targeting is stable,
- export fallback rules are defined.

## Required future architecture review

Before activation, decide:

- which styles are baseline across both renderers,
- which styles use renderer-specific fallback,
- whether stroke width is screen-fixed or world-scaled per preset,
- how patterns scale during zoom/export,
- how dense patterns affect performance,
- how SVG/PDF retain vector quality,
- how print-safe black/white modes behave.
