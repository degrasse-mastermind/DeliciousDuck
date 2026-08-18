/**
 * Comparison data for commercial pages.
 *
 * Rules baked into this shape:
 * - No prices, star ratings, review counts, or testing claims. None of these
 *   items is presented as a firsthand test result.
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
 * The one plain-language affiliate disclosure sentence used site-wide.
 *
 * Rendered once per page, immediately before the first affiliate link, and only
 * on pages that genuinely carry one. Never repeated later on the same page, and
 * never mirrored in the footer.
 */
export const AFFILIATE_DISCLOSURE_SENTENCE =
  "Some links on this page are affiliate links, meaning we may earn a commission if you buy through them, at no extra cost to you.";

/* ------------------------------------------------------------------ */
/* Where to buy duck online                                            */
/* ------------------------------------------------------------------ */

export const MERCHANT_FACTORS = [
  { key: "cuts", label: "Whole duck, breast & legs" },
  { key: "specialty", label: "Specialty & prepared duck" },
  { key: "breadth", label: "Breadth of selection" },
  { key: "fit", label: "Best fit" },
] as const;

/**
 * Online duck sellers, ordered by how well each solves current reader intent —
 * not by whether it pays us. Every attribute below comes from the seller's own
 * public catalogue at the last verification date. No prices, no ratings, no
 * shipping promises, and no live stock claims.
 *
 * US Wellness Meats is deliberately absent: their live duck collection, reviewed
 * 2026-08-18, lists rendered duck fat and duck livers only — no whole duck,
 * breast or leg quarters — so they are not a duck-meat sourcing route. Their
 * duck fat link lives in the commercial-link registry under `duck_fat`.
 */
export const DUCK_MERCHANTS: ComparisonRow[] = [
  {
    id: "culver-duck",
    name: "Culver Duck",
    kind: "Duck producer with a direct shop (US)",
    bestFor:
      "Cooks who want one order to cover a whole bird, portioned cuts, and rendered fat.",
    decisionFactors: {
      cuts: "Whole duck, raw breast, leg quarters and ground duck all listed by name.",
      specialty: "Confit, smoked breast, stuffed duck and halal duck appear in the shop.",
      breadth: "The widest single-producer duck range in this comparison.",
      fit: "A duck-first order where you want the cut named precisely.",
    },
    pros: [
      "Duck is the whole business, so cuts are named the way recipes name them.",
      "Rendered fat and prepared duck sit alongside the raw cuts, so one box can cover a menu.",
    ],
    tradeoffs: [
      "Availability shifts with production; check the shop rather than assuming a cut is stocked.",
      "Frozen delivery means you still owe the bird a day or more of fridge thawing.",
    ],
    affiliateStatus: "none",
    merchantId: "culver-duck",
    lastVerified: "2026-08-18",
    note: "Catalogue reviewed 2026-08-18.",
  },
  {
    id: "tastyduck-jurgielewicz",
    name: "Joe Jurgielewicz & Son (TastyDuck)",
    kind: "Family duck producer with a direct shop (US)",
    bestFor: "A first duck order, or a sampler when you are not yet sure which cut you want.",
    decisionFactors: {
      cuts: "Whole duck, breasts and legs listed individually.",
      specialty: "Sampler kits and prepared duck products.",
      breadth: "Focused range — the core cuts plus kits, rather than a long catalogue.",
      fit: "Trying duck for the first time without committing to one cut.",
    },
    pros: [
      "Sampler kits are a genuinely useful way to learn which cut suits how you cook.",
      "Single-producer sourcing, so the birds in one order are consistent with each other.",
    ],
    tradeoffs: [
      "Narrower selection than a full specialty distributor.",
      "Cut-level availability moves; the shop page is the only reliable answer.",
    ],
    affiliateStatus: "none",
    merchantId: "tastyduck-jurgielewicz",
    lastVerified: "2026-08-18",
    note: "Catalogue reviewed 2026-08-18.",
  },
  {
    id: "fossil-farms",
    name: "Fossil Farms",
    kind: "Game & specialty meat retailer (US)",
    bestFor:
      "Recipes that name a specific breed or an unusual cut you cannot find elsewhere.",
    decisionFactors: {
      cuts: "Whole birds and portioned cuts across more than one duck type.",
      specialty: "Prepared duck products alongside the raw catalogue.",
      breadth: "Broad, and unusually specific about which duck you are buying.",
      fit: "Cooking to a recipe that specifies the duck, not just 'duck'.",
    },
    pros: [
      "Listings distinguish between duck types, which most sellers do not.",
      "Useful when you are buying other game or specialty meat in the same order.",
    ],
    tradeoffs: [
      "A general specialty retailer, so duck sits inside a much larger catalogue.",
      "We publish no breed-by-breed cooking adjustments — the name tells you less than the bird does.",
    ],
    affiliateStatus: "none",
    merchantId: "fossil-farms",
    lastVerified: "2026-08-18",
    note: "Catalogue reviewed 2026-08-18.",
  },
  {
    id: "wild-fork",
    name: "Wild Fork",
    kind: "Frozen-meat retailer, stores plus delivery (US)",
    bestFor: "Buying duck without placing a specialty order, when it is stocked near you.",
    decisionFactors: {
      cuts: "Duck appears in the frozen range, but which cuts varies — check before you plan a menu.",
      specialty: "Limited; this is a mainstream retailer rather than a duck specialist.",
      breadth: "Narrow for duck, wide for everything else in the same basket.",
      fit: "A weeknight duck buy alongside the rest of your shopping.",
    },
    pros: [
      "Store pickup avoids cold-chain shipping cost and the courier risk entirely.",
      "Everything is already frozen and portioned, which suits buying one or two pieces.",
    ],
    tradeoffs: [
      "Duck selection is inconsistent between locations and over time.",
      "Less producer detail than any of the duck specialists above.",
    ],
    affiliateStatus: "none",
    merchantId: "wild-fork",
    lastVerified: "2026-08-18",
    note: "Included as a mainstream option. Verify current duck availability yourself; we make no stock claim.",
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
      "A shortlist built from published specifications — compare the current spec sheet before choosing.",
    ],
    affiliateStatus: "none",
    merchantId: "thermoworks",
    lastVerified: "2026-08",
    note: "Included because it publishes relevant per-model specifications you can compare.",
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
  { key: "capacity", label: "Room for rendered fat" },
  { key: "airflow", label: "Airflow around the skin" },
  { key: "fit", label: "Fit check before you buy" },
  { key: "handling", label: "Handling it loaded" },
  { key: "care", label: "Care, cleanup, and afterlife" },
] as const;

