import { ToolAssumptions } from "@/components/tools/ToolAssumptions";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { RelatedGuides } from "@/components/site/RelatedGuides";
import { FaqList } from "@/components/site/ArticleShell";
import { FatSubstitutionCalculator } from "@/components/tools/FatSubstitutionCalculator";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/duck-fat-substitution-calculator")({
  head: () => ({
    ...pageMeta({
      title: "Duck Fat Substitution Calculator | DeliciousDuck",
      description:
        "Convert butter, oil, or lard into a duck-fat equivalent by weight, with notes on why the swap isn't a clean 1:1 by volume.",
      path: "/tools/duck-fat-substitution-calculator",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          {
            name: "Duck Fat Substitution Calculator",
            item: "/tools/duck-fat-substitution-calculator",
          },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: Page,
});

const FAQ = [
  {
    q: "Why isn't this a simple 1:1 swap for butter?",
    a: "Butter is roughly 80–82% fat, with the rest made up of water and milk solids. Duck fat is essentially all fat, so matching butter volume-for-volume would over-fat the recipe. This tool matches actual fat weight instead, then converts that back into a duck-fat volume.",
  },
  {
    q: "Do oil and lard convert the same way?",
    a: "Oils, lard, and shortening are already close to 100% fat by weight, so the swap is close to 1:1 — the calculator mainly accounts for the small density difference between them and duck fat.",
  },
  {
    q: "Does smoke point matter for this swap?",
    a: "It can. Duck fat's smoke point is generally cited in a similar range to many cooking oils, but published figures vary by source and refinement, so treat any specific number as approximate rather than a guarantee for your exact jar.",
  },
];

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Duck Fat Substitution Calculator"
        intro="Work out how much duck fat to use in place of butter, olive oil, neutral oil, or lard — matched by fat weight, not a rough volume swap."
        trail={[
          { name: "Tools", to: "/tools" },
          {
            name: "Duck Fat Substitution Calculator",
            to: "/tools/duck-fat-substitution-calculator",
          },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <FatSubstitutionCalculator />

        <div className="mt-12">
          <ToolAssumptions
            items={[
            { label: "Butter", value: "Treated as roughly 80% fat, 20% water and milk solids, so the swap matches actual fat weight rather than volume." },
            { label: "Oils, lard, shortening", value: "Treated as essentially 100% fat, so the conversion is close to 1:1 by weight with a small density adjustment." },
            { label: "Duck fat density", value: "A single typical value is used for volume conversions; rendered fat varies slightly with how it was rendered and how warm it is." },
            { label: "Not modelled", value: "Smoke point, flavour intensity, browning behaviour, dairy solids needed for a sauce or pastry, or baking chemistry that depends on solid fat at a given temperature." },
            ]}
            note="This converts quantities only. Substituting a fat changes flavour, smoke point, and texture — in laminated pastry or emulsified sauces the swap may not work at any ratio."
          />
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl text-foreground">Why the conversion isn't 1:1</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            A cup of butter isn't a cup of fat. Roughly 80–82% of butter's weight is fat, and the
            rest is water and milk solids that evaporate or brown separately during cooking. Duck
            fat, olive oil, neutral oils, lard, and shortening are all close to 100% fat by weight,
            so swapping any of them in for butter at the same volume quietly adds extra fat to the
            dish. This calculator sidesteps that by converting your original ingredient to a pure
            fat weight first, then reporting the equivalent amount of duck fat.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Flavour and smoke point are separate considerations from the math. Duck fat carries a
            distinct savoury note that plain oils and most shortenings don't, so a straight
            substitution changes the character of a dish even when the fat quantity is matched
            correctly. Published smoke-point figures for duck fat and other fats also vary by
            source and how heavily the fat was refined, so treat any specific temperature as
            approximate rather than a lab-tested constant for the jar in your kitchen.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Application matters too. In roasting — potatoes, root vegetables, a bird's cavity —
            duck fat's flavour is often the entire point, and small differences from butter won't
            throw off structure. In baking, butter's water content and milk solids do real
            structural and browning work that a straight fat swap can't fully replace, so duck fat
            is generally a better fit for savoury baking than for cakes or pastry that lean on
            butter's other properties. For delicate applications like emulsified sauces, start with
            a partial substitution and adjust to taste rather than swapping the whole amount at
            once.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            If your original recipe calls for salted butter, remember duck fat contributes no salt
            of its own — taste and season separately rather than assuming the swap carries seasoning
            over with it.
          </p>
        </div>

        <FaqList items={FAQ} />
        <RelatedGuides
          paths={[
            "/learn/how-to-render-duck-fat",
            "/cook/ways-to-use-duck-fat",
            "/buy/duck-fat-buying-guide",
            "/tools/recipe-scaler",
          ]}
        />
      </section>
    </>
  );
}
