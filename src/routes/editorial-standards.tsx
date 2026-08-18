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
    title: "Recipe verification",
    body: "Our recipes are built on established culinary technique and published food-safety guidance, and each page names that basis. The \"Kitchen verified\" label is reserved for recipes we have cooked as written, with the measured times, internal temperatures, photographs, test date, and revision recorded and shown on the page. We describe a recipe as tested only when that record exists.",
  },
  {
    title: "Calculators and tools",
    body: "Every tool runs in your browser and publishes the assumptions behind its numbers on the same page, including what it deliberately does not model. Tool outputs are planning estimates, never a substitute for a calibrated thermometer or for local food-safety guidance.",
  },
  {
    title: "Product recommendations",
    body: "We describe what a product does and why it helps with duck, working from published specifications, manufacturer and seller documentation, and duck-cooking technique. DeliciousDuck distinguishes desk research from firsthand testing: we label something \"tested\" or \"reviewed\" only when that experience actually occurred, and we publish no prices, ratings, or review counts.",
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
