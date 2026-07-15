import { useLab } from "../state/store";

const INSPECTOR_SELECTOR = '[data-widget="inspector"]';
const EDITABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='textbox']",
  "[role='combobox']",
  "[role='spinbutton']",
  "[data-text-editor]",
  ".inline-cell-editor",
].join(",");

export type InspectorActivationMode = "open" | "toggle";

export interface InspectorActivationState {
  open: boolean;
  minimized: boolean;
  frontmost: boolean;
  fullyVisible: boolean;
}

export type InspectorActivationAction = "open" | "close";

/** Pure policy shared by the shortcut command and executable contract tests. */
export function resolveInspectorActivation(
  mode: InspectorActivationMode,
  state: InspectorActivationState
): InspectorActivationAction {
  if (mode === "toggle" && state.open && !state.minimized && state.frontmost && state.fullyVisible) {
    return "close";
  }
  return "open";
}

export function isInspectorShortcutKey(
  event: Pick<KeyboardEvent, "key" | "repeat" | "ctrlKey" | "metaKey" | "altKey">
): boolean {
  return event.key.toLowerCase() === "i"
    && !event.repeat
    && !event.ctrlKey
    && !event.metaKey
    && !event.altKey;
}

/** Editing surfaces own printable I/i before the application shortcut layer. */
export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  const element = target instanceof Element ? target : null;
  if (!element) return false;
  const htmlElement = element instanceof HTMLElement ? element : element.parentElement;
  return Boolean(htmlElement?.isContentEditable || element.closest(EDITABLE_SELECTOR));
}

export function shouldHandleInspectorShortcut(event: KeyboardEvent): boolean {
  return isInspectorShortcutKey(event) && !isEditableShortcutTarget(event.target);
}

const inspectorIsFullyVisible = (): boolean => {
  const frames = [...document.querySelectorAll<HTMLElement>(INSPECTOR_SELECTOR)];
  if (frames.length !== 1) return false;
  const frame = frames[0];
  const body = frame.querySelector<HTMLElement>(".wframe-body");
  if (!body || frame.dataset.min === "true" || frame.dataset.depth !== "front") return false;
  const rect = frame.getBoundingClientRect();
  const bodyRect = body.getBoundingClientRect();
  const bodyStyle = getComputedStyle(body);
  return bodyStyle.display !== "none"
    && bodyStyle.visibility !== "hidden"
    && bodyRect.height > 0
    && rect.left >= -0.5
    && rect.top >= -0.5
    && rect.right <= window.innerWidth + 0.5
    && rect.bottom <= window.innerHeight + 0.5;
};

/**
 * The single Owner-facing Inspector command. Every mutation stays inside the
 * existing widget lifecycle; rendered geometry is read only to decide whether
 * toggle means close or reveal.
 */
export function activateInspector(mode: InspectorActivationMode): void {
  const state = useLab.getState();
  const open = state.openWidgets.includes("inspector");
  const action = resolveInspectorActivation(mode, {
    open,
    minimized: state.minimizedWidgets.includes("inspector"),
    frontmost: open && state.openWidgets[state.openWidgets.length - 1] === "inspector",
    fullyVisible: open && inspectorIsFullyVisible(),
  });
  if (action === "close") state.closeWidget("inspector");
  else state.openWidget("inspector");
}
