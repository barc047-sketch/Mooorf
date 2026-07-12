import type { WidgetId } from "../../types";

export interface WidgetOpenResolution {
  stack: WidgetId[];
  mounted: boolean;
}

export const resolveWidgetOpen = (stack: readonly WidgetId[], id: WidgetId): WidgetOpenResolution => {
  const mounted = !stack.includes(id);
  return {
    stack: mounted ? [...stack, id] : [...stack.filter((candidate) => candidate !== id), id],
    mounted,
  };
};

