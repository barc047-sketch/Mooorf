import type { ConnectionStrokePatternId } from "../graph/types";

export type ConnectionStrokePatternFamily = "continuous" | "dash" | "parallel" | "procedural";
export type ConnectionStrokeRendererStrategy =
  | "solid"
  | "dash"
  | "double"
  | "zigzag"
  | "wave"
  | "scallop"
  | "vertical-hash"
  | "vertical-hatch"
  | "lightning";

export interface ConnectionStrokePatternDefinition {
  id: ConnectionStrokePatternId;
  name: string;
  family: ConnectionStrokePatternFamily;
  preview: { strategy: ConnectionStrokeRendererStrategy };
  rendererStrategy: ConnectionStrokeRendererStrategy;
  dashUnits?: readonly number[];
  capabilities: {
    amplitude: boolean;
    scale: boolean;
  };
  motif: {
    baseAmplitude: number;
    baseWavelength: number;
  };
}

const define = (
  definition: Omit<ConnectionStrokePatternDefinition, "preview">,
): ConnectionStrokePatternDefinition => ({
  ...definition,
  preview: { strategy: definition.rendererStrategy },
});

export const CONNECTION_STROKE_PATTERNS: readonly ConnectionStrokePatternDefinition[] = [
  define({ id: "solid", name: "Solid", family: "continuous", rendererStrategy: "solid", capabilities: { amplitude: false, scale: false }, motif: { baseAmplitude: 0, baseWavelength: 16 } }),
  define({ id: "dashed", name: "Dashed", family: "dash", rendererStrategy: "dash", dashUnits: [8, 6], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 14 } }),
  define({ id: "dotted", name: "Dotted", family: "dash", rendererStrategy: "dash", dashUnits: [1, 5], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 6 } }),
  define({ id: "dash-dot", name: "Dash-dot", family: "dash", rendererStrategy: "dash", dashUnits: [8, 4, 1, 4], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 17 } }),
  define({ id: "long-dash", name: "Long Dash", family: "dash", rendererStrategy: "dash", dashUnits: [18, 6], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 24 } }),
  define({ id: "dash-dot-dot", name: "Dash-Dot-Dot", family: "dash", rendererStrategy: "dash", dashUnits: [10, 4, 1, 3, 1, 4], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 23 } }),
  define({ id: "sparse-dot", name: "Sparse Dot", family: "dash", rendererStrategy: "dash", dashUnits: [1, 10], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 11 } }),
  define({ id: "centerline", name: "Centerline", family: "dash", rendererStrategy: "dash", dashUnits: [18, 4, 1, 4], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 27 } }),
  define({ id: "double", name: "Double", family: "parallel", rendererStrategy: "double", capabilities: { amplitude: false, scale: false }, motif: { baseAmplitude: 2, baseWavelength: 16 } }),
  define({ id: "segmented-bars", name: "Segmented", family: "dash", rendererStrategy: "dash", dashUnits: [12, 3], capabilities: { amplitude: false, scale: true }, motif: { baseAmplitude: 0, baseWavelength: 15 } }),
  define({ id: "zigzag", name: "Zigzag", family: "procedural", rendererStrategy: "zigzag", capabilities: { amplitude: true, scale: true }, motif: { baseAmplitude: 5, baseWavelength: 18 } }),
  define({ id: "wave", name: "Wave", family: "procedural", rendererStrategy: "wave", capabilities: { amplitude: true, scale: true }, motif: { baseAmplitude: 5, baseWavelength: 24 } }),
  define({ id: "scallop", name: "Scallop", family: "procedural", rendererStrategy: "scallop", capabilities: { amplitude: true, scale: true }, motif: { baseAmplitude: 5, baseWavelength: 20 } }),
  define({ id: "vertical-hash", name: "Vertical Hash", family: "procedural", rendererStrategy: "vertical-hash", capabilities: { amplitude: true, scale: true }, motif: { baseAmplitude: 5, baseWavelength: 12 } }),
  define({ id: "vertical-hatch", name: "Vertical Hatch", family: "procedural", rendererStrategy: "vertical-hatch", capabilities: { amplitude: true, scale: true }, motif: { baseAmplitude: 5, baseWavelength: 12 } }),
  define({ id: "lightning", name: "Lightning", family: "procedural", rendererStrategy: "lightning", capabilities: { amplitude: true, scale: true }, motif: { baseAmplitude: 6, baseWavelength: 22 } }),
];

