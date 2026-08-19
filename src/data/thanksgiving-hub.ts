/**
 * Thanksgiving duck dinner planning hub — the measured internal plan.
 *
 * The hub's job is a holiday plan a cook can follow, so it hands off to more
 * destinations than a normal editorial page: the serving calculator, sourcing,
 * thawing, timing, the roast method, carving, two pieces of gear, and the side
 * that uses the fat. Those hand-offs live here rather than in
 * `CONVERSION_PATHS` so the site-wide "few steps per page" editorial cap keeps
 * protecting ordinary guides.
 *
 * Hard rules (same as the DEL-12 placement map):
 * - Internal destinations only. No merchant URLs, tracking parameters, prices,
 *   ratings, availability, or testing claims.
 * - Every rendered link carries a stable placement id, so clicks join the
 *   existing `internal_conversion_click` reporting.
 * - One link per destination. No destination is offered twice on the page.
 */

import type { ConversionIntent } from "@/data/conversion-paths";

export const THANKSGIVING_HUB_PATH = "/learn/thanksgiving-duck-dinner";

/** Stage of the holiday plan a step belongs to. */
export type ThanksgivingStage = "decide" | "order" | "cook" | "serve";

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
  },
  {
    stage: "order",
    when: "Two to three weeks out",
    task: "Place the order",
    why: "Holiday duck usually ships frozen on set dispatch days, and the good sizes go first. Ordering early is the whole difference between a plan and a scramble.",
    to: "/buy/where-to-buy-duck-online",
    linkLabel: "Where to buy duck online",
    intent: "sourcing",
    placement: "thanksgiving_hub_sourcing_guide",
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
  },
  {
    stage: "cook",
    when: "Roasting day",
    task: "Follow the roast",
    why: "The full workflow: drying the skin, the fat you pour off along the way, and the finish that crisps it.",
    to: "/cook/whole-roast-duck",
    linkLabel: "How to roast a whole duck",
    intent: "technique_validation",
    placement: "thanksgiving_hub_whole_roast_method",
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
  },
  {
    stage: "serve",
    when: "While the duck rests",
    task: "Use the fat you poured off",
    why: "The best side on the table comes out of the roasting tin: potatoes in the duck fat, in the oven while the bird stands.",
    to: "/recipes/duck-fat-roasted-potatoes",
    linkLabel: "Duck fat roasted potatoes",
    intent: "technique_validation",
    placement: "thanksgiving_hub_duck_fat_potatoes",
  },
];

/** Steps for one stage, in plan order. */
export function thanksgivingStepsFor(stage: ThanksgivingStage): ThanksgivingPlanStep[] {
  return THANKSGIVING_PLAN.filter((s) => s.stage === stage);
}

/** Every placement id this module can emit, in render order. */
export function thanksgivingHubPlacementIds(): string[] {
  return THANKSGIVING_PLAN.map((s) => s.placement);
}
