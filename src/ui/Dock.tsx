import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Minus,
  Plus,
  Shuffle,
  SlidersHorizontal,
  Type,
  Upload,
} from "lucide-react";
import { appearanceFamilyDefinition, appearanceFamilyForTarget } from "../domain/presentation/editing";
import { useLab } from "../state/store";
import InspectorLauncherButton from "./InspectorLauncherButton";
import "./shell.css";

/* Bottom dock — creation in the centre and non-editing project utilities on
   the right. M1 appearance ownership lives in the Inspector and three family
   Detail widgets over six canonical targets, with no duplicate state owners. */

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
      className={`dock-group dock-group-${side}${side === "center" ? "" : " glass"}`}
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

function MembraneDetailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.1 7.7c0-2.1 1.5-3.8 3.6-3.8.9-1.2 2.6-1.5 3.8-.6 1.5-.1 2.7 1.1 2.7 2.6 1.1 1.2.8 3.1-.5 3.9-.3 1.6-1.9 2.7-3.5 2.4-1.2.8-2.9.5-3.7-.6-1.8.1-3.4-1.4-3.4-3.4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="7.1" cy="7.7" r="1" fill="currentColor" opacity=".72" />
    </svg>
  );
}

export default function Dock() {
  const addSpace = useLab((s) => s.addSpace);
  const addVoid = useLab((s) => s.addVoid);
  const addSpaces = useLab((s) => s.addSpaces);
  const applyLayoutPreset = useLab((s) => s.applyLayoutPreset);
  const openWidgets = useLab((s) => s.openWidgets);
  const minimizedWidgets = useLab((s) => s.minimizedWidgets);
  const openWidget = useLab((s) => s.openWidget);
  const activeAppearanceTarget = useLab((s) => s.activeAppearanceTarget);
  const [rightOpen, setRightOpen] = useState(true);
  const activeFamily = appearanceFamilyForTarget(activeAppearanceTarget);
  const detail = appearanceFamilyDefinition(activeFamily);
  const isExpanded = (id: Parameters<typeof openWidget>[0]) =>
    openWidgets.includes(id) && !minimizedWidgets.includes(id);

  return (
    <motion.div
      className="dock"
      initial={{ x: "-50%", opacity: 0 }}
      animate={{ x: "-50%", opacity: 1 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      role="toolbar"
      aria-label="Canvas tools"
    >
      <DockGroup side="left">
        <InspectorLauncherButton surface="dock" />
        <DockButton
          active={isExpanded("label-studio")}
          title="Label Studio"
          aria-label="Open Label Studio"
          aria-haspopup="dialog"
          aria-expanded={isExpanded("label-studio")}
          onClick={() => openWidget("label-studio")}
        >
          <Type size={16} strokeWidth={1.5} />
        </DockButton>
        <DockButton
          active={isExpanded("membrane-settings")}
          title="Membrane Detail"
          aria-label="Open Membrane Detail"
          aria-haspopup="dialog"
          aria-expanded={isExpanded("membrane-settings")}
          onClick={() => openWidget("membrane-settings")}
        >
          <MembraneDetailIcon />
        </DockButton>
        {detail.detailWidgetId !== "membrane-settings" && (
          <DockButton
            active={isExpanded(detail.detailWidgetId)}
            title={`Open ${detail.label} Detail`}
            aria-label={`Open ${detail.label} Detail`}
            aria-haspopup="dialog"
            aria-expanded={isExpanded(detail.detailWidgetId)}
            onClick={() => openWidget(detail.detailWidgetId)}
          >
            <SlidersHorizontal size={16} strokeWidth={1.5} />
          </DockButton>
        )}
      </DockGroup>

      <DockGroup side="center">
        <DockButton
          className="nucleus-orb"
          title="Add Space"
          aria-label="Add Space"
          onClick={() => addSpace()}
        >
          <Plus size={21} strokeWidth={1.75} />
        </DockButton>
        <DockButton
          className="cluster-orb"
          title="Add 5 Spaces"
          aria-label="Add 5 Spaces"
          onClick={() => addSpaces(5)}
        >
          <span className="cluster-dot cluster-dot-center" />
          <span className="cluster-dot cluster-dot-n" />
          <span className="cluster-dot cluster-dot-e" />
          <span className="cluster-dot cluster-dot-s" />
          <span className="cluster-dot cluster-dot-w" />
        </DockButton>
        <DockButton
          className="void-btn"
          title="Add Void"
          aria-label="Add Void"
          onClick={() => addVoid()}
        >
          <Minus size={16} strokeWidth={1.7} />
        </DockButton>
      </DockGroup>

      <DockGroup side="right" collapsed={!rightOpen}>
        {rightOpen && (
          <div className="dock-group-items" data-side="right">
            <DockButton
              active={isExpanded("saved")}
              title="Saved views"
              aria-label="Saved views"
              aria-haspopup="dialog"
              aria-expanded={isExpanded("saved")}
              onClick={() => openWidget("saved")}
            >
              <Bookmark size={16} strokeWidth={1.5} />
            </DockButton>
            <DockButton
              title="Random arrangement"
              aria-label="Random arrangement"
              onClick={() => applyLayoutPreset("random")}
            >
              <Shuffle size={16} strokeWidth={1.5} />
            </DockButton>
            <DockButton
              active={isExpanded("import")}
              title="File Intake"
              aria-label="File Intake"
              aria-haspopup="dialog"
              aria-expanded={isExpanded("import")}
              onClick={() => openWidget("import")}
            >
              <Upload size={16} strokeWidth={1.5} />
            </DockButton>
            <DockButton
              active={isExpanded("export")}
              title="Export"
              aria-label="Export"
              aria-haspopup="dialog"
              aria-expanded={isExpanded("export")}
              onClick={() => openWidget("export")}
            >
              <Download size={16} strokeWidth={1.5} />
            </DockButton>
          </div>
        )}
        <DockButton
          className="dock-collapse-btn"
          title={rightOpen ? "Collapse utility controls" : "Expand utility controls"}
          aria-label={rightOpen ? "Collapse utility controls" : "Expand utility controls"}
          onClick={() => {
            setRightOpen((open) => !open);
          }}
        >
          {rightOpen ? <ChevronRight size={15} strokeWidth={1.5} /> : <ChevronLeft size={15} strokeWidth={1.5} />}
        </DockButton>
      </DockGroup>
    </motion.div>
  );
}
