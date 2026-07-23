import { LABEL_FONT_FAMILY_CSS } from "../../domain/labels/layoutContract";
import type {
  ResolvedConnectionAnnotation,
  ResolvedConnectionAnnotationPresentation,
} from "../../domain/graph/types";
import type { ConnectionVisualScaleMode } from "../../domain/connections/styles";
import { Z_MAX, Z_MIN } from "../../lib/camera";
import type { ConnectionPath, ConnectionPathBounds, ConnectionPoint } from "./geometry";

export type ConnectionAnnotationLod = "full" | "title" | "none";
export type ConnectionAnnotationPriority = "selected" | "related" | "normal";
export type ConnectionAnnotationMeasureText = (
  text: string,
  role: "title" | "body",
  presentation: ResolvedConnectionAnnotationPresentation,
) => number;

export const CONNECTION_ANNOTATION_BODY_MAX_LINES = 4;
export const CONNECTION_ANNOTATION_FULL_BUDGET = 24;
export const CONNECTION_ANNOTATION_TITLE_BUDGET = 96;
export const CONNECTION_ANNOTATION_CANDIDATE_BUDGET = CONNECTION_ANNOTATION_TITLE_BUDGET;

const TITLE_FONT_SIZE = 12;
const BODY_FONT_SIZE = 10.5;
const TITLE_BODY_GAP = 3;
const EPSILON = 1e-9;

export interface ConnectionAnnotationProjectionInput {
  connectionId: string;
  annotation: ResolvedConnectionAnnotation;
  path: ConnectionPath;
  viewport: ConnectionPathBounds;
  priority: ConnectionAnnotationPriority;
  /** The canonical camera zoom used by the shared Connection visual-scale mode. */
  cameraZoom: number;
  /** The same project-global scale owner used by Connection graphics. */
  visualScaleMode: ConnectionVisualScaleMode;
  presentation: ResolvedConnectionAnnotationPresentation;
}

export interface ConnectionAnnotationTypography {
  titleFontSize: number;
  titleFontWeight: number;
  titleColor: string;
  titleOpacity: number;
  bodyFontSize: number;
  bodyFontWeight: number;
  bodyColor: string;
  bodyOpacity: number;
  titleLineHeight: number;
  bodyLineHeight: number;
  paddingX: number;
  paddingY: number;
  plateRadius: number;
  plateBackgroundColor: string;
  plateBackgroundOpacity: number;
  plateBorderWidth: number;
  titleBodyGap: number;
  pathGap: number;
  maxWidth: number;
}

export interface ProjectedConnectionAnnotationText {
  /** Full canonical text. Visual truncation is represented only by lines. */
  text: string;
  lines: string[];
  truncated: boolean;
}

export interface ProjectedConnectionAnnotation {
  connectionId: string;
  lod: Exclude<ConnectionAnnotationLod, "none">;
  title: ProjectedConnectionAnnotationText | null;
  body: ProjectedConnectionAnnotationText | null;
  /** Semantic anchor on the canonical centerline. Bounds carry the perpendicular offset. */
  anchor: ConnectionPoint;
  bounds: ConnectionPathBounds;
  alignment: "horizontal-center";
  textAlign: "left" | "center" | "right";
  side: "preferred" | "opposite";
  rotation: 0;
  opacity: number;
  visualScale: number;
  typography: ConnectionAnnotationTypography;
  presentation: ResolvedConnectionAnnotationPresentation;
  visible: true;
}

export interface ConnectionAnnotationProjectionMetrics {
  annotationCandidates: number;
  annotationLayouts: number;
  annotationFull: number;
  annotationTitleOnly: number;
  annotationCollisionRejected: number;
  annotationCollisionChecks: number;
}

export interface ConnectionAnnotationProjectionResult {
  annotations: ProjectedConnectionAnnotation[];
  metrics: ConnectionAnnotationProjectionMetrics;
}

export interface ConnectionAnnotationProjectionOptions {
  measureText?: ConnectionAnnotationMeasureText;
  viewport?: ConnectionPathBounds;
  maximumCandidates?: number;
  maximumFull?: number;
  maximumTitleOnly?: number;
}

export interface ConnectionPathMidpoint {
  point: ConnectionPoint;
  tangent: ConnectionPoint;
  normal: ConnectionPoint;
  length: number;
}

