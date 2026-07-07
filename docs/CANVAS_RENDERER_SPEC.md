# Canvas Renderer Spec

## Renderer options

Start with:
- Canvas 2D if fastest
- PixiJS if smoother for many objects
- do not spend days on shader perfection first

## Layers

```text
Background
Grid/field
OrganismBlob
CellShadows
CellBodies
CellLabels
Selection
ReactOverlayControls
```

## Cell style
- circular
- area-derived radius
- editorial object feel
- soft shadow
- premium palette
- no thick border
- label inside/near
- selected state refined

## Organism blob
- underneath cells
- merge distance
- soft body
- no pipes
- no halo spam
- no hard outline

## Interaction
- pan
- zoom
- drag
- select
- fit/reset view
- add demo cells

## Performance
- rAF
- refs for live pointer movement
- store commits throttled/on drag end
- blob recompute debounced
- DPR clamp
