import { motion } from "motion/react";
import {
  Eye,
  Frame,
  Layers,
  Minus,
  Moon,
  Palette,
  Plus,
  Shapes,
  SlidersHorizontal,
  Settings,
  Sun,
  Table2,
  Type,
} from "lucide-react";
import { useLab } from "../state/store";
import type { OrgPanelFocus } from "../types";
import "./shell.css";

/* V6H.2 left rail — navigation + widget launchers only. Fast creation and
   renderer switching live in the dock; detailed settings live in the panel. */

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
  const addSpace = useLab((s) => s.addSpace);
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

      <RailSection caption="build">
        <button type="button" className="rail-btn" title="Add nucleus shortcut" onClick={() => addSpace()}>
          <Plus size={15} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="rail-btn rail-btn-disabled"
          title="Void nucleus placeholder"
          disabled
        >
          <Minus size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="rail-btn rail-btn-disabled"
          title="Group placeholder"
          disabled
        >
          <Layers size={15} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="annotate">
        <button
          type="button"
          className="rail-btn"
          data-active={orgPanelOpen && orgPanelFocus === "annotation"}
          data-orgpanel-keep="true"
          title="Annotation widget"
          onClick={() => launchPanel("annotation")}
        >
          <Type size={15} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="organism">
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
      </RailSection>

      <RailSection caption="color">
        <button
          type="button"
          className="rail-btn"
          data-active={orgPanelOpen && orgPanelFocus === "style"}
          data-orgpanel-keep="true"
          title="Color and palette widget"
          onClick={() => launchPanel("style")}
        >
          <Palette size={15} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="display">
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
        <button
          type="button"
          className="rail-btn rail-btn-disabled"
          title="Settings placeholder"
          disabled
        >
          <Settings size={15} strokeWidth={1.5} />
        </button>
      </RailSection>
    </motion.div>
  );
}
