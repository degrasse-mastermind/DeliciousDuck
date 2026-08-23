import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HubOrientation } from "@/components/site/HubOrientation";
import { RecipeCard } from "@/components/site/RecipeCard";
import { GuideCluster } from "@/components/site/GuideGrid";
import { RECIPES } from "@/data/recipes";
import { guidesByPillar } from "@/data/guides";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const COOK_GUIDES = guidesByPillar("cook");

export const Route = createFileRoute("/cook/")({
  head: () => ({
    ...pageMeta({
      title: "Duck Recipes & Cooking Techniques | DeliciousDuck",
      description:
        "Duck technique guides and recipes: pan-seared breast, whole roast duck, leg confit, wild duck, sauces, sides, and fifteen uses for rendered duck fat.",
      path: "/cook",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Cook", item: "/cook" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck cooking guides",
          COOK_GUIDES.map((g) => ({ name: g.title, url: g.path })),
        ),
      ),
    ],
  }),
  component: CookPage,
});

function CookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cook"
        title="Duck Recipes and Techniques"
        intro="Every guide here is built around the one variable that decides whether duck is excellent or disappointing: how you manage fat and temperature. Start with a cut, or start with a technique."
        trail={[{ name: "Cook", to: "/cook" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <GuideCluster
          id="breast-cluster"
          mark="cook-breast"
          eyebrow="The cut"
          heading="Duck breast"
          intro="The fastest route to a very good duck dinner, and the cut with the least forgiveness. Start with the method, then choose a sauce and sides."
          guides={COOK_GUIDES.filter((g) => g.cluster === "breast")}
        />

        <GuideCluster
          id="whole-cluster"
          mark="cook-whole"
          eyebrow="The centrepiece"
          heading="Whole duck"
          intro="Centrepiece roasting: planning, fat management, and getting the legs done without ruining the breast."
          guides={COOK_GUIDES.filter((g) => g.cluster === "whole-duck")}
        />

        <GuideCluster
          id="fat-cluster"
          mark="cook-fat"
          eyebrow="Slow & make-ahead"
          heading="Legs, confit & duck fat"
          intro="The slow, forgiving, make-ahead side of duck cooking — and what to do with the fat it produces."
          guides={COOK_GUIDES.filter((g) => g.cluster === "duck-fat")}
        />

        <GuideCluster
          id="wild-cluster"
          mark="cook-wild"
          eyebrow="Game birds"
          heading="Wild duck"
          intro="Leaner, smaller, and far more variable than anything in a supermarket. Different bird, different method."
          guides={COOK_GUIDES.filter((g) => g.cluster === "wild-duck")}
        />

        <section aria-labelledby="all-recipes" className="mt-20">
          <h2 id="all-recipes" className="font-display text-3xl text-foreground">
            The starter four
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Full recipe pages with ingredients, step-by-step method, temperature targets, and
            Recipe structured data. Start here, then follow the technique guides above.
          </p>
          <p className="mt-3">
            <Link to="/recipes" className="text-primary underline underline-offset-4">
              Browse all duck recipes
            </Link>
          </p>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {RECIPES.slice(0, 4).map((recipe, index) => (
              <RecipeCard key={recipe.slug} recipe={recipe} priority={index < 2} />
            ))}
          </div>
        </section>

        <p className="mt-16 text-sm text-muted-foreground">
          Not sure how much to buy?{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            Use the whole-duck serving calculator
          </Link>{" "}
          , or let{" "}
          <Link to="/tools/what-should-i-cook" className="text-primary underline underline-offset-4">
            the method finder
          </Link>{" "}
          match a technique to the duck in front of you.
        </p>
        <HubOrientation
          heading={"How to use the Cook section"}
          paragraphs={[
            "Duck rewards one habit above all others: render the fat before you chase colour. Breast goes into a cold, dry pan skin-side down so the fat has time to melt out; a whole bird needs its fat drawn off during the roast so the skin can dry and crisp instead of poaching. Almost every duck problem traces back to skipping that.",
            "Start from whichever end you already know. If you have a cut in the fridge, use the cluster for that cut and follow the method through to sauce and sides. If you have a date and a guest count instead, start with the whole-duck planning guides, then come back for technique.",
            "Recipes and technique guides do different jobs here. The recipes give you quantities, timings, and temperature targets for one specific dish; the guides explain the variable behind them so you can adapt when your bird, pan, or oven is not the one we describe.",
          ]}
        />
      </section>
    </>
  );
}
