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

import { AMAZON_TAG } from "./amazon";

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

/**
 * How we relate to a merchant commercially, beyond program status.
 * - "affiliate"            a program exists (any status above).
 * - "partnership-prospect" no program, but the merchant publicly invites
 *                          cross-promotional or partnership contact. INTERNAL.
 * - "direct-editorial"     we link them because they are useful. Nothing more.
 */
export type CommercialTrack = "affiliate" | "partnership-prospect" | "direct-editorial";

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
  /** INTERNAL commercial track. Never rendered publicly. */
  track?: CommercialTrack;
  /** Internal note about what is still required to activate. */
  internalNote?: string;
}


/**
 * US Wellness Meats / Grassland Beef verified deep link to the rendered duck fat
 * product page. Owner-supplied and manually verified 2026-08-18. This is the ONLY
 * US Wellness destination that may power a duck CTA. Do not edit, append to, or
 * derive variants from it.
 */
export const US_WELLNESS_DUCK_FAT_URL = "https://grasslandbeefllc.sjv.io/xJoWgR";

/**
 * HISTORICAL ONLY. The original generic storefront tracking link, superseded by
 * the duck fat deep link above. Retained so a future reviewer can see what the
 * first US Wellness placement pointed at. It must never power a CTA.
 */
export const US_WELLNESS_STOREFRONT_URL_HISTORICAL = "https://grasslandbeefllc.sjv.io/2R7EN0";


/**
 * INTERNAL record of the manual catalogue review. Kept in data (not copy) so no
 * page has to make brittle stock claims, and so a future reviewer can see what
 * the live collection actually contained when these placements were written.
 */
export const US_WELLNESS_CATALOGUE_REVIEW = {
  reviewedDate: "2026-08-18",
  collectionUrl: "https://grasslandbeef.com/collections/duck",
  /** Products rendered by the live collection page at review time. */
  products: [
    { name: "Duck Fat — 1 quart (1.75 lbs)", orderableAtReview: true },
    { name: "Pastured Duck Livers — 5 lb pkg", orderableAtReview: false },
  ],
  /** Categories the live collection did NOT contain, despite older cached results. */
  absentAtReview: ["Whole duck", "Duck breast", "Duck leg quarters", "General duck meat"],
  note: "Older indexed or cached results still show whole duck, breast and leg quarters. They are not current and must not power CTAs or copy. Only rendered duck fat is treated as a live US Wellness duck use case.",
} as const;

