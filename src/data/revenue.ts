/**
 * Internal revenue operating layer: product/deep-link registry, page-to-revenue
 * map, activation workflow, and the metrics framework.
 *
 * Consumed by /internal/revenue-switchboard only. That route is noindex,
 * disallowed in robots.txt under /internal/, excluded from the sitemap and the
 * site search index, and is not linked from public navigation.
 *
 * Hard rules for this file:
 * - No invented SKUs, model numbers, prices, commission rates, ratings, or
 *   approval states. Entries are generic categories or merchants we already
 *   reference editorially.
 * - `affiliateUrl` stays undefined until a real network deep link exists.
 * - `handsOn` defaults to "untested" and may only change when first-party
 *   kitchen evidence exists (see /internal/kitchen-test-sheet).
 * - No secrets. No claimed integrations with Awin or Impact reporting APIs —
 *   there are none.
 */

import {
  MERCHANTS,
  merchantById,
  isDeclined,
  isMonetized,
  isPendingApproval,
  isUsableUrl,
} from "./affiliates";

export type DeepLinkStatus =
  | "category-placeholder"
  | "awaiting-approval"
  | "declined"
  | "awaiting-deep-link"
  | "active";

export type HandsOnStatus = "untested" | "kitchen-used" | "tested";

export const HANDS_ON_LABEL: Record<HandsOnStatus, string> = {
  untested: "Untested — editorial research only",
  "kitchen-used": "Used in our kitchen (not a formal test)",
  tested: "Formally tested with recorded evidence",
};

export interface DeepLinkEntry {
  id: string;
  /** Registry key in src/data/affiliates.ts, when a specific merchant applies. */
  merchantId?: string;
  /** Product or category name. Categories preferred over brands. */
  name: string;
  /** What a reader is trying to accomplish when they land on this slot. */
  useCase: string;
  /** Plain, non-affiliate destination, when one exists. */
  directUrl?: string;
  /** Real network deep link. Must stay undefined until a program is active. */
  affiliateUrl?: string;
  status: DeepLinkStatus;
  /** YYYY-MM the destination and description were last checked. */
  lastVerified: string;
  /** Which editorial page owns this slot. */
  editorialRelationship: string;
  handsOn: HandsOnStatus;
  note?: string;
}

/**
 * Deep-link slots. Category placeholders exist so activation is a URL paste,
 * not a content project. Nothing here is monetized today.
 */
