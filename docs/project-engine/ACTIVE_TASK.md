# Active Task

## R5.5 FINAL EDITORIAL LEGEND SETTINGS UX PASS

Status: LOCAL UNCOMMITTED / FINAL SETTINGS UX PASS APPLIED / AUTOMATED CHECKS PASSED / PREVIEW AVAILABLE / WAITING OWNER QA

- branch: `work/next-feature`;
- starting Owner-accepted R5 checkpoint: `833ca108b14bdaa474be39fead710136bf211ab5`; remote feature HEAD intentionally remains `e9f9219524e2f4721670151340456a7e92bfab77`;
- Relationship Manager owns one `LEGEND` action beside Settings; it opens or focuses one independent registry-hosted `RELATIONSHIPS` frame and never replaces the Manager's `TYPES` or `CONNECTIONS` content;
- the Manager retains its accepted `40vw × 78vh`, `44vw × 85vh` bounded geometry and remains usable while the detached Legend is open;
- the Legend is frameless and independently movable, minimizable, closable and resizable on both axes from thin vertical to wide shallow compositions; only tiny vertically stacked top-right controls remain and the invisible outer-shell drag region reuses WidgetFrame;
- the Legend’s vertical resize floor derives from a shallow current-width projection plus actual frame border/control clearance, so the historical workspace `180px` minimum, prior growth and empty-state content never reserve obsolete height; no-scroll growth remains bounded and one-way only;
- `src/domain/connections/relationshipLegend.ts` is the React-free export-ready projector from canonical Types, canonical Connection usage, resolved styles, semantic config and width/height into items, grid placement and bounds;
- `settings.connectionView.legend` is the single normalized config owner for layout mode, rows, density, specimen length/weight, Text Width `80–320px`, text alignment, semantic text X/Y placement, scope and content toggles; all controls live in compact `LEGEND SETTINGS` inside Manager Settings, while the detached output contains no toolbar;
- the floating frame's x/y/width/height are session-only workspace UI state outside project persistence, Relationship Type data and history;
- Auto, Horizontal and Vertical are the exact layout modes; Horizontal fills down with four rows by default, Vertical fills across, and Auto responds deterministically to available width and height;
- All Active is default, archived Types are excluded, Used Only derives from canonical Connections, and stable Manager order remains independent of authoring MRU;
- Compact/Standard/Large density now creates materially tighter technical-drawing rhythm; Short/Standard/Long controls specimen extent independently, and Style/Name/Code/Description allocates no disabled secondary baseline;
- Legible weight applies only a preview minimum to thin Legend samples, while True preserves authored width; canonical Type/Connection style, Canvas rendering, clipboard and history remain unchanged;
- Long Dash, Dash-Dot-Dot, Sparse Dot and Centerline extend the one registry as parameter-driven base families; Pattern Scale controls spacing/repetition and no loose/dense duplicate families were added;
- the shared adaptive style specimen renders resolved advanced patterns, Hash/Hatch distinction, markers, width, color and opacity without X-stretching or Canvas-camera coupling;
- `LEGEND SETTINGS` now uses the actual shared `.glass` Morph-glass primitive rather than a local background approximation; icon-first segments, visual specimen-length marks, a numeric Text Width field and compact content toggles preserve the existing control language; Relationship Manager ranges continue to reuse `SliderRow`/`org-slider` rather than native browser styling;
- Text Width participates in the pure Legend grid's readable width/reflow; Text Align, X and Y placement update the detached output immediately through semantic config without per-Type coordinates, item dragging, extra row height or history;
- the pure projection is ready for future Sheet and authored export consumers, but no Sheet placement, PNG/SVG/PDF/presentation export, Matrix or DOM-scraping path was added;
- 23 affected final-settings contracts pass, covering shared Morph glass, visual controls, semantic Text Width/alignment/placement normalization and reflow, no phantom height, no-scroll growth, frameless controls and shared slider reuse; exact TypeScript, tracked/untracked whitespace checks and the current-worktree HTTP 200 preview check pass;
- `http://127.0.0.1:5173/` serves the current worktree for Owner QA;
- no browser automation, production build, commit, push, merge, actual export, Sheet placement, Matrix, Classic, renderer rewrite or dependency work occurred.

Next safe action:

Owner visual, resize and interaction QA for the final R5.5 Legend Settings pass. Finalization, commit, push, merge and branch cleanup each require separate explicit authority.
