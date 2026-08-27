/**
 * Pure event builders for the three first-class engagement events added in
 * DEL-8: `commercial_page_view`, `lead_magnet_download` and
 * `outbound_social_click`.
 *
 * Everything here is browser-independent so payload shapes are unit-testable
 * and auditable. Each builder returns a fixed parameter set drawn from a strict
 * allowlist — there is no pass-through of caller-supplied parameter bags, so a
 * payload cannot grow an email address, subscriber id, mailbox token, full URL,
 * or query string. Paths are normalized through `safePath` (query string and
 * hash removed) before they reach any parameter.
 *
 * These events are additive. `merchant_click` and `affiliate_click` semantics
 * in `@/lib/commercial-events` are untouched: direct and affiliate-pending
 * destinations keep emitting `merchant_click`, and `affiliate_click` stays
 * reserved for a genuinely active tracking URL.
 */

export const ENGAGEMENT_EVENTS = {
  commercialPageView: "commercial_page_view",
  leadMagnetDownload: "lead_magnet_download",
  outboundSocialClick: "outbound_social_click",
} as const;

export type EngagementEventName =
  (typeof ENGAGEMENT_EVENTS)[keyof typeof ENGAGEMENT_EVENTS];

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

/** Path only — query strings and hashes are dropped before analytics. */
export function safePath(pathLike: string | undefined): string {
  if (!pathLike) return "(unknown)";
  const withoutHash = pathLike.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  return withoutQuery === "" ? "/" : withoutQuery;
}

/** Trailing path segment, used as the stable content slug. */
export function slugForPath(pathLike: string | undefined): string {
  const path = safePath(pathLike);
  if (path === "(unknown)") return "(unknown)";
  const parts = path.split("/").filter(Boolean);
  return parts.length ? (parts[parts.length - 1] as string) : "home";
}

/** Host only — never the path or query string of an outbound destination. */
export function hostForUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "(invalid)";
  }
}

/* ------------------------------------------------------------------ *
 * commercial_page_view
 * ------------------------------------------------------------------ */

/**
 * Content classification of a commercial route. Mirrors the coarse buckets
 * already used by outbound-click reporting so the two can be joined in GA4.
 */
export type CommercialContentType = "buy_duck" | "gear" | "ingredients";

/** Commercial surface a route belongs to. Stable, human-readable in GA4. */
export type CommercialSurface = "buying_guides" | "gear_guides" | "ingredient_guides";

const COMMERCIAL_ROUTE_PREFIXES: ReadonlyArray<{
  prefix: string;
  contentType: CommercialContentType;
  surface: CommercialSurface;
}> = [
  { prefix: "/buy", contentType: "buy_duck", surface: "buying_guides" },
  { prefix: "/gear", contentType: "gear", surface: "gear_guides" },
  { prefix: "/ingredients", contentType: "ingredients", surface: "ingredient_guides" },
];

export interface CommercialRouteClassification {
  contentType: CommercialContentType;
  surface: CommercialSurface;
}

/**
 * Classify a route as a commercial page, or return `null`.
 *
 * `null` means no `commercial_page_view` is emitted at all — editorial,
 * tool, legal, search and internal routes are never counted as commercial.
 */
export function classifyCommercialRoute(
  pathLike: string | undefined,
): CommercialRouteClassification | null {
  const path = safePath(pathLike);
  if (path === "(unknown)") return null;
  if (path.startsWith("/internal")) return null;
  for (const entry of COMMERCIAL_ROUTE_PREFIXES) {
    if (path === entry.prefix || path.startsWith(`${entry.prefix}/`)) {
      return { contentType: entry.contentType, surface: entry.surface };
    }
  }
  return null;
}

export function isCommercialRoute(pathLike: string | undefined): boolean {
  return classifyCommercialRoute(pathLike) !== null;
}

/** The only parameters allowed on `commercial_page_view`. */
export const COMMERCIAL_PAGE_VIEW_PARAMS = [
  "page_path",
  "source_path",
  "content_type",
  "content_slug",
  "commercial_surface",
] as const;

