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