export interface ConnectionAnnotationLodInput {
  projectedPathLength: number;
  titleVisible: boolean;
  bodyVisible: boolean;
  selected: boolean;
  priority: Exclude<ConnectionAnnotationPriority, "selected">;
}

export interface ConnectionAnnotationDrawOptions {
  theme: "day" | "night" | string;
  outputScale?: number;
}

export interface ConnectionAnnotationDrawWork {
  annotationDrawn: number;
  fillCalls: number;
  strokeCalls: number;
  textCalls: number;
}

const emptyMetrics = (): ConnectionAnnotationProjectionMetrics => ({
  annotationCandidates: 0,
  annotationLayouts: 0,
  annotationFull: 0,
  annotationTitleOnly: 0,
  annotationCollisionRejected: 0,
  annotationCollisionChecks: 0,
});

const finitePoint = (point: ConnectionPoint | undefined): ConnectionPoint => ({
  x: Number.isFinite(point?.x) ? point!.x : 0,
  y: Number.isFinite(point?.y) ? point!.y : 0,
});

const bezierPoint = (path: ConnectionPath, t: number): ConnectionPoint => {
  const [start, controlA, controlB, end] = path.points.map(finitePoint);
  if (!start || !controlA || !controlB || !end) return start ?? { x: 0, y: 0 };
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * start.x + 3 * inverse ** 2 * t * controlA.x + 3 * inverse * t ** 2 * controlB.x + t ** 3 * end.x,
    y: inverse ** 3 * start.y + 3 * inverse ** 2 * t * controlA.y + 3 * inverse * t ** 2 * controlB.y + t ** 3 * end.y,
  };
};

const sampledPath = (path: ConnectionPath): ConnectionPoint[] => path.kind === "bezier" && path.points.length >= 4
  ? Array.from({ length: 65 }, (_, index) => bezierPoint(path, index / 64))
  : path.points.map(finitePoint);

const normalizedTangent = (start: ConnectionPoint, end: ConnectionPoint): ConnectionPoint => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  let tangent = length > EPSILON ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
  if (tangent.x < -EPSILON || (Math.abs(tangent.x) <= EPSILON && tangent.y < 0)) {
    tangent = { x: -tangent.x, y: -tangent.y };
  }
  return {
    x: Math.abs(tangent.x) <= EPSILON ? 0 : tangent.x,
    y: Math.abs(tangent.y) <= EPSILON ? 0 : tangent.y,
  };
};

export const resolveConnectionPathPosition = (
  path: ConnectionPath,
  authoredPosition = 0.5,
): ConnectionPathMidpoint => {
  const points = sampledPath(path);
  const fallback = points[0] ?? { x: 0, y: 0 };
  if (points.length < 2) {
    return { point: fallback, tangent: { x: 1, y: 0 }, normal: { x: 0, y: -1 }, length: 0 };
  }
  const segments: Array<{ start: ConnectionPoint; end: ConnectionPoint; length: number }> = [];
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]!;
    const end = points[index]!;
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (length <= EPSILON) continue;
    segments.push({ start, end, length });
    total += length;
  }
  if (total <= EPSILON || !segments.length) {
    return { point: fallback, tangent: { x: 1, y: 0 }, normal: { x: 0, y: -1 }, length: 0 };
  }
  const position = Number.isFinite(authoredPosition)
    ? Math.min(1, Math.max(0, authoredPosition))
    : 0.5;
  const target = total * position;
  let traversed = 0;
  const segment = segments.find((candidate) => {
    if (traversed + candidate.length >= target) return true;
    traversed += candidate.length;
    return false;
  }) ?? segments[segments.length - 1]!;
  const ratio = Math.max(0, Math.min(1, (target - traversed) / segment.length));
  const tangent = normalizedTangent(segment.start, segment.end);
  return {
    point: {
      x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
      y: segment.start.y + (segment.end.y - segment.start.y) * ratio,
    },
    tangent,
    normal: { x: tangent.y, y: -tangent.x },
    length: total,
  };
};

export const resolveConnectionPathMidpoint = (path: ConnectionPath): ConnectionPathMidpoint =>
  resolveConnectionPathPosition(path, 0.5);

