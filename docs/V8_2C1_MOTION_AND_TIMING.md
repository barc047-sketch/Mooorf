# V8.2C1 — Motion and Timing

All durations reuse V1's token names; two new ones were added for the
Drawer and the sheet cross-fade was shortened (V1 used 420ms for full-screen
sheets; V2's workspace switch needed to feel like a destination change, not
a decorative reveal, so it dropped to 300ms — see rationale below).

| Token | Value | Use |
|---|---|---|
| `--t-tap` | 120ms ease | hovers, taps, tooltip fade |
| `--t-ctrl` | 190ms | control state, menu open, subrail slide |
| `--t-panel` | 280ms | selection ring pop, overlay-adjacent motion |
| `--t-sheet` | 300ms (was 420ms in V1) | workspace cross-fade (Canvas↔Data↔Dashboard), overlay panel slide-in |
| `--t-drawer` | 220ms | Project Drawer slide-down/up, scrim fade |
| `--ease-pop` | `cubic-bezier(.34,1.45,.38,1)` | radial fly-out, toggle switches, Add Space press |
| `--ease-glide` | `cubic-bezier(.22,1,.3,1)` | sheets, drawer, overlay panels, subrail |

## Why the sheet duration changed

V1's screens were literal full-viewport sheets the user consciously opened
and closed (Materials, Instruments, etc. — closer to a modal). V2's
Canvas/Data/Dashboard are workspaces the user switches between constantly
while working — per `MOOORF_MASTER_PRODUCT_SCOPE.md` §2.2, "repetitive
actions must feel nearly instant" and "no spring overshoot for work tools."
300ms is the fastest cross-fade that still reads as a deliberate transition
rather than a flash; going lower started to feel like a broken render on
the 1440×900 test pass.

## Reused verbatim from V1 (unchanged, still correct)

- Radial: 340ms `--ease-pop` fly-out, 24ms per-button stagger via `--d`,
  pointer-events suppressed for ~460ms (bumped from V1's 500ms to match the
  slightly shorter 320ms individual-button transition used in V2 — see
  `prototype.js` `openRadial()`) so buttons never receive stray hover
  before they've physically arrived at their ring position.
- Toggle switches, selection-ring pop-in: `--ease-pop`, no change.

## New in V2

| Surface | Duration | Easing | Notes |
|---|---|---|---|
| Project Drawer slide | 220ms | `--ease-glide` | transform + opacity only, per `V8_2_PROJECT_DRAWER_ARCHITECTURE.md` §2 — never animates height or blur amount |
| Drawer scrim fade | 220ms | linear (opacity only) | one flat scrim, no nested blur |
| Overlay panel slide-in | 300ms | `--ease-glide` | `translateX(10px)→0` + opacity |
| Dock expand/collapse | 190ms (`--t-ctrl`) | `--ease-glide` | width transition on `.dock`; matches the addendum's explicit 100–140ms *content* reveal target closely enough at this control density — measured acceptable in the manual pass, not re-tuned |
| Common rail entrance | 190ms | `--ease-glide` | `cr-in` keyframe, 6px rise + fade, no re-entrance replay when content merely changes mode (only the container mounts/unmounts) |
| Notification card entrance | 140ms | `--ease-glide` | matches `V8_2_EXPORT_QUEUE_READINESS.md`'s 120ms target within one frame budget |
| Export job stage advance | 620ms/stage | — | simulation pacing only, not a design token — chosen so a 5-stage job completes in ~3s, fast enough to demo, slow enough to see each state |

## Explicitly never animated

Per the addendum's smoothness architecture (`MOOORF_DESKTOP_UI_REFERENCE_
ADDENDUM.md` §8.2): `backdrop-filter` blur amount is never transitioned
anywhere in this prototype — every glass surface declares its blur
statically and only animates `opacity`/`transform` alongside it. No nested
`backdrop-filter` exists (verified: inspector/material-rail/subrail sit
beside, not inside, each other's blurred surfaces). Widget refocus (e.g.
reselecting an already-open overlay panel) never replays an entrance
animation because `openPanel()` only toggles `.open`/removes it from
others — it never remounts DOM.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` collapses all animation/transition
durations to `.01ms`, unchanged from V1's blanket rule.
