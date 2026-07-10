/* V7.1 orchestration entry point — Project Pulse remains the single rail
   destination; this compact header popover opens the independent analytical
   instruments through the existing WidgetHost/store lifecycle. */

import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLab } from "../../../state/store";
import type { WidgetId } from "../../../types";

const INSTRUMENTS: readonly { id: WidgetId; label: string; detail: string }[] = [
  { id: "category-mix", label: "Category Mix", detail: "Program distribution" },
  { id: "privacy-balance", label: "Privacy Balance", detail: "Public to private" },
  { id: "area-leaders", label: "Area Leaders", detail: "Largest spaces" },
  { id: "data-health", label: "Data Health", detail: "Completeness signals" },
];

export default function InstrumentLauncher() {
  const openWidget = useLab((state) => state.openWidget);
  const openWidgets = useLab((state) => state.openWidgets);

  return (
    <Popover>
      <PopoverTrigger className="instrument-trigger" aria-label="Open spatial intelligence instruments">
        Instruments <ChevronDown size={9} strokeWidth={1.6} />
      </PopoverTrigger>
      <PopoverContent className="instrument-menu glass" align="end" side="bottom" sideOffset={7}>
        <span className="instrument-menu-label">Spatial intelligence</span>
        <div className="instrument-menu-list">
          {INSTRUMENTS.map((instrument) => {
            const active = openWidgets.includes(instrument.id);
            return (
              <button
                key={instrument.id}
                type="button"
                className="instrument-menu-row"
                data-active={active ? "true" : undefined}
                onClick={() => openWidget(instrument.id)}
              >
                <span>{instrument.label}</span>
                <i>{active ? "Open" : instrument.detail}</i>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
