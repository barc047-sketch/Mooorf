import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLab } from "../state/store";
import { clamp } from "../lib/geometry";
import {
  getAreaRange,
  getNucleusColor,
  getOrganismPalette,
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
import "./organismCanvas.css";

const DPR_MAX = 2;
const Z_MIN = 0.25;
const Z_MAX = 4;
const DRAG_COMMIT_MS = 90;
const MIN_AREA = 1;

interface EditDraft {
  id: string;
  name: string;
  area: string;
}

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
  const [glOk, setGlOk] = useState(true);
  const spaces = useLab((s) => s.spaces);
  const selectedId = useLab((s) => s.selectedId);
  const showLabels = useLab((s) => s.settings.organism.showLabels);
  const annotationMode = useLab((s) => s.settings.annotationMode);
  const annotationDetail = useLab((s) => s.settings.annotationDetail);
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const nucleusPaletteId = useLab((s) => s.settings.nucleusPaletteId);
  const showGrid = useLab((s) => s.settings.showGrid);
  const updateSpace = useLab((s) => s.updateSpace);
  const areaRange = useMemo(() => getAreaRange(spaces), [spaces]);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const selectedSpace = useMemo(
    () => spaces.find((space) => space.id === selectedId) ?? null,
    [spaces, selectedId]
  );

  useEffect(() => {
    if (editDraft && editDraft.id !== selectedId) setEditDraft(null);
  }, [editDraft, selectedId]);

  const stopEditPointer = (event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const beginEdit = (space: typeof selectedSpace) => {
    if (!space) return;
    setEditDraft({
      id: space.id,
      name: space.name,
      area: String(space.area),
    });
  };

  const cancelEdit = () => setEditDraft(null);

  const commitEdit = () => {
    if (!editDraft) return;
    const current = spaces.find((space) => space.id === editDraft.id);
    const parsedArea = Number.parseFloat(editDraft.area);
    const patch = {
      name: editDraft.name.trim() || "Untitled Space",
      area: Number.isFinite(parsedArea)
        ? Math.max(MIN_AREA, parsedArea)
        : current?.area ?? MIN_AREA,
    };
    updateSpace(editDraft.id, patch);
    setEditDraft(null);
  };

  const onEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commitEdit();
  };

  const onEditKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    cancelEdit();
  };

  const onEditBlur = (event: FocusEvent<HTMLFormElement>) => {
    const nextFocus = event.relatedTarget;
    if (nextFocus instanceof Node && event.currentTarget.contains(nextFocus)) return;
    commitEdit();
  };

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
      bodyColorB: [0, 0, 0],
      bgColor: [1, 1, 1],
      accentColor: [0.55, 0.08, 0.14],
      colorMix: 0,
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
      spacesToNuclei(
        spaces,
        cam,
        w,
        h,
        selectedId,
        drag,
        resolved.adapter,
        motionState,
        settings.paletteMode,
        settings.nucleusPaletteId
      );

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
                : 1.05; // tight default — a crisp ring hugging the nucleus
          const size = `${Math.max(14, nucleus.screenR * ringFactor)}px`;
          ring.style.width = size;
          ring.style.height = size;
        }
        const selection = anchor.querySelector<HTMLElement>(".organism-selection-system");
        if (selection) {
          const arcFactor =
            settings.selectionDisplay === "influence"
              ? 3.8
              : settings.selectionDisplay === "halo"
                ? 2.5
                : 1.45;
          const arcSize = Math.max(58, Math.min(220, nucleus.screenR * arcFactor + 22));
          selection.style.width = `${arcSize}px`;
          selection.style.height = `${arcSize}px`;
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
      const palette = getOrganismPalette(
        settings.paletteMode,
        theme,
        { bodyHex: sc.bodyHex, bgHex: sc.bgHex },
        settings.organismPaletteId,
        {
          spaces: spaces.slice(0, MAX_NUCLEI),
          areaRange: getAreaRange(spaces),
          nucleusPaletteId: settings.nucleusPaletteId,
        }
      );
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
      syncGrid();

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
      frame.bodyColorB = smooth.bodyB;
      frame.bgColor = smooth.bg;
      frame.accentColor = smooth.accent;
      frame.colorMix = smooth.colorMix;
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
      {showGrid && <div ref={gridRef} className="organism-grid" aria-hidden="true" />}
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
        data-hidden={!showLabels || annotationMode === "hidden" ? "true" : undefined}
        data-mode={annotationMode}
        data-position={annotationDetail.position}
        data-bbox={annotationDetail.boundingBox ? "true" : undefined}
        style={{ "--label-scale": annotationDetail.textScale } as CSSProperties}
      >
        {spaces.slice(0, MAX_NUCLEI).map((space) => {
          const mappedColor = getNucleusColor(space, paletteMode, areaRange, nucleusPaletteId);
          const kind = space.kind === "void" ? "void" : "space";
          const selected = space.id === selectedId;
          const editing = editDraft?.id === space.id;
          const labelStyle = {
            "--nucleus-color": mappedColor.fill,
            "--nucleus-ring": mappedColor.ring,
            "--nucleus-muted": mappedColor.muted,
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
              data-selected={selected}
              style={labelStyle}
            >
              <span className="organism-label-ring" />
              {selected && (
                <span
                  className="organism-selection-system"
                  data-editing={editing ? "true" : undefined}
                >
                  <svg className="organism-selection-arc" viewBox="0 0 100 100" aria-hidden="true">
                    <path
                      className="selection-arc-path selection-arc-path--primary"
                      d="M 18 64 A 37 37 0 0 1 82 32"
                    />
                    <path
                      className="selection-arc-path selection-arc-path--ghost"
                      d="M 78 72 A 40 40 0 0 1 36 86"
                    />
                    <circle className="selection-arc-dot" cx="18" cy="64" r="2.6" />
                    <circle className="selection-arc-dot selection-arc-dot--end" cx="82" cy="32" r="2.2" />
                  </svg>
                  <span className="selection-metadata">
                    <span className="selection-type">
                      {kind === "void" ? "Void" : mappedColor.token.label}
                    </span>
                    <span className="selection-title">{space.name}</span>
                    <span className="selection-detail">
                      {Math.round(space.area)} m² · {kind === "void" ? "subtractive" : space.category}
                    </span>
                    <button
                      type="button"
                      className="selection-edit-chip"
                      onPointerDown={stopEditPointer}
                      onClick={() => beginEdit(space)}
                    >
                      Edit
                    </button>
                  </span>
                  {editing && (
                    <form
                      className="selection-edit-popover glass"
                      onSubmit={onEditSubmit}
                      onKeyDown={onEditKeyDown}
                      onBlur={onEditBlur}
                      onPointerDown={stopEditPointer}
                    >
                      <label>
                        <span>Name</span>
                        <input
                          value={editDraft.name}
                          onChange={(event) =>
                            setEditDraft((draft) =>
                              draft ? { ...draft, name: event.target.value } : draft
                            )
                          }
                          autoFocus
                          aria-label="Canvas nucleus name"
                        />
                      </label>
                      <label>
                        <span>Area</span>
                        <input
                          type="number"
                          min={MIN_AREA}
                          inputMode="decimal"
                          value={editDraft.area}
                          onChange={(event) =>
                            setEditDraft((draft) =>
                              draft ? { ...draft, area: event.target.value } : draft
                            )
                          }
                          aria-label="Canvas nucleus area"
                        />
                      </label>
                      <div className="selection-edit-actions">
                        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button type="submit" onMouseDown={(event) => event.preventDefault()}>
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </span>
              )}
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
