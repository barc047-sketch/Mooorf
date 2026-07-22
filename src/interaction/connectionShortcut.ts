import type { ViewMode } from "../types";

const CONNECTION_EDITABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "input[type='search']",
  "[type='search']",
  "[role='searchbox']",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='textbox']",
  "[role='combobox']",
  "[role='spinbutton']",
  "[data-connection-shortcut='ignore']",
  "[data-notes-editor]",
  "[name='notes']",
  "[data-text-editor]",
  ".inline-cell-editor",
  "[role='dialog'][data-text-editor]",
  "[aria-modal='true'][data-text-editor]",
].join(",");

export function isConnectionShortcutKey(
  event: Pick<KeyboardEvent, "key" | "repeat" | "ctrlKey" | "metaKey" | "altKey">,
): boolean {
  return event.key.toLowerCase() === "c"
    && !event.repeat
    && !event.ctrlKey
    && !event.metaKey
    && !event.altKey;
}

export function isConnectionShortcutEditingTarget(target: EventTarget | null): boolean {
  if (typeof Element === "undefined" || !(target instanceof Element)) return false;
  const htmlElement = typeof HTMLElement !== "undefined" && target instanceof HTMLElement
    ? target
    : target.parentElement;
  return Boolean(htmlElement?.isContentEditable || target.closest(CONNECTION_EDITABLE_SELECTOR));
}

export function shouldHandleConnectionShortcut(event: KeyboardEvent, view: ViewMode): boolean {
  return view === "canvas"
    && isConnectionShortcutKey(event)
    && !isConnectionShortcutEditingTarget(event.target);
}

export type ConnectionSelectionShortcut = "copy-style" | "paste-style" | "delete";

export function resolveConnectionSelectionShortcut(
  event: KeyboardEvent,
  view: ViewMode,
  selectedConnectionCount: number,
): ConnectionSelectionShortcut | null {
  if (
    view !== "canvas"
    || selectedConnectionCount < 1
    || event.repeat
    || isConnectionShortcutEditingTarget(event.target)
  ) return null;

  const key = event.key.toLowerCase();
  const modifier = event.metaKey || event.ctrlKey;
  if (modifier && !event.altKey && !event.shiftKey) {
    if (key === "c") return "copy-style";
    if (key === "v") return "paste-style";
  }
  if (
    !event.metaKey
    && !event.ctrlKey
    && !event.altKey
    && !event.shiftKey
    && (event.key === "Delete" || event.key === "Backspace")
  ) return "delete";
  return null;
}

export function shouldHandleConnectionEscape(event: KeyboardEvent, modeActive: boolean): boolean {
  return modeActive
    && event.key === "Escape"
    && !event.repeat
    && !isConnectionShortcutEditingTarget(event.target);
}

export type ConnectionStyleEnterTargetKind =
  | "surface"
  | "number-input"
  | "range-input"
  | "single-line-input"
  | "button"
  | "option"
  | "multiline"
  | "contenteditable"
  | "native-control";

type ClosestTarget = EventTarget & {
  closest?: (selector: string) => Element | null;
  isContentEditable?: boolean;
};

/** Classify local Style Panel key ownership without installing a global Enter
 * shortcut. Descendants such as SVGs still resolve through their native
 * button/menu ancestor. */
export const connectionStyleEnterTargetKind = (
  target: EventTarget | null,
): ConnectionStyleEnterTargetKind => {
  const element = target as ClosestTarget | null;
  if (!element) return "surface";
  if (element.isContentEditable || element.closest?.("[contenteditable]:not([contenteditable='false'])")) {
    return "contenteditable";
  }
  if (element.closest?.("textarea, [role='textbox'][aria-multiline='true']")) return "multiline";
  if (element.closest?.("[role='option'], [role='menuitem'], [role='menuitemradio'], option")) return "option";
  if (element.closest?.("button, [role='button']")) return "button";

  const input = element.closest?.("input") as HTMLInputElement | null | undefined;
  if (input) {
    if (input.type === "number") return "number-input";
    if (input.type === "range") return "range-input";
    if (["text", "search", "color", "email", "url", "tel"].includes(input.type)) return "single-line-input";
    return "native-control";
  }
  if (element.closest?.("select, [role='combobox'], [aria-haspopup='listbox'], [aria-haspopup='menu']")) {
    return "native-control";
  }
  if (element.closest?.("[role='textbox']")) return "single-line-input";
  return "surface";
};

export interface ConnectionStyleEnterInput {
  key: string;
  defaultPrevented?: boolean;
  isComposing?: boolean;
  repeat?: boolean;
  openMenu?: boolean;
  targetKind: ConnectionStyleEnterTargetKind;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

/** Pure policy for the active universal Style Panel. Native/menu/editor
 * owners win; eligible panel surfaces and single-line numeric/style inputs
 * share the existing Apply command exactly once. */
export const resolveConnectionStyleEnterAction = (
  input: ConnectionStyleEnterInput,
): "apply" | "preserve" => {
  if (
    input.key !== "Enter"
    || input.defaultPrevented
    || input.isComposing
    || input.repeat
    || input.openMenu
    || input.altKey
    || input.ctrlKey
    || input.metaKey
    || input.shiftKey
  ) return "preserve";
  return input.targetKind === "surface"
    || input.targetKind === "number-input"
    || input.targetKind === "range-input"
    || input.targetKind === "single-line-input"
    ? "apply"
    : "preserve";
};
