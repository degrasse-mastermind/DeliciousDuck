import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { GuideGrid } from "@/components/site/GuideGrid";
import { DisclosureBanner } from "@/components/site/Commerce";
import { guidesByPillar } from "@/data/guides";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const BUY_GUIDES = guidesByPillar("buy");

const CHECKS = [
  {
    title: "Breed and size",
    body: "Pekin is the common supermarket duck: milder, fattier, forgiving. Muscovy and Moulard breasts are larger and leaner, and cook closer to steak.",
  },
  {
    title: "Fresh or frozen",
    body: "Frozen is often the better buy for mail-order, because it travels without a cold-chain gamble. Thaw fully in the fridge before cooking.",
  },
  {
    title: "Skin and fat cap",
    body: "Look for an intact, dry, evenly thick fat cap. Torn skin renders unevenly and never crisps the same way.",
  },
  {
    title: "Labels worth reading",
    body: "Air-chilled, free-range, and processing date tell you more about eating quality than front-of-pack marketing language.",
  },
];

export const Route = createFileRoute("/buy/")({
  head: () => ({
    ...pageMeta({
      title: "Buy Duck: Sourcing Guides & Quality Checks | DeliciousDuck",
      description:
        "How to source duck well: comparing online sellers, judging quality on arrival, understanding breed and label terms, and buying duck fat sensibly.",
      path: "/buy",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Buy", item: "/buy" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck buying guides",
          BUY_GUIDES.map((g) => ({ name: g.title, url: g.path })),
        ),
      ),
    ],
  }),
  component: BuyPage,
});

function BuyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Buy"
        title="Buying Duck Well"
        intro="Duck is a special-order bird in most places. This section covers the routes to buying it, what the labels mean, and how to check quality before you commit."
        trail={[{ name: "Buy", to: "/buy" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <DisclosureBanner />
        </div>

        <h2 className="mt-14 font-display text-3xl text-foreground">Sourcing guides</h2>
        <GuideGrid guides={BUY_GUIDES} />

        <h2 className="mt-20 font-display text-3xl text-foreground">
          Four things to check before you buy
        </h2>
        <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {CHECKS.map((check) => (
            <div key={check.title} className="border-t border-border pt-5">
              <dt className="font-display text-xl text-foreground">{check.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{check.body}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-16 text-sm text-muted-foreground">
          Working out quantities?{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            The whole-duck serving calculator
          </Link>{" "}
          turns a guest count into a shopping weight. Ordering frozen?{" "}
          <Link to="/learn/how-to-thaw-duck" className="text-primary underline underline-offset-4">
            Plan the thaw first
          </Link>
          . For equipment, see{" "}
          <Link to="/gear" className="text-primary underline underline-offset-4">
            the duck kitchen
          </Link>
          .
        </p>
      </section>
    </>
  );
}
