/**
 * Central registry of the Ingredients pillar.
 *
 * The hub, related-links modules, site search, and the sitemap all read from
 * here, so publishing a new ingredient page means adding one entry plus its
 * route file.
 */
export type IngredientCluster = "seasoning-prep" | "fat-medium" | "fruit-acid" | "pairing-logic";

export interface IngredientEntry {
  /** Route path, also used as the canonical URL. */
  path: string;
  /** Short card/nav title. */
  title: string;
  /** Full SEO <title>, brand suffix included. */
  seoTitle: string;
  /** Meta description, unique per page. */
  description: string;
  /** One-line promise used on hubs and related modules. */
  teaser: string;
  cluster: IngredientCluster;
  /** Reading time in minutes, rounded. */
  minutes: number;
  /** Deliberate funnel: paths this page should send readers to. */
  related: string[];
}

export const INGREDIENT_CLUSTER_LABELS: Record<IngredientCluster, string> = {
  "seasoning-prep": "Seasoning & prep",
  "fat-medium": "Fat & cooking medium",
  "fruit-acid": "Fruit & acid",
  "pairing-logic": "Pairing logic",
};

export const INGREDIENT_CLUSTER_INTROS: Record<IngredientCluster, string> = {
  "seasoning-prep":
    "What you put on the bird, when you put it on, and how that choice affects skin.",
  "fat-medium": "Duck fat as an ingredient rather than a by-product — and when it is worth it.",
  "fruit-acid": "The fruit and acid pairings that stop rich duck from tasting heavy.",
  "pairing-logic": "Frameworks for building a plate instead of copying one recipe.",
};