const byId = new Map(CONNECTION_STROKE_PATTERNS.map((definition) => [definition.id, definition]));
const solidDefinition = CONNECTION_STROKE_PATTERNS[0]!;

export const resolveConnectionStrokePattern = (
  id: ConnectionStrokePatternId,
): ConnectionStrokePatternDefinition => byId.get(id) ?? solidDefinition;

export const connectionStrokeDashArray = (
  id: ConnectionStrokePatternId,
  patternScale: number,
): number[] => {
  const definition = resolveConnectionStrokePattern(id);
  const scale = Number.isFinite(patternScale) ? Math.min(8, Math.max(0.25, patternScale)) : 1;
  return definition.dashUnits?.map((unit) => unit * scale) ?? [];
};

export interface ConnectionStrokePoint {
  x: number;
  y: number;
}

export interface ConnectionStrokeCenterline {
  kind: "line" | "polyline" | "bezier";
  points: readonly ConnectionStrokePoint[];
}

export interface ConnectionStrokeMotif {
  paths: ConnectionStrokePoint[][];
  marks: Array<{ from: ConnectionStrokePoint; to: ConnectionStrokePoint }>;
  metrics: {
    amplitude: number;
    repetitions: number;
    wavelength: number;
  };
}

const distance = (first: ConnectionStrokePoint, second: ConnectionStrokePoint): number =>
  Math.hypot(second.x - first.x, second.y - first.y);

const cubicPoint = (
  points: readonly ConnectionStrokePoint[],
  t: number,
): ConnectionStrokePoint => {
  const [p0, p1, p2, p3] = points;
  if (!p0 || !p1 || !p2 || !p3) return p0 ?? { x: 0, y: 0 };
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * p0.x + 3 * inverse ** 2 * t * p1.x + 3 * inverse * t ** 2 * p2.x + t ** 3 * p3.x,
    y: inverse ** 3 * p0.y + 3 * inverse ** 2 * t * p1.y + 3 * inverse * t ** 2 * p2.y + t ** 3 * p3.y,
  };
};

const flattenCenterline = (centerline: ConnectionStrokeCenterline): ConnectionStrokePoint[] => {
  if (centerline.kind !== "bezier" || centerline.points.length < 4) {
    return centerline.points.map((point) => ({ ...point }));
  }
  const controlLength = centerline.points.slice(1).reduce(
    (total, point, index) => total + distance(centerline.points[index]!, point),
    0,
  );
  const samples = Math.max(16, Math.min(160, Math.ceil(controlLength / 3)));
  return Array.from({ length: samples + 1 }, (_, index) => cubicPoint(centerline.points, index / samples));
};

type CenterlineMeasure = {
  points: ConnectionStrokePoint[];
  cumulative: number[];
  length: number;
};

const measureCenterline = (centerline: ConnectionStrokeCenterline): CenterlineMeasure => {
  const points = flattenCenterline(centerline);
  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulative.push(cumulative[index - 1]! + distance(points[index - 1]!, points[index]!));
  }
  return { points, cumulative, length: cumulative[cumulative.length - 1] ?? 0 };
};

