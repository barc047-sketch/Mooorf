import { annotationRegistry } from "../annotations/annotationRegistry";
import type { ResourceStatus } from "../annotations/types";
import { gridRegistry } from "../grid/gridRegistry";
import { iconRegistry } from "../icons/iconRegistry";
import { materialRegistry } from "../materials/materialRegistry";
import type { MaterialTarget } from "../materials/types";

export type ResourceKind = "material" | "grid" | "annotation" | "icon";
export interface ResourceCatalogueEntry { id: string; kind: ResourceKind; name: string; category: string; tags: readonly string[]; targets: readonly string[]; status: ResourceStatus; }

const entries: readonly ResourceCatalogueEntry[] = [
  ...materialRegistry.list().map((item) => ({ id: item.id, kind: "material" as const, name: item.name, category: item.category, tags: item.tags, targets: item.compatibleTargets, status: "active" as const })),
  ...gridRegistry.list().map((item) => ({ id: item.id, kind: "grid" as const, name: item.name, category: item.variant, tags: item.tags, targets: item.compatibleMaterialTargets, status: item.status })),
  ...annotationRegistry.list().map((item) => ({ id: item.id, kind: "annotation" as const, name: item.name, category: item.category, tags: item.tags, targets: item.supportedTargets, status: item.status })),
  ...iconRegistry.list().map((item) => ({ id: item.id, kind: "icon" as const, name: item.name, category: item.category, tags: item.tags, targets: item.placeableTargets, status: item.status })),
];

const canonicalId = (kind: ResourceKind, id: string): string => kind === "icon" ? iconRegistry.resolveId(id) ?? id : id;
const canonicalReadyId = (id: string): string => iconRegistry.resolveId(id) ?? id;

export const resourceCatalogue = Object.freeze({
  getById: (kind: ResourceKind, id: string) => entries.find((entry) => entry.kind === kind && entry.id === canonicalId(kind, id)) ?? null,
  list: (filter: { kind?: ResourceKind; status?: ResourceStatus } = {}) => entries.filter((entry) => (!filter.kind || entry.kind === filter.kind) && (!filter.status || entry.status === filter.status)),
  listByCategory: (kind: ResourceKind, category: string) => entries.filter((entry) => entry.kind === kind && entry.category === category),
  listByTarget: (kind: ResourceKind, target: MaterialTarget | string) => entries.filter((entry) => entry.kind === kind && entry.targets.includes(target)),
  search: (query: string) => { const needle = query.trim().toLowerCase(); return needle ? entries.filter((entry) => `${entry.name} ${entry.tags.join(" ")}`.toLowerCase().includes(needle)) : entries; },
  normalizeReadyIds: (ids: readonly string[]) => [...new Set(ids.map(canonicalReadyId).filter((id) => entries.some((entry) => entry.id === id)))],
});
