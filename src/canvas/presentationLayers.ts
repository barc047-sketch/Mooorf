import { getAreaRange } from "../design/colorMapping";
import { resolveCellAppearance } from "../domain/presentation/resolveAppearance";
import type {
  BoundaryStyle,
  ProjectPresentationDefaults,
  ResolvedBoundaryAppearance,
  ResolvedCellAppearance,
  ResolvedMembraneEdgeAppearance,
  ResolvedSurfaceAppearance,
} from "../domain/presentation/types";
import type { ColorSource, MorphMode, PaletteMode, SpaceCell, Theme } from "../types";

export interface RuntimePresentationSettings {
  presentationDefaults: ProjectPresentationDefaults;
  paletteMode: PaletteMode;
  colorSource: ColorSource;
  nucleusPaletteId: string;
  organismPaletteId: string;
  morphMode: MorphMode;
}

export interface RuntimePresentationProjection {
  byId: ReadonlyMap<string, ResolvedCellAppearance>;
  /** Membrane is one audited shared field/path, so its runtime owner is the
   * project default. The Inspector routes both shared targets to that owner
   * instead of creating disconnected per-Cell overrides. */
  membrane: ResolvedSurfaceAppearance;
  membraneEdge: ResolvedMembraneEdgeAppearance;
}

const EMPTY_REFERENCE: SpaceCell = {
  id: "__presentation_reference__",
  name: "Presentation reference",
  area: 1,
  category: "Uncategorized",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
};

/** One complete deterministic appearance projection consumed by both live
 * renderers. The central store/defaults remain the only state owner. */
export const projectRuntimePresentation = (
  spaces: readonly SpaceCell[],
  settings: RuntimePresentationSettings,
  theme: Theme
): RuntimePresentationProjection => {
  const visibleSpaces = [...spaces];
  const areaRange = getAreaRange(visibleSpaces);
  const context = {
    paletteMode: settings.paletteMode,
    colorSource: settings.colorSource,
    nucleusPaletteId: settings.nucleusPaletteId,
    organismPaletteId: settings.organismPaletteId,
    morphMode: settings.morphMode,
    theme,
    spaces: visibleSpaces,
    areaRange,
  };
  const byId = new Map(
    visibleSpaces.map((space) => [
      space.id,
      resolveCellAppearance(space, settings.presentationDefaults, context),
    ])
  );
  const reference = visibleSpaces.find((space) => space.kind !== "void") ?? visibleSpaces[0] ?? EMPTY_REFERENCE;
  const sharedReference: SpaceCell = {
    ...reference,
    appearance: reference.appearance
      ? { ...reference.appearance, membrane: undefined, membraneEdge: undefined }
      : undefined,
  };
  const shared = resolveCellAppearance(sharedReference, settings.presentationDefaults, context);
  return { byId, membrane: shared.membrane, membraneEdge: shared.membraneEdge };
};

export type RuntimeRendererKind = "classic" | "organism";

export interface BoundaryStrokeProjection {
  requestedStyle: BoundaryStyle;
  renderedStyle: BoundaryStyle;
  fallback: "unsupported-organism-style" | null;
  widthPx: number;
  offsetPx: number;
  radiusDeltaPx: number;
  radiiDeltaPx: readonly number[];
  lineDashPx: readonly number[];
  lineCap: CanvasLineCap;
}

export interface CirclePaintProjection {
  colour: string;
  opacity: number;
  radiusPx: number;
}

export interface CircleStrokeProjection extends CirclePaintProjection {
  widthPx: number;
  lineDashPx: readonly number[];
  lineCap: CanvasLineCap;
  renderedStyle: BoundaryStyle;
}

export interface CircleBoundaryProjection {
  requestedStyle: BoundaryStyle;
  renderedStyle: BoundaryStyle;
  fallback: BoundaryStrokeProjection["fallback"];
  strokes: readonly CircleStrokeProjection[];
}

export interface CircleVoidProjection {
  fillVisible: boolean;
  edgeVisible: boolean;
  radiusPx: number;
  innerRadiusPx: number;
  fillColour: string;
  fillOpacity: number;
  edgeColour: string;
  edgeOpacity: number;
  innerEdgeOpacity: number;
  edgeWidthPx: number;
  lineDashPx: readonly number[];
}