const sampleAt = (
  measure: CenterlineMeasure,
  requestedDistance: number,
): { point: ConnectionStrokePoint; tangent: ConnectionStrokePoint } => {
  if (measure.points.length < 2) return { point: measure.points[0] ?? { x: 0, y: 0 }, tangent: { x: 1, y: 0 } };
  const target = Math.min(measure.length, Math.max(0, requestedDistance));
  let index = 1;
  while (index < measure.cumulative.length - 1 && measure.cumulative[index]! < target) index += 1;
  const start = measure.points[index - 1]!;
  const end = measure.points[index]!;
  const segmentStart = measure.cumulative[index - 1]!;
  const segmentLength = Math.max(1e-6, measure.cumulative[index]! - segmentStart);
  const ratio = Math.min(1, Math.max(0, (target - segmentStart) / segmentLength));
  return {
    point: {
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio,
    },
    tangent: {
      x: (end.x - start.x) / segmentLength,
      y: (end.y - start.y) / segmentLength,
    },
  };
};

const offsetAt = (
  measure: CenterlineMeasure,
  along: number,
  transverse: number,
): ConnectionStrokePoint => {
  const sample = sampleAt(measure, along);
  return {
    x: sample.point.x - sample.tangent.y * transverse,
    y: sample.point.y + sample.tangent.x * transverse,
  };
};

const phaseOffset = (
  strategy: ConnectionStrokeRendererStrategy,
  phase: number,
  amplitude: number,
): number => {
  if (strategy === "wave") return Math.sin(phase * Math.PI * 2) * amplitude;
  if (strategy === "zigzag") return (2 / Math.PI) * Math.asin(Math.sin(phase * Math.PI * 2)) * amplitude;
  if (strategy === "scallop") return -Math.abs(Math.sin(phase * Math.PI)) * amplitude;
  if (strategy === "lightning") {
    const saw = 2 * (phase - Math.floor(phase + 0.5));
    return saw * amplitude;
  }
  return 0;
};

export const buildConnectionStrokeMotif = (
  centerline: ConnectionStrokeCenterline,
  patternId: ConnectionStrokePatternId,
  patternScale: number,
  patternAmplitude: number,
): ConnectionStrokeMotif => {
  const definition = resolveConnectionStrokePattern(patternId);
  const scale = Number.isFinite(patternScale) ? Math.min(8, Math.max(0.25, patternScale)) : 1;
  const amplitude = definition.capabilities.amplitude
    ? Math.min(64, Math.max(0.5, Number.isFinite(patternAmplitude) ? patternAmplitude : definition.motif.baseAmplitude))
    : definition.motif.baseAmplitude;
  const wavelength = definition.motif.baseWavelength * scale;
  const measure = measureCenterline(centerline);
  const repetitions = wavelength > 0 ? Math.floor(measure.length / wavelength) : 0;
  const baseMetrics = { amplitude, repetitions, wavelength };
  if (!measure.points.length) return { paths: [], marks: [], metrics: baseMetrics };

  if (definition.rendererStrategy === "vertical-hash" || definition.rendererStrategy === "vertical-hatch") {
    const marks: Array<{ from: ConnectionStrokePoint; to: ConnectionStrokePoint }> = [];
    const spacing = Math.max(2, wavelength);
    for (let along = spacing / 2; along < measure.length; along += spacing) {
      marks.push({
        from: offsetAt(measure, along, -amplitude),
        to: offsetAt(measure, along, amplitude),
      });
    }
    return {
      paths: definition.rendererStrategy === "vertical-hash" ? [measure.points] : [],
      marks,
      metrics: baseMetrics,
    };
  }

  if (definition.family !== "procedural") {
    return { paths: [measure.points], marks: [], metrics: baseMetrics };
  }

  const samplesPerWavelength = definition.rendererStrategy === "zigzag" || definition.rendererStrategy === "lightning" ? 4 : 8;
  const sampleCount = Math.max(2, Math.ceil(measure.length / Math.max(1, wavelength / samplesPerWavelength)));
  const path = Array.from({ length: sampleCount + 1 }, (_, index) => {
    const along = measure.length * index / sampleCount;
    const endpoint = index === 0 || index === sampleCount;
    const transverse = endpoint ? 0 : phaseOffset(definition.rendererStrategy, along / wavelength, amplitude);
    return offsetAt(measure, along, transverse);
  });
  return { paths: [path], marks: [], metrics: baseMetrics };
};
