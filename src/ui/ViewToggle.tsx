import { motion } from "motion/react";
import { useLab } from "../state/store";
import type { ViewMode } from "../types";
import "./shell.css";

const MODES: ViewMode[] = ["canvas", "table"];

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
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          data-active={view === mode}
          onClick={() => setView(mode)}
        >
          {view === mode && (
            <motion.span
              className="thumb"
              layoutId="view-thumb"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          {mode}
        </button>
      ))}
    </motion.nav>
  );
}
