import type { Connection } from "../graph/types";
import { resolveConnectionSemanticType } from "./registry";

export type ConnectionOverrideMode = "all" | "inherited" | "visual" | "annotation";

export interface ConnectionFilterState {
  query: string;
  relationshipTypeId: string;
  enabled: "all" | "active" | "inactive";
  overrideMode: ConnectionOverrideMode;
}

export interface ConnectionFilterMetadata {
  sourceName: string;
  targetName: string;
  typeName: string;
  typeCode: string;
  title: string;
  body: string;
  hasVisualOverride: boolean;
  hasAnnotationOverride: boolean;
}

const normalizedQuery = (value: string): string => value.trim().toLocaleLowerCase();

export const defaultConnectionFilterState = (): ConnectionFilterState => ({
  query: "",
  relationshipTypeId: "all",
  enabled: "all",
  overrideMode: "all",
});

/** Returns the inclusive visible-order range between two IDs. Hidden or
 * unmounted records are irrelevant because callers pass the filtered model. */
export const orderedConnectionRange = (
  orderedIds: readonly string[],
  anchorId: string | null,
  targetId: string,
): string[] => {
  if (!anchorId) return [targetId];
  const anchorIndex = orderedIds.indexOf(anchorId);
  const targetIndex = orderedIds.indexOf(targetId);
  if (anchorIndex < 0 || targetIndex < 0) return [targetId];
  const start = Math.min(anchorIndex, targetIndex);
  const end = Math.max(anchorIndex, targetIndex);
  return orderedIds.slice(start, end + 1);
};

/** Pure projection filter. It preserves canonical input order and never mutates
 * or persists Manager UI state. The metadata callback keeps this reusable for
 * future Matrix/Table/export projections without duplicating Connection data. */
export const filterConnections = (
  connections: readonly Connection[],
  filters: ConnectionFilterState,
  metadataFor: (connection: Connection) => ConnectionFilterMetadata,
): Connection[] => {
  const query = normalizedQuery(filters.query);
  return connections.filter((connection) => {
    const metadata = metadataFor(connection);
    if (filters.relationshipTypeId !== "all" && connection.semantic.typeId !== filters.relationshipTypeId) return false;
    if (filters.enabled === "active" && !connection.enabled) return false;
    if (filters.enabled === "inactive" && connection.enabled) return false;
    if (filters.overrideMode === "inherited" && (metadata.hasVisualOverride || metadata.hasAnnotationOverride)) return false;
    if (filters.overrideMode === "visual" && !metadata.hasVisualOverride) return false;
    if (filters.overrideMode === "annotation" && !metadata.hasAnnotationOverride) return false;
    if (!query) return true;
    return [
      metadata.sourceName,
      metadata.targetName,
      metadata.typeName,
      metadata.typeCode,
      metadata.title,
      metadata.body,
    ].some((value) => normalizedQuery(value).includes(query));
  });
};

export interface ConnectionIndex {
  byId: ReadonlyMap<string, Connection>;
  byEndpoint: ReadonlyMap<string, readonly Connection[]>;
  byPair: ReadonlyMap<string, readonly Connection[]>;
  byExactSemantic: ReadonlyMap<string, readonly Connection[]>;
  byType: ReadonlyMap<string, readonly Connection[]>;
}

export const connectionPairKey = (firstId: string, secondId: string): string =>
  JSON.stringify(firstId <= secondId ? [firstId, secondId] : [secondId, firstId]);

const canonicalDirection = (connection: Connection): Connection["semantic"]["direction"] => {
  if (connection.fromSpaceId <= connection.toSpaceId) return connection.semantic.direction;
  if (connection.semantic.direction === "a-to-b") return "b-to-a";
  if (connection.semantic.direction === "b-to-a") return "a-to-b";
  return connection.semantic.direction;
};

export const exactConnectionSemanticKey = (connection: Connection): string => JSON.stringify([
  connectionPairKey(connection.fromSpaceId, connection.toSpaceId),
  connection.semantic.typeId,
  connection.semantic.requirement,
  canonicalDirection(connection),
  connection.semantic.strength,
  connection.semantic.priority,
  connection.semantic.notes,
]);

const append = (map: Map<string, Connection[]>, key: string, connection: Connection): void => {
  const values = map.get(key);
  if (values) values.push(connection);
  else map.set(key, [connection]);
};

