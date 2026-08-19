import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { RecipeCard } from "@/components/site/RecipeCard";
import { RECIPES } from "@/data/recipes";
import { recipePath } from "@/data/recipe-content";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/recipes/")({
  head: () => ({
    ...pageMeta({
      title: "Duck Recipes: Step-by-Step, Thermometer-Led | DeliciousDuck",
      description:
        "Full duck recipes with ingredients, step-by-step method, target temperatures, troubleshooting, and what to do with the fat: duck à l’orange, pan-seared breast, confit, whole roast, and smoked duck.",
      path: "/recipes",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Recipes", item: "/recipes" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck recipes",
          RECIPES.map((r) => ({ name: r.name, url: recipePath(r.slug) })),
        ),
      ),
    ],
  }),
  component: RecipesIndex,
});

function RecipesIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Recipes"
        title="Duck Recipes"
        intro="Complete recipes, each written around the variable that actually decides the outcome: how the fat renders and where you pull the meat. Ingredients, method, temperatures, and the fixes for when it goes sideways."
        trail={[{ name: "Recipes", to: "/recipes" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {RECIPES.map((recipe, index) => (
            <RecipeCard key={recipe.slug} recipe={recipe} priority={index < 2} />
          ))}
        </div>

        <p className="mt-16 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Want the technique behind the recipe? The{" "}
          <Link to="/cook" className="text-primary underline underline-offset-4">
            Cook guides
          </Link>{" "}
          go deeper on method, and the{" "}
          <Link to="/tools" className="text-primary underline underline-offset-4">
            calculators
          </Link>{" "}
          handle timing, scaling, and doneness.
        </p>
      </section>
    </>
  );
}
