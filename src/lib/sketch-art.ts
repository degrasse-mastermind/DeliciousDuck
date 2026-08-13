import wholeRoastDuck from "@/assets/sketch/whole-roast-duck.jpg";
import duckBreastPan from "@/assets/sketch/duck-breast-pan.jpg";
import confit from "@/assets/sketch/confit.jpg";
import duckFat from "@/assets/sketch/duck-fat.jpg";
import thermometer from "@/assets/sketch/thermometer.jpg";
import carving from "@/assets/sketch/carving.jpg";
import fruitPairings from "@/assets/sketch/fruit-pairings.jpg";
import spices from "@/assets/sketch/spices.jpg";
import wildVsFarmed from "@/assets/sketch/wild-vs-farmed.jpg";
import buyingDuck from "@/assets/sketch/buying-duck.jpg";
import gearFlatlay from "@/assets/sketch/gear-flatlay.jpg";
import renderingFat from "@/assets/sketch/rendering-fat.jpg";
import dryBrine from "@/assets/sketch/dry-brine.jpg";
import slicedBreast from "@/assets/sketch/sliced-breast.jpg";
import toolsDesk from "@/assets/sketch/tools-desk.jpg";
import newsletterArt from "@/assets/sketch/newsletter.jpg";
import ducksFlight from "@/assets/sketch/ducks-flight.jpg";
import sauce from "@/assets/sketch/sauce.jpg";
import scoring from "@/assets/sketch/scoring.jpg";
import sides from "@/assets/sketch/sides.jpg";
import thawing from "@/assets/sketch/thawing.jpg";
import ovenRoast from "@/assets/sketch/oven-roast.jpg";

export type SketchArt = { src: string; alt: string };

/** Named colored-pencil illustrations, reusable anywhere on the site. */
export const SKETCH = {
  wholeRoastDuck: {
    src: wholeRoastDuck,
    alt: "Colored-pencil sketch of a whole roast duck resting on a platter with thyme",
  },
  duckBreastPan: {
    src: duckBreastPan,
    alt: "Colored-pencil sketch of a scored duck breast rendering skin-side down in a skillet",
  },
  confit: {
    src: confit,
    alt: "Colored-pencil sketch of a duck leg preserved in golden fat inside a glass jar",
  },
  duckFat: {
    src: duckFat,
    alt: "Colored-pencil sketch of a jar of duck fat beside a pan of roast potatoes",
  },
  thermometer: {
    src: thermometer,
    alt: "Colored-pencil sketch of an instant-read thermometer probing a duck breast",
  },
  carving: {
    src: carving,
    alt: "Colored-pencil sketch of a roast duck being carved on a wooden board",
  },
  fruitPairings: {
    src: fruitPairings,
    alt: "Colored-pencil sketch of orange slices, cherries and plums with thyme",
  },
  spices: {
    src: spices,
    alt: "Colored-pencil sketch of star anise, peppercorns, salt and herb sprigs",
  },
  wildVsFarmed: {
    src: wildVsFarmed,
    alt: "Colored-pencil sketch comparing a wild mallard drake with a farmed Pekin duck",
  },
  buyingDuck: {
    src: buyingDuck,
    alt: "Colored-pencil sketch of duck breasts wrapped in butcher paper with twine",
  },
  gearFlatlay: {
    src: gearFlatlay,
    alt: "Colored-pencil sketch of a skillet, knife, tongs and linen towel laid out",
  },
  renderingFat: {
    src: renderingFat,
    alt: "Colored-pencil sketch of rendered duck fat being strained into a jar",
  },
  dryBrine: {
    src: dryBrine,
    alt: "Colored-pencil sketch of coarse salt falling onto a duck breast on a rack",
  },
  slicedBreast: {
    src: slicedBreast,
    alt: "Colored-pencil sketch of sliced duck breast on a plate with dark fruit sauce",
  },
  toolsDesk: {
    src: toolsDesk,
    alt: "Colored-pencil sketch of a kitchen timer beside an open notebook and pencil",
  },
  newsletter: {
    src: newsletterArt,
    alt: "Colored-pencil sketch of an envelope with a single duck feather resting on it",
  },
  ducksFlight: {
    src: ducksFlight,
    alt: "Colored-pencil sketch of a mallard in flight across an open sky",
  },
  sauce: {
    src: sauce,
    alt: "Colored-pencil sketch of a spoon lifting glossy reduction sauce from a pan",
  },
  scoring: {
    src: scoring,
    alt: "Colored-pencil sketch of a knife tip scoring a crosshatch into duck skin",
  },
  sides: {
    src: sides,
    alt: "Colored-pencil sketch of braised greens, roast potatoes and pickles in bowls",
  },
  thawing: {
    src: thawing,
    alt: "Colored-pencil sketch of a covered tray thawing on a refrigerator shelf",
  },
  ovenRoast: {
    src: ovenRoast,
    alt: "Colored-pencil sketch of an open oven with a roasting tin under warm light",
  },
} satisfies Record<string, SketchArt>;

