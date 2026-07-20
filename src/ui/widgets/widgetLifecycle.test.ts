import { useLab } from "../../state/store";
import * as lifecycle from "./widgetLifecycle";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};

type LifecycleStore = ReturnType<typeof useLab.getState> & {
  minimizedWidgets?: string[];
  widgetLaunchRevisions?: Partial<Record<string, number>>;
  setWidgetMinimized?: (id: "palette" | "export" | "inspector", minimized: boolean) => void;
};

useLab.setState({
  openWidgets: [],
  minimizedWidgets: [],
  widgetLaunchRevisions: {},
} as never);
useLab.getState().openWidget("palette");
useLab.getState().openWidget("export");
useLab.getState().openWidget("palette");
equal(useLab.getState().openWidgets.join(","), "export,palette", "reselect focuses without duplicating widget id");
equal(new Set(useLab.getState().openWidgets).size, 2, "stable widget ids remain unique");

useLab.getState().focusWidget("palette");
equal(useLab.getState().openWidgets.join(","), "export,palette", "focusing front widget is a no-op");

useLab.getState().openWidget("label-studio");
equal(useLab.getState().openWidgets.includes("label-studio"), true, "Label Studio uses the canonical widget lifecycle");
useLab.getState().openWidget("label-studio");
equal(
  useLab.getState().openWidgets.filter((id) => id === "label-studio").length,
  1,
  "reopening Label Studio focuses its existing frame without duplication"
);

const lifecycleStore = useLab.getState() as LifecycleStore;
equal(typeof lifecycleStore.setWidgetMinimized, "function", "widget lifecycle exposes one generic minimize owner");

useLab.getState().closeWidget("inspector");
useLab.getState().openWidget("inspector");
equal(useLab.getState().openWidgets.includes("inspector"), true, "closed Inspector mounts from the canonical launcher action");
equal((useLab.getState() as LifecycleStore).minimizedWidgets?.includes("inspector"), false, "closed Inspector mounts with its full body expanded");

(useLab.getState() as LifecycleStore).setWidgetMinimized?.("inspector", true);
equal((useLab.getState() as LifecycleStore).minimizedWidgets?.includes("inspector"), true, "Inspector can enter the canonical minimized state");
const inspectorRevisionBefore = (useLab.getState() as LifecycleStore).widgetLaunchRevisions?.inspector ?? 0;
useLab.getState().openWidget("inspector");
const restoredInspector = useLab.getState() as LifecycleStore;
equal(restoredInspector.openWidgets[restoredInspector.openWidgets.length - 1], "inspector", "launching a minimized Inspector focuses it");
equal(restoredInspector.minimizedWidgets?.includes("inspector"), false, "one launcher click expands the Inspector body");
equal(
  restoredInspector.widgetLaunchRevisions?.inspector,
  inspectorRevisionBefore + 1,
  "every launcher click issues one reveal request"
);

useLab.getState().openWidget("export");
equal(useLab.getState().openWidgets[useLab.getState().openWidgets.length - 1], "export", "another widget can sit in front of Inspector");
useLab.getState().openWidget("inspector");
equal(useLab.getState().openWidgets[useLab.getState().openWidgets.length - 1], "inspector", "launching a background Inspector focuses it in one click");
equal(new Set(useLab.getState().openWidgets).size, useLab.getState().openWidgets.length, "focus launch never duplicates an existing frame");

(useLab.getState() as LifecycleStore).setWidgetMinimized?.("palette", true);
useLab.getState().openWidget("palette");
const restoredPalette = useLab.getState() as LifecycleStore;
equal(restoredPalette.openWidgets[restoredPalette.openWidgets.length - 1], "palette", "generic lifecycle also focuses a non-Inspector widget");
equal(restoredPalette.minimizedWidgets?.includes("palette"), false, "generic lifecycle expands a non-Inspector widget");

const clampWidgetOffset = (lifecycle as Record<string, unknown>).clampWidgetOffset as ((input: {
  x: number;
  y: number;
  frameWidth: number;
  frameHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  margin: number;
}) => { x: number; y: number }) | undefined;
equal(typeof clampWidgetOffset, "function", "widget lifecycle exposes deterministic viewport recovery");
const recovered = clampWidgetOffset?.({
  x: 5000,
  y: 5000,
  frameWidth: 360,
  frameHeight: 520,
  viewportWidth: 1280,
  viewportHeight: 800,
  margin: 12,
});
equal(recovered?.x, 908, "unreachable horizontal offset returns inside the viewport");
equal(recovered?.y, 268, "unreachable vertical offset returns inside the viewport");

console.info("widget lifecycle contracts passed");
