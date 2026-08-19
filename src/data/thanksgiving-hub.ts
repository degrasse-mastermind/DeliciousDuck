/**
 * Thanksgiving duck dinner planning hub — the measured internal plan.
 *
 * The hub's job is a holiday plan a cook can follow, so it hands off to more
 * destinations than a normal editorial page: the serving calculator, sourcing,
 * thawing, timing, the roast method and recipe, carving, two pieces of gear,
 * and the side that uses the fat. Those hand-offs live here rather than in
 * `CONVERSION_PATHS` so the site-wide "few steps per page" editorial cap keeps
 * protecting ordinary guides.
 *
 * Hard rules (same as the DEL-12 placement map):
 * - Internal destinations only. No merchant URLs, tracking parameters, prices,
 *   ratings, availability, stock, dispatch or sell-through claims, or testing
 *   claims.
 * - Every rendered link carries a stable placement id, so clicks join the
 *   existing `internal_conversion_click` reporting.
 * - One link per destination, rendered in exactly one module. `linkIn` decides
 *   which module owns a step's link: the table-choice module owns the serving
 *   calculator, the commercial module owns the buyer guides, and the plan grid
 *   renders the rest.
 */

import type { ConversionIntent } from "@/data/conversion-paths";

export const THANKSGIVING_HUB_PATH = "/learn/thanksgiving-duck-dinner";

/** Stage of the holiday plan a step belongs to. */
export type ThanksgivingStage = "decide" | "order" | "cook" | "serve";

/** Which module renders this step's tracked link. */
export type ThanksgivingLinkHome = "plan" | "table" | "commercial";

export interface ThanksgivingPlanStep {
  stage: ThanksgivingStage;
  /** When this happens, in the cook's terms. */
  when: string;
  /** The decision or task, in a few words. */
  task: string;
  /** Why it matters here, practically. */
  why: string;
  to: string;
  linkLabel: string;
  intent: ConversionIntent;
  placement: string;
  /** Module that owns the tracked link. Defaults to the plan grid. */
  linkIn: ThanksgivingLinkHome;
  /** Shown beside the link so a recipe never reads like a technique page. */
  kind?: "recipe" | "technique" | "tool" | "guide";
}

export const THANKSGIVING_STAGE_LABELS: Record<ThanksgivingStage, string> = {
  decide: "Settle the numbers",
  order: "Order and thaw",
  cook: "Cook the bird",
  serve: "Carve and serve",
};

export const THANKSGIVING_PLAN: ThanksgivingPlanStep[] = [
  {
    stage: "decide",
    when: "Three weeks out",
    task: "Work out how many birds",
    why: "Duck yields less meat per pound than a turkey, so the guest count decides whether this is one bird, two, or a bird plus extra legs.",
    to: "/tools/whole-duck-serving-calculator",
    linkLabel: "Whole-duck serving calculator",
    intent: "sourcing",
    placement: "thanksgiving_hub_serving_calculator",
    linkIn: "table",
    kind: "tool",
  },
  {
    stage: "order",
    when: "Two to three weeks out",
    task: "Place the order",
    why: "Shop early enough to check what a seller actually has, what format it arrives in, and which delivery dates they offer — then work the thaw around that.",
    to: "/buy/where-to-buy-duck-online",
    linkLabel: "Where to buy duck online",
    intent: "sourcing",
    placement: "thanksgiving_hub_sourcing_guide",
    linkIn: "commercial",
    kind: "guide",
  },
  {
    stage: "order",
    when: "Two to three days out",
    task: "Start the thaw",
    why: "A frozen whole duck thaws in the refrigerator, not on the counter, and that takes longer than most holiday schedules allow for.",
    to: "/learn/how-to-thaw-duck",
    linkLabel: "How to thaw duck safely",
    intent: "technique_validation",
    placement: "thanksgiving_hub_thawing_guide",
    linkIn: "plan",
    kind: "guide",
  },
  {
    stage: "cook",
    when: "The day before",
    task: "Back-time the oven",
    why: "Put your bird weight in and get a serving time you can build the rest of the meal around, rest included.",
    to: "/tools/duck-cooking-time-planner",
    linkLabel: "Duck cooking time planner",
    intent: "technique_validation",
    placement: "thanksgiving_hub_timing_planner",
    linkIn: "plan",
    kind: "tool",
  },
  {
    stage: "cook",
    when: "The day before",
    task: "Check the pan fits",
    why: "A holiday duck needs a rack and clearance from its own rendered fat. Measure the loaded pan against your oven before the day, not on it.",
    to: "/gear/best-roasting-pan-for-duck",
    linkLabel: "Roasting setup for duck",
    intent: "equipment",
    placement: "thanksgiving_hub_roasting_setup",
    linkIn: "commercial",
    kind: "guide",
  },
  {
    stage: "cook",
    when: "Roasting day",
    task: "Cook it from the recipe",
    why: "Weights, oven settings and the order of the steps, written as a recipe you can stand over rather than a discussion of method.",
    to: "/recipes/roasted-whole-duck",
    linkLabel: "Roasted whole duck",
    intent: "technique_validation",
    placement: "thanksgiving_hub_roasted_whole_duck_recipe",
    linkIn: "plan",
    kind: "recipe",
  },
  {
    stage: "cook",
    when: "Roasting day",
    task: "Understand the method behind it",
    why: "Why the skin is dried, what the poured-off fat is doing to the pan, and how the finish crisps it — the reasoning the recipe assumes.",
    to: "/cook/whole-roast-duck",
    linkLabel: "How to roast a whole duck",
    intent: "technique_validation",
    placement: "thanksgiving_hub_whole_roast_method",
    linkIn: "plan",
    kind: "technique",
  },
  {
    stage: "cook",
    when: "The last half hour",
    task: "Call it by temperature",
    why: "The clock gets you close; a reading in the thickest part of the thigh is what actually ends the roast.",
    to: "/gear/best-thermometer-for-duck",
    linkLabel: "Thermometers for duck",
    intent: "equipment",
    placement: "thanksgiving_hub_thermometer_guide",
    linkIn: "commercial",
    kind: "guide",
  },
  {
    stage: "serve",
    when: "After the rest",
    task: "Carve for the table",
    why: "A duck comes apart differently from a turkey: legs at the joint, breasts off in one piece, then sliced.",
    to: "/learn/how-to-carve-a-duck",
    linkLabel: "How to carve a whole duck",
    intent: "technique_validation",
    placement: "thanksgiving_hub_carving_guide",
    linkIn: "plan",
    kind: "guide",
  },
  {
    stage: "serve",
    when: "Made ahead, re-crisped at the end",
    task: "Use the fat you poured off",
    why: "Roast the potatoes in duck fat earlier in the day, then give them ten to twelve minutes uncovered while the duck rests.",
    to: "/recipes/duck-fat-roasted-potatoes",
    linkLabel: "Duck fat roasted potatoes",
    intent: "technique_validation",
    placement: "thanksgiving_hub_duck_fat_potatoes",
    linkIn: "plan",
    kind: "recipe",
  },
];