export interface CircleLayerProjection {
  cell: CirclePaintProjection | null;
  boundary: CircleBoundaryProjection | null;
  core: CirclePaintProjection | null;
  void: CircleVoidProjection | null;
}

/** Boundary width and offset are world-scaled. This keeps live Canvas
 * geometry deterministic and gives a future vector exporter the same values
 * without coupling either appearance field to Cell area or hit testing. */
export const resolveBoundaryStroke = (
  boundary: ResolvedBoundaryAppearance,
  zoom: number,
  _renderer: RuntimeRendererKind
): BoundaryStrokeProjection => {
  const scale = Number.isFinite(zoom) ? Math.max(0, zoom) : 0;
  const widthPx = boundary.width * scale;
  const offsetPx = boundary.offset * scale;
  const alignmentDelta = boundary.alignment === "inner"
    ? -widthPx / 2
    : boundary.alignment === "outer"
      ? widthPx / 2
      : 0;
  const radiusDeltaPx = offsetPx + alignmentDelta;
  const requestedStyle = boundary.style;
  const renderedStyle = requestedStyle;
  const fallback = null;
  const dash = boundary.dashLength * scale;
  const gap = boundary.gapLength * scale;
  const dotGap = (boundary.gapLength + boundary.width) * scale;
  const dotMark = Math.max(0.001, boundary.width * scale * 0.02);
  const lineDashPx = renderedStyle === "dashed"
    ? [dash, gap]
    : renderedStyle === "segmented-bars"
      ? [dash, gap * 0.5, dash, gap * 1.5]
    : renderedStyle === "dotted"
      ? [dotMark, dotGap]
      : renderedStyle === "dash-dot"
        ? [dash, gap, dotMark, dotGap]
        : [];
  const doubleSeparation = (boundary.width + boundary.secondaryLineSpacing) * scale;
  const radiiDeltaPx = renderedStyle === "double"
    ? [radiusDeltaPx - doubleSeparation / 2, radiusDeltaPx + doubleSeparation / 2]
    : [radiusDeltaPx];
  return {
    requestedStyle,
    renderedStyle,
    fallback,
    widthPx,
    offsetPx,
    radiusDeltaPx,
    radiiDeltaPx,
    lineDashPx,
    lineCap: renderedStyle === "dotted" || renderedStyle === "dash-dot" ? "round" : "butt",
  };
};

/** Projects presentation-only circle instructions around an existing renderer
 * radius. It never derives or returns area, hit, clearance, or field geometry. */
export const projectCircleLayers = (
  space: SpaceCell,
  appearance: ResolvedCellAppearance,
  radiusPx: number,
  zoom: number,
  renderer: RuntimeRendererKind
): CircleLayerProjection => {
  const radius = Number.isFinite(radiusPx) ? Math.max(0, radiusPx) : 0;
  if (space.kind === "void") {
    return {
      cell: null,
      boundary: null,
      core: null,
      void: appearance.void.visible && (appearance.void.fillVisible || appearance.void.edgeVisible) ? {
        fillVisible: appearance.void.fillVisible,
        edgeVisible: appearance.void.edgeVisible,
        radiusPx: radius,
        innerRadiusPx: radius * 0.42,
        fillColour: appearance.void.fill.colour,
        fillOpacity: appearance.void.fill.opacity,
        edgeColour: appearance.void.edge.colour,
        edgeOpacity: appearance.void.edge.opacity,
        innerEdgeOpacity: appearance.void.edge.opacity * 0.68,
        edgeWidthPx: appearance.void.edgeWidth * Math.max(0, zoom),
        lineDashPx: [5 * Math.max(0, zoom), 5 * Math.max(0, zoom)],
      } : null,
    };
  }

  const stroke = resolveBoundaryStroke(appearance.boundary, zoom, renderer);
  const boundary = appearance.boundary.visible && stroke.widthPx > 0 ? {
    requestedStyle: stroke.requestedStyle,
    renderedStyle: stroke.renderedStyle,
    fallback: stroke.fallback,
    strokes: stroke.radiiDeltaPx
      .map((delta) => radius + delta)
      .filter((projectedRadius) => projectedRadius > 0)
      .map((projectedRadius) => ({
        radiusPx: projectedRadius,
        widthPx: stroke.widthPx,
        colour: appearance.boundary.paint.colour,
        opacity: appearance.boundary.paint.opacity,
        lineDashPx: stroke.lineDashPx,
        lineCap: stroke.lineCap,
        renderedStyle: stroke.renderedStyle,
      })),
  } satisfies CircleBoundaryProjection : null;

  return {
    cell: appearance.cell.visible ? {
      radiusPx: radius,
      colour: appearance.cell.paint.colour,
      opacity: appearance.cell.paint.opacity,
    } : null,
    boundary,
    core: appearance.core.visible ? {
      radiusPx: radius * appearance.core.size,
      colour: appearance.core.paint.colour,
      opacity: appearance.core.paint.opacity,
    } : null,
    void: null,
  };
};