export const DEEP_LINKS: DeepLinkEntry[] = [
  {
    id: "sourcing-dartagnan",
    merchantId: "dartagnan",
    name: "Duck cuts — whole birds, magret, leg quarters, rendered fat",
    useCase: "Reader wants a named duck cut shipped to them in the US",
    directUrl: "https://www.dartagnan.com/",
    status: "awaiting-approval",
    lastVerified: "2026-08",
    editorialRelationship: "/buy/where-to-buy-duck-online (primary sourcing slot)",
    handsOn: "untested",
    note: "Awin program pending. Once approved, request a duck-category deep link rather than a homepage link.",
  },
  {
    id: "sourcing-us-wellness",
    merchantId: "us-wellness-meats",
    name: "Pasture-raised duck and duck fat",
    useCase: "Reader shopping duck alongside other pasture-raised meat",
    directUrl: "https://grasslandbeef.com/",
    status: "active",
    lastVerified: "2026-08",
    editorialRelationship: "/buy/where-to-buy-duck-online (secondary sourcing slot)",
    handsOn: "untested",
    note: "Approved and live on the canonical Grassland Beef tracking URL held in src/data/affiliates.ts. A duck-category deep link can replace the storefront link if the advertiser issues one.",
  },
  {
    id: "thermometer-thermoworks",
    merchantId: "thermoworks",
    name: "Fast instant-read thermometer",
    useCase: "Reader needs a thin-probe thermometer for duck breast doneness",
    directUrl: "https://www.thermoworks.com/",
    status: "declined",
    lastVerified: "2026-08",
    editorialRelationship: "/gear/best-thermometer-for-duck (primary), /learn/duck-breast-temperature-doneness (contextual)",
    handsOn: "untested",
    note: "Impact application declined in 2026-08 without a stated reason. This slot stays a plain direct link; there is no approval to wait for and no deep link to request.",
  },
  {
    id: "thermometer-category",
    name: "Instant-read thermometer — category slot",
    useCase: "Fallback when no thermometer program is active",
    status: "category-placeholder",
    lastVerified: "2026-08",
    editorialRelationship: "/gear/best-thermometer-for-duck (category fallback)",
    handsOn: "untested",
    note: "Deliberately unlinked. The guide teaches the specification to shop for; no destination is better than a fabricated one.",
  },
  {
    id: "pan-carbon-steel-category",
    name: "Carbon steel or cast iron skillet — category slot",
    useCase: "Reader needs a high-thermal-mass, oven-safe, uncoated pan",
    status: "category-placeholder",
    lastVerified: "2026-08",
    editorialRelationship: "/gear/best-pan-for-duck-breast (primary)",
    handsOn: "untested",
    note: "No cookware program applied for yet. Candidate networks not yet evaluated.",
  },
  {
    id: "knife-scoring-category",
    name: "Paring or petty knife for scoring — category slot",
    useCase: "Reader needs tip control to score a fat cap without hitting meat",
    status: "category-placeholder",
    lastVerified: "2026-08",
    editorialRelationship: "/gear/best-knife-for-scoring-duck (primary)",
    handsOn: "untested",
    note: "No cutlery program applied for yet.",
  },
  {
    id: "duck-fat-jar-category",
    name: "Rendered duck fat — category slot",
    useCase: "Reader would rather buy rendered fat than render their own",
    status: "category-placeholder",
    lastVerified: "2026-08",
    editorialRelationship: "/buy/duck-fat-buying-guide (primary)",
    handsOn: "untested",
    note: "Both sourcing merchants list rendered fat; slot activates with whichever program approves first.",
  },
  {
    id: "fat-storage-category",
    name: "Fine strainer and sealable heatproof jar — category slot",
    useCase: "Reader is keeping rendered fat and needs clean straining and storage",
    status: "category-placeholder",
    lastVerified: "2026-08",
    editorialRelationship: "/learn/how-to-render-duck-fat, /cook/ways-to-use-duck-fat (contextual)",
    handsOn: "untested",
  },
];

export type SlotRole = "primary" | "secondary" | "contextual";

export interface RevenueSlot {
  role: SlotRole;
  /** Merchant registry id, when the slot is merchant-specific. */
  merchantId?: string;
  /** Deep-link registry id, when the slot maps to a catalogued slot. */
  deepLinkId?: string;
  /** What the slot is for, in reader terms. */
  intent: string;
  /** Where and how it should appear on the page. */
  placement: string;
}

export interface PageRevenueMap {
  path: string;
  label: string;
  /** Why a reader is on this page, and how commercially ready they are. */
  readerState: string;
  slots: RevenueSlot[];
}

