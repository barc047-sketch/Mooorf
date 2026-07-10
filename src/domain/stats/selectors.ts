/* V7 spatial intelligence — pure derived metrics over store-owned SpaceCell
   data. The Zustand `spaces` array is the live master-graph node list; every
   stats widget derives from these selectors and owns zero metric state.
   Naming mirrors src/domain/graph/selectors.ts (getCategoryTotals,
   getPrivacyTotals, getLargestSpaces) so the future ZonuertProject migration
   is a signature swap, not a widget rewrite. */

import type { Privacy, SpaceCell } from "../../types";
import { getCategoryToken, isVoidSpace } from "../../design/colorMapping";

/** One category's slice of the programmed area. `color` is the restrained
    architectural base hue from the shared category tokens — stats widgets
    never invent their own data colors. */
export interface CategoryShare {
  id: string;
  label: string;
  color: string;
  area: number;
  count: number;
  /** 0..1 of programmed area; 0 while the program has no measurable area */
  share: number;
}

export interface PrivacyBalance {
  area: Record<Privacy, number>;
  share: Record<Privacy, number>;
  /** public + shared portion of programmed area — the program's openness */
  openShare: number;
}

export interface AreaLeader {
  id: string;
  name: string;
  area: number;
  share: number;
  categoryId: string;
  categoryLabel: string;
  categoryColor: string;
}

export interface CategoryMixSelection {
  programArea: number;
  spaceCount: number;
  voidCount: number;
  categories: CategoryShare[];
}

export type PrivacyGroupId = Privacy | "unknown";

export interface PrivacyGroup {
  id: PrivacyGroupId;
  label: string;
  area: number;
  count: number;
  share: number;
}

export interface PrivacyBalanceSelection {
  programArea: number;
  voidCount: number;
  groups: PrivacyGroup[];
  dominant: PrivacyGroup | null;
  serviceArea: number;
  serviceShare: number;
}

export interface AreaLeadersSelection {
  programArea: number;
  leaders: AreaLeader[];
}

export type DataHealthStatus = "clear" | "attention" | "blocking";
export type DataHealthSignalId =
  | "invalid-area"
  | "invalid-void-area"
  | "missing-name"
  | "uncategorized"
  | "unknown-privacy"
  | "duplicate-name";

export interface DataHealthSignal {
  id: DataHealthSignalId;
  label: string;
  detail: string;
  severity: Exclude<DataHealthStatus, "clear">;
  count: number;
  affectedIds: string[];
}

export interface DataHealthSelection {
  status: DataHealthStatus;
  totalIssueCount: number;
  affectedSpaceCount: number;
  signals: DataHealthSignal[];
  firstAffectedId: string | null;
}

export interface SpatialPulse {
  /** additive program spaces — voids are counted separately */
  spaceCount: number;
  voidCount: number;
  /** m² across additive spaces only — voids never inflate the program */
  programArea: number;
  /** sorted largest area first */
  categories: CategoryShare[];
  dominant: CategoryShare | null;
  privacy: PrivacyBalance;
  largest: AreaLeader | null;
  /** Data Health hooks (V7 family) — additive spaces with unusable area /
      no meaningful category */
  missingAreaCount: number;
  uncategorizedCount: number;
}

/** Import/CSV paths may produce NaN/negative areas later — they read as 0 m²
    here and surface through `missingAreaCount` instead of skewing totals. */
const usableArea = (space: Pick<SpaceCell, "area">): number =>
  Number.isFinite(space.area) && space.area > 0 ? space.area : 0;

const isProgramSpace = (space: Pick<SpaceCell, "kind">): boolean =>
  !isVoidSpace(space);

export const getSpaceCount = (spaces: readonly SpaceCell[]): number =>
  spaces.reduce((n, s) => n + (isProgramSpace(s) ? 1 : 0), 0);

export const getVoidCount = (spaces: readonly SpaceCell[]): number =>
  spaces.reduce((n, s) => n + (isProgramSpace(s) ? 0 : 1), 0);

export const getProgramArea = (spaces: readonly SpaceCell[]): number =>
  spaces.reduce((sum, s) => sum + (isProgramSpace(s) ? usableArea(s) : 0), 0);

