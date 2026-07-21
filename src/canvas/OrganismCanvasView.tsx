import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from "react";
import { useLab } from "../state/store";
import { clamp } from "../lib/geometry";
import {
  getAreaRange,
  getNucleusColor,
  getOrganismPalette,
  hexToRgb01,
} from "../design/colorMapping";
import {
  type LabTheme,
  MAX_NUCLEI,
  type RGB,
} from "../experiments/organism-lab/organism-types";
import {
  effectiveField,
  styleColors,
} from "../experiments/organism-lab/organism-controls";
import {
  createOrganismRenderer,
  type OrganismRenderFrame,
  type OrganismRenderer,
} from "../experiments/organism-lab/organism-shader";
import {
  advanceMotion,
  createMotionState,
  dragDeltaWorldToStore,
  hitTestNuclei,
  motionStateForRuntime,
  resetMotionState,
  screenToWorld,
  spacesToNuclei,
  type DragPosition,
  type ProductionNucleus,
} from "./organismAdapter";
import { resolveMembraneSamplingScale, resolveOrganism } from "./organismProductionSettings";
import {
  CELL_DRAG_THRESHOLD_PX,
  createCellActivationState,
  isInlineEditorCommitPointer,
  registerCellActivation,
  resetCellActivation,
} from "./cellActivation";
import type { SpaceCell, SpaceKind } from "../types";
import { registerCanvasCapture } from "./exportCapture";
import { renderDetachedOrganismExport } from "../export/organismExport";
import { projectSelectionOverlay, resolveSelectionIntent } from "../interaction/selection";
import {
  applySpacePositionsPreview,
  createGroupTranslation,
  resolveGroupTranslationPositions,
  type GroupTranslation,
  type SpacePosition,
} from "../interaction/groupDrag";
import { resolveContextSurface, shouldOpenContextFromGesture } from "../interaction/contextActionRegistry";
import {
  advanceCanvasGesture,
  beginCanvasCellGesture,
  beginCanvasPanGesture,
  cancelCanvasGesture,
  completeCanvasGesture,
  createCanvasGestureState,
  mergeCanvasWheelFrame,
  resolveCanvasPanCamera,
  resolveCanvasPressSelection,
} from "../interaction/canvasGestureController";
import { createDemandFrameLoop, createFrameScheduler, latestCoalescedPointerEvent } from "../interaction/frameScheduler";
import { performanceRuntime } from "../runtime/performanceRuntime";
import { performanceGovernor } from "../runtime/performanceGovernor";
import {
  resolveLivePerformanceSettings,
  resolveOrganismDpr,
  resolveOrganismPixelRatio,
} from "../runtime/performanceProfiles";
import { projectClientPoint } from "./labelPresentation";
import { resolveLabelScale } from "./labelPresentation";
import { resolveLabelContrast } from "../design/labelContrast";
import { resolveCellShadowGated } from "./cellShadow";
import { resolveRuntimeGates } from "./runtimeGates";
import { iconRegistry } from "../icons/iconRegistry";
import { drawSymbolPlacement, resolveSymbolTint } from "../icons/iconDrawing";
import {
  drawOrganismCircleOverlay,
  patchRuntimePresentation,
  projectCircleLayers,
  projectMembraneField,
  projectOrganismDebugPresentation,
  projectRuntimePresentation,
} from "./presentationLayers";
import { textStylePreset } from "../domain/presentation/editing";
import {
  resolveFlagAutoDirection,
  resolveFlagRuntimeGeometry,
  resolveLabelRuntimeScale,
} from "../domain/labels/resolveLayout";
import { getCellLabelLayout, selectRuntimeLabelLayout } from "./cellLabelDraw";
import {
  advanceCameraShake,
  createCameraShakeState,
  nudgeCameraShakeForDrag,
  pulseCameraShake,
  resetCameraShake,
  resolveCameraShake,
} from "./cameraShake";
import OrganismCellLabel from "./OrganismCellLabel";
import {
  isConnectionAuthoringActive,
  isValidConnectionEndpoint,
} from "../domain/connections/model";
import { createDefaultConnectionFilterSpec } from "../domain/connections/filters";
import { getConnectionIndex } from "../domain/connections/selectors";
import {
  deriveConnectionPorts,
  hitConnectionPort,
  resolveConnectionAutoPan,
  resolveConnectionAutoPanDelta,
  resolveConnectionPressIntent,
  resolveConnectionRelease,
  type ConnectionPort,
  type ScreenVector,
} from "./connections/editing";
import {
  CONNECTION_HIT_TOLERANCE_PX,
  createConnectionPathCache,
  drawConnectionBatch,
  hitTestConnections,
  projectConnections,
  type ConnectionProjectionResult,
} from "./connections/renderer";
import { createConnectionInstrumentation } from "./connections/instrumentation";
import "./organismCanvas.css";

const THEME_TRANSITION_MS = 200;
const CONNECTION_PORT_VISIBLE_RADIUS_PX = 7.25;
const CONNECTION_PORT_HIT_RADIUS_PX = 14;

const authoredCanvasSettings = (state: ReturnType<typeof useLab.getState>) => {
  const runtime = state.membraneRuntimePreview ? { ...state.settings, ...state.membraneRuntimePreview } : state.settings;
  const visual = state.visualSettingsPreview ? {
    ...runtime,
    organism: state.visualSettingsPreview.organism,
    cellShadow: state.visualSettingsPreview.cellShadow,
  } : runtime;
  const resources = state.resourcesPreview ? { ...visual, resources: state.resourcesPreview } : visual;
  return state.presentationDefaultsPreview
    ? { ...resources, presentationDefaults: state.presentationDefaultsPreview }
    : resources;
};
const sameCanvasSettingsExceptConnections = (
  left: ReturnType<typeof authoredCanvasSettings>,
  right: ReturnType<typeof authoredCanvasSettings>,
): boolean => (Object.keys(left) as Array<keyof typeof left>).every(
  (key) => key === "connectionStyles" || key === "connectionView" || left[key] === right[key],
);
const Z_MIN = 0.25;
const Z_MAX = 4;

interface SmoothFrame {
  mass: number;
  iso: number;
  softness: number;
  tension: number;
  bias: number;
  pocketIso: number;
  pocketSoft: number;
  pocketAmount: number;
  dots: number;
  body: RGB;
  bodyB: RGB;
  bg: RGB;
  accent: RGB;
  colorMix: number;
}

const expK = (response: number, dt: number) => 1 - Math.exp(-Math.max(response, 0.0001) * dt);

const readTheme = (): LabTheme =>
  document.documentElement.getAttribute("data-theme") === "night" ? "night" : "day";

type OrganismInvalidation =
  | "MEMBRANE_FIELD"
  | "CELL_PRESENTATION"
  | "LABEL_PRESENTATION"
  | "GRID"
  | "CONNECTIONS"
  | "CAMERA"
  | "FULL";

export interface OrganismCanvasActivityProps {
  active: boolean;
  onResumeReady?: () => void;
}

