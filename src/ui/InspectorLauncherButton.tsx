/* Shared Owner-facing Inspector command for Dock and Rail. */
import type { KeyboardEvent } from "react";
import { Info } from "lucide-react";
import { useLab } from "../state/store";
import { activateInspector } from "../interaction/inspectorShortcut";

interface InspectorLauncherButtonProps {
  surface: "dock" | "rail";
}

/** One rendered application command shared by the real Dock and Rail paths. */
export default function InspectorLauncherButton({ surface }: InspectorLauncherButtonProps) {
  const expanded = useLab((state) =>
    state.openWidgets.includes("inspector") && !state.minimizedWidgets.includes("inspector")
  );
  const focused = useLab((state) =>
    !state.minimizedWidgets.includes("inspector")
      && state.openWidgets[state.openWidgets.length - 1] === "inspector"
  );
  const activate = () => activateInspector("open");
  const activateFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
  };

  return (
    <button
      type="button"
      className={surface === "dock" ? "dock-btn" : "rail-btn"}
      data-command="open-inspector"
      data-active={expanded ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      data-tooltip={surface === "rail" ? "Inspector (I)" : undefined}
      title="Inspector (I)"
      aria-label="Open Inspector"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={activate}
      onKeyDown={activateFromKeyboard}
    >
      <Info size={surface === "dock" ? 16 : 14} strokeWidth={1.5} />
    </button>
  );
}
