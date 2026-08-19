/**
 * Outbound-commerce event construction.
 *
 * Pure and browser-independent so the payload shape is testable and auditable.
 *
 * Event convention:
 * - `affiliate_click` fires ONLY for `affiliate_active` destinations.
 * - `merchant_click` fires for direct and affiliate-pending merchant links.
 *
 * Privacy: parameters are limited to the stable, non-PII fields below. No email,
 * subscriber id, mailbox token, full destination URL, or query string is ever
 * included — only the destination host.
 */

import {
  destinationHost,
  isAffiliateActive,
  type CommercialLinkEntry,
  type CommercialRelationship,
} from "@/data/commercial-links";

export const COMMERCIAL_EVENTS = {
  affiliateClick: "affiliate_click",
  merchantClick: "merchant_click",
} as const;

export type CommercialEventName = (typeof COMMERCIAL_EVENTS)[keyof typeof COMMERCIAL_EVENTS];

/** The only parameters allowed on an outbound-commerce event. */
export const ALLOWED_EVENT_PARAMS = [
  "commercial_link_id",
  "merchant",
  "merchant_id",
  "category",
  "relationship",
  "source_path",
  "placement",
  "destination_host",
  "affiliate",
] as const;

export interface CommercialClickEvent {
  name: CommercialEventName;
  params: {
    commercial_link_id: string;
    merchant: string;
    /** Registry slug, e.g. "us-wellness-meats" — stable across name changes. */
    merchant_id: string;
    category: string;
    relationship: CommercialRelationship;
    source_path: string;
    placement: string;
    destination_host: string;
    affiliate: boolean;
  };
}

export function eventNameForRelationship(relationship: CommercialRelationship): CommercialEventName {
  return relationship === "affiliate_active"
    ? COMMERCIAL_EVENTS.affiliateClick
    : COMMERCIAL_EVENTS.merchantClick;
}

/** Path only — query strings and hashes are dropped before they reach analytics. */
export function safeSourcePath(pathLike: string | undefined): string {
  if (!pathLike) return "(unknown)";
  const withoutHash = pathLike.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  return withoutQuery === "" ? "/" : withoutQuery;
}

export function buildCommercialClickEvent(input: {
  link: CommercialLinkEntry;
  placement: string;
  sourcePath?: string | undefined;
}): CommercialClickEvent {
  const { link, placement } = input;
  return {
    name: isAffiliateActive(link)
      ? COMMERCIAL_EVENTS.affiliateClick
      : COMMERCIAL_EVENTS.merchantClick,
    params: {
      commercial_link_id: link.id,
      merchant: link.merchant,
      merchant_id: link.merchantId ?? "(unknown)",
      category: link.category,
      relationship: link.relationship,
      source_path: safeSourcePath(input.sourcePath),
      placement,
      destination_host: destinationHost(link.url),
      affiliate: isAffiliateActive(link),
    },
  };
}
