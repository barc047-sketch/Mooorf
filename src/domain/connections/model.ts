import type {
  Connection,
  ConnectionDirection,
  ConnectionPriority,
  ConnectionRequirement,
  ConnectionSemantic,
  ConnectionSemanticTypeId,
  ConnectionStrength,
  ConnectionVisual,
} from "../graph/types";
import {
  CONNECTION_DIRECTIONS,
  CONNECTION_PRIORITIES,
  CONNECTION_REQUIREMENTS,
  CONNECTION_STRENGTHS,
  resolveConnectionSemanticType,
} from "./registry";

export const MAX_PROJECT_CONNECTIONS = 100_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cleanText = (value: unknown, label: string, max: number): string => {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const cleaned = value.replace(/\r\n?/g, "\n").trim().slice(0, max);
  if (!cleaned && label !== "Connection notes") throw new Error(`${label} is required.`);
  return cleaned;
};

const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T => typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;

const requireOneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T => {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`${label} is invalid.`);
  }
  return value as T;
};

const finiteInRange = (
  value: unknown,
  fallback: number | undefined,
  min: number,
  max: number,
): number | undefined => {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

export const cloneConnection = (connection: Connection): Connection => ({
  ...connection,
  semantic: { ...connection.semantic },
  visual: connection.visual
    ? {
        ...connection.visual,
        appearance: connection.visual.appearance ? { ...connection.visual.appearance } : undefined,
      }
    : undefined,
});

export const cloneConnections = (connections: readonly Connection[]): Connection[] =>
  connections.map(cloneConnection);

export const createConnectionSemantic = (
  typeId: ConnectionSemanticTypeId,
  patch: Partial<Omit<ConnectionSemantic, "typeId">> = {},
): ConnectionSemantic => {
  const cleanedTypeId = cleanText(typeId, "Connection semantic type ID", 160);
  const defaults = resolveConnectionSemanticType(cleanedTypeId).defaults;
  return {
    typeId: cleanedTypeId,
    requirement: oneOf<ConnectionRequirement>(patch.requirement, CONNECTION_REQUIREMENTS, defaults.requirement),
    direction: oneOf<ConnectionDirection>(patch.direction, CONNECTION_DIRECTIONS, defaults.direction),
    strength: oneOf<ConnectionStrength>(patch.strength, CONNECTION_STRENGTHS, defaults.strength),
    priority: oneOf<ConnectionPriority>(patch.priority, CONNECTION_PRIORITIES, defaults.priority),
    notes: patch.notes === undefined ? "" : cleanText(patch.notes, "Connection notes", 1_200),
  };
};

export const normalizeConnectionVisual = (value: unknown): ConnectionVisual | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) throw new Error("Connection visual configuration is invalid.");
  const appearance = isRecord(value.appearance)
    ? {
        color: typeof value.appearance.color === "string" ? value.appearance.color.trim().slice(0, 64) : undefined,
        width: finiteInRange(value.appearance.width, undefined, 0.25, 32),
        opacity: finiteInRange(value.appearance.opacity, undefined, 0, 1),
      }
    : undefined;
  const compactAppearance = appearance && Object.values(appearance).some((entry) => entry !== undefined)
    ? appearance
    : undefined;
  return {
    visible: value.visible !== false,
    geometryId: typeof value.geometryId === "string" && value.geometryId.trim() ? value.geometryId.trim().slice(0, 160) : "straight",
    strokePatternId: typeof value.strokePatternId === "string" && value.strokePatternId.trim() ? value.strokePatternId.trim().slice(0, 160) : "solid",
    startMarkerId: typeof value.startMarkerId === "string" && value.startMarkerId.trim() ? value.startMarkerId.trim().slice(0, 160) : "none",
    endMarkerId: typeof value.endMarkerId === "string" && value.endMarkerId.trim() ? value.endMarkerId.trim().slice(0, 160) : "none",
    appearance: compactAppearance,
  };
};

export const normalizeConnection = (
  value: unknown,
  validCellIds: ReadonlySet<string>,
  index = 0,
): Connection => {
  if (!isRecord(value)) throw new Error(`Connection row ${index + 1} is invalid.`);
  const id = cleanText(value.id, `Connection row ${index + 1} ID`, 160);
  const fromSpaceId = cleanText(value.fromSpaceId, `Connection row ${index + 1} from endpoint`, 160);
  const toSpaceId = cleanText(value.toSpaceId, `Connection row ${index + 1} to endpoint`, 160);
  if (fromSpaceId === toSpaceId) throw new Error(`Connection row ${index + 1} endpoints must reference different Cells.`);
  if (!validCellIds.has(fromSpaceId) || !validCellIds.has(toSpaceId)) {
    throw new Error(`Connection row ${index + 1} has an invalid endpoint.`);
  }
  if (!isRecord(value.semantic)) throw new Error(`Connection row ${index + 1} semantic data is invalid.`);
  const typeId = cleanText(value.semantic.typeId, `Connection row ${index + 1} semantic type ID`, 160);
  return {
    id,
    fromSpaceId,
    toSpaceId,
    enabled: value.enabled !== false,
    semantic: createConnectionSemantic(typeId, {
      requirement: requireOneOf(value.semantic.requirement, CONNECTION_REQUIREMENTS, `Connection row ${index + 1} requirement`),
      direction: requireOneOf(value.semantic.direction, CONNECTION_DIRECTIONS, `Connection row ${index + 1} direction`),
      strength: requireOneOf(value.semantic.strength, CONNECTION_STRENGTHS, `Connection row ${index + 1} strength`),
      priority: requireOneOf(value.semantic.priority, CONNECTION_PRIORITIES, `Connection row ${index + 1} priority`),
      notes: typeof value.semantic.notes === "string" ? value.semantic.notes : "",
    }),
    visual: normalizeConnectionVisual(value.visual),
  };
};

export const normalizeConnectionCollection = (
  value: unknown,
  validCellIds: ReadonlySet<string>,
): Connection[] => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_PROJECT_CONNECTIONS) {
    throw new Error(`Project Connections must be an array with at most ${MAX_PROJECT_CONNECTIONS} rows.`);
  }
  const connections = value.map((connection, index) => normalizeConnection(connection, validCellIds, index));
  const seen = new Set<string>();
  for (const connection of connections) {
    if (seen.has(connection.id)) throw new Error(`Duplicate Connection ID "${connection.id}".`);
    seen.add(connection.id);
  }
  return connections;
};

export const connectionCellIds = (spaces: readonly { id: string; kind?: string }[]): Set<string> =>
  new Set(spaces.filter((space) => space.kind !== "void").map((space) => space.id));
