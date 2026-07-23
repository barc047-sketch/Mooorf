import type {
  Connection,
  ConnectionAnnotationBody,
  ConnectionAnnotationDefaults,
  ConnectionAnnotationOverride,
  ConnectionAnnotationPresentationOverride,
  ConnectionAnnotationTitle,
  ResolvedConnectionAnnotation,
  ResolvedConnectionAnnotationPresentation,
} from "../graph/types";

export interface ConnectionAnnotationRelationshipType {
  name: string;
  annotationDefaults: ConnectionAnnotationDefaults;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cleanText = (value: unknown, max: number): string =>
  typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim().slice(0, max) : "";

const hiddenTitle = (): ConnectionAnnotationTitle => ({ source: "hidden" });
const hiddenBody = (): ConnectionAnnotationBody => ({ source: "hidden" });

const normalizeTitle = (value: unknown, fallback: ConnectionAnnotationTitle | undefined): ConnectionAnnotationTitle | undefined => {
  if (!isRecord(value)) return fallback;
  if (value.source === "relationship-type") return { source: "relationship-type" };
  if (value.source !== "custom") return value.source === "hidden" ? hiddenTitle() : fallback;
  const text = cleanText(value.text, 160);
  return text ? { source: "custom", text } : hiddenTitle();
};

const normalizeBody = (value: unknown, fallback: ConnectionAnnotationBody | undefined): ConnectionAnnotationBody | undefined => {
  if (!isRecord(value)) return fallback;
  if (value.source !== "custom") return value.source === "hidden" ? hiddenBody() : fallback;
  const text = cleanText(value.text, 1_200);
  return text ? { source: "custom", text } : hiddenBody();
};

export const createHiddenConnectionAnnotationDefaults = (): ConnectionAnnotationDefaults => ({
  title: hiddenTitle(),
  body: hiddenBody(),
});

export const normalizeConnectionAnnotationDefaults = (value: unknown): ConnectionAnnotationDefaults => {
  const hidden = createHiddenConnectionAnnotationDefaults();
  if (!isRecord(value)) return hidden;
  return {
    title: normalizeTitle(value.title, hidden.title)!,
    body: normalizeBody(value.body, hidden.body)!,
  };
};

export const normalizeConnectionAnnotationOverride = (value: unknown): ConnectionAnnotationOverride | undefined => {
  if (!isRecord(value)) return undefined;
  const title = normalizeTitle(value.title, undefined);
  const body = normalizeBody(value.body, undefined);
  return title || body ? { ...(title ? { title } : {}), ...(body ? { body } : {}) } : undefined;
};

export const cloneConnectionAnnotationOverride = (
  value: ConnectionAnnotationOverride | undefined,
): ConnectionAnnotationOverride | undefined => value && {
  ...(value.title ? { title: { ...value.title } } : {}),
  ...(value.body ? { body: { ...value.body } } : {}),
};

const finiteInRange = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number => typeof value === "number" && Number.isFinite(value)
  ? Math.min(maximum, Math.max(minimum, value))
  : fallback;

const optionalFiniteInRange = (
  value: unknown,
  minimum: number,
  maximum: number,
): number | undefined => typeof value === "number" && Number.isFinite(value)
  ? Math.min(maximum, Math.max(minimum, value))
  : undefined;

const normalizedWeight = (value: unknown, fallback: number): number => {
  const bounded = finiteInRange(value, fallback, 300, 800);
  return Math.round(bounded / 100) * 100;
};

const optionalWeight = (value: unknown): number | undefined => {
  const bounded = optionalFiniteInRange(value, 300, 800);
  return bounded === undefined ? undefined : Math.round(bounded / 100) * 100;
};

const normalizedColor = (value: unknown, fallback: string): string => {
  if (value === "auto") return "auto";
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim()
    : fallback;
};

const optionalColor = (value: unknown): string | undefined => {
  if (value === "auto") return "auto";
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim()
    : undefined;
};

export const createDefaultConnectionAnnotationPresentation = (): ResolvedConnectionAnnotationPresentation => ({
  title: { fontSize: 12, fontWeight: 600, color: "auto", opacity: 1 },
  body: { fontSize: 10.5, fontWeight: 400, color: "auto", opacity: 0.86, lineHeight: 13.2 },
  placement: { pathPosition: 0.5, side: "auto", offset: 12, alignment: "center", maxWidth: 220 },
  plate: { backgroundColor: "auto", backgroundOpacity: 0.9, cornerRadius: 5, paddingX: 8, paddingY: 7 },
});

export const normalizeConnectionAnnotationPresentation = (
  value: unknown,
  fallback: ResolvedConnectionAnnotationPresentation = createDefaultConnectionAnnotationPresentation(),
): ResolvedConnectionAnnotationPresentation => {
  const input = isRecord(value) ? value : {};
  const title = isRecord(input.title) ? input.title : {};
  const body = isRecord(input.body) ? input.body : {};
  const placement = isRecord(input.placement) ? input.placement : {};
  const plate = isRecord(input.plate) ? input.plate : {};
  return {
    title: {
      fontSize: finiteInRange(title.fontSize, fallback.title.fontSize, 9, 28),
      fontWeight: normalizedWeight(title.fontWeight, fallback.title.fontWeight),
      color: normalizedColor(title.color, fallback.title.color),
      opacity: finiteInRange(title.opacity, fallback.title.opacity, 0, 1),
    },
    body: {
      fontSize: finiteInRange(body.fontSize, fallback.body.fontSize, 8, 22),
      fontWeight: normalizedWeight(body.fontWeight, fallback.body.fontWeight),
      color: normalizedColor(body.color, fallback.body.color),
      opacity: finiteInRange(body.opacity, fallback.body.opacity, 0, 1),
      lineHeight: finiteInRange(body.lineHeight, fallback.body.lineHeight, 8, 40),
    },
    placement: {
      pathPosition: finiteInRange(placement.pathPosition, fallback.placement.pathPosition, 0, 1),
      side: placement.side === "a" || placement.side === "b" || placement.side === "auto"
        ? placement.side
        : fallback.placement.side,
      offset: finiteInRange(placement.offset, fallback.placement.offset, 0, 120),
      alignment: placement.alignment === "left" || placement.alignment === "right" || placement.alignment === "center"
        ? placement.alignment
        : fallback.placement.alignment,
      maxWidth: finiteInRange(placement.maxWidth, fallback.placement.maxWidth, 100, 360),
    },
    plate: {
      backgroundColor: normalizedColor(plate.backgroundColor, fallback.plate.backgroundColor),
      backgroundOpacity: finiteInRange(plate.backgroundOpacity, fallback.plate.backgroundOpacity, 0, 1),
      cornerRadius: finiteInRange(plate.cornerRadius, fallback.plate.cornerRadius, 0, 24),
      paddingX: finiteInRange(plate.paddingX, fallback.plate.paddingX, 0, 24),
      paddingY: finiteInRange(plate.paddingY, fallback.plate.paddingY, 0, 24),
    },
  };
};

export const normalizeConnectionAnnotationPresentationOverride = (
  value: unknown,
): ConnectionAnnotationPresentationOverride | undefined => {
  if (!isRecord(value)) return undefined;
  const titleSource = isRecord(value.title) ? value.title : null;
  const bodySource = isRecord(value.body) ? value.body : null;
  const placementSource = isRecord(value.placement) ? value.placement : null;
  const plateSource = isRecord(value.plate) ? value.plate : null;
  const title = titleSource ? {
    ...(optionalFiniteInRange(titleSource.fontSize, 9, 28) === undefined ? {} : { fontSize: optionalFiniteInRange(titleSource.fontSize, 9, 28) }),
    ...(optionalWeight(titleSource.fontWeight) === undefined ? {} : { fontWeight: optionalWeight(titleSource.fontWeight) }),
    ...(optionalColor(titleSource.color) === undefined ? {} : { color: optionalColor(titleSource.color) }),
    ...(optionalFiniteInRange(titleSource.opacity, 0, 1) === undefined ? {} : { opacity: optionalFiniteInRange(titleSource.opacity, 0, 1) }),
  } : undefined;
  const body = bodySource ? {
    ...(optionalFiniteInRange(bodySource.fontSize, 8, 22) === undefined ? {} : { fontSize: optionalFiniteInRange(bodySource.fontSize, 8, 22) }),
    ...(optionalWeight(bodySource.fontWeight) === undefined ? {} : { fontWeight: optionalWeight(bodySource.fontWeight) }),
    ...(optionalColor(bodySource.color) === undefined ? {} : { color: optionalColor(bodySource.color) }),
    ...(optionalFiniteInRange(bodySource.opacity, 0, 1) === undefined ? {} : { opacity: optionalFiniteInRange(bodySource.opacity, 0, 1) }),
    ...(optionalFiniteInRange(bodySource.lineHeight, 8, 40) === undefined ? {} : { lineHeight: optionalFiniteInRange(bodySource.lineHeight, 8, 40) }),
  } : undefined;
  const placement = placementSource ? {
    ...(optionalFiniteInRange(placementSource.pathPosition, 0, 1) === undefined ? {} : { pathPosition: optionalFiniteInRange(placementSource.pathPosition, 0, 1) }),
    ...(placementSource.side === "auto" || placementSource.side === "a" || placementSource.side === "b"
      ? { side: placementSource.side as "auto" | "a" | "b" }
      : {}),
    ...(optionalFiniteInRange(placementSource.offset, 0, 120) === undefined ? {} : { offset: optionalFiniteInRange(placementSource.offset, 0, 120) }),
    ...(placementSource.alignment === "left" || placementSource.alignment === "center" || placementSource.alignment === "right"
      ? { alignment: placementSource.alignment as "left" | "center" | "right" }
      : {}),
    ...(optionalFiniteInRange(placementSource.maxWidth, 100, 360) === undefined ? {} : { maxWidth: optionalFiniteInRange(placementSource.maxWidth, 100, 360) }),
  } : undefined;
  const plate = plateSource ? {
    ...(optionalColor(plateSource.backgroundColor) === undefined ? {} : { backgroundColor: optionalColor(plateSource.backgroundColor) }),
    ...(optionalFiniteInRange(plateSource.backgroundOpacity, 0, 1) === undefined ? {} : { backgroundOpacity: optionalFiniteInRange(plateSource.backgroundOpacity, 0, 1) }),
    ...(optionalFiniteInRange(plateSource.cornerRadius, 0, 24) === undefined ? {} : { cornerRadius: optionalFiniteInRange(plateSource.cornerRadius, 0, 24) }),
    ...(optionalFiniteInRange(plateSource.paddingX, 0, 24) === undefined ? {} : { paddingX: optionalFiniteInRange(plateSource.paddingX, 0, 24) }),
    ...(optionalFiniteInRange(plateSource.paddingY, 0, 24) === undefined ? {} : { paddingY: optionalFiniteInRange(plateSource.paddingY, 0, 24) }),
  } : undefined;
  const compact: ConnectionAnnotationPresentationOverride = {
    ...(title && Object.keys(title).length ? { title } : {}),
    ...(body && Object.keys(body).length ? { body } : {}),
    ...(placement && Object.keys(placement).length ? { placement } : {}),
    ...(plate && Object.keys(plate).length ? { plate } : {}),
  };
  return Object.keys(compact).length ? compact : undefined;
};

export const cloneConnectionAnnotationPresentationOverride = (
  value: ConnectionAnnotationPresentationOverride | undefined,
): ConnectionAnnotationPresentationOverride | undefined => value && {
  ...(value.title ? { title: { ...value.title } } : {}),
  ...(value.body ? { body: { ...value.body } } : {}),
  ...(value.placement ? { placement: { ...value.placement } } : {}),
  ...(value.plate ? { plate: { ...value.plate } } : {}),
};

export const mergeConnectionAnnotationPresentationOverride = (
  current: ConnectionAnnotationPresentationOverride | undefined,
  patch: ConnectionAnnotationPresentationOverride,
): ConnectionAnnotationPresentationOverride | undefined => normalizeConnectionAnnotationPresentationOverride({
  ...current,
  ...patch,
  title: { ...current?.title, ...patch.title },
  body: { ...current?.body, ...patch.body },
  placement: { ...current?.placement, ...patch.placement },
  plate: { ...current?.plate, ...patch.plate },
});

export const clearConnectionAnnotationPlacementOverrides = (
  value: ConnectionAnnotationPresentationOverride | undefined,
): ConnectionAnnotationPresentationOverride | undefined => normalizeConnectionAnnotationPresentationOverride({
  ...(value?.title ? { title: value.title } : {}),
  ...(value?.body ? { body: value.body } : {}),
});

export const resolveConnectionAnnotationPresentation = (
  relationshipTypeDefaults: ResolvedConnectionAnnotationPresentation | undefined,
  connectionOverride: ConnectionAnnotationPresentationOverride | undefined,
): ResolvedConnectionAnnotationPresentation => {
  const defaults = normalizeConnectionAnnotationPresentation(relationshipTypeDefaults);
  const override = normalizeConnectionAnnotationPresentationOverride(connectionOverride);
  return normalizeConnectionAnnotationPresentation({
    title: { ...defaults.title, ...override?.title },
    body: { ...defaults.body, ...override?.body },
    placement: { ...defaults.placement, ...override?.placement },
    plate: { ...defaults.plate, ...override?.plate },
  }, defaults);
};

/** Future UI resets by replacing a local override with this value; no resolved state is persisted. */
export const clearConnectionAnnotationOverride = (): undefined => undefined;

export const resolveConnectionAnnotation = (
  connection: Connection,
  relationshipType: ConnectionAnnotationRelationshipType | null | undefined,
): ResolvedConnectionAnnotation => {
  const fallback = createHiddenConnectionAnnotationDefaults();
  const inherited = normalizeConnectionAnnotationDefaults(relationshipType?.annotationDefaults ?? fallback);
  const override = normalizeConnectionAnnotationOverride(connection.annotation);
  const title = override?.title ?? inherited.title;
  const body = override?.body ?? inherited.body;
  const relationshipTypeName = cleanText(relationshipType?.name, 120) || "Custom";
  const titleText = title.source === "relationship-type"
    ? relationshipTypeName
    : title.source === "custom" ? title.text ?? "" : "";
  const bodyText = body.source === "custom" ? body.text ?? "" : "";
  return {
    title: { source: title.source, text: titleText, visible: Boolean(titleText) },
    body: { source: body.source, text: bodyText, visible: Boolean(bodyText) },
  };
};
