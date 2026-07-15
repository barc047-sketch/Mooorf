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
  Upload,
} from "lucide-react";
import { useLab } from "../state/store";
import "./shell.css";

/* Bottom dock — creation in the centre and non-editing project utilities on
   the right. M1 appearance ownership lives in the Inspector and six detailed
   widgets, so no duplicate Morph/palette controls remain here. */

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

export default function Dock() {
  const addSpace = useLab((s) => s.addSpace);
  const addVoid = useLab((s) => s.addVoid);
  const addSpaces = useLab((s) => s.addSpaces);
  const applyLayoutPreset = useLab((s) => s.applyLayoutPreset);
  const openWidgets = useLab((s) => s.openWidgets);
  const openWidget = useLab((s) => s.openWidget);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <motion.div
      className="dock"
      initial={{ x: "-50%", y: 24, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      role="toolbar"
      aria-label="Canvas tools"
    >
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
              active={openWidgets.includes("saved")}
              title="Saved views"
              aria-label="Saved views"
              aria-haspopup="dialog"
              aria-expanded={openWidgets.includes("saved")}
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
              active={openWidgets.includes("import")}
              title="File Intake"
              aria-label="File Intake"
              aria-haspopup="dialog"
              aria-expanded={openWidgets.includes("import")}
              onClick={() => openWidget("import")}
            >
              <Upload size={16} strokeWidth={1.5} />
            </DockButton>
            <DockButton
              active={openWidgets.includes("export")}
              title="Export"
              aria-label="Export"
              aria-haspopup="dialog"
              aria-expanded={openWidgets.includes("export")}
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
