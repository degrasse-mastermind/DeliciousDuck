import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { RecipeCard } from "@/components/site/RecipeCard";
import { RECIPES } from "@/data/recipes";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/cook/")({
  head: () => ({
    ...pageMeta({
      title: "Duck Recipes: Breast, Legs, Whole Duck & Smoked | DeliciousDuck",
      description:
        "Tested duck recipes and technique walkthroughs for duck breast, confit legs, whole roast duck, and smoked duck, with times, yields, and difficulty.",
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
          "Popular duck recipes",
          RECIPES.map((r) => ({ name: r.name, url: `/cook/${r.slug}` })),
        ),
      ),
    ],
  }),
  component: CookPage,
});

const COLLECTIONS = [
  { title: "Duck breast", note: "Fast, weeknight-friendly, thermometer-led." },
  { title: "Duck legs & confit", note: "Slow, forgiving, make-ahead." },
  { title: "Whole duck", note: "Centrepiece roasting and carving." },
  { title: "Smoked & grilled", note: "Outdoor cooking and cure basics." },
];

function CookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cook"
        title="Duck Recipes and Techniques"
        intro="Every recipe here is built around the one variable that decides whether duck is excellent or disappointing: how you manage fat and temperature. Start with a cut, or start with a technique."
        trail={[{ name: "Cook", to: "/cook" }]}
      />

      <section aria-labelledby="collections" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 id="collections" className="eyebrow text-primary">
          Browse by cut
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <li
              key={c.title}
              className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <h3 className="font-display text-xl text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="all-recipes" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <h2 id="all-recipes" className="font-display text-3xl text-foreground">
          The starter four
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Full recipe pages with ingredients, method, and Recipe structured data are being
          published cut by cut. These four come first.
        </p>
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {RECIPES.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Not sure how much to buy?{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            Use the whole-duck serving calculator
          </Link>{" "}
          or read{" "}
          <Link to="/learn" className="text-primary underline underline-offset-4">
            the duck fundamentals guides
          </Link>
          .
        </p>
      </section>
    </>
  );
}
