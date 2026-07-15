# Codex Correction Contract — C0 M1 Cancel Semantics and Inspector Status Truth

**TASK:** `C0-M1-CORRECTION-1`
**STATUS:** Required correction under the already-authorized M1 contract
**WORKER:** Same Codex M1 implementation session
**WORK BRANCH:** `feature/c0-m1-inspector-layer-editing-recovery`
**CURRENT REVIEWED HEAD:** `e9bd67e8c7778dccdd4afb4c1508db0792e70b21`
**PRODUCTION MAIN:** must remain `c4600472ea76f651800c19b91cf8f67954ca992e`

## Why correction is required

The fixed-head review found a real data-integrity defect not covered by the source-string contract tests.

### Defect 1 — Escape commits instead of cancelling

In `src/views/TableView.tsx`:

- `AreaCell` handles Escape by clearing local draft and calling `blur()`.
- Its `onBlur` handler immediately calls `commit(event.target.value)`.
- The edited DOM value can therefore be committed on Escape.

In `TextCell`:

- Escape calls `setDraft(canonical)` and then `blur()`.
- `onBlur={commit}` runs before React has rendered the restored canonical draft.
- The closure still contains the edited draft, so Name or Body can be committed on Escape.

In `src/ui/widgets/InspectorWidget.tsx` `ContentField`:

- Escape also calls `setDraft(canonical)` and `blur()`.
- `onBlur={commit}` can commit the edited Name, Area or Body instead of cancelling.

This violates the locked M1 contract: Escape must restore the exact pre-edit value and create no history transaction.

### Defect 2 — Inspector context badge is semantically false

The Inspector header currently labels every single selected Cell `Local` and every multi-selection `Mixed`, regardless of whether appearance/text values inherit Project Defaults or are actually mixed.

The header must either:

- use truthful scope-only labels such as `Selected` and `Multi`, while inheritance is shown in the relevant sections, or
- compute and display an actual canonical inheritance state.

It must never imply a Local Override or Mixed state solely from selection count.

## Required correction

1. Add explicit cancel guards for Inspector and Table content fields so Escape:
   - restores the canonical pre-edit draft,
   - suppresses the following blur commit,
   - creates zero history entries,
   - works for Name, Area and Body.
2. Preserve outside-click/normal blur commit.
3. Preserve Enter commit and Shift+Enter Body line breaks.
4. Ensure Enter creates exactly one effective history transaction; a blur following Enter must not create another transaction.
5. Correct the Inspector header badge to truthful scope/inheritance language.
6. Add behavioral tests that execute the cancel/commit state machine. Do not satisfy this correction with regex/source-presence assertions alone.
7. Add focused coverage for:
   - Table Name Escape,
   - Table Area Escape,
   - Table Body Escape,
   - Inspector Name Escape,
   - Inspector Area Escape,
   - Inspector Body Escape,
   - normal blur commit,
   - Enter one-transaction commit,
   - Shift+Enter Body does not commit,
   - header status truth.
8. Update the M1 implementation report and control ownership map only where needed.

## Verification

Run:

- all new focused behavioral tests,
- affected existing M1 tests,
- application typecheck,
- `git diff --check e9bd67e8c7778dccdd4afb4c1508db0792e70b21...HEAD`,
- one final production build after corrections,
- deterministic browser QA at 1440×900 and 1280×800 covering Escape in Table and Inspector, not only inline editing.

## Completion

Push the corrected fixed head to the same branch, update `worker-status/CODEX.json` on `status/codex` with:

- status `WAITING_REVIEW`,
- previous reviewed head `e9bd67e8c7778dccdd4afb4c1508db0792e70b21`,
- corrected feature SHA,
- focused correction tests and QA evidence.

Stop. Do not merge. Do not start M2.
