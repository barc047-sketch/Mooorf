import type { ProjectExportSettings, ProjectExportSnapshot } from "../export/projectSnapshot";
import { PROJECT_SNAPSHOT_SCHEMA_VERSION } from "../export/types";
import { normalizeUiScale, normalizeWidgetScale } from "../state/uiScale";
import type { Camera, SavedCanvasSnapshot, SpaceCell, Theme } from "../types";
import { cloneResourceSettings, normalizeResourceSettings } from "../resources/resourcePersistence";
import { normalizeCellShadow } from "../canvas/cellShadow";
import {
  normalizeLabelColourMode,
  normalizeLabelCustomColour,
  normalizeLabelScaleMode,
  normalizeLegacyCellShadow,
  normalizePerformanceQuality,
} from "../state/visualSettings";
import type { ProjectPresentationDefaults } from "../domain/presentation/types";
import {
  cloneProjectPresentationDefaults,
  normalizeCellAppearanceOverrides,
  normalizeProjectPresentationDefaults,
} from "../domain/presentation/validation";

export const PROJECT_FILE_VERSION = 1;
export const CONFIG_FILE_VERSION = 1;
export const APP_VERSION = "0.1.0";
export const MAX_PROJECT_SPACES = 10_000;

export interface MooorfProjectEnvelope {
  kind: "mooorf-project";
  schemaVersion: 1;
  savedAt: string;
  appVersion: string;
  project: { title: string };
  snapshot: ProjectExportSnapshot;
  savedViews: SavedCanvasSnapshot[];
}

export interface MooorfConfigEnvelope {
  kind: "mooorf-config";
  schemaVersion: 1;
  savedAt: string;
  settings: ProjectExportSettings & { theme: Theme };
  workspace: {
    camera: Camera;
    spaceLayoutById: Record<string, { x: number; y: number }>;
  };
}

export interface ConfigChangePreview {
  matchingLayoutIds: number;
  unmatchedLayoutIds: number;
  settingsChanged: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const assertNoUnsafeKeys = (value: unknown): void => {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new Error(`Unsafe key "${key}" is not allowed.`);
    }
    assertNoUnsafeKeys((value as Record<string, unknown>)[key]);
  }
};

const finite = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return value;
};

const clean = (value: unknown, label: string, max = 240): string => {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  return value.trim().slice(0, max);
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], label: string): T => {
  if (typeof value !== "string" || !allowed.includes(value as T)) throw new Error(`${label} is invalid.`);
  return value as T;
};

const validateCamera = (value: unknown): Camera => {
  if (!isRecord(value)) throw new Error("Camera is missing or invalid.");
  return {
    x: finite(value.x, "Camera x"),
    y: finite(value.y, "Camera y"),
    zoom: finite(value.zoom, "Camera zoom"),
  };
};

const validateSpace = (
  value: unknown,
  index: number,
  presentationDefaults: ProjectPresentationDefaults
): SpaceCell => {
  if (!isRecord(value)) throw new Error(`Space row ${index + 1} is invalid.`);
  const privacy = value.privacy;
  if (privacy !== "public" && privacy !== "shared" && privacy !== "private") {
    throw new Error(`Space row ${index + 1} has invalid privacy.`);
  }
  const kind = value.kind === undefined || value.kind === "space" ? "space" : value.kind;
  if (kind !== "space" && kind !== "void") throw new Error(`Space row ${index + 1} has invalid kind.`);
  const area = finite(value.area, `Space row ${index + 1} area`);
  if (area <= 0) throw new Error(`Space row ${index + 1} area must be positive.`);
  return {
    id: clean(value.id, `Space row ${index + 1} id`, 160),
    name: clean(value.name, `Space row ${index + 1} name`),
    body: value.body === undefined ? "" : clean(value.body, `Space row ${index + 1} body`, 1200),
    kind,
    area,
    category: clean(value.category, `Space row ${index + 1} category`),
    privacy,
    color: typeof value.color === "string" ? value.color.trim().slice(0, 64) : "",
    x: finite(value.x, `Space row ${index + 1} x`),
    y: finite(value.y, `Space row ${index + 1} y`),
    appearance: normalizeCellAppearanceOverrides(value.appearance, presentationDefaults),
  };
};

