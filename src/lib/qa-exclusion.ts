/**
 * Founder / QA traffic exclusion — browser-local, reversible, no account system.
 *
 * A single localStorage flag on one browser suppresses every analytics emission
 * (GA4 and PostHog) for that browser until it is explicitly removed. There is no
 * visible control, no route, no cookie shared with the server, and no personal
 * identifier: the flag is the string `"1"` under one key.
 *
 * Enable / disable (documented founder procedure):
 *   1. Visit any page with `?dd_qa=1` appended  → exclusion ON  (persistent)
 *   2. Visit any page with `?dd_qa=0` appended  → exclusion OFF
 *   3. Or, in the browser console:
 *        localStorage.setItem('dd_analytics_optout', '1')   // on
 *        localStorage.removeItem('dd_analytics_optout')     // off
 *
 * The query parameter is read but never forwarded anywhere: analytics payloads
 * continue to carry normalized, path-only values.
 *
 * Normal visitors are unaffected — with no flag present every helper here
 * returns `false` and analytics behaves exactly as before.
 */

/** localStorage key holding the exclusion flag. */
export const QA_EXCLUSION_KEY = "dd_analytics_optout";
/** Query parameter used to toggle the flag from the address bar. */
export const QA_EXCLUSION_PARAM = "dd_qa";
/** The only value treated as "excluded". */
export const QA_EXCLUSION_VALUE = "1";

/** Pure rule: is this stored value an active exclusion? */
export function isExcludedValue(raw: string | null | undefined): boolean {
  return raw === QA_EXCLUSION_VALUE;
}

/**
 * Pure rule for the toggle parameter.
 * Returns `"on"`, `"off"`, or `null` when the parameter is absent/unrecognized.
 */
export function qaToggleFromSearch(search: string | undefined | null): "on" | "off" | null {
  if (!search) return null;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  } catch {
    return null;
  }
  const value = params.get(QA_EXCLUSION_PARAM);
  if (value === null) return null;
  if (value === "1" || value === "true" || value === "on") return "on";
  if (value === "0" || value === "false" || value === "off") return "off";
  return null;
}

function readFlag(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(QA_EXCLUSION_KEY);
  } catch {
    return null;
  }
}

/** True when this browser is intentionally marked as QA traffic. */
export function qaExclusionActive(): boolean {
  return isExcludedValue(readFlag());
}

/** Persist or clear the exclusion for this browser. */
export function setQaExclusion(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(QA_EXCLUSION_KEY, QA_EXCLUSION_VALUE);
    else window.localStorage.removeItem(QA_EXCLUSION_KEY);
  } catch {
    /* storage unavailable — nothing to persist */
  }
}

/**
 * Applies `?dd_qa=1` / `?dd_qa=0` and exposes `window.__ddQaExclude(bool)`.
 * Called once, as early as possible, before analytics initialization.
 * Returns the resulting exclusion state.
 */
export function syncQaExclusionFromLocation(search?: string): boolean {
  if (typeof window === "undefined") return false;
  const toggle = qaToggleFromSearch(search ?? window.location?.search);
  if (toggle === "on") setQaExclusion(true);
  if (toggle === "off") setQaExclusion(false);
  (window as unknown as Record<string, unknown>)["__ddQaExclude"] = (on = true) =>
    setQaExclusion(Boolean(on));
  return qaExclusionActive();
}

/** Inline bootstrap fragment: applies the toggle before any tag is injected. */
export function qaExclusionBootstrapScript(): string {
  return `
    (function () {
      try {
        var KEY = ${JSON.stringify(QA_EXCLUSION_KEY)};
        var PARAM = ${JSON.stringify(QA_EXCLUSION_PARAM)};
        var value = new URLSearchParams(location.search || '').get(PARAM);
        if (value === '1' || value === 'true' || value === 'on') localStorage.setItem(KEY, '1');
        if (value === '0' || value === 'false' || value === 'off') localStorage.removeItem(KEY);
      } catch (e) {
        /* analytics must never break the page */
      }
    })();
  `;
}
