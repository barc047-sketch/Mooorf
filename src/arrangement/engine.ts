import type { ArrangementPatternId, SpaceCell } from "../types";
import type { SpacePosition } from "../interaction/groupDrag";
import type { ArrangementEntity, ArrangementParameters, ArrangementRequest, ArrangementScope } from "./types";

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const PHI = (1 + Math.sqrt(5)) / 2;

const mean = (values: readonly number[]) => values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : 0;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const directionSign = (parameters: ArrangementParameters) => parameters.direction === "clockwise" ? 1 : -1;
const rotation = (parameters: ArrangementParameters) => parameters.rotation * Math.PI / 180;
const radiusFor = (entity: ArrangementEntity, parameters: ArrangementParameters) => parameters.areaAwareSpacing
  ? Math.max(0, entity.radius)
  : 32;
const gapFor = (parameters: ArrangementParameters) => Math.max(0, parameters.spacing) + Math.max(0, parameters.collisionMargin);
const maxRadius = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters) => Math.max(1, ...entities.map((entity) => radiusFor(entity, parameters)));
const centreOf = (entities: readonly ArrangementEntity[]) => ({
  x: mean(entities.map(({ x }) => x)),
  y: mean(entities.map(({ y }) => y)),
});

const rotatePoint = (point: SpacePosition, radians: number): SpacePosition => ({
  id: point.id,
  x: point.x * Math.cos(radians) - point.y * Math.sin(radians),
  y: point.x * Math.sin(radians) + point.y * Math.cos(radians),
});

const distributeLinear = (
  entities: readonly ArrangementEntity[],
  parameters: ArrangementParameters,
  axis: "horizontal" | "vertical" | "diagonal",
): SpacePosition[] => {
  const gap = gapFor(parameters);
  let cursor = 0;
  const raw = entities.map((entity, index) => {
    const radius = radiusFor(entity, parameters);
    if (index > 0) cursor += radiusFor(entities[index - 1], parameters) + radius + gap;
    const value = cursor;
    if (axis === "vertical") return { id: entity.id, x: 0, y: value };
    if (axis === "diagonal") return { id: entity.id, x: value / Math.SQRT2, y: value / Math.SQRT2 };
    return { id: entity.id, x: value, y: 0 };
  });
  return raw;
};

const grid = (
  entities: readonly ArrangementEntity[],
  parameters: ArrangementParameters,
  mode: "grid" | "rows" | "columns",
): SpacePosition[] => {
  const n = entities.length;
  const autoColumns = Math.max(1, Math.ceil(Math.sqrt(n)));
  const requested = parameters.count == null ? null : clamp(Math.round(parameters.count), 1, Math.max(n, 1));
  const columns = mode === "rows"
    ? Math.ceil(n / (requested ?? Math.max(1, Math.round(Math.sqrt(n / 1.6)))))
    : mode === "columns"
      ? requested ?? autoColumns
      : requested ?? autoColumns;
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  return entities.map((entity, index) => ({
    id: entity.id,
    x: (index % columns) * step,
    y: Math.floor(index / columns) * step,
  }));
};

const circular = (
  entities: readonly ArrangementEntity[],
  parameters: ArrangementParameters,
  aspectX = 1,
  aspectY = 1,
): SpacePosition[] => {
  if (entities.length === 1) return [{ id: entities[0].id, x: 0, y: 0 }];
  const largest = maxRadius(entities, parameters);
  const minimumChord = largest * 2 + gapFor(parameters);
  const ringRadius = minimumChord / Math.max(0.05, 2 * Math.sin(Math.PI / entities.length));
  const sign = directionSign(parameters);
  return entities.map((entity, index) => {
    const angle = -Math.PI / 2 + sign * index / entities.length * TAU;
    return { id: entity.id, x: Math.cos(angle) * ringRadius * aspectX, y: Math.sin(angle) * ringRadius * aspectY };
  });
};

const perimeter = (
  entities: readonly ArrangementEntity[],
  parameters: ArrangementParameters,
  aspectRatio: number,
): SpacePosition[] => {
  const n = entities.length;
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  const width = Math.max(step, step * Math.ceil(Math.sqrt(n * Math.max(1, aspectRatio))));
  const height = Math.max(step, width / Math.max(1, aspectRatio));
  const perimeterLength = 2 * (width + height);
  return entities.map((entity, index) => {
    let distance = n <= 1 ? 0 : index / n * perimeterLength;
    if (distance < width) return { id: entity.id, x: -width / 2 + distance, y: -height / 2 };
    distance -= width;
    if (distance < height) return { id: entity.id, x: width / 2, y: -height / 2 + distance };
    distance -= height;
    if (distance < width) return { id: entity.id, x: width / 2 - distance, y: height / 2 };
    distance -= width;
    return { id: entity.id, x: -width / 2, y: height / 2 - distance };
  });
};