export function getCategoryShares(spaces: readonly SpaceCell[]): CategoryShare[] {
  const buckets = new Map<string, CategoryShare>();
  let total = 0;
  for (const space of spaces) {
    if (!isProgramSpace(space)) continue;
    const token = getCategoryToken(space.category);
    const area = usableArea(space);
    total += area;
    const bucket = buckets.get(token.id);
    if (bucket) {
      bucket.area += area;
      bucket.count += 1;
    } else {
      buckets.set(token.id, {
        id: token.id,
        label: token.label,
        color: token.base,
        area,
        count: 1,
        share: 0,
      });
    }
  }
  const shares = [...buckets.values()].sort(
    (a, b) => b.area - a.area || b.count - a.count || a.label.localeCompare(b.label)
  );
  if (total > 0) for (const share of shares) share.share = share.area / total;
  return shares;
}

export function getPrivacyBalance(spaces: readonly SpaceCell[]): PrivacyBalance {
  const area: Record<Privacy, number> = { public: 0, shared: 0, private: 0 };
  for (const space of spaces) {
    if (!isProgramSpace(space)) continue;
    if (space.privacy === "public" || space.privacy === "shared" || space.privacy === "private") {
      area[space.privacy] += usableArea(space);
    }
  }
  const total = area.public + area.shared + area.private;
  const share: Record<Privacy, number> = {
    public: total > 0 ? area.public / total : 0,
    shared: total > 0 ? area.shared / total : 0,
    private: total > 0 ? area.private / total : 0,
  };
  return { area, share, openShare: share.public + share.shared };
}

export function getLargestSpace(spaces: readonly SpaceCell[]): AreaLeader | null {
  let leader: SpaceCell | null = null;
  for (const space of spaces) {
    if (!isProgramSpace(space)) continue;
    if (usableArea(space) === 0) continue;
    if (!leader || usableArea(space) > usableArea(leader)) leader = space;
  }
  if (!leader) return null;
  const category = getCategoryToken(leader.category);
  const programArea = getProgramArea(spaces);
  return {
    id: leader.id,
    name: leader.name.trim() || "Untitled Space",
    area: usableArea(leader),
    share: programArea > 0 ? usableArea(leader) / programArea : 0,
    categoryId: category.id,
    categoryLabel: category.label,
    categoryColor: category.base,
  };
}

/** Ranked leaders for the live Area Leaders widget (V7.1 family). */
export function getAreaLeaders(spaces: readonly SpaceCell[], limit = 5): AreaLeader[] {
  const programArea = getProgramArea(spaces);
  return spaces
    .filter((space) => isProgramSpace(space) && usableArea(space) > 0)
    .map((space) => {
      const category = getCategoryToken(space.category);
      const area = usableArea(space);
      return {
        id: space.id,
        name: space.name.trim() || "Untitled Space",
        area,
        share: programArea > 0 ? area / programArea : 0,
        categoryId: category.id,
        categoryLabel: category.label,
        categoryColor: category.base,
      };
    })
    .sort((a, b) => b.area - a.area)
    .slice(0, Math.max(0, limit));
}

export function selectCategoryMix(spaces: readonly SpaceCell[]): CategoryMixSelection {
  return {
    programArea: getProgramArea(spaces),
    spaceCount: getSpaceCount(spaces),
    voidCount: getVoidCount(spaces),
    categories: getCategoryShares(spaces),
  };
}

const PRIVACY_GROUPS: readonly Pick<PrivacyGroup, "id" | "label">[] = [
  { id: "public", label: "Public" },
  { id: "shared", label: "Shared" },
  { id: "private", label: "Private" },
  { id: "unknown", label: "Unknown" },
];

export function selectPrivacyBalance(spaces: readonly SpaceCell[]): PrivacyBalanceSelection {
  const groups = PRIVACY_GROUPS.map<PrivacyGroup>((group) => ({ ...group, area: 0, count: 0, share: 0 }));
  const byId = new Map(groups.map((group) => [group.id, group]));
  let programArea = 0;
  let serviceArea = 0;
  for (const space of spaces) {
    if (!isProgramSpace(space)) continue;
    const area = usableArea(space);
    programArea += area;
    const id: PrivacyGroupId =
      space.privacy === "public" || space.privacy === "shared" || space.privacy === "private"
        ? space.privacy
        : "unknown";
    const group = byId.get(id);
    if (group) {
      group.area += area;
      group.count += 1;
    }
    if (getCategoryToken(space.category).id === "service") serviceArea += area;
  }
  if (programArea > 0) for (const group of groups) group.share = group.area / programArea;
  const dominant = groups.reduce<PrivacyGroup | null>(
    (leader, group) => (!leader || group.area > leader.area ? group : leader),
    null
  );
  return {
    programArea,
    voidCount: getVoidCount(spaces),
    groups,
    dominant: programArea > 0 ? dominant : null,
    serviceArea,
    serviceShare: programArea > 0 ? serviceArea / programArea : 0,
  };
}

