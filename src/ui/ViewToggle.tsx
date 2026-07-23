import { motion } from "motion/react";
import { Maximize2, Table } from "lucide-react";
import { useLab } from "../state/store";
import type { ViewMode } from "../types";
import "./shell.css";

const MODES: { id: ViewMode; label: string; icon: typeof Maximize2 }[] = [
  { id: "canvas", label: "Canvas", icon: Maximize2 },
  { id: "table", label: "Table", icon: Table },
];

export default function ViewToggle() {
  const view = useLab((s) => s.view);
  const setView = useLab((s) => s.setView);

  return (
    <motion.nav
      className="view-toggle glass"
      initial={{ x: "-50%", y: -16, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-label="View mode"
    >
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          data-active={view === id}
          aria-label={`${label} View`}
          title={`${label} View`}
          onClick={() => setView(id)}
        >
          {view === id && (
            <motion.span
              className="thumb"
              layoutId="view-thumb"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <Icon size={14} strokeWidth={2.0} aria-hidden="true" style={{ marginRight: 4 }} />
          <span>{label}</span>
        </button>
      ))}
    </motion.nav>
  );
}
