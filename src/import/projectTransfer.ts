import { buildCurrentProjectSnapshot, download } from "../export/exportService";
import { normalizeUiScale, normalizeWidgetScale } from "../state/uiScale";
import { useLab, type LabSettings } from "../state/store";
import { ensureSpaceCodes } from "../domain/spaceCode";
import type { Camera, SavedCanvasSnapshot, SpaceCell, Theme, ViewMode } from "../types";
import type { Connection } from "../domain/graph/types";
import { normalizeSelectionState, replaceSelectionState } from "../interaction/selection";
import { cloneResourceSettings } from "../resources/resourcePersistence";
import { normalizeOrganismSettings } from "../canvas/organismProductionSettings";
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
import {
  cloneConnections,
  connectionCellIds,
  createConnectionAuthoringState,
} from "../domain/connections/model";
import { retainConnectionsForSpaces } from "../domain/connections/selectors";
import {
  cloneProjectConnectionStyles,
  normalizeConnectionViewSettings,
  normalizeProjectConnectionStyles,
} from "../domain/connections/styles";

const SAVED_VIEWS_KEY = "mooorf.savedViews.v1";

export interface RecoverySnapshot {
  theme: Theme;
  view: ViewMode;
  spaces: SpaceCell[];
  connections: Connection[];
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
  connections: cloneConnections(view.connections ?? []),
  camera: { ...view.camera },
  organism: normalizeOrganismSettings(view.organism),
  annotationDetail: view.annotationDetail ? { ...view.annotationDetail } : undefined,
  cellShadow: view.cellShadow ? { ...view.cellShadow } : undefined,
  resources: view.resources ? cloneResourceSettings(view.resources) : undefined,
  presentationDefaults: view.presentationDefaults
    ? cloneProjectPresentationDefaults(view.presentationDefaults)
    : undefined,
  connectionStyles: view.connectionStyles
    ? cloneProjectConnectionStyles(view.connectionStyles)
    : undefined,
  connectionView: view.connectionView
    ? normalizeConnectionViewSettings(view.connectionView)
    : undefined,
}));

const cloneSettings = (settings: LabSettings): LabSettings => ({
  ...settings,
  organism: normalizeOrganismSettings(settings.organism),
  annotationDetail: { ...settings.annotationDetail },
  cellShadow: { ...settings.cellShadow },
  resources: cloneResourceSettings(settings.resources),
  presentationDefaults: cloneProjectPresentationDefaults(settings.presentationDefaults),
  connectionStyles: cloneProjectConnectionStyles(settings.connectionStyles),
  connectionView: normalizeConnectionViewSettings(settings.connectionView),
});

export const captureRecoverySnapshot = (): RecoverySnapshot => {
  const state = useLab.getState();
  return {
    theme: state.theme,
    view: state.view,
    spaces: cloneSpaces(state.spaces),
    connections: cloneConnections(state.connections),
    camera: { ...state.camera },
    settings: cloneSettings(state.settings),
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
    connections: cloneConnections(snapshot.connections),
    camera: { ...snapshot.camera },
    settings: cloneSettings(snapshot.settings),
    ...normalizeSelectionState({
      selectedId: snapshot.selectedId,
      primarySelectedId: snapshot.primarySelectedId,
      selectedIds: snapshot.selectedIds,
    }, new Set(snapshot.spaces.map((space) => space.id))),
    contextSurface: null,
    contextPoint: null,
    contextTargetId: null,
    selectedConnectionIds: [],
    primarySelectedConnectionId: null,
    connectionAuthoring: createConnectionAuthoringState(),
    transformUndoStack: [],
    transformRedoStack: [],
    savedViews: cloneViews(snapshot.savedViews),
  });
};

const captureRejectedApplyState = () => {
  const state = useLab.getState();
  return {
    selectedConnectionIds: [...state.selectedConnectionIds],
    primarySelectedConnectionId: state.primarySelectedConnectionId,
    connectionAuthoring: {
      ...state.connectionAuthoring,
      priorSelection: state.connectionAuthoring.priorSelection
        ? {
            selectedIds: [...state.connectionAuthoring.priorSelection.selectedIds],
            primarySelectedId: state.connectionAuthoring.priorSelection.primarySelectedId,
          }
        : null,
    },
    transformUndoStack: [...state.transformUndoStack],
    transformRedoStack: [...state.transformRedoStack],
  };
};

