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

export function shouldHandleConnectionEscape(event: KeyboardEvent, modeActive: boolean): boolean {
  return modeActive
    && event.key === "Escape"
    && !event.repeat
    && !isConnectionShortcutEditingTarget(event.target);
}
