import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const organismSource = readFileSync(new URL("../canvas/OrganismCanvasView.tsx", import.meta.url), "utf8");
const tableSource = readFileSync(new URL("../views/TableView.tsx", import.meta.url), "utf8");

const occursBefore = (source: string, first: string, second: string) => {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert.notEqual(firstIndex, -1, `missing ${first}`);
  assert.notEqual(secondIndex, -1, `missing ${second}`);
  assert.ok(firstIndex < secondIndex, `${first} must occur before ${second}`);
};

test("App owns Organism activity, readiness generation, and one fallback", () => {
  assert.match(appSource, /const \[resumePending, setResumePending\] = useState\(false\)/);
  assert.match(appSource, /const resumeGenerationRef = useRef\(0\)/);
  assert.match(appSource, /const resumeTimeoutRef = useRef<[^>]+>\(null\)/);
  assert.match(
    appSource,
    /<OrganismCanvasView\s+active=\{!tableActive\}\s+onResumeReady=\{handleOrganismResumeReady\}/,
  );
  assert.equal(appSource.match(/\bsetTimeout\s*\(/g)?.length, 1);
  assert.match(appSource, /window\.setTimeout\([\s\S]*?,\s*400\)/);
  assert.match(appSource, /import\.meta\.env\.DEV[\s\S]*console\.warn/);
});

test("Table activation invalidates pending resume and stale readiness is ignored", () => {
  assert.match(appSource, /const generation = \+\+resumeGenerationRef\.current/);
  assert.match(
    appSource,
    /if \(tableActive \|\| rendererMode !== "organism"\) \{[\s\S]*?setResumePending\(false\);[\s\S]*?return;/,
  );
  assert.match(
    appSource,
    /if \(resumeGenerationRef\.current !== resumeGeneration\) return;/,
  );
  assert.match(appSource, /window\.clearTimeout\(resumeTimeoutRef\.current\)/);
  assert.match(appSource, /return \(\) => \{[\s\S]*?\+\+resumeGenerationRef\.current/);
  assert.match(appSource, /\{\(tableActive \|\| resumePending\) && \(/);
});

test("Organism pauses existing runtime ownership and owns no timeout", () => {
  assert.doesNotMatch(organismSource, /\bsetTimeout\s*\(/);
  assert.match(organismSource, /renderLoop\?\.setPaused\(true\)/);
  assert.match(organismSource, /moveScheduler\.cancel\(\)/);
  assert.match(organismSource, /wheelScheduler\.cancel\(\)/);
  assert.match(organismSource, /renderLoop\?\.setPaused\(false\)/);
  assert.match(organismSource, /active: boolean/);
  assert.match(organismSource, /onResumeReady\?: \(\) => void/);
});

test("inactive store, theme, and resize events only retain latest work", () => {
  assert.match(
    organismSource,
    /if \(!runtimeActive\) \{\s*pendingStoreState = s;\s*return;\s*\}/,
  );
  assert.match(
    organismSource,
    /if \(!runtimeActive\) \{\s*pendingTheme = readTheme\(\);\s*return;\s*\}/,
  );
  assert.match(
    organismSource,
    /if \(!runtimeActive\) \{\s*pendingDimensions = dimensions;\s*w = dimensions\.width;\s*h = dimensions\.height;\s*return;\s*\}/,
  );
});

test("resume prepares current state and theme before successful readiness", () => {
  occursBefore(organismSource, "applyStoreSnapshot(latestState, true)", "theme = pendingTheme ?? readTheme()");
  assert.match(organismSource, /if \(\(qualityChanged \|\| detailChanged\) && !forceFull\) resize\(\)/);
  assert.match(organismSource, /applyPerformanceSnapshot\(latestPerformanceSnapshot, true\)/);
  assert.match(
    organismSource,
    /if \(\(qualityChanged \|\| previewScaleChanged\) && !deferResize\) resizeTarget\(\)/,
  );
  occursBefore(organismSource, "theme = pendingTheme ?? readTheme()", "applyDimensions(latestDimensions)");
  occursBefore(organismSource, "smooth = null", "renderLoop?.setPaused(false)");
  occursBefore(organismSource, "drawPresentationOverlay(nuclei, presentationPixelRatio)", "onResumeReadyRef.current?.()");
  occursBefore(organismSource, "onResumeReadyRef.current?.()", "return !rendererFailed");
  assert.match(organismSource, /if \(resumePreparationPending\) \{[\s\S]*?onResumeReadyRef\.current\?\.\(\)/);
});

test("PF1D.2 activity props execute only on Organism, not Classic", () => {
  assert.match(
    appSource,
    /if \(tableActive \|\| rendererMode !== "organism"\) \{[\s\S]*?setResumePending\(false\);[\s\S]*?return;/,
  );
  assert.match(
    appSource,
    /rendererMode === "organism"\s*\?\s*\(\s*<OrganismCanvasView[\s\S]*?\)\s*:\s*<CanvasView\s*\/>/,
  );
  assert.doesNotMatch(appSource, /<CanvasView[^>]+active=/);
  assert.doesNotMatch(appSource, /<CanvasView[^>]+onResumeReady=/);
});

test("Table owns distinct shell-ready and rows-ready stages after the shell paints", () => {
  assert.match(appSource, /<Suspense fallback=\{<TableWorkspaceSkeleton \/>\}>[\s\S]*?<TableView \/>/);
  assert.match(tableSource, /const \[rowsReady, setRowsReady\] = useState\(false\)/);
  assert.match(tableSource, /data-table-stage=\{rowsReady \? "rows" : "shell"\}/);
  assert.match(
    tableSource,
    /requestAnimationFrame\(\(\) => \{[\s\S]*?requestAnimationFrame\(\(\) => \{[\s\S]*?setRowsReady\(true\)/,
  );
  assert.match(
    tableSource,
    /rowsReady\s*\?\s*<VirtualizedTableBody[\s\S]*?:\s*<TableRowsSkeleton\s*\/>/,
  );
  assert.doesNotMatch(tableSource, /\bsetTimeout\s*\(/);
});

test("Table cancels shell activation frames and creates no duplicate timer path", () => {
  assert.match(tableSource, /return \(\) => \{[\s\S]*?cancelAnimationFrame\(shellFrame\)/);
  assert.match(tableSource, /if \(rowsFrame !== null\) cancelAnimationFrame\(rowsFrame\)/);
  assert.equal(tableSource.match(/\brequestAnimationFrame\s*\(/g)?.length, 2);
  assert.equal(tableSource.match(/\buseEffect\s*\(\(\) => \{[\s\S]*?setRowsReady\(true\)/g)?.length, 1);
});

test("Table renders only a sliced editable row window with preserved canonical actions", () => {
  assert.doesNotMatch(tableSource, /spaces\.map\s*\(/);
  assert.match(
    tableSource,
    /spaces\.slice\(virtualWindow\.startIndex,\s*virtualWindow\.endIndex\)/,
  );
  assert.match(tableSource, /visibleSpaces\.map\(\(cell,\s*visibleIndex\)/);
  assert.match(tableSource, /index=\{virtualWindow\.startIndex \+ visibleIndex\}/);
  assert.match(tableSource, /data-table-spacer="top"/);
  assert.match(tableSource, /data-table-spacer="bottom"/);
  assert.match(tableSource, /useLab\(\(s\) => s\.commitSpaceEdit\)/);
  assert.match(tableSource, /useLab\(\(s\) => s\.updateSpace\)/);
  assert.match(tableSource, /useLab\(\(s\) => s\.removeSpace\)/);
});

test("Reduced motion cannot bypass the instant Table shell", () => {
  assert.doesNotMatch(tableSource, /useReducedMotion|prefers-reduced-motion/);
  assert.match(tableSource, /data-table-stage=\{rowsReady \? "rows" : "shell"\}/);
  assert.match(tableSource, /rowsReady[\s\S]*?<VirtualizedTableBody[\s\S]*?<TableRowsSkeleton\s*\/>/);
});
