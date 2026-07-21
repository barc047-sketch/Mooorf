import { useLayoutEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SlidersHorizontal, Waypoints, X } from "lucide-react";
import { CONNECTION_SEMANTIC_TYPES } from "../domain/connections/registry";
import type { KnownConnectionSemanticTypeId } from "../domain/graph/types";
import { useLab } from "../state/store";
import { RelationshipTypePicker } from "./RelationshipTypePicker";

type RailLayout = {
  left: number;
  width: number;
};

export default function ConnectionQuickRail() {
  const modeActive = useLab((state) => state.connectionModeActive);
  const typeId = useLab((state) => state.connectionModeTypeId);
  const performanceQuality = useLab((state) => state.settings.performanceQuality);
  const setConnectionModeType = useLab((state) => state.setConnectionModeType);
  const exitConnectionMode = useLab((state) => state.exitConnectionMode);
  const openWidget = useLab((state) => state.openWidget);
  const reduceMotion = useReducedMotion();
  const [railLayout, setRailLayout] = useState<RailLayout>({ left: 24, width: 520 });

  useLayoutEffect(() => {
    if (!modeActive || typeof document === "undefined") return;
    const workspace = document.querySelector<HTMLElement>(".canvas-workspace");
    const dock = document.querySelector<HTMLElement>(".dock");
    const dockCenter = document.querySelector<HTMLElement>(".dock-group-center");
    const chromeLayer = document.querySelector<HTMLElement>(".canvas-chrome-layer--dock");
    if (!workspace || !dockCenter) return;
    const update = () => {
      const workspaceRect = workspace.getBoundingClientRect();
      const dockCenterRect = dockCenter.getBoundingClientRect();
      const layerLeft = chromeLayer?.getBoundingClientRect().left ?? 0;
      const left = Math.max(14, workspaceRect.left - layerLeft + 24);
      const width = Math.max(0, Math.min(620, dockCenterRect.left - layerLeft - 12 - left));
      setRailLayout({ left, width });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(workspace);
    if (dock) observer.observe(dock);
    observer.observe(dockCenter);
    if (chromeLayer) observer.observe(chromeLayer);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [modeActive]);

  const suppressMotion = Boolean(reduceMotion) || performanceQuality === "fast";

  if (!modeActive) return null;

  return (
    <motion.div
      className="connection-quick-rail glass"
      data-compact={railLayout.width < 360 ? "true" : undefined}
      data-motion={suppressMotion ? "off" : "on"}
      style={{
        "--connection-rail-left": `${railLayout.left}px`,
        "--connection-rail-width": `${railLayout.width}px`,
      } as CSSProperties}
      initial={suppressMotion ? false : { opacity: 0, y: 8, scale: .985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: suppressMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
      role="toolbar"
      aria-label="Connection mode"
    >
      <span className="connection-quick-context" aria-label="Connections mode active">
        <Waypoints size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>Connections</span>
      </span>
      <RelationshipTypePicker
        direction="up"
        label="Current Relationship Type"
        options={CONNECTION_SEMANTIC_TYPES}
        value={typeId}
        onChange={(id) => setConnectionModeType(id as KnownConnectionSemanticTypeId)}
      />
      <button
        type="button"
        className="connection-quick-action"
        title="Open Connections Manager"
        aria-label="Open Connections Manager"
        onClick={() => openWidget("connections")}
      >
        <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>Manage</span>
      </button>
      <button
        type="button"
        className="connection-quick-action connection-quick-close"
        title="Close Connection mode"
        aria-label="Close Connection mode"
        onClick={exitConnectionMode}
      >
        <X size={14} strokeWidth={1.6} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
