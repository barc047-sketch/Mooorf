import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { ContextPoint } from "../types";
import type { ContextActionDefinition, ContextTargetKind } from "../interaction/contextActionRegistry";
import { layoutRadialActions, type RadialViewport } from "../interaction/radialLayout";

const readViewport = (): RadialViewport => typeof window === "undefined"
  ? { width: 1024, height: 768 }
  : { width: window.innerWidth, height: window.innerHeight };

interface ObjectRadialMenuProps {
  actions: readonly ContextActionDefinition[];
  point: ContextPoint;
  targetId: string;
  targetKind: Exclude<ContextTargetKind, "blank">;
  onAction: (action: ContextActionDefinition) => void;
}

export default function ObjectRadialMenu({
  actions,
  point,
  targetId,
  targetKind,
  onAction,
}: ObjectRadialMenuProps) {
  const [viewport, setViewport] = useState(readViewport);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const layout = useMemo(
    () => layoutRadialActions(actions.map((action) => action.id), point, viewport),
    [actions, point, viewport]
  );

  useEffect(() => {
    const resize = () => setViewport(readViewport());
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => firstActionRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [targetId, point.x, point.y]);

  const stopPointer = (event: PointerEvent<HTMLElement>) => event.stopPropagation();

  return (
    <div
      className="object-radial-surface"
      role="menu"
      aria-label="Object actions"
      data-context-surface="object-radial"
      data-empty-centre="true"
      onPointerDown={stopPointer}
      onContextMenu={(event) => event.preventDefault()}
    >
      {layout.nodes.map((node, index) => {
        const action = actions.find((candidate) => candidate.id === node.id)!;
        const available = action.availability({ targetKind, targetId });
        const Icon = action.icon;
        return (
          <button
            ref={index === 0 ? firstActionRef : undefined}
            key={action.id}
            type="button"
            className="object-radial-action"
            role="menuitem"
            aria-label={`${action.label}${action.future ? " (Future)" : ""}`}
            title={`${action.label}${action.future ? " · Future" : ""}`}
            disabled={!available}
            data-danger={action.danger ? "true" : undefined}
            data-future={action.future ? "true" : undefined}
            style={{
              left: node.x,
              top: node.y,
              "--radial-from-x": `${(point.x - node.x) * 0.52}px`,
              "--radial-from-y": `${(point.y - node.y) * 0.52}px`,
              "--radial-delay": `${index * 24}ms`,
            } as CSSProperties}
            onClick={() => onAction(action)}
          >
            <Icon size={16} strokeWidth={1.55} aria-hidden="true" />
            <span className="object-radial-tooltip" role="tooltip">
              {action.label}{action.future ? " · Future" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
