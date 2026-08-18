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

import {
  MERCHANTS,
  US_WELLNESS_DUCK_FAT_URL,
  isMonetized,
  isUsableUrl,
  type Merchant,
} from "./affiliates";
import { amazonCategoryUrl, type AmazonCategoryId } from "./amazon";

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
  | "roasting_pan"
  | "sheet_pan"
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
  /** Useful, non-hype CTA label. Never promotional ("best deal", "cheapest"). */
  ctaLabel?: string;
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
  // A declined application is checked before the pending states so a rejected
  // program can never render as pending, and never as an affiliate link.
  if (merchant.status === "declined") return "direct";
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
  ctaLabel?: string;
  /**
   * Explicit destination, used only where a merchant has no single canonical
   * URL (Amazon category Special Links). Built centrally — never hand-written.
   */
  url?: string;
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
    ctaLabel: "See current duck options",
  },
  {
    /**
     * US Wellness is monetized for rendered duck fat ONLY. Their live duck
     * collection (reviewed 2026-08-18) does not list whole duck, breast or leg
     * quarters, so there is deliberately no US Wellness duck_source row.
     */
    id: "us-wellness-duck-fat",
    merchantId: "us-wellness-meats",
    category: "duck_fat",
    url: US_WELLNESS_DUCK_FAT_URL,
    useFor:
      "Rendered duck fat by the quart — the practical format when you want a tub rather than an hour of rendering.",
    ctaLabel: "Check current duck fat",
  },
  {
    id: "thermoworks-thermometer",
    merchantId: "thermoworks",
    category: "thermometer",
    useFor:
      "Fast-read instant thermometers for pulling duck breast at a target internal temperature.",
  },
];


/**
 * Amazon equipment categories. Destinations are built by `amazonCategoryUrl`, so
 * the Associates tag lives in exactly one place. No named-product claims, no
 * prices, no ratings. Duck meat is deliberately absent from this list.
 */
const AMAZON_SEEDS: SeedRow[] = (
  [
    ["amazon-cast-iron-skillet", "pan", "Cast-iron skillets, for the steadiest render and the most even crisp."],
    ["amazon-carbon-steel-skillet", "pan", "Carbon-steel skillets, for a fast-responding pan that still builds fond."],
    ["amazon-stainless-clad-skillet", "pan", "Stainless-clad skillets, for searing and deglazing an acidic pan sauce in the same pan."],
    ["amazon-roasting-pan-rack", "roasting_pan", "Roasting pans sold with a rack, for a whole bird lifted clear of its own fat."],
    ["amazon-sheet-pan-rack", "sheet_pan", "Rimmed sheet pans and oven-safe wire racks, the cheaper route to the same lifted setup."],
    ["amazon-instant-read-thermometer", "thermometer", "Instant-read thermometers, for spot-checking duck breast as it approaches your target."],
    ["amazon-leave-in-probe-thermometer", "thermometer", "Leave-in probe thermometers, for tracking a whole roast without opening the oven."],
    ["amazon-utility-knife", "knife", "Petty and utility knives, the size range that suits scoring duck skin."],
    ["amazon-boning-knife", "knife", "Boning knives, for jointing a whole duck and lifting breasts off the bone."],
  ] as [AmazonCategoryId, CommercialCategory, string][]
).map(([id, category, useFor]) => ({
  id,
  merchantId: "amazon",
  category,
  useFor,
  ctaLabel: "Browse this category on Amazon",
  url: amazonCategoryUrl(id),
}));

export const COMMERCIAL_LINKS: CommercialLinkEntry[] = [...SEEDS, ...AMAZON_SEEDS].flatMap((seed) => {
  const merchant = MERCHANTS.find((m) => m.id === seed.merchantId);
  if (!merchant) return [];
  const url = seed.url && isMonetized(merchant) ? seed.url : destinationForMerchant(merchant);
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
      ...(seed.ctaLabel ? { ctaLabel: seed.ctaLabel } : {}),
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
    // Duck meat only. US Wellness is deliberately absent: their live collection
    // does not list whole duck, breast or leg quarters.
    path: "/buy/where-to-buy-duck-online",
    placement: "buy_duck_primary_options",
    linkIds: ["dartagnan-duck"],
  },
  {
    // Separate, accurate note: the US Wellness duck link is for rendered fat.
    path: "/buy/where-to-buy-duck-online",
    placement: "duck_fat_specialty_note",
    linkIds: ["us-wellness-duck-fat"],
  },
  {
    // Primary US Wellness monetization path on the site.
    path: "/buy/duck-fat-buying-guide",
    placement: "duck_fat_sources",
    linkIds: ["us-wellness-duck-fat", "dartagnan-duck"],
  },
  {
    path: "/buy/how-to-choose-duck",
    placement: "choose_duck_sources",
    linkIds: ["dartagnan-duck"],
  },
  {
    // Generic recipe sourcing is duck meat. The duck-fat link is added only for
    // recipes whose ingredients genuinely call for rendered duck fat.
    path: "/recipes/$slug",
    placement: "recipe_sourcing",
    linkIds: ["dartagnan-duck", "us-wellness-duck-fat"],
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
  {
    path: "/gear/best-pan-for-duck-breast",
    placement: "pan_category_options",
    linkIds: [
      "amazon-cast-iron-skillet",
      "amazon-carbon-steel-skillet",
      "amazon-stainless-clad-skillet",
    ],
  },
  {
    path: "/gear/best-roasting-pan-for-duck",
    placement: "roasting_setup_options",
    linkIds: ["amazon-roasting-pan-rack", "amazon-sheet-pan-rack"],
  },
  {
    path: "/gear/best-thermometer-for-duck",
    placement: "thermometer_options",
    linkIds: ["amazon-instant-read-thermometer", "amazon-leave-in-probe-thermometer"],
  },
  {
    path: "/gear/best-knife-for-scoring-duck",
    placement: "knife_options",
    linkIds: ["amazon-utility-knife", "amazon-boning-knife"],
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

  // Merchant destinations that exist in the codebase but were never registered
  // here would be rendered outside the disclosure/rel/tracking system.
  for (const merchant of MERCHANTS) {
    const url = destinationForMerchant(merchant);
    if (!url) continue;
    if (!links.some((l) => l.merchantId === merchant.id)) {
      issues.push({
        severity: "warning",
        code: "unregistered_merchant_destination",
        detail: `${merchant.name} has a destination in src/data/affiliates.ts with no commercial-link entry.`,
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
