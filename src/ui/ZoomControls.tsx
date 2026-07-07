import { motion } from "motion/react";
import { Minus, Plus, Maximize2 } from "lucide-react";
import { useLab } from "../state/store";
import "./shell.css";

// Bottom-right zoom cluster — camera actions ease in via CanvasView.
export default function ZoomControls() {
  const zoomBy = useLab((s) => s.zoomBy);
  const fitView = useLab((s) => s.fitView);
  return (
    <motion.div
      className="zoom-controls"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
    >
      <span className="zoom-hint">drag to explore</span>
      <div className="zoom-cluster glass">
        <button type="button" className="zoom-btn" title="Zoom out" onClick={() => zoomBy(1 / 1.3)}>
          <Minus size={15} strokeWidth={1.5} />
        </button>
        <button type="button" className="zoom-btn" title="Zoom in" onClick={() => zoomBy(1.3)}>
          <Plus size={15} strokeWidth={1.5} />
        </button>
        <button type="button" className="zoom-btn" title="Fit view" onClick={fitView}>
          <Maximize2 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
}
