import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };

const app = source("../App.tsx");
const host = source("../ui/context/ContextSurfaceHost.tsx");
const radial = source("../canvas/SelectedCellCommandMenu.tsx");
const radialCss = source("../ui/context/contextSurfaces.css");
const classic = source("../canvas/CanvasView.tsx");
const organism = source("../canvas/OrganismCanvasView.tsx");

ok(app.includes("<ContextSurfaceHost"), "App mounts one root context-surface host");
ok(host.includes("DropdownMenu"), "blank context uses the existing Base UI dropdown primitive");
ok(host.includes("getContextActions"), "host derives menu presentation from the canonical registry");
ok(host.includes("executeContextCommand"), "host delegates product commands to the command layer");
ok(host.includes("InlineCellEditor"), "root host opens the existing shared inline editor");
ok(host.includes("shouldCloseRadialFromEnter"), "the root host owns plain-Enter radial dismissal without a second listener");
ok(host.includes("selectedIds.includes(contextTargetId)"), "selection replacement cannot leave a radial menu floating");
ok(host.includes("closeContextSurface"), "enabled radial actions and outside interactions resolve through the host close action");
ok(radial.includes("layoutRadialActions"), "object menu uses the adaptive radial layout helper");
ok(!radial.includes("selection-command-core"), "object radial has no centre object");
ok(radial.includes("data-empty-centre=\"true\""), "object radial explicitly preserves an empty centre");
ok(radialCss.includes("background: transparent"), "radial host has no background disc or ring");
ok(classic.includes("onContextMenu"), "Classic owns renderer-specific context hit testing");
ok(organism.includes("onContextMenu"), "Organism owns renderer-specific context hit testing");
ok(classic.includes("resolveSelectionIntent"), "Classic uses the shared modifier selection contract");
ok(organism.includes("resolveSelectionIntent"), "Organism uses the shared modifier selection contract");
ok(!classic.includes("useState<{ id: string; position: InlineEditorPosition }"), "Classic no longer duplicates editor host state");
ok(!organism.includes("useState<{ id: string; position: InlineEditorPosition }"), "Organism no longer duplicates editor host state");

console.info("V8.2A context host contracts passed");
