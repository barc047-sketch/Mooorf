import { useLab } from "../../state/store";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};

useLab.setState({ openWidgets: [] });
useLab.getState().openWidget("palette");
useLab.getState().openWidget("export");
useLab.getState().openWidget("palette");
equal(useLab.getState().openWidgets.join(","), "export,palette", "reselect focuses without duplicating widget id");
equal(new Set(useLab.getState().openWidgets).size, 2, "stable widget ids remain unique");
useLab.getState().focusWidget("palette");
equal(useLab.getState().openWidgets.join(","), "export,palette", "focusing front widget is a no-op");

console.info("widget lifecycle contracts passed");
