import type { Connection } from "../graph/types";

export interface ConnectionIndex {
  byId: ReadonlyMap<string, Connection>;
  byEndpoint: ReadonlyMap<string, readonly Connection[]>;
  byPair: ReadonlyMap<string, readonly Connection[]>;
  byExactSemantic: ReadonlyMap<string, readonly Connection[]>;
}

const pairKey = (firstId: string, secondId: string): string =>
  JSON.stringify(firstId <= secondId ? [firstId, secondId] : [secondId, firstId]);

const canonicalDirection = (connection: Connection): Connection["semantic"]["direction"] => {
  if (connection.fromSpaceId <= connection.toSpaceId) return connection.semantic.direction;
  if (connection.semantic.direction === "a-to-b") return "b-to-a";
  if (connection.semantic.direction === "b-to-a") return "a-to-b";
  return connection.semantic.direction;
};

export const exactConnectionSemanticKey = (connection: Connection): string => JSON.stringify([
  pairKey(connection.fromSpaceId, connection.toSpaceId),
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
  for (const connection of connections) {
    byId.set(connection.id, connection);
    append(byEndpoint, connection.fromSpaceId, connection);
    append(byEndpoint, connection.toSpaceId, connection);
    append(byPair, pairKey(connection.fromSpaceId, connection.toSpaceId), connection);
    append(byExactSemantic, exactConnectionSemanticKey(connection), connection);
  }
  return { byId, byEndpoint, byPair, byExactSemantic };
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
): readonly Connection[] => index.byPair.get(pairKey(firstSpaceId, secondSpaceId)) ?? [];

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