export default function OrganismCanvasView({
  active,
  onResumeReady,
}: OrganismCanvasActivityProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const connectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const presentationCanvasRef = useRef<HTMLCanvasElement>(null);
  const presentationBackCanvasRef = useRef<HTMLCanvasElement>(null);
  const connectionEditingCanvasRef = useRef<HTMLCanvasElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const connectionAuthoringPreviewRef = useRef(useLab.getState().connectionAuthoring);
  const activeRef = useRef(active);
  const onResumeReadyRef = useRef(onResumeReady);
  const runtimeActivityRef = useRef<((nextActive: boolean) => void) | null>(null);
  activeRef.current = active;
  onResumeReadyRef.current = onResumeReady;
  const incomingLabelSpaces = useLab((s) => s.appearancePreview
    && !(s.appearancePreviewTarget === "boundary" || s.appearancePreviewTarget === "core")
    ? s.appearancePreview
    : s.spaces);
  const labelSpacesRef = useRef(incomingLabelSpaces);
  const lastLabelCommitRef = useRef({
    spaces: useLab.getState().spaces,
    ids: useLab.getState().appearancePreviewIds,
  });
  const currentLabelState = useLab.getState();
  const nonLabelAppearanceCommit = currentLabelState.appearancePreview === null
    && currentLabelState.spaces !== lastLabelCommitRef.current.spaces
    && currentLabelState.appearancePreviewIds !== lastLabelCommitRef.current.ids
    && (currentLabelState.appearancePreviewTarget === "boundary"
      || currentLabelState.appearancePreviewTarget === "core");
  if (!nonLabelAppearanceCommit) labelSpacesRef.current = incomingLabelSpaces;
  lastLabelCommitRef.current = {
    spaces: currentLabelState.spaces,
    ids: currentLabelState.appearancePreviewIds,
  };
  const canonicalSpaces = labelSpacesRef.current;
  const arrangementPreview = useLab((s) => s.arrangementPreview);
  const spaces = useMemo(
    () => applySpacePositionsPreview(canonicalSpaces, arrangementPreview ?? []),
    [canonicalSpaces, arrangementPreview],
  );
  const selectedId = useLab((s) => s.selectedId);
  const selectedIds = useLab((s) => s.selectedIds);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const editingTargetId = useLab((s) => s.contextSurface === "inline-editor" ? s.contextTargetId : null);
  const showLabels = useLab((s) => s.settings.organism.showLabels);
  const annotationMode = useLab((s) => s.settings.annotationMode);
  const annotationDetail = useLab((s) => s.settings.annotationDetail);
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const nucleusPaletteId = useLab((s) => s.settings.nucleusPaletteId);
  const colorSource = useLab((s) => s.settings.colorSource);
  const organismPaletteId = useLab((s) => s.settings.organismPaletteId);
  const morphMode = useLab((s) => s.settings.morphMode);
  const presentationDefaults = useLab((s) => s.presentationDefaultsPreview ?? s.settings.presentationDefaults);
  const showGrid = useLab((s) => s.settings.showGrid);
  const labelScaleMode = useLab((s) => s.settings.labelScaleMode);
  const labelCustomColour = useLab((s) => s.settings.labelCustomColour);
  const themeMode = useLab((s) => s.theme);
  const areaRange = useMemo(() => getAreaRange(spaces), [spaces]);
  const labelPresentation = useMemo(() => projectRuntimePresentation(spaces, {
    presentationDefaults,
    paletteMode,
    colorSource,
    nucleusPaletteId,
    organismPaletteId,
    morphMode,
  }, themeMode), [
    spaces,
    presentationDefaults,
    paletteMode,
    colorSource,
    nucleusPaletteId,
    organismPaletteId,
    morphMode,
    themeMode,
  ]);
  const labelSelection = useMemo(() => projectSelectionOverlay({
    visibleIds: spaces.map((space) => space.id),
    selectedIds,
    primarySelectedId: selectedId,
    hoveredId: null,
    include: true,
  }), [spaces, selectedIds, selectedId]);
  const iconPlacements = useLab((s) => s.settings.resources.iconPlacements);
  const symbolTargets = useMemo(
    () => new Set(iconPlacements.map((placement) => placement.targetSpaceId)),
    [iconPlacements]
  );
  /* Deterministic Flag auto-placement reference: the organism centroid. */
  const labelCentroid = useMemo(
    () => spaces.length
      ? spaces.reduce(
          (sum, space) => ({ x: sum.x + space.x / spaces.length, y: sum.y + space.y / spaces.length }),
          { x: 0, y: 0 }
        )
      : null,
    [spaces]
  );

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const connectionCanvas = connectionCanvasRef.current;
    const presentationCanvas = presentationCanvasRef.current;
    const presentationBackCanvas = presentationBackCanvasRef.current;
    const connectionEditingCanvas = connectionEditingCanvasRef.current;
    const connectionContext = connectionCanvas?.getContext("2d") ?? null;
    const connectionEditingContext = connectionEditingCanvas?.getContext("2d") ?? null;
    if (!host || !canvas || !connectionCanvas || !connectionContext || !presentationCanvas || !presentationBackCanvas || !connectionEditingCanvas || !connectionEditingContext) return;
    let activePresentationCanvas = presentationCanvas;
    let activePresentationCtx = presentationCanvas.getContext("2d");
    let stagingPresentationCanvas = presentationBackCanvas;
    let stagingPresentationCtx = presentationBackCanvas.getContext("2d");
    presentationBackCanvas.style.visibility = "hidden";
    let connectionEditingSurfaceCleared = false;
    const connectionInstrumentation = createConnectionInstrumentation();
    const hideConnectionPreview = () => {
      if (connectionEditingSurfaceCleared) return;
      connectionEditingContext.setTransform(1, 0, 0, 1, 0, 0);
      connectionEditingContext.clearRect(0, 0, connectionEditingCanvas.width, connectionEditingCanvas.height);
      connectionEditingCanvas.style.visibility = "hidden";
      connectionEditingSurfaceCleared = true;
      connectionInstrumentation.recordOverlayClear();
    };

    const announceReadiness = (stage: "canvas-mounted" | "renderer-ready" | "render-requested" | "ready") => {
      const state = useLab.getState();
      if (!state.loaderDone) state.setCanvasReadiness(stage);
    };
    announceReadiness("canvas-mounted");

    let renderer: OrganismRenderer | null = null;
    try {
      renderer = createOrganismRenderer(canvas);
    } catch {
      renderer = null;
    }
    canvas.dataset.rendererCreateCount = "1";
    canvas.dataset.visibleResizeCount = "0";
    if (!renderer) {
      announceReadiness("renderer-ready");
      return;
    }
    announceReadiness("renderer-ready");

    let runtimeActive = activeRef.current;
    let resumePreparationPending = runtimeActive;
    let pendingStoreState: ReturnType<typeof useLab.getState> | null = null;
    const cam = { ...useLab.getState().camera };
    let lastCommitted = useLab.getState().camera;
    const initialState = useLab.getState();
    let spaces = applySpacePositionsPreview(
      initialState.appearancePreview ?? initialState.spaces,
      initialState.arrangementPreview ?? [],
    );
    let selectedId = useLab.getState().selectedId;
    let selectedIdSet = new Set(useLab.getState().selectedIds);
    let authoredSettings = authoredCanvasSettings(initialState);
    let performanceSnapshot = performanceGovernor.getSnapshot();
    let settings = resolveLivePerformanceSettings(
      authoredSettings,
      performanceSnapshot,
      "organism",
    );
    let effectiveRenderScale = performanceSnapshot.effectiveRenderScale;
    let previewFilter = performanceSnapshot.previewFilter;
    let pendingPerformanceSnapshot: typeof performanceSnapshot | null = null;
    canvas.dataset.previewFilter = previewFilter;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    let pendingReducedMotion: boolean | null = null;
    let resolved = resolveOrganism(settings, reducedMotion);
    const cameraShake = createCameraShakeState();
    const motionState = createMotionState();
    let theme = readTheme();
    let pendingTheme: LabTheme | null = null;
    let themeTransitionUntil = 0;
    const gesture = createCanvasGestureState<DragPosition, GroupTranslation, SpacePosition>();
    let connections = initialState.connections;
    let connectionStyles = initialState.settings.connectionStyles;
    let connectionFocusMode = initialState.settings.connectionView.focusMode;
    let selectedConnectionIdSet = new Set(initialState.selectedConnectionIds);
    let hoveredConnectionId: string | null = null;
    let connectionModeActive = initialState.connectionModeActive;
    let connectionLayerVisible = initialState.settings.connectionView.visible;
    const connectionPathCache = createConnectionPathCache();
    let connectionProjection: ConnectionProjectionResult = {
      commands: [],
      hitIndex: { entries: [] },
      metrics: {
        authoredCount: connections.length,
        eligibleCount: 0,
        visibleCount: 0,
        anchorResolutions: 0,
        pathResolutions: 0,
        cacheHits: 0,
        cacheMisses: 0,
        endpointInvalidations: 0,
        hitIndexEntries: 0,
        labelLayouts: 0,
      },
    };
    let pendingChangedConnectionEndpointIds = new Set<string>();
    let connectionNeedsRender = true;
    let connectionSurfaceCleared = false;
    let connectionDragPointerId: number | null = null;
    let connectionDragStart: { sx: number; sy: number } | null = null;
    let connectionDragMoved = false;
    let connectionAutoPan: ScreenVector = { dx: 0, dy: 0 };
    let connectionAutoPanMoved = false;
    let connectionPorts: ConnectionPort[] = [];
    let connectionHoverId: string | null = null;
    let connectionHoverValid = true;
    let connectionInvalidMessage = "";
    let connectionInvalidPoint: { x: number; y: number } | null = null;
    let connectionPreviewPointer: { sx: number; sy: number } | null = null;
    let dirty = true;
    let membraneNeedsRender = true;
    let lastInvalidationScope: OrganismInvalidation = "FULL";
    let renderLoop: ReturnType<typeof createDemandFrameLoop> | null = null;
    const invalidate = (scope: OrganismInvalidation = "FULL") => {
      dirty = true;
      lastInvalidationScope = scope;
      if (scope === "FULL" || scope === "MEMBRANE_FIELD" || scope === "CELL_PRESENTATION" || scope === "CAMERA" || scope === "CONNECTIONS") {
        connectionNeedsRender = true;
      }
      if (scope === "FULL" || scope === "MEMBRANE_FIELD" || scope === "CAMERA") {
        membraneNeedsRender = true;
      }
      if (runtimeActive) renderLoop?.invalidate();
    };
    const stopConnectionAutoPan = () => {
      connectionAutoPan = { dx: 0, dy: 0 };
      renderLoop?.setContinuous(resolved.motionActive);
    };
    const commitCamera = () => {
      const snapshot = { ...cam };
      lastCommitted = snapshot;
      useLab.getState().setCamera(snapshot);
    };
    const finalizeConnectionPointer = (commitAutoPan = true) => {
      const pointerId = connectionDragPointerId;
      const shouldCommitAutoPan = commitAutoPan && connectionAutoPanMoved;
      connectionDragPointerId = null;
      connectionDragStart = null;
      connectionDragMoved = false;
      connectionAutoPanMoved = false;
      connectionPreviewPointer = null;
      connectionHoverId = null;
      connectionHoverValid = true;
      connectionInvalidMessage = "";
      connectionInvalidPoint = null;
      stopConnectionAutoPan();
      if (pointerId !== null) {
        try {
          if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
        } catch {
          // Synthetic and stale pointer ids require no release.
        }
      }
      if (shouldCommitAutoPan) commitCamera();
      return shouldCommitAutoPan;
    };
    const updateResolvedOrganism = (next: ReturnType<typeof resolveOrganism>) => {
      if (next.motionActive !== resolved.motionActive) resetMotionState(motionState);
      resolved = next;
      canvas.dataset.motionActive = String(resolved.motionActive);
      renderLoop?.setContinuous(resolved.motionActive || connectionAutoPan.dx !== 0 || connectionAutoPan.dy !== 0);
    };
    let effectivePixelRatio = 1;
    let presentationPixelRatio = 1;
    let w = 0;
    let h = 0;
    let camTarget: typeof cam | null = null;
    let surfaceNeedsClear = true;
    let membraneRenderCount = 0;
    let membraneClearCount = 0;
    let presentationRenderCount = 0;
    let performanceReportCount = 0;
    let resumePreparationCount = 0;
    let lastArrangementPreview = initialState.arrangementPreview;
    let lastSpaceSource = initialState.appearancePreview ?? initialState.spaces;
    let lastAppearancePreview = initialState.appearancePreview;
    let lastAppearancePreviewIds = initialState.appearancePreviewIds;
    let lastAppearancePreviewTarget = initialState.appearancePreviewTarget;
    let lastSelectedIds = initialState.selectedIds;
    let lastSelectedId = initialState.selectedId;
    let connectionAuthoring = initialState.connectionAuthoring;
    let connectionEndpointById = new Map(spaces.map((space) => [space.id, space]));
    let derivedDirty = true;
    let cachedAreaRange = getAreaRange(spaces.slice(0, MAX_NUCLEI));
    let cachedCellColors = new Map<string, string>();
    let cachedStyle = styleColors(settings.morphMode, theme);
    let cachedPalette = getOrganismPalette(
      settings.paletteMode,
      theme,
      { bodyHex: cachedStyle.bodyHex, bgHex: cachedStyle.bgHex },
      settings.organismPaletteId,
      {
        spaces: spaces.slice(0, MAX_NUCLEI),
        areaRange: cachedAreaRange,
        nucleusPaletteId: settings.nucleusPaletteId,
        colorSource: settings.colorSource,
      }
    );
    let cachedShadow = resolveCellShadowGated(settings.cellShadow, settings.performanceQuality, theme);
    let cachedPresentation = projectRuntimePresentation(
      spaces.slice(0, MAX_NUCLEI),
      settings,
      theme
    );
    let cachedField = settings.blobOn && (cachedPresentation.membrane.visible || cachedPresentation.membraneEdge.visible)
      ? effectiveField(resolved.params)
      : { tension: 1, bias: 0 };

    const refreshDerived = () => {
      cachedAreaRange = getAreaRange(spaces.slice(0, MAX_NUCLEI));
      cachedPresentation = projectRuntimePresentation(
        spaces.slice(0, MAX_NUCLEI),
        settings,
        theme
      );
      cachedCellColors = new Map(
        spaces.slice(0, MAX_NUCLEI).map((space) => [
          space.id,
          cachedPresentation.byId.get(space.id)?.cell.paint.colour ?? getNucleusColor(
              space,
              settings.paletteMode,
              cachedAreaRange,
              settings.nucleusPaletteId,
              settings.colorSource
            ).fill,
        ])
      );
      cachedStyle = styleColors(settings.morphMode, theme);
      cachedPalette = getOrganismPalette(
        settings.paletteMode,
        theme,
        { bodyHex: cachedStyle.bodyHex, bgHex: cachedStyle.bgHex },
        settings.organismPaletteId,
        {
          spaces: spaces.slice(0, MAX_NUCLEI),
          areaRange: cachedAreaRange,
          nucleusPaletteId: settings.nucleusPaletteId,
          colorSource: settings.colorSource,
        }
      );
      if (settings.blobOn && (cachedPresentation.membrane.visible || cachedPresentation.membraneEdge.visible)) {
        cachedField = effectiveField(resolved.params);
      }
      cachedShadow = resolveCellShadowGated(settings.cellShadow, settings.performanceQuality, theme);
      canvas.dataset.presentationProjectionCount = String(Math.min(spaces.length, MAX_NUCLEI));
      derivedDirty = false;
    };

    const patchSelectedPresentation = (ids: readonly string[], sourceSpaces: readonly SpaceCell[]) => {
      const visibleSpaces = sourceSpaces.slice(0, MAX_NUCLEI);
      const idSet = new Set(ids);
      const changedSpaces = visibleSpaces.filter((space) => idSet.has(space.id));
      cachedPresentation = patchRuntimePresentation(
        cachedPresentation,
        changedSpaces,
        visibleSpaces,
        settings,
        theme,
        cachedAreaRange,
      );
      for (const space of changedSpaces) {
        const colour = cachedPresentation.byId.get(space.id)?.cell.paint.colour;
        if (colour) cachedCellColors.set(space.id, colour);
      }
      canvas.dataset.presentationProjectionCount = String(changedSpaces.length);
    };

    const nucleiBuf = new Float32Array(MAX_NUCLEI * 4);
    const nucleusColorsBuf = new Float32Array(MAX_NUCLEI * 3);
    const smoothNucleusColors = new Map<string, { r: number; g: number; b: number; seen: number }>();
    let colorGeneration = 0;
    const frame: OrganismRenderFrame = {
      count: 0,
      nuclei: nucleiBuf,
      nucleusColors: nucleusColorsBuf,
      mass: 1,
      iso: 1,
      softness: 0.02,
      tension: 1,
      bias: 0.18,
      pocketIso: 8,
      pocketSoft: 0.45,
      pocketAmount: 1,
      bodyColor: [0, 0, 0],
      bodyColorB: [0, 0, 0],
      bgColor: [1, 1, 1],
      accentColor: [0.55, 0.08, 0.14],
      colorMix: 0,
      spatialColorMix: 1,
      nucleusDots: 0,
      membraneOpacity: 1,
      membraneEdgeOpacity: 0,
      membraneEdgeWidth: 1,
      membraneEdgeSoftness: 0,
      morphEnabled: false,
      shadowEnabled: false,
      shadowColor: [0, 0, 0],
      shadowOpacity: 0,
      shadowSoftness: 0,
      shadowOffset: [0, 0],
      shadowSpread: 0,
      fieldDebug: false,
      nucleiDebug: false,
      nucleiDebugCenterDots: false,
    };
    let smooth: SmoothFrame | null = null;

    const applyStoreSnapshot = (
      s: ReturnType<typeof useLab.getState>,
      forceFull = false,
    ) => {
      let connectionCameraCommitted = false;
      const externalCameraChanged = s.camera !== lastCommitted;
      const nextSpaceSource = s.appearancePreview ?? s.spaces;
      const sourceChanged = nextSpaceSource !== lastSpaceSource;
      const arrangementChanged = s.arrangementPreview !== lastArrangementPreview;
      const nextSpaces = sourceChanged || arrangementChanged
        ? applySpacePositionsPreview(nextSpaceSource, s.arrangementPreview ?? [])
        : spaces;
      const spacesChanged = nextSpaces !== spaces;
      spaces = nextSpaces;
      if (spacesChanged) {
        const nextEndpointById = new Map(spaces.map((space) => [space.id, space]));
        const endpointIds = new Set([...connectionEndpointById.keys(), ...nextEndpointById.keys()]);
        for (const endpointId of endpointIds) {
          const previous = connectionEndpointById.get(endpointId);
          const next = nextEndpointById.get(endpointId);
          if (
            !previous
            || !next
            || previous.x !== next.x
            || previous.y !== next.y
            || previous.area !== next.area
            || previous.kind !== next.kind
          ) pendingChangedConnectionEndpointIds.add(endpointId);
        }
        connectionEndpointById = nextEndpointById;
        connectionNeedsRender = true;
      }
      const selectionChanged = s.selectedIds !== lastSelectedIds || s.selectedId !== lastSelectedId;
      const connectionRecordsChanged = s.connections !== connections;
      const connectionStylesChanged = s.settings.connectionStyles !== connectionStyles;
      const connectionFocusChanged = s.settings.connectionView.focusMode !== connectionFocusMode;
      const connectionSelectionChanged = s.selectedConnectionIds.length !== selectedConnectionIdSet.size
        || s.selectedConnectionIds.some((id) => !selectedConnectionIdSet.has(id));
      connections = s.connections;
      connectionStyles = s.settings.connectionStyles;
      connectionFocusMode = s.settings.connectionView.focusMode;
      selectedConnectionIdSet = new Set(s.selectedConnectionIds);
      const connectionModeChanged = s.connectionModeActive !== connectionModeActive
        || s.settings.connectionView.visible !== connectionLayerVisible;
      connectionModeActive = s.connectionModeActive;
      connectionLayerVisible = s.settings.connectionView.visible;
      const connectionAuthoringChanged = s.connectionAuthoring !== connectionAuthoring;
      connectionAuthoring = s.connectionAuthoring;
      connectionAuthoringPreviewRef.current = s.connectionAuthoring;
      if (connectionAuthoringChanged) {
        if (isConnectionAuthoringActive(connectionAuthoring)) cancelCanvasGesture(gesture);
        if (connectionAuthoring.phase === "mode-ready" && connectionDragPointerId !== null) {
          connectionCameraCommitted = finalizeConnectionPointer(!externalCameraChanged) || connectionCameraCommitted;
        }
      }
      if (!connectionModeActive || !connectionLayerVisible) {
        connectionCameraCommitted = finalizeConnectionPointer(!externalCameraChanged) || connectionCameraCommitted;
        if (!connectionLayerVisible) hoveredConnectionId = null;
        hideConnectionPreview();
      }
      selectedId = s.selectedId;
      selectedIdSet = new Set(s.selectedIds);
      let invalidation: OrganismInvalidation | null = selectionChanged ? "LABEL_PRESENTATION" : null;
      if (
        selectionChanged
        || connectionRecordsChanged
        || connectionStylesChanged
        || connectionFocusChanged
        || connectionSelectionChanged
        || connectionAuthoringChanged
        || connectionModeChanged
      ) {
        connectionNeedsRender = true;
        if (!invalidation) invalidation = "CONNECTIONS";
      }
      const nextAuthoredSettings = authoredCanvasSettings(s);
      if (nextAuthoredSettings !== authoredSettings) {
        const connectionOnlySettingsChange = sameCanvasSettingsExceptConnections(nextAuthoredSettings, authoredSettings);
        authoredSettings = nextAuthoredSettings;
        if (!connectionOnlySettingsChange) {
          const nextSettings = resolveLivePerformanceSettings(
            authoredSettings,
            performanceSnapshot,
            "organism",
          );
          const membraneTurnedOff = settings.blobOn && !nextSettings.blobOn;
          const qualityChanged = nextSettings.performanceQuality !== settings.performanceQuality;
          const previousDetail = resolved.membraneDetail;
          settings = nextSettings;
          const nextResolved = resolveOrganism(settings, reducedMotion);
          const detailChanged = JSON.stringify(nextResolved.membraneDetail) !== JSON.stringify(previousDetail);
          updateResolvedOrganism(nextResolved);
          derivedDirty = true;
          invalidation = "FULL";
          if (membraneTurnedOff) {
            surfaceNeedsClear = true;
            smooth = null;
          }
          if ((qualityChanged || detailChanged) && !forceFull) resize();
        }
      }
      if (arrangementChanged) {
        lastArrangementPreview = s.arrangementPreview;
        if (s.arrangementPreview) performanceGovernor.beginInteraction();
        performanceGovernor.endInteraction();
        invalidation = "FULL";
      }
      const previewChanged = s.appearancePreview !== lastAppearancePreview;
      const appearanceMetadataChanged = s.appearancePreviewIds !== lastAppearancePreviewIds
        || s.appearancePreviewTarget !== lastAppearancePreviewTarget;
      const previewIds = s.appearancePreviewIds ?? lastAppearancePreviewIds;
      const previewTarget = s.appearancePreviewTarget ?? lastAppearancePreviewTarget;
      const localAppearanceChange = (previewChanged || appearanceMetadataChanged)
        && !arrangementChanged
        && previewTarget !== null
        && previewIds !== null;
      if (!forceFull && spacesChanged && localAppearanceChange) {
        patchSelectedPresentation(previewIds, nextSpaceSource);
        invalidation = previewTarget === "text" ? "LABEL_PRESENTATION" : "CELL_PRESENTATION";
        if (previewTarget === "cell" && cachedPresentation.membrane.colourMode === "cell-gradient") {
          invalidation = "MEMBRANE_FIELD";
        }
      } else if (spacesChanged) {
        derivedDirty = true;
        invalidation = "FULL";
      }
      if (!connectionCameraCommitted && externalCameraChanged) {
        lastCommitted = s.camera;
        camTarget = s.camera;
        invalidation = "CAMERA";
      }
      lastSpaceSource = nextSpaceSource;
      lastAppearancePreview = s.appearancePreview;
      lastAppearancePreviewIds = s.appearancePreviewIds;
      lastAppearancePreviewTarget = s.appearancePreviewTarget;
      lastSelectedIds = s.selectedIds;
      lastSelectedId = s.selectedId;
      if (forceFull) {
        derivedDirty = true;
        invalidation = "FULL";
      }
      if (invalidation) invalidate(invalidation);
    };
    const unsub = useLab.subscribe((s) => {
      if (!runtimeActive) {
        pendingStoreState = s;
        return;
      }
      applyStoreSnapshot(s);
    });
    const applyPerformanceSnapshot = (
      nextPerformanceSnapshot: typeof performanceSnapshot,
      deferResize = false,
    ) => {
      if (!runtimeActive) {
        pendingPerformanceSnapshot = nextPerformanceSnapshot;
        return;
      }
      const nextSettings = resolveLivePerformanceSettings(
        authoredSettings,
        nextPerformanceSnapshot,
        "organism",
      );
      const qualityChanged = nextSettings.performanceQuality !== settings.performanceQuality;
      const previewScaleChanged = nextPerformanceSnapshot.effectiveRenderScale !== effectiveRenderScale;
      const filterChanged = nextPerformanceSnapshot.previewFilter !== previewFilter;
      if (!qualityChanged && !previewScaleChanged && !filterChanged) return;
      performanceSnapshot = nextPerformanceSnapshot;
      settings = nextSettings;
      effectiveRenderScale = nextPerformanceSnapshot.effectiveRenderScale;
      previewFilter = nextPerformanceSnapshot.previewFilter;
      canvas.dataset.previewFilter = previewFilter;
      renderer?.setFilter(previewFilter);
      updateResolvedOrganism(resolveOrganism(settings, reducedMotion));
      derivedDirty = true;
      if ((qualityChanged || previewScaleChanged) && !deferResize) resizeTarget();
      invalidate();
    };
    const unsubGovernor = performanceGovernor.subscribe(() => {
      applyPerformanceSnapshot(performanceGovernor.getSnapshot());
    });

    const mo = new MutationObserver(() => {
      if (!runtimeActive) {
        pendingTheme = readTheme();
        return;
      }
      theme = readTheme();
      themeTransitionUntil = performance.now() + THEME_TRANSITION_MS;
      derivedDirty = true;
      if (!settings.blobOn) surfaceNeedsClear = true;
      invalidate();
    });
    mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    let lastMembraneSamplingScale = Number.NaN;
    const resizeTarget = () => {
      const detail = resolved.membraneDetail;
      /* Detail preference changes sampling density only. World-field radii,
       * positions and topology remain in the adapter/shader contract. */
      const morphologyDetailScale = resolveMembraneSamplingScale(detail, cam.zoom);
      lastMembraneSamplingScale = morphologyDetailScale;
      effectivePixelRatio = resolveOrganismPixelRatio(
        window.devicePixelRatio || 1,
        settings.performanceQuality,
        effectiveRenderScale,
      ) * morphologyDetailScale;
      renderer?.resizeTarget(w, h, effectivePixelRatio);
      renderer?.setFilter(previewFilter);
    };
    type Dimensions = { width: number; height: number };
    let pendingDimensions: Dimensions | null = null;
    const applyDimensions = (dimensions: Dimensions) => {
      presentationPixelRatio = resolveOrganismDpr(window.devicePixelRatio || 1, "high");
      w = dimensions.width;
      h = dimensions.height;
      renderer?.resize(w, h, presentationPixelRatio);
      resizeTarget();
      const presentationWidth = Math.max(1, Math.round(w * presentationPixelRatio));
      const presentationHeight = Math.max(1, Math.round(h * presentationPixelRatio));
      for (const surface of [presentationCanvas, presentationBackCanvas]) {
        if (surface.width !== presentationWidth) surface.width = presentationWidth;
        if (surface.height !== presentationHeight) surface.height = presentationHeight;
      }
      if (connectionCanvas.width !== presentationWidth) connectionCanvas.width = presentationWidth;
      if (connectionCanvas.height !== presentationHeight) connectionCanvas.height = presentationHeight;
      if (connectionEditingCanvas.width !== presentationWidth) connectionEditingCanvas.width = presentationWidth;
      if (connectionEditingCanvas.height !== presentationHeight) connectionEditingCanvas.height = presentationHeight;
      canvas.dataset.visibleResizeCount = String(Number(canvas.dataset.visibleResizeCount ?? "0") + 1);
      surfaceNeedsClear = true;
      invalidate();
    };
    const resize = () => {
      const dimensions = { width: host.clientWidth, height: host.clientHeight };
      if (!runtimeActive) {
        pendingDimensions = dimensions;
        w = dimensions.width;
        h = dimensions.height;
        return;
      }
      applyDimensions(dimensions);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onReducedMotion = () => {
      if (!runtimeActive) {
        pendingReducedMotion = reducedMotionQuery.matches;
        return;
      }
      reducedMotion = reducedMotionQuery.matches;
      updateResolvedOrganism(resolveOrganism(settings, reducedMotion));
      if (reducedMotion) resetCameraShake(cameraShake);
      derivedDirty = true;
      invalidate();
    };
    reducedMotionQuery.addEventListener("change", onReducedMotion);

    const unregisterCapture = registerCanvasCapture(
      async (options, snapshot) => renderDetachedOrganismExport(snapshot, options, w, h),
    );

    const local = (e: PointerEvent | WheelEvent | MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { sx: e.clientX - r.left, sy: e.clientY - r.top };
    };

    const applyCameraShakeOffset = () => {
      const transform = cameraShake.active
        ? `translate3d(${cameraShake.x.toFixed(3)}px, ${cameraShake.y.toFixed(3)}px, 0)`
        : "";
      /* This is a presentation transform over the existing camera path. It
       * never touches `cam`, persistence, undo history, or export capture. */
      canvas.style.transform = transform;
      connectionCanvas.style.transform = transform;
      presentationCanvas.style.transform = transform;
      presentationBackCanvas.style.transform = transform;
      gridRef.current?.style.setProperty("transform", transform);
      labelLayerRef.current?.style.setProperty("transform", transform);
      connectionEditingCanvas.style.setProperty("transform", transform);
      host.dataset.cameraShake = cameraShake.active ? "active" : "off";
    };

    const cameraShakeSettings = () => resolveCameraShake(settings.organism, {
      reducedMotion,
      fastPerformance: settings.performanceQuality === "fast",
    });

    const currentNuclei = () => {
      const renderSpaces = gesture.translatedPositions.length > 0
        ? applySpacePositionsPreview(spaces, gesture.translatedPositions)
        : spaces;
      return spacesToNuclei(
        renderSpaces,
        cam,
        w,
        h,
        selectedId,
        gesture.translatedPositions.length > 0 ? gesture.translatedPositions : gesture.drag,
        resolved.adapter,
        motionStateForRuntime(resolved.motionActive, motionState),
        settings.paletteMode,
        settings.nucleusPaletteId,
        settings.colorSource,
        cachedAreaRange,
        cachedCellColors
      );
    };
    let lastNuclei: ProductionNucleus[] = [];

    const publishConnectionMetrics = () => {
      const snapshot = connectionInstrumentation.snapshot();
      connectionCanvas.dataset.authoredCount = String(snapshot.authoredCount);
      connectionCanvas.dataset.eligibleCount = String(snapshot.eligibleCount);
      connectionCanvas.dataset.visibleCount = String(snapshot.visibleCount);
      connectionCanvas.dataset.anchorResolutions = String(snapshot.anchorResolutions);
      connectionCanvas.dataset.pathResolutions = String(snapshot.pathResolutions);
      connectionCanvas.dataset.cacheHits = String(snapshot.cacheHits);
      connectionCanvas.dataset.cacheMisses = String(snapshot.cacheMisses);
      connectionCanvas.dataset.endpointInvalidations = String(snapshot.endpointInvalidations);
      connectionCanvas.dataset.hitIndexEntries = String(snapshot.hitIndexEntries);
      connectionCanvas.dataset.labelLayouts = String(snapshot.labelLayouts);
      connectionCanvas.dataset.batchPasses = String(snapshot.batchPasses);
      connectionCanvas.dataset.drawCalls = String(snapshot.drawCalls);
      connectionCanvas.dataset.drawnCommands = String(snapshot.drawnCommands);
      connectionCanvas.dataset.baseDrawCalls = String(snapshot.baseDrawCalls);
      connectionCanvas.dataset.overlayDrawCalls = String(snapshot.overlayDrawCalls);
      connectionCanvas.dataset.overlayDrawnCommands = String(snapshot.overlayDrawnCommands);
      connectionCanvas.dataset.overlayClears = String(snapshot.overlayClears);
      connectionCanvas.dataset.hitTests = String(snapshot.hitTests);
      connectionCanvas.dataset.portProjections = String(snapshot.portProjections);
      connectionCanvas.dataset.selectionOverlayDraws = String(snapshot.selectionOverlayDraws);
      connectionCanvas.dataset.sleeping = String(snapshot.sleeping);
    };

    const recordConnectionHitTest = () => {
      connectionInstrumentation.recordHitTest();
      connectionCanvas.dataset.hitTests = String(connectionInstrumentation.snapshot().hitTests);
    };

    const clearConnectionBase = () => {
      connectionContext.setTransform(1, 0, 0, 1, 0, 0);
      connectionContext.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);
    };

    const drawConnectionBase = (nuclei: readonly ProductionNucleus[]) => {
      if (!runtimeActive || !connectionLayerVisible) {
        const shouldSettleConnectionOff = !connectionSurfaceCleared
          || connectionNeedsRender
          || connectionInstrumentation.snapshot().authoredCount !== connections.length;
        if (!connectionSurfaceCleared) {
          clearConnectionBase();
          connectionCanvas.style.visibility = "hidden";
          connectionSurfaceCleared = true;
        }
        if (shouldSettleConnectionOff) {
          connectionProjection = {
            commands: [],
            hitIndex: { entries: [] },
            metrics: {
              authoredCount: connections.length,
              eligibleCount: 0,
              visibleCount: 0,
              anchorResolutions: 0,
              pathResolutions: 0,
              cacheHits: 0,
              cacheMisses: 0,
              endpointInvalidations: 0,
              hitIndexEntries: 0,
              labelLayouts: 0,
            },
          };
          connectionInstrumentation.settleOff(connections.length);
          connectionNeedsRender = false;
          pendingChangedConnectionEndpointIds.clear();
          publishConnectionMetrics();
        }
        return;
      }
      if (!connectionNeedsRender && !resolved.motionActive && !motionState.settling) return;

      const endpoints = new Map(nuclei.map((nucleus) => [nucleus.id, {
        id: nucleus.id,
        x: nucleus.sx,
        y: nucleus.sy,
        radius: Math.max(0, nucleus.screenR),
      }]));
      const index = getConnectionIndex(connections);
      const visibleConnectionIds = new Set<string>();
      for (const endpointId of endpoints.keys()) {
        for (const connection of index.byEndpoint.get(endpointId) ?? []) {
          if (endpoints.has(connection.fromSpaceId) && endpoints.has(connection.toSpaceId)) {
            visibleConnectionIds.add(connection.id);
          }
        }
      }
      const candidates = [...visibleConnectionIds]
        .map((id) => index.byId.get(id))
        .filter((connection): connection is NonNullable<typeof connection> => Boolean(connection));
      const cellsById = new Map(nuclei.map((nucleus) => {
        const space = connectionEndpointById.get(nucleus.id);
        return [nucleus.id, {
          id: nucleus.id,
          name: space?.name ?? nucleus.id,
          floorId: space && "floorId" in space && typeof space.floorId === "string" ? space.floorId : undefined,
        }];
      }));
      const lod = endpoints.size >= MAX_NUCLEI ? "critical" : endpoints.size >= 40 ? "dense" : "full";
      const effectiveConnectionFocusMode = selectedConnectionIdSet.size
        ? "selected-connections"
        : selectedIdSet.size
          ? "selected-cell"
          : connectionFocusMode;
      connectionInstrumentation.beginFrame(connections.length);
      connectionProjection = projectConnections({
        connections: candidates,
        authoredCount: connections.length,
        endpoints,
        styles: connectionStyles,
        filter: {
          ...createDefaultConnectionFilterSpec(),
          selectedCellIds: effectiveConnectionFocusMode === "selected-cell" ? [...selectedIdSet] : [],
        },
        cellsById,
        viewport: { x: 0, y: 0, width: w, height: h },
        selectedIds: selectedConnectionIdSet,
        changedEndpointIds: pendingChangedConnectionEndpointIds,
        lod,
        focusMode: effectiveConnectionFocusMode,
      }, connectionPathCache);
      connectionInstrumentation.recordProjection(connectionProjection.metrics);
      clearConnectionBase();
      connectionContext.setTransform(presentationPixelRatio, 0, 0, presentationPixelRatio, 0, 0);
      const drawWork = drawConnectionBatch(connectionContext, connectionProjection.commands, {
        theme,
        scale: 1,
        fadeUnrelated: lod !== "critical" || selectedConnectionIdSet.size > 0 || selectedIdSet.size > 0,
        drawLabels: false,
        markerDetail: lod === "critical" ? "hidden" : lod === "dense" ? "simple" : "full",
        patternFallback: lod === "critical",
      });
      connectionInstrumentation.recordDrawBatch(drawWork, "base");
      connectionCanvas.style.visibility = "visible";
      connectionCanvas.dataset.lod = lod;
      connectionSurfaceCleared = false;
      connectionNeedsRender = false;
      pendingChangedConnectionEndpointIds.clear();
      publishConnectionMetrics();
    };

    const projectConnectionPorts = () => {
      const projected = deriveConnectionPorts(lastNuclei.map((nucleus) => {
        const endpoint = connectionEndpointById.get(nucleus.id);
        const presentation = cachedPresentation.byId.get(nucleus.id);
        return {
          ...(endpoint ?? { id: nucleus.id }),
          id: `connection-port-${nucleus.id}`,
          spaceId: nucleus.id,
          x: nucleus.sx,
          y: nucleus.sy,
          visible: (endpoint as (SpaceCell & { visible?: boolean }) | undefined)?.visible !== false
            && (presentation?.cell.visible ?? true),
          inVisibleSubset: true,
        };
      }),
      connectionAuthoring.sourceId,
      connectionAuthoring.sourceId ? connectionHoverId : null,
      connectionHoverValid);
      connectionInstrumentation.recordPortProjection(projected.length);
      publishConnectionMetrics();
      return projected;
    };

    const drawConnectionEditingOverlay = () => {
      if (!connectionEditingSurfaceCleared) {
        connectionEditingContext.setTransform(1, 0, 0, 1, 0, 0);
        connectionEditingContext.clearRect(0, 0, connectionEditingCanvas.width, connectionEditingCanvas.height);
        connectionEditingSurfaceCleared = true;
        connectionInstrumentation.recordOverlayClear();
      }
      if (!runtimeActive || !connectionLayerVisible) {
        connectionEditingCanvas.style.visibility = "hidden";
        publishConnectionMetrics();
        return;
      }
      const selectedCommands = connectionProjection.commands.filter((command) => command.selected);
      const hoveredCommand = hoveredConnectionId
        ? connectionProjection.commands.find((command) => command.id === hoveredConnectionId) ?? null
        : null;
      if (!connectionModeActive && selectedCommands.length === 0 && !hoveredCommand) {
        connectionEditingCanvas.style.visibility = "hidden";
        publishConnectionMetrics();
        return;
      }
      connectionEditingCanvas.style.visibility = "visible";
      connectionEditingSurfaceCleared = false;
      connectionEditingContext.setTransform(presentationPixelRatio, 0, 0, presentationPixelRatio, 0, 0);
      const computedStyle = getComputedStyle(host);
      const neutral = computedStyle.getPropertyValue("--ink-soft").trim() || "rgba(60, 60, 64, .72)";
      const accent = computedStyle.getPropertyValue("--chrome-accent").trim() || "#8d2330";
      const surface = computedStyle.getPropertyValue("--bg").trim() || "#f7f5f0";
      let overlayPrimitiveDraws = 0;
      let selectionOverlayDraws = 0;
      if (selectedCommands.length) {
        const selectedWork = drawConnectionBatch(connectionEditingContext, selectedCommands.map((command) => ({
          ...command,
          style: {
            ...command.style,
            appearance: {
              ...command.style.appearance,
              color: accent,
              opacity: 1,
              width: command.style.appearance.width + 2,
            },
          },
          emphasis: "focused" as const,
        })), {
          theme,
          scale: 1,
          fadeUnrelated: false,
          drawLabels: false,
          markerDetail: "full",
          patternFallback: false,
        });
        connectionInstrumentation.recordDrawBatch(selectedWork, "overlay");
        selectionOverlayDraws += selectedCommands.length;
      }
      if (hoveredCommand && !hoveredCommand.selected) {
        const hoveredWork = drawConnectionBatch(connectionEditingContext, [{
          ...hoveredCommand,
          style: {
            ...hoveredCommand.style,
            appearance: {
              ...hoveredCommand.style.appearance,
              opacity: 1,
              width: hoveredCommand.style.appearance.width + 1,
            },
          },
          emphasis: "focused" as const,
        }], {
          theme,
          scale: 1,
          fadeUnrelated: false,
          drawLabels: false,
          markerDetail: "full",
          patternFallback: false,
        });
        connectionInstrumentation.recordDrawBatch(hoveredWork, "overlay");
        selectionOverlayDraws += 1;
      }
      const selectedEndpointIds = new Set(selectedCommands.flatMap((command) => [command.fromSpaceId, command.toSpaceId]));
      const hoveredEndpointIds = new Set(hoveredCommand
        ? [hoveredCommand.fromSpaceId, hoveredCommand.toSpaceId]
        : []);
      if (selectedEndpointIds.size || hoveredEndpointIds.size) {
        for (const nucleus of lastNuclei) {
          const selectedEndpoint = selectedEndpointIds.has(nucleus.id);
          const hoveredEndpoint = hoveredEndpointIds.has(nucleus.id);
          if (!selectedEndpoint && !hoveredEndpoint) continue;
          connectionEditingContext.save();
          connectionEditingContext.beginPath();
          connectionEditingContext.arc(nucleus.sx, nucleus.sy, nucleus.screenR + 4, 0, Math.PI * 2);
          connectionEditingContext.strokeStyle = selectedEndpoint ? accent : neutral;
          connectionEditingContext.globalAlpha = selectedEndpoint ? .78 : .48;
          connectionEditingContext.lineWidth = selectedEndpoint ? 1.5 : 1;
          connectionEditingContext.stroke();
          connectionEditingContext.restore();
          overlayPrimitiveDraws += 1;
          selectionOverlayDraws += 1;
        }
      }
      if (!connectionModeActive) {
        connectionInstrumentation.recordOverlayPrimitives(overlayPrimitiveDraws, selectionOverlayDraws);
        publishConnectionMetrics();
        return;
      }
      connectionPorts = projectConnectionPorts();
      const source = connectionAuthoring.sourceId
        ? connectionPorts.find((port) => port.spaceId === connectionAuthoring.sourceId) ?? null
        : null;
      const target = connectionHoverId
        ? connectionPorts.find((port) => port.spaceId === connectionHoverId) ?? null
        : null;
      const validTarget = target?.state === "valid-target" ? target : null;
      const targetNucleus = validTarget
        ? lastNuclei.find((nucleus) => nucleus.id === validTarget.spaceId) ?? null
        : null;

      if (validTarget && targetNucleus) {
        connectionEditingContext.save();
        connectionEditingContext.beginPath();
        connectionEditingContext.arc(validTarget.x, validTarget.y, Math.max(10, targetNucleus.screenR + 4), 0, Math.PI * 2);
        connectionEditingContext.strokeStyle = accent;
        connectionEditingContext.globalAlpha = .62;
        connectionEditingContext.lineWidth = 1.25;
        connectionEditingContext.stroke();
        connectionEditingContext.restore();
        overlayPrimitiveDraws += 1;
      }

      if (source && connectionPreviewPointer) {
        connectionEditingContext.save();
        connectionEditingContext.beginPath();
        connectionEditingContext.moveTo(source.x, source.y);
        connectionEditingContext.lineTo(validTarget?.x ?? connectionPreviewPointer.sx, validTarget?.y ?? connectionPreviewPointer.sy);
        connectionEditingContext.strokeStyle = connectionHoverValid ? accent : neutral;
        connectionEditingContext.globalAlpha = connectionHoverValid ? .82 : .58;
        connectionEditingContext.lineWidth = 1.35;
        connectionEditingContext.setLineDash(connectionHoverValid ? [] : [3, 3]);
        connectionEditingContext.stroke();
        connectionEditingContext.restore();
        overlayPrimitiveDraws += 1;
      }

      for (const port of connectionPorts) {
        const hovered = port.spaceId === connectionHoverId;
        const sourcePort = port.state === "source";
        const validTarget = port.state === "valid-target";
        connectionEditingContext.save();
        connectionEditingContext.beginPath();
        connectionEditingContext.arc(port.x, port.y, CONNECTION_PORT_VISIBLE_RADIUS_PX, 0, Math.PI * 2);
        connectionEditingContext.fillStyle = surface;
        connectionEditingContext.fill();
        connectionEditingContext.strokeStyle = sourcePort || validTarget ? accent : neutral;
        connectionEditingContext.globalAlpha = hovered || sourcePort || validTarget ? 1 : .58;
        connectionEditingContext.lineWidth = sourcePort || validTarget ? 1.5 : 1.25;
        connectionEditingContext.stroke();
        overlayPrimitiveDraws += 2;
        if (sourcePort) {
          connectionEditingContext.beginPath();
          connectionEditingContext.arc(port.x, port.y, 1.35, 0, Math.PI * 2);
          connectionEditingContext.fillStyle = accent;
          connectionEditingContext.fill();
          overlayPrimitiveDraws += 1;
        }
        connectionEditingContext.restore();
      }

      if (connectionInvalidPoint) {
        connectionEditingContext.save();
        connectionEditingContext.strokeStyle = neutral;
        connectionEditingContext.globalAlpha = .72;
        connectionEditingContext.lineWidth = 1.25;
        connectionEditingContext.beginPath();
        connectionEditingContext.arc(connectionInvalidPoint.x, connectionInvalidPoint.y, 4, 0, Math.PI * 2);
        connectionEditingContext.moveTo(connectionInvalidPoint.x - 2.5, connectionInvalidPoint.y - 2.5);
        connectionEditingContext.lineTo(connectionInvalidPoint.x + 2.5, connectionInvalidPoint.y + 2.5);
        connectionEditingContext.moveTo(connectionInvalidPoint.x + 2.5, connectionInvalidPoint.y - 2.5);
        connectionEditingContext.lineTo(connectionInvalidPoint.x - 2.5, connectionInvalidPoint.y + 2.5);
        connectionEditingContext.stroke();
        connectionEditingContext.restore();
        overlayPrimitiveDraws += 1;
      }

      if (connectionInvalidMessage && connectionPreviewPointer) {
        connectionEditingContext.save();
        connectionEditingContext.font = "600 10px system-ui, sans-serif";
        connectionEditingContext.textBaseline = "bottom";
        const textWidth = connectionEditingContext.measureText(connectionInvalidMessage).width;
        const x = Math.min(Math.max(8, connectionPreviewPointer.sx + 12), Math.max(8, w - textWidth - 14));
        const y = Math.max(18, connectionPreviewPointer.sy - 10);
        connectionEditingContext.fillStyle = surface;
        connectionEditingContext.globalAlpha = .9;
        connectionEditingContext.fillRect(x - 4, y - 12, textWidth + 8, 16);
        connectionEditingContext.globalAlpha = 1;
        connectionEditingContext.fillStyle = neutral;
        connectionEditingContext.fillText(connectionInvalidMessage, x, y);
        connectionEditingContext.restore();
        overlayPrimitiveDraws += 2;
      }
      connectionInstrumentation.recordOverlayPrimitives(overlayPrimitiveDraws, selectionOverlayDraws);
      publishConnectionMetrics();
    };

    const clearHoveredConnection = () => {
      if (hoveredConnectionId === null) return;
      hoveredConnectionId = null;
      drawConnectionEditingOverlay();
    };

    const updateConnectionPreview = (sx: number, sy: number) => {
      connectionPreviewPointer = { sx, sy };
      if (!runtimeActive || !connectionModeActive || !connectionLayerVisible) {
        hideConnectionPreview();
        return;
      }
      connectionPorts = projectConnectionPorts();
      const hit = hitConnectionPort(connectionPorts, { x: sx, y: sy }, CONNECTION_PORT_HIT_RADIUS_PX);
      const nucleusHit = hitTestNuclei(lastNuclei, sx, sy);
      const targetSpace = nucleusHit ? connectionEndpointById.get(nucleusHit.id) : null;
      const sourceId = connectionAuthoring.sourceId;
      connectionHoverId = hit?.spaceId ?? null;
      connectionHoverValid = Boolean(sourceId && hit && hit.spaceId !== sourceId);
      connectionInvalidMessage = sourceId && nucleusHit
        ? nucleusHit.id === sourceId
          ? "Choose another Cell."
          : !isValidConnectionEndpoint(targetSpace)
            ? "This Cell is unavailable as a Connection endpoint."
            : ""
        : "";
      connectionInvalidPoint = connectionInvalidMessage && nucleusHit
        ? { x: nucleusHit.sx, y: nucleusHit.sy }
        : null;
      connectionAuthoringPreviewRef.current = connectionAuthoring;
      drawConnectionEditingOverlay();
    };

    const drawPresentationOverlay = (nuclei: ProductionNucleus[], scale: number) => {
      if (!activePresentationCtx || !stagingPresentationCtx) return false;
      const drawCtx = stagingPresentationCtx;
      const pixelScale = Math.max(1, scale);
      const targetWidth = Math.max(1, Math.round(w * pixelScale));
      const targetHeight = Math.max(1, Math.round(h * pixelScale));
      if (stagingPresentationCanvas.width !== targetWidth) stagingPresentationCanvas.width = targetWidth;
      if (stagingPresentationCanvas.height !== targetHeight) stagingPresentationCanvas.height = targetHeight;
      drawCtx.setTransform(1, 0, 0, 1, 0, 0);
      drawCtx.clearRect(0, 0, targetWidth, targetHeight);
      drawCtx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
      const spacesById = new Map(spaces.map((space) => [space.id, space]));
      const plainMode = !settings.blobOn || !(cachedPresentation.membrane.visible || cachedPresentation.membraneEdge.visible);
      const backgroundColour = `rgb(${cachedPalette.ground.map((value) => Math.round(value * 255)).join(" ")})`;
      let drawnPresentationCount = 0;
      for (const nucleus of nuclei) {
        const space = spacesById.get(nucleus.id);
        const appearance = cachedPresentation.byId.get(nucleus.id);
        if (!space || !appearance) continue;
        drawnPresentationCount += 1;
        const layers = projectCircleLayers(
          space,
          appearance,
          nucleus.screenR,
          cam.zoom,
          "organism"
        );
        drawOrganismCircleOverlay(drawCtx, nucleus.sx, nucleus.sy, layers, {
          spaceKind: space.kind === "void" ? "void" : "space",
          plainMode,
          backgroundColour,
          baseRadiusPx: nucleus.screenR,
        });
        const placement = settings.resources.iconPlacements.find((item) => item.targetSpaceId === nucleus.id);
        const definition = placement ? iconRegistry.get(placement.iconId) : null;
        if (placement && definition) drawSymbolPlacement(drawCtx, definition, placement, {
          x: nucleus.sx,
          y: nucleus.sy,
          radius: nucleus.screenR,
          zoom: cam.zoom,
          tint: resolveSymbolTint(placement, {
            theme,
            backgroundColor: space.kind === "void" ? appearance.void.fill.colour : appearance.cell.paint.colour,
            surfaceOpacity: space.kind === "void" ? appearance.void.fill.opacity : appearance.cell.paint.opacity,
            canvasColor: `#${cachedPalette.ground.map((value) => Math.round(value * 255).toString(16).padStart(2, "0")).join("")}`,
            voidBackground: space.kind === "void",
          }),
        });
      }
      stagingPresentationCanvas.style.visibility = "visible";
      activePresentationCanvas.style.visibility = "hidden";
      [activePresentationCanvas, stagingPresentationCanvas] = [stagingPresentationCanvas, activePresentationCanvas];
      [activePresentationCtx, stagingPresentationCtx] = [stagingPresentationCtx, activePresentationCtx];
      activePresentationCanvas.dataset.boundaryFallbackCount = "0";
      activePresentationCanvas.dataset.presentationDrawCount = String(drawnPresentationCount);
      activePresentationCanvas.dataset.presentationSourceCount = String(nuclei.length);
      presentationRenderCount += 1;
      canvas.dataset.presentationRenderCount = String(presentationRenderCount);
      return true;
    };

    /* camera-synced technical grid — cheap CSS background, render-loop offsets */
    const syncGrid = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const step = 64 * cam.zoom;
      const ox = w / 2 - cam.x * cam.zoom;
      const oy = h / 2 - cam.y * cam.zoom;
      grid.style.backgroundSize = `${step}px ${step}px`;
      grid.style.backgroundPosition = `${ox}px ${oy}px`;
    };
    const syncLabels = (nuclei: ProductionNucleus[]) => {
      const layer = labelLayerRef.current;
      if (!layer) return;
      const byId = new Map(nuclei.map((n) => [n.id, n]));
      const spacesById = new Map(spaces.slice(0, MAX_NUCLEI).map((space) => [space.id, space]));
      const symbolById = new Map(
        settings.resources.iconPlacements.map((placement) => [placement.targetSpaceId, placement])
      );
      const centroid = spaces.length
        ? spaces.reduce(
            (sum, space) => ({
              x: sum.x + space.x / spaces.length,
              y: sum.y + space.y / spaces.length,
            }),
            { x: 0, y: 0 }
          )
        : null;
      const selection = projectSelectionOverlay({
        visibleIds: nuclei.map((nucleus) => nucleus.id),
        selectedIds: [...selectedIdSet],
        primarySelectedId: selectedId,
        hoveredId,
        include: true,
      });
      layer.style.setProperty(
        "--label-scale",
        String(resolveLabelScale(settings.labelScaleMode, cam.zoom, 1))
      );
      /* Per-mode label scales for the layout system. Frame-loop CSS variables
       * only — the store is never written during pan or zoom. */
      const scales = {
        world: resolveLabelRuntimeScale("world", cam.zoom),
        adaptive: resolveLabelRuntimeScale("adaptive", cam.zoom),
        screen: 1,
      } as const;
      layer.style.setProperty("--ls-world", String(scales.world));
      layer.style.setProperty("--ls-adaptive", String(scales.adaptive));
      layer.style.setProperty("--ls-screen", "1");
      layer.querySelectorAll<HTMLElement>(".organism-label-anchor").forEach((anchor) => {
        const id = anchor.dataset.nucleusId;
        const nucleus = id ? byId.get(id) : null;
        if (!nucleus) {
          anchor.style.opacity = "0";
          anchor.style.transform = "translate(-9999px, -9999px)";
          return;
        }
        anchor.style.opacity = "1";
        anchor.style.transform = `translate(${nucleus.sx}px, ${nucleus.sy}px)`;
        const space = spacesById.get(nucleus.id);
        const appearance = cachedPresentation.byId.get(nucleus.id);
        if (!space || !appearance) return;
        const selected = selectedIdSet.has(nucleus.id);
        anchor.dataset.selected = selected ? "true" : "false";
        anchor.dataset.primary = selectedId === nucleus.id ? "true" : "false";
        anchor.dataset.ring = selection.get(nucleus.id) ?? "none";
        const keyline = anchor.querySelector<HTMLElement>(".organism-cell-keyline");
        if (keyline) {
          const editing = anchor.dataset.editing === "true";
          const keylineSize = Math.max(24, nucleus.screenR * 2 + (editing ? 14 : 10));
          keyline.style.width = `${keylineSize}px`;
          keyline.style.height = `${keylineSize}px`;
        }
        anchor.style.setProperty("--cell-r", `${nucleus.screenR.toFixed(1)}px`);
        const text = appearance.text;
        const preset = textStylePreset(text.preset);
        const resolvedLabel = getCellLabelLayout(space, settings.presentationDefaults, {
          globalScaleMode: settings.labelScaleMode,
          textSize: text.size * preset.heading.scale,
          showName: settings.annotationDetail.showName,
          showArea: settings.annotationDetail.showArea,
          showMetadata:
            settings.annotationMode === "technical" && settings.annotationDetail.showCategory,
          hasSymbol: symbolById.has(space.id),
          flagAutoDirection: resolveFlagAutoDirection(space, centroid),
        });
        const runtimeLabel = selectRuntimeLabelLayout(resolvedLabel, {
          zoom: cam.zoom,
          radiusWorld: nucleus.screenR / Math.max(cam.zoom, 0.0001),
        });
        anchor.style.setProperty("--layout-fit", runtimeLabel.fitScale.toFixed(4));
        anchor.style.setProperty("--layout-occupancy", runtimeLabel.insideOccupancy.toFixed(4));
        const compact = runtimeLabel.usedFallback ? "true" : "false";
        if (anchor.dataset.compact !== compact) anchor.dataset.compact = compact;
        const visibleBlockIds = new Set(runtimeLabel.blocks.map((block) => block.id));
        anchor.querySelectorAll<HTMLElement>("[data-block-id]").forEach((element) => {
          const inFlag = Boolean(element.closest(".organism-flag-label"));
          const hidden = inFlag || visibleBlockIds.has(element.dataset.blockId ?? "") ? "false" : "true";
          if (element.dataset.runtimeHidden !== hidden) {
            element.dataset.runtimeHidden = hidden;
          }
        });
        const divider = anchor.querySelector<HTMLElement>(".organism-layout-divider");
        if (divider) {
          divider.dataset.runtimeHidden = runtimeLabel.divider ? "false" : "true";
        }
        const arcs = new Map((runtimeLabel.ring?.arcs ?? []).map((ring) => [ring.id, ring]));
        anchor.querySelectorAll<SVGSVGElement>(".organism-ring-label").forEach((ringEl) => {
          const ring = arcs.get((ringEl.dataset.ringId ?? "") as "primary" | "secondary");
          ringEl.dataset.runtimeHidden = ring ? "false" : "true";
          if (!ring) return;
          const ringScale = resolveLabelRuntimeScale(ring.scaleMode, cam.zoom);
          const radius = Math.max(
            1,
            nucleus.screenR * ring.radiusRatio
              + (ring.orientation === "inside" ? -1 : 1) * ring.font.sizeWorld * ringScale * 0.34,
          );
          const half = (ring.arcSpanDeg * Math.PI) / 360;
          const start = { x: radius * Math.sin(-half), y: -radius * Math.cos(-half) };
          const end = { x: radius * Math.sin(half), y: -radius * Math.cos(half) };
          const path = ringEl.querySelector<SVGPathElement>(".organism-ring-path");
          const textPath = ringEl.querySelector<SVGTextPathElement>(".organism-ring-text-path");
          const sweep = ring.clockwise === ring.flipped ? 0 : 1;
          path?.setAttribute(
            "d",
            `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${ring.arcSpanDeg > 180 ? 1 : 0} ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
          );
          if (textPath && textPath.textContent !== ring.text) textPath.textContent = ring.text;
          ringEl.style.setProperty("--ring-font-world", `${ring.font.sizeWorld.toFixed(3)}px`);
          ringEl.style.setProperty("--ring-tracking", `${ring.fit.trackingEm.toFixed(4)}em`);
          ringEl.style.transform = `translate(${(ring.offsetWorld.x * ringScale).toFixed(2)}px, ${(ring.offsetWorld.y * ringScale).toFixed(2)}px) rotate(${(
            ring.startAngleDeg - (ring.flipped ? 180 : 0)
          ).toFixed(2)}deg)`;
        });
        const flagEl = anchor.querySelector<HTMLElement>(".organism-flag-label");
        if (flagEl) {
          const flag = runtimeLabel.flag;
          flagEl.dataset.runtimeHidden = flag ? "false" : "true";
          if (flag) {
            const contentHeightWorld = flag.blocks.reduce(
              (maximum, block) => Math.max(maximum, Math.abs(block.offsetWorld.y) + block.estimatedHeightWorld / 2),
              0,
            ) * 2;
            const contentWidthWorld = flag.blocks.reduce((maximum, block) => Math.max(
              maximum,
              block.segments.reduce((sum, segment) => sum + [...segment.text].length * segment.font.sizeWorld * 0.62, 0),
            ), 0);
            const geometry = resolveFlagRuntimeGeometry({
              flag,
              /* The Flag resolver works in viewport coordinates so its frame
               * clamp stays correct at every Cell position. The DOM anchor is
               * already translated to this nucleus below, therefore all
               * emitted geometry is converted back to local coordinates. */
              centre: { x: nucleus.sx, y: nucleus.sy },
              screenRadius: nucleus.screenR,
              zoom: cam.zoom,
              contentWidthWorld,
              contentHeightWorld,
              frame: { width: w, height: h },
            });
            flagEl.dataset.runtimeHidden = geometry.visible ? "false" : "true";
            flagEl.style.setProperty("--flag-scale", geometry.scale.toFixed(4));
            const local = (point: { x: number; y: number }) => ({
              x: point.x - nucleus.sx,
              y: point.y - nucleus.sy,
            });
            const localPanel = {
              ...geometry.panel,
              x: geometry.panel.x - nucleus.sx,
              y: geometry.panel.y - nucleus.sy,
            };
            const panel = flagEl.querySelector<HTMLElement>("[data-flag-panel]");
            if (panel) {
              panel.style.transform = `translate(${localPanel.x.toFixed(2)}px, ${localPanel.y.toFixed(2)}px)`;
              panel.style.width = `${localPanel.width.toFixed(2)}px`;
              panel.style.height = `${localPanel.height.toFixed(2)}px`;
              panel.style.padding = `${(flag.options.paddingY * geometry.scale).toFixed(2)}px ${(flag.options.paddingX * geometry.scale).toFixed(2)}px`;
              panel.style.borderRadius = `${(flag.options.cornerRadius * geometry.scale).toFixed(2)}px`;
              panel.style.backgroundColor = flag.options.background === "none"
                ? "transparent"
                : flag.options.background === "solid"
                  ? `color-mix(in srgb, var(--bg) ${(flag.options.backgroundOpacity * 100).toFixed(0)}%, transparent)`
                  : `color-mix(in srgb, var(--bg) ${(flag.options.backgroundOpacity * 72).toFixed(0)}%, transparent)`;
              panel.style.borderWidth = flag.options.border ? `${(flag.options.borderThickness * geometry.scale).toFixed(2)}px` : "0px";
              panel.style.borderColor = flag.options.border
                ? `color-mix(in srgb, var(--label-ink, var(--ink)) ${(flag.options.borderOpacity * 100).toFixed(0)}%, transparent)`
                : "transparent";
              panel.style.setProperty("--flag-content-gap", String(flag.options.contentGap));
            }
            const leader = flagEl.querySelector<SVGSVGElement>(".organism-flag-leader");
            const leaderPath = flagEl.querySelector<SVGPathElement>(".organism-flag-leader-path");
            const endpoint = flagEl.querySelector<SVGPathElement>(".organism-flag-endpoint");
            if (leader && leaderPath) {
              const start = local(geometry.start);
              const end = local(geometry.end);
              const elbow = geometry.elbow ? local(geometry.elbow) : null;
              const controlA = geometry.controlA ? local(geometry.controlA) : null;
              const controlB = geometry.controlB ? local(geometry.controlB) : null;
              const d = geometry.elbow
                ? `M ${start.x} ${start.y} L ${elbow?.x} ${elbow?.y} L ${end.x} ${end.y}`
                : controlA && controlB
                  ? `M ${start.x} ${start.y} C ${controlA.x} ${controlA.y} ${controlB.x} ${controlB.y} ${end.x} ${end.y}`
                  : `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
              leaderPath.setAttribute("d", d);
              leaderPath.setAttribute("stroke-width", String(flag.options.lineThickness * geometry.scale));
              leaderPath.setAttribute("stroke-opacity", String(flag.options.lineOpacity));
              leaderPath.setAttribute("stroke-dasharray", flag.options.lineStyle === "dashed" ? `${5 * geometry.scale} ${4 * geometry.scale}` : flag.options.lineStyle === "dotted" ? `${1 * geometry.scale} ${3 * geometry.scale}` : "");
              if (endpoint) {
                if (flag.options.endpoint === "dot") {
                  endpoint.setAttribute("d", `M ${start.x} ${start.y} m ${-1.6 * geometry.scale} 0 a ${1.6 * geometry.scale} ${1.6 * geometry.scale} 0 1 0 ${3.2 * geometry.scale} 0 a ${1.6 * geometry.scale} ${1.6 * geometry.scale} 0 1 0 ${-3.2 * geometry.scale} 0`);
                  endpoint.setAttribute("fill", "currentColor");
                  endpoint.setAttribute("stroke", "none");
                } else if (flag.options.endpoint === "bar") {
                  const dx = -geometry.vector.y * 3 * geometry.scale;
                  const dy = geometry.vector.x * 3 * geometry.scale;
                  endpoint.setAttribute("d", `M ${(start.x - dx).toFixed(2)} ${(start.y - dy).toFixed(2)} L ${(start.x + dx).toFixed(2)} ${(start.y + dy).toFixed(2)}`);
                  endpoint.setAttribute("fill", "none");
                  endpoint.setAttribute("stroke", "currentColor");
                  endpoint.setAttribute("stroke-width", String(Math.max(1, flag.options.lineThickness * geometry.scale)));
                } else if (flag.options.endpoint === "arrow") {
                  const angle = Math.atan2(geometry.vector.y, geometry.vector.x);
                  const tip = start;
                  const left = {
                    x: tip.x + Math.cos(angle + 2.55) * 6 * geometry.scale,
                    y: tip.y + Math.sin(angle + 2.55) * 6 * geometry.scale,
                  };
                  const right = {
                    x: tip.x + Math.cos(angle - 2.55) * 6 * geometry.scale,
                    y: tip.y + Math.sin(angle - 2.55) * 6 * geometry.scale,
                  };
                  endpoint.setAttribute("d", `M ${tip.x} ${tip.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`);
                  endpoint.setAttribute("fill", "currentColor");
                  endpoint.setAttribute("stroke", "none");
                } else {
                  endpoint.setAttribute("d", "");
                }
              }
            }
          }
        }
      });
    };

    const activation = createCellActivationState();
    let hoveredId: string | null = null;

    const onDown = (e: PointerEvent) => {
      if (!runtimeActive) return;
      const middleButtonPan = e.button === 1;
      if ((e.button !== 0 && !middleButtonPan) || (e.ctrlKey && e.pointerType === "mouse")) return;
      const stateAtPress = useLab.getState();
      const activeAuthoring = stateAtPress.connectionAuthoring;
      const { sx, sy } = local(e);
      clearHoveredConnection();
      const temporaryPan = middleButtonPan || stateAtPress.temporaryTool === "pan";
      let connectionPort: ConnectionPort | null = null;
      if (stateAtPress.connectionModeActive && stateAtPress.settings.connectionView.visible) {
        connectionPorts = projectConnectionPorts();
        connectionPort = hitConnectionPort(connectionPorts, { x: sx, y: sy }, CONNECTION_PORT_HIT_RADIUS_PX);
      }
      const connectionPressIntent = e.button === 0 && connectionPort
        ? "connection"
        : resolveConnectionPressIntent({
        modeActive: stateAtPress.connectionModeActive,
        layerVisible: stateAtPress.settings.connectionView.visible,
        hasPort: Boolean(connectionPort),
        sourceId: activeAuthoring.sourceId,
        temporaryPan,
      });
      if (connectionPressIntent === "connection") {
          e.preventDefault();
          resetCellActivation(activation);
          cancelCanvasGesture(gesture);
          camTarget = null;
          connectionDragPointerId = e.pointerId;
          connectionDragStart = { sx, sy };
          connectionDragMoved = false;
          connectionAutoPanMoved = false;
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch {
            // Synthetic/stale pointer ids still support the local gesture.
          }
          if (!activeAuthoring.sourceId && connectionPort) stateAtPress.chooseConnectionSource(connectionPort.spaceId);
          connectionAuthoring = useLab.getState().connectionAuthoring;
          connectionAuthoringPreviewRef.current = connectionAuthoring;
          updateConnectionPreview(sx, sy);
          canvas.style.cursor = "crosshair";
          invalidate("CELL_PRESENTATION");
          return;
      }
      if (temporaryPan) {
        e.preventDefault();
        resetCellActivation(activation);
        cancelCanvasGesture(gesture);
        camTarget = null;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          // Synthetic/stale pointer ids still support the local gesture.
        }
        beginCanvasPanGesture(gesture, { sx, sy }, cam);
        canvas.style.cursor = "grabbing";
        performanceGovernor.beginInteraction();
        invalidate("CAMERA");
        return;
      }
      if (!stateAtPress.connectionModeActive && isConnectionAuthoringActive(activeAuthoring)) {
        e.preventDefault();
        resetCellActivation(activation);
        cancelCanvasGesture(gesture);
        connectionPreviewPointer = { sx, sy };
        const hit = hitTestNuclei(lastNuclei, sx, sy);
        if (hit) {
          const state = useLab.getState();
          if (activeAuthoring.sourceId) state.completeConnectionAuthoring(hit.id);
          else state.chooseConnectionSource(hit.id);
          connectionAuthoring = useLab.getState().connectionAuthoring;
          connectionAuthoringPreviewRef.current = connectionAuthoring;
        }
        if (isConnectionAuthoringActive(connectionAuthoring)) updateConnectionPreview(sx, sy);
        else hideConnectionPreview();
        canvas.style.cursor = "crosshair";
        return;
      }
      if (isInlineEditorCommitPointer(e)) {
        resetCellActivation(activation);
        return;
      }
      camTarget = null;
      let connectionHit: string | null = null;
      if (stateAtPress.settings.connectionView.visible) {
        recordConnectionHitTest();
        connectionHit = hitTestConnections(connectionProjection.hitIndex, { x: sx, y: sy }, CONNECTION_HIT_TOLERANCE_PX);
      }
      if (connectionHit) {
        e.preventDefault();
        resetCellActivation(activation);
        cancelCanvasGesture(gesture);
        stateAtPress.selectConnection(connectionHit, e.shiftKey);
        canvas.style.cursor = "pointer";
        invalidate("CONNECTIONS");
        return;
      }
      const hit = hitTestNuclei(lastNuclei, sx, sy);
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic/stale pointer ids still work without capture.
      }
      if (hit) {
        const state = useLab.getState();
        const pressIntent = resolveSelectionIntent(e);
        const selection = resolveCanvasPressSelection(state.selectedIds, hit.id, pressIntent);
        const source = spaces.find((space) => space.id === hit.id);
        if (!source) return;
        if (selection.action === "add") state.addToSelection(hit.id);
        else if (selection.action === "replace") state.replaceSelection(hit.id);
        beginCanvasCellGesture(
          gesture,
          { sx, sy },
          { id: hit.id, x: source.x, y: source.y },
          createGroupTranslation(spaces, selection.selectedIds, hit.id),
          pressIntent,
        );
        pulseCameraShake(cameraShake, cameraShakeSettings(), {
          x: sx - hit.sx,
          y: sy - hit.sy,
        });
        canvas.style.cursor = "grabbing";
      } else {
        resetCellActivation(activation);
        beginCanvasPanGesture(gesture, { sx, sy }, cam);
        if (selectedIdSet.size > 0) useLab.getState().clearSelection();
        canvas.style.cursor = "grabbing";
        performanceGovernor.beginInteraction();
      }
      hoveredId = hit?.id ?? null;
      invalidate("CELL_PRESENTATION");
    };

    const processMove = (e: PointerEvent) => {
      const { sx, sy } = local(e);
      if (connectionDragPointerId === e.pointerId) {
        if (connectionDragStart && Math.hypot(sx - connectionDragStart.sx, sy - connectionDragStart.sy) > 4) {
          connectionDragMoved = true;
        }
        updateConnectionPreview(sx, sy);
        connectionAutoPan = resolveConnectionAutoPan({ x: sx, y: sy }, { x: 0, y: 0, width: w, height: h });
        renderLoop?.setContinuous(resolved.motionActive || connectionAutoPan.dx !== 0 || connectionAutoPan.dy !== 0);
        invalidate(connectionAutoPan.dx !== 0 || connectionAutoPan.dy !== 0 ? "CAMERA" : "CELL_PRESENTATION");
        canvas.style.cursor = "crosshair";
        return;
      }
      let hoveredPort: ConnectionPort | null = null;
      if (connectionModeActive && connectionLayerVisible && gesture.mode === "none") {
        updateConnectionPreview(sx, sy);
        hoveredPort = hitConnectionPort(connectionPorts, { x: sx, y: sy }, CONNECTION_PORT_HIT_RADIUS_PX);
        if (connectionAuthoring.sourceId && gesture.mode === "none") {
          canvas.style.cursor = "crosshair";
          return;
        }
      }
      if (gesture.mode === "none") {
        let nextHoveredConnectionId: string | null = null;
        if (connectionLayerVisible) {
          recordConnectionHitTest();
          nextHoveredConnectionId = hitTestConnections(
            connectionProjection.hitIndex,
            { x: sx, y: sy },
            CONNECTION_HIT_TOLERANCE_PX,
          );
        }
        const nextHoveredId = nextHoveredConnectionId
          ? null
          : hitTestNuclei(lastNuclei, sx, sy)?.id ?? null;
        if (nextHoveredId !== hoveredId) {
          hoveredId = nextHoveredId;
          invalidate("CELL_PRESENTATION");
        }
        if (nextHoveredConnectionId !== hoveredConnectionId) {
          hoveredConnectionId = nextHoveredConnectionId;
          drawConnectionEditingOverlay();
        }
        canvas.style.cursor = hoveredPort ? "crosshair" : nextHoveredId ? "grab" : hoveredConnectionId ? "pointer" : "default";
        return;
      }
      const transition = advanceCanvasGesture(gesture, { sx, sy }, CELL_DRAG_THRESHOLD_PX);
      if (transition.enteredDrag) {
        performanceGovernor.beginInteraction();
        useLab.getState().closeContextSurface();
        if (gesture.drag && gesture.pressIntent === "toggle") {
          const state = useLab.getState();
          state.toggleSelection(gesture.drag.id);
          const selected = useLab.getState();
          if (!selected.selectedIds.includes(gesture.drag.id)) state.replaceSelection(gesture.drag.id);
        }
      }
      if (gesture.mode === "drag" && gesture.drag) {
        nudgeCameraShakeForDrag(cameraShake, cameraShakeSettings(), {
          x: e.movementX,
          y: e.movementY,
        });
        const dragId = gesture.drag.id;
        const world = screenToWorld(sx, sy, cam, w, h);
        const translation = gesture.groupTranslation;
        const origin = translation?.before.find((position) => position.id === dragId);
        if (!translation || !origin) return;
        /* One anchor-to-pointer delta avoids drift and is inverted once for
           the visual organism layout transform before every member moves. */
        const delta = dragDeltaWorldToStore(
          world.x - screenToWorld(gesture.press?.sx ?? sx, gesture.press?.sy ?? sy, cam, w, h).x,
          world.y - screenToWorld(gesture.press?.sx ?? sx, gesture.press?.sy ?? sy, cam, w, h).y,
          resolved.adapter
        );
        gesture.translatedPositions = resolveGroupTranslationPositions(translation, delta);
        const primary = gesture.translatedPositions.find((position) => position.id === dragId);
        if (!primary) return;
        gesture.drag.x = primary.x;
        gesture.drag.y = primary.y;
      } else if (gesture.mode === "pan" && gesture.pan) {
        const nextCamera = resolveCanvasPanCamera(gesture, { sx, sy }, cam.zoom);
        if (nextCamera) Object.assign(cam, nextCamera);
      }
      invalidate(gesture.mode === "drag" ? "MEMBRANE_FIELD" : gesture.mode === "pan" ? "CAMERA" : "CELL_PRESENTATION");
    };

    const moveScheduler = createFrameScheduler<PointerEvent>({
      schedule: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      process: processMove,
    });

    const onMove = (e: PointerEvent) => {
      if (!runtimeActive) return;
      moveScheduler.push(latestCoalescedPointerEvent(e));
    };

    const onLeave = () => {
      if (connectionDragPointerId !== null || gesture.mode !== "none") return;
      const hadCellHover = hoveredId !== null;
      hoveredId = null;
      clearHoveredConnection();
      if (hadCellHover) invalidate("CELL_PRESENTATION");
      canvas.style.cursor = connectionModeActive ? "crosshair" : "default";
    };

    const onUp = (e: PointerEvent) => {
      if (!runtimeActive) return;
      if (connectionDragPointerId === e.pointerId) {
        moveScheduler.push(latestCoalescedPointerEvent(e));
        moveScheduler.flush();
        const { sx, sy } = local(e);
        const state = useLab.getState();
        const sourceId = state.connectionAuthoring.sourceId;
        connectionPorts = projectConnectionPorts();
        const port = hitConnectionPort(connectionPorts, { x: sx, y: sy }, CONNECTION_PORT_HIT_RADIUS_PX);
        const nucleusHit = hitTestNuclei(lastNuclei, sx, sy);
        const moved = connectionDragMoved;
        const autoPanMoved = connectionAutoPanMoved;
        const decision = resolveConnectionRelease({
          sourceId,
          port,
          nucleusId: nucleusHit?.id ?? null,
          moved,
        });
        if (decision.kind === "commit" || decision.kind === "invalid") {
          state.completeConnectionAuthoring(decision.targetId);
        } else if (decision.kind === "cancel") {
          state.cancelConnectionGesture("Connection cancelled. Choose a source Cell.");
        }
        finalizeConnectionPointer();
        connectionAuthoring = useLab.getState().connectionAuthoring;
        connectionAuthoringPreviewRef.current = connectionAuthoring;
        updateConnectionPreview(sx, sy);
        canvas.style.cursor = "crosshair";
        invalidate(autoPanMoved ? "CAMERA" : "CELL_PRESENTATION");
        return;
      }
      const completedMode = gesture.mode;
      if (gesture.mode !== "none") {
        moveScheduler.push(latestCoalescedPointerEvent(e));
        moveScheduler.flush();
      }
      const { sx, sy } = local(e);
      const completed = completeCanvasGesture(gesture);
      if (completed.mode === "press" && completed.drag) {
        const state = useLab.getState();
        if (completed.pressIntent === "toggle") {
          state.toggleSelection(completed.drag.id);
          resetCellActivation(activation);
        } else {
          state.replaceSelection(completed.drag.id);
          if (registerCellActivation(activation, completed.drag.id, sx, sy, performance.now(), false)) {
            const nucleus = lastNuclei.find((candidate) => candidate.id === completed.drag?.id);
            const client = projectClientPoint(
              nucleus ? { x: nucleus.sx, y: nucleus.sy } : { x: sx, y: sy },
              canvas.getBoundingClientRect()
            );
            state.openContextSurface("inline-editor", { x: client.x + 14, y: client.y + 18 }, completed.drag.id);
          }
        }
      } else
      if (completed.mode === "drag" && completed.drag) {
        if (completed.groupTranslation && completed.translatedPositions.length > 0) {
          useLab.getState().commitSpaceTransform(completed.groupTranslation.before, completed.translatedPositions);
        }
        registerCellActivation(activation, completed.drag.id, sx, sy, performance.now(), true);
      } else if (completed.mode === "pan") {
        commitCamera();
      }
      if (completed.mode === "pan" && connectionModeActive) updateConnectionPreview(sx, sy);
      canvas.style.cursor = connectionModeActive ? "crosshair" : "default";
      performanceGovernor.endInteraction();
      invalidate(completedMode === "drag" ? "MEMBRANE_FIELD" : completedMode === "pan" ? "CAMERA" : "CELL_PRESENTATION");
    };

    const onCancel = (e: PointerEvent) => {
      if (!runtimeActive) return;
      if (connectionDragPointerId === e.pointerId) {
        const autoPanMoved = connectionAutoPanMoved;
        useLab.getState().cancelConnectionGesture();
        finalizeConnectionPointer();
        connectionAuthoring = useLab.getState().connectionAuthoring;
        connectionAuthoringPreviewRef.current = connectionAuthoring;
        drawConnectionEditingOverlay();
        canvas.style.cursor = "crosshair";
        invalidate(autoPanMoved ? "CAMERA" : "CELL_PRESENTATION");
        return;
      }
      const cancelledMode = gesture.mode;
      if (cancelledMode === "pan" && gesture.pan) Object.assign(cam, gesture.pan.camera);
      cancelCanvasGesture(gesture);
      canvas.style.cursor = "default";
      performanceGovernor.endInteraction();
      invalidate(cancelledMode === "pan" ? "CAMERA" : "CELL_PRESENTATION");
    };

    const onLostConnectionPointerCapture = (e: PointerEvent) => {
      if (connectionDragPointerId !== e.pointerId) return;
      const autoPanMoved = connectionAutoPanMoved;
      finalizeConnectionPointer();
      const state = useLab.getState();
      if (state.connectionModeActive) state.cancelConnectionGesture("Connection gesture cancelled. Choose a source Cell.");
      connectionAuthoring = useLab.getState().connectionAuthoring;
      connectionAuthoringPreviewRef.current = connectionAuthoring;
      drawConnectionEditingOverlay();
      canvas.style.cursor = connectionModeActive ? "crosshair" : "default";
      invalidate(autoPanMoved ? "CAMERA" : "CELL_PRESENTATION");
    };

    const onContextMenu = (e: MouseEvent) => {
      if (!runtimeActive) return;
      e.preventDefault();
      const secondaryButton = e.ctrlKey ? 2 : e.button;
      if (!shouldOpenContextFromGesture(secondaryButton, gesture.mode === "drag")) return;
      cancelCanvasGesture(gesture);
      resetCellActivation(activation);
      const { sx, sy } = local(e);
      const hit = hitTestNuclei(lastNuclei, sx, sy);
      const state = useLab.getState();
      if (hit) {
        if (state.selectedIds.includes(hit.id)) state.addToSelection(hit.id);
        else state.replaceSelection(hit.id);
        state.openContextSurface(
          resolveContextSurface(hit.id),
          projectClientPoint({ x: hit.sx, y: hit.sy }, canvas.getBoundingClientRect()),
          hit.id
        );
      } else {
        state.openContextSurface(resolveContextSurface(null), { x: e.clientX, y: e.clientY }, null);
      }
      canvas.style.cursor = "default";
      performanceGovernor.endInteraction();
      invalidate("CELL_PRESENTATION");
    };

    type WheelFrame = { deltaY: number; sx: number; sy: number };
    const processWheel = ({ deltaY, sx, sy }: WheelFrame) => {
      camTarget = null;
      const before = screenToWorld(sx, sy, cam, w, h);
      cam.zoom = clamp(cam.zoom * Math.exp(-deltaY * 0.0016), Z_MIN, Z_MAX);
      cam.x = before.x - (sx - w / 2) / cam.zoom;
      cam.y = before.y - (sy - h / 2) / cam.zoom;
      commitCamera();
      invalidate("CAMERA");
    };
    const wheelScheduler = createFrameScheduler<WheelFrame>({
      schedule: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      process: processWheel,
      merge: mergeCanvasWheelFrame,
    });
    const onWheel = (e: WheelEvent) => {
      if (!runtimeActive) return;
      e.preventDefault();
      if (connectionDragPointerId !== null) return;
      performanceGovernor.beginInteraction();
      clearHoveredConnection();
      const { sx, sy } = local(e);
      wheelScheduler.push({ deltaY: e.deltaY, sx, sy });
      performanceGovernor.endInteraction();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onCancel);
    canvas.addEventListener("lostpointercapture", onLostConnectionPointerCapture);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", onContextMenu);

    let firstUsableFrame = false;
    let rendererFailed = false;
    let last = performance.now();
    renderLoop = createDemandFrameLoop({
      schedule: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      render: (now) => {
      if (rendererFailed) return false;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
      last = now;

      if (camTarget) {
        const t = camTarget;
        cam.x += (t.x - cam.x) * 0.18;
        cam.y += (t.y - cam.y) * 0.18;
        cam.zoom += (t.zoom - cam.zoom) * 0.18;
        if (
          Math.abs(t.zoom - cam.zoom) < 0.002 &&
          Math.abs(t.x - cam.x) * cam.zoom < 0.5 &&
          Math.abs(t.y - cam.y) * cam.zoom < 0.5
        ) {
          Object.assign(cam, t);
          camTarget = null;
        }
        dirty = true;
        connectionNeedsRender = true;
      }

      if (connectionAutoPan.dx !== 0 || connectionAutoPan.dy !== 0) {
        const autoPanDelta = resolveConnectionAutoPanDelta(connectionAutoPan, dt, cam.zoom);
        cam.x += autoPanDelta.dx;
        cam.y += autoPanDelta.dy;
        connectionAutoPanMoved = true;
        dirty = true;
        membraneNeedsRender = true;
        connectionNeedsRender = true;
      }

      /* Camera zoom can cross a bounded low-detail sampling bucket without
       * mutating project state. Reallocate only when the density meaningfully
       * changes; the renderer itself no-ops unchanged target dimensions. */
      if (Math.abs(resolveMembraneSamplingScale(resolved.membraneDetail, cam.zoom) - lastMembraneSamplingScale) >= 0.01) {
        resizeTarget();
      }

      if (derivedDirty) refreshDerived();
      if (resolved.motionActive) advanceMotion(motionState, dt, resolved.adapter.timeScale);
      const shakeActive = advanceCameraShake(cameraShake, cameraShakeSettings(), dt, { selected: selectedIdSet.size > 0 });
      applyCameraShakeOffset();
      const nuclei = currentNuclei();
      lastNuclei = nuclei;
      drawConnectionBase(nuclei);
      if (connectionModeActive && connectionLayerVisible && connectionPreviewPointer) {
        updateConnectionPreview(connectionPreviewPointer.sx, connectionPreviewPointer.sy);
      } else if (connectionLayerVisible && (connectionModeActive || selectedConnectionIdSet.size > 0 || hoveredConnectionId !== null)) drawConnectionEditingOverlay();
      else hideConnectionPreview();
      const sc = cachedStyle;
      const palette = cachedPalette;
      const params = resolved.params;
      const eff = cachedField;
      const membranePresentationActive = settings.blobOn
        && (cachedPresentation.membrane.visible || cachedPresentation.membraneEdge.visible);
      const gates = resolveRuntimeGates({
        membraneVisible: membranePresentationActive,
        membraneEdgeVisible: settings.blobOn && cachedPresentation.membraneEdge.visible,
        shadowEnabled: cachedShadow.enabled,
        motionEnabled: resolved.motionActive,
        labelsVisible: settings.organism.showLabels && settings.annotationMode !== "hidden",
        gridVisible: settings.showGrid,
        interactionActive: gesture.mode === "drag" || connectionDragPointerId !== null,
        snappingEnabled: false,
      });
      const membraneField = gates.membrane ? projectMembraneField({
        membrane: cachedPresentation.membrane,
        paletteBodyHex: palette.bodyHex,
        paletteBodyBHex: palette.bodyBHex,
        membraneEdgeColour: cachedPresentation.membraneEdge.paint.colour,
        paletteBlend: palette.blend,
      }) : { bodyHex: palette.bodyHex, bodyBHex: palette.bodyBHex, accentHex: cachedPresentation.membraneEdge.paint.colour, colorMix: 0, spatialColorMix: 0 as const };
      const bodyTarget = hexToRgb01(membraneField.bodyHex);
      const bodyBTarget = hexToRgb01(membraneField.bodyBHex);
      const accentTarget = hexToRgb01(membraneField.accentHex);
      const colorMixTarget = membraneField.colorMix;
      const morphPresentationActive = membranePresentationActive;

      if (!smooth) {
        smooth = {
          mass: params.mass,
          iso: params.isoLevel,
          softness: params.edgeSoftness,
          tension: eff.tension,
          bias: eff.bias,
          pocketIso: params.pocketThreshold,
          pocketSoft: params.pocketSoftness,
          pocketAmount: sc.pocketAmount,
          dots: 0,
          body: [bodyTarget[0], bodyTarget[1], bodyTarget[2]],
          bodyB: [bodyBTarget[0], bodyBTarget[1], bodyBTarget[2]],
          bg: [palette.ground[0], palette.ground[1], palette.ground[2]],
          accent: [accentTarget[0], accentTarget[1], accentTarget[2]],
          colorMix: colorMixTarget,
        };
      }

      const themeTransitionActive = themeTransitionUntil > 0 && now < themeTransitionUntil;
      const kNum = expK(10, dt);
      const kCol = expK(themeTransitionActive ? 18 : 3.4, dt);
      // Core is per-Cell presentation, so the bounded Canvas2D adapter owns it.
      const dotsTarget = 0;
      smooth.mass += (params.mass - smooth.mass) * kNum;
      smooth.iso += (params.isoLevel - smooth.iso) * kNum;
      smooth.softness += (params.edgeSoftness - smooth.softness) * kNum;
      smooth.tension += (eff.tension - smooth.tension) * kNum;
      smooth.bias += (eff.bias - smooth.bias) * kNum;
      smooth.pocketIso += (params.pocketThreshold - smooth.pocketIso) * kNum;
      smooth.pocketSoft += (params.pocketSoftness - smooth.pocketSoft) * kNum;
      smooth.pocketAmount += (sc.pocketAmount - smooth.pocketAmount) * kCol;
      smooth.dots += (dotsTarget - smooth.dots) * kCol;
      let settling = false;
      for (let i = 0; i < 3; i++) {
        smooth.body[i] += (bodyTarget[i] - smooth.body[i]) * kCol;
        smooth.bodyB[i] += (bodyBTarget[i] - smooth.bodyB[i]) * kCol;
        smooth.bg[i] += (palette.ground[i] - smooth.bg[i]) * kCol;
        smooth.accent[i] += (accentTarget[i] - smooth.accent[i]) * kCol;
        settling = settling || Math.abs(bodyTarget[i] - smooth.body[i]) > 0.002;
        settling = settling || Math.abs(bodyBTarget[i] - smooth.bodyB[i]) > 0.002;
        settling = settling || Math.abs(palette.ground[i] - smooth.bg[i]) > 0.002;
        settling = settling || Math.abs(accentTarget[i] - smooth.accent[i]) > 0.002;
      }
      smooth.colorMix += (colorMixTarget - smooth.colorMix) * kCol;
      if (themeTransitionUntil > 0 && now >= themeTransitionUntil) {
        smooth.body = [bodyTarget[0], bodyTarget[1], bodyTarget[2]];
        smooth.bodyB = [bodyBTarget[0], bodyBTarget[1], bodyBTarget[2]];
        smooth.bg = [palette.ground[0], palette.ground[1], palette.ground[2]];
        smooth.accent = [accentTarget[0], accentTarget[1], accentTarget[2]];
        smooth.colorMix = colorMixTarget;
        themeTransitionUntil = 0;
      }
      settling =
        settling ||
        Math.abs(colorMixTarget - smooth.colorMix) > 0.002 ||
        Math.abs(eff.tension - smooth.tension) > 0.002 ||
        Math.abs(eff.bias - smooth.bias) > 0.002 ||
        Math.abs(params.edgeSoftness - smooth.softness) > 0.002 ||
        Math.abs(params.mass - smooth.mass) > 0.002 ||
        Math.abs(params.isoLevel - smooth.iso) > 0.002 ||
        Math.abs(params.pocketThreshold - smooth.pocketIso) > 0.01 ||
        Math.abs(params.pocketSoftness - smooth.pocketSoft) > 0.002 ||
        Math.abs(dotsTarget - smooth.dots) > 0.002;

      dirty = false;
      if (gates.labels) syncLabels(nuclei);
      if (gates.grid) syncGrid();

      nucleiBuf.fill(0);
      nucleusColorsBuf.fill(0);
      const count = Math.min(nuclei.length, MAX_NUCLEI);
      colorGeneration += 1;
      for (let i = 0; i < count; i++) {
        const n = nuclei[i];
        const o = i * 4;
        nucleiBuf[o] = n.fx;
        nucleiBuf[o + 1] = n.fy;
        nucleiBuf[o + 2] = n.r;
        const cellVisible = cachedPresentation.byId.get(n.id)?.cell.visible ?? true;
        nucleiBuf[o + 3] = !morphPresentationActive && n.kind === "space" && !cellVisible ? 0 : n.strength;
        if (n.kind === "space") {
          const parsed = /^#[0-9a-f]{6}$/i.test(n.color) ? Number.parseInt(n.color.slice(1), 16) : 0x777a79;
          const tr = ((parsed >> 16) & 255) / 255;
          const tg = ((parsed >> 8) & 255) / 255;
          const tb = (parsed & 255) / 255;
          let sm = smoothNucleusColors.get(n.id);
          if (!sm) {
            sm = { r: tr, g: tg, b: tb, seen: colorGeneration };
            smoothNucleusColors.set(n.id, sm);
          } else {
            sm.seen = colorGeneration;
            sm.r += (tr - sm.r) * kCol;
            sm.g += (tg - sm.g) * kCol;
            sm.b += (tb - sm.b) * kCol;
            settling = settling || Math.abs(tr - sm.r) + Math.abs(tg - sm.g) + Math.abs(tb - sm.b) > 0.004;
          }
          const co = i * 3;
          nucleusColorsBuf[co] = sm.r;
          nucleusColorsBuf[co + 1] = sm.g;
          nucleusColorsBuf[co + 2] = sm.b;
        }
      }
      for (const [id, color] of smoothNucleusColors) if (color.seen !== colorGeneration) smoothNucleusColors.delete(id);
      frame.count = count;
      frame.mass = smooth.mass;
      frame.iso = smooth.iso;
      frame.softness = smooth.softness;
      frame.tension = smooth.tension;
      frame.bias = smooth.bias;
      frame.pocketIso = smooth.pocketIso;
      frame.pocketSoft = smooth.pocketSoft;
      frame.pocketAmount = smooth.pocketAmount;
      frame.bodyColor = smooth.body;
      frame.bodyColorB = smooth.bodyB;
      frame.bgColor = smooth.bg;
      frame.accentColor = smooth.accent;
      frame.colorMix = smooth.colorMix;
      frame.spatialColorMix = membraneField.spatialColorMix;
      frame.nucleusDots = smooth.dots;
      frame.membraneOpacity = cachedPresentation.membrane.visible
        ? cachedPresentation.membrane.paint.opacity
        : 0;
      if (gates.membraneEdge) {
        frame.membraneEdgeOpacity = cachedPresentation.membraneEdge.paint.opacity;
        frame.membraneEdgeWidth = Math.max(0.5, cachedPresentation.membraneEdge.width * cam.zoom);
        frame.membraneEdgeSoftness = cachedPresentation.membraneEdge.softness;
      } else {
        frame.membraneEdgeOpacity = 0;
        frame.membraneEdgeWidth = 0;
        frame.membraneEdgeSoftness = 0;
      }
      frame.fieldDebug = params.showFieldDebug;
      const debugPresentation = projectOrganismDebugPresentation(params.showNucleiDebug);
      frame.nucleiDebug = debugPresentation.rings;
      frame.nucleiDebugCenterDots = debugPresentation.centreDots;
      const shadow = cachedShadow;
      frame.morphEnabled = morphPresentationActive;
      frame.shadowEnabled = gates.shadow;
      if (frame.shadowEnabled) {
        frame.shadowColor = hexToRgb01(
          shadow.colorMode === "custom" ? shadow.color : theme === "night" ? "#000000" : "#222222"
        );
        frame.shadowOpacity = shadow.opacity;
        frame.shadowSoftness = shadow.softness / Math.max(1, Math.min(w, h) / 2);
        frame.shadowOffset = [
          shadow.offsetX / Math.max(1, Math.min(w, h) / 2),
          -shadow.offsetY / Math.max(1, Math.min(w, h) / 2),
        ];
        frame.shadowSpread = shadow.spread / Math.max(1, Math.min(w, h) / 2);
      } else {
        frame.shadowOpacity = 0;
        frame.shadowSoftness = 0;
        frame.shadowOffset = [0, 0];
        frame.shadowSpread = 0;
      }
      if (!firstUsableFrame) announceReadiness("render-requested");
      try {
        const shouldRenderMembrane = gates.membrane && (membraneNeedsRender
          || settling
          || !!camTarget
          || connectionAutoPan.dx !== 0
          || connectionAutoPan.dy !== 0
          || resolved.motionActive
          || motionState.settling);
        if (shouldRenderMembrane) {
          renderer?.render(frame);
          membraneRenderCount += 1;
          canvas.dataset.membraneRenderCount = String(membraneRenderCount);
          canvas.dataset.membraneRenderReason = lastInvalidationScope;
          membraneNeedsRender = false;
          surfaceNeedsClear = false;
        } else if (!gates.membrane && surfaceNeedsClear) {
          renderer?.clear();
          membraneClearCount += 1;
          canvas.dataset.membraneClearCount = String(membraneClearCount);
          membraneNeedsRender = false;
          surfaceNeedsClear = false;
        } else {
          renderer?.present();
        }
        if (!drawPresentationOverlay(nuclei, presentationPixelRatio)) {
          throw new Error("Organism presentation surface unavailable");
        }
        performanceRuntime.reportFrame({
          renderer: "organism",
          timestamp: now,
          visibleCells: count,
          totalCells: spaces.length,
        });
        performanceReportCount += 1;
        canvas.dataset.performanceReportCount = String(performanceReportCount);
        canvas.dataset.lastRenderedTheme = theme;
        if (!firstUsableFrame) {
          firstUsableFrame = true;
          announceReadiness("ready");
        }
        if (resumePreparationPending) {
          resumePreparationPending = false;
          resumePreparationCount += 1;
          canvas.dataset.resumePreparationCount = String(resumePreparationCount);
          onResumeReadyRef.current?.();
        }
      } catch {
        rendererFailed = true;
        announceReadiness("renderer-ready");
      }
      if (gates.membrane && (settling || !!camTarget || resolved.motionActive || motionState.settling)) {
        membraneNeedsRender = true;
      }
      const needsAnotherFrame = !rendererFailed && (
        dirty ||
        settling ||
        !!camTarget ||
        connectionAutoPan.dx !== 0 ||
        connectionAutoPan.dy !== 0 ||
        resolved.motionActive ||
        motionState.settling ||
        shakeActive
      );
      connectionInstrumentation.setSleeping(connectionLayerVisible ? !needsAnotherFrame && !connectionNeedsRender : true);
      publishConnectionMetrics();
      return !rendererFailed && needsAnotherFrame;
      },
    });
    const setRuntimeActive = (nextActive: boolean) => {
      if (runtimeActive === nextActive) return;
      runtimeActive = nextActive;
      if (!runtimeActive) {
        finalizeConnectionPointer();
        hideConnectionPreview();
        connectionCanvas.style.visibility = "hidden";
        resumePreparationPending = false;
        renderLoop?.setPaused(true);
        moveScheduler.cancel();
        wheelScheduler.cancel();
        cancelCanvasGesture(gesture);
        resetCameraShake(cameraShake);
        applyCameraShakeOffset();
        performanceGovernor.endInteraction();
        connectionInstrumentation.setSleeping(true);
        publishConnectionMetrics();
        return;
      }

      const latestState = pendingStoreState ?? useLab.getState();
      pendingStoreState = null;
      applyStoreSnapshot(latestState, true);
      const latestPerformanceSnapshot = pendingPerformanceSnapshot ?? performanceGovernor.getSnapshot();
      pendingPerformanceSnapshot = null;
      applyPerformanceSnapshot(latestPerformanceSnapshot, true);
      reducedMotion = pendingReducedMotion ?? reducedMotionQuery.matches;
      pendingReducedMotion = null;
      updateResolvedOrganism(resolveOrganism(settings, reducedMotion));
      theme = pendingTheme ?? readTheme();
      pendingTheme = null;
      themeTransitionUntil = 0;
      const latestDimensions = pendingDimensions ?? {
        width: host.clientWidth,
        height: host.clientHeight,
      };
      pendingDimensions = null;
      applyDimensions(latestDimensions);
      smooth = null;
      smoothNucleusColors.clear();
      derivedDirty = true;
      dirty = true;
      membraneNeedsRender = true;
      connectionNeedsRender = true;
      last = performance.now();
      resumePreparationPending = true;
      renderLoop?.invalidate();
      renderLoop?.setPaused(false);
    };
    runtimeActivityRef.current = setRuntimeActive;
    if (!runtimeActive) renderLoop.setPaused(true);
    renderLoop.setContinuous(resolved.motionActive || connectionAutoPan.dx !== 0 || connectionAutoPan.dy !== 0);
    if (runtimeActive) renderLoop.invalidate();

    return () => {
      if (runtimeActivityRef.current === setRuntimeActive) runtimeActivityRef.current = null;
      renderLoop?.cancel();
      moveScheduler.cancel();
      wheelScheduler.cancel();
      unsub();
      unsubGovernor();
      mo.disconnect();
      ro.disconnect();
      reducedMotionQuery.removeEventListener("change", onReducedMotion);
      unregisterCapture();
      renderer?.dispose();
      resetCameraShake(cameraShake);
      finalizeConnectionPointer(false);
      hideConnectionPreview();
      applyCameraShakeOffset();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("lostpointercapture", onLostConnectionPointerCapture);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
      performanceGovernor.endInteraction();
    };
  }, []);

  useLayoutEffect(() => {
    runtimeActivityRef.current?.(active);
  }, [active]);

  return (
    <div ref={hostRef} className="organism-canvas-host">
      <canvas ref={canvasRef} className="organism-canvas" data-preview-filter="smooth" data-testid="organism-canvas" />
      <div ref={gridRef} className="organism-grid" data-visible={showGrid ? "true" : "false"} aria-hidden="true" />
      <canvas
        ref={connectionCanvasRef}
        className="organism-connection-canvas"
        data-testid="connection-base-layer"
        aria-hidden="true"
      />
      <canvas
        ref={presentationCanvasRef}
        className="organism-presentation-canvas"
        data-testid="organism-presentation-canvas"
        aria-hidden="true"
      />
      <canvas
        ref={presentationBackCanvasRef}
        className="organism-presentation-canvas organism-presentation-buffer"
        aria-hidden="true"
      />
      <canvas
        ref={connectionEditingCanvasRef}
        className="organism-connection-editing-canvas"
        data-testid="connection-editing-overlay"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          visibility: "hidden",
        }}
      />
      {showLabels && annotationMode !== "hidden" && <div
        ref={labelLayerRef}
        className="organism-label-layer"
        data-mode={annotationMode}
        data-position={annotationDetail.position}
        data-bbox={annotationDetail.boundingBox ? "true" : undefined}
        data-shadow={annotationDetail.textShadow ? "true" : "false"}
        data-scale-mode={labelScaleMode}
        style={{ "--label-scale": 1 } as CSSProperties}
      >
        {spaces.slice(0, MAX_NUCLEI).map((space) => {
          const kind: SpaceKind = space.kind === "void" ? "void" : "space";
          const legacyColor = getNucleusColor(space, paletteMode, areaRange, nucleusPaletteId, colorSource);
          const appearance = labelPresentation.byId.get(space.id);
          const text = appearance?.text ?? presentationDefaults.text;
          const preset = textStylePreset(text.preset);
          const mappedColor = {
            ...legacyColor,
            fill: kind === "void"
              ? appearance?.void.fill.colour ?? legacyColor.fill
              : appearance?.cell.paint.colour ?? legacyColor.fill,
            ring: kind === "void"
              ? appearance?.void.edge.colour ?? legacyColor.ring
              : appearance?.boundary.paint.colour ?? legacyColor.ring,
          };
          const labelContrast = resolveLabelContrast({
            mode: text.colourMode === "custom" ? "custom" : "auto",
            customColor: text.colourMode === "custom" ? text.colour : labelCustomColour,
            backgroundColor: mappedColor.fill,
            voidBackground: kind === "void",
            theme: themeMode,
          });
          const selected = selectedSet.has(space.id);
          const editing = editingTargetId === space.id;
          const labelStyle = {
            "--nucleus-color": mappedColor.fill,
            "--nucleus-ring": mappedColor.ring,
            "--nucleus-muted": mappedColor.muted,
            "--label-ink": labelContrast.color,
            "--label-keyline": labelContrast.keyline,
          } as CSSProperties;
          return (
            <div
              key={space.id}
              className="organism-label-anchor"
              data-nucleus-id={space.id}
              data-category-token={mappedColor.token.id}
              data-kind={kind}
              data-selected={selected ? "true" : "false"}
              data-primary={space.id === selectedId ? "true" : undefined}
              data-ring={labelSelection.get(space.id) ?? "none"}
              data-editing={editing ? "true" : undefined}
              style={labelStyle}
            >
              <span className="organism-cell-keyline" aria-hidden="true" />
              <OrganismCellLabel
                space={space}
                defaults={presentationDefaults}
                globalScaleMode={labelScaleMode}
                textSize={text.size * preset.heading.scale}
                showName={annotationDetail.showName}
                showArea={annotationDetail.showArea}
                showMetadata={annotationMode === "technical" && annotationDetail.showCategory}
                hasSymbol={symbolTargets.has(space.id)}
                flagAutoDirection={resolveFlagAutoDirection(space, labelCentroid)}
                theme={themeMode}
              />
            </div>
          );
        })}
      </div>}
    </div>
  );
}
