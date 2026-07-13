# C0.3A Codex Brief — Annotation Card Prototype Extension

CODER: Codex  
MODEL: Sol / strongest available GPT-5 Codex implementation mode  
EFFORT: High  
TASK TYPE: Isolated visual/interaction prototype extension and production handoff  
ROLE: Recoverable modular prototype engineer  
PARALLEL WORKER: None. Antigravity remains on hold until a fixed completed commit exists for audit.

## Objective

Extend the accepted Cell Inspector V2 prototype with one standalone **Annotation Card** system while preserving the accepted Cell Inspector work.

Also correct two prototype QA blockers:

1. Cell Area edits must visibly resize the Cell through shared prototype state.
2. The hard narrow-laptop blocker must be removed or changed into a non-blocking compact mode.

Do not implement production code.

## Locked scope

Read first:

`docs/worker-briefs/C0_3A_ANNOTATION_CARD_LOCKED_SCOPE.md`

The locked scope explicitly removes Linked Callout. Do not implement leaders, anchors, flags, linked targets, callout direction or leader distance.

## Verified source

Repository:

`/Users/tanisxq/Documents/ZONU0`

Accepted prototype source:

- branch: `design/c0-3-cell-inspector-v2-lab`
- exact commit: `462bf9bacbb1ee60015fc1e794539ab3b25f6b97`

Production visual/token reference only:

- `origin/main`
- exact SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

Create a new isolated branch from the exact prototype commit:

`design/c0-3a-annotation-card-lab`

Preferred worktree:

`/Users/tanisxq/Documents/ZONU0-CODEX-C0-3A`

Fetch remotes and verify both exact SHAs before editing. Stop if either cannot be verified.

Preserve:

- `.claude/launch.json`,
- local-only `.references/`,
- the accepted prototype commit and branch,
- primary `/Users/tanisxq/Documents/ZONU0` checkout.

Never switch, reset, stash, clean or modify the primary checkout.

## Worker status

Follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Before work publish:

- branch: `status/codex`
- file: `worker-status/CODEX.json`
- worker: `Codex`
- model: `Sol / GPT-5 Codex`
- status: `RUNNING`
- task: `C0.3A Annotation Card prototype extension`
- source branch: `design/c0-3-cell-inspector-v2-lab`
- source SHA: `462bf9bacbb1ee60015fc1e794539ab3b25f6b97`
- work branch: `design/c0-3a-annotation-card-lab`

Update status after source verification, modular split, Annotation Card interaction completion, table/Area correction, viewport verification and final push.

Finish at `WAITING_REVIEW`, not `DONE`, because Owner visual QA is required.

## Required reading

