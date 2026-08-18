/**
 * Supporting informational cluster for the high-intent decision guides.
 *
 * One entry per page. Each entry pins down the single search intent the page
 * owns, the answer that must appear in the first viewport, the transparency
 * block shown to readers, the source ids backing its factual claims, and the
 * forward funnel into the decision guide that makes the purchase call.
 *
 * Hard rules (do not relax):
 * - One intent per path. Two entries may not share an intent.
 * - There is no field for a price, rating, ranking, discount, commission,
 *   stock level, or merchant name. Do not add one.
 * - Merchant destinations never appear here. Pages render them only through
 *   the commercial-link registry (`src/data/commercial-links.ts`).
 */

export interface AcquisitionPageMeta {
  /** Route path, also the canonical URL. Must exist in the guide registry. */
  path: string;
  /** The one search intent this page owns, in the reader's words. */
  intent: string;
  /** First-viewport answer. Complete enough to be useful on its own. */
  answer: string;
  byline: string;
  reviewedBy: string;
  /** YYYY-MM-DD the editorial content was last reviewed. */
  updated: string;
  /** Evidence types the page is built on. No claims, no brands. */
  basedOn: string[];
  /** Positive statement of what the page rests on. */
  evidenceBasis: string;
  /** Ids in `src/data/sources.ts` backing the factual claims on the page. */
  sourceIds: string[];
  /** Forward funnel into decision guides, calculators, or technique pages. */
  funnel: { to: string; label: string; why: string }[];
}

const BYLINE = "DeliciousDuck Editorial";
const REVIEWED = "Reviewed against our editorial standards before publication.";
const UPDATED = "2026-08-13";

const CUTS: AcquisitionPageMeta = {
  path: "/buy/what-cut-of-duck-to-buy",
  intent: "Which cut of duck should I buy for the dish I want to cook?",
  answer:
    "Start from the dish, not the counter. Breast for a seared, pink, plated main. Legs for confit, braises, and anything slow. A whole bird when you want a centrepiece — or three cooks out of one purchase, because a whole duck is breast, legs, fat, and stock in a single package.",
  byline: BYLINE,
  reviewedBy: REVIEWED,
  updated: UPDATED,
  basedOn: [
    "Our own technique pages for breast, legs, and whole-bird roasting, and what each method needs from the cut.",
    "USDA labelling and handling guidance for duck, including the age classes you see on a package.",
    "The yield assumptions published in our whole-duck serving calculator.",
  ],
  evidenceBasis:
    "Cut-to-method fit, drawn from our own technique pages and USDA labelling conventions. Prices and availability come from the seller you buy from.",
  sourceIds: ["usdaPoultryPrep", "usdaPoultryTemp"],
  funnel: [
    {
      to: "/buy/where-to-buy-duck-online",
      label: "Where to buy duck online",
      why: "Once you know the cut, this is the framework for finding a seller that actually names and stocks it.",
    },
    {
      to: "/buy/how-much-duck-per-person",
      label: "How much duck per person",
      why: "Turn the cut you chose into a shopping weight before you order.",
    },
  ],
};

const QUANTITY: AcquisitionPageMeta = {
  path: "/buy/how-much-duck-per-person",
  intent: "How much duck do I need to buy per person?",
  answer:
    "Plan on roughly 180 g (6 oz) of cooked meat per person for a standard main course, then work backward. A whole duck yields about 40% of its raw weight as edible cooked meat, so a 2.2 kg (about 4.9 lb) bird feeds four generously. One duck breast per person is the simple rule for a plated main, and one leg per person for confit.",
  byline: BYLINE,
  reviewedBy: REVIEWED,
  updated: UPDATED,
  basedOn: [
    "The published assumptions behind our whole-duck serving calculator: 40% edible cooked yield, and light, standard, and hearty portions of 140 g, 180 g, and 240 g.",
    "Carving and cut structure from our own whole-duck pages, which determine how many portions a bird actually produces.",
    "USDA storage guidance for what to do with the leftovers you deliberately plan for.",
  ],
  evidenceBasis:
    "Stated portion-planning assumptions from our own serving calculator, offered as planning guidance rather than nutritional advice. Appetites and menus vary more than any calculator can model.",
  sourceIds: ["usdaPoultryPrep", "usdaLeftovers"],
  funnel: [
    {
      to: "/tools/whole-duck-serving-calculator",
      label: "Whole-duck serving calculator",
      why: "Enter your guest count and appetite and it returns the number of birds and the raw weight to buy.",
    },
    {
      to: "/buy/where-to-buy-duck-online",
      label: "Where to buy duck online",
      why: "Compare a whole bird against pre-cut portions on cost per usable portion, not headline price.",
    },
  ],
};

