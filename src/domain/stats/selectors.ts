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
  categoryLabel: string;
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
    area[space.privacy] += usableArea(space);
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
    if (!leader || usableArea(space) > usableArea(leader)) leader = space;
  }
  if (!leader) return null;
  return {
    id: leader.id,
    name: leader.name.trim() || "Untitled Space",
    area: usableArea(leader),
    categoryLabel: getCategoryToken(leader.category).label,
  };
}

/** Ranked leaders for the future Area Leaders widget (V7 family). */
export function getAreaLeaders(spaces: readonly SpaceCell[], limit = 5): AreaLeader[] {
  return spaces
    .filter(isProgramSpace)
    .map((space) => ({
      id: space.id,
      name: space.name.trim() || "Untitled Space",
      area: usableArea(space),
      categoryLabel: getCategoryToken(space.category).label,
    }))
    .sort((a, b) => b.area - a.area)
    .slice(0, Math.max(0, limit));
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
