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
      // gtag.js reads the raw `arguments` object, so push args as-is.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments as unknown as IArguments);
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
 * Outbound commercial click.
 *
 * `affiliate` is true ONLY when the destination is a real affiliate tracking
 * URL. A plain merchant link reports `link_type: "direct_seller"` and
 * `affiliate: false`, so revenue reporting is never inflated by neutral links.
 */
export function trackAffiliateClick(params: {
  linkUrl: string;
  linkText?: string;
  merchant?: string;
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
  trackEvent(ANALYTICS_EVENTS.affiliateClick, {
    link_url: params.linkUrl,
    link_text: params.linkText,
    merchant: params.merchant ?? merchantFromUrl(params.linkUrl),
    merchant_domain: merchantFromUrl(params.linkUrl),
    placement: params.placement,
    link_type: linkType,
    destination_type:
      params.destinationType ?? (isAffiliate ? "affiliate_tracking" : "merchant_direct"),
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

/** Interaction with a signup surface. Intent, NOT a subscription conversion. */
export function trackNewsletterIntent(params: {
  placement?: string;
  source?: string;
  listOpen: boolean;
}): void {
  const path = currentPagePath();
  trackEvent(ANALYTICS_EVENTS.newsletterIntent, {
    placement: params.placement,
    source: params.source,
    list_open: params.listOpen,
    page_path: path,
    content_slug: contentSlugFromPath(path),
  });
}

/** Successful subscription only — fired after persistence resolves. */
export function trackNewsletterSignup(params: {
  placement?: string;
  source?: string;
}): void {
  const path = currentPagePath();
  trackEvent(ANALYTICS_EVENTS.newsletterSignup, {
    placement: params.placement,
    source: params.source,
    page_path: path,
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
