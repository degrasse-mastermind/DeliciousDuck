/**
 * Central affiliate/merchant registry.
 *
 * This is the ONLY place a merchant becomes monetized. To activate a program,
 * set `status: "active"` and paste the real tracking URL into `affiliateUrl`.
 * No page JSX needs to change.
 *
 * Status meanings (internal only — never rendered to visitors):
 * - "candidate"        We reference the merchant editorially. No application filed.
 * - "applied"          Application submitted, awaiting review. NOT monetized.
 * - "approved-no-link" Approved by the network, but no tracking URL configured yet.
 * - "active"           Approved AND a real tracking URL is present below.
 *
 * Hard rules:
 * - `affiliateUrl` must be a real tracking URL from the network. Never invent one.
 * - A merchant is only treated as monetized when status === "active" AND
 *   `affiliateUrl` is set. Anything else falls back to the plain, non-affiliate
 *   `directUrl`, or to no link at all.
 * - No prices, ratings, review counts, or commission rates live in this file.
 */

export type MerchantStatus = "candidate" | "applied" | "approved-no-link" | "active";

export interface Merchant {
  id: string;
  /** Consumer-facing merchant name. */
  name: string;
  /** Affiliate network or program name, for internal tracking only. */
  program?: string;
  status: MerchantStatus;
  /** Real network tracking URL. Only set once the program is genuinely active. */
  affiliateUrl?: string;
  /** Plain, non-affiliate brand/merchant URL. Safe to link with rel="nofollow". */
  directUrl?: string;
  /** YYYY-MM of the last time this row's status was reviewed. */
  statusReviewed: string;
  /** Internal note about what is still required to activate. */
  internalNote?: string;
}

export const MERCHANTS: Merchant[] = [
  {
    id: "us-wellness-meats",
    name: "US Wellness Meats",
    program: "Impact",
    status: "applied",
    directUrl: "https://grasslandbeef.com/",
    statusReviewed: "2026-08",
    internalNote:
      "Impact site verification meta tag is installed. Application is pending review. Do not set status to active until Impact issues an approved tracking URL; paste it into affiliateUrl at that point.",
  },
  {
    id: "dartagnan",
    name: "D'Artagnan",
    program: "Awin",
    status: "applied",
    directUrl: "https://www.dartagnan.com/",
    statusReviewed: "2026-08",
    internalNote:
      "Delicious Duck Awin publisher account is activated (publisher ID 3034797); D'Artagnan advertiser program application has been submitted and is pending approval.",
  },
  {
    id: "thermoworks",
    name: "ThermoWorks",
    status: "candidate",
    directUrl: "https://www.thermoworks.com/",
    statusReviewed: "2026-08",
    internalNote:
      "Referenced as a widely available instrument brand. No application filed, no affiliate relationship, no hands-on testing.",
  },
];

export function merchantById(id?: string): Merchant | undefined {
  if (!id) return undefined;
  return MERCHANTS.find((m) => m.id === id);
}

/** True only when the program is genuinely approved and a tracking URL exists. */
export function isMonetized(merchant?: Merchant): boolean {
  return Boolean(merchant && merchant.status === "active" && merchant.affiliateUrl);
}

export type CommerceLinkKind = "affiliate" | "direct" | "none";

export interface CommerceLink {
  kind: CommerceLinkKind;
  href?: string | undefined;
  merchantName?: string | undefined;
  /** Only true when `href` is a real affiliate tracking URL. */
  isAffiliate: boolean;
}

/**
 * Resolve the single legitimate destination for a commercial row.
 *
 * Row-level `affiliateUrl` is honoured for one-off links, but the registry
 * wins whenever a `merchantId` is present. Never returns a placeholder.
 */
export function resolveCommerceLink(input: {
  merchantId?: string | undefined;
  affiliateUrl?: string | undefined;
  directUrl?: string | undefined;
  name?: string | undefined;
}): CommerceLink {
  const merchant = merchantById(input.merchantId);
  const merchantName = merchant?.name ?? input.name;

  if (isMonetized(merchant)) {
    return { kind: "affiliate", href: merchant!.affiliateUrl, merchantName, isAffiliate: true };
  }
  if (input.affiliateUrl) {
    return { kind: "affiliate", href: input.affiliateUrl, merchantName, isAffiliate: true };
  }
  const direct = merchant?.directUrl ?? input.directUrl;
  if (direct) {
    return { kind: "direct", href: direct, merchantName, isAffiliate: false };
  }
  return { kind: "none", merchantName, isAffiliate: false };
}

/** Any monetized program at all? Drives whether disclosure copy claims earnings. */
export const HAS_ACTIVE_AFFILIATE_PROGRAM = MERCHANTS.some((m) => isMonetized(m));
