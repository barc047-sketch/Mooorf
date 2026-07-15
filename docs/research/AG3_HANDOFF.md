# AG3 Research Handoff

## Overview
This research handoff completes the **AG3 — Visual Systems Research Atlas** task for the `barc047-sketch/Mooorf` repository. It curates the spatial design tokens, maps fragment shader uniforms, categorizes placeable symbols, and outlines performance-gated preset recipes.

This is a research-only specification. No production source code, package configurations, or Codex feature branches have been modified.

---

## 1. Branch and Base Verification
- **Research Branch**: `research/ag3-visual-systems-atlas`
- **Exact Branch Base**: `main@bd160b8c615cdafbbdd8a76332be46b69a6e765e`
- **Parallel Codex Milestone**: C0 M2 on `feature/c0-m2-advanced-inspector-symbols-runtime-gates`

---

## 2. Deliverables Summary
Six files have been created under `docs/research/` on this branch:

1. [AG3_SHADER_CONTROL_ATLAS.md](AG3_SHADER_CONTROL_ATLAS.md)
   - Maps 12 existing fragment shader and CPU simulation parameters into user-facing controls.
   - Identifies canonical owners, recommended ranges, dangerous combinations, and performance impact.
   - Defines hard power gates (disabling systems skips processing, stopping requestAnimationFrame calls when idle).
2. [AG3_PALETTE_AND_MATERIAL_CURATION.md](AG3_PALETTE_AND_MATERIAL_CURATION.md)
   - Curates the color token system into a tight production shortlist (7 cell/nucleus palettes and 7 membrane palettes).
   - Establishes a neutral UI design rule (limiting color to the canvas viewport, keeping controls grey/glass/mono).
   - Provides accessibility guidelines, day/night shifts, contrast thresholds (auto-flipping text color), and muddy blend warnings.
3. [AG3_M2_SYMBOL_VISUAL_QA_SHORTLIST.md](AG3_M2_SYMBOL_VISUAL_QA_SHORTLIST.md)
   - Reconciles symbol inventories into a staged implementation roadmap (M2 Essential Students, M2 Essential Professionals, and deferred categories).
   - Sets visual QA constraints (consistent 1.5px strokes, 24px optical design grids, and backing overlays).
   - Excludes UI command icons to avoid classification collisions.
4. [AG3_VISUAL_PRESET_RECIPES.md](AG3_VISUAL_PRESET_RECIPES.md)
   - Specifications for 9 premium design styles (e.g. Technical Diagram, Soft Organism, High-Performance, Category Gradient).
   - Outlines exact shader values, shadow states, and power-gate benefits.
5. [AG3_VISUAL_SYSTEM_MANIFEST.json](AG3_VISUAL_SYSTEM_MANIFEST.json)
   - Structured JSON database aggregating all shader mappings, shortlisted palettes, staged symbols, and recipe properties.
6. [AG3_HANDOFF.md](AG3_HANDOFF.md)
   - This document, coordinating the research output.

---

## 3. Strict Boundary Verification
- **Production Code Status**: Untouched. No files under `src/` were edited.
- **Merge Status**: No branches were merged.
- **Absolute Paths**: All absolute paths (e.g. `/Users/...` or `file:///Users/...`) have been fully stripped from the deliverables and status logs, replacing them with repository-relative formats.
- **Diff Check Status**: Verification commands prove zero trailing whitespace or formatting checks fail.
- **Manifest Validation**: JSON parses successfully and adheres to project schemas.