export function selectAreaLeaders(spaces: readonly SpaceCell[], limit = 5): AreaLeadersSelection {
  return {
    programArea: getProgramArea(spaces),
    leaders: getAreaLeaders(spaces, limit),
  };
}

const validPrivacy = (privacy: SpaceCell["privacy"]): boolean =>
  privacy === "public" || privacy === "shared" || privacy === "private";

export function selectDataHealth(spaces: readonly SpaceCell[]): DataHealthSelection {
  const invalidArea = new Set<string>();
  const invalidVoidArea = new Set<string>();
  const missingName = new Set<string>();
  const uncategorized = new Set<string>();
  const unknownPrivacy = new Set<string>();
  const duplicateName = new Set<string>();
  const names = new Map<string, string[]>();

  for (const space of spaces) {
    const program = isProgramSpace(space);
    if (!Number.isFinite(space.area) || space.area <= 0) {
      (program ? invalidArea : invalidVoidArea).add(space.id);
    }
    const normalizedName = space.name.trim().toLowerCase();
    if (!normalizedName) missingName.add(space.id);
    else {
      const matchingIds = names.get(normalizedName);
      if (matchingIds) matchingIds.push(space.id);
      else names.set(normalizedName, [space.id]);
    }
    if (program && getCategoryToken(space.category).id === "uncategorized") uncategorized.add(space.id);
    if (program && !validPrivacy(space.privacy)) unknownPrivacy.add(space.id);
  }

  for (const ids of names.values()) {
    if (ids.length > 1) ids.forEach((id) => duplicateName.add(id));
  }

  const makeSignal = (
    id: DataHealthSignalId,
    label: string,
    detail: string,
    severity: DataHealthSignal["severity"],
    affected: Set<string>
  ): DataHealthSignal => ({ id, label, detail, severity, count: affected.size, affectedIds: [...affected] });

  const signals: DataHealthSignal[] = [
    makeSignal("invalid-area", "Program area", "Add a positive finite area.", "blocking", invalidArea),
    makeSignal("invalid-void-area", "Void area", "Add a positive finite void area.", "blocking", invalidVoidArea),
    makeSignal("missing-name", "Missing name", "Name the affected record.", "attention", missingName),
    makeSignal("uncategorized", "Uncategorized", "Assign a program category.", "attention", uncategorized),
    makeSignal("unknown-privacy", "Unknown privacy", "Choose public, shared, or private.", "attention", unknownPrivacy),
    makeSignal("duplicate-name", "Duplicate name", "Differentiate repeated room names.", "attention", duplicateName),
  ];
  const totalIssueCount = signals.reduce((sum, signal) => sum + signal.count, 0);
  const affectedIds = new Set(signals.flatMap((signal) => signal.affectedIds));
  const blocking = signals.find((signal) => signal.severity === "blocking" && signal.count > 0);
  const firstIssue = blocking ?? signals.find((signal) => signal.count > 0);
  return {
    status: blocking ? "blocking" : totalIssueCount > 0 ? "attention" : "clear",
    totalIssueCount,
    affectedSpaceCount: affectedIds.size,
    signals,
    firstAffectedId: firstIssue?.affectedIds[0] ?? null,
  };
}

/** One derived snapshot for Project Pulse. Pure — same spaces in, same pulse
    out; widgets recompute via useMemo on the store `spaces` reference. */
export function computeSpatialPulse(spaces: readonly SpaceCell[]): SpatialPulse {
  const categories = getCategoryShares(spaces);
  let missingAreaCount = 0;
  let uncategorizedCount = 0;
  for (const space of spaces) {
    if (!isProgramSpace(space)) continue;
    if (usableArea(space) === 0) missingAreaCount += 1;
    if (getCategoryToken(space.category).id === "uncategorized") uncategorizedCount += 1;
  }
  return {
    spaceCount: getSpaceCount(spaces),
    voidCount: getVoidCount(spaces),
    programArea: getProgramArea(spaces),
    categories,
    dominant: categories[0] ?? null,
    privacy: getPrivacyBalance(spaces),
    largest: getLargestSpace(spaces),
    missingAreaCount,
    uncategorizedCount,
  };
}