const seeded = (seed: number) => {
  let state = (Math.trunc(seed) || 1) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const randomField = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters): SpacePosition[] => {
  const random = seeded(parameters.seed);
  const extent = (maxRadius(entities, parameters) * 2 + gapFor(parameters)) * Math.sqrt(entities.length) * 0.9;
  return entities.map((entity) => ({
    id: entity.id,
    x: (random() - 0.5) * extent * 2,
    y: (random() - 0.5) * extent * 2,
  }));
};

const spiral = (
  entities: readonly ArrangementEntity[],
  parameters: ArrangementParameters,
  kind: "golden-angle" | "golden-spiral" | "archimedean" | "organic",
): SpacePosition[] => {
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  const sign = directionSign(parameters);
  const n = Math.max(1, entities.length - 1);
  return entities.map((entity, index) => {
    const angle = sign * index * GOLDEN_ANGLE;
    let distance = Math.sqrt(index) * step * 0.74;
    if (kind === "golden-spiral") {
      const normalized = (Math.pow(PHI, index / 5) - 1) / Math.max(1e-6, Math.pow(PHI, n / 5) - 1);
      distance = normalized * Math.sqrt(n) * step * clamp(parameters.spiralGrowth, 0.25, 3);
    } else if (kind === "archimedean") {
      distance = index / n * Math.sqrt(n) * step * clamp(parameters.spiralGrowth, 0.25, 3);
    } else if (kind === "organic") {
      distance *= index % 3 === 0 ? 0.82 : index % 3 === 1 ? 1.05 : 0.94;
    }
    return { id: entity.id, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  });
};

const core = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters): SpacePosition[] => {
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  return entities.map((entity, index) => {
    if (index === 0) return { id: entity.id, x: 0, y: 0 };
    const ring = Math.floor((index - 1) / 8) + 1;
    const slot = (index - 1) % 8;
    const angle = -Math.PI / 2 + slot / 8 * TAU + ring * 0.23;
    return { id: entity.id, x: Math.cos(angle) * step * ring, y: Math.sin(angle) * step * ring };
  });
};

const division = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters): SpacePosition[] => {
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  return entities.map((entity, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const local = Math.floor(index / 2);
    const angle = local * GOLDEN_ANGLE;
    const distance = Math.sqrt(local) * step * 0.65;
    return { id: entity.id, x: side * step * 1.4 + Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  });
};

const cross = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters): SpacePosition[] => {
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  return entities.map((entity, index) => {
    if (index === 0) return { id: entity.id, x: 0, y: 0 };
    const arm = (index - 1) % 4;
    const distance = (Math.floor((index - 1) / 4) + 1) * step;
    const ratio = clamp(parameters.crossArmRatio, 0.25, 3);
    if (arm === 0) return { id: entity.id, x: distance * ratio, y: 0 };
    if (arm === 1) return { id: entity.id, x: 0, y: distance };
    if (arm === 2) return { id: entity.id, x: -distance * ratio, y: 0 };
    return { id: entity.id, x: 0, y: -distance };
  });
};

const concentric = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters): SpacePosition[] => {
  const rings = clamp(Math.round(parameters.ringCount), 1, Math.max(1, entities.length));
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  return entities.map((entity, index) => {
    const ring = index % rings + 1;
    const slot = Math.floor(index / rings);
    const slots = Math.ceil((entities.length - ring + 1) / rings);
    const angle = directionSign(parameters) * slot / Math.max(1, slots) * TAU + ring * 0.17;
    return { id: entity.id, x: Math.cos(angle) * ring * step, y: Math.sin(angle) * ring * step };
  });
};

const spokes = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters): SpacePosition[] => {
  const step = maxRadius(entities, parameters) * 2 + gapFor(parameters);
  const spokeCount = Math.max(3, Math.round(Math.sqrt(entities.length)));
  return entities.map((entity, index) => {
    if (index === 0) return { id: entity.id, x: 0, y: 0 };
    const spoke = (index - 1) % spokeCount;
    const tier = Math.floor((index - 1) / spokeCount) + 1;
    const angle = directionSign(parameters) * spoke / spokeCount * TAU;
    return { id: entity.id, x: Math.cos(angle) * tier * step, y: Math.sin(angle) * tier * step };
  });
};

const pack = (entities: readonly ArrangementEntity[], parameters: ArrangementParameters, relaxed: boolean): SpacePosition[] => {
  const placed: Array<SpacePosition & { radius: number }> = [];
  const gap = gapFor(parameters) * (relaxed ? 1.8 : 0.45);
  const largest = maxRadius(entities, parameters);
  const maxAttempts = Math.min(1800, 180 + entities.length * 4);
  for (const [index, entity] of entities.entries()) {
    const radius = radiusFor(entity, parameters);
    let point = { id: entity.id, x: 0, y: 0 };
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const angle = (index + attempt) * GOLDEN_ANGLE;
      const distance = attempt === 0 ? 0 : Math.sqrt(attempt) * (largest + gap * 0.35);
      const candidate = { id: entity.id, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
      if (placed.every((other) => Math.hypot(candidate.x - other.x, candidate.y - other.y) >= radius + other.radius + gap)) {
        point = candidate;
        break;
      }
      point = candidate;
    }
    placed.push({ ...point, radius });
  }
  return placed.map(({ id, x, y }) => ({ id, x, y }));
};

