import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import type { RelationshipTypeDefinition } from "../domain/connections/relationshipTypes";
import type { ResolvedConnectionStyle } from "../domain/connections/styles";

export type RelationshipTypePickerOption = Pick<RelationshipTypeDefinition, "id" | "name" | "visualDefaults">;

const RELATIONSHIP_TYPE_MRU_KEY = "mooorf:recent-relationship-types";
const RELATIONSHIP_TYPE_MRU_LIMIT = 10;
const EMPTY_MRU: readonly string[] = [];
export const PICKER_MAX_HEIGHT_PX = 240;

let recentRelationshipTypeIds: readonly string[] | null = null;
const recentRelationshipTypeListeners = new Set<() => void>();

const getPreferenceStorage = (): Storage | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

const normalizeRelationshipTypeMRU = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const id = entry.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= RELATIONSHIP_TYPE_MRU_LIMIT) break;
  }
  return ids;
};

const loadRelationshipTypeMRU = (): readonly string[] => {
  if (recentRelationshipTypeIds) return recentRelationshipTypeIds;
  try {
    recentRelationshipTypeIds = normalizeRelationshipTypeMRU(
      JSON.parse(getPreferenceStorage()?.getItem(RELATIONSHIP_TYPE_MRU_KEY) ?? "[]"),
    );
  } catch {
    recentRelationshipTypeIds = [];
  }
  return recentRelationshipTypeIds;
};

const setRelationshipTypeMRU = (ids: readonly string[]): void => {
  const next = normalizeRelationshipTypeMRU(ids);
  if (JSON.stringify(loadRelationshipTypeMRU()) === JSON.stringify(next)) return;
  recentRelationshipTypeIds = next;
  try {
    getPreferenceStorage()?.setItem(RELATIONSHIP_TYPE_MRU_KEY, JSON.stringify(next));
  } catch {
    // Preference persistence is best-effort and never blocks authoring.
  }
  recentRelationshipTypeListeners.forEach((listener) => listener());
};

export const readRelationshipTypeMRU = (): string[] => [...loadRelationshipTypeMRU()];

export const recordRelationshipTypeUse = (typeId: string): void => {
  const id = typeId.trim();
  if (!id) return;
  setRelationshipTypeMRU([id, ...loadRelationshipTypeMRU().filter((entry) => entry !== id)]);
};

export const orderRelationshipTypePickerOptions = <T extends { id: string }>(
  options: readonly T[],
  recentIds: readonly string[],
): T[] => {
  const canonicalById = new Map(options.map((option) => [option.id, option]));
  const ordered: T[] = [];
  const seen = new Set<string>();
  for (const id of recentIds) {
    const option = canonicalById.get(id);
    if (!option || seen.has(id)) continue;
    seen.add(id);
    ordered.push(option);
  }
  for (const option of options) {
    if (seen.has(option.id)) continue;
    seen.add(option.id);
    ordered.push(option);
  }
  return ordered;
};

const subscribeToRelationshipTypeMRU = (listener: () => void) => {
  recentRelationshipTypeListeners.add(listener);
  return () => recentRelationshipTypeListeners.delete(listener);
};

const previewDash = (style: ResolvedConnectionStyle): string | undefined => {
  const scale = style.appearance.dashScale;
  if (style.strokePatternId === "dashed") return `${9 * scale} ${6 * scale}`;
  if (style.strokePatternId === "dotted") return `${1.2 * scale} ${5 * scale}`;
  if (style.strokePatternId === "dash-dot") return `${9 * scale} ${4 * scale} ${1.2 * scale} ${4 * scale}`;
  if (style.strokePatternId === "segmented-bars") return `${4 * scale} ${8 * scale}`;
  return undefined;
};

const previewPath = (geometryId: string): string => {
  if (geometryId === "curved") return "M 7 15 C 74 2, 176 28, 253 15";
  if (geometryId === "orthogonal") return "M 7 15 H 105 V 7 H 173 V 15 H 253";
  if (geometryId === "elbow") return "M 7 15 L 112 7 H 253";
  return "M 7 15 H 253";
};

function PreviewMarkerShape({ markerId }: { markerId: string }) {
  if (markerId === "open-arrow" || markerId === "chevron") {
    return <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke" strokeWidth="1.4" />;
  }
  if (markerId === "filled-arrow") return <path d="M 1 1 L 9 5 L 1 9 Z" fill="context-stroke" />;
  if (markerId === "open-triangle") return <path d="M 1 1 L 9 5 L 1 9 Z" fill="none" stroke="context-stroke" strokeWidth="1.2" />;
  if (markerId === "filled-triangle") return <path d="M 1 1 L 9 5 L 1 9 Z" fill="context-stroke" />;
  if (markerId === "circle") return <circle cx="5" cy="5" r="3.2" fill="none" stroke="context-stroke" strokeWidth="1.2" />;
  if (markerId === "filled-dot") return <circle cx="5" cy="5" r="3.2" fill="context-stroke" />;
  if (markerId === "square") return <rect x="2" y="2" width="6" height="6" fill="none" stroke="context-stroke" strokeWidth="1.2" />;
  if (markerId === "diamond") return <path d="M 5 1 L 9 5 L 5 9 L 1 5 Z" fill="none" stroke="context-stroke" strokeWidth="1.2" />;
  if (markerId === "bar") return <path d="M 5 0 V 10" fill="none" stroke="context-stroke" strokeWidth="1.5" />;
  if (markerId === "slash" || markerId === "architectural-tick") return <path d="M 2 9 L 8 1" fill="none" stroke="context-stroke" strokeWidth="1.4" />;
  if (markerId === "cross") return <path d="M 1 1 L 9 9 M 9 1 L 1 9" fill="none" stroke="context-stroke" strokeWidth="1.2" />;
  return <circle cx="5" cy="5" r="2.4" fill="context-stroke" />;
}

