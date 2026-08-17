import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { PILLARS } from "@/data/site";
import { breadcrumbSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    ...pageMeta({
      title: "About DeliciousDuck: Our Editorial Approach",
      description:
        "What DeliciousDuck is, how we structure duck content across cooking, learning, buying, gear, ingredients, and tools, and the standards we hold ourselves to.",
      path: "/about",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "About", item: "/about" },
        ]),
      ),
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  {
    title: "Specific over generic",
    body: "Every page answers one question well. If a recipe needs a temperature, we give a temperature — not a range wide enough to be useless.",
  },
  {
    title: "No invented credibility",
    body: "We do not publish testimonials, star ratings, review counts, or reader numbers we cannot substantiate. When a claim needs testing, we say it is untested.",
  },
  {
    title: "Recommendations you can audit",
    body: "Product write-ups explain what a tool does and why it matters for duck. Affiliate relationships, where they exist, are disclosed on the page.",
  },
  {
    title: "Built to be useful offline",
    body: "Our tools run in the browser and our guides are written to be printed, screenshotted, or read one-handed next to a hot pan.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A Reference Site for People Who Cook Duck"
        intro="DeliciousDuck exists because duck is treated as intimidating and expensive when it is neither — it simply follows different rules from chicken. Our job is to make those rules obvious."
        trail={[{ name: "About", to: "/about" }]}
      />

      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl text-foreground">How the site is organised</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <li key={pillar.key} className="border-t border-border pt-4">
              <Link
                to={pillar.to}
                className="font-display text-xl text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {pillar.label}
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.blurb}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-20 font-display text-3xl text-foreground">Editorial principles</h2>
        <dl className="mt-8 divide-y divide-border border-y border-border">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="py-6">
              <dt className="font-display text-xl text-foreground">{p.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 text-sm text-muted-foreground">
          Read our{" "}
          <Link to="/affiliate-disclosure" className="text-primary underline underline-offset-4">
            affiliate disclosure
          </Link>{" "}
          for how commercial links are handled, our{" "}
          <Link to="/editorial-standards" className="text-primary underline underline-offset-4">
            editorial standards
          </Link>{" "}
          for how pages are written and corrected, or{" "}
          <Link to="/contact" className="text-primary underline underline-offset-4">
            contact us
          </Link>{" "}
          with a question or correction.
        </p>
      </section>
    </>
  );
}
