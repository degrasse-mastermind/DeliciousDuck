import { ToolAssumptions } from "@/components/tools/ToolAssumptions";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { FaqList } from "@/components/site/ArticleShell";
import { Callout } from "@/components/site/ArticleShell";
import { RecipeScaler } from "@/components/tools/RecipeScaler";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/recipe-scaler")({
  head: () => ({
    ...pageMeta({
      title: "Recipe Scaler | DeliciousDuck",
      description:
        "Scale an ingredient list up or down by servings, with guidance on what doesn't scale linearly — salt, pan size, and cook time.",
      path: "/tools/recipe-scaler",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          { name: "Recipe Scaler", item: "/tools/recipe-scaler" },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Will this scale my cooking time?",
    a: "No, and it deliberately doesn't try to. Cook time depends on thickness, pan size, and heat, not just quantity — doubling a recipe rarely doubles the time it takes to cook.",
  },
  {
    q: "Should I scale the salt exactly?",
    a: "Scale it as a starting point, then taste. Salt and other strong seasonings don't always feel right at the exact linear multiple, especially at the extremes of scaling far up or down.",
  },
  {
    q: "Can I scale a whole roast duck this way?",
    a: "Not directly. A whole duck is one bird, not a divisible ingredient — for group sizes, use a serving calculator built around whole birds rather than scaling a single-duck recipe's ingredient list.",
  },
];

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Recipe Scaler"
        intro="Adjust an ingredient list up or down by servings. Edit the example rows or replace them with your own, then see what changes — and what shouldn't."
        trail={[
          { name: "Tools", to: "/tools" },
          { name: "Recipe Scaler", to: "/tools/recipe-scaler" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <RecipeScaler />

        <div className="mt-12">
          <ToolAssumptions
            items={[
            { label: "Starting list", value: "A generic pan-seared duck breast with cherry pan sauce, provided as an editable example — not a tested DeliciousDuck recipe." },
            { label: "Rounding", value: "Volumes round to the nearest useful eighth of a unit; weights round to whole grams." },
            { label: "Scaling model", value: "Strictly linear on quantity: every ingredient is multiplied by the same factor." },
            { label: "Not modelled", value: "Cooking time, pan and oven capacity, salt and acid perception, reduction rates, or leavening — none of these scale linearly." },
            ]}
            note="Above roughly 2–3x the original batch, taste and adjust as you go, and cook in batches rather than crowding a pan."
          />
        </div>

        <div className="mt-16">
          <Callout label="Illustrative example">
            The pan-seared duck breast with cherry sauce loaded into the tool above is an
            illustrative example to demonstrate scaling. Replace the rows with ingredients from an
            actual recipe before relying on the result.
          </Callout>
        </div>

        <div className="mt-10 max-w-3xl">
          <h2 className="font-display text-3xl text-foreground">What scales cleanly, and what doesn't</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Most ingredients — meat, vegetables, liquids used as a main component — scale in
            direct proportion to servings, and that's what this tool calculates. A handful of
            things don't behave the same way. Salt and other strong seasonings often taste
            slightly off at the exact linear multiple, particularly when scaling by more than
            two or three times in either direction; taste and adjust rather than trusting the
            number blindly. Leavening in baked goods, and braising liquid in slow-cooked dishes,
            also tend to need proportionally less as batch size grows.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Pan size and crowding are the biggest practical limits. Doubling a pan-seared duck
            breast recipe doesn't mean doubling what fits comfortably in one skillet — crowd the
            pan and the skin steams instead of rendering. Cook time follows the same logic: it's
            driven by thickness and heat transfer, not quantity, so a doubled batch in a bigger pan
            or a second batch in sequence rarely takes twice as long. Resting time for cooked meat
            doesn't scale with quantity either — a rested duck breast rests the same whether it's
            one or four.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Duck specifically has a few scaling quirks worth planning around. Count on roughly one
            breast per person as a starting point for portioning. Because pan diameter limits how
            many breasts render well at once, scaling servings upward often means cooking in
            batches rather than one larger pan. And rendering time for the fat under the skin is
            set by thickness and heat, not by how many breasts are in the pan, so it won't double
            just because the batch did.
          </p>
        </div>

        <FaqList items={FAQ} />
        <RelatedGuides
          paths={[
            "/cook/how-to-cook-duck-breast",
            "/tools/whole-duck-serving-calculator",
            "/cook/best-sauces-for-duck-breast",
          ]}
        />
      </section>
    </>
  );
}