/** Steps for one stage, in plan order, whose link the plan grid owns. */
export function thanksgivingStepsFor(stage: ThanksgivingStage): ThanksgivingPlanStep[] {
  return THANKSGIVING_PLAN.filter((s) => s.stage === stage);
}

/** One step by placement id. */
export function thanksgivingStep(placement: string): ThanksgivingPlanStep {
  const step = THANKSGIVING_PLAN.find((s) => s.placement === placement);
  if (!step) throw new Error(`Unknown Thanksgiving plan placement: ${placement}`);
  return step;
}

/** Steps rendered by a given module. */
export function thanksgivingStepsIn(home: ThanksgivingLinkHome): ThanksgivingPlanStep[] {
  return THANKSGIVING_PLAN.filter((s) => s.linkIn === home);
}

/* ------------------------------------------------------------------ *
 * Choose your table
 * ------------------------------------------------------------------ */

export interface ThanksgivingTableChoice {
  guests: string;
  headline: string;
  /** Who this suits. */
  suits: string;
  /** The operational tradeoff, stated plainly. */
  tradeoff: string;
}

/**
 * Table-size paths. Only the first one carries the tracked serving-calculator
 * link (the module renders it once, below the three paths), because the
 * calculator — not this page — decides quantity.
 */
export const THANKSGIVING_TABLE_CHOICES: ThanksgivingTableChoice[] = [
  {
    guests: "2 to 4 guests",
    headline: "One whole duck as the centrepiece",
    suits:
      "A small table that wants the bird to be the event, and a cook who would rather roast one thing well than juggle two ovens.",
    tradeoff:
      "Yield is the constraint, not flavour: a single duck is generous for a small table and thin for a stretched one, so let the calculator set the weight rather than trusting a headline serving count.",
  },
  {
    guests: "5 to 8 guests",
    headline: "Calculator-led bird count, plus a capacity check",
    suits:
      "A full family table that still wants duck as the main event, with someone willing to plan the kitchen as carefully as the menu.",
    tradeoff:
      "This is usually two birds or a bird plus extra legs, which means checking three things before you order: pan and rack space, refrigerator shelf space for the thaw, and whether both birds fit your oven with air around them.",
  },
  {
    guests: "Larger or mixed tables",
    headline: "Duck alongside turkey, or duck as a portioned course",
    suits:
      "Big or traditional tables where turkey is expected, and hosts who want duck on the table without rebuilding the whole meal around it.",
    tradeoff:
      "Two whole birds rarely share one oven comfortably. Either roast the duck first and rest it while the turkey finishes, or serve duck as a portioned course — breasts or confit legs — which cooks in stages and holds better than a second whole bird.",
  },
];

