/**
 * Single gate for production analytics emission (GA4 + PostHog).
 *
 * Two independent conditions must both hold before any production analytics
 * call leaves the browser:
 *
 * 1. Host — only the canonical public hosts count as production. Preview and
 *    Lovable editor/project domains, localhost, LAN hosts, and anything else
 *    are excluded, so QA browsing never pollutes production reporting.
 * 2. Path — internal tooling under `/internal/` and raw endpoints under
 *    `/api/` never emit anything, even on a canonical host.
 *
 * A third condition is browser-local: a browser explicitly marked for QA (see
 * `@/lib/qa-exclusion`) emits nothing at all, on any host or path.
 *
 * Everything here is pure and browser-independent apart from the two explicit
 * `window` readers at the bottom, so the gating rules are unit-testable.
 */

import { QA_EXCLUSION_KEY, QA_EXCLUSION_VALUE, qaExclusionActive } from "./qa-exclusion";

/** The only hosts allowed to emit production analytics. */
export const PRODUCTION_ANALYTICS_HOSTS = [
  "deliciousduck.com",
  "www.deliciousduck.com",
] as const;

/** Path prefixes that never emit analytics, on any host. */
export const ANALYTICS_BLOCKED_PATH_PREFIXES = ["/internal", "/api"] as const;

export function isProductionAnalyticsHost(hostname: string | undefined | null): boolean {
  if (!hostname) return false;
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  return (PRODUCTION_ANALYTICS_HOSTS as readonly string[]).includes(host);
}

