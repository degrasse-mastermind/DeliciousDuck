import { ToolAssumptions } from "@/components/tools/ToolAssumptions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { WholeDuckServingCalculator } from "@/components/tools/WholeDuckServingCalculator";
import { breadcrumbSchema, faqSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/whole-duck-serving-calculator")({
  head: () => ({
    ...pageMeta({
      title: "Whole-Duck Serving Calculator: How Many Ducks? | DeliciousDuck",
      description:
        "Work out how many whole ducks to buy for your table. Enter guest count, appetite, and average bird weight to get raw shopping weight and cooked yield.",
      path: "/tools/whole-duck-serving-calculator",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          {
            name: "Whole-Duck Serving Calculator",
            item: "/tools/whole-duck-serving-calculator",
          },
        ]),
      ),
      ldScript(faqSchema(FAQ)),
    ],
  }),
  component: CalculatorPage,
});

const FAQ = [
  {
    q: "How many people does one whole duck serve?",
    a: "A 2.2 kg (about 4.9 lb) whole duck yields roughly 880 g of cooked meat, which serves four people generously as a main course, or six as part of a larger menu.",
  },
  {
    q: "Why is the yield only about 40%?",
    a: "Bone, rendered fat, and moisture loss account for most of the difference. Duck carries far more fat than chicken, and a good deal of it leaves the bird during cooking.",
  },
  {
    q: "Should I buy one large duck or two small ones?",
    a: "Two smaller birds cook faster and give more crisp skin per portion. One larger bird carves better as a centrepiece and leaves more carcass for stock.",
  },
];

function CalculatorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Whole-Duck Serving Calculator"
        intro="Turn a guest count into a shopping list. Adjust appetite and bird weight, and the calculator returns how many whole ducks to buy plus the cooked meat you can expect."
        trail={[
          { name: "Tools", to: "/tools" },
          {
            name: "Whole-Duck Serving Calculator",
            to: "/tools/whole-duck-serving-calculator",
          },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <WholeDuckServingCalculator />

        <div className="mt-12">
          <ToolAssumptions
            items={[
            { label: "Edible cooked yield", value: "40% of raw whole-bird weight, accounting for bone, rendered fat, and moisture loss. A very fatty or very lean bird can move this by several points." },
            { label: "Cooked meat per person", value: "Light 140 g, standard 180 g, hearty 240 g. These are appetite assumptions, not nutritional recommendations." },
            { label: "Bird weight", value: "Your entered raw, whole, oven-ready weight — before roasting and before any stuffing." },
            { label: "Not modelled", value: "Number of courses, side-dish volume, planned leftovers, or carving losses from an unfamiliar bird." },
            ]}
            note="These are portion-planning assumptions only, with no food-safety component. When in doubt, size up: cold roast duck is far better than a short plate."
          />
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-3xl text-foreground">How the numbers work</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The calculator starts from cooked meat per person, not raw weight, because raw weight
              is the number that misleads people. It then divides by the edible yield of a whole
              duck to get the number of birds, always rounding up — you cannot buy two thirds of a
              duck.
            </p>
            <dl className="mt-8 divide-y divide-border border-y border-border">
              {FAQ.map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="font-display text-lg text-foreground">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="rounded-sm bg-cream p-6 lg:p-8">
            <h2 className="font-display text-2xl text-foreground">Next steps</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link to="/cook" className="text-primary underline underline-offset-4">
                  Roasted whole duck recipe
                </Link>
                <span className="block text-muted-foreground">
                  Two-stage roasting for rendered fat and juicy breast.
                </span>
              </li>
              <li>
                <Link to="/buy" className="text-primary underline underline-offset-4">
                  Where to buy duck online
                </Link>
                <span className="block text-muted-foreground">
                  Sourcing routes and what to inspect first.
                </span>
              </li>
              <li>
                <Link to="/learn" className="text-primary underline underline-offset-4">
                  Carving a whole duck
                </Link>
                <span className="block text-muted-foreground">
                  Get clean portions from every bird you buy.
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
