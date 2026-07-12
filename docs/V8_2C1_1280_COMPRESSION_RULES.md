# V8.2C1 — 1280 Compression Rules

Exact 1440 → 1280 differences, per `MOOORF_DESKTOP_SHELL_GEOMETRY_MAP.md`
and `MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` §12 ("reduce gaps before
reducing targets, shorten labels before hiding important controls").
Implemented as one `@media (max-width: 1366px)` block re-declaring the
geometry token layer — every shell component reads the same custom
properties at both sizes, so nothing is duplicated or hand-tuned per
component.

## Token deltas

| Token | 1440 | 1280 | Change |
|---|---|---|---|
| `--edge` | 12px | 8px | gap reduces first |
| `--subrail-w` | 220px | 200px | −20px |
| `--inspector-w` | 340px | 300px | −40px |
| `--matrail-w` | 60px | 52px | −8px |
| `--dock-h` | 60px | 52px | −8px |
| `--dock-w` | 280px | 240px | −40px per side |
| `--addspace-d` | 50px | 44px | −6px |
| `--common-rail-h` | 44px | 40px | −4px |
| `--common-rail-w` | 600px | 500px | −100px |
| `--drawer-h` | 58–64vh | 62–68vh | taller share of a shorter viewport, per `V8_2_PROJECT_DRAWER_ARCHITECTURE.md` |
| `--rail-w` | 42px | 42px | unchanged — the rail never compresses, it is the one truly fixed landmark |

## Label/control reduction order (applied in this priority)

1. **Gaps first** — `--edge` and the docks'/rail's internal gaps shrink
   before anything is hidden.
2. **Labels shorten** — project name clamps to a shorter visible width via
   `overflow:ellipsis` (`.cl-name` gets `max-width` under the 1366px query);
   dock button text labels (`.dk span`) hide entirely, leaving icon +
   tooltip, matching "shorten labels before hiding important controls."
3. **History cluster and Export cluster button text hide** (icon + tooltip
   remain) — these are the first non-essential text labels to go.
4. **Panels narrow, not disappear** — inspector and subrail shrink by their
   token deltas above; they never hide themselves as a compression strategy.
5. **Material rail narrows** (60→52px) but keeps the same swatch count
   logic — swatches scale to the available width via the existing `auto`
   sizing rather than being cut from the list.

## What never compresses

- The long left rail stays 42px and icon-only at both sizes — it was
  already the maximally-compressed form.
- The Canvas remains dominant at both sizes; nothing in this pass touches
  `#stage` sizing directly — it is 100% of the space not claimed by the
  anchored-floating chrome, which is exactly why the chrome must shrink
  before the canvas ever would.
- `+ Space` remains centred and collides with nothing — dock widths were
  chosen (240px @1280) specifically so `240×2 + 44(addspace) < 1280 - 2×258`
  (the subrail+inspector reserved zone) holds at the safe-canvas minimum
  documented in the geometry map's 1280 table.

## Below 1180px

Per `MOOORF_REFERENCE_GEOMETRY_CORRECTIONS.md` §3: rather than a third
compression tier, the shell shows `#desktop-gate` and hides every shell
region outright (`@media (max-width: 1180px)` forces `display:none` on
`#top`, `#rail`, `#subrail`, `#material-rail`, `#inspector`, `.dock`,
`#add-space`, `#common-rail`, `#stage`, `.workspace`). This was a deliberate
product decision, not a bug: compressing a 14-item rail, a 5-region bottom
interaction system, and a 3-workspace switcher below 1180px produces an
unusable interface faster than it produces a useful one, and the addendum
explicitly authorizes a hard floor instead.

## Verified at

1440×900, 1440×1000, 1280×720, 1280×800 — see
`docs/V8_2C1_MANUAL_REVIEW.md` for the pass/fail table. No collisions were
found between the top clusters, the docks, and the centre `+ Space` at
either 1280 height.
