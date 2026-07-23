import type {
  Connection,
  ConnectionAnnotationPresentationOverride,
  ConnectionAnnotationOverride,
  ConnectionAnchorId,
  ConnectionGeometryId,
  ConnectionLabelContent,
  ConnectionLabelOffset,
  ConnectionLabelOrientation,
  ConnectionLabelPosition,
  ConnectionLabelStyle,
  ConnectionLineCap,
  ConnectionLineJoin,
  ConnectionMarkerId,
  ConnectionStrokePatternId,
  ConnectionVisual,
  KnownConnectionSemanticTypeId,
  ResolvedConnectionAnnotation,
  ResolvedConnectionAnnotationPresentation,
} from "../graph/types";
import { CONNECTION_SEMANTIC_TYPE_IDS } from "./registry";
import type { ProjectRelationshipType, RelationshipTypeDefinition } from "./relationshipTypes";
import {
  normalizeConnectionAnnotationPresentation,
  normalizeConnectionAnnotationPresentationOverride,
  resolveConnectionAnnotation,
  resolveConnectionAnnotationPresentation,
} from "./annotations";

export interface ResolvedConnectionAppearance {
  color: string;
  width: number;
  opacity: number;
  curve: number;
  markerSize: number;
  markerOffset: number;
  dashScale: number;
  patternAmplitude: number;
}

export interface ResolvedConnectionStyle {
  visible: boolean;
  geometryId: ConnectionGeometryId;
  strokePatternId: ConnectionStrokePatternId;
  lineCap: ConnectionLineCap;
  lineJoin: ConnectionLineJoin;
  startMarkerId: ConnectionMarkerId;
  endMarkerId: ConnectionMarkerId;
  startAnchorId: ConnectionAnchorId;
  endAnchorId: ConnectionAnchorId;
  label: ConnectionLabelStyle;
  appearance: ResolvedConnectionAppearance;
  annotationPresentation: ResolvedConnectionAnnotationPresentation;
}

export interface ConnectionAnnotationAppearanceClipboard {
  title: ResolvedConnectionAnnotationPresentation["title"];
  body: ResolvedConnectionAnnotationPresentation["body"];
  plate: ResolvedConnectionAnnotationPresentation["plate"];
}

/** Transient appearance-only clipboard payload. Identity, meaning, content,
 * anchors, placement, visibility, selection, and runtime geometry are excluded. */
export interface ConnectionStyleClipboard {
  geometryId: ConnectionGeometryId;
  strokePatternId: ConnectionStrokePatternId;
  lineCap: ConnectionLineCap;
  lineJoin: ConnectionLineJoin;
  startMarkerId: ConnectionMarkerId;
  endMarkerId: ConnectionMarkerId;
  appearance: ResolvedConnectionAppearance;
  annotationAppearance: ConnectionAnnotationAppearanceClipboard;
}

export type ConnectionStylePatch = Partial<Omit<ResolvedConnectionStyle, "label" | "appearance" | "annotationPresentation">> & {
  label?: Partial<ConnectionLabelStyle>;
  appearance?: Partial<ResolvedConnectionAppearance>;
  annotationPresentation?: ConnectionAnnotationPresentationOverride;
};

/** One transient, runtime-only style draft shared by the panel and every
 * preview consumer. Connection patches contain only explicitly touched fields. */
export type ConnectionStylePreview =
  | {
      context: "relationship-type";
      typeId: string;
      style: ResolvedConnectionStyle;
    }
  | {
      context: "connection-override";
      connectionIds: readonly string[];
      patch: ConnectionStylePatch;
      annotationContentPatch?: ConnectionAnnotationOverride;
    };

export type ProjectConnectionStyles = Record<KnownConnectionSemanticTypeId, ResolvedConnectionStyle>;

export type ConnectionFocusMode = "all" | "selected-cell" | "selected-connections";
export type ConnectionVisualScaleMode = "screen" | "canvas";

export interface ConnectionViewSettings {
  visible: boolean;
  focusMode: ConnectionFocusMode;
  visualScaleMode: ConnectionVisualScaleMode;
}

