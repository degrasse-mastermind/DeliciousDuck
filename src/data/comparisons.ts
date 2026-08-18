/**
 * Comparison data for commercial pages.
 *
 * Rules baked into this shape:
 * - No prices, star ratings, review counts, or testing claims. None of these
 *   items has been hands-on tested by DeliciousDuck.
 * - Rows that map to a real merchant carry `merchantId` and get their
 *   destination from the registry in src/data/affiliates.ts — that is the one
 *   place a program is activated. `directUrl` here is only for rows with no
 *   registry entry, and is always a plain, non-affiliate URL.
 * - Never render a placeholder "#" link. A row with no legitimate destination
 *   simply shows no CTA.
 */
export type AffiliateStatus = "active" | "pending" | "none";

export interface ComparisonRow {
  id: string;
  /** Merchant, brand, or product-category name. */
  name: string;
  /** Short neutral label, e.g. "Speciality butcher" or "Instant-read". */
  kind: string;
  /** Who this is the right answer for. */
  bestFor: string;
  /** The factors a reader should weigh, keyed to the page's comparison columns. */
  decisionFactors: Record<string, string>;
  pros: string[];
  tradeoffs: string[];
  /** Registry key in src/data/affiliates.ts. Activation happens there, not here. */
  merchantId?: string;
  affiliateUrl?: string;
  directUrl?: string;
  affiliateStatus: AffiliateStatus;
  /** ISO-ish YYYY-MM string of when we last checked the facts above. */
  lastVerified: string;
  /** Optional per-row note, e.g. what still needs verification. */
  note?: string;
}

/**
 * Disclosure copy. Two variants, chosen by whether ANY affiliate program is
 * genuinely active. While every program is pending, the copy must not claim we
 * currently earn commissions — it states the plain truth instead.
 */
export const DISCLOSURE_TEXT_ACTIVE =
  "DeliciousDuck may earn a commission from qualifying purchases made through links on this page, at no extra cost to you. We do not accept payment for placement, and we do not publish prices, ratings, or test results we have not verified ourselves.";

export const DISCLOSURE_TEXT_PENDING =
  "We currently earn no commission from any link on this page. Outbound links go straight to the seller, with no affiliate tracking. If that changes, this notice will say so before the first paid link. We do not accept payment for placement, and we do not publish prices, ratings, or test results we have not verified ourselves.";

/* ------------------------------------------------------------------ */
/* Where to buy duck online                                            */
/* ------------------------------------------------------------------ */

export const MERCHANT_FACTORS = [
  { key: "cuts", label: "Cut availability" },
  { key: "labelling", label: "Breed & species labelling" },
  { key: "state", label: "Fresh or frozen" },
  { key: "shipping", label: "Shipping & minimums" },
  { key: "transparency", label: "Sourcing transparency" },
  { key: "geography", label: "Where it ships" },
] as const;

