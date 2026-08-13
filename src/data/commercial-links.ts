/**
 * Centralized commercial-link registry.
 *
 * Every outbound merchant/product destination the site renders must exist here
 * with a stable id. Pages reference ids only — never raw URLs — so relationship
 * state, disclosure wording, `rel` behaviour and analytics stay consistent.
 *
 * Hard rules (do not relax):
 * - Destinations are seeded ONLY from URLs already present and verifiable in the
 *   codebase (today: the merchant registry in `src/data/affiliates.ts`).
 * - Relationship state is DERIVED from that merchant registry, never asserted
 *   here. A pending application can never render as an affiliate link.
 * - No prices, ratings, discounts, commission rates, or invented tracking
 *   parameters live in this file, and none may be added.
 */

import { MERCHANTS, isMonetized, isUsableUrl, type Merchant } from "./affiliates";

/**
 * Commercial relationship for a destination.
 * - `direct`            plain merchant link, no program, no tracking.
 * - `affiliate_pending` application filed; the link stays a plain direct link.
 * - `affiliate_active`  approved AND a real tracking URL exists in the registry.
 * - `owned`             a DeliciousDuck-owned destination (first-party product).
 */
export type CommercialRelationship =
  | "direct"
  | "affiliate_pending"
  | "affiliate_active"
  | "owned";

export type CommercialCategory =
  | "duck_source"
  | "duck_fat"
  | "thermometer"
  | "pan"
  | "knife"
  | "owned_product";

export interface CommercialLinkEntry {
  /** Stable id. Referenced by pages and by analytics. Never renamed casually. */
  id: string;
  /** Consumer-facing merchant name. */
  merchant: string;
  /** Row in `src/data/affiliates.ts` that governs relationship state, if any. */
  merchantId?: string;
  /** Absolute destination. Must be an http(s) URL that exists in the codebase. */
  url: string;
  category: CommercialCategory;
  relationship: CommercialRelationship;
  /** Short, accurate, visitor-facing relationship label. */
  disclosureLabel: string;
  /** YYYY-MM(-DD) the destination and relationship were last reviewed. */
  lastVerified: string;
  /** What this destination is useful for, in editorial terms. */
  useFor: string;
}

/** Visitor-facing disclosure labels. Accurate for each state, never aspirational. */
export const DISCLOSURE_LABELS: Record<CommercialRelationship, string> = {
  direct: "Direct link — we earn nothing",
  affiliate_pending: "Direct link — we earn nothing",
  affiliate_active: "Affiliate link — we may earn a commission",
  owned: "Our own resource",
};

/** Relationship derived from the merchant registry. Fail-safe: `direct`. */
export function relationshipForMerchant(merchant?: Merchant): CommercialRelationship {
  if (!merchant) return "direct";
  if (isMonetized(merchant)) return "affiliate_active";
  if (merchant.status === "applied" || merchant.status === "approved-no-link") {
    return "affiliate_pending";
  }
  return "direct";
}

/** Resolved destination for a merchant row: tracking URL only when monetized. */
function destinationForMerchant(merchant: Merchant): string | undefined {
  if (isMonetized(merchant) && isUsableUrl(merchant.affiliateUrl)) return merchant.affiliateUrl;
  return isUsableUrl(merchant.directUrl) ? merchant.directUrl : undefined;
}

interface SeedRow {
  id: string;
  merchantId: string;
  category: CommercialCategory;
  useFor: string;
}

/**
 * Seeds. One row per merchant destination already present in the codebase.
 * No new merchants, programs, or URLs may be invented here.
 */
const SEEDS: SeedRow[] = [
  {
    id: "dartagnan-duck",
    merchantId: "dartagnan",
    category: "duck_source",
    useFor:
      "Whole ducks, breasts, legs and rendered duck fat from a specialty butcher that ships nationally.",
  },
  {
    id: "us-wellness-meats-duck",
    merchantId: "us-wellness-meats",
    category: "duck_source",
    useFor: "Frozen duck cuts and duck fat alongside other pasture-raised meat orders.",
  },
  {
    id: "thermoworks-thermometer",
    merchantId: "thermoworks",
    category: "thermometer",
    useFor:
      "Fast-read instant thermometers for pulling duck breast at a target internal temperature.",
  },
];

export const COMMERCIAL_LINKS: CommercialLinkEntry[] = SEEDS.flatMap((seed) => {
  const merchant = MERCHANTS.find((m) => m.id === seed.merchantId);
  if (!merchant) return [];
  const url = destinationForMerchant(merchant);
  if (!url) return [];
  const relationship = relationshipForMerchant(merchant);
  return [
    {
      id: seed.id,
      merchant: merchant.name,
      merchantId: merchant.id,
      url,
      category: seed.category,
      relationship,
      disclosureLabel: DISCLOSURE_LABELS[relationship],
      lastVerified: merchant.lastCheckedDate ?? merchant.statusReviewed,
      useFor: seed.useFor,
    },
  ];
});

export function commercialLinkById(id: string): CommercialLinkEntry | undefined {
  return COMMERCIAL_LINKS.find((l) => l.id === id);
}

export function commercialLinksByCategory(category: CommercialCategory): CommercialLinkEntry[] {
  return COMMERCIAL_LINKS.filter((l) => l.category === category);
}

/** True only for genuinely monetized destinations. */
export function isAffiliateActive(link: CommercialLinkEntry): boolean {
  return link.relationship === "affiliate_active";
}

/**
 * `rel` policy:
 * - active affiliate → "sponsored nofollow noopener"
 * - everything else  → "noopener"
 */
export function relForLink(link: CommercialLinkEntry): string {
  return isAffiliateActive(link) ? "sponsored nofollow noopener" : "noopener";
}

