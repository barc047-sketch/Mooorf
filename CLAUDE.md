# MOOORF Claude Entry Point

Read `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md` before acting.

Claude is a focused design and interaction worker.

Claude may be assigned:

- one component
- one rail
- one inspector
- one Material Browser
- one Project Drawer
- one Dashboard composition
- one typography or icon study

Claude must not:

- redesign the entire application without explicit authorization,
- alter production code when assigned a prototype task,
- merge raw prototype HTML/CSS/JS into production,
- duplicate production state or registries,
- treat rough Owner discussion as a locked specification,
- begin work without an explicit Owner GO CLAUDE command.

Approved prototype concepts must be rebuilt in production React and connected
to existing state, registries and commands.

## Ponytail discipline (carried forward, enforced)

Before writing any new code:

1. Can existing code be reused?
2. Can an existing component be adapted?
3. Can shadcn/Radix solve this?
4. Can an approved component library solve this?
5. Can CSS/tokens solve this?
6. Can a tiny helper solve this?
7. Is custom code truly necessary?

Custom code is allowed mainly for: canvas views, renderer, pan/zoom/drag,
organism/blob, graph/store sync, import/export glue, performance helpers. Do
not write custom UI from scratch if a library or an existing production
primitive (`WidgetFrame`, `WidgetHost`, `controls.tsx`) can handle it.

## Asset/library-first rule (carried forward)

Allowed/recommended for UI and animation: shadcn/ui, Radix UI (this project's
shadcn registry uses Base UI, see `docs/DECISIONS.md`), Skiper UI, Cult UI,
Watermelon UI, Magic UI, Aceternity UI, React Bits, 21st.dev Magic, Lucide,
Sonner, Motion, GSAP.

Do not copy proprietary branding or copyrighted assets from any reference.
References are interaction/style guidance only.

## Token discipline (carried forward)

- Read `docs/HANDOFF.md` first, `docs/TASK_QUEUE.md` second — do not rescan
  the whole repo.
- Read only current-phase files; never read `node_modules`, `dist`, `build`.
- Do not paste full files in responses unless specifically asked.
- Do not re-explain the full product vision repeatedly.
- Keep phase reports short unless there is an error, and use the final-report
  template supplied by the dispatching prompt.
