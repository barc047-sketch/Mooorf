// ZONUERT import contract (V4.5B) — data contract ONLY, no parser/UI yet.
// The import UI (PapaParse/xlsx glue) is built in a later phase against these
// definitions. Human-readable spec: docs/IMPORT_TEMPLATE_SPEC.md.
//
// Modes:
//  1. CSV simple mode      — one flat sheet of spaces, minimum columns.
//  2. XLSX advanced mode   — six sheets (PROJECT/FLOORS/SPACES/RELATIONSHIPS/
//                            FLOWS/CATEGORIES).
//  3. JSON ".zonuert" save — full project round-trip (future).

import type { ZonuertProject } from "./types";

export interface ColumnSpec {
  /** Exact header text expected in the file. */
  header: string;
  /** Target field on the graph node. */
  key: string;
  required: boolean;
  /** Applied when the cell is empty (never when required). */
  default?: string | number | boolean;
  /** Human-readable validation rule. */
  rule?: string;
}

export interface SheetSpec {
  name: string;
  description: string;
  columns: ColumnSpec[];
}

// ---------------------------------------------------------------------------
// Mode 1 — CSV simple
// ---------------------------------------------------------------------------

export const SIMPLE_CSV_COLUMNS: ColumnSpec[] = [
  { header: "name", key: "name", required: true, rule: "Non-empty text" },
  { header: "area", key: "area", required: true, rule: "Number > 0, no units in cell" },
  { header: "category", key: "category", required: true, default: "PUB", rule: "CategoryCode (PUB…STO) or full category name" },
  { header: "privacy", key: "privacy", required: true, default: "P0", rule: "PrivacyCode P0–P5 or name; empty → category default_privacy" },
  { header: "floor", key: "floor_id", required: true, default: "Ground Floor", rule: "Floor name; unknown names create a new floor" },
];

// ---------------------------------------------------------------------------
// Mode 2 — XLSX advanced (sheet names are exact, UPPERCASE)
// ---------------------------------------------------------------------------

export const ADVANCED_SPACE_COLUMNS: ColumnSpec[] = [
  { header: "id", key: "id", required: false, rule: "Unique; auto-generated when empty" },
  { header: "parent_id", key: "parent_id", required: false, rule: "Must reference an existing space id" },
  { header: "floor_id", key: "floor_id", required: true, rule: "Must match a FLOORS row id" },
  { header: "code", key: "code", required: false },
  { header: "name", key: "name", required: true },
  { header: "area", key: "area", required: true, rule: "Number > 0" },
  { header: "unit", key: "unit", required: false, default: "sqm", rule: "sqm | sqft" },
  { header: "category", key: "category", required: true, rule: "CategoryCode" },
  { header: "privacy", key: "privacy", required: true, rule: "PrivacyCode P0–P5" },
  { header: "zone", key: "zone", required: false },
  { header: "user_group", key: "user_group", required: false },
  { header: "priority", key: "priority", required: false, rule: "Number" },
  { header: "shape", key: "shape", required: false, default: "circle", rule: "circle | rectangle | rounded_rectangle" },
  { header: "color", key: "color", required: false, rule: "Hex; empty → category color" },
  { header: "gradient_from", key: "gradient_from", required: false },
  { header: "gradient_to", key: "gradient_to", required: false },
  { header: "x", key: "x", required: false, rule: "Number; empty → auto-scatter" },
  { header: "y", key: "y", required: false, rule: "Number; empty → auto-scatter" },
  { header: "locked", key: "locked", required: false, default: false, rule: "TRUE/FALSE" },
  { header: "visible", key: "visible", required: false, default: true, rule: "TRUE/FALSE" },
  { header: "notes", key: "notes", required: false },
];

