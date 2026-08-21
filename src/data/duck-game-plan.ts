/**
 * The Duck Game Plan — typed choices and personalization mapping.
 *
 * This is the whole brain of the planner: a small, declarative config layer that
 * turns four finite selections (cut, method, concern, party size) into one
 * kitchen card. No component contains cooking logic, and no fact here is
 * invented — every temperature, timing range, rest window and portion figure is
 * copied from a page that already carries it on DeliciousDuck, and every link
 * points at a route that exists.
 *
 * Where the site has no trustworthy method page for a combination (sous vide,
 * grilled whole duck), the plan says so plainly and routes the reader to the
 * best existing guide rather than inventing precision.
 *
 * Client-safe: pure data and pure functions, no PII, no secrets.
 */

/* ------------------------------------------------------------------ *
 * Finite choice enums (also the analytics + subscriber allowlists)
 * ------------------------------------------------------------------ */

export const GAME_PLAN_CUTS = [
  "duck-breast",
  "whole-duck",
  "duck-legs",
  "duck-confit",
  "not-bought-yet",
] as const;
export type GamePlanCut = (typeof GAME_PLAN_CUTS)[number];

export const GAME_PLAN_METHODS = [
  "pan",
  "oven",
  "air-fryer",
  "sous-vide",
  "grill-smoker",
  "unsure",
] as const;
export type GamePlanMethod = (typeof GAME_PLAN_METHODS)[number];

export const GAME_PLAN_CONCERNS = [
  "overcooking",
  "crispy-skin",
  "timing",
  "how-much-to-buy",
  "what-to-serve",
] as const;
export type GamePlanConcern = (typeof GAME_PLAN_CONCERNS)[number];

export const GAME_PLAN_PARTY_SIZES = ["1-2", "3-4", "5-6", "crowd"] as const;
export type GamePlanPartySize = (typeof GAME_PLAN_PARTY_SIZES)[number];

export interface GamePlanSelection {
  cut: GamePlanCut;
  method: GamePlanMethod;
  concern: GamePlanConcern;
  partySize: GamePlanPartySize;
}

export type PartialSelection = Partial<GamePlanSelection>;

/* ------------------------------------------------------------------ *
 * Labels
 * ------------------------------------------------------------------ */

export const CUT_LABELS: Record<GamePlanCut, string> = {
  "duck-breast": "Duck breast",
  "whole-duck": "Whole duck",
  "duck-legs": "Duck legs",
  "duck-confit": "Duck confit",
  "not-bought-yet": "I haven't bought it yet",
};

export const METHOD_LABELS: Record<GamePlanMethod, string> = {
  pan: "Pan",
  oven: "Oven",
  "air-fryer": "Air fryer",
  "sous-vide": "Sous vide",
  "grill-smoker": "Grill or smoker",
  unsure: "Not sure yet",
};

export const CONCERN_LABELS: Record<GamePlanConcern, string> = {
  overcooking: "Overcooking it",
  "crispy-skin": "Crispy skin",
  timing: "Timing",
  "how-much-to-buy": "How much to buy",
  "what-to-serve": "What to serve with it",
};

export const PARTY_SIZE_LABELS: Record<GamePlanPartySize, string> = {
  "1-2": "1–2 people",
  "3-4": "3–4 people",
  "5-6": "5–6 people",
  crowd: "A crowd",
};

/** Methods worth offering per cut. Kept deliberately shallow. */
export const METHODS_FOR_CUT: Record<GamePlanCut, readonly GamePlanMethod[]> = {
  "duck-breast": ["pan", "oven", "air-fryer", "sous-vide", "grill-smoker", "unsure"],
  "whole-duck": ["oven", "grill-smoker", "unsure"],
  "duck-legs": ["oven", "pan", "air-fryer", "grill-smoker", "unsure"],
  "duck-confit": ["oven", "unsure"],
  "not-bought-yet": ["pan", "oven", "air-fryer", "grill-smoker", "unsure"],
};

export function methodsForCut(cut: GamePlanCut | undefined): readonly GamePlanMethod[] {
  return cut ? METHODS_FOR_CUT[cut] : GAME_PLAN_METHODS;
}