export const resolveConnectionAnnotationLod = (
  input: ConnectionAnnotationLodInput,
): ConnectionAnnotationLod => {
  if (!input.titleVisible && !input.bodyVisible) return "none";
  const length = Number.isFinite(input.projectedPathLength)
    ? Math.max(0, input.projectedPathLength)
    : 0;
  if (input.selected) {
    if (input.bodyVisible && length >= 140) return "full";
    return input.titleVisible ? "title" : "none";
  }
  const related = input.priority === "related";
  if (input.bodyVisible && length >= (related ? 200 : 220)) return "full";
  if (input.titleVisible && length >= (related ? 80 : 96)) return "title";
  return "none";
};

const estimateText: ConnectionAnnotationMeasureText = (text, role, presentation) => {
  const scale = role === "title"
    ? presentation.title.fontSize / TITLE_FONT_SIZE
    : presentation.body.fontSize / BODY_FONT_SIZE;
  return [...text].reduce((width, glyph) => {
    if (/\s/.test(glyph)) return width + (role === "title" ? 3.2 : 2.8);
    if (/[ilI1.,'|]/.test(glyph)) return width + (role === "title" ? 3.4 : 3);
    if (/[MW@#%]/.test(glyph)) return width + (role === "title" ? 9.2 : 7.8);
    return width + (role === "title" ? 6.4 : 5.4);
  }, 0) * scale;
};

const ellipsize = (
  text: string,
  role: "title" | "body",
  maximumWidth: number,
  measure: ConnectionAnnotationMeasureText,
  presentation: ResolvedConnectionAnnotationPresentation,
): string => {
  const normalized = text.trim();
  if (measure(normalized, role, presentation) <= maximumWidth) return normalized;
  let clipped = normalized;
  while (clipped && measure(`${clipped.trimEnd()}…`, role, presentation) > maximumWidth) clipped = clipped.slice(0, -1);
  return `${clipped.trimEnd()}…`;
};

const wrapText = (
  text: string,
  role: "title" | "body",
  maximumWidth: number,
  maximumLines: number,
  measure: ConnectionAnnotationMeasureText,
  presentation: ResolvedConnectionAnnotationPresentation,
): ProjectedConnectionAnnotationText => {
  const canonical = text;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return { text: canonical, lines: [], truncated: false };
  if (maximumLines <= 1) {
    const line = ellipsize(normalized, role, maximumWidth, measure, presentation);
    return { text: canonical, lines: [line], truncated: line !== normalized };
  }
  const words = normalized.split(" ");
  const lines: string[] = [];
  let cursor = 0;
  let visuallyClipped = false;
  while (cursor < words.length && lines.length < maximumLines) {
    let line = "";
    while (cursor < words.length) {
      const word = words[cursor]!;
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate, role, presentation) <= maximumWidth) {
        line = candidate;
        cursor += 1;
        continue;
      }
      if (!line) {
        line = ellipsize(word, role, maximumWidth, measure, presentation);
        visuallyClipped = visuallyClipped || line !== word;
        cursor += 1;
      }
      break;
    }
    if (line) lines.push(line);
  }
  const truncated = cursor < words.length || visuallyClipped;
  if (truncated && lines.length) {
    lines[lines.length - 1] = ellipsize(`${lines[lines.length - 1]}…`, role, maximumWidth, measure, presentation)
      .replace(/…+$/, "…");
  }
  return { text: canonical, lines, truncated };
};

const typographyFor = (
  presentation: ResolvedConnectionAnnotationPresentation,
  visualScale: number,
): ConnectionAnnotationTypography => ({
  titleFontSize: presentation.title.fontSize * visualScale,
  titleFontWeight: presentation.title.fontWeight,
  titleColor: presentation.title.color,
  titleOpacity: presentation.title.opacity,
  bodyFontSize: presentation.body.fontSize * visualScale,
  bodyFontWeight: presentation.body.fontWeight,
  bodyColor: presentation.body.color,
  bodyOpacity: presentation.body.opacity,
  titleLineHeight: Math.max(presentation.title.fontSize, presentation.title.fontSize * 1.25) * visualScale,
  bodyLineHeight: presentation.body.lineHeight * visualScale,
  paddingX: presentation.plate.paddingX * visualScale,
  paddingY: presentation.plate.paddingY * visualScale,
  plateRadius: presentation.plate.cornerRadius * visualScale,
  plateBackgroundColor: presentation.plate.backgroundColor,
  plateBackgroundOpacity: presentation.plate.backgroundOpacity,
  plateBorderWidth: 0.75 * visualScale,
  titleBodyGap: TITLE_BODY_GAP * visualScale,
  pathGap: presentation.placement.offset * visualScale,
  maxWidth: presentation.placement.maxWidth * visualScale,
});

const normalizeConnectionAnnotationZoom = (cameraZoom: number): number => {
  if (!Number.isFinite(cameraZoom) || cameraZoom <= 0) return 1;
  return Math.min(Z_MAX, Math.max(Z_MIN, cameraZoom));
};

export const resolveConnectionAnnotationVisualScale = (
  cameraZoom: number,
  mode: ConnectionVisualScaleMode,
): number => mode === "canvas" ? normalizeConnectionAnnotationZoom(cameraZoom) : 1;

const opacityFor = (priority: ConnectionAnnotationPriority): number =>
  priority === "selected" ? 1 : priority === "related" ? 0.88 : 0.72;

const projectionForSide = (
  input: ConnectionAnnotationProjectionInput,
  lod: Exclude<ConnectionAnnotationLod, "none">,
  side: "preferred" | "opposite",
  measure: ConnectionAnnotationMeasureText,
): ProjectedConnectionAnnotation | null => {
  const frame = resolveConnectionPathPosition(input.path, input.presentation.placement.pathPosition);
  const visualScale = resolveConnectionAnnotationVisualScale(input.cameraZoom, input.visualScaleMode);
  const typography = typographyFor(input.presentation, visualScale);
  const scaledMeasure: ConnectionAnnotationMeasureText = (text, role, presentation) =>
    measure(text, role, presentation) * visualScale;
  const contentWidth = Math.max(1, typography.maxWidth - typography.paddingX * 2);
  const title = input.annotation.title.visible
    ? wrapText(input.annotation.title.text, "title", contentWidth, 1, scaledMeasure, input.presentation)
    : null;
  const body = lod === "full" && input.annotation.body.visible
    ? wrapText(input.annotation.body.text, "body", contentWidth, CONNECTION_ANNOTATION_BODY_MAX_LINES, scaledMeasure, input.presentation)
    : null;
  if (!title && !body) return null;
  const contentHeight = (title ? typography.titleLineHeight : 0)
    + (title && body ? typography.titleBodyGap : 0)
    + (body ? body.lines.length * typography.bodyLineHeight : 0);
  const height = contentHeight + typography.paddingY * 2;
  const plateWidth = body
    ? typography.maxWidth
    : Math.min(
      typography.maxWidth,
      Math.max(48 * visualScale, scaledMeasure(title?.lines[0] ?? "", "title", input.presentation) + typography.paddingX * 2),
    );
  const sideMultiplier = side === "preferred" ? 1 : -1;
  const centre = {
    x: frame.point.x + frame.normal.x * sideMultiplier * (typography.pathGap + height / 2),
    y: frame.point.y + frame.normal.y * sideMultiplier * (typography.pathGap + height / 2),
  };
  return {
    connectionId: input.connectionId,
    lod,
    title,
    body,
    anchor: frame.point,
    bounds: {
      x: centre.x - plateWidth / 2,
      y: centre.y - height / 2,
      width: plateWidth,
      height,
    },
    alignment: "horizontal-center",
    textAlign: input.presentation.placement.alignment,
    side,
    rotation: 0,
    opacity: opacityFor(input.priority),
    visualScale,
    typography,
    presentation: {
      title: { ...input.presentation.title },
      body: { ...input.presentation.body },
      placement: { ...input.presentation.placement },
      plate: { ...input.presentation.plate },
    },
    visible: true,
  };
};

const rectInsideViewport = (bounds: ConnectionPathBounds, viewport: ConnectionPathBounds): boolean => {
  const margin = 2;
  return bounds.x >= viewport.x + margin
    && bounds.y >= viewport.y + margin
    && bounds.x + bounds.width <= viewport.x + viewport.width - margin
    && bounds.y + bounds.height <= viewport.y + viewport.height - margin;
};

const rectsOverlap = (left: ConnectionPathBounds, right: ConnectionPathBounds): boolean => {
  const gap = 4;
  return left.x < right.x + right.width + gap
    && left.x + left.width + gap > right.x
    && left.y < right.y + right.height + gap
    && left.y + left.height + gap > right.y;
};

const priorityRank = (priority: ConnectionAnnotationPriority): number =>
  priority === "selected" ? 0 : priority === "related" ? 1 : 2;

const boundedInteger = (value: number | undefined, fallback: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value!)) : fallback;

export const projectConnectionAnnotations = (
  inputs: readonly ConnectionAnnotationProjectionInput[],
  options: ConnectionAnnotationProjectionOptions = {},
): ConnectionAnnotationProjectionResult => {
  const metrics = emptyMetrics();
  const measure = options.measureText ?? estimateText;
  const maximumCandidates = boundedInteger(options.maximumCandidates, CONNECTION_ANNOTATION_CANDIDATE_BUDGET);
  const maximumFull = boundedInteger(options.maximumFull, CONNECTION_ANNOTATION_FULL_BUDGET);
  const maximumAnnotations = boundedInteger(options.maximumTitleOnly, CONNECTION_ANNOTATION_TITLE_BUDGET);
  const prioritized = [...inputs]
    .filter((input) => input.annotation.title.visible || input.annotation.body.visible)
    .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority)
      || left.connectionId.localeCompare(right.connectionId))
    .slice(0, maximumCandidates);
  metrics.annotationCandidates = prioritized.length;
  const annotations: ProjectedConnectionAnnotation[] = [];
  const occupied: ConnectionPathBounds[] = [];
  let fullCount = 0;

  const place = (
    input: ConnectionAnnotationProjectionInput,
    lod: Exclude<ConnectionAnnotationLod, "none">,
    viewport: ConnectionPathBounds,
    ignoreCollision: boolean,
  ): ProjectedConnectionAnnotation | null => {
    const sides = input.presentation.placement.side === "a"
      ? ["preferred"] as const
      : input.presentation.placement.side === "b"
        ? ["opposite"] as const
        : ["preferred", "opposite"] as const;
    for (const side of sides) {
      const projection = projectionForSide(input, lod, side, measure);
      if (!projection || !rectInsideViewport(projection.bounds, viewport)) continue;
      let collision = false;
      for (const bounds of occupied) {
        metrics.annotationCollisionChecks += 1;
        if (rectsOverlap(projection.bounds, bounds)) {
          collision = true;
          break;
        }
      }
      if (!collision || ignoreCollision) return projection;
    }
    return null;
  };

  for (const input of prioritized) {
    if (annotations.length >= maximumAnnotations) break;
    const viewport = options.viewport ?? input.viewport;
    const frame = resolveConnectionPathPosition(input.path, input.presentation.placement.pathPosition);
    let lod = resolveConnectionAnnotationLod({
      projectedPathLength: frame.length,
      titleVisible: input.annotation.title.visible,
      bodyVisible: input.annotation.body.visible,
      selected: input.priority === "selected",
      priority: input.priority === "related" ? "related" : "normal",
    });
    if (lod === "none") continue;
    if (lod === "full" && fullCount >= maximumFull) lod = input.annotation.title.visible ? "title" : "none";
    if (lod === "none") continue;
    let projection = place(input, lod, viewport, false);
    if (!projection && lod === "full" && input.annotation.title.visible) {
      lod = "title";
      projection = place(input, lod, viewport, false);
    }
    if (!projection && input.priority === "selected") projection = place(input, lod, viewport, true);
    if (!projection) {
      metrics.annotationCollisionRejected += 1;
      continue;
    }
    annotations.push(projection);
    occupied.push(projection.bounds);
    if (projection.lod === "full") fullCount += 1;
  }

  metrics.annotationLayouts = annotations.length;
  metrics.annotationFull = annotations.filter((annotation) => annotation.lod === "full").length;
  metrics.annotationTitleOnly = annotations.length - metrics.annotationFull;
  return { annotations, metrics };
};