export interface CommercialPageViewEvent {
  name: typeof ENGAGEMENT_EVENTS.commercialPageView;
  params: {
    page_path: string;
    source_path: string;
    content_type: CommercialContentType;
    content_slug: string;
    commercial_surface: CommercialSurface;
  };
}

/** Returns `null` for non-commercial routes so callers can stay unconditional. */
export function buildCommercialPageViewEvent(input: {
  path: string | undefined;
}): CommercialPageViewEvent | null {
  const classification = classifyCommercialRoute(input.path);
  if (!classification) return null;
  const path = safePath(input.path);
  return {
    name: ENGAGEMENT_EVENTS.commercialPageView,
    params: {
      page_path: path,
      source_path: path,
      content_type: classification.contentType,
      content_slug: slugForPath(path),
      commercial_surface: classification.surface,
    },
  };
}

/* ------------------------------------------------------------------ *
 * lead_magnet_download
 * ------------------------------------------------------------------ */

/**
 * The only parameters allowed on `lead_magnet_download`.
 *
 * `lead_magnet_name` / `_version` / `_pages` were added additively when the
 * public asset became the 28-page playbook. The event name and `asset_id` are
 * deliberately unchanged so historical reporting still lines up.
 */
export const LEAD_MAGNET_DOWNLOAD_PARAMS = [
  "asset_id",
  "asset_format",
  "placement",
  "source_path",
  "content_slug",
  "lead_magnet_name",
  "lead_magnet_version",
  "lead_magnet_pages",
] as const;

export interface LeadMagnetDownloadEvent {
  name: typeof ENGAGEMENT_EVENTS.leadMagnetDownload;
  params: {
    asset_id: string;
    asset_format: string;
    placement: string;
    source_path: string;
    content_slug: string;
    lead_magnet_name: string;
    lead_magnet_version: number;
    lead_magnet_pages: number;
  };
}

/** File extension of the asset path, lower-cased. No path, no query string. */
export function assetFormatForPath(assetPath: string): string {
  const clean = safePath(assetPath);
  const last = clean.split("/").filter(Boolean).pop() ?? "";
  const dot = last.lastIndexOf(".");
  return dot > 0 ? last.slice(dot + 1).toLowerCase() : "file";
}

export function buildLeadMagnetDownloadEvent(input: {
  assetId: string;
  assetPath: string;
  placement: string;
  sourcePath?: string | undefined;
}): LeadMagnetDownloadEvent {
  const source = safePath(input.sourcePath);
  return {
    name: ENGAGEMENT_EVENTS.leadMagnetDownload,
    params: {
      asset_id: input.assetId,
      asset_format: assetFormatForPath(input.assetPath),
      placement: input.placement,
      source_path: source,
      content_slug: slugForPath(source),
      lead_magnet_name: LEAD_MAGNET_META.name,
      lead_magnet_version: LEAD_MAGNET_META.version,
      lead_magnet_pages: LEAD_MAGNET_META.pages,
    },
  };
}

/* ------------------------------------------------------------------ *
 * outbound_social_click
 * ------------------------------------------------------------------ */

/** The only parameters allowed on `outbound_social_click`. */
export const OUTBOUND_SOCIAL_CLICK_PARAMS = [
  "platform",
  "placement",
  "destination_host",
  "source_path",
] as const;

export interface OutboundSocialClickEvent {
  name: typeof ENGAGEMENT_EVENTS.outboundSocialClick;
  params: {
    platform: string;
    placement: string;
    destination_host: string;
    source_path: string;
  };
}

export function buildOutboundSocialClickEvent(input: {
  platform: string;
  url: string;
  placement: string;
  sourcePath?: string | undefined;
}): OutboundSocialClickEvent {
  return {
    name: ENGAGEMENT_EVENTS.outboundSocialClick,
    params: {
      platform: input.platform,
      placement: input.placement,
      destination_host: hostForUrl(input.url),
      source_path: safePath(input.sourcePath),
    },
  };
}