/* ------------------------------------------------------------------ *
 * Plan shape
 * ------------------------------------------------------------------ */

export interface PlanLink {
  label: string;
  href: string;
  note?: string;
}

export interface DuckGamePlan {
  /** Stable, low-cardinality id for analytics: `<cut>_<method>`. */
  recommendationId: string;
  /** `exact` when a dedicated method page covers this combination. */
  resultType: "exact" | "general";
  headline: string;
  summary: string;
  risk: string;
  criticalMove: string;
  temperature: string;
  /** Show the shared USDA safety block beneath the temperature line. */
  showSafetyNote: boolean;
  rest?: string;
  timing: string;
  equipment: PlanLink;
  /** Portion guidance for the chosen party size. */
  serving: string;
  pairing: PlanLink[];
  saveTheFat?: string;
  primary: PlanLink;
  secondary: PlanLink[];
  commercial?: PlanLink;
}

/* ------------------------------------------------------------------ *
 * Reusable, already-published facts
 * ------------------------------------------------------------------ */

const BREAST_TEMP =
  "Pull duck breast at 125–130°F (52–54°C) for medium-rare; it settles at 130–135°F (54–57°C) after resting. For a firmer pale-pink centre, pull at 135–140°F (57–60°C) and it finishes at 140–145°F (60–63°C). Pink at 130–135°F is a long-standing texture convention, not a safety clearance — 165°F (73.9°C) is the safe minimum for poultry, duck included.";

const BREAST_REST =
  "Rest 5–8 minutes before slicing. A thick magret (350–450 g) can carry over 8–10°F (4.5–5.5°C); a smaller Pekin breast (150–200 g) usually climbs 4–6°F (2–3°C).";

const WHOLE_TEMP =
  "Read the thigh, not the breast: it should reach at least 165°F (73.9°C), the safe minimum for the whole bird. Legs and thighs are usually taken further, to 175–185°F (79–85°C), where the connective tissue has softened and the meat pulls easily.";

const WHOLE_REST =
  "Rest the bird 15–20 minutes, loosely tented, before carving. The internal temperature keeps climbing a little as it stands.";

const LEG_TEMP =
  "165°F (73.9°C) is the safe minimum, but legs are a texture cook: take them to 175–185°F (79–85°C), where they pull easily from the bone.";

const CONFIT_TEMP =
  "Hold the fat at 190–210°F (88–99°C) — a poach, never a simmer — in a 200–225°F (93–107°C) oven. The meat passes the 165°F (73.9°C) minimum long before it is tender, so the endpoint is a skewer meeting no resistance, not a number.";

const FAT_NOTE =
  "Pour off the rendered fat as it collects instead of letting the duck sit in it. Strained into a clean jar and refrigerated, it is the best roasting fat in your kitchen.";

const THERMOMETER: PlanLink = {
  label: "A fast instant-read thermometer",
  href: "/gear/best-thermometer-for-duck",
  note: "The one tool that turns duck from a guess into a decision",
};

const PAN: PlanLink = {
  label: "A heavy, flat-bottomed skillet",
  href: "/gear/best-pan-for-duck-breast",
  note: "Even contact matters more than material for rendering skin",
};

const ROASTING_PAN: PlanLink = {
  label: "A roasting pan with a rack",
  href: "/gear/best-roasting-pan-for-duck",
  note: "Keeps the bird out of the fat it sheds",
};

const CONFIT_VESSEL: PlanLink = {
  label: "A vessel that fits the legs snugly",
  href: "/gear/best-dutch-oven-for-duck-confit",
  note: "Fit beats brand: less fat needed, more even heat",
};

const BREAST_SIDES: PlanLink[] = [
  {
    label: "What to serve with duck breast",
    href: "/cook/what-to-serve-with-duck-breast",
    note: "Acidity, bitter greens, and a starch that uses the fat",
  },
  {
    label: "Sauces for duck breast",
    href: "/cook/best-sauces-for-duck-breast",
    note: "Tart fruit and restrained sweetness",
  },
];

const WHOLE_SIDES: PlanLink[] = [
  {
    label: "Duck-fat roast potatoes",
    href: "/recipes/duck-fat-roasted-potatoes",
    note: "Roast them earlier, re-crisp while the duck rests",
  },
  {
    label: "What to serve with duck",
    href: "/cook/what-to-serve-with-duck-breast",
    note: "Balance the richness with acid and bitterness",
  },
];

