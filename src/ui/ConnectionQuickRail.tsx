import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Ban,
  Eye,
  Link2,
  MoveRight,
  Route,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Waypoints,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  CONNECTION_SEMANTIC_TYPES,
  type ConnectionSemanticTypeDefinition,
} from "../domain/connections/registry";
import type { KnownConnectionSemanticTypeId } from "../domain/graph/types";
import { useLab } from "../state/store";
import { getWidgetDefinition } from "./panels/widgetRegistry";

const CONNECTION_ONBOARDING_KEY = "mooorf.connections.onboarding.v1";

const TYPE_ICONS: Record<KnownConnectionSemanticTypeId, LucideIcon> = {
  custom: Sparkles,
  adjacency: Link2,
  "direct-access": MoveRight,
  "visual-access": Eye,
  "shared-support": Share2,
  "circulation-flow": Route,
  separation: Ban,
};

type RailDensity = "wide" | "medium" | "compact";

const railDensity = (effectiveWidth: number): RailDensity => {
  if (effectiveWidth >= 1040) return "wide";
  if (effectiveWidth >= 900) return "medium";
  return "compact";
};

const readOnboardingDismissed = (): boolean => {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(CONNECTION_ONBOARDING_KEY) === "dismissed";
  } catch {
    return false;
  }
};

function TypeButton({
  definition,
  active,
  density,
  onSelect,
}: {
  definition: ConnectionSemanticTypeDefinition;
  active: boolean;
  density: RailDensity;
  onSelect: () => void;
}) {
  const Icon = TYPE_ICONS[definition.id as KnownConnectionSemanticTypeId] ?? Waypoints;
  const compactName = definition.name
    .replace("Direct Access", "Access")
    .replace("Shared Support", "Support")
    .replace("Circulation Flow", "Flow")
    .replace("Visual Link", "Visual");
  return (
    <button
      type="button"
      className="connection-quick-type"
      aria-pressed={active}
      data-active={active ? "true" : undefined}
      data-type={definition.id}
      title={`${definition.name} — ${definition.description}`}
      onClick={onSelect}
    >
      <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
      {density !== "compact" && <span>{density === "wide" ? definition.name : compactName}</span>}
      {density === "wide" && <i className="connection-quick-line" data-type={definition.id} aria-hidden="true" />}
    </button>
  );
}

