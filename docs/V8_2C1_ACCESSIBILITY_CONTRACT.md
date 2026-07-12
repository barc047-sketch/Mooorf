# V8.2C1 — Accessibility Contract

Prototype-level accessibility per the brief §16/32 and
`MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` §5–6. This is a design lab, not a
production a11y audit — items below are what the static markup and JS
actually implement, not aspirational.

## Implemented

- **Semantic buttons** — every interactive control is a real `<button>`
  (never a `<div onclick>`), so it is keyboard-focusable and activatable
  with Enter/Space by default.
- **Visible focus** — `:focus-visible { outline: 2px solid var(--signal);
  outline-offset: 2px; }` applied globally; no `outline: none` anywhere in
  the stylesheet.
- **Escape handling** — one global `keydown` listener closes menus, the
  radial, the cell editor, the Project Drawer, and any open overlay panel.
  The Drawer additionally has its own `keydown` listener for Escape while
  focus is inside it.
- **`aria-modal` + `role="dialog"`** on the Project Drawer, `aria-live=
  "polite"` on the notification stack so screen readers announce export
  completions without stealing focus.
- **Tooltips carry the accessible name** — every icon-only control
  (rail, dock, Quick View, radial buttons) has a `data-tip` attribute that
  doubles as its only text label; the tooltip system shows it on
  `pointerover` after a 380ms delay (avoids tooltip spam on fast mouse
  travel) — see Known Gap below on why this is not yet `aria-label`.
- **Non-colour active state** — every active/selected state (Quick View,
  dock tools, rail items, material favourites) pairs colour with a signal
  dot, filled background, or icon-weight change, never colour alone,
  satisfying `MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` §6.2 "no information
  may depend only on colour."
- **Reduced motion** — `prefers-reduced-motion: reduce` collapses all
  animation/transition durations to near-zero globally.
- **Adequate target sizes** — rail buttons 30×30px, dock buttons ≥30px
  tall with horizontal padding, radial buttons 40×40px, all at or above the
  addendum's implicit "large enough to hit without precision" bar inherited
  from V1's already-reviewed sizing.
- **Shortcut visibility** — the Shortcuts sheet (Drawer → Shortcuts) lists
  every shortcut with both a Mac-style glyph and the same key spelled out;
  this prototype does not attempt real Mac/Windows platform detection
  (documented gap below) but the display format matches the addendum's
  "Mac shortcut first on Mac, Windows first on Windows, Shortcuts sheet
  shows both" rule for the sheet case.

## Known gaps (deliberate, flagged rather than silently skipped)

- **`data-tip` is not `aria-label`.** Icon-only buttons are currently
  unlabelled to assistive tech beyond whatever text a screen reader infers
  from the SVG `<use>` (nothing, by default). Production must add
  `aria-label` sourced from the same string currently only in `data-tip`
  — a one-line adapter, not a redesign, since the label text already
  exists at every call site.
- **No focus trap inside the Project Drawer.** Escape and scrim-click both
  close it, and it is the first focusable element on open, but Tab does
  not currently cycle-wrap within the drawer — a real focus trap (per
  `V8_2_PROJECT_DRAWER_ARCHITECTURE.md` §4) needs a `focusin` listener
  redirecting escapes back inside, which was not implemented this phase.
- **No platform (Mac/Windows) shortcut detection.** All shortcut hints show
  Mac-style glyphs (`⌘`, `⇧`) regardless of `navigator.platform`.
- **Colour contrast was validated by formula, not measured per-pixel.**
  `autoContrast()` implements the exact 0.36-luminance rule from
  `V8_2C0_AUTO_CONTRAST_CONTRACT.md`, but no automated contrast-ratio tool
  was run against the rendered UI chrome text tokens.
- **No skip-link / landmark regions.** The shell has no `<main>`/`<nav>`
  landmark structure beyond the Drawer's own `role="dialog"` — a flat
  `<body>` of positioned regions, consistent with V1's scope and left
  unchanged here.

## Explicitly out of scope this phase

Screen-reader testing with a real AT (VoiceOver/NVDA), full WCAG audit,
touch-target testing on real hardware, colour-blind simulation pass — all
deferred to a dedicated accessibility phase once this prototype's
interaction model is approved, per the master scope's "open decisions to
finalise later" §38.
