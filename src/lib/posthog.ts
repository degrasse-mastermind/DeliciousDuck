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

export const POSTHOG_KEY = "phc_nTL8XA9PoPBexJHqaP9nrrqUgNrhJbVM5M3kCudC9qA3";
/** PostHog Cloud US ingestion host. */
export const POSTHOG_HOST = "https://us.i.posthog.com";

let initialized = false;

export function initPostHog(): void {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Pageviews are sent manually per SPA navigation with path-only URLs.
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
made_no_op: undefined as never,
    } as Parameters<typeof posthog.init>[1]);
  } catch {
    // Analytics must never break the app.
  }
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
  const pathname = path ?? currentPath();
  captureEvent("$pageview", {
    $current_url:
      pathname && typeof window !== "undefined"
        ? `${window.location.origin}${pathname}`
        : undefined,
    $pathname: pathname,
  });
}