const validateSettings = (value: unknown): ProjectExportSettings => {
  if (!isRecord(value)) throw new Error("Project settings are missing or invalid.");
  if (!isRecord(value.annotationDetail) || !isRecord(value.organism)) {
    throw new Error("Project settings are incomplete.");
  }
  if (typeof value.blobOn !== "boolean" || typeof value.showGrid !== "boolean") {
    throw new Error("Project display settings are invalid.");
  }
  for (const [key, setting] of Object.entries(value.organism)) {
    if (typeof setting === "number" && Number.isFinite(setting)) continue;
    if (typeof setting === "boolean") continue;
    throw new Error(`Organism setting "${key}" is invalid.`);
  }
  const annotation = value.annotationDetail;
  if (
    typeof annotation.textScale !== "number" || !Number.isFinite(annotation.textScale) ||
    typeof annotation.textShadow !== "boolean" || typeof annotation.showName !== "boolean" ||
    typeof annotation.showArea !== "boolean" || typeof annotation.showCategory !== "boolean" ||
    typeof annotation.boundingBox !== "boolean"
  ) throw new Error("Annotation settings are invalid.");
  const rendererMode = oneOf(value.rendererMode, ["organism", "classic"] as const, "Renderer mode");
  const organism = { ...(value.organism as unknown as ProjectExportSettings["organism"]) };
  const resources = normalizeResourceSettings(value.resources, {
    showGrid: value.showGrid === true,
    nucleusPaletteId: typeof value.nucleusPaletteId === "string" ? value.nucleusPaletteId : "editorial-aurora",
    organismPaletteId: typeof value.organismPaletteId === "string" ? value.organismPaletteId : "mode",
  });
  const presentationDefaults = normalizeProjectPresentationDefaults(value.presentationDefaults, {
    blobOn: value.blobOn,
    organism,
    resources,
    annotationDetail: value.annotationDetail as unknown as ProjectExportSettings["annotationDetail"],
    labelColourMode: value.labelColourMode as ProjectExportSettings["labelColourMode"],
    labelCustomColour: value.labelCustomColour as string,
  });
  return {
    ...(value as unknown as ProjectExportSettings),
    rendererMode,
    morphMode: oneOf(value.morphMode, ["cellular-reverse", "plain-black", "plain-white", "graphite", "wine", "auto"] as const, "Morph mode"),
    attachMode: oneOf(value.attachMode, ["tight", "soft", "long", "extreme"] as const, "Attachment mode"),
    paletteMode: oneOf(value.paletteMode, ["core", "surreal", "architecture", "auto"] as const, "Palette mode"),
    colorSource: value.colorSource === "privacy" ? "privacy" : "category",
    layoutPreset: oneOf(value.layoutPreset, ["organic", "random", "core", "colony", "division", "tendril", "orbit", "asymmetry"] as const, "Layout preset"),
    annotationMode: oneOf(value.annotationMode, ["editorial", "pill", "technical", "hidden"] as const, "Annotation mode"),
    mergeDistance: finite(value.mergeDistance, "Merge distance"),
    uiScale: normalizeUiScale(value.uiScale),
    widgetScale: normalizeWidgetScale(value.widgetScale),
    annotationDetail: {
      ...(value.annotationDetail as unknown as ProjectExportSettings["annotationDetail"]),
      position: oneOf(annotation.position, ["auto", "center", "above", "below"] as const, "Label position"),
    },
    organism,
    resources,
    labelScaleMode: normalizeLabelScaleMode(value.labelScaleMode, rendererMode),
    labelColourMode: normalizeLabelColourMode(value.labelColourMode),
    labelCustomColour: normalizeLabelCustomColour(value.labelCustomColour),
    cellShadow: value.cellShadow && isRecord(value.cellShadow)
      ? normalizeCellShadow(value.cellShadow)
      : normalizeLegacyCellShadow(undefined, rendererMode),
    performanceQuality: normalizePerformanceQuality(value.performanceQuality),
    presentationDefaults,
  };
};

