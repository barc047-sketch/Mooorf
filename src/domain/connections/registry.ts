import type {
  ConnectionDirection,
  ConnectionPriority,
  ConnectionRequirement,
  ConnectionSemantic,
  ConnectionSemanticTypeId,
  ConnectionStrength,
  KnownConnectionGeometryId,
  KnownConnectionMarkerId,
  KnownConnectionSemanticTypeId,
  KnownConnectionStrokePatternId,
} from "../graph/types";

export const CONNECTION_REQUIREMENTS = ["required", "preferred", "optional", "avoid"] as const satisfies readonly ConnectionRequirement[];
export const CONNECTION_DIRECTIONS = ["none", "two-way", "a-to-b", "b-to-a"] as const satisfies readonly ConnectionDirection[];
export const CONNECTION_STRENGTHS = ["weak", "medium", "strong"] as const satisfies readonly ConnectionStrength[];
export const CONNECTION_PRIORITIES = ["low", "normal", "high", "critical"] as const satisfies readonly ConnectionPriority[];

export const CONNECTION_GEOMETRY_IDS = ["straight", "curved", "orthogonal", "elbow"] as const satisfies readonly KnownConnectionGeometryId[];
export const CONNECTION_STROKE_PATTERN_IDS = ["solid", "dashed", "dotted", "dash-dot", "double", "segmented-bars"] as const satisfies readonly KnownConnectionStrokePatternId[];
export const CONNECTION_MARKER_IDS = [
  "none",
  "open-arrow",
  "filled-arrow",
  "open-triangle",
  "filled-triangle",
  "circle",
  "filled-dot",
  "square",
  "diamond",
  "bar",
  "slash",
  "cross",
  "architectural-tick",
  "chevron",
] as const satisfies readonly KnownConnectionMarkerId[];

export const CONNECTION_SEMANTIC_TYPE_IDS = [
  "adjacency",
  "direct-access",
  "visual-access",
  "shared-support",
  "circulation-flow",
  "separation",
] as const satisfies readonly KnownConnectionSemanticTypeId[];

export type ConnectionSemanticCategory = "proximity" | "access" | "support" | "flow" | "constraint" | "unknown";

export interface ConnectionSemanticTypeDefinition {
  id: ConnectionSemanticTypeId;
  name: string;
  description: string;
  category: ConnectionSemanticCategory;
  defaults: Omit<ConnectionSemantic, "typeId" | "notes">;
  suggestedVisualPresetId?: string;
  futureValidation?: {
    allowSelfConnection: boolean;
  };
  tableCode: string;
  matrixCode: string;
  known: boolean;
}

const define = (
  definition: Omit<ConnectionSemanticTypeDefinition, "known"> & { id: KnownConnectionSemanticTypeId },
): ConnectionSemanticTypeDefinition => ({ ...definition, known: true });

export const CONNECTION_SEMANTIC_TYPES: readonly ConnectionSemanticTypeDefinition[] = [
  define({
    id: "adjacency",
    name: "Adjacency",
    description: "Cells should be directly beside or immediately near one another.",
    category: "proximity",
    defaults: { requirement: "preferred", direction: "none", strength: "medium", priority: "normal" },
    futureValidation: { allowSelfConnection: false },
    tableCode: "ADJ",
    matrixCode: "ADJ",
  }),
  define({
    id: "direct-access",
    name: "Direct Access",
    description: "Cells require a direct navigable route between them.",
    category: "access",
    defaults: { requirement: "required", direction: "two-way", strength: "strong", priority: "high" },
    futureValidation: { allowSelfConnection: false },
    tableCode: "ACC",
    matrixCode: "ACC",
  }),
  define({
    id: "visual-access",
    name: "Visual Access",
    description: "Cells should retain a deliberate line of sight.",
    category: "access",
    defaults: { requirement: "preferred", direction: "two-way", strength: "medium", priority: "normal" },
    futureValidation: { allowSelfConnection: false },
    tableCode: "VIS",
    matrixCode: "VIS",
  }),
  define({
    id: "shared-support",
    name: "Shared Support",
    description: "Cells share a service, resource, or support dependency.",
    category: "support",
    defaults: { requirement: "preferred", direction: "two-way", strength: "medium", priority: "normal" },
    futureValidation: { allowSelfConnection: false },
    tableCode: "SUP",
    matrixCode: "SUP",
  }),
  define({
    id: "circulation-flow",
    name: "Circulation Flow",
    description: "Movement is expected to flow from one Cell toward the other.",
    category: "flow",
    defaults: { requirement: "preferred", direction: "a-to-b", strength: "strong", priority: "high" },
    futureValidation: { allowSelfConnection: false },
    tableCode: "FLOW",
    matrixCode: "FLOW",
  }),
  define({
    id: "separation",
    name: "Separation",
    description: "Cells should remain apart because of privacy, noise, risk, or conflict.",
    category: "constraint",
    defaults: { requirement: "avoid", direction: "none", strength: "strong", priority: "high" },
    futureValidation: { allowSelfConnection: false },
    tableCode: "SEP",
    matrixCode: "SEP",
  }),
];

const semanticTypeById = new Map(CONNECTION_SEMANTIC_TYPES.map((definition) => [definition.id, definition]));

export const resolveConnectionSemanticType = (id: ConnectionSemanticTypeId): ConnectionSemanticTypeDefinition => {
  const known = semanticTypeById.get(id);
  if (known) return known;
  return {
    id,
    name: `Unknown relationship (${id})`,
    description: "This relationship type comes from a newer or external registry and is preserved without interpretation.",
    category: "unknown",
    defaults: { requirement: "optional", direction: "none", strength: "medium", priority: "normal" },
    futureValidation: { allowSelfConnection: false },
    tableCode: id,
    matrixCode: id,
    known: false,
  };
};