const rawPositions = (request: ArrangementRequest): SpacePosition[] => {
  const { entities, parameters, patternId } = request;
  if (patternId === "horizontal-line") return distributeLinear(entities, parameters, "horizontal");
  if (patternId === "vertical-line") return distributeLinear(entities, parameters, "vertical");
  if (patternId === "diagonal-line") return distributeLinear(entities, parameters, "diagonal");
  if (patternId === "grid" || patternId === "rows" || patternId === "columns") return grid(entities, parameters, patternId);
  if (patternId === "circle" || patternId === "orbit") return circular(entities, parameters);
  if (patternId === "oval") return circular(entities, parameters, clamp(parameters.aspectRatio, 1, 3), 1);
  if (patternId === "square-perimeter") return perimeter(entities, parameters, 1);
  if (patternId === "rectangle-perimeter") return perimeter(entities, parameters, clamp(parameters.aspectRatio, 1, 3));
  if (patternId === "cross") return cross(entities, parameters);
  if (patternId === "radial-spokes") return spokes(entities, parameters);
  if (patternId === "concentric-rings") return concentric(entities, parameters);
  if (patternId === "golden-angle" || patternId === "colony") return spiral(entities, parameters, "golden-angle");
  if (patternId === "golden-spiral") return spiral(entities, parameters, "golden-spiral");
  if (patternId === "archimedean-spiral") return spiral(entities, parameters, "archimedean");
  if (patternId === "organic") return spiral(entities, parameters, "organic");
  if (patternId === "seeded-random" || patternId === "random") return randomField(entities, parameters);
  if (patternId === "compact-pack") return pack(entities, parameters, false);
  if (patternId === "relaxed-pack") return pack(entities, parameters, true);
  if (patternId === "core") return core(entities, parameters);
  if (patternId === "division") return division(entities, parameters);
  if (patternId === "tendril") return spiral(entities, parameters, "archimedean");
  if (patternId === "asymmetry") {
    const result = spiral(entities, parameters, "organic");
    if (result.length > 4) result[result.length - 1] = { ...result[result.length - 1], x: result[result.length - 1].x + gapFor(parameters) * 4 };
    return result;
  }
  return entities.map(({ id, x, y }) => ({ id, x, y }));
};

export const calculateArrangement = (request: ArrangementRequest): SpacePosition[] => {
  if (request.entities.length === 0) return [];
  const originalCentre = centreOf(request.entities);
  const radians = rotation(request.parameters);
  const rotated = rawPositions(request).map((point) => rotatePoint(point, radians));
  const projectedCentre = {
    x: mean(rotated.map(({ x }) => x)),
    y: mean(rotated.map(({ y }) => y)),
  };
  const target = request.parameters.preserveCentre ? originalCentre : { x: 0, y: 0 };
  return rotated.map((point) => ({
    id: point.id,
    x: point.x - projectedCentre.x + target.x,
    y: point.y - projectedCentre.y + target.y,
  }));
};

type EligibleSpace = SpaceCell & { visible?: boolean; hidden?: boolean; locked?: boolean };
export const resolveArrangementScope = (
  spaces: readonly EligibleSpace[],
  selectedIds: readonly string[],
  visibleIds: readonly string[],
  scope: ArrangementScope,
  includeVoids: boolean,
): string[] => {
  const selected = new Set(selectedIds);
  const visible = new Set(visibleIds);
  const useSelection = scope === "selected" || (scope === "auto" && selectedIds.length > 0);
  return spaces.filter((space) => {
    if (space.locked || space.hidden || space.visible === false) return false;
    if (!includeVoids && space.kind === "void") return false;
    return useSelection ? selected.has(space.id) : visible.has(space.id);
  }).map(({ id }) => id);
};

export const regenerateArrangementSeed = (seed: number): number => {
  const next = (Math.imul((Math.trunc(seed) || 1) ^ 0x9e3779b9, 1664525) + 1013904223) >>> 0;
  return next === (seed >>> 0) ? (next + 1) >>> 0 : next;
};

export const isLegacyLayoutPreset = (id: ArrangementPatternId): id is Extract<ArrangementPatternId, "organic" | "random" | "core" | "colony" | "division" | "tendril" | "orbit" | "asymmetry"> =>
  id === "organic" || id === "random" || id === "core" || id === "colony" || id === "division" || id === "tendril" || id === "orbit" || id === "asymmetry";
