/**
 * Central registry of every published guide page.
 *
 * Hubs, "Related Guides" modules, and the sitemap all read from here so a new
 * page becomes discoverable everywhere by adding one entry.
 */
export type GuidePillar = "cook" | "learn" | "buy" | "gear";

export type GuideCluster =
  | "breast"
  | "whole-duck"
  | "duck-fat"
  | "wild-duck"
  | "commerce"
  | "sourcing";


export type GuideKind = "technique" | "reference" | "diagnostic" | "pairing" | "money";

export interface GuideEntry {
  /** Route path, also used as the canonical URL. */
  path: string;
  /** Short card/nav title. */
  title: string;
  /** Full SEO <title> (already includes the brand suffix). */
  seoTitle: string;
  /** Meta description, unique per page. */
  description: string;
  /** One-line promise shown on hubs and related modules. */
  teaser: string;
  pillar: GuidePillar;
  cluster: GuideCluster;
  kind: GuideKind;
  /** Reading time in minutes, rounded. */
  minutes: number;
  /** Deliberate funnel: paths of the pages this one should send readers to. */
  related: string[];
}

export const GUIDES: GuideEntry[] = [
  {
    path: "/cook/how-to-cook-duck-breast",
    title: "How to Cook Duck Breast",
    seoTitle: "How to Cook Duck Breast: Crispy Skin, Juicy Centre | DeliciousDuck",
    description:
      "The cold-pan method for duck breast, step by step: scoring, gradual fat rendering, when to flip, thermometer targets, resting, and the five ways it goes wrong.",
    teaser: "The cold-pan method, why it works, and how to rescue it when it doesn't.",
    pillar: "cook",
    cluster: "breast",
    kind: "technique",
    minutes: 11,
    related: [
      "/learn/duck-breast-temperature-doneness",
      "/learn/how-to-score-duck-breast",
      "/learn/why-duck-skin-isnt-crispy",
      "/cook/best-sauces-for-duck-breast",
      "/gear/best-pan-for-duck-breast",
    ],
  },
  {
    path: "/learn/duck-breast-temperature-doneness",
    title: "Duck Breast Temperature & Doneness",
    seoTitle: "Duck Breast Temperature & Doneness Guide | DeliciousDuck",
    description:
      "USDA safety guidance versus restaurant doneness conventions for duck breast, plus carryover cooking, thermometer placement, thickness, and rest times.",
    teaser: "What the numbers mean, and where safety guidance and kitchen practice differ.",
    pillar: "learn",
    cluster: "breast",
    kind: "reference",
    minutes: 9,
    related: [
      "/cook/how-to-cook-duck-breast",
      "/tools/duck-doneness-guide",
      "/gear/best-thermometer-for-duck",
      "/learn/whole-duck-cooking-time",
    ],
  },
  {
    path: "/learn/how-to-score-duck-breast",
    title: "How to Score Duck Breast",
    seoTitle: "How to Score Duck Breast Without Cutting the Meat | DeliciousDuck",
    description:
      "Scoring depth, pattern choice, why the skin must be cold, knife grip and angle, and the mistakes that leak fat into the meat instead of out of it.",
    teaser: "Depth, pattern and knife control — the 90 seconds that decide your skin.",
    pillar: "learn",
    cluster: "breast",
    kind: "technique",
    minutes: 7,
    related: [
      "/cook/how-to-cook-duck-breast",
      "/learn/why-duck-skin-isnt-crispy",
      "/gear/best-knife-for-scoring-duck",
    ],
  },
  {
    path: "/learn/why-duck-skin-isnt-crispy",
    title: "Why Duck Skin Won't Crisp",
    seoTitle: "Why Duck Skin Won't Get Crispy — and How to Fix It | DeliciousDuck",
    description:
      "A diagnostic guide to soft, chewy or blistered duck skin: seven symptoms, their likely causes, what to do right now, and how to prevent each one next time.",
    teaser: "Seven symptoms, seven causes, and the fix you can still apply mid-cook.",
    pillar: "learn",
    cluster: "breast",
    kind: "diagnostic",
    minutes: 10,
    related: [
      "/cook/how-to-cook-duck-breast",
      "/learn/how-to-score-duck-breast",
      "/gear/best-pan-for-duck-breast",
      "/learn/how-to-render-duck-fat",
    ],
  },
  {
    path: "/cook/best-sauces-for-duck-breast",
    title: "Best Sauces for Duck Breast",
    seoTitle: "Best Sauces for Duck Breast: Pairings by Flavour Logic | DeliciousDuck",
    description:
      "Duck breast sauces organised by what they do — fruit and acid, wine reductions, savoury and umami, pepper and spice, bright and herbal — matched to method and occasion.",
    teaser: "Five sauce families, and which cooking method each one flatters.",
    pillar: "cook",
    cluster: "breast",
    kind: "pairing",
    minutes: 9,
    related: [
      "/cook/what-to-serve-with-duck-breast",
      "/cook/how-to-cook-duck-breast",
      "/learn/why-duck-skin-isnt-crispy",
      "/ingredients/orange-with-duck",
      "/ingredients/cherry-plum-with-duck",
      "/ingredients/best-acid-for-duck",
    ],
  },
  {
    path: "/cook/what-to-serve-with-duck-breast",
    title: "What to Serve With Duck Breast",
    seoTitle: "What to Serve With Duck Breast: Sides by Sauce & Season | DeliciousDuck",
    description:
      "A pairing matrix for duck breast sides: starch, vegetable and acid choices matched to your sauce, the season, and whether it's a weeknight or a celebration.",
    teaser: "A side-dish matrix built from your sauce, your season and your occasion.",
    pillar: "cook",
    cluster: "breast",
    kind: "pairing",
    minutes: 8,
    related: [
      "/cook/best-sauces-for-duck-breast",
      "/cook/ways-to-use-duck-fat",
      "/cook/how-to-cook-duck-breast",
      "/ingredients/best-acid-for-duck",
      "/tools/duck-pairing-finder",
    ],
  },
  {
    path: "/cook/whole-roast-duck",
    title: "Whole Roast Duck",
    seoTitle: "Whole Roast Duck: A First-Timer's Guide | DeliciousDuck",
    description:
      "How to roast a whole duck: drying the skin, trussing and pricking, managing a pan of rendering fat, verifying doneness by thermometer, resting and carving.",
    teaser: "The full workflow, from dry-fridge prep to a rested, carvable bird.",
    pillar: "cook",
    cluster: "whole-duck",
    kind: "technique",
    minutes: 12,
    related: [
      "/learn/whole-duck-cooking-time",
      "/learn/how-to-carve-a-duck",
      "/tools/duck-cooking-time-planner",
      "/tools/whole-duck-serving-calculator",
      "/learn/how-to-render-duck-fat",
      "/learn/duck-vs-turkey-thanksgiving",
      "/ingredients/dry-brine-duck",
      "/ingredients/duck-seasoning-guide",
    ],

  },
  {
    path: "/learn/whole-duck-cooking-time",
    title: "Whole Duck Cooking Time",
    seoTitle: "Whole Duck Cooking Time & Temperature Guide | DeliciousDuck",
    description:
      "Weight-based planning ranges versus temperature-based doneness for whole duck, why ovens disagree, how stuffing and starting temperature change things, and rest time.",
    teaser: "Plan by weight, finish by thermometer — and why the two never fully agree.",
    pillar: "learn",
    cluster: "whole-duck",
    kind: "reference",
    minutes: 9,
    related: [
      "/tools/duck-cooking-time-planner",
      "/tools/whole-duck-serving-calculator",
      "/cook/whole-roast-duck",
      "/learn/duck-vs-turkey-thanksgiving",
      "/learn/duck-breast-temperature-doneness",
    ],

  },
  {
    path: "/learn/how-to-carve-a-duck",
    title: "How to Carve a Whole Duck",
    seoTitle: "How to Carve a Whole Duck: Step-by-Step | DeliciousDuck",
    description:
      "Carving a roast duck in the order that actually works: rest, legs at the joint, breasts off the bone, slice across the grain, then save the carcass for stock.",
    teaser: "Six moves, in the order that keeps the skin intact and the meat hot.",
    pillar: "learn",
    cluster: "whole-duck",
    kind: "technique",
    minutes: 8,
    related: [
      "/cook/whole-roast-duck",
      "/learn/how-to-render-duck-fat",
      "/tools/whole-duck-serving-calculator",
      "/gear/best-knife-for-scoring-duck",
    ],
  },
  {
    path: "/learn/how-to-thaw-duck",
    title: "How to Thaw Duck Safely",
    seoTitle: "How to Thaw Duck Safely: Times by Weight | DeliciousDuck",
    description:
      "Refrigerator-first thawing for whole duck, breasts and legs, with planning times by weight, drip containment, cold-water backup, and what never to do.",
    teaser: "Fridge-first planning times, plus the cold-water fallback when you're late.",
    pillar: "learn",
    cluster: "whole-duck",
    kind: "reference",
    minutes: 7,
    related: [
      "/cook/whole-roast-duck",
      "/learn/whole-duck-cooking-time",
      "/buy/fresh-vs-frozen-duck",
      "/buy/where-to-buy-duck-online",
    ],

  },
  {
    path: "/cook/duck-leg-confit",
    title: "Duck Leg Confit",
    seoTitle: "Duck Leg Confit: Technique & Planning Guide | DeliciousDuck",
    description:
      "How confit actually works: the salt cure, how much fat you need, low-temperature poaching, safe chilling and storage, and crisping the legs to order.",
    teaser: "Cure, poach, chill, crisp — and the storage rules people get wrong.",
    pillar: "cook",
    cluster: "duck-fat",
    kind: "technique",
    minutes: 12,
    related: [
      "/learn/how-to-render-duck-fat",
      "/buy/duck-fat-buying-guide",
      "/cook/ways-to-use-duck-fat",
      "/learn/how-to-thaw-duck",
    ],
  },
  {
    path: "/learn/how-to-render-duck-fat",
    title: "How to Render Duck Fat",
    seoTitle: "How to Render, Strain & Store Duck Fat | DeliciousDuck",
    description:
      "Turn trim and roasting-pan drippings into clean duck fat: low-and-slow rendering, straining, separating juices, storage windows, and the signs it has turned.",
    teaser: "From trim to a clean jar, plus honest storage windows.",
    pillar: "learn",
    cluster: "duck-fat",
    kind: "technique",
    minutes: 9,
    related: [
      "/cook/ways-to-use-duck-fat",
      "/buy/duck-fat-buying-guide",
      "/tools/duck-fat-substitution-calculator",
      "/cook/duck-leg-confit",
    ],
  },
  {
    path: "/cook/ways-to-use-duck-fat",
    title: "15 Ways to Use Duck Fat",
    seoTitle: "15 Smart Ways to Cook With Duck Fat | DeliciousDuck",
    description:
      "Fifteen uses for duck fat where it genuinely outperforms butter or oil — potatoes, root vegetables, eggs, grains, searing, confit and savoury pastry — with amounts.",
    teaser: "Where duck fat beats butter or oil, and where it's just expensive.",
    pillar: "cook",
    cluster: "duck-fat",
    kind: "reference",
    minutes: 10,
    related: [
      "/learn/how-to-render-duck-fat",
      "/tools/duck-fat-substitution-calculator",
      "/buy/duck-fat-buying-guide",
      "/cook/what-to-serve-with-duck-breast",
    ],
  },
  {
    path: "/learn/wild-duck-vs-farmed-duck",
    title: "Wild Duck vs Farmed Duck",
    seoTitle: "Wild Duck vs Farmed Duck: Flavour, Fat & Cooking | DeliciousDuck",
    description:
      "Why wild duck cooks nothing like a farmed duck: fat cover, muscle use, species and diet variation, and which farmed-duck techniques transfer safely and which don't.",
    teaser: "Why farmed-duck technique fails on a wild bird — and what to change.",
    pillar: "learn",
    cluster: "wild-duck",
    kind: "reference",
    minutes: 9,
    related: [
      "/cook/how-to-cook-wild-duck-breast",
      "/learn/duck-breast-temperature-doneness",
      "/buy/where-to-buy-duck-online",
    ],

  },
  {
    path: "/cook/how-to-cook-wild-duck-breast",
    title: "How to Cook Wild Duck Breast",
    seoTitle: "How to Cook Wild Duck Breast Without Drying It Out | DeliciousDuck",
    description:
      "A method for lean, variable wild duck breast: skin-on versus skinless decision tree, hot-and-fast searing, thermometer discipline, and what marinades can't fix.",
    teaser: "A decision tree for lean, unpredictable birds — skin on or off.",
    pillar: "cook",
    cluster: "wild-duck",
    kind: "technique",
    minutes: 10,
    related: [
      "/learn/wild-duck-vs-farmed-duck",
      "/learn/duck-breast-temperature-doneness",
      "/gear/best-thermometer-for-duck",
      "/cook/best-sauces-for-duck-breast",
    ],
  },
  {
    path: "/buy/where-to-buy-duck-online",
    title: "Where to Buy Duck Online",
    seoTitle: "Where to Buy Duck Meat Online: How to Compare Sellers | DeliciousDuck",
    description:
      "A comparison framework for online duck sellers: cut availability, breed labelling, fresh versus frozen, shipping minimums, packaging, sourcing transparency and geography.",
    teaser: "Eight things to compare before you pay for cold-chain shipping.",
    pillar: "buy",
    cluster: "commerce",
    kind: "money",
    minutes: 11,
    related: [
      "/buy/what-cut-of-duck-to-buy",
      "/buy/fresh-vs-frozen-duck",
      "/buy/how-to-choose-duck",
      "/learn/how-to-thaw-duck",
      "/tools/whole-duck-serving-calculator",
      "/buy/duck-fat-buying-guide",
      "/cook/how-to-cook-duck-breast",
      "/gear/best-thermometer-for-duck",
    ],

  },
  {
    path: "/gear/best-thermometer-for-duck",
    title: "Best Thermometer for Duck",
    seoTitle: "Best Thermometers for Cooking Duck: What Matters | DeliciousDuck",
    description:
      "Instant-read versus leave-in probe thermometers for duck: read speed, tip thickness, oven monitoring, calibration and water resistance, matched to three cook profiles.",
    teaser: "Instant-read or leave-in? Match the tool to how you cook duck.",
    pillar: "gear",
    cluster: "commerce",
    kind: "money",
    minutes: 10,
    related: [
      "/learn/duck-breast-temperature-doneness",
      "/tools/duck-doneness-guide",
      "/learn/whole-duck-cooking-time",
      "/cook/how-to-cook-duck-breast",
      "/gear/best-pan-for-duck-breast",
      "/tools/duck-cooking-time-planner",
    ],
  },
  {
    path: "/gear/best-pan-for-duck-breast",
    title: "Best Pan for Duck Breast",
    seoTitle: "Best Pan for Duck Breast: Cast Iron vs Stainless | DeliciousDuck",
    description:
      "Cast iron, carbon steel, stainless clad or non-stick for duck breast: thermal mass, responsiveness, fond, pouring off hot fat, weight and cleanup — by cook profile.",
    teaser: "Thermal mass versus control, and which one your method needs.",
    pillar: "gear",
    cluster: "commerce",
    kind: "money",
    minutes: 10,
    related: [
      "/cook/how-to-cook-duck-breast",
      "/learn/why-duck-skin-isnt-crispy",
      "/learn/how-to-render-duck-fat",
      "/learn/duck-breast-temperature-doneness",
      "/gear/best-thermometer-for-duck",
    ],
  },
  {
    path: "/gear/best-knife-for-scoring-duck",
    title: "Best Knife for Scoring Duck",
    seoTitle: "Best Knife for Scoring Duck Skin: What to Look For | DeliciousDuck",
    description:
      "Which knife scores duck skin cleanly: chef's knife, petty or utility, boning and paring options compared on tip control, blade length, edge geometry and knuckle clearance.",
    teaser: "Tip control beats prestige — four blade shapes, honestly compared.",
    pillar: "gear",
    cluster: "commerce",
    kind: "money",
    minutes: 9,
    related: [
      "/learn/how-to-score-duck-breast",
      "/learn/how-to-carve-a-duck",
      "/cook/how-to-cook-duck-breast",
    ],
  },
  {
    path: "/buy/duck-fat-buying-guide",
    title: "Duck Fat Buying Guide",
    seoTitle: "Duck Fat Buying Guide: What to Look For & How Much | DeliciousDuck",
    description:
      "How to buy duck fat: jars versus tubs versus tins, rendered versus seasoned, label terms that matter, storage after opening, and how much you need per use.",
    teaser: "Packaging, labels, storage — and how much you actually need.",
    pillar: "buy",
    cluster: "duck-fat",
    kind: "money",
    minutes: 9,
    related: [
      "/learn/how-to-render-duck-fat",
      "/tools/duck-fat-substitution-calculator",
      "/cook/ways-to-use-duck-fat",
      "/cook/duck-leg-confit",
      "/buy/where-to-buy-duck-online",
      "/ingredients/duck-fat-vs-butter-oil",
      "/buy/fresh-vs-frozen-duck",
    ],
  },
  {
    path: "/buy/what-cut-of-duck-to-buy",
    title: "What Cut of Duck to Buy",
    seoTitle: "What Cut of Duck to Buy: Whole, Breast, Legs or Fat | DeliciousDuck",
    description:
      "Choose the duck cut your dish needs: whole bird, breast, leg quarters, or rendered fat — what each one is good at, what it costs you in effort, and which method it suits.",
    teaser: "Match the cut to the dish before you match it to a seller.",
    pillar: "buy",
    cluster: "sourcing",
    kind: "reference",
    minutes: 9,
    related: [
      "/buy/how-much-duck-per-person",
      "/buy/where-to-buy-duck-online",
      "/cook/how-to-cook-duck-breast",
      "/cook/whole-roast-duck",
      "/cook/duck-leg-confit",
      "/tools/what-should-i-cook",
    ],
  },
  {
    path: "/buy/how-much-duck-per-person",
    title: "How Much Duck Per Person",
    seoTitle: "How Much Duck Per Person? Portions by Cut | DeliciousDuck",
    description:
      "Duck portions by cut: cooked meat per person, the roughly 40% edible yield of a whole bird, one breast or one leg per plate, and how to plan leftovers on purpose.",
    teaser: "Cooked-weight portions, whole-bird yield, and when to size up.",
    pillar: "buy",
    cluster: "sourcing",
    kind: "reference",
    minutes: 8,
    related: [
      "/tools/whole-duck-serving-calculator",
      "/buy/what-cut-of-duck-to-buy",
      "/buy/where-to-buy-duck-online",
      "/learn/how-to-carve-a-duck",
      "/cook/whole-roast-duck",
    ],
  },
  {
    path: "/buy/fresh-vs-frozen-duck",
    title: "Fresh vs Frozen Duck",
    seoTitle: "Fresh vs Frozen Duck: Which to Buy & How to Receive It | DeliciousDuck",
    description:
      "What the fresh and frozen labels actually mean on duck, why mail order ships frozen, how to check a cold-chain delivery on arrival, and how to plan the thaw around it.",
    teaser: "Frozen isn't a downgrade — it's a scheduling decision.",
    pillar: "buy",
    cluster: "sourcing",
    kind: "reference",
    minutes: 9,
    related: [
      "/learn/how-to-thaw-duck",
      "/buy/where-to-buy-duck-online",
      "/buy/how-to-choose-duck",
      "/cook/whole-roast-duck",
    ],
  },
  {
    path: "/buy/how-to-choose-duck",
    title: "How to Choose a Duck",
    seoTitle: "How to Choose a Duck: Skin, Fat Cap & Label Checks | DeliciousDuck",
    description:
      "A purchase checklist for duck: judging the fat cap and skin, the label terms that carry a defined meaning, what to reject outright, and how to store it once it's home.",
    teaser: "What to look at, what to read, and what to walk away from.",
    pillar: "buy",
    cluster: "sourcing",
    kind: "reference",
    minutes: 8,
    related: [
      "/buy/fresh-vs-frozen-duck",
      "/buy/where-to-buy-duck-online",
      "/buy/what-cut-of-duck-to-buy",
      "/learn/why-duck-skin-isnt-crispy",
      "/learn/how-to-score-duck-breast",
    ],
  },
  {
    path: "/learn/duck-vs-turkey-thanksgiving",
    title: "Duck vs. Turkey for Thanksgiving",
    seoTitle: "Duck vs. Turkey for Thanksgiving | DeliciousDuck",
    description:
      "Duck or turkey for Thanksgiving? An honest side-by-side on flavour, serving yield, oven logistics, leftovers and guest familiarity — plus who should choose each and how to plan either.",
    teaser: "The verdict up front, then the tradeoffs nobody mentions until the oven is full.",
    pillar: "learn",
    cluster: "whole-duck",
    kind: "reference",
    minutes: 10,
    related: [
      "/cook/whole-roast-duck",
      "/tools/whole-duck-serving-calculator",
      "/learn/whole-duck-cooking-time",
      "/learn/how-to-thaw-duck",
      "/buy/where-to-buy-duck-online",
      "/gear/best-thermometer-for-duck",
    ],
  },
];


export const guideByPath = (path: string): GuideEntry | undefined =>
  GUIDES.find((g) => g.path === path);

export const guidesByPillar = (pillar: GuidePillar): GuideEntry[] =>
  GUIDES.filter((g) => g.pillar === pillar);

export const guidesByCluster = (cluster: GuideCluster): GuideEntry[] =>
  GUIDES.filter((g) => g.cluster === cluster);

export const CLUSTER_LABELS: Record<GuideCluster, string> = {
  breast: "The duck breast cluster",
  "whole-duck": "The whole duck cluster",
  "duck-fat": "The duck fat cluster",
  "wild-duck": "Wild duck",
  commerce: "Buying & gear",
  sourcing: "Sourcing & selection",
};

