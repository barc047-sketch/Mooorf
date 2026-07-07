# V6F.0B — Site / App Feature Flow Map

Status: planning only. This is a priority map, not an implementation checklist for the current phase.

## Feature Map

| Level 1 | Level 2 | Level 3 | Level 4 | MVP? | Later? | Notes |
|---|---|---|---|---:|---:|---|
| Landing | Intro | Brand entry | Loader / start state | no | yes | Existing loader covers current app entry; full landing is not needed now. |
| Landing | Intro | Organism animation | Preview animation | no | yes | Future marketing/demo surface only. |
| Landing | Intro | Start studio | Open canvas | no | yes | Avoid building landing page before studio works. |
| Studio | Canvas | Organism renderer | SpaceCell -> nucleus field | yes | no | V6F.1 next. |
| Studio | Canvas | Nuclei | Add, drag, select | yes | no | Store remains source of truth. |
| Studio | Canvas | Labels | Show/hide labels | yes | no | Overlay above WebGL organism. |
| Studio | Canvas | Grid | Show/hide grid | yes | no | UI overlay, not renderer data. |
| Studio | Canvas | Selection | Selected nucleus state | yes | no | Selection arc later. |
| Studio | Canvas | Style | Cellular Reverse / Plain / etc. | yes | no | Reduced production control. |
| Studio | Canvas | Palette | Core palette group | yes | no | Full palette system later. |
| Studio | Canvas | Attachment | Tight / Soft / Long | yes | no | Maps to renderer behavior. |
| Studio | Table | Space schedule | Rows over same store | yes | no | Existing table stays unchanged. |
| Studio | Table | Area | Edit area | yes | no | Updates radius through adapter. |
| Studio | Table | Category | Edit category | yes | no | Future category palette mapping. |
| Studio | Table | Privacy | Edit privacy | yes | no | Future visual influence. |
| Studio | Table | Floor | Floor assignment | no | yes | Graph model exists; UI later. |
| Studio | Table | Import | CSV/XLSX import | no | yes | Import contract exists; UI later. |
| Studio | Floors | Add floor | Floor model UI | no | yes | Later graph UI phase. |
| Studio | Floors | Floor visibility | Filter/ghost nuclei | no | yes | Renderer receives filtered nuclei. |
| Studio | Floors | Floor stats | Selector widgets | no | yes | Floating widgets later. |
| Studio | Relationships | Adjacency | Connect spaces | no | yes | Graph relationships later. |
| Studio | Relationships | Flow | Flow paths | no | yes | Future overlay or inspector. |
| Studio | Relationships | Sankey | Flow diagram | no | yes | Later analytics/export view. |
| Studio | Stats | Total area | Metric widget | no | yes | Selector-backed. |
| Studio | Stats | Category ratio | Widget / panel | no | yes | Selector-backed. |
| Studio | Stats | Privacy ratio | Widget / panel | no | yes | Selector-backed. |
| Studio | Stats | Graph health | Warning widget | no | yes | Missing-data warnings. |
| Studio | Export | PNG | Canvas snapshot | no | yes | Export phase. |
| Studio | Export | SVG | Vector/export hybrid | no | yes | Needs renderer/export design. |
| Studio | Export | PDF | Report/export | no | yes | Use existing `pdf-lib` later. |
| Studio | Export | ZIP | Project package | no | yes | Use existing `jszip` later. |
| Studio | Organism Lab | Presets | Core/Colony/etc. | no | yes | Lab route preserved, hidden. |
| Studio | Organism Lab | Shader controls | Advanced renderer tuning | no | yes | Hidden from production MVP. |
| Studio | Organism Lab | Debug | Field/nuclei diagnostics | no | yes | Debug only. |
| Studio | Settings | Theme | Day/night | yes | no | Existing theme path. |
| Studio | Settings | Palette | Palette selection | yes | no | Basic in V6F.1, richer later. |
| Studio | Settings | Performance | DPR/quality | no | yes | Useful after WebGL QA. |
| Studio | Settings | Shortcuts | Command/shortcut map | no | yes | Use existing shortcut docs later. |
| Gallery later | Templates | Typologies | Program templates | no | yes | Do not build now. |
| Gallery later | Templates | Examples | Example diagrams | no | yes | Local-first only unless roadmap changes. |
| Gallery later | Shared diagrams | Public gallery | Sharing | no | yes | Current guardrail says no public gallery. |

## Feature Priority

MVP for V6F.1:
- Production organism renderer
- SpaceCell -> nucleus adapter
- Add Nucleus
- Drag nucleus -> `moveSpace`
- Table sync preserved
- Reduced style / attachment / reach controls
- Labels and basic theme support
- Classic canvas fallback
- Organism Lab route preserved

Later:
- Right inspector
- Floating widgets
- Floors UI
- Relationships UI
- Selection arc
- Export
- Full palette catalog
- Advanced organism panel
- Gallery/templates

## Dependencies

| Feature | Depends on | Notes |
|---|---|---|
| Production organism renderer | V6E lab shader, V6F.0 audit | Next phase. |
| Add Nucleus | existing store actions | Must create `SpaceCell`, not renderer-only data. |
| Table sync | existing table/store path | Do not rewrite table in V6F.1. |
| Palette mapping | tokens + future `palettes.ts` | Keep minimal until renderer is stable. |
| Floors UI | graph floor model | Later, not V6F.1. |
| Floating widgets | graph selectors | Already documented, build later. |
| Export | canvas capture strategy | Export phase, not V6F.1. |
| Selection arc | selection arc spec | Phase 6.5, not V6F.1. |
