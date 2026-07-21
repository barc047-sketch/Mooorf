import type {
  Connection,
  ConnectionDirection,
  ConnectionLabelContent,
  ConnectionLabelOffset,
  ConnectionLabelOrientation,
  ConnectionLabelPosition,
  ConnectionPriority,
  ConnectionRequirement,
  ConnectionSemantic,
  ConnectionSemanticTypeId,
  ConnectionStrength,
  ConnectionVisual,
} from "../graph/types";
import type { ProjectConnectionStyles, ResolvedConnectionStyle } from "./styles";
import {
  CONNECTION_DIRECTIONS,
  CONNECTION_PRIORITIES,
  CONNECTION_REQUIREMENTS,
  CONNECTION_STRENGTHS,
  resolveConnectionSemanticType,
} from "./registry";
import {
  connectionTypeStyle,
  createDefaultProjectConnectionStyles,
} from "./styles";

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

const cloneConnectionVisual = (visual: ConnectionVisual): ConnectionVisual => {
  const { label, appearance, ...rest } = visual;
  return {
    ...rest,
    ...(label ? { label: { ...label } } : {}),
    ...(appearance ? { appearance: { ...appearance } } : {}),
  };
};

export const cloneConnection = (connection: Connection): Connection => ({
  ...connection,
  semantic: { ...connection.semantic },
  visual: connection.visual ? cloneConnectionVisual(connection.visual) : undefined,
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

const optionalRegistryId = <T extends string>(value: unknown): T | undefined =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, 160) as T : undefined;

const optionalOneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  typeof value === "string" && allowed.includes(value as T) ? value as T : undefined;

const compactDefined = <T extends object>(value: T): Partial<T> => Object.fromEntries(
  Object.entries(value).filter(([, entry]) => entry !== undefined),
) as Partial<T>;

const omitInheritedVisualValues = (
  visual: ConnectionVisual,
  inherited: ResolvedConnectionStyle | undefined,
): ConnectionVisual | undefined => {
  if (!inherited) return Object.values(visual).some((entry) => entry !== undefined) ? visual : undefined;
  const next: ConnectionVisual = { ...visual };
  for (const key of [
    "visible",
    "geometryId",
    "strokePatternId",
    "startMarkerId",
    "endMarkerId",
    "startAnchorId",
    "endAnchorId",
  ] as const) {
    if (next[key] === inherited[key]) delete next[key];
  }
  if (next.label) {
    const label = { ...next.label };
    for (const key of Object.keys(label) as Array<keyof typeof label>) {
      if (label[key] === inherited.label[key]) delete label[key];
    }
    next.label = Object.keys(label).length ? label : undefined;
  }
  if (next.appearance) {
    const appearance = { ...next.appearance };
    for (const key of Object.keys(appearance) as Array<keyof typeof appearance>) {
      if (appearance[key] === inherited.appearance[key]) delete appearance[key];
    }
    next.appearance = Object.keys(appearance).length ? appearance : undefined;
  }
  return Object.values(next).some((entry) => entry !== undefined) ? next : undefined;
};

export const normalizeConnectionVisual = (
  value: unknown,
  inherited?: ResolvedConnectionStyle,
): ConnectionVisual | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) throw new Error("Connection visual configuration is invalid.");
  const appearance = isRecord(value.appearance) ? {
    color: typeof value.appearance.color === "string" && value.appearance.color.trim()
      ? value.appearance.color.trim().slice(0, 64)
      : undefined,
    width: finiteInRange(value.appearance.width, undefined, 0.25, 32),
    opacity: finiteInRange(value.appearance.opacity, undefined, 0, 1),
    curve: finiteInRange(value.appearance.curve, undefined, -2, 2),
    markerSize: finiteInRange(value.appearance.markerSize, undefined, 2, 64),
    markerOffset: finiteInRange(value.appearance.markerOffset, undefined, -64, 64),
    dashScale: finiteInRange(value.appearance.dashScale, undefined, 0.25, 8),
  } : undefined;
  const compactAppearance = appearance && Object.values(appearance).some((entry) => entry !== undefined)
    ? compactDefined(appearance)
    : undefined;
  const label = isRecord(value.label) ? {
    content: optionalOneOf<ConnectionLabelContent>(value.label.content, ["hidden", "semantic", "custom", "direction", "strength", "priority"]),
    text: typeof value.label.text === "string" ? value.label.text.replace(/\r\n?/g, "\n").slice(0, 160) : undefined,
    position: optionalOneOf<ConnectionLabelPosition>(value.label.position, ["start", "quarter", "middle", "three-quarter", "end"]),
    orientation: optionalOneOf<ConnectionLabelOrientation>(value.label.orientation, ["horizontal", "follow-path"]),
    offset: optionalOneOf<ConnectionLabelOffset>(value.label.offset, ["above", "below"]),
    offsetPx: finiteInRange(value.label.offsetPx, undefined, 0, 64),
    hideBelowZoom: finiteInRange(value.label.hideBelowZoom, undefined, 0, 8),
  } : undefined;
  const compactLabel = label && Object.values(label).some((entry) => entry !== undefined)
    ? compactDefined(label)
    : undefined;
  return omitInheritedVisualValues(compactDefined({
    visible: typeof value.visible === "boolean" ? value.visible : undefined,
    geometryId: optionalRegistryId(value.geometryId),
    strokePatternId: optionalRegistryId(value.strokePatternId),
    startMarkerId: optionalRegistryId(value.startMarkerId),
    endMarkerId: optionalRegistryId(value.endMarkerId),
    startAnchorId: optionalRegistryId(value.startAnchorId),
    endAnchorId: optionalRegistryId(value.endAnchorId),
    label: compactLabel,
    appearance: compactAppearance,
  }) as ConnectionVisual, inherited);
};

