import { useEffect, useRef } from "react";
import { trackCalculatorComplete } from "@/lib/analytics";

type ResultParams = Record<string, string | number | boolean | undefined>;

/**
 * Fires a single GA4 `calculator_complete` event once a user interaction has
 * produced a result.
 *
 * Anti-duplication rules:
 * - the first run (component mount / SSR hydration with default values) is
 *   skipped, so the event only reflects a real user action;
 * - changes are debounced, so dragging a slider or typing a weight sends one
 *   event rather than one per keystroke;
 * - identical consecutive payloads are ignored.
 *
 * Only non-sensitive, derived result metadata should be passed in `result`.
 */
export function useCalculatorComplete({
  calculatorName,
  toolSlug,
  ready = true,
  result,
  debounceMs = 900,
}: {
  calculatorName: string;
  toolSlug: string;
  ready?: boolean;
  result: ResultParams;
  debounceMs?: number;
}) {
  const mounted = useRef(false);
  const lastSent = useRef<string | null>(null);
  const payload = JSON.stringify(result);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!ready) return;
    if (lastSent.current === payload) return;

    const timer = setTimeout(() => {
      if (lastSent.current === payload) return;
      lastSent.current = payload;
      trackCalculatorComplete({
        calculatorName,
        toolSlug,
        result: JSON.parse(payload) as ResultParams,
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [payload, ready, calculatorName, toolSlug, debounceMs]);
}
