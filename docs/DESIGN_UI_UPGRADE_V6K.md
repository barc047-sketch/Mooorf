# V6K — Premium Visual System + Full Control Migration

Status: implemented and preview-verified. V6N later refined this system toward neutral editorial glass; V6N.1 locks the stronger reference grammar. See `docs/V6N_GLASS_EDITORIAL_DIRECTION.md` and `docs/V6N_REFERENCE_STYLE_LOCK.md`. References are mood/quality benchmarks only — nothing copied.

## Architecture

Three command surfaces, no duplicated ownership:

- **Left rail** (`src/ui/Rail.tsx`) — launchers only. Sections: view / build / note / organism / color / layout / saved / display / system. Every detail control opens a floating widget.
- **Bottom dock** (`src/ui/Dock.tsx`) — quick actions only. Left: ORG/CLS, style popover, attachment popover, density slider. Center: `+ Nucleus` orb (47 px, liquid hover wobble), Add-5 cluster orb, void action (enabled in V6L as a subtractive nucleus). Right: palette quick popover (with "All palettes →" widget hand-off), saved views, random arrangement, import/export placeholders, organism widget launcher.
- **Floating widgets** (`src/ui/widgets/`) — all detailed controls. `WidgetHost` renders `openWidgets` from the store (array order = z-order); `WidgetFrame` supplies the shared chrome.

## Widget system

`src/state/store.ts`: `openWidgets: WidgetId[]` + `openWidget / closeWidget / toggleWidget / focusWidget`. The old `orgPanelOpen/orgPanelFocus` single surface was removed; `OrganismControlPanel.tsx` was deleted and its content redistributed.

`WidgetFrame` behavior:
- drag by title strip (CSS `translate` — never fights Motion's mount `transform`), viewport-clamped, per-id session position memory
- magnetic snap back to the stack when dropped within 22 px of home
- minimize to a 232 px header chip; close; internal scroll; Escape closes the front widget
- cascade slots (72 px + n·42 px down the right edge) assigned on first open
- near-opaque premium glass (`--bg` 86% + surface sheen) — stacked widgets never ghost through
- ≤640 px: widgets become full-width sheets, drag disabled

Widgets: **Annotation** (label modes, text scale, show name/area/category, position auto/center/above/below, bounding box), **Organism** (style, attachment + reach + offsets, field, nuclei, motion master, pockets, selection with influence behind a disclosure, resets), **Layout** (presets incl. Random, dedicated Void layout still disabled, visual spread), **Palette** (see below), **Saved Views** (existing panel embedded), **Display** (theme, technical grid, labels, nuclei dots, density placeholder), **Advanced** (debug, renderer readout, staged features).

Shared primitives: `src/ui/widgets/controls.tsx` (SliderRow/SwitchRow/WidgetSection/ChipRow/ChoiceRow) + `src/ui/controlMeta.ts` (single source of labels/descriptions for dock and widgets).

## Palette system

`src/design/palettes.ts` rebuilt:
- **12 nucleus families** (10-step dark→light ramps): Black Bone, Graphite Fog, Architecture Warm/Cool, Sage & Stone, Oxblood Editorial, Dusk Violet, Surreal Soft, Medical Clean, Dark Premium, Atmospheric, Clay & Porcelain — plus Auto (category mapping) and a custom-slot placeholder.
- **12 organism palettes**: 9 solid palettes (Core Field, Ink, Porcelain, Graphite, Wine, Sage, Slate Blue, Dusk Violet, Umber — day/night body+ground each) and 3 V6L blend palettes (Atmospheric Blend, Category Blend, Dual Layer) using body A/body B/accent uniforms.
- `OrganismBlendMode` union names category/privacy/dual-layer/membrane-core direction; V6L implements the restrained two-color path, while true per-nucleus textures remain future work.

Runtime (`src/design/colorMapping.ts`):
- `getNucleusColor(..., nucleusPaletteId)` — a concrete family tints the category mapping 58% toward the ramp shade at the privacy+area depth (category keeps hue identity, family unifies mood). Wired through labels, organism adapter, and table swatches.
- `getOrganismPalette(..., organismPaletteId)` — palettes resolve body/ground/accent values; V6L adds body B and blend strength for controlled multi-color shader mixing. `"mode"` keeps pre-V6K behavior. Transitions still ease through the existing uniform smoother.

Store: `settings.nucleusPaletteId` ("auto") + `settings.organismPaletteId` ("mode"); both persist in saved-view snapshots as optional fields (old snapshots keep loading).

## Canvas polish

- Default selection ring tightened (1.05× factor, 14 px floor, 1.25 px stroke). Influence stays an advanced mode behind a disclosure.
- Annotation detail: `--label-scale` transform, position modes, bounding-box hairline, field visibility flags.
- `settings.showGrid`: camera-synced technical grid (CSS background, offsets written by the render loop — no extra draw calls).

## Visual language

- Tokens (`src/styles/tokens.css`): `--ease-out`, `--shadow-soft/float/deep`.
- Dock/rail slightly tighter (30 px dock buttons, 26 px rail buttons, 47 px orb) with inset top sheen.
- Custom range inputs everywhere (hairline track, ink/thumb, neutral hover halo, Firefox progress fill after V6N).
- Active states use ink/stone chrome after V6N; gradients stay reserved for high-emphasis actions and organism material.
- V6N.1 reference-lock tokens add reusable glass dark/light, border, inner highlight, shadow, card/pill radius, HUD/muted text, dot-grid, selection-arc neutral, and warning-data colors. Future widgets/data cards should reuse those primitives rather than adding new card styles.

## Verified (live preview)

Build green. Zero console warnings/errors. Widget open/drag/snap/minimize/z-order/Escape, wine organism palette on the shader, warm nucleus family on labels, grid, text scale + below placement, saved view save/delete, layout presets, night mode, ORG↔CLS round-trip, table edit → canvas label, `/experiments/organism-lab` intact.