1. `docs/worker-briefs/C0_3A_ANNOTATION_CARD_LOCKED_SCOPE.md`
2. `docs/worker-briefs/C0_3_CELL_INSPECTOR_V2_SCOPE.md`
3. `docs/MOOORF_FINAL_SCOPE.md`
4. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
5. `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
6. `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md` from the coordination branch
7. `docs/MOOORF_CHANGE_CONTROL_PROTOCOL.md` from the coordination branch
8. accepted Cell Inspector V2 files and handoff at `462bf9b`
9. production token and WidgetFrame references at `92f4c64`, read-only

Do not scan unrelated repository folders.

## Product decision

The only new Canvas markup object in this task is:

`Annotation Card`

Content order:

1. optional transparent PNG logo,
2. Heading,
3. Body.

The selected-object Inspector title is:

`ANNOTATION CARD`

Linked Callout is removed. There must be no hidden or disabled callout controls.

## Part A — Preserve accepted Cell Inspector

Do not regress:

- Content / Symbol / Cell Style tabs,
- inline Name / Area / Body editing,
- Text Style / Text Size / Text Colour,
- project defaults and local overrides,
- symbol discovery and settings,
- Boundary and Core controls,
- Copy/Paste Style,
- selection keyline/orbit,
- day/night styling,
- compact control language.

The Annotation Card uses the same Inspector shell and shared visual controls rather than creating a second large settings panel.

## Part B — Annotation Card object

Add at least two sample cards to the prototype:

1. Narrative Card — Logo + Heading + Body.
2. Compact Card — Heading + short Body, logo optional.

The card must be:

- selectable,
- draggable,
- resizable using direct Canvas handles,
- export-content in the production handoff,
- separate from UI panels.

Prototype selection must switch the right Inspector context between:

- `CELL INSPECTOR`,
- `ANNOTATION CARD`.

## Part C — Annotation Card Inspector

Use compact modules/sections.

### Content

Expose only:

- Logo,
- Logo Placement,
- Heading,
- Body.

Logo Placement:

- None,
- Top,
- Bottom.

Heading and Body must be editable by:

- double-clicking the card,
- Inspector fields,
- Markup Table proof.

### Typography

Reuse accepted controls:

- Text Style,
- Text Size,
- Text Colour,
- Auto Contrast,
- Project Default / Local Override.

Heading and Body share the selected Text Style. Do not add separate font controls.

### Background

Expose:

- preset,
- colour/material,
- opacity,
- blur only when Glass is active.

Preset families:

- Glass Light,
- Glass Dark,
- Solid Light,
- Solid Dark,
- Tint,
- Outline,
- None.

Use compact segmented controls, dots, swatches and disclosures. Avoid large buttons and long forms.

## Part D — Logo behaviour

Logo source:

- transparent PNG only,
- mock project asset ID in the prototype,
- no duplicate asset bytes per card.

Render the PNG as a monochrome alpha mask using the same resolved Text Colour / Auto Contrast colour.

Do not provide:

- logo background,
- chip,
- backing rectangle,
- border,
- shadow,
- separate logo colour.

Top and Bottom placements must have intentional clear space from:

- card edge,
- Heading,
- Body,
- opposite card edge.

Use preset spacing. Do not add logo-spacing sliders.

Provide a clear invalid-file state for non-PNG or non-transparent prototype input. Do not accept SVG, JPEG or WebP in this first scope.

## Part E — Markup Table proof

Add a compact prototype-only Markup Table surface or drawer using the same Annotation Card record.

Required columns/fields:

- Heading,
- Body,
- Logo asset,
- Logo Placement,
- Text Style,
- Text Size,
- Text Colour / Auto Contrast,
- Background preset,
- Background colour/material,
- Opacity,
- Visibility.

Editing Heading or Body in the Markup Table updates the Annotation Card and Inspector immediately.

Changes from the card/Inspector update the Markup Table.

Do not create an independent table store.

## Part F — Cell Area size correction

Correct the existing prototype so one shared Cell Area value drives visible Cell size.

Area must be editable through:

- inline double-click editor,
- Cell Inspector,
- compact Space Table proof.

All three must update:

- displayed Area,
- Cell diameter/radius,
- Inspector value,
- table value.

Use a deterministic area-to-size formula suitable for the prototype. Document that production must reuse the canonical renderer geometry resolver rather than copying the prototype formula blindly.

Do not allow zero, negative, NaN or infinite Area.

## Part G — Viewport access

Replace the hard blocking screen with practical compact desktop behaviour.

Acceptance:

- owner can inspect at approximately 1024–1280 CSS pixels,
- Inspector may unpin or reduce width,
- table surface may use a compact drawer,
- no horizontal page overflow,
- no claim of phone/tablet support,
- optional non-blocking `Best at 1280px+` message is acceptable.

## Part H — Modular implementation

Do not append all new behaviour into one giant HTML or JavaScript file.

Create focused modules/files where practical, for example:

- `annotation-card-model.js`
- `annotation-card-renderer.js`
- `annotation-card-inspector.js`
- `annotation-card-logo.js`
- `annotation-card-appearance.js`
- `markup-table.js`
- shared typography resolver/adaptor

Exact names may differ, but separation of concerns is mandatory.

Avoid broad refactoring of accepted Cell Inspector logic. Extract only what must be shared.

The production handoff must map each concern to:

- central project/store ownership,
- shared typography owner,
- resource catalogue/project assets,
- material registry,
- WidgetHost/WidgetFrame,
- history transactions,
- persistence/migration,
- Canvas renderer,
- export adapters,
- Space Table / Markup Table projections.

## Part I — Explicit exclusions

Do not implement:

- production `src/` changes,
- production schema changes,
- real file upload/storage,
- Linked Callout,
- leaders or anchors,
- flag directions,
- leader length,
- relationship controls,
- Morph Bridge,
- full Markup toolkit,
- dimensions,
- arrows,
- shapes,
- multiple logos,
- SVG/JPEG logo support,
- a new font registry,
- a second material registry,
- a second project store,
- production Undo/Redo,
- real export,
- new packages,
- shell redesign,
- branch merge.

## Required prototype states

1. Cell selected with Cell Inspector.
2. Annotation Card selected with `ANNOTATION CARD` Inspector.
3. Narrative Card with Top logo.
4. Same card with Bottom logo.
5. Logo removed.
6. Auto Contrast shown on light and dark card backgrounds.
7. Heading/Body edit through card.
8. Heading/Body edit through Inspector.
9. Heading/Body edit through Markup Table proof.
10. Glass Light / Glass Dark / Solid / Outline / None background states.
11. Card move and resize.
12. Cell Area edited inline and Cell visibly resizes.
13. Cell Area edited through Inspector and Space Table proof.
14. Compact laptop viewport without blocker.
15. Day/night parity.
16. No Linked Callout UI anywhere.

## Deliverables

On the feature branch create/update:

- the interactive prototype,
- `C0_3A_ANNOTATION_CARD_DESIGN_NOTES.md`,
- `C0_3A_ANNOTATION_CARD_PRODUCTION_HANDOFF.md`,
- `C0_3A_ANNOTATION_CARD_MODULE_MAP.md`,
- `C0_3A_ANNOTATION_CARD_MANUAL_QA.md`,
- `C0_3A_ANNOTATION_CARD_REPORT.md`.

The module map must identify:

- module purpose,
- dependencies,
- data owner,
- renderer owner,
- export owner,
- table projection,
- safe redesign boundary,
- future expansion boundary.

## Verification

Run browser checks for:

- accepted Cell Inspector regression,
- card selection/context switching,
- all three content surfaces syncing,
- PNG-only logo validation,
- Top/Bottom logo spacing,
- Auto Contrast tint parity,
- background presets,
- drag/resize,
- Area-to-size synchronization,
- 1024/1180/1280/1440 layout behaviour,
- day/night.

Run:

- `git diff --check`,
- no package install,
- no production build required because this is a dependency-free prototype branch.

## Commit and push

Commit:

`design: add modular Annotation Card prototype`

Push:

`origin/design/c0-3a-annotation-card-lab`

Do not merge.

Finish `status/codex` at `WAITING_REVIEW` with:

- exact branch/head SHA,
- exact run command and URL,
- files changed,
- manual QA path,
- known limitations,
- confirmation that Linked Callout is absent,
- confirmation that production `src/` and package files were untouched.

PONYTAIL:
- reused: accepted Inspector shell, typography controls, Auto Contrast, compact controls and prototype state patterns
- adapted: shared context switching, table projection and direct manipulation
- new code justified: standalone Annotation Card model/view/Inspector/table modules only
- duplication avoided: no second text/material/store/export ownership