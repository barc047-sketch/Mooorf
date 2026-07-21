// ZONUERT derived selectors (V4.5B).
// Pure functions over ZonuertProject — no React, no Zustand, no DOM.
// All stats/widgets/tables/charts must read through these; never store results
// back into the graph.
//
// Counting rules (documented, deliberate):
// - Locked spaces COUNT in every selector.
// - Hidden (visible:false) spaces COUNT too — visibility is a view concern,
//   not a program change.
// - Divide-by-zero always returns 0, never NaN/Infinity.

import type {
  CategoryCode,
  FloorNode,
  GraphStats,
  PrivacyCode,
  SpaceNode,
  ZonuertProject,
} from "./types";

const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);
const num = (v: number | undefined | null) =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

// ---------------------------------------------------------------------------
// Areas
// ---------------------------------------------------------------------------

/** Sum of ALL space areas (locked + hidden included). */
export const getTotalArea = (p: ZonuertProject): number =>
  p.spaces.reduce((sum, s) => sum + num(s.area), 0);

/**
 * Built-up area = enclosed program only (Outdoor "OUT" spaces excluded).
 * meta.total_built_up_area is a TARGET, not the actual — actual is computed.
 */
export const getTotalBuiltUpArea = (p: ZonuertProject): number =>
  p.spaces.reduce(
    (sum, s) => (s.category === "OUT" ? sum : sum + num(s.area)),
    0
  );

/**
 * Area left = target minus programmed total.
 * Target preference: meta.total_built_up_area (better project target) if set,
 * else meta.site_area. Can go negative (over-programmed).
 */
export const getAreaLeft = (p: ZonuertProject): number => {
  const target =
    num(p.meta.total_built_up_area) > 0
      ? num(p.meta.total_built_up_area)
      : num(p.meta.site_area);
  return target - getTotalArea(p);
};

/** FAR = actual built-up area / site area. 0 when site area is missing. */
export const getFAR = (p: ZonuertProject): number =>
  safeDiv(getTotalBuiltUpArea(p), num(p.meta.site_area));

/**
 * Ground coverage % = enclosed area on level-0 floors / site area × 100.
 * Conceptual (circle program graph, not construction footprint).
 */
export const getGroundCoveragePercentage = (p: ZonuertProject): number => {
  const groundIds = new Set(
    p.floors.filter((f) => f.level === 0).map((f) => f.id)
  );
  const ground = p.spaces.reduce(
    (sum, s) =>
      groundIds.has(s.floor_id) && s.category !== "OUT"
        ? sum + num(s.area)
        : sum,
    0
  );
  return safeDiv(ground, num(p.meta.site_area)) * 100;
};

// ---------------------------------------------------------------------------
// Grouped totals
// ---------------------------------------------------------------------------

export interface CategoryTotal {
  code: CategoryCode;
  name: string;
  area: number;
  count: number;
  pct: number; // of total area
}

/** Per-category totals, sorted by legend_order (unknown categories last). */
export const getCategoryTotals = (p: ZonuertProject): CategoryTotal[] => {
  const total = getTotalArea(p);
  const acc = new Map<CategoryCode, { area: number; count: number }>();
  for (const s of p.spaces) {
    const e = acc.get(s.category) ?? { area: 0, count: 0 };
    e.area += num(s.area);
    e.count += 1;
    acc.set(s.category, e);
  }
  const order = new Map(p.categories.map((c) => [c.code, c.legend_order]));
  const names = new Map(p.categories.map((c) => [c.code, c.name]));
  return [...acc.entries()]
    .map(([code, e]) => ({
      code,
      name: names.get(code) ?? code,
      area: e.area,
      count: e.count,
      pct: safeDiv(e.area, total) * 100,
    }))
    .sort(
      (a, b) => (order.get(a.code) ?? 99) - (order.get(b.code) ?? 99)
    );
};

export interface PrivacyTotal {
  code: PrivacyCode;
  area: number;
  count: number;
  pct: number;
}

