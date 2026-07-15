# AG3 — Antigravity Visual Systems Research Atlas

**Worker:** Antigravity  
**Mode:** Research, audit and specification only  
**Owner authorization:** `GO ANTIGRAVITY AG3`  
**Work branch:** `research/ag3-visual-systems-atlas`  
**Exact base:** `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`  
**Production milestone running in parallel:** C0 M2 on `feature/c0-m2-advanced-inspector-symbols-runtime-gates`

## 1. Purpose

Create a production-useful visual-systems atlas for MOOORF without changing production code or duplicating AG2. The work must help Codex and the Owner make fast, grounded decisions about:

1. advanced Organism shader controls and safe ranges;
2. curated Cell/Membrane colour and material systems;
3. the actual M2 symbol priority shortlist and visual consistency;
4. reusable visual preset recipes for M2 review and M4 Materials/Presets.

This is not a request for another giant random icon list, a shader rewrite, or palette inflation.

## 2. Read-only evidence

Inspect exact repository evidence:

- production base: `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`;
- M2 contract: `docs/worker-briefs/C0_M2_CODEX_ADVANCED_INSPECTOR_SYMBOLS_RUNTIME_GATES.md` on `origin/docs/mooorf-ai-team-operating-protocol`;
- M2 Owner preview: `docs/plans/C0_M2_OWNER_PREVIEW_INSPECTOR_ADVANCED_SYMBOLS.md`;
- Fast Owner-QA policy: `docs/governance/FAST_OWNER_QA_MODE.md`;
- current shader: `src/experiments/organism-lab/organism-shader.ts`;
- runtime renderer and projection owners under `src/canvas/`;
- palette library: `src/design/palettes.ts`;
- material registry and built-ins under `src/materials/`;
- current presentation schema/defaults/resolution under `src/domain/presentation/`;
- accepted AG2 research: `research/m2-prototype-and-icon-gap-audit@55bbda488ae223a6ad53de8cc2a5ea5de0cdcf51`;
- baseline registry: `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`;
- earlier symbol research: `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`;
- Claude Inspector prototype: `design/c0-3-cell-inspector-v2-lab@462bf9bacbb1ee60015fc1e794539ab3b25f6b97`.

Research may use official/primary documentation for WebGL/GLSL, colour accessibility and licensed icon sources. Cite sources durably. Do not use unknown-license SVG sites or unverified shader snippets.

## 3. Workstream A — Shader Control Atlas

Map existing canonical shader/runtime parameters into truthful user-facing controls. Do not invent a control unless an existing renderer owner or a clearly bounded M2 owner can support a visible effect.

Cover at minimum:

- mass/influence;
- iso threshold/level;
- Field Edge Softness/body feather;
- surface tension;
- connection bias;
- pocket/inner-field behavior where it already exists;
- Membrane opacity;
- independent Membrane Edge width and proposed Edge Softness;
- spatial Cell-gradient dominance and body colour mixing;
- Cell Shadow opacity, softness, X/Y offset and spread;
- motion speed, response, drift, breathing, wobble and phase only where current architecture can own them truthfully;
- hard runtime gates for Membrane, Membrane Edge, Shadow and Motion.

For every control specify:

- canonical code owner/uniform/state field;
- plain-language visual effect;
- recommended minimum, default and maximum;
- safe UI step size;
- recommended control type;
- interactions with other controls;
- dangerous or visually broken combinations;
- performance tier: low, medium or high;
- whether it should be Basic, Advanced, hidden or deferred;
- day/night implications;
- export behavior/fallback;
- whether Off must skip owned work;
- acceptance observation for the Owner.

Do not claim numerical ranges are proven unless they are supported by existing code or a bounded reproducible experiment. Mark inferred ranges as recommendations.

## 4. Workstream B — Palette and Material Curation

Audit the existing palettes and material registry. Curate; do not expand indiscriminately.

Produce a production shortlist containing approximately:

- 6–8 essential Cell/category palettes;
- 6–8 essential Membrane palettes/material modes;
- optional secondary sets for later packs only when justified.

For each shortlisted palette include:

- exact existing palette/material ID where available;
- intended architectural use;
- day and night behavior;
- recommended Cell/Membrane pairings;
- Auto Contrast behavior;
- colour-blind distinguishability notes;
- print/export-safe fallback;
- whether it is essential, useful later, or reject;
- risks such as muddy mixing, low contrast, excessive saturation or cheap/neon appearance.

Also specify:

- a neutral UI rule: interface remains black/white/grey/glass with restrained MOOORF red signals;
- category colour recommendations;
- privacy colour recommendations;
- Cell Gradient versus Solid Membrane pairing rules;
- canonical MOOORF identity set;
- combinations that must not ship;
- accessibility contrast guidance without flattening the premium editorial character.

Do not edit production palette values. Do not create hundreds of new colours. New suggestions must be clearly separated from existing canonical IDs.

## 5. Workstream C — M2 Symbol Visual-QA Shortlist

Reconcile the existing symbol inventories rather than conducting another broad search.

Audit:

- 77 baseline symbols;
- 59 verified Lucide additions;
- 14 aliases;
- 8 complete original custom-symbol briefs;
- 12 pending custom-gap candidates;
- 5 rejects.

Produce the actual staged M2 shortlist with classifications:

- M2 Essential — students;
- M2 Essential — professionals/architects;
- M2 Useful;
- later domain pack;
- alias only;
- reject/duplicate;
- custom geometry requiring Owner approval.

For each shortlisted geometry verify:

- icon/source key and licence;
- canonical ID and aliases;
- category and search tags;
- consistent stroke weight;
- optical centering inside circular Cells;
- readability at small symbol sizes and far zoom;
- suitable default scale;
- recommended backing or no backing;
- visual collision with other symbols;
- separation from UI command icons;
- whether tinting should be allowed;
- accessibility label.

Do not change the approved projected research ceiling into automatic M2 scope. The output must explicitly define the smallest strong M2 catalogue and later packs.

## 6. Workstream D — Visual Preset Recipes

Define implementation-ready preset recipes using canonical controls and existing palette/material IDs wherever possible.

Include at least:

- Technical Diagram;
- Soft Organism;
- Dense Tissue;
- Editorial Blob;
- Static Presentation;
- High-Performance / Large Project;
- Monochrome Print;
- Category Gradient;
- Privacy Study.

Each recipe must include:

- intended use;
- exact palette/material IDs when available;
- proposed values for supported shader/appearance controls;
- Shadow state;
- Motion state;
- power-gate expectations;
- day/night variation;
- export fallback;
- performance tier;
- which milestone should expose it: M2 review-only, M4 preset, or later.

Do not create production preset code.

## 7. Required outputs

Create only these files under `docs/research/`:

1. `AG3_SHADER_CONTROL_ATLAS.md`
2. `AG3_PALETTE_AND_MATERIAL_CURATION.md`
3. `AG3_M2_SYMBOL_VISUAL_QA_SHORTLIST.md`
4. `AG3_VISUAL_PRESET_RECIPES.md`
5. `AG3_VISUAL_SYSTEM_MANIFEST.json`
6. `AG3_HANDOFF.md`

The JSON manifest must be valid and summarize:

- shader control recommendations;
- curated palette/material shortlist;
- staged M2 symbol IDs and classifications;
- preset recipes;
- unresolved Owner decisions;
- source refs and evidence confidence.

## 8. Strict boundaries

Do not:

- modify `main`;
- modify any file under `src/`;
- modify package/build/configuration files;
- modify Codex’s M2 branch;
- modify `status/codex`;
- implement shaders, uniforms, materials, icons, SVGs or UI;
- merge prototype, research or audit branches;
- create final custom architectural vectors;
- create Quick Bar or snapping work;
- expand M2 automatically to all projected symbols;
- redesign the product shell;
- run lengthy browser QA or image-generation loops.

Research may only change `docs/research/` on `research/ag3-visual-systems-atlas`, plus `worker-status/ANTIGRAVITY.json` on `status/antigravity`.

## 9. Status protocol

Before research:

- verify the exact branch/base;
- update `status/antigravity` to `RUNNING` with AG3 refs.

After completion:

- validate `AG3_VISUAL_SYSTEM_MANIFEST.json`;
- prove no local machine paths remain;
- run `git diff --check bd160b8c615cdafbbdd8a76332be46b69a6e765e...HEAD`;
- prove only `docs/research/` changed on the research branch;
- push one fixed research head;
- update `status/antigravity` to `WAITING_REVIEW` with exact research SHA;
- stop.

## 10. Acceptance

AG3 is acceptable only when:

- recommendations are tied to real canonical owners or clearly marked inference;
- palettes are curated rather than inflated;
- M2 symbol scope is reduced to a staged useful shortlist;
- UI command icons remain separate from drawable symbols;
- performance and runtime-gate implications are explicit;
- all six deliverables exist and JSON validates;
- production code remains untouched;
- no merge is performed.
