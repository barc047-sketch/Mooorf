import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, SlidersHorizontal, Waypoints, X } from "lucide-react";
import { CONNECTION_SEMANTIC_TYPES } from "../domain/connections/registry";
import type { KnownConnectionSemanticTypeId } from "../domain/graph/types";
import { useLab } from "../state/store";

type RailLayout = {
  left: number;
  width: number;
};

type TypeMenuPosition = {
  bottom: number;
  left: number;
  maxHeight: number;
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
  const typeTriggerRef = useRef<HTMLButtonElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const [railLayout, setRailLayout] = useState<RailLayout>({ left: 24, width: 520 });
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [typeMenuPosition, setTypeMenuPosition] = useState<TypeMenuPosition | null>(null);
  const currentType = useMemo(
    () => CONNECTION_SEMANTIC_TYPES.find((definition) => definition.id === typeId) ?? CONNECTION_SEMANTIC_TYPES[0],
    [typeId],
  );

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

  const updateTypeMenuPosition = () => {
    const trigger = typeTriggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportInset = 8;
    const width = Math.min(rect.width, window.innerWidth - viewportInset * 2);
    const left = Math.max(viewportInset, Math.min(rect.left, window.innerWidth - width - viewportInset));
    setTypeMenuPosition({
      bottom: window.innerHeight - rect.top + 6,
      left,
      maxHeight: Math.max(0, rect.top - 16),
      width,
    });
  };

  useLayoutEffect(() => {
    if (!typeMenuOpen) return;
    updateTypeMenuPosition();
  }, [typeMenuOpen, railLayout.width]);

  useLayoutEffect(() => {
    if (!typeMenuOpen || !typeMenuPosition) return;
    typeMenuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.focus();
  }, [typeMenuOpen, typeMenuPosition]);

  useEffect(() => {
    if (!typeMenuOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (typeTriggerRef.current?.contains(target) || typeMenuRef.current?.contains(target)) return;
      setTypeMenuOpen(false);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setTypeMenuOpen(false);
      typeTriggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsidePress, true);
    document.addEventListener("keydown", closeOnEscape, true);
    window.addEventListener("resize", updateTypeMenuPosition);
    window.addEventListener("scroll", updateTypeMenuPosition, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress, true);
      document.removeEventListener("keydown", closeOnEscape, true);
      window.removeEventListener("resize", updateTypeMenuPosition);
      window.removeEventListener("scroll", updateTypeMenuPosition, true);
    };
  }, [typeMenuOpen]);

  const moveTypeMenuFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!typeMenuRef.current) return;
    let nextIndex = index;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % CONNECTION_SEMANTIC_TYPES.length;
    else if (event.key === "ArrowUp") nextIndex = (index - 1 + CONNECTION_SEMANTIC_TYPES.length) % CONNECTION_SEMANTIC_TYPES.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = CONNECTION_SEMANTIC_TYPES.length - 1;
    else return;
    event.preventDefault();
    typeMenuRef.current.querySelectorAll<HTMLButtonElement>('[role="option"]')[nextIndex]?.focus();
  };

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
      <button
        ref={typeTriggerRef}
        type="button"
        className="connection-quick-select-trigger"
        aria-label="Current Relationship Type"
        aria-haspopup="listbox"
        aria-expanded={typeMenuOpen}
        title="Current Relationship Type"
        onClick={() => setTypeMenuOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          setTypeMenuOpen(true);
        }}
      >
        <span>{currentType.name}</span>
        <ChevronDown size={12} strokeWidth={1.5} aria-hidden="true" />
      </button>
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
      {typeMenuOpen && typeMenuPosition && createPortal(
        <div
          ref={typeMenuRef}
          className="connection-quick-type-menu glass"
          role="listbox"
          aria-label="Current Relationship Type"
          style={{
            bottom: typeMenuPosition.bottom,
            left: typeMenuPosition.left,
            maxHeight: typeMenuPosition.maxHeight,
            width: typeMenuPosition.width,
          }}
        >
          {CONNECTION_SEMANTIC_TYPES.map((definition, index) => (
            <button
              key={definition.id}
              type="button"
              role="option"
              aria-selected={definition.id === typeId}
              tabIndex={definition.id === typeId ? 0 : -1}
              onKeyDown={(event) => moveTypeMenuFocus(event, index)}
              onClick={() => {
                setConnectionModeType(definition.id as KnownConnectionSemanticTypeId);
                setTypeMenuOpen(false);
                typeTriggerRef.current?.focus();
              }}
            >
              <span>{definition.name}</span>
            </button>
          ))}
        </div>,
        document.body,
      )}
    </motion.div>
  );
}