export const getPrivacyTotals = (p: ZonuertProject): PrivacyTotal[] => {
  const total = getTotalArea(p);
  const acc = new Map<PrivacyCode, { area: number; count: number }>();
  for (const s of p.spaces) {
    const e = acc.get(s.privacy) ?? { area: 0, count: 0 };
    e.area += num(s.area);
    e.count += 1;
    acc.set(s.privacy, e);
  }
  return [...acc.entries()]
    .map(([code, e]) => ({
      code,
      area: e.area,
      count: e.count,
      pct: safeDiv(e.area, total) * 100,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
};

export interface FloorTotal {
  floor_id: string;
  name: string;
  level: number;
  area_target: number;
  actual_area: number; // from spaces (locked + hidden included)
  space_count: number;
  delta: number; // actual - target
}

/** Per-floor actuals from spaces, sorted by level (basement first). */
export const getFloorTotals = (p: ZonuertProject): FloorTotal[] =>
  p.floors
    .map((f) => {
      const own = p.spaces.filter((s) => s.floor_id === f.id);
      const actual = own.reduce((sum, s) => sum + num(s.area), 0);
      const target = num(f.area_target);
      return {
        floor_id: f.id,
        name: f.name,
        level: f.level,
        area_target: target,
        actual_area: actual,
        space_count: own.length,
        delta: actual - target,
      };
    })
    .sort((a, b) => a.level - b.level);

// ---------------------------------------------------------------------------
// Counts / rankings
// ---------------------------------------------------------------------------

export const getLargestSpaces = (
  p: ZonuertProject,
  limit = 5
): SpaceNode[] =>
  [...p.spaces].sort((a, b) => num(b.area) - num(a.area)).slice(0, limit);

export const getSpaceCount = (p: ZonuertProject): number => p.spaces.length;

export const getConnectionCount = (p: ZonuertProject): number =>
  p.connections.length;

/** @deprecated Use getConnectionCount; retained for current stats consumers. */
export const getRelationshipCount = getConnectionCount;

export const getFlowCount = (p: ZonuertProject): number => p.flows.length;

// ---------------------------------------------------------------------------
// Ratios
// ---------------------------------------------------------------------------

export interface PublicPrivateRatio {
  public_area: number; // privacy P0 + P1
  private_area: number; // privacy P2 + P3 + P4
  ratio: number; // public / private (0 when no private area)
}

export const getPublicPrivateRatio = (
  p: ZonuertProject
): PublicPrivateRatio => {
  let pub = 0;
  let pri = 0;
  for (const s of p.spaces) {
    if (s.privacy === "P0" || s.privacy === "P1") pub += num(s.area);
    else if (s.privacy !== "P5") pri += num(s.area);
  }
  return { public_area: pub, private_area: pri, ratio: safeDiv(pub, pri) };
};

export interface ServiceRatio {
  service_area: number; // categories SER + UTL + TEC + STO
  total_area: number;
  ratio: number;
}

export const getServiceRatio = (p: ZonuertProject): ServiceRatio => {
  const SERVICE: CategoryCode[] = ["SER", "UTL", "TEC", "STO"];
  const service = p.spaces.reduce(
    (sum, s) => (SERVICE.includes(s.category) ? sum + num(s.area) : sum),
    0
  );
  const total = getTotalArea(p);
  return { service_area: service, total_area: total, ratio: safeDiv(service, total) };
};

// ---------------------------------------------------------------------------
// Selected space
// ---------------------------------------------------------------------------

export interface SelectedSpaceStats {
  space: SpaceNode;
  area: number;
  category: CategoryCode;
  privacy: PrivacyCode;
  floor: FloorNode | null;
  relationship_count: number;
  flow_count: number; // flows where this space is start, end, or via
}

export const getSelectedSpaceStats = (
  p: ZonuertProject,
  selectedSpaceId: string | null
): SelectedSpaceStats | null => {
  if (!selectedSpaceId) return null;
  const space = p.spaces.find((s) => s.id === selectedSpaceId);
  if (!space) return null;
  return {
    space,
    area: num(space.area),
    category: space.category,
    privacy: space.privacy,
    floor: p.floors.find((f) => f.id === space.floor_id) ?? null,
    relationship_count: p.connections.filter(
      (connection) => connection.fromSpaceId === space.id || connection.toSpaceId === space.id
    ).length,
    flow_count: p.flows.filter(
      (f) =>
        f.start === space.id ||
        f.end === space.id ||
        (f.via?.includes(space.id) ?? false)
    ).length,
  };
};

// ---------------------------------------------------------------------------
// Missing-data warnings
// ---------------------------------------------------------------------------

export interface GraphWarning {
  code:
    | "MISSING_AREA"
    | "MISSING_CATEGORY"
    | "MISSING_PRIVACY"
    | "MISSING_FLOOR"
    | "UNKNOWN_FLOOR"
    | "MISSING_SITE_AREA"
    | "DUPLICATE_ID";
  message: string;
  space_id?: string;
}

export const getMissingDataWarnings = (p: ZonuertProject): GraphWarning[] => {
  const warnings: GraphWarning[] = [];
  const floorIds = new Set(p.floors.map((f) => f.id));

  if (num(p.meta.site_area) <= 0)
    warnings.push({
      code: "MISSING_SITE_AREA",
      message: "Project site area is missing or zero — FAR and coverage read 0.",
    });

  const seen = new Set<string>();
  for (const s of p.spaces) {
    if (seen.has(s.id))
      warnings.push({
        code: "DUPLICATE_ID",
        message: `Duplicate space id "${s.id}".`,
        space_id: s.id,
      });
    seen.add(s.id);

    if (num(s.area) <= 0)
      warnings.push({
        code: "MISSING_AREA",
        message: `"${s.name}" has no area.`,
        space_id: s.id,
      });
    if (!s.category)
      warnings.push({
        code: "MISSING_CATEGORY",
        message: `"${s.name}" has no category.`,
        space_id: s.id,
      });
    if (!s.privacy)
      warnings.push({
        code: "MISSING_PRIVACY",
        message: `"${s.name}" has no privacy code.`,
        space_id: s.id,
      });
    if (!s.floor_id)
      warnings.push({
        code: "MISSING_FLOOR",
        message: `"${s.name}" has no floor.`,
        space_id: s.id,
      });
    else if (!floorIds.has(s.floor_id))
      warnings.push({
        code: "UNKNOWN_FLOOR",
        message: `"${s.name}" points at unknown floor "${s.floor_id}".`,
        space_id: s.id,
      });
  }
  return warnings;
};

// ---------------------------------------------------------------------------
// Composite
// ---------------------------------------------------------------------------

/** Convenience roll-up for widgets. Computed on demand — never persisted. */
export const getGraphStats = (p: ZonuertProject): GraphStats => ({
  total_area: getTotalArea(p),
  total_built_up_area: getTotalBuiltUpArea(p),
  area_left: getAreaLeft(p),
  far: getFAR(p),
  ground_coverage_pct: getGroundCoveragePercentage(p),
  space_count: getSpaceCount(p),
  relationship_count: getRelationshipCount(p),
  flow_count: getFlowCount(p),
  public_private_ratio: getPublicPrivateRatio(p).ratio,
  service_ratio: getServiceRatio(p).ratio,
  warning_count: getMissingDataWarnings(p).length,
});
