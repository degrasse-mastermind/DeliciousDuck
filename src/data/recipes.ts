import panSeared from "@/assets/recipe-pan-seared.jpg";
import confit from "@/assets/recipe-confit.jpg";
import wholeRoast from "@/assets/recipe-whole-roast.jpg";
import smokedPlum from "@/assets/recipe-smoked-plum.jpg";

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
    image: wholeRoast,
    imageAlt:
      "A whole roast duck with deeply browned, rendered skin \u2014 the base this recipe finishes with orange gastrique",
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
    image: wholeRoast,
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
