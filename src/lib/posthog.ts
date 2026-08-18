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
/** PostHog Cloud US ingestion host. */
export const POSTHOG_HOST = "https://us.i.posthog.com";

let initialized = false;
/** Mirrors the capture state currently applied to the SDK. */
let captureSuspended = false;

export function initPostHog(): void {
  if (typeof window === "undefined" || initialized) return;
  // Production analytics only loads on the canonical public hosts, and never
  // on internal tooling routes. Preview/editor/localhost never initializes,
  // so no autocapture or session replay starts there either.
  if (!analyticsEnabled()) return;
  initialized = true;
  captureSuspended = false;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Pageviews are sent manually per SPA navigation with path-only URLs.
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
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
 * silence automatic capture, page-leave capture, and session recording for as
 * long as the reader stays there — and restore them when the same session
 * navigates back to a public route.
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
      autocapture: allowed,
      capture_pageleave: allowed,
      capture_pageview: false,
    });
    if (allowed) posthog.startSessionRecording();
    else posthog.stopSessionRecording();
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
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined && value !== "") clean[key] = value;
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
