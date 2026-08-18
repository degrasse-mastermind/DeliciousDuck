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
        intro="DeliciousDuck funds part of its work through affiliate links. This page explains exactly what that means, which programmes are active, and the limits we place on them."
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
              Some links on this site are affiliate links. We take part in the Amazon Associates
              programme, and <strong className="text-foreground">as an Amazon Associate I earn
              from qualifying purchases.</strong> We also have an active affiliate relationship
              with US Wellness Meats, which we use for one thing only: their rendered duck fat.
              Other merchants we mention — Culver Duck, TastyDuck, Fossil Farms, Wild Fork and
              ThermoWorks among them — pay us nothing, and links to them are plain links.
            </p>
            <p className="mt-3">
              Every commercial module on this site labels each link&rsquo;s relationship
              individually, so a paid link is never dressed up as an unpaid one, and an unpaid
              merchant is never made to look like a partner. We do not publish prices, star
              ratings, or review counts anywhere on this site. Where a product category is
              described, we explain what it does and why it matters for cooking duck. Nothing more
              is implied.
            </p>
            <p className="mt-3">
              Amazon links are used for equipment categories only — pans, racks, thermometers,
              knives — never for duck itself, and never inside our newsletter or any downloadable
              file. Our US Wellness Meats link points at rendered duck fat, not duck meat: we
              review what a seller currently lists before we link to it, and we do not send you
              somewhere for a cut it does not stock.
            </p>

          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">
              Affiliate links, sponsorship, and independent coverage
            </h2>
            <p className="mt-3">
              These are three different things, and we keep them separate.
            </p>
            <ul className="mt-4 space-y-3">
              <li className="border-l-2 border-accent pl-4">
                <strong className="text-foreground">Affiliate links</strong> may earn us a commission
                after a qualifying action, such as a purchase made through the link. The retailer
                pays it; you pay the same price.
              </li>
              <li className="border-l-2 border-accent pl-4">
                <strong className="text-foreground">Sponsorship or paid placement</strong> means a
                brand paid for the placement itself. If we ever accept it, the material will be
                visibly labelled &ldquo;Sponsored&rdquo; at the top of the page and again beside any
                relevant call to action.
              </li>
              <li className="border-l-2 border-accent pl-4">
                <strong className="text-foreground">Independent editorial coverage</strong> is
                everything else: written on our own initiative, with no money attached to the
                decision to write it.
              </li>
            </ul>
            <p className="mt-4">
              Sponsorship cannot buy a ranking, a conclusion, positive coverage, or the omission of
              alternatives. And a merchant relationship of any kind is not evidence of hands-on
              testing or endorsement — where we have not tested something, we say so.
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
              we will correct it — write to us via the{" "}
              <Link to="/contact" className="text-primary underline underline-offset-4">
                contact page
              </Link>
              . Our broader standards are outlined on the{" "}
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
