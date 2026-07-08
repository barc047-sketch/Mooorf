import { useEffect, useRef, useState } from "react";
import { useLab } from "../state/store";
import { clamp } from "../lib/geometry";
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
import "./organismCanvas.css";

const DPR_MAX = 2;
const Z_MIN = 0.25;
const Z_MAX = 4;
const DRAG_COMMIT_MS = 90;

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
  bg: RGB;
}

const expK = (response: number, dt: number) => 1 - Math.exp(-Math.max(response, 0.0001) * dt);

const readTheme = (): LabTheme =>
  document.documentElement.getAttribute("data-theme") === "night" ? "night" : "day";

export default function OrganismCanvasView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const [glOk, setGlOk] = useState(true);
  const spaces = useLab((s) => s.spaces);
  const selectedId = useLab((s) => s.selectedId);
  const showLabels = useLab((s) => s.settings.organism.showLabels);
  const annotationMode = useLab((s) => s.settings.annotationMode);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let renderer: OrganismRenderer | null = null;
    try {
      renderer = createOrganismRenderer(canvas);
    } catch {
      renderer = null;
    }
    if (!renderer) {
      setGlOk(false);
      return;
    }
    setGlOk(true);

    const cam = { ...useLab.getState().camera };
    let spaces = useLab.getState().spaces;
    let selectedId = useLab.getState().selectedId;
    let settings = useLab.getState().settings;
    let resolved = resolveOrganism(settings);
    const motionState = createMotionState();
    let theme = readTheme();
    let drag: DragPosition | null = null;
    let dirty = true;
    let dpr = 1;
    let w = 0;
    let h = 0;
    let lastCommitted = useLab.getState().camera;
    let camTarget: typeof cam | null = null;

    const nucleiBuf = new Float32Array(MAX_NUCLEI * 4);
    const frame: OrganismRenderFrame = {
      count: 0,
      nuclei: nucleiBuf,
      mass: 1,
      iso: 1,
      softness: 0.02,
      tension: 1,
      bias: 0.18,
      pocketIso: 8,
      pocketSoft: 0.45,
      pocketAmount: 1,
      bodyColor: [0, 0, 0],
      bgColor: [1, 1, 1],
      nucleusDots: 1,
      fieldDebug: false,
      nucleiDebug: false,
    };
    let smooth: SmoothFrame | null = null;

    const unsub = useLab.subscribe((s) => {
      spaces = s.spaces;
      selectedId = s.selectedId;
      if (s.settings !== settings) {
        settings = s.settings;
        resolved = resolveOrganism(settings);
      }
      if (s.camera !== lastCommitted) {
        lastCommitted = s.camera;
        camTarget = s.camera;
      }
      dirty = true;
    });

    const mo = new MutationObserver(() => {
      theme = readTheme();
      dirty = true;
    });
    mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    const resize = () => {
      dpr = clamp(window.devicePixelRatio || 1, 1, DPR_MAX);
      w = host.clientWidth;
      h = host.clientHeight;
      renderer?.resize(w, h, dpr);
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const local = (e: PointerEvent | WheelEvent) => {
      const r = canvas.getBoundingClientRect();
      return { sx: e.clientX - r.left, sy: e.clientY - r.top };
    };

    const commitCamera = () => {
      const snapshot = { ...cam };
      lastCommitted = snapshot;
      useLab.getState().setCamera(snapshot);
    };

    const currentNuclei = () =>
      spacesToNuclei(spaces, cam, w, h, selectedId, drag, resolved.adapter, motionState);
    const syncLabels = (nuclei: ProductionNucleus[]) => {
      const layer = labelLayerRef.current;
      if (!layer) return;
      const byId = new Map(nuclei.map((n) => [n.id, n]));
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
        anchor.dataset.selected = nucleus.id === selectedId ? "true" : "false";
        anchor.dataset.selectionDisplay = settings.selectionDisplay;
        const ring = anchor.querySelector<HTMLElement>(".organism-label-ring");
        if (ring) {
          const ringFactor =
            settings.selectionDisplay === "influence"
              ? 3.4
              : settings.selectionDisplay === "halo"
                ? 2.2
                : 1.08;
          const size = `${Math.max(18, nucleus.screenR * ringFactor)}px`;
          ring.style.width = size;
          ring.style.height = size;
        }
      });
    };

    let mode: "none" | "drag" | "pan" = "none";
    let dragLastWX = 0;
    let dragLastWY = 0;
    let panSX = 0;
    let panSY = 0;
    let panCX = 0;
    let panCY = 0;
    let lastDragCommit = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      camTarget = null;
      const { sx, sy } = local(e);
      const hit = hitTestNuclei(currentNuclei(), sx, sy);
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic/stale pointer ids still work without capture.
      }
      if (hit) {
        const world = screenToWorld(sx, sy, cam, w, h);
        const source = spaces.find((space) => space.id === hit.id);
        if (!source) return;
        mode = "drag";
        drag = { id: hit.id, x: source.x, y: source.y };
        dragLastWX = world.x;
        dragLastWY = world.y;
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
      const { sx, sy } = local(e);
      if (mode === "none") {
        canvas.style.cursor = hitTestNuclei(currentNuclei(), sx, sy) ? "grab" : "default";
        return;
      }
      if (mode === "drag" && drag) {
        const world = screenToWorld(sx, sy, cam, w, h);
        /* delta-based with layout-transform inverse — pointer tracks 1:1 even
           while global/angular offsets are active */
        const d = dragDeltaWorldToStore(
          world.x - dragLastWX,
          world.y - dragLastWY,
          resolved.adapter
        );
        drag.x += d.x;
        drag.y += d.y;
        dragLastWX = world.x;
        dragLastWY = world.y;
        const now = performance.now();
        if (now - lastDragCommit > DRAG_COMMIT_MS) {
          lastDragCommit = now;
          useLab.getState().moveSpace(drag.id, drag.x, drag.y);
        }
      } else if (mode === "pan") {
        cam.x = panCX - (sx - panSX) / cam.zoom;
        cam.y = panCY - (sy - panSY) / cam.zoom;
      }
      dirty = true;
    };

    const onUp = () => {
      if (mode === "drag" && drag) {
        useLab.getState().moveSpace(drag.id, drag.x, drag.y);
        drag = null;
      } else if (mode === "pan") {
        commitCamera();
      }
      mode = "none";
      canvas.style.cursor = "default";
      dirty = true;
    };

    let camCommit = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camTarget = null;
      const { sx, sy } = local(e);
      const before = screenToWorld(sx, sy, cam, w, h);
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

    let raf = 0;
    let last = performance.now();
    const render = (now: number) => {
      raf = requestAnimationFrame(render);
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

      advanceMotion(motionState, dt, resolved.adapter.timeScale);
      const nuclei = currentNuclei();
      const sc = styleColors(settings.morphMode, theme);
      const params = resolved.params;
      const eff = effectiveField(params);

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
          body: [sc.body[0], sc.body[1], sc.body[2]],
          bg: [sc.bg[0], sc.bg[1], sc.bg[2]],
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
        smooth.body[i] += (sc.body[i] - smooth.body[i]) * kCol;
        smooth.bg[i] += (sc.bg[i] - smooth.bg[i]) * kCol;
        settling = settling || Math.abs(sc.body[i] - smooth.body[i]) > 0.002;
        settling = settling || Math.abs(sc.bg[i] - smooth.bg[i]) > 0.002;
      }
      settling =
        settling ||
        Math.abs(eff.tension - smooth.tension) > 0.002 ||
        Math.abs(eff.bias - smooth.bias) > 0.002 ||
        Math.abs(params.edgeSoftness - smooth.softness) > 0.002 ||
        Math.abs(params.mass - smooth.mass) > 0.002 ||
        Math.abs(params.isoLevel - smooth.iso) > 0.002 ||
        Math.abs(params.pocketThreshold - smooth.pocketIso) > 0.01 ||
        Math.abs(params.pocketSoftness - smooth.pocketSoft) > 0.002 ||
        Math.abs(dotsTarget - smooth.dots) > 0.002;

      const shouldRender =
        dirty ||
        !!drag ||
        settling ||
        !!camTarget ||
        resolved.motionActive ||
        motionState.settling;
      if (!shouldRender) return;
      dirty = false;
      syncLabels(nuclei);

      nucleiBuf.fill(0);
      const count = Math.min(nuclei.length, MAX_NUCLEI);
      for (let i = 0; i < count; i++) {
        const n = nuclei[i];
        const o = i * 4;
        nucleiBuf[o] = n.fx;
        nucleiBuf[o + 1] = n.fy;
        nucleiBuf[o + 2] = n.r;
        nucleiBuf[o + 3] = n.strength;
      }
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
      frame.bgColor = smooth.bg;
      frame.nucleusDots = smooth.dots;
      frame.fieldDebug = params.showFieldDebug;
      frame.nucleiDebug = params.showNucleiDebug;
      renderer?.render(frame);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(camCommit);
      unsub();
      mo.disconnect();
      ro.disconnect();
      renderer?.dispose();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div ref={hostRef} className="organism-canvas-host">
      <canvas ref={canvasRef} className="organism-canvas" data-testid="organism-canvas" />
      {!glOk && (
        <div className="organism-fallback glass">
          <p className="eyebrow">WEBGL2 UNAVAILABLE</p>
          <p>Switch to Classic canvas from the dock to continue editing.</p>
          <button
            type="button"
            onClick={() => useLab.getState().setSettings({ rendererMode: "classic" })}
          >
            Classic
          </button>
        </div>
      )}
      <div
        ref={labelLayerRef}
        className="organism-label-layer"
        aria-hidden="true"
        data-hidden={!showLabels || annotationMode === "hidden" ? "true" : undefined}
        data-mode={annotationMode}
      >
        {spaces.slice(0, MAX_NUCLEI).map((space) => (
          <div
            key={space.id}
            className="organism-label-anchor"
            data-nucleus-id={space.id}
            data-selected={space.id === selectedId}
          >
            <span className="organism-label-ring" />
            <span className="organism-label">
              {annotationMode === "technical" ? (
                <>
                  <span className="organism-label-main">{space.name}</span>
                  <span className="organism-label-meta">
                    {Math.round(space.area)} m² · {space.category}
                  </span>
                </>
              ) : annotationMode === "editorial" ? (
                <>
                  <span className="organism-label-main">{space.name}</span>
                  <span className="organism-label-meta">{Math.round(space.area)} m²</span>
                </>
              ) : (
                space.name
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
