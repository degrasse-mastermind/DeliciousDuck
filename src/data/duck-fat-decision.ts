/**
 * Duck-fat cluster: the render / buy / substitute decision.
 *
 * The three supporting duck-fat pages (rendering, uses, fat-vs-butter) all reach
 * the same fork: the reader either has trim and time, wants a tub, or does not
 * actually need duck fat for the dish in front of them. This is the shared,
 * compact answer to that fork, rendered by `DuckFatDecision`.
 *
 * Hard rules (same as the DEL-12 placement map):
 * - Internal destinations only. No merchant URLs, tracking parameters, prices,
 *   ratings, availability or testing claims live here. Outbound merchant links
 *   stay on `/buy/duck-fat-buying-guide` behind the registry-backed components.
 * - Every rendered link carries a stable, descriptive placement id so the
 *   existing `internal_conversion_click` event joins the destination reporting.
 * - The buying guide is the primary next step, exactly once per page.
 */

import type { ConversionIntent } from "@/data/conversion-paths";

export const DUCK_FAT_BUYING_GUIDE = "/buy/duck-fat-buying-guide";
export const DUCK_FAT_RENDER_GUIDE = "/learn/how-to-render-duck-fat";
export const DUCK_FAT_SUBSTITUTION_TOOL = "/tools/duck-fat-substitution-calculator";

export type DuckFatChoice = "render" | "buy" | "substitute";

export interface DuckFatOption {
  choice: DuckFatChoice;
  /** Short label for the situation the reader is in. */
  when: string;
  /** The call, in a few words. */
  verdict: string;
  /** Why, practically. One or two sentences, no hedging padding. */
  why: string;
  /** Internal destination, or omitted when the reader is already on it. */
  to?: string;
  linkLabel?: string;
  intent?: ConversionIntent;
  /** Stable analytics placement id, present whenever `to` is. */
  placement?: string;
}

export interface DuckFatDecisionSet {
  sourcePath: string;
  heading: string;
  intro: string;
  options: DuckFatOption[];
}

const RENDER_OPTION = (placement: string): DuckFatOption => ({
  choice: "render",
  when: "You have trim, skin or a roasting tray",
  verdict: "Render it yourself",
  why: "Fat off a bird you already cooked is the same product as a tub, for the price of about an hour of low heat and careful straining.",
  to: DUCK_FAT_RENDER_GUIDE,
  linkLabel: "How to render duck fat",
  intent: "technique_validation",
  placement,
});

const BUY_OPTION = (placement: string, why: string): DuckFatOption => ({
  choice: "buy",
  when: "You want it ready, or you need a lot of it",
  verdict: "Buy it rendered",
  why,
  to: DUCK_FAT_BUYING_GUIDE,
  linkLabel: "Duck fat buying guide",
  intent: "sourcing",
  placement,
});

const SUBSTITUTE_OPTION = (placement: string, why: string): DuckFatOption => ({
  choice: "substitute",
  when: "The dish doesn't hang on duck flavour",
  verdict: "Use another fat",
  why,
  to: DUCK_FAT_SUBSTITUTION_TOOL,
  linkLabel: "Work out the swap",
  intent: "technique_validation",
  placement,
});

export const DUCK_FAT_DECISIONS: DuckFatDecisionSet[] = [
  {
    sourcePath: "/learn/how-to-render-duck-fat",
    heading: "Render, buy, or skip it?",
    intro:
      "Rendering is worth it when the raw material is already in your kitchen. When it isn't, buying or swapping is the sane answer.",
    options: [
      {
        choice: "render",
        when: "You have trim, skin or a roasting tray",
        verdict: "Render it — the method above",
        why: "Anything from about 150 g of trim upwards is worth heating a pan for, and the yield is free fat you'd otherwise bin.",
      },
      BUY_OPTION(
        "duck_fat_choice_render_guide_buy",
        "Confit and a few rounds of roast potatoes go through more fat than one bird gives you. The guide covers formats, label terms, and how long an opened tub keeps.",
      ),
      SUBSTITUTE_OPTION(
        "duck_fat_choice_render_guide_substitute",
        "If you're cooking one tray of potatoes tonight and have no trim saved, a high-heat oil gets you crisp — just not the savoury note.",
      ),
    ],
  },
  {
    sourcePath: "/cook/ways-to-use-duck-fat",
    heading: "Running low? Here's the call",
    intro:
      "Most of the uses above take a spoonful. Two of them — confit and a full tray of potatoes — go through a jar fast, so it's worth deciding how you restock before you start.",
    options: [
      RENDER_OPTION("duck_fat_choice_uses_render"),
      BUY_OPTION(
        "duck_fat_choice_uses_buy",
        "Convenience, and volume: confit needs the legs submerged, which is a tub-sized amount rather than a jar. The guide sizes the format to the use.",
      ),
      SUBSTITUTE_OPTION(
        "duck_fat_choice_uses_substitute",
        "For searing, sautéing and anything where the fat is only a cooking medium, a neutral oil does the job. Keep the duck fat for potatoes, confit and pastry.",
      ),
    ],
  },
  {
    sourcePath: "/ingredients/duck-fat-vs-butter-oil",
    heading: "So which fat do you buy?",
    intro:
      "The comparison above answers what to cook with. This is the shopping version of the same answer.",
    options: [
      RENDER_OPTION("duck_fat_choice_vs_butter_render"),
      BUY_OPTION(
        "duck_fat_choice_vs_butter_buy",
        "Worth it if you roast potatoes in it often and don't cook whole birds. Buy the smallest format that covers a few uses, and see whether you reach for it.",
      ),
      SUBSTITUTE_OPTION(
        "duck_fat_choice_vs_butter_substitute",
        "Dairy character, a bright dressing, or sustained deep frying all point somewhere else. The calculator handles the swap where water content matters.",
      ),
    ],
  },
  {
    sourcePath: "/recipes/duck-fat-roasted-potatoes",
    heading: "Render it, buy it, or swap it?",
    intro:
      "This tray takes about 90 g of fat. Which way you get hold of it depends on what is already in your kitchen — all three answers make good potatoes.",
    options: [
      RENDER_OPTION("duck_fat_choice_potatoes_recipe_render"),
      BUY_OPTION(
        "duck_fat_choice_potatoes_recipe_buy",
        "A jar covers two or three trays. The guide covers formats, what the label terms mean, and how long an opened container keeps once you are into it.",
      ),
      SUBSTITUTE_OPTION(
        "duck_fat_choice_potatoes_recipe_substitute",
        "No fat in the house tonight? Beef dripping or a high-heat oil still crisps — the calculator converts the amount so you are not guessing at a swap.",
      ),
    ],
  },
];

export function duckFatDecisionFor(sourcePath: string): DuckFatDecisionSet | undefined {
  return DUCK_FAT_DECISIONS.find((d) => d.sourcePath === sourcePath);
}

/** Every placement id this module can emit, in render order. */
export function duckFatDecisionPlacementIds(): string[] {
  return DUCK_FAT_DECISIONS.flatMap((set) =>
    set.options.map((o) => o.placement).filter((p): p is string => Boolean(p)),
  );
}
