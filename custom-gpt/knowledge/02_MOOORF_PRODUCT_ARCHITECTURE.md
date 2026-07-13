# MOOORF Product Architecture — Knowledge Upload 02

## Product vision

MOOORF is a spatial-program relationship and architectural diagram studio for students and professionals. Users create or import spaces, edit areas/categories/privacy/floors/relationships, arrange them on a Canvas, generate analytical views, and export presentation-ready outputs.

## Central model

Conceptual ownership:

```text
Project
├── Project metadata
├── Floors
├── Spaces / Cells
├── Relationships
├── Flow paths
├── Category definitions
├── Presentation defaults
├── Sparse per-object presentation overrides
├── Markup objects
└── Computed selectors/statistics
```

Computed values are derived from the central graph/store. They are not manually duplicated in dashboards or exports.

## Space / Cell data

Architectural data includes:

- ID
- Name
- Area and unit
- Body/notes
- Category
- Privacy
- Floor
- position
- visibility/locked state
- relationships and flow membership

Presentation data must remain separate through optional sparse overrides. Missing overrides inherit project defaults or legacy values.

## Presentation ownership

```text
ProjectPresentationDefaults
├── Cell
├── Boundary
├── Membrane
├── Membrane Edge
├── Core
└── Void

SpaceCell
├── architectural data
└── appearance?: sparse CellAppearanceOverrides
```

Renderers consume complete resolved appearance. Renderers do not own defaults.

## Renderer architecture

- Organism/WebGL is the primary expressive Canvas renderer.
- Classic 2D remains the fallback and export-supporting path where applicable.
- Renderer parity, export parity and hit-testing ownership must be audited separately.
- C0.4 separates layer ownership before production Inspector integration.

## Cell Inspector direction

Contextual Inspector shell:

- Content
- Symbol
- Cell Style

Content:

- Space Name
- Area
- Body
- Label Layout
- Text Style preset
- Text Size
- Text Colour
- Auto Contrast
- Project Default / Local Override

Symbol:

- one primary drawable symbol per Cell
- large categorized symbol registry
- search/favourites/recents
- placement, offsets, scale, rotation, opacity, tint, backing
- no Include in Export toggle
- UI command icons remain separate from drawable symbols

Cell Style:

- Fill/material/colour/opacity
- Boundary visibility and basic properties
- Core visibility and basic properties
- Copy Style excludes Name, Area, Body, category/privacy/floor/relationships and symbol identity

## Cell Label Layout

Preset-first layouts include:

- Centre Stack
- Area Hero
- Name Hero
- Split
- Symbol + Text
- Compact Technical
- Ring Label
- Minimal Number
- Flag

Flag direction:

- Auto
- Above
- Below
- Left
- Right

Flag distance is adjustable. Advanced manual placement comes after stable preset behaviour.

## Annotation Card

Standalone markup object stored outside `SpaceCell`.

Content:

1. Optional transparent PNG logo
2. Heading
3. Body

Card appearance reuses shared text presets, Auto Contrast, materials, colour tokens and background presets such as Glass Light/Dark, Solid Light/Dark, Tint, Outline and None. Card move/resize happens directly on Canvas. Export-safe fallback must not depend entirely on backdrop blur.

## Table projections

- Space Table edits canonical space data.
- Cell Label settings are synchronized presentation projections.
- Future Markup Table edits Annotation Cards.
- No table owns a second copy of project data.

## Connections

Connections remain independent of Organism styling:

- semantic Relationship may exist without visible line,
- Visual Connection controls geometry and line appearance,
- Morph Bridge is a membrane-derived physical connection,
- Cell Behaviour controls spatial forces and merging.

Advanced line styles, markers, animation and technical export behaviour remain later-scope.

## Export

Target formats include PNG, SVG, PDF, CSV, JSON and ZIP presentation packs. Canvas and export must resolve the same project/state truth. Selection UI never exports. Annotation Cards and Cell Labels export when implemented.

## Expansion path

Later phases include:

- advanced 2D technical illustration styles,
- advanced Membrane and motion,
- advanced connections,
- Arrange/Markup suite,
- Floors/Data/Analysis/Dashboard,
- project/presentation/import/export expansion,
- rules/bylaws,
- templates and AI assistance,
- devices/backend/auth/collaboration last.