/* ------------------------------------------------------------------ *
 * Friday: nothing wasted
 * ------------------------------------------------------------------ */

export interface ThanksgivingLeftoverPath {
  heading: string;
  body: string;
  to: string;
  linkLabel: string;
  intent: ConversionIntent;
  placement: string;
}

export const THANKSGIVING_LEFTOVERS: ThanksgivingLeftoverPath[] = [
  {
    heading: "The fat in the jar",
    body: "Strain what you poured off while it is still warm, into a clean jar, and refrigerate it. It is the best roasting fat in the kitchen and the reason Friday's potatoes are better than Thursday's.",
    to: "/learn/how-to-render-duck-fat",
    linkLabel: "How to render and store duck fat",
    intent: "technique_validation",
    placement: "thanksgiving_hub_leftover_fat_rendering",
  },
  {
    heading: "What to do with it next",
    body: "Potatoes first, then everything else it improves — vegetables, eggs, a confit later in the winter. A jar of duck fat is a week of better cooking, not a novelty.",
    to: "/cook/ways-to-use-duck-fat",
    linkLabel: "Ways to use duck fat",
    intent: "technique_validation",
    placement: "thanksgiving_hub_leftover_fat_uses",
  },
];

/* ------------------------------------------------------------------ *
 * Printable plan
 * ------------------------------------------------------------------ */

/** Stable placement for the print control. */
export const THANKSGIVING_PRINT_PLACEMENT = "thanksgiving_hub_print_plan";

export interface ThanksgivingChecklistGroup {
  heading: string;
  items: string[];
}

export const THANKSGIVING_CHECKLIST: ThanksgivingChecklistGroup[] = [
  {
    heading: "Three weeks out",
    items: [
      "Guest count settled, and bird count taken from the serving calculator",
      "Raw weight to order written down",
    ],
  },
  {
    heading: "Ordering",
    items: [
      "Seller checked for what they actually have in the size you need",
      "Format confirmed: fresh or frozen, and how it will be packed",
      "Delivery date confirmed and written on the calendar",
      "Thawing days counted back from dinner from that delivery date",
    ],
  },
  {
    heading: "One week out",
    items: [
      "Roasting pan and rack found, and the loaded pan measured against the oven",
      "Instant-read thermometer located and tested in boiling water",
      "Refrigerator shelf cleared for a covered, thawing bird",
      "Oven plan written for the day: what goes in, in what order",
    ],
  },
  {
    heading: "Two to three days out",
    items: [
      "Duck moved from freezer to refrigerator, covered, on a tray",
      "Make-ahead sauce base cooked and refrigerated",
      "Make-ahead sides prepared, including potatoes part-roasted in duck fat if you have it",
    ],
  },
  {
    heading: "The night before",
    items: [
      "Bird patted dry, salted, and left uncovered on a rack in the refrigerator",
      "Backward cooking schedule written from your serving hour, rest included",
    ],
  },
  {
    heading: "Roasting day",
    items: [
      "Duck goes in at the scheduled time; fat poured off into a heatproof jar as it collects",
      "Thigh reads 165°F (73.9°C) away from bone before the bird comes out",
      "Bird rests while the potatoes re-crisp uncovered",
      "Carve after the rest: legs off at the joint first, then the breasts, then sliced",
    ],
  },
  {
    heading: "Afterwards",
    items: [
      "Cooked duck refrigerated within two hours of coming out of the oven (one hour above 90°F / 32.2°C)",
      "Leftovers eaten within three to four days, reheated to 165°F (73.9°C)",
      "Rendered fat strained into a clean jar and refrigerated",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Reciprocal links into the hub
 * ------------------------------------------------------------------ */

/**
 * One tracked hub link per source route. Each source page gets exactly one
 * contextual entry point, so the hub is reachable from the pages a holiday
 * cook is already reading without cluttering them with a module.
 */
export const THANKSGIVING_INBOUND_PLACEMENTS = {
  duckVsTurkey: "thanksgiving_hub_from_duck_vs_turkey",
  roastedWholeDuckRecipe: "thanksgiving_hub_from_roasted_whole_duck_recipe",
  wholeRoastMethod: "thanksgiving_hub_from_whole_roast_method",
  thawingGuide: "thanksgiving_hub_from_thawing_guide",
  servingCalculator: "thanksgiving_hub_from_serving_calculator",
  sourcingGuide: "thanksgiving_hub_from_sourcing_guide",
  duckFatPotatoes: "thanksgiving_hub_from_duck_fat_potatoes",
} as const;

/** Every placement id this hub can emit, in render order. */
export function thanksgivingHubPlacementIds(): string[] {
  return [
    ...THANKSGIVING_PLAN.map((s) => s.placement),
    ...THANKSGIVING_LEFTOVERS.map((s) => s.placement),
    THANKSGIVING_PRINT_PLACEMENT,
    ...Object.values(THANKSGIVING_INBOUND_PLACEMENTS),
  ];
}
