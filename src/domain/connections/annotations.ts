import type {
  Connection,
  ConnectionAnnotationBody,
  ConnectionAnnotationDefaults,
  ConnectionAnnotationOverride,
  ConnectionAnnotationTitle,
  ResolvedConnectionAnnotation,
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