/* ------------------------------------------------------------------ *
 * Cut layer
 * ------------------------------------------------------------------ */

interface CutPlan {
  headline: string;
  temperature: string;
  rest?: string;
  timing: string;
  equipment: PlanLink;
  pairing: PlanLink[];
  saveTheFat?: string;
  primary: PlanLink;
  secondary: PlanLink[];
  commercial?: PlanLink;
  criticalMove: string;
}

const CUT_PLANS: Record<GamePlanCut, CutPlan> = {
  "duck-breast": {
    headline: "Duck breast, cooked on a number instead of a timer",
    temperature: BREAST_TEMP,
    rest: BREAST_REST,
    timing:
      "Time follows the fat, not the clock: render skin-side down over gentle heat until the fat cap has given up most of its fat and the skin is deep gold, then finish quickly. Start probing early.",
    equipment: THERMOMETER,
    pairing: BREAST_SIDES,
    saveTheFat:
      "Pour the rendered fat into a jar as it collects, then strain it once it has cooled. It keeps in the fridge and it is the best roasting fat in your kitchen.",
    primary: {
      label: "Pan-seared duck breast",
      href: "/recipes/pan-seared-duck-breast",
      note: "The full method, cold pan to slice",
    },
    secondary: [
      {
        label: "Temperature and doneness",
        href: "/learn/duck-breast-temperature-doneness",
        note: "Every band, and what each one gives you",
      },
      {
        label: "How to score duck breast",
        href: "/learn/how-to-score-duck-breast",
        note: "Skin and fat only, never the meat",
      },
    ],
    criticalMove:
      "Start skin-side down in a cold, dry pan over medium-low heat and let the fat render before you chase colour.",
  },
  "whole-duck": {
    headline: "A whole duck, planned backwards from dinner",
    temperature: WHOLE_TEMP,
    rest: WHOLE_REST,
    timing:
      "Plan on 2–2.5 hours at 350°F (177°C) for a 1.8–2 kg (4–4.5 lb) bird, 2.5–3 hours for 2.3–2.7 kg (5–6 lb), and 3–3.5 hours for 2.9–3.2 kg (6.5–7 lb). Most home ovens run 15–25°F off their dial, so treat the range as planning, not truth.",
    equipment: ROASTING_PAN,
    pairing: WHOLE_SIDES,
    saveTheFat: FAT_NOTE,
    primary: {
      label: "Whole roast duck",
      href: "/cook/whole-roast-duck",
      note: "The method, step by step",
    },
    secondary: [
      {
        label: "Whole duck cooking time",
        href: "/learn/whole-duck-cooking-time",
        note: "Weight and oven-temperature ranges",
      },
      {
        label: "How to carve a duck",
        href: "/learn/how-to-carve-a-duck",
        note: "Legs first, then the breast",
      },
    ],
    criticalMove:
      "Work backwards from the time you want to eat, and build the 15–20 minute rest into the plan rather than stealing it.",
  },
  "duck-legs": {
    headline: "Duck legs, cooked long enough to let go",
    temperature: LEG_TEMP,
    timing:
      "Legs are forgiving in a way breast never is: they need time at temperature, not precision. Give them a slow cook and test with a skewer or fork before you look at the clock.",
    equipment: THERMOMETER,
    pairing: [
      {
        label: "What to serve with duck",
        href: "/cook/what-to-serve-with-duck-breast",
        note: "Bitter greens and something starchy",
      },
      {
        label: "Best acid for duck",
        href: "/ingredients/best-acid-for-duck",
        note: "Cut the richness deliberately",
      },
    ],
    saveTheFat: FAT_NOTE,
    primary: {
      label: "Duck leg confit",
      href: "/cook/duck-leg-confit",
      note: "The most reliable thing to do with legs",
    },
    secondary: [
      {
        label: "Temperature and doneness",
        href: "/learn/duck-breast-temperature-doneness",
        note: "Includes leg and thigh targets",
      },
      {
        label: "How to render duck fat",
        href: "/learn/how-to-render-duck-fat",
        note: "Clean fat for the next cook",
      },
    ],
    criticalMove:
      "Judge legs by texture, not by the clock: they are done when the meat pulls easily from the bone.",
  },
  "duck-confit": {
    headline: "Confit: a poach in fat, not a simmer",
    temperature: CONFIT_TEMP,
    timing:
      "Salt the legs with 1.5–2% salt by weight plus aromatics and refrigerate 12–24 hours, then cook covered for 2.5–3.5 hours until fork-tender. Crisp the skin at the end, 10–15 minutes in a hot pan or a 425°F (218°C) oven.",
    equipment: CONFIT_VESSEL,
    pairing: [
      {
        label: "Duck-fat roast potatoes",
        href: "/recipes/duck-fat-roasted-potatoes",
        note: "The classic partner, made in the same fat",
      },
      {
        label: "Best acid for duck",
        href: "/ingredients/best-acid-for-duck",
        note: "Confit needs sharpness beside it",
      },
    ],
    saveTheFat:
      "The cooking fat is the point: strain it once cool and reuse it. It gets better with each batch of legs.",
    primary: {
      label: "Duck leg confit",
      href: "/cook/duck-leg-confit",
      note: "Cure, cook, crisp",
    },
    secondary: [
      {
        label: "Ways to use duck fat",
        href: "/cook/ways-to-use-duck-fat",
        note: "What to do with what you strain",
      },
      {
        label: "How to render duck fat",
        href: "/learn/how-to-render-duck-fat",
        note: "If you need more fat to cover the legs",
      },
    ],
    commercial: {
      label: "Duck fat buying guide",
      href: "/buy/duck-fat-buying-guide",
      note: "Covering legs takes more fat than one duck gives you",
    },
    criticalMove:
      "Keep the fat below a visible simmer. A bubbling confit toughens the muscle instead of softening the connective tissue.",
  },
  "not-bought-yet": {
    headline: "Buy the right duck first — the cooking gets easier after that",
    temperature:
      "Whatever you buy, one number does the work: 165°F (73.9°C) is the safe minimum for duck, whole or in pieces. Breast has a lower restaurant-style convention (130–135°F / 54–57°C finished), which is a texture choice rather than a safety clearance.",
    timing:
      "Decide the cut before the calendar. Breast is a 20-minute cook you can do on a weeknight; a whole bird is a two-to-three-hour plan; confit wants a day of curing first.",
    equipment: THERMOMETER,
    pairing: BREAST_SIDES,
    primary: {
      label: "What cut of duck to buy",
      href: "/buy/what-cut-of-duck-to-buy",
      note: "Match the cut to the dinner you actually want",
    },
    secondary: [
      {
        label: "How to choose duck",
        href: "/buy/how-to-choose-duck",
        note: "What the label tells you",
      },
      {
        label: "Fresh vs frozen duck",
        href: "/buy/fresh-vs-frozen-duck",
        note: "And how to thaw it safely",
      },
    ],
    commercial: {
      label: "Where to buy duck online",
      href: "/buy/where-to-buy-duck-online",
      note: "How the sellers actually differ",
    },
    criticalMove:
      "Pick the cut for the occasion before you pick the seller — cut decides the whole plan.",
  },
};