export default function ConnectionQuickRail() {
  const modeActive = useLab((state) => state.connectionModeActive);
  const typeId = useLab((state) => state.connectionModeTypeId);
  const status = useLab((state) => state.connectionAuthoring.message);
  const openWidgets = useLab((state) => state.openWidgets);
  const minimizedWidgets = useLab((state) => state.minimizedWidgets);
  const widgetScale = useLab((state) => state.settings.widgetScale);
  const uiScale = useLab((state) => state.settings.uiScale);
  const performanceQuality = useLab((state) => state.settings.performanceQuality);
  const setConnectionModeType = useLab((state) => state.setConnectionModeType);
  const exitConnectionMode = useLab((state) => state.exitConnectionMode);
  const openWidget = useLab((state) => state.openWidget);
  const reduceMotion = useReducedMotion();
  const [workspaceWidth, setWorkspaceWidth] = useState(1280);
  const [onboardingDismissed, setOnboardingDismissed] = useState(readOnboardingDismissed);

  useEffect(() => {
    if (!modeActive || typeof document === "undefined") return;
    const workspace = document.querySelector<HTMLElement>(".canvas-workspace");
    if (!workspace) return;
    const update = () => setWorkspaceWidth(workspace.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(workspace);
    return () => observer.disconnect();
  }, [modeActive]);

  const occupiedWidgetWidth = useMemo(() => openWidgets.reduce((largest, widgetId) => {
    if (minimizedWidgets.includes(widgetId)) return largest;
    const width = getWidgetDefinition(widgetId).geometry?.width ?? 0;
    return Math.max(largest, width * widgetScale * uiScale);
  }, 0), [openWidgets, minimizedWidgets, widgetScale, uiScale]);
  const effectiveWidth = Math.max(0, workspaceWidth - occupiedWidgetWidth - 116 * uiScale);
  const railWidth = Math.min(1120, effectiveWidth);
  const compactPalette = effectiveWidth < 420;
  const density = railDensity(effectiveWidth);
  const leftTypes = CONNECTION_SEMANTIC_TYPES.slice(0, 4);
  const rightTypes = CONNECTION_SEMANTIC_TYPES.slice(4);
  const connectionCreated = status.startsWith("Connection created");
  const suppressMotion = Boolean(reduceMotion) || performanceQuality === "fast";

  if (!modeActive) return null;

  const dismissOnboarding = () => {
    setOnboardingDismissed(true);
    try {
      localStorage.setItem(CONNECTION_ONBOARDING_KEY, "dismissed");
    } catch {
      // Local preference remains optional when storage is unavailable.
    }
  };

  return (
    <motion.div
      className="connection-quick-rail"
      data-density={density}
      data-palette={compactPalette ? "true" : undefined}
      data-effective-width={Math.round(effectiveWidth)}
      data-motion={suppressMotion ? "off" : "on"}
      style={{ "--connection-rail-width": `${railWidth}px` } as CSSProperties}
      initial={suppressMotion ? false : { opacity: 0, y: 8, scale: .985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: suppressMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
      role="toolbar"
      aria-label="Connection mode"
    >
      {compactPalette ? (
        <div className="connection-quick-palette glass">
          <select
            aria-label="Connection relationship type"
            value={typeId}
            onChange={(event) => setConnectionModeType(event.target.value as KnownConnectionSemanticTypeId)}
          >
            {CONNECTION_SEMANTIC_TYPES.map((definition) => (
              <option key={definition.id} value={definition.id}>{definition.name}</option>
            ))}
          </select>
          <div className="connection-quick-palette-actions">
            <button type="button" className="connection-quick-action" title="Open Connections Manager" aria-label="Open Connections Manager" onClick={() => openWidget("connections")}>
              <Waypoints size={14} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button type="button" className="connection-quick-action" title="Open Connection Studio" aria-label="Open Connection Studio" onClick={() => openWidget("connection-studio")}>
              <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button type="button" className="connection-quick-action" title="Close Connection mode" aria-label="Close Connection mode" onClick={exitConnectionMode}>
              <X size={14} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="connection-quick-wing connection-quick-wing--left glass">
            {leftTypes.map((definition) => (
              <TypeButton
                key={definition.id}
                definition={definition}
                active={definition.id === typeId}
                density={density}
                onSelect={() => setConnectionModeType(definition.id)}
              />
            ))}
          </div>

          <div className="connection-quick-wing connection-quick-wing--right glass">
            <div className="connection-quick-types">
              {rightTypes.map((definition) => (
                <TypeButton
                  key={definition.id}
                  definition={definition}
                  active={definition.id === typeId}
                  density={density}
                  onSelect={() => setConnectionModeType(definition.id)}
                />
              ))}
            </div>
            <span className="connection-quick-divider" aria-hidden="true" />
            <button type="button" className="connection-quick-action" title="Open Connections Manager" onClick={() => openWidget("connections")}>
              <Waypoints size={14} strokeWidth={1.5} aria-hidden="true" />
              {density === "wide" && <span>Manage</span>}
            </button>
            <button type="button" className="connection-quick-action" title="Open Connection Studio" onClick={() => openWidget("connection-studio")}>
              <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden="true" />
              {density === "wide" && <span>Detail</span>}
            </button>
            <button type="button" className="connection-quick-action" title="Close Connection mode" aria-label="Close Connection mode" onClick={exitConnectionMode}>
              <X size={14} strokeWidth={1.6} aria-hidden="true" />
              {density === "wide" && <span>Close</span>}
            </button>
          </div>
        </>
      )}

      <div className="connection-quick-status" role="status" aria-live="polite" aria-atomic="true">
        {connectionCreated ? "Connection created · Press Esc to exit · C to toggle" : status}
      </div>
      {!onboardingDismissed && (
        <div className="connection-onboarding-hint">
          <span><b>Press C to connect Cells</b> · Drag a centre point to another Cell</span>
          <button type="button" onClick={dismissOnboarding} aria-label="Dismiss Connection hint">Got it</button>
        </div>
      )}
    </motion.div>
  );
}
