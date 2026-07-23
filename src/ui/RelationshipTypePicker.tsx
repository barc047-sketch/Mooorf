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
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import type { RelationshipTypeDefinition } from "../domain/connections/relationshipTypes";
import type { ResolvedConnectionStyle } from "../domain/connections/styles";
import {
  buildConnectionStrokeMotif,
  connectionStrokeDashArray,
  resolveConnectionStrokePattern,
  type ConnectionStrokeCenterline,
  type ConnectionStrokePoint,
} from "../domain/connections/strokePatterns";
import type { ConnectionLineCap, ConnectionLineJoin } from "../domain/graph/types";

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

const useAdaptiveSpecimenLength = (
  compact: boolean,
  lengthRange?: readonly [number, number],
): { length: number; ref: RefObject<SVGSVGElement | null> } => {
  const ref = useRef<SVGSVGElement>(null);
  const minimum = lengthRange?.[0] ?? (compact ? 105 : 145);
  const maximum = lengthRange?.[1] ?? (compact ? 165 : 240);
  const [length, setLength] = useState(() => Math.round((minimum + maximum) / 2));
  useLayoutEffect(() => {
    const specimen = ref.current;
    if (!specimen) return;
    const measure = () => {
      const measured = Math.round(specimen.getBoundingClientRect().width);
      const bounded = Math.max(minimum, Math.min(maximum, measured || length));
      setLength((current) => current === bounded ? current : bounded);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(specimen);
    return () => observer.disconnect();
  }, [length, maximum, minimum]);
  return { length, ref };
};

const previewCenterline = (
  geometryId: string,
  length: number,
  height = 30,
): ConnectionStrokeCenterline => {
  const start = 7;
  const end = Math.max(start + 1, length - 7);
  const span = end - start;
  const middle = height / 2;
  const upper = Math.max(1, height * .08);
  const lower = Math.max(upper + 1, height * .92);
  if (geometryId === "curved") return {
    kind: "bezier",
    points: [
      { x: start, y: middle },
      { x: start + span * 0.26, y: upper },
      { x: start + span * 0.72, y: lower },
      { x: end, y: middle },
    ],
  };
  if (geometryId === "orthogonal") return {
    kind: "polyline",
    points: [
      { x: start, y: middle },
      { x: start + span * 0.36, y: middle },
      { x: start + span * 0.36, y: height * .24 },
      { x: start + span * 0.66, y: height * .24 },
      { x: start + span * 0.66, y: middle },
      { x: end, y: middle },
    ],
  };
  if (geometryId === "elbow") return {
    kind: "polyline",
    points: [
      { x: start, y: middle },
      { x: start + span * 0.42, y: height * .24 },
      { x: end, y: middle },
    ],
  };
  return { kind: "line", points: [{ x: start, y: middle }, { x: end, y: middle }] };
};

const pointsPath = (points: readonly ConnectionStrokePoint[]): string => points.length
  ? `M ${points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" L ")}`
  : "";

const centerlinePath = (centerline: ConnectionStrokeCenterline): string => {
  if (centerline.kind === "bezier" && centerline.points.length >= 4) {
    const [start, first, second, end] = centerline.points;
    return `M ${start!.x} ${start!.y} C ${first!.x} ${first!.y}, ${second!.x} ${second!.y}, ${end!.x} ${end!.y}`;
  }
  return pointsPath(centerline.points);
};

function ConnectionStrokePreviewPaths({
  centerline,
  markerEnd,
  markerStart,
  previewMinimumStrokeWidth,
  style,
}: {
  centerline: ConnectionStrokeCenterline;
  markerEnd?: string;
  markerStart?: string;
  previewMinimumStrokeWidth?: number;
  style: ResolvedConnectionStyle;
}) {
  const definition = resolveConnectionStrokePattern(style.strokePatternId);
  const common = {
    fill: "none",
    stroke: style.appearance.color,
    strokeLinecap: style.lineCap,
    strokeLinejoin: style.lineJoin,
    strokeWidth: Math.max(
      previewMinimumStrokeWidth ?? 0.5,
      Math.min(64, style.appearance.width),
    ),
    opacity: style.appearance.opacity,
    vectorEffect: "non-scaling-stroke" as const,
  };
  if (definition.family === "procedural") {
    const motif = buildConnectionStrokeMotif(
      centerline,
      style.strokePatternId,
      style.appearance.dashScale,
      style.appearance.patternAmplitude,
    );
    const marks = motif.marks.map((mark) => `M ${mark.from.x.toFixed(2)} ${mark.from.y.toFixed(2)} L ${mark.to.x.toFixed(2)} ${mark.to.y.toFixed(2)}`).join(" ");
    return <>
      {motif.paths.length === 0 && (markerStart || markerEnd) && <path
        d={centerlinePath(centerline)}
        fill="none"
        stroke="none"
        markerStart={markerStart}
        markerEnd={markerEnd}
      />}
      {motif.paths.map((points, index) => <path
        key={index}
        d={pointsPath(points)}
        {...common}
        markerStart={index === 0 ? markerStart : undefined}
        markerEnd={index === 0 ? markerEnd : undefined}
      />)}
      {marks && <path d={marks} {...common} />}
    </>;
  }
  const path = centerlinePath(centerline);
  const native = {
    ...common,
    strokeDasharray: connectionStrokeDashArray(style.strokePatternId, style.appearance.dashScale).join(" ") || undefined,
  };
  return style.strokePatternId === "double" ? <>
    <path d={path} {...native} transform="translate(0 -2)" markerStart={markerStart} markerEnd={markerEnd} />
    <path d={path} {...native} transform="translate(0 2)" />
  </> : <path d={path} {...native} markerStart={markerStart} markerEnd={markerEnd} />;
}

export function PreviewMarkerShape({
  color = "context-stroke",
  markerId,
}: {
  color?: string;
  markerId: string;
}) {
  if (markerId === "open-arrow" || markerId === "chevron") {
    return <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke={color} strokeWidth="1.4" />;
  }
  if (markerId === "filled-arrow") return <path d="M 1 1 L 9 5 L 1 9 Z" fill={color} />;
  if (markerId === "open-triangle") return <path d="M 1 1 L 9 5 L 1 9 Z" fill="none" stroke={color} strokeWidth="1.2" />;
  if (markerId === "filled-triangle") return <path d="M 1 1 L 9 5 L 1 9 Z" fill={color} />;
  if (markerId === "circle") return <circle cx="5" cy="5" r="3.2" fill="none" stroke={color} strokeWidth="1.2" />;
  if (markerId === "filled-dot") return <circle cx="5" cy="5" r="3.2" fill={color} />;
  if (markerId === "square") return <rect x="2" y="2" width="6" height="6" fill="none" stroke={color} strokeWidth="1.2" />;
  if (markerId === "diamond") return <path d="M 5 1 L 9 5 L 5 9 L 1 5 Z" fill="none" stroke={color} strokeWidth="1.2" />;
  if (markerId === "bar") return <path d="M 5 0 V 10" fill="none" stroke={color} strokeWidth="1.5" />;
  if (markerId === "slash" || markerId === "architectural-tick") return <path d="M 2 9 L 8 1" fill="none" stroke={color} strokeWidth="1.4" />;
  if (markerId === "cross") return <path d="M 1 1 L 9 9 M 9 1 L 1 9" fill="none" stroke={color} strokeWidth="1.2" />;
  return <circle cx="5" cy="5" r="2.4" fill={color} />;
}

export function ConnectionGeometrySpecimen({ geometryId }: { geometryId: string }) {
  const { length, ref } = useAdaptiveSpecimenLength(false);
  return <svg ref={ref} className="connection-option-specimen" viewBox={`0 0 ${length} 30`} data-specimen-length={length} aria-hidden="true">
    <path d={centerlinePath(previewCenterline(geometryId, length))} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function ConnectionStrokeSpecimen({ style }: { style: ResolvedConnectionStyle }) {
  const { length, ref } = useAdaptiveSpecimenLength(false);
  const specimenStyle = { ...style, appearance: { ...style.appearance, color: "currentColor" } };
  return <svg ref={ref} className="connection-option-specimen" viewBox={`0 0 ${length} 30`} data-specimen-length={length} aria-hidden="true">
    <ConnectionStrokePreviewPaths centerline={previewCenterline("straight", length)} style={specimenStyle} />
  </svg>;
}

export function ConnectionLineCapSpecimen({ lineCap }: { lineCap: ConnectionLineCap }) {
  return <svg className="connection-cap-join-specimen" viewBox="0 0 64 24" aria-hidden="true">
    <path d="M 14 4 V 20 M 50 4 V 20" stroke="currentColor" strokeWidth=".75" opacity=".3" />
    <path d="M 14 12 H 50" stroke="currentColor" strokeWidth="6" strokeLinecap={lineCap} />
  </svg>;
}

export function ConnectionLineJoinSpecimen({ lineJoin }: { lineJoin: ConnectionLineJoin }) {
  return <svg className="connection-cap-join-specimen" viewBox="0 0 64 24" aria-hidden="true">
    <path d="M 13 19 L 32 5 L 51 19" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="butt" strokeLinejoin={lineJoin} />
  </svg>;
}

export function ConnectionMarkerSpecimen({
  markerId,
  position,
}: {
  markerId: string;
  position: "start" | "end";
}) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");
  const markerIdValue = `connection-marker-specimen-${position}-${markerId}-${instanceId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const url = markerId === "none" ? undefined : `url(#${markerIdValue})`;
  return <svg className="connection-marker-specimen" viewBox="0 0 64 20" aria-hidden="true">
    <defs>
      {markerId !== "none" && <marker id={markerIdValue} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <PreviewMarkerShape markerId={markerId} />
      </marker>}
    </defs>
    <path
      d="M 8 10 H 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      markerStart={position === "start" ? url : undefined}
      markerEnd={position === "end" ? url : undefined}
    />
  </svg>;
}

export function RelationshipTypeStylePreview({
  compact = false,
  lengthRange,
  previewMinimumStrokeWidth,
  specimenHeight = 30,
  type,
}: {
  compact?: boolean;
  lengthRange?: readonly [number, number];
  previewMinimumStrokeWidth?: number;
  specimenHeight?: number;
  type: RelationshipTypePickerOption;
}) {
  const { length, ref } = useAdaptiveSpecimenLength(compact, lengthRange);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");
  const style = type.visualDefaults;
  const markerKey = `${type.id}-${instanceId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const startMarker = `relationship-type-${markerKey}-start`;
  const endMarker = `relationship-type-${markerKey}-end`;
  const markerScale = Math.max(3.5, Math.min(7, style.appearance.markerSize * .65));
  const markerStart = style.startMarkerId === "none" ? undefined : `url(#${startMarker})`;
  const markerEnd = style.endMarkerId === "none" ? undefined : `url(#${endMarker})`;
  return (
    <svg
      ref={ref}
      className={`relationship-type-preview${compact ? " connection-quick-type-preview" : ""}`}
      viewBox={`0 0 ${length} ${specimenHeight}`}
      role={compact ? undefined : "img"}
      aria-hidden={compact || undefined}
      aria-label={compact ? undefined : `${type.name} resolved style preview`}
      data-geometry={style.geometryId}
      data-pattern={style.strokePatternId}
      data-start-marker={style.startMarkerId}
      data-end-marker={style.endMarkerId}
      data-specimen-length={length}
    >
      {!compact && <title>{type.name} resolved style</title>}
      <defs>
        {style.startMarkerId !== "none" && <marker id={startMarker} viewBox="0 0 10 10" refX="5" refY="5" markerWidth={markerScale} markerHeight={markerScale} orient="auto-start-reverse">
          <PreviewMarkerShape markerId={style.startMarkerId} color={style.appearance.color} />
        </marker>}
        {style.endMarkerId !== "none" && <marker id={endMarker} viewBox="0 0 10 10" refX="5" refY="5" markerWidth={markerScale} markerHeight={markerScale} orient="auto-start-reverse">
          <PreviewMarkerShape markerId={style.endMarkerId} color={style.appearance.color} />
        </marker>}
      </defs>
      <ConnectionStrokePreviewPaths
        centerline={previewCenterline(style.geometryId, length, specimenHeight)}
        previewMinimumStrokeWidth={previewMinimumStrokeWidth}
        style={style}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
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

  const chooseOption = (optionId: string) => {
    onChange(optionId);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number, optionId: string) => {
    if (!menuRef.current || !orderedOptions.length) return;
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      chooseOption(optionId);
      return;
    }
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
            onKeyDown={(event) => moveFocus(event, index, option.id)}
            onClick={() => chooseOption(option.id)}
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
