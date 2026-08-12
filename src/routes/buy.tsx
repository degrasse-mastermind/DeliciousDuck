import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import {
  AffiliateCallout,
  AffiliateDisclosureNote,
} from "@/components/site/AffiliateCallout";
import { BUYING_GUIDE } from "@/data/products";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

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

export const Route = createFileRoute("/buy")({
  head: () => ({
    ...pageMeta({
      title: "Where to Buy Duck Online & How to Judge Quality | DeliciousDuck",
      description:
        "How to source duck: online butchers versus farm-direct producers, fresh versus frozen, breeds, labels, and what to inspect before you buy.",
      path: "/buy",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Buy", item: "/buy" },
        ]),
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
        title="Where to Buy Duck Online"
        intro="Duck is a special-order bird in most places. This section covers the routes to buying it well, what the labels mean, and how to check quality before you commit."
        trail={[{ name: "Buy", to: "/buy" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <AffiliateDisclosureNote />
        </div>

        <h2 className="mt-14 font-display text-3xl text-foreground">Your sourcing options</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {BUYING_GUIDE.map((item) => (
            <AffiliateCallout key={item.id} item={item} />
          ))}
        </div>

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
          turns a guest count into a shopping weight. For equipment, see{" "}
          <Link to="/gear" className="text-primary underline underline-offset-4">
            the duck kitchen
          </Link>
          .
        </p>
      </section>
    </>
  );
}
