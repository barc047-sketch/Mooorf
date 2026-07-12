# V8.2C0.1 Manual QA

Use `[x] YES`, `[x] NO`, or `[x] PARTIAL`. Target 1440 desktop and 1280 laptop.

- [x] YES — Empty startup shows one Canvas and no ORG/CLS renderer control.
- [x] YES — 30 plain Cells fit and remain directly manipulable at 1440.
- [x] YES — 42 Cells remain visible and usable at 1440.
- [x] YES — Motion Off leaves the renderer asleep while idle.
- [x] PARTIAL — Pan lifecycle passed contracts; post-fix visual sweep deferred.
- [x] PARTIAL — Zoom/label-scale contracts passed; post-fix visual sweep deferred.
- [x] PARTIAL — Single-drag commit contract passed; post-fix visual sweep deferred.
- [x] PARTIAL — 10-Cell group offsets passed contracts; post-fix visual sweep deferred.
- [x] PARTIAL — Group Undo/Redo passed contracts; post-fix visual sweep deferred.
- [x] YES — Body double-click opens Name focused with existing text selected.
- [x] PARTIAL — Label/area activation passed the shared contract; body activation was visually checked.
- [x] YES — Tab moves Name to Area; Shift+Tab remains native.
- [x] YES — Enter commits valid Name/Area as one Undo transaction.
- [x] PARTIAL — Escape was checked live; outside/invalid-Area paths passed contracts.
- [x] YES — Morph Off shows Cells without a Membrane.
- [x] YES — Morph On visibly renders the Membrane without changing renderer.
- [x] YES — Motion On visibly animates through one scheduler and stops when Off.
- [x] YES — Primary selection is one solid external ring.
- [x] YES — Secondary selection is one weaker dashed external ring.
- [x] PARTIAL — Core/Boundary/Void/radial independence passed contracts; visual sweep deferred.
- [x] PARTIAL — Dock scale/lift code is absent; full hover/focus visual sweep deferred.
- [x] YES — 1280 keeps the Canvas, Dock, rail, and inline editor reachable.
