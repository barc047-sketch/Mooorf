import type { Connection, ConnectionSemanticTypeId } from "../graph/types";
import { resolveConnectionSemanticType } from "./registry";

export interface ConnectionFilterSpec {
  search: string;
  typeIds: readonly ConnectionSemanticTypeId[];
  floorIds: readonly string[];
  selectedCellIds: readonly string[];
  activeState: "all" | "active" | "inactive";
  customOnly: boolean;
  localOverrideOnly: boolean;
  crossFloorOnly: boolean;
}

export interface ConnectionFilterCell {
  id: string;
  name: string;
  floorId?: string;
}

export interface ConnectionFilterInput {
  connections: readonly Connection[];
  cellsById: ReadonlyMap<string, ConnectionFilterCell>;
  spec: ConnectionFilterSpec;
}

export const createDefaultConnectionFilterSpec = (): ConnectionFilterSpec => ({
  search: "",
  typeIds: [],
  floorIds: [],
  selectedCellIds: [],
  activeState: "all",
  customOnly: false,
  localOverrideOnly: false,
  crossFloorOnly: false,
});

const normalizedFloorId = (cell: ConnectionFilterCell | undefined): string =>
  cell?.floorId?.trim() || "unassigned";

const searchText = (
  connection: Connection,
  cellsById: ReadonlyMap<string, ConnectionFilterCell>,
): string => {
  const definition = resolveConnectionSemanticType(connection.semantic.typeId);
  const from = cellsById.get(connection.fromSpaceId);
  const to = cellsById.get(connection.toSpaceId);
  return [
    connection.id,
    connection.fromSpaceId,
    connection.toSpaceId,
    from?.name,
    to?.name,
    definition.id,
    definition.name,
    definition.tableCode,
    definition.matrixCode,
    connection.semantic.requirement,
    connection.semantic.direction,
    connection.semantic.strength,
    connection.semantic.priority,
    connection.semantic.notes,
  ].filter(Boolean).join(" ").toLocaleLowerCase();
};

export const filterConnections = ({
  connections,
  cellsById,
  spec,
}: ConnectionFilterInput): readonly Connection[] => {
  const query = spec.search.trim().toLocaleLowerCase();
  const typeIds = new Set(spec.typeIds);
  const floorIds = new Set(spec.floorIds.map((id) => id.trim() || "unassigned"));
  const selectedCellIds = new Set(spec.selectedCellIds);

  return connections.filter((connection) => {
    if (query && !searchText(connection, cellsById).includes(query)) return false;
    if (typeIds.size && !typeIds.has(connection.semantic.typeId)) return false;
    if (spec.customOnly && connection.semantic.typeId !== "custom") return false;
    if (spec.localOverrideOnly && !connection.visual) return false;
    if (spec.activeState === "active" && !connection.enabled) return false;
    if (spec.activeState === "inactive" && connection.enabled) return false;
    if (
      selectedCellIds.size
      && !selectedCellIds.has(connection.fromSpaceId)
      && !selectedCellIds.has(connection.toSpaceId)
    ) return false;

    const fromFloorId = normalizedFloorId(cellsById.get(connection.fromSpaceId));
    const toFloorId = normalizedFloorId(cellsById.get(connection.toSpaceId));
    if (floorIds.size && !floorIds.has(fromFloorId) && !floorIds.has(toFloorId)) return false;
    if (spec.crossFloorOnly && fromFloorId === toFloorId) return false;
    return true;
  });
};
