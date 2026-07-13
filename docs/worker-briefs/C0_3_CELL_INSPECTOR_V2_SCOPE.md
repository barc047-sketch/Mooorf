# C0.3 Cell Inspector V2 — Locked Product Scope

## Purpose

Expand the accepted Icons & Symbols Inspector prototype into a compact, context-aware **Cell Inspector** without turning it into a dense settings form.

The Inspector is the main visual editing surface for a selected Cell or selected Cells. It must remain preset-first, beginner-friendly, compact and consistent with the current production MOOORF style.

## Core interaction

### Double-click Cell editing

Double-clicking a Cell opens one compact inline editor inside or directly beside the Cell.

Editable fields, in this order:

1. Space Name
2. Area
3. Body

Rules:

- `Enter` commits.
- Clicking outside commits.
- `Escape` cancels.
- `Shift + Enter` creates a line break inside Body.
- Cell dragging is suspended while the editor is active.
- Body is a short description designed for approximately 2–3 visible lines.
- Long Body content is clipped or ellipsized; it must not make the Cell geometry grow.
- Space Name, Area and Body all use the same Master Graph data as the Table.
- Editing in the Cell updates the Table.
- Editing in the Table updates the Cell.
- Area remains a numeric architectural field, not detached decorative text.

## Inspector structure

Use three compact top-level tabs:

- Content
- Symbol
- Cell Style

Tabs should use small icon-plus-label controls or compact toggle pills. Avoid large full-width buttons.

## Scope and inheritance

All major style systems use the same simple two-level rule:

- Project Default
- Local Cell Override

For multi-selection, show `Mixed` where values differ.

When a selected Cell follows Project Defaults:

- show a clear inherited state,
- provide a compact `Create Override` action,
- do not leave disabled controls unexplained.

When a Cell uses a local override:

- show a clear local indicator,
- provide a compact `Return to Default` action.

Use signal dots, small toggle buttons, compact icons and subtle keylines instead of large action blocks.

## Content tab

### Editable content

- Space Name
- Area
- Body

All three fields sync with the Master Graph and Table.

### Text Style

The user does not edit individual typography parameters.

Provide multiple complete **Text Style** presets. Each preset automatically defines the hierarchy and arrangement for:

- Space Heading
- Area
- Body

Example preset families:

- Technical
- Editorial
- Minimal
- Compact
- Presentation
- Diagram

Show presets as compact visual previews of all three text roles together.

### Text controls

Only expose:

- Text Style preset
- Text Size
- Text Colour

Text Size scales the complete three-role text system proportionally.

Text Colour applies to the complete text system, with:

- Auto Contrast
- project palette dots/swatches

Do not expose font family, weight, line height, letter spacing, separate role sizes, alignment, rotation, offsets, opacity or text backing in the first version.

### Text defaults and overrides

Text Style, Text Size and Text Colour support:

- Project Text Default
- Local Cell Override
- Mixed multi-selection state

## Symbol tab

### Library

Each Cell supports one primary symbol in the first production version.

The library should contain as many useful, legal and approved symbol choices as practical across:

- Architecture
- Landscape
- Diagram
- Annotation
- Wayfinding
- Environmental
- Accessibility
- Services
- Custom

Do not expose the complete product UI icon set as drawable symbols. Product navigation icons and drawable diagram symbols remain separate registries/categories.

### Symbol actions

- search
- categories
- recent
- favourites
- hover preview
- apply/replace
- remove

### Symbol settings

Use compact controls for:

- placement preset
- offset X/Y
- scale
- rotation
- tint
- backing type
- backing size
- backing offset
- backing opacity
- backing outline on/off
- backing outline width
- hide when zoomed far out

Do not include an `Include in Export` control. An applied symbol is exported by default.

Use `Backing Outline`, not `Boundary`, inside Symbol settings.

## Cell Style tab

### Fill

- material/colour preview
- compact quick-material dots
- opacity only when materially necessary
- open full Material Browser action

