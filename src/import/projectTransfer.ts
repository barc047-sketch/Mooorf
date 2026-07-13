import { buildCurrentProjectSnapshot, download } from "../export/exportService";
import { normalizeUiScale, normalizeWidgetScale } from "../state/uiScale";
import { useLab, type LabSettings } from "../state/store";
import type { Camera, SavedCanvasSnapshot, SpaceCell, Theme, ViewMode } from "../types";
import { normalizeSelectionState, replaceSelectionState } from "../interaction/selection";
import { cloneResourceSettings } from "../resources/resourcePersistence";
import {
  buildConfigEnvelope,
  buildProjectEnvelope,
  type MooorfConfigEnvelope,
  type MooorfProjectEnvelope,
} from "./projectFiles";
import {
  cloneCellAppearanceOverrides,
  cloneProjectPresentationDefaults,
} from "../domain/presentation/validation";

const SAVED_VIEWS_KEY = "mooorf.savedViews.v1";

export interface RecoverySnapshot {
  theme: Theme;
  view: ViewMode;
  spaces: SpaceCell[];
  camera: Camera;
  settings: LabSettings;
  selectedId: string | null;
  primarySelectedId: string | null;
  selectedIds: string[];
  savedViews: SavedCanvasSnapshot[];
}

const cloneSpaces = (spaces: readonly SpaceCell[]) => spaces.map((space) => ({
  ...space,
  appearance: cloneCellAppearanceOverrides(space.appearance),
}));
const cloneViews = (views: readonly SavedCanvasSnapshot[]) => views.map((view) => ({
  ...view,
  spaces: cloneSpaces(view.spaces),
  camera: { ...view.camera },
  organism: { ...view.organism },
  annotationDetail: view.annotationDetail ? { ...view.annotationDetail } : undefined,
  cellShadow: view.cellShadow ? { ...view.cellShadow } : undefined,
  resources: view.resources ? cloneResourceSettings(view.resources) : undefined,
  presentationDefaults: view.presentationDefaults
    ? cloneProjectPresentationDefaults(view.presentationDefaults)
    : undefined,
}));

export const captureRecoverySnapshot = (): RecoverySnapshot => {
  const state = useLab.getState();
  return {
    theme: state.theme,
    view: state.view,
    spaces: cloneSpaces(state.spaces),
    camera: { ...state.camera },
    settings: { ...state.settings, organism: { ...state.settings.organism }, annotationDetail: { ...state.settings.annotationDetail }, cellShadow: { ...state.settings.cellShadow }, resources: cloneResourceSettings(state.settings.resources), presentationDefaults: cloneProjectPresentationDefaults(state.settings.presentationDefaults) },
    selectedId: state.selectedId,
    primarySelectedId: state.primarySelectedId,
    selectedIds: [...state.selectedIds],
    savedViews: cloneViews(state.savedViews),
  };
};

const persistViews = (views: readonly SavedCanvasSnapshot[]) => {
  try {
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views.slice(0, 20)));
  } catch {
    // In-memory restoration still succeeds when persistence is unavailable.
  }
};

export const restoreRecoverySnapshot = (snapshot: RecoverySnapshot): void => {
  persistViews(snapshot.savedViews);
  useLab.setState({
    theme: snapshot.theme,
    view: snapshot.view,
    spaces: cloneSpaces(snapshot.spaces),
    camera: { ...snapshot.camera },
    settings: { ...snapshot.settings, organism: { ...snapshot.settings.organism }, annotationDetail: { ...snapshot.settings.annotationDetail }, cellShadow: { ...snapshot.settings.cellShadow }, resources: cloneResourceSettings(snapshot.settings.resources), presentationDefaults: cloneProjectPresentationDefaults(snapshot.settings.presentationDefaults) },
    ...normalizeSelectionState({
      selectedId: snapshot.selectedId,
      primarySelectedId: snapshot.primarySelectedId,
      selectedIds: snapshot.selectedIds,
    }, new Set(snapshot.spaces.map((space) => space.id))),
    contextSurface: null,
    contextPoint: null,
    contextTargetId: null,
    savedViews: cloneViews(snapshot.savedViews),
  });
};

