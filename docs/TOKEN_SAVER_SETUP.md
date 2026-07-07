# Token Saver Setup

Working discipline for every ZONUERT phase. Canonical sources: CLAUDE.md, [PERFORMANCE_AND_TOKEN_STRATEGY.md](PERFORMANCE_AND_TOKEN_STRATEGY.md).

## Headroom
- Status: **optional / not checked deeply**. Not installed, not required.
- If the environment clearly supports it: `headroom wrap claude` (optionally `--memory`).
- Never block a phase on Headroom; never install it.

## Reading rules
- HANDOFF.md first, TASK_QUEUE.md second — never rescan the whole repo.
- DECISIONS.md only for architecture calls; BUGS.md only when bug-fixing; package.json only for dependency awareness.
- Never read node_modules, dist, build, .next, coverage, *.tsbuildinfo, package-lock.json (also blocked by `.claude/settings.json` deny rules).
- Only read current-phase files; use search only when a location is unclear.

## Output rules
- No full-file pastes unless explicitly asked.
- Phase reports under 120 words unless there is an error (some phases specify their own cap).
- Do not re-explain the product vision.

## Build rule
- `npm run build` only at phase end, or while actively fixing a build error. Docs-only phases skip the build.

## Context strategy
- Use `/compact` or lean on HANDOFF.md when context grows; HANDOFF.md is updated after every phase so any session can resume from it.

## Ponytail (before ANY new code)
1. Reuse existing code → 2. adapt existing component → 3. shadcn/Base UI → 4. Skiper/Cult/Watermelon/Magic/Aceternity/React Bits/glasscn → 5. CSS/tokens → 6. tiny helper → 7. custom only if unavoidable. Custom is expected only for: CanvasView, renderer, pan/zoom/drag, selection arc (if lighter than a dependency), organism/blob, graph/store sync, import/export glue, performance helpers.

## Model routing
- **LOW** — Sonnet 5 / Opus 4.8, medium effort: docs, setup, resource index, handoff, checklists, audits.
- **HIGH** — Fable 5, high effort: graph schema, selectors, store integration, table sync, import contract, normal implementation.
- **ULTRA** — Fable 5, Ultracode/xhigh: ONLY premium visual implementation, organism/blob, selection arc, shader/gradient polish, animation, hard performance bugs. Never for docs, setup, table sync, or small UI fixes.
