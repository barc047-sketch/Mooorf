/* V6H.1 — production organism control surface.
   One premium floating glass panel (right-anchored, internal scroll) exposing
   the full Organism Lab parameter model against the production store. Sections
   render from ORG_CONTROL_SECTIONS metadata; style/attachment/palette reuse the
   same store settings the dock popovers write. No per-frame React state — the
   canvas consumes every change through its existing subscribe/ref path. */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, GripVertical, Minus, X } from "lucide-react";
import { useLab } from "../state/store";
import { NUCLEUS_PALETTES, ORGANISM_PALETTES } from "../design/palettes";
import { CATEGORY_TOKENS, getCategoryColor } from "../design/colorMapping";
import type {
  AnnotationMode,
  AttachMode,
  LayoutPresetId,
  MorphMode,
  PaletteMode,
  SelectionDisplay,
} from "../types";
import { LAYOUT_PRESETS, VOID_LAYOUT_PRESET } from "../canvas/layoutPresets";
import { MAX_NUCLEI } from "../experiments/organism-lab/organism-types";
import {
  DEFAULT_ORGANISM_SETTINGS,
  MOTION_DEFAULTS,
  ORG_CONTROL_SECTIONS,
  type NumericOrgKey,
  type OrgSliderDef,
} from "../canvas/organismProductionSettings";
import "./shell.css";

export const MORPH_DESCRIPTIONS: Record<MorphMode, string> = {
  "cellular-reverse": "Pocketed membrane · theme-inverting",
  "plain-black": "Solid ink silhouette",
  "plain-white": "Bone body on deep ground",
  graphite: "Quiet technical grey",
  wine: "Graph noir identity",
  auto: "Follows day / night",
};

export const PALETTE_DESCRIPTIONS: Record<PaletteMode, string> = {
  core: "Black bone · monochrome base",
  surreal: "Restrained spectral accents",
  architecture: "Category-tinted program",
  auto: "Adapts to style + theme",
};

export const ATTACH_HINTS: Record<AttachMode, string> = {
  tight: "Close fusion",
  soft: "Balanced membrane",
  long: "Connected reach",
  extreme: "Experimental far reach",
};

const MORPHS: { id: MorphMode; label: string }[] = [
  { id: "cellular-reverse", label: "Cellular Reverse" },
  { id: "plain-black", label: "Plain Black" },
  { id: "plain-white", label: "Plain White" },
  { id: "graphite", label: "Graphite" },
  { id: "wine", label: "Wine" },
  { id: "auto", label: "Auto" },
];

const PALETTES: { id: PaletteMode; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "surreal", label: "Surreal" },
  { id: "architecture", label: "Architecture" },
  { id: "auto", label: "Auto" },
];

const ATTACHES: { id: AttachMode; label: string }[] = [
  { id: "tight", label: "Tight" },
  { id: "soft", label: "Soft" },
  { id: "long", label: "Long" },
  { id: "extreme", label: "Extreme" },
];

const ANNOTATIONS: { id: AnnotationMode; label: string; desc: string }[] = [
  { id: "editorial", label: "Editorial", desc: "Name + area, no label box" },
  { id: "pill", label: "Pill", desc: "Compact rounded label" },
  { id: "technical", label: "Technical", desc: "Name, area, category" },
  { id: "hidden", label: "Hidden", desc: "No canvas labels" },
];

const SELECTIONS: { id: SelectionDisplay; label: string; desc: string }[] = [
  { id: "tight", label: "Tight", desc: "Small normal selection ring" },
  { id: "halo", label: "Halo", desc: "Soft medium focus halo" },
  { id: "influence", label: "Influence", desc: "Large future measurement circle" },
];

const LAYOUT_CODES: Record<LayoutPresetId, string> = {
  organic: "OG",
  random: "RA",
  core: "CO",
  colony: "CL",
  division: "DV",
  tendril: "TD",
  orbit: "OR",
  asymmetry: "AS",
};

function SliderRow({
  def,
  value,
  onChange,
}: {
  def: OrgSliderDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="org-slider">
      <span className="org-slider-meta">
        <span>{def.label}</span>
        <span className="org-slider-val">{def.fmt ? def.fmt(value) : String(value)}</span>
      </span>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={def.label}
      />
    </label>
  );
}

