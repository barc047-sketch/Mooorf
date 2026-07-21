import type {
  Connection,
  ConnectionAnchorId,
  ConnectionGeometryId,
  ConnectionLabelContent,
  ConnectionLabelOffset,
  ConnectionLabelOrientation,
  ConnectionLabelPosition,
  ConnectionLabelStyle,
  ConnectionMarkerId,
  ConnectionStrokePatternId,
  ConnectionVisual,
  KnownConnectionSemanticTypeId,
} from "../graph/types";
import { CONNECTION_SEMANTIC_TYPE_IDS } from "./registry";

export interface ResolvedConnectionAppearance {
  color: string;
  width: number;
  opacity: number;
  curve: number;
  markerSize: number;
  markerOffset: number;
  dashScale: number;
}

export interface ResolvedConnectionStyle {
  visible: boolean;
  geometryId: ConnectionGeometryId;
  strokePatternId: ConnectionStrokePatternId;
  startMarkerId: ConnectionMarkerId;
  endMarkerId: ConnectionMarkerId;
  startAnchorId: ConnectionAnchorId;
  endAnchorId: ConnectionAnchorId;
  label: ConnectionLabelStyle;
  appearance: ResolvedConnectionAppearance;
}

export type ConnectionStylePatch = Partial<Omit<ResolvedConnectionStyle, "label" | "appearance">> & {
  label?: Partial<ConnectionLabelStyle>;
  appearance?: Partial<ResolvedConnectionAppearance>;
};

export type ProjectConnectionStyles = Record<KnownConnectionSemanticTypeId, ResolvedConnectionStyle>;

export type ConnectionFocusMode = "all" | "selected-cell" | "selected-connections";

export interface ConnectionViewSettings {
  visible: boolean;
  focusMode: ConnectionFocusMode;
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
};

const cloneLabel = (label: ConnectionLabelStyle): ConnectionLabelStyle => ({ ...label });

const cloneAppearance = (appearance: ResolvedConnectionAppearance): ResolvedConnectionAppearance => ({ ...appearance });

export const cloneResolvedConnectionStyle = (style: ResolvedConnectionStyle): ResolvedConnectionStyle => ({
  ...style,
  label: cloneLabel(style.label),
  appearance: cloneAppearance(style.appearance),
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
  startMarkerId: patch.startMarkerId ?? "none",
  endMarkerId: patch.endMarkerId ?? "none",
  startAnchorId: patch.startAnchorId ?? "auto",
  endAnchorId: patch.endAnchorId ?? "auto",
  label: { ...HIDDEN_LABEL, ...patch.label },
  appearance: { ...BASE_APPEARANCE, ...patch.appearance },
});

const launchDefaults = (): ProjectConnectionStyles => ({
  custom: makeStyle({ appearance: { width: 1, opacity: 0.76 } }),
  adjacency: makeStyle({ strokePatternId: "dashed", appearance: { width: 1, opacity: 0.76, dashScale: 0.9 } }),
  "direct-access": makeStyle({ endMarkerId: "open-arrow", appearance: { width: 1.75, opacity: 0.9, markerSize: 8.5 } }),
  "visual-access": makeStyle({ geometryId: "curved", strokePatternId: "dotted", appearance: { width: 1, opacity: 0.72, curve: 0.3 } }),
  "shared-support": makeStyle({ strokePatternId: "double", appearance: { width: 1.25, opacity: 0.78 } }),
  "circulation-flow": makeStyle({ geometryId: "curved", endMarkerId: "filled-arrow", appearance: { width: 1.8, opacity: 0.9, curve: 0.2, markerSize: 9 } }),
  separation: makeStyle({ strokePatternId: "dash-dot", appearance: { width: 1.35, opacity: 0.84, dashScale: 1.1 } }),
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
    width: finiteInRange(value.width, fallback.width, 0.25, 32),
    opacity: finiteInRange(value.opacity, fallback.opacity, 0, 1),
    curve: finiteInRange(value.curve, fallback.curve, -2, 2),
    markerSize: finiteInRange(value.markerSize, fallback.markerSize, 2, 64),
    markerOffset: finiteInRange(value.markerOffset, fallback.markerOffset, -64, 64),
    dashScale: finiteInRange(value.dashScale, fallback.dashScale, 0.25, 8),
  };
};

const normalizeResolvedStyle = (value: unknown, fallback: ResolvedConnectionStyle): ResolvedConnectionStyle => {
  if (!isRecord(value)) return cloneResolvedConnectionStyle(fallback);
  return {
    visible: typeof value.visible === "boolean" ? value.visible : fallback.visible,
    geometryId: registryId<ConnectionGeometryId>(value.geometryId, fallback.geometryId),
    strokePatternId: registryId<ConnectionStrokePatternId>(value.strokePatternId, fallback.strokePatternId),
    startMarkerId: registryId<ConnectionMarkerId>(value.startMarkerId, fallback.startMarkerId),
    endMarkerId: registryId<ConnectionMarkerId>(value.endMarkerId, fallback.endMarkerId),
    startAnchorId: registryId<ConnectionAnchorId>(value.startAnchorId, fallback.startAnchorId),
    endAnchorId: registryId<ConnectionAnchorId>(value.endAnchorId, fallback.endAnchorId),
    label: normalizeLabel(value.label, fallback.label),
    appearance: normalizeAppearance(value.appearance, fallback.appearance),
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
  }, current);
  return normalized;
};

const isKnownType = (value: string): value is KnownConnectionSemanticTypeId =>
  CONNECTION_SEMANTIC_TYPE_IDS.includes(value as KnownConnectionSemanticTypeId);

export const connectionTypeStyle = (
  typeId: string,
  styles: ProjectConnectionStyles,
): ResolvedConnectionStyle => cloneResolvedConnectionStyle(isKnownType(typeId) ? styles[typeId] : styles.custom);

const mergeLocalVisual = (base: ResolvedConnectionStyle, visual: ConnectionVisual | undefined): ResolvedConnectionStyle => {
  if (!visual) return cloneResolvedConnectionStyle(base);
  return {
    visible: visual.visible ?? base.visible,
    geometryId: visual.geometryId ?? base.geometryId,
    strokePatternId: visual.strokePatternId ?? base.strokePatternId,
    startMarkerId: visual.startMarkerId ?? base.startMarkerId,
    endMarkerId: visual.endMarkerId ?? base.endMarkerId,
    startAnchorId: visual.startAnchorId ?? base.startAnchorId,
    endAnchorId: visual.endAnchorId ?? base.endAnchorId,
    label: normalizeLabel(visual.label, base.label),
    appearance: normalizeAppearance(visual.appearance, base.appearance),
  };
};

export const resolveConnectionStyle = (
  connection: Connection,
  styles: ProjectConnectionStyles,
): ResolvedConnectionStyle => mergeLocalVisual(connectionTypeStyle(connection.semantic.typeId, styles), connection.visual);

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
});

export const normalizeConnectionViewSettings = (value: unknown): ConnectionViewSettings => {
  if (!isRecord(value)) return createDefaultConnectionViewSettings();
  return {
    visible: typeof value.visible === "boolean" ? value.visible : true,
    focusMode: oneOf<ConnectionFocusMode>(value.focusMode, ["all", "selected-cell", "selected-connections"], "all"),
  };
};
