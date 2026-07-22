/* V6K — shared widget control primitives. Same class names the V6H.1 control
   surface used (`org-*` in shell.css) so every widget inherits the refined
   slider/switch/section styling from one stylesheet. */

import { type ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  fmt,
  ariaValueText,
  onChange,
  onChangeEnd,
  onChangeCancel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt?: (v: number) => string;
  ariaValueText?: string;
  onChange: (v: number) => void;
  onChangeEnd?: () => void;
  onChangeCancel?: () => void;
}) {
  const frameRef = useRef<number | null>(null);
  const pendingValueRef = useRef<number | null>(null);
  const interactionOpenRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const flushPreview = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    const pending = pendingValueRef.current;
    pendingValueRef.current = null;
    if (pending !== null) onChangeRef.current(pending);
  };

  const publishPreview = (nextValue: number) => {
    interactionOpenRef.current = true;
    pendingValueRef.current = nextValue;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pending = pendingValueRef.current;
      pendingValueRef.current = null;
      if (pending !== null) onChangeRef.current(pending);
    });
  };

  const finishInteraction = () => {
    if (!interactionOpenRef.current) return;
    flushPreview();
    interactionOpenRef.current = false;
    onChangeEnd?.();
  };

  const cancelInteraction = () => {
    if (!interactionOpenRef.current) return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    pendingValueRef.current = null;
    interactionOpenRef.current = false;
    onChangeCancel?.();
  };

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <label className="org-slider">
      <span className="org-slider-meta">
        <span>{label}</span>
        <span className="org-slider-val">{fmt ? fmt(value) : String(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => publishPreview(Number(e.target.value))}
        onPointerUp={finishInteraction}
        onKeyUp={finishInteraction}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            finishInteraction();
            return;
          }
          if (event.key !== "Escape") return;
          event.preventDefault();
          cancelInteraction();
        }}
        onBlur={finishInteraction}
        aria-label={label}
        aria-valuetext={ariaValueText}
      />
    </label>
  );
}

export function SwitchRow({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="org-switch-row"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className="org-switch" data-on={on ? "true" : "false"}>
        <span className="org-switch-thumb" />
      </span>
    </button>
  );
}

export function MiniSwitch({
  on,
  label,
  onToggle,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="org-mini-switch"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <span className="org-switch" data-on={on ? "true" : "false"}>
        <span className="org-switch-thumb" />
      </span>
    </button>
  );
}

/** Collapsible group inside a widget — self-managed open state. */
export function WidgetSection({
  title,
  hint,
  defaultOpen = false,
  extra,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  /** header-level control (e.g. master switch) — sibling of the toggle */
  extra?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="org-sec">
      <div className="org-sec-headwrap">
        <button
          type="button"
          className="org-sec-head"
          data-has-extra={extra ? "true" : undefined}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="org-sec-title">{title}</span>
          {hint && <span className="org-sec-hint">{hint}</span>}
          <ChevronDown size={11} className="org-chev" data-open={open ? "true" : "false"} />
        </button>
        {extra && <span className="org-sec-extra">{extra}</span>}
      </div>
      {open && <div className="org-sec-body">{children}</div>}
    </section>
  );
}

/** Compact chip radio row. */
export function ChipRow<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="org-attach-chips" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className="pop-chip"
          role="radio"
          aria-checked={value === opt.id}
          data-active={value === opt.id}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Two-line choice row (name + description, optional leading swatch). */
export function ChoiceRow({
  active,
  name,
  desc,
  swatch,
  disabled,
  badge,
  onClick,
}: {
  active: boolean;
  name: string;
  desc: string;
  swatch?: ReactNode;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="org-choice"
      role="menuitemradio"
      aria-checked={active}
      data-active={active}
      disabled={disabled}
      onClick={onClick}
    >
      {swatch}
      <span className="org-choice-text">
        <span className="org-choice-name">
          {name}
          {badge && <i className="org-choice-badge">{badge}</i>}
        </span>
        <span className="org-choice-desc">{desc}</span>
      </span>
    </button>
  );
}
