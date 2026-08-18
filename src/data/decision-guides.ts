/**
 * Reusable editorial framework for high-intent commercial decision guides.
 *
 * One entry per decision page. The shape is deliberately narrow so future
 * buying guides scale consistently and so the honesty rules are structural
 * rather than something an author has to remember:
 *
 * - `methodology` states what the assessment is actually based on.
 * - `evidenceBasis` states positively what the assessment rests on.
 * - There is no field for a price, rating, review count, ranking score,
 *   discount, commission, stock level, or certification. Do not add one.
 * - Merchant destinations never appear here. Pages render them through the
 *   commercial-link registry (`src/data/commercial-links.ts`) only.
 */

/** "If this is you, choose that" — the scannable answer above the detail. */
export interface QuickPick {
  /** The reader's situation, in their words. */
  situation: string;
  /** The category (never a product model) that fits it. */
  choice: string;
  /** One sentence of mechanism, not marketing. */
  why: string;
}

/** A scannable decision matrix: options across, criteria down. */
export interface DecisionMatrix {
  caption: string;
  /** Column header for the criteria column. */
  criterionLabel: string;
  /** Option column headers, in a stable, non-ranked order. */
  options: string[];
  rows: {
    criterion: string;
    /** One cell per option, same order and length as `options`. */
    values: string[];
  }[];
}

/** "Best for" guidance without an implied ranking. */
export interface BestForEntry {
  option: string;
  forWhom: string;
  notFor: string;
}

export interface DecisionGuideMeta {
  /** Route path this framework belongs to. Must be a published page. */
  path: string;
  /** Plain-language standard the page holds itself to. */
  evaluationStandard: string;
  /** What the assessment is based on. Evidence types only, no claims. */
  methodology: string[];
  /** Positive statement of what the assessment rests on. */
  evidenceBasis: string;
  /** YYYY-MM-DD the editorial content was last reviewed. */
  updated: string;
  /** Byline shown on the page. Matches the Organization author in schema. */
  byline: string;
  /** Who reviewed it, in the site's existing transparency language. */
  reviewedBy: string;
  quickPicks: QuickPick[];
  bestFor: BestForEntry[];
  matrix: DecisionMatrix;
}

