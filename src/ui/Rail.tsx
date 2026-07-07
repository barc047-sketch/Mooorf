import { motion } from "motion/react";
import { Sun, Moon, Waves, Frame } from "lucide-react";
import { useLab } from "../state/store";
import "./shell.css";

// Left vertical glass rail: theme, blob on/off, fit view (wired in Phase 4).
export default function Rail() {
  const theme = useLab((s) => s.theme);
  const toggleTheme = useLab((s) => s.toggleTheme);
  const blobOn = useLab((s) => s.settings.blobOn);
  const setSettings = useLab((s) => s.setSettings);
  const resetView = useLab((s) => s.resetView);

  return (
    <motion.div
      className="rail glass"
      initial={{ x: -20, y: "-50%", opacity: 0 }}
      animate={{ x: 0, y: "-50%", opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
      role="toolbar"
      aria-label="Canvas settings"
    >
      <button
        type="button"
        className="rail-btn"
        title={theme === "day" ? "Night mode" : "Day mode"}
        onClick={toggleTheme}
      >
        {theme === "day" ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
      </button>
      <button
        type="button"
        className="rail-btn"
        data-on={blobOn}
        title="Organism blob (Phase 6)"
        onClick={() => setSettings({ blobOn: !blobOn })}
      >
        <Waves size={16} strokeWidth={1.5} />
      </button>
      <button type="button" className="rail-btn" title="Reset view" onClick={resetView}>
        <Frame size={16} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}
