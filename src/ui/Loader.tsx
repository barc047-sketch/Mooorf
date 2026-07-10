import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLab } from "../state/store";
import type { CanvasReadiness } from "../types";
import "./loader.css";

gsap.registerPlugin(useGSAP);

const MIN_VISIBLE_MS = 380;
const SAFETY_EXIT_MS = 10_000;

const READINESS_COPY: Record<CanvasReadiness, readonly [string, string]> = {
  initialising: ["INITIALISING FIELD", "CREATING RENDER CONTEXT"],
  preparing: ["PREPARING NUCLEI", "MAPPING SPATIAL PROGRAM"],
  resolving: ["RESOLVING CANVAS", "PAINTING FIRST FRAME"],
  fallback: ["CLASSIC FALLBACK", "RECOVERING CANVAS PATH"],
  ready: ["CANVAS READY", "SPATIAL FIELD RESOLVED"],
};

const READINESS_INDEX: Record<CanvasReadiness, string> = {
  initialising: "01",
  preparing: "02",
  resolving: "03",
  fallback: "02",
  ready: "04",
};

export default function Loader() {
  const readiness = useLab((state) => state.canvasReadiness);
  const setLoaderDone = useLab((state) => state.setLoaderDone);
  const root = useRef<HTMLDivElement>(null);
  const mountedAt = useRef(performance.now());
  const exitStarted = useRef(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.set(root.current, { autoAlpha: 1 });
      if (reduced) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".loader-brand", { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.48 })
        .fromTo(".loader-status", { x: -10, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.52 }, "<0.08")
        .fromTo(".loader-count", { xPercent: 5, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.72 }, "<");
    },
    { scope: root }
  );

  useEffect(() => {
    if (readiness !== "ready" || exitStarted.current) return;
    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - mountedAt.current));
    const timer = window.setTimeout(() => {
      if (exitStarted.current) return;
      exitStarted.current = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(root.current, {
        autoAlpha: 0,
        clipPath: "inset(0% 0% 100% 0%)",
        duration: reduced ? 0.22 : 0.64,
        ease: "power3.inOut",
        onComplete: setLoaderDone,
      });
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [readiness, setLoaderDone]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (exitStarted.current) return;
      exitStarted.current = true;
      gsap.to(root.current, {
        autoAlpha: 0,
        duration: 0.28,
        ease: "power1.out",
        onComplete: setLoaderDone,
      });
    }, SAFETY_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [setLoaderDone]);

  const [primary, secondary] = READINESS_COPY[readiness];

  return (
    <div ref={root} className="loader" data-testid="loader" data-readiness={readiness}>
      <div className="loader-gradient" aria-hidden="true">
        <div className="g g1" />
        <div className="g g2" />
        <div className="g g3" />
      </div>

      <header className="loader-brand">
        ZONUERT<span>SPATIAL GRAPH STUDIO</span>
      </header>

      <div className="loader-count" data-testid="loader-count" aria-hidden="true">
        {READINESS_INDEX[readiness]}
      </div>

      <div className="loader-status" role="status" aria-live="polite">
        <span>{primary}</span>
        <i>{secondary}</i>
      </div>
    </div>
  );
}
