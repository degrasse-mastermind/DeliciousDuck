import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/editorial-standards")({
  head: () =>
    pageMeta({
      title: "Editorial Standards | DeliciousDuck",
      description:
        "How DeliciousDuck writes, tests, sources, and corrects its duck recipes, guides, and product recommendations.",
      path: "/editorial-standards",
    }),
  component: StandardsPage,
});

const STANDARDS = [
  {
    title: "Recipes",
    body: "Recipes state temperatures, weights, and times explicitly. Where a step is a judgement call, we describe the sensory cue to look for rather than hiding behind vague timing.",
  },
  {
    title: "Recipe status: working recipes versus tested recipes",
    body: "Every recipe currently published on DeliciousDuck is an editorial working recipe. The method, timings, and temperatures follow established technique and published food-safety guidance, but none has yet completed independent test-kitchen validation, so each carries a visible notice saying so. A recipe only loses that notice — and only then may we call it tested — once it has been cooked and checked in our own kitchen, with the date recorded on the page. We will never describe an unvalidated recipe as tested, reader-approved, or foolproof.",
  },
  {
    title: "Calculators and tools",
    body: "Every tool runs in your browser and publishes the assumptions behind its numbers on the same page, including what it deliberately does not model. Tool outputs are planning estimates, never a substitute for a calibrated thermometer or for local food-safety guidance.",
  },
  {
    title: "Product recommendations",
    body: "We describe what a product does and why it helps with duck. We do not publish prices, ratings, or review counts, and we do not present untested items as tested. Where we have not hands-on tested something, the page says we have not.",
  },
  {
    title: "Food safety",
    body: "Safe-temperature and storage claims follow published authority guidance (USDA and FDA) rather than tradition. Where a culinary convention sits below an official minimum — as with medium-rare duck breast — we label it as a convention and give a well-done alternative for anyone at higher risk.",
  },
  {
    title: "Sourcing claims",
    body: "Statements about breeds, labels, and food safety are written to be checkable. Where guidance differs by country, we say so instead of picking one silently.",
  },
  {
    title: "Corrections",
    body: "When something is wrong, we fix the page and note the change rather than quietly editing it away. Safety corrections take priority over everything else in the queue.",
  },
];

function StandardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Editorial Standards"
        intro="The rules we apply to every page, so readers can judge our work rather than take it on trust."
        trail={[{ name: "Editorial Standards", to: "/editorial-standards" }]}
      />
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        <dl className="divide-y divide-border border-y border-border">
          {STANDARDS.map((s) => (
            <div key={s.title} className="py-6">
              <dt className="font-display text-xl text-foreground">{s.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-muted-foreground">
          Commercial relationships are covered separately in our{" "}
          <Link to="/affiliate-disclosure" className="text-primary underline underline-offset-4">
            affiliate disclosure
          </Link>
          .
        </p>
      </section>
    </>
  );
}
