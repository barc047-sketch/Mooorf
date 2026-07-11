import { motion } from "motion/react";
import {
  Frame,
  Minus,
  Moon,
  Plus,
  Shapes,
  Sun,
  Table2,
} from "lucide-react";
import { useLab } from "../state/store";
import type { WidgetId } from "../types";
import { getWidgetDefinition } from "./panels/widgetRegistry";
import "./shell.css";

/* V6K left rail — launchers only. Every detailed control opens a floating
   widget; fast creation and quick mode switches stay in the dock. */

function RailSection({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rail-sec" role="group" aria-label={caption}>
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
  const openWidgets = useLab((s) => s.openWidgets);
  const openWidget = useLab((s) => s.openWidget);

  const launcher = (
    id: WidgetId,
    title = `${getWidgetDefinition(id).label} widget`
  ) => {
    const Icon = getWidgetDefinition(id).icon;
    return (
      <button
        type="button"
        className="rail-btn"
        data-active={openWidgets.includes(id)}
        data-tooltip={title}
        title={title}
        aria-label={title}
        onClick={() => openWidget(id)}
      >
        <Icon size={14} strokeWidth={1.5} />
      </button>
    );
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
          data-tooltip="Canvas view"
          title="Canvas view"
          aria-label="Canvas view"
          onClick={() => setView("canvas")}
        >
          <Shapes size={14} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="rail-btn"
          data-active={view === "table"}
          data-tooltip="Table view"
          title="Table view"
          aria-label="Table view"
          onClick={() => setView("table")}
        >
          <Table2 size={14} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="build">
        <button
          type="button"
          className="rail-btn"
          data-tooltip="Add nucleus"
          title="Add nucleus shortcut"
          aria-label="Add nucleus shortcut"
          onClick={() => addSpace()}
        >
          <Plus size={14} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="rail-btn rail-btn-disabled"
          data-tooltip="Void nucleus — dock"
          title="Void nucleus placeholder"
          aria-label="Void nucleus placeholder"
          disabled
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="note">
        {launcher("annotation")}
      </RailSection>

      <RailSection caption="organism">
        {launcher("organism")}
      </RailSection>

      <RailSection caption="color">
        {launcher("palette")}
      </RailSection>

      <RailSection caption="layout">
        {launcher("layout")}
      </RailSection>

      <RailSection caption="saved">
        {launcher("saved")}
      </RailSection>

      <RailSection caption="stats">
        {launcher("stats")}
      </RailSection>

      <RailSection caption="display">
        {launcher("display")}
      </RailSection>

      <RailSection caption="system">
        <button
          type="button"
          className="rail-btn"
          data-tooltip={theme === "day" ? "Night mode" : "Day mode"}
          title={theme === "day" ? "Night mode" : "Day mode"}
          aria-label={theme === "day" ? "Night mode" : "Day mode"}
          onClick={toggleTheme}
        >
          {theme === "day" ? (
            <Moon size={14} strokeWidth={1.5} />
          ) : (
            <Sun size={14} strokeWidth={1.5} />
          )}
        </button>
        <button
          type="button"
          className="rail-btn"
          data-tooltip="Reset view"
          title="Reset view"
          aria-label="Reset view"
          onClick={resetView}
        >
          <Frame size={14} strokeWidth={1.5} />
        </button>
        {launcher("advanced")}
      </RailSection>
    </motion.div>
  );
}