export function RelationshipTypeStylePreview({
  compact = false,
  type,
}: {
  compact?: boolean;
  type: RelationshipTypePickerOption;
}) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");
  const style = type.visualDefaults;
  const markerKey = `${type.id}-${instanceId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const startMarker = `relationship-type-${markerKey}-start`;
  const endMarker = `relationship-type-${markerKey}-end`;
  const markerScale = Math.max(3.5, Math.min(7, style.appearance.markerSize * .65));
  const path = previewPath(style.geometryId);
  const common = {
    fill: "none",
    stroke: style.appearance.color,
    strokeDasharray: previewDash(style),
    strokeLinecap: "round" as const,
    strokeWidth: Math.max(1, Math.min(4, style.appearance.width)),
    opacity: style.appearance.opacity,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const markerStart = style.startMarkerId === "none" ? undefined : `url(#${startMarker})`;
  const markerEnd = style.endMarkerId === "none" ? undefined : `url(#${endMarker})`;
  return (
    <svg
      className={`relationship-type-preview${compact ? " connection-quick-type-preview" : ""}`}
      viewBox="0 0 260 30"
      preserveAspectRatio="none"
      role={compact ? undefined : "img"}
      aria-hidden={compact || undefined}
      aria-label={compact ? undefined : `${type.name} resolved style preview`}
      data-geometry={style.geometryId}
      data-pattern={style.strokePatternId}
      data-start-marker={style.startMarkerId}
      data-end-marker={style.endMarkerId}
    >
      {!compact && <title>{type.name} resolved style</title>}
      <defs>
        {style.startMarkerId !== "none" && <marker id={startMarker} viewBox="0 0 10 10" refX="5" refY="5" markerWidth={markerScale} markerHeight={markerScale} orient="auto-start-reverse">
          <PreviewMarkerShape markerId={style.startMarkerId} />
        </marker>}
        {style.endMarkerId !== "none" && <marker id={endMarker} viewBox="0 0 10 10" refX="5" refY="5" markerWidth={markerScale} markerHeight={markerScale} orient="auto-start-reverse">
          <PreviewMarkerShape markerId={style.endMarkerId} />
        </marker>}
      </defs>
      {style.strokePatternId === "double" ? <>
        <path d={path} {...common} transform="translate(0 -2)" markerStart={markerStart} markerEnd={markerEnd} />
        <path d={path} {...common} transform="translate(0 2)" />
      </> : <path d={path} {...common} markerStart={markerStart} markerEnd={markerEnd} />}
    </svg>
  );
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
  placeholder,
  value,
}: {
  direction: "up" | "down";
  label: string;
  onChange: (id: string) => void;
  options: readonly RelationshipTypePickerOption[];
  placeholder?: string;
  value: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const recentIds = useSyncExternalStore(
    subscribeToRelationshipTypeMRU,
    loadRelationshipTypeMRU,
    () => EMPTY_MRU,
  );
  const orderedOptions = useMemo(
    () => orderRelationshipTypePickerOptions(options, recentIds),
    [options, recentIds],
  );
  const current = useMemo(
    () => options.find((option) => option.id === value) ?? { id: value, name: placeholder ?? "Custom" },
    [options, placeholder, value],
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
      maxHeight: Math.max(0, Math.min(PICKER_MAX_HEIGHT_PX, available)),
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [direction, open, orderedOptions.length, value]);

  useLayoutEffect(() => {
    if (!open || !position) return;
    const selected = menuRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    const fallback = menuRef.current?.querySelector<HTMLButtonElement>('[role="option"]');
    (selected ?? fallback)?.focus();
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
    if (!menuRef.current || !orderedOptions.length) return;
    let nextIndex = index;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % orderedOptions.length;
    else if (event.key === "ArrowUp") nextIndex = (index - 1 + orderedOptions.length) % orderedOptions.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = orderedOptions.length - 1;
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
        {orderedOptions.map((option, index) => (
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
            <span className="connection-quick-type-name">{option.name}</span>
            <RelationshipTypeStylePreview compact type={option} />
          </button>
        ))}
      </div>,
      document.body,
    )}
  </>;
}
