import panSeared from "@/assets/recipe-pan-seared.jpg";
import pekingDuck from "@/assets/recipe-peking-duck.jpg";
import ovenBreast from "@/assets/recipe-oven-roasted-duck-breast.jpg";
import airFryerHero from "@/assets/recipe-air-fryer-duck-breast.jpg";
import airFryerCard from "@/assets/recipe-air-fryer-duck-breast-card.jpg";
import confit from "@/assets/recipe-confit.jpg";
import smokedPlum from "@/assets/recipe-smoked-plum.jpg";
import orangeCard from "@/assets/duck-a-lorange-card.jpg";
import wholeRoastCard from "@/assets/roasted-whole-duck-card.jpg";
import potatoesCard from "@/assets/duck-fat-roasted-potatoes-card.jpg";

/**
 * Recipe data shape is Recipe schema-ready: fields map 1:1 onto
 * schema.org/Recipe (name, description, image, recipeCategory,
 * recipeCuisine, prepTime, cookTime, totalTime, recipeYield).
 */
export interface Recipe {
  slug: string;
  name: string;
  description: string;
  image: string;
  /**
   * Honest alt text for the recipe photograph. Set it whenever the image is a
   * related dish rather than a photograph of this exact finished plate, so the
   * caption never implies a picture we do not have.
   */
  imageAlt?: string;
  /**
   * Optional smaller crop of the SAME photograph, used only by cards and
   * listings. `image` stays the wide original, so Recipe JSON-LD and social
   * previews always reference the durable full-size asset.
   */
  cardImage?: string;
  /**
   * Recipes are photography-led site-wide, so there is no illustration field:
   * every recipe surface (card, detail hero, JSON-LD, social) reads `image`.
   * Drawings belong to commercial and learn templates.
   */
  category: string;
  cuisine?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  recipeYield: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  keyTechnique: string;
  /**
   * Trust gate. "editorialDraft" = structured launch content following
   * established technique and published safety guidance, not yet cooked and
   * checked in our own kitchen. "kitchenVerified" may only be set once that
   * hands-on validation is complete.
   */
  verification: "editorialDraft" | "kitchenVerified";
  /** Internal validation record. Never rendered as a testing claim. */
  validation: RecipeValidation;
}

/**
 * Internal kitchen-validation record for a recipe.
 *
 * Filled in from a completed Kitchen Test Sheet (/internal/kitchen-test-sheet).
 * `verification` may only be flipped to "kitchenVerified" when
 * `lastKitchenTest` is a real date, `outcome` is "pass", and a photo exists.
 * Nothing in here is used to emit review, rating, or testing schema.
 */
export interface RecipeValidation {
  /** ISO date of the most recent hands-on test, or null if never cooked by us. */
  lastKitchenTest: string | null;
  /** Who cooked it. Null while untested. */
  testedBy: string | null;
  /** Content revision. Bump on any method/temperature change. */
  revision: string;
  /** Own-kitchen photography state. Launch images are illustrative. */
  photoStatus: "none" | "stock-illustrative" | "own-kitchen";
  outcome: "untested" | "pass" | "pass-with-revisions" | "fail";
  /** Measured results from the test sheet, e.g. actual cook time, probe reads. */
  measuredNotes: string[];
  /** What the tester changed or wants changed next time. */
  testerNotes: string[];
}

const UNTESTED = (revision: string): RecipeValidation => ({
  lastKitchenTest: null,
  testedBy: null,
  revision,
  photoStatus: "stock-illustrative",
  outcome: "untested",
  measuredNotes: [],
  testerNotes: [],
});

