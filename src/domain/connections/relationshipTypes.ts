import type {
  ConnectionAnnotationDefaults,
  ConnectionDirection,
  ConnectionPriority,
  ConnectionRequirement,
  ConnectionSemantic,
  ConnectionSemanticTypeId,
  ConnectionStrength,
  ConnectionVisual,
  KnownConnectionSemanticTypeId,
} from "../graph/types";
import {
  createHiddenConnectionAnnotationDefaults,
  normalizeConnectionAnnotationDefaults,
} from "./annotations";
import {
  CONNECTION_DIRECTIONS,
  CONNECTION_PRIORITIES,
  CONNECTION_REQUIREMENTS,
  CONNECTION_SEMANTIC_TYPES,
  CONNECTION_STRENGTHS,
} from "./registry";
import type { ConnectionIndex } from "./selectors";
import {
  cloneResolvedConnectionStyle,
  connectionTypeStyle,
  resolveConnectionStyle,
  type ConnectionStylePatch,
  type ProjectConnectionStyles,
  type ResolvedConnectionStyle,
} from "./styles";

export type RelationshipTypeAnnotationDefaults = ConnectionAnnotationDefaults;

export interface RelationshipTypeDefinition {
  id: ConnectionSemanticTypeId;
  name: string;
  shortCode: string;
  description: string;
  semanticDefaults: Omit<ConnectionSemantic, "typeId" | "notes">;
  visualDefaults: ResolvedConnectionStyle;
  annotationDefaults: RelationshipTypeAnnotationDefaults;
  origin: "factory" | "project";
  builtIn: boolean;
  archived: boolean;
}

export type ProjectRelationshipType = RelationshipTypeDefinition & {
  origin: "project";
  builtIn: false;
};

export interface CreateProjectRelationshipTypeInput {
  id?: string;
  name: string;
  shortCode?: string;
  description?: string;
  semanticDefaults?: Partial<Omit<ConnectionSemantic, "typeId" | "notes">>;
  visualDefaults?: ConnectionStylePatch;
  annotationDefaults?: Partial<RelationshipTypeAnnotationDefaults>;
}

export type RelationshipTypeMetadataInput = Pick<
  CreateProjectRelationshipTypeInput,
  "name" | "shortCode" | "description"
>;

export interface RelationshipTypeMutationGuard {
  allowed: boolean;
  reason: "custom-permanent" | "factory-read-only" | "type-in-use" | null;
}

const PROJECT_TYPE_ID_PREFIX = "rt_";
const RESERVED_IDS = new Set<string>(CONNECTION_SEMANTIC_TYPES.map((type) => type.id));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cleanText = (value: unknown, label: string, max: number, fallback = ""): string => {
  if (value === undefined) return fallback;
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const cleaned = value.replace(/\r\n?/g, "\n").trim().slice(0, max);
  if (!cleaned && !fallback) throw new Error(`${label} is required.`);
  return cleaned || fallback;
};

const cleanOptionalText = (value: unknown, label: string, max: number): string => {
  if (value === undefined) return "";
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  return value.replace(/\r\n?/g, "\n").trim().slice(0, max);
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;

const normalizedShortCode = (value: unknown, name: string): string => {
  const source = typeof value === "string" && value.trim() ? value : name;
  const cleaned = source.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12);
  if (!cleaned) throw new Error("Relationship Type short code is required.");
  return cleaned;
};

const defaultSemantic = (): Omit<ConnectionSemantic, "typeId" | "notes"> => {
  const custom = CONNECTION_SEMANTIC_TYPES[0]!;
  return { ...custom.defaults };
};

const normalizeSemanticDefaults = (value: unknown): Omit<ConnectionSemantic, "typeId" | "notes"> => {
  const input = isRecord(value) ? value : {};
  const fallback = defaultSemantic();
  return {
    requirement: oneOf<ConnectionRequirement>(input.requirement, CONNECTION_REQUIREMENTS, fallback.requirement),
    direction: oneOf<ConnectionDirection>(input.direction, CONNECTION_DIRECTIONS, fallback.direction),
    strength: oneOf<ConnectionStrength>(input.strength, CONNECTION_STRENGTHS, fallback.strength),
    priority: oneOf<ConnectionPriority>(input.priority, CONNECTION_PRIORITIES, fallback.priority),
  };
};

const resolveVisualDefaults = (
  visual: ConnectionVisual | undefined,
  styles: ProjectConnectionStyles,
): ResolvedConnectionStyle => resolveConnectionStyle({
  id: "__relationship-type-default__",
  fromSpaceId: "__source__",
  toSpaceId: "__target__",
  enabled: true,
  semantic: { typeId: "custom", ...defaultSemantic(), notes: "" },
  visual,
}, styles);