export const MERCHANTS: Merchant[] = [
  {
    id: "us-wellness-meats",
    name: "US Wellness Meats",
    program: "Impact",
    status: "active",
    // Canonical monetized destination: the verified rendered-duck-fat deep link.
    // The older generic storefront link is kept as history only, in
    // US_WELLNESS_STOREFRONT_URL_HISTORICAL, and powers nothing.
    affiliateUrl: US_WELLNESS_DUCK_FAT_URL,
    directUrl: "https://grasslandbeef.com/",
    statusReviewed: "2026-08",
    approvalDate: "2026-08",
    activationDate: "2026-08-18",
    lastCheckedDate: "2026-08-18",
    track: "affiliate",
    allowedCategories: ["Rendered duck fat"],
    excludedCategories: [
      "Whole duck, duck breast, duck leg quarters and general duck meat — absent from the live collection reviewed 2026-08-18",
      "Duck liver — in the collection but sold out at review, and no liver deep link has been supplied",
    ],
    termsNotes:
      "Duck CTAs must use the verified duck fat deep link (US_WELLNESS_DUCK_FAT_URL). Do not repeat the merchant's own production or health claims; we have not substantiated them.",
    activation: {
      ...NOTHING_VERIFIED,
      approvalConfirmed: true,
      trackingUrlPresent: true,
      disclosureVerified: true,
    },
    internalNote:
      "Live duck collection manually reviewed 2026-08-18: only Duck Fat 1 quart (available at review) and Pastured Duck Livers 5 lb (sold out at review). No whole duck, breast or leg quarters. Duck-meat sourcing placements were removed; the monetized use case is rendered duck fat via the verified xJoWgR deep link, which is now the canonical registry URL. Owner still needs a live test click and GA4 affiliate=true confirmation. No liver deep link supplied, so liver is not monetized.",
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
  {
    id: "amazon",
    name: "Amazon",
    program: "Amazon Associates",
    // Associates tracking ID. Not a secret. Special Links are built from this
    // via src/data/amazon.ts so no page ever hardcodes the tag.
    publisherId: AMAZON_TAG,
    status: "active",
    // Amazon has no single canonical destination: each placement uses a
    // relevant, tagged category/search Special Link built by amazonCategoryUrl.
    affiliateUrl: `https://www.amazon.com/?tag=${AMAZON_TAG}`,
    directUrl: "https://www.amazon.com/",
    statusReviewed: "2026-08",
    approvalDate: "2026-08",
    activationDate: "2026-08-18",
    allowedCategories: ["Kitchen equipment and cookware"],
    excludedCategories: [
      "Duck and other meat sourcing (handled by specialty meat sellers)",
      "Email, newsletter, SMS and downloadable placements (prohibited by the program)",
    ],
    termsNotes:
      'Site must display the exact statement "As an Amazon Associate I earn from qualifying purchases." Amazon customer reviews and star ratings may only be displayed through an approved Amazon API, which this site does not use. Special Links are website-only.',
    activation: {
      ...NOTHING_VERIFIED,
      approvalConfirmed: true,
      trackingUrlPresent: true,
      disclosureVerified: true,
    },
    internalNote:
      "Approved by Amazon Associates in 2026-08 and activated with tracking ID deliciousduck-20. Equipment/gear categories only. Owner still needs to complete a live test click and confirm GA4 reports affiliate=true. No commission terms recorded here until the program's fee schedule has been read.",
  },

  /* ---------------------------------------------------------------- *
   * Duck sellers we link because they are useful. None is monetized.  *
   * "partnership-prospect" is INTERNAL and means only that the seller  *
   * publicly invites cross-promotional contact — never a relationship. *
   * ---------------------------------------------------------------- */
  {
    id: "culver-duck",
    name: "Culver Duck",
    status: "candidate",
    directUrl: "https://culverduck.com/shop/",
    statusReviewed: "2026-08-18",
    lastCheckedDate: "2026-08-18",
    track: "partnership-prospect",
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Duck producer with a direct-to-consumer shop reviewed 2026-08-18: whole duck, raw breast, legs, ground duck, duck fat, confit, smoked breast, stuffed duck and halal duck. No affiliate program has been confirmed, so every link stays plain and unpaid. Their site feedback form explicitly invites cross-promotional opportunities, which makes them a partnership prospect to contact — not an affiliate.",
  },
  {
    id: "tastyduck-jurgielewicz",
    name: "Joe Jurgielewicz & Son (TastyDuck)",
    status: "candidate",
    directUrl: "https://tastyduck.com/shop/",
    statusReviewed: "2026-08-18",
    lastCheckedDate: "2026-08-18",
    track: "partnership-prospect",
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Family duck producer whose shop, reviewed 2026-08-18, lists whole duck, breasts, legs, sampler kits and prepared products. No affiliate program confirmed; links stay direct and unpaid. Their feedback form invites cross-promotional opportunities, so treat as a partnership prospect to contact.",
  },
  {
    id: "fossil-farms",
    name: "Fossil Farms",
    status: "candidate",
    directUrl: "https://www.fossilfarms.com/collections/duck",
    statusReviewed: "2026-08-18",
    lastCheckedDate: "2026-08-18",
    track: "partnership-prospect",
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Game and specialty meat retailer with a broad duck collection reviewed 2026-08-18, spanning several breeds, cuts and prepared products. No public affiliate program confirmed; links stay direct and unpaid. Partnership prospect worth an outreach email.",
  },
  {
    id: "wild-fork",
    name: "Wild Fork",
    status: "candidate",
    directUrl: "https://wildforkfoods.com/",
    statusReviewed: "2026-08-18",
    lastCheckedDate: "2026-08-18",
    track: "direct-editorial",
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Frozen-meat retailer with physical stores and delivery. Useful as a mainstream, non-specialist option where duck is in stock, but the duck range moves, so no cut-level claim is published. No affiliate program applied for. Verify duck availability at each page review.",
  },
  {
    id: "meat-n-bone",
    name: "Meat N' Bone",
    // Recorded for internal follow-up only. No application has been filed, so
    // the status stays "candidate" rather than "applied".
    program: "Rakuten Advertising (advertiser ID 47482) / Shopify affiliate program",
    status: "candidate",
    directUrl: "https://meatnbone.com/",
    statusReviewed: "2026-08-18",
    track: "affiliate",
    activation: { ...NOTHING_VERIFIED },
    internalNote:
      "Runs a public affiliate program via Shopify and Rakuten Advertising (advertiser ID 47482), so this is the strongest near-term application candidate for duck sourcing. Duck inventory looked thin or sold out at the 2026-08-18 review, so they are not featured as a current source. Move to \"applied\" only when an application is genuinely filed.",
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

export type ReadinessLevel =
  | "blocked"
  | "declined"
  | "in-progress"
  | "ready-to-activate"
  | "live";

export interface Readiness {
  level: ReadinessLevel;
  label: string;
  /** Plain-language description of the single next action. */
  nextAction: string;
  open: string[];
}

/** True when the network or advertiser rejected the application. */
export function isDeclined(merchant?: Merchant): boolean {
  return merchant?.status === "declined";
}

/** True only while an application is genuinely awaiting a decision. */
export function isPendingApproval(merchant?: Merchant): boolean {
  if (!merchant) return false;
  return merchant.status === "applied" || merchant.status === "approved-no-link";
}

/** Activation readiness for the switchboard. Fail-safe: defaults to blocked. */
export function activationReadiness(merchant: Merchant): Readiness {
  const open = openActivationSteps(merchant);

  // Declined is checked before anything else so a rejected application can
  // never read as monetized, pending, or ready to activate.
  if (merchant.status === "declined") {
    return {
      level: "declined",
      label: "Declined — no relationship",
      nextAction:
        "Nothing to activate. Keep links plain and direct, keep editorial references specification-based, and only re-apply if the program reopens.",
      open,
    };
  }

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
