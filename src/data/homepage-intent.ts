/**
 * Homepage intent router + homepage commerce cards.
 *
 * The homepage is the site's busiest page, so it gets one compact question near
 * the top — "What brings you to the duck?" — with four mutually clear answers,
 * and one editorial card per distinct buying decision lower down.
 *
 * Hard rules (same as the DEL-12 placement map):
 * - Internal destinations only. No merchant URLs, prices, ratings, availability
 *   or testing claims live here.
 * - Every rendered link carries a stable, descriptive placement id so the
 *   existing `internal_conversion_click` event joins destination reporting.
 * - Each destination appears exactly once across both homepage modules.
 */

import type { ConversionIntent } from "@/data/conversion-paths";

/** Anchor id rendered by the homepage `NewsletterSignup` section. */
export const FIELD_GUIDE_ANCHOR_ID = "starter-guide";

export interface HomeIntentRoute {
  /** Stable analytics placement id. */
  placement: string;
  /** Outcome-led label. */
  label: string;
  /** One practical sentence. */
  blurb: string;
  /** Internal route, or the same-page anchor for the Field Guide signup. */
  to: string;
  /** True when the CTA scrolls to a section on this page instead of routing. */
  anchor?: boolean;
  ctaLabel: string;
  intent: ConversionIntent;
}

export const HOMEPAGE_INTENT_ROUTES: HomeIntentRoute[] = [
  {
    placement: "home_intent_cook_tonight",
    label: "Cooking duck tonight",
    blurb:
      "Start with a recipe that teaches the technique: crisp-skin breast, a whole roast bird, or slow-cooked legs.",
    to: "/recipes",
    ctaLabel: "Browse the recipes",
    intent: "technique_validation",
  },
  {
    placement: "home_intent_buy_duck",
    label: "Buying the duck first",
    blurb:
      "Compare the ways duck actually reaches a home kitchen, and what to check the moment the box arrives.",
    to: "/buy/where-to-buy-duck-online",
    ctaLabel: "Where to buy duck",
    intent: "sourcing",
  },
  {
    placement: "home_intent_choose_gear",
    label: "Sorting out the kit",
    blurb:
      "A whole duck needs somewhere for the fat to go. This is how to judge a roasting pan by size and material.",
    to: "/gear/best-roasting-pan-for-duck",
    ctaLabel: "Choose a roasting pan",
    intent: "equipment",
  },
  {
    placement: "home_intent_field_guide",
    label: "New to duck entirely",
    blurb:
      "Get the printable Field Guide: buying, prepping, cooking, carving and troubleshooting on sixteen pages.",
    to: `#${FIELD_GUIDE_ANCHOR_ID}`,
    anchor: true,
    ctaLabel: "Get the Field Guide",
    intent: "audience_signup",
  },
];

export interface HomeCommerceCard {
  placement: string;
  /** The decision this card settles, in a few words. */
  decision: string;
  heading: string;
  bestFor: string;
  why: string;
  to: string;
  ctaLabel: string;
  intent: ConversionIntent;
}

/**
 * One card per distinct decision. The roasting pan lives in the intent router
 * above, so it is deliberately absent here — no homepage destination repeats.
 */
export const HOMEPAGE_COMMERCE_CARDS: HomeCommerceCard[] = [
  {
    placement: "home_commerce_where_to_buy_duck",
    decision: "Where the bird comes from",
    heading: "Buying duck online",
    bestFor: "Anyone without a butcher who stocks duck year round.",
    why: "Specialist shippers and farm-direct producers behave differently on cuts, cold chain and traceability. The guide lays out how to compare them.",
    to: "/buy/where-to-buy-duck-online",
    ctaLabel: "Compare online sellers",
    intent: "sourcing",
  },
  {
    placement: "home_commerce_thermometer",
    decision: "Knowing when it's done",
    heading: "An instant-read thermometer",
    bestFor: "Breast cooked rosy, and thighs taken further.",
    why: "Duck breast has a narrow window between rosy and grey, and a thigh reading is what actually ends a roast. Speed and probe thickness are the things to judge.",
    to: "/gear/best-thermometer-for-duck",
    ctaLabel: "How to choose a thermometer",
    intent: "temperature_verification",
  },
  {
    placement: "home_commerce_breast_pan",
    decision: "The pan for breast",
    heading: "A skillet that renders fat",
    bestFor: "Skin-on breast, started cold in a dry pan.",
    why: "Thermal mass and an uncoated surface are what keep the fat rendering steadily instead of stalling when a cold breast hits the metal.",
    to: "/gear/best-pan-for-duck-breast",
    ctaLabel: "Pan buying guide",
    intent: "equipment",
  },
  {
    placement: "home_commerce_duck_fat",
    decision: "Fat: render or buy",
    heading: "Rendered duck fat",
    bestFor: "Confit, and potatoes worth the detour.",
    why: "One bird gives you a jar; confit wants a tub. The guide covers formats, label terms and how long an opened one keeps.",
    to: "/buy/duck-fat-buying-guide",
    ctaLabel: "Duck fat buying guide",
    intent: "sourcing",
  },
];

/** Every homepage placement id, for the shared placement registry and tests. */
export function homepagePlacementIds(): string[] {
  return [
    ...HOMEPAGE_INTENT_ROUTES.map((r) => r.placement),
    ...HOMEPAGE_COMMERCE_CARDS.map((c) => c.placement),
  ];
}