const knownFactoryId = (id: string): id is KnownConnectionSemanticTypeId => RESERVED_IDS.has(id);

const comparableText = (value: string): string => value.trim().toLocaleLowerCase();

export const getRelationshipTypeMetadataError = (
  input: RelationshipTypeMetadataInput,
  existingTypes: readonly ProjectRelationshipType[],
  editingId?: string,
): string | null => {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) return "Relationship Type name is required.";
  let shortCode = "";
  try {
    shortCode = normalizedShortCode(input.shortCode, name);
  } catch (error) {
    return error instanceof Error ? error.message : "Relationship Type code is required.";
  }
  const identities = [
    ...CONNECTION_SEMANTIC_TYPES.map((type) => ({ id: type.id, name: type.name, shortCode: type.tableCode })),
    ...existingTypes.map((type) => ({ id: type.id, name: type.name, shortCode: type.shortCode })),
  ].filter((type) => type.id !== editingId);
  if (identities.some((type) => comparableText(type.name) === comparableText(name))) {
    return "A Relationship Type with this name already exists.";
  }
  if (identities.some((type) => comparableText(type.shortCode) === comparableText(shortCode))) {
    return "A Relationship Type with this code already exists.";
  }
  return null;
};

export const createProjectRelationshipTypeId = (
  existingIds: Iterable<string>,
  now = Date.now(),
): string => {
  const used = new Set([...RESERVED_IDS, ...existingIds]);
  const base = `${PROJECT_TYPE_ID_PREFIX}${Math.max(0, Math.floor(now)).toString(36)}`;
  for (let suffix = 0; ; suffix += 1) {
    const id = `${base}_${suffix.toString(36)}`;
    if (!used.has(id)) return id;
  }
};

const buildProjectRelationshipType = (
  input: CreateProjectRelationshipTypeInput,
  existingTypes: readonly ProjectRelationshipType[],
  styles: ProjectConnectionStyles,
  now: number,
  validateMetadata: boolean,
): ProjectRelationshipType => {
  const existingIds = new Set(existingTypes.map((type) => type.id));
  const id = input.id === undefined
    ? createProjectRelationshipTypeId(existingIds, now)
    : cleanText(input.id, "Relationship Type ID", 160);
  if (knownFactoryId(id) || existingIds.has(id)) throw new Error(`Relationship Type ID "${id}" already exists.`);
  const name = cleanText(input.name, "Relationship Type name", 120);
  if (validateMetadata) {
    const metadataError = getRelationshipTypeMetadataError({
      name,
      shortCode: input.shortCode,
      description: input.description,
    }, existingTypes);
    if (metadataError) throw new Error(metadataError);
  }
  return {
    id,
    name,
    shortCode: normalizedShortCode(input.shortCode, name),
    description: cleanOptionalText(input.description, "Relationship Type description", 1_200),
    semanticDefaults: normalizeSemanticDefaults(input.semanticDefaults),
    visualDefaults: resolveVisualDefaults(input.visualDefaults, styles),
    annotationDefaults: normalizeConnectionAnnotationDefaults(input.annotationDefaults),
    origin: "project",
    builtIn: false,
    archived: false,
  };
};

export const createProjectRelationshipType = (
  input: CreateProjectRelationshipTypeInput,
  existingTypes: readonly ProjectRelationshipType[],
  styles: ProjectConnectionStyles,
  now = Date.now(),
): ProjectRelationshipType => buildProjectRelationshipType(input, existingTypes, styles, now, true);

/** Duplicates any resolved Relationship Type as a new project type. Factory
 * identity, usage and archive state are intentionally not part of the copy. */
export const duplicateRelationshipType = (
  source: RelationshipTypeDefinition,
  existingTypes: readonly ProjectRelationshipType[],
  styles: ProjectConnectionStyles,
  now = Date.now(),
): ProjectRelationshipType => {
  const baseName = `${source.name} Copy`;
  const baseCode = `${source.shortCode}C`.slice(0, 12);
  for (let suffix = 1; suffix < 10_000; suffix += 1) {
    const name = suffix === 1 ? baseName : `${baseName} ${suffix}`;
    const suffixText = suffix === 1 ? "" : String(suffix);
    const shortCode = `${baseCode.slice(0, 12 - suffixText.length)}${suffixText}`;
    if (getRelationshipTypeMetadataError({ name, shortCode, description: source.description }, existingTypes)) continue;
    return createProjectRelationshipType({
      name,
      shortCode,
      description: source.description,
      semanticDefaults: source.semanticDefaults,
      visualDefaults: source.visualDefaults,
      annotationDefaults: source.annotationDefaults,
    }, existingTypes, styles, now + suffix - 1);
  }
  throw new Error("Could not generate a unique duplicated Relationship Type.");
};

