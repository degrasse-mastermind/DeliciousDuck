import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => ({
    ...pageMeta({
      title: "Affiliate Disclosure | DeliciousDuck",
      description:
        "How DeliciousDuck handles affiliate links, what we will and will not claim about products, and how commercial relationships affect our recommendations.",
      path: "/affiliate-disclosure",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Affiliate Disclosure", item: "/affiliate-disclosure" },
        ]),
      ),
    ],
  }),
  component: DisclosurePage,
});

function DisclosurePage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Affiliate Disclosure"
        intro="DeliciousDuck plans to fund its work partly through affiliate links. This page explains exactly what that means and the limits we place on it."
        trail={[{ name: "Affiliate Disclosure", to: "/affiliate-disclosure" }]}
      />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="space-y-8 text-base leading-relaxed text-muted-foreground">
          <div>
            <h2 className="font-display text-2xl text-foreground">What an affiliate link is</h2>
            <p className="mt-3">
              An affiliate link is a tracked link to a retailer. If you buy something after
              following one, the retailer may pay us a small commission. The price you pay is the
              same either way.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">Current status</h2>
            <p className="mt-3">
              We do not currently claim any specific merchant partnerships, and we do not publish
              prices, star ratings, or review counts anywhere on this site. Where a product is
              described, we explain what it does and why it matters for cooking duck. Nothing more
              is implied.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">What commissions never change</h2>
            <ul className="mt-3 space-y-2">
              <li className="border-l-2 border-accent pl-4">
                A product is never included because a commission rate is higher.
              </li>
              <li className="border-l-2 border-accent pl-4">
                We do not accept payment for a favourable write-up.
              </li>
              <li className="border-l-2 border-accent pl-4">
                Recipes, guides, and calculators stay free of commercial placement.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">Where disclosures appear</h2>
            <p className="mt-3">
              Any page containing commercial links carries a visible disclosure near those links,
              not only here. You will find them on{" "}
              <Link to="/buy" className="text-primary underline underline-offset-4">
                Buy
              </Link>{" "}
              and{" "}
              <Link to="/gear" className="text-primary underline underline-offset-4">
                Gear
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">Questions</h2>
            <p className="mt-3">
              If something on this site looks like an undisclosed commercial placement, tell us and
              we will correct it. Our broader standards are outlined on the{" "}
              <Link to="/about" className="text-primary underline underline-offset-4">
                about page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
