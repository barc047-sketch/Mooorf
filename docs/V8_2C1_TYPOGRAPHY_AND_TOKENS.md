# V8.2C1 — Typography and Tokens

Reconciles three sources that disagreed slightly on exact hex values:
V1's original day-mode `#EFEDE5`/`#17170F`, `MOOORF_REFERENCE_GEOMETRY_
CORRECTIONS.md`'s "museum cream `#F5F6EE`, 1px borders `#222222`", and
`V8_2C0_AUTO_CONTRAST_CONTRACT.md`'s semantic UI table (`#171719` /
`#f4f2e9`). **Resolution:** the Auto Contrast Contract governs because it
is the most specific and most recently authored artifact and is exercised
programmatically (the 0.36-luminance threshold in `autoContrast()`
literally emits these two hex values) — `--bg` moved to `#F5F6EE` (closest
canonical match to "Gallery Cream" from reference 06) and `--ink` moved to
`#171719`. V1's own token file is untouched; this reconciliation applies to
V2 only.

## Colour tokens

| Token | Day | Night | Source |
|---|---|---|---|
| `--bg` | `#F5F6EE` | `#0C0C0E` | geometry corrections (day) · V1 (night, unchanged — already matched refs 04/05's graphite) |
| `--ink` | `#171719` | `#f4f2e9` | Auto Contrast Contract Black/Bone |
| `--text-primary` | `#171719` | `#f5f6ee` | Auto Contrast Contract semantic table |
| `--text-secondary` | `#5a5a56` | `#a1a19c` | same — night value matches reference-pack "Fog" exactly |
| `--text-muted` | `#8c8c88` | `#70706c` | same |
| `--text-disabled` | `#b8b8b4` | `#4c4c48` | same |
| `--signal` | `#D93A1E` | `#FF4B2B` | V1, unchanged — state/warning colour only |
| `--accent-data` | `#E7D400` | same | lemon reference (02), desaturated ~10% from raw `#FFF000` for the accessibility concern the numbered-pack audit raised; reserved for data/chart accents, never chrome |
| `--cell-shadow-color` | `rgba(34,34,34,.08)` | `rgba(0,0,0,.35)` | `V8_2C0_CELL_SHADOW_CONTRACT.md` auto colour |

Glass/hairline/panel tokens (`--hair`, `--hair-strong`, `--pop`, `--sheet`,
`--panel`, `--wash`, `--keybg`, `--railbg`, `--rail-ink`) carry over from V1
unchanged — they were already validated against this exact "blur yes/
shadow no" system.

## Typography roles

| Role | Stack | Size / weight | Where |
|---|---|---|---|
| UI grotesk | `-apple-system, SF Pro Text, Segoe UI, Inter` | 12 / 400–700 | shell chrome, default body |
| Data mono | `ui-monospace, SF Mono, JetBrains Mono, Menlo` | 9–11 tabular | areas, coordinates, IDs, readouts |
| Micro caption | grotesk caps | 9 / 600 / +14% tracking | section captions, subrail groups |
| Cluster label | grotesk | 10.5–11 / 600 | top cluster text, cell names |
| **Dotted display** | mono + dot-matrix clip | ≥28px only | Dashboard hero numerals (Total Area) — one per view, never body text, per V1's own usage rule which V2 inherits unchanged |
| Dashboard editorial heading | grotesk | 30 / 700 / −0.01em | Dashboard title block, echoing reference 01's large deck heading against small card captions |
| Drawer heading | grotesk | 28-ish / 700 | not built as a distinct class in this phase — Drawer uses cluster-scale text throughout; flagged as a documented gap, see Limitations |

## Spacing

Reuses V1's `2·4·6·8·12·16·20·24·32·40` rhythm. The one V2-specific
addition is the geometry-driven `--edge` token (12px/8px) which anchors
every top-level shell region's offset from the viewport, per the geometry
map — this did not exist in V1 (which used ad hoc fixed offsets).

## Radius families

Unchanged from V1: 0–2px editorial (`--r-edit`), 6–10px controls
(`--r-ctrl`/`--r-ctrl-lg`), 14–18px instruments (`--r-inst` = 16px, used for
the rail, subrail, material rail, inspector, overlay panels, and the
Project Drawer's card corners), 50% circles only (radial actions, swatches,
Add Space, avatar, drawer launcher).

## Z-index ladder

```
0  grid              50  material rail        90  menus + radial
1  world/cells        52  subrail               92  cell editor
5  canvas widgets      60  common rail           94  upload overlay
30 workspace views      70  shell (top/rail/dock) 95  toast
40 overlay panels        80  drawer scrim         96  notification stack
                          82  drawer                99  tooltip
                                                     100 desktop gate
```

One correction made during verification: overlay panels originally shared
`top: var(--edge)` with the top clusters, putting the panel header
underneath the (higher z-index) top bar. Fixed by offsetting overlay panels
to `top: calc(var(--edge) + 48px)` — documented here because it is a
geometry decision, not just a bug fix: **overlay panels live in the shell's
"content" layer, below the permanent top clusters, and must never assume
the full viewport height above the fold.**

## Known open gap

The Drawer's own heading typography (`.drawer-mark`) currently reuses the
11px cluster-label scale rather than a distinct "Drawer Heading" role the
reference (03) suggests with its ~28px "Management Overview" title. This
was a deliberate scope trim to keep the drawer's nav list dense and
scannable per the reference's own low-density-but-large-tap-target
reading — flagged as [F] in `V8_2C1_PRODUCTION_MAPPING.md` rather than
silently decided.