const SOURCING: DecisionGuideMeta = {
  path: "/buy/where-to-buy-duck-online",
  evaluationStandard:
    "We compare sourcing routes, not sellers, on the handful of factors that change what lands in your kitchen: which cuts you can actually get, whether the breed is named, how the bird travels, and what the order commits you to.",
  methodology: [
    "Publicly published catalogue and shipping information from the sellers named on this page, read on the date below.",
    "Duck cooking requirements from our own technique pages — cut-to-method fit and thaw time by weight — plus USDA labelling and handling guidance.",
    "Cold-chain handling and inspection practice that applies to any frozen meat shipment.",
  ],
  evidenceBasis:
    "Published catalogue and shipping information from the sellers named here, read on the date above and weighed against the cut-to-method and thaw-time requirements in our own technique pages. Prices, stock levels, and delivery windows come from the seller's own listing.",
  updated: "2026-08-13",
  byline: "DeliciousDuck Editorial",
  reviewedBy: "Reviewed against our editorial standards before publication.",
  quickPicks: [
    {
      situation: "You want duck breast this week and don't care about breed",
      choice: "Local butcher or specialty grocer",
      why: "No shipping window to plan around, and you can see the fat cap before you pay for it.",
    },
    {
      situation: "You need a specific cut — breast portions, leg quarters, or rendered fat",
      choice: "Mail order from a specialty distributor",
      why: "Named cuts are the thing general retailers stock least consistently.",
    },
    {
      situation: "You care most about how the bird was raised",
      choice: "Farm or farm-direct retailer",
      why: "A producer selling its own birds can answer breed, feed, and processing questions directly.",
    },
    {
      situation: "You're cooking a whole duck for a fixed date",
      choice: "Any route, ordered early enough to thaw",
      why: "A whole bird can need a full day or more in the refrigerator, so the delivery date is not the cooking date.",
    },
  ],
  bestFor: [
    {
      option: "Local butcher",
      forWhom: "Cooks who want to inspect the bird, ask questions in person, and skip shipping entirely.",
      notFor: "Anyone hunting a specific cut a butcher doesn't routinely order.",
    },
    {
      option: "Specialty grocer",
      forWhom: "Convenience buyers who mostly cook breast and want a predictable, repeatable purchase.",
      notFor: "Cooks who need rendered fat, leg quarters, or breed information on the label.",
    },
    {
      option: "Farm / farm-direct",
      forWhom: "Buyers whose first question is about the production method rather than the cut list.",
      notFor: "Anyone who needs a wide cut selection available on demand year-round.",
    },
    {
      option: "Mail-order specialty distributor",
      forWhom: "Cooks shopping by technique who want several duck cuts plus fat in one shipment.",
      notFor: "Last-minute cooking, or small orders where cold-chain shipping dominates the cost.",
    },
  ],
  matrix: {
    caption: "Four sourcing routes compared on the factors that change your cooking",
    criterionLabel: "What you're deciding on",
    options: ["Local butcher", "Specialty grocer", "Farm / farm-direct", "Mail order"],
    rows: [
      {
        criterion: "Cut range",
        values: [
          "Whatever the counter ordered; special requests possible with notice",
          "Usually whole birds and breast only",
          "Narrow, and tied to what the farm processes",
          "Widest — whole, breast, legs, and rendered fat",
        ],
      },
      {
        criterion: "Breed named",
        values: [
          "Ask; the butcher usually knows",
          "Often not stated on the package",
          "Yes, and the farm can explain it",
          "Frequently stated on the product page",
        ],
      },
      {
        criterion: "Fresh or frozen",
        values: ["Often fresh", "Fresh or frozen", "Usually frozen", "Almost always frozen"],
      },
      {
        criterion: "Thaw planning needed",
        values: ["Rarely", "Sometimes", "Yes", "Yes — build in a day or more"],
      },
      {
        criterion: "Shipping and minimums",
        values: [
          "None",
          "None",
          "Cold-chain shipping, often with a minimum",
          "Cold-chain shipping with an order minimum; read checkout, not the product page",
        ],
      },
      {
        criterion: "Traceability",
        values: [
          "As good as the butcher's own supply chain",
          "Usually generic label language",
          "Strongest — one producer, one answer",
          "Varies; look for producer and processing detail, not adjectives",
        ],
      },
      {
        criterion: "Best-fit recipe",
        values: [
          "Pan-seared breast on short notice",
          "A first duck breast, cooked midweek",
          "Whole roast where provenance matters to you",
          "Confit, breast portions, or a multi-cut cooking plan",
        ],
      },
    ],
  },
};