export const CONNECTION_STYLE_PACK_IDS = [
  "minimal",
  "technical",
  "presentation",
  "monochrome",
  "high-contrast",
] as const;

export type ConnectionStylePackId = typeof CONNECTION_STYLE_PACK_IDS[number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const finiteInRange = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;

const registryId = <T extends string>(value: unknown, fallback: T): T =>
  typeof value === "string" && value.trim()
    ? value.trim().slice(0, 160) as T
    : fallback;

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;

const HIDDEN_LABEL: ConnectionLabelStyle = {
  content: "hidden",
  text: "",
  position: "middle",
  orientation: "horizontal",
  offset: "above",
  offsetPx: 8,
  hideBelowZoom: 0.55,
};

const BASE_APPEARANCE: ResolvedConnectionAppearance = {
  color: "#56585d",
  width: 1.25,
  opacity: 0.82,
  curve: 0.24,
  markerSize: 8,
  markerOffset: 0,
  dashScale: 1,
  patternAmplitude: 5,
};

const cloneLabel = (label: ConnectionLabelStyle): ConnectionLabelStyle => ({ ...label });

const cloneAppearance = (appearance: ResolvedConnectionAppearance): ResolvedConnectionAppearance => ({ ...appearance });

export const cloneResolvedConnectionStyle = (style: ResolvedConnectionStyle): ResolvedConnectionStyle => ({
  ...style,
  label: cloneLabel(style.label),
  appearance: cloneAppearance(style.appearance),
  annotationPresentation: normalizeConnectionAnnotationPresentation(style.annotationPresentation),
});

const makeStyle = (
  patch: Partial<Omit<ResolvedConnectionStyle, "label" | "appearance">> & {
    label?: Partial<ConnectionLabelStyle>;
    appearance?: Partial<ResolvedConnectionAppearance>;
  } = {},
): ResolvedConnectionStyle => ({
  visible: patch.visible ?? true,
  geometryId: patch.geometryId ?? "straight",
  strokePatternId: patch.strokePatternId ?? "solid",
  lineCap: patch.lineCap ?? "butt",
  lineJoin: patch.lineJoin ?? "miter",
  startMarkerId: patch.startMarkerId ?? "none",
  endMarkerId: patch.endMarkerId ?? "none",
  startAnchorId: patch.startAnchorId ?? "auto",
  endAnchorId: patch.endAnchorId ?? "auto",
  label: { ...HIDDEN_LABEL, ...patch.label },
  appearance: { ...BASE_APPEARANCE, ...patch.appearance },
  annotationPresentation: normalizeConnectionAnnotationPresentation(patch.annotationPresentation),
});

const launchDefaults = (): ProjectConnectionStyles => ({
  custom: makeStyle({ appearance: { width: 1, opacity: 0.76 } }),
  adjacency: makeStyle({ strokePatternId: "dashed", appearance: { width: 1, opacity: 0.76, dashScale: 0.9 } }),
  "direct-access": makeStyle({ lineCap: "square", endMarkerId: "open-arrow", appearance: { width: 1.75, opacity: 0.9, markerSize: 8.5 } }),
  "visual-access": makeStyle({ geometryId: "curved", strokePatternId: "dotted", lineCap: "round", lineJoin: "round", appearance: { width: 1, opacity: 0.72, curve: 0.3 } }),
  "shared-support": makeStyle({ strokePatternId: "double", appearance: { width: 1.25, opacity: 0.78 } }),
  "circulation-flow": makeStyle({ geometryId: "curved", lineCap: "round", lineJoin: "round", endMarkerId: "filled-arrow", appearance: { width: 1.8, opacity: 0.9, curve: 0.2, markerSize: 9 } }),
  separation: makeStyle({ strokePatternId: "dash-dot", lineCap: "square", appearance: { width: 1.35, opacity: 0.84, dashScale: 1.1 } }),
});

export const createDefaultProjectConnectionStyles = (): ProjectConnectionStyles =>
  cloneProjectConnectionStyles(launchDefaults());

export const cloneProjectConnectionStyles = (styles: ProjectConnectionStyles): ProjectConnectionStyles => ({
  custom: cloneResolvedConnectionStyle(styles.custom),
  adjacency: cloneResolvedConnectionStyle(styles.adjacency),
  "direct-access": cloneResolvedConnectionStyle(styles["direct-access"]),
  "visual-access": cloneResolvedConnectionStyle(styles["visual-access"]),
  "shared-support": cloneResolvedConnectionStyle(styles["shared-support"]),
  "circulation-flow": cloneResolvedConnectionStyle(styles["circulation-flow"]),
  separation: cloneResolvedConnectionStyle(styles.separation),
});

const normalizeLabel = (value: unknown, fallback: ConnectionLabelStyle): ConnectionLabelStyle => {
  if (!isRecord(value)) return cloneLabel(fallback);
  return {
    content: oneOf<ConnectionLabelContent>(value.content, ["hidden", "semantic", "custom", "direction", "strength", "priority"], fallback.content),
    text: typeof value.text === "string" ? value.text.replace(/\r\n?/g, "\n").slice(0, 160) : fallback.text,
    position: oneOf<ConnectionLabelPosition>(value.position, ["start", "quarter", "middle", "three-quarter", "end"], fallback.position),
    orientation: oneOf<ConnectionLabelOrientation>(value.orientation, ["horizontal", "follow-path"], fallback.orientation),
    offset: oneOf<ConnectionLabelOffset>(value.offset, ["above", "below"], fallback.offset),
    offsetPx: finiteInRange(value.offsetPx, fallback.offsetPx, 0, 64),
    hideBelowZoom: finiteInRange(value.hideBelowZoom, fallback.hideBelowZoom, 0, 8),
  };
};

const normalizeAppearance = (value: unknown, fallback: ResolvedConnectionAppearance): ResolvedConnectionAppearance => {
  if (!isRecord(value)) return cloneAppearance(fallback);
  return {
    color: typeof value.color === "string" && value.color.trim()
      ? value.color.trim().slice(0, 64)
      : fallback.color,
    width: finiteInRange(value.width, fallback.width, 0.5, 64),
    opacity: finiteInRange(value.opacity, fallback.opacity, 0, 1),
    curve: finiteInRange(value.curve, fallback.curve, -2, 2),
    markerSize: finiteInRange(value.markerSize, fallback.markerSize, 2, 64),
    markerOffset: finiteInRange(value.markerOffset, fallback.markerOffset, -64, 64),
    dashScale: finiteInRange(value.dashScale, fallback.dashScale, 0.25, 8),
    patternAmplitude: finiteInRange(value.patternAmplitude, fallback.patternAmplitude, 0.5, 64),
  };
};

const normalizeResolvedStyle = (value: unknown, fallback: ResolvedConnectionStyle): ResolvedConnectionStyle => {
  if (!isRecord(value)) return cloneResolvedConnectionStyle(fallback);
  return {
    visible: typeof value.visible === "boolean" ? value.visible : fallback.visible,
    geometryId: registryId<ConnectionGeometryId>(value.geometryId, fallback.geometryId),
    strokePatternId: registryId<ConnectionStrokePatternId>(value.strokePatternId, fallback.strokePatternId),
    lineCap: oneOf<ConnectionLineCap>(value.lineCap, ["butt", "square", "round"], fallback.lineCap),
    lineJoin: oneOf<ConnectionLineJoin>(value.lineJoin, ["miter", "bevel", "round"], fallback.lineJoin),
    startMarkerId: registryId<ConnectionMarkerId>(value.startMarkerId, fallback.startMarkerId),
    endMarkerId: registryId<ConnectionMarkerId>(value.endMarkerId, fallback.endMarkerId),
    startAnchorId: registryId<ConnectionAnchorId>(value.startAnchorId, fallback.startAnchorId),
    endAnchorId: registryId<ConnectionAnchorId>(value.endAnchorId, fallback.endAnchorId),
    label: normalizeLabel(value.label, fallback.label),
    appearance: normalizeAppearance(value.appearance, fallback.appearance),
    annotationPresentation: normalizeConnectionAnnotationPresentation(
      value.annotationPresentation,
      fallback.annotationPresentation,
    ),
  };
};

export const normalizeProjectConnectionStyles = (value: unknown): ProjectConnectionStyles => {
  const defaults = launchDefaults();
  if (!isRecord(value)) return cloneProjectConnectionStyles(defaults);
  return {
    custom: normalizeResolvedStyle(value.custom, defaults.custom),
    adjacency: normalizeResolvedStyle(value.adjacency, defaults.adjacency),
    "direct-access": normalizeResolvedStyle(value["direct-access"], defaults["direct-access"]),
    "visual-access": normalizeResolvedStyle(value["visual-access"], defaults["visual-access"]),
    "shared-support": normalizeResolvedStyle(value["shared-support"], defaults["shared-support"]),
    "circulation-flow": normalizeResolvedStyle(value["circulation-flow"], defaults["circulation-flow"]),
    separation: normalizeResolvedStyle(value.separation, defaults.separation),
  };
};

export const updateProjectConnectionStyle = (
  styles: ProjectConnectionStyles,
  typeId: KnownConnectionSemanticTypeId,
  patch: ConnectionStylePatch,
): ProjectConnectionStyles => {
  const normalized = normalizeProjectConnectionStyles(styles);
  const current = normalized[typeId];
  normalized[typeId] = normalizeResolvedStyle({
    ...current,
    ...patch,
    label: { ...current.label, ...patch.label },
    appearance: { ...current.appearance, ...patch.appearance },
    annotationPresentation: {
      ...current.annotationPresentation,
      ...patch.annotationPresentation,
      title: { ...current.annotationPresentation.title, ...patch.annotationPresentation?.title },
      body: { ...current.annotationPresentation.body, ...patch.annotationPresentation?.body },
      placement: { ...current.annotationPresentation.placement, ...patch.annotationPresentation?.placement },
      plate: { ...current.annotationPresentation.plate, ...patch.annotationPresentation?.plate },
    },
  }, current);
  return normalized;
};

const isKnownType = (value: string): value is KnownConnectionSemanticTypeId =>
  CONNECTION_SEMANTIC_TYPE_IDS.includes(value as KnownConnectionSemanticTypeId);

export const connectionTypeStyle = (
  typeId: string,
  styles: ProjectConnectionStyles,
  projectRelationshipTypes: readonly ProjectRelationshipType[] = [],
): ResolvedConnectionStyle => {
  if (isKnownType(typeId)) return cloneResolvedConnectionStyle(styles[typeId]);
  const projectType = projectRelationshipTypes.find((type) => type.id === typeId);
  return cloneResolvedConnectionStyle(projectType?.visualDefaults ?? styles.custom);
};

const mergeLocalVisual = (
  base: ResolvedConnectionStyle,
  visual: ConnectionVisual | undefined,
  annotationPresentation?: ConnectionAnnotationPresentationOverride,
): ResolvedConnectionStyle => {
  if (!visual && !annotationPresentation) return cloneResolvedConnectionStyle(base);
  return {
    visible: visual?.visible ?? base.visible,
    geometryId: visual?.geometryId ?? base.geometryId,
    strokePatternId: visual?.strokePatternId ?? base.strokePatternId,
    lineCap: visual?.lineCap ?? base.lineCap,
    lineJoin: visual?.lineJoin ?? base.lineJoin,
    startMarkerId: visual?.startMarkerId ?? base.startMarkerId,
    endMarkerId: visual?.endMarkerId ?? base.endMarkerId,
    startAnchorId: visual?.startAnchorId ?? base.startAnchorId,
    endAnchorId: visual?.endAnchorId ?? base.endAnchorId,
    label: normalizeLabel(visual?.label, base.label),
    appearance: normalizeAppearance(visual?.appearance, base.appearance),
    annotationPresentation: resolveConnectionAnnotationPresentation(
      base.annotationPresentation,
      annotationPresentation,
    ),
  };
};

export const applyConnectionStylePatch = (
  style: ResolvedConnectionStyle,
  patch: ConnectionStylePatch,
): ResolvedConnectionStyle => normalizeResolvedStyle({
  ...style,
  ...patch,
  label: { ...style.label, ...patch.label },
  appearance: { ...style.appearance, ...patch.appearance },
  annotationPresentation: {
    ...style.annotationPresentation,
    ...patch.annotationPresentation,
    title: { ...style.annotationPresentation.title, ...patch.annotationPresentation?.title },
    body: { ...style.annotationPresentation.body, ...patch.annotationPresentation?.body },
    placement: { ...style.annotationPresentation.placement, ...patch.annotationPresentation?.placement },
    plate: { ...style.annotationPresentation.plate, ...patch.annotationPresentation?.plate },
  },
}, style);

export const resolveRelationshipTypeStylePreview = (
  typeId: string,
  style: ResolvedConnectionStyle,
  preview: ConnectionStylePreview | null | undefined,
): ResolvedConnectionStyle => preview?.context === "relationship-type" && preview.typeId === typeId
  ? cloneResolvedConnectionStyle(preview.style)
  : cloneResolvedConnectionStyle(style);

/** Resolve canonical type defaults, local overrides, then the transient
 * touched-field draft. This ordering keeps local overrides authoritative when
 * a Relationship Type default is previewed and lets explicit panel touches win
 * for the fixed Connection target set. */
export const resolveConnectionStylePreview = (
  connection: Connection,
  styles: ProjectConnectionStyles,
  projectRelationshipTypes: readonly ProjectRelationshipType[] = [],
  preview?: ConnectionStylePreview | null,
): ResolvedConnectionStyle => {
  const canonicalBase = connectionTypeStyle(
    connection.semantic.typeId,
    styles,
    projectRelationshipTypes,
  );
  const base = preview?.context === "relationship-type" && preview.typeId === connection.semantic.typeId
    ? preview.style
    : canonicalBase;
  const resolved = mergeLocalVisual(base, connection.visual, connection.annotationPresentation);
  return preview?.context === "connection-override" && preview.connectionIds.includes(connection.id)
    ? applyConnectionStylePatch(resolved, preview.patch)
    : resolved;
};

export const resolveConnectionStyle = (
  connection: Connection,
  styles: ProjectConnectionStyles,
  projectRelationshipTypes: readonly ProjectRelationshipType[] = [],
): ResolvedConnectionStyle => mergeLocalVisual(
  connectionTypeStyle(connection.semantic.typeId, styles, projectRelationshipTypes),
  connection.visual,
  connection.annotationPresentation,
);

export const resolveConnectionAnnotationPreview = (
  connection: Connection,
  relationshipType: Pick<RelationshipTypeDefinition, "name" | "annotationDefaults"> | null | undefined,
  preview?: ConnectionStylePreview | null,
): ResolvedConnectionAnnotation => {
  if (preview?.context !== "connection-override" || !preview.connectionIds.includes(connection.id)) {
    return resolveConnectionAnnotation(connection, relationshipType);
  }
  return resolveConnectionAnnotation({
    ...connection,
    annotation: {
      ...connection.annotation,
      ...preview.annotationContentPatch,
    },
  }, relationshipType);
};

export const copyResolvedConnectionStyle = (
  connection: Connection,
  styles: ProjectConnectionStyles,
  projectRelationshipTypes: readonly ProjectRelationshipType[] = [],
): ConnectionStyleClipboard => {
  const resolved = resolveConnectionStyle(connection, styles, projectRelationshipTypes);
  return copyResolvedStyle(resolved);
};

export const copyResolvedStyle = (
  resolved: ResolvedConnectionStyle,
): ConnectionStyleClipboard => {
  return {
    geometryId: resolved.geometryId,
    strokePatternId: resolved.strokePatternId,
    lineCap: resolved.lineCap,
    lineJoin: resolved.lineJoin,
    startMarkerId: resolved.startMarkerId,
    endMarkerId: resolved.endMarkerId,
    appearance: cloneAppearance(resolved.appearance),
    annotationAppearance: {
      title: { ...resolved.annotationPresentation.title },
      body: { ...resolved.annotationPresentation.body },
      plate: { ...resolved.annotationPresentation.plate },
    },
  };
};

/** Applies the shared resolved visual clipboard to a Type default while
 * retaining target-only label and anchor defaults. */
export const pasteConnectionStyleToResolvedStyle = (
  clipboard: ConnectionStyleClipboard,
  target: ResolvedConnectionStyle,
): ResolvedConnectionStyle => ({
  ...target,
  geometryId: clipboard.geometryId,
  strokePatternId: clipboard.strokePatternId,
  lineCap: clipboard.lineCap,
  lineJoin: clipboard.lineJoin,
  startMarkerId: clipboard.startMarkerId,
  endMarkerId: clipboard.endMarkerId,
  appearance: { ...target.appearance, ...clipboard.appearance },
  annotationPresentation: {
    ...target.annotationPresentation,
    title: { ...clipboard.annotationAppearance.title },
    body: { ...clipboard.annotationAppearance.body },
    placement: { ...target.annotationPresentation.placement },
    plate: { ...clipboard.annotationAppearance.plate },
  },
});

const sparseSection = <T extends object>(
  copied: T,
  inherited: T,
): Partial<T> => {
  const copiedRecord = copied as Record<string, unknown>;
  const inheritedRecord = inherited as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(copiedRecord)
      .filter((key) => copiedRecord[key] !== inheritedRecord[key])
      .map((key) => [key, copiedRecord[key]]),
  ) as Partial<T>;
};

