import { strict as assert } from "node:assert";
import {
  isInspectorShortcutKey,
  resolveInspectorActivation,
  type InspectorActivationState,
} from "./inspectorShortcut";

const state = (patch: Partial<InspectorActivationState>): InspectorActivationState => ({
  open: false,
  minimized: false,
  frontmost: false,
  fullyVisible: false,
  ...patch,
});

assert.equal(resolveInspectorActivation("toggle", state({})), "open", "closed Inspector opens");
assert.equal(resolveInspectorActivation("toggle", state({ open: true, minimized: true })), "open", "minimized Inspector expands");
assert.equal(resolveInspectorActivation("toggle", state({ open: true, fullyVisible: true })), "open", "background Inspector focuses");
assert.equal(resolveInspectorActivation("toggle", state({ open: true, frontmost: true })), "open", "off-screen Inspector reveals");
assert.equal(
  resolveInspectorActivation("toggle", state({ open: true, frontmost: true, fullyVisible: true })),
  "close",
  "only a fully visible frontmost Inspector closes"
);
assert.equal(
  resolveInspectorActivation("open", state({ open: true, frontmost: true, fullyVisible: true })),
  "open",
  "Dock and Rail launchers never toggle a visible Inspector closed"
);

const key = (patch: Partial<KeyboardEvent>) => ({
  key: "i",
  repeat: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...patch,
}) as KeyboardEvent;

assert.equal(isInspectorShortcutKey(key({})), true, "lowercase i is assigned");
assert.equal(isInspectorShortcutKey(key({ key: "I" })), true, "uppercase I is assigned");
assert.equal(isInspectorShortcutKey(key({ repeat: true })), false, "repeated keydown is ignored");
assert.equal(isInspectorShortcutKey(key({ ctrlKey: true })), false, "Ctrl+I is ignored");
assert.equal(isInspectorShortcutKey(key({ metaKey: true })), false, "Meta+I is ignored");
assert.equal(isInspectorShortcutKey(key({ altKey: true })), false, "Alt+I is ignored");

console.info("Inspector shortcut policy contracts passed");
