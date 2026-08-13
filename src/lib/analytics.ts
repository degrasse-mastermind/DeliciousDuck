/**
 * Thin, browser-safe wrapper around the global gtag.js tag installed once in
 * `src/routes/__root.tsx` (GA4, G-E15CFY209D).
 *
 * Every helper here no-ops when there is no browser or no `window.gtag`
 * (SSR, prerender, ad-blockers), so call sites never need to guard.
 * Event names are stable snake_case and defined in one place.
 */

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Single source of truth for the GA4 property. */
export const GA_MEASUREMENT_ID = "G-E15CFY209D";

export const ANALYTICS_EVENTS = {
  affiliateClick: "affiliate_click",
  newsletterIntent: "newsletter_intent",
  newsletterSignup: "newsletter_signup",
  calculatorComplete: "calculator_complete",
  starterGuideView: "starter_guide_view",
  starterGuidePrint: "starter_guide_print",
} as const;

/** Current path, safe on the server. */
export function currentPagePath(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.pathname;
}

/** Drop undefined values so GA never receives empty parameters. */
function clean(params: GtagParams): GtagParams {
  const out: GtagParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") out[key] = value;
  }
  return out;
}

/**
 * Make sure a `gtag` queue exists before we push.
 *
 * gtag.js loads async, so a fast click can happen before the library is ready.
 * The standard snippet's stub pushes into `window.dataLayer`, which gtag.js
 * replays once it loads — so recreating the stub here means no event is lost
 * even if the inline snippet has not run yet.
 */
function ensureGtag(): ((...args: unknown[]) => void) | undefined {
  if (typeof window === "undefined") return undefined;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtagStub(...args: unknown[]) {
      // gtag.js slices whatever array-like it finds in the queue, so an args
      // array is replayed the same way the official snippet's `arguments` is —
      // and unlike `arguments`, it survives rest-parameter transpilation.
      window.dataLayer!.push(args as unknown as IArguments);
    };
  }
  return window.gtag;
}

/** Opt into GA4 DebugView with `?ga_debug=1` — no PII, no persistence. */
function debugFlag(): GtagParams {
  if (typeof window === "undefined") return {};
  return window.location.search.includes("ga_debug=1") ? { debug_mode: true } : {};
}

export function trackEvent(name: string, params: GtagParams = {}): void {
  const gtag = ensureGtag();
  if (!gtag) return;
  gtag("event", name, {
    send_to: GA_MEASUREMENT_ID,
    // sendBeacon survives the page being backgrounded or unloaded by an
    // outbound click, which is exactly when affiliate events fire.
    transport_type: "beacon",
    ...debugFlag(),
    ...clean(params),
  });
}

/** SPA route change page view — gtag.js only auto-tracks the first load. */
export function trackPageView(path: string, title?: string): void {
  const gtag = ensureGtag();
  if (!gtag) return;
  gtag("event", "page_view", {
    send_to: GA_MEASUREMENT_ID,
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : undefined,
    page_title: title,
    ...debugFlag(),
  });
}

/** Content classification for commercial events — parameters, not new event names. */
export type CommercialContentType = "buy_duck" | "gear" | "ingredients" | "editorial";

export function contentTypeFromPath(path = currentPagePath()): CommercialContentType {
  if (!path) return "editorial";
  if (path.startsWith("/buy")) return "buy_duck";
  if (path.startsWith("/gear")) return "gear";
  if (path.startsWith("/ingredients")) return "ingredients";
  return "editorial";
}

export function contentSlugFromPath(path = currentPagePath()): string | undefined {
  if (!path) return undefined;
  const parts = path.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "home";
}

/**
 * Dedupe window for outbound commercial clicks.
 *
 * A double-click, a keyboard activation that also fires a click, or a React
 * StrictMode re-invocation would otherwise inflate click counts. Same merchant,
 * placement, path and destination within this window counts once.
 */
const CLICK_DEDUPE_MS = 1500;
const recentClicks = new Map<string, number>();

function shouldSendClick(key: string): boolean {
  const now = Date.now();
  for (const [k, at] of recentClicks) {
    if (now - at > CLICK_DEDUPE_MS) recentClicks.delete(k);
  }
  const last = recentClicks.get(key);
  if (last !== undefined && now - last <= CLICK_DEDUPE_MS) return false;
  recentClicks.set(key, now);
  return true;
}

/**
 * Outbound commercial click.
 *
 * `affiliate` is true ONLY when the destination is a real affiliate tracking
 * URL. A plain merchant link reports `link_type: "direct_seller"` and
 * `affiliate: false`, so revenue reporting is never inflated by neutral links.
 * No PII: merchant, placement, path, destination kind and the affiliate boolean
 * only.
 */
