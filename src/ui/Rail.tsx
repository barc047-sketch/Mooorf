import { motion } from "motion/react";
import {
  Bookmark,
  Eye,
  Frame,
  LayoutGrid,
  Minus,
  Moon,
  Palette,
  Plus,
  Settings2,
  Shapes,
  SlidersHorizontal,
  Sun,
  Table2,
  Type,
} from "lucide-react";
import { useLab } from "../state/store";
import type { WidgetId } from "../types";
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
  const openWidgets = useLab((s) => s.openWidgets);
  const toggleWidget = useLab((s) => s.toggleWidget);

  const launcher = (
    id: WidgetId,
    title: string,
    icon: React.ReactNode
  ) => (
    <button
      type="button"
      className="rail-btn"
      data-active={openWidgets.includes(id)}
      title={title}
      onClick={() => toggleWidget(id)}
    >
      {icon}
    </button>
  );

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
          <Shapes size={14} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="rail-btn"
          data-active={view === "table"}
          title="Table view"
          onClick={() => setView("table")}
        >
          <Table2 size={14} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="build">
        <button type="button" className="rail-btn" title="Add nucleus shortcut" onClick={() => addSpace()}>
          <Plus size={14} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="rail-btn rail-btn-disabled"
          title="Void nucleus placeholder"
          disabled
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>
      </RailSection>

      <RailSection caption="note">
        {launcher("annotation", "Annotation widget", <Type size={14} strokeWidth={1.5} />)}
      </RailSection>

      <RailSection caption="organism">
        {launcher("organism", "Organism widget", <SlidersHorizontal size={14} strokeWidth={1.5} />)}
      </RailSection>

      <RailSection caption="color">
        {launcher("palette", "Palette widget", <Palette size={14} strokeWidth={1.5} />)}
      </RailSection>

      <RailSection caption="layout">
        {launcher("layout", "Layout widget", <LayoutGrid size={14} strokeWidth={1.5} />)}
      </RailSection>

      <RailSection caption="saved">
        {launcher("saved", "Saved views widget", <Bookmark size={14} strokeWidth={1.5} />)}
      </RailSection>

      <RailSection caption="display">
        {launcher("display", "Display widget", <Eye size={14} strokeWidth={1.5} />)}
      </RailSection>

      <RailSection caption="system">
        <button
          type="button"
          className="rail-btn"
          title={theme === "day" ? "Night mode" : "Day mode"}
          onClick={toggleTheme}
        >
          {theme === "day" ? (
            <Moon size={14} strokeWidth={1.5} />
          ) : (
            <Sun size={14} strokeWidth={1.5} />
          )}
        </button>
        <button type="button" className="rail-btn" title="Reset view" onClick={resetView}>
          <Frame size={14} strokeWidth={1.5} />
        </button>
        {launcher("advanced", "Advanced widget", <Settings2 size={14} strokeWidth={1.5} />)}
      </RailSection>
    </motion.div>
  );
}
