/* V6K widget frame — the chrome every floating control widget shares.
   Movable (drag the title strip), minimizable to a header chip, closable,
   internal scroll, brought to front on pointer-down. Drag offsets use the CSS
   `translate` property so Motion's `transform` mount animation never fights
   the drag position. Offsets are session-remembered per widget id (UI state
   only — never product data). */

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { Minus, X, type LucideIcon } from "lucide-react";
import { useLab } from "../../state/store";
import type { WidgetId } from "../../types";
import type { WidgetGeometry } from "../panels/widgetRegistry";
import { clampWidgetOffset } from "./widgetLifecycle";
import "./widgets.css";

const SNAP_PX = 22; // magnetic: near-home drops tidy back into the stack
const offsetMemory = new Map<WidgetId, { dx: number; dy: number }>();

/** Viewport-reachable offset bounds for a frame at its current rect/offset —
 * shared by drag and the scale-change safety clamp so both use one formula. */
const dragBounds = (rect: DOMRect, current: { dx: number; dy: number }) => {
  const curX = rect.left - current.dx;
  const curY = rect.top - current.dy;
  return {
    minX: 12 - curX - rect.width + 96,
    maxX: window.innerWidth - 12 - curX - 96,
    minY: 12 - curY,
    maxY: window.innerHeight - 52 - curY,
  };
};

