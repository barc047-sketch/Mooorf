import { useEffect, useRef } from "react";
import { useLab } from "../state/store";
import { hitTest, clamp } from "../lib/geometry";
import { drawScene, readTokens, SPAWN_MS, type DragOverride } from "./renderer";
import { registerCanvasCapture } from "./exportCapture";
import {
  CELL_DRAG_THRESHOLD_PX,
  createCellActivationState,
  isInlineEditorCommitPointer,
  registerCellActivation,
  resetCellActivation,
} from "./cellActivation";
import { resolveSelectionIntent } from "../interaction/selection";
import {
  applySpacePositionsPreview,
  createGroupTranslation,
  resolveGroupTranslationPositions,
  type GroupTranslation,
  type SpacePosition,
} from "../interaction/groupDrag";
import { resolveContextSurface, shouldOpenContextFromGesture } from "../interaction/contextActionRegistry";
import { createDemandFrameLoop, createFrameScheduler, latestCoalescedPointerEvent } from "../interaction/frameScheduler";
import { performanceRuntime } from "../runtime/performanceRuntime";
import { projectCanvasPoint, projectClientPoint } from "./labelPresentation";
import "./canvas.css";

const DPR_MAX = 2;
const Z_MIN = 0.25;
const Z_MAX = 4;
const projectedCanvasSpaces = (state: ReturnType<typeof useLab.getState>) =>
  applySpacePositionsPreview(state.appearancePreview ?? state.spaces, state.arrangementPreview ?? []);