export const PAGE_REVENUE_MAP: PageRevenueMap[] = [
  {
    path: "/buy/where-to-buy-duck-online",
    label: "Where to buy duck online",
    readerState: "Highest purchase intent on the site — reader wants a seller, not a technique.",
    slots: [
      {
        role: "primary",
        merchantId: "dartagnan",
        deepLinkId: "sourcing-dartagnan",
        intent: "Named duck cuts from one US order",
        placement: "Comparison card CTA in the sellers comparison, below the decision factors",
      },
      {
        role: "secondary",
        merchantId: "us-wellness-meats",
        deepLinkId: "sourcing-us-wellness",
        intent: "Pasture-raised alternative for readers already buying meat online",
        placement: "Second comparison card CTA in the same table",
      },
      {
        role: "contextual",
        deepLinkId: "duck-fat-jar-category",
        intent: "Reader adds rendered fat to a duck order",
        placement: "Shop-this-guide recap at the end of the page",
      },
    ],
  },
  {
    path: "/buy/duck-fat-buying-guide",
    label: "Duck fat buying guide",
    readerState: "Deciding between rendering their own and buying a jar.",
    slots: [
      {
        role: "primary",
        deepLinkId: "duck-fat-jar-category",
        intent: "Buy rendered duck fat in a usable format",
        placement: "Format comparison cards; activates with the first approved sourcing program",
      },
      {
        role: "secondary",
        merchantId: "dartagnan",
        intent: "Rendered fat added to a specialist duck order",
        placement: "Comparison card CTA where the merchant carries the format",
      },
      {
        role: "contextual",
        deepLinkId: "fat-storage-category",
        intent: "Straining and storage for fat they render themselves",
        placement: "Shop-this-guide recap, framed as optional",
      },
    ],
  },
  {
    path: "/gear/best-thermometer-for-duck",
    label: "Best thermometer for duck",
    readerState: "Ready to buy a thermometer; needs the specification that matters for duck.",
    slots: [
      {
        role: "primary",
        merchantId: "thermoworks",
        deepLinkId: "thermometer-thermoworks",
        intent: "Buy a fast thin-probe instant-read",
        placement: "Comparison card CTA for the instant-read row",
      },
      {
        role: "secondary",
        deepLinkId: "thermometer-category",
        intent: "Shop the category on specification when no program is active",
        placement: "Category fallback row — teaches the spec, renders no CTA while unlinked",
      },
    ],
  },
  {
    path: "/gear/best-pan-for-duck-breast",
    label: "Best pan for duck breast",
    readerState: "Choosing between pan categories rather than brands.",
    slots: [
      {
        role: "primary",
        deepLinkId: "pan-carbon-steel-category",
        intent: "Buy an uncoated, oven-safe, high-mass skillet",
        placement: "Comparison card CTA per pan category once a cookware program exists",
      },
      {
        role: "contextual",
        deepLinkId: "fat-storage-category",
        intent: "Somewhere to pour the fat the pan renders",
        placement: "Shop-this-guide recap",
      },
    ],
  },
  {
    path: "/gear/best-knife-for-scoring-duck",
    label: "Best knife for scoring duck",
    readerState: "Low ticket, high specificity — wants tip control, not a knife set.",
    slots: [
      {
        role: "primary",
        deepLinkId: "knife-scoring-category",
        intent: "Buy a paring or petty knife suited to shallow scoring",
        placement: "Comparison card CTA per blade shape once a cutlery program exists",
      },
    ],
  },
  {
    path: "/recipes/pan-seared-duck-breast",
    label: "Pan-seared duck breast (recipe)",
    readerState: "Cooking now or shopping to cook this week. Trust anchor for the whole cluster.",
    slots: [
      {
        role: "primary",
        merchantId: "dartagnan",
        deepLinkId: "sourcing-dartagnan",
        intent: "Buy skin-on breasts for this recipe",
        placement: "Shop-this-guide sourcing recap under the method",
      },
      {
        role: "secondary",
        merchantId: "thermoworks",
        deepLinkId: "thermometer-thermoworks",
        intent: "Thermometer to hit the pull temperature the recipe specifies",
        placement: "Contextual link from the doneness step to the thermometer guide",
      },
      {
        role: "contextual",
        deepLinkId: "pan-carbon-steel-category",
        intent: "Pan capable of a cold-start render",
        placement: "Equipment list, linked to the pan guide rather than a merchant",
      },
      {
        role: "contextual",
        deepLinkId: "knife-scoring-category",
        intent: "Knife for the scoring step",
        placement: "Equipment list, linked to the knife guide",
      },
    ],
  },
  {
    path: "/cook/how-to-cook-duck-breast",
    label: "How to cook duck breast",
    readerState: "Learning the method; commercially warm but not yet committed.",
    slots: [
      {
        role: "primary",
        deepLinkId: "sourcing-dartagnan",
        intent: "Source the cut once the method makes sense",
        placement: "Inline link to the sourcing guide in the ready-to-cook section",
      },
      {
        role: "secondary",
        deepLinkId: "thermometer-thermoworks",
        intent: "Thermometer as the method's only reliable signal",
        placement: "Safety note link to the doneness guide, then to the thermometer guide",
      },
      {
        role: "contextual",
        deepLinkId: "pan-carbon-steel-category",
        intent: "Correct pan for the cold-start render",
        placement: "Shop-this-guide recap",
      },
    ],
  },
  {
    path: "/learn/duck-breast-temperature-doneness",
    label: "Duck breast temperature and doneness",
    readerState: "Mid-cook or pre-cook research; a thermometer is the obvious next purchase.",
    slots: [
      {
        role: "primary",
        merchantId: "thermoworks",
        deepLinkId: "thermometer-thermoworks",
        intent: "Buy a probe accurate enough for a 5–10°F doneness band",
        placement: "Inline link in the thermometer-error section to the gear guide",
      },
    ],
  },
  {
    path: "/guides/duck-cooking-starter-guide",
    label: "Duck cooking starter guide (lead magnet companion)",
    readerState: "New subscriber orienting themselves — the top of every downstream funnel.",
    slots: [
      {
        role: "primary",
        deepLinkId: "sourcing-dartagnan",
        intent: "First duck purchase",
        placement: "Downstream link to the sourcing guide, not a merchant link",
      },
      {
        role: "secondary",
        deepLinkId: "thermometer-thermoworks",
        intent: "First equipment purchase",
        placement: "Downstream link to the thermometer guide",
      },
      {
        role: "contextual",
        deepLinkId: "pan-carbon-steel-category",
        intent: "Equipment they may already own",
        placement: "Downstream link to the pan guide",
      },
    ],
  },
];