export function trackAffiliateClick(params: {
  linkUrl: string;
  linkText?: string;
  merchant?: string;
  /** Registry id from src/data/affiliates.ts, when the row maps to a merchant. */
  merchantId?: string | undefined;
  placement?: string;
  linkType?: "affiliate" | "direct_seller";
  /** Where the click lands: a tracking link, or the merchant's own site. */
  destinationType?: "affiliate_tracking" | "merchant_direct";
  contentType?: CommercialContentType;
  contentSlug?: string;
}): void {
  const path = currentPagePath();
  const linkType = params.linkType ?? "affiliate";
  const isAffiliate = linkType === "affiliate";
  const destinationType =
    params.destinationType ?? (isAffiliate ? "affiliate_tracking" : "merchant_direct");

  const key = [
    params.merchantId ?? params.merchant ?? merchantFromUrl(params.linkUrl),
    params.placement,
    path,
    destinationType,
    params.linkUrl,
  ].join("|");
  if (!shouldSendClick(key)) return;

  trackEvent(ANALYTICS_EVENTS.affiliateClick, {
    link_url: params.linkUrl,
    link_text: params.linkText,
    merchant: params.merchant ?? merchantFromUrl(params.linkUrl),
    merchant_id: params.merchantId,
    merchant_domain: merchantFromUrl(params.linkUrl),
    placement: params.placement,
    link_type: linkType,
    destination_type: destinationType,
    affiliate: isAffiliate,
    content_type: params.contentType ?? contentTypeFromPath(path),
    content_slug: params.contentSlug ?? contentSlugFromPath(path),
    page_path: path,
  });
}

/** Hostname as a coarse merchant label — never a partnership claim. */
export function merchantFromUrl(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/**
 * Interaction with a signup surface. Intent, NOT a subscription conversion.
 *
 * No email address or any other PII is ever passed here — the parameters are a
 * placement label, a source label, the controlled interest enum, and the path.
 */
export function trackNewsletterIntent(params: {
  placement?: string;
  source?: string;
  interest?: string;
  listOpen: boolean;
}): void {
  const path = currentPagePath();
  if (!shouldSendClick(`intent|${params.placement}|${params.source}|${path}`)) return;
  trackEvent(ANALYTICS_EVENTS.newsletterIntent, {
    placement: params.placement,
    source: params.source,
    interest: params.interest,
    list_open: params.listOpen,
    page_path: path,
    source_path: path,
    content_slug: contentSlugFromPath(path),
  });
}

/**
 * Successful subscription only — fired after durable persistence resolves.
 * Never carries the email address or any other PII.
 */
export function trackNewsletterSignup(params: {
  placement?: string;
  source?: string;
  interest?: string;
}): void {
  const path = currentPagePath();
  if (!shouldSendClick(`signup|${params.placement}|${path}`)) return;
  trackEvent(ANALYTICS_EVENTS.newsletterSignup, {
    placement: params.placement,
    source: params.source,
    interest: params.interest,
    page_path: path,
    source_path: path,
    content_slug: contentSlugFromPath(path),
  });
}

/** Click inside the post-signup "Start here while you wait" module. No PII. */
export function trackNewsletterPostsignupClick(params: {
  placement?: string;
  interest?: string;
  linkUrl: string;
  linkText?: string;
}): void {
  const path = currentPagePath();
  if (!shouldSendClick(`postsignup|${params.linkUrl}|${path}`)) return;
  trackEvent(ANALYTICS_EVENTS.newsletterPostsignupClick, {
    placement: params.placement,
    interest: params.interest,
    link_url: params.linkUrl,
    link_text: params.linkText,
    page_path: path,
    source_path: path,
    content_slug: contentSlugFromPath(path),
  });
}

export function trackCalculatorComplete(params: {
  calculatorName: string;
  toolSlug: string;
  result?: GtagParams;
}): void {
  const path = currentPagePath();
  trackEvent(ANALYTICS_EVENTS.calculatorComplete, {
    calculator_name: params.calculatorName,
    tool_slug: params.toolSlug,
    page_path: path,
    ...clean(params.result ?? {}),
  });
}

/** Genuine page view of the first-party Starter Guide. No PII. */
export function trackStarterGuideView(params: { path: string }): void {
  trackEvent(ANALYTICS_EVENTS.starterGuideView, {
    page_path: params.path,
    content_slug: contentSlugFromPath(params.path),
  });
}

/** User invoked the print action on the Starter Guide quick reference. No PII. */
export function trackStarterGuidePrint(params: { path: string }): void {
  trackEvent(ANALYTICS_EVENTS.starterGuidePrint, {
    page_path: params.path,
    content_slug: contentSlugFromPath(params.path),
  });
}