const THERMOMETER: DecisionGuideMeta = {
  path: "/gear/best-thermometer-for-duck",
  evaluationStandard:
    "We compare thermometer types against the three duck cooks that actually stress them — a breast that passes its window in seconds, a whole bird that runs for hours, and a low, slow confit — and describe the specifications that decide each case.",
  methodology: [
    "Published manufacturer specifications for the categories described: stated read time, probe dimensions, temperature range, stated accuracy, and water-resistance rating.",
    "The temperature targets and probe placement on our own duck doneness and cooking-time pages.",
    "Standard verification practice any cook can run at home: an ice-bath check and a boiling-water check.",
  ],
  evidenceBasis:
    "Published manufacturer specifications for each category — stated read time, probe dimensions, temperature range, stated accuracy, and water resistance — read against the temperature targets on our doneness and cooking-time pages.",
  updated: "2026-08-13",
  byline: "DeliciousDuck Editorial",
  reviewedBy: "Reviewed against our editorial standards before publication.",
  quickPicks: [
    {
      situation: "You mostly cook duck breast",
      choice: "Fast, thin-tipped instant-read",
      why: "The doneness window on a breast is measured in seconds, and a thin tip doesn't drain the muscle you just cooked.",
    },
    {
      situation: "You roast whole ducks",
      choice: "Leave-in probe with an alarm",
      why: "It watches a two-hour cook without you opening the oven, which is what actually costs you heat.",
    },
    {
      situation: "You cook confit or other long, low cooks",
      choice: "Leave-in probe, or a thermometer rated for the oil temperature you hold",
      why: "You're holding a stable low temperature for hours, so continuous monitoring beats repeated spot-checks.",
    },
    {
      situation: "You want one tool for everything",
      choice: "Instant-read, plus an oven thermometer if you suspect your oven lies",
      why: "An instant-read covers every cut; an ambient reading explains cooking times that don't match the recipe.",
    },
  ],
  bestFor: [
    {
      option: "Fast instant-read",
      forWhom: "Breast-first cooks, and anyone who wants one thermometer for all proteins.",
      notFor: "Long unattended roasts — you have to be standing there to use it.",
    },
    {
      option: "Leave-in probe with alarm",
      forWhom: "Whole-duck roasters and confit cooks who want to stop opening the oven door.",
      notFor: "Duck breast, where the probe is usually too thick for a thin cut.",
    },
    {
      option: "Oven / ambient thermometer",
      forWhom: "Anyone whose roasts consistently take longer or shorter than the recipe says.",
      notFor: "Reading the meat — it tells you about the oven, not the duck.",
    },
    {
      option: "Infrared surface thermometer",
      forWhom: "Checking pan surface temperature before the breast goes in.",
      notFor: "Doneness of any kind. It reads a surface, never an internal temperature.",
    },
  ],
  matrix: {
    caption: "Thermometer types compared on what matters when cooking duck",
    criterionLabel: "Specification",
    options: ["Instant-read", "Leave-in probe", "Oven / ambient", "Infrared surface"],
    rows: [
      {
        criterion: "What it answers",
        values: [
          "Internal temperature, right now",
          "Internal temperature, continuously",
          "The oven's real air temperature",
          "Surface temperature of a pan or skin",
        ],
      },
      {
        criterion: "Speed",
        values: [
          "Look for a stated read time in low single-digit seconds",
          "Continuous, so speed is not the constraint",
          "Slow by design — it tracks a settled environment",
          "Effectively instant",
        ],
      },
      {
        criterion: "Probe geometry",
        values: [
          "Thin tip; the thinner the better on a breast",
          "Thicker, cabled or wireless; built to stay put",
          "No probe — it hangs or stands in the oven",
          "No probe at all",
        ],
      },
      {
        criterion: "Accuracy check",
        values: [
          "Ice-bath and boiling-water checks; some models allow user calibration",
          "Same checks; verify each probe separately",
          "Compare against a known-good probe",
          "Hard to verify at home; treat readings as approximate",
        ],
      },
      {
        criterion: "Temperature range to look for",
        values: [
          "Covers fridge-cold through hot-pan territory",
          "Check the probe and cable ratings separately from the display",
          "Covers the full oven range you actually use",
          "Check the stated range covers searing temperatures",
        ],
      },
      {
        criterion: "Waterproofing and cleaning",
        values: [
          "Check the stated rating before rinsing under a tap",
          "Cables are usually the weak point; wipe rather than submerge",
          "Wipe only",
          "Wipe only",
        ],
      },
      {
        criterion: "Duck cook it suits",
        values: [
          "Breast; final check before carving a whole bird",
          "Whole roast; confit",
          "Diagnosing whole-roast timing",
          "Pre-heating a pan for the sear",
        ],
      },
    ],
  },
};