const safeOutputScale = (value: number | undefined): number =>
  Number.isFinite(value) && value! > 0 ? Math.min(100, Math.max(0.01, value!)) : 1;

export const connectionAnnotationFontCss = (
  role: "title" | "body",
  presentation: ResolvedConnectionAnnotationPresentation,
  outputScale = 1,
  visualScale = 1,
): string => {
  const scale = 1 / safeOutputScale(outputScale);
  const weight = role === "title" ? presentation.title.fontWeight : presentation.body.fontWeight;
  const size = (role === "title" ? presentation.title.fontSize : presentation.body.fontSize) * visualScale * scale;
  return `${weight} ${size}px ${LABEL_FONT_FAMILY_CSS.primary}`;
};

const drawBounds = (
  annotation: ProjectedConnectionAnnotation,
  outputScale: number,
): ConnectionPathBounds => ({
  x: annotation.anchor.x + (annotation.bounds.x - annotation.anchor.x) / outputScale,
  y: annotation.anchor.y + (annotation.bounds.y - annotation.anchor.y) / outputScale,
  width: annotation.bounds.width / outputScale,
  height: annotation.bounds.height / outputScale,
});

export const drawConnectionAnnotations = (
  context: CanvasRenderingContext2D,
  annotations: readonly ProjectedConnectionAnnotation[],
  options: ConnectionAnnotationDrawOptions,
): ConnectionAnnotationDrawWork => {
  const work: ConnectionAnnotationDrawWork = {
    annotationDrawn: 0,
    fillCalls: 0,
    strokeCalls: 0,
    textCalls: 0,
  };
  const outputScale = safeOutputScale(options.outputScale);
  const night = options.theme === "night";
  const resolveColor = (value: string, role: "title" | "body" | "plate") => {
    if (value !== "auto") return value;
    if (role === "plate") return night ? "#16181b" : "#faf9f6";
    if (role === "title") return night ? "#f8f8f6" : "#191b1e";
    return night ? "#e6e7e5" : "#373a3e";
  };
  for (const annotation of annotations) {
    const bounds = drawBounds(annotation, outputScale);
    const typography = annotation.typography;
    const scale = 1 / outputScale;
    context.save();
    if (typography.plateBackgroundOpacity > 0) {
      context.globalAlpha = annotation.opacity * typography.plateBackgroundOpacity;
      context.beginPath();
      if (typography.plateRadius > 0 && typeof context.roundRect === "function") {
        context.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, typography.plateRadius * scale);
      } else {
        context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
      context.fillStyle = resolveColor(typography.plateBackgroundColor, "plate");
      context.fill();
      work.fillCalls += 1;
      context.globalAlpha = annotation.opacity * Math.min(typography.plateBackgroundOpacity, 0.65);
      context.strokeStyle = night ? "rgba(255, 255, 255, 0.15)" : "rgba(20, 22, 25, 0.14)";
      context.lineWidth = typography.plateBorderWidth * scale;
      context.stroke();
      work.strokeCalls += 1;
    }
    context.textAlign = annotation.textAlign;
    context.textBaseline = "top";
    const left = annotation.textAlign === "left"
      ? bounds.x + typography.paddingX * scale
      : annotation.textAlign === "right"
        ? bounds.x + bounds.width - typography.paddingX * scale
        : bounds.x + bounds.width / 2;
    let top = bounds.y + typography.paddingY * scale;
    if (annotation.title) {
      context.globalAlpha = annotation.opacity * typography.titleOpacity;
      context.fillStyle = resolveColor(typography.titleColor, "title");
      context.font = connectionAnnotationFontCss("title", annotation.presentation, outputScale, annotation.visualScale);
      for (const line of annotation.title.lines) {
        context.fillText(line, left, top);
        top += typography.titleLineHeight * scale;
        work.textCalls += 1;
      }
    }
    if (annotation.title && annotation.body) top += typography.titleBodyGap * scale;
    if (annotation.body) {
      context.globalAlpha = annotation.opacity * typography.bodyOpacity;
      context.fillStyle = resolveColor(typography.bodyColor, "body");
      context.font = connectionAnnotationFontCss("body", annotation.presentation, outputScale, annotation.visualScale);
      for (const line of annotation.body.lines) {
        context.fillText(line, left, top);
        top += typography.bodyLineHeight * scale;
        work.textCalls += 1;
      }
    }
    context.restore();
    work.annotationDrawn += 1;
  }
  return work;
};
