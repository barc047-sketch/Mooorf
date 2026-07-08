import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Magnet, Palette, Plus, Sparkles, Upload } from "lucide-react";
import { useLab } from "../state/store";
import type { AttachMode, MorphMode, RendererMode } from "../types";
import "./shell.css";

const MAIN_MORPHS = [
  "cellular-reverse",
  "plain-black",
  "plain-white",
] as const satisfies readonly MorphMode[];
const EXTRA_MORPHS = [
  "graphite",
  "wine",
  "auto",
] as const satisfies readonly MorphMode[];
const ATTACH_MODES = ["tight", "soft", "long"] as const satisfies readonly AttachMode[];
const RENDERER_MODES = ["organism", "classic"] as const satisfies readonly RendererMode[];

const MORPH_LABELS: Record<MorphMode, string> = {
  "cellular-reverse": "Cellular Reverse",
  "plain-black": "Plain Black",
  "plain-white": "Plain White",
  graphite: "Graphite",
  wine: "Wine",
  auto: "Auto",
};

const MORPH_CODES: Record<MorphMode, string> = {
  "cellular-reverse": "CEL",
  "plain-black": "BLK",
  "plain-white": "WHT",
  graphite: "GRA",
  wine: "WIN",
  auto: "AUT",
};

const ATTACH_LABELS: Record<AttachMode, string> = {
  tight: "Tight",
  soft: "Soft",
  long: "Long",
};

const ATTACH_HINTS: Record<AttachMode, string> = {
  tight: "only close nuclei fuse",
  soft: "moderate membrane spread",
  long: "long reach, one organism",
};

type PanelId = "morph" | "attach" | null;

// Bottom-center glass dock. Morph + attachment buttons open compact anchored
// micro-panels; the slider fine-tunes reach within the attachment preset.
export default function Dock() {
  const addSpace = useLab((s) => s.addSpace);
  const addDemo = useLab((s) => s.addDemo);
  const mergeDistance = useLab((s) => s.settings.mergeDistance);
  const morphMode = useLab((s) => s.settings.morphMode);
  const attachMode = useLab((s) => s.settings.attachMode);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const setSettings = useLab((s) => s.setSettings);
  const [panel, setPanel] = useState<PanelId>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    const onDown = (e: PointerEvent) => {
      if (!dockRef.current?.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const togglePanel = (id: Exclude<PanelId, null>) =>
    setPanel((open) => (open === id ? null : id));

  const morphRow = (m: MorphMode) => (
    <button
      key={m}
      type="button"
      className="pop-row"
      role="menuitemradio"
      aria-checked={morphMode === m}
      data-active={morphMode === m}
      onClick={() => setSettings({ morphMode: m })}
    >
      <span className="pop-swatch" data-mode={m} />
      <span>{MORPH_LABELS[m]}</span>
    </button>
  );

  return (
    <motion.div
      ref={dockRef}
      className="dock glass"
      initial={{ x: "-50%", y: 24, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      role="toolbar"
      aria-label="Canvas tools"
    >
      <button type="button" className="dock-btn" title="Add space" onClick={() => addSpace()}>
        <Plus size={16} strokeWidth={1.5} />
      </button>
      <button type="button" className="dock-btn" title="Add 10 demo cells" onClick={() => addDemo(10)}>
        <Sparkles size={16} strokeWidth={1.5} />
      </button>

      <span className="dock-sep" />

      <button
        type="button"
        className="dock-btn dock-mode-btn renderer-mode-btn"
        title={`Renderer: ${rendererMode === "organism" ? "Organism" : "Classic"}`}
        aria-label={`Renderer: ${rendererMode === "organism" ? "Organism" : "Classic"}`}
        onClick={() => {
          const next = RENDERER_MODES[(RENDERER_MODES.indexOf(rendererMode) + 1) % RENDERER_MODES.length];
          setSettings({ rendererMode: next });
        }}
      >
        <span className="dock-renderer-code">
          {rendererMode === "organism" ? "ORG" : "CLS"}
        </span>
      </button>

      <div
        className="dock-merge"
        title="Membrane reach — fine-tunes within the attachment preset"
      >
        <span className="dock-merge-label">reach</span>
        <input
          type="range"
          min={0}
          max={300}
          value={mergeDistance}
          onChange={(e) => setSettings({ mergeDistance: Number(e.target.value) })}
          aria-label="Membrane reach fine-tune"
        />
      </div>

      <span className="dock-sep" />

      <div className="dock-pop-anchor">
        <AnimatePresence>
          {panel === "morph" && (
            <motion.div
              key="morph-pop"
              className="dock-pop glass"
              role="menu"
              aria-label="Morph style"
              initial={{ opacity: 0, y: 6, scale: 0.96, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 4, scale: 0.97, x: "-50%" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {MAIN_MORPHS.map(morphRow)}
              <span className="pop-divider" role="separator" />
              {EXTRA_MORPHS.map(morphRow)}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          className="dock-btn dock-mode-btn morph-color-btn"
          title={`Morph style: ${MORPH_LABELS[morphMode]}`}
          aria-label={`Morph style: ${MORPH_LABELS[morphMode]}`}
          aria-haspopup="menu"
          aria-expanded={panel === "morph"}
          data-mode={morphMode}
          data-open={panel === "morph"}
          onClick={() => togglePanel("morph")}
        >
          <Palette size={16} strokeWidth={1.5} />
          <span className="dock-mode-code">{MORPH_CODES[morphMode]}</span>
          <span className="morph-color-swatch" data-mode={morphMode} />
        </button>
      </div>

      <div className="dock-pop-anchor">
        <AnimatePresence>
          {panel === "attach" && (
            <motion.div
              key="attach-pop"
              className="dock-pop dock-pop-attach glass"
              role="menu"
              aria-label="Attachment distance"
              initial={{ opacity: 0, y: 6, scale: 0.96, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 4, scale: 0.97, x: "-50%" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pop-chips">
                {ATTACH_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="pop-chip"
                    role="menuitemradio"
                    aria-checked={attachMode === m}
                    data-active={attachMode === m}
                    title={`${ATTACH_LABELS[m]} — ${ATTACH_HINTS[m]}`}
                    onClick={() => setSettings({ attachMode: m })}
                  >
                    {m[0].toUpperCase()}
                  </button>
                ))}
              </div>
              <span className="dock-pop-caption">{ATTACH_HINTS[attachMode]}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          className="dock-btn dock-mode-btn attach-mode-btn"
          title={`Attachment: ${ATTACH_LABELS[attachMode]} — ${ATTACH_HINTS[attachMode]}`}
          aria-label={`Attachment distance: ${ATTACH_LABELS[attachMode]}`}
          aria-haspopup="menu"
          aria-expanded={panel === "attach"}
          data-mode={attachMode}
          data-open={panel === "attach"}
          onClick={() => togglePanel("attach")}
        >
          <Magnet size={16} strokeWidth={1.5} />
          <span className="dock-mode-code">{attachMode[0].toUpperCase()}</span>
        </button>
      </div>

      <button type="button" className="dock-btn" title="Import CSV (Phase 5)">
        <Upload size={16} strokeWidth={1.5} />
      </button>
      <button type="button" className="dock-btn" title="Export PNG (Phase 7)">
        <Download size={16} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}