function SwitchRow({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="org-switch-row"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className="org-switch" data-on={on ? "true" : "false"}>
        <span className="org-switch-thumb" />
      </span>
    </button>
  );
}

function Section({
  id,
  title,
  hint,
  open,
  onToggle,
  children,
  sectionRef,
  extra,
}: {
  id: string;
  title: string;
  hint?: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  sectionRef?: (el: HTMLElement | null) => void;
  /** header-level control (e.g. a master switch) — sibling of the toggle, never nested */
  extra?: React.ReactNode;
}) {
  return (
    <section className="org-sec" ref={sectionRef}>
      <div className="org-sec-headwrap">
        <button
          type="button"
          className="org-sec-head"
          data-has-extra={extra ? "true" : undefined}
          aria-expanded={open}
          onClick={() => onToggle(id)}
        >
          <span className="org-sec-title">{title}</span>
          {hint && <span className="org-sec-hint">{hint}</span>}
          <ChevronDown size={11} className="org-chev" data-open={open ? "true" : "false"} />
        </button>
        {extra && <span className="org-sec-extra">{extra}</span>}
      </div>
      {open && <div className="org-sec-body">{children}</div>}
    </section>
  );
}

function MiniSwitch({
  on,
  label,
  onToggle,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="org-mini-switch"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <span className="org-switch" data-on={on ? "true" : "false"}>
        <span className="org-switch-thumb" />
      </span>
    </button>
  );
}

