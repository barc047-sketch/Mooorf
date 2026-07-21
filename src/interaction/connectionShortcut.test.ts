import { strict as assert } from "node:assert";
import test from "node:test";
import {
  isConnectionShortcutKey,
  shouldHandleConnectionEscape,
  shouldHandleConnectionShortcut,
} from "./connectionShortcut";

const event = (patch: Partial<KeyboardEvent> = {}) => ({
  key: "c",
  repeat: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  target: null,
  ...patch,
}) as KeyboardEvent;

test("Connection shortcut owns unmodified C/c only on Canvas", () => {
  assert.equal(isConnectionShortcutKey(event()), true);
  assert.equal(isConnectionShortcutKey(event({ key: "C" })), true);
  assert.equal(isConnectionShortcutKey(event({ key: "C", shiftKey: true })), true);
  assert.equal(shouldHandleConnectionShortcut(event(), "canvas"), true);
  assert.equal(shouldHandleConnectionShortcut(event({ key: "C" }), "canvas"), true);
  assert.equal(shouldHandleConnectionShortcut(event(), "table"), false);
  assert.equal(isConnectionShortcutKey(event({ repeat: true })), false);
  assert.equal(isConnectionShortcutKey(event({ ctrlKey: true })), false);
  assert.equal(isConnectionShortcutKey(event({ metaKey: true })), false);
  assert.equal(isConnectionShortcutKey(event({ altKey: true })), false);
});

test("Connection Escape policy is mode-scoped and ignores editing targets", () => {
  assert.equal(shouldHandleConnectionEscape(event({ key: "Escape" }), true), true);
  assert.equal(shouldHandleConnectionEscape(event({ key: "Escape" }), false), false);
  assert.equal(shouldHandleConnectionEscape(event({ key: "c" }), true), false);
});

test("Connection shortcut source declares every protected editing surface", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("./connectionShortcut.ts", import.meta.url), "utf8");
  for (const token of [
    "input",
    "textarea",
    "select",
    "[type='search']",
    "[role='searchbox']",
    "contenteditable",
    "[data-connection-shortcut='ignore']",
    "[data-text-editor]",
    ".inline-cell-editor",
    "[role='dialog']",
  ]) {
    assert.ok(source.includes(token), `editing guard should include ${token}`);
  }
});

test("Connection selection shortcuts resolve platform Copy, Paste, and Delete only with a selected Connection", async () => {
  const shortcuts = await import("./connectionShortcut") as Record<string, unknown>;
  assert.equal(typeof shortcuts.resolveConnectionSelectionShortcut, "function");
  const resolve = shortcuts.resolveConnectionSelectionShortcut as (
    event: KeyboardEvent,
    view: "canvas" | "table",
    selectedConnectionCount: number,
  ) => "copy-style" | "paste-style" | "delete" | null;

  assert.equal(resolve(event({ key: "c", metaKey: true }), "canvas", 1), "copy-style");
  assert.equal(resolve(event({ key: "C", ctrlKey: true }), "canvas", 1), "copy-style");
  assert.equal(resolve(event({ key: "v", metaKey: true }), "canvas", 3), "paste-style");
  assert.equal(resolve(event({ key: "V", ctrlKey: true }), "canvas", 2), "paste-style");
  assert.equal(resolve(event({ key: "Delete" }), "canvas", 1), "delete");
  assert.equal(resolve(event({ key: "Backspace" }), "canvas", 3), "delete");
  assert.equal(resolve(event({ key: "Delete" }), "canvas", 0), null);
  assert.equal(resolve(event({ key: "c", metaKey: true }), "table", 1), null);
  assert.equal(resolve(event({ key: "c", metaKey: true, shiftKey: true }), "canvas", 1), null);
});

test("Connection selection shortcuts preserve native editing-surface Copy, Paste, and Delete", async () => {
  const shortcuts = await import("./connectionShortcut") as Record<string, unknown>;
  assert.equal(typeof shortcuts.resolveConnectionSelectionShortcut, "function");
  const resolve = shortcuts.resolveConnectionSelectionShortcut as (
    event: KeyboardEvent,
    view: "canvas" | "table",
    selectedConnectionCount: number,
  ) => "copy-style" | "paste-style" | "delete" | null;

  class EditableElement {
    parentElement: EditableElement | null = null;
    isContentEditable = false;
    closest() { return this; }
  }
  const previousElement = globalThis.Element;
  const previousHtmlElement = globalThis.HTMLElement;
  Object.defineProperty(globalThis, "Element", { configurable: true, value: EditableElement });
  Object.defineProperty(globalThis, "HTMLElement", { configurable: true, value: EditableElement });
  try {
    const target = new EditableElement() as unknown as EventTarget;
    assert.equal(resolve(event({ key: "c", metaKey: true, target }), "canvas", 1), null);
    assert.equal(resolve(event({ key: "v", ctrlKey: true, target }), "canvas", 1), null);
    assert.equal(resolve(event({ key: "Delete", target }), "canvas", 1), null);
    assert.equal(resolve(event({ key: "Backspace", target }), "canvas", 1), null);
  } finally {
    Object.defineProperty(globalThis, "Element", { configurable: true, value: previousElement });
    Object.defineProperty(globalThis, "HTMLElement", { configurable: true, value: previousHtmlElement });
  }
});
