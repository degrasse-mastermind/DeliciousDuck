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

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "Accepting these terms",
    body: (
      <p>
        By using DeliciousDuck.com you agree to these terms. If you do not agree, please do not use
        the site. We may update these terms as the site grows; continued use after an update means
        you accept the revised version.
      </p>
    ),
  },
  {
    heading: "Information, not professional advice",
    body: (
      <p>
        Everything here is general cooking information for a home-kitchen audience. It is not
        medical, dietary, nutritional, veterinary, or professional food-safety advice, and it is not
        a substitute for the guidance of a qualified professional or of your local food-safety
        authority. If you are pregnant, immunocompromised, cooking for young children or older
        adults, or have a medical condition or allergy, follow your own authority&apos;s guidance
        over anything published here.
      </p>
    ),
  },
  {
    heading: "Cooking, temperatures, and your own judgement",
    body: (
      <>
        <p>
          Cooking times, temperature ranges, yields, and every calculator output on this site are
          estimates based on typical equipment and typical birds. Ovens run hot or cold, birds differ
          in shape and fat, and thermometers drift. Always judge doneness with a calibrated
          instant-read thermometer at the thickest part of the meat rather than by elapsed time, and
          treat our planning ranges as a starting point.
        </p>
        <p className="mt-3">
          You are responsible for safe food handling in your own kitchen: sourcing, thawing, chilling,
          cross-contamination, hot-holding, and storage. Recipes marked as editorial working recipes
          have not completed independent test-kitchen validation — see our{" "}
          <a href="/editorial-standards" className="text-primary underline underline-offset-4">
            editorial standards
          </a>
          . Undercooked poultry carries a real risk of foodborne illness.
        </p>
      </>
    ),
  },
  {
    heading: "Affiliate links",
    body: (
      <p>
        Some outbound links may earn us a commission at no extra cost to you. This never changes what
        we recommend or what we write. Purchases are contracts between you and the retailer, on their
        terms — we are not a party to them and cannot handle orders, shipping, returns, or warranty
        claims. Details are in our{" "}
        <a href="/affiliate-disclosure" className="text-primary underline underline-offset-4">
          affiliate disclosure
        </a>
        .
      </p>
    ),
  },
  {
    heading: "Intellectual property",
    body: (
      <p>
        Text, photography, illustrations, tool logic, and design on this site are ours and are
        protected by copyright. You may link to any page freely and quote short excerpts with clear
        attribution and a link. You may not republish pages in bulk, scrape the site to train models
        or build a derivative database, or reproduce our images without written permission.
      </p>
    ),
  },
  {
    heading: "Third-party sites",
    body: (
      <p>
        We link to retailers, producers, and reference sources we consider useful. We do not control
        those sites and are not responsible for their content, availability, pricing, or privacy
        practices.
      </p>
    ),
  },
  {
    heading: "No warranty and limitation of liability",
    body: (
      <p>
        The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of
        any kind, express or implied, including accuracy, fitness for a particular purpose, or
        uninterrupted availability. To the fullest extent permitted by law, DeliciousDuck and its
        contributors are not liable for any indirect, incidental, or consequential loss arising from
        your use of the site or reliance on its content. Nothing in these terms limits liability that
        cannot lawfully be limited, and nothing here affects your statutory consumer rights.
      </p>
    ),
  },
  {
    heading: "Corrections and contact",
    body: (
      <p>
        If you spot an error — especially anything safety-related — tell us at{" "}
        <a
          href="mailto:corrections@deliciousduck.com"
          className="text-primary underline underline-offset-4"
        >
          corrections@deliciousduck.com
        </a>{" "}
        and we will review and correct it.
      </p>
    ),
  },
];

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        intro="Plain terms for using this site, its recipes, and its calculators — including what our cooking estimates are and are not."
        trail={[{ name: "Terms", to: "/terms" }]}
      />
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        <p className="mb-10 text-sm uppercase tracking-widest text-muted-foreground">
          Last updated: August 2026 — informational, not attorney-reviewed
        </p>
        <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
          {SECTIONS.map((s) => (
            <div key={s.heading} className="space-y-3">
              <h2 className="font-display text-2xl text-foreground">{s.heading}</h2>
              {s.body}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
