import Papa from "papaparse";
import type { Connection } from "../domain/graph/types";
import {
  resolveRelationshipType,
  type ProjectRelationshipType,
} from "../domain/connections/relationshipTypes";
import {
  resolveConnectionAnnotation,
} from "../domain/connections/annotations";
import {
  resolveConnectionStyle,
  type ProjectConnectionStyles,
  type ResolvedConnectionStyle,
} from "../domain/connections/styles";
import {
  buildConnectionStrokeMotif,
  resolveConnectionStrokePattern,
  type ConnectionStrokeMotif,
} from "../domain/connections/strokePatterns";
import {
  buildConnectionPath,
  connectionBoundsIntersectViewport,
  connectionPathBounds,
  expandConnectionPathBounds,
  resolveConnectionLanes,
  type ConnectionEndpointGeometry,
  type ConnectionLane,
  type ConnectionPath,
  type ConnectionPathBounds,
} from "../canvas/connections/geometry";
import {
  drawConnectionBatch,
  resolveConnectionVisualMetrics,
  type ConnectionDrawCommand,
  type ConnectionVisualMetrics,
} from "../canvas/connections/renderer";
import {
  drawConnectionAnnotations,
  projectConnectionAnnotations,
  type ConnectionAnnotationMeasureText,
  type ProjectedConnectionAnnotation,
} from "../canvas/connections/annotationProjection";
import {
  resolveRelationshipLegendSpecimenStyle,
  type RelationshipLegendConfig,
  type RelationshipLegendProjection,
} from "../domain/connections/relationshipLegend";
import type { RelationshipProjectionRow } from "../domain/connections/selectors";

export interface ConnectionExportProjectionInput {
  connections: readonly Connection[];
  endpoints: ReadonlyMap<string, ConnectionEndpointGeometry>;
  styles: ProjectConnectionStyles;
  projectRelationshipTypes?: readonly ProjectRelationshipType[];
  bounds: ConnectionPathBounds;
  globalVisible: boolean;
  /** Explicit document/sheet scale. Live camera zoom is deliberately absent. */
  documentScale?: number;
  annotationMeasureText?: ConnectionAnnotationMeasureText;
}

export interface ConnectionExportPrimitive {
  /** Direct canonical reference; the export projection owns no duplicate data. */
  connection: Connection;
  id: string;
  fromSpaceId: string;
  toSpaceId: string;
  path: ConnectionPath;
  bounds: ConnectionPathBounds;
  style: ResolvedConnectionStyle;
  lane: ConnectionLane;
  metrics: ConnectionVisualMetrics;
  motif: ConnectionStrokeMotif;
  markers: {
    start: ResolvedConnectionStyle["startMarkerId"];
    end: ResolvedConnectionStyle["endMarkerId"];
  };
}

export interface ConnectionExportProjection {
  bounds: ConnectionPathBounds;
  documentScale: number;
  primitives: ConnectionExportPrimitive[];
  annotations: ProjectedConnectionAnnotation[];
  metrics: {
    authoredCount: number;
    enabledCount: number;
    visibleCount: number;
    annotationCount: number;
    omittedByGlobalVisibility: number;
  };
}

const safeDocumentScale = (value: number | undefined): number =>
  Number.isFinite(value) && value! > 0 ? Math.min(4, Math.max(0.25, value!)) : 1;

/**
 * React/DOM-independent authored export projection. It reuses canonical style,
 * anchor, lane, path, procedural motif and annotation owners, but deliberately
 * omits interactive caps, selection emphasis, hit indexes and live Canvas LOD.
 */
