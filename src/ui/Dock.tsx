import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Magnet,
  Minus,
  Paintbrush,
  Palette,
  Plus,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { useLab } from "../state/store";
import type { AttachMode, MorphMode, PaletteMode, RendererMode } from "../types";
import {
  ATTACH_HINTS,
  MORPH_DESCRIPTIONS,
  PALETTE_DESCRIPTIONS,
} from "./OrganismControlPanel";
import SavedViewsPanel from "./SavedViewsPanel";
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
const ATTACH_MODES = [
  "tight",
  "soft",
  "long",
  "extreme",
] as const satisfies readonly AttachMode[];
const PALETTE_MODES = [
  "core",
  "surreal",
  "architecture",
  "auto",
] as const satisfies readonly PaletteMode[];
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
  extreme: "Extreme",
};

const PALETTE_LABELS: Record<PaletteMode, string> = {
  core: "Core",
  surreal: "Surreal",
  architecture: "Architecture",
  auto: "Auto",
};

type PanelId = "style" | "attach" | "palette" | "saved" | null;
type PopAlign = "left" | "center" | "right";

interface DockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function DockGroup({
  side,
  collapsed,
  children,
}: {
  side: "left" | "center" | "right";
  collapsed?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`dock-group dock-group-${side}`}
      data-side={side}
      data-collapsed={collapsed ? "true" : undefined}
    >
      {children}
    </div>
  );
}

