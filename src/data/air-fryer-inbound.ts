/**
 * The link and placement map for /recipes/air-fryer-duck-breast.
 *
 * Three groups, all internal:
 * - inbound discovery links, one tracked sentence per source page;
 * - the on-page skillet-versus-air-fryer comparison and its two hand-offs;
 * - the education hand-offs (scoring, doneness) the method depends on.
 *
 * Hard rules: internal destinations only, one placement per link, no merchant
 * URLs, no appliance recommendations, no claims about outcomes.
 */

export const AIR_FRYER_RECIPE_PATH = "/recipes/air-fryer-duck-breast";

export const AIR_FRYER_INBOUND_PLACEMENTS = {
  panSearedRecipe: "air_fryer_breast_from_pan_seared_recipe",
  breastMethodGuide: "air_fryer_breast_from_breast_method_guide",
  scoringGuide: "air_fryer_breast_from_scoring_guide",
  donenessGuide: "air_fryer_breast_from_doneness_guide",
  breastSourcingGuide: "air_fryer_breast_from_breast_sourcing_guide",
} as const;

export const AIR_FRYER_OUTBOUND_PLACEMENTS = {
  panSearedComparison: "air_fryer_breast_to_pan_seared_recipe",
  breastMethodGuide: "air_fryer_breast_to_breast_method_guide",
  scoringGuide: "air_fryer_breast_to_scoring_guide",
  donenessGuide: "air_fryer_breast_to_doneness_guide",
} as const;

/** Newsletter placement for this recipe's single Duck Drop signup. */
export const AIR_FRYER_NEWSLETTER_PLACEMENT = "air-fryer-duck-breast-field-guide";

export interface MethodComparisonRow {
  factor: string;
  airFryer: string;
  skillet: string;
}

/** Honest, non-superlative comparison. No winner is declared overall. */
export const AIR_FRYER_VS_SKILLET: MethodComparisonRow[] = [
  {
    factor: "Attention needed",
    airFryer: "Two settings and one drain; the basket does the rest.",
    skillet: "Continuous — you manage heat and pour off fat as it renders.",
  },
  {
    factor: "Crust control",
    airFryer: "Air browning, so the crust forms in patches and is harder to steer.",
    skillet: "Direct metal contact over the whole fat cap, adjustable minute by minute.",
  },
  {
    factor: "Fat management",
    airFryer: "Fat drains into the drawer and needs draining once mid-cook.",
    skillet: "Fat sits in the pan and is poured off repeatedly.",
  },
  {
    factor: "Sauce",
    airFryer: "No fond to deglaze; sauces have to be made separately.",
    skillet: "A pan sauce comes free with the cook.",
  },
  {
    factor: "Predictability",
    airFryer: "Times shift materially between machines, so probe earlier than you think.",
    skillet: "More repeatable once you know your pan and burner.",
  },
  {
    factor: "Mess and smell",
    airFryer: "Mostly contained in the basket and drawer.",
    skillet: "Open spatter and more smoke in the room.",
  },
];

/** Every placement id this recipe's link network can emit. */
export function airFryerPlacementIds(): string[] {
  return [
    ...Object.values(AIR_FRYER_INBOUND_PLACEMENTS),
    ...Object.values(AIR_FRYER_OUTBOUND_PLACEMENTS),
  ];
}
