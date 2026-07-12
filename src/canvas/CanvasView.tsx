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
import { resolveContextSurface, shouldOpenContextFromGesture } from "../interaction/contextActionRegistry";
import "./canvas.css";

const DPR_MAX = 2;
const Z_MIN = 0.25;
const Z_MAX = 4;
const DRAG_COMMIT_MS = 90; // throttled mid-drag store commits (table liveness)

// Imperative canvas: one rAF loop, refs for live gestures,
// store commits only on throttle/gesture-end. No React state per pointermove.
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
    let spaces = st.spaces;
    let selectedId = st.selectedId;
    let selectedIds = st.selectedIds;
    let settings = st.settings; // blobOn + mergeDistance drive the blob layer
    let tokens = readTokens();
    let drag: DragOverride | null = null;
    let dirty = true;
    let dpr = 1;
    let w = 0;
    let h = 0;

    // External camera sets (fit/reset/zoom buttons) ease in via rAF.
    let camTarget: { x: number; y: number; zoom: number } | null = null;
    let lastCommitted = st.camera; // reference marker for our own commits

    const unsub = useLab.subscribe((s) => {
      spaces = s.spaces;
      selectedId = s.selectedId;
      selectedIds = s.selectedIds;
      settings = s.settings;
      if (s.camera !== lastCommitted) {
        lastCommitted = s.camera;
        camTarget = s.camera; // adopt external change (eased in loop)
      }
      dirty = true;
    });

    // Tokens change with data-theme (set by App effect) — observe the attribute.
    const mo = new MutationObserver(() => {
      tokens = readTokens();
      dirty = true;
    });
    mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    const resize = () => {
      dpr = clamp(window.devicePixelRatio || 1, 1, DPR_MAX);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* V7.2 export adapter — Classic re-renders the pure drawScene layer onto
     * a fresh offscreen canvas at the requested scale/options. No dependency
     * on the live canvas's buffer, so no readback timing concerns. */
    const unregisterCapture = registerCanvasCapture(async ({ scale, includeLabels, includeSelection }) => {
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
        spaces,
        includeSelection ? selectedId : null,
        null,
        tokens,
        Date.now(),
        settings,
        { includeLabels, selectedIds: includeSelection ? selectedIds : [] }
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
    let lastCommit = 0;
    let pressIntent: "replace" | "toggle" = "replace";

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
        }
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
      dirty = true;
    };

    const onMove = (e: PointerEvent) => {
      if (mode === "none") return;
      const { sx, sy } = local(e);
      if (mode === "press" && Math.hypot(sx - pressSX, sy - pressSY) >= CELL_DRAG_THRESHOLD_PX) {
        mode = "drag";
        useLab.getState().closeContextSurface();
        if (drag) useLab.getState().addToSelection(drag.id);
      }
      if (mode === "drag" && drag) {
        const p = toWorld(sx, sy);
        drag.x = p.x + grabDX;
        drag.y = p.y + grabDY;
        const now = performance.now();
        if (now - lastCommit > DRAG_COMMIT_MS) {
          lastCommit = now;
          useLab.getState().moveSpace(drag.id, drag.x, drag.y);
        }
      } else if (mode === "pan") {
        cam.x = panCX - (sx - panSX) / cam.zoom;
        cam.y = panCY - (sy - panSY) / cam.zoom;
      }
      dirty = true;
    };

    const onUp = (e: PointerEvent) => {
      const { sx, sy } = local(e);
      if (mode === "press" && drag) {
        const state = useLab.getState();
        if (pressIntent === "toggle") {
          state.toggleSelection(drag.id);
          resetCellActivation(activation);
        } else {
          state.replaceSelection(drag.id);
          if (registerCellActivation(activation, drag.id, sx, sy, performance.now(), false)) {
            state.openContextSurface("inline-editor", { x: sx + 14, y: sy + 18 }, drag.id);
          }
        }
        drag = null;
      } else if (mode === "drag" && drag) {
        useLab.getState().moveSpace(drag.id, drag.x, drag.y);
        registerCellActivation(activation, drag.id, sx, sy, performance.now(), true);
        drag = null;
      } else if (mode === "pan") {
        commitCamera();
      }
      mode = "none";
      canvas.style.cursor = "grab";
      dirty = true;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const secondaryButton = e.ctrlKey ? 2 : e.button;
      if (!shouldOpenContextFromGesture(secondaryButton, mode === "drag")) return;
      mode = "none";
      drag = null;
      resetCellActivation(activation);
      const { sx, sy } = local(e);
      const p = toWorld(sx, sy);
      const hit = hitTest(spaces, p.x, p.y);
      const state = useLab.getState();
      if (hit) {
        if (state.selectedIds.includes(hit.id)) state.addToSelection(hit.id);
        else state.replaceSelection(hit.id);
        state.openContextSurface(resolveContextSurface(hit.id), { x: e.clientX, y: e.clientY }, hit.id);
      } else {
        state.openContextSurface(resolveContextSurface(null), { x: e.clientX, y: e.clientY }, null);
      }
      canvas.style.cursor = "grab";
      dirty = true;
    };

    // ---- wheel: zoom around cursor ----
    let camCommit = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camTarget = null;
      const { sx, sy } = local(e);
      const before = toWorld(sx, sy);
      cam.zoom = clamp(cam.zoom * Math.exp(-e.deltaY * 0.0016), Z_MIN, Z_MAX);
      cam.x = before.x - (sx - w / 2) / cam.zoom;
      cam.y = before.y - (sy - h / 2) / cam.zoom;
      dirty = true;
      window.clearTimeout(camCommit);
      camCommit = window.setTimeout(commitCamera, 160);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", onContextMenu);

    // ---- paint loop ----
    let raf = 0;
    let firstUsableFrame = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
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
      if (!dirty && !spawning) return;
      dirty = false;
      // Organism style/attachment transitions keep settling for a few frames.
      if (!firstUsableFrame) announceReadiness("render-requested");
      if (drawScene(ctx, w, h, dpr, cam, spaces, selectedId, drag, tokens, now, settings, { selectedIds })) {
        dirty = true;
      }
      if (!firstUsableFrame) {
        firstUsableFrame = true;
        announceReadiness("ready");
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(camCommit);
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
