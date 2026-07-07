# CLAUDE.md — ZONUERT Canvas Lab Memory

## Product identity

ZONUERT is a browser-first spatial program visualization studio.

One-line:
Turn space-program data into beautiful, editable, export-ready architecture diagrams.

Core logic:
central spatial graph → synchronized views

## This lab mission

Build a standalone canvas/table prototype only.

Do not build:
- backend
- login
- cloud
- payment
- public gallery
- full dashboard
- deployed V1 changes

## Visual north star

References:
- `assets/references/palmer_editorial_canvas_screenshot.png`
- `assets/references/palmer_style_reference_tokens.md`
- https://www.palmer-dinnerware.com/

Translate Palmer into ZONUERT:
- objects become space cells
- product scatter becomes spatial canvas
- museum cream becomes day mode
- Graph Noir Red becomes night mode
- outlined controls become glass/ink controls
- experience view becomes canvas/table switch
- drag-to-explore becomes infinite canvas interaction

## Required special feature

Animated loading intro:
- full screen
- countdown in corner
- red timer/link text
- colorful liquid gradient covering about 30% of screen
- smooth reveal into canvas
- not childish, not generic

## Core views

1. Loading screen
2. Canvas view
3. Table view

## Must work

- pan
- zoom
- drag cells
- add cells
- table edit updates canvas
- switch view no reset
- day/night mode
- merge distance slider
- organism/blob optional but included
- build passes

## Main stack

- Vite
- React
- TypeScript
- Zustand
- PixiJS or Canvas 2D
- GSAP for loader
- Motion for UI
- shadcn/Radix-style controls
- Lucide icons
- PapaParse import
- TanStack Table
- d3-contour/custom blob logic

## Token rules for Claude

Read:
1. CLAUDE.md
2. docs/TASK_QUEUE.md
3. docs/HANDOFF.md
4. docs/ACCEPTANCE_TESTS.md

Then work one phase at a time.
Use Context7 for docs.
Use Playwright for browser inspection.
Update HANDOFF.md after each phase.

## Token-saving workflow (enforced)

- Read HANDOFF.md first, TASK_QUEUE.md second — do not rescan the whole repo.
- Read DECISIONS.md only if an architecture decision is needed.
- Read BUGS.md only if fixing bugs.
- Read package.json only for dependency awareness.
- Read only current-phase files. Never read node_modules; never read dist/build/.next.
- Do not paste full files in responses unless specifically asked.
- Keep phase reports under 120 words unless there is an error.
- Run `npm run build` only at the end of a phase, unless actively fixing an error.
- Use `/compact` or lean on HANDOFF.md when context gets large.
- Use Context7 only when current library docs are actually needed.
- Use Playwright only for visual/browser checks.
- Use semantic/code search only when file location is unclear.
- Work one phase at a time. Update HANDOFF.md and TASK_QUEUE.md after every phase.
- Do not re-explain the full product vision repeatedly.
- Use Headroom if available; continue without blocking if unavailable (do not install it).

## Ponytail-style discipline (enforced)

Before writing any new code:
1. Can existing code be reused?
2. Can an existing component be adapted?
3. Can shadcn/Radix solve this?
4. Can Skiper UI / Cult UI / Watermelon UI / Magic UI / Aceternity / React Bits solve this?
5. Can CSS/tokens solve this?
6. Can a tiny helper solve this?
7. Is custom code truly necessary?

Custom code is allowed mainly for: CanvasView, renderer, pan/zoom/drag, organism/blob, graph/store sync, import/export glue, performance helpers. Do not write custom UI from scratch if a component library can handle it.

## Model / effort strategy

ZONUERT uses only three modes:

**LOW MODE** — Model: Sonnet 5 or Opus 4.8, Effort: medium. Use for docs, setup, resource index, handoff, checklists, audits.

**HIGH MODE** — Model: Fable 5, Effort: high. Use for graph schema, selectors, Zustand/store integration, table sync, import contract, normal implementation.

**ULTRA MODE** — Model: Fable 5, Effort: Ultracode/xhigh. Use only for premium visual implementation, organism/blob, selection arc, shader/gradient polish, animation, hard performance bugs.

Do not use Ultracode/xhigh for docs, setup, table sync, or small UI fixes.

## Asset/library-first rule

Allowed/recommended for UI and animation: shadcn/ui, Radix UI (this project's shadcn registry uses Base UI, see DECISIONS.md), Skiper UI, Cult UI, Watermelon UI, Magic UI, Aceternity UI, React Bits, 21st.dev Magic, Lucide, Sonner, Motion, GSAP.

Custom design/code is allowed only when: the component is unique to the ZONUERT canvas, a library component cannot solve it cleanly, or it affects renderer/blob/graph-sync/camera/drag/import-export.

Do not copy Palmer branding or copyrighted assets. Use Palmer as interaction/style reference only.

## ZONUERT REVIEW PACK (report format for every phase)

```
ZONUERT REVIEW PACK

MODEL:
EFFORT:
ULTRACODE USED: yes/no
PHASE:
BUILD STATUS:
FILES CHANGED:
LIBRARIES USED:
CUSTOM CODE WRITTEN:
COMPONENTS REUSED:
PONYTAIL CHECK:
- reused existing?
- used library first?
- avoided unnecessary custom code?

VISUAL STATUS:
- Palmer style:
- glass dock:
- left rail:
- loader:
- day/night:

SYNC STATUS:
- canvas/table:
- store:
- reset issue:

PERFORMANCE:
- cell count tested:
- lag:
- DPR/rAF:

BUGS:
NEXT:
```
