/**
 * DEL-12 — commercial internal-link conversion paths.
 *
 * The placement map for *internal* conversion links: cornerstone technique,
 * temperature and troubleshooting pages pointing at the single best matching
 * commercial guide, and commercial guides pointing back at the editorial pages
 * that explain why an item matters.
 *
 * Hard rules (do not relax):
 * - Destinations are INTERNAL routes that already exist in `src/routes`. No
 *   merchant URLs, tracking parameters, prices, ratings, availability claims,
 *   testimonials, or testing/endorsement claims live here.
 * - Every row carries a stable, descriptive `placement` id so the click event
 *   joins cleanly with the existing `commercial_page_view` / `affiliate_click`
 *   reporting on the destination route.
 * - Anchor text is specific and honest: it names the page it goes to and never
 *   asserts a "best" claim beyond the destination guide's own title.
 */

import { RECIPE_CONTENT } from "@/data/recipe-content";
import { normalisePath, destinationSlug } from "@/lib/duck-breast-cluster";

export const CONVERSION_INTENTS = [
  "equipment",
  "temperature_verification",
  "sourcing",
  "technique_validation",
] as const;

export type ConversionIntent = (typeof CONVERSION_INTENTS)[number];

export type ConversionDirection = "cornerstone_to_commercial" | "commercial_to_editorial";

export interface ConversionPath {
  /** Stable, descriptive placement id. Also the analytics `placement`. */
  placement: string;
  /** Route the module renders on. */
  sourcePath: string;
  /** Internal destination route. */
  destination: string;
  intent: ConversionIntent;
  direction: ConversionDirection;
  /** Specific anchor text. Never "click here", never a new superlative. */
  anchor: string;
  /** Why this step helps the reader, in editorial terms. */
  reason: string;
}

/**
 * The placement map. One purposeful step per source page, at most two, so no
 * page turns into a wall of repeated boxes.
 */
export const CONVERSION_PATHS: ConversionPath[] = [
  /* --- cornerstone -> commercial ---------------------------------- */
  {
    placement: "score_breast_to_knife_guide",
    sourcePath: "/learn/how-to-score-duck-breast",
    destination: "/gear/best-knife-for-scoring-duck",
    intent: "equipment",
    direction: "cornerstone_to_commercial",
    anchor: "What to look for in a knife for scoring duck",
    reason:
      "Tip control through a cold fat cap is a blade-geometry problem before it is a technique problem.",
  },
  {
    placement: "whole_duck_timing_to_thermometer_guide",
    sourcePath: "/learn/whole-duck-cooking-time",
    destination: "/gear/best-thermometer-for-duck",
    intent: "temperature_verification",
    direction: "cornerstone_to_commercial",
    anchor: "How to choose a thermometer for whole duck",
    reason:
      "Every range on this page is a planning estimate; the thigh reading is what actually ends the roast.",
  },
  {
    placement: "thaw_duck_to_sourcing_guide",
    sourcePath: "/learn/how-to-thaw-duck",
    destination: "/buy/where-to-buy-duck-online",
    intent: "sourcing",
    direction: "cornerstone_to_commercial",
    anchor: "Where to buy duck online, and what to check on arrival",
    reason:
      "Thaw planning starts with how the bird was shipped and what state it was in when it reached your fridge.",
  },
  {
    placement: "serving_calculator_to_sourcing_guide",
    sourcePath: "/tools/whole-duck-serving-calculator",
    destination: "/buy/where-to-buy-duck-online",
    intent: "sourcing",
    direction: "cornerstone_to_commercial",
    anchor: "Where to buy a duck of the weight you just worked out",
    reason:
      "Sold weights come in steps, so it helps to know which suppliers carry which sizes before you order.",
  },

  /* --- commercial -> editorial ------------------------------------ */
  {
    placement: "thermometer_guide_to_whole_duck_timing",
    sourcePath: "/gear/best-thermometer-for-duck",
    destination: "/learn/whole-duck-cooking-time",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "Whole-duck timing ranges and where to probe",
    reason:
      "See what a probe is for on a whole bird before deciding which one you need.",
  },
  {
    placement: "thermometer_guide_to_breast_doneness",
    sourcePath: "/gear/best-thermometer-for-duck",
    destination: "/learn/duck-breast-temperature-doneness",
    intent: "temperature_verification",
    direction: "commercial_to_editorial",
    anchor: "Duck breast pull temperatures and carryover",
    reason: "The few-degree window this equipment exists to hit, explained first.",
  },
  {
    placement: "knife_guide_to_scoring_technique",
    sourcePath: "/gear/best-knife-for-scoring-duck",
    destination: "/learn/how-to-score-duck-breast",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "How to score a duck breast, step by step",
    reason: "The cut this blade has to make, so you can judge the shape you need.",
  },
  {
    placement: "sourcing_guide_to_thawing",
    sourcePath: "/buy/where-to-buy-duck-online",
    destination: "/learn/how-to-thaw-duck",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "How to thaw duck safely, with timings by weight",
    reason: "Most mail-order duck arrives frozen, so plan the thaw before you plan the dinner.",
  },
  {
    placement: "pan_guide_to_crisp_skin_troubleshooting",
    sourcePath: "/gear/best-pan-for-duck-breast",
    destination: "/learn/why-duck-skin-isnt-crispy",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "Why duck skin isn't crispy, and what still fixes it",
    reason: "Check whether the pan is genuinely your limiting factor before buying one.",
  },
];

