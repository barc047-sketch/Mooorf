# MOOORF Roadmap Amendment — Annotation Card and Cell Label Layout

**Date:** 2026-07-13  
**Status:** Owner-approved roadmap amendment  
**Overrides:** Any earlier planning note that defined `Linked Callout` as a project object.

## 1. Approved prototype verdict

The Cell Inspector V2 prototype at:

- branch: `design/c0-3-cell-inspector-v2-lab`
- head: `462bf9bacbb1ee60015fc1e794539ab3b25f6b97`

is approved as:

`APPROVE WITH PRODUCTION ADJUSTMENTS`

The current prototype successfully validates:

- contextual Inspector structure,
- Content / Symbol / Cell Style tabs,
- inline content editing direction,
- shared Text Style / Text Size / Text Colour direction,
- compact controls,
- symbol library direction,
- Boundary/Core control direction,
- selection orbit direction.

The production rebuild must additionally satisfy the approved adjustments below.

## 2. Removed concept

Remove `Linked Callout` from the planned product architecture.

An Annotation Card is standalone and does not link to a Cell or another object.

## 3. Added/adjusted concepts

### Annotation Card

Standalone markup object containing:

1. optional transparent PNG logo,
2. Heading,
3. Body.

The logo:

- has no background,
- may appear at the top or bottom,
- receives deliberate edge/text spacing,
- uses the same resolved Auto Contrast colour as card text through a monochrome alpha-mask treatment.

### Cell Label Layout

Cell labels receive preset-first layout control, including:

- separate Area placement,
- Flag preset,
- Flag direction: Auto / Above / Below / Left / Right,
- adjustable Flag distance,
- automatic placement plus later manual drag/reset behaviour.

### Area geometry contract

Area edits from the Canvas inline editor, Inspector or Space Table must update one canonical Area value and immediately recalculate Cell geometry.

### Table projections

The Data workspace must eventually expose synchronized projections for:

- Spaces,
- Cell Labels,
- Annotation Cards.

These are views over central state, never separate stores.

## 4. Revised phase effects

| Phase | Amendment |
|---|---|
| C0.3P | Prototype approved with production adjustments; no further full prototype rewrite required |
| C0.4 | Reserve modular Cell Label, Flag overlay, Annotation Card overlay, renderer and export ownership |
| C0.5 | Implement Cell Label presets, independent Area placement, Flag direction/distance, Area-to-size sync and table synchronization |
| C0.13A | Implement standalone Annotation Card: Logo + Heading + Body + background + shared typography + table/export/persistence |
| C0.13+ | Advanced markup only through separate reviewed milestones |

## 5. Immediate sequence remains safe

```text
C0.2 registry merge
→ C0.4 Organism/layer architecture audit and implementation
→ C0.5 production Cell Inspector
→ later C0.13A Annotation Card
```

Annotation Card implementation is not moved into the current milestone merely because its scope is now approved.

## 6. Modular architecture gate

Future briefs must keep these owners separate:

- Cell data,
- Cell geometry,
- Cell Label Layout,
- Flag geometry,
- Annotation Card content,
- logo asset references,
- shared typography,
- shared materials,
- Inspector context modules,
- table projections,
- history commands,
- persistence migrations,
- Canvas renderer adapters,
- export adapters,
- selection/editing overlays.

No implementation may combine these into one large component or one untyped appearance object merely for speed.

## 7. Canonical reference

Full detail:

`docs/MOOORF_ANNOTATION_CARD_AND_LABEL_LAYOUT_SCOPE.md`