export const buildConnectionIndex = (connections: readonly Connection[]): ConnectionIndex => {
  const byId = new Map<string, Connection>();
  const byEndpoint = new Map<string, Connection[]>();
  const byPair = new Map<string, Connection[]>();
  const byExactSemantic = new Map<string, Connection[]>();
  const byType = new Map<string, Connection[]>();
  for (const connection of connections) {
    byId.set(connection.id, connection);
    append(byEndpoint, connection.fromSpaceId, connection);
    append(byEndpoint, connection.toSpaceId, connection);
    append(byPair, connectionPairKey(connection.fromSpaceId, connection.toSpaceId), connection);
    append(byExactSemantic, exactConnectionSemanticKey(connection), connection);
    append(byType, connection.semantic.typeId, connection);
  }
  return { byId, byEndpoint, byPair, byExactSemantic, byType };
};

const connectionIndexCache = new WeakMap<readonly Connection[], ConnectionIndex>();

/** Reuses the derived index while the immutable canonical collection identity is unchanged. */
export const getConnectionIndex = (connections: readonly Connection[]): ConnectionIndex => {
  const cached = connectionIndexCache.get(connections);
  if (cached) return cached;
  const index = buildConnectionIndex(connections);
  connectionIndexCache.set(connections, index);
  return index;
};

export const getConnectionById = (index: ConnectionIndex, id: string): Connection | null =>
  index.byId.get(id) ?? null;

/** Connection selection is ephemeral UI state. Resolve it against the current
 * canonical collection so stale IDs can never leak into Inspector consumers. */
export const getPrimarySelectedConnection = (
  connections: readonly Connection[],
  primarySelectedConnectionId: string | null,
): Connection | null => primarySelectedConnectionId
  ? getConnectionById(getConnectionIndex(connections), primarySelectedConnectionId)
  : null;

export const getConnectionsForSpace = (index: ConnectionIndex, spaceId: string): readonly Connection[] =>
  index.byEndpoint.get(spaceId) ?? [];

export const getConnectionsBetweenSpaces = (
  index: ConnectionIndex,
  firstSpaceId: string,
  secondSpaceId: string,
): readonly Connection[] => index.byPair.get(connectionPairKey(firstSpaceId, secondSpaceId)) ?? [];

export interface ConnectionPairProjection {
  pairKey: string;
  firstSpaceId: string;
  secondSpaceId: string;
  connectionIds: string[];
  semanticTypeIds: Connection["semantic"]["typeId"][];
  tableCodes: string[];
  matrixCodes: string[];
  directions: Connection["semantic"]["direction"][];
}

export const projectConnectionPairs = (
  connections: readonly Connection[],
): ConnectionPairProjection[] => {
  const rows = new Map<string, ConnectionPairProjection>();
  for (const connection of connections) {
    const firstSpaceId = connection.fromSpaceId <= connection.toSpaceId
      ? connection.fromSpaceId
      : connection.toSpaceId;
    const secondSpaceId = firstSpaceId === connection.fromSpaceId
      ? connection.toSpaceId
      : connection.fromSpaceId;
    const key = connectionPairKey(firstSpaceId, secondSpaceId);
    const definition = resolveConnectionSemanticType(connection.semantic.typeId);
    const row = rows.get(key) ?? {
      pairKey: key,
      firstSpaceId,
      secondSpaceId,
      connectionIds: [],
      semanticTypeIds: [],
      tableCodes: [],
      matrixCodes: [],
      directions: [],
    };
    row.connectionIds.push(connection.id);
    row.semanticTypeIds.push(connection.semantic.typeId);
    row.tableCodes.push(definition.tableCode);
    row.matrixCodes.push(definition.matrixCode);
    row.directions.push(canonicalDirection(connection));
    rows.set(key, row);
  }
  return [...rows.values()];
};

export const selectConnectionIdsForPair = (
  pair: ConnectionPairProjection | undefined,
): string[] => pair ? [...pair.connectionIds] : [];

export const findExactConnectionDuplicate = (
  index: ConnectionIndex,
  candidate: Connection,
  ignoreConnectionId?: string,
): Connection | null =>
  (index.byExactSemantic.get(exactConnectionSemanticKey(candidate)) ?? [])
    .find((connection) => connection.id !== ignoreConnectionId) ?? null;

export const dependentConnectionIds = (index: ConnectionIndex, spaceId: string): Set<string> =>
  new Set(getConnectionsForSpace(index, spaceId).map((connection) => connection.id));

export const retainConnectionsForSpaces = (
  connections: readonly Connection[],
  validCellIds: ReadonlySet<string>,
): Connection[] => connections.filter(
  (connection) => validCellIds.has(connection.fromSpaceId) && validCellIds.has(connection.toSpaceId),
);
