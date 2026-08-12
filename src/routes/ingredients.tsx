import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const INGREDIENTS = [
  {
    title: "Rendered duck fat",
    blurb: "How to strain and store it, how long it keeps, and the potatoes it was made for.",
  },
  {
    title: "Stone fruit and cherries",
    blurb: "Plum, cherry, and apricot reductions: acid and sugar balanced against rich meat.",
  },
  {
    title: "Citrus and orange",
    blurb: "Beyond à l'orange — how to use zest, juice, and bitterness without cloying sauce.",
  },
  {
    title: "Warm spices",
    blurb: "Star anise, five-spice, juniper, and black pepper in cures, rubs, and braises.",
  },
  {
    title: "Aromatics for confit",
    blurb: "Garlic, thyme, bay, and the salt-cure ratio that seasons without over-salting.",
  },
  {
    title: "Sides that work",
    blurb: "Bitter greens, lentils, root vegetables, and pickles that cut through duck fat.",
  },
];

export const Route = createFileRoute("/ingredients")({
  head: () => ({
    ...pageMeta({
      title: "Duck Ingredients: Fat, Pairings, Spices & Sauces | DeliciousDuck",
      description:
        "The pantry side of duck cooking: rendered duck fat, stone-fruit sauces, citrus, warm spices, confit aromatics, and sides that balance richness.",
      path: "/ingredients",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Ingredients", item: "/ingredients" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck ingredients and pairings",
          INGREDIENTS.map((i) => ({ name: i.title, url: "/ingredients" })),
        ),
      ),
    ],
  }),
  component: IngredientsPage,
});

function IngredientsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ingredients"
        title="What Goes With Duck"
        intro="Duck is rich, savoury, and slightly gamey. Almost everything that makes a duck dinner taste finished is doing one of two jobs: adding acid, or using the fat well."
        trail={[{ name: "Ingredients", to: "/ingredients" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl text-foreground">Pantry and pairings</h2>
        <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {INGREDIENTS.map((item) => (
            <li key={item.title} className="border-t border-border pt-5">
              <h3 className="font-display text-xl text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.blurb}</p>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-sm text-muted-foreground">
          Substituting duck fat for butter or oil? The{" "}
          <Link to="/tools" className="text-primary underline underline-offset-4">
            duck-fat substitution calculator
          </Link>{" "}
          is in development. Meanwhile, the{" "}
          <Link to="/cook" className="text-primary underline underline-offset-4">
            recipes
          </Link>{" "}
          list quantities by weight.
        </p>
      </section>
    </>
  );
}
