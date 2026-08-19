/**
 * PostHog analytics — browser-only, initialized once at app startup.
 *
 * Runs alongside GA4: this module never touches gtag, Search Console tags,
 * affiliate verification tags, SEO metadata, or newsletter behaviour.
 *
 * Privacy: pageviews are captured manually with the path only, so mailbox
 * tokens and other query strings (e.g. /newsletter/unsubscribe?t=...) never
 * reach PostHog. Every helper is fire-and-forget and no-ops on the server.
 */

import posthog from "posthog-js";
import { analyticsEnabled } from "./analytics-gate";

export const POSTHOG_KEY = "phc_nTL8XA9PoPBexJHqaP9nrrqUgNrhJbVM5M3kCudC9qA3";
/** Activated managed reverse-proxy ingestion host for deliciousduck.com. */
export const POSTHOG_PROXY_HOST = "https://e.deliciousduck.com";
/** Direct US PostHog Cloud ingestion host — the one-line rollback target. */
export const POSTHOG_DIRECT_HOST = "https://us.i.posthog.com";
/** PostHog Cloud US app host. Stays the UI host even behind a proxy. */
export const POSTHOG_UI_HOST = "https://us.posthog.com";

/**
 * Optional override of the managed reverse-proxy ingestion host.
 *
 * The default is `POSTHOG_PROXY_HOST` (`https://e.deliciousduck.com`), which is
 * now activated in preview. A build-time `VITE_POSTHOG_API_HOST` variable can
 * still override this for future flexibility, but it is not required.
 *
 * Conservative validation: `https:` only, no credentials, no query, no hash,
 * origin only — a path other than `/` is rejected. Any absent or malformed value
 * falls back to `POSTHOG_PROXY_HOST` so analytics never break.
 */
export function resolvePostHogApiHost(raw?: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return POSTHOG_PROXY_HOST;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return POSTHOG_PROXY_HOST;
  }
  if (url.protocol !== "https:") return POSTHOG_PROXY_HOST;
  if (url.username || url.password) return POSTHOG_PROXY_HOST;
  if (url.search || url.hash) return POSTHOG_PROXY_HOST;
  if (url.pathname !== "/" && url.pathname !== "") return POSTHOG_PROXY_HOST;
  return url.origin;
}

/** The configured ingestion host for this build. */
export function postHogApiHost(): string {
  const configured =
    typeof import.meta !== "undefined"
      ? (import.meta.env?.["VITE_POSTHOG_API_HOST"] as string | undefined)
      : undefined;
  return resolvePostHogApiHost(configured);
}


let initialized = false;
/** Mirrors the capture state currently applied to the SDK. */
let captureSuspended = false;

const POSTHOG_EVENT_PROPERTY_ALLOWLIST: Readonly<Record<string, readonly string[]>> = {
  $pageview: ["$current_url", "$pathname"],
  affiliate_click: [
    "commercial_link_id",
    "merchant",
    "merchant_id",
    "category",
    "relationship",
    "source_path",
    "placement",
    "destination_host",
    "affiliate",
  ],
  merchant_click: [
    "commercial_link_id",
    "merchant",
    "merchant_id",
    "category",
    "relationship",
    "source_path",
    "placement",
    "destination_host",
    "affiliate",
  ],
  commercial_page_view: [
    "page_path",
    "source_path",
    "content_type",
    "content_slug",
    "commercial_surface",
  ],
  newsletter_signup: ["placement", "source", "interest", "source_path"],
  lead_magnet_download: [
    "asset_id",
    "asset_format",
    "placement",
    "source_path",
    "content_slug",
  ],
  internal_conversion_click: [
    "destination_slug",
    "destination_path",
    "intent",
    "placement",
    "source_path",
  ],
};

/**
 * Initializes PostHog at most once per session.
 *
 * Safe to call on every navigation: a session that starts on `/internal/*` or
 * `/api/*` loads nothing, and initializes lazily the first time it reaches a
 * public route (pass that route's path).
 */
export function initPostHog(path?: string): void {
  if (typeof window === "undefined" || initialized) return;
  // Production analytics only loads on the canonical public hosts, and never
  // on internal tooling routes. Preview/editor/localhost never initializes,
  // so no autocapture or session replay starts there either.
  if (!analyticsEnabled(path)) return;
  initialized = true;
  captureSuspended = false;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: postHogApiHost(),
      ui_host: POSTHOG_UI_HOST,

      // Pageviews are sent manually per SPA navigation with path-only URLs.
      capture_pageview: false,
      // Trust-preserving baseline: only the explicit, allowlisted events in
      // analytics.ts are retained. No DOM autocapture or session replay.
      capture_pageleave: false,
      autocapture: false,
      disable_session_recording: true,
    });
  } catch {
    // Analytics must never break the app.
  }
}


/**
 * Applies the per-route capture policy after every SPA navigation.
 *
 * PostHog may already be running because the session started on a public
 * production page. Client-side navigation into `/internal/*` or `/api/*` must
 * Automatic capture, page-leave capture, and session recording stay disabled
 * everywhere; this route gate only suspends explicit capture on blocked paths.
 *
 * Uses `set_config` + `stopSessionRecording`/`startSessionRecording`, both
 * supported by the installed posthog-js. Deliberately **not** `opt_out_capturing`,
 * which persists an opt-out across sessions.
 */
export function syncPostHogRoutePolicy(path?: string): void {
  if (typeof window === "undefined" || !initialized) return;
  const allowed = analyticsEnabled(path);
  if (allowed === !captureSuspended) return;
  captureSuspended = !allowed;
  try {
    posthog.set_config({
      autocapture: false,
      capture_pageleave: false,
      capture_pageview: false,
    });
    posthog.stopSessionRecording();
  } catch {
    // Analytics must never break navigation.
  }
}

/** Test-only reset of module state. */
export function resetPostHogStateForTests(): void {
  initialized = false;
  captureSuspended = false;
}

/** Path-only current location, safe on the server. */
function currentPath(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.pathname;
}


/** Generic custom-event helper. Undefined properties are dropped. */
export function captureEvent(
  name: string,
  properties: Record<string, string | number | boolean | undefined> = {},
): void {
  if (typeof window === "undefined" || !initialized) return;
  if (!analyticsEnabled()) return;
  const allowedProperties = POSTHOG_EVENT_PROPERTY_ALLOWLIST[name];
  if (!allowedProperties) return;
  const allowed = new Set(allowedProperties);
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (allowed.has(key) && value !== undefined && value !== "") clean[key] = value;
  }
  try {
    posthog.capture(name, clean);
  } catch {
    // Never block a click, navigation, or signup.
  }
}

/** Manual SPA pageview — path only, never the full URL. */
export function capturePostHogPageView(path?: string): void {
  if (typeof window === "undefined") return;
  if (!analyticsEnabled(path)) return;
  // Query strings and hashes are stripped: mailbox tokens
  // (/newsletter/unsubscribe?t=...) must never reach PostHog.
  const raw = path ?? currentPath();
  const pathname = raw ? ((raw.split("#")[0] ?? "").split("?")[0] || "/") : undefined;
  captureEvent("$pageview", {
    $current_url:
      pathname && typeof window !== "undefined"
        ? `${window.location.origin}${pathname}`
        : undefined,
    $pathname: pathname,
  });
}
