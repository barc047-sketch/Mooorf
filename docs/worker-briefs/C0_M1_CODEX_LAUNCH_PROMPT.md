# Codex Launch Prompt — C0 M1

Execute authorized task `C0-M1` for repository `barc047-sketch/Mooorf`.

Read and obey the complete contract first:

`docs/worker-briefs/C0_M1_CODEX_PRODUCTION_INSPECTOR_LAYER_EDITING_RECOVERY.md`

The contract is on branch:

`origin/docs/mooorf-ai-team-operating-protocol`

Critical start rules:

1. Do not start from `main`.
2. Fetch all remotes and verify:
   `origin/feature/c0-4f-a-runtime-layer-separation` = `21388c0d765cd4bbc675d0321d94e77db9a41e5c`.
3. Create/switch to:
   `feature/c0-m1-inspector-layer-editing-recovery`
   directly from exact SHA `21388c0d765cd4bbc675d0321d94e77db9a41e5c`.
4. Keep production `main@c4600472ea76f651800c19b91cf8f67954ca992e` unchanged.
5. Update `worker-status/CODEX.json` on `status/codex` to `RUNNING` with the exact M1 base and branch.
6. Implement the entire bounded contract. Do not reduce it to a prototype or cosmetic panel.
7. Selectively reuse the Claude Inspector prototype only as visual/interaction evidence; never merge its mock store or shell.
8. Preserve future M2 compatibility with the audited C0.2 registry and Antigravity symbol research, but do not implement the Symbol library in M1.
9. Run all required tests, typecheck, diff check, exactly one final production build, and deterministic 1440×900 / 1280×800 QA.
10. Push one fixed feature head, update status to `WAITING_REVIEW`, and stop. Do not merge and do not begin M2.

Required M1 outcome:

- canonical Name, Area and Body/subtext editing from inline Cell editor and Inspector,
- minimal Table sync for Name/Area/Body only,
- compact Content and Appearance Inspector,
- coordinated text presets, Text Size, Text Colour and Auto Contrast,
- Cell, Boundary, Membrane, Membrane Edge, Core and Void editing,
- six separate detailed settings widgets,
- Project Default / Local Override / Mixed,
- one-transaction history and ephemeral previews,
- persistence/migration/export parity,
- complete documented migration or removal of every stale/broken/no-op visual control,
- no new duplicate store, registry, history, renderer settings owner or export path.

Do not ask the Owner routine implementation questions. Resolve details from the contract, exact repository state, existing production owners and recorded prototype/research evidence. Escalate only a proven blocker that cannot be safely resolved within the contract.
