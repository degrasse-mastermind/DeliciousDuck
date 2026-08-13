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
 *   stock level, merchant name, or hands-on test result. Do not add one.
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
  /** Required explicit statement about what has not been done. */
  notTested: string;
  /** Ids in `src/data/sources.ts` backing the factual claims on the page. */
  sourceIds: string[];
  /** Forward funnel into decision guides, calculators, or technique pages. */
  funnel: { to: string; label: string; why: string }[];
}

const BYLINE = "DeliciousDuck Editorial";
const REVIEWED = "Reviewed against our editorial standards before publication.";
const UPDATED = "2026-08-14";

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
  notTested:
    "We do not publish prices, availability, or brand claims, and we have not compared cuts from named sellers. This page is about matching a cut to a method.",
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

const BREEDS: AcquisitionPageMeta = {
  path: "/buy/duck-breeds-for-cooking",
  intent: "What is the difference between Pekin, Moulard, and Muscovy duck for cooking?",
  answer:
    "Pekin is the standard commercial duck: smaller, fattier, mild, and forgiving. Moulard is a larger cross bred mainly for foie gras, giving the thick, leaner breast sold as magret. Muscovy is leaner again, with less fat under the skin and a firmer, more pronounced flavour. A recipe calibrated for Pekin will render less fat and cook faster on Muscovy or Moulard.",
  byline: BYLINE,
  reviewedBy: REVIEWED,
  updated: UPDATED,
  basedOn: [
    "Breed and species differences already documented across our sourcing and wild-versus-farmed pages: fat cover, breast thickness, and flavour intensity.",
    "USDA duck labelling guidance, including the age classes that change tenderness more than breed does.",
    "The temperature and rendering requirements on our own duck breast pages.",
  ],
  notTested:
    "We have not run a side-by-side tasting or measured fat yield by breed ourselves, and we name no producers or brands. Treat the differences below as direction for adjusting technique, not as measured figures.",
  sourceIds: ["usdaPoultryPrep", "usdaPoultryTemp"],
  funnel: [
    {
      to: "/buy/where-to-buy-duck-online",
      label: "Where to buy duck online",
      why: "Breed is only useful if the listing names it — this is how to read one that does.",
    },
    {
      to: "/gear/best-thermometer-for-duck",
      label: "Best thermometer for duck",
      why: "A leaner breed shortens the window between rare and grey, which is a thermometer problem.",
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
  notTested:
    "These are portion-planning assumptions, not nutritional recommendations, and they carry no food-safety component. Appetites and menus vary more than any calculator can model.",
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
  notTested:
    "We have not placed an order with any seller, and we publish no delivery-time, packaging-quality, or carrier claims. Check the seller's own stated transit window against your delivery day.",
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
  notTested:
    "We have not graded or compared birds from named sellers, and we publish no brand or producer judgements. This is a checklist for judging what is in front of you.",
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

export const ACQUISITION_PAGES: AcquisitionPageMeta[] = [
  CUTS,
  BREEDS,
  QUANTITY,
  FRESH_FROZEN,
  SELECTION,
];

export function acquisitionPage(path: string): AcquisitionPageMeta | undefined {
  return ACQUISITION_PAGES.find((p) => p.path === path);
}
