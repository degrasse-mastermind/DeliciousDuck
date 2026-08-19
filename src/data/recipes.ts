import panSeared from "@/assets/recipe-pan-seared.jpg";
import airFryerHero from "@/assets/recipe-air-fryer-duck-breast.jpg";
import airFryerCard from "@/assets/recipe-air-fryer-duck-breast-card.jpg";
import airFryerHero from "@/assets/recipe-air-fryer-duck-breast.jpg";
import airFryerCard from "@/assets/recipe-air-fryer-duck-breast-card.jpg";
import confit from "@/assets/recipe-confit.jpg";
import wholeRoast from "@/assets/recipe-whole-roast.jpg";
import smokedPlum from "@/assets/recipe-smoked-plum.jpg";
import orangeCard from "@/assets/duck-a-lorange-card.jpg";
import orangeIllustration from "@/assets/duck-a-lorange-illustration.jpg";
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
   * Optional editorial illustration for the recipe detail page. Cards,
   * listings, Recipe JSON-LD and social previews always use `image` (the
   * photograph); only the detail page's prominent visual uses this.
   */
  illustration?: string;
  illustrationAlt?: string;
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
    slug: "air-fryer-duck-breast",
    name: "Air Fryer Duck Breast",
    description:
      "Render the fat cap at a low setting, crisp it at a high one, and pull by thermometer — the air fryer route to crisp skin without a smoking kitchen.",
    image: airFryerHero,
    cardImage: airFryerCard,
    imageAlt:
      "Sliced air fryer duck breast with crisp golden-brown skin and a rosy centre, with a dark cherry glaze",
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
    slug: "duck-a-lorange",
    name: "Duck \u00e0 l\u2019Orange",
    description:
      "A whole duck roasted in two stages, served with a bitter-orange gastrique built from the pan drippings \u2014 sharp and glossy rather than sweet.",
    image: orangeCard,
    imageAlt:
      "Whole roast Duck \u00e0 l\u2019Orange with crisp mahogany skin and orange gastrique",
    illustration: orangeIllustration,
    illustrationAlt:
      "Colored-pencil illustration of a whole roast Duck \u00e0 l\u2019Orange on a platter with oranges",
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
    imageAlt:
      "Whole roasted duck with crisp mahogany skin, roast potatoes and thyme",
    illustration: wholeRoast,
    illustrationAlt:
      "Whole roasted duck resting on a platter with roast potatoes, thyme and a charred shallot",
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