export const XLSX_SHEETS: SheetSpec[] = [
  {
    name: "PROJECT",
    description: "Two columns (field, value) — one row per ProjectMeta field.",
    columns: [
      { header: "field", key: "field", required: true, rule: "ProjectMeta field name, e.g. site_area" },
      { header: "value", key: "value", required: true, rule: "site_area numeric; site_area_unit sqm|sqft" },
    ],
  },
  {
    name: "FLOORS",
    description: "One row per floor.",
    columns: [
      { header: "id", key: "id", required: false, rule: "Unique; auto when empty" },
      { header: "name", key: "name", required: true },
      { header: "level", key: "level", required: true, rule: "Integer; 0 = ground, negative = basement" },
      { header: "elevation", key: "elevation", required: false, rule: "Metres" },
      { header: "area_target", key: "area_target", required: false, rule: "Number" },
      { header: "visible", key: "visible", required: false, default: true, rule: "TRUE/FALSE" },
      { header: "locked", key: "locked", required: false, default: false, rule: "TRUE/FALSE" },
      { header: "notes", key: "notes", required: false },
    ],
  },
  { name: "SPACES", description: "One row per space.", columns: ADVANCED_SPACE_COLUMNS },
  {
    name: "RELATIONSHIPS",
    description: "One row per edge between two space ids.",
    columns: [
      { header: "id", key: "id", required: false, rule: "Unique; auto when empty" },
      { header: "from", key: "from", required: true, rule: "Existing space id" },
      { header: "to", key: "to", required: true, rule: "Existing space id" },
      { header: "type", key: "type", required: true, rule: "S3|S2|S1|AV|CF|DEP|ADJ|VIS|ACC" },
      { header: "strength", key: "strength", required: false, rule: "0–1" },
      { header: "access", key: "access", required: false, rule: "TRUE/FALSE" },
      { header: "avoid", key: "avoid", required: false, rule: "TRUE/FALSE" },
      { header: "conflict", key: "conflict", required: false, rule: "TRUE/FALSE" },
      { header: "notes", key: "notes", required: false },
    ],
  },
  {
    name: "FLOWS",
    description: "One row per movement path.",
    columns: [
      { header: "id", key: "id", required: false, rule: "Unique; auto when empty" },
      { header: "name", key: "name", required: true },
      { header: "flow_type", key: "flow_type", required: true, rule: "visitor|staff|service|goods|emergency" },
      { header: "start", key: "start", required: true, rule: "Existing space id" },
      { header: "end", key: "end", required: true, rule: "Existing space id" },
      { header: "via", key: "via", required: false, rule: "Semicolon-separated space ids" },
      { header: "intensity", key: "intensity", required: false, default: 0.5, rule: "0–1" },
      { header: "color", key: "color", required: false, rule: "Hex" },
      { header: "speed", key: "speed", required: false, rule: "Number" },
      { header: "notes", key: "notes", required: false },
    ],
  },
  {
    name: "CATEGORIES",
    description: "Optional — omit to use ZONUERT DEFAULT_CATEGORIES.",
    columns: [
      { header: "code", key: "code", required: true, rule: "CategoryCode" },
      { header: "name", key: "name", required: true },
      { header: "color", key: "color", required: true, rule: "Hex" },
      { header: "gradient_to", key: "gradient_to", required: false, rule: "Hex" },
      { header: "default_privacy", key: "default_privacy", required: false, default: "P0", rule: "PrivacyCode" },
      { header: "legend_order", key: "legend_order", required: false, rule: "Integer" },
      { header: "description", key: "description", required: false },
    ],
  },
];

/** Cross-sheet validation rules the future importer must enforce. */
export const VALIDATION_RULES: string[] = [
  "All ids unique within their sheet (duplicates → DUPLICATE_ID warning).",
  "Every SPACES.floor_id must resolve to a FLOORS row.",
  "Every RELATIONSHIPS.from/to and FLOWS.start/end/via must resolve to a space id.",
  "Numeric cells (area, level, x, y, strength, intensity) must parse as numbers.",
  "Code cells must be valid union members (CategoryCode, PrivacyCode, RelationshipCode).",
  "No merged cells; no markdown or units inside cells.",
  "Import never overwrites — it produces a new ZonuertProject for review.",
];

// ---------------------------------------------------------------------------
// Mode 3 — JSON ".zonuert" save file (future)
// ---------------------------------------------------------------------------

export interface ZonuertSaveFile {
  format: "zonuert-project";
  schema_version: "1.0";
  exported_at: string; // ISO 8601
  project: ZonuertProject;
}
