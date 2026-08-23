import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HubOrientation } from "@/components/site/HubOrientation";
import { ToolListItem } from "@/components/site/ToolListItem";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { SketchInterlude } from "@/components/site/SketchFigure";
import { SKETCH } from "@/lib/sketch-art";
import { TOOLS } from "@/data/tools";
import { breadcrumbSchema, itemListSchema, ldScript, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    ...pageMeta({
      title: "Duck Cooking Tools & Calculators | DeliciousDuck",
      description:
        "Interactive duck cooking tools: cooking-time calculator, doneness guide, whole-duck serving calculator, and duck-fat substitution calculator.",
      path: "/tools",
    }),
    scripts: [
      ldScript(
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
        ]),
      ),
      ldScript(
        itemListSchema(
          "Duck cooking tools",
          TOOLS.map((t) => ({ name: t.name, url: t.to ?? "/tools" })),
        ),
      ),
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Duck Cooking Tools"
        intro="Fast answers for the practical questions: how long, how hot, how much, and what to use instead. Each tool runs in your browser — nothing to install, nothing to sign up for."
        trail={[{ name: "Tools", to: "/tools" }]}
      />

      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl text-foreground">All tools</h2>
        <ul className="mt-8 border-t border-border">
          {TOOLS.map((tool) => (
            <ToolListItem key={tool.slug} tool={tool} />
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <SketchInterlude
          art={SKETCH.thermometer}
          eyebrow="Why these exist"
          title="Numbers first, then the pan"
          position="right"
        >
          <p>
            Every calculator here starts from the same place our guides do: published temperature
            targets, weight-based timing, and the variables that actually move the clock. Start with
            a number, then cook to what you see.
          </p>
        </SketchInterlude>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-4 lg:px-8">
        <HubOrientation
          heading={"When to reach for a calculator"}
          paragraphs={[
            "These tools exist for the questions that stall a cook mid-plan: how long a bird of this weight needs, how much duck to buy for this many guests, what temperature counts as done for the result you want, and what to substitute when the duck fat runs out.",
            "Use them as a starting number, then cook to what the thermometer and the pan tell you. A planner cannot see that your oven runs cool or that your duck went in half-thawed, so treat the output as a schedule to check against rather than a promise.",
            "Nothing here needs an account and nothing leaves your browser. If a tool answers your question but you want the reasoning behind it, each one links to the guide that explains the underlying method.",
          ]}
        />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <NewsletterSignup />
      </section>
    </>
  );
}
