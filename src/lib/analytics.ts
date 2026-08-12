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

export const ANALYTICS_EVENTS = {
  affiliateClick: "affiliate_click",
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

export function trackEvent(name: string, params: GtagParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, clean(params));
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

export function trackAffiliateClick(params: {
  linkUrl: string;
  linkText?: string;
  merchant?: string;
  placement?: string;
  linkType?: "affiliate" | "direct_seller";
  contentType?: CommercialContentType;
  contentSlug?: string;
}): void {
  const path = currentPagePath();
  trackEvent(ANALYTICS_EVENTS.affiliateClick, {
    link_url: params.linkUrl,
    link_text: params.linkText,
    merchant: params.merchant ?? merchantFromUrl(params.linkUrl),
    placement: params.placement,
    link_type: params.linkType ?? "affiliate",
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
