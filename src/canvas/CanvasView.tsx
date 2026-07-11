import { useEffect, useRef, useState } from "react";
import { useLab } from "../state/store";
import { hitTest, clamp } from "../lib/geometry";
import { drawScene, readTokens, SPAWN_MS, type DragOverride } from "./renderer";
import { registerCanvasCapture } from "./exportCapture";
import InlineCellEditor, { type InlineEditorPosition } from "./InlineCellEditor";
import { CELL_DRAG_THRESHOLD_PX, createCellActivationState, registerCellActivation } from "./cellActivation";
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
  const [editorTarget, setEditorTarget] = useState<{ id: string; position: InlineEditorPosition } | null>(null);
  const spacesForEditor = useLab((state) => state.spaces);

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
        { includeLabels }
      );
      return { canvas: off, cssWidth: cssW, cssHeight: cssH };
    });

    const toWorld = (sx: number, sy: number) => ({
      x: (sx - w / 2) / cam.zoom + cam.x,
      y: (sy - h / 2) / cam.zoom + cam.y,
    });
    const local = (e: PointerEvent | WheelEvent) => {
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

    const commitCamera = () => {
      const snapshot = { ...cam };
      lastCommitted = snapshot;
      useLab.getState().setCamera(snapshot);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
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
        mode = "press";
        pressSX = sx;
        pressSY = sy;
        drag = { id: hit.id, x: hit.x, y: hit.y };
        grabDX = hit.x - p.x;
        grabDY = hit.y - p.y;
        useLab.getState().select(hit.id);
        canvas.style.cursor = "grabbing";
      } else {
        mode = "pan";
        panSX = sx;
        panSY = sy;
        panCX = cam.x;
        panCY = cam.y;
        if (selectedId) useLab.getState().select(null);
        canvas.style.cursor = "grabbing";
      }
      dirty = true;
    };

    const onMove = (e: PointerEvent) => {
      if (mode === "none") return;
      const { sx, sy } = local(e);
      if (mode === "press" && Math.hypot(sx - pressSX, sy - pressSY) >= CELL_DRAG_THRESHOLD_PX) {
        mode = "drag";
        setEditorTarget(null);
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
        if (registerCellActivation(activation, drag.id, sx, sy, performance.now(), false)) {
          setEditorTarget({ id: drag.id, position: { x: sx + 14, y: sy + 18 } });
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
      if (drawScene(ctx, w, h, dpr, cam, spaces, selectedId, drag, tokens, now, settings)) {
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
    };
  }, []);

  return (
    <div ref={hostRef} className="canvas-host">
      <canvas ref={canvasRef} data-testid="space-canvas" />
      {editorTarget && (() => {
        const space = spacesForEditor.find((candidate) => candidate.id === editorTarget.id);
        return space ? <InlineCellEditor space={space} position={editorTarget.position} onClose={() => setEditorTarget(null)} /> : null;
      })()}
    </div>
  );
}
