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
 * Inline bootstrap for gtag.js.
 *
 * The tag itself is injected only on a canonical host and only outside the
 * blocked path prefixes, so a preview or `/internal/` load never requests
 * googletagmanager.com at all. The first `page_view` carries origin + pathname
 * only: mailbox-token links (`/newsletter/unsubscribe?t=...`) must never reach
 * analytics.
 */
export function gtagBootstrapScript(measurementId: string): string {
  const hosts = JSON.stringify(PRODUCTION_ANALYTICS_HOSTS);
  const blocked = JSON.stringify(ANALYTICS_BLOCKED_PATH_PREFIXES);
  return `
    (function () {
      try {
        var host = (location.hostname || '').toLowerCase().replace(/\\.$/, '');
        if (${hosts}.indexOf(host) === -1) return;
        var path = location.pathname || '/';
        var blocked = ${blocked};
        for (var i = 0; i < blocked.length; i++) {
          if (path === blocked[i] || path.indexOf(blocked[i] + '/') === 0) return;
        }
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