/** Host of the destination, for display and analytics. Never the query string. */
export function destinationHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ *
 * Placements — where each id is rendered, for QA and internal linking
 * ------------------------------------------------------------------ */

export interface CommercialPlacement {
  /** Site path the module appears on. */
  path: string;
  /** Stable placement slug, also sent to analytics. */
  placement: string;
  linkIds: string[];
}

export const COMMERCIAL_PLACEMENTS: CommercialPlacement[] = [
  {
    path: "/buy/where-to-buy-duck-online",
    placement: "buy_duck_options",
    linkIds: ["dartagnan-duck", "us-wellness-meats-duck"],
  },
  {
    path: "/cook/how-to-cook-duck-breast",
    placement: "duck_breast_next_steps",
    linkIds: ["dartagnan-duck", "thermoworks-thermometer"],
  },
  {
    path: "/learn/duck-breast-temperature-doneness",
    placement: "temperature_gear",
    linkIds: ["thermoworks-thermometer"],
  },
  {
    path: "/learn/why-duck-skin-isnt-crispy",
    placement: "crisp_skin_gear",
    linkIds: ["thermoworks-thermometer"],
  },
];

export function placementsForLink(id: string): CommercialPlacement[] {
  return COMMERCIAL_PLACEMENTS.filter((p) => p.linkIds.includes(id));
}

/* ------------------------------------------------------------------ *
 * Audit — powers the internal QA route and the test suite
 * ------------------------------------------------------------------ */

export type AuditSeverity = "error" | "warning";

export interface AuditIssue {
  severity: AuditSeverity;
  linkId?: string;
  code: string;
  detail: string;
}

/** Verification older than this many months is considered stale. */
export const STALE_AFTER_MONTHS = 6;

function monthsSince(value: string, now: Date): number | undefined {
  const match = /^(\d{4})-(\d{2})/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return (now.getUTCFullYear() - year) * 12 + (now.getUTCMonth() + 1 - month);
}

export function auditCommercialLinks(
  links: CommercialLinkEntry[] = COMMERCIAL_LINKS,
  now: Date = new Date(),
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const seen = new Set<string>();

  for (const link of links) {
    if (seen.has(link.id)) {
      issues.push({
        severity: "error",
        linkId: link.id,
        code: "duplicate_id",
        detail: "Two registry rows share this id.",
      });
    }
    seen.add(link.id);

    if (!link.url) {
      issues.push({
        severity: "error",
        linkId: link.id,
        code: "missing_url",
        detail: "No destination configured.",
      });
    } else {
      let parsed: URL | undefined;
      try {
        parsed = new URL(link.url);
      } catch {
        parsed = undefined;
      }
      if (!parsed) {
        issues.push({
          severity: "error",
          linkId: link.id,
          code: "unparseable_url",
          detail: "Destination is not an absolute URL.",
        });
      } else {
        if (parsed.protocol !== "https:") {
          issues.push({
            severity: parsed.protocol === "http:" ? "warning" : "error",
            linkId: link.id,
            code: "unsafe_protocol",
            detail: `Protocol ${parsed.protocol} is not https:.`,
          });
        }
        if (parsed.search !== "" && link.relationship !== "affiliate_active") {
          issues.push({
            severity: "warning",
            linkId: link.id,
            code: "unexpected_query",
            detail:
              "Non-affiliate destination carries query parameters. Confirm they are not tracking.",
          });
        }
      }
    }

    if (link.relationship === "affiliate_active") {
      const rel = relForLink(link);
      if (!rel.includes("sponsored") || !rel.includes("nofollow")) {
        issues.push({
          severity: "error",
          linkId: link.id,
          code: "missing_sponsored_rel",
          detail: 'Affiliate-active link must use rel="sponsored nofollow noopener".',
        });
      }
      const merchant = MERCHANTS.find((m) => m.id === link.merchantId);
      if (link.merchantId && !isMonetized(merchant)) {
        issues.push({
          severity: "error",
          linkId: link.id,
          code: "unbacked_affiliate_status",
          detail: "Marked affiliate_active but the merchant registry is not active with a URL.",
        });
      }
    }

    if (link.disclosureLabel !== DISCLOSURE_LABELS[link.relationship]) {
      issues.push({
        severity: "error",
        linkId: link.id,
        code: "disclosure_mismatch",
        detail: "Disclosure label does not match the relationship state.",
      });
    }

    const age = monthsSince(link.lastVerified, now);
    if (age === undefined) {
      issues.push({
        severity: "warning",
        linkId: link.id,
        code: "unparseable_verified_date",
        detail: "lastVerified is not YYYY-MM(-DD).",
      });
    } else if (age > STALE_AFTER_MONTHS) {
      issues.push({
        severity: "warning",
        linkId: link.id,
        code: "stale_verification",
        detail: `Last verified ${age} months ago.`,
      });
    }

    if (placementsForLink(link.id).length === 0) {
      issues.push({
        severity: "warning",
        linkId: link.id,
        code: "no_placement",
        detail: "Registered but not placed on any page.",
      });
    }
  }

  for (const placement of COMMERCIAL_PLACEMENTS) {
    for (const id of placement.linkIds) {
      if (!links.some((l) => l.id === id)) {
        issues.push({
          severity: "error",
          linkId: id,
          code: "unknown_placement_id",
          detail: `Placement ${placement.placement} references an unregistered id.`,
        });
      }
    }
  }

  return issues;
}

/** Hosts the registry legitimately owns, for spotting unregistered links. */
export const REGISTERED_HOSTS = Array.from(
  new Set(COMMERCIAL_LINKS.map((l) => destinationHost(l.url)).filter(Boolean)),
);