/* ------------------------------------------------------------------ *
 * Method layer
 * ------------------------------------------------------------------ */

interface MethodOverlay {
  criticalMove?: string;
  timing?: string;
  equipment?: PlanLink;
  primary?: PlanLink;
  /** Set when the site has no dedicated method page for this combination. */
  caveat?: string;
}

const METHOD_OVERLAYS: Partial<Record<`${GamePlanCut}:${GamePlanMethod}`, MethodOverlay>> = {
  "duck-breast:pan": {
    equipment: PAN,
    criticalMove:
      "Score the skin through fat only, salt it, and start it in a cold, dry pan over medium-low heat. Pour off the fat as it pools so the skin fries rather than steams.",
    primary: {
      label: "Pan-seared duck breast",
      href: "/recipes/pan-seared-duck-breast",
      note: "The full method, cold pan to slice",
    },
  },
  "duck-breast:oven": {
    criticalMove:
      "Render the skin in a pan first, then move the breast to the oven to finish — the oven alone will not crisp a cold fat cap.",
    primary: {
      label: "Oven-roasted duck breast",
      href: "/recipes/oven-roasted-duck-breast",
      note: "Pan render, oven finish",
    },
  },
  "duck-breast:air-fryer": {
    criticalMove:
      "Render low first with the skin up so the fat drains, then crisp hot for a short stage and finish on a probe reading, not the basket timer.",
    timing:
      "Air fryers vary by basket design, wattage and fan strength, so treat any timing as a starting range and probe early.",
    primary: {
      label: "Air-fryer duck breast",
      href: "/recipes/air-fryer-duck-breast",
      note: "Low render, short crisp, thermometer finish",
    },
  },
  "duck-breast:sous-vide": {
    caveat:
      "We don't publish a sous vide duck method yet, so we won't hand you times and temperatures we haven't documented. What transfers is the doneness map below — and the skin still has to be rendered and crisped in a hot, dry pan after the bath.",
    criticalMove:
      "Whatever the bath does for the centre, the skin is a separate job: dry it well and crisp it skin-side down in a hot pan at the end.",
    primary: {
      label: "Duck breast temperature and doneness",
      href: "/learn/duck-breast-temperature-doneness",
      note: "The doneness bands to aim at",
    },
  },
  "duck-breast:grill-smoker": {
    caveat:
      "We don't have a grilled duck breast method on the site yet. The closest documented route is smoking, which is a different cook with a sauce built for it.",
    criticalMove:
      "Keep rendering fat away from open flame — dripping fat over direct heat flares and scorches skin before the centre moves.",
    primary: {
      label: "Smoked duck with plum sauce",
      href: "/recipes/smoked-duck-with-plum-sauce",
      note: "The documented low-and-slow route",
    },
  },
  "whole-duck:oven": {
    equipment: ROASTING_PAN,
    primary: {
      label: "Whole roast duck",
      href: "/cook/whole-roast-duck",
      note: "The method, step by step",
    },
  },
  "whole-duck:grill-smoker": {
    caveat:
      "We don't publish a whole-bird grill or smoker method. The smoked recipe below is the documented smoke route; the oven guide carries the timing and thigh temperatures.",
    primary: {
      label: "Smoked duck with plum sauce",
      href: "/recipes/smoked-duck-with-plum-sauce",
      note: "Our documented smoking method",
    },
  },
  "duck-legs:oven": {
    criticalMove:
      "Give the legs a slow, covered cook and test with a fork before you trust a timer. They should surrender, not slice.",
    primary: {
      label: "Duck leg confit",
      href: "/cook/duck-leg-confit",
      note: "Slow oven, fat, patience",
    },
  },
  "duck-legs:pan": {
    caveat:
      "Legs are the wrong cut for a quick pan cook from raw — the connective tissue needs time. Cook them slowly first, then crisp the skin in the pan.",
    criticalMove:
      "Cook the legs through slowly, then finish skin-side down in a hot pan for 10–15 minutes to crisp.",
  },
  "duck-legs:air-fryer": {
    caveat:
      "We don't publish an air-fryer duck leg method. Use the air fryer for the crisping stage after a slow cook rather than for the whole thing.",
  },
  "duck-legs:grill-smoker": {
    caveat:
      "We don't publish a grilled or smoked duck leg method. The smoked duck recipe is the nearest documented low-and-slow approach.",
    primary: {
      label: "Smoked duck with plum sauce",
      href: "/recipes/smoked-duck-with-plum-sauce",
      note: "Our documented smoking method",
    },
  },
  "duck-confit:oven": {
    equipment: CONFIT_VESSEL,
  },
  "not-bought-yet:pan": {
    primary: {
      label: "Where to buy duck breast online",
      href: "/buy/where-to-buy-duck-breast-online",
      note: "Breast is the cut for a pan",
    },
  },
  "not-bought-yet:air-fryer": {
    primary: {
      label: "Where to buy duck breast online",
      href: "/buy/where-to-buy-duck-breast-online",
      note: "Breast suits an air fryer best",
    },
  },
};

