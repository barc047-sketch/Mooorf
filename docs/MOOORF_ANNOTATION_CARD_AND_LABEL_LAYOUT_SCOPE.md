# MOOORF Annotation Card and Cell Label Layout Scope

**Status:** Owner-approved canonical scope
**Date:** 2026-07-13
**Product-code effect:** None. This document defines future architecture and sequencing only.

## 1. Locked naming and exclusions

### Annotation Card

A standalone Canvas markup object containing:

1. Logo
2. Heading
3. Body

### Explicit removal

There is no `Linked Callout` object.

An Annotation Card cannot attach to, follow, or create a leader line to a Cell or another object in the approved first architecture.

Leader-line and flag behaviour belongs to the **Cell Label Layout** system, not to Annotation Card.

## 2. Annotation Card content

### 2.1 Logo

The logo is optional.

First-version rules:

- transparent PNG only,
- no logo background, plate, pill, badge or container,
- logo placement is Top or Bottom,
- maintain deliberate spacing between the logo and the card edge,
- maintain deliberate spacing between the logo and Heading/Body,
- logo size uses compact presets rather than unrestricted controls,
- logo resource is referenced by project asset ID; binary image data is not duplicated into every card,
- the first version treats the transparent PNG as a monochrome alpha mask and tints it with the same resolved Text Colour / Auto Contrast colour used by the card,
- no arbitrary full-colour logo treatment in the first version.

Recommended compact placement presets:

- Top Left
- Top Centre
- Top Right
- Bottom Left
- Bottom Centre
- Bottom Right

Recommended size presets:

- Small
- Medium
- Large

### 2.2 Heading

- required in the first version,
- editable by double-click and Inspector,
- uses the shared typography preset system,
- supports the same Text Size, Text Colour and Auto Contrast ownership as other markup text.

### 2.3 Body

- optional,
- editable by double-click and Inspector,
- short-form text,
- auto-height within bounded card dimensions,
- overflow must not corrupt Canvas geometry.

## 3. Annotation Card Inspector

Selecting the object changes the existing contextual Inspector title to:

`ANNOTATION CARD`

The Inspector must reuse shared modules rather than create another independent panel system.

### Content

- Logo
- Heading
- Body

### Text

Reuse:

- Text Style
- Text Size
- Text Colour
- Auto Contrast
- Project Default / Local Override
- Mixed state when multi-selection supports cards later

### Card background

Preset-first options:

- Glass Light
- Glass Dark
- Solid Light
- Solid Dark
- Tint
- Outline
- None

Only expose controls relevant to the selected preset:

- background preset,
- colour/material,
- opacity,
- blur only when Glass is selected.

Padding, radius, internal spacing and border treatment are preset-owned in the first version.

## 4. Annotation Card visual presets

All presets are configurations of the same object:

- Narrative Glass
- Metric Glass
- Title Plate
- Logo Card
- Compact Caption
- Dark Editorial
- Solid Technical

No preset may create a second data type or separate renderer.

## 5. Cell Label Layout system

Cell labels remain a separate system from Annotation Cards.

The label system controls presentation of:

- Space Name
- Area
- Body
- Symbol

### 5.1 Preset-first layouts

Initial families:

- Centre Stack
- Area Hero
- Name Hero
- Split
- Symbol + Text
- Compact Technical
- Ring Label
- Minimal Number
- Flag

### 5.2 Area independence

Area may be positioned independently from Name and Body through layout presets.

Examples:

- Name + Area inside
- Name inside / Area badge
- Name outside / Area inside
- Name inside / Area outside
- Area Hero
- Custom

Only `Custom` may expose advanced individual placement controls.

### 5.3 Flag preset

`Flag` is a Cell Label Layout preset, not an Annotation Card and not a separate project object.

Required controls:

- direction: Auto / Above / Below / Left / Right,
- adjustable leader distance,
- compact line style preset,
- anchor marker preset,
- manual label drag after automatic placement,
- reset to automatic placement.

The flag remains linked to the Cell label projection. When the Cell moves, its anchor follows the Cell. The label endpoint may preserve manual placement according to the final interaction contract.

## 6. Area editing and Cell geometry