const validateSnapshot = (value: unknown): ProjectExportSnapshot => {
  if (!isRecord(value)) throw new Error("Project snapshot is missing.");
  if (value.schemaVersion !== PROJECT_SNAPSHOT_SCHEMA_VERSION) {
    throw new Error("Project snapshot schema is unsupported.");
  }
  if (!Array.isArray(value.spaces) || value.spaces.length > MAX_PROJECT_SPACES) {
    throw new Error(`Project spaces must be an array with at most ${MAX_PROJECT_SPACES} rows.`);
  }
  if (!isRecord(value.project)) throw new Error("Project metadata is missing.");
  const theme = value.theme;
  if (theme !== "day" && theme !== "night") throw new Error("Project theme is invalid.");
  const settings = validateSettings(value.settings);
  const spaces = value.spaces.map((space, index) => validateSpace(space, index, settings.presentationDefaults));
  return {
    schemaVersion: PROJECT_SNAPSHOT_SCHEMA_VERSION,
    exportedAt: clean(value.exportedAt, "Exported date", 80),
    project: { title: clean(value.project.title, "Project title") },
    spaces,
    camera: validateCamera(value.camera),
    theme,
    settings,
    summary: isRecord(value.summary)
      ? {
          spaceCount: spaces.length,
          voidCount: spaces.filter((space) => space.kind === "void").length,
          programmedAreaM2: spaces.reduce((sum, space) => sum + (space.kind === "void" ? 0 : space.area), 0),
        }
      : {
          spaceCount: spaces.length,
          voidCount: spaces.filter((space) => space.kind === "void").length,
          programmedAreaM2: spaces.reduce((sum, space) => sum + (space.kind === "void" ? 0 : space.area), 0),
        },
  };
};

const validateSavedView = (value: unknown, index: number): SavedCanvasSnapshot => {
  if (!isRecord(value) || !Array.isArray(value.spaces) || !isRecord(value.organism)) {
    throw new Error(`Saved view ${index + 1} is invalid.`);
  }
  const theme = value.theme;
  const rendererMode = value.rendererMode;
  if ((theme !== "day" && theme !== "night") || (rendererMode !== "organism" && rendererMode !== "classic")) {
    throw new Error(`Saved view ${index + 1} has invalid display settings.`);
  }
  const resources = normalizeResourceSettings(value.resources, {
    showGrid: value.showGrid === true,
    nucleusPaletteId: typeof value.nucleusPaletteId === "string" ? value.nucleusPaletteId : "editorial-aurora",
    organismPaletteId: typeof value.organismPaletteId === "string" ? value.organismPaletteId : "mode",
  });
  const organism = { ...(value.organism as unknown as SavedCanvasSnapshot["organism"]) };
  const presentationDefaults = normalizeProjectPresentationDefaults(value.presentationDefaults, {
    blobOn: typeof value.blobOn === "boolean" ? value.blobOn : true,
    organism,
    resources,
    annotationDetail: value.annotationDetail as SavedCanvasSnapshot["annotationDetail"],
    labelColourMode: value.labelColourMode as SavedCanvasSnapshot["labelColourMode"],
    labelCustomColour: value.labelCustomColour as string,
  });
  return {
    ...(value as unknown as SavedCanvasSnapshot),
    id: clean(value.id, `Saved view ${index + 1} id`, 160),
    name: clean(value.name, `Saved view ${index + 1} name`),
    createdAt: finite(value.createdAt, `Saved view ${index + 1} createdAt`),
    spaces: value.spaces.map((space, spaceIndex) => validateSpace(space, spaceIndex, presentationDefaults)),
    camera: validateCamera(value.camera),
    theme,
    rendererMode,
    uiScale: normalizeUiScale(value.uiScale),
    widgetScale: normalizeWidgetScale(value.widgetScale),
    colorSource: value.colorSource === "privacy" ? "privacy" : "category",
    organism,
    labelScaleMode: normalizeLabelScaleMode(value.labelScaleMode, rendererMode),
    labelColourMode: normalizeLabelColourMode(value.labelColourMode),
    labelCustomColour: normalizeLabelCustomColour(value.labelCustomColour),
    cellShadow: value.cellShadow && isRecord(value.cellShadow)
      ? normalizeCellShadow(value.cellShadow)
      : normalizeLegacyCellShadow(undefined, rendererMode),
    performanceQuality: normalizePerformanceQuality(value.performanceQuality),
    resources,
    presentationDefaults,
  };
};

