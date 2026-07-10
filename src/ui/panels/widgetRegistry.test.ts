import { WIDGET_DEFINITIONS, getWidgetDefinition } from "./widgetRegistry";

const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
  }
};

const v7 = ["stats", "category-mix", "privacy-balance", "area-leaders", "data-health"] as const;
for (const id of v7) {
  const definition = getWidgetDefinition(id);
  equal(definition, WIDGET_DEFINITIONS[id], `${id} uses canonical metadata`);
  ok(definition.icon, `${id} owns a canonical icon`);
  ok(definition.geometry.width >= definition.geometry.minWidth, `${id} width respects minimum`);
}

equal(WIDGET_DEFINITIONS.stats.geometry.variant, "large", "Project Pulse is flagship geometry");
equal(WIDGET_DEFINITIONS["category-mix"].geometry.variant, "rail-horizontal", "Category Mix is a horizontal rail");
equal(WIDGET_DEFINITIONS["privacy-balance"].geometry.variant, "horizontal", "Privacy Balance is horizontal");
equal(WIDGET_DEFINITIONS["area-leaders"].geometry.variant, "rail-vertical", "Area Leaders is a vertical rail");
equal(WIDGET_DEFINITIONS["data-health"].geometry.variant, "vertical", "Data Health is vertical");

ok(
  WIDGET_DEFINITIONS["category-mix"].geometry.width >
    (WIDGET_DEFINITIONS["category-mix"].geometry.minHeight ?? 0),
  "Category Mix is wider than tall"
);
ok(
  (WIDGET_DEFINITIONS["area-leaders"].geometry.minHeight ?? 0) >
    WIDGET_DEFINITIONS["area-leaders"].geometry.width,
  "Area Leaders is taller than wide"
);

console.info("widget registry geometry contracts passed");