export const normalizeConnection = (
  value: unknown,
  validCellIds: ReadonlySet<string>,
  index = 0,
  styles: ProjectConnectionStyles = createDefaultProjectConnectionStyles(),
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
  const semantic = createConnectionSemantic(typeId, {
    requirement: requireOneOf(value.semantic.requirement, CONNECTION_REQUIREMENTS, `Connection row ${index + 1} requirement`),
    direction: requireOneOf(value.semantic.direction, CONNECTION_DIRECTIONS, `Connection row ${index + 1} direction`),
    strength: requireOneOf(value.semantic.strength, CONNECTION_STRENGTHS, `Connection row ${index + 1} strength`),
    priority: requireOneOf(value.semantic.priority, CONNECTION_PRIORITIES, `Connection row ${index + 1} priority`),
    notes: typeof value.semantic.notes === "string" ? value.semantic.notes : "",
  });
  return {
    id,
    fromSpaceId,
    toSpaceId,
    enabled: value.enabled !== false,
    semantic,
    visual: normalizeConnectionVisual(value.visual, connectionTypeStyle(semantic.typeId, styles)),
  };
};

export const normalizeConnectionCollection = (
  value: unknown,
  validCellIds: ReadonlySet<string>,
  styles: ProjectConnectionStyles = createDefaultProjectConnectionStyles(),
): Connection[] => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_PROJECT_CONNECTIONS) {
    throw new Error(`Project Connections must be an array with at most ${MAX_PROJECT_CONNECTIONS} rows.`);
  }
  const connections = value.map((connection, index) => normalizeConnection(connection, validCellIds, index, styles));
  const seen = new Set<string>();
  for (const connection of connections) {
    if (seen.has(connection.id)) throw new Error(`Duplicate Connection ID "${connection.id}".`);
    seen.add(connection.id);
  }
  return connections;
};

export const connectionCellIds = (spaces: readonly { id: string; kind?: string }[]): Set<string> =>
  new Set(spaces.filter((space) => space.kind !== "void").map((space) => space.id));

export interface ConnectionAuthoringSelectionSnapshot {
  selectedIds: string[];
  primarySelectedId: string | null;
}

