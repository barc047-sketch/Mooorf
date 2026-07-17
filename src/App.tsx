import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLab } from "./state/store";
import Loader from "./ui/Loader";
import ViewToggle from "./ui/ViewToggle";
import Dock from "./ui/Dock";
import Rail from "./ui/Rail";
import ZoomControls from "./ui/ZoomControls";
import WidgetHost from "./ui/widgets/WidgetHost";
import CanvasView from "./canvas/CanvasView";
import OrganismCanvasView from "./canvas/OrganismCanvasView";
import { Toaster } from "sonner";
import FileIntakeProvider from "./import/FileIntakeProvider";
import ContextSurfaceHost from "./ui/context/ContextSurfaceHost";
import RuntimeStatus from "./ui/RuntimeStatus";
import QuickToggleBar from "./ui/QuickToggleBar";
import { activateInspector, shouldHandleInspectorShortcut } from "./interaction/inspectorShortcut";
import "./App.css";

/* V6E experiment route — hidden URL, separate lazy chunk, zero cost to the
   main app. Open /experiments/organism-lab (or /#organism-lab). */
const OrganismLab = lazy(() => import("./experiments/organism-lab/OrganismLab"));
const TableView = lazy(() => import("./views/TableView"));
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

function TableWorkspaceSkeleton() {
  return (
    <div
      className="table-workspace-skeleton"
      role="status"
      aria-label="Loading space schedule"
    >
      <div className="table-skeleton__title" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="table-skeleton__table" aria-hidden="true">
        <div className="table-skeleton__header">
          {Array.from({ length: 5 }, (_, column) => <span key={column} />)}
        </div>
        {Array.from({ length: 11 }, (_, row) => (
          <div className="table-skeleton__row" key={row}>
            {Array.from({ length: 5 }, (_, column) => <span key={column} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function MainApp() {
  const theme = useLab((s) => s.theme);
  const loaderDone = useLab((s) => s.loaderDone);
  const view = useLab((s) => s.view);
  const empty = useLab((s) => s.spaces.length === 0);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const uiScale = useLab((s) => s.settings.uiScale);
  const widgetScale = useLab((s) => s.settings.widgetScale);
  const reduceMotion = useReducedMotion();
  const tableActive = view === "table";
  const [resumePending, setResumePending] = useState(false);
  const resumeGenerationRef = useRef(0);
  const resumeTimeoutRef = useRef<number | null>(null);
  const resumeGeneration = resumeGenerationRef.current;

  const handleOrganismResumeReady = useCallback(() => {
    if (resumeGenerationRef.current !== resumeGeneration) return;
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    setResumePending(false);
  }, [resumeGeneration]);

  useLayoutEffect(() => {
    const generation = ++resumeGenerationRef.current;
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    if (tableActive || rendererMode !== "organism") {
      setResumePending(false);
      return;
    }
    setResumePending(true);
    resumeTimeoutRef.current = window.setTimeout(() => {
      if (resumeGenerationRef.current !== generation) return;
      resumeTimeoutRef.current = null;
      setResumePending(false);
      if (import.meta.env.DEV) {
        console.warn("[PF1D.2] Organism resume preparation exceeded 400ms; releasing the scrim.");
      }
    }, 400);
  }, [rendererMode, tableActive]);

  useEffect(() => {
    return () => {
      ++resumeGenerationRef.current;
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    const state = useLab.getState();
    if (!state.loaderDone) state.setCanvasReadiness("store-restored");
  }, []);

  useEffect(() => {
    let live = true;
    const ready = document.fonts?.ready ?? Promise.resolve();
    void ready.then(() => {
      const state = useLab.getState();
      if (live && !state.loaderDone) state.setCanvasReadiness("fonts-ready");
    });
    return () => {
      live = false;
    };
  }, []);

  // MainApp owns one global Inspector shortcut listener. Workspace visibility
  // changes never duplicate the listener or remount the Canvas.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldHandleInspectorShortcut(event)) return;
      event.preventDefault();
      activateInspector("toggle");
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

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
    <FileIntakeProvider>
      <div className="app-shell">
        {!loaderDone && <Loader />}

        <section
          className="canvas-workspace"
          aria-label="Canvas workspace"
          aria-hidden={tableActive || resumePending}
          inert={tableActive || resumePending}
        >
          {rendererMode === "organism"
            ? (
              <OrganismCanvasView
                active={!tableActive}
                onResumeReady={handleOrganismResumeReady}
              />
            )
            : <CanvasView />}
          {empty && (
            <div className="stage-empty stage-hint">
              <p className="eyebrow">CANVAS LAB</p>
              <h1 className="display">Add a space.</h1>
              <p className="hint-sub">use the + button in the dock</p>
            </div>
          )}
        </section>

        <AnimatePresence>
          {(tableActive || resumePending) && (
            <motion.section
              className="table-workspace-overlay"
              aria-label="Space schedule workspace"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: {
                  duration: reduceMotion ? 0.01 : 0.04,
                  delay: resumePending ? 0 : reduceMotion ? 0.01 : 0.24,
                  ease: "linear",
                },
              }}
            >
              <motion.div
                className="table-workspace-scrim"
                aria-hidden="true"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              />
              <AnimatePresence>
                {tableActive && (
                  <motion.div
                    className="table-workspace-panel"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.995 }}
                    animate={reduceMotion
                      ? { opacity: 1, transition: { duration: 0.01 } }
                      : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.17, ease: [0.22, 1, 0.36, 1] } }}
                    exit={reduceMotion
                      ? { opacity: 0, transition: { duration: 0.01 } }
                      : { opacity: 0, y: 5, scale: 0.997, transition: { duration: 0.1, ease: [0.22, 1, 0.36, 1] } }}
                  >
                    <Suspense fallback={<TableWorkspaceSkeleton />}>
                      <TableView />
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {loaderDone && (
          <>
            <ViewToggle />
            <motion.div
              className="canvas-chrome-layer canvas-chrome-layer--rail"
              aria-hidden={tableActive}
              inert={tableActive}
              animate={reduceMotion
                ? { opacity: tableActive ? 0 : 1, x: 0 }
                : { opacity: tableActive ? 0 : 1, x: tableActive ? -18 : 0 }}
              transition={{
                opacity: { duration: reduceMotion ? 0.00001 : 0.09, ease: [0.22, 1, 0.36, 1] },
                x: { duration: reduceMotion ? 0.00001 : 0.27, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <Rail />
            </motion.div>
            <motion.div
              className="canvas-chrome-layer canvas-chrome-layer--dock"
              aria-hidden={tableActive}
              inert={tableActive}
              animate={reduceMotion
                ? { opacity: tableActive ? 0 : 1, y: 0 }
                : { opacity: tableActive ? 0 : 1, y: tableActive ? 18 : 0 }}
              transition={{
                opacity: { duration: reduceMotion ? 0.00001 : 0.09, ease: [0.22, 1, 0.36, 1] },
                y: { duration: reduceMotion ? 0.00001 : 0.275, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <Dock />
            </motion.div>
            <motion.div
              className="canvas-chrome-layer canvas-chrome-layer--widgets"
              aria-hidden={tableActive}
              inert={tableActive}
              animate={reduceMotion
                ? { opacity: tableActive ? 0 : 1, x: 0 }
                : { opacity: tableActive ? 0 : 1, x: tableActive ? 24 : 0 }}
              transition={{
                opacity: { duration: reduceMotion ? 0.00001 : 0.12, ease: [0.22, 1, 0.36, 1] },
                x: { duration: reduceMotion ? 0.00001 : 0.16, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <WidgetHost />
            </motion.div>
            <motion.div
              className="canvas-chrome-layer canvas-chrome-layer--auxiliary"
              aria-hidden={tableActive}
              inert={tableActive}
              animate={reduceMotion
                ? { opacity: tableActive ? 0 : 1, y: 0 }
                : { opacity: tableActive ? 0 : 1, y: tableActive ? 8 : 0 }}
              transition={{
                opacity: { duration: reduceMotion ? 0.00001 : 0.1, ease: [0.22, 1, 0.36, 1] },
                y: { duration: reduceMotion ? 0.00001 : 0.14, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <header className="brand">ZONUERT</header>
              <QuickToggleBar />
              <ZoomControls />
              <ContextSurfaceHost />
            </motion.div>
          </>
        )}
        <RuntimeStatus />
        <Toaster className="zonuert-toaster" position="bottom-center" theme={theme === "night" ? "dark" : "light"} />
      </div>
    </FileIntakeProvider>
  );
}