The design prototype changing Area text without resizing the Cell is not accepted production behaviour.

Production must use one canonical command path:

```text
Canvas inline Area edit
Cell Inspector Area edit
Space Table Area edit
        ↓
canonical updateCellArea command
        ↓
Master Graph/store Area
        ↓
area-to-radius geometry recalculation
        ↓
Canvas + Table + Dashboard + Export refresh
```

Rules:

- there is no decorative Area value separate from architectural Area,
- valid Area edits resize the Cell immediately,
- invalid or incomplete drafts do not corrupt the numeric store,
- one committed edit creates one history transaction,
- renderer and export projections consume the same resolved geometry.

This is a Major acceptance gate for the production Cell Inspector phase.

## 7. Table projections

Every editable field must be available through the Data workspace without creating duplicate data ownership.

Recommended projections:

### Spaces

- Space Name
- Area
- Body
- Category
- Privacy
- Floor
- other canonical space fields

### Cell Labels

- Cell
- Label Layout preset
- Name placement
- Area placement
- Body placement
- Flag direction
- Flag distance
- Text Style
- Text Size
- Text Colour

### Annotation Cards

- Card ID
- Heading
- Body
- Logo resource
- Logo placement
- Logo size
- Text Style
- Text Size
- Text Colour
- Background preset
- Background colour/material
- Opacity
- Blur where applicable
- visibility

These are synchronized views over central project state, not separate databases.

## 8. Modular production architecture

The implementation must remain auditable, replaceable and expandable.

```text
PRESENTATION / MARKUP DOMAIN
│
├── CellLabelLayout
│   ├── preset
│   ├── role placement
│   ├── flag geometry
│   └── sparse local overrides
│
├── AnnotationCardNode
│   ├── content
│   ├── logo resource reference
│   ├── typography reference/overrides
│   ├── card appearance reference/overrides
│   └── Canvas transform
│
├── SharedTypography
├── SharedMaterialResolver
├── SharedHistoryCommands
├── TableProjections
├── PersistenceMigrations
├── RendererAdapters
└── ExportAdapters
```

### Separation guarantees

- Annotation Card content is independent from Cell data.
- Cell Label Layout never changes Cell Area.
- Flag leader geometry is independent from Annotation Card.
- Logo asset storage is independent from card content.
- Typography is shared, not copied.
- Material resolution is shared, not copied.
- Table views never become the source of truth.
- Selection/editing UI never enters export.
- Canvas and export renderers receive the same resolved model.

## 9. Rendering ownership

Conceptual layers:

```text
Selection / Editing UI
Annotation Cards
Cell Labels and Flag leaders
Core
Boundary
Cell
Visual Connections
Morph Bridges
Membrane Edge
Membrane
Grid
Background
```

Exact draw order must be verified during implementation, but semantic ownership may not be collapsed.

## 10. Phase placement

### C0.4 — Organism layer separation

Reserve explicit ownership for:

- Cell labels,
- Flag leader overlay,
- Markup/Annotation Card overlay,
- selection/editing UI,
- renderer/export layer boundaries.

Do not implement Annotation Cards in C0.4.

### C0.5 — Production Cell Inspector

Implement:

- Cell Label Layout presets,
- separate Area placement,
- Flag direction and distance,
- canonical Area edit → Cell resize,
- Spaces and Cell Labels table synchronization.

Do not implement Annotation Cards in C0.5.

### C0.13A — Annotation Card

Implement the standalone Annotation Card with:

- Logo,
- Heading,
- Body,
- shared typography,
- card background presets,
- Canvas transform,
- Annotation Cards table projection,
- history, persistence and export parity.

### Later C0.13+

May add additional markup types, more card presets, advanced layout, collision handling and richer asset support only through separate reviewed phases.

## 11. Owner approval record

The Owner approved:

- removal of Linked Callout,
- standalone Annotation Card naming,
- transparent PNG logo only,
- no background behind the logo,
- Top/Bottom logo placement with deliberate spacing,
- logo Auto Contrast colour matching the resolved card text colour,
- Heading and Body content,
- Cell Flag direction and adjustable distance,
- Area editing resizing the Cell,
- synchronized table projections,
- strict modular/layered architecture for later redesign and expansion.