function DockButton({ active, className = "", children, ...props }: DockButtonProps) {
  return (
    <button
      type="button"
      className={["dock-btn", className].filter(Boolean).join(" ")}
      data-active={active ? "true" : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

function DockPopover({
  open,
  label,
  align = "center",
  className = "",
  children,
}: {
  open: boolean;
  label: string;
  align?: PopAlign;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={label}
          className={["dock-pop", "glass", `dock-pop--${align}`, className]
            .filter(Boolean)
            .join(" ")}
          role="menu"
          aria-label={label}
          initial={{ opacity: 0, y: 7, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Dock() {
  const addSpace = useLab((s) => s.addSpace);
  const addSpaces = useLab((s) => s.addSpaces);
  const mergeDistance = useLab((s) => s.settings.mergeDistance);
  const morphMode = useLab((s) => s.settings.morphMode);
  const attachMode = useLab((s) => s.settings.attachMode);
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const setSettings = useLab((s) => s.setSettings);
  const orgPanelOpen = useLab((s) => s.orgPanelOpen);
  const setOrgPanel = useLab((s) => s.setOrgPanel);
  const [panel, setPanel] = useState<PanelId>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
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

  const setMorph = (mode: MorphMode) => setSettings({ morphMode: mode });
  const setAttach = (mode: AttachMode) => setSettings({ attachMode: mode });
  const setPalette = (mode: PaletteMode) => setSettings({ paletteMode: mode });

  const morphRow = (m: MorphMode) => (
    <button
      key={m}
      type="button"
      className="pop-row pop-row--rich"
      role="menuitemradio"
      aria-checked={morphMode === m}
      data-active={morphMode === m}
      onClick={() => setMorph(m)}
    >
      <span className="pop-swatch" data-mode={m} />
      <span className="pop-row-text">
        <span>{MORPH_LABELS[m]}</span>
        <span className="pop-row-desc">{MORPH_DESCRIPTIONS[m]}</span>
      </span>
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
      <DockGroup side="left" collapsed={!leftOpen}>
        <DockButton
          className="dock-collapse-btn"
          title={leftOpen ? "Collapse quick controls" : "Expand quick controls"}
          aria-label={leftOpen ? "Collapse quick controls" : "Expand quick controls"}
          onClick={() => {
            setPanel(null);
            setLeftOpen((open) => !open);
          }}
        >
          {leftOpen ? <ChevronLeft size={15} strokeWidth={1.5} /> : <ChevronRight size={15} strokeWidth={1.5} />}
        </DockButton>

        {leftOpen && (
          <div className="dock-group-items" data-side="left">
            <DockButton
              className="dock-mode-btn renderer-mode-btn"
              active={rendererMode === "organism"}
              title={`Renderer: ${rendererMode === "organism" ? "Organism" : "Classic"}`}
              aria-label={`Renderer: ${rendererMode === "organism" ? "Organism" : "Classic"}`}
              onClick={() => {
                const next =
                  RENDERER_MODES[
                    (RENDERER_MODES.indexOf(rendererMode) + 1) % RENDERER_MODES.length
                  ];
                setSettings({ rendererMode: next });
              }}
            >
              <span className="dock-renderer-code">
                {rendererMode === "organism" ? "ORG" : "CLS"}
              </span>
            </DockButton>

            <div className="dock-pop-anchor">
              <DockPopover open={panel === "style"} label="Organism style" align="left">
                {MAIN_MORPHS.map(morphRow)}
                <span className="pop-divider" role="separator" />
                {EXTRA_MORPHS.map(morphRow)}
              </DockPopover>
              <DockButton
                className="dock-mode-btn style-mode-btn"
                active={panel === "style"}
                title={`Organism style: ${MORPH_LABELS[morphMode]}`}
                aria-label={`Organism style: ${MORPH_LABELS[morphMode]}`}
                aria-haspopup="menu"
                aria-expanded={panel === "style"}
                data-mode={morphMode}
                onClick={() => togglePanel("style")}
              >
                <Paintbrush size={16} strokeWidth={1.5} />
                <span className="dock-mode-code dock-style-code">{MORPH_CODES[morphMode]}</span>
                <span className="morph-color-swatch" data-mode={morphMode} />
              </DockButton>
            </div>

            <div className="dock-pop-anchor">
              <DockPopover
                open={panel === "attach"}
                label="Attachment"
                align="center"
                className="dock-pop-attach"
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
                      data-extreme={m === "extreme" ? "true" : undefined}
                      title={`${ATTACH_LABELS[m]} — ${ATTACH_HINTS[m]}`}
                      onClick={() => setAttach(m)}
                    >
                      {ATTACH_LABELS[m]}
                    </button>
                  ))}
                </div>
                <p className="pop-caption">{ATTACH_HINTS[attachMode]}</p>
              </DockPopover>
              <DockButton
                className="dock-mode-btn attach-mode-btn"
                active={panel === "attach"}
                title={`Attachment: ${ATTACH_LABELS[attachMode]}`}
                aria-label={`Attachment: ${ATTACH_LABELS[attachMode]}`}
                aria-haspopup="menu"
                aria-expanded={panel === "attach"}
                data-mode={attachMode}
                onClick={() => togglePanel("attach")}
              >
                <Magnet size={16} strokeWidth={1.5} />
                <span className="dock-mode-code">{attachMode[0].toUpperCase()}</span>
              </DockButton>
            </div>

            <div className="dock-merge" title="Reach / density fine-tune">
              <span className="dock-merge-label">density</span>
              <input
                type="range"
                min={0}
                max={300}
                value={mergeDistance}
                onChange={(e) => setSettings({ mergeDistance: Number(e.target.value) })}
                aria-label="Reach density fine-tune"
              />
            </div>
          </div>
        )}
      </DockGroup>

      <DockGroup side="center">
        <button
          type="button"
          className="nucleus-orb"
          title="Add nucleus"
          aria-label="Add nucleus"
          onClick={() => addSpace()}
        >
          <Plus size={22} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="cluster-orb"
          title="Add 5 nuclei"
          aria-label="Add 5 nuclei"
          onClick={() => addSpaces(5)}
        >
          <span className="cluster-dot cluster-dot-center" />
          <span className="cluster-dot cluster-dot-n" />
          <span className="cluster-dot cluster-dot-e" />
          <span className="cluster-dot cluster-dot-s" />
          <span className="cluster-dot cluster-dot-w" />
        </button>
        <button
          type="button"
          className="void-btn"
          title="Void nucleus placeholder"
          aria-label="Void nucleus placeholder"
          disabled
        >
          <Minus size={17} strokeWidth={1.7} />
        </button>
      </DockGroup>

      <DockGroup side="right" collapsed={!rightOpen}>
        {rightOpen && (
          <div className="dock-group-items" data-side="right">
            <div className="dock-pop-anchor">
              <DockPopover
                open={panel === "palette"}
                label="Palette"
                align="right"
                className="dock-pop-palette"
              >
                {PALETTE_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className="pop-row pop-row--rich"
                    role="menuitemradio"
                    aria-checked={paletteMode === mode}
                    data-active={paletteMode === mode}
                    onClick={() => setPalette(mode)}
                  >
                    <span className="palette-swatch" data-palette={mode} />
                    <span className="pop-row-text">
                      <span>{PALETTE_LABELS[mode]}</span>
                      <span className="pop-row-desc">{PALETTE_DESCRIPTIONS[mode]}</span>
                    </span>
                  </button>
                ))}
              </DockPopover>
              <DockButton
                className="dock-mode-btn palette-mode-btn"
                active={panel === "palette"}
                title={`Palette: ${PALETTE_LABELS[paletteMode]}`}
                aria-label={`Palette: ${PALETTE_LABELS[paletteMode]}`}
                aria-haspopup="menu"
                aria-expanded={panel === "palette"}
                data-palette={paletteMode}
                onClick={() => togglePanel("palette")}
              >
                <Palette size={16} strokeWidth={1.5} />
                <span className="palette-mini-swatch" data-palette={paletteMode} />
              </DockButton>
            </div>

            <div className="dock-pop-anchor">
              <DockPopover
                open={panel === "saved"}
                label="Saved views"
                align="right"
                className="dock-pop-saved"
              >
                <SavedViewsPanel />
              </DockPopover>
              <DockButton
                className="dock-mode-btn saved-views-btn"
                active={panel === "saved"}
                title="Saved views"
                aria-label="Saved views"
                aria-haspopup="dialog"
                aria-expanded={panel === "saved"}
                onClick={() => togglePanel("saved")}
              >
                <Bookmark size={16} strokeWidth={1.5} />
              </DockButton>
            </div>
            <DockButton
              className="dock-placeholder"
              title="Import placeholder"
              aria-label="Import placeholder"
              data-placeholder="true"
            >
              <Upload size={16} strokeWidth={1.5} />
            </DockButton>
            <DockButton
              className="dock-placeholder"
              title="Export placeholder"
              aria-label="Export placeholder"
              data-placeholder="true"
            >
              <Download size={16} strokeWidth={1.5} />
            </DockButton>
            <DockButton
              active={orgPanelOpen}
              title="Widget settings panel"
              aria-label="Widget settings panel"
              aria-haspopup="dialog"
              aria-expanded={orgPanelOpen}
              data-orgpanel-keep="true"
              onClick={() => setOrgPanel(!orgPanelOpen)}
            >
              <SlidersHorizontal size={16} strokeWidth={1.5} />
            </DockButton>
          </div>
        )}
        <DockButton
          className="dock-collapse-btn"
          title={rightOpen ? "Collapse utility controls" : "Expand utility controls"}
          aria-label={rightOpen ? "Collapse utility controls" : "Expand utility controls"}
          onClick={() => {
            setPanel(null);
            setRightOpen((open) => !open);
          }}
        >
          {rightOpen ? <ChevronRight size={15} strokeWidth={1.5} /> : <ChevronLeft size={15} strokeWidth={1.5} />}
        </DockButton>
      </DockGroup>
    </motion.div>
  );
}
