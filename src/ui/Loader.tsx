import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLab } from "../state/store";
import type { CanvasReadiness } from "../types";
import { READINESS_PROGRESS } from "./readiness";
import "./loader.css";

gsap.registerPlugin(useGSAP);

const MIN_VISIBLE_MS = 380;
const FINAL_ROLL_MS = 760;
const SAFETY_EXIT_MS = 10_000;

const READINESS_COPY: Record<CanvasReadiness, readonly [string, string]> = {
  "shell-start": ["INITIALISING SHELL", "STARTING LOCAL WORKSPACE"],
  "store-restored": ["PROJECT RESTORED", "RESOLVING SAVED WORK"],
  "fonts-ready": ["TYPE SYSTEM READY", "PREPARING EDITORIAL CANVAS"],
  "canvas-mounted": ["CANVAS MOUNTED", "CREATING RENDER CONTEXT"],
  "renderer-ready": ["RENDERER READY", "MAPPING SPATIAL PROGRAM"],
  "render-requested": ["RESOLVING CANVAS", "PAINTING FIRST FRAME"],
  ready: ["CANVAS READY", "SPATIAL FIELD RESOLVED"],
};

export default function Loader() {
  const readiness = useLab((state) => state.canvasReadiness);
  const setLoaderDone = useLab((state) => state.setLoaderDone);
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const previousProgress = useRef(0);
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
    const target = READINESS_PROGRESS[readiness];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!count.current) return;
    if (reduced) {
      count.current.textContent = String(target).padStart(2, "0");
      previousProgress.current = target;
      return;
    }
    const value = { current: previousProgress.current };
    gsap.fromTo(
      count.current,
      { yPercent: readiness === "shell-start" ? 12 : 8, autoAlpha: readiness === "shell-start" ? 0 : 1 },
      { yPercent: 0, autoAlpha: 1, duration: readiness === "shell-start" ? 0.62 : 0.38, ease: "power3.out" }
    );
    const tween = gsap.to(value, {
      current: target,
      duration: Math.min(0.72, Math.max(0.2, (target - previousProgress.current) / 90)),
      ease: "power2.out",
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.round(value.current)).padStart(2, "0");
      },
      onComplete: () => {
        previousProgress.current = target;
      },
    });
    return () => {
      tween.kill();
    };
  }, [readiness]);

  useEffect(() => {
    if (readiness !== "ready" || exitStarted.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const remaining = Math.max(
      0,
      MIN_VISIBLE_MS - (performance.now() - mountedAt.current),
      reduced ? 0 : FINAL_ROLL_MS
    );
    const timer = window.setTimeout(() => {
      if (exitStarted.current) return;
      exitStarted.current = true;
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
        <span ref={count}>00</span>
      </div>

      <div className="loader-status" role="status" aria-live="polite">
        <span>{primary}</span>
        <i>{secondary}</i>
      </div>
    </div>
  );
}