const effectiveCanvasSettings = (state: ReturnType<typeof useLab.getState>) => {
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
// Imperative canvas: raw input is coalesced to one local update per rAF;
// canonical spaces/camera commit only at gesture end.
export default function CanvasView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const canvas = canvasRef.current!;
    const announceReadiness = (stage: "canvas-mounted" | "renderer-ready" | "render-requested" | "ready") => {
      const state = useLab.getState();
      if (!state.loaderDone) state.setCanvasReadiness(stage);
    };
    announceReadiness("canvas-mounted");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // Keep the shell reachable even if the browser cannot provide a 2D
      // context; this is an error exit, not a permanent loading screen.
      announceReadiness("ready");
      return;
    }
    announceReadiness("renderer-ready");
    const st = useLab.getState();

    // Live mirrors (refs, not React state)
    const cam = { ...st.camera };
    let spaces = projectedCanvasSpaces(st);
    let selectedId = st.selectedId;
    let selectedIds = st.selectedIds;
    let settings = effectiveCanvasSettings(st); // ephemeral previews project through canonical renderer inputs
    let tokens = readTokens();
    let drag: DragOverride | null = null;
    let dirty = true;
    let renderLoop: ReturnType<typeof createDemandFrameLoop> | null = null;
    const invalidate = () => {
      dirty = true;
      renderLoop?.invalidate();
    };
    let dpr = 1;
    let w = 0;
    let h = 0;

    // External camera sets (fit/reset/zoom buttons) ease in via rAF.
    let camTarget: { x: number; y: number; zoom: number } | null = null;
    let lastCommitted = st.camera; // reference marker for our own commits

    const unsub = useLab.subscribe((s) => {
      spaces = projectedCanvasSpaces(s);
      selectedId = s.selectedId;
      selectedIds = s.selectedIds;
      settings = effectiveCanvasSettings(s);
      if (s.camera !== lastCommitted) {
        lastCommitted = s.camera;
        camTarget = s.camera; // adopt external change (eased in loop)
      }
      invalidate();
    });

    // Tokens change with data-theme (set by App effect) — observe the attribute.
    const mo = new MutationObserver(() => {
      tokens = readTokens();
      invalidate();
    });
    mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    const resize = () => {
      dpr = clamp(window.devicePixelRatio || 1, 1, DPR_MAX);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      invalidate();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* V7.2 export adapter — Classic re-renders the pure drawScene layer onto
     * a fresh offscreen canvas at the requested scale/options. No dependency
     * on the live canvas's buffer, so no readback timing concerns. */
    const unregisterCapture = registerCanvasCapture(async ({ scale, includeLabels, includeSelection }) => {
      const canonical = useLab.getState();
      const cssW = host.clientWidth;
      const cssH = host.clientHeight;
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(cssW * scale));
      off.height = Math.max(1, Math.round(cssH * scale));
      const offCtx = off.getContext("2d");
      if (!offCtx) throw new Error("Could not create an export surface for the Classic canvas.");
      drawScene(
        offCtx,
        cssW,
        cssH,
        scale,
        cam,
        canonical.spaces,
        includeSelection ? selectedId : null,
        null,
        tokens,
        Date.now(),
        canonical.settings,
        { includeLabels, selectedIds: includeSelection ? selectedIds : [], isExport: true }
      );
      return { canvas: off, cssWidth: cssW, cssHeight: cssH };
    });

    const toWorld = (sx: number, sy: number) => ({
      x: (sx - w / 2) / cam.zoom + cam.x,
      y: (sy - h / 2) / cam.zoom + cam.y,
    });
    const local = (e: PointerEvent | WheelEvent | MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { sx: e.clientX - r.left, sy: e.clientY - r.top };
    };

    // ---- pointer: drag cell vs pan (decided once at pointerdown) ----
    let mode: "none" | "press" | "drag" | "pan" = "none";
    const activation = createCellActivationState();
    let pressSX = 0;
    let pressSY = 0;
    let grabDX = 0;
    let grabDY = 0;
    let panSX = 0;
    let panSY = 0;
    let panCX = 0;
    let panCY = 0;
    let pressIntent: "replace" | "toggle" = "replace";
    let groupTranslation: GroupTranslation | null = null;
    let translatedPositions: SpacePosition[] = [];
    let hoveredId: string | null = null;

    const commitCamera = () => {
      const snapshot = { ...cam };
      lastCommitted = snapshot;
      useLab.getState().setCamera(snapshot);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.ctrlKey && e.pointerType === "mouse")) return;
      if (isInlineEditorCommitPointer(e)) {
        resetCellActivation(activation);
        return;
      }
      camTarget = null; // user gesture takes over any eased transition
      const { sx, sy } = local(e);
      const p = toWorld(sx, sy);
      const hit = hitTest(spaces, p.x, p.y);
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // synthetic/stale pointerId — gesture still works without capture
      }
      if (hit) {
        const state = useLab.getState();
        pressIntent = resolveSelectionIntent(e);
        mode = "press";
        pressSX = sx;
        pressSY = sy;
        drag = { id: hit.id, x: hit.x, y: hit.y };
        grabDX = hit.x - p.x;
        grabDY = hit.y - p.y;
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
        if (selectedIds.length > 0) useLab.getState().clearSelection();
        canvas.style.cursor = "grabbing";
      }
      hoveredId = hit?.id ?? null;
      invalidate();
    };

    const processMove = (e: PointerEvent) => {
      const { sx, sy } = local(e);
      if (mode === "none") {
        const pointerWorld = toWorld(sx, sy);
        const nextHoveredId = hitTest(spaces, pointerWorld.x, pointerWorld.y)?.id ?? null;
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
        const p = toWorld(sx, sy);
        const translation = groupTranslation;
        const origin = translation?.before.find((position) => position.id === dragId);
        if (!translation || !origin) return;
        const delta = { x: p.x + grabDX - origin.x, y: p.y + grabDY - origin.y };
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
            const projected = projectCanvasPoint(drag, cam, { width: w, height: h });
            const client = projectClientPoint(projected, canvas.getBoundingClientRect());
            state.openContextSurface("inline-editor", { x: client.x + 14, y: client.y + 18 }, drag.id);
          }
        }
        drag = null;
      } else if (mode === "drag" && drag) {
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
      canvas.style.cursor = "grab";
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
      const p = toWorld(sx, sy);
      const hit = hitTest(spaces, p.x, p.y);
      const state = useLab.getState();
      if (hit) {
        if (state.selectedIds.includes(hit.id)) state.addToSelection(hit.id);
        else state.replaceSelection(hit.id);
        const bounds = canvas.getBoundingClientRect();
        const projected = projectCanvasPoint(hit, cam, { width: w, height: h });
        state.openContextSurface(resolveContextSurface(hit.id), projectClientPoint(projected, bounds), hit.id);
      } else {
        state.openContextSurface(resolveContextSurface(null), { x: e.clientX, y: e.clientY }, null);
      }
      canvas.style.cursor = "grab";
      invalidate();
    };

    // ---- wheel: zoom around cursor ----
    let camCommit = 0;
    type WheelFrame = { deltaY: number; sx: number; sy: number };
    const processWheel = ({ deltaY, sx, sy }: WheelFrame) => {
      camTarget = null;
      const before = toWorld(sx, sy);
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

    // ---- demand-driven paint loop ----
    let firstUsableFrame = false;
    renderLoop = createDemandFrameLoop({
      schedule: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      render: (frameTimestamp) => {
      // Ease toward externally-set camera (fit/reset/zoom buttons).
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
      const now = Date.now();
      const spawning = spaces.some((c) => c.born && now - c.born < SPAWN_MS + 100);
      if (!dirty && !spawning) return false;
      dirty = false;
      // Organism style/attachment transitions keep settling for a few frames.
      if (!firstUsableFrame) announceReadiness("render-requested");
      const renderSpaces = translatedPositions.length > 0
        ? applySpacePositionsPreview(spaces, translatedPositions)
        : spaces;
      if (drawScene(ctx, w, h, dpr, cam, renderSpaces, selectedId, drag, tokens, now, settings, {
        includeLabels: settings.organism.showLabels && settings.annotationMode !== "hidden",
        selectedIds,
        hoveredId,
      })) {
        dirty = true;
      }
      performanceRuntime.reportFrame({
        renderer: "classic",
        timestamp: frameTimestamp,
        visibleCells: renderSpaces.length,
        totalCells: spaces.length,
      });
      if (!firstUsableFrame) {
        firstUsableFrame = true;
        announceReadiness("ready");
      }
      return dirty || spawning || !!camTarget;
      },
    });
    renderLoop.invalidate();

    return () => {
      renderLoop?.cancel();
      window.clearTimeout(camCommit);
      moveScheduler.cancel();
      wheelScheduler.cancel();
      unsub();
      mo.disconnect();
      ro.disconnect();
      unregisterCapture();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  return (
    <div ref={hostRef} className="canvas-host">
      <canvas ref={canvasRef} data-testid="space-canvas" />
    </div>
  );
}