export const INGREDIENTS: IngredientEntry[] = [
  {
    path: "/ingredients/best-herbs-spices-for-duck",
    title: "Best Herbs & Spices for Duck",
    seoTitle: "Best Herbs & Spices for Duck: A Flavor-Pairing Guide | DeliciousDuck",
    description:
      "Herbs and spices for duck organised by flavour family — woody herbs, warm spices, peppery heat, aromatic seeds and berries, fresh finishing herbs — with a method-by-method matrix.",
    teaser: "Five flavour families, why each suits duck fat, and where each one clashes.",
    cluster: "seasoning-prep",
    minutes: 11,
    related: [
      "/ingredients/duck-seasoning-guide",
      "/ingredients/best-acid-for-duck",
      "/cook/how-to-cook-duck-breast",
      "/cook/duck-leg-confit",
      "/tools/duck-pairing-finder",
    ],
  },
  {
    path: "/ingredients/duck-seasoning-guide",
    title: "How to Season Duck",
    seoTitle: "How to Season Duck: Salt, Timing & Flavour Layers | DeliciousDuck",
    description:
      "The six ways duck gets seasoned — surface salt, dry brine, cure-style, finishing salt, glazes and aromatic rubs — plus timing, skin drying, and why wet rubs sabotage crisp skin.",
    teaser: "Six seasoning layers, what each one is for, and the order they belong in.",
    cluster: "seasoning-prep",
    minutes: 12,
    related: [
      "/ingredients/dry-brine-duck",
      "/ingredients/best-herbs-spices-for-duck",
      "/learn/how-to-score-duck-breast",
      "/learn/why-duck-skin-isnt-crispy",
      "/cook/whole-roast-duck",
    ],
  },
  {
    path: "/ingredients/duck-marinade-guide",
    title: "Duck Marinades",
    seoTitle: "Duck Marinades: What Helps, What Hurts & When to Use Them | DeliciousDuck",
    description:
      "What a marinade can and cannot do to duck: skin-on versus skinless, wild versus farmed, the roles of acid, salt, sugar and oil, and flavour templates instead of fixed recipes.",
    teaser: "When a marinade earns its place — and when it just softens your skin.",
    cluster: "seasoning-prep",
    minutes: 11,
    related: [
      "/ingredients/duck-seasoning-guide",
      "/ingredients/dry-brine-duck",
      "/cook/how-to-cook-wild-duck-breast",
      "/cook/how-to-cook-duck-breast",
      "/learn/wild-duck-vs-farmed-duck",
    ],
  },
  {
    path: "/ingredients/dry-brine-duck",
    title: "How to Dry Brine Duck",
    seoTitle: "How to Dry Brine Duck for Seasoning & Crisp Skin | DeliciousDuck",
    description:
      "Dry brining duck as a culinary prep technique: salting by weight, fridge airflow, skin drying, and planning ranges for whole birds, breasts and legs.",
    teaser: "Salt by weight, air on all sides, and a timing plan per cut.",
    cluster: "seasoning-prep",
    minutes: 10,
    related: [
      "/ingredients/duck-seasoning-guide",
      "/ingredients/duck-marinade-guide",
      "/cook/whole-roast-duck",
      "/learn/why-duck-skin-isnt-crispy",
      "/learn/how-to-thaw-duck",
    ],
  },
  {
    path: "/ingredients/duck-fat-vs-butter-oil",
    title: "Duck Fat vs Butter, Olive Oil & Neutral Oil",
    seoTitle: "Duck Fat vs Butter, Olive Oil & Neutral Oil | DeliciousDuck",
    description:
      "When duck fat genuinely beats butter, olive oil or a neutral oil — flavour, browning behaviour, water content, roasting, frying and pastry use cases, plus cost and waste logic.",
    teaser: "A reference table for choosing the fat, not defaulting to it.",
    cluster: "fat-medium",
    minutes: 11,
    related: [
      "/tools/duck-fat-substitution-calculator",
      "/learn/how-to-render-duck-fat",
      "/cook/ways-to-use-duck-fat",
      "/buy/duck-fat-buying-guide",
      "/ingredients/best-acid-for-duck",
      "/learn/is-duck-healthy",
    ],
  },
  {
    path: "/ingredients/orange-with-duck",
    title: "Why Orange Works With Duck",
    seoTitle: "Why Orange Works With Duck — Without Being Too Sweet | DeliciousDuck",
    description:
      "The mechanics behind duck and orange: zest oils, acid, bitterness, juice reduction, stock and vinegar support, sauce placement that keeps skin crisp, and orange varieties compared.",
    teaser: "Zest, acid and bitterness — the three levers that keep it from cloying.",
    cluster: "fruit-acid",
    minutes: 10,
    related: [
      "/cook/best-sauces-for-duck-breast",
      "/ingredients/best-acid-for-duck",
      "/cook/how-to-cook-duck-breast",
      "/cook/whole-roast-duck",
      "/ingredients/cherry-plum-with-duck",
      "/recipes/duck-a-lorange",
    ],
  },
  {
    path: "/ingredients/cherry-plum-with-duck",
    title: "Cherry, Plum & Stone Fruit With Duck",
    seoTitle: "Cherry, Plum & Stone Fruit With Duck: A Pairing Framework | DeliciousDuck",
    description:
      "How stone fruit pairs with duck: acidity, tannin and sugar balance, fresh versus dried fruit, wine and vinegar support, and a matrix matching fruit to breast, confit and smoked duck.",
    teaser: "Fruit acidity, tannin and sugar matched to the way you cooked the duck.",
    cluster: "fruit-acid",
    minutes: 10,
    related: [
      "/ingredients/orange-with-duck",
      "/cook/best-sauces-for-duck-breast",
      "/ingredients/best-acid-for-duck",
      "/tools/duck-pairing-finder",
      "/cook/how-to-cook-duck-breast",
      "/recipes/smoked-duck-with-plum-sauce",
    ],
  },
  {
    path: "/ingredients/best-acid-for-duck",
    title: "The Best Acids for Duck",
    seoTitle: "Best Acids for Duck: Vinegar, Citrus, Wine & Pickles | DeliciousDuck",
    description:
      "Acid is the structural counterweight to duck fat. Sherry, red wine, cider and rice vinegar, citrus, wine reductions, pickles and mustard compared, with a method-and-occasion matrix.",
    teaser: "Why acid does more for duck than any other seasoning decision.",
    cluster: "pairing-logic",
    minutes: 11,
    related: [
      "/cook/best-sauces-for-duck-breast",
      "/cook/what-to-serve-with-duck-breast",
      "/ingredients/duck-fat-vs-butter-oil",
      "/ingredients/orange-with-duck",
      "/tools/duck-pairing-finder",
      "/recipes/smoked-duck-with-plum-sauce",
    ],
  },
];

export const ingredientByPath = (path: string): IngredientEntry | undefined =>
  INGREDIENTS.find((i) => i.path === path);

export const ingredientsByCluster = (cluster: IngredientCluster): IngredientEntry[] =>
  INGREDIENTS.filter((i) => i.cluster === cluster);

export const INGREDIENT_CLUSTER_ORDER: IngredientCluster[] = [
  "seasoning-prep",
  "fat-medium",
  "fruit-acid",
  "pairing-logic",
];
