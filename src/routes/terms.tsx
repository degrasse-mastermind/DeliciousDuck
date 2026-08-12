import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageMeta({
      title: "Terms of Use | DeliciousDuck",
      description:
        "The terms that apply to using DeliciousDuck, including recipe and food-safety guidance limitations.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        intro="Plain terms for using this site, its recipes, and its calculators."
        trail={[{ name: "Terms", to: "/terms" }]}
      />
      <section className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-base leading-relaxed text-muted-foreground lg:px-8 lg:py-24">
        <p>
          Content on DeliciousDuck is provided for general cooking information. Cooking times,
          temperatures, and calculator outputs are estimates: your equipment, your bird, and your
          kitchen will vary. Use a thermometer and follow local food-safety guidance.
        </p>
        <p>
          Text, photography, and tools on this site remain our property and may not be republished
          in bulk without permission. You are welcome to link to any page.
        </p>
        <p>
          Full terms, including liability and governing-law clauses, will be published here as the
          site expands.
        </p>
      </section>
    </>
  );
}
