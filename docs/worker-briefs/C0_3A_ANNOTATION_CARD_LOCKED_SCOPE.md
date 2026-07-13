# C0.3A Annotation Card — Locked Prototype Scope

**Status:** Owner-approved design direction for an isolated prototype extension  
**Product-code effect:** None. This scope does not authorise production implementation or merge.  
**Prototype source:** `design/c0-3-cell-inspector-v2-lab` at `462bf9bacbb1ee60015fc1e794539ab3b25f6b97`

## 1. Decision lock

The previously discussed **Linked Callout** system is removed from the approved scope.

Do not implement or reserve in this task:

- Cell/object links,
- leader lines,
- anchor dots or rings,
- flag leaders,
- above/below/left/right callout directions,
- leader distance,
- automatic callout routing,
- linked data mapping.

The approved object is one free-standing **Annotation Card** only.

## 2. Annotation Card definition

An Annotation Card is a selectable, movable and resizable Canvas markup object containing exactly three ordered content roles:

1. optional Logo,
2. Heading,
3. Body.

The Inspector must identify the selected object as:

`ANNOTATION CARD`

The Annotation Card is Canvas content and is included in export in the future production implementation. It is not a UI widget and must not reuse mock UI state as project data.

## 3. Logo contract

### Supported input

- transparent PNG only,
- alpha transparency required,
- one referenced project asset ID,
- never embed duplicate image bytes inside every card.

### Visual treatment

- no logo background,
- no chip,
- no backing rectangle,
- no border,
- no shadow,
- no independent logo colour picker.

The PNG is treated as a monochrome alpha mask and uses the same resolved Auto Contrast colour as the Heading and Body.

### Placement

Expose only:

- None,
- Top,
- Bottom.

Top and Bottom placement must preserve deliberate clear space:

- between the logo and the card edge,
- between the logo and Heading/Body,
- above and below the complete content stack.

Spacing is preset-controlled. Do not add multiple logo padding sliders in the first version.

## 4. Heading and Body

The only editable text fields are:

- Heading,
- Body.

Body is optional.

Both fields are editable:

- by double-clicking the card,
- through the Annotation Card Inspector,
- through the prototype Markup Table projection.

Editing one surface updates the others through one shared prototype record.

## 5. Shared typography system

Reuse the accepted Cell text system. Do not create another font or typography owner.

Expose only:

- Text Style,
- Text Size,
- Text Colour,
- Auto Contrast,
- Project Default / Local Override,
- Mixed state where relevant.

Text Style controls Heading and Body together. Logo tint resolves from the same Text Colour / Auto Contrast result.

Do not expose per-role font family, weight, letter spacing, line height, rotation or independent text colours.

## 6. Card background

Reuse existing material, colour and glass visual language.

Initial preset families:

- Glass Light,
- Glass Dark,
- Solid Light,
- Solid Dark,
- Tint,
- Outline,
- None.

Expose only:

- Background preset,
- Colour / material,
- Opacity,
- Blur when a Glass preset is active.

Corner radius, padding and internal spacing are defined by the selected preset in the first version.

The PNG logo remains transparent and receives no separate background even when the card has a background.

## 7. Direct Canvas controls

Use direct manipulation for:

- drag to move,
- handles to resize,
- auto-height where appropriate.

Do not add permanent X, Y, width and height sliders to the default Inspector.

Selection evidence must remain editing UI and must not export.

## 8. Markup Table proof

The isolated prototype must include a compact Markup Table proof using the same Annotation Card record.

At minimum expose:

- Heading,
- Body,
- Logo asset,
- Logo placement,
- Text Style,
- Text Size,
- Text Colour / Auto Contrast,
- Background preset,
- Background colour/material,
- Opacity,
- Visibility.

Edits in the table update the card and Inspector. Edits in the card/Inspector update the table.

This is prototype state only. Production later uses the Master Graph/project-store ownership and a Markup Table projection, not a second database.

## 9. Existing Cell Area correction

The current isolated prototype changes the displayed Area value without changing Cell size. Correct this prototype behaviour so Owner QA reflects the production contract.

Within the revised prototype:

- edit Area through the inline editor,
- edit Area through the Cell Inspector,
- edit Area through the compact Space Table proof,
- all three update one shared Cell Area value,
- Cell diameter/radius recalculates visibly,
- Name, Area and Body remain synchronized.

The future production contract remains:

`one updateCellArea command → Master Graph Area → Cell geometry → Table/Dashboard/Export`

There must never be a detached decorative Area value.

## 10. Viewport access correction

Remove the hard blocking screen that prevents Owner QA on a normal laptop.

- keep desktop-first composition,
- support practical QA at approximately 1024–1280 CSS pixels,
- use compact layout/unpinning or a non-blocking warning,
- do not redesign the whole interface,
- do not claim tablet/phone support.

## 11. Modular prototype structure

New Annotation Card logic must not be added as one monolithic script.

Separate concerns into focused modules/files where practical:

- Annotation Card model/state,
- Annotation Card renderer/view,
- Annotation Card Inspector adapter,
- shared typography resolver,
- logo-slot resolver,
- card appearance resolver,
- Markup Table projection,
- selection/direct-manipulation adapter.

The prototype may continue to use lightweight local state, but the production handoff must map every module to the existing production owners.

## 12. Future production architecture

The production design must remain independently auditable and replaceable:

```text
Markup
├── AnnotationCardNode
│   ├── content
│   ├── logo resource reference
│   ├── typography reference/overrides
│   ├── card appearance reference/overrides
│   └── transform
├── Markup Table projection
├── Annotation Card Inspector modules
├── renderer adapter
├── persistence/migration adapter
└── export adapter
```

Required safety rules:

- no second Master Graph/project store,
- no duplicate text-style registry,
- no duplicate material registry,
- no embedded asset duplication,
- no Inspector-owned project data,
- no fake export ownership,
- no prototype shell merge.

## 13. Phase placement

- C0.3A: isolated Annotation Card prototype and handoff only.
- C0.4: reserve explicit Markup/Annotation rendering ownership during layer separation.
- C0.5: production Cell Inspector and real Area-to-geometry/Table sync; no Annotation Card implementation yet.
- C0.13A: standalone production Annotation Card.
- C0.13B+: later Markup features only after separate Owner review.

Linked Callout is not part of the approved roadmap adjustment.

## 14. Manual acceptance

Owner QA must be able to verify:

- select Annotation Card and see `ANNOTATION CARD` Inspector context,
- edit Heading and Body from card, Inspector and Markup Table,
- add/remove transparent PNG logo,
- move logo Top/Bottom with correct clear spacing,
- logo has no background/backing,
- logo uses the same resolved Auto Contrast colour as text,
- Text Style/Size/Colour reuse accepted controls,
- background presets and Glass controls work,
- move and resize card directly,
- Area edits visibly resize Cells from inline editor, Inspector and Space Table proof,
- no Linked Callout controls or leader geometry exist,
- narrow-laptop QA is not hard-blocked,
- modules and production handoff are clearly separated.