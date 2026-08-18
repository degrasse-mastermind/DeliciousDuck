import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { guideByPath } from "@/data/guides";
import { ingredientByPath } from "@/data/ingredients";

/**
 * Related Guides — driven by the structured `related` field in the guide
 * registry, never by random recirculation.
 */
export function RelatedGuides({
  paths,
  title = "Related guides",
  intro,
}: {
  paths: string[];
  title?: string;
  intro?: string;
}) {
  const items = paths
    .map((path) => guideByPath(path) ?? ingredientByPath(path) ?? TOOL_FALLBACKS[path])
    .filter(Boolean) as { path: string; title: string; teaser: string }[];

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-guides" className="mt-16 border-t border-border pt-10">
      <h2 id="related-guides" className="font-display text-2xl text-foreground lg:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-2 text-sm text-muted-foreground">{intro}</p>}
      <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="group flex items-start justify-between gap-4 border-t border-border py-4 transition-colors hover:text-primary"
            >
              <span>
                <span className="block font-display text-lg leading-snug text-foreground group-hover:text-primary">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {item.teaser}
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="mt-1.5 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Tool pages are not guides, but they belong in related modules. */
const TOOL_FALLBACKS: Record<string, { path: string; title: string; teaser: string }> = {
  "/tools/duck-pairing-finder": {
    path: "/tools/duck-pairing-finder",
    title: "Duck Pairing Finder",
    teaser: "Cut, flavour direction and occasion in — sauce, acid, starch and greens out.",
  },
  "/recipes/smoked-duck-with-plum-sauce": {
    path: "/recipes/smoked-duck-with-plum-sauce",
    title: "Smoked Duck with Plum Sauce",
    teaser: "Smoke, dark fruit and vinegar, balanced for rich duck.",
  },
  "/tools/whole-duck-serving-calculator": {
    path: "/tools/whole-duck-serving-calculator",
    title: "Whole-Duck Serving Calculator",
    teaser: "Turn a guest count into how many birds to buy.",
  },
  "/tools/duck-cooking-time-planner": {
    path: "/tools/duck-cooking-time-planner",
    title: "Duck Cooking-Time Planner",
    teaser: "A planning range for a whole duck by weight and oven temperature.",
  },
  "/tools/duck-doneness-guide": {
    path: "/tools/duck-doneness-guide",
    title: "Interactive Duck Doneness Guide",
    teaser: "Targets, probe placement and carryover by cut and method.",
  },
  "/tools/duck-fat-substitution-calculator": {
    path: "/tools/duck-fat-substitution-calculator",
    title: "Duck-Fat Substitution Calculator",
    teaser: "Swap butter or oil for duck fat across tbsp, cups and grams.",
  },
  "/tools/recipe-scaler": {
    path: "/tools/recipe-scaler",
    title: "Recipe Scaler",
    teaser: "Scale any ingredient list from its original servings to yours.",
  },
  "/tools/what-should-i-cook": {
    path: "/tools/what-should-i-cook",
    title: "What Should I Do With This Duck?",
    teaser: "Answer five questions, get a method that suits what you have.",
  },
};
