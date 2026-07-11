/* V6E Organism Lab — isolated shader-prototype view.
   Renders one continuous implicit scalar field (WebGL2 fragment shader) driven
   by a CPU nucleus simulation. Per-frame work happens in refs + the rAF loop;
   React state is only touched by panel interactions. Nothing from the main
   canvas/table app is imported. */

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Moon,
  RotateCcw,
  Shuffle,
  Sun,
} from "lucide-react";
import {
  DEFAULT_PARAMS,
  MAX_NUCLEI,
  type LabTheme,
  type NumericParamKey,
  type OrganismParams,
  type OrganismPreset,
  type RGB,
} from "./organism-types";
import { ORGANISM_PRESETS, presetById } from "./organism-presets";
import {
  createSimulation,
  dragNucleusBy,
  expK,
  findNucleusAt,
  packNuclei,
  randomizeNuclei,
  resetSimulation,
  setNucleusDragging,
  stepSimulation,
  syncNucleusCount,
  type SimState,
} from "./organism-motion";
import {
  ATTACHMENT_OPTIONS,
  CONTROL_GROUPS,
  STYLE_OPTIONS,
  effectiveField,
  styleColors,
  uiToneForBg,
  type SliderDef,
} from "./organism-controls";
import {
  createOrganismRenderer,
  type OrganismRenderFrame,
  type OrganismRenderer,
} from "./organism-shader";
import "./organism-lab.css";