/* ------------------------------------------------------------------ *
 * Concern layer — sets the "biggest risk" and adds one link
 * ------------------------------------------------------------------ */

interface ConcernOverlay {
  risk: string;
  extra?: PlanLink;
  criticalMove?: string;
}

const CONCERN_BASE: Record<GamePlanConcern, ConcernOverlay> = {
  overcooking: {
    risk: "Sailing past your target while you wait for the skin to look right.",
    extra: {
      label: "Temperature and doneness",
      href: "/learn/duck-breast-temperature-doneness",
      note: "Pull temperatures, carryover, and the safety minimum",
    },
    criticalMove:
      "Probe the thickest part early and often, and account for carryover: pull below your finish temperature, not at it.",
  },
  "crispy-skin": {
    risk: "Skin that turns leathery instead of crisp, usually because moisture and unrendered fat stayed put.",
    extra: {
      label: "Why duck skin isn't crispy",
      href: "/learn/why-duck-skin-isnt-crispy",
      note: "Cause by cause, with the two fixes that work",
    },
    criticalMove:
      "Dry the skin, score through fat only, render gently, and pour off the fat as it collects so the skin fries instead of steaming.",
  },
  timing: {
    risk: "The duck and the rest of dinner landing at different times.",
    extra: {
      label: "Cooking-time planner",
      href: "/tools/duck-cooking-time-planner",
      note: "Work backwards from when you want to eat",
    },
    criticalMove:
      "Fix your serving time first, then subtract the rest, the cook, and the tempering — in that order.",
  },
  "how-much-to-buy": {
    risk: "Buying by instinct and finding out duck yields less meat than it looks like it should.",
    extra: {
      label: "How much duck per person",
      href: "/buy/how-much-duck-per-person",
      note: "Portions, yields, and what to buy",
    },
    criticalMove:
      "Plan on a 180 g cooked portion per person and buy against a 40% yield for a whole bird.",
  },
  "what-to-serve": {
    risk: "A rich plate with nothing on it to cut through the fat.",
    extra: {
      label: "What to serve with duck",
      href: "/cook/what-to-serve-with-duck-breast",
      note: "Acid, bitterness, and a starch worth the fat",
    },
    criticalMove:
      "Build the plate around one sharp element and one bitter one, and use the rendered fat on the starch.",
  },
};