export interface DrawCircleLayerOptions {
  cell?: boolean;
  boundary?: boolean;
  core?: boolean;
  void?: boolean;
}

/** Canvas2D adapter shared by Classic and the lightweight Organism overlay. */
export const drawCircleLayers = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  layers: CircleLayerProjection,
  options: DrawCircleLayerOptions = {}
): void => {
  const drawCell = options.cell ?? true;
  const drawBoundary = options.boundary ?? true;
  const drawCore = options.core ?? true;
  const drawVoid = options.void ?? true;

  if (drawVoid && layers.void) {
    const layer = layers.void;
    if (layer.fillVisible) {
      ctx.save();
      ctx.fillStyle = layer.fillColour;
      ctx.globalAlpha *= layer.fillOpacity;
      ctx.beginPath();
      ctx.arc(x, y, layer.radiusPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (layer.edgeVisible && layer.edgeWidthPx > 0) {
      ctx.save();
      ctx.strokeStyle = layer.edgeColour;
      ctx.lineWidth = layer.edgeWidthPx;
      ctx.globalAlpha *= layer.edgeOpacity;
      ctx.setLineDash([...layer.lineDashPx]);
      ctx.beginPath();
      ctx.arc(x, y, layer.radiusPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = layer.edgeColour;
      ctx.lineWidth = layer.edgeWidthPx;
      ctx.globalAlpha *= layer.innerEdgeOpacity;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, y, layer.innerRadiusPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  if (drawCell && layers.cell) {
    ctx.save();
    ctx.fillStyle = layers.cell.colour;
    ctx.globalAlpha *= layers.cell.opacity;
    ctx.beginPath();
    ctx.arc(x, y, layers.cell.radiusPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (drawBoundary && layers.boundary) {
    for (const stroke of layers.boundary.strokes) {
      ctx.save();
      ctx.strokeStyle = stroke.colour;
      ctx.lineWidth = stroke.widthPx;
      ctx.lineCap = stroke.lineCap;
      ctx.globalAlpha *= stroke.opacity;
      ctx.setLineDash([...stroke.lineDashPx]);
      ctx.beginPath();
      ctx.arc(x, y, stroke.radiusPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  if (drawCore && layers.core) {
    ctx.save();
    ctx.fillStyle = layers.core.colour;
    ctx.globalAlpha *= layers.core.opacity;
    ctx.beginPath();
    ctx.arc(x, y, layers.core.radiusPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

export interface OrganismCircleOverlayOptions {
  spaceKind: "space" | "void";
  plainMode: boolean;
  backgroundColour: string;
  baseRadiusPx: number;
}

/** The production Organism keeps field geometry in WebGL while this one
 * pointer-transparent Canvas2D adapter owns exposed per-Cell presentation.
 * In plain mode it first masks the legacy opaque WebGL body, then draws the
 * canonical visible/colour/opacity result. Geometry and hit testing remain
 * unchanged because the mask and surface exist only in this overlay. */
export const drawOrganismCircleOverlay = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  layers: CircleLayerProjection,
  options: OrganismCircleOverlayOptions
): void => {
  if (options.spaceKind === "space" && options.plainMode && options.baseRadiusPx > 0) {
    ctx.save();
    ctx.fillStyle = options.backgroundColour;
    ctx.beginPath();
    ctx.arc(x, y, options.baseRadiusPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  drawCircleLayers(ctx, x, y, layers);
};

export const projectOrganismDebugPresentation = (
  enabled: boolean
): { rings: boolean; centreDots: false } => ({
  rings: enabled,
  centreDots: false,
});
