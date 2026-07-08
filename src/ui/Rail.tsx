import { motion } from "motion/react";
import {
  Circle,
  Dna,
  Eye,
  Frame,
  Moon,
  Paintbrush,
  Plus,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Table2,
  Waves,
} from "lucide-react";
import { useLab } from "../state/store";
import type { OrgPanelFocus } from "../types";
import "./shell.css";

/* V6H.1 left rail — compact pro-tool navigation grouped into captioned
   sections: view / render / build / panels / system. Navigation and panel
   launching only; parameter editing lives in the dock + control surface. */

function RailSection({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rail-sec" role="group" aria-label={caption}>
      <span className="rail-cap">{caption}</span>
      {children}
    </div>
  );
}

export default function Rail() {
  const theme = useLab((s) => s.theme);
  const toggleTheme = useLab((s) => s.toggleTheme);
  const view = useLab((s) => s.view);
  const setView = useLab((s) => s.setView);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const blobOn = useLab((s) => s.settings.blobOn);
  const setSettings = useLab((s) => s.setSettings);
  const addSpace = useLab((s) => s.addSpace);
  const addDemo = useLab((s) => s.addDemo);
  const resetView = useLab((s) => s.resetView);
  const orgPanelOpen = useLab((s) => s.orgPanelOpen);
  const orgPanelFocus = useLab((s) => s.orgPanelFocus);
  const setOrgPanel = useLab((s) => s.setOrgPanel);

  /* re-tapping the active launcher closes; a different one refocuses */
  const launchPanel = (focus: Exclude<OrgPanelFocus, null>) => {
    if (orgPanelOpen && orgPanelFocus === focus) setOrgPanel(false);
    else setOrgPanel(true, focus);
  };

  return (
    <motion.div
      className="rail glass"
      initial={{ x: -20, y: "-50%", opacity: 0 }}
      animate={{ x: 0, y: "-50%", opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
      role="toolbar"
      aria-label="Canvas navigation"
    >
      <RailSection caption="view">
        <button
          type="button"
          className="rail-btn"
          data-active={view === "canvas"}
          title="Canvas view"
          onClick={() => setView("canvas")}
        >
          <Shapes size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="rail-btn"
          data-active={view === "table"}
          title="Table view"
          onClick={() => setView("table")}
        >
          <Table2 size={15} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="render">
        <button
          type="button"
          className="rail-btn"
          data-active={rendererMode === "organism"}
          title="Organism renderer"
          onClick={() => setSettings({ rendererMode: "organism" })}
        >
          <Dna size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="rail-btn"
          data-active={rendererMode === "classic"}
          title="Classic renderer"
          onClick={() => setSettings({ rendererMode: "classic" })}
        >
          <Circle size={15} strokeWidth={1.5} />
        </button>
        {rendererMode === "classic" && (
          <button
            type="button"
            className="rail-btn"
            data-on={blobOn}
            title="Classic blob layer"
            onClick={() => setSettings({ blobOn: !blobOn })}
          >
            <Waves size={15} strokeWidth={1.5} />
          </button>
        )}
      </RailSection>

      <RailSection caption="build">
        <button type="button" className="rail-btn" title="Add nucleus" onClick={() => addSpace()}>
          <Plus size={15} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="rail-btn"
          title="Add 10 demo spaces"
          onClick={() => addDemo(10)}
        >
          <Sparkles size={15} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="panels">
        <button
          type="button"
          className="rail-btn"
          data-active={orgPanelOpen && orgPanelFocus === "organism"}
          data-orgpanel-keep="true"
          title="Organism controls"
          onClick={() => launchPanel("organism")}
        >
          <SlidersHorizontal size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="rail-btn"
          data-active={orgPanelOpen && orgPanelFocus === "style"}
          data-orgpanel-keep="true"
          title="Style & palette"
          onClick={() => launchPanel("style")}
        >
          <Paintbrush size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="rail-btn"
          data-active={orgPanelOpen && orgPanelFocus === "display"}
          data-orgpanel-keep="true"
          title="Display & debug"
          onClick={() => launchPanel("display")}
        >
          <Eye size={15} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="system">
        <button
          type="button"
          className="rail-btn"
          title={theme === "day" ? "Night mode" : "Day mode"}
          onClick={toggleTheme}
        >
          {theme === "day" ? (
            <Moon size={15} strokeWidth={1.5} />
          ) : (
            <Sun size={15} strokeWidth={1.5} />
          )}
        </button>
        <button type="button" className="rail-btn" title="Reset view" onClick={resetView}>
          <Frame size={15} strokeWidth={1.5} />
        </button>
      </RailSection>
    </motion.div>
  );
}
