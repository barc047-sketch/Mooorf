/* V6K widget frame — the chrome every floating control widget shares.
   Movable (drag the title strip), minimizable to a header chip, closable,
   internal scroll, brought to front on pointer-down. Drag offsets use the CSS
   `translate` property so Motion's `transform` mount animation never fights
   the drag position. Offsets are session-remembered per widget id (UI state
   only — never product data). */

import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Minus, X } from "lucide-react";
import { useLab } from "../../state/store";
import type { WidgetId } from "../../types";
import "./widgets.css";

const SNAP_PX = 22; // magnetic: near-home drops tidy back into the stack
const offsetMemory = new Map<WidgetId, { dx: number; dy: number }>();

export interface WidgetFrameProps {
  id: WidgetId;
  eyebrow: string;
  title: string;
  /** stack slot — cascades the default anchor down the right edge */
  index: number;
  z: number;
  focused: boolean;
  width?: number;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function WidgetFrame({
  id,
  eyebrow,
  title,
  index,
  z,
  focused,
  width = 288,
  headerExtra,
  footer,
  children,
}: WidgetFrameProps) {
  const closeWidget = useLab((s) => s.closeWidget);
  const focusWidget = useLab((s) => s.focusWidget);
  const frameRef = useRef<HTMLElement>(null);
  const [minimized, setMinimized] = useState(false);
  const drag = useRef({ on: false, sx: 0, sy: 0, bx: 0, by: 0 });
  const offset = useRef(offsetMemory.get(id) ?? { dx: 0, dy: 0 });

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
    const curX = rect.left - offset.current.dx;
    const curY = rect.top - offset.current.dy;
    const minX = 12 - curX - rect.width + 96;
    const maxX = window.innerWidth - 12 - curX - 96;
    const minY = 12 - curY;
    const maxY = window.innerHeight - 52 - curY;
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

  return (
    <motion.section
      ref={frameRef}
      className="wframe glass"
      role="dialog"
      aria-label={title}
      data-widget={id}
      data-depth={focused ? "front" : "back"}
      data-min={minimized ? "true" : undefined}
      style={{
        width,
        top: 72 + index * 42,
        zIndex: 40 + z,
        translate: `${offset.current.dx}px ${offset.current.dy}px`,
      }}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
        <div className="wframe-titles">
          <span className="wframe-eyebrow">{eyebrow}</span>
          <span className="wframe-title">{title}</span>
        </div>
        {headerExtra && <span className="wframe-extra">{headerExtra}</span>}
        <button
          type="button"
          className="wframe-btn"
          aria-label={minimized ? `Expand ${title}` : `Minimize ${title}`}
          aria-expanded={!minimized}
          onClick={() => setMinimized((m) => !m)}
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