const PAN: DecisionGuideMeta = {
  path: "/gear/best-pan-for-duck-breast",
  evaluationStandard:
    "We compare pan materials against the actual sequence a duck breast demands — a long cold-start render, a hot finish, a mid-cook pour-off of hot fat, and often a pan sauce built on the fond — and name the trade-off each material makes.",
  methodology: [
    "Material heat behaviour: thermal mass, conductivity, and how quickly a pan responds when you change the burner.",
    "The requirements of our own duck breast method, crispy-skin troubleshooting, and pan-sauce pages.",
    "Manufacturer-published practicalities: oven-safe temperature, induction compatibility, and care instructions for each material class.",
  ],
  evidenceBasis:
    "Material heat behaviour and manufacturer-published care and oven-safe limits, weighed against what a long render, a hot finish, and a pan sauce each ask of a pan. The comparison is by material category rather than by product.",
  updated: "2026-08-13",
  byline: "DeliciousDuck Editorial",
  reviewedBy: "Reviewed against our editorial standards before publication.",
  quickPicks: [
    {
      situation: "You want the most even, most reliable crisp",
      choice: "Cast iron",
      why: "Its thermal mass barely notices a cold breast landing on it, so the render never stalls.",
    },
    {
      situation: "You want the best all-round compromise",
      choice: "Carbon steel",
      why: "It responds in seconds when the render runs hot, holds fond, and is light enough to pour off fat safely.",
    },
    {
      situation: "A wine, citrus, or fruit pan sauce is part of the plan",
      choice: "Stainless clad",
      why: "It is acid-safe, so you can deglaze in the same pan you seared in without stripping seasoning.",
    },
    {
      situation: "All you own is non-stick",
      choice: "Borrow or buy one of the three above",
      why: "The coating fights both the sustained heat and the fond that the method depends on.",
    },
  ],
  bestFor: [
    {
      option: "Cast iron",
      forWhom: "Cooks who prioritise even, maximum crisp and don't mind a heavy pan.",
      notFor: "Acidic pan sauces, fast heat corrections, or anyone who dislikes lifting weight one-handed.",
    },
    {
      option: "Carbon steel",
      forWhom: "Cooks who want responsiveness and fond in a pan light enough to pour from.",
      notFor: "Anyone unwilling to dry and re-oil it after washing.",
    },
    {
      option: "Stainless clad",
      forWhom: "Sauce-builders and low-maintenance cooks who want dishwasher tolerance.",
      notFor: "Cooks chasing the absolute maximum crisp from a thin, cheap pan.",
    },
    {
      option: "Non-stick",
      forWhom: "Not this method. Keep it for eggs.",
      notFor: "Duck breast — no sustained high heat, and no fond for a sauce.",
    },
  ],
  matrix: {
    caption: "Pan materials compared across the duck breast sequence",
    criterionLabel: "What you're deciding on",
    options: ["Cast iron", "Carbon steel", "Stainless clad", "Non-stick"],
    rows: [
      {
        criterion: "Heat behaviour",
        values: [
          "High mass, very stable, slow to respond",
          "Moderate mass, fast response",
          "Even through the clad core, moderate response",
          "Varies, and not rated for sustained high heat",
        ],
      },
      {
        criterion: "Fat rendering",
        values: [
          "Steadiest render once heated",
          "Strong render with easy mid-cook correction",
          "Good render; watch for hot spots on thin pans",
          "Poor fit — heat ceiling limits the sear",
        ],
      },
      {
        criterion: "Fond for a pan sauce",
        values: ["Yes, but seasoning reacts with acid", "Yes; limit long acidic reductions", "Yes, and acid-safe", "By design, no"],
      },
      {
        criterion: "Size and wall height",
        values: [
          "10–11 in / 25–28 cm skillet fits two breasts; low walls",
          "Similar; sloped-side versions pour best",
          "Available in both skillet and sauté shapes",
          "Common in the right size, wrong material",
        ],
      },
      {
        criterion: "Pouring off hot fat",
        values: [
          "Awkward — heavy, usually no spout",
          "Easiest of the four",
          "Easy; many have a rolled or flared rim",
          "Easy, but you shouldn't be here",
        ],
      },
      {
        criterion: "Weight and oven transfer",
        values: [
          "Heaviest; check you can lift it one-handed hot",
          "Light and oven-friendly",
          "Moderate; confirm the handle's oven rating",
          "Handles are often not oven-rated",
        ],
      },
      {
        criterion: "Induction compatible",
        values: ["Yes", "Yes", "Only if the base is magnetic — check the spec", "Depends on the base"],
      },
      {
        criterion: "Maintenance",
        values: [
          "Dry and re-oil after washing",
          "Dry and re-oil after washing",
          "Dishwasher tolerant",
          "Gentle washing; the coating wears out",
        ],
      },
    ],
  },
};

