// ZONUERT master graph schema (V4.5B).
// The master graph is the single source of truth. Canvas / Table / Floors /
// Stats / Sankey / Charts / Bylaw Check / Export are all VIEWS derived from it.
// Never duplicate graph data into view-local state.

// ---------------------------------------------------------------------------
// Short-code unions
// ---------------------------------------------------------------------------

export type AreaUnit = "sqm" | "sqft";

export type SpaceShape = "circle" | "rectangle" | "rounded_rectangle";

/** PUB Public · SPB Semi-public · SPR Semi-private · PRI Private · SER Service
 *  UTL Utility · RET Retail · ADM Admin · CIR Circulation · OUT Outdoor
 *  TEC Technical · EMG Emergency · EDU Education · HLT Healthcare
 *  FNB Food/Beverage · STO Storage */
export type CategoryCode =
  | "PUB" | "SPB" | "SPR" | "PRI" | "SER" | "UTL" | "RET" | "ADM"
  | "CIR" | "OUT" | "TEC" | "EMG" | "EDU" | "HLT" | "FNB" | "STO";

/** P0 Public · P1 Semi-public · P2 Semi-private · P3 Private · P4 Restricted
 *  P5 Service-only */
export type PrivacyCode = "P0" | "P1" | "P2" | "P3" | "P4" | "P5";

/** S3 Strong · S2 Medium · S1 Weak · AV Avoid · CF Conflict · DEP Dependent
 *  ADJ Adjacent · VIS Visual connection · ACC Direct access */
export type RelationshipCode =
  | "S3" | "S2" | "S1" | "AV" | "CF" | "DEP" | "ADJ" | "VIS" | "ACC";

export type FlowType = "visitor" | "staff" | "service" | "goods" | "emergency";

// ---------------------------------------------------------------------------
// Nodes / edges
// ---------------------------------------------------------------------------

export interface ProjectMeta {
  project_id: string;
  project_name: string;
  typology?: string;
  location_country?: string;
  location_state?: string;
  location_city?: string;
  authority?: string;
  /** Site (plot) area in `site_area_unit`. 0 / missing triggers a data warning. */
  site_area: number;
  site_area_unit: AreaUnit;
  /** Target/permissible built-up area. Actuals always come from selectors. */
  total_built_up_area?: number;
  /** Cached FAR only — real FAR is computed by getFAR(). */
  far?: number;
  /** Cached ground coverage % only — real value comes from selectors. */
  ground_coverage?: number;
  floors_count?: number;
  road_width?: number;
  land_use?: string;
  notes?: string;
}

export interface FloorNode {
  id: string;
  name: string;
  /** 0 = ground, negative = basement, positive = upper floors. */
  level: number;
  /** Metres above ±0.00 datum. */
  elevation?: number;
  /** Target area for this floor; actual area is derived from its spaces. */
  area_target?: number;
  visible: boolean;
  locked: boolean;
  notes?: string;
}

export interface SpaceNode {
  id: string;
  /** Optional grouping parent (zone/department space), null = root. */
  parent_id?: string | null;
  floor_id: string;
  /** Short program code, e.g. "GF-01". */
  code?: string;
  name: string;
  short_label?: string;
  area: number;
  unit?: AreaUnit;
  category: CategoryCode;
  privacy: PrivacyCode;
  zone?: string;
  user_group?: string;
  priority?: number;
  shape?: SpaceShape;
  color?: string;
  gradient_from?: string;
  gradient_to?: string;
  x: number;
  y: number;
  /** World-px radius; if omitted, derive from area (adapters.radiusFromArea). */
  radius?: number;
  locked?: boolean;
  /** Hidden spaces STILL count in all area/stat selectors (visibility is a
   *  view concern, not a program change). */
  visible?: boolean;
  notes?: string;
}

export interface RelationshipEdge {
  id: string;
  from: string; // SpaceNode id
  to: string; // SpaceNode id
  type: RelationshipCode;
  /** 0–1 optional weighting on top of the type. */
  strength?: number;
  access?: boolean;
  avoid?: boolean;
  conflict?: boolean;
  notes?: string;
}

/**
 * Legacy pre-P1 relationship shape retained only for compatibility adapters.
 * Production project meaning is owned by the canonical Connection contract
 * below; visual presentation remains optional and independent.
 */
export type ConnectionRequirement = "required" | "preferred" | "optional" | "avoid";

export type ConnectionDirection = "none" | "two-way" | "a-to-b" | "b-to-a";

export type ConnectionStrength = "weak" | "medium" | "strong";

export type ConnectionPriority = "low" | "normal" | "high" | "critical";

export type KnownConnectionSemanticTypeId =
  | "adjacency"
  | "direct-access"
  | "visual-access"
  | "shared-support"
  | "circulation-flow"
  | "separation";

/** Open registry ID: known launch values autocomplete, future IDs round-trip. */
export type ConnectionSemanticTypeId = KnownConnectionSemanticTypeId | (string & {});

export type KnownConnectionGeometryId = "straight" | "curved" | "orthogonal" | "elbow";

export type ConnectionGeometryId = KnownConnectionGeometryId | (string & {});

export type KnownConnectionStrokePatternId =
  | "solid"
  | "dashed"
  | "dotted"
  | "dash-dot"
  | "double"
  | "segmented-bars";

export type ConnectionStrokePatternId = KnownConnectionStrokePatternId | (string & {});

export type KnownConnectionMarkerId =
  | "none"
  | "open-arrow"
  | "filled-arrow"
  | "open-triangle"
  | "filled-triangle"
  | "circle"
  | "filled-dot"
  | "square"
  | "diamond"
  | "bar"
  | "slash"
  | "cross"
  | "architectural-tick"
  | "chevron";

