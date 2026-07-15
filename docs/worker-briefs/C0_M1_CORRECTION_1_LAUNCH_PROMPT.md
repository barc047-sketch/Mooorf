Continue the same authorized M1 task on repository `barc047-sketch/Mooorf`.

Read and obey:

`docs/worker-briefs/C0_M1_CORRECTION_1_CANCEL_AND_STATUS_TRUTH.md`

from:

`origin/docs/mooorf-ai-team-operating-protocol`

Critical requirements:

1. Work only on `feature/c0-m1-inspector-layer-editing-recovery`.
2. Verify the current reviewed head is exactly `e9bd67e8c7778dccdd4afb4c1508db0792e70b21` before editing.
3. Keep `main` unchanged at `c4600472ea76f651800c19b91cf8f67954ca992e`.
4. Fix Escape cancellation in Table Name, Area and Body plus Inspector Name, Area and Body. Escape must restore the pre-edit value and create zero history transactions.
5. Preserve normal blur/outside commit, Enter commit, and Shift+Enter Body line breaks.
6. Ensure Enter results in exactly one effective history transaction.
7. Correct the Inspector header badge so it never labels every single selection `Local` or every multi-selection `Mixed` solely from selection count.
8. Add executable behavioral tests; regex/source-presence assertions are insufficient for the cancellation state machine.
9. Run focused tests, affected M1 tests, typecheck, exact correction diff check, one final build, and 1440×900 plus 1280×800 browser QA that explicitly tests Table and Inspector Escape.
10. Push one corrected fixed head, update `status/codex` to `WAITING_REVIEW`, and stop.
11. Do not merge and do not start M2.