export default function OrganismControlPanel() {
  const open = useLab((s) => s.orgPanelOpen);
  const focus = useLab((s) => s.orgPanelFocus);
  const setOrgPanel = useLab((s) => s.setOrgPanel);
  const organism = useLab((s) => s.settings.organism);
  const morphMode = useLab((s) => s.settings.morphMode);
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const layoutPreset = useLab((s) => s.settings.layoutPreset);
  const attachMode = useLab((s) => s.settings.attachMode);
  const annotationMode = useLab((s) => s.settings.annotationMode);
  const selectionDisplay = useLab((s) => s.settings.selectionDisplay);
  const mergeDistance = useLab((s) => s.settings.mergeDistance);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const spaceCount = useLab((s) => s.spaces.length);
  const setSettings = useLab((s) => s.setSettings);
  const setOrganism = useLab((s) => s.setOrganism);
  const applyLayoutPreset = useLab((s) => s.applyLayoutPreset);

  const panelRef = useRef<HTMLElement>(null);
  const sectionEls = useRef<Record<string, HTMLElement | null>>({});
  const [openSecs, setOpenSecs] = useState<Record<string, boolean>>({ organism: true });
  const [minimized, setMinimized] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  /* focus requests from rail launchers expand + reveal the target section */
  useEffect(() => {
    if (!open || !focus) return;
    setMinimized(false);
    setOpenSecs((prev) => ({ ...prev, [focus]: true }));
    const t = window.setTimeout(
      () => sectionEls.current[focus]?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
      40
    );
    return () => window.clearTimeout(t);
  }, [open, focus]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (panelRef.current?.contains(t as Node)) return;
      if (t?.closest?.("[data-orgpanel-keep]")) return;
      setOrgPanel(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOrgPanel(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOrgPanel]);

  const toggleSec = (id: string) => setOpenSecs((prev) => ({ ...prev, [id]: !prev[id] }));
  const setNum = (key: NumericOrgKey, v: number) => setOrganism({ [key]: v });
  const bindSec = (id: string) => (el: HTMLElement | null) => {
    sectionEls.current[id] = el;
  };

  const metaSections = Object.fromEntries(ORG_CONTROL_SECTIONS.map((s) => [s.id, s]));

  /* motion master toggle — off zeroes idle-life amounts (safe: sliders keep
     working), on applies a gentle preset without touching response/phase */
  const motionOn =
    organism.timeScale > 0 &&
    (organism.drift > 0.001 || organism.breathing > 0.001 || organism.wobble > 0.001);
  const toggleMotion = () =>
    motionOn
      ? setOrganism({ drift: 0, breathing: 0, wobble: 0 })
      : setOrganism({
          drift: 0.28,
          breathing: 0.3,
          wobble: 0.12,
          timeScale: Math.max(organism.timeScale, 1),
        });

  const debugLive = organism.showFieldDebug || organism.showNucleiDebug;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={panelRef}
          className="org-panel glass"
          data-min={minimized ? "true" : undefined}
          role="dialog"
          aria-label="Organism controls"
          initial={{ opacity: 0, x: 16, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 12, scale: 0.99 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="org-head">
            <span className="org-grip" title="Panel docking — coming later" aria-hidden="true">
              <GripVertical size={12} strokeWidth={1.5} />
            </span>
            <div className="org-head-titles">
              <span className="org-head-eyebrow">ORGANISM</span>
              <span className="org-head-title">Control Surface</span>
            </div>
            <span className="org-head-count">
              {spaceCount}
              <i>/{MAX_NUCLEI}</i>
            </span>
            <button
              type="button"
              className="org-close"
              aria-label={minimized ? "Expand panel" : "Minimize panel"}
              aria-expanded={!minimized}
              onClick={() => setMinimized((m) => !m)}
            >
              <Minus size={13} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="org-close"
              aria-label="Close organism controls"
              onClick={() => setOrgPanel(false)}
            >
              <X size={13} strokeWidth={1.6} />
            </button>
          </header>

          {rendererMode === "classic" && (
            <p className="org-note">Classic fallback active — detail settings drive the ORG renderer.</p>
          )}

          <div className="org-scroll">
            <Section
              id="annotation"
              title="Annotation"
              hint="labels + selection"
              open={!!openSecs.annotation}
              onToggle={toggleSec}
              sectionRef={bindSec("annotation")}
            >
              <span className="org-subcap">label mode</span>
              {ANNOTATIONS.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className="org-choice"
                  role="menuitemradio"
                  aria-checked={annotationMode === mode.id}
                  data-active={annotationMode === mode.id}
                  onClick={() => setSettings({ annotationMode: mode.id })}
                >
                  <span className="org-choice-text">
                    <span className="org-choice-name">{mode.label}</span>
                    <span className="org-choice-desc">{mode.desc}</span>
                  </span>
                </button>
              ))}
              <span className="pop-divider" role="separator" />
              <span className="org-subcap">selection display</span>
              {SELECTIONS.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className="org-choice"
                  role="menuitemradio"
                  aria-checked={selectionDisplay === mode.id}
                  data-active={selectionDisplay === mode.id}
                  onClick={() => setSettings({ selectionDisplay: mode.id })}
                >
                  <span className="org-choice-text">
                    <span className="org-choice-name">{mode.label}</span>
                    <span className="org-choice-desc">{mode.desc}</span>
                  </span>
                </button>
              ))}
            </Section>

            <Section
              id="layout"
              title="Layout"
              hint="colony arrangement"
              open={!!openSecs.layout}
              onToggle={toggleSec}
              sectionRef={bindSec("layout")}
            >
              <div className="layout-grid">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="layout-choice"
                    aria-pressed={layoutPreset === preset.id}
                    data-active={layoutPreset === preset.id}
                    onClick={() => applyLayoutPreset(preset.id)}
                  >
                    <span className="layout-code">{LAYOUT_CODES[preset.id]}</span>
                    <span className="layout-copy">
                      <span className="layout-name">{preset.label}</span>
                      <span className="layout-hint">{preset.hint}</span>
                    </span>
                  </button>
                ))}
                <button type="button" className="layout-choice" disabled>
                  <span className="layout-code">VD</span>
                  <span className="layout-copy">
                    <span className="layout-name">{VOID_LAYOUT_PRESET.label}</span>
                    <span className="layout-hint">{VOID_LAYOUT_PRESET.hint}</span>
                  </span>
                </button>
              </div>
            </Section>

            <Section
              id="style"
              title="Style"
              hint="render behavior"
              open={!!openSecs.style}
              onToggle={toggleSec}
              sectionRef={bindSec("style")}
            >
              {MORPHS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="org-choice"
                  role="menuitemradio"
                  aria-checked={morphMode === m.id}
                  data-active={morphMode === m.id}
                  onClick={() => setSettings({ morphMode: m.id })}
                >
                  <span className="pop-swatch" data-mode={m.id} />
                  <span className="org-choice-text">
                    <span className="org-choice-name">{m.label}</span>
                    <span className="org-choice-desc">{MORPH_DESCRIPTIONS[m.id]}</span>
                  </span>
                </button>
              ))}
              <span className="pop-divider" role="separator" />
              <span className="org-subcap">palette</span>
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="org-choice"
                  role="menuitemradio"
                  aria-checked={paletteMode === p.id}
                  data-active={paletteMode === p.id}
                  onClick={() => setSettings({ paletteMode: p.id })}
                >
                  <span className="palette-swatch" data-palette={p.id} />
                  <span className="org-choice-text">
                    <span className="org-choice-name">{p.label}</span>
                    <span className="org-choice-desc">{PALETTE_DESCRIPTIONS[p.id]}</span>
                  </span>
                </button>
              ))}

              <span className="pop-divider" role="separator" />
              <span className="org-subcap">program mapping</span>
              <div className="category-map-grid">
                {CATEGORY_TOKENS.map((token) => {
                  const mappedColor = getCategoryColor(
                    token.label,
                    "shared",
                    140,
                    paletteMode,
                    { min: 20, max: 300 }
                  );
                  return (
                    <span key={token.id} className="category-token" title={token.aliases.join(", ")}>
                      <i
                        style={{
                          background: mappedColor.fill,
                          borderColor: mappedColor.ring,
                        }}
                      />
                      <span>{token.label}</span>
                    </span>
                  );
                })}
              </div>

              <span className="pop-divider" role="separator" />
              <span className="org-subcap">nucleus palettes</span>
              {NUCLEUS_PALETTES.map((p) => (
                <div key={p.id} className="pal-row" title={p.use}>
                  <span className="pal-meta">
                    <span className="pal-name">{p.label}</span>
                    <span className="pal-count">{p.shades.length}</span>
                  </span>
                  <span className="pal-ramp">
                    {p.shades.map((shade) => (
                      <i key={shade} style={{ background: shade }} />
                    ))}
                  </span>
                </div>
              ))}

              <span className="org-subcap">organism palettes</span>
              {ORGANISM_PALETTES.map((p) => (
                <div key={p.id} className="pal-row" title={p.use}>
                  <span className="pal-meta">
                    <span className="pal-name">{p.label}</span>
                  </span>
                  <span className="pal-field">
                    <i style={{ background: `linear-gradient(90deg, ${p.ground.join(", ")})` }} />
                    <i style={{ background: `linear-gradient(90deg, ${p.body.join(", ")})` }} />
                    <i style={{ background: `linear-gradient(90deg, ${p.accent.join(", ")})` }} />
                  </span>
                </div>
              ))}

              <span className="org-subcap">gradients</span>
              <div className="pal-grads">
                {ORGANISM_PALETTES.map((p) => (
                  <span
                    key={p.id}
                    className="pal-grad"
                    title={`${p.label} blend`}
                    style={{
                      background: `linear-gradient(135deg, ${[...p.body, ...p.accent].join(", ")})`,
                    }}
                  />
                ))}
              </div>

              <button type="button" className="pal-custom" disabled>
                Custom palette — coming later
              </button>
            </Section>

            <Section
              id="organism"
              title={metaSections.organism.title}
              hint={metaSections.organism.hint}
              open={!!openSecs.organism}
              onToggle={toggleSec}
              sectionRef={bindSec("organism")}
            >
              {metaSections.organism.sliders.map((def) => (
                <SliderRow
                  key={def.key}
                  def={def}
                  value={organism[def.key]}
                  onChange={(v) => setNum(def.key, v)}
                />
              ))}
            </Section>

            <Section
              id="nuclei"
              title={metaSections.nuclei.title}
              hint={metaSections.nuclei.hint}
              open={!!openSecs.nuclei}
              onToggle={toggleSec}
              sectionRef={bindSec("nuclei")}
            >
              <div className="org-readout">
                <span>Count</span>
                <span className="org-readout-val">
                  {spaceCount} <i>from spaces</i>
                </span>
              </div>
              {metaSections.nuclei.sliders.map((def) => (
                <SliderRow
                  key={def.key}
                  def={def}
                  value={organism[def.key]}
                  onChange={(v) => setNum(def.key, v)}
                />
              ))}
            </Section>

            <Section
              id="offset"
              title={metaSections.offset.title}
              hint={metaSections.offset.hint}
              open={!!openSecs.offset}
              onToggle={toggleSec}
              sectionRef={bindSec("offset")}
            >
              <div className="org-attach-chips">
                {ATTACHES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="pop-chip"
                    role="menuitemradio"
                    aria-checked={attachMode === a.id}
                    data-active={attachMode === a.id}
                    onClick={() => setSettings({ attachMode: a.id })}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <p className="org-attach-hint">{ATTACH_HINTS[attachMode]}</p>
              <label className="org-slider">
                <span className="org-slider-meta">
                  <span>Reach / Density</span>
                  <span className="org-slider-val">{Math.round(mergeDistance / 3)}%</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={mergeDistance}
                  onChange={(e) => setSettings({ mergeDistance: Number(e.target.value) })}
                  aria-label="Reach density"
                />
              </label>
              {metaSections.offset.sliders.map((def) => (
                <SliderRow
                  key={def.key}
                  def={def}
                  value={organism[def.key]}
                  onChange={(v) => setNum(def.key, v)}
                />
              ))}
            </Section>

            <Section
              id="motion"
              title={metaSections.motion.title}
              hint={metaSections.motion.hint}
              open={!!openSecs.motion}
              onToggle={toggleSec}
              sectionRef={bindSec("motion")}
              extra={<MiniSwitch on={motionOn} label="Idle motion" onToggle={toggleMotion} />}
            >
              {metaSections.motion.sliders.map((def) => (
                <SliderRow
                  key={def.key}
                  def={def}
                  value={organism[def.key]}
                  onChange={(v) => setNum(def.key, v)}
                />
              ))}
            </Section>

            <Section
              id="pockets"
              title={metaSections.pockets.title}
              hint={metaSections.pockets.hint}
              open={!!openSecs.pockets}
              onToggle={toggleSec}
              sectionRef={bindSec("pockets")}
            >
              {metaSections.pockets.sliders.map((def) => (
                <SliderRow
                  key={def.key}
                  def={def}
                  value={organism[def.key]}
                  onChange={(v) => setNum(def.key, v)}
                />
              ))}
            </Section>

            <Section
              id="display"
              title="Display"
              hint="overlays + debug"
              open={!!openSecs.display}
              onToggle={toggleSec}
              sectionRef={bindSec("display")}
            >
              <SwitchRow
                label="Show labels"
                on={organism.showLabels}
                onToggle={() => setOrganism({ showLabels: !organism.showLabels })}
              />
              <SwitchRow
                label="Show nuclei dots"
                on={organism.showNuclei}
                onToggle={() => setOrganism({ showNuclei: !organism.showNuclei })}
              />
              <span className="pop-divider" role="separator" />
              <button
                type="button"
                className="org-adv-toggle"
                aria-expanded={debugOpen}
                data-live={debugLive ? "true" : undefined}
                onClick={() => setDebugOpen((o) => !o)}
              >
                <span>Advanced debug</span>
                <ChevronDown
                  size={10}
                  className="org-chev"
                  data-open={debugOpen ? "true" : "false"}
                />
              </button>
              {debugOpen && (
                <>
                  <SwitchRow
                    label="Field debug"
                    on={organism.showFieldDebug}
                    onToggle={() => setOrganism({ showFieldDebug: !organism.showFieldDebug })}
                  />
                  <SwitchRow
                    label="Nuclei debug"
                    on={organism.showNucleiDebug}
                    onToggle={() => setOrganism({ showNucleiDebug: !organism.showNucleiDebug })}
                  />
                </>
              )}
            </Section>
          </div>

          <footer className="org-foot">
            <button
              type="button"
              className="org-reset"
              onClick={() => setOrganism({ ...DEFAULT_ORGANISM_SETTINGS })}
            >
              Reset organism
            </button>
            <button
              type="button"
              className="org-reset"
              onClick={() => setOrganism({ ...MOTION_DEFAULTS })}
            >
              Reset motion
            </button>
            <button
              type="button"
              className="org-reset"
              onClick={() => setOrganism({ showFieldDebug: false, showNucleiDebug: false })}
            >
              Debug off
            </button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
