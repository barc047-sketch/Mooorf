import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { useLab } from "./state/store";
import Loader from "./ui/Loader";
import ViewToggle from "./ui/ViewToggle";
import Dock from "./ui/Dock";
import Rail from "./ui/Rail";
import ZoomControls from "./ui/ZoomControls";
import Hud from "./ui/Hud";
import WidgetHost from "./ui/widgets/WidgetHost";
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
  const uiScale = useLab((s) => s.settings.uiScale);
  const widgetScale = useLab((s) => s.settings.widgetScale);

  // Apply theme tokens at the document root so the whole app + canvas react.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Interface scale changes authored chrome density only. Canvas world/camera
  // coordinates never read this property; mobile clamps the visual scale.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia("(max-width: 640px)");
    const applyScale = () => {
      const effectiveScale = mobile.matches ? Math.min(uiScale, 1) : uiScale;
      root.style.setProperty("--ui-scale", String(effectiveScale));
      root.style.setProperty("--ui-scale-user", String(uiScale));
    };
    applyScale();
    mobile.addEventListener("change", applyScale);
    return () => mobile.removeEventListener("change", applyScale);
  }, [uiScale]);

  // Widget Scale (V7.1D) is independent of Interface Scale: it owns widget
  // window/content density only and never clamps on narrow viewports.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--widget-scale", String(widgetScale));
  }, [widgetScale]);

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
              <WidgetHost />
            </>
          )}
        </>
      )}
    </div>
  );
}
