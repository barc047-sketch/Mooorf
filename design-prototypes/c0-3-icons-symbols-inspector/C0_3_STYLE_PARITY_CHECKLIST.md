# Style Parity Checklist — C0.3 Icons & Symbols Inspector Lab

This checklist compares the visual and typography specifications of the C0.3 Icons & Symbols Inspector prototype against the production main codebase.

---

## 1. Style Parity Matrix

| Visual Element | Production Specification | Prototype Implementation | Match Status | Notes / Deviations |
| :--- | :--- | :--- | :--- | :--- |
| **Typography** | Font Family: `"Inter Tight"`, `"Neue Haas Grotesk..."` | Inherits from production `tokens.css` directly | **Match** | Uses `--font-ui` from tokens.css. |
| **Spacing** | 6px base grid (e.g. 6, 12, 18, 24px) | Inherits `--sp-6` to `--sp-96` | **Match** | Sizing aligns with production panels. |
| **Radii** | Input: 3px, micro-card: 10px, floating-card: 16px | Inherits `--r-input`, `--r-micro-card`, `--r-floating-card` | **Match** | Perfect alignment. |
| **Keylines** | 1px border keylines using `--glass-border` | Consumes `var(--glass-border)` for panels and cards | **Match** | 1px solid separator lines. |
| **Glass / Blur** | Backdrop Filter Blur: 32px, opacity overlays | Consumes `var(--glass-panel)`, `var(--glass-blur)` | **Match** |frosted glassmorphic panels. |
| **Active States** | Signal dot / highlighted fill + border tint | Active chips use `--ink`, active swatch uses outline | **Match** | Toggles and chips follow active-state tokens. |
| **Day/Night Colours**| Day: gallery cream (`#f5f6ee`), Night: black (`#070707`)| Updates theme state to day/night dynamically | **Match** | Verified live: night `background` computes to `rgb(7,7,7)`. |
| **Inspector Density**| Compact sizing, 320px width limit | Width locked to 330px, compact row padding | **Match** | Fits desktop laptop sidebars. |
| **Canvas Visibility**| Main viewport remains fully visible | Canvas takes up remaining screen space, side padding | **Match** | Canvas slides/compresses based on pinning; unpinned stage right verified `0px`. |
| **UI Shadows** | Post-V8.2C0 reset: `box-shadow: none` on shell chrome and every `WidgetFrame` state; only popovers and slider thumbs keep micro-shadows | Was FAIL: clusters, rail and inspector consumed `--glass-shadow`/`--glass-shadow-back`. All removed; slider thumbs mirror production's micro-shadow + hover halo exactly | **Match (after fix)** | Verified against `shell.css`/`widgets.css` at `92f4c64`. |
| **Tooltips** | Glass pill: `--glass-panel-strong` + highlight gradient, `--glass-border`, pill radius, blur 24px, no shadow, `--ink` text, 9px | Was FAIL: solid `#222` box with white text. Restyled to the production rail-tooltip recipe | **Match (after fix)** | Mirrors `.rail-btn::after` from production `shell.css`. |
| **No red UI chrome (V6N)** | `--zonuert-red` is product/palette only; switch on-state is an ink gradient (`.org-switch[data-on="true"]`) | Was FAIL: toggles, pin active, active library card and favourite dot used red. All re-based on ink / `--selection-keyline-neutral` / `--chrome-accent`; red survives only as a Tint swatch (product colour) and the brand mark | **Match (after fix)** | Switch on-state now copies production's exact ink gradient. |
| **Hover magnification** | None on shell; slider thumbs scale 1.22 on hover | Thumb hover 1.22 (was 1.3); no dock-style magnification anywhere | **Match (after fix)** | |

---

## 2. Intentional Deviations

1. **Inspector Width (330px instead of 320px):**
   - *Justification:* Extended by 10px to accommodate 4-column icon library grids comfortably with proper spacing without causing horizontal wrapping on labels.
2. **Tint Swatch Colors:**
   - *Justification:* Custom colors (Ink, Zonuert Red, Sage, Steel, Bronze, Muted Gray) were added to showcase category-colored and privacy-colored tint applications, drawing from production palettes. Red here is icon *product* colour (tint data), not UI chrome, so it does not violate V6N.
3. **Label shift under centre-anchored icons:**
   - *Justification:* When an icon with backing is applied at the Centre anchor, the cell label translates below the backing (`--label-shift`) so text never strikes through the glyph. Stacking order is unchanged (labels still render above icons); only the label's resting position moves. Recommended for production adoption.
4. **Micro-interactions kept:** swatch hover scale 1.18 — consistent with production's thumb-hover 1.22 convention; not a dock-style magnification.

## 3. QA defects found and fixed during the style-lock pass

1. `.cluster button` (class+element specificity) crushed the project-name button to 24×24, overlapping the SAVED badge — same class of bug V8.2C1 QA caught; fixed with `.cluster button.cl-name` plus 170px ellipsis truncation.
2. Anchor placement segments (`T-L`/`T-R`) wrapped to two lines — fixed with `white-space: nowrap`.
3. Chips row showed a raw horizontal scrollbar — hidden (mask fade already communicates overflow); library grid scrollbar thinned to `--instrument-track`.
4. Drag-release grid snap was accidentally coupled to the *backing boundary* toggle — removed (production V8.2C0 drag has no implicit snap).
