import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageMeta({
      title: "Privacy Policy | DeliciousDuck",
      description:
        "How DeliciousDuck handles personal data, newsletter email addresses, and analytics.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        intro="A short summary of what we collect and why. This policy will be expanded before any data collection goes live."
        trail={[{ name: "Privacy", to: "/privacy" }]}
      />
      <section className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-base leading-relaxed text-muted-foreground lg:px-8 lg:py-24">
        <p>
          We collect the minimum needed to run the site. If you subscribe to the Duck Cooking
          Starter Guide, we store your email address to send you that guide and occasional updates,
          and you can unsubscribe at any time.
        </p>
        <p>
          We do not sell personal data. Aggregate analytics may be used to understand which guides
          and tools are useful. Affiliate links may set cookies controlled by the retailer.
        </p>
        <p>
          Full policy text, data-processor details, and retention periods will be published here
          before newsletter delivery is switched on.
        </p>
      </section>
    </>
  );
}
