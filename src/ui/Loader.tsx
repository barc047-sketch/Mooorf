import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLab } from "../state/store";
import "./loader.css";

gsap.registerPlugin(useGSAP);

// Status sequence per ANIMATION_AND_LOADING_SPEC.
const STATUS = [
  "loading spatial graph",
  "preparing cells",
  "building canvas",
  "ready",
];

export default function Loader() {
  const setLoaderDone = useLab((s) => s.setLoaderDone);
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const countEl = el.querySelector<HTMLElement>(".loader-count")!;
      const statusEl = el.querySelector<HTMLElement>(".loader-status")!;
      const counter = { v: 0 };

      const render = () => {
        countEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
        const step = counter.v >= 96 ? 3 : counter.v >= 66 ? 2 : counter.v >= 33 ? 1 : 0;
        if (statusEl.textContent !== STATUS[step]) statusEl.textContent = STATUS[step];
      };
      render();

      // Reduced motion: no countdown crawl, no drift — quick fade only.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        counter.v = 100;
        render();
        gsap
          .timeline()
          .set(el, { autoAlpha: 1 })
          .to(el, { autoAlpha: 0, duration: 0.4, delay: 0.6 })
          .call(setLoaderDone);
        return;
      }

      // Ambient liquid drift — slow, yoyo, killed with scope on unmount.
      gsap.to(".g1", { xPercent: 14, yPercent: -12, scale: 1.12, duration: 9, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to(".g2", { xPercent: -12, yPercent: 9, scale: 1.08, rotation: 18, duration: 11, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to(".g3", { xPercent: 9, yPercent: 13, scale: 1.16, rotation: -12, duration: 13, yoyo: true, repeat: -1, ease: "sine.inOut" });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tlRef.current = tl;

      tl.to(el, { autoAlpha: 1, duration: 0.45, ease: "none" })
        .fromTo(".loader-brand", { y: -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, "<0.15")
        .fromTo(
          ".g",
          { scale: 0.55, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 1.5, stagger: 0.18, ease: "power3.out" },
          "<"
        )
        .fromTo(".loader-corner", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, "<0.35")
        .to(counter, { v: 100, duration: 3.4, ease: "power1.inOut", onUpdate: render }, "<0.2")
        .fromTo(".loader-enter", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, ">-0.1")
        .addLabel("exit", "+=0.55")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "power3.inOut" }, "exit")
        .call(setLoaderDone);
    },
    { scope: root }
  );

  // "enter canvas" — skip straight to the reveal.
  const skip = () => {
    const tl = tlRef.current;
    if (tl && tl.progress() < 1) tl.seek("exit").play();
    else setLoaderDone();
  };

  return (
    <div ref={root} className="loader" data-testid="loader">
      <div className="loader-gradient" data-testid="loader-gradient" aria-hidden="true">
        <div className="g g1" />
        <div className="g g2" />
        <div className="g g3" />
      </div>

      <header className="loader-brand">
        zonuert<span>spatial graph studio</span>
      </header>

      <div className="loader-corner">
        <div className="loader-count" data-testid="loader-count">
          000
        </div>
        <button type="button" className="loader-enter" onClick={skip}>
          enter canvas
        </button>
        <div className="loader-status">loading spatial graph</div>
      </div>
    </div>
  );
}