export function isAnalyticsAllowedPath(path: string | undefined | null): boolean {
  if (!path) return true;
  const bare = (path.split("#")[0] ?? "").split("?")[0] ?? "";
  const normalized = bare.startsWith("/") ? bare : `/${bare}`;
  return !ANALYTICS_BLOCKED_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/** Pure combination of both rules — used by tests and by the runtime readers. */
export function shouldEmitAnalytics(input: {
  hostname: string | undefined | null;
  path: string | undefined | null;
}): boolean {
  return isProductionAnalyticsHost(input.hostname) && isAnalyticsAllowedPath(input.path);
}

/**
 * Runtime check for the current browser location. Always false on the server,
 * during prerender, and in unit tests without a canonical-host jsdom origin.
 */
export function analyticsEnabled(pathOverride?: string): boolean {
  if (typeof window === "undefined" || !window.location) return false;
  // Founder / QA browsers opt out locally and permanently until cleared.
  if (qaExclusionActive()) return false;
  return shouldEmitAnalytics({
    hostname: window.location.hostname,
    path: pathOverride ?? window.location.pathname,
  });
}

/**
 * The documented GA4 kill switch: `window['ga-disable-G-XXXX'] = true` stops
 * every measurement for that property, including gtag's own enhanced
 * browser-history pageviews. We drive it per route so a client-side navigation
 * into /internal or /api cannot emit even if GA's history listener fires
 * before our router effect runs.
 */
export function gaDisableFlagKey(measurementId: string): string {
  return `ga-disable-${measurementId}`;
}

/**
 * Route-aware GA suspend/restore. Sets the disable flag to `true` on blocked
 * paths and on every non-canonical host, and back to `false` when an allowed
 * public route is active again — a plain boolean on `window`, never persisted
 * consent state.
 */
export function syncGaRoutePolicy(measurementId: string, pathOverride?: string): boolean {
  if (typeof window === "undefined" || !window.location) return false;
  const enabled = analyticsEnabled(pathOverride);
  (window as unknown as Record<string, boolean>)[gaDisableFlagKey(measurementId)] = !enabled;
  return enabled;
}

/**
 * Global names the inline bootstrap installs on `window`.
 *
 * `__ddLoadGtag` is idempotent: it injects gtag.js + the first `config` (a
 * path-only page_view) once per session and returns `true` only for the call
 * that actually performed the load. That lets a session which started on a
 * blocked route (`/internal/*`, `/api/*`, where nothing is loaded) initialize
 * GA lazily on its first public navigation without ever loading twice or
 * emitting two pageviews.
 */
export const GTAG_LOADER_KEY = "__ddLoadGtag";
export const GTAG_LOADED_KEY = "__ddGtagLoaded";

export type GtagLoadResult = "loaded" | "already" | "blocked";

/**
 * Ensures gtag.js exists for the current route. Returns `"loaded"` when this
 * call performed the (single) load — the caller must then NOT send its own
 * pageview, because the bootstrap's `config` already emitted one.
 */
export function ensureGtagLoaded(measurementId: string, pathOverride?: string): GtagLoadResult {
  if (typeof window === "undefined" || !window.location) return "blocked";
  if (!analyticsEnabled(pathOverride)) return "blocked";
  const w = window as unknown as Record<string, unknown>;
  if (w[GTAG_LOADED_KEY]) return "already";
  const loader = w[GTAG_LOADER_KEY];
  if (typeof loader !== "function") return "blocked";
  // Keep the kill switch aligned before the tag can read it.
  syncGaRoutePolicy(measurementId, pathOverride);
  // The router commits its pathname before the browser's `location` settles on
  // some client-side navigations, so the loader is told which path to trust
  // instead of re-reading a stale `location.pathname` (which would decline the
  // load, or worse, stamp the previous internal path on the first pageview).
  const path = pathOverride ?? window.location.pathname;
  try {
    const loaded = (loader as (p?: string) => boolean)(path);
    if (loaded) return "loaded";
    return w[GTAG_LOADED_KEY] ? "already" : "blocked";
  } catch {
    return "blocked";
  }
}

/**
 * Inline bootstrap for gtag.js.
 *
 * Four things happen here, in this order:
 *
 * 1. The `ga-disable-<id>` flag is set from the current host + path *before*
 *    gtag.js is requested, so the library starts out suspended on blocked
 *    routes and on non-canonical hosts.
 * 2. `pushState`, `replaceState` and `popstate` are wrapped/observed so the
 *    flag is updated in the same task as the history change — earlier than
 *    GA's own history listeners and earlier than the router effect.
 * 3. A one-shot `__ddLoadGtag()` loader is exposed so a session that starts on
 *    a blocked route can initialize GA later, on its first public navigation.
 * 4. Only then, on a canonical host and an allowed path, is the tag injected.
 *    The first `page_view` carries origin + pathname only: mailbox-token links
 *    (`/newsletter/unsubscribe?t=...`) must never reach analytics.
 */
export function gtagBootstrapScript(measurementId: string): string {
  const hosts = JSON.stringify(PRODUCTION_ANALYTICS_HOSTS);
  const blocked = JSON.stringify(ANALYTICS_BLOCKED_PATH_PREFIXES);
  const disableKey = JSON.stringify(gaDisableFlagKey(measurementId));
  return `
    (function () {
      try {
        var hosts = ${hosts};
        var blocked = ${blocked};
        var disableKey = ${disableKey};
        var host = (location.hostname || '').toLowerCase().replace(/\\.$/, '');
        var qaExcluded = false;
        try {
          qaExcluded = localStorage.getItem(${JSON.stringify(QA_EXCLUSION_KEY)}) === ${JSON.stringify(QA_EXCLUSION_VALUE)};
        } catch (e) { /* storage unavailable */ }
        var hostOk = hosts.indexOf(host) !== -1 && !qaExcluded;
        function pathAllowedFor(path) {
          path = path || '/';
          var bare = path.split('#')[0].split('?')[0] || '/';
          for (var i = 0; i < blocked.length; i++) {
            if (bare === blocked[i] || bare.indexOf(blocked[i] + '/') === 0) return false;
          }
          return true;
        }
        function pathAllowed() {
          return pathAllowedFor(location.pathname || '/');
        }
        function syncDisableFlag() {
          window[disableKey] = !(hostOk && pathAllowed());
          return !window[disableKey];
        }
        syncDisableFlag();
        // Wrap history mutations so the flag flips before any GA listener that
        // was registered later can read it, and restore it on back/forward.
        var history = window.history;
        ['pushState', 'replaceState'].forEach(function (name) {
          var original = history[name];
          if (typeof original !== 'function') return;
          history[name] = function () {
            var result = original.apply(this, arguments);
            syncDisableFlag();
            return result;
          };
        });
        window.addEventListener('popstate', syncDisableFlag, true);
        window.addEventListener('hashchange', syncDisableFlag, true);
        window.__ddSyncGaDisableFlag = syncDisableFlag;
        // One-shot loader: safe to call on every public navigation.
        window.${GTAG_LOADER_KEY} = function (forcePath) {
          if (window.${GTAG_LOADED_KEY}) return false;
          var path = typeof forcePath === 'string' && forcePath
            ? (forcePath.split('#')[0].split('?')[0] || '/')
            : (location.pathname || '/');
          if (!hostOk || !pathAllowedFor(path)) return false;
          window.${GTAG_LOADED_KEY} = true;
          window[disableKey] = false;
          var s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtag/js?id=${measurementId}';
          document.head.appendChild(s);
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_location: location.origin + path,
            page_path: path
          });
          return true;
        };
        if (!hostOk || !pathAllowed()) return;
        window.${GTAG_LOADER_KEY}();
      } catch (e) {
        /* analytics must never break the page */
      }
    })();
  `;
}