const DUCK_FAT: DecisionGuideMeta = {
  path: "/buy/duck-fat-buying-guide",
  evaluationStandard:
    "We compare the formats rendered duck fat is sold in, plus rendering your own, on ingredient purity, how much you get, how you store it once opened, and the heat you intend to use it at.",
  methodology: [
    "Label and ingredient-list conventions on retail rendered duck fat: what a single-ingredient label tells you versus a seasoned or blended one.",
    "Our own rendering, storage, and confit pages for keeping windows and quantities.",
    "General fat-handling practice — clean rendering, straining out juices, and judging fat by colour and smell before use.",
  ],
  evidenceBasis:
    "Retail label and ingredient-list conventions on rendered duck fat, read against the storage windows and quantities on our rendering and confit pages. The comparison is by format rather than by brand.",
  updated: "2026-08-13",
  byline: "DeliciousDuck Editorial",
  reviewedBy: "Reviewed against our editorial standards before publication.",
  quickPicks: [
    {
      situation: "You want duck fat for roast potatoes a few times a year",
      choice: "A small jar of plain rendered fat",
      why: "Small formats let you finish the jar inside a sensible keeping window instead of nursing an old one.",
    },
    {
      situation: "You're making confit",
      choice: "A large tub, or render your own from trim",
      why: "Confit needs enough fat to submerge the legs, which is far more than a small jar holds.",
    },
    {
      situation: "You already roast whole ducks",
      choice: "Render your own",
      why: "The trim and pan drippings you are currently throwing away are the same ingredient you'd be buying.",
    },
    {
      situation: "You want one flavour you can control",
      choice: "Plain rendered fat, single ingredient",
      why: "Seasoned or blended fat makes a flavour decision for you in every dish you use it in.",
    },
  ],
  bestFor: [
    {
      option: "Small glass jar",
      forWhom: "Occasional use where finishing it within the keeping window matters.",
      notFor: "Confit or anything needing volume.",
    },
    {
      option: "Large tub or tin",
      forWhom: "Confit, frequent roasting, or a household that cooks with duck fat weekly.",
      notFor: "Anyone who will open it once and forget it at the back of the fridge.",
    },
    {
      option: "Seasoned or blended fat",
      forWhom: "Cooks who want one specific flavoured application and nothing else.",
      notFor: "General-purpose cooking, where the added flavour follows you everywhere.",
    },
    {
      option: "Rendered at home",
      forWhom: "Anyone already cooking whole ducks or breasts with trim to spare.",
      notFor: "Someone who needs a large volume today and has no duck on hand.",
    },
  ],
  matrix: {
    caption: "Duck fat formats compared",
    criterionLabel: "What you're deciding on",
    options: ["Small jar", "Large tub / tin", "Seasoned or blended", "Rendered at home"],
    rows: [
      {
        criterion: "Ingredient purity",
        values: [
          "Read the list — plain fat should be one ingredient",
          "Same check applies; volume doesn't change the label",
          "Contains added aromatics, salt, or other fats by design",
          "Exactly what you put in, and nothing else",
        ],
      },
      {
        criterion: "Volume vs. use",
        values: [
          "Enough for pan cooking and roast vegetables",
          "The only practical format for confit",
          "Whatever the jar holds; flavour limits the uses",
          "As much as your trim and drippings yield",
        ],
      },
      {
        criterion: "Storage after opening",
        values: [
          "Refrigerate; keep it clean and covered",
          "Refrigerate, or portion and freeze what you won't use soon",
          "Refrigerate; treat as a shorter-life product than plain fat",
          "Strain well, refrigerate or freeze in portions",
        ],
      },
      {
        criterion: "Heat suitability",
        values: [
          "Fine for roasting and pan cooking",
          "Same, in larger quantities",
          "Added solids can scorch before the fat would",
          "Depends on how well you strained the meat juices out",
        ],
      },
      {
        criterion: "Intended use",
        values: [
          "Potatoes, root vegetables, eggs, searing",
          "Confit, batch roasting",
          "One dish you want that flavour in",
          "Anything, including topping up a confit batch",
        ],
      },
      {
        criterion: "Effort",
        values: ["None", "None", "None", "A low, slow render plus straining and storage"],
      },
    ],
  },
};

export const DECISION_GUIDES: DecisionGuideMeta[] = [SOURCING, THERMOMETER, PAN, DUCK_FAT];

export function decisionGuide(path: string): DecisionGuideMeta | undefined {
  return DECISION_GUIDES.find((g) => g.path === path);
}