const restoreRejectedApply = (
  recovery: RecoverySnapshot,
  rejectedState: ReturnType<typeof captureRejectedApplyState>,
): void => {
  restoreRecoverySnapshot(recovery);
  useLab.setState(rejectedState);
};

export const applyProjectFile = (project: MooorfProjectEnvelope): RecoverySnapshot => {
  const recovery = captureRecoverySnapshot();
  const rejectedState = captureRejectedApplyState();
  try {
    const snapshot = project.snapshot;
    const current = useLab.getState();
    const savedViews = cloneViews(project.savedViews).slice(0, 20);
    persistViews(savedViews);
    useLab.setState({
      theme: snapshot.theme,
      view: "canvas",
      spaces: cloneSpaces(snapshot.spaces),
      connections: cloneConnections(snapshot.connections),
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
        organism: normalizeOrganismSettings({ ...current.settings.organism, ...snapshot.settings.organism }),
        cellShadow: { ...snapshot.settings.cellShadow },
        resources: cloneResourceSettings(snapshot.settings.resources),
        presentationDefaults: cloneProjectPresentationDefaults(snapshot.settings.presentationDefaults),
        connectionStyles: cloneProjectConnectionStyles(snapshot.settings.connectionStyles),
        connectionView: normalizeConnectionViewSettings(snapshot.settings.connectionView),
      },
      selectedConnectionIds: [],
      primarySelectedConnectionId: null,
      connectionAuthoring: createConnectionAuthoringState(),
      transformUndoStack: [],
      transformRedoStack: [],
    });
    return recovery;
  } catch (error) {
    restoreRejectedApply(recovery, rejectedState);
    throw error;
  }
};

export const applyConfigFile = (config: MooorfConfigEnvelope): RecoverySnapshot => {
  const recovery = captureRecoverySnapshot();
  const rejectedState = captureRejectedApplyState();
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
        organism: normalizeOrganismSettings({ ...current.settings.organism, ...config.settings.organism }),
        cellShadow: { ...config.settings.cellShadow },
        resources: cloneResourceSettings(config.settings.resources),
        presentationDefaults: cloneProjectPresentationDefaults(config.settings.presentationDefaults),
        connectionStyles: normalizeProjectConnectionStyles(config.settings.connectionStyles),
        connectionView: normalizeConnectionViewSettings(config.settings.connectionView),
      },
      ...replaceSelectionState(null),
      contextSurface: null,
      contextPoint: null,
      contextTargetId: null,
    });
    return recovery;
  } catch (error) {
    restoreRejectedApply(recovery, rejectedState);
    throw error;
  }
};

export const applySpaceSchedule = (spaces: readonly SpaceCell[]): RecoverySnapshot => {
  const recovery = captureRecoverySnapshot();
  const rejectedState = captureRejectedApplyState();
  try {
    useLab.getState().cancelArrangementPreview();
    const nextSpaces = ensureSpaceCodes(cloneSpaces(spaces));
    useLab.setState({
      spaces: nextSpaces,
      connections: retainConnectionsForSpaces(useLab.getState().connections, connectionCellIds(nextSpaces)),
      ...replaceSelectionState(null),
      contextSurface: null,
      contextPoint: null,
      contextTargetId: null,
      appearancePreview: null,
      appearancePreviewIds: null,
      appearancePreviewTarget: null,
      presentationDefaultsPreview: null,
      membraneRuntimePreview: null,
      visualSettingsPreview: null,
      resourcesPreview: null,
      arrangementPreview: null,
      arrangementPreviewPatternId: null,
      selectedConnectionIds: [],
      primarySelectedConnectionId: null,
      connectionAuthoring: createConnectionAuthoringState(),
      transformUndoStack: [],
      transformRedoStack: [],
    });
    return recovery;
  } catch (error) {
    restoreRejectedApply(recovery, rejectedState);
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