/** Slug-safe token: lowercase, `_`-separated, no punctuation. */
function idToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Placement id for one rendered recipe conversion link. Deterministic and
 * unique per recipe slug + intent + destination, so every link on a recipe page
 * is separately comparable in reporting.
 */
export function recipePlacementId(
  slug: string,
  intent: "equipment" | "sourcing",
  destination: string,
): string {
  return `recipe_${idToken(slug)}_${intent}_${idToken(destinationSlug(destination))}`;
}

/** Recipe slugs that render the contextual equipment/sourcing pathway. */
export const RECIPE_CONVERSION_SLUGS = [
  "pan-seared-duck-breast",
  "roasted-whole-duck",
  "duck-leg-confit",
] as const;

export function conversionPathsForSource(path: string): ConversionPath[] {
  const normalised = normalisePath(path);
  return CONVERSION_PATHS.filter((p) => p.sourcePath === normalised);
}

export function conversionPathByPlacement(placement: string): ConversionPath | undefined {
  return CONVERSION_PATHS.find((p) => p.placement === placement);
}

/**
 * The exact placement ids a recipe page renders, in render order, derived from
 * the same recipe data the module renders from (de-duplicated by destination,
 * matching the component).
 */
export function recipeConversionPlacements(
  slug: string,
  equipment: { to?: string | undefined }[],
  sourcing: { to: string }[],
): { placement: string; destination: string; intent: "equipment" | "sourcing" }[] {
  const rows = [
    ...equipment
      .filter((item) => Boolean(item.to))
      .map((item) => ({ destination: item.to as string, intent: "equipment" as const })),
    ...sourcing.map((item) => ({ destination: item.to, intent: "sourcing" as const })),
  ].filter(
    (row, index, all) => all.findIndex((other) => other.destination === row.destination) === index,
  );
  return rows.map((row) => ({
    ...row,
    placement: recipePlacementId(slug, row.intent, row.destination),
  }));
}

/** Every placement id the site can emit, including the recipe placements. */
export function allConversionPlacementIds(): string[] {
  return [
    ...CONVERSION_PATHS.map((p) => p.placement),
    ...RECIPE_CONVERSION_SLUGS.flatMap((slug) => {
      const content = RECIPE_CONTENT[slug];
      if (!content) return [];
      return recipeConversionPlacements(slug, content.equipment, content.sourcing).map(
        (row) => row.placement,
      );
    }),
  ];
}

/* ------------------------------------------------------------------ *
 * Event builder
 * ------------------------------------------------------------------ */

export const CONVERSION_PATH_CLICK_EVENT = "internal_conversion_click";

export interface ConversionPathClickEvent {
  readonly name: typeof CONVERSION_PATH_CLICK_EVENT;
  readonly params: {
    readonly destination_slug: string;
    readonly destination_path: string;
    readonly intent: ConversionIntent;
    readonly placement: string;
    readonly source_path: string;
  };
}

/**
 * Pure builder for an internal conversion-path click. Five stable, PII-free
 * parameters: never an address, token, query string, or full URL.
 */
export function buildConversionPathClickEvent(input: {
  destination: string;
  intent: ConversionIntent;
  placement: string;
  sourcePath?: string | undefined;
}): ConversionPathClickEvent {
  return {
    name: CONVERSION_PATH_CLICK_EVENT,
    params: {
      destination_slug: destinationSlug(input.destination),
      destination_path: normalisePath(input.destination),
      intent: input.intent,
      placement: input.placement,
      source_path: normalisePath(input.sourcePath ?? ""),
    },
  };
}