/** Money pages whose CTA layout must degrade gracefully while programs pend. */
export const MONEY_PAGES = [
  "/buy/where-to-buy-duck-online",
  "/buy/duck-fat-buying-guide",
  "/gear/best-thermometer-for-duck",
  "/gear/best-pan-for-duck-breast",
  "/gear/best-knife-for-scoring-duck",
] as const;

export interface WorkflowStep {
  key: string;
  step: string;
  detail: string;
  /** What makes this step impossible to fake. */
  gate: string;
}

/**
 * The activation workflow. Steps are ordered and each names its own gate, so
 * skipping one is visible rather than silent.
 */
export const ACTIVATION_WORKFLOW: WorkflowStep[] = [
  {
    key: "A",
    step: 'Approval confirmed → set status "approved-no-link"',
    detail:
      "Read the approval in the network dashboard. If approval is real but no tracking URL exists yet, set status to approved-no-link. The site stays on direct links.",
    gate: "approved-no-link never monetizes: resolveCommerceLink requires status active AND a URL.",
  },
  {
    key: "B",
    step: "Review current network terms",
    detail:
      "Record termsReviewedDate, plus allowedCategories, excludedCategories, and any claim restrictions. Enter commissionSummary only from the terms page — leave it blank otherwise.",
    gate: "commissionSummary is internal-only and never rendered publicly.",
  },
  {
    key: "C",
    step: "Enter the real affiliate or deep link",
    detail:
      "Paste the network-generated URL into affiliateUrl. Prefer a category deep link over a storefront link. Never construct, shorten, or guess a tracking URL.",
    gate: "isUsableUrl rejects blanks, '#', and non-http(s) values.",
  },
  {
    key: "D",
    step: 'Set status "active" only when the URL is valid',
    detail:
      "Change status to active in the same edit as the URL. There is no other switch and no page-level override — row-level affiliate URLs are ignored for registry merchants.",
    gate: "Public CTAs read the registry, so one edit flips every placement at once.",
  },
  {
    key: "E",
    step: "Test the resolved URL",
    detail:
      "Open the live page, click the CTA, confirm it lands on the intended product page and that the network records the click. Set testClickComplete and lastCheckedDate.",
    gate: "A failed test means reverting status to approved-no-link, not shipping a broken link.",
  },
  {
    key: "F",
    step: "Confirm FTC disclosure and GA4 affiliate=true",
    detail:
      "Check the disclosure renders above the first monetized link on every affected page, then confirm the affiliate_click event reports link_type: affiliate and affiliate: true.",
    gate: "Disclosure copy switches to commission language automatically once any program is active.",
  },
  {
    key: "G",
    step: "Record activation date and last checked",
    detail:
      "Set activationDate, lastCheckedDate, and statusReviewed. Re-check the link and terms quarterly.",
    gate: "Stale dates surface on this switchboard as an explicit warning.",
  },
];