/** Exact route path → illustration. */
const BY_PATH: Record<string, keyof typeof SKETCH> = {
  "/cook": "duckBreastPan",
  "/cook/how-to-cook-duck-breast": "duckBreastPan",
  "/cook/how-to-cook-wild-duck-breast": "wildVsFarmed",
  "/cook/duck-leg-confit": "confit",
  "/cook/whole-roast-duck": "wholeRoastDuck",
  "/cook/ways-to-use-duck-fat": "duckFat",
  "/cook/best-sauces-for-duck-breast": "sauce",
  "/cook/what-to-serve-with-duck-breast": "sides",

  "/learn": "ducksFlight",
  "/learn/duck-breast-temperature-doneness": "thermometer",
  "/learn/how-to-score-duck-breast": "scoring",
  "/learn/why-duck-skin-isnt-crispy": "duckBreastPan",
  "/learn/whole-duck-cooking-time": "ovenRoast",
  "/learn/how-to-carve-a-duck": "carving",
  "/learn/how-to-thaw-duck": "thawing",
  "/learn/how-to-render-duck-fat": "renderingFat",
  "/learn/wild-duck-vs-farmed-duck": "wildVsFarmed",

  "/buy": "buyingDuck",
  "/buy/where-to-buy-duck-online": "buyingDuck",
  "/buy/duck-fat-buying-guide": "duckFat",

  "/gear": "gearFlatlay",
  "/gear/best-pan-for-duck-breast": "gearFlatlay",
  "/gear/best-knife-for-scoring-duck": "scoring",
  "/gear/best-thermometer-for-duck": "thermometer",

  "/ingredients": "spices",
  "/ingredients/duck-seasoning-guide": "spices",
  "/ingredients/best-herbs-spices-for-duck": "spices",
  "/ingredients/dry-brine-duck": "dryBrine",
  "/ingredients/duck-marinade-guide": "spices",
  "/ingredients/best-acid-for-duck": "fruitPairings",
  "/ingredients/orange-with-duck": "fruitPairings",
  "/ingredients/cherry-plum-with-duck": "fruitPairings",
  "/ingredients/duck-fat-vs-butter-oil": "duckFat",

  "/tools": "toolsDesk",
  "/tools/duck-cooking-time-planner": "ovenRoast",
  "/tools/duck-doneness-guide": "thermometer",
  "/tools/recipe-scaler": "toolsDesk",
  "/tools/duck-fat-substitution-calculator": "duckFat",
  "/tools/duck-pairing-finder": "fruitPairings",

  "/recipes": "slicedBreast",
  "/recipes/pan-seared-duck-breast": "duckBreastPan",
  "/recipes/duck-leg-confit": "confit",
  "/recipes/roasted-whole-duck": "wholeRoastDuck",
  "/recipes/duck-fat-potatoes": "duckFat",

  "/guides/duck-cooking-starter-guide": "ducksFlight",
  "/search": "ducksFlight",
  "/about": "ducksFlight",
  "/editorial-standards": "toolsDesk",
  "/affiliate-disclosure": "toolsDesk",
  "/newsletter/preferences": "newsletter",
  "/newsletter/unsubscribe": "newsletter",
};

/** Section fallbacks so every page still gets a fitting illustration. */
const BY_PREFIX: Array<[string, keyof typeof SKETCH]> = [
  ["/cook", "duckBreastPan"],
  ["/learn", "thermometer"],
  ["/buy", "buyingDuck"],
  ["/gear", "gearFlatlay"],
  ["/ingredients", "spices"],
  ["/tools", "toolsDesk"],
  ["/recipes", "slicedBreast"],
  ["/guides", "ducksFlight"],
  ["/newsletter", "newsletter"],
];

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/** Resolve the illustration for a route path, or null for internal/legal pages. */
export function sketchForPath(pathname: string): SketchArt | null {
  const path = normalize(pathname);
  if (path.startsWith("/internal")) return null;

  const exact = BY_PATH[path];
  if (exact) return SKETCH[exact] ?? null;

  const prefix = BY_PREFIX.find(([p]) => path === p || path.startsWith(`${p}/`));
  if (prefix) return SKETCH[prefix[1]] ?? null;


  return null;
}