/** Rebase copied annotation appearance while retaining target-local placement.
 * Content and path placement never enter the clipboard. */
export const pasteConnectionStyleAnnotationPresentation = (
  clipboard: ConnectionStyleClipboard,
  target: Connection,
  styles: ProjectConnectionStyles,
  projectRelationshipTypes: readonly ProjectRelationshipType[] = [],
): ConnectionAnnotationPresentationOverride | undefined => {
  const inherited = connectionTypeStyle(target.semantic.typeId, styles, projectRelationshipTypes)
    .annotationPresentation;
  return normalizeConnectionAnnotationPresentationOverride({
    ...(target.annotationPresentation?.placement
      ? { placement: { ...target.annotationPresentation.placement } }
      : {}),
    title: sparseSection(clipboard.annotationAppearance.title, inherited.title),
    body: sparseSection(clipboard.annotationAppearance.body, inherited.body),
    plate: sparseSection(clipboard.annotationAppearance.plate, inherited.plate),
  });
};

/** Rebase a copied resolved appearance onto the target Relationship Type.
 * Only differing appearance values become local overrides; excluded target
 * visual fields are retained byte-for-byte. */
export const pasteConnectionStyleVisual = (
  clipboard: ConnectionStyleClipboard,
  target: Connection,
  styles: ProjectConnectionStyles,
  projectRelationshipTypes: readonly ProjectRelationshipType[] = [],
): ConnectionVisual | undefined => {
  const base = connectionTypeStyle(target.semantic.typeId, styles, projectRelationshipTypes);
  const appearance: NonNullable<ConnectionVisual["appearance"]> = {
    ...(clipboard.appearance.color === base.appearance.color ? {} : { color: clipboard.appearance.color }),
    ...(clipboard.appearance.width === base.appearance.width ? {} : { width: clipboard.appearance.width }),
    ...(clipboard.appearance.opacity === base.appearance.opacity ? {} : { opacity: clipboard.appearance.opacity }),
    ...(clipboard.appearance.curve === base.appearance.curve ? {} : { curve: clipboard.appearance.curve }),
    ...(clipboard.appearance.markerSize === base.appearance.markerSize ? {} : { markerSize: clipboard.appearance.markerSize }),
    ...(clipboard.appearance.markerOffset === base.appearance.markerOffset ? {} : { markerOffset: clipboard.appearance.markerOffset }),
    ...(clipboard.appearance.dashScale === base.appearance.dashScale ? {} : { dashScale: clipboard.appearance.dashScale }),
    ...(clipboard.appearance.patternAmplitude === base.appearance.patternAmplitude ? {} : { patternAmplitude: clipboard.appearance.patternAmplitude }),
  };
  const visual: ConnectionVisual = {
    ...(target.visual?.visible === undefined ? {} : { visible: target.visual.visible }),
    ...(clipboard.geometryId === base.geometryId ? {} : { geometryId: clipboard.geometryId }),
    ...(clipboard.strokePatternId === base.strokePatternId ? {} : { strokePatternId: clipboard.strokePatternId }),
    ...(clipboard.lineCap === base.lineCap ? {} : { lineCap: clipboard.lineCap }),
    ...(clipboard.lineJoin === base.lineJoin ? {} : { lineJoin: clipboard.lineJoin }),
    ...(clipboard.startMarkerId === base.startMarkerId ? {} : { startMarkerId: clipboard.startMarkerId }),
    ...(clipboard.endMarkerId === base.endMarkerId ? {} : { endMarkerId: clipboard.endMarkerId }),
    ...(target.visual?.startAnchorId === undefined ? {} : { startAnchorId: target.visual.startAnchorId }),
    ...(target.visual?.endAnchorId === undefined ? {} : { endAnchorId: target.visual.endAnchorId }),
    ...(target.visual?.label === undefined ? {} : { label: { ...target.visual.label } }),
    ...(Object.keys(appearance).length ? { appearance } : {}),
  };
  return Object.keys(visual).length ? visual : undefined;
};

