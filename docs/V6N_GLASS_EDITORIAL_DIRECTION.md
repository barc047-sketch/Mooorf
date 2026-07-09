# V6N — Glass Editorial Direction

Status: implemented direction for the production shell after V6.5 selection editing.

## Neutral Chrome Rule

UI chrome is monochrome / smoke / ink / graphite / pearl / warm-stone.

- Do not use red for rail buttons, dock chrome, widget headers, sliders, chips, panel accents, loader action text, or selection arc chrome.
- Keep `--zonuert-red` available for product palette material, legacy content colors, and explicitly semantic future warnings.
- Canvas/program colors may still come from category, privacy, palette, area, and organism material mapping.

## Glass Family Rule

Dock, rail, widgets, popovers, saved views, palette panels, and canvas edit popovers should feel like one family:

- frosted glass surfaces;
- subtle translucent panels;
- soft edge highlights;
- low-contrast borders;
- restrained shadows;
- no hard white boxes;
- no noisy overlapping cards.

Shared CSS tokens live in `src/styles/tokens.css`: `--chrome-accent`, `--glass-dark`, `--glass-light`, `--glass-panel`, `--glass-panel-strong`, `--glass-border`, `--glass-inner-highlight`, `--glass-shadow`, `--glass-blur`, `--glass-saturate`, `--glass-card-radius`, and `--glass-pill-radius`.

## Density Rule

Controls should feel like a high-end scientific/editorial instrument:

- compact rail;
- slim dock groups;
- tight widget headers;
- single-line sliders;
- low-noise hover states;
- tabular numbers where useful;
- no oversized dashboard cards.

## Slider Rule

Slider tracks stay hairline and neutral. Thumbs use ink/stone, not red. Hover/focus halos are subtle neutral chrome.

## Selection Arc Rule

Selection uses the existing organism label overlay.

- Default tight selection is a compact partial arc with small endpoint dots.
- Halo and influence modes scale intentionally but stay controlled.
- Void selection uses hollow/subtractive styling within the same arc family.
- No aggressive red rings, dashed chaos, or large normal-selection circles.

The canonical reference-locked rule lives in `docs/V6N_REFERENCE_STYLE_LOCK.md`: partial arc, endpoint dots, neutral stroke, small metadata chip, void as subtractive/hollow.

## Label Shadow Toggle

`annotationDetail.textShadow` controls label shadow readability. Default is on for continuity; users can turn it off from Annotation.

## Camera-Aware Morph Toggle

`organism.cameraAwareMorph` controls whether field radius uses camera zoom. Default is on to preserve current behavior; off keeps field size less tied to zoom scale.

## Ponytail Note

Future visual phases should reuse:

- `WidgetFrame`, `WidgetHost`, and `src/ui/widgets/controls.tsx`;
- `src/ui/shell.css` plus `src/ui/widgets/widgets.css`;
- the existing organism label overlay in `OrganismCanvasView`;
- existing store settings before adding new state.

## V6N.1 Reference Lock

`docs/V6N_REFERENCE_STYLE_LOCK.md` is now the stronger visual standard. Treat the attached dark HUD, light bento, spatial glass, and cinematic dashboard references as visual grammar only. Future features should inherit the shared tokens and primitives rather than creating new panel/card/control styles.
