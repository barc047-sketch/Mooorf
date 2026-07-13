# C0.4 Architecture Audit Review

**Status:** Owner-approved audit review
**Source audit:** Antigravity C0.4 modular layer architecture audit
**Audited production base:** `a0f7b33d4e13ad72d5203141d7688794ad377446`
**Product-code effect:** None

## Verdict

`PASS WITH REQUIRED ARCHITECTURE CORRECTIONS`

Antigravity correctly inspected the merged production architecture, identified major renderer/export/state risks, produced the required ownership and sequencing artifacts, and changed no product code.

The audit is accepted as architecture evidence. Its proposed implementation slices are refined below before any Codex implementation begins.

## Accepted findings

- Classic and Organism/WebGL parity is a primary implementation risk.
- DOM/HTML overlay content can drift from renderer output during export unless one projection/transform contract is used.
- Per-Cell visual settings should use sparse overrides rather than complete duplicated objects.
- Selection and editing feedback are temporary UI and must never be exported as architectural content.
- Cell, Boundary, Membrane, Membrane Edge, Core, Void, labels and markup require explicit ownership.
- Area edits must follow one canonical data/geometry path.
- Table surfaces are projections over central state, not independent databases.
- C0.4 must be split into independently auditable slices.

## Required corrections

### 1. Keep architectural data and presentation overrides separate

Do not add a large list of flat appearance fields directly to `SpaceCell`.

Preferred conceptual structure:

```text
SpaceCell
├── architectural data
├── appearance?: CellAppearanceOverrides
└── label?: CellLabelOverrides
```

Project defaults remain separate:

```text
ProjectPresentationDefaults
├── Cell
├── Boundary
├── Core
├── Label
└── Selection UI defaults
```

Future Annotation Cards remain a separate project collection and never become embedded Cell properties.

### 2. Split renderer work by renderer

Do not combine Classic and Organism/WebGL layer separation in one implementation task.

Classic and Organism have different drawing technologies, constraints and export paths. Each receives its own implementation and audit gate.

### 3. Establish baseline capability before advanced styling

C0.4 establishes independent ownership and a minimal production-safe baseline.

Baseline Boundary:

- visible/off,
- basic solid style,
- width,
- offset,
- colour/material reference,
- persistence/export ownership.

Baseline Core:

- visible/off,
- dot,
- size,
- colour/material reference,
- persistence/export ownership.

Advanced dashed, dotted, double, technical, gradient, pattern and additional Core shapes are valuable for 2D technical illustration and remain approved future scope. They are stored in `docs/later-scope/` rather than forgotten or rejected.

### 4. Do not widen C0.4 into a complete history rewrite

C0.4 may add history boundaries required by new layer-setting commands.

It must not refactor every drag/preview/history interaction unless an existing blocker is proven. A wider interaction-history system remains later scope.

### 5. Keep Area geometry implementation in C0.5

C0.4 guarantees that presentation styling cannot corrupt Cell area or hit testing.

C0.5 implements the canonical command:

```text
Canvas / Inspector / Table Area edit
→ central Area update
→ areaToRadius
→ Canvas, Table, Dashboard and Export update
```

### 6. Reserve future layers without implementing future features

C0.4 reserves modular ownership for:

- Cell Labels,
- Flag leader overlay,
- future Annotation Card overlay,
- selection/editing overlay,
- renderer/export adapters.

C0.4 does not implement Annotation Cards, advanced Flags, advanced Boundary styles, advanced Core shapes or Material Browser UI.

## Mandatory modularity rules

- One canonical project-data source.
- One material registry/resolver.
- One icon/symbol registry.
- Sparse presentation overrides.
- Separate resolver, renderer, export and Inspector adapters.
- No mega-component containing all layer logic.
- No duplicate Classic/WebGL state.
- No UI-only data stored as architectural content.
- Every slice must have focused contracts and an independent audit before merge.

## Next implementation reference

See:

`docs/C0_4_SAFE_IMPLEMENTATION_SLICES.md`

Future approved-but-deferred scope is indexed at:

`docs/later-scope/README.md`
