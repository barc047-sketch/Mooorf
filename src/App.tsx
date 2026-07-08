import { lazy, Suspense, useEffect } from "react";
import { useLab } from "./state/store";
import Loader from "./ui/Loader";
import ViewToggle from "./ui/ViewToggle";
import Dock from "./ui/Dock";
import Rail from "./ui/Rail";
import ZoomControls from "./ui/ZoomControls";
import Hud from "./ui/Hud";
import OrganismControlPanel from "./ui/OrganismControlPanel";
import CanvasView from "./canvas/CanvasView";
import OrganismCanvasView from "./canvas/OrganismCanvasView";
import TableView from "./views/TableView";
import "./App.css";

/* V6E experiment route — hidden URL, separate lazy chunk, zero cost to the
   main app. Open /experiments/organism-lab (or /#organism-lab). */
const OrganismLab = lazy(() => import("./experiments/organism-lab/OrganismLab"));
const ORGANISM_LAB_ROUTE =
  typeof window !== "undefined" &&
  (window.location.pathname.startsWith("/experiments/organism-lab") ||
    window.location.hash === "#organism-lab");

export default function App() {
  if (ORGANISM_LAB_ROUTE) {
    return (
      <Suspense fallback={null}>
        <OrganismLab />
      </Suspense>
    );
  }
  return <MainApp />;
}

function MainApp() {
  const theme = useLab((s) => s.theme);
  const loaderDone = useLab((s) => s.loaderDone);
  const view = useLab((s) => s.view);
  const empty = useLab((s) => s.spaces.length === 0);
  const rendererMode = useLab((s) => s.settings.rendererMode);

  // Apply theme tokens at the document root so the whole app + canvas react.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      {!loaderDone && <Loader />}

      <header className="brand">ZONUERT</header>

      <main className="stage">
        {view === "canvas" ? (
          <>
            {rendererMode === "organism" ? <OrganismCanvasView /> : <CanvasView />}
            {empty && (
              <div className="stage-empty stage-hint">
                <p className="eyebrow">CANVAS LAB</p>
                <h1 className="display">Add a space.</h1>
                <p className="hint-sub">use the + button in the dock</p>
              </div>
            )}
          </>
        ) : (
          <TableView />
        )}
      </main>

      {loaderDone && (
        <>
          <ViewToggle />
          {view === "canvas" && (
            <>
              <Rail />
              <Dock />
              <ZoomControls />
              <Hud />
              <OrganismControlPanel />
            </>
          )}
        </>
      )}
    </div>
  );
}