export const applyProjectFile = (project: MooorfProjectEnvelope): RecoverySnapshot => {
  const recovery = captureRecoverySnapshot();
  try {
    const snapshot = project.snapshot;
    const current = useLab.getState();
    const savedViews = cloneViews(project.savedViews).slice(0, 20);
    persistViews(savedViews);
    useLab.setState({
      theme: snapshot.theme,
      view: "canvas",
      spaces: cloneSpaces(snapshot.spaces),
      camera: { ...snapshot.camera },
      ...replaceSelectionState(null),
      contextSurface: null,
      contextPoint: null,
      contextTargetId: null,
      savedViews,
      settings: {
        ...current.settings,
        ...snapshot.settings,
        uiScale: normalizeUiScale(snapshot.settings.uiScale),
        widgetScale: normalizeWidgetScale(snapshot.settings.widgetScale),
        annotationDetail: { ...current.settings.annotationDetail, ...snapshot.settings.annotationDetail },
        organism: { ...current.settings.organism, ...snapshot.settings.organism },
        cellShadow: { ...snapshot.settings.cellShadow },
        resources: cloneResourceSettings(snapshot.settings.resources),
        presentationDefaults: cloneProjectPresentationDefaults(snapshot.settings.presentationDefaults),
      },
    });
    return recovery;
  } catch (error) {
    restoreRecoverySnapshot(recovery);
    throw error;
  }
};

export const applyConfigFile = (config: MooorfConfigEnvelope): RecoverySnapshot => {
  const recovery = captureRecoverySnapshot();
  try {
    const current = useLab.getState();
    const layout = config.workspace.spaceLayoutById;
    const { theme, ...importedSettings } = config.settings;
    useLab.setState({
      theme,
      camera: { ...config.workspace.camera },
      spaces: current.spaces.map((space) => layout[space.id] ? { ...space, ...layout[space.id] } : space),
      settings: {
        ...current.settings,
        ...importedSettings,
        uiScale: normalizeUiScale(config.settings.uiScale),
        widgetScale: normalizeWidgetScale(config.settings.widgetScale),
        annotationDetail: { ...current.settings.annotationDetail, ...config.settings.annotationDetail },
        organism: { ...current.settings.organism, ...config.settings.organism },
        cellShadow: { ...config.settings.cellShadow },
        resources: cloneResourceSettings(config.settings.resources),
        presentationDefaults: cloneProjectPresentationDefaults(config.settings.presentationDefaults),
      },
      ...replaceSelectionState(null),
      contextSurface: null,
      contextPoint: null,
      contextTargetId: null,
    });
    return recovery;
  } catch (error) {
    restoreRecoverySnapshot(recovery);
    throw error;
  }
};

export const applySpaceSchedule = (spaces: readonly SpaceCell[]): RecoverySnapshot => {
  const recovery = captureRecoverySnapshot();
  try {
    useLab.setState({
      spaces: cloneSpaces(spaces),
      ...replaceSelectionState(null),
      contextSurface: null,
      contextPoint: null,
      contextTargetId: null,
    });
    return recovery;
  } catch (error) {
    restoreRecoverySnapshot(recovery);
    throw error;
  }
};

export const downloadFullProject = async (title: string): Promise<void> => {
  const snapshot = buildCurrentProjectSnapshot(title);
  const envelope = buildProjectEnvelope(snapshot, useLab.getState().savedViews);
  await download(new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" }), `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled"}.mooorf`);
};

export const downloadConfig = async (title: string): Promise<void> => {
  const envelope = buildConfigEnvelope(buildCurrentProjectSnapshot(title));
  await download(new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" }), `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled"}.mooorf-config.json`);
};
