# Performance and Token Strategy

## Runtime
- Canvas/Pixi for live rendering
- React for UI overlay only
- requestAnimationFrame
- throttle store updates
- debounce blob
- lower quality during interactions
- clamp DPR in fullscreen
- avoid thousands of DOM nodes
- target 50 cells acceptable

## Claude
- read summary docs first
- do not load whole repo repeatedly
- use Context7 for libraries
- use Playwright for visual tests
- update HANDOFF.md
- one phase at a time

## Token-saving rules
- Read HANDOFF.md and TASK_QUEUE.md before every phase.
- Do not rescan the whole repo.
- Do not paste full files unless specifically asked.
- Keep phase reports under 120 words unless there is an error.
- Run build only at the end of a phase unless fixing errors.
- Use /compact or HANDOFF.md when context gets large.
- Use Context7 only when current library docs are actually needed.
- Use Playwright only for visual/browser checks.
- Use semantic/code search only when file location is unclear.
- Work one phase at a time; update HANDOFF.md after every phase.
- Do not explain the full product vision repeatedly.

## Ponytail-style logic (apply before writing new code)
1. Can existing code be reused?
2. Can an existing component be adapted?
3. Can shadcn/Radix solve this?
4. Can Skiper UI / Cult UI / Watermelon UI / Magic UI / Aceternity / React Bits solve this?
5. Can CSS/tokens solve this?
6. Can a tiny helper solve this?
7. Is custom code truly necessary?

Custom code is allowed mainly for: CanvasView, renderer, pan/zoom/drag, organism/blob, graph/store sync, import/export glue, performance helpers. Do not write custom UI from scratch if a component library can handle it.

## Headroom status
- not checked (not installed; not required)
- Suggested usage only if environment clearly supports it: `headroom wrap claude`, `headroom wrap claude --memory`
- Do not block phases if Headroom is unavailable.