export const RECIPES: Recipe[] = [
  {
    slug: "pan-seared-duck-breast",
    name: "Pan-Seared Duck Breast",
    description:
      "Score, render cold, and finish hot for shatteringly crisp skin over a rosy, evenly cooked centre.",
    image: panSeared,
    category: "Duck breast",
    cuisine: "French",
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    recipeYield: "2 servings",
    difficulty: "Easy",
    keyTechnique: "Cold-pan rendering",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "duck-a-lorange",
    name: "Duck \u00e0 l\u2019Orange",
    description:
      "A whole duck roasted in two stages, served with a bitter-orange gastrique built from the pan drippings \u2014 sharp and glossy rather than sweet.",
    image: orangeCard,
    imageAlt: "Whole roast Duck \u00e0 l\u2019Orange with crisp mahogany skin and orange gastrique",
    category: "Whole duck",
    cuisine: "French",
    prepTimeMinutes: 30,
    cookTimeMinutes: 150,
    recipeYield: "4 servings",
    difficulty: "Intermediate",
    keyTechnique: "Two-stage roasting with a caramel gastrique",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "duck-leg-confit",
    name: "Duck Leg Confit",
    description:
      "Salt-cured legs poached slowly in their own fat, then crisped to order — the most forgiving duck there is.",
    image: confit,
    category: "Duck legs",
    cuisine: "French",
    prepTimeMinutes: 25,
    cookTimeMinutes: 180,
    recipeYield: "4 servings",
    difficulty: "Intermediate",
    keyTechnique: "Low-temperature fat poaching",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "roasted-whole-duck",
    name: "Roasted Whole Duck",
    description:
      "A two-stage roast that renders the fat cap, keeps the breast juicy, and gets the legs fully tender.",
    image: wholeRoastCard,
    imageAlt: "Whole roasted duck with crisp mahogany skin, roast potatoes and thyme",
    category: "Whole duck",
    prepTimeMinutes: 20,
    cookTimeMinutes: 135,
    recipeYield: "4 servings",
    difficulty: "Intermediate",
    keyTechnique: "Two-stage roasting",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "smoked-duck-with-plum-sauce",
    name: "Smoked Duck with Plum Sauce",
    description:
      "Gentle smoke, careful temperature control, and a sharp-sweet plum reduction to cut the richness.",
    image: smokedPlum,
    category: "Smoked duck",
    prepTimeMinutes: 30,
    cookTimeMinutes: 90,
    recipeYield: "4 servings",
    difficulty: "Advanced",
    keyTechnique: "Low-and-slow smoking",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "duck-fat-roasted-potatoes",
    name: "Duck Fat Roasted Potatoes",
    description:
      "Parboiled, roughed up, and roasted in preheated duck fat until the outsides shatter and the insides stay fluffy.",
    image: potatoesCard,
    imageAlt:
      "Deeply golden duck fat roasted potatoes with craggy edges on a dark metal roasting tray",
    category: "Sides",
    prepTimeMinutes: 15,
    cookTimeMinutes: 55,
    recipeYield: "Serves 4 as a side",
    difficulty: "Easy",
    keyTechnique: "Parboil, rough up, roast in preheated fat",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "air-fryer-duck-breast",
    name: "Air Fryer Duck Breast",
    description:
      "Air fryer duck breast with crisp skin: render the fat gently, finish at high heat, and use a thermometer while managing smoke and hot rendered fat.",
    image: airFryerHero,
    cardImage: airFryerCard,
    imageAlt:
      "Sliced air fryer duck breast with crisp golden-brown skin and a rosy centre, served with an optional dark cherry sauce that is not part of the recipe below",
    category: "Duck breast",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    recipeYield: "2 servings",
    difficulty: "Easy",
    keyTechnique: "Two-stage air frying, skin-side up",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "peking-duck-at-home",
    name: "Peking Duck at Home",
    description:
      "A home cook's route to lacquered, shatter-crisp Peking-style duck: air-dry, scald, glaze, and roast, served with pancakes, scallion and hoisin.",
    image: pekingDuck,
    imageAlt:
      "Whole Peking-style duck with lacquered mahogany skin beside sliced skin, thin pancakes, scallion, cucumber and hoisin",
    category: "Whole duck",
    cuisine: "Chinese",
    prepTimeMinutes: 45,
    cookTimeMinutes: 105,
    recipeYield: "4 servings",
    difficulty: "Advanced",
    keyTechnique: "Scalding and air-drying the skin, then a two-temperature roast",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
  {
    slug: "oven-roasted-duck-breast",
    name: "Oven-Roasted Duck Breast",
    description:
      "Duck breast rendered in a skillet and finished in the oven — the steadier route to crisp skin and an even rosy centre when you are cooking four or more.",
    image: ovenBreast,
    imageAlt:
      "Sliced oven-roasted duck breast with golden crisp skin and a rosy centre, with a spoon of pan jus",
    category: "Duck breast",
    cuisine: "French",
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    recipeYield: "4 servings",
    difficulty: "Easy",
    keyTechnique: "Skillet render, oven finish, thermometer pull",
    verification: "editorialDraft",
    validation: UNTESTED("1.0"),
  },
];

export const totalTimeMinutes = (r: Recipe) => r.prepTimeMinutes + r.cookTimeMinutes;

export const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
};

export const isoDuration = (minutes: number) =>
  `PT${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}H` : ""}${minutes % 60 ? `${minutes % 60}M` : ""}`;
