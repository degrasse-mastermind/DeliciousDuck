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
import { duckFatDecisionPlacementIds } from "@/data/duck-fat-decision";
import { homepagePlacementIds } from "@/data/homepage-intent";
import { normalisePath, destinationSlug } from "@/lib/duck-breast-cluster";

export const CONVERSION_INTENTS = [
  "equipment",
  "temperature_verification",
  "sourcing",
  "technique_validation",
  /** Owned audience: an internal step toward the first-party Field Guide signup. */
  "audience_signup",
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

  /* --- breast sourcing guide -> the cook that justifies it --------- */
  {
    placement: "breast_sourcing_to_thawing",
    sourcePath: "/buy/where-to-buy-duck-breast-online",
    destination: "/learn/how-to-thaw-duck",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "How to thaw duck safely, with timings by weight",
    reason: "Mail-order breast arrives frozen — thaw it in the refrigerator, not on the counter.",
  },

  /* --- breast cornerstones -> breast sourcing guide ---------------- */
  {
    placement: "cook_breast_to_breast_sourcing",
    sourcePath: "/cook/how-to-cook-duck-breast",
    destination: "/buy/where-to-buy-duck-breast-online",
    intent: "sourcing",
    direction: "cornerstone_to_commercial",
    anchor: "Where to buy duck breast online",
    reason: "Skin-on, weight per breast, pack count — the three things worth checking first.",
  },
  {
    placement: "breast_doneness_to_breast_sourcing",
    sourcePath: "/learn/duck-breast-temperature-doneness",
    destination: "/buy/where-to-buy-duck-breast-online",
    intent: "sourcing",
    direction: "cornerstone_to_commercial",
    anchor: "Where to buy duck breast online",
    reason: "A thicker breast is more forgiving of the window — so the format you buy matters.",
  },
  {
    placement: "duck_fat_guide_to_rendering",
    sourcePath: "/buy/duck-fat-buying-guide",
    destination: "/learn/how-to-render-duck-fat",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "How to render duck fat yourself",
    reason: "Worth knowing what an hour of low heat gets you before you buy a tub.",
  },
  {
    placement: "duck_fat_guide_to_uses",
    sourcePath: "/buy/duck-fat-buying-guide",
    destination: "/cook/ways-to-use-duck-fat",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "What to actually do with a jar of duck fat",
    reason: "Match the size you buy to how you plan to cook with it.",
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

  /* --- confit vessel cluster --------------------------------------- */
  {
    placement: "gear_index_to_confit_vessel_guide",
    sourcePath: "/gear",
    destination: "/gear/best-dutch-oven-for-duck-confit",
    intent: "equipment",
    direction: "cornerstone_to_commercial",
    anchor: "Cooking confit? Start with vessel fit",
    reason:
      "The legs have to sit in one snug layer under fat, which rules more pots in and out than any brand does.",
  },
  {
    placement: "confit_to_vessel_guide",
    sourcePath: "/cook/duck-leg-confit",
    destination: "/gear/best-dutch-oven-for-duck-confit",
    intent: "equipment",
    direction: "cornerstone_to_commercial",
    anchor: "Will your pot fit the legs in one layer?",
    reason:
      "A snug vessel keeps the legs submerged in less fat; an oversized one quietly doubles what you need.",
  },
  {
    placement: "duck_fat_guide_to_confit_vessel_guide",
    sourcePath: "/buy/duck-fat-buying-guide",
    destination: "/gear/best-dutch-oven-for-duck-confit",
    intent: "equipment",
    direction: "cornerstone_to_commercial",
    anchor: "How your pot changes how much fat you buy",
    reason: "Vessel width sets the volume, so measure before you order a second tub.",
  },
  {
    placement: "render_fat_to_confit_vessel_guide",
    sourcePath: "/learn/how-to-render-duck-fat",
    destination: "/gear/best-dutch-oven-for-duck-confit",
    intent: "equipment",
    direction: "cornerstone_to_commercial",
    anchor: "Choosing a pot for confit",
    reason:
      "Rendered fat goes furthest in a snug, lidded, nonreactive vessel — here is how to judge yours.",
  },
  {
    placement: "confit_vessel_guide_to_confit_method",
    sourcePath: "/gear/best-dutch-oven-for-duck-confit",
    destination: "/cook/duck-leg-confit",
    intent: "technique_validation",
    direction: "commercial_to_editorial",
    anchor: "The confit method, cure to storage",
    reason: "What the vessel has to do, before you decide whether yours already does it.",
  },
  {
    placement: "confit_vessel_guide_to_duck_fat_guide",
    sourcePath: "/gear/best-dutch-oven-for-duck-confit",
    destination: "/buy/duck-fat-buying-guide",
    intent: "sourcing",
    direction: "commercial_to_editorial",
    anchor: "How much rendered fat to buy, and in what format",
    reason: "Once you know your vessel, you can size the fat rather than guess at it.",
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
  "duck-a-lorange",
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

/**
 * Every placement id the site can emit, including the recipe placements and the
 * duck-fat render/buy/substitute module.
 */
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
    ...duckFatDecisionPlacementIds(),
    ...homepagePlacementIds(),
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
