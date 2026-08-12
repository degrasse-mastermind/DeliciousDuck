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
}

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
