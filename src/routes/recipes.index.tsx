import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HubOrientation } from "@/components/site/HubOrientation";
import { RecipeCard } from "@/components/site/RecipeCard";
import { SourceNotes } from "@/components/site/SourceNotes";

import { RECIPES } from "@/data/recipes";
import { recipePath } from "@/data/recipe-content";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/recipes/")({
  head: () => ({
    ...pageMeta({
      title: "Duck Recipes: Step-by-Step, Thermometer-Led | DeliciousDuck",
      description:
        "Full duck recipes with method, target temperatures and troubleshooting: duck à l’orange, pan-seared breast, confit, whole roast duck and smoked duck.",
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
        <HubOrientation
          heading={"How these recipes are built"}
          paragraphs={[
            "Every recipe here gives you a target internal temperature alongside the timings, because duck varies more than its cooking times suggest. Bird weight, starting fridge temperature, pan material, and how much fat you pour off all move the clock. The thermometer is what makes the recipe repeatable.",
            "Rich duck also needs a plate built around it. Acidity, tart fruit, bitter greens, and briny or savoury accents cut through the fat far better than extra sweetness, and the rendered fat you collect belongs on the potatoes rather than in the bin.",
            "Pick by cut if you already have the duck, or by occasion if you are planning ahead. Confit and smoked duck are make-ahead dishes that suit a busy day; breast is a twenty-minute dinner that wants your full attention for the first ten.",
          ]}
          sections={[
            {
              heading: "Easy duck recipes to start with",
              paragraphs: [
                "If you have never cooked duck, start with a pan-seared duck breast and a pan sauce. It is a twenty-minute dinner, it needs one pan and a thermometer, and it teaches the single skill everything else depends on: rendering the fat out of the skin slowly in a cold pan before the heat comes up. Once that clicks, duck à l'orange, cherry sauce, and a five-spice glaze are variations rather than new techniques.",
                "The next step up is a whole roast duck — the Sunday-lunch or holiday centrepiece. It is more forgiving than a turkey because the bird bastes itself, but it needs the fat poured off during the roast and a thigh reading of 175–180°F (79–82°C) before you carve. USDA's safe minimum internal temperature for duck is 165°F (74°C); where a recipe here offers a pink breast range instead, it says so and explains that the choice departs from that guidance. Duck confit is the most impressive dish here and, oddly, one of the least stressful: the legs cook low and slow, then wait in their own fat until the day you want them.",
              ],
              links: [
                { label: "How to cook duck breast", to: "/cook/how-to-cook-duck-breast" },
                { label: "Whole roast duck", to: "/cook/whole-roast-duck" },
                { label: "Doneness guide", to: "/tools/duck-doneness-guide" },
              ],
            },
            {
              heading: "Sauces, sides, and what to serve with duck",
              paragraphs: [
                "Duck wants a counterweight. Tart fruit is the classic answer — sour cherry, orange, plum, blackcurrant, rhubarb — and it works because acid cuts fat, not because it adds sweetness. Keep sugar restrained; a glaze that caramelises too far reads as dessert and buries the meat. Red-wine and port reductions, verjus, sherry vinegar, and pomegranate do the same job with less sugar.",
                "For sides, think bitter and starchy. Frisée, radicchio, chicory, braised red cabbage, and mustardy greens all hold their own. Potatoes roasted in the fat you just poured off are non-negotiable, and duck-fat parsnips, celeriac, or white beans absorb it just as well. Something briny — olives, capers, cornichons, preserved lemon — sharpens a rich plate at the end.",
              ],
              links: [
                { label: "Best sauces for duck breast", to: "/cook/best-sauces-for-duck-breast" },
                { label: "What to serve with duck", to: "/cook/what-to-serve-with-duck-breast" },
                { label: "Pairing finder", to: "/tools/duck-pairing-finder" },
              ],
            },
            {
              heading: "Scaling, prepping ahead, and leftovers",
              paragraphs: [
                "Our baseline is one whole five- to six-pound duck for three to four people, or one breast per person; a large Moulard magret serves two when sliced. Treat that as a starting point rather than a rule — yield moves with bird size, how hungry the table is, and how substantial the sides are. For a bigger table, roast two birds rather than one large one: the timing barely changes and the skin crisps better with air around each bird.",
                "Confit, rillettes, smoked breast, and duck ragù are all better made a day ahead, which makes them the right choice for a holiday menu where the oven is contested. Leftover roast duck shreds into ramen, tacos, hash, or a salad with citrus and bitter leaves, and the carcass makes a stock with more body than chicken. Refrigerate cooked duck within two hours, use it within three to four days, and reheat it to 165°F (74°C).",
                "Which duck you buy shapes the recipe too. Pekin is the mild, fatty, widely available bird behind most roast-duck and Peking-style recipes. Moulard gives you the large lean magret that suits searing and slicing, and its legs are the standard choice for confit. Muscovy is leaner with a deeper flavour. Wild duck needs its own fast treatment because it carries almost no fat — and being poultry, it is covered by the same 165°F guidance, so serving it pink is a culinary choice made against that recommendation. If a recipe specifies a breed, that is why.",
              ],
              links: [
                { label: "How much duck per person", to: "/buy/how-much-duck-per-person" },
                { label: "Serving calculator", to: "/tools/whole-duck-serving-calculator" },
                { label: "Recipe scaler", to: "/tools/recipe-scaler" },
                { label: "Wild vs. farmed duck", to: "/learn/wild-duck-vs-farmed-duck" },
              ],
            },
          ]}
        />

        <SourceNotes ids={["usdaPoultryTemp", "usdaPoultryPrep", "usdaLeftovers"]} />


      </section>
    </>
  );
}
