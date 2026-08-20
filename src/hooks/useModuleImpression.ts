import { useEffect, useRef } from "react";
import { isMeaningfullyVisible, VISIBILITY_RATIO } from "@/lib/impression-events";

/**
 * Shared visibility primitive for impression events.
 *
 * One IntersectionObserver per instrumented module, the same "meaningfully
 * visible" rule everywhere (`isMeaningfullyVisible`), and the callback is
 * invoked at most once per mounted element — session-level deduplication is the
 * tracking helpers' job, so an SPA return to the same page still counts once.
 *
 * No-ops during SSR and where IntersectionObserver is unavailable, so nothing
 * fires merely because a module mounted.
 */
export function useModuleImpression<T extends HTMLElement = HTMLElement>(
  onVisible: () => void,
  enabled = true,
) {
  const ref = useRef<T | null>(null);
  const firedRef = useRef(false);
  const handlerRef = useRef(onVisible);
  handlerRef.current = onVisible;

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (firedRef.current) return;
          const rect = entry.boundingClientRect;
          const visible = isMeaningfullyVisible({
            intersectionRatio: entry.intersectionRatio,
            visibleHeight: entry.intersectionRect?.height ?? 0,
            elementHeight: rect?.height ?? 0,
            viewportHeight: window.innerHeight || 0,
          });
          if (!entry.isIntersecting || !visible) continue;
          firedRef.current = true;
          observer.disconnect();
          handlerRef.current();
          return;
        }
      },
      { threshold: [0, VISIBILITY_RATIO] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}
