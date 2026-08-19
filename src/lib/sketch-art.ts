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
// Transparent-alpha master: this drawing has no painted paper ground, so it
// floats on any surface instead of relying on multiply blend.
import duckVsTurkey from "@/assets/sketch/duck-vs-turkey.png";
// Transparent-alpha master, bound explicitly to the roasting-pan gear guide.
import roastingPans from "@/assets/sketch/roasting-pans.png";

export type SketchArt = {
  src: string;
  alt: string;
  /**
   * True when the export carries genuine alpha instead of a painted white
   * ground. Transparent art must not be multiplied — see `SketchFigure`.
   */
  transparent?: boolean;
};

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
  roastingPans: {
    src: roastingPans,
    alt: "Colored-pencil sketch of a roasting pan holding a wire rack beside a rimmed sheet pan and a cast-iron skillet",
    transparent: true,
  },
  duckVsTurkey: {
    src: duckVsTurkey,
    alt: "Colored-pencil sketch of a roast duck and a roast turkey side by side on platters with sage, cranberries and orange",
    transparent: true,
  },
} satisfies Record<string, SketchArt>;

/** Registry key for a named illustration. */
export type SketchKey = keyof typeof SKETCH;

/** Exact route path → illustration. */
const BY_PATH: Record<string, SketchKey> = {
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
  "/learn/duck-vs-turkey-thanksgiving": "duckVsTurkey",

  "/buy": "buyingDuck",
  "/buy/where-to-buy-duck-online": "buyingDuck",
  "/buy/duck-fat-buying-guide": "duckFat",
  "/buy/what-cut-of-duck-to-buy": "buyingDuck",
  "/buy/how-much-duck-per-person": "wholeRoastDuck",
  "/buy/fresh-vs-frozen-duck": "thawing",
  "/buy/how-to-choose-duck": "buyingDuck",


  "/gear": "gearFlatlay",
  "/gear/best-pan-for-duck-breast": "gearFlatlay",
  // Bound explicitly: keyword fallback would reach for a bird or an oven, not
  // the vessels this page is actually about.
  "/gear/best-roasting-pan-for-duck": "roastingPans",
  "/gear/best-knife-for-scoring-duck": "scoring",
  "/gear/best-thermometer-for-duck": "thermometer",
  // Bound explicitly: the confit drawing shows legs submerged in fat in a
  // lidded pot, which is exactly the fit question this guide answers.
  "/gear/best-dutch-oven-for-duck-confit": "confit",

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
  // Bound explicitly: the keyword rules would match "orange" and reach for the
  // fruit still life, but this page is a whole roast bird with a sauce.
  "/recipes/duck-a-lorange": "wholeRoastDuck",
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
const BY_PREFIX: Array<[string, SketchKey]> = [
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

/**
 * Keyword rules for routes we haven't mapped by hand yet. Matched against the
 * whole slug, longest keyword wins, so `/cook/duck-fat-confit-legs` resolves to
 * the confit drawing rather than the generic section art.
 */
const BY_KEYWORD: Array<[string, SketchKey]> = [
  // Holiday comparison art shows BOTH birds, so it may only be selected by
  // keywords that genuinely imply a duck-versus-turkey comparison. A bare
  // "holiday" or "roast" must never inherit it.
  ["thanksgiving", "duckVsTurkey"],
  ["duck-vs-turkey", "duckVsTurkey"],
  ["turkey", "duckVsTurkey"],
  ["confit", "confit"],
  ["render", "renderingFat"],
  ["duck-fat", "duckFat"],
  ["fat", "duckFat"],
  ["whole-duck", "wholeRoastDuck"],
  ["whole-roast", "wholeRoastDuck"],
  ["roast", "ovenRoast"],
  ["oven", "ovenRoast"],
  ["breast", "duckBreastPan"],
  ["sear", "duckBreastPan"],
  ["skin", "duckBreastPan"],
  ["crisp", "duckBreastPan"],
  ["score", "scoring"],
  ["scoring", "scoring"],
  ["knife", "scoring"],
  ["slice", "slicedBreast"],
  ["carve", "carving"],
  ["carving", "carving"],
  ["temperature", "thermometer"],
  ["temp", "thermometer"],
  ["doneness", "thermometer"],
  ["thermometer", "thermometer"],
  ["probe", "thermometer"],
  ["thaw", "thawing"],
  ["freeze", "thawing"],
  ["frozen", "thawing"],
  ["store", "thawing"],
  ["storage", "thawing"],
  ["brine", "dryBrine"],
  ["salt", "dryBrine"],
  ["cure", "dryBrine"],
  ["season", "spices"],
  ["spice", "spices"],
  ["herb", "spices"],
  ["marinade", "spices"],
  ["rub", "spices"],
  ["sauce", "sauce"],
  ["glaze", "sauce"],
  ["gravy", "sauce"],
  ["reduction", "sauce"],
  ["orange", "fruitPairings"],
  ["cherry", "fruitPairings"],
  ["plum", "fruitPairings"],
  ["fruit", "fruitPairings"],
  ["berry", "fruitPairings"],
  ["acid", "fruitPairings"],
  ["vinegar", "fruitPairings"],
  ["pairing", "fruitPairings"],
  ["wine", "fruitPairings"],
  ["serve-with", "sides"],
  ["side", "sides"],
  ["vegetable", "sides"],
  ["potato", "duckFat"],
  ["wild", "wildVsFarmed"],
  ["farmed", "wildVsFarmed"],
  ["pekin", "wildVsFarmed"],
  ["muscovy", "wildVsFarmed"],
  ["moulard", "wildVsFarmed"],
  ["breed", "wildVsFarmed"],
  ["buy", "buyingDuck"],
  ["where-to", "buyingDuck"],
  ["price", "buyingDuck"],
  ["cost", "buyingDuck"],
  ["butcher", "buyingDuck"],
  ["pan", "gearFlatlay"],
  ["skillet", "gearFlatlay"],
  ["gear", "gearFlatlay"],
  ["equipment", "gearFlatlay"],
  ["best-", "gearFlatlay"],
  ["calculator", "toolsDesk"],
  ["planner", "toolsDesk"],
  ["scaler", "toolsDesk"],
  ["tool", "toolsDesk"],
  ["time", "toolsDesk"],
  ["newsletter", "newsletter"],
  ["subscribe", "newsletter"],
  ["duck-drop", "newsletter"],
  ["email", "newsletter"],
  ["recipe", "slicedBreast"],
  ["leg", "confit"],
  ["duck", "ducksFlight"],
];

/** Routes that should stay illustration-free (internal, legal, utility). */
const NO_ART_PREFIXES = ["/internal", "/privacy", "/terms", "/legal", "/api"];

/** Last-resort art for any content route we can't classify. */
const SITE_DEFAULT: SketchKey = "ducksFlight";

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function byKeyword(path: string): SketchKey | null {
  let best: SketchKey | null = null;
  let bestLength = 0;
  for (const [keyword, key] of BY_KEYWORD) {
    if (keyword.length > bestLength && path.includes(keyword)) {
      best = key;
      bestLength = keyword.length;
    }
  }
  return best;
}

/**
 * Resolve the illustration for a route path.
 *
 * Resolution order: exact mapping → slug keywords → section prefix → site
 * default. Returns null only for the home page and opted-out routes, so any
 * new route ships with fitting art without touching this file.
 */
export function sketchForPath(pathname: string): SketchArt | null {
  const path = normalize(pathname).toLowerCase();

  if (path === "/" || path === "") return null;
  if (NO_ART_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return null;

  const exact = BY_PATH[path];
  if (exact) return SKETCH[exact];

  const keyword = byKeyword(path);
  if (keyword) return SKETCH[keyword];

  const prefix = BY_PREFIX.find(([p]) => path === p || path.startsWith(`${p}/`));
  if (prefix) return SKETCH[prefix[1]];

  return SKETCH[SITE_DEFAULT];
}

/** Companion art per section, used when a page needs more than one drawing. */
const SECTION_ROTATION: Array<[string, SketchKey[]]> = [
  ["/cook", ["duckBreastPan", "renderingFat", "slicedBreast", "sides"]],
  ["/learn", ["thermometer", "scoring", "carving", "ducksFlight"]],
  ["/buy", ["buyingDuck", "wildVsFarmed", "duckFat", "ducksFlight"]],
  ["/gear", ["gearFlatlay", "thermometer", "scoring", "toolsDesk"]],
  ["/ingredients", ["spices", "fruitPairings", "dryBrine", "sauce"]],
  ["/tools", ["toolsDesk", "thermometer", "ovenRoast", "ducksFlight"]],
  ["/recipes", ["slicedBreast", "sauce", "sides", "wholeRoastDuck"]],
  ["/guides", ["ducksFlight", "duckBreastPan", "thermometer", "sides"]],
];

const GENERIC_ROTATION: SketchKey[] = ["ducksFlight", "duckFat", "spices", "sides"];

/**
 * Ordered, de-duplicated art for a route: the route's own illustration first,
 * then fitting companions so a long page can carry several bands without
 * repeating the same drawing.
 */
export function sketchRotationForPath(pathname: string): SketchArt[] {
  const primary = sketchForPath(pathname);
  if (!primary) return [];

  const path = normalize(pathname).toLowerCase();
  const section = SECTION_ROTATION.find(([p]) => path === p || path.startsWith(`${p}/`));
  const keys = section ? section[1] : GENERIC_ROTATION;

  const out: SketchArt[] = [primary];
  for (const key of keys) {
    const art = SKETCH[key];
    if (!out.includes(art)) out.push(art);
  }
  return out;
}
