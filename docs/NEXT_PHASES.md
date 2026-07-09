# Next Phases

Purpose: living roadmap after V6L/V6M.

## Current Order

1. V6LQ Shader / Void QA
2. V6.5 Selection Arc + Canvas Rename
3. V6N Interface Density / Design Refinement
4. V7 Stats Widgets
5. V8 Export / Import Polish
6. V9 Floor System
7. V10 Performance Scaling / Texture-Buffer Renderer

## V6LQ — Shader / Void QA

Why: V6L touched shader behavior, saved-view data, table rows, and fallback rendering. It needs focused stabilization before direct canvas editing.

Codex only: yes. This is QA/bugfix work.

Do not use Claude unless visual design direction changes, which this phase should not do.

## V6.5 — Selection Arc + Canvas Rename

Why: users need direct manipulation around selected nuclei: rename, area adjustment, focused actions, and refined selection affordances.

Codex only: yes for implementation and QA. Keep the arc restrained and use existing store actions.

Claude currently not used. Use Claude only if a new visual concept is requested.

## V6N — Interface Density / Design Refinement

Why: the premium UI is functional but needs a density pass after shader/selection stabilize, especially widgets, 390 px layout, high-density labels, and dock/rail balance.

Codex only: preferred for controlled refinement. Claude is allowed only if the user explicitly requests design-heavy coding.

## V7 — Stats Widgets

Why: floating metric widgets can surface area totals, warnings, category mixes, selected-space facts, and graph-derived stats.

Codex only: yes if using existing widget system. Claude not needed unless redesigning the widget language.

## V8 — Export / Import Polish

Why: import/export placeholders exist; users will need reliable data movement and presentation outputs.

Codex only: yes. Use existing libraries already in `package.json`; do not add packages unless explicitly required.

## V9 — Floor System

Why: domain graph docs already include floor concepts, but runtime floor workflows are not active in the main canvas.

Codex only: yes for data/model/UI integration. High risk: do not rewrite store/graph without a phase plan.

## V10 — Performance Scaling / Texture-Buffer Renderer

Why: current WebGL renderer uses uniform arrays capped at 96 nuclei. Larger projects need a texture/data-buffer nuclei input path and density-aware labels.

Codex only: yes for engine work. Claude is not relevant.

## Tool Policy

- GitHub is source of truth.
- Codex is the code agent.
- ChatGPT is planning/prompt/audit.
- Claude is currently not used unless the user explicitly requests design-heavy coding.
- Antigravity or other future tools may be evaluated later, but they must not become source of truth or own product data.
