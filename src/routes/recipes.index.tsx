import { useState } from "react";
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

const ALL = "All recipes";

function RecipesIndex() {
  const categories = [ALL, ...Array.from(new Set(RECIPES.map((r) => r.category)))];
  const [active, setActive] = useState(ALL);
  const shown = active === ALL ? RECIPES : RECIPES.filter((r) => r.category === active);

  return (
    <>
      <PageHeader
        eyebrow="Recipes"
        title="Duck Recipes"
        intro="Complete recipes, each written around the variable that actually decides the outcome: how the fat renders and where you pull the meat. Ingredients, method, temperatures, and the fixes for when it goes sideways."
        trail={[{ name: "Recipes", to: "/recipes" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div
          role="group"
          aria-label="Filter recipes by cut"
          className="mb-10 flex flex-wrap gap-2"
        >
          {categories.map((category) => {
            const selected = category === active;
            const count =
              category === ALL
                ? RECIPES.length
                : RECIPES.filter((r) => r.category === category).length;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(category)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {category}
                <span className={selected ? "opacity-70" : "opacity-60"}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((recipe, index) => (
            <RecipeCard key={recipe.slug} recipe={recipe} priority={index < 2} />
          ))}

          <Link
            to="/cook"
            className="group flex flex-col justify-between rounded-sm border border-accent/40 bg-cream/60 p-6 transition-colors hover:border-accent"
          >
            <div>
              <span className="eyebrow text-primary">Browse by cut</span>
              <h3 className="mt-2 font-display text-2xl leading-snug text-foreground transition-colors group-hover:text-primary">
                Technique guides by cut
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Breast, whole bird, legs, and the fat — the method behind every recipe here, cut by
                cut.
              </p>
            </div>
            <span className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Open the Cook guides
            </span>
          </Link>
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