/* ------------------------------------------------------------------ *
 * Party-size layer — portion guidance drawn from the buying guide
 * ------------------------------------------------------------------ */

const SERVING: Record<GamePlanCut, Record<GamePlanPartySize, string>> = {
  "duck-breast": {
    "1-2": "One skin-on breast per person for a plated main with sides.",
    "3-4": "One breast per person. Check pack weights against the 180 g standard portion — breast sizes vary a lot between suppliers.",
    "5-6": "One breast per person, cooked in two batches rather than crowding one pan. Rest the first batch while the second renders.",
    crowd:
      "Breast is a hard cut to scale: every piece wants pan contact and a probe. For a crowd, roast whole birds or serve confit legs instead.",
  },
  "whole-duck": {
    "1-2": "One bird is more than you need — most whole ducks are bigger than two portions, so plan the leftovers on purpose.",
    "3-4": "One bird in the usual 2–2.5 kg range. A 2.2 kg duck yields roughly 880 g of cooked meat, about four 180 g portions.",
    "5-6": "One large bird, or two smaller ones for easier carving: six people at 180 g need about 1.08 kg cooked, roughly 2.7 kg raw.",
    crowd:
      "Two or more birds. Eight people need about 1.44 kg of cooked meat, roughly 3.6 kg raw — one duck rarely stretches that far.",
  },
  "duck-legs": {
    "1-2": "One leg each as a main, or two if the legs are small.",
    "3-4": "One leg per person as a main; add a second each if the legs are small and the plate is light.",
    "5-6": "One leg per person, cooked in a vessel that holds them in a single snug layer.",
    crowd: "One leg per person. Legs scale better than any other cut — cook them a day ahead and crisp to order.",
  },
  "duck-confit": {
    "1-2": "One leg each as a main. Confit is rich, so appetites run smaller than people expect.",
    "3-4": "One leg per person as a main, or two if the legs are small and there is little else on the plate.",
    "5-6": "One leg per person, in a vessel snug enough that the fat covers them without a second jar.",
    crowd: "One leg per person, cured and cooked ahead. Crisping to order is the only last-minute job.",
  },
  "not-bought-yet": {
    "1-2": "Two duck breasts is the simplest first buy. A whole bird will feed you twice over.",
    "3-4": "One whole duck in the 2–2.5 kg range, or four breasts if you want a 20-minute cook.",
    "5-6": "One large whole bird — about 2.7 kg raw for six 180 g portions — or six legs for confit.",
    crowd: "Two birds, or legs for confit. Duck yields about 40% edible cooked meat, so buy against that, not against the sticker weight.",
  },
};

