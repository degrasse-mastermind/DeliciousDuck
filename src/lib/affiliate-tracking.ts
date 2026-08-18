/**
 * Network-level affiliate click attribution.
 *
 * The registry in `src/data/commercial-links.ts` keeps canonical destinations.
 * At render time we decorate those destinations with the merchant network's own
 * sub-identifier parameter so clicks can be attributed to a specific page and
 * placement inside the affiliate dashboards — not just in GA4/PostHog.
 *
 * Rules (do not relax):
 * - Only documented, network-supported parameters are used:
 *   - Impact deep links (*.sjv.io): `subId1` (plus `sharedid` mirror).
 *   - Amazon Associates: `ascsubtag`.
 * - The Associates `tag` is never touched, duplicated, or removed.
 * - Values carry no PII: page path + placement id only, sanitized.
 * - Unknown hosts are returned unchanged — no invented parameters.
 */

const IMPACT_HOST_SUFFIX = ".sjv.io";
const MAX_TOKEN = 80;

/** Lowercase, dash-separated, network-safe token. */
export function trackingToken(sourcePath: string, placement: string): string {
  const raw = `${sourcePath}/${placement}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const token = raw === "" ? "site" : raw;
  return token.slice(0, MAX_TOKEN).replace(/-+$/, "");
}

export function isImpactUrl(url: URL): boolean {
  return url.hostname === "sjv.io" || url.hostname.endsWith(IMPACT_HOST_SUFFIX);
}

export function isAmazonUrl(url: URL): boolean {
  return url.hostname === "amazon.com" || url.hostname.endsWith(".amazon.com");
}

/**
 * Returns the destination with a network sub-id attached when the merchant
 * network supports one. Never throws: an unparseable URL is returned as-is.
 */
export function withAffiliateTracking(
  destination: string,
  input: { placement: string; sourcePath: string },
): string {
  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    return destination;
  }

  const token = trackingToken(input.sourcePath, input.placement);

  if (isImpactUrl(url)) {
    url.searchParams.set("subId1", token);
    url.searchParams.set("sharedid", token);
    return url.toString();
  }

  if (isAmazonUrl(url)) {
    url.searchParams.set("ascsubtag", token);
    return url.toString();
  }

  return destination;
}