interface SmoothState {
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

function presetParams(p: OrganismPreset): OrganismParams {
  return { ...DEFAULT_PARAMS, ...p.params, count: p.specs.length };
}

function SliderRow({
  def,
  value,
  onChange,
}: {
  def: SliderDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="olab-slider">
      <span className="olab-slider-meta">
        <span>{def.label}</span>
        <span className="olab-slider-val">{def.fmt ? def.fmt(value) : String(value)}</span>
      </span>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export default function OrganismLab() {
  const [presetId, setPresetId] = useState(ORGANISM_PRESETS[0].id);
  const [params, setParams] = useState<OrganismParams>(() => presetParams(ORGANISM_PRESETS[0]));
  const [theme, setTheme] = useState<LabTheme>("day");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ organism: true });
  const [glOk, setGlOk] = useState(true);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<OrganismRenderer | null>(null);
  const simRef = useRef<SimState | null>(null);
  const paramsRef = useRef(params);
  const themeRef = useRef(theme);
  const dragRef = useRef<{ id: number; lastFx: number; lastFy: number } | null>(null);

  if (!simRef.current) simRef.current = createSimulation(ORGANISM_PRESETS[0].specs);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const prev = document.title;
    document.title = "ZONUERT — Organism Lab";
    return () => {
      document.title = prev;
    };
  }, []);

  /* renderer + rAF loop (mount once) */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

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
    rendererRef.current = renderer;

    const buf = new Float32Array(MAX_NUCLEI * 4);
    const colorBuf = new Float32Array(MAX_NUCLEI * 3);
    const frame: OrganismRenderFrame = {
      count: 0,
      nuclei: buf,
      nucleusColors: colorBuf,
      mass: 1,
      iso: 1,
      softness: 0.06,
      tension: 1,
      bias: 0.18,
      pocketIso: 8,
      pocketSoft: 0.9,
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
    let smooth: SmoothState | null = null;

    const doResize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer?.resize(rect.width, rect.height, dpr);
    };
    doResize();
    const ro = new ResizeObserver(doResize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
      last = now;

      const p = paramsRef.current;
      const sim = simRef.current;
      if (!sim || !renderer) return;

      syncNucleusCount(sim, p);
      stepSimulation(sim, p, dt);
      frame.count = packNuclei(sim, p, buf);

      /* targets for the uniform smoother */
      const sc = styleColors(p.style, themeRef.current);
      const eff = effectiveField(p);
      if (!smooth) {
        smooth = {
          mass: p.mass,
          iso: p.isoLevel,
          softness: p.edgeSoftness,
          tension: eff.tension,
          bias: eff.bias,
          pocketIso: p.pocketThreshold,
          pocketSoft: p.pocketSoftness,
          pocketAmount: sc.pocketAmount,
          dots: p.showNuclei ? 1 : 0,
          body: [sc.body[0], sc.body[1], sc.body[2]],
          bodyB: [sc.body[0], sc.body[1], sc.body[2]],
          bg: [sc.bg[0], sc.bg[1], sc.bg[2]],
          accent: [0.55, 0.08, 0.14],
          colorMix: 0,
        };
      }
      const kNum = expK(10, dt); /* sliders feel live */
      const kCol = expK(3.4, dt); /* style cross-fades stay liquid */
      smooth.mass += (p.mass - smooth.mass) * kNum;
      smooth.iso += (p.isoLevel - smooth.iso) * kNum;
      smooth.softness += (p.edgeSoftness - smooth.softness) * kNum;
      smooth.tension += (eff.tension - smooth.tension) * kNum;
      smooth.bias += (eff.bias - smooth.bias) * kNum;
      smooth.pocketIso += (p.pocketThreshold - smooth.pocketIso) * kNum;
      smooth.pocketSoft += (p.pocketSoftness - smooth.pocketSoft) * kNum;
      smooth.pocketAmount += (sc.pocketAmount - smooth.pocketAmount) * kCol;
      smooth.dots += ((p.showNuclei ? 1 : 0) - smooth.dots) * kCol;
      for (let i = 0; i < 3; i++) {
        smooth.body[i] += (sc.body[i] - smooth.body[i]) * kCol;
        smooth.bodyB[i] += (sc.body[i] - smooth.bodyB[i]) * kCol;
        smooth.bg[i] += (sc.bg[i] - smooth.bg[i]) * kCol;
      }
      smooth.colorMix += (0 - smooth.colorMix) * kCol;

      frame.mass = smooth.mass;
      frame.iso = smooth.iso;
      frame.softness = smooth.softness;
      frame.tension = smooth.tension;
      frame.bias = smooth.bias;
      frame.pocketIso = smooth.pocketIso;
      frame.pocketSoft = smooth.pocketSoft;
      frame.pocketAmount = smooth.pocketAmount;
      frame.nucleusDots = smooth.dots;
      frame.bodyColor = smooth.body;
      frame.bodyColorB = smooth.bodyB;
      frame.bgColor = smooth.bg;
      frame.accentColor = smooth.accent;
      frame.colorMix = smooth.colorMix;
      frame.fieldDebug = p.showFieldDebug;
      frame.nucleiDebug = p.showNucleiDebug;

      colorBuf.fill(0);
      for (let i = 0; i < frame.count; i += 1) {
        if (buf[i * 4 + 3] <= 0) continue;
        colorBuf[i * 3] = smooth.body[0];
        colorBuf[i * 3 + 1] = smooth.body[1];
        colorBuf[i * 3 + 2] = smooth.body[2];
      }

      renderer.render(frame);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  /* pointer → field coords (matches gl_FragCoord math: y up, shorter axis ±1) */
  const toField = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { fx: 0, fy: 0 };
    const rect = canvas.getBoundingClientRect();
    const mn = Math.min(rect.width, rect.height) / 2 || 1;
    return {
      fx: (clientX - rect.left - rect.width / 2) / mn,
      fy: -(clientY - rect.top - rect.height / 2) / mn,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const sim = simRef.current;
    if (!sim) return;
    const { fx, fy } = toField(e.clientX, e.clientY);
    const id = findNucleusAt(sim, fx, fy);
    if (id === null) return;
    dragRef.current = { id, lastFx: fx, lastFy: fy };
    setNucleusDragging(sim, id, true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic pointer ids throw — same guard as CanvasView */
    }
    e.currentTarget.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    const { fx, fy } = toField(e.clientX, e.clientY);
    const drag = dragRef.current;
    if (drag) {
      dragNucleusBy(sim, paramsRef.current, drag.id, fx - drag.lastFx, fy - drag.lastFy);
      drag.lastFx = fx;
      drag.lastFy = fy;
      return;
    }
    e.currentTarget.style.cursor = findNucleusAt(sim, fx, fy) !== null ? "grab" : "default";
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (sim) setNucleusDragging(sim, null, false);
    dragRef.current = null;
    e.currentTarget.style.cursor = "default";
  };

  const setNum = (key: NumericParamKey, v: number) =>
    setParams((prev) => ({ ...prev, [key]: v }));

  const applyPreset = (p: OrganismPreset) => {
    setPresetId(p.id);
    setParams(presetParams(p));
    const sim = simRef.current;
    if (sim) resetSimulation(sim, p.specs);
    dragRef.current = null;
  };

  const resetCurrent = () => applyPreset(presetById(presetId));

  const randomize = () => {
    const sim = simRef.current;
    if (sim) randomizeNuclei(sim, paramsRef.current);
  };

  const activeColors = styleColors(params.style, theme);
  const uiTone = uiToneForBg(activeColors.bg);

  return (
    <div
      className="olab-root"
      data-olab-theme={uiTone}
      style={{ backgroundColor: activeColors.bgHex }}
    >
      <div className="olab-canvas-wrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="olab-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      </div>

      {!glOk && (
        <div className="olab-fallback">
          <p className="olab-fallback-title">WebGL2 unavailable</p>
          <p>
            The organism lab renders through a WebGL2 fragment shader. Open it in a
            WebGL2-capable browser — architecture notes live in docs/ORGANISM_LAB_SPEC.md.
          </p>
        </div>
      )}

      <header className="olab-top">
        <div className="olab-brand">
          <a className="olab-back" href="/">
            ← canvas
          </a>
          <span className="olab-title">ZONUERT · Organism Lab</span>
          <span className="olab-tag">V6E</span>
        </div>
        <div className="olab-presets">
          {ORGANISM_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={presetId === p.id ? "olab-chip olab-chip-active" : "olab-chip"}
              title={p.hint}
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <button
        type="button"
        className="olab-theme"
        title="Lab day/night"
        onClick={() => setTheme((t) => (t === "day" ? "night" : "day"))}
      >
        {theme === "day" ? <Moon size={13} /> : <Sun size={13} />}
      </button>

      <aside className="olab-inspector">
        {CONTROL_GROUPS.map((g) => {
          const open = !!openGroups[g.id];
          return (
            <section key={g.id} className="olab-group">
              <button
                type="button"
                className="olab-group-head"
                aria-expanded={open}
                onClick={() => setOpenGroups((prev) => ({ ...prev, [g.id]: !prev[g.id] }))}
              >
                <span>{g.title}</span>
                <ChevronDown size={11} className={open ? "olab-chev olab-chev-open" : "olab-chev"} />
              </button>
              {open && (
                <div className="olab-group-body">
                  {g.sliders.map((s) => (
                    <SliderRow
                      key={s.key}
                      def={s}
                      value={params[s.key]}
                      onChange={(v) => setNum(s.key, v)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
        <section className="olab-group">
          <button
            type="button"
            className="olab-group-head"
            aria-expanded={!!openGroups.debug}
            onClick={() => setOpenGroups((prev) => ({ ...prev, debug: !prev.debug }))}
          >
            <span>Debug</span>
            <ChevronDown
              size={11}
              className={openGroups.debug ? "olab-chev olab-chev-open" : "olab-chev"}
            />
          </button>
          {!!openGroups.debug && (
            <div className="olab-group-body">
              <button
                type="button"
                className={params.showFieldDebug ? "olab-toggle olab-toggle-on" : "olab-toggle"}
                onClick={() => setParams((p) => ({ ...p, showFieldDebug: !p.showFieldDebug }))}
              >
                Field Debug
              </button>
              <button
                type="button"
                className={params.showNucleiDebug ? "olab-toggle olab-toggle-on" : "olab-toggle"}
                onClick={() => setParams((p) => ({ ...p, showNucleiDebug: !p.showNucleiDebug }))}
              >
                Nuclei Debug
              </button>
            </div>
          )}
        </section>
      </aside>

      <footer className="olab-dock">
        <div className="olab-dock-seg">
          {STYLE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={params.style === o.id ? "olab-chip olab-chip-active" : "olab-chip"}
              title={o.label}
              onClick={() => setParams((p) => ({ ...p, style: o.id }))}
            >
              {o.short}
            </button>
          ))}
        </div>
        <span className="olab-div" />
        <div className="olab-dock-seg">
          {ATTACHMENT_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={params.attachment === o.id ? "olab-sq olab-sq-active" : "olab-sq"}
              title={`${o.label} attachment`}
              onClick={() => setParams((p) => ({ ...p, attachment: o.id }))}
            >
              {o.short}
            </button>
          ))}
        </div>
        <span className="olab-div" />
        <div className="olab-dock-seg olab-dock-offset">
          <span className="olab-mini-label">offset</span>
          <input
            type="range"
            min={0.2}
            max={2.2}
            step={0.01}
            value={params.globalOffset}
            onChange={(e) => setNum("globalOffset", Number(e.target.value))}
          />
        </div>
        <span className="olab-div" />
        <div className="olab-dock-seg">
          <button
            type="button"
            className="olab-icon"
            title={params.showNuclei ? "Hide nuclei" : "Show nuclei"}
            onClick={() => setParams((p) => ({ ...p, showNuclei: !p.showNuclei }))}
          >
            {params.showNuclei ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button type="button" className="olab-icon" title="Randomize layout" onClick={randomize}>
            <Shuffle size={13} />
          </button>
          <button type="button" className="olab-icon" title="Reset preset" onClick={resetCurrent}>
            <RotateCcw size={13} />
          </button>
        </div>
      </footer>
    </div>
  );
}