Do not place the entire Material Browser inside the Inspector.

### Boundary

Use the canonical term **Boundary** for the architectural Cell edge.

Controls:

- visible on/off
- solid
- dashed
- dotted
- double
- width
- offset
- opacity
- colour/material
- inside / centre / outside alignment

Prefer small icon toggles and compact value controls.

### Core

The Core is the optional central dot.

Controls:

- Core on/off
- size
- colour/material
- opacity
- offset X/Y
- Auto Contrast

The Core is not independently selectable.

## Copy and Paste Style

Provide compact actions:

- Copy Style
- Paste Style
- Reset Style
- Save as Preset

Copy Style includes visual settings such as:

- Fill
- Boundary
- Core
- Text Style
- Text Size
- Text Colour
- Symbol placement
- Symbol scale
- Symbol rotation
- Symbol tint
- Symbol backing

Copy Style excludes:

- Space Name
- Area
- Body
- symbol identity
- category
- privacy
- floor
- relationships

The Inspector may expose Copy/Paste Style. Production must also support the later radial-menu workflow:

1. select source Cell,
2. right-click and Copy Style,
3. select one or multiple target Cells,
4. right-click and Paste Style.

Paste to multiple Cells becomes one Undo transaction in production.

## Selection visuals

Reuse/adapt the accepted dotted rotating selection orbit from the prototype.

This is global editing UI, not Cell content.

Provide global selection display options later:

- Clean Keyline
- Dotted Orbit
- Keyline + Orbit

The orbit:

- is never exported,
- is never copied by Copy Style,
- is not the Cell Boundary,
- supports motion on/off for reduced motion.

## Prototype reuse

### Reuse/adapt from Claude V1

- Material Browser layout
- search/categories
- recents/favourites
- circular material previews
- compact sliders and values
- hover preview/revert logic

### Reuse/adapt from Claude V2

- right Inspector geometry
- permanent left rail framing
- contextual bottom rail structure
- vertical quick-material rail
- target-aware layering
- compact panel density

### Reuse/adapt from current C0.3 prototype

- symbol search/categories
- placement and backing controls
- selection badge
- dotted rotating selection orbit
- production token parity

### Do not copy

- full prototype shell
- mock state architecture
- hard-coded product Cells
- duplicate icon/material arrays
- fake export
- hover magnification
- UI icons mixed into drawable symbols
- prototype-only stores

## Material system relationship

Keep these separate but connected:

- Cell Inspector: compact editing and quick material dots
- Target rail: Cell, Boundary, Membrane, Membrane Edge, Core, Void
- Quick material rail: recent/favourite materials for the active target
- Material Browser: large searchable library for deep selection

The Cell Inspector should include a compact `Open Material Browser` action, not duplicate the entire library.

## UI density rule

Prefer:

- small icon toggles
- signal dots
- compact segmented controls
- small circular swatches
- collapsible advanced rows
- short labels

Avoid:

- large full-width buttons
- long form-like stacks of permanently visible controls
- large cards
- repeated explanatory text inside the interface

## Explicit exclusions

Do not add:

- rich text
- Markdown
- multiple symbols per Cell
- per-role typography controls
- export toggles for normal Cell content or symbols
- full Material Browser inside the Inspector
- relationship controls
- Morph Bridge controls
- full Membrane or Motion controls
- floor/project management

## Manual acceptance

Owner manual QA is authoritative.

The V2 prototype must support a concise QA pass for:

- inline Name/Area/Body editing
- Enter commit
- click-outside commit
- Escape cancel
- Table/Master Graph sync contract in the handoff
- Text Style preset
- Text Size
- Text Colour
- Project Default / Local Override
- symbol search/preview/apply/replace/remove
- one-symbol-per-Cell rule
- compact Boundary/Core controls
- Copy/Paste Style behavior
- dotted selection orbit
- 1440 and 1280 style parity

Undo/Redo is a production implementation requirement and is not required to be genuinely implemented in the isolated visual prototype.