import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Activity, CircleDot, Grid3X3, Magnet, SlidersHorizontal, Waves, Waypoints } from "lucide-react";
import { performanceGovernor } from "../runtime/performanceGovernor";
import { useLab } from "../state/store";
import "./quickToggleBar.css";

interface QuickToggleProps {
  ariaLabel: string;
  dataTooltip: string;
  icon: ReactNode;
  pressed: boolean;
  disabled?: boolean;
  description?: string;
  reduced?: boolean;
  onClick?: () => void;
}

function QuickToggle({ ariaLabel, dataTooltip, icon, pressed, disabled = false, description, reduced = false, onClick }: QuickToggleProps) {
  return (
    <button
      type="button"
      className="live-toggle live-toggle-tooltip"
      aria-label={ariaLabel}
      aria-description={description}
      aria-pressed={disabled ? false : pressed}
      aria-disabled={disabled}
      data-tooltip={dataTooltip}
      data-active={!disabled && pressed}
      data-reduced={reduced || undefined}
      onClick={disabled ? undefined : onClick}
    >
      <span className="live-toggle-dot" aria-hidden="true" />
      {icon}
    </button>
  );
}

const getEffectiveQuality = () => performanceGovernor.getSnapshot().effectiveQuality;

export default function QuickToggleBar() {
  const [expanded, setExpanded] = useState(false);
  const rendererMode = useLab((state) => state.settings.rendererMode);
  const blobOn = useLab((state) => state.settings.blobOn);
  const motionEnabled = useLab((state) => state.settings.organism.motionEnabled);
  const showGrid = useLab((state) => state.settings.showGrid);
  const connectionsVisible = useLab((state) => state.settings.connectionView.visible);
  const authoredShadowOn = useLab(
    (state) => state.settings.cellShadow.enabled && state.settings.cellShadow.mode !== "off",
  );
  const setSettings = useLab((state) => state.setSettings);
  const effectiveQuality = useSyncExternalStore(
    performanceGovernor.subscribe,
    getEffectiveQuality,
    getEffectiveQuality,
  );
  const organismMode = rendererMode === "organism";
  const shadowReduced = authoredShadowOn && effectiveQuality === "fast";

  const toggleShadow = () => {
    const cellShadow = useLab.getState().settings.cellShadow;
    setSettings({
      cellShadow: {
        ...cellShadow,
        enabled: !authoredShadowOn,
        mode: authoredShadowOn ? cellShadow.mode : cellShadow.mode === "off" ? "soft" : cellShadow.mode,
      },
    });
  };

  return (
    <aside
      className="live-toggle-bar glass"
      data-expanded={expanded}
      aria-label="Canvas quick controls"
    >
      <button
        type="button"
        className="connection-visibility-toggle"
        aria-label={`Connections ${connectionsVisible ? "ON" : "OFF"}`}
        aria-pressed={connectionsVisible}
        data-active={connectionsVisible}
        onClick={() => {
          const connectionView = useLab.getState().settings.connectionView;
          setSettings({ connectionView: { ...connectionView, visible: !connectionView.visible } });
        }}
      >
        <Waypoints size={14} strokeWidth={2.0} aria-hidden="true" style={{ marginRight: 4 }} />
        <span>Connections {connectionsVisible ? "ON" : "OFF"}</span>
      </button>
      <button
        type="button"
        className="live-toggle-disclosure live-toggle-tooltip"
        aria-label="Controls"
        data-tooltip="Controls"
        aria-expanded={expanded}
        aria-controls="live-toggle-controls"
        onClick={() => setExpanded((value) => !value)}
      >
        <SlidersHorizontal size={15} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div id="live-toggle-controls" className="live-toggle-controls" aria-hidden={!expanded}>
        <QuickToggle
          ariaLabel="Membrane"
          dataTooltip="Membrane"
          icon={<Waves size={15} strokeWidth={1.45} aria-hidden="true" />}
          pressed={organismMode && blobOn}
          disabled={!organismMode}
          description={organismMode ? "Toggle the authored Organism membrane" : "Membrane is available in Organism"}
          onClick={() => setSettings({ blobOn: !blobOn })}
        />
        <QuickToggle
          ariaLabel="Motion"
          dataTooltip="Motion"
          icon={<Activity size={15} strokeWidth={1.45} aria-hidden="true" />}
          pressed={organismMode && motionEnabled}
          disabled={!organismMode}
          description={organismMode ? "Toggle Organism motion without changing authored amounts" : "Motion is available in Organism"}
          onClick={() => {
            const organism = useLab.getState().settings.organism;
            setSettings({ organism: { ...organism, motionEnabled: !organism.motionEnabled } });
          }}
        />
        <QuickToggle
          ariaLabel="Magnet"
          dataTooltip="Magnet"
          icon={<Magnet size={15} strokeWidth={1.45} aria-hidden="true" />}
          pressed={false}
          disabled
          description="Magnetic snapping arrives in M3C"
        />
        <QuickToggle
          ariaLabel="Grid"
          dataTooltip="Grid"
          icon={<Grid3X3 size={15} strokeWidth={1.45} aria-hidden="true" />}
          pressed={showGrid}
          description="Toggle the technical Canvas grid"
          onClick={() => setSettings({ showGrid: !showGrid })}
        />
        <QuickToggle
          ariaLabel="Shadow"
          dataTooltip="Shadow"
          icon={<CircleDot size={15} strokeWidth={1.45} aria-hidden="true" />}
          pressed={authoredShadowOn}
          reduced={shadowReduced}
          description={shadowReduced ? "Temporarily reduced by Auto Performance" : "Toggle authored Cell shadows"}
          onClick={toggleShadow}
        />
      </div>
    </aside>
  );
}
