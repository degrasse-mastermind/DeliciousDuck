/**
 * Central affiliate/merchant registry — the revenue switchboard's source of truth.
 *
 * This is the ONLY place a merchant becomes monetized. To activate a program,
 * set `status: "active"` and paste the real tracking URL into `affiliateUrl`.
 * No page JSX needs to change.
 *
 * Status meanings (internal only — never rendered to visitors):
 * - "candidate"        We reference the merchant editorially. No application filed.
 * - "applied"          Application submitted, awaiting review. NOT monetized.
 * - "declined"         The network or advertiser rejected the application. NOT
 *                      monetized, not pending, and never "ready to activate".
 * - "approved-no-link" Approved by the network, but no tracking URL configured yet.
 * - "active"           Approved AND a real tracking URL is present below.
 *
 * Hard rules:
 * - `affiliateUrl` must be a real tracking URL from the network. Never invent one.
 * - A merchant is only treated as monetized when status === "active" AND
 *   `affiliateUrl` is set. Anything else falls back to the plain, non-affiliate
 *   `directUrl`, or to no link at all.
 * - A declined merchant may still be referenced editorially, but no copy may
 *   imply a relationship, an approval, or an expected activation.
 * - No secrets (API keys, network passwords, tokens) belong in this file.
 * - `commissionSummary` is INTERNAL ONLY and must be left blank unless the owner
 *   has read the terms in the network dashboard. It is never rendered publicly.
 * - No prices, ratings, or review counts live in this file.
 */

export type MerchantStatus =
  | "candidate"
  | "applied"
  | "declined"
  | "approved-no-link"
  | "active";


/** Owner-verified activation gates. Each flag must be verified, never assumed. */
export interface ActivationFlags {
  /** Approval read in the network dashboard (not inferred from an email). */
  approvalConfirmed: boolean;
  /** Current program terms read, including any prohibited language. */
  termsReviewed: boolean;
  /** A real tracking/deep-link URL has been pasted into the registry. */
  trackingUrlPresent: boolean;
  /** Owner clicked the resolved link and confirmed it lands and registers. */
  testClickComplete: boolean;
  /** Affiliate disclosure verified above the first monetized link on each page. */
  disclosureVerified: boolean;
  /** GA4 confirmed reporting affiliate=true for a live test click. */
  ga4AffiliateVerified: boolean;
}

export const ACTIVATION_FLAG_LABELS: { key: keyof ActivationFlags; label: string }[] = [
  { key: "approvalConfirmed", label: "Approval confirmed in network dashboard" },
  { key: "termsReviewed", label: "Current program terms reviewed" },
  { key: "trackingUrlPresent", label: "Real tracking URL present in registry" },
  { key: "testClickComplete", label: "Test click completed end to end" },
  { key: "disclosureVerified", label: "Disclosure verified before first monetized link" },
  { key: "ga4AffiliateVerified", label: "GA4 reports affiliate=true for the click" },
];

const NOTHING_VERIFIED: ActivationFlags = {
  approvalConfirmed: false,
  termsReviewed: false,
  trackingUrlPresent: false,
  testClickComplete: false,
  disclosureVerified: false,
  ga4AffiliateVerified: false,
};