export interface MetricDefinition {
  metric: string;
  definition: string;
  source: string;
  availableNow: boolean;
}

/**
 * What we will measure once links go live. There is no Awin or Impact reporting
 * integration in this project, so network-side metrics are marked unavailable.
 */
export const REVENUE_METRICS: MetricDefinition[] = [
  {
    metric: "Commercial pageviews",
    definition: "Pageviews of /buy, /gear, and recipe pages carrying commercial slots.",
    source: "GA4 page_view filtered by content_type (buy_duck, gear).",
    availableNow: true,
  },
  {
    metric: "Outbound merchant clicks",
    definition: "Clicks leaving the site to a merchant's own site, with no affiliate tracking.",
    source: "GA4 affiliate_click where link_type = direct_seller.",
    availableNow: true,
  },
  {
    metric: "Affiliate clicks",
    definition: "Clicks on a real tracking URL. Zero is the correct number until activation.",
    source: "GA4 affiliate_click where affiliate = true.",
    availableNow: true,
  },
  {
    metric: "Click-through rate by placement",
    definition: "Outbound clicks divided by pageviews, split by the placement parameter.",
    source: "GA4 affiliate_click placement dimension vs page_view for the same path.",
    availableNow: true,
  },
  {
    metric: "Newsletter assists",
    definition:
      "Subscribers who later click a commercial link in the same session. Session-level association only, never person-level.",
    source: "GA4 newsletter_signup and affiliate_click in one session. No PII, no user stitching.",
    availableNow: true,
  },
  {
    metric: "Revenue",
    definition: "Commission earned. Requires network reporting.",
    source: "Awin / Impact dashboards, read manually. No API integration exists.",
    availableNow: false,
  },
  {
    metric: "EPC (earnings per click)",
    definition: "Commission divided by tracked affiliate clicks.",
    source: "Network reporting plus GA4 click counts. Unavailable until a program is active.",
    availableNow: false,
  },
  {
    metric: "Conversion rate",
    definition: "Orders divided by tracked affiliate clicks.",
    source: "Network reporting only. We cannot observe merchant checkouts.",
    availableNow: false,
  },
];

export function deepLinkById(id?: string): DeepLinkEntry | undefined {
  if (!id) return undefined;
  return DEEP_LINKS.find((d) => d.id === id);
}

/** Fail-safe truth for the switchboard header. */
export function revenueSummary() {
  const active = MERCHANTS.filter(isMonetized);
  const activeDeepLinks = DEEP_LINKS.filter(
    (d) => d.status === "active" && isUsableUrl(d.affiliateUrl),
  );
  return {
    merchantCount: MERCHANTS.length,
    activeMerchants: active.map((m) => m.name),
    pendingMerchants: MERCHANTS.filter(isPendingApproval).map((m) => m.name),
    declinedMerchants: MERCHANTS.filter(isDeclined).map((m) => m.name),
    unmonetizedMerchants: MERCHANTS.filter((m) => !isMonetized(m)).map((m) => m.name),
    deepLinkCount: DEEP_LINKS.length,
    activeDeepLinkCount: activeDeepLinks.length,
    anyActive: active.length > 0,
  };
}

/** Resolve a slot's merchant/deep-link state for display. Never claims monetization. */
export function describeSlot(slot: RevenueSlot) {
  const merchant = merchantById(slot.merchantId);
  const deepLink = deepLinkById(slot.deepLinkId);
  const monetized = isMonetized(merchant);
  return {
    merchant,
    deepLink,
    monetized,
    stateLabel: monetized
      ? "Active affiliate destination"
      : merchant
        ? `${merchant.name} — ${merchant.status}, not monetized`
        : "Category slot — no affiliate destination",
  };
}
