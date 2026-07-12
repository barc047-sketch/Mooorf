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
import type { SpaceKind } from "../types";
import { registerCanvasCapture, type CaptureRequestOptions } from "./exportCapture";
import { resolveSelectionIntent, resolveSelectionRingState } from "../interaction/selection";
import {
  applySpacePositionsPreview,
  createGroupTranslation,
  resolveGroupTranslationPositions,
  type GroupTranslation,
  type SpacePosition,
} from "../interaction/groupDrag";
import { resolveContextSurface, shouldOpenContextFromGesture } from "../interaction/contextActionRegistry";
import { createDemandFrameLoop, createFrameScheduler, latestCoalescedPointerEvent } from "../interaction/frameScheduler";
import { projectClientPoint } from "./labelPresentation";
import { resolveLabelScale } from "./labelPresentation";
import { resolveLabelContrast } from "../design/labelContrast";
import { resolveCellShadow } from "./cellShadow";
import "./organismCanvas.css";

const CAPTURE_TIMEOUT_MS = 5000;

const DPR_MAX = 2;
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

export default function OrganismCanvasView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const spaces = useLab((s) => s.spaces);
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
  const showGrid = useLab((s) => s.settings.showGrid);
  const labelScaleMode = useLab((s) => s.settings.labelScaleMode);
  const labelColourMode = useLab((s) => s.settings.labelColourMode);
  const labelCustomColour = useLab((s) => s.settings.labelCustomColour);
  const themeMode = useLab((s) => s.theme);
  const areaRange = useMemo(() => getAreaRange(spaces), [spaces]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

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
    if (!renderer) {
      announceReadiness("renderer-ready");
      // The intro sits above the shell, so a failed WebGL mount cannot wait
      // for a hidden manual button. Reuse the existing Classic canvas.
      queueMicrotask(() => useLab.getState().setSettings({ rendererMode: "classic" }));
      return;
    }
    announceReadiness("renderer-ready");

    const cam = { ...useLab.getState().camera };
    let spaces = useLab.getState().spaces;
    let selectedId = useLab.getState().selectedId;
    let selectedIdSet = new Set(useLab.getState().selectedIds);
    let settings = useLab.getState().settings;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    let resolved = resolveOrganism(settings, reducedMotion);
    const motionState = createMotionState();
    let theme = readTheme();
    let drag: DragPosition | null = null;
    let dirty = true;
    let renderLoop: ReturnType<typeof createDemandFrameLoop> | null = null;
    const invalidate = () => {
      dirty = true;
      renderLoop?.invalidate();
    };
    let dpr = 1;
    let w = 0;
    let h = 0;
    let lastCommitted = useLab.getState().camera;
    let camTarget: typeof cam | null = null;
    let pendingCapture: { resolve: (canvas: HTMLCanvasElement) => void; reject: (err: Error) => void } | null = null;
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
    let cachedField = effectiveField(resolved.params);
    let cachedShadow = resolveCellShadow(settings.cellShadow, settings.performanceQuality, theme);

    const refreshDerived = () => {
      cachedAreaRange = getAreaRange(spaces.slice(0, MAX_NUCLEI));
      cachedCellColors = new Map(
        spaces.slice(0, MAX_NUCLEI).map((space) => [
          space.id,
          getNucleusColor(
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
      cachedField = effectiveField(resolved.params);
      cachedShadow = resolveCellShadow(settings.cellShadow, settings.performanceQuality, theme);
      derivedDirty = false;
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
      nucleusDots: 1,
      morphEnabled: false,
      shadowEnabled: false,
      shadowColor: [0, 0, 0],
      shadowOpacity: 0,
      shadowSoftness: 0,
      shadowOffset: [0, 0],
      shadowSpread: 0,
      fieldDebug: false,
      nucleiDebug: false,
    };
    let smooth: SmoothFrame | null = null;

    const unsub = useLab.subscribe((s) => {
      const spacesChanged = s.spaces !== spaces;
      spaces = s.spaces;
      selectedId = s.selectedId;
      selectedIdSet = new Set(s.selectedIds);
      if (s.settings !== settings) {
        settings = s.settings;
        resolved = resolveOrganism(settings, reducedMotion);
        derivedDirty = true;
        renderLoop?.setContinuous(resolved.motionActive);
      }
      if (spacesChanged) derivedDirty = true;
      if (s.camera !== lastCommitted) {
        lastCommitted = s.camera;
        camTarget = s.camera;
      }
      invalidate();
    });

    const mo = new MutationObserver(() => {
      theme = readTheme();
      derivedDirty = true;
      invalidate();
    });
    mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    const resize = () => {
      dpr = clamp(window.devicePixelRatio || 1, 1, DPR_MAX);
      w = host.clientWidth;
      h = host.clientHeight;
      renderer?.resize(w, h, dpr);
      invalidate();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onReducedMotion = () => {
      reducedMotion = reducedMotionQuery.matches;
      resolved = resolveOrganism(settings, reducedMotion);
      derivedDirty = true;
      renderLoop?.setContinuous(resolved.motionActive);
      invalidate();
    };
    reducedMotionQuery.addEventListener("change", onReducedMotion);

    /* V7.2 export adapter — WebGL requires preserveDrawingBuffer:false-safe
     * capture: request a render at the export scale, clone the buffer
     * synchronously inside the same render tick (before it can be cleared),
     * then restore the live DPR. Labels are a separate HTML overlay captured
     * via html-to-image and composited by the export service. */
    const captureWebglFrame = (scale: 1 | 2 | 4): Promise<HTMLCanvasElement> =>
      new Promise<HTMLCanvasElement>((resolve, reject) => {
        if (rendererFailed || !renderer) {
          reject(new Error("Organism renderer is unavailable for export."));
          return;
        }
        const timeout = window.setTimeout(() => {
          if (pendingCapture) {
            pendingCapture = null;
            renderer?.resize(w, h, dpr);
            reject(new Error("Canvas export timed out waiting for a render frame."));
          }
        }, CAPTURE_TIMEOUT_MS);
        renderer.resize(w, h, scale);
        pendingCapture = {
          resolve: (frameCanvas) => {
            window.clearTimeout(timeout);
            resolve(frameCanvas);
          },
          reject: (err) => {
            window.clearTimeout(timeout);
            reject(err);
          },
        };
        invalidate();
      });

    const unregisterCapture = registerCanvasCapture(
      async ({ scale, includeLabels, includeSelection }: CaptureRequestOptions) => {
        const cssW = w;
        const cssH = h;
        const webglCanvas = await captureWebglFrame(scale);
        renderer?.resize(cssW, cssH, dpr);
        invalidate();

        let labelLayerCanvas: HTMLCanvasElement | undefined;
        const layer = labelLayerRef.current;
        if (includeLabels && layer) {
          const { toCanvas } = await import("html-to-image");
          labelLayerCanvas = await toCanvas(layer, {
            pixelRatio: scale,
            backgroundColor: undefined,
            filter: (node) => {
              if (!(node instanceof Element)) return true;
              if (node.classList.contains("selection-command-wrap")) return false;
              if (node.classList.contains("selection-edit-popover")) return false;
              if (!includeSelection) {
                if (node.classList.contains("organism-cell-keyline")) return false;
                if (node.classList.contains("organism-selection-details")) return false;
              }
              return true;
            },
          });
        }

        return { canvas: webglCanvas, cssWidth: cssW, cssHeight: cssH, labelLayer: labelLayerCanvas };
      }
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
      const renderSpaces = translatedPositions.length > 0
        ? applySpacePositionsPreview(spaces, translatedPositions)
        : spaces;
      return spacesToNuclei(
        renderSpaces,
        cam,
        w,
        h,
        selectedId,
        translatedPositions.length > 0 ? translatedPositions : drag,
        resolved.adapter,
        motionState,
        settings.paletteMode,
        settings.nucleusPaletteId,
        settings.colorSource,
        cachedAreaRange,
        cachedCellColors
      );
    };
    let lastNuclei: ProductionNucleus[] = [];

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
      layer.style.setProperty(
        "--label-scale",
        String(resolveLabelScale(settings.labelScaleMode, cam.zoom, settings.annotationDetail.textScale))
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
        anchor.dataset.ring = resolveSelectionRingState(
          selected,
          selectedId === nucleus.id,
          hoveredId === nucleus.id
        );
        const keyline = anchor.querySelector<HTMLElement>(".organism-cell-keyline");
        if (keyline) {
          const editing = anchor.dataset.editing === "true";
          const keylineSize = Math.max(24, nucleus.screenR * 2 + (editing ? 14 : 10));
          keyline.style.width = `${keylineSize}px`;
          keyline.style.height = `${keylineSize}px`;
        }
      });
    };

    let mode: "none" | "press" | "drag" | "pan" = "none";
    const activation = createCellActivationState();
    let pressSX = 0;
    let pressSY = 0;
    let dragAnchorWX = 0;
    let dragAnchorWY = 0;
    let panSX = 0;
    let panSY = 0;
    let panCX = 0;
    let panCY = 0;
    let pressIntent: "replace" | "toggle" = "replace";
    let groupTranslation: GroupTranslation | null = null;
    let translatedPositions: SpacePosition[] = [];
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
        pressIntent = resolveSelectionIntent(e);
        const world = screenToWorld(sx, sy, cam, w, h);
        const source = spaces.find((space) => space.id === hit.id);
        if (!source) return;
        mode = "press";
        pressSX = sx;
        pressSY = sy;
        drag = { id: hit.id, x: source.x, y: source.y };
        dragAnchorWX = world.x;
        dragAnchorWY = world.y;
        if (pressIntent === "replace") {
          if (state.selectedIds.includes(hit.id)) state.addToSelection(hit.id);
          else state.replaceSelection(hit.id);
          const selected = useLab.getState();
          groupTranslation = createGroupTranslation(spaces, selected.selectedIds, hit.id);
        } else {
          const selectedIds = state.selectedIds.includes(hit.id)
            ? state.selectedIds.filter((id) => id !== hit.id)
            : [...state.selectedIds, hit.id];
          groupTranslation = createGroupTranslation(spaces, selectedIds, hit.id);
        }
        translatedPositions = [];
        canvas.style.cursor = "grabbing";
      } else {
        resetCellActivation(activation);
        mode = "pan";
        panSX = sx;
        panSY = sy;
        panCX = cam.x;
        panCY = cam.y;
        if (selectedIdSet.size > 0) useLab.getState().clearSelection();
        canvas.style.cursor = "grabbing";
      }
      hoveredId = hit?.id ?? null;
      invalidate();
    };

    const processMove = (e: PointerEvent) => {
      const { sx, sy } = local(e);
      if (mode === "none") {
        const nextHoveredId = hitTestNuclei(lastNuclei, sx, sy)?.id ?? null;
        if (nextHoveredId !== hoveredId) {
          hoveredId = nextHoveredId;
          invalidate();
        }
        canvas.style.cursor = nextHoveredId ? "grab" : "default";
        return;
      }
      if (mode === "press" && Math.hypot(sx - pressSX, sy - pressSY) >= CELL_DRAG_THRESHOLD_PX) {
        mode = "drag";
        useLab.getState().closeContextSurface();
        if (drag && pressIntent === "toggle") {
          const state = useLab.getState();
          state.toggleSelection(drag.id);
          const selected = useLab.getState();
          if (!selected.selectedIds.includes(drag.id)) state.replaceSelection(drag.id);
        }
      }
      if (mode === "drag" && drag) {
        const dragId = drag.id;
        const world = screenToWorld(sx, sy, cam, w, h);
        const translation = groupTranslation;
        const origin = translation?.before.find((position) => position.id === dragId);
        if (!translation || !origin) return;
        /* One anchor-to-pointer delta avoids drift and is inverted once for
           the visual organism layout transform before every member moves. */
        const delta = dragDeltaWorldToStore(
          world.x - dragAnchorWX,
          world.y - dragAnchorWY,
          resolved.adapter
        );
        translatedPositions = resolveGroupTranslationPositions(translation, delta);
        const primary = translatedPositions.find((position) => position.id === dragId);
        if (!primary) return;
        drag.x = primary.x;
        drag.y = primary.y;
      } else if (mode === "pan") {
        cam.x = panCX - (sx - panSX) / cam.zoom;
        cam.y = panCY - (sy - panSY) / cam.zoom;
      }
      invalidate();
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
      if (mode !== "none") {
        moveScheduler.push(latestCoalescedPointerEvent(e));
        moveScheduler.flush();
      }
      const { sx, sy } = local(e);
      if (mode === "press" && drag) {
        const state = useLab.getState();
        if (pressIntent === "toggle") {
          state.toggleSelection(drag.id);
          resetCellActivation(activation);
        } else {
          state.replaceSelection(drag.id);
          if (registerCellActivation(activation, drag.id, sx, sy, performance.now(), false)) {
            const nucleus = lastNuclei.find((candidate) => candidate.id === drag?.id);
            const client = projectClientPoint(
              nucleus ? { x: nucleus.sx, y: nucleus.sy } : { x: sx, y: sy },
              canvas.getBoundingClientRect()
            );
            state.openContextSurface("inline-editor", { x: client.x + 14, y: client.y + 18 }, drag.id);
          }
        }
        drag = null;
      } else
      if (mode === "drag" && drag) {
        if (groupTranslation && translatedPositions.length > 0) {
          useLab.getState().commitSpaceTransform(groupTranslation.before, translatedPositions);
        }
        registerCellActivation(activation, drag.id, sx, sy, performance.now(), true);
        drag = null;
        groupTranslation = null;
        translatedPositions = [];
      } else if (mode === "pan") {
        commitCamera();
      }
      groupTranslation = null;
      translatedPositions = [];
      mode = "none";
      canvas.style.cursor = "default";
      invalidate();
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const secondaryButton = e.ctrlKey ? 2 : e.button;
      if (!shouldOpenContextFromGesture(secondaryButton, mode === "drag")) return;
      mode = "none";
      drag = null;
      groupTranslation = null;
      translatedPositions = [];
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
      invalidate();
    };

    let camCommit = 0;
    type WheelFrame = { deltaY: number; sx: number; sy: number };
    const processWheel = ({ deltaY, sx, sy }: WheelFrame) => {
      camTarget = null;
      const before = screenToWorld(sx, sy, cam, w, h);
      cam.zoom = clamp(cam.zoom * Math.exp(-deltaY * 0.0016), Z_MIN, Z_MAX);
      cam.x = before.x - (sx - w / 2) / cam.zoom;
      cam.y = before.y - (sy - h / 2) / cam.zoom;
      invalidate();
      window.clearTimeout(camCommit);
      camCommit = window.setTimeout(commitCamera, 160);
    };
    const wheelScheduler = createFrameScheduler<WheelFrame>({
      schedule: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      process: processWheel,
      merge: (queued, incoming) => ({ ...incoming, deltaY: queued.deltaY + incoming.deltaY }),
    });
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { sx, sy } = local(e);
      wheelScheduler.push({ deltaY: e.deltaY, sx, sy });
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
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
      advanceMotion(motionState, dt, resolved.adapter.timeScale);
      const nuclei = currentNuclei();
      lastNuclei = nuclei;
      const sc = cachedStyle;
      const palette = cachedPalette;
      const params = resolved.params;
      const eff = cachedField;

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
          dots: 1,
          body: [palette.body[0], palette.body[1], palette.body[2]],
          bodyB: [palette.bodyB[0], palette.bodyB[1], palette.bodyB[2]],
          bg: [palette.ground[0], palette.ground[1], palette.ground[2]],
          accent: [palette.accent[0], palette.accent[1], palette.accent[2]],
          colorMix: palette.blend,
        };
      }

      const kNum = expK(10, dt);
      const kCol = expK(3.4, dt);
      const dotsTarget = params.showNuclei ? 1 : 0;
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
        smooth.body[i] += (palette.body[i] - smooth.body[i]) * kCol;
        smooth.bodyB[i] += (palette.bodyB[i] - smooth.bodyB[i]) * kCol;
        smooth.bg[i] += (palette.ground[i] - smooth.bg[i]) * kCol;
        smooth.accent[i] += (palette.accent[i] - smooth.accent[i]) * kCol;
        settling = settling || Math.abs(palette.body[i] - smooth.body[i]) > 0.002;
        settling = settling || Math.abs(palette.bodyB[i] - smooth.bodyB[i]) > 0.002;
        settling = settling || Math.abs(palette.ground[i] - smooth.bg[i]) > 0.002;
        settling = settling || Math.abs(palette.accent[i] - smooth.accent[i]) > 0.002;
      }
      smooth.colorMix += (palette.blend - smooth.colorMix) * kCol;
      settling =
        settling ||
        Math.abs(palette.blend - smooth.colorMix) > 0.002 ||
        Math.abs(eff.tension - smooth.tension) > 0.002 ||
        Math.abs(eff.bias - smooth.bias) > 0.002 ||
        Math.abs(params.edgeSoftness - smooth.softness) > 0.002 ||
        Math.abs(params.mass - smooth.mass) > 0.002 ||
        Math.abs(params.isoLevel - smooth.iso) > 0.002 ||
        Math.abs(params.pocketThreshold - smooth.pocketIso) > 0.01 ||
        Math.abs(params.pocketSoftness - smooth.pocketSoft) > 0.002 ||
        Math.abs(dotsTarget - smooth.dots) > 0.002;

      dirty = false;
      syncLabels(nuclei);
      syncGrid();

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
        nucleiBuf[o + 3] = n.strength;
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
      frame.nucleusDots = smooth.dots;
      frame.fieldDebug = params.showFieldDebug;
      frame.nucleiDebug = params.showNucleiDebug;
      const shadow = cachedShadow;
      frame.morphEnabled = settings.blobOn;
      frame.shadowEnabled = shadow.enabled && (!pendingCapture || shadow.includeInExport);
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
      if (!firstUsableFrame) announceReadiness("render-requested");
      try {
        renderer?.render(frame);
        if (!firstUsableFrame) {
          firstUsableFrame = true;
          announceReadiness("ready");
        }
        /* Buffer is guaranteed valid only within this synchronous tick
         * (preserveDrawingBuffer:false) — clone it immediately so a later
         * resize/redraw can never race the export service's read. */
        if (pendingCapture) {
          const req = pendingCapture;
          pendingCapture = null;
          try {
            const clone = document.createElement("canvas");
            clone.width = canvas.width;
            clone.height = canvas.height;
            const cctx = clone.getContext("2d");
            if (!cctx) throw new Error("Could not clone the organism canvas for export.");
            cctx.drawImage(canvas, 0, 0);
            req.resolve(clone);
          } catch (err) {
            req.reject(err instanceof Error ? err : new Error("Organism canvas capture failed."));
          }
        }
      } catch {
        rendererFailed = true;
        announceReadiness("renderer-ready");
        if (pendingCapture) {
          pendingCapture.reject(new Error("Organism renderer failed during export."));
          pendingCapture = null;
        }
        queueMicrotask(() => useLab.getState().setSettings({ rendererMode: "classic" }));
      }
      return !rendererFailed && (
        dirty ||
        settling ||
        !!camTarget ||
        resolved.motionActive ||
        motionState.settling ||
        !!pendingCapture
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
      mo.disconnect();
      ro.disconnect();
      reducedMotionQuery.removeEventListener("change", onReducedMotion);
      unregisterCapture();
      if (pendingCapture) {
        pendingCapture.reject(new Error("Organism canvas unmounted during export."));
        pendingCapture = null;
      }
      renderer?.dispose();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  return (
    <div ref={hostRef} className="organism-canvas-host">
      <canvas ref={canvasRef} className="organism-canvas" data-testid="organism-canvas" />
      {showGrid && <div ref={gridRef} className="organism-grid" aria-hidden="true" />}
      <div
        ref={labelLayerRef}
        className="organism-label-layer"
        data-hidden={!showLabels || annotationMode === "hidden" ? "true" : undefined}
        data-mode={annotationMode}
        data-position={annotationDetail.position}
        data-bbox={annotationDetail.boundingBox ? "true" : undefined}
        data-shadow={annotationDetail.textShadow ? "true" : "false"}
        data-scale-mode={labelScaleMode}
        style={{ "--label-scale": annotationDetail.textScale } as CSSProperties}
      >
        {spaces.slice(0, MAX_NUCLEI).map((space) => {
          const mappedColor = getNucleusColor(space, paletteMode, areaRange, nucleusPaletteId, colorSource);
          const kind: SpaceKind = space.kind === "void" ? "void" : "space";
          const labelContrast = resolveLabelContrast({
            mode: labelColourMode,
            customColor: labelCustomColour,
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
              data-ring={resolveSelectionRingState(selected, space.id === selectedId, false)}
              data-editing={editing ? "true" : undefined}
              style={labelStyle}
            >
              <span className="organism-cell-keyline" aria-hidden="true" />
              <span className="organism-label">
                {annotationMode === "pill" ? (
                  annotationDetail.showName ? space.name : meta || space.name
                ) : (
                  <>
                    {annotationDetail.showName && (
                      <span className="organism-label-main">{space.name}</span>
                    )}
                    {meta && <span className="organism-label-meta">{meta}</span>}
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