const parseJson = (text: string): unknown => {
  try {
    const value: unknown = JSON.parse(text);
    assertNoUnsafeKeys(value);
    return value;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unsafe")) throw error;
    throw new Error("Malformed JSON file.");
  }
};

export const buildProjectEnvelope = (
  snapshot: ProjectExportSnapshot,
  savedViews: SavedCanvasSnapshot[],
  now = new Date()
): MooorfProjectEnvelope => ({
  kind: "mooorf-project",
  schemaVersion: PROJECT_FILE_VERSION,
  savedAt: now.toISOString(),
  appVersion: APP_VERSION,
  project: { ...snapshot.project },
  snapshot: {
    ...snapshot,
    spaces: snapshot.spaces.map((space) => ({
      ...space,
      appearance: normalizeCellAppearanceOverrides(space.appearance, snapshot.settings.presentationDefaults),
    })),
    camera: { ...snapshot.camera },
    settings: {
      ...snapshot.settings,
      annotationDetail: { ...snapshot.settings.annotationDetail },
      organism: { ...snapshot.settings.organism },
      resources: cloneResourceSettings(snapshot.settings.resources),
      presentationDefaults: cloneProjectPresentationDefaults(snapshot.settings.presentationDefaults),
    },
  },
  savedViews: savedViews.map((view) => {
    const resources = normalizeResourceSettings(view.resources, {
      showGrid: view.showGrid === true,
      nucleusPaletteId: view.nucleusPaletteId ?? "editorial-aurora",
      organismPaletteId: view.organismPaletteId ?? "mode",
    });
    const presentationDefaults = normalizeProjectPresentationDefaults(view.presentationDefaults, {
      blobOn: view.blobOn ?? true,
      organism: view.organism,
      resources,
      annotationDetail: view.annotationDetail,
      labelColourMode: view.labelColourMode,
      labelCustomColour: view.labelCustomColour,
    });
    return {
      ...view,
      spaces: view.spaces.map((space) => ({
        ...space,
        appearance: normalizeCellAppearanceOverrides(space.appearance, presentationDefaults),
      })),
      camera: { ...view.camera },
      organism: { ...view.organism },
      resources,
      presentationDefaults,
    };
  }),
});

export const parseProjectEnvelope = (text: string): MooorfProjectEnvelope => {
  const value = parseJson(text);
  if (!isRecord(value)) throw new Error("Project JSON root must be an object.");
  if (!("kind" in value) && "spaces" in value && "settings" in value) {
    const snapshot = validateSnapshot(value);
    return buildProjectEnvelope(snapshot, [], new Date(snapshot.exportedAt));
  }
  if (value.kind !== "mooorf-project") throw new Error("Invalid project kind.");
  if (value.schemaVersion === undefined) throw new Error("Project schemaVersion is missing.");
  if (typeof value.schemaVersion === "number" && value.schemaVersion > PROJECT_FILE_VERSION) {
    throw new Error("Future project schema versions are not supported.");
  }
  if (value.schemaVersion !== PROJECT_FILE_VERSION) throw new Error("Project schemaVersion is invalid.");
  const snapshot = validateSnapshot(value.snapshot);
  const rawViews = Array.isArray(value.savedViews) ? value.savedViews : [];
  if (rawViews.length > 20) throw new Error("A project can contain at most 20 saved views.");
  return {
    kind: "mooorf-project",
    schemaVersion: PROJECT_FILE_VERSION,
    savedAt: typeof value.savedAt === "string" ? value.savedAt : snapshot.exportedAt,
    appVersion: typeof value.appVersion === "string" ? value.appVersion : APP_VERSION,
    project: { ...snapshot.project },
    snapshot,
    savedViews: rawViews.map(validateSavedView),
  };
};