/* ------------------------------------------------------------------ *
 * Resolver
 * ------------------------------------------------------------------ */

function dedupeLinks(links: PlanLink[], excludeHrefs: string[]): PlanLink[] {
  const seen = new Set(excludeHrefs);
  const out: PlanLink[] = [];
  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out;
}

/** Stable, low-cardinality recommendation id. */
export function recommendationId(selection: GamePlanSelection): string {
  return `${selection.cut}_${selection.method}`;
}

/**
 * Turns a complete selection into one kitchen card.
 *
 * Layered on purpose: cut sets the facts, method refines the technique and the
 * primary path, concern sets the risk and the critical move, party size sets the
 * portion line. Nothing is generated — every string comes from the tables above.
 */
export function resolveGamePlan(selection: GamePlanSelection): DuckGamePlan {
  const cut = CUT_PLANS[selection.cut];
  const overlay = METHOD_OVERLAYS[`${selection.cut}:${selection.method}`] ?? {};
  const concern = CONCERN_BASE[selection.concern];

  const primary = overlay.primary ?? cut.primary;
  const equipment = overlay.equipment ?? cut.equipment;
  const criticalMove = concern.criticalMove ?? overlay.criticalMove ?? cut.criticalMove;

  const secondary = dedupeLinks(
    [...(concern.extra ? [concern.extra] : []), ...cut.secondary],
    [primary.href],
  ).slice(0, 4);

  const pairing = dedupeLinks(cut.pairing, [primary.href, ...secondary.map((l) => l.href)]).slice(
    0,
    2,
  );

  const plan: DuckGamePlan = {
    recommendationId: recommendationId(selection),
    resultType: overlay.caveat ? "general" : "exact",
    headline: cut.headline,
    summary: overlay.caveat
      ? overlay.caveat
      : `${CUT_LABELS[selection.cut]} · ${METHOD_LABELS[selection.method]} · ${PARTY_SIZE_LABELS[selection.partySize]}. Built around the thing you said you were worried about: ${CONCERN_LABELS[selection.concern].toLowerCase()}.`,
    risk: concern.risk,
    criticalMove,
    temperature: cut.temperature,
    showSafetyNote: selection.cut !== "not-bought-yet",
    timing: overlay.timing ?? cut.timing,
    equipment,
    serving: SERVING[selection.cut][selection.partySize],
    pairing,
    primary,
    secondary,
    ...(cut.rest ? { rest: cut.rest } : {}),
    ...(cut.saveTheFat ? { saveTheFat: cut.saveTheFat } : {}),
    ...(cut.commercial ? { commercial: cut.commercial } : {}),
  };
  return plan;
}

/** True only when every question has been answered. */
export function isCompleteSelection(value: PartialSelection): value is GamePlanSelection {
  return Boolean(value.cut && value.method && value.concern && value.partySize);
}

/** Every internal href a plan can render, for link-resolution tests. */
export function allGamePlanHrefs(): string[] {
  const hrefs = new Set<string>();
  const add = (link?: PlanLink) => {
    if (link) hrefs.add(link.href);
  };
  for (const cut of Object.values(CUT_PLANS)) {
    add(cut.equipment);
    add(cut.primary);
    add(cut.commercial);
    cut.secondary.forEach(add);
    cut.pairing.forEach(add);
  }
  for (const overlay of Object.values(METHOD_OVERLAYS)) {
    add(overlay?.equipment);
    add(overlay?.primary);
  }
  for (const concern of Object.values(CONCERN_BASE)) add(concern.extra);
  return [...hrefs];
}
