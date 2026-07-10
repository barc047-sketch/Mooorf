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
import ProjectPulseWidget from "./stats/ProjectPulseWidget";

interface WidgetDef {
  eyebrow: string;
  title: string;
  width?: number;
  body: () => React.ReactNode;
}

const WIDGET_DEFS: Record<WidgetId, WidgetDef> = {
  annotation: { eyebrow: "CANVAS", title: "Annotation", body: () => <AnnotationWidget /> },
  organism: { eyebrow: "RENDER", title: "Organism", width: 292, body: () => <OrganismWidget /> },
  layout: { eyebrow: "ARRANGE", title: "Layout", body: () => <LayoutWidget /> },
  palette: { eyebrow: "COLOR", title: "Palette", width: 304, body: () => <PaletteWidget /> },
  saved: { eyebrow: "ITERATIONS", title: "Saved Views", width: 300, body: () => <SavedViewsWidget /> },
  display: { eyebrow: "VIEW", title: "Display", body: () => <DisplayWidget /> },
  advanced: { eyebrow: "SYSTEM", title: "Advanced", body: () => <AdvancedWidget /> },
  stats: { eyebrow: "INTELLIGENCE", title: "Project Pulse", width: 300, body: () => <ProjectPulseWidget /> },
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
        const def = WIDGET_DEFS[id];
        return (
          <WidgetFrame
            key={id}
            id={id}
            eyebrow={def.eyebrow}
            title={def.title}
            width={def.width}
            index={slots.current.get(id) ?? 0}
            z={z}
            focused={z === openWidgets.length - 1}
          >
            {def.body()}
          </WidgetFrame>
        );
      })}
    </AnimatePresence>
  );
}
