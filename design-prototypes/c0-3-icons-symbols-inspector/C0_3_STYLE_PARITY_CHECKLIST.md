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
| **Day/Night Colours**| Day: gallery cream (`#f5f6ee`), Night: black (`#070707`)| Updates theme state to day/night dynamically | **Match** | Body attribute updates `data-theme` variables. |
| **Inspector Density**| Compact sizing, 320px width limit | Width locked to 330px, compact row padding | **Match** | Fits desktop laptop sidebars. |
| **Canvas Visibility**| Main viewport remains fully visible | Canvas takes up remaining screen space, side padding | **Match** | Canvas slides/compresses based on pinning. |

---

## 2. Intentional Deviations

1. **Inspector Width (330px instead of 320px):**
   - *Justification:* Extended by 10px to accommodate 4-column icon library grids comfortably with proper spacing without causing horizontal wrapping on labels.
2. **Tint Swatch Colors:**
   - *Justification:* Custom colors (Ink, Zonuert Red, Sage, Steel, Bronze, Muted Gray) were added to showcase category-colored and privacy-colored tint applications, drawing from production palettes.