export const projectConnectionsForExport = (
  input: ConnectionExportProjectionInput,
): ConnectionExportProjection => {
  const documentScale = safeDocumentScale(input.documentScale);
  const empty = (omittedByGlobalVisibility: number): ConnectionExportProjection => ({
    bounds: { ...input.bounds },
    documentScale,
    primitives: [],
    annotations: [],
    metrics: {
      authoredCount: input.connections.length,
      enabledCount: 0,
      visibleCount: 0,
      annotationCount: 0,
      omittedByGlobalVisibility,
    },
  });
  if (!input.globalVisible) return empty(input.connections.length);

  const projectRelationshipTypes = input.projectRelationshipTypes ?? [];
  const drawable = input.connections.flatMap((connection) => {
    if (!connection.enabled) return [];
    const source = input.endpoints.get(connection.fromSpaceId);
    const target = input.endpoints.get(connection.toSpaceId);
    if (!source || !target) return [];
    const style = resolveConnectionStyle(
      connection,
      input.styles,
      projectRelationshipTypes,
    );
    if (!style.visible) return [];
    return [{ connection, source, target, style }];
  });
  const lanes = resolveConnectionLanes(drawable.map(({ connection }) => connection));
  const primitives = drawable.flatMap<ConnectionExportPrimitive>(
    ({ connection, source, target, style }) => {
      const lane = lanes.get(connection.id);
      if (!lane) return [];
      const metrics = resolveConnectionVisualMetrics(style, documentScale, "canvas");
      const path = buildConnectionPath(source, target, style, lane.laneOffset);
      const definition = resolveConnectionStrokePattern(style.strokePatternId);
      const extent = Math.max(
        metrics.lineWidth / 2,
        definition.capabilities.amplitude
          ? metrics.patternAmplitude + metrics.lineWidth / 2
          : 0,
        metrics.markerSize * 1.5 + Math.abs(metrics.markerOffset),
      ) + 2;
      const bounds = expandConnectionPathBounds(connectionPathBounds(path), extent);
      if (!connectionBoundsIntersectViewport(bounds, input.bounds)) return [];
      return [{
        connection,
        id: connection.id,
        fromSpaceId: connection.fromSpaceId,
        toSpaceId: connection.toSpaceId,
        path,
        bounds,
        style,
        lane,
        metrics,
        motif: buildConnectionStrokeMotif(
          path,
          style.strokePatternId,
          metrics.patternScale,
          metrics.patternAmplitude,
        ),
        markers: {
          start: style.startMarkerId,
          end: style.endMarkerId,
        },
      }];
    },
  );
  const annotations = projectConnectionAnnotations(
    primitives.map((primitive) => {
      const relationshipType = resolveRelationshipType(
        primitive.connection.semantic.typeId,
        projectRelationshipTypes,
        input.styles,
      );
      return {
        connectionId: primitive.id,
        annotation: resolveConnectionAnnotation(primitive.connection, relationshipType),
        presentation: primitive.style.annotationPresentation,
        path: primitive.path,
        viewport: input.bounds,
        cameraZoom: documentScale,
        visualScaleMode: "canvas" as const,
        priority: "normal" as const,
      };
    }),
    {
      measureText: input.annotationMeasureText,
      mode: "export",
      viewport: input.bounds,
    },
  ).annotations;

  return {
    bounds: { ...input.bounds },
    documentScale,
    primitives,
    annotations,
    metrics: {
      authoredCount: input.connections.length,
      enabledCount: input.connections.filter((connection) => connection.enabled).length,
      visibleCount: primitives.length,
      annotationCount: annotations.length,
      omittedByGlobalVisibility: 0,
    },
  };
};

export const drawConnectionsForExport = (
  context: CanvasRenderingContext2D,
  projection: ConnectionExportProjection,
  theme: "day" | "night" | string,
) => {
  const commands = projection.primitives.map<ConnectionDrawCommand>((primitive) => ({
    id: primitive.id,
    fromSpaceId: primitive.fromSpaceId,
    toSpaceId: primitive.toSpaceId,
    path: primitive.path,
    bounds: primitive.bounds,
    style: primitive.style,
    lane: primitive.lane,
    selected: false,
    emphasis: "normal",
    labelText: null,
  }));
  const connections = drawConnectionBatch(context, commands, {
    theme,
    cameraZoom: projection.documentScale,
    visualScaleMode: "canvas",
    outputScale: 1,
    fadeUnrelated: false,
    drawLabels: true,
    markerDetail: "full",
    patternFallback: false,
  });
  const annotations = drawConnectionAnnotations(context, projection.annotations, {
    theme,
    outputScale: 1,
  });
  return { connections, annotations };
};

export interface RelationshipLegendExportTarget {
  context: CanvasRenderingContext2D;
  config: RelationshipLegendConfig;
  x: number;
  y: number;
  width: number;
  height: number;
  theme: "day" | "night" | string;
  documentScale?: number;
}

export interface RelationshipLegendExportWork {
  itemsRendered: number;
  specimensRendered: number;
  textCalls: number;
}

const legendTextMetrics = (config: RelationshipLegendConfig) => {
  if (config.density === "compact") {
    return { name: 8.5, code: 6.8, description: 7, gap: 5 };
  }
  if (config.density === "large") {
    return { name: 10, code: 7.2, description: 7.5, gap: 9 };
  }
  return { name: 9, code: 6.8, description: 7, gap: 7 };
};

/**
 * Canvas/sheet renderer for the existing pure Legend projection. Target
 * placement is caller-owned and never derived from floating Widget geometry.
 */
