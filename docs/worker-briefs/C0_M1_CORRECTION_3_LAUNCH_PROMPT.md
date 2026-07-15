Continue the same authorized M1 task on repository `barc047-sketch/Mooorf`.

Read and obey:

`docs/worker-briefs/C0_M1_CORRECTION_3_OWNER_PATH_INSPECTOR_LAUNCH.md`

from:

`origin/docs/mooorf-ai-team-operating-protocol`

Critical requirements:

1. Work only on `feature/c0-m1-inspector-layer-editing-recovery`.
2. Verify the current reviewed head is exactly `c4f05a1b32029c6cb29f4cfaa41983ba7f77c8f9`.
3. Keep `main` unchanged at `c4600472ea76f651800c19b91cf8f67954ca992e`.
4. Reproduce the failure by clicking the actual rendered Dock and Rail `i` controls in the built application. Do not call the store, helper functions or `window.lab` directly.
5. Identify and document the real event/shell cause.
6. One pointer click, Enter or Space on either visible `i` control must show the full Inspector in Canvas and Table, including no-selection, closed, minimized, background and off-screen states.
7. Use one canonical Inspector command and the existing WidgetHost/WidgetFrame/store. Do not create a duplicate Inspector or DOM hack from Dock/Rail.
8. Add stable `data-command="open-inspector"` identity and truthful accessibility state to both visible controls.
9. Add real-shell browser integration tests that click the actual controls and assert exactly one visible, expanded, reachable Inspector.
10. Record actual button bounds, event target/path and resulting Inspector bounds at 1440×900 and 1280×800.
11. Run affected tests, typecheck, exact diff check from `c4f05a1b...`, exactly one final production build, and deterministic viewport QA.
12. Update the M1 report, ownership map and `status/codex`.
13. Push one corrected fixed head, return to `WAITING_REVIEW`, and stop.
14. Do not merge and do not begin M2, shadow controls, runtime gates, Quick Bar or snapping.