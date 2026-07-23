import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => readFileSync(path, "utf8");

test("Table stays the only lazy non-Canvas workspace", () => {
  const app = source("src/App.tsx");
  const table = source("src/views/TableView.tsx");
  const types = source("src/types.ts");
  const store = source("src/state/store.ts");

  assert.match(app, /const TableView = lazy\(\(\) => import\("\.\/views\/TableView"\)\)/);
  assert.doesNotMatch(app, /import TableView from "\.\/views\/TableView"/);
  assert.match(app, /import CanvasView from "\.\/canvas\/CanvasView"/);
  assert.match(app, /import OrganismCanvasView from "\.\/canvas\/OrganismCanvasView"/);
  assert.doesNotMatch(app, /<Suspense[^>]*fallback=\{<Loader/);
  assert.doesNotMatch(app, /react-router|BrowserRouter|createBrowserRouter|RouterProvider/);
  assert.match(table, /useLab/);
  assert.match(types, /ViewMode = "canvas" \| "table"/);
  assert.match(
    store,
    /setView: \(view\) => set\(\(s\) => view === "canvas"[\s\S]*?\? \{ view \}[\s\S]*?: \{[\s\S]*?view,[\s\S]*?\.\.\.closedContext,[\s\S]*?exitConnectionModePatch\(s\)[\s\S]*?cancelConnectionAuthoringPatch\(s\)/,
  );
});

test("Canvas and conditional Table overlay are direct app-shell layers", () => {
  const app = source("src/App.tsx");
  const shell = app.slice(app.indexOf('<div className="app-shell">'));

  assert.match(app, /const tableActive = view === "table"/);
  assert.match(
    shell,
    /<section[\s\S]*?className="canvas-workspace"[\s\S]*?<OrganismCanvasView[\s\S]*?active=\{!tableActive\}[\s\S]*?onResumeReady=\{handleOrganismResumeReady\}[\s\S]*?\/>[\s\S]*?: <CanvasView \/>[\s\S]*?<\/section>\s*<AnimatePresence>\s*\{\(tableActive \|\| resumePending\) && \([\s\S]*?className="table-workspace-overlay"[\s\S]*?className="table-workspace-scrim"[\s\S]*?<AnimatePresence>[\s\S]*?\{tableActive && \([\s\S]*?className="table-workspace-panel"[\s\S]*?<Suspense[\s\S]*?<TableView \/>[\s\S]*?<\/Suspense>[\s\S]*?\)\}/,
  );
  assert.doesNotMatch(shell, /<main className="stage">/);
  assert.doesNotMatch(app, /view === "canvas" \?[\s\S]*?<OrganismCanvasView/);
  assert.match(app, /className="canvas-workspace"[\s\S]*?aria-hidden=\{tableActive \|\| resumePending\}[\s\S]*?inert=\{tableActive \|\| resumePending\}/);
  assert.match(app, /className="table-workspace-overlay"[\s\S]*?aria-label="Space schedule workspace"/);
});

test("ViewToggle stays interactive while mounted Canvas chrome becomes inert", () => {
  const app = source("src/App.tsx");
  const viewToggleIndex = app.indexOf("<ViewToggle />");
  const firstChromeIndex = app.indexOf("canvas-chrome-layer--rail");

  assert.ok(viewToggleIndex >= 0, "ViewToggle remains mounted");
  assert.ok(firstChromeIndex >= 0, "Canvas chrome wrappers exist");
  assert.ok(viewToggleIndex < firstChromeIndex, "ViewToggle is outside the hidden chrome wrappers");
  assert.doesNotMatch(app, /<ViewToggle[^>]*(?:aria-hidden|inert)/);

  for (const className of ["rail", "dock", "widgets", "auxiliary"]) {
    assert.match(
      app,
      new RegExp(`canvas-chrome-layer--${className}[\\s\\S]*?aria-hidden=\\{tableActive\\}[\\s\\S]*?inert=\\{tableActive\\}`),
    );
  }

  for (const component of ["Rail", "Dock", "WidgetHost", "QuickToggleBar", "ZoomControls", "ContextSurfaceHost"]) {
    assert.equal((app.match(new RegExp(`<${component} \\/>`, "g")) ?? []).length, 1, `${component} stays mounted exactly once`);
  }
  assert.doesNotMatch(app, /tableActive[\s\S]{0,120}(?:closeWidget|minimizeWidget|reset)/);
});

test("Table owns a local accessible schedule skeleton instead of the global Loader", () => {
  const app = source("src/App.tsx");
  const skeleton = app.slice(
    app.indexOf("function TableWorkspaceSkeleton()"),
    app.indexOf("function MainApp()"),
  );

  assert.match(skeleton, /function TableWorkspaceSkeleton\(\)/);
  assert.match(app, /<Suspense fallback=\{<TableWorkspaceSkeleton \/>\}>/);
  assert.match(skeleton, /role="status"/);
  assert.match(skeleton, /aria-label="Loading space schedule"/);
  assert.match(skeleton, /className="table-skeleton__header"/);
  assert.match(skeleton, /Array\.from\(\{ length: 11 \}/);
  assert.match(skeleton, /className="table-skeleton__row"/);
  assert.doesNotMatch(skeleton, /<Loader \/>/);
});

test("PF1D.1 orchestration uses existing architecture and bounded visual ownership", () => {
  const app = source("src/App.tsx");
  const css = source("src/App.css");
  const types = source("src/types.ts");

  assert.match(css, /\.table-workspace-overlay[\s\S]*?z-index:\s*90/);
  assert.match(app, /canvas-chrome-layer--rail[\s\S]*?x: tableActive \? -18 : 0/);
  assert.match(app, /canvas-chrome-layer--dock[\s\S]*?y: tableActive \? 18 : 0/);
  assert.match(app, /canvas-chrome-layer--widgets[\s\S]*?x: tableActive \? 24 : 0/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /transition[^;]*backdrop-filter|@keyframes[^}]*backdrop-filter/);
  assert.doesNotMatch(app, /createStore|configureStore|BrowserRouter|createBrowserRouter|RouterProvider/);
  assert.match(types, /ViewMode = "canvas" \| "table"/);
  assert.doesNotMatch(app, /Dashboard|Upload|Search|Download Template|import review/i);
});

test("PF1D.1D restores the conditional floating Table overlay with a static non-blur scrim", () => {
  const app = source("src/App.tsx");
  const css = source("src/App.css");
  const tableWorkspace = css.slice(
    css.indexOf(".table-workspace-overlay"),
    css.indexOf(".canvas-chrome-layer"),
  );
  const tableWorkspaceChrome = tableWorkspace.slice(
    0,
    tableWorkspace.indexOf(".table-view"),
  );

  assert.match(app, /\{\(tableActive \|\| resumePending\) && \([\s\S]*?className="table-workspace-overlay"/);
  assert.match(
    app,
    /className="table-workspace-scrim"[\s\S]*?initial=\{\{ opacity: 1 \}\}[\s\S]*?animate=\{\{ opacity: 1 \}\}/,
  );
  assert.match(app, /className="table-workspace-panel"[\s\S]*?<Suspense[\s\S]*?<TableView \/>/);
  assert.ok(
    app.indexOf('className="table-workspace-scrim"') < app.indexOf('className="table-workspace-panel"'),
    "static scrim exists behind the Table panel",
  );
  assert.match(app, /delay:\s*resumePending \? 0 :/);
  assert.doesNotMatch(css, /\.canvas-workspace\[aria-hidden="true"\][\s\S]*?(?:visibility:\s*hidden|display:\s*none)/);
  assert.match(tableWorkspace, /z-index:\s*90/);
  assert.doesNotMatch(tableWorkspaceChrome, /backdrop-filter|-webkit-backdrop-filter|\bfilter\s*:/);
  assert.doesNotMatch(app, /table-workspace-shell|table-workspace-cover/);
  assert.match(tableWorkspace, /\.table-workspace-scrim[\s\S]*?pointer-events:\s*auto/);
  assert.match(tableWorkspace, /\.table-workspace-panel[\s\S]*?border-radius:\s*var\(--r-panel\)/);

  for (const selector of ["widgets", "rail", "dock", "auxiliary"]) {
    assert.match(
      css,
      new RegExp(`\\.canvas-chrome-layer--${selector}\\s*\\{[\\s\\S]*?z-index:`),
      `${selector} wrapper owns an explicit stable z-index`,
    );
  }
});

test("PF1D.1E owns Table and chrome lifetimes through Motion", () => {
  const app = source("src/App.tsx");

  assert.match(app, /import \{ AnimatePresence, motion, useReducedMotion \} from "motion\/react"/);
  assert.match(
    app,
    /<AnimatePresence>\s*\{\(tableActive \|\| resumePending\) && \([\s\S]*?<motion\.section[\s\S]*?className="table-workspace-overlay"[\s\S]*?initial=\{\{ opacity: 1 \}\}[\s\S]*?<motion\.div[\s\S]*?className="table-workspace-scrim"[\s\S]*?<AnimatePresence>[\s\S]*?\{tableActive && \([\s\S]*?<motion\.div[\s\S]*?className="table-workspace-panel"[\s\S]*?initial=\{reduceMotion \? \{ opacity: 0 \}/,
  );
  assert.match(
    app,
    /<OrganismCanvasView[\s\S]*?active=\{!tableActive\}[\s\S]*?onResumeReady=\{handleOrganismResumeReady\}[\s\S]*?\/>/,
  );
  assert.doesNotMatch(app, /className="table-workspace-overlay"[\s\S]{0,180}initial=\{false\}/);

  for (const [layer, axis, distance] of [
    ["rail", "x", "-18"],
    ["dock", "y", "18"],
    ["widgets", "x", "24"],
    ["auxiliary", "y", "8"],
  ]) {
    assert.match(
      app,
      new RegExp(`<motion\\.div[\\s\\S]*?canvas-chrome-layer--${layer}[\\s\\S]*?animate=\\{[\\s\\S]*?${axis}: tableActive \\? ${distance} : 0`),
      `${layer} wrapper is permanently mounted and Motion-owned`,
    );
  }
  assert.doesNotMatch(app, /is-table-hidden/);
});

test("PF1D.1E shares one isolated explicit stacking root", () => {
  const css = source("src/App.css");

  assert.match(css, /\.app-shell\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;[\s\S]*?isolation:\s*isolate;/);
  assert.match(css, /\.canvas-workspace\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?z-index:\s*0;/);
  assert.match(css, /\.canvas-chrome-layer--widgets\s*\{[\s\S]*?z-index:\s*40;/);
  for (const layer of ["rail", "dock", "auxiliary"]) {
    assert.match(css, new RegExp(`\\.canvas-chrome-layer--${layer}\\s*\\{[\\s\\S]*?z-index:\\s*60;`));
  }
  assert.match(css, /\.table-workspace-overlay\s*\{[\s\S]*?z-index:\s*90;/);
  assert.match(css, /\.app-shell\s*>\s*\.view-toggle\s*\{[\s\S]*?position:\s*(?:absolute|fixed);[\s\S]*?z-index:\s*100;/);
  for (const layer of ["rail", "dock", "widgets", "auxiliary"]) {
    const block = css.match(new RegExp(`\\.canvas-chrome-layer--${layer}\\s*\\{[^}]*\\}`))?.[0] ?? "";
    assert.doesNotMatch(block, /transition:/, `${layer} wrapper does not depend on a CSS transition`);
  }
});
