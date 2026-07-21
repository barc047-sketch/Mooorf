import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export interface RelationshipTypePickerOption {
  id: string;
  name: string;
}

type MenuPosition = {
  bottom?: number;
  left: number;
  maxHeight: number;
  top?: number;
  width: number;
};

export function RelationshipTypePicker({
  direction,
  label,
  onChange,
  options,
  value,
}: {
  direction: "up" | "down";
  label: string;
  onChange: (id: string) => void;
  options: readonly RelationshipTypePickerOption[];
  value: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const current = useMemo(
    () => options.find((option) => option.id === value) ?? options[0] ?? { id: value, name: "Custom" },
    [options, value],
  );

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportInset = 8;
    const width = Math.min(rect.width, window.innerWidth - viewportInset * 2);
    const left = Math.max(viewportInset, Math.min(rect.left, window.innerWidth - width - viewportInset));
    const available = direction === "up" ? rect.top - 16 : window.innerHeight - rect.bottom - 16;
    setPosition({
      ...(direction === "up" ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      left,
      maxHeight: Math.max(0, available),
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [direction, open, options.length, value]);

  useLayoutEffect(() => {
    if (!open || !position) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.focus();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    const observer = new ResizeObserver(updatePosition);
    if (triggerRef.current) observer.observe(triggerRef.current);
    document.addEventListener("pointerdown", closeOnOutsidePress, true);
    document.addEventListener("keydown", closeOnEscape, true);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", closeOnOutsidePress, true);
      document.removeEventListener("keydown", closeOnEscape, true);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!menuRef.current || !options.length) return;
    let nextIndex = index;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % options.length;
    else if (event.key === "ArrowUp") nextIndex = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else return;
    event.preventDefault();
    menuRef.current.querySelectorAll<HTMLButtonElement>('[role="option"]')[nextIndex]?.focus();
  };

  return <>
    <button
      ref={triggerRef}
      type="button"
      className="connection-quick-select-trigger"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={open}
      title={label}
      onClick={() => setOpen((isOpen) => !isOpen)}
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        setOpen(true);
      }}
    >
      <span>{current.name}</span>
      <ChevronDown size={12} strokeWidth={1.5} aria-hidden="true" />
    </button>
    {open && position && typeof document !== "undefined" && createPortal(
      <div
        ref={menuRef}
        className="connection-quick-type-menu glass"
        role="listbox"
        aria-label={label}
        style={position as CSSProperties}
      >
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            role="option"
            aria-selected={option.id === value}
            tabIndex={option.id === value ? 0 : -1}
            onKeyDown={(event) => moveFocus(event, index)}
            onClick={() => {
              onChange(option.id);
              setOpen(false);
              triggerRef.current?.focus();
            }}
          >
            <span>{option.name}</span>
          </button>
        ))}
      </div>,
      document.body,
    )}
  </>;
}