export interface Merchant {
  id: string;
  /** Consumer-facing merchant name. */
  name: string;
  /** Affiliate network or program name, for internal tracking only. */
  program?: string;
  /** Publisher/account identifier in that network. Not a secret, not a key. */
  publisherId?: string;
  status: MerchantStatus;
  /** Real network tracking URL. Only set once the program is genuinely active. */
  affiliateUrl?: string;
  /** Plain, non-affiliate brand/merchant URL. Safe to link with rel="nofollow". */
  directUrl?: string;
  /** YYYY-MM of the last time this row's status was reviewed. */
  statusReviewed: string;
  /** YYYY-MM(-DD) the network approved us. Blank until approval is real. */
  approvalDate?: string;
  /** YYYY-MM(-DD) the application was declined. Only set when status is declined. */
  declinedDate?: string;
  /** YYYY-MM the owner last read this program's terms. Blank if never read. */
  termsReviewedDate?: string;
  /** YYYY-MM(-DD) the program went live on the site. Blank until active. */
  activationDate?: string;
  /** YYYY-MM(-DD) the resolved destination was last clicked and checked. */
  lastCheckedDate?: string;
  /**
   * INTERNAL ONLY. Owner-entered summary of verified commission terms, e.g.
   * rate band and cookie window. Leave undefined when unknown — never estimate,
   * and never render this on a public page.
   */
  commissionSummary?: string;
  /** Categories the program allows, if the terms restrict them. */
  allowedCategories?: string[];
  /** Categories or link types the terms exclude. */
  excludedCategories?: string[];
  /** Important terms notes: trademark limits, coupon rules, claim restrictions. */
  termsNotes?: string;
  /** Owner-verified activation gates. */
  activation: ActivationFlags;
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
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Impact site verification meta tag is installed. Application is pending review. Do not set status to active until Impact issues an approved tracking URL; paste it into affiliateUrl at that point.",
  },
  {
    id: "dartagnan",
    name: "D'Artagnan",
    program: "Awin",
    publisherId: "3034797",
    status: "applied",
    directUrl: "https://www.dartagnan.com/",
    statusReviewed: "2026-08",
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Delicious Duck Awin publisher account is activated (publisher ID 3034797); D'Artagnan advertiser program application has been submitted and is pending approval.",
  },
  {
    id: "thermoworks",
    name: "ThermoWorks",
    program: "Impact",
    status: "declined",
    directUrl: "https://www.thermoworks.com/",
    statusReviewed: "2026-08",
    declinedDate: "2026-08",
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Historical record: a ThermoWorks Impact application was submitted in 2026-08 and the Impact site-verification meta tag was installed. The application was declined without a stated reason, so there is no relationship, no approval, and no expected activation. ThermoWorks may still be referenced editorially on specification grounds only. Do not add an affiliate URL, and do not re-open this row as pending without a new application.",
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

/**
 * Which activation gates are still open for a merchant.
 *
 * `trackingUrlPresent` is derived from the registry rather than trusted from the
 * flag, so a checked box can never make a merchant look ready without a URL.
 */
export function openActivationSteps(merchant: Merchant): string[] {
  const flags: ActivationFlags = {
    ...merchant.activation,
    trackingUrlPresent: Boolean(merchant.affiliateUrl),
  };
  return ACTIVATION_FLAG_LABELS.filter((f) => !flags[f.key]).map((f) => f.label);
}

export type ReadinessLevel = "blocked" | "in-progress" | "ready-to-activate" | "live";

export interface Readiness {
  level: ReadinessLevel;
  label: string;
  /** Plain-language description of the single next action. */
  nextAction: string;
  open: string[];
}

/** Activation readiness for the switchboard. Fail-safe: defaults to blocked. */
export function activationReadiness(merchant: Merchant): Readiness {
  const open = openActivationSteps(merchant);

  if (isMonetized(merchant)) {
    return {
      level: "live",
      label: "Live — monetized",
      nextAction:
        open.length > 0
          ? `Active, but unverified gates remain: ${open.join("; ")}. Verify or roll back.`
          : "Re-check the resolved link and GA4 quarterly.",
      open,
    };
  }
  if (merchant.status === "candidate") {
    return {
      level: "blocked",
      label: "Not applied — no relationship",
      nextAction: "Apply to the program, or leave this merchant editorial-only.",
      open,
    };
  }
  if (merchant.status === "applied") {
    return {
      level: "blocked",
      label: "Pending approval — not monetized",
      nextAction:
        "Wait for the network decision. Links stay direct and non-affiliate until approval is read in the network dashboard.",
      open,
    };
  }
  // approved-no-link
  if (open.length === 0) {
    return {
      level: "ready-to-activate",
      label: "Ready to activate",
      nextAction: 'All gates verified. Set status: "active" in src/data/affiliates.ts.',
      open,
    };
  }
  return {
    level: "in-progress",
    label: "Approved — activation incomplete",
    nextAction: `Close these first: ${open.join("; ")}.`,
    open,
  };
}

export type CommerceLinkKind = "affiliate" | "direct" | "none";

export interface CommerceLink {
  kind: CommerceLinkKind;
  href?: string | undefined;
  merchantName?: string | undefined;
  merchantId?: string | undefined;
  /** Only true when `href` is a real affiliate tracking URL. */
  isAffiliate: boolean;
}

/** Reject anything that is not a real, absolute http(s) destination. */
export function isUsableUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "#" || trimmed.startsWith("#")) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
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
  const base = { merchantName, merchantId: merchant?.id ?? input.merchantId };

  if (isMonetized(merchant) && isUsableUrl(merchant!.affiliateUrl)) {
    return { ...base, kind: "affiliate", href: merchant!.affiliateUrl, isAffiliate: true };
  }
  // A row-level affiliate URL is only honoured when no registry merchant governs
  // the row, so a pending merchant can never be monetized from page data.
  if (!merchant && isUsableUrl(input.affiliateUrl)) {
    return { ...base, kind: "affiliate", href: input.affiliateUrl, isAffiliate: true };
  }
  const direct = merchant?.directUrl ?? input.directUrl;
  if (isUsableUrl(direct)) {
    return { ...base, kind: "direct", href: direct, isAffiliate: false };
  }
  return { ...base, kind: "none", isAffiliate: false };
}

/** Any monetized program at all? Drives whether disclosure copy claims earnings. */
export const HAS_ACTIVE_AFFILIATE_PROGRAM = MERCHANTS.some((m) => isMonetized(m));

/** Merchant ids that are genuinely monetized right now. */
export const ACTIVE_MERCHANT_IDS = MERCHANTS.filter(isMonetized).map((m) => m.id);
