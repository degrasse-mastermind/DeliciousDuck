import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ToolListItem } from "@/components/site/ToolListItem";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
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

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <NewsletterSignup />
      </section>
    </>
  );
}
