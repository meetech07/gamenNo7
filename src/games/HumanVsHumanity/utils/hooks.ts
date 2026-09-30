import { useEffect, useRef, useState } from "react";
import { HVH_STYLES, HVH_STYLE_ID } from "../styles";

/**
 * Injects the game stylesheet into document.head exactly once.
 * All rules are scoped under .hvh-root, so this cannot affect the host page.
 */
export function useInjectedStyles(): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(HVH_STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = HVH_STYLE_ID;
    el.setAttribute("data-hvh", "");
    el.appendChild(document.createTextNode(HVH_STYLES));
    document.head.appendChild(el);
  }, []);
}

export function useCountUp(target: number, duration = 900, active = true): number {
  const [value, setValue] = useState(active ? 0 : target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }
    if (typeof window === "undefined") return;
    if (typeof window.requestAnimationFrame !== "function") {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame.current = window.requestAnimationFrame(tick);
    };
    frame.current = window.requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(frame.current);
      }
    };
  }, [target, duration, active]);

  return value;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    /* istanbul ignore next - legacy Safari */
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);
  return reduced;
}
