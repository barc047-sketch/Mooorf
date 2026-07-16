import {
  useEffect,
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
import { resolveOrganism } from "./organismProductionSettings";
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
  CAMERA_COMMIT_DELAY_MS,
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
import "./organismCanvas.css";

const THEME_TRANSITION_MS = 200;

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
  | "CAMERA"
  | "FULL";

export default function OrganismCanvasView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presentationCanvasRef = useRef<HTMLCanvasElement>(null);
  const presentationBackCanvasRef = useRef<HTMLCanvasElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const presentationCanvas = presentationCanvasRef.current;
    const presentationBackCanvas = presentationBackCanvasRef.current;
    if (!host || !canvas || !presentationCanvas || !presentationBackCanvas) return;
    let activePresentationCanvas = presentationCanvas;
    let activePresentationCtx = presentationCanvas.getContext("2d");
    let stagingPresentationCanvas = presentationBackCanvas;
    let stagingPresentationCtx = presentationBackCanvas.getContext("2d");
    presentationBackCanvas.style.visibility = "hidden";

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

    const cam = { ...useLab.getState().camera };
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
    canvas.dataset.previewFilter = previewFilter;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    let resolved = resolveOrganism(settings, reducedMotion);
    const motionState = createMotionState();
    let theme = readTheme();
    let themeTransitionUntil = 0;
    const gesture = createCanvasGestureState<DragPosition, GroupTranslation, SpacePosition>();
    let dirty = true;
    let membraneNeedsRender = true;
    let lastInvalidationScope: OrganismInvalidation = "FULL";
    let renderLoop: ReturnType<typeof createDemandFrameLoop> | null = null;
    const invalidate = (scope: OrganismInvalidation = "FULL") => {
      dirty = true;
      lastInvalidationScope = scope;
      if (scope === "FULL" || scope === "MEMBRANE_FIELD" || scope === "CAMERA") {
        membraneNeedsRender = true;
      }
      renderLoop?.invalidate();
    };
    const updateResolvedOrganism = (next: ReturnType<typeof resolveOrganism>) => {
      if (next.motionActive !== resolved.motionActive) resetMotionState(motionState);
      resolved = next;
      renderLoop?.setContinuous(resolved.motionActive);
    };
    let effectivePixelRatio = 1;
    let presentationPixelRatio = 1;
    let w = 0;
    let h = 0;
    let lastCommitted = useLab.getState().camera;
    let camTarget: typeof cam | null = null;
    let surfaceNeedsClear = true;
    let membraneRenderCount = 0;
    let membraneClearCount = 0;
    let lastArrangementPreview = initialState.arrangementPreview;
    let lastSpaceSource = initialState.appearancePreview ?? initialState.spaces;
    let lastAppearancePreview = initialState.appearancePreview;
    let lastAppearancePreviewIds = initialState.appearancePreviewIds;
    let lastAppearancePreviewTarget = initialState.appearancePreviewTarget;
    let lastSelectedIds = initialState.selectedIds;
    let lastSelectedId = initialState.selectedId;
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

    const unsub = useLab.subscribe((s) => {
      const nextSpaceSource = s.appearancePreview ?? s.spaces;
      const sourceChanged = nextSpaceSource !== lastSpaceSource;
      const arrangementChanged = s.arrangementPreview !== lastArrangementPreview;
      const nextSpaces = sourceChanged || arrangementChanged
        ? applySpacePositionsPreview(nextSpaceSource, s.arrangementPreview ?? [])
        : spaces;
      const spacesChanged = nextSpaces !== spaces;
      spaces = nextSpaces;
      const selectionChanged = s.selectedIds !== lastSelectedIds || s.selectedId !== lastSelectedId;
      selectedId = s.selectedId;
      selectedIdSet = new Set(s.selectedIds);
      let invalidation: OrganismInvalidation | null = selectionChanged ? "LABEL_PRESENTATION" : null;
      const nextAuthoredSettings = authoredCanvasSettings(s);
      if (nextAuthoredSettings !== authoredSettings) {
        authoredSettings = nextAuthoredSettings;
        const nextSettings = resolveLivePerformanceSettings(
          authoredSettings,
          performanceSnapshot,
          "organism",
        );
        const membraneTurnedOff = settings.blobOn && !nextSettings.blobOn;
        const qualityChanged = nextSettings.performanceQuality !== settings.performanceQuality;
        settings = nextSettings;
        updateResolvedOrganism(resolveOrganism(settings, reducedMotion));
        derivedDirty = true;
        invalidation = "FULL";
        if (membraneTurnedOff) {
          surfaceNeedsClear = true;
          smooth = null;
        }
        if (qualityChanged) resize();
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
      if (spacesChanged && localAppearanceChange) {
        patchSelectedPresentation(previewIds, nextSpaceSource);
        invalidation = previewTarget === "text" ? "LABEL_PRESENTATION" : "CELL_PRESENTATION";
        if (previewTarget === "cell" && cachedPresentation.membrane.colourMode === "cell-gradient") {
          invalidation = "MEMBRANE_FIELD";
        }
      } else if (spacesChanged) {
        derivedDirty = true;
        invalidation = "FULL";
      }
      if (s.camera !== lastCommitted) {
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
      if (invalidation) invalidate(invalidation);
    });
    const unsubGovernor = performanceGovernor.subscribe(() => {
      const nextPerformanceSnapshot = performanceGovernor.getSnapshot();
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
      if (qualityChanged || previewScaleChanged) resizeTarget();
      invalidate();
    });

    const mo = new MutationObserver(() => {
      theme = readTheme();
      themeTransitionUntil = performance.now() + THEME_TRANSITION_MS;
      derivedDirty = true;
      if (!settings.blobOn) surfaceNeedsClear = true;
      invalidate();
    });
    mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    const resizeTarget = () => {
      effectivePixelRatio = resolveOrganismPixelRatio(
        window.devicePixelRatio || 1,
        settings.performanceQuality,
        effectiveRenderScale,
      );
      renderer?.resizeTarget(w, h, effectivePixelRatio);
      renderer?.setFilter(previewFilter);
    };
    const resize = () => {
      presentationPixelRatio = resolveOrganismDpr(window.devicePixelRatio || 1, "high");
      w = host.clientWidth;
      h = host.clientHeight;
      renderer?.resize(w, h, presentationPixelRatio);
      resizeTarget();
      const presentationWidth = Math.max(1, Math.round(w * presentationPixelRatio));
      const presentationHeight = Math.max(1, Math.round(h * presentationPixelRatio));
      for (const surface of [presentationCanvas, presentationBackCanvas]) {
        if (surface.width !== presentationWidth) surface.width = presentationWidth;
        if (surface.height !== presentationHeight) surface.height = presentationHeight;
      }
      canvas.dataset.visibleResizeCount = String(Number(canvas.dataset.visibleResizeCount ?? "0") + 1);
      surfaceNeedsClear = true;
      invalidate();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onReducedMotion = () => {
      reducedMotion = reducedMotionQuery.matches;
      updateResolvedOrganism(resolveOrganism(settings, reducedMotion));
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

    const commitCamera = () => {
      const snapshot = { ...cam };
      lastCommitted = snapshot;
      useLab.getState().setCamera(snapshot);
    };

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

    const drawPresentationOverlay = (nuclei: ProductionNucleus[], scale: number) => {
      if (!activePresentationCtx || !stagingPresentationCtx) return;
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
      });
    };

    const activation = createCellActivationState();
    let hoveredId: string | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.ctrlKey && e.pointerType === "mouse")) return;
      if (isInlineEditorCommitPointer(e)) {
        resetCellActivation(activation);
        return;
      }
      camTarget = null;
      const { sx, sy } = local(e);
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
      if (gesture.mode === "none") {
        const nextHoveredId = hitTestNuclei(lastNuclei, sx, sy)?.id ?? null;
        if (nextHoveredId !== hoveredId) {
          hoveredId = nextHoveredId;
          invalidate("CELL_PRESENTATION");
        }
        canvas.style.cursor = nextHoveredId ? "grab" : "default";
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
      moveScheduler.push(latestCoalescedPointerEvent(e));
    };

    const onUp = (e: PointerEvent) => {
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
      canvas.style.cursor = "default";
      performanceGovernor.endInteraction();
      invalidate(completedMode === "drag" ? "MEMBRANE_FIELD" : completedMode === "pan" ? "CAMERA" : "CELL_PRESENTATION");
    };

    const onCancel = () => {
      const cancelledMode = gesture.mode;
      if (cancelledMode === "pan" && gesture.pan) Object.assign(cam, gesture.pan.camera);
      cancelCanvasGesture(gesture);
      canvas.style.cursor = "default";
      performanceGovernor.endInteraction();
      invalidate(cancelledMode === "pan" ? "CAMERA" : "CELL_PRESENTATION");
    };

    const onContextMenu = (e: MouseEvent) => {
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

    let camCommit = 0;
    type WheelFrame = { deltaY: number; sx: number; sy: number };
    const processWheel = ({ deltaY, sx, sy }: WheelFrame) => {
      camTarget = null;
      const before = screenToWorld(sx, sy, cam, w, h);
      cam.zoom = clamp(cam.zoom * Math.exp(-deltaY * 0.0016), Z_MIN, Z_MAX);
      cam.x = before.x - (sx - w / 2) / cam.zoom;
      cam.y = before.y - (sy - h / 2) / cam.zoom;
      invalidate("CAMERA");
      window.clearTimeout(camCommit);
      camCommit = window.setTimeout(commitCamera, CAMERA_COMMIT_DELAY_MS);
    };
    const wheelScheduler = createFrameScheduler<WheelFrame>({
      schedule: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      process: processWheel,
      merge: mergeCanvasWheelFrame,
    });
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      performanceGovernor.beginInteraction();
      const { sx, sy } = local(e);
      wheelScheduler.push({ deltaY: e.deltaY, sx, sy });
      performanceGovernor.endInteraction();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onCancel);
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
      }

      if (derivedDirty) refreshDerived();
      if (resolved.motionActive) advanceMotion(motionState, dt, resolved.adapter.timeScale);
      const nuclei = currentNuclei();
      lastNuclei = nuclei;
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
        interactionActive: gesture.mode === "drag",
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
        drawPresentationOverlay(nuclei, presentationPixelRatio);
        performanceRuntime.reportFrame({
          renderer: "organism",
          timestamp: now,
          visibleCells: count,
          totalCells: spaces.length,
        });
        if (!firstUsableFrame) {
          firstUsableFrame = true;
          announceReadiness("ready");
        }
      } catch {
        rendererFailed = true;
        announceReadiness("renderer-ready");
      }
      if (gates.membrane && (settling || !!camTarget || resolved.motionActive || motionState.settling)) {
        membraneNeedsRender = true;
      }
      return !rendererFailed && (
        dirty ||
        settling ||
        !!camTarget ||
        resolved.motionActive ||
        motionState.settling
      );
      },
    });
    renderLoop.setContinuous(resolved.motionActive);
    renderLoop.invalidate();

    return () => {
      renderLoop?.cancel();
      window.clearTimeout(camCommit);
      moveScheduler.cancel();
      wheelScheduler.cancel();
      unsub();
      unsubGovernor();
      mo.disconnect();
      ro.disconnect();
      reducedMotionQuery.removeEventListener("change", onReducedMotion);
      unregisterCapture();
      renderer?.dispose();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
      performanceGovernor.endInteraction();
    };
  }, []);

  return (
    <div ref={hostRef} className="organism-canvas-host">
      <canvas ref={canvasRef} className="organism-canvas" data-preview-filter="smooth" data-testid="organism-canvas" />
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
      {showGrid && <div ref={gridRef} className="organism-grid" aria-hidden="true" />}
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
            "--m1-text-size": text.size,
            "--m1-heading-scale": preset.heading.scale,
            "--m1-heading-weight": preset.heading.weight,
            "--m1-heading-tracking": `${preset.heading.tracking}em`,
            "--m1-area-scale": preset.area.scale,
            "--m1-area-weight": preset.area.weight,
            "--m1-body-scale": preset.body.scale,
            "--m1-body-weight": preset.body.weight,
            "--m1-body-leading": preset.body.lineHeight,
            "--m1-text-align": preset.align,
          } as CSSProperties;
          const meta = [
            annotationDetail.showArea ? `${Math.round(space.area)} m²` : null,
            annotationMode === "technical" && annotationDetail.showCategory
              ? space.category
              : null,
          ]
            .filter(Boolean)
            .join(" · ");
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
              <span className="organism-label">
                {annotationDetail.showName && <span className="organism-label-main">{space.name}</span>}
                {meta && <span className="organism-label-meta">{meta}</span>}
                {space.body?.trim() && <span className="organism-label-body">{space.body.trim()}</span>}
              </span>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