export interface WidgetFrameProps {
  id: WidgetId;
  title: string;
  icon: LucideIcon;
  geometry: WidgetGeometry;
  /** stack slot — cascades the default anchor down the right edge */
  index: number;
  z: number;
  focused: boolean;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function WidgetFrame({
  id,
  title,
  icon: Icon,
  geometry,
  index,
  z,
  focused,
  headerExtra,
  footer,
  children,
}: WidgetFrameProps) {
  const closeWidget = useLab((s) => s.closeWidget);
  const focusWidget = useLab((s) => s.focusWidget);
  const minimized = useLab((s) => s.minimizedWidgets.includes(id));
  const setWidgetMinimized = useLab((s) => s.setWidgetMinimized);
  const launchRevision = useLab((s) => s.widgetLaunchRevisions[id] ?? 0);
  const uiScale = useLab((s) => s.settings.uiScale);
  const widgetScale = useLab((s) => s.settings.widgetScale);
  /* V7.1D — outer frame footprint reflects both scales, each applied once. */
  const scale = uiScale * widgetScale;
  const frameRef = useRef<HTMLElement>(null);
  const drag = useRef({ on: false, sx: 0, sy: 0, bx: 0, by: 0 });
  const offset = useRef(offsetMemory.get(id) ?? { dx: 0, dy: 0 });
  const mountedScale = useRef(scale);

  const applyOffset = (dx: number, dy: number, animate = false) => {
    const el = frameRef.current;
    if (!el) return;
    offset.current = { dx, dy };
    offsetMemory.set(id, offset.current);
    el.style.transition = animate ? "translate 260ms cubic-bezier(0.22, 1, 0.36, 1)" : "";
    el.style.translate = `${dx}px ${dy}px`;
  };

  const onHeadDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("button")) return;
    const el = frameRef.current;
    if (!el) return;
    drag.current = {
      on: true,
      sx: e.clientX,
      sy: e.clientY,
      bx: offset.current.dx,
      by: offset.current.dy,
    };
    el.dataset.dragging = "true";
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // Synthetic pointer ids still drag without capture.
    }
  };

  const onHeadMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = drag.current.bx + (e.clientX - drag.current.sx);
    const dy = drag.current.by + (e.clientY - drag.current.sy);
    /* keep the title strip reachable — clamp against the viewport */
    const { minX, maxX, minY, maxY } = dragBounds(rect, offset.current);
    applyOffset(
      Math.min(Math.max(dx, minX), maxX),
      Math.min(Math.max(dy, minY), maxY)
    );
  };

  const onHeadUp = () => {
    if (!drag.current.on) return;
    drag.current.on = false;
    const el = frameRef.current;
    if (el) delete el.dataset.dragging;
    const { dx, dy } = offset.current;
    if (Math.abs(dx) < SNAP_PX && Math.abs(dy) < SNAP_PX) applyOffset(0, 0, true);
  };

  /* V7.1D — when Interface/Widget Scale grows a frame, nudge it back onto
   * screen only if it became substantially unreachable; never reset to
   * defaults and never touch an already-in-bounds position. */
  useEffect(() => {
    if (scale === mountedScale.current) return;
    mountedScale.current = scale;
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const { minX, maxX, minY, maxY } = dragBounds(rect, offset.current);
    const { dx, dy } = offset.current;
    const clampedDx = Math.min(Math.max(dx, minX), maxX);
    const clampedDy = Math.min(Math.max(dy, minY), maxY);
    if (clampedDx !== dx || clampedDy !== dy) applyOffset(clampedDx, clampedDy, true);
  }, [scale]);

  /* A launcher click is a generic open/focus/expand/reveal command. Re-clamp
   * remembered session geometry after the frame is laid out so both the Dock
   * and Rail recover the full body in one click. */
  useEffect(() => {
    const el = frameRef.current;
    if (!el || launchRevision === 0) return;
    const rect = el.getBoundingClientRect();
    const visible = clampWidgetOffset({
      x: rect.left,
      y: rect.top,
      frameWidth: rect.width,
      frameHeight: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      margin: 12,
    });
    const dx = offset.current.dx + visible.x - rect.left;
    const dy = offset.current.dy + visible.y - rect.top;
    if (dx !== offset.current.dx || dy !== offset.current.dy) applyOffset(dx, dy, true);
  }, [launchRevision, minimized]);

  return (
    <motion.section
      ref={frameRef}
      className="wframe glass"
      role="dialog"
      aria-label={title}
      data-widget={id}
      data-geometry={geometry.variant}
      data-aspect={geometry.aspectIntent}
      data-depth={focused ? "front" : "back"}
      data-glass-ready="true"
      data-min={minimized ? "true" : undefined}
      style={{
        width: Math.round(geometry.width * scale),
        minWidth: Math.round(geometry.minWidth * scale),
        minHeight: geometry.minHeight ? Math.round(geometry.minHeight * scale) : undefined,
        "--wframe-authored-max-height": geometry.maxHeight
          ? `${Math.round(geometry.maxHeight * scale)}px`
          : undefined,
        top: 72 + index * 42,
        zIndex: `calc(var(--z-widget) + ${Math.min(z, 19)})`,
        translate: `${offset.current.dx}px ${offset.current.dy}px`,
      } as CSSProperties}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      onPointerDownCapture={() => focusWidget(id)}
    >
      <header
        className="wframe-head"
        onPointerDown={onHeadDown}
        onPointerMove={onHeadMove}
        onPointerUp={onHeadUp}
        onPointerCancel={onHeadUp}
      >
        <span className="wframe-grip" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="wframe-icon" aria-hidden="true">
          <Icon size={13} strokeWidth={1.5} />
        </span>
        <div className="wframe-titles">
          <span className="wframe-title">{title}</span>
        </div>
        {headerExtra && <span className="wframe-extra">{headerExtra}</span>}
        <button
          type="button"
          className="wframe-btn"
          aria-label={minimized ? `Expand ${title}` : `Minimize ${title}`}
          aria-expanded={!minimized}
          onClick={() => setWidgetMinimized(id, !minimized)}
        >
          <Minus size={12} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="wframe-btn"
          aria-label={`Close ${title}`}
          onClick={() => closeWidget(id)}
        >
          <X size={12} strokeWidth={1.6} />
        </button>
      </header>
      {!minimized && <div className="wframe-body">{children}</div>}
      {!minimized && footer && <footer className="wframe-foot">{footer}</footer>}
    </motion.section>
  );
}
