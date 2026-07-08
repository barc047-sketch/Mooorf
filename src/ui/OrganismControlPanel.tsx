/* V6H.1 — production organism control surface.
   One premium floating glass panel (right-anchored, internal scroll) exposing
   the full Organism Lab parameter model against the production store. Sections
   render from ORG_CONTROL_SECTIONS metadata; style/attachment/palette reuse the
   same store settings the dock popovers write. No per-frame React state — the
   canvas consumes every change through its existing subscribe/ref path. */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { useLab } from "../state/store";
import type { AttachMode, MorphMode, PaletteMode } from "../types";
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
}: {
  id: string;
  title: string;
  hint?: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  sectionRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <section className="org-sec" ref={sectionRef}>
      <button
        type="button"
        className="org-sec-head"
        aria-expanded={open}
        onClick={() => onToggle(id)}
      >
        <span className="org-sec-title">{title}</span>
        {hint && <span className="org-sec-hint">{hint}</span>}
        <ChevronDown size={11} className="org-chev" data-open={open ? "true" : "false"} />
      </button>
      {open && <div className="org-sec-body">{children}</div>}
    </section>
  );
}

export default function OrganismControlPanel() {
  const open = useLab((s) => s.orgPanelOpen);
  const focus = useLab((s) => s.orgPanelFocus);
  const setOrgPanel = useLab((s) => s.setOrgPanel);
  const organism = useLab((s) => s.settings.organism);
  const morphMode = useLab((s) => s.settings.morphMode);
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const attachMode = useLab((s) => s.settings.attachMode);
  const mergeDistance = useLab((s) => s.settings.mergeDistance);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const spaceCount = useLab((s) => s.spaces.length);
  const setSettings = useLab((s) => s.setSettings);
  const setOrganism = useLab((s) => s.setOrganism);

  const panelRef = useRef<HTMLElement>(null);
  const sectionEls = useRef<Record<string, HTMLElement | null>>({});
  const [openSecs, setOpenSecs] = useState<Record<string, boolean>>({ organism: true });

  /* focus requests from rail launchers expand + reveal the target section */
  useEffect(() => {
    if (!open || !focus) return;
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

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={panelRef}
          className="org-panel glass"
          role="dialog"
          aria-label="Organism controls"
          initial={{ opacity: 0, x: 16, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 12, scale: 0.99 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="org-head">
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
              <span className="org-subcap">debug</span>
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
