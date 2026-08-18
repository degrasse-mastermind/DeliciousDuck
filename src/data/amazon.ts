/**
 * Amazon Associates Special Link construction — single source of truth.
 *
 * Rules (do not relax):
 * - Every Amazon destination the site renders is built here, so the Associates
 *   tag is never hardcoded on a page.
 * - Only relevant search/category destinations are used. No named product
 *   claims, no prices, no ratings or review counts (Amazon customer reviews may
 *   only be shown through an approved Amazon API, which we do not use).
 * - Amazon Special Links are website-only. They must never be placed in email,
 *   newsletters, downloadable PDFs, or SMS.
 * - Duck meat sourcing is deliberately NOT an Amazon category; that belongs to
 *   the meat sellers in `src/data/affiliates.ts`.
 */

/** Assigned Amazon Associates tracking ID. */
export const AMAZON_TAG = "deliciousduck-20";

export const AMAZON_HOST = "www.amazon.com";

/**
 * A relevant Amazon search destination carrying the Associates tag exactly once.
 * Keywords describe an equipment category, never a specific product claim.
 */
export function amazonSearchUrl(keywords: string): string {
  const url = new URL("https://www.amazon.com/s");
  url.searchParams.set("k", keywords.trim());
  url.searchParams.set("tag", AMAZON_TAG);
  return url.toString();
}

/** True when a URL is an Amazon destination carrying our tag exactly once. */
export function isTaggedAmazonUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (!parsed.hostname.endsWith("amazon.com")) return false;
  const tags = parsed.searchParams.getAll("tag");
  return tags.length === 1 && tags[0] === AMAZON_TAG;
}

/** The exact statement Amazon requires the site to display. */
export const AMAZON_REQUIRED_STATEMENT =
  "As an Amazon Associate I earn from qualifying purchases.";

/** Equipment intent categories we link. Keyed by stable commercial-link id. */
export const AMAZON_CATEGORIES = {
  "amazon-cast-iron-skillet": "cast iron skillet 10 inch",
  "amazon-carbon-steel-skillet": "carbon steel skillet 11 inch",
  "amazon-stainless-clad-skillet": "stainless clad skillet 12 inch",
  "amazon-roasting-pan-rack": "roasting pan with rack",
  "amazon-sheet-pan-rack": "rimmed baking sheet with oven safe wire rack",
  "amazon-instant-read-thermometer": "instant read digital thermometer cooking",
  "amazon-leave-in-probe-thermometer": "leave in probe thermometer oven",
  "amazon-utility-knife": "petty utility kitchen knife",
  "amazon-boning-knife": "boning knife",
} as const;

export type AmazonCategoryId = keyof typeof AMAZON_CATEGORIES;

export function amazonCategoryUrl(id: AmazonCategoryId): string {
  return amazonSearchUrl(AMAZON_CATEGORIES[id]);
}