export const ROASTING_PANS: ComparisonRow[] = [
  {
    id: "roaster-with-rack",
    name: "Roasting pan + rack",
    kind: "Category",
    bestFor: "Anyone who roasts whole birds more than once or twice a year.",
    decisionFactors: {
      elevation: "A rack made for the pan holds the bird clear of the fat for the whole roast.",
      capacity: "Usually the most generous of the four — sides are built to contain a render.",
      airflow: "Good, though taller sides shade the lower skin more than a shallow pan does.",
      fit: "Measure your bird on its rack, then check the loaded pan clears your oven walls.",
      handling: "Two proper handles help, but a loaded roaster is heavy — lift it two-handed.",
      care: "Follow the maker's care instructions; also earns its space on chicken and turkey.",
    },
    pros: [
      "The rack addresses the problem that matters most: skin sitting in fat won't crisp.",
      "Deeper sides give you somewhere for the fat to go before you decide to pour any off.",
    ],
    tradeoffs: [
      "Bulky to store, and oversized for anything smaller than a whole bird.",
      "Very tall sides shelter the lower half of the bird from moving air.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "rimmed-sheet-with-rack",
    name: "Rimmed sheet pan + rack",
    kind: "Category",
    bestFor: "Cooks who want maximum airflow and already own both pieces.",
    decisionFactors: {
      elevation: "Good, provided the rack is rigid enough to stay flat under a whole bird.",
      capacity: "The shallowest option here — watch the level and move fat off as it collects.",
      airflow: "Nothing shades the skin, which is the main reason cooks choose it.",
      fit: "Set bird and rack on the pan and confirm nothing touches the rim or oven walls.",
      handling: "Light to lift, but a shallow pan of hot fat is the easiest to slosh.",
      care: "Check the maker's max oven temperature, especially on nonstick or coated sheets.",
    },
    pros: [
      "Open convection all round the bird, which is what crisp skin wants.",
      "Genuinely useful the rest of the year, so storage space isn't wasted.",
    ],
    tradeoffs: [
      "Shallow sides mean less margin before fat reaches the rim — plan to remove some.",
      "Thin sheets can distort at roasting heat; check the manufacturer's stated limit.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "cast-iron-setup",
    name: "Cast-iron setup",
    kind: "Category",
    bestFor: "Duck legs, halved or spatchcocked birds, and small kitchens.",
    decisionFactors: {
      elevation: "Poor on its own — you need a rack or trivet that fits inside it.",
      capacity: "Depends on the pan and how much of it the bird occupies.",
      airflow: "Reduced by the sides, and least generous where the bird sits near a wall.",
      fit: "Check the bird sits inside without touching the sides before you commit to it.",
      handling: "Heaviest of the four; hot iron plus fat is the least forgiving to move.",
      care: "Season and dry per the maker's instructions; deglaze acidic sauces elsewhere.",
    },
    pros: [
      "Retained heat browns the underside firmly, which suits legs and flat cuts.",
      "Stovetop to oven in one vessel, so you can render and roast in the same pan.",
    ],
    tradeoffs: [
      "Rarely the right shape for a whole bird unless it's halved or spatchcocked.",
      "No easy pour spout, so removing fat mid-roast wants a ladle and a steady hand.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
  {
    id: "disposable-foil-fallback",
    name: "Disposable foil fallback",
    kind: "Category",
    bestFor: "A holiday overflow bird, a rented kitchen, or a pan you don't own yet.",
    decisionFactors: {
      elevation: "Only with a rack or trivet that the tray can actually support.",
      capacity: "Limited, and the tray flexes as fat collects — keep the level low.",
      airflow: "Comparable to a shallow metal pan of the same shape.",
      fit: "Check bird, rack, and tray together, and that the loaded tray clears the oven.",
      handling: "Weakest here. Support it underneath with a sheet pan and move it two-handed.",
      care: "Single-use. Read the packaging for oven use and temperature instructions.",
    },
    pros: [
      "Cheap and available when you need another vessel at short notice.",
      "Nothing to store or clean afterwards.",
    ],
    tradeoffs: [
      "Thin walls flex under a loaded bird — treat a supporting sheet pan as required, not optional.",
      "Follow the packaging instructions; don't assume it behaves like a heavy metal roaster.",
    ],
    affiliateStatus: "none",
    lastVerified: "2026-08",
  },
];
