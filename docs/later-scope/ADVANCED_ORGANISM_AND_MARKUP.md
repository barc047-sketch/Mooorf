# Later Scope — Advanced Organism and Markup

**Status:** CAPTURED / DEPENDENCY-GATED

## Advanced Membrane geometry

Future approved directions:

- Soft
- Fluid
- Tidal
- Folded
- Crisp
- Cellular

Possible controls:

- wave amount,
- wave frequency,
- fold depth,
- fold scale,
- edge ripple,
- contour variation,
- flow direction,
- pocket softness,
- tension,
- reach,
- fusion,
- response.

These controls affect geometry or motion. They must not be mixed blindly into material selection.

## Advanced Membrane motion

Future directions:

- breathing,
- wobble,
- tidal response,
- directional flow,
- reduced-motion fallback,
- quality fallback for dense scenes.

Motion remains optional and ships off by default unless a later Owner decision changes it.

## Advanced Cell Label Layout

Future extensions after the C0.5 baseline:

- more inside/outside role arrangements,
- richer Flag presets,
- custom leader routes,
- automatic collision avoidance,
- independent Name/Area/Body manual handles,
- edge-following and ring text,
- screen-fixed/world-scaled typography options,
- multi-selection label layout operations,
- reusable label preset collections.

Area remains architectural data. Label placement never creates a duplicate Area value.

## Advanced Annotation Card

The standalone Annotation Card remains:

```text
Logo
Heading
Body
Background
```

Future extensions may include:

- more card presets,
- richer logo alignment,
- additional asset types after transparent PNG support is stable,
- auto-layout templates,
- responsive card sizing,
- data-driven metric cards,
- multiple-column cards,
- chart or legend slots,
- print-safe export variants,
- shared card preset libraries.

There is no Linked Callout object in the approved architecture.

## Advanced logo treatment

First version remains:

- transparent PNG,
- no logo background,
- top or bottom placement,
- Auto Contrast tint matching text.

Future review may consider:

- preserved original colour,
- duotone,
- SVG asset support,
- logo lockups,
- project-wide logo variants.

These require legal, export and asset-persistence review before activation.

## Advanced selection and editing UI

Future options:

- Clean Keyline
- Dotted Orbit
- Keyline + Orbit
- secondary-selection intensity,
- reduced-motion variants,
- editing handles per target,
- target-specific hover feedback.

Selection remains temporary UI and is never exported or copied as appearance.

## Advanced interaction history

A later dedicated interaction-history phase may address:

- drag previews that commit on pointer-up,
- slider previews that commit once,
- grouped multi-object transforms,
- paste-style transactions,
- command coalescing,
- long-session history memory limits.

This is not part of the C0.4 baseline unless a proven blocker requires a narrow fix.

## Dependency gate

Do not activate until relevant foundations are complete:

- C0.4 layer ownership,
- C0.5 production Inspector,
- target rail and material system,
- stable renderer/export parity,
- performance profiling,
- specific Owner approval for each advanced group.