export const DUCK_MERCHANTS: ComparisonRow[] = [
  {
    id: "dartagnan",
    name: "D'Artagnan",
    kind: "Speciality game & poultry distributor (US)",
    bestFor:
      "Cooks who want named duck cuts — magret, leg quarters, rendered fat — from one order.",
    decisionFactors: {
      cuts: "Broad duck range across whole birds, breast, legs, and rendered fat.",
      labelling: "Publishes breed and producer detail on many duck listings.",
      state: "Typically ships frozen with cold-chain packaging.",
      shipping: "Flat or tiered shipping with order minimums; confirm at checkout.",
      transparency: "Producer-network sourcing described on the site.",
      geography: "United States.",
    },
    pros: [
      "One of the few US sellers offering magret, leg quarters, and fat together.",
      "Cut naming is specific enough to shop by technique rather than guesswork.",
    ],
    tradeoffs: [
      "Speciality pricing; check current shipping thresholds before ordering.",
      "Frozen delivery means thaw planning — allow a full day or more in the fridge.",
    ],
    affiliateStatus: "none",
    merchantId: "dartagnan",
    lastVerified: "2026-08",
    note: "Listed as a sourcing candidate based on public catalogue information. No affiliate relationship is in place, and we have not ordered from them for a hands-on review.",
  },
  {
    id: "us-wellness-meats",
    name: "US Wellness Meats",
    kind: "Farm-direct online meat retailer (US)",
    bestFor:
      "Shoppers who care most about production method and are happy to buy what's in stock.",
    decisionFactors: {
      cuts: "Duck selection is narrower than a dedicated game distributor and varies by season.",
      labelling: "Production-method claims are prominent on listings.",
      state: "Frozen, shipped in insulated packaging.",
      shipping: "Order minimums apply; confirm current thresholds at checkout.",
      transparency: "Farm and production practices described at length.",
      geography: "United States.",
    },
    pros: [
      "Strong production-method detail for buyers who prioritise sourcing.",
      "Bundles can reduce per-pound shipping cost on larger orders.",
    ],
    tradeoffs: [
      "Duck stock rotates, so a specific cut may not be available when you need it.",
      "Fewer duck-specific cuts than a speciality game supplier.",
    ],
    affiliateStatus: "none",
    merchantId: "us-wellness-meats",
    lastVerified: "2026-08",
    note: "Listed as a sourcing candidate from public catalogue information. No affiliate relationship or hands-on order review yet.",
  },
  {
    id: "local-asian-market",
    name: "Asian supermarkets & local butchers",
    kind: "In-person sourcing",
    bestFor: "Anyone within reach of one — usually the cheapest whole duck you'll find.",
    decisionFactors: {
      cuts: "Whole ducks are common; breast and leg quarters are less predictable.",
      labelling: "Often minimal; ask staff about breed and delivery day.",
      state: "Frequently fresh or previously frozen, sometimes hanging roast-ready.",
      shipping: "None — no shipping cost, no thaw wait.",
      transparency: "Varies enormously; conversation is your best tool.",
      geography: "Wherever you are.",
    },
    pros: [
      "No cold-chain shipping cost, and you can inspect the bird before buying.",
      "Whole ducks are usually far cheaper than mail order.",
    ],
    tradeoffs: [
      "Availability of specific cuts is unpredictable.",
      "Breed and processing-date information may be unavailable.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "farm-direct",
    name: "Farm-direct producers",
    kind: "Small-producer direct sales",
    bestFor: "Seasonal buyers who want traceability down to the flock.",
    decisionFactors: {
      cuts: "Usually whole birds; cuts depend on the processor.",
      labelling: "Best-in-class — breed, feed, and processing date are often known.",
      state: "Fresh in season, otherwise frozen.",
      shipping: "Local pickup or regional courier; minimums are common.",
      transparency: "You can usually ask the person who raised the bird.",
      geography: "Regional.",
    },
    pros: [
      "Best traceability of any route, which is what actually predicts flavour and fat.",
      "Often the freshest bird available outside a butcher counter.",
    ],
    tradeoffs: [
      "Seasonal windows and limited quantities.",
      "Rarely offers portioned cuts or rendered fat.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
];

/* ------------------------------------------------------------------ */
/* Thermometers                                                        */
/* ------------------------------------------------------------------ */

export const THERMOMETER_FACTORS = [
  { key: "use", label: "Primary use" },
  { key: "speed", label: "Read speed" },
  { key: "tip", label: "Probe tip" },
  { key: "monitor", label: "Oven monitoring" },
  { key: "care", label: "Calibration & care" },
] as const;

export const THERMOMETERS: ComparisonRow[] = [
  {
    id: "instant-read",
    name: "Fast instant-read thermometer",
    kind: "Category",
    bestFor: "Duck breast, and anyone who cooks breast more often than whole birds.",
    decisionFactors: {
      use: "Spot-checks: you open, probe, read, and decide within a few seconds.",
      speed: "Look for a stated read time in the low single-digit seconds.",
      tip: "A thin tip matters most on breast — a fat probe tears the fibres and leaks juice.",
      monitor: "None. You have to be at the pan.",
      care: "Check against an ice bath (32°F/0°C); some models offer user calibration.",
    },
    pros: [
      "The only practical tool for a breast that passes through its window in under a minute.",
      "Also useful for confirming rested temperature before slicing.",
    ],
    tradeoffs: [
      "No alarm, no unattended cooking.",
      "You lose oven heat every time you check a roast.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "leave-in-probe",
    name: "Leave-in probe with alarm",
    kind: "Category",
    bestFor: "Whole roast duck, confit, and long low-temperature cooks.",
    decisionFactors: {
      use: "Probe stays in the bird; the display or app tells you when to act.",
      speed: "Less relevant — it tracks continuously rather than sampling.",
      tip: "Thicker than an instant-read; fine for a thigh, clumsy on a breast.",
      monitor: "Its whole reason to exist. Many models also read ambient oven temperature.",
      care: "Cable and probe are the wear points; check the warranty terms.",
    },
    pros: [
      "Removes the guesswork from a two-hour roast without opening the oven.",
      "Ambient-probe models expose how far your oven drifts from its dial.",
    ],
    tradeoffs: [
      "Not a substitute for a fast spot-check at the moment of truth.",
      "Cables and probes fail before displays do.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "thermoworks",
    name: "ThermoWorks",
    kind: "Brand candidate",
    bestFor:
      "Cooks who want a documented accuracy spec rather than an unlabelled generic probe.",
    decisionFactors: {
      use: "Sells both instant-read and leave-in probe styles.",
      speed: "Publishes read-speed and accuracy specifications per model.",
      tip: "Several models use a thin tip suited to breast.",
      monitor: "Leave-in and multi-channel models are available.",
      care: "Documents calibration options and water-resistance ratings per model.",
    },
    pros: [
      "Per-model specifications are published, so you can compare rather than guess.",
      "Covers both thermometer categories duck cooking needs.",
    ],
    tradeoffs: [
      "Priced above generic probes; verify the current spec sheet for the exact model.",
      "We have not hands-on tested any model, so treat this as a shortlist, not a verdict.",
    ],
    affiliateStatus: "none",
    merchantId: "thermoworks",
    lastVerified: "2026-08",
    note: "Included as a research-stage brand candidate. No affiliate link is live and no unit has been tested by DeliciousDuck.",
  },
];

/* ------------------------------------------------------------------ */
/* Pans                                                                */
/* ------------------------------------------------------------------ */

export const PAN_FACTORS = [
  { key: "mass", label: "Thermal mass" },
  { key: "response", label: "Responsiveness" },
  { key: "fond", label: "Fond & sauce" },
  { key: "pouring", label: "Pouring off fat" },
  { key: "handling", label: "Weight & handling" },
  { key: "cleanup", label: "Cleanup" },
] as const;

export const PANS: ComparisonRow[] = [
  {
    id: "cast-iron",
    name: "Cast iron skillet",
    kind: "Category",
    bestFor: "Cooks who want maximum crisp and don't mind the weight.",
    decisionFactors: {
      mass: "Highest. Barely flinches when a cold breast lands on it.",
      response: "Slowest. Turning the burner down takes minutes to register.",
      fond: "Good, though a well-seasoned surface gives up slightly less fond than steel.",
      pouring: "Awkward — heavy, and most models have no pour spout.",
      handling: "Heaviest option; the handle gets oven-hot.",
      cleanup: "Wipe and re-oil; no soaking.",
    },
    pros: [
      "Holds temperature through the whole render, which is what crisps skin evenly.",
      "Goes straight into the oven to finish thick breasts or legs.",
    ],
    tradeoffs: [
      "Slow to respond if the render starts running too hot.",
      "Pouring off a cup of screaming-hot fat one-handed is genuinely unpleasant.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "carbon-steel",
    name: "Carbon steel skillet",
    kind: "Category",
    bestFor: "The best all-round compromise for duck breast.",
    decisionFactors: {
      mass: "Moderate — enough to hold heat, light enough to move.",
      response: "Fast. Heat adjustments land in seconds, not minutes.",
      fond: "Excellent.",
      pouring: "Easiest of the group: light, with sloped sides on most designs.",
      handling: "Roughly half the weight of comparable cast iron.",
      cleanup: "Wipe and re-oil, like cast iron.",
    },
    pros: [
      "Responsive enough to rescue a render that's browning too fast.",
      "Light enough to pour fat off repeatedly without dread.",
    ],
    tradeoffs: [
      "Seasoning is reactive — acidic pan sauces will strip it.",
      "Needs drying and oiling after every wash.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "stainless-clad",
    name: "Stainless clad (tri-ply)",
    kind: "Category",
    bestFor: "Anyone who wants to build a pan sauce in the same pan.",
    decisionFactors: {
      mass: "Moderate, depending on the disc or cladding thickness.",
      response: "Fast.",
      fond: "Best in class, and acid-safe, so wine and fruit reductions are fine.",
      pouring: "Good; many have rolled or flared rims.",
      handling: "Manageable.",
      cleanup: "Dishwasher-tolerant; fond releases with deglazing.",
    },
    pros: [
      "You can render, sear, pour off, and reduce a fruit or wine sauce in one pan.",
      "No seasoning to protect, so vinegar and citrus are non-issues.",
    ],
    tradeoffs: [
      "Slightly more prone to sticking if the skin goes in before the pan is set.",
      "Thin, cheap stainless will lose heat when the breast hits it.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "non-stick",
    name: "Non-stick skillet",
    kind: "Category — not recommended",
    bestFor: "Not duck breast.",
    decisionFactors: {
      mass: "Usually low.",
      response: "Fast, but irrelevant here.",
      fond: "Poor by design — the coating exists to prevent it.",
      pouring: "Easy.",
      handling: "Light.",
      cleanup: "Easiest, which is the only argument for it.",
    },
    pros: ["Nothing sticks, including the fond you wanted."],
    tradeoffs: [
      "Coatings are not intended for the sustained high heat a finishing sear needs.",
      "No fond means no pan sauce, which removes half the point of cooking duck breast.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
];

/* ------------------------------------------------------------------ */
/* Knives                                                              */
/* ------------------------------------------------------------------ */

export const KNIFE_FACTORS = [
  { key: "control", label: "Tip control" },
  { key: "length", label: "Blade length" },
  { key: "edge", label: "Edge & geometry" },
  { key: "clearance", label: "Knuckle clearance" },
] as const;

export const KNIVES: ComparisonRow[] = [
  {
    id: "petty",
    name: "Petty / utility knife (120–150 mm)",
    kind: "Category — best all-round",
    bestFor: "Scoring duck skin, if you're buying one knife for the job.",
    decisionFactors: {
      control: "Excellent. Short blade, light tip, easy to steer in a straight line.",
      length: "120–150 mm covers a breast in a single pull.",
      edge: "Thin behind the edge, so it parts skin instead of pushing it.",
      clearance: "Plenty — you're working on a flat surface, not through a board.",
    },
    pros: [
      "The tip does what you tell it, which is the entire skill of scoring.",
      "Doubles as a trimming and silverskin knife.",
    ],
    tradeoffs: ["Too small for carving a whole bird."],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "chef",
    name: "Chef's knife (200–210 mm)",
    kind: "Category",
    bestFor: "Cooks who already own a sharp one and don't want another knife.",
    decisionFactors: {
      control: "Good if sharp; the length makes fine tip work less intuitive.",
      length: "Long enough to score in one stroke, which helps consistency.",
      edge: "Depends entirely on the knife. A blunt chef's knife is the worst option here.",
      clearance: "Ample.",
    },
    pros: [
      "One long, confident stroke per score line beats several timid passes.",
      "No extra purchase if yours is genuinely sharp.",
    ],
    tradeoffs: [
      "Heavier tip makes it easier to cut too deep on a soft fat cap.",
      "Thick-shouldered budget knives compress the skin rather than slicing it.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "boning",
    name: "Boning knife",
    kind: "Category",
    bestFor: "People who also break down whole birds.",
    decisionFactors: {
      control: "Very good; narrow blade, pointed tip.",
      length: "130–150 mm typical.",
      edge: "Often slightly thicker behind the edge than a petty.",
      clearance: "Good.",
    },
    pros: [
      "Handles scoring and jointing legs, so it earns its drawer space.",
      "Stiff models track a straight score line well.",
    ],
    tradeoffs: [
      "Flexible models wander when you want a dead-straight line.",
      "Curved profiles make an even scoring depth harder to hold.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "paring",
    name: "Paring knife (80–100 mm)",
    kind: "Category",
    bestFor: "Tight diamond patterns and small or wild-duck breasts.",
    decisionFactors: {
      control: "Highest of the group.",
      length: "Too short for one continuous stroke on a large magret.",
      edge: "Thin and easy to keep sharp.",
      clearance: "Fine.",
    },
    pros: [
      "Maximum precision when the fat cap is thin and the margin for error is small.",
      "Cheap to replace and easy to sharpen.",
    ],
    tradeoffs: [
      "Multiple passes per line invite uneven depth.",
      "Not a carving knife under any circumstances.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
];

/* ------------------------------------------------------------------ */
/* Duck fat products                                                   */
/* ------------------------------------------------------------------ */

export const DUCK_FAT_FACTORS = [
  { key: "format", label: "Format" },
  { key: "use", label: "Best use" },
  { key: "storage", label: "After opening" },
  { key: "watch", label: "Label check" },
] as const;

export const DUCK_FAT_OPTIONS: ComparisonRow[] = [
  {
    id: "glass-jar",
    name: "Rendered duck fat in a glass jar",
    kind: "Format",
    bestFor: "Roasting potatoes and everyday spoonfuls.",
    decisionFactors: {
      format: "Typically 200–350 g; resealable and easy to scoop cold.",
      use: "Roasting, frying, finishing.",
      storage: "Refrigerate after opening and keep the rim clean.",
      watch: "Ingredients should read as duck fat, nothing else, unless you want seasoning.",
    },
    pros: [
      "The most useful size for a household that roasts potatoes a few times a month.",
      "Glass lets you see clarity and any separated juices at the bottom.",
    ],
    tradeoffs: ["Costs more per gram than a large tub or tin."],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "large-tub",
    name: "Large tub or pail (700 g+)",
    kind: "Format",
    bestFor: "Confit, where you need enough fat to submerge the legs.",
    decisionFactors: {
      format: "700 g to several kilograms.",
      use: "Confit and repeated deep applications.",
      storage: "Refrigerate; decant working amounts to avoid repeated warming.",
      watch: "Check whether it is pure rendered fat or blended with other fats.",
    },
    pros: [
      "Confit is impractical at jar quantities — this is the format that makes it possible.",
      "Best cost per gram.",
    ],
    tradeoffs: [
      "Takes real fridge space.",
      "Warming a whole tub repeatedly shortens its life; decant instead.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "tin",
    name: "Tin or aerosol spray",
    kind: "Format",
    bestFor: "Occasional use and pan-greasing.",
    decisionFactors: {
      format: "Small tins, or sprays cut with other oils and propellant.",
      use: "Greasing, light finishing.",
      storage: "Follow the label; tins usually want refrigeration once opened.",
      watch: "Sprays are frequently blends — read the ingredient list before assuming purity.",
    },
    pros: ["Convenient, and hard to over-pour."],
    tradeoffs: [
      "Sprays often contain far less duck fat than the front label implies.",
      "Poor value per gram for roasting.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "render-at-home",
    name: "Render it yourself from trim",
    kind: "Alternative",
    bestFor: "Anyone already cooking whole ducks or breasts.",
    decisionFactors: {
      format: "As much as your birds give you — usually 100–250 g per whole duck.",
      use: "Everything a jar does.",
      storage: "Refrigerate in a clean sealed jar; freeze for longer keeping.",
      watch: "Strain properly — leftover juices are what make home-rendered fat spoil early.",
    },
    pros: [
      "Free, and it is the same product you'd otherwise buy.",
      "You control how clean the strain is, which decides how long it keeps.",
    ],
    tradeoffs: [
      "Takes an hour of low, attentive heat.",
      "Yield is unpredictable until you've done it with your usual birds.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
];

/* ------------------------------------------------------------------ */
/* Roasting vessels for a whole duck                                   */
/* ------------------------------------------------------------------ */

export const ROASTING_PAN_FACTORS = [
  { key: "elevation", label: "Lifting the bird out of its fat" },
  { key: "capacity", label: "Fat capacity" },
  { key: "airflow", label: "Airflow around the skin" },
  { key: "sizing", label: "Sizing for a 4.5–6 lb duck" },
  { key: "handling", label: "Handling a hot pan of fat" },
  { key: "afterlife", label: "What else it does" },
] as const;

export const ROASTING_PANS: ComparisonRow[] = [
  {
    id: "roaster-with-rack",
    name: "Roasting pan with a fitted rack",
    kind: "Category",
    bestFor: "Anyone roasting a whole duck more than once or twice a year.",
    decisionFactors: {
      elevation: "Best. A fitted rack holds the bird clear of the fat for the whole roast.",
      capacity: "High — 2.5–3 in (6–8 cm) sides swallow the fat a whole duck throws.",
      airflow: "Good, though tall sides shade the lower skin more than a shallow pan does.",
      sizing: "A 13 × 9 in (33 × 23 cm) pan or larger fits a duck with room to spare.",
      handling: "Riveted end handles let you carry it with two hands and two dry towels.",
      afterlife: "Turkey, large chickens, pork shoulder, big-batch vegetable roasting.",
    },
    pros: [
      "The rack solves the one problem that matters most: a bird sitting in its own fat won't crisp underneath.",
      "Deep sides mean you can pour fat off mid-roast without it sloshing over the lip.",
    ],
    tradeoffs: [
      "Bulky to store, and oversized for anything smaller than a whole bird.",
      "Very tall sides trap steam near the bottom of the bird; look for 2.5–3 in rather than 4 in.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "rimmed-sheet-with-rack",
    name: "Rimmed sheet pan with a wire rack",
    kind: "Category",
    bestFor: "Cooks who want maximum airflow and already own both pieces.",
    decisionFactors: {
      elevation: "Good, if the rack is sturdy enough not to bow under 5 lb of bird.",
      capacity: "Lowest. A 1 in (2.5 cm) rim fills fast, so plan to pour off part-way.",
      airflow: "Best of the three — nothing shades the skin.",
      sizing: "A half-sheet (18 × 13 in / 46 × 33 cm) is the practical minimum.",
      handling: "Light and easy to grip, but a shallow pan of hot fat is the easiest to spill.",
      afterlife: "Everything. This is the most-used pan in most kitchens.",
    },
    pros: [
      "Unobstructed convection all round the bird, which is what a crisp skin wants.",
      "Cheap, stackable, and genuinely useful the other fifty weeks of the year.",
    ],
    tradeoffs: [
      "Shallow rim plus rendered fat is a real overflow and smoke risk — ladle fat off as it collects.",
      "Flimsy sheets warp at roasting temperatures, which sends the fat to one corner.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "cast-iron-or-braiser",
    name: "Cast iron skillet or shallow braiser",
    kind: "Category",
    bestFor: "Duck legs, halved or spatchcocked birds, and small kitchens.",
    decisionFactors: {
      elevation: "Poor without a trivet — the bird sits in the fat unless you raise it.",
      capacity: "Moderate, and it depends entirely on how much bird is in the way.",
      airflow: "Reduced by the sides, and worst where the bird sits closest to the wall.",
      sizing: "A 12 in (30 cm) skillet suits legs or a spatchcocked bird, not a whole one.",
      handling: "Heaviest, and hot cast iron full of fat is the least forgiving to move.",
      afterlife: "Searing, cornbread, potatoes fried in the fat you just rendered.",
    },
    pros: [
      "Retained heat browns the underside hard, which suits legs and flat cuts.",
      "Goes stovetop to oven, so you can render, roast, and build a sauce in one vessel.",
    ],
    tradeoffs: [
      "Not a whole-duck vessel unless the bird is halved or spatchcocked.",
      "Seasoned iron reacts with acidic pan sauces — deglaze wine or fruit somewhere else.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
];
