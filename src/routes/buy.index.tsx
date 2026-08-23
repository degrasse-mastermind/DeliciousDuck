import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HubOrientation } from "@/components/site/HubOrientation";
import { HUB_SECTION_DIVIDER } from "@/components/site/HubDivider";
import { HubSectionMark } from "@/components/site/HubSectionMark";
import { GuideGrid } from "@/components/site/GuideGrid";
import { guidesByPillar } from "@/data/guides";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

const CHECKS = [
  {
    title: "Kind and size",
    body: "Read the USDA age class — duckling for dry heat, mature duck for slower moist cooking. Size mainly sets your serving count and roasting time. Breed names on a label are description, not a defined claim.",
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
        "How to source duck well: comparing online sellers, judging quality on arrival, reading the label terms that are actually defined, and buying duck fat sensibly.",
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
          guidesByPillar("buy").map((g) => ({ name: g.title, url: g.path })),
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
        <HubSectionMark mark="buy-guides" />
        <h2 className="font-display text-3xl text-foreground">Sourcing guides</h2>
        <GuideGrid guides={guidesByPillar("buy")} />

        <div className={HUB_SECTION_DIVIDER}>
          <HubSectionMark mark="buy-checks" />
          <h2 className="font-display text-3xl text-foreground">
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
        </div>

        <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
          Each of those checks has a page of its own:{" "}
          <Link to="/buy/fresh-vs-frozen-duck" className="text-primary underline underline-offset-4">
            fresh versus frozen
          </Link>
          ,{" "}
          <Link to="/buy/how-to-choose-duck" className="text-primary underline underline-offset-4">
            judging skin, fat cap and labels
          </Link>
          , and{" "}
          <Link
            to="/buy/what-cut-of-duck-to-buy"
            className="text-primary underline underline-offset-4"
          >
            which cut to buy for your dish
          </Link>
          .
        </p>

        <p className="mt-16 text-sm text-muted-foreground">
          Working out quantities?{" "}
          <Link
            to="/buy/how-much-duck-per-person"
            className="text-primary underline underline-offset-4"
          >
            How much duck per person
          </Link>{" "}
          and{" "}
          <Link
            to="/tools/whole-duck-serving-calculator"
            className="text-primary underline underline-offset-4"
          >
            the serving calculator
          </Link>{" "}
          turn a guest count into a shopping weight. Ordering frozen?{" "}
          <Link to="/learn/how-to-thaw-duck" className="text-primary underline underline-offset-4">
            Plan the thaw first
          </Link>
          . For equipment, see{" "}
          <Link to="/gear" className="text-primary underline underline-offset-4">
            the duck kitchen
          </Link>
          .
        </p>

        <HubOrientation
          heading={"Where to start when you buy duck"}
          paragraphs={[
            "If you have never bought duck before, the decision order is simpler than the label copy suggests: pick the cut that suits the dish, decide whether fresh or frozen fits your timeline, then judge the bird itself on skin and fat cap. Everything else on the packaging is secondary.",
            "Most disappointing duck is bought, not cooked, badly. A torn fat cap will never crisp evenly, a bird that arrives soft after a warm courier run is a food-safety question rather than a cooking one, and a whole duck bought for six people will feed four. The guides below take those one at a time, with the quantity maths handled by the serving calculator.",
            "Mail order is normal for duck in most of the country, and frozen is usually the safer order because it travels without a cold-chain gamble. Build the thaw into your plan before you check out — a whole bird needs a day or more in the fridge, not an afternoon.",
          ]}
        />
      </section>
    </>
  );
}