export const updateProjectRelationshipTypeMetadata = (
  id: string,
  input: RelationshipTypeMetadataInput,
  existingTypes: readonly ProjectRelationshipType[],
): ProjectRelationshipType[] => {
  const current = existingTypes.find((type) => type.id === id);
  if (!current) throw new Error("Project Relationship Type was not found.");
  const metadataError = getRelationshipTypeMetadataError(input, existingTypes, id);
  if (metadataError) throw new Error(metadataError);
  const name = cleanText(input.name, "Relationship Type name", 120);
  const shortCode = normalizedShortCode(input.shortCode, name);
  const description = cleanOptionalText(input.description, "Relationship Type description", 1_200);
  return existingTypes.map((type) => type.id === id ? {
    ...type,
    name,
    shortCode,
    description,
  } : type);
};

export const normalizeProjectRelationshipTypes = (
  value: unknown,
  styles: ProjectConnectionStyles,
): ProjectRelationshipType[] => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error("Project Relationship Types must be an array.");
  const result: ProjectRelationshipType[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) throw new Error("Project Relationship Type is invalid.");
    const type = buildProjectRelationshipType({
      id: raw.id as string,
      name: raw.name as string,
      shortCode: raw.shortCode as string,
      description: raw.description as string,
      semanticDefaults: raw.semanticDefaults as CreateProjectRelationshipTypeInput["semanticDefaults"],
      visualDefaults: raw.visualDefaults as ConnectionStylePatch,
      annotationDefaults: raw.annotationDefaults as RelationshipTypeAnnotationDefaults,
    }, result, styles, Date.now(), false);
    result.push({ ...type, archived: raw.archived === true });
  }
  return result;
};

export const cloneProjectRelationshipTypes = (
  types: readonly ProjectRelationshipType[],
): ProjectRelationshipType[] => types.map((type) => ({
  ...type,
  semanticDefaults: { ...type.semanticDefaults },
  visualDefaults: cloneResolvedConnectionStyle(type.visualDefaults),
  annotationDefaults: { ...type.annotationDefaults },
}));

export const getFactoryRelationshipTypes = (
  styles: ProjectConnectionStyles,
): RelationshipTypeDefinition[] => CONNECTION_SEMANTIC_TYPES.map((semantic) => ({
  id: semantic.id,
  name: semantic.name,
  shortCode: semantic.tableCode,
  description: semantic.description,
  semanticDefaults: { ...semantic.defaults },
  visualDefaults: connectionTypeStyle(semantic.id, styles),
  annotationDefaults: createHiddenConnectionAnnotationDefaults(),
  origin: "factory",
  builtIn: true,
  archived: false,
}));

export const getAllRelationshipTypes = (
  projectTypes: readonly ProjectRelationshipType[],
  styles: ProjectConnectionStyles,
): RelationshipTypeDefinition[] => [
  ...getFactoryRelationshipTypes(styles),
  ...cloneProjectRelationshipTypes(projectTypes),
];

export const getSelectableRelationshipTypes = (
  projectTypes: readonly ProjectRelationshipType[],
  styles: ProjectConnectionStyles,
): RelationshipTypeDefinition[] => getAllRelationshipTypes(projectTypes, styles)
  .filter((type) => !type.archived);

export const searchRelationshipTypes = (
  types: readonly RelationshipTypeDefinition[],
  query: string,
): RelationshipTypeDefinition[] => {
  const normalized = comparableText(query);
  if (!normalized) return [...types];
  return types.filter((type) => [type.name, type.shortCode, type.description]
    .some((value) => comparableText(value).includes(normalized)));
};

export const resolveRelationshipType = (
  id: string | null | undefined,
  projectTypes: readonly ProjectRelationshipType[],
  styles: ProjectConnectionStyles,
): RelationshipTypeDefinition => getAllRelationshipTypes(projectTypes, styles)
  .find((type) => type.id === id) ?? getFactoryRelationshipTypes(styles)[0]!;

export const getRelationshipTypeMutationGuard = (
  type: RelationshipTypeDefinition,
  usageCount: number,
  operation: "archive" | "delete",
): RelationshipTypeMutationGuard => {
  void operation;
  if (type.id === "custom") return { allowed: false, reason: "custom-permanent" };
  if (type.builtIn) return { allowed: false, reason: "factory-read-only" };
  if (usageCount > 0) return { allowed: false, reason: "type-in-use" };
  return { allowed: true, reason: null };
};

export const getRelationshipTypeUsageCount = (
  index: ConnectionIndex,
  typeId: ConnectionSemanticTypeId,
): number => index.byType.get(typeId)?.length ?? 0;