const semanticColors: Record<KnownConnectionSemanticTypeId, string> = {
  custom: "#55585f",
  adjacency: "#2f6f9f",
  "direct-access": "#087f5b",
  "visual-access": "#7356a8",
  "shared-support": "#9a6700",
  "circulation-flow": "#a23b32",
  separation: "#7c2836",
};

const transformPackStyle = (
  typeId: KnownConnectionSemanticTypeId,
  base: ResolvedConnectionStyle,
  packId: ConnectionStylePackId,
): ResolvedConnectionStyle => {
  const style = cloneResolvedConnectionStyle(base);
  if (packId === "minimal") {
    style.appearance = { ...style.appearance, color: "#60636a", width: Math.max(0.8, style.appearance.width * 0.82), opacity: 0.68, markerSize: 7 };
  } else if (packId === "technical") {
    style.lineCap = "butt";
    style.lineJoin = "miter";
    style.appearance = { ...style.appearance, color: "#344250", width: Math.max(1, style.appearance.width), opacity: 0.88, curve: Math.min(style.appearance.curve, 0.18), dashScale: 0.85 };
  } else if (packId === "presentation") {
    style.appearance = { ...style.appearance, color: semanticColors[typeId], width: style.appearance.width * 1.25, opacity: 0.94, markerSize: style.appearance.markerSize * 1.15 };
  } else if (packId === "monochrome") {
    style.appearance = { ...style.appearance, color: "#24262a", width: style.appearance.width * 1.05, opacity: 0.84 };
  } else {
    style.appearance = { ...style.appearance, color: semanticColors[typeId], width: Math.max(1.75, style.appearance.width * 1.4), opacity: 1, markerSize: Math.max(9, style.appearance.markerSize) };
  }
  return style;
};

export const applyConnectionStylePack = (
  styles: ProjectConnectionStyles,
  packId: ConnectionStylePackId,
): ProjectConnectionStyles => {
  void styles;
  const source = launchDefaults();
  return Object.fromEntries(CONNECTION_SEMANTIC_TYPE_IDS.map((typeId) => [
    typeId,
    transformPackStyle(typeId, source[typeId], packId),
  ])) as ProjectConnectionStyles;
};

export const createDefaultConnectionViewSettings = (): ConnectionViewSettings => ({
  visible: true,
  focusMode: "all",
  visualScaleMode: "screen",
});

export const normalizeConnectionViewSettings = (value: unknown): ConnectionViewSettings => {
  if (!isRecord(value)) return createDefaultConnectionViewSettings();
  return {
    visible: typeof value.visible === "boolean" ? value.visible : true,
    focusMode: oneOf<ConnectionFocusMode>(value.focusMode, ["all", "selected-cell", "selected-connections"], "all"),
    visualScaleMode: oneOf<ConnectionVisualScaleMode>(value.visualScaleMode, ["screen", "canvas"], "screen"),
  };
};
