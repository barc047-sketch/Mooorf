import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as selection from "./selection";

type Matchable = { matches: (selector: string) => boolean };

const matching = (...selectors: string[]): Matchable => ({
  matches: (selector) => selectors.includes(selector),
});

test("radial pointer dismissal retains only actual action buttons", () => {
  assert.equal(typeof selection.shouldCloseContextFromPointer, "function");
  const shouldCloseContextFromPointer = selection.shouldCloseContextFromPointer!;
  assert.equal(shouldCloseContextFromPointer(null, []), false);
  assert.equal(shouldCloseContextFromPointer("object-radial", []), true);
  assert.equal(
    shouldCloseContextFromPointer(
      "object-radial",
      [matching('[data-context-surface="object-radial"]')],
    ),
    true,
    "the full-screen radial wrapper is outside interactive content",
  );
  assert.equal(
    shouldCloseContextFromPointer("object-radial", [matching(".object-radial-action")]),
    false,
    "an action button remains active until its click executes",
  );
});

test("blank menu and inline editor retain their existing pointer ownership", () => {
  assert.equal(typeof selection.shouldCloseContextFromPointer, "function");
  const shouldCloseContextFromPointer = selection.shouldCloseContextFromPointer!;
  assert.equal(
    shouldCloseContextFromPointer("blank-menu", [matching('[data-context-surface="blank-menu"]')]),
    false,
  );
  assert.equal(shouldCloseContextFromPointer("blank-menu", []), true);
  assert.equal(
    shouldCloseContextFromPointer("inline-editor", []),
    false,
    "inline editor keeps its own outside-click commit lifecycle",
  );
});

test("selection changes close only a stale object radial", () => {
  assert.equal(typeof selection.shouldCloseRadialFromSelection, "function");
  const shouldCloseRadialFromSelection = selection.shouldCloseRadialFromSelection!;
  assert.equal(shouldCloseRadialFromSelection("object-radial", "space-a", ["space-a"]), false);
  assert.equal(shouldCloseRadialFromSelection("object-radial", "space-a", ["space-b"]), true);
  assert.equal(shouldCloseRadialFromSelection("object-radial", "space-a", []), true);
  assert.equal(shouldCloseRadialFromSelection("inline-editor", "space-a", []), false);
});

test("enabled radial buttons keep native Enter and Space activation", () => {
  assert.equal(typeof selection.isEnabledRadialActionActivation, "function");
  const isEnabledRadialActionActivation = selection.isEnabledRadialActionActivation!;
  assert.equal(isEnabledRadialActionActivation("object-radial", "Enter", true), true);
  assert.equal(isEnabledRadialActionActivation("object-radial", " ", true), true);
  assert.equal(isEnabledRadialActionActivation("object-radial", "Enter", false), false);
  assert.equal(isEnabledRadialActionActivation("blank-menu", "Enter", true), false);
});

test("one root host owns composed-path dismissal without radial autofocus", () => {
  const host = readFileSync(new URL("../ui/context/ContextSurfaceHost.tsx", import.meta.url), "utf8");
  const radial = readFileSync(new URL("../canvas/SelectedCellCommandMenu.tsx", import.meta.url), "utf8");
  assert.match(host, /event\.composedPath\(\)/);
  assert.match(host, /shouldCloseContextFromPointer/);
  assert.doesNotMatch(radial, /firstActionRef|requestAnimationFrame/);
  assert.doesNotMatch(radial, /data-context-surface="object-radial"/);
});