export const buildConfigEnvelope = (
  snapshot: ProjectExportSnapshot,
  now = new Date()
): MooorfConfigEnvelope => ({
  kind: "mooorf-config",
  schemaVersion: CONFIG_FILE_VERSION,
  savedAt: now.toISOString(),
  settings: {
    ...snapshot.settings,
    theme: snapshot.theme,
    annotationDetail: { ...snapshot.settings.annotationDetail },
    organism: { ...snapshot.settings.organism },
    resources: cloneResourceSettings(snapshot.settings.resources),
    presentationDefaults: cloneProjectPresentationDefaults(snapshot.settings.presentationDefaults),
  },
  workspace: {
    camera: { ...snapshot.camera },
    spaceLayoutById: Object.fromEntries(snapshot.spaces.map((space) => [space.id, { x: space.x, y: space.y }])),
  },
});

export const parseConfigEnvelope = (text: string): MooorfConfigEnvelope => {
  const value = parseJson(text);
  if (!isRecord(value) || value.kind !== "mooorf-config") throw new Error("Invalid configuration kind.");
  if (value.schemaVersion === undefined) throw new Error("Configuration schemaVersion is missing.");
  if (typeof value.schemaVersion === "number" && value.schemaVersion > CONFIG_FILE_VERSION) {
    throw new Error("Future configuration schema versions are not supported.");
  }
  if (value.schemaVersion !== CONFIG_FILE_VERSION || !isRecord(value.settings) || !isRecord(value.workspace)) {
    throw new Error("Configuration schema is invalid.");
  }
  const theme = value.settings.theme === "night" ? "night" : "day";
  const settings = validateSettings(value.settings);
  const rawLayout = isRecord(value.workspace.spaceLayoutById) ? value.workspace.spaceLayoutById : {};
  const spaceLayoutById: Record<string, { x: number; y: number }> = {};
  for (const [id, point] of Object.entries(rawLayout)) {
    if (!isRecord(point)) continue;
    const x = typeof point.x === "number" && Number.isFinite(point.x) ? point.x : null;
    const y = typeof point.y === "number" && Number.isFinite(point.y) ? point.y : null;
    if (x !== null && y !== null) spaceLayoutById[id.slice(0, 160)] = { x, y };
  }
  const rawCamera = isRecord(value.workspace.camera) ? value.workspace.camera : {};
  const camera = {
    x: typeof rawCamera.x === "number" && Number.isFinite(rawCamera.x) ? rawCamera.x : 0,
    y: typeof rawCamera.y === "number" && Number.isFinite(rawCamera.y) ? rawCamera.y : 0,
    zoom: typeof rawCamera.zoom === "number" && Number.isFinite(rawCamera.zoom) && rawCamera.zoom > 0 ? rawCamera.zoom : 1,
  };
  return { kind: "mooorf-config", schemaVersion: CONFIG_FILE_VERSION, savedAt: typeof value.savedAt === "string" ? value.savedAt : new Date(0).toISOString(), settings: { ...settings, theme }, workspace: { camera, spaceLayoutById } };
};

export const previewConfigChanges = (
  config: MooorfConfigEnvelope,
  spaces: readonly SpaceCell[]
): ConfigChangePreview => {
  const ids = new Set(spaces.map((space) => space.id));
  const layoutIds = Object.keys(config.workspace.spaceLayoutById);
  return {
    matchingLayoutIds: layoutIds.filter((id) => ids.has(id)).length,
    unmatchedLayoutIds: layoutIds.filter((id) => !ids.has(id)).length,
    settingsChanged: ["renderer", "theme", "palette", "layout", "annotation", "grid", "interface scale", "widget scale", "camera"],
  };
};