export type ConnectionAuthoringPhase =
  | "idle"
  | "choosing-source"
  | "source-chosen"
  | "target-preview"
  | "commit"
  | "cancelled"
  | "invalid-target"
  | "existing-duplicate";

export interface ConnectionAuthoringState {
  phase: ConnectionAuthoringPhase;
  typeId: ConnectionSemanticTypeId;
  sourceId: string | null;
  targetId: string | null;
  existingConnectionId: string | null;
  message: string;
  priorSelection: ConnectionAuthoringSelectionSnapshot | null;
}

export type ConnectionAuthoringAction =
  | {
      type: "start";
      typeId: ConnectionSemanticTypeId;
      priorSelection: ConnectionAuthoringSelectionSnapshot;
    }
  | { type: "choose-source"; sourceId: string }
  | { type: "preview-target"; targetId: string | null }
  | { type: "invalid-target"; message: string; targetId?: string | null }
  | { type: "duplicate"; targetId: string; connectionId: string }
  | { type: "commit"; connectionId: string; targetId?: string | null }
  | { type: "cancel" }
  | { type: "reset" };

export const createConnectionAuthoringState = (): ConnectionAuthoringState => ({
  phase: "idle",
  typeId: "custom",
  sourceId: null,
  targetId: null,
  existingConnectionId: null,
  message: "Choose a relationship type to begin.",
  priorSelection: null,
});

export const isConnectionAuthoringActive = (state: ConnectionAuthoringState): boolean =>
  state.phase === "choosing-source"
  || state.phase === "source-chosen"
  || state.phase === "target-preview"
  || state.phase === "invalid-target";

export const reduceConnectionAuthoring = (
  state: ConnectionAuthoringState,
  action: ConnectionAuthoringAction,
): ConnectionAuthoringState => {
  switch (action.type) {
    case "start":
      return {
        phase: "choosing-source",
        typeId: action.typeId,
        sourceId: null,
        targetId: null,
        existingConnectionId: null,
        message: "Choose a source Cell.",
        priorSelection: {
          selectedIds: [...action.priorSelection.selectedIds],
          primarySelectedId: action.priorSelection.primarySelectedId,
        },
      };
    case "choose-source":
      return {
        ...state,
        phase: "source-chosen",
        sourceId: action.sourceId,
        targetId: null,
        existingConnectionId: null,
        message: "Choose a target Cell.",
      };
    case "preview-target":
      return {
        ...state,
        phase: "target-preview",
        targetId: action.targetId,
        existingConnectionId: null,
        message: action.targetId ? "Click to connect this target." : "Choose a target Cell.",
      };
    case "invalid-target":
      return {
        ...state,
        phase: "invalid-target",
        targetId: action.targetId ?? null,
        existingConnectionId: null,
        message: action.message,
      };
    case "duplicate":
      return {
        ...state,
        phase: "existing-duplicate",
        targetId: action.targetId,
        existingConnectionId: action.connectionId,
        message: "That exact Connection already exists and is now selected.",
      };
    case "commit":
      return {
        ...state,
        phase: "commit",
        targetId: action.targetId ?? state.targetId,
        existingConnectionId: action.connectionId,
        message: "Connection created and selected.",
      };
    case "cancel":
      return {
        ...state,
        phase: "cancelled",
        targetId: null,
        existingConnectionId: null,
        message: "Connection authoring cancelled.",
      };
    case "reset":
      return createConnectionAuthoringState();
  }
};

/** Current SpaceCell has no lock/visibility fields, but imports and future graph
 * adapters may supply them. Authoring treats every explicit non-live signal as
 * invalid without widening the authored SpaceCell schema in P2. */
export const isValidConnectionEndpoint = (value: unknown): value is { id: string } => {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id.trim()) return false;
  if (value.kind === "void") return false;
  if (value.locked === true || value.visible === false || value.hidden === true || value.deleted === true) return false;
  return true;
};
