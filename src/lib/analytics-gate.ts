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
 * Everything here is pure and browser-independent apart from the two explicit
 * `window` readers at the bottom, so the gating rules are unit-testable.
 */

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
 * Inline bootstrap for gtag.js.
 *
 * Three things happen here, in this order:
 *
 * 1. The `ga-disable-<id>` flag is set from the current host + path *before*
 *    gtag.js is requested, so the library starts out suspended on blocked
 *    routes and on non-canonical hosts.
 * 2. `pushState`, `replaceState` and `popstate` are wrapped/observed so the
 *    flag is updated in the same task as the history change — earlier than
 *    GA's own history listeners and earlier than the router effect.
 * 3. Only then, on a canonical host and an allowed path, is the tag injected.
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
        var hostOk = hosts.indexOf(host) !== -1;
        function pathAllowed() {
          var path = location.pathname || '/';
          for (var i = 0; i < blocked.length; i++) {
            if (path === blocked[i] || path.indexOf(blocked[i] + '/') === 0) return false;
          }
          return true;
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
        if (!hostOk || !pathAllowed()) return;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=${measurementId}';
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${measurementId}', {
          page_location: location.origin + location.pathname,
          page_path: location.pathname
        });
      } catch (e) {
        /* analytics must never break the page */
      }
    })();
  `;
}