export const renderRelationshipLegendForExport = (
  projection: RelationshipLegendProjection,
  target: RelationshipLegendExportTarget,
): RelationshipLegendExportWork => {
  const { context, config } = target;
  const scale = safeDocumentScale(target.documentScale);
  const textMetrics = legendTextMetrics(config);
  const ink = target.theme === "night" ? "#f0f1ee" : "#191b1e";
  const fog = target.theme === "night" ? "#b8bbb5" : "#696d6d";
  const soft = target.theme === "night" ? "#d4d6d0" : "#373a3e";
  let specimensRendered = 0;
  let textCalls = 0;

  context.save();
  context.beginPath();
  context.rect(target.x, target.y, Math.max(0, target.width), Math.max(0, target.height));
  context.clip();
  for (const item of projection.items) {
    const itemX = target.x + item.bounds.x;
    const itemY = target.y + item.bounds.y;
    const textWidth = Math.min(projection.layout.textWidth, item.bounds.width);
    const hasText = config.showName || config.showCode || config.showDescription;
    const hasBoth = config.showStyle && hasText;
    const specimenWidth = config.showStyle
      ? Math.max(
        projection.layout.specimenLengthMinimum,
        Math.min(
          projection.layout.specimenLengthMaximum,
          item.bounds.width - (hasText ? textWidth : 0) - (hasBoth ? textMetrics.gap : 0),
        ),
      )
      : 0;
    const textLeft = config.textPlacementX === "left";
    const specimenX = textLeft && hasText
      ? itemX + textWidth + (hasBoth ? textMetrics.gap : 0)
      : itemX;
    const textX = textLeft
      ? itemX
      : itemX + specimenWidth + (hasBoth ? textMetrics.gap : 0);

    if (config.showStyle && specimenWidth > 0) {
      const specimenY = itemY + item.bounds.height / 2;
      const style = resolveRelationshipLegendSpecimenStyle(
        item.stylePreview,
        config.specimenWeight,
      );
      const path: ConnectionPath = {
        kind: "line",
        points: [
          { x: specimenX, y: specimenY },
          { x: specimenX + specimenWidth, y: specimenY },
        ],
      };
      drawConnectionBatch(context, [{
        id: `legend:${item.typeId}`,
        fromSpaceId: "__legend-start__",
        toSpaceId: "__legend-end__",
        path,
        bounds: connectionPathBounds(path),
        style,
        lane: {
          pairKey: item.typeId,
          pairIndex: 0,
          pairCount: 1,
          laneOffset: 0,
        },
        selected: false,
        emphasis: "normal",
        labelText: null,
      }], {
        theme: target.theme,
        cameraZoom: scale,
        visualScaleMode: "canvas",
        outputScale: 1,
        fadeUnrelated: false,
        drawLabels: false,
        markerDetail: "full",
        patternFallback: false,
      });
      specimensRendered += 1;
    }

    if (!hasText) continue;
    const align = config.textAlign;
    const drawX = align === "right"
      ? textX + textWidth
      : align === "center" ? textX + textWidth / 2 : textX;
    const lineHeights = [
      config.showName ? textMetrics.name * 1.05 : 0,
      config.showCode ? textMetrics.code * 1.2 : 0,
      config.showDescription ? textMetrics.description * 2.44 : 0,
    ];
    const copyHeight = lineHeights.reduce((sum, value) => sum + value, 0);
    let cursorY = config.textPlacementY === "top"
      ? itemY
      : config.textPlacementY === "bottom"
        ? itemY + item.bounds.height - copyHeight
        : itemY + (item.bounds.height - copyHeight) / 2;
    context.textAlign = align;
    context.textBaseline = "top";
    if (config.showName) {
      context.fillStyle = ink;
      context.font = `640 ${textMetrics.name * scale}px sans-serif`;
      context.fillText(item.name, drawX, cursorY, textWidth);
      cursorY += lineHeights[0]!;
      textCalls += 1;
    }
    if (config.showCode) {
      context.fillStyle = fog;
      context.font = `600 ${textMetrics.code * scale}px monospace`;
      context.fillText(item.code, drawX, cursorY, textWidth);
      cursorY += lineHeights[1]!;
      textCalls += 1;
    }
    if (config.showDescription) {
      context.fillStyle = soft;
      context.font = `400 ${textMetrics.description * scale}px sans-serif`;
      context.fillText(item.description || "No description", drawX, cursorY, textWidth);
      textCalls += 1;
    }
  }
  context.restore();
  return {
    itemsRendered: projection.items.length,
    specimensRendered,
    textCalls,
  };
};

const RELATIONSHIP_CSV_FIELDS = [
  "Connection ID",
  "Source",
  "Target",
  "Type",
  "Type Code",
  "Enabled",
  "Title",
  "Body",
] as const;

/** Semantic relationship CSV: no path samples, wrapped lines or UI geometry. */
export const relationshipsToCsv = (
  rows: readonly RelationshipProjectionRow[],
): string => Papa.unparse({
  fields: [...RELATIONSHIP_CSV_FIELDS],
  data: rows.map((row) => [
    row.connectionId,
    row.sourceDisplayName,
    row.targetDisplayName,
    row.typeName,
    row.typeCode,
    row.enabled,
    row.title,
    row.body,
  ]),
});