export type ConnectionMarkerId = KnownConnectionMarkerId | (string & {});

export interface ConnectionSemantic {
  typeId: ConnectionSemanticTypeId;
  requirement: ConnectionRequirement;
  direction: ConnectionDirection;
  strength: ConnectionStrength;
  priority: ConnectionPriority;
  notes: string;
}

/** Lightweight authored appearance only. Derived anchors and paths never persist. */
export interface ConnectionVisualAppearance {
  color?: string;
  width?: number;
  opacity?: number;
}

export interface ConnectionVisual {
  visible: boolean;
  geometryId: ConnectionGeometryId;
  strokePatternId: ConnectionStrokePatternId;
  startMarkerId: ConnectionMarkerId;
  endMarkerId: ConnectionMarkerId;
  appearance?: ConnectionVisualAppearance;
}

export interface Connection {
  id: string;
  fromSpaceId: string;
  toSpaceId: string;
  enabled: boolean;
  semantic: ConnectionSemantic;
  visual?: ConnectionVisual;
}

export interface CreateConnectionInput {
  fromSpaceId: string;
  toSpaceId: string;
  typeId: ConnectionSemanticTypeId;
  enabled?: boolean;
  semantic?: Partial<Omit<ConnectionSemantic, "typeId">>;
  visual?: ConnectionVisual;
}

export interface FlowPath {
  id: string;
  name: string;
  flow_type: FlowType;
  start: string; // SpaceNode id
  end: string; // SpaceNode id
  via?: string[]; // intermediate SpaceNode ids
  /** 0–1 relative intensity. */
  intensity?: number;
  color?: string;
  speed?: number;
  notes?: string;
}

export interface CategoryDefinition {
  code: CategoryCode;
  name: string;
  color: string;
  /** Blob-gradient end colour (organism category blend, future). */
  gradient_to: string;
  default_privacy: PrivacyCode;
  legend_order: number;
  description?: string;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface ZonuertProject {
  version: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  meta: ProjectMeta;
  floors: FloorNode[];
  spaces: SpaceNode[];
  connections: Connection[];
  flows: FlowPath[];
  categories: CategoryDefinition[];
}

/**
 * GraphStats is COMPUTED ONLY — never stored on the project (the optional
 * meta.far / meta.ground_coverage fields are user targets / caches, clearly
 * marked as such). Selectors in ./selectors.ts are the only producers.
 */
export interface GraphStats {
  total_area: number;
  total_built_up_area: number;
  area_left: number;
  far: number;
  ground_coverage_pct: number;
  space_count: number;
  relationship_count: number;
  flow_count: number;
  public_private_ratio: number;
  service_ratio: number;
  warning_count: number;
}

// ---------------------------------------------------------------------------
// Default categories — restrained ZONUERT palette (Graph Noir Red + grayscale;
// muted yellow/red reserved for warnings). Gradients feed the future organism
// blob category blend.
// ---------------------------------------------------------------------------

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { code: "PUB", name: "Public",        color: "#9b3b2e", gradient_to: "#e9e2d3", default_privacy: "P0", legend_order: 1,  description: "Open public program" },
  { code: "SPB", name: "Semi-public",   color: "#b56a4f", gradient_to: "#ded4c2", default_privacy: "P1", legend_order: 2 },
  { code: "SPR", name: "Semi-private",  color: "#7d6b5d", gradient_to: "#cfc6b8", default_privacy: "P2", legend_order: 3 },
  { code: "PRI", name: "Private",       color: "#4a0909", gradient_to: "#141414", default_privacy: "P3", legend_order: 4,  description: "Wine → black" },
  { code: "SER", name: "Service",       color: "#3a3a3a", gradient_to: "#8a8a8a", default_privacy: "P5", legend_order: 5,  description: "Graphite → grey" },
  { code: "UTL", name: "Utility",       color: "#6b7178", gradient_to: "#9aa0a6", default_privacy: "P5", legend_order: 6,  description: "Steel grey" },
  { code: "RET", name: "Retail",        color: "#5d1420", gradient_to: "#b98a8f", default_privacy: "P0", legend_order: 7,  description: "Oxblood → rose" },
  { code: "ADM", name: "Admin",         color: "#5c636b", gradient_to: "#2f2f2f", default_privacy: "P2", legend_order: 8 },
  { code: "CIR", name: "Circulation",   color: "#b9bcb6", gradient_to: "#55585c", default_privacy: "P0", legend_order: 9,  description: "Fog → graphite" },
  { code: "OUT", name: "Outdoor",       color: "#d8c7b0", gradient_to: "#8f8b81", default_privacy: "P0", legend_order: 10, description: "Muted cream → grey" },
  { code: "TEC", name: "Technical",     color: "#545b63", gradient_to: "#101010", default_privacy: "P4", legend_order: 11, description: "Steel → black" },
  { code: "EMG", name: "Emergency",     color: "#c9a227", gradient_to: "#7e1414", default_privacy: "P4", legend_order: 12, description: "Warning → danger" },
  { code: "EDU", name: "Education",     color: "#8f3a30", gradient_to: "#e5decd", default_privacy: "P1", legend_order: 13 },
  { code: "HLT", name: "Healthcare",    color: "#a7aca4", gradient_to: "#d4d7d0", default_privacy: "P1", legend_order: 14, description: "Muted clinical grey-green" },
  { code: "FNB", name: "Food/Beverage", color: "#b98a8f", gradient_to: "#ecdfd2", default_privacy: "P0", legend_order: 15, description: "Rose → cream" },
  { code: "STO", name: "Storage",       color: "#8a8a8a", gradient_to: "#c4c4c0", default_privacy: "P5", legend_order: 16, description: "Grey → fog" },
];
