/* V6K — renders every open floating widget. Store `openWidgets` order is the
   stacking order (last = front); cascade slots are assigned on first open so
   widgets don't jump when refocused. Escape closes the front widget. */

import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { useLab } from "../../state/store";
import type { WidgetId } from "../../types";
import WidgetFrame from "./WidgetFrame";
import AnnotationWidget from "./AnnotationWidget";
import OrganismWidget from "./OrganismWidget";
import LayoutWidget from "./LayoutWidget";
import PaletteWidget from "./PaletteWidget";
import SavedViewsWidget from "./SavedViewsWidget";
import DisplayWidget from "./DisplayWidget";
import AdvancedWidget from "./AdvancedWidget";
import ExportWidget from "./ExportWidget";
import FileIntakeWidget from "./FileIntakeWidget";
import ProjectPulseWidget from "./stats/ProjectPulseWidget";
import CategoryMixWidget from "./stats/CategoryMixWidget";
import PrivacyBalanceWidget from "./stats/PrivacyBalanceWidget";
import AreaLeadersWidget from "./stats/AreaLeadersWidget";
import DataHealthWidget from "./stats/DataHealthWidget";
import InstrumentLauncher from "./stats/InstrumentLauncher";
import { getWidgetDefinition } from "../panels/widgetRegistry";

const WIDGET_BODIES: Record<WidgetId, () => React.ReactNode> = {
  annotation: () => <AnnotationWidget />,
  organism: () => <OrganismWidget />,
  layout: () => <LayoutWidget />,
  palette: () => <PaletteWidget />,
  saved: () => <SavedViewsWidget />,
  display: () => <DisplayWidget />,
  advanced: () => <AdvancedWidget />,
  stats: () => <ProjectPulseWidget />,
  "category-mix": () => <CategoryMixWidget />,
  "privacy-balance": () => <PrivacyBalanceWidget />,
  "area-leaders": () => <AreaLeadersWidget />,
  "data-health": () => <DataHealthWidget />,
  export: () => <ExportWidget />,
  import: () => <FileIntakeWidget />,
};

export default function WidgetHost() {
  const openWidgets = useLab((s) => s.openWidgets);
  const closeWidget = useLab((s) => s.closeWidget);
  const slots = useRef(new Map<WidgetId, number>());

  /* assign the smallest free cascade slot on first open, release on close */
  for (const id of openWidgets) {
    if (!slots.current.has(id)) {
      const used = new Set(slots.current.values());
      let slot = 0;
      while (used.has(slot)) slot += 1;
      slots.current.set(id, slot);
    }
  }
  for (const id of [...slots.current.keys()]) {
    if (!openWidgets.includes(id)) slots.current.delete(id);
  }

  useEffect(() => {
    if (openWidgets.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const stack = useLab.getState().openWidgets;
      const top = stack[stack.length - 1];
      if (top) closeWidget(top);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openWidgets.length, closeWidget]);

  return (
    <AnimatePresence>
      {openWidgets.map((id, z) => {
        const definition = getWidgetDefinition(id);
        const Body = WIDGET_BODIES[id];
        return (
          <WidgetFrame
            key={id}
            id={id}
            title={definition.label}
            icon={definition.icon}
            geometry={definition.geometry}
            index={slots.current.get(id) ?? 0}
            z={z}
            focused={z === openWidgets.length - 1}
            headerExtra={id === "stats" ? <InstrumentLauncher /> : undefined}
          >
            <Body />
          </WidgetFrame>
        );
      })}
    </AnimatePresence>
  );
}