const FRESH_FROZEN: AcquisitionPageMeta = {
  path: "/buy/fresh-vs-frozen-duck",
  intent: "Should I buy fresh or frozen duck, and how do I handle a mail-order delivery?",
  answer:
    "Frozen is not a downgrade. Almost all mail-order duck ships frozen because that is the only way to hold it safely across a multi-day transit, and a carefully frozen bird usually beats a “fresh” one that spent days above freezing in a box. What frozen costs you is planning: a whole duck needs a day or more of refrigerator thawing, so the delivery date is never the cooking date.",
  byline: BYLINE,
  reviewedBy: REVIEWED,
  updated: UPDATED,
  basedOn: [
    "USDA labelling rules for poultry sold as fresh versus frozen, and USDA safe-thawing guidance.",
    "USDA danger-zone limits, which are what a compromised cold chain actually puts at risk.",
    "Cold-chain inspection practice already documented on our sourcing page, plus the weight-based thaw times on our thawing guide.",
  ],
  evidenceBasis:
    "Published seller catalogue and shipping information, read against USDA thawing and cold-storage guidance. Check the seller's own stated transit window against your delivery day.",
  sourceIds: ["usdaPoultryPrep", "usdaThawing", "usdaDangerZone", "fdaColdStorage"],
  funnel: [
    {
      to: "/learn/how-to-thaw-duck",
      label: "How to thaw duck safely",
      why: "The weight-based thaw times you need to schedule backward from your cooking date.",
    },
    {
      to: "/buy/where-to-buy-duck-online",
      label: "Where to buy duck online",
      why: "How to read a seller's shipping terms before the cold chain becomes your problem.",
    },
  ],
};

const SELECTION: AcquisitionPageMeta = {
  path: "/buy/how-to-choose-duck",
  intent: "How do I inspect and choose a good duck at the counter or on arrival?",
  answer:
    "Judge the fat cap and the skin first: you want an intact, dry, evenly thick layer, because torn or patchy skin never crisps evenly. Then read the label for the things that carry a defined meaning — the age class, whether it is sold fresh or frozen, and a processing or best-by date — and ignore the adjectives that do not.",
  byline: BYLINE,
  reviewedBy: REVIEWED,
  updated: UPDATED,
  basedOn: [
    "USDA duck labelling and handling guidance: age classes, fresh-versus-frozen definitions, and safe handling from purchase onward.",
    "The skin and fat-cap requirements of our own crispy-skin and scoring pages, which are what a good bird has to make possible.",
    "USDA cold-storage windows for how long a raw bird holds once it is home.",
  ],
  evidenceBasis:
    "USDA handling guidance and cold-chain practice, turned into a checklist for judging the bird in front of you.",
  sourceIds: ["usdaPoultryPrep", "usdaDangerZone", "fdaColdStorage"],
  funnel: [
    {
      to: "/buy/where-to-buy-duck-online",
      label: "Where to buy duck online",
      why: "The sourcing routes, and which ones let you inspect the bird before you pay.",
    },
    {
      to: "/gear/best-pan-for-duck-breast",
      label: "Best pan for duck breast",
      why: "A good fat cap still needs a pan that can render it without stalling.",
    },
  ],
};

/**
 * Holiday decision page. Lives under /learn because the reader is choosing a
 * centrepiece, not a seller. Comparative claims are limited to what a cook can
 * observe or plan: flavour, texture, yield, oven logistics, leftovers, and
 * familiarity. No prices, no popularity statistics, no turkey timings of our
 * own — turkey-specific numbers stay with USDA.
 */
const THANKSGIVING: AcquisitionPageMeta = {
  path: "/learn/duck-vs-turkey-thanksgiving",
  intent: "Should I serve duck or turkey for Thanksgiving, and what changes if I do?",
  answer:
    "Serve turkey when the table is large, the guests expect tradition, and you want leftovers for days. Serve duck when the table is small enough for the birds and pans your kitchen can hold, you care more about how it eats than how much of it there is, and you would rather manage rendering fat than a dry breast. Duck is richer and offers less serving capacity per bird than a turkey, so a duck holiday is usually a smaller one or a two-bird one — run your guest count through our serving calculator before you order.",
  byline: BYLINE,
  reviewedBy: REVIEWED,
  updated: "2026-08-17",
  basedOn: [
    "USDA safe-handling guidance for poultry — thawing, the 165°F minimum internal temperature, danger-zone limits and leftover windows — which applies to duck and turkey alike.",
    "USDA's own consumer guide to roasting turkey, which we point readers at rather than publishing turkey timings of our own, including its approximate unstuffed-turkey roasting ranges at 325°F.",
    "USDA's duck and goose guidance, including its approximate planning range of 30 to 35 min/lb at 350°F for a 4 to 6 lb whole duckling, and USDA's stuffing guidance.",
    "Our own published planning assumptions, which live in the whole-duck serving calculator rather than in this page, plus the oven workflow documented on our whole-roast-duck and carving pages.",
  ],
  evidenceBasis:
    "USDA temperature, thawing, and storage guidance for both birds, plus stated planning assumptions for serving numbers. Cost and availability vary by region and season, so check your own sellers.",
  sourceIds: [
    "usdaPoultryTemp",
    "usdaPoultryPrep",
    "usdaTurkeyRoasting",
    "usdaThawing",
    "usdaDangerZone",
    "usdaLeftovers",
    "usdaStuffing",
  ],
  funnel: [
    {
      to: "/tools/whole-duck-serving-calculator",
      label: "Whole-duck serving calculator",
      why: "The fastest way to settle the yield question: guest count in, number of birds and raw weight out.",
    },
    {
      to: "/cook/whole-roast-duck",
      label: "How to roast a whole duck",
      why: "The full holiday workflow, from drying the skin to resting and carving the bird.",
    },
    {
      to: "/buy/where-to-buy-duck-online",
      label: "Where to buy duck",
      why: "Holiday duck usually ships frozen, so ordering early is part of the decision.",
    },
  ],
};

export const ACQUISITION_PAGES: AcquisitionPageMeta[] = [
  CUTS,
  QUANTITY,
  FRESH_FROZEN,
  SELECTION,
  THANKSGIVING,
];


export function acquisitionPage(path: string): AcquisitionPageMeta | undefined {
  return ACQUISITION_PAGES.find((p) => p.path === path);
}
