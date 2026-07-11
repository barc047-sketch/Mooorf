import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import type { SpaceCell } from "../types";
import { useLab } from "../state/store";
import { normalizeInlineCellDraft } from "./cellActivation";
import "./inlineCellEditor.css";

export interface InlineEditorPosition { x: number; y: number }

export default function InlineCellEditor({ space, position, onClose }: {
  space: SpaceCell;
  position: InlineEditorPosition;
  onClose: () => void;
}) {
  const updateSpace = useLab((state) => state.updateSpace);
  const [name, setName] = useState(space.name);
  const [area, setArea] = useState(String(space.area));
  const formRef = useRef<HTMLFormElement>(null);
  const closedRef = useRef(false);

  const commit = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    updateSpace(space.id, normalizeInlineCellDraft(name, area, space.area));
    onClose();
  }, [area, name, onClose, space.area, space.id, updateSpace]);

  const cancel = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) commit();
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [commit]);

  const submit = (event: FormEvent) => { event.preventDefault(); commit(); };
  const keyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    cancel();
  };

  return (
    <form
      ref={formRef}
      className="inline-cell-editor glass"
      data-export-exclude="true"
      style={{ "--editor-x": `${position.x}px`, "--editor-y": `${position.y}px` } as CSSProperties}
      onSubmit={submit}
      onKeyDown={keyDown}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <label className="sr-only" htmlFor={`inline-name-${space.id}`}>Name</label>
      <input id={`inline-name-${space.id}`} value={name} onChange={(event) => setName(event.target.value)} autoFocus aria-label="Space name" />
      <span className="inline-cell-divider" aria-hidden="true" />
      <label className="sr-only" htmlFor={`inline-area-${space.id}`}>Area</label>
      <input id={`inline-area-${space.id}`} className="inline-cell-area" type="number" min={1} inputMode="decimal" value={area} onChange={(event) => setArea(event.target.value)} aria-label="Space area" />
      <span className="inline-cell-unit">m²</span>
    </form>
  );
}
