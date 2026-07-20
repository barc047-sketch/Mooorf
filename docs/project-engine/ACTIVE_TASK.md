# Active Task

## WAITING OWNER QA — Organism Cell Label Correction 3

**Status:** FINALIZED / NOT MERGED / WAITING OWNER QA

**Branch:** `work/next-feature`

**Correction source:** `411e4fb01d9ae41fab85ebd0613c984e23e0b35e`

**Correction product commit:** `48611c285dac6c11583ba8df251da01237e561b0`

Completed scope:

- direct left-Dock Label Studio and Membrane Detail launchers reuse `openWidget`, reveal/minimize/focus behavior and active state;
- the dedicated Membrane Detail launcher suppresses the generic duplicate when Membrane is the active appearance family;
- selected-state camera feedback remains deterministic, bounded and active for the full selection lifetime, then settles only after deselection;
- Off, reduced-motion, Table/suspended runtime, exports, canonical camera coordinates and Undo/Redo remain unaffected.

Verification recorded:

- focused Dock/widget and camera-shake contracts;
- TypeScript, final diff check and one production build;
- Codex browser checks at 1440×900 and 1280×800 with no console errors.

## Next safe action

Owner QA of Correction 3 on `work/next-feature`.

Do not merge, modify `main`, begin a later product phase, or modify Classic without a separate explicit Owner command.
